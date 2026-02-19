/**
 * Usability Manager - 實用性增強模組 v8.0.0
 * 提供收藏、搜尋歷史、主題切換、最近瀏覽等功能
 * @version 8.0.0
 * @date 2026-02-10
 */

class UsabilityManager {
    constructor() {
        this.storagePrefix = 'acg_usability_';
        this.maxHistoryItems = 20;
        this.maxRecentItems = 30;
        this.favorites = new Set();
        this.searchHistory = [];
        this.recentViews = [];
        this.theme = 'dark';
        this.quickFilters = [];

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadFavorites();
        this.loadSearchHistory();
        this.loadRecentViews();
        this.loadTheme();
        this.loadQuickFilters();
        this.setupAutoSave();
        this.applyTheme();

        console.log('[Usability] 實用性管理模組已啟動');
    }

    // ========== 收藏功能 ==========

    /**
     * 載入收藏
     */
    loadFavorites() {
        try {
            const stored = localStorage.getItem(this.storagePrefix + 'favorites');
            if (stored) {
                const ids = JSON.parse(stored);
                this.favorites = new Set(ids);
            }
        } catch (e) {
            console.warn('[Usability] 載入收藏失敗:', e);
            this.favorites = new Set();
        }
    }

    /**
     * 儲存收藏
     */
    saveFavorites() {
        try {
            localStorage.setItem(
                this.storagePrefix + 'favorites',
                JSON.stringify([...this.favorites])
            );
        } catch (e) {
            console.warn('[Usability] 儲存收藏失敗:', e);
        }
    }

    /**
     * 切換收藏狀態
     */
    toggleFavorite(itemId) {
        const id = String(itemId);
        if (this.favorites.has(id)) {
            this.favorites.delete(id);
            return false;
        } else {
            this.favorites.add(id);
            return true;
        }
    }

    /**
     * 檢查是否已收藏
     */
    isFavorite(itemId) {
        return this.favorites.has(String(itemId));
    }

    /**
     * 取得所有收藏
     */
    getFavorites() {
        return [...this.favorites];
    }

    /**
     * 取得收藏數量
     */
    getFavoritesCount() {
        return this.favorites.size;
    }

    // ========== 搜尋歷史 ==========

    /**
     * 載入搜尋歷史
     */
    loadSearchHistory() {
        try {
            const stored = localStorage.getItem(this.storagePrefix + 'search_history');
            if (stored) {
                this.searchHistory = JSON.parse(stored);
            }
        } catch (e) {
            this.searchHistory = [];
        }
    }

    /**
     * 儲存搜尋歷史
     */
    saveSearchHistory() {
        try {
            localStorage.setItem(
                this.storagePrefix + 'search_history',
                JSON.stringify(this.searchHistory.slice(0, this.maxHistoryItems))
            );
        } catch (e) {
            console.warn('[Usability] 儲存搜尋歷史失敗:', e);
        }
    }

    /**
     * 新增搜尋記錄
     */
    addSearch(query, filters = {}) {
        if (!query || query.trim() === '') return;

        const entry = {
            query: query.trim(),
            filters: filters,
            timestamp: Date.now()
        };

        // 移除相同查詢
        const existing = this.searchHistory.findIndex(
            s => s.query.toLowerCase() === entry.query.toLowerCase()
        );
        if (existing !== -1) {
            this.searchHistory.splice(existing, 1);
        }

        // 新增到最前面
        this.searchHistory.unshift(entry);

        // 限制數量
        this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);

