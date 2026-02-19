/**
 * translation.js
 * ACG 收藏庫 - Jikan API 翻譯與自動補全模組
 * 負責：MAL 資料補全、Bangumi 簡介、Google 翻譯
 */

console.log('🌐 載入翻譯與補全模組...');

// ===== 主入口：自動補全動漫資料 =====
window.autoCompleteAnimeData = async () => {
    const nameEl = document.getElementById('form-name');
    const name = nameEl?.value?.trim();
    if (!name) return window.showToast('✗ 請先輸入作品名稱', 'error');
    window.showJikanSearchModal(name);
};

// ===== 顯示 Jikan 搜尋 Modal =====
window.showJikanSearchModal = (defaultQuery) => {
    const existing = document.getElementById('jikan-search-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'jikan-search-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(5px);';
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #0a0e1a, #1a1e2e); border: 1px solid rgba(139,92,246,0.4); border-radius: 12px; width: 90%; max-width: 700px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 0 40px rgba(139,92,246,0.2);">
            <div style="padding: 20px; border-bottom: 1px solid rgba(139,92,246,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="color: #c4b5fd; margin: 0; font-size: 16px;">✨ MAL 資料補全</h3>
                    <button onclick="document.getElementById('jikan-search-modal')?.remove()" style="background:none;border:none;color:#aaa;font-size:20px;cursor:pointer;">✕</button>
                </div>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="jikan-search-input" value="${defaultQuery}" placeholder="輸入日文或英文名稱搜尋效果最佳" style="flex:1;background:rgba(0,0,0,0.4);border:1px solid rgba(139,92,246,0.3);border-radius:6px;padding:10px;color:#fff;font-size:14px;" onkeydown="if(event.key==='Enter')window.executeJikanSearch()">
                    <button onclick="window.executeJikanSearch()" class="btn-primary" style="padding:10px 20px;border-color:rgba(139,92,246,0.6);color:#c4b5fd;">🔍 搜尋</button>
                </div>
                <div style="font-size: 11px; color: #888; margin-top: 6px;">💡 提示：使用日文或英文名稱搜尋準確度更高，例如「Jujutsu Kaisen」而非「咒術迴戰」</div>
            </div>
            <div id="jikan-results" style="flex:1;overflow-y:auto;padding:15px;">
                <div style="text-align:center;color:#888;padding:30px;">輸入關鍵字後按搜尋</div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    window.executeJikanSearch();
};

// ===== 檢查是否包含中文字元 =====
window._containsChinese = (text) => /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);

// ===== 使用 Google Translate 將中文翻譯為英文 =====
window._translateToEnglish = async (text) => {
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-TW&tl=en&dt=t&q=${encodeURIComponent(text)}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json?.[0]?.map(s => s[0]).join('') || null;
    } catch (err) {
        console.warn('[翻譯] 翻譯失敗:', err);
        return null;
    }
};

