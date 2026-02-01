DO $$
DECLARE
    p TEXT;
BEGIN
    FOR p IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'site_visitors'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(p) || ' ON site_visitors';
    END LOOP;
    RAISE NOTICE '已刪除所有 site_visitors 舊政策';
END $$;

ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON site_visitors FOR SELECT USING (true);
CREATE POLICY "Public insert" ON site_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON site_visitors FOR UPDATE USING (true);

SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'site_visitors' AND schemaname = 'public';
