// Supabase Configuration
const SUPABASE_URL = 'https://twgydqknzdyahgfuamak.supabase.co';
const SUPABASE_KEY = 'sb_publishable_isVlJXwblwXk9rjL2Nu_cQ_9n5Lr-LW';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// App State
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
let siteSettings = { site_title: 'ACG 收藏庫', announcement: '系統連線中 // 歡迎光臨' };
let currentCategory = 'anime';
let currentAdminTab = 'manage';
let isAdmin = false;
let currentPage = 1;
const itemsPerPage = 18;
const adminItemsPerPage = 8;
let adminPage = 1;
let filters = { search: '', genre: '', year: '', rating: '', season: '', month: '' };

// --- Core Functions (Exposed to Global Window) ---

window.initApp = async function() {
    try {
        console.log('系統初始化中...');
        localStorage.clear();

        supabaseClient.auth.onAuthStateChange((event, session) => {
            isAdmin = !!session;
            window.updateAdminMenu();
            if (event === 'SIGNED_IN') {
                window.showToast('登入成功');
                if (currentAdminTab) window.renderAdmin();
            }
            if (event === 'SIGNED_OUT') {
                isAdmin = false;
                window.renderApp();
                window.updateAdminMenu();
            }
        });

        const { data: { session } } = await supabaseClient.auth.getSession();
        isAdmin = !!session;
        
        const { data: settings } = await supabaseClient.from('site_settings').select('*');
        if (settings) {
            settings.forEach(s => {
                if (s.id === 'site_title') siteSettings.site_title = s.value;
                if (s.id === 'announcement') siteSettings.announcement = s.value;
                if (s.id === 'options_data') { try { optionsData = JSON.parse(s.value); } catch(e) {} }
            });
        }
        document.title = siteSettings.site_title;
        
        await window.loadData();
        if (isAdmin) window.renderAdmin(); else window.renderApp();
        window.updateAdminMenu();
        
    } catch (err) { 
        console.error('Init error:', err);
    }
};

window.loadData = async function() {
    const { data, error } = await supabaseClient.from('anime_list').select('*').order('created_at', { ascending: false });
    if (!error) animeData = data || [];
};

window.updateAdminMenu = function() {
    const container = document.getElementById('adminMenuOptions');
    if (!container) return;
    container.innerHTML = isAdmin ? 
        `<div class="menu-item-v2" onclick="window.toggleAdminMode(true)">管理後台</div><div class="menu-item-v2" onclick="window.handleLogout()">登出系統</div>` : 
        `<div class="menu-item-v2" onclick="window.showLoginModal()">管理員登入</div>`;
};

