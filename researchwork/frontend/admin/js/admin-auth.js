/**
 * Auth — admin-auth.js
 *
 * Purpose  : Manage admin authentication: login, logout, token storage,
 *            JWT payload decoding, and authenticated fetch wrapper.
 *
 * Security : Tokens are stored in sessionStorage (not localStorage) to expire
 *            automatically when the browser tab is closed, limiting session
 *            exposure.
 *
 * Notes    : API_BASE must be updated to the production URL before deployment.
 */

class Auth {
    // ── Constants ────────────────────────────────────────────────────────────

    /** Storage key used for the JWT access token. */
    static #TOKEN_KEY = 'aitdl_admin_token';

    /**
     * Base URL for all admin API calls.
     * @todo: Update before deployment.
     */
    static #API_BASE = 'http://localhost:8080/api';

    // ── Public API ───────────────────────────────────────────────────────────

    /**
     * Authenticate against the backend and store the returned JWT.
     *
     * @param {string} email    - Admin email address
     * @param {string} password - Admin password (never stored)
     * @returns {Promise<boolean>} true on success, false on failure
     */
    static async login(email, password) {
        try {
            const res = await fetch(`${this.#API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
            });

            if (!res.ok) {
                console.warn(`[Auth] Login failed — HTTP ${res.status}`);
                return false;
            }

            const data = await res.json();

            if (!data.access_token) {
                console.warn('[Auth] Login response missing access_token');
                return false;
            }

            sessionStorage.setItem(this.#TOKEN_KEY, data.access_token);
            return true;
        } catch (err) {
            console.error('[Auth] Network error during login:', err);
            return false;
        }
    }

    /**
     * Clear the session token and redirect to the login page.
     */
    static logout() {
        sessionStorage.removeItem(this.#TOKEN_KEY);
        window.location.replace('index.html');
    }

    /**
     * @returns {string|null} The stored JWT, or null if not authenticated.
     */
    static getToken() {
        return sessionStorage.getItem(this.#TOKEN_KEY);
    }

    /**
     * @returns {boolean} Whether a token is currently present.
     */
    static isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Decode the JWT payload section (base64url → object).
     * Does NOT verify the signature — purely for reading role/email on the client.
     *
     * @returns {object|null} Decoded payload, or null if token is absent/malformed.
     */
    static getPayload() {
        const token = this.getToken();
        if (!token) return null;

        try {
            // JWT structure: header.payload.signature — we need index 1
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            // Base64url → Base64
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
        } catch {
            console.warn('[Auth] Failed to decode JWT payload');
            return null;
        }
    }

    /**
     * Make an authenticated API call. Auto-logs out on 401/403.
     *
     * @param {string} endpoint - Path relative to API_BASE (e.g. '/admin/leads')
     * @param {RequestInit} [options={}] - Fetch options to merge in
     * @returns {Promise<Response|null>} The raw Response, or null on auth/network failure
     */
    static async apiCall(endpoint, options = {}) {
        if (!this.isAuthenticated()) {
            this.logout();
            return null;
        }

        const url = `${this.#API_BASE}${endpoint}`;
        const fetchOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
                ...options.headers,
            },
        };

        try {
            const res = await fetch(url, fetchOptions);

            if (res.status === 401 || res.status === 403) {
                console.warn(`[Auth] Access denied (${res.status}) — logging out`);
                this.logout();
                return null;
            }

            return res;
        } catch (err) {
            console.error(`[Auth] Network error for ${endpoint}:`, err);
            return null;
        }
    }
}

// Expose globally for inline HTML handlers
window.Auth = Auth;
