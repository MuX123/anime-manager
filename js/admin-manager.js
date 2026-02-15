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
    if (enable && !window.isAdminLoggedIn) {
        window.showAdminLoginModal();
        return;
    }

    const app = document.getElementById('app');
    const systemMenu = document.getElementById('systemMenu');
    
    if (enable) {
        document.body.classList.add('admin-mode-active');
        window.lastFrontendCategory = window.currentCategory;
        window.currentSection = 'admin';
        
        // 隱藏背景元素（全黑背景）
        const matrixCanvas = document.getElementById('c');
        const atmosphereContainer = document.getElementById('atmosphere-container');
        const atmosphereOverlay = document.getElementById('atmosphere-overlay');
        
        if (matrixCanvas) matrixCanvas.style.display = 'none';
        if (atmosphereContainer) atmosphereContainer.style.display = 'none';
        if (atmosphereOverlay) atmosphereOverlay.style.display = 'none';
        
        // 暫停前台視覺特效以節省資源
        if (window.visualEngine?.stop) {
            window.visualEngine.stop();
        }
        
        window.renderAdmin();
    } else {
        document.body.classList.remove('admin-mode-active');
        if (app) app.classList.remove('admin-mode-active');
        if (systemMenu) systemMenu.classList.remove('admin-mode-active');
        window.currentSection = window.lastFrontendCategory || 'anime';
        
        // 恢復背景元素
        const matrixCanvas = document.getElementById('c');
        const atmosphereContainer = document.getElementById('atmosphere-container');
        const atmosphereOverlay = document.getElementById('atmosphere-overlay');
        
        if (matrixCanvas) matrixCanvas.style.display = 'block';
        if (atmosphereContainer) atmosphereContainer.style.display = 'block';
        if (atmosphereOverlay) atmosphereOverlay.style.display = 'block';
        
        // 恢復前台視覺特效
        if (window.visualEngine?.start) {
            window.visualEngine.start();
        }
        
        window.renderApp();
    }
};

// ===== Admin Render Functions =====

window.renderAdmin = () => {
    const app = document.getElementById('app');
    if (!app) return;

    const filtered = (window.animeData || []).filter(item => item.category === window.currentCategory);
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
                        <button class="category-tab ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">🎬 動畫</button>
                        <button class="category-tab ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">📚 漫畫</button>
                        <button class="category-tab ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">🎥 電影</button>
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
    } else if (currentAdminTab === 'add') {
        return window.renderAnimeForm({});
    } else if (currentAdminTab === 'options') {
        return window.renderOptionsManager?.() || '<div>選項管理載入中...</div>';
    } else if (currentAdminTab === 'settings') {
        return window.renderSettingsPanel?.() || '<div>設定面板載入中...</div>';
    } else if (currentAdminTab === 'guestbook') {
        return '<div>留言板載入中...</div>';
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

window.switchAdminTab = (tab) => {
    window.currentAdminTab = tab;
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

console.log('✅ 管理員模組載入完成');
