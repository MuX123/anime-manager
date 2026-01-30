let analyticsData = { totalVisits: 0, uniqueVisitors: 0, categoryClicks: 0 };

function getVisitorId() {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
}

// 版面點擊追蹤功能已移除 - 不再進行任何後端統計操作
async function trackCategoryClick(category) {
    console.log('📂 版面點擊追蹤功能已禁用');
    // 不再進行任何資料庫操作或本地計數
    return;
}

// 雲端數據載入功能已移除 - 不再從資料庫載入任何統計數據
async function loadCategoryClicksFromCloud() {
    console.log('📂 雲端版面點擊數據載入功能已禁用');
    return;
}

async function loadVisitsFromCloud() {
    console.log('🖱️ 雲端訪問次數數據載入功能已禁用');
    return;
}
        
        // 查詢雲端版面點擊總數
        const { count } = await client
            .from('site_analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'category_click');
            
        const cloudClicks = count || 0;
        
        // 修復：確保數據一致性，合併本地和雲端數據
        analyticsData.categoryClicks = Math.max(analyticsData.categoryClicks || 0, cloudClicks);
        updateAnalyticsDisplay();
        
        console.log('📂 雲端版面點擊數據載入:', cloudClicks);
        
    } catch (err) {
        console.error('Load category clicks from cloud error:', err);
    }
}

async function loadVisitsFromCloud() {
    try {
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            console.warn('⚠️ 無法連接資料庫載入訪問次數數據');
            return;
        }
        
        // 查詢雲端訪問次數總數
        const { count } = await client
            .from('site_analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'page_view');
            
        const cloudVisits = count || 0;
        
        // 更新本地顯示（不保存到 localStorage，避免與 trackVisit 衝突）
        analyticsData.totalVisits = cloudVisits;
        updateAnalyticsDisplay();
        
        console.log('🖱️ 雲端訪問次數數據載入:', cloudVisits);
        
    } catch (err) {
        console.error('Load visits from cloud error:', err);
    }
}
        
        



// 訪問追蹤功能已移除 - 只保留 UI 顯示
// 這個函數現在是空的，不再進行任何後端統計操作
async function trackVisit() {
    console.log('🖱️ 訪問追蹤功能已禁用 - 僅保留 UI 顯示');
    // 不再進行任何資料庫操作或本地計數
    // 只保留 updateAnalyticsDisplay() 來更新 UI
    return;
}
        
        // 每次進入網站都計算一次訪問（不管誰、每次進入都算一次）
        // 先記錄到資料庫，然後重新載入
        try {
            let client;
            if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
                client = window.supabaseManager.getClient();
            } else if (window.supabaseClient) {
                client = window.supabaseClient;
            } else {
                console.warn('⚠️ 無法連接資料庫記錄訪問');
                return;
            }
            
            const visitorId = getVisitorId();
            
            // 記錄到資料庫
            await client
                .from('site_analytics')
                .insert([{ 
                    visitor_id: visitorId,
                    event_type: 'page_view',
                    page_url: window.location.href,
                    timestamp: new Date().toISOString()
                }]);
            
            console.log('🖱️ 訪問記錄到雲端');
            
            // 重新載入雲端數據
            await loadVisitsFromCloud();
            
        } catch (dbErr) {
            console.warn('資料庫記錄訪問失敗:', dbErr.message);
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
                
                // 統一從資料庫計算訪客數，避免雙重計數
                console.log('👤 資料庫新訪客:', isNewDbVisitor);
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

// 數據載入功能已移除 - 不再從資料庫或本地存儲載入數據
async function loadAnalytics() {
    console.log('📊 數據載入功能已禁用');
    // 不再進行任何資料庫查詢或 localStorage 操作
    // 只保留 updateAnalyticsDisplay() 來更新 UI
    return;
}

// 修復：防止渲染卡死和數據循環問題
let analyticsUpdateScheduled = false;
let lastAnalyticsState = null;

function updateAnalyticsDisplay() {
    const container = document.getElementById('analytics-display');
    if (!container) {
        console.warn('⚠️ analytics-display 元素未找到');
        return;
    }
    
    const visits = analyticsData.totalVisits || 0;
    const visitors = analyticsData.uniqueVisitors || 0;
    const clicks = analyticsData.categoryClicks || 0;
    
    // 檢查狀態是否變化，避免無用更新
    const currentState = { visits, clicks, visitors };
    const stateChanged = !lastAnalyticsState || 
        lastAnalyticsState.visits !== currentState.visits ||
        lastAnalyticsState.clicks !== currentState.clicks ||
        lastAnalyticsState.visitors !== currentState.visitors;
    
    if (!stateChanged) {
        return; // 狀態未變化，直接返回
    }
    
    // 防止頻繁更新
    if (analyticsUpdateScheduled) {
        return;
    }
    
    analyticsUpdateScheduled = true;
    lastAnalyticsState = { ...currentState };
    
    requestAnimationFrame(() => {
        try {
            // 高效更新：只更新變化的數值
            updateSingleMetric(container, 0, visits, 'visits');
            updateSingleMetric(container, 1, clicks, 'clicks');
            updateSingleMetric(container, 2, visitors, 'visitors');
            
            console.log('📊 顯示更新:', { visits, clicks, visitors });
            
            // 保存到 localStorage（防抖）
            debounceSave(currentState);
            
        } finally {
            analyticsUpdateScheduled = false;
        }
    });
}

// 高效單一指標更新
function updateSingleMetric(container, index, value, type) {
    const targetDiv = container.children[index];
    if (!targetDiv) return;
    
    const targetSpan = targetDiv.querySelector('span');
    if (targetSpan && targetSpan.textContent !== value.toLocaleString()) {
        targetSpan.textContent = value.toLocaleString();
    }
}



window.trackVisit = trackVisit;
window.trackCategoryClick = trackCategoryClick;
window.loadAnalytics = loadAnalytics;
window.loadCategoryClicksFromCloud = loadCategoryClicksFromCloud;
window.loadVisitsFromCloud = loadVisitsFromCloud;
window.analyticsData = analyticsData;

// 設置分類按鈕點擊追蹤
function setupClickTracking() {
    // 等待頁面完全載入後設置分類按鈕點擊追蹤
    setTimeout(() => {
        const categoryButtons = document.querySelectorAll('[data-category], .category-btn, .filter-btn, button[onclick*="filter"]');
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset?.category || e.target.textContent.trim();
                if (category && category !== '' && !category.includes('全部') && !category.includes('所有')) {
                    trackCategoryClick(category);
                }
            });
        });
        console.log('📊 分類點擊追蹤已設置，找到', categoryButtons.length, '個按鈕');
    }, 3000);
}

// 簡化的初始化函數 - 只保留 UI 更新功能
function initAnalyticsDisplay() {
    console.log('🚀 統計系統已簡化 - 移除數據流，僅保留 UI 顯示');
    
    // 只初始化 UI 更新功能
    if (document.getElementById('analytics-display')) {
        console.log('✅ UI 顯示已準備就緒');
    } else {
        console.warn('⚠️ analytics-display 元素未找到');
    }
}

// 在頁面載入時初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalyticsDisplay);
} else {
    initAnalyticsDisplay();
}
