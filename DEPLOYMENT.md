# ACG 收藏庫 - 安全升級與性能優化部署指南

## 📋 概述

本文檔詳細說明了 ACG 收藏庫 v6.0.0 的安全性升級和性能優化內容，以及完整的部署流程。

## 🔒 安全性升級

### 1. 環境變數配置

#### 新增文件
- `.env.example` - 環境變數範本文件
- `.env` - 實際環境配置（不提交到版本控制）

#### 配置步驟
```bash
# 1. 複製環境變數範本
cp .env.example .env

# 2. 編輯 .env 文件，填入實際配置
nano .env
```

#### 環境變數說明
```env
# Supabase 配置 (必需)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anonymous_key

# 安全設定
CSP_ENABLED=true
SESSION_SECRET=your_random_session_secret

# 開發模式
NODE_ENV=development
DEBUG=true
```

### 2. 內容安全政策 (CSP)

#### 新增安全模組
- `js/security.js` - 完整的安全管理系統
- `js/config.js` - 安全配置管理

#### CSP 功能
- ✅ XSS 攻擊防護
- ✅ 內容注入防護
- ✅ 惡意腳本過濾
- ✅ 安全標頭設置
- ✅ 違規報告機制

#### 安全標頭
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://your-supabase-url.co;
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

### 3. API 密鑰安全

#### 更新內容
- ✅ 移除硬編碼 API 密鑰
- ✅ 環境變數動態載入
- ✅ 配置驗證機制
- ✅ 安全錯誤處理

## ⚡ 性能優化

### 1. 模組化重構

#### 新增架構模組
```
js/
├── config.js      # 配置管理
├── security.js     # 安全管理
├── logger.js       # 日誌系統
├── performance.js  # 性能優化
├── supabase.js     # 資料庫客戶端
├── analytics.js    # 訪客統計
└── script.js       # 主應用邏輯
```

#### 模組載入順序
```html
<!-- 核心基礎模組 (載入順序重要) -->
<script src="./js/config.js"></script>
<script src="./js/logger.js"></script>
<script src="./js/security.js"></script>
<script src="./js/performance.js"></script>

<!-- 應用功能模組 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="./js/supabase.js"></script>
<script src="./js/analytics.js"></script>
<script src="./js/script.js"></script>
```

### 2. 性能優化功能

#### 懶加載系統
- ✅ 圖片懶加載
- ✅ 組件懶加載
- ✅ 背景圖片懶加載
- ✅ 交叉觀察器優化

#### 快取策略
- ✅ 智能快取管理
- ✅ 資源預載入
- ✅ DNS 預解析
- ✅ 關鍵資源預連接

#### 記憶體管理
- ✅ 記憶體使用監控
- ✅ 自動清理機制
- ✅ 事件監聽器管理
- ✅ 定時器清理

### 3. 日誌系統

#### 功能特性
- ✅ 多級別日誌 (debug, info, warn, error)
- ✅ 本地存儲管理
- ✅ 性能監控整合
- ✅ 錯誤追蹤
- ✅ 遠端日誌發送

#### 日誌 API
```javascript
// 基本使用
window.logger.info('用戶登入成功');
window.logger.error('資料庫連接失敗', { error });

// 性能監控
window.logger.performance.startTimer('dataLoad');
// ... 執行操作
const duration = window.logger.performance.endTimer('dataLoad');

// 獲取日誌統計
const stats = window.logger.getStats();
```

## 🚀 部署流程

### 1. 環境準備

#### 系統要求
- Node.js 16+ (開發環境)
- 現代瀏覽器 (Chrome 90+, Firefox 88+, Safari 14+)
- HTTPS 連接 (生產環境)

#### 依賴檢查
```bash
# 檢查 Node.js 版本
node --version

# 檢查 npm 版本
npm --version
```

### 2. 配置設置

#### 步驟 1: 環境變數配置
```bash
# 複製範本文件
cp .env.example .env

# 編輯配置
nano .env
```

