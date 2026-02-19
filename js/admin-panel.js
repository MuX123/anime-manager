/**
 * admin-panel.js
 * ACG 收藏庫 - 全新管理後台系統 v9.0.0
 */

console.log('🔧 載入 admin-panel.js...');

// ===== Admin Panel State =====
window.AdminPanel = {
    isOpen: false,
    currentTab: 'dashboard',
    stats: { total: 0, anime: 0, manga: 0, movie: 0, notice: 0 },
    pagination: { page: 1, perPage: 12, total: 0 },
    filters: { category: 'anime', search: '', rating: '', year: '' }
};

// ===== Authentication =====
window.AdminPanel.Auth = {
    showLogin: () => {
        // 注入樣式
        if (!document.getElementById('admin-panel-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'admin-panel-styles';
            styleEl.textContent = window.AdminPanel.Styles.base.replace(/<\/?style>/g, '');
            document.head.appendChild(styleEl);
        }
        
        const modal = document.createElement('div');
        modal.id = 'admin-panel-login';
        modal.className = 'admin-modal-overlay';
        modal.innerHTML = `
            <div class="admin-login-container">
                <div class="admin-login-header">
                    <span class="admin-logo">⚙️</span>
                    <h2>管理後台</h2>
                </div>
                <form onsubmit="event.preventDefault(); window.AdminPanel.Auth.login();">
                    <div class="admin-input-group">
                        <label>電子郵件</label>
                        <input type="email" id="admin-email" placeholder="admin@example.com" required>
                    </div>
                    <div class="admin-input-group">
                        <label>密碼</label>
                        <input type="password" id="admin-password" placeholder="輸入密碼" required>
                    </div>
                    <div id="admin-login-error" class="admin-error"></div>
                    <button type="submit" class="admin-btn primary">登入</button>
                </form>
                <button class="admin-btn secondary" onclick="document.getElementById('admin-panel-login').remove()">取消</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('admin-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.AdminPanel.Auth.login();
        });
    },
    
    login: async () => {
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const errorDiv = document.getElementById('admin-login-error');
        
        try {
            const client = window.supabaseManager?.getClient();
            if (!client) { errorDiv.textContent = 'Supabase 未連接'; return; }
            
            const { error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
            const { data: settings } = await client.from('site_settings').select('value').eq('id', 'admin_email').single();
            if (settings?.value !== email) {
                await client.auth.signOut();
                errorDiv.textContent = '非管理員帳號';
                return;
            }
            
            document.getElementById('admin-panel-login')?.remove();
            window.isAdminLoggedIn = true;
            window.AdminPanel.open();
            window.showToast('管理員登入成功', 'success');
        } catch (err) {
            errorDiv.textContent = err.message || '登入失敗';
        }
    },
    
    logout: async () => {
        await window.supabaseManager?.getClient()?.auth.signOut();
        window.isAdminLoggedIn = false;
        window.AdminPanel.close();
        window.showToast('已登出', 'info');
    }
};

// ===== Main Panel =====
window.AdminPanel.open = () => {
    window.AdminPanel.isOpen = true;
    window.AdminPanel.loadStats();
    window.AdminPanel.render();
    let panel = document.getElementById('admin-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'admin-panel';
        document.body.appendChild(panel);
    }
    panel.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.AdminPanel.close = () => {
    window.AdminPanel.isOpen = false;
    const panel = document.getElementById('admin-panel');
    if (panel) panel.style.display = 'none';
    document.body.style.overflow = '';
};

window.AdminPanel.render = () => {
    const panel = document.getElementById('admin-panel');
    if (!panel) return;
    panel.innerHTML = window.AdminPanel.Layout.render();
    window.AdminPanel.Tabs.renderContent();
};

window.AdminPanel.loadStats = () => {
    const data = window.animeData || [];
    window.AdminPanel.stats = {
        total: data.length,
        anime: data.filter(d => d.category === 'anime').length,
        manga: data.filter(d => d.category === 'manga').length,
        movie: data.filter(d => d.category === 'movie').length,
        notice: data.filter(d => d.category === 'notice').length
    };
};

// ===== Layout =====
window.AdminPanel.Layout = {
    render: () => {
        const tabs = [
            { id: 'dashboard', icon: '◉', label: '總覽' },
            { id: 'items', icon: '▤', label: '作品' },
            { id: 'add', icon: '＋', label: '新增' },
            { id: 'guestbook', icon: '◈', label: '留言' },
            { id: 'options', icon: '⚙', label: '選項' },
            { id: 'settings', icon: '◧', label: '設定' }
        ];
        
        return `
            <div class="admin-panel-container">
                <aside class="admin-sidebar">
                    <div class="admin-sidebar-header">
                        <span class="admin-logo">⚙️</span>
                        <h2>管理後台</h2>
                    </div>
                    <nav class="admin-nav">
                        ${tabs.map(tab => `
                            <button class="admin-nav-item ${window.AdminPanel.currentTab === tab.id ? 'active' : ''}" 
                                    onclick="window.AdminPanel.switchTab('${tab.id}')">
                                <span class="nav-icon">${tab.icon}</span>
                                <span class="nav-label">${tab.label}</span>
                            </button>
                        `).join('')}
                    </nav>
                    <div class="admin-sidebar-footer">
                        <button class="admin-nav-item logout" onclick="window.AdminPanel.Auth.logout()">
                            <span class="nav-icon">←</span>
                            <span class="nav-label">返回前台</span>
                        </button>
                    </div>
                </aside>
                <main class="admin-main">
                    <header class="admin-header">
                        <h1 id="admin-page-title">${tabs.find(t => t.id === window.AdminPanel.currentTab)?.label || '總覽'}</h1>
                        <div class="admin-header-actions">
                            <span class="admin-user">${window.isAdminLoggedIn ? window.supabaseManager?.client?.auth?.currentUser?.email || '' : ''}</span>
                        </div>
                    </header>
                    <div class="admin-content" id="admin-content"></div>
                </main>
                <button class="admin-close-btn" onclick="window.AdminPanel.close()">×</button>
            </div>
            ${window.AdminPanel.Styles.base}
        `;
    }
};

// ===== Styles =====
window.AdminPanel.Styles = {
    base: `
    <style>
        .admin-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 100000; }
        .admin-login-container { background: #1a1a2e; border: 1px solid rgba(0,212,255,0.3); border-radius: 16px; padding: 40px; width: 400px; max-width: 90vw; }
        .admin-login-header { text-align: center; margin-bottom: 30px; }
        .admin-login-header .admin-logo { font-size: 48px; display: block; margin-bottom: 10px; }
        .admin-login-header h2 { color: #00d4ff; margin: 0; font-size: 24px; }
        .admin-input-group { margin-bottom: 20px; }
        .admin-input-group label { display: block; color: #00d4ff; margin-bottom: 8px; font-size: 14px; }
        .admin-input-group input { width: 100%; padding: 12px; border: 1px solid rgba(0,212,255,0.3); border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff; font-size: 14px; box-sizing: border-box; }
        .admin-input-group input:focus { outline: none; border-color: #00d4ff; }
        .admin-error { color: #ff4444; margin-bottom: 15px; font-size: 14px; text-align: center; }
        .admin-btn { width: 100%; padding: 12px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-bottom: 10px; transition: all 0.3s; }
        .admin-btn.primary { background: #00d4ff; color: #000; }
        .admin-btn.primary:hover { background: #00aadd; }
        .admin-btn.secondary { background: transparent; color: #888; border: 1px solid #444; }
        .admin-btn.secondary:hover { border-color: #666; color: #fff; }
        .admin-panel-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; background: #0a0a0f; z-index: 99999; }
        .admin-sidebar { width: 260px; min-width: 260px; background: #12121a; border-right: 1px solid rgba(0,212,255,0.1); display: flex; flex-direction: column; }
        .admin-sidebar-header { padding: 30px 20px; border-bottom: 1px solid rgba(0,212,255,0.1); display: flex; align-items: center; gap: 12px; }
        .admin-sidebar-header .admin-logo { font-size: 28px; }
        .admin-sidebar-header h2 { color: #00d4ff; margin: 0; font-size: 18px; }
        .admin-nav { flex: 1; padding: 20px 10px; overflow-y: auto; }
        .admin-nav-item { width: 100%; padding: 14px 16px; background: transparent; border: none; border-radius: 10px; color: #888; cursor: pointer; display: flex; align-items: center; gap: 12px; font-size: 14px; margin-bottom: 4px; transition: all 0.2s; text-align: left; }
        .admin-nav-item:hover { background: rgba(0,212,255,0.1); color: #fff; }
        .admin-nav-item.active { background: rgba(0,212,255,0.15); color: #00d4ff; }
        .admin-nav-item.logout { border-top: 1px solid rgba(255,255,255,0.1); margin-top: auto; }
        .nav-icon { font-size: 18px; width: 24px; text-align: center; }
        .admin-sidebar-footer { padding: 10px; border-top: 1px solid rgba(255,255,255,0.1); }
        .admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .admin-header { padding: 20px 30px; border-bottom: 1px solid rgba(0,212,255,0.1); display: flex; justify-content: space-between; align-items: center; background: #0f0f18; }
        .admin-header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 500; }
        .admin-header-actions { display: flex; align-items: center; gap: 15px; }
        .admin-user { color: #666; font-size: 13px; }
        .admin-content { flex: 1; padding: 30px; overflow-y: auto; }
        .admin-close-btn { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border: none; border-radius: 50%; color: #fff; font-size: 24px; cursor: pointer; z-index: 10; }
        .admin-close-btn:hover { background: rgba(255,255,255,0.2); }
    </style>
    `
};

// ===== Tab System =====
window.AdminPanel.switchTab = (tabId) => {
    window.AdminPanel.currentTab = tabId;
    window.AdminPanel.pagination.page = 1;
    window.AdminPanel.render();
};

window.AdminPanel.Tabs = {
    renderContent: () => {
        const content = document.getElementById('admin-content');
        if (!content) return;
        const renderMap = {
            'dashboard': window.AdminPanel.Dashboard.render,
            'items': window.AdminPanel.Items.render,
            'add': window.AdminPanel.Add.render,
            'guestbook': window.AdminPanel.Guestbook.render,
            'options': window.AdminPanel.Options.render,
            'settings': window.AdminPanel.Settings.render
        };
        content.innerHTML = renderMap[window.AdminPanel.currentTab]?.() || '';
    }
};

// ===== Dashboard =====
window.AdminPanel.Dashboard = {
    render: () => {
        const stats = window.AdminPanel.stats;
        return `
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.total}</span>
                        <span class="stat-label">總作品數</span>
                    </div>
                </div>
                <div class="stat-card anime">
                    <div class="stat-icon">🎬</div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.anime}</span>
                        <span class="stat-label">動畫</span>
                    </div>
                </div>
                <div class="stat-card manga">
                    <div class="stat-icon">📖</div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.manga}</span>
                        <span class="stat-label">漫畫</span>
                    </div>
                </div>
                <div class="stat-card movie">
                    <div class="stat-icon">🎥</div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.movie}</span>
                        <span class="stat-label">電影</span>
                    </div>
                </div>
            </div>
            <div class="dashboard-sections">
                <div class="dashboard-section">
                    <h3>快速操作</h3>
                    <div class="quick-actions">
                        <button class="admin-action-btn" onclick="window.AdminPanel.switchTab('add')">
                            <span class="action-icon">＋</span>新增作品
                        </button>
                        <button class="admin-action-btn" onclick="window.AdminPanel.switchTab('items')">
                            <span class="action-icon">▤</span>管理作品
                        </button>
                        <button class="admin-action-btn" onclick="window.AdminPanel.switchTab('guestbook')">
                            <span class="action-icon">◈</span>審核留言
                        </button>
                        <button class="admin-action-btn" onclick="window.AdminPanel.switchTab('settings')">
                            <span class="action-icon">◧</span>系統設定
                        </button>
                    </div>
                </div>
                <div class="dashboard-section">
                    <h3>系統狀態</h3>
                    <div class="system-status">
                        <div class="status-item">
                            <span class="status-label">資料庫</span>
                            <span class="status-value success">已連接</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">認證</span>
                            <span class="status-value success">${window.isAdminLoggedIn ? '已登入' : '未登入'}</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">最後更新</span>
                            <span class="status-value">${new Date().toLocaleString('zh-TW')}</span>
                        </div>
                    </div>
                </div>
            </div>
            ${window.AdminPanel.Styles.dashboard}
        `;
    }
};

window.AdminPanel.Styles.dashboard = `
    <style>
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #1a1a2e; border: 1px solid rgba(0,212,255,0.2); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 20px; transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,212,255,0.15); }
        .stat-icon { font-size: 36px; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 32px; font-weight: 700; color: #fff; }
        .stat-label { font-size: 14px; color: #888; }
        .stat-card.anime .stat-value { color: #ff6b9d; }
        .stat-card.manga .stat-value { color: #c56cf0; }
        .stat-card.movie .stat-value { color: #7bed9f; }
        .dashboard-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .dashboard-section { background: #1a1a2e; border: 1px solid rgba(0,212,255,0.2); border-radius: 16px; padding: 24px; }
        .dashboard-section h3 { color: #00d4ff; margin: 0 0 20px 0; font-size: 16px; font-weight: 500; }
        .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .admin-action-btn { padding: 16px; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); border-radius: 12px; color: #fff; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
        .admin-action-btn:hover { background: rgba(0,212,255,0.2); border-color: #00d4ff; }
        .action-icon { font-size: 20px; }
        .system-status { display: flex; flex-direction: column; gap: 12px; }
        .status-item { display: flex; justify-content: space-between; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; }
        .status-label { color: #888; }
        .status-value { color: #fff; }
        .status-value.success { color: #00ff88; }
    </style>
`;

// ===== Items Management =====
window.AdminPanel.Items = {
    render: () => {
        const data = window.animeData || [];
        const filters = window.AdminPanel.filters;
        
        let filtered = data.filter(item => {
            if (filters.category && item.category !== filters.category) return false;
            if (filters.search && !item.name?.toLowerCase().includes(filters.search.toLowerCase())) return false;
            if (filters.rating && item.rating !== filters.rating) return false;
            return true;
        });
        
        const total = filtered.length;
        const perPage = window.AdminPanel.pagination.perPage;
        const page = window.AdminPanel.pagination.page;
        const paged = filtered.slice((page - 1) * perPage, page * perPage);
        
        const categories = ['anime', 'manga', 'movie'];
        const ratings = ['S', 'SSR', 'SR', 'R', 'A', 'B', 'C', '普'];
        
        return `
            <div class="items-toolbar">
                <div class="toolbar-left">
                    <input type="search" class="admin-search" placeholder="搜尋作品..." 
                           value="${filters.search}"
                           oninput="window.AdminPanel.filters.search = this.value; window.AdminPanel.pagination.page = 1; window.AdminPanel.Tabs.renderContent()">
                    <select class="admin-select" onchange="window.AdminPanel.filters.category = this.value; window.AdminPanel.pagination.page = 1; window.AdminPanel.Tabs.renderContent()">
                        <option value="">全部分類</option>
                        ${categories.map(c => `<option value="${c}" ${filters.category === c ? 'selected' : ''}>${c === 'anime' ? '動畫' : c === 'manga' ? '漫畫' : '電影'}</option>`).join('')}
                    </select>
                    <select class="admin-select" onchange="window.AdminPanel.filters.rating = this.value; window.AdminPanel.pagination.page = 1; window.AdminPanel.Tabs.renderContent()">
                        <option value="">全部評分</option>
                        ${ratings.map(r => `<option value="${r}" ${filters.rating === r ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                </div>
                <div class="toolbar-right">
                    <span class="items-count">共 ${total} 筆</span>
                </div>
            </div>
            <div class="items-grid">
                ${paged.length === 0 ? '<div class="empty-state">沒有找到作品</div>' : ''}
                ${paged.map(item => `
                    <div class="item-card">
                        <div class="item-poster">
                            <img src="${item.poster_url || './assets/no-poster.jpg'}" onerror="this.src='./assets/no-poster.jpg'" loading="lazy">
                            <span class="item-rating">${item.rating || '普'}</span>
                        </div>
                        <div class="item-info">
                            <h4 class="item-title">${item.name || '未命名'}</h4>
                            <p class="item-meta">${item.year || ''} ${item.season || ''}</p>
                        </div>
                        <div class="item-actions">
                            <button class="item-btn edit" onclick="window.AdminPanel.Items.edit('${item.id}')" title="編輯">✏️</button>
                            <button class="item-btn delete" onclick="window.AdminPanel.Items.delete('${item.id}')" title="刪除">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${window.AdminPanel.Pagination.render(total, perPage)}
            ${window.AdminPanel.Styles.items}
        `;
    },
    
    edit: (id) => {
        const item = window.animeData?.find(a => a.id == id);
        if (!item) return;
        window.AdminPanel.EditItem.open(item);
    },
    
    delete: async (id) => {
        if (!confirm('確定要刪除這個作品嗎？')) return;
        try {
            const client = window.supabaseManager?.getClient();
            await client.from('anime').delete().eq('id', id);
            window.animeData = window.animeData.filter(a => a.id != id);
            window.AdminPanel.loadStats();
            window.AdminPanel.Tabs.renderContent();
            window.showToast('作品已刪除', 'success');
        } catch (err) {
            window.showToast('刪除失敗: ' + err.message, 'error');
        }
    }
};

// ===== Pagination =====
window.AdminPanel.Pagination = {
    render: (total, perPage) => {
        const page = window.AdminPanel.pagination.page;
        const totalPages = Math.ceil(total / perPage);
        if (totalPages <= 1) return '';
        
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        
        return `
            <div class="admin-pagination">
                <button class="page-btn" ${page === 1 ? 'disabled' : ''} onclick="window.AdminPanel.pagination.page = 1; window.AdminPanel.Tabs.renderContent()">««</button>
                <button class="page-btn" ${page === 1 ? 'disabled' : ''} onclick="window.AdminPanel.pagination.page--; window.AdminPanel.Tabs.renderContent()">«</button>
                ${pages.map(p => p === '...' ? '<span class="page-dots">...</span>' : `<button class="page-btn ${p === page ? 'active' : ''}" onclick="window.AdminPanel.pagination.page = ${p}; window.AdminPanel.Tabs.renderContent()">${p}</button>`).join('')}
                <button class="page-btn" ${page === totalPages ? 'disabled' : ''} onclick="window.AdminPanel.pagination.page++; window.AdminPanel.Tabs.renderContent()">»</button>
                <button class="page-btn" ${page === totalPages ? 'disabled' : ''} onclick="window.AdminPanel.pagination.page = ${totalPages}; window.AdminPanel.Tabs.renderContent()">»»</button>
            </div>
        `;
    }
};

// ===== Edit Item Modal =====
window.AdminPanel.EditItem = {
    open: (item) => {
        const modal = document.createElement('div');
        modal.className = 'admin-modal-overlay';
        modal.id = 'edit-item-modal';
        
        const categories = ['anime', 'manga', 'movie', 'notice'];
        const ratings = ['S', 'SSR', 'SR', 'R', 'A', 'B', 'C', '普'];
        
        modal.innerHTML = `
            <div class="edit-item-container">
                <div class="edit-item-header">
                    <h2>編輯作品</h2>
                    <button class="close-btn" onclick="document.getElementById('edit-item-modal').remove()">×</button>
                </div>
                <form onsubmit="event.preventDefault(); window.AdminPanel.EditItem.save('${item.id}')">
                    <div class="form-row">
                        <div class="form-group">
                            <label>名稱</label>
                            <input type="text" id="edit-name" value="${item.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>分類</label>
                            <select id="edit-category">
                                ${categories.map(c => `<option value="${c}" ${item.category === c ? 'selected' : ''}>${c === 'anime' ? '動畫' : c === 'manga' ? '漫畫' : c === 'movie' ? '電影' : '訊息'}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>評分</label>
                            <select id="edit-rating">
                                ${ratings.map(r => `<option value="${r}" ${item.rating === r ? 'selected' : ''}>${r}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>推薦指數</label>
                            <input type="number" id="edit-recommendation" value="${item.recommendation || 0}" min="0" max="6">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>年份</label>
                            <input type="text" id="edit-year" value="${item.year || ''}">
                        </div>
                        <div class="form-group">
                            <label>季度</label>
                            <input type="text" id="edit-season" value="${item.season || ''}">
                        </div>
                        <div class="form-group">
                            <label>月份</label>
                            <input type="text" id="edit-month" value="${item.month || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>海報 URL</label>
                        <input type="url" id="edit-poster" value="${item.poster_url || ''}">
                    </div>
                    <div class="form-group">
                        <label>簡介</label>
                        <textarea id="edit-desc" rows="4">${item.description || ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="admin-btn secondary" onclick="document.getElementById('edit-item-modal').remove()">取消</button>
                        <button type="submit" class="admin-btn primary">儲存</button>
                    </div>
                </form>
            </div>
            ${window.AdminPanel.Styles.form}
        `;
        document.body.appendChild(modal);
    },
    
    save: async (id) => {
        const data = {
            name: document.getElementById('edit-name').value,
            category: document.getElementById('edit-category').value,
            rating: document.getElementById('edit-rating').value,
            recommendation: parseInt(document.getElementById('edit-recommendation').value) || 0,
            year: document.getElementById('edit-year').value,
            season: document.getElementById('edit-season').value,
            month: document.getElementById('edit-month').value,
            poster_url: document.getElementById('edit-poster').value,
            description: document.getElementById('edit-desc').value
        };
        
        try {
            const client = window.supabaseManager?.getClient();
            await client.from('anime').update(data).eq('id', id);
            
            const idx = window.animeData.findIndex(a => a.id == id);
            if (idx !== -1) window.animeData[idx] = { ...window.animeData[idx], ...data };
            
            document.getElementById('edit-item-modal')?.remove();
            window.AdminPanel.Tabs.renderContent();
            window.showToast('作品已更新', 'success');
        } catch (err) {
            window.showToast('儲存失敗: ' + err.message, 'error');
        }
    }
};

// ===== Add New Item =====
window.AdminPanel.Add = {
    render: () => {
        return `
            <div class="add-form-container">
                <h3>手動新增作品</h3>
                <form onsubmit="event.preventDefault(); window.AdminPanel.Add.save()">
                    <div class="form-row">
                        <div class="form-group">
                            <label>名稱 *</label>
                            <input type="text" id="add-name" required>
                        </div>
                        <div class="form-group">
                            <label>分類 *</label>
                            <select id="add-category" required>
                                <option value="anime">動畫</option>
                                <option value="manga">漫畫</option>
                                <option value="movie">電影</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>評分</label>
                            <select id="add-rating">
                                <option value="普">普</option>
                                <option value="C">C</option>
                                <option value="B">B</option>
                                <option value="A">A</option>
                                <option value="R">R</option>
                                <option value="SR">SR</option>
                                <option value="SSR">SSR</option>
                                <option value="S">S</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>推薦指數</label>
                            <input type="number" id="add-recommendation" value="0" min="0" max="6">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>年份</label>
                            <input type="text" id="add-year" placeholder="2024">
                        </div>
                        <div class="form-group">
                            <label>季度</label>
                            <input type="text" id="add-season" placeholder="冬/春/夏/秋">
                        </div>
                        <div class="form-group">
                            <label>月份</label>
                            <input type="text" id="add-month" placeholder="1-12">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>海報 URL</label>
                        <input type="url" id="add-poster" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label>簡介</label>
                        <textarea id="add-desc" rows="4" placeholder="作品簡介..."></textarea>
                    </div>
                    <button type="submit" class="admin-btn primary" style="width: auto; padding: 12px 40px;">新增作品</button>
                </form>
            </div>
            <div class="add-form-container" style="margin-top: 40px;">
                <h3>自動補完 (Jikan API)</h3>
                <div class="form-group">
                    <label>搜尋動畫/漫畫</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="jikan-search" placeholder="輸入作品名稱..." style="flex:1;">
                        <button class="admin-btn primary" onclick="window.AdminPanel.Add.jikanSearch()" style="width: auto;">搜尋</button>
                    </div>
                </div>
                <div id="jikan-results" class="jikan-results"></div>
            </div>
            ${window.AdminPanel.Styles.form}
        `;
    },
    
    save: async () => {
        const data = {
            name: document.getElementById('add-name').value,
            category: document.getElementById('add-category').value,
            rating: document.getElementById('add-rating').value,
            recommendation: parseInt(document.getElementById('add-recommendation').value) || 0,
            year: document.getElementById('add-year').value,
            season: document.getElementById('add-season').value,
            month: document.getElementById('add-month').value,
            poster_url: document.getElementById('add-poster').value,
            description: document.getElementById('add-desc').value
        };
        
        try {
            const client = window.supabaseManager?.getClient();
            const { data: result, error } = await client.from('anime').insert(data).select().single();
            if (error) throw error;
            
            window.animeData.push(result);
            window.AdminPanel.loadStats();
            window.AdminPanel.Tabs.renderContent();
            window.showToast('作品已新增', 'success');
            
            document.querySelector('#admin-content form').reset();
        } catch (err) {
            window.showToast('新增失敗: ' + err.message, 'error');
        }
    },
    
    jikanSearch: async () => {
        const query = document.getElementById('jikan-search').value.trim();
        if (!query) return;
        
        const resultsDiv = document.getElementById('jikan-results');
        resultsDiv.innerHTML = '<div class="loading">搜尋中...</div>';
        
        try {
            const res = await fetch('https://api.jikan.moe/v4/anime?q=' + encodeURIComponent(query) + '&limit=10');
            const json = await res.json();
            
            if (!json.data?.length) {
                resultsDiv.innerHTML = '<div class="empty-state">找不到結果</div>';
                return;
            }
            
            resultsDiv.innerHTML = json.data.map(item => 
                '<div class="jikan-item">' +
                    '<img src="' + (item.images?.jpg?.image_url || './assets/no-poster.jpg') + '">' +
                    '<div class="jikan-info"><h4>' + item.title + '</h4><p>' + (item.year || '') + ' ' + (item.season || '') + ' | 評分: ' + (item.score || '-') + '</p></div>' +
                    '<button class="admin-btn secondary" onclick="window.AdminPanel.Add.applyJikan(' + item.mal_id + ')">使用</button>' +
                '</div>'
            ).join('');
        } catch (err) {
            resultsDiv.innerHTML = '<div class="error">搜尋失敗: ' + err.message + '</div>';
        }
    },
    
    applyJikan: async (malId) => {
        try {
            const res = await fetch('https://api.jikan.moe/v4/anime/' + malId);
            const json = await res.json();
            const data = json.data;
            
            document.getElementById('add-name').value = data.title || '';
            document.getElementById('add-year').value = data.year || '';
            document.getElementById('add-season').value = data.season || '';
            document.getElementById('add-poster').value = data.images?.jpg?.image_url || '';
            document.getElementById('add-desc').value = data.synopsis || '';
            document.getElementById('jikan-results').innerHTML = '';
            window.showToast('已套用資料', 'success');
        } catch (err) {
            window.showToast('套用失敗: ' + err.message, 'error');
        }
    }
};

// ===== Guestbook =====
window.AdminPanel.Guestbook = {
    messages: [],
    filter: 'all',
    
    render: async () => {
        const container = document.createElement('div');
        container.innerHTML = '<div class="loading">載入中...</div>';
        
        // Load messages
        const client = window.supabaseManager?.getClient();
        if (client) {
            const { data } = await client.from('guestbook').select('*').order('created_at', { ascending: false });
            window.AdminPanel.Guestbook.messages = data || [];
        }
        
        const messages = window.AdminPanel.Guestbook.messages;
        const filter = window.AdminPanel.Guestbook.filter;
        
        const filtered = filter === 'all' ? messages : messages.filter(m => m.status === filter);
        
        return `
            <div class="guestbook-container">
                <div class="guestbook-toolbar">
                    <div class="toolbar-left">
                        <select class="admin-select" onchange="window.AdminPanel.Guestbook.filter = this.value; window.AdminPanel.Tabs.renderContent()">
                            <option value="all" ${filter === 'all' ? 'selected' : ''}>全部</option>
                            <option value="pending" ${filter === 'pending' ? 'selected' : ''}>待審核</option>
                            <option value="approved" ${filter === 'approved' ? 'selected' : ''}>已通過</option>
                            <option value="rejected" ${filter === 'rejected' ? 'selected' : ''}>已拒絕</option>
                        </select>
                    </div>
                    <div class="toolbar-right">
                        <span class="items-count">共 ${filtered.length} 筆</span>
                    </div>
                </div>
                <div class="guestbook-list">
                    ${filtered.length === 0 ? '<div class="empty-state">沒有留言</div>' : ''}
                    ${filtered.map(msg => `
                        <div class="guestbook-item ${msg.status}">
                            <div class="guestbook-header">
                                <span class="guestbook-author">${msg.name || '匿名'}</span>
                                <span class="guestbook-date">${new Date(msg.created_at).toLocaleString('zh-TW')}</span>
                                <span class="guestbook-status status-${msg.status}">${msg.status === 'pending' ? '待審' : msg.status === 'approved' ? '已通過' : '已拒絕'}</span>
                            </div>
                            <div class="guestbook-content">${msg.content || ''}</div>
                            <div class="guestbook-actions">
                                ${msg.status !== 'approved' ? `<button class="item-btn approve" onclick="window.AdminPanel.Guestbook.moderate('${msg.id}', 'approved')" title="通過">✓</button>` : ''}
                                ${msg.status !== 'rejected' ? `<button class="item-btn reject" onclick="window.AdminPanel.Guestbook.moderate('${msg.id}', 'rejected')" title="拒絕">✗</button>` : ''}
                                <button class="item-btn delete" onclick="window.AdminPanel.Guestbook.delete('${msg.id}')" title="刪除">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${window.AdminPanel.Styles.guestbook}
        `;
    },
    
    moderate: async (id, status) => {
        try {
            const client = window.supabaseManager?.getClient();
            await client.from('guestbook').update({ status }).eq('id', id);
            
            const idx = window.AdminPanel.Guestbook.messages.findIndex(m => m.id == id);
            if (idx !== -1) window.AdminPanel.Guestbook.messages[idx].status = status;
            
            window.AdminPanel.Tabs.renderContent();
            window.showToast('狀態已更新', 'success');
        } catch (err) {
            window.showToast('更新失敗: ' + err.message, 'error');
        }
    },
    
    delete: async (id) => {
        if (!confirm('確定要刪除這則留言嗎？')) return;
        try {
            const client = window.supabaseManager?.getClient();
            await client.from('guestbook').delete().eq('id', id);
            
            window.AdminPanel.Guestbook.messages = window.AdminPanel.Guestbook.messages.filter(m => m.id != id);
            window.AdminPanel.Tabs.renderContent();
            window.showToast('留言已刪除', 'success');
        } catch (err) {
            window.showToast('刪除失敗: ' + err.message, 'error');
        }
    }
};

window.AdminPanel.Styles.guestbook = `
    <style>
        .guestbook-container { }
        .guestbook-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .guestbook-list { display: flex; flex-direction: column; gap: 16px; }
        .guestbook-item { background: #1a1a2e; border: 1px solid rgba(0,212,255,0.2); border-radius: 12px; padding: 20px; }
        .guestbook-item.pending { border-left: 3px solid #ffa500; }
        .guestbook-item.approved { border-left: 3px solid #00ff88; }
        .guestbook-item.rejected { border-left: 3px solid #ff4444; opacity: 0.6; }
        .guestbook-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .guestbook-author { color: #00d4ff; font-weight: 500; }
        .guestbook-date { color: #666; font-size: 13px; }
        .guestbook-status { padding: 4px 10px; border-radius: 12px; font-size: 12px; }
        .guestbook-status.status-pending { background: rgba(255,165,0,0.2); color: #ffa500; }
        .guestbook-status.status-approved { background: rgba(0,255,136,0.2); color: #00ff88; }
        .guestbook-status.status-rejected { background: rgba(255,68,68,0.2); color: #ff4444; }
        .guestbook-content { color: #ccc; line-height: 1.6; margin-bottom: 16px; white-space: pre-wrap; word-break: break-word; }
        .guestbook-actions { display: flex; gap: 8px; }
        .item-btn.approve { background: rgba(0,255,136,0.2); color: #00ff88; border: none; }
        .item-btn.reject { background: rgba(255,68,68,0.2); color: #ff4444; border: none; }
    </style>
`;

// ===== Options =====
window.AdminPanel.Options = {
    render: () => {
        const options = window.optionsData || {};
        return '<div class="options-container">' +
            '<h3>選項管理</h3>' +
            '<div class="options-grid">' +
                '<div class="option-card"><h4>分類</h4><p>' + (options.category?.length || 0) + ' 個</p></div>' +
                '<div class="option-card"><h4>評分</h4><p>' + (options.rating?.length || 0) + ' 個</p></div>' +
                '<div class="option-card"><h4>年份</h4><p>' + (options.year?.length || 0) + ' 個</p></div>' +
                '<div class="option-card"><h4>季度</h4><p>' + (options.season?.length || 0) + ' 個</p></div>' +
            '</div></div>' +
            '<style>.options-container h3{color:#00d4ff;margin:0 0 20px}.options-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}.option-card{background:#1a1a2e;border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:20px}.option-card h4{color:#fff;margin:0 0 8px}.option-card p{color:#888;margin:0}</style>';
    }
};

// ===== Settings =====
window.AdminPanel.Settings = {
    render: () => {
        const site = window.siteSettings || {};
        return '<div class="settings-container">' +
            '<h3>網站設定</h3>' +
            '<div class="form-group"><label>網站標題</label><input type="text" id="site-title" value="' + (site.site_title || '') + '"></div>' +
            '<div class="form-group"><label>公告內容</label><textarea id="site-announcement" rows="4">' + (site.announcement || '') + '</textarea></div>' +
            '<button class="admin-btn primary" onclick="window.AdminPanel.Settings.save()">儲存設定</button>' +
            '<div class="settings-section" style="margin-top:40px;">' +
                '<h3>資料管理</h3>' +
                '<div class="settings-actions">' +
                    '<button class="admin-btn secondary" onclick="window.AdminPanel.Settings.export()">匯出資料</button>' +
                    '<button class="admin-btn secondary" onclick="document.getElementById(\'import-file\').click()">匯入資料</button>' +
                    '<input type="file" id="import-file" style="display:none" accept=".json" onchange="window.AdminPanel.Settings.import(this)">' +
                '</div>' +
            '</div></div>' +
            '<style>.settings-container h3{color:#00d4ff;margin:0 0 20px}.form-group{margin-bottom:20px}.form-group label{display:block;color:#00d4ff;margin-bottom:8px}.form-group input,.form-group textarea{width:100%;padding:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:8px;color:#fff;box-sizing:border-box}.settings-actions{display:flex;gap:12px;flex-wrap:wrap}</style>';
    },
    
    save: async () => {
        const data = {
            site_title: document.getElementById('site-title').value,
            announcement: document.getElementById('site-announcement').value
        };
        
        try {
            const client = window.supabaseManager?.getClient();
            for (const [key, value] of Object.entries(data)) {
                await client.from('site_settings').upsert({ id: key, value });
            }
            window.siteSettings = { ...window.siteSettings, ...data };
            window.showToast('設定已儲存', 'success');
        } catch (err) {
            window.showToast('儲存失敗: ' + err.message, 'error');
        }
    },
    
    export: () => {
        const data = { anime: window.animeData, settings: window.siteSettings, options: window.optionsData };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
        window.showToast('資料已匯出', 'success');
    },
    
    import: async (input) => {
        const file = input.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.anime) {
                const client = window.supabaseManager?.getClient();
                for (const item of data.anime) {
                    await client.from('anime').upsert(item);
                }
                window.animeData = data.anime;
            }
            
            window.showToast('資料已匯入', 'success');
            window.AdminPanel.loadStats();
        } catch (err) {
            window.showToast('匯入失敗: ' + err.message, 'error');
        }
    }
};

console.log('✅ 新管理後台模組載入完成');
console.log('[AdminPanel] FINAL window.AdminPanel =', typeof window.AdminPanel, window.AdminPanel);

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('admin-panel', {
        loaded: true,
        exports: { AdminPanel: window.AdminPanel },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: admin-panel');
}
