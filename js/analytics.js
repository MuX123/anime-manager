// 全局分析數據
window.analyticsData = { totalClicks: 0, uniqueVisitors: 0, totalPageViews: 0 };
let analyticsData = window.analyticsData;

function getVisitorId() {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
}

// 追蹤板塊切換（只統計板塊切換，不統計所有點擊）
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
            .from('category_clicks')
            .select('*', { count: 'exact', head: true });
            
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
        // 確保使用正確的 Supabase 客戶端
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            console.warn('⚠️ Analytics: Supabase 客戶端尚未準備就緒');
            return;
        }
        
        const visitorId = getVisitorId();
        const lastTrack = localStorage.getItem('last_visit_time');
        const now = Date.now();
        
        // 防止同一次會話重複計算，但允許重新載入頁面後重新計算
        if (lastTrack && (now - parseInt(lastTrack)) < 300000) { // 5分鐘內不重複計算
            await loadAnalytics();
            return;
        }
        
        localStorage.setItem('last_visit_time', now.toString());
        
        // 檢查是否為新訪客
        const { data: existingVisitor, error: fetchError } = await client
            .from('site_visitors')
            .select('*')
            .eq('visitor_id', visitorId)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Analytics fetch error:', fetchError);
            return;
        }
        
        // 如果是新訪客，記錄到訪客表
        if (!existingVisitor) {
            await client
                .from('site_visitors')
                .insert([{ 
                    visitor_id: visitorId,
                    first_visit: new Date().toISOString(),
                    last_visit: new Date().toISOString()
                }]);
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
            .from('page_views')
            .insert([{ 
                visitor_id: visitorId,
                page_url: window.location.href,
                page_title: document.title,
                view_timestamp: new Date().toISOString()
            }]);
        
        await loadAnalytics();
    } catch (err) {
        console.error('Track visit error:', err);
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
            console.warn('⚠️ Analytics Load: Supabase 客戶端尚未準備就緒');
            return;
        }
        
        const cached = localStorage.getItem('analytics_cache');
        const cacheTime = localStorage.getItem('analytics_cache_time');
        
        // 使用5分鐘快取（如果快取數據有效則直接使用）
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 300000) {
            const data = JSON.parse(cached);
            // 確保快取數據有效（不為 null）
            if (data.totalClicks !== null && data.uniqueVisitors !== null && data.totalPageViews !== null) {
                analyticsData.totalClicks = data.totalClicks;
                analyticsData.uniqueVisitors = data.uniqueVisitors;
                analyticsData.totalPageViews = data.totalPageViews;
                updateAnalyticsDisplay();
                return;
            }
        }
        
        // 順序獲取數據以避免並行查詢導致的不一致
        let clicksResult, visitorsResult, pageViewsResult;
        
        try {
            // 按順序獲取點擊次數
            clicksResult = await client.from('category_clicks').select('id', { count: 'exact', head: true });
            analyticsData.totalClicks = clicksResult.count || 0;
            
            // 然後獲取訪客數量
            visitorsResult = await client.from('site_visitors').select('visitor_id', { count: 'exact', head: true });
            analyticsData.uniqueVisitors = visitorsResult.count || 0;
            
            // 最後獲取頁面瀏覽數量
            pageViewsResult = await client.from('page_views').select('id', { count: 'exact', head: true });
            analyticsData.totalPageViews = pageViewsResult.count || 0;
            
        } catch (error) {
            console.warn('Analytics 載入錯誤:', error);
            // 使用快取數據或預設值
            const cached = localStorage.getItem('analytics_cache');
            if (cached) {
                const data = JSON.parse(cached);
                analyticsData.totalClicks = data.totalClicks || 0;
                analyticsData.uniqueVisitors = data.uniqueVisitors || 0;
                analyticsData.totalPageViews = data.totalPageViews || 0;
            }
        }
        
        localStorage.setItem('analytics_cache', JSON.stringify(analyticsData));
        localStorage.setItem('analytics_cache_time', Date.now().toString());
        
        console.log('📊 Analytics 數據載入:', { clicks: analyticsData.totalClicks, visitors: analyticsData.uniqueVisitors, pageViews: analyticsData.totalPageViews });
        
        updateAnalyticsDisplay();
    } catch (err) {
        console.error('Load analytics error:', err);
        // 即使失敗也顯示 0，避免顯示錯誤
        updateAnalyticsDisplay();
    }
}

