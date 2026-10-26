/* Page: Letter pad (Secretary only). Letters on the Association's letterhead: write, keep, edit, copy, print or save as PDF.
   The letterhead (titles, office bearers, members down the left side, logo, signature, Secretary stamp) is set once in "Letterhead details".
   Layout follows the Association's own letter: logo and name across the top, office bearers under the name, members down
   the left of page 1 behind a line, the letter on the right; from page 2 the letter uses the full width. */
let LP = null;
const LP_LOGO = "association-logo.jpg";
const LP_FONT = '"KK Bookman","Bookman Old Style","URW Bookman",Georgia,"KK Telugu",serif';
function lpFonts() {
  if (document.getElementById("lpff")) return;
  const s = document.createElement("style"); s.id = "lpff";
  s.textContent = '@font-face{font-family:"KK Bookman";font-weight:400;font-display:swap;src:url(fonts/bookman-Regular.woff2) format("woff2")}@font-face{font-family:"KK Bookman";font-weight:700;font-display:swap;src:url(fonts/bookman-Bold.woff2) format("woff2")}';
  document.head.appendChild(s);
}
const lpBlank = () => ({ title1: "KRISHNA KUTEER", title2: "APARTMENT ASSOCIATION", address: "", signer: "", designation: "Secretary", signoff: "Yours faithfully,",
  bearers: [{ role: "PRESIDENT", name: "" }, { role: "SECRETARY", name: "" }, { role: "TREASURER", name: "" }], side: [{ head: "EXECUTIVE MEMBER", names: [] }, { head: "MEMBERS", names: [] }], logo: "", sign: "", stamp: "" });
const lpNew = H => ({ id: 0, on_date: ld(), ref_no: "", to_text: "", subject: "", salutation: "Dear Sir/Madam,", body: "", closing: "Thank you for your cooperation.",
  signoff: H.signoff || "Yours faithfully,", signer: H.signer || "", designation: H.designation || "Secretary", sign: "yes", stamp: "yes" }); /* signature and stamp print as soon as they are uploaded; untick to leave them off */
const lpDate = d => /^\d{4}-\d{2}-\d{2}/.test(d || "") ? d.slice(8, 10) + "-" + d.slice(5, 7) + "-" + d.slice(0, 4) : "";
/* the letter text: a blank line starts a new paragraph, **words** print in bold */
const lpText = t => esc(t || "").replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>");
const lpBody = t => String(t || "").replace(/\r/g, "").split(/\n\s*\n/).map(p => p.trim() ? `<p>${lpText(p.trim()).replace(/\n/g, "<br>")}</p>` : "").join("");
/* the pictures one letter needs: logo, and the signature and stamp if ticked */
async function lpImgs(L, H) { const [logo, sig, stamp] = await Promise.all([lpImg(H.logo), L.sign === "yes" ? lpImg(H.sign) : "", L.stamp === "yes" ? lpImg(H.stamp) : ""]); return { logo, sig, stamp }; }
async function lpImg(id) { if (!id) return ""; LP.img = LP.img || {}; if (LP.img[id]) return LP.img[id]; const r = await api({ a: "photo", id }, 1); if (r.error) return ""; return LP.img[id] = r.img; }
/* page 1 is 297 mm tall; with 15 mm margins 267 mm can be used. The letterhead takes 44.5 mm and the left column 220 mm: the 2.5 mm
   left over is less than one line, so the letter continues at the top of page 2 at full width. */
