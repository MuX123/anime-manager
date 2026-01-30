/**
 * ACG 收藏庫 - 真實統計系統
 * 實現準確的訪問次數、版面點擊、訪客數統計
 * 
 * 核心特性：
 * 1. 基於會話的準確統計
 * 2. 防重複訪客計數
 * 3. 實時數據更新
 * 4. 高效能查詢
 * 5. 安全的資料收集
 */

import { createClient } from '@supabase/supabase-js';

// ========================
// 配置
// ========================
const config = {
    sessionTimeout: 30 * 60 * 1000, // 30分鐘會話超時
    cleanupOldDays: 7, // 7天後清理舊資料
    maxRetries: 3,
    retryDelay: 1000
};

// ========================
// 設備工具函數
// ========================

/**
 * 生成設備指紋以進行去重
 * @param {string} userAgent 
 * @returns {string}
 */
function generateDeviceFingerprint(userAgent) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 簡單的指紋生成
    ctx.textBaseline = 'top';
    ctx.font = '12px Arial';
    ctx.fillText('Fingerprint', 2, 2);
    
    const dataURL = canvas.toDataURL();
    const cleanFingerprint = dataURL.replace(/data:image\/png;base64,/, '').substring(0, 16);
    
    return btoa(cleanFingerprint + navigator.userAgent).substring(0, 64);
}

/**
 * 獲取或創建訪客ID
 * @param {string} deviceId 
 * @returns {string}
 */
function getOrCreateVisitorId(deviceFingerprint) {
    let visitorId = localStorage.getItem('visitor_id');
    
    if (!visitorId) {
        visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitor_id', visitorId);
        console.log('👤 新訪客ID生成:', visitorId);
    }
    
    return visitorId;
}

/**
 * 獲取客戶端IP地址
 * @returns {Promise<string>}
 */
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.warn('⚠️ 無法獲取IP地址:', error);
        return 'unknown';
    }
}

/**
 * 獲取國家代碼
 * @param {string} ip 
 * @returns {Promise<string>}
 */
async function getCountryCode(ip) {
    try {
        const response = await fetch(`https://ipapi.co/json/${ip}`);
        const data = await response.json();
        return data.country_code || 'unknown';
    } catch (error) {
        console.warn('⚠️ 無法獲取國家代碼:', error);
        return 'unknown';
    }
}

/**
 * 安全地記錄頁面瀏覽
 * @param {string} sessionId 
 * @param {string} visitorId 
 * @param {string} pageUrl 
 * @param {string} pageTitle 
 * @param {string} referrer 
 * @param {string} userAgent 
 */
async function trackPageView(sessionId, visitorId, pageUrl, pageTitle, referrer, userAgent) {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        
        await supabase.from('page_views').insert({
            session_id: sessionId,
            visitor_id: visitorId,
            page_url: pageUrl,
            page_title: pageTitle,
            referrer: referrer,
            user_agent: userAgent,
            view_timestamp: new Date().toISOString()
        });
        
        console.log('📄 頁面瀏覽記錄:', pageUrl);
    } catch (error) {
        console.error('❌ 頁面瀏覽記錄失敗:', error);
    }
}

/**
 * 安全地記錄分類點擊
 * @param {string} sessionId 
 * @param {string} visitorId 
 * @param {string} category 
 * @param {string} pageUrl 
 */
async function trackCategoryClick(sessionId, visitorId, category, pageUrl) {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        
        await supabase.from('category_clicks').insert({
            session_id: sessionId,
            visitor_id: visitorId,
            category_name: category,
            click_timestamp: new Date().toISOString(),
            page_url: pageUrl
        });
        
        console.log('📂 分類點擊記錄:', category);
    } catch (error) {
        console.error('❌ 分類點擊記錄失敗:', error);
    }
}

/**
 * 創建或更新訪客會話
 * @param {string} visitorId 
 * @param {string} deviceFingerprint 
 * @param {string} userAgent 
 * @param {string} ipAddress 
 * @param {string} countryCode 
 * @returns {Promise<string>}
 */
