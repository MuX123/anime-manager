/**
 * 安全配置管理模組 v8.0.0
 * 處理環境變數和敏感配置
 * @version 8.0.0
 * @author ACG Manager Security Team
 * @date 2026-02-10
 */

class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
        this.isProduction = this.detectEnvironment();
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 生產環境禁用除錯
        if (this.isProduction) {
            this.disableDebugInProduction();
        }
    }

    /**
     * 檢測當前環境
     * @returns {boolean} 是否為生產環境
     */
    detectEnvironment() {
        // 檢查 HOSTNAME
        const hostname = window.location.hostname;
        if (hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.includes('localhost') ||
            hostname.includes('127.0.0.1')) {
            return false;
        }

        // 檢查環境變數
        const env = this.getEnvVar('NODE_ENV', '');
        if (env.toLowerCase() === 'production') {
            return true;
        }

        // GitHub Pages 或其他 .io 域名視為生產環境
        if (hostname.includes('github.io') || hostname.includes('.io')) {
            return true;
        }

        return false;
    }

    /**
     * 載入配置信息
     * @returns {Object} 配置對象
     */
    loadConfig() {
        return {
            supabase: {
                url: this.getEnvVar('SUPABASE_URL', ''),
                anonKey: this.getEnvVar('SUPABASE_ANON_KEY', '')
            },
            security: {
                cspEnabled: this.getEnvVar('CSP_ENABLED', 'true') === 'true',
                sessionSecret: this.generateSecret()
            },
            app: {
                version: '8.0.0',
                environment: this.isProduction ? 'production' : 'development',
                debug: this.getEnvVar('DEBUG', this.isProduction ? 'false' : 'true') === 'true'
            }
        };
    }

    /**
     * 生產環境禁用除錯
     */
    disableDebugInProduction() {
        if (this.isProduction) {
            // 覆蓋 console 方法
            const originalConsole = {
                log: console.log,
                warn: console.warn,
                error: console.error,
                info: console.info
            };

            console.log = (...args) => {
                // 只記錄關鍵資訊
                if (args[0] && typeof args[0] === 'string' && args[0].includes('✅')) {
                    originalConsole.log.apply(console, args);
                }
            };

            console.warn = (...args) => {
                // 警告在生產環境靜默
            };

            console.error = (...args) => {
                // 保留錯誤日誌以便排查問題
                // 只抑制常見的非關鍵錯誤
                if (args[0] && typeof args[0] === 'string') {
                    const suppressedPatterns = ['ResizeObserver', 'favicon'];
                    const shouldSuppress = suppressedPatterns.some(pattern => args[0].includes(pattern));
                    if (!shouldSuppress) {
                        originalConsole.error.apply(console, args);
                    }
                }
            };

            console.info = () => { }; // 完全靜默

            // 移除全局錯誤處理中的詳細輸出
            window.onerror = function (message, source, lineno, colno, error) {
                // 不要呼叫 console.error，避免無限迴圈
                return true; // 阻止預設錯誤處理
            };
        }
    }

    /**
     * 安全地獲取環境變數
     * @param {string} key 
     * @param {string} defaultValue 
     * @returns {string}
     */
    getEnvVar(key, defaultValue = '') {
        if (typeof window !== 'undefined') {
            return this.getBrowserConfig(key, defaultValue);
        }

        if (typeof process !== 'undefined' && process.env) {
            return process.env[key] || defaultValue;
        }

        return defaultValue;
    }

    /**
     * 瀏覽器環境配置獲取
     * @param {string} key 
     * @param {string} defaultValue 
     * @returns {string}
     */
    getBrowserConfig(key, defaultValue) {
        // 從安全的全局配置中獲取
        if (window.__ACG_CONFIG__ && window.__ACG_CONFIG__[key]) {
            return window.__ACG_CONFIG__[key];
        }

        // 從 localStorage 獲取（非敏感配置）
        if (this.isNonSensitiveConfig(key)) {
            return localStorage.getItem(`acg_config_${key}`) || defaultValue;
        }

        return defaultValue;
    }

    /**
     * 檢查是否為非敏感配置
     * @param {string} key 
     * @returns {boolean}
     */
    isNonSensitiveConfig(key) {
        const nonSensitiveKeys = [
            'NODE_ENV',
            'DEBUG',
            'CSP_ENABLED',
            'app_version'
        ];
        return nonSensitiveKeys.includes(key);
    }

    /**
     * 生成安全的隨機密鑰
     * @param {number} length 
     * @returns {string}
     */
    generateSecret(length = 32) {
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const array = new Uint8Array(length);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }

        // 回退方案
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 驗證配置完整性
     * @returns {Object}
     */
    validateConfig() {
        const errors = [];
        const warnings = [];

        // 檢查 Supabase URL
        if (!this.config.supabase.url) {
            errors.push('Supabase URL 未配置');
        } else if (!this.isValidUrl(this.config.supabase.url)) {
            errors.push('Supabase URL 格式無效');
        }

        // 檢查環境
        if (!this.isProduction) {
            warnings.push('應用於開發模式');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            environment: this.config.app.environment
        };
    }

    /**
     * 驗證 URL 格式
     * @param {string} url 
     * @returns {boolean}
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
     * 獲取 Supabase 配置
     * @returns {Object}
     */
    getSupabaseConfig() {
        return {
            url: this.config.supabase.url,
            anonKey: this.config.supabase.anonKey,
            isSecure: this.isProduction
        };
    }

    /**
     * 獲取安全配置
     * @returns {Object}
     */
    getSecurityConfig() {
        return {
            cspEnabled: this.config.security.cspEnabled,
            environment: this.config.app.environment,
            isProduction: this.isProduction
        };
    }

    /**
     * 獲取 CSP 配置
     * @returns {Object} CSP 配置對象
     */
    getCSPConfig() {
        const cspRules = {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://*.supabase.co', 'https://*.google-analytics.com'],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"]
        };

        return {
            enabled: this.config.security.cspEnabled,
            rules: cspRules,
            reportOnly: !this.isProduction // 生產環境強制啟用
        };
    }

    /**
     * 生成 CSP 頭部字串
     * @returns {string} CSP 頭部字串
     */
    getCSPHeader() {
        const config = this.getCSPConfig();
        if (!config.enabled) return '';

        const directives = Object.entries(config.rules)
            .map(([key, values]) => `${key} ${values.join(' ')}`)
            .join('; ');

        return directives;
    }

    /**
     * 獲取應用配置
     * @returns {Object}
     */
    getAppConfig() {
        return {
            version: this.config.app.version,
            environment: this.config.app.environment,
            debug: this.config.app.debug && !this.isProduction
        };
    }

    /**
     * 獲取完整配置狀態
     * @returns {Object}
     */
    getStatus() {
        return {
            isValid: this.validateConfig().isValid,
            isProduction: this.isProduction,
            debugEnabled: this.config.app.debug && !this.isProduction,
            timestamp: new Date().toISOString()
        };
    }
}

// 創建全域實例
window.configManager = new ConfigManager();

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}

// 記錄配置狀態（非敏感）
document.addEventListener('DOMContentLoaded', () => {
    const status = window.configManager.getStatus();
    if (status.debugEnabled) {
        console.log('🔧 開發模式已啟用');
    } else if (status.isProduction) {
        console.log('🛡️ 生產模式 - 安全性已強化');
    }
});