function updateAnalyticsDisplay() {
    const container = document.getElementById('analytics-display');
    if (!container) return;
    
    // 檢查是否所有數據都已載入（但允許顯示部分數據）
    const hasAnyData = analyticsData.totalClicks !== null || 
                       analyticsData.uniqueVisitors !== null || 
                       analyticsData.totalPageViews !== null;
    
    // 如果從未載入過任何數據，顯示載入中
    if (!hasAnyData) {
        // 嘗試使用快取數據
        const cached = localStorage.getItem('analytics_cache');
        if (cached) {
            const data = JSON.parse(cached);
            analyticsData.totalClicks = data.totalClicks || 0;
            analyticsData.uniqueVisitors = data.uniqueVisitors || 0;
            analyticsData.totalPageViews = data.totalPageViews || 0;
        } else {
            // 顯示載入中狀態
            container.innerHTML = `<span style="color: #666;">載入中...</span>`;
            container.style.visibility = 'visible';
            return;
        }
    }
    
    // 確保數值為數字（避免 null）
    const clicks = analyticsData.totalClicks !== undefined && analyticsData.totalClicks !== null ? analyticsData.totalClicks : '--';
    const visitors = analyticsData.uniqueVisitors !== undefined && analyticsData.uniqueVisitors !== null ? analyticsData.uniqueVisitors : '--';
    const pageViews = analyticsData.totalPageViews !== undefined && analyticsData.totalPageViews !== null ? analyticsData.totalPageViews : '--';
    
    // 數據載入完成，顯示並添加淡入動畫
    container.style.visibility = 'visible';
    container.style.pointerEvents = 'auto';
    container.style.opacity = '0';
    
    // 使用固定寬度容器避免數字變化導致的佈局跳動
    const itemStyle = "display: inline-block; min-width: 60px; text-align: left;";
    
    container.innerHTML = `
        <span style="margin-right: 15px;">👤 <span style="${itemStyle}">${visitors === '--' ? '--' : visitors.toLocaleString()}</span></span>
        <span style="margin-right: 15px;">🖱️ <span style="${itemStyle}">${clicks === '--' ? '--' : clicks.toLocaleString()}</span></span>
        <span>📄 <span style="${itemStyle}">${pageViews === '--' ? '--' : pageViews.toLocaleString()}</span></span>
    `;
    
    // 觸發淡入效果
    requestAnimationFrame(() => {
        container.style.opacity = '1';
    });
}

window.trackVisit = trackVisit;
window.trackCategorySwitch = trackCategorySwitch;
window.loadAnalytics = loadAnalytics;
window.analyticsData = analyticsData;

// 追蹤板塊切換（只統計板塊切換，不統計所有點擊）
function trackCategorySwitch(categoryName) {
    try {
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            console.warn('⚠️ Category Switch Track: Supabase 客戶端尚未準備就緒');
            return;
        }
        
        const visitorId = getVisitorId();
        
        // 記錄板塊切換到 category_clicks 表
        client
            .from('category_clicks')
            .insert([{ 
                visitor_id: visitorId,
                category_name: categoryName,
                page_url: window.location.href,
                click_timestamp: new Date().toISOString()
            }])
            .then(() => {
                updateClickCount();
            })
            .catch(err => {
                console.warn('板塊切換追蹤失敗:', err);
            });
            
    } catch (err) {
        console.error('Track category switch error:', err);
    }
}

// 追蹤管理員操作
function trackAdminAction(actionName) {
    try {
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            return;
        }
        
        const visitorId = getVisitorId();
        
        client
            .from('category_clicks')
            .insert([{ 
                visitor_id: visitorId,
                category_name: 'admin_' + actionName,
                page_url: window.location.href,
                click_timestamp: new Date().toISOString()
            }])
            .catch(err => {
                // 靜默失敗，不顯示錯誤
            });
            
    } catch (err) {
        // 靜默失敗
    }
}

// 設置全局點擊監聽器（已停用，改為只追蹤板塊切換）

// 在頁面載入後延遲追蹤訪問
setTimeout(() => {
    console.log('📊 開始追蹤訪客統計');
    trackVisit();
}, 3000);

// 立即初始化顯示（使用預設值或快取），避免空白
updateAnalyticsDisplay();
