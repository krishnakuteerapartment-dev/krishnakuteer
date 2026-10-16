/* Visitor register photo import (Secretary only). Loaded only when the Secretary taps "Upload register photo".
   Photo → prepared on the phone (turned upright, made smaller, contrast improved) → read by Google's Gemini on the server →
   every row shown for checking and correcting → saved together. Nothing is saved without the Secretary's check; anything
   the reader was unsure about is highlighted and must be confirmed or corrected first. */
const RG_PURP = ["Guest / relative", "Delivery / courier", "Service / repair", "Cab / taxi", "Domestic help", "Official visit", "Other"];
const RG_ED = ["visit_on", "name", "flat_no", "purpose", "phone", "in_time", "out_time", "remarks"];
const RG_F = { visit_on: "Date", name: "Visitor name", flat_no: "Flat", purpose: "Purpose", phone: "Phone", in_time: "In time", out_time: "Out time", remarks: "Remarks", serial: "S.No" };
let RGS = null;
window.regOpen = function (onDone) {
  RGS = { step: "pick", rot: 0, enh: true, src: null, img: null, rows: [], flats: [], have: {}, onDone, busy: 0, imports: null, ready: true, zoom: 1, n: 0 };
  document.body.insertAdjacentHTML("beforeend", `<div class="rgx" role="dialog" aria-modal="true" aria-labelledby="rgt"><div class="rgh"><button type="button" class="rgi" id="rgback" aria-label="Close">✕</button><div><b id="rgt">Visitor register photo</b><small id="rgst"></small></div></div><div class="rgc" id="rgc"></div><div class="rgf" id="rgf"></div></div>`);
  document.documentElement.classList.add("rgon");
  $("#rgback").onclick = rgClose;
  Promise.all([allFlats(), db.from("visitors").select("*")]).then(([f, v]) => {
    RGS.flats = f.map(x => String(x.flat_no)).concat(["Common area"]);
    (v.data || []).forEach(r => { if (r.name) RGS.have[rgKey(r)] = r; });
    if (RGS.step === "review") rgDraw();
  }).catch(() => {});
  api({ a: "registerImports" }, 1).then(r => { if (RGS && r && r.ok) { RGS.imports = r.imports; RGS.ready = r.ready; if (RGS.step === "pick") rgDraw(); } }).catch(() => {});
  rgDraw();
};
const rgKey = r => [String(r.visit_on || "").slice(0, 10), String(r.name || "").toLowerCase().replace(/[^a-z0-9ఀ-౿]/g, ""), String(r.flat_no || "").toLowerCase(), String(r.in_time || "").slice(0, 5)].join("|");
function rgClose() {
  if (!RGS) return;
  const left = RGS.rows.filter(r => !r.del && r.st !== "saved").length;
  if (RGS.step === "review" && left && !confirm("Cancel this import? " + left + " entr" + (left === 1 ? "y has" : "ies have") + " not been saved.")) return;
  if (RGS.imp && !RGS.rows.some(r => r.st === "saved")) api({ a: "registerCancel", import_id: RGS.imp }, 1).catch(() => {});
  RGS.busy++; /* a reading still running is ignored */
  document.querySelector(".rgx")?.remove(); document.documentElement.classList.remove("rgon");
  const done = (RGS.done || []).concat(RGS.rows.filter(r => r.st === "saved")), cb = RGS.onDone; RGS = null;
  if (cb) cb(done);
}
const rgSteps = ["Photo", "Read", "Check", "Save"];
function rgStepper(i) { $("#rgst").innerHTML = rgSteps.map((s, k) => `<span class="${k < i ? "dn" : k === i ? "on" : ""}">${k < i ? "✓ " : ""}${s}</span>`).join("<i>›</i>"); }

