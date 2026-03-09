class AdminLeads {
    static formatDate(isoStr) {
        return new Date(isoStr).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    }

    static currentLeads = [];
    static currentPartners = [];

    static async loadLeads() {
        const tbody = document.getElementById('leadsTableBody');
        tbody.innerHTML = '<tr><td colspan="7"><div class="loader"></div></td></tr>';

        const res = await Auth.apiCall('/admin/leads?page=1&size=500');
        if (!res) return;

        window.currentLeads = await res.json();
        this.renderLeads(window.currentLeads);
    }

    static renderLeads(leadsData) {
        const tbody = document.getElementById('leadsTableBody');
        if (leadsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No leads found.</td></tr>';
            return;
        }

        tbody.innerHTML = leadsData.map(lead => `
            <tr>
                <td><input type="checkbox" class="lead-checkbox" value="${lead.id}"></td>
                <td><strong>${lead.name}</strong><br><span style="color: var(--text-muted); font-size: 0.75rem;">${lead.business || ''}</span></td>
                <td><a href="mailto:${lead.email}?subject=AITDL Inquiry" style="color: var(--accent); text-decoration: none;">Contact Email</a><br>${lead.phone}</td>
                <td><span style="opacity: 0.8">${lead.section}</span></td>
                <td>${this.formatDate(lead.created_at)}</td>
                <td><span class="badge ${lead.status.toLowerCase()}">${lead.status}</span></td>
                <td style="display: flex; gap: 0.5rem; border-bottom: none;">
                    <select class="action-select" onchange="AdminLeads.updateLeadStatus(${lead.id}, this.value)">
                        <option value="" disabled selected>Update...</option>
                        <option value="new">Mark New</option>
                        <option value="contacted">Mark Contacted</option>
                        <option value="follow_up">Mark Follow-up</option>
                        <option value="closed">Mark Closed</option>
                    </select>
                    <button class="logout-btn" onclick="AdminLeads.openModal('lead', ${lead.id})">View</button>
                </td>
            </tr>
        `).join('');
    }

    static filterLeads() {
        const searchTerm = document.getElementById('leadsSearch').value.toLowerCase();
        const statusFilter = document.getElementById('leadsFilter').value;

        const filtered = window.currentLeads.filter(lead => {
            const matchesSearch = !searchTerm ||
                lead.name.toLowerCase().includes(searchTerm) ||
                lead.phone.includes(searchTerm) ||
                (lead.business && lead.business.toLowerCase().includes(searchTerm));

            const matchesStatus = statusFilter === 'all' || lead.status.toLowerCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.renderLeads(filtered);
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
        tbody.innerHTML = '<tr><td colspan="7"><div class="loader"></div></td></tr>';

        const res = await Auth.apiCall('/admin/partners?page=1&size=500');
        if (!res) return;

        window.currentPartners = await res.json();
        this.renderPartners(window.currentPartners);
    }

    static renderPartners(partnersData) {
        const tbody = document.getElementById('partnersTableBody');
        if (partnersData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No partner applications found.</td></tr>';
            return;
        }

        tbody.innerHTML = partnersData.map(partner => `
            <tr>
                <td><input type="checkbox" class="partner-checkbox" value="${partner.id}"></td>
                <td><strong>${partner.name}</strong><br><span style="color: var(--text-muted); font-size: 0.75rem;">${partner.occupation || ''}</span></td>
                <td><a href="mailto:${partner.email}?subject=AITDL Partnership" style="color: var(--accent); text-decoration: none;">Reply Email</a><br>${partner.phone}</td>
                <td>${partner.city}</td>
                <td>${this.formatDate(partner.created_at)}</td>
                <td><span class="badge ${partner.status.toLowerCase()}">${partner.status}</span></td>
                <td style="display: flex; gap: 0.5rem; border-bottom: none;">
                    <select class="action-select" onchange="AdminLeads.updatePartnerStatus(${partner.id}, this.value)">
                        <option value="" disabled selected>Update...</option>
                        <option value="pending">Mark Pending</option>
                        <option value="approved">Approve</option>
                        <option value="rejected">Reject</option>
                        <option value="on_hold">On Hold</option>
                    </select>
                    <button class="logout-btn" onclick="AdminLeads.openModal('partner', ${partner.id})">View</button>
                </td>
            </tr>
        `).join('');
    }

    static filterPartners() {
        const searchTerm = document.getElementById('partnersSearch').value.toLowerCase();
        const statusFilter = document.getElementById('partnersFilter').value;

        const filtered = window.currentPartners.filter(partner => {
            const matchesSearch = !searchTerm ||
                partner.name.toLowerCase().includes(searchTerm) ||
                partner.phone.includes(searchTerm) ||
                partner.city.toLowerCase().includes(searchTerm) ||
                (partner.occupation && partner.occupation.toLowerCase().includes(searchTerm));

            const matchesStatus = statusFilter === 'all' || partner.status.toLowerCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.renderPartners(filtered);
    }

    static async updatePartnerStatus(id, status) {
        const res = await Auth.apiCall(`/admin/partners/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        if (res) this.loadPartners();
    }

    static exportCSV(type) {
        const data = type === 'leads' ? window.currentLeads : window.currentPartners;
        if (!data || data.length === 0) return alert('No data to export');

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        for (const row of data) {
            const values = headers.map(header => {
                const escaped = ('' + (row[header] || '')).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `aitdl_${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Modal Logic
    static openModal(type, id) {
        const item = (type === 'lead' ? window.currentLeads : window.currentPartners).find(i => i.id === id);
        if (!item) return;

        document.getElementById('modalItemId').value = id;
        document.getElementById('modalItemType').value = type;
        document.getElementById('modalTitle').innerText = type === 'lead' ? 'Lead Details' : 'Partner Application';
        document.getElementById('modalNotesText').value = item.admin_notes || '';

        const body = document.getElementById('modalBody');

        let html = '<div class="detail-grid">';
        for (const [key, val] of Object.entries(item)) {
            if (['id', 'admin_notes', 'contacted_at', 'reviewed_at'].includes(key)) continue;

            const isFull = ['message'].includes(key);
            html += `
                <div class="detail-item ${isFull ? 'detail-full' : ''}">
                    <div class="detail-label">${key.replace('_', ' ')}</div>
                    <div class="detail-value">${val || 'N/A'}</div>
                </div>
            `;
        }
        html += '</div>';
        body.innerHTML = html;

        document.getElementById('detailModal').classList.add('active');
    }

    static closeModal() {
        document.getElementById('detailModal').classList.remove('active');
    }

    static async saveNotes() {
        const id = document.getElementById('modalItemId').value;
        const type = document.getElementById('modalItemType').value;
        const notes = document.getElementById('modalNotesText').value;

        const endpoint = type === 'lead' ? `/admin/leads/${id}` : `/admin/partners/${id}`;
        const res = await Auth.apiCall(endpoint, {
            method: 'PATCH',
            body: JSON.stringify({ admin_notes: notes })
        });

        if (res) {
            // Update local state and reload tab
            const list = type === 'lead' ? window.currentLeads : window.currentPartners;
            const item = list.find(i => i.id == id);
            if (item) item.admin_notes = notes;

            alert('Notes saved successfully');
            this.closeModal();
            type === 'lead' ? this.loadLeads() : this.loadPartners();
        }
    }

    static toggleAll(type, checked) {
        document.querySelectorAll(`.${type}-checkbox`).forEach(cb => {
            cb.checked = checked;
        });
        this.updateBulkToolbarVisibility(type);
    }

    static updateBulkToolbarVisibility(type) {
        const checkedCount = document.querySelectorAll(`.${type}-checkbox:checked`).length;
        const toolbar = document.getElementById(`${type}sBulkToolbar`);
        if (toolbar) {
            toolbar.style.display = checkedCount > 0 ? 'flex' : 'none';
        }
    }

    static async bulkUpdate(type, status) {
        const checked = Array.from(document.querySelectorAll(`.${type}-checkbox:checked`)).map(cb => cb.value);
        if (checked.length === 0) return;

        if (!confirm(`Update ${checked.length} items to ${status}?`)) return;

        const endpoint = type === 'lead' ? '/admin/leads' : '/admin/partners';

        let successCount = 0;
        for (const id of checked) {
            const res = await Auth.apiCall(`${endpoint}/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            if (res) successCount++;
        }

        alert(`Successfully updated ${successCount} items.`);
        type === 'lead' ? this.loadLeads() : this.loadPartners();
    }

    static bulkExport(type) {
        const checkedIds = Array.from(document.querySelectorAll(`.${type}-checkbox:checked`)).map(cb => cb.value);
        const allData = type === 'lead' ? window.currentLeads : window.currentPartners;
        const selectedData = allData.filter(item => checkedIds.includes(item.id.toString()));

        // Re-use existing exportCSV logic with filtered data
        const oldLeads = window.currentLeads;
        const oldPals = window.currentPartners;

        if (type === 'lead') window.currentLeads = selectedData;
        else window.currentPartners = selectedData;

        this.exportCSV(type);

        // Restore
        window.currentLeads = oldLeads;
        window.currentPartners = oldPals;
    }
}

// Add event delegation for checkboxes
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('lead-checkbox')) AdminLeads.updateBulkToolbarVisibility('lead');
    if (e.target.classList.contains('partner-checkbox')) AdminLeads.updateBulkToolbarVisibility('partner');
});

window.AdminLeads = AdminLeads;
