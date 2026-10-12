/* Page: voting. Loaded only when this page is opened. */
async function polls(m){
 const can=NOTICE.includes(me.role),[p,v]=await Promise.all([db.from("polls").select("*").order("id",{ascending:false}),db.from("votes").select("*")]),V=v.data||[];
 m.innerHTML=`${can?`<div class="card"><b>New poll</b><div style="height:8px"></div><input id="pq" placeholder="Question"><div style="height:8px"></div><input id="po" placeholder="Options separated by commas, e.g. Yes, No"><div style="height:8px"></div><button id="pc">Start poll</button></div>`:""}
 ${(p.data||[]).map(q=>{const O=String(q.options).split("|"),my=V.find(x=>String(x.poll_id)===String(q.id)&&x.mine),tot=V.filter(x=>String(x.poll_id)===String(q.id)).length,open=q.status==="open";
  return `<div class="card"><b>${esc(q.question)}</b> <small style="color:var(--grey)">${open?"Open":"Closed"} · ${tot} vote${tot===1?"":"s"}</small>
  ${O.map(o=>{const n=V.filter(x=>String(x.poll_id)===String(q.id)&&x.choice===o).length,pc=tot?Math.round(n/tot*100):0;return my||!open?`<div class="bar${my&&my.choice===o?" me":""}"><div style="width:${Math.max(pc,12)}%">${esc(OPT(q,o))} · ${n} (${pc}%)</div></div>`:`<button class="ghost" style="margin-top:6px" data-v="${q.id}" data-c="${esc(o)}">${esc(OPT(q,o))}</button>`}).join("")}
  ${my?`<small style="color:var(--green)">You voted: ${esc(OPT(q,my.choice))}</small>`:""}${can?`<div class="f" style="margin-top:8px">${open?`<button class="ghost" data-pc="${q.id}">Close poll</button>`:""}<button class="ghost" data-px="${q.id}">Delete</button></div>`:""}</div>`}).join("")||`<div class="card">No polls yet.</div>`}`;
 if(can)$("#pc").onclick=async()=>{const{error}=await db.from("polls").insert({question:$("#pq").value.trim(),options:$("#po").value.split(",").map(x=>x.trim()).filter(Boolean).join("|")});error?toast(error.message):render()};
 document.querySelectorAll("[data-v]").forEach(b=>b.onclick=async()=>{const{error}=await db.from("votes").insert({poll_id:+b.dataset.v,choice:b.dataset.c});error?toast(error.message):render()});
 document.querySelectorAll("[data-pc]").forEach(b=>b.onclick=async()=>{await db.from("polls").update({status:"closed"}).eq("id",b.dataset.pc);render()});
 document.querySelectorAll("[data-px]").forEach(b=>b.onclick=async()=>{await db.from("polls").delete().eq("id",b.dataset.px);render()})}
