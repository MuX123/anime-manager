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
            await supabaseClient
                .from('site_analytics')
                .update({
                    last_visit: new Date().toISOString(),
                    visit_count: existing.visit_count + 1
                })
                .eq('visitor_id', visitorId);
        } else {
            await supabaseClient
                .from('site_analytics')
                .insert([{ visitor_id: visitorId }]);
        }

        await supabaseClient
            .from('page_views')
            .insert([{ visitor_id: visitorId }]);

        await loadAnalytics();
    } catch (err) {
        console.error('Track visit error:', err);
    }
}

async function loadAnalytics() {
    try {
        const [viewsResult, visitorsResult] = await Promise.all([
            supabaseClient.from('page_views').select('id', { count: 'exact', head: true }),
            supabaseClient.from('site_analytics').select('id', { count: 'exact', head: true })
        ]);

        analyticsData.totalViews = viewsResult.count || 0;
        analyticsData.uniqueVisitors = visitorsResult.count || 0;

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
