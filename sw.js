const CACHE_NAME = 'sendit-scanner-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// تثبيت الـ Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching app shell');
            return cache.addAll(ASSETS);
        })
    );
});

// تفعيل الـ Service Worker وحذف الكاش القديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Clearing old cache');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// استراتيجية الجلب: الكاش أولاً للملفات المحلية
self.addEventListener('fetch', (event) => {
    // نتعامل فقط مع طلبات GET
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // إذا وجد في الكاش، أعده
            if (cachedResponse) {
                return cachedResponse;
            }
            // إذا لم يوجد، اجلبه من الشبكة
            return fetch(event.request).then((networkResponse) => {
                // يمكننا إضافته للكاش هنا إذا أردنا، لكن سنكتفي بالملفات المحلية للبساطة
                return networkResponse;
            }).catch(() => {
                // في حالة عدم وجود انترنت ولم يجد الملف، يمكن إرجاع صفحة خطأ (اختياري)
                return new Response('Offline');
            });
        })
    );
});