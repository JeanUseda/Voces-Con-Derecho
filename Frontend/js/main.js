// ============================================
// NAVBAR - MENÚ HAMBURGUESA Y SCROLL
// ============================================

const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Toggle menú hamburguesa
hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('open');
    });
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
        if (!e.target.closest('.navbar-container')) {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('open');
        }
    }
});

// Navbar con efecto scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
});

// ============================================
// ANIMACIÓN DE CONTADORES (Hero Stats)
// ============================================

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                let current = 0;
                const increment = Math.ceil(target / 60);
                const duration = 2000;
                const stepTime = Math.floor(duration / 60);
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        entry.target.textContent = target.toLocaleString();
                        clearInterval(timer);
                    } else {
                        entry.target.textContent = current.toLocaleString();
                    }
                }, stepTime);
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// ============================================
// ANIMACIÓN DE ELEMENTOS AL HACER SCROLL
// ============================================

function initScrollAnimations() {
    const elements = document.querySelectorAll('.feature-card, .recurso-card, .valor-card, .section-content');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    
    elements.forEach(el => {
        el.classList.add('fade-in-section');
        observer.observe(el);
    });
}

// ============================================
// EFECTO RIPPLE EN BOTONES
// ============================================

function initRippleEffect() {
    const buttons = document.querySelectorAll('.primary-button, .hero-button, .btn-start, .secondary-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: ripple-anim 0.6s ease-out forwards;
                pointer-events: none;
            `;
            
            // Asegurar que el botón tiene position relative
            if (getComputedStyle(this).position === 'static') {
                this.style.position = 'relative';
            }
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 700);
        });
    });
}

// ============================================
// PARALLAX SUAVE EN HERO
// ============================================

function initParallax() {
    const hero = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-image');
    
    if (!hero || !heroImage) return;
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        if (scrollPosition < heroHeight) {
            const parallaxSpeed = 0.3;
            const yOffset = scrollPosition * parallaxSpeed;
            heroImage.style.transform = `translateY(${yOffset}px)`;
        }
    });
}

// ============================================
// SCROLL SUAVE PARA ENLACES INTERNOS
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 90;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    animateCounters();
    initScrollAnimations();
    initRippleEffect();
    initParallax();
    initSmoothScroll();
});

// ============================================
// ACTUALIZAR ENLACE ACTIVO EN EL MENÚ
// ============================================

document.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.pageYOffset >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});