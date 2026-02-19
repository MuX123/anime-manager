/**
 * main.js
 * ACG 收藏庫 - 應用程序入口 (Entry Point)
 * 
 * 職責：系統初始化流程 (initApp)
 * 依賴：script.js 提供核心工具函數 (startLoadingSimulation, openGatesAndHide)
 */

let isLoadingComplete = false;

window.initApp = async function () {
    try {
        console.log('🚀 系統初始化中...');
        window.siteSettings = window.siteSettings || {};
        window.startLoadingSimulation();

        // 1. Supabase Check
        const waitForSupabase = async () => {
            let limit = 30;
            while (limit-- > 0) {
                if (window.supabaseManager?.isConnectionReady()) return true;
                await new Promise(r => setTimeout(r, 100));
            }
            return false;
        };
        await waitForSupabase();

        // 2. Load Data
        await window.dataManager.loadData();
        window.isDataLoaded = true;
        console.log('✅ 資料載入完成, 筆數:', window.animeData?.length || 0);

        // 3. Init UI settings
        if (window.supabaseManager?.getClient()) {
            const { data } = await window.supabaseManager.getClient().from('site_settings').select('*');
            if (data) {
                window.siteSettings = window.siteSettings || {};
                data.forEach(s => {
                    if (s.id === 'options_data') window.dataManager.setOptionsData(JSON.parse(s.value));
                    else window.siteSettings[s.id] = s.value;
                });
            }
        }

        // 4. Render App
        window.renderApp();

        console.log('✅ 頁面渲染完成');

        // 5. Init announcement system
        if (window.announcementSystem?.init) {
            await window.announcementSystem.init();
            if (window.updateTopMarquee) window.updateTopMarquee();
        }

        // 6. Check admin login status
        if (window.checkAndUpdateAdminStatus) {
            await window.checkAndUpdateAdminStatus();
        }

        // 7. Inject Cursor Themes
        if (window.injectCursorThemes) window.injectCursorThemes();

    } catch (err) {
        console.error('Init Error:', err);
        window.showToast('系統初始化異常', 'error');
        setTimeout(() => {
            const ls = document.getElementById('loading-screen');
            if (ls) ls.style.display = 'none';
        }, 2000);
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    window.initApp();
});

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('main', {
        loaded: true,
        exports: { initApp: window.initApp },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: main');
}
