'use strict';

// ===== PRÉFÉRENCES UTILISATEUR =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// ===== MOBILE NAVIGATION =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

const openMenu = () => {
    navLinks.classList.add('active');
    navToggle.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
};

const closeMenu = () => {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
};

navToggle.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) {
        closeMenu();
    } else {
        openMenu();
    }
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
});

// ===== BARRE DE PROGRESSION DE SCROLL =====
const progressBar = document.querySelector('.scroll-progress');
let scrollTicking = false;

const updateProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? doc.scrollTop / max : 0})`;
    scrollTicking = false;
};

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(updateProgress);
        scrollTicking = true;
    }
}, { passive: true });

// ===== SMOOTH SCROLL (respecte reduced-motion) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start'
        });
    });
});

// ===== ANIMATIONS AU SCROLL (stagger par groupe, délai plafonné) =====
const ioOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
};

const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
        }
    });
}, ioOptions);

const revealElements = document.querySelectorAll(
    '.section-title, .about-text, .value-card, .service-card, .project-card, .why-content, .process-step, .contact-content, .process-note'
);

revealElements.forEach(el => {
    if (reduceMotion) {
        el.classList.add('visible');
        return;
    }

    el.classList.add('fade-in-up');

    // Petit stagger par rangée (max 0.27s au lieu de 0.1s x N éléments)
    let delay = 0;
    if (el.parentElement) {
        const siblings = Array.from(el.parentElement.children);
        const idx = siblings.indexOf(el);
        delay = Math.min(idx, 3) * 0.09;
    }
    el.style.transitionDelay = `${delay}s`;

    io.observe(el);
});

// ===== NAV : FOND + RÉDUCTION SUR SCROLL, LIEN ACTIF =====
const nav = document.querySelector('.nav');
const sections = document.querySelectorAll('section[id]');
let navTicking = false;

const updateNav = () => {
    const scrollY = window.scrollY;

    nav.classList.toggle('scrolled', scrollY > 40);

    const offset = scrollY + 120;
    let currentId = '';
    sections.forEach(section => {
        if (offset >= section.offsetTop) {
            currentId = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
        const isActive = link.getAttribute('href') === `#${currentId}`;
        link.classList.toggle('active', isActive);
    });

    navTicking = false;
};

window.addEventListener('scroll', () => {
    if (!navTicking) {
        requestAnimationFrame(updateNav);
        navTicking = true;
    }
}, { passive: true });

updateNav();

// ===== PARALLAX DES ORBES (souris uniquement + throttlé) =====
const glowOrbs = document.querySelectorAll('.glow-orb');

if (finePointer && !reduceMotion && glowOrbs.length > 0) {
    let parallaxTicking = false;

    window.addEventListener('mousemove', (e) => {
        if (parallaxTicking) return;

        requestAnimationFrame(() => {
            const x = e.clientX / window.innerWidth - 0.5;
            const y = e.clientY / window.innerHeight - 0.5;

            glowOrbs.forEach((orb, index) => {
                const speed = (index + 1) * 18;
                orb.style.translate = `${x * speed}px ${y * speed}px`;
            });

            parallaxTicking = false;
        });

        parallaxTicking = true;
    }, { passive: true });
}

// ===== SPOTLIGHT SUR LES CARTES (suivi de souris) =====
const spotlightCards = document.querySelectorAll('.value-card, .service-card, .project-card, .process-step');

if (finePointer && !reduceMotion) {
    spotlightCards.forEach(card => {
        let spotlightTicking = false;

        card.addEventListener('mousemove', (e) => {
            if (spotlightTicking) return;

            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                card.style.setProperty('--my', `${e.clientY - rect.top}px`);
                spotlightTicking = false;
            });

            spotlightTicking = true;
        }, { passive: true });
    });
}

// ===== TILT 3D DU MOCKUP HERO (souris uniquement) =====
const heroMockup = document.querySelector('.hero-mockup');
const heroVisual = document.querySelector('.hero-visual');

if (heroMockup && heroVisual && finePointer && !reduceMotion) {
    let tiltTicking = false;

    heroVisual.addEventListener('mousemove', (e) => {
        if (tiltTicking) return;

        requestAnimationFrame(() => {
            const rect = heroVisual.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            heroMockup.style.transform = `rotateY(${x * 9}deg) rotateX(${y * -9}deg)`;
            tiltTicking = false;
        });

        tiltTicking = true;
    }, { passive: true });

    heroVisual.addEventListener('mouseleave', () => {
        heroMockup.style.transform = '';
    });
}
