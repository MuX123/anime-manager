// TECH v3.2.0 ULTRA - ACG Manager Logic
let animeData = [];
let optionsData = { genre: [], year: [], month: [], season: [], episodes: [], rating: [], recommendation: [], category_colors: {} };
let siteSettings = { site_title: 'TECH v3.2.0 ULTRA', announcement: '歡迎來到 ACG 收藏庫', title_color: '#00d4ff', announcement_color: '#00d4ff' };
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
        <div class="menu-item-v2" onclick="window.switchAdminTab('manage')">📦 作品管理</div>
        <div class="menu-item-v2" onclick="window.switchAdminTab('add')">➕ 新增作品</div>
        <div class="menu-item-v2" onclick="window.switchAdminTab('options')">⚙ 選項管理</div>
        <div class="menu-item-v2" onclick="window.switchAdminTab('data')">💾 資料備份</div>
        <div class="menu-item-v2" onclick="window.switchAdminTab('settings')">🔧 網站設定</div>
        <div class="menu-item-v2" style="color: #ff4444;" onclick="supabaseClient.auth.signOut().then(() => location.reload())">🚪 登出系統</div>
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
                <h1 style="color: ${siteSettings.title_color || 'var(--neon-cyan)'}; text-shadow: 0 0 15px ${siteSettings.title_color || 'var(--neon-blue)'};">${siteSettings.site_title}</h1>
            </header>
            
            <div class="announcement-bar" style="border-color: ${siteSettings.announcement_color || 'var(--neon-blue)'};">
                <div style="color: ${siteSettings.announcement_color || 'var(--neon-cyan)'}; font-weight: bold;">
                    📢 ${siteSettings.announcement}
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
                ${paged.map(item => window.renderCard(item)).join('')}
            </div>

            ${window.renderPagination()}
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
                <div class="card-rating-badge">★ ${item.rating || '0.0'}</div>
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
        <div class="detail-layout">
            <div class="detail-poster">
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${item.name}">
            </div>
            <div class="detail-info">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h2 style="color: ${item.name_color || 'var(--neon-cyan)'};">${item.name}</h2>
                    <div style="background: rgba(0,0,0,0.5); padding: 5px 15px; border-radius: 8px; border: 1px solid var(--neon-blue);">
                        <span style="font-size: 20px; color: ${item.star_color || '#ffcc00'}; font-weight: bold;">${item.rating || '0.0'}</span>
                        <span style="color: ${item.star_color || '#ffcc00'}; margin-left: 5px;">★</span>
                    </div>
                </div>
                
                <div class="detail-tags force-scroll">
                    ${genres.map(g => `<span class="tag-item">${g}</span>`).join('')}
                </div>

                <div class="detail-desc" style="color: ${item.desc_color || 'var(--text-main)'};">
                    ${item.description || '暫無簡介資料。'}
                </div>

                <div style="margin-bottom: 20px; padding: 15px; background: rgba(0,212,255,0.05); border-radius: 8px; border-left: 4px solid var(--neon-blue);">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 5px;">作品資訊</div>
                    <div style="color: var(--neon-cyan); font-weight: bold;">
                        ${item.year || ''} ${item.season || ''} ${item.month || ''} | ${item.episodes ? '全 ' + item.episodes + ' 集' : ''}
                    </div>
                </div>

                <div class="detail-links">
                    ${links.map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 12px;">🔗 ${l.name}</a>`).join('')}
                    ${isAdmin ? `<button class="btn-primary" style="border-color: var(--neon-purple); color: var(--neon-purple);" onclick="window.editAnime('${item.id}')">📝 編輯作品</button>` : ''}
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
    return `<div class="pagination">${Array.from({length: pages}, (_, i) => i + 1).map(p => `<button class="${currentPage === p ? 'active' : ''}" onclick="window.changePage(${p})">${p}</button>`).join('')}</div>`;
};

window.toggleSystemMenu = (e) => { e.stopPropagation(); document.getElementById('systemMenu').classList.toggle('active'); };
window.refreshSystem = async () => { window.showToast('⏳ 正在同步資料...'); await window.loadData(); if (isAdmin) window.renderAdmin(); else window.renderApp(); window.showToast('✓ 資料已同步'); };
window.showToast = (msg, type = 'success') => {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast active ' + type;
    setTimeout(() => t.classList.remove('active'), 3000);
};

window.toggleAdminMode = (show) => {
    if (show && !isAdmin) { window.showLoginModal(); }
    else if (!show) { isAdmin = false; window.renderApp(); }
};

window.showLoginModal = () => { document.getElementById('loginModal').classList.add('active'); };
window.hideLoginModal = () => { document.getElementById('loginModal').classList.remove('active'); };
window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
    if (error) window.showToast('✗ 登入失敗', 'error'); else location.reload();
};

window.switchAdminTab = (tab) => { currentAdminTab = tab; window.renderAdmin(); };

// 管理介面渲染 (簡化版，僅供參考結構)
window.renderAdmin = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="admin-container">
            <header>
                <h1 style="color: var(--neon-purple);">⚙ 管理控制台</h1>
                <button class="btn-primary" onclick="window.switchCategory('anime')">返回前台</button>
            </header>
            <div style="display: grid; grid-template-columns: 200px 1fr; gap: 30px; margin-top: 30px;">
                <aside id="adminMenuOptions"></aside>
                <main id="adminMainContent">
                    <div style="background: var(--glass-bg); padding: 40px; border-radius: 12px; text-align: center; border: 1px dashed var(--neon-blue);">
                        <h3>請從左側選單選擇操作項目</h3>
                    </div>
                </main>
            </div>
        </div>
    `;
    window.updateAdminMenu();
};

document.addEventListener('click', () => { const m = document.getElementById('systemMenu'); if (m) m.classList.remove('active'); });
