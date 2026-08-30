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
const navAnchors = document.querySelectorAll('.menu-desktop a[href^="#"], .side-index a[href^="#"]');

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

// ===== BARRE DE PROGRESSION =====
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
    const updateProgress = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        scrollProgress.style.transform = `scaleX(${p})`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
}

// ===== BOUTON RETOUR EN HAUT (avec jege de lecture) =====
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    const updateBtt = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        backToTop.classList.toggle('show', window.scrollY > 600);
        backToTop.style.setProperty('--p', Math.round(p * 360));
    };
    window.addEventListener('scroll', updateBtt, { passive: true });
    window.addEventListener('resize', updateBtt, { passive: true });
    updateBtt();

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
}

// ===== COPIER L'EMAIL AU CLIC (avec toast) =====
const emailLink = document.querySelector('.contact__email');
if (emailLink) {
    emailLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const mail = emailLink.getAttribute('href').replace('mailto:', '');
        try {
            await navigator.clipboard.writeText(mail);
            showToast('Email copié ✓');
        } catch (_) {
            /* clipboard indisponible : on ouvre la messagerie à la place */
            window.location.href = emailLink.getAttribute('href');
        }
    });
}

function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 1600);
}

// Le smooth scroll est natif (html { scroll-behavior: smooth }) et le
// décalage de la nav fixe est géré par html { scroll-padding-top }.
// Rien d'autre à faire.

// ===== CURSEUR SIGNATURE (anneau orange qui traîne) =====
(function initCursor() {
    // Uniquement souris précise + pas de réduction de mouvement.
    if (!window.matchMedia('(pointer: fine)').matches || reduceMotion) return;

    const ring = document.createElement('div');
    ring.className = 'cursor__ring';
    document.body.appendChild(ring);

    let tx = -200, ty = -200, cx = -200, cy = -200;
    let hover = false, down = false;
    let ticking = false;

    window.addEventListener('mousemove', (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!ticking) {
            requestAnimationFrame(loop);
            ticking = true;
        }
    }, { passive: true });

    function loop() {
        // Traînée fluide (lerp) : l'anneau suit le curseur avec un léger retard.
        // Position via transform (composité) au lieu de left/top (layout).
        cx += (tx - cx) * 0.16;
        cy += (ty - cy) * 0.16;
        ring.style.transform =
            `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
        ticking = false;
        if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) {
            requestAnimationFrame(loop);
            ticking = true;
        }
    }

    document.addEventListener('mouseover', (e) => {
        hover = !!e.target.closest('a, button, [role="button"]');
        ring.classList.toggle('is-hover', hover);
    }, { passive: true });

    window.addEventListener('mousedown', () => {
        down = true;
        ring.classList.add('is-down');
    }, { passive: true });
    window.addEventListener('mouseup', () => {
        down = false;
        ring.classList.remove('is-down');
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        ring.classList.add('is-hidden');
    }, { passive: true });
    document.addEventListener('mouseenter', () => {
        ring.classList.remove('is-hidden');
    }, { passive: true });
})();