-- 快速修復所有 RLS 權限問題
-- 執行這個腳本來解決所有的數據庫操作權限問題

-- 修復 anime_list 表的 RLS 策略
ALTER TABLE anime_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous operations" ON anime_list;
CREATE POLICY "Allow anonymous operations" ON anime_list
    FOR ALL USING (true) WITH CHECK (true);

-- 修復 announcements 表的 RLS 策略
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for announcements" ON announcements;
CREATE POLICY "Enable all for announcements" ON announcements
    FOR ALL USING (true) WITH CHECK (true);

-- 修復 site_settings 表的 RLS 策略  
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for site_settings" ON site_settings;
CREATE POLICY "Enable all for site_settings" ON site_settings
    FOR ALL USING (true) WITH CHECK (true);

-- 修復 site_visitors 表的 RLS 策略
ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for site_visitors" ON site_visitors;
CREATE POLICY "Enable all for site_visitors" ON site_visitors
    FOR ALL USING (true) WITH CHECK (true);

-- 修復 category_clicks 表的 RLS 策略
ALTER TABLE category_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for category_clicks" ON category_clicks;
CREATE POLICY "Enable all for category_clicks" ON category_clicks
    FOR ALL USING (true) WITH CHECK (true);

-- 修復 page_views 表的 RLS 策略
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for page_views" ON page_views;
CREATE POLICY "Enable all for page_views" ON page_views
    FOR ALL USING (true) WITH CHECK (true);

-- 顯示所有表的 RLS 狀態
SELECT 
    schemaname,
    tablename,
    rowsecurity as has_rls,
    tableowner
FROM pg_tables 
WHERE tablename IN ('anime_list', 'announcements', 'site_settings', 'site_visitors', 'category_clicks', 'page_views')
ORDER BY tablename;

RAISE NOTICE '✅ 所有表的 RLS 權限已修復完成';