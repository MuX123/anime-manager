// TECH v8.0.0 - ACG Manager Logic (Security & Performance Optimized)

// ??啣??蔭 - 皜??批?啗撓??const IS_PRODUCTION = window.location.hostname !== 'localhost' &&
    !window.location.hostname.includes('127.0.0.1') &&
    (window.location.hostname.includes('github.io') || window.location.hostname.includes('.io'));

// ??啣?閬? console 皜??芷
if (IS_PRODUCTION) {
    const originalConsole = { ...console };
    console.log = (...args) => {
        if (typeof args[0] === 'string' && (args[0].includes('??) || args[0].includes('?'))) {
            originalConsole.log.call(originalConsole, '[INFO]', ...args);
        }
    };
    console.warn = (...args) => originalConsole.warn.call(originalConsole, '[WARN]', ...args);
    console.info = () => { };
}

let currentSection = 'notice';
let animeData = [];
let optionsData = {
    genre: ['?', '憟劂', '?梯?', '?∪?', '???, '??', '蝘劂', '?貊?', '?亙虜', '?唬???],
    year: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    month: ['1??, '2??, '3??, '4??, '5??, '6??, '7??, '8??, '9??, '10??, '11??, '12??],
    season: ['??, '??, '憭?, '蝘?],
    episodes: ['12??, '24??, '???, 'OVA'],
    rating: ['SS', '蟡?, '??, '??, '??],
    recommendation: ['??????, '????', '????, '??', '??],
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

window.getOptionLabel = (key) => {
    const labels = {
        genre: '憿?',
        year: '撟港遢',
        month: '?遢',
        season: '摮?漲',
        episodes: '?',
        rating: '閰?',
        recommendation: '?刻'
    };
    return labels[key] || key;
};

// ?典?皛?皛曇憚璈怠??脣?
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

window.showFirstVisitPopups = async () => {
    if (typeof window.showAnnouncementPopups === 'function') {
        await window.showAnnouncementPopups();
    }
};

let siteSettings = {
    site_title: 'ACG ?嗉?摨?,
    announcement: '???Ｙ?瞍內璅∪? // 鞈?靘?嚗?蝷箸??,
    title_color: '#ffffff',
    announcement_color: '#ffffff',
    admin_name: '蝞∠???,
    admin_avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    admin_color: '#00ffff',
    admin_email: '',
    custom_labels: {}
};

// 瞍內?豢?嚗蝺芋撘蝙?剁?
const demoAnimeData = [
    {
        id: 1,
        name: '?????,
        original_name: 'Sword Art Online',
        genre: '蝘劂',
        year: '2024',
        season: '??,
        episodes: '24??,
        rating: '??,
        recommendation: '??????,
        image_url: 'https://cdn.myanimelist.net/images/anime/1173/142080l.jpg',
        description: '2022撟湛?VRMMO??AO?迤撘????拙振?◤?啣?銝剔瘜?綽??芣??OSS??ａ?...',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        name: '擛潭?銋?',
        original_name: 'Demon Slayer',
        genre: '?梯?',
        year: '2023',
        season: '??,
        episodes: '26??,
        rating: '蟡?,
        recommendation: '??????,
        image_url: 'https://cdn.myanimelist.net/images/anime/1178/142083l.jpg',
        description: '憭扳迤??嚗??箝狩???芰摮?潔??蜓閫瘝駁??振鈭箄◤擛潭捏摰喉?隞?銝??擛潭捏????...',
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        name: '??摰嗅振??,
        original_name: 'Spy x Family',
        genre: '??',
        year: '2024',
        season: '??,
        episodes: '12??,
        rating: '??,
        recommendation: '??????,
        image_url: 'https://cdn.myanimelist.net/images/anime/3408/142078l.jpg',
        description: '?????鈭??遙???閬?撱箔???振摨准??園?鈭??敹??憟喳?嚗????銝??瘣?..',
        created_at: new Date().toISOString()
    },
    {
        id: 4,
        name: '?脫??楊鈭?,
        original_name: 'Attack on Titan',
        genre: '?梯?',
        year: '2023',
        season: '蝘?,
        episodes: '24??,
        rating: '蟡?,
        recommendation: '??????,
        image_url: 'https://cdn.myanimelist.net/images/anime/1174/142081l.jpg',
        description: '?典楊鈭箏????犖憿?敺??嚗撠楊鈭箸?憌??嚗蜓閫?急捱摰??亥?蝺游??撅?敺拐?銋?...',
        created_at: new Date().toISOString()
    },
    {
        id: 5,
        name: '???梢?摮賊',
        original_name: 'My Hero Academia',
        genre: '?梯?',
        year: '2024',
        season: '憭?,
        episodes: '24??,
        rating: '??,
        recommendation: '????',
        image_url: 'https://cdn.myanimelist.net/images/anime/1205/142085l.jpg',
        description: '??0%?犖憿????扼?頞???誨嚗?????撠僑蝬健?箔?憒???梢?嚗?,
        created_at: new Date().toISOString()
    },
    {
        id: 6,
        name: '??餈湔',
        original_name: 'Jujutsu Kaisen',
        genre: '?梯?',
        year: '2024',
        season: '??,
        episodes: '24??,
        rating: '蟡?,
        recommendation: '??????,
        image_url: 'https://cdn.myanimelist.net/images/anime/1173/142079l.jpg',
        description: '擃葉????隞??閰?????嚗??箔?閰??捆?剁?敹??脣??擃?摮豢摮貊?...',
        created_at: new Date().toISOString()
    },
    {
        id: 7,
        name: '蝝怎??剜偶???,
        original_name: 'Violet Evergarden',
        genre: '???,
        year: '2023',
        season: '??,
        episodes: '14??,
        rating: '蟡?,
        recommendation: '??????,
        image_url: 'https://cdn.myanimelist.net/images/anime/1795/142084l.jpg',
        description: '?芸???鈭箏???曇??嗽瑚????颯?啣?撠?????儔嚗鈭箏誨蝑靽?..',
        created_at: new Date().toISOString()
    },
    {
        id: 8,
        name: '雿???',
        original_name: 'Your Name',
        genre: '???,
        year: '2022',
        season: '蝘?,
        episodes: '???,
        rating: '蟡?,
        recommendation: '??????,
        image_url: 'https://cdn.myanimelist.net/images/anime/1315/142086l.jpg',
        description: '雿?曹漪??撟渲?雿????憟喉??典丐銝凋漱??頨恍??楊頞?蝛箇?憟?撠望迨撅?...',
        created_at: new Date().toISOString()
    },
    {
        id: 9,
        name: 'Re:敺???銝??暑',
        original_name: 'Re:Zero',
        genre: '?唬???,
        year: '2024',
        season: '憭?,
        episodes: '24??,
        rating: '??,
        recommendation: '??????,
        image_url: 'https://cdn.myanimelist.net/images/anime/152/142088l.jpg',
        description: '鋡怠??唬???撠僑???湛????香鈭∪?甇詻??賢?嚗???鈭箸??賣??渲???..',
        created_at: new Date().toISOString()
    },
    {
        id: 10,
        name: '瘚瑁???,
        original_name: 'One Piece',
        genre: '?',
        year: '2024',
        season: '憭?,
        episodes: '24??,
        rating: '蟡?,
        recommendation: '??????,
        image_url: 'https://cdn.myanimelist.net/images/anime/456/142090l.jpg',
        description: '?港??蜇??撟湧陌憭怨?銝??整之瘚瑁??窄?????嚗?撱箔??蜇瘚瑁???..',
        created_at: new Date().toISOString()
    }
];
let currentCategory = 'notice';
let currentAdminTab = 'manage';
let currentPage = 1;
const itemsPerPage = 20;
const adminItemsPerPage = 10;
let adminPage = 1;
let filters = { search: '', genre: '', year: '', rating: '', season: '', month: '', episodes: '' };
let gridColumns = (() => {
    const stored = localStorage.getItem('gridColumns');
    if (stored === 'mobile') return 'mobile';
    if (['3', '4', '5'].includes(stored)) return parseInt(stored);
    return window.innerWidth <= 768 ? 'mobile' : 5;
})();
window.gridColumns = gridColumns;
let sortOrder = localStorage.getItem('sortOrder') || 'desc';
// ?身蝮格 75%
let zoomLevel = (() => {
    const stored = localStorage.getItem('zoomLevel');
    if (stored && ['50', '60', '75', '80', '90', '100'].includes(stored)) return parseInt(stored);
    return 75;
})();
let importTarget = 'anime';
let editId = null;
let isFirstLoad = true;

// --- UI Helper Functions (?曉?隞亦Ⅱ靽?initApp ?臭誑隤輻) ---

window.showToast = (msg, type = 'info') => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    // 雿輻 CSS 霈?批??憿嚗??′撖?style ?脫迫閬?瘚桀?撅祆?    toast.style.setProperty('--toast-border', type === 'error' ? '#ff4444' : 'var(--neon-cyan)');
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2000);
};

// 蝛箇???UI (Empty State)
window.renderEmptyState = (message = '?芣?啁????, hint = '?岫隤踵??璇辣') => {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">?</div>
            <div class="empty-state-title">${message}</div>
            <div class="empty-state-message">${hint}</div>
        </div>
    `;
};

// Admin Authentication Functions
window.isAdminLoggedIn = false;

window.showAdminLoginModal = () => {
    const existingModal = document.getElementById('admin-login-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'admin-login-modal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <h2 style="color: var(--neon-cyan); margin-bottom: 20px; text-align: center;">?? 蝞∠??∠??/h2>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan);">?餃??萎辣</label>
                <input type="email" id="admin-email" placeholder="admin@example.com" style="width: 100%; padding: 12px; border: 1px solid rgba(0,212,255,0.3); border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan);">撖Ⅳ</label>
                <input type="password" id="admin-password" placeholder="頛詨撖Ⅳ" style="width: 100%; padding: 12px; border: 1px solid rgba(0,212,255,0.3); border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff;">
            </div>
            <div id="login-error" style="color: #ff4444; text-align: center; margin-bottom: 15px; display: none;"></div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" style="flex: 1; padding: 12px;" onclick="window.performAdminLogin()">?餃</button>
                <button class="btn-primary" style="flex: 1; border-color: #ff4444; color: #ff4444;" onclick="document.getElementById('admin-login-modal').remove()">??</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('admin-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.performAdminLogin();
    });
};

window.performAdminLogin = async () => {
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('login-error');

    if (!email || !password) {
        errorDiv.textContent = '隢撓?仿摮隞嗅?撖Ⅳ';
        errorDiv.style.display = 'block';
        return;
    }

    errorDiv.style.display = 'none';

    try {
        const result = await window.supabaseManager.signInWithEmail(email, password);

        if (result.success) {
            window.showToast('???餃??');
            document.getElementById('admin-login-modal').remove();
            await window.checkAndUpdateAdminStatus();
            console.log('[Auth] ?餃敺???', window.isAdminLoggedIn);
            // ?皜脫??蝔?隞交?啁?交???            if (typeof window.renderApp === 'function') {
                window.renderApp();
            }
        } else {
            console.warn('[Auth] ?餃憭望?:', result.error);
            errorDiv.textContent = result.error || '?餃憭望?';
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        console.error('[Auth] ?餃?航炊:', err);
        errorDiv.textContent = '?餃???潛??航炊';
        errorDiv.style.display = 'block';
    }
};

window.adminLogout = async () => {
    const result = await window.supabaseManager.signOut();
    if (result.success) {
        window.isAdminLoggedIn = false;
        window.showToast('??撌脩??);
        window.updateAdminMenu();
        if (document.querySelector('.admin-container')) {
            window.toggleAdminMode(false);
        }
    } else {
        window.showToast('???餃憭望?', 'error');
    }
};

window.checkAndUpdateAdminStatus = async () => {
    if (!window.supabaseManager || !window.supabaseManager.isConnectionReady()) {
        window.isAdminLoggedIn = false;
        return false;
    }

    try {
        const isAdminUser = await window.supabaseManager.checkIsAdmin();
        console.log('[Auth] 瑼Ｘ蝞∠??∠?????', isAdminUser);
        window.isAdminLoggedIn = isAdminUser;
        window.updateAdminMenu();
        return isAdminUser;
    } catch (err) {
        console.error('[Auth] 瑼Ｘ蝞∠??∠????', err);
        window.isAdminLoggedIn = false;
        return false;
    }
};

window.updateAdminMenu = () => {
    // 蝞∠????曉?典?湧?桐葉,?ㄐ?芷??header
    const headerContainer = document.getElementById('adminHeaderBar');
    if (headerContainer) {
        headerContainer.innerHTML = '';
    }
};

let lastFrontendCategory = 'anime'; // 蝝??甈∠????
let lastSwitchRequestId = 0; // 餈質馱?敺?甈∪???瘙?ID
window.toggleAdminMode = (enable) => {
    if (enable && !isAdminLoggedIn) {
        window.showAdminLoginModal();
        return;
    }

    const topControlBar = document.getElementById('topControlBar');
    const adminHeaderBar = document.getElementById('adminHeaderBar');
    const analyticsBar = document.querySelector('.analytics-bar');
    const app = document.getElementById('app');
    const systemMenu = document.getElementById('systemMenu');

    if (enable) {
        lastFrontendCategory = currentCategory;
        currentSection = 'admin';
        if (topControlBar) topControlBar.style.display = 'none';
        if (adminHeaderBar) adminHeaderBar.style.display = 'none';
        if (analyticsBar) analyticsBar.style.display = 'none';
        if (systemMenu) systemMenu.classList.add('active');
        window.renderAdmin();
    } else {
        currentSection = 'notice';
        currentCategory = lastFrontendCategory;
        if (topControlBar) topControlBar.style.display = 'flex';
        if (adminHeaderBar) adminHeaderBar.style.display = 'flex';
        if (analyticsBar) analyticsBar.style.display = 'block';
        if (systemMenu) systemMenu.classList.remove('active');
        window.renderApp();
    }
};

// Listen for auth state changes
if (window.supabaseManager && window.supabaseManager.client && window.supabaseManager.client.auth) {
    window.supabaseManager.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
            await window.checkAndUpdateAdminStatus();
        } else if (event === 'SIGNED_OUT') {
            isAdminLoggedIn = false;
            window.updateAdminMenu();
        }
    });
}

// --- Render Functions (敹???initApp 銋?摰儔) ---

window.renderPagination = (total) => {
    const pages = Math.ceil(total / itemsPerPage);
    if (pages <= 1) return '';
    let btns = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(pages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    // 銝???    if (currentPage > 1) {
        btns.push(`<button class="btn-minimal" onclick="window.changePage(${currentPage - 1})">?</button>`);
    }

    if (start > 1) {
        btns.push(`<button class="btn-minimal" onclick="window.changePage(1)">1</button>`);
        if (start > 2) btns.push(`<span class="pagination-dots">...</span>`);
    }
    for (let i = start; i <= end; i++) {
        btns.push(`<button class="btn-minimal ${currentPage === i ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`);
    }
    if (end < pages) {
        if (end < pages - 1) btns.push(`<span class="pagination-dots">...</span>`);
        btns.push(`<button class="btn-minimal" onclick="window.changePage(${pages})">${pages}</button>`);
    }

    // 銝???    if (currentPage < pages) {
        btns.push(`<button class="btn-minimal" onclick="window.changePage(${currentPage + 1})">??/button>`);
    }

    return btns.join('');
};

window.renderSearchSelectsHTML = () => {
    const createSelect = (id, label, options, currentVal, onChange) => {
        return `<select id="${id}" onchange="${onChange}" style="min-width: 100px; background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.25); padding: 8px; font-size: 13px; cursor: pointer; color: #fff; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif;">
            <option value="" style="background: var(--bg-dark);">${label}</option>
            ${options.map(o => `<option value="${o}" ${o === currentVal ? 'selected' : ''} style="background: var(--bg-dark);">${o}</option>`).join('')}
        </select>`;
    };
    return `${createSelect('filter-genre', '憿?', optionsData.genre, filters.genre, "window.applyFilters(this.value, 'genre')")}
           ${createSelect('filter-year', '撟港遢', optionsData.year, filters.year, "window.applyFilters(this.value, 'year')")}
           ${createSelect('filter-season', '摮?漲', optionsData.season, filters.season, "window.applyFilters(this.value, 'season')")}
           ${createSelect('filter-month', '?遢', optionsData.month, filters.month, "window.applyFilters(this.value, 'month')")}
           ${createSelect('filter-rating', '閰?', optionsData.rating, filters.rating, "window.applyFilters(this.value, 'rating')")}`;
};

window.getFilteredData = () => {
    let data = animeData.filter(a => a.category === currentCategory);
    if (filters.search) {
        const term = filters.search.toLowerCase();
        data = data.filter(a => (a.name && a.name.toLowerCase().includes(term)) || (a.genre && a.genre.toLowerCase().includes(term)));
    }
    if (filters.genre) data = data.filter(a => a.genre && a.genre.includes(filters.genre));
    if (filters.year) data = data.filter(a => a.year === filters.year);
    if (filters.season) data = data.filter(a => a.season === filters.season);
    if (filters.month) data = data.filter(a => a.month === filters.month);
    if (filters.rating) data = data.filter(a => a.rating === filters.rating);
    if (sortOrder === 'desc') data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    else if (sortOrder === 'asc') data.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    else if (sortOrder === 'name') data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return data;
};

// --- Core Functions ---

/**
 * 摰?啗?蝢?HTML ?寞?摮泵嚗甇?XSS嚗? * @param {string} str ?芾???摮葡
 * @returns {string} 頧儔敺?摰摮葡
 */
const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    try {
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    } catch (e) {
        console.warn('HTML escape failed:', e);
        return String(str).replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);
    }
};

