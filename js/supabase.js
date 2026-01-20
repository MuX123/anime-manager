const SUPABASE_URL = 'https://twgydqknzdyahgfuamak.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z3lkcWtuemR5YWhnZnVhbWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA5MTEsImV4cCI6MjA4NDMzNjkxMX0.0YizCZP2OglEQQIh96x8viaemR6reZs8zendNT9KS7c';

// 系統管理 AI 診斷：確保全域變數正確初始化
if (typeof supabase === 'undefined') {
    console.error('Supabase SDK 未載入，請檢查網路連線或 CDN 引用。');
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
});

// 導出全域變數以供 script.js 使用
window.supabaseClient = supabaseClient;
