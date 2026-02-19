/**
 * data-manager.js
 * ACG 收藏庫 - 資料狀態與數據邏輯 (Data Layer)
 */

const DEMO_ANIME_DATA = [
    {
        id: 1,
        name: '刀劍神域',
        original_name: 'Sword Art Online',
        genre: '科幻',
        year: '2024',
        season: '冬',
        episodes: '24集',
        rating: '優',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1173/142080l.jpg',
        description: '2022年，VRMMO遊戲「SAO」正式營運，玩家們被困在遊戲中無法登出，只有打倒BOSS才能離開...',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        name: '鬼滅之刃',
        original_name: 'Demon Slayer',
        genre: '熱血',
        year: '2023',
        season: '春',
        episodes: '26集',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1178/142083l.jpg',
        description: '大正時期，名為「鬼」的怪物存在於世。主角炭治郎的家人被鬼殺害，他踏上了成為鬼殺隊的旅程...',
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        name: '間諜家家酒',
        original_name: 'Spy x Family',
        genre: '喜劇',
        year: '2024',
        season: '春',
        episodes: '12集',
        rating: '優',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/3408/142078l.jpg',
        description: '間諜「黃昏」為了完成任務，需要組建一個臨時家庭。他收養了具有讀心能力的女兒，展開了意想不到的生活...',
        created_at: new Date().toISOString()
    },
    {
        id: 4,
        name: '進擊的巨人',
        original_name: 'Attack on Titan',
        genre: '熱血',
        year: '2023',
        season: '秋',
        episodes: '24集',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1174/142081l.jpg',
        description: '在巨人威脅下的人類最後的城堡，面對巨人捕食的恐懼，主角艾倫決定加入訓練兵團，展開復仇之旅...',
        created_at: new Date().toISOString()
    },
    {
        id: 5,
        name: '我的英雄學院',
        original_name: 'My Hero Academia',
        genre: '熱血',
        year: '2024',
        season: '夏',
        episodes: '24集',
        rating: '優',
        recommendation: '★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1205/142085l.jpg',
        description: '在80%的人類都擁有名為「個性」的超能力的時代，沒有力量的少年綠谷出久如何成為英雄？',
        created_at: new Date().toISOString()
    },
    {
        id: 6,
        name: '咒術迴戰',
        original_name: 'Jujutsu Kaisen',
        genre: '熱血',
        year: '2024',
        season: '冬',
        episodes: '24集',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1173/142079l.jpg',
        description: '高中生虎杖悠仁在吞下詛咒的手指後，成為了詛咒的容器，必須進入咒術高等學校學習...',
        created_at: new Date().toISOString()
    },
    {
        id: 7,
        name: '紫羅蘭永恆花園',
        original_name: 'Violet Evergarden',
        genre: '戀愛',
        year: '2023',
        season: '春',
        episodes: '14集',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1795/142084l.jpg',
        description: '自動手記人偶「薇爾莉特·伊芙加登」在戰後尋找「愛」的意義，替人們代筆書信...',
        created_at: new Date().toISOString()
    },
    {
        id: 8,
        name: '你的名字',
        original_name: 'Your Name',
        genre: '戀愛',
        year: '2022',
        season: '秋',
        episodes: '劇場版',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/1315/142086l.jpg',
        description: '住在東京的少年與住在鄉下的少女，在夢中交換了身體。跨越時空的奇蹟就此展開...',
        created_at: new Date().toISOString()
    },
    {
        id: 9,
        name: 'Re:從零開始的異世界生活',
        original_name: 'Re:Zero',
        genre: '異世界',
        year: '2024',
        season: '夏',
        episodes: '24集',
        rating: '優',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/152/142088l.jpg',
        description: '被召喚到異世界的少年菜月昴，擁有「死亡回歸」的能力，只有拯救他人才能打破詛咒...',
        created_at: new Date().toISOString()
    },
    {
        id: 10,
        name: '海賊王',
        original_name: 'One Piece',
        genre: '冒險',
        year: '2024',
        season: '夏',
        episodes: '24集',
        rating: '神',
        recommendation: '★★★★★',
        image_url: 'https://cdn.myanimelist.net/images/anime/456/142090l.jpg',
        description: '戴上草帽的少年魯夫踏上尋找「大海賊王」寶藏的冒險旅程，組建了草帽海賊團...',
        created_at: new Date().toISOString()
    }
];

