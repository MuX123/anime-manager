// TECH v6.2.0 - Rendering Logic Module
// Extracted from script.js and optimized with CSS classes

console.log('🎨 載入渲染模組 (v6.2 - UI Refined)...');

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
                extraTags.push({ val: strKey, color: categoryColors[strKey] || '#ffffff' });
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
    if (typeof isAdminLoggedIn === 'undefined' || !isAdminLoggedIn) return '';
    // Grid 視圖按鈕樣式 (位於右上角，圓形按鈕)
    if (size === 'grid-hover') {
        return `<button onclick="event.stopPropagation(); window.editAnime('${id}')" class="admin-edit-btn">📝</button>`;
    }

    // 列表視圖按鈕樣式 (維持原樣，暫時保留部分 inline style 因為是特殊佈局)
    const sizeStyles = size === 'small'
        ? 'padding: 2px 6px; font-size: 10px; top: 5px; right: 5px;'
        : 'padding: 4px 8px; font-size: 12px; top: 8px; right: 8px;';
    return `<button onclick="event.stopPropagation(); window.editAnime('${id}')" style="position: absolute; ${sizeStyles} background: rgba(0,212,255,0.2); border: 1px solid var(--neon-cyan); color: var(--neon-cyan); border-radius: 4px; cursor: pointer; z-index: 10;">${size === 'small' ? '📝' : '📝 編輯'}</button>`;
}