// Mouse drag scroll for desktop tags
document.addEventListener('mousedown', (e) => {
    const tags = e.target.closest('.desktop-scroll-tags');
    if (!tags) return;
    tags.isDown = true;
    tags.startX = e.pageX - tags.offsetLeft;
    tags.scrollLeftStart = tags.scrollLeft;
});
document.addEventListener('mouseleave', () => {
    const tags = document.querySelector('.desktop-scroll-tags[isDown="true"]');
    if (tags) tags.isDown = false;
});
document.addEventListener('mouseup', () => {
    const tags = document.querySelector('.desktop-scroll-tags');
    // We need to find the one that was active
    document.querySelectorAll('.desktop-scroll-tags').forEach(t => t.isDown = false);
});
document.addEventListener('mousemove', (e) => {
    const tags = e.target.closest('.desktop-scroll-tags');
    if (!tags || !tags.isDown) return;
    e.preventDefault();
    const x = e.pageX - tags.offsetLeft;
    const walk = (x - tags.startX) * 2;
    tags.scrollLeft = tags.scrollLeftStart - walk;
});

window.initApp = async function () {
    try {
        console.log('?? 蝟餌絞???葉...');

        // 敹恍炎??Supabase嚗葬?剔?敺???        const waitForSupabaseReady = async (timeoutMs = 2000, intervalMs = 100) => {
            const start = Date.now();
            while (Date.now() - start < timeoutMs) {
                if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
                    return true;
                }
                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }
            return window.supabaseManager ? window.supabaseManager.isConnectionReady() : false;
        };

        // ??閰?Supabase嚗?蝘???        await waitForSupabaseReady();

        // 1. 瑼Ｘ Supabase ?????        let client = null;
        let isOfflineMode = false;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
            console.log('??雿輻 Supabase ?豢?摨?);
        } else {
            console.warn('?? Supabase ?芷?嚗脣?Ｙ?瞍內璅∪?');
            isOfflineMode = true;
            window.showToast('鞈?摨急??嚗蝙?冽?蝷箸??, 'info');
        }

        // 2. ?脣?蝬脩?閮剖??????(?芸?頛)
        if (client) {
            try {
                const { data: settings, error: settingsError } = await client.from('site_settings').select('*');
                if (!settingsError && settings) {
                    settings.forEach(s => {
                        if (s.id === 'site_title') siteSettings.site_title = s.value;
                        if (s.id === 'announcement') siteSettings.announcement = s.value;
                        if (s.id === 'title_color') siteSettings.title_color = s.value;
                        if (s.id === 'announcement_color') siteSettings.announcement_color = s.value;
                        if (s.id === 'admin_name') siteSettings.admin_name = s.value;
                        if (s.id === 'admin_avatar') siteSettings.admin_avatar = s.value;
                        if (s.id === 'admin_color') siteSettings.admin_color = s.value;
                        if (s.id === 'admin_email') siteSettings.admin_email = s.value;
                        if (s.id === 'custom_labels') {
                            try {
                                siteSettings.custom_labels = JSON.parse(s.value);
                            } catch (e) {
                                console.warn('custom_labels 閫??憭望?:', e);
                            }
                        }
                        if (s.id === 'options_data') {
                            try {
                                const parsed = JSON.parse(s.value);
                                if (parsed && parsed.genre) {
                                    optionsData = parsed;
                                }
                            } catch (e) {
                                console.warn('options_data 閫??憭望?嚗蝙?券?閮剝??', e);
                            }
                        }
                    });
                    console.log('??蝬脩?閮剖?頛??');
                } else {
                    console.warn('蝬脩?閮剖?頛憭望??鞈?:', settingsError);
                }
            } catch (err) {
                console.error('頛蝬脩?閮剖??潛??航炊:', err);
            }

            // 5. 頛雿?鞈?
            await window.loadData();
        }

        // 6. 閮剔蔭?典?霈
        window.animeData = animeData;
        window.optionsData = optionsData;
        window.siteSettings = siteSettings;

        // 7. ?蝮格閮剖?
        window.applyZoom();

        // 8. 瑼Ｘ蝞∠??∠?亦???        await window.checkAndUpdateAdminStatus();

        // 9. 皜脫???隞
        window.renderApp();

        // 10. 瑼Ｘ?暹??店?恣????瘛餃?頞?靽風嚗?        if (window.supabaseManager?.isConnectionReady()) {
            try {
                const sessionPromise = window.supabaseManager.getClient().auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Session check timeout')), 2000)
                );
                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
                if (session) {
                    await window.checkAndUpdateAdminStatus();
                }
            } catch (e) {
                console.warn('Session check skipped:', e.message);
            }
        }

        // 11. 憿舐內擐活閮芸?敶?
        if (isFirstLoad) {
            setTimeout(() => window.showFirstVisitPopups(), 1000);
        }

        // 11. ?梯?頛?恍銝阡＊蝷箏摰?(撱園蝣箔?皜脫?蝛拙? - 憓?蝘???敺???
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        if (loadingScreen) {
            console.log('??蝟餌絞??????皞???隞...');
            
            // 璅⊥蝟餌絞??撱園 (2.5蝘?
            setTimeout(() => {
                // 瘛餃?瘛∪憿?(憒? CSS ??蝢? ??交?雿?opacity
                loadingScreen.style.opacity = '0';
                loadingScreen.style.pointerEvents = 'none';
                
                // 蝑?瘛∪?摰?敺??                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    app.classList.add('loaded');
                    console.log('?? 隞撌脣???);
                }, 1000); 
            }, 2500); 
        } else {
            app.classList.add('loaded');
        }

        isFirstLoad = false;
        console.log('??蝟餌絞??????);

        // 摰頞?嚗?0蝘?撘瑕?梯?頛?恍
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const app = document.getElementById('app');
            if (loadingScreen && loadingScreen.style.display !== 'none') {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.display = 'none';
                app.classList.add('loaded');
                console.log('?? 摰頞?撘瑕?梯?頛?恍');
            }
        }, 10000);

    } catch (err) {
        console.error('Init error:', err);
        window.showToast('蝟餌絞???仃??隢??唳??, 'error');
        // ?喃蝙憭望?銋?閰行葡??祉?瑽?        isFirstLoad = false;
        window.renderApp();

        // 蝣箔??梯?頛?恍
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                app.classList.add('loaded');
            }, 500);
        } else {
            app.classList.add('loaded');
        }

        // ????????(Night City Rain)
        if (typeof window.initAtmosphere === 'function') {
            window.initAtmosphere();
        }

        // ?Ｗ儔銝活?豢???璅蜓憿?        const savedTheme = localStorage.getItem('cursorTheme') || 'standard';
        if (typeof window.applyCursorTheme === 'function') {
            window.applyCursorTheme(savedTheme);
        }
    }
};

window.loadData = async function (forceRefresh = false) {
    try {
        // 憒?撌脩?????撥?嗅?堆??湔餈?
        if (animeData.length > 0 && !forceRefresh) {
            return animeData;
        }

        console.log('? 甇?敺?Supabase ??鞈?...');
        const client = window.supabaseManager?.getClient();
        if (!client) {
            console.warn('Supabase 摰Ｘ蝡舀撠梁?嚗蝙?冽?蝷箸??);
            // 雿輻瞍內?豢?
            animeData = [...demoAnimeData];
            console.log('??雿輻瞍內?豢?嚗', animeData.length, '蝑?);
            return animeData;
        }

        // 瑼Ｘ?臬???臭誑???
        if (!window.supabaseManager?.isConnectionReady()) {
            console.warn('Supabase ?芸停蝺?雿輻瞍內?豢?');
            animeData = [...demoAnimeData];
            return animeData;
        }

        // 雿輻頞?璈嚗??瘙雿?        const fetchWithTimeout = async (promise, timeoutMs = 3000) => {
            let timeoutId;
            const racePromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('隢?頞?')), timeoutMs);
            });
            try {
                const result = await Promise.race([promise, racePromise]);
                clearTimeout(timeoutId);
                return result;
            } catch (e) {
                clearTimeout(timeoutId);
                throw e;
            }
        };

        try {
            const { data, error } = await fetchWithTimeout(
                client.from('anime_list').select('*').order('created_at', { ascending: false }),
                5000
            );
            if (!error) {
                animeData = data || [];
                if (window.AtmosphereAPI && window.AtmosphereAPI.refresh) {
                    window.AtmosphereAPI.refresh();
                }
                console.log('??鞈?????嚗', animeData.length, '蝑?);
                return animeData;
            }
        } catch (e) {
            console.warn('Supabase ?亥岷頞??仃?????單?蝷箸??', e.message);
        }

        // ???唳?蝷箸??        console.warn('雿輻瞍內?豢?');
        animeData = [...demoAnimeData];
        return animeData;
    } catch (e) {
        console.warn('?豢?頛憭望?嚗蝙?冽?蝷箸??', e.message);
        animeData = [...demoAnimeData];
        window.showToast('撌脣???Ｙ?瞍內璅∪?', 'warning');
        return animeData;
    }
};

/**
 * ACG ?嗉?摨思蜓蝔? v8.0.0
 * ?嚗????乓憛???撠?瞈整恣???圈?頛? * @version 8.0.0
 */
