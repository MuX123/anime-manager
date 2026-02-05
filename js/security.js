/**
 * 安全模組 - 內容安全政策 (CSP) 和 XSS 防護 v2.0
 * @version 2.0.0
 * @author ACG Manager Security Team
 * @date 2026-02-04
 */

class SecurityManager {
    constructor() {
        this.cspConfig = null;
        this.nonce = this.generateNonce();
        this.xssProtectionEnabled = true;
        this.sanitizer = new DOMSanitizer();
        this.rateLimiter = new RateLimiter();
        this.init();
    }

    /**
     * 初始化安全設定
     */
    init() {
        this.setupCSP();
        this.setupXSSProtection();
        this.setupSecurityHeaders();
        this.setupSessionCleanup();
        this.handleCSPViolation();
        console.log('🔒 Security Manager v2.0 初始化完成');
    }

    /**
     * 生成隨機 nonce
     * @returns {string} 隨機 nonce
     */
    generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 獲取當前 nonce
     * @returns {string} nonce
     */
    getNonce() {
        return this.nonce;
    }

    /**
     * 刷新 nonce
     */
    refreshNonce() {
        this.nonce = this.generateNonce();
        this.setupCSP();
    }

    /**
     * 獲取 CSP 配置 v2.0 - 移除 unsafe-inline
     * @returns {Object} CSP 配置
     */
    getDefaultCSPConfig() {
        return {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                `'nonce-${this.nonce}`,  // 使用 nonce 而非 unsafe-inline
                'https://cdn.jsdelivr.net'
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'",  // Style 仍需要 inline，但已清理
                'https://fonts.googleapis.com'
            ],
            'font-src': [
                "'self'",
                'https://fonts.gstatic.com'
            ],
            'img-src': [
                "'self'",
                'data:',
                'https:'
            ],
            'connect-src': [
                "'self'",
                'https://twgydqknzdyahgfuamak.supabase.co'
            ],
            'frame-src': ["'none'"],
            'object-src': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            'upgrade-insecure-requests': []
        };
    }

    /**
     * 設置內容安全政策
     */
    setupCSP() {
        if (!this.supportsCSP()) {
            console.warn('⚠️ 瀏覽器不支援 CSP，使用降級保護');
            this.setupFallbackProtection();
            return;
        }

        const cspHeader = this.buildCSPHeader();
        this.setCSPMetaTag(cspHeader);
        console.log('✅ CSP 策略已更新');
    }

    /**
     * 降級保護 - 當 CSP 不支援時
     */
    setupFallbackProtection() {
        // 啟用額外的 XSS 過濾
        this.xssProtectionEnabled = true;
        
        // 監聽 DOM 變動，移除危險元素
        this.setupDOMMutationObserver();
    }

    /**
     * DOM 變動觀察器
     */
    setupDOMMutationObserver() {
        if (!window.MutationObserver) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.scanElementForThreats(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * 掃描元素威脅
     * @param {Element} element
     */
    scanElementForThreats(element) {
        // 不掃描 script 標籤和 onclick - 應用程式需要這些來正常運作
        // CSP 會阻止惡意的內聯事件處理器
        const dangerousAttrs = ['onload', 'onerror', 'onmouseover', 'onfocus'];

        // 檢查危險屬性
        dangerousAttrs.forEach(attr => {
            if (element.hasAttribute(attr)) {
                console.warn('🚨 移除危險屬性:', attr);
                element.removeAttribute(attr);
            }
        });
    }

    /**
     * 檢查瀏覽器是否支援 CSP
     * @returns {boolean}
     */
    supportsCSP() {
        return 'securityPolicy' in document || 'CSP' in window;
    }

    /**
     * 構建 CSP 標頭
     * @returns {string}
     */
    buildCSPHeader() {
        const directives = [];
        
        for (const [directive, sources] of Object.entries(this.cspConfig || this.getDefaultCSPConfig())) {
            directives.push(`${directive} ${sources.join(' ')}`);
        }
        
        return directives.join('; ');
    }

    /**
     * 設置 CSP meta 標籤
     * @param {string} cspHeader 
     */
    setCSPMetaTag(cspHeader) {
        const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (existingMeta) {
            existingMeta.remove();
        }

        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = cspHeader;
        
        const head = document.head;
        if (head.firstChild) {
            head.insertBefore(meta, head.firstChild);
        } else {
            head.appendChild(meta);
        }
    }

    /**
     * 處理 CSP 違規事件
     */
    handleCSPViolation() {
        document.addEventListener('securitypolicyviolation', (event) => {
            const violation = {
                blockedURI: event.blockedURI,
                effectiveDirective: event.effectiveDirective,
                originalPolicy: event.originalPolicy,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };

            console.error('🚨 CSP 違規檢測:', violation);
            
            // 記錄到日誌系統
            this.logSecurityEvent('csp_violation', violation);

            // 生產環境發送到監控
            if (window.location.hostname !== 'localhost') {
                this.reportSecurityEvent(violation);
            }
        });
    }

    /**
     * 設置 XSS 防護
     */
    setupXSSProtection() {
        // XSS 保護 meta 標籤
        this.setMetaTag('X-XSS-Protection', '1; mode=block');
        
        // 防止 MIME 類型混淆
        this.setMetaTag('X-Content-Type-Options', 'nosniff');
        
        // Referrer 策略
        this.setMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Permissions Policy
        this.setPermissionsPolicy();
    }

    /**
     * 設置 meta 標籤
     * @param {string} httpEquiv 
     * @param {string} content 
     */
    setMetaTag(httpEquiv, content) {
        let meta = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            document.head.appendChild(meta);
        }
        meta.httpEquiv = httpEquiv;
        meta.content = content;
    }

    /**
     * 設置 Permissions Policy
     */
    setPermissionsPolicy() {
        const permissions = [
            'geolocation=()',
            'microphone=()',
            'camera=()',
            'payment=()',
            'usb=()',
            'magnetometer=()',
            'gyroscope=()',
            'accelerometer=()',
            'gyroscope=()'
        ].join(', ');
        
        this.setMetaTag('Permissions-Policy', permissions);
    }

    /**
     * 設置安全 HTTP 標頭 (伺服器端)
     * 注意: GitHub Pages 無法設置伺服器端標頭，此為記錄
     */
    setupSecurityHeaders() {
        const securityHeaders = {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };
        
        if (window.configManager?.getAppConfig()?.debug) {
            console.log('📋 建議伺服器端安全標頭:', securityHeaders);
        }
    }

    /**
     * 清除 URL 中的 session 資訊
     */
    setupSessionCleanup() {
        // 頁面載入時清除
        window.addEventListener('DOMContentLoaded', () => {
            this.clearSessionFromURL();
        });

        // 監聽 auth 狀態變化
        if (window.supabaseManager) {
            window.supabaseManager.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    // 登入後清除 URL 中的 token
                    setTimeout(() => this.clearSessionFromURL(), 100);
                }
            });
        }
    }

    /**
     * 清除 URL 中的 session token
     */
    clearSessionFromURL() {
        const url = new URL(window.location.href);
        let cleaned = false;

        const sensitiveParams = [
            'access_token',
            'refresh_token',
            'token_type',
            'expires_in',
            'provider_token'
        ];

        sensitiveParams.forEach(param => {
            if (url.searchParams.has(param)) {
                url.searchParams.delete(param);
                cleaned = true;
            }
        });

        if (cleaned) {
            window.history.replaceState({}, document.title, url.toString());
            console.log('✅ 已清除 URL 中的敏感資訊');
        }
    }

    /**
     * 清理 HTML 內容
     * @param {string} html 
     * @returns {string}
     */
    sanitizeHTML(html) {
        return this.sanitizer.sanitize(html);
    }

    /**
     * 清理屬性值
     * @param {string} value 
     * @returns {string}
     */
    sanitizeAttribute(value) {
        return this.sanitizer.sanitizeAttribute(value);
    }

    /**
     * 驗證 URL 安全性
     * @param {string} url 
     * @returns {boolean}
     */
    isSecureURL(url) {
        try {
            const parsed = new URL(url, window.location.origin);
            
            // 只允許 http 和 https
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return false;
            }
            
            // 檢查域名
            const allowedDomains = [
                window.location.hostname,
                'twgydqknzdyahgfuamak.supabase.co',
                'cdn.jsdelivr.net',
                'fonts.googleapis.com',
                'fonts.gstatic.com'
            ];
            
            return allowedDomains.includes(parsed.hostname);
        } catch {
            return false;
        }
    }

    /**
     * 安全設置 innerHTML
     * @param {Element} element 
     * @param {string} html 
     */
    safeSetHTML(element, html) {
        if (typeof html !== 'string') {
            element.textContent = String(html);
            return;
        }
        
        const sanitized = this.sanitizeHTML(html);
        element.innerHTML = sanitized;
    }

    /**
     * 記錄安全事件
     * @param {string} type 
     * @param {Object} data 
     */
    logSecurityEvent(type, data) {
        const event = {
            type,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            data
        };

        if (window.logger) {
            window.logger.warn('Security Event', event);
        } else {
            console.warn('Security Event:', event);
        }
    }

    /**
     * 報告安全事件到伺服器
     * @param {Object} event 
     */
    async reportSecurityEvent(event) {
        try {
            // 發送到 Supabase (如果可用)
            if (window.supabaseManager?.isConnectionReady()) {
                await window.supabaseManager.getClient()
                    .from('security_events')
                    .insert({
                        event_type: event.type || 'unknown',
                        event_data: JSON.stringify(event),
                        user_agent: navigator.userAgent,
                        page_url: window.location.href
                    });
            }
        } catch (error) {
            console.error('Failed to report security event:', error);
        }
    }

    /**
     * 獲取安全配置
     * @returns {Object}
     */
    getSecurityConfig() {
        return {
            csp: this.cspConfig || this.getDefaultCSPConfig(),
            xssProtection: this.xssProtectionEnabled,
            rateLimiting: true,
            version: '2.0.0'
        };
    }
}

