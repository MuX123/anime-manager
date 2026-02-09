// TECH v6.0.0 - ACG Manager Logic (Security & Performance Optimized)

// 生產環境配置 - 減少控制台輸出
const IS_PRODUCTION = window.location.hostname !== 'localhost' &&
    !window.location.hostname.includes('127.0.0.1') &&
    !window.location.hostname.includes('github.io');

// 生產環境覆蓋 console 減少噪音
if (IS_PRODUCTION) {
    const originalConsole = { ...console };
    console.log = (...args) => originalConsole.log.call(originalConsole, '[INFO]', ...args);
    console.warn = (...args) => originalConsole.warn.call(originalConsole, '[WARN]', ...args);
    console.info = (...args) => { /* 生產環境隱藏 info */ };
}

let currentSection = 'notice';
let animeData = [];
let optionsData = {
    genre: ['冒險', '奇幻', '熱血', '校園', '戀愛', '喜劇', '科幻', '懸疑', '日常', '異世界'],
    year: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
    month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    season: ['冬', '春', '夏', '秋'],
    episodes: ['12集', '24集', '劇場版', 'OVA'],
    rating: ['SS', '神', '優', '普', '劣'],
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

window.getOptionLabel = (key) => {
    const labels = {
        genre: '類型',
        year: '年份',
        month: '月份',
        season: '季度',
        episodes: '集數',
        rating: '評分',
        recommendation: '推薦'
    };
    return labels[key] || key;
};

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

window.showFirstVisitPopups = async () => {
    if (typeof window.showAnnouncementPopups === 'function') {
        await window.showAnnouncementPopups();
    }
};

let siteSettings = {
    site_title: 'ACG 收藏庫',
    announcement: '⚡ 離線演示模式 // 資料來源：演示數據',
    title_color: '#ffffff',
    announcement_color: '#ffffff',
    admin_name: '管理員',
    admin_avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    admin_color: '#00ffff',
    admin_email: '',
    custom_labels: {}
};

// 演示數據（離線模式使用）
const demoAnimeData = [
    {
        id: 1,
        name: '刀劍神域',
        original_name: 'Sword Art Online',
        genre: '科幻',
        year: '2024',
        season: '冬',
        episodes: '24集',
        rating: '優',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1173/142080l.jpg',
        description: '2022年，VRMMO遊戲「SAO」正式營運，玩家們被困在遊戲中無法登出，只有打倒BOSS才能離開...',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        name: '鬼滅之刃',
        original_name: 'Demon Slayer',
        genre: '熱血',
        year: '2023',
        season: '春',
        episodes: '26集',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1178/142083l.jpg',
        description: '大正時期，名為「鬼」的怪物存在於世。主角炭治郎的家人被鬼殺害，他踏上了成為鬼殺隊的旅程...',
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        name: '間諜家家酒',
        original_name: 'Spy x Family',
        genre: '喜劇',
        year: '2024',
        season: '春',
        episodes: '12集',
        rating: '優',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/3408/142078l.jpg',
        description: '間諜「黃昏」為了完成任務，需要組建一個臨時家庭。他收養了具有讀心能力的女兒，展開了意想不到的生活...',
        created_at: new Date().toISOString()
    },
    {
        id: 4,
        name: '進擊的巨人',
        original_name: 'Attack on Titan',
        genre: '熱血',
        year: '2023',
        season: '秋',
        episodes: '24集',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1174/142081l.jpg',
        description: '在巨人威脅下的人類最後的城堡，面對巨人捕食的恐懼，主角艾倫決定加入訓練兵團，展開復仇之旅...',
        created_at: new Date().toISOString()
    },
    {
        id: 5,
        name: '我的英雄學院',
        original_name: 'My Hero Academia',
        genre: '熱血',
        year: '2024',
        season: '夏',
        episodes: '24集',
        rating: '優',
        recommendation: '★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1205/142085l.jpg',
        description: '在80%的人類都擁有名為「個性」的超能力的時代，沒有力量的少年綠谷出久如何成為英雄？',
        created_at: new Date().toISOString()
    },
    {
        id: 6,
        name: '咒術迴戰',
        original_name: 'Jujutsu Kaisen',
        genre: '熱血',
        year: '2024',
        season: '冬',
        episodes: '24集',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1173/142079l.jpg',
        description: '高中生虎杖悠仁在吞下詛咒的手指後，成為了詛咒的容器，必須進入咒術高等學校學習...',
        created_at: new Date().toISOString()
    },
    {
        id: 7,
        name: '紫羅蘭永恆花園',
        original_name: 'Violet Evergarden',
        genre: '戀愛',
        year: '2023',
        season: '春',
        episodes: '14集',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1795/142084l.jpg',
        description: '自動手記人偶「薇爾莉特·伊芙加登」在戰後尋找「愛」的意義，替人們代筆書信...',
        created_at: new Date().toISOString()
    },
    {
        id: 8,
        name: '你的名字',
        original_name: 'Your Name',
        genre: '戀愛',
        year: '2022',
        season: '秋',
        episodes: '劇場版',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1315/142086l.jpg',
        description: '住在東京的少年與住在鄉下的少女，在夢中交換了身體。跨越時空的奇蹟就此展開...',
        created_at: new Date().toISOString()
    },
    {
        id: 9,
        name: 'Re:從零開始的異世界生活',
        original_name: 'Re:Zero',
        genre: '異世界',
        year: '2024',
        season: '夏',
        episodes: '24集',
        rating: '優',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/152/142088l.jpg',
        description: '被召喚到異世界的少年菜月昴，擁有「死亡回歸」的能力，只有拯救他人才能打破詛咒...',
        created_at: new Date().toISOString()
    },
    {
        id: 10,
        name: '海賊王',
        original_name: 'One Piece',
        genre: '冒險',
        year: '2024',
        season: '夏',
        episodes: '24集',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/456/142090l.jpg',
        description: '戴上草帽的少年魯夫踏上尋找「大海賊王」寶藏的冒險旅程，組建了草帽海賊團...',
        created_at: new Date().toISOString()
    }
];
let currentCategory = 'notice';
let currentAdminTab = 'manage';
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
let sortOrder = localStorage.getItem('sortOrder') || 'desc';
let importTarget = 'anime';
let editId = null;
let isFirstLoad = true;

// --- UI Helper Functions (放在前面以確保 initApp 可以調用) ---

window.showToast = (msg, type = 'info') => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.borderColor = type === 'error' ? '#ff4444' : 'var(--neon-blue)';
    toast.style.color = type === 'error' ? '#ff4444' : 'var(--neon-cyan)';
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
};

// Admin Authentication Functions
let isAdminLoggedIn = false;

window.showAdminLoginModal = () => {
    const existingModal = document.getElementById('admin-login-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'admin-login-modal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <h2 style="color: var(--neon-cyan); margin-bottom: 20px; text-align: center;">🔐 管理員登入</h2>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan);">電子郵件</label>
                <input type="email" id="admin-email" placeholder="admin@example.com" style="width: 100%; padding: 12px; border: 1px solid rgba(0,212,255,0.3); border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan);">密碼</label>
                <input type="password" id="admin-password" placeholder="輸入密碼" style="width: 100%; padding: 12px; border: 1px solid rgba(0,212,255,0.3); border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff;">
            </div>
            <div id="login-error" style="color: #ff4444; text-align: center; margin-bottom: 15px; display: none;"></div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" style="flex: 1; padding: 12px;" onclick="window.performAdminLogin()">登入</button>
                <button class="btn-primary" style="flex: 1; border-color: #ff4444; color: #ff4444;" onclick="document.getElementById('admin-login-modal').remove()">取消</button>
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
        errorDiv.textContent = '請輸入電子郵件和密碼';
        errorDiv.style.display = 'block';
        return;
    }

    errorDiv.style.display = 'none';

    try {
        const result = await window.supabaseManager.signInWithEmail(email, password);

        if (result.success) {
            window.showToast('✓ 登入成功');
            document.getElementById('admin-login-modal').remove();
            await window.checkAndUpdateAdminStatus();
        } else {
            errorDiv.textContent = result.error || '登入失敗';
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        errorDiv.textContent = '登入過程發生錯誤';
        errorDiv.style.display = 'block';
    }
};

window.adminLogout = async () => {
    const result = await window.supabaseManager.signOut();
    if (result.success) {
        isAdminLoggedIn = false;
        window.showToast('✓ 已登出');
        window.updateAdminMenu();
        if (document.querySelector('.admin-container')) {
            window.toggleAdminMode(false);
        }
    } else {
        window.showToast('✗ 登出失敗', 'error');
    }
};

window.checkAndUpdateAdminStatus = async () => {
    if (!window.supabaseManager || !window.supabaseManager.isConnectionReady()) {
        isAdminLoggedIn = false;
        return false;
    }

    try {
        const isAdminUser = await window.supabaseManager.checkIsAdmin();
        isAdminLoggedIn = isAdminUser;
        window.updateAdminMenu();
        return isAdminUser;
    } catch (err) {
        isAdminLoggedIn = false;
        return false;
    }
};