async function createOrUpdateSession(visitorId, deviceFingerprint, userAgent, ipAddress, countryCode) {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        
        // 檢查是否已有活躍會話
        const { data: existingSession } = await supabase
            .from('visitor_sessions')
            .select('*')
            .eq('visitor_id', visitorId)
            .eq('device_fingerprint', deviceFingerprint)
            .gte('last_seen', new Date(Date.now() - config.sessionTimeout * 1000).toISOString())
            .order('last_seen', { ascending: false })
            .limit(1)
            .single();
        
        if (existingSession) {
            // 更新現有會話
            const { data: updatedSession } = await supabase
                .from('visitor_sessions')
                .update({
                    last_seen: new Date().toISOString(),
                    page_views: existingSession.page_views + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingSession.id)
                .single();
            
            console.log('🔄 會話更新:', updatedSession.id);
            return updatedSession.id;
        } else {
            // 創建新會話
            const { data: newSession } = await supabase
                .from('visitor_sessions')
                .insert({
                    visitor_id: visitorId,
                    first_seen: new Date().toISOString(),
                    last_seen: new Date().toISOString(),
                    session_duration: 0,
                    page_views: 1,
                    category_clicks: 0,
                    user_agent: userAgent,
                    ip_address: ipAddress,
                    country_code: countryCode,
                    device_fingerprint: deviceFingerprint,
                    is_unique_visitor: false
                })
                .select()
                .single();
            
            console.log('🆕 新會話創建:', newSession.id);
            return newSession.id;
        }
    } catch (error) {
        console.error('❌ 會話管理失敗:', error);
        throw error;
    }
}

/**
 * 更新實時統計數據
 * @param {string} statType 
 * @param {number} increment 
 */
async function updateRealTimeStats(statType, increment) {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        
        await supabase.rpc('increment_stat', {
            p_stat_type: statType,
            p_increment: increment
        });
        
        console.log(`📈 統計更新 ${statType}: +${increment}`);
    } catch (error) {
        console.error(`❌ 統計更新失敗 ${statType}:`, error);
    }
}

// ========================
// API 端點函數
// ========================

/**
 * 主要的統計追蹤函數
 * 自動處理訪客會話、頁面瀏覽、分類點擊
 */
export class RealTimeAnalytics {
    constructor() {
        this.sessionId = null;
        this.visitorId = null;
        this.isInitialized = false;
    }
    
    /**
     * 初始化統計系統
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('🚀 初始化真實統計系統...');
            
            // 獲取設備和訪客信息
            const deviceFingerprint = generateDeviceFingerprint(navigator.userAgent);
            const userAgent = navigator.userAgent;
            const ipAddress = await getClientIP();
            const countryCode = await getCountryCode(ipAddress);
            const visitorId = getOrCreateVisitorId(deviceFingerprint);
            
            // 創建或更新會話
            this.sessionId = await createOrUpdateSession(
                visitorId,
                deviceFingerprint,
                userAgent,
                ipAddress,
                countryCode
            );
            
            this.visitorId = visitorId;
            this.isInitialized = true;
            
            console.log('✅ 統計系統初始化完成');
            console.log(`📊 訪客ID: ${visitorId}`);
            console.log(`📊 設備ID: ${this.sessionId}`);
            
            return this.sessionId;
        } catch (error) {
            console.error('❌ 統計系統初始化失敗:', error);
            throw error;
        }
    }
    
    /**
     * 追蹤頁面瀏覽
     * @param {string} pageTitle 
     * @param {string} referrer 
     */
    async trackPageView(pageTitle, referrer) {
        if (!this.isInitialized) {
            console.warn('⚠️ 統計系統未初始化');
            return;
        }
        
        await trackPageView(
            this.sessionId,
            this.visitorId,
            window.location.href,
            pageTitle || document.title,
            referrer || document.referrer,
            navigator.userAgent
        );
        
        // 更新統計
        await updateRealTimeStats('total_visits', 1);
        console.log('📄 頁面瀏覽已記錄');
    }
    
