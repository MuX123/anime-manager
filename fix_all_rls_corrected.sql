-- 修復所有表的 RLS 權限問題 - 使用正確的 PL/pgSQL 語法

-- 為 anime_list 表設置RLS策略
DO $$
BEGIN
    -- 刪除現有策略
    DROP POLICY IF EXISTS "Allow anonymous operations" ON anime_list;
    
    -- 創建新的匿名訪問策略
    CREATE POLICY "Allow anonymous operations" ON anime_list
        FOR ALL USING (true) WITH CHECK (true);
    
    RAISE NOTICE 'anime_list RLS policies updated';
END $$;

-- 為 announcements 表設置RLS策略
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for announcements" ON announcements;
    
    CREATE POLICY "Enable all for announcements" ON announcements
        FOR ALL USING (true) WITH CHECK (true);
    
    RAISE NOTICE 'announcements RLS policies updated';
END $$;

-- 為 site_settings 表設置RLS策略  
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for site_settings" ON site_settings;
    
    CREATE POLICY "Enable all for site_settings" ON site_settings
        FOR ALL USING (true) WITH CHECK (true);
    
    RAISE NOTICE 'site_settings RLS policies updated';
END $$;

-- 為 site_visitors 表設置RLS策略
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for site_visitors" ON site_visitors;
    
    CREATE POLICY "Enable all for site_visitors" ON site_visitors
        FOR ALL USING (true) WITH CHECK (true);
    
    RAISE NOTICE 'site_visitors RLS policies updated';
END $$;

-- 為 category_clicks 表設置RLS策略
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for category_clicks" ON category_clicks;
    
    CREATE POLICY "Enable all for category_clicks" ON category_clicks
        FOR ALL USING (true) WITH CHECK (true);
    
    RAISE NOTICE 'category_clicks RLS policies updated';
END $$;

-- 為 page_views 表設置RLS策略
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable all for page_views" ON page_views;
    
    CREATE POLICY "Enable all for page_views" ON page_views
        FOR ALL USING (true) WITH CHECK (true);
    
    RAISE NOTICE 'page_views RLS policies updated';
END $$;

-- 顯示所有表的狀態
SELECT 
    schemaname,
    tablename,
    rowsecurity as has_rls,
    tableowner
FROM pg_tables 
WHERE tablename IN ('anime_list', 'announcements', 'site_settings', 'site_visitors', 'category_clicks', 'page_views')
ORDER BY tablename;