/* Page: meeting. Loaded only when this page is opened. */
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
  ${fld("Others present (Association members, guests)", inp("eo", x.attendees_other), 1)}${fld("Minutes (what was discussed)", tarea("emi", x.minutes), 1)}${fld("Resolutions &amp; decisions (one per line)", tarea("ers", x.resolutions, "Resolved to renew the lift AMC with Otis"), 1)}</div>`;
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
  ${can ? `<div class="card"><b>Add meeting or event</b><div class="f"><input id="mt" class="w" placeholder="Title, e.g. Monthly meeting"><input id="md" type="date" value="${today}"><div><label class="fl">Time</label><div class="tsel"><select id="mh1" aria-label="Hour">${Array.from({ length: 12 }, (_, i) => `<option${i + 1 === 6 ? " selected" : ""}>${i + 1}</option>`).join("")}</select><select id="mh2" aria-label="Minutes">${["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(x => `<option>${x}</option>`).join("")}</select><select id="mh3" aria-label="AM or PM"><option>AM</option><option selected>PM</option></select></div></div><input id="mp" class="w" placeholder="Place"><select id="mk" class="w"><option value="meeting">Meeting</option><option value="event">Festival / event</option></select>${fld("Agenda (one point per line)", tarea("mag", "", "1. Accounts\n2. Lift AMC renewal"), 1)}<button class="w" id="ms">Save</button></div><p class="note" style="margin-top:8px">The agenda is shown to everybody. Attendance, minutes, resolutions and action items stay with the Association until you tap “Publish to residents”.</p></div>` : ""}
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