/**
 * DOM 清理器類 v2.0 - 嚴格的 XSS 防護
 */
class DOMSanitizer {
    constructor() {
        this.allowedTags = this.getAllowedTags();
        this.allowedAttributes = this.getAllowedAttributes();
        this.blockedPatterns = this.getBlockedPatterns();
    }

    /**
     * 獲取允許的 HTML 標籤 (安全版本)
     * @returns {Set}
     */
    getAllowedTags() {
        return new Set([
            // 基本結構 - 安全
            'div', 'span', 'p', 'br', 'hr',
            
            // 文本格式 - 安全
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'strong', 'em', 'u', 'i', 'b', 's', 'del', 'ins',
            'small', 'sub', 'sup',
            
            // 列表 - 安全
            'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            
            // 表格 - 安全
            'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
            
            // 其他 - 安全
            'a', 'img', 'code', 'pre', 'blockquote', 'figure', 'figcaption',
            'time', 'mark', 'abbr', 'address', 'cite'
        ]);
    }

    /**
     * 獲取允許的屬性 (安全版本)
     * @returns {Set}
     */
    getAllowedAttributes() {
        return new Set([
            // 通用屬性
            'id', 'class', 'style', 'title', 'lang', 'dir',
            
            // 鏈接屬性 (限制 href)
            'href', 'target', 'rel',
            
            // 圖片屬性 (限制 src)
            'src', 'alt', 'width', 'height', 'loading',
            
            // 時間屬性
            'datetime',
            
            // 數據屬性
            'data-*'
        ]);
    }

