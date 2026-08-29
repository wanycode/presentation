'use strict';

// ===== PRÉFÉRENCES =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== OBSERVER DE RÉVÉLATION AU SCROLL =====
(function initReveal() {
    const els = document.querySelectorAll('.reveal');

    if (reduceMotion) {
        els.forEach(el => el.classList.add('in'));
        return;
    }

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                obs.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    els.forEach(el => io.observe(el));
})();

// ===== NAVIGATION MOBILE =====
const navEl = document.querySelector('.nav');
const toggleBtn = document.querySelector('.nav__toggle');
const menuMobile = document.getElementById('menu-mobile');

function setMenu(open) {
    toggleBtn.setAttribute('aria-expanded', String(open));
    toggleBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.classList.toggle('is-locked', open);
    menuMobile.hidden = !open;
}

if (toggleBtn && menuMobile) {
    toggleBtn.addEventListener('click', () => {
        setMenu(toggleBtn.getAttribute('aria-expanded') !== 'true');
    });

    // Fermer à la navigation ou à "Échap".
    menuMobile.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => setMenu(false));
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
        }
    });
}

// ===== NAV : réduite au scroll, masquée au scroll down =====
let lastScrollY = window.scrollY;
let navTicking = false;

window.addEventListener('scroll', () => {
    if (!navTicking) {
        requestAnimationFrame(updateNavState);
        navTicking = true;
    }
}, { passive: true });

function updateNavState() {
    const y = window.scrollY;

    if (toggleBtn.getAttribute('aria-expanded') === 'true') {
        navTicking = false;
        return;
    }

    const delta = y - lastScrollY;
    navEl.classList.toggle('is-hidden', delta > 8 && y > 160);
    lastScrollY = y;
    navTicking = false;
}

// ===== LIEN ACTIF DE LA NAVIGATION =====
const navAnchors = document.querySelectorAll('.menu-desktop a[href^="#"]');

(function initActiveNav() {
    const sections = [...document.querySelectorAll('section[id]')];
    if (!sections.length) return;

    const setActive = (id) => {
        navAnchors.forEach(a => {
            const isActive = a.getAttribute('href') === `#${id}`;
            if (isActive) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
        });
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
})();

// ===== BOUTON RETOUR EN HAUT =====
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    const updateBtt = () => backToTop.classList.toggle('show', window.scrollY > 600);
    window.addEventListener('scroll', updateBtt, { passive: true });
    updateBtt();

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
}

// Le smooth scroll est natif (html { scroll-behavior: smooth }) et le
// décalage de la nav fixe est géré par html { scroll-padding-top }.
// Rien d'autre à faire.