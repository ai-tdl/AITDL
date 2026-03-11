/**
 * AdminLeads — admin-leads.js
 *
 * Purpose  : Manage the Leads and Partner Applications tables in the admin
 *            dashboard — fetching, rendering, filtering, status updates,
 *            bulk operations, CSV export, and the detail modal.
 *
 * Dependencies: Auth (admin-auth.js) must be loaded first.
 * Side effects: Mutates DOM; makes authenticated API calls.
 */

// ── Module-level state ────────────────────────────────────────────────────────
// Held at module scope (not window) for clearer ownership.
let _currentLeads = [];
let _currentPartners = [];

// ── Utility helpers ───────────────────────────────────────────────────────────

/**
 * Format an ISO date string into a human-readable short date.
 *
 * @param {string} isoStr - ISO 8601 date string
 * @returns {string} Formatted date (e.g. "Mar 9, 2026")
 */
const formatDate = (isoStr) =>
    new Date(isoStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

/**
 * Render a loading spinner inside a table body cell.
 *
 * @param {HTMLElement} tbody
 * @param {number} colspan
 */
const showTableLoader = (tbody, colspan) => {
    tbody.innerHTML = `<tr><td colspan="${colspan}"><div class="loader"></div></td></tr>`;
};

/**
 * Render an empty-state message inside a table body cell.
 *
 * @param {HTMLElement} tbody
 * @param {number}      colspan
 * @param {string}      message
 */
const showTableEmpty = (tbody, colspan, message) => {
    tbody.innerHTML = `
        <tr>
          <td colspan="${colspan}" style="text-align:center; color:var(--text-muted); padding:2rem;">
            ${message}
          </td>
        </tr>`;
};

/**
 * Build the action dropdown cells shared between leads and partners tables.
 *
 * @param {string}   type       - 'lead' | 'partner'
 * @param {number}   id
 * @param {string[]} options    - [{value, label}, ...]
 * @returns {string} HTML string for <td>
 */
const buildActionCell = (type, id, options) => {
    const selectOptions = options
        .map(({ value, label }) => `<option value="${value}">${label}</option>`)
        .join('');

    const handler =
        type === 'lead'
            ? `AdminLeads.updateLeadStatus(${id}, this.value)`
            : `AdminLeads.updatePartnerStatus(${id}, this.value)`;

    return `
        <td data-label="Action" class="actions-cell">
            <select class="action-select" onchange="${handler}">
                <option value="" disabled selected>Update…</option>
                ${selectOptions}
            </select>
            <button class="logout-btn" onclick="AdminLeads.openModal('${type}', ${id})">View</button>
        </td>`;
};

// ── Lead status options ───────────────────────────────────────────────────────

const LEAD_STATUS_OPTIONS = [
    { value: 'new', label: 'Mark New' },
    { value: 'contacted', label: 'Mark Contacted' },
    { value: 'follow_up', label: 'Mark Follow-up' },
    { value: 'closed', label: 'Mark Closed' },
];

const PARTNER_STATUS_OPTIONS = [
    { value: 'pending', label: 'Mark Pending' },
    { value: 'approved', label: 'Approve' },
    { value: 'rejected', label: 'Reject' },
    { value: 'on_hold', label: 'On Hold' },
];

// ── CSV export helper ─────────────────────────────────────────────────────────

/**
 * Convert an array of objects to a CSV blob download.
 *
 * @param {object[]} data     - Rows to export
 * @param {string}   filename - Download filename (without extension)
 */
const downloadCSV = (data, filename) => {
    if (!data.length) {
        alert('No data to export.');
        return;
    }

    const headers = Object.keys(data[0]);
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
        headers.join(','),
        ...data.map((row) => headers.map((h) => escape(row[h])).join(',')),
    ];

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), {
        href: url,
        download: `aitdl_${filename}_${new Date().toISOString().split('T')[0]}.csv`,
    });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);   // Free memory immediately
};

// ── AdminLeads class ──────────────────────────────────────────────────────────

class AdminLeads {

    // ── Leads ─────────────────────────────────────────────────────────────────

