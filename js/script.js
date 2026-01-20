// TECH v3.2.3 - ACG Manager Logic (System Admin AI Optimized)
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
        rating: '#b026ff',
        episodes: '#00ffff',
        btn_bg: '#00d4ff'
    }
};
let siteSettings = { site_title: 'ACG 收藏庫', announcement: '⚡ 系統連線中 // 歡迎光臨 ⚡', title_color: '#ffffff', announcement_color: '#ffffff' };
let currentCategory = 'anime';
let currentAdminTab = 'manage';
let isAdmin = false;
let currentPage = 1;
const itemsPerPage = 20; 
const adminItemsPerPage = 10;
let adminPage = 1;
let filters = { search: '', genre: '', year: '', rating: '', season: '', month: '' };
let importTarget = 'anime';
let editId = null;
let isFirstLoad = true;

// --- Core Functions ---

window.initApp = async function() {
    try {
        console.log('🚀 系統初始化中...');
        
        supabaseClient.auth.onAuthStateChange((event, session) => {
            const prevAdmin = isAdmin;
            isAdmin = !!session;
            window.updateAdminMenu();
            
            // 只有在狀態真正改變且不是首次載入時才顯示 Toast
            if (isAdmin && !prevAdmin && !isFirstLoad) {
                window.showToast('✓ 登入成功');
            }
            
            // 首次載入後標記
            if (isFirstLoad) {
                isFirstLoad = false;
                if (isAdmin) {
                    // 如果已登入，預設顯示前台，不自動跳轉後台
                    window.renderApp();
                } else {
                    window.renderApp();
                }
            }
        });

        const { data: { session } } = await supabaseClient.auth.getSession();
        isAdmin = !!session;
        
        const { data: settings } = await supabaseClient.from('site_settings').select('*');
        if (settings) {
            settings.forEach(s => {
                if (s.id === 'site_title') siteSettings.site_title = s.value;
                if (s.id === 'announcement') siteSettings.announcement = s.value;
                if (s.id === 'title_color') siteSettings.title_color = s.value;
                if (s.id === 'announcement_color') siteSettings.announcement_color = s.value;
                if (s.id === 'options_data') { 
                    try { 
                        const parsed = JSON.parse(s.value);
                        optionsData = { ...optionsData, ...parsed };
                    } catch(e) {} 
                }
            });
        }
        document.title = siteSettings.site_title;
        
        await window.loadData();
        window.renderApp();
        window.updateAdminMenu();
        window.initGlobalScroll();
        
    } catch (err) { 
        console.error('Init error:', err);
        window.showToast('系統初始化失敗', 'error');
    }
};

