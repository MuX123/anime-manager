-- ==========================================
-- ACG 收藏庫 - 真實統計系統 SQL Schema
-- 用於實現準確的訪問次數、版面點擊、訪客數統計
-- ==========================================

-- 1. 訪客會話表 (visitor_sessions)
CREATE TABLE IF NOT EXISTS visitor_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(255) NOT NULL,
    first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    session_duration INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    category_clicks INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address INET,
    country_code VARCHAR(2),
    device_fingerprint VARCHAR(64),
    is_unique_visitor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 實時統計表 (real_time_stats) - 修復版本兼容性
CREATE TABLE IF NOT EXISTS real_time_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_type VARCHAR(20) NOT NULL CHECK (stat_type IN ('total_visits', 'total_clicks', 'unique_visitors')),
    stat_value BIGINT NOT NULL DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    source VARCHAR(20) NOT NULL DEFAULT 'manual',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加版本兼容性檢查
ALTER TABLE real_time_stats 
ADD COLUMN IF NOT EXISTS api_version VARCHAR(10) DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS migration_version VARCHAR(10) DEFAULT '1.0';

-- 3. 頁面瀏覽記錄表 (page_views) - 修復：添加 session_id 關聯和依賴
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
    visitor_id VARCHAR(255) NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    time_on_page INTEGER DEFAULT 0,
    view_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 確保正確的關聯配置
ALTER TABLE page_views 
DROP CONSTRAINT IF EXISTS page_views_session_id_fkey,
ADD CONSTRAINT page_views_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES visitor_sessions(session_id) ON DELETE CASCADE;

-- 4. 分類點擊記錄表 (category_clicks)
CREATE TABLE IF NOT EXISTS category_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
    visitor_id VARCHAR(255) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    click_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    page_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 訪客去重表 (unique_visitors)
CREATE TABLE IF NOT EXISTS unique_visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(255) NOT NULL UNIQUE,
    first_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    total_visits INTEGER DEFAULT 1,
    total_sessions INTEGER DEFAULT 1,
    country_code VARCHAR(2),
    device_type VARCHAR(50),
    browser_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. 建立索引以提升查詢效能
-- ==========================================

