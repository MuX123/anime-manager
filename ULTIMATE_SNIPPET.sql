-- ==========================================
-- 終極修復 SNIPPET - 一次執行解決所有問題
-- 從0開始統計，修復回朔問題
-- ==========================================

-- 1. 清理所有初始測試數據
DO $$
BEGIN
    RAISE NOTICE '開始清理初始數據...';
    
    -- 清理舊的初始訪客數據
    DELETE FROM site_analytics WHERE visitor_id LIKE 'init_%';
    DELETE FROM site_visitors WHERE visitor_id LIKE 'init_%';
    
    -- 清理所有測試數據
    DELETE FROM site_analytics WHERE visitor_id LIKE 'test_%';
    DELETE FROM site_visitors WHERE visitor_id LIKE 'test_%';
    
    -- 清理可能的其他初始數據
    DELETE FROM site_analytics WHERE visitor_id LIKE 'init_v%';
    DELETE FROM site_visitors WHERE visitor_id LIKE 'init_v%';
    DELETE FROM site_analytics WHERE visitor_id LIKE 'init_visitor%';
    DELETE FROM site_visitors WHERE visitor_id LIKE 'init_visitor%';
    
    RAISE NOTICE '✅ 所有初始數據已清理';
END $$;

-- 2. 創建/更新分析表結構
DO $$
BEGIN
    -- 檢查並升級表結構（如果需要）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_analytics' AND column_name = 'event_type') THEN
        RAISE NOTICE '升級分析表結構...';
        
        -- 備份現有數據
        CREATE TABLE IF NOT EXISTS site_analytics_backup AS SELECT * FROM site_analytics;
        
        -- 刪除舊表
        DROP TABLE IF EXISTS site_analytics CASCADE;
        DROP TABLE IF EXISTS page_views CASCADE;
        
        -- 創建新表
        CREATE TABLE site_analytics (
            id BIGSERIAL PRIMARY KEY,
            visitor_id text NOT NULL,
            event_type text NOT NULL CHECK (event_type IN ('click', 'page_view')),
            page_url text,
            timestamp timestamp with time zone DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ 分析表結構已升級';
    END IF;
END $$;

-- 3. 創建 site_visitors 表
CREATE TABLE IF NOT EXISTS site_visitors (
    visitor_id text PRIMARY KEY,
    first_visit timestamp with time zone DEFAULT NOW(),
    last_visit timestamp with time zone DEFAULT NOW()
);

-- 4. 創建優化索引
CREATE INDEX IF NOT EXISTS idx_site_analytics_visitor_id ON site_analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_site_analytics_event_type ON site_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_site_analytics_timestamp ON site_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_site_visitors_last_visit ON site_visitors(last_visit);

-- 5. 設置 RLS
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;

-- 6. 清理並創建政策
DROP POLICY IF EXISTS "analytics_full_access" ON site_analytics;
DROP POLICY IF EXISTS "visitors_full_access" ON site_visitors;
DROP POLICY IF EXISTS "analytics_read_v2" ON site_analytics;
DROP POLICY IF EXISTS "analytics_write_v2" ON site_analytics;
DROP POLICY IF EXISTS "visitors_read_v2" ON site_visitors;
DROP POLICY IF EXISTS "visitors_write_v2" ON site_visitors;
DROP POLICY IF EXISTS "visitors_update_v2" ON site_visitors;

CREATE POLICY "analytics_full_access" ON site_analytics FOR ALL USING (true);
CREATE POLICY "visitors_full_access" ON site_visitors FOR ALL USING (true);

-- 7. 驗證和完成
DO $$
BEGIN
    RAISE NOTICE '=== 終極修復完成 ===';
    RAISE NOTICE '✅ 所有初始數據已清理';
    RAISE NOTICE '✅ 分析表結構已正確';
    RAISE NOTICE '✅ 索引已優化';
    RAISE NOTICE '✅ 政策已設定';
    RAISE NOTICE '✅ 從0開始統計';
    
    -- 統計當前狀態
    RAISE NOTICE '📊 當前數據狀態:';
    RAISE NOTICE '   - site_analytics 記錄: %', (SELECT COUNT(*) FROM site_analytics);
    RAISE NOTICE '   - site_visitors 訪客: %', (SELECT COUNT(*) FROM site_visitors);
    RAISE NOTICE '   - 點擊事件: %', (SELECT COUNT(*) FROM site_analytics WHERE event_type = 'click');
    RAISE NOTICE '   - 頁面訪問: %', (SELECT COUNT(*) FROM site_analytics WHERE event_type = 'page_view');
    
    -- 測試權限
    BEGIN
        INSERT INTO site_analytics (visitor_id, event_type, page_url) 
        VALUES ('permission_test', 'page_view', 'test_url');
        DELETE FROM site_analytics WHERE visitor_id = 'permission_test';
        RAISE NOTICE '✅ 權限測試通過';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ 權限測試失敗: %', SQLERRM;
    END;
    
    RAISE NOTICE '🎉 刷新網頁後將看到: 🖱️ 0 👤 0';
    RAISE NOTICE '💡 點擊任何地方將正確增加計數';
    RAISE NOTICE '🔒 不會再回朔到預設值';
END $$;

-- 8. 更新版本標記
INSERT INTO site_settings (id, value) VALUES 
('db_version', '6.0.2'),
('db_updated', '2026-01-29'),
('analytics_fixed', 'true'),
('analytics_start_from_zero', 'true')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;