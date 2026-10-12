/* Page: reminders. Loaded only when this page is opened. */
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
  m.innerHTML = `<p class="note">Association phones that turned on alerts get one reminder message a day (after 8 AM) when something is coming up or overdue.</p>
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
