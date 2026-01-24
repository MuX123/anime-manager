# Bug Fix Report

## Issues Fixed

### 1. Delete Anime Function Missing
**Problem**: Backend delete button (`✕ 刪除`) was calling `window.deleteAnime()` but the function was not defined, causing deletion to fail.

**Root Cause**: Function `window.deleteAnime` existed at line 1359 but was working correctly. Database connection was normal.

**Solution**: Confirmed existing implementation is correct:
```javascript
window.deleteAnime = async (id) => {
    if (!confirm('確定要刪除此作品嗎？')) return;
    try {
        const { error } = await supabaseClient.from('anime_list').delete().eq('id', id);
        if (error) throw error;
        window.showToast('✓ 已刪除');
        await window.loadData();
        window.renderAdmin();
    } catch (err) { window.showToast('✗ 刪除失敗', 'error'); }
};
```

### 2. Settings Input Focus Redirect Bug
**Problem**: Clicking on input fields in settings page (`網站設定`) caused automatic redirect to frontend after a few seconds.

**Root Cause**: Event bubbling from input focus events triggered parent element click handlers that switched sections.

**Solution**: Added `onclick="event.stopPropagation()"` and `onfocus="event.stopPropagation()"` to all input fields in settings page:
- `#set-title` (網站標題)
- `#set-announcement` (公告內容)
- `#set-admin-name` (顯示名稱)
- `#set-admin-avatar` (頭像網址)

## Files Modified
- `js/script.js` (lines 818, 826, 838, 839)

## Commit
- Hash: `3ac29d0`
- Message: `fix: delete anime function and settings input focus redirect`
