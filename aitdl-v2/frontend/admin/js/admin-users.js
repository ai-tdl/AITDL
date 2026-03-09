class AdminUsers {
    static async load() {
        const tbody = document.getElementById('adminsTableBody');
        tbody.innerHTML = '<tr><td colspan="5"><div class="loader"></div></td></tr>';

        const res = await Auth.apiCall('/admin/users');
        if (!res) return;

        const users = await res.json();
        this.render(users);
    }

    static render(users) {
        const tbody = document.getElementById('adminsTableBody');
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No other admins found.</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.email}</strong></td>
                <td><span class="badge" style="background: rgba(148, 163, 184, 0.2); color: #94a3b8;">${user.role}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td><span class="badge ${user.is_active ? 'approved' : 'rejected'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="logout-btn" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.2);" 
                            onclick="AdminUsers.deleteUser(${user.id}, '${user.email}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    static openInviteModal() {
        document.getElementById('inviteModal').classList.add('active');
    }

    static closeInviteModal() {
        document.getElementById('inviteModal').classList.remove('active');
    }

    static async invite(event) {
        event.preventDefault();
        const email = document.getElementById('inviteEmail').value;
        const password = document.getElementById('invitePassword').value;
        const role = document.getElementById('inviteRole').value;

        const res = await Auth.apiCall('/admin/users', {
            method: 'POST',
            body: JSON.stringify({ email, password, role })
        });

        if (res) {
            alert('Admin user created successfully!');
            this.closeInviteModal();
            this.load();
        }
    }

    static async deleteUser(id, email) {
        if (!confirm(`Are you sure you want to remove ${email}?`)) return;

        const res = await Auth.apiCall(`/admin/users/${id}`, {
            method: 'DELETE'
        });

        if (res) {
            alert('User removed');
            this.load();
        }
    }
}
window.AdminUsers = AdminUsers;