// ===== 搜尋 Jikan API 並去重 =====
window._searchJikan = async (query, limit = 10) => {
    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true`);
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
};

// ===== 執行 Jikan API 搜尋（支援中文自動翻譯）=====
window.executeJikanSearch = async () => {
    const input = document.getElementById('jikan-search-input');
    const resultsDiv = document.getElementById('jikan-results');
    const query = input?.value?.trim();
    if (!query || !resultsDiv) return;

    resultsDiv.innerHTML = '<div style="text-align:center;color:var(--neon-cyan);padding:30px;"><div style="font-size:24px;margin-bottom:10px;">⏳</div>搜尋中...</div>';

    try {
        let data = [];
        let translatedQuery = null;

        if (window._containsChinese(query)) {
            resultsDiv.innerHTML = '<div style="text-align:center;color:var(--neon-cyan);padding:30px;"><div style="font-size:24px;margin-bottom:10px;">🌐</div>翻譯中...</div>';
            translatedQuery = await window._translateToEnglish(query);

            if (translatedQuery) {
                resultsDiv.innerHTML = `<div style="text-align:center;color:var(--neon-cyan);padding:30px;"><div style="font-size:24px;margin-bottom:10px;">⏳</div>以「${translatedQuery}」搜尋中...</div>`;
                const [translatedResults, originalResults] = await Promise.all([
                    window._searchJikan(translatedQuery, 8),
                    window._searchJikan(query, 5)
                ]);
                const seen = new Set();
                data = [...translatedResults, ...originalResults].filter(item => {
                    if (seen.has(item.mal_id)) return false;
                    seen.add(item.mal_id);
                    return true;
                });
            } else {
                data = await window._searchJikan(query);
            }
        } else {
            data = await window._searchJikan(query);
        }

        if (data.length === 0) {
            resultsDiv.innerHTML = '<div style="text-align:center;color:#ff6b6b;padding:30px;">找不到結果，請嘗試其他關鍵字</div>';
            return;
        }

        const translateInfo = translatedQuery
            ? `<div style="padding:8px 12px;margin-bottom:10px;background:rgba(139,92,246,0.1);border-radius:6px;font-size:12px;color:#c4b5fd;">🌐 已自動翻譯：「${query}」→「${translatedQuery}」</div>`
            : '';

        resultsDiv.innerHTML = translateInfo + data.map((item, i) => {
            const title = item.title || '';
            const titleJp = item.title_japanese || '';
            const year = item.year || item.aired?.prop?.from?.year || '?';
            const score = item.score ? `⭐ ${item.score}` : '';
            const eps = item.episodes ? `${item.episodes} 集` : '';
            const type = item.type || '';
            const poster = item.images?.jpg?.small_image_url || '';
            const status = item.status === 'Currently Airing' ? '🟢 放送中' : (item.status === 'Finished Airing' ? '🔴 已完結' : '');

            return `
                <div onclick="window.applyJikanData(${i})" style="display:flex;gap:12px;padding:12px;border-radius:8px;cursor:pointer;border:1px solid rgba(139,92,246,0.15);margin-bottom:8px;transition:all 0.2s;background:rgba(0,0,0,0.2);" onmouseover="this.style.background='rgba(139,92,246,0.15)';this.style.borderColor='rgba(139,92,246,0.5)'" onmouseout="this.style.background='rgba(0,0,0,0.2)';this.style.borderColor='rgba(139,92,246,0.15)'">
                    <img src="${poster}" alt="" style="width:50px;height:70px;object-fit:cover;border-radius:4px;flex-shrink:0;background:#1a1a2e;">
                    <div style="flex:1;min-width:0;">
                        <div style="color:#e2e8f0;font-weight:bold;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
                        <div style="color:#888;font-size:11px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${titleJp}</div>
                        <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
                            <span style="font-size:11px;color:#c4b5fd;background:rgba(139,92,246,0.15);padding:2px 6px;border-radius:3px;">${type}</span>
                            <span style="font-size:11px;color:#94a3b8;">${year}</span>
                            ${eps ? `<span style="font-size:11px;color:#94a3b8;">${eps}</span>` : ''}
                            ${score ? `<span style="font-size:11px;color:#fbbf24;">${score}</span>` : ''}
                            ${status ? `<span style="font-size:11px;">${status}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        window._jikanSearchResults = data;
    } catch (err) {
        console.error('[Jikan] 搜尋失敗:', err);
        resultsDiv.innerHTML = `<div style="text-align:center;color:#ff6b6b;padding:30px;">搜尋失敗: ${err.message}</div>`;
    }
};

// ===== 從 Bangumi（番組計畫）取得中文簡介 =====
window._fetchBangumiSummary = async (jaTitle) => {
    try {
        const res = await fetch(`https://api.bgm.tv/search/subject/${encodeURIComponent(jaTitle)}?type=2&responseGroup=large&max_results=3`);
        if (!res.ok) return null;
        const json = await res.json();
        const list = json.list || [];
        if (list.length === 0) return null;
        return list[0].summary || null;
    } catch (err) {
        console.warn('[Bangumi] 取得簡介失敗:', err);
        return null;
    }
};

