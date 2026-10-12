/* Shared pieces for the Association pages: roles, form fields, the pop-up sheet (modal), saving in the background. */
/* Permissions shown here only hide buttons. The real checks are made by the Google Apps Script (Code.gs). */

/* ---------- who may do what (keep in step with RULES in Code.gs) ---------- */
const R_S = ["admin", "treasurer", "secretary", "president"], R_N = ["admin", "president", "secretary"],
  R_COM = ["admin", "president", "secretary", "treasurer", "executive"], R_VIS = ["admin", "treasurer", "secretary", "executive", "watchman"];
const isIn = g => !!(me && g.includes(me.role));
/* ---------- menu icons for the new pages ---------- */
const FIC = (p => ({
  assets: p('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h3"/>'),
  rem: p('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M5 3 2 6M19 3l3 3"/>'),
  sos: p('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
  audit: p('<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>')
}))(d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`);
/* ---------- small helpers ---------- */
const dLeft = d => Math.round((U(String(d).slice(0, 10)) - U(ld())) / 864e5);
const dmx = d => d && /^\d{4}-\d{2}-\d{2}/.test(String(d)) ? dm(String(d).slice(0, 10)) : "";
const t12 = x => { if (!/^\d{2}:\d{2}$/.test(String(x || ""))) return esc(x || ""); let [h, m] = String(x).split(":").map(Number); const a = h < 12 ? "AM" : "PM"; h = h % 12 || 12; return h + ":" + String(m).padStart(2, "0") + " " + a; };
const telOf = p => String(p || "").replace(/[^\d+]/g, "");
const callA = (p, cls = "", label = "") => telOf(p) ? `<a class="call ${cls}" href="tel:${esc(telOf(p))}" aria-label="Call ${esc(p)}">📞 ${esc(label || p)}</a>` : "";
/* form fields: an open pop-up form wins over the page's own form (both may use the same field names) */
const fq = id => { const ms = document.querySelectorAll(".modal"), md = ms[ms.length - 1], e = md && md.querySelector("#" + id); return e || $("#" + id); };
const val = id => { const e = fq(id); return e ? String(e.value || "").trim() : ""; };
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
/* =====================================================================================
   7. AUDIT LOG (president, secretary, treasurer, admin): read-only
   ===================================================================================== */
const AT = { payments: "Payments", expenses: "Expenses", income: "Income", maintenance_rates: "Maintenance per flat", closed_months: "Month lock", settings: "Opening balance", celebrations: "Celebrations",
  complaints: "Complaints", meetings: "Meetings", action_items: "Action items", notices: "Notices", polls: "Polls", gallery: "Documents", visitors: "Visitors", assets: "Assets", asset_service: "Service records",
  reminders: "Reminders", contacts: "Contacts", maintenance_log: "Maintenance log", status: "Apartment status", users: "Passwords" };
const AA = { insert: ["Added", "grn"], update: ["Changed", "amb"], delete: ["Deleted", "red"], password: ["Password", "gry"] };
/* =====================================================================================
   8. WATCHMAN: attendance, paid leave balance, leave requests (gate login) and leave recorded by the Association.
      An approved leave is posted as a notice automatically (Notices, Recent activity, alert to everyone).
   ===================================================================================== */
FIC.staff = (d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`)('<circle cx="12" cy="7" r="4"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/><path d="M9 3.5 12 2l3 1.5"/>');
let STF = null, ATM = null;
try { STF = localStorage.getItem("kk_staff") || null; } catch (e) {}