/* ---------- step 1: take or choose the photo ---------- */
function rgPick() {
  rgStepper(0);
  const prev = RGS.imports && RGS.imports.length ? `<h3>Earlier imports</h3><div class="card rgold">${RGS.imports.slice(0, 6).map(x => `<div class="it"><div>${esc(dmx(String(x.at).slice(0, 10)))} ${esc(String(x.at).slice(11, 16))}<small>${+x.found || 0} read · ${+x.saved || 0} saved · ${esc(x.status || "")}</small></div>${x.photo ? `<button type="button" class="ghost" data-rgph="${esc(x.photo)}">Photo</button>` : ""}</div>`).join("")}</div>` : "";
  $("#rgc").innerHTML = `${RGS.ready ? "" : `<p class="note warn">The register reader is not set up yet. It needs a Gemini key in Apps Script (GEMINI_KEY). Until then you can still add visitors manually.</p>`}
   <div class="card"><b>Photograph one full page of the register</b>
    <ul class="rgtips"><li>Lay the book flat, take the photo from straight above.</li><li>Get the whole page in, with all its columns.</li><li>Use good light; avoid your shadow and glare.</li></ul>
    <div class="rgpick"><label class="rgbig"><input type="file" accept="image/*" capture="environment" id="rgcam" hidden><span>📷</span>Take photo</label>
    <label class="rgbig alt"><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*" id="rggal" hidden><span>🖼</span>Choose from gallery</label></div>
    <small class="rgsm">JPG, PNG or WEBP (phone camera photos). One page at a time.</small></div>
   ${RGS.src ? `<div class="card"><div class="rgprev"><img id="rgpv" alt="Register photo"></div>
    <div class="btnrow rgtools"><button type="button" class="ghost" id="rgl">⟲ Turn left</button><button type="button" class="ghost" id="rgr">⟳ Turn right</button>
    <label class="rgchk"><input type="checkbox" id="rgenh"${RGS.enh ? " checked" : ""}> Improve contrast</label></div>
    ${RGS.warn ? `<p class="note warn" id="rgwarn">${esc(RGS.warn)}</p>` : ""}</div>` : ""}${prev}`;
  $("#rgf").innerHTML = `<button type="button" class="ghost" id="rgcx">Cancel import</button><button type="button" id="rggo"${RGS.src ? "" : " disabled"}>Read the register</button>`;
  $("#rgcx").onclick = rgClose;
  ["rgcam", "rggal"].forEach(id => { $("#" + id).onchange = e => { const f = e.target.files[0]; e.target.value = ""; if (f) rgLoad(f); }; });
  if (RGS.src) { rgPrev(); $("#rgl").onclick = () => { RGS.rot = (RGS.rot + 270) % 360; rgPrev(); }; $("#rgr").onclick = () => { RGS.rot = (RGS.rot + 90) % 360; rgPrev(); }; $("#rgenh").onchange = e => { RGS.enh = e.target.checked; rgPrev(); }; }
  $("#rggo").onclick = rgRead;
  $("#rgc").querySelectorAll("[data-rgph]").forEach(b => b.onclick = () => rgViewPhoto(b.dataset.rgph));
}
async function rgLoad(f) {
  let bm;
  try { bm = await createImageBitmap(f); }
  catch (e) { bm = await new Promise(ok => { const u = URL.createObjectURL(f), i = new Image(); i.onload = () => { URL.revokeObjectURL(u); ok(i); }; i.onerror = () => { URL.revokeObjectURL(u); ok(null); }; i.src = u; }); }
  if (!bm || !(bm.width > 0)) { toast("This photo can't be opened here. Please use a JPG or PNG photo."); return; }
  if (Math.min(bm.width, bm.height) < 500) { toast("This photo is too small to read. Please use the camera's full size."); return; }
  RGS.src = bm; RGS.rot = 0; RGS.warn = "";
  rgPick();
}
/* the photo prepared for reading: upright, at most 2000 px, optional contrast stretch; also a quick sharpness check */
function rgCanvas(maxSide) {
  const b = RGS.src, s = Math.min(1, maxSide / Math.max(b.width, b.height)), w = Math.round(b.width * s), h = Math.round(b.height * s), sw = RGS.rot % 180 ? h : w, sh = RGS.rot % 180 ? w : h;
  const c = document.createElement("canvas"); c.width = sw; c.height = sh; const x = c.getContext("2d");
  x.translate(sw / 2, sh / 2); x.rotate(RGS.rot * Math.PI / 180); x.drawImage(b, -w / 2, -h / 2, w, h);
  if (RGS.enh) {
    const d = x.getImageData(0, 0, sw, sh), p = d.data, hist = new Uint32Array(256), n = sw * sh;
    for (let i = 0; i < p.length; i += 4) hist[(p[i] * 77 + p[i + 1] * 150 + p[i + 2] * 29) >> 8]++;
    let lo = 0, hi = 255, a = 0; while (lo < 255 && (a += hist[lo]) < n * 0.01) lo++; a = 0; while (hi > 0 && (a += hist[hi]) < n * 0.02) hi--;
    if (hi - lo > 40) { const k = 255 / (hi - lo); for (let i = 0; i < p.length; i += 4) for (let j = 0; j < 3; j++) p[i + j] = Math.max(0, Math.min(255, (p[i + j] - lo) * k)); x.putImageData(d, 0, 0); }
  }
  return c;
}
function rgSharp(c) {
  const s = Math.min(1, 700 / Math.max(c.width, c.height)), w = Math.round(c.width * s), h = Math.round(c.height * s), t = document.createElement("canvas"); t.width = w; t.height = h;
  const x = t.getContext("2d"); x.drawImage(c, 0, 0, w, h); const p = x.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) g[i] = p[i * 4] * .3 + p[i * 4 + 1] * .59 + p[i * 4 + 2] * .11;
  let sum = 0, sq = 0, m = 0; for (let y = 1; y < h - 1; y++) for (let x2 = 1; x2 < w - 1; x2++) { const i = y * w + x2, l = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w]; sum += l; sq += l * l; m++; }
  const mean = sum / m; return sq / m - mean * mean; /* low = blurry */
}
function rgPrev() {
  const c = rgCanvas(1100); $("#rgpv").src = c.toDataURL("image/jpeg", .8);
  const v = rgSharp(c); RGS.warn = v < 60 ? "The photo looks blurry. A sharper photo will be read much better: hold the phone still and tap the screen to focus." : "";
  const w = $("#rgwarn"); if (w) w.textContent = RGS.warn, w.hidden = !RGS.warn; else if (RGS.warn) $("#rgpv").closest(".card").insertAdjacentHTML("beforeend", `<p class="note warn" id="rgwarn">${esc(RGS.warn)}</p>`);
}
function rgJpeg() {
  const c = rgCanvas(2000); let q = .82, d = c.toDataURL("image/jpeg", q);
  while (d.length * .75 > 950000 && q > .4) { q -= .1; d = c.toDataURL("image/jpeg", q); }
  if (d.length * .75 > 950000) { const c2 = document.createElement("canvas"); c2.width = c.width * .75; c2.height = c.height * .75; c2.getContext("2d").drawImage(c, 0, 0, c2.width, c2.height); d = c2.toDataURL("image/jpeg", .7); }
  return d;
}

