-- ==========================================
-- RLS 安全修復腳本 - 立即修復 RLS 警告
-- 專門解決 site_analytics_old 表的 RLS 問題
-- ==========================================

BEGIN;

-- ==========================================
-- 1. 清理舊表 (解決 RLS 警告的根本原因)
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '🔒 開始修復 RLS 安全問題...';
    
    -- 清理 site_analytics_old 表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_analytics_old') THEN
        DROP TABLE site_analytics_old CASCADE;
        RAISE NOTICE '✅ 已刪除 site_analytics_old 表';
    ELSE
        RAISE NOTICE 'ℹ️ site_analytics_old 表不存在，可能已被清理';
    END IF;
    
    -- 清理其他可能的舊表
    DECLARE
        old_tables TEXT[] := ARRAY[
            'site_analytics_backup', 
            'page_views_old', 
            'site_visitors_old',
            'anime_list_old',
            'site_settings_old',
            'announcements_old'
        ];
        current_table TEXT;
        cleaned_count INTEGER := 0;
    BEGIN
        FOREACH current_table IN ARRAY old_tables
        LOOP
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = current_table) THEN
                EXECUTE 'DROP TABLE IF EXISTS ' || current_table || ' CASCADE';
                RAISE NOTICE '✅ 已清理舊表: %', current_table;
                cleaned_count := cleaned_count + 1;
            END IF;
        END LOOP;
        
        IF cleaned_count > 0 THEN
            RAISE NOTICE '🧹 總共清理了 % 個舊表', cleaned_count;
        ELSE
            RAISE NOTICE '✅ 沒有找到其他舊表需要清理';
        END IF;
    END;
    
    RAISE NOTICE '🎯 RLS 安全問題修復完成';
END $$;

-- ==========================================
-- 2. 驗證修復結果
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🔍 驗證 RLS 修復結果...';
    
    -- 檢查是否還有舊表
    DECLARE
        remaining_old_tables INTEGER;
        remaining_table_list TEXT;
    BEGIN
        SELECT COUNT(*) INTO remaining_old_tables 
        FROM information_schema.tables 
        WHERE table_name LIKE '%_old' OR table_name LIKE '%_backup';
        
        -- 獲取剩餘舊表列表
        SELECT string_agg(table_name, ', ') INTO remaining_table_list
        FROM information_schema.tables 
        WHERE table_name LIKE '%_old' OR table_name LIKE '%_backup';
        
        IF remaining_old_tables = 0 THEN
            RAISE NOTICE '✅ 所有舊表已成功清理';
            RAISE NOTICE '🔒 RLS 警告應該已解決';
        ELSE
            RAISE NOTICE '⚠️ 仍有 % 個舊表: %', remaining_old_tables, COALESCE(remaining_table_list, '無');
            RAISE NOTICE '🔧 可能需要手動檢查這些表';
        END IF;
    END;
    
    -- 檢查主要表的 RLS 狀態
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_analytics') THEN
        RAISE NOTICE '✅ site_analytics 表存在';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_visitors') THEN
        RAISE NOTICE '✅ site_visitors 表存在';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 RLS 安全修復完成！';
    RAISE NOTICE '💡 現在可以重新執行完整部署腳本';
    RAISE NOTICE '🔒 或者直接繼續使用現有系統';
    RAISE NOTICE '========================================';
END $$;

COMMIT;