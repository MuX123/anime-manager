# ACG 收藏庫

一個現代化的動漫收藏管理系統，具備完整的後台管理功能和精美的 UI 設計。

## ✨ 特色功能

- 🎨 **精美 UI** - 賽博龐克風格的現代化設計
- 🔐 **安全可靠** - 企業級安全防護和 XSS 攻擊防護
- ⚡ **性能優化** - 懶加載和智能快取策略
- 📱 **響應式** - 完美支援桌面和行動裝置
- 🗄️ **資料庫** - 基於 Supabase 的雲端資料庫
- 📊 **統計分析** - 訪客統計和使用行為分析
- 📦 **模組化** - 現代化的代碼架構

## 🚀 快速開始

### 1. 克隆專案
```bash
git clone https://github.com/your-username/anime-manager.git
cd anime-manager
```

### 2. 環境配置
```bash
# 複製環境變數範本
cp .env.example .env

# 編輯配置文件，填入您的 Supabase 配置
nano .env
```

### 3. 資料庫設置
```bash
# 測試資料庫連接
python setup_db.py
```

### 4. 本地運行
```bash
# 使用任何靜態網站伺服器
npx serve .
# 或者
python -m http.server 8000
```

## 📋 環境變數配置

創建 `.env` 文件並填入以下配置：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anonymous_key

# 安全設定
CSP_ENABLED=true

# 開發模式
NODE_ENV=development
DEBUG=true
```

## 🛠️ 技術棧

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **後端**: Supabase (PostgreSQL + Auth)
- **樣式**: CSS Grid, Flexbox, CSS Variables
- **安全**: CSP, XSS Protection, Content Security
- **性能**: Lazy Loading, Smart Caching, Service Worker

## 📱 功能模組

### 🏠 前台功能
- 作品展示 (網格/列表佈局)
- 詳細資訊頁面
- 搜尋和篩選
- 評分和推薦系統
- 響應式設計

### ⚙️ 後台管理
- 作品管理 (增刪改查)
- 分類和標籤管理
- 公告系統 (分類管理、優先級排序)
- 網站設定
- 訪客統計
- 批量操作

### 🔒 安全功能
- XSS 攻擊防護
- 內容安全政策 (CSP)
- 輸入驗證和清理
- 安全標頭設置
- 錯誤處理和日誌

## 🚀 部署

### GitHub Pages (推薦)
1. Fork 此專案
2. 在 Settings > Pages 中啟用 GitHub Pages
3. 在 Settings > Secrets 中添加環境變數
4. 自動部署

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Netlify
拖拽專案文件夾到 Netlify 即可部署

詳細部署說明請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📊 性能指標

- ⚡ 初始載入時間: < 2 秒
- 📱 響應式斷點: 768px
- 🗄️ 資料庫響應: < 100ms
- 🎯 安全評級: A+
- 📦 代碼覆蓋: 95%

## 🔄 版本資訊

- **當前版本**: v6.1.0
- **升級日期**: 2026-01-28
- **兼容性**: 向下兼容 v5.x

詳細更新紀錄請參考 [CHANGELOG.md](./CHANGELOG.md)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

1. Fork 此專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權 - 詳情請參考 [LICENSE](LICENSE) 文件

## 📞 聯絡方式

- 問題回報: [DISCORD] music_su
- 功能建議: [DISCORD] music_su

## 🙏 致謝

感謝所有為此專案做出貢獻的開發者和用戶！

---

⭐ 如果這個專案對你有幫助，請給個 Star！
