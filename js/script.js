// TECH v3.1.7 ULTRA - ACG Manager Logic
let animeData = [];
let optionsData = { genre: [], year: [], month: [], season: [], episodes: [], rating: [], recommendation: [], category_colors: {} };
let siteSettings = { site_title: 'TECH v3.1.7 ULTRA', announcement: '歡迎來到 ACG 收藏庫', title_color: '#00d4ff', announcement_color: '#00d4ff' };
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
    const { data, error } = await supabaseClient.from('anime_list').select('*').order('created_at', { ascending: false });
    const { data: extraData } = await supabaseClient.from('site_settings').select('value').eq('id', 'extra_assignments').single();
    const extraMap = extraData ? JSON.parse(extraData.value) : {};
    
    if (!error) {
        animeData = (data || []).map(item => ({
            ...item,
            extra_data: extraMap[item.id] || {}
        }));
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
        <div class="site-version">v3.1.7</div>
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
        <div class="site-version">v3.1.7</div>
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
                                <td style="color: ${ratingColor}; font-weight: bold;">★ ${item.rating || '0.0'}</td>
                                <td style="color: ${recColor};">${item.recommendation || '-'}</td>
                                <td>
                                    <div style="display: flex; gap: 8px;">
                                        <button class="btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="window.editAnime('${item.id}')">編輯</button>
                                        <button class="btn-primary" style="padding: 4px 10px; font-size: 11px; border-color: #ff4444; color: #ff4444;" onclick="window.deleteAnime('${item.id}')">刪除</button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <div class="admin-pagination" style="margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
            ${Array.from({length: totalPages}, (_, i) => i + 1).map(p => `<button class="btn-primary ${adminPage === p ? 'active' : ''}" style="padding: 5px 12px;" onclick="window.changeAdminPage(${p})">${p}</button>`).join('')}
        </div>
    `;
};

window.renderAdminForm = (editId = null) => {
    const item = editId ? animeData.find(a => a.id === editId) : { name: '', poster_url: '', category: currentCategory, genre: [], links: [], description: '', year: '', month: '', season: '', episodes: '', rating: '', recommendation: '', star_color: '#ffcc00', name_color: '#ffffff', desc_color: '#00d4ff' };
    const colors = optionsData.category_colors || {};

    return `
        <div class="admin-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group"><label>作品名稱</label><input type="text" id="form-name" value="${item.name}" style="color: ${item.name_color || '#ffffff'}; border-color: ${item.name_color || 'rgba(0, 212, 255, 0.3)'};" oninput="window.updateFormPreview('name-text', this.value)"></div>
            <div class="form-group"><label>海報網址</label><input type="text" id="form-poster" value="${item.poster_url}"></div>
            <div style="grid-column: 1/-1;">
                <div class="horizontal-scroll-container force-scroll">
                    <div class="vertical-scroll-card" style="border-color: ${colors.genre || 'var(--neon-blue)'};">
                        <h4 style="font-size: 13px; color: ${colors.genre || 'var(--neon-blue)'}; margin: 0 0 12px 0; font-weight: 700;">作品類型</h4>
                        <div class="scroll-list force-scroll">${optionsData.genre.map(g => `<label style="display: flex; align-items: center; gap: 6px; padding: 6px; font-size: 12px; cursor: pointer; color: ${colors.genre || 'var(--neon-blue)'}; transition: background 0.2s ease; border-radius: 4px;" onmouseover="this.style.background='rgba(0, 212, 255, 0.1)'" onmouseout="this.style.background=''"><input type="checkbox" name="form-genre" value="${g}" ${item.genre && (Array.isArray(item.genre) ? item.genre.includes(g) : item.genre.includes(g)) ? 'checked' : ''} style="cursor: pointer;"> ${g}</label>`).join('')}</div>
                    </div>
                    <div class="vertical-scroll-card">
                        <h4 style="font-size: 13px; color: var(--neon-blue); margin: 0 0 12px 0; font-weight: 700;">基本選項</h4>
                        <div class="scroll-list force-scroll">
                            <div style="margin-bottom: 10px;"><select id="form-category" class="auto-width-select"><option value="anime" ${item.category === 'anime' ? 'selected' : ''}>動畫</option><option value="manga" ${item.category === 'manga' ? 'selected' : ''}>漫畫</option><option value="movie" ${item.category === 'movie' ? 'selected' : ''}>電影</option></select></div>
                            ${Object.keys(optionsData).filter(k => !['genre', 'category_colors'].includes(k)).map(key => `<div style="margin-bottom: 10px;"><select id="form-${key}" class="auto-width-select" style="color: ${colors[key] || 'var(--neon-blue)'}; border-color: ${colors[key] || 'rgba(0, 212, 255, 0.3)'};"><option value="">${window.getOptionLabel(key)}...</option>${optionsData[key].map(opt => `<option value="${opt}" ${((item.extra_data && item.extra_data[key]) || item[key]) === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select></div>`).join('')}
                        </div>
                    </div>
                    <div class="vertical-scroll-card">
                        <h4 style="font-size: 13px; color: var(--neon-blue); margin: 0 0 12px 0; font-weight: 700;">顏色設定</h4>
                        <div class="scroll-list force-scroll">
                            <div style="margin-bottom: 14px; display: flex; align-items: center; gap: 10px;">
                                <div id="swatch-star" style="width: 24px; height: 24px; border-radius: 4px; background: ${item.star_color || '#ffcc00'}; border: 1px solid rgba(255,255,255,0.2);"></div>
                                <div style="flex: 1;"><span id="preview-star-label" style="font-size: 11px; color: ${item.star_color || '#ffcc00'}; font-weight: 600;">★ 星星顏色</span><input type="color" id="form-star-color" value="${item.star_color || '#ffcc00'}" style="width: 100%; height: 24px; border: none; background: none; cursor: pointer;" oninput="window.updateFormPreview('star', this.value)"></div>
                            </div>
                            <div style="margin-bottom: 14px; display: flex; align-items: center; gap: 10px;">
                                <div id="swatch-name" style="width: 24px; height: 24px; border-radius: 4px; background: ${item.name_color || '#ffffff'}; border: 1px solid rgba(255,255,255,0.2);"></div>
                                <div style="flex: 1;"><span id="preview-name-label" style="font-size: 11px; color: ${item.name_color || '#ffffff'}; font-weight: 600;">◆ 名稱顏色</span><input type="color" id="form-name-color" value="${item.name_color || '#ffffff'}" style="width: 100%; height: 24px; border: none; background: none; cursor: pointer;" oninput="window.updateFormPreview('name-color', this.value)"></div>
                            </div>
                            <div style="margin-bottom: 14px; display: flex; align-items: center; gap: 10px;">
                                <div id="swatch-desc" style="width: 24px; height: 24px; border-radius: 4px; background: ${item.desc_color || '#00d4ff'}; border: 1px solid rgba(255,255,255,0.2);"></div>
                                <div style="flex: 1;"><span id="preview-desc-label" style="font-size: 11px; color: ${item.desc_color || '#00d4ff'}; font-weight: 600;">◈ 劇情顏色</span><input type="color" id="form-desc-color" value="${item.desc_color || '#00d4ff'}" style="width: 100%; height: 24px; border: none; background: none; cursor: pointer;" oninput="window.updateFormPreview('desc-color', this.value)"></div>
                            </div>
                        </div>
                    </div>
                    <div class="vertical-scroll-card" style="flex: 0 0 300px;">
                        <h4 style="font-size: 13px; color: var(--neon-blue); margin: 0 0 12px 0; font-weight: 700;">觀看連結</h4>
                        <div class="scroll-list force-scroll" id="links-container">${(item.links || [{name: '', url: ''}]).map(link => `<div style="display: flex; gap: 6px; margin-bottom: 8px;"><input type="text" placeholder="名" class="link-name" value="${link.name}" style="flex: 1; font-size: 11px;"><input type="text" placeholder="網" class="link-url" value="${link.url}" style="flex: 2; font-size: 11px;"><button class="btn-primary" style="padding: 4px 8px; border-color: #ff4444; color: #ff4444; font-size: 10px;" onclick="this.parentElement.remove()">✕</button></div>`).join('')}</div>
                        <button class="btn-primary" style="width: 100%; font-size: 11px; padding: 6px; margin-top: 8px;" onclick="window.addLinkRow()">➕ 新增連結</button>
                    </div>
                </div>
            </div>
            <div style="grid-column: 1/-1;"><textarea id="form-desc" rows="5" placeholder="劇情介紹" style="width: 100%; color: ${item.desc_color || '#00d4ff'}; border-color: ${item.desc_color || 'rgba(0, 212, 255, 0.3)'};" oninput="window.updateFormPreview('desc-text', this.value)">${item.description || ''}</textarea></div>
            <div style="grid-column: 1/-1; display: flex; gap: 12px; justify-content: flex-end;"><button class="btn-primary" onclick="window.saveAnime('${editId}')">✓ 儲存資料</button><button class="btn-primary" onclick="window.switchAdminTab('manage')">✕ 取消</button></div>
        </div>
    `;
};

window.updateFormPreview = function(type, val) {
    if (type === 'name-color') { 
        document.getElementById('preview-name-label').style.color = val; 
        document.getElementById('form-name').style.color = val; 
        document.getElementById('form-name').style.borderColor = val; 
        document.getElementById('swatch-name').style.background = val;
    }
    if (type === 'desc-color') { 
        document.getElementById('preview-desc-label').style.color = val; 
        document.getElementById('form-desc').style.color = val; 
        document.getElementById('form-desc').style.borderColor = val; 
        document.getElementById('swatch-desc').style.background = val;
    }
    if (type === 'star') { 
        document.getElementById('preview-star-label').style.color = val; 
        document.getElementById('swatch-star').style.background = val;
    }
    if (type === 'name-text') {
        document.getElementById('form-name').value = val;
    }
    if (type === 'desc-text') {
        document.getElementById('form-desc').value = val;
    }
};

window.renderAdminOptions = function() {
    const scrollPos = document.querySelector('.horizontal-scroll-container')?.scrollLeft || 0;
    setTimeout(() => { if(document.querySelector('.horizontal-scroll-container')) document.querySelector('.horizontal-scroll-container').scrollLeft = scrollPos; }, 0);
    return `
        <div style="margin-bottom: 20px; display: flex; gap: 12px;"><input type="text" id="new-category-name" placeholder="新類別名稱..." style="flex: 1;"><button class="btn-primary" onclick="window.addNewCategory()">Add</button></div>
        <div class="horizontal-scroll-container force-scroll" id="options-scroll-container" style="padding-bottom: 20px; gap: 15px;">
            ${Object.keys(optionsData).filter(k => k !== 'category_colors').map(key => {
                const catColor = optionsData.category_colors?.[key] || 'var(--neon-blue)';
                return `
                    <div class="vertical-scroll-card" style="border-color: ${catColor}; flex: 0 0 180px; min-width: 180px; padding: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;"><h4 style="font-size: 13px; color: ${catColor}; margin: 0; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${window.getOptionLabel(key)}</h4><input type="color" value="${catColor}" style="width: 24px; height: 24px; border-radius: 4px; cursor: pointer; border: none; background: none;" onchange="window.updateCategoryColor('${key}', this.value)"></div>
                        <div class="scroll-list force-scroll" style="height: 280px; overflow-x: hidden;">
                            ${optionsData[key].map((opt, idx) => `<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; border-bottom: 1px solid rgba(0, 212, 255, 0.08); border-radius: 4px; transition: background 0.2s ease;" onmouseover="this.style.background='rgba(0, 212, 255, 0.05)'" onmouseout="this.style.background=''"><span style="font-size: 12px; color: ${catColor}; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${opt}</span><button style="background: none; border: none; color: #ff4444; cursor: pointer; font-size: 11px; font-weight: bold; padding: 2px 6px;" onclick="window.deleteOptionItem('${key}', ${idx})">✕</button></div>`).join('')}
                            <div style="display: flex; gap: 6px; margin-top: 12px;"><input type="text" id="add-opt-${key}" placeholder="新增..." style="flex: 1; font-size: 11px; padding: 5px !important;" onkeypress="if(event.key==='Enter') window.addOptionItem('${key}')"><button class="btn-primary" style="padding: 4px 8px; font-size: 10px;" onclick="window.addOptionItem('${key}')">+</button></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
};

window.renderAdminData = function() {
    return `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><div class="vertical-scroll-card"><h4 style="font-size: 14px; color: var(--neon-blue); margin: 0 0 15px 0;">資料備份</h4><div style="display: flex; flex-direction: column; gap: 10px;"><button class="btn-primary" onclick="window.exportCSV('anime')">匯出動畫</button><button class="btn-primary" onclick="window.exportCSV('manga')">匯出漫畫</button><button class="btn-primary" onclick="window.exportCSV('movie')">匯出電影</button></div></div><div class="vertical-scroll-card"><h4 style="font-size: 14px; color: var(--neon-blue); margin: 0 0 15px 0;">資料還原</h4><div style="display: flex; flex-direction: column; gap: 10px;"><button class="btn-primary" onclick="window.triggerImport('anime')">匯入動畫</button><button class="btn-primary" onclick="window.triggerImport('manga')">匯入漫畫</button><button class="btn-primary" onclick="window.triggerImport('movie')">匯入電影</button></div></div></div>`;
};

window.renderAdminSettings = function() {
    return `
        <div style="max-width: 600px;">
            <h3 style="font-size: 15px; color: var(--neon-cyan); margin: 0 0 20px 0; font-weight: 700;">🔧 網站設定</h3>
            <div class="form-group">
                <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-size: 12px; font-weight: 600;">網站標題</label>
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                    <div style="width: 24px; height: 24px; border-radius: 4px; background: ${siteSettings.title_color || '#00d4ff'}; border: 1px solid rgba(255,255,255,0.2);"></div>
                    <input type="text" id="set-title" value="${siteSettings.site_title}" style="flex: 1; color: ${siteSettings.title_color || '#00d4ff'}; border-color: ${siteSettings.title_color || 'rgba(0, 212, 255, 0.3)'};">
                    <input type="color" id="set-title-color" value="${siteSettings.title_color || '#00d4ff'}" style="width: 40px; height: 40px; border: none; background: none; cursor: pointer;">
                </div>
            </div>
            <div class="form-group">
                <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-size: 12px; font-weight: 600;">公告內容</label>
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                    <div style="width: 24px; height: 24px; border-radius: 4px; background: ${siteSettings.announcement_color || '#00d4ff'}; border: 1px solid rgba(255,255,255,0.2);"></div>
                    <input type="text" id="set-announcement" value="${siteSettings.announcement}" style="flex: 1; color: ${siteSettings.announcement_color || '#00d4ff'}; border-color: ${siteSettings.announcement_color || 'rgba(0, 212, 255, 0.3)'};">
                    <input type="color" id="set-announcement-color" value="${siteSettings.announcement_color || '#00d4ff'}" style="width: 40px; height: 40px; border: none; background: none; cursor: pointer;">
                </div>
            </div>
            <button class="btn-primary" style="margin-top: 20px; width: 100%;" onclick="window.saveSettings()">✓ 更新設定</button>
        </div>
    `;
};

// --- Logic Functions ---
window.switchCategory = (cat) => { 
    currentCategory = cat; 
    currentPage = 1; 
    if (isAdmin) window.renderAdmin(); else window.renderApp(); 
};

window.switchAdminTab = (tab) => {
    currentAdminTab = tab;
    window.renderAdmin();
    
    // 為選項管理的大區塊橫向滾動加入滾輪支援
    if (tab === 'options') {
        setTimeout(() => {
            const container = document.getElementById('options-scroll-container');
            if (container) {
                container.addEventListener('wheel', (e) => {
                    if (e.deltaY !== 0) {
                        e.preventDefault();
                        container.scrollLeft += e.deltaY;
                    }
                });
            }
        }, 100);
    }
};

window.toggleAdminMode = (show) => { 
    if (show && !isAdmin) { window.showLoginModal(); return; } 
    if (show) window.renderAdmin(); else window.renderApp(); 
};

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
    
    let monthStr = item.month || '';
    if (monthStr && !monthStr.includes('月')) monthStr += '月';
    const timeInfo = [item.year, item.season, monthStr].filter(t => t).join(' ');
    const yearColor = optionsData.category_colors?.year || 'var(--neon-blue)';

    const genres = (Array.isArray(item.genre) ? item.genre : (item.genre ? item.genre.split('|') : [])).map(g => g.replace(/["'\[\]]/g, '').trim());
    
    // 獲取擴充選項標籤 (優先從 extra_data 讀取)
    const extraTags = Object.keys(optionsData)
        .filter(k => !['genre', 'year', 'month', 'season', 'episodes', 'rating', 'recommendation', 'category_colors'].includes(k))
        .map(key => {
            const val = (item.extra_data && item.extra_data[key]) || item[key];
            if (!val) return null;
            const color = optionsData.category_colors?.[key] || 'var(--neon-blue)';
            return `<span class="tag-item" style="font-size: 14px; padding: 6px 16px; border-color: ${color}; color: ${color}; white-space: nowrap; background: none; box-shadow: 0 0 8px ${color}44;">${val}</span>`;
        })
        .filter(t => t);

    const modal = document.getElementById('detailModal');
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 550px; padding: 25px;">
            <button class="close-btn" onclick="window.closeAnimeDetail()">✕</button>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                <img src="${item.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}" style="width: 180px; height: 260px; object-fit: cover; border-radius: 12px; box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); border: 2px solid rgba(0, 212, 255, 0.2);">
                
                <div style="text-align: center; width: 100%;">
                    <h2 style="color: ${nameColor}; font-size: 24px; margin: 0 0 10px 0; text-shadow: 0 0 15px ${nameColor}88; font-weight: 800;">${item.name}</h2>
                    
                    <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 12px;">
                        ${timeInfo ? `<span style="padding: 4px 12px; border: 1.5px solid ${yearColor}; border-radius: 6px; color: ${yearColor}; font-size: 14px; font-weight: 700; text-shadow: 0 0 8px ${yearColor}66;">${timeInfo}</span>` : ''}
                        ${item.episodes ? `<span style="padding: 4px 12px; border: 1.5px solid ${optionsData.category_colors?.episodes || 'var(--neon-blue)'}; border-radius: 6px; color: ${optionsData.category_colors?.episodes || 'var(--neon-blue)'}; font-size: 14px; font-weight: 700; text-shadow: 0 0 8px ${optionsData.category_colors?.episodes || 'var(--neon-blue)'}66;">全 ${item.episodes} 集</span>` : ''}
                    </div>

                    <div class="horizontal-scroll-container force-scroll" style="width: 100%; gap: 8px; margin-bottom: 8px; justify-content: center; padding: 5px 0; overflow-y: hidden;">
                        ${genres.map(g => `<span class="tag-item" style="font-size: 14px; padding: 6px 16px; border-color: ${genreColor}; color: ${genreColor}; white-space: nowrap; background: none; box-shadow: 0 0 8px ${genreColor}44;">${g}</span>`).join('')}
                    </div>

                    ${extraTags.length > 0 ? `
                    <div class="horizontal-scroll-container force-scroll" style="width: 100%; gap: 8px; margin-bottom: 12px; justify-content: center; padding: 5px 0; overflow-y: hidden;">
                        ${extraTags.join('')}
                    </div>` : ''}
                </div>

                <div style="width: 100%; padding: 15px; background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 212, 255, 0.05)); border: 1.5px solid ${descColor}; border-left: 4px solid ${descColor}; border-radius: 8px; text-align: left; max-height: 150px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: ${descColor} rgba(0, 0, 0, 0.3); margin-top: 10px;">
                    <div style="font-size: 13px; color: ${descColor}; line-height: 1.9; padding-right: 10px; font-weight: 500;">
                        ${item.description || '[ 系統資料庫中暫無此作品之詳細介紹 ]'}
                    </div>
                </div>

                <div style="width: 100%; padding: 10px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(176, 38, 255, 0.05)); border-radius: 8px; border: 1.5px solid rgba(0, 212, 255, 0.2); margin-top: 5px;">
                    <div class="horizontal-scroll-container force-scroll" style="width: 100%; max-width: 480px; gap: 12px; padding: 5px; justify-content: flex-start; min-height: 45px; overflow-y: hidden;">
                        ${(item.links || []).map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="font-size: 12px; padding: 8px 22px; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none;">🔗 ${l.name}</a>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
    
    // 為詳情頁內的橫向滾動容器加入滾輪支援
    setTimeout(() => {
        const containers = modal.querySelectorAll('.horizontal-scroll-container');
        containers.forEach(container => {
            container.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    container.scrollLeft += e.deltaY;
                }
            });
        });
    }, 100);
};

window.closeAnimeDetail = () => document.getElementById('detailModal').classList.remove('active');
window.editAnime = (id) => { currentAdminTab = 'add'; window.renderAdmin(); document.querySelector('.admin-panel main').innerHTML = window.renderAdminForm(id); };
window.deleteAnime = async (id) => { if (confirm('確定刪除此作品？')) { await supabaseClient.from('anime_list').delete().eq('id', id); await window.loadData(); window.renderAdmin(); window.showToast('✓ 刪除成功'); } };

window.saveAnime = async (editId) => {
    try {
        const name = document.getElementById('form-name').value;
        if (!name) return window.showToast('✗ 請輸入名稱', 'error');
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
        
        // 處理自定義標籤：由於資料庫欄位限制，將非標準欄位存入 site_settings 的 extra_assignments
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

        // 儲存額外標籤到 site_settings
        const targetId = editId || (savedData && savedData[0]?.id);
        if (targetId && Object.keys(extraAssignments).length > 0) {
            let { data: currentExtra } = await supabaseClient.from('site_settings').select('value').eq('id', 'extra_assignments').single();
            let extraMap = currentExtra ? JSON.parse(currentExtra.value) : {};
            extraMap[targetId] = extraAssignments;
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
    return animeData.filter(item => {
        if (item.category !== currentCategory) return false;
        if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.year && item.year !== filters.year) return false;
        if (filters.season && item.season !== filters.season) return false;
        if (filters.genre && !(Array.isArray(item.genre) ? item.genre.includes(filters.genre) : item.genre.includes(filters.genre))) return false;
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
