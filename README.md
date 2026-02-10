# 🌌 ACG Anime Manager v8.0.0 (Cyberpunk Edition)

一個基於 Supabase 的極致視覺、高度自動化的動漫/漫畫/電影收藏管理系統。採用賽博龐克 (Cyberpunk) 霓虹美學與現代化的開源架構。

![UI Preview](https://via.placeholder.com/1200x600/050609/00d4ff?text=ACG+Anime+Manager+v8.0.0+Cyberpunk+Theme)

## 💎 視覺與核心特色

- **🎨 賽博美學 (Cyber-Neon UI)**: 全面採用 Glassmorphism (玻璃擬態) 與雙層視差動態背景，呈現深色暗調與霓虹光效的完美連結。
- **✨ 3D 交互體驗**: 詳情頁及 Modal 視窗配備硬體加速的 3D 透視轉場 (Perspective & Scale Pop)，互動細節流暢且專業。
- **📢 頂部跑馬燈系統**: 自動同步資料庫最新公告，以平滑的高性能 CSS 動畫在頂部狀態欄滾動顯示。
- **⚡ 數據同步鎖 (Request ID Synchronization)**: 獨家實現非同步渲染同步機制，徹底解決快速切換板塊時的資料競態 (Race Condition)，確保 UI 顯示始終精確。
- **🛠️ 自動化資料補全**: 整合 Jikan API、Bangumi 與 DeepL 翻譯，一鍵自動抓取並翻譯作品海報、簡介與評分。
- **📊 實時訪客分析**: 自研 Analytics 模組，完整統計每日訪客、裝置分佈與點擊行為，並以水平狀態欄優雅展示。

## 🚀 快速開始

### 1. 環境克隆
```bash
git clone https://github.com/your-username/anime-manager.git
cd anime-manager
```

### 2. 資料庫配置
1. 在 [Supabase](https://supabase.com/) 創建新專案。
2. 執行 `database_setup.sql` 初始化表結構、RLS 策略與 RPC 函數。
3. 創建 `.env` 並填入 `SUPABASE_URL` 與 `SUPABASE_ANON_KEY`。

### 3. 本地啟動
```bash
# 使用簡易 HTTP Server
python -m http.server 8000
```

## 🛠️ 技術棧

- **Core**: Vanilla JavaScript (ES6+), HTML5, CSS3 (Variables & Keyframes)
- **Backend**: Supabase (Postgres, Auth, Edge Functions)
- **Visuals**: Canvas API (Background effects), CSS Perspective (3D)
- **Caching**: Service Worker v8.0.0 (Advanced Cache-First Strategy)
- **Logic**: Centralized Managers (CursorManager, SupabaseManager)

## 📋 功能清單 (v8.0.0)

- [x] **動態背景**: 數位星座連線 (Digital Constellation) 背景與滑鼠懸浮互動。
- [x] **自定義遊標**: 支援波奇、原神、芙寧娜等主題遊標切換與管理。
- [x] **MovieFFM 整合**: 作品詳情頁自動生成 MovieFFM 搜尋連結。
- [x] **雙重分頁**: 頂部與底部同步控制，簡約幽靈按鈕設計。
- [x] **管理後台**: 完善的 CRUD 功能、數據驗證與批量操作。
- [x] **極致響應**: 針對行動端優化的「資料列表」模式。

## 🌐 部署建議

本專案支援 **GitHub Pages** 靜態部署。所有的 API 查詢、管理權限驗證與數據存儲均通過 Supabase 庫端完成。

詳細部署指南請參考 [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md)

## 📜 許可證

本專案基於 **MIT License** 開源。

---

> [!TIP]
> **提示**：管理員登入請點擊右下角懸浮按鈕或系統選單。
