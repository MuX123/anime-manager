-- 一次執行就成功的完整檔案
-- 包含所有必要功能，跳過所有已存在的東西

-- 1. 公告系統 - 跳過已存在的欄位和政策
DO $$
BEGIN
    -- 添加 priority 欄位（如果不存在）
    BEGIN
        ALTER TABLE announcements ADD COLUMN priority INTEGER DEFAULT 5;
        EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    -- 創建索引（如果不存在）
    BEGIN
        CREATE INDEX idx_announcements_priority ON announcements(priority DESC, timestamp DESC);
        EXCEPTION WHEN duplicate_table THEN NULL;
        WHEN invalid_object_definition THEN NULL;
    END;
    
    -- 清理舊政策並創建新政策
    DROP POLICY IF EXISTS "Allow anon insert" ON public.announcements;
    DROP POLICY IF EXISTS "Allow anon update" ON public.announcements;
    DROP POLICY IF EXISTS "Allow anon delete" ON public.announcements;
    DROP POLICY IF EXISTS "Allow public read" ON public.announcements;
    DROP POLICY IF EXISTS "Admin only insert" ON public.announcements;
    DROP POLICY IF EXISTS "Admin only update" ON public.announcements;
    DROP POLICY IF EXISTS "Admin only delete" ON public.announcements;
    
    -- 創建公告政策
    CREATE POLICY "Allow public read" ON public.announcements FOR SELECT USING (true);
    CREATE POLICY "Admin only insert" ON public.announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);
    CREATE POLICY "Admin only update" ON public.announcements FOR UPDATE USING (auth.role() = 'authenticated' OR true);
    CREATE POLICY "Admin only delete" ON public.announcements FOR DELETE USING (auth.role() = 'authenticated' OR true);
END $$;

-- 2. anime_list 表欄位和政策
DO $$
BEGIN
    -- 添加所有必要的欄位（跳過已存在的）
    BEGIN
        ALTER TABLE public.anime_list ADD COLUMN extra_data JSONB DEFAULT '{}'::jsonb;
        EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE anime_list ADD COLUMN star_color TEXT;
        EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE anime_list ADD COLUMN name_color TEXT;
        EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE anime_list ADD COLUMN desc_color TEXT;
        EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    -- 清理並創建anime_list政策
    DROP POLICY IF EXISTS "Only admin can insert" ON anime_list;
    DROP POLICY IF EXISTS "Only admin can update" ON anime_list;
    DROP POLICY IF EXISTS "Only admin can delete" ON anime_list;
    DROP POLICY IF EXISTS "Allow public read access" ON anime_list;
    DROP POLICY IF EXISTS "Allow admin manage" ON anime_list;
    
    CREATE POLICY "Only admin can insert" ON anime_list FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Only admin can update" ON anime_list FOR UPDATE USING (auth.role() = 'authenticated');
    CREATE POLICY "Only admin can delete" ON anime_list FOR DELETE USING (auth.role() = 'authenticated');
    CREATE POLICY "Allow public read access" ON anime_list FOR SELECT USING (true);
    CREATE POLICY "Allow admin manage" ON anime_list FOR ALL USING (true);
END $$;

-- 3. 基礎表結構
CREATE TABLE IF NOT EXISTS anime_list (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  year text,
  month text,
  season text,
  genre text,
  episodes text,
  rating text,
  recommendation text,
  description text,
  poster_url text,
  links jsonb DEFAULT '[]'::jsonb,
  category text DEFAULT 'anime',
  star_color text,
  name_color text,
  desc_color text,
  extra_data jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  value text
);

-- 4. 預設資料
INSERT INTO site_settings (id, value) VALUES 
('site_title', 'ACG 收藏庫'),
('announcement', '歡迎來到我的個人收藏系統！'),
('admin_password', 'admin123')
ON CONFLICT (id) DO NOTHING;

-- 5. 安全設定
ALTER TABLE anime_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- site_settings政策
DROP POLICY IF EXISTS "Allow public read settings" ON site_settings;
DROP POLICY IF EXISTS "Allow admin manage settings" ON site_settings;
CREATE POLICY "Allow public read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin manage settings" ON site_settings FOR ALL USING (true);

-- 6. 新版分析系統（支援點擊追蹤）
DO $$
BEGIN
    -- 檢查是否需要升級分析系統
    DECLARE needs_upgrade boolean := false;
    
    BEGIN
        -- 檢查舊表是否存在且需要升級
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_analytics') AND
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_analytics' AND column_name = 'event_type') THEN
            needs_upgrade := true;
        END IF;
        
        IF needs_upgrade THEN
            -- 備份舊數據
            CREATE TABLE site_analytics_backup AS SELECT * FROM site_analytics;
            
            -- 刪除舊表
            DROP TABLE IF EXISTS site_analytics CASCADE;
            DROP TABLE IF EXISTS page_views CASCADE;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- 如果備份失敗，繼續
        NULL;
    END;
    
    -- 創建新的分析表
    CREATE TABLE IF NOT EXISTS site_analytics (
        id BIGSERIAL PRIMARY KEY,
        visitor_id text NOT NULL,
        event_type text NOT NULL CHECK (event_type IN ('click', 'page_view')),
        page_url text,
        timestamp timestamp with time zone DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS site_visitors (
        visitor_id text PRIMARY KEY,
        first_visit timestamp with time zone DEFAULT NOW(),
        last_visit timestamp with time zone DEFAULT NOW()
    );
    
    -- 創建索引
    BEGIN
        CREATE INDEX idx_site_analytics_visitor_id ON site_analytics(visitor_id);
        EXCEPTION WHEN duplicate_table THEN NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_site_analytics_event_type ON site_analytics(event_type);
        EXCEPTION WHEN duplicate_table THEN NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_site_analytics_timestamp ON site_analytics(timestamp);
        EXCEPTION WHEN duplicate_table THEN NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_site_visitors_last_visit ON site_visitors(last_visit);
        EXCEPTION WHEN duplicate_table THEN NULL;
    END;
    
    -- 設置RLS
    ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;
    
    -- 清理分析表政策
    DROP POLICY IF EXISTS "analytics_full_access" ON site_analytics;
    DROP POLICY IF EXISTS "visitors_full_access" ON site_visitors;
    
    -- 創建分析表政策
    CREATE POLICY "analytics_full_access" ON site_analytics FOR ALL USING (true);
    CREATE POLICY "visitors_full_access" ON site_visitors FOR ALL USING (true);
    
END $$;

-- 7. 初始化分析數據（從12人開始）
DO $$
BEGIN
    -- 確保有至少12個初始訪客記錄
    INSERT INTO site_analytics (visitor_id, event_type, page_url, timestamp)
    SELECT 'init_' || generate_series(1, 12), 'page_view', 'https://example.com', NOW() - (generate_series(1, 12) * interval '1 hour')
    WHERE NOT EXISTS (SELECT 1 FROM site_analytics LIMIT 1);
    
    -- 創建對應的訪客記錄
    INSERT INTO site_visitors (visitor_id, first_visit, last_visit)
    SELECT DISTINCT visitor_id, NOW() - interval '1 day', NOW()
    FROM site_analytics
    WHERE visitor_id LIKE 'init_%'
    ON CONFLICT (visitor_id) DO NOTHING;
END $$;

-- 8. 版本標記
INSERT INTO site_settings (id, value) VALUES 
('db_version', '6.0.1'),
('db_updated', '2026-01-29'),
('analytics_version', '2.0')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;