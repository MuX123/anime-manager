/**
 * 安全配置管理模組
 * 處理環境變數和敏感配置
 * @version 1.0.0
 * @author ACG Manager Security Team
 */

class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
    }

    /**
     * 載入配置信息
     * @returns {Object} 配置對象
     */
    loadConfig() {
        return {
            supabase: {
                url: this.getEnvVar('SUPABASE_URL', 'https://twgydqknzdyahgfuamak.supabase.co'),
                anonKey: this.getEnvVar('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z3lkcWtuemR5YWhnZnVhbWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA5MTEsImV4cCI6MjA4NDMzNjkxMX0.0YizCZP2OglEQQIh96x8viaemR6reZs8zendNT9KS7c')
            },
            security: {
                cspEnabled: this.getEnvVar('CSP_ENABLED', 'true') === 'true',
                sessionSecret: this.getEnvVar('SESSION_SECRET', this.generateSecret())
            },
            app: {
                version: '6.1.0',
                environment: this.getEnvVar('NODE_ENV', 'development'),
                debug: this.getEnvVar('DEBUG', 'true') === 'true'
            }
        };
    }

    /**
     * 安全地獲取環境變數
     * @param {string} key 環境變數鍵名
     * @param {string} defaultValue 預設值
     * @returns {string} 環境變數值
     */
    getEnvVar(key, defaultValue = '') {
        // 在瀏覽器環境中，我們無法直接訪問環境變數
        // 這裡提供一個安全的預設配置機制
        if (typeof window !== 'undefined') {
            return this.getBrowserConfig(key, defaultValue);
        }
        
        // Node.js 環境
        if (typeof process !== 'undefined' && process.env) {
            return process.env[key] || defaultValue;
        }
        
        return defaultValue;
    }

    /**
     * 瀏覽器環境配置獲取
     * @param {string} key 配置鍵名
     * @param {string} defaultValue 預設值
     * @returns {string} 配置值
     */
    getBrowserConfig(key, defaultValue) {
        // 從安全的全局配置中獲取
        if (window.__ACG_CONFIG__ && window.__ACG_CONFIG__[key]) {
            return window.__ACG_CONFIG__[key];
        }
        
        // 從 localStorage 獲取（僅限非敏感配置）
        if (this.isNonSensitiveConfig(key)) {
            return localStorage.getItem(`acg_config_${key}`) || defaultValue;
        }
        
        return defaultValue;
    }

    /**
     * 檢查是否為非敏感配置
     * @param {string} key 配置鍵名
     * @returns {boolean} 是否為非敏感配置
     */
    isNonSensitiveConfig(key) {
        const nonSensitiveKeys = ['NODE_ENV', 'DEBUG', 'CSP_ENABLED'];
        return nonSensitiveKeys.includes(key);
    }

    /**
     * 生成安全的隨機密鑰
     * @param {number} length 密鑰長度
     * @returns {string} 隨機密鑰
     */
    generateSecret(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 驗證配置完整性
     * @returns {Object} 驗證結果
     */
    validateConfig() {
        const errors = [];
        const warnings = [];

        // 檢查必需的 Supabase 配置
        if (!this.config.supabase.url) {
            errors.push('Supabase URL 未配置');
        }
        
        if (!this.config.supabase.anonKey) {
            errors.push('Supabase Anonymous Key 未配置');
        }

        // 檢查 URL 格式
        if (this.config.supabase.url && !this.isValidUrl(this.config.supabase.url)) {
            errors.push('Supabase URL 格式無效');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 驗證 URL 格式
     * @param {string} url URL 字符串
     * @returns {boolean} 是否為有效 URL
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 獲取 Supabase 客戶端配置
     * @returns {Object} Supabase 配置
     */
    getSupabaseConfig() {
        return this.config.supabase;
    }

    /**
     * 獲取安全配置
     * @returns {Object} 安全配置
     */
    getSecurityConfig() {
        return this.config.security;
    }

    /**
     * 獲取應用配置
     * @returns {Object} 應用配置
     */
    getAppConfig() {
        return this.config.app;
    }
}

// 創建全局配置實例
window.configManager = new ConfigManager();

// 導出配置管理器（支援模組化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}

// 自動驗證配置
document.addEventListener('DOMContentLoaded', () => {
    const validation = window.configManager.validateConfig();
    if (!validation.isValid) {
        console.error('🚨 配置驗證失敗:', validation.errors);
        if (window.configManager.getAppConfig().debug) {
            alert('配置驗證失敗，請檢查控制台獲取詳細信息');
        }
    } else {
        console.log('✅ 配置驗證通過');
    }
});