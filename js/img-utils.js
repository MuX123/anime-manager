/**
 * img-utils.js
 * ACG 收藏庫 - 圖片優化工具
 * 負責：
 * 1. 自動轉換為 Cloudinary 優化網址 (如果可用)
 * 2. 處理圖片載入失敗的 Fallback
 * 3. 支援不同尺寸的縮圖生成
 */

window.ImgUtils = {
    // Cloudinary 配置 (如果有的話)
    // 範例: 'https://res.cloudinary.com/your-cloud-name/image/upload/'
    CLOUDINARY_BASE: '', // 留空則使用原始網址

    /**
     * 獲取優化後的圖片網址
     * @param {string} url 原始圖片網址
     * @param {object} options 選項 { width, height, quality, format }
     * @returns {string} 優化後的網址
     */
    getOptimizedUrl(url, options = {}) {
        if (!url) return './assets/fallback.jpg'; // 預設圖

        // 1. 如果是本地圖片或 Blob，直接返回
        if (url.startsWith('./') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }

        // 2. 如果設定了 Cloudinary Base URL 且網址不是已經優化過的
        if (this.CLOUDINARY_BASE && !url.includes('cloudinary.com')) {
            // 這裡假設這是一個可以被 Cloudinary Fetch 的公開網址
            // Cloudinary Fetch URL 格式: https://res.cloudinary.com/demo/image/fetch/w_300,h_400,c_fill,q_auto,f_auto/https://site.com/image.jpg

            const params = [];
            if (options.width) params.push(`w_${options.width}`);
            if (options.height) params.push(`h_${options.height}`);

            // 預設優化參數
            params.push('c_fill'); // 裁切模式
            params.push('g_auto'); // 自動重心
            params.push('q_auto'); // 自動品質
            params.push('f_auto'); // 自動格式 (WebP/AVIF)

            const transformation = params.join(',');

            // 組合 Fetch URL
            // 注意：這裡使用 fetch 類型，因為我們不一定有上傳圖片
            // 格式: BASE_URL + /fetch/ + transformation + / + original_url
            return `${this.CLOUDINARY_BASE.replace('/upload/', '/fetch/')}${transformation}/${url}`;
        }

        // 3. 針對特定圖床的優化 (例如 MyAnimeList / Anilist)
        // 這部分可以根據你的需求客製化
        if (url.includes('myanimelist.net')) {
            // MAL 圖片通常有特定後綴，例如 l.jpg (large), .jpg (normal)
            // 這裡可以嘗試強制換成大圖或小圖
            if (options.variant === 'large') {
                return url.replace(/(\.[a-z]+)$/i, 'l$1');
            }
        }

        return url;
    },

    /**
     * 生成 `srcset` 屬性值，用於響應式圖片
     * @param {string} url 原始網址
     * @returns {string} srcset 字串
     */
    generateSrcSet(url) {
        if (!this.CLOUDINARY_BASE || !url.startsWith('http')) return '';

        const sizes = [300, 600, 900, 1200];
        return sizes.map(w => {
            const optUrl = this.getOptimizedUrl(url, { width: w });
            return `${optUrl} ${w}w`;
        }).join(', ');
    },

    /**
     * 處理圖片載入錯誤
     * @param {HTMLImageElement} imgElement 
     */
    handleError(imgElement) {
        if (!imgElement) return;
        // 避免無限迴圈
        if (imgElement.dataset.hasError) return;

        imgElement.dataset.hasError = 'true';
        imgElement.src = './assets/fallback.jpg'; // 請確保此檔案存在

        // 或者使用一個生成的 Placeholder
        // imgElement.src = 'https://placehold.co/300x450/1a1a2e/FFF?text=No+Image';
    }
};

// 為了讓 HTML onclick 能呼叫
window.handleImgError = (el) => window.ImgUtils.handleError(el);

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('img-utils', {
        loaded: true,
        exports: { 
            ImgUtils: window.ImgUtils,
            handleImgError: window.handleImgError
        },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: img-utils');
}
