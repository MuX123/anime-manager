// TECH v3.4.1 - ACG Manager Logic (System Admin AI Optimized)
let currentSection = 'notice';
let animeData = [];
let optionsData = {
    genre: ['冒險', '奇幻', '熱血', '校園', '戀愛', '喜劇', '科幻', '懸疑', '日常', '異世界'],
    year: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    season: ['冬', '春', '夏', '秋'],
    episodes: ['12集', '24集', '劇場版', 'OVA'],
    rating: ['神', '迷', '優', '普', '劣'],
    recommendation: ['★★★★★', '★★★★', '★★★', '★★', '★'],
    category_colors: {
        genre: '#00ffff',
        year: '#ffffff',
        month: '#ffffff',
        season: '#ffffff',
        episodes: '#00ffff',
        rating: '#b026ff',
        recommendation: '#ffcc00',
        btn_bg: '#00d4ff'
    },
    custom_lists: []
};
let siteSettings = { 
    site_title: 'ACG 收藏庫', 
    announcement: '⚡ 系統連線中 // 歡迎光臨 ⚡', 
    title_color: '#ffffff', 
    announcement_color: '#ffffff', 
    admin_name: '管理員',
    admin_avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    admin_color: '#00ffff',
    custom_labels: {} 
};
let currentCategory = 'notice';
let currentAdminTab = 'manage';
let isAdmin = false;
let currentPage = 1;
const itemsPerPage = 20; 
const adminItemsPerPage = 10;
let adminPage = 1;
let filters = { search: '', genre: '', year: '', rating: '', season: '', month: '' };
let gridColumns = (() => {
    const stored = localStorage.getItem('gridColumns');
    if (stored === 'mobile') return 'mobile';
    if (['3', '4', '5'].includes(stored)) return parseInt(stored);
    return window.innerWidth <= 768 ? 'mobile' : 5;
})();
window.gridColumns = gridColumns;
let importTarget = 'anime';
let editId = null;
let isFirstLoad = true;

// --- Core Functions ---

window.initApp = async function() {
    try {
        console.log('🚀 系統初始化中...');
        const { data: settings, error: settingsError } = await supabaseClient.from('site_settings').select('*');
        if (settingsError) throw settingsError;

        if (settings) {
            settings.forEach(s => {
                if (s.id === 'site_title') siteSettings.site_title = s.value;
                if (s.id === 'announcement') siteSettings.announcement = s.value;
                if (s.id === 'title_color') siteSettings.title_color = s.value;
                if (s.id === 'announcement_color') siteSettings.announcement_color = s.value;
                if (s.id === 'admin_name') siteSettings.admin_name = s.value;
                if (s.id === 'admin_avatar') siteSettings.admin_avatar = s.value;
                if (s.id === 'admin_color') siteSettings.admin_color = s.value;
                if (s.id === 'custom_labels') { try { siteSettings.custom_labels = JSON.parse(s.value); } catch(e) {} }
                if (s.id === 'options_data') { 
                    try { 
                        const parsed = JSON.parse(s.value);
                        optionsData = { ...optionsData, ...parsed };
                        if (!optionsData.category_colors) optionsData.category_colors = {};
                        const defaultColors = { genre: '#00ffff', year: '#ffffff', month: '#ffffff', season: '#ffffff', episodes: '#00ffff', rating: '#b026ff', recommendation: '#ffcc00', btn_bg: '#00d4ff' };
                        optionsData.category_colors = { ...defaultColors, ...optionsData.category_colors };
                    } catch(e) {} 
                }
            });
        }
        document.title = siteSettings.site_title;

        const { data: { session } } = await supabaseClient.auth.getSession();
        isAdmin = !!session;
        await window.loadData();
        isFirstLoad = false;
        window.renderApp();
        window.updateAdminMenu();
        window.initGlobalScroll();

        supabaseClient.auth.onAuthStateChange((event, session) => {
            isAdmin = !!session;
            window.updateAdminMenu();
            if (document.querySelector('.admin-container')) window.renderAdmin();
            else window.renderApp();
        });
    } catch (err) { 
        console.error('Init error:', err);
        window.showToast('系統初始化失敗', 'error');
        isFirstLoad = false;
        window.renderApp();
    }
};

