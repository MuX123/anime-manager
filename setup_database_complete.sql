-- ============================================================================
-- 完整的資料庫初始化腳本（整合所有表與 RLS 政策）
-- 包含去重邏輯，避免重複插入數據
-- ============================================================================

-- ============================================================================
-- announcements 表（公告板塊）
-- ============================================================================

-- 創建公告表
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    image_urls JSONB DEFAULT '[]'::jsonb,
    author_name TEXT NOT NULL DEFAULT '管理員',
    author_avatar TEXT,
    author_color TEXT DEFAULT '#00ffff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- ============================================================================
-- anime_list 表（作品列表）
-- ============================================================================

-- 創建作品表
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

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_anime_list_category ON anime_list(category);
CREATE INDEX IF NOT EXISTS idx_anime_list_rating ON anime_list(rating);
CREATE INDEX IF NOT EXISTS idx_anime_list_created_at ON anime_list(created_at);

-- ============================================================================
-- site_settings 表（網站設定）
-- ============================================================================

-- 創建設定表
CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入預設設定（使用 ON CONFLICT 避免重複）
INSERT INTO site_settings (id, value)
VALUES
    ('site_title', 'ACG 收藏庫'),
    ('announcement', '⚡ 系統連線中 // 歡迎光臨 ⚡'),
    ('title_color', '#ffffff'),
    ('announcement_color', '#ffffff'),
    ('admin_name', '管理員'),
    ('admin_avatar', 'https://cdn.discordapp.com/embed/avatars/0.png'),
    ('admin_color', '#00ffff'),
    ('admin_email', 'admin@acg-manager.com')
ON CONFLICT (id) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW()
WHERE site_settings.id = EXCLUDED.id;

-- ============================================================================
-- site_visitors 表（訪客記錄）
-- ============================================================================

-- 創建訪客表
CREATE TABLE IF NOT EXISTS site_visitors (
    visitor_id TEXT PRIMARY KEY,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_site_visitors_last_visit ON site_visitors(last_visit);

-- ============================================================================
-- category_clicks 表（板塊切換點擊）
-- ============================================================================

-- 創建點擊統計表
CREATE TABLE IF NOT EXISTS category_clicks (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    category TEXT NOT NULL,
    click_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_category_clicks_visitor_id ON category_clicks(visitor_id);
CREATE INDEX IF NOT EXISTS idx_category_clicks_timestamp ON category_clicks(click_timestamp);

-- ============================================================================
-- page_views 表（頁面訪問）
-- ============================================================================

-- 創建頁面瀏覽表
CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    page_url TEXT,
    page_title TEXT,
    view_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(view_timestamp);

-- ============================================================================
-- ============================================================================

-- 啟用 RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ============================================================================

-- 公告：公開讀、僅管理員可寫

-- 管理員判斷函式（以 site_settings.admin_email 比對 JWT email）
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    auth.role() = 'authenticated'
    AND (auth.jwt() ->> 'email') IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM site_settings s
      WHERE s.id = 'admin_email'
        AND s.value = (auth.jwt() ->> 'email')
    );
$$;

-- 重置公告政策，避免重複與衝突
DROP POLICY IF EXISTS "Enable all for announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous insert to announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous select to announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous update to announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous delete to announcements" ON announcements;
DROP POLICY IF EXISTS "Public read access" ON announcements;
DROP POLICY IF EXISTS "Public insert" ON announcements;
DROP POLICY IF EXISTS "Public update" ON announcements;
DROP POLICY IF EXISTS "Public delete" ON announcements;
DROP POLICY IF EXISTS "Authenticated insert" ON announcements;
DROP POLICY IF EXISTS "Authenticated update" ON announcements;
DROP POLICY IF EXISTS "Authenticated delete" ON announcements;

-- 最終政策：公開讀、僅管理員可寫
CREATE POLICY "Public read access" ON announcements
    FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON announcements
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated update" ON announcements
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated delete" ON announcements
    FOR DELETE USING (public.is_admin());

-- anime_list 表：完全公開
DROP POLICY IF EXISTS "Allow anonymous operations" ON anime_list;
DROP POLICY IF EXISTS "Allow anonymous insert to anime_list" ON anime_list;
DROP POLICY IF EXISTS "Allow anonymous select to anime_list" ON anime_list;
DROP POLICY IF EXISTS "Allow anonymous update to anime_list" ON anime_list;
DROP POLICY IF EXISTS "Allow anonymous delete to anime_list" ON anime_list;

CREATE POLICY "Allow anonymous operations" ON anime_list
    FOR ALL USING (true) WITH CHECK (true);

-- site_settings 表：僅認證用戶可讀寫（敏感設定）
DROP POLICY IF EXISTS "Enable all for site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow anonymous read to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated read" ON site_settings;
DROP POLICY IF EXISTS "Authenticated write" ON site_settings;

CREATE POLICY "Authenticated read" ON site_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write" ON site_settings
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- site_visitors 表：匿名訪問
DO $$
DECLARE
    p TEXT;
BEGIN
    FOR p IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'site_visitors'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(p) || ' ON site_visitors';
    END LOOP;
END $$;

ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON site_visitors
    FOR SELECT USING (true);

CREATE POLICY "Public insert" ON site_visitors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update" ON site_visitors
    FOR UPDATE USING (true);

-- category_clicks 表：匿名訪問
DO $$
DECLARE
    p TEXT;
BEGIN
    FOR p IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'category_clicks'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(p) || ' ON category_clicks';
    END LOOP;
END $$;

ALTER TABLE category_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON category_clicks
    FOR SELECT USING (true);

CREATE POLICY "Public insert" ON category_clicks
    FOR INSERT WITH CHECK (true);

-- page_views 表：匿名訪問
DO $$
DECLARE
    p TEXT;
BEGIN
    FOR p IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'page_views'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(p) || ' ON page_views';
    END LOOP;
END $$;

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON page_views
    FOR SELECT USING (true);

CREATE POLICY "Public insert" ON page_views
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 顯示所有表的狀態
-- ============================================================================
SELECT
    schemaname,
    tablename,
    rowsecurity as has_rls,
    tableowner
FROM pg_tables
WHERE tablename IN ('announcements', 'anime_list', 'site_settings', 'site_visitors', 'category_clicks', 'page_views')
ORDER BY tablename;

-- 輸出初始化完成通知
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database initialization completed';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables: announcements, anime_list, site_settings, site_visitors, category_clicks, page_views';
    RAISE NOTICE 'RLS policies: Public read/write for all tables (except site_settings)';
    RAISE NOTICE '========================================';
END $$;
