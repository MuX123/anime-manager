-- ============================================================================
-- ACG 收藏庫 - 資料庫初始化 v8.0.0
-- 使用 Supabase Auth 管理員認證
-- ============================================================================

-- ============================================================================
-- 資料表結構
-- ============================================================================

-- 公告表
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '公告',
    content TEXT NOT NULL,
    image_urls JSONB DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    author_name TEXT NOT NULL DEFAULT '管理員',
    author_avatar TEXT,
    author_color TEXT DEFAULT '#00ffff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新內容表
CREATE TABLE IF NOT EXISTS updates (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version TEXT NOT NULL,
    image_urls JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    author_name TEXT NOT NULL DEFAULT '管理員',
    author_color TEXT DEFAULT '#00ffff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 留言板表
CREATE TABLE IF NOT EXISTS guestbook_messages (
    id BIGSERIAL PRIMARY KEY,
    nickname TEXT NOT NULL DEFAULT '匿名',
    content TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    approved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系統彈窗記錄表（追蹤哪些彈窗已顯示）
CREATE TABLE IF NOT EXISTS shown_popups (
    id BIGSERIAL PRIMARY KEY,
    popup_type TEXT NOT NULL CHECK (popup_type IN ('update', 'announcement')),
    popup_id BIGINT,
    visitor_id TEXT NOT NULL,
    shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(popup_type, popup_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS anime_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    star_color TEXT DEFAULT '#ffcc00',
    name_color TEXT DEFAULT '#ffffff',
    desc_color TEXT DEFAULT '#ffffff',
    description TEXT,
    youtube_url TEXT,
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
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_updates_created_at ON updates(created_at);
CREATE INDEX IF NOT EXISTS idx_updates_active ON updates(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_guestbook_status ON guestbook_messages(status);
CREATE INDEX IF NOT EXISTS idx_guestbook_ip ON guestbook_messages(ip_address);
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_shown_popups_visitor ON shown_popups(visitor_id);
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
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shown_popups ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access announcements" ON announcements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- updates：公開讀、管理員寫
DROP POLICY IF EXISTS "Public read updates" ON updates;
DROP POLICY IF EXISTS "Admin full access updates" ON updates;

CREATE POLICY "Public read updates" ON updates FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access updates" ON updates FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- guestbook_messages：公開插入、公開讀審核通過、管理員完全控制
DROP POLICY IF EXISTS "Public insert guestbook" ON guestbook_messages;
DROP POLICY IF EXISTS "Public read approved guestbook" ON guestbook_messages;
DROP POLICY IF EXISTS "Admin full access guestbook" ON guestbook_messages;

CREATE POLICY "Public insert guestbook" ON guestbook_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read approved guestbook" ON guestbook_messages FOR SELECT USING (status = 'approved');
CREATE POLICY "Admin full access guestbook" ON guestbook_messages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- shown_popups：公開寫、公開讀（用於追蹤已顯示的彈窗）
DROP POLICY IF EXISTS "Public insert shown_popups" ON shown_popups;
CREATE POLICY "Public insert shown_popups" ON shown_popups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read shown_popups" ON shown_popups FOR SELECT USING (true);

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
