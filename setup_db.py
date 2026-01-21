import requests
import json

url = "https://twgydqknzdyahgfuamak.supabase.co/rest/v1/"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z3lkcWtuemR5YWhnZnVhbWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA5MTEsImV4cCI6MjA4NDMzNjkxMX0.0YizCZP2OglEQQIh96x8viaemR6reZs8zendNT9KS7c",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z3lkcWtuemR5YWhnZnVhbWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA5MTEsImV4cCI6MjA4NDMzNjkxMX0.0YizCZP2OglEQQIh96x8viaemR6reZs8zendNT9KS7c",
    "Content-Type": "application/json",
    "Prefer": "params=single-object"
}

# 由於我們無法直接執行 SQL (除非有 service_role key 或啟用 RPC)，
# 我們先嘗試讀取資料表，如果不存在則提示用戶。
try:
    response = requests.get(url + "announcements?select=*", headers=headers)
    if response.status_code == 200:
        print("Table 'announcements' already exists.")
    else:
        print(f"Table check status: {response.status_code}, response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
