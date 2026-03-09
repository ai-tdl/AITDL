/**
 * CMS Forms Module
 * Handles form configuration and submission viewing
 */

const CMSForms = {
    forms: [],

    async loadList() {
        const container = document.getElementById('formsListContainer');
        try {
            container.innerHTML = '<div class="loader"></div>';
            this.forms = await CMS.apiCall('/forms');
            this.renderList();
        } catch (error) {
            container.innerHTML = `<div class="text-danger">Failed to load forms: ${error.message}</div>`;
        }
    },

    renderList() {
        const container = document.getElementById('formsListContainer');
        if (this.forms.length === 0) {
            container.innerHTML = '<div class="text-muted" style="padding: 2rem; text-align: center;">No forms configured. Create one to start collecting submissions.</div>';
            return;
        }

        const html = `
            <div class="table-container">
                <table aria-label="CMS Forms">
                    <thead>
                        <tr>
                            <th scope="col">Form Title</th>
                            <th scope="col">Notification Email</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.forms.map(form => `
                            <tr>
                                <td><strong>${CMSCards.escapeStr(form.title)}</strong><br><small class="text-muted">ID: ${form.id}</small></td>
                                <td>${CMSCards.escapeStr(form.notify_email || 'None')}</td>
                                <td><span class="badge ${form.enabled ? 'published' : 'draft'}">${form.enabled ? 'Active' : 'Disabled'}</span></td>
                                <td>
                                    <button class="btn-secondary btn-sm" onclick="CMSForms.viewSubmissions('${form.id}')">View Submissions</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        container.innerHTML = html;
    },

    openCreateModal() {
        // Simplified form builder stub for V1
        const root = document.getElementById('cmsModalRoot');
        root.innerHTML = `
            <div id="createFormModal" class="modal active">
                <div class="modal-content">
                    <button class="close-modal" onclick="CMSCards.closeModal('createFormModal')">&times;</button>
                    <h2>Create New Form</h2>
                    <form onsubmit="CMSForms.createForm(event)">
                        <div class="form-group">
                            <label>Form Title (Internal)</label>
                            <input type="text" id="formTitle" class="form-input" required placeholder="e.g. Contact Form V2">
                        </div>
                        <div class="form-group">
                            <label>Notification Email (Optional)</label>
                            <input type="email" id="formEmail" class="form-input" placeholder="sales@aitdl.com">
                        </div>
                        <div class="form-group">
                            <label>Fields Configuration (JSON)</label>
                            <p class="text-muted" style="font-size: 0.75rem; margin-top: -0.25rem;">Standard schema: [{name, type, required, label}]</p>
                            <textarea id="formFields" class="form-input" rows="8" style="font-family: monospace;">[
  {"name": "name", "type": "text", "required": true, "label": "Full Name"},
  {"name": "email", "type": "email", "required": true, "label": "Email Address"},
  {"name": "message", "type": "textarea", "required": true, "label": "Your Message"}
]</textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="btn-primary">Create Form</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    async createForm(e) {
        e.preventDefault();
        try {
            let fieldsJson = [];
            try {
                fieldsJson = JSON.parse(document.getElementById('formFields').value);
            } catch (err) {
                return CMS.toast('Invalid JSON format in Fields Configuration.', 'error');
            }

            await CMS.apiCall('/forms', {
                method: 'POST',
                body: {
                    title: document.getElementById('formTitle').value,
                    fields: fieldsJson,
                    notify_email: document.getElementById('formEmail').value || null,
                    enabled: true
                }
            });
            CMSCards.closeModal('createFormModal');
            CMS.toast('Form created successfully!');
            this.loadList();
        } catch (error) {
            CMS.toast('Error creating form: ' + error.message, 'error');
        }
    },

    async viewSubmissions(formId) {
        CMS.toast('Loading submissions...', 'info');
        try {
            const subs = await CMS.apiCall(`/forms/${formId}/submissions`);
            if (subs.length === 0) {
                CMS.toast('No submissions found for this form.', 'info');
                return;
            }

            const headerKeys = Object.keys(subs[0].data || {});

            const root = document.getElementById('cmsModalRoot');
            root.innerHTML = `
                <div id="viewSubmissionsModal" class="modal modal-fullscreen active">
                    <div class="modal-content" style="max-width: 90vw;">
                        <button class="close-modal" onclick="CMSCards.closeModal('viewSubmissionsModal')">&times;</button>
                        <h2>Form Submissions</h2>
                        <div class="table-container" style="margin-top: 1rem; overflow-x: auto; max-height: 70vh;">
                            <table style="white-space: nowrap;">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        ${headerKeys.map(k => `<th>${CMSCards.escapeStr(k)}</th>`).join('')}
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${subs.map(s => `
                                        <tr>
                                            <td>${new Date(s.submitted_at).toLocaleString()}</td>
                                            ${headerKeys.map(k => `<td>${CMSCards.escapeStr(s.data[k] || '')}</td>`).join('')}
                                            <td><span class="badge ${s.status === 'new' ? '' : 'status-published'}">${s.status}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            CMS.toast('Failed to load submissions: ' + error.message, 'error');
        }
    }
};

window.CMSForms = CMSForms;
