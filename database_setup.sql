-- 公告系統重構
-- 1. announcements：管理員專用發布公告
-- 2. guestbook：任何人可留言，IP 每日限制一則

-- ============================================
-- 建立表結構
-- ============================================

-- 公告表（管理員專用）
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    image_urls JSONB DEFAULT '[]'::jsonb,
    author_name TEXT NOT NULL DEFAULT '管理員',
    author_avatar TEXT,
    author_color TEXT DEFAULT '#00ffff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 留言板（任何人可發，IP 每日限制）
CREATE TABLE IF NOT EXISTS guestbook (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL DEFAULT '匿名訪客',
    author_ip TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook(created_at);
CREATE INDEX IF NOT EXISTS idx_guestbook_ip_date ON guestbook(author_ip, created_at);

-- ============================================
-- 啟用 RLS
-- ============================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 公告政策（管理員專用）
-- ============================================

DROP POLICY IF EXISTS "Public read announcements" ON announcements;
DROP POLICY IF EXISTS "Admin insert announcements" ON announcements;
DROP POLICY IF EXISTS "Admin update announcements" ON announcements;
DROP POLICY IF EXISTS "Admin delete announcements" ON announcements;

-- 公開讀取
CREATE POLICY "Public read announcements" ON announcements
    FOR SELECT USING (true);

-- 管理員可新增（使用 service_role 或已驗證的 admin）
CREATE POLICY "Admin insert announcements" ON announcements
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM site_settings s
            WHERE s.id = 'admin_email'
              AND s.value = (auth.jwt() ->> 'email')
        )
    );

-- 管理員可更新
CREATE POLICY "Admin update announcements" ON announcements
    FOR UPDATE USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM site_settings s
            WHERE s.id = 'admin_email'
              AND s.value = (auth.jwt() ->> 'email')
        )
    );

-- 管理員可刪除
CREATE POLICY "Admin delete announcements" ON announcements
    FOR DELETE USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM site_settings s
            WHERE s.id = 'admin_email'
              AND s.value = (auth.jwt() ->> 'email')
        )
    );

-- ============================================
-- 留言板政策（公開，但有 IP 限制）
-- ============================================

DROP POLICY IF EXISTS "Public read guestbook" ON guestbook;
DROP POLICY IF EXISTS "Public insert guestbook" ON guestbook;

-- 公開讀取
CREATE POLICY "Public read guestbook" ON guestbook
    FOR SELECT USING (true);

-- 公開新增（IP 每日限制由函式檢查）
CREATE POLICY "Public insert guestbook" ON guestbook
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 留言板 IP 每日限制函式
-- ============================================

CREATE OR REPLACE FUNCTION can_post_guestbook(user_ip TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- 檢查今天該 IP 是否已有留言
    RETURN NOT EXISTS (
        SELECT 1 FROM guestbook
        WHERE author_ip = user_ip
          AND created_at >= CURRENT_DATE
          AND created_at < CURRENT_DATE + INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 顯示狀態
-- ============================================

SELECT 'announcements' AS table_name, rowsecurity AS has_rls
FROM pg_tables WHERE tablename = 'announcements';

SELECT 'guestbook' AS table_name, rowsecurity AS has_rls
FROM pg_tables WHERE tablename = 'guestbook';
