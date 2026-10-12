/* Push notifications.
   Browser: Firebase Cloud Messaging (web push), unchanged.
   Android app (Capacitor): native push plugin, token sent to the same Apps Script action "pushReg".
   Safe to deploy before setup: nothing shows until firebase-config.js is filled in (browser) or the app is installed (Android). */
(function () {
  const C = window.KK_FB, V = "10.12.2", DAY = 864e5;
  const filled = x => x && !/^PASTE/.test(x);

  /* ---------- Android app (Capacitor) helpers ---------- */
  const native = () => {
    try { const c = window.Capacitor; return !!(c && (c.isNativePlatform ? c.isNativePlatform() : (c.getPlatform && c.getPlatform() !== "web"))); }
    catch (e) { return false; }
  };
  const plugin = () => { const c = window.Capacitor; return c && c.Plugins && c.Plugins.PushNotifications; };
  let listening = false;
  function nativeListen() {
    const P = plugin(); if (!P || listening) return; listening = true;
    try {
      P.addListener("pushNotificationReceived", n => { try { toast((n.title || "Krishna Kuteer") + (n.body ? ": " + n.body : "")); } catch (e) {} });
    } catch (e) {}
  }
  function nativeToken() {
    const P = plugin();
    if (!P) return Promise.reject(new Error("The alert service is not available in this app"));
    nativeListen();
    return new Promise(async (res, rej) => {
      let h1, h2, timer;
      const done = () => { clearTimeout(timer); try { h1 && h1.remove(); h2 && h2.remove(); } catch (e) {} };
      try {
        h1 = await P.addListener("registration", t => { done(); res(t.value); });
        h2 = await P.addListener("registrationError", e => { done(); rej(new Error((e && (e.error || e.message)) || "Phone registration failed")); });
        timer = setTimeout(() => { done(); rej(new Error("Timed out waiting for the phone token")); }, 20000);
        await P.register();
      } catch (e) { done(); rej(e); }
    });
  }

  /* ---------- Browser (web push) helpers ---------- */
  const ok = () => C && filled(C.apiKey) && filled(C.vapidKey) && "serviceWorker" in navigator && "Notification" in window && "PushManager" in window && location.protocol === "https:";
  const load = src => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Could not load the notification service")); document.head.appendChild(s); });
  let sdk = null;
  const messaging = () => sdk || (sdk = (async () => {
    const b = "https://www.gstatic.com/firebasejs/" + V + "/";
    await load(b + "firebase-app-compat.js"); await load(b + "firebase-messaging-compat.js");
    if (!firebase.apps.length) firebase.initializeApp({ apiKey: C.apiKey, authDomain: C.authDomain, projectId: C.projectId, messagingSenderId: C.messagingSenderId, appId: C.appId });
    return firebase.messaging();
  })());
  async function webToken() {
    const m = await messaging(), reg = await navigator.serviceWorker.ready;
    return m.getToken({ vapidKey: C.vapidKey, serviceWorkerRegistration: reg });
  }

  /* ---------- shared ---------- */
  async function register(force) {
    const last = +localStorage.getItem("kk_pt_at") || 0;
    if (!force && Date.now() - last < DAY) return;           /* tell the server at most once a day */
    const t = native() ? await nativeToken() : await webToken();
    if (!t) throw new Error("No token received");
    const r = await api({ a: "pushReg", pt: t }, true);
    if (r.error) throw new Error(r.error.message);
    localStorage.setItem("kk_pt_at", String(Date.now()));
  }
  async function enable() {
    try {
      if (native()) {
        const P = plugin(); if (!P) throw new Error("The alert service is not available in this app");
        const r = await P.requestPermissions();
        if (r.receive !== "granted") { toast(r.receive === "denied" ? "Alerts are blocked. Allow them in phone Settings > Apps > Krishna Kuteer > Notifications." : "Alerts were not turned on."); return false; }
        await register(true); localStorage.setItem("kk_native_on", "1"); toast("Alerts are on 🔔"); return true;
      }
      const p = await Notification.requestPermission();
      if (p !== "granted") { toast(p === "denied" ? "Alerts are blocked. Allow them in phone Settings > Apps > Krishna Kuteer > Notifications." : "Alerts were not turned on."); return false; }
      await register(true); toast("Alerts are on 🔔"); return true;
    } catch (e) { toast("Could not turn on alerts: " + e.message); return false; }
  }
  const cardHtml = '<div class="card" id="pushcard" style="display:flex;gap:12px;align-items:center;justify-content:space-between"><div><b>🔔 Get alerts on your phone</b><small style="display:block;color:var(--grey)">Notices, meetings, polls and app updates.</small></div><button type="button" data-pushon style="width:auto;padding:8px 16px">Turn on</button></div>';
  window.KKPush = {
    card() {
      if (native()) return localStorage.getItem("kk_native_on") === "1" ? "" : cardHtml;
      if (!ok() || Notification.permission !== "default") return "";
      return cardHtml;
    },
    sync() {
      if (native()) { nativeListen(); if (localStorage.getItem("kk_native_on") === "1") register(false).catch(() => {}); return; }
      if (ok() && Notification.permission === "granted") register(false).catch(() => {});
    }
  };
  document.addEventListener("click", async e => {
    const b = e.target.closest && e.target.closest("[data-pushon]"); if (!b) return;
    b.disabled = true; const done = await enable(); b.disabled = false;
    if (done) { const c = document.getElementById("pushcard"); if (c) c.remove(); }
  });
})();