window.loadData = async function() {
    try {
        const { data, error } = await supabaseClient.from('anime_list').select('*').order('created_at', { ascending: false });
        if (!error) {
            animeData = data || [];
        } else {
            throw error;
        }
    } catch (e) {
        window.showToast('資料讀取失敗', 'error');
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

    const filtered = window.getFilteredData();
    const paged = filtered.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

    app.innerHTML = `
        <div class="site-version">v3.2.3-ULTRA</div>
        <div class="app-container">
            <header>
                <h1 style="color: ${siteSettings.title_color || '#ffffff'}; text-shadow: 0 0 10px var(--neon-blue);">${siteSettings.site_title}</h1>
            </header>
            <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">
                <button class="btn-primary ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">◆ 動畫</button>
                <button class="btn-primary ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">◆ 漫畫</button>
                <button class="btn-primary ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">◆ 電影</button>
            </div>
            <div style="border: 2px solid ${siteSettings.announcement_color || 'var(--neon-blue)'}; padding: 18px; margin-bottom: 30px; font-size: 14px; color: ${siteSettings.announcement_color || '#ffffff'}; text-align: center; border-radius: 10px; background: rgba(0,212,255,0.05); font-weight: bold;">
                <span>📢 ${siteSettings.announcement}</span>
            </div>
            <div style="margin-bottom: 30px;">
                <input type="text" placeholder="🔍 搜尋作品..." value="${filters.search}" oninput="window.handleSearch(this.value)" style="width: 100%; margin-bottom: 20px; font-size: 16px;">
                <div class="horizontal-scroll-container force-scroll" style="padding: 10px 0;">
                    <select class="auto-width-select" onchange="window.handleFilter('genre', this.value)"><option value="">📂 類型</option>${optionsData.genre.map(g => `<option value="${g}" ${filters.genre === g ? 'selected' : ''}>${g}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('year', this.value)"><option value="">📅 年份</option>${optionsData.year.map(y => `<option value="${y}" ${filters.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('season', this.value)"><option value="">🌍 季度</option>${optionsData.season.map(s => `<option value="${s}" ${filters.season === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('month', this.value)"><option value="">📆 月份</option>${optionsData.month.map(m => `<option value="${m}" ${filters.month === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('rating', this.value)"><option value="">⭐ 評分</option>${optionsData.rating.map(r => `<option value="${r}" ${filters.rating === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                </div>
            </div>
            <div class="anime-grid">
                ${paged.length > 0 ? paged.map(item => window.renderCard(item)).join('') : `<div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: var(--text-secondary); font-size: 18px;">[ 未找到相關資料 ]</div>`}
            </div>
            <div style="display: flex; justify-content: center; gap: 15px; margin-top: 40px;">${window.renderPagination(filtered.length)}</div>
        </div>
    `;
};

window.renderCard = (item) => {
    const starColor = item.star_color || '#ffcc00';
    const nameColor = item.name_color || '#ffffff';
    const episodesColor = optionsData.category_colors?.episodes || 'var(--neon-cyan)';
    const ratingColor = optionsData.category_colors?.rating || 'var(--neon-purple)';
    
    return `
        <div class="anime-card" onclick="window.showAnimeDetail('${item.id}')">
            <div style="aspect-ratio: 2/3; overflow: hidden; position: relative;">
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; top: 10px; left: 10px; color: ${starColor}; background: rgba(0,0,0,0.85); padding: 4px 8px; border-radius: 4px; font-size: 12px; border: 1.5px solid ${starColor}; font-weight: bold; box-shadow: 0 0 10px ${starColor}44;">${item.recommendation || ''}</div>
                <div style="position: absolute; top: 10px; right: 10px; color: ${ratingColor}; background: rgba(0,0,0,0.85); padding: 4px 8px; border-radius: 4px; font-size: 12px; border: 1.5px solid ${ratingColor}; font-weight: bold; box-shadow: 0 0 10px ${ratingColor}44;">${item.rating || ''}</div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.9)); color: ${episodesColor}; font-size: 12px; padding: 10px; text-align: center; font-weight: bold;">${item.episodes ? '全 ' + item.episodes + ' 集' : ''}</div>
            </div>
            <div style="padding: 15px; text-align: center; background: rgba(0,0,0,0.4);">
                <h3 style="color: ${nameColor}; font-size: 16px; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold;">${item.name}</h3>
                <div style="font-size: 12px; color: var(--neon-cyan); opacity: 0.8;">[ ${item.year || ''} ${item.season || ''} ]</div>
            </div>
        </div>
    `;
};

window.showAnimeDetail = (id) => {
    const item = animeData.find(a => a.id === id);
    if (!item) return;
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    
    // 類型處理：移除標點符號，僅保留選項內容
    const genres = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
    
    const links = Array.isArray(item.links) ? item.links : [];
    const starColor = item.star_color || '#ffcc00';
    const ratingColor = optionsData.category_colors?.rating || 'var(--neon-purple)';

    // 獲取除了類型以外的其他標籤 (根據需求：第二列不要顯示 年 月 季度 集數 評級)
    // 這裡我們只顯示自定義標籤，如果有的話。目前先留空或顯示其他非排除項。
    const otherTags = []; 

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 320px 1fr; gap: 30px;">
            <div style="position: relative;">
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}" style="width: 100%; border: 2px solid var(--neon-blue); border-radius: 10px; box-shadow: 0 0 20px rgba(0,212,255,0.2);">
                <div style="position: absolute; top: 10px; left: 10px; color: ${starColor}; background: rgba(0,0,0,0.85); padding: 4px 8px; border-radius: 4px; font-size: 12px; border: 1.5px solid ${starColor}; font-weight: bold;">${item.recommendation || ''}</div>
                <div style="position: absolute; top: 10px; right: 10px; color: ${ratingColor}; background: rgba(0,0,0,0.85); padding: 4px 8px; border-radius: 4px; font-size: 12px; border: 1.5px solid ${ratingColor}; font-weight: bold;">${item.rating || ''}</div>
            </div>
            <div style="display: flex; flex-direction: column; max-height: 500px;">
                <h2 style="color: ${item.name_color || '#ffffff'}; margin-bottom: 15px; font-size: 28px; font-family: 'Orbitron', sans-serif;">${item.name}</h2>
                
                <!-- 類型區塊 (獨立滾動) -->
                <div class="horizontal-scroll-container force-scroll" style="margin-bottom: 10px; padding: 5px 0;">
                    ${genres.map(g => `<span style="border: 1.5px solid var(--neon-blue); color: var(--neon-cyan); padding: 3px 10px; border-radius: 4px; font-size: 13px; font-weight: bold; white-space: nowrap; margin-right: 8px;">${g}</span>`).join('')}
                </div>

                <!-- 第二列標籤區塊 (獨立滾動) - 根據需求目前不顯示年月等 -->
                <div class="horizontal-scroll-container force-scroll" style="margin-bottom: 20px; padding: 5px 0; display: ${otherTags.length > 0 ? 'flex' : 'none'};">
                    ${otherTags.map(t => `<span style="background: rgba(0,212,255,0.1); color: var(--neon-cyan); padding: 3px 10px; border-radius: 4px; font-size: 13px; white-space: nowrap; margin-right: 8px;">${t}</span>`).join('')}
                </div>

                <!-- 介紹欄 (帶顏色框) -->
                <div style="border: 2px solid ${item.desc_color || '#ffffff'}; padding: 20px; border-radius: 10px; background: rgba(0,0,0,0.2); margin-bottom: 25px; flex: 1; overflow-y: auto;">
                    <p style="color: ${item.desc_color || '#ffffff'}; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${item.description || '暫無簡介。'}</p>
                </div>

                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    ${links.map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 13px;">🔗 ${l.name}</a>`).join('')}
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
    window.initGlobalScroll();
};

