/**
 * AdminStats — admin-stats.js
 *
 * Purpose  : Load and display dashboard overview statistics and an
 *            activity bar chart (Chart.js) for contacts and partner
 *            applications over the last 7 active days.
 *
 * Dependencies: Auth (admin-auth.js) must be loaded first.
 *               Chart.js must be available on window.Chart.
 */

class AdminStats {

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Entry point — fetches stats, renders cards + badges, then loads chart.
     */
    static async load() {
        const container = document.getElementById('statsContainer');
        if (!container) return;

        container.innerHTML = '<div class="loader"></div>';

        const res = await Auth.apiCall('/admin/stats');
        if (!res) return;

        const data = await res.json();

        container.innerHTML = this._buildStatCards(data);
        this._updateNavBadges(data);

        // Chart loads independently — non-blocking for the stats cards
        this._loadChartData().catch((err) =>
            console.error('[AdminStats] Chart load failed:', err)
        );
    }

    // ── Private: Stats cards ──────────────────────────────────────────────────

    /**
     * Build the stat card HTML from the stats API response.
     *
     * @param {object} data - Stats payload from /admin/stats
     * @returns {string} HTML string
     */
    static _buildStatCards(data) {
        const cards = [
            { title: 'Total Leads', value: data.total_leads, color: null },
            { title: 'New Leads', value: data.new_leads, color: 'var(--accent)' },
            { title: 'Total Partner Apps', value: data.total_partners, color: null },
            { title: 'Pending Partners', value: data.pending_partners, color: 'var(--warning)' },
        ];

        return cards.map(({ title, value, color }) => `
            <div class="stat-card">
                <div class="stat-title">${title}</div>
                <div class="stat-value" ${color ? `style="color:${color};"` : ''}>${value ?? 0}</div>
            </div>
        `).join('');
    }

    /**
     * Update the red notification badges on the sidebar navigation items.
     *
     * @param {object} data - Stats payload
     */
    static _updateNavBadges(data) {
        const badges = [
            { id: 'leadsBadge', count: data.new_leads },
            { id: 'partnersBadge', count: data.pending_partners },
        ];

        badges.forEach(({ id, count }) => {
            const badge = document.getElementById(id);
            if (!badge) return;
            badge.innerText = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        });
    }

    // ── Private: Chart ────────────────────────────────────────────────────────

    /**
     * Fetch compact lead and partner data for the chart and render it.
     */
    static async _loadChartData() {
        const [leadsRes, partnersRes] = await Promise.all([
            Auth.apiCall('/admin/leads?page=1&size=100'),
            Auth.apiCall('/admin/partners?page=1&size=100'),
        ]);

        if (!leadsRes || !partnersRes) return;

        const [leads, partners] = await Promise.all([leadsRes.json(), partnersRes.json()]);
        this._renderChart(leads, partners);
    }

    /**
     * Aggregate items by date and render a Chart.js bar chart.
     *
     * @param {object[]} leads
     * @param {object[]} partners
     */
    static _renderChart(leads, partners) {
        const ctx = document.getElementById('leadsChart');
        if (!ctx || typeof Chart === 'undefined') return;

        // ── Aggregate by date ─────────────────────────────────────────────────
        const dateCounts = {};

        const addToDate = (isoStr, key) => {
            if (!isoStr) return;
            const dateStr = isoStr.split('T')[0]; // "YYYY-MM-DD" — no Date object needed
            if (!dateCounts[dateStr]) dateCounts[dateStr] = { leads: 0, partners: 0 };
            dateCounts[dateStr][key]++;
        };

        leads.forEach((l) => addToDate(l.created_at, 'leads'));
        partners.forEach((p) => addToDate(p.created_at, 'partners'));

        // Last 7 active days in chronological order
        const sortedDates = Object.keys(dateCounts).sort().slice(-7);
        const leadsData = sortedDates.map((d) => dateCounts[d].leads);
        const partnerData = sortedDates.map((d) => dateCounts[d].partners);
        const labels = sortedDates.map((d) =>
            new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        );

        // ── Destroy previous instance to prevent memory leak ──────────────────
        if (window._adminChart) {
            window._adminChart.destroy();
            window._adminChart = null;
        }

        // ── Shared chart theme ────────────────────────────────────────────────
        const MUTED_COLOR = '#94a3b8';
        const GRID_COLOR = 'rgba(255,255,255,0.05)';

        window._adminChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Contact Leads',
                        data: leadsData,
                        backgroundColor: '#3b82f6',
                        borderRadius: 4,
                    },
                    {
                        label: 'Partner Applications',
                        data: partnerData,
                        backgroundColor: '#10b981',
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: MUTED_COLOR } },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: MUTED_COLOR },
                        grid: { color: GRID_COLOR },
                    },
                    x: {
                        ticks: { color: MUTED_COLOR },
                        grid: { display: false },
                    },
                },
            },
        });
    }
}

window.AdminStats = AdminStats;
