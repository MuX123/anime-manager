// TECH v8.0.0 - Rendering Logic Module
// Extracted from script.js and optimized with CSS classes

console.log('🎨 載入渲染模組 (v8.0 - UI Refined)...');

// 生成星星評分HTML
function generateStars(count) {
    const starCount = Math.min(5, Math.max(1, parseInt(count) || 3));
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < starCount) {
            stars += `<span class="star star-glow" style="animation-delay: ${i * 0.1}s;">★</span>`;
        } else {
            stars += `<span class="star" style="color: #666;">★</span>`;
        }
    }
    return stars;
}

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
// YouTube 影片加載器 (性能優化：點擊才加載 + 預熱 + 轉場)
window.loadYouTubeVideo = (containerId, videoId) => {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('[YouTube] Container not found:', containerId);
        return;
    }

    // 驗證 videoId 格式
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        console.error('[YouTube] Invalid video ID:', videoId);
        container.innerHTML = `
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#000;color:#ff6b6b;">
                <div style="text-align:center;">
                    <div style="font-size:48px;margin-bottom:10px;">⚠️</div>
                    <div>無法載入影片</div>
                </div>
            </div>
        `;
        return;
    }

    // 清空容器，先顯示 loading
    container.innerHTML = '';

    // 創建 loading 元素
    const loadingEl = document.createElement('div');
    loadingEl.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#000;z-index:10;';
    loadingEl.innerHTML = `<div class="whirl-ring" style="width:40px;height:40px;border-width:3px;border-color:var(--neon-cyan) transparent var(--neon-cyan) transparent;"></div>`;

    // 創建 iframe with proper class for overflow prevention
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    iframe.className = 'video-iframe-v9';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.title = 'YouTube video player';

    // 設置 timeout 防止永遠 loading（10秒）
    const timeout = setTimeout(() => {
        console.warn('[YouTube] Load timeout, showing error');
        loadingEl.innerHTML = `
            <div style="text-align:center;color:#ff6b6b;">
                <div style="font-size:32px;margin-bottom:8px;">⚠️</div>
                <div style="font-size:12px;">載入超時</div>
                <div style="font-size:10px;opacity:0.7;margin-top:4px;">請檢查網路連線</div>
            </div>
        `;
    }, 10000);

    // iframe 載入成功
    iframe.onload = () => {
        clearTimeout(timeout);
        iframe.classList.add('loaded');
        // 載入完成後移除 loading
        loadingEl.remove();
    };

    // iframe 載入失敗
    iframe.onerror = () => {
        clearTimeout(timeout);
        console.error('[YouTube] Failed to load video:', videoId);
        loadingEl.innerHTML = `
            <div style="text-align:center;color:#ff6b6b;">
                <div style="font-size:32px;margin-bottom:8px;">⚠️</div>
                <div style="font-size:12px;">影片載入失敗</div>
                <div style="font-size:10px;opacity:0.7;margin-top:4px;">請稍後再試</div>
            </div>
        `;
    };

    container.appendChild(iframe);
};

// 圖片檢查與回退機制 (主要用於 YouTube 縮圖)
window.checkImage = (url, callback) => {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = url;
};

// 智慧型海報畫質處理
// 針對 MyAnimeList (MAL) 圖片進行畫質提升
window.getOptimizedPosterUrl = (url, forceHighQuality = false) => {
    if (!url) return null;
    
    // 如果是 MAL 圖片
    if (url.includes('cdn.myanimelist.net/images/anime')) {
        // 檢查是否為高畫質 (l.jpg)
        const isLarge = url.endsWith('l.jpg') || url.endsWith('l.webp');
        
        if (forceHighQuality) {
            // 如果強制高畫質，且目前不是，嘗試替換
            if (!isLarge) {
                // 嘗試將 .jpg, t.jpg, m.jpg 等替換為 l.jpg
                return url.replace(/(\.[a-z]+)$/, 'l$1').replace(/[tm]\./, 'l.');
            }
        }
    }
    return url;
};

// YouTube 縮圖獲取 (帶回退)
window.getYouTubeThumbnail = (videoId, callback) => {
    const maxRes = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const hq = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    window.checkImage(maxRes, (exists) => {
        callback(exists ? maxRes : hq);
    });
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

// ========== 2. 核心渲染輔助 ==========
window.handleCardTilt = (e, el) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    el.style.setProperty('--tilt-x', `${rotateX}deg`);
    el.style.setProperty('--tilt-y', `${rotateY}deg`);
};