window.renderApp = (requestId = null) => {
    // 憒??喳鈭?requestId嚗?霅?臬?箸???    if (requestId !== null && requestId !== lastSwitchRequestId) {
        console.warn('?? renderApp 隢???嚗歲?葡??);
        return;
    }
    const app = document.getElementById('app');
    if (!app) return;

    // ??憟??憿
    const btnColor = optionsData.category_colors?.btn_bg || '#00d4ff';
    document.documentElement.style.setProperty('--btn-bg', btnColor);
    document.documentElement.style.setProperty('--btn-bg-alpha', btnColor + '22');

    const isAdminMode = document.querySelector('.admin-container') !== null;
    const isNotice = currentCategory === 'notice';

    // ???砍??踹??畾＊蝷?    let noticeHTML = '';
    if (isNotice) {
        noticeHTML = '<div id="discord-section" style="min-height: 400px; display: flex; align-items: center; justify-content: center;"><div style="color: var(--neon-cyan);">??頛銝?..</div></div>';
    }

    const filtered = window.getFilteredData();
    const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 蝣箔? CSS 霈?郊
    if (gridColumns !== 'mobile') {
        document.documentElement.style.setProperty('--grid-columns', gridColumns);
    }

    // ?湔蝟餌絞?嚗 body 撅斤?嚗?    let topControlBar = document.getElementById('topControlBar');
    if (!topControlBar) {
        topControlBar = document.createElement('div');
        topControlBar.id = 'topControlBar';
        document.body.appendChild(topControlBar);
    }
    topControlBar.style.cssText = `position: fixed !important; top: 50% !important; right: 20px !important; transform: translateY(-50%) !important; display: ${currentSection === 'admin' ? 'none' : 'flex'}; flex-direction: column; align-items: flex-end; z-index: 9999 !important;`;
    topControlBar.innerHTML = `
        <div style="display: flex; flex-direction: column; background: rgba(5, 15, 25, 0.5); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,212,255,0.2); backdrop-filter: blur(15px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); min-width: 160px; gap: 8px;">
            <select onchange="window.changeGridLayout(this.value)" style="width: 100%; background: rgba(0,212,255,0.05) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: #fff !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease; text-align: center; text-align-last: center;">
                ${[3, 4, 5].map(n => `<option value="${n}" ${gridColumns == n ? 'selected' : ''} style="background: var(--bg-dark);">${n} 甈?/option>`).join('')}
                <option value="mobile" ${gridColumns === 'mobile' ? 'selected' : ''} style="background: var(--bg-dark);">? 鞈??”</option>
            </select>
            <select onchange="window.changeSortOrder(this.value)" style="width: 100%; background: rgba(0,212,255,0.05) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: #fff !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease; text-align: center; text-align-last: center;">
                <option value="desc" ${sortOrder === 'desc' ? 'selected' : ''} style="background: var(--bg-dark);">??嚗??啣??/option>
                <option value="asc" ${sortOrder === 'asc' ? 'selected' : ''} style="background: var(--bg-dark);">??嚗????/option>
                <option value="name" ${sortOrder === 'name' ? 'selected' : ''} style="background: var(--bg-dark);">?迂嚗-Z</option>
            </select>
            <select onchange="window.changeCursorTheme(this.value)" style="width: 100%; background: rgba(176,38,255,0.1) !important; border: 1px solid rgba(176,38,255,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: #fff !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease; text-align: center; text-align-last: center;">
                <option value="bocchi" ${localStorage.getItem('cursorTheme') === 'bocchi' ? 'selected' : ''} style="background: var(--bg-dark);">? 瘜Ｗ? (BTR)</option>
                <option value="genshin" ${localStorage.getItem('cursorTheme') === 'genshin' ? 'selected' : ''} style="background: var(--bg-dark);">?? ??</option>
                <option value="furina" ${localStorage.getItem('cursorTheme') === 'furina' ? 'selected' : ''} style="background: var(--bg-dark);">? ?祐憡?/option>
                <option value="witch" ${localStorage.getItem('cursorTheme') === 'witch' ? 'selected' : ''} style="background: var(--bg-dark);">????儭?瘝?擳戊</option>
                <option value="standard" ${localStorage.getItem('cursorTheme') === 'standard' || !localStorage.getItem('cursorTheme') ? 'selected' : ''} style="background: var(--bg-dark);">?儭?璅?蝪∠?</option>
            </select>
            <select onchange="window.changeZoomLevel(this.value)" style="width: 100%; background: rgba(255,165,0,0.1) !important; border: 1px solid rgba(255,165,0,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: #ffa500 !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease; text-align: center; text-align-last: center;">
                <option value="50" ${zoomLevel === 50 ? 'selected' : ''} style="background: var(--bg-dark);">?? 50%</option>
                <option value="60" ${zoomLevel === 60 ? 'selected' : ''} style="background: var(--bg-dark);">?? 60%</option>
                <option value="75" ${zoomLevel === 75 ? 'selected' : ''} style="background: var(--bg-dark);">?? 75%</option>
                <option value="80" ${zoomLevel === 80 ? 'selected' : ''} style="background: var(--bg-dark);">?? 80%</option>
                <option value="90" ${zoomLevel === 90 ? 'selected' : ''} style="background: var(--bg-dark);">?? 90%</option>
                <option value="100" ${zoomLevel === 100 ? 'selected' : ''} style="background: var(--bg-dark);">?? 100%</option>
            </select>
            <select onchange="if(window.performanceOptimizer) window.performanceOptimizer.toggleLiteMode(this.value === 'true');" style="width: 100%; background: rgba(0,255,150,0.1) !important; border: 1px solid rgba(0,255,150,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: #fff !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease; text-align: center; text-align-last: center;">
                <option value="false" ${!document.body.classList.contains('lite-mode') ? 'selected' : ''} style="background: var(--bg-dark);">??擃?鞈芣葡??/option>
                <option value="true" ${document.body.classList.contains('lite-mode') ? 'selected' : ''} style="background: var(--bg-dark);">?? 頛??璅∪?</option>
            </select>
            <div style="height: 1px; background: rgba(0,212,255,0.2); margin: 4px 0;"></div>
            ${window.isAdminLoggedIn ? `
                <button onclick="window.toggleAdminMode(true)" style="width: 100%; background: rgba(0,212,255,0.1) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: var(--neon-cyan) !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease;">?? 敺蝞∠?</button>
                <button onclick="window.adminLogout()" style="width: 100%; background: rgba(255,68,68,0.1) !important; border: 1px solid rgba(255,68,68,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: #ff6b6b !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease;">? ?餃</button>
            ` : `
                <button onclick="window.showAdminLoginModal()" style="width: 100%; background: rgba(0,212,255,0.1) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: var(--neon-cyan) !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease;">?? ?餃</button>
            `}
            <div id="adminMenuOptions" style="display: flex; flex-direction: column; gap: 6px;"></div>
        </div>
    `;

    // 瑼Ｘ?臬撌脣???App 蝯?嚗???蝜芸???Input 憭勗?阡?
    const existingApp = document.querySelector('.app-container');
    if (existingApp && currentSection !== 'admin') {
        // ?湔???????        const categoryMap = { 'anime': '?', 'manga': '瞍怎', 'movie': '?餃蔣', 'notice': '?砍?' };
        document.querySelectorAll('.category-buttons-container .btn-primary').forEach(btn => {
            const btnText = btn.textContent.replace(/?s*/, '').trim();
            btn.classList.toggle('active', btnText === categoryMap[currentCategory]);
        });

        // ???砍?/蝬脫憿舐內
        const noticeContainer = document.getElementById('notice-container');
        const mainGridContent = document.getElementById('main-grid-content');
        // 靽格迤嚗earchInputContainer ??notice-container ??銝??撘?蝝?        const searchInputContainer = noticeContainer ? noticeContainer.previousElementSibling : null;

        if (isNotice) {
            if (noticeContainer) noticeContainer.style.display = 'block';
            if (mainGridContent) mainGridContent.style.display = 'none';
            if (searchInputContainer) searchInputContainer.style.display = 'none';
        } else {
            if (noticeContainer) noticeContainer.style.display = 'none';
            if (mainGridContent) mainGridContent.style.display = 'block';
            if (searchInputContainer) searchInputContainer.style.display = 'block';

            // ?湔???? (頝收???
            window.updateTopMarquee = () => {
                const marqueeContent = document.getElementById('top-marquee-content');
                if (marqueeContent) {
                    // ?芸??菜葫??啣??                    const announcements = window.announcementData?.announcements || [];
                    const latestAnn = announcements[0];
                    let annText = latestAnn ? `${latestAnn.title}嚗?{window.announcementSystem.parseContent(latestAnn.content).text}` : siteSettings.announcement;
                    annText = (annText || '').replace(/\n/g, ' '); // 頝收???閬?銵?
                    marqueeContent.style.animationDuration = `${Math.max(15, annText.length * 0.4)}s`;
                    marqueeContent.innerHTML = `? ${annText} &nbsp;&nbsp;&nbsp;&nbsp; ??${annText} &nbsp;&nbsp;&nbsp;&nbsp;`;
                }
            };
            window.updateTopMarquee();
            // ?湔蝬脫?批捆
            const gridContainer = document.getElementById('anime-grid-container');
            if (gridContainer) {
                gridContainer.className = `anime-grid ${gridColumns === 'mobile' ? 'force-mobile-layout' : ''}`;
                gridContainer.style.cssText = gridColumns === 'mobile'
                    ? 'display: flex; flex-direction: column; gap: 10px;'
                    : `display: grid; grid-template-columns: repeat(${gridColumns}, 1fr); gap: 20px;`;

                gridContainer.innerHTML = paged.length > 0
                    ? paged.map(item => window.renderCard(item)).join('')
                    : window.renderEmptyState('?芣?啁????, '?岫隤踵??璇辣');
            }

            // ?湔?? (?????
            const paginationContainers = document.querySelectorAll('#pagination-container, #pagination-top-container');
            const paginationHTML = window.renderPagination(filtered.length);
            paginationContainers.forEach(container => {
                if (container) container.innerHTML = paginationHTML;
            });
        }

        // ?湔 Admin Menu
        window.updateAdminMenu();

        // 蝣箔? loading ??
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }
        return; // 蝯?嚗??脰??券??鼓
    }

    // --- 擐活皜脫??? Admin ????摰皜脫? ---
    app.innerHTML = `
        <div class="app-container">
            <header class="app-header">
                <div style="display: flex; justify-content: center; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <h1 style="color: ${siteSettings.title_color || '#ffffff'}; text-shadow: 0 0 10px var(--neon-blue); margin-bottom: 8px;">
                        ${siteSettings.site_title} <span style="font-size: 14px; color: var(--text-secondary); margin-left: 10px;">v8.0.0</span>
                    </h1>
                </div>
            </header>
            <div class="category-buttons-container" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; position: relative; z-index: 100;">
                <button class="btn-primary ${currentCategory === 'notice' ? 'active' : ''}" onclick="window.switchCategory('notice')">???砍?</button>
                <button class="btn-primary ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">???</button>
                <button class="btn-primary ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">??瞍怎</button>
                <button class="btn-primary ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">???餃蔣</button>
            </div>
	            <div style="margin-bottom: 30px; display: ${isNotice ? 'none' : 'block'};">
	                <input type="text" id="search-input" class="search-ghost" placeholder="敹恍?撠???.." value="${filters.search}" oninput="window.handleSearch(this.value)">
	                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
	                    <div id="search-filters" class="horizontal-scroll-container" style="display: flex; gap: 12px; flex: 1; overflow-x: auto; overflow-y: hidden; padding: 8px 0; white-space: nowrap;">
	                        ${window.renderSearchSelectsHTML()}
	                    </div>
	                </div>
	            </div>
	            <div id="notice-container" style="display: ${isNotice ? 'block' : 'none'};">
	                ${noticeHTML}
	            </div>
	            <div id="main-grid-content" style="display: ${isNotice ? 'none' : 'block'};">
                    <div id="pagination-top-container" class="pagination-minimal" style="margin-bottom: 25px;">${window.renderPagination(filtered.length)}</div>
	                <div id="anime-grid-container" class="anime-grid ${gridColumns === 'mobile' ? 'force-mobile-layout' : ''}" style="display: ${gridColumns === 'mobile' ? 'flex' : 'grid'}; ${gridColumns === 'mobile' ? 'flex-direction: column; gap: 10px;' : `grid-template-columns: repeat(${gridColumns}, 1fr); gap: 20px;`}">
	                    ${paged.length > 0 ? paged.map(item => window.renderCard(item)).join('') : window.renderEmptyState('?芣?啁????, '?岫隤踵??璇辣')}
	                </div>
	                <div id="pagination-container" class="pagination-minimal" style="margin-top: 40px;">${window.renderPagination(filtered.length)}</div>
	            </div>
	        </div>
	    `;

    // ????遝頛芣???    window.initGlobalScroll();
    window.setupHorizontalScroll('.horizontal-scroll-container, .scroll-row-v35, .force-scroll');
    window.updateAdminMenu();
    if (typeof window.updateTopMarquee === 'function') window.updateTopMarquee();

    // 蝣箔?閰單?敶? HTML 摮
    if (!document.getElementById('detailModal')) {
        const modalHTML = `
	            <div id="detailModal" class="modal" onclick="if(event.target===this) window.closeAnimeDetail()">
	                <div class="modal-content">
	                    <button class="btn-primary" style="position: absolute; top: 20px; right: 20px; z-index: 1000; width: 40px; height: 40px; padding: 0;" onclick="window.closeAnimeDetail()">?</button>
	                    <div id="detailContent"></div>
	                </div>
	            </div>
	        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
        // 蝣箔??批捆摰孵摮
        const modal = document.getElementById('detailModal');
        if (!modal.querySelector('#detailContent')) {
            modal.querySelector('.modal-content').innerHTML = `
                    <button class="btn-primary" style="position: absolute; top: 20px; right: 20px; z-index: 1000; width: 40px; height: 40px; padding: 0;" onclick="window.closeAnimeDetail()">?</button>
                    <div id="detailContent"></div>
                `;
        }
    }

    // 敺孵?閫?捱??嚗摰寞葡????嚗＊蝷?app 銝衣宏?日蝵?    app.style.display = 'block';
    app.style.visibility = 'visible';
    app.style.opacity = '1';

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    // ?砍??踹?撘郊皜脫?
    if (isNotice && typeof window.renderAnnouncements === 'function') {
        const currentReqId = requestId || lastSwitchRequestId;
        setTimeout(async () => {
            // ?活瑼Ｘ隢??臬??
            if (currentReqId !== lastSwitchRequestId) return;

            const container = document.getElementById('discord-section');
            if (container) {
                container.innerHTML = window.renderAnnouncements();
                // 頛???批捆
                if (window.announcementSystem?.loadInitialContent) {
                    await window.announcementSystem.loadInitialContent();
                }
            }
        }, 100);
    }
};

// 皜脫??摩撌脤蝘餉 js/render.js




window.changePage = (p) => { currentPage = p; window.renderApp(lastSwitchRequestId); window.scrollTo({ top: 0, behavior: 'smooth' }); };
window.handleSearch = (val) => { filters.search = val; currentPage = 1; window.renderApp(lastSwitchRequestId); };

window.changeGridLayout = (n) => {
    if (n === 'mobile') {
        gridColumns = 'mobile';
    } else {
        const cols = parseInt(n);
        if ([3, 4, 5].includes(cols)) {
            gridColumns = cols;
            document.documentElement.style.setProperty('--grid-columns', cols);
        }
    }
    window.gridColumns = gridColumns;
    localStorage.setItem('gridColumns', gridColumns);
    window.renderApp();
};

window.changeSortOrder = (order) => {
    sortOrder = order;
    localStorage.setItem('sortOrder', sortOrder);
    currentPage = 1;
    window.renderApp();
};

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
                <option value="">${label}</option>
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
    const filtered = animeData.filter(item => {
        if (item.category !== currentCategory) return false;
        if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;

        for (const key in filters) {
            if (key === 'search' || !filters[key]) continue;

            if (key === 'genre') {
                if (!item.genre || !item.genre.includes(filters.genre)) return false;
            }
            else if (key.startsWith('custom_')) {
                if (!item.extra_data || item.extra_data[key] !== filters[key]) return false;
            }
            else {
                if (item[key] !== filters[key]) return false;
            }
        }
        return true;
    });

    return filtered.sort((a, b) => {
        if (sortOrder === 'name') {
            return a.name.localeCompare(b.name, 'zh-TW');
        }

        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        if (yearB !== yearA) return sortOrder === 'desc' ? yearB - yearA : yearA - yearB;

        const monthMap = { '1??: 1, '2??: 2, '3??: 3, '4??: 4, '5??: 5, '6??: 6, '7??: 7, '8??: 8, '9??: 9, '10??: 10, '11??: 11, '12??: 12 };
        const monthA = monthMap[a.month] || 0;
        const monthB = monthMap[b.month] || 0;
        return sortOrder === 'desc' ? monthB - monthA : monthA - monthB;
    });
};

window.switchCategory = async (cat) => {
    const requestId = ++lastSwitchRequestId;
    console.log('?? ??????', cat, '(ID:', requestId, ')');

    // 餈質馱?踹???
    if (typeof window.trackCategorySwitch === 'function') {
        window.trackCategorySwitch(cat);
    }

    currentCategory = cat;
    currentPage = 1;
    adminPage = 1;
    filters = { search: '', genre: '', year: '', rating: '', season: '', month: '', episodes: '' };

    // ?斗?桀??臬?典??唳芋撘?    const isAdminMode = document.querySelector('.admin-container') !== null;

    // 憒??臬???湔皜脫??嚗????唳芋撘?
    if (cat === 'notice') {
        currentSection = 'notice';
        window.renderApp(requestId);
        return;
    }

    // 憒??典??唳芋撘?靽?敺???銝????啣???    if (isAdminMode) {
        await window.loadData();
        // 瑼Ｘ隢??臬隞??
        if (requestId !== lastSwitchRequestId) return;
        window.renderAdmin();
        return;
    }

    // ?璅∪?
    currentSection = cat;

    // ?單??湔?????憿舐內?嗆? (銝?敺????
    const grid = document.getElementById('anime-grid-container');
    const mainContent = document.getElementById('main-grid-content');

    // 蝡?瑁?銝甈⊥葡?誑???單???
    window.renderApp(requestId);

    // 憒?撌脩????????敺?loadData ?餃? UI
    if (animeData.length > 0) {
        // ??唳郊?湔嚗??餃??桀??葡??        window.loadData(true).then(newData => {
            // 憒?隢????啁?嚗????湔?豢?銝阡??唳葡??憒??豢???嚗?            if (requestId === lastSwitchRequestId) {
                window.renderApp(requestId);
            }
        });
        return;
    }

    // ?芣??典??冽??豢???憿舐內頛銝凋蒂蝑?
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transition = 'opacity 0.3s ease';
    }
    if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: var(--neon-cyan); animation: pulse 1.5s ease-in-out infinite;">??甇??郊鞈?...</div>';

    await window.loadData();

    // 瑼Ｘ隢??臬隞??
    if (requestId !== lastSwitchRequestId) {
        console.warn('?? 隢?撌脤????暹?皜脫?:', requestId);
        return;
    }

    window.renderApp(requestId);
};

// ========== ???輻恣??==========
window.renderGuestbookAdmin = async () => {
    const messages = await window.loadGuestbookMessagesForAdmin();
    const pending = messages.filter(m => m.status === 'pending');
    const approved = messages.filter(m => m.status === 'approved');
    const rejected = messages.filter(m => m.status === 'rejected');

    return `
        <div id="guestbook-admin-container" style="display: flex; flex-direction: column; min-height: 100%; overflow-y: auto;">
            <div style="display: flex; gap: 15px; flex-wrap: wrap; flex-shrink: 0;">
                <div style="background: rgba(255,200,0,0.1); border: 1px solid rgba(255,200,0,0.3); border-radius: 8px; padding: 15px 20px;">
                    <div style="color: rgba(255,200,0,0.8); font-size: 24px; font-weight: bold;">${pending.length}</div>
                    <div style="color: var(--text-secondary); font-size: 12px;">敺祟??/div>
                </div>
                <div style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); border-radius: 8px; padding: 15px 20px;">
                    <div style="color: var(--neon-cyan); font-size: 24px; font-weight: bold;">${approved.length}</div>
                    <div style="color: var(--text-secondary); font-size: 12px;">撌脤?</div>
                </div>
                <div style="background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.3); border-radius: 8px; padding: 15px 20px;">
                    <div style="color: #ff4444; font-size: 24px; font-weight: bold;">${rejected.length}</div>
                    <div style="color: var(--text-secondary); font-size: 12px;">撌脫?蝯?/div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; border-bottom: 2px solid rgba(0,212,255,0.2); padding-bottom: 15px; flex-shrink: 0;">
                <button class="btn-primary ${window.currentGuestbookTab !== 'pending' ? '' : 'active'}" onclick="window.switchGuestbookTab('pending')">敺祟??(${pending.length})</button>
                <button class="btn-primary ${window.currentGuestbookTab !== 'approved' ? '' : 'active'}" onclick="window.switchGuestbookTab('approved')">撌脤? (${approved.length})</button>
                <button class="btn-primary ${window.currentGuestbookTab !== 'rejected' ? '' : 'active'}" onclick="window.switchGuestbookTab('rejected')">撌脫?蝯?(${rejected.length})</button>
            </div>
            
            <div id="guestbook-list" style="display: flex; flex-direction: column; gap: 12px; flex: 1; overflow-y: auto;">
                ${window.renderGuestbookList(messages)}
            </div>
        </div>
    `;
};

window.currentGuestbookTab = 'pending';

window.switchGuestbookTab = async (tab) => {
    window.currentGuestbookTab = tab;
    const messages = await window.loadGuestbookMessagesForAdmin();
    const list = document.getElementById('guestbook-list');
    if (list) list.innerHTML = window.renderGuestbookList(messages);
};

window.renderGuestbookList = (messages) => {
    const filtered = messages.filter(m => m.status === window.currentGuestbookTab);
    return filtered.length === 0 ? '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">?怎??</div>' :
        filtered.map(m => `
            <div style="background: rgba(0,212,255,0.03); border-radius: 8px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: var(--neon-cyan); font-weight: bold;">${escapeHtml(m.nickname)}</span>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--text-secondary); font-size: 12px;">${m.ip_address || '?芰IP'}</span>
                        <span style="color: var(--text-secondary); font-size: 12px;">${new Date(m.created_at).toLocaleString('zh-TW')}</span>
                    </div>
                </div>
                <div style="color: var(--text-secondary); margin-bottom: 10px; white-space: pre-wrap;">${escapeHtml(m.content)}</div>
                ${window.currentGuestbookTab === 'pending' ? `
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-primary" style="padding: 6px 12px; font-size: 12px;" onclick="window.moderateGuestbook('${m.id}', 'approved')">????</button>
                        <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; border-color: #ff4444; color: #ff4444;" onclick="window.moderateGuestbook('${m.id}', 'rejected')">????</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
};

window.loadGuestbookMessagesForAdmin = async () => {
    try {
        const client = window.supabaseManager?.getClient();
        if (!client) return [];
        const { data } = await client.from('guestbook_messages').select('*').order('created_at', { ascending: false }).limit(100);
        return data || [];
    } catch (err) {
        return [];
    }
};

window.moderateGuestbook = async (id, status) => {
    try {
        const client = window.supabaseManager?.getClient();
        await client.from('guestbook_messages').update({
            status,
            approved_by: siteSettings.admin_name || '蝞∠???,
            updated_at: new Date().toISOString()
        }).eq('id', id);
        window.showToast('??撌脰???);
        window.renderAdmin();
    } catch (err) {
        window.showToast('????憭望?', 'error');
    }
};

window.renderAdmin = () => {
    const app = document.getElementById('app');
    const filtered = animeData.filter(item => item.category === currentCategory);
    const paged = filtered.slice((adminPage - 1) * adminItemsPerPage, adminPage * adminItemsPerPage);

    // 閮??賊?蝞∠??遝??蝵?    const optionsWrapper = document.getElementById('optionsWrapper');
    const scrollLeft = optionsWrapper ? optionsWrapper.scrollLeft : 0;

    const adminHeaderBar = document.getElementById('adminHeaderBar');
    if (adminHeaderBar) {
        adminHeaderBar.style.display = 'none';
    }

    // 憒??芷?閬?啣摰孵???銝歇蝬? admin 獢
    const existingAdminContainer = document.querySelector('.admin-container');
    if (existingAdminContainer) {
        // ?芣?啣摰孵????踹??鼓撠???????憭?        const contentBody = document.querySelector('.admin-content-body');
        if (contentBody) {
            // ?寞??嗅? Tab ?皜脫??批捆
            contentBody.innerHTML = window.renderAdminContent(paged, filtered.length);

            // 憒??舫?恣???Ｗ儔皛曉?雿蔭
            const newOptionsWrapper = document.getElementById('optionsWrapper');
            if (newOptionsWrapper && scrollLeft > 0) {
                newOptionsWrapper.scrollLeft = scrollLeft;
            }

            // ?蝬?鈭辣
            window.initAdminEventListeners();
            return; // 蝯??賣嚗??瑁?摰??DOM ?鼓
        }
    }

    const adminTabs = [
        { id: 'manage', icon: '??', label: '雿?蝞∠?' },
        { id: 'add', icon: '??, label: '?啣?雿?' },
        { id: 'guestbook', icon: '?', label: '???? },
        { id: 'options', icon: '??', label: '?賊?蝞∠?' },
        { id: 'settings', icon: '??', label: '蝬脩?閮剖?' }
    ];

    // 蝞∠?敺?批捆皜脫??賣
    window.renderAdminContent = (pagedData, total) => {
        if (currentAdminTab === 'manage') {
            return `
                <div class="admin-section">
                    <div class="admin-section-header">
                        <div class="admin-category-tabs">
                            <button class="category-tab ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">? ?</button>
                            <button class="category-tab ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">?? 瞍怎</button>
                            <button class="category-tab ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">? ?餃蔣</button>
                        </div>
                        <div class="admin-actions">
                            <span class="data-count">??${total} 蝑???/span>
                            <button class="btn-secondary" onclick="window.exportCSV('${currentCategory}')">? ?臬</button>
                            <button class="btn-secondary" onclick="window.triggerImport('${currentCategory}')">? ?臬</button>
                        </div>
                    </div>
                    
                    <div class="admin-toolbar">
                        <div class="toolbar-left">
                            <button class="btn-danger" id="bulk-delete-btn" style="display: none;" onclick="window.bulkDeleteAnime()">
                                ?? ?芷?訾葉 (<span id="selected-count">0</span>)
                            </button>
                            <button class="btn-danger-outline" onclick="window.deleteAllInCategory()">
                                ?? ?芷?券
                            </button>
                        </div>
                    </div>
                    
                    <div class="admin-table-container">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th style="width: 50px;">
                                        <input type="checkbox" id="select-all" onchange="window.toggleSelectAll(this.checked)">
                                    </th>
                                    <th>雿??迂</th>
                                    <th>撟港遢</th>
                                    <th>摮?漲</th>
                                    <th>閰?</th>
                                    <th style="width: 180px;">??</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pagedData.map(item => `
                                    <tr>
                                        <td>
                                            <input type="checkbox" class="item-checkbox" data-id="${item.id}" onchange="window.updateBulkDeleteButton()">
                                        </td>
                                        <td class="item-name">${item.name}</td>
                                        <td>${item.year || '-'}</td>
                                        <td>${item.season || '-'}</td>
                                        <td><span class="rating-badge">${item.rating || '-'}</span></td>
                                        <td class="item-actions">
                                            <button class="btn-icon edit" onclick="window.editAnime('${item.id}')" title="蝺刻摩">??</button>
                                            <button class="btn-icon delete" onclick="window.deleteAnime('${item.id}')" title="?芷">??/button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="admin-pagination">
                        ${window.renderAdminPagination(total)}
                    </div>
                </div>
            `;
        } else if (currentAdminTab === 'add' || currentAdminTab === 'edit') {
            const item = editId ? animeData.find(a => a.id === editId) : {};
            return window.renderAnimeForm(item);
        } else if (currentAdminTab === 'options') {
            return window.renderOptionsManager();
        } else if (currentAdminTab === 'settings') {
            return `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; width: 100%; margin: 0 auto; padding-bottom: 50px;">
                    <div class="admin-panel-v492" style="background: rgba(0,212,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2);">
                        <h3 style="color: var(--neon-cyan); border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">?? 蝬脩??箸閮剖?</h3>
                        <div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">蝬脩?璅?</label><input type="text" id="set-title" value="${siteSettings.site_title}" style="width: 100%;" onclick="event.stopPropagation()" onfocus="event.stopPropagation()"></div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">璅?憿</label>
                            <div class="color-input-wrapper" style="width: 100%;">
                                <div class="color-swatch" style="background: ${siteSettings.title_color || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-title-color').click()"></div>
                                <input type="color" id="set-title-color" value="${siteSettings.title_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                            </div>
                        </div>
                        <div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">?砍??批捆</label><textarea id="set-announcement" style="width: 100%; height: 120px; resize: vertical;" onclick="event.stopPropagation()" onfocus="event.stopPropagation()">${siteSettings.announcement}</textarea></div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">?砍?憿</label>
                            <div class="color-input-wrapper" style="width: 100%;">
                                <div class="color-swatch" style="background: ${siteSettings.announcement_color || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-announcement-color').click()"></div>
                                <input type="color" id="set-announcement-color" value="${siteSettings.announcement_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                            </div>
                        </div>
                    </div>
        
                    <div class="admin-panel-v492" style="background: rgba(0,212,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2);">
                        <h3 style="color: var(--neon-cyan); border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">? 蝞∠??∪犖??/h3>
                        <div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">憿舐內?迂</label><input type="text" id="set-admin-name" value="${siteSettings.admin_name || '蝞∠???}" style="width: 100%;" onclick="event.stopPropagation()" onfocus="event.stopPropagation()"></div>
                        <div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">?剖?蝬脣?</label><input type="text" id="set-admin-avatar" value="${siteSettings.admin_avatar || ''}" style="width: 100%;" placeholder="https://..." onclick="event.stopPropagation()" onfocus="event.stopPropagation()"></div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">?迂憿</label>
                            <div class="color-input-wrapper" style="width: 100%;">
                                <div class="color-swatch" style="background: ${siteSettings.admin_color || '#00ffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-admin-color').click()"></div>
                                <input type="color" id="set-admin-color" value="${siteSettings.admin_color || '#00ffff'}" onchange="this.previousElementSibling.style.background = this.value">
                            </div>
                        </div>
                    </div>

                    <div class="admin-panel-v492" style="background: rgba(0,212,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2); grid-column: 1 / -1;">
                        <h3 style="color: var(--neon-cyan); border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">? ?∠?憿閮剖?</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                            <div>
                                <label style="font-size: 13px; color: var(--neon-cyan); display: block; margin-bottom: 8px;">雿??迂</label>
                                <div class="color-input-wrapper" style="width: 100%;">
                                    <div class="color-swatch" style="background: ${optionsData.category_colors?.name || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-name-color').click()"></div>
                                    <input type="color" id="set-name-color" value="${optionsData.category_colors?.name || '#ffffff'}" onchange="window.updateCategoryColorDirect('name', this.value); this.previousElementSibling.style.background = this.value">
                                </div>
                            </div>
                            <div>
                                <label style="font-size: 13px; color: var(--neon-cyan); display: block; margin-bottom: 8px;">蝪∩???</label>
                                <div class="color-input-wrapper" style="width: 100%;">
                                    <div class="color-swatch" style="background: ${optionsData.category_colors?.desc || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-desc-color').click()"></div>
                                    <input type="color" id="set-desc-color" value="${optionsData.category_colors?.desc || '#ffffff'}" onchange="window.updateCategoryColorDirect('desc', this.value); this.previousElementSibling.style.background = this.value">
                                </div>
                            </div>
                            <div>
                                <label style="font-size: 13px; color: var(--neon-cyan); display: block; margin-bottom: 8px;">??憿</label>
                                <div class="color-input-wrapper" style="width: 100%;">
                                    <div class="color-swatch" style="background: ${optionsData.category_colors?.btn_bg || '#00d4ff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-btn-color').click()"></div>
                                    <input type="color" id="set-btn-color" value="${optionsData.category_colors?.btn_bg || '#00d4ff'}" onchange="window.updateCategoryColorDirect('btn_bg', this.value); this.previousElementSibling.style.background = this.value">
                                </div>
                            </div>
                        </div>
                            </div>
                        </div>
                    </div>

                    <div class="admin-panel-v492" style="background: rgba(0,212,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2); grid-column: 1 / -1;">
                        <h3 style="color: var(--neon-cyan); border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">?儭???銝駁?閮剖?</h3>

                        <div style="display: flex; gap: 15px; flex-wrap: wrap;" id="cursor-theme-list">
                            ${(function () {
                    if (!window.CursorManager) return '<div style="color:red">蝟餌絞璅∠?頛銝?..</div>';
                    return window.CursorManager.getThemeList().map(theme =>
                        `<button class="btn-primary" onclick="window.CursorManager.apply('${theme.id}')" style="flex: 1; min-width: 120px;">${theme.name}</button>`
                    ).join('');
                })()}
                        </div>
                        <div style="margin-top: 10px; font-size: 12px; color: #888; text-align: center;">??敺?蝘餃?皛??亦???</div>
                    </div>

                    <div style="grid-column: 1 / -1; text-align: center; margin-top: 20px;">
                        <button class="btn-primary" style="width: 300px; padding: 20px; font-size: 18px; border-radius: 12px; box-shadow: 0 0 20px rgba(0,212,255,0.2);" onclick="window.saveSettings()">? ?脣???身摰?/button>
                    </div>
                </div>
            `;
        } else if (currentAdminTab === 'guestbook') {
            return `<div id="guestbook-admin-container" style="padding: 20px; text-align: center; color: var(--neon-cyan);">頛銝?..</div>
                    <script>
                        (function() {
                            window.renderGuestbookAdmin().then(function(html) {
                                var container = document.getElementById('guestbook-admin-container');
                                if (container) container.outerHTML = html;
                            });
                        })();
                    <\/script>`;
        }
        return '';
    };

    app.innerHTML = `
        <div class="admin-layout">
            <aside class="admin-sidebar">
                <div class="admin-sidebar-header">
                    <h2 style="font-family: 'Orbitron', sans-serif; color: var(--neon-cyan); margin: 0;">?? 蝞∠?敺</h2>
                </div>
                <nav class="admin-sidebar-nav">
                    ${adminTabs.map(tab => `
                        <button class="admin-nav-item ${currentAdminTab === tab.id ? 'active' : ''}" onclick="window.switchAdminTab('${tab.id}')">
                            <span class="nav-icon">${tab.icon}</span>
                            <span class="nav-label">${tab.label}</span>
                        </button>
                    `).join('')}
                </nav>
                <div class="admin-sidebar-footer">
                    <button class="admin-nav-item logout" onclick="window.toggleAdminMode(false)">
                        <span class="nav-icon">?抬?</span>
                        <span class="nav-label">餈??</span>
                    </button>
                </div>
            </aside>
            <main class="admin-main">
                <div class="admin-content-header">
                    <h1 style="font-family: 'Orbitron', sans-serif; color: var(--neon-cyan); margin: 0;">${adminTabs.find(t => t.id === currentAdminTab)?.label}</h1>
                    <div class="admin-breadcrumb">
                        <span>敺</span>
                        <span class="separator">/</span>
                        <span>${adminTabs.find(t => t.id === currentAdminTab)?.label}</span>
                    </div>
                </div>
                <div id="admin-content-body" class="admin-content-body">
                    ${currentAdminTab === 'guestbook' ? '<div id="guestbook-loading">頛銝?..</div>' : window.renderAdminContent(paged, filtered.length)}
                </div>
            </main>
        </div>
    `;

    // ???閬甇亥??亦?璅惜嚗?閮?選?
    if (currentAdminTab === 'guestbook') {
        const loadingDiv = document.getElementById('guestbook-loading');
        if (loadingDiv) {
            window.renderGuestbookAdmin().then(html => {
                loadingDiv.outerHTML = html;
            });
        }
    }

    // ?Ｗ儔皛曉?雿蔭
    if (currentAdminTab === 'options') {
        const newOptionsWrapper = document.getElementById('optionsWrapper');
        if (newOptionsWrapper) newOptionsWrapper.scrollLeft = scrollLeft;
    }

    window.initGlobalScroll();
};