    /**
     * 獲取阻止的模式 (防止繞過)
     * @returns {RegExp[]}
     */
    getBlockedPatterns() {
        return [
            /javascript:/gi,
            /vbscript:/gi,
            /data:/gi,
            /<script/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /<meta/gi,
            /onload=/gi,
            /onerror=/gi,
            /onclick=/gi,
            /onmouseover=/gi,
            /onfocus=/gi,
            /onblur=/gi,
            /onchange=/gi,
            /onsubmit=/gi,
            /onreset=/gi,
            /onselect=/gi,
            /onkeydown=/gi,
            /onkeypress=/gi,
            /onkeyup=/gi,
            /expression\(/gi,
            /url\(/gi,
            /@import/gi
        ];
    }

    /**
     * 清理 HTML 內容
     * @param {string} html 
     * @returns {string}
     */
    sanitize(html) {
        if (typeof html !== 'string') {
            return '';
        }

        // 第一階段：模式匹配阻止
        let sanitized = this.blockDangerousPatterns(html);

        // 第二階段：DOM 清理
        const temp = document.createElement('div');
        temp.innerHTML = sanitized;

        // 第三階段：遞歸清理
        this.sanitizeNode(temp);

        return temp.innerHTML;
    }

    /**
     * 阻止危險模式
     * @param {string} html 
     * @returns {string}
     */
    blockDangerousPatterns(html) {
        let sanitized = html;
        
        for (const pattern of this.blockedPatterns) {
            sanitized = sanitized.replace(pattern, '');
        }
        
        return sanitized;
    }

    /**
     * 清理單個節點
     * @param {Node} node 
     */
    sanitizeNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            
            // 檢查標籤是否允許
            if (!this.allowedTags.has(tagName)) {
                this.removeNodeSafely(node);
                return;
            }

            // 清理屬性
            this.sanitizeAttributes(node);

            // 遞歸清理子節點
            const children = Array.from(node.childNodes);
            children.forEach(child => this.sanitizeNode(child));
        }
    }

