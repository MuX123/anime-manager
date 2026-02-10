/**
 * Supabase 資料庫客戶端模組 v8.0.0
 * 提供安全的資料庫連接和操作介面
 * @version 8.0.0
 * @author ACG Manager Development Team
 * @date 2026-02-10
 */

/**
 * Supabase 資料庫管理器 v8.0.0
 */
class SupabaseManager {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.isOnline = true;
        this.connectionAttempts = 0;
        this.maxRetries = 5;  // 增加重試次數
        this.retryDelay = 1000;
        this.lastSuccessfulQuery = null;
        this.queryQueue = [];
        this.isProcessingQueue = false;

        this.init();
    }

    /**
     * 初始化 Supabase 客戶端
     */
    async init() {
        try {
            const config = window.configManager?.getSupabaseConfig();

            if (!config || !config.url || !config.anonKey || config.url === '' || config.anonKey === '') {
                console.warn('Supabase 配置缺失，使用離線模式');
                this.setOfflineMode();
                return;
            }

            if (typeof supabase === 'undefined') {
                console.warn('Supabase SDK 未載入，使用離線模式');
                this.setOfflineMode();
                return;
            }

            // 創建客戶端
            this.client = supabase.createClient(config.url, config.anonKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                },
                db: {
                    schema: 'public'
                },
                global: {
                    headers: {
                        'X-Client-Info': 'acg-manager/8.0.0'
                    }
                },
                realtime: {
                    params: {
                        eventsPerSecond: 10
                    }
                }
            });

            // 監聽離線狀態
            this.setupOfflineListener();

            // 測試連接
            const connected = await this.testConnection();

            this.isConnected = connected;
            this.isOnline = connected;

            if (connected) {
                window.logger?.info('Supabase 客戶端初始化成功');
                this.startHealthCheck();
            } else {
                this.setOfflineMode();
            }

        } catch (error) {
            console.warn('Supabase 初始化錯誤，使用離線模式:', error.message);
            this.setOfflineMode();
        }
    }

    /**
     * 設置離線監聽
     */
    setupOfflineListener() {
        window.addEventListener('online', () => {
            console.log('[Supabase] 網路已恢復，嘗試重新連線');
            this.reconnect();
        });

        window.addEventListener('offline', () => {
            console.log('[Supabase] 網路已斷線');
            this.isOnline = false;
            this.handleOffline();
        });
    }

    /**
     * 設置離線模式
     */
    setOfflineMode() {
        this.isConnected = false;
        this.isOnline = false;
    }

    /**
     * 處理離線狀態
     */
    handleOffline() {
        if (window.showToast) {
            window.showToast('網路已斷線，資料可能無法同步', 'warning');
        }
    }

    /**
     * 測試資料庫連接
     */
    async testConnection() {
        try {
            // 檢查網路連線
            if (!navigator.onLine) {
                console.warn('[Supabase] 網路未連線');
                return false;
            }

            const { error: authError } = await this.client.auth.getSession();
            if (authError && authError.name !== 'AuthSessionMissingError') {
                throw authError;
            }

            // 測試查詢
            try {
                const { error } = await this.client
                    .from('site_settings')
                    .select('id')
                    .limit(1);

                if (error && error.code !== '42501') { // 權限不足不算失敗
                    console.warn('[Supabase] 查詢測試失敗:', error.message);
                }
            } catch (tableError) {
                // 表不存在或無權訪問，不算連接失敗
            }

            this.lastSuccessfulQuery = Date.now();
            return true;

        } catch (error) {
            console.error('[Supabase] 連接測試失敗:', error.message);
            return false;
        }
    }

    /**
     * 開始健康檢查
     */
    startHealthCheck() {
        // 每 30 秒檢查一次連線
        this.healthCheckInterval = setInterval(async () => {
            if (!this.isOnline) return;

            const healthy = await this.testConnection();

            if (!healthy) {
                console.warn('[Supabase] 健康檢查失敗');
                this.handleConnectionError(new Error('Health check failed'));
            }
        }, 30000);
    }

    /**
     * 處理連接錯誤
     */
    handleConnectionError(error) {
        this.isConnected = false;
        this.connectionAttempts++;

        window.logger?.error('Supabase 連接失敗', {
            error: error.message,
            attempt: this.connectionAttempts,
            maxRetries: this.maxRetries
        });

        if (this.connectionAttempts < this.maxRetries) {
            const delay = this.retryDelay * Math.pow(2, this.connectionAttempts - 1);
            console.log(`[Supabase] ${delay / 1000} 秒後重試 (${this.connectionAttempts}/${this.maxRetries})`);

            setTimeout(() => {
                this.reconnect();
            }, delay);
        } else {
            console.error('[Supabase] 重試次數已達上限，進入離線模式');
            this.setOfflineMode();

            if (window.showToast) {
                window.showToast('資料庫連接失敗，請檢查網路', 'error');
            }
        }
    }

    /**
     * 重新連接
     */
    async reconnect() {
        if (this.isProcessingQueue) return;

        this.connectionAttempts = 0;

        try {
            const connected = await this.testConnection();

            if (connected) {
                this.isConnected = true;
                this.isOnline = true;
                console.log('[Supabase] 重新連線成功');

                // 處理排隊的請求
                await this.processQueryQueue();

                if (window.showToast) {
                    window.showToast('已重新連線', 'success');
                }
            } else {
                this.handleConnectionError(new Error('Reconnection failed'));
            }
        } catch (error) {
            this.handleConnectionError(error);
        }
    }

    /**
     * 排隊處理請求
     */
    queueQuery(operation) {
        return new Promise((resolve, reject) => {
            this.queryQueue.push({ operation, resolve, reject });

            if (!this.isProcessingQueue) {
                this.processQueryQueue();
            }
        });
    }

    /**
     * 處理排隊請求
     */
    async processQueryQueue() {
        if (this.isProcessingQueue || this.queryQueue.length === 0) return;

        this.isProcessingQueue = true;

        while (this.queryQueue.length > 0) {
            const { operation, resolve, reject } = this.queryQueue.shift();

            try {
                if (!this.isOnline || !this.isConnected) {
                    throw new Error('離線狀態');
                }

                const result = await operation(this.client);
                resolve(result);
            } catch (error) {
                // 離線或連線失敗，將請求保留在隊列中
                this.queryQueue.unshift({ operation, resolve, reject });
                break;
            }
        }

        this.isProcessingQueue = false;
    }

    /**
     * 安全查詢 v2.0 - 整合離線支援
     */
    async query(operation, options = {}) {
        const {
            timeout = 15000,
            retries = 3,
            errorMessage = '資料庫操作失敗',
            allowQueue = true
        } = options;

        // 離線模式處理
        if (!this.isOnline) {
            console.log('[Supabase] 離線模式，請求已排隊');

            if (allowQueue) {
                return this.queueQuery(operation);
            } else {
                return { data: null, error: { message: '離線模式' }, offline: true };
            }
        }

        if (!this.isConnected) {
            if (allowQueue) {
                return this.queueQuery(operation);
            } else {
                return { data: null, error: { message: '未連線' }, offline: true };
            }
        }

        let lastError;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('查詢超時')), timeout)
                );

                const result = await Promise.race([
                    operation(this.client),
                    timeoutPromise
                ]);

                this.lastSuccessfulQuery = Date.now();
                this.connectionAttempts = 0;

                return result;

            } catch (error) {
                lastError = error;

                // 網路錯誤，嘗試重試
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    console.warn(`[Supabase] 網路錯誤 (${attempt}/${retries})`);

                    if (attempt < retries) {
                        await new Promise(r => setTimeout(r, 1000 * attempt));
                        continue;
                    }
                }

                console.error('[Supabase] 查詢失敗:', error.message);
            }
        }

        // 所有重試都失敗
        return {
            data: null,
            error: { message: `${errorMessage}: ${lastError.message}` },
            offline: !this.isOnline
        };
    }

    /**
     * 獲取連接狀態
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            isOnline: this.isOnline,
            connectionAttempts: this.connectionAttempts,
            maxRetries: this.maxRetries,
            lastSuccessfulQuery: this.lastSuccessfulQuery,
            queuedQueries: this.queryQueue.length
        };
    }

    /**
     * 檢查用戶是否為管理員
     * @returns {Promise<boolean>} 是否為管理員
     */
    async checkIsAdmin() {
        try {
            // 優先從 session 獲取用戶信息（更穩定）
            const { data: { session } } = await this.client.auth.getSession();
            if (!session?.user) {
                console.log('[Auth] 無法獲取 Session 用戶');
                return false;
            }

            const userEmail = session.user.email;
            if (!userEmail) {
                console.log('[Auth] 用戶沒有 Email');
                return false;
            }

            // 檢查 admin_email 設定
            const { data: settings } = await this.client
                .from('site_settings')
                .select('value')
                .eq('id', 'admin_email')
                .single();

            const adminEmail = settings?.value;
            console.log('[Auth] 當前用戶:', userEmail, '| 預設管理員:', adminEmail);

            if (adminEmail) {
                const isAdmin = userEmail.toLowerCase() === adminEmail.toLowerCase();
                console.log('[Auth] 是否為管理員:', isAdmin);
                return isAdmin;
            }

            console.warn('[Auth] 資料庫中找不到 admin_email 設定');
            return false;
        } catch (error) {
            console.warn('[Auth] 檢查管理員狀態失敗:', error);
            return false;
        }
    }

    /**
     * 使用電子郵件登入
     * @param {string} email 電子郵件
     * @param {string} password 密碼
     * @returns {Promise<Object>} 登入結果
     */
    async signInWithEmail(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            return { success: true, user: data.user, session: data.session };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 登出
     * @returns {Promise<Object>} 登出結果
     */
    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('登出失敗:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 獲取當前會話
     * @returns {Promise<Object>} 會話信息
     */
    async getSession() {
        try {
            const { data: { session }, error } = await this.client.auth.getSession();
            if (error) throw error;
            return { success: true, session };
        } catch (error) {
            return { success: false, session: null, error: error.message };
        }
    }

    /**
     * 監聽認證狀態變化
     * @param {Function} callback 回調函數
     */
    onAuthStateChange(callback) {
        if (!this.client || !this.client.auth) {
            console.warn('Supabase client not ready for auth state change');
            return;
        }
        this.client.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }

    /**
     * 獲取客戶端實例
     * @returns {Object} Supabase 客戶端
     */
    getClient() {
        if (!this.isConnected) {
            throw new Error('資料庫未連接');
        }
        return this.client;
    }

    /**
     * 檢查連接狀態
     * @returns {boolean} 是否已連接
     */
    isConnectionReady() {
        return this.isConnected && this.client !== null;
    }

    /**
     * 重新連接
     */
    async reconnect() {
        this.connectionAttempts = 0;
        await this.init();
    }
}

// 創建全局 Supabase 管理器實例
window.supabaseManager = new SupabaseManager();

// 向後兼容：導出客戶端實例
Object.defineProperty(window, 'supabaseClient', {
    get() {
        return window.supabaseManager.getClient();
    },
    configurable: true
});

// 導出模組（支援模組化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseManager;
}
