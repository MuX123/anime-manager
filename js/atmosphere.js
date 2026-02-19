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
    BASE_PATH: './assets/cursors',

    // 預載主題設定 - 包含熱點偏移 (hotspotX, hotspotY)
    themes: {
        anya: { name: '🦊 安妮亞', folder: 'anya', hotspotX: 4, hotspotY: 4, files: { 'default': 'default.gif', 'pointer': 'pointer.gif', 'text': 'text.gif', 'help': 'help.gif' } },
        frieren: { name: '🧙‍♀️ 芙莉蓮', folder: 'frieren', hotspotX: 4, hotspotY: 4, files: { 'default': 'default.gif', 'pointer': 'pointer.gif', 'text': 'text.gif', 'help': 'help.gif' } },
        elysia: { name: '🦋 愛莉希雅', folder: 'elysia', hotspotX: 5, hotspotY: 4, files: { 'default': 'default.gif', 'pointer': 'pointer.gif', 'text': 'text.gif', 'help': 'help.gif' } },

        // --- 新增主題 (自動掃描) ---
        amiya: { "name": "阿米婭 (明日方舟)", "folder": "amiya", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        brant: { "name": "Brant (鳴潮)", "folder": "brant", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        burnice_white: { "name": "柏妮思 (絕區零)", "folder": "burnice_white", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        chibi_firefly: { "name": "流螢 Q版 (星鐵)", "folder": "chibi_firefly", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        chibi_mydei: { "name": "Mydei Q版 (崩壞)", "folder": "chibi_mydei", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        chibi_phainon: { "name": "Phainon Q版 (崩壞)", "folder": "chibi_phainon", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        chibi_phrolova_cd844a7ebd: { "name": "弗洛洛 Q版 (鳴潮)", "folder": "chibi_phrolova_cd844a7ebd", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        chibi_roccia_f1cafdcc34: { "name": "Roccia Q版 (鳴潮)", "folder": "chibi_roccia_f1cafdcc34", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        chibi_zhao_1cdb02dbab: { "name": "Zhao Q版 (絕區零)", "folder": "chibi_zhao_1cdb02dbab", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        chisa_wuthering_waves_792f859212: { "name": "熾霞 (鳴潮)", "folder": "chisa_wuthering_waves_792f859212", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        citlali_c40bb6ed5f: { "name": "茜特菈莉 (原神)", "folder": "citlali_c40bb6ed5f", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        evernight_6999ef3f35: { "name": "永夜 (崩壞)", "folder": "evernight_6999ef3f35", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        furina_d965b215d4: { "name": "芙寧娜 (原神)", "folder": "furina_d965b215d4", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        iuno_c5088d425d: { "name": "Iuno (鳴潮)", "folder": "iuno_c5088d425d", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        natsume_an_an_9d0c187dd8: { "name": "棗安安", "folder": "natsume_an_an_9d0c187dd8", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
        sakuraba_ema_183f5a21e3: { "name": "櫻庭繪馬", "folder": "sakuraba_ema_183f5a21e3", "hotspotX": 4, "hotspotY": 4, "files": { "default": "default.gif", "pointer": "pointer.gif", "text": "text.gif", "help": "help.gif" } },
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

    // 觀察器
    _mutationObserver: null,

    // 取得靈敏度 (0.1-1.0)
    getSensitivity() {
        const saved = localStorage.getItem('cursorSensitivity');
        return saved ? parseFloat(saved) : 0.4; // 預設 0.4
    },

    // 設定靈敏度
    setSensitivity(value) {
        const sensitivity = Math.max(0.1, Math.min(1.0, parseFloat(value)));
        localStorage.setItem('cursorSensitivity', sensitivity);
        this.trailingSpeed = sensitivity;
        this.updateSensitivityDisplay();
    },

    // 調整靈敏度 (用於按鈕 +/-)
    adjustSensitivity(delta) {
        let current = this.getSensitivity();
        this.setSensitivity(current + delta);
    },

    // 比例調整 (用於按鈕 +/-)
    changeScale(delta) {
        let current = parseFloat(localStorage.getItem('cursorScale')) || 1.0;
        this.setScale(current + delta);
    },

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

        // 載入靈敏度設定
        this.trailingSpeed = this.getSensitivity();

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
            top: '0',
            transformOrigin: 'top left' // 關鍵：確保縮放從左上角開始
        });
        this.visualCursor = cursor;
    },

    // Lerp 插值函數
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // 啟動 Lerp 動畫迴圈
    startLerpLoop() {
        // Visibility check - pause when tab hidden
        if (document.hidden) {
            this.rafId = requestAnimationFrame(() => this.startLerpLoop());
            return;
        }

        const animate = () => {
            if (!this.visualCursor || !this.initialized || document.hidden) {
                this.rafId = requestAnimationFrame(animate);
                return;
            }

            // 計算 Lerp 位置
            this.cursorPos.x = this.lerp(this.cursorPos.x, this.targetPos.x, this.trailingSpeed);
            this.cursorPos.y = this.lerp(this.cursorPos.y, this.targetPos.y, this.trailingSpeed);

            // 安全取得 Scale 和熱點偏移
            let baseScaleVal = localStorage.getItem('cursorScale');
            let baseScale = parseFloat(baseScaleVal);
            if (isNaN(baseScale)) baseScale = 1.0;

            let currentScale = baseScale;

            // 取得當前主題的熱點偏移
            const currentThemeId = localStorage.getItem('cursorTheme') || 'anya';
            const currentTheme = this.themes[currentThemeId] || this.themes['anya'];
            const hotspotX = currentTheme?.hotspotX || 0;
            const hotspotY = currentTheme?.hotspotY || 0;

            // 更新位置 - 只應用熱點偏移，不乘以縮放比例
            // 邏輯：游標圖片左上角位置 = 滑鼠位置 - 熱點位置
            // 這樣可以確保視覺上的熱點始終對齊滑鼠尖端，無論縮放
            const renderX = this.cursorPos.x - hotspotX;
            const renderY = this.cursorPos.y - hotspotY;

            let transform = `translate3d(${renderX}px, ${renderY}px, 0) scale(${currentScale})`;

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
            // 1. 第一次移動時，直接跳到目標位置（避免 lerp 延遲）
            if (!this.hasMoved) {
                this.cursorPos.x = e.clientX;
                this.cursorPos.y = e.clientY;
            }

            // 2. 強制顯示遊標
            activateCursor();
            this.hasMoved = true;

            // 3. 更新目標位置
            this.targetPos.x = e.clientX;
            this.targetPos.y = e.clientY;

            // 5. 更新遊標類型
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

        // Store reference for cleanup
        this._ensureVisibleInterval = interval;
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
        this.visualCursor.style.backgroundSize = 'contain';  // 關鍵：強制縮放至容器大小
        this.visualCursor.style.backgroundRepeat = 'no-repeat';
        this.visualCursor.style.backgroundPosition = '0 0';  // 從左上角開始，確保熱點對齊
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

        // 同步滑桿 UI
        const slider = document.getElementById('cursor-size-slider');
        if (slider && slider.value !== String(scale)) {
            slider.value = scale;
        }
    },

    forceHideNativeCursor() {
        // 1. 確保 class 已添加
        if (!document.documentElement.classList.contains('custom-cursor-active')) {
            document.documentElement.classList.add('custom-cursor-active');
        }

        // 2. 注入最高優先級隱藏樣式到 head
        if (!document.getElementById('cursor-hide-patch')) {
            const style = document.createElement('style');
            style.id = 'cursor-hide-patch';
            style.textContent = `
                /* === 強制隱藏原生游標 === */
                html.custom-cursor-active,
                html.custom-cursor-active *,
                html.custom-cursor-active *:before,
                html.custom-cursor-active *:after {
                    cursor: none !important;
                }
            `;
            // 插入到 head 最後面，確保最高權重
            document.head.appendChild(style);
            console.log('[CursorManager] 強制隱藏樣式已注入到 head');
        }

        // 3. 立即應用
        this._applyImmediateHide();

        // 4. 用 setInterval 持續檢查（不像 requestAnimationFrame 會在頁面靜止時停止）
        // PERFORMANCE FIX: Limit watchdog to 6 seconds then stop
        if (!this._cursorWatchdog) {
            let watchdogCount = 0;
            this._cursorWatchdog = setInterval(() => {
                watchdogCount++;
                // Stop watchdog after 6 seconds to prevent memory leak
                if (watchdogCount > 12) {
                    clearInterval(this._cursorWatchdog);
                    this._cursorWatchdog = null;
                    return;
                }
                this._applyImmediateHide();
                if (!document.documentElement.classList.contains('custom-cursor-active')) {
                    document.documentElement.classList.add('custom-cursor-active');
                }
            }, 500); // 每 500ms 檢查一次
        }

        // 5. 頁面可見性變化時重置
        if (!this._visibilityHandler) {
            this._visibilityHandler = () => {
                if (!document.hidden) {
                    this._applyImmediateHide();
                    document.documentElement.classList.add('custom-cursor-active');
                }
            };
            document.addEventListener('visibilitychange', this._visibilityHandler);
            window.addEventListener('focus', () => this._applyImmediateHide());
        }
    },

    _applyImmediateHide() {
        // 強制隱藏，不檢查條件
        try {
            const el = document.documentElement;
            el.style.setProperty('cursor', 'none', 'important');
            el.style.setProperty('caret-color', 'transparent', 'important');

            if (document.body) {
                document.body.style.setProperty('cursor', 'none', 'important');
                document.body.style.setProperty('caret-color', 'transparent', 'important');
            }
        } catch (e) {
            console.warn('[CursorManager] Apply hide failed', e);
        }
    },

    /**
     * 銷毀函數 - 清除守護程序
     */
    destroy() {
        if (this._cursorWatchdog) {
            clearInterval(this._cursorWatchdog);
            this._cursorWatchdog = null;
        }
        if (this._ensureVisibleInterval) {
            clearInterval(this._ensureVisibleInterval);
            this._ensureVisibleInterval = null;
        }
        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
            window.removeEventListener('focus', this._applyImmediateHide); // 移除新增的監聽器
            this._visibilityHandler = null;
        }
        if (this._mutationObserver) {
            this._mutationObserver.disconnect();
            this._mutationObserver = null;
        }
        // 清除 class 和 style
        document.documentElement.classList.remove('custom-cursor-active');
        document.documentElement.removeAttribute('data-cursor-hidden');
        const style = document.getElementById('cursor-hide-patch');
        if (style) style.remove();
        // 恢復原生遊標
        document.documentElement.style.removeProperty('cursor');
        document.documentElement.style.removeProperty('caret-color');
        if (document.body) {
            document.body.style.removeProperty('cursor');
            document.body.style.removeProperty('caret-color');
        }
    },

    getThemeList() {
        return Object.keys(this.themes).map(k => ({ id: k, name: this.themes[k].name }));
    },

    // 注入主題到 DOM (保持向後兼容 - 已廢棄)
    injectThemes() {
        // 已廢棄，不再需要
    },

    syncUI(theme, scale) {
        const select = document.getElementById('cursor-theme-select');
        if (select) select.value = theme;
        this.updateSizeDisplay(scale);
        this.updateSensitivityDisplay();
    },

    updateSizeDisplay(scale) {
        // 更新顯示文字
        const display = document.getElementById('cursor-size-display'); // 舊版相容
        if (display) display.textContent = parseFloat(scale).toFixed(1) + 'x';

        const valueDisplay = document.getElementById('cursor-size-value'); // 新版
        if (valueDisplay) valueDisplay.textContent = parseFloat(scale).toFixed(1) + 'x';
    },

    updateSensitivityDisplay() {
        const val = this.getSensitivity();
        const display = document.getElementById('cursor-sensitivity-display');
        if (display) display.textContent = val.toFixed(2);

        const slider = document.getElementById('cursor-sensitivity-slider');
        if (slider) slider.value = val;
    }
};

// 註冊到引擎
if (window.VisualEngine) {
    window.VisualEngine.register('CursorManager', window.CursorManager);
}

// ==================== Theme Picker Modal ====================
window.CursorManager.openThemePicker = function() {
    // Remove existing modal if any
    const existing = document.getElementById('cursor-theme-modal');
    if (existing) existing.remove();

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'cursor-theme-modal';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 2147483646;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'cursor-theme-modal-content';
    modal.style.cssText = `
        background: rgba(10, 15, 25, 0.95);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 16px;
        padding: 24px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 16px;
        box-shadow: 0 0 40px rgba(0, 212, 255, 0.2);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;

    // Add title
    const title = document.createElement('div');
    title.textContent = '🎨 選擇游標風格';
    title.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        font-size: 18px;
        color: #00d4ff;
        margin-bottom: 8px;
    `;
    modal.appendChild(title);

    // Get current theme
    const currentTheme = localStorage.getItem('cursorTheme') || 'anya';

    // Generate theme cards
    Object.keys(this.themes).forEach(themeId => {
        const theme = this.themes[themeId];
        const card = document.createElement('div');
        const isActive = themeId === currentTheme;
        
        card.innerHTML = `
            <div class="cursor-theme-card ${isActive ? 'active' : ''}" data-theme="${themeId}" 
                 style="cursor: pointer; padding: 8px; border-radius: 8px; 
                        background: ${isActive ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
                        border: 1px solid ${isActive ? '#00d4ff' : 'transparent'};
                        transition: all 0.2s ease; text-align: center;">
                <img src="${this.BASE_PATH}/${theme.folder}/default.gif" 
                     style="width: 48px; height: 48px; display: block; margin: 0 auto 8px;"
                     onerror="this.style.display='none'">
                <div style="font-size: 12px; color: #fff;">${theme.name}</div>
            </div>
        `;
        
        card.onclick = () => {
            localStorage.setItem('cursorTheme', themeId);
            this.apply(themeId);
            this.syncUI(themeId, localStorage.getItem('cursorScale') || '1.0');
            overlay.remove();
        };
        
        modal.appendChild(card);
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    });

    // Click outside to close
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.9)';
            setTimeout(() => overlay.remove(), 300);
        }
    };
};

// Priority #1: 立即啟動
// 即使沒有 body，也要先在 html 上動手
document.documentElement.classList.add('custom-cursor-active');
document.documentElement.style.setProperty('cursor', 'none', 'important');

if (document.body) {
    window.CursorManager.init();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.CursorManager.init();
    });
}

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('atmosphere', {
        loaded: true,
        exports: { 
            CursorManager: window.CursorManager,
            changeCursorTheme: window.changeCursorTheme,
            applyCursorTheme: window.applyCursorTheme,
            initAtmosphere: window.initAtmosphere,
            openThemePicker: window.openThemePicker
        },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: atmosphere');
}
