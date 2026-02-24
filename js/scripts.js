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
        const iframes = document.querySelectorAll('iframe[data-src]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    iframe.src = iframe.dataset.src;
                    iframe.removeAttribute('data-src');
                    observer.unobserve(iframe);
                }
            });
        }, { rootMargin: '100px' });

        iframes.forEach(iframe => observer.observe(iframe));
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
            dots.forEach(dot => dot.classList.remove('active'));
            dots[event.to].classList.add('active');
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
