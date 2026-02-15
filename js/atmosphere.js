/**
 * atmosphere.js
 * ACG 收藏庫 - 氛圍與遊標管理模組
 * 包含:
 * 1. CursorManager (遊標) - 保留
 * 2. PosterWall (海報牆) - 已移至 poster-wall.js
 */

/* ==========================================
   Cursor Manager
   ========================================== */
window.CursorManager = {
    BASE_PATH: './assets/cursors', // 使用相對路徑，避免 GitHub Pages 路徑問題
    themes: {
        anya: {
            name: '🦊 阿尼亞',
            folder: 'anya',
            files: { 'default': 'default.gif', 'pointer': 'pointer.gif' }
        },
        frieren: {
            name: '🧙‍♀️ 芙莉蓮',
            folder: 'frieren',
            files: { 'default': 'default.gif', 'pointer': 'pointer.gif' }
        },
        elysia: {
            name: '🦋 愛莉希雅',
            folder: 'elysia',
            files: { 'default': 'default.gif', 'pointer': 'pointer.gif' }
        }
    },

    getThemeList() {
        return Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name
        }));
    },

    // VisualEngine Module Interface
    init(isLowSpec) {
        console.log('[CursorManager] Init...');
        // Low spec might want to disable custom cursors? For now keep them.
        let savedTheme = localStorage.getItem('cursorTheme') || 'anya';
        let savedScale = localStorage.getItem('cursorScale') || '1';

        // Apply saved settings
        this.apply(savedTheme);
        this.setScale(savedScale);

        // UI Sync (Slider/Select)
        this.syncUI(savedTheme, savedScale);
    },

    start() { }, // No loop
    stop() { },  // No loop
    resize() { }, // No resize logic

    buildPath(theme, filename) {
        return `${this.BASE_PATH}/${theme.folder}/${filename}`;
    },

    apply(themeId) {
        if (!this.themes[themeId]) themeId = 'anya';
        localStorage.setItem('cursorTheme', themeId);

        const theme = this.themes[themeId];
        const root = document.documentElement;

        // 簡單設定：只設定 default 和 pointer，其他繼承
        // 注意：GIF 游標可能需要預載入，這邊簡化處理
        const defaultCursor = `url('${this.buildPath(theme, theme.files.default)}'), auto`;
        const pointerCursor = `url('${this.buildPath(theme, theme.files.pointer)}'), pointer`;

        root.style.setProperty('--cursor-default', defaultCursor);
        root.style.setProperty('--cursor-pointer', pointerCursor);

        console.log(`[CursorManager] Applied theme: ${themeId}`);
    },

    setScale(scale) {
        document.documentElement.style.setProperty('--cursor-scale', scale);
        localStorage.setItem('cursorScale', scale);
    },

    syncUI(theme, scale) {
        // Sync Select
        const select = document.getElementById('cursor-theme-select');
        if (select) select.value = theme;

        // Sync Range
        const range = document.getElementById('cursor-size-slider');
        const label = document.getElementById('cursor-size-value');
        if (range) range.value = scale;
        if (label) label.textContent = parseFloat(scale).toFixed(1) + 'x';
    }
};

// 註冊到引擎 - CursorManager
if (window.VisualEngine) {
    window.VisualEngine.register('CursorManager', window.CursorManager);
} else {
    window.addEventListener('load', () => {
        if (window.VisualEngine) {
            window.VisualEngine.register('CursorManager', window.CursorManager);
        }
    });
}
