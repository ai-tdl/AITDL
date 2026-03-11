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

/* ─── Picker State ───────────────────────────────────────────────────────── */
(function initPicker() {

    const roleNames = {
        retail: 'Retailer',
        erp: 'Business',
        education: 'School / Coaching',
        teacher: 'Teacher',
        student: 'Student',
        home: 'Parent / Family',
        partner: 'Partner',
        ngo: 'NGO / Trust',
        ecom: 'Ecommerce',
    };

    let primaryRole = null;
    let secondaryRoles = [];

    /* ── Open / Close picker ── */
    window.openPicker = function () {
        document.getElementById('picker').classList.add('on');
        document.body.style.overflow = 'hidden';
    };

    window.closePicker = function () {
        document.getElementById('picker').classList.remove('on');
        document.body.style.overflow = '';
    };

    /* ── Pick a role ──
       BUG FIX: secondary badge reset now correctly clears to 'PRIMARY'
       and does not leave stale '+ADD' badge visible after removal.       */
    window.pickRole = function (el) {
        const role = el.dataset.role;

        if (!primaryRole) {
            /* First tap → set as PRIMARY */
            primaryRole = role;
            el.classList.add('primary');
            el.querySelector('.pk-badge').textContent = 'PRIMARY';
            document.getElementById('pkStep1').classList.add('done');
            document.getElementById('pkStep2').classList.add('act');
            document.getElementById('pkGo').classList.add('ready');
            _updateSummary();

        } else if (el.classList.contains('primary')) {
            /* Tap primary again → full reset */
            primaryRole = null;
            secondaryRoles = [];
            document.querySelectorAll('.pk-role').forEach(r => {
                r.classList.remove('primary', 'secondary');
                r.querySelector('.pk-badge').textContent = 'PRIMARY'; // FIX: always reset to PRIMARY
            });
            ['pkStep1', 'pkStep2', 'pkStep3'].forEach(id =>
                document.getElementById(id).classList.remove('done', 'act'));
            document.getElementById('pkGo').classList.remove('ready');
            _updateSummary();

        } else if (el.classList.contains('secondary')) {
            /* Tap secondary → remove it */
            el.classList.remove('secondary');
            el.querySelector('.pk-badge').textContent = 'PRIMARY'; // FIX: reset badge text
            secondaryRoles = secondaryRoles.filter(r => r !== role);
            _updateSummary();

        } else {
            /* Tap new role → add as secondary */
            secondaryRoles.push(role);
            el.classList.add('secondary');
            el.querySelector('.pk-badge').textContent = '+ADD';
            _updateSummary();
        }
    };

    /* ── Summary update ── */
    function _updateSummary() {
        const el = document.getElementById('pkSummary');
        if (!primaryRole) {
            el.textContent = '';
            el.classList.remove('has');
            return;
        }
        let txt = roleNames[primaryRole];
        if (secondaryRoles.length) {
            txt += ' + ' + secondaryRoles.map(r => roleNames[r]).join(' + ');
        }
        el.textContent = txt;
        el.classList.add('has');
        document.getElementById('pkStep3').classList.add('act');
    }

    /* ── Enter My World — activate chosen roles ── */
    window.enterMyWorld = function () {
        if (!primaryRole) return;
        const p = primaryRole;
        const s = [...secondaryRoles];
        closePicker();
        /* Reset picker after animation completes */
        setTimeout(() => _resetPicker(), 500);
        if (s.length === 0) {
            window.ROUTER.activate(p);
        } else {
            window.ROUTER.activateMulti(p, s);
        }
    };

    /* ── Reset picker to clean state ── */
    function _resetPicker() {
        primaryRole = null;
        secondaryRoles = [];
        document.querySelectorAll('.pk-role').forEach(r => {
            r.classList.remove('primary', 'secondary');
            r.querySelector('.pk-badge').textContent = 'PRIMARY';
        });
        document.getElementById('pkGo').classList.remove('ready');
        ['pkStep1', 'pkStep2', 'pkStep3'].forEach(id =>
            document.getElementById(id).classList.remove('done', 'act'));
        document.getElementById('pkStep1').classList.add('act');
        const sum = document.getElementById('pkSummary');
        sum.textContent = '';
        sum.classList.remove('has');
    }

    /* Init: step 1 is active by default */
    document.getElementById('pkStep1').classList.add('act');

})();
