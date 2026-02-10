/**
 * atmosphere.js - 處理全域動態背景（粒子連線網絡）與遊標管理
 * ACG 收藏庫 v6.1.0
 */

// ==========================================
// 遊標管理器 (Cursor Manager)
// ==========================================
window.CursorManager = {
    themes: {
        bocchi: { name: '🎸 孤獨搖滾', type: 'image' },
        furina: { name: '🌊 芙寧娜', type: 'image' },
        genshin: { name: '✨ 原神通用', type: 'image' },
        witch: { name: '🧙‍♀️ 魔女之旅', type: 'image' },
        standard: { name: '⚪ 標準樣式', type: 'image' }
    },

    init() {
        const savedTheme = localStorage.getItem('cursorTheme') || 'bocchi';
        this.apply(savedTheme);
    },

    apply(themeId) {
        if (!this.themes[themeId]) themeId = 'bocchi';

        const root = document.body;

        // 使用 URL 建構子確保路徑正確
        // 假設 assets 在根目錄 (index.html 所在位置)
        // 這樣可以處理 /anime-manager/ 等子路徑部署情況
        // 注意：若為 file:// 協議，pathname 可能包含磁碟代號，需要小心處理
        // 使用相對於 CSS 檔案的路徑 (因為變數是在 css/animations.css 中使用的)
        // 這樣瀏覽器在解析 url() 時才會正確指向根目錄的 assets
        let basePath = '../assets/cursors';

        console.log(`[CursorManager] 套用主題: ${themeId}, BasePath: ${basePath}`);
        localStorage.setItem('cursorTheme', themeId);

        // 設定 CSS 變數
        // 使用絕對路徑無效 (file://)，必須依賴瀏覽器的相對路徑解析
        // 移除 ./ 嘗試讓瀏覽器自行決定
        root.style.setProperty('--cur-pointer', `url('${basePath}/${themeId}-pointer.cur'), auto`);
        root.style.setProperty('--cur-finger', `url('${basePath}/${themeId}-finger.cur'), pointer`);
        root.style.setProperty('--cur-pen', `url('${basePath}/${themeId}-pen.cur'), text`);
        root.style.setProperty('--cur-nah', `url('${basePath}/${themeId}-nah.cur'), not-allowed`);

        // 發送 Toast 通知 (如果在互動中)
        if (window.showToast && document.visibilityState === 'visible') {
            window.showToast(`✨ 遊標主題已切換：${this.themes[themeId].name}`);
        }
    },

    getThemeList() {
        return Object.entries(this.themes).map(([id, data]) => ({
            id,
            name: data.name
        }));
    }
};

// 兼容舊版函數呼叫
window.changeCursorTheme = (theme) => window.CursorManager.apply(theme);
window.applyCursorTheme = (theme) => window.CursorManager.apply(theme);


// ==========================================
// 動態背景 (Digital Constellation / Particle Network)
// ==========================================
window.initAtmosphere = () => {
    try {
        console.log('[Atmosphere] 初始化星空連線背景...');

        let container = document.getElementById('atmosphere-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'atmosphere-container';
            container.style.opacity = '0'; // 初始透明
            container.style.transition = 'opacity 1.5s ease'; // 平滑淡入
            document.body.prepend(container);
        }

        // 啟動淡入
        setTimeout(() => {
            if (container) container.style.opacity = '1';
        }, 100);

        // 清空並建立 Canvas
        container.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.id = 'constellation-canvas';
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        // 設定參數
        const properties = {
            particleCount: 80,
            particleColor: 'rgba(0, 212, 255, 0.8)',
            lineColor: 'rgba(0, 212, 255, 0.15)',
            particleRadius: 1.5,
            particleSpeed: 0.3,
            linkDistance: 120
        };

        // 調整大小
        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };

        // 粒子類別
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * properties.particleSpeed;
                this.vy = (Math.random() - 0.5) * properties.particleSpeed;
                this.size = Math.random() * properties.particleRadius + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // 邊界反彈
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = properties.particleColor;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            let count = (width * height) / 15000; // 根據螢幕面積動態調整數量
            if (count > 120) count = 120; // 上限
            if (count < 40) count = 40;   // 下限

            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // 更新與繪製粒子
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // 繪製連線
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < properties.linkDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 212, 255, ${1 - distance / properties.linkDistance})`; // 距離越近越不透明
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        // 啟動
        window.addEventListener('resize', resize);
        resize();
        animate();

        // 確保內容層級 (僅針對基礎排版元素，不含固定重疊元素)
        const contentElements = document.querySelectorAll(
            '.site-header, .analytics-bar, #app'
        );
        contentElements.forEach(el => {
            if (el && !el.style.position) {
                el.style.position = 'relative';
                el.style.zIndex = '10';
            }
        });

    } catch (e) {
        console.error('[Atmosphere] 初始化失敗:', e);
    }
};

// ==========================================
// 初始化執行
// ==========================================
if (document.readyState === 'complete') {
    window.initAtmosphere();
    window.CursorManager.init();
} else {
    window.addEventListener('load', () => {
        window.initAtmosphere();
        window.CursorManager.init();
    });
}
