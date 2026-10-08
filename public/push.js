/* Push notifications via Firebase Cloud Messaging. Safe to deploy before setup: nothing shows until firebase-config.js is filled in. */
(function () {
  const C = window.KK_FB, V = "10.12.2", DAY = 864e5;
  const filled = x => x && !/^PASTE/.test(x);
  const ok = () => C && filled(C.apiKey) && filled(C.vapidKey) && "serviceWorker" in navigator && "Notification" in window && "PushManager" in window && location.protocol === "https:";
  const load = src => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Could not load the notification service")); document.head.appendChild(s); });
  let sdk = null;
  const messaging = () => sdk || (sdk = (async () => {
    const b = "https://www.gstatic.com/firebasejs/" + V + "/";
    await load(b + "firebase-app-compat.js"); await load(b + "firebase-messaging-compat.js");
    if (!firebase.apps.length) firebase.initializeApp({ apiKey: C.apiKey, authDomain: C.authDomain, projectId: C.projectId, messagingSenderId: C.messagingSenderId, appId: C.appId });
    return firebase.messaging();
  })());
  async function register(force) {
    const last = +localStorage.getItem("kk_pt_at") || 0;
    if (!force && Date.now() - last < DAY) return;           /* tell the server at most once a day */
    const m = await messaging(), reg = await navigator.serviceWorker.ready;
    const t = await m.getToken({ vapidKey: C.vapidKey, serviceWorkerRegistration: reg });
    if (!t) throw new Error("No token received");
    const r = await api({ a: "pushReg", pt: t }, true);
    if (r.error) throw new Error(r.error.message);
    localStorage.setItem("kk_pt_at", String(Date.now()));
  }
  async function enable() {
    try {
      const p = await Notification.requestPermission();
      if (p !== "granted") { toast(p === "denied" ? "Alerts are blocked. Allow them in phone Settings > Apps > Krishna Kuteer > Notifications." : "Alerts were not turned on."); return false; }
      await register(true); toast("Alerts are on 🔔"); return true;
    } catch (e) { toast("Could not turn on alerts: " + e.message); return false; }
  }
  window.KKPush = {
    card() {
      if (!ok() || Notification.permission !== "default") return "";
      return '<div class="card" id="pushcard" style="display:flex;gap:12px;align-items:center;justify-content:space-between"><div><b>🔔 Get alerts on your phone</b><small style="display:block;color:var(--grey)">Notices, meetings, polls and app updates.</small></div><button type="button" data-pushon style="width:auto;padding:8px 16px">Turn on</button></div>';
    },
    sync() { if (ok() && Notification.permission === "granted") register(false).catch(() => {}); }
  };
  document.addEventListener("click", async e => {
    const b = e.target.closest && e.target.closest("[data-pushon]"); if (!b) return;
    b.disabled = true; const done = await enable(); b.disabled = false;
    if (done) { const c = document.getElementById("pushcard"); if (c) c.remove(); }
  });
})();
