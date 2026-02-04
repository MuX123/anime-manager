-- =============================================
-- Supabase 資料庫安全性修復腳本
-- 執行前請備份資料庫！
-- =============================================

-- 開始交易
BEGIN;

-- =============================================
-- 1. 修復 Functions 的 search_path 問題
-- =============================================

-- 修正 update_updated_at_column 函數
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 修正 is_admin 函數
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin_result BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = user_email AND raw_user_meta_data->>'is_admin' = 'true'
    ) INTO is_admin_result;
    RETURN is_admin_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- =============================================
-- 2. 修復 anime_list 表格的 RLS 策略
-- =============================================

-- 先刪除過度寬鬆的策略
DROP POLICY IF EXISTS "Allow anonymous operations" ON public.anime_list;
DROP POLICY IF EXISTS "Public anime_list" ON public.anime_list;
DROP POLICY IF EXISTS "anime_list_full_access" ON public.anime_list;
DROP POLICY IF EXISTS "Public read access" ON public.anime_list;

-- 啟用 RLS
ALTER TABLE public.anime_list ENABLE ROW LEVEL SECURITY;

-- 重新建立策略
-- 公開讀取 (這是必要的，讓前台可以顯示作品)
CREATE POLICY "Anime public read" ON public.anime_list
    FOR SELECT USING (true);

-- 管理員完整權限 (需要自行根據 admin 角色調整)
CREATE POLICY "Anime admin full" ON public.anime_list
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- =============================================
-- 3. 修復 announcements 表格的 RLS 策略
-- =============================================

-- 刪除所有現有策略
DROP POLICY IF EXISTS "Public access" ON public.announcements;
DROP POLICY IF EXISTS "announcements_full_access" ON public.announcements;
DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin manage announcements" ON public.announcements;

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ann public read" ON public.announcements
    FOR SELECT USING (true);

CREATE POLICY "Ann admin manage" ON public.announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- =============================================
-- 4. 修復 site_settings 表格的 RLS 策略
-- =============================================

DROP POLICY IF EXISTS "site_settings_full_access" ON public.site_settings;
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin manage settings" ON public.site_settings;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 公開讀取設定值（網站標題等）
CREATE POLICY "Settings public read" ON public.site_settings
    FOR SELECT USING (true);

-- 只有管理員可以修改設定
CREATE POLICY "Settings admin manage" ON public.site_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- =============================================
-- 5. 修復 category_clicks 表格的 RLS 策略
-- =============================================

DROP POLICY IF EXISTS "Public insert" ON public.category_clicks;
DROP POLICY IF EXISTS "Public insert clicks" ON public.category_clicks;
DROP POLICY IF EXISTS "Authenticated insert clicks" ON public.category_clicks;
DROP POLICY IF EXISTS "Admin read clicks" ON public.category_clicks;

ALTER TABLE public.category_clicks ENABLE ROW LEVEL SECURITY;

-- 允許匿名插入（用於統計），但限制頻率
CREATE POLICY "Clicks auth insert" ON public.category_clicks
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'anon'
    );

CREATE POLICY "Clicks admin read" ON public.category_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- =============================================
-- 6. 修復 guestbook_messages 表格的 RLS 策略
-- =============================================

DROP POLICY IF EXISTS "Public insert guestbook" ON public.guestbook_messages;
DROP POLICY IF EXISTS "Anyone can post guestbook" ON public.guestbook_messages;
DROP POLICY IF EXISTS "Public read approved" ON public.guestbook_messages;
DROP POLICY IF EXISTS "Admin manage guestbook" ON public.guestbook_messages;

ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;

-- 允許匿名 INSERT（留言需要），但加入基本驗證
CREATE POLICY "Guestbook anyone post" ON public.guestbook_messages
    FOR INSERT WITH CHECK (
        -- 內容不能為空
        content IS NOT NULL AND length(trim(content)) > 0
        AND length(trim(content)) <= 500
        -- 暱稱基本驗證
        AND (nickname IS NULL OR length(trim(nickname)) <= 20)
    );

