/**
 * poster-wall.js
 * ACG 收藏庫 - 海報牆背景模組 (Visual Engine Module)
 * 
 * 職責：
 * - 從動漫資料中隨機選取海報作為背景
 * - 提供配置選項（數量、大小、濾鏡等）
 * - 懶載入圖片以優化效能
 * - 響應式調整
 * 
 * 實作介面：
 * - init(isLowSpec): 初始化
 * - start(): 開始動畫
 * - stop(): 暫停動畫
 * - resize(w, h): 重置大小
 */

class PosterWall {
    constructor() {
        this.container = null;
        this.isActive = false;
        this.isLowSpec = false;
        
        // 預設配置
        this.config = {
            maxPosters: 20,           // 最大海報數量
            posterWidth: 160,         // 海報寬度
            posterHeight: 240,        // 海報高度
            gap: 15,                  // 海報間距
            padding: 40,              // 容器內邊距
            brightness: 0.6,         // 亮度 (0-1)
            grayscale: 0.4,           // 灰度 (0-1)
            hoverBrightness: 0.8,     // 懸停亮度
            hoverGrayscale: 0.1,      // 懸停灰度
            hoverScale: 1.05,         // 懸停縮放
            baseScale: 0.9,           // 基礎縮放
            animationDelay: 5,        // 動畫延遲秒數
            retryInterval: 500,        // 重試間隔 (ms)
            maxRetries: 120           // 最大重試次數
        };
        
        this.retryCount = 0;
        this.checkTimer = null;
        this.isInitialized = false;
    }

    /**
     * 初始化模組
     * @param {boolean} isLowSpec - 是否為低效能模式
     */
    init(isLowSpec) {
        console.log('[PosterWall] init() called, isLowSpec:', isLowSpec);
        
        this.isLowSpec = isLowSpec;
        this.container = document.getElementById('atmosphere-container');

        if (!this.container) {
            console.error('[PosterWall] Container #atmosphere-container NOT FOUND!');
            return;
        }

        console.log('[PosterWall] Container found, setting up...');

        // 低效能模式：停用海報牆
        if (this.isLowSpec) {
            console.warn('[PosterWall] Low-spec mode: Disabling poster wall.');
            this.container.style.display = 'none';
            return;
        }

        // 確保容器可見
        this.container.style.display = 'flex';
        this.container.style.opacity = '1';
        
        // 從 localStorage 載入使用者設定
        this.loadUserSettings();
        
        console.log('[PosterWall] Starting data watch...');
        this.watchForData();
        this.isInitialized = true;
    }

    /**
     * 從 localStorage 載入使用者設定
     */
    loadUserSettings() {
        const settings = localStorage.getItem('posterWallSettings');
        if (settings) {
            try {
                const parsed = JSON.parse(settings);
                this.config = { ...this.config, ...parsed };
            } catch (e) {
                console.warn('[PosterWall] Failed to parse settings:', e);
            }
        }
    }

    /**
     * 儲存使用者設定到 localStorage
     */
    saveUserSettings() {
        localStorage.setItem('posterWallSettings', JSON.stringify(this.config));
    }

