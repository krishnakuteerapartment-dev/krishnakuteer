/* Page: visitors. Loaded only when this page is opened. */
const hmNow = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const PURP = ["Guest / relative", "Delivery / courier", "Service / repair", "Cab / taxi", "Domestic help", "Official visit", "Other"];
const minsSince = hm => { if (!/^\d{2}:\d{2}$/.test(String(hm || ""))) return 0; const [h, mi] = hm.split(":").map(Number), d = new Date(); return (d.getHours() * 60 + d.getMinutes()) - (h * 60 + mi); };
async function visitors(m, canW0) {
  clearInterval(GATE_T); GATE_T = null;
  const canW = isIn(R_VIS), res = me.role === "resident", S4 = isIn(R_S), T = ld();
  const [{ data }, flats, gp] = await Promise.all([db.from("visitors").select("*"), allFlats(), db.from("guest_passes").select("*")]);
  const passes = (gp.data || []).sort((a, b) => b.id - a.id), phoneOf = fn => (flats.find(f => String(f.flat_no) === String(fn)) || {}).phone || "";
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
  const waiting = det.filter(r => r.d === T && ["waiting", "no_answer"].includes(r.status));
  const answered = det.filter(r => r.d === T && ["approved", "denied", "leave_at_gate"].includes(r.status) && !r.out_time && minsSince(String(r.decided_at || "").slice(11, 16)) < 30);
  const inside = det.filter(r => r.d === T && !r.out_time && !["waiting", "no_answer", "denied", "leave_at_gate", "cancelled"].includes(r.status) && !answered.includes(r));
  const q = VF.q.toLowerCase(), F = det.filter(r => (!VF.from || r.d >= VF.from) && (!VF.to || r.d <= VF.to) && (!VF.flat || String(r.flat_no) === VF.flat) && (!q || [r.name, r.purpose, r.phone].some(x => String(x || "").toLowerCase().includes(q))));
  const vrow = r => `<tr><td style="white-space:nowrap">${dm(r.d)}</td><td style="white-space:nowrap">${t12(r.in_time)}${r.out_time ? " – " + t12(r.out_time) : canW && r.d === T && !r.status ? ' <span class="tag amb">Inside</span>' : ""}</td><td><b>${esc(r.name)}</b>${seePh && r.phone ? `<small>${esc(r.phone)}</small>` : ""}</td><td>${esc(r.flat_no || "")}</td><td>${esc(r.purpose || "")}${r.status ? `<br>${vTag(r)}` : ""}${r.decided_by && r.status && !["waiting", "no_answer"].includes(r.status) ? `<small>by Flat ${esc(String(r.decided_by).replace(" (alert)", ""))}${r.decided_at ? " · " + t12(String(r.decided_at).slice(11, 16)) : ""}</small>` : ""}</td>${canW ? `<td style="white-space:nowrap">${!r.out_time && !["waiting", "no_answer"].includes(r.status) ? `<button class="ghost" data-vout="${r.id}">Exit now</button> ` : ""}<button class="ghost" data-vx="${r.id}">Delete</button></td>` : res ? `<td>${!r.out_time && !["waiting", "no_answer", "denied", "leave_at_gate", "cancelled"].includes(r.status) ? `<button class="ghost" data-vout="${r.id}">Exit now</button>` : ""}</td>` : ""}</tr>`;
  const flatOpts = [["", res ? "" : "All flats"]].concat(flats.map(f => [String(f.flat_no), "Flat " + f.flat_no]), [["Common area", "Common area / office"]]);
  /* ---- gate screens ---- */
  const gateWait = r => { const late = r.status === "no_answer" || minsSince(askedAt(r)) >= 3, ph = phoneOf(r.flat_no);
    return `<div class="card" style="border-left:4px solid ${late ? "#b42318" : "#b45309"}"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>${esc(r.name)} → Flat ${esc(r.flat_no)}</b>${vTag(r)}</div>
     <small style="display:block;color:var(--grey)">${esc(r.purpose || "")} · asked at ${t12(askedAt(r))} · <span data-tick="${esc(askedAt(r))}"></span></small>
     ${late ? `<p class="note" style="margin:8px 0 0">${r.status === "no_answer" ? "Marked as no answer." : "No answer yet."} Call the flat, or ask again.</p>` : ""}
     <div class="btnrow">${ph ? callA(ph, late ? "" : "alt", "Call Flat " + r.flat_no) : late ? `<span class="note">No phone number saved for this flat.</span>` : ""}${late ? `<button class="ghost" data-vagain="${r.id}">Ask again</button>` : ""}${r.status !== "no_answer" && late ? `<button class="ghost" data-vnoans="${r.id}">Mark no answer</button>` : ""}<button class="ghost" data-vcancel="${r.id}">Cancel</button></div></div>`; };
  const gateDone = r => { const ok = r.status === "approved";
    return `<div class="card" style="background:${ok ? "var(--yes-bg,#e4f6ea)" : r.status === "denied" ? "#fde8e6" : "#eef1f5"};border-color:transparent"><b style="font-size:1.1rem">${ok ? "✅ Let in" : r.status === "denied" ? "⛔ Do not let in" : "📦 Keep at the gate"}: ${esc(r.name)}</b>
     <small style="display:block;color:var(--grey)">Flat ${esc(r.flat_no)} ${VST[r.status][0].toLowerCase()} at ${t12(String(r.decided_at || "").slice(11, 16))}</small>${ok ? `<div class="btnrow"><button class="ghost" data-vout="${r.id}">Mark exit</button></div>` : ""}</div>`; };
  const always = passes.filter(p => p.kind === "always" && p.status === "active");
  const gateHtml = canW ? `
   ${waiting.length ? `<h2>Waiting for an answer · ${waiting.length}</h2>${waiting.map(gateWait).join("")}` : ""}
   ${answered.length ? `<h2>Answered</h2>${answered.map(gateDone).join("")}` : ""}
   <h2>Record a visitor</h2><div class="card"><div class="f">${fld("Visitor name", inp("vnm", "", 'autocomplete="off" placeholder="Name"'))}${fld("Flat visited", sel("vfl", flatOpts.slice(1), ""))}${fld("Purpose", `<input id="vpu" list="vpul" placeholder="Choose or type"><datalist id="vpul">${PURP.map(p => `<option value="${esc(p)}">`).join("")}</datalist>`)}${fld("Phone (optional, Association only)", inp("vph", "", 'type="tel" inputmode="tel"'))}
    ${fld("Date", dinp("vdt", T))}${fld("Entry time", `<input id="vin" type="time" value="${hmNow()}">`)}${fld("Exit time (leave empty if still inside)", `<input id="vout" type="time">`)}</div>
    <div class="btnrow"><button id="vask">🔔 Ask flat to approve</button><button class="ghost" id="vsv">Save without asking</button></div>
    <p class="note" style="margin:8px 0 0">“Ask flat to approve” sends an alert with Approve / Deny to the flat's phones. This screen turns green or red when they answer.</p></div>
   <h2>Guest code</h2><div class="card"><div style="display:flex;gap:8px"><input id="gpc" inputmode="numeric" maxlength="6" placeholder="6-digit code from the guest" style="flex:1;min-width:0"><button id="gpck" style="width:auto">Check</button></div><div id="gpres"></div></div>
   ${always.length ? `<h2>Always allowed · ${always.length}</h2><div class="card"><label class="fl" for="alf">Show</label>${sel("alf", [["", "All flats (" + always.length + ")"]].concat([...new Set(always.map(p => String(p.flat_no)))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map(f => [f, "Flat " + f + " (" + always.filter(p => String(p.flat_no) === f).length + ")"])), ALF)}<div style="height:6px"></div>${always.filter(p => !ALF || String(p.flat_no) === ALF).map(p => `<div class="it"><div><b>${esc(p.name)}</b><small>Flat ${esc(p.flat_no)}${p.purpose ? " · " + esc(p.purpose) : ""}</small></div><button data-vall="${p.id}">Let in</button></div>`).join("")}</div>` : ""}
   ${inside.length ? `<h2>Inside now · ${inside.length}</h2><div class="card">${inside.map(r => `<div class="it"><div><b>${esc(r.name)}</b> ${vTag(r)}<small>Flat ${esc(r.flat_no)} · ${esc(r.purpose || "")} · in ${t12(r.in_time)}</small></div><button data-vout="${r.id}">Exit now</button></div>`).join("")}</div>` : ""}` : "";
  /* ---- resident screens: answer the gate, guest passes, gate phone ---- */
  const myWait = res ? waiting.filter(r => String(r.flat_no) === String(me.id)) : [];
  const myFlat = res ? flats.find(f => String(f.flat_no) === String(me.id)) || {} : {};
  const activeP = passes.filter(p => p.status === "active" && (p.kind === "always" || String(p.valid_to || "") >= T)), oldP = passes.filter(p => !activeP.includes(p));
  const pRow = p => `<div class="it"><div><b>${esc(p.name)}</b> <span class="tag ${p.kind === "always" ? "grn" : ""}">${p.kind === "always" ? "Always allowed" : "One visit"}</span>${!res ? ` <span class="tag gry">Flat ${esc(p.flat_no)}</span>` : ""}
    <small>${esc(p.purpose || "")}${p.kind === "once" ? (p.purpose ? " · " : "") + dmx(p.valid_from) + (p.valid_to && p.valid_to !== p.valid_from ? " – " + dmx(p.valid_to) : "") : p.valid_to ? (p.purpose ? " · " : "") + "until " + dmx(p.valid_to) : ""}${p.status === "used" ? " · used " + t12(String(p.used_at || "").slice(11, 16)) + " " + dmx(p.used_at) : p.status === "cancelled" ? " · cancelled" : ""}</small>
    ${p.code ? `<div style="font-size:1.5rem;font-weight:800;letter-spacing:.18em;color:var(--navy);margin-top:2px">${esc(p.code)}</div>` : res && p.kind === "once" && p.status === "active" ? `<div class="note" style="margin:4px 0 0">Code coming…</div>` : ""}</div>
    ${p.status === "active" ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${p.code && p.kind === "once" ? `<button class="ghost" data-pshare="${p.id}">Share code</button>` : ""}${res || S4 ? `<button class="ghost" data-pcan="${p.id}">Cancel</button>` : ""}</div>` : ""}</div>`;
  const myAlways = res ? passes.filter(p => p.kind === "always" && p.status === "active" && (!p.valid_to || String(p.valid_to) >= T)) : [];
  const myInside = res ? det.filter(r => String(r.flat_no) === String(me.id) && r.d === T && !r.out_time && !["waiting", "no_answer", "denied", "leave_at_gate", "cancelled"].includes(r.status)) : [];
  const resHtml = res ? `${myWait.length ? `<h2>At the gate now</h2>${myWait.map(r => waitCard(r, true)).join("")}` : ""}
   ${myInside.length ? `<h2>Inside now · ${myInside.length}</h2><div class="card">${myInside.map(r => `<div class="it"><div><b>${esc(r.name)}</b> ${vTag(r)}<small>${esc(r.purpose || "")}${r.purpose ? " · " : ""}in ${t12(r.in_time)}</small></div><button data-vout="${r.id}">Exit now</button></div>`).join("")}</div>` : ""}
   <h2>Watchman not at the gate?</h2><div class="card"><p class="note">Record your own visitor's entry here, and tap <b>Exit now</b> when they leave. It goes into the visitor register as “Entered by flat”.</p>
    ${myAlways.length ? `<div style="margin-bottom:10px">${myAlways.map(p => `<div class="it"><div><b>${esc(p.name)}</b> <span class="tag grn">Always allowed</span><small>${esc(p.purpose || "")}</small></div><button data-rall="${p.id}">Let in</button></div>`).join("")}</div>` : ""}
    <div class="f">${fld("Visitor name", inp("rvn", "", 'autocomplete="off" placeholder="Name"'))}${fld("Purpose", `<input id="rvp" list="vpul3" placeholder="Choose or type"><datalist id="vpul3">${PURP.map(p => `<option value="${esc(p)}">`).join("")}</datalist>`)}
    ${fld("Entry time", `<input id="rvi" type="time" value="${hmNow()}">`)}${fld("Exit time (leave empty if still inside)", `<input id="rvo" type="time">`)}<button class="w" id="rvs">Let in</button></div></div>
   <h2>Guest passes</h2><div class="card"><p class="note">Expecting someone? Make a pass. A <b>one-visit</b> pass gives a 6-digit code to send your guest; they show it at the gate and walk in without a call. <b>Always allowed</b> is for daily help, milk or newspaper.</p>
    <div class="f">${fld("Guest's name", inp("pnm", "", 'placeholder="e.g. My mother / Lakshmi (maid)"'))}${fld("Purpose", `<input id="ppu" list="vpul2" placeholder="Choose or type"><datalist id="vpul2">${PURP.map(p => `<option value="${esc(p)}">`).join("")}</datalist>`)}
    ${fld("Type", sel("pkd", [["once", "One visit (code)"], ["always", "Always allowed"]], "once"))}<div></div>${fld("From", dinp("pfr", T))}<div><label class="fl" id="ptol">To (same day if one day)</label>${dinp("pto", T)}</div><button class="w" id="psv">Make guest pass</button></div></div>
   ${activeP.length ? `<div class="card">${activeP.map(pRow).join("")}</div>` : ""}${oldP.length ? `<details class="rec"><summary>Used and cancelled passes (${oldP.length})</summary><div class="card">${oldP.slice(0, 30).map(pRow).join("")}</div></details>` : ""}
   <h2>Phone number for the gate</h2><div class="card"><p class="note">If you don't answer the alert, the watchman can call this number. Only the gate and the Association can see it.</p><div style="display:flex;gap:8px"><input id="fph" type="tel" inputmode="tel" value="${esc(myFlat.phone || "")}" placeholder="e.g. 98480 12345" style="flex:1;min-width:0"><button id="fphs" style="width:auto">Save</button></div></div>` : "";
  const assocHtml = S4 ? `<h2>Guest passes &amp; gate phone numbers</h2><div class="card"><details class="rec" style="border:0;margin:0;padding:0"><summary>Phone numbers the gate calls (${flats.filter(f => f.phone).length} of ${flats.length} flats)</summary>
    ${flats.map(f => `<div class="it"><div>Flat ${esc(f.flat_no)}</div><div style="display:flex;gap:6px"><input data-fphv="${esc(f.flat_no)}" type="tel" inputmode="tel" value="${esc(f.phone || "")}" placeholder="Phone" style="width:150px"><button class="ghost" data-fphs="${esc(f.flat_no)}">Save</button></div></div>`).join("")}</details>
    ${activeP.length ? `<details class="rec"><summary>Active guest passes (${activeP.length})</summary>${activeP.map(pRow).join("")}</details>` : ""}</div>` : "";
  m.innerHTML = `<div class="card" style="padding:12px"><div class="tiles">${cards.map(([l, v]) => `<div><b>${v}</b><small>${l}</small></div>`).join("")}</div></div>
  ${gateHtml}${resHtml}
  <h2>${res ? "Visitors to your flat" : "Visitor register"}</h2>
  <div class="card"><div class="f">${fld("From", dinp("vff", VF.from))}${fld("To", dinp("vft", VF.to))}${res ? "" : fld("Flat", sel("vffl", flatOpts, VF.flat))}${fld("Search name or purpose", inp("vfq", VF.q, 'type="search" placeholder="e.g. courier"'), res)}</div>
   <div class="btnrow"><button id="vfgo">Show</button><button class="ghost" id="vfclr">Clear</button>${F.length ? prBtn("vpr", "Print register") : ""}</div></div>
  <div class="card tw"><table class="tbl"><thead><tr><th>Date</th><th>Time</th><th>Visitor</th><th>Flat</th><th>Purpose</th>${canW || res ? "<th></th>" : ""}</tr></thead><tbody>${F.slice(0, 200).map(vrow).join("") || `<tr><td colspan="${canW || res ? 6 : 5}">No visitors found.</td></tr>`}</tbody></table>${F.length > 200 ? `<p class="note">Showing the latest 200 of ${F.length}. Narrow the dates to see older ones.</p>` : ""}</div>
  ${assocHtml}
  ${canW && me.role !== "watchman" ? `<h2>Add a visitor count (no names)</h2><div class="card"><div class="f">${dateField("vd", "Date")}<div class="w"><label class="fl" for="vn">Number of visitors</label><input id="vn" type="number" inputmode="numeric" min="1" step="1" placeholder="e.g. 25"></div><button class="w" id="vs">Save count</button></div>
   ${counts.length ? `<details class="rec"><summary>Count entries (${counts.length})</summary><table class="tbl"><tbody>${counts.slice(0, 60).map(r => `<tr><td>${dm(r.d)}</td><td class="r">${r.n}</td><td><button class="ghost" data-vx="${r.id}">Delete</button></td></tr>`).join("")}</tbody></table></details>` : ""}</div>` : ""}
  <h2>Visitors count</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px">${[["d", "Daily"], ["w", "Weekly"], ["m", "Monthly"], ["y", "Yearly"]].map(([k, l]) => `<button class="${vp === k ? "" : "ghost"}" data-vp="${k}">${l}</button>`).join("")}</div>
  <div class="card tw"><table class="tbl"><thead><tr><th>${head}</th><th class="r">Visitors</th></tr></thead><tbody>${list || `<tr><td colspan="2">Nothing yet.</td></tr>`}</tbody></table></div>`;
  m.querySelectorAll("[data-vp]").forEach(b => b.onclick = () => { vp = b.dataset.vp; render(); });
  $("#vfgo").onclick = () => { VF = { from: val("vff"), to: val("vft"), flat: res ? "" : val("vffl"), q: val("vfq") }; render(); };
  $("#vfclr").onclick = () => { VF = null; render(); };
  if ($("#vpr")) $("#vpr").onclick = () => printHTML("Visitor register", sheetHead("Visitor register", [VF.from && "From " + dmx(VF.from), VF.to && "to " + dmx(VF.to), VF.flat && "Flat " + VF.flat].filter(Boolean).join(" ")) +
    ptable(["Sl.No", "Date", "In", "Out", "Visitor", "Flat", "Purpose", "Approval"].concat(seePh ? ["Phone"] : []), F.map((r, i) => [i + 1, dm(r.d), t12(r.in_time), t12(r.out_time), esc(r.name), esc(r.flat_no || ""), esc(r.purpose || ""), r.status && VST[r.status] ? VST[r.status][0] : ""].concat(seePh ? [esc(r.phone || "")] : [])), null, ["c"]) + SIG, true);
  /* ---- resident actions ---- */
  if (res) {
    /* Always allowed: no end date unless one is chosen (e.g. a maid until the end of the month) */
    $("#pkd").onchange = () => { const a = val("pkd") === "always"; $("#ptol").textContent = a ? "Until (leave empty: no end date)" : "To (same day if one day)"; $("#pto").value = a ? "" : val("pfr"); };
    $("#psv").onclick = async () => { const v = { name: val("pnm"), purpose: val("ppu"), kind: val("pkd"), valid_from: val("pfr"), valid_to: val("pto") };
      if (v.kind === "always" && v.valid_to && v.valid_to < v.valid_from) return toast("The last day must be on or after the first day.");
      if (!v.name) return toast("Enter the guest's name"); if (v.kind === "once" && v.valid_to && v.valid_to < v.valid_from) return toast("The last day must be on or after the first day.");
      try { await instant(c => applyLocal(c, "guest_passes", "insert", Object.assign({}, v, { flat_no: me.id, status: "active", valid_to: v.kind === "always" ? v.valid_to : v.valid_to || v.valid_from }), []), wbody("guest_passes", "insert", v)); } catch (e) { return toast(e.message); }
      toast(v.kind === "always" ? "Added to the always-allowed list" : "Guest pass made. The code appears in a moment."); await render(); const pc = document.querySelector("[data-pshare],[data-pcan]"); if (pc) pc.scrollIntoView({ block: "center" }); };
    $("#rvs").onclick = async () => { const v = { name: val("rvn"), purpose: val("rvp"), visit_on: ld(), in_time: val("rvi"), out_time: val("rvo"), count: 1 };
      if (!v.name) return toast("Enter the visitor's name"); if (!/^\d{2}:\d{2}$/.test(v.in_time)) return toast("Enter the entry time"); if (v.out_time && v.out_time < v.in_time) return toast("Exit time must be after the entry time");
      try { await instant(c => applyLocal(c, "visitors", "insert", Object.assign({}, v, { flat_no: me.id, status: "by_flat", added_by: me.id }), []), wbody("visitors", "insert", v)); } catch (e) { return toast(e.message); }
      toast(v.name + " recorded"); render(); };
    m.querySelectorAll("[data-rall]").forEach(b => b.onclick = async () => { const p = myAlways.find(x => String(x.id) === b.dataset.rall), rec = { visit_on: ld(), in_time: hmNow(), name: p.name, purpose: p.purpose || "", count: 1 };
      try { await instant(c => applyLocal(c, "visitors", "insert", Object.assign({}, rec, { flat_no: me.id, status: "always", added_by: me.id }), []), wbody("visitors", "insert", Object.assign({}, rec, { always_pass_id: p.id }))); } catch (e) { return toast(e.message); }
      toast(p.name + " let in"); render(); });
    m.querySelectorAll("[data-vout]").forEach(b => b.onclick = async () => { const e = await saveBg("visitors", "update", { out_time: hmNow() }, [["id", b.dataset.vout]]); e ? toast(e) : (toast("Exit time saved"), render()); });
    $("#fphs").onclick = async () => { const ph = val("fph"); if (ph && !/^[0-9+\-\s()]{6,20}$/.test(ph)) return toast("Enter a valid phone number.");
      try { await instant(c => (c.flats || []).filter(f => String(f.flat_no) === String(me.id)).forEach(f => f.phone = ph), { a: "flatPhone", flat_no: me.id, phone: ph }); toast("Phone number saved"); render(); } catch (e) { toast(e.message); } };
  }
  m.querySelectorAll("[data-pshare]").forEach(b => b.onclick = async () => { const p = passes.find(x => String(x.id) === b.dataset.pshare);
    const txt = `Krishna Kuteer Apartment gate pass for ${p.name}: show code ${p.code} at the gate (valid ${dmx(p.valid_from)}${p.valid_to && p.valid_to !== p.valid_from ? " to " + dmx(p.valid_to) : ""}).`;
    try { if (navigator.share) await navigator.share({ text: txt }); else { await navigator.clipboard.writeText(txt); toast("Copied. Paste it in WhatsApp."); } } catch (e) { try { await navigator.clipboard.writeText(txt); toast("Copied. Paste it in WhatsApp."); } catch (x) { toast("Code: " + p.code); } } });
  m.querySelectorAll("[data-pcan]").forEach(b => b.onclick = async () => { if (!confirm("Cancel this guest pass? The code will stop working.")) return; const e = await saveBg("guest_passes", "update", { status: "cancelled" }, [["id", b.dataset.pcan]]); e ? toast(e) : (toast("Pass cancelled"), render()); });
  m.querySelectorAll("[data-fphs]").forEach(b => b.onclick = async () => { const fn = b.dataset.fphs, v = m.querySelector(`[data-fphv="${fn}"]`).value.trim();
    if (v && !/^[0-9+\-\s()]{6,20}$/.test(v)) return toast("Enter a valid phone number.");
    try { await instant(c => (c.flats || []).filter(f => String(f.flat_no) === String(fn)).forEach(f => f.phone = v), { a: "flatPhone", flat_no: fn, phone: v }); toast("Saved for Flat " + fn); render(); } catch (e) { toast(e.message); } });
  if (!canW) return;
  /* ---- gate actions ---- */
  const form = () => ({ name: val("vnm"), flat_no: val("vfl"), purpose: val("vpu"), phone: val("vph"), visit_on: val("vdt"), in_time: val("vin"), out_time: val("vout"), count: 1 });
  const okForm = v => { if (!v.name) return "Enter the visitor's name"; if (!v.visit_on || !/^\d{2}:\d{2}$/.test(v.in_time)) return "Enter the date and entry time"; if (v.out_time && v.out_time < v.in_time) return "Exit time must be after the entry time"; return ""; };
  $("#vsv").onclick = async () => { const v = form(), bad = okForm(v); if (bad) return toast(bad); const e = await saveBg("visitors", "insert", v); e ? toast(e) : (toast("Visitor saved"), render()); };
  $("#vask").onclick = async () => { const v = form(), bad = okForm(v); if (bad) return toast(bad); if (!flats.some(f => String(f.flat_no) === v.flat_no)) return toast("Approval can only be asked from a flat.");
    delete v.out_time;
    try { await instant(c => applyLocal(c, "visitors", "insert", Object.assign({}, v, { status: "waiting", added_by: me.id }), []), wbody("visitors", "insert", Object.assign({}, v, { ask: true }))); } catch (e) { return toast(e.message); }
    toast("Asked Flat " + v.flat_no + ". Waiting for an answer…"); await render(); window.scrollTo(0, 0); };
  $("#gpck").onclick = async () => { const c = val("gpc"), box = $("#gpres"); if (!/^\d{6}$/.test(c)) return toast("Enter the 6-digit code");
    try { const r = await api({ a: "passCheck", code: c }); if (r.error) throw new Error(r.error.message); const p = r.pass;
      box.innerHTML = `<div class="card" style="margin:10px 0 0;background:#e4f6ea;border-color:transparent"><b>✅ ${esc(p.name)}</b> · Flat ${esc(p.flat_no)}${p.purpose ? " · " + esc(p.purpose) : ""}<div class="btnrow"><button id="gplet">Let in</button></div></div>`;
      $("#gplet").onclick = async () => { const rec = { visit_on: ld(), in_time: hmNow(), name: p.name, purpose: p.purpose || "", count: 1 };
        try { await instant(c => applyLocal(c, "visitors", "insert", Object.assign({}, rec, { flat_no: p.flat_no, status: "pre_approved", decided_by: p.flat_no, decided_at: nowS() }), []), wbody("visitors", "insert", Object.assign({}, rec, { pass_code: c }))); } catch (e) { return toast(e.message); }
        toast(p.name + " let in. Flat " + p.flat_no + " has been told."); render(); }; }
    catch (e) { box.innerHTML = `<p class="err">⛔ ${esc(e.message)}</p>`; } };
  if ($("#vs")) $("#vs").onclick = async () => { const d = gd("vd"), n = Math.floor(+$("#vn").value); if (!d) return toast("Enter a valid date (dd/mm/yyyy)"); if (!(n >= 1)) return toast("Enter the number of visitors");
    const { error } = await db.from("visitors").insert({ visit_on: d, count: n }); error ? toast(error.message) : (toast("Saved: " + n + " visitors on " + dm(d)), render()); };
  if ($("#alf")) { if (ALF && !always.some(p => String(p.flat_no) === ALF)) ALF = ""; $("#alf").onchange = e => { ALF = e.target.value; render(); }; }
  m.querySelectorAll("[data-vall]").forEach(b => b.onclick = async () => { const p = always.find(x => String(x.id) === b.dataset.vall);
    const rec = { visit_on: ld(), in_time: hmNow(), name: p.name, purpose: p.purpose || "", count: 1 };
    try { await instant(c => applyLocal(c, "visitors", "insert", Object.assign({}, rec, { flat_no: p.flat_no, status: "always", decided_by: p.flat_no, decided_at: nowS() }), []), wbody("visitors", "insert", Object.assign({}, rec, { always_pass_id: p.id }))); } catch (e) { return toast(e.message); }
    toast(p.name + " let in"); render(); });
  m.querySelectorAll("[data-vagain]").forEach(b => b.onclick = async () => { const e = await saveBg("visitors", "update", { status: "waiting", created_at: nowS() }, [["id", b.dataset.vagain]]); e ? toast(e) : (toast("Asked again"), render()); });
  m.querySelectorAll("[data-vnoans]").forEach(b => b.onclick = async () => { const e = await saveBg("visitors", "update", { status: "no_answer" }, [["id", b.dataset.vnoans]]); e ? toast(e) : render(); });
  m.querySelectorAll("[data-vcancel]").forEach(b => b.onclick = async () => { if (!confirm("Cancel this request? The visitor is not let in.")) return; const e = await saveBg("visitors", "update", { status: "cancelled" }, [["id", b.dataset.vcancel]]); e ? toast(e) : render(); });
  m.querySelectorAll("[data-vout]").forEach(b => b.onclick = async () => { const e = await saveBg("visitors", "update", { out_time: hmNow() }, [["id", b.dataset.vout]]); e ? toast(e) : (toast("Exit time saved"), render()); });
  m.querySelectorAll("[data-vx]").forEach(b => b.onclick = async () => { if (!confirm("Delete this entry?")) return; const e = await saveBg("visitors", "delete", null, [["id", b.dataset.vx]]); e ? toast(e) : render(); });
  /* while someone is waiting: tick the clock and ask the server every 4 seconds */
  const tick = () => m.querySelectorAll("[data-tick]").forEach(el => { const n = Math.max(0, minsSince(el.dataset.tick)); el.textContent = n < 1 ? "just now" : n + " min waiting"; });
  tick();
  if (waiting.length) GATE_T = setInterval(async () => {
    if (tab !== "vis" || !document.body.contains(m)) { clearInterval(GATE_T); GATE_T = null; return; }
    tick(); if (document.hidden || !SNAP) return;
    const W = ((await SNAP).visitors || []).filter(r => ["waiting", "no_answer"].includes(r.status) && +r.id < TMPID);
    if (!W.length) return;
    try { const r = await api({ a: "visitorStatus", ids: W.map(x => x.id) }, 1); if (!r.ok) return;
      const ch = W.filter(w => r.status[w.id] && r.status[w.id] !== w.status && r.status[w.id] !== "entered");
      if (!ch.length) return;
      SNAP = SNAP.then(T => { const c = clone(T); ch.forEach(w => setRow("visitors", w.id, { status: r.status[w.id], decided_by: w.flat_no, decided_at: nowS() })(c)); return c; }); GEN++;
      const done = ch.find(w => ["approved", "denied", "leave_at_gate"].includes(r.status[w.id]));
      if (done) { const st = r.status[done.id]; toast("Flat " + done.flat_no + ": " + (st === "approved" ? "APPROVED, let " + done.name + " in" : st === "denied" ? "DENIED, do not let " + done.name + " in" : "keep the delivery at the gate")); try { navigator.vibrate && navigator.vibrate(st === "approved" ? [200, 100, 200] : [600]); } catch (e) {} }
      calm(); refresh();
    } catch (e) {}
  }, 4000);
}
