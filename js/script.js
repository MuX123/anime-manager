// TECH v3.1.9 ULTRA - ACG Manager Logic
let animeData = [];
let optionsData = { genre: [], year: [], month: [], season: [], episodes: [], rating: [], recommendation: [], category_colors: {} };
let siteSettings = { site_title: 'TECH v3.1.9 ULTRA', announcement: '歡迎來到 ACG 收藏庫', title_color: '#00d4ff', announcement_color: '#00d4ff' };
let currentCategory = 'anime';
let currentPage = 1;
let itemsPerPage = 12;
let isAdmin = false;
let currentAdminTab = 'manage';
let adminPage = 1;
let adminItemsPerPage = 10;
let filters = { search: '', year: '', month: '', season: '', genre: '' };

// --- Initialization ---
window.onload = async () => {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        isAdmin = !!session;
        
        const { data: settings } = await supabaseClient.from('site_settings').select('*');
        if (settings) {
            settings.forEach(s => {
                if (s.id === 'site_title') siteSettings.site_title = s.value;
                if (s.id === 'announcement') siteSettings.announcement = s.value;
                if (s.id === 'title_color') siteSettings.title_color = s.value;
                if (s.id === 'announcement_color') siteSettings.announcement_color = s.value;
                if (s.id === 'options_data') { try { optionsData = JSON.parse(s.value); } catch(e) {} }
            });
        }
        document.title = siteSettings.site_title;
        
        await window.loadData();
        if (isAdmin) window.renderAdmin(); else window.renderApp();
        window.updateAdminMenu();
        
    } catch (err) { 
        console.error('Init error:', err);
        window.showToast('系統初始化失敗', 'error');
    }
};

window.loadData = async function() {
    try {
        const { data, error } = await supabaseClient.from('anime_list').select('*').order('created_at', { ascending: false });
        const { data: extraData } = await supabaseClient.from('site_settings').select('value').eq('id', 'extra_assignments').single();
        let extraMap = {};
        if (extraData && extraData.value) {
            try { extraMap = JSON.parse(extraData.value); } catch(e) { console.error('Extra data parse error:', e); }
        }
        
        if (!error) {
            animeData = (data || []).map(item => {
                const extra = extraMap[item.id] || {};
                return {
                    ...item,
                    ...extra, // 將 extra_data 直接合併到 item 中以簡化讀取
                    extra_data: extra
                };
            });
        }
    } catch (err) {
        console.error('Load data error:', err);
    }
};

window.updateAdminMenu = function() {
    const container = document.getElementById('adminMenuOptions');
    if (!container) return;
    container.innerHTML = `
        <button class="admin-menu-item ${currentAdminTab === 'manage' ? 'active' : ''}" onclick="window.switchAdminTab('manage')">📦 作品管理</button>
        <button class="admin-menu-item ${currentAdminTab === 'add' ? 'active' : ''}" onclick="window.switchAdminTab('add')">➕ 新增作品</button>
        <button class="admin-menu-item ${currentAdminTab === 'options' ? 'active' : ''}" onclick="window.switchAdminTab('options')">⚙ 選項管理</button>
        <button class="admin-menu-item ${currentAdminTab === 'data' ? 'active' : ''}" onclick="window.switchAdminTab('data')">💾 資料備份</button>
        <button class="admin-menu-item ${currentAdminTab === 'settings' ? 'active' : ''}" onclick="window.switchAdminTab('settings')">🔧 網站設定</button>
    `;
};

