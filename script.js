'use strict';

// ===== PRÉFÉRENCES UTILISATEUR =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// ===== PRÉLOADER =====
(function initPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.setAttribute('aria-hidden', 'true');
    preloader.innerHTML =
        '<div class="preloader-logo">WANY<span class="preloader-logo-dot">.</span></div>' +
        '<div class="preloader-bar"><i></i></div>' +
        '<div class="preloader-count">0%</div>';
    document.body.appendChild(preloader);
    document.body.classList.add('is-preloading');

    const countEl = preloader.querySelector('.preloader-count');
    const barEl = preloader.querySelector('.preloader-bar i');

    const finish = () => {
        document.body.classList.remove('is-preloading');
        preloader.classList.add('done');
        setTimeout(() => preloader.remove(), 650);

    };

    if (reduceMotion) {
        countEl.textContent = '100%';
        barEl.style.width = '100%';
        setTimeout(finish, 200);
        return;
    }

    const duration = 1300;
    const start = performance.now();
    const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        countEl.textContent = Math.round(eased * 100) + '%';
        barEl.style.width = eased * 100 + '%';
        if (p < 1) {
            requestAnimationFrame(step);
        } else {
            finish();
        }
    };
    requestAnimationFrame(step);

    // Filet de sécurité : on ne bloque JAMAIS la page
    setTimeout(() => {
        if (document.body.classList.contains('is-preloading')) {
            document.body.classList.remove('is-preloading');
            preloader.classList.add('done');
        }
    }, 4000);
})();

// ===== MOBILE NAVIGATION =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const nav = document.querySelector('.nav');

const openMenu = () => {
    // Le menu plein écran ne doit jamais être caché derrière la nav repliée
    nav.classList.remove('nav-hidden');
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

// ===== ANIMATIONS AU SCROLL (fade-in-up, stagger plafonné) =====
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

// NB : les titres de section utilisent la révélation mot par mot (plus bas)
// NB : .project-card n'est PAS là : la carte est révélée par son image
// (rideau .img-reveal) + son contenu (fade) pour un mouvement en deux temps.
const revealElements = document.querySelectorAll(
    '.about-text, .why-text, .contact-subtitle, .contact-buttons, .value-card, .service-card, .project-content, .process-step, .process-note'
);

revealElements.forEach(el => {
    if (reduceMotion) {
        el.classList.add('visible');
        return;
    }

    el.classList.add('fade-in-up');

    // Petit stagger par rangée (max 0.27s)
    let delay = 0;
    if (el.parentElement) {
        const siblings = Array.from(el.parentElement.children);
        const idx = siblings.indexOf(el);
        delay = Math.min(idx, 3) * 0.09;
    }
    el.style.transitionDelay = `${delay}s`;

    io.observe(el);
});

// ===== RÉVÉLATION MOT PAR MOT DES TITRES =====
const splitWords = (el) => {
    const frag = document.createDocumentFragment();
    const masks = [];

    const appendWord = (word) => {
        if (!word) return;
        const mask = document.createElement('span');
        mask.className = 'wr-mask';
        const w = document.createElement('span');
        w.className = 'wr-word';
        w.textContent = word;
        mask.appendChild(w);
        masks.push(w);
        frag.appendChild(mask);
    };

    // On préserve <br> et les spans .grad-text (révélés comme un seul bloc)
    Array.from(el.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.textContent.split(/(\s+)/).forEach(part => {
                if (/^\s+$/.test(part)) {
                    frag.appendChild(document.createTextNode(part));
                } else if (part) {
                    appendWord(part);
                }
            });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'BR') {
                frag.appendChild(node);
            } else if (node.classList && node.classList.contains('grad-text')) {
                const mask = document.createElement('span');
                mask.className = 'wr-mask';
                node.classList.add('wr-word');
                mask.appendChild(node);
                masks.push(node);
                frag.appendChild(mask);
            } else {
                appendWord(node.textContent);
            }
        }
    });

    el.textContent = '';
    el.appendChild(frag);
    return masks;
};

const wrIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('wr-in');
            wrIO.unobserve(entry.target);
        }
    });
}, { rootMargin: '0px 0px -60px 0px', threshold: 0.2 });

document.querySelectorAll('.section-title, .why-title, .contact-title').forEach(title => {
    if (reduceMotion) return;

    const words = splitWords(title);
    words.forEach((w, i) => {
        w.style.transitionDelay = `${Math.min(i * 0.045, 0.6)}s`;
    });
    wrIO.observe(title);
});

