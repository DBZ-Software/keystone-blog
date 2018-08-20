var dataCacheName = 'data-cache-v1';
var cacheName = 'cache-v1';
var analyticsUrl = 'https://www.google-analytics.com';
var filesToCache = [
	'/',
	'/favicon.ico',
	'/styles/site.min.css',
	'/js/jquery/jquery-1.11.3.min.js',
	'/js/bootstrap/bootstrap-3.3.5.min.js',
];

self.addEventListener('install', function (e) {
	console.log('[ServiceWorker] Install');
	e.waitUntil(
		caches.open(cacheName).then(function (cache) {
			console.log('[ServiceWorker] Caching app shell');
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener('activate', function (e) {
	console.log('[ServiceWorker] Activate');
	e.waitUntil(
		caches.keys().then(function (keyList) {
			return Promise.all(
				keyList.map(function (key) {
					if (key !== cacheName) {
						console.log('[ServiceWorker] Removing old cache', key);
						return caches.delete(key);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', function (e) {
	console.log('[ServiceWorker] Fetch', e.request.url);
	if (e.request.url.indexOf(analyticsUrl) === 0) {
		fetch(e.request);
	} else if (e.request.url.startsWith('http')) {
		e.respondWith(
			fetch(e.request).then(function (response) {
				return caches.open(dataCacheName).then(function (cache) {
					cache.put(e.request.url, response.clone());
					console.log('[ServiceWorker] Fetched & Cached Data');
					return response;
				});
			})
		);
	} else {
		e.respondWith(
			caches.match(e.request).then(function (response) {
				return response || fetch(e.request);
			})
		);
	}
});
