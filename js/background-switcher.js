/**
 * 背景效果管理器 (Simplified for Cyberpunk Theme)
 * Enforces Poster Wall + Matrix Rain combination.
 */
class BackgroundSwitcher {
    constructor() {
        this.init();
    }

    init() {
        // 強制啟動雙重背景
        this.startDualLayerBackground();
    }

    startDualLayerBackground() {
        console.log('[Background] 啟動雙重背景模式 (Poster + Matrix)');

        // 1. 啟動矩陣雨 (Matrix Rain)
        if (!window.matrixRain) {
            if (typeof window.initMatrixRain === 'function') {
                window.initMatrixRain({
                    theme: 'classic',
                    opacity: 0.3, // 調整透明度以免遮擋海報太嚴重
                    speed: 4
                });
            }
        } else {
            window.matrixRain.start();
        }
        
        // 確保 Matrix 容器顯示
        const matrixCanvas = document.getElementById('c');
        if (matrixCanvas) {
            matrixCanvas.style.display = 'block';
            matrixCanvas.style.zIndex = '-5'; // 最底層
            matrixCanvas.style.opacity = '0.4'; // 稍微降低不透明度
        }

        // 2. 啟動海報牆 (Atmosphere)
        if (window.AtmosphereAPI) {
            window.AtmosphereAPI.resume();
            
            // 調整海報牆容器樣式，使其疊加在 Matrix 上但保持半透明
            const atmosphereContainer = document.getElementById('atmosphere-container');
            if (atmosphereContainer) {
                atmosphereContainer.style.display = 'flex'; // 恢復 flex 佈局
                atmosphereContainer.style.zIndex = '-4'; // 位於 Matrix 之上
                // 讓海報牆背景透明，只保留海報本體遮擋，讓矩陣雨在空隙中顯示
                atmosphereContainer.style.background = 'rgba(5, 6, 9, 0.3)'; 
                atmosphereContainer.style.mixBlendMode = 'normal';
            }
        } else {
            // 如果還沒初始化，嘗試呼叫初始化
            if (typeof window.initAtmosphere === 'function') {
                window.initAtmosphere();
            }
        }
    }
}

// 初始化背景管理器
document.addEventListener('DOMContentLoaded', () => {
    window.backgroundManager = new BackgroundSwitcher();
});

// 導出給其他模組使用
window.BackgroundSwitcher = BackgroundSwitcher;