/**
 * ui-controller.js
 * ACG 收藏庫 - 介面控制與渲染 (View Layer)
 * 負責：核心渲染、後台介面、留言板、彈窗
 */

class UIController {
    constructor() {
        this.app = document.getElementById('app');
        this.itemsPerPage = 20;
        this.adminItemsPerPage = 10;
        this.currentAdminTab = 'manage';
        this.adminPage = 1;
        this.currentGuestbookTab = 'pending'; // Guestbook state
        this.editId = null; // For anime editing
    }

    // --- Helpers ---
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
    }

    showToast(msg, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.style.setProperty('--toast-border', type === 'error' ? '#ff4444' : 'var(--neon-cyan)');
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 2000);
    }

    // --- Main UI Rendering ---

    renderApp(requestId = null) {
        const app = document.getElementById('app');
        if (!app) return;

        // Apply Global Styles
        const btnColor = window.optionsData?.category_colors?.btn_bg || '#00d4ff';
        document.documentElement.style.setProperty('--btn-bg', btnColor);
        document.documentElement.style.setProperty('--btn-bg-alpha', btnColor + '22');

        if (window.gridColumns !== 'mobile') {
            document.documentElement.style.setProperty('--grid-columns', window.gridColumns);
        }

        const isNotice = window.currentCategory === 'notice';

        // 1. Partial Render (Optimization)
        const existingApp = document.querySelector('.app-container');
        if (existingApp && window.currentSection !== 'admin') {
            this.updateActiveCategoryButton();
            this.toggleViews(isNotice);
            if (!isNotice) this.renderGridContent();
            this.updateAdminMenu();
            return;
        }

        // 2. Full Render
        const siteTitle = window.siteSettings?.site_title || 'ACG 收藏庫';
        const titleColor = window.siteSettings?.title_color || '#ffffff';

        app.innerHTML = `
            <div class="app-container">
                <header class="app-header">
                     <div style="display: flex; justify-content: center; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <h1 style="color: ${titleColor}; text-shadow: 0 0 10px var(--neon-blue); margin-bottom: 8px;">
                            ${siteTitle} <span style="font-size: 14px; color: var(--text-secondary); margin-left: 10px;">v8.0.2</span>
                        </h1>
                    </div>
                </header>
                <div class="category-buttons-container" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; position: relative; z-index: 100;">
                    <button class="btn-primary" onclick="window.switchCategory('notice')">◆ 訊息</button>
                    <button class="btn-primary" onclick="window.switchCategory('anime')">◆ 動畫</button>
                    <button class="btn-primary" onclick="window.switchCategory('manga')">◆ 漫畫</button>
                    <button class="btn-primary" onclick="window.switchCategory('movie')">◆ 電影</button>
                </div>
                
                <div id="filter-section" style="margin-bottom: 30px; display: ${isNotice ? 'none' : 'block'};">
                    <input type="text" id="search-input" class="search-ghost" placeholder="快速搜尋作品..." value="${window.filters?.search || ''}" oninput="window.handleSearch(this.value)">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div id="search-filters" class="horizontal-scroll-container" style="display: flex; gap: 12px; flex: 1; overflow-x: auto; padding: 8px 0;">
                            ${this.renderSearchSelectsHTML()}
                        </div>
                    </div>
                </div>

                <div id="notice-container" style="display: ${isNotice ? 'block' : 'none'};"></div>
                <div id="main-grid-content" style="display: ${isNotice ? 'none' : 'block'};">
                    <div id="pagination-top-container" class="pagination-minimal" style="margin-bottom: 25px;"></div>
                    <div id="anime-grid-container" class="anime-grid"></div>
                    <div id="pagination-container" class="pagination-minimal" style="margin-top: 40px;"></div>
                </div>
            </div>
            ${this.getDetailModalHTML()}
        `;

        this.updateActiveCategoryButton();
        if (isNotice) {
            this.renderNotices();
        } else {
            this.renderGridContent();
        }

        app.style.display = 'block';
        app.style.opacity = '1';
        this.updateAdminMenu();
        if (window.initGlobalScroll) window.initGlobalScroll();
        if (window.setupHorizontalScroll) window.setupHorizontalScroll('.horizontal-scroll-container');
    }

    renderGridContent() {
        const filtered = window.getFilteredData();
        const currentPage = window.currentPage || 1;
        const paged = filtered.slice((currentPage - 1) * this.itemsPerPage, currentPage * this.itemsPerPage);

        const gridContainer = document.getElementById('anime-grid-container');

        // Show error state if data load failed
        if (window.dataLoadError) {
            if (gridContainer) {
                gridContainer.innerHTML = this.renderErrorState(window.dataLoadError);
            }
            document.querySelectorAll('#pagination-container, #pagination-top-container').forEach(el => el.innerHTML = '');
            return;
        }

        if (gridContainer) {
            const cols = window.gridColumns;
            gridContainer.className = `anime-grid ${cols === 'mobile' ? 'force-mobile-layout' : ''}`;
            gridContainer.style.cssText = cols === 'mobile'
                ? 'display: flex; flex-direction: column; gap: 10px;'
                : `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 20px;`;

            if (paged.length > 0) {
                gridContainer.innerHTML = paged.map(item => this.renderSimpleCard(item)).join('');
            } else {
                gridContainer.innerHTML = this.renderEmptyState();
            }
        }

        const pageHTML = this.renderPagination(filtered.length);
        document.querySelectorAll('#pagination-container, #pagination-top-container').forEach(el => el.innerHTML = pageHTML);
    }

    renderSimpleCard(item) {
        // Bridge to render.js if available
        if (window.renderGridCard) {
            const colors = window.getCardColors(item);
            const data = window.processCardData(item);
            if (window.gridColumns === 'mobile' && window.renderListCard) {
                return window.renderListCard(item, colors, data);
            }
            return window.renderGridCard(item, colors, data);
        }
        return `<div>${this.escapeHtml(item.name)}</div>`;
    }

    renderPagination(total) {
        const pages = Math.ceil(total / this.itemsPerPage);
        if (pages <= 1) return '';
        const current = window.currentPage || 1;

        let html = '';
        if (current > 1) html += `<button class="btn-minimal" onclick="window.changePage(${current - 1})">◀</button>`;

        let start = Math.max(1, current - 2);
        let end = Math.min(pages, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        if (start > 1) html += `<button class="btn-minimal" onclick="window.changePage(1)">1</button><span>...</span>`;
        for (let i = start; i <= end; i++) {
            html += `<button class="btn-minimal ${current === i ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`;
        }
        if (end < pages) html += `<span>...</span><button class="btn-minimal" onclick="window.changePage(${pages})">${pages}</button>`;
        if (current < pages) html += `<button class="btn-minimal" onclick="window.changePage(${current + 1})">▶</button>`;
        return html;
    }

    renderSearchSelectsHTML() {
        if (!window.optionsData) return '';
        const defaultKeys = ['genre', 'year', 'season', 'month', 'rating'];
        const customKeys = window.optionsData.custom_lists || [];
        const allKeys = [...defaultKeys, ...customKeys];

        return allKeys.map(key => {
            const opts = window.optionsData[key] || [];
            const label = window.getOptionLabel ? window.getOptionLabel(key) : key;
            const val = window.filters ? window.filters[key] : '';
            return `
               <select onchange="window.handleFilter('${key}', this.value)" style="min-width: 100px; background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.25); padding: 8px; font-size: 13px; cursor: pointer; color: #fff; border-radius: 6px; margin-right: 8px;">
                   <option value="" style="background: var(--bg-dark);">${label}</option>
                   ${opts.map(o => `<option value="${o}" ${o === val ? 'selected' : ''} style="background: var(--bg-dark);">${o}</option>`).join('')}
               </select>
           `;
        }).join('');
    }

    toggleViews(isNotice) {
        document.getElementById('notice-container').style.display = isNotice ? 'block' : 'none';
        document.getElementById('main-grid-content').style.display = isNotice ? 'none' : 'block';
        document.getElementById('filter-section').style.display = isNotice ? 'none' : 'block';
        if (!isNotice && window.updateTopMarquee) window.updateTopMarquee();
    }

    updateActiveCategoryButton() {
        const btns = document.querySelectorAll('.category-buttons-container .btn-primary');
        const map = { 'anime': '動畫', 'manga': '漫畫', 'movie': '電影', 'notice': '訊息' };
        btns.forEach(btn => {
            const text = btn.textContent.replace(/◆\s*/, '').trim();
            btn.classList.toggle('active', text === map[window.currentCategory]);
        });
    }

    updateAdminMenu() {
        const adminContainer = document.getElementById('adminMenuOptions');
        if (!adminContainer) return;

        if (window.isAdminLoggedIn) {
            adminContainer.innerHTML = `
                <button onclick="window.toggleAdminMode(true)" style="background: rgba(0,212,255,0.1) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 8px 10px !important; font-size: 13px !important; cursor: pointer; color: var(--neon-cyan) !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease;">⚙️ 後台管理</button>
                <button onclick="window.adminLogout()" class="logout" style="background: rgba(255,68,68,0.1) !important; border: 1px solid rgba(255,68,68,0.25) !important; padding: 8px 10px !important; font-size: 13px !important; cursor: pointer; color: #ff6b6b !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease;">🚪 登出</button>
            `;
        } else {
            adminContainer.innerHTML = `
                <button onclick="window.showAdminLoginModal()" style="background: rgba(0,212,255,0.1) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 8px 10px !important; font-size: 13px !important; cursor: pointer; color: var(--neon-cyan) !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease;">🔐 登入</button>
            `;
        }
    }

    renderNotices() {
        const container = document.getElementById('notice-container');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--neon-cyan);">⚡ 訊息系統載入中...</div>';
            setTimeout(() => {
                if (window.renderAnnouncements) container.innerHTML = window.renderAnnouncements();
                if (window.announcementSystem?.loadInitialContent) window.announcementSystem.loadInitialContent();
            }, 100);
        }
    }

    renderEmptyState(message = '未找到相關資料', hint = '嘗試調整搜尋條件') {
        return `<div class="empty-state"><div class="empty-state-icon">🎭</div><div class="empty-state-title">${message}</div><div class="empty-state-message">${hint}</div></div>`;
    }

    renderErrorState(message = '載入失敗', hint = '請檢查網絡連接或聯絡管理員') {
        return `<div class="empty-state" style="border-color: rgba(255,68,68,0.3);">
            <div class="empty-state-icon" style="font-size: 48px;">⚠️</div>
            <div class="empty-state-title" style="color: #ff6b6b;">${message}</div>
            <div class="empty-state-message">${hint}</div>
        </div>`;
    }

    getDetailModalHTML() {
        return `
            <div id="detailModal" class="modal" onclick="if(event.target===this) window.closeAnimeDetail()">
                <div class="modal-content">
                    <button class="btn-primary" style="position: absolute; top: 20px; right: 20px; z-index: 1000; width: 40px; height: 40px; padding: 0;" onclick="window.closeAnimeDetail()">×</button>
                    <div id="detailContent"></div>
                </div>
            </div>
        `;
    }

    // --- Admin UI Rendering ---

    renderAdmin() {
        const app = document.getElementById('app');
        if (!app) return;

        const adminTabs = [
            { id: 'manage', icon: '📋', label: '作品管理' },
            { id: 'add', icon: '➕', label: '新增作品' },
            { id: 'guestbook', icon: '💬', label: '留言板' },
            { id: 'options', icon: '⚙️', label: '選項管理' },
            { id: 'settings', icon: '🌐', label: '網站設定' }
        ];

        const filtered = window.getFilteredData();
        const paged = filtered.slice((this.adminPage - 1) * this.adminItemsPerPage, this.adminPage * this.adminItemsPerPage);

        app.innerHTML = `
            <div class="admin-layout">
                <aside class="admin-sidebar">
                    <div class="admin-sidebar-header"><h2 style="font-family: 'Orbitron'; color: var(--neon-cyan);">⚙️ 管理後台</h2></div>
                    <nav class="admin-sidebar-nav">
                        ${adminTabs.map(tab => `
                            <button class="admin-nav-item ${this.currentAdminTab === tab.id ? 'active' : ''}" onclick="window.switchAdminTab('${tab.id}')">
                                <span class="nav-icon">${tab.icon}</span><span class="nav-label">${tab.label}</span>
                            </button>
                        `).join('')}
                    </nav>
                    <div class="admin-sidebar-footer">
                        <button class="admin-nav-item logout" onclick="window.toggleAdminMode(false)">
                            <span class="nav-icon">↩️</span><span class="nav-label">返回前台</span>
                        </button>
                    </div>
                </aside>
                <main class="admin-main">
                    <div class="admin-content-header"><h1 style="color: var(--neon-cyan);">${adminTabs.find(t => t.id === this.currentAdminTab)?.label}</h1></div>
                    <div id="admin-content-body" class="admin-content-body">
                         ${this.renderAdminContent(paged, filtered.length)}
                    </div>
                </main>
            </div>
        `;

        // Handle async rendering or specific setup for certain tabs
        if (this.currentAdminTab === 'guestbook') {
            const loadingDiv = document.getElementById('guestbook-loading');
            if (loadingDiv) {
                if (window.renderGuestbookAdmin) {
                    window.renderGuestbookAdmin().then(html => {
                        const body = document.getElementById('admin-content-body');
                        if (body && this.currentAdminTab === 'guestbook') body.innerHTML = html;
                    });
                } else {
                    this.renderGuestbookAdmin().then(html => {
                        if (loadingDiv && loadingDiv.parentNode) loadingDiv.outerHTML = html;
                    });
                }
            }
        }
        window.initGlobalScroll && window.initGlobalScroll();
    }

    renderAdminContent(pagedData, total) {
        if (this.currentAdminTab === 'manage') {
            return `
                <div class="admin-section">
                    <div class="admin-section-header">
                        <div class="admin-category-tabs">
                            <button class="category-tab ${window.currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">🎬 動畫</button>
                            <button class="category-tab ${window.currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">📚 漫畫</button>
                            <button class="category-tab ${window.currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">🎥 電影</button>
                        </div>
                        <div class="admin-actions">
                            <span class="data-count">共 ${total} 筆資料</span>
                            <button class="btn-secondary" onclick="window.exportCSV('${window.currentCategory}')">📥 匯出</button>
                            <button class="btn-secondary" onclick="window.triggerImport('${window.currentCategory}')">📤 匯入</button>
                        </div>
                    </div>
                    <div class="admin-toolbar">
                        <button class="btn-danger" id="bulk-delete-btn" style="display: none;" onclick="window.bulkDeleteAnime()">🗑 刪除選中 (<span id="selected-count">0</span>)</button>
                        <button class="btn-danger-outline" onclick="window.deleteAllInCategory()">💀 刪除全部</button>
                    </div>
                    <div class="admin-table-container">
                        <table class="admin-table">
                            <thead><tr><th style="width: 50px;"><input type="checkbox" id="select-all" onchange="window.toggleSelectAll(this.checked)"></th><th>作品名稱</th><th>年份</th><th>季度</th><th>評分</th><th style="width: 180px;">操作</th></tr></thead>
                            <tbody>${pagedData.map(item => `
                                <tr>
                                    <td><input type="checkbox" class="item-checkbox" data-id="${item.id}" onchange="window.updateBulkDeleteButton()"></td>
                                    <td class="item-name">${this.escapeHtml(item.name)}</td>
                                    <td>${item.year || '-'}</td>
                                    <td>${item.season || '-'}</td>
                                    <td><span class="rating-badge">${item.rating || '-'}</span></td>
                                    <td class="item-actions">
                                        <button class="btn-icon edit" onclick="window.editAnime('${item.id}')" title="編輯">📝</button>
                                        <button class="btn-icon delete" onclick="window.deleteAnime('${item.id}')" title="刪除">✕</button>
                                    </td>
                                </tr>`).join('')}</tbody>
                        </table>
                    </div>
                    <div class="admin-pagination">${this.renderAdminPagination(total)}</div>
                </div>`;
        } else if (this.currentAdminTab === 'add' || this.currentAdminTab === 'edit') {
            const item = this.editId ? window.animeData.find(a => a.id === this.editId) : {};
            return window.renderAnimeForm ? window.renderAnimeForm(item || {}) : this.renderAnimeForm(item || {});
        } else if (this.currentAdminTab === 'options') {
            return window.renderOptionsManager?.() || this.renderOptionsManager();
        } else if (this.currentAdminTab === 'settings') {
            return window.renderSettingsPanel?.() || `<div style="padding: 20px; color: var(--neon-cyan);">網站設定 (功能開發中)</div>`;
        } else if (this.currentAdminTab === 'guestbook') {
            return '<div id="guestbook-loading" style="padding: 50px; text-align: center; color: var(--neon-cyan);">⌛ 正在載入留言資料...</div>';
        }
        return '';
    }

    renderAdminPagination(total) {
        const pages = Math.ceil(total / this.adminItemsPerPage);
        if (pages <= 1) return '';
        let html = '';
        const current = this.adminPage;
        // Simplified admin pagination
        for (let i = 1; i <= pages; i++) {
            html += `<button class="btn-primary ${current === i ? 'active' : ''}" style="width: 40px;" onclick="window.changeAdminPage(${i})">${i}</button>`;
        }
        return html;
    }

    // --- Anime Form (Copied logic) ---
    renderAnimeForm(item = {}) {
        const isEdit = !!item.id;
        const genres = Array.isArray(item.genre) ? item.genre : [];
        const extraData = item.extra_data || {};
        const optionsData = window.optionsData || {};

        return `
            <div class="admin-section">
                <div class="admin-section-header" style="margin-bottom: 15px;">
                    <h3 style="color: var(--neon-cyan); margin: 0;">${isEdit ? '📝 編輯作品' : '➕ 新增作品'}</h3>
                    <button class="btn-primary" onclick="window.switchAdminTab('manage')">✕ 返回</button>
                </div>
                <!-- Form Inputs -->
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 11px; color: var(--neon-cyan);">作品名稱</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" id="form-name" value="${this.escapeHtml(item.name)}" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 14px; font-weight: bold;">
                        <button onclick="window.autoCompleteAnimeData()" class="btn-primary" style="white-space: nowrap; padding: 8px 16px; font-size: 13px;">✨ 補全資料</button>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start;">
                    <div style="display: flex; flex-direction: column; gap: 12px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(0,212,255,0.1);">
                        <div style="color: var(--neon-cyan);">基本屬性</div>
                        <!-- Standard Selects -->
                        ${this._renderFormSelect('分類', 'form-category',
            ['anime', 'manga', 'movie'],
            item.category,
            ['動畫', '漫畫', '電影']
        )}
                        ${this._renderFormSelect('年份', 'form-year', optionsData.year, item.year)}
                        ${this._renderFormSelect('季度', 'form-season', optionsData.season, item.season)}
                        ${this._renderFormSelect('月份', 'form-month', optionsData.month, item.month)}
                        ${this._renderFormSelect('評分', 'form-rating', optionsData.rating, item.rating)}
                        <!-- Custom Selects -->
                        ${(optionsData.custom_lists || []).map(key => `
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">${window.siteSettings?.custom_labels?.[key] || key}</label>
                                <select class="form-custom-list" data-key="${key}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff;">
                                    <option value="">-</option>
                                    ${(optionsData[key] || []).map(opt => `<option value="${opt}" ${extraData[key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                                </select>
                            </div>
                        `).join('')}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div><label style="font-size: 11px; color: var(--neon-cyan);">海報網址</label><input type="text" id="form-poster" value="${item.poster_url || ''}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 8px; color: #fff;"></div>
                        <div><label style="font-size: 11px; color: var(--neon-cyan);">YouTube Preview</label><input type="text" id="form-youtube" value="${item.youtube_url || ''}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 8px; color: #fff;"></div>
                        <div>
                            <label style="font-size: 11px; color: var(--neon-cyan);">類型標籤</label>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 6px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; max-height: 120px; overflow-y: auto;">
                                ${(optionsData.genre || []).map(g => `
                                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                                        <input type="checkbox" name="form-genre" value="${g}" ${genres.includes(g) ? 'checked' : ''}>
                                        <span style="font-size: 11px;">${g}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <div>
                            <label style="font-size: 11px; color: var(--neon-cyan);">簡介</label>
                            <textarea id="form-desc" rows="8" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 10px; color: #fff;">${item.description || ''}</textarea>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 30px; text-align: center;">
                    <button onclick="window.saveAnime()" class="btn-primary" style="padding: 10px 50px;">💾 ${isEdit ? '儲存變更' : '新增作品'}</button>
                </div>
            </div>
        `;
    }

    _renderFormSelect(label, id, options = [], selected, displayTexts = null) {
        return `
            <div>
                <label style="font-size: 11px; color: var(--text-secondary);">${label}</label>
                <select id="${id}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff;">
                    <option value="">-</option>
                    ${options.map((opt, i) => `<option value="${opt}" ${opt === selected ? 'selected' : ''}>${displayTexts ? displayTexts[i] : opt}</option>`).join('')}
                </select>
            </div>
        `;
    }

    renderOptionsManager() {
        const optionsData = window.optionsData || {};
        const allKeys = ['genre', 'year', 'month', 'season', 'rating', ...(optionsData.custom_lists || [])];
        return `
            <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
                <input type="text" id="new-list-name" placeholder="輸入新列表名稱" style="width: 250px; padding: 8px; border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; background: rgba(0,0,0,0.3); color: #fff;">
                <button class="btn-primary" onclick="window.addNewCustomList()">＋ 新增列表</button>
            </div>
            <div class="options-scroll-wrapper">
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${allKeys.map(key => `
                        <div class="form-custom-list" style="background: rgba(0,212,255,0.05); padding: 15px; border-radius: 10px;">
                            <strong style="color: var(--neon-cyan);">${key}</strong>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                                ${(optionsData[key] || []).map((opt, idx) => `
                                    <div id="opt-${key}-${idx}" style="background: rgba(0,212,255,0.1); padding: 4px 8px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2);">
                                        <span id="opt-text-${key}-${idx}">${opt}</span>
                                        <input type="text" id="opt-input-${key}-${idx}" value="${opt}" style="display: none; width: 80px;" onblur="window.saveOptionEdit('${key}', ${idx}, '${opt}')">
                                        <button class="btn-icon edit" onclick="window.editOption('${key}', ${idx}, '${opt}')">✎</button>
                                        <button class="btn-icon delete" onclick="window.deleteOptionItem('${key}', ${idx}')">✕</button>
                                    </div>
                                `).join('')}
                                <button class="btn-primary" onclick="window.addOptionItem('${key}')">＋</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async renderGuestbookAdmin() {
        // This is a backup method in case global one isn't loaded
        if (window.renderGuestbookAdmin) return window.renderGuestbookAdmin();

        const messages = await window.dataManager.loadGuestbookMessagesForAdmin();
        const pending = messages.filter(m => m.status === 'pending');
        const approved = messages.filter(m => m.status === 'approved');
        const rejected = messages.filter(m => m.status === 'rejected');

        return `
            <div id="guestbook-admin-container" style="display: flex; flex-direction: column; min-height: 100%;">
                 <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                     <button class="btn-primary ${this.currentGuestbookTab === 'pending' ? 'active' : ''}" onclick="window.switchGuestbookTab('pending')">待審核 (${pending.length})</button>
                     <button class="btn-primary ${this.currentGuestbookTab === 'approved' ? 'active' : ''}" onclick="window.switchGuestbookTab('approved')">已通過 (${approved.length})</button>
                     <button class="btn-primary ${this.currentGuestbookTab === 'rejected' ? 'active' : ''}" onclick="window.switchGuestbookTab('rejected')">已拒絕 (${rejected.length})</button>
                 </div>
                 <div id="guestbook-list">${this.renderGuestbookList(messages)}</div>
            </div>
         `;
    }

    renderGuestbookList(messages) {
        const filtered = messages.filter(m => m.status === this.currentGuestbookTab);
        return filtered.length === 0 ? '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">暫無留言</div>' :
            filtered.map(m => `
                <div style="background: rgba(0,212,255,0.03); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--neon-cyan);">${this.escapeHtml(m.nickname)}</span>
                        <span style="color: var(--text-secondary); font-size: 12px;">${new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <div style="color: var(--text-secondary); white-space: pre-wrap;">${this.escapeHtml(m.content)}</div>
                    ${this.currentGuestbookTab === 'pending' ? `
                        <div style="display: flex; gap: 8px; margin-top: 10px;">
                            <button class="btn-primary" onclick="window.moderateGuestbook('${m.id}', 'approved')">✅ 通過</button>
                            <button class="btn-primary" style="color: #ff4444;" onclick="window.moderateGuestbook('${m.id}', 'rejected')">❌ 拒絕</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
    }

    // --- Jikan UI Helpers ---
    showJikanSearchModal(defaultQuery = '') {
        const modal = document.createElement('div');
        modal.id = 'jikan-search-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(5px);';
        modal.innerHTML = `
            <div style="background: var(--bg-dark); border: 1px solid rgba(139,92,246,0.4); border-radius: 12px; width: 90%; max-width: 700px; max-height: 85vh; display: flex; flex-direction: column;">
                <div style="padding: 20px; border-bottom: 1px solid rgba(139,92,246,0.2);">
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="jikan-search-input" value="${defaultQuery}" style="flex:1;background:rgba(0,0,0,0.4);border:1px solid rgba(139,92,246,0.3);border-radius:6px;padding:10px;color:#fff;" onkeydown="if(event.key==='Enter')window.executeJikanSearch()">
                        <button onclick="window.executeJikanSearch()" class="btn-primary">🔍 搜尋</button>
                    </div>
                </div>
                <div id="jikan-results" style="flex:1;overflow-y:auto;padding:15px;text-align:center;">輸入關鍵字後按搜尋</div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        if (defaultQuery) window.executeJikanSearch();
    }

    renderJikanResults(data) {
        // ... Render Jikan Cards ...
        return data.map((item, i) => `
            <div onclick="window.applyJikanData(${i})" style="display:flex;gap:12px;padding:12px;border-radius:8px;cursor:pointer;border:1px solid rgba(139,92,246,0.15);margin-bottom:8px;">
                <img src="${item.images?.jpg?.small_image_url}" style="width:50px;height:70px;object-fit:cover;">
                <div style="flex:1;">
                    <div style="color:#e2e8f0;font-weight:bold;">${item.title}</div>
                    <div style="color:#888;">${item.title_japanese || ''}</div>
                </div>
            </div>
        `).join('');
    }

    // --- Cursor UI ---
    injectCursorThemes() {
        const list = document.getElementById('cursor-theme-list-menu');
        if (!list || !window.CursorManager) return;

        const themes = window.CursorManager.getThemeList();
        if (themes) {
            list.innerHTML = themes.map(theme => `
                <button class="menu-btn" onclick="window.CursorManager.apply('${theme.id}')">
                    ${theme.name}
                </button>
            `).join('');
        }

        const slider = document.getElementById('cursor-scale-slider');
        if (slider) {
            slider.value = localStorage.getItem('cursorScale') || '1';
        }
    }
}

// Singleton & Global Mappings
window.uiController = new UIController();

window.renderApp = (rid) => window.uiController.renderApp(rid);
window.renderAdmin = () => window.uiController.renderAdmin();
window.showToast = (m, t) => window.uiController.showToast(m, t);
window.updateAdminMenu = () => window.uiController.updateAdminMenu();
window.renderPagination = (t) => window.uiController.renderPagination(t);
window.renderSearchSelectsHTML = () => window.uiController.renderSearchSelectsHTML();
window.showJikanSearchModal = (q) => window.uiController.showJikanSearchModal(q);
window.escapeHtml = (s) => window.uiController.escapeHtml(s);

// Event Bridges
window.switchAdminTab = (tab) => {
    window.uiController.currentAdminTab = tab;
    window.uiController.renderAdmin();
};
window.changeAdminPage = (p) => {
    window.uiController.adminPage = p;
    window.uiController.renderAdmin();
};
window.switchGuestbookTab = (tab) => {
    window.uiController.currentGuestbookTab = tab;
    window.uiController.renderAdmin();
};

// Option Helpers
window.editOption = (key, idx, val) => {
    document.getElementById(`opt-input-${key}-${idx}`).style.display = 'inline-block';
    document.getElementById(`opt-text-${key}-${idx}`).style.display = 'none';
};
window.saveOptionEdit = (key, idx, oldVal) => {
    // Call DataManager to save
    const input = document.getElementById(`opt-input-${key}-${idx}`);
    if (input) window.dataManager.updateOption(key, idx, input.value, oldVal);
};

window.injectCursorThemes = () => window.uiController.injectCursorThemes();
