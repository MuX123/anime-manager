/**
 * atmosphere.js (V2.2 - Performance Optimized)
 * ACG 收藏庫 - 氛圍與遊標管理模組
 * 包含:
 * 1. CursorManager (遊標) - GPU 加速版 + Lerp 拖尾 + 點擊動畫
 * 2. PosterWall (海報牆) - 已移至 poster-wall.js
 */

/* ==========================================
   Cursor Manager V2.2
   Patch Note: Performance Optimization
   - 改用 translate3d 定位以啟用 GPU 加速
   - 加入 Lerp 拖尾效果使移動更平滑
   - 加入點擊/懸停縮放動畫
   ========================================== */
window.CursorManager = {
    // 此路徑與 CSS 中的變數需保持一致
    BASE_PATH: new URL('./assets/cursors', window.location.href).href,

    // 預載主題設定
    themes: {
        anya: {
            name: '🦊 阿尼亞',
            folder: 'anya',
            files: { 'default': 'default.gif', 'pointer': 'pointer.gif', 'text': 'text.gif', 'help': 'help.gif' }
        },
        frieren: {
            name: '🧙‍♀️ 芙莉蓮',
            folder: 'frieren',
            files: { 'default': 'default.gif', 'pointer': 'pointer.gif', 'text': 'text.gif', 'help': 'help.gif' }
        },
        elysia: {
            name: '🦋 愛莉希雅',
            folder: 'elysia',
            files: { 'default': 'default.gif', 'pointer': 'pointer.gif', 'text': 'text.gif', 'help': 'help.gif' }
        }
    },

    // 狀態標記
    initialized: false,
    isHovering: false,
    hasMoved: false,
    currentType: 'default',
    visualCursor: null,

    // ... (其餘參數保持不變) ...
    targetPos: { x: 0, y: 0 },
    cursorPos: { x: 0, y: 0 },
    trailingSpeed: 0.15,
    rafId: null,

    // 點擊/懸停狀態
    isClicking: false,
    isScaled: false,

    // 初始化入口
    init(isLowSpec = false) {
        if (this.initialized) {
            console.log('[CursorManager] Already initialized, skipping.');
            return;
        }
        console.log('[CursorManager V2.2] Initializing...');

        // 1. 強制啟動隱藏模式 (優先執行)
        this.forceHideNativeCursor();

        // 2. 建立視覺層
        this.createVisualCursor();

        // 3. 載入並應用設定
        const savedTheme = localStorage.getItem('cursorTheme') || 'anya';
        let savedScale = localStorage.getItem('cursorScale');

        // 防呆：確保 scale 是有效數字
        if (!savedScale || isNaN(parseFloat(savedScale))) {
            savedScale = '1.0';
            localStorage.setItem('cursorScale', '1.0');
        }

        this.apply(savedTheme);
        this.setScale(savedScale);

        // 4. 綁定事件
        this.bindEvents();

        // 5. 啟動動畫迴圈
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.startLerpLoop();

        // 6. 同步 UI
        this.syncUI(savedTheme, savedScale);

        this.initialized = true;
        console.log('[CursorManager] Initialization complete.');

        // 7. 安全檢查
        this.ensureCursorVisible();

        // 初始位置強制設在中央
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        this.targetPos = { x: cx, y: cy };
        this.cursorPos = { x: cx, y: cy };
        if (this.visualCursor) this.visualCursor.style.opacity = '1';
    },

    createVisualCursor() {
        let cursor = document.getElementById('custom-cursor-visual');
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.id = 'custom-cursor-visual';
            document.body.appendChild(cursor);
        }

        // 核心樣式 - 使用最高層級 z-index 並確保初始於螢幕外
        Object.assign(cursor.style, {
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: '2147483647',
            willChange: 'transform, opacity',
            opacity: '0',
            left: '0',
            top: '0'
        });
        this.visualCursor = cursor;
    },

    // Lerp 插值函數
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // 啟動 Lerp 動畫迴圈
    startLerpLoop() {
        const animate = () => {
            if (!this.visualCursor || !this.initialized) {
                this.rafId = requestAnimationFrame(animate);
                return;
            }

            // 計算 Lerp 位置
            this.cursorPos.x = this.lerp(this.cursorPos.x, this.targetPos.x, this.trailingSpeed);
            this.cursorPos.y = this.lerp(this.cursorPos.y, this.targetPos.y, this.trailingSpeed);

            // 安全取得 Scale
            let baseScaleVal = localStorage.getItem('cursorScale');
            let baseScale = parseFloat(baseScaleVal);
            if (isNaN(baseScale)) baseScale = 1.0;

            let currentScale = baseScale;

            // 更新位置
            let transform = `translate3d(${this.cursorPos.x}px, ${this.cursorPos.y}px, 0) scale(${currentScale})`;

            // 指針類型熱點偏移
            if (this.currentType === 'pointer') {
                transform = `translate3d(${this.cursorPos.x - 5}px, ${this.cursorPos.y - 2}px, 0) scale(${currentScale})`;
            }

            // 狀態縮放補償
            if (this.isClicking) {
                transform += ' scale(0.85)';
            } else if (this.isScaled) {
                transform += ' scale(1.2)';
            }

            this.visualCursor.style.transform = transform;
            this.rafId = requestAnimationFrame(animate);
        };

        this.rafId = requestAnimationFrame(animate);
    },

    bindEvents() {
        // 共用的顯示觸發邏輯
        const activateCursor = () => {
            if (!this.visualCursor) return;
            // 強制顯示遊標（無論當前 opacity 是什麼）
            this.visualCursor.style.opacity = '1';
            this.isHovering = true;
        };

        // 全域移動監聽 - 只更新目標位置，由 RAF 迴圈處理動畫
        document.addEventListener('mousemove', (e) => {
            // 第一次移動時，直接跳到目標位置（避免 lerp 延遲）
            if (!this.hasMoved) {
                this.cursorPos.x = e.clientX;
                this.cursorPos.y = e.clientY;
            }

            // 強制顯示遊標
            activateCursor();
            this.hasMoved = true;

            // 更新目標位置
            this.targetPos.x = e.clientX;
            this.targetPos.y = e.clientY;

            // 更新遊標類型
            this.updateCursorType(e.target);
        }, { passive: true });

        // 點擊事件 - 縮放動畫
        document.addEventListener('mousedown', () => {
            this.isClicking = true;
        });

        document.addEventListener('mouseup', () => {
            this.isClicking = false;
        });

        // 額外監聽 mouseover，捕捉可能遺漏的初始狀態
        document.addEventListener('mouseover', activateCursor, { passive: true });

        // 離開視窗時隱藏視覺遊標
        document.documentElement.addEventListener('mouseleave', () => {
            this.isHovering = false;
            if (this.visualCursor) this.visualCursor.style.opacity = '0';
        });

        document.documentElement.addEventListener('mouseenter', () => {
            this.isHovering = true;
            if (this.visualCursor) this.visualCursor.style.opacity = '1';
            this.forceHideNativeCursor();
        });

        // 失去焦點時
        window.addEventListener('blur', () => {
            if (this.visualCursor) this.visualCursor.style.opacity = '0';
        });

        window.addEventListener('focus', () => {
            this.forceHideNativeCursor();
        });
    },

    // 安全網機制：每 500ms 檢查一次狀態
    ensureCursorVisible() {
        let attempts = 0;
        // 第一次立即檢查
        setTimeout(() => this.checkVisibilityFallback(), 100);

        const interval = setInterval(() => {
            attempts++;
            if (attempts > 6) { // 3秒後停止
                clearInterval(interval);
                return;
            }
            this.checkVisibilityFallback();

            // 額外確保：無論如何都確保 opacity 為 1
            if (this.visualCursor && this.visualCursor.style.opacity !== '1') {
                this.visualCursor.style.opacity = '1';
            }
        }, 500);
    },

    checkVisibilityFallback() {
        // 1. 確保原生隱藏
        this.forceHideNativeCursor();

        // 2. 如果滑鼠還沒移動過，強制顯示在中央
        if (!this.hasMoved && this.visualCursor) {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            this.targetPos.x = cx;
            this.targetPos.y = cy;
            this.cursorPos.x = cx;
            this.cursorPos.y = cy;
            this.visualCursor.style.opacity = '1';

            const computedStyle = window.getComputedStyle(this.visualCursor);
            if (computedStyle.backgroundImage === 'none' || computedStyle.backgroundImage === '') {
                // 圖片不存在，畫一個青色圓點
                this.visualCursor.style.backgroundColor = 'rgba(0, 255, 255, 0.8)';
                this.visualCursor.style.width = '20px';
                this.visualCursor.style.height = '20px';
                this.visualCursor.style.borderRadius = '50%';
                this.visualCursor.style.boxShadow = '0 0 10px #00ffff';
            }
        }
    },

    updateCursorPosition(x, y) {
        if (!this.visualCursor) return;
        // 使用 translate3d 定位以啟用 GPU 加速
        // 注意：transform 現在由 lerp 迴圈統一管理，這裡只用於初始設定
        this.visualCursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    },

    // 簡化的類型判斷 - 僅依賴 CSS 選擇器
    updateCursorType(target) {
        if (!target) return;

        let type = 'default';
        let wasScaled = this.isScaled;

        // 檢查是否為互動元素
        if (target.closest('a, button, .clickable, .btn-primary, .anime-card, [onclick], input[type="range"], select, .custom-video-overlay')) {
            type = 'pointer';
            this.isScaled = true;
        } else if (target.closest('input[type="text"], textarea, .editable')) {
            type = 'text';
            this.isScaled = false;
        } else if (target.closest('[title], .help')) {
            type = 'help';
            this.isScaled = false;
        } else {
            this.isScaled = false;
        }

        if (this.currentType !== type) {
            this.currentType = type;
            this.updateCursorImage();
        }
    },

    updateCursorImage() {
        if (!this.visualCursor) return;

        const themeId = localStorage.getItem('cursorTheme') || 'anya';
        const theme = this.themes[themeId];
        const filename = theme.files[this.currentType] || theme.files['default'];
        const url = `${this.BASE_PATH}/${theme.folder}/${filename}`;

        // 直接設置背景圖（異步加載）
        this.visualCursor.style.backgroundImage = `url('${url}')`;
        this.visualCursor.style.width = '32px';
        this.visualCursor.style.height = '32px';

        // 使用 Image 物件預載以確認是否存在，失敗時 fallback
        const img = new Image();
        img.onload = () => {
            // 圖片載入成功，確保樣式正確
            this.visualCursor.style.backgroundColor = 'transparent';
            this.visualCursor.style.boxShadow = 'none';
        };
        img.onerror = () => {
            console.warn(`[CursorManager] Failed to load cursor image: ${url}`);
            // 圖片載入失敗，顯示 fallback 樣式
            this.visualCursor.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            this.visualCursor.style.width = '20px';
            this.visualCursor.style.height = '20px';
            this.visualCursor.style.borderRadius = '50%';
        };
        img.src = url;
    },

    apply(themeId) {
        if (!this.themes[themeId]) themeId = 'anya';
        localStorage.setItem('cursorTheme', themeId);
        this.updateCursorImage();
        console.log(`[CursorManager] Theme applied: ${themeId}`);
    },

    setScale(scale) {
        localStorage.setItem('cursorScale', scale);
        document.documentElement.style.setProperty('--cur-scale', scale);
        this.updateCursorImage();
        this.updateSizeDisplay(scale);
    },

    changeScale(delta) {
        let current = parseFloat(localStorage.getItem('cursorScale') || '1');
        let newScale = Math.max(0.5, Math.min(3.0, current + delta));
        this.setScale(newScale);
    },

    forceHideNativeCursor() {
        document.documentElement.classList.add('custom-cursor-active');

        // 確保注入強力隱藏樣式
        if (!document.getElementById('cursor-hide-patch')) {
            const style = document.createElement('style');
            style.id = 'cursor-hide-patch';
            style.innerHTML = `
                html.custom-cursor-active, 
                html.custom-cursor-active *,
                html.custom-cursor-active body,
                html.custom-cursor-active iframe {
                    cursor: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    },

    getThemeList() {
        return Object.keys(this.themes).map(k => ({ id: k, name: this.themes[k].name }));
    },

    syncUI(theme, scale) {
        const select = document.getElementById('cursor-theme-select');
        if (select) select.value = theme;
        this.updateSizeDisplay(scale);
    },

    updateSizeDisplay(scale) {
        const display = document.getElementById('cursor-size-display');
        if (display) display.textContent = parseFloat(scale).toFixed(1) + 'x';
    }
};

// 註冊到引擎
if (window.VisualEngine) {
    window.VisualEngine.register('CursorManager', window.CursorManager);
}

// Priority #1: 立即啟動
if (document.body) {
    // 立即加上 class
    document.documentElement.classList.add('custom-cursor-active');
    window.CursorManager.init();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.classList.add('custom-cursor-active');
        window.CursorManager.init();
    });
}