    /**
     * Fetch all contact leads from the API and render them.
     */
    static async loadLeads() {
        const tbody = document.getElementById('leadsTableBody');
        showTableLoader(tbody, 7);

        const res = await Auth.apiCall('/admin/leads?page=1&size=500');
        if (!res) return;

        _currentLeads = await res.json();
        this.renderLeads(_currentLeads);
    }

    /**
     * Render a list of leads into the table body.
     *
     * @param {object[]} leads
     */
    static renderLeads(leads) {
        const tbody = document.getElementById('leadsTableBody');

        if (!leads.length) {
            showTableEmpty(tbody, 7, 'No leads found.');
            return;
        }

        tbody.innerHTML = leads.map((lead) => `
            <tr>
                <td data-label="Select">
                    <input type="checkbox" class="lead-checkbox" value="${lead.id}">
                </td>
                <td data-label="Name">
                    <strong>${lead.name}</strong>
                    <br>
                    <span style="color:var(--text-muted); font-size:0.75rem;">${lead.business ?? ''}</span>
                </td>
                <td data-label="Contact">
                    <a href="mailto:${lead.email}?subject=AITDL Inquiry"
                       style="color:var(--accent); text-decoration:none;">Email</a>
                    &nbsp;/&nbsp;${lead.phone}
                </td>
                <td data-label="Section">${lead.section}</td>
                <td data-label="Date">${formatDate(lead.created_at)}</td>
                <td data-label="Status">
                    <span class="badge ${lead.status.toLowerCase()}">${lead.status}</span>
                </td>
                ${buildActionCell('lead', lead.id, LEAD_STATUS_OPTIONS)}
            </tr>
        `).join('');
    }

    /**
     * Filter rendered leads by search term and status dropdown.
     */
    static _leadsSearchTimeout;
    static filterLeads() {
        clearTimeout(this._leadsSearchTimeout);
        this._leadsSearchTimeout = setTimeout(() => {
            const term = document.getElementById('leadsSearch').value.toLowerCase();
            const status = document.getElementById('leadsFilter').value;

            const filtered = _currentLeads.filter((lead) => {
                const matchesSearch =
                    !term ||
                    lead.name.toLowerCase().includes(term) ||
                    lead.phone.includes(term) ||
                    (lead.email && lead.email.toLowerCase().includes(term)) ||
                    (lead.business && lead.business.toLowerCase().includes(term));

                const matchesStatus = status === 'all' || lead.status.toLowerCase() === status;

                return matchesSearch && matchesStatus;
            });

            this.renderLeads(filtered);
        }, 300);
    }

