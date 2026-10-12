/* Page: audit. Loaded only when this page is opened. */
let AF = { tbl: "", act: "", who: "", from: "", to: "" }, AR = null;
async function auditLog(m) {
  if (!isIn(R_S)) { m.innerHTML = `<div class="card">Only the president, secretary, treasurer and admin can see the audit log.</div>`; return; }
  const ids = ["1234", "president", "secretary", "treasurer", "executive"].concat(IDS.filter(x => /^\d/.test(x.u)).map(x => x.u));
  m.innerHTML = `<p class="note">Every addition, change and deletion of money entries (payments, expenses, income, month locks) and other important records, with who did it and when. Entries cannot be changed or deleted from the app.</p>
  <div class="card"><div class="f">${fld("Section", sel("af1", [["", "All sections"]].concat(Object.entries(AT)), AF.tbl))}${fld("Action", sel("af2", [["", "All actions"]].concat(Object.entries(AA).map(([k, v]) => [k, v[0]])), AF.act))}
   ${fld("Done by", sel("af3", [["", "Everybody"]].concat(ids.map(u => [u, u === "1234" ? "Admin" : /^\d/.test(u) ? "Flat " + u : cap(u)])), AF.who))}<div></div>${fld("From", dinp("af4", AF.from))}${fld("To", dinp("af5", AF.to))}</div>
   <div class="btnrow"><button id="ago">Show</button><button class="ghost" id="aclr">Clear</button></div></div><div id="aout"><div class="card">Loading…</div></div>`;
  const show = rows => {
    const fmtJ = s => { try { const o = JSON.parse(s); return Object.entries(o).filter(([k, v]) => v !== null && v !== "" && !["created_at", "updated_at"].includes(k)).map(([k, v]) => `${esc(k.replace(/_/g, " "))}: <b>${esc(String(v).slice(0, 160))}</b>`).join(" · "); } catch (e) { return esc(s || ""); } };
    const det = r => { const b = r.before ? fmtJ(r.before) : "", a = r.after ? fmtJ(r.after) : ""; return b || a ? `<details><summary class="dfx">Details</summary><div class="dfx">${b ? "Before: " + b : ""}${b && a ? "<br>" : ""}${a ? (r.action === "update" ? "Changed to: " : "Saved: ") + a : ""}</div></details>` : ""; };
    const who = r => /^\d+$/.test(String(r.username)) && r.role === "resident" ? "Flat " + r.username : r.role === "admin" ? "Admin" : cap(String(r.role || r.username || ""));
    const when = r => esc(String(r.at || "").replace(/^(\d{4})-(\d{2})-(\d{2})/, (x, y, mo, d) => d + "/" + mo + "/" + y));
    $("#aout").innerHTML = `<div class="f">${prBtn("apr", "Print")}</div><div class="card">${rows.map(r => { const a = AA[r.action] || [r.action, "gry"];
      return `<div class="it" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span><span class="tag ${a[1]}">${esc(a[0])}</span> <b>${esc(AT[r.tbl] || r.tbl)}</b></span><small style="color:var(--grey)">${when(r)} · ${esc(who(r))}</small></div><div style="margin-top:4px;overflow-wrap:anywhere">${esc(r.summary || "")}</div>${det(r)}</div>`; }).join("") || "Nothing recorded for this choice."}
     ${rows.length >= 400 ? `<p class="note">Showing the latest 400. Choose dates or a section to see older entries.</p>` : ""}</div>`;
    $("#apr").onclick = () => printHTML("Audit log", sheetHead("Audit log", [AF.tbl && AT[AF.tbl], AF.from && "from " + dmx(AF.from), AF.to && "to " + dmx(AF.to)].filter(Boolean).join(" ")) + ptable(["When", "Who", "Action", "Section", "Record"], rows.map(r => [esc(r.at), esc(who(r)), esc((AA[r.action] || [r.action])[0]), esc(AT[r.tbl] || r.tbl), esc(r.summary || "")])), true);
  };
  const load = async () => { try { const r = await api({ a: "audit", ...AF }); if (r.error) throw new Error(r.error.message); AR = r.rows || []; show(AR); } catch (e) { $("#aout").innerHTML = `<div class="card"><p class="err">${esc(e.message)}</p></div>`; } };
  $("#ago").onclick = () => { AF = { tbl: val("af1"), act: val("af2"), who: val("af3"), from: val("af4"), to: val("af5") }; load(); };
  $("#aclr").onclick = () => { AF = { tbl: "", act: "", who: "", from: "", to: "" }; auditLog(m); };
  load();
}
