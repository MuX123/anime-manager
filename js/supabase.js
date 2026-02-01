/**
 * Supabase 資料庫客戶端模組
 * 提供安全的資料庫連接和操作介面
 * @version 2.0.0
 * @author ACG Manager Development Team
 */

/**
 * Supabase 資料庫管理器
 */
class SupabaseManager {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        this.init();
    }

    /**
     * 初始化 Supabase 客戶端
     */
    async init() {
        try {
            // 從配置管理器獲取安全配置
            const config = window.configManager?.getSupabaseConfig();
            
            if (!config || !config.url || !config.anonKey) {
                console.warn('Supabase 配置缺失，使用離線模式');
                return;
            }

            // 檢查 Supabase SDK 是否載入
            if (typeof supabase === 'undefined') {
                console.warn('Supabase SDK 未載入，請檢查網路連線或 CDN 引用');
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
                        'X-Client-Info': 'acg-manager/2.0.0'
                    }
                }
            });

            // 測試連接（使用寬容模式）
            const connected = await this.testConnection();
            
            this.isConnected = connected;
            window.logger?.info(connected ? 'Supabase 客戶端初始化成功' : 'Supabase 客戶端初始化完成（離線模式）');
            
        } catch (error) {
            console.warn('Supabase 初始化錯誤，使用離線模式:', error.message);
            this.isConnected = false;
        }
    }

    /**
     * 測試資料庫連接
     * @returns {Promise<boolean>} 連接是否成功
     */
    async testConnection() {
        try {
            // 先嘗試簡單的 auth 請求，確保客戶端可用
            const { error: authError } = await this.client.auth.getSession();
            if (authError && authError.name !== 'AuthSessionMissingError') {
                throw authError;
            }
            
            // 嘗試查詢 site_settings（表可能不存在，這不應該算失敗）
            try {
                await this.client
                    .from('site_settings')
                    .select('id')
                    .limit(1);
            } catch (tableError) {
                // 表不存在或無權訪問，不算連接失敗
                console.warn('⚠️ site_settings 表可能不存在:', tableError.message);
            }
            
            return true;
        } catch (error) {
            window.logger?.error('Supabase 連接測試失敗', { error: error.message });
            return false;
        }
    }

    /**
     * 處理連接錯誤
     * @param {Error} error 錯誤對象
     */
    handleConnectionError(error) {
        this.isConnected = false;
        this.connectionAttempts++;
        
        window.logger?.error('Supabase 連接失敗', {
            error: error.message,
            attempt: this.connectionAttempts,
            maxRetries: this.maxRetries
        });

        // 自動重試機制
        if (this.connectionAttempts < this.maxRetries) {
            window.logger?.info(`嘗試重新連接 (${this.connectionAttempts}/${this.maxRetries})`);
            setTimeout(() => {
                this.init();
            }, this.retryDelay * this.connectionAttempts);
        } else {
            window.logger?.error('Supabase 連接重試次數已達上限');
            
            // 顯示用戶友好的錯誤訊息
            if (window.showToast) {
                window.showToast('資料庫連接失敗，請稍後再試', 'error');
            }
        }
    }

    /**
     * 安全地執行資料庫查詢
     * @param {Function} operation 查詢操作函數
     * @param {Object} options 選項
     * @returns {Promise<Object>} 查詢結果
     */
    async safeQuery(operation, options = {}) {
        const { 
            timeout = 10000, 
            retries = 2, 
            errorMessage = '資料庫操作失敗' 
        } = options;

        if (!this.isConnected) {
            throw new Error('資料庫未連接');
        }

        let lastError;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('查詢超時')), timeout);
                });

                const result = await Promise.race([
                    operation(this.client),
                    timeoutPromise
                ]);

                window.logger?.debug('資料庫查詢成功', {
                    operation: operation.name,
                    attempt: attempt + 1
                });

                return result;
                
            } catch (error) {
                lastError = error;
                
                window.logger?.warn('資料庫查詢失敗，正在重試', {
                    error: error.message,
                    attempt: attempt + 1,
                    maxRetries: retries + 1
                });

                if (attempt < retries) {
                    // 指數退避重試
                    await new Promise(resolve => 
                        setTimeout(resolve, Math.pow(2, attempt) * 1000)
                    );
                }
            }
        }

        // 所有重試都失敗
        window.logger?.error('資料庫查詢最終失敗', {
            error: lastError.message,
            operation: operation.name
        });

        throw new Error(`${errorMessage}: ${lastError.message}`);
    }

    /**
     * 檢查用戶是否為管理員
     * @returns {Promise<boolean>} 是否為管理員
     */
    async checkIsAdmin() {
        try {
            const { data: { session } } = await this.client.auth.getSession();
            if (!session) return false;

            const { data, error } = await this.client
                .rpc('is_admin');

            if (error) {
                console.warn('檢查管理員權限失敗:', error.message);
                return false;
            }

            return data || false;
        } catch (error) {
            console.warn('檢查管理員權限錯誤:', error.message);
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
            console.error('登入失敗:', error.message);
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

    /**
     * 獲取連接狀態信息
     * @returns {Object} 連接狀態
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            connectionAttempts: this.connectionAttempts,
            maxRetries: this.maxRetries,
            clientAvailable: this.client !== null
        };
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
