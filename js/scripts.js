/*!
 * AGR Digital Building - Scripts
 * Portfolio BIM profesional
 */

window.addEventListener('DOMContentLoaded', event => {

    // ===================================
    // NAVBAR FUNCTIONALITY
    // ===================================
    
    const navbarShrink = () => {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) return;
        
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink');
        } else {
            navbarCollapsible.classList.add('navbar-shrink');
        }
    };

    navbarShrink();
    document.addEventListener('scroll', navbarShrink);

    // Bootstrap ScrollSpy
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    }

    // Collapse responsive navbar
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = document.querySelectorAll('#navbarResponsive .nav-link');
    
    responsiveNavItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // ===================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ===================================
    
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Opcional: dejar de observar después de animar
                    // observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => observer.observe(el));
    };

    // Auto-agregar clases de animación a elementos
    const setupAnimations = () => {
        // Servicios
        document.querySelectorAll('#services .col-md-4').forEach((el, i) => {
            el.classList.add('animate-on-scroll', 'fade-up');
            el.classList.add(`delay-${(i + 1) * 100}`);
        });

        // Formulario de contacto
        const contactForm = document.querySelector('#contactForm');
        if (contactForm) {
            contactForm.classList.add('animate-on-scroll', 'fade-up');
        }

        // Section headings
        document.querySelectorAll('.section-heading').forEach(el => {
            el.classList.add('animate-on-scroll', 'fade-up');
        });

        document.querySelectorAll('.section-subheading').forEach(el => {
            el.classList.add('animate-on-scroll', 'fade-up', 'delay-100');
        });
    };

    // ===================================
    // SMOOTH SCROLL PARA LINKS INTERNOS
    // ===================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#!' || targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===================================
    // FORMULARIO DE CONTACTO CON FORMSPREE
    // ===================================
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {

        // --- Validación en tiempo real ---
        const validators = {
            name: (val) => val.trim().length >= 2 ? '' : 'Ingresa tu nombre (mínimo 2 caracteres)',
            email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? '' : 'Ingresa un correo electrónico válido',
            subject: () => '', // Opcional, siempre válido
            message: (val) => val.trim().length >= 10 ? '' : 'Escribe al menos 10 caracteres'
        };

        const fields = contactForm.querySelectorAll('.contact-field');
        fields.forEach(field => {
            const input = field.querySelector('.form-control');
            if (!input) return;

            // Validar al perder foco
            input.addEventListener('blur', () => validateField(field, input));
            // Limpiar error al escribir
            input.addEventListener('input', () => {
                if (field.classList.contains('is-invalid')) {
                    validateField(field, input);
                }
            });
        });

        function validateField(field, input) {
            const name = input.id;
            const validate = validators[name];
            if (!validate) return true;

            const error = validate(input.value);
            const errorEl = field.querySelector('.contact-field-error');
            
            field.classList.remove('is-valid', 'is-invalid');
            
            if (error) {
                field.classList.add('is-invalid');
                if (!errorEl) {
                    const div = document.createElement('div');
                    div.className = 'contact-field-error';
                    div.textContent = error;
                    field.appendChild(div);
                } else {
                    errorEl.textContent = error;
                }
                return false;
            } else if (input.value.trim().length > 0) {
                field.classList.add('is-valid');
                if (errorEl) errorEl.remove();
                return true;
            } else {
                if (errorEl) errorEl.remove();
                return !input.required;
            }
        }

        function validateAllFields() {
            let allValid = true;
            fields.forEach(field => {
                const input = field.querySelector('.form-control');
                if (input && !validateField(field, input)) {
                    allValid = false;
                }
            });
            return allValid;
        }

        // --- Envío AJAX con Formspree ---
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!validateAllFields()) {
                // Hacer scroll al primer campo con error
                const firstError = contactForm.querySelector('.is-invalid .form-control');
                if (firstError) firstError.focus();
                return;
            }

            const submitBtn = document.getElementById('contactSubmitBtn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            const btnSuccess = submitBtn.querySelector('.btn-success-msg');

            // Estado de carga
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            submitBtn.disabled = true;

            // Actualizar _subject con el asunto del usuario (si lo escribió)
            const userSubject = document.getElementById('subject').value.trim();
            if (userSubject) {
                this.querySelector('[name="_subject"]').value = userSubject;
            }

            const formData = new FormData(this);

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    // Éxito: mostrar overlay
                    btnLoading.style.display = 'none';
                    btnSuccess.style.display = 'inline';
                    
                    setTimeout(() => {
                        document.getElementById('contactSuccess').style.display = 'flex';
                    }, 600);
                    
                    showNotification('¡Mensaje enviado correctamente!', 'success');
                } else {
                    throw new Error('Error al enviar');
                }
            })
            .catch(() => {
                btnLoading.style.display = 'none';
                btnText.style.display = 'inline';
                submitBtn.disabled = false;
                showNotification('Hubo un error al enviar. Intenta de nuevo.', 'error');
            });
        });
    }

    // Reset del formulario de contacto
    window.resetContactForm = function() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.reset();
            form.querySelectorAll('.contact-field').forEach(f => {
                f.classList.remove('is-valid', 'is-invalid');
                const errEl = f.querySelector('.contact-field-error');
                if (errEl) errEl.remove();
            });
            const submitBtn = document.getElementById('contactSubmitBtn');
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loading').style.display = 'none';
            submitBtn.querySelector('.btn-success-msg').style.display = 'none';
            submitBtn.disabled = false;
        }
        document.getElementById('contactSuccess').style.display = 'none';
    };

    // ===================================
    // SISTEMA DE NOTIFICACIONES
    // ===================================
    
    window.showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #198754, #20c997)' : 'linear-gradient(135deg, #00d4ff, #0099cc)'};
            color: ${type === 'success' ? 'white' : '#1a2e3f'};
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            animation: fadeInUp 0.3s ease-out;
            font-family: 'Montserrat', sans-serif;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeInUp 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    };

    // ===================================
    // LAZY LOADING PARA IFRAMES
    // ===================================
    
    const lazyLoadIframes = () => {
        // 1. IntersectionObserver para iframes fuera del carrusel
        const standaloneIframes = document.querySelectorAll('iframe[data-src]:not(#portfolioCarousel iframe)');
        
        if (standaloneIframes.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const iframe = entry.target;
                        iframe.src = iframe.dataset.src;
                        iframe.removeAttribute('data-src');
                        observer.unobserve(iframe);
                    }
                });
            }, { rootMargin: '200px' });

            standaloneIframes.forEach(iframe => observer.observe(iframe));
        }

        // 2. Carga inteligente del carrusel de portafolio
        const carousel = document.getElementById('portfolioCarousel');
        if (!carousel) return;

        const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carousel);
        const totalSlides = carousel.querySelectorAll('.carousel-item').length;

        // Detecta si un slide tiene iframes pesados (modelos 3D / dashboards)
        const isHeavySlide = (slideIndex) => {
            const slides = carousel.querySelectorAll('.carousel-item');
            if (!slides[slideIndex]) return false;
            return slides[slideIndex].querySelectorAll('iframe, iframe[data-src]').length > 0;
        };

        // Carga los iframes de un slide y devuelve una Promise que se resuelve
        // cuando todos terminan de cargar (o tras un timeout de seguridad)
        const loadSlideIframes = (slideIndex) => {
            const slides = carousel.querySelectorAll('.carousel-item');
            if (!slides[slideIndex]) return Promise.resolve();
            
            const pendingIframes = slides[slideIndex].querySelectorAll('iframe[data-src]');
            if (pendingIframes.length === 0) return Promise.resolve();

            const loadPromises = [];

            pendingIframes.forEach(iframe => {
                const promise = new Promise(resolve => {
                    iframe.addEventListener('load', () => {
                        const container = iframe.closest('.carousel-card-iframe, .model-card');
                        if (container) container.classList.add('iframe-loaded');
                        resolve();
                    }, { once: true });

                    // Timeout de seguridad: si no carga en 12s, seguimos
                    setTimeout(resolve, 12000);
                });

                iframe.src = iframe.dataset.src;
                iframe.removeAttribute('data-src');
                loadPromises.push(promise);
            });

            return Promise.all(loadPromises);
        };

        // Precarga el slide siguiente (sin mostrarlo)
        const prefetchNextSlide = (currentIndex) => {
            const nextIndex = (currentIndex + 1) % totalSlides;
            loadSlideIframes(nextIndex);
        };

        // Al llegar a un slide pesado: pausar auto-play, esperar carga, reanudar
        carousel.addEventListener('slid.bs.carousel', (event) => {
            const currentIndex = event.to;

            if (isHeavySlide(currentIndex)) {
                bsCarousel.pause();

                loadSlideIframes(currentIndex).then(() => {
                    // Dar 3s extra para que el usuario vea el modelo cargado
                    setTimeout(() => {
                        prefetchNextSlide(currentIndex);
                        bsCarousel.cycle();
                    }, 3000);
                });
            } else {
                // Slide ligero: precargar el siguiente en segundo plano
                prefetchNextSlide(currentIndex);
            }
        });

        // Precargar iframes al navegar manualmente (flechas / dots)
        carousel.addEventListener('slide.bs.carousel', (event) => {
            loadSlideIframes(event.to);
        });

        // Cargar iframes del slide activo cuando la sección entra en viewport
        const portfolioSection = document.getElementById('portfolio');
        if (portfolioSection) {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const activeSlide = carousel.querySelector('.carousel-item.active');
                        const activeIndex = [...carousel.querySelectorAll('.carousel-item')].indexOf(activeSlide);
                        loadSlideIframes(activeIndex);
                        // Precargar el siguiente desde el inicio
                        prefetchNextSlide(activeIndex);
                        sectionObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '300px' });
            sectionObserver.observe(portfolioSection);
        }
    };

    // ===================================
    // EFECTO PARALLAX SUTIL EN HEADER
    // ===================================
    
    const masthead = document.querySelector('.masthead');
    if (masthead) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                masthead.style.backgroundPositionY = `${scrolled * 0.5}px`;
            }
        }, { passive: true });
    }

    // ===================================
    // PORTFOLIO CARRUSEL - Indicadores
    // ===================================
    
    const initPortfolioCarousel = () => {
        const carousel = document.getElementById('portfolioCarousel');
        const dots = document.querySelectorAll('.carousel-indicators-custom .dot');
        
        if (!carousel || dots.length === 0) return;
        
        // Escuchar cambio de slide
        carousel.addEventListener('slid.bs.carousel', (event) => {
            const currentDots = document.querySelectorAll('.carousel-indicators-custom .dot');
            currentDots.forEach(dot => dot.classList.remove('active'));
            if (currentDots[event.to]) {
                currentDots[event.to].classList.add('active');
            }
        });
        
        // Click en los indicadores
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carousel);
                bsCarousel.to(index);
            });
        });
    };

    // ===================================
    // PORTFOLIO CARRUSEL - Móvil (1 item por slide)
    // ===================================
    
    const setupMobileCarousel = () => {
        const carousel = document.getElementById('portfolioCarousel');
        const carouselInner = carousel?.querySelector('.carousel-inner');
        const dotsContainer = document.querySelector('.carousel-indicators-custom');
        
        if (!carousel || !carouselInner || !dotsContainer) return;
        
        const isMobile = window.innerWidth < 768;
        
        // Guardar estructura original si no existe
        if (!carousel.dataset.originalHtml) {
            carousel.dataset.originalHtml = carouselInner.innerHTML;
            carousel.dataset.originalDots = dotsContainer.innerHTML;
        }
        
        if (isMobile) {
            // Restaurar HTML original primero
            carouselInner.innerHTML = carousel.dataset.originalHtml;
            
            // Obtener todas las tarjetas
            const allCards = [];
            const slides = carouselInner.querySelectorAll('.carousel-item');
            
            slides.forEach(slide => {
                const cards = slide.querySelectorAll('.col-md-6');
                cards.forEach(card => {
                    allCards.push(card.innerHTML);
                });
            });
            
            // Crear nuevos slides individuales
            carouselInner.innerHTML = '';
            allCards.forEach((cardHtml, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'carousel-item' + (index === 0 ? ' active' : '');
                slideDiv.innerHTML = `
                    <div class="row justify-content-center">
                        <div class="col-md-6 px-3">
                            ${cardHtml}
                        </div>
                    </div>
                `;
                carouselInner.appendChild(slideDiv);
            });
            
            // Actualizar indicadores
            dotsContainer.innerHTML = '';
            allCards.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = 'dot' + (index === 0 ? ' active' : '');
                dot.setAttribute('data-bs-target', '#portfolioCarousel');
                dot.setAttribute('data-bs-slide-to', index);
                dot.addEventListener('click', () => {
                    const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carousel);
                    bsCarousel.to(index);
                });
                dotsContainer.appendChild(dot);
            });
        } else {
            // Restaurar estructura original en desktop
            if (carousel.dataset.originalHtml) {
                carouselInner.innerHTML = carousel.dataset.originalHtml;
                dotsContainer.innerHTML = carousel.dataset.originalDots;
                
                // Reinicializar click en dots
                const dots = dotsContainer.querySelectorAll('.dot');
                dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carousel);
                        bsCarousel.to(index);
                    });
                });
            }
        }
    };

    // Ejecutar al cargar y al cambiar tamaño de ventana
    setupMobileCarousel();
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setupMobileCarousel, 250);
    });

    // ===================================
    // INICIALIZACIÓN
    // ===================================
    
    setupAnimations();
    animateOnScroll();
    lazyLoadIframes();
    initPortfolioCarousel();

    // Agregar clase loaded al body cuando todo esté cargado
    document.body.classList.add('loaded');

    console.log('AGR Digital Building loaded');
});
