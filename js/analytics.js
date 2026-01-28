let analyticsData = { totalViews: 0, uniqueVisitors: 0 };

function getVisitorId() {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
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
        const lastTrack = localStorage.getItem('last_track_time');
        const now = Date.now();
        
        if (lastTrack && (now - parseInt(lastTrack)) < 60000) {
            await loadAnalytics();
            return;
        }
        
        localStorage.setItem('last_track_time', now.toString());
        
        const { data: existing, error: fetchError } = await client
            .from('visitor_analytics')
            .select('*')
            .eq('visitor_id', visitorId)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Analytics fetch error:', fetchError);
            return;
        }
        
        if (existing) {
            client
                .from('visitor_analytics')
                .update({
                    last_visit: new Date().toISOString(),
                    visit_count: existing.visit_count + 1
                })
                .eq('visitor_id', visitorId)
                .then(() => {});
        } else {
            client
                .from('visitor_analytics')
                .insert([{ visitor_id: visitorId }])
                .then(() => {});
        }
        
        // 記錄當前頁面訪問
        client
            .from('visitor_analytics')
            .insert([{ 
                visitor_id: visitorId,
                page_url: window.location.href,
                timestamp: new Date().toISOString()
            }])
            .then(() => {});
        
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
        
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 300000) {
            const data = JSON.parse(cached);
            analyticsData.totalViews = data.totalViews;
            analyticsData.uniqueVisitors = data.uniqueVisitors;
            updateAnalyticsDisplay();
            return;
        }
        
        const [viewsResult, visitorsResult] = await Promise.all([
            client.from('visitor_analytics').select('id', { count: 'exact', head: true }),
            client.from('visitor_analytics').select('visitor_id', { count: 'exact', head: true })
        ]);
        
        analyticsData.totalViews = viewsResult.count || 0;
        analyticsData.uniqueVisitors = visitorsResult.count || 0;
        
        localStorage.setItem('analytics_cache', JSON.stringify(analyticsData));
        localStorage.setItem('analytics_cache_time', Date.now().toString());
        
        console.log('📊 Analytics 數據載入:', { views: analyticsData.totalViews, visitors: analyticsData.uniqueVisitors });
        
        updateAnalyticsDisplay();
    } catch (err) {
        console.error('Load analytics error:', err);
        // 即使失敗也顯示 0，避免顯示錯誤
        updateAnalyticsDisplay();
    }
}

function updateAnalyticsDisplay() {
    const container = document.getElementById('analytics-display');
    if (container) {
        container.innerHTML = `
            <span style="margin-right: 15px;">👁 ${analyticsData.totalViews.toLocaleString()}</span>
            <span>👤 ${analyticsData.uniqueVisitors.toLocaleString()}</span>
        `;
    }
}

window.trackVisit = trackVisit;
window.loadAnalytics = loadAnalytics;
window.analyticsData = analyticsData;

// 在頁面載入時自動追蹤訪問
document.addEventListener('DOMContentLoaded', () => {
    // 延遲執行，等待其他模組初始化完成
    setTimeout(() => {
        console.log('📊 開始追蹤訪客統計');
        trackVisit();
    }, 3000);
});