// ===== NAV : FOND + RÉDUCTION SUR SCROLL, LIEN ACTIF, MASQUAGE =====
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

// Disparition au scroll down, réapparition au scroll up
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (document.body.classList.contains('menu-open')) return;

    const y = window.scrollY;
    const delta = y - lastScrollY;

    if (Math.abs(delta) < 10) {
        lastScrollY = y;
        return;
    }

    nav.classList.toggle('nav-hidden', delta > 0 && y > 140);
    lastScrollY = y;
}, { passive: true });

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

// ===== PARALLAX DU HERO AU SCROLL (profondeur) =====
const heroSection = document.querySelector('.hero');
const heroContentEl = document.querySelector('.hero-content');

if (heroSection && heroContentEl && !reduceMotion) {
    let heroParallaxTicking = false;

    const runHeroParallax = () => {
        const y = window.scrollY;
        const heroH = heroSection.offsetHeight;

        // NB : on ne touche pas à .hero-visual : son animation d'entrée
        // `hero-in ... forwards` écraserait le transform inline (origin
        // animation > author normal). Le seul taux sur hero-content suffit.
        if (y < heroH) {
            heroContentEl.style.transform = `translateY(${y * 0.16}px)`;
        } else {
            heroContentEl.style.transform = '';
        }
        heroParallaxTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!heroParallaxTicking) {
            requestAnimationFrame(runHeroParallax);
            heroParallaxTicking = true;
        }
    }, { passive: true });
}

// ===== SPOTLIGHT QUI SUIT LA SOURIS DANS LE HERO =====
const heroSpotlight = document.querySelector('.hero-spotlight');
const heroEl = document.querySelector('.hero');

if (heroSpotlight && heroEl && finePointer && !reduceMotion) {
    let spotTicking = false;

    heroEl.addEventListener('mousemove', (e) => {
        if (spotTicking) return;

        requestAnimationFrame(() => {
            const rect = heroEl.getBoundingClientRect();
            heroSpotlight.style.opacity = '1';
            heroSpotlight.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px)`;
            spotTicking = false;
        });

        spotTicking = true;
    }, { passive: true });

    heroEl.addEventListener('mouseleave', () => {
        heroSpotlight.style.opacity = '0';
    });
}

// ===== COMPTEURS ANIMÉS =====
const counters = document.querySelectorAll('[data-count]');

const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
};

if (counters.length > 0) {
    const counterIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterIO.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(el => {
        if (reduceMotion) {
            el.textContent = el.dataset.count + (el.dataset.suffix || '');
            return;
        }
        counterIO.observe(el);
    });
}

// ===== CURSEUR CUSTOM (desktop uniquement, hors reduced-motion) =====
const cursorHost = document.querySelector('.custom-cursor');

if (cursorHost && finePointer && !reduceMotion) {
    const dot = cursorHost.querySelector('.cursor-dot');
    const ring = cursorHost.querySelector('.cursor-outline');

    // S'il manque un élément, on n'active RIEN (le curseur natif reste)
    if (!dot || !ring) {
        cursorHost.remove();
    } else {
        document.body.classList.add('cursor-enabled');

        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let rx = mx;
        let ry = my;
        let lastTrail = 0;

        const interactive = 'a, button, .value-card, .service-card, .project-card, .process-step, .social-link, .nav-cta, .hero-mockup, .back-to-top, .nav-toggle';

        // Lerp piloté en JS : on neutralise la transition transform du CSS
        // pour éviter le double lissage.
        ring.style.transition = 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease, background 0.3s ease';

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;

            const now = performance.now();
            if (now - lastTrail > 70) {
                lastTrail = now;
                const t = document.createElement('div');
                t.className = 'cursor-trail';
                t.style.left = mx + 'px';
                t.style.top = my + 'px';
                document.body.appendChild(t);
                requestAnimationFrame(() => {
                    t.style.transform = 'translate(-50%, -50%) scale(0.4)';
                    t.style.opacity = '0';
                });
                setTimeout(() => t.remove(), 550);
            }
        }, { passive: true });

        document.addEventListener('mouseover', (e) => {
            ring.classList.toggle('hovering', !!(e.target.closest && e.target.closest(interactive)));
        });

        document.documentElement.addEventListener('mouseleave', () => {
            cursorHost.style.opacity = '0';
        });

        document.documentElement.addEventListener('mouseenter', () => {
            cursorHost.style.opacity = '1';
        });

        const cursorLoop = () => {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;

            // On n'écrit le style que si le curseur bouge encore (souris au repos)
            if (Math.abs(rx - mx) > 0.05 || Math.abs(ry - my) > 0.05) {
                ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            }
            requestAnimationFrame(cursorLoop);
        };
        requestAnimationFrame(cursorLoop);
    }
}

// ===== CANVAS DE PARTICULES ("poussière de fée") =====
const particleCanvas = document.querySelector('.particle-canvas');

if (particleCanvas && !reduceMotion) {
    const ctx = particleCanvas.getContext('2d');
    const colors = ['99,102,241', '168,85,247', '236,72,153'];
    const mouse = { x: -9999, y: -9999 };
    const parts = [];
    let W = 0;
    let H = 0;
    let running = true;

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        particleCanvas.width = W * dpr;
        particleCanvas.height = H * dpr;
        particleCanvas.style.width = W + 'px';
        particleCanvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
        parts.length = 0;
        const count = W < 768 ? 26 : 55;
        for (let i = 0; i < count; i++) {
            parts.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.8 + 0.7,
                c: colors[Math.floor(Math.random() * colors.length)],
                a: Math.random() * 0.25 + 0.15
            });
        }
    };

    const tick = () => {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);

        for (const p of parts) {
            // Répulsion douce autour de la souris
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 120 * 120 && d2 > 0.01) {
                const d = Math.sqrt(d2);
                const f = ((120 - d) / 120) * 0.6;
                p.x += (dx / d) * f;
                p.y += (dy / d) * f;
            }

            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -20) p.x = W + 20;
            if (p.x > W + 20) p.x = -20;
            if (p.y < -20) p.y = H + 20;
            if (p.y > H + 20) p.y = -20;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.c},${p.a})`;
            ctx.fill();
        }

        requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        if (running) requestAnimationFrame(tick);
    });

    resize();
    init();
    requestAnimationFrame(tick);

    window.addEventListener('resize', () => {
        resize();
        init();
    }, { passive: true });
}

