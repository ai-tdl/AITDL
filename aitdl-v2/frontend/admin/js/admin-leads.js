class AdminLeads {
    static formatDate(isoStr) {
        return new Date(isoStr).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    }

    static async loadLeads() {
        const tbody = document.getElementById('leadsTableBody');
        tbody.innerHTML = '<tr><td colspan="6"><div class="loader"></div></td></tr>';

        const res = await Auth.apiCall('/admin/leads?page=1&size=50');
        if (!res) return;

        const leads = await res.json();

        if (leads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No leads found.</td></tr>';
            return;
        }

        tbody.innerHTML = leads.map(lead => `
            <tr>
                <td><strong>${lead.name}</strong><br><span style="color: var(--text-muted); font-size: 0.75rem;">${lead.business || ''}</span></td>
                <td>${lead.phone}</td>
                <td><span style="opacity: 0.8">${lead.section}</span></td>
                <td>${this.formatDate(lead.created_at)}</td>
                <td><span class="badge ${lead.status.toLowerCase()}">${lead.status}</span></td>
                <td>
                    <select class="action-select" onchange="AdminLeads.updateLeadStatus(${lead.id}, this.value)">
                        <option value="" disabled selected>Update...</option>
                        <option value="new">Mark New</option>
                        <option value="contacted">Mark Contacted</option>
                        <option value="follow_up">Mark Follow-up</option>
                        <option value="closed">Mark Closed</option>
                    </select>
                </td>
            </tr>
        `).join('');
    }

    static async updateLeadStatus(id, status) {
        const res = await Auth.apiCall(`/admin/leads/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        if (res) this.loadLeads();
    }

    static async loadPartners() {
        const tbody = document.getElementById('partnersTableBody');
        tbody.innerHTML = '<tr><td colspan="6"><div class="loader"></div></td></tr>';

        const res = await Auth.apiCall('/admin/partners?page=1&size=50');
        if (!res) return;

        const partners = await res.json();

        if (partners.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No partner applications found.</td></tr>';
            return;
        }

        tbody.innerHTML = partners.map(partner => `
            <tr>
                <td><strong>${partner.name}</strong><br><span style="color: var(--text-muted); font-size: 0.75rem;">${partner.occupation || ''}</span></td>
                <td>${partner.phone}</td>
                <td>${partner.city}</td>
                <td>${this.formatDate(partner.created_at)}</td>
                <td><span class="badge ${partner.status.toLowerCase()}">${partner.status}</span></td>
                <td>
                    <select class="action-select" onchange="AdminLeads.updatePartnerStatus(${partner.id}, this.value)">
                        <option value="" disabled selected>Update...</option>
                        <option value="pending">Mark Pending</option>
                        <option value="approved">Approve</option>
                        <option value="rejected">Reject</option>
                        <option value="on_hold">On Hold</option>
                    </select>
                </td>
            </tr>
        `).join('');
    }

    static async updatePartnerStatus(id, status) {
        const res = await Auth.apiCall(`/admin/partners/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        if (res) this.loadPartners();
    }
}
window.AdminLeads = AdminLeads;
