/* Page: payments. Loaded only when this page is opened. */
async function maint(m,canW){
 const{data:flats}=await db.from("flats").select("*").order("flat_no");
 const{data:pays}=await db.from("payments").select("*").eq("month",month+"-01").order("receipt_no");
 const{data:rt}=await db.from("maintenance_rates").select("amount").eq("month",month+"-01").maybeSingle();
 const rate=rt?+rt.amount:null,due=f=>rate!==null?rate:+f.monthly_amount;
 const rateBox=`<div class="card" style="margin-top:10px"><b>Maintenance per Flat</b> <span style="color:var(--grey);font-size:.85rem">for ${month}</span><div style="font-size:1.5rem;font-weight:700;color:var(--navy)">${rate!==null?inr(rate)+" / flat":"Not decided yet"}</div>${rate===null?'<small style="color:var(--grey)">Showing each flat\'s default amount until this month\'s amount is set.</small>':""}
 ${canW?`<div class="f"><input id="rt" type="number" min="0" placeholder="Amount to collect from each flat (₹)" value="${rate!==null?rate:""}"><button class="w" id="rs">Save amount for ${month}</button></div>`:""}</div>`;
 let hp=[],hist="";
 if(me.role==="resident"){
  const ids=(flats||[]).map(f=>f.id);
  hp=ids.length?((await db.from("payments").select("*").in("flat_id",ids).order("month",{ascending:false})).data||[]):[];
  const{data:allr}=await db.from("maintenance_rates").select("*"),rmap={};(allr||[]).forEach(r=>rmap[r.month]=+r.amount);
  const mk={};hp.forEach(p=>(mk[p.month]=mk[p.month]||[]).push(p));mk[month+"-01"]=mk[month+"-01"]||[];
  const dueOf=mo=>(flats||[]).reduce((a,f)=>a+(rmap[mo]!==undefined?rmap[mo]:+f.monthly_amount),0),total=hp.reduce((a,p)=>a+ +p.amount,0);
  const ms=[...new Set([...Object.keys(mk),...Object.keys(rmap)])].filter(k=>k<=month+"-01"),net=ms.reduce((a,mo)=>a+dueOf(mo)-(mk[mo]||[]).reduce((x,p)=>x+ +p.amount,0),0);
  hist=`<h2>My payment history · ${inr(total)} paid</h2><div class="card"><b>${net>0?"Outstanding up to "+month+": "+inr(net):net<0?"Advance paid: "+inr(-net):"All dues cleared up to "+month}</b></div><div class="card">`+Object.keys(mk).sort().reverse().map(mo=>{const ps=mk[mo].sort((a,b)=>a.paid_on<b.paid_on?-1:1),paid=ps.reduce((a,x)=>a+ +x.amount,0),due=dueOf(mo),st=paid>=due?"PAID":paid>0?"PARTIAL":"PENDING";
   return `<div class="it"><div>${MN[+mo.slice(5,7)-1]} ${mo.slice(0,4)}<small>${inr(paid)} of ${inr(due)}${ps.length?"<br>"+ps.map(x=>dm(x.paid_on)+" · "+inr(x.amount)+" ("+x.mode+(x.reference?", ref "+esc(x.reference):"")+(x.remarks?", "+esc(x.remarks):"")+")").join("<br>"):""}</small></div><div><span class="badge ${st}">${st}</span>${ps.map(x=>` <button class="ghost" data-r="${x.id}">Receipt #${x.receipt_no}</button>`).join("")}</div></div>`}).join("")+`</div>`}
 const rows=(flats||[]).map(f=>{const p=(pays||[]).filter(x=>x.flat_id===f.id),paid=p.reduce((a,x)=>a+ +x.amount,0);
  const D=due(f),st=paid>=D?"PAID":paid>0?"PARTIAL":"PENDING";
  return `<div class="it"><div>Flat ${esc(f.flat_no)}<small>${inr(paid)} of ${inr(D)}${p.length?"<br>Paid on "+p.map(x=>dm(x.paid_on)+" ("+x.mode+(x.reference?", ref "+esc(x.reference):"")+(x.remarks?", "+esc(x.remarks):"")+")").join("; "):""}</small></div><div><span class="badge ${st}">${st}</span>
  ${p.map(x=>` <button class="ghost" data-r="${x.id}">Receipt #${x.receipt_no}</button>`).join("")}</div></div>`}).join("");
 m.innerHTML=`<input type="month" id="mo" value="${month}"><div class="f">${prBtn("ppr","Print "+month+" sheet")}${prBtn("ppy","Print full year")}</div>${rateBox}<div class="card">${rows||"No flats found."}</div>${hist}
 ${canW?`<h2>Record payment</h2><p style="margin:0 0 8px;color:var(--grey);font-size:.85rem">Counts toward maintenance for the month selected above.</p><div class="card"><div class="f"><select id="pf" class="w">${(flats||[]).map(f=>`<option value="${f.id}">Flat ${esc(f.flat_no)}</option>`).join("")}</select>
 <input id="pa" type="number" min="1" placeholder="Amount (₹)">${dateField("pd","Payment date (when money was received)")}<select id="pm" class="w"><option>cash</option><option>bank</option><option>upi</option></select>
 <input id="pr" class="w" placeholder="Transaction reference (optional)"><input id="prm" class="w" placeholder="Remarks (optional)"><button class="w" id="ps">Save payment</button></div></div>`:""}`;
 $("#mo").onchange=e=>{month=e.target.value;render()};
 $("#ppr").onclick=async()=>{
  const staff=me.role!=="resident",fs=flats||[];let tD=0,tP=0;
  const body=fs.map(f=>{const p=(pays||[]).filter(x=>x.flat_id===f.id),paid=p.reduce((a,x)=>a+ +x.amount,0),D=due(f);tD+=D;tP+=paid;
   return [esc(f.flat_no),inr(D),inr(paid),inr(Math.max(D-paid,0)),paid>=D?"PAID":paid>0?"PARTIAL":"PENDING",p.map(x=>dm(x.paid_on)+" · "+inr(x.amount)+" · "+esc(x.mode)+(x.reference?" · ref "+esc(x.reference):"")+(x.remarks?" · "+esc(x.remarks):"")+" · Rec #"+x.receipt_no).join("<br>")||"-"]});
  let h=sheetHead("Maintenance payments: "+month,rate!==null?"Rate "+inr(rate)+" per flat":"")+ptable(["Flat","Due","Paid","Balance","Status","Payment details"],body,["Total",inr(tD),inr(tP),inr(Math.max(tD-tP,0)),"",""],["","r","r","r","c",""]);
  if(staff){const{data:inc}=await db.from("income").select("*").gte("received_on",month+"-01").lt("received_on",nx(+month.slice(0,4),+month.slice(5,7))).order("received_on");
   const L={other:"Other income",corpus:"Corpus fund",corpus_interest:"Corpus fund interest"};
   Object.keys(L).forEach(k=>{const r=(inc||[]).filter(x=>x.category===k);if(r.length)h+=`<h3>${L[k]}</h3>`+ptable(["Sl.No","Date","Mode","Remarks","Amount"],r.map((x,i)=>[i+1,dm(x.received_on),esc(x.mode),esc(x.remarks||""),inr(x.amount)]),["","","","Total",inr(r.reduce((a,x)=>a+ +x.amount,0))],["","","","","r"])})}
  printHTML("Maintenance payments "+month,h+SIG,true)};
 $("#ppy").onclick=async()=>{
  const y=+month.slice(0,4),{data:yp}=await db.from("payments").select("*").gte("month",y+"-01-01").lt("month",(y+1)+"-01-01");
  const fs=flats||[],col=new Array(12).fill(0);
  const body=fs.map(f=>{let t=0;const cells=MN.map((_,i)=>{const mo=y+"-"+String(i+1).padStart(2,"0")+"-01",v=(yp||[]).filter(x=>x.flat_id===f.id&&x.month===mo).reduce((a,x)=>a+ +x.amount,0);t+=v;col[i]+=v;return v?nf(v):"-"});return [esc(f.flat_no),...cells,nf(t)]});
  printHTML("Maintenance payments "+y,sheetHead("Maintenance collected: year "+y,"Amounts in ₹")+ptable(["Flat",...MN,"Total"],body,["Total",...col.map(v=>v?nf(v):"-"),nf(col.reduce((a,b)=>a+b,0))],["","r","r","r","r","r","r","r","r","r","r","r","r","r"])+SIG,true)};
 if(canW)$("#rs").onclick=async()=>{const a=$("#rt").value;if(a===""||!(+a>=0))return toast("Enter the amount per flat");
  const{error}=await db.from("maintenance_rates").upsert({month:month+"-01",amount:+a},{onConflict:"month"});error?toast(error.message):(toast("Maintenance per flat saved for "+month),render())};
 if(canW)$("#ps").onclick=async()=>{const a=+$("#pa").value;if(!(a>0))return toast("Enter an amount above 0");if(!gd("pd"))return toast("Enter a valid payment date (dd/mm/yyyy)");
  const{error}=await db.from("payments").insert({flat_id:+$("#pf").value,month:month+"-01",amount:a,paid_on:gd("pd"),mode:$("#pm").value,reference:$("#pr").value||null,remarks:$("#prm").value||null});
  error?toast(error.message):(toast("Payment saved for "+month),render())};
 document.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{const p=(pays||[]).concat(hp).find(x=>x.id==b.dataset.r),f=flats.find(x=>x.id===p.flat_id);receipt(p,f)})}
function receipt(p,f){
 printHTML("Receipt "+p.receipt_no,`<div style="max-width:420px;margin:20px auto;font-size:16px"><h2 style="text-align:center;margin:0">KRISHNA KUTEER APARTMENT</h2>
 <p style="text-align:center;margin:2px 0 10px">Maintenance Receipt</p><hr><p>Receipt No: <b>${esc(p.receipt_no)}</b><br>Date: ${esc(p.paid_on)}<br>Flat: <b>${esc(f.flat_no)}</b><br>Month: ${esc(p.month.slice(0,7))}<br>
 Amount: <b>${inr(p.amount)}</b><br>Mode: ${esc(p.mode)}<br>Reference: ${esc(p.reference||"-")}</p><br><p>Received by: ____________</p></div>`)}
async function incomeBox(m,canW){
 if(me.role==="resident")return;
 const s=month+"-01",e=nx(+month.slice(0,4),+month.slice(5,7)),T0=dd();
 const{data}=await db.from("income").select("*").gte("received_on",s).lt("received_on",e).order("received_on",{ascending:false});
 const SEC=[["other","Other income","Details (e.g. collected after verification)"],["corpus","Corpus fund","Remarks (optional)"],["corpus_interest","Corpus fund interest","Remarks (optional)"]];
 m.insertAdjacentHTML("beforeend",SEC.map(([k,l,ph])=>{const rows=(data||[]).filter(x=>x.category===k),tot=rows.reduce((a,x)=>a+ +x.amount,0);
  return `<h2>${l}${rows.length?" · "+inr(tot):""}</h2>${canW?`<div class="card"><div class="f">${dateField("d-"+k,"Date received")}<input id="a-${k}" type="number" min="1" placeholder="Amount (₹)"><select id="m-${k}" aria-label="Payment mode"><option>bank</option><option>cash</option><option>upi</option></select><input id="r-${k}" class="w" placeholder="${ph}"><button class="w" data-addinc="${k}">Save ${l.toLowerCase()}</button></div></div>`:""}
  <div class="card">${rows.map(x=>`<div class="it"><div>${inr(x.amount)}<small>${dm(x.received_on)} · ${x.mode}${x.remarks?" · "+esc(x.remarks):""}</small></div>${canW&&["admin","treasurer"].includes(me.role)?`<button class="ghost" data-di="${x.id}">Delete</button>`:""}</div>`).join("")||"Nothing recorded this month."}</div>`}).join(""));
 document.querySelectorAll("[data-addinc]").forEach(b=>b.onclick=async()=>{const k=b.dataset.addinc,a=+$("#a-"+k).value;if(!(a>0)||!gd("d-"+k))return toast("Enter a valid date (dd/mm/yyyy) and an amount above 0");
  const{error}=await db.from("income").insert({received_on:gd("d-"+k),category:k,amount:a,mode:$("#m-"+k).value,remarks:$("#r-"+k).value||null});error?toast(error.message):(month=gd("d-"+k).slice(0,7),toast("Saved in "+month),render())});
 document.querySelectorAll("[data-di]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this entry? This is recorded in the audit log."))return;const{error}=await db.from("income").delete().eq("id",b.dataset.di);error?toast(error.message):render()})}
