/**
 * CMS Core module
 * Handles routing, API integration, and shared utilities for the CMS Studio
 */

const CMS = {
    Config: {
        API_BASE: '/api/v1/cms'
    },

    /**
     * Initialize the CMS Studio
     */
    init() {
        // Read hash to set initial tab, default to 'pages'
        const hash = window.location.hash.replace('#', '') || 'pages';
        this.switchTab(hash);

        // Load workspaces / usage data globally
        this.loadWorkspaceData();
    },

    /**
     * Switch content tabs in the CMS Studio
     * @param {string} tabId The ID of the tab to activate
     */
    switchTab(tabId) {
        // Update URL hash without jumping
        window.history.replaceState(null, null, `#${tabId}`);

        // Update nav active states
        document.querySelectorAll('.nav-item').forEach(el => {
            const isActive = el.dataset.tab === tabId;
            el.classList.toggle('active', isActive);
            if (isActive) {
                el.setAttribute('aria-current', 'page');
            } else {
                el.removeAttribute('aria-current');
            }
        });

        // Show matching tab content, hide others
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.toggle('active', el.id === tabId);
        });

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            const toggle = document.getElementById('sidebarToggle');
            if (sidebar) sidebar.classList.remove('active');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }

        // Trigger module-specific load functions
        this.triggerModuleLoad(tabId);
    },

    /**
     * Calls the specific module's load function when its tab becomes active
     */
    triggerModuleLoad(tabId) {
        switch (tabId) {
            case 'pages':
                if (window.CMSPages) CMSPages.loadList();
                break;
            case 'cards':
                if (window.CMSCards) CMSCards.loadList();
                break;
            case 'blog':
                if (window.CMSBlog) CMSBlog.loadList();
                break;
            case 'media':
                if (window.CMSMedia) CMSMedia.loadLibrary();
                break;
            case 'forms':
                if (window.CMSForms) CMSForms.loadList();
                break;
            case 'ai':
                if (window.CMSAI) CMSAI.loadDashboard();
                break;
        }
    },

    /**
     * Wrapper for fetch calls authenticated with the admin JWT
     */
    async apiCall(endpoint, options = {}) {
        const token = Auth.getToken();
        if (!token) {
            Auth.logout();
            return null;
        }

        // Default headers
        const headers = {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        // Auto-set Content-Type to JSON if sending a body object
        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(options.body);
        }

        try {
            const url = `${this.Config.API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
            const response = await fetch(url, { ...options, headers });

            // 204 No Content
            if (response.status === 204) {
                return { success: true };
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                // If 401/403, might be an expired token
                if (response.status === 401 || response.status === 403) {
                    console.error('CMS API Auth Error:', data.detail || 'Unauthorized');
                    // Optionally force logout: Auth.logout();
                }
                throw new Error(data.detail || data.message || `API Error ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`[CMS API Error] ${endpoint}:`, error);
            throw error;
        }
    },

    /**
     * Show global toast notification (reuse existing admin toast if available, or fallback to alert)
     */
    toast(message, type = 'success') {
        // If AdminStats has showToast, use it. Otherwise simple alert.
        if (window.AdminStats && typeof AdminStats.showToast === 'function') {
            AdminStats.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
            // Fallback UI toast could be implemented here
        }
    },

    /**
     * Global workspace data (e.g., getting ai usage for the sidebar)
     */
    async loadWorkspaceData() {
        try {
            // Can fetch global AI usage here to show a badge or status
            // const usage = await this.apiCall('/ai/usage');
            // ...
        } catch (e) {
            // fail silently for badge
        }
    }
};

// Globalize for module access
window.CMS = CMS;
