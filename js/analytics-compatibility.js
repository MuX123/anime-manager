/**
 * ACG 收藏庫 - Analytics 兼容性層
 * 解決舊版 analytics.js 與新版 real-time-analytics.js 之間的衝突
 * 提供統一的接口，自動檢測並使用適當的數據庫表結構
 */

import { createClient } from '@supabase/supabase-js';

class AnalyticsCompatibility {
    constructor() {
        this.schemaType = null;
        this.client = null;
        this.isInitialized = false;
    }

    /**
     * 初始化並檢測數據庫結構
     */
    async initialize() {
        if (this.isInitialized) return this.schemaType;

        try {
            this.client = this.getClient();
            this.schemaType = await this.detectSchema();
            this.isInitialized = true;
            
            console.log(`🔍 Analytics Schema detected: ${this.schemaType}`);
            return this.schemaType;
        } catch (error) {
            console.error('❌ Analytics compatibility init failed:', error);
            return 'ERROR';
        }
    }

    /**
     * 獲取 Supabase 客戶端
     */
    getClient() {
        if (window.supabaseManager && window.supabaseManager.isConnectionReady()) {
            return window.supabaseManager.getClient();
        } else if (window.supabaseClient) {
            return window.supabaseClient;
        } else {
            return createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );
        }
    }

    /**
     * 檢測數據庫結構類型
     */
    async detectSchema() {
        try {
            // 檢查新版 schema 的表是否存在
            const { data: visitorSessions, error: newError } = await this.client
                .from('visitor_sessions')
                .select('session_id', { count: 'exact', head: true })
                .limit(1);

            if (!newError) {
                return 'NEW_SESSION_SCHEMA';
            }

            // 檢查舊版 schema 的表是否存在
            const { data: siteAnalytics, error: oldError } = await this.client
                .from('site_analytics')
                .select('event_type', { count: 'exact', head: true })
                .limit(1);

            if (!oldError) {
                return 'OLD_ANALYTICS_SCHEMA';
            }

            return 'UNKNOWN';
        } catch (error) {
            console.warn('Schema detection failed:', error);
            return 'UNKNOWN';
        }
    }

    /**
     * 統一的頁面瀏覽追蹤接口
     */
    async trackPageView(visitorId, pageUrl, pageTitle, referrer, userAgent) {
        await this.initialize();

        if (this.schemaType === 'NEW_SESSION_SCHEMA') {
            return this.trackPageViewNew(visitorId, pageUrl, pageTitle, referrer, userAgent);
        } else if (this.schemaType === 'OLD_ANALYTICS_SCHEMA') {
            return this.trackPageViewOld(visitorId, pageUrl, pageTitle, referrer, userAgent);
        } else {
            console.warn('⚠️ Unknown schema, skipping page view tracking');
            return null;
        }
    }

    /**
     * 新版頁面瀏覽追蹤（使用 session_id）
     */
    async trackPageViewNew(visitorId, pageUrl, pageTitle, referrer, userAgent) {
        try {
            // 獲取或創建 session
            const sessionId = await this.getOrCreateSession(visitorId, userAgent);
            
            if (sessionId) {
                await this.client.from('page_views').insert({
                    session_id: sessionId,
                    visitor_id: visitorId,
                    page_url: pageUrl,
                    page_title: pageTitle,
                    referrer: referrer,
                    view_timestamp: new Date().toISOString()
                });
                
                console.log('📄 New schema page view tracked:', sessionId);
            }
        } catch (error) {
            console.error('❌ New schema page view tracking failed:', error);
        }
    }

    /**
     * 舊版頁面瀏覽追蹤（使用 site_analytics）
     */
    async trackPageViewOld(visitorId, pageUrl, pageTitle, referrer, userAgent) {
        try {
            await this.client.from('site_analytics').insert({
                visitor_id: visitorId,
                event_type: 'page_view',
                page_url: pageUrl,
                page_title: pageTitle,
                referrer: referrer,
                timestamp: new Date().toISOString()
            });
            
            console.log('📄 Old schema page view tracked');
        } catch (error) {
            console.error('❌ Old schema page view tracking failed:', error);
        }
    }

    /**
     * 統一的分類點擊追蹤接口
     */
    async trackCategoryClick(visitorId, category, pageUrl) {
        await this.initialize();

        if (this.schemaType === 'NEW_SESSION_SCHEMA') {
            return this.trackCategoryClickNew(visitorId, category, pageUrl);
        } else if (this.schemaType === 'OLD_ANALYTICS_SCHEMA') {
            return this.trackCategoryClickOld(visitorId, category, pageUrl);
        } else {
            console.warn('⚠️ Unknown schema, skipping category click tracking');
            return null;
        }
    }

    /**
     * 新版分類點擊追蹤（使用 session_id）
     */
    async trackCategoryClickNew(visitorId, category, pageUrl) {
        try {
            // 獲取或創建 session
            const sessionId = await this.getOrCreateSession(visitorId);
            
            if (sessionId) {
                await this.client.from('category_clicks').insert({
                    session_id: sessionId,
                    visitor_id: visitorId,
                    category_name: category,
                    click_timestamp: new Date().toISOString(),
                    page_url: pageUrl
                });
                
                console.log('📂 New schema category click tracked:', category);
            }
        } catch (error) {
            console.error('❌ New schema category click tracking failed:', error);
        }
    }

    /**
     * 舊版分類點擊追蹤（使用 site_analytics）
     */
    async trackCategoryClickOld(visitorId, category, pageUrl) {
        try {
            await this.client.from('site_analytics').insert({
                visitor_id: visitorId,
                event_type: 'category_click',
                page_url: pageUrl,
                event_data: { category: category },
                timestamp: new Date().toISOString()
            });
            
            console.log('📂 Old schema category click tracked:', category);
        } catch (error) {
            console.error('❌ Old schema category click tracking failed:', error);
        }
    }

    /**
     * 獲取或創建訪客會話（新版 schema）
     */
    async getOrCreateSession(visitorId, userAgent = null) {
        try {
            const deviceFingerprint = this.generateDeviceFingerprint(userAgent || navigator.userAgent);
            
            // 檢查是否已有活躍會話
            const { data: existingSession } = await this.client
                .from('visitor_sessions')
                .select('*')
                .eq('visitor_id', visitorId)
                .eq('device_fingerprint', deviceFingerprint)
                .gte('last_seen', new Date(Date.now() - 30 * 60 * 1000).toISOString())
                .order('last_seen', { ascending: false })
                .limit(1)
                .single();

            if (existingSession) {
                // 更新現有會話
                await this.client
                    .from('visitor_sessions')
                    .update({
                        last_seen: new Date().toISOString(),
                        page_views: existingSession.page_views + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('session_id', existingSession.session_id);
                
                return existingSession.session_id;
            } else {
                // 創建新會話
                const { data: newSession } = await this.client
                    .from('visitor_sessions')
                    .insert({
                        visitor_id: visitorId,
                        device_fingerprint: deviceFingerprint,
                        user_agent: userAgent || navigator.userAgent,
                        page_views: 1,
                        category_clicks: 0
                    })
                    .select()
                    .single();

                return newSession?.session_id;
            }
        } catch (error) {
            console.error('❌ Session management failed:', error);
            return null;
        }
    }

    /**
     * 生成設備指紋
     */
    generateDeviceFingerprint(userAgent) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        ctx.textBaseline = 'top';
        ctx.font = '12px Arial';
        ctx.fillText('Fingerprint', 2, 2);
        
        const dataURL = canvas.toDataURL();
        const cleanFingerprint = dataURL.replace(/data:image\/png;base64,/, '').substring(0, 16);
        
        return btoa(cleanFingerprint + userAgent).substring(0, 64);
    }

    /**
     * 統一的統計數據獲取接口
     */
    async getStats() {
        await this.initialize();

        if (this.schemaType === 'NEW_SESSION_SCHEMA') {
            return this.getStatsNew();
        } else if (this.schemaType === 'OLD_ANALYTICS_SCHEMA') {
            return this.getStatsOld();
        } else {
            return { totalVisits: 0, totalClicks: 0, uniqueVisitors: 0 };
        }
    }

    /**
     * 新版統計數據獲取
     */
    async getStatsNew() {
        try {
            const { data: stats } = await this.client
                .from('real_time_stats')
                .select('*')
                .in('stat_type', ['total_visits', 'total_clicks', 'unique_visitors'])
                .order('recorded_at', { ascending: false });

            const statsObject = { totalVisits: 0, totalClicks: 0, uniqueVisitors: 0 };
            stats.forEach(stat => {
                if (stat.stat_type === 'total_visits') statsObject.totalVisits = stat.stat_value;
                if (stat.stat_type === 'total_clicks') statsObject.totalClicks = stat.stat_value;
                if (stat.stat_type === 'unique_visitors') statsObject.uniqueVisitors = stat.stat_value;
            });

            return statsObject;
        } catch (error) {
            console.error('❌ New schema stats fetch failed:', error);
            return { totalVisits: 0, totalClicks: 0, uniqueVisitors: 0 };
        }
    }

    /**
     * 舊版統計數據獲取
     */
    async getStatsOld() {
        try {
            // 獲取總訪問次數
            const { count: visitsCount } = await this.client
                .from('site_analytics')
                .select('*', { count: 'exact', head: true })
                .eq('event_type', 'page_view');

            // 獲取總點擊次數
            const { count: clicksCount } = await this.client
                .from('site_analytics')
                .select('*', { count: 'exact', head: true })
                .eq('event_type', 'category_click');

            // 獲取唯一訪客數
            const { count: visitorsCount } = await this.client
                .from('site_visitors')
                .select('*', { count: 'exact', head: true });

            return {
                totalVisits: visitsCount || 0,
                totalClicks: clicksCount || 0,
                uniqueVisitors: visitorsCount || 0
            };
        } catch (error) {
            console.error('❌ Old schema stats fetch failed:', error);
            return { totalVisits: 0, totalClicks: 0, uniqueVisitors: 0 };
        }
    }
}

// 創建全局實例
export const analyticsCompatibility = new AnalyticsCompatibility();

// 提供全局兼容性函數供現有代碼使用
window.trackPageView = async (visitorId, pageUrl, pageTitle, referrer, userAgent) => {
    await analyticsCompatibility.trackPageView(visitorId, pageUrl, pageTitle, referrer, userAgent);
};

window.trackCategoryClick = async (visitorId, category, pageUrl) => {
    await analyticsCompatibility.trackCategoryClick(visitorId, category, pageUrl);
};

window.getAnalyticsStats = async () => {
    return await analyticsCompatibility.getStats();
};

// 向後兼容：支持現有的函數調用
if (typeof window.trackVisit === 'undefined') {
    window.trackVisit = async function() {
        const visitorId = localStorage.getItem('visitor_id') || 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await window.trackPageView(visitorId, window.location.href, document.title, document.referrer, navigator.userAgent);
    };
}

console.log('🔧 Analytics compatibility layer loaded');