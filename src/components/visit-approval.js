/* Visitor approval cards and Approve / Deny buttons (used on Home and on the Visitors page). */
/* =====================================================================================
   5. VISITOR REGISTER (names + flat + purpose + times; old daily counts still count)
   ===================================================================================== */
let vp = "d", VF = null, GATE_T = null, PASSHOW = null, ALF = "";
/* gate: the Always allowed list's flat filter starts at "All flats" whenever the app is opened again or comes back from the background */
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && ALF) { ALF = ""; if (typeof tab !== "undefined" && tab === "vis" && me && isIn(R_VIS)) calm(); } });
/* visitor approval: what each status means on screen */
const VST = { waiting: ["Waiting for flat", "amb"], no_answer: ["No answer", "red"], approved: ["Approved", "grn"], denied: ["Denied", "red"], leave_at_gate: ["Leave at gate", "gry"], register: ["From register book", "gry"],
  pre_approved: ["Pre-approved", "grn"], always: ["Always allowed", "grn"], cancelled: ["Cancelled", "gry"], by_flat: ["Entered by flat", "gry"] };
const vTag = r => r.status && VST[r.status] ? `<span class="tag ${VST[r.status][1]}">${VST[r.status][0]}</span>` : "";
const askedAt = r => { const m = /\d{2}:\d{2}$/.exec(String(r.created_at || "")); return m ? m[0] : r.in_time; };
/* INSTANT: show the change at once, send it to Google in the background (a refusal is explained and the screen reloads) */
function instant(apply, body) {
  if (!SNAP) return api(body).then(w => { if (w.error) throw new Error(w.error.message); GEN++; if (w.snapshot) adopt(w.snapshot); return w; });
  bgRun(apply, () => api(body, 1)).catch(() => {});
  return Promise.resolve({ ok: true });
}
const wbody = (t, op, payload, filters) => ({ a: "write", t, op, payload, filters: filters || [] });
const setRow = (t, id, ch) => c => (c[t] || []).filter(r => String(r.id) === String(id)).forEach(r => Object.assign(r, ch));
/* resident answers from inside the app (the alert's own buttons do the same thing without opening the app) */
async function decideVisit(id, decision) {
  if (+id >= TMPID) return toast("Still saving. Please try again in a moment.");
  const st = { approve: "approved", deny: "denied", gate: "leave_at_gate" }[decision];
  try { await instant(setRow("visitors", id, { status: st, decided_by: me.id, decided_at: nowS() }), { a: "visitorDecide", id, decision });
    toast(decision === "approve" ? "Approved. The gate has been told." : decision === "deny" ? "Denied. The gate has been told." : "The gate will keep it for you."); render(); }
  catch (e) { toast(e.message); }
}
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-vdec]"); if (!b) return; const [id, d] = b.dataset.vdec.split(":"); b.disabled = true; decideVisit(id, d); });
const waitCard = (r, mine) => `<div class="card" style="border-left:4px solid #b45309"><b>🔔 ${esc(r.name)}${r.purpose ? " · " + esc(r.purpose) : ""}</b> ${vTag(r)}
  <small style="display:block;color:var(--grey)">At the gate for Flat ${esc(r.flat_no)} · asked at ${t12(askedAt(r))}</small>
  ${mine ? `<div class="btnrow"><button data-vdec="${r.id}:approve" style="background:linear-gradient(135deg,#15803d,#22a35a)">Approve</button><button class="ghost" data-vdec="${r.id}:deny">Deny</button>${/deliver|courier|parcel/i.test(r.purpose || "") ? `<button class="ghost" data-vdec="${r.id}:gate">Leave at gate</button>` : ""}</div>` : ""}</div>`;