class DataManager {
    constructor() {
        this.animeData = [];
        this.optionsData = {
            genre: ['冒險', '奇幻', '熱血', '校園', '戀愛', '喜劇', '科幻', '懸疑', '日常', '異世界'],
            year: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
            month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            season: ['冬', '春', '夏', '秋'],
            episodes: ['12集', '24集', '劇場版', 'OVA'],
            rating: ['SS', '神', '優', '普', '劣'],
            recommendation: ['★★★★★', '★★★★', '★★★', '★★', '★'],
            category_colors: { btn_bg: '#00d4ff', name: '#ffffff', desc: '#ffffff' },
            custom_lists: []
        };

        this.currentCategory = 'anime'; // Default to anime, not notice
        this.filters = { search: '', genre: '', year: '', rating: '', season: '', month: '', episodes: '' };
        this.sortOrder = localStorage.getItem('sortOrder') || 'desc';
        this.gridColumns = (() => {
            const stored = localStorage.getItem('gridColumns');
            if (stored === 'mobile') return 'mobile';
            if (['3', '4', '5'].includes(stored)) return parseInt(stored);
            return window.innerWidth <= 768 ? 'mobile' : 4;
        })();

        // Sync to window
        window.animeData = this.animeData;
        window.optionsData = this.optionsData;
        window.filters = this.filters;
        window.currentCategory = this.currentCategory;
        window.sortOrder = this.sortOrder;
        window.gridColumns = this.gridColumns;
    }

    // --- State Setters ---

    setAnimeData(data) {
        this.animeData = data;
        window.animeData = data;
        this.initFuse(data);
    }

    setOptionsData(data) {
        this.optionsData = { ...this.optionsData, ...data };
        window.optionsData = this.optionsData;
    }

    setCategory(cat) {
        this.currentCategory = cat;
        window.currentCategory = cat;
    }

    initFuse(data) {
        if (!window.Fuse) return;
        const options = {
            keys: ['name', 'desc', 'genre', 'year'],
            threshold: 0.4,
            ignoreLocation: true
        };
        this.fuse = new Fuse(data, options);
    }

    // --- Get Filtered Data ---
    getFilteredData() {
        let data = this.animeData || [];

        // 1. Apply search filter (Fuse.js or Basic)
        if (this.filters.search) {
            if (this.fuse) {
                const results = this.fuse.search(this.filters.search);
                data = results.map(r => r.item);
            } else {
                // Fallback
                const search = this.filters.search.toLowerCase();
                data = data.filter(item =>
                    (item.name || '').toLowerCase().includes(search) ||
                    (item.desc || '').toLowerCase().includes(search)
                );
            }
        }

        // 2. Filter by category
        const cat = this.currentCategory || window.currentCategory || 'anime';
        if (cat !== 'notice') {
            data = data.filter(item => (item.category || 'anime') === cat);
        }

        // 3. Apply other filters
        if (this.filters.genre) {
            data = data.filter(item => (item.genre || '').includes(this.filters.genre));
        }
        if (this.filters.year) {
            data = data.filter(item => (item.year || '').includes(this.filters.year));
        }
        if (this.filters.rating) {
            data = data.filter(item => (item.rating || '') === this.filters.rating);
        }

        // 4. Sort
        const order = this.sortOrder || 'desc';
        data = [...data].sort((a, b) => {
            if (order === 'name') return a.name.localeCompare(b.name, 'zh-TW');
            // Assuming created_at is the default sort key for time
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            if (order === 'desc') return dateB - dateA;
            if (order === 'asc') return dateA - dateB;
            return 0;
        });

        return data;
    }

    updateFilter(key, val) {
        this.filters[key] = val;
        window.filters = this.filters;
    }

    updateSort(order) {
        this.sortOrder = order;
        window.sortOrder = order;
        localStorage.setItem('sortOrder', order);
    }

    updateLayout(cols) {
        this.gridColumns = cols;
        window.gridColumns = cols;
        localStorage.setItem('gridColumns', cols);
    }

