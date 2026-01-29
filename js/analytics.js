let analyticsData = { totalVisits: 0, uniqueVisitors: 0, categoryClicks: 0 };

function getVisitorId() {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
}

// 版面點擊追蹤 - 只統計分類按鈕點擊
async function trackCategoryClick(category) {
    try {
        // 立即更新本地計數
        analyticsData.categoryClicks++;
        updateAnalyticsDisplay();
        console.log('📂 版面點擊計數更新:', analyticsData.categoryClicks, '分類:', category);
        
        // 確保使用正確的 Supabase 客戶端
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            console.warn('⚠️ Category Click: Supabase 客戶端尚未準備就緒，僅使用本地計數');
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
                    event_type: 'category_click',
                    page_url: window.location.href,
                    event_data: { category: category },
                    timestamp: new Date().toISOString()
                }])
                .then(() => {
                    console.log('📂 版面點擊追蹤成功 (新版結構):', analyticsData.categoryClicks);
                })
                .catch(err => {
                    console.warn('版面點擊追蹤資料庫失敗，但本地計數已更新:', err.message);
                });
        } else {
            // 舊版結構：不支援 event_type，不記錄到資料庫
            console.warn('⚠️ 舊版資料庫結構不支援版面點擊追蹤，僅使用本地計數');
        }
            
    } catch (err) {
        // 即使發生錯誤，本地計數已經更新
        console.error('Track category click error，但本地計數已更新:', err);
    }
}