function renderRatingBadge(rating, color) {
    // Helper to escape html
    const escape = (str) => {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
    };
    return `<span class="rating-badge" style="--rating-color: ${color};">${escape(rating || '普')}</span>`;
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
    if (month) tags.push(escape(`${month}月`));
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
    if (item.month) dateItems.push(item.month + '月');

    if (dateItems.length > 0) {
        const itemsHTML = dateItems.map(d => `<span class="date-group-item">${escape(d)}</span>`).join('');
        dateGroupHTML = `<div class="date-group-tag" style="--year-color: ${yearColor};">${itemsHTML}</div>`;
    }

    return `
        <div class="anime-card game-card-effect" onclick="window.showAnimeDetail('${id}')" style="--rating-color: ${ratingColor};">
            ${renderAdminButton(id, 'grid-hover')}
            
            <div class="rating-badge-container">
                <div class="rating-badge" style="--rating-color: ${ratingColor};">
                    ${escape(item.rating || '普')}
                </div>
                
                <div class="star-badge" style="--star-color: ${starColor};">
                    <span style="color: ${starColor}; font-size: ${gridSize === 14 ? '13px' : '12px'}; font-weight: 800; font-family: 'Orbitron', sans-serif; white-space: nowrap;">${escape(recommendation || '')}</span>
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
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; width: 100px; flex-shrink: 0; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 15px;">
                ${renderStarDisplay(starText, starColor, 15)}
                ${renderRatingBadge(item.rating, ratingColor)}
            </div>
            <div style="flex: 1; min-width: 0; display: flex; align-items: center; padding-left: 20px; gap: 20px; height: 100%;">
                <div style="flex: 0 0 40%; min-width: 0; display: flex; flex-direction: column; gap: 8px;">
                    <h3 style="color: ${nameColor}; font-size: 15px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold;">${escape(name)}</h3>
                    ${renderMetaTags(item, colors)}
                </div>
                <div style="flex: 0 0 15%; min-width: 0; display: flex; flex-direction: column; gap: 4px; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 20px; justify-content: center;">
                    <span style="color: ${genreColor}; font-size: 14px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escape(type || '')}</span>
                </div>
                <div class="desktop-scroll-tags" onwheel="this.scrollLeft += event.deltaY; event.preventDefault();" style="flex: 1; display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; padding: 10px 0; scrollbar-width: thin; cursor: grab; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 20px; align-items: center;">
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
                ${renderStarDisplay(starText, starColor, 12)}
                <h3 style="color: ${nameColor}; font-size: 15px; margin: 0; white-space: nowrap; overflow-x: auto; font-weight: bold; scrollbar-width: none; flex: 1;">${escape(name)}</h3>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; width: 100%; overflow: hidden; position: relative; z-index: 1;">
                ${renderRatingBadge(item.rating, ratingColor)}
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
    const escape = (str) => {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
    };

    const item = animeData.find(a => a.id === id);
    if (!item) return;
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');

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
                <div style="flex: 1; position: relative; overflow: hidden; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                    <img src="${item.poster_url || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22 viewBox=%220 0 300 450%22%3E%3Crect fill=%22%231a1a2e%22 width=%22300%22 height=%22450%22/%3E%3Ctext fill=%22%23666%22 font-family=%22sans-serif%22 font-size=%2218%22 x=%2250%25%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENO+IMAGE%3C/text%3E%3C/svg%3E'}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; inset: 0; pointer-events: none; z-index: 2; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%);"></div>
                </div>
            </div>
            
            <div class="detail-content-column">
                <!-- 標題與核心數據區塊 -->
                <!-- 🌟 浮誇標題與評分 Hero Section 🌟 -->
                <div class="detail-section-v35" style="margin-bottom: 20px; position: relative; background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    
                    <!-- 評分與星星 (視覺焦點) -->
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                             <!-- 評級: 巨大字體 + 霓虹光暈 -->
                            <div style="position: relative;">
                                <div style="position: absolute; inset: -10px; background: ${ratingColor}; opacity: 0.2; filter: blur(20px); border-radius: 50%;"></div>
                                <div style="font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 48px; line-height: 1; font-style: italic; color: #fff; text-shadow: 0 0 10px ${ratingColor}, 0 0 30px ${ratingColor}, 0 0 60px ${ratingColor}; position: relative; z-index: 2;">
                                    ${escape(item.rating || '普')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- 星星: 獨立區塊 + 閃爍效果 -->
                        <div style="text-align: right;">
                             <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; letter-spacing: 1px; text-transform: uppercase;">RECOMMENDATION</div>
                             <div style="position: relative;">
                                 <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120%; height: 100%; background: radial-gradient(ellipse at center, ${starColor}30 0%, transparent 70%); pointer-events: none;"></div>
                                 <span style="color: ${starColor}; font-size: 28px; font-weight: bold; letter-spacing: 2px; text-shadow: 0 0 10px ${starColor}, 0 0 20px ${starColor}; position: relative; z-index: 2; font-family: 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;">
                                     ${escape(item.recommendation || '★')}
                                 </span>
                             </div>
                        </div>
                    </div>

                    <div class="detail-header-block">
                        <div style="display: flex; align-items: start; justify-content: space-between; gap: 10px;">
                            <h2 class="detail-title-v35 force-scroll" style="color: #fff; margin: 0; font-size: 28px; line-height: 1.3; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${escape(item.name)}</h2>
                            ${(typeof isAdminLoggedIn !== 'undefined' && isAdminLoggedIn) ? `<button onclick="window.closeAnimeDetail(); window.editAnime('${item.id}')" class="btn-primary" style="padding: 6px 12px; font-size: 12px; height: auto;">📝 編輯</button>` : ''}
                        </div>
                        <div class="scroll-row-v35 force-scroll" style="display: flex; gap: 8px; margin-top: 15px; overflow-x: auto; white-space: nowrap; scrollbar-width: none; -ms-overflow-style: none;">
                            ${item.year ? `<div class="core-data-item" ${getTagStyle(yearColor)} style="background: ${yearColor}15; border: 1px solid ${yearColor}40; padding: 4px 10px; border-radius: 4px; font-size: 13px;">${escape(item.year)}</div>` : ''}
                            ${item.season ? `<div class="core-data-item" ${getTagStyle(yearColor)} style="background: ${yearColor}15; border: 1px solid ${yearColor}40; padding: 4px 10px; border-radius: 4px; font-size: 13px;">${escape(item.season)}</div>` : ''}
                            ${item.month ? `<div class="core-data-item" ${getTagStyle(yearColor)} style="background: ${yearColor}15; border: 1px solid ${yearColor}40; padding: 4px 10px; border-radius: 4px; font-size: 13px;">${escape(item.month)}月</div>` : ''}
                            ${item.episodes ? `<div class="core-data-item" ${getTagStyle(episodesColor)} style="background: ${episodesColor}15; border: 1px solid ${episodesColor}40; padding: 4px 10px; border-radius: 4px; font-size: 13px;">全 ${escape(item.episodes)} 集</div>` : ''}
                        </div>
                    </div>
                </div>

                <!-- 標籤整合區塊 -->
                <div class="detail-section-v35" style="margin-bottom: 8px; position: relative;">
                    <div class="detail-header-block">
                        <div class="scroll-row-v35 force-scroll" style="display: flex; gap: 10px; overflow-x: auto; white-space: nowrap; scrollbar-width: none; -ms-overflow-style: none;">
                            ${genres.map(g => {
        const cleanG = g.replace(/["'\[\]\(\),，。]/g, '').trim();
        return cleanG ? `<span ${getTagStyle(genreColor)}>${escape(cleanG)}</span>` : '';
    }).join('')}
                            ${extraTags.map(t => {
        return `<span ${getTagStyle(t.color)}>${escape(t.val)}</span>`;
    }).join('')}
                        </div>
                    </div>
                </div>

                <!-- 劇情介紹區塊 -->
                <div class="detail-section-v35" style="margin-bottom: 8px; position: relative; flex: 1; min-height: 0;">
                    <div class="detail-header-block" style="height: 100%; display: flex; flex-direction: column; padding-top: 15px; padding-bottom: 15px;">
                        <div class="force-scroll" style="overflow-y: auto; max-height: 140px; padding-right: 10px;">
                            <p style="color: ${item.desc_color || 'var(--text-secondary)'}; line-height: 1.8; font-size: 15px; white-space: pre-wrap; margin: 0;">${escape(item.description || '暫無簡介')}</p>
                        </div>
                    </div>
                </div>

                <!-- 連結區塊 -->
                <div class="detail-section-v35" style="margin-top: 10px; position: relative;">
                    <div style="padding: 10px 20px; box-sizing: border-box;">
                        <div class="scroll-row-v35 force-scroll" style="display: flex; gap: 10px; overflow-x: auto; white-space: nowrap; scrollbar-width: none; -ms-overflow-style: none;">
                            ${links.length > 0 ? links.map(l => `<a href="${l.url}" target="_blank" class="btn-primary" style="padding: 6px 12px; font-size: 11px; white-space: nowrap; border-color: ${btnColor} !important; color: ${btnColor} !important; background: ${btnColor}22 !important; border-radius: 50px; height: 28px;">${escape(l.name)}</a>`).join('') : '<span style="color: var(--text-secondary); font-style: italic; font-size: 11px;">暫無連結</span>'}
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

window.closeAnimeDetail = () => { document.getElementById('detailModal').classList.remove('active'); };
