/**
 * poster-wall.js
 * 海報牆系統 - 隨機散佈海報作為背景
 */

class PosterWall {
    constructor() {
        this.container = null;
    }

    init(isLowSpec) {
        // 低功耗模式跳過
        if (isLowSpec) return;
        
        // 獲取容器
        this.container = document.getElementById('poster-wall-container');
        
        // 如果沒有容器，創建一個
        if (!this.container) {
            // 創建黑色遮罩層
            const overlay = document.createElement('div');
            overlay.id = 'poster-wall-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                z-index: 0;
                pointer-events: none;
            `;
            document.body.appendChild(overlay);
            
            // 創建海報容器
            this.container = document.createElement('div');
            this.container.id = 'poster-wall-container';
            this.container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: -1;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }

        // 渲染海報
        this.render();
    }

    render() {
        if (!this.container) return;

        // 獲取數據
        const data = window.animeData || window.mangaData || window.movieData;
        if (!data?.length) return;

        // 清空容器
        this.container.innerHTML = '';

        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // 海報尺寸
        const posterW = 334;
        const posterH = 511;
        
        // 數量
        const count = 20;

        // 從右到左、從上到下排列
        const cols = 5; // 每行數量
        const gapX = 280;
        const gapY = 380;
        const startX = w - gapX;
        const startY = 50;

        for (let i = 0; i < count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            // 從右到左計算 x 座標
            const x = startX - col * gapX + (Math.random() - 0.5) * 30;
            const y = startY + row * gapY + (Math.random() - 0.5) * 30;
            
            // 旋轉 -30 到 +30 度
            const rot = (Math.random() - 0.5) * 60;
            const scale = 0.7 + Math.random() * 0.3;
            
            const item = data[Math.floor(Math.random() * data.length)];
            const poster = document.createElement('div');
            
            const url = item.poster_url || item.image_url || item.cover_image;
            
            poster.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${posterW}px;
                height: ${posterH}px;
                transform: rotate(${rot}deg) scale(${scale});
                background: ${url ? `url('${url}') center/cover` : `hsl(${Math.random() * 360}, 40%, 20%)`};
                border-radius: 3px;
                box-shadow: 2px 2px 8px rgba(0,0,0,0.5);
            `;

            this.container.appendChild(poster);
        }
    }

    start() {}
    stop() {}
    resize() { this.render(); }
}

// 註冊模組
window.PosterWall = PosterWall;

if (window.VisualEngine) {
    window.VisualEngine.register('PosterWall', new PosterWall());
}
