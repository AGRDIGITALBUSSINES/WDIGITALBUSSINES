/*!
 * AGRDB Modern Scripts
 * Basado en Start Bootstrap Agency con mejoras modernas tipo Lovable
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

        // Portfolio items
        document.querySelectorAll('.portfolio-item').forEach((el, i) => {
            el.classList.add('animate-on-scroll', 'scale-in');
            el.classList.add(`delay-${(i % 3 + 1) * 100}`);
        });

        // Videos
        document.querySelectorAll('#video .team-menber').forEach((el, i) => {
            el.classList.add('animate-on-scroll', 'fade-up');
            el.classList.add(`delay-${(i + 1) * 100}`);
        });

        // Modelos 3D
        document.querySelectorAll('#models .team-menber').forEach((el, i) => {
            el.classList.add('animate-on-scroll', 'fade-up');
            el.classList.add(`delay-${(i + 1) * 100}`);
        });

        // Sección About
        const teamMember = document.querySelector('.team-member');
        if (teamMember) {
            teamMember.classList.add('animate-on-scroll', 'scale-in');
        }

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
        contactForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Mostrar estado de carga
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
            submitBtn.disabled = true;
            
            // El formulario se enviará normalmente a Formspree
            // Restaurar botón después de un tiempo (por si hay error)
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 5000);
        });
    }

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
            background: ${type === 'success' ? 'linear-gradient(135deg, #198754, #20c997)' : 'linear-gradient(135deg, #ffc800, #ff9500)'};
            color: ${type === 'success' ? 'white' : 'black'};
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

        // 2. Carga diferida por evento de carrusel (para modelos 3D e iframes pesados)
        const carousel = document.getElementById('portfolioCarousel');
        if (!carousel) return;

        const loadSlideIframes = (slideIndex) => {
            const slides = carousel.querySelectorAll('.carousel-item');
            if (!slides[slideIndex]) return;
            
            const iframes = slides[slideIndex].querySelectorAll('iframe[data-src]');
            iframes.forEach(iframe => {
                iframe.src = iframe.dataset.src;
                iframe.removeAttribute('data-src');
                // Ocultar spinner cuando el iframe termine de cargar
                iframe.addEventListener('load', () => {
                    const container = iframe.closest('.carousel-card-iframe, .model-card');
                    if (container) container.classList.add('iframe-loaded');
                }, { once: true });
            });
        };

        // Cargar iframes del slide activo al inicio (si la sección es visible)
        const portfolioSection = document.getElementById('portfolio');
        if (portfolioSection) {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const activeSlide = carousel.querySelector('.carousel-item.active');
                        const activeIndex = [...carousel.querySelectorAll('.carousel-item')].indexOf(activeSlide);
                        loadSlideIframes(activeIndex);
                        sectionObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '300px' });
            sectionObserver.observe(portfolioSection);
        }

        // Cargar iframes cuando se navega a un slide
        carousel.addEventListener('slide.bs.carousel', (event) => {
            loadSlideIframes(event.to);
        });
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
    // CONTADOR ANIMADO (para estadísticas futuras)
    // ===================================
    
    window.animateCounter = (element, target, duration = 2000) => {
        let start = 0;
        const increment = target / (duration / 16);
        
        const updateCounter = () => {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    };

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

    console.log('🚀 AGRDB Modern Scripts loaded successfully!');
});
