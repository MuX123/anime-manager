/**
 * Service Worker - 離線支援與快取策略 v1.0
 * 提供 PWA 能力、資源快取、離線支援
 * @version 1.0.0
 * @date 2026-02-04
 */

const CACHE_NAME = 'acg-manager-v8.4.0';
const STATIC_CACHE = 'static-v8.4.0';
const DYNAMIC_CACHE = 'dynamic-v8.4.0';
const API_CACHE = 'api-v8.4.0';

// 快取策略
const CACHE_STRATEGIES = {
    // 靜態資源 - Cache First (按需快取)
    static: {
        patterns: [
            /\.css$/,
            /\.js$/,
            /\.woff2?$/,
            /\.ttf$/,
            /\.eot$/,
            /\.svg$/,
            /\.png$/,
            /\.jpg$/,
            /\.jpeg$/,
            /\.gif$/,
            /\.ico$/,
            /\.ani$/,
            /\.cur$/
        ],
        strategy: 'cache-first',
        maxEntries: 200,
        maxAge: 30 * 24 * 60 * 60 * 1000
    },
    api: {
        patterns: [
            /supabase\.co/,
            /api\./,
            /\/rest\/v1\//
        ],
        strategy: 'network-first',
        maxEntries: 50,
        maxAge: 5 * 60 * 1000
    },
    pages: {
        patterns: [
            /\/$/,
            /\.html$/
        ],
        strategy: 'stale-while-revalidate',
        maxEntries: 20,
        maxAge: 24 * 60 * 60 * 1000
    }
};

const CORE_ASSETS = [
    './',
    './index.html',
    './css/base.css',
    './css/layout.css',
    './css/components.css',
    './css/animations.css',
    './css/responsive.css',
    './css/detail-cyberpunk.css',
    './css/matrix-rain.css',
    './css/render.css',
    './css/loader.css',
    './css/variables.css',
    './css/restore_menu.css',
    './js/config.js',
    './js/security.js',
    './js/performance.js',
    './js/supabase.js',
    './js/analytics.js',
    './js/announcements.js',
    './js/render.js',
    './js/script.js',
    './js/atmosphere.js',
    './js/background-switcher.js',
    './js/matrix-rain.js',
    './js/logger.js',
    './js/state.js',
    './js/debug.js',
    './js/fix-recommendation.js',
    './js/github-pages-config.js',
    './js/usability.js',
    './js/cache-control.js'
];

self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker v8.3.0...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Pre-caching core assets...');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Core assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Cache install failed:', error);
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name.startsWith('acg-') &&
                                name !== CACHE_NAME &&
                                name !== STATIC_CACHE &&
                                name !== DYNAMIC_CACHE &&
                                name !== API_CACHE;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients...');
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.protocol === 'chrome-extension:' || request.method !== 'GET') {
        return;
    }

    if (isApiRequest(url)) {
        event.respondWith(handleApiRequest(request));
    } else if (isStaticRequest(url)) {
        event.respondWith(handleStaticRequest(request));
    } else if (isPageRequest(url)) {
        event.respondWith(handlePageRequest(request));
    } else {
        event.respondWith(handleDefaultRequest(request));
    }
});

function isApiRequest(url) {
    return CACHE_STRATEGIES.api.patterns.some(pattern => pattern.test(url.href));
}

function isStaticRequest(url) {
    return CACHE_STRATEGIES.static.patterns.some(pattern => pattern.test(url.pathname));
}

function isPageRequest(url) {
    return CACHE_STRATEGIES.pages.patterns.some(pattern => pattern.test(url.pathname));
}

async function handleStaticRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] Static fetch failed:', request.url);
        if (request.url.includes('.ani') || request.url.includes('.cur')) {
            return new Response('', { status: 408 });
        }
        throw error;
    }
}

async function handleApiRequest(request) {
    try {
        const response = await fetch(request);
        if (response.ok && request.method === 'GET') {
            const cache = await caches.open(API_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        return new Response(
            JSON.stringify({ error: 'Offline', cached: false }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

async function handlePageRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);
    return cached || fetchPromise;
}

async function handleDefaultRequest(request) {
    try {
        const response = await fetch(request);
        if (response.ok && request.method === 'GET') {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        return new Response('Offline', { status: 503 });
    }
}

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        const cache = await caches.open('pending-sync');
        const requests = await cache.keys();
        if (requests.length === 0) {
            console.log('[SW] No pending data to sync');
            return;
        }
        console.log('[SW] Syncing', requests.length, 'pending requests');
        const results = await Promise.allSettled(
            requests.map(async (request) => {
                try {
                    const requestData = await request.clone().text();
                    const options = requestData ? JSON.parse(requestData) : {};
                    const response = await fetch(request.url, {
                        method: options.method || 'GET',
                        headers: options.headers || {},
                        body: options.body ? JSON.stringify(options.body) : undefined
                    });
                    if (response.ok) {
                        await cache.delete(request);
                        return { url: request.url, success: true };
                    }
                    return { url: request.url, success: false, status: response.status };
                } catch (error) {
                    return { url: request.url, success: false, error: error.message };
                }
            })
        );
        const successCount = results.filter(r => r.success).length;
        console.log('[SW] Sync complete:', successCount, '/', requests.length, 'succeeded');
    } catch (error) {
        console.error('[SW] Sync error:', error);
    }
}

self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event);
    let data = { title: 'ACG 收藏庫', body: '有新通知' };
    if (event.data) {
        try { data = event.data.json(); } catch (e) { data.body = event.data.text(); }
    }
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: './icon-192.png',
            badge: './badge-72.png',
            tag: data.tag || 'default',
            data: data.data || {}
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event);
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then((cache) => cache.addAll(event.data.urls))
        );
    }
    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
        );
    }
});

console.log('[SW] Service Worker v8.3.0 loaded');
