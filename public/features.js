/* Krishna Kuteer - committee features: Assets & service history, Service reminders, Meeting management,
   Emergency contacts, Visitor register, Complaint tracking and the Audit log.
   This file only DEFINES functions; index.html calls them (it is loaded before the main app script).
   Permissions shown here only hide buttons. The real checks are made by the Google Apps Script (Code.gs). */

/* ---------- who may do what (keep in step with RULES in Code.gs) ---------- */
const R_S = ["admin", "treasurer", "secretary", "president"], R_N = ["admin", "president", "secretary"],
  R_COM = ["admin", "president", "secretary", "treasurer", "executive"], R_VIS = ["admin", "treasurer", "secretary", "executive"];
const isIn = g => !!(me && g.includes(me.role));

/* ---------- menu icons for the new pages ---------- */
const FIC = (p => ({
  assets: p('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h3"/>'),
  rem: p('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M5 3 2 6M19 3l3 3"/>'),
  sos: p('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
  audit: p('<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>')
}))(d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`);

/* ---------- styles for the new pages ---------- */
(function () {
  const s = document.createElement("style"); s.id = "features";
  s.textContent = `textarea{font:inherit;width:100%;padding:11px 13px;border-radius:12px;border:1.5px solid #d6e3f8;background:#fff;color:var(--ink);min-height:96px;resize:vertical;font-size:16px}
.modal>.card{max-height:calc(100vh - 32px);overflow:auto}.modal .f{margin-top:8px}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.chips button{width:auto;min-height:38px;padding:7px 14px;font-size:.88rem;border-radius:99px}
.tag{display:inline-block;font-size:.74rem;font-weight:700;padding:2px 9px;border-radius:99px;background:var(--sky);color:#1d4ed8;margin:2px 4px 2px 0;white-space:nowrap}
.tag.red{background:#fde8e6;color:#b42318}.tag.amb{background:#fdf0dc;color:#b45309}.tag.grn{background:#e4f6ea;color:#15803d}.tag.gry{background:#eef1f5;color:#4a5568}
.kv{display:grid;grid-template-columns:minmax(110px,auto) 1fr;gap:2px 12px;font-size:.92rem;margin:8px 0}.kv dt{color:var(--grey)}.kv dd{margin:0;overflow-wrap:anywhere}
.ahead{display:flex;gap:12px;align-items:flex-start}.ahead .em{font-size:1.9rem;line-height:1;flex:none}.ahead>div{flex:1;min-width:0}
.btnrow{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.btnrow>*{width:auto;flex:1 1 140px}
details.rec{margin-top:10px;border-top:1px solid var(--line);padding-top:8px}details.rec>summary{cursor:pointer;font-weight:600;color:#1d4ed8;padding:6px 0;list-style:none}details.rec>summary::-webkit-details-marker{display:none}details.rec>summary:before{content:"▸ ";display:inline-block;transition:transform .2s}details.rec[open]>summary:before{transform:rotate(90deg)}
.pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f6f9ff;border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin:4px 0 10px}
a.call{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:10px 16px;border-radius:12px;background:linear-gradient(135deg,#15803d,#22a35a);color:#fff;font-weight:700;text-decoration:none;white-space:nowrap;box-shadow:0 6px 16px rgba(21,128,61,.28)}
a.call.alt{background:#e4f6ea;color:#15803d;box-shadow:none;border:1px solid #b7e4c7}
.sosg{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:12px}
.sosg a{display:flex;flex-direction:column;align-items:center;gap:2px;padding:14px 8px;border-radius:14px;background:linear-gradient(135deg,#b42318,#e0473a);color:#fff;text-decoration:none;font-weight:700;box-shadow:0 8px 20px rgba(180,35,24,.25)}
.sosg a span{font-size:1.6rem;line-height:1.1}.sosg a b{font-size:1.35rem}.sosg a small{opacity:.9;font-weight:600}
.ctc{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.ctc>div:first-child{flex:1 1 180px;min-width:0}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px}.tiles>div{background:var(--sky);border-radius:12px;padding:12px;text-align:center}.tiles b{display:block;font-size:1.6rem;font-weight:800;color:var(--navy);line-height:1.2}.tiles small{color:var(--grey)}.tiles .red b{color:#b42318}.tiles .amb b{color:#b45309}.tiles .grn b{color:#15803d}
.hist{border-left:2px solid var(--line);margin:6px 0 0 6px;padding-left:12px}.hist div{position:relative;padding:0 0 8px;font-size:.9rem}.hist div:before{content:"";position:absolute;left:-18px;top:6px;width:10px;height:10px;border-radius:50%;background:#2563eb;border:2px solid #fff}.hist small{display:block;color:var(--grey)}
.flatpick{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:4px;border:1px solid var(--line);border-radius:12px;padding:6px;max-height:220px;overflow:auto}.flatpick label{display:flex;gap:6px;align-items:center;padding:6px;border-radius:8px;cursor:pointer}.flatpick input{width:auto;min-height:0;margin:0;accent-color:#2563eb}
.note{font-size:.88rem;color:var(--grey);margin:0 0 10px}.late{color:#b42318;font-weight:700}.soon{color:#b45309;font-weight:700}
.tbl td small{display:block;color:var(--grey)}.dfx{font-size:.8rem;color:var(--grey);overflow-wrap:anywhere}
@media(min-width:900px){nav{overflow-y:auto}}`;
  document.head.appendChild(s);
})();

/* ---------- small helpers ---------- */
const dLeft = d => Math.round((U(String(d).slice(0, 10)) - U(ld())) / 864e5);
const dmx = d => d && /^\d{4}-\d{2}-\d{2}/.test(String(d)) ? dm(String(d).slice(0, 10)) : "";
const hmNow = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const t12 = x => { if (!/^\d{2}:\d{2}$/.test(String(x || ""))) return esc(x || ""); let [h, m] = String(x).split(":").map(Number); const a = h < 12 ? "AM" : "PM"; h = h % 12 || 12; return h + ":" + String(m).padStart(2, "0") + " " + a; };
const telOf = p => String(p || "").replace(/[^\d+]/g, "");
const callA = (p, cls = "", label = "") => telOf(p) ? `<a class="call ${cls}" href="tel:${esc(telOf(p))}" aria-label="Call ${esc(p)}">📞 ${esc(label || p)}</a>` : "";
/* form fields: an open pop-up form wins over the page's own form (both may use the same field names) */
const fq = id => { const ms = document.querySelectorAll(".modal"), md = ms[ms.length - 1], e = md && md.querySelector("#" + id); return e || $("#" + id); };
const val = id => { const e = fq(id); return e ? String(e.value || "").trim() : ""; };
const dueTag = d => { if (!d) return ""; const n = dLeft(d); return n < 0 ? `<span class="tag red">${-n} day${n === -1 ? "" : "s"} late</span>` : n === 0 ? `<span class="tag red">Due today</span>` : n <= 7 ? `<span class="tag amb">In ${n} day${n === 1 ? "" : "s"}</span>` : `<span class="tag gry">In ${n} days</span>`; };
const sel = (id, opts, cur, extra = "") => `<select id="${id}" ${extra}>${opts.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(cur ?? "") ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
const fld = (label, html, wide) => `<div${wide ? ' class="w"' : ""}><label class="fl">${label}</label>${html}</div>`;
const inp = (id, v = "", a = "") => `<input id="${id}" value="${esc(v ?? "")}" ${a}>`;
const dinp = (id, v = "") => `<input id="${id}" type="date" value="${esc(v ? String(v).slice(0, 10) : "")}">`;
const tarea = (id, v = "", ph = "") => `<textarea id="${id}" placeholder="${esc(ph)}">${esc(v ?? "")}</textarea>`;
async function allFlats() { const r = await db.rpc("all_flats"); return (r.data || []).slice().sort((x, y) => String(x.flat_no).localeCompare(String(y.flat_no), undefined, { numeric: true })); }
/* a pop-up form; returns {el, close} */
function sheet(title, html, onSave, saveLabel = "Save") {
  const d = document.createElement("div"); d.className = "modal";
  d.style.cssText = "position:fixed;inset:0;background:rgba(10,20,40,.55);display:grid;place-items:center;z-index:100;padding:16px";
  d.innerHTML = `<div class="card" style="max-width:560px;width:100%;margin:0"><b style="font-size:1.1rem">${title}</b>${html}<p class="err" id="sherr"></p><div class="f"><button class="ghost" id="shc" type="button">Cancel</button><button id="sho" type="button">${saveLabel}</button></div></div>`;
  document.body.appendChild(d);
  const close = () => { d.remove(); document.removeEventListener("keydown", esc0); }, esc0 = e => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", esc0);
  d.addEventListener("click", e => { if (e.target === d) close(); });
  d.querySelector("#shc").onclick = close;
  d.querySelector("#sho").onclick = async () => { const msg = await onSave(); if (msg) d.querySelector("#sherr").textContent = msg; else close(); };
  const f = d.querySelector("input,select,textarea"); if (f && matchMedia("(hover:hover)").matches) f.focus();
  return { el: d, close };
}
/* save in the background (the screen updates at once), with an extra local change when one save changes two lists */
async function saveBg(t, op, payload, filters, also) {
  const fl = filters || [];
  if (SNAP) {
    if (fl.some(([c, v]) => c === "id" && +v >= TMPID)) return "Still saving. Please try again in a moment.";
    bgRun(c => { applyLocal(c, t, op, payload, fl); if (also) also(c); }, () => api({ a: "write", t, op, payload, filters: fl }, 1));
    return "";
  }
  let q = db.from(t); q = op === "insert" ? q.insert(payload) : op === "update" ? q.update(payload) : q.delete();
  fl.forEach(([c, v]) => q.eq(c, v));
  const { error } = await q; return error ? error.message : "";
}
const nameOfAsset = (A, id) => { const a = (A || []).find(x => String(x.id) === String(id)); return a ? a.name : ""; };

/* =====================================================================================
   1. ASSETS & SERVICE HISTORY
   ===================================================================================== */
const AK = { lift: ["🛗", "Lift"], generator: ["🔋", "Generator"], motor: ["⚙️", "Motor"], water_pump: ["💧", "Water pump"], cctv: ["📹", "CCTV"], battery: ["🔌", "Battery / inverter"], other: ["🧰", "Other"] };
const AST = { working: ["Working", "grn"], repair: ["Under repair", "amb"], out_of_service: ["Out of service", "red"] };
const SVK = { service: "Service", repair: "Repair", inspection: "Inspection", replacement: "Replacement" };
function assetForm(a = {}) {
  return `<div class="f">${fld("Name", inp("an", a.name, 'placeholder="e.g. Lift (Block A)"'), 1)}${fld("Type", sel("ak", Object.entries(AK).map(([k, v]) => [k, v[1]]), a.kind || "lift"))}${fld("Condition", sel("ast", Object.entries(AST).map(([k, v]) => [k, v[0]]), a.status || "working"))}
  ${fld("Location", inp("al", a.location, 'placeholder="e.g. Cellar"'))}${fld("Installed on", dinp("ai", a.installed_on))}${fld("Supplier / service company", inp("av", a.vendor))}${fld("Supplier phone", inp("avp", a.vendor_phone, 'type="tel" inputmode="tel"'))}
  ${fld("Model", inp("am", a.model))}${fld("Serial number", inp("asn", a.serial_no))}${fld("Warranty / AMC ends on", dinp("aw", a.warranty_until))}${fld("Notes", tarea("ano", a.notes, "Anything useful: AMC details, capacity, battery count…"), 1)}</div>`;
}
const assetVals = () => ({ name: val("an"), kind: val("ak"), status: val("ast"), location: val("al"), installed_on: val("ai"), vendor: val("av"), vendor_phone: val("avp"), model: val("am"), serial_no: val("asn"), warranty_until: val("aw"), notes: val("ano") });
function serviceForm(A, s = {}, lockAsset, opt = {}) {
  const S = isIn(R_COM);
  return `<div class="f">${lockAsset ? "" : fld("Item", sel("sa", A.map(a => [a.id, a.name]), s.asset_id), 1)}${opt.noDate ? "" : fld("Date", dinp("sd", s.service_on || ld()))}${fld("Work done", sel("sk", Object.entries(SVK), s.kind || "service"))}
  ${fld("Done by", inp("sb", s.done_by, 'placeholder="Technician or company"'))}${S ? fld("Cost (₹)", inp("sc", s.cost, 'type="number" min="0" inputmode="decimal" placeholder="0 if free / AMC"')) : ""}
  ${fld("Details", tarea("sx", s.details, "What was checked, repaired or replaced"), 1)}${opt.noNext ? "" : fld("Next service due (optional, creates a reminder)", dinp("sn", s.next_due), 1)}</div>`;
}
const serviceVals = () => ({ service_on: val("sd"), kind: val("sk"), done_by: val("sb"), cost: val("sc") === "" ? "" : +val("sc"), details: val("sx"), next_due: val("sn") });

async function assets(m) {
  const [a, s, r, c] = await Promise.all([db.from("assets").select("*"), db.from("asset_service").select("*"), db.from("reminders").select("*"), db.from("complaints").select("*")]);
  const A = (a.data || []).sort((x, y) => String(x.name).localeCompare(String(y.name))), SV = s.data || [], RM = r.data || [], CP = c.data || [];
  const canA = isIn(R_S), canS = isIn(R_COM), seeCost = me.role !== "resident";
  const cnt = k => A.filter(x => (x.status || "working") === k).length;
  const hist = id => SV.filter(x => String(x.asset_id) === String(id)).sort((x, y) => String(y.service_on).localeCompare(String(x.service_on)));
  const card = x => {
    const k = AK[x.kind] || AK.other, st = AST[x.status] || AST.working, H = hist(x.id), last = H[0], nx = RM.filter(q => String(q.asset_id) === String(x.id) && q.status !== "done").sort((p, q) => String(p.due_on).localeCompare(q.due_on))[0];
    const wl = x.warranty_until ? dLeft(x.warranty_until) : null, cost = H.reduce((t, h) => t + (+h.cost || 0), 0), open = CP.filter(q => String(q.asset_id) === String(x.id) && q.status !== "resolved").length;
    return `<div class="card"><div class="ahead"><div class="em" aria-hidden="true">${k[0]}</div><div><b style="font-size:1.08rem">${esc(x.name)}</b> <span class="tag ${st[1]}">${st[0]}</span>${open ? ` <span class="tag red">${open} open complaint${open > 1 ? "s" : ""}</span>` : ""}
     <small style="display:block;color:var(--grey)">${esc([k[1], x.location].filter(Boolean).join(" · "))}</small></div></div>
     <dl class="kv">${x.installed_on ? `<dt>Installed</dt><dd>${dmx(x.installed_on)}</dd>` : ""}${x.warranty_until ? `<dt>Warranty / AMC</dt><dd>${dmx(x.warranty_until)} ${wl < 0 ? '<span class="tag red">Expired</span>' : wl <= 60 ? `<span class="tag amb">${wl} days left</span>` : ""}</dd>` : ""}
     ${x.vendor ? `<dt>Supplier</dt><dd>${esc(x.vendor)}</dd>` : ""}${x.model || x.serial_no ? `<dt>Model / serial</dt><dd>${esc([x.model, x.serial_no].filter(Boolean).join(" · "))}</dd>` : ""}
     <dt>Last service</dt><dd>${last ? dmx(last.service_on) + " · " + esc(SVK[last.kind] || last.kind) : "Not recorded yet"}</dd>${nx ? `<dt>Next due</dt><dd>${dmx(nx.due_on)} ${dueTag(nx.due_on)}</dd>` : ""}
     ${seeCost && cost ? `<dt>Service &amp; repair cost</dt><dd>${inr(cost)} in total</dd>` : ""}${x.notes ? `<dt>Notes</dt><dd>${esc(x.notes)}</dd>` : ""}</dl>
     ${x.vendor_phone ? `<div class="btnrow">${callA(x.vendor_phone, "alt", "Call supplier")}</div>` : ""}
     <details class="rec"><summary>Service history (${H.length})</summary>${H.length ? `<div class="tw"><table class="tbl"><thead><tr><th>Date</th><th>Work</th><th>Details</th>${seeCost ? '<th class="r">Cost</th>' : ""}${canA ? "<th></th>" : ""}</tr></thead><tbody>
      ${H.map(h => `<tr><td style="white-space:nowrap">${dmx(h.service_on)}</td><td>${esc(SVK[h.kind] || h.kind)}${h.done_by ? `<small>${esc(h.done_by)}</small>` : ""}</td><td>${esc(h.details || "")}</td>${seeCost ? `<td class="r">${h.cost !== "" && h.cost != null ? inr(h.cost) : "-"}</td>` : ""}${canA ? `<td><button class="ghost" data-sxd="${h.id}">Delete</button></td>` : ""}</tr>`).join("")}</tbody></table></div>` : `<p class="note">No service recorded yet.</p>`}</details>
     ${canS || canA ? `<div class="btnrow">${canS ? `<button data-sadd="${x.id}">+ Add service / repair</button>` : ""}${canA ? `<button class="ghost" data-aed="${x.id}">Edit</button><button class="ghost" data-adel="${x.id}">Delete</button>` : ""}</div>` : ""}</div>`;
  };
  m.innerHTML = `<div class="card" style="padding:12px"><div class="tiles"><div class="grn"><b>${cnt("working")}</b><small>Working</small></div><div class="amb"><b>${cnt("repair")}</b><small>Under repair</small></div><div class="red"><b>${cnt("out_of_service")}</b><small>Out of service</small></div></div></div>
  ${A.length ? `<div class="f">${prBtn("pas", "Print asset register")}</div>` : ""}
  ${A.map(card).join("") || `<div class="card">No items added yet.${canA ? " Add the lift, generator, motors, CCTV and water pumps below." : ""}</div>`}
  ${canA ? `<h2>Add an item</h2><div class="card">${assetForm()}<div class="f"><button class="w" id="asv">Save item</button></div></div>` : ""}`;
  if ($("#pas")) $("#pas").onclick = () => printHTML("Asset register", sheetHead("Apartment assets & service history") + A.map(x => {
    const H = hist(x.id), k = AK[x.kind] || AK.other;
    return `<h3>${esc(x.name)} <small>(${esc(k[1])} · ${(AST[x.status] || AST.working)[0]})</small></h3><div class="box">${esc([x.location && "Location: " + x.location, x.installed_on && "Installed: " + dmx(x.installed_on), x.warranty_until && "Warranty/AMC until: " + dmx(x.warranty_until), x.vendor && "Supplier: " + x.vendor + (x.vendor_phone ? " (" + x.vendor_phone + ")" : "")].filter(Boolean).join(" · ")) || "&nbsp;"}</div>` +
      ptable(["Date", "Work", "Done by", "Details"].concat(seeCost ? ["Cost"] : []), H.map(h => [dmx(h.service_on), esc(SVK[h.kind] || h.kind), esc(h.done_by || ""), esc(h.details || "")].concat(seeCost ? [h.cost !== "" && h.cost != null ? inr(h.cost) : "-"] : [])), null, ["", "", "", "", "r"]);
  }).join("") + SIG, true);
  if (canA) $("#asv").onclick = async () => { const v = assetVals(); if (!v.name) return toast("Enter the name of the item"); const e = await saveBg("assets", "insert", v); e ? toast(e) : (toast("Item saved"), render()); };
  m.querySelectorAll("[data-aed]").forEach(b => b.onclick = () => { const x = A.find(q => String(q.id) === b.dataset.aed);
    sheet("Edit " + esc(x.name), assetForm(x), async () => { const v = assetVals(); if (!v.name) return "Enter the name of the item"; const e = await saveBg("assets", "update", v, [["id", x.id]]); if (!e) { toast("Saved"); render(); } return e; }); });
  m.querySelectorAll("[data-adel]").forEach(b => b.onclick = async () => { const x = A.find(q => String(q.id) === b.dataset.adel);
    if (hist(x.id).length) return toast("This item has service records. Mark it \"Out of service\" instead.");
    if (!confirm("Delete this item? This is recorded in the audit log.")) return; const e = await saveBg("assets", "delete", null, [["id", x.id]]); e ? toast(e) : render(); });
  m.querySelectorAll("[data-sadd]").forEach(b => b.onclick = () => { const x = A.find(q => String(q.id) === b.dataset.sadd);
    sheet("Service / repair: " + esc(x.name), serviceForm(A, { asset_id: x.id }, true), async () => { const v = Object.assign(serviceVals(), { asset_id: x.id }); if (!v.service_on) return "Enter the date";
      const e = await saveBg("asset_service", "insert", v, [], v.next_due ? c => applyLocal(c, "reminders", "insert", { title: "Service due: " + x.name, asset_id: x.id, kind: "service", due_on: v.next_due, repeat_months: 0, notify_days: 7, status: "pending" }, []) : null);
      if (!e) { toast("Service record saved"); render(); } return e; }); });
  m.querySelectorAll("[data-sxd]").forEach(b => b.onclick = async () => { if (!confirm("Delete this service record? This is recorded in the audit log.")) return; const e = await saveBg("asset_service", "delete", null, [["id", b.dataset.sxd]]); e ? toast(e) : render(); });
}

/* =====================================================================================
   2. SERVICE REMINDERS (committee only)
   ===================================================================================== */
const RK = { service: "Service", warranty: "Warranty", amc: "AMC renewal", other: "Other" };
const REP = [[0, "Does not repeat"], [1, "Every month"], [3, "Every 3 months"], [6, "Every 6 months"], [12, "Every year"]];
const repLabel = n => { n = +n || 0; const f = REP.find(r => r[0] === n); return n ? (f ? f[1] : "Every " + n + " months") : ""; };
function remForm(A, r = {}) {
  const reps = REP.some(x => x[0] === (+r.repeat_months || 0)) ? REP : REP.concat([[+r.repeat_months, repLabel(r.repeat_months)]]);
  return `<div class="f">${fld("What is due", inp("rt", r.title, 'placeholder="e.g. Lift servicing"'), 1)}${fld("Item (optional)", sel("ra", [["", "Not linked to an item"]].concat(A.map(a => [a.id, a.name])), r.asset_id))}${fld("Type", sel("rk", Object.entries(RK), r.kind || "service"))}
  ${fld("Due on", dinp("rd", r.due_on))}${fld("Repeat", sel("rr", reps, +r.repeat_months || 0))}${fld("Alert this many days before", inp("rn", r.notify_days ?? 7, 'type="number" min="0" max="90" inputmode="numeric"'))}${fld("Notes", inp("rno", r.notes), 1)}</div>`;
}
const remVals = () => ({ title: val("rt"), asset_id: val("ra"), kind: val("rk"), due_on: val("rd"), repeat_months: +val("rr") || 0, notify_days: val("rn") === "" ? 7 : +val("rn"), notes: val("rno") });
async function reminders(m) {
  const [r, a] = await Promise.all([db.from("reminders").select("*"), db.from("assets").select("*")]);
  const R = r.data || [], A = (a.data || []).sort((x, y) => String(x.name).localeCompare(String(y.name))), canD = isIn(R_S);
  const P = R.filter(x => x.status !== "done").sort((x, y) => String(x.due_on).localeCompare(y.due_on)), late = P.filter(x => dLeft(x.due_on) < 0), up = P.filter(x => dLeft(x.due_on) >= 0);
  const D = R.filter(x => x.status === "done").sort((x, y) => String(y.done_on).localeCompare(String(x.done_on))), W = A.filter(x => x.warranty_until).sort((x, y) => String(x.warranty_until).localeCompare(y.warranty_until));
  const soon = up.filter(x => dLeft(x.due_on) <= 30).length;
  const row = x => `<div class="it"><div><b>${esc(x.title)}</b> ${dueTag(x.due_on)}<small>Due ${dmx(x.due_on)}${x.asset_id ? " · " + esc(nameOfAsset(A, x.asset_id)) : ""} · ${esc(RK[x.kind] || x.kind)}${+x.repeat_months ? " · " + repLabel(x.repeat_months) : ""} · alert ${+x.notify_days || 0} day${+x.notify_days === 1 ? "" : "s"} before${x.notes ? "<br>" + esc(x.notes) : ""}</small></div>
   <div style="display:flex;gap:6px;flex-wrap:wrap"><button data-rdone="${x.id}">Mark done</button><button class="ghost" data-red="${x.id}">Edit</button>${canD ? `<button class="ghost" data-rdel="${x.id}">Delete</button>` : ""}</div></div>`;
  m.innerHTML = `<p class="note">Committee phones that turned on alerts get one reminder message a day (after 8 AM) when something is coming up or overdue.</p>
  <div class="card" style="padding:12px"><div class="tiles"><div class="red"><b>${late.length}</b><small>Overdue</small></div><div class="amb"><b>${soon}</b><small>Due in 30 days</small></div><div class="grn"><b>${D.length}</b><small>Completed</small></div></div></div>
  <h2>Overdue</h2><div class="card">${late.map(row).join("") || "Nothing overdue. 👍"}</div>
  <h2>Upcoming</h2><div class="card">${up.map(row).join("") || "Nothing scheduled. Add a reminder below."}</div>
  ${W.length ? `<h2>Warranties &amp; AMC</h2><div class="card">${W.map(x => `<div class="it"><div>${(AK[x.kind] || AK.other)[0]} <b>${esc(x.name)}</b><small>Ends ${dmx(x.warranty_until)}</small></div><div>${dLeft(x.warranty_until) < 0 ? '<span class="tag red">Expired</span>' : dLeft(x.warranty_until) <= 30 ? `<span class="tag amb">${dLeft(x.warranty_until)} days left</span>` : dueTag(x.warranty_until)}</div></div>`).join("")}<p class="note" style="margin-top:8px">From the Assets page. Alerts go 30 days before and on the day.</p></div>` : ""}
  <h2>Add a reminder</h2><div class="card"><div class="chips">${[["Lift servicing", "lift", 1, "service"], ["Generator maintenance", "generator", 3, "service"], ["Battery warranty ends", "battery", 0, "warranty"], ["Water tank cleaning", "water_pump", 6, "service"]].map((p, i) => `<button class="ghost" type="button" data-pre="${i}">${p[0]}</button>`).join("")}</div>${remForm(A)}<div class="f"><button class="w" id="rsv">Save reminder</button></div></div>
  ${D.length ? `<h2>Completed</h2><div class="card">${D.slice(0, 25).map(x => `<div class="it"><div>${esc(x.title)}<small>Done ${dmx(x.done_on)} · was due ${dmx(x.due_on)}${x.asset_id ? " · " + esc(nameOfAsset(A, x.asset_id)) : ""}</small></div><span class="tag grn">Done</span></div>`).join("")}</div>` : ""}`;
  const PRE = [["Lift servicing", "lift", 1, "service"], ["Generator maintenance", "generator", 3, "service"], ["Battery warranty ends", "battery", 0, "warranty"], ["Water tank cleaning", "water_pump", 6, "service"]];
  m.querySelectorAll("[data-pre]").forEach(b => b.onclick = () => { const p = PRE[+b.dataset.pre], a0 = A.find(x => x.kind === p[1]);
    $("#rt").value = p[0]; $("#rr").value = p[2]; $("#rk").value = p[3]; if (a0) { $("#ra").value = a0.id; if (p[3] === "warranty" && a0.warranty_until) $("#rd").value = String(a0.warranty_until).slice(0, 10); } $("#rd").focus(); });
  $("#rsv").onclick = async () => { const v = remVals(); if (!v.title || !v.due_on) return toast("Enter what is due and the due date"); const e = await saveBg("reminders", "insert", v); e ? toast(e) : (toast("Reminder saved"), render()); };
  m.querySelectorAll("[data-red]").forEach(b => b.onclick = () => { const x = R.find(q => String(q.id) === b.dataset.red);
    sheet("Edit reminder", remForm(A, x), async () => { const v = remVals(); if (!v.title || !v.due_on) return "Enter what is due and the due date"; const e = await saveBg("reminders", "update", v, [["id", x.id]]); if (!e) { toast("Saved"); render(); } return e; }); });
  m.querySelectorAll("[data-rdel]").forEach(b => b.onclick = async () => { if (!confirm("Delete this reminder?")) return; const e = await saveBg("reminders", "delete", null, [["id", b.dataset.rdel]]); e ? toast(e) : render(); });
  m.querySelectorAll("[data-rdone]").forEach(b => b.onclick = () => { const x = R.find(q => String(q.id) === b.dataset.rdone), asset = A.find(q => String(q.id) === String(x.asset_id));
    sheet("Mark done: " + esc(x.title), `<div class="f">${fld("Done on", dinp("rdd", ld()))}${fld(+x.repeat_months ? "Next due (leave empty: " + repLabel(x.repeat_months).toLowerCase() + ")" : "Next due (optional)", dinp("rnd"))}</div>
     ${asset ? `<label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="rsh" checked style="width:auto;min-height:0"> Add to the service history of <b>${esc(asset.name)}</b></label><div id="rshf">${serviceForm(A, { asset_id: asset.id, kind: x.kind === "service" ? "service" : "inspection", details: x.title }, true, { noDate: 1, noNext: 1 })}</div>` : ""}`,
      async () => { const on = val("rdd") || ld(), nd = val("rnd");
        if (asset && fq("rsh").checked) { const v = Object.assign(serviceVals(), { asset_id: asset.id, service_on: on, next_due: nd, reminder_id: x.id });
          const e = await saveBg("asset_service", "insert", v, [], c => applyLocal(c, "reminders", "update", { status: "done", done_on: on }, [["id", x.id]])); if (!e) { toast("Marked done"); render(); } return e; }
        const e = await saveBg("reminders", "update", { status: "done", done_on: on, next_due: nd }, [["id", x.id]]); if (!e) { toast("Marked done"); render(); } return e; }, "Mark done");
    const cb = fq("rsh"); if (cb) cb.onchange = () => fq("rshf").style.display = cb.checked ? "" : "none"; });
}
/* the warning card on the Home page (committee only) */
async function remHome() {
  if (!isIn(R_COM)) return "";
  try {
    const [r, a] = await Promise.all([db.from("reminders").select("*"), db.from("assets").select("*")]);
    const P = (r.data || []).filter(x => x.status !== "done"), late = P.filter(x => dLeft(x.due_on) < 0), wk = P.filter(x => { const n = dLeft(x.due_on); return n >= 0 && n <= 7; });
    const wr = (a.data || []).filter(x => x.warranty_until && dLeft(x.warranty_until) >= 0 && dLeft(x.warranty_until) <= 30);
    if (!late.length && !wk.length && !wr.length) return "";
    const top = late.concat(wk).slice(0, 3).map(x => esc(x.title) + " (" + dmx(x.due_on) + ")").concat(wr.slice(0, 1).map(x => "Warranty: " + esc(x.name)));
    return `<div class="card" data-go="rem" role="button" tabindex="0" style="cursor:pointer;border-left:4px solid ${late.length ? "#b42318" : "#b45309"}"><b>🔔 Service reminders</b> ${late.length ? `<span class="tag red">${late.length} overdue</span>` : ""}${wk.length ? `<span class="tag amb">${wk.length} this week</span>` : ""}${wr.length ? `<span class="tag amb">${wr.length} warranty ending</span>` : ""}<small style="display:block;color:var(--grey)">${top.join(" · ")}</small></div>`;
  } catch (e) { return ""; }
}

/* =====================================================================================
   3. MEETING MANAGEMENT
   ===================================================================================== */
const AIS = { open: ["Open", "red"], in_progress: ["In progress", "amb"], done: ["Done", "grn"] };
let MALL = false;
function meetForm(x, flats) {
  const at = String(x.attendance || "").split("|").filter(Boolean);
  return `<div class="f">${fld("Title", inp("et", x.title), 1)}${fld("Date", dinp("ed", x.on_date))}${fld("Time", inp("eti", x.at_time, 'placeholder="e.g. 6:00 PM"'))}${fld("Place", inp("ep", x.place), 1)}
  ${fld("Agenda (one point per line)", tarea("eag", x.agenda, "1. Accounts\n2. Lift AMC renewal"), 1)}
  <div class="w"><label class="fl">Flats present</label><div class="flatpick" id="eat">${flats.map(f => `<label><input type="checkbox" value="${esc(f.flat_no)}"${at.includes(String(f.flat_no)) ? " checked" : ""}>${esc(f.flat_no)}</label>`).join("")}</div></div>
  ${fld("Others present (committee members, guests)", inp("eo", x.attendees_other), 1)}${fld("Minutes (what was discussed)", tarea("emi", x.minutes), 1)}${fld("Resolutions &amp; decisions (one per line)", tarea("ers", x.resolutions, "Resolved to renew the lift AMC with Otis"), 1)}</div>`;
}
async function meetings(m) {
  const can = isIn(R_N), canAI = isIn(R_S), res = me.role === "resident";
  const [md, ad, flats] = await Promise.all([db.from("meetings").select("*"), db.from("action_items").select("*"), allFlats()]);
  const L = (md.data || []).sort((a, b) => String(a.on_date).localeCompare(b.on_date)), AI = ad.data || [], today = ld();
  const up = L.filter(e => String(e.on_date) >= today), pa = L.filter(e => String(e.on_date) < today).reverse();
  const openAI = AI.filter(a => a.status !== "done").sort((a, b) => String(a.due_on || "9").localeCompare(String(b.due_on || "9")));
  const pub = e => e.status === "published";
  const lines = s => String(s || "").split("\n").map(x => x.trim()).filter(Boolean);
  const aiRow = a => `<tr><td>${esc(a.task)}</td><td>${esc(a.owner || "")}</td><td style="white-space:nowrap">${dmx(a.due_on) || "-"}${a.status !== "done" && a.due_on && dLeft(a.due_on) < 0 ? '<small class="late">Overdue</small>' : ""}</td>
   <td>${canAI ? `<select data-ais="${a.id}">${Object.entries(AIS).map(([k, v]) => `<option value="${k}"${k === a.status ? " selected" : ""}>${v[0]}</option>`).join("")}</select>` : `<span class="tag ${(AIS[a.status] || AIS.open)[1]}">${(AIS[a.status] || AIS.open)[0]}</span>`}${a.done_on ? `<small>Done ${dmx(a.done_on)}</small>` : ""}</td>${can ? `<td><button class="ghost" data-aix="${a.id}">Delete</button></td>` : ""}</tr>`;
  const card = e => {
    const t = mdy(e.on_date), A = AI.filter(a => String(a.meeting_id) === String(e.id)), at = String(e.attendance || "").split("|").filter(Boolean), showRec = !res || pub(e);
    const hasRec = e.minutes || e.resolutions || at.length || A.length || e.attendees_other;
    return `<div class="card"><div class="ev"><div class="d">${t.d}<small>${t.m}</small></div><div style="flex:1;min-width:0"><b>${esc(e.title)}</b> ${e.kind === "event" ? '<span class="tag gry">Event</span>' : ""}${!res ? (pub(e) ? '<span class="tag grn">Published</span>' : '<span class="tag amb">Draft</span>') : pub(e) && hasRec ? '<span class="tag grn">Minutes available</span>' : ""}
     <small style="display:block;color:var(--grey)">${esc([t.y, e.at_time, e.place].filter(Boolean).join(" · "))}</small></div></div>
     ${e.agenda ? `<div style="margin-top:10px"><b style="font-size:.9rem">Agenda</b><div class="pre">${esc(e.agenda)}</div></div>` : ""}
     ${showRec && hasRec ? `<details class="rec"${MALL ? " open" : ""}><summary>Meeting record</summary>
      ${at.length || e.attendees_other ? `<b style="font-size:.9rem">Attendance</b><p style="margin:2px 0 10px">${at.length ? `${at.length} of ${flats.length} flats: ${esc(at.join(", "))}` : ""}${e.attendees_other ? `${at.length ? "<br>" : ""}Also present: ${esc(e.attendees_other)}` : ""}</p>` : ""}
      ${e.minutes ? `<b style="font-size:.9rem">Minutes</b><div class="pre">${esc(e.minutes)}</div>` : ""}
      ${e.resolutions ? `<b style="font-size:.9rem">Resolutions &amp; decisions</b><ol style="margin:4px 0 10px;padding-left:22px">${lines(e.resolutions).map(r => `<li>${esc(r.replace(/^\d+[.)]\s*/, ""))}</li>`).join("")}</ol>` : ""}
      ${A.length ? `<b style="font-size:.9rem">Action items</b><div class="tw"><table class="tbl"><thead><tr><th>Task</th><th>Responsible</th><th>Due</th><th>Status</th>${can ? "<th></th>" : ""}</tr></thead><tbody>${A.map(aiRow).join("")}</tbody></table></div>` : ""}
      ${pub(e) && e.published_on ? `<p class="note">Published on ${dmx(e.published_on)}</p>` : ""}</details>` : ""}
     ${can && !res ? `<details class="rec"><summary>Add action item</summary><div class="f">${fld("Task", inp("ait" + e.id, "", 'placeholder="e.g. Get 3 quotes for lift AMC"'), 1)}${fld("Responsible person", inp("aio" + e.id, "", 'list="kkpeople" placeholder="e.g. Treasurer"'))}${fld("Due date", dinp("aid" + e.id))}<button class="w" data-aiadd="${e.id}">Add action item</button></div></details>` : ""}
     <div class="btnrow">${can ? `<button class="ghost" data-med="${e.id}">${hasRec ? "Edit record" : "Record attendance &amp; minutes"}</button><button class="ghost" data-mpub="${e.id}">${pub(e) ? "Unpublish" : "Publish to residents"}</button>` : ""}${showRec && (hasRec || e.agenda) ? `<button class="ghost" data-mpr="${e.id}">🖨 Print minutes</button>` : ""}${can ? `<button class="ghost" data-mx="${e.id}">Delete</button>` : ""}</div></div>`;
  };
  const ppl = ["President", "Secretary", "Treasurer", "Executive", "Admin"].concat(flats.map(f => "Flat " + f.flat_no));
  m.innerHTML = `<datalist id="kkpeople">${ppl.map(p => `<option value="${esc(p)}">`).join("")}</datalist>
  ${can ? `<div class="card"><b>Add meeting or event</b><div class="f"><input id="mt" class="w" placeholder="Title, e.g. Monthly meeting"><input id="md" type="date" value="${today}"><div><label class="fl">Time</label><div class="tsel"><select id="mh1" aria-label="Hour">${Array.from({ length: 12 }, (_, i) => `<option${i + 1 === 6 ? " selected" : ""}>${i + 1}</option>`).join("")}</select><select id="mh2" aria-label="Minutes">${["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(x => `<option>${x}</option>`).join("")}</select><select id="mh3" aria-label="AM or PM"><option>AM</option><option selected>PM</option></select></div></div><input id="mp" class="w" placeholder="Place"><select id="mk" class="w"><option value="meeting">Meeting</option><option value="event">Festival / event</option></select>${fld("Agenda (one point per line)", tarea("mag", "", "1. Accounts\n2. Lift AMC renewal"), 1)}<button class="w" id="ms">Save</button></div><p class="note" style="margin-top:8px">The agenda is shown to everybody. Attendance, minutes, resolutions and action items stay with the committee until you tap “Publish to residents”.</p></div>` : ""}
  ${openAI.length ? `<h2>Open action items · ${openAI.length}</h2><div class="card tw"><table class="tbl"><thead><tr><th>Task</th><th>Responsible</th><th>Due</th><th>Status</th>${can ? "<th></th>" : ""}</tr></thead><tbody>${openAI.map(aiRow).join("")}</tbody></table></div>` : ""}
  <h2>Upcoming</h2>${up.map(card).join("") || `<div class="card">Nothing scheduled yet.</div>`}
  ${pa.length ? `<h2>Earlier meetings</h2>${(MALL ? pa : pa.slice(0, 6)).map(card).join("")}${pa.length > 6 && !MALL ? `<button class="ghost" id="mall">Show all ${pa.length} earlier meetings</button>` : ""}` : ""}`;
  if ($("#mall")) $("#mall").onclick = () => { MALL = true; render(); };
  const byId = id => L.find(x => String(x.id) === String(id));
  if (can) $("#ms").onclick = async () => { const ti = $("#mt").value.trim(); if (!ti || !$("#md").value) return toast("Enter a title, date and type.");
    const e = await saveBg("meetings", "insert", { title: ti, on_date: $("#md").value, at_time: $("#mh1").value + ":" + $("#mh2").value + " " + $("#mh3").value, place: $("#mp").value.trim(), kind: $("#mk").value, agenda: val("mag") }); e ? toast(e) : (toast("Saved"), render()); };
  m.querySelectorAll("[data-med]").forEach(b => b.onclick = () => { const x = byId(b.dataset.med);
    sheet("Meeting record", meetForm(x, flats), async () => { const v = { title: val("et"), on_date: val("ed"), at_time: val("eti"), place: val("ep"), agenda: val("eag"), attendance: [...fq("eat").querySelectorAll("input:checked")].map(i => i.value).join("|"), attendees_other: val("eo"), minutes: val("emi"), resolutions: val("ers") };
      if (!v.title || !v.on_date) return "Enter a title and date."; const e = await saveBg("meetings", "update", v, [["id", x.id]]); if (!e) { toast("Saved"); render(); } return e; }); });
  m.querySelectorAll("[data-mpub]").forEach(b => b.onclick = async () => { const x = byId(b.dataset.mpub), p = x.status === "published";
    if (!confirm(p ? "Hide the minutes, attendance and action items from residents again?" : "Publish the attendance, minutes, resolutions and action items to all residents? Everyone gets an alert.")) return;
    const e = await saveBg("meetings", "update", { status: p ? "draft" : "published" }, [["id", x.id]]); e ? toast(e) : (toast(p ? "Unpublished" : "Published to residents"), render()); });
  m.querySelectorAll("[data-mx]").forEach(b => b.onclick = async () => { if (!confirm("Delete this meeting and its record?")) return; const e = await saveBg("meetings", "delete", null, [["id", b.dataset.mx]]); e ? toast(e) : render(); });
  m.querySelectorAll("[data-aiadd]").forEach(b => b.onclick = async () => { const id = b.dataset.aiadd, task = val("ait" + id); if (!task) return toast("Enter the task.");
    const e = await saveBg("action_items", "insert", { meeting_id: +id, task, owner: val("aio" + id), due_on: val("aid" + id) }); e ? toast(e) : (toast("Action item added"), render()); });
  m.querySelectorAll("[data-ais]").forEach(s => s.onchange = async () => { const e = await saveBg("action_items", "update", { status: s.value, done_on: s.value === "done" ? ld() : "" }, [["id", s.dataset.ais]]); e ? toast(e) : (toast("Status updated"), render()); });
  m.querySelectorAll("[data-aix]").forEach(b => b.onclick = async () => { if (!confirm("Delete this action item?")) return; const e = await saveBg("action_items", "delete", null, [["id", b.dataset.aix]]); e ? toast(e) : render(); });
  m.querySelectorAll("[data-mpr]").forEach(b => b.onclick = () => { const e = byId(b.dataset.mpr), A = AI.filter(a => String(a.meeting_id) === String(e.id)), at = String(e.attendance || "").split("|").filter(Boolean);
    printHTML("Minutes " + e.title, sheetHead((e.kind === "event" ? "Event: " : "Minutes of meeting: ") + e.title, dmx(e.on_date) + (e.at_time ? " · " + e.at_time : "") + (e.place ? " · " + e.place : "")) +
      (e.agenda ? `<h3>Agenda</h3><div class="box" style="white-space:pre-wrap;font-weight:400">${esc(e.agenda)}</div>` : "") +
      (at.length || e.attendees_other ? `<h3>Attendance</h3><p>${at.length ? "Flats present (" + at.length + " of " + flats.length + "): " + esc(at.join(", ")) : ""}${e.attendees_other ? "<br>Also present: " + esc(e.attendees_other) : ""}</p>` : "") +
      (e.minutes ? `<h3>Minutes</h3><div style="white-space:pre-wrap">${esc(e.minutes)}</div>` : "") +
      (e.resolutions ? `<h3>Resolutions &amp; decisions</h3><ol>${lines(e.resolutions).map(r => `<li>${esc(r.replace(/^\d+[.)]\s*/, ""))}</li>`).join("")}</ol>` : "") +
      (A.length ? `<h3>Action items</h3>` + ptable(["Sl.No", "Task", "Responsible", "Due", "Status"], A.map((a, i) => [i + 1, esc(a.task), esc(a.owner || ""), dmx(a.due_on) || "-", (AIS[a.status] || AIS.open)[0]]), null, ["c"]) : "") +
      `<div class="sig"><div>President: ____________</div><div>Secretary: ____________</div></div>`); });
}

/* =====================================================================================
   4. EMERGENCY CONTACTS (one tap to call)
   ===================================================================================== */
const CC = { fire: ["🚒", "Fire"], ambulance: ["🚑", "Ambulance"], police: ["🚓", "Police"], lift: ["🛗", "Lift technician"], generator: ["🔋", "Generator service"], electrician: ["⚡", "Electrician"], plumber: ["🔧", "Plumber"], security: ["🛡", "Security / watchman"], other: ["📞", "Other"] };
function ctForm(x = {}) {
  return `<div class="f">${fld("For", sel("cc", Object.entries(CC).map(([k, v]) => [k, v[1]]), x.category || "lift"))}${fld("Name", inp("cnm", x.name, 'placeholder="Person or company"'))}${fld("Phone", inp("cph1", x.phone, 'type="tel" inputmode="tel" placeholder="e.g. 98480 12345"'))}${fld("Other phone (optional)", inp("cph2", x.alt_phone, 'type="tel" inputmode="tel"'))}
  ${fld("Notes", inp("cno", x.notes, 'placeholder="e.g. Available 24 hours, AMC no. 1234"'), 1)}<label class="w" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="cver" style="width:auto;min-height:0"${x.id ? "" : " checked"}> I have checked this number today (marks it verified)</label></div>`;
}
const ctVals = () => ({ category: val("cc"), name: val("cnm"), phone: val("cph1"), alt_phone: val("cph2"), notes: val("cno"), verified: fq("cver").checked });
async function contacts(m) {
  const { data } = await db.from("contacts").select("*"), C = data || [], can = isIn(R_S), ord = Object.keys(CC);
  const top = C.filter(x => ["fire", "ambulance", "police"].includes(x.category) || String(x.phone) === "112").slice(0, 4);
  const rest = C.filter(x => !top.includes(x)).sort((a, b) => ord.indexOf(a.category) - ord.indexOf(b.category) || String(a.name).localeCompare(b.name));
  const ver = x => { if (!x.verified_on) return `<span class="tag gry">Not verified</span>`; const old = dLeft(x.verified_on) < -180; return `<span class="tag ${old ? "amb" : "grn"}">${old ? "Check again · " : "Verified "}${dmx(x.verified_on)}</span>`; };
  const row = x => { const c = CC[x.category] || CC.other;
    return `<div class="card"><div class="ctc"><div><span class="tag">${c[0]} ${esc(c[1])}</span> ${ver(x)}<div style="margin-top:4px"><b style="font-size:1.08rem">${esc(x.name)}</b></div><small style="color:var(--grey);display:block">${esc(x.phone)}${x.alt_phone ? " · " + esc(x.alt_phone) : ""}${x.notes ? "<br>" + esc(x.notes) : ""}</small></div>
     <div style="display:flex;gap:6px;flex-wrap:wrap">${callA(x.phone, "", "Call")}${x.alt_phone ? callA(x.alt_phone, "alt", "Other no.") : ""}</div></div>
     ${can ? `<div class="btnrow"><button class="ghost" data-ced="${x.id}">Edit</button><button class="ghost" data-cvf="${x.id}">Mark verified today</button><button class="ghost" data-cdl="${x.id}">Delete</button></div>` : ""}</div>`; };
  m.innerHTML = `${top.length ? `<div class="sosg">${top.map(x => `<a href="tel:${esc(telOf(x.phone))}" aria-label="Call ${esc(x.name)} ${esc(x.phone)}"><span>${(CC[x.category] || CC.other)[0]}</span><b>${esc(x.phone)}</b><small>${esc(x.name)}</small></a>`).join("")}</div>` : ""}
  <p class="note">Tap <b>Call</b> to phone straight away.</p>
  ${rest.map(row).join("") || `<div class="card">No apartment contacts yet.${can ? " Add the lift technician, electrician, plumber, generator service and watchman below." : ""}</div>`}
  ${can ? `<h2>Edit emergency numbers</h2>${top.map(row).join("")}<h2>Add a contact</h2><div class="card">${ctForm()}<div class="f"><button class="w" id="csv">Save contact</button></div></div>` : ""}
  <div class="f">${prBtn("pct", "Print contact list")}</div>`;
  $("#pct").onclick = () => printHTML("Emergency contacts", sheetHead("Emergency contacts") + ptable(["For", "Name", "Phone", "Other phone", "Notes", "Verified"], top.concat(rest).map(x => [esc((CC[x.category] || CC.other)[1]), esc(x.name), "<b>" + esc(x.phone) + "</b>", esc(x.alt_phone || ""), esc(x.notes || ""), dmx(x.verified_on) || "-"])));
  if (!can) return;
  $("#csv").onclick = async () => { const v = ctVals(); if (!v.name || !v.phone) return toast("Enter a name and a phone number"); const e = await saveBg("contacts", "insert", Object.assign(v, v.verified ? { verified_on: ld() } : {})); e ? toast(e) : (toast("Contact saved"), render()); };
  m.querySelectorAll("[data-ced]").forEach(b => b.onclick = () => { const x = C.find(q => String(q.id) === b.dataset.ced);
    sheet("Edit contact", ctForm(x), async () => { const v = ctVals(); if (!v.name || !v.phone) return "Enter a name and a phone number"; const e = await saveBg("contacts", "update", Object.assign(v, v.verified ? { verified_on: ld() } : {}), [["id", x.id]]); if (!e) { toast("Saved"); render(); } return e; }); });
  m.querySelectorAll("[data-cvf]").forEach(b => b.onclick = async () => { const e = await saveBg("contacts", "update", { verified: true, verified_on: ld() }, [["id", b.dataset.cvf]]); e ? toast(e) : (toast("Marked verified"), render()); });
  m.querySelectorAll("[data-cdl]").forEach(b => b.onclick = async () => { if (!confirm("Delete this contact?")) return; const e = await saveBg("contacts", "delete", null, [["id", b.dataset.cdl]]); e ? toast(e) : render(); });
}

/* =====================================================================================
   5. VISITOR REGISTER (names + flat + purpose + times; old daily counts still count)
   ===================================================================================== */
let vp = "d", VF = null;
const PURP = ["Guest / relative", "Delivery / courier", "Service / repair", "Cab / taxi", "Domestic help", "Official visit", "Other"];
async function visitors(m, canW0) {
  const canW = isIn(R_VIS), res = me.role === "resident", T = ld();
  const [{ data }, flats] = await Promise.all([db.from("visitors").select("*"), allFlats()]);
  const all = (data || []).map(r => ({ ...r, d: String(r.visit_on).slice(0, 10), n: +r.count || 0 })).sort((a, b) => a.d < b.d ? 1 : a.d > b.d ? -1 : String(b.in_time || "").localeCompare(String(a.in_time || "")) || b.id - a.id);
  const det = all.filter(r => r.name), seePh = !res && det.some(r => r.phone !== undefined);
  VF = VF || { from: "", to: "", flat: res ? "" : "", q: "" };
  const mon = d => { const x = U(d); x.setUTCDate(x.getUTCDate() - (x.getUTCDay() + 6) % 7); return iso(x); }, sun = d => { const x = U(d); x.setUTCDate(x.getUTCDate() + 6); return iso(x); };
  const grp = f => { const o = {}; all.forEach(r => { const k = f(r.d); o[k] = (o[k] || 0) + r.n; }); return o; }, sm = (f, k) => all.filter(r => f(r.d) === k).reduce((a, r) => a + r.n, 0);
  const fD = d => d, fW = mon, fM = d => d.slice(0, 7), fY = d => d.slice(0, 4);
  const cards = [["Today", sm(fD, T)], ["This week", sm(fW, mon(T))], ["This month", sm(fM, T.slice(0, 7))], ["This year", sm(fY, T.slice(0, 4))]];
  let list;
  const counts = all.filter(r => !r.name);
  if (vp === "d") { const g = grp(fD), keys = Object.keys(g).sort().reverse().slice(0, 60); list = keys.map(k => `<tr><td>${dm(k)}</td><td class="r">${g[k]}</td></tr>`).join(""); }
  else { const f = { w: fW, m: fM, y: fY }[vp], g = grp(f), keys = Object.keys(g).sort().reverse().slice(0, vp === "w" ? 20 : vp === "m" ? 24 : 50);
    list = keys.map(k => `<tr><td>${vp === "w" ? dm(k) + " – " + dm(sun(k)) : vp === "m" ? MN[+k.slice(5, 7) - 1] + " " + k.slice(0, 4) : k}</td><td class="r">${g[k]}</td></tr>`).join(""); }
  const head = { d: "Date", w: "Week (Mon – Sun)", m: "Month", y: "Year" }[vp];
  const inside = det.filter(r => r.d === T && !r.out_time);
  const q = VF.q.toLowerCase(), F = det.filter(r => (!VF.from || r.d >= VF.from) && (!VF.to || r.d <= VF.to) && (!VF.flat || String(r.flat_no) === VF.flat) && (!q || [r.name, r.purpose, r.phone].some(x => String(x || "").toLowerCase().includes(q))));
  const vrow = r => `<tr><td style="white-space:nowrap">${dm(r.d)}</td><td style="white-space:nowrap">${t12(r.in_time)}${r.out_time ? " – " + t12(r.out_time) : canW && r.d === T ? ' <span class="tag amb">Inside</span>' : ""}</td><td><b>${esc(r.name)}</b>${seePh && r.phone ? `<small>${esc(r.phone)}</small>` : ""}</td><td>${esc(r.flat_no || "")}</td><td>${esc(r.purpose || "")}</td>${canW ? `<td style="white-space:nowrap">${!r.out_time ? `<button class="ghost" data-vout="${r.id}">Exit now</button> ` : ""}<button class="ghost" data-vx="${r.id}">Delete</button></td>` : ""}</tr>`;
  const flatOpts = [["", res ? "" : "All flats"]].concat(flats.map(f => [String(f.flat_no), "Flat " + f.flat_no]), [["Common area", "Common area / office"]]);
  m.innerHTML = `<div class="card" style="padding:12px"><div class="tiles">${cards.map(([l, v]) => `<div><b>${v}</b><small>${l}</small></div>`).join("")}</div></div>
  ${canW ? `<h2>Record a visitor</h2><div class="card"><div class="f">${fld("Visitor name", inp("vnm", "", 'autocomplete="off" placeholder="Name"'))}${fld("Flat visited", sel("vfl", flatOpts.slice(1), ""))}${fld("Purpose", `<input id="vpu" list="vpul" placeholder="Choose or type"><datalist id="vpul">${PURP.map(p => `<option value="${esc(p)}">`).join("")}</datalist>`)}${fld("Phone (optional, committee only)", inp("vph", "", 'type="tel" inputmode="tel"'))}
   ${fld("Date", dinp("vdt", T))}${fld("Entry time", `<input id="vin" type="time" value="${hmNow()}">`)}<button class="w" id="vsv">Save visitor</button></div></div>
   ${inside.length ? `<h2>Inside now · ${inside.length}</h2><div class="card">${inside.map(r => `<div class="it"><div><b>${esc(r.name)}</b><small>Flat ${esc(r.flat_no)} · ${esc(r.purpose || "")} · in ${t12(r.in_time)}</small></div><button data-vout="${r.id}">Exit now</button></div>`).join("")}</div>` : ""}` : ""}
  <h2>${res ? "Visitors to your flat" : "Visitor register"}</h2>
  <div class="card"><div class="f">${fld("From", dinp("vff", VF.from))}${fld("To", dinp("vft", VF.to))}${res ? "" : fld("Flat", sel("vffl", flatOpts, VF.flat))}${fld("Search name or purpose", inp("vfq", VF.q, 'type="search" placeholder="e.g. courier"'), res)}</div>
   <div class="btnrow"><button id="vfgo">Show</button><button class="ghost" id="vfclr">Clear</button>${F.length ? prBtn("vpr", "Print register") : ""}</div></div>
  <div class="card tw"><table class="tbl"><thead><tr><th>Date</th><th>Time</th><th>Visitor</th><th>Flat</th><th>Purpose</th>${canW ? "<th></th>" : ""}</tr></thead><tbody>${F.slice(0, 200).map(vrow).join("") || `<tr><td colspan="${canW ? 6 : 5}">No visitors found.</td></tr>`}</tbody></table>${F.length > 200 ? `<p class="note">Showing the latest 200 of ${F.length}. Narrow the dates to see older ones.</p>` : ""}</div>
  ${canW ? `<h2>Add a visitor count (no names)</h2><div class="card"><div class="f">${dateField("vd", "Date")}<div class="w"><label class="fl" for="vn">Number of visitors</label><input id="vn" type="number" inputmode="numeric" min="1" step="1" placeholder="e.g. 25"></div><button class="w" id="vs">Save count</button></div>
   ${counts.length ? `<details class="rec"><summary>Count entries (${counts.length})</summary><table class="tbl"><tbody>${counts.slice(0, 60).map(r => `<tr><td>${dm(r.d)}</td><td class="r">${r.n}</td><td><button class="ghost" data-vx="${r.id}">Delete</button></td></tr>`).join("")}</tbody></table></details>` : ""}</div>` : ""}
  <h2>Visitors count</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px">${[["d", "Daily"], ["w", "Weekly"], ["m", "Monthly"], ["y", "Yearly"]].map(([k, l]) => `<button class="${vp === k ? "" : "ghost"}" data-vp="${k}">${l}</button>`).join("")}</div>
  <div class="card tw"><table class="tbl"><thead><tr><th>${head}</th><th class="r">Visitors</th></tr></thead><tbody>${list || `<tr><td colspan="2">Nothing yet.</td></tr>`}</tbody></table></div>`;
  m.querySelectorAll("[data-vp]").forEach(b => b.onclick = () => { vp = b.dataset.vp; render(); });
  $("#vfgo").onclick = () => { VF = { from: val("vff"), to: val("vft"), flat: res ? "" : val("vffl"), q: val("vfq") }; render(); };
  $("#vfclr").onclick = () => { VF = null; render(); };
  if ($("#vpr")) $("#vpr").onclick = () => printHTML("Visitor register", sheetHead("Visitor register", [VF.from && "From " + dmx(VF.from), VF.to && "to " + dmx(VF.to), VF.flat && "Flat " + VF.flat].filter(Boolean).join(" ")) +
    ptable(["Sl.No", "Date", "In", "Out", "Visitor", "Flat", "Purpose"].concat(seePh ? ["Phone"] : []), F.map((r, i) => [i + 1, dm(r.d), t12(r.in_time), t12(r.out_time), esc(r.name), esc(r.flat_no || ""), esc(r.purpose || "")].concat(seePh ? [esc(r.phone || "")] : [])), null, ["c"]) + SIG, true);
  if (!canW) return;
  $("#vsv").onclick = async () => { const v = { name: val("vnm"), flat_no: val("vfl"), purpose: val("vpu"), phone: val("vph"), visit_on: val("vdt"), in_time: val("vin") };
    if (!v.name) return toast("Enter the visitor's name"); if (!v.visit_on || !/^\d{2}:\d{2}$/.test(v.in_time)) return toast("Enter the date and entry time");
    const e = await saveBg("visitors", "insert", Object.assign(v, { count: 1 })); e ? toast(e) : (toast("Visitor saved"), render()); };
  $("#vs").onclick = async () => { const d = gd("vd"), n = Math.floor(+$("#vn").value); if (!d) return toast("Enter a valid date (dd/mm/yyyy)"); if (!(n >= 1)) return toast("Enter the number of visitors");
    const { error } = await db.from("visitors").insert({ visit_on: d, count: n }); error ? toast(error.message) : (toast("Saved: " + n + " visitors on " + dm(d)), render()); };
  m.querySelectorAll("[data-vout]").forEach(b => b.onclick = async () => { const e = await saveBg("visitors", "update", { out_time: hmNow() }, [["id", b.dataset.vout]]); e ? toast(e) : (toast("Exit time saved"), render()); });
  m.querySelectorAll("[data-vx]").forEach(b => b.onclick = async () => { if (!confirm("Delete this entry?")) return; const e = await saveBg("visitors", "delete", null, [["id", b.dataset.vx]]); e ? toast(e) : render(); });
}

/* =====================================================================================
   6. COMPLAINT TRACKING (ticket numbers, assignment, expected date, history, linked item)
   ===================================================================================== */
let CF = "all", CQ = "";
const tkt = c => c.ticket_no || (+c.id >= TMPID ? "Ticket number coming…" : "#" + c.id);
async function complaints(m) {
  const S = isIn(R_S), [cd, ad, ct] = await Promise.all([db.from("complaints").select("*").order("id", { ascending: false }), db.from("assets").select("*"), db.from("contacts").select("*")]);
  const all = cd.data || [], A = (ad.data || []).sort((x, y) => String(x.name).localeCompare(String(y.name))), q = CQ.toLowerCase();
  const n = s => all.filter(c => c.status === s).length;
  const L = all.filter(c => (CF === "all" || c.status === CF) && (!q || [c.ticket_no, c.title, c.details, c.flat_no, c.assigned_to].some(x => String(x || "").toLowerCase().includes(q))));
  const LBL = Object.fromEntries(CS);
  const hist = c => { let h = []; try { h = JSON.parse(c.history || "[]"); } catch (e) {} if (!h.length) h = [{ at: c.created_at, by: c.flat_no, status: "open", note: "Complaint raised" }];
    return `<div class="hist">${h.slice().reverse().map(e => `<div>${e.status ? `<b>${esc(LBL[e.status] || e.status)}</b>` : ""}${e.assigned_to ? `${e.status ? " · " : ""}Assigned to <b>${esc(e.assigned_to)}</b>` : ""}${e.expected_on ? ` · expected by ${dmx(e.expected_on)}` : ""}${e.note ? `<br>${esc(e.note)}` : ""}<small>${esc(String(e.at || "").replace(/^(\d{4})-(\d{2})-(\d{2})/, (x, y, mo, d) => +d + "/" + +mo + "/" + y))} · ${esc(/^\d/.test(String(e.by)) ? "Flat " + e.by : cap(String(e.by || "")))}</small></div>`).join("")}</div>`; };
  const card = c => { const k = CS.findIndex(x => x[0] === c.status), late = c.expected_on && c.status !== "resolved" && dLeft(c.expected_on) < 0, it = c.asset_id ? nameOfAsset(A, c.asset_id) : "";
    return `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><span class="tag">🎫 ${esc(tkt(c))}</span><span class="tag ${c.status === "resolved" ? "grn" : c.status === "in_progress" ? "amb" : "red"}">${esc(LBL[c.status] || c.status)}</span></div>
     <b style="display:block;margin-top:6px">${esc(c.title)}</b>${c.details ? `<div>${esc(c.details)}</div>` : ""}${c.photos ? `<div class="phs">${String(c.photos).split("|").filter(Boolean).map(phTag).join("")}</div>` : ""}${c.voice ? vnTag(c.voice) : ""}
     <dl class="kv"><dt>Raised</dt><dd>Flat ${esc(c.flat_no)} · ${dmx(c.created_at)}</dd>${it ? `<dt>Related to</dt><dd>${esc(it)}</dd>` : ""}<dt>Assigned to</dt><dd>${c.assigned_to ? esc(c.assigned_to) : '<span style="color:var(--grey)">Not assigned yet</span>'}</dd>${c.expected_on ? `<dt>Expected by</dt><dd${late ? ' class="late"' : ""}>${dmx(c.expected_on)}${late ? " (overdue)" : ""}</dd>` : ""}${c.updated_at && c.updated_at !== c.created_at ? `<dt>Last update</dt><dd>${dmx(c.updated_at)}</dd>` : ""}</dl>
     <div class="stp">${CS.map((x, i) => `<span class="${i <= k ? "on" : ""}"></span>`).join("")}</div>
     <details class="rec"><summary>Status history</summary>${hist(c)}</details>
     ${S ? `<div class="btnrow"><button data-cu="${c.id}">Update status</button><button class="ghost" data-cx="${c.id}">Delete</button></div>` : ""}</div>`; };
  m.innerHTML = `<div class="card"><b>Raise a complaint</b><div style="height:8px"></div><input id="ct" placeholder="What is the problem? e.g. Lift not working"><div style="height:8px"></div><input id="cd" placeholder="More details (optional)"><div style="height:8px"></div>
   ${A.length ? `${sel("cas", [["", "Related to (optional): choose an item"]].concat(A.map(a => [a.id, (AK[a.kind] || AK.other)[0] + " " + a.name])), "", 'aria-label="Related item"')}<div style="height:8px"></div>` : ""}${pickHtml("cph")}<div style="height:8px"></div>${voiceHtml("cvn")}<div style="height:8px"></div><button id="cs">Submit complaint</button>
   <p class="note" style="margin:8px 0 0">You get a ticket number, and an alert on your phone whenever the status changes.</p></div>
  <h2>${S ? "All complaints" : "Your complaints"}</h2>
  ${all.length ? `<div class="chips">${[["all", "All", all.length], ["open", "Open", n("open")], ["in_progress", "In progress", n("in_progress")], ["resolved", "Resolved", n("resolved")]].map(([k, l, c]) => `<button class="${CF === k ? "" : "ghost"}" data-cf="${k}">${l} · ${c}</button>`).join("")}</div>
   ${all.length > 3 ? `<div style="display:flex;gap:8px;margin-bottom:12px"><input id="cq" type="search" value="${esc(CQ)}" placeholder="Search ticket, flat or words" style="flex:1;min-width:0"><button class="ghost" id="cqg" style="width:auto">Search</button></div>` : ""}` : ""}
  ${L.map(card).join("") || `<div class="card">${all.length ? "No complaints match." : "No complaints. 🎉"}</div>`}
  ${S && all.length ? `<div class="f">${prBtn("pcp", "Print complaint register")}</div>` : ""}`;
  loadPh(m); vnBind(m); pickInit("cph", 3); voiceInit("cvn");
  m.querySelectorAll("[data-cf]").forEach(b => b.onclick = () => { CF = b.dataset.cf; render(); });
  if ($("#cqg")) { const go = () => { CQ = $("#cq").value.trim(); render(); }; $("#cqg").onclick = go; $("#cq").onkeydown = e => { if (e.key === "Enter") go(); }; }
  if ($("#pcp")) $("#pcp").onclick = () => printHTML("Complaint register", sheetHead("Complaint register", CF === "all" ? "" : LBL[CF]) + ptable(["Ticket", "Raised", "Flat", "Problem", "Related to", "Assigned to", "Expected", "Status"],
    L.map(c => [esc(tkt(c)), dmx(c.created_at), esc(c.flat_no), esc(c.title) + (c.details ? "<br><small>" + esc(c.details) + "</small>" : ""), esc(c.asset_id ? nameOfAsset(A, c.asset_id) : ""), esc(c.assigned_to || ""), dmx(c.expected_on), esc(LBL[c.status] || c.status)])) + SIG, true);
  $("#cs").onclick = async () => { const t = $("#ct").value.trim(); if (!t) return toast("Please describe the problem."); const dt = $("#cd").value.trim(), aid = $("#cas") ? $("#cas").value : "", v = VN.cvn; VN.cvn = null;
    const loc = (PK.cph || []).splice(0).map(d => { const lid = LID(); PH[lid] = Promise.resolve(d); const pre = UP.get(d); UP.delete(d); return { lid, d, pre }; });
    if (!SNAP) { const b = $("#cs"); b.disabled = true; b.textContent = "Uploading…"; }
    bgRun(T => applyLocal(T, "complaints", "insert", { title: t, details: dt, asset_id: aid, photos: loc.map(x => x.lid).join("|"), voice: "" }, []), async () => { const ids = []; for (const x of loc) ids.push(await upOne(x.d, "complaint", x.pre));
      const voice = v ? await upOne(v.d, "complaint", v.p) : ""; const w = await wrIns("complaints", { title: t, details: dt, asset_id: aid, photos: ids.join("|"), voice }); bgDrive(); return w; }).catch(() => {});
    toast("Complaint sent"); render(); };
  m.querySelectorAll("[data-cu]").forEach(b => b.onclick = () => { const c = all.find(x => String(x.id) === b.dataset.cu), ppl = (ct.data || []).map(x => x.name).filter(Boolean);
    sheet("Update " + esc(tkt(c)), `<p class="note" style="margin:6px 0 0">${esc(c.title)} · Flat ${esc(c.flat_no)}</p><div class="f">${fld("Status", sel("cus", CS, c.status))}${fld("Expected completion", dinp("cue", c.expected_on))}
     ${fld("Assigned to", `<input id="cua" list="cual" value="${esc(c.assigned_to || "")}" placeholder="Person or company"><datalist id="cual">${ppl.map(p => `<option value="${esc(p)}">`).join("")}</datalist>`, 1)}
     ${A.length ? fld("Related to", sel("cuit", [["", "Nothing selected"]].concat(A.map(a => [a.id, a.name])), c.asset_id), 1) : ""}${fld("Note for the resident (optional)", inp("cun", "", 'placeholder="e.g. Technician will come tomorrow"'), 1)}</div>`,
      async () => { const p = { status: val("cus"), expected_on: val("cue"), assigned_to: val("cua"), note: val("cun") }; if ($("#cuit")) p.asset_id = val("cuit");
        const e = await saveBg("complaints", "update", p, [["id", c.id]]); if (!e) { toast("Updated. The resident gets an alert."); render(); } return e; }, "Save update"); });
  m.querySelectorAll("[data-cx]").forEach(b => b.onclick = async () => { if (!confirm("Delete this complaint? This is recorded in the audit log.")) return; const e = await saveBg("complaints", "delete", null, [["id", b.dataset.cx]]); e ? toast(e) : render(); });
}

/* =====================================================================================
   7. AUDIT LOG (president, secretary, treasurer, admin): read-only
   ===================================================================================== */
const AT = { payments: "Payments", expenses: "Expenses", income: "Income", maintenance_rates: "Maintenance per flat", closed_months: "Month lock", settings: "Opening balance", celebrations: "Celebrations",
  complaints: "Complaints", meetings: "Meetings", action_items: "Action items", notices: "Notices", polls: "Polls", gallery: "Documents", visitors: "Visitors", assets: "Assets", asset_service: "Service records",
  reminders: "Reminders", contacts: "Emergency contacts", maintenance_log: "Maintenance log", status: "Apartment status", users: "Passwords" };
const AA = { insert: ["Added", "grn"], update: ["Changed", "amb"], delete: ["Deleted", "red"], password: ["Password", "gry"] };
let AF = { tbl: "", act: "", who: "", from: "", to: "" }, AR = null;
async function auditLog(m) {
  if (!isIn(R_S)) { m.innerHTML = `<div class="card">Only the president, secretary, treasurer and admin can see the audit log.</div>`; return; }
  const ids = ["1234", "president", "secretary", "treasurer", "executive"].concat(IDS.filter(x => /^\d/.test(x.u)).map(x => x.u));
  m.innerHTML = `<p class="note">Every addition, change and deletion of money entries (payments, expenses, income, month locks) and other important records, with who did it and when. Entries cannot be changed or deleted from the app.</p>
  <div class="card"><div class="f">${fld("Section", sel("af1", [["", "All sections"]].concat(Object.entries(AT)), AF.tbl))}${fld("Action", sel("af2", [["", "All actions"]].concat(Object.entries(AA).map(([k, v]) => [k, v[0]])), AF.act))}
   ${fld("Done by", sel("af3", [["", "Everybody"]].concat(ids.map(u => [u, u === "1234" ? "Admin" : /^\d/.test(u) ? "Flat " + u : cap(u)])), AF.who))}<div></div>${fld("From", dinp("af4", AF.from))}${fld("To", dinp("af5", AF.to))}</div>
   <div class="btnrow"><button id="ago">Show</button><button class="ghost" id="aclr">Clear</button></div></div><div id="aout"><div class="card">Loading…</div></div>`;
  const show = rows => {
    const fmtJ = s => { try { const o = JSON.parse(s); return Object.entries(o).filter(([k, v]) => v !== null && v !== "" && !["created_at", "updated_at"].includes(k)).map(([k, v]) => `${esc(k.replace(/_/g, " "))}: <b>${esc(String(v).slice(0, 160))}</b>`).join(" · "); } catch (e) { return esc(s || ""); } };
    const det = r => { const b = r.before ? fmtJ(r.before) : "", a = r.after ? fmtJ(r.after) : ""; return b || a ? `<details><summary class="dfx">Details</summary><div class="dfx">${b ? "Before: " + b : ""}${b && a ? "<br>" : ""}${a ? (r.action === "update" ? "Changed to: " : "Saved: ") + a : ""}</div></details>` : ""; };
    const who = r => /^\d+$/.test(String(r.username)) && r.role === "resident" ? "Flat " + r.username : r.role === "admin" ? "Admin" : cap(String(r.role || r.username || ""));
    const when = r => esc(String(r.at || "").replace(/^(\d{4})-(\d{2})-(\d{2})/, (x, y, mo, d) => d + "/" + mo + "/" + y));
    $("#aout").innerHTML = `<div class="f">${prBtn("apr", "Print")}</div><div class="card">${rows.map(r => { const a = AA[r.action] || [r.action, "gry"];
      return `<div class="it" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span><span class="tag ${a[1]}">${esc(a[0])}</span> <b>${esc(AT[r.tbl] || r.tbl)}</b></span><small style="color:var(--grey)">${when(r)} · ${esc(who(r))}</small></div><div style="margin-top:4px;overflow-wrap:anywhere">${esc(r.summary || "")}</div>${det(r)}</div>`; }).join("") || "Nothing recorded for this choice."}
     ${rows.length >= 400 ? `<p class="note">Showing the latest 400. Choose dates or a section to see older entries.</p>` : ""}</div>`;
    $("#apr").onclick = () => printHTML("Audit log", sheetHead("Audit log", [AF.tbl && AT[AF.tbl], AF.from && "from " + dmx(AF.from), AF.to && "to " + dmx(AF.to)].filter(Boolean).join(" ")) + ptable(["When", "Who", "Action", "Section", "Record"], rows.map(r => [esc(r.at), esc(who(r)), esc((AA[r.action] || [r.action])[0]), esc(AT[r.tbl] || r.tbl), esc(r.summary || "")])), true);
  };
  const load = async () => { try { const r = await api({ a: "audit", ...AF }); if (r.error) throw new Error(r.error.message); AR = r.rows || []; show(AR); } catch (e) { $("#aout").innerHTML = `<div class="card"><p class="err">${esc(e.message)}</p></div>`; } };
  $("#ago").onclick = () => { AF = { tbl: val("af1"), act: val("af2"), who: val("af3"), from: val("af4"), to: val("af5") }; load(); };
  $("#aclr").onclick = () => { AF = { tbl: "", act: "", who: "", from: "", to: "" }; auditLog(m); };
  load();
}
