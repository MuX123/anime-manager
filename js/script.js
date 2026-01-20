// TECH v3.1.7-RESTORED ULTRA - ACG Manager Logic
let animeData = [];
let optionsData = {
    genre: ['冒險', '奇幻', '熱血', '校園', '戀愛', '喜劇', '科幻', '懸疑', '日常', '異世界'],
    year: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    season: ['冬', '春', '夏', '秋'],
    episodes: ['12集', '24集', '劇場版', 'OVA'],
    rating: ['神', '迷', '優', '普', '劣'],
    recommendation: ['★★★★★', '★★★★', '★★★', '★★', '★'],
    category_colors: {}
};
let siteSettings = { site_title: 'ACG 收藏庫', announcement: '⚡ 系統連線中 // 歡迎光臨 ⚡', title_color: '#00ffff', announcement_color: '#a8b0c0' };
let currentCategory = 'anime';
let currentAdminTab = 'manage';
let isAdmin = false;
let currentPage = 1;
const itemsPerPage = 18;
const adminItemsPerPage = 8;
let adminPage = 1;
let filters = { search: '', genre: '', year: '', rating: '', season: '', month: '' };

// --- Core Functions ---

window.initApp = async function() {
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
    const { data, error } = await supabaseClient.from('anime_list').select('*').order('created_at', { ascending: false });
    const { data: extraData } = await supabaseClient.from('site_settings').select('value').eq('id', 'extra_assignments').single();
    const extraMap = extraData ? JSON.parse(extraData.value) : {};
    
    if (!error) {
        animeData = (data || []).map(item => ({
            ...item,
            ...extraMap[item.id], // 合併 extra_data 以確保顏色顯示
            extra_data: extraMap[item.id] || {}
        }));
    }
};

window.updateAdminMenu = function() {
    const container = document.getElementById('adminMenuOptions');
    if (!container) return;
    container.innerHTML = isAdmin ? 
        `<div class="menu-item-v2" onclick="window.toggleAdminMode(true)">⚙ 管理後台</div><div class="menu-item-v2" onclick="window.handleLogout()">⊗ 登出系統</div>` : 
        `<div class="menu-item-v2" onclick="window.showLoginModal()">🔐 管理員登入</div>`;
};

