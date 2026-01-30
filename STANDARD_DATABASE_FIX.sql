-- ACG 收藏庫 - 終極修復腳本 v5 (PostgreSQL 標準語法)
-- 一次性解決所有問題，使用標準 PostgreSQL 語法
-- ==========================================

BEGIN;

-- 清理所有表
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS anime_list CASCADE;
DROP TABLE IF EXISTS visitor_sessions CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS category_clicks CASCADE;
DROP TABLE IF EXISTS real_time_stats CASCADE;
DROP TABLE IF EXISTS site_visitors CASCADE;
DROP TABLE IF EXISTS site_analytics CASCADE;
DROP TABLE IF EXISTS unique_visitors CASCADE;

-- 創建核心應用表
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_urls JSONB,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE site_settings (
    id VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE anime_list (
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

-- 創建分析表
CREATE TABLE visitor_sessions (
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

CREATE TABLE page_views (
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

CREATE TABLE category_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
    visitor_id VARCHAR(255) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    click_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    page_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE real_time_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_type VARCHAR(20) NOT NULL CHECK (stat_type IN ('total_visits', 'total_clicks', 'unique_visitors')),
    stat_value BIGINT NOT NULL DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    source VARCHAR(20) NOT NULL DEFAULT 'manual',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE site_visitors (
    visitor_id VARCHAR(100) PRIMARY KEY,
    first_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX idx_announcements_is_pinned ON announcements(is_pinned);
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_site_settings_id ON site_settings(id);
CREATE INDEX idx_anime_list_category ON anime_list(category);
CREATE INDEX idx_anime_list_rating ON anime_list(rating);
CREATE INDEX idx_anime_list_year ON anime_list(year);
CREATE INDEX idx_anime_list_created_at ON anime_list(created_at DESC);
CREATE INDEX idx_visitor_sessions_visitor_id ON visitor_sessions(visitor_id);
CREATE INDEX idx_visitor_sessions_first_seen ON visitor_sessions(first_seen DESC);
CREATE INDEX idx_visitor_sessions_device_fingerprint ON visitor_sessions(device_fingerprint);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);
CREATE INDEX idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX idx_page_views_timestamp ON page_views(view_timestamp DESC);
CREATE INDEX idx_category_clicks_session_id ON category_clicks(session_id);
CREATE INDEX idx_category_clicks_visitor_id ON category_clicks(visitor_id);
CREATE INDEX idx_category_clicks_timestamp ON category_clicks(click_timestamp DESC);
CREATE INDEX idx_real_time_stats_type_recorded ON real_time_stats(stat_type, recorded_at DESC);
CREATE INDEX idx_site_visitors_visitor_id ON site_visitors(visitor_id);
CREATE INDEX idx_site_visitors_last_visit ON site_visitors(last_visit DESC);

-- 創建觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器
DROP TRIGGER IF EXISTS trigger_announcements_updated_at ON announcements;
CREATE TRIGGER trigger_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_site_settings_updated_at ON site_settings;
CREATE TRIGGER trigger_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_anime_list_updated_at ON anime_list;
CREATE TRIGGER trigger_anime_list_updated_at
    BEFORE UPDATE ON anime_list
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_visitor_sessions_updated_at ON visitor_sessions;
CREATE TRIGGER trigger_visitor_sessions_updated_at
    BEFORE UPDATE ON visitor_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_site_visitors_updated_at ON site_visitors;
CREATE TRIGGER trigger_site_visitors_updated_at
    BEFORE UPDATE ON site_visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 設置 RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 政策
DROP POLICY IF EXISTS "announcements_full_access" ON announcements;
CREATE POLICY "announcements_full_access" ON announcements FOR ALL USING (true);

DROP POLICY IF EXISTS "site_settings_full_access" ON site_settings;
CREATE POLICY "site_settings_full_access" ON site_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "anime_list_full_access" ON anime_list;
CREATE POLICY "anime_list_full_access" ON anime_list FOR ALL USING (true);

DROP POLICY IF EXISTS "visitor_sessions_full_access" ON visitor_sessions;
CREATE POLICY "visitor_sessions_full_access" ON visitor_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "page_views_full_access" ON page_views;
CREATE POLICY "page_views_full_access" ON page_views FOR ALL USING (true);

DROP POLICY IF EXISTS "category_clicks_full_access" ON category_clicks;
CREATE POLICY "category_clicks_full_access" ON category_clicks FOR ALL USING (true);

DROP POLICY IF EXISTS "real_time_stats_full_access" ON real_time_stats;
CREATE POLICY "real_time_stats_full_access" ON real_time_stats FOR ALL USING (true);

DROP POLICY IF EXISTS "site_visitors_full_access" ON site_visitors;
CREATE POLICY "site_visitors_full_access" ON site_visitors FOR ALL USING (true);

-- 插入初始資料
INSERT INTO site_settings (id, value) VALUES 
('site_title', 'ACG 收藏庫'),
('announcement', 'System Online // Welcome'),
('title_color', '#ffffff'),
('announcement_color', '#ffffff'),
('admin_name', 'Administrator'),
('admin_avatar', 'https://cdn.discordapp.com/embed/avatars/0.png'),
('admin_color', '#00ffff'),
('custom_labels', '{}'),
('options_data', '{}'),
('db_version', '6.1.0'),
('db_updated', '2026-01-30'),
('all_tables_recreated', 'true'),
('session_id_fixed', 'true'),
('is_pinned_fixed', 'true'),
('syntax_error_fixed', 'true')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO real_time_stats (stat_type, stat_value, source, metadata) VALUES
('total_visits', 0, 'system', '{"description": "Initial visit count"}'),
('total_clicks', 0, 'system', '{"description": "Initial click count"}'),
('unique_visitors', 0, 'system', '{"description": "Initial visitor count"}')
ON CONFLICT DO NOTHING;

COMMIT;

-- 驗證結果
SELECT 
    'VERIFICATION' as check_type,
    table_name,
    column_name,
    'EXISTS' as status
FROM information_schema.columns 
WHERE table_name IN ('announcements', 'visitor_sessions', 'page_views', 'category_clicks') 
AND column_name IN ('is_pinned', 'session_id')
ORDER BY table_name, column_name;