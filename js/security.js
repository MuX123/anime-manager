/**
 * 安全模組 - 內容安全政策 (CSP) 和 XSS 防護
 * @version 1.0.0
 * @author ACG Manager Security Team
 */

class SecurityManager {
    constructor() {
        this.cspConfig = this.getDefaultCSPConfig();
        this.xssProtectionEnabled = true;
        this.sanitizer = new DOMSanitizer();
        this.init();
    }

    /**
     * 初始化安全設定
     */
    init() {
        this.setupCSP();
        this.setupXSSProtection();
        this.setupSecurityHeaders();
        console.log('🔒 安全管理器初始化完成');
    }

    /**
     * 獲取預設 CSP 配置
     * @returns {Object} CSP 配置對象
     */
    getDefaultCSPConfig() {
        return {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                "'unsafe-inline'", // 暫時允許內聯腳本（需要逐步移除）
                'https://cdn.jsdelivr.net',
                'https://unpkg.com'
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'",
                'https://fonts.googleapis.com'
            ],
            'font-src': [
                "'self'",
                'https://fonts.gstatic.com'
            ],
            'img-src': [
                "'self'",
                'data:',
                'https:',
                'http:'
            ],
            'connect-src': [
                "'self'",
                'https://twgydqknzdyahgfuamak.supabase.co'
            ],
            'frame-src': ["'none'"],
            'object-src': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"]
        };
    }

    /**
     * 設置內容安全政策
     */
    setupCSP() {
        if (!this.supportsCSP()) {
            console.warn('⚠️ 瀏覽器不支援 CSP');
            return;
        }

        const cspHeader = this.buildCSPHeader();
        
        // 嘗試設置 meta 標籤
        this.setCSPMetaTag(cspHeader);
        
        // 設置 CSP 違規報告
        this.setupCSPReporting();
    }

    /**
     * 檢查瀏覽器是否支援 CSP
     * @returns {boolean} 是否支援 CSP
     */
    supportsCSP() {
        return 'securityPolicy' in document || 'CSP' in window;
    }

    /**
     * 構建 CSP 標頭
     * @returns {string} CSP 標頭字符串
     */
    buildCSPHeader() {
        const directives = [];
        
        for (const [directive, sources] of Object.entries(this.cspConfig)) {
            directives.push(`${directive} ${sources.join(' ')}`);
        }
        
        return directives.join('; ');
    }

    /**
     * 設置 CSP meta 標籤
     * @param {string} cspHeader CSP 標頭
     */
    setCSPMetaTag(cspHeader) {
        // 移除現有的 CSP meta 標籤
        const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (existingMeta) {
            existingMeta.remove();
        }

        // 創建新的 CSP meta 標籤
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = cspHeader;
        
        // 插入到 head 的開頭
        const head = document.head;
        if (head.firstChild) {
            head.insertBefore(meta, head.firstChild);
        } else {
            head.appendChild(meta);
        }
    }

    /**
     * 設置 CSP 違規報告
     */
    setupCSPReporting() {
        // 監聽 CSP 違規事件
        document.addEventListener('securitypolicyviolation', (event) => {
            this.handleCSPViolation(event);
        });

        // 設置 report-uri（如果支援）
        if (window.ReportingObserver) {
            const observer = new ReportingObserver((reports) => {
                reports.forEach(report => {
                    if (report.type === 'csp') {
                        this.handleCSPViolation(report.body);
                    }
                });
            });
            
            observer.observe();
        }
    }

    /**
     * 處理 CSP 違規事件
     * @param {SecurityPolicyViolationEvent} event 違規事件
     */
    handleCSPViolation(event) {
        const violation = {
            blockedURI: event.blockedURI,
            documentURI: event.documentURI,
            effectiveDirective: event.effectiveDirective,
            originalPolicy: event.originalPolicy,
            referrer: event.referrer,
            sample: event.sample,
            sourceFile: event.sourceFile,
            lineNumber: event.lineNumber,
            columnNumber: event.columnNumber,
            timestamp: new Date().toISOString()
        };

        console.warn('🚨 CSP 違規檢測:', violation);
        
        // 發送到日誌系統
        this.logSecurityEvent('csp_violation', violation);
    }

    /**
     * 設置 XSS 防護
     */
    setupXSSProtection() {
        if (!this.xssProtectionEnabled) {
            return;
        }

        // 設置 XSS 保護 meta 標籤
        this.setMetaTag('X-XSS-Protection', '1; mode=block');
        
        // 設置 X-Content-Type-Options
        this.setMetaTag('X-Content-Type-Options', 'nosniff');
        
        // 設置 Referrer-Policy
        this.setMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // 設置 Permissions-Policy
        this.setPermissionsPolicy();
    }

    /**
     * 設置 meta 標籤
     * @param {string} httpEquiv HTTP 等價屬性
     * @param {string} content 內容
     */
    setMetaTag(httpEquiv, content) {
        let meta = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.httpEquiv = httpEquiv;
            document.head.appendChild(meta);
        }
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
            'accelerometer=()'
        ];
        
        this.setMetaTag('Permissions-Policy', permissions.join(', '));
    }

    /**
     * 設置安全標頭
     */
    setupSecurityHeaders() {
        // 伺服器端標頭（GitHub Pages 不支援，此處記錄僅供參考）
        const securityHeaders = {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Expect-CT': 'max-age=86400, enforce'
        };
        
        // 可在伺服器配置中啟用這些標頭以獲得更好的安全性
        if (this.config.cspEnabled && window.configManager?.getAppConfig().debug) {
            console.log('📋 伺服器端安全標頭建議:', securityHeaders);
        }
    }

    /**
     * 清理 HTML 內容，防止 XSS 攻擊
     * @param {string} html 原始 HTML
     * @returns {string} 清理後的 HTML
     */
    sanitizeHTML(html) {
        return this.sanitizer.sanitize(html);
    }

    /**
     * 清理屬性值
     * @param {string} value 原始值
     * @returns {string} 清理後的值
     */
    sanitizeAttribute(value) {
        return this.sanitizer.sanitizeAttribute(value);
    }

    /**
     * 驗證 URL 安全性
     * @param {string} url URL 字符串
     * @returns {boolean} 是否安全
     */
    isSecureURL(url) {
        try {
            const parsed = new URL(url, window.location.origin);
            
            // 只允許 http 和 https 協議
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return false;
            }
            
            // 檢查是否為同源或允許的第三方
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
     * 安全地設置 innerHTML
     * @param {Element} element 目標元素
     * @param {string} html HTML 內容
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
     * @param {string} type 事件類型
     * @param {Object} data 事件數據
     */
    logSecurityEvent(type, data) {
        const event = {
            type,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            data
        };

        // 發送到日誌系統
        if (window.logger) {
            window.logger.warn('Security Event', event);
        } else {
            console.warn('Security Event:', event);
        }

        // 可選：發送到伺服器
        this.reportSecurityEvent(event);
    }

    /**
     * 報告安全事件到伺服器
     * @param {Object} event 安全事件
     */
    async reportSecurityEvent(event) {
        try {
            // 這裡可以實作發送到安全監控服務
            // await fetch('/api/security-events', { ... });
        } catch (error) {
            console.error('Failed to report security event:', error);
        }
    }

    /**
     * 獲取安全配置
     * @returns {Object} 安全配置
     */
    getSecurityConfig() {
        return {
            csp: this.cspConfig,
            xssProtection: this.xssProtectionEnabled,
            version: '1.0.0'
        };
    }
}

