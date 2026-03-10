/*!
 * IFC Viewer - Three.js + web-ifc (WASM)
 * Visor de modelos IFC para AGRDB
 * Carga archivos IFC directamente en el navegador usando WebAssembly
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===================================
// CONFIG
// ===================================

const WEB_IFC_VERSION = '0.0.57';
const WASM_CDN = `https://cdn.jsdelivr.net/npm/web-ifc@${WEB_IFC_VERSION}/`;

// ===================================
// IFC VIEWER CLASS
// ===================================

class IFCViewer {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.modelGroup = new THREE.Group();
        this.scene.add(this.modelGroup);
        this.ifcAPI = null;
        this.initialState = null;

        this._initRenderer();
        this._initCamera();
        this._initControls();
        this._initLights();
        this._initGrid();
        this._startRenderLoop();

        window.addEventListener('resize', () => this._onResize());
    }

    _initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x1a2e3f);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }

    _initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(30, 20, 30);
    }

    _initControls() {
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 0.5;
        this.controls.maxDistance = 5000;
    }

    _initLights() {
        // Ambient fill
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        // Main directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        this.scene.add(dirLight);

        // Fill light from opposite side
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-30, 60, -40);
        this.scene.add(fillLight);

        // Hemisphere for subtle sky/ground color
        const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x2a4255, 0.3);
        this.scene.add(hemiLight);
    }

    _initGrid() {
        this.grid = new THREE.GridHelper(100, 40, 0x2a4255, 0x2a4255);
        this.grid.material.opacity = 0.25;
        this.grid.material.transparent = true;
        this.scene.add(this.grid);
    }

    _onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    _startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    // ===================================
    // IFC LOADING
    // ===================================

    async loadIFC(url, onStatus, onProgress, cameraAngle) {
        // 1. Load web-ifc WASM engine
        onStatus?.('Cargando motor IFC (WASM)...');
        onProgress?.(5);

        const WebIFC = await this._loadWebIFC();

        this.ifcAPI = new WebIFC.IfcAPI();
        this.ifcAPI.SetWasmPath(WASM_CDN);
        await this.ifcAPI.Init();

        onProgress?.(20);

        // 2. Download IFC file
        onStatus?.('Descargando modelo...');
        const buffer = await this._fetchWithProgress(url, (pct) => {
            onProgress?.(20 + pct * 45); // 20% → 65%
        });

        // 3. Parse IFC geometry
        onStatus?.('Procesando geometría...');
        onProgress?.(68);

        const data = new Uint8Array(buffer);
        const modelID = this.ifcAPI.OpenModel(data);

        let meshCount = 0;
        this.ifcAPI.StreamAllMeshes(modelID, (mesh) => {
            const placedGeometries = mesh.geometries;
            for (let i = 0; i < placedGeometries.size(); i++) {
                const pg = placedGeometries.get(i);
                const threeMesh = this._extractGeometry(modelID, pg);
                if (threeMesh) {
                    this.modelGroup.add(threeMesh);
                    meshCount++;
                }
            }
        });

        this.ifcAPI.CloseModel(modelID);

        onStatus?.(`Modelo cargado · ${meshCount} elementos`);
        onProgress?.(92);

        // 4. Fit camera to model bounds with custom angle
        this._fitCamera(cameraAngle);
        onProgress?.(100);
    }

    async _loadWebIFC() {
        // Try dynamic import via jsdelivr ESM conversion
        try {
            const module = await import(
                /* webpackIgnore: true */
                `https://cdn.jsdelivr.net/npm/web-ifc@${WEB_IFC_VERSION}/+esm`
            );
            if (module && module.IfcAPI) return module;
        } catch (_) {
            // Fallback below
        }

        // Fallback: inject script tag (UMD build)
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${WASM_CDN}web-ifc-api-browser.js`;
            script.onload = () => {
                const mod = globalThis.WebIFC;
                if (mod && mod.IfcAPI) resolve(mod);
                else reject(new Error('web-ifc failed to load'));
            };
            script.onerror = () => reject(new Error('Failed to download web-ifc'));
            document.head.appendChild(script);
        });
    }

    async _fetchWithProgress(url, onProgress) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: No se pudo descargar el modelo`);
        }

        const contentLength = response.headers.get('Content-Length');

        // If no Content-Length or no streaming body, fallback
        if (!contentLength || !response.body) {
            onProgress?.(0.5);
            const buf = await response.arrayBuffer();
            onProgress?.(1);
            return buf;
        }

        const total = parseInt(contentLength, 10);
        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            onProgress?.(received / total);
        }

        // Combine chunks into single buffer
        const result = new Uint8Array(received);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return result.buffer;
    }

    // ===================================
    // GEOMETRY EXTRACTION
    // ===================================

    _extractGeometry(modelID, placedGeometry) {
        const geometry = this.ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);

        const vertexData = this.ifcAPI.GetVertexArray(
            geometry.GetVertexData(),
            geometry.GetVertexDataSize()
        );
        const indexData = this.ifcAPI.GetIndexArray(
            geometry.GetIndexData(),
            geometry.GetIndexDataSize()
        );

        if (vertexData.length === 0) {
            geometry.delete();
            return null;
        }

        // web-ifc vertex format: interleaved [x, y, z, nx, ny, nz] per vertex
        const vertexCount = vertexData.length / 6;
        const positions = new Float32Array(vertexCount * 3);
        const normals = new Float32Array(vertexCount * 3);

        for (let i = 0; i < vertexCount; i++) {
            const src = i * 6;
            const dst = i * 3;
            positions[dst]     = vertexData[src];
            positions[dst + 1] = vertexData[src + 1];
            positions[dst + 2] = vertexData[src + 2];
            normals[dst]       = vertexData[src + 3];
            normals[dst + 1]   = vertexData[src + 4];
            normals[dst + 2]   = vertexData[src + 5];
        }

        const bufGeom = new THREE.BufferGeometry();
        bufGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        bufGeom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        bufGeom.setIndex(new THREE.BufferAttribute(new Uint32Array(indexData), 1));

        // Material from IFC color data
        const color = placedGeometry.color;
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(color.x, color.y, color.z),
            opacity: color.w,
            transparent: color.w < 1,
            side: THREE.DoubleSide,
            specular: 0x222222,
            shininess: 25,
        });

        const mesh = new THREE.Mesh(bufGeom, material);

        // Apply IFC placement transformation (4x4 matrix, column-major)
        const mat = new THREE.Matrix4().fromArray(placedGeometry.flatTransformation);
        mesh.applyMatrix4(mat);

        // Free WASM memory
        geometry.delete();

        return mesh;
    }

    // ===================================
    // CAMERA
    // ===================================

    _fitCamera(cameraAngle) {
        const box = new THREE.Box3().setFromObject(this.modelGroup);
        if (box.isEmpty()) return;

        // Center model at origin so it always appears in the middle
        const center = box.getCenter(new THREE.Vector3());
        this.modelGroup.position.sub(center);

        // Recalculate bounds after centering
        box.setFromObject(this.modelGroup);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const fov = this.camera.fov * (Math.PI / 180);
        let distance = maxDim / (2 * Math.tan(fov / 2));
        distance *= 1.5;

        // Camera angle: custom per model or default isometric
        const cx = cameraAngle?.x ?? 0.7;
        const cy = cameraAngle?.y ?? 0.5;
        const cz = cameraAngle?.z ?? 0.7;

        this.camera.position.set(
            distance * cx,
            distance * cy,
            distance * cz
        );

        this.camera.near = maxDim * 0.001;
        this.camera.far = maxDim * 100;
        this.camera.updateProjectionMatrix();

        this.controls.target.set(0, 0, 0);
        this.controls.update();

        // Scale grid to model
        const gridScale = Math.max(maxDim * 2 / 100, 1);
        this.grid.scale.set(gridScale, 1, gridScale);
        this.grid.position.y = box.min.y;

        // Save initial state for reset
        this.initialState = {
            position: this.camera.position.clone(),
            target: new THREE.Vector3(0, 0, 0),
        };
    }

    // ===================================
    // TOOLBAR ACTIONS
    // ===================================

    resetView() {
        if (!this.initialState) return;
        this.camera.position.copy(this.initialState.position);
        this.controls.target.copy(this.initialState.target);
    }

    toggleWireframe() {
        let isWireframe = false;
        this.modelGroup.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = !child.material.wireframe;
                isWireframe = child.material.wireframe;
            }
        });
        return isWireframe;
    }

    toggleGrid() {
        this.grid.visible = !this.grid.visible;
        return this.grid.visible;
    }
}

