-- ============================================================================
-- ACG 收藏庫 - 資料庫初始化
-- 使用 Supabase Auth 管理員認證
-- ============================================================================

-- ============================================================================
-- 資料表結構
-- ============================================================================

CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '公告',
    content TEXT NOT NULL,
    image_urls JSONB DEFAULT '[]'::jsonb,
    author_name TEXT NOT NULL DEFAULT '管理員',
    author_avatar TEXT,
    author_color TEXT DEFAULT '#00ffff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anime_list (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    genre TEXT[] DEFAULT '{}',
    year TEXT,
    season TEXT,
    month TEXT,
    episodes TEXT,
    rating TEXT,
    recommendation TEXT DEFAULT '★',
    type TEXT,
    poster_url TEXT,
    links JSONB DEFAULT '[]'::jsonb,
    extra_data JSONB DEFAULT '{}'::jsonb,
    category TEXT DEFAULT 'anime',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_visitors (
    visitor_id TEXT PRIMARY KEY,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category_clicks (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    category TEXT NOT NULL,
    click_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    page_url TEXT,
    page_title TEXT,
    view_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 索引
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_title ON announcements(title);
CREATE INDEX IF NOT EXISTS idx_anime_list_category ON anime_list(category);
CREATE INDEX IF NOT EXISTS idx_anime_list_rating ON anime_list(rating);
CREATE INDEX IF NOT EXISTS idx_anime_list_created_at ON anime_list(created_at);
CREATE INDEX IF NOT EXISTS idx_site_visitors_last_visit ON site_visitors(last_visit);
CREATE INDEX IF NOT EXISTS idx_category_clicks_visitor_id ON category_clicks(visitor_id);
CREATE INDEX IF NOT EXISTS idx_category_clicks_timestamp ON category_clicks(click_timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(view_timestamp);

-- ============================================================================
-- 預設設定
-- ============================================================================

INSERT INTO site_settings (id, value) VALUES
    ('site_title', 'ACG 收藏庫'),
    ('announcement', '⚡ 系統連線中 // 歡迎光臨 ⚡'),
    ('title_color', '#ffffff'),
    ('announcement_color', '#ffffff'),
    ('admin_name', '管理員'),
    ('admin_avatar', 'https://cdn.discordapp.com/embed/avatars/0.png'),
    ('admin_color', '#00ffff'),
    ('admin_email', 'admin@acg-manager.com')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- ============================================================================
-- 啟用 RLS
-- ============================================================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 管理員判斷函式
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM site_settings s
      WHERE s.id = 'admin_email'
        AND s.value = (auth.jwt() ->> 'email')
    );
$$;

-- ============================================================================
-- RLS 政策
-- ============================================================================

-- announcements：公開讀、管理員寫
DROP POLICY IF EXISTS "Public read announcements" ON announcements;
DROP POLICY IF EXISTS "Admin full access announcements" ON announcements;

CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admin full access announcements" ON announcements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- anime_list：完全公開（展示用）
DROP POLICY IF EXISTS "Public anime_list" ON anime_list;
CREATE POLICY "Public anime_list" ON anime_list FOR ALL USING (true) WITH CHECK (true);

-- site_settings：僅管理員讀寫
DROP POLICY IF EXISTS "Admin site_settings" ON site_settings;
CREATE POLICY "Admin site_settings" ON site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 統計表：公開寫、僅管理員讀
DROP POLICY IF EXISTS "Public insert visitors" ON site_visitors;
DROP POLICY IF EXISTS "Admin read visitors" ON site_visitors;
CREATE POLICY "Public insert visitors" ON site_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read visitors" ON site_visitors FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Public insert clicks" ON category_clicks;
DROP POLICY IF EXISTS "Admin read clicks" ON category_clicks;
CREATE POLICY "Public insert clicks" ON category_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read clicks" ON category_clicks FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Public insert page_views" ON page_views;
DROP POLICY IF EXISTS "Admin read page_views" ON page_views;
CREATE POLICY "Public insert page_views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read page_views" ON page_views FOR SELECT USING (public.is_admin());

-- ============================================================================
-- 狀態檢查
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '資料庫初始化完成';
    RAISE NOTICE '========================================';
    RAISE NOTICE '管理員設定：請在 site_settings 中設定 admin_email';
    RAISE NOTICE 'RLS 已啟用所有資料表';
    RAISE NOTICE '========================================';
END $$;
