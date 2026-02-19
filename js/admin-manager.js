/**
 * admin-manager.js
 * ACG 收藏庫 - 管理員功能模組
 * 從 script.js 提取的管理員相關功能
 */

console.log('⚙️ 載入管理員模組...');

// Admin state
window.isAdminLoggedIn = false;
window.currentAdminTab = 'manage';
window.adminPage = 1;
window.adminItemsPerPage = 10;
window.lastFrontendCategory = 'anime';
window.editId = null;

// ===== Admin Login Functions =====

window.showAdminLoginModal = () => {
    const existingModal = document.getElementById('admin-login-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'admin-login-modal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <h2 style="color: var(--neon-cyan); margin-bottom: 20px; text-align: center;">🔐 管理員登入</h2>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan);">電子郵件</label>
                <input type="email" id="admin-email" placeholder="admin@example.com" style="width: 100%; padding: 12px; border: 1px solid rgba(0,212,255,0.3); border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan);">密碼</label>
                <input type="password" id="admin-password" placeholder="輸入密碼" style="width: 100%; padding: 12px; border: 1px solid rgba(0,212,255,0.3); border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff;">
            </div>
            <div id="login-error" style="color: #ff4444; text-align: center; margin-bottom: 15px; display: none;"></div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" style="flex: 1; padding: 12px;" onclick="window.performAdminLogin()">登入</button>
                <button class="btn-primary" style="flex: 1; border-color: #ff4444; color: #ff4444;" onclick="document.getElementById('admin-login-modal').remove()">取消</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('admin-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.performAdminLogin();
    });
};

