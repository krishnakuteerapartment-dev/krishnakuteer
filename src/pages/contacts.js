/* Page: contacts. Loaded only when this page is opened. */
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
  $("#pct").onclick = () => printHTML("Contacts", sheetHead("Contacts") + ptable(["For", "Name", "Phone", "Other phone", "Notes", "Verified"], top.concat(rest).map(x => [esc((CC[x.category] || CC.other)[1]), esc(x.name), "<b>" + esc(x.phone) + "</b>", esc(x.alt_phone || ""), esc(x.notes || ""), dmx(x.verified_on) || "-"])));
  if (!can) return;
  $("#csv").onclick = async () => { const v = ctVals(); if (!v.name || !v.phone) return toast("Enter a name and a phone number"); const e = await saveBg("contacts", "insert", Object.assign(v, v.verified ? { verified_on: ld() } : {})); e ? toast(e) : (toast("Contact saved"), render()); };
  m.querySelectorAll("[data-ced]").forEach(b => b.onclick = () => { const x = C.find(q => String(q.id) === b.dataset.ced);
    sheet("Edit contact", ctForm(x), async () => { const v = ctVals(); if (!v.name || !v.phone) return "Enter a name and a phone number"; const e = await saveBg("contacts", "update", Object.assign(v, v.verified ? { verified_on: ld() } : {}), [["id", x.id]]); if (!e) { toast("Saved"); render(); } return e; }); });
  m.querySelectorAll("[data-cvf]").forEach(b => b.onclick = async () => { const e = await saveBg("contacts", "update", { verified: true, verified_on: ld() }, [["id", b.dataset.cvf]]); e ? toast(e) : (toast("Marked verified"), render()); });
  m.querySelectorAll("[data-cdl]").forEach(b => b.onclick = async () => { if (!confirm("Delete this contact?")) return; const e = await saveBg("contacts", "delete", null, [["id", b.dataset.cdl]]); e ? toast(e) : render(); });
}
