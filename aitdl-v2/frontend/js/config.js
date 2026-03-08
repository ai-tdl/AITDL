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

/* ─── AITDL v2 Config ────────────────────────────────────────────────────── */
const AITDL_CONFIG = {

  /* Web3Forms key — get yours free at https://web3forms.com
     Replace with your actual key before deploying. */
  WEB3FORMS_KEY: '97d31994-f123-4abc-8def-000000000001',

  /* Backend API (FastAPI on Railway/Render)
     In local dev, use http://localhost:8000
     In production, set to your Railway/Render URL */
  API_BASE_URL: (function () {
    if (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return 'https://api.aitdl.com'; // ← update with your production URL
  })(),

  /* Contact email for display */
  EMAIL_GENERAL: 'info@aitdl.com',
  EMAIL_RETAIL: 'retail@aitdl.com',
  EMAIL_ERP: 'erp@aitdl.com',
  EMAIL_EDU: 'schools@aitdl.com',
  EMAIL_NGO: 'ngo@aitdl.com',
  EMAIL_PARTNER: 'partners@aitdl.com',

  /* Company details */
  COMPANY: {
    name: 'AITDL',
    founded: 2007,
    cities: ['Mumbai', 'Nashik', 'Surat', 'Gorakhpur'],
    website: 'https://aitdl.com',
    github: 'https://github.com/jawahar-mallah',
  },

  /* Feature flags */
  FEATURES: {
    useBackendAPI: false,   // false = use Web3Forms; true = use FastAPI backend
    useSupabase: false,   // future: Supabase direct auth
    debugMode: false,   // set true to log all form submissions to console
  },
};

/* Freeze config — prevent runtime mutation */
Object.freeze(AITDL_CONFIG);
Object.freeze(AITDL_CONFIG.COMPANY);
Object.freeze(AITDL_CONFIG.FEATURES);
