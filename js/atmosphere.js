/**
 * atmosphere.js - GIF 遊標系統 + 背景控制
 * ACG 收藏庫 v8.3.1
 * 
 * 特色：
 * - GIF 游標永遠在最上層
 * - AtmosphereAPI 控制背景動畫
 */

console.log('[CursorSystem] 初始化游標系統...');

// ==========================================
// SVG 游標數據 (回退)
// ==========================================
const SVG_CURSORS = {
    default: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M8 8 L24 24 L16 24 L16 8 Z" fill="%2300d4ff" stroke="%2300ff88" stroke-width="1"/></svg>`,
    pointer: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M8 4 L24 24 L18 24 L12 12 Z" fill="%2300d4ff" stroke="%2300ff88" stroke-width="1.5"/></svg>`,
};

// ==========================================
// 遊標管理器
// ==========================================
window.CursorManager = {
    config: {
        cursorSize: 32,
        followSpeed: 0.2,
        zIndex: 2147483647,
    },
    
    currentTheme: 'cursor',
    gifThemes: ['miku', 'elysia'],
    
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    
    cursorElement: null,
    cursorImage: null,
    
    init() {
        console.log('[CursorManager] 初始化...');
        this.createCursorElements();
        
        const savedTheme = localStorage.getItem('cursorTheme') || 'cursor';
        this.apply(savedTheme);
        
        this.bindEvents();
        this.startAnimation();
    },
    
    createCursorElements() {
        if (this.cursorElement) return;
        
        this.cursorElement = document.createElement('div');
        this.cursorElement.id = 'custom-cursor';
        this.cursorElement.innerHTML = `<img id="cursor-image" src="" alt="cursor">`;
        
        document.body.appendChild(this.cursorElement);
        this.cursorImage = document.getElementById('cursor-image');
        
        this.cursorElement.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 2147483647;
            left: 0;
            top: 0;
            width: 32px;
            height: 32px;
            transform: translate(-50%, -50%);
            will-change: left, top;
        `;
        
        this.cursorImage.style.cssText = `
            display: block;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;
    },
    
    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    },
    
    startAnimation() {
        const animate = () => {
            if (this.cursorElement) {
                this.cursorX += (this.mouseX - this.cursorX) * this.config.followSpeed;
                this.cursorY += (this.mouseY - this.cursorY) * this.config.followSpeed;
                this.cursorElement.style.left = this.cursorX + 'px';
                this.cursorElement.style.top = this.cursorY + 'px';
            }
            requestAnimationFrame(animate);
        };
        animate();
    },
    
    apply(themeId) {
        console.log(`[CursorManager] 應用主題: ${themeId}`);
        this.currentTheme = themeId;
        
        const isGifTheme = this.gifThemes.includes(themeId);
        const basePath = 'assets/cursors';
        
        if (isGifTheme) {
            this.cursorImage.src = `${basePath}/${themeId}/pointer.gif`;
        } else {
            this.cursorImage.src = SVG_CURSORS.pointer;
        }
        
        localStorage.setItem('cursorTheme', themeId);
        
        if (window.showToast && document.visibilityState === 'visible') {
            window.showToast(`✨ 游標主題已切換：${this.getThemeName(themeId)}`);
        }
    },
    
    getThemeName(themeId) {
        const names = {
            cursor: '🎯 Cursor 風格',
            anya: '🦊 阿尼亞',
            elysia: '🦋 愛莉希雅',
            frieren: '🧙‍♀️ 芙蕾蓮',
            miku: '🎤 初音未來',
            nikke: '🐰 NIKKE Doro',
        };
        return names[themeId] || themeId;
    },
};

// 兼容函數
window.changeCursorTheme = (theme) => window.CursorManager.apply(theme);
window.applyCursorTheme = (theme) => window.CursorManager.apply(theme);

// ==========================================
// AtmosphereAPI - 背景控制
// ==========================================
window.AtmosphereAPI = {
    isPaused: false,
    container: null,
    
    init() {
        this.container = document.getElementById('atmosphere-container');
    },
    
    pause() {
        this.init();
        this.isPaused = true;
        if (this.container) {
            this.container.style.opacity = '0';
        }
        const posterWall = document.getElementById('atmosphere-container');
        if (posterWall) posterWall.style.opacity = '0';
    },
    
    resume() {
        this.init();
        this.isPaused = false;
        if (this.container) {
            this.container.style.opacity = '0.6';
        }
        const posterWall = document.getElementById('atmosphere-container');
        if (posterWall) posterWall.style.opacity = '0.6';
    },
    
    toggle() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
};

// ==========================================
// 初始化執行
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            window.CursorManager.init();
            window.AtmosphereAPI.init();
        } catch (error) {
            console.error('[Init] 初始化失敗:', error);
        }
    }, 100);
});

console.log('✅ atmosphere.js 模組已載入 (v8.3.1)');
