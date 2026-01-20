// TECH v3.1.7-FIXED ULTRA - ACG Manager Logic
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
let importTarget = 'anime';

// --- Core Functions ---

window.initApp = async function() {
    try {
        console.log('🚀 系統初始化中...');
        
        // 監聽登入狀態變化
        supabaseClient.auth.onAuthStateChange((event, session) => {
            const newIsAdmin = !!session;
            if (newIsAdmin !== isAdmin) {
                isAdmin = newIsAdmin;
                window.updateAdminMenu();
                if (isAdmin) {
                    window.showToast('✓ 登入成功');
                    window.renderAdmin();
                } else {
                    window.renderApp();
                }
            }
        });

        // 偵測初始登入狀態
        const { data: { session } } = await supabaseClient.auth.getSession();
        isAdmin = !!session;
        
        // 讀取網站設定
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
                    } catch(e) { console.error('Options parse error:', e); } 
                }
            });
        }
        document.title = siteSettings.site_title;
        
        await window.loadData();
        
        // 確保 UI 正確渲染
        if (isAdmin) window.renderAdmin(); else window.renderApp();
        window.updateAdminMenu();
        
    } catch (err) { 
        console.error('Init error:', err);
        window.showToast('系統初始化失敗', 'error');
    }
};

window.loadData = async function() {
    try {
        console.log('⏳ 正在讀取資料...');
        const { data, error } = await supabaseClient.from('anime_list').select('*').order('created_at', { ascending: false });
        
        if (error) {
            console.error('Database error:', error);
            window.showToast('資料庫讀取失敗: ' + error.message, 'error');
            return;
        }

        const { data: extraData } = await supabaseClient.from('site_settings').select('value').eq('id', 'extra_assignments').single();
        
        let extraMap = {};
        if (extraData && extraData.value) {
            try { extraMap = JSON.parse(extraData.value); } catch(e) { console.error('Extra data parse error:', e); }
        }
        
        animeData = (data || []).map(item => {
            const extra = extraMap[item.id] || {};
            return {
                ...item,
                ...extra, // 合併 extra_data 以確保顏色與標籤顯示
                extra_data: extra
            };
        });
        console.log('✅ 資料讀取完成，共 ' + animeData.length + ' 筆');
    } catch (err) {
        console.error('Load data error:', err);
        window.showToast('載入資料時發生錯誤', 'error');
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
        <div class="site-version">v3.1.7-FIXED</div>
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
            <div class="anime-grid">
                ${paged.length > 0 ? paged.map(item => window.renderCard(item)).join('') : `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">[ 未找到相關資料 ]</div>`}
            </div>
            <div style="display: flex; justify-content: center; gap: 12px; margin-top: 35px;">${window.renderPagination(filtered.length)}</div>
        </div>
    `;
};

window.renderCard = (item) => {
    const starColor = item.star_color || '#ffcc00';
    const nameColor = item.name_color || '#ffffff';
    const episodesColor = optionsData.category_colors?.episodes || 'var(--neon-cyan)';
    const monthStr = item.month ? (item.month.includes('月') ? item.month : item.month + '月') : '';
    const timeInfo = [item.year, item.season, monthStr].filter(t => t).join(' ');
    
    return `
        <div class="anime-card" onclick="window.showAnimeDetail('${item.id}')">
            <div style="aspect-ratio: 2/3; overflow: hidden; position: relative;">
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; top: 8px; left: 8px; color: ${starColor}; background: rgba(0,0,0,0.8); padding: 2px 6px; border-radius: 4px; font-size: 11px; border: 1px solid ${starColor};">${item.recommendation || ''}</div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: ${episodesColor}; font-size: 11px; padding: 4px; text-align: center;">${item.episodes ? '全' + item.episodes + '集' : ''}</div>
            </div>
            <div style="padding: 12px; text-align: center;">
                <h3 style="color: ${nameColor}; font-size: 14px; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</h3>
                <div style="font-size: 11px; color: var(--neon-cyan);">[ ${timeInfo} ]</div>
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
    return Array.from({length: pages}, (_, i) => i + 1).map(p => `<button class="btn-primary ${currentPage === p ? 'active' : ''}" style="width: 35px; padding: 8px 0;" onclick="window.changePage(${p})">${p}</button>`).join('');
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
        
        window.showToast('驗證中...', 'info');
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        window.hideLoginModal();
    } catch (err) {
        window.showToast('✗ 登入失敗：' + err.message, 'error');
    }
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
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px;">
                    <h2 style="color: var(--neon-cyan);">⚙ 管理控制台</h2>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-primary" onclick="window.toggleAdminMode(false)">返回前台</button>
                        <button class="btn-primary" style="border-color: var(--neon-purple); color: var(--neon-purple);" onclick="window.switchAdminTab('add')">➕ 新增作品</button>
                    </div>
                </header>
                
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
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
};

window.switchAdminTab = (tab, id = null) => { 
    currentAdminTab = tab; 
    if (tab === 'edit' && id) window.editId = id;
    else if (tab === 'add') window.editId = null;
    window.renderAdmin(); 
};

