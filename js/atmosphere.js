/**
 * atmosphere.js - 處理全域動態背景（粒子連線網絡）與遊標管理
 * ACG 收藏庫 v8.0.0
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

        // 偵測裝置效能
        const isMobile = window.innerWidth < 768;
        const properties = {
            particleCount: isMobile ? 30 : 80,
            particleColor: 'rgba(0, 212, 255, 0.8)',
            lineColor: 'rgba(0, 212, 255, 0.15)',
            particleRadius: isMobile ? 1.0 : 1.5,
            particleSpeed: isMobile ? 0.2 : 0.3,
            linkDistance: isMobile ? 80 : 120,
            maxLinks: isMobile ? 2 : 4 // 限制每個粒子的最大連線數，減少 $O(N^2)$ 負擔
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
            let particleDensity = 15000;
            const isMobile = window.innerWidth < 768;

            // 移動端大幅精簡粒子數量以節省效能
            if (isMobile) {
                particleDensity = 40000; // 降低密度
                properties.maxLinks = 2; // 移動端限制連線數
                console.log('[Atmosphere] 偵測到移動端，啟用極低功耗模式');
            }

            let count = (width * height) / particleDensity;
            if (count > 120) count = 120; // 上限
            if (count < (isMobile ? 15 : 40)) count = isMobile ? 15 : 40;   // 下限

            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        let isRunning = true;
        let animationId = null;

        function animate() {
            if (!isRunning) return;

            ctx.clearRect(0, 0, width, height);

            // 更新與繪製粒子
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }

            // 批量繪製連線以減少繪圖指令開銷
            ctx.beginPath();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = `rgba(0, 212, 255, 0.15)`; // 統一低透明度，提升極致渲染效能
            for (let i = 0; i < particles.length; i++) {
                let currentLinks = 0;
                for (let j = i + 1; j < particles.length; j++) {
                    if (currentLinks >= properties.maxLinks) break;

                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = dx * dx + dy * dy; // 使用距離平方避免 Math.sqrt

                    if (distance < properties.linkDistance * properties.linkDistance) {
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        currentLinks++;
                    }
                }
            }
            ctx.stroke();
            ctx.closePath();

            animationId = requestAnimationFrame(animate);
        }

        // 導出 API
        window.AtmosphereAPI = {
            pause: () => {
                console.log('[Atmosphere] 渲染暫停...');
                isRunning = false;
                if (animationId) cancelAnimationFrame(animationId);
            },
            resume: () => {
                if (isRunning) return;
                if (document.body.classList.contains('lite-mode')) return; // Lite mode 保持關閉
                console.log('[Atmosphere] 渲染恢復...');
                isRunning = true;
                animate();
            },
            setQuality: (quality) => {
                switch (quality) {
                    case 'low':
                        properties.particleCount = isMobile ? 15 : 25;
                        properties.maxLinks = 1;
                        properties.linkDistance = 60;
                        break;
                    case 'medium':
                        properties.particleCount = isMobile ? 30 : 60;
                        properties.maxLinks = 2;
                        properties.linkDistance = 100;
                        break;
                    case 'high':
                        properties.particleCount = isMobile ? 50 : 100;
                        properties.maxLinks = 4;
                        properties.linkDistance = 130;
                        break;
                }
                initParticles();
            }
        };

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
