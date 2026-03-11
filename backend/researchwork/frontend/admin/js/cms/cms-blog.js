/**
 * CMS Blog Module
 * Handles blog post listing and simple markdown/rich text editing stubs.
 */

const CMSBlog = {
    posts: [],

    async loadList() {
        const container = document.getElementById('blogListContainer');
        try {
            container.innerHTML = '<div class="loader"></div>';
            this.posts = await CMS.apiCall('/blog');
            this.renderList();
        } catch (error) {
            container.innerHTML = `<div class="text-danger">Failed to load posts: ${error.message}</div>`;
        }
    },

    renderList() {
        const container = document.getElementById('blogListContainer');
        if (this.posts.length === 0) {
            container.innerHTML = '<div class="text-muted" style="padding: 2rem; text-align: center;">No blog posts found.</div>';
            return;
        }

        const html = `
            <div class="table-container">
                <table aria-label="Blog Posts">
                    <thead>
                        <tr>
                            <th scope="col">Title</th>
                            <th scope="col">Status</th>
                            <th scope="col">Published At</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.posts.map(post => `
                            <tr>
                                <td><strong>${CMSCards.escapeStr(post.title)}</strong><br><small class="text-muted">${post.slug}</small></td>
                                <td><span class="badge ${post.status}">${post.status}</span></td>
                                <td>${post.published_at ? new Date(post.published_at).toLocaleString() : '-'}</td>
                                <td>
                                    <button class="btn-secondary btn-sm" onclick="CMSBlog.editPost('${post.id}')">Edit</button>
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
        const root = document.getElementById('cmsModalRoot');
        root.innerHTML = `
            <div id="createBlogModal" class="modal active">
                <div class="modal-content">
                    <button class="close-modal" onclick="CMSCards.closeModal('createBlogModal')">&times;</button>
                    <h2>New Blog Post</h2>
                    <form onsubmit="CMSBlog.createPost(event)">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="postTitle" class="form-input" required 
                                onkeyup="document.getElementById('postSlug').value = '/' + this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')">
                        </div>
                        <div class="form-group">
                            <label>Slug</label>
                            <input type="text" id="postSlug" class="form-input" required>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="btn-primary">Begin Writing</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    async createPost(e) {
        e.preventDefault();
        try {
            const newPost = await CMS.apiCall('/blog', {
                method: 'POST',
                body: {
                    title: document.getElementById('postTitle').value,
                    slug: document.getElementById('postSlug').value,
                    content: { blocks: [] },
                    status: 'draft'
                }
            });
            CMSCards.closeModal('createBlogModal');
            await this.loadList();
            this.editPost(newPost.id);
        } catch (error) {
            CMS.toast('Error creating post: ' + error.message, 'error');
        }
    },

    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // Ensure content is parsed (it's stored as JSONB)
        const contentStr = (post.content && post.content.raw) ? post.content.raw : JSON.stringify(post.content || {}, null, 2);

        const root = document.getElementById('cmsModalRoot');
        root.innerHTML = `
            <div id="editBlogModal" class="modal modal-fullscreen active">
                <div class="modal-content">
                    <div class="tab-header" style="margin-bottom: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <button class="btn-secondary btn-sm" onclick="CMSCards.closeModal('editBlogModal')">← Back</button>
                            <h2 style="margin: 0;">Writing: ${CMSCards.escapeStr(post.title)}</h2>
                            <span class="badge ${post.status}">${post.status}</span>
                        </div>
                        <div>
                            <button class="btn-secondary btn-sm" onclick="CMSBlog.generateSummary('${post.id}')">✨ Auto-Summary</button>
                            ${post.status === 'draft' ? `<button class="btn-primary btn-sm" onclick="CMSBlog.publishPost('${post.id}')">Publish</button>` : `<button class="btn-secondary btn-sm" onclick="CMSBlog.unpublishPost('${post.id}')">Unpublish</button>`}
                        </div>
                    </div>
                    <form onsubmit="CMSBlog.savePost(event, '${post.id}')" style="display: flex; flex-direction: column; flex: 1;">
                        <textarea id="postContentRaw" class="form-input" style="flex: 1; font-family: monospace; resize: none; margin-bottom: 1rem;" placeholder="Write your post here in Markdown or raw json...">${CMSCards.escapeStr(contentStr)}</textarea>
                        
                        <div class="form-group">
                            <label>AI Generated Summary (for SEO / Cards)</label>
                            <textarea id="postSummary" class="form-input" rows="2" disabled>${CMSCards.escapeStr(post.ai_summary || '')}</textarea>
                        </div>
                        
                        <div style="text-align: right;">
                            <button type="submit" class="btn-primary">Save Draft</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    async savePost(e, postId) {
        e.preventDefault();
        try {
            const rawContent = document.getElementById('postContentRaw').value;
            await CMS.apiCall(`/blog/${postId}`, {
                method: 'PATCH',
                body: {
                    content: { raw: rawContent }
                }
            });
            CMS.toast('Draft saved');
            this.loadList();
        } catch (error) {
            CMS.toast('Save failed: ' + error.message, 'error');
        }
    },

    async publishPost(postId) {
        try {
            await CMS.apiCall(`/blog/${postId}/publish`, { method: 'POST' });
            CMS.toast('Post published successfully');
            CMSCards.closeModal('editBlogModal');
            this.loadList();
        } catch (error) {
            CMS.toast('Publish failed: ' + error.message, 'error');
        }
    },

    async unpublishPost(postId) {
        try {
            await CMS.apiCall(`/blog/${postId}`, { method: 'PATCH', body: { status: 'draft', published_at: null } });
            CMS.toast('Post reverted to draft');
            CMSCards.closeModal('editBlogModal');
            this.loadList();
        } catch (error) {
            CMS.toast('Failed: ' + error.message, 'error');
        }
    },

    async generateSummary(postId) {
        CMS.toast('Generating summary...', 'info');
        try {
            const result = await CMS.apiCall('/ai/generate', {
                method: 'POST',
                body: { block_type: 'summary', context: 'Generate a short blog summary', language: 'en' }
            });
            document.getElementById('postSummary').value = result.content;
            CMS.toast('Summary updated locally. Save draft to persist.');
        } catch (e) {
            CMS.toast('AI failed: ' + e.message, 'error');
        }
    }
};

window.CMSBlog = CMSBlog;
