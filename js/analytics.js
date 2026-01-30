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
function trackClick() {
    try {
        // 確保使用正確的 Supabase 客戶端
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            console.warn('⚠️ Click Track: Supabase 客戶端尚未準備就緒');
            return;
        }
        
        const visitorId = getVisitorId();
        
        // 記錄點擊到資料庫
        client
            .from('category_clicks')
            .insert([{ 
                visitor_id: visitorId,
                category_name: 'general', // 預設分類，後續可改為更具體的分類
                page_url: window.location.href,
                click_timestamp: new Date().toISOString()
            }])
            .then(() => {
                // 異步更新統計數據
                updateClickCount();
            })
            .catch(err => {
                console.warn('點擊追蹤失敗:', err);
            });
            
    } catch (err) {
        console.error('Track click error:', err);
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
        
        // 使用5分鐘快取
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 300000) {
            const data = JSON.parse(cached);
            analyticsData.totalClicks = data.totalClicks || 0;
            analyticsData.uniqueVisitors = data.uniqueVisitors || 0;
            updateAnalyticsDisplay();
            return;
        }
        
        // 並行獲取點擊次數和訪客數量
        const [clicksResult, visitorsResult] = await Promise.all([
            client.from('category_clicks').select('id', { count: 'exact', head: true }),
            client.from('site_visitors').select('visitor_id', { count: 'exact', head: true })
        ]);
        
        analyticsData.totalClicks = clicksResult.count || 0;
        analyticsData.uniqueVisitors = visitorsResult.count || 0;
        
        localStorage.setItem('analytics_cache', JSON.stringify(analyticsData));
        localStorage.setItem('analytics_cache_time', Date.now().toString());
        
        console.log('📊 Analytics 數據載入:', { clicks: analyticsData.totalClicks, visitors: analyticsData.uniqueVisitors });
        
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
            <span style="margin-right: 15px;">🖱️ ${analyticsData.totalClicks.toLocaleString()}</span>
            <span>👤 ${analyticsData.uniqueVisitors.toLocaleString()}</span>
        `;
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
        if (isAdmin) return;
        if (event.target.closest('#systemMenu, #loginModal, #detailModal, .modal')) return;
        
        // 防止過於頻繁的點擊追蹤，使用防抖
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            trackClick();
        }, 100);
    });
}

// 在頁面載入時自動追蹤訪問和設置點擊追蹤
document.addEventListener('DOMContentLoaded', () => {
    // 延遲執行，等待其他模組初始化完成
    setTimeout(() => {
        console.log('📊 開始追蹤訪客統計');
        trackVisit();
        setupClickTracking();
    }, 3000);
});
