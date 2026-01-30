#!/bin/bash

# ACG 收藏庫 - 檔案清理腳本
# 清理所有過期和無用的檔案

echo "🧹 ACG 收藏庫檔案清理開始..."
echo "=================================================="

# 備份標準修復腳本
if [ -f "WORKING_FIX.sql" ]; then
    echo "📋 備份標準修復腳本..."
    cp WORKING_FIX.sql STANDARD_DATABASE_FIX.sql.backup
    echo "✅ 標準修復腳本已備份"
fi

# 刪除過期檔案
echo "🗑️ 刪除過期檔案..."

# 修復腳本檔案 (已完成修復，不再需要)
echo "  - 刪除最終修復腳本..."
rm -f FINAL_FIX.sql 2>/dev/null || echo "FINAL_FIX.sql 已不存在"
rm -f ULTIMATE_FIX.sql 2>/dev/null || echo "ULTIMATE_FIX.sql 已不存在"
rm -f ULTIMATE_FIX_FIXED.sql 2>/dev/null || echo "ULTIMATE_FIX_FIXED.sql 已不存在"

# 測試和診斷檔案 (已完成診斷)
echo "  - 刪除測試腳本..."
rm -f test_session_id_fix.sql 2>/dev/null || echo "test_session_id_fix.sql 已不存在"
rm -f diagnose_database.sql 2>/dev/null || echo "diagnose_database.sql 已不存在"

# 衝突修復檔案 (已被整合到標準腳本)
echo "  - 刪除衝突修復腳本..."
rm -f fix_session_id_conflict.sql 2>/dev/null || echo "fix_session_id_conflict.sql 已不存在"

# 過期功能檔案 (已被取代)
echo "  - 刪除過期功能檔案..."
rm -f js/fix-recommendation.js 2>/dev/null || echo "js/fix-recommendation.js 已不存在"

# 更新腳本檔案 (執行完後可刪除)
echo "  - 刪除更新腳本..."
# rm -f update_to_v6.2.0.sh 2>/dev/null || echo "update_to_v6.2.0.sh 已不存在"
# rm -f VERSION_UPDATE_PLAN.md 2>/dev/null || echo "VERSION_UPDATE_PLAN.md 已不存在"

# 檢查剩餘檔案
echo "📋 檢查剩餘檔案..."
echo ""
echo "保留的檔案："
find . -name "*.sql" -o -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.md" -o -name "*.sh" | grep -v ".git" | sort

echo ""
echo "✅ 檔案清理完成！"
echo "=================================================="
echo "🎉 專案已整理完成"
echo "📁 只保留必要檔案"
echo "🗂️ 所有過期和重複檔案已清理"
echo "=================================================="