'use strict';

/* ============================================================
   WANY — Interactions
   1. Reveal au scroll        5. Barre de progression
   2. Navigation mobile       6. Retour en haut
   3. Nav au scroll           7. Copie de l'email + toast
   4. Lien actif              8. Tampon · compteurs
   9. Parallax du hero       10. Avis clients (Supabase)
   ============================================================ */

/* ============================================================
   AVIS CLIENTS · CONFIGURATION SUPABASE
   Système multi-sites : pour un nouveau client, change
   UNIQUEMENT la valeur de SITE_ID ci-dessous.

   La clé « publishable » est faite pour le navigateur.
   Ne JAMAIS mettre une clé sb_secret_ ici.
   ============================================================ */
const SUPABASE_URL = 'https://ahtfwbsvicdljpsveqra.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_TmJkefOivrof2S8Xx_4OWQ_LoN3yV3J';
const REVIEWS_TABLE = 'business-reviews';
const SITE_ID = 'wany-studio';           /* ← identifiant de CE site */
const REVIEW_MIN_LENGTH = 5;             /* commentaire : longueur minimale */
const REVIEW_MAX_LENGTH = 800;           /* doit rester aligné sur maxlength */

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

/* ---------- 10. Avis clients · Supabase ---------- */
function initReviews() {
    const listEl     = document.getElementById('avisList');
    const loadingEl  = document.getElementById('avisLoading');
    const emptyEl    = document.getElementById('avisEmpty');
    const errorEl    = document.getElementById('avisError');
    const scoreEl    = document.getElementById('avisScore');
    const avgEl      = document.getElementById('avisAvg');
    const avgStarsEl = document.getElementById('avisAvgStars');
    const countEl    = document.getElementById('avisCount');
    const openBtn    = document.getElementById('avisOpen');
    const modalEl    = document.getElementById('avisModal');
    const closeBtn   = document.getElementById('avisClose');
    const formEl     = document.getElementById('avisForm');
    const nameEl     = document.getElementById('avisName');
    const reviewEl   = document.getElementById('avisReview');
    const reviewLen  = document.getElementById('avisReviewCount');
    const reviewMax  = document.getElementById('avisReviewMax');
    const formErrEl  = document.getElementById('avisFormError');
    const submitBtn  = document.getElementById('avisSubmit');
    const submitTxt  = document.getElementById('avisSubmitText');
    const doneEl     = document.getElementById('avisDone');
    const doneBtn    = document.getElementById('avisDoneBtn');
    const ratingEl   = document.getElementById('avisRating');

    /* Section absente de la page : rien à faire */
    if (!listEl || !formEl) return;

    /* Longueur maximale : une seule source de vérité (REVIEW_MAX_LENGTH) */
    if (reviewEl) reviewEl.maxLength = REVIEW_MAX_LENGTH;
    if (reviewMax) reviewMax.textContent = String(REVIEW_MAX_LENGTH);

    const client = (window.supabase && typeof window.supabase.createClient === 'function')
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
        : null;

    const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    const show = (el) => { if (el) el.hidden = false; };
    const hide = (el) => { if (el) el.hidden = true; };

    /* ---- Rendu ------------------------------------------------ */
    function stars(value, decorative) {
        const wrap = document.createElement('span');
        const filled = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
        wrap.className = 'stars';

        if (decorative) {
            /* Décor : la note chiffrée juste à côté porte déjà l'information */
            wrap.setAttribute('aria-hidden', 'true');
        } else {
            wrap.setAttribute('role', 'img');
            wrap.setAttribute('aria-label', filled + (filled > 1 ? ' étoiles' : ' étoile') + ' sur 5');
        }

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.textContent = '★';
            if (i <= filled) star.className = 'is-on';
            wrap.appendChild(star);
        }
        return wrap;
    }

    function renderSummary(rows) {
        const total = rows.length;
        /* Seules les notes réellement comprises entre 1 et 5 comptent :
           on n'invente jamais une note pour une donnée corrompue. */
        const ratings = rows
            .map((r) => Number(r.rating))
            .filter((v) => v >= 1 && v <= 5);

        if (!ratings.length) return;

        const avg = ratings.reduce((acc, v) => acc + v, 0) / ratings.length;
        const label = avg.toFixed(1).replace('.', ',');

        if (avgEl) avgEl.textContent = label;
        if (avgStarsEl) {
            avgStarsEl.textContent = '';
            avgStarsEl.appendChild(stars(avg, true));
        }
        if (countEl) countEl.textContent = total === 1 ? '1 avis publié' : total + ' avis publiés';
        show(scoreEl);
    }

    function renderList(rows) {
        listEl.textContent = '';

        rows.forEach((row, i) => {
            const li = document.createElement('li');
            li.className = 'avis-card';
            li.style.setProperty('--d', Math.min(i, 9) * 55 + 'ms');

            const head = document.createElement('div');
            head.className = 'avis-card__head';

            const who = document.createElement('p');
            who.className = 'avis-card__name';
            who.textContent = String(row.name || 'Client').slice(0, 60);

            const txt = document.createElement('p');
            txt.className = 'avis-card__text';
            txt.textContent = String(row.review || '');

            const when = document.createElement('p');
            when.className = 'avis-card__date';
            const d = row.created_at ? new Date(row.created_at) : null;
            when.textContent = (d && !isNaN(d)) ? dateFmt.format(d) : 'Avis publié';

            head.append(who, stars(row.rating));
            li.append(head, txt, when);
            listEl.appendChild(li);
        });

        show(listEl);
    }

    function fail(message) {
        hide(loadingEl);
        hide(emptyEl);
        hide(scoreEl);
        hide(listEl);
        if (errorEl) {
            errorEl.textContent = message;
            show(errorEl);
        }
    }

    /* ---- Lecture ----------------------------------------------------
       Seuls les avis de CE site ET approuvés remontent. */
    async function loadReviews() {
        if (!client) {
            console.error('[avis] Supabase indisponible : le script CDN ne s\'est pas chargé.');
            fail("Les avis ne peuvent pas être chargés pour le moment. Réessaie plus tard.");
            return;
        }

        show(loadingEl);

        try {
            const { data, error } = await client
                .from(REVIEWS_TABLE)
                .select('id, name, rating, review, created_at')
                .eq('site_id', SITE_ID)
                .eq('approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            hide(loadingEl);
            const rows = Array.isArray(data) ? data : [];

            if (!rows.length) {
                show(emptyEl);
                return;
            }

            renderSummary(rows);
            renderList(rows);
        } catch (err) {
            console.error('[avis] chargement impossible :', err);
            fail("Impossible de charger les avis pour l'instant. Réessaie dans un moment.");
        }
    }

    /* ---- Formulaire -------------------------------------------------- */
    function clearErrors() {
        if (formErrEl) {
            formErrEl.textContent = '';
            hide(formErrEl);
        }
        formEl.querySelectorAll('.field.is-invalid').forEach((f) => f.classList.remove('is-invalid'));
    }

    function formError(message, node) {
        if (formErrEl) {
            formErrEl.textContent = message;
            show(formErrEl);
        }
        const field = node && node.closest ? node.closest('.field') : null;
        if (field) field.classList.add('is-invalid');
    }

    function currentRating() {
        const checked = formEl.querySelector('input[name="rating"]:checked');
        return checked ? Number(checked.value) : 0;
    }

    function resetForm() {
        formEl.reset();
        show(formEl);
        hide(doneEl);
        clearErrors();
        if (reviewLen) reviewLen.textContent = '0';
        if (submitTxt) submitTxt.textContent = 'Publier';
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
        }
    }

    async function onSubmit(e) {
        /* Le formulaire est en method="dialog" : preventDefault() DOIT rester
           la première instruction, sinon la soumission ferme le modal. */
        e.preventDefault();
        clearErrors();

        const name = (nameEl && nameEl.value ? nameEl.value : '').trim();
        const review = (reviewEl && reviewEl.value ? reviewEl.value : '').trim();
        const rating = currentRating();

        /* 1. Champs vides */
        if (!name) {
            formError('Indique ton prénom ou ton nom.', nameEl);
            if (nameEl) nameEl.focus();
            return;
        }

        /* 2. Note entre 1 et 5 */
        if (rating < 1 || rating > 5) {
            formError('Choisis une note entre 1 et 5 étoiles.', ratingEl);
            return;
        }

        /* 3. Commentaire non vide */
        if (review.length < REVIEW_MIN_LENGTH) {
            formError('Ton commentaire doit faire au moins ' + REVIEW_MIN_LENGTH + ' caractères.', reviewEl);
            if (reviewEl) reviewEl.focus();
            return;
        }

        if (!client) {
            formError("L'envoi est indisponible pour le moment. Réessaie plus tard.");
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
        }
        if (submitTxt) submitTxt.textContent = 'Envoi…';

        try {
            /* approved reste false : l'avis est modéré avant publication */
            const { error } = await client.from(REVIEWS_TABLE).insert({
                site_id: SITE_ID,
                name: name.slice(0, 60),
                rating: rating,
                review: review.slice(0, REVIEW_MAX_LENGTH),
                approved: false
            });

            if (error) throw error;

            hide(formEl);
            show(doneEl);
            if (doneBtn) doneBtn.focus();
        } catch (err) {
            console.error('[avis] envoi impossible :', err);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.removeAttribute('aria-busy');
            }
            if (submitTxt) submitTxt.textContent = 'Publier';
            formError("L'envoi a échoué. Vérifie ta connexion puis réessaie.");
        }
    }

    /* ---- Ouverture / fermeture du modal ------------------------------ */
    function openModal() {
        resetForm();
        if (modalEl && typeof modalEl.showModal === 'function') {
            if (!modalEl.open) modalEl.showModal();
        } else if (modalEl) {
            modalEl.setAttribute('open', '');
        }
        document.body.classList.add('is-locked');
        window.setTimeout(() => { if (nameEl) nameEl.focus(); }, 80);
    }

    function closeModal() {
        if (!modalEl) return;
        if (typeof modalEl.close === 'function') {
            if (modalEl.open) modalEl.close();
        } else {
            modalEl.removeAttribute('open');
        }
        document.body.classList.remove('is-locked');
        if (openBtn) openBtn.focus();
    }

    /* ---- Branchements ------------------------------------------------- */
    formEl.addEventListener('submit', onSubmit);

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (doneBtn) doneBtn.addEventListener('click', closeModal);

    if (nameEl) nameEl.addEventListener('input', clearErrors);

    if (reviewEl) {
        reviewEl.addEventListener('input', () => {
            if (reviewLen) reviewLen.textContent = String(reviewEl.value.length);
            clearErrors();
        });
    }

    if (ratingEl) ratingEl.addEventListener('change', clearErrors);

    if (modalEl) {
        /* Clic sur le fond (hors carte) = fermer */
        modalEl.addEventListener('click', (e) => {
            if (e.target !== modalEl) return;
            const r = modalEl.getBoundingClientRect();
            const inside = e.clientX >= r.left && e.clientX <= r.right &&
                           e.clientY >= r.top && e.clientY <= r.bottom;
            if (!inside) closeModal();
        });
        modalEl.addEventListener('close', () => document.body.classList.remove('is-locked'));
    }

    loadReviews();
}

/* Supabase est chargé avec `defer` : on attend DOMContentLoaded
   pour être sûr que window.supabase est disponible. */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReviews);
} else {
    initReviews();
}