window.switchAdminTab = (tab, id = null) => {
    currentAdminTab = tab;
    editId = id;
    // 憒??嗅?銝 admin 璅∪?嚗?? admin 璅∪?
    if (currentSection !== 'admin') {
        window.toggleAdminMode(true);
    } else {
        window.renderAdmin();
    }
};

window.renderAdminPagination = (total) => {
    const pages = Math.ceil(total / adminItemsPerPage);
    if (pages <= 1) return '';
    let btns = [];
    const maxVisible = 5;
    let start = Math.max(1, adminPage - 2);
    let end = Math.min(pages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    if (start > 1) {
        btns.push(`<button class="btn-primary" style="width: 40px; padding: 8px 0;" onclick="window.changeAdminPage(1)">1</button>`);
        if (start > 2) btns.push(`<span style="color: var(--neon-cyan); align-self: center; padding: 0 5px;">...</span>`);
    }
    for (let i = start; i <= end; i++) {
        btns.push(`<button class="btn-primary ${adminPage === i ? 'active' : ''}" style="width: 40px; padding: 8px 0;" onclick="window.changeAdminPage(${i})">${i}</button>`);
    }
    if (end < pages) {
        if (end < pages - 1) btns.push(`<span style="color: var(--neon-cyan); align-self: center; padding: 0 5px;">...</span>`);
        btns.push(`<button class="btn-primary" style="width: 40px; padding: 8px 0;" onclick="window.changeAdminPage(${pages})">${pages}</button>`);
    }
    return btns.join('');
};

window.renderOptionsManager = () => {
    const defaultKeys = ['genre', 'year', 'month', 'season', 'episodes', 'rating', 'recommendation'];
    const customKeys = optionsData.custom_lists || [];
    const allKeys = [...defaultKeys, ...customKeys];
    const categoryColors = optionsData.category_colors || {};
    const ratingColors = optionsData.rating_colors || {};

    return `
            <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
                <input type="text" id="new-list-name" placeholder="頛詨?啣?銵典?蝔?(憒? 頛?)" style="width: 250px; padding: 8px; border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; background: rgba(0,0,0,0.3); color: #fff;">
                <button class="btn-primary" onclick="window.addNewCustomList()">嚗??啣??”</button>
            </div>
            
            <div class="options-scroll-wrapper">
                <div style="min-width: 400px; flex: 1; display: flex; flex-direction: column; gap: 15px;">
                    <h3 style="color: var(--neon-cyan); margin: 0 0 10px 0;">?? ?賊??批捆蝞∠?</h3>
                    
                    ${allKeys.map(key => `
                        <div class="form-custom-list" style="background: rgba(0,212,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(0,212,255,0.15);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <strong style="color: var(--neon-cyan); font-size: 15px;">${key === 'genre' ? '憿?' :
            key === 'year' ? '撟港遢' :
                key === 'rating' ? '閰?' :
                    key === 'recommendation' ? '?刻摨? :
                        key === 'episodes' ? '?' :
                            key === 'season' ? '摮?漲' :
                                key === 'month' ? '?遢' :
                                    key === 'type' ? '憿' :
                                        siteSettings.custom_labels?.[key] || key
        }</strong>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 12px; color: var(--text-secondary);">璅惜??</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" value="${categoryColors[key] || '#00d4ff'}" oninput="window.updateCategoryColor('${key}', this.value, true)" onchange="window.updateCategoryColor('${key}', this.value)">
                                        <div class="color-swatch" style="background-color: ${categoryColors[key] || '#00d4ff'}; width: 18px; height: 18px;" onclick="this.previousElementSibling.click()"></div>
                                    </div>
                                    ${customKeys.includes(key) ? `<button class="btn-primary" onclick="window.deleteCustomList('${key}')" style="font-size: 11px; padding: 4px 8px; border-color: #ff4444; color: #ff4444; margin-left: 10px;">??/button>` : ''}
                                </div>
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${(optionsData[key] || []).map((opt, idx) => `
                                    <div id="opt-${key}-${idx}" style="display: flex; align-items: center; background: ${key === 'rating' && ratingColors[opt] ? ratingColors[opt] + '33' : 'rgba(0,212,255,0.1)'}; padding: 4px 8px; border-radius: 15px; border: 1px solid ${key === 'rating' && ratingColors[opt] ? ratingColors[opt] + '66' : 'rgba(0,212,255,0.2)'};">
                                        <span id="opt-text-${key}-${idx}" style="font-size: 13px; margin-right: 4px;">${opt}</span>
                                        <input type="text" id="opt-input-${key}-${idx}" value="${opt}" style="display: none; width: 80px; padding: 2px 6px; font-size: 12px; background: rgba(0,0,0,0.5); border: 1px solid var(--neon-cyan); border-radius: 4px; color: #fff;" onkeydown="window.handleOptionKeydown(event, '${key}', ${idx}, '${opt}')" onblur="window.handleOptionBlur('${key}', ${idx}, '${opt}')">
                                        
                                        ${key === 'rating' ? `
                                            <div class="color-input-wrapper" style="margin-left: 4px; margin-right: 4px;">
                                                <input type="color" value="${ratingColors[opt] || '#b026ff'}" oninput="window.updateRatingItemColor('${opt}', this.value, true)" onchange="window.updateRatingItemColor('${opt}', this.value)">
                                                <div class="color-swatch" style="background-color: ${ratingColors[opt] || '#b026ff'}; width: 12px; height: 12px; border-radius: 50%; border: none;" onclick="this.previousElementSibling.click()"></div>
                                            </div>
                                        ` : ''}

                                        <button class="btn-icon edit" onclick="window.editOption('${key}', ${idx}, '${opt}')" style="width: 24px; height: 24px; font-size: 12px; margin-left: ${key === 'rating' ? '2px' : '4px'};" title="蝺刻摩">??/button>
                                        <button class="btn-icon delete" onclick="window.deleteOptionItem('${key}', ${idx})" style="width: 24px; height: 24px; font-size: 12px; margin-left: 2px;" title="?芷">??/button>
                                    </div>
                                `).join('')}
                                <div style="display: flex; gap: 6px;">
                                    <input type="text" id="add-opt-${key}" placeholder="?啣?" style="font-size: 12px; padding: 4px 8px; width: 80px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; color: #fff;" onkeydown="if(event.key==='Enter')window.addOptionItem('${key}')">
                                    <button class="btn-primary" onclick="window.addOptionItem('${key}')" style="font-size: 11px; padding: 4px 8px;">嚗?/button>
                                    <button class="btn-primary" onclick="window.showBulkImportModal('${key}')" style="font-size: 11px; padding: 4px 8px; border-color: rgba(139,92,246,0.6); color: #c4b5fd;" title="?寥??臬">?? ?寥?</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}

                    <div class="form-custom-list" style="background: rgba(0,212,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(0,212,255,0.15);">
                        <div style="margin-bottom: 10px;"><strong style="color: var(--neon-cyan);">? ?嗡??典?憿閮剖?</strong></div>
                        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                             <div style="display: flex; align-items: center; gap: 8px;">
                                 <span style="font-size: 13px;">雿??迂?身??/span>
                                 <div class="color-input-wrapper">
                                    <input type="color" value="${categoryColors['name'] || '#ffffff'}" oninput="window.updateCategoryColor('name', this.value, true)" onchange="window.updateCategoryColor('name', this.value)">
                                    <div class="color-swatch" style="background-color: ${categoryColors['name'] || '#ffffff'}; width: 20px; height: 20px;" onclick="this.previousElementSibling.click()"></div>
                                </div>
                            </div>
                             <div style="display: flex; align-items: center; gap: 8px;">
                                 <span style="font-size: 13px;">????身??/span>
                                 <div class="color-input-wrapper">
                                    <input type="color" value="${categoryColors['btn_bg'] || '#00d4ff'}" oninput="window.updateCategoryColor('btn_bg', this.value, true)" onchange="window.updateCategoryColor('btn_bg', this.value)">
                                    <div class="color-swatch" style="background-color: ${categoryColors['btn_bg'] || '#00d4ff'}; width: 20px; height: 20px;" onclick="this.previousElementSibling.click()"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
};

