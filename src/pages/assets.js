/* Page: assets. Loaded only when this page is opened. */
const AST = { working: ["Working", "grn"], repair: ["Under repair", "amb"], out_of_service: ["Out of service", "red"] };
/* ---------- Major assets (lift, generator, motors…) and Minor items (chairs, bulbs, buckets… bought for common use) ---------- */
let AVW = "major", MCAT = "all";
const MIC = { furniture: ["🪑", "Furniture"], electrical: ["💡", "Electrical"], cleaning: ["🧹", "Cleaning"], plumbing: ["🚿", "Plumbing"], garden: ["🌱", "Garden"], security: ["🔒", "Security"],
  decoration: ["🎉", "Festival / decoration"], kitchen: ["🍽", "Kitchen / utensils"], tools: ["🧰", "Tools"], stationery: ["📒", "Stationery"], other: ["📦", "Other"] };
const MCOND = { good: ["Good", "grn"], damaged: ["Damaged", "amb"], lost: ["Lost", "red"], used_up: ["Used up", "gry"] };
const MPICK = [["Plastic chairs", "furniture"], ["LED bulbs", "electrical"], ["Tube lights", "electrical"], ["Extension board", "electrical"], ["Brooms & mops", "cleaning"],
  ["Buckets & mugs", "cleaning"], ["Dustbins", "cleaning"], ["Water hose pipe", "garden"], ["Padlocks", "security"], ["Tool kit", "tools"]];
