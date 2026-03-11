/**
 * CMS Pages & Block Builder Integration
 */

const CMSPages = {
    // Current state
    pages: [],
    currentPage: null,
    currentBlocks: [],

    /**
     * Load the list of pages for the active workspace
     */
    async loadList() {
        const tbody = document.getElementById('pagesTableBody');
        try {
            tbody.innerHTML = '<tr><td colspan="6"><div class="loader"></div></td></tr>';
            this.pages = await CMS.apiCall('/pages');
            this.renderList();
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Failed to load pages: ${error.message}</td></tr>`;
        }
    },

    /**
     * Render the table of pages
     */
    renderList() {
        const tbody = document.getElementById('pagesTableBody');
        const searchTerm = document.getElementById('pagesSearch').value.toLowerCase();

        const filtered = this.pages.filter(p =>
            p.title.toLowerCase().includes(searchTerm) ||
            p.slug.toLowerCase().includes(searchTerm)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center" style="padding: 2rem;">No pages found. Create your first page!</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(p => `
            <tr>
                <td><strong>${this.escapeStr(p.title)}</strong></td>
                <td class="text-muted">${this.escapeStr(p.slug)}</td>
                <td><span class="badge ${p.template}">${p.template}</span></td>
                <td>
                    <span class="status-indicator status-${p.status}"></span>
                    ${p.status.toUpperCase()}
                </td>
                <td class="text-muted">${new Date(p.updated_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn-secondary btn-sm" onclick="CMSPages.openEditor('${p.id}')">Edit Blocks</button>
                    ${p.status !== 'published' ?
                `<button class="btn-primary btn-sm" onclick="CMSPages.publishPage('${p.id}')">Publish</button>` :
                `<button class="btn-secondary btn-sm" onclick="window.open('/${p.slug}', '_blank')">View</button>`
            }
                </td>
            </tr>
        `).join('');
    },

    filterList() {
        this.renderList();
    },

    /**
     * Open the Create Page Modal
     */
    openCreateModal() {
        const root = document.getElementById('cmsModalRoot');
        root.innerHTML = `
            <div id="createPageModal" class="modal active">
                <div class="modal-content">
                    <button class="close-modal" onclick="CMSPages.closeModal('createPageModal')">&times;</button>
                    <h2>Create New Page</h2>
                    <form onsubmit="CMSPages.createPage(event)">
                        <div class="form-group">
                            <label>Page Title</label>
                            <input type="text" id="newPageTitle" class="form-input" required 
                                onkeyup="document.getElementById('newPageSlug').value = '/' + this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')">
                        </div>
                        <div class="form-group">
                            <label>URL Slug</label>
                            <input type="text" id="newPageSlug" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label>Template</label>
                            <select id="newPageTemplate" class="form-input">
                                <option value="landing">Landing Page (Blocks)</option>
                                <option value="blog">Blog Layout</option>
                                <option value="custom">Custom HTML</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="btn-primary">Create & Edit</button>
                            <button type="button" class="btn-secondary" onclick="CMSPages.closeModal('createPageModal')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Submit new page to API
     */
    async createPage(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const origText = btn.textContent;
        btn.textContent = 'Creating...';
        btn.disabled = true;

        try {
            const newPage = await CMS.apiCall('/pages', {
                method: 'POST',
                body: {
                    title: document.getElementById('newPageTitle').value,
                    slug: document.getElementById('newPageSlug').value,
                    template: document.getElementById('newPageTemplate').value,
                    status: 'draft'
                }
            });

            this.closeModal('createPageModal');
            CMS.toast('Page created successfully');
            await this.loadList();
            this.openEditor(newPage.id);
        } catch (error) {
            CMS.toast(error.message, 'error');
            btn.textContent = origText;
            btn.disabled = false;
        }
    },

    /**
     * Open the Full-Screen Page Editor (Block Builder)
     */
    async openEditor(pageId) {
        this.currentPage = this.pages.find(p => p.id === pageId);
        if (!this.currentPage) return;

        const root = document.getElementById('cmsModalRoot');

        // Scaffold the editor HTML
        root.innerHTML = `
            <div id="pageEditorModal" class="modal modal-fullscreen active">
                <div class="modal-content">
                    <div class="tab-header" style="margin-bottom: 0; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <button class="btn-secondary btn-sm" onclick="CMSPages.closeModal('pageEditorModal')">← Back</button>
                            <h2 style="margin: 0;">Editing: ${this.escapeStr(this.currentPage.title)}</h2>
                            <span class="badge ${this.currentPage.status}">${this.currentPage.status}</span>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn-secondary btn-sm" onclick="CMSPages.openPageSettings()">⚙️ Settings</button>
                            <button class="btn-secondary btn-sm" onclick="window.open('/preview${this.currentPage.slug}?draft=true', '_blank')">Preview</button>
                            <button class="btn-primary btn-sm" onclick="CMSPages.publishPage('${this.currentPage.id}')">Publish Changes</button>
                        </div>
                    </div>
                    
                    <div class="modal-body" style="padding-top: 1.5rem;">
                        <!-- Left Pane: Blocks Flow -->
                        <div class="editor-main-pane">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3>Page Blocks</h3>
                                <button class="btn-primary btn-sm" onclick="CMSPages.openAddBlockModal()">+ Add Block</button>
                            </div>
                            
                            <div id="blocksList" class="blocks-list">
                                <div class="loader"></div>
                            </div>
                        </div>

                        <!-- Right Pane: Active Block Form -->
                        <div class="editor-side-pane" id="blockEditorPane" style="background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; display: none;">
                            <!-- Form injected dynamically based on block type -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load blocks
        await this.loadBlocks();
    },

    /**
     * Fetch blocks for the current page
     */
    async loadBlocks() {
        const container = document.getElementById('blocksList');
        try {
            const blocks = await CMS.apiCall(`/pages/${this.currentPage.id}/blocks`);
            this.currentBlocks = blocks.sort((a, b) => a.sort_order - b.sort_order);
            this.renderBlocks();
        } catch (error) {
            container.innerHTML = `<div class="text-danger">Failed to load blocks: ${error.message}</div>`;
        }
    },

    /**
     * Render blocks list in the editor pane
     */
    renderBlocks() {
        const container = document.getElementById('blocksList');
        if (this.currentBlocks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: var(--surface-color); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
                    <p class="text-muted" style="margin-bottom: 1rem;">This page has no content yet.</p>
                    <button class="btn-primary" onclick="CMSPages.openAddBlockModal()">Add First Block</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.currentBlocks.map((b, index) => `
            <div class="block-row" draggable="true" ondragstart="CMSPages.onDragStart(event, ${index})" ondragover="CMSPages.onDragOver(event)" ondrop="CMSPages.onDrop(event, ${index})">
                <div style="cursor: grab; color: var(--text-muted); margin-right: 0.5rem;" title="Drag to reorder">⋮⋮</div>
                <div class="block-type-badge">${b.type}</div>
                <div class="block-summary">${this.getBlockSummary(b)}</div>
                <div class="block-actions">
                    <button class="btn-secondary btn-sm" onclick="CMSPages.editBlock('${b.id}')">Edit</button>
                    <button class="btn-secondary btn-sm" style="color: #ef4444; border-color: rgba(239,68,68,0.3);" onclick="CMSPages.deleteBlock('${b.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    },

    getBlockSummary(block) {
        if (!block.config) return 'Empty block';
        switch (block.type) {
            case 'hero': return block.config.title || 'Untitled Hero';
            case 'text': return (block.config.content || '').substring(0, 50) + '...';
            case 'cards': return `Layout: ${block.config.layout || 'grid'} (${(block.config.card_ids || []).length} cards)`;
            default: return 'No summary available';
        }
    },

    // ── Drag and Drop Reordering ────────────────────────────────────────── //

    draggedItemIndex: null,

    onDragStart(e, index) {
        this.draggedItemIndex = index;
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.5';
    },

    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    async onDrop(e, dropPosIndex) {
        e.preventDefault();
        document.querySelectorAll('.block-row').forEach(row => row.style.opacity = '1');

        if (this.draggedItemIndex === null || this.draggedItemIndex === dropPosIndex) return;

        // Reorder array locally
        const draggedBlock = this.currentBlocks[this.draggedItemIndex];
        this.currentBlocks.splice(this.draggedItemIndex, 1);
        this.currentBlocks.splice(dropPosIndex, 0, draggedBlock);

        // Update sort_order locally
        this.currentBlocks.forEach((b, i) => b.sort_order = i);

        // Optimistic UI update
        this.renderBlocks();

        // Send to API
        try {
            await CMS.apiCall('/blocks/reorder', {
                method: 'POST',
                body: { block_ids: this.currentBlocks.map(b => b.id) }
            });
            CMS.toast('Blocks reordered');
        } catch (error) {
            CMS.toast('Failed to save order: ' + error.message, 'error');
            await this.loadBlocks(); // Reload from server on fail
        }
    },

    // ── Block Creation & Editing ────────────────────────────────────────── //

    openAddBlockModal() {
        const pane = document.getElementById('blockEditorPane');
        pane.style.display = 'block';
        pane.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0;">Select Block Type</h3>
                <button class="close-modal" style="position: static; font-size: 1.5rem;" onclick="document.getElementById('blockEditorPane').style.display='none'">&times;</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <button class="btn-secondary" style="height: auto; padding: 1rem; flex-direction: column;" onclick="CMSPages.createBlock('hero')">
                    <span style="font-size: 1.5rem;">✨</span><span>Hero Header</span>
                </button>
                <button class="btn-secondary" style="height: auto; padding: 1rem; flex-direction: column;" onclick="CMSPages.createBlock('text')">
                    <span style="font-size: 1.5rem;">📝</span><span>Rich Text</span>
                </button>
                <button class="btn-secondary" style="height: auto; padding: 1rem; flex-direction: column;" onclick="CMSPages.createBlock('cards')">
                    <span style="font-size: 1.5rem;">🗂️</span><span>Cards Grid</span>
                </button>
                <button class="btn-secondary" style="height: auto; padding: 1rem; flex-direction: column;" onclick="CMSPages.createBlock('media')">
                    <span style="font-size: 1.5rem;">🖼️</span><span>Media</span>
                </button>
            </div>
        `;
    },

    async createBlock(type) {
        try {
            const newBlock = await CMS.apiCall(`/pages/${this.currentPage.id}/blocks`, {
                method: 'POST',
                body: {
                    type: type,
                    sort_order: this.currentBlocks.length,
                    config: {}
                }
            });
            this.currentBlocks.push(newBlock);
            this.renderBlocks();
            this.editBlock(newBlock.id);
            CMS.toast('Block added');
        } catch (error) {
            CMS.toast('Failed to add block: ' + error.message, 'error');
        }
    },

    editBlock(blockId) {
        const block = this.currentBlocks.find(b => b.id === blockId);
        if (!block) return;

        const pane = document.getElementById('blockEditorPane');
        pane.style.display = 'block';

        // Generate dynamic form based on block type
        let fieldsHtml = '';
        if (block.type === 'hero') {
            fieldsHtml = `
                <div class="form-group">
                    <label>Headline</label>
                    <input type="text" id="editHeroTitle" class="form-input" value="${this.escapeStr(block.config.title || '')}">
                </div>
                <div class="form-group">
                    <label>Subheading</label>
                    <textarea id="editHeroSub" class="form-input" rows="3">${this.escapeStr(block.config.subtitle || '')}</textarea>
                </div>
                <!-- AI Generate Button integrated -->
                <button type="button" class="btn-secondary btn-sm" style="color: #eab308; border-color: #eab308; width: 100%; margin-bottom: 1rem;" onclick="CMSPages.generateBlockAI('${block.id}')">✨ Auto-generate with AI</button>
            `;
        } else if (block.type === 'text') {
            fieldsHtml = `
                <div class="form-group">
                    <label>Content</label>
                    <textarea id="editContent" class="form-input" rows="8">${this.escapeStr(block.config.content || '')}</textarea>
                </div>
            `;
        } else {
            fieldsHtml = `<p class="text-muted">Editor for ${block.type} blocks is under construction.</p>`;
        }

        pane.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0;">Edit <span class="block-type-badge">${block.type}</span></h3>
                <button class="close-modal" style="position: static; font-size: 1.5rem;" onclick="document.getElementById('blockEditorPane').style.display='none'">&times;</button>
            </div>
            <form onsubmit="CMSPages.updateBlockConfig(event, '${block.id}')">
                ${fieldsHtml}
                <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; gap: 0.5rem;">
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        `;
    },

    async updateBlockConfig(e, blockId) {
        e.preventDefault();
        const block = this.currentBlocks.find(b => b.id === blockId);
        if (!block) return;

        // Gather updated config
        let updatedConfig = { ...block.config };
        if (block.type === 'hero') {
            updatedConfig.title = document.getElementById('editHeroTitle').value;
            updatedConfig.subtitle = document.getElementById('editHeroSub').value;
        } else if (block.type === 'text') {
            updatedConfig.content = document.getElementById('editContent').value;
        }

        try {
            await CMS.apiCall(`/blocks/${blockId}`, {
                method: 'PATCH',
                body: { config: updatedConfig }
            });
            block.config = updatedConfig;
            this.renderBlocks();
            CMS.toast('Block saved');
            document.getElementById('blockEditorPane').style.display = 'none';
        } catch (error) {
            CMS.toast('Failed to save block: ' + error.message, 'error');
        }
    },

    async deleteBlock(blockId) {
        if (!confirm('Are you sure you want to delete this block?')) return;
        try {
            // Optimistic UI
            this.currentBlocks = this.currentBlocks.filter(b => b.id !== blockId);
            this.renderBlocks();
            document.getElementById('blockEditorPane').style.display = 'none';

            await CMS.apiCall(`/blocks/${blockId}`, { method: 'DELETE' });
            CMS.toast('Block deleted');
        } catch (error) {
            CMS.toast('Failed to delete: ' + error.message, 'error');
            this.loadBlocks(); // reload
        }
    },

    /**
     * AI Integration Endpoint trigger
     */
    async generateBlockAI(blockId) {
        const block = this.currentBlocks.find(b => b.id === blockId);
        if (!block) return;

        try {
            CMS.toast('AI is generating content...', 'info');
            const result = await CMS.apiCall(`/ai/generate`, {
                method: 'POST',
                body: {
                    block_type: block.type,
                    context: this.currentPage.title,
                    language: 'en'
                }
            });

            // Result is a stub for now from backend phase 1, e.g. `<stub content>`
            if (block.type === 'hero') {
                document.getElementById('editHeroTitle').value = `Generated: ${this.currentPage.title}`;
                document.getElementById('editHeroSub').value = result.content || "AI generated description body text.";
            }
            CMS.toast('AI Generation complete! Review before saving.');
        } catch (err) {
            CMS.toast('AI error: ' + err.message, 'error');
        }
    },

    // ── Utilities ──────────────────────────────────────────────────────── //

    closeModal(id) {
        const m = document.getElementById(id);
        if (m) m.remove();
    },

    escapeStr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
};

window.CMSPages = CMSPages;
