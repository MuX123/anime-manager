-- 檢查 anime_list 表的實際欄位結構
-- 解決 "Could not find 'genre' column" 錯誤

-- 獲取所有欄位信息
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'anime_list' 
AND table_schema = 'public'
ORDER BY ordinal_position;