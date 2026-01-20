// TECH v3.2.1 ULTRA - ACG Manager Logic
let animeData = [];
let optionsData = { genre: [], year: [], month: [], season: [], episodes: [], rating: [], recommendation: [], category_colors: {} };
let siteSettings = { site_title: 'TECH v3.2.1 ULTRA', announcement: '歡迎來到 ACG 收藏庫', title_color: '#00d4ff', announcement_color: '#00d4ff' };
let currentCategory = 'anime';
let currentPage = 1;
let itemsPerPage = 18; // 根據偏好設定為 18
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
                    ...extra,
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
        <button class="menu-item-v2" onclick="window.switchAdminTab('manage')">📦 作品管理</button>
        <button class="menu-item-v2" onclick="window.switchAdminTab('add')">➕ 新增作品</button>
        <button class="menu-item-v2" onclick="window.switchAdminTab('options')">⚙ 選項管理</button>
        <button class="menu-item-v2" onclick="window.switchAdminTab('data')">💾 資料備份</button>
        <button class="menu-item-v2" onclick="window.switchAdminTab('settings')">🔧 網站設定</button>
        <button class="menu-item-v2" style="color: #ff4444;" onclick="supabaseClient.auth.signOut().then(() => location.reload())">🚪 登出</button>
    `;
};

// --- Rendering Functions ---
window.renderApp = () => {
    const app = document.getElementById('app');
    if (!app) return;

    const filtered = window.getFilteredData();
    const paged = filtered.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

    app.innerHTML = `
        <div class="app-container">
            <header>
                <h1 style="color: ${siteSettings.title_color || 'var(--neon-cyan)'}; text-shadow: 0 0 10px ${siteSettings.title_color || 'var(--neon-blue)'};">${siteSettings.site_title}</h1>
            </header>
            
            <div class="announcement-bar" style="border: 1px solid ${siteSettings.announcement_color || 'var(--neon-blue)'}; padding: 10px; margin-bottom: 30px; text-align: center; background: rgba(0,212,255,0.05);">
                <div style="color: ${siteSettings.announcement_color || 'var(--neon-cyan)'};">
                    <span>📢 ${siteSettings.announcement}</span>
                </div>
            </div>

            <nav class="category-nav" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px;">
                <button class="btn-primary ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">動畫</button>
                <button class="btn-primary ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">漫畫</button>
                <button class="btn-primary ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">電影</button>
            </nav>

            <div class="filter-section" style="display: flex; gap: 15px; margin-bottom: 40px; background: var(--glass-bg); padding: 20px; border: 1px solid rgba(0,212,255,0.1);">
                <input type="text" placeholder="搜尋作品名稱..." oninput="window.handleSearch(this.value)" value="${filters.search}" style="flex: 1;">
                <div style="display: flex; gap: 10px;">
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
                ${paged.map(item => window.renderCard(item)).join('')}
            </div>

            ${window.renderPagination()}
            
            <div style="position: fixed; bottom: 20px; right: 20px; cursor: pointer; opacity: 0.5;" onclick="window.toggleAdminMode(true)">⚙</div>
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
                    <span style="color: var(--neon-cyan); font-weight: bold;">[ ${timeInfo} ]</span>
                    <span style="color: ${episodesColor};">${episodes}</span>
                </div>
            </div>
        </div>
    `;
};

window.showAnimeDetail = (id) => {
    const item = animeData.find(a => a.id === id);
    if (!item) return;

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    
    const genres = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
    const links = Array.isArray(item.links) ? item.links : [];

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 30px;">
            <div>
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}" style="width: 100%; border: 1px solid var(--neon-blue);">
            </div>
            <div>
                <h2 style="color: ${item.name_color || 'var(--neon-cyan)'}; font-family: 'Orbitron', sans-serif; margin-bottom: 15px;">${item.name}</h2>
                
                <div class="horizontal-scroll-container force-scroll" style="margin-bottom: 20px;">
                    ${genres.map(g => `<span class="tag-item">${g}</span>`).join('')}
                </div>

                <div style="color: ${item.desc_color || 'var(--text-main)'}; line-height: 1.8; margin-bottom: 25px; font-size: 14px;">
                    ${item.description || '暫無簡介。'}
                </div>

                <div style="margin-bottom: 20px; padding: 15px; background: rgba(0,212,255,0.05); border-left: 4px solid var(--neon-blue);">
                    <div style="color: var(--neon-cyan); font-weight: bold;">
                        ${item.year || ''} ${item.season || ''} ${item.month || ''} | ${item.episodes ? '全 ' + item.episodes + ' 集' : ''} | ★ ${item.rating || '0.0'}
                    </div>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${links.map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 12px;">🔗 ${l.name}</a>`).join('')}
                    ${isAdmin ? `<button class="btn-primary" style="border-color: var(--neon-purple); color: var(--neon-purple);" onclick="window.editAnime('${item.id}')">📝 編輯</button>` : ''}
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
};

window.closeAnimeDetail = () => { document.getElementById('detailModal').classList.remove('active'); };
window.switchCategory = (cat) => { currentCategory = cat; currentPage = 1; if (isAdmin) window.renderAdmin(); else window.renderApp(); };
window.handleSearch = (val) => { filters.search = val; currentPage = 1; window.renderApp(); };
window.handleFilter = (key, val) => { filters[key] = val; currentPage = 1; window.renderApp(); };
window.changePage = (p) => { currentPage = p; window.renderApp(); window.scrollTo({top: 0, behavior: 'smooth'}); };

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
    return `<div style="display: flex; justify-content: center; gap: 8px; margin-top: 20px;">
        ${Array.from({length: pages}, (_, i) => i + 1).map(p => `<button class="btn-primary ${currentPage === p ? 'active' : ''}" style="width: 40px; padding: 10px 0;" onclick="window.changePage(${p})">${p}</button>`).join('')}
    </div>`;
};

window.toggleSystemMenu = (e) => { e.stopPropagation(); document.getElementById('systemMenu').classList.toggle('active'); };
window.refreshSystem = async () => { window.showToast('⏳ 同步中...'); await window.loadData(); if (isAdmin) window.renderAdmin(); else window.renderApp(); window.showToast('✓ 已同步'); };
window.showToast = (msg, type = 'success') => {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast active ' + type;
    setTimeout(() => t.classList.remove('active'), 3000);
};

window.toggleAdminMode = (show) => { if (show && !isAdmin) document.getElementById('loginModal').classList.add('active'); else if (!show) { isAdmin = false; window.renderApp(); } };
window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
    if (error) window.showToast('✗ 失敗', 'error'); else location.reload();
};

window.renderAdmin = () => {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="admin-container"><header><h1>⚙ 管理模式</h1><button class="btn-primary" onclick="window.toggleAdminMode(false)">返回</button></header><div id="adminMenuOptions" style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;"></div><div id="adminMainContent" style="margin-top: 30px; text-align: center; border: 1px dashed var(--neon-blue); padding: 50px;">請選擇功能</div></div>`;
    window.updateAdminMenu();
};

document.addEventListener('click', () => { const m = document.getElementById('systemMenu'); if (m) m.classList.remove('active'); });