-- 訪客會話索引
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id ON visitor_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_first_seen ON visitor_sessions(first_seen DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_device_fingerprint ON visitor_sessions(device_fingerprint);

-- 實時統計索引
CREATE INDEX IF NOT EXISTS idx_real_time_stats_type_recorded ON real_time_stats(stat_type, recorded_at DESC);

-- 頁面瀏覽記錄索引
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(view_timestamp DESC);

-- 分類點擊記錄索引
CREATE INDEX IF NOT EXISTS idx_category_clicks_session_id ON category_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_category_clicks_visitor_id ON category_clicks(visitor_id);
CREATE INDEX IF NOT EXISTS idx_category_clicks_timestamp ON category_clicks(click_timestamp DESC);

-- 訪客去重表索引
CREATE INDEX IF NOT EXISTS idx_unique_visitors_visitor_id ON unique_visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_unique_visitors_first_visit ON unique_visitors(first_visit DESC);

-- ==========================================
-- 7. 創建觸發器以自動更新時間戳
-- ==========================================

-- 更新會話最後訪問時間
CREATE OR REPLACE FUNCTION update_session_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_last_seen
    BEFORE UPDATE ON visitor_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_last_seen();

-- 更新訪客統計
CREATE OR REPLACE FUNCTION update_visitor_stats()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_visits = NEW.total_visits + 1;
    NEW.last_visit = NEW.last_visit;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_visitor_stats
    BEFORE UPDATE ON unique_visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_visitor_stats();

-- ==========================================
-- 8. 插入初始實時統計數據
-- ==========================================

INSERT INTO real_time_stats (stat_type, stat_value, source, metadata) VALUES
('total_visits', 0, 'system', '{"description": "初始訪問次數"}'),
('total_clicks', 0, 'system', '{"description": "初始版面點擊次數"}'),
('unique_visitors', 0, 'system', '{"description": "初始唯一訪客數"}')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 9. 建立統計視圖以便快速查詢 - 修復：優化查詢性能
-- ==========================================
-- 每小時統計視圖
CREATE OR REPLACE VIEW hourly_stats AS
SELECT 
    DATE_TRUNC('hour', recorded_at) AT TIME ZONE 'UTC' as hour,
    SUM(CASE WHEN stat_type = 'total_visits' THEN stat_value ELSE 0 END) as visits,
    SUM(CASE WHEN stat_type = 'total_clicks' THEN stat_value ELSE 0 END) as clicks,
    SUM(CASE WHEN stat_type = 'unique_visitors' THEN stat_value ELSE 0 END) as unique_visitors
FROM real_time_stats 
WHERE recorded_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', recorded_at AT TIME ZONE 'UTC')
ORDER BY hour DESC;

-- 每日統計視圖
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
    DATE(recorded_at AT TIME ZONE 'UTC') as date,
    SUM(CASE WHEN stat_type = 'total_visits' THEN stat_value ELSE 0 END) as visits,
    SUM(CASE WHEN stat_type = 'total_clicks' THEN stat_value ELSE 0 END) as clicks,
    SUM(CASE WHEN stat_type = 'unique_visitors' THEN stat_value ELSE 0 END) as unique_visitors
FROM real_time_stats 
WHERE recorded_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(recorded_at AT TIME ZONE 'UTC')
ORDER BY date DESC;

-- 當前活躍會話數
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    COUNT(*) as active_sessions,
    COUNT(DISTINCT visitor_id) as unique_visitors_today
FROM visitor_sessions 
WHERE last_seen > NOW() - INTERVAL '30 minutes';
SELECT 
    DATE_TRUNC('hour', recorded_at) as hour,
    SUM(CASE WHEN stat_type = 'total_visits' THEN stat_value ELSE 0 END) as visits,
    SUM(CASE WHEN stat_type = 'total_clicks' THEN stat_value ELSE 0 END) as clicks,
    SUM(CASE WHEN stat_type = 'unique_visitors' THEN stat_value ELSE 0 END) as unique_visitors
FROM real_time_stats 
WHERE recorded_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', recorded_at)
ORDER BY hour DESC;

-- 每日統計
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
    DATE(recorded_at) as date,
    SUM(CASE WHEN stat_type = 'total_visits' THEN stat_value ELSE 0 END) as visits,
    SUM(CASE WHEN stat_type = 'total_clicks' THEN stat_value ELSE 0 END) as clicks,
    SUM(CASE WHEN stat_type = 'unique_visitors' THEN stat_value ELSE 0 END) as unique_visitors
FROM real_time_stats 
WHERE recorded_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(recorded_at)
ORDER BY date DESC;

-- ==========================================
-- 10. 完成 - 修復版本兼容性和性能優化
-- ==========================================
-- 9. 建立統計視圖以便快速查詢 - 修復：優化查詢性能
-- ==========================================

-- 每小時統計視圖 - 添加索引以提升查詢速度
CREATE OR REPLACE VIEW hourly_stats AS
SELECT 
    DATE_TRUNC('hour', recorded_at AT TIME ZONE 'UTC') as hour,
    SUM(CASE WHEN stat_type = 'total_visits' THEN stat_value ELSE 0 END) as visits,
    SUM(CASE WHEN stat_type = 'total_clicks' THEN stat_value ELSE 0 END) as clicks,
    SUM(CASE WHEN stat_type = 'unique_visitors' THEN stat_value ELSE 0 END) as unique_visitors
FROM real_time_stats 
WHERE recorded_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', recorded_at AT TIME ZONE 'UTC')
ORDER BY hour DESC;

-- 每日統計視圖 - 保留舊視圖以向下兼容
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
    DATE(recorded_at AT TIME ZONE 'UTC') as date,
    SUM(CASE WHEN stat_type = 'total_visits' THEN stat_value ELSE 0 END) as visits,
    SUM(CASE WHEN stat_type = 'total_clicks' THEN stat_value ELSE 0 END) as clicks,
    SUM(CASE WHEN stat_type = 'unique_visitors' THEN stat_value ELSE 0 END) as unique_visitors
FROM real_time_stats 
WHERE recorded_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(recorded_at AT TIME ZONE 'UTC')
ORDER BY date DESC;

-- 當前活躍會話數
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    COUNT(*) as active_sessions,
    COUNT(DISTINCT visitor_id) as unique_visitors_today
FROM visitor_sessions 
WHERE last_seen > NOW() - INTERVAL '30 minutes';

-- 添加索引以優化小時統計查詢性能
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hourly_stats_hour ON hourly_stats(hour, recorded_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hourly_stats_date ON hourly_stats(date, recorded_at DESC);

DO $$
BEGIN
    RAISE NOTICE '✅ 真實統計系統資料庫結構建立完成';
    RAISE NOTICE '📊 建立的表格:';
    RAISE NOTICE '  - visitor_sessions (訪客會話)';
    RAISE NOTICE '  - real_time_stats (實時統計)';
    RAISE NOTICE '  - page_views (頁面瀏覽)';
    RAISE NOTICE '  - category_clicks (分類點擊)';
    RAISE NOTICE '  - unique_visitors (唯一訪客)';
    RAISE NOTICE '📊 建立的索引和觸發器已優化效能';
    RAISE NOTICE '🎯 系統準備就緒，可以開始實現真實統計功能';
END $$;