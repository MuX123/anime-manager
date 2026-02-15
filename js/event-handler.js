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
        if (cat === window.currentCategory && window.currentSection !== 'admin') return;

        window.dataManager.setCategory(cat);
        window.currentPage = 1; // Reset page

        if (pushState) {
            history.pushState({ category: cat }, '', `?category=${cat}`);
        }

        // Hide Admin if active
        if (document.querySelector('.admin-container')) {
            window.toggleAdminMode(false); // will trigger render
        } else {
            window.renderApp();
            if (window.scrollTo) window.scrollTo(0, 0);
        }
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
            // Assume isAdminLoggedIn is managed by main.js/auth
            if (!window.isAdminLoggedIn) {
                window.showAdminLoginModal();
                return;
            }
            window.uiController.renderAdmin();
        } else {
            window.renderApp();
        }
    }
}

window.eventHandler = new EventHandler();

// Global Map
window.switchCategory = (c) => window.eventHandler.switchCategory(c);
window.changePage = (p) => window.eventHandler.changePage(p);
window.handleSearch = (q) => window.eventHandler.handleSearch(q);
window.handleFilter = (k, v) => window.eventHandler.handleFilter(k, v);
window.toggleAdminMode = (e) => window.eventHandler.toggleAdminMode(e);
window.deleteAllInCategory = () => {
    if (confirm('Delete All in ' + window.currentCategory + '?')) {
        // Call logic
        window.showToast('Batch Delete Not Implemented in Refactor yet (Safety)', 'warning');
    }
};
