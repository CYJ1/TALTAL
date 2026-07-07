// 최소한의 서비스워커: PWA 설치 가능 조건("fetch 핸들러가 있는 활성 서비스워커")을
// 충족시키기 위한 용도로, 지금은 오프라인 캐싱 전략을 추가하지 않고 그대로 통과시킨다.
// 나중에 오프라인 지원이 필요해지면 이 fetch 핸들러 안에 캐싱 전략을 추가하면 된다.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