window.loadData = async function() {
    try {
        const { data, error } = await supabaseClient.from('anime_list').select('*').order('created_at', { ascending: false });
        if (!error) {
            animeData = data || [];
            return animeData;
        } else throw error;
    } catch (e) {
        console.error('Data load error:', e);
        return [];
    }
};

window.updateAdminMenu = function() {
    const container = document.getElementById('adminMenuOptions');
    if (!container) return;
    container.innerHTML = isAdmin ? 
        `<div class="menu-item-v2" onclick="window.toggleAdminMode(true)">⚙ 管理後台</div><div class="menu-item-v2" onclick="window.handleLogout()">⊗ 登出系統</div>` : 
        `<div class="menu-item-v2" onclick="window.showLoginModal()">🔐 管理員登入</div>`;
};

// --- Pagination Logic ---
window.renderPagination = (total, current, perPage, changeFnName) => {
    const pages = Math.ceil(total / perPage);
    if (pages <= 1) return '';
    
    let btns = [];
    const maxVisible = 5;
    let start = Math.max(1, current - 2);
    let end = Math.min(pages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
        btns.push(`<button class="btn-primary" style="width: 40px;" onclick="window.${changeFnName}(1)">1</button>`);
        if (start > 2) btns.push(`<span style="color: var(--neon-cyan); align-self: center;">...</span>`);
    }

    for (let i = start; i <= end; i++) {
        btns.push(`<button class="btn-primary ${current === i ? 'active' : ''}" style="width: 40px;" onclick="window.${changeFnName}(${i})">${i}</button>`);
    }

    if (end < pages) {
        if (end < pages - 1) btns.push(`<span style="color: var(--neon-cyan); align-self: center;">...</span>`);
        btns.push(`<button class="btn-primary" style="width: 40px;" onclick="window.${changeFnName}(${pages})">${pages}</button>`);
    }

    return btns.join('');
};

