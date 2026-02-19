# ACG Anime Manager - 模組清單 (Module Registry)

## 專案架構說明

此專案使用模組化架構，所有 JS 檔案依賴關係如下：

```
載入順序 (index.html):
1. module-loader.js    → 模組系統 (v1.0.0 新增)
2. github-pages-config.js
3. config.js           → 系統配置
4. logger.js          → 日誌系統
5. security.js        → 安全防護
6. usability.js       → 易用性
7. performance.js      → 效能優化
8. @supabase/supabase-js → CDN
9. supabase.js        → 資料庫客戶端
10. fuse.basic.min.js → 搜尋引擎
11. embla-carousel.umd.js
12. data-manager.js    → 資料管理
13. admin-panel.js    → 新後台 UI (v9.0 Cyberpunk)
14. admin-manager.js  → 管理員控制器
15. ui-controller.js  → UI 控制
16. event-handler.js  → 事件處理
17. announcements.js   → 公告系統
18. analytics.js       → 數據分析
19. img-utils.js      → 圖片工具
20. render.js         → 渲染核心
21. render-app.js     → 應用渲染
22. visual-engine.js  → 視覺引擎
23. atmosphere.js      → 氛圍系統 (游標)
24. background.js     → 背景系統
25. script.js         → 主邏輯
26. main.js           → 應用入口
27. fix-recommendation.js
```

## 模組系統 (module-loader.js)

每個模組末端都會自動註冊：
```javascript
// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('模組名', {
        loaded: true,
        exports: { 匯出的函數 },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: 模組名');
}
```

### API
```javascript
// 定義模組
window.defineModule('模組名', {
    file: './js/模組.js',
    dependencies: ['依賴的模組'],
    exports: ['匯出的函數']
});

// 檢查模組是否載入
window.isModuleLoaded('模組名')

// 取得模組
window.getModule('模組名')

// 驗證系統
window.Modules.validate()     // 驗證所有模組
window.Modules.debug.list()    // 列出所有模組狀態
window.Modules.debug.checkMissing() // 檢查缺失的函數
```

---

## 模組清單

| 檔案 | 中文名稱 | 功能 | 依賴 |
|------|----------|------|------|
| **核心模組** | | | |
| config.js | 系統配置 | 環境變數、API 設定 | - |
| logger.js | 日誌系統 | 統一日誌輸出 | config |
| security.js | 安全防護 | CSP、XSS 防護 | config |
| usability.js | 易用性管理 | 使用者體驗優化 | - |
| performance.js | 效能優化 | Service Worker 快取 | config |
| **資料模組** | | | |
| supabase.js | 資料庫客戶端 | Supabase 連線、認證 | config |
| data-manager.js | 資料管理 | CRUD 操作、API 呼叫 | supabase |
| analytics.js | 數據分析 | 訪客統計 | config |
| announcements.js | 公告系統 | 跑馬燈、公告載入 | supabase |
| **UI 渲染模組** | | | |
| render.js | 渲染核心 | 卡牌、網格渲染 | data-manager |
| render-app.js | 應用渲染 | App 整體渲染 | render |
| background.js | 背景系統 | 數位星座背景 | - |
| visual-engine.js | 視覺引擎 | 動畫、粒子效果 | atmosphere |
| atmosphere.js | 氛圍系統 | 游標主題、切換 | - |
| **互動模組** | | | |
| ui-controller.js | UI 控制 | 選單、彈窗控制 | - |
| event-handler.js | 事件處理 | 點擊、滾動事件綁定 | - |
| img-utils.js | 圖片工具 | Lazy Load、優化 | - |
| **管理模組** | | | |
| admin-panel.js | 新後台 UI | v9.0 Cyberpunk 風格介面 | supabase, data-manager |
| admin-manager.js | 管理員控制器 | 登入、切換邏輯 | admin-panel, supabase |
| **主程式** | | | |
| script.js | 主邏輯 | 核心業務邏輯 | data-manager, render, admin-manager |
| main.js | 應用入口 | 初始化流程 | script |
| **工具模組** | | | |
| module-loader.js | 模組載入器 | 依賴管理、載入追蹤 | - |
| github-pages-config.js | GitHub Pages 配置 | 部署檢查 | - |
| fix-recommendation.js | 推薦指數修復 | 資料修補 | - |

---

## 重要函數列表

### 管理員相關
| 函數 | 位置 | 說明 |
|------|------|------|
| `window.toggleAdminMode(enable)` | admin-manager.js | 切換後台模式 |
| `window.AdminPanel` | admin-panel.js | 新後台物件 |
| `window.AdminPanel.open()` | admin-panel.js | 開啟新後台 |
| `window.AdminPanel.close()` | admin-panel.js | 關閉新後台 |
| `window.AdminPanel.Auth.showLogin()` | admin-panel.js | 顯示登入表單 |
| `window.renderAdmin()` | admin-manager.js | 渲染管理介面 |
| `window.checkAndUpdateAdminStatus()` | admin-manager.js | 檢查管理員狀態 |
| `window.updateAdminMenu()` | admin-manager.js | 更新選單按鈕 |
| `window.isAdminLoggedIn` | admin-manager.js | 登入狀態變數 |

### 資料相關
| 函數 | 位置 | 說明 |
|------|------|------|
| `window.loadData()` | data-manager.js | 載入作品資料 |
| `window.animeData` | data-manager.js | 作品資料陣列 |
| `window.supabaseManager` | supabase.js | Supabase 管理物件 |

### 渲染相關
| 函數 | 位置 | 說明 |
|------|------|------|
| `window.renderApp()` | render-app.js | 渲染主介面 |
| `window.renderGrid()` | render.js | 渲染網格 |
| `window.renderCard()` | render.js | 渲染卡片 |

---

## 常見問題排查

### Q: AdminPanel 是 undefined
1. 檢查 admin-panel.js 是否正確載入
2. 檢查 Console 有無語法錯誤
3. 執行 `window.Modules.debug.checkMissing()` 檢查函數

### Q: toggleAdminMode 無效
1. 檢查 admin-manager.js 是否載入
2. 檢查 isAdminLoggedIn 狀態
3. 檢查 AdminPanel 是否存在

---

更新日期: 2026-02-16