window.updateAdminMenu = () => {
    // 管理按鈕現在在右側選單中，這裡只隱藏 header
    const headerContainer = document.getElementById('adminHeaderBar');
    if (headerContainer) {
        headerContainer.innerHTML = '';
    }
};

let lastFrontendCategory = 'notice';
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

// --- Render Functions (必須在 initApp 之前定義) ---

window.renderPagination = (total) => {
    const totalPages = Math.ceil(total / itemsPerPage);
    if (totalPages <= 1) return '';
    let html = '';
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    if (currentPage > 1) html += `<button class="btn-primary" onclick="window.goToPage(${currentPage - 1})">◀</button>`;
    for (let i = start; i <= end; i++) {
        html += i === currentPage ? `<button class="btn-primary active">${i}</button>` : `<button class="btn-primary" onclick="window.goToPage(${i})">${i}</button>`;
    }
    if (currentPage < totalPages) html += `<button class="btn-primary" onclick="window.goToPage(${currentPage + 1})">▶</button>`;
    return html;
};

window.renderSearchSelectsHTML = () => {
    const createSelect = (id, label, options, currentVal, onChange) => {
        return `<select id="${id}" onchange="${onChange}" style="min-width: 100px; background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.25); padding: 8px; font-size: 13px; cursor: pointer; color: #fff; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif;">
            <option value="" style="background: var(--bg-dark);">${label}</option>
            ${options.map(o => `<option value="${o}" ${o === currentVal ? 'selected' : ''} style="background: var(--bg-dark);">${o}</option>`).join('')}
        </select>`;
    };
    return `${createSelect('filter-genre', '類型', optionsData.genre, filters.genre, "window.applyFilters(this.value, 'genre')")}
           ${createSelect('filter-year', '年份', optionsData.year, filters.year, "window.applyFilters(this.value, 'year')")}
           ${createSelect('filter-season', '季度', optionsData.season, filters.season, "window.applyFilters(this.value, 'season')")}
           ${createSelect('filter-month', '月份', optionsData.month, filters.month, "window.applyFilters(this.value, 'month')")}
           ${createSelect('filter-rating', '評分', optionsData.rating, filters.rating, "window.applyFilters(this.value, 'rating')")}`;
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
 * 安全地轉義 HTML 特殊字符（防止 XSS）
 * @param {string} str 未處理的字串
 * @returns {string} 轉義後的安全字串
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
        console.log('🚀 系統初始化中...');

        // 快速檢查 Supabase，縮短等待時間
        const waitForSupabaseReady = async (timeoutMs = 2000, intervalMs = 100) => {
            const start = Date.now();
            while (Date.now() - start < timeoutMs) {
                if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
                    return true;
                }
                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }
            return window.supabaseManager ? window.supabaseManager.isConnectionReady() : false;
        };

        // 先嘗試 Supabase，2秒超時
        await waitForSupabaseReady();

        // 1. 檢查 Supabase 連接狀態
        let client = null;
        let isOfflineMode = false;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
            console.log('✅ 使用 Supabase 數據庫');
        } else {
            console.warn('⚠️ Supabase 未連接，進入離線演示模式');
            isOfflineMode = true;
            window.showToast('資料庫未連接，使用演示數據', 'info');
        }

        // 2. 獲取網站設定與選項資料 (優先載入)
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
                                console.warn('custom_labels 解析失敗:', e);
                            }
                        }
                        if (s.id === 'options_data') {
                            try {
                                const parsed = JSON.parse(s.value);
                                if (parsed && parsed.genre) {
                                    optionsData = parsed;
                                }
                            } catch (e) {
                                console.warn('options_data 解析失敗，使用預設選項:', e);
                            }
                        }
                    });
                    console.log('✅ 網站設定載入成功');
                } else {
                    console.warn('網站設定載入失敗或無資料:', settingsError);
                }
            } catch (err) {
                console.error('載入網站設定發生錯誤:', err);
            }

            // 5. 載入作品資料
            await window.loadData();
        }

        // 6. 設置全域變數
        window.animeData = animeData;
        window.optionsData = optionsData;
        window.siteSettings = siteSettings;

        // 8. 檢查管理員登入狀態
        await window.checkAndUpdateAdminStatus();

        // 9. 渲染初始介面
        window.renderApp();

        // 10. 檢查現有會話的管理員狀態（添加超時保護）
        if (window.supabaseManager?.isConnectionReady()) {
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

        // 11. 顯示首次訪問彈窗
        if (isFirstLoad) {
            setTimeout(() => window.showFirstVisitPopups(), 1000);
        }

        // 11. 隱藏載入畫面並顯示內容
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

        isFirstLoad = false;
        console.log('✅ 系統初始化完成');

        // 安全超時：10秒後強制隱藏載入畫面
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const app = document.getElementById('app');
            if (loadingScreen && loadingScreen.style.display !== 'none') {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.display = 'none';
                app.classList.add('loaded');
                console.log('⚠️ 安全超時強制隱藏載入畫面');
            }
        }, 10000);

    } catch (err) {
        console.error('Init error:', err);
        window.showToast('系統初始化失敗，請重新整理', 'error');
        // 即使失敗也嘗試渲染基本結構
        isFirstLoad = false;
        window.renderApp();

        // 確保隱藏載入畫面
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
    }
};

window.loadData = async function () {
    try {
        console.log('📡 正在從 Supabase 抓取資料...');
        const client = window.supabaseManager?.getClient();
        if (!client) {
            console.warn('Supabase 客戶端未就緒，使用演示數據');
            // 使用演示數據
            animeData = [...demoAnimeData];
            console.log('✅ 使用演示數據，共', animeData.length, '筆');
            return animeData;
        }

        // 檢查是否真的可以連線
        if (!window.supabaseManager?.isConnectionReady()) {
            console.warn('Supabase 未就緒，使用演示數據');
            animeData = [...demoAnimeData];
            return animeData;
        }

        // 使用超時機制，避免請求卡住
        const fetchWithTimeout = async (promise, timeoutMs = 3000) => {
            let timeoutId;
            const racePromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('請求超時')), timeoutMs);
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
                3000
            );
            if (!error) {
                animeData = data || [];
                console.log('✅ 資料抓取成功，共', animeData.length, '筆');
                return animeData;
            }
        } catch (e) {
            console.warn('Supabase 查詢超時或失敗，切換至演示數據:', e.message);
        }

        // 切換到演示數據
        console.warn('使用演示數據');
        animeData = [...demoAnimeData];
        return animeData;
    } catch (e) {
        console.warn('數據載入失敗，使用演示數據:', e.message);
        animeData = [...demoAnimeData];
        window.showToast('已切換至離線演示模式', 'warning');
        return animeData;
    }
};

/**
 * 驗證用戶是否為管理員
 * @param {string} userEmail 用戶電子郵件
 */
