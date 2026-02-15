/**
 * matrix-rain.js
 * ACG 收藏庫 - 駭客任務數碼雨模組 (Visual Engine Module)
 * 
 * 實作介面:
 * - init(isLowSpec): 初始化
 * - start(): 開始動畫
 * - stop(): 暫停動畫
 * - resize(w, h): 重置大小
 */

class MatrixRain {
    constructor() {
        this.c = null;
        this.ctx = null;
        this.matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}".split("");
        this.fontSize = 12;
        this.columns = 0;
        this.drops = [];
        this.animationId = null;
        this.isLowSpec = false;

        // FPS Control
        this.fpsInterval = 50; // 20 FPS
        this.lastTime = 0;

        // Binding
        this.draw = this.draw.bind(this);
    }

    init(isLowSpec) {
        this.isLowSpec = isLowSpec;
        this.c = document.getElementById("c");

        if (!this.c) {
            console.warn('[MatrixRain] Canvas #c not found, module disabled.');
            return;
        }

        this.ctx = this.c.getContext("2d");
        if (!this.ctx) return;

        // Initial Setup
        this.resize(window.innerWidth, window.innerHeight);
        console.log(`[MatrixRain] Initialized. LowSpec Mode: ${this.isLowSpec}`);
    }

    resize(width, height) {
        if (!this.c) return;

        // Optimization: Use fixed viewport height instead of document height
        // This prevents the canvas from becoming massive on long pages (e.g. 5000px+)
        // which causes severe lag on each clear/draw frame.
        this.c.width = width;
        this.c.height = window.innerHeight;

        // Ensure CSS fixed positioning for background behavior
        this.c.style.position = 'fixed';
        this.c.style.top = '0';
        this.c.style.left = '0';
        this.c.style.zIndex = '1'; // Behind site content but visible

        this.columns = Math.ceil(this.c.width / this.fontSize);

        // Reset drops but try to preserve existing state if possible? 
        // For simplicity, just reset or fill new columns
        const newDrops = [];
        for (let x = 0; x < this.columns; x++) {
            newDrops[x] = Math.floor(Math.random() * this.c.height / this.fontSize); // Random start positions
        }
        this.drops = newDrops;
    }

    start() {
        if (!this.c || !this.ctx) return;
        if (this.animationId) return; // Already running

        this.lastTime = performance.now();
        this.draw(this.lastTime);
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    draw(timeStamp) {
        // Throttling
        const elapsed = timeStamp - this.lastTime;
        if (elapsed < this.fpsInterval) {
            this.animationId = requestAnimationFrame(this.draw);
            return;
        }
        this.lastTime = timeStamp - (elapsed % this.fpsInterval);

        // Draw Logic
        // 1. Transparent Trail Effect
        // Use destination-out to fade existing pixels to transparent.
        // Opacity 0.1 gives a nice trail effect while keeping the background see-through.
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // 10% fade per frame
        this.ctx.fillRect(0, 0, this.c.width, this.c.height);
        this.ctx.globalCompositeOperation = 'source-over';

        // 2. Text properites
        this.ctx.fillStyle = "#00ff88"; // Green
        this.ctx.font = this.fontSize + "px monospace";

        // 3. Draw drops
        for (let i = 0; i < this.drops.length; i++) {
            // Optimization: Skip drawing randomly on low-spec to save GPU
            const skipChance = this.isLowSpec ? 0.7 : 0.5;

            if (Math.random() > skipChance) {
                const text = this.matrix[Math.floor(Math.random() * this.matrix.length)];
                this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
            }

            // Reset drop if off screen
            if (this.drops[i] * this.fontSize > this.c.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }

        this.animationId = requestAnimationFrame(this.draw);
    }
}

// 註冊到 VisualEngine
if (window.VisualEngine) {
    window.VisualEngine.register('MatrixRain', new MatrixRain());
} else {
    // Fallback if Engine not ready (should not happen with correct ordering)
    window.addEventListener('load', () => {
        if (window.VisualEngine) window.VisualEngine.register('MatrixRain', new MatrixRain());
    });
}