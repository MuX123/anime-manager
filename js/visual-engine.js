/**
 * visual-engine.js
 * ACG 收藏庫 - 統一視覺引擎 (Unified Visual Engine)
 * 負責管理所有視覺特效的生命週期、效能監控與資源調度。
 */

class VisualEngine {
    constructor() {
        this.modules = new Map();
        this.isRunning = false;
        this.isLowSpec = false;
        this.config = {
            performance: 'auto', // auto | high | low
            debug: false
        };

        // 統一事件綁定
        this._handleResize = this._handleResize.bind(this);
        this._handleVisibility = this._handleVisibility.bind(this);
    }

    /**
     * 初始化引擎
     */
    init() {
        console.log('[VisualEngine] Initializing...');
        this._detectHardware();
        this._bindEvents();

        // 初始化所有註冊的模組
        this.modules.forEach((module, name) => {
            try {
                if (module.init) {
                    console.log(`[VisualEngine] Initializing module: ${name}`);
                    module.init(this.isLowSpec);
                }
            } catch (e) {
                console.error(`[VisualEngine] Failed to init module: ${name}`, e);
            }
        });

        this.start();
    }

    /**
     * 註冊特效模組
     * @param {string} name 模組名稱
     * @param {object} module 模組實例 (需包含 init, start, stop, resize 方法)
     */
    register(name, module) {
        if (this.modules.has(name)) {
            console.warn(`[VisualEngine] Module ${name} already registered.`);
            return;
        }
        this.modules.set(name, module);
    }

    /**
     * 啟動所有特效
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[VisualEngine] Engine Started.');

        this.modules.forEach((module) => {
            if (module.start && !module.disabled) module.start();
        });
    }

    /**
     * 暫停所有特效 (例如頁面不可見時)
     */
    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        console.log('[VisualEngine] Engine Paused.');

        this.modules.forEach((module) => {
            if (module.stop) module.stop();
        });
    }

    /**
     * 硬體偵測與低配模式判斷
     */
    _detectHardware() {
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 8;

        // 簡單判斷標準: 雙核心以下或記憶體小於 4GB
        if (cores < 4 || memory < 4) {
            this.isLowSpec = true;
            console.warn('[VisualEngine] Low-spec device detected. Optimizing effects.');
        }
    }

    _bindEvents() {
        window.addEventListener('resize', () => {
            // Debounce logic could be added here
            this._handleResize();
        });

        document.addEventListener('visibilitychange', this._handleVisibility);
    }

    _handleResize() {
        if (!this.isRunning) return;
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.modules.forEach(module => {
            if (module.resize) module.resize(width, height);
        });
    }

    _handleVisibility() {
        if (document.hidden) {
            this.stop();
        } else {
            this.start();
        }
    }
}

// 導出單例 (Alias for compatibility)
window.VisualEngine = new VisualEngine();
window.visualEngine = window.VisualEngine;
