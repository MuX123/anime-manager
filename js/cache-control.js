/**
 * 緩存控制工具
 * 確保用戶總是載入最新版本
 */
class CacheControl {
    constructor() {
        this.currentVersion = '20260211_v1';
        this.versionKey = 'anime_manager_version';
        this.init();
    }

    init() {
        // 檢查版本是否更新
        this.checkVersion();
        
        // 添加強制刷新機制
        this.addForceRefresh();
        
        // 監聽頁面可見性變化
        this.handleVisibilityChange();
    }

    checkVersion() {
        const storedVersion = localStorage.getItem(this.versionKey);
        
        if (storedVersion !== this.currentVersion) {
            console.log(`[CacheControl] 版本更新: ${storedVersion} → ${this.currentVersion}`);
            
            // 清除舊緩存
            this.clearOldCache();
            
            // 更新版本記錄
            localStorage.setItem(this.versionKey, this.currentVersion);
            
            // 顯示更新提示
            this.showUpdateNotification();
        }
    }

    clearOldCache() {
        // 清除可能的舊緩存
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.includes('anime-manager') || cacheName.includes('static')) {
                        caches.delete(cacheName);
                        console.log(`[CacheControl] 清除緩存: ${cacheName}`);
                    }
                });
            });
        }
    }

    addForceRefresh() {
        // 添加 Ctrl+F5 強制刷新檢測
        let refreshCount = 0;
        const startTime = Date.now();
        
        document.addEventListener('keydown', (e) => {
            // Ctrl+F5 或 Cmd+R
            if ((e.ctrlKey && e.key === 'F5') || (e.metaKey && e.key === 'r')) {
                refreshCount++;
                
                // 快速連續按 3 次強制刷新
                if (refreshCount >= 3 && Date.now() - startTime < 2000) {
                    this.forceRefresh();
                }
            }
        });
    }

    forceRefresh() {
        console.log('[CacheControl] 強制刷新緩存');
        
        // 清除所有緩存
        this.clearOldCache();
        
        // 重新載入頁面，添加時間戳防止緩存
        const timestamp = Date.now();
        const url = window.location.pathname + '?t=' + timestamp;
        
        window.location.href = url;
    }

    handleVisibilityChange() {
        // 頁面重新變為可見時檢查版本
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => {
                    this.checkVersion();
                }, 1000);
            }
        });
    }

    showUpdateNotification() {
        // 創建更新提示
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(0,212,255,0.9), rgba(176,38,255,0.9));
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 18px;">🔄</span>
                <div>
                    <div style="font-weight: bold;">內容已更新</div>
                    <div style="font-size: 12px; opacity: 0.8;">版本: ${this.currentVersion}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 3秒後自動移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// 添加動畫樣式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化緩存控制
window.addEventListener('DOMContentLoaded', () => {
    window.cacheControl = new CacheControl();
});

// 導出給其他模組使用
window.CacheControl = CacheControl;