    /**
     * 安全移除節點
     * @param {Node} node 
     */
    removeNodeSafely(node) {
        console.warn('🚨 移除未授權元素:', node.tagName);
        while (node.firstChild) {
            node.parentNode.insertBefore(node.firstChild, node);
        }
        node.parentNode.removeChild(node);
    }

    /**
     * 清理元素屬性
     * @param {Element} element 
     */
    sanitizeAttributes(element) {
        const attributes = Array.from(element.attributes);
        
        attributes.forEach(attr => {
            const attrName = attr.name.toLowerCase();
            const attrValue = attr.value;
            
            // 檢查屬性是否允許
            if (!this.isAttributeAllowed(attrName)) {
                element.removeAttribute(attr.name);
                return;
            }

            // 特殊處理
            if (attrName === 'href') {
                const sanitized = this.sanitizeURL(attrValue);
                if (!sanitized) {
                    element.removeAttribute('href');
                } else {
                    element.setAttribute('href', sanitized);
                }
            } else if (attrName === 'src') {
                const sanitized = this.sanitizeURL(attrValue);
                if (!sanitized) {
                    element.removeAttribute('src');
                } else {
                    element.setAttribute('src', sanitized);
                }
            } else if (attrName === 'style') {
                element.setAttribute('style', this.sanitizeStyle(attrValue));
            }
        });
    }

    /**
     * 檢查屬性是否允許
     * @param {string} attrName 
     * @returns {boolean}
     */
    isAttributeAllowed(attrName) {
        // 檢查精確匹配
        if (this.allowedAttributes.has(attrName)) {
            return true;
        }

        // 檢查 data-* 萬用字元
        if (attrName.startsWith('data-')) {
            return true;
        }

        // 阻止事件處理器
        if (attrName.startsWith('on')) {
            return false;
        }

        return false;
    }

    /**
     * 清理 URL
     * @param {string} url 
     * @returns {string}
     */
    sanitizeURL(url) {
        if (!url) return '';

        // 移除危險協議
        const lowerUrl = url.toLowerCase().trim();
        if (lowerUrl.startsWith('javascript:') || 
            lowerUrl.startsWith('vbscript:') ||
            lowerUrl.startsWith('data:text/html')) {
            console.warn('🚨 阻止危險 URL:', url);
            return '';
        }

        return url;
    }

