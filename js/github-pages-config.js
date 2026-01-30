/**
 * GitHub Pages 配置文件
 * 提供預設配置以確保在 GitHub Pages 上正常運行
 */

// 在此填入你的 Supabase 配置
window.__ACG_CONFIG__ = {
    // Supabase 配置 - 從 Supabase Dashboard > Settings > API 獲取
    SUPABASE_URL: 'https://你的專案ID.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...你的anon key...',

    // 基本配置
    NODE_ENV: 'production',
    DEBUG: false,
    CSP_ENABLED: true
};

// 檢查配置完整性
function checkConfiguration() {
    const config = window.__ACG_CONFIG__;
    const errors = [];
    
    if (!config.SUPABASE_URL) {
        errors.push('缺少 SUPABASE_URL 配置');
    }
    
    if (!config.SUPABASE_ANON_KEY) {
        errors.push('缺少 SUPABASE_ANON_KEY 配置');
    }
    
    if (errors.length > 0) {
        console.error('🚨 配置錯誤:', errors);
        console.log('📝 請複製 .env.example 為 .env 並填入正確配置');
        
        // 顯示用戶友好的錯誤訊息
        if (document.getElementById('loading-screen')) {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.innerHTML = `
                <div style="text-align: center; padding: 20px; max-width: 400px;">
                    <h2 style="color: #ff4444; margin-bottom: 20px;">⚙️ 配置錯誤</h2>
                    <p style="color: #fff; line-height: 1.6;">
                        請配置您的 Supabase 資料庫連接信息。
                    </p>
                    <div style="background: #1a1a2e; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
                        <h3 style="color: #00d4ff; margin-bottom: 10px;">配置步驟：</h3>
                        <ol style="color: #ccc; margin-left: 20px;">
                            <li>創建 Supabase 專案</li>
                            <li>複製 .env.example 為 .env</li>
                            <li>填入您的 Supabase URL 和 Anonymous Key</li>
                            <li>重新部署網站</li>
                        </ol>
                    </div>
                    <button onclick="location.reload()" style="
                        background: #00d4ff; 
                        color: #0a0e1a; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 5px; 
                        cursor: pointer;
                        font-weight: bold;
                    ">重新載入</button>
                </div>
            `;
        }
        return false;
    }
    
    console.log('✅ 配置檢查通過');
    return true;
}

// 在 DOM 載入完成後檢查配置
document.addEventListener('DOMContentLoaded', function() {
    // 延遲檢查，確保其他腳本載入完成
    setTimeout(checkConfiguration, 1000);
});