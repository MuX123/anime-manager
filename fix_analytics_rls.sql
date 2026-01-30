-- Analytics Tables RLS Policies Update
-- 確保分析表具有正確的行級安全策略

-- 為 page_views 表設置RLS策略（如果尚未設置）
DO $$
BEGIN
    -- 檢查表是否存在RLS
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'page_views' 
        AND rowsecurity = true
    ) THEN
        -- 創建匿名訪問策略
        DROP POLICY IF EXISTS "Allow anonymous insert to page_views" ON page_views;
        DROP POLICY IF EXISTS "Allow anonymous select to page_views" ON page_views;
        
        CREATE POLICY "Allow anonymous insert to page_views" ON page_views
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "Allow anonymous select to page_views" ON page_views
            FOR SELECT USING (true);
        
        RAISE NOTICE 'page_views RLS policies updated successfully';
    ELSE
        RAISE NOTICE 'page_views table does not have RLS enabled';
    END IF;
END $$;

-- 為 category_clicks 表設置RLS策略
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'category_clicks' 
        AND rowsecurity = true
    ) THEN
        DROP POLICY IF EXISTS "Allow anonymous insert to category_clicks" ON category_clicks;
        DROP POLICY IF EXISTS "Allow anonymous select to category_clicks" ON category_clicks;
        
        CREATE POLICY "Allow anonymous insert to category_clicks" ON category_clicks
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "Allow anonymous select to category_clicks" ON category_clicks
            FOR SELECT USING (true);
        
        RAISE NOTICE 'category_clicks RLS policies updated successfully';
    ELSE
        RAISE NOTICE 'category_clicks table does not have RLS enabled';
    END IF;
END $$;

-- 為 visitor_sessions 表設置RLS策略
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'visitor_sessions' 
        AND rowsecurity = true
    ) THEN
        DROP POLICY IF EXISTS "Allow anonymous insert to visitor_sessions" ON visitor_sessions;
        DROP POLICY IF EXISTS "Allow anonymous select to visitor_sessions" ON visitor_sessions;
        
        CREATE POLICY "Allow anonymous insert to visitor_sessions" ON visitor_sessions
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "Allow anonymous select to visitor_sessions" ON visitor_sessions
            FOR SELECT USING (true);
        
        RAISE NOTICE 'visitor_sessions RLS policies updated successfully';
    ELSE
        RAISE NOTICE 'visitor_sessions table does not have RLS enabled';
    END IF;
END $$;

-- 顯示所有分析表的狀態
SELECT 
    schemaname,
    tablename,
    rowsecurity as has_rls,
    tableowner
FROM pg_tables 
WHERE tablename IN ('page_views', 'category_clicks', 'visitor_sessions', 'site_visitors')
ORDER BY tablename;