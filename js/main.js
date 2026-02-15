/**
 * main.js
 * ACG 收藏庫 - 應用程序入口 (Entry Point)
 */

// --- Loading & Animation Logic ---

let loadingProgress = 0;
let isLoadingComplete = false;

window.startLoadingSimulation = function () {
    const statusText = document.getElementById('loading-status');
    const barFill = document.getElementById('progress-bar-fill');
    const percentText = document.getElementById('progress-percent');
    const hub = document.querySelector('.rotating-hub');

    const timer = setInterval(() => {
        // 檢查是否完成
        if (loadingProgress >= 100) {
            clearInterval(timer);
            if (!isLoadingComplete) {
                isLoadingComplete = true;
                setTimeout(() => {
                    window.openGatesAndHide();
                }, 300);
            }
            return;
        }

        // 資料載入完成後快速前進
        if (window.isDataLoaded) {
            if (loadingProgress < 95) {
                loadingProgress = 95;
            }
            loadingProgress += 5; // 快速增加到 100
        } else {
            // 正常速度前進
            loadingProgress += Math.random() * 3 + 2;
            if (loadingProgress > 90) loadingProgress = 90;
        }

        // Update UI
        const displayProgress = Math.min(loadingProgress, 100);
        if (barFill) barFill.style.width = `${displayProgress}%`;
        if (percentText) percentText.innerText = Math.floor(displayProgress);
        if (hub) hub.style.setProperty('--hub-rotation', `${displayProgress * 3.6}deg`);
        
        // 更新狀態文字
        if (statusText) {
            if (displayProgress < 25) statusText.innerText = '正在初始化系統...';
            else if (displayProgress < 50) statusText.innerText = '正在載入資料...';
            else if (displayProgress < 75) statusText.innerText = '正在渲染頁面...';
            else if (displayProgress < 95) statusText.innerText = '即將完成...';
            else statusText.innerText = '系統就緒';
        }
    }, 50);
};

window.openGatesAndHide = function () {
    console.log('📡 開啟閘門...');
    const loadingScreen = document.getElementById('loading-screen');
    const gates = document.querySelectorAll('.gate-left, .gate-right');
    const app = document.getElementById('app');
    const centers = document.querySelectorAll('.center-stage, .center-ui-container, .center-hub-wrapper');

    if (!loadingScreen || loadingScreen.style.display === 'none') return;

    // 顯示 app 內容
    if (app) {
        app.style.display = 'block';
        app.classList.remove('site-content-blur');
    }

    // 啟動背景動畫
    if (window.visualEngine && !window.visualEngine.isRunning) {
        window.visualEngine.init();
    }

    // 添加動畫 class
    loadingScreen.classList.add('opening-gates');
    gates.forEach(g => g.classList.add('fading'));
    centers.forEach(c => {
        c.classList.add('fading');
        c.style.opacity = '0';
    });

    // 1秒後完全隱藏
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        // 初始化公告系統
        if (window.announcementSystem?.init) {
            window.announcementSystem.init();
        }
    }, 1000);
};

window.initApp = async function () {
    try {
        console.log('🚀 系統初始化中...');
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
