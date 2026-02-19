/**
 * render-app.js
 * ACG 收藏庫 - 應用程序渲染模組
 * 負責：主應用容器渲染、板塊切換、公告/網格顯示
 */

console.log('📱 載入應用渲染模組...');

// 添加分頁樣式
const paginationStyle = `
<style>
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px 0;
}
.pagination .btn-primary {
    background: rgba(0, 212, 255, 0.15);
    border: 1px solid rgba(0, 212, 255, 0.4);
    color: #00d4ff;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.pagination .btn-primary:hover {
    background: rgba(0, 212, 255, 0.3);
    border-color: #00d4ff;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
    transform: translateY(-2px);
}
.pagination .btn-primary:active {
    transform: translateY(0);
}
.pagination-info {
    color: #00d4ff;
    font-family: 'Orbitron', sans-serif;
    font-size: 16px;
    font-weight: 700;
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    padding: 8px 20px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 6px;
    border: 1px solid rgba(0, 212, 255, 0.2);
    min-width: 80px;
    text-align: center;
}
/* 搜尋條件選擇縮小一半 */
.search-filters-scaled {
    transform: scale(0.7);
    transform-origin: center top;
    margin-bottom: -20px;
}
.search-ghost,
input[type="text"],
input[type="email"],
input[type="password"],
input[type="search"],
textarea {
    background: rgba(0, 0, 0, 0.5) !important;
    border: 1px solid rgba(0, 212, 255, 0.3) !important;
    color: #fff !important;
}
.search-ghost:focus,
input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus,
input[type="search"]:focus,
textarea:focus {
    border-color: #00d4ff !important;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.3) !important;
}
/* 搜尋條件選擇縮小一半 */
.search-filters-scaled {
    transform: scale(0.7);
    transform-origin: center top;
    margin-bottom: -20px;
}
</style>
`;

// 插入樣式
document.head.insertAdjacentHTML('beforeend', paginationStyle);

// 當前分類狀態
window.currentCategory = 'anime';
window.currentPage = 1;
window.itemsPerPage = 20;

// Performance optimization: Render caching and batching
window._renderCache = new Map();
window._renderPending = false;
window._renderDebounceTimer = null;

/**
 * 渲染主應用容器
 */
window.renderApp = function (requestId = null) {
    // Debounce rapid render calls
    if (window._renderDebounceTimer) {
        clearTimeout(window._renderDebounceTimer);
    }
    
    window._renderDebounceTimer = setTimeout(() => {
        window._performRender(requestId);
    }, 16); // ~60fps throttle
};

