/* Page: assets. Loaded only when this page is opened. */
const AST = { working: ["Working", "grn"], repair: ["Under repair", "amb"], out_of_service: ["Out of service", "red"] };
function assetForm(a = {}) {
  return `<div class="f">${fld("Name", inp("an", a.name, 'placeholder="e.g. Lift (Block A)"'), 1)}${fld("Type", sel("ak", Object.entries(AK).map(([k, v]) => [k, v[1]]), a.kind || "lift"))}${fld("Condition", sel("ast", Object.entries(AST).map(([k, v]) => [k, v[0]]), a.status || "working"))}
  ${fld("Location", inp("al", a.location, 'placeholder="e.g. Cellar"'))}${fld("Installed on", dinp("ai", a.installed_on))}${fld("Supplier / service company", inp("av", a.vendor))}${fld("Supplier phone", inp("avp", a.vendor_phone, 'type="tel" inputmode="tel"'))}
  ${fld("Model", inp("am", a.model))}${fld("Serial number", inp("asn", a.serial_no))}${fld("Warranty / AMC ends on", dinp("aw", a.warranty_until))}${fld("Notes", tarea("ano", a.notes, "Anything useful: AMC details, capacity, battery count…"), 1)}</div>`;
}
const assetVals = () => ({ name: val("an"), kind: val("ak"), status: val("ast"), location: val("al"), installed_on: val("ai"), vendor: val("av"), vendor_phone: val("avp"), model: val("am"), serial_no: val("asn"), warranty_until: val("aw"), notes: val("ano") });
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
