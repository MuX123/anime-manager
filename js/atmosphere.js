/**
 * atmosphere.js - 處理全域動態背景（粒子連線網絡）與遊標管理
 * ACG 收藏庫 v8.0.1
 */

// ==========================================
// 遊標管理器 (Cursor Manager) - 重構版
// ==========================================
window.CursorManager = {
    // 絕對路徑前綴 - 使用絕對路徑避免路徑解析問題
    BASE_PATH: '/assets/cursors',

    // 主題配置 - 使用 GIF 檔案
    themes: {
        anya: {
            name: '🦊 阿尼亞',
            folder: 'anya',
            files: {
                'pointer': 'pointer.gif',
                'text': 'text.gif',
                'move': 'move.gif',
                'wait': 'wait.gif',
                'help': 'help.gif',
                'resize-v': 'resize-v.gif',
                'resize-h': 'resize-h.gif',
                'resize-nwse': 'resize-nwse.gif',
                'resize-nesw': 'resize-nesw.gif',
                'default': 'default.gif',
                'not-allowed': 'not-allowed.gif'
            }
        },
        frieren: {
            name: '🧙‍♀️ 芙莉蓮',
            folder: 'frieren',
            files: {
                'pointer': 'pointer.gif',
                'text': 'text.gif',
                'move': 'move.gif',
                'wait': 'wait.gif',
                'help': 'help.gif',
                'resize-v': 'resize-v.gif',
                'resize-h': 'resize-h.gif',
                'resize-nwse': 'resize-nwse.gif',
                'resize-nesw': 'resize-nesw.gif',
                'default': 'default.gif',
                'not-allowed': 'not-allowed.gif'
            }
        },
        elysia: {
            name: '🦋 愛莉希雅',
            folder: 'elysia',
            files: {
                'pointer': 'pointer.gif',
                'text': 'text.gif',
                'move': 'move.gif',
                'wait': 'wait.gif',
                'help': 'help.gif',
                'resize-v': 'resize-v.gif',
                'resize-h': 'resize-h.gif',
                'resize-nwse': 'resize-nwse.gif',
                'resize-nesw': 'resize-nesw.gif',
                'default': 'default.gif',
                'not-allowed': 'not-allowed.gif'
            }
        }
    },

    // 構建完整路徑
    buildPath(theme, filename) {
        // 系統預設不需要路徑
        if (theme.folder === '.' || !filename) {
            return '';
        }
        return `${this.BASE_PATH}/${theme.folder}/${filename}`;
    },

    // 初始化
    async init() {
        console.log('[CursorManager] 初始化...');
        let savedTheme = 'anya';
        try {
            savedTheme = localStorage.getItem('cursorTheme') || 'anya';
        } catch (e) {
            console.warn('[CursorManager] 無法讀取儲存的主題');
        }
        await this.apply(savedTheme);
    },

    // 套用主題
    async apply(themeId) {
        console.log(`[CursorManager] 套用主題: ${themeId}`);

        if (!this.themes[themeId]) {
            console.warn(`[CursorManager] 主題不存在: ${themeId}，使用預設`);
            themeId = 'anya';
        }

        const theme = this.themes[themeId];

        // 讀取 scale 設定
        let scale = 1;
        try {
            scale = parseFloat(localStorage.getItem('cursorScale')) || 1;
        } catch (e) {
            console.warn('[CursorManager] 無法讀取 scale，使用預設值');
        }

        try {
            const cursorTypes = ['pointer', 'text', 'move', 'wait', 'help', 'resize-v', 'resize-h', 'resize-nwse', 'resize-nesw', 'default', 'not-allowed'];
            const root = document.documentElement;

            // 系統游標映射
            const systemCursors = {
                'pointer': 'pointer',
                'text': 'text',
                'move': 'move',
                'wait': 'wait',
                'help': 'help',
                'not-allowed': 'not-allowed',
                'resize-v': 'ns-resize',
                'resize-h': 'ew-resize',
                'resize-nwse': 'nwse-resize',
                'resize-nesw': 'nesw-resize',
                'default': 'auto'
            };

            for (const type of cursorTypes) {
                const filename = theme.files[type] || theme.files['default'];
                const url = this.buildPath(theme, filename);
                const varName = `--cur-${type}`;
                
                // 檢查使用者是否偏好減少動畫
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                
                // 無效配置或減少動畫偏好時使用系統游標
                if (prefersReducedMotion || !url || !filename) {
                    root.style.setProperty(varName, systemCursors[type] || 'auto');
                } else {
                    // 設置自定義游標（支援大小調整）
                    const size = Math.round(32 * scale);
                    root.style.setProperty(varName, `url('${url}') ${size}px ${size}px, ${systemCursors[type] || 'auto'}`);
                }
            }

            // 安全寫入 localStorage
            try {
                localStorage.setItem('cursorTheme', themeId);
            } catch (e) {
                console.warn('[CursorManager] 無法儲存主題設定');
            }
            
            console.log(`[CursorManager] 主題套用成功: ${theme.name}`);

            if (window.showToast && document.visibilityState === 'visible') {
                window.showToast(`✨ 遊標主題已切換：${theme.name}`);
            }

        } catch (error) {
            console.error('[CursorManager] 套用主題失敗:', error);
        }
    },

    // 設定游標大小
    setScale(val) {
        try {
            localStorage.setItem('cursorScale', val);
        } catch (e) {
            console.warn('[CursorManager] 無法儲存 scale 設定');
        }
        
        // 重新套用以應用新的大小
        const currentTheme = localStorage.getItem('cursorTheme') || 'anya';
        this.apply(currentTheme);
    },

    getThemeList() {
        return Object.entries(this.themes).map(([id, data]) => ({
            id,
            name: data.name
        }));
    },

    // 注入主題到 DOM (保持向後兼容 - 已廢棄)
    injectThemes() {
        console.warn('[CursorManager] injectThemes() 已廢棄，請使用 getThemeList()');
    }
};

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

        let overlay = document.getElementById('atmosphere-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'atmosphere-overlay';
            document.body.prepend(overlay);
        }

        const checkAndRender = () => {
            if (window.animeData && window.animeData.length > 0) {
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

                window.AtmosphereAPI.renderPosterWall();

                requestAnimationFrame(() => {
                    container.style.opacity = '0.6';
                });
            } else {
                setTimeout(checkAndRender, 100);
            }
        };

        checkAndRender();

        window.AtmosphereAPI = {
            pause: () => { container.style.opacity = '0'; },
            resume: () => { container.style.opacity = '1'; },
            setQuality: () => { },
            renderPosterWall: () => {
                if (!container) return;
                if (container.getAttribute('data-locked') === 'true') return;

                const posters = window.animeData
                    ?.filter(a => a.poster_url || a.image_url)
                    ?.map(a => a.poster_url || a.image_url) || [];

                if (posters.length === 0) return;

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

                container.innerHTML = html + container.innerHTML;
                container.setAttribute('data-locked', 'true');
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

window.addEventListener('load', () => {
    setTimeout(() => {
        window.initAtmosphere();
        window.CursorManager.init();
        window.CursorManager.syncUI();
    }, 200);
});

// 同步 UI 控制項與設定
window.CursorManager.syncUI = function() {
    try {
        // 同步主題下拉選單
        const themeSelect = document.getElementById('cursor-theme-select');
        if (themeSelect) {
            const savedTheme = localStorage.getItem('cursorTheme') || 'anya';
            themeSelect.value = savedTheme;
        }
        
        // 同步大小滑桿
        const sizeSlider = document.getElementById('cursor-size-slider');
        const sizeValue = document.getElementById('cursor-size-value');
        if (sizeSlider) {
            const savedScale = localStorage.getItem('cursorScale') || '1';
            sizeSlider.value = savedScale;
            if (sizeValue) {
                sizeValue.textContent = parseFloat(savedScale).toFixed(1) + 'x';
            }
        }
    } catch (e) {
        console.warn('[CursorManager] 無法同步 UI 設定');
    }
};

// 監聽大小滑桿變化即時更新顯示
window.addEventListener('DOMContentLoaded', () => {
    const sizeSlider = document.getElementById('cursor-size-slider');
    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            const sizeValue = document.getElementById('cursor-size-value');
            if (sizeValue) {
                sizeValue.textContent = parseFloat(e.target.value).toFixed(1) + 'x';
            }
        });
    }
});