/**
 * DOM 清理器類
 */
class DOMSanitizer {
    constructor() {
        this.allowedTags = this.getAllowedTags();
        this.allowedAttributes = this.getAllowedAttributes();
    }

    /**
     * 獲取允許的 HTML 標籤
     * @returns {Set} 允許的標籤集合
     */
    getAllowedTags() {
        return new Set([
            // 基本結構
            'div', 'span', 'p', 'br', 'hr',
            
            // 文本格式
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'strong', 'em', 'u', 'i', 'b', 's', 'del', 'ins',
            
            // 列表
            'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            
            // 表格
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            
            // 表單
            'form', 'input', 'button', 'select', 'option', 'textarea',
            
            // 其他
            'a', 'img', 'code', 'pre', 'blockquote'
        ]);
    }

    /**
     * 獲取允許的屬性
     * @returns {Set} 允許的屬性集合
     */
    getAllowedAttributes() {
        return new Set([
            // 通用屬性
            'id', 'class', 'style', 'title', 'alt',
            
            // 鏈接屬性
            'href', 'target', 'rel',
            
            // 圖片屬性
            'src', 'width', 'height',
            
            // 表單屬性
            'type', 'name', 'value', 'placeholder', 'disabled', 'readonly',
            'required', 'min', 'max', 'step', 'pattern',
            
            // 數據屬性
            'data-*'
        ]);
    }