// ===== 簡體中文 → 繁體中文 =====
window._simplifiedToTraditional = async (text) => {
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=zh-TW&dt=t&q=${encodeURIComponent(text)}`);
        if (!res.ok) return text;
        const json = await res.json();
        return json?.[0]?.map(s => s[0]).join('') || text;
    } catch {
        return text;
    }
};

// ===== 將 Jikan API 資料填入表單（只補全空白欄位）=====
window.applyJikanData = async (index) => {
    const item = window._jikanSearchResults?.[index];
    if (!item) return;

    document.getElementById('jikan-search-modal')?.remove();
    window.showToast('⏳ 正在補全資料...', 'info');

    let filledCount = 0;
    const animeName = document.getElementById('form-name')?.value?.trim() || item.title;

    // 海報
    const posterEl = document.getElementById('form-poster');
    if (posterEl && !posterEl.value) {
        posterEl.value = item.images?.jpg?.large_image_url || '';
        if (posterEl.value) filledCount++;
    }

    // YouTube PV
    const ytEl = document.getElementById('form-youtube');
    if (ytEl && !ytEl.value && item.trailer?.embed_url) {
        const embedUrl = item.trailer.embed_url;
        const vidMatch = embedUrl.match(/embed\/([^?]+)/);
        ytEl.value = vidMatch ? `https://www.youtube.com/watch?v=${vidMatch[1]}` : embedUrl;
        filledCount++;
    }

    // 集數
    const epsEl = document.getElementById('form-episodes');
    if (epsEl && !epsEl.value && item.episodes) {
        epsEl.value = String(item.episodes);
        filledCount++;
    }

    // 簡介
    const descEl = document.getElementById('form-desc');
    if (descEl && !descEl.value) {
        let description = '';
        const jaTitle = item.title_japanese || item.title;
        if (jaTitle) {
            try {
                const bangumiSummary = await window._fetchBangumiSummary(jaTitle);
                if (bangumiSummary && bangumiSummary.length > 20) {
                    description = await window._simplifiedToTraditional(bangumiSummary);
                }
            } catch (err) {
                console.warn('[補全] Bangumi 取得失敗, 使用備用方案:', err);
            }
        }
        if (!description && item.synopsis) {
            description = item.synopsis.replace(/\s*\[Written by MAL Rewrite\]\s*/g, '').trim();
        }
        if (description) {
            descEl.value = description;
            filledCount++;
        }
    }

    // 年份
    const yearEl = document.getElementById('form-year');
    const apiYear = item.year || item.aired?.prop?.from?.year;
    if (yearEl && !yearEl.value && apiYear) {
        const yearStr = String(apiYear);
        const yearOpt = Array.from(yearEl.options).find(o => o.value === yearStr);
        if (yearOpt) {
            yearEl.value = yearStr;
            filledCount++;
        }
    }

    // 季度
    const seasonEl = document.getElementById('form-season');
    if (seasonEl && !seasonEl.value && item.season) {
        const seasonMap = { 'winter': '冬', 'spring': '春', 'summer': '夏', 'fall': '秋' };
        const seasonCN = seasonMap[item.season];
        if (seasonCN) {
            const seasonOpt = Array.from(seasonEl.options).find(o => o.value === seasonCN || o.value.includes(seasonCN));
            if (seasonOpt) {
                seasonEl.value = seasonOpt.value;
                filledCount++;
            }
        }
    }

    // 月份
    const monthEl = document.getElementById('form-month');
    const apiMonth = item.aired?.prop?.from?.month;
    if (monthEl && !monthEl.value && apiMonth) {
        const monthStr = String(apiMonth);
        const monthOpt = Array.from(monthEl.options).find(o => o.value === monthStr || o.value === `${apiMonth}月`);
        if (monthOpt) {
            monthEl.value = monthOpt.value;
            filledCount++;
        }
    }

    // 類型標籤
    const genreCheckboxes = document.querySelectorAll('input[name="form-genre"]');
    if (genreCheckboxes.length > 0 && item.genres?.length > 0) {
        const genreMap = {
            'Action': '動作', 'Adventure': '冒險', 'Comedy': '喜劇', 'Drama': '劇情',
            'Fantasy': '奇幻', 'Horror': '恐怖', 'Mystery': '懸疑', 'Romance': '戀愛',
            'Sci-Fi': '科幻', 'Supernatural': '超自然', 'Sports': '運動',
            'Slice of Life': '日常', 'Thriller': '驚悚', 'Suspense': '懸疑',
            'Ecchi': 'Ecchi', 'Harem': '後宮', 'Isekai': '異世界', 'Mecha': '機甲',
            'Music': '音樂', 'Psychological': '心理', 'School': '校園',
            'Military': '軍事', 'Historical': '歷史', 'Gore': '血腥',
            'Award Winning': '得獎作品', 'Gourmet': '美食',
            'Boys Love': 'BL', 'Girls Love': 'GL',
        };
        const allGenres = [...(item.genres || []), ...(item.themes || []), ...(item.demographics || [])];
        const mappedNames = allGenres.map(g => genreMap[g.name] || g.name);

        let genreFilled = 0;
        genreCheckboxes.forEach(cb => {
            if (!cb.checked && mappedNames.some(m => cb.value === m || cb.value.includes(m) || m.includes(cb.value))) {
                cb.checked = true;
                const label = cb.closest('label');
                if (label) {
                    label.style.background = 'rgba(0,212,255,0.2)';
                    label.style.borderColor = 'var(--neon-cyan)';
                }
                genreFilled++;
            }
        });
        if (genreFilled > 0) filledCount++;
    }

    // 平台連結
    const linksList = document.getElementById('links-list');
    if (linksList) {
        const existingNames = Array.from(linksList.querySelectorAll('.link-name')).map(el => el.value.toLowerCase());
        const allPlatformLinks = [
            { id: 'anime1', name: 'anime1.me', url: `https://anime1.me/?s=${encodeURIComponent(animeName)}` },
            { id: 'age', name: 'AGE動漫', url: `https://www.agedm.org/search?query=${encodeURIComponent(animeName)}` },
            { id: 'sn-video', name: '星夜動漫', url: `https://sn-video.com/search?q=${encodeURIComponent(animeName)}` },
            { id: '99itv', name: '99動漫', url: `https://99itv.net/search/-------------.html?wd=${encodeURIComponent(animeName)}&submit=` },
            { id: 'ofiii', name: 'Ofiii', url: `https://www.ofiii.com/search/${encodeURIComponent(animeName)}` },
            { id: 'dmmiku', name: '動漫MIKU', url: `https://www.dmmiku.com/index.php/vod/search.html?wd=${encodeURIComponent(animeName)}` },
            { id: 'yinhuadm', name: '櫻花動漫', url: `https://www.yinhuadm.cc/label/${encodeURIComponent(animeName)}.html` },
            { id: 'anione', name: 'AniOne YT', url: `https://www.youtube.com/@AniOneAnime/search?query=${encodeURIComponent(animeName)}` },
            { id: 'musetw', name: 'Muse木棉花 YT', url: `https://www.youtube.com/@MuseTW/search?query=${encodeURIComponent(animeName)}` },
        ];

        allPlatformLinks.forEach(link => {
            if (existingNames.some(n => n.includes(link.name.toLowerCase().split(' ')[0]))) return;
            const row = document.createElement('div');
            row.className = 'link-row-item';
            row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';
            row.innerHTML = `
                <input type="text" placeholder="名稱" class="link-name" value="${link.name}" style="flex:1;background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:6px;padding:6px;color:#fff;font-size:12px;">
                <input type="text" placeholder="網址" class="link-url" value="${link.url}" style="flex:3;background:rgba(0,0,0,0.3);border:1px solid rgba(0,212,255,0.3);border-radius:6px;padding:6px;color:#fff;font-size:12px;">
                <button class="btn-icon delete" style="width:30px;height:30px;padding:0;display:flex;align-items:center;justify-content:center;border-color:#ff4444;color:#ff4444;" onclick="this.parentElement.remove()">✕</button>
            `;
            linksList.appendChild(row);
            filledCount++;
        });
        window.showToast('🔗 已加入所有平台連結', 'info');
    }

    window.showToast(`✨ 已補全 ${filledCount} 項資料（簡介來源：${descEl?.value && !item.synopsis?.startsWith(descEl.value?.substring(0, 20)) ? 'Bangumi 繁中' : 'MAL'}）`, 'success');
};

// ===== Module Registration =====
if (window.Modules) {
    window.Modules.loaded.set('translation', {
        loaded: true,
        exports: {
            autoCompleteAnimeData: window.autoCompleteAnimeData,
            showJikanSearchModal: window.showJikanSearchModal,
            executeJikanSearch: window.executeJikanSearch,
            applyJikanData: window.applyJikanData
        },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: translation');
}
