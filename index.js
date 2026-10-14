// Service Worker：缓存页面文件，断网或从桌面图标打开也能秒开。
// 改了代码重新部署后，把下面的版本号 +1，手机才会换成新版本。
const V = 'xsj-v2';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// 安装：把需要的文件存进缓存
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

// 激活：删掉旧版本缓存
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// 请求：只处理本站的 GET；先用缓存，没有再联网。接口请求（跨域/POST）一律不碰。
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(r).then(hit => hit || fetch(r).then(res => {
      const cp = res.clone();
      caches.open(V).then(c => c.put(r, cp));
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