/* ---------- step 2: reading ---------- */
async function rgRead() {
  const my = ++RGS.busy; RGS.step = "busy"; rgStepper(1);
  $("#rgc").innerHTML = `<div class="card rgbusy"><div class="rgspin" aria-hidden="true"></div><b id="rgmsg">Preparing the photo…</b><div class="rgbar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i id="rgpb" style="width:5%"></i></div><small>Reading handwriting usually takes 20 to 60 seconds. Keep this screen open.</small></div>`;
  $("#rgf").innerHTML = `<button type="button" class="ghost" id="rgcx">Cancel</button>`; $("#rgcx").onclick = () => { RGS.busy++; RGS.step = "pick"; rgDraw(); };
  const set = (m, p) => { if (!RGS || RGS.busy !== my) return; if (m) $("#rgmsg").textContent = m; $("#rgpb").style.width = p + "%"; };
  let tick;
  try {
    await new Promise(r => setTimeout(r, 30));
    RGS.img = rgJpeg(); set("Uploading the photo…", 15);
    const up = await api({ a: "upload", kind: "register", img: RGS.img }, 1); if (up.error) throw new Error(up.error.message);
    if (!RGS || RGS.busy !== my) return;
    set("Reading the handwriting…", 30); let p = 30; tick = setInterval(() => { p += (92 - p) * .05; set(null, p); }, 700);
    const r = await api({ a: "registerScan", photo: up.id }, 1); clearInterval(tick);
    if (!RGS || RGS.busy !== my) return;
    if (r.error) throw new Error(r.error.message);
    set("Done", 100);
    RGS.imp = r.import_id; RGS.photo = r.photo;
    RGS.rows = r.rows.map(x => Object.assign(x, { ok: {}, st: "", msg: "", force: false, del: false }));
    RGS.step = "found"; rgDraw();
  } catch (e) {
    clearInterval(tick); if (!RGS || RGS.busy !== my) return;
    $("#rgc").innerHTML = `<div class="card"><p class="note bad">${esc(e.message || "Could not read the photo.")}</p></div>`;
    $("#rgf").innerHTML = `<button type="button" class="ghost" id="rgnew">Choose another photo</button><button type="button" id="rgtry">Try again</button>`;
    $("#rgnew").onclick = () => { RGS.step = "pick"; RGS.src = null; rgDraw(); }; $("#rgtry").onclick = rgRead;
  }
}

