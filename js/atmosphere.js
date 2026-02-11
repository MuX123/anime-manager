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

        // 使用 URL 建構子確保路徑正確
        // 假設 assets 在根目錄 (index.html 所在位置)
        // 這樣可以處理 /anime-manager/ 等子路徑部署情況
        // 注意：若為 file:// 協議，pathname 可能包含磁碟代號，需要小心處理
        // 使用相對於 CSS 檔案的路徑 (因為變數是在 css/animations.css 中使用的)
        // 這樣瀏覽器在解析 url() 時才會正確指向根目錄的 assets
        let basePath = '../assets/cursors';

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
            container.style.opacity = '0'; // 初始透明
            container.style.transition = 'opacity 1.5s ease'; // 平滑淡入
            document.body.prepend(container);
        }

        // 啟動淡入
        setTimeout(() => {
            if (container) {
                container.style.opacity = '1';
                container.className = 'atmosphere-bg';
                // 加入漂浮光斑
                container.innerHTML = `
                    <div class="atmosphere-blob"></div>
                    <div class="atmosphere-blob"></div>
                    <div class="atmosphere-blob" style="top: 60%; left: 70%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(0, 255, 255, 0.03) 0%, transparent 70%);"></div>
                `;

                // 創建遮罩層
                let overlay = document.getElementById('atmosphere-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'atmosphere-overlay';
                    overlay.className = 'atmosphere-overlay';
                    document.body.prepend(overlay);
                }

                // 渲染海報牆
                window.AtmosphereAPI.renderPosterWall();
            }
        }, 100);

        // 導出 API
        window.AtmosphereAPI = {
            pause: () => { },
            resume: () => { },
            setQuality: () => { },
            renderPosterWall: () => {
                const container = document.getElementById('atmosphere-container');
                if (!container || !window.animeData || window.animeData.length === 0) return;

                // 隨機選取海報
                const posters = window.animeData
                    .filter(a => a.poster_url)
                    .map(a => a.poster_url);

                if (posters.length === 0) return;

                // 計算需要的海報數量 (大致填滿畫面)
                const count = 30;
                let html = '';
                for (let i = 0; i < count; i++) {
                    const url = posters[Math.floor(Math.random() * posters.length)];
                    const delay = (Math.random() * 10).toFixed(1);
                    const duration = (40 + Math.random() * 40).toFixed(0);
                    html += `<div class="poster-wall-item" style="background-image: url('${url}'); animation-delay: -${delay}s; animation-duration: ${duration}s;"></div>`;
                }
                container.innerHTML = html;
            },
            refresh: () => window.AtmosphereAPI.renderPosterWall()
        };

        contentElements.forEach(el => {
            if (el && !el.style.position) {
                el.style.position = 'relative';
                el.style.zIndex = '10';
            }
        });

    } catch (e) {
        console.error('[Atmosphere] 初始化失敗:', e);
    }
};

// ==========================================
// 初始化執行
// ==========================================
if (document.readyState === 'complete') {
    window.initAtmosphere();
    window.CursorManager.init();
} else {
    window.addEventListener('load', () => {
        window.initAtmosphere();
        window.CursorManager.init();
    });
}