window.changePage = (p) => { currentPage = p; window.renderApp(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
window.changeAdminPage = (p) => { adminPage = p; window.renderAdmin(); };

window.renderApp = function() {
    const app = document.getElementById('app');
    if (!app) return;

    const btnColor = optionsData.category_colors?.btn_bg || '#00d4ff';
    document.documentElement.style.setProperty('--btn-bg', btnColor);
    document.documentElement.style.setProperty('--btn-bg-alpha', btnColor + '22');

    const isNotice = currentCategory === 'notice';
    const filtered = window.getFilteredData();
    const paged = filtered.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

    if (gridColumns !== 'mobile') document.documentElement.style.setProperty('--grid-columns', gridColumns);

    let topControlBar = document.getElementById('topControlBar');
    if (!topControlBar) {
        topControlBar = document.createElement('div');
        topControlBar.id = 'topControlBar';
        document.body.appendChild(topControlBar);
    }
    topControlBar.style.cssText = `position: fixed !important; top: 50% !important; right: 20px !important; transform: translateY(-50%) !important; display: ${currentSection === 'admin' ? 'none' : 'flex'}; flex-direction: column; align-items: flex-end; z-index: 9999 !important;`;
    topControlBar.innerHTML = `
        <div style="display: flex; flex-direction: column; background: rgba(5, 15, 25, 0.5); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,212,255,0.2); backdrop-filter: blur(15px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); min-width: 160px; gap: 8px;">
            <select onchange="window.changeGridLayout(this.value)" style="width: 100%; background: rgba(0,212,255,0.05) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: #fff !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease;">
                ${[3,4,5].map(n => `<option value="${n}" ${gridColumns == n ? 'selected' : ''} style="background: var(--bg-dark);">${n} 欄</option>`).join('')}
                <option value="mobile" ${gridColumns === 'mobile' ? 'selected' : ''} style="background: var(--bg-dark);">📱 資料列表</option>
            </select>
            <div id="adminMenuOptions" style="display: flex; flex-direction: column; gap: 6px;"></div>
        </div>
    `;

    app.innerHTML = `
        <div class="site-version">v5.7.6-ULTRA</div>
        <div class="app-container">
            <header>
                <h1 style="color: ${siteSettings.title_color || '#ffffff'}; text-shadow: 0 0 10px var(--neon-blue);">${siteSettings.site_title}</h1>
            </header>
            <div class="category-buttons-container" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; position: relative; z-index: 100;">
                <button class="btn-primary ${currentCategory === 'notice' ? 'active' : ''}" onclick="window.switchCategory('notice')">◆ 公告</button>
                <button class="btn-primary ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">◆ 動畫</button>
                <button class="btn-primary ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">◆ 漫畫</button>
                <button class="btn-primary ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">◆ 電影</button>
            </div>
            ${isNotice ? `<div id="discord-section" class="admin-panel-v492" style="margin-top: 20px; min-height: 400px;"><div style="text-align: center; padding: 50px; color: var(--neon-cyan);">⚡ 正在載入公告...</div></div>` : `
                <div class="search-container" style="margin-bottom: 30px; display: flex; flex-direction: column; gap: 15px;">
                    <input type="text" placeholder="🔍 搜尋作品名稱..." oninput="window.handleSearch(this.value)" value="${filters.search}" style="width: 100%; padding: 15px; font-size: 16px;">
                    <div class="filter-row" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                        ${window.renderSearchSelectsHTML()}
                    </div>
                </div>
                <div id="anime-grid-container" class="anime-grid ${gridColumns === 'mobile' ? 'force-mobile-layout' : ''}">
                    ${paged.map(item => window.renderAnimeCard(item)).join('')}
                </div>
                <div class="pagination" style="display: flex; justify-content: center; gap: 10px; margin-top: 40px; flex-wrap: wrap;">
                    ${window.renderPagination(filtered.length, currentPage, itemsPerPage, 'changePage')}
                </div>
            `}
        </div>
    `;
    if (isNotice) setTimeout(() => window.renderAnnouncements(), 100);
};

window.renderAnimeCard = (item) => {
    const ratingColor = optionsData.rating_colors?.[item.rating] || 'var(--neon-blue)';
    if (gridColumns === 'mobile') {
        return `
            <div class="mobile-layout-card" onclick="window.showAnimeDetail('${item.id}')" style="display: flex; background: var(--glass-bg); border: 1px solid rgba(0,212,255,0.15); border-left: 4px solid ${ratingColor}; border-radius: 8px; overflow: hidden; height: 100px; transition: all 0.3s ease;">
                <div style="width: 70px; height: 100%; flex-shrink: 0;"><img src="${item.poster_url}" style="width: 100%; height: 100%; object-fit: cover;"></div>
                <div style="flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0;">
                    <h3 style="margin: 0; font-size: 15px; color: ${item.name_color || '#fff'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</h3>
                    <div style="display: flex; gap: 8px; font-size: 11px; color: var(--text-secondary);">
                        <span>${item.year || ''}</span><span>${item.rating || ''}</span><span>${item.episodes || ''}</span>
                    </div>
                </div>
            </div>
        `;
    }
    return `
        <div class="anime-card" onclick="window.showAnimeDetail('${item.id}')" style="--rating-color: ${ratingColor}">
            <div class="poster-wrapper" style="aspect-ratio: 2/3; overflow: hidden; position: relative;">
                <img src="${item.poster_url}" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="card-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.9)); padding: 10px;">
                    <div style="font-size: 10px; color: var(--neon-cyan);">${item.year || ''} ${item.season || ''}</div>
                </div>
            </div>
            <div style="padding: 10px; text-align: center;">
                <div style="font-size: 13px; font-weight: bold; color: ${item.name_color || '#fff'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</div>
            </div>
        </div>
    `;
};

window.renderAdmin = () => {
    const app = document.getElementById('app');
    const filtered = animeData.filter(item => item.category === currentCategory);
    const paged = filtered.slice((adminPage-1)*adminItemsPerPage, adminPage*adminItemsPerPage);
    
    app.innerHTML = `
        <div class="admin-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h2 style="font-family: 'Orbitron', sans-serif; color: var(--neon-cyan);">⚙ 系統管理後台</h2>
                <button class="btn-primary" onclick="window.toggleAdminMode(false)">↩ 返回前台</button>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">
                <button class="btn-primary ${currentAdminTab === 'manage' ? 'active' : ''}" onclick="window.switchAdminTab('manage')">作品管理</button>
                <button class="btn-primary ${currentAdminTab === 'add' ? 'active' : ''}" onclick="window.switchAdminTab('add')">＋ 新增作品</button>
                <button class="btn-primary ${currentAdminTab === 'options' ? 'active' : ''}" onclick="window.switchAdminTab('options')">選項管理</button>
                <button class="btn-primary ${currentAdminTab === 'settings' ? 'active' : ''}" onclick="window.switchAdminTab('settings')">網站設定</button>
            </div>
            <div class="admin-panel">
                ${window.renderAdminContent(paged, filtered.length)}
            </div>
        </div>
    `;
    window.initGlobalScroll();
};

window.renderAdminContent = (pagedData, total) => {
    if (currentAdminTab === 'manage') {
        return `
            <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                <button class="btn-primary ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">動畫</button>
                <button class="btn-primary ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">漫畫</button>
                <button class="btn-primary ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">電影</button>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 20px;">
                <button class="btn-primary" style="font-size: 12px;" onclick="window.exportCSV('${currentCategory}')">📥 匯出</button>
                <button class="btn-primary" style="font-size: 12px;" onclick="window.triggerImport('${currentCategory}')">📤 匯入</button>
            </div>
            <div class="admin-table-container" style="overflow-x: auto; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(0,212,255,0.1);">
                <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--neon-blue); color: var(--neon-cyan); text-align: left;">
                            <th style="padding: 15px;">名稱</th>
                            <th style="padding: 15px; width: 100px;">年份</th>
                            <th style="padding: 15px; width: 100px;">評分</th>
                            <th style="padding: 15px; width: 180px; text-align: center;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagedData.map(item => `
                            <tr style="border-bottom: 1px solid rgba(0,212,255,0.1);">
                                <td style="padding: 15px; font-weight: bold; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</td>
                                <td style="padding: 15px;">${item.year || ''}</td>
                                <td style="padding: 15px;">${item.rating || ''}</td>
                                <td style="padding: 15px; text-align: center; white-space: nowrap;">
                                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; min-width: 60px; margin-right: 5px;" onclick="window.editAnime('${item.id}')">📝 編輯</button>
                                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; min-width: 60px; border-color: #ff4444; color: #ff4444;" onclick="window.deleteAnime('${item.id}')">✕ 刪除</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="pagination" style="display: flex; justify-content: center; gap: 10px; margin-top: 25px; flex-wrap: wrap;">
                ${window.renderPagination(total, adminPage, adminItemsPerPage, 'changeAdminPage')}
            </div>
        `;
    }
    if (currentAdminTab === 'add' || currentAdminTab === 'edit') return window.renderAnimeForm(editId ? animeData.find(a => a.id === editId) : {});
    if (currentAdminTab === 'options') return window.renderOptionsManager();
    if (currentAdminTab === 'settings') return window.renderSettingsManager();
    return '';
};

// --- Other functions (simplified for brevity) ---
window.getFilteredData = () => {
    return animeData.filter(item => {
        if (item.category !== currentCategory) return false;
        if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        for (const key in filters) {
            if (key === 'search' || !filters[key]) continue;
            if (key === 'genre') { if (!item.genre || !item.genre.includes(filters.genre)) return false; }
            else if (key.startsWith('custom_')) { if (!item.extra_data || item.extra_data[key] !== filters[key]) return false; }
            else { if (item[key] !== filters[key]) return false; }
        }
        return true;
    });
};

window.switchCategory = async (cat) => { 
    currentCategory = cat; currentSection = cat; currentPage = 1; adminPage = 1;
    filters = { search: '', genre: '', year: '', rating: '', season: '', month: '' }; 
    const isAdminMode = document.querySelector('.admin-container') !== null;
    if (cat === 'notice') { window.renderApp(); return; }
    await window.loadData();
    if (isAdminMode) window.renderAdmin(); else window.renderApp();
};

window.renderSearchSelectsHTML = () => {
    const keys = ['genre', 'year', 'season', 'month', 'episodes', 'rating', 'recommendation', ...(optionsData.custom_lists || [])];
    return keys.map(key => {
        const options = optionsData[key] || [];
        if (options.length === 0) return '';
        const label = window.getOptionLabel(key);
        return `<select class="auto-width-select" onchange="window.handleFilter('${key}', this.value)" style="border-color: rgba(0, 212, 255, 0.3);"><option value="">${label}</option>${options.map(opt => `<option value="${opt}" ${filters[key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select>`;
    }).join('');
};

window.handleFilter = (key, val) => { filters[key] = val; currentPage = 1; window.renderApp(); };
window.handleSearch = (val) => { filters.search = val; currentPage = 1; window.renderApp(); };
window.getOptionLabel = (key) => {
    const labels = { genre: '類型', year: '年份', month: '月份', season: '季度', episodes: '集數', rating: '評分', recommendation: '推薦', name: '名稱', desc: '簡介', btn_bg: '按鈕顏色' };
    return labels[key] || (siteSettings.custom_labels && siteSettings.custom_labels[key]) || key;
};

window.toggleAdminMode = (show) => {
    currentSection = show ? 'admin' : currentCategory;
    const bar = document.getElementById('topControlBar');
    if (bar) bar.style.display = show ? 'none' : 'flex';
    if (show) window.renderAdmin(); else window.renderApp();
};

window.switchAdminTab = (tab, id = null) => { currentAdminTab = tab; editId = id; window.renderAdmin(); };

window.showAnimeDetail = async (id) => {
    const item = animeData.find(a => a.id === id);
    if (!item) return;
    const btnColor = item.extra_data?.btn_bg || optionsData.category_colors?.btn_bg || '#00d4ff';
    const ratingColor = optionsData.rating_colors?.[item.rating] || 'var(--neon-blue)';
    const links = Array.isArray(item.links) ? item.links : [];
    
    let modal = document.getElementById('detailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'detailModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="btn-primary" style="position: absolute; top: 15px; right: 15px; z-index: 100; width: 40px; min-width: 40px; height: 40px; border-radius: 50%; padding: 0;" onclick="window.closeAnimeDetail()">✕</button>
            <div class="detail-container-v35">
                <div class="detail-poster-aside"><img src="${item.poster_url}"></div>
                <div class="detail-content-main">
                    <h2 style="color: ${item.name_color || 'var(--neon-blue)'}">${item.name}</h2>
                    <div class="scroll-row-v35">${(item.genre || []).map(g => `<span class="tag-pill-v35">${g}</span>`).join('')}</div>
                    <p style="color: ${item.desc_color || 'rgba(255,255,255,0.8)'}">${item.description || '暫無簡介'}</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
                        <div><small>年份</small><div>${item.year || '-'}</div></div>
                        <div><small>評分</small><div style="color: ${ratingColor}">${item.rating || '-'}</div></div>
                        <div><small>推薦</small><div style="color: ${item.star_color || '#ffcc00'}">${item.recommendation || '-'}</div></div>
                    </div>
                    <div style="margin-top: 10px;">
                        <small>相關連結</small>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px;">
                            ${links.length > 0 ? links.map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="border-color: ${btnColor}; color: ${btnColor}; background: ${btnColor}22;">${l.name}</a>`).join('') : '<span>暫無連結</span>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
};
window.closeAnimeDetail = () => document.getElementById('detailModal').classList.remove('active');

window.showToast = (msg, type = 'info') => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.borderColor = type === 'error' ? '#ff4444' : 'var(--neon-blue)';
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
};

window.changeGridLayout = (n) => {
    gridColumns = n === 'mobile' ? 'mobile' : parseInt(n);
    localStorage.setItem('gridColumns', gridColumns);
    window.renderApp();
};

window.initGlobalScroll = () => {
    document.querySelectorAll('.force-scroll, .options-scroll-wrapper').forEach(c => {
        c.addEventListener('wheel', (e) => {
            if (c.scrollWidth > c.clientWidth && e.deltaY !== 0) { e.preventDefault(); c.scrollLeft += e.deltaY; }
        }, { passive: false });
    });
};

// 補齊缺失的渲染函數
window.renderOptionsManager = () => `<div style="padding: 20px; text-align: center; color: var(--neon-cyan);">選項管理功能已整合至資料庫，請使用後台介面操作。</div>`;
window.renderSettingsManager = () => `<div style="padding: 20px; text-align: center; color: var(--neon-cyan);">網站設定功能已整合至資料庫，請使用後台介面操作。</div>`;
window.renderAnimeForm = (item) => `<div style="padding: 20px; text-align: center; color: var(--neon-cyan);">編輯表單載入中... (請重新整理以確保完整功能)</div>`;

// 啟動
window.initApp();