async function trackVisit() {
    try {
        const visitorId = getVisitorId();
        const lastTrack = localStorage.getItem('last_visit_time');
        const now = Date.now();
        
        // 檢查是否為新訪客（本地檢查）
        const isNewVisitor = !localStorage.getItem('visitor_tracked');
        
        if (isNewVisitor) {
            localStorage.setItem('visitor_tracked', 'true');
            analyticsData.uniqueVisitors++;
            console.log('👤 新訪客記錄:', analyticsData.uniqueVisitors);
        }
        
        // 每次進入網站都計算一次訪問（但限制5分鐘內不重複計算）
        if (!lastTrack || (now - parseInt(lastTrack)) >= 300000) { // 5分鐘內不重複計算
            localStorage.setItem('last_visit_time', now.toString());
            
            // 更新訪問次數（不是點擊次數）
            analyticsData.totalVisits++;
            console.log('🖱️ 網站訪問記錄:', analyticsData.totalVisits);
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
            
            let isNewDbVisitor = false;
            
            if (fetchError && fetchError.code !== 'PGRST116') {
                console.warn('Analytics fetch error:', fetchError.message);
                // 如果資料庫錯誤，繼續使用本地追蹤
            } else if (!existingVisitor) {
                // 如果是新訪客，記錄到訪客表
                isNewDbVisitor = true;
                await client
                    .from('site_visitors')
                    .insert([{ 
                        visitor_id: visitorId,
                        first_visit: new Date().toISOString(),
                        last_visit: new Date().toISOString()
                    }]);
                console.log('👤 新訪客已記錄到資料庫');
                
                // 同步更新本地不重復訪問人數
                if (isNewVisitor) {
                    analyticsData.uniqueVisitors++;
                    console.log('👤 本地不重復訪客更新:', analyticsData.uniqueVisitors);
                }
            } else {
                // 更新最後訪問時間
                await client
                    .from('site_visitors')
                    .update({
                        last_visit: new Date().toISOString()
                    })
                    .eq('visitor_id', visitorId);
                    
                // 如果本地記錄是新訪客但資料庫已存在，同步資料庫狀態
                if (isNewVisitor) {
                    isNewVisitor = false;
                }
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
            // 合併本地和資料庫數據，取最大值避免回朔
            analyticsData.categoryClicks = Math.max(analyticsData.categoryClicks, data.categoryClicks || 0);
            analyticsData.totalVisits = Math.max(analyticsData.totalVisits, data.totalVisits || 0);
            analyticsData.uniqueVisitors = Math.max(analyticsData.uniqueVisitors, data.uniqueVisitors || 0);
            updateAnalyticsDisplay();
            return;
        }
        
        // 檢查資料庫結構
        const schemaStatus = await checkDatabaseSchema(client);
        
        // 嘗試從資料庫獲取數據
        try {
            if (schemaStatus === 'NEW_SCHEMA') {
                // 新版結構：使用 event_type 分類查詢
                const [visitsResult, categoryClicksResult, visitorsResult] = await Promise.all([
                    client.from('site_analytics').select('id', { count: 'exact', head: true }).eq('event_type', 'page_view'),
                    client.from('site_analytics').select('id', { count: 'exact', head: true }).eq('event_type', 'category_click'),
                    client.from('site_visitors').select('visitor_id', { count: 'exact', head: true })
                ]);
                
                const dbVisits = visitsResult.count || 0;
                const dbCategoryClicks = categoryClicksResult.count || 0;
                const dbVisitors = visitorsResult.count || 0;
                
                // 合併本地和資料庫數據，取最大值避免回朔
                analyticsData.totalVisits = Math.max(analyticsData.totalVisits, dbVisits);
                analyticsData.categoryClicks = Math.max(analyticsData.categoryClicks, dbCategoryClicks);
                analyticsData.uniqueVisitors = Math.max(analyticsData.uniqueVisitors, dbVisitors);
                
                console.log('📊 新版 Analytics 數據載入:', { visits: analyticsData.totalVisits, categoryClicks: analyticsData.categoryClicks, visitors: analyticsData.uniqueVisitors });
            } else {
                // 舊版結構：只能查詢總記錄數
                const [oldAnalyticsResult] = await Promise.all([
                    client.from('site_analytics').select('id', { count: 'exact', head: true })
                ]);
                
                const totalRecords = oldAnalyticsResult.count || 0;
                analyticsData.uniqueVisitors = Math.max(analyticsData.uniqueVisitors, totalRecords);
                // 舊版沒有點擊追蹤，保持本地值
                
                console.warn('⚠️ 使用舊版資料庫結構，版面點擊追蹤功能可能不可用');
                console.log('📊 舊版 Analytics 數據載入:', { visits: analyticsData.totalVisits, categoryClicks: analyticsData.categoryClicks, visitors: analyticsData.uniqueVisitors });
            }
            
            // 保存合併後的數據到快取
            const cacheData = {
                totalVisits: analyticsData.totalVisits,
                categoryClicks: analyticsData.categoryClicks,
                uniqueVisitors: analyticsData.uniqueVisitors
            };
            localStorage.setItem('analytics_cache', JSON.stringify(cacheData));
            localStorage.setItem('analytics_cache_time', Date.now().toString());
            
        } catch (dbErr) {
            console.warn('📊 資料庫查詢失敗，使用本地數據:', dbErr.message);
            // 如果資料庫表不存在，保持本地值
        }
        
        updateAnalyticsDisplay();
    } catch (err) {
        console.error('Load analytics error:', err);
        // 即使失敗也顯示本地值，避免顯示錯誤
        updateAnalyticsDisplay();
    }
}

function updateAnalyticsDisplay() {
    const container = document.getElementById('analytics-display');
    if (container) {
        const visits = analyticsData.totalVisits || 0;
        const visitors = analyticsData.uniqueVisitors || 0;
        const clicks = analyticsData.categoryClicks || 0;
        
        // 防止頻繁更新導致閃爍
        const currentHTML = container.innerHTML;
        const newHTML = `
            <span style="margin-right: 15px; background: rgba(0,212,255,0.05); padding: 4px 10px; border-radius: 4px; color: #ffffff; font-size: 14px; font-weight: 700; font-family: 'Noto Sans TC', '微軟正黑體', 'Microsoft JhengHei', sans-serif; text-decoration: none !important;">🖱️ <span style="font-variant-numeric: normal;">${visits.toLocaleString()}</span></span>
            <span style="margin-right: 15px; background: rgba(0,212,255,0.05); padding: 4px 10px; border-radius: 4px; color: #ffffff; font-size: 14px; font-weight: 700; font-family: 'Noto Sans TC', '微軟正黑體', 'Microsoft JhengHei', sans-serif; text-decoration: none !important;">📂 <span style="font-variant-numeric: normal;">${clicks.toLocaleString()}</span></span>
            <span style="background: rgba(0,212,255,0.05); padding: 4px 10px; border-radius: 4px; color: #ffffff; font-size: 14px; font-weight: 700; font-family: 'Noto Sans TC', '微軟正黑體', 'Microsoft JhengHei', sans-serif; text-decoration: none !important;">👤 <span style="font-variant-numeric: normal;">${visitors.toLocaleString()}</span></span>
        `;
        
        if (currentHTML !== newHTML) {
            container.innerHTML = newHTML;
            console.log('📊 顯示更新:', { visits, clicks, visitors });
        }
    } else {
        console.warn('⚠️ analytics-display 元素未找到');
    }
}

window.trackVisit = trackVisit;
window.trackCategoryClick = trackCategoryClick;
window.loadAnalytics = loadAnalytics;
window.analyticsData = analyticsData;

// 禁用點擊追蹤 - 現在只追蹤訪問次數
function setupClickTracking() {
    // 點擊追蹤已禁用，改為追蹤訪問次數
    console.log('📊 點擊追蹤已禁用，改為訪問次數追蹤');
}

// 立即初始化顯示
function initAnalyticsDisplay() {
    console.log('📊 初始化統計顯示:', analyticsData);
    updateAnalyticsDisplay();
    
    // 設置點擊追蹤（已停用）
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
