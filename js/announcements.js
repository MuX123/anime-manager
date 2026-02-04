/**
 * 公告系統 v7.0.0
 * 包含：彈窗、公告牌分頁、留言板功能
 */

class AnnouncementSystem {
    constructor() {
        this.visitorId = this.getVisitorId();
        this.currentTab = 'announcements';
        this.adminTab = 'ann';
        // 敏感詞彙過濾列表
        this.bannedWords = [
            '白癡', '白癡', '智障', '低能', '腦殘', '廢物', '混蛋', '王八蛋', '賤人', '賤貨',
            '婊子', '妓女', '雞', '幹你娘', '操你媽', 'fuck', 'shit', 'damn', 'bitch',
            'asshole', 'bastard', 'idiot', 'moron', 'retard', 'dumb', 'stupid',
            '支那', '中國豬', '台灣狗', '滾回中國', '中國肺炎', '武漢肺炎',
            '死全家', '去死', '殺死', '砍死', '打爆', '幹爆',
            '黑人', '黑鬼', '有色人種', '種族歧視',
            '納粹', '希特勒', '希特拉',
            '自殺', '自焚', '割腕',
            '垃圾', '廢物', '渣', '敗類', '人渣'
        ];
        this.init();
    }

    getVisitorId() {
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
            visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitor_id', visitorId);
        }
        return visitorId;
    }

    getClientIP() {
        return fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(d => d.ip)
            .catch(() => 'unknown');
    }

    checkContent(content) {
        const normalized = content.toLowerCase();
        const found = [];
        for (const word of this.bannedWords) {
            if (normalized.includes(word.toLowerCase())) {
                found.push(word);
            }
        }
        if (found.length > 0) {
            return { valid: false, message: `內容包含不當詞彙，請修改後再提交。` };
        }
        return { valid: true };
    }

    async init() {
        // 等待 Supabase 連接就緒
        let attempts = 0;
        while (!window.supabaseManager?.isConnectionReady() && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        try {
            const [announcements, updates, shownPopups] = await Promise.all([
                this.loadAnnouncements(),
                this.loadUpdates(),
                this.loadShownPopups(),
                this.loadBannedWords()
            ]);

            window.announcementData = { announcements, updates, shownPopups };
            
            if (window.logger) {
                window.logger.info('公告系統初始化完成', { 
                    announcements: announcements.length, 
                    updates: updates.length 
                });
            }
        } catch (err) {
            console.warn('公告系統載入失敗:', err);
        }
    }

    async loadAnnouncements() {
        if (!window.supabaseManager?.isConnectionReady()) return [];
        try {
            const client = window.supabaseManager.getClient();
            const { data, error } = await client
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.warn('載入公告失敗:', err);
            return [];
        }
    }

    async loadUpdates() {
        if (!window.supabaseManager?.isConnectionReady()) return [];
        try {
            const client = window.supabaseManager.getClient();
            const { data, error } = await client
                .from('updates')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.warn('載入更新內容失敗:', err);
            return [];
        }
    }

    async loadShownPopups() {
        if (!window.supabaseManager?.isConnectionReady()) return [];
        try {
            const client = window.supabaseManager.getClient();
            const { data, error } = await client
                .from('shown_popups')
                .select('*')
                .eq('visitor_id', this.visitorId);
            if (error) throw error;
            return data || [];
        } catch (err) {
            return [];
        }
    }

    async markPopupShown(popupType, popupId) {
        try {
            const client = window.supabaseManager?.getClient();
            if (!client) return;
            await client.from('shown_popups').insert({
                popup_type: popupType,
                popup_id: popupId,
                visitor_id: this.visitorId
            });
        } catch (err) {
            // 靜默失敗
        }
    }

    async showPopups() {
        const { announcements = [], updates = [], shownPopups = [] } = window.announcementData || {};
        
        const shownUpdateIds = shownPopups.filter(p => p.popup_type === 'update').map(p => p.popup_id);
        const shownAnnounceIds = shownPopups.filter(p => p.popup_type === 'announcement').map(p => p.popup_id);

        const latestUpdate = updates[0];
        const pinnedAnnouncement = announcements.find(a => a.is_pinned);

        let html = '';

        if (latestUpdate && !shownUpdateIds.includes(latestUpdate.id)) {
            html += this.renderUpdatePopup(latestUpdate);
            await this.markPopupShown('update', latestUpdate.id);
        }

        if (pinnedAnnouncement && !shownAnnounceIds.includes(pinnedAnnouncement.id)) {
            html += this.renderAnnouncementPopup(pinnedAnnouncement);
            await this.markPopupShown('announcement', pinnedAnnouncement.id);
        }

        if (html) {
            const overlay = document.createElement('div');
            overlay.id = 'popup-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999998;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;overflow-y:auto;';
            overlay.innerHTML = html;
            document.body.appendChild(overlay);
            
            overlay.querySelectorAll('.popup-close-btn').forEach(btn => {
                btn.addEventListener('click', () => overlay.remove());
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.remove();
            });
        }
    }

    renderUpdatePopup(update) {
        return `
            <div class="popup-modal" style="background:#0a0e1a;border:2px solid var(--neon-purple);border-radius:16px;max-width:600px;width:100%;margin:10px;position:relative;box-shadow:0 0 30px rgba(176,38,255,0.3);">
                <div style="background:linear-gradient(90deg,rgba(176,38,255,0.2),transparent);padding:15px 20px;border-bottom:1px solid rgba(176,38,255,0.3);display:flex;align-items:center;gap:10px;">
                    <span style="font-size:24px;">🚀</span>
                    <h3 style="margin:0;color:var(--neon-purple);font-family:'Orbitron',sans-serif;">更新通知 v${escapeHtml(update.version)}</h3>
                </div>
                <div style="padding:25px;color:#fff;line-height:1.8;max-height:60vh;overflow-y:auto;">
                    <h4 style="margin:0 0 15px;color:var(--neon-cyan);">${escapeHtml(update.title)}</h4>
                    <div style="white-space:pre-wrap;">${escapeHtml(update.content)}</div>
                </div>
                <div style="padding:15px 20px;border-top:1px solid rgba(176,38,255,0.3);text-align:right;">
                    <button class="popup-close-btn btn-primary" style="background:rgba(176,38,255,0.2);border-color:var(--neon-purple);color:var(--neon-purple);">我知道了</button>
                </div>
            </div>
        `;
    }

    renderAnnouncementPopup(announcement) {
        return `
            <div class="popup-modal" style="background:#0a0e1a;border:2px solid var(--neon-blue);border-radius:16px;max-width:600px;width:100%;margin:10px;position:relative;box-shadow:0 0 30px rgba(0,212,255,0.3);">
                <div style="background:linear-gradient(90deg,rgba(0,212,255,0.2),transparent);padding:15px 20px;border-bottom:1px solid rgba(0,212,255,0.3);display:flex;align-items:center;gap:10px;">
                    <span style="font-size:24px;">📢</span>
                    <h3 style="margin:0;color:var(--neon-cyan);font-family:'Orbitron',sans-serif;">${escapeHtml(announcement.title)}</h3>
                </div>
                <div style="padding:25px;color:#fff;line-height:1.8;max-height:60vh;overflow-y:auto;">
                    <div style="white-space:pre-wrap;">${escapeHtml(announcement.content)}</div>
                </div>
                <div style="padding:15px 20px;border-top:1px solid rgba(0,212,255,0.3);text-align:right;">
                    <button class="popup-close-btn btn-primary" style="background:rgba(0,212,255,0.2);border-color:var(--neon-cyan);color:var(--neon-cyan);">關閉</button>
                </div>
            </div>
        `;
    }

    renderAnnouncementBoard() {
        return `
            <div id="announcement-board" class="admin-panel-v492" style="margin-top:20px;min-height:400px;">
                <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;border-bottom:2px solid rgba(0,212,255,0.2);padding-bottom:15px;">
                    <button class="btn-primary ${this.currentTab === 'announcements' ? 'active' : ''}" onclick="window.announcementSystem.switchTab('announcements')">📢 公告</button>
                    <button class="btn-primary ${this.currentTab === 'guestbook' ? 'active' : ''}" onclick="window.announcementSystem.switchTab('guestbook')">💬 留言板</button>
                    <button class="btn-primary ${this.currentTab === 'updates' ? 'active' : ''}" onclick="window.announcementSystem.switchTab('updates')">📋 更新內容</button>
                </div>
                <div id="announcement-content">
                    <div style="text-align:center;padding:50px;color:var(--neon-cyan);">載入中...</div>
                </div>
            </div>
        `;
    }

    async switchTab(tab) {
        this.currentTab = tab;
        const content = document.getElementById('announcement-content');
        if (content) {
            content.innerHTML = '<div style="text-align:center;padding:50px;color:var(--neon-cyan);">載入中...</div>';
            content.innerHTML = await this.renderTabContent();
        }
    }

    async loadInitialContent() {
        const content = document.getElementById('announcement-content');
        if (content && content.innerHTML.includes('載入中')) {
            content.innerHTML = await this.renderTabContent();
        }
    }

    renderAnnouncementBoard() {
        return `
            <div id="announcement-board" class="admin-panel-v492" style="margin-top:20px;min-height:400px;">
                <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;border-bottom:2px solid rgba(0,212,255,0.2);padding-bottom:15px;">
                    <button class="btn-primary ${this.currentTab === 'announcements' ? 'active' : ''}" onclick="window.announcementSystem.switchTab('announcements')">📢 公告</button>
                    <button class="btn-primary ${this.currentTab === 'guestbook' ? 'active' : ''}" onclick="window.announcementSystem.switchTab('guestbook')">💬 留言板</button>
                    <button class="btn-primary ${this.currentTab === 'updates' ? 'active' : ''}" onclick="window.announcementSystem.switchTab('updates')">📋 更新內容</button>
                </div>
                <div id="announcement-content">
                    <div style="text-align:center;padding:50px;color:var(--neon-cyan);">載入中...</div>
                </div>
                ${isAdminLoggedIn ? '<div style="margin-top:20px;text-align:center;"><button class="btn-primary" onclick="window.announcementSystem.showAnnouncementAdminModal()">⚙️ 管理公告與更新</button></div>' : ''}
            </div>
        `;
    }

    showAnnouncementAdminModal() {
        const existing = document.getElementById('announcement-admin-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'announcement-admin-modal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 80vh; overflow-y: auto;">
                <h2 style="color: var(--neon-cyan); margin-bottom: 20px; text-align: center;">⚙️ 公告與更新管理</h2>
                <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                    <button class="btn-primary ${this.adminTab !== 'ann' ? '' : 'active'}" onclick="window.announcementSystem.switchAdminTab('ann')">📢 公告管理</button>
                    <button class="btn-primary ${this.adminTab !== 'upd' ? '' : 'active'}" onclick="window.announcementSystem.switchAdminTab('upd')">📋 更新管理</button>
                </div>
                <div id="announcement-admin-content">載入中...</div>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn-primary" style="border-color: #ff4444; color: #ff4444;" onclick="document.getElementById('announcement-admin-modal').remove()">關閉</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.switchAdminTab(this.adminTab || 'ann');
    }

    adminTab = 'ann';

    switchAdminTab(tab) {
        this.adminTab = tab;
        const content = document.getElementById('announcement-admin-content');
        if (content) content.innerHTML = '<div style="text-align:center;padding:30px;color:var(--neon-cyan);">載入中...</div>';
        this.renderAdminTabContent(tab);
    }

    async renderAdminTabContent(tab) {
        const content = document.getElementById('announcement-admin-content');
        if (!content) return;

        if (tab === 'ann') {
            content.innerHTML = await this.renderAnnouncementsAdminTab();
        } else if (tab === 'upd') {
            content.innerHTML = await this.renderUpdatesAdminTab();
        }
    }

    async renderAnnouncementsAdminTab() {
        const announcements = window.announcementData?.announcements || await this.loadAnnouncements();

        if (!announcements || announcements.length === 0) {
            return `
                <div style="text-align:center;padding:30px;color:var(--text-secondary);">暫無公告</div>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn-primary" onclick="window.announcementSystem.showAnnouncementForm()">+ 新增公告</button>
                </div>
            `;
        }

        return `
            <div style="display:flex;flex-direction:column;gap:15px;">
                <div style="text-align:right;margin-bottom:10px;">
                    <button class="btn-primary" onclick="window.announcementSystem.showAnnouncementForm()" style="background:rgba(0,212,255,0.2);border-color:var(--neon-cyan);color:var(--neon-cyan);">+ 新增公告</button>
                </div>
                ${announcements.map(a => `
                    <div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:20px;${a.is_pinned ? 'border-color:var(--neon-cyan);' : ''}">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                            <div style="display:flex;align-items:center;gap:10px;flex:1;">
                                ${a.is_pinned ? '<span style="background:var(--neon-cyan);color:#000;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">置頂</span>' : ''}
                                <h4 style="margin:0;color:var(--neon-cyan);font-size:16px;flex:1;">${escapeHtml(a.title)}</h4>
                            </div>
                            <div style="display:flex;gap:8px;">
                                <button class="btn-primary" onclick="window.announcementSystem.showAnnouncementForm(${a.id})" style="padding:6px 12px;font-size:12px;">編輯</button>
                                <button class="btn-primary" onclick="window.announcementSystem.deleteAnnouncement(${a.id})" style="padding:6px 12px;font-size:12px;border-color:#ff4444;color:#ff4444;background:rgba(255,68,68,0.1);">刪除</button>
                            </div>
                        </div>
                        <div style="color:var(--text-secondary);font-size:13px;line-height:1.6;white-space:pre-wrap;max-height:100px;overflow:hidden;">${escapeHtml(a.content)}</div>
                        <div style="margin-top:10px;font-size:11px;color:var(--text-secondary);">
                            ${a.author_name ? '作者：' + escapeHtml(a.author_name) + ' | ' : ''}建立時間：${new Date(a.created_at).toLocaleString('zh-TW')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderUpdatesAdminTab() {
        const updates = window.announcementData?.updates || await this.loadUpdates();

        if (!updates || updates.length === 0) {
            return `
                <div style="text-align:center;padding:30px;color:var(--text-secondary);">暫無更新內容</div>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn-primary" onclick="window.announcementSystem.showUpdateForm()">+ 新增更新</button>
                </div>
            `;
        }

        return `
            <div style="display:flex;flex-direction:column;gap:15px;">
                <div style="text-align:right;margin-bottom:10px;">
                    <button class="btn-primary" onclick="window.announcementSystem.showUpdateForm()" style="background:rgba(176,38,255,0.2);border-color:var(--neon-purple);color:var(--neon-purple);">+ 新增更新</button>
                </div>
                ${updates.map(u => `
                    <div style="background:rgba(176,38,255,0.05);border:1px solid rgba(176,38,255,0.2);border-radius:12px;padding:20px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                            <div style="display:flex;align-items:center;gap:10px;flex:1;">
                                <span style="background:var(--neon-purple);color:#000;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">v${escapeHtml(u.version)}</span>
                                <h4 style="margin:0;color:var(--neon-purple);font-size:16px;flex:1;">${escapeHtml(u.title)}</h4>
                            </div>
                            <div style="display:flex;gap:8px;">
                                <button class="btn-primary" onclick="window.announcementSystem.showUpdateForm(${u.id})" style="padding:6px 12px;font-size:12px;">編輯</button>
                                <button class="btn-primary" onclick="window.announcementSystem.deleteUpdate(${u.id})" style="padding:6px 12px;font-size:12px;border-color:#ff4444;color:#ff4444;background:rgba(255,68,68,0.1);">刪除</button>
                            </div>
                        </div>
                        <div style="color:var(--text-secondary);font-size:13px;line-height:1.6;white-space:pre-wrap;max-height:100px;overflow:hidden;">${escapeHtml(u.content)}</div>
                        <div style="margin-top:10px;font-size:11px;color:var(--text-secondary);">
                            建立時間：${new Date(u.created_at).toLocaleString('zh-TW')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async showAnnouncementForm(id = null) {
        const announcements = window.announcementData?.announcements || await this.loadAnnouncements();
        const announcement = id ? announcements.find(a => a.id === id) : null;

        const title = announcement ? '編輯公告' : '新增公告';
        const isPinned = announcement?.is_pinned ? 'checked' : '';
        const submitText = announcement ? '儲存變更' : '發布公告';

        const formHtml = `
            <div style="background:#0a0e1a;border:2px solid var(--neon-cyan);border-radius:16px;padding:25px;max-width:600px;margin:0 auto;">
                <h3 style="margin:0 0 20px;color:var(--neon-cyan);text-align:center;">${title}</h3>
                <div style="display:flex;flex-direction:column;gap:15px;">
                    <div>
                        <label style="display:block;margin-bottom:8px;color:var(--neon-cyan);">標題</label>
                        <input type="text" id="ann-form-title" value="${announcement ? escapeHtml(announcement.title) : ''}" style="width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:8px;padding:12px;color:#fff;" placeholder="輸入公告標題">
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:8px;color:var(--neon-cyan);">內容</label>
                        <textarea id="ann-form-content" rows="6" style="width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:8px;padding:12px;color:#fff;resize:vertical;" placeholder="輸入公告內容">${announcement ? escapeHtml(announcement.content) : ''}</textarea>
                    </div>
                    <div>
                        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                            <input type="checkbox" id="ann-form-pinned" ${isPinned} style="width:18px;height:18px;">
                            <span style="color:var(--neon-cyan);">置頂公告</span>
                        </label>
                    </div>
                    <div style="display:flex;gap:10px;justify-content:center;margin-top:10px;">
                        <button class="btn-primary" onclick="window.announcementSystem.saveAnnouncement(${id})" style="background:rgba(0,212,255,0.2);border-color:var(--neon-cyan);color:var(--neon-cyan);">${submitText}</button>
                        <button class="btn-primary" onclick="document.getElementById('ann-form-modal')?.remove()" style="border-color:#666;color:#999;">取消</button>
                    </div>
                </div>
            </div>
        `;

        const existingModal = document.getElementById('ann-form-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'ann-form-modal';
        modal.className = 'modal active';
        modal.innerHTML = formHtml;
        document.body.appendChild(modal);
    }

    async showUpdateForm(id = null) {
        const updates = window.announcementData?.updates || await this.loadUpdates();
        const update = id ? updates.find(u => u.id === id) : null;

        const title = update ? '編輯更新' : '新增更新';
        const submitText = update ? '儲存變更' : '發布更新';

        const formHtml = `
            <div style="background:#0a0e1a;border:2px solid var(--neon-purple);border-radius:16px;padding:25px;max-width:600px;margin:0 auto;">
                <h3 style="margin:0 0 20px;color:var(--neon-purple);text-align:center;">${title}</h3>
                <div style="display:flex;flex-direction:column;gap:15px;">
                    <div>
                        <label style="display:block;margin-bottom:8px;color:var(--neon-purple);">版本號</label>
                        <input type="text" id="upd-form-version" value="${update ? escapeHtml(update.version) : ''}" style="width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(176,38,255,0.3);border-radius:8px;padding:12px;color:#fff;" placeholder="例如：1.0.0">
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:8px;color:var(--neon-purple);">標題</label>
                        <input type="text" id="upd-form-title" value="${update ? escapeHtml(update.title) : ''}" style="width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(176,38,255,0.3);border-radius:8px;padding:12px;color:#fff;" placeholder="輸入更新標題">
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:8px;color:var(--neon-purple);">內容</label>
                        <textarea id="upd-form-content" rows="6" style="width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(176,38,255,0.3);border-radius:8px;padding:12px;color:#fff;resize:vertical;" placeholder="輸入更新內容">${update ? escapeHtml(update.content) : ''}</textarea>
                    </div>
                    <div style="display:flex;gap:10px;justify-content:center;margin-top:10px;">
                        <button class="btn-primary" onclick="window.announcementSystem.saveUpdate(${id})" style="background:rgba(176,38,255,0.2);border-color:var(--neon-purple);color:var(--neon-purple);">${submitText}</button>
                        <button class="btn-primary" onclick="document.getElementById('upd-form-modal')?.remove()" style="border-color:#666;color:#999;">取消</button>
                    </div>
                </div>
            </div>
        `;

        const existingModal = document.getElementById('upd-form-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'upd-form-modal';
        modal.className = 'modal active';
        modal.innerHTML = formHtml;
        document.body.appendChild(modal);
    }

    async saveAnnouncement(id = null) {
        const title = document.getElementById('ann-form-title')?.value.trim();
        const content = document.getElementById('ann-form-content')?.value.trim();
        const isPinned = document.getElementById('ann-form-pinned')?.checked;

        if (!title || !content) {
            window.showToast('請填寫標題和內容', 'error');
            return;
        }

        try {
            const client = window.supabaseManager?.getClient();
            if (!client) {
                window.showToast('系統維護中', 'error');
                return;
            }

            const authorName = '管理員';
            const now = new Date().toISOString();

            if (id) {
                // 更新
                const { error } = await client
                    .from('announcements')
                    .update({ title, content, is_pinned: isPinned, updated_at: now })
                    .eq('id', id);

                if (error) throw error;
                window.showToast('公告已更新');
            } else {
                // 新增
                const { error } = await client
                    .from('announcements')
                    .insert({ title, content, is_pinned: isPinned, author_name: authorName });

                if (error) throw error;
                window.showToast('公告已發布');
            }

            document.getElementById('ann-form-modal')?.remove();
            await this.refreshAnnouncementData();
            await this.renderAdminTabContent('ann');
        } catch (err) {
            console.error('儲存公告失敗:', err);
            if (err.code === '42501' || err.message?.includes('permission denied')) {
                window.showToast('演示模式：公告已儲存（未同步到資料庫）', 'success');
                document.getElementById('ann-form-modal')?.remove();
            } else {
                window.showToast('儲存失敗：' + (err.message || '未知錯誤'), 'error');
            }
        }
    }

    async saveUpdate(id = null) {
        const version = document.getElementById('upd-form-version')?.value.trim();
        const title = document.getElementById('upd-form-title')?.value.trim();
        const content = document.getElementById('upd-form-content')?.value.trim();

        if (!version || !title || !content) {
            window.showToast('請填寫所有欄位', 'error');
            return;
        }

        try {
            const client = window.supabaseManager?.getClient();
            if (!client) {
                window.showToast('系統維護中', 'error');
                return;
            }

            const now = new Date().toISOString();

            if (id) {
                // 更新
                const { error } = await client
                    .from('updates')
                    .update({ version, title, content, updated_at: now })
                    .eq('id', id);

                if (error) throw error;
                window.showToast('更新內容已更新');
            } else {
                // 新增
                const { error } = await client
                    .from('updates')
                    .insert({ version, title, content });

                if (error) throw error;
                window.showToast('更新內容已發布');
            }

            document.getElementById('upd-form-modal')?.remove();
            await this.refreshAnnouncementData();
            await this.renderAdminTabContent('upd');
        } catch (err) {
            console.error('儲存更新失敗:', err);
            if (err.code === '42501' || err.message?.includes('permission denied')) {
                window.showToast('演示模式：更新已儲存（未同步到資料庫）', 'success');
                document.getElementById('upd-form-modal')?.remove();
            } else {
                window.showToast('儲存失敗：' + (err.message || '未知錯誤'), 'error');
            }
        }
    }

    async deleteAnnouncement(id) {
        if (!confirm('確定要刪除此公告嗎？此操作無法復原。')) return;

        try {
            const client = window.supabaseManager?.getClient();
            if (!client) {
                window.showToast('系統維護中', 'error');
                return;
            }

            const { error } = await client.from('announcements').delete().eq('id', id);

            if (error) throw error;
            window.showToast('公告已刪除');
            await this.refreshAnnouncementData();
            await this.renderAdminTabContent('ann');
        } catch (err) {
            console.error('刪除公告失敗:', err);
            if (err.code === '42501' || err.message?.includes('permission denied')) {
                window.showToast('演示模式：公告已刪除（未同步到資料庫）', 'success');
                await this.refreshAnnouncementData();
                await this.renderAdminTabContent('ann');
            } else {
                window.showToast('刪除失敗：' + (err.message || '未知錯誤'), 'error');
            }
        }
    }

    async deleteUpdate(id) {
        if (!confirm('確定要刪除此更新內容嗎？此操作無法復原。')) return;

        try {
            const client = window.supabaseManager?.getClient();
            if (!client) {
                window.showToast('系統維護中', 'error');
                return;
            }

            const { error } = await client.from('updates').delete().eq('id', id);

            if (error) throw error;
            window.showToast('更新內容已刪除');
            await this.refreshAnnouncementData();
            await this.renderAdminTabContent('upd');
        } catch (err) {
            console.error('刪除更新失敗:', err);
            if (err.code === '42501' || err.message?.includes('permission denied')) {
                window.showToast('演示模式：更新已刪除（未同步到資料庫）', 'success');
                await this.refreshAnnouncementData();
                await this.renderAdminTabContent('upd');
            } else {
                window.showToast('刪除失敗：' + (err.message || '未知錯誤'), 'error');
            }
        }
    }

    async refreshAnnouncementData() {
        try {
            const [announcements, updates] = await Promise.all([
                this.loadAnnouncements(),
                this.loadUpdates()
            ]);
            window.announcementData = {
                ...window.announcementData,
                announcements,
                updates
            };
        } catch (err) {
            console.warn('刷新數據失敗:', err);
        }
    }

    async renderTabContent() {
        switch (this.currentTab) {
            case 'announcements': return this.renderAnnouncementsTab();
            case 'guestbook': return this.renderGuestbookTab();
            case 'updates': return this.renderUpdatesTab();
            default: return '';
        }
    }

    async renderAnnouncementsTab() {
        const announcements = window.announcementData?.announcements || await this.loadAnnouncements();
        return `
            <div style="display:flex;flex-direction:column;gap:15px;">
                ${announcements.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--text-secondary);">暫無公告</div>' : ''}
                ${announcements.map(a => `
                    <div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:20px;${a.is_pinned ? 'border-color:var(--neon-cyan);box-shadow:0 0 15px rgba(0,212,255,0.2);' : ''}">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                ${a.is_pinned ? '<span style="background:var(--neon-cyan);color:#000;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">置頂</span>' : ''}
                                <h4 style="margin:0;color:var(--neon-cyan);font-family:'Orbitron',sans-serif;font-size:16px;">${escapeHtml(a.title)}</h4>
                            </div>
                            <span style="color:var(--text-secondary);font-size:12px;">${new Date(a.created_at).toLocaleDateString('zh-TW')}</span>
                        </div>
                        <div style="color:var(--text-secondary);line-height:1.8;white-space:pre-wrap;">${escapeHtml(a.content)}</div>
                        ${a.author_name ? `<div style="margin-top:10px;font-size:12px;color:var(--neon-blue);">— ${escapeHtml(a.author_name)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderUpdatesTab() {
        const updates = window.announcementData?.updates || await this.loadUpdates();
        return `
            <div style="display:flex;flex-direction:column;gap:15px;">
                ${updates.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--text-secondary);">暫無更新內容</div>' : ''}
                ${updates.map(u => `
                    <div style="background:rgba(176,38,255,0.05);border:1px solid rgba(176,38,255,0.2);border-radius:12px;padding:20px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="background:var(--neon-purple);color:#000;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">v${escapeHtml(u.version)}</span>
                                <h4 style="margin:0;color:var(--neon-purple);font-family:'Orbitron',sans-serif;font-size:16px;">${escapeHtml(u.title)}</h4>
                            </div>
                            <span style="color:var(--text-secondary);font-size:12px;">${new Date(u.created_at).toLocaleDateString('zh-TW')}</span>
                        </div>
                        <div style="color:var(--text-secondary);line-height:1.8;white-space:pre-wrap;">${escapeHtml(u.content)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderGuestbookTab() {
        const messages = await this.loadApprovedMessages();
        const canPost = await this.canPostMessage();
        
        return `
            <div style="display:flex;flex-direction:column;gap:20px;">
                ${canPost.canPost ? this.renderGuestbookForm(canPost.ip) : `
                    <div style="background:rgba(255,200,0,0.1);border:1px solid rgba(255,200,0,0.3);border-radius:8px;padding:15px;color:rgba(255,200,0,0.8);font-size:13px;">
                        ⚠️ ${canPost.message}
                    </div>
                `}
                <div style="display:flex;flex-direction:column;gap:12px;">
                    ${messages.length === 0 ? '<div style="text-align:center;padding:30px;color:var(--text-secondary);">還沒有留言</div>' : ''}
                    ${messages.map(m => `
                        <div style="background:rgba(0,212,255,0.03);border-radius:8px;padding:15px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <span style="color:var(--neon-cyan);font-weight:bold;">${escapeHtml(m.nickname)}</span>
                                <span style="color:var(--text-secondary);font-size:12px;">${new Date(m.created_at).toLocaleDateString('zh-TW')}</span>
                            </div>
                            <div style="color:var(--text-secondary);line-height:1.6;">${escapeHtml(m.content)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderGuestbookForm(ip) {
        return `
            <div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:20px;">
                <h4 style="margin:0 0 15px;color:var(--neon-cyan);">發表留言</h4>
                <div style="display:flex;flex-direction:column;gap:12px;">
                    <input type="text" id="guestbook-nickname" placeholder="暱稱" maxlength=20 style="background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:8px;padding:12px;color:#fff;">
                    <textarea id="guestbook-content" placeholder="輸入留言內容...（將進入審核）" maxlength=500 rows=4 style="background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:8px;padding:12px;color:#fff;resize:vertical;"></textarea>
                    <button onclick="window.announcementSystem.submitMessage()" class="btn-primary" style="background:rgba(0,212,255,0.2);border-color:var(--neon-cyan);color:var(--neon-cyan);">提交審核</button>
                </div>
                <div style="margin-top:10px;font-size:11px;color:var(--text-secondary);">
                    提示：留言需要管理員審核後才會顯示
                </div>
            </div>
        `;
    }

    async canPostMessage() {
        try {
            const client = window.supabaseManager?.getClient();
            if (!client) return { canPost: true, ip: 'unknown' };
            
            let ip;
            try {
                ip = await this.getClientIP();
            } catch (e) {
                ip = localStorage.getItem('guestbook_ip') || 'unknown';
            }
            
            if (ip === 'unknown') {
                return { canPost: false, message: '無法驗證您的身份，請稍後再試' };
            }
            
            localStorage.setItem('guestbook_ip', ip);
            
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            
            try {
                const { data, error } = await client
                    .from('guestbook_messages')
                    .select('id, created_at')
                    .eq('ip_address', ip)
                    .gte('created_at', oneDayAgo)
                    .in('status', ['pending', 'approved'])
                    .order('created_at', { ascending: false })
                    .limit(1);
                
                if (error) {
                    if (error.code === '403' || error.code === '42501' || error.message.includes('403') || error.message.includes('permission denied')) {
                        return { canPost: true, ip };
                    }
                    throw error;
                }
                
                if (data && data.length > 0) {
                    const lastMessageTime = new Date(data[0].created_at).getTime();
                    const elapsed = Date.now() - lastMessageTime;
                    const remainingMs = 24 * 60 * 60 * 1000 - elapsed;
                    const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
                    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
                    
                    if (remainingHours <= 0) {
                        return { canPost: true, ip };
                    }
                    
                    const timeMsg = remainingHours >= 1 
                        ? `請等待 ${remainingHours} 小時後再發言`
                        : `請等待 ${remainingMinutes} 分鐘後再發言`;
                    return { canPost: false, message: timeMsg };
                }
                
                return { canPost: true, ip };
            } catch (queryError) {
                if (queryError.code === '403' || queryError.code === '42501' || queryError.message?.includes('403') || queryError.message?.includes('permission denied')) {
                    return { canPost: true, ip };
                }
                throw queryError;
            }
        } catch (err) {
            console.error('檢查發言限制失敗:', err);
            return { canPost: true, ip: localStorage.getItem('guestbook_ip') || 'unknown' };
        }
    }

    async loadBannedWords() {
        try {
            const client = window.supabaseManager?.getClient();
            if (!client) return;
            
            const result = await window.supabaseManager?.safeQuery(
                () => client.from('site_settings').select('value').eq('id', 'banned_words'),
                { fallbackOn403: null }
            );
            
            const data = result?.data;
            if (data && data.length > 0 && data[0].value) {
                const words = JSON.parse(data[0].value);
                if (Array.isArray(words) && words.length > 0) {
                    this.bannedWords = words;
                }
            }
        } catch (err) {
            console.log('載入敏感詞彙設定失敗，使用預設列表');
        }
    }

    async submitMessage() {
        const nickname = document.getElementById('guestbook-nickname')?.value.trim() || '匿名';
        const content = document.getElementById('guestbook-content')?.value.trim();
        
        if (!content) {
            window.showToast('請輸入留言內容', 'error');
            return;
        }
        
        // 伺服器端檢查 24 小時限制
        const canPostCheck = await this.canPostMessage();
        if (!canPostCheck.canPost) {
            window.showToast(canPostCheck.message, 'error');
            return;
        }
        
        // 檢查內容是否包含不當詞彙
        const contentCheck = this.checkContent(content);
        if (!contentCheck.valid) {
            window.showToast(contentCheck.message, 'error');
            return;
        }
        
        // 檢查暱稱是否包含不當詞彙
        const nicknameCheck = this.checkContent(nickname);
        if (!nicknameCheck.valid) {
            window.showToast('暱稱包含不當詞彙，請修改後再提交。', 'error');
            return;
        }
        
        try {
            const client = window.supabaseManager?.getClient();
            if (!client) {
                window.showToast('系統維護中，請稍後再試', 'error');
                return;
            }
            
            const ip = await this.getClientIP();
            
            const { error } = await client.from('guestbook_messages').insert({
                nickname,
                content,
                ip_address: ip,
                user_agent: navigator.userAgent,
                status: 'pending'
            });
            
            if (error) {
                if (error.code === '42501' || error.message?.includes('permission denied')) {
                    window.showToast('✓ 留言已提交（演示模式）', 'success');
                    await this.switchTab('guestbook');
                    return;
                }
                throw error;
            }
            
            window.showToast('✓ 留言已提交，等待審核');
            await this.switchTab('guestbook');
        } catch (err) {
            console.error('提交留言失敗:', err);
            if (err.code === '42501' || err.message?.includes('permission denied')) {
                window.showToast('✓ 留言已提交（演示模式）', 'success');
                await this.switchTab('guestbook');
            } else {
                window.showToast('提交失敗，請稍後再試', 'error');
            }
        }
    }

    async loadApprovedMessages() {
        try {
            const client = window.supabaseManager?.getClient();
            if (!client) return [];
            const { data, error } = await client
                .from('guestbook_messages')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (error) {
                if (error.code === '42501' || error.message?.includes('permission denied')) {
                    return [];
                }
                throw error;
            }
            return data || [];
        } catch (err) {
            return [];
        }
    }
}

// 初始化公告系統
window.announcementSystem = new AnnouncementSystem();

// 頁面載入後顯示彈窗
window.showAnnouncementPopups = async () => {
    await window.announcementSystem.init();
    setTimeout(() => window.announcementSystem.showPopups(), 1000);
};

// 渲染公告牌
window.renderAnnouncements = () => {
    return window.announcementSystem.renderAnnouncementBoard();
};

// 切換公告牌分頁
window.switchAnnouncementTab = (tab) => {
    window.announcementSystem.switchTab(tab);
};
