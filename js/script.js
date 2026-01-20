// TECH v3.2.9 - ACG Manager Logic (System Admin AI Optimized)
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
let siteSettings = { site_title: 'ACG 收藏庫', announcement: '⚡ 系統連線中 // 歡迎光臨 ⚡', title_color: '#ffffff', announcement_color: '#ffffff', custom_labels: {} };
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
            
            if (isAdmin && !prevAdmin && !isFirstLoad) {
                window.showToast('✓ 登入成功');
            }
            
            if (isFirstLoad) {
                isFirstLoad = false;
                window.renderApp();
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
                if (s.id === 'custom_labels') { try { siteSettings.custom_labels = JSON.parse(s.value); } catch(e) {} }
                if (s.id === 'options_data') { 
                    try { 
                        const parsed = JSON.parse(s.value);
                        optionsData = { ...optionsData, ...parsed };
                        if (!optionsData.category_colors) optionsData.category_colors = {};
                        if (!optionsData.custom_lists) optionsData.custom_lists = [];
                        const defaultColors = { genre: '#00ffff', year: '#ffffff', month: '#ffffff', season: '#ffffff', episodes: '#00ffff', rating: '#b026ff', recommendation: '#ffcc00', btn_bg: '#00d4ff' };
                        optionsData.category_colors = { ...defaultColors, ...optionsData.category_colors };
                    } catch(e) {} 
                }
            });
        }
        document.title = siteSettings.site_title;
        
        try {
            await window.loadData();
        } catch (e) {
            console.error('Data load error:', e);
            window.showToast('資料讀取失敗', 'error');
        }
        window.renderApp();
        window.updateAdminMenu();
        window.initGlobalScroll();
        
    } catch (err) { 
        console.error('Init error:', err);
        window.showToast('系統初始化失敗', 'error');
        window.renderApp();
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

    // 僅在初次渲染或非搜尋輸入時更新整個 app
    if (!document.getElementById('search-input')) {
        app.innerHTML = `
            <div class="site-version">v3.7.1-ULTRA</div>
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
                    <input type="text" id="search-input" placeholder="搜尋作品名稱..." value="${filters.search}" oninput="window.handleSearch(this.value)" style="width: 100%; margin-bottom: 20px; font-size: 18px; padding: 15px 25px !important; border-radius: 50px !important;">
                    <div id="search-filters" class="horizontal-scroll-container force-scroll" style="padding: 10px 0; gap: 15px;">
                        ${window.renderSearchSelectsHTML()}
                    </div>
                </div>
                <div id="anime-grid-container" class="anime-grid">
                    ${paged.length > 0 ? paged.map(item => window.renderCard(item)).join('') : `<div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: var(--text-secondary); font-size: 18px;">[ 未找到相關資料 ]</div>`}
                </div>
                <div id="pagination-container" style="display: flex; justify-content: center; gap: 15px; margin-top: 40px;">${window.renderPagination(filtered.length)}</div>
            </div>
        `;
    } else {
        // 局部更新列表與分頁，避免搜尋框失去焦點
        const grid = document.getElementById('anime-grid-container');
        const pagination = document.getElementById('pagination-container');
        if (grid) grid.innerHTML = paged.length > 0 ? paged.map(item => window.renderCard(item)).join('') : `<div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: var(--text-secondary); font-size: 18px;">[ 未找到相關資料 ]</div>`;
        if (pagination) pagination.innerHTML = window.renderPagination(filtered.length);
    }
};