    /**
     * Patch a single lead's status.
     *
     * @param {number} id
     * @param {string} status
     */
    static async updateLeadStatus(id, status) {
        if (!status) return;
        const res = await Auth.apiCall(`/admin/leads/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        if (res) {
            // Update local state and trigger re-render
            const lead = _currentLeads.find((l) => l.id === id);
            if (lead) lead.status = status;
            this.filterLeads();
        }
    }

    // ── Partners ──────────────────────────────────────────────────────────────

    /**
     * Fetch all partner applications from the API and render them.
     */
    static async loadPartners() {
        const tbody = document.getElementById('partnersTableBody');
        showTableLoader(tbody, 7);

        const res = await Auth.apiCall('/admin/partners?page=1&size=500');
        if (!res) return;

        _currentPartners = await res.json();
        this.renderPartners(_currentPartners);
    }

    /**
     * Render a list of partner applications into the table body.
     *
     * @param {object[]} partners
     */
    static renderPartners(partners) {
        const tbody = document.getElementById('partnersTableBody');

        if (!partners.length) {
            showTableEmpty(tbody, 7, 'No partner applications found.');
            return;
        }

        tbody.innerHTML = partners.map((partner) => `
            <tr>
                <td data-label="Select">
                    <input type="checkbox" class="partner-checkbox" value="${partner.id}">
                </td>
                <td data-label="Applicant">
                    <strong>${partner.name}</strong>
                    <br>
                    <span style="color:var(--text-muted); font-size:0.75rem;">${partner.occupation ?? ''}</span>
                </td>
                <td data-label="Contact">
                    <a href="mailto:${partner.email}?subject=AITDL Partnership"
                       style="color:var(--accent); text-decoration:none;">Email</a>
                    &nbsp;/&nbsp;${partner.phone}
                </td>
                <td data-label="City">${partner.city}</td>
                <td data-label="Date">${formatDate(partner.created_at)}</td>
                <td data-label="Status">
                    <span class="badge ${partner.status.toLowerCase()}">${partner.status}</span>
                </td>
                ${buildActionCell('partner', partner.id, PARTNER_STATUS_OPTIONS)}
            </tr>
        `).join('');
    }

    /**
     * Filter rendered partner applications by search term and status dropdown.
     */
    static _partnersSearchTimeout;
    static filterPartners() {
        clearTimeout(this._partnersSearchTimeout);
        this._partnersSearchTimeout = setTimeout(() => {
            const term = document.getElementById('partnersSearch').value.toLowerCase();
            const status = document.getElementById('partnersFilter').value;

            const filtered = _currentPartners.filter((partner) => {
                const matchesSearch =
                    !term ||
                    partner.name.toLowerCase().includes(term) ||
                    partner.phone.includes(term) ||
                    partner.city.toLowerCase().includes(term) ||
                    (partner.occupation && partner.occupation.toLowerCase().includes(term));

                const matchesStatus = status === 'all' || partner.status.toLowerCase() === status;

                return matchesSearch && matchesStatus;
            });

            this.renderPartners(filtered);
        }, 300);
    }

    /**
     * Patch a single partner application's status.
     *
     * @param {number} id
     * @param {string} status
     */
    static async updatePartnerStatus(id, status) {
        if (!status) return;
        const res = await Auth.apiCall(`/admin/partners/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        if (res) {
            // Update local state and trigger re-render
            const partner = _currentPartners.find((p) => p.id === id);
            if (partner) partner.status = status;
            this.filterPartners();
        }
    }

    // ── CSV Export ────────────────────────────────────────────────────────────

    /**
     * Export the currently loaded leads or partners to CSV.
     *
     * @param {'leads'|'partners'} type
     */
    static exportCSV(type) {
        const data = type === 'leads' ? _currentLeads : _currentPartners;
        downloadCSV(data, type);
    }

    // ── Modal ─────────────────────────────────────────────────────────────────

    /**
     * Open the detail modal for a lead or partner.
     *
     * @param {'lead'|'partner'} type
     * @param {number} id
     */
    static openModal(type, id) {
        const list = type === 'lead' ? _currentLeads : _currentPartners;
        const item = list.find((i) => i.id === id);
        if (!item) return;

        document.getElementById('modalItemId').value = id;
        document.getElementById('modalItemType').value = type;
        document.getElementById('modalTitle').innerText =
            type === 'lead' ? 'Lead Details' : 'Partner Application';
        document.getElementById('modalNotesText').value = item.admin_notes ?? '';

        // Build detail grid — skip internal/audit fields
        const SKIP_FIELDS = new Set(['id', 'admin_notes', 'contacted_at', 'reviewed_at']);
        const FULL_FIELDS = new Set(['message']);

        const gridItems = Object.entries(item)
            .filter(([key]) => !SKIP_FIELDS.has(key))
            .map(([key, val]) => {
                const isFull = FULL_FIELDS.has(key);
                return `
                    <div class="detail-item ${isFull ? 'detail-full' : ''}">
                        <div class="detail-label">${key.replace(/_/g, ' ')}</div>
                        <div class="detail-value">${val ?? 'N/A'}</div>
                    </div>`;
            })
            .join('');

        document.getElementById('modalBody').innerHTML =
            `<div class="detail-grid">${gridItems}</div>`;

        // Must remove [hidden] before adding .active — hidden overrides all CSS
        const modal = document.getElementById('detailModal');
        modal.hidden = false;
        modal.classList.add('active');
    }

    /** Close the detail modal. */
    static closeModal() {
        const modal = document.getElementById('detailModal');
        modal.classList.remove('active');
        modal.hidden = true;
    }

    /**
     * Save the internal notes from the modal and refresh the table.
     */
    static async saveNotes() {
        const id = document.getElementById('modalItemId').value;
        const type = document.getElementById('modalItemType').value;
        const notes = document.getElementById('modalNotesText').value;

        if (!id || !type) return;

        const endpoint = type === 'lead' ? `/admin/leads/${id}` : `/admin/partners/${id}`;
        const res = await Auth.apiCall(endpoint, {
            method: 'PATCH',
            body: JSON.stringify({ admin_notes: notes }),
        });

        if (res) {
            // Keep local state in sync without a full reload
            const list = type === 'lead' ? _currentLeads : _currentPartners;
            const item = list.find((i) => i.id == id);
            if (item) item.admin_notes = notes;

            this.closeModal();
            type === 'lead' ? await this.loadLeads() : await this.loadPartners();
        }
    }

    // ── Bulk operations ───────────────────────────────────────────────────────

    /**
     * Toggle all checkboxes in a table section.
     *
     * @param {'lead'|'partner'} type
     * @param {boolean} checked
     */
    static toggleAll(type, checked) {
        document.querySelectorAll(`.${type}-checkbox`).forEach((cb) => {
            cb.checked = checked;
        });
        this._updateBulkToolbar(type);
    }

    /**
     * Show or hide the bulk-action toolbar based on checked count.
     *
     * @param {'lead'|'partner'} type
     */
    static _updateBulkToolbar(type) {
        const checkedCount = document.querySelectorAll(`.${type}-checkbox:checked`).length;
        const toolbar = document.getElementById(`${type}sBulkToolbar`);
        if (!toolbar) return;
        // Use hidden attribute (matches HTML default) instead of style.display
        toolbar.hidden = checkedCount === 0;
    }

    /**
     * Batch-update the status of all selected items.
     *
     * @param {'lead'|'partner'} type
     * @param {string} status  - Target status value
     */
    static async bulkUpdate(type, status) {
        const checked = this._getCheckedIds(type);
        if (!checked.length) return;
        if (!confirm(`Update ${checked.length} item(s) to "${status}"?`)) return;

        const endpoint = type === 'lead' ? '/admin/leads' : '/admin/partners';
        let successCount = 0;

        // Run sequentially to avoid overwhelming the API
        for (const id of checked) {
            const res = await Auth.apiCall(`${endpoint}/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            if (res) successCount++;
        }

        alert(`Updated ${successCount} of ${checked.length} item(s).`);

        // Update local state without full reload
        const list = type === 'lead' ? _currentLeads : _currentPartners;
        checked.forEach((id) => {
            const item = list.find((i) => String(i.id) === String(id));
            if (item) item.status = status;
        });

        // Uncheck all and re-render
        this.toggleAll(type, false);
        type === 'lead' ? this.filterLeads() : this.filterPartners();
    }

    /**
     * Export only the selected (checked) rows.
     *
     * @param {'lead'|'partner'} type
     */
    static bulkExport(type) {
        const checkedIds = this._getCheckedIds(type);
        const allData = type === 'lead' ? _currentLeads : _currentPartners;
        const selected = allData.filter((item) => checkedIds.includes(String(item.id)));
        downloadCSV(selected, `${type}s_selected`);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Collect the IDs of all checked checkboxes for a given type.
     *
     * @param {'lead'|'partner'} type
     * @returns {string[]}
     */
    static _getCheckedIds(type) {
        return Array.from(
            document.querySelectorAll(`.${type}-checkbox:checked`),
        ).map((cb) => cb.value);
    }
}

// ── Event delegation for checkboxes ──────────────────────────────────────────
// Single listener handles dynamic rows, avoiding per-row handler attachment.
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('lead-checkbox')) {
        AdminLeads._updateBulkToolbar('lead');
    } else if (e.target.classList.contains('partner-checkbox')) {
        AdminLeads._updateBulkToolbar('partner');
    }
});

// Global exposure for inline HTML handlers
window.AdminLeads = AdminLeads;