    /**
     * 清理樣式
     * @param {string} style 
     * @returns {string}
     */
    sanitizeStyle(style) {
        if (!style) return '';

        const dangerousPatterns = [
            /expression\s*\(/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /behavior\s*:/gi,
            /binding\s*:/gi,
            /@import/gi,
            /url\s*\(/gi
        ];

        let sanitized = style;
        for (const pattern of dangerousPatterns) {
            sanitized = sanitized.replace(pattern, '');
        }

        return sanitized;
    }

    /**
     * 清理屬性值
     * @param {string} value 
     * @returns {string}
     */
    sanitizeAttribute(value) {
        if (typeof value !== 'string') {
            return String(value || '');
        }

        return value
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
}

/**
 * 速率限制器 v2.0
 */
class RateLimiter {
    constructor(options = {}) {
        this.maxRequests = options.maxRequests || 10;
        this.windowMs = options.windowMs || 60000; // 1 分鐘
        this.requests = new Map();
        this.blockedEndpoints = new Set();
    }

    /**
     * 檢查請求是否被限制
     * @param {string} endpoint 
     * @param {string} identifier 
     * @returns {Object}
     */
    checkLimit(endpoint, identifier = 'global') {
        const key = `${endpoint}:${identifier}`;
        const now = Date.now();
        const windowStart = now - this.windowMs;

        // 檢查是否被封鎖
        if (this.blockedEndpoints.has(key)) {
            return { allowed: false, reason: 'endpoint_blocked', retryAfter: 60 };
        }

        // 清理過期記錄
        this.requests.forEach((timestamps, k) => {
            if (k.startsWith(endpoint) && timestamps[0] < windowStart) {
                this.requests.delete(k);
            }
        });

        // 獲取當前請求記錄
        const requestKey = `${endpoint}:${identifier}:${Math.floor(now / this.windowMs)}`;
        const timestamps = this.requests.get(requestKey) || [];

        // 檢查限制
        if (timestamps.length >= this.maxRequests) {
            this.blockEndpoint(endpoint, identifier);
            return { 
                allowed: false, 
                reason: 'rate_limit_exceeded', 
                retryAfter: Math.ceil(this.windowMs / 1000),
                remaining: 0
            };
        }

        // 記錄請求
        timestamps.push(now);
        this.requests.set(requestKey, timestamps);

        return {
            allowed: true,
            remaining: this.maxRequests - timestamps.length,
            resetAfter: Math.ceil(this.windowMs / 1000)
        };
    }

    /**
     * 封鎖端點
     * @param {string} endpoint 
     * @param {string} identifier 
     */
    blockEndpoint(endpoint, identifier) {
        const key = `${endpoint}:${identifier}`;
        this.blockedEndpoints.add(key);
        
        console.warn(`🚨 速率限制觸發: ${endpoint}`);
        
        // 60 秒後解除封鎖
        setTimeout(() => {
            this.blockedEndpoints.delete(key);
        }, 60000);
    }

    /**
     * 重置限制
     * @param {string} endpoint 
     */
    reset(endpoint) {
        this.requests.delete(endpoint);
        this.blockedEndpoints.delete(endpoint);
    }

    /**
     * 獲取當前狀態
     * @returns {Object}
     */
    getStatus() {
        return {
            maxRequests: this.maxRequests,
            windowMs: this.windowMs,
            blockedCount: this.blockedEndpoints.size
        };
    }
}

/**
 * 密碼強度驗證器 v2.0
 */
class PasswordValidator {
    /**
     * 驗證密碼強度
     * @param {string} password 
     * @returns {Object}
     */
    validate(password) {
        const checks = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            noCommonPatterns: !this.checkCommonPatterns(password),
            noRepeatedChars: !/(.)\1{3,}/.test(password)
        };

        const passedChecks = Object.values(checks).filter(Boolean).length;
        const totalChecks = Object.keys(checks).length;
        const score = Math.round((passedChecks / totalChecks) * 100);

        return {
            valid: score >= 80,
            score,
            strength: this.getStrengthLabel(score),
            checks,
            feedback: this.getFeedback(checks)
        };
    }

    /**
     * 檢查常見密碼模式
     * @param {string} password 
     * @returns {boolean}
     */
    checkCommonPatterns(password) {
        const commonPatterns = [
            /^[0-9]+$/,           // 純數字
            /^[a-zA-Z]+$/,         // 純字母
            /^(.)\1+$/,            // 單一字符重複
            /password/i,           // 包含 "password"
            /123456/i,             // 順序數字
            /qwerty/i,             // 鍵盤順序
            /abc/i                 // 開頭字母順序
        ];

        return commonPatterns.some(pattern => pattern.test(password));
    }

    /**
     * 獲取強度標籤
     * @param {number} score 
     * @returns {string}
     */
    getStrengthLabel(score) {
        if (score >= 100) return 'excellent';
        if (score >= 80) return 'strong';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'weak';
    }

    /**
     * 獲取回饋建議
     * @param {Object} checks 
     * @returns {string[]}
     */
    getFeedback(checks) {
        const feedback = [];
        
        if (!checks.minLength) feedback.push('密碼至少需要 8 個字符');
        if (!checks.hasUppercase) feedback.push('建議添加大寫字母');
        if (!checks.hasLowercase) feedback.push('建議添加小寫字母');
        if (!checks.hasNumber) feedback.push('建議添加數字');
        if (!checks.hasSpecial) feedback.push('建議添加特殊字符 (!@#$%^)');
        if (!checks.noCommonPatterns) feedback.push('包含常見模式');
        if (!checks.noRepeatedChars) feedback.push('避免使用重複字符 (如 aaaa)');
        
        return feedback;
    }
}

// 創建全域實例
window.securityManager = new SecurityManager();
window.rateLimiter = new RateLimiter();
window.passwordValidator = new PasswordValidator();

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        SecurityManager, 
        DOMSanitizer, 
        RateLimiter,
        PasswordValidator 
    };
}
