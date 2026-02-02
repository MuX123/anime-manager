/**
 * 公告系統 v7.0.0
 * 包含：彈窗、公告牌分頁、留言板功能
 */

class AnnouncementSystem {
    constructor() {
        this.visitorId = this.getVisitorId();
        this.currentTab = 'announcements';
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
                this.loadShownPopups()
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
            
            const ip = await this.getClientIP();
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            
            const { data, error } = await client
                .from('guestbook_messages')
                .select('id')
                .eq('ip_address', ip)
                .gte('created_at', oneDayAgo)
                .in('status', ['pending', 'approved']);
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                const remainingHours = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - new Date(data[0].created_at).getTime())) / (60 * 60 * 1000));
                return { canPost: false, message: `您已在 ${remainingHours} 小時後可再次發言` };
            }
            
            return { canPost: true, ip };
        } catch (err) {
            return { canPost: true, ip: 'unknown' };
        }
    }

    async submitMessage() {
        const nickname = document.getElementById('guestbook-nickname')?.value.trim() || '匿名';
        const content = document.getElementById('guestbook-content')?.value.trim();
        
        if (!content) {
            window.showToast('請輸入留言內容', 'error');
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
            
            if (error) throw error;
            
            window.showToast('✓ 留言已提交，等待審核');
            await this.switchTab('guestbook');
        } catch (err) {
            console.error('提交留言失敗:', err);
            window.showToast('提交失敗，請稍後再試', 'error');
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
            if (error) throw error;
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
