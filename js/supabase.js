const SUPABASE_URL = 'https://twgydqknzdyahgfuamak.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z3lkcWtuemR5YWhnZnVhbWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NzExMDksImV4cCI6MjA1NDQ0NzEwOX0.0'; // 此處應為您的 anon key，我根據 URL 格式暫時填入佔位符，請確保與原先一致
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
