class AdminStats {
    static async load() {
        const container = document.getElementById('statsContainer');
        container.innerHTML = '<div class="loader"></div>';

        const res = await Auth.apiCall('/admin/stats');
        if (!res) return;

        const data = await res.json();

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-title">Total Leads</div>
                <div class="stat-value">${data.total_leads}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">New Leads</div>
                <div class="stat-value" style="color: var(--accent);">${data.new_leads}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Total Partner Apps</div>
                <div class="stat-value">${data.total_partners}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Pending Partners</div>
                <div class="stat-value" style="color: var(--warning);">${data.pending_partners}</div>
            </div>
        `;
    }
}
window.AdminStats = AdminStats;
