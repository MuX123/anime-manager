# GitHub Pages 部署指南

## 🚀 快速部署到 GitHub Pages

### 步驟 1: 創建 GitHub Repository

1. 在 GitHub 上創建新的 repository
2. 將專案推送到 GitHub

```bash
# 初始化 Git (如果尚未初始化)
git init

# 添加遠端倉庫
git remote add origin https://github.com/your-username/anime-manager.git

# 添加所有文件
git add .

# 提交更改
git commit -m "🚀 Initial commit: ACG Manager v6.0.0"

# 推送到 GitHub
git push -u origin main
```

### 步驟 2: 啟用 GitHub Pages

1. 進入你的 GitHub repository
2. 點擊 `Settings` 選項卡
3. 在左側菜單中找到 `Pages`
4. 在 `Build and deployment` 中選擇 `Source: Deploy from a branch`
5. 選擇 `Branch: main` 和 `Folder: /root`
6. 點擊 `Save`

### 步驟 3: 配置 Supabase

#### 3.1 創建 Supabase 專案

1. 前往 [Supabase](https://supabase.com)
2. 註冊帳號並創建新專案
3. 等待專案創建完成

#### 3.2 獲取配置信息

在 Supabase Dashboard 中：
1. 進入 `Settings` > `API`
2. 複製以下信息：
   - Project URL
   - anon public key

#### 3.3 設置環境變數 (可選)

如果你有 GitHub Pro 帳號，可以使用 GitHub Secrets：

1. 進入 repository 的 `Settings` > `Secrets and variables` > `Actions`
2. 點擊 `New repository secret`
3. 添加以下 secrets：
   - `SUPABASE_URL`: 你的 Supabase URL
   - `SUPABASE_ANON_KEY`: 你的 Supabase Anonymous Key

### 步驟 4: 自定義配置 (推薦)

#### 方法 1: 直接修改配置文件

1. Fork 這個專案到你的帳號
2. 編輯 `js/github-pages-config.js` 文件
3. 替換以下配置：

```javascript
window.__ACG_CONFIG__ = {
    SUPABASE_URL: 'https://your-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    NODE_ENV: 'production',
    DEBUG: false,
    CSP_ENABLED: true
};
```

#### 方法 2: 使用環境變數 (高級)

如果你有自定義域名和伺服器，可以通過伺服器端設置環境變數。

### 步驟 5: 設置資料庫表結構

#### 自動設置 (推薦)

```bash
# 克隆你的專案
git clone https://github.com/your-username/anime-manager.git
cd anime-manager

# 安裝 Python 依賴
pip install requests python-dotenv

# 創建 .env 文件
cp .env.example .env

# 編輯 .env 文件，填入你的 Supabase 配置
# 然後運行設置腳本
python setup_db.py
```

#### 手動設置

在 Supabase SQL Editor 中運行以下 SQL：

```sql
-- 創建作品資料表
CREATE TABLE anime_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    poster_url TEXT,
    genre TEXT[],
    year TEXT,
    season TEXT,
    month TEXT,
    episodes TEXT,
    rating TEXT,
    recommendation TEXT,
    category_colors JSONB,
    extra_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 創建網站設定表
CREATE TABLE site_settings (
    id TEXT PRIMARY KEY,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 創建公告表
CREATE TABLE announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 創建訪客統計表
CREATE TABLE visitor_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id TEXT,
    page_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    session_data JSONB
);

-- 插入預設設定
INSERT INTO site_settings (id, value) VALUES 
('site_title', 'ACG 收藏庫'),
('announcement', '⚡ 歡迎使用 ACG 收藏庫 ⚡'),
('title_color', '#ffffff'),
('announcement_color', '#ffffff'),
('admin_name', '管理員'),
('admin_avatar', 'https://cdn.discordapp.com/embed/avatars/0.png'),
('admin_color', '#00d4ff'),
('custom_labels', '{}');

-- 啟用 RLS (Row Level Security)
ALTER TABLE anime_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 策略
CREATE POLICY "允許所有讀取" ON anime_list FOR SELECT USING (true);
CREATE POLICY "允許所有讀取" ON site_settings FOR SELECT USING (true);
CREATE POLICY "允許所有讀取" ON announcements FOR SELECT USING (true);
CREATE POLICY "允許所有插入" ON visitor_analytics FOR INSERT WITH CHECK (true);
```

### 步驟 6: 驗證部署

1. 等待 GitHub Pages 完成部署 (通常需要 1-2 分鐘)
2. 訪問 `https://your-username.github.io/anime-manager/`
3. 檢查是否正常載入

#### 常見問題排查

**問題 1: 配置錯誤訊息**
- 確保 Supabase URL 和 Anonymous Key 正確
- 檢查網路連接
- 查看瀏覽器控制台錯誤訊息

**問題 2: 資料庫連接失敗**
- 確認 Supabase 專案已經創建
- 檢查 API Key 是否正確
- 確認資料表已經創建

**問題 3: 權限錯誤**
- 確認 RLS 策略已設置
- 檢查 Anonymous Key 是否有正確權限

### 步驟 7: 自定義域名 (可選)

如果你有自己的域名：

1. 在 repository 的 `Settings` > `Pages` 中
2. 點擊 `Custom domain`
3. 添加你的域名 (例如: `anime.yourdomain.com`)
4. 按照指示配置 DNS 記錄

### 🎉 完成！

你的 ACG 收藏庫現已成功部署到 GitHub Pages！

## 📱 部署後功能

部署完成後，你將獲得：

- ✅ **完整的動漫管理系統**
- ✅ **響應式設計** (支援手機和桌面)
- ✅ **後台管理面板**
- ✅ **安全防護** (XSS, CSP)
- ✅ **性能優化** (懶加載, 快取)
- ✅ **訪客統計**
- ✅ **現代化 UI**

## 🔄 更新部署

當你推送新代碼到 main 分支時，GitHub Pages 會自動重新部署。

```bash
git add .
git commit -m "✨ New feature or fix"
git push origin main
```

## 📞 獲得幫助

如果遇到問題：

1. 查看 [GitHub Pages 文檔](https://docs.github.com/en/pages)
2. 查看 [Supabase 文檔](https://supabase.com/docs)
3. 提交 Issue 到本專案
4. 檢查瀏覽器控制台的詳細錯誤信息

---

**提示**: 為了獲得最佳體驗，建議使用 GitHub Pro 帳號以支援自定義域名和更多功能。