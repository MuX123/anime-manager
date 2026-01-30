-- Fix anime_list RLS Policies for Anonymous Access
-- 修復作品表的匿名訪問權限

-- 檢查是否啟用 RLS
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'anime_list' 
        AND rowsecurity = true
    ) THEN
        -- 刪除現有策略
        DROP POLICY IF EXISTS "Allow anonymous insert to anime_list" ON anime_list;
        DROP POLICY IF EXISTS "Allow anonymous select to anime_list" ON anime_list;
        DROP POLICY IF EXISTS "Allow anonymous update to anime_list" ON anime_list;
        DROP POLICY IF EXISTS "Allow anonymous delete to anime_list" ON anime_list;
        
        -- 創建新的匿名訪問策略
        CREATE POLICY "Allow anonymous insert to anime_list" ON anime_list
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "Allow anonymous select to anime_list" ON anime_list
            FOR SELECT USING (true);
            
        CREATE POLICY "Allow anonymous update to anime_list" ON anime_list
            FOR UPDATE USING (true);
            
        CREATE POLICY "Allow anonymous delete to anime_list" ON anime_list
            FOR DELETE USING (true);
        
        RAISE NOTICE 'anime_list RLS policies updated successfully';
    ELSE
        RAISE NOTICE 'anime_list table does not have RLS enabled';
    END IF;
END $$;

-- 如果未啟用 RLS，啟用它
ALTER TABLE anime_list ENABLE ROW LEVEL SECURITY;

-- 顯示表狀態
SELECT 
    schemaname,
    tablename,
    rowsecurity as has_rls,
    tableowner
FROM pg_tables 
WHERE tablename = 'anime_list'
ORDER BY tablename;