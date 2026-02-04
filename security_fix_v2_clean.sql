-- =============================================
-- ACG 收藏庫 - 安全性修復腳本 v2.0
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

DROP POLICY IF EXISTS "Anime public read" ON public.anime_list;
DROP POLICY IF EXISTS "Anime admin full" ON public.anime_list;
DROP POLICY IF EXISTS "Public anime_list" ON public.anime_list;

CREATE POLICY "Anime public read" ON public.anime_list
    FOR SELECT USING (true);

CREATE POLICY "Anime admin full" ON public.anime_list
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 3. 修復 announcements 表格
-- =============================================

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ann public read active" ON public.announcements;
DROP POLICY IF EXISTS "Ann admin manage" ON public.announcements;

CREATE POLICY "Ann public read active" ON public.announcements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Ann admin manage" ON public.announcements
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 4. 修復 updates 表格
-- =============================================

ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Updates public read active" ON public.updates;
DROP POLICY IF EXISTS "Updates admin manage" ON public.updates;

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

CREATE POLICY "Settings public read" ON public.site_settings
    FOR SELECT USING (
        id IN ('site_title', 'announcement', 'title_color', 'announcement_color')
    );

CREATE POLICY "Settings admin manage" ON public.site_settings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 6. 修復 guestbook_messages 表格
-- =============================================

ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guestbook public insert" ON public.guestbook_messages;
DROP POLICY IF EXISTS "Guestbook public read approved" ON public.guestbook_messages;
DROP POLICY IF EXISTS "Guestbook admin manage" ON public.guestbook_messages;

CREATE POLICY "Guestbook public insert" ON public.guestbook_messages
    FOR INSERT WITH CHECK (
        content IS NOT NULL 
        AND length(trim(content)) BETWEEN 1 AND 500
        AND (nickname IS NULL OR length(trim(nickname)) BETWEEN 1 AND 20)
        AND content NOT ILIKE '%<script%'
        AND content NOT ILIKE '%javascript:%'
    );

CREATE POLICY "Guestbook public read approved" ON public.guestbook_messages
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Guestbook admin manage" ON public.guestbook_messages
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 7. 修復 shown_popups 表格
-- =============================================

ALTER TABLE public.shown_popups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shown_popups public insert" ON public.shown_popups;
DROP POLICY IF EXISTS "Shown_popups public read" ON public.shown_popups;

CREATE POLICY "Shown_popups public insert" ON public.shown_popups
    FOR INSERT WITH CHECK (
        popup_type IN ('update', 'announcement')
        AND visitor_id IS NOT NULL
    );

CREATE POLICY "Shown_popups public read" ON public.shown_popups
    FOR SELECT USING (true);

-- =============================================
-- 8. 修復統計相關表格
-- =============================================

ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- site_visitors
DROP POLICY IF EXISTS "Visitors public insert" ON public.site_visitors;
DROP POLICY IF EXISTS "Visitors admin read" ON public.site_visitors;

CREATE POLICY "Visitors public insert" ON public.site_visitors
    FOR INSERT WITH CHECK (visitor_id IS NOT NULL);

CREATE POLICY "Visitors admin read" ON public.site_visitors
    FOR SELECT USING (public.is_admin());

-- category_clicks
DROP POLICY IF EXISTS "Clicks public insert" ON public.category_clicks;
DROP POLICY IF EXISTS "Clicks admin read" ON public.category_clicks;

CREATE POLICY "Clicks public insert" ON public.category_clicks
    FOR INSERT WITH CHECK (
        visitor_id IS NOT NULL
        AND category IN ('notice', 'anime', 'manga', 'movie')
    );

CREATE POLICY "Clicks admin read" ON public.category_clicks
    FOR SELECT USING (public.is_admin());

-- page_views
DROP POLICY IF EXISTS "Pageviews public insert" ON public.page_views;
DROP POLICY IF EXISTS "Pageviews admin read" ON public.page_views;

CREATE POLICY "Pageviews public insert" ON public.page_views
    FOR INSERT WITH CHECK (visitor_id IS NOT NULL);

CREATE POLICY "Pageviews admin read" ON public.page_views
    FOR SELECT USING (public.is_admin());

-- 提交交易
COMMIT;

-- 驗證結果
SELECT '安全性修復完成!' as status;
