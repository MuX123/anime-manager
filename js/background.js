/**
 * background.js
 * 完全獨立的背景系統 - 數碼雨 + 海報牆
 * 不依賴現有 HTML 元素，完全自行創建 DOM
 * 優化版本：resize 防抖 + 減少海報數量
 */

(function() {
    'use strict';

    // 避免重複初始化
    if (window.BackgroundSystem && window.BackgroundSystem.initialized) {
        console.log('[Background] Already initialized');
        return;
    }

    // Resize 防抖函數
    function debounce(fn, delay) {
        let timer = null;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    class BackgroundSystem {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.container = null;
            this.overlay = null;
            this.animationId = null;
            this.matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}".split("");
            this.fontSize = 12;
            this.columns = 0;
            this.drops = [];
            this.lastTime = 0;
            this.fpsInterval = 50;
            this.initialized = false;
            this.isLowSpec = this.detectLowSpec();
            
            // 綁定防抖 resize
            this.debouncedResize = debounce(() => this.handleResize(), 200);
        }

        // 檢測低功耗設備
        detectLowSpec() {
            const cores = navigator.hardwareConcurrency || 4;
            const memory = navigator.deviceMemory || 8;
            return cores < 4 || memory < 4;
        }

        init() {
            if (this.initialized) return;
            
            console.log('[Background] Initializing... (LowSpec:', this.isLowSpec, ')');
            
            // 1. 創建數碼雨 Canvas
            this.createMatrixCanvas();
            
            // 2. 創建海報牆容器
            this.createPosterContainer();
            
            // 3. 暴露 API
            this.exposeAPI();
            
            // 4. 開始動畫
            this.startMatrixRain();
            
            // 5. 渲染海報
            this.renderPosters();
            
        // 6. 監聽 resize (防抖)
        window.addEventListener('resize', this.debouncedResize);
        
        // 7. 監聽頁面可見性變化 - 性能優化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        this.initialized = true;
            console.log('[Background] Initialized successfully');
        }

        createMatrixCanvas() {
            // 創建獨立的 canvas 元素
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'bg-matrix-canvas';
            
            // 樣式：絕對底層
            Object.assign(this.canvas.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                zIndex: '-9999',
                pointerEvents: 'none',
                display: 'block'
            });
            
            document.body.appendChild(this.canvas);
            
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
        }

        createPosterContainer() {
            // 創建海報容器 - 在數碼雨之上，但在所有內容之下
            this.container = document.createElement('div');
            this.container.id = 'bg-poster-container';
            
            Object.assign(this.container.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                zIndex: '-9998',
                pointerEvents: 'none',
                overflow: 'hidden'
            });
            
            document.body.appendChild(this.container);
        }

        resizeCanvas() {
            if (!this.canvas) return;
            
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            this.columns = Math.ceil(this.canvas.width / this.fontSize);
            
            // 重置 drops
            this.drops = [];
            for (let x = 0; x < this.columns; x++) {
                this.drops[x] = Math.floor(Math.random() * this.canvas.height / this.fontSize);
            }
        }

        handleResize() {
            this.resizeCanvas();
            this.renderPosters();
        }

        // ===== 數碼雨 =====

        startMatrixRain() {
            if (!this.ctx) return;
            
            this.lastTime = performance.now();
            this.drawMatrix();
        }

        drawMatrix() {
            if (!this.ctx || !this.canvas) return;
            
            // 頁面隱藏時完全停止渲染
            if (document.hidden) {
                this.animationId = requestAnimationFrame(() => this.drawMatrix());
                return;
            }
            
            const now = performance.now();
            const elapsed = now - this.lastTime;
            
            // 低功耗模式降低幀率
            const interval = this.isLowSpec ? 100 : this.fpsInterval;
            
            if (elapsed < interval) {
                this.animationId = requestAnimationFrame(() => this.drawMatrix());
                return;
            }
            
            this.lastTime = now - (elapsed % interval);

            // 透明拖尾效果
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'source-over';

            // 繪製字符 - 低功耗模式減少數量
            this.ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
            this.ctx.font = this.fontSize + 'px monospace';

            const step = this.isLowSpec ? 2 : 1;
            
            for (let i = 0; i < this.drops.length; i += step) {
                if (Math.random() > (this.isLowSpec ? 0.3 : 0.5)) {
                    const text = this.matrix[Math.floor(Math.random() * this.matrix.length)];
                    this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
                }

                if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                    this.drops[i] = 0;
                }
                this.drops[i]++;
            }

            this.animationId = requestAnimationFrame(() => this.drawMatrix());
        }

        // ===== 海報牆 =====

        renderPosters() {
            if (!this.container) return;

            const data = window.animeData || window.mangaData || window.movieData;
            
            if (!data || data.length === 0) {
                // 數據未就緒，稍後重試
                setTimeout(() => this.renderPosters(), 500);
                return;
            }

            console.log('[Background] Rendering posters:', data.length);

            this.container.innerHTML = '';

            const w = window.innerWidth;
            // 根據螢幕寬度和設備調整海報數量
            const maxCount = this.isLowSpec ? 8 : 15;
            const count = Math.min(maxCount, Math.floor(w / 200));

            const fragment = document.createDocumentFragment();

            for (let i = 0; i < count; i++) {
                const item = data[Math.floor(Math.random() * data.length)];
                const url = item.poster_url || item.image_url || item.cover_image;
                
                if (!url) continue;

                const poster = document.createElement('div');
                poster.className = 'bg-poster-item';
                
                const x = Math.random() * w;
                const y = Math.random() * window.innerHeight;
                const rot = (Math.random() - 0.5) * 30;
                const scale = 0.4 + Math.random() * 0.4;

                poster.style.cssText = `
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    width: 280px;
                    height: 400px;
                    transform: translate(-50%, -50%) rotate(${rot}deg) scale(${scale});
                    background: url('${url}') center/cover no-repeat;
                    border-radius: 4px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                    opacity: 0.35;
                    filter: grayscale(70%) contrast(110%) brightness(0.8);
                    pointer-events: none;
                `;

                fragment.appendChild(poster);
            }

            this.container.appendChild(fragment);
        }

        // ===== API =====

        exposeAPI() {
            window.BackgroundSystem = {
                initialized: true,
                pause: () => {
                    if (this.animationId) {
                        cancelAnimationFrame(this.animationId);
                        this.animationId = null;
                    }
                },
                resume: () => {
                    if (!this.animationId) {
                        this.startMatrixRain();
                    }
                },
                refresh: () => {
                    this.renderPosters();
                }
            };
        }
    }

    // 啟動
    const bg = new BackgroundSystem();
    
    // 等待 DOM 和 數據載入後再初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => bg.init(), 300);
        });
    } else {
        setTimeout(() => bg.init(), 300);
    }

    // ===== Module Registration =====
    if (window.Modules) {
        window.Modules.loaded.set('background', {
            loaded: true,
            exports: { 
                BackgroundSystem: window.BackgroundSystem,
                initBackground: () => bg.init()
            },
            timestamp: Date.now()
        });
        console.log('[Module] Registered: background');
    }

})();
