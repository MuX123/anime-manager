// TECH v3.4.3 - ACG Manager Logic (System Admin AI Optimized)
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
        const { data: settings, error: settingsError } = await supabaseClient.from('site_settings').select('*');
        if (!settingsError && settings) {
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
        <div class="site-version">v5.7.8-ULTRA</div>
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
                    ${paged.map(item => window.renderCard(item)).join('')}
                </div>
                <div class="pagination" style="display: flex; justify-content: center; gap: 10px; margin-top: 40px; flex-wrap: wrap;">
                    ${window.renderPagination(filtered.length, currentPage, itemsPerPage, 'changePage')}
                </div>
            `}
        </div>
    `;
    if (isNotice) setTimeout(() => window.renderAnnouncements(), 100);
};

window.renderCard = (item) => {
    const starColor = item.star_color || optionsData.category_colors?.recommendation || '#ffcc00';
    const ratingColor = (optionsData.rating_colors && optionsData.rating_colors[item.rating]) ? optionsData.rating_colors[item.rating] : (optionsData.category_colors?.rating || 'var(--neon-purple)');
    const episodesColor = optionsData.category_colors?.episodes || 'var(--neon-green)';
    const nameColor = item.name_color || optionsData.category_colors?.name || '#ffffff';
    const yearColor = optionsData.category_colors?.year || 'var(--neon-cyan)';
    const cyanBase = 'rgba(0, 212, 255, 0.1)';
    
    const isMobileLayout = gridColumns === 'mobile';

    if (isMobileLayout) {
        return `
            <div class="anime-card mobile-layout-card" onclick="window.showAnimeDetail('${item.id}')" style="display: flex !important; align-items: center; margin: 0 0 12px 0 !important; background: ${cyanBase} !important; border: 2px solid ${ratingColor} !important; border-radius: 12px !important; padding: 12px 20px !important; gap: 20px; overflow: hidden; width: 100%;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 60px; flex-shrink: 0;">
                    <span style="color: ${starColor}; font-size: 16px;">${item.recommendation || '★'}</span>
                    <span style="color: ${ratingColor}; border: 1.5px solid ${ratingColor}; padding: 2px 10px; border-radius: 50px; font-size: 12px; font-weight: 900; background: ${ratingColor}22;">${item.rating || '普'}</span>
                </div>
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px;">
                    <h3 style="color: ${nameColor}; font-size: 16px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold;">${item.name}</h3>
                    <div style="display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; scrollbar-width: none;">
                        ${item.year ? `<span style="font-size: 11px; color: ${yearColor}; border: 1px solid ${yearColor}66; padding: 2px 8px; border-radius: 50px;">${item.year}</span>` : ''}
                        ${item.episodes ? `<span style="font-size: 11px; color: var(--neon-green); border: 1px solid var(--neon-green)66; padding: 2px 8px; border-radius: 50px;">全 ${item.episodes} 集</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    return `
        <div class="anime-card" onclick="window.showAnimeDetail('${item.id}')" style="border: 2px solid ${ratingColor}; background: ${cyanBase};">
            <div style="aspect-ratio: 2/3; overflow: hidden; position: relative;">
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; top: 0; left: 0; display: flex; align-items: center; gap: 10px; padding: 6px 15px; background: rgba(0,0,0,0.75); border-bottom-right-radius: 10px; backdrop-filter: blur(8px); z-index: 10;">
                    <span style="color: ${starColor}; font-size: 16px;">${item.recommendation || '★'}</span>
                    <div style="color: ${ratingColor}; font-weight: 900; font-size: 14px;">${item.rating || '普'}</div>
                </div>
                <div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.9); color: ${episodesColor}; font-size: 14px; padding: 4px 16px; border-radius: 50px; border: 1.5px solid ${episodesColor}; white-space: nowrap; z-index: 10;">全 ${item.episodes || '0'} 集</div>
            </div>
            <div style="padding: 15px; text-align: center; background: rgba(0,0,0,0.4); width: 100%;">
                <h3 style="color: ${nameColor}; font-size: 15px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold;">${item.name}</h3>
            </div>
        </div>
    `;
};

window.showAnimeDetail = (id) => {
    const item = animeData.find(a => a.id === id);
    if (!item) return;
    let modal = document.getElementById('detailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'detailModal';
        modal.className = 'modal';
        modal.innerHTML = `<div class="modal-content" id="detailContent"></div>`;
        document.body.appendChild(modal);
    }
    const content = document.getElementById('detailContent');
    
    const genres = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
    const links = Array.isArray(item.links) ? item.links : [];
    const starColor = optionsData.category_colors?.recommendation || item.star_color || '#ffcc00';
    const ratingColor = (optionsData.rating_colors && optionsData.rating_colors[item.rating]) ? optionsData.rating_colors[item.rating] : (optionsData.category_colors?.rating || 'var(--neon-purple)');
    const yearColor = optionsData.category_colors?.year || 'var(--neon-cyan)';
    const genreColor = optionsData.category_colors?.genre || 'var(--neon-cyan)';
    const episodesColor = optionsData.category_colors?.episodes || 'var(--neon-green)';
    const cyanBase = 'rgba(0, 212, 255, 0.1)';

    content.innerHTML = `
        <button class="btn-primary" style="position: absolute; top: 15px; right: 15px; z-index: 100; width: 40px; min-width: 40px; height: 40px; border-radius: 50%; padding: 0;" onclick="window.closeAnimeDetail()">✕</button>
        <div class="detail-container-v35" style="--rating-color: ${ratingColor}; border: 3px solid ${ratingColor}; background: ${cyanBase}; border-radius: 20px; overflow: hidden;">
            <div class="detail-poster-aside"><img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}"></div>
            <div class="detail-content-main force-scroll">
                <div class="detail-section-v35" style="margin-bottom: 15px;">
                    <div style="padding: 15px 25px; background: linear-gradient(90deg, rgba(0, 212, 255, 0.1), transparent); border-left: 6px solid var(--neon-blue);">
                        <h2 style="color: ${item.name_color || '#ffffff'}; margin: 0;">${item.name}</h2>
                        <div style="display: flex; gap: 12px; margin-top: 12px; overflow-x: auto; white-space: nowrap;">
                            ${item.year ? `<span style="background: ${yearColor}11; border: 1px solid ${yearColor}66; color: ${yearColor}; padding: 5px 14px; border-radius: 50px;">${item.year}</span>` : ''}
                            ${item.episodes ? `<span style="background: ${episodesColor}11; border: 1px solid ${episodesColor}66; color: ${episodesColor}; padding: 5px 14px; border-radius: 50px;">全 ${item.episodes} 集</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="detail-section-v35" style="margin-bottom: 15px;">
                    <div style="padding: 15px 25px; background: linear-gradient(90deg, rgba(0, 212, 255, 0.1), transparent); border-left: 6px solid var(--neon-blue);">
                        <div style="display: flex; gap: 12px; overflow-x: auto; white-space: nowrap;">
                            ${genres.map(g => `<span style="background: ${genreColor}11; border: 1px solid ${genreColor}66; color: ${genreColor}; padding: 5px 14px; border-radius: 50px;">${g}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="detail-section-v35" style="margin-bottom: 15px;">
                    <div style="padding: 20px 25px; background: linear-gradient(90deg, rgba(0, 212, 255, 0.1), transparent); border-left: 6px solid var(--neon-blue);">
                        <p style="color: ${item.desc_color || 'var(--text-secondary)'}; line-height: 2; font-size: 16px; white-space: pre-wrap; margin: 0;">${item.description || '暫無簡介'}</p>
                    </div>
                </div>
                <div class="detail-section-v35">
                    <div style="padding: 15px 25px; background: linear-gradient(90deg, rgba(0, 212, 255, 0.1), transparent); border-left: 6px solid var(--neon-blue);">
                        <div style="display: flex; gap: 12px; overflow-x: auto; white-space: nowrap;">
                            ${links.length > 0 ? links.map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="padding: 10px 20px; border-radius: 50px;">${l.name}</a>`).join('') : '<span>暫無連結</span>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
};
window.closeAnimeDetail = () => document.getElementById('detailModal').classList.remove('active');

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
            <div class="admin-table-container">
                <table>
                    <thead>
                        <tr><th>名稱</th><th>年份</th><th>評分</th><th style="text-align: center;">操作</th></tr>
                    </thead>
                    <tbody>
                        ${pagedData.map(item => `
                            <tr>
                                <td style="font-weight: bold;">${item.name}</td>
                                <td>${item.year || ''}</td>
                                <td>${item.rating || ''}</td>
                                <td style="text-align: center; white-space: nowrap;">
                                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; min-width: 60px; margin-right: 5px;" onclick="window.editAnime('${item.id}')">📝 編輯</button>
                                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; min-width: 60px; border-color: #ff4444; color: #ff4444;" onclick="window.deleteAnime('${item.id}')">✕ 刪除</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="pagination">
                ${window.renderPagination(total, adminPage, adminItemsPerPage, 'changeAdminPage')}
            </div>
        `;
    }
    return `<div style="padding: 20px; text-align: center; color: var(--neon-cyan);">功能開發中...</div>`;
};

window.getFilteredData = () => {
    return animeData.filter(item => {
        if (item.category !== currentCategory) return false;
        if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        for (const key in filters) {
            if (key === 'search' || !filters[key]) continue;
            if (key === 'genre') { if (!item.genre || !item.genre.includes(filters.genre)) return false; }
            else { if (item[key] !== filters[key]) return false; }
        }
        return true;
    });
};

window.switchCategory = async (cat) => { 
    currentCategory = cat; currentSection = cat; currentPage = 1; adminPage = 1;
    filters = { search: '', genre: '', year: '', rating: '', season: '', month: '' }; 
    if (cat === 'notice') { window.renderApp(); return; }
    await window.loadData();
    if (document.querySelector('.admin-container')) window.renderAdmin(); else window.renderApp();
};

window.renderSearchSelectsHTML = () => {
    const keys = ['genre', 'year', 'season', 'month', 'episodes', 'rating', 'recommendation'];
    return keys.map(key => {
        const options = optionsData[key] || [];
        if (options.length === 0) return '';
        return `<select class="auto-width-select" onchange="window.handleFilter('${key}', this.value)"><option value="">${window.getOptionLabel(key)}</option>${options.map(opt => `<option value="${opt}" ${filters[key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select>`;
    }).join('');
};

window.handleFilter = (key, val) => { filters[key] = val; currentPage = 1; window.renderApp(); };
window.handleSearch = (val) => { filters.search = val; currentPage = 1; window.renderApp(); };
window.getOptionLabel = (key) => {
    const labels = { genre: '類型', year: '年份', month: '月份', season: '季度', episodes: '集數', rating: '評分', recommendation: '推薦' };
    return labels[key] || key;
};

window.toggleAdminMode = (show) => {
    currentSection = show ? 'admin' : currentCategory;
    const bar = document.getElementById('topControlBar');
    if (bar) bar.style.display = show ? 'none' : 'flex';
    if (show) window.renderAdmin(); else window.renderApp();
};

window.switchAdminTab = (tab, id = null) => { currentAdminTab = tab; editId = id; window.renderAdmin(); };

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
    document.querySelectorAll('.force-scroll').forEach(c => {
        c.addEventListener('wheel', (e) => {
            if (c.scrollWidth > c.clientWidth && e.deltaY !== 0) { e.preventDefault(); c.scrollLeft += e.deltaY; }
        }, { passive: false });
    });
};

window.renderAnnouncements = async function() {
    const container = document.getElementById('discord-section');
    if (!container) return;
    try {
        const { data, error } = await supabaseClient.from('announcements').select('*').order('timestamp', { ascending: false });
        if (error || !data || data.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--text-secondary);">目前尚無公告</div>';
            return;
        }
        container.innerHTML = `<div style="display: flex; flex-direction: column; gap: 20px; padding: 20px;">${data.map(item => `<div style="background: rgba(0,212,255,0.05); padding: 20px; border-radius: 10px; border: 1px solid rgba(0,212,255,0.2);"><div style="color: var(--neon-cyan); font-weight: bold; margin-bottom: 10px;">${item.author_name || '管理員'} - ${new Date(item.timestamp).toLocaleString()}</div><div style="line-height: 1.6;">${item.content}</div></div>`).join('')}</div>`;
    } catch (e) { container.innerHTML = '公告載入失敗'; }
};

window.showLoginModal = () => {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
};

window.hideLoginModal = () => {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
};

window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
        window.showToast('請輸入電子郵件和密碼', 'error');
        return;
    }
    try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            window.showToast('登入失敗: ' + error.message, 'error');
        } else {
            window.hideLoginModal();
            window.showToast('登入成功');
        }
    } catch (e) {
        window.showToast('登入錯誤', 'error');
    }
};

window.handleLogout = async () => {
    try {
        await supabaseClient.auth.signOut();
        window.showToast('已登出');
        window.renderApp();
    } catch (e) {
        window.showToast('登出失敗', 'error');
    }
};

window.editAnime = (id) => {
    window.switchAdminTab('add', id);
};

window.deleteAnime = async (id) => {
    if (!confirm('確認刪除此作品?')) return;
    try {
        const { error } = await supabaseClient.from('anime_list').delete().eq('id', id);
        if (error) {
            window.showToast('刪除失敗', 'error');
        } else {
            window.showToast('刪除成功');
            await window.loadData();
            window.renderAdmin();
        }
    } catch (e) {
        window.showToast('刪除錯誤', 'error');
    }
};

window.exportCSV = () => {
    const filtered = animeData.filter(item => item.category === currentCategory);
    const csv = [['名稱', '年份', '評分', '集數', '類型', '描述'].join(',')];
    filtered.forEach(item => {
        csv.push([item.name, item.year, item.rating, item.episodes, item.genre?.join('|') || '', item.description || ''].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentCategory}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
};

window.triggerImport = () => {
    document.getElementById('importFile').click();
};

window.importData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
        window.showToast('無效的CSV文件', 'error');
        return;
    }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
    });
    try {
        for (const row of rows) {
            await supabaseClient.from('anime_list').insert({
                name: row.名稱 || row.name || '',
                year: row.年份 || row.year || '',
                rating: row.評分 || row.rating || '',
                episodes: row.集數 || row.episodes || '',
                genre: row.類型 ? row.類型.split('|') : [],
                description: row.描述 || row.description || '',
                category: currentCategory
            });
        }
        window.showToast('匯入成功');
        await window.loadData();
        window.renderAdmin();
    } catch (e) {
        window.showToast('匯入失敗', 'error');
    }
};

window.initApp();