// ===== BOUTONS MAGNÉTIQUES (desktop uniquement) =====
if (finePointer && !reduceMotion) {
    document.querySelectorAll('.magnetic-btn').forEach(el => {
        let magneticTicking = false;

        el.addEventListener('mousemove', (e) => {
            if (magneticTicking) return;

            requestAnimationFrame(() => {
                const r = el.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
                const y = ((e.clientY - r.top) / r.height - 0.5) * 14;
                el.style.transform = `translate(${x}px, ${y}px)`;
                magneticTicking = false;
            });

            magneticTicking = true;
        }, { passive: true });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

// ===== RIPPLE AU CLIC =====
if (!reduceMotion) {
    document.querySelectorAll('.btn, .social-link, .project-link, .nav-cta, .back-to-top, .nav-toggle').forEach(el => {
        el.addEventListener('pointerdown', (e) => {
            const r = el.getBoundingClientRect();
            const d = Math.max(r.width, r.height) * 2.2;
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.setAttribute('aria-hidden', 'true');
            ripple.style.width = d + 'px';
            ripple.style.height = d + 'px';
            ripple.style.left = `${e.clientX - r.left - d / 2}px`;
            ripple.style.top = `${e.clientY - r.top - d / 2}px`;
            el.appendChild(ripple);
            setTimeout(() => ripple.remove(), 800);
        }, { passive: true });
    });
}

// ===== BOUTON RETOUR EN HAUT =====
const backToTop = document.getElementById('backToTop');

if (backToTop) {
    const updateBackToTop = () => {
        backToTop.classList.toggle('show', window.scrollY > 600);
    };

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
}

// ===== TILT 3D DES CARTES (desktop uniquement) =====
if (finePointer && !reduceMotion) {
    document.querySelectorAll('.project-card, .service-card, .value-card, .process-step').forEach(card => {
        let tiltTicking = false;

        card.addEventListener('mousemove', (e) => {
            if (tiltTicking) return;

            requestAnimationFrame(() => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform =
                    `perspective(900px) rotateX(${(py * -5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-5px)`;
                tiltTicking = false;
            });

            tiltTicking = true;
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ===== RIDEAU DE RÉVÉLATION DES IMAGES DE PROJETS =====
const imgRevealIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in');
            imgRevealIO.unobserve(entry.target);
        }
    });
}, { rootMargin: '0px 0px -60px 0px', threshold: 0.15 });

document.querySelectorAll('.img-reveal').forEach(el => {
    if (reduceMotion) {
        el.classList.add('in');
    } else {
        imgRevealIO.observe(el);
    }
});

// ===== LUMIÈRE AMBIANTE GLOBALE (suit la souris en douceur) =====
const ambientLight = document.createElement('div');
ambientLight.className = 'ambient-light';
ambientLight.setAttribute('aria-hidden', 'true');
document.body.appendChild(ambientLight);

if (finePointer && !reduceMotion) {
    let ax = window.innerWidth / 2;
    let ay = window.innerHeight / 2;
    let tx = ax;
    let ty = ay;
    let lightShown = false;

    window.addEventListener('mousemove', (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!lightShown) {
            lightShown = true;
            ambientLight.style.opacity = '1';
        }
    }, { passive: true });

    const lightLoop = () => {
        ax += (tx - ax) * 0.08;
        ay += (ty - ay) * 0.08;
        // On n'écrit le style que si la lumière bouge encore (souris au repos)
        if (Math.abs(ax - tx) > 0.05 || Math.abs(ay - ty) > 0.05) {
            ambientLight.style.transform = `translate(${ax.toFixed(1)}px, ${ay.toFixed(1)}px)`;
        }
        requestAnimationFrame(lightLoop);
    };
    requestAnimationFrame(lightLoop);
}

// ===== HUD SYSTÈME (horloge + scroll %, toggle avec la touche H) =====
const hud = document.createElement('div');
hud.className = 'hud';
hud.setAttribute('aria-hidden', 'true');
hud.innerHTML = '<span>WANY.SYS v3.0</span><br><span class="hud-time">--:--:--</span> · <span class="hud-scroll">00%</span><span class="hud-blink"></span>';
document.body.appendChild(hud);

const hudTime = hud.querySelector('.hud-time');
const hudScroll = hud.querySelector('.hud-scroll');
const pad2 = (n) => String(n).padStart(2, '0');
let hudTick = false;

const updateHud = () => {
    const d = new Date();
    hudTime.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    hudScroll.textContent = pad2(Math.round(max > 0 ? (doc.scrollTop / max) * 100 : 0));
};

setInterval(updateHud, 1000);
window.addEventListener('scroll', () => {
    if (!hudTick) {
        requestAnimationFrame(() => {
            updateHud();
            hudTick = false;
        });
        hudTick = true;
    }
}, { passive: true });
updateHud();

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        hud.classList.toggle('hidden');
    }
});