        this.saveSearchHistory();
        this.notifyListeners('searchHistoryChanged');
    }

    /**
     * 取得搜尋歷史
     */
    getSearchHistory() {
        return [...this.searchHistory];
    }

    /**
     * 清除搜尋歷史
     */
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
        this.notifyListeners('searchHistoryChanged');
    }

    /**
     * 刪除單筆搜尋記錄
     */
    deleteSearchHistory(index) {
        if (index >= 0 && index < this.searchHistory.length) {
            this.searchHistory.splice(index, 1);
            this.saveSearchHistory();
            this.notifyListeners('searchHistoryChanged');
        }
    }

    // ========== 最近瀏覽 ==========

    /**
     * 載入最近瀏覽
     */
    loadRecentViews() {
        try {
            const stored = localStorage.getItem(this.storagePrefix + 'recent_views');
            if (stored) {
                this.recentViews = JSON.parse(stored);
            }
        } catch (e) {
            this.recentViews = [];
        }
    }

    /**
     * 儲存最近瀏覽
     */
    saveRecentViews() {
        try {
            localStorage.setItem(
                this.storagePrefix + 'recent_views',
                JSON.stringify(this.recentViews.slice(0, this.maxRecentItems))
            );
        } catch (e) {
            console.warn('[Usability] 儲存最近瀏覽失敗:', e);
        }
    }

    /**
     * 新增最近瀏覽記錄
     */
    addRecentView(item) {
        if (!item || !item.id) return;

        const entry = {
            id: String(item.id),
            name: item.name || item.title || 'Unknown',
            poster_url: item.poster_url || item.image_url || '',
            category: item.category || 'anime',
            timestamp: Date.now()
        };

        // 移除相同項目
        const existing = this.recentViews.findIndex(r => r.id === entry.id);
        if (existing !== -1) {
            this.recentViews.splice(existing, 1);
        }

        // 新增到最前面
        this.recentViews.unshift(entry);

        // 限制數量
        this.recentViews = this.recentViews.slice(0, this.maxRecentItems);

        this.saveRecentViews();
        this.notifyListeners('recentViewsChanged');
    }

    /**
     * 取得最近瀏覽
     */
    getRecentViews() {
        return [...this.recentViews];
    }

    /**
     * 清除最近瀏覽
     */
    clearRecentViews() {
        this.recentViews = [];
        this.saveRecentViews();
        this.notifyListeners('recentViewsChanged');
    }

    // ========== 主題切換 ==========

    /**
     * 載入主題
     */
    loadTheme() {
        try {
            const stored = localStorage.getItem(this.storagePrefix + 'theme');
            if (stored) {
                this.theme = stored;
            }
        } catch (e) {
            this.theme = 'dark';
        }
    }

    /**
     * 切換主題
     */
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.saveTheme();
        this.applyTheme();
        this.notifyListeners('themeChanged', this.theme);
    }

    /**
     * 設定主題
     */
    setTheme(theme) {
        if (['dark', 'light'].includes(theme)) {
            this.theme = theme;
            this.saveTheme();
            this.applyTheme();
            this.notifyListeners('themeChanged', this.theme);
        }
    }

    /**
     * 取得目前主題
     */
    getTheme() {
        return this.theme;
    }

    /**
     * 儲存主題
     */
    saveTheme() {
        try {
            localStorage.setItem(this.storagePrefix + 'theme', this.theme);
        } catch (e) {
            console.warn('[Usability] 儲存主題失敗:', e);
        }
    }

    /**
     * 套用主題
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);

        // 更新 CSS 變數
        if (this.theme === 'light') {
            document.documentElement.style.setProperty('--bg-dark', '#f5f5f5');
            document.documentElement.style.setProperty('--bg-card', '#ffffff');
            document.documentElement.style.setProperty('--text-primary', '#1a1a2e');
            document.documentElement.style.setProperty('--text-secondary', '#4a4a6a');
        } else {
            document.documentElement.style.setProperty('--bg-dark', '#050609');
            document.documentElement.style.setProperty('--bg-card', '#0f1520');
            document.documentElement.style.setProperty('--text-primary', '#ffffff');
            document.documentElement.style.setProperty('--text-secondary', '#a0a0b0');
        }
    }

    // ========== 快速篩選 ==========

    /**
     * 載入快速篩選
     */
    loadQuickFilters() {
        try {
            const stored = localStorage.getItem(this.storagePrefix + 'quick_filters');
            if (stored) {
                this.quickFilters = JSON.parse(stored);
            } else {
                // 預設快速篩選
                this.quickFilters = [
                    { name: '⭐ 收藏', icon: '⭐', filters: { favorite: true } },
                    { name: '最近新增', icon: '🆕', filters: { sort: 'newest' } },
                    { name: '高評分', icon: '🔥', filters: { rating: ['SS', '優'] } }
                ];
            }
        } catch (e) {
            this.quickFilters = [];
        }
    }

    /**
     * 儲存快速篩選
     */
    saveQuickFilters() {
        try {
            localStorage.setItem(
                this.storagePrefix + 'quick_filters',
                JSON.stringify(this.quickFilters)
            );
        } catch (e) {
            console.warn('[Usability] 儲存快速篩選失敗:', e);
        }
    }

    /**
     * 新增快速篩選
     */
    addQuickFilter(name, icon, filters) {
        this.quickFilters.push({ name, icon, filters, custom: true });
        this.saveQuickFilters();
        this.notifyListeners('quickFiltersChanged');
    }

    /**
     * 刪除快速篩選
     */
    deleteQuickFilter(index) {
        if (this.quickFilters[index]?.custom) {
            this.quickFilters.splice(index, 1);
            this.saveQuickFilters();
            this.notifyListeners('quickFiltersChanged');
        }
    }

    /**
     * 取得快速篩選
     */
    getQuickFilters() {
        return [...this.quickFilters];
    }

    // ========== 資料匯出/匯入 ==========

    /**
     * 匯出所有資料
     */
    exportAllData() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            favorites: [...this.favorites],
            searchHistory: this.searchHistory,
            recentViews: this.recentViews,
            quickFilters: this.quickFilters,
            theme: this.theme
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        this.downloadBlob(blob, `acg-backup-${Date.now()}.json`);
    }

    /**
     * 匯入資料
     */
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    if (data.favorites) {
                        this.favorites = new Set(data.favorites);
                        this.saveFavorites();
                    }

                    if (data.searchHistory) {
                        this.searchHistory = data.searchHistory.slice(0, this.maxHistoryItems);
                        this.saveSearchHistory();
                    }

                    if (data.recentViews) {
                        this.recentViews = data.recentViews.slice(0, this.maxRecentItems);
                        this.saveRecentViews();
                    }

                    if (data.quickFilters && Array.isArray(data.quickFilters)) {
                        this.quickFilters = data.quickFilters;
                        this.saveQuickFilters();
                    }

                    if (data.theme && ['dark', 'light'].includes(data.theme)) {
                        this.theme = data.theme;
                        this.saveTheme();
                        this.applyTheme();
                    }

                    this.notifyListeners('dataImported');
                    resolve({ success: true });

                } catch (err) {
                    reject(new Error('無效的備份檔案'));
                }
            };

            reader.onerror = () => reject(new Error('讀取檔案失敗'));
            reader.readAsText(file);
        });
    }

    /**
     * 下載 Blob
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ========== 事件系統 ==========

    /**
     * 設置事件監聽器
     */
    listeners = new Map();

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error('[Usability] Listener error:', e);
                }
            });
        }
    }

    /**
     * 設置自動儲存
     */
    setupAutoSave() {
        // 頁面卸載前儲存
        window.addEventListener('beforeunload', () => {
            this.saveFavorites();
            this.saveSearchHistory();
            this.saveRecentViews();
            this.saveTheme();
            this.saveQuickFilters();
        });
    }

    /**
     * 取得使用統計
     */
    getStats() {
        return {
            favoritesCount: this.favorites.size,
            searchHistoryCount: this.searchHistory.length,
            recentViewsCount: this.recentViews.length,
            quickFiltersCount: this.quickFilters.length,
            currentTheme: this.theme
        };
    }

    /**
     * 清除所有資料
     */
    clearAll() {
        this.favorites = new Set();
        this.searchHistory = [];
        this.recentViews = [];

        this.saveFavorites();
        this.saveSearchHistory();
        this.saveRecentViews();

        this.notifyListeners('allDataCleared');
    }
}

// 創建全域實例
window.usabilityManager = new UsabilityManager();

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsabilityManager;
}

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('usability', {
        loaded: true,
        exports: { 
            usabilityManager: window.usabilityManager
        },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: usability');
}
