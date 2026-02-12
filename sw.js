/**
 * Service Worker - 離線支援與快取策略 v1.0
 * 提供 PWA 能力、資源快取、離線支援
 * @version 1.0.0
 * @date 2026-02-04
 */

const CACHE_NAME = 'acg-manager-v8.0.0';
const STATIC_CACHE = 'static-v8.0.0';
const DYNAMIC_CACHE = 'dynamic-v8.0.0';
const API_CACHE = 'api-v8.0.0';

// 快取策略
const CACHE_STRATEGIES = {
    // 靜態資源 - Cache First
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
            /\.ico$/
        ],
        strategy: 'cache-first',
        maxEntries: 100,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 天
    },
    // API 響應 - Network First
    api: {
        patterns: [
            /supabase\.co/,
            /api\./,
            /\/rest\/v1\//
        ],
        strategy: 'network-first',
        maxEntries: 50,
        maxAge: 5 * 60 * 1000 // 5 分鐘
    },
    // 頁面 - Stale While Revalidate
    pages: {
        patterns: [
            /\/$/,
            /\.html$/
        ],
        strategy: 'stale-while-revalidate',
        maxEntries: 20,
        maxAge: 24 * 60 * 60 * 1000 // 1 天
    }
};

// 安裝 Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Pre-caching static assets');
                return cache.addAll([
                    './',
                    './index.html',
                    './css/base.css',
                    './css/layout.css',
                    './css/components.css',
                    './css/animations.css',
                    './css/responsive.css',
                    './js/config.js',
                    './js/security.js',
                    './js/performance.js',
                    './js/supabase.js',
                    './js/analytics.js',
                    './js/announcements.js',
                    './js/script.js',
                    './js/background-switcher.js',
                    './js/matrix-rain.js',
                    './js/hearts-background.js',
                    './js/atmosphere.js',
                    './js/logger.js',
                    './js/state.js'
                ]);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活 Service Worker
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
            .then(() => self.clients.claim())
    );
});

// 攔截請求
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 排除 Chrome 擴展
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // 根據請求類型選擇策略
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

/**
 * 判斷是否為 API 請求
 */
function isApiRequest(url) {
    return CACHE_STRATEGIES.api.patterns.some(pattern => pattern.test(url.href));
}

/**
 * 判斷是否為靜態資源
 */
function isStaticRequest(url) {
    return CACHE_STRATEGIES.static.patterns.some(pattern => pattern.test(url.pathname));
}

/**
 * 判斷是否為頁面請求
 */
function isPageRequest(url) {
    return CACHE_STRATEGIES.pages.patterns.some(pattern => pattern.test(url.pathname));
}

/**
 * Cache First 策略 - 靜態資源
 */
async function handleStaticRequest(request) {
    const cached = await caches.match(request);

    if (cached) {
        console.log('[SW] Cache hit:', request.url);
        return cached;
    }

    try {
        const response = await fetch(request);

        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[SW] Static fetch failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network First 策略 - API 請求
 */
async function handleApiRequest(request) {
    try {
        // 只快取 GET 請求
        if (request.method !== 'GET') {
            return fetch(request);
        }

        const response = await fetch(request);

        if (response.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);

        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        return new Response(
            JSON.stringify({ error: 'Offline', cached: false }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Stale While Revalidate 策略 - 頁面
 */
async function handlePageRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);

    // 同時發起網路請求
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

/**
 * Default 策略
 */
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

// 背景同步
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

/**
 * 同步數據
 */
async function syncData() {
    try {
        // 獲取待同步的數據
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
                    // 重新構造請求，因為原始請求可能已經失效
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
                    console.error('[SW] Sync request failed:', error);
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

/**
 * 將請求添加到待同步佇列
 * @param {string} url - 請求 URL
 * @param {Object} options - 請求選項
 */
async function addToPendingSync(url, options = {}) {
    const cache = await caches.open('pending-sync');
    const requestData = JSON.stringify({
        url,
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body,
        timestamp: Date.now()
    });

    const request = new Request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestData
    });

    await cache.put(request);

    // 嘗試觸發背景同步
    if ('sync' in self.registration) {
        await self.registration.sync.register('sync-data').catch(err => {
            console.log('[SW] Background sync registration failed:', err);
        });
    }
}

// 推送通知
self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event);

    let data = { title: 'ACG 收藏庫', body: '有新通知' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
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

// 通知點擊
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

// 訊息處理
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                    return cache.addAll(event.data.urls);
                })
        );
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys()
                .then((names) => {
                    return Promise.all(
                        names.map((name) => caches.delete(name))
                    );
                })
        );
    }
});

console.log('[SW] Service Worker loaded');
