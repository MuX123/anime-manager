let analyticsData = { totalVisits: 0, uniqueVisitors: 0, categoryClicks: 0 };

function getVisitorId() {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
}

// 版面點擊追蹤 - 只統計分類按鈕點擊（雲端計算）
async function trackCategoryClick(category) {
    try {
        // 確保使用正確的 Supabase 客戶端
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            console.warn('⚠️ Category Click: Supabase 客戶端尚未準備就緒');
            return;
        }
        
        const visitorId = getVisitorId();
        
        // 檢查資料庫結構
        const schemaStatus = await checkDatabaseSchema(client);
        
        if (schemaStatus === 'NEW_SCHEMA') {
            // 新版結構：使用 event_type
            await client
                .from('site_analytics')
                .insert([{ 
                    visitor_id: visitorId,
                    event_type: 'category_click',
                    page_url: window.location.href,
                    event_data: { category: category },
                    timestamp: new Date().toISOString()
                }]);
            
            console.log('📂 版面點擊記錄到雲端:', category);
            
            // 重新載入雲端數據（延遲 500ms 確保資料庫更新完成）
            setTimeout(async () => {
                await loadCategoryClicksFromCloud();
            }, 500);
        } else {
            console.warn('⚠️ 舊版資料庫結構不支援版面點擊追蹤');
        }
            // 舊版結構：不支援 event_type
            console.warn('⚠️ 舊版資料庫結構不支援版面點擊追蹤');
        }
            
    } catch (err) {
        console.error('Track category click error:', err);
    }
}

// 從雲端載入版面點擊數據
async function loadCategoryClicksFromCloud() {
    try {
        let client;
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            client = window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            client = window.supabaseClient;
        } else {
            console.warn('⚠️ 無法連接資料庫載入版面點擊數據');
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
        
        



async function trackVisit() {
    try {
        const visitorId = getVisitorId();
        const now = Date.now();
        
        // 檢查是否為新訪客（本地檢查）- 修復：避免雙重計數
        const isNewVisitor = !localStorage.getItem('visitor_tracked');
        
        if (isNewVisitor) {
            localStorage.setItem('visitor_tracked', 'true');
            // 移除本地計數，統一從資料庫計算
            console.log('👤 新訪客標記，等待資料庫確認');
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
                // 注意：categoryClicks 不合併，完全依賴雲端數據
                // analyticsData.categoryClicks = Math.max(analyticsData.categoryClicks, dbCategoryClicks);
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
            <!-- 訪問次數 -->
            <div style="background: rgba(0,212,255,0.08); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(0,212,255,0.2); display: flex; align-items: center; gap: 4px; font-family: 'Orbitron', monospace; font-weight: 700;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3L19 8L5 21L1 21L1 17L15 3Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M11 7L17 13" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="font-size: 10px; color: #ffffff;">${visits.toLocaleString()}</span>
            </div>
            <!-- 版面點擊 -->
            <div style="background: rgba(0,212,255,0.08); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(0,212,255,0.2); display: flex; align-items: center; gap: 4px; font-family: 'Orbitron', monospace; font-weight: 700;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3L19 8L10 17L5 17L5 12L15 3Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 8L15 3" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="font-size: 10px; color: #ffffff;">${clicks.toLocaleString()}</span>
            </div>
            <!-- 訪客數 -->
            <div style="background: rgba(0,212,255,0.08); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(0,212,255,0.2); display: flex; align-items: center; gap: 4px; font-family: 'Orbitron', monospace; font-weight: 700;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="font-size: 10px; color: #ffffff;">${visitors.toLocaleString()}</span>
            </div>
        `;
        
        if (currentHTML !== newHTML) {
            container.innerHTML = newHTML;
            console.log('📊 顯示更新:', { visits, clicks, visitors });
            
            // 保存到 localStorage
            localStorage.setItem('analytics_data', JSON.stringify({
                totalVisits: analyticsData.totalVisits,
                categoryClicks: analyticsData.categoryClicks,
                uniqueVisitors: analyticsData.uniqueVisitors
            }));
        }
    } else {
        console.warn('⚠️ analytics-display 元素未找到');
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

// 立即初始化顯示
function initAnalyticsDisplay() {
    // 先載入雲端數據
    loadVisitsFromCloud();
    loadCategoryClicksFromCloud();
    
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