// 蝺刻摩?賊??迂
window.editOption = (key, idx, oldValue) => {
    const textEl = document.getElementById(`opt-text-${key}-${idx}`);
    const inputEl = document.getElementById(`opt-input-${key}-${idx}`);

    if (inputEl.style.display === 'none') {
        inputEl.style.display = 'inline-block';
        inputEl.focus();
        inputEl.select();
        textEl.style.display = 'none';
    } else {
        inputEl.style.display = 'none';
        textEl.style.display = 'inline';
    }
};

// ??蝺刻摩獢?支?隞?window.handleOptionKeydown = (event, key, idx, oldValue) => {
    if (event.key === 'Enter') {
        window.saveOptionEdit(key, idx, oldValue);
    } else if (event.key === 'Escape') {
        const inputEl = document.getElementById(`opt-input-${key}-${idx}`);
        const textEl = document.getElementById(`opt-text-${key}-${idx}`);
        inputEl.style.display = 'none';
        textEl.style.display = 'inline';
    }
};

// ??蝺刻摩獢仃?餌暺?window.handleOptionBlur = (key, idx, oldValue) => {
    const inputEl = document.getElementById(`opt-input-${key}-${idx}`);
    if (inputEl.style.display !== 'none') {
        window.saveOptionEdit(key, idx, oldValue);
    }
};

