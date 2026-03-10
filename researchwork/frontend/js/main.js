/*
|| ॐ श्री गणेशाय नमः ||

Organization: AITDL
AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab

Creator: Jawahar R. Mallah
Founder, Author & System Architect

Email: jawahar@aitdl.com
GitHub: https://github.com/jawahar-mallah

Websites:
https://ganitsutram.com
https://aitdl.com

Then: 628 CE · Brahmasphuṭasiddhānta
Now: 8 March MMXXVI · Vikram Samvat 2082

Copyright © aitdl.com · AITDL | GANITSUTRAM.com
*/

/* ─── App Router & State ─────────────────────────────────────────────────── */
(function initRouter() {

    /* ── Theme map ── */
    const THEMES = {
        retail: { cls: 't-retail', color: [255, 107, 26] },
        erp: { cls: 't-erp', color: [26, 143, 255] },
        education: { cls: 't-education', color: [34, 197, 101] },
        teacher: { cls: 't-education', color: [34, 197, 101] },
        student: { cls: 't-ai', color: [162, 89, 255] },
        home: { cls: 't-home', color: [255, 77, 106] },
        partner: { cls: 't-partner', color: [57, 224, 122] },
        ngo: { cls: 't-ngo', color: [14, 184, 160] },
        ecom: { cls: 't-ecom', color: [108, 99, 255] },
        learn: { cls: 't-ai', color: [162, 89, 255] },
    };

    const PAGE_TITLES = {
        retail: 'AITDL — Retail Technology',
        erp: 'AITDL — ERP & Business',
        education: 'AITDL — Education Technology',
        teacher: 'AITDL — AI for Teachers',
        student: 'AITDL — AI Learning',
        home: 'AITDL — Home & Family AI',
        partner: 'AITDL — Become a Partner',
        ngo: 'AITDL — NGO & Social Sector',
        ecom: 'AITDL — Ecommerce Platform',
        learn: 'AITDL — Learn • Earn • Fun',
    };

    const ROLE_NAMES = {
        retail: 'Retailer', erp: 'Business', education: 'School/Coaching',
        teacher: 'Teacher', student: 'Student', home: 'Parent',
        partner: 'Partner', ngo: 'NGO / Trust', ecom: 'Ecommerce',
    };

    let currentSection = null;

    /* ── Helpers ── */
    function hideAll() {
        document.getElementById('gate').style.display = 'none';
        document.getElementById('overview').classList.remove('on');
        document.getElementById('partner-landing').style.display = 'none';
        document.querySelectorAll('.aud-section').forEach(s => s.classList.remove('active'));
    }

    function showBack() { document.getElementById('backBtn').classList.add('show'); }
    function hideBack() { document.getElementById('backBtn').classList.remove('show'); }

    function applyTheme(name) {
        document.body.className = '';
        const t = THEMES[name];
        if (t) {
            document.body.classList.add(t.cls);
            if (window.CANVAS) window.CANVAS.setColor(t.color);
        }
    }

    /* ─────────────────────────────────────────
       DOOR 1 — Universe → Overview Dashboard
    ───────────────────────────────────────── */
    window.enterUniverse = function () {
        hideAll();
        document.body.className = '';
        if (window.CANVAS) window.CANVAS.resetColor();
        document.getElementById('overview').classList.add('on');
        window.scrollTo({ top: 0, behavior: 'instant' });
        showBack();
        document.title = 'AITDL — All Solutions';
        currentSection = 'overview';
        setTimeout(() => { runReveals(); runCounters(); }, 80);
    };

    /* ─────────────────────────────────────────
       DOOR 3 — Partner Landing
    ───────────────────────────────────────── */
    window.enterPartnerLanding = function () {
        hideAll();
        applyTheme('partner');
        document.getElementById('partner-landing').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'instant' });
        showBack();
        document.title = 'AITDL — Become a Partner';
        currentSection = 'partner-landing';
        setTimeout(() => { runReveals(); runCounters(); }, 80);
    };

    /* ─────────────────────────────────────────
       DOOR 4 — Learn • Earn • Fun
    ───────────────────────────────────────── */
    window.setView = activate;
    window.enterLearn = function () {
        setView('learn');
    };

    /* ───────────────────────────────────────
       ACTIVATE SINGLE AUDIENCE SECTION
    ─────────────────────────────────────── */
    function activate(name) {
        hideAll();
        applyTheme(name);
        const sec = document.getElementById('s-' + name);
        if (sec) {
            sec.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
        showBack();
        if (PAGE_TITLES[name]) document.title = PAGE_TITLES[name];
        currentSection = name;
        setTimeout(() => { runReveals(); runCounters(); }, 80);
    }

    /* ─────────────────────────────────────────
       ACTIVATE MULTI — primary + secondaries
    ───────────────────────────────────────── */
    function activateMulti(primary, secondaries) {
        hideAll();
        applyTheme(primary);
        const pSec = document.getElementById('s-' + primary);
        if (pSec) pSec.classList.add('active');
        secondaries.forEach(role => {
            const sec = document.getElementById('s-' + role);
            if (sec) sec.classList.add('active');
        });
        window.scrollTo({ top: 0, behavior: 'instant' });
        showBack();
        document.title = 'AITDL — ' + [primary, ...secondaries].map(r => ROLE_NAMES[r]).join(' + ');
        currentSection = primary;
        setTimeout(() => { runReveals(); runCounters(); }, 80);
    }

    /* ─────────────────────────────────────────
       GO HOME — back to Gate
    ───────────────────────────────────────── */
    window.goHome = function () {
        hideAll();
        document.getElementById('gate').style.display = 'flex';
        document.body.className = '';
        document.body.style.overflow = '';
        if (window.CANVAS) window.CANVAS.resetColor();
        hideBack();
        document.title = 'AITDL — Choose Your World';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        currentSection = null;
    };

    /* ─────────────────────────────────────────
       BUG FIX: scrollTo name conflict
       Original code shadowed window.scrollTo —
       renamed to scrollToId throughout HTML.
    ───────────────────────────────────────── */
    window.scrollToId = function (id) {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    /* ── Nav helpers ── */
    window.openMenu = function () { document.getElementById('navL').classList.add('open'); };
    window.closeMenu = function () { document.getElementById('navL').classList.remove('open'); };

    /* ── Cursor ── */
    const cur = document.getElementById('cur');
    const curR = document.getElementById('curR');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cur.style.left = mx + 'px';
        cur.style.top = my + 'px';
    });
    (function animateCursor() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        curR.style.left = rx + 'px';
        curR.style.top = ry + 'px';
        requestAnimationFrame(animateCursor);
    })();

    /* ── Reveal observer ──
       BUG FIX: previous observer not disconnected on section change,
       causing duplicate callbacks on revisit.                        */
    let revObs = null;
    function runReveals() {
        if (revObs) revObs.disconnect();
        revObs = new IntersectionObserver(entries => {
            entries.forEach((e, i) => {
                if (e.isIntersecting) {
                    setTimeout(() => {
                        e.target.classList.add('on');
                        revObs.unobserve(e.target);
                    }, i * 55);
                }
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
        document.querySelectorAll('.rv:not(.on)').forEach(el => revObs.observe(el));
    }

    /* ── Count-up observer ──
       BUG FIX: _counted flag reset on section revisit via counter
       observer disconnect/reconnect, preventing stale animation state. */
    let cntObs = null;
    function runCounters() {
        if (cntObs) cntObs.disconnect();
        cntObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.querySelectorAll('.sn[data-target]').forEach(el => {
                        if (el._counted) return;
                        el._counted = true;
                        const tgt = parseInt(el.dataset.target);
                        const sfx = (tgt === 99) ? '%' : '+';
                        const step = tgt / 1600 * 16;
                        let v = 0;
                        const timer = setInterval(() => {
                            v += step;
                            if (v >= tgt) { v = tgt; clearInterval(timer); }
                            el.textContent = Math.floor(v) + sfx;
                        }, 16);
                    });
                    cntObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.25 });
        document.querySelectorAll('.stats, .sb').forEach(el => cntObs.observe(el));
    }

    /* Expose router for picker.js */
    window.ROUTER = { activate, activateMulti };
    /* Expose helpers for picker.js init */
    window._runReveals = runReveals;
    window._runCounters = runCounters;

    /* ── Init ── */
    document.getElementById('gate').style.display = 'flex';

})();
