/**
 * CMS AI Studio Module
 * Handles global AI generation tasks (SEO, Translation, Branding)
 */

const CMSAI = {
    async loadDashboard() {
        const container = document.getElementById('aiUsageStats');
        try {
            // Use workspaces API to get usage for current workspace
            const workspaces = await CMS.apiCall('/workspaces');
            if (workspaces.length > 0) {
                const ws = workspaces[0];
                const pct = ws.ai_credits_limit > 0 ? (ws.ai_credits_used / ws.ai_credits_limit) * 100 : 0;

                container.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <span style="font-size: 2rem; font-weight: 700;">${ws.ai_credits_used}</span>
                        <span class="text-muted">/ ${ws.ai_credits_limit} limits</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${Math.min(pct, 100)}%; background: ${pct > 90 ? '#ef4444' : '#eab308'};"></div>
                    </div>
                    <p class="text-muted" style="font-size: 0.75rem; margin-top: 0.5rem;">
                        ${ws.plan.toUpperCase()} PLAN • Credits reset monthly
                    </p>
                `;
            } else {
                container.innerHTML = '<p class="text-muted">No workspace data available.</p>';
            }
        } catch (error) {
            container.innerHTML = `<p class="text-danger">Could not load stats: ${error.message}</p>`;
        }
    }
};

window.CMSAI = CMSAI;