window.renderApp = function() {
    const gear = document.getElementById('gearBtn');
    if (gear) gear.classList.remove('hidden');
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="app-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <header style="margin-bottom: 30px; text-align: center; border-bottom: 1px solid var(--neon-blue); padding-bottom: 10px;">
                <h1 style="font-size: 28px; color: var(--neon-blue); text-transform: uppercase; letter-spacing: 4px;">${siteSettings.site_title}</h1>
            </header>
            <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
                <button class="btn-primary ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">動畫</button>
                <button class="btn-primary ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">漫畫</button>
                <button class="btn-primary ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">電影</button>
            </div>
            <div style="border: 1px solid rgba(0, 212, 255, 0.2); padding: 10px; margin-bottom: 20px; font-size: 12px; color: #666; text-align: center;">
                ${siteSettings.announcement}
            </div>
            <div style="margin-bottom: 20px;">
                <input type="text" placeholder="搜尋作品..." value="${filters.search}" oninput="window.handleSearch(this.value)" style="width: 100%; margin-bottom: 10px;">
                <div class="horizontal-scroll-container force-scroll" style="padding: 5px 0;">
                    <select class="auto-width-select" onchange="window.handleFilter('genre', this.value)"><option value="">類型</option>${optionsData.genre.map(g => `<option value="${g}" ${filters.genre === g ? 'selected' : ''}>${g}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('year', this.value)"><option value="">年份</option>${optionsData.year.map(y => `<option value="${y}" ${filters.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('season', this.value)"><option value="">季度</option>${optionsData.season.map(s => `<option value="${s}" ${filters.season === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('month', this.value)"><option value="">月份</option>${optionsData.month.map(m => `<option value="${m}" ${filters.month === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
                    <select class="auto-width-select" onchange="window.handleFilter('rating', this.value)"><option value="">評分</option>${optionsData.rating.map(r => `<option value="${r}" ${filters.rating === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                </div>
            </div>
            <div class="anime-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px;">${window.renderAnimeGrid()}</div>
            <div style="display: flex; justify-content: center; gap: 10px; margin-top: 30px;">${window.renderPagination()}</div>
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
    if (pageItems.length === 0) return `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #444;">未找到相關資料</div>`;
    
    return pageItems.map(item => {
        const starColor = item.star_color || '#ffcc00';
        const nameColor = item.name_color || '#ffffff';
        const descColor = item.desc_color || '#00d4ff';
        
        return `
            <div class="anime-card" onclick="window.showAnimeDetail('${item.id}')">
                <!-- 小資料卡標籤優化：高度一致，間距縮減 -->
                <div style="position: absolute; top: 5px; right: 5px; display: flex; align-items: center; gap: 2px; z-index: 10;">
                    ${item.rating ? `<div class="rating-badge" style="position: static; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; padding: 0; border-color: var(--neon-purple); color: var(--neon-purple); background: rgba(0,0,0,0.8);">${item.rating.charAt(0)}</div>` : ''}
                    ${item.recommendation ? `<div class="recommendation-badge" style="position: static; height: 18px; display: flex; align-items: center; color: ${starColor}; border-color: ${starColor}; font-size: 10px; padding: 0 4px; background: rgba(0,0,0,0.8);">${item.recommendation}</div>` : ''}
                </div>
                
                <div style="aspect-ratio: 2/3; overflow: hidden; position: relative;">
                    <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}" style="width: 100%; height: 100%; object-fit: cover;">
                    ${item.episodes ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: ${descColor}; font-size: 10px; padding: 2px 5px; text-align: center; border-top: 1px solid ${descColor};">${item.episodes}</div>` : ''}
                </div>
                <div style="padding: 8px; border-top: 1px solid rgba(0, 212, 255, 0.1); background: rgba(0,0,0,0.8);">
                    <h3 style="font-size: 13px; margin: 0 0 5px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${nameColor}; text-align: center;">${item.name}</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
                        ${item.year ? `<span class="tag-item" style="font-size: 9px; padding: 0 4px;">${item.year}</span>` : ''}
                        ${item.season ? `<span class="tag-item" style="font-size: 9px; padding: 0 4px;">${item.season}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

window.renderPagination = function() {
    const filteredCount = animeData.filter(item => item.category === currentCategory && item.name.toLowerCase().includes(filters.search.toLowerCase())).length;
    const totalPages = Math.ceil(filteredCount / itemsPerPage);
    if (totalPages <= 1) return '';
    let html = `<button class="btn-primary" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changePage(${currentPage - 1})">上一頁</button>`;
    for (let i = 1; i <= totalPages; i++) { if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) html += `<button class="btn-primary ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`; }
    html += `<button class="btn-primary" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changePage(${currentPage + 1})">下一頁</button>`;
    return html;
};

window.renderAdmin = function() {
    const gear = document.getElementById('gearBtn');
    if (gear) gear.classList.add('hidden');
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = `
        <div class="app-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <div class="admin-panel">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--neon-blue); padding-bottom: 10px;">
                    <h2 style="color: var(--neon-blue); font-size: 18px; margin: 0;">管理控制台</h2>
                    <button class="btn-primary" onclick="window.toggleAdminMode(false)">退出</button>
                </header>
                <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                    <button class="btn-primary ${currentAdminTab === 'manage' ? 'active' : ''}" onclick="window.switchAdminTab('manage')">作品管理</button>
                    <button class="btn-primary ${currentAdminTab === 'add' ? 'active' : ''}" onclick="window.switchAdminTab('add')">新增作品</button>
                    <button class="btn-primary ${currentAdminTab === 'options' ? 'active' : ''}" onclick="window.switchAdminTab('options')">選項管理</button>
                    <button class="btn-primary ${currentAdminTab === 'data' ? 'active' : ''}" onclick="window.switchAdminTab('data')">資料備份</button>
                    <button class="btn-primary ${currentAdminTab === 'settings' ? 'active' : ''}" onclick="window.switchAdminTab('settings')">網站設定</button>
                </div>
                <main>
                    ${currentAdminTab === 'manage' ? window.renderAdminManage() : ''}
                    ${currentAdminTab === 'add' ? window.renderAdminForm() : ''}
                    ${currentAdminTab === 'options' ? window.renderAdminOptions() : ''}
                    ${currentAdminTab === 'data' ? window.renderAdminData() : ''}
                    ${currentAdminTab === 'settings' ? window.renderAdminSettings() : ''}
                </main>
            </div>
        </div>
    `;
};

window.renderAdminManage = function() {
    const filtered = animeData.filter(item => item.category === currentCategory);
    const totalPages = Math.ceil(filtered.length / adminItemsPerPage);
    const start = (adminPage - 1) * adminItemsPerPage;
    const pageItems = filtered.slice(start, start + adminItemsPerPage);

    return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="font-size: 14px; color: var(--neon-blue); margin: 0;">${window.getCategoryName(currentCategory)}列表 (${filtered.length})</h3>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">動畫</button>
                <button class="btn-primary ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">漫畫</button>
                <button class="btn-primary ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">電影</button>
            </div>
        </div>
        <div style="min-height: 400px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead><tr style="text-align: left; border-bottom: 1px solid #2d3b5a; color: #666;"><th>海報</th><th>名稱</th><th>年份</th><th>評分</th><th>操作</th></tr></thead>
                <tbody>${pageItems.map(item => `<tr style="border-bottom: 1px solid rgba(0, 212, 255, 0.05);"><td><img src="${item.poster_url}" style="width: 25px; height: 38px; object-fit: cover; margin: 5px 0;"></td><td>${item.name}</td><td>${item.year}</td><td>${item.rating}</td><td><button class="btn-primary" style="padding: 2px 6px; font-size: 10px;" onclick="window.editAnime('${item.id}')">編輯</button> <button class="btn-primary" style="padding: 2px 6px; font-size: 10px; border-color: #f00; color: #f00;" onclick="window.deleteAnime('${item.id}')">刪除</button></td></tr>`).join('')}</tbody>
            </table>
        </div>
        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
            <button class="btn-primary" ${adminPage === 1 ? 'disabled' : ''} onclick="window.changeAdminPage(${adminPage - 1})">上一頁</button>
            <span style="align-self: center; font-size: 12px;">${adminPage} / ${totalPages || 1}</span>
            <button class="btn-primary" ${adminPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="window.changeAdminPage(${adminPage + 1})">下一頁</button>
        </div>
    `;
};

window.renderAdminForm = function(editId = null) {
    let item = editId ? animeData.find(a => a.id === editId) : { name: '', poster_url: '', year: '', month: '', season: '', genre: [], episodes: '', rating: '', recommendation: '', description: '', links: [], category: currentCategory, star_color: '#ffcc00', name_color: '#ffffff', desc_color: '#00d4ff' };
    const colors = optionsData.category_colors || {};
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group"><input type="text" id="form-name" value="${item.name}" placeholder="作品名稱" style="width: 100%; font-size: 18px; color: ${item.name_color || '#ffffff'}; border-color: ${item.name_color || '#2d3b5a'};" oninput="window.updateFormPreview('name-text', this.value)"></div>
            <div class="form-group"><input type="text" id="form-poster" value="${item.poster_url}" placeholder="海報網址" style="width: 100%;"></div>
            <div style="grid-column: 1/-1;">
                <div class="horizontal-scroll-container force-scroll">
                    <div class="vertical-scroll-card" style="border-color: ${colors.genre || 'var(--neon-blue)'};">
                        <h4 style="font-size: 12px; color: ${colors.genre || 'var(--neon-blue)'}; margin: 0 0 10px 0;">作品類型</h4>
                        <div class="scroll-list force-scroll">${optionsData.genre.map(g => `<label style="display: flex; align-items: center; gap: 5px; padding: 4px; font-size: 11px; cursor: pointer; color: ${colors.genre || 'var(--neon-blue)'};"><input type="checkbox" name="form-genre" value="${g}" ${item.genre && (Array.isArray(item.genre) ? item.genre.includes(g) : item.genre.includes(g)) ? 'checked' : ''}> ${g}</label>`).join('')}</div>
                    </div>
                    <div class="vertical-scroll-card">
                        <h4 style="font-size: 12px; color: var(--neon-blue); margin: 0 0 10px 0;">基本選項</h4>
                        <div class="scroll-list force-scroll">
                            <div style="margin-bottom: 8px;"><select id="form-category" class="auto-width-select"><option value="anime" ${item.category === 'anime' ? 'selected' : ''}>動畫</option><option value="manga" ${item.category === 'manga' ? 'selected' : ''}>漫畫</option><option value="movie" ${item.category === 'movie' ? 'selected' : ''}>電影</option></select></div>
                            ${Object.keys(optionsData).filter(k => !['genre', 'category_colors'].includes(k)).map(key => `<div style="margin-bottom: 8px;"><select id="form-${key}" class="auto-width-select" style="color: ${colors[key] || 'var(--neon-blue)'}; border-color: ${colors[key] || 'var(--neon-blue)'};"><option value="">${window.getOptionLabel(key)}...</option>${optionsData[key].map(opt => `<option value="${opt}" ${item[key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select></div>`).join('')}
                        </div>
                    </div>
                    <div class="vertical-scroll-card">
                        <h4 style="font-size: 12px; color: var(--neon-blue); margin: 0 0 10px 0;">顏色設定</h4>
                        <div class="scroll-list force-scroll">
                            <div style="margin-bottom: 12px;"><span id="preview-star-label" style="font-size: 10px; color: ${item.star_color || '#ffcc00'};">星星顏色</span><input type="color" id="form-star-color" value="${item.star_color || '#ffcc00'}" style="width: 100%; height: 25px;" oninput="window.updateFormPreview('star', this.value)"></div>
                            <div style="margin-bottom: 12px;"><span id="preview-name-label" style="font-size: 10px; color: ${item.name_color || '#ffffff'};">名稱顏色</span><input type="color" id="form-name-color" value="${item.name_color || '#ffffff'}" style="width: 100%; height: 25px;" oninput="window.updateFormPreview('name-color', this.value)"></div>
                            <div style="margin-bottom: 12px;"><span id="preview-desc-label" style="font-size: 10px; color: ${item.desc_color || '#00d4ff'};">劇情顏色</span><input type="color" id="form-desc-color" value="${item.desc_color || '#00d4ff'}" style="width: 100%; height: 25px;" oninput="window.updateFormPreview('desc-color', this.value)"></div>
                        </div>
                    </div>
                    <div class="vertical-scroll-card" style="flex: 0 0 300px;">
                        <h4 style="font-size: 12px; color: var(--neon-blue); margin: 0 0 10px 0;">觀看連結</h4>
                        <div class="scroll-list force-scroll" id="links-container">${(item.links || [{name: '', url: ''}]).map(link => `<div style="display: flex; gap: 5px; margin-bottom: 5px;"><input type="text" placeholder="名" class="link-name" value="${link.name}" style="flex: 1; font-size: 10px;"><input type="text" placeholder="網" class="link-url" value="${link.url}" style="flex: 2; font-size: 10px;"><button class="btn-primary" style="padding: 2px 5px; border-color: #f00; color: #f00;" onclick="this.parentElement.remove()">X</button></div>`).join('')}</div>
                        <button class="btn-primary" style="width: 100%; font-size: 10px; padding: 4px; margin-top: 5px;" onclick="window.addLinkRow()">新增連結</button>
                    </div>
                </div>
            </div>
            <div style="grid-column: 1/-1;"><textarea id="form-desc" rows="4" placeholder="劇情介紹" style="width: 100%; color: ${item.desc_color || '#00d4ff'}; border-color: ${item.desc_color || '#2d3b5a'};" oninput="window.updateFormPreview('desc-text', this.value)">${item.description || ''}</textarea></div>
            <div style="grid-column: 1/-1; display: flex; gap: 10px; justify-content: flex-end;"><button class="btn-primary" onclick="window.saveAnime('${editId}')">儲存資料</button><button class="btn-primary" onclick="window.switchAdminTab('manage')">取消</button></div>
        </div>
    `;
};

window.updateFormPreview = function(type, val) {
    if (type === 'name-color') { document.getElementById('preview-name-label').style.color = val; document.getElementById('form-name').style.color = val; document.getElementById('form-name').style.borderColor = val; }
    if (type === 'desc-color') { document.getElementById('preview-desc-label').style.color = val; document.getElementById('form-desc').style.color = val; document.getElementById('form-desc').style.borderColor = val; }
    if (type === 'star') { document.getElementById('preview-star-label').style.color = val; }
};

window.renderAdminOptions = function() {
    return `
        <div style="margin-bottom: 15px; display: flex; gap: 10px;"><input type="text" id="new-category-name" placeholder="新類別名稱..." style="flex: 1;"><button class="btn-primary" onclick="window.addNewCategory()">新增類別</button></div>
        <div class="horizontal-scroll-container force-scroll" style="padding-bottom: 15px;">
            ${Object.keys(optionsData).filter(k => k !== 'category_colors').map(key => {
                const catColor = optionsData.category_colors?.[key] || 'var(--neon-blue)';
                return `
                    <div class="vertical-scroll-card" style="border-color: ${catColor};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"><h4 style="font-size: 12px; color: ${catColor}; margin: 0;">${window.getOptionLabel(key)}</h4><input type="color" value="${catColor}" style="width: 20px; height: 20px;" onchange="window.updateCategoryColor('${key}', this.value)"></div>
                        <div class="scroll-list force-scroll" style="height: 250px;">
                            ${optionsData[key].map((opt, idx) => `<div style="display: flex; justify-content: space-between; align-items: center; padding: 4px; border-bottom: 1px solid rgba(0, 212, 255, 0.05);"><span style="font-size: 11px; color: ${catColor};">${opt}</span><button style="background: none; border: none; color: #f00; cursor: pointer; font-size: 10px;" onclick="window.deleteOptionItem('${key}', ${idx})">X</button></div>`).join('')}
                            <div style="display: flex; gap: 5px; margin-top: 10px;"><input type="text" id="add-opt-${key}" placeholder="新增..." style="flex: 1; font-size: 10px;"><button class="btn-primary" style="padding: 2px 5px;" onclick="window.addOptionItem('${key}')">+</button></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
};

window.renderAdminData = function() {
    return `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><div class="vertical-scroll-card"><h4>匯出 CSV</h4><div style="display: flex; flex-direction: column; gap: 8px;"><button class="btn-primary" onclick="window.exportCSV('anime')">匯出動畫</button><button class="btn-primary" onclick="window.exportCSV('manga')">匯出漫畫</button><button class="btn-primary" onclick="window.exportCSV('movie')">匯出電影</button></div></div><div class="vertical-scroll-card"><h4>匯入 CSV</h4><div style="display: flex; flex-direction: column; gap: 8px;"><button class="btn-primary" onclick="window.triggerImport('anime')">匯入動畫</button><button class="btn-primary" onclick="window.triggerImport('manga')">匯入漫畫</button><button class="btn-primary" onclick="window.triggerImport('movie')">匯入電影</button></div></div></div>`;
};

window.renderAdminSettings = function() {
    return `<div style="max-width: 500px;"><h3 style="font-size: 14px; color: var(--neon-blue);">網站設定</h3><div class="form-group"><label>網站標題</label><input type="text" id="set-title" value="${siteSettings.site_title}" style="width: 100%;"></div><div class="form-group" style="margin-top: 10px;"><label>公告內容</label><textarea id="set-announcement" rows="4" style="width: 100%;">${siteSettings.announcement}</textarea></div><button class="btn-primary" style="margin-top: 15px; width: 100%;" onclick="window.saveSettings()">更新設定</button></div>`;
};

// --- Logic Functions ---
window.switchCategory = (cat) => { currentCategory = cat; currentPage = 1; if (isAdmin) window.renderAdmin(); else window.renderApp(); };
window.switchAdminTab = (tab) => { currentAdminTab = tab; window.renderAdmin(); };
window.toggleAdminMode = (show) => { if (show && !isAdmin) { window.showLoginModal(); return; } if (show) window.renderAdmin(); else window.renderApp(); };
window.changePage = (p) => { currentPage = p; window.renderApp(); window.scrollTo(0, 0); };
window.changeAdminPage = (p) => { adminPage = p; window.renderAdmin(); };
window.handleSearch = (val) => { filters.search = val; currentPage = 1; window.renderApp(); };
window.handleFilter = (key, val) => { filters[key] = val; currentPage = 1; window.renderApp(); };

window.showAnimeDetail = (id) => {
    const item = animeData.find(a => a.id === id);
    if (!item) return;
    
    const starColor = item.star_color || '#ffcc00';
    const nameColor = item.name_color || '#ffffff';
    const descColor = item.desc_color || '#00d4ff';
    const genreColor = optionsData.category_colors?.genre || 'var(--neon-blue)';
    
    // 格式化時間資訊 (年 季度 月份)
    let monthStr = item.month || '';
    if (monthStr && !monthStr.includes('月')) monthStr += '月';
    const timeInfo = [item.year, item.season, monthStr].filter(t => t).join(' ');
    const yearColor = item.year ? `hsl(${(parseInt(item.year) % 10) * 36}, 70%, 60%)` : 'var(--neon-blue)';

    // 處理類型
    const genres = Array.isArray(item.genre) ? item.genre : (item.genre ? item.genre.split('|') : []);

    const modal = document.getElementById('detailModal');
    document.getElementById('detailContent').innerHTML = `
        <div style="display: flex; gap: 30px; flex-wrap: wrap; align-items: flex-start; justify-content: center;">
            <!-- 左側海報區 -->
            <div style="width: 280px; border: 1px solid var(--neon-blue); position: relative; aspect-ratio: 2/3; box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);">
                <!-- 大資料卡標籤優化：放大比例，位置統一 -->
                <div style="position: absolute; top: 10px; right: 10px; display: flex; align-items: center; gap: 4px; z-index: 10;">
                    ${item.rating ? `<div class="rating-badge" style="position: static; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; padding: 0; border: 1px solid var(--neon-purple); color: var(--neon-purple); background: rgba(0,0,0,0.8);">${item.rating.charAt(0)}</div>` : ''}
                    ${item.recommendation ? `<div class="recommendation-badge" style="position: static; height: 24px; display: flex; align-items: center; color: ${starColor}; border: 1px solid ${starColor}; font-size: 14px; padding: 0 8px; background: rgba(0,0,0,0.8);">${item.recommendation}</div>` : ''}
                </div>
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=NO+IMAGE'}" style="width: 100%; height: 100%; object-fit: cover;">
                ${item.episodes ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); color: ${descColor}; font-size: 14px; padding: 8px; text-align: center; border-top: 1px solid ${descColor};">${item.episodes}</div>` : ''}
            </div>
            
            <!-- 右側資訊區 (區塊化設計) -->
            <div style="flex: 1; min-width: 320px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 15px;">
                
                <!-- 1. 作品名稱 -->
                <div style="width: 100%; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                    <h2 style="color: ${nameColor}; margin: 0; font-size: 22px; text-shadow: 0 0 8px ${nameColor}44;">${item.name}</h2>
                </div>

                <!-- 2. 年 季度 月份 (區塊化) -->
                ${timeInfo ? `
                <div style="width: 100%; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 4px;">
                    <div style="display: inline-block; border: 1px solid ${yearColor}; color: ${yearColor}; font-size: 14px; padding: 4px 20px; border-radius: 4px; box-shadow: 0 0 10px ${yearColor}33;">${timeInfo}</div>
                </div>` : ''}

                <!-- 3. 類別 (獨立區塊，橫向滾動，同步後台顏色) -->
                <div style="width: 100%; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 4px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <div class="horizontal-scroll-container force-scroll" style="width: 100%; max-width: 450px; gap: 8px; padding: 5px 0; justify-content: center;">
                        ${genres.map(g => `<span class="tag-item" style="font-size: 12px; padding: 2px 12px; border-color: ${genreColor}; color: ${genreColor}; white-space: nowrap; background: rgba(0,0,0,0.4);">${g}</span>`).join('')}
                    </div>
                </div>

                <!-- 4. 作品介紹 (核心區塊，直向滾動) -->
                <div style="width: 100%; padding: 15px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-left: 3px solid ${descColor}; border-radius: 4px; text-align: left;">
                    <div class="scroll-list force-scroll" style="height: 160px; overflow-y: auto;">
                        <div style="font-size: 14px; color: ${descColor}; line-height: 1.8; padding-right: 10px;">
                            ${item.description || '系統資料庫中暫無此作品之詳細介紹 // 待補充'}
                        </div>
                    </div>
                </div>

                <!-- 5. 網站按鈕 (獨立區塊，橫向滾動，修復切除) -->
                <div style="width: 100%; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 4px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div class="horizontal-scroll-container force-scroll" style="width: 100%; max-width: 450px; gap: 12px; padding: 5px 0; justify-content: center; min-height: 45px;">
                        ${(item.links || []).map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="font-size: 12px; padding: 6px 20px; white-space: nowrap; display: inline-flex; align-items: center;">${l.name}</a>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
};

window.closeAnimeDetail = () => document.getElementById('detailModal').classList.remove('active');
window.editAnime = (id) => { currentAdminTab = 'add'; window.renderAdmin(); document.querySelector('.admin-panel main').innerHTML = window.renderAdminForm(id); };
window.deleteAnime = async (id) => { if (confirm('確定刪除？')) { await supabaseClient.from('anime_list').delete().eq('id', id); await window.loadData(); window.renderAdmin(); } };
window.saveAnime = async (editId) => {
    try {
        const name = document.getElementById('form-name').value;
        if (!name) return window.showToast('請輸入名稱', 'error');
        const payload = {
            name,
            poster_url: document.getElementById('form-poster').value,
            category: document.getElementById('form-category').value,
            genre: Array.from(document.querySelectorAll('input[name="form-genre"]:checked')).map(cb => cb.value),
            links: Array.from(document.querySelectorAll('#links-container > div')).map(row => ({ name: row.querySelector('.link-name').value, url: row.querySelector('.link-url').value })),
            description: document.getElementById('form-desc').value,
            year: document.getElementById('form-year')?.value,
            month: document.getElementById('form-month')?.value,
            season: document.getElementById('form-season')?.value,
            episodes: document.getElementById('form-episodes')?.value,
            rating: document.getElementById('form-rating')?.value,
            recommendation: document.getElementById('form-recommendation')?.value,
            star_color: document.getElementById('form-star-color').value,
            name_color: document.getElementById('form-name-color').value,
            desc_color: document.getElementById('form-desc-color').value
        };
        const { error } = editId && editId !== 'null' ? await supabaseClient.from('anime_list').update(payload).eq('id', editId) : await supabaseClient.from('anime_list').insert([payload]);
        if (error) throw error;
        window.showToast('儲存成功');
        await window.loadData();
        window.switchAdminTab('manage');
    } catch (err) { window.showToast('儲存失敗', 'error'); }
};
window.addLinkRow = () => { const c = document.getElementById('links-container'); const d = document.createElement('div'); d.style.display = 'flex'; d.style.gap = '5px'; d.style.marginBottom = '5px'; d.innerHTML = `<input type="text" placeholder="名" class="link-name" style="flex: 1; font-size: 10px;"><input type="text" placeholder="網" class="link-url" style="flex: 2; font-size: 10px;"><button class="btn-primary" style="padding: 2px 5px; border-color: #f00; color: #f00;" onclick="this.parentElement.remove()">X</button>`; c.appendChild(d); };
window.addOptionItem = async (key) => { const input = document.getElementById(`add-opt-${key}`); if (!input.value) return; optionsData[key].push(input.value); await window.saveOptionsToDB(); window.renderAdmin(); };
window.deleteOptionItem = async (key, idx) => { optionsData[key].splice(idx, 1); await window.saveOptionsToDB(); window.renderAdmin(); };
window.addNewCategory = async () => { const name = document.getElementById('new-category-name').value; if (!name) return; optionsData[name] = []; await window.saveOptionsToDB(); window.renderAdmin(); };
window.updateCategoryColor = async (key, color) => { if (!optionsData.category_colors) optionsData.category_colors = {}; optionsData.category_colors[key] = color; await window.saveOptionsToDB(); window.renderAdmin(); };
window.saveOptionsToDB = async () => { await supabaseClient.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) }); window.showToast('設定已同步'); };
window.exportCSV = (cat) => {
    const filtered = animeData.filter(item => item.category === cat);
    if (filtered.length === 0) return window.showToast('無資料', 'error');
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
    a.download = `acg_${cat}.csv`;
    a.click();
};
window.triggerImport = (cat) => { importTarget = cat; document.getElementById('importFile').click(); };
window.saveSettings = async () => {
    const title = document.getElementById('set-title').value;
    const ann = document.getElementById('set-announcement').value;
    await supabaseClient.from('site_settings').upsert({ id: 'site_title', value: title });
    await supabaseClient.from('site_settings').upsert({ id: 'announcement', value: ann });
    siteSettings.site_title = title;
    siteSettings.announcement = ann;
    document.title = title;
    window.showToast('設定已儲存');
    window.renderAdmin();
};

// --- Auth Functions ---
window.showLoginModal = () => {
    const email = prompt('請輸入管理員 Email：');
    if (!email) return;
    const pass = prompt('請輸入密碼：');
    if (!pass) return;
    window.handleLogin(email, pass);
};

window.handleLogin = async (email, password) => {
    try {
        window.showToast('驗證中...', 'info');
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
    } catch (err) {
        window.showToast('登入失敗：' + err.message, 'error');
    }
};

window.handleLogout = async () => {
    try {
        await supabaseClient.auth.signOut();
        location.reload();
    } catch (err) {
        window.showToast('登出失敗', 'error');
    }
};

window.toggleSystemMenu = (e) => { e.stopPropagation(); document.getElementById('systemMenu').classList.toggle('active'); };
window.refreshSystem = async () => { await window.loadData(); if (isAdmin) window.renderAdmin(); else window.renderApp(); window.showToast('同步完成'); };

// --- Helpers ---
window.getOptionLabel = (key) => ({ genre: '類型', year: '年份', month: '月份', season: '季度', episodes: '集數', rating: '評分', recommendation: '推薦' }[key] || key);
window.getCategoryName = (cat) => ({ anime: '動畫', manga: '漫畫', movie: '電影' }[cat]);
window.showToast = (msg, type = 'success') => { const t = document.getElementById('toast'); t.textContent = msg; t.className = `toast show ${type}`; setTimeout(() => t.classList.remove('show'), 3000); };

window.onload = window.initApp;
document.addEventListener('click', () => { const m = document.getElementById('systemMenu'); if(m) m.classList.remove('active'); });
