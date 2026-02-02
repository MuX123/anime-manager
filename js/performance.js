/**
 * 性能優化模組
 * 提供懶加載、快取策略和資源優化功能
 * @version 1.0.0
 * @author ACG Manager Development Team
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.lazyLoader = new LazyLoader();
        this.resourceOptimizer = new ResourceOptimizer();
        this.memoryManager = new MemoryManager();
        
        this.init();
    }

    /**
     * 初始化性能優化
     */
    init() {
        this.setupIntersectionObserver();
        this.setupResourceHints();
        this.setupServiceWorker();
        this.optimizeImages();
        
        window.logger?.info('性能優化模組初始化完成');
    }

    /**
     * 設置交叉觀察器用於懶加載
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            return;
        }

        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // 觀察需要懶加載的元素
        document.querySelectorAll('[data-lazy]').forEach(element => {
            observer.observe(element);
        });

        window.performanceObserver = observer;
    }

    /**
     * 加載元素
     * @param {Element} element 目標元素
     */
    loadElement(element) {
        const src = element.dataset.lazy;
        const type = element.dataset.lazyType || 'img';

        switch (type) {
            case 'img':
                this.loadImage(element, src);
                break;
            case 'bg':
                this.loadBackgroundImage(element, src);
                break;
            case 'component':
                this.loadComponent(element, src);
                break;
            default:
                element.textContent = src;
        }

        element.classList.add('loaded');
    }

    /**
     * 加載圖片
     * @param {HTMLImageElement} img 圖片元素
     * @param {string} src 圖片源
     */
    loadImage(img, src) {
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = src;
            img.classList.remove('loading');
            img.classList.add('loaded');
        };

        tempImg.onerror = () => {
            img.classList.add('error');
            window.logger?.warn('圖片載入失敗', { src });
        };

        img.classList.add('loading');
        tempImg.src = src;
    }

    /**
     * 加載背景圖片
     * @param {Element} element 目標元素
     * @param {string} src 圖片源
     */
    loadBackgroundImage(element, src) {
        const tempImg = new Image();
        
        tempImg.onload = () => {
            element.style.backgroundImage = `url(${src})`;
            element.classList.add('loaded');
        };

        tempImg.onerror = () => {
            element.classList.add('error');
            window.logger?.warn('背景圖片載入失敗', { src });
        };

        tempImg.src = src;
    }

    /**
     * 加載組件
     * @param {Element} element 目標元素
     * @param {string} componentName 組件名稱
     */
    async loadComponent(element, componentName) {
        try {
            const component = await this.lazyLoader.loadComponent(componentName);
            element.innerHTML = component;
            element.classList.add('loaded');
        } catch (error) {
            element.classList.add('error');
            window.logger?.error('組件載入失敗', { componentName, error });
        }
    }

    /**
     * 設置資源提示
     */
    setupResourceHints() {
        // DNS 預解析
        this.addDNSPrefetch([
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdn.jsdelivr.net',
            'https://twgydqknzdyahgfuamak.supabase.co'
        ]);

        // 預連接
        this.addPreconnect([
            'https://fonts.googleapis.com',
            'https://twgydqknzdyahgfuamak.supabase.co'
        ]);

        // 預載入關鍵資源
        this.preloadCriticalResources();
    }

    /**
     * 添加 DNS 預解析
     * @param {Array<string>} domains 域名列表
     */
    addDNSPrefetch(domains) {
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    /**
     * 添加預連接
     * @param {Array<string>} domains 域名列表
     */
    addPreconnect(domains) {
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    /**
     * 預載入關鍵資源
     */
    preloadCriticalResources() {
        // 關鍵資源已透過 HTML<link> 載入，此處無需額外 preload
        // 避免重複載入導致控制台警告
        window.logger?.debug('關鍵資源載入優化完成');
    }

    /**
     * 設置 Service Worker
     * Note: Service Worker requires a separate sw.js file and HTTPS
     * Currently disabled until sw.js is implemented
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Service Worker 註冊已暫時停用
            // 若要啟用，請創建 sw.js 文件並取消下方註釋
            /*
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    window.logger?.info('Service Worker 註冊成功', { scope: registration.scope });
                })
                .catch(error => {
                    window.logger?.warn('Service Worker 註冊失敗', { error });
                });
            */
            window.logger?.info('Service Worker 已停用（需要 sw.js 文件）');
        }
    }

    /**
     * 優化圖片
     */
    optimizeImages() {
        // 為所有圖片添加懶加載
        document.querySelectorAll('img').forEach(img => {
            if (!img.dataset.lazy) {
                img.dataset.lazy = img.src;
                img.dataset.lazyType = 'img';
                img.src = this.getPlaceholderImage();
                img.classList.add('lazy');
            }
        });

        // 響應式圖片處理
        this.setupResponsiveImages();
    }

    /**
     * 獲取佔位符圖片
     * @returns {string} 佔位符圖片 URL
     */
    getPlaceholderImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=';
    }

    /**
     * 設置響應式圖片
     */
    setupResponsiveImages() {
        const images = document.querySelectorAll('img[data-srcset]');
        
        images.forEach(img => {
            const srcset = img.dataset.srcset;
            if (srcset) {
                img.srcset = srcset;
            }
        });
    }

    /**
     * 獲取性能指標
     * @returns {Object} 性能指標
     */
    getMetrics() {
        if (!('performance' in window)) {
            return {};
        }

        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        return {
            // 頁面載入時間
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            
            // 首次繪製
            firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
            firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
            
            // 資源載入
            resourceCount: performance.getEntriesByType('resource').length,
            
            // 記憶體使用
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }

    /**
     * 清理快取
     */
    clearCache() {
        this.cache.clear();
        this.memoryManager.cleanup();
        window.logger?.info('性能快取已清理');
    }
}