const LP_CSS = `.pw{padding:0!important;background:#fff}
.lp{font-family:${LP_FONT};font-size:11.6pt;line-height:1.36;color:#111}
.lp b{font-weight:700}
.lph{height:44mm;display:flex;align-items:center;gap:3mm;overflow:hidden}
.lph img{width:37mm;height:37mm;object-fit:contain;flex:none}
.lpt{flex:1;min-width:0;text-align:center}
.lpt .t{font-weight:700;font-size:21.5pt;line-height:1.3;letter-spacing:.2pt}
.lpt .ad{font-size:9.5pt;margin-top:1mm}
.lpb{display:flex;justify-content:space-around;gap:3mm;margin-top:2.6mm;font-weight:700;font-size:11pt;line-height:1.3}
.lpb div{flex:1 1 0;min-width:0;text-align:center;overflow-wrap:break-word}.lpb .d{font-size:10pt}.lpb.n4{font-size:10pt;gap:2mm}.lpb.n4 .d{font-size:9pt}
.lpr{border-top:1.7px solid #111;margin:0}
.lps{float:left;width:51mm;height:220mm;border-right:1.7px solid #111;margin:0 6mm 0 0;padding:9mm 2mm 0 0;box-sizing:border-box;font-weight:700;font-size:10.4pt}
.lps .g{margin:0 0 9mm}.lps .gh{margin:0 0 6mm;padding-left:1mm}
.lps .n{margin:0 0 5.2mm;padding-left:6mm;position:relative}.lps .n:before{content:"❖";position:absolute;left:0;font-size:9pt;top:.3mm}
.lpm{padding-top:8mm}
.lpm .to{font-weight:700;margin-bottom:6mm}
.lpm .sj{font-weight:700;margin:0 0 6mm}
.lpm .sl{font-weight:700;margin:0}
.lpm p{margin:0 0 3.2mm;text-align:left}
.lpe{break-inside:avoid;page-break-inside:avoid;margin-top:5mm;overflow:hidden;clear:none}
.lpe .cl{padding-left:12mm;margin-bottom:2mm}
.lpe .row{display:flex;align-items:flex-end}
.lpe .st{width:46%;flex:none;text-align:center}
.lpe .st img{width:33mm;height:33mm;object-fit:contain;transform:rotate(-7deg);opacity:.92;margin:0 0 -2mm 10mm}
.lpe .sb{flex:1;font-weight:700}
.lpe .sb img{display:block;height:21mm;max-width:75mm;object-fit:contain;margin:0 0 -1mm -3mm}
.lpe .sp{height:13mm}`;
function lpHTML(L, H, I) {
  const logo = I.logo, sig = I.sig, stamp = I.stamp;
  const hb = (H.bearers || []).filter(p => p.role || p.name), side = (H.side || []).filter(g => g.head || (g.names || []).length);
  return `<style>${LP_CSS}</style><div class="lp"><div class="lph"><img src="${logo || LP_LOGO}" alt=""><div class="lpt"><div class="t">${esc(H.title1 || "")}</div>${H.title2 ? `<div class="t">${esc(H.title2)}</div>` : ""}${H.address ? `<div class="ad">${esc(H.address)}</div>` : ""}
   ${hb.length ? `<div class="lpb${hb.length > 3 ? " n4" : ""}">${hb.map(p => `<div>${esc(p.name || "")}${p.name && p.role ? "<br>" : ""}${p.role ? `<span class="d">${esc(p.role)}</span>` : ""}</div>`).join("")}</div>` : ""}</div></div><div class="lpr"></div>
   <div class="lps">${side.map(g => `<div class="g"><div class="gh">${esc(g.head)}</div>${(g.names || []).map(n => `<div class="n">${esc(n)}</div>`).join("")}</div>`).join("")}</div>
   <div class="lpm">${L.to_text ? `<div class="to">To,<br><br>${esc(L.to_text).replace(/\n/g, "<br>")}${L.on_date ? `<br>Date: ${lpDate(L.on_date)}` : ""}${L.ref_no ? `<br>Ref. No.: ${esc(L.ref_no)}` : ""}</div>` : L.on_date ? `<div class="to">Date: ${lpDate(L.on_date)}</div>` : ""}
   ${L.subject ? `<div class="sj">Subject: ${lpText(L.subject)}</div>` : ""}${L.salutation ? `<div class="sl">${esc(L.salutation)}</div>` : ""}${lpBody(L.body)}
   <div class="lpe">${L.closing ? `<div class="cl">${lpText(L.closing)}</div>` : ""}<div class="row"><div class="st">${L.stamp === "yes" && stamp ? `<img src="${stamp}" alt="">` : ""}</div><div class="sb">${L.sign === "yes" && sig ? `<img src="${sig}" alt="">` : `<div class="sp"></div>`}${esc(L.signoff || "")}<br>${esc(L.signer || "")}${L.designation ? `<br>${esc(L.designation)}` : ""}</div></div></div></div></div>`;
}
async function letters(m) {
  lpFonts();
  if (!LP) LP = { view: "list", img: {} };
  const r = await api({ a: "letters" }, 1);
  if (r.error) { m.innerHTML = `<div class="card"><p class="note">${esc(r.error.message)}</p></div>`; return; }
  LP.list = r.letters || []; if (!LP.headDirty) LP.head = Object.assign(lpBlank(), r.head || {});
  if (LP.view === "edit" && LP.cur) return lpEdit(m);
  if (LP.view === "head") return lpHeadView(m);
  lpList(m);
}
function lpList(m) {
  LP.view = "list"; LP.cur = null;
  const H = LP.head, empty = !(H.bearers || []).some(p => p.name) || !H.sign;
  m.innerHTML = `<div class="lpbar"><button type="button" id="lpnew">✍️ New letter</button><button type="button" class="ghost" id="lphd">🏷 Letterhead details</button></div>
   ${empty ? `<div class="card lpnote"><b>Set up the letterhead once</b><p class="note">Add the office bearers, members and your signature in <b>Letterhead details</b>. Every letter then prints with them.</p></div>` : ""}
   <h2>Letters · ${LP.list.length}</h2>${LP.list.length ? LP.list.map(L => `<div class="card lpi"><div class="lpit"><b>${esc(L.subject || "(no subject)")}</b><small>${esc(String(L.to_text || "").split("\n")[0] || "No recipient")} · ${esc(dmx(L.on_date))}</small></div>
    <div class="btnrow"><button type="button" class="ghost" data-lpo="${L.id}">Open</button><button type="button" class="ghost" data-lpp="${L.id}">📄 PDF</button><button type="button" class="ghost" data-lpw="${L.id}">📝 Word</button><button type="button" class="ghost" data-lpc="${L.id}">Copy</button><button type="button" class="ghost" data-lpd="${L.id}">Delete</button></div></div>`).join("")
    : `<div class="card"><p class="note">No letters yet. Tap <b>New letter</b> to write the first one.</p></div>`}`;
  $("#lpnew").onclick = () => { LP.cur = lpNew(LP.head); LP.dirty = false; LP.view = "edit"; lpEdit(m); };
  $("#lphd").onclick = () => { LP.view = "head"; lpHeadView(m); };
  const find = id => LP.list.find(x => String(x.id) === String(id));
  m.querySelectorAll("[data-lpo]").forEach(b => b.onclick = () => { LP.cur = Object.assign({}, find(b.dataset.lpo)); LP.dirty = false; LP.view = "edit"; lpEdit(m); });
  m.querySelectorAll("[data-lpc]").forEach(b => b.onclick = () => { const c = Object.assign({}, find(b.dataset.lpc), { id: 0, on_date: ld() }); c.subject = c.subject ? c.subject + " (copy)" : ""; LP.cur = c; LP.dirty = true; LP.view = "edit"; lpEdit(m); toast("Copied. Change what you need and save."); });
  m.querySelectorAll("[data-lpp]").forEach(b => b.onclick = () => lpPrint(find(b.dataset.lpp)));
  m.querySelectorAll("[data-lpw]").forEach(b => b.onclick = () => lpWord(find(b.dataset.lpw)));
  m.querySelectorAll("[data-lpd]").forEach(b => b.onclick = async () => { const L = find(b.dataset.lpd); if (!confirm("Delete the letter “" + (L.subject || "no subject") + "”?")) return;
    const r = await api({ a: "letterDelete", id: L.id }); if (r.error) return toast(r.error.message); toast("Letter deleted"); render(); });
}
async function lpPrint(L) {
  const H = LP.head; lpFonts();
  try { await Promise.all([document.fonts.load('400 12pt "KK Bookman"'), document.fonts.load('700 12pt "KK Bookman"')]); } catch (e) {}
  const I = await lpImgs(L, H);
  if (!I.logo) await new Promise(ok => { const i = new Image(); i.onload = i.onerror = ok; i.src = LP_LOGO; });
  printHTML((L.subject || "Letter").slice(0, 80), lpHTML(L, H, I), false, 15, true); /* no web address or date on the letter */
}
/* ---------- writing a letter ---------- */
const LP_F = [["on_date", "Date"], ["ref_no", "Ref. No. (optional)"], ["to_text", "To (name and address)"], ["subject", "Subject"], ["salutation", "Greeting"], ["body", "Letter"], ["closing", "Closing line"], ["signoff", "Sign-off"], ["signer", "Name under the signature"], ["designation", "Designation"]];
function lpEdit(m) {
  const L = LP.cur, H = LP.head, who = lpWho(H);
  if (!LP.headDirty) LP.headBak = JSON.stringify(H); /* to undo name changes that are not saved */
  const f = (k, l) => {
    const v = esc(L[k] ?? "");
    const c = k === "on_date" ? `<input id="lf_${k}" type="date" value="${v}">` : k === "to_text" ? `<textarea id="lf_${k}" rows="3" placeholder="SKYWARDS ELEVATORS&#10;Address (optional)">${v}</textarea>`
      : k === "body" ? `<div class="lptool"><button type="button" class="ghost" id="lpbold" title="Bold"><b>B</b> Bold</button><small>Blank line = new paragraph. Select words and tap Bold, or type **like this**.</small></div><textarea id="lf_${k}" rows="16" placeholder="For and on behalf of Krishna Kuteer Apartment Association, …">${v}</textarea>`
      : `<input id="lf_${k}" value="${v}" autocomplete="off">`;
    return `<div class="${["to_text", "subject", "body", "closing"].includes(k) ? "w" : ""}"><label class="fl" for="lf_${k}">${l}</label>${c}</div>`;
  };
  m.innerHTML = `<div class="lpbar"><button type="button" class="ghost" id="lpback">← All letters</button></div>
   <div class="lped"><div class="lpleft"><details class="card lpnames" id="lpnm"${who ? "" : " open"}><summary><b>👥 Names and designations</b><small id="lpwho">${who ? esc(who) : "Not filled in yet: add the office bearers' names"}</small></summary>
    <p class="note">Printed at the top and down the left side of every letter. When a new Association body takes over, change them here; 💾 Save keeps them for all letters.</p>${lpNamesHTML(H, "ln_")}
    <div class="btnrow"><button type="button" class="ghost" id="lpnsave">💾 Save names</button></div></details><div class="card lpform"><h3 style="margin:0 0 6px">${L.id ? "Edit letter" : "New letter"}</h3><div class="f">${LP_F.map(([k, l]) => f(k, l)).join("")}
</div>
    <div class="btnrow lpacts"><button type="button" id="lpsave">💾 Save</button><button type="button" class="ghost" id="lppr">📄 Print / Save as PDF</button><button type="button" class="ghost" id="lpwd">📝 Download Word file</button></div></div></div>
   <div class="lpprev"><div class="lpph"><b>Preview</b><small>Page 1 ends at the dashed line</small></div>
    <div class="lpadd">${H.sign ? `<label class="lpchk"><input type="checkbox" id="lf_sign"${L.sign === "yes" ? " checked" : ""}> Signature</label>` : `<button type="button" class="ghost" id="lpaddsg">➕ Add your signature</button>`}${H.stamp ? `<label class="lpchk"><input type="checkbox" id="lf_stamp"${L.stamp === "yes" ? " checked" : ""}> Stamp</label>` : `<button type="button" class="ghost" id="lpaddst">➕ Add the stamp</button>`}</div><div class="lpsheet" id="lpsheet"></div></div></div>`;
  const grab = () => { LP_F.forEach(([k]) => { L[k] = $("#lf_" + k).value; }); const cs = $("#lf_sign"), ct = $("#lf_stamp"); if (cs) L.sign = cs.checked ? "yes" : "no"; if (ct) L.stamp = ct.checked ? "yes" : "no"; };
  let t = null; const upd = () => { grab(); LP.dirty = true; clearTimeout(t); t = setTimeout(lpPreview, 250); };
  m.querySelectorAll(".lpform input,.lpform textarea").forEach(el => { el.oninput = upd; el.onchange = upd; });
  m.querySelectorAll(".lpadd input").forEach(el => { el.onchange = upd; });
  const toHead = () => { grab(); LP.ret = true; LP.view = "head"; lpHeadView(m); }; /* upload, then come straight back to this letter */
  if ($("#lpaddsg")) $("#lpaddsg").onclick = toHead; if ($("#lpaddst")) $("#lpaddst").onclick = toHead;
  const updN = () => { lpNamesRead(LP.head, "ln_"); LP.headDirty = true; const w = lpWho(LP.head); $("#lpwho").textContent = w || "Not filled in yet: add the office bearers' names"; clearTimeout(t); t = setTimeout(lpPreview, 250); };
  m.querySelectorAll(".lpnames input,.lpnames textarea").forEach(el => { el.oninput = updN; });
  const saveNames = async () => { if (!LP.headDirty) return true; const r = await api({ a: "letterheadSave", head: LP.head }); if (r.error) { toast(r.error.message); return false; }
    LP.head = Object.assign(lpBlank(), r.head); LP.headBak = JSON.stringify(LP.head); LP.headDirty = false; return true; };
  $("#lpnsave").onclick = async () => { if (!LP.headDirty) return toast("The names are already saved"); if (await saveNames()) toast("Names saved. Every letter now prints them."); };
  $("#lpbold").onclick = () => { const ta = $("#lf_body"), a = ta.selectionStart, b = ta.selectionEnd; if (a === b) { toast("Select the words to make bold first"); return; }
    ta.setRangeText("**" + ta.value.slice(a, b).replace(/\*\*/g, "") + "**", a, b, "end"); ta.focus(); upd(); };
  $("#lpback").onclick = () => { if ((LP.dirty || LP.headDirty) && !confirm(LP.dirty ? "Leave without saving this letter?" : "Leave without saving the names?")) return;
    if (LP.headDirty) { LP.head = Object.assign(lpBlank(), JSON.parse(LP.headBak)); LP.headDirty = false; } LP.dirty = false; lpList(m); };
  $("#lpsave").onclick = async () => { grab(); if (!(await saveNames())) return; const r = await api({ a: "letterSave", letter: L }); if (r.error) return toast(r.error.message); L.id = r.id; LP.dirty = false; toast("Letter saved");
    const i = LP.list.findIndex(x => String(x.id) === String(r.id)); if (i >= 0) LP.list[i] = Object.assign({}, L); else LP.list.unshift(Object.assign({}, L)); const h3 = $(".lpform h3"); if (h3) h3.textContent = "Edit letter"; };
  $("#lppr").onclick = () => { grab(); lpPrint(L); };
  $("#lpwd").onclick = () => { grab(); lpWord(L); };
  lpPreview();
}
async function lpPreview() {
  const box = $("#lpsheet"); if (!box || !LP.cur) return;
  const H = LP.head, L = LP.cur, I = await lpImgs(L, H);
  if (!$("#lpsheet")) return;
  const root = box.shadowRoot || box.attachShadow({ mode: "open" });
  root.innerHTML = `<style>:host{display:block}.pg{width:210mm;padding:15mm;background:#fff;box-sizing:border-box;position:relative;min-height:297mm}.cut{position:absolute;left:0;right:0;top:282mm;border-top:2px dashed #e0681b}.cut span{position:absolute;right:0;width:15mm;text-align:center;top:1mm;font:600 8pt system-ui,sans-serif;color:#c2410c}</style>
   <div class="pg"><div class="pw">${lpHTML(L, H, I)}</div><div class="cut"><span>page 2 ↓</span></div></div>`;
  const fit = () => { const pg = root.querySelector(".pg"); if (!pg) return; const z = box.clientWidth / pg.offsetWidth; pg.style.zoom = Math.min(1, z); };
  fit(); if (!LP.ro && window.ResizeObserver) { LP.ro = new ResizeObserver(() => { const b = $("#lpsheet"); if (b && b.shadowRoot) { const pg = b.shadowRoot.querySelector(".pg"); if (pg) { pg.style.zoom = 1; pg.style.zoom = Math.min(1, b.clientWidth / pg.offsetWidth); } } }); }
  if (LP.ro) { LP.ro.disconnect(); LP.ro.observe(box); }
}
/* ---------- names and designations on the letterhead ----------
   Office bearers under the Association name (name, designation under it) and up to three groups down the left side of page 1.
   The same fields are in Letterhead details and, folded, at the top of every letter, so a new Association body is a quick change. */
