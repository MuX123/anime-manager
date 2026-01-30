-- Analytics Table Structure for Supabase (v2.0)
-- 支援點擊追蹤和訪客統計

-- 站點分析事件表 (記錄所有事件：點擊、頁面訪問等)
CREATE TABLE IF NOT EXISTS site_analytics (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('click', 'page_view')),
    page_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 訪客表 (記錄不重複訪客)
CREATE TABLE IF NOT EXISTS site_visitors (
    visitor_id TEXT PRIMARY KEY,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 為索引優化性能
CREATE INDEX IF NOT EXISTS idx_site_analytics_visitor_id ON site_analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_site_analytics_event_type ON site_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_site_analytics_timestamp ON site_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_site_visitors_last_visit ON site_visitors(last_visit);

-- Enable RLS (Row Level Security)
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for site_analytics
CREATE POLICY "Allow anonymous read access to site_analytics" ON site_analytics FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert to site_analytics" ON site_analytics FOR INSERT WITH CHECK (true);

-- Allow anonymous access for site_visitors  
CREATE POLICY "Allow anonymous read access to site_visitors" ON site_visitors FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert to site_visitors" ON site_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update to site_visitors" ON site_visitors FOR UPDATE USING (true);
