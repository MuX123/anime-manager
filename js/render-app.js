/**
 * render-app.js
 * ACG 收藏庫 - 應用程序渲染模組
 * 負責：主應用容器渲染、板塊切換、公告/網格顯示
 */

console.log('📱 載入應用渲染模組...');

// 當前分類狀態
window.currentCategory = 'anime';
window.currentPage = 1;
window.itemsPerPage = 20;

/**
 * 渲染主應用容器
 */
window.renderApp = function (requestId = null) {
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
                : '<div style="padding:40px;text-align:center;color:var(--text-secondary);">載入公告中...</div>'
        : window.renderGridContent(paged, filtered.length, gridColumns);

    // 渲染 app HTML
    app.innerHTML = `
        <div class="app-container">
            <!-- 分類按鈕 -->
            <div class="category-buttons-container">
                <button class="btn-primary ${window.currentCategory === 'notice' ? 'active' : ''}" onclick="window.switchCategory('notice')">📢 公告</button>
                <button class="btn-primary ${window.currentCategory === 'anime' ? 'active' : ''}" onclick="window.switchCategory('anime')">🎬 動畫</button>
                <button class="btn-primary ${window.currentCategory === 'manga' ? 'active' : ''}" onclick="window.switchCategory('manga')">📚 漫畫</button>
                <button class="btn-primary ${window.currentCategory === 'movie' ? 'active' : ''}" onclick="window.switchCategory('movie')">🎥 電影</button>
            </div>
            
            <!-- 公告容器 -->
            <div id="notice-container" style="display: ${isNotice ? 'block' : 'none'}; width: 100%;">
                <div style="max-width: 765px; margin: 0 auto;">
                    ${content}
                </div>
            </div>
            
            <!-- 網格內容 -->
            <div id="main-grid-content" style="display: ${isNotice ? 'none' : 'block'};">
                <div id="pagination-top-container" class="pagination-minimal" style="margin-bottom: 25px;">
                    ${window.renderPagination ? window.renderPagination(filtered.length) : ''}
                </div>
                <div id="anime-grid-container" class="anime-grid" style="
                    display: ${gridColumns === 'mobile' ? 'flex' : 'grid'}; 
                    ${gridColumns === 'mobile' ? 'flex-direction: column; gap: 10px;' : `grid-template-columns: repeat(${gridColumns}, 1fr); gap: 20px;`}
                ">
                    ${paged.length > 0 ? paged.map(item => window.renderCard ? window.renderCard(item) : '').join('') : '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">未找到相關資料</div>'}
                </div>
                <div id="pagination-container" class="pagination-minimal" style="margin-top: 40px;">
                    ${window.renderPagination ? window.renderPagination(filtered.length) : ''}
                </div>
            </div>
        </div>
    `;

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
 * 切換分類
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
 * 切換頁面
 */
window.changePage = function (p) {
    window.currentPage = p;
    window.renderApp();
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
            annText = `${latestAnn.title || '公告'}：${text}`;
        }
    }
    
    marqueeContent.style.animationDuration = `${Math.max(15, annText.length * 0.4)}s`;
    marqueeContent.innerHTML = `📢 ${annText} &nbsp;&nbsp;&nbsp;&nbsp; ⚡ ${annText} &nbsp;&nbsp;&nbsp;&nbsp;`;
};

console.log('✅ 應用渲染模組載入完成');