    /**
     * 監聽資料可用性
     */
    watchForData() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
        }

        console.log('[PosterWall] Watching for data...');

        this.checkTimer = setInterval(() => {
            this.retryCount++;
            
            // 檢查多種資料來源
            const data = window.animeData || window.mangaData || window.movieData;
            
            console.log(`[PosterWall] Retry ${this.retryCount}: data = ${data ? data.length : 'undefined/null'}`);
            
            if (data && data.length > 0) {
                clearInterval(this.checkTimer);
                console.log(`[PosterWall] Data found (${data.length} items). Rendering...`);
                this.render(data);
            } else if (this.retryCount >= this.config.maxRetries) {
                clearInterval(this.checkTimer);
                console.warn('[PosterWall] Data timeout. No posters will be displayed.');
                this.renderFallback();
            }
        }, this.config.retryInterval);
    }

    /**
     * 渲染海報牆
     * @param {Array} data - 動漫資料陣列
     */
    render(data) {
        if (!this.container) return;

        // 隨機選取海報
        const samples = this.getRandomSamples(data, this.config.maxPosters);
        
        // 建立文件片段（效能優化）
        const fragment = document.createDocumentFragment();
        
        samples.forEach((item, index) => {
            const poster = this.createPosterElement(item, index);
            fragment.appendChild(poster);
        });

        // 清空並渲染
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
        
        // 套用配置樣式
        this.applyStyles();
        
        console.log(`[PosterWall] Rendered ${samples.length} posters.`);
    }

    /**
     * 建立單個海報元素
     * @param {Object} item - 資料項目
     * @param {number} index - 索引
     * @returns {HTMLElement}
     */
    createPosterElement(item, index) {
        const div = document.createElement('div');
        div.className = 'poster-wall-item';
        
        // 使用 poster_url，支援 fallback 到其他欄位
        const imageUrl = item.poster_url || item.image_url || item.cover_image || '';
        
        if (imageUrl) {
            div.style.backgroundImage = `url('${imageUrl}')`;
        }
        
        div.style.backgroundSize = 'cover';
        div.style.backgroundPosition = 'center';
        
        // 隨機動畫延遲
        div.style.animationDelay = `${Math.random() * this.config.animationDelay}s`;
        
        // 懶載入屬性
        div.dataset.src = imageUrl;
        div.dataset.index = index;
        
        return div;
    }

    /**
     * 從資料中隨機選取樣本
     * @param {Array} data - 資料陣列
     * @param {number} count - 選取數量
     * @returns {Array}
     */
    getRandomSamples(data, count) {
        // Fisher-Yates 洗牌演算法
        const shuffled = [...data];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, Math.min(count, data.length));
    }

    /**
     * 套用配置樣式到容器
     */
    applyStyles() {
        if (!this.container) return;
        
        // 設定 flex 布局
        this.container.style.gap = `${this.config.gap}px`;
        this.container.style.padding = `${this.config.padding}px`;
        this.container.style.justifyContent = 'center';
        this.container.style.alignContent = 'center';
        
        // 設定所有海報樣式
        const items = this.container.querySelectorAll('.poster-wall-item');
        items.forEach(item => {
            item.style.width = `${this.config.posterWidth}px`;
            item.style.height = `${this.config.posterHeight}px`;
            item.style.filter = `brightness(${this.config.brightness}) grayscale(${this.config.grayscale})`;
            item.style.transform = `scale(${this.config.baseScale})`;
        });
    }

    /**
     * 渲染後備內容（無資料時）
     */
    renderFallback() {
        if (!this.container) return;
        
        // 建立簡單的後備圖案
        this.container.innerHTML = '';
        this.container.style.background = 'linear-gradient(135deg, #0a0e1a 0%, #050609 100%)';
        
        console.log('[PosterWall] Using fallback background.');
    }

    /**
     * 開始模組（CSS 動畫自動執行）
     */
    start() {
        if (this.container) {
            this.container.style.opacity = '1';
            console.log('[PosterWall] Started.');
        }
        this.isActive = true;
    }

    /**
     * 暫停模組
     */
    stop() {
        if (this.isActive && this.container) {
            this.isActive = false;
            this.container.style.opacity = '0';
            console.log('[PosterWall] Stopped.');
        }
    }

    /**
     * 調整大小（由 VisualEngine 呼叫）
     */
    resize(width, height) {
        // CSS Flex 自動處理響應式
        // 可在此處根據視窗大小調整海報數量
        if (width < 768) {
            this.config.maxPosters = 12;
            this.config.posterWidth = 100;
            this.config.posterHeight = 150;
        } else if (width < 1024) {
            this.config.maxPosters = 16;
            this.config.posterWidth = 130;
            this.config.posterHeight = 195;
        } else {
            this.config.maxPosters = 20;
            this.config.posterWidth = 160;
            this.config.posterHeight = 240;
        }
        
        this.applyStyles();
    }

    /**
     * 顯示/隱藏海報牆
     * @param {boolean} visible - 是否顯示
     */
    setVisible(visible) {
        if (this.container) {
            this.container.style.display = visible ? 'flex' : 'none';
        }
    }

    /**
     * 更新配置
     * @param {Object} options - 新配置
     */
    updateConfig(options) {
        this.config = { ...this.config, ...options };
        this.saveUserSettings();
        this.applyStyles();
    }

    /**
     * 取得目前配置
     * @returns {Object}
     */
    getConfig() {
        return { ...this.config };
    }
}

// 導出模組
window.PosterWall = PosterWall;

// 註冊到 VisualEngine
if (window.VisualEngine) {
    window.VisualEngine.register('PosterWall', new PosterWall());
} else {
    window.addEventListener('load', () => {
        if (window.VisualEngine) {
            window.VisualEngine.register('PosterWall', new PosterWall());
        }
    });
}