window.getFilteredData = () => {
    const searchLower = filters.search.toLowerCase();
    return animeData.filter(item => {
        if (item.category !== currentCategory) return false;
        if (filters.search && !item.name.toLowerCase().includes(searchLower)) return false;
        if (filters.year && item.year !== filters.year) return false;
        if (filters.season && item.season !== filters.season) return false;
        if (filters.month && item.month !== filters.month) return false;
        if (filters.rating && item.rating !== filters.rating) return false;
        if (filters.genre) {
            const itemGenre = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
            if (!itemGenre.includes(filters.genre)) return false;
        }
        return true;
    });
};

window.renderPagination = (totalItems) => {
    const pages = Math.ceil(totalItems / itemsPerPage);
    if (pages <= 1) return '';
    return Array.from({length: pages}, (_, i) => i + 1).map(p => `<button class="btn-primary ${currentPage === p ? 'active' : ''}" style="width: 45px; padding: 10px 0;" onclick="window.changePage(${p})">${p}</button>`).join('');
};

window.changePage = (p) => { currentPage = p; window.renderApp(); window.scrollTo(0,0); };
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
    try {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        if (!email || !pass) return window.showToast('✗ 請輸入帳號密碼', 'error');
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        window.hideLoginModal();
    } catch (err) { window.showToast('✗ 登入失敗：' + err.message, 'error'); }
};
window.handleLogout = async () => { await supabaseClient.auth.signOut(); location.reload(); };
window.toggleAdminMode = (show) => { if (show) window.renderAdmin(); else window.renderApp(); };

window.renderAdmin = () => {
    const app = document.getElementById('app');
    const data = animeData.filter(item => item.category === currentCategory);
    const pagedData = data.slice((adminPage-1)*adminItemsPerPage, adminPage*adminItemsPerPage);

    app.innerHTML = `
        <div class="admin-container">
            <div class="admin-panel">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid var(--neon-blue); padding-bottom: 15px;">
                    <h2 style="color: var(--neon-cyan); font-family: 'Orbitron', sans-serif;">⚙ 管理控制台</h2>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn-primary" onclick="window.toggleAdminMode(false)">返回前台</button>
                        <button class="btn-primary" style="border-color: var(--neon-purple); color: var(--neon-purple);" onclick="window.switchAdminTab('add')">➕ 新增作品</button>
                    </div>
                </header>
                
                <div style="display: flex; gap: 12px; margin-bottom: 25px; flex-wrap: wrap;">
                    <button class="btn-primary ${currentAdminTab === 'manage' ? 'active' : ''}" onclick="window.switchAdminTab('manage')">📦 作品管理</button>
                    <button class="btn-primary ${currentAdminTab === 'options' ? 'active' : ''}" onclick="window.switchAdminTab('options')">🏷 選項管理</button>
                    <button class="btn-primary ${currentAdminTab === 'settings' ? 'active' : ''}" onclick="window.switchAdminTab('settings')">🔧 網站設定</button>
                </div>

                <div id="adminContent">
                    ${window.renderAdminContent(pagedData, data.length)}
                </div>
            </div>
        </div>
    `;
    window.initGlobalScroll();
};