window.renderApp = function () {
    const app = document.getElementById('app');
    if (!app) return;

    // 動態套用按鈕顏色
    const btnColor = optionsData.category_colors?.btn_bg || '#00d4ff';
    document.documentElement.style.setProperty('--btn-bg', btnColor);
    document.documentElement.style.setProperty('--btn-bg-alpha', btnColor + '22');

    const isAdminMode = document.querySelector('.admin-container') !== null;
    const isNotice = currentCategory === 'notice';

    // 處理公告板塊的特殊顯示
    let noticeHTML = '';
    if (isNotice) {
        noticeHTML = '<div id="discord-section" style="min-height: 400px; display: flex; align-items: center; justify-content: center;"><div style="color: var(--neon-cyan);">⚡ 載入中...</div></div>';
    }

    const filtered = window.getFilteredData();
    const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 確保 CSS 變數同步
    if (gridColumns !== 'mobile') {
        document.documentElement.style.setProperty('--grid-columns', gridColumns);
    }

    // 更新系統菜單（在 body 層級）
    let topControlBar = document.getElementById('topControlBar');
    if (!topControlBar) {
        topControlBar = document.createElement('div');
        topControlBar.id = 'topControlBar';
        document.body.appendChild(topControlBar);
    }
    topControlBar.style.cssText = `position: fixed !important; top: 50% !important; right: 20px !important; transform: translateY(-50%) !important; display: ${currentSection === 'admin' ? 'none' : 'flex'}; flex-direction: column; align-items: flex-end; z-index: 9999 !important;`;
    topControlBar.innerHTML = `
        <div style="display: flex; flex-direction: column; background: rgba(5, 15, 25, 0.5); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,212,255,0.2); backdrop-filter: blur(15px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); min-width: 160px; gap: 8px;">
            <select onchange="window.changeGridLayout(this.value)" style="width: 100%; background: rgba(0,212,255,0.05) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: #fff !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease; text-align: center; text-align-last: center;">
                ${[3, 4, 5].map(n => `<option value="${n}" ${gridColumns == n ? 'selected' : ''} style="background: var(--bg-dark);">${n} 欄</option>`).join('')}
                <option value="mobile" ${gridColumns === 'mobile' ? 'selected' : ''} style="background: var(--bg-dark);">📱 資料列表</option>
            </select>
            <select onchange="window.changeSortOrder(this.value)" style="width: 100%; background: rgba(0,212,255,0.05) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: #fff !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease; text-align: center; text-align-last: center;">
                <option value="desc" ${sortOrder === 'desc' ? 'selected' : ''} style="background: var(--bg-dark);">時間：從新到舊</option>
                <option value="asc" ${sortOrder === 'asc' ? 'selected' : ''} style="background: var(--bg-dark);">時間：從舊到新</option>
                <option value="name" ${sortOrder === 'name' ? 'selected' : ''} style="background: var(--bg-dark);">名稱：A-Z</option>
            </select>
            <div style="height: 1px; background: rgba(0,212,255,0.2); margin: 4px 0;"></div>
            ${isAdminLoggedIn ? `
                <button onclick="window.toggleAdminMode(true)" style="width: 100%; background: rgba(0,212,255,0.1) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: var(--neon-cyan) !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease;">⚙️ 後台管理</button>
                <button onclick="window.adminLogout()" style="width: 100%; background: rgba(255,68,68,0.1) !important; border: 1px solid rgba(255,68,68,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: #ff6b6b !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease;">🚪 登出</button>
            ` : `
                <button onclick="window.showAdminLoginModal()" style="width: 100%; background: rgba(0,212,255,0.1) !important; border: 1px solid rgba(0,212,255,0.25) !important; padding: 10px !important; font-size: 13px !important; cursor: pointer; color: var(--neon-cyan) !important; font-weight: 500; outline: none !important; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif; transition: all 0.3s ease;">🔐 登入</button>
            `}
            <div id="adminMenuOptions" style="display: flex; flex-direction: column; gap: 6px;"></div>
        </div>
    `;

    // 強制更新整個 app 內容，確保切換板塊時 DOM 結構完全正確
    app.innerHTML = `
        <div class="app-container">
            <header class="app-header">
                <div style="display: flex; justify-content: center; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <h1 style="color: ${siteSettings.title_color || '#ffffff'}; text-shadow: 0 0 10px var(--neon-blue); margin-bottom: 8px;">
                        ${siteSettings.site_title} <span style="font-size: 14px; color: var(--text-secondary); margin-left: 10px;">v7.0.0</span>
                    </h1>
                </div>
            </header>
            <div class="category-buttons-container" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; position: relative; z-index: 100;">
                <button class="btn-primary ${currentCategory === 'notice' ? 'active' : ''}" onclick="window.switchCategory('notice')">◆ 公告</button>
                <button class="btn-primary ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">◆ 動畫</button>
                <button class="btn-primary ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">◆ 漫畫</button>
                <button class="btn-primary ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">◆ 電影</button>
            </div>
            <div style="border: 2px solid ${siteSettings.announcement_color || 'var(--neon-blue)'}; padding: 18px; margin-bottom: 30px; font-size: 14px; color: ${siteSettings.announcement_color || '#ffffff'}; text-align: center; border-radius: 10px; background: rgba(0,212,255,0.05); font-weight: bold;">
                <span>📢 ${siteSettings.announcement}</span>
            </div>
	            <div style="margin-bottom: 30px; display: ${isNotice ? 'none' : 'block'};">
	                <input type="text" id="search-input" placeholder="搜尋作品名稱..." value="${filters.search}" oninput="window.handleSearch(this.value)" style="width: 100%; margin-bottom: 20px; font-size: 18px; padding: 15px 25px !important; border-radius: 50px !important;">
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
	                <div id="anime-grid-container" class="anime-grid ${gridColumns === 'mobile' ? 'force-mobile-layout' : ''}" style="display: ${gridColumns === 'mobile' ? 'flex' : 'grid'}; ${gridColumns === 'mobile' ? 'flex-direction: column; gap: 10px;' : `grid-template-columns: repeat(${gridColumns}, 1fr); gap: 20px;`}">
	                    ${paged.length > 0 ? paged.map(item => window.renderCard(item)).join('') : `<div style="text-align: center; padding: 80px 20px; color: var(--text-secondary); font-size: 18px;">[ 未找到相關資料 ]</div>`}
	                </div>
	                <div id="pagination-container" style="display: flex; justify-content: center; gap: 15px; margin-top: 40px;">${window.renderPagination(filtered.length)}</div>
	            </div>
	        </div>
	    `;

    // 重新初始化滾輪捲動監聽
    window.initGlobalScroll();
    window.updateAdminMenu();

    // 更新統計顯示 - 移交給 analytics.js 統一處理，避免覆蓋導致的閃爍和數據丟失
    // const analyticsContainer = document.getElementById('analytics-display');
    // if (analyticsContainer && window.analyticsData) {
    //     const analytics = window.analyticsData;
    //     analyticsContainer.innerHTML = `
    //         <span style="margin-right: 15px;">🖱️ ${(analytics.totalClicks || 0).toLocaleString()}</span>
    //         <span>👤 ${(analytics.uniqueVisitors || 0).toLocaleString()}</span>
    //     `;
    // }

    // 確保詳情彈窗 HTML 存在
    if (!document.getElementById('detailModal')) {
        const modalHTML = `
	            <div id="detailModal" class="modal" onclick="if(event.target===this) window.closeAnimeDetail()">
	                <div class="modal-content">
	                    <button class="btn-primary" style="position: absolute; top: 20px; right: 20px; z-index: 1000; width: 40px; height: 40px; padding: 0;" onclick="window.closeAnimeDetail()">×</button>
	                    <div id="detailContent"></div>
	                </div>
	            </div>
	        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
        // 確保內容容器存在
        const modal = document.getElementById('detailModal');
        if (!modal.querySelector('#detailContent')) {
            modal.querySelector('.modal-content').innerHTML = `
                    <button class="btn-primary" style="position: absolute; top: 20px; right: 20px; z-index: 1000; width: 40px; height: 40px; padding: 0;" onclick="window.closeAnimeDetail()">×</button>
                    <div id="detailContent"></div>
                `;
        }
    }

    // 徹底解決閃爍：內容渲染完成後，顯示 app 並移除遮罩
    app.style.display = 'block';
    app.style.visibility = 'visible';
    app.style.opacity = '1';

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    // 公告板塊异步渲染
    if (isNotice && typeof window.renderAnnouncements === 'function') {
        setTimeout(async () => {
            const container = document.getElementById('discord-section');
            if (container) {
                container.innerHTML = window.renderAnnouncements();
                // 載入分頁內容
                if (window.announcementSystem?.loadInitialContent) {
                    await window.announcementSystem.loadInitialContent();
                }
            }
        }, 100);
    }
};

// 渲染邏輯已遷移至 js/render.js


window.renderPagination = (total) => {
    const pages = Math.ceil(total / itemsPerPage);
    if (pages <= 1) return '';
    let btns = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(pages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    if (start > 1) {
        btns.push(`<button class="btn-primary" style="width: 45px; padding: 10px 0;" onclick="window.changePage(1)">1</button>`);
        if (start > 2) btns.push(`<span style="color: var(--neon-cyan); align-self: center; padding: 0 5px;">...</span>`);
    }
    for (let i = start; i <= end; i++) {
        btns.push(`<button class="btn-primary ${currentPage === i ? 'active' : ''}" style="width: 45px; padding: 10px 0;" onclick="window.changePage(${i})">${i}</button>`);
    }
    if (end < pages) {
        if (end < pages - 1) btns.push(`<span style="color: var(--neon-cyan); align-self: center; padding: 0 5px;">...</span>`);
        btns.push(`<button class="btn-primary" style="width: 45px; padding: 10px 0;" onclick="window.changePage(${pages})">${pages}</button>`);
    }
    return btns.join('');
};

window.changePage = (p) => { currentPage = p; window.renderApp(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
window.handleSearch = (val) => { filters.search = val; currentPage = 1; window.renderApp(); };

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

        const monthMap = { '1月': 1, '2月': 2, '3月': 3, '4月': 4, '5月': 5, '6月': 6, '7月': 7, '8月': 8, '9月': 9, '10月': 10, '11月': 11, '12月': 12 };
        const monthA = monthMap[a.month] || 0;
        const monthB = monthMap[b.month] || 0;
        return sortOrder === 'desc' ? monthB - monthA : monthA - monthB;
    });
};

window.switchCategory = async (cat) => {
    console.log('🔄 切換分類至:', cat);

    // 追蹤板塊切換
    if (typeof window.trackCategorySwitch === 'function') {
        window.trackCategorySwitch(cat);
    }

    currentCategory = cat;
    currentPage = 1;
    adminPage = 1;
    filters = { search: '', genre: '', year: '', rating: '', season: '', month: '' };

    // 判斷目前是否在後台模式
    const isAdminMode = document.querySelector('.admin-container') !== null;

    // 如果是公告，直接渲染前台（公告只有前台模式）
    if (cat === 'notice') {
        currentSection = 'notice';
        window.renderApp();
        return;
    }

    // 如果在後台模式，保持後台狀態，不要切換到前台
    if (isAdminMode) {
        await window.loadData();
        window.renderAdmin();
        return;
    }

    // 前台模式
    currentSection = cat;

    // 只有在前台模式才顯示載入中提示
    const grid = document.getElementById('anime-grid-container');
    const mainContent = document.getElementById('main-grid-content');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transition = 'opacity 0.3s ease';
    }
    if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: var(--neon-cyan); animation: pulse 1.5s ease-in-out infinite;">⚡ 正在同步資料...</div>';

    // 確保資料載入完成後淡入
    setTimeout(() => {
        const mainContent = document.getElementById('main-grid-content');
        if (mainContent) {
            mainContent.style.opacity = '1';
        }
    }, 100);

    await window.loadData();
    window.renderApp();
};

// ========== 留言板管理 ==========
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
                    <div style="color: var(--text-secondary); font-size: 12px;">待審核</div>
                </div>
                <div style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); border-radius: 8px; padding: 15px 20px;">
                    <div style="color: var(--neon-cyan); font-size: 24px; font-weight: bold;">${approved.length}</div>
                    <div style="color: var(--text-secondary); font-size: 12px;">已通過</div>
                </div>
                <div style="background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.3); border-radius: 8px; padding: 15px 20px;">
                    <div style="color: #ff4444; font-size: 24px; font-weight: bold;">${rejected.length}</div>
                    <div style="color: var(--text-secondary); font-size: 12px;">已拒絕</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; border-bottom: 2px solid rgba(0,212,255,0.2); padding-bottom: 15px; flex-shrink: 0;">
                <button class="btn-primary ${window.currentGuestbookTab !== 'pending' ? '' : 'active'}" onclick="window.switchGuestbookTab('pending')">待審核 (${pending.length})</button>
                <button class="btn-primary ${window.currentGuestbookTab !== 'approved' ? '' : 'active'}" onclick="window.switchGuestbookTab('approved')">已通過 (${approved.length})</button>
                <button class="btn-primary ${window.currentGuestbookTab !== 'rejected' ? '' : 'active'}" onclick="window.switchGuestbookTab('rejected')">已拒絕 (${rejected.length})</button>
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
    return filtered.length === 0 ? '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">暫無留言</div>' :
        filtered.map(m => `
            <div style="background: rgba(0,212,255,0.03); border-radius: 8px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: var(--neon-cyan); font-weight: bold;">${escapeHtml(m.nickname)}</span>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--text-secondary); font-size: 12px;">${m.ip_address || '未知IP'}</span>
                        <span style="color: var(--text-secondary); font-size: 12px;">${new Date(m.created_at).toLocaleString('zh-TW')}</span>
                    </div>
                </div>
                <div style="color: var(--text-secondary); margin-bottom: 10px; white-space: pre-wrap;">${escapeHtml(m.content)}</div>
                ${window.currentGuestbookTab === 'pending' ? `
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-primary" style="padding: 6px 12px; font-size: 12px;" onclick="window.moderateGuestbook('${m.id}', 'approved')">✅ 通過</button>
                        <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; border-color: #ff4444; color: #ff4444;" onclick="window.moderateGuestbook('${m.id}', 'rejected')">❌ 拒絕</button>
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
            approved_by: siteSettings.admin_name || '管理員',
            updated_at: new Date().toISOString()
        }).eq('id', id);
        window.showToast('✓ 已處理');
        window.renderAdmin();
    } catch (err) {
        window.showToast('✗ 處理失敗', 'error');
    }
};

window.renderAdmin = () => {
    const app = document.getElementById('app');
    const filtered = animeData.filter(item => item.category === currentCategory);
    const paged = filtered.slice((adminPage - 1) * adminItemsPerPage, adminPage * adminItemsPerPage);

    // 記錄選項管理的滾動位置
    const optionsWrapper = document.getElementById('optionsWrapper');
    const scrollLeft = optionsWrapper ? optionsWrapper.scrollLeft : 0;

    const adminHeaderBar = document.getElementById('adminHeaderBar');
    if (adminHeaderBar) {
        adminHeaderBar.style.display = 'none';
    }

    // 如果只需要更新內容區域，且已經有 admin 框架
    const existingAdminContainer = document.querySelector('.admin-container');
    if (existingAdminContainer) {
        // 只更新內容區域，避免重繪導致的閃爍或狀態丟失
        const contentBody = document.querySelector('.admin-content-body');
        if (contentBody) {
            // 根據當前 Tab 重新渲染內容
            contentBody.innerHTML = window.renderAdminContent(paged, filtered.length);

            // 如果是選項管理，恢復滾動位置
            const newOptionsWrapper = document.getElementById('optionsWrapper');
            if (newOptionsWrapper && scrollLeft > 0) {
                newOptionsWrapper.scrollLeft = scrollLeft;
            }

            // 重新綁定事件
            window.initAdminEventListeners();
            return; // 結束函數，不執行完整的 DOM 重繪
        }
    }

    const adminTabs = [
        { id: 'manage', icon: '📋', label: '作品管理' },
        { id: 'add', icon: '➕', label: '新增作品' },
        { id: 'guestbook', icon: '💬', label: '留言板' },
        { id: 'options', icon: '⚙️', label: '選項管理' },
        { id: 'settings', icon: '🌐', label: '網站設定' }
    ];

    // 管理後台內容渲染函數
    window.renderAdminContent = (pagedData, total) => {
        if (currentAdminTab === 'manage') {
            return `
                <div class="admin-section">
                    <div class="admin-section-header">
                        <div class="admin-category-tabs">
                            <button class="category-tab ${currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">🎬 動畫</button>
                            <button class="category-tab ${currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">📚 漫畫</button>
                            <button class="category-tab ${currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">🎥 電影</button>
                        </div>
                        <div class="admin-actions">
                            <span class="data-count">共 ${total} 筆資料</span>
                            <button class="btn-secondary" onclick="window.exportCSV('${currentCategory}')">📥 匯出</button>
                            <button class="btn-secondary" onclick="window.triggerImport('${currentCategory}')">📤 匯入</button>
                        </div>
                    </div>
                    
                    <div class="admin-toolbar">
                        <div class="toolbar-left">
                            <button class="btn-danger" id="bulk-delete-btn" style="display: none;" onclick="window.bulkDeleteAnime()">
                                🗑 刪除選中 (<span id="selected-count">0</span>)
                            </button>
                            <button class="btn-danger-outline" onclick="window.deleteAllInCategory()">
                                💀 刪除全部
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
                                    <th>作品名稱</th>
                                    <th>年份</th>
                                    <th>季度</th>
                                    <th>評分</th>
                                    <th style="width: 180px;">操作</th>
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
                                            <button class="btn-icon edit" onclick="window.editAnime('${item.id}')" title="編輯">📝</button>
                                            <button class="btn-icon delete" onclick="window.deleteAnime('${item.id}')" title="刪除">✕</button>
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
                        <h3 style="color: var(--neon-cyan); border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">🌐 網站基本設定</h3>
                        <div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">網站標題</label><input type="text" id="set-title" value="${siteSettings.site_title}" style="width: 100%;" onclick="event.stopPropagation()" onfocus="event.stopPropagation()"></div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">標題顏色</label>
                            <div class="color-input-wrapper" style="width: 100%;">
                                <div class="color-swatch" style="background: ${siteSettings.title_color || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-title-color').click()"></div>
                                <input type="color" id="set-title-color" value="${siteSettings.title_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                            </div>
                        </div>
                        <div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">公告內容</label><textarea id="set-announcement" style="width: 100%; height: 120px; resize: vertical;" onclick="event.stopPropagation()" onfocus="event.stopPropagation()">${siteSettings.announcement}</textarea></div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">公告顏色</label>
                            <div class="color-input-wrapper" style="width: 100%;">
                                <div class="color-swatch" style="background: ${siteSettings.announcement_color || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-announcement-color').click()"></div>
                                <input type="color" id="set-announcement-color" value="${siteSettings.announcement_color || '#ffffff'}" onchange="this.previousElementSibling.style.background = this.value">
                            </div>
                        </div>
                    </div>
        
                    <div class="admin-panel-v492" style="background: rgba(0,212,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2);">
                        <h3 style="color: var(--neon-cyan); border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">👤 管理員個人化</h3>
                        <div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">顯示名稱</label><input type="text" id="set-admin-name" value="${siteSettings.admin_name || '管理員'}" style="width: 100%;" onclick="event.stopPropagation()" onfocus="event.stopPropagation()"></div>
                        <div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">頭像網址</label><input type="text" id="set-admin-avatar" value="${siteSettings.admin_avatar || ''}" style="width: 100%;" placeholder="https://..." onclick="event.stopPropagation()" onfocus="event.stopPropagation()"></div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 8px; color: var(--neon-cyan); font-weight: bold;">名稱顏色</label>
                            <div class="color-input-wrapper" style="width: 100%;">
                                <div class="color-swatch" style="background: ${siteSettings.admin_color || '#00ffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-admin-color').click()"></div>
                                <input type="color" id="set-admin-color" value="${siteSettings.admin_color || '#00ffff'}" onchange="this.previousElementSibling.style.background = this.value">
                            </div>
                        </div>
                    </div>

                    <div class="admin-panel-v492" style="background: rgba(0,212,255,0.05); padding: 25px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2); grid-column: 1 / -1;">
                        <h3 style="color: var(--neon-cyan); border-bottom: 2px solid var(--neon-blue); padding-bottom: 10px; margin-bottom: 20px; font-family: 'Orbitron';">🎨 卡片顏色設定</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                            <div>
                                <label style="font-size: 13px; color: var(--neon-cyan); display: block; margin-bottom: 8px;">作品名稱</label>
                                <div class="color-input-wrapper" style="width: 100%;">
                                    <div class="color-swatch" style="background: ${optionsData.category_colors?.name || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-name-color').click()"></div>
                                    <input type="color" id="set-name-color" value="${optionsData.category_colors?.name || '#ffffff'}" onchange="window.updateCategoryColorDirect('name', this.value); this.previousElementSibling.style.background = this.value">
                                </div>
                            </div>
                            <div>
                                <label style="font-size: 13px; color: var(--neon-cyan); display: block; margin-bottom: 8px;">簡介文字</label>
                                <div class="color-input-wrapper" style="width: 100%;">
                                    <div class="color-swatch" style="background: ${optionsData.category_colors?.desc || '#ffffff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-desc-color').click()"></div>
                                    <input type="color" id="set-desc-color" value="${optionsData.category_colors?.desc || '#ffffff'}" onchange="window.updateCategoryColorDirect('desc', this.value); this.previousElementSibling.style.background = this.value">
                                </div>
                            </div>
                            <div>
                                <label style="font-size: 13px; color: var(--neon-cyan); display: block; margin-bottom: 8px;">按鈕顏色</label>
                                <div class="color-input-wrapper" style="width: 100%;">
                                    <div class="color-swatch" style="background: ${optionsData.category_colors?.btn_bg || '#00d4ff'}; width: 100%; height: 40px; border-radius: 8px;" onclick="document.getElementById('set-btn-color').click()"></div>
                                    <input type="color" id="set-btn-color" value="${optionsData.category_colors?.btn_bg || '#00d4ff'}" onchange="window.updateCategoryColorDirect('btn_bg', this.value); this.previousElementSibling.style.background = this.value">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="grid-column: 1 / -1; text-align: center; margin-top: 20px;">
                        <button class="btn-primary" style="width: 300px; padding: 20px; font-size: 18px; border-radius: 12px; box-shadow: 0 0 20px rgba(0,212,255,0.2);" onclick="window.saveSettings()">💾 儲存所有設定</button>
                    </div>
                </div>
            `;
        } else if (currentAdminTab === 'guestbook') {
            return `<div id="guestbook-admin-container" style="padding: 20px; text-align: center; color: var(--neon-cyan);">載入中...</div>
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
                    <h2 style="font-family: 'Orbitron', sans-serif; color: var(--neon-cyan); margin: 0;">⚙️ 管理後台</h2>
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
                        <span class="nav-icon">↩️</span>
                        <span class="nav-label">返回前台</span>
                    </button>
                </div>
            </aside>
            <main class="admin-main">
                <div class="admin-content-header">
                    <h1 style="font-family: 'Orbitron', sans-serif; color: var(--neon-cyan); margin: 0;">${adminTabs.find(t => t.id === currentAdminTab)?.label}</h1>
                    <div class="admin-breadcrumb">
                        <span>後台</span>
                        <span class="separator">/</span>
                        <span>${adminTabs.find(t => t.id === currentAdminTab)?.label}</span>
                    </div>
                </div>
                <div id="admin-content-body" class="admin-content-body">
                    ${currentAdminTab === 'guestbook' ? '<div id="guestbook-loading">載入中...</div>' : window.renderAdminContent(paged, filtered.length)}
                </div>
            </main>
        </div>
    `;

    // 處理需要異步載入的標籤（留言板）
    if (currentAdminTab === 'guestbook') {
        const loadingDiv = document.getElementById('guestbook-loading');
        if (loadingDiv) {
            window.renderGuestbookAdmin().then(html => {
                loadingDiv.outerHTML = html;
            });
        }
    }

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
    // 如果當前不在 admin 模式，切換到 admin 模式
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
                <input type="text" id="new-list-name" placeholder="輸入新列表名稱 (如: 載體)" style="width: 250px; padding: 8px; border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; background: rgba(0,0,0,0.3); color: #fff;">
                <button class="btn-primary" onclick="window.addNewCustomList()">＋ 新增列表</button>
            </div>
            
            <div class="options-scroll-wrapper">
                <div style="min-width: 400px; flex: 1; display: flex; flex-direction: column; gap: 15px;">
                    <h3 style="color: var(--neon-cyan); margin: 0 0 10px 0;">📋 選項內容管理</h3>
                    
                    ${allKeys.map(key => `
                        <div class="form-custom-list" style="background: rgba(0,212,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(0,212,255,0.15);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <strong style="color: var(--neon-cyan); font-size: 15px;">${key === 'recommendation' ? '評分' : key === 'episodes' ? '集數' : key === 'season' ? '季度' : key.charAt(0).toUpperCase() + key.slice(1)}</strong>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 12px; color: var(--text-secondary);">標籤色:</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" value="${categoryColors[key] || '#00d4ff'}" onchange="window.updateCategoryColor('${key}', this.value)">
                                        <div class="color-swatch" style="background-color: ${categoryColors[key] || '#00d4ff'}; width: 18px; height: 18px;" onclick="this.previousElementSibling.click()"></div>
                                    </div>
                                    ${customKeys.includes(key) ? `<button class="btn-primary" onclick="window.deleteCustomList('${key}')" style="font-size: 11px; padding: 4px 8px; border-color: #ff4444; color: #ff4444; margin-left: 10px;">✕</button>` : ''}
                                </div>
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${(optionsData[key] || []).map((opt, idx) => `
                                    <div id="opt-${key}-${idx}" style="display: flex; align-items: center; background: rgba(0,212,255,0.1); padding: 4px 8px; border-radius: 15px; border: 1px solid rgba(0,212,255,0.2);">
                                        <span id="opt-text-${key}-${idx}" style="font-size: 13px; margin-right: 4px;">${opt}</span>
                                        <input type="text" id="opt-input-${key}-${idx}" value="${opt}" style="display: none; width: 80px; padding: 2px 6px; font-size: 12px; background: rgba(0,0,0,0.5); border: 1px solid var(--neon-cyan); border-radius: 4px; color: #fff;" onkeydown="window.handleOptionKeydown(event, '${key}', ${idx}, '${opt}')" onblur="window.handleOptionBlur('${key}', ${idx}, '${opt}')">
                                        
                                        ${key === 'rating' ? `
                                            <div class="color-input-wrapper" style="margin-left: 4px; margin-right: 4px;">
                                                <input type="color" value="${ratingColors[opt] || '#b026ff'}" onchange="window.updateRatingColor('${opt}', this.value)">
                                                <div class="color-swatch" style="background-color: ${ratingColors[opt] || '#b026ff'}; width: 12px; height: 12px; border-radius: 50%; border: none;" onclick="this.previousElementSibling.click()"></div>
                                            </div>
                                        ` : ''}

                                        <button class="btn-icon edit" onclick="window.editOption('${key}', ${idx}, '${opt}')" style="width: 24px; height: 24px; font-size: 12px; margin-left: ${key === 'rating' ? '2px' : '4px'};" title="編輯">✎</button>
                                        <button class="btn-icon delete" onclick="window.deleteOptionItem('${key}', ${idx})" style="width: 24px; height: 24px; font-size: 12px; margin-left: 2px;" title="刪除">✕</button>
                                    </div>
                                `).join('')}
                                <div style="display: flex; gap: 6px;">
                                    <input type="text" id="add-opt-${key}" placeholder="新增" style="font-size: 12px; padding: 4px 8px; width: 80px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; color: #fff;">
                                    <button class="btn-primary" onclick="window.addOptionItem('${key}')" style="font-size: 11px; padding: 4px 8px;">＋</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}

                    <div class="form-custom-list" style="background: rgba(0,212,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(0,212,255,0.15);">
                        <div style="margin-bottom: 10px;"><strong style="color: var(--neon-cyan);">🎨 其他全域顏色設定</strong></div>
                        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                 <span style="font-size: 13px;">作品名稱預設色</span>
                                 <div class="color-input-wrapper">
                                    <input type="color" value="${categoryColors['name'] || '#ffffff'}" onchange="window.updateCategoryColor('name', this.value)">
                                    <div class="color-swatch" style="background-color: ${categoryColors['name'] || '#ffffff'}; width: 20px; height: 20px;" onclick="this.previousElementSibling.click()"></div>
                                </div>
                            </div>
                             <div style="display: flex; align-items: center; gap: 8px;">
                                 <span style="font-size: 13px;">按鈕背景預設色</span>
                                 <div class="color-input-wrapper">
                                    <input type="color" value="${categoryColors['btn_bg'] || '#00d4ff'}" onchange="window.updateCategoryColor('btn_bg', this.value)">
                                    <div class="color-swatch" style="background-color: ${categoryColors['btn_bg'] || '#00d4ff'}; width: 20px; height: 20px;" onclick="this.previousElementSibling.click()"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
};

