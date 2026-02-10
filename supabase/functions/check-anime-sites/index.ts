// Supabase Edge Function: check-anime-sites
// 檢查各動漫網站是否有指定作品的搜尋結果
// 部署方式：在 Supabase Dashboard → Edge Functions → 建立新 Function

// @ts-ignore - Deno 環境 import
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SiteConfig {
    id: string;
    name: string;
    searchUrl: (q: string) => string;
    hasResults: (html: string) => boolean;
}

interface CheckResult {
    id: string;
    name: string;
    available: boolean;
    url: string;
}

// 各網站的搜尋設定
const SITE_CONFIGS: SiteConfig[] = [
    {
        id: 'sn-video',
        name: '星夜動漫',
        searchUrl: (q) => `https://sn-video.com/search?q=${encodeURIComponent(q)}`,
        hasResults: (html) => !html.includes('找不到') && !html.includes('no results') && html.length > 1000,
    },
    {
        id: '99itv',
        name: '99動漫',
        searchUrl: (q) => `https://99itv.net/vodsearch/${encodeURIComponent(q)}----------1---.html`,
        hasResults: (html) => html.includes('stui-vodlist__box') || html.includes('module-items'),
    },
    {
        id: 'dmmiku',
        name: '動漫MIKU',
        searchUrl: (q) => `https://www.dmmiku.com/index.php/vod/search.html?wd=${encodeURIComponent(q)}`,
        hasResults: (html) => html.includes('module-items') || html.includes('module-card-item') || (html.includes('search') && !html.includes('没有找到') && !html.includes('暂无数据')),
    },
    {
        id: 'yinhuadm',
        name: '櫻花動漫',
        searchUrl: (q) => `https://www.yinhuadm.cc/search/${encodeURIComponent(q)}/`,
        hasResults: (html) => html.includes('lpic') || html.includes('module-item') || (html.includes('search') && !html.includes('没有找到') && !html.includes('找不到')),
    },
    {
        id: 'anime1',
        name: 'anime1.me',
        searchUrl: (q) => `https://anime1.me/?s=${encodeURIComponent(q)}`,
        hasResults: (html) => html.includes('entry-title') && !html.includes('找不到符合的項目'),
    },
    {
        id: 'age',
        name: 'AGE動漫',
        searchUrl: (q) => `https://www.agedm.org/search?query=${encodeURIComponent(q)}`,
        hasResults: (html) => html.includes('card') || html.includes('video_item') || (html.length > 2000 && !html.includes('没有找到')),
    },
];

interface YouTubeChannel {
    id: string;
    name: string;
    handle: string;
}

const YOUTUBE_CHANNELS: YouTubeChannel[] = [
    { id: 'anione', name: 'AniOne YT', handle: '@AniOneAnime' },
    { id: 'musetw', name: 'Muse木棉花 YT', handle: '@MuseTW' },
];

async function checkSite(config: SiteConfig, query: string): Promise<CheckResult> {
    const url = config.searchUrl(query);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const resp = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            },
        });
        clearTimeout(timeout);

        if (!resp.ok) {
            return { id: config.id, name: config.name, available: false, url };
        }

        const html = await resp.text();
        const available = config.hasResults(html);
        return { id: config.id, name: config.name, available, url };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Error checking ${config.name}:`, msg);
        return { id: config.id, name: config.name, available: false, url };
    }
}

async function checkYouTube(channel: YouTubeChannel, query: string): Promise<CheckResult> {
    const url = `https://www.youtube.com/${channel.handle}/search?query=${encodeURIComponent(query)}`;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const resp = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept-Language': 'zh-TW,zh;q=0.9',
            },
        });
        clearTimeout(timeout);

        if (!resp.ok) {
            return { id: channel.id, name: channel.name, available: false, url };
        }

        const html = await resp.text();
        const available = html.includes('videoRenderer') || html.includes('playlistRenderer') || html.includes('"text":"');
        return { id: channel.id, name: channel.name, available, url };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Error checking ${channel.name}:`, msg);
        return { id: channel.id, name: channel.name, available: false, url };
    }
}

serve(async (req: Request) => {
    // 處理 CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { animeName, sites } = await req.json();
        if (!animeName) {
            return new Response(JSON.stringify({ error: '缺少 animeName 參數' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 可選：只檢查指定的網站
        const sitesToCheck = sites
            ? SITE_CONFIGS.filter(s => (sites as string[]).includes(s.id))
            : SITE_CONFIGS;

        const ytToCheck = sites
            ? YOUTUBE_CHANNELS.filter(c => (sites as string[]).includes(c.id))
            : YOUTUBE_CHANNELS;

        // 並行檢查所有網站
        const results = await Promise.all([
            ...sitesToCheck.map(s => checkSite(s, animeName)),
            ...ytToCheck.map(c => checkYouTube(c, animeName)),
        ]);

        return new Response(JSON.stringify({ results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