window.switchAdminTab = (tab, id = null) => { 
    currentAdminTab = tab; 
    editId = id;
    window.renderAdmin(); 
};

window.renderAdminContent = (pagedData, total) => {
    if (currentAdminTab === 'manage') {
        return `
            <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                <button class="btn-primary ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime'); window.renderAdmin();">動畫板塊</button>
                <button class="btn-primary ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga'); window.renderAdmin();">漫畫板塊</button>
                <button class="btn-primary ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie'); window.renderAdmin();">電影板塊</button>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 20px;">
                <button class="btn-primary" style="font-size: 12px; padding: 8px 16px;" onclick="window.exportCSV('${currentCategory}')">📥 匯出 ${currentCategory} CSV</button>
                <button class="btn-primary" style="font-size: 12px; padding: 8px 16px;" onclick="window.triggerImport('${currentCategory}')">📤 匯入 ${currentCategory} CSV</button>
            </div>
            <div class="admin-table-container" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--neon-blue); color: var(--neon-cyan); text-align: left;">
                            <th style="padding: 15px;">名稱</th>
                            <th style="padding: 15px;">年份</th>
                            <th style="padding: 15px;">評分</th>
                            <th style="padding: 15px;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagedData.map(item => `
                            <tr style="border-bottom: 1px solid rgba(0,212,255,0.1);">
                                <td style="padding: 15px; font-weight: bold;">${item.name}</td>
                                <td style="padding: 15px;">${item.year || ''}</td>
                                <td style="padding: 15px;">${item.rating || ''}</td>
                                <td style="padding: 15px;">
                                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px;" onclick="window.editAnime('${item.id}')">📝 編輯</button>
                                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; border-color: #ff4444; color: #ff4444;" onclick="window.deleteAnime('${item.id}')">✕ 刪除</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="display: flex; justify-content: center; gap: 12px; margin-top: 25px;">
                ${window.renderAdminPagination(total)}
            </div>
        `;
    } else if (currentAdminTab === 'add' || currentAdminTab === 'edit') {
        const item = editId ? animeData.find(a => a.id === editId) : {};
        return window.renderAnimeForm(item);
    } else if (currentAdminTab === 'options') {
        return window.renderOptionsManager();
    } else if (currentAdminTab === 'settings') {
        return `
            <div style="display: flex; flex-direction: column; gap: 20px; max-width: 600px; margin: 0 auto;">
                <div><label style="display: block; margin-bottom: 8px; color: var(--neon-cyan);">網站標題</label><input type="text" id="set-title" value="${siteSettings.site_title}" style="width: 100%;"></div>
                <div>
                    <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan);">標題顏色</label>
                    <div class="color-input-wrapper">
                        <div class="color-swatch" style="background: ${siteSettings.title_color || '#ffffff'}; width: 40px; height: 40px;"></div>
                        <input type="color" id="set-title-color" value="${siteSettings.title_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                    </div>
                </div>
                <div><label style="display: block; margin-bottom: 8px; color: var(--neon-cyan);">公告內容</label><textarea id="set-announcement" style="width: 100%; height: 100px;">${siteSettings.announcement}</textarea></div>
                <div>
                    <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan);">公告顏色</label>
                    <div class="color-input-wrapper">
                        <div class="color-swatch" style="background: ${siteSettings.announcement_color || '#ffffff'}; width: 40px; height: 40px;"></div>
                        <input type="color" id="set-announcement-color" value="${siteSettings.announcement_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                    </div>
                </div>
                <button class="btn-primary" style="margin-top: 10px;" onclick="window.saveSettings()">💾 儲存設定</button>
            </div>
        `;
    }
    return '';
};

window.renderAnimeForm = (item) => {
    const genres = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
    const links = Array.isArray(item.links) ? item.links : [];
    
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <input type="text" id="form-name" placeholder="作品名稱" value="${item.name || ''}">
                <input type="text" id="form-poster" placeholder="海報 URL" value="${item.poster_url || ''}">
                <select id="form-category">
                    <option value="anime" ${item.category === 'anime' ? 'selected' : ''}>動畫</option>
                    <option value="manga" ${item.category === 'manga' ? 'selected' : ''}>漫畫</option>
                    <option value="movie" ${item.category === 'movie' ? 'selected' : ''}>電影</option>
                </select>
                <div class="form-scroll-section">
                    <div style="color: var(--neon-cyan); margin-bottom: 10px; font-weight: bold;">類型選擇 (獨立滾動)</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        ${optionsData.genre.map(g => `<label style="font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer;"><input type="checkbox" name="form-genre" value="${g}" ${genres.includes(g) ? 'checked' : ''}> ${g}</label>`).join('')}
                    </div>
                </div>
                <div id="links-container" class="form-scroll-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="color: var(--neon-cyan); font-weight: bold;">相關連結</span>
                        <button class="btn-primary" style="padding: 4px 12px; font-size: 12px;" onclick="window.addLinkRow()">+ 新增連結</button>
                    </div>
                    ${links.map(l => `<div style="display: flex; gap: 8px; margin-bottom: 10px;"><input type="text" placeholder="名" class="link-name" value="${l.name}" style="flex: 1;"><input type="text" placeholder="網" class="link-url" value="${l.url}" style="flex: 2;"><button class="btn-primary" style="padding: 8px 12px; border-color: #ff4444; color: #ff4444;" onclick="this.parentElement.remove()">✕</button></div>`).join('')}
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div class="form-scroll-section" style="max-height: 400px;">
                    <div style="color: var(--neon-cyan); margin-bottom: 10px; font-weight: bold;">標籤與屬性 (獨立滾動)</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <select id="form-year"><option value="">年份</option>${optionsData.year.map(y => `<option value="${y}" ${item.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
                        <select id="form-season"><option value="">季度</option>${optionsData.season.map(s => `<option value="${s}" ${item.season === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
                        <select id="form-month"><option value="">月份</option>${optionsData.month.map(m => `<option value="${m}" ${item.month === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
                        <select id="form-rating"><option value="">評分</option>${optionsData.rating.map(r => `<option value="${r}" ${item.rating === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                        <select id="form-recommendation"><option value="">推薦</option>${optionsData.recommendation.map(r => `<option value="${r}" ${item.recommendation === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                        <input type="text" id="form-episodes" placeholder="集數" value="${item.episodes || ''}">
                    </div>
                    <textarea id="form-desc" placeholder="作品簡介" style="height: 120px; margin-top: 15px; width: 100%;">${item.description || ''}</textarea>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 15px;">
                        <div>
                            <label style="font-size: 12px; color: var(--neon-cyan);">星標顏色</label>
                            <div class="color-input-wrapper" style="width: 100%;">
                                <div class="color-swatch" style="background: ${item.star_color || '#ffcc00'}; width: 100%; height: 35px;"></div>
                                <input type="color" id="form-star-color" value="${item.star_color || '#ffcc00'}" onchange="this.previousElementSibling.style.background = this.value">
                            </div>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: var(--neon-cyan);">名稱顏色</label>
                            <div class="color-input-wrapper" style="width: 100%;">
                                <div class="color-swatch" style="background: ${item.name_color || '#ffffff'}; width: 100%; height: 35px;"></div>
                                <input type="color" id="form-name-color" value="${item.name_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                            </div>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: var(--neon-cyan);">簡介顏色</label>
                            <div class="color-input-wrapper" style="width: 100%;">
                                <div class="color-swatch" style="background: ${item.desc_color || '#ffffff'}; width: 100%; height: 35px;"></div>
                                <input type="color" id="form-desc-color" value="${item.desc_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                            </div>
                        </div>
                    </div>
                </div>
                <button class="btn-primary" style="margin-top: 15px; border-color: var(--neon-purple); color: var(--neon-purple); font-size: 16px;" onclick="window.saveAnime()">💾 儲存作品資料</button>
            </div>
        </div>
    `;
};

window.renderOptionsManager = () => {
    const keys = ['genre', 'year', 'month', 'season', 'episodes', 'rating', 'recommendation'];
    return `
        <div class="options-scroll-wrapper force-scroll" id="optionsWrapper">
            ${keys.map(key => `
                <div class="options-column">
                    <div class="options-column-header">
                        <span>${window.getOptionLabel(key)}</span>
                    </div>
                    <div class="options-list force-scroll">
                        ${optionsData[key].map((opt, idx) => `
                            <div class="option-item-row">
                                <span>${opt}</span>
                                <span style="cursor: pointer; color: #ff4444; font-weight: bold;" onclick="window.deleteOptionItem('${key}', ${idx})">✕</span>
                            </div>
                        `).join('')}
                    </div>
                    <div style="padding: 15px; border-top: 1px solid rgba(0,212,255,0.1); display: flex; gap: 8px;">
                        <input type="text" id="add-opt-${key}" placeholder="新增..." style="flex: 1; font-size: 13px; padding: 8px !important;">
                        <button class="btn-primary" style="padding: 8px 12px; font-size: 12px;" onclick="window.addOptionItem('${key}')">＋</button>
                    </div>
                </div>
            `).join('')}
            <div class="options-column" style="border-color: var(--neon-purple);">
                <div class="options-column-header" style="color: var(--neon-purple); border-color: var(--neon-purple);">顏色設定</div>
                <div class="options-list force-scroll">
                    <div class="option-item-row" style="flex-direction: column; align-items: flex-start; gap: 10px; height: auto;">
                        <label style="font-size: 13px;">評級外框顏色</label>
                        <div class="color-input-wrapper" style="width: 100%;">
                            <div class="color-swatch" style="background: ${optionsData.category_colors.rating}; width: 100%; height: 35px;"></div>
                            <input type="color" value="${optionsData.category_colors.rating}" onchange="window.updateCategoryColor('rating', this.value); this.previousElementSibling.style.background = this.value">
                        </div>
                    </div>
                    <div class="option-item-row" style="flex-direction: column; align-items: flex-start; gap: 10px; height: auto;">
                        <label style="font-size: 13px;">集數文字顏色</label>
                        <div class="color-input-wrapper" style="width: 100%;">
                            <div class="color-swatch" style="background: ${optionsData.category_colors.episodes}; width: 100%; height: 35px;"></div>
                            <input type="color" value="${optionsData.category_colors.episodes}" onchange="window.updateCategoryColor('episodes', this.value); this.previousElementSibling.style.background = this.value">
                        </div>
                    </div>
                    <div class="option-item-row" style="flex-direction: column; align-items: flex-start; gap: 10px; height: auto;">
                        <label style="font-size: 13px;">網站按鈕顏色</label>
                        <div class="color-input-wrapper" style="width: 100%;">
                            <div class="color-swatch" style="background: ${optionsData.category_colors.btn_bg || '#00d4ff'}; width: 100%; height: 35px;"></div>
                            <input type="color" value="${optionsData.category_colors.btn_bg || '#00d4ff'}" onchange="window.updateCategoryColor('btn_bg', this.value); this.previousElementSibling.style.background = this.value">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.saveAnime = async () => {
    try {
        const nameEl = document.getElementById('form-name');
        if (!nameEl || !nameEl.value) return window.showToast('✗ 請輸入名稱', 'error');
        
        const payload = {
            name: nameEl.value,
            poster_url: document.getElementById('form-poster').value,
            category: document.getElementById('form-category').value,
            genre: Array.from(document.querySelectorAll('input[name="form-genre"]:checked')).map(cb => cb.value),
            links: Array.from(document.querySelectorAll('#links-container > div')).map(row => {
                const n = row.querySelector('.link-name');
                const u = row.querySelector('.link-url');
                return (n && u) ? { name: n.value, url: u.value } : null;
            }).filter(l => l),
            description: document.getElementById('form-desc').value,
            year: document.getElementById('form-year').value,
            month: document.getElementById('form-month').value,
            season: document.getElementById('form-season').value,
            rating: document.getElementById('form-rating').value,
            recommendation: document.getElementById('form-recommendation').value,
            episodes: document.getElementById('form-episodes').value,
            star_color: document.getElementById('form-star-color').value,
            name_color: document.getElementById('form-name-color').value,
            desc_color: document.getElementById('form-desc-color').value
        };
        
        const { error } = editId ? 
            await supabaseClient.from('anime_list').update(payload).eq('id', editId) : 
            await supabaseClient.from('anime_list').insert([payload]);
        
        if (error) throw error;
        window.showToast('✓ 儲存成功');
        await window.loadData();
        window.switchAdminTab('manage');
    } catch (err) { window.showToast('✗ 儲存失敗：' + err.message, 'error'); }
};

window.editAnime = (id) => { window.switchAdminTab('edit', id); };
window.addLinkRow = () => { const c = document.getElementById('links-container'); const d = document.createElement('div'); d.style.display = 'flex'; d.style.gap = '8px'; d.style.marginBottom = '10px'; d.innerHTML = `<input type="text" placeholder="名" class="link-name" style="flex: 1;"><input type="text" placeholder="網" class="link-url" style="flex: 2;"><button class="btn-primary" style="padding: 8px 12px; border-color: #ff4444; color: #ff4444;" onclick="this.parentElement.remove()">✕</button>`; c.appendChild(d); };
window.addOptionItem = async (key) => { const input = document.getElementById(`add-opt-${key}`); if (!input.value) return window.showToast('✗ 請輸入選項名稱', 'error'); optionsData[key].push(input.value); input.value = ''; await window.saveOptionsToDB(); window.renderAdmin(); };
window.deleteOptionItem = async (key, idx) => { optionsData[key].splice(idx, 1); await window.saveOptionsToDB(); window.renderAdmin(); };
window.updateCategoryColor = async (key, color) => { optionsData.category_colors[key] = color; await window.saveOptionsToDB(); window.renderAdmin(); };
window.saveOptionsToDB = async () => { await supabaseClient.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) }); window.showToast('✓ 設定已同步'); };
window.getOptionLabel = (key) => ({ genre: '類型', year: '年份', month: '月份', season: '季度', episodes: '集數', rating: '評分', recommendation: '推薦' }[key] || key);

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
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acg_${cat}_${new Date().getTime()}.csv`;
    a.click();
    window.showToast('✓ 匯出成功');
};

window.triggerImport = (cat) => { importTarget = cat; document.getElementById('importFile').click(); };
window.importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const items = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g).map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                const item = {};
                headers.forEach((h, idx) => {
                    let val = values[idx];
                    if (h === 'genre') val = val ? val.split('|') : [];
                    if (h === 'links') { try { val = JSON.parse(val); } catch(e) { val = []; } }
                    item[h] = val;
                });
                item.category = importTarget;
                items.push(item);
            }
            const { error } = await supabaseClient.from('anime_list').insert(items);
            if (error) throw error;
            window.showToast(`✓ 成功匯入 ${items.length} 筆資料`);
            await window.loadData();
            window.renderAdmin();
        } catch (err) { window.showToast('✗ 匯入失敗：' + err.message, 'error'); }
    };
    reader.readAsText(file);
};

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

window.deleteAnime = async (id) => {
    if (!confirm('確定要刪除此作品嗎？')) return;
    try {
        const { error } = await supabaseClient.from('anime_list').delete().eq('id', id);
        if (error) throw error;
        window.showToast('✓ 已刪除');
        await window.loadData();
        window.renderAdmin();
    } catch (err) { window.showToast('✗ 刪除失敗', 'error'); }
};

window.renderAdminPagination = (total) => {
    const pages = Math.ceil(total / adminItemsPerPage);
    if (pages <= 1) return '';
    return Array.from({length: pages}, (_, i) => i + 1).map(p => `<button class="btn-primary ${adminPage === p ? 'active' : ''}" style="width: 40px; padding: 8px 0;" onclick="window.changeAdminPage(${p})">${p}</button>`).join('');
};

window.changeAdminPage = (p) => { adminPage = p; window.renderAdmin(); };

// 全局滑鼠滾輪橫向捲動
window.initGlobalScroll = () => {
    const containers = document.querySelectorAll('.force-scroll, .options-scroll-wrapper');
    containers.forEach(container => {
        container.removeEventListener('wheel', window.handleWheelScroll);
        container.addEventListener('wheel', window.handleWheelScroll, { passive: false });
    });
};

window.handleWheelScroll = (e) => {
    // 只有當容器可以橫向捲動時才攔截滾輪
    if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
        if (e.deltaY !== 0) {
            e.preventDefault();
            e.currentTarget.scrollLeft += e.deltaY;
        }
    }
};

document.addEventListener('click', () => { const m = document.getElementById('systemMenu'); if (m) m.classList.remove('active'); });

// 啟動應用
window.initApp();
