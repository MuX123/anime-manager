/**
 * ui-helpers.js
 * ACG 收藏庫 - UI 工具函數模組
 * 負責：Toast 通知、空狀態渲染、系統選單
 */

console.log('🎨 載入 UI 工具模組...');

// ===== Toast 通知 =====
window.showToast = (msg, type = 'info') => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.setProperty('--toast-border', type === 'error' ? '#ff4444' : 'var(--neon-cyan)');
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2000);
};

// ===== 空狀態 UI =====
window.renderEmptyState = (message = '未找到相關資料', hint = '嘗試調整搜尋條件') => {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">🎭</div>
            <div class="empty-state-title">${message}</div>
            <div class="empty-state-message">${hint}</div>
        </div>
    `;
};

// ===== 注入遊標主題列表 =====
window.injectCursorThemes = () => {
    const container = document.getElementById('cursor-theme-container');
    if (!container) {
        console.warn('[UI] Cursor theme container not found in DOM');
        return;
    }

    if (!window.CursorManager || !window.CursorManager.getThemeList) {
        console.warn('[UI] CursorManager尚未就緒，500ms 後重試');
        setTimeout(window.injectCursorThemes, 500);
        return;
    }

    try {
        const html = window.renderCursorThemeSelect();
        if (!html) {
            console.warn('[UI] renderCursorThemeSelect returned empty content');
            return;
        }
        container.innerHTML = html;
    } catch (e) {
        console.error('[UI] 注入游標主題失敗:', e);
    }
};

// ===== 渲染遊標主題選單 =====
window.renderCursorThemeSelect = () => {
    if (!window.CursorManager?.getThemeList) return '';
    
    const themes = window.CursorManager.getThemeList();
    const currentTheme = localStorage.getItem('cursorTheme') || 'default';
    
    return themes.map(theme => `
        <button class="menu-btn ${theme.id === currentTheme ? 'active' : ''}" 
                onclick="window.CursorManager.apply('${theme.id}')">
            ${theme.name}
        </button>
    `).join('');
};

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('ui-helpers', {
        loaded: true,
        exports: { 
            showToast: window.showToast,
            renderEmptyState: window.renderEmptyState,
            injectCursorThemes: window.injectCursorThemes,
            renderCursorThemeSelect: window.renderCursorThemeSelect
        },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: ui-helpers');
}