window.renderCard = (item) => {
    const starColor = item.star_color || '#ffcc00';
    const nameColor = item.name_color || '#ffffff';
    const episodesColor = optionsData.category_colors?.episodes || 'var(--neon-cyan)';
    
    return `
        <div class="anime-card" onclick="window.showAnimeDetail('${item.id}')">
            <div style="aspect-ratio: 2/3; overflow: hidden; position: relative;">
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="cyber-badge-v361" style="color: ${starColor};">
                    <span class="badge-star-icon">${item.recommendation || '★'}</span>
                    <span class="badge-rating-text">${item.rating || '0.0'}</span>
                </div>
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
    
    const genres = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
    const links = Array.isArray(item.links) ? item.links : [];
    const starColor = optionsData.category_colors?.recommendation || '#ffcc00';
    const ratingColor = optionsData.category_colors?.rating || 'var(--neon-purple)';
    const yearColor = optionsData.category_colors?.year || 'var(--neon-cyan)';

    // 核心數據行 (移除評級)
    const coreData = [
        item.year,
        item.season,
        item.month,
        item.episodes ? item.episodes + '集' : null
    ].filter(v => v);

    // 擴充標籤
    const extraTags = [];
    if (item.extra_data) {
        Object.entries(item.extra_data).forEach(([key, val]) => {
            if (val) extraTags.push({ val: val, key: key });
        });
    }

    content.innerHTML = `
        <div class="detail-container-v35">
            <!-- 左側滿版海報 -->
            <div class="detail-poster-aside">
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}">
                <div class="cyber-badge-v361" style="color: ${item.star_color || '#ffcc00'};">
                    <span class="badge-star-icon">${item.recommendation || '★'}</span>
                    <span class="badge-rating-text">${item.rating || '0.0'}</span>
                </div>
            </div>

            <!-- 右側資訊流 -->
            <div class="detail-content-main force-scroll">
                <div>
                    <h2 class="detail-title-v35 force-scroll" style="color: ${item.name_color || '#ffffff'};">${item.name}</h2>
                    <div class="core-data-row" style="color: ${yearColor}; margin-top: 20px;">
                        ${coreData.map(val => `<div class="core-data-item">${val}</div>`).join('')}
                    </div>
                </div>

                <div class="detail-section-v35" style="margin-top: 10px;">
                    <div class="scroll-row-v35 force-scroll">
                        ${genres.map(g => {
                            const cleanG = g.replace(/["'\[\]\(\),，。]/g, '').trim();
                            return `<span class="tag-pill-v35" style="color: ${optionsData.category_colors.genre};">${cleanG}</span>`;
                        }).join('')}
                    </div>
                </div>

                ${extraTags.length > 0 ? `
                    <div class="detail-section-v35">
                        <div class="scroll-row-v35 force-scroll">
                            ${extraTags.map(t => {
                                const color = optionsData.category_colors[t.key] || 'var(--neon-cyan)';
                                return `<span class="tag-pill-v35" style="color: ${color};">${t.val}</span>`;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="detail-section-v35" style="margin-top: 10px;">
                    <div style="padding: 20px 25px; border-radius: 4px; border-left: 4px solid var(--neon-blue); background: linear-gradient(90deg, rgba(0, 212, 255, 0.05), transparent);">
                        <p style="color: ${item.desc_color || 'var(--text-secondary)'}; line-height: 2; font-size: 16px; white-space: pre-wrap; margin: 0;">${item.description || '暫無簡介'}</p>
                    </div>
                </div>

                <div class="detail-section-v35">
                    <div class="scroll-row-v35 force-scroll">
                        ${links.length > 0 ? links.map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="padding: 12px 25px; font-size: 14px; white-space: nowrap;">${l.name}</a>`).join('') : '<span style="color: var(--text-secondary); font-style: italic;">暫無連結</span>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
    window.initGlobalScroll();
};

window.closeAnimeDetail = () => { document.getElementById('detailModal').classList.remove('active'); };

window.renderPagination = (total) => {
    const pages = Math.ceil(total / itemsPerPage);
    if (pages <= 1) return '';
    let btns = '';
    for (let i = 1; i <= pages; i++) {
        btns += `<button class="btn-primary ${currentPage === i ? 'active' : ''}" style="width: 45px; padding: 10px 0;" onclick="window.changePage(${i})">${i}</button>`;
    }
    return btns;
};

window.changePage = (p) => { currentPage = p; window.renderApp(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
window.handleSearch = (val) => { filters.search = val; currentPage = 1; window.renderApp(); };

window.renderSearchSelectsHTML = () => {
    let html = '';
    const defaultKeys = ['genre', 'year', 'season', 'month', 'episodes', 'rating', 'recommendation'];
    const customKeys = optionsData.custom_lists || [];
    const allKeys = [...defaultKeys, ...customKeys];

    allKeys.forEach(key => {
        const options = optionsData[key] || [];
        if (options.length === 0) return;
        
        const label = window.getOptionLabel(key);
        const activeVal = filters[key] || '';
        
        html += `
            <select class="auto-width-select" onchange="window.handleFilter('${key}', this.value)" style="border-color: rgba(0, 212, 255, 0.3);">
                <option value="">全部 ${label}</option>
                ${options.map(opt => `
                    <option value="${opt}" ${activeVal === opt ? 'selected' : ''}>${opt}</option>
                `).join('')}
            </select>
        `;
    });
    return html;
};

window.handleFilter = (key, val) => {
    filters[key] = val;
    currentPage = 1;
    window.renderApp();
};

window.getFilteredData = () => {
    return animeData.filter(item => {
        if (item.category !== currentCategory) return false;
        if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        
        // 遍歷所有過濾條件
        for (const key in filters) {
            if (key === 'search' || !filters[key]) continue;
            
            // 處理類型 (多選陣列)
            if (key === 'genre') {
                if (!item.genre || !item.genre.includes(filters.genre)) return false;
            } 
            // 處理自定義列表 (存放在 extra_data 中)
            else if (key.startsWith('custom_')) {
                if (!item.extra_data || item.extra_data[key] !== filters[key]) return false;
            }
            // 處理一般屬性
            else {
                if (item[key] !== filters[key]) return false;
            }
        }
        return true;
    });
};

window.switchCategory = (cat) => { currentCategory = cat; currentPage = 1; filters = { search: '' }; window.renderApp(); };

window.showLoginModal = () => { document.getElementById('loginModal').classList.add('active'); };
window.hideLoginModal = () => { document.getElementById('loginModal').classList.remove('active'); };

window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return window.showToast('登入失敗：' + error.message, 'error');
    window.hideLoginModal();
};

window.handleLogout = async () => {
    await supabaseClient.auth.signOut();
    isAdmin = false;
    window.toggleAdminMode(false);
    window.showToast('✓ 已登出');
};

window.toggleAdminMode = (show) => {
    if (show) {
        window.renderAdmin();
    } else {
        window.renderApp();
    }
};

window.renderAdmin = () => {
    const app = document.getElementById('app');
    const filtered = animeData.filter(item => item.category === currentCategory);
    const paged = filtered.slice((adminPage-1)*adminItemsPerPage, adminPage*adminItemsPerPage);
    
    // 記錄選項管理的滾動位置
    const optionsWrapper = document.getElementById('optionsWrapper');
    const scrollLeft = optionsWrapper ? optionsWrapper.scrollLeft : 0;

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
    
    // 恢復滾動位置
    if (currentAdminTab === 'options') {
        const newOptionsWrapper = document.getElementById('optionsWrapper');
        if (newOptionsWrapper) newOptionsWrapper.scrollLeft = scrollLeft;
    }

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
                <h3 style="color: var(--neon-cyan); border-bottom: 1px solid var(--neon-blue); padding-bottom: 10px;">基本設定</h3>
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
                <button class="btn-primary" style="margin-top: 20px;" onclick="window.saveSettings()">💾 儲存設定</button>
            </div>
        `;
    }
    return '';
};

window.renderAnimeForm = (item) => {
    const genres = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
    const links = Array.isArray(item.links) ? item.links : [];
    const extra_data = item.extra_data || {};
    
    return `
        <div style="display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px;" class="force-scroll">
            <!-- 第一列：基本資訊 -->
            <div style="display: flex; flex-direction: column; gap: 15px; min-width: 350px;">
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="form-name" placeholder="作品名稱" value="${item.name || ''}" style="flex: 2;">
                    <select id="form-category" style="flex: 1;">
                        <option value="anime" ${item.category === 'anime' ? 'selected' : ''}>動畫</option>
                        <option value="manga" ${item.category === 'manga' ? 'selected' : ''}>漫畫</option>
                        <option value="movie" ${item.category === 'movie' ? 'selected' : ''}>電影</option>
                    </select>
                </div>
                <input type="text" id="form-poster" placeholder="海報 URL" value="${item.poster_url || ''}">
                <textarea id="form-desc" placeholder="作品簡介" style="height: 120px; width: 100%;">${item.description || ''}</textarea>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="font-size: 12px; color: var(--neon-cyan); display: block; margin-bottom: 5px;">星標顏色</label>
                        <div class="color-input-wrapper" style="width: 100%;">
                            <div class="color-swatch" style="background: ${item.star_color || '#ffcc00'}; width: 100%; height: 35px;"></div>
                            <input type="color" id="form-star-color" value="${item.star_color || '#ffcc00'}" onchange="this.previousElementSibling.style.background = this.value">
                        </div>
                    </div>
                    <div>
                        <label style="font-size: 12px; color: var(--neon-cyan); display: block; margin-bottom: 5px;">名稱顏色</label>
                        <div class="color-input-wrapper" style="width: 100%;">
                            <div class="color-swatch" style="background: ${item.name_color || '#ffffff'}; width: 100%; height: 35px;"></div>
                            <input type="color" id="form-name-color" value="${item.name_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                        </div>
                    </div>
                </div>

                <div id="links-container" class="form-scroll-section" style="height: 180px; width: 100%;">
                    <div class="form-section-header">相關連結</div>
                    <div class="form-section-content">
                        <button class="btn-primary" style="padding: 4px 12px; font-size: 12px; margin-bottom: 10px; width: 100%;" onclick="window.addLinkRow()">+ 新增連結</button>
                        <div id="links-list">
                            ${links.map(l => `<div style="display: flex; gap: 8px; margin-bottom: 10px;"><input type="text" placeholder="名" class="link-name" value="${l.name}" style="flex: 1;"><input type="text" placeholder="網" class="link-url" value="${l.url}" style="flex: 2;"><button class="btn-primary" style="padding: 8px 12px; border-color: #ff4444; color: #ff4444;" onclick="this.parentElement.remove()">✕</button></div>`).join('')}
                        </div>
                    </div>
                </div>
                <button class="btn-primary" style="margin-top: 5px; border-color: var(--neon-purple); color: var(--neon-purple); font-size: 16px;" onclick="window.saveAnime()">💾 儲存作品資料</button>
            </div>

            <!-- 第二列：類型選擇 -->
            <div class="form-scroll-section" style="min-width: 180px;">
                <div class="form-section-header">類型選擇</div>
                <div class="form-section-content">
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${optionsData.genre.map(g => `
                            <label class="option-item-row" style="cursor: pointer;">
                                <div class="color-swatch" style="background: ${optionsData.category_colors.genre};"></div>
                                <span>${g}</span>
                                <input type="checkbox" name="form-genre" value="${g}" ${genres.includes(g) ? 'checked' : ''}>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 第三列：標籤與屬性 -->
            <div class="form-scroll-section" style="min-width: 220px;">
                <div class="form-section-header">標籤與屬性</div>
                <div class="form-section-content">
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <select id="form-year" style="width: 100%;"><option value="">年份</option>${optionsData.year.map(y => `<option value="${y}" ${item.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
                        <select id="form-season" style="width: 100%;"><option value="">季度</option>${optionsData.season.map(s => `<option value="${s}" ${item.season === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
                        <select id="form-month" style="width: 100%;"><option value="">月份</option>${optionsData.month.map(m => `<option value="${m}" ${item.month === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
                        <select id="form-rating" style="width: 100%;"><option value="">評分</option>${optionsData.rating.map(r => `<option value="${r}" ${item.rating === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                        <select id="form-recommendation" style="width: 100%;"><option value="">推薦</option>${optionsData.recommendation.map(r => `<option value="${r}" ${item.recommendation === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                        <input type="text" id="form-episodes" placeholder="集數" value="${item.episodes || ''}" style="width: 100%;">
                        
                        <!-- 動態自定義列表 -->
                        ${(optionsData.custom_lists || []).map(key => `
                            <select class="form-custom-list" data-key="${key}" style="width: 100%;">
                                <option value="">${window.getOptionLabel(key)}</option>
                                ${(optionsData[key] || []).map(opt => `<option value="${opt}" ${extra_data[key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                            </select>
                        `).join('')}

                        <div style="border-top: 1px solid rgba(0,212,255,0.2); padding-top: 10px; margin-top: 5px;">
                            <label style="font-size: 12px; color: var(--neon-cyan); display: block; margin-bottom: 5px;">簡介顏色</label>
                            <div class="color-input-wrapper" style="width: 100%;">
                                <div class="color-swatch" style="background: ${item.desc_color || '#ffffff'}; width: 100%; height: 35px;"></div>
                                <input type="color" id="form-desc-color" value="${item.desc_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.renderOptionsManager = () => {
    const defaultKeys = ['genre', 'year', 'month', 'season', 'episodes', 'rating', 'recommendation'];
    const customKeys = optionsData.custom_lists || [];
    const allKeys = [...defaultKeys, ...customKeys];

    return `
        <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
            <input type="text" id="new-list-name" placeholder="輸入新列表名稱 (如: 載體)" style="width: 250px;">
            <button class="btn-primary" onclick="window.addNewCustomList()">＋ 新增自定義列表</button>
        </div>
        <div class="options-scroll-wrapper force-scroll" id="optionsWrapper">
            ${allKeys.map(key => {
                const color = optionsData.category_colors[key] || '#ffffff';
                return `
                    <div class="options-column">
                        <div class="options-column-header">
                            ${key !== 'recommendation' ? `
                                <div class="color-input-wrapper">
                                    <div class="color-swatch" style="background: ${color};"></div>
                                    <input type="color" value="${color}" onchange="window.updateCategoryColor('${key}', this.value); this.previousElementSibling.style.background = this.value">
                                </div>
                            ` : ''}
                            <div style="display: flex; align-items: center; gap: 8px; flex: 1; justify-content: center;">
                                <span style="${key !== 'recommendation' ? 'margin-left: 8px;' : ''}">${window.getOptionLabel(key)}</span>
                                ${customKeys.includes(key) ? `<button style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:12px;" onclick="window.deleteCustomList('${key}')">🗑</button>` : ''}
                            </div>
                        </div>
                        <div class="options-list force-scroll">
                            ${(optionsData[key] || []).map((opt, idx) => `
                                <div class="option-item-row">
                                    <span style="flex: 1; color: ${color}; font-weight: bold;">${opt}</span>
                                    <span style="cursor: pointer; color: #ff4444; font-weight: bold;" onclick="window.deleteOptionItem('${key}', ${idx})">✕</span>
                                </div>
                            `).join('')}
                        </div>
                        <div style="padding: 15px; border-top: 1px solid rgba(0,212,255,0.1); display: flex; gap: 5px; align-items: center;">
                            <input type="text" id="add-opt-${key}" placeholder="新增..." style="width: 120px; font-size: 12px; padding: 6px !important; flex-shrink: 0;">
                            <button class="btn-primary" style="padding: 6px 10px; font-size: 12px; flex-shrink: 0; min-width: 40px;" onclick="window.addOptionItem('${key}')">＋</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
};

window.addNewCustomList = async () => {
    const input = document.getElementById('new-list-name');
    const name = input.value.trim();
    if (!name) return window.showToast('✗ 請輸入列表名稱', 'error');
    
    const key = 'custom_' + Date.now();
    if (!optionsData.custom_lists) optionsData.custom_lists = [];
    optionsData.custom_lists.push(key);
    optionsData[key] = [];
    
    if (!siteSettings.custom_labels) siteSettings.custom_labels = {};
    siteSettings.custom_labels[key] = name;
    
    input.value = '';
    await window.saveOptionsToDB();
    await supabaseClient.from('site_settings').upsert({ id: 'custom_labels', value: JSON.stringify(siteSettings.custom_labels) });
    
    window.renderAdmin();
};

window.deleteCustomList = async (key) => {
    if (!confirm('確定要刪除此列表嗎？相關設定將會消失。')) return;
    optionsData.custom_lists = optionsData.custom_lists.filter(k => k !== key);
    delete optionsData[key];
    await window.saveOptionsToDB();
    window.renderAdmin();
};

window.saveAnime = async () => {
    try {
        const nameEl = document.getElementById('form-name');
        if (!nameEl || !nameEl.value) return window.showToast('✗ 請輸入名稱', 'error');
        
        const extra_data = {};
        document.querySelectorAll('.form-custom-list').forEach(select => {
            const key = select.getAttribute('data-key');
            if (select.value) extra_data[key] = select.value;
        });

        const payload = {
            name: nameEl.value,
            poster_url: document.getElementById('form-poster').value,
            category: document.getElementById('form-category').value,
            genre: Array.from(document.querySelectorAll('input[name="form-genre"]:checked')).map(cb => cb.value),
            links: Array.from(document.querySelectorAll('#links-list > div')).map(row => {
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
            desc_color: document.getElementById('form-desc-color').value,
            extra_data: extra_data
        };
        
        let { error } = editId ? 
            await supabaseClient.from('anime_list').update(payload).eq('id', editId) : 
            await supabaseClient.from('anime_list').insert([payload]);
        
        if (error) {
            // 如果是欄位缺失錯誤，嘗試不帶 extra_data 再次儲存
            if (error.message.includes('extra_data')) {
                window.showToast('⚠️ 偵測到資料庫欄位缺失，正在嘗試相容模式儲存...', 'info');
                delete payload.extra_data;
                const retry = editId ? 
                    await supabaseClient.from('anime_list').update(payload).eq('id', editId) : 
                    await supabaseClient.from('anime_list').insert([payload]);
                if (!retry.error) {
                    window.showToast('✓ 已儲存 (自定義標籤需補齊資料庫欄位後生效)');
                    await window.loadData();
                    window.switchAdminTab('manage');
                    return;
                }
                error = retry.error;
            }
            throw error;
        }
        
        window.showToast('✓ 儲存成功');
        await window.loadData();
        window.switchAdminTab('manage');
    } catch (err) { window.showToast('✗ 儲存失敗：' + err.message, 'error'); }
};

window.editAnime = (id) => { window.switchAdminTab('edit', id); };
window.addLinkRow = () => { const c = document.getElementById('links-list'); const d = document.createElement('div'); d.style.display = 'flex'; d.style.gap = '8px'; d.style.marginBottom = '10px'; d.innerHTML = `<input type="text" placeholder="名" class="link-name" style="flex: 1;"><input type="text" placeholder="網" class="link-url" style="flex: 2;"><button class="btn-primary" style="padding: 8px 12px; border-color: #ff4444; color: #ff4444;" onclick="this.parentElement.remove()">✕</button>`; c.appendChild(d); };
window.addOptionItem = async (key) => { const input = document.getElementById(`add-opt-${key}`); if (!input.value) return window.showToast('✗ 請輸入選項名稱', 'error'); optionsData[key].push(input.value); input.value = ''; await window.saveOptionsToDB(); window.renderAdmin(); };
window.deleteOptionItem = async (key, idx) => { optionsData[key].splice(idx, 1); await window.saveOptionsToDB(); window.renderAdmin(); };

window.updateCategoryColor = async (key, color) => {
    if (!optionsData.category_colors) optionsData.category_colors = {};
    optionsData.category_colors[key] = color;
    await window.saveOptionsToDB();
    window.renderAdmin();
};

window.triggerColorPicker = (el) => {
    const input = el.nextElementSibling;
    if (input && input.type === 'color') input.click();
};

window.saveOptionsToDB = async () => { 
    await supabaseClient.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) }); 
    window.showToast('✓ 設定已同步'); 
    // 強制重新渲染應用以同步搜尋過濾器
    if (typeof window.renderApp === 'function') window.renderApp();
};
window.getOptionLabel = (key) => {
    const labels = { genre: '類型', year: '年份', month: '月份', season: '季度', episodes: '集數', rating: '評分', recommendation: '推薦' };
    if (labels[key]) return labels[key];
    if (siteSettings.custom_labels && siteSettings.custom_labels[key]) return siteSettings.custom_labels[key];
    return key;
};

window.exportCSV = (cat) => {
    const filtered = animeData.filter(item => item.category === cat);
    if (filtered.length === 0) return window.showToast('✗ 無資料可匯出', 'error');
    const headers = ['name', 'poster_url', 'year', 'month', 'season', 'genre', 'episodes', 'rating', 'recommendation', 'description', 'star_color', 'name_color', 'desc_color', 'links', 'extra_data'];
    const csvRows = [headers.join(',')];
    for (const item of filtered) {
        const row = headers.map(h => {
            let val = item[h] || '';
            if (h === 'genre') val = Array.isArray(val) ? val.join('|') : val;
            if (h === 'links' || h === 'extra_data') val = JSON.stringify(val).replace(/"/g, '""');
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
                    if (h === 'links' || h === 'extra_data') { try { val = JSON.parse(val); } catch(e) { val = (h === 'links' ? [] : {}); } }
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
    if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
        if (e.deltaY !== 0) {
            e.preventDefault();
            e.currentTarget.scrollLeft += e.deltaY;
        }
    }
};

// --- UI Helpers ---
window.toggleSystemMenu = (e) => {
    e.stopPropagation();
    const menu = document.getElementById('systemMenu');
    if (menu) menu.classList.toggle('active');
};

window.refreshSystem = async () => {
    window.showToast('⚡ 同步資料中...');
    await window.loadData();
    window.renderApp();
    window.showToast('✓ 資料已同步');
};

window.showToast = (msg, type = 'info') => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.borderColor = type === 'error' ? '#ff4444' : 'var(--neon-blue)';
    toast.style.color = type === 'error' ? '#ff4444' : 'var(--neon-cyan)';
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
};

document.addEventListener('click', () => { 
    const m = document.getElementById('systemMenu'); 
    if (m) m.classList.remove('active'); 
});

// 啟動應用
window.initApp();
