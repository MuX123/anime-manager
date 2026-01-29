let analyticsData = { totalClicks: 0, uniqueVisitors: 0 };

function getVisitorId() {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
}

// 全局點擊追蹤
async function trackClick() {
    try {
        // 立即更新本地計數，提供即時反饋
        analyticsData.totalClicks++;
        updateAnalyticsDisplay();
        console.log('🖱️ 本地點擊計數更新:', analyticsData.totalClicks);
        
        // 確保使用正確的 Supabase 客戶端
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            console.warn('⚠️ Click Track: Supabase 客戶端尚未準備就緒，僅使用本地計數');
            return;
        }
        
        const visitorId = getVisitorId();
        
        // 檢查資料庫結構
        const schemaStatus = await checkDatabaseSchema(client);
        
        if (schemaStatus === 'NEW_SCHEMA') {
            // 新版結構：使用 event_type
            client
                .from('site_analytics')
                .insert([{ 
                    visitor_id: visitorId,
                    event_type: 'click',
                    page_url: window.location.href,
                    timestamp: new Date().toISOString()
                }])
                .then(() => {
                    console.log('🖱️ 點擊追蹤成功 (新版結構):', analyticsData.totalClicks);
                })
                .catch(err => {
                    console.warn('點擊追蹤資料庫失敗，但本地計數已更新:', err.message);
                });
        } else {
            // 舊版結構：不支援 event_type，不記錄到資料庫
            console.warn('⚠️ 舊版資料庫結構不支援點擊追蹤，僅使用本地計數');
        }
            
    } catch (err) {
        // 即使發生錯誤，本地計數已經更新
        console.error('Track click error，但本地計數已更新:', err);
    }
}

// 更新點擊次數
async function updateClickCount() {
    try {
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            return;
        }
        
        const { count } = await client
            .from('site_analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'click');
            
        analyticsData.totalClicks = count || 0;
        
        // 更新顯示
        updateAnalyticsDisplay();
        
        // 更新緩存
        const cached = JSON.parse(localStorage.getItem('analytics_cache') || '{}');
        cached.totalClicks = analyticsData.totalClicks;
        localStorage.setItem('analytics_cache', JSON.stringify(cached));
        
    } catch (err) {
        console.error('Update click count error:', err);
    }
}

async function trackVisit() {
    try {
        const visitorId = getVisitorId();
        const lastTrack = localStorage.getItem('last_visit_time');
        const now = Date.now();
        
        // 防止同一次會話重複計算，但允許重新載入頁面後重新計算
        if (lastTrack && (now - parseInt(lastTrack)) < 300000) { // 5分鐘內不重複計算
            await loadAnalytics();
            return;
        }
        
        localStorage.setItem('last_visit_time', now.toString());
        
        // 檢查是否為新訪客（本地檢查）
        const isNewVisitor = !localStorage.getItem('visitor_tracked');
        
        if (isNewVisitor) {
            localStorage.setItem('visitor_tracked', 'true');
            analyticsData.uniqueVisitors++;
            console.log('👤 新訪客記錄:', analyticsData.uniqueVisitors);
        }
        
        // 嘗試使用資料庫
        try {
            // 確保使用正確的 Supabase 客戶端
            let client;
            if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
                client = window.supabaseManager.getClient();
            } else if (window.supabaseClient) {
                client = window.supabaseClient;
            } else {
                console.warn('⚠️ Analytics: Supabase 客戶端尚未準備就緒，使用本地追蹤');
                updateAnalyticsDisplay();
                return;
            }
            
            // 檢查是否為新訪客（資料庫檢查）
            const { data: existingVisitor, error: fetchError } = await client
                .from('site_visitors')
                .select('*')
                .eq('visitor_id', visitorId)
                .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') {
                console.warn('Analytics fetch error:', fetchError.message);
                // 如果資料庫錯誤，繼續使用本地追蹤
            } else if (!existingVisitor) {
                // 如果是新訪客，記錄到訪客表
                await client
                    .from('site_visitors')
                    .insert([{ 
                        visitor_id: visitorId,
                        first_visit: new Date().toISOString(),
                        last_visit: new Date().toISOString()
                    }]);
                console.log('👤 新訪客已記錄到資料庫');
            } else {
                // 更新最後訪問時間
                await client
                    .from('site_visitors')
                    .update({
                        last_visit: new Date().toISOString()
                    })
                    .eq('visitor_id', visitorId);
            }
            
            // 記錄頁面訪問
            await client
                .from('site_analytics')
                .insert([{ 
                    visitor_id: visitorId,
                    event_type: 'page_view',
                    page_url: window.location.href,
                    timestamp: new Date().toISOString()
                }]);
                
        } catch (dbErr) {
            console.warn('資料庫追蹤失敗，使用本地追蹤:', dbErr.message);
            // 繼續使用本地追蹤
        }
        
        await loadAnalytics();
    } catch (err) {
        console.error('Track visit error:', err);
        // 即使失敗也要顯示當前數據
        updateAnalyticsDisplay();
    }
}

