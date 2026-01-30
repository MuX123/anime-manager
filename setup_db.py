import requests
import json
import os

class SupabaseManager:
    def __init__(self):
        # 讀取環境變數或使用預設值
        self.url = os.getenv('SUPABASE_URL', 'https://twgydqknzdyahgfuamak.supabase.co')
        self.api_key = os.getenv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z3lkcWtuemR5YWhnZnVhbWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA5MTEsImV4cCI6MjA4NDMzNjkxMX0.0YizCZP2OglEQQIh96x8viaemR6reZs8zendNT9KS7c')
        
        # 檢查是否使用了預設值（不安全的情況）
        is_using_default = (
            self.url == 'https://twgydqknzdyahgfuamak.supabase.co' or
            self.api_key.startswith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
        )
        
        if is_using_default:
            print("⚠️  警告：正在使用預設的 API 配置")
            print("📝 建議：請在 .env 文件中配置您自己的 Supabase 憑證")
        
        self.headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Prefer": "params=single-object"
        }
        
        print(f"✅ Supabase 配置載入成功")

    def test_connection(self):
        """測試資料庫連線"""
        try:
            response = requests.get(f"{self.url}/rest/v1/announcements?select=*&limit=1", headers=self.headers)
            if response.status_code == 200:
                print("✅ 資料庫連線測試成功")
                return True
            else:
                print(f"❌ 資料庫連線失敗: {response.status_code}")
                if response.text:
                    print(f"錯誤詳情: {response.text[:200]}...")
                return False
        except Exception as e:
            print(f"❌ 連線錯誤: {e}")
            return False

    def check_table_exists(self, table_name):
        """檢查資料表是否存在"""
        try:
            response = requests.get(f"{self.url}/rest/v1/{table_name}?select=*&limit=1", headers=self.headers)
            if response.status_code == 200:
                print(f"✅ 資料表 '{table_name}' 存在")
                return True
            elif response.status_code == 404:
                print(f"⚠️  資料表 '{table_name}' 不存在")
                return False
            elif response.status_code == 400:
                print(f"⚠️  資料表 '{table_name}' 可能不存在或權限不足")
                return False
            else:
                print(f"❌ 檢查資料表失敗: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 檢查錯誤: {e}")
            return False

# 創建 Supabase 管理器實例
try:
    supabase = SupabaseManager()
except Exception as e:
    print(f"❌ 初始化失敗: {e}")
    print("\n📝 請按照以下步驟配置：")
    print("1. 複製 .env.example 為 .env")
    print("2. 在 .env 中填入您的 Supabase 配置")
    print("3. 重新運行此腳本")
    exit(1)

def main():
    """主程序"""
    print("🔧 ACG 收藏庫 - 資料庫設定工具")
    print("=" * 50)
    
    # 測試連線
    if not supabase.test_connection():
        return
    
    # 檢查必要的資料表
    required_tables = [
        'anime_list',
        'site_settings', 
        'announcements',
        'visitor_analytics'
    ]
    
    print("\n📊 檢查資料表狀態:")
    all_exist = True
    for table in required_tables:
        if not supabase.check_table_exists(table):
            all_exist = False
    
    if all_exist:
        print("\n✅ 所有必要的資料表都已存在，資料庫設定完成！")
    else:
        print("\n⚠️  部分資料表缺失，請在 Supabase 控制台中手動創建。")
        print("\n📋 建議的資料表結構:")
        print("""
1. anime_list (作品資料表)
   - id (uuid, primary key)
   - title (text)
   - poster_url (text)
   - genre (text[])
   - year (text)
   - season (text)
   - month (text)
   - episodes (text)
   - rating (text)
   - recommendation (text)
   - category_colors (jsonb)
   - extra_data (jsonb)
   - created_at (timestamp)
   - updated_at (timestamp)

2. site_settings (網站設定表)
   - id (text, primary key)
   - value (text)
   - created_at (timestamp)
   - updated_at (timestamp)

3. announcements (公告表)
   - id (uuid, primary key)
   - title (text)
   - content (text)
   - priority (integer)
   - is_active (boolean)
   - created_at (timestamp)
   - updated_at (timestamp)

4. visitor_analytics (訪客統計表)
   - id (uuid, primary key)
   - visitor_id (text)
   - page_url (text)
   - timestamp (timestamp)
   - user_agent (text)
   - session_data (jsonb)
""")

if __name__ == "__main__":
    main()
