/**
 * atmosphere.js - 處理全域動態背景（粒子連線網絡）與遊標管理
 * ACG 收藏庫 v8.0.0
 */

// ==========================================
// 遊標管理器 (Cursor Manager)
// ==========================================
window.CursorManager = {
    themes: {
        bocchi: { name: '🎸 孤獨搖滾', type: 'image' },
        furina: { name: '🌊 芙寧娜', type: 'image' },
        genshin: { name: '✨ 原神通用', type: 'image' },
        witch: { name: '🧙‍♀️ 魔女之旅', type: 'image' },
        standard: { name: '⚪ 標準樣式', type: 'image' }
    },

    init() {
        const savedTheme = localStorage.getItem('cursorTheme') || 'bocchi';
        this.apply(savedTheme);
    },

    apply(themeId) {
        if (!this.themes[themeId]) themeId = 'bocchi';

        const root = document.body;

        // 使用相對於根目錄的路徑 (assets 在根目錄)
        // 這樣可以處理 /anime-manager/ 等子路徑部署情況
        let basePath = './assets/cursors';

        console.log(`[CursorManager] 套用主題: ${themeId}, BasePath: ${basePath}`);
        localStorage.setItem('cursorTheme', themeId);

        // 設定 CSS 變數
        // 使用絕對路徑無效 (file://)，必須依賴瀏覽器的相對路徑解析
        // 移除 ./ 嘗試讓瀏覽器自行決定
        root.style.setProperty('--cur-pointer', `url('${basePath}/${themeId}-pointer.cur'), auto`);
        root.style.setProperty('--cur-finger', `url('${basePath}/${themeId}-finger.cur'), pointer`);
        root.style.setProperty('--cur-pen', `url('${basePath}/${themeId}-pen.cur'), text`);
        root.style.setProperty('--cur-nah', `url('${basePath}/${themeId}-nah.cur'), not-allowed`);

        // 發送 Toast 通知 (如果在互動中)
        if (window.showToast && document.visibilityState === 'visible') {
            window.showToast(`✨ 遊標主題已切換：${this.themes[themeId].name}`);
        }
    },

    getThemeList() {
        return Object.entries(this.themes).map(([id, data]) => ({
            id,
            name: data.name
        }));
    }
};

// 兼容舊版函數呼叫
window.changeCursorTheme = (theme) => window.CursorManager.apply(theme);
window.applyCursorTheme = (theme) => window.CursorManager.apply(theme);


// ==========================================
// 動態背景 (Digital Constellation / Particle Network)
// ==========================================
window.initAtmosphere = () => {
    try {
        console.log('[Atmosphere] 初始化星空連線背景...');

        let container = document.getElementById('atmosphere-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'atmosphere-container';
            document.body.prepend(container);
        }

        // 創建遮罩層 - 檢查是否已存在
        let overlay = document.getElementById('atmosphere-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'atmosphere-overlay';
            document.body.prepend(overlay);
        }

        // 監聽 animeData 載入完成後渲染背景
        const checkAndRender = () => {
            console.log('[Atmosphere] 檢查 animeData...', window.animeData ? window.animeData.length : 'undefined');
            
            if (window.animeData && window.animeData.length > 0) {
                console.log('[Atmosphere] 檢測到 animeData，開始渲染背景...');
                
                // 添加 flex 樣式確保正確排列
                container.style.cssText = `
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-content: center;
                    gap: 15px;
                    padding: 40px;
                    opacity: 0;
                    transition: opacity 1.5s ease;
                `;
                
                // 渲染海報牆
                window.AtmosphereAPI.renderPosterWall();
                
                // 淡入顯示
                requestAnimationFrame(() => {
                    container.style.opacity = '0.6'; // 調低透明度讓矩陣雨透出
                });
                
                console.log('[Atmosphere] 背景渲染完成');
            } else {
                // 每 100ms 檢查一次，直到 animeData 載入完成
                setTimeout(checkAndRender, 100);
            }
        };

        // 立即開始檢查
        checkAndRender();

        // 導出 API
        window.AtmosphereAPI = {
            pause: () => { container.style.opacity = '0'; },
            resume: () => { container.style.opacity = '1'; },
            setQuality: () => { },
            renderPosterWall: () => {
                if (!container) return;

                // 鎖定機制：如果已經渲染過，就不再重新渲染
                if (container.getAttribute('data-locked') === 'true') {
                    return;
                }

                // 隨機選取海報
                const posters = window.animeData
                    ?.filter(a => a.poster_url || a.image_url)
                    ?.map(a => a.poster_url || a.image_url) || [];

                if (posters.length === 0) {
                    console.warn('[Atmosphere] 沒有找到海報資料');
                    return;
                }

                // 計算需要的海報數量
                const count = Math.min(24, posters.length * 2);
                let html = '';

                for (let i = 0; i < count; i++) {
                    const url = posters[Math.floor(Math.random() * posters.length)];
                    const delay = (Math.random() * 5).toFixed(1);
                    const duration = (15 + Math.random() * 10).toFixed(0);

                    html += `
                    <div class="poster-wall-item" style="animation-delay: -${delay}s;">
                        <div class="mech-cycle-img img-a" style="background-image: url('${url}'); animation-duration: ${duration}s; animation-delay: -${delay}s;"></div>
                        <div class="mech-cycle-img img-b" style="background-image: url('${url}'); animation-duration: ${duration}s; animation-delay: -${delay}s;"></div>
                        <div class="mech-cycle-img img-c" style="background-image: url('${url}'); animation-duration: ${duration}s; animation-delay: -${delay}s;"></div>
                    </div>`;
                }
                
                container.innerHTML = html + container.innerHTML; // 保留光斑
                container.setAttribute('data-locked', 'true');
                console.log('[Atmosphere] 背景已生成 (Mechanical Cycle Mode)');
            },
            refresh: () => {
                container.removeAttribute('data-locked');
                window.AtmosphereAPI.renderPosterWall();
            }
        };

    } catch (e) {
        console.error('[Atmosphere] 初始化失敗:', e);
    }
};

// ==========================================
// 初始化執行 (等待 DOM 和數據載入)
// ==========================================
// 延遲執行，確保 animeData 已載入
window.addEventListener('load', () => {
    setTimeout(() => {
        window.initAtmosphere();
        window.CursorManager.init();
    }, 200);
});