// ===== EASTER EGGS =====
const eggBurst = (x, y) => {
    if (reduceMotion) return;
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#818cf8', '#f472b6'];
    const cx = x || window.innerWidth / 2;
    const cy = y || window.innerHeight / 2;

    for (let i = 0; i < 22; i++) {
        const p = document.createElement('span');
        p.className = 'egg-particle';
        const size = Math.random() * 7 + 4;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.setProperty('--tx', `${(Math.random() - 0.5) * 280}px`);
        p.style.setProperty('--ty', `${(Math.random() - 0.5) * 280}px`);
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 950);
    }
};

const eggToast = (msg) => {
    let t = document.querySelector('.egg-toast');
    if (!t) {
        t = document.createElement('div');
        t.className = 'egg-toast';
        t.setAttribute('role', 'status');
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(eggToast._timer);
    eggToast._timer = setTimeout(() => t.classList.remove('show'), 2400);
};

// Séquence secrète : taper "wany"
const secretWord = 'wany';
let typed = '';

window.addEventListener('keydown', (e) => {
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-secretWord.length);
    if (typed === secretWord) {
        eggBurst();
        eggToast('⚡ Mode créatif activé — WANY.SYS');
        document.body.classList.add('egg-party');
        setTimeout(() => document.body.classList.remove('egg-party'), 5000);
        typed = '';
    }
});

// Double-clic sur le logo
const navLogo = document.querySelector('.nav-logo');
if (navLogo) {
    navLogo.addEventListener('dblclick', (e) => {
        eggBurst(e.clientX, e.clientY);
        eggToast('✨ WANY.SYS — double clic détecté');
    });
}