    async loadData(forceRefresh = false) {
        if (this.animeData.length > 0 && !forceRefresh) return this.animeData;

        console.log('📡 正在從 Supabase 抓取資料...');
        const client = window.supabaseManager?.getClient();

        if (!client || !window.supabaseManager?.isConnectionReady()) {
            console.warn('Supabase 未就緒，使用演示數據');
            this.setAnimeData([...DEMO_ANIME_DATA]);
            window.dataLoadError = '資料庫未連接，使用演示數據';
            return this.animeData;
        }

        try {
            const { data, error } = await client.from('anime_list').select('*').order('created_at', { ascending: false });
            if (!error) {
                this.setAnimeData(data || []);
                if (this.animeData.length === 0) {
                    window.dataLoadError = '當前無作品資料，請透過後台新增';
                } else {
                    window.dataLoadError = null;
                }
                if (window.AtmosphereAPI?.refresh) window.AtmosphereAPI.refresh();
                console.log('✅ 資料抓取成功，共', this.animeData.length, '筆');
                return this.animeData;
            }
        } catch (e) {
            console.warn('Data load error:', e);
        }

        // Fallback to demo data
        console.warn('使用演示數據');
        this.setAnimeData([...DEMO_ANIME_DATA]);
        window.dataLoadError = '無法載入資料，已切換至離線演示模式';
        return this.animeData;
    }

    // --- Data Getters ---