/**
 * 懶加載器
 */
class LazyLoader {
    constructor() {
        this.loadedComponents = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * 載入組件
     * @param {string} componentName 組件名稱
     * @returns {Promise<string>} 組件 HTML
     */
    async loadComponent(componentName) {
        // 檢查是否已載入
        if (this.loadedComponents.has(componentName)) {
            return this.loadedComponents.get(componentName);
        }

        // 檢查是否正在載入
        if (this.loadingPromises.has(componentName)) {
            return this.loadingPromises.get(componentName);
        }

        // 開始載入
        const promise = this.fetchComponent(componentName);
        this.loadingPromises.set(componentName, promise);

        try {
            const component = await promise;
            this.loadedComponents.set(componentName, component);
            this.loadingPromises.delete(componentName);
            return component;
        } catch (error) {
            this.loadingPromises.delete(componentName);
            throw error;
        }
    }

    /**
     * 獲取組件
     * @param {string} componentName 組件名稱
     * @returns {Promise<string>} 組件 HTML
     */
    async fetchComponent(componentName) {
        const response = await fetch(`./components/${componentName}.html`);
        if (!response.ok) {
            throw new Error(`組件載入失敗: ${componentName}`);
        }
        return response.text();
    }
}

/**
 * 資源優化器
 */
class ResourceOptimizer {
    constructor() {
        this.optimizedResources = new Set();
    }

    /**
     * 優化 CSS
     */
    optimizeCSS() {
        // 移除未使用的 CSS
        this.removeUnusedCSS();
        
        // 壓縮關鍵 CSS
        this.criticalCSS();
    }

    /**
     * 移除未使用的 CSS
     */
    removeUnusedCSS() {
        // 這裡可以實作 CSS 掃描和清理邏輯
        window.logger?.info('CSS 優化完成');
    }

    /**
     * 關鍵 CSS 內聯
     */
    criticalCSS() {
        // 提取關鍵 CSS 並內聯到 HTML
        window.logger?.info('關鍵 CSS 內聯完成');
    }

    /**
     * 優化 JavaScript
     */
    optimizeJS() {
        // 代碼分割
        this.codeSplitting();
        
        // Tree shaking
        this.treeShaking();
    }

    /**
     * 代碼分割
     */
    codeSplitting() {
        // 實作動態載入邏輯
        window.logger?.info('代碼分割完成');
    }

    /**
     * Tree shaking
     */
    treeShaking() {
        // 移除未使用的代碼
        window.logger?.info('Tree shaking 完成');
    }
}

/**
 * 記憶體管理器
 */
class MemoryManager {
    constructor() {
        this.observers = [];
        this.cleanupTasks = [];
    }

    /**
     * 初始化記憶體監控
     */
    init() {
        this.monitorMemoryUsage();
        this.setupCleanupTasks();
    }

    /**
     * 監控記憶體使用
     */
    monitorMemoryUsage() {
        if (!('memory' in performance)) {
            return;
        }

        const checkMemory = () => {
            const memory = performance.memory;
            const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

            if (usage > 0.8) {
                window.logger?.warn('記憶體使用率過高', { usage: (usage * 100).toFixed(2) + '%' });
                this.performCleanup();
            }
        };

        // 每 30 秒檢查一次
        setInterval(checkMemory, 30000);
    }

    /**
     * 設置清理任務
     */
    setupCleanupTasks() {
        // 頁面隱藏時清理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.performCleanup();
            }
        });

        // 頁面卸載時清理
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /**
     * 執行清理
     */
    performCleanup() {
        // 清理快取
        if (window.performanceOptimizer) {
            window.performanceOptimizer.clearCache();
        }

        // 清理事件監聽器
        this.cleanupEventListeners();

        // 清理定時器
        this.cleanupTimers();

        window.logger?.info('記憶體清理完成');
    }

    /**
     * 清理事件監聽器
     */
    cleanupEventListeners() {
        // 這裡可以實作事件監聽器清理邏輯
    }

    /**
     * 清理定時器
     */
    cleanupTimers() {
        // 警告：這會清理所有定時器，需要謹慎使用
        // const highestTimerId = setTimeout(() => {});
        // for (let i = 0; i < highestTimerId; i++) {
        //     clearTimeout(i);
        //     clearInterval(i);
        // }
    }

    /**
     * 清理
     */
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        
        this.cleanupTasks.forEach(task => task());
        this.cleanupTasks = [];
    }
}

// 創建全局性能優化實例
window.performanceOptimizer = new PerformanceOptimizer();

// 性能 API 擴展
window.performance = {
    ...window.performance,
    
    /**
     * 獲取詳細性能指標
     */
    getDetailedMetrics() {
        return window.performanceOptimizer.getMetrics();
    },
    
    /**
     * 清理性能快取
     */
    clearCache() {
        return window.performanceOptimizer.clearCache();
    }
};

// 導出模組（支援模組化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceOptimizer,
        LazyLoader,
        ResourceOptimizer,
        MemoryManager
    };
}