window.renderAdminContent = (pagedData, total) => {
    if (currentAdminTab === 'manage') {
        return `
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 15px;">
                <button class="btn-primary" style="font-size: 11px;" onclick="window.exportCSV('${currentCategory}')">📥 匯出 CSV</button>
                <button class="btn-primary" style="font-size: 11px;" onclick="window.triggerImport('${currentCategory}')">📤 匯入 CSV</button>
            </div>
            <div class="admin-table-container" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--neon-blue); color: var(--neon-cyan); text-align: left;">
                            <th style="padding: 10px;">名稱</th>
                            <th style="padding: 10px;">年份</th>
                            <th style="padding: 10px;">評分</th>
                            <th style="padding: 10px;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagedData.map(item => `
                            <tr style="border-bottom: 1px solid rgba(0,212,255,0.1);">
                                <td style="padding: 10px;">${item.name}</td>
                                <td style="padding: 10px;">${item.year || ''}</td>
                                <td style="padding: 10px;">${item.rating || ''}</td>
                                <td style="padding: 10px;">
                                    <button class="btn-primary" style="padding: 4px 8px; font-size: 11px;" onclick="window.editAnime('${item.id}')">📝</button>
                                    <button class="btn-primary" style="padding: 4px 8px; font-size: 11px; border-color: #ff4444; color: #ff4444;" onclick="window.deleteAnime('${item.id}')">✕</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
                ${window.renderAdminPagination(total)}
            </div>
        `;
    } else if (currentAdminTab === 'add' || currentAdminTab === 'edit') {
        const item = currentAdminTab === 'edit' ? animeData.find(a => a.id === window.editId) : {};
        return window.renderAnimeForm(item);
    } else if (currentAdminTab === 'options') {
        return window.renderOptionsManager();
    } else if (currentAdminTab === 'settings') {
        return `
            <div style="display: flex; flex-direction: column; gap: 15px; max-width: 500px; margin: 0 auto;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--neon-cyan);">網站標題</label>
                    <input type="text" id="set-title" value="${siteSettings.site_title}" style="width: 100%;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--neon-cyan);">標題顏色</label>
                    <input type="color" id="set-title-color" value="${siteSettings.title_color || '#00ffff'}" style="width: 100%; height: 40px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--neon-cyan);">公告內容</label>
                    <textarea id="set-announcement" style="width: 100%; height: 80px;">${siteSettings.announcement}</textarea>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--neon-cyan);">公告顏色</label>
                    <input type="color" id="set-announcement-color" value="${siteSettings.announcement_color || '#a8b0c0'}" style="width: 100%; height: 40px;">
                </div>
                <button class="btn-primary" onclick="window.saveSettings()">💾 儲存設定</button>
            </div>
        `;
    }
    return '';
};

window.renderAnimeForm = (item) => {
    const genres = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
    const links = Array.isArray(item.links) ? item.links : [];
    
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <input type="text" id="form-name" placeholder="作品名稱" value="${item.name || ''}">
                <input type="text" id="form-poster" placeholder="海報 URL" value="${item.poster_url || ''}">
                <select id="form-category">
                    <option value="anime" ${item.category === 'anime' ? 'selected' : ''}>動畫</option>
                    <option value="manga" ${item.category === 'manga' ? 'selected' : ''}>漫畫</option>
                    <option value="movie" ${item.category === 'movie' ? 'selected' : ''}>電影</option>
                </select>
                <div style="border: 1px solid var(--neon-blue); padding: 10px; border-radius: 4px;">
                    <div style="color: var(--neon-cyan); margin-bottom: 8px; font-size: 12px;">類型選擇</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px;">
                        ${optionsData.genre.map(g => `<label style="font-size: 11px;"><input type="checkbox" name="form-genre" value="${g}" ${genres.includes(g) ? 'checked' : ''}> ${g}</label>`).join('')}
                    </div>
                </div>
                <div id="links-container" style="border: 1px solid var(--neon-blue); padding: 10px; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="color: var(--neon-cyan); font-size: 12px;">相關連結</span>
                        <button class="btn-primary" style="padding: 2px 8px; font-size: 10px;" onclick="window.addLinkRow()">+</button>
                    </div>
                    ${links.map(l => `<div style="display: flex; gap: 6px; margin-bottom: 8px;"><input type="text" placeholder="名" class="link-name" value="${l.name}" style="flex: 1; font-size: 11px;"><input type="text" placeholder="網" class="link-url" value="${l.url}" style="flex: 2; font-size: 11px;"><button class="btn-primary" style="padding: 4px 8px; border-color: #ff4444; color: #ff4444; font-size: 10px;" onclick="this.parentElement.remove()">✕</button></div>`).join('')}
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <select id="form-year"><option value="">年份</option>${optionsData.year.map(y => `<option value="${y}" ${item.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
                    <select id="form-season"><option value="">季度</option>${optionsData.season.map(s => `<option value="${s}" ${item.season === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
                    <select id="form-month"><option value="">月份</option>${optionsData.month.map(m => `<option value="${m}" ${item.month === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
                    <select id="form-rating"><option value="">評分</option>${optionsData.rating.map(r => `<option value="${r}" ${item.rating === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                    <select id="form-recommendation"><option value="">推薦</option>${optionsData.recommendation.map(r => `<option value="${r}" ${item.recommendation === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                    <input type="text" id="form-episodes" placeholder="集數" value="${item.episodes || ''}">
                </div>
                <textarea id="form-desc" placeholder="作品簡介" style="height: 100px;">${item.description || ''}</textarea>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                    <div><label style="font-size: 10px; color: var(--neon-cyan);">星標顏色</label><input type="color" id="form-star-color" value="${item.star_color || '#ffcc00'}" style="width: 100%;"></div>
                    <div><label style="font-size: 10px; color: var(--neon-cyan);">名稱顏色</label><input type="color" id="form-name-color" value="${item.name_color || '#ffffff'}" style="width: 100%;"></div>
                    <div><label style="font-size: 10px; color: var(--neon-cyan);">簡介顏色</label><input type="color" id="form-desc-color" value="${item.desc_color || '#00d4ff'}" style="width: 100%;"></div>
                </div>
                <button class="btn-primary" style="margin-top: 10px; border-color: var(--neon-purple); color: var(--neon-purple);" onclick="window.saveAnime()">💾 儲存作品</button>
            </div>
        </div>
    `;
};

window.renderOptionsManager = () => {
    const keys = ['genre', 'year', 'month', 'season', 'episodes', 'rating', 'recommendation'];
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            ${keys.map(key => `
                <div style="border: 1px solid var(--neon-blue); padding: 15px; border-radius: 8px;">
                    <h3 style="color: var(--neon-cyan); font-size: 14px; margin-bottom: 10px;">${window.getOptionLabel(key)}</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px;">
                        ${optionsData[key].map((opt, idx) => `<span class="tag-item" style="font-size: 11px;">${opt} <span style="cursor: pointer; color: #ff4444; margin-left: 5px;" onclick="window.deleteOptionItem('${key}', ${idx})">✕</span></span>`).join('')}
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <input type="text" id="add-opt-${key}" placeholder="新增選項" style="flex: 1; font-size: 11px; padding: 5px;">
                        <button class="btn-primary" style="padding: 5px 10px; font-size: 11px;" onclick="window.addOptionItem('${key}')">新增</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

window.saveAnime = async () => {
    try {
        const name = document.getElementById('form-name').value;
        if (!name) return window.showToast('✗ 請輸入名稱', 'error');
        
        const payload = {
            name,
            poster_url: document.getElementById('form-poster').value,
            category: document.getElementById('form-category').value,
            genre: Array.from(document.querySelectorAll('input[name="form-genre"]:checked')).map(cb => cb.value),
            links: Array.from(document.querySelectorAll('#links-container > div')).map(row => ({ 
                name: row.querySelector('.link-name').value, 
                url: row.querySelector('.link-url').value 
            })),
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
        
        const { data: savedData, error } = window.editId ? 
            await supabaseClient.from('anime_list').update(payload).eq('id', window.editId).select() : 
            await supabaseClient.from('anime_list').insert([payload]).select();
        
        if (error) throw error;
        window.showToast('✓ 儲存成功');
        await window.loadData();
        window.switchAdminTab('manage');
    } catch (err) { window.showToast('✗ 儲存失敗：' + err.message, 'error'); }
};

window.editAnime = (id) => { window.switchAdminTab('edit', id); };
window.addLinkRow = () => { const c = document.getElementById('links-container'); const d = document.createElement('div'); d.style.display = 'flex'; d.style.gap = '6px'; d.style.marginBottom = '8px'; d.innerHTML = `<input type="text" placeholder="名" class="link-name" style="flex: 1; font-size: 11px;"><input type="text" placeholder="網" class="link-url" style="flex: 2; font-size: 11px;"><button class="btn-primary" style="padding: 4px 8px; border-color: #ff4444; color: #ff4444; font-size: 10px;" onclick="this.parentElement.remove()">✕</button>`; c.appendChild(d); };
window.addOptionItem = async (key) => { const input = document.getElementById(`add-opt-${key}`); if (!input.value) return window.showToast('✗ 請輸入選項名稱', 'error'); optionsData[key].push(input.value); input.value = ''; await window.saveOptionsToDB(); window.renderAdmin(); };
window.deleteOptionItem = async (key, idx) => { optionsData[key].splice(idx, 1); await window.saveOptionsToDB(); window.renderAdmin(); };
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
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
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
    return Array.from({length: pages}, (_, i) => i + 1).map(p => `<button class="btn-primary ${adminPage === p ? 'active' : ''}" style="width: 30px; padding: 5px 0;" onclick="window.changeAdminPage(${p})">${p}</button>`).join('');
};

window.changeAdminPage = (p) => { adminPage = p; window.renderAdmin(); };

document.addEventListener('click', () => { const m = document.getElementById('systemMenu'); if (m) m.classList.remove('active'); });

// 啟動應用
window.initApp();