    getFilteredData() {
        const filtered = this.animeData.filter(item => {
            if (item.category !== this.currentCategory) return false;
            if (this.filters.search && !item.name.toLowerCase().includes(this.filters.search.toLowerCase())) return false;
            for (const key in this.filters) {
                if (key === 'search' || !this.filters[key]) continue;
                if (key === 'genre') {
                    if (!item.genre || !item.genre.includes(this.filters.genre)) return false;
                } else if (key.startsWith('custom_')) {
                    if (!item.extra_data || item.extra_data[key] !== this.filters[key]) return false;
                } else {
                    if (item[key] !== this.filters[key]) return false;
                }
            }
            return true;
        });

        return filtered.sort((a, b) => {
            if (this.sortOrder === 'name') return a.name.localeCompare(b.name, 'zh-TW');
            const yearA = parseInt(a.year) || 0;
            const yearB = parseInt(b.year) || 0;
            if (yearB !== yearA) return this.sortOrder === 'desc' ? yearB - yearA : yearA - yearB;
            return this.sortOrder === 'desc' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at);
        });
    }

    // --- Render Search Filter HTML ---
    renderSearchSelectsHTML() {
        const optionsData = this.optionsData || {};
        const filters = this.filters || {};
        
        const createSelect = (id, label, options, currentVal, onChange) => {
            if (!options || options.length === 0) return '';
            return `<select id="${id}" onchange="${onChange}" style="min-width: 100px; background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.25); padding: 8px; font-size: 13px; cursor: pointer; color: #fff; border-radius: 6px; font-family: 'Noto Sans TC', sans-serif;">
                <option value="" style="background: #0a0f19;">${label}</option>
                ${options.map(o => `<option value="${o}" ${o === currentVal ? 'selected' : ''} style="background: #0a0f19;">${o}</option>`).join('')}
            </select>`;
        };
        
        return `${createSelect('filter-genre', '類型', optionsData.genre, filters.genre, "window.dataManager?.applyFilter('genre', this.value)")}
               ${createSelect('filter-year', '年份', optionsData.year, filters.year, "window.dataManager?.applyFilter('year', this.value)")}
               ${createSelect('filter-season', '季度', optionsData.season, filters.season, "window.dataManager?.applyFilter('season', this.value)")}
               ${createSelect('filter-month', '月份', optionsData.month, filters.month, "window.dataManager?.applyFilter('month', this.value)")}
               ${createSelect('filter-rating', '評分', optionsData.rating, filters.rating, "window.dataManager?.applyFilter('rating', this.value)")}`;
    }
    
    // --- Apply Filter ---
    applyFilter(key, value) {
        this.updateFilter(key, value);
        window.renderApp?.();
    }

    getOptionLabel(key) {
        return window.siteSettings?.custom_labels?.[key] || {
            genre: '類型', year: '年份', month: '月份', season: '季度', episodes: '集數', rating: '評分', recommendation: '推薦'
        }[key] || key;
    }

    // --- CRUD Operations (Coupled to DOM as per legacy design) ---

    async saveAnime() {
        try {
            const nameEl = document.getElementById('form-name');
            if (!nameEl || !nameEl.value) return window.showToast('✗ 請輸入名稱', 'error');

            const extra_data = {};
            document.querySelectorAll('.form-custom-list').forEach(select => {
                const key = select.getAttribute('data-key');
                if (select.value) extra_data[key] = select.value;
            });

            const btnColor = document.getElementById('set-btn-color')?.value;
            if (btnColor) extra_data.btn_bg = btnColor;

            // Handle gallery (劇照) field - split by newline and filter empty
            const galleryInput = document.getElementById('form-gallery')?.value;
            if (galleryInput) {
                const galleryUrls = galleryInput.split('\n').map(url => url.trim()).filter(url => url);
                if (galleryUrls.length > 0) {
                    extra_data.gallery = galleryUrls;
                }
            }

            const selectedGenres = Array.from(document.querySelectorAll('input[name="form-genre"]:checked')).map(cb => cb.value);

            const payload = {
                name: nameEl.value,
                genre: selectedGenres,
                poster_url: document.getElementById('form-poster')?.value || '',
                youtube_url: document.getElementById('form-youtube')?.value || '',
                category: document.getElementById('form-category')?.value || 'anime',
                links: Array.from(document.querySelectorAll('#links-list .link-name')).map(nameInput => {
                    const urlInput = nameInput.parentElement.querySelector('.link-url');
                    return (nameInput.value.trim() && urlInput?.value.trim()) ? { name: nameInput.value.trim(), url: urlInput.value.trim() } : null;
                }).filter(l => l),
                description: document.getElementById('form-desc')?.value || '',
                year: document.getElementById('form-year')?.value || '',
                month: document.getElementById('form-month')?.value || '',
                season: document.getElementById('form-season')?.value || '',
                rating: document.getElementById('form-rating')?.value || '',
                recommendation: document.getElementById('form-recommendation')?.value || '',
                episodes: document.getElementById('form-episodes')?.value || '',
                star_color: document.getElementById('form-star-color')?.value || '#ffcc00',
                name_color: document.getElementById('form-name-color')?.value || '#ffffff',
                desc_color: document.getElementById('form-desc-color')?.value || '#ffffff',
                extra_data: Object.keys(extra_data).length > 0 ? extra_data : null
            };

            const client = window.supabaseManager?.getClient();
            if (!client) throw new Error('Supabase 未連接');

            let { error } = window.uiController.editId ?
                await client.from('anime_list').update(payload).eq('id', window.uiController.editId) :
                await client.from('anime_list').insert([payload]);

            if (error) throw error;

            window.showToast('✓ 儲存成功');
            await this.loadData(true); // Force Refresh
            window.switchAdminTab('manage');
        } catch (err) {
            window.showToast('✗ 儲存失敗：' + err.message, 'error');
        }
    }

    async deleteAnime(id) {
        if (!confirm('確定要刪除此作品嗎？')) return;
        try {
            const client = window.supabaseManager?.getClient();
            if (!client) throw new Error('Supabase 未連接');
            const { error } = await client.from('anime_list').delete().eq('id', id);
            if (error) throw error;
            window.showToast('✓ 已刪除');
            await this.loadData(true);
            window.renderAdmin();
        } catch (err) { window.showToast('✗ 刪除失敗', 'error'); }
    }

    async bulkDeleteAnime() {
        const checkboxes = document.querySelectorAll('.item-checkbox:checked');
        const ids = Array.from(checkboxes).map(cb => cb.dataset.id);
        if (ids.length === 0) return;
        if (!confirm(`確定要刪除選中的 ${ids.length} 個作品嗎？`)) return;

        try {
            const client = window.supabaseManager?.getClient();
            if (!client) throw new Error('Supabase 未連接');
            const { error } = await client.from('anime_list').delete().in('id', ids);
            if (error) throw error;
            window.showToast('✓ 已刪除');
            await this.loadData(true);
            window.renderAdmin();
        } catch (err) { window.showToast('✗ 刪除失敗', 'error'); }
    }

    // --- Options Management ---

    async saveOptionsToDB(skipRender = false) {
        const client = window.supabaseManager?.getClient();
        if (!client) return;
        try {
            await client.from('site_settings').upsert({ id: 'options_data', value: JSON.stringify(this.optionsData) });
            window.showToast('✓ 設定已同步');
        } catch (err) { console.error(err); }
        if (!skipRender && window.renderApp) window.renderApp();
    }

    async updateOption(key, idx, val, oldVal) {
        if (!val || val === oldVal) return;

        // 1. Update List
        this.optionsData[key][idx] = val;

        // 2. Update DB options
        await this.saveOptionsToDB(true);

        // 3. Update related anime items (Simple logic: update all matching)
        // Note: Ideally this should be a backend function or more robust
        const client = window.supabaseManager?.getClient();
        if (client) {
            // Fetch all items with this option
            const { data } = await client.from('anime_list').select('id, extra_data, ' + (key === 'genre' ? 'genre' : key));
            // Logic simplified for this step - would require detailed robust implementation
            // For now, just save options. Updating content references is complex.
            window.showToast('⚠️ 選項名稱已更改，請手動更新關聯作品');
        }
        window.renderAdmin();
    }

    async addNewCustomList() {
        const input = document.getElementById('new-list-name');
        const name = input?.value.trim();
        if (!name) return window.showToast('✗ 請輸入列表名稱', 'error');

        const key = 'custom_' + Date.now();
        if (!this.optionsData.custom_lists) this.optionsData.custom_lists = [];
        this.optionsData.custom_lists.push(key);
        this.optionsData[key] = [];

        if (!window.siteSettings.custom_labels) window.siteSettings.custom_labels = {};
        window.siteSettings.custom_labels[key] = name;

        if (input) input.value = '';
        await this.saveOptionsToDB();

        // Save labels
        const client = window.supabaseManager?.getClient();
        if (client) await client.from('site_settings').upsert({ id: 'custom_labels', value: JSON.stringify(window.siteSettings.custom_labels) });

        window.renderAdmin();
    }

    async deleteCustomList(key) {
        if (!confirm('確定要刪除此列表嗎？')) return;
        this.optionsData.custom_lists = this.optionsData.custom_lists.filter(k => k !== key);
        delete this.optionsData[key];
        await this.saveOptionsToDB();
        window.renderAdmin();
    }

    // --- Guestbook ---

    async loadGuestbookMessagesForAdmin() {
        const client = window.supabaseManager?.getClient();
        if (!client) return [];
        const { data } = await client.from('guestbook').select('*').order('created_at', { ascending: false });
        return data || [];
    }

    async moderateGuestbook(id, status) {
        const client = window.supabaseManager?.getClient();
        if (!client) return;
        await client.from('guestbook').update({ status }).eq('id', id);
        window.showToast('✓Status Updated');
        window.renderAdmin(); // Refresh
    }

    // --- Jikan API ---

    async searchJikan(query) {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10&sfw=true`);
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    }

    async translateToEnglish(text) {
        if (!/[\u4e00-\u9fff]/.test(text)) return null;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-TW&tl=en&dt=t&q=${encodeURIComponent(text)}`);
            const json = await res.json();
            return json?.[0]?.map(s => s[0]).join('') || null;
        } catch { return null; }
    }
}