function lpNamesHTML(H, p) {
  const bear = (H.bearers || []).concat([{}, {}, {}, {}]).slice(0, 4), side = (H.side || []).concat([{}, {}, {}]).slice(0, 3);
  return `<h4 class="lpnh">Office bearers <small>(under the Association name)</small></h4><div class="f">${bear.map((b, i) => fld("Name " + (i + 1), inp(p + "bn" + i, b.name || "", 'placeholder="Full name" autocomplete="off"')) + fld("Designation " + (i + 1), inp(p + "br" + i, b.role || "", 'placeholder="e.g. PRESIDENT" autocomplete="off"'))).join("")}</div>
   <h4 class="lpnh">Left side of page 1</h4><div class="f">${side.map((g, i) => fld("Heading " + (i + 1), inp(p + "sh" + i, g.head || "", 'placeholder="e.g. EXECUTIVE MEMBERS" autocomplete="off"'), 1) + `<div class="w"><label class="fl" for="${p}sl${i}">Names under heading ${i + 1}, one per line</label><textarea id="${p}sl${i}" rows="${Math.max(3, (g.names || []).length + 1)}">${esc((g.names || []).join("\n"))}</textarea></div>`).join("")}</div>`;
}
function lpNamesRead(H, p) {
  H.bearers = [0, 1, 2, 3].map(i => ({ name: val(p + "bn" + i), role: val(p + "br" + i) })).filter(b => b.role || b.name);
  H.side = [0, 1, 2].map(i => { const t = $("#" + p + "sl" + i); return { head: val(p + "sh" + i), names: String(t ? t.value : "").split("\n").map(x => x.trim()).filter(Boolean) }; }).filter(g => g.head || g.names.length);
}
const lpWho = H => (H.bearers || []).filter(b => b.name).map(b => b.name + (b.role ? " (" + b.role + ")" : "")).join(", ");
/* ---------- letterhead details ---------- */
async function lpPick(kind) {
  document.querySelectorAll("input.lppick").forEach(x => x.remove()); /* kept in the page while the phone's picker is open (the Android app needs that) */
  return new Promise(ok => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.className = "lppick"; i.hidden = true; document.body.appendChild(i); i.onchange = async () => {
    const f = i.files[0]; i.remove(); if (!f) return ok(null);
    try { const bm = await createImageBitmap(f), max = kind === "sign" ? 900 : 600, s = Math.min(1, max / Math.max(bm.width, bm.height)), c = document.createElement("canvas");
      c.width = Math.round(bm.width * s); c.height = Math.round(bm.height * s); const x = c.getContext("2d"); x.drawImage(bm, 0, 0, c.width, c.height);
      if (kind === "stamp") { /* stamp: keep only the coloured ink (blue, violet, red...); white paper, black or grey background becomes see-through */
        const d = x.getImageData(0, 0, c.width, c.height), p = d.data; let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
        for (let k = 0; k < p.length; k += 4) { const mx = Math.max(p[k], p[k + 1], p[k + 2]), mn = Math.min(p[k], p[k + 1], p[k + 2]), a = Math.max(0, Math.min(255, ((mx - mn) - 35) * 255 / 110)) * p[k + 3] / 255;
          p[k + 3] = a; if (a > 40) { const n = k / 4, xx = n % c.width, yy = (n / c.width) | 0; if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; } }
        x.putImageData(d, 0, 0); if (x1 <= x0) { toast("No stamp found in this picture"); return ok(null); }
        const t = document.createElement("canvas"); t.width = x1 - x0 + 4; t.height = y1 - y0 + 4; t.getContext("2d").drawImage(c, x0 - 2, y0 - 2, t.width, t.height, 0, 0, t.width, t.height);
        return ok(t.toDataURL("image/png")); }
      if (kind === "sign") { /* signature on white paper: the paper becomes see-through and the picture is trimmed to the ink */
        const d = x.getImageData(0, 0, c.width, c.height), p = d.data; let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
        for (let k = 0; k < p.length; k += 4) { const l = p[k] * .3 + p[k + 1] * .59 + p[k + 2] * .11; if (l > 175) p[k + 3] = 0; else { const n = k / 4, xx = n % c.width, yy = (n / c.width) | 0; if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; } }
        x.putImageData(d, 0, 0); if (x1 <= x0) { toast("No signature found in this picture"); return ok(null); }
        const t = document.createElement("canvas"); t.width = x1 - x0 + 12; t.height = y1 - y0 + 12; t.getContext("2d").drawImage(c, x0 - 6, y0 - 6, t.width, t.height, 0, 0, t.width, t.height);
        return ok(t.toDataURL("image/png")); }
      ok(c.toDataURL("image/jpeg", .9)); } catch (e) { toast("This picture can't be opened. Use a JPG or PNG."); ok(null); } };
    i.click(); });
}
async function lpHeadView(m) {
  LP.view = "head"; const H = JSON.parse(JSON.stringify(LP.head)), [logo, sig, stamp] = await Promise.all([lpImg(H.logo), lpImg(H.sign), lpImg(H.stamp)]);
  const back = LP.ret && LP.cur;
  m.innerHTML = `<div class="lpbar"><button type="button" class="ghost" id="lpback">${back ? "← Back to the letter" : "← All letters"}</button></div>
   <h2>Letterhead details</h2><p class="note">Printed on every letter. When a new Association body takes over, change the names here.</p>
   <div class="card"><h3>Name at the top</h3><div class="f">${fld("Line 1", inp("lh_t1", H.title1), 1)}${fld("Line 2", inp("lh_t2", H.title2), 1)}${fld("Address or phone (optional, small line)", inp("lh_ad", H.address), 1)}</div></div>
   <div class="card lpnames"><h3>Names and designations</h3>${lpNamesHTML(H, "lh_")}</div>
   <div class="card"><h3>Logo</h3><div class="lpimg"><img src="${logo || LP_LOGO}" alt="Logo"><div class="btnrow"><button type="button" class="ghost" id="lh_lg">Change logo</button>${H.logo ? `<button type="button" class="ghost" id="lh_lgd">Use the standard logo</button>` : ""}</div></div></div>
   <div class="card"><h3>Signature</h3><p class="note">Sign on plain white paper and take a clear photo. The paper is removed automatically. It is kept private: only the Secretary login can use it.</p>
    <div class="lpimg">${sig ? `<img src="${sig}" alt="Signature" class="sg">` : `<span class="note">No signature yet.</span>`}<div class="btnrow"><button type="button" class="ghost" id="lh_sg">${sig ? "Change signature" : "Upload signature"}</button>${sig ? `<button type="button" class="ghost" id="lh_sgd">Remove</button>` : ""}</div></div>
    <div class="f">${fld("Sign-off", inp("lh_so", H.signoff, 'placeholder="Yours faithfully,"'))}${fld("Name under the signature", inp("lh_sn", H.signer, 'placeholder="Full name"'))}${fld("Designation", inp("lh_ds", H.designation))}</div></div>
   <div class="card"><h3>Secretary stamp</h3><p class="note">A photo or scan of the stamp. Only the stamp's ink is kept (the paper or background is removed). Private: only the Secretary login can use it.</p>
    <div class="lpimg">${stamp ? `<img src="${stamp}" alt="Stamp" class="stp">` : `<span class="note">No stamp yet.</span>`}<div class="btnrow"><button type="button" class="ghost" id="lh_st">${stamp ? "Change stamp" : "Upload stamp"}</button>${stamp ? `<button type="button" class="ghost" id="lh_std">Remove</button>` : ""}</div></div></div>
   <div class="btnrow"><button type="button" id="lh_save">💾 Save letterhead</button></div>`;
  const read = () => { H.title1 = val("lh_t1"); H.title2 = val("lh_t2"); H.address = val("lh_ad"); H.signoff = val("lh_so"); H.signer = val("lh_sn"); H.designation = val("lh_ds");
    lpNamesRead(H, "lh_"); };
  const save = async () => { read(); const r = await api({ a: "letterheadSave", head: H }); if (r.error) { toast(r.error.message); return false; } LP.head = Object.assign(lpBlank(), r.head); LP.headBak = JSON.stringify(LP.head); LP.headDirty = false; toast("Letterhead saved"); return true; };
  const done = () => { const b = LP.ret && LP.cur; LP.ret = false; if (b) { LP.view = "edit"; lpEdit(m); } else lpList(m); };
  const up = async (kind) => { const d = await lpPick(kind); if (!d) return; const r = await api({ a: "upload", kind: "letter", img: d }); if (r.error) return toast(r.error.message);
    LP.img[r.id] = d; read(); H[kind] = r.id; LP.head = H; if (await save()) { if (LP.cur && (kind === "sign" || kind === "stamp")) LP.cur[kind] = "yes"; lpHeadView(m); } };
  $("#lpback").onclick = done;
  $("#lh_save").onclick = async () => { if (await save()) done(); };
  $("#lh_lg").onclick = () => up("logo"); $("#lh_sg").onclick = () => up("sign"); $("#lh_st").onclick = () => up("stamp");
  if ($("#lh_std")) $("#lh_std").onclick = async () => { if (!confirm("Remove the stamp from the letterhead?")) return; read(); H.stamp = ""; LP.head = H; if (await save()) lpHeadView(m); };
  if ($("#lh_lgd")) $("#lh_lgd").onclick = async () => { read(); H.logo = ""; LP.head = H; if (await save()) lpHeadView(m); };
  if ($("#lh_sgd")) $("#lh_sgd").onclick = async () => { if (!confirm("Remove your signature from the letterhead?")) return; read(); H.sign = ""; LP.head = H; if (await save()) lpHeadView(m); };
}
/* ---------- Word (.docx) ----------
   The same letter as a Word file, built here on the phone (no server). Page 1's letterhead is Word's "first page header",
   so it is not repeated on page 2; the members' list is a text box on page 1 with a line on its right, and the letter
   flows beside it and then over the full width of page 2, as in the printed letter. */