    /**
     * 追蹤分類點擊
     * @param {string} category 
     */
    async trackCategoryClick(category) {
        if (!this.isInitialized) {
            console.warn('⚠️ 統計系統未初始化');
            return;
        }
        
        await trackCategoryClick(
            this.sessionId,
            this.visitorId,
            category,
            window.location.href
        );
        
        // 更新統計
        await updateRealTimeStats('total_clicks', 1);
        console.log(`📂 分類點擊已記錄: ${category}`);
    }
    
    /**
     * 獲取實時統計數據
     * @returns {Promise<Object>}
     */
    async getRealTimeStats() {
        if (!this.isInitialized) {
            console.warn('⚠️ 統計系統未初始化');
            return {};
        }
        
        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );
            
            const { data: stats } = await supabase
                .from('real_time_stats')
                .select('*')
                .in('stat_type', ['total_visits', 'total_clicks', 'unique_visitors'])
                .order('recorded_at', { ascending: false });
            
            const statsObject = {};
            stats.forEach(stat => {
                statsObject[stat.stat_type] = stat.stat_value;
            });
            
            console.log('📊 實時統計:', statsObject);
            return statsObject;
        } catch (error) {
            console.error('❌ 獲取統計失敗:', error);
            return {};
        }
    }
    
    /**
     * 獲取每日統計
     * @param {number} days 
     * @returns {Promise<Array>}
     */
    async getDailyStats(days = 7) {
        if (!this.isInitialized) {
            console.warn('⚠️ 統計系統未初始化');
            return [];
        }
        
        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );
            
            const { data: stats } = await supabase
                .from('daily_stats')
                .select('*')
                .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
                .order('date', { ascending: false })
                .limit(days);
            
            console.log(`📊 過去${days}天統計:`, stats);
            return stats;
        } catch (error) {
            console.error('❌ 獲取每日統計失敗:', error);
            return [];
        }
    }
    
    /**
     * 獲取活躍用戶數
     * @returns {Promise<number>}
     */
    async getActiveUsersCount() {
        if (!this.isInitialized) {
            console.warn('⚠️ 統計系統未初始化');
            return 0;
        }
        
        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );
            
            const { count } = await supabase
                .from('active_sessions')
                .select('id', { count: 'exact', head: true });
            
            console.log('📊 當前活躍用戶:', count);
            return count || 0;
        } catch (error) {
            console.error('❌ 獲取活躍用戶失敗:', error);
            return 0;
        }
    }
}

// ========================
// UI 更新模組
// ========================

/**
 * 高效能的 UI 更新類
 * 使用防抖和虛擬 DOM 來提升性能
 */
