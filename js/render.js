// TECH v8.0.0 - Rendering Logic Module
// Extracted from script.js and optimized with CSS classes

console.log('🎨 載入渲染模組 (v8.0 - UI Refined)...');

// 生成星星評分HTML
function generateStars(count) {
    // 支援直接傳入數字或包含 ★ 的字串
    let litStars = 0;
    if (typeof count === 'string' && count.includes('★')) {
        litStars = (count.match(/★/g) || []).length;
    } else {
        litStars = parseInt(count) || 0;
    }

    litStars = Math.min(5, Math.max(0, litStars));

    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < litStars) {
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

// v9.0 Layout & Sort Controls
window.gridColumns = localStorage.getItem('gridColumns') || 4;
window.sortOrder = localStorage.getItem('sortOrder') || 'desc';

window.changeGridLayout = function (cols) {
    window.gridColumns = cols;
    localStorage.setItem('gridColumns', cols);
    const container = document.getElementById('anime-container');
    if (container) {
        // Remove old column classes
        for (let i = 1; i <= 6; i++) container.classList.remove(`cols-${i}`);
        container.classList.remove('cols-mobile');

        if (cols === 'mobile') {
            container.classList.add('cols-mobile');
        } else {
            container.classList.add(`cols-${cols}`);
        }
    }
    window.renderApp();
    window.showToast(`佈局已切換：${cols === 'mobile' ? '行動列表' : cols + ' 欄'}`, 'info');
};

window.changeSortOrder = function (order) {
    window.sortOrder = order;
    localStorage.setItem('sortOrder', order);
    window.renderApp();
    window.showToast(`排序已切換：${order === 'desc' ? '最新優先' : '舊件優先'}`, 'info');
};

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

// 渲染六邊形徽章 - 6個角上順時針排列星星
function renderHexBadge(rating, recommendation, ratingColor, ratingGlow) {
    const escape = (str) => {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
    };

    // 提取推薦度中的星星數量（支持格式: ★, ★2, ★3, ★6）
    let starCount = 0;
    console.log('[HexBadge DEBUG] Input recommendation:', recommendation, 'Type:', typeof recommendation);

    if (typeof recommendation === 'string') {
        const trimmed = recommendation.trim();
        if (trimmed.startsWith('★')) {
            // 格式是 ★ 或 ★2, ★3 等
            const numPart = trimmed.substring(1).trim(); // 去掉 ★ 后的部分
            if (numPart === '') {
                // 只有 ★，没有数字，就是 1 颗星
                starCount = 1;
            } else {
                // 有数字部分，如 ★2, ★3, ★6
                const parsed = parseInt(numPart);
                starCount = isNaN(parsed) ? 1 : parsed;
            }
            console.log('[HexBadge DEBUG] Format ★ detected, numPart:', numPart, '=> starCount:', starCount);
        } else {
            // 尝试提取任何数字
            const match = trimmed.match(/\d+/);
            if (match) {
                starCount = parseInt(match[0]) || 0;
                console.log('[HexBadge DEBUG] Found number:', match[0], '=> starCount:', starCount);
            }
        }
    } else if (typeof recommendation === 'number' && !isNaN(recommendation)) {
        starCount = Math.round(recommendation);
        console.log('[HexBadge DEBUG] Number type, starCount:', starCount);
    }

    const originalStarCount = starCount;
    starCount = Math.min(6, Math.max(0, starCount)); // 限制在 0-6 之間
    console.log('[HexBadge] Final starCount:', starCount, '(from:', originalStarCount, ')');

    // 生成6個星星（順時針排列）- 只生成需要的星星
    let starsHtml = '';
    for (let i = 1; i <= 6; i++) {
        const isVisible = i <= starCount;
        if (isVisible) {
            starsHtml += `<span class="hex-star star-pos-${i}">★</span>`;
        }
    }
    console.log('[HexBadge DEBUG] Generated starsHtml length:', starsHtml.length, 'HTML:', starsHtml);

    // 添加 stars-X 類名來決定所有星星的顏色
    const starsClass = starCount > 0 ? `stars-${starCount}` : '';

    const result = `
        <div class="badge-cyber-hex ${starsClass}" style="--rating-color: ${ratingColor}; --rating-glow: ${ratingGlow};">
            <div class="hex-inner">
                <div class="badge-type">${escape(rating || '普')}</div>
            </div>
            <div class="hex-stars-container">
                ${starsHtml}
            </div>
        </div>
    `;
    console.log('[HexBadge DEBUG] Final HTML generated');
    return result;
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
// ========== 2. 核心渲染輔助 ==========
// Performance Optimization: Use WeakMap to store animation frame IDs for each element
const tiltFrameMap = new WeakMap();

window.handleCardTilt = (e, el) => {
    // Cancel any pending frame for this element to avoid stacking
    if (tiltFrameMap.has(el)) {
        cancelAnimationFrame(tiltFrameMap.get(el));
    }

    // Schedule the update
    const frameId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Intensity scaling for Small Data Cards (gentler than full poster)
        const rotateX = ((y - centerY) / centerY) * -8; // Reduced from -12
        const rotateY = ((x - centerX) / centerX) * 8;  // Reduced from 12

        el.style.setProperty('--tilt-x', `${rotateX}deg`);
        el.style.setProperty('--tilt-y', `${rotateY}deg`);

        // Add mouse position for shine/gloss effects (0% - 100%)
        el.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        el.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

        // For Gloss: Calculate X relative to card width for sliding effect
        // normalize -1 to 1 range for parallax
        el.style.setProperty('--gloss-x', `${((x - centerX) / centerX) * 100}%`);
    });

    tiltFrameMap.set(el, frameId);
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

    const { id, name, year, season, month, episodes } = item;
    const { ratingColor, nameColor, starColor, genreColor } = colors;
    const { genres, extraTags, starText } = data;

    // 構建元信息標籤（年/季/月/集）
    const metaTags = [];
    if (year) metaTags.push(`<span class="list-meta-tag">${escape(year)}</span>`);
    if (season) metaTags.push(`<span class="list-meta-tag">${escape(season)}</span>`);
    if (month) metaTags.push(`<span class="list-meta-tag">${escape(String(month).includes('月') ? String(month) : `${month}月`)}</span>`);
    if (episodes) metaTags.push(`<span class="list-meta-tag">全${escape(episodes)}集</span>`);

    // List view style complex, keeping some inline for flex layout structures unique to this view
    return `
        <div class="mobile-card-v2 desktop-list-layout"
            onclick="window.showAnimeDetail('${id}')"
            onmousemove="window.handleCardTilt(event, this)"
            onmouseleave="window.resetCardTilt(this)"
            style="--rating-color: ${ratingColor};">
            
            <!-- Poster Effects Layers -->
            <div class="card-rainbow-edge"></div>
            <div class="card-shine-effect"></div>
            <div class="card-gloss-layer"></div>
            
            ${renderAdminButton(id, 'small')}
            
            <div style="display: flex; align-items: center; gap: 12px; width: 100%; position: relative; z-index: 5;">
                ${renderRatingBadge(item.rating, ratingColor, item.recommendation, starColor)}
                
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
                    <div style="color: ${nameColor}; font-weight: 700; font-size: 15px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escape(name)}</div>
                    ${renderMetaTags(item, colors)}
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
        <div class="mobile-card-v2"
            onclick="window.showAnimeDetail('${id}')"
            onmousemove="window.handleCardTilt(event, this)"
            onmouseleave="window.resetCardTilt(this)"
            style="--rating-color: ${ratingColor};">
            
            <!-- Poster Effects Layers -->
            <div class="card-rainbow-edge"></div>
            <div class="card-shine-effect"></div>
            <div class="card-gloss-layer"></div>
            
            ${renderAdminButton(id, 'small')}
            
            <div style="display: flex; align-items: center; gap: 12px; width: 100%; position: relative; z-index: 5;">
                ${renderRatingBadge(item.rating, ratingColor, item.recommendation, starColor)}
                
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
                    <div style="color: ${nameColor}; font-weight: 700; font-size: 15px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escape(name)}</div>
                    ${renderMetaTags(item, colors)}
                </div>
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

    const oldModal = document.getElementById('detailModal');
    if (oldModal) oldModal.classList.remove('active');

    // 觸發進場動畫
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

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

    // 詳情頁面 - 素材庫設計，兩個區塊直接展示
    const videoId = item.youtube_url ? getYouTubeEmbedUrl(item.youtube_url) : null;
    const rating = item.rating || '普';
    const recommendation = item.recommendation || 0;

    // 評級顏色對應
    const ratingColors = {
        'S': { color: '#ff00ff', secondary: '#ff00ff', star: '#ffdd00', glow: 'rgba(255, 0, 255, 0.8)' },
        'SSR': { color: '#ff00ff', secondary: '#00ffff', star: '#ffdd00', glow: 'rgba(255, 0, 255, 0.8)' },
        'SR': { color: '#ff6600', secondary: '#ffaa00', star: '#ffaa00', glow: 'rgba(255, 102, 0, 0.8)' },
        'R': { color: '#00ff88', secondary: '#00ffaa', star: '#ffdd00', glow: 'rgba(0, 255, 136, 0.8)' },
        'A': { color: '#00aaff', secondary: '#00ddff', star: '#88ddff', glow: 'rgba(0, 170, 255, 0.8)' },
        'B': { color: '#888888', secondary: '#aaaaaa', star: '#cccccc', glow: 'rgba(136, 136, 136, 0.8)' },
        'C': { color: '#666666', secondary: '#888888', star: '#999999', glow: 'rgba(102, 102, 102, 0.8)' },
        '普': { color: '#00ff88', secondary: '#00ffaa', star: '#ffdd00', glow: 'rgba(0, 255, 136, 0.8)' }
    };

    let colors = ratingColors[rating] || ratingColors['普'];

    // Dynamic override from optionsData
    if (optionsData.rating_colors && optionsData.rating_colors[rating]) {
        const dynamicColor = optionsData.rating_colors[rating];
        colors = {
            ...colors,
            color: dynamicColor,
            glow: dynamicColor.startsWith('#') ? dynamicColor + 'cc' : dynamicColor
        };
    }
    const litStars = Math.min(6, Math.max(0, recommendation));
    const nameColor = item.name_color || optionsData.category_colors?.name || '#ffffff';
    // Removed duplicate const declaration
    // descColor was already declared above, reusing or reassigning if needed
    // Actually, looking at previous code, descColor was declared way above.
    // Let's just assign it to the new logic variable if we want to override, but 'const' throws error.
    // I will rename the variable here to detailDescColor to avoid conflict
    const detailDescColor = item.desc_color || optionsData.category_colors?.description || 'rgba(255,255,255,0.8)';
    const tagColor = optionsData.category_colors?.genre || 'var(--neon-cyan)';

    // 移除重複宣告，直接使用上方已定義的變數
    // ratingColor, genreColor, btnColor 均已在函數頂部定義


    overlay.innerHTML = `
        <!-- 關閉按鈕 -->
        <button class="detail-close-btn" onclick="window.closeAnimeDetail()">×</button>
        
        <!-- 編輯按鈕 -->
        ${(typeof window.isAdminLoggedIn !== 'undefined' && window.isAdminLoggedIn) ? `
            <button class="detail-edit-btn" onclick="window.editAnime('${item.id}')">📝</button>
        ` : ''}
        
        <!-- 主容器 - 置中顯示 -->
        <div class="detail-container">
            <!-- 左側海報區塊 (組合懸浮組) -->
            <div class="detail-poster-section">
                <div class="detail-poster-container">
                    <!-- 統一精品評級徽章 - 六邊形星星環繞，置於海報中心上方 -->
                    ${renderHexBadge(item.rating, item.recommendation, colors.color, colors.glow)}
                    <div class="detail-poster-card"
                        style="--rating-color: ${colors.color}; --rating-glow: ${colors.glow}; border-color: ${colors.color};">
                        <!-- 向外擴散的魔力效果 -->
                        <div class="magic-diffuse-layer"></div>
                        <!-- 光效層 -->
                        <div class="detail-poster-shine"></div>
                        <!-- 海報圖片 -->
                        <img src="${item.poster_url || ''}" class="detail-poster-img" onerror="this.src='./assets/no-poster.jpg'">
                    </div>
                </div>
            </div>
            
            <!-- 右側資訊區塊 -->
            <div class="detail-info-section">
                <div class="detail-info-block" style="border-color: ${colors.color}; --rating-color: ${colors.color}; --rating-glow: ${colors.glow};">
                    <!-- 標題區域 -->
                    <div class="detail-header-row">
                        <!-- 標題 -->
                        <div class="detail-title" style="color: ${nameColor}; text-shadow: 0 0 10px ${nameColor}60;">${escape(item.name)}</div>
                    </div>
                    
                    <!-- 標籤滾動列 -->
                    ${genres && genres.length > 0 ? `
                    <div class="scrollable-tag-list" onwheel="event.preventDefault(); this.scrollLeft += event.deltaY;">
                        ${genres.map(g => `<span class="detail-tag" style="color: ${genreColor}; border-color: ${genreColor}60;">${escape(g)}</span>`).join('')}
                    </div>
                    ` : ''}

                    <div class="card-separator" style="margin: 12px 0;"></div>

                    <!-- 年季月、全x集、評級、推薦度 -->
                    <div class="detail-meta-row">
                        <!-- 評級+推薦度 -->
                        <div class="meta-item">
                            <span class="meta-label">評級</span>
                            <span class="meta-value rating">${escape(item.rating || '普')}</span>
                            <span class="meta-value stars">${'★'.repeat(Math.min(6, Math.max(0, item.recommendation || 0)))}</span>
                        </div>
                        
                        <!-- 年 -->
                        ${item.year ? `<div class="meta-item"><span class="meta-label">年</span><span class="meta-value" style="color: ${yearColor};">${escape(item.year)}</span></div>` : ''}
                        
                        <!-- 季 -->
                        ${item.season ? `<div class="meta-item"><span class="meta-label">季</span><span class="meta-value" style="color: ${yearColor};">${escape(item.season)}</span></div>` : ''}
                        
                        <!-- 月 -->
                        ${item.month ? `<div class="meta-item"><span class="meta-label">月</span><span class="meta-value" style="color: ${yearColor};">${escape(String(item.month).includes('月') ? String(item.month) : `${item.month}月`)}</span></div>` : ''}
                        
                        <!-- 全x集 -->
                        ${item.episodes ? `<div class="meta-item"><span class="meta-label">集數</span><span class="meta-value" style="color: ${episodesColor};">全${escape(item.episodes)}集</span></div>` : ''}
                        
                        <!-- 推薦度 -->
                        <div class="meta-item">
                            <span class="meta-label">推薦度</span>
                            <span class="meta-value" style="color: ${starColor};">${item.recommendation || 0}</span>
                        </div>
                    </div>

                    <div class="card-separator" style="margin: 12px 0;"></div>

                    <!-- 描述 (捲動區域) -->
                    <div class="detail-desc" style="color: ${detailDescColor}; max-height: 150px; overflow-y: auto;">
                        ${escape(item.description || '暫無介紹')}
                    </div>
                    
                    <div class="card-separator" style="margin: 12px 0;"></div>

                    <!-- YouTube 與網站按鈕 -->
                    <div style="display: flex; flex-direction: column; gap: 10px; align-items: flex-start;">
                        ${videoId ? `
                        <div class="detail-youtube-btn" onclick="window.openYouTubeModal('${videoId}')" style="border-color: ${ratingColor};">
                            <span class="play-icon">▶</span>
                            <span class="play-text">觀看預告</span>
                        </div>
                        ` : ''}

                        <!-- 網站按鈕水平滾動 -->
                        ${links && links.length > 0 ? `
                        <div class="scrollable-link-list" onwheel="event.preventDefault(); this.scrollLeft += event.deltaY;">
                            ${links.map(l => `<a href="${l.url}" target="_blank" class="detail-link-btn" style="--btn-color: ${btnColor};">${escape(l.name)}</a>`).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- YouTube 播放視窗 -->
        <div id="youtube-modal" class="detail-youtube-modal" onclick="if(event.target === this) window.closeYouTubeModal()" style="--rating-color: ${ratingColor};">
            <div class="detail-youtube-player">
                <button class="detail-youtube-close" onclick="window.closeYouTubeModal()">×</button>
                <iframe id="youtube-frame" src="" allowfullscreen></iframe>
            </div>
        </div>
    `;

    // 禁止背景滾動
    document.body.style.overflow = 'hidden';

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

    // 恢復背景滾動
    document.body.style.overflow = '';

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
window.renderHexBadge = renderHexBadge;

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

    // 恢復背景滾動
    document.body.style.overflow = '';

    // 性能優化：關閉詳情時恢復背景動畫
    if (window.AtmosphereAPI) {
        const bgCanvas = document.getElementById('atmosphere-canvas');
        if (bgCanvas) bgCanvas.style.display = 'block';
        window.AtmosphereAPI.resume();
    }
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

console.log('✅ Render Module Fully Loaded');