const LPX_CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function lpxCrc(u) { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = LPX_CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
/* a plain (stored) zip: what a .docx file is */
function lpxZip(files, type) {
  const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
  files.forEach(f => {
    const nm = enc.encode(f.name), d = typeof f.data === "string" ? enc.encode(f.data) : f.data, crc = lpxCrc(d), h = new DataView(new ArrayBuffer(30)), c = new DataView(new ArrayBuffer(46));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, 0, 2], [12, 0x21, 2], [14, crc, 4], [18, d.length, 4], [22, d.length, 4], [26, nm.length, 2], [28, 0, 2]].forEach(([o, v, n]) => n === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, 0, 2], [14, 0x21, 2], [16, crc, 4], [20, d.length, 4], [24, d.length, 4], [28, nm.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, off, 4]].forEach(([o, v, n]) => n === 4 ? c.setUint32(o, v, true) : c.setUint16(o, v, true));
    parts.push(new Uint8Array(h.buffer), nm, d); cen.push(new Uint8Array(c.buffer), nm); off += 30 + nm.length + d.length;
  });
  const cs = cen.reduce((a, x) => a + x.length, 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
  return new Blob(parts.concat(cen, [new Uint8Array(e.buffer)]), { type });
}
async function lpxBytes(src) {
  if (!src) return null;
  const b = await (await fetch(src)).blob(), bm = await createImageBitmap(b), u = new Uint8Array(await b.arrayBuffer());
  return { data: u, ext: /png/.test(b.type) ? "png" : "jpeg", w: bm.width, h: bm.height };
}
const lpxEsc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
const LPX_MM = 56.7, LPX_EMU = 36000;
/* one run of text; **bold** inside the text becomes bold */
function lpxRuns(t, o = {}) {
  const rp = b => `<w:rPr>${b || o.b ? "<w:b/><w:bCs/>" : ""}${o.sz ? `<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>` : ""}</w:rPr>`;
  return String(t || "").split("\n").map((line, i) => (i ? "<w:r><w:br/></w:r>" : "") + line.split(/(\*\*[^*\n]+\*\*)/).filter(Boolean).map(x => { const b = /^\*\*.*\*\*$/.test(x); return `<w:r>${rp(b)}<w:t xml:space="preserve">${lpxEsc(b ? x.slice(2, -2) : x)}</w:t></w:r>`; }).join("")).join("");
}
const lpxP = (runs, pp = "") => `<w:p><w:pPr>${pp}</w:pPr>${runs}</w:p>`;
const lpxSp = (before, after) => `<w:spacing w:before="${Math.round(before * LPX_MM)}" w:after="${Math.round(after * LPX_MM)}"/>`;
function lpxPic(rid, id, name, wmm, hmm) {
  const cx = Math.round(wmm * LPX_EMU), cy = Math.round(hmm * LPX_EMU);
  return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="${name}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>
   <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${id}" name="${name}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
   <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}
