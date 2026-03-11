/**
 * AdminUsers — admin-users.js
 *
 * Purpose  : Manage admin user accounts in the Admin Management tab —
 *            loading, rendering, inviting new admins, and deleting existing ones.
 *
 * Dependencies: Auth (admin-auth.js) must be loaded first.
 * Access level : Superadmin only (enforced server-side).
 */

class AdminUsers {

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Fetch and render the full admin user list.
     */
    static async load() {
        const tbody = document.getElementById('adminsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="5"><div class="loader"></div></td></tr>';

        const res = await Auth.apiCall('/admin/users');
        if (!res) return;

        const users = await res.json();
        this._render(users);
    }

    /**
     * Open the invite-new-admin modal.
     */
    static openInviteModal() {
        const modal = document.getElementById('inviteModal');
        if (!modal) return;
        modal.hidden = false;
        modal.classList.add('active');
    }

    /**
     * Close the invite modal and reset its form.
     */
    static closeInviteModal() {
        const modal = document.getElementById('inviteModal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.hidden = true;
        modal.querySelector('form')?.reset();
    }

    /**
     * Submit the invite form to create a new admin account.
     *
     * @param {SubmitEvent} event
     */
    static async invite(event) {
        event.preventDefault();

        const email = document.getElementById('inviteEmail').value.trim().toLowerCase();
        const password = document.getElementById('invitePassword').value;
        const role = document.getElementById('inviteRole').value;

        if (!email || !password) {
            alert('Email and password are required.');
            return;
        }

        const res = await Auth.apiCall('/admin/users', {
            method: 'POST',
            body: JSON.stringify({ email, password, role }),
        });

        if (res) {
            alert('Admin account created successfully.');
            this.closeInviteModal();
            await this.load();
        }
    }

    /**
     * Delete an admin account after confirmation.
     *
     * @param {number} id
     * @param {string} email - Shown in the confirmation prompt
     */
    static async deleteUser(id, email) {
        if (!confirm(`Permanently remove admin "${email}"? This cannot be undone.`)) return;

        const res = await Auth.apiCall(`/admin/users/${id}`, { method: 'DELETE' });

        if (res) {
            alert(`Admin "${email}" has been removed.`);
            await this.load();
        }
    }

    // ── Private: Rendering ────────────────────────────────────────────────────

    /**
     * Render the admin users table.
     *
     * @param {object[]} users
     */
    static _render(users) {
        const tbody = document.getElementById('adminsTableBody');
        if (!tbody) return;

        if (!users.length) {
            tbody.innerHTML = `
                <tr>
                  <td colspan="5" style="text-align:center; color:var(--text-muted); padding:2rem;">
                    No admin users found.
                  </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = users.map((user) => `
            <tr>
                <td data-label="Email"><strong>${user.email}</strong></td>
                <td data-label="Role">
                    <span class="badge" style="background:rgba(148,163,184,0.2); color:#94a3b8;">
                        ${user.role}
                    </span>
                </td>
                <td data-label="Joined">${new Date(user.created_at).toLocaleDateString()}</td>
                <td data-label="Status">
                    <span class="badge ${user.is_active ? 'approved' : 'rejected'}">
                        ${user.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td data-label="Actions" class="actions-cell">
                    <button
                        class="logout-btn"
                        style="color:var(--danger); border-color:rgba(239,68,68,0.2);"
                        onclick="AdminUsers.deleteUser(${user.id}, '${user.email}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

window.AdminUsers = AdminUsers;
