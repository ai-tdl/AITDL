class Auth {
    static TOKEN_KEY = 'aitdl_admin_token';
    static API_BASE = 'http://localhost:8000/api';

    static async login(email, password) {
        try {
            const res = await fetch(`${this.API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) return false;

            const data = await res.json();
            if (data.access_token) {
                localStorage.setItem(this.TOKEN_KEY, data.access_token);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Login error', e);
            return false;
        }
    }

    static logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        window.location.href = 'index.html';
    }

    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static getPayload() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
        } catch (e) {
            return null;
        }
    }

    static getHeaders() {
        return {
            'Authorization': `Bearer ${this.getToken()}`,
            'Content-Type': 'application/json'
        };
    }

    static async apiCall(endpoint, options = {}) {
        if (!this.isAuthenticated()) {
            this.logout();
            return null;
        }

        const url = `${this.API_BASE}${endpoint}`;
        const fetchOptions = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const res = await fetch(url, fetchOptions);
            if (res.status === 401 || res.status === 403) {
                this.logout();
                return null;
            }
            return res;
        } catch (e) {
            console.error(`API Error ${endpoint}`, e);
            return null;
        }
    }
}

// Global exposure
window.Auth = Auth;
