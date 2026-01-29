-- ACG 收藏庫統計分析系統 SQL 整合腳本
-- 版本: v6.0.1
-- 目的: 建立完整的統計分析資料庫結構

-- ========================================
-- 1. 訪客統計表 (site_visitors)
-- ========================================
CREATE TABLE IF NOT EXISTS site_visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(100) NOT NULL UNIQUE,
    first_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_site_visitors_visitor_id ON site_visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_site_visitors_last_visit ON site_visitors(last_visit);

-- ========================================
-- 2. 網站分析統計表 (site_analytics)
-- ========================================
CREATE TABLE IF NOT EXISTS site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    page_url TEXT,
    event_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_site_analytics_event_type ON site_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_site_analytics_visitor_id ON site_analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_site_analytics_timestamp ON site_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_site_analytics_event_data ON site_analytics USING GIN(event_data);

-- ========================================
-- 3. 作品列表表 (anime_list) - 如果不存在
-- ========================================
CREATE TABLE IF NOT EXISTS anime_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'anime',
    year VARCHAR(10),
    season VARCHAR(10),
    month VARCHAR(10),
    episodes VARCHAR(50),
    rating VARCHAR(10),
    recommendation VARCHAR(20),
    description TEXT,
    poster_url TEXT,
    links JSONB,
    extra_data JSONB,
    star_color VARCHAR(20),
    name_color VARCHAR(20),
    desc_color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_anime_list_category ON anime_list(category);
CREATE INDEX IF NOT EXISTS idx_anime_list_rating ON anime_list(rating);
CREATE INDEX IF NOT EXISTS idx_anime_list_year ON anime_list(year);
CREATE INDEX IF NOT EXISTS idx_anime_list_created_at ON anime_list(created_at DESC);

-- ========================================
-- 4. 網站設定表 (site_settings) - 如果不存在
-- ========================================
CREATE TABLE IF NOT EXISTS site_settings (
    id VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入預設設定（如果不存在）
INSERT INTO site_settings (id, value) VALUES 
('site_title', 'ACG 收藏庫'),
('announcement', '⚡ 系統連線中 // 歡迎光臨 ⚡'),
('title_color', '#ffffff'),
('announcement_color', '#ffffff'),
('admin_name', '管理員'),
('admin_avatar', 'https://cdn.discordapp.com/embed/avatars/0.png'),
('admin_color', '#00ffff'),
('custom_labels', '{}'),
('options_data', '{}')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 5. 公告表 (announcements) - 如果不存在
-- ========================================
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_urls JSONB,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned ON announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- ========================================
-- 6. 建立觸發器以自動更新 updated_at 欄位
-- ========================================
-- site_visitors 表的觸發器
CREATE OR REPLACE FUNCTION update_site_visitors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_site_visitors_updated_at ON site_visitors;
CREATE TRIGGER trigger_site_visitors_updated_at
    BEFORE UPDATE ON site_visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_site_visitors_updated_at();

-- anime_list 表的觸發器
CREATE OR REPLACE FUNCTION update_anime_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_anime_list_updated_at ON anime_list;
CREATE TRIGGER trigger_anime_list_updated_at
    BEFORE UPDATE ON anime_list
    FOR EACH ROW
    EXECUTE FUNCTION update_anime_list_updated_at();

-- site_settings 表的觸發器
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_site_settings_updated_at ON site_settings;
CREATE TRIGGER trigger_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();

-- announcements 表的觸發器
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_announcements_updated_at ON announcements;
CREATE TRIGGER trigger_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_announcements_updated_at();

-- ========================================
-- 7. 建立統計查詢視圖
-- ========================================
-- 每日統計視圖
CREATE OR REPLACE VIEW daily_analytics AS
SELECT 
    DATE(timestamp) as date,
    event_type,
    COUNT(*) as count,
    COUNT(DISTINCT visitor_id) as unique_visitors
FROM site_analytics 
GROUP BY DATE(timestamp), event_type
ORDER BY date DESC, event_type;

-- 總體統計視圖
CREATE OR REPLACE VIEW overall_analytics AS
SELECT 
    'total_visits' as metric,
    COUNT(*) as value
FROM site_analytics 
WHERE event_type = 'page_view'
UNION ALL
SELECT 
    'total_category_clicks' as metric,
    COUNT(*) as value
FROM site_analytics 
WHERE event_type = 'category_click'
UNION ALL
SELECT 
    'unique_visitors' as metric,
    COUNT(DISTINCT visitor_id) as value
FROM site_visitors;

-- ========================================
-- 8. 資料清理函數
-- ========================================
-- 清理超過 90 天的舊分析數據
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM site_analytics 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 9. 權限設定 (根據你的 Supabase 設定調整)
-- ========================================
-- 給予匿名用戶讀取權限
-- GRANT SELECT ON site_visitors TO anon;
-- GRANT SELECT ON site_analytics TO anon;
-- GRANT SELECT ON anime_list TO anon;
-- GRANT SELECT ON site_settings TO anon;
-- GRANT SELECT ON announcements TO anon;

-- 給予認證用戶完整權限
-- GRANT ALL ON site_visitors TO authenticated;
-- GRANT ALL ON site_analytics TO authenticated;
-- GRANT ALL ON anime_list TO authenticated;
-- GRANT ALL ON site_settings TO authenticated;
-- GRANT ALL ON announcements TO authenticated;

-- ========================================
-- 10. 完成訊息
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ACG 收藏庫統計分析系統 SQL 整合完成';
    RAISE NOTICE '版本: v6.0.1';
    RAISE NOTICE '已建立以下表格:';
    RAISE NOTICE '- site_visitors (訪客統計)';
    RAISE NOTICE '- site_analytics (網站分析)';
    RAISE NOTICE '- anime_list (作品列表)';
    RAISE NOTICE '- site_settings (網站設定)';
    RAISE NOTICE '- announcements (公告系統)';
    RAISE NOTICE '已建立索引和觸發器';
    RAISE NOTICE '已建立統計視圖和清理函數';
    RAISE NOTICE '========================================';
END $$;