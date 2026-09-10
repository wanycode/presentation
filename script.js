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

// ===== HORLOGE EN DIRECT HEURE DE PARIS (CET) =====
(function initParisClock() {
    const clockEl = document.getElementById('navClock');
    if (!clockEl) return;

    function update() {
        try {
            const now = new Date();
            const time = now.toLocaleTimeString('fr-FR', {
                timeZone: 'Europe/Paris',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            clockEl.textContent = `PARIS ${time}`;
        } catch (_) {
            clockEl.textContent = 'PARIS 19:20';
        }
    }
    update();
    setInterval(update, 1000);
})();

// ===== TILT 3D ET REFLET FOIL SUR LES VISUELS PROJETS =====
(function initFoilTilt() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

    const visuals = document.querySelectorAll('.work__visual');

    visuals.forEach(vis => {
        const monogram = vis.querySelector('.monogram');
        if (!monogram) return;

        vis.addEventListener('mousemove', (e) => {
            const rect = vis.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const px = (x / rect.width) * 100;
            const py = (y / rect.height) * 100;

            const rotX = ((y / rect.height) - 0.5) * -12;
            const rotY = ((x / rect.width) - 0.5) * 12;

            monogram.style.setProperty('--foil-x', `${px.toFixed(1)}%`);
            monogram.style.setProperty('--foil-y', `${py.toFixed(1)}%`);
            vis.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
        });

        vis.addEventListener('mouseleave', () => {
            vis.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    });
})();

// ===== SCEAU / TAMPON ROTATIF INTERACTIF =====
(function initStamp() {
    const stampBtn = document.getElementById('heroStamp');
    if (!stampBtn) return;

    stampBtn.addEventListener('click', () => {
        showToast('Wany Studio — Code & Design artisanal 2026 ✓');
    });
})();

// ===== LOADER D'OUVERTURE (presse print) =====
// Progressive enhancement : sans JS le loader reste caché (display:none en CSS),
// il n'est affiché qu'une fois que le JS confirme qu'il tourne.
(function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    document.body.classList.add('is-loading');

    const hide = () => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');
        setTimeout(() => loader.remove(), 900);
    };

    if (reduceMotion) {
        hide();
        return;
    }

    // Petite respiration : la presse se retire peu après le chargement.
    if (document.readyState === 'complete') {
        setTimeout(hide, 700);
    } else {
        window.addEventListener('load', () => setTimeout(hide, 700), { once: true });
        // Filet de sécurité si load tarde trop.
        setTimeout(hide, 2600);
    }
})();

// ===== RÉVÉLATION DE TITRE MOT PAR MOT (split text) =====
(function initSplitText() {
    if (reduceMotion) return;

    const targets = document.querySelectorAll('.hero__title, .h-display');
    if (!targets.length) return;

    targets.forEach((heading) => {
        // Découpe chaque mot dans un span.sw avec un index --i pour le stagger.
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        let wordIndex = 0;
        textNodes.forEach((node) => {
            const frag = document.createDocumentFragment();
            const words = node.nodeValue.split(/(\s+)/);
            words.forEach((w) => {
                if (!w) return;
                if (/^\s+$/.test(w)) {
                    frag.appendChild(document.createTextNode(' '));
                    return;
                }
                const span = document.createElement('span');
                span.className = 'sw';
                span.style.setProperty('--i', wordIndex++);
                span.textContent = w;
                frag.appendChild(span);
            });
            node.parentNode.replaceChild(frag, node);
        });

        heading.classList.add('split-ready');
    });
})();

// ===== SPOTLIGHT LUMINEUX QUI SUIT LE CURSEUR =====
(function initSpotlight() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let tx = -400, ty = -400, cx = -400, cy = -400;
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
        cx += (tx - cx) * 0.09;
        cy += (ty - cy) * 0.09;
        glow.style.transform = `translate3d(${cx - 240}px, ${cy - 240}px, 0)`;
        ticking = false;
        if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
            requestAnimationFrame(loop);
            ticking = true;
        }
    }
})();

// ===== BOUTONS MAGNÉTIQUES (attirés par le curseur) =====
(function initMagnetic() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

    document.querySelectorAll('.btn, .work__link').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            el.style.setProperty('--mx', `${(dx * 0.22).toFixed(1)}px`);
            el.style.setProperty('--my', `${(dy * 0.34).toFixed(1)}px`);
        });
        el.addEventListener('mouseleave', () => {
            el.style.setProperty('--mx', '0px');
            el.style.setProperty('--my', '0px');
        });
    });
})();

// ===== EFFET DÉCODEUR SUR LES LIENS DE NAVIGATION =====
(function initScramble() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    document.querySelectorAll('.menu-desktop a, .side-index a, .work__link, .contact__email').forEach((el) => {
        // On ne brouille que les nœuds texte : la flèche (span) reste intacte.
        const nodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
        if (!nodes.length) return;
        const originals = nodes.map((n) => n.textContent);

        const scramble = () => {
            let frame = 0;
            const total = 8;
            el._scramble = setInterval(() => {
                const progress = frame / total;
                nodes.forEach((node, i) => {
                    const orig = originals[i];
                    const keep = Math.floor(orig.length * progress);
                    let out = '';
                    for (let j = 0; j < orig.length; j++) {
                        out += j < keep ? orig[j] : chars[Math.floor(Math.random() * chars.length)];
                    }
                    node.textContent = out;
                });
                frame++;
                if (frame >= total) {
                    nodes.forEach((node, i) => { node.textContent = originals[i]; });
                    clearInterval(el._scramble);
                    el._scramble = null;
                }
            }, 26);
        };

        const reset = () => {
            clearInterval(el._scramble);
            el._scramble = null;
            nodes.forEach((node, i) => { node.textContent = originals[i]; });
        };

        el.addEventListener('mouseenter', scramble);
        el.addEventListener('mouseleave', reset);
    });
})();

// ===== RIPPLE AU CLIC SUR LES BOUTONS =====
(function initRipple() {
    if (reduceMotion) return;

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn, .work__link');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const d = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${d * 2}px`;
        ripple.style.left = `${e.clientX - rect.left - d}px`;
        ripple.style.top = `${e.clientY - rect.top - d}px`;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
})();

// ===== COMPTEURS ANIMÉS (stats hero) =====
(function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            obs.unobserve(entry.target);
            animateCounter(entry.target);
        });
    }, { threshold: 0.5 });

    function animateCounter(el) {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        if (isNaN(target)) return;
        if (reduceMotion) {
            el.textContent = target + suffix;
            return;
        }

        const dur = 1200;
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);

        const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(target * ease(p)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    nums.forEach((n) => io.observe(n));
})();

// ===== SCANLINE SUR LA LISTE DES SERVICES (suit la souris) =====
(function initScanline() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

    const list = document.querySelector('.services__list');
    if (!list) return;

    list.addEventListener('mousemove', (e) => {
        const rect = list.getBoundingClientRect();
        const y = e.clientY - rect.top;
        list.style.setProperty('--scan-y', `${y.toFixed(1)}px`);
    });
})();

// ===== NAV : état compacté au scroll =====
(function initNavScrolled() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const update = () => {
        nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
})();