document.addEventListener("DOMContentLoaded", () => {

    /* ============================
       NAVBAR: efecto al hacer scroll
    ============================ */

    const navbar = document.getElementById("navbar");

    const updateNavbar = () => {
        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    };

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });


    /* ============================
       NAVBAR: menú móvil
    ============================ */

    const navToggle = document.getElementById("navToggle");
    const navMenu = document.querySelector(".nav-menu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        navMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }


    /* ============================
       APARICIÓN AL HACER SCROLL
    ============================ */

    const revealTargets = document.querySelectorAll(".reveal-on-scroll");

    if ("IntersectionObserver" in window && revealTargets.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealTargets.forEach((el) => revealObserver.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add("is-visible"));
    }


    /* ============================
       CONTADOR ANIMADO (ESTADÍSTICAS)
    ============================ */

    const counters = document.querySelectorAll(".stat-number");

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || "";
        const duration = 1600;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(eased * target);

            el.textContent = value.toLocaleString("es-ES") + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString("es-ES") + suffix;
            }
        };

        requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window && counters.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach((el) => counterObserver.observe(el));
    } else {
        counters.forEach((el) => animateCounter(el));
    }


    /* ============================
       CARRUSEL DE TESTIMONIOS
    ============================ */

    const track = document.getElementById("testimonialTrack");

    if (track) {
        const slides = Array.from(track.children);
        const prevBtn = document.getElementById("testimonialPrev");
        const nextBtn = document.getElementById("testimonialNext");
        const dotsWrap = document.getElementById("testimonialDots");

        let current = 0;

        slides.forEach((_, i) => {
            const dot = document.createElement("button");
            dot.setAttribute("aria-label", "Ir al testimonio " + (i + 1));
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => goTo(i));
            dotsWrap.appendChild(dot);
        });

        const dots = Array.from(dotsWrap.children);

        function goTo(index) {
            current = (index + slides.length) % slides.length;
            track.style.transform = `translateX(-${current * 100}%)`;

            dots.forEach((d, i) => d.classList.toggle("active", i === current));
        }

        if (prevBtn) prevBtn.addEventListener("click", () => goTo(current - 1));
        if (nextBtn) nextBtn.addEventListener("click", () => goTo(current + 1));

        let autoplay = setInterval(() => goTo(current + 1), 6000);

        const slider = track.closest(".testimonial-slider");
        if (slider) {
            slider.addEventListener("mouseenter", () => clearInterval(autoplay));
            slider.addEventListener("mouseleave", () => {
                autoplay = setInterval(() => goTo(current + 1), 6000);
            });
        }
    }

});