// Singleton
window.dataManager = new DataManager();

// Global Map
window.loadData = (f) => window.dataManager.loadData(f);
window.saveAnime = () => window.dataManager.saveAnime();
window.deleteAnime = (id) => window.dataManager.deleteAnime(id);
window.bulkDeleteAnime = () => window.dataManager.bulkDeleteAnime();
window.saveOptionsToDB = (s) => window.dataManager.saveOptionsToDB(s);
window.addNewCustomList = () => window.dataManager.addNewCustomList();
window.deleteCustomList = (k) => window.dataManager.deleteCustomList(k);
window.renderSearchSelectsHTML = () => window.dataManager.renderSearchSelectsHTML();
window.deleteOptionItem = async (k, i) => {
    if (!confirm('Delete?')) return;
    window.dataManager.optionsData[k].splice(i, 1);
    await window.dataManager.saveOptionsToDB();
    window.renderAdmin();
};
window.addOptionItem = async (k) => {
    const el = document.getElementById(`add-opt-${k}`);
    if (el && el.value) {
        if (!window.dataManager.optionsData[k]) window.dataManager.optionsData[k] = [];
        window.dataManager.optionsData[k].push(el.value);
        el.value = '';
        await window.dataManager.saveOptionsToDB();
        window.renderAdmin();
    }
};
window.moderateGuestbook = (id, s) => window.dataManager.moderateGuestbook(id, s);
window.loadGuestbookMessagesForAdmin = () => window.dataManager.loadGuestbookMessagesForAdmin();