window.resetCardTilt = (el) => {
    el.style.setProperty('--tilt-x', `0deg`);
    el.style.setProperty('--tilt-y', `0deg`);
};

function renderTags(genres, extraTags, color) {
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

    const { id, name, episodes, recommendation } = item;
    const { ratingColor, episodesColor, nameColor, yearColor, cyanBase, starColor } = colors;
    // gridColumns might be global
    const gridSize = (typeof gridColumns !== 'undefined' && gridColumns == 5) ? 14 : ((typeof gridColumns !== 'undefined' && gridColumns == 4) ? 15 : 16);
    
    // 判斷是否需要高畫質 (3欄佈局強制高畫質)
    const useHighQuality = (typeof gridColumns !== 'undefined' && gridColumns <= 3);
    const posterUrl = window.getOptimizedPosterUrl(item.poster_url, useHighQuality);

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
        <div class="anime-card game-card-effect entry-animation"
            onclick="window.showAnimeDetail('${id}')"
            onmousemove="window.handleCardTilt(event, this)"
            onmouseleave="window.resetCardTilt(this)"
            style="--rating-color: ${ratingColor};">

            <!-- 新海報卡片特效層 -->
            <div class="card-pattern-bg"></div>
            <div class="card-inner-glow"></div>
            <div class="card-particles">
                <div class="card-particle"></div>
                <div class="card-particle"></div>
                <div class="card-particle"></div>
                <div class="card-particle"></div>
                <div class="card-particle"></div>
            </div>
            <div class="card-rainbow-border"></div>
            <div class="card-gloss-layer"></div>
            <div class="card-deco-circle"></div>

            <!-- 原有特效層 -->
            <div class="card-mouse-glow"></div>
            <div class="card-neon-edge"></div>
            ${renderAdminButton(id, 'grid-hover')}

            <!-- Cyber-Mini Badge (Card View) -->
            <div style="position: absolute; top: 12px; left: 12px; z-index: 10; pointer-events: none; transform: scale(${(typeof gridColumns !== 'undefined' && gridColumns <= 4) ? 1.3 : 1}); transform-origin: top left;">
                <div class="badge-cyber-mini" style="--rating-color: ${ratingColor}; --star-color: ${starColor}; vertical-align: middle;">
                    <div class="badge-rating">${escape(item.rating || '普')}</div>
                    <div class="badge-stars">${escape(recommendation || '★')}</div>
                </div>
            </div>

            <div class="grid-poster-container">
                <img src="${posterUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22%3E%3Crect fill=%22%231a1a2e%22 width=%22300%22 height=%22450%22/%3E%3Ctext fill=%22%23666%22 font-family=%22sans-serif%22 font-size=%2218%22 x=%2250%25%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENO+IMAGE%3C/text%3E%3C/svg%3E'}"
                    class="grid-poster-img"
                >
                <div class="grid-poster-overlay"></div>
                <div class="poster-shine"></div>

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
        <div class="anime-card desktop-list-layout game-card-effect entry-animation"
            onclick="window.showAnimeDetail('${id}')"
            onmousemove="window.handleCardTilt(event, this)"
            onmouseleave="window.resetCardTilt(this)"
            style="--rating-color: ${ratingColor}; --card-poster-url: url('${item.poster_url || ''}');">

            <!-- 新海報卡片特效層 -->
            <div class="card-pattern-bg"></div>
            <div class="card-inner-glow"></div>
            <div class="card-particles">
                <div class="card-particle"></div>
                <div class="card-particle"></div>
                <div class="card-particle"></div>
                <div class="card-particle"></div>
                <div class="card-particle"></div>
            </div>
            <div class="card-rainbow-border"></div>
            <div class="card-gloss-layer"></div>

            <!-- 原有特效層 -->
            <div class="card-mouse-glow"></div>
            ${renderAdminButton(id)}
            <div style="display: flex; align-items: center; justify-content: center; width: 120px; flex-shrink: 0; border-right: 1px solid rgba(255,255,255,0.1); padding: 0 15px;">
                ${renderRatingBadge(item.rating, ratingColor, item.recommendation, starColor)}
            </div>
            <div style="flex: 1; min-width: 0; display: flex; align-items: center; padding-left: 20px; gap: 20px; height: 100%;">
                <div style="flex: 0 0 40%; min-width: 0; display: flex; flex-direction: column; gap: 4px;">
                    <h3 style="color: ${nameColor}; font-size: 16px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${escape(name)}</h3>
                    ${renderMetaTags(item, colors)}
                </div>
                <div style="flex: 0 0 15%; min-width: 0; display: flex; flex-direction: column; gap: 4px; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 20px; justify-content: center;">
                    <span style="color: ${genreColor}; font-size: 13px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.9;">${escape(type || 'ANIME')}</span>
                </div>
                <div class="desktop-scroll-tags" onwheel="this.scrollLeft += event.deltaY; event.preventDefault();" style="flex: 1; display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; padding: 10px 0; scrollbar-width: none; cursor: grab; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 20px; align-items: center;">
                    <style>.desktop-scroll-tags::-webkit-scrollbar { display: none; }</style>
                    ${renderTags(genres, extraTags, genreColor)}
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
            <!-- 新海報卡片特效層 -->
            <div class="card-pattern-bg"></div>
            <div class="card-inner-glow"></div>
            <div class="card-particles">
                <div class="card-particle"></div>
                <div class="card-particle"></div>
                <div class="card-particle"></div>
            </div>
            <div class="card-rainbow-border"></div>
            <div class="card-gloss-layer"></div>

            <div style="position: absolute; inset: 0; background: linear-gradient(135deg, ${ratingColor}15 0%, transparent 60%); z-index: 0;"></div>
            ${renderAdminButton(id, 'small')}
            <div style="display: flex; align-items: center; gap: 10px; width: 100%; overflow: hidden; position: relative; z-index: 21;">
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

    // ========== ISOLATED OVERLAY STRATEGY ==========
    // 使用獨立的 #anime-detail-overlay 避免與舊有 modal 樣式衝突
    let overlay = document.getElementById('anime-detail-overlay');

    if (!overlay) {
        console.warn('[Render] 建立獨立詳情頁容器 #anime-detail-overlay');
        overlay = document.createElement('div');
        overlay.id = 'anime-detail-overlay';
        overlay.onclick = (e) => {
            // 點擊背景關閉
            if (e.target === overlay) window.closeAnimeDetail();
        };
        document.body.appendChild(overlay);
    }

    // 確保舊 modal 關閉 (以防萬一)
    const oldModal = document.getElementById('detailModal');
    if (oldModal) oldModal.classList.remove('active');

    overlay.classList.add('active');

    const genres = Array.isArray(item.genre) ? item.genre : (typeof item.genre === 'string' ? item.genre.split(/[|,]/).map(g => g.trim()) : []);
    const links = Array.isArray(item.links) ? item.links : [];
    const starColor = item.star_color || optionsData.category_colors?.recommendation || '#ffcc00';
    const btnColor = item.extra_data?.btn_bg || optionsData.category_colors?.btn_bg || '#00d4ff';
    // Removed duplicate ratingColor declaration
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

    // 詳情頁面 - 素材庫設計，兩個區塊直接展示
    const videoId = item.youtube_url ? getYouTubeEmbedUrl(item.youtube_url) : null;
    const rating = item.rating || '普';
    const recommendation = item.recommendation || 0;
    
    // 優先使用後台設定的 rating_colors，如果沒有則使用預設
    // 這確保了徽章顏色與管理後台一致
    const ratingColor = (optionsData.rating_colors && optionsData.rating_colors[rating]) 
        ? optionsData.rating_colors[rating] 
        : (optionsData.category_colors?.rating || '#00ff88');

    // 構建 colors 對象供模板使用
    const colors = {
        color: ratingColor,
        // 其他顏色保留默認或根據 ratingColor 衍生
        secondary: ratingColor, 
        glow: ratingColor, // 使用 rgba 轉換會更好，但這裡先用主色
        star: '#ffdd00'
    };
    
    // Restore missing variables
    const nameColor = item.name_color || optionsData.category_colors?.name || '#ffffff';
    const detailDescColor = item.desc_color || optionsData.category_colors?.description || 'rgba(255,255,255,0.8)';
    const tagColor = optionsData.category_colors?.genre || 'var(--neon-cyan)';

    // 生成星星 HTML - 順時針亮起 (推薦數決定亮起數量)
    // 獲取數字類型的推薦數，處理可能的字串格式
    let recCount = 0;
    const recStr = String(recommendation); // 確保轉為字串處理
    
    if (recStr.includes('★') || recStr.includes('⭐')) {
        // 如果包含星星符號，計算符號數量
        recCount = (recStr.match(/[★⭐]/g) || []).length;
    } else {
        // 嘗試提取字串中的第一個數字 (例如 "4", "Rank 5", "6/10")
        const match = recStr.match(/\d+/);
        if (match) {
            recCount = parseInt(match[0], 10);
        } else {
            // 如果完全沒有數字，也沒有星星，保持 0 (除非本身是數字類型)
            recCount = typeof recommendation === 'number' ? recommendation : 0;
        }
    }
    
    const litStars = Math.min(6, Math.max(0, recCount));
    
    let starsHTML = '';
    for (let i = 1; i <= 6; i++) {
        const isLit = i <= litStars;
        starsHTML += `<div class="star star-${i} ${isLit ? 'lit' : ''}">✦</div>`;
    }
    
    overlay.innerHTML = `
        <!-- 關閉按鈕 -->
        <button class="detail-close-btn" onclick="window.closeAnimeDetail()">×</button>
        
        <!-- 編輯按鈕 -->
        ${(typeof window.isAdminLoggedIn !== 'undefined' && window.isAdminLoggedIn) ? `
            <button class="detail-edit-btn" onclick="window.editAnime('${item.id}')">📝</button>
        ` : ''}
        
        <!-- 主容器 - 置中顯示 -->
        <div class="detail-container">
            <!-- 左側海報區塊 -->
            <div class="detail-poster-section">
                <div class="detail-card-1">
                    <div class="detail-card-inner" style="--rating-color: ${colors.color}; --rating-glow: ${colors.glow}; --rating-secondary: ${colors.secondary};">
                        <!-- 魔力擴散層 (取代舊的光暈) -->
                        <div class="magic-diffuse-layer"></div>
                        
                        <!-- 六邊形徽章 -->
                        <div class="detail-rating-badge">
                            <div class="badge-outer">
                                <div class="badge-core hexagon"></div>
                                <!-- 星星容器移到 badge-inner 外面，避免被 clip-path 裁切 -->
                                <div class="stars-container">
                                    ${starsHTML}
                                </div>
                                <div class="badge-inner">
                                    <div class="rank-text-wrapper">
                                        <span class="rank-text">${rating}</span>
                                    </div>
                                </div>
                                <div class="glow-effect"></div>
                            </div>
                        </div>
                        <!-- 海報圖片 -->
                        <img src="${window.getOptimizedPosterUrl(item.poster_url, true) || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22450%22%3E%3Crect fill=%22%231a1a2e%22 width=%22320%22 height=%22450%22/%3E%3C/svg%3E'}" 
                             class="detail-poster-img">
                    </div>
                </div>
            </div>
            
            <!-- 右側資訊區塊 -->
            <div class="detail-info-section">
                <!-- 只有邊框使用 ratingColor，其餘使用自定義顏色 -->
                <div class="detail-info-1" style="border-color: ${colors.color}; box-shadow: 0 0 20px ${colors.glow}; --rating-color: ${colors.color};">
                    <!-- 標題 -->
                    <div class="detail-title" style="color: ${nameColor}; text-shadow: 0 0 10px ${nameColor}80;">${escape(item.name)}</div>
                    
                    <!-- 描述 -->
                    <div class="detail-desc" style="color: ${detailDescColor};">${escape(item.description || '暫無介紹')}</div>
                    
                    <!-- 標籤 -->
                    ${genres && genres.length > 0 ? `
                    <div class="detail-tags">
                        ${genres.map(g => `<span class="detail-tag" style="color: ${tagColor}; border-color: ${tagColor};">${escape(g)}</span>`).join('')}
                    </div>
                    ` : ''}
                    
                    <!-- YouTube -->
                    ${videoId ? `
                    <div class="detail-youtube" onclick="window.openYouTubeModal('${videoId}')" style="border-color: ${colors.color};">
                        <div class="detail-youtube-preview">
                            <div class="detail-youtube-play-icon" style="background: ${colors.color}; box-shadow: 0 0 20px ${colors.glow};">▶</div>
                        </div>
                        <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" style="width:100%;height:100%;object-fit:cover;opacity:0.6;">
                    </div>
                    ` : ''}
                    
                    <!-- 網站按鈕 -->
                    ${links && links.length > 0 ? `
                    <div class="detail-links">
                        ${links.map(l => `<a href="${l.url}" target="_blank" class="detail-link-btn" style="color: ${tagColor}; border-color: ${tagColor}80;">${escape(l.name)}</a>`).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <!-- YouTube 播放視窗 -->
        <div id="youtube-modal" class="detail-youtube-modal" onclick="if(event.target === this) window.closeYouTubeModal()" style="--rating-color: ${colors.color}; --rating-glow: ${colors.glow};">
            <div class="detail-youtube-player">
                <button class="detail-youtube-close" onclick="window.closeYouTubeModal()">×</button>
                <iframe id="youtube-frame" src="" allowfullscreen></iframe>
            </div>
        </div>
    `;

    if (typeof window.initGlobalScroll === 'function') {
        window.initGlobalScroll();
    }
};

window.closeAnimeDetail = () => {
    // 關閉新 Overlay
    const overlay = document.getElementById('anime-detail-overlay');
    if (overlay) overlay.classList.remove('active');

    // 關閉舊 Modal (相容性)
    const oldModal = document.getElementById('detailModal');
    if (oldModal) oldModal.classList.remove('active');

    // 性能優化：關閉詳情時恢復背景動畫
    if (window.AtmosphereAPI) {
        const bgCanvas = document.getElementById('atmosphere-canvas');
        if (bgCanvas) bgCanvas.style.display = 'block';
        window.AtmosphereAPI.resume();
    }
};

// 切換作品介紹顯示/隱藏
window.toggleDescription = (itemId) => {
    const descArea = document.getElementById(`desc-area-${itemId}`);
    const descBtn = document.getElementById(`desc-toggle-btn-${itemId}`);
    
    if (!descArea) return;
    
    const isCollapsed = descArea.classList.contains('desc-collapsed');
    
    if (isCollapsed) {
        // 展開
        descArea.classList.remove('desc-collapsed');
        descArea.classList.add('desc-expanded');
        if (descBtn) descBtn.classList.add('desc-active');
    } else {
        // 收起
        descArea.classList.remove('desc-expanded');
        descArea.classList.add('desc-collapsed');
        if (descBtn) descBtn.classList.remove('desc-active');
    }
};

// 強制導出以避免 Race Condition
// window.renderCard 已在第 424 行定義，這裡不需要重新賦值
window.renderGridCard = renderGridCard;
window.renderListCard = renderListCard;
window.getCardColors = getCardColors;
window.processCardData = processCardData;
window.toggleDescription = toggleDescription;

// 確保 renderCard 存在於 window 對象上
if (typeof window.renderCard !== 'function') {
    console.error('[Render] renderCard 未正確定義!');
}

// 關閉詳情頁面函數
window.closeAnimeDetail = () => {
    // 關閉新 Overlay
    const overlay = document.getElementById('anime-detail-overlay');
    if (overlay) overlay.classList.remove('active');

    // 關閉 YouTube 視窗
    window.closeYouTubeModal();

    // 關閉舊 Modal (相容性)
    const oldModal = document.getElementById('detailModal');
    if (oldModal) oldModal.classList.remove('active');
};

// 打開 YouTube 播放視窗
window.openYouTubeModal = (videoId) => {
    const modal = document.getElementById('youtube-modal');
    const frame = document.getElementById('youtube-frame');
    if (modal && frame) {
        frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        modal.classList.add('active');
    }
};

// 關閉 YouTube 播放視窗
window.closeYouTubeModal = () => {
    const modal = document.getElementById('youtube-modal');
    const frame = document.getElementById('youtube-frame');
    if (modal) modal.classList.remove('active');
    if (frame) frame.src = '';
};

// 詳情頁海報滑鼠移動處理
window.handleDetailPosterMouseMove = (e) => {
    const inner = e.currentTarget.querySelector('.detail-card-inner');
    if (!inner) return;

    const rect = inner.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const mouseXPercent = (x / rect.width) * 100;
    const mouseYPercent = (y / rect.height) * 100;

    // 更新光暈位置
    const glow = inner.querySelector('.detail-poster-glow');
    if (glow) {
        glow.style.setProperty('--mouseX', `${mouseXPercent}%`);
        glow.style.setProperty('--mouseY', `${mouseYPercent}%`);
    }

    // 更新光澤滑動方向
    const shine = inner.querySelector('.detail-poster-shine');
    if (shine) {
        const shineX = mouseXPercent < 50 ? '100%' : '-100%';
        shine.style.setProperty('--shineX', shineX);
    }
};

// 詳情頁海報滑鼠離開處理
window.handleDetailPosterMouseLeave = () => {
    const inners = document.querySelectorAll('.detail-card-inner');
    inners.forEach(inner => {
        const glow = inner.querySelector('.detail-poster-glow');
        const shine = inner.querySelector('.detail-poster-shine');
        if (glow) glow.style.opacity = '0';
        if (shine) shine.style.transform = 'translateX(-100%)';
    });
};

console.log('✅ Render Module Fully Loaded');
