/* Page: maintenance. Loaded only when this page is opened. */
function wlabel(f,t){if(wp==="w"){const e=U(t);e.setUTCDate(e.getUTCDate()-1);return dm(f)+" – "+dm(iso(e))}return wp==="m"?MN[+f.slice(5,7)-1]+" "+f.slice(0,4):f.slice(0,4)}
function wstep(n){const a=U(wa);if(wp==="w")a.setUTCDate(a.getUTCDate()+7*n);else if(wp==="m")a.setUTCMonth(a.getUTCMonth()+n,1);else a.setUTCFullYear(a.getUTCFullYear()+n,0,1);wa=iso(a)}
async function works(m,canW){
 wa=wa||ld();const[f,t]=wr(),ST=["completed","pending","partial"];
 const{data}=await db.from("maintenance_log").select("*").gte("logged_on",f).lt("logged_on",t);
 const rows=(data||[]).sort(byDate("logged_on")),cnt=s=>rows.filter(r=>r.status===s).length;
 m.innerHTML=`<div style="display:flex;gap:8px">${[["w","Weekly"],["m","Monthly"],["y","Yearly"]].map(([k,l])=>`<button class="${wp===k?"":"ghost"}" data-wp="${k}">${l}</button>`).join("")}</div>
 <div style="display:flex;gap:8px;margin-top:8px;align-items:center"><button class="ghost" style="width:auto" id="wpv" aria-label="Previous">‹</button><div style="flex:1;text-align:center;font-weight:700">${wlabel(f,t)}</div><button class="ghost" style="width:auto" id="wnx" aria-label="Next">›</button></div>
 <div class="card" style="margin-top:10px">${ST.map(s=>`<span class="badge ${s.toUpperCase()}">${cap(s)}</span> <b>${cnt(s)}</b>`).join(" &nbsp; ")}</div>
 <div class="f">${prBtn("wp1","Print this period")}${prBtn("wp2","Print all entries")}</div>
 <div class="card tw" style="margin-top:10px"><table class="tbl"><thead><tr><th>Sl.No</th><th>Date</th><th>Details</th><th>Status</th>${canW?"<th></th>":""}</tr></thead><tbody>
 ${rows.map((r,i)=>`<tr><td>${i+1}</td><td style="white-space:nowrap">${dm(r.logged_on)}</td><td>${esc(r.details)}</td><td>${canW?`<select data-ws="${r.id}">${ST.map(s=>`<option value="${s}"${s===r.status?" selected":""}>${cap(s)}</option>`).join("")}</select>`:`<span class="badge ${String(r.status).toUpperCase()}">${cap(r.status)}</span>`}</td>${canW?`<td><button class="ghost" data-wd="${r.id}">Delete</button></td>`:""}</tr>`).join("")||`<tr><td colspan="${canW?5:4}">No maintenance entries in this period.</td></tr>`}</tbody></table></div>
 ${canW?`<h2>Add maintenance</h2><div class="card"><div class="f">${dateField("wd","Date")}<input id="wt" class="w" placeholder="Details, e.g. Lift servicing"><select id="wst" class="w">${ST.map(s=>`<option value="${s}">${cap(s)}</option>`).join("")}</select><button class="w" id="wsave">Save entry</button></div></div>`:""}`;
 document.querySelectorAll("[data-wp]").forEach(b=>b.onclick=()=>{wp=b.dataset.wp;render()});
 $("#wpv").onclick=()=>{wstep(-1);render()};$("#wnx").onclick=()=>{wstep(1);render()};
 const wprint=(title,list,sub)=>{const c=st=>list.filter(r=>r.status===st).length;
  printHTML(title,sheetHead(title,sub)+`<div class="box">Completed: ${c("completed")} &nbsp;·&nbsp; Pending: ${c("pending")} &nbsp;·&nbsp; Partial: ${c("partial")} &nbsp;·&nbsp; Total: ${list.length}</div>`+ptable(["Sl.No","Date","Details","Status"],list.map((r,i)=>[i+1,dm(r.logged_on),esc(r.details),cap(r.status)]),null,["c","","",""])+SIG)};
 $("#wp1").onclick=()=>wprint("Maintenance log: "+wlabel(f,t),rows,{w:"Weekly",m:"Monthly",y:"Yearly"}[wp]);
 $("#wp2").onclick=async()=>{const{data:all}=await db.from("maintenance_log").select("*");wprint("Maintenance log: all entries",(all||[]).sort(byDate("logged_on")),"")};
 if(!canW)return;today("wd");
 $("#wsave").onclick=async()=>{const d=gd("wd"),x=$("#wt").value.trim();if(!d||!x)return toast("Enter a valid date (dd/mm/yyyy) and the details");
  const{error}=await db.from("maintenance_log").insert({logged_on:d,details:x,status:$("#wst").value});error?toast(error.message):(wa=d,toast("Maintenance entry added"),render())};
 document.querySelectorAll("[data-ws]").forEach(s=>s.onchange=async()=>{const{error}=await db.from("maintenance_log").update({status:s.value}).eq("id",s.dataset.ws);error?toast(error.message):(toast("Status updated"),render())});
 document.querySelectorAll("[data-wd]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this maintenance entry?"))return;const{error}=await db.from("maintenance_log").delete().eq("id",b.dataset.wd);error?toast(error.message):render()})}