// 摰?蝺刻摩?賊?
window.saveOptionEdit = async (key, idx, oldValue) => {
    const inputEl = document.getElementById(`opt-input-${key}-${idx}`);
    const newValue = inputEl.value.trim();
    const textEl = document.getElementById(`opt-text-${key}-${idx}`);

    if (!newValue || newValue === oldValue) {
        inputEl.style.display = 'none';
        textEl.style.display = 'inline';
        return;
    }

    // ?萄遣蝣箄?閬?
    const confirmId = 'confirm-modal-' + Date.now();
    const confirmHTML = `
            <div id="${confirmId}" style="
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.7);
                z-index: 999998;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: #0a0e1a;
                    border: 2px solid var(--neon-cyan);
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 400px;
                    text-align: center;
                    box-shadow: 0 0 30px rgba(0,212,255,0.3);
                ">
                    <div style="color: var(--neon-cyan); font-size: 16px; margin-bottom: 20px;">
                        蝣箏?閬???span style="color: #ff6b6b;">${oldValue}</span>??箝?span style="color: #00ff88;">${newValue}</span>??嚗?br>
                        <span style="color: rgba(255,255,255,0.6); font-size: 13px;">??蝙?具?{oldValue}??雿??賣??芸??湔</span>
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button id="${confirmId}-cancel" class="btn-danger-outline">??</button>
                        <button id="${confirmId}-ok" class="btn-primary">蝣箏?</button>
                    </div>
                </div>
            </div>
        `;
    document.body.insertAdjacentHTML('beforeend', confirmHTML);

    // 蝑? DOM ?湔敺?蝬?鈭辣
    await new Promise(resolve => setTimeout(resolve, 10));

    const confirmModal = document.getElementById(confirmId);
    const okBtn = document.getElementById(`${confirmId}-ok`);
    const cancelBtn = document.getElementById(`${confirmId}-cancel`);

    if (!okBtn || !cancelBtn) {
        console.error('蝣箄?閬????芣??);
        return;
    }

    // 蝬?????
    cancelBtn.onclick = () => {
        confirmModal.remove();
        inputEl.style.display = 'none';
        textEl.style.display = 'inline';
    };

    // 蝬?蝣箏??? - ???湔
    okBtn.onclick = async () => {
        confirmModal.remove();
        inputEl.style.display = 'none';
        textEl.style.display = 'inline';

        // ?萄遣?脣漲?
        const progressId = 'progress-modal-' + Date.now();
        const progressHTML = `
                <div id="${progressId}" style="
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    z-index: 999999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                ">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 3px solid rgba(0,212,255,0.2);
                        border-top-color: var(--neon-cyan);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <div style="color: var(--neon-cyan); font-size: 18px;">?湔銝剛?蝔?...</div>
                    <div id="${progressId}-status" style="
                        color: rgba(0,212,255,0.7);
                        font-size: 14px;
                        min-width: 120px;
                        text-align: center;
                    ">0 / 0</div>
                </div>
            `;
        document.body.insertAdjacentHTML('beforeend', progressHTML);

        // 瘛餃????
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);

        const updateProgress = (current, total) => {
            const statusEl = document.getElementById(`${progressId}-status`);
            if (statusEl) {
                statusEl.textContent = `${current} / ${total}`;
            }
        };

        try {
            // 1. ?湔?賊??”銝剔??迂
            if (!optionsData[key]) {
                optionsData[key] = [];
            }
            const optionsList = optionsData[key];
            const optIndex = optionsList.indexOf(oldValue);
            if (optIndex > -1) {
                optionsList[optIndex] = newValue;
            }

            // 2. ?湔鞈?摨思葉??options_data
            const client = window.supabaseManager?.getClient();
            if (client) {
                try {
                    await client.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) });
                } catch (dbErr) {
                    console.warn('?脣? options_data 憭望?:', dbErr);
                }
            }

            // 3. ?湔??蝙?刻府璅惜????            if (client) {
                try {
                    const isGenre = key === 'genre';
                    const selectFields = isGenre ? 'id, genre' : `id, ${key}`;

                    const { data: items, error: selectError } = await client.from('anime_list').select(selectFields);
                    if (selectError) throw selectError;

                    const totalItems = items?.length || 0;
                    let updatedCount = 0;

                    updateProgress(0, totalItems);

                    for (let i = 0; i < (items?.length || 0); i++) {
                        const item = items[i];
                        if (isGenre) {
                            if (item.genre && Array.isArray(item.genre)) {
                                const newGenre = item.genre.map(g => g === oldValue ? newValue : g);
                                if (newGenre.join(',') !== item.genre.join(',')) {
                                    await client.from('anime_list').update({ genre: newGenre }).eq('id', item.id);
                                    updatedCount++;
                                }
                            }
                        } else {
                            const currentValue = item[key];
                            if (currentValue === oldValue) {
                                await client.from('anime_list').update({ [key]: newValue }).eq('id', item.id);
                                updatedCount++;
                            }
                        }
                        updateProgress(i + 1, totalItems);
                    }

                    // 撱園霈蝙?刻??啣???                    await new Promise(r => setTimeout(r, 300));

                    // 蝘駁?脣漲?
                    const progressEl = document.getElementById(progressId);
                    if (progressEl) progressEl.remove();
                    style.remove();

                    window.showToast(`??撌脫?啜?{oldValue}????{newValue}????${updatedCount} ???);
                } catch (updateErr) {
                    console.warn('?湔雿?憭望?:', updateErr);
                    const progressEl = document.getElementById(progressId);
                    if (progressEl) progressEl.remove();
                    style.remove();
                    window.showToast('???賊?撌脫?堆?雿??湔憭望?嚗?);
                }
            } else {
                const progressEl = document.getElementById(progressId);
                if (progressEl) progressEl.remove();
                style.remove();
                window.showToast('??撌脫?圈???Ｙ?璅∪?嚗?);
            }

            // ?頛鞈?銝血??            try {
                await window.loadData();
            } catch (loadErr) {
                console.warn('loadData 憭望?:', loadErr);
            }
            window.renderAdmin();

        } catch (err) {
            console.error('?湔?賊?憭望?:', err);
            const progressEl = document.getElementById(progressId);
            if (progressEl) progressEl.remove();
            style.remove();
            window.showToast('???湔憭望?嚗? + (err.message || err), 'error');
        }
    };
};



window.addNewCustomList = async () => {
    const input = document.getElementById('new-list-name');
    const name = input.value.trim();
    if (!name) return window.showToast('??隢撓?亙?銵典?蝔?, 'error');

    const key = 'custom_' + Date.now();
    if (!optionsData.custom_lists) optionsData.custom_lists = [];
    optionsData.custom_lists.push(key);
    optionsData[key] = [];

    if (!siteSettings.custom_labels) siteSettings.custom_labels = {};
    siteSettings.custom_labels[key] = name;

    input.value = '';
    await window.saveOptionsToDB();

    const client = window.supabaseManager?.getClient();
    if (client) {
        await client.from('site_settings').upsert({ id: 'custom_labels', value: JSON.stringify(siteSettings.custom_labels) });
    }

    window.renderAdmin();
};

window.deleteCustomList = async (key) => {
    if (!confirm('蝣箏?閬?斗迨?”???賊?閮剖?撠?瘨仃??)) return;
    optionsData.custom_lists = optionsData.custom_lists.filter(k => k !== key);
    delete optionsData[key];
    await window.saveOptionsToDB();
    window.renderAdmin();
};

window.updateCategoryColor = async (key, color) => {
    if (!optionsData.category_colors) optionsData.category_colors = {};
    optionsData.category_colors[key] = color;
    // 蝡?湔憿舐內
    const input = document.activeElement;
    if (input && input.nextElementSibling && input.nextElementSibling.classList.contains('color-swatch')) {
        input.nextElementSibling.style.backgroundColor = color;
    }
    await window.saveOptionsToDB(true); // Skip render
};

window.updateRatingColor = async (rating, color) => {
    if (!optionsData.rating_colors) optionsData.rating_colors = {};
    optionsData.rating_colors[rating] = color;
    // 蝡?湔憿舐內嚗?啗?? + 璅惜?
    const input = document.activeElement;
    if (input && input.nextElementSibling && input.nextElementSibling.classList.contains('color-swatch')) {
        input.nextElementSibling.style.backgroundColor = color;
    }
    // ?湔璅惜摰孵???臬?????    const tagDiv = input?.closest('[id^="opt-rating-"]');
    if (tagDiv) {
        tagDiv.style.background = color + '33';
        tagDiv.style.borderColor = color + '66';
    }
    await window.saveOptionsToDB(true);
};


// 雿?銵典皜脫??賣 - ?湔?雿???window.renderAnimeForm = (item = {}) => {
    const isEdit = !!item.id;
    const genres = Array.isArray(item.genre) ? item.genre : [];
    const extraData = item.extra_data || {};

    return `
            <div class="admin-section">
                <div class="admin-section-header" style="margin-bottom: 15px;">
                    <h3 style="color: var(--neon-cyan); margin: 0;">${isEdit ? '?? 蝺刻摩雿?' : '???啣?雿?'}</h3>
                    <button class="btn-primary" onclick="window.switchAdminTab('manage')">??餈?</button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 11px; color: var(--neon-cyan);">雿??迂</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" id="form-name" value="${item.name || ''}" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 14px; font-weight: bold;">
                        <button onclick="window.autoCompleteAnimeData()" class="btn-primary" style="white-space: nowrap; padding: 8px 16px; font-size: 13px; background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2)); border-color: rgba(139,92,246,0.6); color: #c4b5fd;">??鋆鞈?</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start;">
                    
                    <!-- 撌行?嚗惇?扯身摰?-->
                    <div style="display: flex; flex-direction: column; gap: 12px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(0,212,255,0.1);">
                        <div style="color: var(--neon-cyan); font-size: 12px; border-bottom: 1px solid rgba(0,212,255,0.2); padding-bottom: 5px; margin-bottom: 5px;">?箸撅祆?/div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">??</label>
                                <select id="form-category" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="anime" ${item.category === 'anime' ? 'selected' : ''}>?</option>
                                    <option value="manga" ${item.category === 'manga' ? 'selected' : ''}>瞍怎</option>
                                    <option value="movie" ${item.category === 'movie' ? 'selected' : ''}>?餃蔣</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">撟港遢</label>
                                <select id="form-year" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="">-</option>
                                    ${(optionsData.year || []).map(y => `<option value="${y}" ${item.year === y ? 'selected' : ''}>${y}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">摮?漲</label>
                                <select id="form-season" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="">-</option>
                                    ${(optionsData.season || []).map(s => `<option value="${s}" ${item.season === s ? 'selected' : ''}>${s}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">?遢</label>
                                <select id="form-month" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="">-</option>
                                    ${(optionsData.month || []).map(m => `<option value="${m}" ${item.month === m ? 'selected' : ''}>${m}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">?</label>
                                <input type="text" id="form-episodes" value="${item.episodes || ''}" placeholder="12" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="font-size: 11px; color: var(--neon-purple);">閰?</label>
                                <select id="form-rating" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--neon-purple); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="">-</option>
                                    ${(optionsData.rating || []).map(r => `<option value="${r}" ${item.rating === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 11px; color: var(--neon-cyan);">?刻摨?/label>
                                <select id="form-recommendation" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="">-</option>
                                    ${(optionsData.recommendation || []).map(r => `<option value="${r}" ${item.recommendation === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        ${(optionsData.custom_lists || []).length > 0 ? `
                            <div style="color: var(--neon-cyan); font-size: 12px; border-bottom: 1px solid rgba(0,212,255,0.2); padding-bottom: 5px; margin-top: 5px; margin-bottom: 5px;">?芾??賊?</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 300px; overflow-y: auto; padding-right: 5px; margin-bottom: 10px;">
                                ${(optionsData.custom_lists || []).map(key => `
                                    <div>
                                        <label style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${siteSettings.custom_labels?.[key] || key}</label>
                                        <select class="form-custom-list" data-key="${key}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                            <option value="">-</option>
                                            ${(optionsData[key] || []).map(opt => `<option value="${opt}" ${extraData[key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                                        </select>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        <div style="color: var(--neon-cyan); font-size: 12px; border-bottom: 1px solid rgba(0,212,255,0.2); padding-bottom: 5px; margin-top: 5px; margin-bottom: 5px;">憿閮剖?</div>
                        <div style="display: flex; gap: 15px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="color" id="form-name-color" value="${item.name_color || '#ffffff'}" style="width: 24px; height: 24px; border: none; padding: 0; background: none; cursor: pointer;">
                                <span style="font-size: 11px; color: #aaa;">?迂</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="color" id="form-star-color" value="${item.star_color || '#ffcc00'}" style="width: 24px; height: 24px; border: none; padding: 0; background: none; cursor: pointer;">
                                <span style="font-size: 11px; color: #aaa;">??</span>
                            </div>
                        </div>
                    </div>

                    <!-- ?單?嚗摰寧楊頛?-->
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div>
                            <label style="font-size: 11px; color: var(--neon-cyan);">瘚瑕蝬脣?</label>
                            <input type="text" id="form-poster" value="${item.poster_url || ''}" placeholder="https://..." style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 8px; color: #fff; font-size: 13px;">
                        </div>

                        <div>
                            <label style="font-size: 11px; color: var(--neon-cyan);">YouTube PV 敶梁?</label>
                            <input type="text" id="form-youtube" value="${item.youtube_url || ''}" placeholder="https://www.youtube.com/watch?v=..." style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 8px; color: #fff; font-size: 13px;">
                            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 4px;">?舀 YouTube 蝬脣??澆?</div>
                        </div>

                        <div>
                            <label style="font-size: 11px; color: var(--neon-cyan);">憿?璅惜</label>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 6px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px solid rgba(0,212,255,0.2); max-height: 120px; overflow-y: auto;">
                                ${(optionsData.genre || []).map(g => {
        const isChecked = genres.includes(g);
        return `<label style="display: flex; align-items: center; gap: 4px; cursor: pointer; padding: 4px 8px; background: ${isChecked ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)'}; border-radius: 4px; border: 1px solid ${isChecked ? 'var(--neon-cyan)' : 'rgba(0,212,255,0.2)'}; transition: all 0.2s;">
                                        <input type="checkbox" name="form-genre" value="${g}" ${isChecked ? 'checked' : ''} style="width: 12px; height: 12px;">
                                        <span style="font-size: 11px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${g}</span>
                                    </label>`;
    }).join('')}
                            </div>
                        <div>
                            <label style="font-size: 11px; color: var(--neon-cyan);">雿?蝪∩?</label>
                            <textarea id="form-desc" rows="12" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 10px; color: #fff; font-size: 13px; line-height: 1.5; resize: vertical;">${item.description || ''}</textarea>
                        </div>

                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                <label style="font-size: 11px; color: var(--neon-cyan);">?賊????</label>
                                <button class="btn-primary" onclick="window.addLinkRow()" style="font-size: 10px; padding: 2px 8px; height: 24px;">嚗??啣????</button>
                            </div>
                            <div id="links-list" style="display: flex; flex-direction: column; gap: 8px;">
                                ${(item.links || []).map(link => `
                                    <div style="display: flex; gap: 8px;">
                                        <input type="text" placeholder="?迂" class="link-name" value="${link.name || ''}" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 12px;">
                                        <input type="text" placeholder="蝬脣?" class="link-url" value="${link.url || ''}" style="flex: 3; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 12px;">
                                        <button class="btn-icon delete" style="width: 30px; height: 30px;" onclick="this.parentElement.remove()">??/button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: center; border-top: 1px solid rgba(0,212,255,0.1); padding-top: 20px;">
                    <button onclick="window.saveAnime()" style="background: rgba(0,212,255,0.2); border: 1px solid var(--neon-cyan); border-radius: 6px; padding: 10px 50px; color: var(--neon-cyan); cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(0,212,255,0.2);">
                        ? ${isEdit ? '?脣?霈' : '?啣?雿?'}
                    </button>
                </div>
            </div>
        `;
};

// ============================================================================
// Jikan API ?芸?鋆?
// ============================================================================

/**
 * 銝餃????芸?鋆?憤鞈?
 */
window.autoCompleteAnimeData = async () => {
    const nameEl = document.getElementById('form-name');
    const name = nameEl?.value?.trim();
    if (!name) return window.showToast('??隢?頛詨雿??迂', 'error');

    // 憿舐內?? Modal嚗?憛思???蝔?    window.showJikanSearchModal(name);
};

/**
 * 憿舐內 Jikan ?? Modal
 */
window.showJikanSearchModal = (defaultQuery) => {
    const existing = document.getElementById('jikan-search-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'jikan-search-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(5px);';
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #0a0e1a, #1a1e2e); border: 1px solid rgba(139,92,246,0.4); border-radius: 12px; width: 90%; max-width: 700px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 0 40px rgba(139,92,246,0.2);">
            <div style="padding: 20px; border-bottom: 1px solid rgba(139,92,246,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="color: #c4b5fd; margin: 0; font-size: 16px;">??MAL 鞈?鋆</h3>
                    <button onclick="document.getElementById('jikan-search-modal')?.remove()" style="background:none;border:none;color:#aaa;font-size:20px;cursor:pointer;">??/button>
                </div>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="jikan-search-input" value="${defaultQuery}" placeholder="頛詨?交????蝔望?撠???雿? style="flex:1;background:rgba(0,0,0,0.4);border:1px solid rgba(139,92,246,0.3);border-radius:6px;padding:10px;color:#fff;font-size:14px;" onkeydown="if(event.key==='Enter')window.executeJikanSearch()">
                    <button onclick="window.executeJikanSearch()" class="btn-primary" style="padding:10px 20px;border-color:rgba(139,92,246,0.6);color:#c4b5fd;">?? ??</button>
                </div>
                <div style="font-size: 11px; color: #888; margin-top: 6px;">? ?內嚗蝙?冽???望??迂??皞Ⅱ摨行擃?靘??ujutsu Kaisen????銵艘?啜?/div>
            </div>
            <div id="jikan-results" style="flex:1;overflow-y:auto;padding:15px;">
                <div style="text-align:center;color:#888;padding:30px;">頛詨?摮???撠?/div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // ?芸?????
    window.executeJikanSearch();
};

/**
 * 瑼Ｘ?臬?銝剜?摮?
 */
window._containsChinese = (text) => /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);

/**
 * 雿輻 Google Translate 撠葉?蕃霅舐?望?
 */
window._translateToEnglish = async (text) => {
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-TW&tl=en&dt=t&q=${encodeURIComponent(text)}`);
        if (!res.ok) return null;
        const json = await res.json();
        // Google Translate ??澆?: [[["translated text","original text",...],...],...]
        return json?.[0]?.map(s => s[0]).join('') || null;
    } catch (err) {
        console.warn('[蝧餉陌] 蝧餉陌憭望?:', err);
        return null;
    }
};

/**
 * ?? Jikan API 銝血?? */
window._searchJikan = async (query, limit = 10) => {
    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true`);
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
};

/**
 * ?瑁? Jikan API ??嚗?港葉??蕃霅荔?
 */
window.executeJikanSearch = async () => {
    const input = document.getElementById('jikan-search-input');
    const resultsDiv = document.getElementById('jikan-results');
    const query = input?.value?.trim();
    if (!query || !resultsDiv) return;

    resultsDiv.innerHTML = '<div style="text-align:center;color:var(--neon-cyan);padding:30px;"><div style="font-size:24px;margin-bottom:10px;">??/div>??銝?..</div>';

    try {
        let data = [];
        let translatedQuery = null;

        if (window._containsChinese(query)) {
            // 銝剜?頛詨: 蝧餉陌敺?撠?            resultsDiv.innerHTML = '<div style="text-align:center;color:var(--neon-cyan);padding:30px;"><div style="font-size:24px;margin-bottom:10px;">??</div>蝧餉陌銝?..</div>';
            translatedQuery = await window._translateToEnglish(query);

            if (translatedQuery) {
                resultsDiv.innerHTML = `<div style="text-align:center;color:var(--neon-cyan);padding:30px;"><div style="font-size:24px;margin-bottom:10px;">??/div>隞乓?{translatedQuery}??撠葉...</div>`;
                // ???典???蝧餉陌??嚗?雿萄??                const [translatedResults, originalResults] = await Promise.all([
                    window._searchJikan(translatedQuery, 8),
                    window._searchJikan(query, 5)
                ]);

                // ?蔥?駁?嚗誑 mal_id ?粹嚗?                const seen = new Set();
                data = [...translatedResults, ...originalResults].filter(item => {
                    if (seen.has(item.mal_id)) return false;
                    seen.add(item.mal_id);
                    return true;
                });
            } else {
                // 蝧餉陌憭望?嚗?典???
                data = await window._searchJikan(query);
            }
        } else {
            // ?葉???湔??
            data = await window._searchJikan(query);
        }

        if (data.length === 0) {
            resultsDiv.innerHTML = '<div style="text-align:center;color:#ff6b6b;padding:30px;">?曆??啁???隢?閰血隞??萄?</div>';
            return;
        }

        // 憿舐內蝧餉陌?內
        const translateInfo = translatedQuery
            ? `<div style="padding:8px 12px;margin-bottom:10px;background:rgba(139,92,246,0.1);border-radius:6px;font-size:12px;color:#c4b5fd;">?? 撌脰?蕃霅荔???{query}????{translatedQuery}??/div>`
            : '';

        resultsDiv.innerHTML = translateInfo + data.map((item, i) => {
            const title = item.title || '';
            const titleJp = item.title_japanese || '';
            const year = item.year || item.aired?.prop?.from?.year || '?';
            const score = item.score ? `潃?${item.score}` : '';
            const eps = item.episodes ? `${item.episodes} ? : '';
            const type = item.type || '';
            const poster = item.images?.jpg?.small_image_url || '';
            const status = item.status === 'Currently Airing' ? '? ?暸葉' : (item.status === 'Finished Airing' ? '? 撌脣?蝯? : '');

            return `
                <div onclick="window.applyJikanData(${i})" style="display:flex;gap:12px;padding:12px;border-radius:8px;cursor:pointer;border:1px solid rgba(139,92,246,0.15);margin-bottom:8px;transition:all 0.2s;background:rgba(0,0,0,0.2);" onmouseover="this.style.background='rgba(139,92,246,0.15)';this.style.borderColor='rgba(139,92,246,0.5)'" onmouseout="this.style.background='rgba(0,0,0,0.2)';this.style.borderColor='rgba(139,92,246,0.15)'">
                    <img src="${poster}" alt="" style="width:50px;height:70px;object-fit:cover;border-radius:4px;flex-shrink:0;background:#1a1a2e;">
                    <div style="flex:1;min-width:0;">
                        <div style="color:#e2e8f0;font-weight:bold;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
                        <div style="color:#888;font-size:11px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${titleJp}</div>
                        <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
                            <span style="font-size:11px;color:#c4b5fd;background:rgba(139,92,246,0.15);padding:2px 6px;border-radius:3px;">${type}</span>
                            <span style="font-size:11px;color:#94a3b8;">${year}</span>
                            ${eps ? `<span style="font-size:11px;color:#94a3b8;">${eps}</span>` : ''}
                            ${score ? `<span style="font-size:11px;color:#fbbf24;">${score}</span>` : ''}
                            ${status ? `<span style="font-size:11px;">${status}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // ?脣???蝯?隞乩??豢??蝙??        window._jikanSearchResults = data;
    } catch (err) {
        console.error('[Jikan] ??憭望?:', err);
        resultsDiv.innerHTML = `<div style="text-align:center;color:#ff6b6b;padding:30px;">??憭望?: ${err.message}</div>`;
    }
};

/**
 * 敺?Bangumi嚗蝯??恬???銝剜?蝪∩?
 */
window._fetchBangumiSummary = async (jaTitle) => {
    try {
        const res = await fetch(`https://api.bgm.tv/search/subject/${encodeURIComponent(jaTitle)}?type=2&responseGroup=large&max_results=3`);
        if (!res.ok) return null;
        const json = await res.json();
        const list = json.list || [];
        if (list.length === 0) return null;
        // ?洵銝蝑??? summary
        return list[0].summary || null;
    } catch (err) {
        console.warn('[Bangumi] ??蝪∩?憭望?:', err);
        return null;
    }
};

/**
 * 蝪⊿?銝剜? ??蝜?銝剜?
 */
window._simplifiedToTraditional = async (text) => {
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=zh-TW&dt=t&q=${encodeURIComponent(text)}`);
        if (!res.ok) return text;
        const json = await res.json();
        return json?.[0]?.map(s => s[0]).join('') || text;
    } catch {
        return text; // 頧?憭望????喳???    }
};

/**
 * 撠?Jikan API 鞈?憛怠銵典嚗鋆蝛箇甈?嚗? * 蝪∩?靘?嚗angumi嚗?擃葉????憒??望???
 */
window.applyJikanData = async (index) => {
    const item = window._jikanSearchResults?.[index];
    if (!item) return;

    // ?? Modal
    document.getElementById('jikan-search-modal')?.remove();
    window.showToast('??甇?鋆鞈?...', 'info');

    let filledCount = 0;
    const animeName = document.getElementById('form-name')?.value?.trim() || item.title;

    // 瘚瑕 (?芸蝛箇?‵??
    const posterEl = document.getElementById('form-poster');
    if (posterEl && !posterEl.value) {
        posterEl.value = item.images?.jpg?.large_image_url || '';
        if (posterEl.value) filledCount++;
    }

    // YouTube PV (?芸蝛箇?‵??
    const ytEl = document.getElementById('form-youtube');
    if (ytEl && !ytEl.value && item.trailer?.embed_url) {
        const embedUrl = item.trailer.embed_url;
        const vidMatch = embedUrl.match(/embed\/([^?]+)/);
        ytEl.value = vidMatch ? `https://www.youtube.com/watch?v=${vidMatch[1]}` : embedUrl;
        filledCount++;
    }

    // ? (?芸蝛箇?‵??
    const epsEl = document.getElementById('form-episodes');
    if (epsEl && !epsEl.value && item.episodes) {
        epsEl.value = String(item.episodes);
        filledCount++;
    }

    // 蝪∩? (?芸蝛箇?‵?? - ?芸?雿輻 Bangumi 銝剜?蝪∩?
    const descEl = document.getElementById('form-desc');
    if (descEl && !descEl.value) {
        let description = '';

        // 1. ?岫敺?Bangumi ??銝剜?蝪∩?
        const jaTitle = item.title_japanese || item.title;
        if (jaTitle) {
            try {
                const bangumiSummary = await window._fetchBangumiSummary(jaTitle);
                if (bangumiSummary && bangumiSummary.length > 20) {
                    // 蝪⊿? ??蝜?
                    description = await window._simplifiedToTraditional(bangumiSummary);
                }
            } catch (err) {
                console.warn('[鋆] Bangumi ??憭望?, 雿輻??寞?:', err);
            }
        }

        // 2. ??Bangumi 瘝?嚗?望???
        if (!description && item.synopsis) {
            description = item.synopsis.replace(/\s*\[Written by MAL Rewrite\]\s*/g, '').trim();
        }

        if (description) {
            descEl.value = description;
            filledCount++;
        }
    }

    // 撟港遢 (?芸?芷??憛怠)
    const yearEl = document.getElementById('form-year');
    const apiYear = item.year || item.aired?.prop?.from?.year;
    if (yearEl && !yearEl.value && apiYear) {
        const yearStr = String(apiYear);
        const yearOpt = Array.from(yearEl.options).find(o => o.value === yearStr);
        if (yearOpt) {
            yearEl.value = yearStr;
            filledCount++;
        }
    }

    // 摮?漲 (?芸?芷??憛怠)
    const seasonEl = document.getElementById('form-season');
    if (seasonEl && !seasonEl.value && item.season) {
        const seasonMap = { 'winter': '??, 'spring': '??, 'summer': '憭?, 'fall': '蝘? };
        const seasonCN = seasonMap[item.season];
        if (seasonCN) {
            const seasonOpt = Array.from(seasonEl.options).find(o => o.value === seasonCN || o.value.includes(seasonCN));
            if (seasonOpt) {
                seasonEl.value = seasonOpt.value;
                filledCount++;
            }
        }
    }

    // ?遢 (?芸?芷??憛怠)
    const monthEl = document.getElementById('form-month');
    const apiMonth = item.aired?.prop?.from?.month;
    if (monthEl && !monthEl.value && apiMonth) {
        const monthStr = String(apiMonth);
        const monthOpt = Array.from(monthEl.options).find(o => o.value === monthStr || o.value === `${apiMonth}?);
        if (monthOpt) {
            monthEl.value = monthOpt.value;
            filledCount++;
        }
    }

    // 憿?璅惜 (?芸??暸?寥???genre)
    const genreCheckboxes = document.querySelectorAll('input[name="form-genre"]');
    if (genreCheckboxes.length > 0 && item.genres?.length > 0) {
        // MAL ?望? ??銝剜???
        const genreMap = {
            'Action': '??', 'Adventure': '?', 'Comedy': '??', 'Drama': '??',
            'Fantasy': '憟劂', 'Horror': '??, 'Mystery': '?貊?', 'Romance': '???,
            'Sci-Fi': '蝘劂', 'Supernatural': '頞??, 'Sports': '??',
            'Slice of Life': '?亙虜', 'Thriller': '撽?', 'Suspense': '?貊?',
            'Ecchi': 'Ecchi', 'Harem': '敺悅', 'Isekai': '?唬???, 'Mecha': '璈',
            'Music': '?單?', 'Psychological': '敹?', 'School': '?∪?',
            'Military': '頠?', 'Historical': '甇瑕', 'Gore': '銵??,
            'Award Winning': '敺?雿?', 'Gourmet': '蝢?',
            'Boys Love': 'BL', 'Girls Love': 'GL',
        };
        // 銋??themes ??demographics
        const allGenres = [...(item.genres || []), ...(item.themes || []), ...(item.demographics || [])];
        const mappedNames = allGenres.map(g => genreMap[g.name] || g.name);

        let genreFilled = 0;
        genreCheckboxes.forEach(cb => {
            if (!cb.checked && mappedNames.some(m => cb.value === m || cb.value.includes(m) || m.includes(cb.value))) {
                cb.checked = true;
                // ?湔閬死???                const label = cb.closest('label');
                if (label) {
                    label.style.background = 'rgba(0,212,255,0.2)';
                    label.style.borderColor = 'var(--neon-cyan)';
                }
                genreFilled++;
            }
        });
        if (genreFilled > 0) filledCount++;
    }

    // ?芸??啣?撟喳?????嚗? Edge Function 撽?嚗?    const linksList = document.getElementById('links-list');
    if (linksList) {
        const existingNames = Array.from(linksList.querySelectorAll('.link-name')).map(el => el.value.toLowerCase());

        // ??像?圈??摰儔
        const allPlatformLinks = [
            { id: 'anime1', name: 'anime1.me', url: `https://anime1.me/?s=${encodeURIComponent(animeName)}` },
            { id: 'age', name: 'AGE?憤', url: `https://www.agedm.org/search?query=${encodeURIComponent(animeName)}` },
            { id: 'sn-video', name: '???憤', url: `https://sn-video.com/search?q=${encodeURIComponent(animeName)}` },
            { id: '99itv', name: '99?憤', url: `https://99itv.net/search/-------------.html?wd=${encodeURIComponent(animeName)}&submit=` },
            { id: 'ofiii', name: 'Ofiii', url: `https://www.ofiii.com/search/${encodeURIComponent(animeName)}` },
            { id: 'dmmiku', name: '?憤MIKU', url: `https://www.dmmiku.com/index.php/vod/search.html?wd=${encodeURIComponent(animeName)}` },
            { id: 'yinhuadm', name: '瑹餉?憤', url: `https://www.yinhuadm.cc/label/${encodeURIComponent(animeName)}.html` },
            { id: 'anione', name: 'AniOne YT', url: `https://www.youtube.com/@AniOneAnime/search?query=${encodeURIComponent(animeName)}` },
            { id: 'musetw', name: 'Muse?冽???YT', url: `https://www.youtube.com/@MuseTW/search?query=${encodeURIComponent(animeName)}` },
        ];

        // ?岫?? Edge Function 撽??雯蝡?        const addVerifiedLinks = async () => {
            // ?急?? Edge Function嚗?乩蝙??Fallback ?摩嚗??CORS/404 ?航炊
            /*
            try {
                const config = window.configManager?.getSupabaseConfig();
                if (!config?.url) throw new Error('??Supabase ?蔭');

                const resp = await fetch(`${config.url}/functions/v1/check-anime-sites`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.anonKey}`,
                    },
                    body: JSON.stringify({ animeName }),
                });

                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();

                let verifiedCount = 0;
                const verifiedIds = new Set(data.results?.filter(r => r.available).map(r => r.id) || []);

                allPlatformLinks.forEach(link => {
                    if (existingNames.some(n => n.includes(link.name.toLowerCase().split(' ')[0]))) return;
                    if (!verifiedIds.has(link.id)) return; // 閰脩雯蝡??迨雿?嚗歲??
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex;gap:8px;';
                    row.innerHTML = `
                        <input type="text" placeholder="?迂" class="link-name" value="${link.name}" style="flex:1;background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:6px;padding:6px;color:#fff;font-size:12px;">
                        <input type="text" placeholder="蝬脣?" class="link-url" value="${link.url}" style="flex:3;background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:6px;padding:6px;color:#fff;font-size:12px;">
                        <button class="btn-icon delete" style="width:30px;height:30px;" onclick="this.parentElement.remove()">??/button>
                    `;
                    linksList.appendChild(row);
                    verifiedCount++;
                });

                if (verifiedCount > 0) {
                    window.showToast(`?? 撌脤?霅蒂? ${verifiedCount} ?像?圈??`, 'success');
                } else {
                    window.showToast('?? ?像?啣??芣?撠甇支???, 'info');
                }
            } catch (err) {
                console.warn('Edge Function 撽?憭望?嚗?箏?典???', err.message);
            */
            // Fallback嚗dge Function 銝?冽?嚗?典???            allPlatformLinks.forEach(link => {
                if (existingNames.some(n => n.includes(link.name.toLowerCase().split(' ')[0]))) return;

                // 雿輻??addLinkRow ?詨???函?瑽?蝣箔? saveAnime ?賡??舀 div 銝剔? inputs
                const row = document.createElement('div');
                row.className = 'link-row-item'; // ?憿??嫣噶?詨?
                row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';
                row.innerHTML = `
                    <input type="text" placeholder="?迂" class="link-name" value="${link.name}" style="flex:1;background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:6px;padding:6px;color:#fff;font-size:12px;">
                    <input type="text" placeholder="蝬脣?" class="link-url" value="${link.url}" style="flex:3;background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:6px;padding:6px;color:#fff;font-size:12px;">
                    <button class="btn-icon delete" style="width:30px;height:30px;padding:0;display:flex;align-items:center;justify-content:center;border-color:#ff4444;color:#ff4444;" onclick="this.parentElement.remove()">??/button>
                `;
                linksList.appendChild(row);
                filledCount++;
            });
            window.showToast('?? 撌脣??交??像?圈??', 'info');
            /* } */
        };

        // ??甇亙銵?霅?銝憛隞??冽?雿?        addVerifiedLinks();
    }

    window.showToast(`??撌脰???${filledCount} ????蝪∩?靘?嚗?{descEl?.value && !item.synopsis?.startsWith(descEl.value?.substring(0, 20)) ? 'Bangumi 蝜葉' : 'MAL'}嚗, 'success');
};

// ============================================================================
// ?脣??
// ============================================================================

window.saveAnime = async () => {
    try {
        const nameEl = document.getElementById('form-name');
        if (!nameEl || !nameEl.value) return window.showToast('??隢撓?亙?蝔?, 'error');

        const extra_data = {};
        document.querySelectorAll('.form-custom-list').forEach(select => {
            const key = select.getAttribute('data-key');
            if (select.value) extra_data[key] = select.value;
        });

        const btnColor = document.getElementById('set-btn-color');
        if (btnColor && btnColor.value) extra_data.btn_bg = btnColor.value;

        const starColorEl = document.getElementById('form-star-color');
        const nameColorEl = document.getElementById('form-name-color');
        const descColorEl = document.getElementById('form-desc-color');

        const selectedGenres = Array.from(document.querySelectorAll('input[name="form-genre"]:checked')).map(cb => cb.value);

        const payload = {
            name: nameEl.value,
            genre: selectedGenres,
            poster_url: document.getElementById('form-poster')?.value || '',
            youtube_url: document.getElementById('form-youtube')?.value || '',
            category: document.getElementById('form-category')?.value || 'anime',
            links: Array.from(document.querySelectorAll('#links-list .link-name')).map(nameInput => {
                const row = nameInput.parentElement;
                const urlInput = row.querySelector('.link-url');
                const name = nameInput.value.trim();
                const url = urlInput ? urlInput.value.trim() : '';
                return (name && url) ? { name, url } : null;
            }).filter(l => l),
            description: document.getElementById('form-desc')?.value || '',
            year: document.getElementById('form-year')?.value || '',
            month: document.getElementById('form-month')?.value || '',
            season: document.getElementById('form-season')?.value || '',
            rating: document.getElementById('form-rating')?.value || '',
            recommendation: document.getElementById('form-recommendation')?.value || '',
            episodes: document.getElementById('form-episodes')?.value || '',
            star_color: starColorEl?.value || '#ffcc00',
            name_color: nameColorEl?.value || '#ffffff',
            desc_color: descColorEl?.value || '#ffffff',
            extra_data: Object.keys(extra_data).length > 0 ? extra_data : null
        };

        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase ?芷?');

        let { error } = editId ?
            await client.from('anime_list').update(payload).eq('id', editId) :
            await client.from('anime_list').insert([payload]);

        if (error) {
            // 憒??舀?雿撩憭梢隤歹?蝘駁銝??函?甈?敺?閰?            const missingFields = ['youtube_url', 'extra_data'];
            let retryNeeded = false;
            for (const field of missingFields) {
                if (error.message.includes(field)) {
                    console.warn(`[Save] 甈? ${field} 銝??剁?蝘駁敺?閰圳);
                    delete payload[field];
                    retryNeeded = true;
                }
            }
            if (retryNeeded) {
                window.showToast('?? ?菜葫?啗??澈甈?蝻箏仃嚗迤?典?閰衣摰寞芋撘摮?..', 'info');
                const retry = editId ?
                    await client.from('anime_list').update(payload).eq('id', editId) :
                    await client.from('anime_list').insert([payload]);
                if (!retry.error) {
                    window.showToast('??撌脣摮?(?典?甈??鋆?鞈?摨怠???)');
                    await window.loadData();
                    window.switchAdminTab('manage');
                    return;
                }
                error = retry.error;
            }
            throw error;
        }

        window.showToast('???脣???');
        await window.loadData();

        // ?亥底??蝒???蝺刻摩???????蝡?皜脫?閰單???        const modal = document.getElementById('anime-detail-modal');
        if (modal && modal.classList.contains('active') && window.currentDetailId === editId) {
            const updatedItem = (await window.supabaseManager.getClient()).from('anime_list').select('*').eq('id', editId).single();
            const { data } = await updatedItem;
            if (data) window.showAnimeDetail(data.id); // ??澆?喳?瑟
        }

        window.switchAdminTab('manage');
    } catch (err) { window.showToast('???脣?憭望?嚗? + err.message, 'error'); }
};

window.editAnime = (id) => {
    window.switchAdminTab('edit', id);
};
window.addLinkRow = () => {
    const c = document.getElementById('links-list');
    const d = document.createElement('div');
    d.className = 'link-row-item';
    d.style.display = 'flex';
    d.style.gap = '8px';
    d.style.marginBottom = '10px';
    d.innerHTML = `
        <input type="text" placeholder="?迂" class="link-name" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 12px;">
        <input type="text" placeholder="蝬脣?" class="link-url" style="flex: 3; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 12px;">
        <button class="btn-icon delete" style="width: 30px; height: 30px; border-color: #ff4444; color: #ff4444; padding:0; display:flex; align-items:center; justify-content:center;" onclick="this.parentElement.remove()">??/button>
    `;
    c.appendChild(d);
};
window.addOptionItem = async (key) => {
    const input = document.getElementById(`add-opt-${key}`);
    const value = input?.value?.trim();
    if (!value) return window.showToast('??隢撓?仿??蝔?, 'error');
    try {
        if (!optionsData[key]) optionsData[key] = [];
        optionsData[key].push(value);
        input.value = '';
        await window.saveOptionsToDB();
        window.renderAdmin();
        window.showToast('??撌脫憓??);
    } catch (err) {
        console.error('?啣??賊?憭望?:', err);
        window.showToast('???啣?憭望?嚗? + (err.message || err), 'error');
    }
};

/**
 * 憿舐內?寥??臬 Modal
 */
window.showBulkImportModal = (key) => {
    const existing = document.getElementById('bulk-import-modal');
    if (existing) existing.remove();

    const keyLabel = {
        'genre': '憿?', 'year': '撟港遢', 'month': '?遢', 'season': '摮?漲',
        'episodes': '?', 'rating': '閰?', 'recommendation': '?刻摨?
    }[key] || siteSettings.custom_labels?.[key] || key;

    const modal = document.createElement('div');
    modal.id = 'bulk-import-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(5px);';
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #0a0e1a, #1a1e2e); border: 1px solid rgba(0,212,255,0.4); border-radius: 12px; width: 90%; max-width: 500px; display: flex; flex-direction: column; box-shadow: 0 0 40px rgba(0,212,255,0.15);">
            <div style="padding: 20px; border-bottom: 1px solid rgba(0,212,255,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--neon-cyan); margin: 0; font-size: 16px;">?? ?寥??臬??{keyLabel}???/h3>
                    <button onclick="document.getElementById('bulk-import-modal')?.remove()" style="background:none;border:none;color:#aaa;font-size:20px;cursor:pointer;">??/button>
                </div>
                <div style="font-size: 11px; color: #888; margin-top: 6px;">瘥?銝????舐?亙? Excel 鞎潔??湔?鞈??征?質???銴?????/div>
            </div>
            <div style="padding: 20px;">
                <textarea id="bulk-import-textarea" rows="12" placeholder="?賊?1\n?賊?2\n?賊?3\n..." style="width:100%;background:rgba(0,0,0,0.4);border:1px solid rgba(0,212,255,0.3);border-radius:6px;padding:10px;color:#fff;font-size:14px;line-height:1.6;resize:vertical;font-family:monospace;"></textarea>
                <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:15px;">
                    <button onclick="document.getElementById('bulk-import-modal')?.remove()" class="btn-primary" style="padding:8px 20px;border-color:rgba(255,255,255,0.2);color:#aaa;">??</button>
                    <button onclick="window.executeBulkImport('${key}')" class="btn-primary" style="padding:8px 20px;border-color:var(--neon-cyan);color:var(--neon-cyan);">???臬</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('bulk-import-textarea')?.focus();
};

/**
 * ?瑁??寥??臬
 */
window.executeBulkImport = async (key) => {
    const textarea = document.getElementById('bulk-import-textarea');
    const text = textarea?.value?.trim();
    if (!text) return window.showToast('??隢撓?仿?摰?, 'error');

    try {
        if (!optionsData[key]) optionsData[key] = [];
        const existing = new Set(optionsData[key]);
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        let added = 0;
        let skipped = 0;

        lines.forEach(line => {
            if (existing.has(line)) {
                skipped++;
            } else {
                optionsData[key].push(line);
                existing.add(line);
                added++;
            }
        });

        await window.saveOptionsToDB();
        document.getElementById('bulk-import-modal')?.remove();
        window.renderAdmin();
        window.showToast(`??撌脣??${added} ???{skipped > 0 ? `嚗歲??${skipped} ??銴?` : ''}`, 'success');
    } catch (err) {
        console.error('?寥??臬憭望?:', err);
        window.showToast('???臬憭望?嚗? + (err.message || err), 'error');
    }
};

window.deleteOptionItem = async (key, idx) => {
    if (!confirm('蝣箏?閬?斗迨?賊???')) return;
    try {
        if (optionsData[key] && optionsData[key][idx] !== undefined) {
            optionsData[key].splice(idx, 1);
            await window.saveOptionsToDB();
            window.renderAdmin();
            window.showToast('??撌脣?日??);
        }
    } catch (err) {
        console.error('?芷?賊?憭望?:', err);
        window.showToast('???芷憭望?嚗? + (err.message || err), 'error');
    }
};

window.updateCategoryColor = async (key, color, isPreview = false) => {
    if (!optionsData.category_colors) optionsData.category_colors = {};
    optionsData.category_colors[key] = color;

    // 撖行??湔?脣??汗 (銝?閬??蝜?
    const inputs = document.querySelectorAll(`input[type="color"][oninput*="updateCategoryColor('${key}'"]`);
    inputs.forEach(input => {
        const swatch = input.nextElementSibling;
        if (swatch) swatch.style.backgroundColor = color;
    });

    if (!isPreview) {
        await window.saveOptionsToDB(true);
    }
};

window.updateRatingItemColor = async (opt, color, isPreview = false) => {
    if (!optionsData.rating_colors) optionsData.rating_colors = {};
    optionsData.rating_colors[opt] = color;

    // 撖行??湔閰?璅惜??閬賡???    const ratingWrappers = document.querySelectorAll(`[id^="opt-rating-"]`);
    ratingWrappers.forEach(wrapper => {
        // 撠?閰脤??摮?璅惜
        const textSpan = wrapper.querySelector('span');
        if (textSpan && textSpan.textContent.trim() === opt) {
            wrapper.style.background = color + '33';
            wrapper.style.borderColor = color + '66';
            // ?郊?脣?
            const swatch = wrapper.querySelector('.color-swatch');
            if (swatch) swatch.style.backgroundColor = color;
        }
    });

    if (!isPreview) {
        await window.saveOptionsToDB(true);
    }
};

window.triggerColorPicker = (el) => {
    const input = el.nextElementSibling;
    if (input && input.type === 'color') input.click();
};

window.saveOptionsToDB = async (skipRender = false) => {
    const client = window.supabaseManager?.getClient();
    if (!client) {
        console.warn('Supabase ?芷?嚗瘜摮身摰?);
        return;
    }
    try {
        await client.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) });
        window.showToast('??閮剖?撌脣?甇?);
    } catch (err) {
        console.error('?脣? options_data 憭望?:', err);
        window.showToast('???脣?閮剖?憭望?', 'error');
    }

    if (skipRender) return;

    if (typeof window.renderApp === 'function') {
        // 憒?甇?蝞∠?敺嚗?閬?蝜芣??APP嚗?皜脫?敺
        if (isAdminLoggedIn && document.querySelector('.admin-container')) {
            // ?ㄐ銝銵遙雿?雿?? admin-panel 撌脩??舐蝡?皜脫??摩
            // 憿?湔?芷??湔霈嚗??券?蝜芣??app
        } else {
            try { window.renderApp(); } catch (e) { console.warn('renderApp 憭望?:', e); }
        }
    }
};

window.exportCSV = (cat) => {
    const filtered = animeData.filter(item => item.category === cat);
    if (filtered.length === 0) return window.showToast('???∟???臬', 'error');

    const baseFields = [
        { key: 'name', label: '雿??迂' },
        { key: 'poster_url', label: '瘚瑕蝬脣?' },
        { key: 'description', label: '蝪∩??批捆' },
        { key: 'star_color', label: '??憿' },
        { key: 'name_color', label: '?迂憿' },
        { key: 'desc_color', label: '蝪∩?憿' },
        { key: 'links', label: '?賊????' },
        { key: 'extra_data', label: '憿?鞈?' }
    ];

    const optionFields = [
        { key: 'year', label: '撟港遢' },
        { key: 'month', label: '?遢' },
        { key: 'season', label: '摮?漲' },
        { key: 'genre', label: '憿?' },
        { key: 'episodes', label: '?' },
        { key: 'rating', label: '閰?' },
        { key: 'recommendation', label: '?刻摨? }
    ];

    if (siteSettings.custom_labels) {
        Object.entries(siteSettings.custom_labels).forEach(([key, label]) => {
            if (!optionFields.find(f => f.key === key)) optionFields.push({ key, label });
        });
    }

    const allFields = [...baseFields, ...optionFields];
    const csvRows = [allFields.map(f => f.label).join(',')];

    for (const item of filtered) {
        const row = allFields.map(f => {
            let val = item[f.key] || '';
            if (Array.isArray(val)) val = val.join('|');
            if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
            const cleanVal = String(val).replace(/"/g, '""');
            return `"${cleanVal}"`;
        });
        csvRows.push(row.join(','));
    }

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acg_${cat}_${new Date().getTime()}.csv`;
    a.click();
    window.showToast('???臬?? (銝剜?璅?)');
};

window.triggerImport = (cat) => {
    console.log('? 閮剖??臬?格??踹?:', cat);
    importTarget = cat;
    document.getElementById('importFile').click();
};
window.importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const csv = e.target.result;

            // 撠平??CSV 閫???剁??舀憭?甈?????            const parseCSV = (text) => {
                const rows = [];
                let currentRow = [];
                let currentField = '';
                let inQuotes = false;

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const nextChar = text[i + 1];

                    // 撘???
                    if (char === '"') {
                        if (inQuotes && nextChar === '"') {
                            // 頝喲?頧儔????                            currentField += '"';
                            i++;
                        } else {
                            inQuotes = !inQuotes;
                        }
                    }
                    // ????
                    else if (char === ',' && !inQuotes) {
                        currentRow.push(currentField);
                        currentField = '';
                    }
                    // ????
                    else if ((char === '\n' || char === '\r') && !inQuotes) {
                        // 頝喲? \r\n 蝯?
                        if (char === '\r' && nextChar === '\n') {
                            i++;
                        }
                        // 摰??嗅?銵?                        if (currentField.trim() || currentRow.length > 0) {
                            currentRow.push(currentField);
                            rows.push(currentRow);
                        }
                        currentRow = [];
                        currentField = '';
                    }
                    // ?嗡?摮泵
                    else {
                        currentField += char;
                    }
                }

                // ???敺?銵?                if (currentField.trim() || currentRow.length > 0) {
                    currentRow.push(currentField);
                    rows.push(currentRow);
                }

                return rows;
            };

            const allRows = parseCSV(csv);
            if (allRows.length < 2) return window.showToast('??CSV 瑼??∪摰?, 'error');

            const labelMap = {
                '雿??迂': 'name', '瘚瑕蝬脣?': 'poster_url', '蝪∩??批捆': 'description',
                '??憿': 'star_color', '?迂憿': 'name_color', '蝪∩?憿': 'desc_color',
                '?賊????': 'links', '憿?鞈?': 'extra_data',
                '撟港遢': 'year', '?遢': 'month', '摮?漲': 'season',
                '?': 'episodes', '閰?': 'rating', '?刻摨?: 'recommendation'
            };
            if (siteSettings.custom_labels) {
                Object.entries(siteSettings.custom_labels).forEach(([key, label]) => { labelMap[label] = key; });
            }

            // 閫??璅?銵?            const rawHeaders = allRows[0].map(h => h.trim().replace(/^"|"$/g, ''));
            const headers = rawHeaders.map(h => labelMap[h] || h);

            // 摰儔鞈?摨思葉撖阡?摮??皞?雿?            const dbStandardFields = ['name', 'poster_url', 'description', 'star_color', 'name_color', 'desc_color', 'links', 'extra_data', 'year', 'month', 'season', 'episodes', 'rating', 'recommendation', 'category'];

            const items = [];
            for (let i = 1; i < allRows.length; i++) {
                const values = allRows[i];

                // 頝喲?蝛箄?
                if (values.length === 1 && values[0].trim() === '') continue;

                const item = { extra_data: {} };
                headers.forEach((h, idx) => {
                    let val = (values[idx] || '').trim().replace(/^"|"$/g, '').replace(/""/g, '"');

                    if (dbStandardFields.includes(h)) {
                        // ??璅?甈?
                        if (h === 'links' || h === 'extra_data') {
                            try {
                                const parsed = JSON.parse(val);
                                if (h === 'extra_data') Object.assign(item.extra_data, parsed);
                                else item[h] = parsed;
                            } catch (e) { if (h === 'links') item[h] = []; }
                        } else {
                            item[h] = val;
                        }
                    } else if (h) {
                        // ???芸?蝢拇?雿?甇賊???extra_data
                        item.extra_data[h] = val;
                    }
                });

                item.category = importTarget;
                delete item.id;

                // 頝喲??⊥?????瘝?雿??迂嚗?                if (!item.name || !item.name.trim()) continue;

                items.push(item);
            }

            const client = window.supabaseManager?.getClient();
            if (!client) throw new Error('Supabase ?芷?');
            const { error } = await client.from('anime_list').insert(items);
            if (error) throw error;

            window.showToast(`?????臬 ${items.length} 蝑??);
            await window.loadData();
            window.renderAdmin();
        } catch (err) {
            console.error('Import error:', err);
            window.showToast('???臬憭望?嚗? + err.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
};

window.saveSettings = async () => {
    try {
        const title = document.getElementById('set-title').value;
        const announcement = document.getElementById('set-announcement').value;
        const titleColor = document.getElementById('set-title-color').value;
        const announcementColor = document.getElementById('set-announcement-color').value;
        const adminName = document.getElementById('set-admin-name').value;
        const adminAvatar = document.getElementById('set-admin-avatar').value;
        const adminColor = document.getElementById('set-admin-color').value;
        const nameColor = document.getElementById('set-name-color').value;
        const descColor = document.getElementById('set-desc-color').value;
        const btnColor = document.getElementById('set-btn-color').value;

        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase ?芷?');

        // ?湔 optionsData 銝剔?憿
        if (!optionsData.category_colors) optionsData.category_colors = {};
        optionsData.category_colors.name = nameColor;
        optionsData.category_colors.desc = descColor;
        optionsData.category_colors.btn_bg = btnColor;

        const { error } = await client.from('site_settings').upsert([
            { id: 'site_title', value: title },
            { id: 'announcement', value: announcement },
            { id: 'title_color', value: titleColor },
            { id: 'announcement_color', value: announcementColor },
            { id: 'admin_name', value: adminName },
            { id: 'admin_avatar', value: adminAvatar },
            { id: 'admin_color', value: adminColor }
        ]);

        // 靽??賊?鞈?嚗??恍??脰身摰?
        await client.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) });

        // ?郊?湔?典?霈
        siteSettings.admin_color = adminColor;

        if (error) throw error;

        siteSettings = {
            ...siteSettings,
            site_title: title,
            announcement: announcement,
            title_color: titleColor,
            announcement_color: announcementColor,
            admin_name: adminName,
            admin_avatar: adminAvatar,
            admin_color: adminColor
        };

        document.title = title;
        window.showToast('??閮剖?撌脫??);
        window.renderAdmin();
        window.renderApp();
    } catch (err) {
        console.error('Save settings error:', err);
        window.showToast('???湔憭望?', 'error');
    }
};

window.updateCategoryColorDirect = async (key, color) => {
    if (!optionsData.category_colors) optionsData.category_colors = {};
    optionsData.category_colors[key] = color;

    const client = window.supabaseManager?.getClient();
    if (client) {
        await client.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) });
    }
};

window.deleteAnime = async (id) => {
    if (!confirm('蝣箏?閬?斗迨雿???')) return;
    try {
        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase ?芷?');
        const { error } = await client.from('anime_list').delete().eq('id', id);
        if (error) throw error;
        window.showToast('??撌脣??);
        await window.loadData();
        window.renderAdmin();
    } catch (err) { window.showToast('???芷憭望?', 'error'); }
};

window.deleteAllInCategory = async () => {
    // 蝯梯?閰脫憛?憭?雿?
    const count = animeData.filter(a => a.category === currentCategory).length;
    if (count === 0) {
        window.showToast('??閰脫憛?????, 'warning');
        return;
    }

    if (!confirm(`?? 蝣箏?閬?文??${count} ??${currentCategory} 雿???\n甇斗?雿瘜儔??`)) return;

    // 鈭活蝣箄?
    if (!confirm(`?活蝣箄?嚗Ⅱ摰??芷?券 ${count} ??${currentCategory} 雿?嚗)) return;

    try {
        window.showToast('?? 甇??芷...', 'info');

        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase ?芷?');
        const { error } = await client.from('anime_list').delete().eq('category', currentCategory);
        if (error) throw error;

        window.showToast(`??撌脣?文??${count} ??${currentCategory} 雿?`);
        await window.loadData();
        window.renderAdmin();
    } catch (err) {
        console.error('Delete all error:', err);
        window.showToast('???芷憭望?嚗? + err.message, 'error');
    }
};

window.toggleSelectAll = (checked) => {
    document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = checked);
    window.updateBulkDeleteButton();
};

window.updateBulkDeleteButton = () => {
    const checkboxes = document.querySelectorAll('.item-checkbox:checked');
    const count = checkboxes.length;
    const btn = document.getElementById('bulk-delete-btn');
    const countSpan = document.getElementById('selected-count');
    const selectAll = document.getElementById('select-all');

    if (btn && countSpan) {
        btn.style.display = count > 0 ? 'block' : 'none';
        countSpan.textContent = count;
    }

    if (selectAll) {
        const totalCheckboxes = document.querySelectorAll('.item-checkbox').length;
        selectAll.checked = count === totalCheckboxes && count > 0;
    }
};

window.bulkDeleteAnime = async () => {
    const checkboxes = document.querySelectorAll('.item-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.dataset.id);

    if (ids.length === 0) return;

    if (!confirm(`蝣箏?閬?日銝剔? ${ids.length} ????嚗)) return;

    try {
        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase ?芷?');
        const { error } = await client.from('anime_list').delete().in('id', ids);
        if (error) throw error;
        window.showToast('???砍?撌脣??);
        setTimeout(() => window.renderAnnouncements(), 300);
    } catch (err) {
        console.error('Delete announcement error:', err);
        window.showToast('???芷憭望?嚗? + (err?.message || '?芰?航炊'), 'error');
    }
};

window.changeAdminPage = (p) => { adminPage = p; window.renderAdmin(); };

// --- UI Helpers ---
window.toggleSystemMenu = (e) => {
    if (e) e.stopPropagation();
    const menu = document.getElementById('systemMenu');
    const btn = document.querySelector('.header-menu-btn');
    if (menu) {
        const isHidden = window.getComputedStyle(menu).display === 'none' || !menu.classList.contains('active');
        if (isHidden) {
            menu.style.setProperty('display', 'block', 'important');
            menu.classList.add('active');
            btn.textContent = '??;
        } else {
            menu.style.setProperty('display', 'none', 'important');
            menu.classList.remove('active');
            btn.textContent = '??;
        }
    }
};

// 暺???嗡??唳???
document.addEventListener('click', (e) => {
    const menu = document.getElementById('systemMenu');
    const btn = document.querySelector('.header-menu-btn');
    if (menu && menu.classList.contains('active') && !menu.contains(e.target) && e.target !== btn) {
        menu.style.setProperty('display', 'none', 'important');
        menu.classList.remove('active');
        if (btn) btn.textContent = '??;
    }
});

window.refreshSystem = async () => {
    window.showToast('???郊鞈?銝?..');
    await window.loadData();
    window.renderApp();
    window.showToast('??鞈?撌脣?甇?);
};

// ========== 銝駁??? ==========
window.toggleTheme = () => {
    if (window.usabilityManager) {
        window.usabilityManager.toggleTheme();
        window.updateThemeUI();
    }
};

window.updateThemeUI = () => {
    const theme = window.usabilityManager?.getTheme() || 'dark';
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');

    if (theme === 'dark') {
        if (icon) icon.textContent = '??';
        if (text) text.textContent = '瘛梯';
    } else {
        if (icon) icon.textContent = '?儭?;
        if (text) text.textContent = '瘛箄';
    }
};

// ========== ?嗉?? ==========
window.toggleFavorite = (itemId) => {
    if (window.usabilityManager) {
        const isFavorite = window.usabilityManager.toggleFavorite(itemId);
        window.showToast(isFavorite ? '潃?撌脣??交?? : '?? 撌脩宏?斗??);
        return isFavorite;
    }
    return false;
};

window.isFavorite = (itemId) => {
    return window.usabilityManager?.isFavorite(itemId) || false;
};

// ========== ??甇瑕 ==========
window.addToSearchHistory = (query, filters = {}) => {
    if (window.usabilityManager) {
        window.usabilityManager.addSearch(query, filters);
    }
};

window.getSearchHistory = () => {
    return window.usabilityManager?.getSearchHistory() || [];
};

// ========== ?餈汗 ==========
window.addToRecentViews = (item) => {
    if (window.usabilityManager) {
        window.usabilityManager.addRecentView(item);
    }
};

// ========== 鞈??遢 ==========
window.exportUserData = () => {
    if (window.usabilityManager) {
        window.usabilityManager.exportAllData();
        window.showToast('? 鞈?撌脣??);
    }
};

window.importUserData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (window.usabilityManager) {
        window.usabilityManager.importData(file)
            .then(() => {
                window.showToast('? 鞈?撌脣??);
                window.renderApp();
            })
            .catch(err => {
                window.showToast('???臬憭望?嚗? + err.message, 'error');
            });
    }
};

// ========== ???蜓憿?==========
window.initTheme = () => {
    if (window.usabilityManager) {
        window.updateThemeUI();
    }
};

// Discord integration disabled - webhook URLs must not be exposed in client code
// Announcements are managed via Supabase database

/* 皛曇憚?舀?璈怠??脣? (?芸?????撠摰捆?? */
window.setupHorizontalScroll = (selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(target => {
        if (target._hasWheelListener) return;
        target.addEventListener('wheel', (e) => {
            if (target.scrollWidth > target.clientWidth) {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    e.preventDefault();
                    target.scrollLeft += e.deltaY;
                }
            }
        }, { passive: false });
        target._hasWheelListener = true;
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // 撱園????蝣箔?皜脫?摰?
    setTimeout(() => {
        window.setupHorizontalScroll('.horizontal-scroll-container, .scroll-row-v35, .force-scroll');
    }, 1500);
});

// ???蝔?
setTimeout(() => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.initApp());
    } else {
        window.initApp();
    }
    // ???蜓憿?    window.initTheme();
}, 0);

window.changeCursorTheme = (theme) => {
    localStorage.setItem('cursorTheme', theme);
    if (typeof window.applyCursorTheme === 'function') {
        window.applyCursorTheme(theme);
    }
    window.showToast(`????銝駁?撌脣???${theme}`);
};

// 蝮格?批
window.changeZoomLevel = (level) => {
    zoomLevel = parseInt(level);
    localStorage.setItem('zoomLevel', zoomLevel);
    const scale = zoomLevel / 100;
    document.documentElement.style.setProperty('--site-scale', scale);
    window.showToast(`?? 蝮格嚗?{zoomLevel}%`);
};

// ??脣??葬??window.applyZoom = () => {
    const scale = zoomLevel / 100;
    document.documentElement.style.setProperty('--site-scale', scale);
};
