-- =============================================
-- ACG 收藏庫 - 安全性修復腳本 v2.0
-- 執行前請備份資料庫！
-- 執行時間: 2026-02-04
-- =============================================

-- 開始交易
BEGIN;

-- =============================================
-- 1. 修正 is_admin 函數
-- =============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'is_admin' = 'true'
  );
$$;

-- =============================================
-- 2. 修復 anime_list 表格 - 嚴格限制為唯讀
-- =============================================

ALTER TABLE public.anime_list ENABLE ROW LEVEL SECURITY;

-- 刪除所有現有策略
DROP POLICY IF EXISTS "Anime public read" ON public.anime_list;
DROP POLICY IF EXISTS "Anime admin full" ON public.anime_list;
DROP POLICY IF EXISTS "Public anime_list" ON public.anime_list;

-- 公開唯讀 (前台顯示用)
CREATE POLICY "Anime public read" ON public.anime_list
    FOR SELECT USING (true);

-- 管理員完整權限
CREATE POLICY "Anime admin full" ON public.anime_list
    FOR ALL USING (
        public.is_admin()
    ) WITH CHECK (
        public.is_admin()
    );

-- =============================================
-- 3. 修復 announcements 表格
-- =============================================

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ann public read" ON public.announcements;
DROP POLICY IF EXISTS "Ann admin manage" ON public.announcements;

CREATE POLICY "Ann public read active" ON public.announcements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Ann admin manage" ON public.announcements
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 4. 修復 updates 表格
-- =============================================

ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read updates" ON public.updates;
DROP POLICY IF EXISTS "Admin full access updates" ON public.updates;

CREATE POLICY "Updates public read active" ON public.updates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Updates admin manage" ON public.updates
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 5. 修復 site_settings 表格 - 嚴格限制
-- =============================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings public read" ON public.site_settings;
DROP POLICY IF EXISTS "Settings admin manage" ON public.site_settings;

-- 公開讀取基本設定 (網站標題等)
CREATE POLICY "Settings public read" ON public.site_settings
    FOR SELECT USING (
        id IN ('site_title', 'announcement', 'title_color', 'announcement_color')
    );

-- 只有管理員可以修改
CREATE POLICY "Settings admin manage" ON public.site_settings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 6. 修復 guestbook_messages 表格 - 添加內容驗證
-- =============================================

ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert guestbook" ON public.guestbook_messages;
DROP POLICY IF EXISTS "Public read approved guestbook" ON public.guestbook_messages;
DROP POLICY IF EXISTS "Admin full access guestbook" ON public.guestbook_messages;

-- 公開插入 (含內容驗證)
CREATE POLICY "Guestbook public insert" ON public.guestbook_messages
    FOR INSERT WITH CHECK (
        -- 內容長度限制
        content IS NOT NULL 
        AND length(trim(content)) BETWEEN 1 AND 500
        -- 暱稱長度限制
        AND (nickname IS NULL OR length(trim(nickname)) BETWEEN 1 AND 20)
        -- 禁止 HTML/Script
        AND content NOT ILIKE '%<script%'
        AND content NOT ILIKE '%javascript:%'
        AND content NOT ILIKE '%onload=%'
        AND content NOT ILIKE '%onerror=%'
    );

-- 公開讀取已審核留言
CREATE POLICY "Guestbook public read approved" ON public.guestbook_messages
    FOR SELECT USING (status = 'approved');

-- 管理員完整控制
CREATE POLICY "Guestbook admin manage" ON public.guestbook_messages
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 7. 修復 shown_popups 表格
-- =============================================

ALTER TABLE public.shown_popups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert shown_popups" ON public.shown_popups;
DROP POLICY IF EXISTS "Public read shown_popups" ON public.shown_popups;

CREATE POLICY "Shown_popups public insert" ON public.shown_popups
    FOR INSERT WITH CHECK (
        popup_type IN ('update', 'announcement')
        AND visitor_id IS NOT NULL
        AND length(visitor_id) <= 100
    );

CREATE POLICY "Shown_popups public read" ON public.shown_popups
    FOR SELECT USING (true);

-- =============================================
-- 8. 修復 site_visitors 表格
-- =============================================

ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert visitors" ON public.site_visitors;
DROP POLICY IF EXISTS "Admin read visitors" ON public.site_visitors;

CREATE POLICY "Visitors public insert" ON public.site_visitors
    FOR INSERT WITH CHECK (
        visitor_id IS NOT NULL
        AND length(visitor_id) <= 100
    );

CREATE POLICY "Visitors admin read" ON public.site_visitors
    FOR SELECT USING (public.is_admin());

-- =============================================
-- 9. 修復 category_clicks 表格
-- =============================================

ALTER TABLE public.category_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert clicks" ON public.category_clicks;
DROP POLICY IF EXISTS "Admin read clicks" ON public.category_clicks;

CREATE POLICY "Clicks public insert" ON public.category_clicks
    FOR INSERT WITH CHECK (
        visitor_id IS NOT NULL
        AND category IN ('notice', 'anime', 'manga', 'movie')
        AND length(visitor_id) <= 100
    );

CREATE POLICY "Clicks admin read" ON public.category_clicks
    FOR SELECT USING (public.is_admin());

-- =============================================
-- 10. 修復 page_views 表格
-- =============================================

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert page_views" ON public.page_views;
DROP POLICY IF EXISTS "Admin read page_views" ON public.page_views;

CREATE POLICY "Pageviews public insert" ON public.page_views
    FOR INSERT WITH CHECK (
        visitor_id IS NOT NULL
        AND (page_url IS NULL OR length(page_url) <= 500)
        AND (page_title IS NULL OR length(page_title) <= 200)
    );

CREATE POLICY "Pageviews admin read" ON public.page_views
    FOR SELECT USING (public.is_admin());

-- =============================================
-- 11. 建立稽核觸發器
-- =============================================

CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS TRIGGER AS $$
BEGIN
    RAISE NOTICE 'Security Event: Table=%s, Operation=%s, User=%s, Time=%s',
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 12. 建立效能索引
-- =============================================

CREATE INDEX IF NOT EXISTS idx_anime_list_category_created 
ON public.anime_list(category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guestbook_status_approved 
ON public.guestbook_messages(status, created_at DESC) 
WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_announcements_active 
ON public.announcements(is_active, created_at DESC) 
WHERE is_active = true;

-- =============================================
-- 13. 驗證 RLS 策略
-- =============================================

DO $$
DECLARE
    tbl TEXT;
    pol TEXT;
    cmd TEXT;
BEGIN
    FOR tbl, pol, cmd IN 
        SELECT tablename, policyname, cmd
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        RAISE NOTICE 'Table: %, Policy: %, Command: %', tbl, pol, cmd;
    END LOOP;
END $$;

-- =============================================
-- 完成
-- =============================================

RAISE NOTICE '========================================';
RAISE NOTICE '安全性修復完成！';
RAISE NOTICE '========================================';
RAISE NOTICE '驗證方式：SELECT * FROM pg_policies WHERE schemaname = ''public'';';
RAISE NOTICE '========================================';

COMMIT;
