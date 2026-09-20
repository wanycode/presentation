'use strict';

/* ============================================================
   WANY — Interactions
   1. Reveal au scroll        5. Barre de progression
   2. Navigation mobile       6. Retour en haut
   3. Nav au scroll           7. Copie de l'email + toast
   4. Lien actif              8. Tampon · compteurs · parallax
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Reveal au scroll ---------- */
(function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (reduceMotion) {
        els.forEach(el => el.classList.add('in'));
        return;
    }

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            obs.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    els.forEach(el => io.observe(el));
})();

/* ---------- 2. Navigation mobile ---------- */
const navEl = document.querySelector('.nav');
const toggleBtn = document.querySelector('.nav__toggle');
const menuMobile = document.getElementById('menu-mobile');

function setMenu(open) {
    if (!toggleBtn || !menuMobile) return;
    toggleBtn.setAttribute('aria-expanded', String(open));
    toggleBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.classList.toggle('is-locked', open);
    menuMobile.hidden = !open;
}

if (toggleBtn && menuMobile) {
    toggleBtn.addEventListener('click', () => {
        setMenu(toggleBtn.getAttribute('aria-expanded') !== 'true');
    });

    menuMobile.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => setMenu(false));
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
        }
    });
}

/* ---------- 3. Nav : masquée au scroll bas, compactée au scroll ---------- */
(function initNavScroll() {
    if (!navEl) return;

    let lastY = window.scrollY;
    let ticking = false;

    function update() {
        const y = window.scrollY;

        navEl.classList.toggle('is-scrolled', y > 24);

        if (toggleBtn && toggleBtn.getAttribute('aria-expanded') === 'true') {
            ticking = false;
            return;
        }

        navEl.classList.toggle('is-hidden', y - lastY > 8 && y > 200);
        lastY = y;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (ticking) return;
        requestAnimationFrame(update);
        ticking = true;
    }, { passive: true });

    update();
})();

/* ---------- 4. Lien actif dans la navigation ---------- */
(function initActiveNav() {
    const links = document.querySelectorAll('.menu-desktop a[href^="#"], .side-index a[href^="#"]');
    const sections = [...document.querySelectorAll('section[id]')];
    if (!links.length || !sections.length) return;

    const hrefs = new Set([...links].map(a => a.getAttribute('href')));

    const setActive = (id) => {
        /* Les sections sans entrée de navigation (prestations, maintenance…)
           ne doivent pas éteindre le repère courant. */
        if (!hrefs.has(`#${id}`)) return;

        links.forEach((a) => {
            if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
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

/* ---------- 5. Barre de progression de lecture ---------- */
(function initProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
})();

/* ---------- 6. Retour en haut (+ jauge) ---------- */
(function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        btn.classList.toggle('show', window.scrollY > 600);
        btn.style.setProperty('--p', Math.round(p * 360));
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
})();

/* ---------- 7. Toast + copie de l'email ---------- */
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
    toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

(function initEmailCopy() {
    const emailLink = document.querySelector('.contact__email');
    if (!emailLink) return;

    emailLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const mail = emailLink.getAttribute('href').replace('mailto:', '');
        try {
            await navigator.clipboard.writeText(mail);
            showToast('Email copié ✓');
        } catch (_) {
            /* presse-papiers indisponible : on ouvre la messagerie */
            window.location.href = emailLink.getAttribute('href');
        }
    });
})();

/* ---------- 8. Tampon cliquable + compteurs ---------- */
(function initStamp() {
    const stamp = document.getElementById('heroStamp');
    if (!stamp) return;
    stamp.addEventListener('click', () => showToast('Wany — design & code, 2026 ✓'));
})();

(function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            obs.unobserve(entry.target);
            animate(entry.target);
        });
    }, { threshold: 0.6 });

    function animate(el) {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        if (isNaN(target)) return;

        if (reduceMotion) {
            el.textContent = target + suffix;
            return;
        }

        const duration = 1100;
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);

        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            el.textContent = Math.round(target * ease(p)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    nums.forEach(n => io.observe(n));
})();

/* ---------- 9. Parallax léger sur le mot géant du hero ---------- */
(function initHeroParallax() {
    const word = document.querySelector('.hero__word');
    if (!word || reduceMotion) return;

    let ticking = false;

    const update = () => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
            word.style.transform = `translateY(${y * -0.12}px)`;
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (ticking) return;
        requestAnimationFrame(update);
        ticking = true;
    }, { passive: true });
})();