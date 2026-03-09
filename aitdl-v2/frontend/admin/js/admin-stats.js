class AdminStats {
    static async load() {
        const container = document.getElementById('statsContainer');
        if (!container) return;

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

        this.updateBadges(data);
        this.loadChartData();
    }

    static updateBadges(data) {
        const leadsBadge = document.getElementById('leadsBadge');
        const partnersBadge = document.getElementById('partnersBadge');

        if (leadsBadge) {
            leadsBadge.innerText = data.new_leads;
            leadsBadge.style.display = data.new_leads > 0 ? 'inline-block' : 'none';
        }

        if (partnersBadge) {
            partnersBadge.innerText = data.pending_partners;
            partnersBadge.style.display = data.pending_partners > 0 ? 'inline-block' : 'none';
        }
    }

    static async loadChartData() {
        // Fetch full leads/partners up to 100 for the chart
        const [leadsRes, partnersRes] = await Promise.all([
            Auth.apiCall('/admin/leads?page=1&size=100'),
            Auth.apiCall('/admin/partners?page=1&size=100')
        ]);

        if (!leadsRes || !partnersRes) return;

        const leads = await leadsRes.json();
        const partners = await partnersRes.json();

        this.renderChart(leads, partners);
    }

    static renderChart(leads, partners) {
        const ctx = document.getElementById('leadsChart');
        if (!ctx) return;

        // Group data by Date string (YYYY-MM-DD)
        const dateCounts = {};

        // Helper to format Date wrapper securely
        const pushDate = (item, type) => {
            if (!item.created_at) return;
            const dateStr = new Date(item.created_at).toISOString().split('T')[0];
            if (!dateCounts[dateStr]) dateCounts[dateStr] = { leads: 0, partners: 0 };
            dateCounts[dateStr][type]++;
        };

        leads.forEach(l => pushDate(l, 'leads'));
        partners.forEach(p => pushDate(p, 'partners'));

        // Sort dates chronologically
        const sortedDates = Object.keys(dateCounts).sort();

        // Take last 7 days from the sorted list
        const labels = sortedDates.slice(-7);
        const leadsData = labels.map(d => dateCounts[d] ? dateCounts[d].leads : 0);
        const partnersData = labels.map(d => dateCounts[d] ? dateCounts[d].partners : 0);

        // Render Chart.js
        if (window.adminChart) window.adminChart.destroy();

        window.adminChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
                datasets: [
                    {
                        label: 'Contact Leads',
                        data: leadsData,
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    },
                    {
                        label: 'Partner Applications',
                        data: partnersData,
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#94a3b8' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}
window.AdminStats = AdminStats;