/* ---------- step 3: what was found ---------- */
function rgFound() {
  rgStepper(2);
  const live = RGS.rows, unsure = live.filter(r => r.flags.length).length, dup = live.filter(r => rgDup(r)).length;
  $("#rgc").innerHTML = `<div class="card rgsum"><div class="rgbig2">${live.length}</div><b>entr${live.length === 1 ? "y" : "ies"} found on the page</b>
   <div class="rgpills">${unsure ? `<span class="tag amb">${unsure} need checking</span>` : `<span class="tag grn">All read clearly</span>`}${dup ? `<span class="tag red">${dup} possible duplicate${dup === 1 ? "" : "s"}</span>` : ""}</div>
   <p class="rgsm">Next, check every entry against the photo. Highlighted fields could not be read with confidence: correct them or tap <b>Looks right</b>. Nothing is saved until you tap <b>Save all entries</b>.</p></div>`;
  $("#rgf").innerHTML = `<button type="button" class="ghost" id="rgcx">Cancel import</button><button type="button" id="rgrev">Review entries</button>`;
  $("#rgcx").onclick = rgClose; $("#rgrev").onclick = () => { RGS.step = "review"; rgDraw(); };
}

/* ---------- step 4: review, correct, save ---------- */
const rgToday = () => ld();
function rgDup(r) { if (r.force) return null; if (r.dup) return RGS.have[rgKey(r)] || { id: r.dup }; const h = RGS.have[rgKey(r)]; return h && r.visit_on && r.name ? h : null; }
function rgCheck(r) {
  const e = {};
  if (!String(r.name || "").trim()) e.name = "Enter the visitor's name";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.visit_on || "")) e.visit_on = "Enter the date"; else if (r.visit_on > rgToday()) e.visit_on = "Date is in the future";
  if (!r.flat_no) e.flat_no = "Choose the flat"; else if (RGS.flats.length && !RGS.flats.includes(String(r.flat_no))) e.flat_no = "Not a flat in this apartment";
  if (!/^\d{2}:\d{2}$/.test(r.in_time || "")) e.in_time = "Enter the in time";
  if (r.out_time && !/^\d{2}:\d{2}$/.test(r.out_time)) e.out_time = "Check the out time";
  if (r.phone && !/^\+?\d{6,15}$/.test(r.phone)) e.phone = "Digits only (6 to 15)";
  const f = r.flags.filter(k => RG_ED.includes(k) && !r.ok[k] && !e[k]);
  return { e, f, dup: rgDup(r) };
}
function rgState(r) {
  if (r.del) return ["Removed", "gry"];
  if (r.st === "saved") return ["Saved ✓", "grn"];
  const c = rgCheck(r);
  if (Object.keys(c.e).length) return ["Needs correction", "red"];
  if (c.f.length) return ["Check " + c.f.length + " field" + (c.f.length === 1 ? "" : "s"), "amb"];
  if (c.dup) return ["Possible duplicate", "red"];
  if (r.st === "failed") return ["Not saved, try again", "red"];
  return ["Ready", "grn"];
}
function rgField(r, k, c) {
  const id = "rg_" + r.key + "_" + k, v = r[k] ?? "", bad = c.e[k], unsure = c.f.includes(k), raw = r.raw && { visit_on: r.raw.date, flat_no: r.raw.flat, in_time: r.raw.in_time, out_time: r.raw.out_time, phone: r.raw.phone }[k];
  let ctl;
  if (k === "visit_on") ctl = `<input id="${id}" type="date" max="${rgToday()}" value="${esc(v)}">`;
  else if (k === "in_time" || k === "out_time") ctl = `<input id="${id}" type="time" value="${esc(v)}">`;
  else if (k === "flat_no") ctl = `<select id="${id}"><option value="">Choose…</option>${RGS.flats.map(f => `<option value="${esc(f)}"${String(f) === String(v) ? " selected" : ""}>${f === "Common area" ? "Common area / office" : "Flat " + esc(f)}</option>`).join("")}</select>`;
  else if (k === "phone") ctl = `<input id="${id}" type="tel" inputmode="tel" value="${esc(v)}" autocomplete="off">`;
  else ctl = `<input id="${id}" value="${esc(v)}" autocomplete="off"${k === "purpose" ? ' list="rgpl"' : ""}${k === "name" ? ' autocapitalize="words"' : ""}>`;
  const hint = (raw && raw !== v && (unsure || bad || !v) ? `Read as “${esc(raw)}”. ` : "") + (bad ? esc(bad) : unsure ? "Not sure this was read right." : "");
  return `<div class="rgfd${bad ? " bad" : unsure ? " uns" : ""}${k === "remarks" || k === "name" ? " w" : ""}" data-f="${k}"><label for="${id}">${RG_F[k]}${k === "out_time" || k === "phone" || k === "remarks" || k === "purpose" ? ' <small>optional</small>' : ""}</label>${ctl}${hint ? `<small class="rgh2">${hint}${unsure && !bad ? ` <button type="button" class="rgok" data-ok="${k}">Looks right ✓</button>` : ""}</small>` : ""}</div>`;
}
function rgCard(r, i) {
  const [lab, col] = rgState(r), c = rgCheck(r);
  if (r.st === "saved") return `<div class="rgrow sv" data-k="${r.key}"><div class="rgrh"><b>${i + 1}. ${esc(r.name)}</b><span class="tag grn">Saved ✓</span></div><small>${esc(dmx(r.visit_on))} · Flat ${esc(r.flat_no)} · ${t12(r.in_time)}${r.out_time ? " – " + t12(r.out_time) : ""}${r.purpose ? " · " + esc(r.purpose) : ""}</small></div>`;
  if (r.del) return `<div class="rgrow del" data-k="${r.key}"><div class="rgrh"><b>${i + 1}. ${esc(r.name || "Entry")}</b><span class="tag gry">Removed</span><button type="button" class="ghost rgsmb" data-undo="1">Undo</button></div></div>`;
  return `<div class="rgrow" data-k="${r.key}"><div class="rgrh"><b>${i + 1}.${r.serial ? ` <small>S.No ${esc(r.serial)}</small>` : ""}</b><span class="tag ${col}">${lab}</span><button type="button" class="rgi rgdel" data-delr="1" aria-label="Remove entry ${i + 1}">🗑</button></div>
   <div class="rgmeta">${rgMeta(r, c)}</div>
   <div class="rgg">${["visit_on", "name", "flat_no", "purpose", "phone", "in_time", "out_time", "remarks"].map(k => rgField(r, k, c)).join("")}</div></div>`;
}
function rgMeta(r, c) {
  return `${r.msg ? `<p class="note ${r.st === "failed" || r.st === "invalid" ? "bad" : "warn"}">${esc(r.msg)}</p>` : ""}
   ${c.dup ? `<p class="note bad rgdup">Looks like an entry already in the register${c.dup.name ? `: ${esc(c.dup.name)}, Flat ${esc(c.dup.flat_no)}, ${t12(c.dup.in_time)} on ${esc(dmx(c.dup.visit_on))}` : ""}. It will not be saved again. <label class="rgchk"><input type="checkbox" data-force="1"> Save it anyway</label></p>` : r.force ? `<p class="note warn rgdup"><label class="rgchk"><input type="checkbox" data-force="1" checked> Save it anyway (duplicate)</label></p>` : ""}`;
}
function rgReview() {
  rgStepper(RGS.rows.some(r => r.st === "saved") ? 3 : 2);
  const z = RGS.zoom;
  $("#rgc").innerHTML = `<div class="rgrv"><div class="rgph" id="rgph"><div class="rgpt"><b>Register photo</b><span><button type="button" class="ghost rgsmb" id="rgzo" aria-label="Zoom out">−</button><button type="button" class="ghost rgsmb" id="rgzi" aria-label="Zoom in">+</button><button type="button" class="ghost rgsmb" id="rgph2">Hide</button></span></div><div class="rgpi"><img src="${RGS.img}" alt="Register photo" style="width:${z * 100}%"></div></div>
   <div class="rglist"><div id="rgsum">${rgSummary()}</div><div id="rgrows">${RGS.rows.map(rgCard).join("")}</div>
   <button type="button" class="ghost rgadd" id="rgadd">+ Add a missing entry</button></div></div><datalist id="rgpl">${RG_PURP.map(p => `<option value="${esc(p)}">`).join("")}</datalist>`;
  rgFoot();
  $("#rgzi").onclick = () => { RGS.zoom = Math.min(4, RGS.zoom + .5); $(".rgpi img").style.width = RGS.zoom * 100 + "%"; };
  $("#rgzo").onclick = () => { RGS.zoom = Math.max(1, RGS.zoom - .5); $(".rgpi img").style.width = RGS.zoom * 100 + "%"; };
  $("#rgph2").onclick = e => { const h = $("#rgph").classList.toggle("min"); e.target.textContent = h ? "Show" : "Hide"; };
  $("#rgadd").onclick = () => { const k = "m" + (++RGS.n); RGS.rows.push({ key: k, serial: "", visit_on: (RGS.rows.filter(r => r.visit_on).pop() || {}).visit_on || "", name: "", flat_no: "", purpose: "", phone: "", in_time: "", out_time: "", remarks: "", flags: [], raw: null, ok: {}, st: "", msg: "", force: false, del: false });
    $("#rgrows").insertAdjacentHTML("beforeend", rgCard(RGS.rows[RGS.rows.length - 1], RGS.rows.length - 1)); rgRefresh(); const el = $(`.rgrow[data-k="${k}"]`); el.scrollIntoView({ block: "center" }); el.querySelector("input")?.focus(); };
  const box = $("#rgrows");
  box.addEventListener("input", rgEdit); box.addEventListener("change", rgEdit);
  box.addEventListener("click", e => {
    const row = e.target.closest(".rgrow"); if (!row) return; const r = RGS.rows.find(x => x.key === row.dataset.k); if (!r) return;
    if (e.target.closest("[data-ok]")) { r.ok[e.target.closest("[data-ok]").dataset.ok] = 1; rgRedraw(r); }
    else if (e.target.closest("[data-delr]")) { r.del = true; rgRedraw(r); }
    else if (e.target.closest("[data-undo]")) { r.del = false; rgRedraw(r); }
  });
}
function rgEdit(e) {
  const row = e.target.closest(".rgrow"), fd = e.target.closest(".rgfd"); if (!row) return;
  const r = RGS.rows.find(x => x.key === row.dataset.k); if (!r) return;
  if (e.target.dataset.force) { r.force = e.target.checked; if (e.type === "change") rgRedraw(r); return; }
  if (!fd) return; const k = fd.dataset.f; let v = e.target.value;
  if (k === "phone") v = v.replace(/[^\d+]/g, "");
  r[k] = v; r.ok[k] = 1; if (r.st === "invalid" || r.st === "failed") { r.st = ""; r.msg = ""; }
  if (["visit_on", "name", "flat_no", "in_time"].includes(k)) r.dup = null;
  if (e.type === "change") rgSoft(r); else rgRefresh();
}
/* update the highlights and messages of one entry without touching what is being typed */
function rgSoft(r) {
  const el = $(`.rgrow[data-k="${r.key}"]`); if (!el) return; const c = rgCheck(r);
  el.querySelectorAll(".rgfd").forEach(fd => { const k = fd.dataset.f, nw = document.createElement("div"); nw.innerHTML = rgField(r, k, c);
    const n2 = nw.firstElementChild; fd.className = n2.className; const h = fd.querySelector(".rgh2"), h2 = n2.querySelector(".rgh2");
    if (h && !h2) h.remove(); else if (h2 && !h) fd.appendChild(h2); else if (h && h2) h.innerHTML = h2.innerHTML; });
  el.querySelector(".rgmeta").innerHTML = rgMeta(r, c); rgRefresh();
}
/* redraw one entry, keeping the cursor where it was */
function rgRedraw(r, focusK) {
  const el = $(`.rgrow[data-k="${r.key}"]`); if (!el) return;
  const a = document.activeElement, keepId = a && el.contains(a) ? a.id : null;
  el.outerHTML = rgCard(r, RGS.rows.indexOf(r));
  if (keepId && document.getElementById(keepId)) document.getElementById(keepId).focus();
  rgRefresh();
}
function rgCounts() {
  const live = RGS.rows.filter(r => !r.del), n = s => live.filter(r => rgState(r)[0].startsWith(s)).length;
  return { live, saved: n("Saved"), ready: n("Ready") + n("Not saved"), fix: n("Needs") + n("Check"), dup: n("Possible") };
}
function rgSummary() {
  const c = rgCounts(), res = RGS.last;
  return `<div class="card rgtot">${res ? `<b>${res.saved ? `${res.saved} entr${res.saved === 1 ? "y" : "ies"} saved to the visitor register.` : "Nothing new was saved."}</b><div class="rgpills">${res.fix ? `<span class="tag red">${res.fix} need correction</span>` : ""}${res.dup ? `<span class="tag red">${res.dup} duplicate${res.dup === 1 ? "" : "s"} skipped</span>` : ""}${res.failed ? `<span class="tag red">${res.failed} failed to save</span>` : ""}</div>` : ""}
   <div class="rgpills">${c.saved ? `<span class="tag grn">${c.saved} saved</span>` : ""}<span class="tag grn">${c.ready} ready</span>${c.fix ? `<span class="tag amb">${c.fix} to check</span>` : ""}${c.dup ? `<span class="tag red">${c.dup} duplicate${c.dup === 1 ? "" : "s"}</span>` : ""}</div></div>`;
}
function rgRefresh() {
  RGS.rows.forEach(r => { const el = $(`.rgrow[data-k="${r.key}"] .rgrh .tag`); if (el && !r.del && r.st !== "saved") { const [l, c] = rgState(r); el.textContent = l; el.className = "tag " + c; } });
  const s = $("#rgsum"); if (s) s.innerHTML = rgSummary(); rgFoot();
}
function rgFoot() {
  const c = rgCounts(), left = c.live.filter(r => r.st !== "saved").length;
  $("#rgf").innerHTML = left ? `<button type="button" class="ghost" id="rgcx">Cancel import</button><button type="button" id="rgsave"${c.ready ? "" : " disabled"}>${c.saved ? "Save remaining" : "Save all entries"} (${c.ready})</button>`
    : `<button type="button" class="ghost" id="rgmore">Read another page</button><button type="button" id="rgdone">View visitor history</button>`;
  if (left) { $("#rgcx").onclick = rgClose; $("#rgsave").onclick = rgSave; }
  else { $("#rgdone").onclick = rgClose; $("#rgmore").onclick = () => { const saved = RGS.rows.filter(r => r.st === "saved"); RGS.imp = null; RGS.rows = []; RGS.src = null; RGS.img = null; RGS.last = null; RGS.step = "pick"; RGS.done = (RGS.done || []).concat(saved); rgDraw(); }; }
}
async function rgSave() {
  const c = rgCounts(), send = c.live.filter(r => rgState(r)[0] === "Ready" || rgState(r)[0].startsWith("Not saved")), hold = c.fix + c.dup;
  if (!send.length) return;
  if (hold && !confirm(`${send.length} entr${send.length === 1 ? "y is" : "ies are"} ready. ${hold} other${hold === 1 ? "" : "s"} still need${hold === 1 ? "s" : ""} checking and will not be saved now. Save the ready ones?`)) return;
  const b = $("#rgsave"); b.disabled = true; b.textContent = "Saving…";
  let r;
  try { r = await api({ a: "registerSave", import_id: RGS.imp, rows: send.map(x => ({ key: x.key, visit_on: x.visit_on, name: x.name, flat_no: x.flat_no, purpose: x.purpose, phone: x.phone, in_time: x.in_time, out_time: x.out_time, remarks: x.remarks, force: !!x.force })) }); }
  catch (e) { send.forEach(x => { x.st = "failed"; x.msg = "Not saved: no connection. Tap Save again; nothing will be saved twice."; }); RGS.last = { saved: 0, failed: send.length, fix: c.fix, dup: c.dup }; rgReview(); return; }
  if (!RGS) return;
  if (r.error) { toast(r.error.message); send.forEach(x => { x.st = "failed"; x.msg = r.error.message; }); RGS.last = { saved: 0, failed: send.length, fix: c.fix, dup: c.dup }; rgReview(); return; }
  if (r.snapshot) adopt(r.snapshot);
  const by = {}; (r.results || []).forEach(x => by[x.key] = x);
  let saved = 0, failed = 0, dup = 0, bad = 0;
  send.forEach(x => { const y = by[x.key] || { status: "failed", message: "No answer for this entry. Try again." };
    if (y.status === "saved") { x.st = "saved"; x.msg = ""; saved++; RGS.have[rgKey(x)] = x; }
    else if (y.status === "duplicate") { x.st = ""; x.dup = y.id; x.msg = ""; dup++; }
    else if (y.status === "invalid") { x.st = "invalid"; x.msg = y.message; bad++; }
    else { x.st = "failed"; x.msg = y.message || "Could not save. Try again."; failed++; } });
  RGS.last = { saved, failed, fix: bad + c.fix, dup: dup + c.dup };
  rgReview(); $("#rgsum").scrollIntoView({ block: "start" });
}
async function rgViewPhoto(id) {
  try { const r = await api({ a: "photo", id }); if (r.error) throw new Error(r.error.message);
    document.body.insertAdjacentHTML("beforeend", `<div class="rgx rgv" role="dialog" aria-modal="true" aria-label="Register photo"><div class="rgh"><button type="button" class="rgi" aria-label="Close">✕</button><b>Register photo</b></div><div class="rgc"><img src="${r.img}" alt="Register photo" style="width:100%"></div></div>`);
    const v = document.querySelector(".rgv"); v.querySelector("button").onclick = () => v.remove(); }
  catch (e) { toast(e.message || "Photo not available."); }
}
function rgDraw() {
  if (!RGS) return;
  ({ pick: rgPick, busy: () => {}, found: rgFound, review: rgReview })[RGS.step]();
}
