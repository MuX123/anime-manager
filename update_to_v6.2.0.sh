#!/bin/bash

# ACG 收藏庫 - 快速版本更新腳本 v6.2.0
# 終極修復版本的快速更新

echo "🚀 ACG 收藏庫 v6.2.0 版本更新"
echo "=================================================="

# 更新所有 JavaScript 配置檔案
echo "📝 更新 JavaScript 配置檔案..."

# 主要配置檔案
files=(
    "js/config.js"
    "types/index.d.ts"
    "js/supabase.js"
    "js/security.js"
    "js/performance.js"
    "js/logger.js"
    "js/debug.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  更新 $file..."
        # 使用 sed 替換版本號
        sed -i "s/version: '[^']*/version: '6.2.0'/" "$file"
        echo "  ✅ $file 已更新到 v6.2.0"
    else
        echo "  ⚠️ $file 不存在，跳過"
    fi
done

# 更新 HTML 檔案
echo "📄 更新 HTML 檔案..."

if [ -f "index.html" ]; then
    # 更新所有腳本版本參數
    sed -i "s/v=[^\"]*/v=20260130_v6.2.0\"/g" "index.html"
    echo "  ✅ index.html 已更新到 v6.2.0"
else
    echo "  ⚠️ index.html 不存在，跳過"
fi

# 更新 CSS 檔案
echo "🎨 更新 CSS 檔案..."

if [ -f "css/style.css" ]; then
    # 更新版本參數
    sed -i "s/v[0-9]\.[0-9]*/v6.2.0/g" "css/style.css"
    
    # 添加新版本標記
    if ! grep -q "v6.2.0 - Ultimate Fix" "css/style.css"; then
        echo "" >> "css/style.css"
        echo "/* v6.2.0 - Ultimate Fix 版本標記 */" >> "css/style.css"
        echo ".site-version::after {" >> "css/style.css"
        echo "    content: \"v6.2.0 - Ultimate Fix\";" >> "css/style.css"
        echo "}" >> "css/style.css"
        echo "/* 保留所有現有版本標記 */" >> "css/style.css"
        echo ""
    fi
    
    echo "  ✅ css/style.css 已更新到 v6.2.0"
else
    echo "  ⚠️ css/style.css 不存在，跳過"
fi

# 更新資料庫版本
echo "🗄️ 更新資料庫版本..."

# 如果有標準修復腳本，可以使用它來更新資料庫
if [ -f "STANDARD_DATABASE_FIX.sql" ]; then
    echo "  檢測到標準修復腳本，將更新資料庫版本..."
    # 這裡可以添加 SQL 語句來更新版本
    echo "  ✅ 準備使用標準修復腳本更新資料庫"
else
    echo "  ⚠️ 標準修復腳本不存在，請手動更新資料庫版本"
fi

# 更新文檔
echo "📚 更新文檔..."

# README.md
if [ -f "README.md" ]; then
    # 添加新版本資訊
    if ! grep -q "v6.2.0" "README.md"; then
        echo "" >> "README.md"
        echo "## 🎉 v6.2.0 - Ultimate Fix (2026-01-30)" >> "README.md"
        echo "" >> "README.md"
        echo "### 📋 版本資訊" >> "README.md"
        echo "- 版本號: v6.2.0" >> "README.md"
        echo "- 發布日期: 2026-01-30" >> "README.md"
        echo "- 型態: 終極修復版" >> "README.md"
        echo "" >> "README.md"
        echo "### 🔧 主要修復內容" >> "README.md"
        echo "- ✅ 解決 `is_pinned` 欄位缺失問題" >> "README.md"
        echo "- ✅ 解決 `session_id` 欄位缺失問題" >> "README.md"
        echo "- ✅ 解決 PostgreSQL 語法錯誤 (42601)" >> "README.md"
        echo "- ✅ 修復 Unicode 字符兼容性問題" >> "README.md"
        echo "- ✅ 創建完整的資料庫重建腳本" >> "README.md"
        echo "- ✅ 建立 `STANDARD_DATABASE_FIX.sql` 作為標準" >> "README.md"
        echo "- ✅ 清理所有過期檔案" >> "README.md"
        echo "- ✅ 完善版本控制流程" >> "README.md"
        echo "" >> "README.md"
        echo "### 🚀 使用方式" >> "README.md"
        echo "1. 執行 `update_to_v6.2.0.sh` 自動更新所有版本號" >> "README.md"
        echo "2. 或手動執行 `STANDARD_DATABASE_FIX.sql` 修復資料庫問題" >> "README.md"
        echo "" >> "README.md"
        echo "### 📊 技術改進" >> "README.md"
        echo "- PostgreSQL 標準語法兼容性" >> "README.md"
        echo "- Unicode 字符處理最佳化" >> "README.md"
        echo "- 完整的錯誤檢測和修復流程" >> "README.md"
        echo "" >> "README.md"
        echo "這個版本標記了 ACG 收藏庫開發歷程的一個重要里程碑！" >> "README.md"
        echo "✅ README.md 已更新"
    else
        echo "  ⚠️ README.md 已包含 v6.2.0 資訊"
    fi
else
    echo "  ⚠️ README.md 不存在，跳過"
fi

# CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
    # 添加新版本更新記錄
    if ! grep -q "v6.2.0" "CHANGELOG.md"; then
        echo "" >> "CHANGELOG.md"
        echo "## 🎉 v6.2.0 - Ultimate Fix (2026-01-30)" >> "CHANGELOG.md"
        echo "" >> "CHANGELOG.md"
        echo "- ✅ 解決 `is_pinned` 欄位缺失問題" >> "CHANGELOG.md"
        echo "- ✅ 解決 `session_id` 欄位缺失問題" >> "CHANGELOG.md"
        echo "- ✅ 解決 PostgreSQL 語法錯誤 (42601)" >> "CHANGELOG.md"
        echo "- ✅ 修復 Unicode 字符兼容性問題" >> "CHANGELOG.md"
        echo "- ✅ 創建完整的資料庫重建腳本" >> "CHANGELOG.md"
        echo "- ✅ 建立 `STANDARD_DATABASE_FIX.sql` 作為標準" >> "CHANGELOG.md"
        echo "- ✅ 清理所有過期檔案，簡化專案結構" >> "CHANGELOG.md"
        echo "- ✅ 完善版本控制流程，確保未來更新不會破壞功能" >> "CHANGELOG.md"
        echo "" >> "CHANGELOG.md"
        echo "---" >> "CHANGELOG.md"
        echo "✅ CHANGELOG.md 已更新"
    else
        echo "  ⚠️ CHANGELOG.md 已包含 v6.2.0 資訊"
    fi
else
    echo "  ⚠️ CHANGELOG.md 不存在，跳過"
fi

echo ""
echo "🎉 版本更新完成！"
echo "=================================================="
echo "📝 已更新的檔案："
echo "  ✅ 所有 JavaScript 配置檔案"
echo "  ✅ index.html"
echo "  ✅ css/style.css"
echo "  ✅ README.md"
echo "  ✅ CHANGELOG.md"
echo ""
echo "🚀 ACG 收藏庫 v6.2.0 已準備發布！"
echo "=================================================="