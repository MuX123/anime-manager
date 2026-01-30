# Analytics Setup Guide

## Database Setup (Supabase)

### Step 1: Create Tables
Execute the following SQL in Supabase SQL Editor:

```sql
-- Create site_analytics table
CREATE TABLE IF NOT EXISTS site_analytics (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT UNIQUE NOT NULL,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visit_count INTEGER DEFAULT 1
);

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 2: Enable RLS (Row Level Security)
```sql
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
```

### Step 3: Create Policies
```sql
-- Allow anonymous read access
CREATE POLICY "Allow anonymous read" ON site_analytics FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON page_views FOR SELECT USING (true);

-- Allow anonymous insert/update
CREATE POLICY "Allow anonymous insert" ON site_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON site_analytics FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous insert" ON page_views FOR INSERT WITH CHECK (true);
```

## Features

- **Total Page Views (👁)**: Counts every page load
- **Unique Visitors (👤)**: Counts unique visitors using localStorage-based visitor ID
- **Persistent Tracking**: Data stored in Supabase database
- **Real-time Display**: Statistics shown in top-right corner next to version number

## How It Works

1. On first visit, a unique visitor ID is generated and stored in localStorage
2. Each page load records a new entry in `page_views` table
3. Visitor information is updated in `site_analytics` table
4. Statistics are displayed in real-time on the website