function itemForm(x = {}) {
  return `<div class="f">${fld("Item", inp("min", x.name, 'placeholder="e.g. Plastic chairs, LED bulbs"'), 1)}${fld("Category", sel("mca", Object.entries(MIC).map(([k, v]) => [k, v[0] + " " + v[1]]), x.category || "other"))}
  ${fld("Quantity", inp("mqt", x.qty ?? 1, 'type="number" inputmode="numeric" min="0" step="1"'))}${fld("Unit", inp("mun", x.unit || "pcs", 'list="munl" placeholder="pcs"') + `<datalist id="munl">${["pcs", "sets", "pairs", "boxes", "packets", "metres", "litres", "kg"].map(u => `<option value="${u}">`).join("")}</datalist>`)}
  ${fld("Bought on", dinp("mbo", x.bought_on || (x.id ? "" : ld())))}${fld("Total cost (₹)", inp("mco", x.cost, 'type="number" inputmode="decimal" min="0" step="any" placeholder="0"'))}
  ${fld("Bought from (shop)", inp("mbf", x.bought_from))}${fld("Kept at", inp("mlo", x.location, 'placeholder="e.g. Terrace store room"'))}${fld("Condition", sel("mcd", Object.entries(MCOND).map(([k, v]) => [k, v[0]]), x.condition || "good"))}
  ${fld("Notes", tarea("mno", x.notes, "Brand, size, who has it…"), 1)}</div>`;
}
const itemVals = () => ({ name: val("min"), category: val("mca"), qty: val("mqt"), unit: val("mun") || "pcs", bought_on: val("mbo"), cost: val("mco"), bought_from: val("mbf"), location: val("mlo"), condition: val("mcd"), notes: val("mno") });
const itemErr = v => !v.name ? "Enter the name of the item" : !(+v.qty >= 0 && Math.floor(+v.qty) === +v.qty && v.qty !== "") ? "Enter the quantity (0 or more)" : v.cost !== "" && !(+v.cost >= 0) ? "Enter a cost of 0 or more" : "";
function minorItems(m, IT, top) {
  const canA = isIn(R_S), seeCost = me.role !== "resident";
  const all = IT.slice().sort((x, y) => String(y.bought_on || "").localeCompare(String(x.bought_on || "")) || String(x.name).localeCompare(String(y.name)));
  const cats = Object.keys(MIC).filter(k => all.some(x => (x.category || "other") === k));
  if (MCAT !== "all" && !cats.includes(MCAT)) MCAT = "all";
  const L = MCAT === "all" ? all : all.filter(x => (x.category || "other") === MCAT);
  const n = k => all.filter(x => (x.condition || "good") === k).length, spent = all.reduce((t, x) => t + (+x.cost || 0), 0);
  /* one line per item (fits a phone without sideways scrolling); the printed register is a full table */
  const row = x => { const c = MIC[x.category] || MIC.other, k = MCOND[x.condition] || MCOND.good;
    return `<div class="mi"><div class="mi-l"><b>${esc(x.name)}</b> <span class="tag ${k[1]}">${k[0]}</span><small>${c[0]} ${esc([c[1], x.bought_on ? dmx(x.bought_on) : "", x.location].filter(Boolean).join(" · "))}</small>${x.notes ? `<small>${esc(x.notes)}</small>` : ""}
     ${canA ? `<div class="mi-a"><button class="ghost" data-med="${x.id}">Edit</button><button class="ghost" data-mdel="${x.id}">Delete</button></div>` : ""}</div>
     <div class="mi-r"><b>${esc(String(x.qty ?? ""))} ${esc(x.unit || "pcs")}</b>${seeCost && x.cost !== "" && x.cost != null ? `<small>${inr(x.cost)}</small>` : ""}${seeCost && x.bought_from ? `<small>${esc(x.bought_from)}</small>` : ""}</div></div>`; };
  m.innerHTML = top + `<div class="card" style="padding:12px"><div class="tiles"><div class="grn"><b>${n("good")}</b><small>Good</small></div><div class="amb"><b>${n("damaged")}</b><small>Damaged</small></div><div class="red"><b>${n("lost") + n("used_up")}</b><small>Lost / used up</small></div></div>
   ${seeCost && spent ? `<p class="note" style="margin:10px 0 0">Spent on minor items: <b>${inr(spent)}</b></p>` : ""}</div>
  ${all.length ? `<div class="chips"><button class="${MCAT === "all" ? "" : "ghost"}" data-mcat="all">All · ${all.length}</button>${cats.map(k => `<button class="${MCAT === k ? "" : "ghost"}" data-mcat="${k}">${MIC[k][0]} ${MIC[k][1]} · ${all.filter(x => (x.category || "other") === k).length}</button>`).join("")}</div>
   <div class="f">${prBtn("pmi", "Print minor items")}</div>
   <div class="card mil">${L.map(row).join("")}</div>`
   : `<div class="card">No minor items added yet.${canA ? " Add chairs, bulbs, buckets and other small things bought for the apartment below." : ""}</div>`}
  ${canA ? `<h2>Add a minor item</h2><div class="card"><p class="note" style="margin-top:0">Quick pick:</p><div class="chips">${MPICK.map((p, i) => `<button class="ghost" type="button" data-mpk="${i}">${MIC[p[1]][0]} ${p[0]}</button>`).join("")}</div>${itemForm()}<div class="f"><button class="w" id="msv">Save item</button></div></div>` : ""}`;
  m.querySelectorAll("[data-mcat]").forEach(b => b.onclick = () => { MCAT = b.dataset.mcat; render(); });
  if ($("#pmi")) $("#pmi").onclick = () => { const t = MCAT === "all" ? "Minor items" : "Minor items: " + MIC[MCAT][1];
    printHTML(t, sheetHead(t) + ptable(["Item", "Qty", "Category", "Bought on", "Kept at", "Condition"].concat(seeCost ? ["Bought from", "Cost"] : []),
      L.map(x => [esc(x.name) + (x.notes ? `<small style="display:block">${esc(x.notes)}</small>` : ""), esc(String(x.qty ?? "")) + " " + esc(x.unit || "pcs"), esc((MIC[x.category] || MIC.other)[1]), x.bought_on ? dmx(x.bought_on) : "-", esc(x.location || ""), (MCOND[x.condition] || MCOND.good)[0]]
        .concat(seeCost ? [esc(x.bought_from || ""), x.cost !== "" && x.cost != null ? inr(x.cost) : "-"] : [])),
      seeCost ? ["", "", "", "", "", "", "Total", inr(L.reduce((t, x) => t + (+x.cost || 0), 0))] : null, ["", "r", "", "", "", "", "", "r"]) + SIG, true); };
  m.querySelectorAll("[data-mpk]").forEach(b => b.onclick = () => { const p = MPICK[+b.dataset.mpk]; $("#min").value = p[0]; $("#mca").value = p[1]; $("#mqt").focus(); });
  if (canA) $("#msv").onclick = async () => { const v = itemVals(), er = itemErr(v); if (er) return toast(er); const e = await saveBg("asset_items", "insert", v); e ? toast(e) : (toast("Item saved"), render()); };
  m.querySelectorAll("[data-med]").forEach(b => b.onclick = () => { const x = all.find(q => String(q.id) === b.dataset.med);
    sheet("Edit " + esc(x.name), itemForm(x), async () => { const v = itemVals(), er = itemErr(v); if (er) return er; const e = await saveBg("asset_items", "update", v, [["id", x.id]]); if (!e) { toast("Saved"); render(); } return e; }); });
  m.querySelectorAll("[data-mdel]").forEach(b => b.onclick = async () => { if (!confirm("Delete this item? This is recorded in the audit log.")) return; const e = await saveBg("asset_items", "delete", null, [["id", b.dataset.mdel]]); e ? toast(e) : render(); });
}
function assetForm(a = {}) {
  return `<div class="f">${fld("Name", inp("an", a.name, 'placeholder="e.g. Lift (Block A)"'), 1)}${fld("Type", sel("ak", Object.entries(AK).map(([k, v]) => [k, v[1]]), a.kind || "lift"))}${fld("Condition", sel("ast", Object.entries(AST).map(([k, v]) => [k, v[0]]), a.status || "working"))}
  ${fld("Location", inp("al", a.location, 'placeholder="e.g. Cellar"'))}${fld("Installed on", dinp("ai", a.installed_on))}${fld("Supplier / service company", inp("av", a.vendor))}${fld("Supplier phone", inp("avp", a.vendor_phone, 'type="tel" inputmode="tel"'))}
  ${fld("Model", inp("am", a.model))}${fld("Serial number", inp("asn", a.serial_no))}${fld("Warranty / AMC ends on", dinp("aw", a.warranty_until))}${fld("Notes", tarea("ano", a.notes, "Anything useful: AMC details, capacity, battery count…"), 1)}</div>`;
}
const assetVals = () => ({ name: val("an"), kind: val("ak"), status: val("ast"), location: val("al"), installed_on: val("ai"), vendor: val("av"), vendor_phone: val("avp"), model: val("am"), serial_no: val("asn"), warranty_until: val("aw"), notes: val("ano") });
async function assets(m) {
  const [a, s, r, c, it] = await Promise.all([db.from("assets").select("*"), db.from("asset_service").select("*"), db.from("reminders").select("*"), db.from("complaints").select("*"), db.from("asset_items").select("*")]);
  const top = `<div class="chips"><button class="${AVW === "major" ? "" : "ghost"}" data-avw="major">🏗 Major assets · ${(a.data || []).length}</button><button class="${AVW === "minor" ? "" : "ghost"}" data-avw="minor">🪑 Minor items · ${(it.data || []).length}</button></div>`;
  const bindTop = () => m.querySelectorAll("[data-avw]").forEach(b => b.onclick = () => { AVW = b.dataset.avw; window.scrollTo(0, 0); render(); });
  if (AVW === "minor") { minorItems(m, it.data || [], top); bindTop(); return; }
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
  m.innerHTML = top + `<div class="card" style="padding:12px"><div class="tiles"><div class="grn"><b>${cnt("working")}</b><small>Working</small></div><div class="amb"><b>${cnt("repair")}</b><small>Under repair</small></div><div class="red"><b>${cnt("out_of_service")}</b><small>Out of service</small></div></div></div>
  ${A.length ? `<div class="f">${prBtn("pas", "Print asset register")}</div>` : ""}
  ${A.map(card).join("") || `<div class="card">No items added yet.${canA ? " Add the lift, generator, motors, CCTV and water pumps below." : ""}</div>`}
  ${canA ? `<h2>Add an item</h2><div class="card">${assetForm()}<div class="f"><button class="w" id="asv">Save item</button></div></div>` : ""}`;
  bindTop();
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
