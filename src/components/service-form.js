/* Service record form and due tags (Assets and Reminders). Loaded when needed. */
const dueTag = d => { if (!d) return ""; const n = dLeft(d); return n < 0 ? `<span class="tag red">${-n} day${n === -1 ? "" : "s"} late</span>` : n === 0 ? `<span class="tag red">Due today</span>` : n <= 7 ? `<span class="tag amb">In ${n} day${n === 1 ? "" : "s"}</span>` : `<span class="tag gry">In ${n} days</span>`; };
const SVK = { service: "Service", repair: "Repair", inspection: "Inspection", replacement: "Replacement" };
function serviceForm(A, s = {}, lockAsset, opt = {}) {
  const S = isIn(R_COM);
  return `<div class="f">${lockAsset ? "" : fld("Item", sel("sa", A.map(a => [a.id, a.name]), s.asset_id), 1)}${opt.noDate ? "" : fld("Date", dinp("sd", s.service_on || ld()))}${fld("Work done", sel("sk", Object.entries(SVK), s.kind || "service"))}
  ${fld("Done by", inp("sb", s.done_by, 'placeholder="Technician or company"'))}${S ? fld("Cost (₹)", inp("sc", s.cost, 'type="number" min="0" inputmode="decimal" placeholder="0 if free / AMC"')) : ""}
  ${fld("Details", tarea("sx", s.details, "What was checked, repaired or replaced"), 1)}${opt.noNext ? "" : fld("Next service due (optional, creates a reminder)", dinp("sn", s.next_due), 1)}</div>`;
}
const serviceVals = () => ({ service_on: val("sd"), kind: val("sk"), done_by: val("sb"), cost: val("sc") === "" ? "" : +val("sc"), details: val("sx"), next_due: val("sn") });
