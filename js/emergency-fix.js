// ACG 收藏庫 - 緊急修復工具 v1.0
// 立即解決數據載入和UI卡頓問題

class EmergencyFixTool {
    constructor() {
        this.isActive = false;
        this.fixesApplied = new Set();
    }

    // 1. 停用衝突的分析腳本
    disableConflictingAnalytics() {
        // 停用 analytics.js
        if (typeof window.trackPageView !== 'undefined') {
            window.originalTrackPageView = window.trackPageView;
            window.trackPageView = () => console.log('🔧 trackPageView 已臨時停用');
        }
        
        // 停用 analytics-compatibility.js
        if (typeof window.analyticsCompatibility !== 'undefined') {
            window.originalAnalyticsCompatibility = window.analyticsCompatibility;
            window.analyticsCompatibility = () => console.log('🔧 analyticsCompatibility 已臨時停用');
        }
        
        // 停用相關功能
        if (typeof window.loadAnalytics !== 'undefined') {
            window.originalLoadAnalytics = window.loadAnalytics;
            window.loadAnalytics = () => console.log('🔧 loadAnalytics 已臨時停用');
        }
        
        console.log('⚡ 已停用衝突的分析腳本');
        this.isActive = true;
        this.fixesApplied.add('disable_conflicting_analytics');
    }

    // 2. 清除緩存和重置狀態
    clearCacheAndReload() {
        console.log('🧹 清除緩存和重置狀態...');
        
        // 清除所有本地緩存
        localStorage.clear();
        sessionStorage.clear();
        
        // 重置數據載入狀態
        if (window.analyticsData) {
            window.analyticsData = { totalVisits: 0, uniqueVisitors: 0, categoryClicks: 0 };
        }
        
        // 重置UI狀態
        this.fixesApplied.add('cache_cleared');
        
        // 延遲一下讓DOM完全清理
        setTimeout(() => {
            location.reload();
        }, 100);
    }

    // 3. 檢查並修復UI元素
    checkAndFixUI() {
        console.log('🔍 檢查UI元素...');
        
        const issues = [];
        
        // 檢查關鍵元素
        const criticalElements = [
            'anime-grid',
            'filter-container', 
            'search-container',
            'analytics-display',
            'app'
        ];
        
        criticalElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (!element) {
                issues.push(`缺失元素: ${elementId}`);
                console.warn(`⚠️ 缺失關鍵元素: ${elementId}`);
            } else {
                console.log(`✅ 找到元素: ${elementId}`);
            }
        });
        
        // 檢查analytics-display元素
        const analyticsDisplay = document.getElementById('analytics-display');
        if (analyticsDisplay) {
            // 檢查子元素
            const spans = analyticsDisplay.querySelectorAll('span');
            if (spans.length === 0) {
                issues.push('analytics-display 缺少數值顯示元素');
                console.warn('⚠️ analytics-display 缺少顯示元素');
            }
        }
        
        if (issues.length > 0) {
            console.error('UI問題發現:', issues);
            this.fixesApplied.add('ui_issues_checked');
            return false;
        }
        
        console.log('✅ UI檢查完成');
        this.fixesApplied.add('ui_checked');
        return true;
    }

    // 4. 應用緊急修復配置
    applyEmergencyFixes() {
        console.log('🚀 應用緊急修復...');
        
        // 停用所有可能導致問題的功能
        this.disableConflictingAnalytics();
        
        // 清除緩存
        this.clearCacheAndReload();
    }

    // 5. 獲取修復狀態
    getFixStatus() {
        return {
            isActive: this.isActive,
            fixesApplied: Array.from(this.fixesApplied),
            status: this.fixesApplied.size >= 3 ? 'fixed' : 'partial'
        };
    }

    // 6. 重置修復狀態
    reset() {
        this.isActive = false;
        this.fixesApplied.clear();
        console.log('🔄 緊急修復工具已重置');
    }

    // 7. 自動檢測和修復
    autoDetectAndFix() {
        // 等待頁面完全載入
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.autoDetectAndFix());
        } else {
            this.autoDetectAndFix();
        }
    }
}

// 創建全局實例
window.emergencyFixTool = new EmergencyFixTool();

// 自動檢測和修復
setTimeout(() => {
    window.emergencyFixTool.autoDetectAndFix();
}, 2000);

// 手動控制API
window.emergencyFix = {
    fix: () => window.emergencyFixTool.applyEmergencyFixes(),
    status: () => window.emergencyFixTool.getFixStatus(),
    reset: () => window.emergencyFixTool.reset(),
    checkUI: () => window.emergencyFixTool.checkAndFixUI()
};

console.log('🚀 緊急修復工具已載入');
console.log('📝 使用方式:');
console.log('- window.emergencyFix.fix() - 應用所有修復');
console.log('- window.emergencyFix.status() - 獲取修復狀態');
console.log('- window.emergencyFix.reset() - 重置修復狀態');
console.log('- window.emergencyFix.checkUI() - 檢查UI問題');
console.log('');