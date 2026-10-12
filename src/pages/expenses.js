/* Page: expenses. Loaded only when this page is opened. */
const CATS=["Electricity","Water","Lift","Generator","Diesel","Watchman","Cleaning","Plumbing","Electrical","Repairs","Pest Control","Garden","Festival","Administrative","Other"];
async function exps(m,canW){
 const s=month+"-01",e=nx(+month.slice(0,4),+month.slice(5,7));
 const{data}=await db.from("expenses").select("*").gte("spent_on",s).lt("spent_on",e).order("spent_on",{ascending:false});
 m.innerHTML=`<input type="month" id="mo" value="${month}"><div class="f">${prBtn("pxm","Print "+month+" expenses")}${prBtn("pxy","Print full year")}</div>
 ${canW?`<h2>Add expense</h2><div class="card"><div class="f">${dateField("ed","Expense date")}<select id="ec">${CATS.map(c=>`<option>${c}</option>`).join("")}</select>
 <input id="ea" type="number" min="1" placeholder="Amount (₹)"><input id="et" placeholder="Paid to"><input id="edt" class="w" placeholder="Expense details, e.g. Tap installation"><input id="erm" class="w" placeholder="Remarks (optional)"><select id="em" class="w"><option>cash</option><option>bank</option><option>upi</option></select><button class="w" id="es">Save expense</button></div></div>`:""}
 <h2>${month}</h2><div class="card">${(data||[]).map(x=>`<div class="it"><div>${esc(x.description||x.category)} · ${inr(x.amount)}<small>${dm(x.spent_on)} · ${esc(x.category)}${x.paid_to?" · paid to "+esc(x.paid_to):""} · ${x.mode||"cash"}${x.remarks?"<br>"+esc(x.remarks):""}</small></div>
 ${canW&&["admin","treasurer"].includes(me.role)?`<button class="ghost" data-d="${x.id}">Delete</button>`:""}</div>`).join("")||"No expenses this month."}</div>`;
 $("#mo").onchange=ev=>{month=ev.target.value;render()};
 const xprint=(title,rows,sub)=>{const asc=rows.slice().sort((a,b)=>a.spent_on<b.spent_on?-1:a.spent_on>b.spent_on?1:a.id-b.id),tot=asc.reduce((a,x)=>a+ +x.amount,0),cat={};asc.forEach(x=>cat[x.category]=(cat[x.category]||0)+ +x.amount);
  printHTML(title,sheetHead(title,sub)+ptable(["Sl.No","Date","Category","Details","Paid to","Mode","Amount"],asc.map((x,i)=>[i+1,dm(x.spent_on),esc(x.category),esc(x.description||"")+(x.remarks?"<br><small>"+esc(x.remarks)+"</small>":""),esc(x.paid_to||""),esc(x.mode||"cash"),inr(x.amount)]),["","","","","","Total",inr(tot)],["","","","","","","r"])+
   "<h3>Category summary</h3>"+ptable(["Category","Amount"],Object.entries(cat).map(([k,v])=>[esc(k),inr(v)]),["Total",inr(tot)],["","r"])+SIG)};
 $("#pxm").onclick=()=>xprint("Expenses: "+month,data||[],"");
 $("#pxy").onclick=async()=>{const y=+month.slice(0,4),{data:yd}=await db.from("expenses").select("*").gte("spent_on",y+"-01-01").lt("spent_on",(y+1)+"-01-01");xprint("Expenses: year "+y,yd||[],"")};
 if(canW)$("#es").onclick=async()=>{const a=+$("#ea").value;if(!(a>0)||!gd("ed"))return toast("Enter a valid date (dd/mm/yyyy) and an amount above 0");
  const{error}=await db.from("expenses").insert({spent_on:gd("ed"),category:$("#ec").value,amount:a,paid_to:$("#et").value||null,mode:$("#em").value,description:$("#edt").value||null,remarks:$("#erm").value||null});
  error?toast(error.message):(month=gd("ed").slice(0,7),toast("Expense saved in "+month),render())};
 document.querySelectorAll("[data-d]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this expense? This is recorded in the audit log."))return;
  const{error}=await db.from("expenses").delete().eq("id",b.dataset.d);error?toast(error.message):render()})}