#### 步驟 2: Supabase 設置
```bash
# 測試資料庫連接
python setup_db.py
```

#### 步驟 3: 安全配置驗證
```javascript
// 在瀏覽器控制台中執行
console.log('配置驗證:', window.configManager.validateConfig());
console.log('安全狀態:', window.securityManager.getSecurityConfig());
```

### 3. 生產部署

#### 靜態網站部署 (推薦)

##### Vercel 部署
```bash
# 1. 安裝 Vercel CLI
npm i -g vercel

# 2. 部署
vercel --prod

# 3. 設置環境變數
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

##### Netlify 部署
```bash
# 1. 拖拽文件夾到 Netlify
# 2. 在 Site settings > Environment variables 中設置環境變數
```

##### GitHub Pages 部署
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

#### 伺服器部署

##### Nginx 配置
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 配置
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # 安全標頭
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # 靜態文件服務
    location / {
        root /path/to/anime-manager;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # 資源快取
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

##### Apache 配置
```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /path/to/anime-manager
    
    # SSL 配置
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # 安全標頭
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # 靜態文件服務
    <Directory /path/to/anime-manager>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 4. 驗證部署

#### 功能檢查清單
- [ ] 網站正常載入
- [ ] 資料庫連接成功
- [ ] 管理員登入功能
- [ ] 作品管理功能
- [ ] 安全標頭正確設置
- [ ] CSP 政策生效
- [ ] 性能指標正常

#### 安全檢查
```bash
# 使用 curl 檢查安全標頭
curl -I https://your-domain.com

# 檢查 CSP 報告
# 在瀏覽器開發者工具中查看 Console 違規報告
```

#### 性能檢查
```javascript
// 在瀏覽器控制台中執行
console.log('性能指標:', window.performance.getDetailedMetrics());
console.log('日誌統計:', window.logger.getStats());
```

## 🔧 維護與監控

### 1. 日誌管理

#### 查看日誌
```javascript
// 獲取所有日誌
const logs = window.logger.getLogs();

// 獲取錯誤日誌
const errors = window.logger.getLogs({ level: 'error' });

// 導出日誌
const exportData = window.logger.exportLogs('json');
```

#### 清理日誌
```javascript
// 清除所有日誌
window.logger.clearLogs({ all: true });

// 清除 7 天前的日誌
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
window.logger.clearLogs({ since: weekAgo });
```

### 2. 性能監控

#### 監控指標
- 頁面載入時間
- 資源載入時間
- 記憶體使用情況
- 用戶交互響應時間

#### 優化建議
- 定期清理快取
- 監控記憶體使用
- 檢查資源載入性能
- 分析用戶行為數據

### 3. 安全更新

#### 定期檢查
- [ ] 更新依賴套件
- [ ] 檢查安全漏洞
- [ ] 更新 SSL 憑證
- [ ] 審查存取權限

#### 安全最佳實踐
- 定期更換密鑰
- 使用強密碼
- 啟用雙因素認證
- 監控異常活動

## 📞 技術支援

### 常見問題

#### Q: 資料庫連接失敗
**A:** 檢查 `.env` 文件中的 Supabase 配置，確保 URL 和 API 密鑰正確。

#### Q: CSP 違規錯誤
**A:** 檢查瀏覽器控制台的 CSP 報告，調整安全政策配置。

#### Q: 性能問題
**A:** 檢查性能指標，清理快取，優化圖片載入。

### 聯絡方式
- 技術文檔：查看項目 README
- 問題回報：GitHub Issues
- 安全問題：security@your-domain.com

## 📈 版本資訊

- **當前版本**: v6.0.0
- **升級日期**: 2026-01-28
- **兼容性**: 向下兼容 v5.x
- **升級建議**: 建議立即升級以獲得安全保護

---

**注意**: 本升級包含重要的安全性改進，建議盡快部署到生產環境。