// Jikan Global Logic bridge
window.executeJikanSearch = async () => {
    const input = document.getElementById('jikan-search-input');
    const resDiv = document.getElementById('jikan-results');
    if (!input || !resDiv) return;
    const q = input.value.trim();
    if (!q) return;

    resDiv.innerHTML = 'Searching...';
    let data = [];
    const trans = await window.dataManager.translateToEnglish(q);
    if (trans) {
        const [d1, d2] = await Promise.all([window.dataManager.searchJikan(trans), window.dataManager.searchJikan(q)]);
        // Merge uniq
        const map = new Map();
        [...d1, ...d2].forEach(i => map.set(i.mal_id, i));
        data = Array.from(map.values());
    } else {
        data = await window.dataManager.searchJikan(q);
    }

    // Render results (UI logic in global function? Or mapped to UIController?)
    // This part matches script.js executeJikanSearch rendering logic essentially
    window._jikanSearchResults = data;
    if (data.length === 0) resDiv.innerHTML = 'No Results';
    else {
        resDiv.innerHTML = data.map((item, i) => `
            <div onclick="window.applyJikanData(${i})" style="display:flex;gap:10px;padding:10px;border:1px solid #333;margin-bottom:5px;cursor:pointer;">
                <img src="${item.images?.jpg?.small_image_url}" style="width:40px;">
                <div>${window.escapeHtml(item.title)} <br> <small>${item.year || ''}</small></div>
            </div>
        `).join('');
    }
};
// ApplyJikanData logic should be here or in UIController? 
// It requires DOM access to form. I put it in UIController mostly?
// Actually I put `applyJikanData` call in UIController's `renderJikanResults`, but I didn't verify `applyJikanData` implementation in `ui-controller.js`.
// I need to ensure `applyJikanData` is defined. I missed implementing it in `ui-controller.js` explicitly? 
// I checked `ui-controller.js` I wrote: `window.applyJikanData` is NOT defined in map. `window.executeJikanSearch` is NOT defined in map.
// I defined `renderJikanResults` in `UIController` but didn't hook it up.
// I will add `applyJikanData` implementation to `data-manager.js` (DOM-heavy) or `ui-controller.js`.
// Since I am editing `data-manager.js` now, I will add `window.applyJikanData` here to complete the Jikan feature.
// It will basically populate the form.

window.applyJikanData = (index) => {
    const item = window._jikanSearchResults?.[index];
    if (!item) return;
    document.getElementById('jikan-search-modal')?.remove();
    // Fill Form
    const setVal = (id, v) => { const el = document.getElementById(id); if (el && !el.value) el.value = v; };

    setVal('form-name', item.title);
    setVal('form-poster', item.images?.jpg?.large_image_url || '');
    setVal('form-year', item.year);
    setVal('form-desc', item.synopsis);
    setVal('form-episodes', item.episodes);
    window.showToast('Data Applied');
};

// Add missing global mappings
window.getFilteredData = () => window.dataManager?.getFilteredData() || [];
window.getOptionLabel = (key) => window.dataManager?.getOptionLabel(key) || key;
window.loadData = async (forceRefresh = false) => window.dataManager?.loadData(forceRefresh);

// 初始化 DataManager
window.dataManager = new DataManager();

// Admin functions are now in admin-manager.js
console.log('✅ data-manager.js loaded');

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('data-manager', {
        loaded: true,
        exports: { 
            dataManager: window.dataManager,
            loadData: window.loadData,
            getFilteredData: window.getFilteredData
        },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: data-manager');
}