// --- Rendering Functions ---
window.renderApp = () => {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="site-version">v3.1.9</div>
        <div class="app-container">
            <header>
                <h1 style="color: ${siteSettings.title_color || 'var(--neon-cyan)'}; text-shadow: 0 0 10px ${siteSettings.title_color || 'var(--neon-blue)'};">${siteSettings.site_title}</h1>
            </header>
            
            <div class="announcement-bar" style="border-color: ${siteSettings.announcement_color || 'var(--neon-blue)'};">
                <div class="announcement-content" style="color: ${siteSettings.announcement_color || 'var(--neon-cyan)'};">
                    <span>📢 ${siteSettings.announcement}</span>
                </div>
            </div>

            <nav class="category-nav">
                <button class="${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">動畫</button>
                <button class="${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">漫畫</button>
                <button class="${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">電影</button>
            </nav>

            <div class="filter-section">
                <input type="text" placeholder="搜尋作品名稱..." oninput="window.handleSearch(this.value)" value="${filters.search}">
                <div class="filter-group">
                    <select onchange="window.handleFilter('year', this.value)">
                        <option value="">年份</option>
                        ${optionsData.year.map(y => `<option value="${y}" ${filters.year === y ? 'selected' : ''}>${y}</option>`).join('')}
                    </select>
                    <select onchange="window.handleFilter('season', this.value)">
                        <option value="">季度</option>
                        ${optionsData.season.map(s => `<option value="${s}" ${filters.season === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                    <select onchange="window.handleFilter('genre', this.value)">
                        <option value="">類型</option>
                        ${optionsData.genre.map(g => `<option value="${g}" ${filters.genre === g ? 'selected' : ''}>${g}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="anime-grid">
                ${window.getFilteredData().slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map(item => window.renderCard(item)).join('')}
            </div>

            ${window.renderPagination()}
            
            <div class="admin-trigger" onclick="window.toggleAdminMode(true)">⚙</div>
        </div>
    `;
};

window.renderCard = (item) => {
    const starColor = item.star_color || '#ffcc00';
    const nameColor = item.name_color || '#ffffff';
    const monthStr = item.month ? (item.month.includes('月') ? item.month : item.month + '月') : '';
    const timeInfo = [item.year, item.season, monthStr].filter(t => t).join(' ');
    const episodes = item.episodes ? `全 ${item.episodes} 集` : '';
    const episodesColor = optionsData.category_colors?.episodes || 'var(--neon-blue)';

    return `
        <div class="anime-card" onclick="window.showAnimeDetail('${item.id}')">
            <div class="card-poster">
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${item.name}">
                <div class="card-overlay">
                    <div class="card-rating" style="color: ${starColor}; text-shadow: 0 0 5px ${starColor};">★ ${item.rating || '0.0'}</div>
                </div>
            </div>
            <div class="card-info">
                <h3 style="color: ${nameColor};">${item.name}</h3>
                <div class="card-meta">
                    <span style="color: var(--neon-cyan);">${timeInfo}</span>
                    <span style="color: ${episodesColor}; font-weight: bold;">${episodes}</span>
                </div>
            </div>
        </div>
    `;
};

window.renderAdmin = () => {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="site-version">v3.1.9</div>
        <div class="admin-container">
            <div class="admin-panel">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid var(--neon-blue); padding-bottom: 15px; position: relative;">
                    <h2 style="color: var(--neon-cyan); font-size: 22px; margin: 0; text-shadow: 0 0 10px var(--neon-blue);">⚙ 管理控制台</h2>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-primary" onclick="window.toggleAdminMode(false)">返回前台</button>
                        <button class="btn-primary" style="border-color: #ff4444; color: #ff4444;" onclick="supabaseClient.auth.signOut().then(() => location.reload())">登出</button>
                    </div>
                </header>
                
                <div class="admin-layout">
                    <aside class="admin-sidebar" id="adminMenuOptions"></aside>
                    <main class="admin-main">
                        ${window.renderAdminContent()}
                    </main>
                </div>
            </div>
        </div>
    `;
    window.updateAdminMenu();
};

window.renderAdminContent = () => {
    if (currentAdminTab === 'manage') return window.renderAdminManage();
    if (currentAdminTab === 'add') return window.renderAdminForm();
    if (currentAdminTab === 'options') return window.renderAdminOptions();
    if (currentAdminTab === 'data') return window.renderAdminData();
    if (currentAdminTab === 'settings') return window.renderAdminSettings();
    return '';
};

window.renderAdminManage = () => {
    const data = animeData.filter(item => item.category === currentCategory);
    const totalPages = Math.ceil(data.length / adminItemsPerPage);
    const pagedData = data.slice((adminPage-1)*adminItemsPerPage, adminPage*adminItemsPerPage);

    return `
        <div class="admin-manage-header">
            <div class="category-nav" style="margin-bottom: 20px;">
                <button class="${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">動畫</button>
                <button class="${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">漫畫</button>
                <button class="${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">電影</button>
            </div>
        </div>
        <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>海報</th>
                        <th>名稱</th>
                        <th>年度</th>
                        <th>季度</th>
                        <th>月份</th>
                        <th>評分</th>
                        <th>推薦</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagedData.map(item => {
                        const nameColor = item.name_color || '#ffffff';
                        const starColor = item.star_color || '#ffcc00';
                        const yearColor = optionsData.category_colors?.year || 'var(--neon-blue)';
                        const seasonColor = optionsData.category_colors?.season || 'var(--neon-blue)';
                        const monthColor = optionsData.category_colors?.month || 'var(--neon-blue)';
                        const ratingColor = optionsData.category_colors?.rating || 'var(--neon-blue)';
                        const recColor = optionsData.category_colors?.recommendation || 'var(--neon-blue)';
                        
                        return `
                            <tr>
                                <td><img src="${item.poster_url}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
                                <td style="color: ${nameColor}; font-weight: bold;">${item.name}</td>
                                <td style="color: ${yearColor};">${item.year || '-'}</td>
                                <td style="color: ${seasonColor};">${item.season || '-'}</td>
                                <td style="color: ${monthColor};">${item.month || '-'}</td>
                                <td style="color: ${starColor};">★ ${item.rating || '0.0'}</td>
                                <td style="color: ${recColor};">${item.recommendation || '-'}</td>
                                <td>
                                    <div style="display: flex; gap: 5px;">
                                        <button class="btn-primary" style="padding: 5px 10px; font-size: 12px;" onclick="window.editAnime('${item.id}')">編輯</button>
                                        <button class="btn-primary" style="padding: 5px 10px; font-size: 12px; border-color: #ff4444; color: #ff4444;" onclick="window.deleteAnime('${item.id}')">刪除</button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.renderAdminForm = (editId = null) => {
    const item = editId ? animeData.find(i => i.id === editId) : null;
    const extra = item?.extra_data || {};

    return `
        <div class="admin-form">
            <h3 style="color: var(--neon-cyan); margin-bottom: 20px;">${editId ? '📝 編輯作品' : '➕ 新增作品'}</h3>
            <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                    <label>作品名稱</label>
                    <input type="text" id="form-name" value="${item?.name || ''}" placeholder="輸入作品名稱">
                </div>
                <div class="form-group">
                    <label>海報 URL</label>
                    <input type="text" id="form-poster" value="${item?.poster_url || ''}" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label>類別</label>
                    <select id="form-category">
                        <option value="anime" ${item?.category === 'anime' ? 'selected' : ''}>動畫</option>
                        <option value="manga" ${item?.category === 'manga' ? 'selected' : ''}>漫畫</option>
                        <option value="movie" ${item?.category === 'movie' ? 'selected' : ''}>電影</option>
                    </select>
                </div>
                ${Object.keys(optionsData).filter(k => !['genre', 'category_colors'].includes(k)).map(key => `
                    <div class="form-group">
                        <label>${window.getOptionLabel(key)}</label>
                        <select id="form-${key}">
                            <option value="">選擇${window.getOptionLabel(key)}</option>
                            ${optionsData[key].map(opt => `<option value="${opt}" ${(item?.[key] === opt || extra[key] === opt) ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>
            
            <div class="form-group" style="margin-top: 20px;">
                <label>類型標籤</label>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(0,212,255,0.1);">
                    ${optionsData.genre.map(g => `
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: var(--text-secondary);">
                            <input type="checkbox" name="form-genre" value="${g}" ${item?.genre?.includes(g) ? 'checked' : ''}> ${g}
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
                <label>顏色設定</label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div>
                        <label style="font-size: 12px;">名稱顏色</label>
                        <div style="display: flex; gap: 5px;">
                            <input type="color" id="form-name-color" value="${item?.name_color || '#ffffff'}" style="width: 40px; height: 40px; padding: 0; border: none;">
                            <div style="width: 40px; height: 40px; background: ${item?.name_color || '#ffffff'}; border: 1px solid var(--neon-blue); border-radius: 4px;"></div>
                        </div>
                    </div>
                    <div>
                        <label style="font-size: 12px;">評分顏色</label>
                        <div style="display: flex; gap: 5px;">
                            <input type="color" id="form-star-color" value="${item?.star_color || '#ffcc00'}" style="width: 40px; height: 40px; padding: 0; border: none;">
                            <div style="width: 40px; height: 40px; background: ${item?.star_color || '#ffcc00'}; border: 1px solid var(--neon-blue); border-radius: 4px;"></div>
                        </div>
                    </div>
                    <div>
                        <label style="font-size: 12px;">介紹顏色</label>
                        <div style="display: flex; gap: 5px;">
                            <input type="color" id="form-desc-color" value="${item?.desc_color || '#a8b0c0'}" style="width: 40px; height: 40px; padding: 0; border: none;">
                            <div style="width: 40px; height: 40px; background: ${item?.desc_color || '#a8b0c0'}; border: 1px solid var(--neon-blue); border-radius: 4px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
                <label>網站連結</label>
                <div id="links-container">
                    ${(item?.links || []).map(l => `
                        <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                            <input type="text" placeholder="名稱" class="link-name" value="${l.name}" style="flex: 1; font-size: 11px;">
                            <input type="text" placeholder="網址" class="link-url" value="${l.url}" style="flex: 2; font-size: 11px;">
                            <button class="btn-primary" style="padding: 4px 8px; border-color: #ff4444; color: #ff4444; font-size: 10px;" onclick="this.parentElement.remove()">✕</button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-primary" style="width: 100%; margin-top: 5px; font-size: 12px;" onclick="window.addLinkRow()">+ 新增連結</button>
            </div>

            <div class="form-group" style="margin-top: 20px;">
                <label>劇情介紹</label>
                <textarea id="form-desc" rows="5" placeholder="輸入作品簡介...">${item?.description || ''}</textarea>
            </div>

            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button class="btn-primary" style="flex: 2;" onclick="window.saveAnime('${editId}')">儲存作品</button>
                <button class="btn-primary" style="flex: 1; border-color: #ff4444; color: #ff4444;" onclick="window.switchAdminTab('manage')">取消</button>
            </div>
        </div>
    `;
};

window.renderAdminOptions = () => {
    return `
        <div class="admin-options">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: var(--neon-cyan);">⚙ 選項管理</h3>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="new-category-name" placeholder="新類別名稱" style="width: 150px; font-size: 12px;">
                    <button class="btn-primary" style="padding: 5px 15px; font-size: 12px;" onclick="window.addNewCategory()">新增類別</button>
                </div>
            </div>
            
            <div class="horizontal-scroll-container force-scroll" style="padding-bottom: 20px;" onwheel="this.scrollLeft += event.deltaY">
                ${Object.keys(optionsData).filter(k => k !== 'category_colors').map(key => `
                    <div class="vertical-scroll-card" style="min-width: 180px; max-width: 180px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(0,212,255,0.2); padding-bottom: 5px;">
                            <span style="color: var(--neon-cyan); font-weight: bold; font-size: 13px;">${window.getOptionLabel(key)}</span>
                            <input type="color" value="${optionsData.category_colors?.[key] || '#00d4ff'}" onchange="window.updateCategoryColor('${key}', this.value)" style="width: 20px; height: 20px; border: none; padding: 0; background: none; cursor: pointer;">
                        </div>
                        <div class="scroll-list">
                            ${optionsData[key].map((opt, idx) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: rgba(0,0,0,0.2); margin-bottom: 4px; border-radius: 4px; font-size: 11px;">
                                    <span style="color: var(--text-main);">${opt}</span>
                                    <span style="color: #ff4444; cursor: pointer;" onclick="window.deleteOptionItem('${key}', ${idx})">✕</span>
                                </div>
                            `).join('')}
                        </div>
                        <div style="margin-top: 10px; display: flex; gap: 5px;">
                            <input type="text" id="add-opt-${key}" placeholder="新增..." style="flex: 1; font-size: 10px; padding: 4px 8px !important;">
                            <button class="btn-primary" style="padding: 4px 8px; font-size: 10px;" onclick="window.addOptionItem('${key}')">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

window.renderAdminData = () => {
    return `
        <div class="admin-data">
            <h3 style="color: var(--neon-cyan); margin-bottom: 20px;">💾 資料備份</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="data-card" style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1.5px solid rgba(0,212,255,0.2);">
                    <h4 style="color: var(--neon-blue); margin-bottom: 15px;">匯出資料</h4>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 20px;">將當前類別的作品資料匯出為 CSV 檔案。</p>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-primary" style="flex: 1;" onclick="window.exportCSV('anime')">動畫</button>
                        <button class="btn-primary" style="flex: 1;" onclick="window.exportCSV('manga')">漫畫</button>
                        <button class="btn-primary" style="flex: 1;" onclick="window.exportCSV('movie')">電影</button>
                    </div>
                </div>
                <div class="data-card" style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1.5px solid rgba(0,212,255,0.2);">
                    <h4 style="color: var(--neon-blue); margin-bottom: 15px;">匯入資料</h4>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 20px;">從 CSV 檔案匯入作品資料（將覆蓋現有資料）。</p>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-primary" style="flex: 1;" onclick="window.triggerImport('anime')">動畫</button>
                        <button class="btn-primary" style="flex: 1;" onclick="window.triggerImport('manga')">漫畫</button>
                        <button class="btn-primary" style="flex: 1;" onclick="window.triggerImport('movie')">電影</button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.renderAdminSettings = () => {
    return `
        <div class="admin-settings">
            <h3 style="color: var(--neon-cyan); margin-bottom: 20px;">🔧 網站設定</h3>
            <div class="form-group">
                <label>網站標題</label>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="set-title" value="${siteSettings.site_title}" style="flex: 1;">
                    <input type="color" id="set-title-color" value="${siteSettings.title_color || '#00d4ff'}" style="width: 45px; height: 45px; padding: 0; border: none; background: none; cursor: pointer;">
                </div>
            </div>
            <div class="form-group" style="margin-top: 20px;">
                <label>公告內容</label>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="set-announcement" value="${siteSettings.announcement}" style="flex: 1;">
                    <input type="color" id="set-announcement-color" value="${siteSettings.announcement_color || '#00d4ff'}" style="width: 45px; height: 45px; padding: 0; border: none; background: none; cursor: pointer;">
                </div>
            </div>
            <button class="btn-primary" style="margin-top: 30px; width: 100%;" onclick="window.saveSettings()">儲存設定</button>
        </div>
    `;
};

// --- Logic Functions ---
window.switchCategory = (cat) => { currentCategory = cat; currentPage = 1; adminPage = 1; if (isAdmin) window.renderAdmin(); else window.renderApp(); };
window.switchAdminTab = (tab) => { currentAdminTab = tab; adminPage = 1; window.renderAdmin(); };
window.handleSearch = (val) => { filters.search = val; currentPage = 1; window.renderApp(); };
window.handleFilter = (key, val) => { filters[key] = val; currentPage = 1; window.renderApp(); };
window.changePage = (p) => { currentPage = p; window.renderApp(); };
window.toggleAdminMode = (mode) => { if (mode && !isAdmin) return window.showLoginModal(); isAdmin = mode; if (isAdmin) window.renderAdmin(); else window.renderApp(); };

window.showAnimeDetail = (id) => {
    const item = animeData.find(i => i.id === id);
    if (!item) return;
    const extra = item.extra_data || {};
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    
    const genreTags = (Array.isArray(item.genre) ? item.genre : []).map(g => `<span class="tag-item" style="border-color: ${optionsData.category_colors?.genre || 'var(--neon-blue)'}; color: ${optionsData.category_colors?.genre || 'var(--neon-blue)'}; padding: 2px 8px; font-size: 12px; margin-right: 8px; background: none;">${g}</span>`).join('');
    
    const extraTags = Object.keys(extra).filter(k => extra[k]).map(key => {
        const color = optionsData.category_colors?.[key] || 'var(--neon-blue)';
        return `<span class="tag-item" style="border-color: ${color}; color: ${color}; padding: 2px 8px; font-size: 12px; margin-right: 8px; background: none;">${extra[key]}</span>`;
    }).join('');

    const monthStr = item.month ? (item.month.includes('月') ? item.month : item.month + '月') : '';
    const timeInfo = [item.year, item.season, monthStr].filter(t => t).join(' ');
    const episodes = item.episodes ? `全 ${item.episodes} 集` : '';
    const episodesColor = optionsData.category_colors?.episodes || 'var(--neon-blue)';

    content.innerHTML = `
        <div class="detail-layout" style="display: flex; gap: 30px; flex-wrap: wrap;">
            <div class="detail-poster" style="flex: 1; min-width: 250px;">
                <img src="${item.poster_url}" style="width: 100%; border-radius: 12px; border: 2px solid var(--neon-blue); box-shadow: var(--shadow-glow);">
                <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                    <div style="border: 1.5px solid var(--neon-blue); padding: 5px 15px; border-radius: 4px; color: var(--neon-cyan); font-weight: bold; font-size: 14px; text-shadow: 0 0 5px var(--neon-blue);">${timeInfo}</div>
                    <div style="border: 1.5px solid ${episodesColor}; padding: 5px 15px; border-radius: 4px; color: ${episodesColor}; font-weight: bold; font-size: 14px; text-shadow: 0 0 5px ${episodesColor};">${episodes}</div>
                </div>
            </div>
            <div class="detail-info" style="flex: 2; min-width: 300px;">
                <h2 style="color: ${item.name_color || '#ffffff'}; font-size: 28px; margin-bottom: 15px; text-shadow: 0 0 15px ${item.name_color || 'var(--neon-blue)'};">${item.name}</h2>
                
                <div class="detail-tags-section" style="margin-bottom: 20px;">
                    <div class="horizontal-scroll-container force-scroll" style="margin-bottom: 10px;" onwheel="this.scrollLeft += event.deltaY">
                        ${genreTags}
                    </div>
                    ${extraTags ? `<div class="horizontal-scroll-container force-scroll" onwheel="this.scrollLeft += event.deltaY">${extraTags}</div>` : ''}
                </div>

                <div style="margin-top: 25px;">
                    <h4 style="color: var(--neon-cyan); margin-bottom: 10px; font-size: 14px;">劇情介紹</h4>
                    <p style="color: ${item.desc_color || 'var(--text-secondary)'}; line-height: 1.6; font-size: 14px; max-height: 150px; overflow-y: auto; padding-right: 10px;">${item.description || '暫無介紹'}</p>
                </div>

                <div style="margin-top: 25px;">
                    <h4 style="color: var(--neon-cyan); margin-bottom: 10px; font-size: 14px;">網站連結</h4>
                    <div class="horizontal-scroll-container force-scroll" onwheel="this.scrollLeft += event.deltaY">
                        ${(item.links || []).map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 12px; white-space: nowrap;">${l.name}</a>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
};

window.closeAnimeDetail = () => { document.getElementById('detailModal').classList.remove('active'); };

window.editAnime = (id) => { currentAdminTab = 'add'; window.renderAdmin(); window.renderAdminForm(id); };

window.saveAnime = async (editId) => {
    try {
        const name = document.getElementById('form-name').value;
        if (!name) return window.showToast('✗ 請輸入作品名稱', 'error');

        const payload = {
            name,
            poster_url: document.getElementById('form-poster').value,
            category: document.getElementById('form-category').value,
            genre: Array.from(document.querySelectorAll('input[name="form-genre"]:checked')).map(cb => cb.value),
            links: Array.from(document.querySelectorAll('#links-container > div')).map(row => ({ name: row.querySelector('.link-name').value, url: row.querySelector('.link-url').value })),
            description: document.getElementById('form-desc').value,
            star_color: document.getElementById('form-star-color').value,
            name_color: document.getElementById('form-name-color').value,
            desc_color: document.getElementById('form-desc-color').value
        };
        
        const dbColumns = ['name', 'poster_url', 'category', 'genre', 'links', 'description', 'year', 'month', 'season', 'episodes', 'rating', 'recommendation', 'star_color', 'name_color', 'desc_color'];
        const extraAssignments = {};
        Object.keys(optionsData).filter(k => !['genre', 'category_colors'].includes(k)).forEach(key => {
            const el = document.getElementById(`form-${key}`);
            if (el) {
                if (dbColumns.includes(key)) {
                    payload[key] = el.value;
                } else {
                    extraAssignments[key] = el.value;
                }
            }
        });

        const { data: savedData, error } = (editId && editId !== 'null' && editId !== 'undefined') ? 
            await supabaseClient.from('anime_list').update(payload).eq('id', editId).select() : 
            await supabaseClient.from('anime_list').insert([payload]).select();
        
        if (error) throw error;

        const targetId = editId && editId !== 'null' && editId !== 'undefined' ? editId : (savedData && savedData[0]?.id);
        if (targetId) {
            let { data: currentExtra } = await supabaseClient.from('site_settings').select('value').eq('id', 'extra_assignments').single();
            let extraMap = currentExtra && currentExtra.value ? JSON.parse(currentExtra.value) : {};
            
            if (Object.keys(extraAssignments).length > 0) {
                extraMap[targetId] = extraAssignments;
            } else if (extraMap[targetId]) {
                delete extraMap[targetId]; // 如果沒有 extra data 則清理
            }
            
            await supabaseClient.from('site_settings').upsert({ id: 'extra_assignments', value: JSON.stringify(extraMap) });
        }

        window.showToast('✓ 儲存成功');
        await window.loadData();
        window.switchAdminTab('manage');
    } catch (err) { window.showToast('✗ 儲存失敗：' + err.message, 'error'); }
};

window.addLinkRow = () => { const c = document.getElementById('links-container'); const d = document.createElement('div'); d.style.display = 'flex'; d.style.gap = '6px'; d.style.marginBottom = '8px'; d.innerHTML = `<input type="text" placeholder="名" class="link-name" style="flex: 1; font-size: 11px;"><input type="text" placeholder="網" class="link-url" style="flex: 2; font-size: 11px;"><button class="btn-primary" style="padding: 4px 8px; border-color: #ff4444; color: #ff4444; font-size: 10px;" onclick="this.parentElement.remove()">✕</button>`; c.appendChild(d); };
window.addOptionItem = async (key) => { const input = document.getElementById(`add-opt-${key}`); if (!input.value) return window.showToast('✗ 請輸入選項名稱', 'error'); optionsData[key].push(input.value); input.value = ''; await window.saveOptionsToDB(); window.renderAdmin(); };
window.deleteOptionItem = async (key, idx) => { optionsData[key].splice(idx, 1); await window.saveOptionsToDB(); window.renderAdmin(); };
window.addNewCategory = async () => { const name = document.getElementById('new-category-name').value; if (!name) return window.showToast('✗ 請輸入類別名稱', 'error'); optionsData[name] = []; document.getElementById('new-category-name').value = ''; await window.saveOptionsToDB(); window.renderAdmin(); };
window.updateCategoryColor = async (key, color) => { if (!optionsData.category_colors) optionsData.category_colors = {}; optionsData.category_colors[key] = color; await window.saveOptionsToDB(); window.renderAdmin(); };
window.saveOptionsToDB = async () => { await supabaseClient.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) }); window.showToast('✓ 設定已同步'); };

window.exportCSV = (cat) => {
    const filtered = animeData.filter(item => item.category === cat);
    if (filtered.length === 0) return window.showToast('✗ 無資料可匯出', 'error');
    const headers = ['name', 'poster_url', 'year', 'month', 'season', 'genre', 'episodes', 'rating', 'recommendation', 'description', 'star_color', 'name_color', 'desc_color', 'links'];
    const csvRows = [headers.join(',')];
    for (const item of filtered) {
        const row = headers.map(h => {
            let val = item[h] || '';
            if (h === 'genre') val = Array.isArray(val) ? val.join('|') : val;
            if (h === 'links') val = JSON.stringify(val).replace(/"/g, '""');
            return `"${val}"`;
        });
        csvRows.push(row.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acg_${cat}_${new Date().getTime()}.csv`;
    a.click();
    window.showToast('✓ 匯出成功');
};

window.triggerImport = (cat) => { importTarget = cat; document.getElementById('importFile').click(); };

window.saveSettings = async () => {
    try {
        const title = document.getElementById('set-title').value;
        const announcement = document.getElementById('set-announcement').value;
        const titleColor = document.getElementById('set-title-color').value;
        const announcementColor = document.getElementById('set-announcement-color').value;
        await supabaseClient.from('site_settings').upsert([
            { id: 'site_title', value: title }, 
            { id: 'announcement', value: announcement },
            { id: 'title_color', value: titleColor },
            { id: 'announcement_color', value: announcementColor }
        ]);
        siteSettings.site_title = title;
        siteSettings.announcement = announcement;
        siteSettings.title_color = titleColor;
        siteSettings.announcement_color = announcementColor;
        window.showToast('✓ 設定已更新');
        window.renderAdmin();
    } catch (err) { window.showToast('✗ 更新失敗', 'error'); }
};

window.showLoginModal = () => {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
};

window.getFilteredData = () => {
    const searchLower = filters.search.toLowerCase();
    return animeData.filter(item => {
        if (item.category !== currentCategory) return false;
        if (filters.search && !item.name.toLowerCase().includes(searchLower)) return false;
        if (filters.year && item.year !== filters.year) return false;
        if (filters.season && item.season !== filters.season) return false;
        if (filters.genre) {
            const itemGenre = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
            if (!itemGenre.includes(filters.genre)) return false;
        }
        return true;
    });
};

window.renderPagination = () => {
    const total = window.getFilteredData().length;
    const pages = Math.ceil(total / itemsPerPage);
    if (pages <= 1) return '';
    return `<div class="pagination">${Array.from({length: pages}, (_, i) => i + 1).map(p => `<button class="${currentPage === p ? 'active' : ''}" onclick="window.changePage(${p})">${p}</button>`).join('')}</div>`;
};

window.showToast = (msg, type = 'success') => {
    const t = document.getElementById('toast');
    if (type === 'error') {
        t.innerHTML = `<div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="font-weight: bold; color: #ff4444;">⚠️ 系統錯誤</div>
            <div style="font-size: 13px; color: var(--neon-cyan); word-break: break-all;">${msg}</div>
            <button class="btn-primary" style="margin-top: 5px; padding: 5px; font-size: 11px; border-color: #ff4444; color: #ff4444;" onclick="this.parentElement.parentElement.classList.remove('active')">確定並關閉</button>
        </div>`;
        t.classList.add('active');
        t.style.transform = 'translateX(-50%) translateY(0)';
    } else {
        t.textContent = msg;
        t.className = 'toast active success';
        t.style.transform = 'translateX(-50%) translateY(0)';
        setTimeout(() => { t.classList.remove('active'); t.style.transform = 'translateX(-50%) translateY(100px)'; }, 3000);
    }
};

window.getOptionLabel = (key) => ({ genre: '類型', year: '年份', month: '月份', season: '季度', episodes: '集數', rating: '評分', recommendation: '推薦' }[key] || key);
window.getCategoryName = (cat) => ({ anime: '動畫', manga: '漫畫', movie: '電影' }[cat]);

window.toggleSystemMenu = (e) => {
    e.stopPropagation();
    const menu = document.getElementById('systemMenu');
    menu.classList.toggle('active');
};

window.refreshSystem = async () => {
    window.showToast('⏳ 正在同步資料...');
    await window.loadData();
    if (isAdmin) window.renderAdmin(); else window.renderApp();
    window.showToast('✓ 資料已同步');
};

window.hideLoginModal = () => {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active');
};

window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
    if (error) {
        window.showToast('✗ 登入失敗：' + error.message, 'error');
    } else {
        location.reload();
    }
};

document.addEventListener('click', () => {
    const menu = document.getElementById('systemMenu');
    if (menu) menu.classList.remove('active');
});