// 編輯選項名稱
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

// 處理編輯框鍵盤事件
window.handleOptionKeydown = (event, key, idx, oldValue) => {
    if (event.key === 'Enter') {
        window.saveOptionEdit(key, idx, oldValue);
    } else if (event.key === 'Escape') {
        const inputEl = document.getElementById(`opt-input-${key}-${idx}`);
        const textEl = document.getElementById(`opt-text-${key}-${idx}`);
        inputEl.style.display = 'none';
        textEl.style.display = 'inline';
    }
};

// 處理編輯框失去焦點
window.handleOptionBlur = (key, idx, oldValue) => {
    const inputEl = document.getElementById(`opt-input-${key}-${idx}`);
    if (inputEl.style.display !== 'none') {
        window.saveOptionEdit(key, idx, oldValue);
    }
};

// 完成編輯選項
window.saveOptionEdit = async (key, idx, oldValue) => {
    const inputEl = document.getElementById(`opt-input-${key}-${idx}`);
    const newValue = inputEl.value.trim();
    const textEl = document.getElementById(`opt-text-${key}-${idx}`);

    if (!newValue || newValue === oldValue) {
        inputEl.style.display = 'none';
        textEl.style.display = 'inline';
        return;
    }

    // 創建確認視窗
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
                        確定要將「<span style="color: #ff6b6b;">${oldValue}</span>」改為「<span style="color: #00ff88;">${newValue}</span>」嗎？<br>
                        <span style="color: rgba(255,255,255,0.6); font-size: 13px;">所有使用「${oldValue}」的作品都會自動更新</span>
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button id="${confirmId}-cancel" class="btn-danger-outline">取消</button>
                        <button id="${confirmId}-ok" class="btn-primary">確定</button>
                    </div>
                </div>
            </div>
        `;
    document.body.insertAdjacentHTML('beforeend', confirmHTML);

    // 等待 DOM 更新後再綁定事件
    await new Promise(resolve => setTimeout(resolve, 10));

    const confirmModal = document.getElementById(confirmId);
    const okBtn = document.getElementById(`${confirmId}-ok`);
    const cancelBtn = document.getElementById(`${confirmId}-cancel`);

    if (!okBtn || !cancelBtn) {
        console.error('確認視窗元素未找到');
        return;
    }

    // 綁定取消按鈕
    cancelBtn.onclick = () => {
        confirmModal.remove();
        inputEl.style.display = 'none';
        textEl.style.display = 'inline';
    };

    // 綁定確定按鈕 - 開始更新
    okBtn.onclick = async () => {
        confirmModal.remove();
        inputEl.style.display = 'none';
        textEl.style.display = 'inline';

        // 創建進度動畫
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
                    <div style="color: var(--neon-cyan); font-size: 18px;">更新中請稍後...</div>
                    <div id="${progressId}-status" style="
                        color: rgba(0,212,255,0.7);
                        font-size: 14px;
                        min-width: 120px;
                        text-align: center;
                    ">0 / 0</div>
                </div>
            `;
        document.body.insertAdjacentHTML('beforeend', progressHTML);

        // 添加旋轉動畫
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
            // 1. 更新選項列表中的名稱
            if (!optionsData[key]) {
                optionsData[key] = [];
            }
            const optionsList = optionsData[key];
            const optIndex = optionsList.indexOf(oldValue);
            if (optIndex > -1) {
                optionsList[optIndex] = newValue;
            }

            // 2. 更新資料庫中的 options_data
            const client = window.supabaseManager?.getClient();
            if (client) {
                try {
                    await client.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) });
                } catch (dbErr) {
                    console.warn('儲存 options_data 失敗:', dbErr);
                }
            }

            // 3. 更新所有使用該標籤的作品
            if (client) {
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

                    // 延遲讓使用者看到完成
                    await new Promise(r => setTimeout(r, 300));

                    // 移除進度動畫
                    const progressEl = document.getElementById(progressId);
                    if (progressEl) progressEl.remove();
                    style.remove();

                    window.showToast(`✓ 已更新「${oldValue}」→「${newValue}」，共 ${updatedCount} 個作品`);
                } catch (updateErr) {
                    console.warn('更新作品失敗:', updateErr);
                    const progressEl = document.getElementById(progressId);
                    if (progressEl) progressEl.remove();
                    style.remove();
                    window.showToast('✓ 選項已更新（作品更新失敗）');
                }
            } else {
                const progressEl = document.getElementById(progressId);
                if (progressEl) progressEl.remove();
                style.remove();
                window.showToast('✓ 已更新選項（離線模式）');
            }

            // 重新載入資料並刷新
            try {
                await window.loadData();
            } catch (loadErr) {
                console.warn('loadData 失敗:', loadErr);
            }
            window.renderAdmin();

        } catch (err) {
            console.error('更新選項失敗:', err);
            const progressEl = document.getElementById(progressId);
            if (progressEl) progressEl.remove();
            style.remove();
            window.showToast('✗ 更新失敗：' + (err.message || err), 'error');
        }
    };
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

    const client = window.supabaseManager?.getClient();
    if (client) {
        await client.from('site_settings').upsert({ id: 'custom_labels', value: JSON.stringify(siteSettings.custom_labels) });
    }

    window.renderAdmin();
};

