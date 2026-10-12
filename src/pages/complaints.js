/* Page: complaints. Loaded only when this page is opened. */
/* ---- Voice note (complaints): record up to 1 minute, upload it like a photo, keep its id in the sheet ---- */
const VN={};
const voiceHtml=id=>(VN[id]=null,`<div class="vn" id="${id}"><button type="button" class="vnb">🎤 Record voice note</button><div class="vnt"></div></div>`);
function voiceInit(id,maxSec=60){
 const el=$("#"+id),btn=el.querySelector(".vnb"),t=el.querySelector(".vnt");let rec=null,stream=null,tm=null,sec=0,chunks=[];
 const idle=()=>{btn.classList.remove("rec");btn.textContent="🎤 Record voice note"},
  stopAll=()=>{clearInterval(tm);tm=null;if(stream){stream.getTracks().forEach(x=>x.stop());stream=null}},
  show=()=>{const v=VN[id];if(!v){t.innerHTML="";btn.style.display="";return}
   btn.style.display="none";t.innerHTML=`<audio controls src="${v.url}"></audio> <button type="button" class="ghost vnx">Remove</button>`;
   t.querySelector(".vnx").onclick=()=>{URL.revokeObjectURL(v.url);VN[id]=null;show()}};
 btn.onclick=async()=>{
  if(rec&&rec.state==="recording"){rec.stop();return}
  if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder))return toast("Recording is not supported on this phone.");
  try{stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){return toast("Microphone is not allowed. Please allow Microphone for this app in your phone Settings.")}
  const mt=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg;codecs=opus"].find(x=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(x))||"";
  chunks=[];
  try{rec=new MediaRecorder(stream,Object.assign({audioBitsPerSecond:24000},mt?{mimeType:mt}:{}))}catch(e){stopAll();return toast("Recording is not supported on this phone.")}
  rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  rec.onstop=async()=>{stopAll();idle();
   const base=String(rec.mimeType||mt||"audio/webm").split(";")[0].replace(/^video\//,"audio/"),bl=new Blob(chunks,{type:base});
   if(sec<1||bl.size<800)return toast("Voice note is too short. Please try again.");
   if(bl.size>900000)return toast("Voice note is too big. Please record a shorter one.");
   const d=await b64(bl);VN[id]={d,url:URL.createObjectURL(bl),p:api({a:"upload",kind:"complaint",img:d},1).catch(()=>null)};show()};
  sec=0;rec.start();btn.classList.add("rec");btn.textContent="⏹ Stop · 0:00";
  tm=setInterval(()=>{sec++;btn.textContent="⏹ Stop · "+Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0");if(sec>=maxSec&&rec.state==="recording")rec.stop()},1000)}}
const vnTag=id=>`<div class="vnp"><button type="button" class="ghost" data-vnid="${esc(id)}">▶ Play voice note</button></div>`;
function vnBind(root){root.querySelectorAll("[data-vnid]").forEach(b=>b.onclick=async()=>{const o=b.textContent;b.disabled=true;b.textContent="Loading voice note…";
 try{const r=await api({a:"photo",id:b.dataset.vnid});if(!r.img)throw new Error("Voice note not available");
  const mime=r.img.slice(5,r.img.indexOf(";")),bin=atob(r.img.split(",")[1]),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
  const a=document.createElement("audio");a.controls=true;a.src=URL.createObjectURL(new Blob([u8],{type:mime}));b.replaceWith(a);a.play().catch(()=>{})}
 catch(e){toast(e.message);b.disabled=false;b.textContent=o}})}
/* =====================================================================================
   6. COMPLAINT TRACKING (ticket numbers, assignment, expected date, history, linked item)
   ===================================================================================== */
let CF = "all", CQ = "";
const tkt = c => c.ticket_no || (+c.id >= TMPID ? "Ticket number coming…" : "#" + c.id);
async function complaints(m) {
  const S = isIn(R_S), [cd, ad, ct] = await Promise.all([db.from("complaints").select("*").order("id", { ascending: false }), db.from("assets").select("*"), db.from("contacts").select("*")]);
  const all = cd.data || [], A = (ad.data || []).sort((x, y) => String(x.name).localeCompare(String(y.name))), q = CQ.toLowerCase();
  const n = s => all.filter(c => c.status === s).length;
  const L = all.filter(c => (CF === "all" || c.status === CF) && (!q || [c.ticket_no, c.title, c.details, c.flat_no, c.assigned_to].some(x => String(x || "").toLowerCase().includes(q))));
  const LBL = Object.fromEntries(CS);
  const hist = c => { let h = []; try { h = JSON.parse(c.history || "[]"); } catch (e) {} h = h.map(e => e.feedback ? Object.assign({}, e, { note: (e.feedback === "up" ? "👍 Feedback: satisfied" : "👎 Feedback: not satisfied") + (e.note ? " – " + e.note : "") }) : e); if (!h.length) h = [{ at: c.created_at, by: c.flat_no, status: "open", note: "Complaint raised" }];
    return `<div class="hist">${h.slice().reverse().map(e => `<div>${e.status ? `<b>${esc(LBL[e.status] || e.status)}</b>` : ""}${e.assigned_to ? `${e.status ? " · " : ""}Assigned to <b>${esc(e.assigned_to)}</b>` : ""}${e.expected_on ? ` · expected by ${dmx(e.expected_on)}` : ""}${e.note ? `<br>${esc(e.note)}` : ""}${e.photos ? `<div class="phs" style="margin-top:6px">${String(e.photos).split("|").filter(Boolean).map(phTag).join("")}</div>` : ""}<small>${esc(String(e.at || "").replace(/^(\d{4})-(\d{2})-(\d{2})/, (x, y, mo, d) => +d + "/" + +mo + "/" + y))} · ${esc(/^\d/.test(String(e.by)) ? "Flat " + e.by : cap(String(e.by || "")))}</small></div>`).join("")}</div>`; };
  /* status history as plain lines, for the printed register */
  const histTxt = c => { let h = []; try { h = JSON.parse(c.history || "[]"); } catch (e) {} if (!h.length) h = [{ at: c.created_at, by: c.flat_no, status: "open", note: "Complaint raised" }];
    return h.map(e => `<div style="margin-bottom:3px"><b>${esc(String(e.at || "").replace(/^(\d{4})-(\d{2})-(\d{2})/, (x, y, mo, d) => +d + "/" + +mo + "/" + y))}</b> · ${esc(/^\d/.test(String(e.by)) ? "Flat " + String(e.by).replace(" (alert)", "") : cap(String(e.by || "")))}: ${esc([e.status && (LBL[e.status] || e.status), e.assigned_to && "assigned to " + e.assigned_to, e.expected_on && "expected by " + dmx(e.expected_on), e.feedback && (e.feedback === "up" ? "feedback 👍" : "feedback 👎"), e.note, e.photos && String(e.photos).split("|").length + " photo(s)"].filter(Boolean).join(" · "))}</div>`).join(""); };
  /* feedback after Resolved: the flat that raised it may tap 👍 / 👎 (optional); the Association sees the answer */
  const mineC = c => me.role === "resident" && String(c.flat_no) === String(me.id);
  const fbBox = c => { if (c.status !== "resolved") return "";
    if (c.feedback) return `<div class="note" style="margin:10px 0 0;padding:10px 12px;border-radius:10px;background:${c.feedback === "up" ? "#e4f6ea" : "#fde8e6"};color:var(--ink)"><b>${c.feedback === "up" ? "👍 Satisfied" : "👎 Not satisfied"}</b>${mineC(c) ? " (your feedback)" : ` · Flat ${esc(c.flat_no)}`}${c.feedback_note ? `<br>“${esc(c.feedback_note)}”` : ""}${c.feedback_at ? `<small style="display:block;color:var(--grey)">${dmx(c.feedback_at)}</small>` : ""}${mineC(c) ? `<div style="margin-top:6px"><button class="ghost" style="width:auto" data-fbch="${c.id}">Change</button></div>` : ""}</div>`;
    if (!mineC(c)) return `<p class="note" style="margin:10px 0 0">No feedback from the flat yet.</p>`;
    return fbForm(c); };
  const fbForm = c => `<div class="card" id="fb${c.id}" style="margin:10px 0 0;background:var(--sky);border-color:transparent"><b>Are you happy with how this was fixed?</b> <small style="color:var(--grey)">(optional)</small>
     <div class="btnrow"><button data-fb="${c.id}:up" style="background:linear-gradient(135deg,#15803d,#22a35a)">👍 Yes</button><button class="ghost" data-fb="${c.id}:down">👎 No</button></div>
     <input data-fbn="${c.id}" placeholder="Add a note (optional)" style="margin-top:8px"></div>`;
  const card = c => { const k = CS.findIndex(x => x[0] === c.status), late = c.expected_on && c.status !== "resolved" && dLeft(c.expected_on) < 0, it = c.asset_id ? nameOfAsset(A, c.asset_id) : "";
    return `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><span class="tag">🎫 ${esc(tkt(c))}</span><span>${c.status === "resolved" && c.feedback ? `<span class="tag ${c.feedback === "up" ? "grn" : "red"}" title="Resident's feedback" style="font-size:.95rem">${c.feedback === "up" ? "👍" : "👎"}</span> ` : ""}<span class="tag ${c.status === "resolved" ? "grn" : c.status === "in_progress" ? "amb" : "red"}">${esc(LBL[c.status] || c.status)}</span></span></div>
     <b style="display:block;margin-top:6px">${esc(c.title)}</b>${c.details ? `<div>${esc(c.details)}</div>` : ""}${c.photos ? `<div class="phs">${String(c.photos).split("|").filter(Boolean).map(phTag).join("")}</div>` : ""}${c.voice ? vnTag(c.voice) : ""}
     <dl class="kv"><dt>Raised</dt><dd>Flat ${esc(c.flat_no)} · ${dmx(c.created_at)}</dd>${it ? `<dt>Related to</dt><dd>${esc(it)}</dd>` : ""}<dt>Assigned to</dt><dd>${c.assigned_to ? esc(c.assigned_to) : '<span style="color:var(--grey)">Not assigned yet</span>'}</dd>${c.expected_on ? `<dt>Expected by</dt><dd${late ? ' class="late"' : ""}>${dmx(c.expected_on)}${late ? " (overdue)" : ""}</dd>` : ""}${c.updated_at && c.updated_at !== c.created_at ? `<dt>Last update</dt><dd>${dmx(c.updated_at)}</dd>` : ""}</dl>
     <div class="stp">${CS.map((x, i) => `<span class="${i <= k ? "on" : ""}"></span>`).join("")}</div>
     ${c.reply_photos ? `<div style="margin-top:8px"><b style="font-size:.9rem">📷 Photos from the Association</b><div class="phs">${String(c.reply_photos).split("|").filter(Boolean).map(phTag).join("")}</div></div>` : ""}
     ${fbBox(c)}
     <details class="rec"><summary>Status history</summary>${hist(c)}</details>
     ${S ? `<div class="btnrow"><button data-cu="${c.id}">Update status</button><button class="ghost" data-cx="${c.id}">Delete</button></div>` : ""}</div>`; };
  m.innerHTML = `<div class="card"><b>Raise a complaint</b><div style="height:8px"></div><input id="ct" placeholder="What is the problem? e.g. Lift not working"><div style="height:8px"></div><input id="cd" placeholder="More details (optional)"><div style="height:8px"></div>
   ${A.length ? `${sel("cas", [["", "Related to (optional): choose an item"]].concat(A.map(a => [a.id, (AK[a.kind] || AK.other)[0] + " " + a.name])), "", 'aria-label="Related item"')}<div style="height:8px"></div>` : ""}${pickHtml("cph")}<div style="height:8px"></div>${voiceHtml("cvn")}<div style="height:8px"></div><button id="cs">Submit complaint</button>
   <p class="note" style="margin:8px 0 0">You get a ticket number, and an alert on your phone whenever the status changes.</p></div>
  <h2>${S ? "All complaints" : "Your complaints"}</h2>${S && all.some(c => c.feedback) ? `<p class="note">Feedback on resolved complaints: <b>👍 ${all.filter(c => c.feedback === "up").length}</b> · <b>👎 ${all.filter(c => c.feedback === "down").length}</b> · waiting ${all.filter(c => c.status === "resolved" && !c.feedback).length}</p>` : ""}
  ${all.length ? `<div class="chips">${[["all", "All", all.length], ["open", "Open", n("open")], ["in_progress", "In progress", n("in_progress")], ["resolved", "Resolved", n("resolved")]].map(([k, l, c]) => `<button class="${CF === k ? "" : "ghost"}" data-cf="${k}">${l} · ${c}</button>`).join("")}</div>
   ${all.length > 3 ? `<div style="display:flex;gap:8px;margin-bottom:12px"><input id="cq" type="search" value="${esc(CQ)}" placeholder="Search ticket, flat or words" style="flex:1;min-width:0"><button class="ghost" id="cqg" style="width:auto">Search</button></div>` : ""}` : ""}
  ${L.map(card).join("") || `<div class="card">${all.length ? "No complaints match." : "No complaints. 🎉"}</div>`}
  ${S && all.length ? `<div class="f">${prBtn("pcp", "Print complaint register")}</div>` : ""}`;
  loadPh(m); vnBind(m); pickInit("cph", 3); voiceInit("cvn");
  m.querySelectorAll("[data-cf]").forEach(b => b.onclick = () => { CF = b.dataset.cf; render(); });
  if ($("#cqg")) { const go = () => { CQ = $("#cq").value.trim(); render(); }; $("#cqg").onclick = go; $("#cq").onkeydown = e => { if (e.key === "Enter") go(); }; }
  if ($("#pcp")) $("#pcp").onclick = () => printHTML("Complaint register", sheetHead("Complaint register", CF === "all" ? "" : LBL[CF]) + ptable(["Ticket", "Raised", "Flat", "Problem", "Related to", "Assigned to", "Expected", "Status", "Feedback", "Status history"],
    L.map(c => [esc(tkt(c)), dmx(c.created_at), esc(c.flat_no), esc(c.title) + (c.details ? "<br><small>" + esc(c.details) + "</small>" : ""), esc(c.asset_id ? nameOfAsset(A, c.asset_id) : ""), esc(c.assigned_to || ""), dmx(c.expected_on), esc(LBL[c.status] || c.status), c.feedback === "up" ? "👍" : c.feedback === "down" ? "👎" + (c.feedback_note ? " " + esc(c.feedback_note) : "") : "", histTxt(c)])) + SIG, true);
  const sendFb = async (id, f) => { const nEl = m.querySelector(`[data-fbn="${id}"]`), note = nEl ? nEl.value.trim() : "", had = (all.find(x => String(x.id) === String(id)) || {}).feedback;
    if (+id >= TMPID) return toast("Still saving. Please try again in a moment.");
    try { await instant(setRow("complaints", id, { feedback: f, feedback_note: note, feedback_at: nowS() }), { a: "complaintFeedback", id, feedback: f, note }); } catch (e) { return toast(e.message); }
    toast(had ? "Feedback updated" : f === "up" ? "Thank you for your feedback 👍" : "Thank you. The Association has been told."); render(); };
  const bindFb = root => root.querySelectorAll("[data-fb]").forEach(b => b.onclick = () => { const [id, f] = b.dataset.fb.split(":"); sendFb(id, f); });
  bindFb(m);
  m.querySelectorAll("[data-fbch]").forEach(b => b.onclick = () => { const c = all.find(x => String(x.id) === b.dataset.fbch), box = b.closest(".note"), w = document.createElement("div");
    w.innerHTML = fbForm(c); box.replaceWith(w); bindFb(w); const n = w.querySelector("[data-fbn]"); if (n) n.value = c.feedback_note || ""; });
  $("#cs").onclick = async () => { const t = $("#ct").value.trim(); if (!t) return toast("Please describe the problem."); const dt = $("#cd").value.trim(), aid = $("#cas") ? $("#cas").value : "", v = VN.cvn; VN.cvn = null;
    const loc = (PK.cph || []).splice(0).map(d => { const lid = LID(); PH[lid] = Promise.resolve(d); const pre = UP.get(d); UP.delete(d); return { lid, d, pre }; });
    if (!SNAP) { const b = $("#cs"); b.disabled = true; b.textContent = "Uploading…"; }
    bgRun(T => applyLocal(T, "complaints", "insert", { title: t, details: dt, asset_id: aid, photos: loc.map(x => x.lid).join("|"), voice: "" }, []), async () => { const ids = []; for (const x of loc) ids.push(await upOne(x.d, "complaint", x.pre));
      const voice = v ? await upOne(v.d, "complaint", v.p) : ""; const w = await wrIns("complaints", { title: t, details: dt, asset_id: aid, photos: ids.join("|"), voice }); bgDrive(); return w; }).catch(() => {});
    toast("Complaint sent"); render(); };
  m.querySelectorAll("[data-cu]").forEach(b => b.onclick = () => { const c = all.find(x => String(x.id) === b.dataset.cu), ppl = (ct.data || []).map(x => x.name).filter(Boolean);
    sheet("Update " + esc(tkt(c)), `<p class="note" style="margin:6px 0 0">${esc(c.title)} · Flat ${esc(c.flat_no)}</p><div class="f">${fld("Status", sel("cus", CS, c.status))}${fld("Expected completion", dinp("cue", c.expected_on))}
     ${fld("Assigned to", `<input id="cua" list="cual" value="${esc(c.assigned_to || "")}" placeholder="Person or company"><datalist id="cual">${ppl.map(p => `<option value="${esc(p)}">`).join("")}</datalist>`, 1)}
     ${A.length ? fld("Related to", sel("cuit", [["", "Nothing selected"]].concat(A.map(a => [a.id, a.name])), c.asset_id), 1) : ""}${fld("Note for the resident (optional)", inp("cun", "", 'placeholder="e.g. Technician will come tomorrow"'), 1)}
     <div class="w"><label class="fl">Photos for the resident (optional, up to 3)</label>${pickHtml("cuph")}</div></div>`,
      async () => { const p = { status: val("cus"), expected_on: val("cue"), assigned_to: val("cua"), note: val("cun") }; if ($("#cuit")) p.asset_id = val("cuit");
        if (+c.id >= TMPID) return "Still saving. Please try again in a moment.";
        const loc = (PK.cuph || []).splice(0).map(d => { const lid = LID(); PH[lid] = Promise.resolve(d); const pre = UP.get(d); UP.delete(d); return { lid, d, pre }; });
        if (!loc.length) { const e = await saveBg("complaints", "update", p, [["id", c.id]]); if (!e) { toast("Updated. The resident gets an alert."); render(); } return e; }
        /* with photos: the update shows at once; the photos upload and the save finishes in the background */
        const local = T => { applyLocal(T, "complaints", "update", p, [["id", c.id]]); (T.complaints || []).filter(r => String(r.id) === String(c.id)).forEach(r => {
          let h = []; try { h = JSON.parse(r.history || "[]"); } catch (x) {} const e = { at: nowS(), by: me.id, photos: loc.map(x => x.lid).join("|") }; if (p.status !== c.status) e.status = p.status; if (p.note) e.note = p.note;
          h.push(e); r.history = JSON.stringify(h); r.reply_photos = String(r.reply_photos || "").split("|").filter(Boolean).concat(loc.map(x => x.lid)).join("|"); }); };
        bgRun(local, async () => { const ids = []; for (const x of loc) ids.push(await upOne(x.d, "complaint", x.pre));
          const w = await api({ a: "write", t: "complaints", op: "update", payload: Object.assign({}, p, { reply_photos: ids.join("|") }), filters: [["id", c.id]] }, 1); bgDrive(); return w; }).catch(() => {});
        toast("Updated with " + loc.length + " photo" + (loc.length > 1 ? "s" : "") + ". The resident gets an alert."); render(); return ""; }, "Save update");
    pickInit("cuph", 3); });
  m.querySelectorAll("[data-cx]").forEach(b => b.onclick = async () => { if (!confirm("Delete this complaint? This is recorded in the audit log.")) return; const e = await saveBg("complaints", "delete", null, [["id", b.dataset.cx]]); e ? toast(e) : render(); });
}
