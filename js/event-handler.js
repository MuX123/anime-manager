/**
 * event-handler.js
 * ACG 收藏庫 - 事件處理 (Controller Layer)
 * 負責：
 * 1. 路由與導航 (switchCategory, changePage)
 * 2. 用戶輸入處理 (handleSearch, handleFilter)
 * 3. 系統事件監聽
 */

class EventHandler {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.category) {
                this.switchCategory(e.state.category, false);
            }
        });
    }

    switchCategory(cat, pushState = true) {
        // Admin 模式下不處理，切換分類由後台自行處理
        if (window.currentSection === 'admin') return;

        if (cat === window.currentCategory) return;

        window.dataManager.setCategory(cat);
        window.currentPage = 1;

        if (pushState) {
            history.pushState({ category: cat }, '', `?category=${cat}`);
        }

        window.renderApp();
        if (window.scrollTo) window.scrollTo(0, 0);
    }

    changePage(page) {
        window.currentPage = page;
        window.renderApp();
        // Scroll to top of grid
        const grid = document.getElementById('main-grid-content');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
    }

    handleSearch(query) {
        window.dataManager.updateFilter('search', query);
        window.currentPage = 1;

        // Debounce render? For now direct
        window.renderApp();
    }

    handleFilter(key, value) {
        window.dataManager.updateFilter(key, value);
        window.currentPage = 1;
        window.renderApp();
    }

    toggleAdminMode(enable) {
        if (enable) {
            // Check auth
            if (!window.isAdminLoggedIn) {
                window.showAdminLoginModal();
                return;
            }

            // [Optimization] Pause visual engine and force black background
            if (window.visualEngine) window.visualEngine.stop();
            document.documentElement.classList.add('admin-active');

            window.uiController.renderAdmin();
        } else {
            // [Optimization] Restore visual engine
            if (window.visualEngine) window.visualEngine.start();
            document.documentElement.classList.remove('admin-active');

            window.renderApp();
        }
    }
}

window.eventHandler = new EventHandler();

// Global Map - 這些函數會被 script.js 覆蓋，這裡只是備份映射
// window.switchCategory = (c) => window.eventHandler.switchCategory(c);
// window.changePage = (p) => window.eventHandler.changePage(p);
window.handleSearch = (q) => window.eventHandler.handleSearch(q);
window.handleFilter = (k, v) => window.eventHandler.handleFilter(k, v);
window.toggleAdminMode = (e) => window.eventHandler.toggleAdminMode(e);

// ===== 右側系統收納盒缺失的函數 =====

// 切換系統收納盒的標籤頁
window.switchMenuTab = function(tabName) {
    // 移除所有 active 類
    document.querySelectorAll('.menu-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.remove('menu-tab-active');
    });
    document.querySelectorAll('.menu-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 啟用目標標籤
    const targetTab = document.querySelector(`.menu-tab[data-tab="${tabName}"]`);
    const targetContent = document.getElementById(`tab-${tabName}`);
    
    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.classList.add('menu-tab-active');
    }
    if (targetContent) {
        targetContent.classList.add('active');
    }
};

// 改變網格佈局
window.changeGridLayout = function(layout) {
    // 保存佈局偏好到 localStorage
    localStorage.setItem('gridLayout', layout);
    
    // 如果存在 dataManager，更新其狀態
    if (window.dataManager) {
        window.dataManager.updateFilter('gridLayout', layout);
    }
    
    // 觸發重新渲染
    window.renderApp();
};

// 改變排序順序
window.changeSortOrder = function(order) {
    // 保存排序偏好到 localStorage
    localStorage.setItem('sortOrder', order);
    
    // 如果存在 dataManager，更新其狀態
    if (window.dataManager) {
        window.dataManager.updateFilter('sortOrder', order);
    }
    
    // 觸發重新渲染
    window.renderApp();
};

window.deleteAllInCategory = () => {
    if (confirm('Delete All in ' + window.currentCategory + '?')) {
        // Call logic
        window.showToast('Batch Delete Not Implemented in Refactor yet (Safety)', 'warning');
    }
};

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('event-handler', {
        loaded: true,
        exports: { 
            eventHandler: window.eventHandler,
            handleSearch: window.handleSearch,
            handleFilter: window.handleFilter,
            switchMenuTab: window.switchMenuTab,
            changeGridLayout: window.changeGridLayout,
            changeSortOrder: window.changeSortOrder
        },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: event-handler');
}
