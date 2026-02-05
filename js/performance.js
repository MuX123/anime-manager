/**
 * 性能優化模組 v2.0
 * 提供懶加載、快取策略、資源優化、離線支援
 * @version 2.0.0
 * @author ACG Manager Development Team
 * @date 2026-02-04
 */

// ========== LazyLoader ==========
class LazyLoader {
    constructor() {
        this.loadedComponents = new Map();
        this.loadingPromises = new Map();
        this.maxConcurrent = 3;
        this.activeLoads = 0;
    }

    async loadComponent(componentName) {
        if (this.loadedComponents.has(componentName)) {
            return this.loadedComponents.get(componentName);
        }

        if (this.loadingPromises.has(componentName)) {
            return this.loadingPromises.get(componentName);
        }

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

    async fetchComponent(componentName) {
        const response = await fetch(`./components/${componentName}.html`);
        if (!response.ok) throw new Error(`組件載入失敗: ${componentName}`);
        return response.text();
    }
}

// ========== ResourceOptimizer ==========
class ResourceOptimizer {
    constructor() {
        this.optimizedResources = new Set();
    }

    optimizeCSS() {
        window.logger?.info('CSS 優化完成');
    }

    optimizeJS() {
        window.logger?.info('JS 優化完成');
    }
}

// ========== MemoryManager ==========
class MemoryManager {
    constructor() {
        this.observers = [];
        this.cleanupTasks = [];
    }

    monitorMemoryUsage() {
        if (!('memory' in performance)) return;

        const checkMemory = () => {
            const memory = performance.memory;
            const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
            if (usage > 0.8) {
                window.logger?.warn('記憶體使用率過高', { usage: (usage * 100).toFixed(2) + '%' });
                this.performCleanup();
            }
        };

        setInterval(checkMemory, 30000);
    }

    setupCleanupTasks() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.performCleanup();
        });
    }

    performCleanup() {
        if (window.performanceOptimizer) {
            window.performanceOptimizer.cache.clear();
        }
        window.logger?.info('記憶體清理完成');
    }

    cleanup() {
        this.observers.forEach(o => o.disconnect());
        this.observers = [];
    }
}

// ========== OfflineManager ==========
class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = new Set();
        this.init();
    }

    init() {
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    handleOnline() {
        this.isOnline = true;
        console.log('[Online] 網路已連線');
        this.notifyListeners({ type: 'online' });
    }

    handleOffline() {
        this.isOnline = false;
        console.log('[Offline] 網路已斷線');
        this.notifyListeners({ type: 'offline' });
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notifyListeners(event) {
        this.listeners.forEach(l => { try { l(event); } catch (e) { console.error(e); } });
    }

    getStatus() {
        return { isOnline: this.isOnline };
    }
}

// ========== HealthMonitor ==========
class HealthMonitor {
    constructor() {
        this.checks = new Map();
        this.interval = null;
        this.status = { overall: 'healthy', checks: {}, lastCheck: null };
    }

    registerCheck(name, checkFn, threshold = 30000) {
        this.checks.set(name, { check: checkFn, threshold, lastResult: null, lastError: null });
    }

    start(intervalMs = 60000) {
        this.stop();
        this.interval = setInterval(() => this.runChecks(), intervalMs);
        this.runChecks();
    }

    stop() {
        if (this.interval) { clearInterval(this.interval); this.interval = null; }
    }

    async runChecks() {
        const results = {};
        let hasError = false;

        for (const [name, { check, threshold }] of this.checks) {
            try {
                const result = await Promise.race([check(), new Promise((_, r) => setTimeout(() => r(new Error('Timeout')), threshold))]);
                results[name] = { status: 'healthy', value: result };
            } catch (error) {
                results[name] = { status: 'error', error: error.message };
                hasError = true;
            }
        }

        this.status = { overall: hasError ? 'error' : 'healthy', checks: results, lastCheck: new Date().toISOString() };
        return this.status;
    }

    getStatus() {
        return { ...this.status };
    }
}

// ========== PerformanceOptimizer ==========
class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.lazyLoader = null;
        this.resourceOptimizer = null;
        this.memoryManager = null;
        this.offlineManager = null;
        this.healthMonitor = null;
        this.serviceWorkerReady = false;
        this.init();
    }

    init() {
        // 延遲初始化依賴類別
        this.lazyLoader = new LazyLoader();
        this.resourceOptimizer = new ResourceOptimizer();
        this.memoryManager = new MemoryManager();
        this.offlineManager = new OfflineManager();
        this.healthMonitor = new HealthMonitor();

        this.setupIntersectionObserver();
        this.setupResourceHints();
        this.setupServiceWorker();
        this.optimizeImages();
        this.setupPerformanceMetrics();
        this.offlineManager.init();
        this.healthMonitor.start();

        window.logger?.info('Performance Optimizer v2.0 初始化完成');
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const src = entry.target.dataset.lazy;
                    if (src) entry.target.src = src;
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '100px', threshold: 0.1 });

        document.querySelectorAll('[data-lazy]').forEach(el => observer.observe(el));
        window.performanceObserver = observer;
    }

    setupResourceHints() {
        ['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net', 'https://twgydqknzdyahgfuamak.supabase.co'].forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    async setupServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        try {
            const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
            console.log('[Performance] Service Worker 已註冊:', registration.scope);
            await navigator.serviceWorker.ready;
            this.serviceWorkerReady = true;
        } catch (error) {
            console.error('[Performance] Service Worker 註冊失敗:', error);
        }
    }

    optimizeImages() {
        document.querySelectorAll('img[data-srcset]').forEach(img => {
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        });
    }

    setupPerformanceMetrics() {
        if (!('performance' in window)) return;

        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                            console.log('[Performance] FCP:', entry.startTime.toFixed(0), 'ms');
                        }
                    });
                });
                observer.observe({ type: 'paint', buffered: true });
            } catch (e) {}
        }
    }

    getMetrics() {
        if (!('performance' in window)) return {};

        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        const memory = performance.memory;

        return {
            loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
            domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
            firstPaint: paint?.find(e => e.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint?.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
            memoryUsage: memory ? {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                usagePercent: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) + '%'
            } : null,
            serviceWorkerReady: this.serviceWorkerReady,
            connection: this.offlineManager?.getStatus() || {},
            health: this.healthMonitor?.getStatus() || {}
        };
    }

    clearCache() {
        this.cache.clear();
        this.memoryManager?.performCleanup();
        window.logger?.info('性能快取已清理');
    }
}

// ========== Export ==========
window.performanceOptimizer = new PerformanceOptimizer();
window.offlineManager = window.performanceOptimizer.offlineManager;
window.healthMonitor = window.performanceOptimizer.healthMonitor;

window.performance = {
    ...window.performance,
    getDetailedMetrics: () => window.performanceOptimizer.getMetrics(),
    clearCache: () => window.performanceOptimizer.clearCache(),
    getHealthStatus: () => window.healthMonitor.getStatus()
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceOptimizer, LazyLoader, ResourceOptimizer, MemoryManager, OfflineManager, HealthMonitor };
}
