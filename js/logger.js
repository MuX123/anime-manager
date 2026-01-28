/**
 * 日誌管理系統
 * 提供統一的日誌記錄、錯誤追蹤和性能監控功能
 * @version 1.0.0
 * @author ACG Manager Development Team
 */

class Logger {
    constructor(config = {}) {
        this.config = {
            level: config.level || 'info', // debug, info, warn, error
            enableConsole: config.enableConsole !== false,
            enableStorage: config.enableStorage !== false,
            enableRemote: config.enableRemote || false,
            maxStorageSize: config.maxStorageSize || 1000,
            remoteEndpoint: config.remoteEndpoint || null,
            ...config
        };
        
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        
        this.currentLevel = this.levels[this.config.level] || 1;
        this.storage = new LogStorage(this.config.maxStorageSize);
        this.performance = new PerformanceMonitor();
        
        this.init();
    }

    /**
     * 初始化日誌系統
     */
    init() {
        // 設置全局錯誤處理
        this.setupGlobalErrorHandling();
        
        // 設置性能監控
        this.performance.init();
        
        console.log('📝 日誌系統初始化完成');
    }

    /**
     * 設置全局錯誤處理
     */
    setupGlobalErrorHandling() {
        // 捕獲未處理的 JavaScript 錯誤
        window.addEventListener('error', (event) => {
            this.error('Uncaught JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        // 捕獲未處理的 Promise 拒絕
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled Promise Rejection', {
                reason: event.reason,
                stack: event.reason?.stack
            });
        });
    }

    /**
     * 記錄調試信息
     * @param {string} message 訊息
     * @param {Object} data 附加數據
     */
    debug(message, data = {}) {
        this.log('debug', message, data);
    }

    /**
     * 記錄一般信息
     * @param {string} message 訊息
     * @param {Object} data 附加數據
     */
    info(message, data = {}) {
        this.log('info', message, data);
    }

    /**
     * 記錄警告信息
     * @param {string} message 訊息
     * @param {Object} data 附加數據
     */
    warn(message, data = {}) {
        this.log('warn', message, data);
    }

    /**
     * 記錄錯誤信息
     * @param {string} message 訊息
     * @param {Object} data 附加數據
     */
    error(message, data = {}) {
        this.log('error', message, data);
    }

    /**
     * 核心日誌記錄方法
     * @param {string} level 日誌級別
     * @param {string} message 訊息
     * @param {Object} data 附加數據
     */
    log(level, message, data = {}) {
        const logEntry = this.createLogEntry(level, message, data);
        
        // 檢查日誌級別
        if (this.levels[level] < this.currentLevel) {
            return;
        }

        // 輸出到控制台
        if (this.config.enableConsole) {
            this.outputToConsole(logEntry);
        }

        // 存儲到本地
        if (this.config.enableStorage) {
            this.storage.add(logEntry);
        }

        // 發送到遠端
        if (this.config.enableRemote && this.config.remoteEndpoint) {
            this.sendToRemote(logEntry);
        }
    }

    /**
     * 創建日誌條目
     * @param {string} level 日誌級別
     * @param {string} message 訊息
     * @param {Object} data 附加數據
     * @returns {Object} 日誌條目
     */
    createLogEntry(level, message, data) {
        return {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            data,
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId(),
            userId: this.getCurrentUserId()
        };
    }

    /**
     * 生成唯一 ID
     * @returns {string} 唯一 ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 獲取會話 ID
     * @returns {string} 會話 ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('log_session_id');
        if (!sessionId) {
            sessionId = this.generateId();
            sessionStorage.setItem('log_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * 獲取當前用戶 ID
     * @returns {string|null} 用戶 ID
     */
    getCurrentUserId() {
        // 這裡可以從認證系統獲取用戶 ID
        return window.currentUser?.id || null;
    }

    /**
     * 輸出到控制台
     * @param {Object} logEntry 日誌條目
     */
    outputToConsole(logEntry) {
        const { level, message, data, timestamp } = logEntry;
        const prefix = `[${timestamp}] [${level}]`;
        
        switch (logEntry.level) {
            case 'DEBUG':
                console.debug(prefix, message, data);
                break;
            case 'INFO':
                console.info(prefix, message, data);
                break;
            case 'WARN':
                console.warn(prefix, message, data);
                break;
            case 'ERROR':
                console.error(prefix, message, data);
                break;
            default:
                console.log(prefix, message, data);
        }
    }

    /**
     * 發送到遠端服務器
     * @param {Object} logEntry 日誌條目
     */
    async sendToRemote(logEntry) {
        try {
            await fetch(this.config.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.error('Failed to send log to remote:', error);
        }
    }

    /**
     * 獲取日誌歷史
     * @param {Object} options 查詢選項
     * @returns {Array} 日誌條目數組
     */
    getLogs(options = {}) {
        return this.storage.get(options);
    }

    /**
     * 清除日誌
     * @param {Object} options 清除選項
     */
    clearLogs(options = {}) {
        this.storage.clear(options);
    }

    /**
     * 導出日誌
     * @param {string} format 導出格式 (json, csv)
     * @returns {string} 導出的日誌數據
     */
    exportLogs(format = 'json') {
        const logs = this.storage.get();
        
        switch (format.toLowerCase()) {
            case 'csv':
                return this.exportToCSV(logs);
            case 'json':
            default:
                return JSON.stringify(logs, null, 2);
        }
    }

    /**
     * 導出為 CSV 格式
     * @param {Array} logs 日誌數組
     * @returns {string} CSV 字符串
     */
    exportToCSV(logs) {
        const headers = ['ID', 'Timestamp', 'Level', 'Message', 'URL', 'User Agent'];
        const rows = logs.map(log => [
            log.id,
            log.timestamp,
            log.level,
            log.message,
            log.url,
            log.userAgent
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    /**
     * 設置日誌級別
     * @param {string} level 日誌級別
     */
    setLevel(level) {
        if (this.levels.hasOwnProperty(level)) {
            this.config.level = level;
            this.currentLevel = this.levels[level];
            this.info(`Log level changed to: ${level}`);
        }
    }

    /**
     * 獲取日誌統計
     * @returns {Object} 統計信息
     */
    getStats() {
        const logs = this.storage.get();
        const stats = {
            total: logs.length,
            byLevel: {},
            byHour: {},
            oldestLog: null,
            newestLog: null
        };

        logs.forEach(log => {
            // 按級別統計
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            
            // 按小時統計
            const hour = new Date(log.timestamp).getHours();
            stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
            
            // 最舊和最新的日誌
            if (!stats.oldestLog || new Date(log.timestamp) < new Date(stats.oldestLog.timestamp)) {
                stats.oldestLog = log;
            }
            if (!stats.newestLog || new Date(log.timestamp) > new Date(stats.newestLog.timestamp)) {
                stats.newestLog = log;
            }
        });

        return stats;
    }
}

/**
 * 日誌存儲管理器
 */
class LogStorage {
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.storageKey = 'acg_logs';
    }

    /**
     * 添加日誌條目
     * @param {Object} logEntry 日誌條目
     */
    add(logEntry) {
        const logs = this.get();
        logs.unshift(logEntry);
        
        // 限制存儲大小
        if (logs.length > this.maxSize) {
            logs.splice(this.maxSize);
        }
        
        this.save(logs);
    }

    /**
     * 獲取日誌條目
     * @param {Object} options 查詢選項
     * @returns {Array} 日誌條目數組
     */
    get(options = {}) {
        const logs = this.load();
        let filteredLogs = logs;

        // 按級別過濾
        if (options.level) {
            filteredLogs = filteredLogs.filter(log => 
                log.level.toLowerCase() === options.level.toLowerCase()
            );
        }

        // 按時間範圍過濾
        if (options.since) {
            const since = new Date(options.since);
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) >= since
            );
        }

        if (options.until) {
            const until = new Date(options.until);
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) <= until
            );
        }

        // 限制數量
        if (options.limit) {
            filteredLogs = filteredLogs.slice(0, options.limit);
        }

        return filteredLogs;
    }

    /**
     * 清除日誌
     * @param {Object} options 清除選項
     */
    clear(options = {}) {
        if (options.all) {
            localStorage.removeItem(this.storageKey);
        } else {
            const logs = this.get(options);
            this.save(logs);
        }
    }

    /**
     * 從 localStorage 載入日誌
     * @returns {Array} 日誌數組
     */
    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load logs from storage:', error);
            return [];
        }
    }

    /**
     * 保存日誌到 localStorage
     * @param {Array} logs 日誌數組
     */
    save(logs) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(logs));
        } catch (error) {
            console.error('Failed to save logs to storage:', error);
        }
    }
}