-- 公開讀取已審核的留言
CREATE POLICY "Guestbook public read" ON public.guestbook_messages
    FOR SELECT USING (status = 'approved');

-- 只有管理員可以審核和刪除
CREATE POLICY "Guestbook admin manage" ON public.guestbook_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- =============================================
-- 7. 修復 page_views 表格的 RLS 策略
-- =============================================

DROP POLICY IF EXISTS "Public insert" ON public.page_views;
DROP POLICY IF EXISTS "Public insert page_views" ON public.page_views;
DROP POLICY IF EXISTS "Authenticated insert page views" ON public.page_views;
DROP POLICY IF EXISTS "Admin read page views" ON public.page_views;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pageviews auth insert" ON public.page_views
    FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Pageviews admin read" ON public.page_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- =============================================
-- 8. 修復 site_visitors 表格的 RLS 策略
-- =============================================

DROP POLICY IF EXISTS "Public insert" ON public.site_visitors;
DROP POLICY IF EXISTS "Public insert visitors" ON public.site_visitors;
DROP POLICY IF EXISTS "Public update" ON public.site_visitors;
DROP POLICY IF EXISTS "Authenticated insert visitors" ON public.site_visitors;
DROP POLICY IF EXISTS "Admin manage visitors" ON public.site_visitors;

ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors auth insert" ON public.site_visitors
    FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Visitors admin manage" ON public.site_visitors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- =============================================
-- 9. 修復 shown_popups 表格的 RLS 策略
-- =============================================

DROP POLICY IF EXISTS "Public insert shown_popups" ON public.shown_popups;
DROP POLICY IF EXISTS "Authenticated insert shown popups" ON public.shown_popups;
DROP POLICY IF EXISTS "Admin manage popups" ON public.shown_popups;

ALTER TABLE public.shown_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Popups auth insert" ON public.shown_popups
    FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Popups admin manage" ON public.shown_popups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- =============================================
-- 10. 修復 real_time_stats 表格的 RLS 策略
-- =============================================

DROP POLICY IF EXISTS "real_time_stats_full_access" ON public.real_time_stats;
DROP POLICY IF EXISTS "Admin read stats" ON public.real_time_stats;
DROP POLICY IF EXISTS "Admin manage stats" ON public.real_time_stats;

ALTER TABLE public.real_time_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stats admin read" ON public.real_time_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

CREATE POLICY "Stats admin manage" ON public.real_time_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- =============================================
-- 11. 修復 visitor_sessions 表格的 RLS 策略
-- =============================================

DROP POLICY IF EXISTS "Public insert" ON public.visitor_sessions;
DROP POLICY IF EXISTS "visitor_sessions_full_access" ON public.visitor_sessions;
DROP POLICY IF EXISTS "Authenticated insert sessions" ON public.visitor_sessions;
DROP POLICY IF EXISTS "Admin manage sessions" ON public.visitor_sessions;

ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions auth insert" ON public.visitor_sessions
    FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Sessions admin manage" ON public.visitor_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- =============================================
-- 12. 建立索引優化查詢效能
-- =============================================

-- anime_list 常見查詢的索引
CREATE INDEX IF NOT EXISTS idx_anime_list_category_created ON public.anime_list(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anime_list_year_season ON public.anime_list(year, season);

-- 留言板審核狀態索引
CREATE INDEX IF NOT EXISTS idx_guestbook_status ON public.guestbook_messages(status);

-- 分析統計表格索引
CREATE INDEX IF NOT EXISTS idx_category_clicks_created ON public.category_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visitors_created ON public.site_visitors(created_at DESC);

-- =============================================
-- 提交交易
-- =============================================

COMMIT;

-- =============================================
-- 驗證 RLS 策略
-- =============================================

SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
