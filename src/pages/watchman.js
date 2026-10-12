/* Page: watchman. Loaded only when this page is opened. */
const LVS = { requested: ["Waiting for approval", "amb"], approved: ["Approved", "grn"], rejected: ["Not approved", "red"], cancelled: ["Cancelled", "gry"] };
const ATS = { present: ["P", "Present", "grn"], half: ["½", "Half day", "amb"], absent: ["A", "Absent", "red"] };
const ymd = d => d.toISOString().slice(0, 10);
const daysIn = (from, to) => { const out = []; const a = U(String(from).slice(0, 10)), b = U(String(to || from).slice(0, 10)); for (let d = new Date(a); d <= b && out.length < 400; d.setUTCDate(d.getUTCDate() + 1)) out.push(ymd(d)); return out; };
async function staffPage(m) {
  const [sd, ld0, ad] = await Promise.all([db.from("staff").select("*"), db.from("leaves").select("*"), db.from("attendance").select("*")]);
  const assoc = isIn(R_S), gate = me.role === "watchman", T = ld(), Y = T.slice(0, 4);
  const staff = (sd.data || []).filter(x => x.active !== "no" || assoc).sort((a, b) => (a.active === "no") - (b.active === "no") || String(a.name).localeCompare(b.name));
  const active = staff.filter(x => x.active !== "no"), LV = (ld0.data || []).sort((a, b) => String(b.from_date).localeCompare(a.from_date)), AT = ad.data || [];
  if (!staff.some(x => String(x.id) === String(STF))) STF = active[0] ? String(active[0].id) : staff[0] ? String(staff[0].id) : null;
  const cur = staff.find(x => String(x.id) === String(STF));
  ATM = ATM || T.slice(0, 7);
  const leaveOn = (sid, day) => LV.find(l => String(l.staff_id) === String(sid) && l.status === "approved" && String(l.from_date).slice(0, 10) <= day && String(l.to_date || l.from_date).slice(0, 10) >= day);
  const markOn = (sid, day) => AT.find(a => String(a.staff_id) === String(sid) && String(a.on_date).slice(0, 10) === day);
  const paidUsed = sid => LV.filter(l => String(l.staff_id) === String(sid) && l.status === "approved" && l.kind !== "unpaid").reduce((n, l) => n + daysIn(l.from_date, l.to_date).filter(d => d.slice(0, 4) === Y).length, 0);
  const unpaidUsed = sid => LV.filter(l => String(l.staff_id) === String(sid) && l.status === "approved" && l.kind === "unpaid").reduce((n, l) => n + daysIn(l.from_date, l.to_date).filter(d => d.slice(0, 4) === Y).length, 0);
  const monthDays = ym => { const [y, mo] = ym.split("-").map(Number), n = new Date(Date.UTC(y, mo, 0)).getUTCDate(); return Array.from({ length: n }, (_, i) => ym + "-" + String(i + 1).padStart(2, "0")); };
  const dayState = (sid, day) => { const l = leaveOn(sid, day); if (l) return l.kind === "unpaid" ? ["U", "Unpaid leave", "gry"] : ["L", "Paid leave", "blu"]; const a = markOn(sid, day); if (a && ATS[a.status]) return ATS[a.status]; return day <= T ? ["–", "Not marked", ""] : ["", "", ""]; };
  const tally = (sid, ym) => { const t = { P: 0, "½": 0, A: 0, L: 0, U: 0, "–": 0 }; monthDays(ym).forEach(d => { const k = dayState(sid, d)[0]; if (k in t) t[k]++; }); return t; };
  const lvRow = l => { const s = staff.find(x => String(x.id) === String(l.staff_id)) || { name: "Watchman" }, st = LVS[l.status] || [l.status, "gry"];
    return `<div class="it"><div><b>${esc(s.name)}</b> <span class="tag ${st[1]}">${st[0]}</span> <span class="tag ${l.kind === "unpaid" ? "gry" : ""}">${l.kind === "unpaid" ? "Unpaid" : "Paid"}</span>
      <small>${dmx(l.from_date)}${+l.days > 1 ? " – " + dmx(l.to_date) : ""} · ${+l.days || 1} day${+l.days > 1 ? "s" : ""}${l.reason ? " · " + esc(l.reason) : ""}${l.requested_by === "watchman" ? " · applied by watchman" : l.requested_by ? " · recorded by " + esc(cap(String(l.requested_by))) : ""}</small></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${assoc && l.status === "requested" ? `<button data-lap="${l.id}:paid">Approve (paid)</button><button class="ghost" data-lap="${l.id}:unpaid">Approve (unpaid)</button><button class="ghost" data-lrj="${l.id}">Reject</button>` : ""}
      ${(assoc && l.status === "approved" && String(l.to_date || l.from_date).slice(0, 10) >= T) || (gate && l.status === "requested") ? `<button class="ghost" data-lcan="${l.id}">Cancel</button>` : ""}</div></div>`; };
  const cal = (sid, ym, edit) => { const ds = monthDays(ym), first = (U(ds[0]).getUTCDay() + 6) % 7;
    return `<div class="tw"><div class="atcal">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => `<b>${d}</b>`).join("")}${"<span></span>".repeat(first)}${ds.map(d => { const st = dayState(sid, d);
      return `<button type="button" class="atd ${st[2] ? "s-" + st[2] : ""}${d === T ? " today" : ""}" ${edit && d <= T && !leaveOn(sid, d) ? `data-atd="${d}"` : "disabled"} title="${esc(dmx(d) + (st[1] ? " · " + st[1] : ""))}"><span>${+d.slice(8)}</span><i>${st[0]}</i></button>`; }).join("")}</div></div>`; };
  const css = `<style>.atcal{display:grid;grid-template-columns:repeat(7,minmax(38px,1fr));gap:4px;min-width:290px}.atcal>b{font-size:.7rem;text-align:center;color:var(--grey);font-weight:600}.atd{min-height:48px;padding:4px 0;border-radius:10px;background:#fff;border:1px solid var(--line);color:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;box-shadow:none;font-size:.8rem;line-height:1.1}.atd i{font-style:normal;font-weight:800;font-size:.95rem}.atd:disabled{opacity:1;cursor:default}.atd.today{outline:2px solid #2563eb}.atd.s-grn{background:#e4f6ea;color:#15803d}.atd.s-red{background:#fde8e6;color:#b42318}.atd.s-amb{background:#fdf0dc;color:#b45309}.atd.s-blu{background:#eaf2ff;color:#1d4ed8}.atd.s-gry{background:#eef1f5;color:#4a5568}.atd::after,.atd::before{display:none!important}</style>`;
  const legend = `<p class="note" style="margin:8px 0 0">P Present · ½ Half day · A Absent · L Paid leave · U Unpaid leave · – Not marked</p>`;
  const pend = LV.filter(l => l.status === "requested");
  const pick = staff.length > 1 ? `<div class="chips">${staff.map(x => `<button class="${String(x.id) === String(STF) ? "" : "ghost"}" data-stf="${x.id}">${esc(x.name)}${x.active === "no" ? " (inactive)" : ""}</button>`).join("")}</div>` : "";
  let html = css;
  if (!staff.length) html += `<div class="card">No watchman added yet.${assoc ? " Add the watchman below: name, phone and paid leaves per year." : " Please ask the Association to add the watchman."}</div>`;
  if (cur) {
    const pu = paidUsed(cur.id), al = +cur.paid_leaves_year || 0, tm = tally(cur.id, T.slice(0, 7)), tdy = markOn(cur.id, T), onLeave = leaveOn(cur.id, T);
    html += pick + `<div class="card"><div class="ahead"><div class="em" aria-hidden="true">🛡</div><div><b style="font-size:1.1rem">${esc(cur.name)}</b>${cur.active === "no" ? ' <span class="tag gry">Inactive</span>' : ""}${onLeave ? ' <span class="tag blu" style="background:#eaf2ff;color:#1d4ed8">On leave today</span>' : ""}
       <small style="display:block;color:var(--grey)">${esc(cap(cur.role || "watchman"))}${cur.joined_on ? " · joined " + dmx(cur.joined_on) : ""}</small></div>${cur.phone && !gate ? callA(cur.phone, "alt", "Call") : ""}</div>
      <div class="tiles" style="margin-top:12px"><div class="${al - pu < 0 ? "red" : al - pu <= 2 ? "amb" : "grn"}"><b>${Math.max(al - pu, 0)}</b><small>Paid leaves left in ${Y}</small></div><div><b>${pu} / ${al}</b><small>Paid leaves used</small></div><div><b>${unpaidUsed(cur.id)}</b><small>Unpaid leave days</small></div></div>
      <div class="tiles" style="margin-top:10px"><div class="grn"><b>${tm.P}</b><small>Present this month</small></div><div class="amb"><b>${tm["½"]}</b><small>Half days</small></div><div class="red"><b>${tm.A}</b><small>Absent</small></div><div><b>${tm.L + tm.U}</b><small>Leave days</small></div></div>
      ${gate && cur.active !== "no" ? `<div class="btnrow">${onLeave ? `<p class="note">On leave today.</p>` : tdy ? `<p class="note" style="margin:0">✓ Marked ${esc((ATS[tdy.status] || ["", tdy.status])[1].toLowerCase())} today${tdy.marked_at ? " at " + t12(String(tdy.marked_at).slice(11, 16)) : ""}</p>` : `<button id="atme" style="background:linear-gradient(135deg,#15803d,#22a35a)">✓ Mark present today</button>`}</div>` : ""}</div>`;
    if (pend.length && (assoc || gate)) html += `<h2>Waiting for approval · ${pend.length}</h2><div class="card">${pend.map(lvRow).join("")}</div>`;
    if ((assoc || gate) && cur.active !== "no") html += `<h2>${gate ? "Apply for leave" : "Record leave for " + esc(cur.name)}</h2><div class="card">${assoc ? `<p class="note">Use this when the watchman tells you about leave, or could not apply. It is approved at once and posted as a notice for all flats.</p>` : `<p class="note">The Association approves it. Once approved, all flats see a notice.</p>`}
      <div class="f">${fld("From", dinp("lvf", T))}${fld("To (same day if one day)", dinp("lvt", T))}${fld("Type", sel("lvk", [["paid", "Paid leave"], ["unpaid", "Unpaid leave"]], "paid"))}${fld("Reason (optional)", inp("lvr", "", 'placeholder="e.g. Family function"'))}<button class="w" id="lvs">${gate ? "Apply for leave" : "Save leave and post notice"}</button></div></div>`;
    const mine = LV.filter(l => String(l.staff_id) === String(cur.id) && l.status !== "requested");
    html += `<h2>Leave history</h2><div class="card">${mine.slice(0, 30).map(lvRow).join("") || "No leave yet."}</div>`;
    html += `<h2>Attendance</h2><div class="card"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px"><input type="month" id="atm" value="${ATM}" style="max-width:200px">${prBtn("atp", "Print attendance")}</div>${cal(cur.id, ATM, assoc)}${legend}${assoc ? `<p class="note" style="margin:4px 0 0">Tap a day to mark Present, Half day or Absent.</p>` : ""}</div>`;
  }
  if (assoc) html += `<h2>Watchmen</h2><div class="card">${staff.map(x => `<div class="it"><div><b>${esc(x.name)}</b>${x.active === "no" ? ' <span class="tag gry">Inactive</span>' : ""}<small>${esc(x.phone || "")}${x.phone ? " · " : ""}${+x.paid_leaves_year || 0} paid leaves a year${x.joined_on ? " · joined " + dmx(x.joined_on) : ""}</small></div><button class="ghost" data-sted="${x.id}">Edit</button></div>`).join("")}
    <details class="rec"${staff.length ? "" : " open"}><summary>Add a watchman</summary><div class="f">${fld("Name", inp("sn", "", 'placeholder="e.g. Lakshmi"'))}${fld("Phone", inp("sp", "", 'type="tel" inputmode="tel"'))}${fld("Joined on", dinp("sj"))}${fld("Paid leaves per year", inp("sl", "12", 'type="number" min="0" max="365" inputmode="numeric"'))}<button class="w" id="ssv">Add watchman</button></div></details></div>`;
  m.innerHTML = html;
  /* ---- actions ---- */
  m.querySelectorAll("[data-stf]").forEach(b => b.onclick = () => { STF = b.dataset.stf; try { localStorage.setItem("kk_staff", STF); } catch (e) {} render(); });
  if ($("#atm")) $("#atm").onchange = e => { ATM = e.target.value || T.slice(0, 7); render(); };
  if ($("#atp")) $("#atp").onclick = () => { const ds = monthDays(ATM), t = tally(cur.id, ATM), [y, mo] = ATM.split("-");
    printHTML("Attendance " + cur.name + " " + ATM, sheetHead("Watchman attendance: " + cur.name, MN[+mo - 1] + " " + y) + `<div class="box">Present ${t.P} · Half days ${t["½"]} · Absent ${t.A} · Paid leave ${t.L} · Unpaid leave ${t.U} · Not marked ${t["–"]}<br>Paid leaves in ${y}: ${paidUsed(cur.id)} used of ${+cur.paid_leaves_year || 0}</div>` +
      ptable(["Date", "Day", "Status"], ds.map(d => { const st = dayState(cur.id, d); return [dm(d), ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][U(d).getUTCDay()], esc(st[1] || "")]; }), null, ["", "", ""]) + SIG); };
  if ($("#atme")) $("#atme").onclick = async () => { const now = nowS();
    try { await instant(c => { (c.attendance || (c.attendance = [])).push({ id: TMPID + (++TMP), staff_id: cur.id, on_date: T, status: "present", marked_by: me.id, marked_at: now }); }, wbody("attendance", "insert", { staff_id: cur.id })); } catch (e) { return toast(e.message); }
    toast("Marked present"); render(); };
  m.querySelectorAll("[data-atd]").forEach(b => b.onclick = () => { const d = b.dataset.atd, old = markOn(cur.id, d);
    const s0 = sheet("Attendance · " + esc(cur.name) + " · " + dmx(d), `<div class="btnrow">${Object.entries(ATS).map(([k, v]) => `<button type="button" class="${old && old.status === k ? "" : "ghost"}" data-atk="${k}">${v[1]}</button>`).join("")}${old ? `<button type="button" class="ghost" data-atk="">Clear</button>` : ""}</div>`, async () => "", "Close");
    s0.el.querySelector("#sho").style.display = "none";
    s0.el.querySelectorAll("[data-atk]").forEach(x => x.onclick = async () => { const k = x.dataset.atk; s0.close();
      if (!k) { const e = await saveBg("attendance", "delete", null, [["id", old.id]]); e ? toast(e) : render(); return; }
      try { await instant(c => { c.attendance = (c.attendance || []).filter(a => !(String(a.staff_id) === String(cur.id) && String(a.on_date).slice(0, 10) === d)); c.attendance.push({ id: TMPID + (++TMP), staff_id: cur.id, on_date: d, status: k, marked_by: me.id, marked_at: nowS() }); }, wbody("attendance", "insert", { staff_id: cur.id, on_date: d, status: k })); } catch (e) { return toast(e.message); }
      toast(ATS[k][1] + " · " + dmx(d)); render(); }); });
  if ($("#lvs")) $("#lvs").onclick = async () => { const v = { staff_id: cur.id, from_date: val("lvf"), to_date: val("lvt") || val("lvf"), kind: val("lvk"), reason: val("lvr") };
    if (!v.from_date) return toast("Choose the first day of leave."); if (v.to_date < v.from_date) return toast("The last day must be on or after the first day.");
    if (LV.some(l => String(l.staff_id) === String(cur.id) && ["requested", "approved"].includes(l.status) && String(l.from_date).slice(0, 10) <= v.to_date && String(l.to_date || l.from_date).slice(0, 10) >= v.from_date)) return toast("There is already a leave on these days.");
    const days = daysIn(v.from_date, v.to_date).length;
    try { await instant(c => applyLocal(c, "leaves", "insert", Object.assign({}, v, { days, status: assoc ? "approved" : "requested", requested_by: me.id }), []), wbody("leaves", "insert", v)); } catch (e) { return toast(e.message); }
    toast(assoc ? "Leave saved. A notice is posted for all flats." : "Leave applied. The Association has been told."); render(); };
  m.querySelectorAll("[data-lap]").forEach(b => b.onclick = async () => { const [id, k] = b.dataset.lap.split(":"); const e = await saveBg("leaves", "update", { status: "approved", kind: k }, [["id", id]]); e ? toast(e) : (toast("Approved. A notice is posted for all flats."), render()); });
  m.querySelectorAll("[data-lrj]").forEach(b => b.onclick = async () => { if (!confirm("Do not approve this leave?")) return; const e = await saveBg("leaves", "update", { status: "rejected" }, [["id", b.dataset.lrj]]); e ? toast(e) : (toast("Not approved. The watchman has been told."), render()); });
  m.querySelectorAll("[data-lcan]").forEach(b => b.onclick = async () => { if (!confirm("Cancel this leave?" + (assoc ? " Its notice is removed." : ""))) return; const e = await saveBg("leaves", "update", { status: "cancelled" }, [["id", b.dataset.lcan]]); e ? toast(e) : (toast("Leave cancelled"), render()); });
  if ($("#ssv")) $("#ssv").onclick = async () => { const v = { name: val("sn"), phone: val("sp"), joined_on: val("sj"), paid_leaves_year: val("sl") === "" ? 12 : +val("sl") };
    if (!v.name) return toast("Enter the name."); const e = await saveBg("staff", "insert", Object.assign(v, { role: "watchman", active: "yes" })); e ? toast(e) : (toast("Watchman added"), render()); };
  m.querySelectorAll("[data-sted]").forEach(b => b.onclick = () => { const x = staff.find(q => String(q.id) === b.dataset.sted);
    sheet("Edit " + esc(x.name), `<div class="f">${fld("Name", inp("sen", x.name))}${fld("Phone", inp("sep", x.phone, 'type="tel" inputmode="tel"'))}${fld("Joined on", dinp("sej", x.joined_on))}${fld("Paid leaves per year", inp("sel", x.paid_leaves_year, 'type="number" min="0" max="365" inputmode="numeric"'))}${fld("Status", sel("sea", [["yes", "Working"], ["no", "Left / inactive"]], x.active === "no" ? "no" : "yes"))}</div>`,
      async () => { const v = { name: val("sen"), phone: val("sep"), joined_on: val("sej"), paid_leaves_year: +val("sel") || 0, active: val("sea") }; if (!v.name) return "Enter the name.";
        const e = await saveBg("staff", "update", v, [["id", x.id]]); if (!e) { toast("Saved"); render(); } return e; }); });
}