// ===================================
// INIT
// ===================================

async function init() {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.length > 1
        ? decodeURIComponent(window.location.hash.slice(1))
        : null;

    // Embed mode: no toolbar, auto-rotate, no user interaction
    const isEmbed = params.get('embed') === 'true';
    if (isEmbed) {
        document.body.classList.add('embed-mode');
    }

    // Model URL: from hash (preferred) or ?model= query param
    const modelUrl = hash || params.get('model');

    // UI elements
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const progressBar = document.getElementById('progress-bar');
    const errorOverlay = document.getElementById('error-overlay');
    const errorText = document.getElementById('error-text');
    const modelNameEl = document.getElementById('model-name');
    const controlsHint = document.getElementById('controls-hint');

    if (!modelUrl) {
        errorOverlay.style.display = 'flex';
        errorText.textContent = 'No se especificó ningún modelo. Formato: viewer.html#Models/archivo.ifc';
        loadingOverlay.classList.add('hidden');
        return;
    }

    // Display model name
    const customName = params.get('name');
    const fileName = decodeURIComponent(modelUrl.split('/').pop().replace(/\.ifc$/i, ''));
    const displayName = customName || fileName;
    modelNameEl.textContent = displayName;
    document.title = `${displayName} - Visor 3D AGRDB`;

    // Read custom camera angle from URL params
    const cameraAngle = {
        x: parseFloat(params.get('cx')) || 0.7,
        y: parseFloat(params.get('cy')) || 0.5,
        z: parseFloat(params.get('cz')) || 0.7,
    };

    // Create viewer
    const canvas = document.getElementById('viewer-canvas');
    const viewer = new IFCViewer(canvas);

    // In embed mode: disable user interaction, enable auto-rotate
    if (isEmbed) {
        viewer.controls.enabled = false;
        viewer.grid.visible = false;
    }

    try {
        await viewer.loadIFC(
            modelUrl,
            (status) => { loadingText.textContent = status; },
            (pct) => { progressBar.style.width = `${Math.round(pct)}%`; },
            cameraAngle
        );

        // Hide loading overlay
        setTimeout(() => loadingOverlay.classList.add('hidden'), 500);

        // Auto-hide controls hint
        if (!isEmbed) {
            setTimeout(() => controlsHint.classList.add('hidden'), 5000);
        }

        // Embed mode: auto-rotate the model slowly
        if (isEmbed) {
            const autoRotate = () => {
                requestAnimationFrame(autoRotate);
                viewer.modelGroup.rotation.y += 0.003;
            };
            autoRotate();
        }

    } catch (err) {
        console.error('Error cargando modelo IFC:', err);
        errorOverlay.style.display = 'flex';
        errorText.textContent = err.message || 'Error desconocido al cargar el modelo IFC.';
        loadingOverlay.classList.add('hidden');
        return;
    }

    // Toolbar bindings (only in full mode)
    if (!isEmbed) {
        document.getElementById('btn-reset').addEventListener('click', () => {
            viewer.resetView();
        });

        document.getElementById('btn-wireframe').addEventListener('click', (e) => {
            const active = viewer.toggleWireframe();
            e.currentTarget.classList.toggle('active', active);
        });

        document.getElementById('btn-grid').addEventListener('click', (e) => {
            const visible = viewer.toggleGrid();
            e.currentTarget.classList.toggle('active', !visible);
        });
    }
}

init();