const LPX_NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w10="urn:schemas-microsoft-com:office:word" mc:Ignorable="wps"';
const LPX_NOB = '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>';
function lpxDoc(L, H, logo, sig, stamp) {
  const TW = 180; /* text width in mm: A4 210 mm minus 15 mm margins each side */
  const bear = (H.bearers || []).filter(p => p.role || p.name), side = (H.side || []).filter(g => g.head || (g.names || []).length);
  /* first-page header: logo | name and office bearers, then the line */
  const tcell = (w, inner, va = "center") => `<w:tc><w:tcPr><w:tcW w:w="${Math.round(w * LPX_MM)}" w:type="dxa"/><w:vAlign w:val="${va}"/></w:tcPr>${inner}</w:tc>`;
  const bTab = bear.length ? `<w:tbl><w:tblPr><w:tblW w:w="${Math.round(138 * LPX_MM)}" w:type="dxa"/><w:jc w:val="center"/>${LPX_NOB}<w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${bear.map(() => `<w:gridCol w:w="${Math.round(138 / bear.length * LPX_MM)}"/>`).join("")}</w:tblGrid>
    <w:tr>${bear.map(p => tcell(138 / bear.length, lpxP(lpxRuns(p.name || "", { b: 1, sz: bear.length > 3 ? 20 : 22 }) + (p.name && p.role ? "<w:r><w:br/></w:r>" : "") + lpxRuns(p.role || "", { b: 1, sz: bear.length > 3 ? 18 : 20 }), '<w:spacing w:before="100" w:after="0" w:line="270" w:lineRule="exact"/><w:jc w:val="center"/>'))).join("")}</w:tr></w:tbl>` : "";
  const TL = '<w:spacing w:after="0" w:line="540" w:lineRule="exact"/><w:jc w:val="center"/>', titles = lpxP(lpxRuns(H.title1 || "", { b: 1, sz: 43 }), TL) + (H.title2 ? lpxP(lpxRuns(H.title2, { b: 1, sz: 43 }), TL) : "") + (H.address ? lpxP(lpxRuns(H.address, { sz: 19 }), '<w:spacing w:after="0" w:line="250" w:lineRule="exact"/><w:jc w:val="center"/>') : "");
  const hdr1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ${LPX_NS}><w:tbl><w:tblPr><w:tblW w:w="${Math.round(TW * LPX_MM)}" w:type="dxa"/>${LPX_NOB}<w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr>
   <w:tblGrid><w:gridCol w:w="${Math.round(40 * LPX_MM)}"/><w:gridCol w:w="${Math.round((TW - 40) * LPX_MM)}"/></w:tblGrid><w:tr><w:trPr><w:trHeight w:val="${Math.round(43 * LPX_MM)}" w:hRule="exact"/></w:trPr>
   ${tcell(40, lpxP(lpxPic("rId1", 1, "Logo", 37, 37 * (logo ? logo.h / logo.w : 1)), '<w:spacing w:after="0"/>'))}${tcell(TW - 40, titles + bTab + lpxP("", '<w:spacing w:after="0"/>'))}</w:tr></w:tbl>
   ${lpxP("", '<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="1" w:color="111111"/></w:pBdr><w:spacing w:before="0" w:after="0" w:line="120" w:lineRule="exact"/>')}</w:hdr>`;
  const hdr2 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ${LPX_NS}>${lpxP("")}</w:hdr>`;
  /* members' text box on page 1 (a one-cell table inside it draws the line on its right, down to the bottom of page 1) */
  const SW = 51, SH = 222;
  const sideBody = side.map(g => lpxP(lpxRuns(g.head, { b: 1, sz: 21 }), lpxSp(0, 6)) + (g.names || []).map(n => `<w:p><w:pPr>${lpxSp(0, 5)}<w:ind w:left="${Math.round(6 * LPX_MM)}" w:hanging="${Math.round(6 * LPX_MM)}"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Segoe UI Symbol" w:hAnsi="Segoe UI Symbol"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">❖</w:t></w:r><w:r><w:tab/></w:r>${lpxRuns(n, { b: 1, sz: 21 })}</w:p>`).join("") + lpxP("", lpxSp(0, 3))).join("");
  const sideTbl = `<w:tbl><w:tblPr><w:tblW w:w="${Math.round(SW * LPX_MM)}" w:type="dxa"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="single" w:sz="12" w:space="0" w:color="111111"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="${Math.round(2 * LPX_MM)}" w:type="dxa"/></w:tblCellMar></w:tblPr>
   <w:tblGrid><w:gridCol w:w="${Math.round(SW * LPX_MM)}"/></w:tblGrid><w:tr><w:trPr><w:trHeight w:val="${Math.round(SH * LPX_MM)}" w:hRule="exact"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="${Math.round(SW * LPX_MM)}" w:type="dxa"/></w:tcPr>${lpxP("", lpxSp(4, 0))}${sideBody || lpxP("")}</w:tc></w:tr></w:tbl>${lpxP("", '<w:spacing w:after="0"/>')}`;
  const cx = Math.round(SW * LPX_EMU), cy = Math.round(SH * LPX_EMU);
  const box = side.length ? `<w:r><mc:AlternateContent><mc:Choice Requires="wps"><w:drawing><wp:anchor distT="0" distB="0" distL="0" distR="${Math.round(6 * LPX_EMU)}" simplePos="0" relativeHeight="251659264" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1">
   <wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="margin"><wp:posOffset>0</wp:posOffset></wp:positionH><wp:positionV relativeFrom="paragraph"><wp:posOffset>0</wp:posOffset></wp:positionV><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapSquare wrapText="right"/><wp:docPr id="2" name="Members"/><wp:cNvGraphicFramePr/>
   <a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"><wps:wsp><wps:cNvSpPr txBox="1"/><wps:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></wps:spPr>
   <wps:txbx><w:txbxContent>${sideTbl}</w:txbxContent></wps:txbx><wps:bodyPr rot="0" vert="horz" wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" anchor="t" anchorCtr="0"><a:noAutofit/></wps:bodyPr></wps:wsp></a:graphicData></a:graphic></wp:anchor></w:drawing></mc:Choice>
   <mc:Fallback><w:pict><v:shape id="Members" o:spid="_x0000_s1026" type="#_x0000_t202" style="position:absolute;margin-left:0;margin-top:0;width:${SW}mm;height:${SH}mm;z-index:251659264;mso-position-horizontal-relative:margin;mso-position-vertical-relative:text" filled="f" stroked="f" xmlns:o="urn:schemas-microsoft-com:office:office"><v:textbox inset="0,0,0,0"><w:txbxContent>${sideTbl}</w:txbxContent></v:textbox><w10:wrap type="square" side="right"/></v:shape></w:pict></mc:Fallback></mc:AlternateContent></w:r>` : "";
  /* the letter */
  const B = [], bold = { b: 1 };
  const toLines = (L.to_text ? "To,\n\n" + L.to_text : "") + (L.on_date ? (L.to_text ? "\n" : "") + "Date: " + lpDate(L.on_date) : "") + (L.ref_no ? "\nRef. No.: " + L.ref_no : "");
  B.push(`<w:p><w:pPr>${lpxSp(8, 6)}</w:pPr>${box}${lpxRuns(toLines, bold)}</w:p>`);
  if (L.subject) B.push(lpxP(lpxRuns("Subject: " + L.subject, bold), lpxSp(0, 6)));
  if (L.salutation) B.push(lpxP(lpxRuns(L.salutation, bold), lpxSp(0, 0)));
  String(L.body || "").replace(/\r/g, "").split(/\n\s*\n/).forEach(p => { if (p.trim()) B.push(lpxP(lpxRuns(p.trim()), lpxSp(0, 3.2))); });
  const keep = "<w:keepNext/><w:keepLines/>", ind = `<w:ind w:left="${Math.round(TW * 0.46 * LPX_MM)}"/>`;
  if (L.closing) B.push(lpxP(lpxRuns(L.closing), keep + lpxSp(5, 2) + `<w:ind w:left="${Math.round(12 * LPX_MM)}"/>`));
  /* stamp (left) and signature with the name (right), kept together on one page */
  const sh = 21, sw = sig ? Math.min(75, sh * sig.w / sig.h) : 0, useSig = L.sign === "yes" && sig, useSt = L.stamp === "yes" && stamp, c1 = TW * 0.46;
  const stCell = useSt ? lpxP(lpxPic("rId21", 4, "Stamp", 33, 33 * stamp.h / stamp.w), '<w:spacing w:after="0"/><w:jc w:val="center"/>') : lpxP("");
  const sgCell = (useSig ? lpxP(lpxPic("rId20", 3, "Signature", sw, sw * sig.h / sig.w), lpxSp(0, 0)) : lpxP("", lpxSp(13, 0))) + lpxP(lpxRuns([L.signoff, L.signer, L.designation].filter(Boolean).join("\n"), bold), lpxSp(0, 0));
  B.push(`<w:tbl><w:tblPr><w:tblW w:w="${Math.round(TW * LPX_MM)}" w:type="dxa"/>${LPX_NOB}<w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="${Math.round(c1 * LPX_MM)}"/><w:gridCol w:w="${Math.round((TW - c1) * LPX_MM)}"/></w:tblGrid>
   <w:tr><w:trPr><w:cantSplit/></w:trPr>${tcell(c1, stCell, "bottom")}${tcell(TW - c1, sgCell, "bottom")}</w:tr></w:tbl>`, lpxP(""));
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${LPX_NS}><w:body>${B.join("")}
   <w:sectPr><w:headerReference w:type="default" r:id="rId11"/><w:headerReference w:type="first" r:id="rId10"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850" w:header="567" w:footer="567" w:gutter="0"/><w:titlePg/></w:sectPr></w:body></w:document>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Bookman Old Style" w:hAnsi="Bookman Old Style" w:eastAsia="Bookman Old Style" w:cs="Gautami"/><w:color w:val="111111"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:lang w:val="en-IN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="313" w:lineRule="atLeast"/></w:pPr></w:pPrDefault></w:docDefaults>
   <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>`;
  const settings = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:defaultTabStop w:val="340"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`;
  const rel = (id, type, target) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${target}"/>`;
  const files = [
    { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
      <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/header2.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/></Types>` },
    { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rel("rId1", "officeDocument", "word/document.xml")}</Relationships>` },
    { name: "word/document.xml", data: doc }, { name: "word/styles.xml", data: styles }, { name: "word/settings.xml", data: settings },
    { name: "word/header1.xml", data: hdr1 }, { name: "word/header2.xml", data: hdr2 },
    { name: "word/_rels/document.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rel("rId1", "styles", "styles.xml")}${rel("rId2", "settings", "settings.xml")}${rel("rId10", "header", "header1.xml")}${rel("rId11", "header", "header2.xml")}${L.sign === "yes" && sig ? rel("rId20", "image", "media/sign." + sig.ext) : ""}${L.stamp === "yes" && stamp ? rel("rId21", "image", "media/stamp." + stamp.ext) : ""}</Relationships>` },
    { name: "word/_rels/header1.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rel("rId1", "image", "media/logo." + logo.ext)}</Relationships>` },
    { name: "word/media/logo." + logo.ext, data: logo.data }];
  if (L.sign === "yes" && sig) files.push({ name: "word/media/sign." + sig.ext, data: sig.data });
  if (L.stamp === "yes" && stamp) files.push({ name: "word/media/stamp." + stamp.ext, data: stamp.data });
  return lpxZip(files, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}
async function lpWord(L) {
  const H = LP.head;
  try {
    const I = await lpImgs(L, H);
    const [logo, sig, stamp] = await Promise.all([lpxBytes(I.logo || LP_LOGO), I.sig ? lpxBytes(I.sig) : null, I.stamp ? lpxBytes(I.stamp) : null]);
    const blob = lpxDoc(L, H, logo, sig, stamp), nm = ((L.subject || "Letter").replace(/[^\w\s()&.,-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 60) || "Letter") + " " + lpDate(L.on_date) + ".docx";
    await saveFile(nm, blob);
  } catch (e) { toast("Could not make the Word file"); }
}
