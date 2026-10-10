/* Krishna Kuteer service worker: the app opens instantly from the copy saved on the phone, then refreshes quietly in the
   background. When a newer version arrives, the page shows "New version ready. Tap here to refresh."
   Google Sheets data requests are never touched here (they go straight to the network). */
const V = "kk-v42", KEEP = ["kk-photos"], FILES = ["./", "index.html", "lang.js", "features.js", "firebase-config.js", "push.js", "hero.webp", "fonts/poppins-Regular.woff2", "fonts/poppins-Medium.woff2", "fonts/poppins-Bold.woff2", "fonts/NotoSansTelugu.woff2", "manifest.webmanifest", "icon-192.png"];
/* Browsers refuse to show a redirected response for a page load, so rebuild it as a plain response. */
const clean = x => (x && x.redirected) ? new Response(x.body, { status: x.status, statusText: x.statusText, headers: x.headers }) : x;
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && KEEP.indexOf(k) < 0).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.endsWith("/sw.js")) return;
  const key = r.mode === "navigate" ? "index.html" : r;
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(r.mode === "navigate" ? "index.html" : r, { cache: "no-cache" }).then(async res => {
      if (res && res.ok) {
        if (hit && r.mode === "navigate") { const [a, b] = await Promise.all([hit.clone().text(), res.clone().text()]); if (a !== b) self.clients.matchAll().then(cs => cs.forEach(x => x.postMessage("updated"))); }
        c.put(key, clean(res.clone()));
      }
      return res;
    }).catch(() => hit);
    e.waitUntil(net.catch(() => {}));
    return hit || net;
  }).then(clean));
});

/* Push alerts (sent from Firebase Cloud Messaging by the Apps Script) */
self.addEventListener("push", e => {
  let p = {}; try { p = e.data ? e.data.json() : {}; } catch (x) { try { p = { body: e.data.text() }; } catch (y) {} }
  const d = Object.assign({}, p.notification || {}, p.data || {});
  e.waitUntil(self.registration.showNotification(d.title || "Krishna Kuteer", { body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", data: { url: d.url || "/" } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin).href;
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => { for (const c of cs) if ("focus" in c) return c.focus(); return clients.openWindow(url); }));
});
