/* Krishna Kuteer service worker: the app opens instantly from the copy saved on the phone, then refreshes quietly in the
   background. When a newer version arrives, the page shows "New version ready. Tap here to refresh."
   Google Sheets data requests are never touched here (they go straight to the network). */
const V = "kk-v47", KEEP = ["kk-photos"], FILES = ["./", "index.html", "lang.js", "features.js", "firebase-config.js", "push.js", "hero.webp", "fonts/poppins-Regular.woff2", "fonts/poppins-Medium.woff2", "fonts/poppins-Bold.woff2", "fonts/NotoSansTelugu.woff2", "manifest.webmanifest", "icon-192.png"];
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
  const o = { body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", data: { url: d.url || "/" } };
  /* a visitor at the gate: Approve / Deny buttons right on the alert (and on a paired watch) */
  if (d.type === "visit" && d.vid) {
    const max = (self.Notification && Notification.maxActions) || 2;
    o.actions = [{ action: "approve", title: "✅ Approve" }, { action: "deny", title: "⛔ Deny" }];
    if (max >= 3 && /deliver|courier|parcel/i.test(d.purpose || "")) o.actions.push({ action: "gate", title: "📦 Leave at gate" });
    o.tag = "visit-" + d.vid; o.renotify = true; o.requireInteraction = true; o.vibrate = [300, 150, 300];
    o.data = { url: "/#vis", vid: d.vid, code: d.code, api: d.api };
  }
  e.waitUntil(self.registration.showNotification(d.title || "Krishna Kuteer", o));
});
/* answers the gate from the alert, without opening the app */
async function answerVisit(n, decision) {
  const d = n.data || {}, L = { approve: "Approved", deny: "Denied", gate: "Leave at gate" };
  if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(d.api || "") || !d.code) return false;
  try {
    const r = await (await fetch(d.api, { method: "POST", body: JSON.stringify({ a: "visitorDecide", id: d.vid, code: d.code, decision }) })).json();
    if (r.error) throw new Error(r.error.message);
    await self.registration.showNotification(r.already ? "Already answered" : L[decision] + " ✓", { body: r.already ? "This visitor was already answered." : "The gate has been told.", icon: "icon-192.png", badge: "icon-192.png", tag: "visit-" + d.vid, data: { url: "/#vis" } });
    return true;
  } catch (x) {
    await self.registration.showNotification("Could not send your answer", { body: (x && x.message) || "Open the app to answer.", icon: "icon-192.png", badge: "icon-192.png", tag: "visit-" + d.vid, data: { url: "/#vis" } });
    return false;
  }
}
self.addEventListener("notificationclick", e => {
  e.notification.close();
  if (["approve", "deny", "gate"].includes(e.action)) { e.waitUntil(answerVisit(e.notification, e.action)); return; }
  const url = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin).href;
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => { for (const c of cs) if ("focus" in c) { try { c.navigate && c.navigate(url); } catch (x) {} return c.focus(); } return clients.openWindow(url); }));
});
