/* Krishna Kuteer service worker: app files load from the phone instantly, then refresh quietly in the background.
   Google Sheets data requests are never touched here (they go straight to the network). */
const V = "kk-v32", FILES = ["./", "index.html", "lang.js", "hero.webp","fonts/poppins-Regular.woff","fonts/poppins-Medium.woff","fonts/poppins-Bold.woff", "manifest.webmanifest", "icon-192.png"];
/* Browsers refuse to show a redirected response for a page load, so rebuild it as a plain response. */
const clean = x => (x && x.redirected) ? new Response(x.body, { status: x.status, statusText: x.statusText, headers: x.headers }) : x;
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
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
    if (r.mode === "navigate") return Promise.race([net.then(x => x || hit), new Promise(res => setTimeout(() => res(hit), 4000))]).then(x => x || net);
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
