/* Page: Letter pad (Secretary only). Letters on the Association's letterhead: write, keep, edit, copy, print or save as PDF.
   The letterhead (titles, office bearers, members down the left side, logo, signature) is set once in "Letterhead details".
   Layout follows the Association's own letter: logo and name across the top, office bearers under the name, members down
   the left of page 1 behind a line, the letter on the right; from page 2 the letter uses the full width. */
let LP = null;
const LP_LOGO = "letterhead-logo.jpg";
const LP_FONT = '"KK Bookman","Bookman Old Style","URW Bookman",Georgia,"KK Telugu",serif';
function lpFonts() {
  if (document.getElementById("lpff")) return;
  const s = document.createElement("style"); s.id = "lpff";
  s.textContent = '@font-face{font-family:"KK Bookman";font-weight:400;font-display:swap;src:url(fonts/bookman-Regular.woff2) format("woff2")}@font-face{font-family:"KK Bookman";font-weight:700;font-display:swap;src:url(fonts/bookman-Bold.woff2) format("woff2")}';
  document.head.appendChild(s);
}
const lpBlank = () => ({ title1: "KRISHNA KUTEER", title2: "APARTMENT ASSOCIATION", address: "", signer: "", designation: "Secretary", signoff: "Yours faithfully,",
  bearers: [{ role: "PRESIDENT", name: "" }, { role: "SECRETARY", name: "" }, { role: "TREASURER", name: "" }], side: [{ head: "EXECUTIVE MEMBER", names: [] }, { head: "MEMBERS", names: [] }], logo: "", sign: "" });
const lpNew = H => ({ id: 0, on_date: ld(), ref_no: "", to_text: "", subject: "", salutation: "Dear Sir/Madam,", body: "", closing: "Thank you for your cooperation.",
  signoff: H.signoff || "Yours faithfully,", signer: H.signer || "", designation: H.designation || "Secretary", sign: H.sign ? "yes" : "no" });
