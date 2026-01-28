/**
 * 調試工具 - 檢查系統狀態
 */

window.debugSystem = function() {
    console.log('🔍 系統狀態檢查:');
    console.log('================');
    
    // 檢查模組載入狀態
    console.log('📦 模組狀態:');
    console.log('- configManager:', typeof window.configManager !== 'undefined' ? '✅ 已載入' : '❌ 未載入');
    console.log('- securityManager:', typeof window.securityManager !== 'undefined' ? '✅ 已載入' : '❌ 未載入');
    console.log('- logger:', typeof window.logger !== 'undefined' ? '✅ 已載入' : '❌ 未載入');
    console.log('- performanceOptimizer:', typeof window.performanceOptimizer !== 'undefined' ? '✅ 已載入' : '❌ 未載入');
    console.log('- supabaseManager:', typeof window.supabaseManager !== 'undefined' ? '✅ 已載入' : '❌ 未載入');
    console.log('- supabaseClient:', typeof window.supabaseClient !== 'undefined' ? '✅ 已載入' : '❌ 未載入');
    
    // 檢查 Supabase 連接狀態
    if (window.supabaseManager) {
        const status = window.supabaseManager.getConnectionStatus();
        console.log('🔗 Supabase 連接狀態:');
        console.log('- 已連接:', status.isConnected);
        console.log('- 連接嘗試:', status.connectionAttempts);
        console.log('- 客戶端可用:', status.clientAvailable);
    }
    
    // 檢查認證狀態
    console.log('🔐 認證狀態:');
    console.log('- isAdmin:', window.isAdmin);
    
    if (window.supabaseClient) {
        window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
            console.log('- 當前會話:', session ? '✅ 已登入' : '❌ 未登入');
            if (session) {
                console.log('- 用戶郵箱:', session.user.email);
                console.log('- 用戶 ID:', session.user.id);
            }
        });
    }
    
    // 檢查 DOM 元素
    console.log('🎨 DOM 元素狀態:');
    console.log('- app 元素:', document.getElementById('app') ? '✅ 存在' : '❌ 不存在');
    console.log('- loginModal 元素:', document.getElementById('loginModal') ? '✅ 存在' : '❌ 不存在');
    console.log('- loading-screen 元素:', document.getElementById('loading-screen') ? '✅ 存在' : '❌ 不存在');
    
    // 檢查配置
    if (window.configManager) {
        const config = window.configManager.getAppConfig();
        console.log('⚙️ 應用配置:');
        console.log('- 版本:', config.version);
        console.log('- 環境:', config.environment);
        console.log('- 調試模式:', config.debug);
    }
    
    console.log('================');
    console.log('🔍 檢查完成');
};

// 自動執行調試（如果在開發模式）
document.addEventListener('DOMContentLoaded', () => {
    if (window.configManager?.getAppConfig().debug) {
        setTimeout(() => {
            console.log('🔍 自動執行系統狀態檢查...');
            window.debugSystem();
        }, 2000);
    }
});