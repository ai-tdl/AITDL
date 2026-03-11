/**
 * CMS Media Module
 * Handles file uploads and the grid view of media assets
 */

const CMSMedia = {
    assets: [],

    async loadLibrary() {
        const grid = document.getElementById('mediaGrid');
        try {
            grid.innerHTML = '<div class="loader"></div>';
            this.assets = await CMS.apiCall('/media');
            this.renderGrid();
        } catch (error) {
            grid.innerHTML = `<div class="text-danger">Failed to load media: ${error.message}</div>`;
        }
    },

    renderGrid() {
        const grid = document.getElementById('mediaGrid');

        if (this.assets.length === 0) {
            grid.innerHTML = '<div class="text-muted" style="grid-column: 1/-1; padding: 3rem; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">No media found. Upload an image or video to get started.</div>';
            return;
        }

        grid.innerHTML = this.assets.map(asset => {
            const isImage = asset.mime_type.startsWith('image/');
            const isVideo = asset.mime_type.startsWith('video/');
            let previewHtml = '';

            if (isImage) {
                previewHtml = `<img src="${asset.cdn_url}" alt="${CMSCards.escapeStr(asset.alt_text || asset.filename)}" loading="lazy">`;
            } else if (isVideo) {
                previewHtml = `
                    <div style="width:100%; height:100%; background:#1a1a1a; display:flex; align-items:center; justify-content:center;">
                        <span style="font-size: 2rem;">▶️</span>
                    </div>
                `;
            } else {
                previewHtml = `
                    <div style="width:100%; height:100%; background:#1a1a1a; display:flex; align-items:center; justify-content:center;">
                        <span style="font-size: 2rem;">📄</span>
                    </div>
                `;
            }

            return `
                <div class="media-item">
                    ${previewHtml}
                    <div class="media-overlay">
                        <div class="media-filename" title="${CMSCards.escapeStr(asset.filename)}">
                            ${CMSCards.escapeStr(asset.filename)}<br>
                            <span class="text-muted" style="font-size: 0.65rem;">${(asset.size_bytes / 1024).toFixed(1)} KB</span>
                        </div>
                        <button class="btn-secondary btn-sm text-danger" style="padding: 0.25rem 0.5rem;" onclick="CMSMedia.deleteAsset('${asset.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    async upload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Reset input so same file can be selected again if needed
        event.target.value = '';

        if (file.size > 10 * 1024 * 1024) {
            CMS.toast('File must be less than 10MB', 'error');
            return;
        }

        CMS.toast(`Uploading ${file.name}...`, 'info');

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Note: FormData requires omitting the Content-Type header so the browser sets the boundary correctly
            // We'll use a direct fetch here to bypass the auto JSON parsing in CMS.apiCall for FormData
            const token = Auth.getToken();
            const response = await fetch(`${CMS.Config.API_BASE}/media/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error(await response.text());

            CMS.toast('Upload complete!');
            this.loadLibrary();
        } catch (error) {
            CMS.toast('Upload failed: ' + error.message, 'error');
        }
    },

    async deleteAsset(id) {
        if (!confirm('Are you sure you want to delete this asset? If it is used in a page or blog post, it will break the image link.')) return;

        try {
            // Optimistic update
            this.assets = this.assets.filter(a => a.id !== id);
            this.renderGrid();

            await CMS.apiCall(`/media/${id}`, { method: 'DELETE' });
            CMS.toast('Asset deleted');
        } catch (error) {
            CMS.toast('Delete failed: ' + error.message, 'error');
            this.loadLibrary();
        }
    }
};

window.CMSMedia = CMSMedia;
