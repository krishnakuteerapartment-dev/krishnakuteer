/* Krishna Kuteer - language switch: English | తెలుగు
   HOW IT WORKS: the app's own words (menus, buttons, headings, form labels, messages) are swapped for Telugu when the
   resident taps "తెలుగు". Text typed by residents (notices, complaints, polls...) is shown from its Telugu copy made by the server (see KK_LOC below).
   TO FIX A TELUGU WORD: find the English line in the list below (TE) and change only the Telugu part on the right.
   TO ADD A NEW ONE: add a line   "English text exactly as shown in the app": "తెలుగు",   (keep the comma at the end). */
(function () {
  "use strict";
  var KEY = "kk_lang", L = "en";
  try { L = localStorage.getItem(KEY) === "te" ? "te" : "en"; } catch (e) {}
  document.documentElement.lang = L;

  /* ---------- the little English | తెలుగు switch (shown in the header and on the sign-in page) ---------- */
  window.KK_LANG = L;
  window.KK_LGSW = function () {
    return '<span class="lgsw" role="group" aria-label="Language">' +
      '<button type="button" data-lg="en" class="' + (L === "en" ? "on" : "") + '"><span class="lgl">English</span><span class="lgs">EN</span></button>' +
      '<button type="button" data-lg="te" class="' + (L === "te" ? "on" : "") + '"><span class="lgl">తెలుగు</span><span class="lgs">తె</span></button></span>';
  };
  var css = document.createElement("style");
  css.textContent =
    ".lgsw{display:inline-flex;gap:2px;padding:3px;border-radius:999px;background:rgba(255,255,255,.18);margin-left:auto;flex:none}" +
    ".lgsw button{all:unset;box-sizing:border-box;cursor:pointer;padding:5px 11px;border-radius:999px;font-size:.78rem;font-weight:600;line-height:1.3;color:#fff;white-space:nowrap}" +
    ".lgsw button.on{background:#fff;color:#0b2a63}" +
    ".lgsw button{position:relative;overflow:hidden}.lgsw button::after,.lgsw button::before{display:none!important}" +
    ".hdr-actions{margin-left:12px}" +
    "header .hl{min-width:0;flex:1 1 auto;display:flex;align-items:center}header .brand{min-width:0;overflow:hidden}header .lgsw{margin-left:8px}" +
    ".lgs{display:none}@media(max-width:420px){header .lgsw .lgl{display:none}header .lgsw .lgs{display:inline}header .lgsw button{padding:5px 9px;font-size:.8rem}header .brand b{font-size:1.02rem}header .brand .logo{flex:none}}" +
    "@media(max-width:340px){header .brand b{white-space:normal;line-height:1.15}}" +
    ".login .lgsw{display:flex;width:max-content;margin:0;background:rgba(255,255,255,.94);box-shadow:0 2px 10px rgba(11,42,99,.25);position:absolute;top:12px;right:12px;z-index:5}" +
    ".login .hero-img{max-width:none!important}" +
    ".login .lgsw button{color:#0b2a63}.login .lgsw button.on{background:#0b2a63;color:#fff}";
  document.head.appendChild(css);
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-lg]");
    if (!b) return;
    var v = b.getAttribute("data-lg");
    if (v === L) return;
    try { localStorage.setItem(KEY, v); } catch (x) {}
    location.reload();
  });

  /* ---------- Telugu letters always use Noto Sans Telugu (file: fonts/NotoSansTelugu.woff2). English letters keep Poppins. ---------- */
  var STACK = 'KKP,"KK Telugu",Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  var fcss = document.createElement("style");
  fcss.textContent =
    '@font-face{font-family:"KK Telugu";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/NotoSansTelugu.woff2) format("woff2");' +
    'unicode-range:U+0951-0952,U+0964-0965,U+0C00-0C7F,U+1CDA,U+1CF2,U+200C-200D,U+25CC}' +
    'body,input,select,textarea,button{font-family:' + STACK + '!important}' +
    'html[lang=te] body *{font-family:' + STACK + '!important}' +
    '.wel>small{display:block}';
  document.head.appendChild(fcss);

  /* ---------- text typed by people (notices, complaints, events, polls...) ----------
     The server keeps a Telugu copy of each one (column 'te' in the Google Sheet). In తెలుగు mode the app shows that copy;
     in English mode it shows the text exactly as it was typed. Poll answers keep their English value for voting. */
  var TEF = { notices: ["title"], complaints: ["title", "details"], meetings: ["title", "place", "agenda", "minutes", "resolutions"], polls: ["question", "options"],
    maintenance_log: ["details"], gallery: ["title"], celebrations: ["details"], expenses: ["description", "remarks"],
    asset_service: ["details"], reminders: ["title"], action_items: ["task"] };
  window.KK_LOC = function (d) {
    if (!d || typeof d !== "object") return d;
    Object.keys(TEF).forEach(function (t) {
      var rows = d[t]; if (!Array.isArray(rows)) return;
      rows.forEach(function (r) {
        if (!r || !r.te) return;
        var te; try { te = typeof r.te === "string" ? JSON.parse(r.te) : r.te; } catch (e) { return; }
        if (!te || typeof te !== "object") return;
        if (!r._en) { r._en = {}; TEF[t].forEach(function (k) { r._en[k] = r[k]; }); }
        TEF[t].forEach(function (k) {
          if (k === "options") { r.options_te = L === "te" && te.options ? te.options : null; return; }
          r[k] = L === "te" && te[k] ? te[k] : r._en[k];
        });
      });
    });
    return d;
  };
  /* how many typed items still have no Telugu copy (the app then asks the server to make them, see teAsk in api.js) */
  window.KK_TEMISS = function (d) {
    if (L !== "te" || !d || typeof d !== "object") return 0;
    var n = 0;
    Object.keys(TEF).forEach(function (t) {
      (Array.isArray(d[t]) ? d[t] : []).forEach(function (r) {
        if (r && !r.te && !(r.id > 9e12) && TEF[t].some(function (k) { return /[A-Za-z]/.test(String(r[k] == null ? "" : r[k])); })) n++;
      });
    });
    return n;
  };
  /* poll answer as shown on screen (the vote itself still uses the English answer) */
  window.KK_OPT = function (q, o) {
    if (!q || !q.options_te) return o;
    var en = String(q.options).split("|"), te = String(q.options_te).split("|"), i = en.indexOf(o);
    return i >= 0 && te[i] ? te[i] : o;
  };

  /* Telugu: the wording list and the translator are a separate file, loaded only for Telugu (English phones never download it).
     __LANG_TE__ is replaced with the file name by the build. */
  if (L === "te") document.write('<script src="__LANG_TE__"><\/script>');
})();
