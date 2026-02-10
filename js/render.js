// TECH v8.0.0 - Rendering Logic Module
// Extracted from script.js and optimized with CSS classes

console.log('🎨 載入渲染模組 (v8.0 - UI Refined)...');

// YouTube URL 轉換函式
function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    let videoId = null;
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) videoId = watchMatch[1];
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) videoId = shortMatch[1];
    const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
    if (embedMatch) videoId = embedMatch[1];
    return videoId;
}

// YouTube 影片加載器 (性能優化：點擊才加載)
window.loadYouTubeVideo = (containerId, videoId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
        </iframe>
    `;
};

// Helper for tag styles
// CSS class 'tag-base' handles layout and border/bg opacity via currentColor
const getTagStyle = (color) => `class="tag-base" style="color: ${color};"`;

// ========== 卡片渲染架構 ==========

// 1. 顏色計算 - 統一管理所有卡片相關顏色
function getCardColors(item) {
    return {
        starColor: item.star_color || optionsData.category_colors?.recommendation || '#ffcc00',
        ratingColor: (optionsData.rating_colors && optionsData.rating_colors[item.rating])
            ? optionsData.rating_colors[item.rating]
            : (optionsData.category_colors?.rating || 'var(--neon-purple)'),
        episodesColor: optionsData.category_colors?.episodes || 'var(--neon-green)',
        nameColor: item.name_color || optionsData.category_colors?.name || '#ffffff',
        yearColor: optionsData.category_colors?.year || 'var(--neon-cyan)',
        genreColor: optionsData.category_colors?.genre || 'var(--neon-cyan)',
        cyanBase: 'rgba(0, 212, 255, 0.1)'
    };
}

// 2. 數據處理 - 統一處理卡片所需數據
function processCardData(item) {
    const genres = Array.isArray(item.genre)
        ? item.genre
        : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);

    const extraTags = [];
    if (item.extra_data) {
        const categoryColors = optionsData.category_colors || {};
        const colorKeys = Object.keys(categoryColors);
        const standardFields = ['genre', 'year', 'season', 'month', 'episodes', 'rating', 'recommendation', 'type', 'category', 'name', 'poster_url', 'description'];
        const excludedKeys = [...standardFields, ...colorKeys];

        Object.entries(item.extra_data).forEach(([key, val]) => {
            const strVal = String(val || '').trim();
            const strKey = String(key || '').trim();

            if (strVal &&
                strKey &&
                !excludedKeys.includes(strKey) &&
                strVal !== strKey &&
                !strKey.startsWith('btn_') &&
                !strKey.includes('_color') &&
                strKey.length > 2) {
                // 顯示使用者選擇的值 (strVal),而不是欄位名稱
                extraTags.push({ val: strVal, color: categoryColors[strKey] || '#ffffff' });
            }
        });
    }

    return {
        genres,
        extraTags,
        starCount: (item.recommendation || '').split('★').length - 1,
        starCount: (item.recommendation || '').split('★').length - 1,
        starText: item.recommendation || '★'
    };
}

// 3. 通用組件渲染函數
function renderAdminButton(id, size = 'normal') {
    if (typeof window.isAdminLoggedIn === 'undefined' || !window.isAdminLoggedIn) return '';
    // Grid 視圖按鈕樣式 (位於右上角,圓形按鈕)
    if (size === 'grid-hover') {
        return `<button onclick="event.stopPropagation(); window.editAnime('${id}')" class="admin-edit-btn">📝</button>`;
    }

    // 列表視圖按鈕樣式 (維持原樣，暫時保留部分 inline style 因為是特殊佈局)
    const sizeStyles = size === 'small'
        ? 'padding: 2px 6px; font-size: 10px; top: 5px; right: 5px;'
        : 'padding: 4px 8px; font-size: 12px; top: 8px; right: 8px;';
    return `<button onclick="event.stopPropagation(); window.editAnime('${id}')" style="position: absolute; ${sizeStyles} background: rgba(0,212,255,0.2); border: 1px solid var(--neon-cyan); color: var(--neon-cyan); border-radius: 4px; cursor: pointer; z-index: 10;">${size === 'small' ? '📝' : '📝 編輯'}</button>`;
}

function renderRatingBadge(rating, color, stars = '★', starColor = '#ffdd00') {
    const escape = (str) => {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
    };
    return `
        <div class="badge-cyber-mini" style="--rating-color: ${color}; --star-color: ${starColor}; vertical-align: middle;">
            <div class="badge-rating">${escape(rating || '普')}</div>
            <div class="badge-stars">${escape(stars || '★')}</div>
        </div>
    `;
}

function renderStarDisplay(starText, color, size = 12) {
    return `<span style="color: ${color}; font-size: ${size}px; font-weight: bold; white-space: nowrap; flex-shrink: 0;">${starText}</span>`;
}

function renderMetaTags(item, colors, showEpisodes = true) {
    const { year, season, month, episodes } = item;
    const escape = (str) => {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
    };

    const tags = [];
    if (year) tags.push(escape(year));
    if (season) tags.push(escape(season));
    if (month) {
        const monthStr = String(month);
        tags.push(escape(monthStr.includes('月') ? monthStr : `${monthStr}月`));
    }
    if (showEpisodes && episodes) tags.push(`全 ${escape(episodes)} 集`);

    return `<div style="display: flex; gap: 8px; font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; align-items: center;">${tags.join('')}</div>`;
}

function renderGenreTags(genres, extraTags, color) {
    const escape = (str) => {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
    };

    const cleanGenres = genres.map(g => g.replace(/["'\[\]\(\),，。]/g, '').trim()).filter(g => g);
    const genreSpans = cleanGenres.map(g => `<span ${getTagStyle(color)}>${escape(g)}</span>`).join('');
    const extraSpans = extraTags.map(t => `<span ${getTagStyle(t.color)}>${escape(t.val)}</span>`).join('');
    return genreSpans + extraSpans;
}

// ========== 3. 布局渲染函數 ==========

// Grid 布局 - 海報卡片
function renderGridCard(item, colors, data) {
    const escape = (str) => {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
    };

    const { id, name, poster_url, episodes, recommendation } = item;
    const { ratingColor, episodesColor, nameColor, yearColor, cyanBase, starColor } = colors;
    // gridColumns might be global
    const gridSize = (typeof gridColumns !== 'undefined' && gridColumns == 5) ? 14 : ((typeof gridColumns !== 'undefined' && gridColumns == 4) ? 15 : 16);

    // 計算日期標籤顯示組
    let dateGroupHTML = '';
    const dateItems = [];
    if (item.year) dateItems.push(item.year);
    if (item.season && (typeof gridColumns === 'undefined' || gridColumns != 5)) dateItems.push(item.season);
    if (item.month) {
        const monthStr = String(item.month);
        dateItems.push(monthStr.includes('月') ? monthStr : monthStr + '月');
    }

    if (dateItems.length > 0) {
        const itemsHTML = dateItems.map(d => `<span class="date-group-item">${escape(d)}</span>`).join('');
        dateGroupHTML = `<div class="date-group-tag" style="--year-color: ${yearColor};">${itemsHTML}</div>`;
    }

    return `
        <div class="anime-card game-card-effect" onclick="window.showAnimeDetail('${id}')" style="--rating-color: ${ratingColor};">
            ${renderAdminButton(id, 'grid-hover')}
            
            <!-- Cyber-Mini Badge (Card View) -->
            <div style="position: absolute; top: 12px; left: 12px; z-index: 10; pointer-events: none; transform: scale(${(typeof gridColumns !== 'undefined' && gridColumns <= 4) ? 1.3 : 1}); transform-origin: top left;">
                <div class="badge-cyber-mini" style="--rating-color: ${ratingColor}; --star-color: ${starColor}; vertical-align: middle;">
                    <div class="badge-rating">${escape(item.rating || '普')}</div>
                    <div class="badge-stars">${escape(recommendation || '★')}</div>
                </div>
            </div>

            <div class="grid-poster-container">
                <img src="${poster_url || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22%3E%3Crect fill=%22%231a1a2e%22 width=%22300%22 height=%22450%22/%3E%3Ctext fill=%22%23666%22 font-family=%22sans-serif%22 font-size=%2218%22 x=%2250%25%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENO+IMAGE%3C/text%3E%3C/svg%3E'}" 
                    class="grid-poster-img"
                >
                <div class="grid-poster-overlay"></div>
                
                ${episodes ? `
                <div class="grid-poster-episodes" style="--episodes-color: ${episodesColor};">
                    <span style="
                        color: ${episodesColor};
                        font-size: 12px;
                        font-weight: 800;
                        letter-spacing: 0.5px;
                        text-shadow: 0 0 5px rgba(0,0,0,0.8);
                    ">全 ${escape(episodes)} 集</span>
                </div>
                ` : ''}
            </div>
            
            <div class="card-separator"></div>
            
            <div class="grid-info-container">
                <h3 class="grid-title" style="font-size: ${gridSize}px; color: ${nameColor}; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${escape(name)}
                </h3>
                
                <div class="grid-tags-row" style="margin-bottom: 0;">
                    ${dateGroupHTML}
                    
                    ${/* 其他可能的額外標籤位置，保留擴充性，目前只顯示日期組 */ ''}
                </div>
            </div>
            
            <div class="card-border-glow"></div>
        </div>
    `;
}

// Desktop List 布局 - 桌面資料列表
function renderListCard(item, colors, data) {
    const escape = (str) => {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
    };

    const { id, name, type } = item;
    const { ratingColor, nameColor, starColor, genreColor } = colors;
    const { genres, extraTags, starText } = data;

    // List view style complex, keeping some inline for flex layout structures unique to this view
    return `
        <div class="anime-card desktop-list-layout game-card-effect" onclick="window.showAnimeDetail('${id}')" style="display: flex !important; align-items: center; margin: 0 0 10px 0 !important; background: #000 !important; border: 1px solid ${ratingColor} !important; border-radius: 10px !important; padding: 12px 20px !important; gap: 0; width: 100%; overflow: hidden; position: relative; --rating-color: ${ratingColor};">
            ${renderAdminButton(id)}
            <div style="display: flex; align-items: center; justify-content: center; width: 120px; flex-shrink: 0; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 15px;">
                ${renderRatingBadge(item.rating, ratingColor, item.recommendation, starColor)}
            </div>
            <div style="flex: 1; min-width: 0; display: flex; align-items: center; padding-left: 20px; gap: 20px; height: 100%;">
                <div style="flex: 0 0 40%; min-width: 0; display: flex; flex-direction: column; gap: 8px;">
                    <h3 style="color: ${nameColor}; font-size: 15px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold;">${escape(name)}</h3>
                    ${renderMetaTags(item, colors)}
                </div>
                <div style="flex: 0 0 15%; min-width: 0; display: flex; flex-direction: column; gap: 4px; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 20px; justify-content: center;">
                    <span style="color: ${genreColor}; font-size: 14px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escape(type || '')}</span>
                </div>
                <div class="desktop-scroll-tags" onwheel="this.scrollLeft += event.deltaY; event.preventDefault();" style="flex: 1; display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; padding: 10px 0; scrollbar-width: none; cursor: grab; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 20px; align-items: center;">
                    <style>.desktop-scroll-tags::-webkit-scrollbar { display: none; }</style>
                    ${renderGenreTags(genres, extraTags, genreColor)}
                </div>
            </div>
        </div>
    `;
}

// Mobile 布局 - 移動端卡片
function renderMobileCard(item, colors, data) {
    const escape = (str) => {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
    };

    const { id, name } = item;
    const { ratingColor, nameColor, starColor } = colors;
    const { starText } = data;

    return `
        <div class="anime-card mobile-layout-card game-card-effect" onclick="window.showAnimeDetail('${id}')" style="display: flex !important; flex-direction: column; justify-content: center; margin: 0 0 10px 0 !important; background: #000 !important; border: 1px solid ${ratingColor} !important; border-radius: 10px !important; padding: 10px 15px !important; gap: 6px; width: 100%; height: 75px; overflow: hidden; position: relative; --rating-color: ${ratingColor};">
            <div style="position: absolute; inset: 0; background: linear-gradient(135deg, ${ratingColor}15 0%, transparent 60%); z-index: 0;"></div>
            ${renderAdminButton(id, 'small')}
            <div style="display: flex; align-items: center; gap: 10px; width: 100%; overflow: hidden; position: relative; z-index: 1;">
                ${renderRatingBadge(item.rating, ratingColor, item.recommendation, starColor)}
                ${renderMetaTags(item, colors)}
            </div>
        </div>
    `;
}

// 4. 主入口函數
window.renderCard = (item) => {
    const colors = getCardColors(item);
    const data = processCardData(item);

    // 移動端佈局
    if (window.innerWidth <= 768) {
        return renderMobileCard(item, colors, data);
    }

    // 桌面資料列表佈局
    if (typeof gridColumns !== 'undefined' && gridColumns === 'mobile') {
        return renderListCard(item, colors, data);
    }

    // 網格佈局（默認）
    return renderGridCard(item, colors, data);
};

window.showAnimeDetail = (id) => {
    // 性能優化：開啟詳情時停止並徹底隱藏背景動畫 -> 恢復動畫顯示
    /*
    if (window.AtmosphereAPI) {
        window.AtmosphereAPI.pause();
        const bgCanvas = document.getElementById('atmosphere-canvas');
        if (bgCanvas) bgCanvas.style.display = 'none';
    }
    */

    const escape = (str) => {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
    };

    const item = animeData.find(a => a.id == id);
    if (!item) {
        console.error('[Render] 找不到作品資料:', id);
        return;
    }
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');

    if (!modal || !content) {
        console.error('[Render] 找不到詳情彈窗容器 (detailModal/detailContent)');
        // 嘗試自動修正：如果不存在則動態建立
        if (!modal) {
            console.warn('[Render] 正在動態建立 detailModal...');
            const newModal = document.createElement('div');
            newModal.id = 'detailModal';
            newModal.className = 'modal';
            newModal.innerHTML = '<div class="modal-content"><span class="close-btn" onclick="window.closeAnimeDetail()">&times;</span><div id="detailContent"></div></div>';
            document.body.appendChild(newModal);
            window.showAnimeDetail(id); // 重新呼叫
            return;
        }
    }

    // 確保彈窗容器正確顯示為 Flex 居中
    modal.classList.add('active');

    // 移除外層原有水藍色框線，改由內部 detail-container-v35 統一控制
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.border = 'none';
        modalContent.style.boxShadow = 'none';
        modalContent.style.background = 'transparent';
    }

    const genres = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
    const links = Array.isArray(item.links) ? item.links : [];
    const starColor = item.star_color || optionsData.category_colors?.recommendation || '#ffcc00';
    const btnColor = item.extra_data?.btn_bg || optionsData.category_colors?.btn_bg || '#00d4ff';
    const ratingColor = (optionsData.rating_colors && optionsData.rating_colors[item.rating]) ? optionsData.rating_colors[item.rating] : (optionsData.category_colors?.rating || 'var(--neon-purple)');
    const yearColor = optionsData.category_colors?.year || 'var(--neon-cyan)';
    const genreColor = optionsData.category_colors?.genre || 'var(--neon-cyan)';
    const episodesColor = optionsData.category_colors?.episodes || 'var(--neon-green)';
    const descColor = item.desc_color || 'var(--text-secondary)';

    const extraTags = [];
    if (item.extra_data) {
        Object.entries(item.extra_data).forEach(([key, val]) => {
            if (val) {
                const customColor = (optionsData.category_colors && optionsData.category_colors[key]) ? optionsData.category_colors[key] : '#ffffff';
                extraTags.push({ val: val, key: key, color: customColor });
            }
        });
    }

    content.innerHTML = `
        <div class="detail-modal-wrapper" style="--rating-color: ${ratingColor};">
            <!-- 左側滿版海報 -->
            <div class="detail-poster-column">
                <div class="holographic-poster-container" style="flex: 1; position: relative; overflow: hidden; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                    <img src="${item.poster_url || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22 viewBox=%220 0 300 450%22%3E%3Crect fill=%22%231a1a2e%22 width=%22300%22 height=%22450%22/%3E%3Ctext fill=%22%23666%22 font-family=%22sans-serif%22 font-size=%2218%22 x=%2250%25%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENO+IMAGE%3C/text%3E%3C/svg%3E'}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="poster-glow-overlay"></div>
                    
                    <!-- Elite-Cyber Badge (Moved to Poster Top-Left) -->
                    <div class="badge-elite-cyber" style="--rating-color: ${ratingColor}; --star-color: ${starColor}; position: absolute; top: 0; left: 0; z-index: 10; border-radius: 12px 0 12px 0;">
                        <div class="badge-elite-inner">
                            <div class="elite-rating text-glow-pulse" style="text-shadow: none;">${escape(item.rating || '普')}</div>
                            <div class="elite-stars">${escape(item.recommendation || '★')}</div>
                        </div>
                        <div class="elite-deco-dot dot-tl"></div>
                        <div class="elite-deco-dot dot-tr"></div>
                        <div class="elite-deco-dot dot-bl"></div>
                        <div class="elite-deco-dot dot-br"></div>
                    </div>
                </div>
            </div>
            
            <div class="detail-content-column">
                <!-- 標題與核心數據區塊 -->
                <div class="detail-section-v35" style="margin-bottom: 0; position: relative; background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%); border-radius: 12px 12px 0 0; padding: 20px 20px 10px 20px; border: 1px solid rgba(255,255,255,0.05); border-bottom: none; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    
                    <div class="detail-header-block">
                        <div style="position: relative; margin-bottom: 15px; text-align: center; padding-right: 40px; padding-left: 40px;">
                            <!-- 作品名稱 (單行滾動 + 置中) -->
                            <div style="overflow: hidden; position: relative;">
                                <h2 class="detail-title-v35 force-scroll" style="color: #fff; margin: 0 auto; font-size: 24px; line-height: 1.2; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.5); white-space: nowrap; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; display: inline-block; max-width: 100%;">
                                    ${escape(item.name)}
                                    <style>.detail-title-v35::-webkit-scrollbar { display: none; }</style>
                                </h2>
                            </div>
                            
                            <!-- 編輯按鈕 (絕對定位到右上角) -->
                            ${(typeof window.isAdminLoggedIn !== 'undefined' && window.isAdminLoggedIn) ? `<button onclick="window.closeAnimeDetail(); window.editAnime('${item.id}')" class="btn-primary" style="padding: 4px 10px; font-size: 11px; height: auto; position: absolute; right: -10px; top: 0;">📝 編輯</button>` : ''}
                        </div>

                        <!-- 核心數據 (置中) -->
                        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; overflow: hidden; position: relative; -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%); mask-image: linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%);">
                            <div class="scroll-row-v35 force-scroll" style="display: inline-flex; align-items: center; gap: 10px; overflow-x: auto; white-space: nowrap; scrollbar-width: none; -ms-overflow-style: none; padding-bottom: 5px;">
                                <!-- 年季月 粗體組合 -->
                                <div style="display: flex; align-items: center; background: ${yearColor}15; border: 1px solid ${yearColor}40; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: 800; color: ${yearColor};">
                                    ${item.year ? `<span>${escape(item.year)}</span>` : ''}
                                    ${item.season ? `<span style="margin: 0 4px; opacity: 0.5;">|</span><span>${escape(item.season)}</span>` : ''}
                                    ${item.month ? `<span style="margin: 0 4px; opacity: 0.5;">|</span><span>${escape(item.month)}${String(item.month).includes('月') ? '' : '月'}</span>` : ''}
                                </div>

                                <!-- 集數 -->
                                ${item.episodes ? `<div ${getTagStyle(episodesColor)} style="background: ${episodesColor}15; border: 1px solid ${episodesColor}40; padding: 4px 10px; border-radius: 4px; font-size: 13px;">全 ${escape(item.episodes)} 集</div>` : ''}

                                <!-- 作品類別標籤 -->
                                ${genres.map(g => {
        const cleanG = g.replace(/["'\[\]\(\),，。]/g, '').trim();
        return cleanG ? `<span ${getTagStyle(genreColor)}>${escape(cleanG)}</span>` : '';
    }).join('')}
                                
                                <!-- 自定義標籤 -->
                                ${extraTags.map(t => `<span ${getTagStyle(t.color)}>${escape(t.val)}</span>`).join('')}
                                <style>.scroll-row-v35::-webkit-scrollbar { display: none; }</style>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 劇情介紹區塊 (帶分隔線) -->
                ${item.description ? `
                    <div class="detail-section-v35" style="margin-bottom: 0; padding: 15px 20px; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.1);">
                        <div class="detail-header-block">
                            <h3 style="color: var(--neon-cyan); margin: 0 0 10px 0; font-size: 16px;">📖 劇情介紹</h3>
                            <p style="color: ${descColor}; line-height: 1.8; margin: 0; white-space: pre-wrap; font-size: 14px;">${escape(item.description)}</p>
                        </div>
                    </div>
                ` : ''}

                <!-- YouTube PV 影片區塊 (性能優化：延遲加載) -->
                ${item.youtube_url ? (() => {
            const videoId = getYouTubeEmbedUrl(item.youtube_url);
            if (!videoId) return '';
            const containerId = `yt-container-${item.id}`;
            return `
                    <div class="detail-section-v35" style="margin-bottom: 0; padding: 15px 20px; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.1);">
                        <div class="detail-header-block">
                            <h3 style="color: var(--neon-cyan); margin: 0 0 10px 0; font-size: 16px;">📺 宣傳影片</h3>
                            <div id="${containerId}" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; border: 2px solid var(--neon-cyan); background: #000; cursor: pointer;" onclick="window.loadYouTubeVideo('${containerId}', '${videoId}')">
                                <!-- Facade UI -->
                                <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.6;">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 48px; background: rgba(255,0,0,0.8); border-radius: 12px; display: flex; align-items: center; justify-content: center; transition: background 0.3s;" onmouseover="this.style.background='red'" onmouseout="this.style.background='rgba(255,0,0,0.8)'">
                                    <div style="width: 0; height: 0; border-style: solid; border-width: 10px 0 10px 20px; border-color: transparent transparent transparent #fff; margin-left: 4px;"></div>
                                </div>
                                <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); color: #fff; font-size: 12px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">點擊播放預告</div>
                            </div>
                        </div>
                    </div>
                `;
        })() : ''}

                <!-- 連結區塊 (帶分隔線 + 標題) -->
                <div class="detail-section-v35" style="margin-top: 0; padding: 15px 20px; border: 1px solid rgba(255,255,255,0.05); background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,212,255,0.05)); border-radius: 0 0 12px 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="margin-bottom: 15px;">
                        <h3 style="color: var(--neon-cyan); margin: 0 0 10px 0; font-size: 16px;">🌐 觀看網站</h3>
                        <div style="position: relative; -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 5%, #000 95%, transparent 100%); mask-image: linear-gradient(to right, transparent 0%, #000 5%, #000 95%, transparent 100%);">
                            <div class="scroll-row-v35 force-scroll" style="display: flex; gap: 10px; overflow-x: auto; white-space: nowrap; scrollbar-width: none; -ms-overflow-style: none; padding: 5px 0;">
                                ${links.length > 0 ? links.map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="padding: 6px 15px; font-size: 11px; white-space: nowrap; border-color: ${btnColor} !important; color: ${btnColor} !important; background: ${btnColor}22 !important; border-radius: 50px; min-height: 30px; height: auto; display: flex; align-items: center; font-weight: 600;">${escape(l.name)}</a>`).join('') : ''}
                                <a href="https://www.movieffm.net/xssearch?q=${encodeURIComponent(item.name)}" target="_blank" class="btn-primary" style="padding: 6px 15px; font-size: 11px; white-space: nowrap; border-color: #ff3e3e !important; color: #ff3e3e !important; background: rgba(255,62,62,0.1) !important; border-radius: 50px; min-height: 30px; height: auto; display: flex; align-items: center; font-weight: 600;">🎬 MovieFFM 搜尋</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
    if (typeof window.initGlobalScroll === 'function') {
        window.initGlobalScroll();
    }
};

window.closeAnimeDetail = () => {
    document.getElementById('detailModal').classList.remove('active');
    // 性能優化：關閉詳情時恢復背景動畫
    if (window.AtmosphereAPI) {
        const bgCanvas = document.getElementById('atmosphere-canvas');
        if (bgCanvas) bgCanvas.style.display = 'block';
        window.AtmosphereAPI.resume();
    }
};