const lpDate = d => /^\d{4}-\d{2}-\d{2}/.test(d || "") ? d.slice(8, 10) + "-" + d.slice(5, 7) + "-" + d.slice(0, 4) : "";
/* the letter text: a blank line starts a new paragraph, **words** print in bold */
const lpText = t => esc(t || "").replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>");
const lpBody = t => String(t || "").replace(/\r/g, "").split(/\n\s*\n/).map(p => p.trim() ? `<p>${lpText(p.trim()).replace(/\n/g, "<br>")}</p>` : "").join("");
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
.lpb div{text-align:left}
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
.lpe .sb{margin-left:46%;font-weight:700}
.lpe .sb img{display:block;height:21mm;max-width:75mm;object-fit:contain;margin:0 0 -1mm -3mm}
.lpe .sp{height:13mm}`;
function lpHTML(L, H, logo, sig) {
  const hb = (H.bearers || []).filter(p => p.role || p.name), side = (H.side || []).filter(g => g.head || (g.names || []).length);
  return `<style>${LP_CSS}</style><div class="lp"><div class="lph"><img src="${logo || LP_LOGO}" alt=""><div class="lpt"><div class="t">${esc(H.title1 || "")}</div>${H.title2 ? `<div class="t">${esc(H.title2)}</div>` : ""}${H.address ? `<div class="ad">${esc(H.address)}</div>` : ""}
   ${hb.length ? `<div class="lpb">${hb.map(p => `<div>${esc(p.role)}<br>${esc(p.name)}</div>`).join("")}</div>` : ""}</div></div><div class="lpr"></div>
   <div class="lps">${side.map(g => `<div class="g"><div class="gh">${esc(g.head)}</div>${(g.names || []).map(n => `<div class="n">${esc(n)}</div>`).join("")}</div>`).join("")}</div>
   <div class="lpm">${L.to_text ? `<div class="to">To,<br><br>${esc(L.to_text).replace(/\n/g, "<br>")}${L.on_date ? `<br>Date: ${lpDate(L.on_date)}` : ""}${L.ref_no ? `<br>Ref. No.: ${esc(L.ref_no)}` : ""}</div>` : L.on_date ? `<div class="to">Date: ${lpDate(L.on_date)}</div>` : ""}
   ${L.subject ? `<div class="sj">Subject: ${lpText(L.subject)}</div>` : ""}${L.salutation ? `<div class="sl">${esc(L.salutation)}</div>` : ""}${lpBody(L.body)}
   <div class="lpe">${L.closing ? `<div class="cl">${lpText(L.closing)}</div>` : ""}<div class="sb">${L.sign === "yes" && sig ? `<img src="${sig}" alt="">` : `<div class="sp"></div>`}${esc(L.signoff || "")}<br>${esc(L.signer || "")}${L.designation ? `<br>${esc(L.designation)}` : ""}</div></div></div></div>`;
}
async function letters(m) {
  lpFonts();
  if (!LP) LP = { view: "list", img: {} };
  const r = await api({ a: "letters" }, 1);
  if (r.error) { m.innerHTML = `<div class="card"><p class="note">${esc(r.error.message)}</p></div>`; return; }
  LP.list = r.letters || []; LP.head = Object.assign(lpBlank(), r.head || {});
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
    <div class="btnrow"><button type="button" class="ghost" data-lpo="${L.id}">Open</button><button type="button" class="ghost" data-lpp="${L.id}">🖨 Print / PDF</button><button type="button" class="ghost" data-lpc="${L.id}">Copy</button><button type="button" class="ghost" data-lpd="${L.id}">Delete</button></div></div>`).join("")
    : `<div class="card"><p class="note">No letters yet. Tap <b>New letter</b> to write the first one.</p></div>`}`;
  $("#lpnew").onclick = () => { LP.cur = lpNew(LP.head); LP.dirty = false; LP.view = "edit"; lpEdit(m); };
  $("#lphd").onclick = () => { LP.view = "head"; lpHeadView(m); };
  const find = id => LP.list.find(x => String(x.id) === String(id));
  m.querySelectorAll("[data-lpo]").forEach(b => b.onclick = () => { LP.cur = Object.assign({}, find(b.dataset.lpo)); LP.dirty = false; LP.view = "edit"; lpEdit(m); });
  m.querySelectorAll("[data-lpc]").forEach(b => b.onclick = () => { const c = Object.assign({}, find(b.dataset.lpc), { id: 0, on_date: ld() }); c.subject = c.subject ? c.subject + " (copy)" : ""; LP.cur = c; LP.dirty = true; LP.view = "edit"; lpEdit(m); toast("Copied. Change what you need and save."); });
  m.querySelectorAll("[data-lpp]").forEach(b => b.onclick = () => lpPrint(find(b.dataset.lpp)));
  m.querySelectorAll("[data-lpd]").forEach(b => b.onclick = async () => { const L = find(b.dataset.lpd); if (!confirm("Delete the letter “" + (L.subject || "no subject") + "”?")) return;
    const r = await api({ a: "letterDelete", id: L.id }); if (r.error) return toast(r.error.message); toast("Letter deleted"); render(); });
}
async function lpPrint(L) {
  const H = LP.head; lpFonts();
  try { await Promise.all([document.fonts.load('400 12pt "KK Bookman"'), document.fonts.load('700 12pt "KK Bookman"')]); } catch (e) {}
  const [logo, sig] = await Promise.all([lpImg(H.logo), L.sign === "yes" ? lpImg(H.sign) : ""]);
  if (!logo) await new Promise(ok => { const i = new Image(); i.onload = i.onerror = ok; i.src = LP_LOGO; });
  printHTML((L.subject || "Letter").slice(0, 80), lpHTML(L, H, logo, sig), false, 15);
}
/* ---------- writing a letter ---------- */
const LP_F = [["on_date", "Date"], ["ref_no", "Ref. No. (optional)"], ["to_text", "To (name and address)"], ["subject", "Subject"], ["salutation", "Greeting"], ["body", "Letter"], ["closing", "Closing line"], ["signoff", "Sign-off"], ["signer", "Name under the signature"], ["designation", "Designation"]];
function lpEdit(m) {
  const L = LP.cur, H = LP.head;
  const f = (k, l) => {
    const v = esc(L[k] ?? "");
    const c = k === "on_date" ? `<input id="lf_${k}" type="date" value="${v}">` : k === "to_text" ? `<textarea id="lf_${k}" rows="3" placeholder="SKYWARDS ELEVATORS&#10;Address (optional)">${v}</textarea>`
      : k === "body" ? `<div class="lptool"><button type="button" class="ghost" id="lpbold" title="Bold"><b>B</b> Bold</button><small>Blank line = new paragraph. Select words and tap Bold, or type **like this**.</small></div><textarea id="lf_${k}" rows="16" placeholder="For and on behalf of Krishna Kuteer Apartment Association, …">${v}</textarea>`
      : `<input id="lf_${k}" value="${v}" autocomplete="off">`;
    return `<div class="${["to_text", "subject", "body", "closing"].includes(k) ? "w" : ""}"><label class="fl" for="lf_${k}">${l}</label>${c}</div>`;
  };
  m.innerHTML = `<div class="lpbar"><button type="button" class="ghost" id="lpback">← All letters</button></div>
   <div class="lped"><div class="card lpform"><h3 style="margin:0 0 6px">${L.id ? "Edit letter" : "New letter"}</h3><div class="f">${LP_F.map(([k, l]) => f(k, l)).join("")}
    <label class="w lpchk"><input type="checkbox" id="lf_sign"${L.sign === "yes" ? " checked" : ""}${H.sign ? "" : " disabled"}> Add my signature${H.sign ? "" : " <small>(upload it in Letterhead details first)</small>"}</label></div>
    <div class="btnrow lpacts"><button type="button" id="lpsave">💾 Save</button><button type="button" class="ghost" id="lppr">🖨 Print / Save as PDF</button></div></div>
   <div class="lpprev"><div class="lpph"><b>Preview</b><small>Page 1 ends at the dashed line</small></div><div class="lpsheet" id="lpsheet"></div></div></div>`;
  const grab = () => { LP_F.forEach(([k]) => { L[k] = $("#lf_" + k).value; }); L.sign = $("#lf_sign").checked ? "yes" : "no"; };
  let t = null; const upd = () => { grab(); LP.dirty = true; clearTimeout(t); t = setTimeout(lpPreview, 250); };
  m.querySelectorAll(".lpform input,.lpform textarea").forEach(el => { el.oninput = upd; el.onchange = upd; });
  $("#lpbold").onclick = () => { const ta = $("#lf_body"), a = ta.selectionStart, b = ta.selectionEnd; if (a === b) { toast("Select the words to make bold first"); return; }
    ta.setRangeText("**" + ta.value.slice(a, b).replace(/\*\*/g, "") + "**", a, b, "end"); ta.focus(); upd(); };
  $("#lpback").onclick = () => { if (LP.dirty && !confirm("Leave without saving this letter?")) return; LP.dirty = false; lpList(m); };
  $("#lpsave").onclick = async () => { grab(); const r = await api({ a: "letterSave", letter: L }); if (r.error) return toast(r.error.message); L.id = r.id; LP.dirty = false; toast("Letter saved");
    const i = LP.list.findIndex(x => String(x.id) === String(r.id)); if (i >= 0) LP.list[i] = Object.assign({}, L); else LP.list.unshift(Object.assign({}, L)); const h3 = $(".lpform h3"); if (h3) h3.textContent = "Edit letter"; };
  $("#lppr").onclick = () => { grab(); lpPrint(L); };
  lpPreview();
}
async function lpPreview() {
  const box = $("#lpsheet"); if (!box || !LP.cur) return;
  const H = LP.head, L = LP.cur, [logo, sig] = await Promise.all([lpImg(H.logo), L.sign === "yes" ? lpImg(H.sign) : ""]);
  if (!$("#lpsheet")) return;
  const root = box.shadowRoot || box.attachShadow({ mode: "open" });
  root.innerHTML = `<style>:host{display:block}.pg{width:210mm;padding:15mm;background:#fff;box-sizing:border-box;position:relative;min-height:297mm}.cut{position:absolute;left:0;right:0;top:282mm;border-top:2px dashed #e0681b}.cut span{position:absolute;right:0;width:15mm;text-align:center;top:1mm;font:600 8pt system-ui,sans-serif;color:#c2410c}</style>
   <div class="pg"><div class="pw">${lpHTML(L, H, logo, sig)}</div><div class="cut"><span>page 2 ↓</span></div></div>`;
  const fit = () => { const pg = root.querySelector(".pg"); if (!pg) return; const z = box.clientWidth / pg.offsetWidth; pg.style.zoom = Math.min(1, z); };
  fit(); if (!LP.ro && window.ResizeObserver) { LP.ro = new ResizeObserver(() => { const b = $("#lpsheet"); if (b && b.shadowRoot) { const pg = b.shadowRoot.querySelector(".pg"); if (pg) { pg.style.zoom = 1; pg.style.zoom = Math.min(1, b.clientWidth / pg.offsetWidth); } } }); }
  if (LP.ro) { LP.ro.disconnect(); LP.ro.observe(box); }
}
/* ---------- letterhead details ---------- */
async function lpPick(kind) {
  return new Promise(ok => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = async () => {
    const f = i.files[0]; if (!f) return ok(null);
    try { const bm = await createImageBitmap(f), max = kind === "sign" ? 900 : 600, s = Math.min(1, max / Math.max(bm.width, bm.height)), c = document.createElement("canvas");
      c.width = Math.round(bm.width * s); c.height = Math.round(bm.height * s); const x = c.getContext("2d"); x.drawImage(bm, 0, 0, c.width, c.height);
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
  LP.view = "head"; const H = JSON.parse(JSON.stringify(LP.head)), [logo, sig] = await Promise.all([lpImg(H.logo), lpImg(H.sign)]);
  const bear = H.bearers.concat([{ role: "", name: "" }]).slice(0, 4);
  m.innerHTML = `<div class="lpbar"><button type="button" class="ghost" id="lpback">← All letters</button></div>
   <h2>Letterhead details</h2><p class="note">Printed on every letter. Change anything here when the committee changes.</p>
   <div class="card"><h3>Name at the top</h3><div class="f">${fld("Line 1", inp("lh_t1", H.title1), 1)}${fld("Line 2", inp("lh_t2", H.title2), 1)}${fld("Address or phone (optional, small line)", inp("lh_ad", H.address), 1)}</div></div>
   <div class="card"><h3>Office bearers <small>(under the name)</small></h3><div class="f">${bear.map((p, i) => fld("Post " + (i + 1), inp("lh_br" + i, p.role, 'placeholder="e.g. PRESIDENT"')) + fld("Name", inp("lh_bn" + i, p.name, 'placeholder="e.g. M. RAJA LAXMI"'))).join("")}</div></div>
   <div class="card"><h3>Left side of page 1</h3><div class="f">${[0, 1].map(i => { const g = H.side[i] || { head: "", names: [] }; return fld("Heading " + (i + 1), inp("lh_sh" + i, g.head, 'placeholder="e.g. MEMBERS"'), 1) + `<div class="w"><label class="fl" for="lh_sn${i}">Names, one per line</label><textarea id="lh_sn${i}" rows="${Math.max(3, g.names.length + 1)}">${esc(g.names.join("\n"))}</textarea></div>`; }).join("")}</div></div>
   <div class="card"><h3>Logo</h3><div class="lpimg"><img src="${logo || LP_LOGO}" alt="Logo"><div class="btnrow"><button type="button" class="ghost" id="lh_lg">Change logo</button>${H.logo ? `<button type="button" class="ghost" id="lh_lgd">Use the standard logo</button>` : ""}</div></div></div>
   <div class="card"><h3>Signature</h3><p class="note">Sign on plain white paper and take a clear photo. The paper is removed automatically. It is kept private: only the Secretary login can use it.</p>
    <div class="lpimg">${sig ? `<img src="${sig}" alt="Signature" class="sg">` : `<span class="note">No signature yet.</span>`}<div class="btnrow"><button type="button" class="ghost" id="lh_sg">${sig ? "Change signature" : "Upload signature"}</button>${sig ? `<button type="button" class="ghost" id="lh_sgd">Remove</button>` : ""}</div></div>
    <div class="f">${fld("Sign-off", inp("lh_so", H.signoff, 'placeholder="Yours faithfully,"'))}${fld("Name under the signature", inp("lh_sn", H.signer, 'placeholder="e.g. T. Sai Vakula"'))}${fld("Designation", inp("lh_ds", H.designation))}</div></div>
   <div class="btnrow"><button type="button" id="lh_save">💾 Save letterhead</button></div>`;
  const read = () => { H.title1 = val("lh_t1"); H.title2 = val("lh_t2"); H.address = val("lh_ad"); H.signoff = val("lh_so"); H.signer = val("lh_sn"); H.designation = val("lh_ds");
    H.bearers = [0, 1, 2, 3].map(i => ({ role: val("lh_br" + i), name: val("lh_bn" + i) })).filter(p => p.role || p.name);
    H.side = [0, 1].map(i => ({ head: val("lh_sh" + i), names: $("#lh_sn" + i).value.split("\n").map(s => s.trim()).filter(Boolean) })); };
  const save = async () => { read(); const r = await api({ a: "letterheadSave", head: H }); if (r.error) { toast(r.error.message); return false; } LP.head = Object.assign(lpBlank(), r.head); toast("Letterhead saved"); return true; };
  const up = async (kind) => { const d = await lpPick(kind); if (!d) return; const r = await api({ a: "upload", kind: "letter", img: d }); if (r.error) return toast(r.error.message);
    LP.img[r.id] = d; read(); H[kind === "sign" ? "sign" : "logo"] = r.id; LP.head = H; if (await save()) lpHeadView(m); };
  $("#lpback").onclick = () => lpList(m);
  $("#lh_save").onclick = async () => { if (await save()) lpList(m); };
  $("#lh_lg").onclick = () => up("logo"); $("#lh_sg").onclick = () => up("sign");
  if ($("#lh_lgd")) $("#lh_lgd").onclick = async () => { read(); H.logo = ""; LP.head = H; if (await save()) lpHeadView(m); };
  if ($("#lh_sgd")) $("#lh_sgd").onclick = async () => { if (!confirm("Remove your signature from the letterhead?")) return; read(); H.sign = ""; LP.head = H; if (await save()) lpHeadView(m); };
}