    /**
     * 清理 HTML 內容
     * @param {string} html 原始 HTML
     * @returns {string} 清理後的 HTML
     */
    sanitize(html) {
        if (typeof html !== 'string') {
            return '';
        }

        // 創建一個臨時 DOM 元素
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // 遞歸清理所有節點
        this.sanitizeNode(temp);

        return temp.innerHTML;
    }

    /**
     * 清理單個節點
     * @param {Node} node DOM 節點
     */
    sanitizeNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            
            // 檢查標籤是否允許
            if (!this.allowedTags.has(tagName)) {
                // 不允許的標籤，移除但保留內容
                while (node.firstChild) {
                    node.parentNode.insertBefore(node.firstChild, node);
                }
                node.parentNode.removeChild(node);
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
     * 清理元素屬性
     * @param {Element} element DOM 元素
     */
    sanitizeAttributes(element) {
        const attributes = Array.from(element.attributes);
        
        attributes.forEach(attr => {
            const attrName = attr.name.toLowerCase();
            
            // 檢查屬性是否允許
            if (!this.isAttributeAllowed(attrName)) {
                element.removeAttribute(attr.name);
                return;
            }

            // 特殊處理某些屬性
            if (attrName === 'href') {
                element.setAttribute(attr.name, this.sanitizeURL(attr.value));
            } else if (attrName === 'src') {
                element.setAttribute(attr.name, this.sanitizeURL(attr.value));
            } else if (attrName === 'style') {
                element.setAttribute(attr.name, this.sanitizeStyle(attr.value));
            }
        });
    }

    /**
     * 檢查屬性是否允許
     * @param {string} attrName 屬性名稱
     * @returns {boolean} 是否允許
     */
    isAttributeAllowed(attrName) {
        // 檢查精確匹配
        if (this.allowedAttributes.has(attrName)) {
            return true;
        }

        // 檢查通配符匹配
        for (const allowed of this.allowedAttributes) {
            if (allowed.endsWith('*') && attrName.startsWith(allowed.slice(0, -1))) {
                return true;
            }
        }

        return false;
    }

    /**
     * 清理 URL
     * @param {string} url 原始 URL
     * @returns {string} 清理後的 URL
     */
    sanitizeURL(url) {
        if (!url) return '';
        
        // 移除 JavaScript 協議
        if (url.toLowerCase().startsWith('javascript:')) {
            return '';
        }

        // 移除 data 協議（除了圖片）
        if (url.toLowerCase().startsWith('data:') && !url.startsWith('data:image/')) {
            return '';
        }

        return url;
    }

    /**
     * 清理樣式
     * @param {string} style 原始樣式
     * @returns {string} 清理後的樣式
     */
    sanitizeStyle(style) {
        if (!style) return '';
        
        // 移除危險的樣式屬性
        const dangerousStyles = [
            'expression',
            'behavior',
            'binding',
            'javascript:',
            '@import'
        ];

        return style.split(';')
            .map(decl => decl.trim())
            .filter(decl => {
                const lowerDecl = decl.toLowerCase();
                return !dangerousStyles.some(dangerous => lowerDecl.includes(dangerous));
            })
            .join('; ');
    }

    /**
     * 清理屬性值
     * @param {string} value 原始值
     * @returns {string} 清理後的值
     */
    sanitizeAttribute(value) {
        if (typeof value !== 'string') {
            return String(value || '');
        }

        // 移除危險字符
        return value
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
}

// 創建全局安全管理器實例
window.securityManager = new SecurityManager();

// 導出安全管理器（支援模組化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityManager, DOMSanitizer };
}