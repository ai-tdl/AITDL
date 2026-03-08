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

/* ─── Form Handler ───────────────────────────────────────────────────────── */
(function initForms() {

    /**
     * sendForm — handles ALL contact / partner / waitlist form submissions.
     *
     * BUG FIX from aitdl2.html:
     *   Original code used a fake 1.2s setTimeout and never actually sent data.
     *   This version:
     *   - Routes to Web3Forms if AITDL_CONFIG.FEATURES.useBackendAPI === false
     *   - Routes to FastAPI /api/contact or /api/partner-apply if true
     *   - Shows real success/failure feedback
     *
     * @param {Event} e - form submit event
     */
    window.sendForm = async function sendForm(e) {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('.bsend span') || form.querySelector('[type="submit"] span');
        if (!btn) return;

        const origText = btn.textContent;
        btn.textContent = 'Sending…';
        form.querySelectorAll('input,textarea,select,button').forEach(el => el.disabled = true);

        try {
            if (AITDL_CONFIG.FEATURES.useBackendAPI) {
                await _sendToBackend(form);
            } else {
                await _sendToWeb3Forms(form);
            }
            btn.textContent = '✓ Sent! We\'ll WhatsApp you shortly.';
            form.reset();
        } catch (err) {
            console.error('[AITDL Forms]', err);
            btn.textContent = '✗ Error. Please WhatsApp us directly.';
        } finally {
            form.querySelectorAll('input,textarea,select,button').forEach(el => el.disabled = false);
            setTimeout(() => { btn.textContent = origText; }, 6000);
        }
    };

    /* ── Web3Forms submission ── */
    async function _sendToWeb3Forms(form) {
        const data = new FormData(form);
        const obj = Object.fromEntries(data.entries());

        /* Inject Web3Forms access key */
        const payload = {
            access_key: AITDL_CONFIG.WEB3FORMS_KEY,
            from_name: 'AITDL Website Lead',
            subject: `New Lead — ${obj.section || document.title}`,
            ...obj,
        };

        if (AITDL_CONFIG.FEATURES.debugMode) {
            console.log('[AITDL Forms] Web3Forms payload:', payload);
        }

        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!result.success) throw new Error(result.message || 'Web3Forms error');
    }

    /* ── FastAPI backend submission ── */
    async function _sendToBackend(form) {
        const data = new FormData(form);
        const obj = Object.fromEntries(data.entries());
        const isPartner = form.dataset.formType === 'partner';
        const endpoint = isPartner ? '/api/partner-apply' : '/api/contact';

        if (AITDL_CONFIG.FEATURES.debugMode) {
            console.log(`[AITDL Forms] Backend payload → ${endpoint}:`, obj);
        }

        const res = await fetch(AITDL_CONFIG.API_BASE_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `HTTP ${res.status}`);
        }
    }

})();