// 檢查資料庫結構是否支援新版本
async function checkDatabaseSchema(client) {
    try {
        // 檢查 site_analytics 表是否有 event_type 欄位
        const { data: columns, error } = await client
            .from('site_analytics')
            .select('*')
            .limit(1);
            
        if (error && error.message.includes('column "event_type" does not exist')) {
            console.warn('⚠️ 檢測到舊版資料庫結構，需要執行修復腳本');
            return 'OLD_SCHEMA';
        }
        
        // 檢查 site_visitors 表是否存在
        try {
            await client.from('site_visitors').select('visitor_id', { count: 'exact', head: true });
        } catch (visitorErr) {
            if (visitorErr.message.includes('relation "site_visitors" does not exist')) {
                console.warn('⚠️ site_visitors 表不存在，需要執行修復腳本');
                return 'MISSING_TABLE';
            }
        }
        
        return 'NEW_SCHEMA';
    } catch (err) {
        console.warn('⚠️ 無法檢查資料庫結構:', err.message);
        return 'UNKNOWN';
    }
}

async function loadAnalytics() {
    try {
        // 確保使用正確的 Supabase 客戶端
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            console.warn('⚠️ Analytics Load: Supabase 客戶端尚未準備就緒，使用預設值');
            updateAnalyticsDisplay();
            return;
        }
        
        const cached = localStorage.getItem('analytics_cache');
        const cacheTime = localStorage.getItem('analytics_cache_time');
        
        // 使用5分鐘快取
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 300000) {
            const data = JSON.parse(cached);
            analyticsData.totalClicks = data.totalClicks || analyticsData.totalClicks;
            analyticsData.uniqueVisitors = data.uniqueVisitors || analyticsData.uniqueVisitors;
            updateAnalyticsDisplay();
            return;
        }
        
        // 檢查資料庫結構
        const schemaStatus = await checkDatabaseSchema(client);
        
        // 嘗試從資料庫獲取數據
        try {
            if (schemaStatus === 'NEW_SCHEMA') {
                // 新版結構：使用 event_type 分類查詢
                const [clicksResult, visitorsResult] = await Promise.all([
                    client.from('site_analytics').select('id', { count: 'exact', head: true }).eq('event_type', 'click'),
                    client.from('site_visitors').select('visitor_id', { count: 'exact', head: true })
                ]);
                
                const dbClicks = clicksResult.count || 0;
                const dbVisitors = visitorsResult.count || 0;
                
                analyticsData.totalClicks = dbClicks;
                analyticsData.uniqueVisitors = dbVisitors;
                
                console.log('📊 新版 Analytics 數據載入:', { clicks: analyticsData.totalClicks, visitors: analyticsData.uniqueVisitors });
            } else {
                // 舊版結構：只能查詢總記錄數
                const [oldAnalyticsResult] = await Promise.all([
                    client.from('site_analytics').select('id', { count: 'exact', head: true })
                ]);
                
                const totalRecords = oldAnalyticsResult.count || 0;
                analyticsData.uniqueVisitors = totalRecords;
                // 舊版沒有點擊追蹤，保持初始值
                
                console.warn('⚠️ 使用舊版資料庫結構，點擊追蹤功能可能不可用');
                console.log('📊 舊版 Analytics 數據載入:', { clicks: analyticsData.totalClicks, visitors: analyticsData.uniqueVisitors });
            }
            
            localStorage.setItem('analytics_cache', JSON.stringify(analyticsData));
            localStorage.setItem('analytics_cache_time', Date.now().toString());
            
        } catch (dbErr) {
            console.warn('📊 資料庫查詢失敗，使用本地數據:', dbErr.message);
            // 如果資料庫表不存在，保持初始值
        }
        
        updateAnalyticsDisplay();
    } catch (err) {
        console.error('Load analytics error:', err);
        // 即使失敗也顯示初始值，避免顯示錯誤
        updateAnalyticsDisplay();
    }
}

function updateAnalyticsDisplay() {
    const container = document.getElementById('analytics-display');
    if (container) {
        const clicks = analyticsData.totalClicks || 0;
        const visitors = analyticsData.uniqueVisitors || 0;
        
        container.innerHTML = `
            <span style="margin-right: 15px;">🖱️ ${clicks.toLocaleString()}</span>
            <span>👤 ${visitors.toLocaleString()}</span>
        `;
        
        console.log('📊 顯示更新:', { clicks, visitors });
    } else {
        console.warn('⚠️ analytics-display 元素未找到');
    }
}

window.trackVisit = trackVisit;
window.trackClick = trackClick;
window.loadAnalytics = loadAnalytics;
window.analyticsData = analyticsData;

// 設置全局點擊監聽器
function setupClickTracking() {
    let clickTimer;
    document.addEventListener('click', (event) => {
        // 忽略管理員操作和某些特殊元素
        if (typeof isAdmin !== 'undefined' && isAdmin) return;
        if (event.target.closest('#systemMenu, #loginModal, #detailModal, .modal')) return;
        
        // 防止過於頻繁的點擊追蹤，使用防抖
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            trackClick();
        }, 100);
    });
}

// 立即初始化顯示
function initAnalyticsDisplay() {
    console.log('📊 初始化統計顯示:', analyticsData);
    updateAnalyticsDisplay();
    
    // 設置點擊追蹤
    setupClickTracking();
    
    // 延遲追蹤訪問
    setTimeout(() => {
        console.log('📊 開始追蹤訪客統計');
        trackVisit();
    }, 2000);
}

// 在頁面載入時初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalyticsDisplay);
} else {
    initAnalyticsDisplay();
}