window.performAdminLogin = async () => {
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('login-error');

    if (!email || !password) {
        errorDiv.textContent = '請輸入電子郵件和密碼';
        errorDiv.style.display = 'block';
        return;
    }

    errorDiv.style.display = 'none';

    try {
        const result = await window.supabaseManager.signInWithEmail(email, password);

        if (result.success) {
            window.showToast('✓ 登入成功');
            document.getElementById('admin-login-modal').remove();
            await window.checkAndUpdateAdminStatus();
            if (typeof window.renderApp === 'function') {
                window.renderApp();
            }
        } else {
            errorDiv.textContent = result.error || '登入失敗';
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        errorDiv.textContent = '登入過程發生錯誤';
        errorDiv.style.display = 'block';
    }
};

window.adminLogout = async () => {
    const result = await window.supabaseManager.signOut();
    if (result.success) {
        window.isAdminLoggedIn = false;
        window.showToast('✓ 已登出');
        window.updateAdminMenu();
        if (document.querySelector('.admin-container')) {
            window.toggleAdminMode(false);
        }
    } else {
        window.showToast('✗ 登出失敗', 'error');
    }
};

window.checkAndUpdateAdminStatus = async () => {
    if (!window.supabaseManager || !window.supabaseManager.isConnectionReady()) {
        window.isAdminLoggedIn = false;
        return false;
    }

    try {
        const isAdminUser = await window.supabaseManager.checkIsAdmin();
        window.isAdminLoggedIn = isAdminUser;
        window.updateAdminMenu();
        return isAdminUser;
    } catch (err) {
        console.error('[Auth] 檢查管理員狀態出錯:', err);
        window.isAdminLoggedIn = false;
        return false;
    }
};

window.updateAdminMenu = () => {
    const adminContainer = document.getElementById('adminMenuOptions');
    if (adminContainer) {
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
};

window.toggleAdminMode = (enable) => {
    console.log('[Admin] toggleAdminMode called, enable=', enable);
    
    // 強制使用新的 AdminPanel
    if (window.AdminPanel) {
        console.log('[Admin] Using new AdminPanel');
        if (enable && !window.isAdminLoggedIn) {
            window.AdminPanel.Auth.showLogin();
            return;
        }
        if (enable) {
            window.AdminPanel.open();
        } else {
            window.AdminPanel.close();
        }
        return;
    }
    
    // AdminPanel 不存在，顯示錯誤
    console.error('[Admin] AdminPanel not found!');
    alert('錯誤：AdminPanel 未載入，請重新整理頁面');
};

// ===== Admin Render Functions =====

window.renderAdmin = () => {
    console.log('[Admin] renderAdmin called');
    
    // 如果 AdminPanel 存在，直接使用新後台
    if (window.AdminPanel) {
        console.log('[Admin] Opening new AdminPanel');
        window.AdminPanel.open();
        return;
    }
    
    // AdminPanel 不存在
    console.error('[Admin] AdminPanel not found!');
    alert('錯誤：AdminPanel 未載入，請重新整理頁面');
    return;
    
    const filtered = window.dataManager?.getFilteredData?.() || [];
    const paged = filtered.slice((window.adminPage - 1) * window.adminItemsPerPage, window.adminPage * window.adminItemsPerPage);

    const adminTabs = [
        { id: 'manage', icon: '📋', label: '作品管理' },
        { id: 'add', icon: '➕', label: '新增作品' },
        { id: 'guestbook', icon: '💬', label: '留言板' },
        { id: 'options', icon: '⚙️', label: '選項管理' },
        { id: 'settings', icon: '🌐', label: '網站設定' }
    ];

    // Render admin container
    app.innerHTML = `
        <div class="admin-container">
            <div class="admin-layout">
                <aside class="admin-sidebar">
                    <div class="admin-sidebar-header">
                        <h2>⚙️ 管理後台</h2>
                    </div>
                    <nav class="admin-sidebar-nav">
                        ${adminTabs.map(tab => `
                            <button class="admin-nav-item ${window.currentAdminTab === tab.id ? 'active' : ''}" onclick="window.switchAdminTab('${tab.id}')">
                                ${tab.icon} ${tab.label}
                            </button>
                        `).join('')}
                    </nav>
                    <div class="admin-sidebar-footer">
                        <button class="admin-nav-item logout" onclick="window.toggleAdminMode(false)">
                            🚪 返回前台
                        </button>
                    </div>
                </aside>
                <main class="admin-main">
                    <div class="admin-content-header">
                        <h1 style="font-family: 'Orbitron', sans-serif; color: var(--neon-cyan); margin: 0;">${adminTabs.find(t => t.id === window.currentAdminTab)?.label}</h1>
                    </div>
                    <div id="admin-content-body" class="admin-content-body">
                        ${window.renderAdminContent(paged, filtered.length)}
                    </div>
                </main>
            </div>
        </div>
    `;

    // Initialize event listeners
    window.initAdminEventListeners?.();
};

window.renderAdminContent = (pagedData, total) => {
    const { currentAdminTab, currentCategory, adminPage, adminItemsPerPage } = window;

    if (currentAdminTab === 'manage') {
        return `
            <div class="admin-section">
                <div class="admin-section-header">
                        <div class="admin-category-tabs">
                            <button class="category-tab ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">動畫</button>
                            <button class="category-tab ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">漫畫</button>
                            <button class="category-tab ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">電影</button>
                        </div>
                    <div class="admin-actions">
                        <span class="data-count">共 ${total} 筆資料</span>
                        <button class="btn-secondary" onclick="window.exportCSV('${currentCategory}')">📥 匯出</button>
                        <button class="btn-secondary" onclick="window.triggerImport('${currentCategory}')">📤 匯入</button>
                    </div>
                </div>
                
                <div class="admin-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th style="width: 50px;">
                                    <input type="checkbox" id="select-all" onchange="window.toggleSelectAll(this.checked)">
                                </th>
                                <th>作品名稱</th>
                                <th>年份</th>
                                <th>季度</th>
                                <th>評分</th>
                                <th style="width: 180px;">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pagedData.map(item => `
                                <tr>
                                    <td>
                                        <input type="checkbox" class="item-checkbox" data-id="${item.id}" onchange="window.updateBulkDeleteButton()">
                                    </td>
                                    <td class="item-name">${item.name}</td>
                                    <td>${item.year || '-'}</td>
                                    <td>${item.season || '-'}</td>
                                    <td><span class="rating-badge">${item.rating || '-'}</span></td>
                                    <td class="item-actions">
                                        <button class="btn-icon edit" onclick="window.editAnime('${item.id}')" title="編輯">📝</button>
                                        <button class="btn-icon delete" onclick="window.deleteAnime('${item.id}')" title="刪除">✕</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="admin-pagination">
                    ${window.renderAdminPagination(total)}
                </div>
            </div>
        `;
    } else if (currentAdminTab === 'add' || currentAdminTab === 'edit') {
        const { editId, animeData } = window;
        const item = editId ? (animeData || []).find(a => a.id === editId) : {};
        return window.renderAnimeForm(item);
    } else if (currentAdminTab === 'options') {
        return window.renderOptionsManager?.() || '<div>選項管理載入中...</div>';
    } else if (currentAdminTab === 'settings') {
        return window.renderSettingsPanel();
    } else if (currentAdminTab === 'guestbook') {
        // 由於 renderGuestbookAdmin 是非同步的，我們先返回預覽並在背景載入
        setTimeout(async () => {
            const body = document.getElementById('admin-content-body');
            if (body && window.currentAdminTab === 'guestbook') {
                body.innerHTML = await window.renderGuestbookAdmin();
            }
        }, 0);
        return '<div style="padding: 50px; text-align: center; color: var(--neon-cyan);">⌛ 正在載入留言資料...</div>';
    }

    return '<div>未知標籤</div>';
};

window.renderAdminPagination = (total) => {
    const pages = Math.ceil(total / window.adminItemsPerPage);
    if (pages <= 1) return '';

    let btns = [];
    const maxVisible = 5;
    let start = Math.max(1, window.adminPage - 2);
    let end = Math.min(pages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (window.adminPage > 1) {
        btns.push(`<button class="btn-minimal" onclick="window.changeAdminPage(${window.adminPage - 1})">◀</button>`);
    }

    for (let i = start; i <= end; i++) {
        btns.push(`<button class="btn-primary ${window.adminPage === i ? 'active' : ''}" style="width: 40px; padding: 8px 0;" onclick="window.changeAdminPage(${i})">${i}</button>`);
    }

    if (window.adminPage < pages) {
        btns.push(`<button class="btn-minimal" onclick="window.changeAdminPage(${window.adminPage + 1})">▶</button>`);
    }

    return `<div class="pagination">${btns.join('')}</div>`;
};

window.switchAdminTab = (tab, hOldId = null) => {
    window.currentAdminTab = tab;
    window.editId = hOldId;
    window.adminPage = 1;
    window.renderAdmin();
};

window.switchCategory = (cat) => {
    window.currentCategory = cat;
    window.adminPage = 1;
    window.renderAdmin();
};

// ===== Admin CRUD Functions =====

window.editAnime = (id) => {
    window.switchAdminTab('edit', id);
};

window.deleteAnime = async (id) => {
    if (!confirm('確定要刪除此作品嗎？')) return;
    try {
        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase 未連接');
        const { error } = await client.from('anime_list').delete().eq('id', id);
        if (error) throw error;
        window.showToast('✓ 已刪除');
        await window.loadData?.();
        window.renderAdmin();
    } catch (err) {
        window.showToast('✗ 刪除失敗', 'error');
    }
};

window.deleteAllInCategory = async () => {
    const count = (window.animeData || []).filter(a => a.category === window.currentCategory).length;
    if (count === 0) {
        window.showToast('✗ 該板塊沒有作品', 'warning');
        return;
    }

    if (!confirm(`⚠️ 確定要刪除全部 ${count} 個 ${window.currentCategory} 作品嗎？\n此操作無法復原！`)) return;
    if (!confirm(`再次確認：確定要刪除全部 ${count} 個 ${window.currentCategory} 作品？`)) return;

    try {
        window.showToast('🗑 正在刪除...', 'info');
        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase 未連接');
        const { error } = await client.from('anime_list').delete().eq('category', window.currentCategory);
        if (error) throw error;

        window.showToast(`✓ 已刪除全部 ${count} 個 ${window.currentCategory} 作品`);
        await window.loadData?.();
        window.renderAdmin();
    } catch (err) {
        console.error('Delete all error:', err);
        window.showToast('✗ 刪除失敗：' + err.message, 'error');
    }
};

window.exportCSV = (cat) => {
    const filtered = (window.animeData || []).filter(item => item.category === cat);
    if (filtered.length === 0) return window.showToast('✗ 無資料可匯出', 'error');

    const fields = ['name', 'poster_url', 'description', 'year', 'month', 'season', 'genre', 'episodes', 'rating', 'recommendation'];
    const headers = ['作品名稱', '海報網址', '簡介', '年份', '月份', '季度', '類型', '集數', '評分', '推薦度'];

    const csvRows = [headers.join(',')];
    for (const item of filtered) {
        const row = fields.map(f => {
            let val = item[f] || '';
            if (Array.isArray(val)) val = val.join('|');
            const cleanVal = String(val).replace(/"/g, '""');
            return `"${cleanVal}"`;
        });
        csvRows.push(row.join(','));
    }

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acg_${cat}_${new Date().getTime()}.csv`;
    a.click();
    window.showToast('✓ 匯出成功');
};

window.triggerImport = (cat) => {
    window.importTarget = cat;
    document.getElementById('importFile')?.click();
};

window.toggleSelectAll = (checked) => {
    document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = checked);
    window.updateBulkDeleteButton();
};

window.updateBulkDeleteButton = () => {
    const checkboxes = document.querySelectorAll('.item-checkbox:checked');
    const count = checkboxes.length;
    const btn = document.getElementById('bulk-delete-btn');
    const countSpan = document.getElementById('selected-count');

    if (btn && countSpan) {
        btn.style.display = count > 0 ? 'block' : 'none';
        countSpan.textContent = count;
    }
};

window.bulkDeleteAnime = async () => {
    const checkboxes = document.querySelectorAll('.item-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.dataset.id);

    if (ids.length === 0) return;
    if (!confirm(`確定要刪除選中的 ${ids.length} 個作品嗎？`)) return;

    try {
        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase 未連接');
        const { error } = await client.from('anime_list').delete().in('id', ids);
        if (error) throw error;
        window.showToast('✓ 已刪除選中作品');
        await window.loadData?.();
        window.renderAdmin();
    } catch (err) {
        console.error('Bulk delete error:', err);
        window.showToast('✗ 刪除失敗', 'error');
    }
};


// ===== Anime Form & Jikan API Integration =====

window.renderAnimeForm = (item = {}) => {
    const { optionsData, siteSettings, editId } = window;
    const isEdit = !!item.id;
    const genres = Array.isArray(item.genre) ? item.genre : [];
    const extraData = item.extra_data || {};

    return `
            <div class="admin-section">
                <div class="admin-section-header" style="margin-bottom: 25px;">
                    <h3 style="color: var(--neon-cyan); margin: 0; font-family: 'Orbitron';">${isEdit ? '📝 編輯作品' : '➕ 新增作品'}</h3>
                    <button class="btn-primary" onclick="window.switchAdminTab('manage')">✕ 返回列表</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">作品名稱</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="text" id="form-name" value="${item.name || ''}" style="flex: 1; padding: 12px; font-size: 16px;">
                        <button onclick="window.autoCompleteAnimeData()" class="btn-primary" style="white-space: nowrap; padding: 12px 20px; border-color: #8b5cf6; color: #c4b5fd; background: rgba(139,92,246,0.1);">✨ MAL 自動補全</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 380px 1fr; gap: 40px; align-items: start; max-width: 100%;">
                    <!-- Left Column: Attributes -->
                    <div style="display: flex; flex-direction: column; gap: 15px; background: rgba(0,212,255,0.03); padding: 25px; border-radius: 12px; border: 1px solid rgba(0,212,255,0.1);">
                        <div style="color: var(--neon-cyan); font-weight: bold; border-bottom: 1px solid rgba(0,212,255,0.2); padding-bottom: 12px; margin-bottom: 10px; font-size: 15px;">基本屬性</div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px;">主分類</label>
                                <select id="form-category" style="width: 100%;">
                                    <option value="anime" ${item.category === 'anime' ? 'selected' : ''}>動畫</option>
                                    <option value="manga" ${item.category === 'manga' ? 'selected' : ''}>漫畫</option>
                                    <option value="movie" ${item.category === 'movie' ? 'selected' : ''}>電影</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px;">年份</label>
                                <select id="form-year" style="width: 100%;">
                                    <option value="">-</option>
                                    ${(optionsData.year || []).map(y => `<option value="${y}" ${item.year === y ? 'selected' : ''}>${y}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px;">季度</label>
                                <select id="form-season" style="width: 100%;">
                                    <option value="">-</option>
                                    ${(optionsData.season || []).map(s => `<option value="${s}" ${item.season === s ? 'selected' : ''}>${s}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px;">月份</label>
                                <select id="form-month" style="width: 100%;">
                                    <option value="">-</option>
                                    ${(optionsData.month || []).map(m => `<option value="${m}" ${item.month === m ? 'selected' : ''}>${m}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px;">集數</label>
                                <input type="text" id="form-episodes" value="${item.episodes || ''}" placeholder="12" style="width: 100%;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; color: var(--neon-purple); font-size: 12px;">評分</label>
                                <select id="form-rating" style="width: 100%; border-color: var(--neon-purple);">
                                    <option value="">-</option>
                                    ${(optionsData.rating || []).map(r => `<option value="${r}" ${item.rating === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; color: var(--neon-cyan); font-size: 12px;">推薦度</label>
                                <select id="form-recommendation" style="width: 100%;">
                                    <option value="">-</option>
                                    ${(optionsData.recommendation || []).map(r => `<option value="${r}" ${item.recommendation === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        ${(optionsData.custom_lists || []).length > 0 ? `
                            <div style="color: var(--neon-cyan); font-weight: bold; border-bottom: 1px solid rgba(0,212,255,0.2); padding-bottom: 8px; margin-top: 10px; margin-bottom: 5px;">自訂欄位</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; max-height: 250px; overflow-y: auto;">
                                ${(optionsData.custom_lists || []).map(key => `
                                    <div>
                                        <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${siteSettings.custom_labels?.[key] || key}</label>
                                        <select class="form-custom-list" data-key="${key}" style="width: 100%;">
                                            <option value="">-</option>
                                            ${(optionsData[key] || []).map(opt => `<option value="${opt}" ${extraData[key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                                        </select>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        <div style="color: var(--neon-cyan); font-weight: bold; border-bottom: 1px solid rgba(0,212,255,0.2); padding-bottom: 8px; margin-top: 10px; margin-bottom: 10px;">顏色自訂</div>
                        <div style="display: flex; gap: 20px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="color" id="form-name-color" value="${item.name_color || '#ffffff'}" style="width: 30px; height: 30px; border: none; padding: 0; background: none; cursor: pointer;">
                                <span style="font-size: 12px; color: #aaa;">名稱顏色</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="color" id="form-star-color" value="${item.star_color || '#ffcc00'}" style="width: 30px; height: 30px; border: none; padding: 0; background: none; cursor: pointer;">
                                <span style="font-size: 12px; color: #aaa;">星星顏色</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Content -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-bold: bold;">海報圖片網址</label>
                            <input type="text" id="form-poster" value="${item.poster_url || ''}" placeholder="https://..." style="width: 100%;">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-bold: bold;">YouTube PV 影片網址</label>
                            <input type="text" id="form-youtube" value="${item.youtube_url || ''}" placeholder="https://www.youtube.com/watch?v=..." style="width: 100%;">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-bold: bold;">描述 / 簡介 / 心得</label>
                            <textarea id="form-desc" rows="10" style="width: 100%; resize: vertical;">${item.description || ''}</textarea>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-bold: bold;">類型 / 標籤</label>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(0,212,255,0.1); max-height: 150px; overflow-y: auto;">
                                ${(optionsData.genre || []).map(g => {
        const isChecked = genres.includes(g);
        return `
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 10px; background: ${isChecked ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)'}; border-radius: 6px; border: 1px solid ${isChecked ? 'var(--neon-cyan)' : 'transparent'};">
                                            <input type="checkbox" name="form-genre" value="${g}" ${isChecked ? 'checked' : ''}>
                                            <span style="font-size: 13px;">${g}</span>
                                        </label>`;
    }).join('')}
                            </div>
                        </div>

                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <label style="color: var(--neon-cyan); font-weight: bold;">相關連結</label>
                                <button class="btn-primary" onclick="window.addLinkRow()" style="font-size: 12px; padding: 4px 12px;">+ 新增連結</button>
                            </div>
                            <div id="links-list" style="display: flex; flex-direction: column; gap: 10px;">
                                ${(item.links || []).map(link => `
                                    <div class="link-row-item" style="display: flex; gap: 10px;">
                                        <input type="text" placeholder="名稱" class="link-name" value="${link.name}" style="flex: 1;">
                                        <input type="text" placeholder="網址" class="link-url" value="${link.url}" style="flex: 3;">
                                        <button class="btn-icon delete" onclick="this.parentElement.remove()" style="width: 35px; height: 35px;">✕</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 40px; text-align: center; padding-top: 30px; border-top: 1px solid rgba(0,212,255,0.1);">
                    <button class="btn-primary" onclick="window.saveAnime()" style="width: 300px; padding: 15px; font-size: 18px; border-radius: 12px; box-shadow: 0 0 20px rgba(0,212,255,0.2);">
                        💾 ${isEdit ? '儲存變更' : '新增作品'}
                    </button>
                </div>
            </div>
    `;
};

window.addLinkRow = () => {
    const list = document.getElementById('links-list');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'link-row-item';
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.innerHTML = `
        <input type="text" placeholder="名稱" class="link-name" style="flex: 1;">
        <input type="text" placeholder="網址" class="link-url" style="flex: 3;">
        <button class="btn-icon delete" onclick="this.parentElement.remove()" style="width: 35px; height: 35px;">✕</button>
    `;
    list.appendChild(row);
};

window.saveAnime = async () => {
    const { editId } = window;
    try {
        const name = document.getElementById('form-name')?.value?.trim();
        if (!name) throw new Error('請輸入作品名稱');

        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase 未連接');

        const genres = Array.from(document.querySelectorAll('input[name="form-genre"]:checked')).map(cb => cb.value);
        const links = Array.from(document.querySelectorAll('.link-row-item')).map(row => ({
            name: row.querySelector('.link-name')?.value?.trim(),
            url: row.querySelector('.link-url')?.value?.trim()
        })).filter(l => l.name && l.url);

        const extra_data = {};
        document.querySelectorAll('.form-custom-list').forEach(select => {
            const key = select.getAttribute('data-key');
            if (select.value) extra_data[key] = select.value;
        });

        const payload = {
            name,
            genre: genres,
            category: document.getElementById('form-category').value,
            poster_url: document.getElementById('form-poster').value.trim(),
            youtube_url: document.getElementById('form-youtube').value.trim(),
            description: document.getElementById('form-desc').value.trim(),
            year: document.getElementById('form-year').value,
            month: document.getElementById('form-month').value,
            season: document.getElementById('form-season').value,
            rating: document.getElementById('form-rating').value,
            recommendation: document.getElementById('form-recommendation').value,
            episodes: document.getElementById('form-episodes').value.trim(),
            name_color: document.getElementById('form-name-color').value,
            star_color: document.getElementById('form-star-color').value,
            links,
            extra_data: Object.keys(extra_data).length > 0 ? extra_data : null,
            updated_at: new Date().toISOString()
        };

        let result;
        if (editId) {
            result = await client.from('anime_list').update(payload).eq('id', editId);
        } else {
            payload.created_at = new Date().toISOString();
            result = await client.from('anime_list').insert([payload]);
        }

        if (result.error) throw result.error;

        window.showToast(editId ? '✓ 已更新作品' : '✓ 已新增作品');
        await window.loadData();
        window.switchAdminTab('manage');
    } catch (err) {
        console.error('Save anime error:', err);
        window.showToast('✗ 儲存失敗: ' + err.message, 'error');
    }
};

// Jikan API Integration
window.autoCompleteAnimeData = async () => {
    const name = document.getElementById('form-name')?.value?.trim();
    if (!name) return window.showToast('✗ 請先輸入作品名稱', 'error');
    window.showJikanSearchModal(name);
};

window.showJikanSearchModal = (query) => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);';
    modal.id = 'jikan-modal';
    modal.innerHTML = `
        <div style="background: #0a0e1a; border: 1px solid var(--neon-cyan); border-radius: 12px; width: 90%; max-width: 600px; padding: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: var(--neon-cyan); margin: 0;">✨ MAL 資料搜尋</h3>
                <button onclick="document.getElementById('jikan-modal').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;">✕</button>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <input type="text" id="jikan-query" value="${query}" style="flex: 1;" placeholder="輸入日文或英文名稱...">
                <button class="btn-primary" onclick="window.executeJikanSearch()">搜尋</button>
            </div>
            <div id="jikan-results" style="max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
                <div style="text-align: center; color: #666; padding: 20px;">輸入名稱後點擊搜尋...</div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    window.executeJikanSearch();
};

window.executeJikanSearch = async () => {
    const query = document.getElementById('jikan-query')?.value?.trim();
    const resultsContainer = document.getElementById('jikan-results');
    if (!query || !resultsContainer) return;

    resultsContainer.innerHTML = '<div style="text-align: center; color: var(--neon-cyan);">⌛ 搜尋中...</div>';

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            resultsContainer.innerHTML = '<div style="text-align: center; color: #ff4444;">未找到相關作品</div>';
            return;
        }

        window._jikanSearchResults = data.data;
        resultsContainer.innerHTML = data.data.map((item, index) => `
            <div onclick="window.applyJikanData(${index})" style="display: flex; gap: 15px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,212,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                <img src="${item.images?.jpg?.small_image_url}" style="width: 50px; height: 70px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <div style="color: #fff; font-weight: bold; font-size: 14px;">${item.title}</div>
                    <div style="color: #888; font-size: 12px; margin-top: 4px;">${item.title_japanese || ''}</div>
                    <div style="color: var(--neon-cyan); font-size: 11px; margin-top: 4px;">${item.year || ''} | ${item.type || ''} | ${item.episodes || '?'} 集</div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        resultsContainer.innerHTML = `<div style="text-align: center; color: #ff4444;">搜尋發生錯誤</div>`;
    }
};

window.applyJikanData = async (index) => {
    const item = window._jikanSearchResults?.[index];
    if (!item) return;

    document.getElementById('jikan-modal')?.remove();
    window.showToast('⌛ 補全資料中...', 'info');

    try {
        if (document.getElementById('form-poster')) document.getElementById('form-poster').value = item.images?.jpg?.large_image_url || '';
        if (document.getElementById('form-episodes')) document.getElementById('form-episodes').value = item.episodes || '';
        if (document.getElementById('form-desc')) document.getElementById('form-desc').value = item.synopsis || '';

        if (item.trailer?.url && document.getElementById('form-youtube')) {
            document.getElementById('form-youtube').value = item.trailer.url;
        }

        // Try to map genres
        const genreCheckboxes = document.querySelectorAll('input[name="form-genre"]');
        const apiGenres = item.genres?.map(g => g.name.toLowerCase()) || [];

        genreCheckboxes.forEach(cb => {
            const val = cb.value.toLowerCase();
            if (apiGenres.some(ag => ag.includes(val) || val.includes(ag))) {
                cb.checked = true;
                if (cb.parentElement) {
                    cb.parentElement.style.background = 'rgba(0,212,255,0.1)';
                    cb.parentElement.style.borderColor = 'var(--neon-cyan)';
                }
            }
        });

        window.showToast('✓ 已自動補全部分資料');
    } catch (err) {
        window.showToast('✗ 補全資料失敗', 'error');
    }
};

// ===== Options Manager Functions =====

window.renderOptionsManager = () => {
    const { optionsData, siteSettings } = window;
    const defaultKeys = ['genre', 'year', 'month', 'season', 'episodes', 'rating', 'recommendation'];
    const customKeys = optionsData.custom_lists || [];
    const allKeys = [...defaultKeys, ...customKeys];
    const categoryColors = optionsData.category_colors || {};
    const ratingColors = optionsData.rating_colors || {};

    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; gap: 15px; align-items: center; background: rgba(0,212,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(0,212,255,0.1);">
                <input type="text" id="new-list-name" placeholder="輸入新列表名稱 (如: 載體)" style="width: 250px;">
                <button class="btn-primary" onclick="window.addNewCustomList()">＋ 新增自訂列表</button>
            </div>
            
            <div id="optionsWrapper" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 25px;">
                ${allKeys.map(key => `
                    <div class="admin-panel-v492" style="background: rgba(0,212,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(0,212,255,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                            <h3 style="color: var(--neon-cyan); margin: 0; font-size: 16px;">
                                ${key === 'genre' ? '🎭 類型 (Genre)' :
            key === 'year' ? '📅 年份 (Year)' :
                key === 'rating' ? '⭐ 評分 (Rating)' :
                    key === 'recommendation' ? '❤️ 推薦度' :
                        key === 'episodes' ? '📺 集數' :
                            key === 'season' ? '❄️ 季度' :
                                key === 'month' ? '🌙 月份' :
                                    siteSettings.custom_labels?.[key] || key}
                            </h3>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                ${customKeys.includes(key) ? `<button class="btn-icon delete" onclick="window.deleteCustomList('${key}')" title="刪除列表">✕</button>` : ''}
                                <button class="btn-primary" onclick="window.showBulkImportModal('${key}')" style="font-size: 11px; padding: 4px 10px;">批量</button>
                            </div>
                        </div>

                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px;">
                            ${(optionsData[key] || []).map((opt, idx) => `
                                <div class="option-item-pill" style="display: flex; align-items: center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 4px 12px; gap: 8px;">
                                    <span id="opt-text-${key}-${idx}" style="font-size: 13px;">${opt}</span>
                                    <input type="text" id="opt-input-${key}-${idx}" value="${opt}" style="display: none; width: 80px; padding: 2px 5px; font-size: 12px;" onblur="window.saveOptionEdit('${key}', ${idx}, '${opt}')">
                                    <div style="display: flex; gap: 4px;">
                                        <button onclick="window.editOption('${key}', ${idx})" style="background:none; border:none; color:#888; cursor:pointer; font-size:12px;">✎</button>
                                        <button onclick="window.deleteOptionItem('${key}', ${idx})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:12px;">✕</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="add-opt-${key}" placeholder="新增選項..." style="flex: 1; padding: 6px 12px; font-size: 13px;">
                            <button class="btn-primary" onclick="window.addOptionItem('${key}')" style="padding: 6px 15px;">＋</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

window.addNewCustomList = async () => {
    const input = document.getElementById('new-list-name');
    const name = input?.value?.trim();
    if (!name) return window.showToast('✗ 請輸入列表名稱', 'error');

    const key = 'custom_' + Date.now();
    if (!window.optionsData.custom_lists) window.optionsData.custom_lists = [];
    window.optionsData.custom_lists.push(key);
    window.optionsData[key] = [];

    if (!window.siteSettings.custom_labels) window.siteSettings.custom_labels = {};
    window.siteSettings.custom_labels[key] = name;

    await window.saveOptionsToDB();
    // Also save custom_labels
    const client = window.supabaseManager?.getClient();
    if (client) {
        await client.from('site_settings').upsert({ id: 'custom_labels', value: JSON.stringify(window.siteSettings.custom_labels) });
    }

    window.renderAdmin();
};

window.deleteCustomList = async (key) => {
    if (!confirm('確定要刪除此列表嗎？此操作無法復原。')) return;
    window.optionsData.custom_lists = window.optionsData.custom_lists.filter(k => k !== key);
    delete window.optionsData[key];
    if (window.siteSettings.custom_labels) delete window.siteSettings.custom_labels[key];

    await window.saveOptionsToDB();
    window.renderAdmin();
};

window.addOptionItem = async (key) => {
    const input = document.getElementById(`add-opt-${key}`);
    const val = input?.value?.trim();
    if (!val) return;

    if (!window.optionsData[key]) window.optionsData[key] = [];
    if (window.optionsData[key].includes(val)) return window.showToast('✗ 選項已存在', 'error');

    window.optionsData[key].push(val);
    input.value = '';
    await window.saveOptionsToDB();
    window.renderAdmin();
};

window.deleteOptionItem = async (key, idx) => {
    if (!confirm('確定要刪除此選項嗎？')) return;
    window.optionsData[key].splice(idx, 1);
    await window.saveOptionsToDB();
    window.renderAdmin();
};

window.editOption = (key, idx) => {
    document.getElementById(`opt-text-${key}-${idx}`).style.display = 'none';
    const input = document.getElementById(`opt-input-${key}-${idx}`);
    input.style.display = 'inline-block';
    input.focus();
    input.select();
};

window.saveOptionEdit = async (key, idx, oldVal) => {
    const input = document.getElementById(`opt-input-${key}-${idx}`);
    const newVal = input.value.trim();
    if (!newVal || newVal === oldVal) {
        input.style.display = 'none';
        document.getElementById(`opt-text-${key}-${idx}`).style.display = 'inline';
        return;
    }

    window.optionsData[key][idx] = newVal;
    await window.saveOptionsToDB();
    window.renderAdmin();
};

window.showBulkImportModal = (key) => {
    const modal = document.createElement('div');
    modal.id = 'bulk-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);';
    modal.innerHTML = `
        <div style="background: #0a0e1a; border: 1px solid var(--neon-cyan); border-radius: 12px; width: 90%; max-width: 400px; padding: 25px;">
            <h3 style="color: var(--neon-cyan); margin-top: 0; margin-bottom: 15px;">📋 批量匯入選項</h3>
            <p style="font-size: 12px; color: #888; margin-bottom: 10px;">每行一個選項，重複項會自動過濾。</p>
            <textarea id="bulk-input" rows="10" style="width: 100%; margin-bottom: 15px; font-family: monospace;"></textarea>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="document.getElementById('bulk-modal').remove()" class="btn-primary" style="background: none; border-color: #666; color: #888;">取消</button>
                <button class="btn-primary" onclick="window.executeBulkImport('${key}')">匯入</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.executeBulkImport = async (key) => {
    const text = document.getElementById('bulk-input')?.value?.trim();
    if (!text) return;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l && !window.optionsData[key].includes(l));
    if (lines.length > 0) {
        window.optionsData[key] = [...window.optionsData[key], ...lines];
        await window.saveOptionsToDB();
        window.showToast(`✓ 已匯入 ${lines.length} 個新選項`);
    }
    document.getElementById('bulk-modal')?.remove();
    window.renderAdmin();
};

window.saveOptionsToDB = async () => {
    const client = window.supabaseManager?.getClient();
    if (!client) return;
    try {
        await client.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(window.optionsData) });
        window.showToast('✓ 設定已同步');
    } catch (e) {
        window.showToast('✗ 同步失敗', 'error');
    }
};

// ===== Guestbook Admin Functions =====

window.renderGuestbookAdmin = async () => {
    const client = window.supabaseManager?.getClient();
    if (!client) return '<div style="padding: 20px; color: #ff4444;">Supabase 未連接</div>';

    try {
        const { data: messages, error } = await client.from('guestbook_messages').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;

        const pending = messages.filter(m => m.status === 'pending');
        const approved = messages.filter(m => m.status === 'approved');

        return `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; gap: 20px; align-items: flex-end;">
                    <div class="stat-card" style="background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2); padding: 15px 25px; border-radius: 10px;">
                        <div style="font-size: 24px; font-weight: bold; color: #fbbf24;">${pending.length}</div>
                        <div style="font-size: 12px; color: #888;">待審核</div>
                    </div>
                </div>

                <div class="admin-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th style="width: 120px;">暱稱</th>
                                <th>內容</th>
                                <th style="width: 150px;">時間</th>
                                <th style="width: 100px;">狀態</th>
                                <th style="width: 150px;">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${messages.map(m => `
                                <tr>
                                    <td style="font-weight: bold; color: var(--neon-cyan);">${m.nickname}</td>
                                    <td style="font-size: 13px; line-height: 1.4; color: #ddd;">${m.content}</td>
                                    <td style="font-size: 12px; color: #888;">${new Date(m.created_at).toLocaleString()}</td>
                                    <td>
                                        <span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; ${m.status === 'pending' ? 'background: rgba(251,191,36,0.1); color: #fbbf24;' : 'background: rgba(16,185,129,0.1); color: #10b981;'}">
                                            ${m.status === 'pending' ? '待審核' : '已通過'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style="display: flex; gap: 5px;">
                                            ${m.status === 'pending' ? `<button class="btn-primary" onclick="window.moderateGuestbook('${m.id}', 'approved')" style="font-size: 11px; padding: 4px 8px;">通過</button>` : ''}
                                            <button class="btn-icon delete" onclick="window.moderateGuestbook('${m.id}', 'delete')" title="刪除">✕</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (err) {
        return `<div style="padding: 20px; color: #ff4444;">載入失敗: ${err.message}</div>`;
    }
};

window.moderateGuestbook = async (id, action) => {
    const client = window.supabaseManager?.getClient();
    if (!client) return;

    try {
        if (action === 'delete') {
            if (!confirm('確定要刪除這條留言嗎？')) return;
            const { error } = await client.from('guestbook_messages').delete().eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await client.from('guestbook_messages').update({ status: action }).eq('id', id);
            if (error) throw error;
        }

        window.showToast('✓ 已處理留言');
        window.renderAdmin();
    } catch (err) {
        window.showToast('✗ 處理失敗', 'error');
    }
};

// ===== Data Export/Import Functions =====

window.exportCSV = (category) => {
    const { animeData } = window;
    const filtered = animeData.filter(item => item.category === category);
    if (filtered.length === 0) return window.showToast('✗ 無資料可匯出');

    const headers = ['ID', '名稱', '海報網址', '類型', '年份', '季度', '評分', '集數', '簡介'];
    const rows = filtered.map(item => [
        item.id,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${(item.poster_url || '').replace(/"/g, '""')}"`,
        `"${(item.genre || []).join('|').replace(/"/g, '""')}"`,
        item.year || '',
        item.season || '',
        item.rating || '',
        item.episodes || '',
        `"${(item.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anime_list_${category}_${Date.now()}.csv`;
    a.click();
    window.showToast('✓ 已導出 CSV');
};

window.triggerImport = (category) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => window.importData(e, category);
    input.click();
};

window.importData = async (event, category) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target.result;
            const rows = text.split('\n').filter(row => row.trim());
            // Basic CSV parsing logic (very simple, might not handle complex quotes well)
            // In a real app, use PapaParse or similar
            const client = window.supabaseManager?.getClient();
            if (!client) throw new Error('Supabase 未連接');

            window.showToast('⌛ 正在匯入資料...', 'info');

            // This is a placeholder for real CSV parsing and importing
            // For now, prompt the user that a real parser is needed for complex CSVs
            window.showToast('⚠ CSV 匯入功能尚未完全實現，請使用 JSON 匯入/匯出全站設定', 'warning');
        } catch (err) {
            window.showToast('✗ 匯入失敗', 'error');
        }
    };
    reader.readAsText(file);
};

// ===== Website Settings Functions =====


window.renderSettingsPanel = () => {
    const siteSettings = window.siteSettings || {};
    const optionsData = window.optionsData || {};

    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; width: 100%; margin: 0 auto; padding-bottom: 50px;">
            <div class="admin-panel-v492" style="background: rgba(0,212,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2);">
                <h3 style="color: var(--neon-cyan); border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">🌐 網站基本設定</h3>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">網站標題</label>
                    <input type="text" id="set-title" value="${siteSettings.site_title || ''}" style="width: 100%;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">標題顏色</label>
                    <div class="color-input-wrapper" style="width: 100%;">
                        <div class="color-swatch" style="background: ${siteSettings.title_color || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-title-color').click()"></div>
                        <input type="color" id="set-title-color" value="${siteSettings.title_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">首頁跑馬燈訊息</label>
                    <textarea id="set-announcement" style="width: 100%; height: 120px; resize: vertical;">${siteSettings.announcement || ''}</textarea>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">跑馬燈訊息顏色</label>
                    <div class="color-input-wrapper" style="width: 100%;">
                        <div class="color-swatch" style="background: ${siteSettings.announcement_color || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-announcement-color').click()"></div>
                        <input type="color" id="set-announcement-color" value="${siteSettings.announcement_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                    </div>
                </div>
            </div>

            <div class="admin-panel-v492" style="background: rgba(0,212,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2);">
                <h3 style="color: var(--neon-cyan); border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">👤 管理員個人化</h3>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">顯示名稱</label>
                    <input type="text" id="set-admin-name" value="${siteSettings.admin_name || '管理員'}" style="width: 100%;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">頭像網址</label>
                    <input type="text" id="set-admin-avatar" value="${siteSettings.admin_avatar || ''}" style="width: 100%;" placeholder="https://...">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">名稱顏色</label>
                    <div class="color-input-wrapper" style="width: 100%;">
                        <div class="color-swatch" style="background: ${siteSettings.admin_color || '#00ffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-admin-color').click()"></div>
                        <input type="color" id="set-admin-color" value="${siteSettings.admin_color || '#00ffff'}" onchange="this.previousElementSibling.style.background = this.value">
                    </div>
                </div>
            </div>

            <div class="admin-panel-v492" style="background: rgba(0,212,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2); grid-column: 1 / -1;">
                <h3 style="color: var(--neon-cyan); border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">🎨 卡片顏色設定</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div>
                        <label style="font-size: 13px; color: var(--neon-cyan); display: block; margin-bottom: 8px;">作品名稱</label>
                        <div class="color-input-wrapper" style="width: 100%;">
                            <div class="color-swatch" style="background: ${optionsData.category_colors?.name || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-name-color').click()"></div>
                            <input type="color" id="set-name-color" value="${optionsData.category_colors?.name || '#ffffff'}" onchange="window.updateCategoryColorDirect('name', this.value); this.previousElementSibling.style.background = this.value">
                        </div>
                    </div>
                    <div>
                        <label style="font-size: 13px; color: var(--neon-cyan); display: block; margin-bottom: 8px;">簡介文字</label>
                        <div class="color-input-wrapper" style="width: 100%;">
                            <div class="color-swatch" style="background: ${optionsData.category_colors?.desc || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-desc-color').click()"></div>
                            <input type="color" id="set-desc-color" value="${optionsData.category_colors?.desc || '#ffffff'}" onchange="window.updateCategoryColorDirect('desc', this.value); this.previousElementSibling.style.background = this.value">
                        </div>
                    </div>
                    <div>
                        <label style="font-size: 13px; color: var(--neon-cyan); display: block; margin-bottom: 8px;">按鈕顏色</label>
                        <div class="color-input-wrapper" style="width: 100%;">
                            <div class="color-swatch" style="background: ${optionsData.category_colors?.btn_bg || '#00d4ff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-btn-color').click()"></div>
                            <input type="color" id="set-btn-color" value="${optionsData.category_colors?.btn_bg || '#00d4ff'}" onchange="window.updateCategoryColorDirect('btn_bg', this.value); this.previousElementSibling.style.background = this.value">
                        </div>
                    </div>
                </div>
            </div>

            <div class="admin-panel-v492" style="background: rgba(255,255,255,0.02); padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); grid-column: 1 / -1; margin-top: 20px;">
                <h3 style="color: #ffffff; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">📦 備份與還原 (網站設定)</h3>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <button class="btn-primary" onclick="window.exportSiteSettings()" style="flex: 1; border-color: #fbbf24; color: #fbbf24; background: rgba(251,191,36,0.1);">📥 匯出網站設定 (JSON)</button>
                    <div style="flex: 1; position: relative;">
                        <input type="file" id="import-settings-file" accept=".json" style="display: none;" onchange="window.importSiteSettings(event)">
                        <button class="btn-primary" onclick="document.getElementById('import-settings-file').click()" style="width: 100%; border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.1);">📤 匯入網站設定 (JSON)</button>
                    </div>
                </div>
                <p style="font-size: 12px; color: #888; margin-top: 10px;">注意：匯入設定將會直接覆蓋目前的網站標題、訊息、顏色等所有全局設定。</p>
            </div>

            <div style="grid-column: 1 / -1; text-align: center; margin-top: 30px;">
                <button class="btn-primary" style="width: 300px; padding: 20px; font-size: 18px; border-radius: 12px; box-shadow: 0 0 20px rgba(0,212,255,0.2);" onclick="window.saveSettings()">💾 儲存所有設定</button>
            </div>
        </div>
    `;
};

window.saveSettings = async () => {
    try {
        const title = document.getElementById('set-title').value;
        const announcement = document.getElementById('set-announcement').value;
        const titleColor = document.getElementById('set-title-color').value;
        const announcementColor = document.getElementById('set-announcement-color').value;
        const adminName = document.getElementById('set-admin-name').value;
        const adminAvatar = document.getElementById('set-admin-avatar').value;
        const adminColor = document.getElementById('set-admin-color').value;
        const nameColor = document.getElementById('set-name-color').value;
        const descColor = document.getElementById('set-desc-color').value;
        const btnColor = document.getElementById('set-btn-color').value;

        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase 未連接');

        // 更新 optionsData 中的顏色
        if (!window.optionsData.category_colors) window.optionsData.category_colors = {};
        window.optionsData.category_colors.name = nameColor;
        window.optionsData.category_colors.desc = descColor;
        window.optionsData.category_colors.btn_bg = btnColor;

        const settingsToUpdate = [
            { id: 'site_title', value: title },
            { id: 'announcement', value: announcement },
            { id: 'title_color', value: titleColor },
            { id: 'announcement_color', value: announcementColor },
            { id: 'admin_name', value: adminName },
            { id: 'admin_avatar', value: adminAvatar },
            { id: 'admin_color', value: adminColor },
            { id: 'options_data', value: JSON.stringify(window.optionsData) }
        ];

        const { error } = await client.from('site_settings').upsert(settingsToUpdate);
        if (error) throw error;

        // 同步更新全域變數
        window.siteSettings = {
            ...window.siteSettings,
            site_title: title,
            announcement: announcement,
            title_color: titleColor,
            announcement_color: announcementColor,
            admin_name: adminName,
            admin_avatar: adminAvatar,
            admin_color: adminColor
        };

        document.title = title;
        window.showToast('✓ 設定已更新');
        window.renderAdmin();
        if (typeof window.renderApp === 'function') {
            window.renderApp();
        }
    } catch (err) {
        console.error('Save settings error:', err);
        window.showToast('✗ 更新失敗: ' + err.message, 'error');
    }
};

window.updateCategoryColorDirect = async (key, color) => {
    if (!window.optionsData.category_colors) window.optionsData.category_colors = {};
    window.optionsData.category_colors[key] = color;

    const client = window.supabaseManager?.getClient();
    if (client) {
        try {
            await client.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(window.optionsData) });
        } catch (e) {
            console.warn('Update color direct failed:', e);
        }
    }
};

// ===== Site Settings Backup & Restore =====

window.exportSiteSettings = async () => {
    try {
        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase 未連接');

        const { data, error } = await client.from('site_settings').select('*');
        if (error) throw error;

        const backupData = {
            version: '1.0',
            type: 'site_settings',
            exportDate: new Date().toISOString(),
            settings: data
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `site-settings-backup-${Date.now()}.json`;
        a.click();

        window.showToast('✓ 網站設定已導出');
    } catch (err) {
        console.error('Export settings error:', err);
        window.showToast('✗ 導出失敗', 'error');
    }
};

window.importSiteSettings = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const backupData = JSON.parse(e.target.result);
            if (backupData.type !== 'site_settings' || !backupData.settings) {
                throw new Error('此檔案不是有效的網站設定備份');
            }

            const client = window.supabaseManager?.getClient();
            if (!client) throw new Error('Supabase 未連接');

            // 逐個 upsert 設定項
            const { error } = await client.from('site_settings').upsert(backupData.settings);
            if (error) throw error;

            window.showToast('✓ 網站設定已成功還原');

            // 重新讀取資料並刷新頁面
            location.reload();
        } catch (err) {
            console.error('Import settings error:', err);
            window.showToast('✗ 還原失敗: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
};

console.log('✅ 管理員 CRUD 函數已載入');


window.changeAdminPage = (p) => {
    window.adminPage = p;
    window.renderAdmin();
};

// ===== Auth State Listener =====

if (window.supabaseManager?.client?.auth) {
    window.supabaseManager.client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
            await window.checkAndUpdateAdminStatus();
        } else if (event === 'SIGNED_OUT') {
            window.isAdminLoggedIn = false;
            window.updateAdminMenu();
        }
    });
}

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('admin-manager', {
        loaded: true,
        exports: { 
            toggleAdminMode: window.toggleAdminMode,
            renderAdmin: window.renderAdmin,
            checkAndUpdateAdminStatus: window.checkAndUpdateAdminStatus,
            updateAdminMenu: window.updateAdminMenu,
            performAdminLogin: window.performAdminLogin,
            showAdminLoginModal: window.showAdminLoginModal,
            changeAdminPage: window.changeAdminPage
        },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: admin-manager');
}

console.log('✅ 管理員模組載入完成');