window._performRender = function (requestId = null) {
    const app = document.getElementById('app');
    if (!app) {
        console.warn('[renderApp] #app not found');
        return;
    }

    console.log('[renderApp] Rendering with data:', window.animeData?.length || 0, 'items');

    // 檢查是否為管理員模式
    if (window.currentSection === 'admin' || document.body.classList.contains('admin-mode-active')) {
        // 調用 script.js 中的 renderAdmin（如果存在）
        if (typeof window.renderAdmin === 'function') {
            window.renderAdmin(requestId);
            return;
        }
    }

    const isNotice = window.currentCategory === 'notice';

    // 獲取過濾後的數據
    let filtered = [];
    if (window.dataManager?.getFilteredData) {
        filtered = window.dataManager.getFilteredData();
    } else if (window.getFilteredData) {
        filtered = window.getFilteredData();
    }

    // 獲取網格列數
    const gridColumns = parseInt(window.gridColumns) || 4;

    // 分頁
    const paged = filtered.slice(
        (window.currentPage - 1) * window.itemsPerPage,
        window.currentPage * window.itemsPerPage
    );

    // 渲染內容
    const content = isNotice
        ? window.renderAnnouncements
            ? window.renderAnnouncements()
            : window.renderAnnouncementBoard
                ? window.renderAnnouncementBoard()
                : '<div style="padding:40px;text-align:center;color:var(--text-secondary);">載入訊息中...</div>'
        : window.renderGridContent(paged, filtered.length, gridColumns);

    // 取得現有的容器，如果不存在則進行完整渲染
    let container = app.querySelector('.app-container');

    if (!container) {
        // 首次完整渲染 - 新布局：左側搜尋菜單 + 右側內容
        app.innerHTML = `
            <div class="app-container">
                <!-- 站點標題 -->
                <header class="app-header">
                    <div style="display: flex; justify-content: center; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <h1 style="color: #ffffff; text-shadow: 0 0 10px var(--neon-blue); margin-bottom: 8px;">
                            ${window.siteSettings?.site_title || 'ACG 收藏庫'} <span style="font-size: 14px; color: var(--text-secondary); margin-left: 10px;">v8.0.0</span>
                        </h1>
                    </div>
                </header>
                
                <!-- 右側主內容 -->
                <div class="main-content-panel">
                    <!-- 分類按鈕 -->
                    <div class="category-buttons-container">
                        <button class="btn-primary ${window.currentCategory === 'notice' ? 'active' : ''}" onclick="window.switchCategory('notice')">訊息</button>
                        <button class="btn-primary ${window.currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">動畫</button>
                        <button class="btn-primary ${window.currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">漫畫</button>
                        <button class="btn-primary ${window.currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">電影</button>
                    </div>

                    <!-- 公告容器 -->
                    <div id="notice-container" style="display: ${isNotice ? 'block' : 'none'}; width: 100%;">
                        <div style="max-width: 765px; margin: 0 auto;">
                            ${isNotice ? content : ''}
                        </div>
                    </div>

                    <!-- 網格內容 -->
                    <div id="main-grid-content" style="display: ${isNotice ? 'none' : 'block'};">
                        <div id="pagination-top-container" class="pagination-minimal" style="margin-bottom: 25px;">
                            ${!isNotice && window.renderPagination ? window.renderPagination(filtered.length) : ''}
                        </div>
                        <div id="anime-grid-container" class="anime-grid" style="
                            display: ${gridColumns === 'mobile' ? 'flex' : 'grid'};
                            ${gridColumns === 'mobile' ? 'flex-direction: column; gap: 10px;' : `grid-template-columns: repeat(${gridColumns}, 1fr); gap: 20px;`}
                        ">
                            ${!isNotice ? (paged.length > 0 ? paged.map(item => window.renderCard ? window.renderCard(item) : '').join('') : '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">未找到相關資料</div>') : ''}
                        </div>
                        <div id="pagination-container" class="pagination-minimal" style="margin-top: 40px;">
                            ${!isNotice && window.renderPagination ? window.renderPagination(filtered.length) : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // 局部更新

        // 1. 更新分類按鈕狀態
        container.querySelectorAll('.category-buttons-container button').forEach(btn => {
            const isActive = btn.innerText.includes(isNotice ? '訊息' : (window.currentCategory === 'anime' ? '動畫' : (window.currentCategory === 'manga' ? '漫畫' : '電影')));
            btn.classList.toggle('active', isActive);
        });

        // 2. 更新公告內容
        const noticeCont = document.getElementById('notice-container');
        if (noticeCont) {
            noticeCont.style.display = isNotice ? 'block' : 'none';
            if (isNotice) {
                const inner = noticeCont.querySelector('div');
                if (inner) inner.innerHTML = content;
            }
        }

        // 4. 更新網格內容與分頁
        const mainGrid = document.getElementById('main-grid-content');
        if (mainGrid) {
            mainGrid.style.display = isNotice ? 'none' : 'block';
            if (!isNotice) {
                // 更新分頁
                const pagTop = document.getElementById('pagination-top-container');
                const pagBottom = document.getElementById('pagination-container');
                const pagHtml = window.renderPagination ? window.renderPagination(filtered.length) : '';
                if (pagTop) pagTop.innerHTML = pagHtml;
                if (pagBottom) pagBottom.innerHTML = pagHtml;

                    // 更新網格列表 - 使用 requestAnimationFrame 優化
                    const gridCont = document.getElementById('anime-grid-container');
                    if (gridCont) {
                        gridCont.style.display = gridColumns === 'mobile' ? 'flex' : 'grid';
                        gridCont.style.flexDirection = gridColumns === 'mobile' ? 'column' : '';
                        gridCont.style.gap = gridColumns === 'mobile' ? '10px' : '20px';
                        gridCont.style.gridTemplateColumns = gridColumns === 'mobile' ? '' : `repeat(${gridColumns}, 1fr)`;

                        // Performance: Batch DOM updates
                        requestAnimationFrame(() => {
                            const newHTML = paged.length > 0
                                ? paged.map(item => {
                                    // Simple cache key
                                    const cacheKey = item.id + '-' + gridColumns;
                                    if (window._renderCache.has(cacheKey)) {
                                        return window._renderCache.get(cacheKey);
                                    }
                                    const html = window.renderCard ? window.renderCard(item) : '';
                                    // Cache only first 50 items to prevent memory bloat
                                    if (window._renderCache.size < 50) {
                                        window._renderCache.set(cacheKey, html);
                                    }
                                    return html;
                                }).join('')
                                : '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">未找到相關資料</div>';
                            
                            gridCont.innerHTML = newHTML;
                        });
                    }
            }
        }
    }

    // 確保詳情彈窗 HTML 存在
    if (!document.getElementById('detailModal')) {
        const modalHTML = `
            <div id="detailModal" class="modal" onclick="if(event.target===this) window.closeAnimeDetail()">
                <div class="modal-content">
                    <button class="close-btn" onclick="window.closeAnimeDetail()">&times;</button>
                    <div id="detailContent"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // 更新跑馬燈
    if (window.updateTopMarquee) {
        window.updateTopMarquee();
    }

    // 更新管理員菜單
    if (window.updateAdminMenu) {
        window.updateAdminMenu();
    }

    console.log('[renderApp] Rendered:', window.currentCategory);
};

/**
 * 渲染網格內容（卡片）
 */
window.renderGridContent = function (paged, total, gridColumns) {
    if (!paged.length) {
        return `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">未找到相關資料</div>`;
    }

    return paged.map(item => window.renderCard ? window.renderCard(item) : '').join('');
};

/**
 * 切換分頁
 * 注意：此函數會被 script.js 中的版本覆蓋
 */
window.changePage = function (page) {
    const filtered = window.dataManager?.getFilteredData ? window.dataManager.getFilteredData() : [];
    const pages = Math.ceil(filtered.length / window.itemsPerPage);
    
    if (page < 1 || page > pages) return;
    
    window.currentPage = page;
    window.renderApp();
    
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * 切換分類
 * 注意：此函數會被 script.js 中的版本覆蓋
 */
window.switchCategory = async function (cat) {
    // Update both window and dataManager
    window.currentCategory = cat;
    if (window.dataManager?.setCategory) {
        window.dataManager.setCategory(cat);
    }
    window.currentPage = 1;

    // 更新下拉選單
    const sectionSelect = document.getElementById('section-select');
    if (sectionSelect) {
        sectionSelect.value = cat;
    }

    // 重新渲染
    window.renderApp();

    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * 渲染分頁
 */
window.renderPagination = function (totalItems) {
    const totalPages = Math.ceil(totalItems / window.itemsPerPage);
    if (totalPages <= 1) return '';

    let html = '<div class="pagination">';

    // 上一頁
    if (window.currentPage > 1) {
        html += `<button class="btn-primary" onclick="window.changePage(${window.currentPage - 1})">上一頁</button>`;
    }

    // 頁碼
    html += `<span class="pagination-info">${window.currentPage} / ${totalPages}</span>`;

    // 下一頁
    if (window.currentPage < totalPages) {
        html += `<button class="btn-primary" onclick="window.changePage(${window.currentPage + 1})">下一頁</button>`;
    }

    html += '</div>';
    return html;
};

/**
 * 更新頂部跑馬燈
 */
window.updateTopMarquee = function () {
    const marqueeContent = document.getElementById('top-marquee-content');
    if (!marqueeContent) return;

    // 從公告系統獲取最新公告
    let annText = '歡迎使用 ACG 收藏庫';
    if (window.announcementData?.announcements?.length > 0) {
        const latestAnn = window.announcementData.announcements[0];
        if (latestAnn?.content) {
            // 解析純文本
            const text = latestAnn.content.replace(/<[^>]*>/g, '').substring(0, 100);
            annText = `${latestAnn.title || '訊息'}：${text}`;
        }
    }

    marqueeContent.style.animationDuration = `${Math.max(15, annText.length * 0.4)}s`;
    marqueeContent.innerHTML = `📢 ${annText} &nbsp;&nbsp;&nbsp;&nbsp; ⚡ ${annText} &nbsp;&nbsp;&nbsp;&nbsp;`;
};

/**
 * 渲染過濾下拉選單
 */
window.renderSearchSelectsHTML = function () {
    if (!window.optionsData) return '';

    let html = '';
    const defaultKeys = ['genre', 'year', 'season', 'month', 'episodes', 'rating', 'recommendation'];
    const customKeys = window.optionsData.custom_lists || [];
    const allKeys = [...defaultKeys, ...customKeys];

    allKeys.forEach(key => {
        const options = window.optionsData[key] || [];
        if (options.length === 0) return;

        const label = window.getOptionLabel ? window.getOptionLabel(key) : key;
        const activeVal = window.dataManager?.filters?.[key] || '';

        html += `
            <div class="filter-group">
                <label class="filter-label">${label}</label>
                <select class="auto-width-select sidebar-select" onchange="window.handleFilter('${key}', this.value)">
                    <option value="">全部</option>
                    ${options.map(opt => `
                        <option value="${opt}" ${activeVal === opt ? 'selected' : ''}>${opt}</option>
                    `).join('')}
                </select>
            </div>
        `;
    });
    return html;
};

/**
 * 處理搜尋輸入（加入防抖處理以優化效能）
 */
let searchTimeout;
window.handleSearch = function (val) {
    if (window.dataManager) {
        window.dataManager.filters.search = val;
        window.currentPage = 1;

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            window.renderApp();
        }, 200); // 200ms 防抖
    }
};

/**
 * 處理過濾器切換
 */
window.handleFilter = function (key, val) {
    if (window.dataManager) {
        window.dataManager.updateFilter(key, val);
        window.currentPage = 1;
        window.renderApp();
    }
};

console.log('✅ 應用渲染模組載入完成');

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('render-app', {
        loaded: true,
        exports: { renderApp: window.renderApp },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: render-app');
}