window.renderApp = function() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="site-version">v3.1.7-RESTORED</div>
        <div class="app-container">
            <header>
                <h1 style="color: ${siteSettings.title_color || 'var(--neon-cyan)'}; text-shadow: 0 0 10px ${siteSettings.title_color || 'var(--neon-blue)'};">${siteSettings.site_title}</h1>
            </header>
            <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 25px; flex-wrap: wrap;">
                <button class="btn-primary ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">◆ 動畫</button>
                <button class="btn-primary ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">◆ 漫畫</button>
                <button class="btn-primary ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">◆ 電影</button>
            </div>
            <div style="border: 1.5px solid ${siteSettings.announcement_color || 'var(--neon-blue)'}; padding: 15px; margin-bottom: 25px; font-size: 13px; color: ${siteSettings.announcement_color || 'var(--text-secondary)'}; text-align: center; border-radius: 8px; background: rgba(0,212,255,0.05);">
                <span>📢 ${siteSettings.announcement}</span>
            </div>
            <div style="margin-bottom: 25px;">
                <input type="text" placeholder="🔍 搜尋作品..." value="${filters.search}" oninput="window.handleSearch(this.value)" style="width: 100%; margin-bottom: 15px;">
                <div class="horizontal-scroll-container force-scroll" style="padding: 8px 0;">
                    <select class="auto-width-select" onchange="window.handleFilter('genre', this.value)"><option value="">📂 類型</option>${optionsData.genre.map(g => `<option value="${g}" ${filters.genre === g ? 'selected' : ''}>${g}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('year', this.value)"><option value="">📅 年份</option>${optionsData.year.map(y => `<option value="${y}" ${filters.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('season', this.value)"><option value="">🌍 季度</option>${optionsData.season.map(s => `<option value="${s}" ${filters.season === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('month', this.value)"><option value="">📆 月份</option>${optionsData.month.map(m => `<option value="${m}" ${filters.month === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('rating', this.value)"><option value="">⭐ 評分</option>${optionsData.rating.map(r => `<option value="${r}" ${filters.rating === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                </div>
            </div>
            <div class="anime-grid">${window.renderAnimeGrid()}</div>
            <div style="display: flex; justify-content: center; gap: 12px; margin-top: 35px;">${window.renderPagination()}</div>
        </div>
    `;
};

window.renderAnimeGrid = function() {
    const filtered = animeData.filter(item => {
        return item.category === currentCategory && 
               item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
               (!filters.genre || (item.genre && (Array.isArray(item.genre) ? item.genre.includes(filters.genre) : item.genre.includes(filters.genre)))) &&
               (!filters.year || item.year === filters.year) &&
               (!filters.season || item.season === filters.season) &&
               (!filters.month || item.month === filters.month) &&
               (!filters.rating || item.rating === filters.rating);
    });
    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filtered.slice(start, start + itemsPerPage);
    if (pageItems.length === 0) return `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">[ 未找到相關資料 ]</div>`;
    
    return pageItems.map(item => {
        const starColor = item.star_color || '#ffcc00';
        const nameColor = item.name_color || '#ffffff';
        const episodesColor = optionsData.category_colors?.episodes || 'var(--neon-cyan)';
        
        return `
            <div class="anime-card" onclick="window.showAnimeDetail('${item.id}')">
                <div style="aspect-ratio: 2/3; overflow: hidden; position: relative;">
                    <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; top: 8px; left: 8px; color: ${starColor}; background: rgba(0,0,0,0.8); padding: 2px 6px; border-radius: 4px; font-size: 11px; border: 1px solid ${starColor};">${item.recommendation || ''}</div>
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: ${episodesColor}; font-size: 11px; padding: 4px; text-align: center;">${item.episodes ? '全' + item.episodes + '集' : ''}</div>
                </div>
                <div style="padding: 12px; text-align: center;">
                    <h3 style="color: ${nameColor}; font-size: 14px; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</h3>
                    <div style="font-size: 11px; color: var(--neon-cyan);">[ ${item.year || ''} ${item.season || ''} ${item.month || ''} ]</div>
                </div>
            </div>
        `;
    }).join('');
};

window.showAnimeDetail = (id) => {
    const item = animeData.find(a => a.id === id);
    if (!item) return;
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    const genres = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
    const links = Array.isArray(item.links) ? item.links : [];

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 260px 1fr; gap: 25px;">
            <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}" style="width: 100%; border: 1.5px solid var(--neon-blue); border-radius: 8px;">
            <div>
                <h2 style="color: ${item.name_color || 'var(--neon-cyan)'}; margin-bottom: 15px;">${item.name}</h2>
                <div style="margin-bottom: 15px;">${genres.map(g => `<span class="tag-item" style="margin-right: 5px; padding: 2px 8px; font-size: 11px;">${g}</span>`).join('')}</div>
                <p style="color: ${item.desc_color || 'var(--text-main)'}; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">${item.description || '暫無簡介。'}</p>
                <div style="background: rgba(0,212,255,0.05); padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 12px;">
                    <span style="color: var(--neon-cyan);">年份:</span> ${item.year || ''} | <span style="color: var(--neon-cyan);">季度:</span> ${item.season || ''} | <span style="color: var(--neon-cyan);">評分:</span> ${item.rating || ''}
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${links.map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 11px; padding: 6px 12px;">🔗 ${l.name}</a>`).join('')}
                    ${isAdmin ? `<button class="btn-primary" style="border-color: var(--neon-purple); color: var(--neon-purple); font-size: 11px; padding: 6px 12px;" onclick="window.editAnime('${item.id}')">📝 編輯</button>` : ''}
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
};

window.renderPagination = () => {
    const filtered = animeData.filter(item => item.category === currentCategory && item.name.toLowerCase().includes(filters.search.toLowerCase()));
    const pages = Math.ceil(filtered.length / itemsPerPage);
    if (pages <= 1) return '';
    return Array.from({length: pages}, (_, i) => i + 1).map(p => `<button class="btn-primary ${currentPage === p ? 'active' : ''}" style="width: 35px; padding: 8px 0;" onclick="window.changePage(${p})">${p}</button>`).join('');
};

window.changePage = (p) => { currentPage = p; window.renderApp(); window.scrollTo({top: 0, behavior: 'smooth'}); };
window.switchCategory = (cat) => { currentCategory = cat; currentPage = 1; window.renderApp(); };
window.handleSearch = (val) => { filters.search = val; currentPage = 1; window.renderApp(); };
window.handleFilter = (key, val) => { filters[key] = val; currentPage = 1; window.renderApp(); };
window.closeAnimeDetail = () => { document.getElementById('detailModal').classList.remove('active'); };
window.showToast = (msg, type = 'success') => { const t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast active ' + type; setTimeout(() => t.classList.remove('active'), 3000); };
window.toggleSystemMenu = (e) => { e.stopPropagation(); document.getElementById('systemMenu').classList.toggle('active'); };
window.refreshSystem = async () => { window.showToast('⏳ 同步中...'); await window.loadData(); window.renderApp(); window.showToast('✓ 已同步'); };
window.showLoginModal = () => { document.getElementById('loginModal').classList.add('active'); };
window.hideLoginModal = () => { document.getElementById('loginModal').classList.remove('active'); };
window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
    if (error) window.showToast('✗ 失敗', 'error'); else location.reload();
};
window.handleLogout = async () => { await supabaseClient.auth.signOut(); location.reload(); };
window.toggleAdminMode = (show) => { if (show) window.renderAdmin(); else window.renderApp(); };

window.renderAdmin = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="admin-container">
            <div class="admin-panel">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px;">
                    <h2 style="color: var(--neon-cyan);">⚙ 管理控制台</h2>
                    <button class="btn-primary" onclick="window.toggleAdminMode(false)">返回前台</button>
                </header>
                <div style="text-align: center; padding: 50px; border: 1px dashed var(--neon-blue);">
                    <p>v3.1.7 原始管理功能已恢復</p>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">請點擊左側選單進行操作</p>
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('click', () => { const m = document.getElementById('systemMenu'); if (m) m.classList.remove('active'); });
