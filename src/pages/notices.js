/* Page: notices. Loaded only when this page is opened. */
async function notices(m){
 const{data}=await db.from("notices").select("*").order("id",{ascending:false});const can=NOTICE.includes(me.role);
 m.innerHTML=`<div class="f">${prBtn("pn","Print all notices")}</div><div style="height:10px"></div>${can?`<div class="card"><input id="nt" placeholder="Notice title"><div style="height:8px"></div><button id="ns">Post notice</button></div>`:""}
 <div class="card">${(data||[]).map(n=>`<div class="it"><div>${esc(n.title)}<small>${n.created_on}</small></div>${can?`<button class="ghost" data-n="${n.id}">Delete</button>`:""}</div>`).join("")||"No notices yet."}</div>`;
 $("#pn").onclick=()=>printHTML("Notices",sheetHead("Notice board")+ptable(["Sl.No","Date","Notice"],(data||[]).map((n,i)=>[i+1,esc(n.created_on),esc(n.title)]),null,["c","",""])+SIG);
 if(can){$("#ns").onclick=async()=>{const t=$("#nt").value.trim();if(!t)return;const{error}=await db.from("notices").insert({title:t});error?toast(error.message):render()};
  document.querySelectorAll("[data-n]").forEach(b=>b.onclick=async()=>{await db.from("notices").delete().eq("id",b.dataset.n);render()})}}
