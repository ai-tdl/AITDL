/**
 * CMS Cards Module
 * Handles Root Cards and Sub-cards (up to 1 level deep)
 */

const CMSCards = {
    cards: [],

    async loadList() {
        const container = document.getElementById('cardsListContainer');
        try {
            container.innerHTML = '<div class="loader"></div>';
            this.cards = await CMS.apiCall('/cards');
            this.renderList();
        } catch (error) {
            container.innerHTML = `<div class="text-danger">Failed to load cards: ${error.message}</div>`;
        }
    },

    renderList() {
        const container = document.getElementById('cardsListContainer');

        // Group into Root and Children
        const rootCards = this.cards.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);

        if (rootCards.length === 0) {
            container.innerHTML = '<div class="text-muted" style="padding: 2rem; text-align: center;">No cards found. Create a root card to start.</div>';
            return;
        }

        let html = '<div class="cards-tree">';

        rootCards.forEach((rootCard, index) => {
            const children = this.cards.filter(c => c.parent_id === rootCard.id).sort((a, b) => a.sort_order - b.sort_order);

            html += `
                <div class="card-node root-card" style="background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 1rem; padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h3 style="margin: 0;">${rootCard.icon ? rootCard.icon + ' ' : ''}${this.escapeStr(rootCard.title)}</h3>
                        <div>
                            <span class="badge ${rootCard.enabled ? 'published' : 'draft'}">${rootCard.enabled ? 'Active' : 'Hidden'}</span>
                            <button class="btn-secondary btn-sm" onclick="CMSCards.editCard('${rootCard.id}')">Edit</button>
                            ${children.length === 0 ? `<button class="btn-secondary btn-sm text-danger" onclick="CMSCards.deleteCard('${rootCard.id}')">Delete</button>` : ''}
                        </div>
                    </div>
                    ${rootCard.description ? `<p class="text-muted" style="font-size: 0.875rem;">${this.escapeStr(rootCard.description)}</p>` : ''}
                    
                    <!-- Sub-cards -->
                    <div class="sub-cards-list" style="margin-top: 1rem; padding-left: 1rem; border-left: 2px solid var(--border-color);">
                        ${children.map(child => `
                            <div class="card-node sub-card" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); margin-bottom: 0.5rem;">
                                <span>↳ ${child.icon ? child.icon + ' ' : ''}${this.escapeStr(child.title)}</span>
                                <div>
                                    <button class="btn-secondary btn-sm" onclick="CMSCards.editCard('${child.id}')">Edit</button>
                                    <button class="btn-secondary btn-sm text-danger" onclick="CMSCards.deleteCard('${child.id}')">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                        <button class="btn-secondary btn-sm" style="margin-top: 0.5rem;" onclick="CMSCards.openCreateModal('${rootCard.id}')">+ Add Sub-Card</button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    },

    openCreateModal(parentId = null) {
        const root = document.getElementById('cmsModalRoot');
        root.innerHTML = `
            <div id="createCardModal" class="modal active">
                <div class="modal-content">
                    <button class="close-modal" onclick="CMSCards.closeModal('createCardModal')">&times;</button>
                    <h2>Create ${parentId ? 'Sub-Card' : 'Root Card'}</h2>
                    <form onsubmit="CMSCards.saveCard(event, null, '${parentId || ''}')">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="cardTitle" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="cardDesc" class="form-input" rows="2"></textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Icon (Emoji or Class)</label>
                                <input type="text" id="cardIcon" class="form-input">
                            </div>
                            <div class="form-group">
                                <label>Badge Text</label>
                                <input type="text" id="cardBadge" class="form-input" placeholder="e.g. NEW">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>CTA Text</label>
                                <input type="text" id="cardCtaText" class="form-input">
                            </div>
                            <div class="form-group">
                                <label>CTA URL</label>
                                <input type="text" id="cardCtaUrl" class="form-input">
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="btn-primary">Save Card</button>
                            <button type="button" class="btn-secondary" onclick="CMSCards.closeModal('createCardModal')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    editCard(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        const root = document.getElementById('cmsModalRoot');
        root.innerHTML = `
            <div id="editCardModal" class="modal active">
                <div class="modal-content">
                    <button class="close-modal" onclick="CMSCards.closeModal('editCardModal')">&times;</button>
                    <h2>Edit Card</h2>
                    <form onsubmit="CMSCards.saveCard(event, '${card.id}', '${card.parent_id || ''}')">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="cardTitle" class="form-input" required value="${this.escapeStr(card.title)}">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="cardDesc" class="form-input" rows="2">${this.escapeStr(card.description || '')}</textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Icon (Emoji or Class)</label>
                                <input type="text" id="cardIcon" class="form-input" value="${this.escapeStr(card.icon || '')}">
                            </div>
                            <div class="form-group">
                                <label>Badge Text</label>
                                <input type="text" id="cardBadge" class="form-input" value="${this.escapeStr(card.badge || '')}">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>CTA Text</label>
                                <input type="text" id="cardCtaText" class="form-input" value="${this.escapeStr(card.cta_text || '')}">
                            </div>
                            <div class="form-group">
                                <label>CTA URL</label>
                                <input type="text" id="cardCtaUrl" class="form-input" value="${this.escapeStr(card.cta_url || '')}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="custom-checkbox">
                                <input type="checkbox" id="cardEnabled" ${card.enabled ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Enabled (Visible to public)
                            </label>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" style="color: #eab308; border-color: #eab308; margin-right: auto;" onclick="CMSCards.generateCardAI()">✨ Auto-fill with AI</button>
                            <button type="submit" class="btn-primary">Save Changes</button>
                            <button type="button" class="btn-secondary" onclick="CMSCards.closeModal('editCardModal')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    async saveCard(e, cardId, parentId) {
        e.preventDefault();
        const payload = {
            title: document.getElementById('cardTitle').value,
            description: document.getElementById('cardDesc').value,
            icon: document.getElementById('cardIcon').value,
            badge: document.getElementById('cardBadge').value,
            cta_text: document.getElementById('cardCtaText').value,
            cta_url: document.getElementById('cardCtaUrl').value,
            enabled: document.getElementById('cardEnabled') ? document.getElementById('cardEnabled').checked : true
        };

        if (parentId && parentId !== 'null') payload.parent_id = parentId;

        try {
            if (cardId) {
                await CMS.apiCall(`/cards/${cardId}`, { method: 'PATCH', body: payload });
                this.closeModal('editCardModal');
                CMS.toast('Card updated');
            } else {
                await CMS.apiCall(`/cards`, { method: 'POST', body: payload });
                this.closeModal('createCardModal');
                CMS.toast('Card created');
            }
            this.loadList();
        } catch (error) {
            CMS.toast('Failed to save card: ' + error.message, 'error');
        }
    },

    async deleteCard(cardId) {
        if (!confirm('Delete this card? This action cannot be undone.')) return;
        try {
            this.cards = this.cards.filter(c => c.id !== cardId);
            this.renderList();
            await CMS.apiCall(`/cards/${cardId}`, { method: 'DELETE' });
            CMS.toast('Card deleted');
        } catch (error) {
            CMS.toast('Delete failed: ' + error.message, 'error');
            this.loadList();
        }
    },

    async generateCardAI() {
        const title = document.getElementById('cardTitle').value;
        if (!title) return CMS.toast('Enter a title first to give the AI context', 'error');

        try {
            CMS.toast('AI generating card content...', 'info');
            const result = await CMS.apiCall(`/ai/generate`, {
                method: 'POST',
                body: {
                    block_type: 'card',
                    context: `Product/Feature name: ${title}`,
                    language: 'en'
                }
            });

            document.getElementById('cardDesc').value = result.content || 'Generated description based on title.';
            document.getElementById('cardCtaText').value = 'Learn More';
            CMS.toast('Auto-fill complete');
        } catch (e) {
            CMS.toast('AI failed: ' + e.message, 'error');
        }
    },

    closeModal(id) {
        const m = document.getElementById(id);
        if (m) m.remove();
    },

    escapeStr: (str) => {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
};

window.CMSCards = CMSCards;
