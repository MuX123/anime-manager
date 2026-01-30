-- 添加管理員 email 設定到 site_settings
-- 這樣可以更靈活地管理哪個用戶是管理員

INSERT INTO site_settings (id, value) 
VALUES 
    ('admin_email', 'admin@acg-manager.com'),
    ('admin_email_backup', 'backup@acg-manager.com')
ON CONFLICT (id) 
DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW() 
WHERE site_settings.id = EXCLUDED.id;