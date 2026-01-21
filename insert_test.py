import requests
import json

url = "https://twgydqknzdyahgfuamak.supabase.co/rest/v1/announcements"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z3lkcWtuemR5YWhnZnVhbWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA5MTEsImV4cCI6MjA4NDMzNjkxMX0.0YizCZP2OglEQQIh96x8viaemR6reZs8zendNT9KS7c",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z3lkcWtuemR5YWhnZnVhbWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA5MTEsImV4cCI6MjA4NDMzNjkxMX0.0YizCZP2OglEQQIh96x8viaemR6reZs8zendNT9KS7c",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

data = {
    "content": "歡迎來到全新的永久公告系統！這裡的訊息將會永久保存，不再受限於 Discord 的 30 天限制。",
    "author_name": "系統管理員",
    "author_avatar": "https://cdn.discordapp.com/embed/avatars/0.png"
}

response = requests.post(url, headers=headers, data=json.dumps(data))
print(f"Status: {response.status_code}, Response: {response.text}")
