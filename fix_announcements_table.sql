-- ============================================================================
-- 修復 announcements 表結構
-- 解決 "column 'timestamp' does not exist" 錯誤
-- ============================================================================

-- ============================================================================
-- 1. 檢查並修復 announcements 表結構
-- ============================================================================

DO $$
BEGIN
    -- 檢查表是否存在
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'announcements') THEN
        
        -- 檢查並添加缺失的列
        
        -- content 列
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'announcements' AND column_name = 'content') THEN
            ALTER TABLE announcements ADD COLUMN content TEXT NOT NULL DEFAULT '';
            RAISE NOTICE 'Added column: content';
        END IF;
        
        -- image_urls 列 (使用 JSONB 類型更適合存儲陣列)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'announcements' AND column_name = 'image_urls') THEN
            ALTER TABLE announcements ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;
            RAISE NOTICE 'Added column: image_urls (JSONB)';
        ELSE
            -- 如果已存在但類型是 TEXT，改為 JSONB
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'announcements' AND column_name = 'image_urls' 
                       AND data_type = 'text') THEN
                -- 先轉換現有數據，然後改變類型
                ALTER TABLE announcements ALTER COLUMN image_urls TYPE JSONB 
                    USING CASE 
                        WHEN image_urls IS NULL THEN '[]'::jsonb
                        WHEN image_urls = '' THEN '[]'::jsonb
                        ELSE image_urls::jsonb
                    END;
                RAISE NOTICE 'Converted image_urls from TEXT to JSONB';
            END IF;
        END IF;
        
        -- author_name 列
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'announcements' AND column_name = 'author_name') THEN
            ALTER TABLE announcements ADD COLUMN author_name TEXT NOT NULL DEFAULT '管理員';
            RAISE NOTICE 'Added column: author_name';
        END IF;
        
        -- author_avatar 列
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'announcements' AND column_name = 'author_avatar') THEN
            ALTER TABLE announcements ADD COLUMN author_avatar TEXT;
            RAISE NOTICE 'Added column: author_avatar';
        END IF;
        
        -- author_color 列
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'announcements' AND column_name = 'author_color') THEN
            ALTER TABLE announcements ADD COLUMN author_color TEXT DEFAULT '#00ffff';
            RAISE NOTICE 'Added column: author_color';
        END IF;
        
        -- 時間戳列處理：使用 created_at（標準命名）
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'announcements' AND column_name = 'created_at') THEN
            -- 如果不存在 created_at，但有 timestamp，則重命名
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'announcements' AND column_name = 'timestamp') THEN
                ALTER TABLE announcements RENAME COLUMN timestamp TO created_at;
                RAISE NOTICE 'Renamed column: timestamp -> created_at';
            ELSE
                -- 兩者都不存在，創建 created_at
                ALTER TABLE announcements ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
                RAISE NOTICE 'Added column: created_at';
            END IF;
        END IF;
        
        -- 更新列的默認值（確保與 SQL 定義一致）
        ALTER TABLE announcements ALTER COLUMN author_name SET DEFAULT '管理員';
        ALTER TABLE announcements ALTER COLUMN author_color SET DEFAULT '#00ffff';
        ALTER TABLE announcements ALTER COLUMN created_at SET DEFAULT NOW();
        
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Announcements table structure fixed';
        RAISE NOTICE '========================================';
    ELSE
        -- 表不存在，創建新表
        CREATE TABLE announcements (
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
        
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Created new announcements table';
        RAISE NOTICE '========================================';
    END IF;
END $$;

-- ============================================================================
-- 2. 確保 RLS 政策正確
-- ============================================================================

-- 啟用 RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 刪除舊政策
DROP POLICY IF EXISTS "Enable all for announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous insert to announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous select to announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous update to announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous delete to announcements" ON announcements;
DROP POLICY IF EXISTS "Public read access" ON announcements;
DROP POLICY IF EXISTS "Public insert" ON announcements;
DROP POLICY IF EXISTS "Public update" ON announcements;
DROP POLICY IF EXISTS "Public delete" ON announcements;

-- 創建公開訪問政策（允許匿名讀寫）
CREATE POLICY "Public read access" ON announcements
    FOR SELECT USING (true);

CREATE POLICY "Public insert" ON announcements
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update" ON announcements
    FOR UPDATE USING (true);

CREATE POLICY "Public delete" ON announcements
    FOR DELETE USING (true);

-- ============================================================================
-- 3. 修復 image_urls 數據類型（如果之前有 TEXT 類型的數據）
-- ============================================================================

DO $$
BEGIN
    -- 確保所有現有數據的 image_urls 都是有效的 JSONB 格式
    UPDATE announcements 
    SET image_urls = '[]'::jsonb 
    WHERE image_urls IS NULL;
    
    RAISE NOTICE 'Fixed null image_urls values';
END $$;

-- ============================================================================
-- 4. 顯示最終表結構
-- ============================================================================

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'announcements' 
ORDER BY ordinal_position;