class AnalyticsUI {
    constructor() {
        this.container = null;
        this.updateScheduled = false;
        this.lastState = null;
        this.virtualContainer = document.createElement('div');
        this.virtualContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            font-family: 'Orbitron', monospace;
            font-size: 10px;
        `;
        document.body.appendChild(this.virtualContainer);
    }
    
    /**
     * 初始化 UI 組件
     */
    initialize() {
        this.container = document.getElementById('analytics-display');
        if (!this.container) {
            console.warn('⚠️ analytics-display 元素未找到');
            return;
        }
    }
    
    /**
     * 更新統計顯示
     * @param {Object} stats 
     */
    updateDisplay(stats) {
        if (!this.container) return;
        
        const newState = {
            totalVisits: stats.totalVisits || 0,
            totalClicks: stats.totalClicks || 0,
            uniqueVisitors: stats.uniqueVisitors || 0
        };
        
        // 檢查狀態是否變化
        const stateChanged = !this.lastState || 
            this.lastState.totalVisits !== newState.totalVisits ||
            this.lastState.totalClicks !== newState.totalClicks ||
            this.lastState.uniqueVisitors !== newState.uniqueVisitors;
        
        if (!stateChanged && !this.updateScheduled) {
            return;
        }
        
        // 使用虛擬 DOM 進行更新
        this.updateVirtualDisplay(newState);
        
        // 防抖更新到真實 DOM
        this.scheduleRealDOMUpdate(newState);
    }
    
    /**
     * 更新虛擬顯示
     * @param {Object} state 
     */
    updateVirtualDisplay(state) {
        const html = `
            <div style="display: flex; gap: 8px; align-items: center;">
                <!-- 訪問次數 -->
                <div style="background: rgba(0,212,255,0.1); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(0,212,255,0.2); display: flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M15 3L19 8L5 21L1 21L1 17L15 3Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11 7L17 13" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span style="font-size: 10px; color: #ffffff; font-weight: bold;">${state.totalVisits.toLocaleString()}</span>
                </div>
                
                <!-- 版面點擊 -->
                <div style="background: rgba(0,212,255,0.1); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(0,212,255,0.2); display: flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M15 3L19 8L10 17L5 17L5 12L15 3Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M19 8L15 3" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span style="font-size: 10px; color: #ffffff; font-weight: bold;">${state.totalClicks.toLocaleString()}</span>
                </div>
                
                <!-- 訪客數 -->
                <div style="background: rgba(0,212,255,0.1); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(0,212,255,0.2); display: flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span style="font-size: 10px; color: #ffffff; font-weight: bold;">${state.uniqueVisitors.toLocaleString()}</span>
                </div>
            </div>
        `;
        
        this.virtualContainer.innerHTML = html;
        
        // 淡入顯示
        this.virtualContainer.style.opacity = '1';
        
        setTimeout(() => {
            this.syncWithRealDOM();
        }, 50);
    }
    
    /**
     * 安排真實 DOM 更新
     * @param {Object} state 
     */
    scheduleRealDOMUpdate(state) {
        if (this.updateScheduled) return;
        
        this.updateScheduled = true;
        this.lastState = { ...state };
        
        requestAnimationFrame(() => {
            if (!this.container) return;
            
            const visitsEl = this.container.children[0]?.querySelector('span');
            const clicksEl = this.container.children[1]?.querySelector('span');
            const visitorsEl = this.container.children[2]?.querySelector('span');
            
            if (visitsEl) visitsEl.textContent = state.totalVisits.toLocaleString();
            if (clicksEl) clicksEl.textContent = state.totalClicks.toLocaleString();
            if (visitorsEl) visitorsEl.textContent = state.uniqueVisitors.toLocaleString();
            
            this.updateScheduled = false;
            console.log('📊 DOM 更新完成:', state);
        });
    }
    
    /**
     * 同步虛擬和真實 DOM
     */
    syncWithRealDOM() {
        if (!this.container) return;
        
        const realHTML = this.container.innerHTML;
        const virtualHTML = this.virtualContainer.innerHTML;
        
        if (realHTML === virtualHTML) {
            this.virtualContainer.style.opacity = '0';
            return;
        }
        
        this.container.innerHTML = virtualHTML;
        
        // 確保 DOM 更新完成後才隱藏虛擬元素
        setTimeout(() => {
            this.virtualContainer.style.opacity = '0';
        }, 300);
    }
    
    /**
     * 銷毀 UI 組件
     */
    destroy() {
        if (this.virtualContainer) {
            this.virtualContainer.remove();
        }
        this.container = null;
        this.updateScheduled = false;
        this.lastState = null;
    }
}

// ========================
// 主要統計系統導出
// ========================

export const analytics = new RealTimeAnalytics();
export const analyticsUI = new AnalyticsUI();

// 全局初始化函數
window.initializeAnalytics = async () => {
    try {
        await analytics.initialize();
        analyticsUI.initialize();
        
        // 立即獲取並顯示最新統計
        const stats = await analytics.getRealTimeStats();
        analyticsUI.updateDisplay(stats);
        
        // 設置定期更新
        setInterval(async () => {
            const latestStats = await analytics.getRealTimeStats();
            analyticsUI.updateDisplay(latestStats);
        }, 5000); // 每5秒更新一次
        
        console.log('✅ 真實統計系統已啟動');
    } catch (error) {
        console.error('❌ 統計系統啟動失敗:', error);
    }
};

// 自動初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeAnalytics);
} else {
    window.initializeAnalytics();
}