window.deleteCustomList = async (key) => {
    if (!confirm('確定要刪除此列表嗎？相關設定將會消失。')) return;
    optionsData.custom_lists = optionsData.custom_lists.filter(k => k !== key);
    delete optionsData[key];
    await window.saveOptionsToDB();
    window.renderAdmin();
};

window.updateCategoryColor = async (key, color) => {
    if (!optionsData.category_colors) optionsData.category_colors = {};
    optionsData.category_colors[key] = color;
    // 立即更新顯示
    const input = document.activeElement;
    if (input && input.nextElementSibling && input.nextElementSibling.classList.contains('color-swatch')) {
        input.nextElementSibling.style.backgroundColor = color;
    }
    await window.saveOptionsToDB(true); // Skip render
};

window.updateRatingColor = async (rating, color) => {
    if (!optionsData.rating_colors) optionsData.rating_colors = {};
    optionsData.rating_colors[rating] = color;
    // 立即更新顯示
    const input = document.activeElement;
    if (input && input.nextElementSibling && input.nextElementSibling.classList.contains('color-swatch')) {
        input.nextElementSibling.style.backgroundColor = color;
    }
    await window.saveOptionsToDB(true); // Skip render
};


// 作品表單渲染函數 - 側欄佈局版
window.renderAnimeForm = (item = {}) => {
    const isEdit = !!item.id;
    const genres = Array.isArray(item.genre) ? item.genre : [];
    const extraData = item.extra_data || {};

    return `
            <div class="admin-section">
                <div class="admin-section-header" style="margin-bottom: 15px;">
                    <h3 style="color: var(--neon-cyan); margin: 0;">${isEdit ? '📝 編輯作品' : '➕ 新增作品'}</h3>
                    <button class="btn-primary" onclick="window.switchAdminTab('manage')">✕ 返回</button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 11px; color: var(--neon-cyan);">作品名稱</label>
                    <input type="text" id="form-name" value="${item.name || ''}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 14px; font-weight: bold;">
                </div>

                <div style="display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start;">
                    
                    <!-- 左欄：屬性設定 -->
                    <div style="display: flex; flex-direction: column; gap: 12px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(0,212,255,0.1);">
                        <div style="color: var(--neon-cyan); font-size: 12px; border-bottom: 1px solid rgba(0,212,255,0.2); padding-bottom: 5px; margin-bottom: 5px;">基本屬性</div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">分類</label>
                                <select id="form-category" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="anime" ${item.category === 'anime' ? 'selected' : ''}>動畫</option>
                                    <option value="manga" ${item.category === 'manga' ? 'selected' : ''}>漫畫</option>
                                    <option value="movie" ${item.category === 'movie' ? 'selected' : ''}>電影</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">年份</label>
                                <select id="form-year" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="">-</option>
                                    ${(optionsData.year || []).map(y => `<option value="${y}" ${item.year === y ? 'selected' : ''}>${y}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">季度</label>
                                <select id="form-season" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="">-</option>
                                    ${(optionsData.season || []).map(s => `<option value="${s}" ${item.season === s ? 'selected' : ''}>${s}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">月份</label>
                                <select id="form-month" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="">-</option>
                                    ${(optionsData.month || []).map(m => `<option value="${m}" ${item.month === m ? 'selected' : ''}>${m}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="font-size: 11px; color: var(--text-secondary);">集數</label>
                                <input type="text" id="form-episodes" value="${item.episodes || ''}" placeholder="12" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="font-size: 11px; color: var(--neon-purple);">評分</label>
                                <select id="form-rating" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--neon-purple); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="">-</option>
                                    ${(optionsData.rating || []).map(r => `<option value="${r}" ${item.rating === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 11px; color: var(--neon-cyan);">推薦度</label>
                                <select id="form-recommendation" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 13px;">
                                    <option value="">-</option>
                                    ${(optionsData.recommendation || []).map(r => `<option value="${r}" ${item.recommendation === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        ${(optionsData.custom_lists || []).length > 0 ? `
                            <div style="color: var(--neon-cyan); font-size: 12px; border-bottom: 1px solid rgba(0,212,255,0.2); padding-bottom: 5px; margin-top: 5px; margin-bottom: 5px;">自訂選項</div>
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

                        <div style="color: var(--neon-cyan); font-size: 12px; border-bottom: 1px solid rgba(0,212,255,0.2); padding-bottom: 5px; margin-top: 5px; margin-bottom: 5px;">顏色設定</div>
                        <div style="display: flex; gap: 15px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="color" id="form-name-color" value="${item.name_color || '#ffffff'}" style="width: 24px; height: 24px; border: none; padding: 0; background: none; cursor: pointer;">
                                <span style="font-size: 11px; color: #aaa;">名稱</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="color" id="form-star-color" value="${item.star_color || '#ffcc00'}" style="width: 24px; height: 24px; border: none; padding: 0; background: none; cursor: pointer;">
                                <span style="font-size: 11px; color: #aaa;">星星</span>
                            </div>
                        </div>
                    </div>

                    <!-- 右欄：內容編輯 -->
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div>
                            <label style="font-size: 11px; color: var(--neon-cyan);">海報網址</label>
                            <input type="text" id="form-poster" value="${item.poster_url || ''}" placeholder="https://..." style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 8px; color: #fff; font-size: 13px;">
                        </div>

                        <div>
                            <label style="font-size: 11px; color: var(--neon-cyan);">類型標籤</label>
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
                            <label style="font-size: 11px; color: var(--neon-cyan);">作品簡介</label>
                            <textarea id="form-desc" rows="12" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 10px; color: #fff; font-size: 13px; line-height: 1.5; resize: vertical;">${item.description || ''}</textarea>
                        </div>

                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                <label style="font-size: 11px; color: var(--neon-cyan);">相關連結</label>
                                <button class="btn-primary" onclick="window.addLinkRow()" style="font-size: 10px; padding: 2px 8px; height: 24px;">＋ 新增連結</button>
                            </div>
                            <div id="links-list" style="display: flex; flex-direction: column; gap: 8px;">
                                ${(item.links || []).map(link => `
                                    <div style="display: flex; gap: 8px;">
                                        <input type="text" placeholder="名稱" class="link-name" value="${link.name || ''}" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 12px;">
                                        <input type="text" placeholder="網址" class="link-url" value="${link.url || ''}" style="flex: 3; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 6px; padding: 6px; color: #fff; font-size: 12px;">
                                        <button class="btn-icon delete" style="width: 30px; height: 30px;" onclick="this.parentElement.remove()">✕</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: center; border-top: 1px solid rgba(0,212,255,0.1); padding-top: 20px;">
                    <button onclick="window.saveAnime()" style="background: rgba(0,212,255,0.2); border: 1px solid var(--neon-cyan); border-radius: 6px; padding: 10px 50px; color: var(--neon-cyan); cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(0,212,255,0.2);">
                        💾 ${isEdit ? '儲存變更' : '新增作品'}
                    </button>
                </div>
            </div>
        `;
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

        const btnBg = document.getElementById('form-btn-bg');
        if (btnBg && btnBg.value) extra_data.btn_bg = btnBg.value;

        const starColorEl = document.getElementById('form-star-color');
        const nameColorEl = document.getElementById('form-name-color');
        const descColorEl = document.getElementById('form-desc-color');

        const selectedGenres = Array.from(document.querySelectorAll('input[name="form-genre"]:checked')).map(cb => cb.value);

        const payload = {
            name: nameEl.value,
            genre: selectedGenres,
            poster_url: document.getElementById('form-poster')?.value || '',
            category: document.getElementById('form-category')?.value || 'anime',
            links: Array.from(document.querySelectorAll('#links-list > div')).map(row => {
                const n = row.querySelector('.link-name');
                const u = row.querySelector('.link-url');
                return (n && u) ? { name: n.value, url: u.value } : null;
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
        if (!client) throw new Error('Supabase 未連接');

        let { error } = editId ?
            await client.from('anime_list').update(payload).eq('id', editId) :
            await client.from('anime_list').insert([payload]);

        if (error) {
            // 如果是欄位缺失錯誤，嘗試不帶 extra_data 再次儲存
            if (error.message.includes('extra_data')) {
                window.showToast('⚠️ 偵測到資料庫欄位缺失，正在嘗試相容模式儲存...', 'info');
                delete payload.extra_data;
                const retry = editId ?
                    await client.from('anime_list').update(payload).eq('id', editId) :
                    await client.from('anime_list').insert([payload]);
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
window.addOptionItem = async (key) => {
    const input = document.getElementById(`add-opt-${key}`);
    const value = input?.value?.trim();
    if (!value) return window.showToast('✗ 請輸入選項名稱', 'error');
    try {
        if (!optionsData[key]) optionsData[key] = [];
        optionsData[key].push(value);
        input.value = '';
        await window.saveOptionsToDB();
        window.renderAdmin();
        window.showToast('✓ 已新增選項');
    } catch (err) {
        console.error('新增選項失敗:', err);
        window.showToast('✗ 新增失敗：' + (err.message || err), 'error');
    }
};

window.deleteOptionItem = async (key, idx) => {
    if (!confirm('確定要刪除此選項嗎？')) return;
    try {
        if (optionsData[key] && optionsData[key][idx] !== undefined) {
            optionsData[key].splice(idx, 1);
            await window.saveOptionsToDB();
            window.renderAdmin();
            window.showToast('✓ 已刪除選項');
        }
    } catch (err) {
        console.error('刪除選項失敗:', err);
        window.showToast('✗ 刪除失敗：' + (err.message || err), 'error');
    }
};

window.updateCategoryColor = async (key, color) => {
    if (!optionsData.category_colors) optionsData.category_colors = {};
    optionsData.category_colors[key] = color;
    await window.saveOptionsToDB();
    window.renderAdmin();
};

window.updateRatingItemColor = async (opt, color) => {
    if (!optionsData.rating_colors) optionsData.rating_colors = {};
    optionsData.rating_colors[opt] = color;
    await window.saveOptionsToDB();
    window.renderAdmin();
};

window.triggerColorPicker = (el) => {
    const input = el.nextElementSibling;
    if (input && input.type === 'color') input.click();
};

window.saveOptionsToDB = async (skipRender = false) => {
    const client = window.supabaseManager?.getClient();
    if (!client) {
        console.warn('Supabase 未連接，無法儲存設定');
        return;
    }
    try {
        await client.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) });
        window.showToast('✓ 設定已同步');
    } catch (err) {
        console.error('儲存 options_data 失敗:', err);
        window.showToast('✗ 儲存設定失敗', 'error');
    }

    if (skipRender) return;

    if (typeof window.renderApp === 'function') {
        // 如果正在管理後台，不要重繪整個 APP，只重新渲染後台
        if (isAdminLoggedIn && document.querySelector('.admin-container')) {
            // 這裡不執行任何動作，因為 admin-panel 已經是獨立的渲染邏輯
            // 顏色更新只需更新變數，不用重繪整個 app
        } else {
            try { window.renderApp(); } catch (e) { console.warn('renderApp 失敗:', e); }
        }
    }
};

window.exportCSV = (cat) => {
    const filtered = animeData.filter(item => item.category === cat);
    if (filtered.length === 0) return window.showToast('✗ 無資料可匯出', 'error');

    const baseFields = [
        { key: 'name', label: '作品名稱' },
        { key: 'poster_url', label: '海報網址' },
        { key: 'description', label: '簡介內容' },
        { key: 'star_color', label: '星星顏色' },
        { key: 'name_color', label: '名稱顏色' },
        { key: 'desc_color', label: '簡介顏色' },
        { key: 'links', label: '相關連結' },
        { key: 'extra_data', label: '額外資料' }
    ];

    const optionFields = [
        { key: 'year', label: '年份' },
        { key: 'month', label: '月份' },
        { key: 'season', label: '季度' },
        { key: 'genre', label: '類型' },
        { key: 'episodes', label: '集數' },
        { key: 'rating', label: '評分' },
        { key: 'recommendation', label: '推薦度' }
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
    window.showToast('✓ 匯出成功 (中文標題)');
};

window.triggerImport = (cat) => {
    console.log('🎯 設定匯入目標板塊:', cat);
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

            // 專業的 CSV 解析器，支援多行欄位和引號
            const parseCSV = (text) => {
                const rows = [];
                let currentRow = [];
                let currentField = '';
                let inQuotes = false;

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const nextChar = text[i + 1];

                    // 引號處理
                    if (char === '"') {
                        if (inQuotes && nextChar === '"') {
                            // 跳過轉義的引號
                            currentField += '"';
                            i++;
                        } else {
                            inQuotes = !inQuotes;
                        }
                    }
                    // 逗號處理
                    else if (char === ',' && !inQuotes) {
                        currentRow.push(currentField);
                        currentField = '';
                    }
                    // 換行處理
                    else if ((char === '\n' || char === '\r') && !inQuotes) {
                        // 跳過 \r\n 組合
                        if (char === '\r' && nextChar === '\n') {
                            i++;
                        }
                        // 完成當前行
                        if (currentField.trim() || currentRow.length > 0) {
                            currentRow.push(currentField);
                            rows.push(currentRow);
                        }
                        currentRow = [];
                        currentField = '';
                    }
                    // 其他字符
                    else {
                        currentField += char;
                    }
                }

                // 處理最後一行
                if (currentField.trim() || currentRow.length > 0) {
                    currentRow.push(currentField);
                    rows.push(currentRow);
                }

                return rows;
            };

            const allRows = parseCSV(csv);
            if (allRows.length < 2) return window.showToast('✗ CSV 檔案無內容', 'error');

            const labelMap = {
                '作品名稱': 'name', '海報網址': 'poster_url', '簡介內容': 'description',
                '星星顏色': 'star_color', '名稱顏色': 'name_color', '簡介顏色': 'desc_color',
                '相關連結': 'links', '額外資料': 'extra_data',
                '年份': 'year', '月份': 'month', '季度': 'season',
                '集數': 'episodes', '評分': 'rating', '推薦度': 'recommendation'
            };
            if (siteSettings.custom_labels) {
                Object.entries(siteSettings.custom_labels).forEach(([key, label]) => { labelMap[label] = key; });
            }

            // 解析標題行
            const rawHeaders = allRows[0].map(h => h.trim().replace(/^"|"$/g, ''));
            const headers = rawHeaders.map(h => labelMap[h] || h);

            // 定義資料庫中實際存在的標準欄位
            const dbStandardFields = ['name', 'poster_url', 'description', 'star_color', 'name_color', 'desc_color', 'links', 'extra_data', 'year', 'month', 'season', 'episodes', 'rating', 'recommendation', 'category'];

            const items = [];
            for (let i = 1; i < allRows.length; i++) {
                const values = allRows[i];

                // 跳過空行
                if (values.length === 1 && values[0].trim() === '') continue;

                const item = { extra_data: {} };
                headers.forEach((h, idx) => {
                    let val = (values[idx] || '').trim().replace(/^"|"$/g, '').replace(/""/g, '"');

                    if (dbStandardFields.includes(h)) {
                        // 處理標準欄位
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
                        // 處理自定義欄位，歸類到 extra_data
                        item.extra_data[h] = val;
                    }
                });

                item.category = importTarget;
                delete item.id;

                // 跳過無效的資料（沒有作品名稱）
                if (!item.name || !item.name.trim()) continue;

                items.push(item);
            }

            const client = window.supabaseManager?.getClient();
            if (!client) throw new Error('Supabase 未連接');
            const { error } = await client.from('anime_list').insert(items);
            if (error) throw error;

            window.showToast(`✓ 成功匯入 ${items.length} 筆資料`);
            await window.loadData();
            window.renderAdmin();
        } catch (err) {
            console.error('Import error:', err);
            window.showToast('✗ 匯入失敗：' + err.message, 'error');
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
        if (!client) throw new Error('Supabase 未連接');

        // 更新 optionsData 中的顏色
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

        // 保存選項資料（包含顏色設定）
        await client.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(optionsData) });

        // 同步更新全域變數
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
        window.showToast('✓ 設定已更新');
        window.renderAdmin();
        window.renderApp();
    } catch (err) {
        console.error('Save settings error:', err);
        window.showToast('✗ 更新失敗', 'error');
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
    if (!confirm('確定要刪除此作品嗎？')) return;
    try {
        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase 未連接');
        const { error } = await client.from('anime_list').delete().eq('id', id);
        if (error) throw error;
        window.showToast('✓ 已刪除');
        await window.loadData();
        window.renderAdmin();
    } catch (err) { window.showToast('✗ 刪除失敗', 'error'); }
};

window.deleteAllInCategory = async () => {
    // 統計該板塊有多少作品
    const count = animeData.filter(a => a.category === currentCategory).length;
    if (count === 0) {
        window.showToast('✗ 該板塊沒有作品', 'warning');
        return;
    }

    if (!confirm(`⚠️ 確定要刪除全部 ${count} 個 ${currentCategory} 作品嗎？\n此操作無法復原！`)) return;

    // 二次確認
    if (!confirm(`再次確認：確定要刪除全部 ${count} 個 ${currentCategory} 作品？`)) return;

    try {
        window.showToast('🗑 正在刪除...', 'info');

        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase 未連接');
        const { error } = await client.from('anime_list').delete().eq('category', currentCategory);
        if (error) throw error;

        window.showToast(`✓ 已刪除全部 ${count} 個 ${currentCategory} 作品`);
        await window.loadData();
        window.renderAdmin();
    } catch (err) {
        console.error('Delete all error:', err);
        window.showToast('✗ 刪除失敗：' + err.message, 'error');
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

    if (!confirm(`確定要刪除選中的 ${ids.length} 個作品嗎？`)) return;

    try {
        const client = window.supabaseManager?.getClient();
        if (!client) throw new Error('Supabase 未連接');
        const { error } = await client.from('anime_list').delete().in('id', ids);
        if (error) throw error;
        window.showToast('✓ 公告已刪除');
        setTimeout(() => window.renderAnnouncements(), 300);
    } catch (err) {
        console.error('Delete announcement error:', err);
        window.showToast('✗ 刪除失敗：' + (err?.message || '未知錯誤'), 'error');
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
            btn.textContent = '✕';
        } else {
            menu.style.setProperty('display', 'none', 'important');
            menu.classList.remove('active');
            btn.textContent = '☰';
        }
    }
};

// 點擊頁面其他地方關閉菜單
document.addEventListener('click', (e) => {
    const menu = document.getElementById('systemMenu');
    const btn = document.querySelector('.header-menu-btn');
    if (menu && menu.classList.contains('active') && !menu.contains(e.target) && e.target !== btn) {
        menu.style.setProperty('display', 'none', 'important');
        menu.classList.remove('active');
        if (btn) btn.textContent = '☰';
    }
});

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

// ========== 主題切換 ==========
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
        if (icon) icon.textContent = '🌙';
        if (text) text.textContent = '深色';
    } else {
        if (icon) icon.textContent = '☀️';
        if (text) text.textContent = '淺色';
    }
};

// ========== 收藏功能 ==========
window.toggleFavorite = (itemId) => {
    if (window.usabilityManager) {
        const isFavorite = window.usabilityManager.toggleFavorite(itemId);
        window.showToast(isFavorite ? '⭐ 已加入收藏' : '💔 已移除收藏');
        return isFavorite;
    }
    return false;
};

window.isFavorite = (itemId) => {
    return window.usabilityManager?.isFavorite(itemId) || false;
};

// ========== 搜尋歷史 ==========
window.addToSearchHistory = (query, filters = {}) => {
    if (window.usabilityManager) {
        window.usabilityManager.addSearch(query, filters);
    }
};

window.getSearchHistory = () => {
    return window.usabilityManager?.getSearchHistory() || [];
};

// ========== 最近瀏覽 ==========
window.addToRecentViews = (item) => {
    if (window.usabilityManager) {
        window.usabilityManager.addRecentView(item);
    }
};

// ========== 資料備份 ==========
window.exportUserData = () => {
    if (window.usabilityManager) {
        window.usabilityManager.exportAllData();
        window.showToast('📦 資料已匯出');
    }
};

window.importUserData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (window.usabilityManager) {
        window.usabilityManager.importData(file)
            .then(() => {
                window.showToast('📥 資料已匯入');
                window.renderApp();
            })
            .catch(err => {
                window.showToast('✗ 匯入失敗：' + err.message, 'error');
            });
    }
};

// ========== 初始化主題 ==========
window.initTheme = () => {
    if (window.usabilityManager) {
        window.updateThemeUI();
    }
};

// Discord integration disabled - webhook URLs must not be exposed in client code
// Announcements are managed via Supabase database

/* 滾輪支持所有滾動軸（排除輸入框） */
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('wheel', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }
        const target = e.target.closest('[class*="scroll"], [class*="horizontal"], .horizontal-scroll-container, .scroll-row-v35');
        if (target && (target.scrollWidth > target.clientWidth || target.scrollHeight > target.clientHeight)) {
            if (target.scrollWidth > target.clientWidth) {
                e.preventDefault();
                target.scrollLeft += e.deltaY > 0 ? 50 : -50;
            }
        }
    }, { passive: false });
});

// 啟動應用程式
setTimeout(() => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.initApp());
    } else {
        window.initApp();
    }
    // 初始化主題
    window.initTheme();
}, 0);
