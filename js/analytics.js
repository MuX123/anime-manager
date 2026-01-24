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
        const visitorId = getVisitorId();
        const lastTrack = localStorage.getItem('last_track_time');
        const now = Date.now();
        
        if (lastTrack && (now - parseInt(lastTrack)) < 60000) {
            await loadAnalytics();
            return;
        }
        
        localStorage.setItem('last_track_time', now.toString());
        
        const { data: existing, error: fetchError } = await supabaseClient
            .from('site_analytics')
            .select('*')
            .eq('visitor_id', visitorId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Analytics fetch error:', fetchError);
            return;
        }

        if (existing) {
            supabaseClient
                .from('site_analytics')
                .update({
                    last_visit: new Date().toISOString(),
                    visit_count: existing.visit_count + 1
                })
                .eq('visitor_id', visitorId)
                .then(() => {});
        } else {
            supabaseClient
                .from('site_analytics')
                .insert([{ visitor_id: visitorId }])
                .then(() => {});
        }

        supabaseClient
            .from('page_views')
            .insert([{ visitor_id: visitorId }])
            .then(() => {});

        await loadAnalytics();
    } catch (err) {
        console.error('Track visit error:', err);
    }
}

async function loadAnalytics() {
    try {
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
            supabaseClient.from('page_views').select('id', { count: 'exact', head: true }),
            supabaseClient.from('site_analytics').select('id', { count: 'exact', head: true })
        ]);

        analyticsData.totalViews = viewsResult.count || 0;
        analyticsData.uniqueVisitors = visitorsResult.count || 0;
        
        localStorage.setItem('analytics_cache', JSON.stringify(analyticsData));
        localStorage.setItem('analytics_cache_time', Date.now().toString());

        updateAnalyticsDisplay();
    } catch (err) {
        console.error('Load analytics error:', err);
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