/**
 * 性能監控器
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
    }

    /**
     * 初始化性能監控
     */
    init() {
        // 監控頁面載入性能
        this.observePageLoad();
        
        // 監控資源載入性能
        this.observeResourceLoad();
        
        // 監控長任務
        this.observeLongTasks();
    }

    /**
     * 觀察頁面載入性能
     */
    observePageLoad() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        this.recordMetric('pageLoad', {
                            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                            firstPaint: this.getFirstPaint(),
                            firstContentfulPaint: this.getFirstContentfulPaint()
                        });
                    }
                }, 0);
            });
        }
    }

    /**
     * 觀察資源載入性能
     */
    observeResourceLoad() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'resource') {
                        this.recordMetric('resourceLoad', {
                            name: entry.name,
                            duration: entry.duration,
                            size: entry.transferSize || 0
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
            this.observers.push(observer);
        }
    }

    /**
     * 觀察長任務
     */
    observeLongTasks() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'longtask') {
                        this.recordMetric('longTask', {
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
            this.observers.push(observer);
        }
    }

    /**
     * 獲取首次繪製時間
     * @returns {number|null} 首次繪製時間
     */
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    /**
     * 獲取首次內容繪製時間
     * @returns {number|null} 首次內容繪製時間
     */
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : null;
    }

    /**
     * 記錄性能指標
     * @param {string} name 指標名稱
     * @param {Object} data 指標數據
     */
    recordMetric(name, data) {
        this.metrics.set(name, {
            ...data,
            timestamp: new Date().toISOString()
        });
        
        // 發送到日誌系統
        if (window.logger) {
            window.logger.debug(`Performance: ${name}`, data);
        }
    }

    /**
     * 開始計時
     * @param {string} name 計時器名稱
     */
    startTimer(name) {
        this.metrics.set(name, {
            startTime: performance.now(),
            type: 'timer'
        });
    }

    /**
     * 結束計時
     * @param {string} name 計時器名稱
     * @returns {number} 經過時間
     */
    endTimer(name) {
        const timer = this.metrics.get(name);
        if (timer && timer.type === 'timer') {
            const duration = performance.now() - timer.startTime;
            this.recordMetric(name, { duration, type: 'timer' });
            return duration;
        }
        return 0;
    }

    /**
     * 獲取性能指標
     * @returns {Object} 性能指標對象
     */
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }

    /**
     * 清除性能指標
     */
    clear() {
        this.metrics.clear();
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// 創建全局日誌實例
window.logger = new Logger({
    level: window.configManager?.getAppConfig().debug ? 'debug' : 'info',
    enableConsole: true,
    enableStorage: true,
    enableRemote: false
});

// 導出日誌系統（支援模組化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Logger, LogStorage, PerformanceMonitor };
}