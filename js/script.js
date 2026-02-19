// TECH v8.0.0 - ACG Manager Logic (Security & Performance Optimized)

// 生產環境配置 - 減少控制台輸出
const IS_PRODUCTION = window.location.hostname !== 'localhost' &&
    !window.location.hostname.includes('127.0.0.1') &&
    (window.location.hostname.includes('github.io') || window.location.hostname.includes('.io'));

// 生產環境覆蓋 console 減少噪音
if (IS_PRODUCTION) {
    const originalConsole = { ...console };
    console.log = (...args) => {
        if (typeof args[0] === 'string' && (args[0].includes('✅') || args[0].includes('💳'))) {
            originalConsole.log.call(originalConsole, '[INFO]', ...args);
        }
    };
    console.warn = (...args) => originalConsole.warn.call(originalConsole, '[WARN]', ...args);
    console.info = () => { };
}

// ===== Admin Event Listeners (placeholder - using inline onclick handlers) =====
window.initAdminEventListeners = () => { /* No-op: using inline onclick handlers */ };

let currentSection = 'notice';
let lastSwitchRequestId = 0;

// --- v8.0 Mechanical Implementation ---
let loadingProgress = 0;
let isMenuOpen = false;

window.startLoadingSimulation = function () {
    const statusText = document.getElementById('loading-status');
    const barFill = document.getElementById('progress-bar-fill');
    const percentText = document.getElementById('progress-percent');
    const hub = document.querySelector('.rotating-hub');

    const stages = [
        { threshold: 20, text: 'INITIALIZING CORE...' },
        { threshold: 45, text: 'CALIBRATING TORQUE...' },
        { threshold: 70, text: 'SYNCING HYDRAULICS...' },
        { threshold: 90, text: 'PREPARING RELEASE...' },
        { threshold: 100, text: 'SYSTEM READY' }
    ];

    const timer = setInterval(() => {
        loadingProgress += Math.random() * 3 + 1;
        if (loadingProgress >= 100) {
            loadingProgress = 100;
            clearInterval(timer);
            setTimeout(() => {
                window.openGatesAndHide();
            }, 800);
        }

        // Update UI
        if (barFill) barFill.style.width = `${loadingProgress}%`;
        if (percentText) percentText.innerText = Math.floor(loadingProgress);

        // V9 Mechanical Torque: Gradually rotate the hub
        if (hub) {
            hub.style.setProperty('--hub-rotation', `${loadingProgress * 3.6}deg`);
        }

        // Update status text
        const currentStage = stages.find(s => loadingProgress <= s.threshold);
        if (currentStage && statusText) {
            statusText.innerText = currentStage.text;
        }
    }, 50);
};

window.openGatesAndHide = function () {
    console.log('📡 開啟閘門: V10 物理連結模組 (Physical Bonding Model)...');
    const loadingScreen = document.getElementById('loading-screen');
    const hub = document.querySelector('.rotating-hub');
    const gates = document.querySelectorAll('.gate-left, .gate-right');
    const app = document.getElementById('app');

    // Phase 1: Vibration & Torque Peak
    if (hub) hub.classList.add('spinning');
    loadingScreen.classList.add('spraying');

    setTimeout(() => {
        // Phase 2: Opening Sequence
        loadingScreen.classList.add('opening-gates');
        gates.forEach(g => g.classList.add('fading'));
        if (app) app.classList.add('loaded');
        if (app) app.classList.remove('site-content-blur');

        setTimeout(() => {
            loadingScreen.style.display = 'none';
            isFirstLoad = false;

            // 顯示主應用內容
            if (window.renderApp) {
                window.renderApp();
            }

            // Fix: 防止過場結束後原生遊標閃現
            if (window.CursorManager) {
                window.CursorManager.forceHideNativeCursor();
            }

            // Update admin menu items if logged in
            if (window.updateAdminMenu) window.updateAdminMenu();
        }, 3000);
    }, 1500);
};

// animeData and optionsData are managed by DataManager

window.getOptionLabel = (key) => {
    const labels = {
        genre: '類型',
        year: '年份',
        month: '月份',
        season: '季度',
        episodes: '集數',
        rating: '評分',
        recommendation: '推薦'
    };
    return labels[key] || key;
};

// 全局滑鼠滾輪橫向捲動
window.initGlobalScroll = () => {
    const containers = document.querySelectorAll('.force-scroll, .options-scroll-wrapper');
    containers.forEach(container => {
        container.removeEventListener('wheel', window.handleWheelScroll);
        container.addEventListener('wheel', window.handleWheelScroll, { passive: false });
    });
};

window.handleWheelScroll = (e) => {
    if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
        if (e.deltaY !== 0) {
            e.preventDefault();
            e.currentTarget.scrollLeft += e.deltaY;
        }
    }
};

window.changeCursorTheme = (themeId) => {
    localStorage.setItem('cursorTheme', themeId);
    if (window.CursorManager) {
        window.CursorManager.apply(themeId);
    }
    window.showToast(`✨ 遊標主題已切換：${themeId}`);
};

// 縮放控制
window.changeZoomLevel = (level) => {
    zoomLevel = parseInt(level);
    localStorage.setItem('zoomLevel', zoomLevel);
    const scale = zoomLevel / 100;
    document.documentElement.style.setProperty('--site-scale', scale);
    window.showToast(`🔍 縮放：${zoomLevel}%`);
};

// 應用儲存的縮放
window.applyZoom = () => {
    const scale = zoomLevel / 100;
    document.documentElement.style.setProperty('--site-scale', scale);
};

// Debug: log end of script
console.log('[script.js] File fully loaded');

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('script', {
        loaded: true,
        exports: { 
            startLoadingSimulation: window.startLoadingSimulation,
            openGatesAndHide: window.openGatesAndHide,
            changeCursorTheme: window.changeCursorTheme,
            changeZoomLevel: window.changeZoomLevel,
            applyZoom: window.applyZoom
        },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: script');
}
