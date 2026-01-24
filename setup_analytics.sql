-- Analytics Table Structure for Supabase

CREATE TABLE IF NOT EXISTS site_analytics (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT UNIQUE NOT NULL,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visit_count INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access" ON site_analytics FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON page_views FOR SELECT USING (true);

-- Allow anonymous insert/update
CREATE POLICY "Allow anonymous insert" ON site_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON site_analytics FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous insert" ON page_views FOR INSERT WITH CHECK (true);
