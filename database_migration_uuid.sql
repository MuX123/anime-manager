-- ============================================================================
-- ACG 收藏庫 - 資料庫 ID 類型修復腳本
-- 將 anime_list 的 id 從 BIGSERIAL 改為 UUID
-- ============================================================================

-- 步驟 1: 備份現有資料 (如果有)
CREATE TABLE IF NOT EXISTS anime_list_backup AS 
SELECT * FROM anime_list;

-- 步驟 2: 刪除舊表及相關約束
DROP TABLE IF EXISTS anime_list CASCADE;

-- 步驟 3: 重新建立表格,使用 UUID
CREATE TABLE anime_list (
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

-- 步驟 4: 建立索引
CREATE INDEX IF NOT EXISTS idx_anime_list_category ON anime_list(category);
CREATE INDEX IF NOT EXISTS idx_anime_list_rating ON anime_list(rating);
CREATE INDEX IF NOT EXISTS idx_anime_list_created_at ON anime_list(created_at);

-- 步驟 5: 啟用 RLS
ALTER TABLE anime_list ENABLE ROW LEVEL SECURITY;

-- 步驟 6: 重新建立 RLS 政策
DROP POLICY IF EXISTS "Public anime_list" ON anime_list;
CREATE POLICY "Public anime_list" ON anime_list FOR ALL USING (true) WITH CHECK (true);

-- 步驟 7: 清理備份表 (可選,如果不需要備份)
-- DROP TABLE IF EXISTS anime_list_backup;

-- 完成提示
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '資料庫 ID 類型已更新為 UUID';
    RAISE NOTICE '舊資料已備份至 anime_list_backup';
    RAISE NOTICE '請重新匯入資料或手動新增';
    RAISE NOTICE '========================================';
END $$;
