/* Page: statement. Loaded only when this page is opened. */
function askPw(msg){return new Promise(res=>{const d=document.createElement("div");d.className="modal";d.style.cssText="position:fixed;inset:0;background:rgba(10,20,40,.55);display:grid;place-items:center;z-index:100;padding:16px";
 d.innerHTML=`<div class="card" style="max-width:380px;width:100%;margin:0"><b>Confirm with your password</b><p style="color:var(--grey);margin:8px 0">${esc(msg)}</p><input id="ap" type="password" placeholder="Your login password" autocomplete="current-password"><p class="err" id="ae"></p><div class="f"><button class="ghost" id="ac">Cancel</button><button id="ao">Confirm</button></div></div>`;
 document.body.appendChild(d);const done=v=>{d.remove();res(v)},ap=d.querySelector("#ap"),ao=d.querySelector("#ao");ap.focus();
 ap.onkeydown=e=>{if(e.key==="Enter")ao.click()};d.querySelector("#ac").onclick=()=>done(false);
 ao.onclick=async()=>{ao.disabled=true;const{data:{user}}=await db.auth.getUser();const{error}=await db.auth.signInWithPassword({email:user.email,password:ap.value});if(error){d.querySelector("#ae").textContent="Wrong password. Try again.";ao.disabled=false;return}done(true)}})}
async function exportAll(kind){toast("Preparing your data…");
 const names=["flats","payments","expenses","income","maintenance_rates","closed_months","notices","settings"],D={};
 for(const t of names){const{data,error}=await db.from(t).select("*");D[t]=error?[]:(data||[])}
 const fn={};D.flats.forEach(f=>fn[f.id]=f.flat_no);D.payments=D.payments.map(p=>({flat_no:fn[p.flat_id]??"",...p}));
 const day=ld(),save=(n,type,c)=>saveFile(n,new Blob([c],{type}));
 if(kind==="json")return save("krishna-kuteer-backup-"+day+".json","application/json",JSON.stringify({exported_on:day,tables:D},null,2));
 const xe=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])),
 cell=(c,v)=>(typeof v==="number"||(/amount|cash|bank|balance/.test(c)&&v!==null&&v!==""&&!isNaN(v)))?`<Cell><Data ss:Type="Number">${+v}</Data></Cell>`:`<Cell><Data ss:Type="String">${xe(typeof v==="object"&&v?JSON.stringify(v):v)}</Data></Cell>`,
 sheet=(n,rows)=>{const k=[...new Set(rows.flatMap(r=>Object.keys(r)))];return `<Worksheet ss:Name="${n}"><Table><Row>${k.map(c=>`<Cell><Data ss:Type="String">${xe(c)}</Data></Cell>`).join("")}</Row>${rows.map(r=>`<Row>${k.map(c=>cell(c,r[c])).join("")}</Row>`).join("")}</Table></Worksheet>`};
 save("krishna-kuteer-all-data-"+day+".xls","application/vnd.ms-excel",`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${names.map(n=>sheet(n,D[n])).join("")}</Workbook>`)}
let sv="m",yr=new Date().getFullYear();
async function stmt(m){
 if(me.role==="resident")return stmtView(m);
 const F=await loadFin(),canW=WRITE.includes(me.role),s=month+"-01",e=nx(+month.slice(0,4),+month.slice(5,7));
 const L=(k,x,neg)=>[k,neg?-x.cash:x.cash,neg?-x.bank:x.bank,neg?-T(x):T(x)],P1=per(F,s,e);
 const row=(a,b)=>`<div class="it" style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:6px;font-size:.85rem${b?";font-weight:700":""}"><div>${esc(a[0])}</div>${a.slice(1).map(v=>`<div style="text-align:right">${v===""?"":inr(v)}</div>`).join("")}</div>`;
 const head=`<div class="it" style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:6px;font-size:.8rem;color:var(--grey)"><div></div><div style="text-align:right">Cash</div><div style="text-align:right">Bank/UPI</div><div style="text-align:right">Total</div></div>`;
 const openBox=sv==="m"&&["admin","treasurer"].includes(me.role)?`<div class="card noprint"><b>Opening balance</b> (money in hand when you start using this app)<div class="f"><label class="fl">Cash<input id="oc" type="number" min="0" value="${+F.st.opening_cash}"></label><label class="fl">Bank / UPI<input id="ob" type="number" min="0" value="${+F.st.opening_bank}"></label><button class="w" id="os">Save opening balance</button></div></div>`:"";
 let lines,title,ctl,main,extra="",R=null;
 if(sv==="m"){const cl=F.cl.find(c=>c.month===s);R=register(F,s,e,P1);title="Monthly financial statement: "+month;ctl=`<input type="month" id="mo" value="${month}">`;
  lines=R.sum.map(r=>[r[0],"","",r[1]]).concat([["Closing balance: cash","","",P1.c.cash],["Closing balance: bank/UPI","","",P1.c.bank]]);
  main=`<style>${REGCSS}</style><div style="margin-top:10px">${R.html}</div><div class="card"><div class="it"><div>Closing in cash</div><div>${inr(P1.c.cash)}</div></div><div class="it"><div>Closing in bank/UPI</div><div>${inr(P1.c.bank)}</div></div></div>`;
  extra=cl?`<div class="card"><b>Month closed</b> on ${esc(String(cl.closed_at||"").slice(0,10))}. Payments, expenses and income dated in ${month} are locked.${me.role==="admin"?`<br><br><button class="ghost" id="ro">Reopen month (admin)</button>`:""}</div>`
   :canW?`<div class="card">Review the figures, then lock the month with your password. A locked month cannot be changed.<br><br><button id="cl">Close ${month}</button></div>`:"";
 }else{const Y=per(F,yr+"-01-01",(yr+1)+"-01-01");title="Yearly financial statement: "+yr;ctl=`<input type="number" id="yr" value="${yr}" min="2000" max="2100">`;
  lines=[L("Opening balance (1 Jan)",Y.o),L("Maintenance receipts",Y.r),L("Other income",Y.i),...Object.entries(Y.cat).map(([k,v])=>["Expense: "+k,"","",-v]),L("Total expenses",Y.e,1),L("Closing balance (31 Dec)",Y.c)];
  const top=lines.slice(),mr=[];for(let i=0;i<12;i++){const P=per(F,nx(yr,i),nx(yr,i+1)),c=F.cl.some(x=>x.month===nx(yr,i));mr.push([MN[i]+(c?" (closed)":""),"",T(P.r)+T(P.i)-T(P.e),T(P.c)])}
  main=`<div class="card">${head}${top.map(l=>row(l,/balance|Total/.test(l[0]))).join("")}</div><h2>Month by month</h2><div class="card"><div class="it" style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:6px;font-size:.8rem;color:var(--grey)"><div></div><div></div><div style="text-align:right">Net</div><div style="text-align:right">Closing</div></div>${mr.map(r=>row(r)).join("")}</div>`;
  lines=lines.concat([["Month by month (net, closing)","","",""]],mr)}
 m.innerHTML=`<div class="f"><button class="${sv==="m"?"":"ghost"}" id="sm">Monthly</button><button class="${sv==="y"?"":"ghost"}" id="sy">Yearly</button></div><div style="margin-top:8px">${ctl}</div>${main}${extra}${openBox}
 <div class="f"><button id="pp">Print / Save as PDF</button><button class="ghost" id="cv">Download CSV</button></div><div class="card"><b>Download all data</b><p style="color:var(--grey);margin:4px 0 0;font-size:.88rem">Every payment, expense, income entry, flat, monthly amount, closed month and notice, from the beginning.</p><div class="f"><button id="xa">Excel (all sheets)</button><button class="ghost" id="xj">Backup (JSON)</button></div></div>`;
 $("#sm").onclick=()=>{sv="m";render()};if($("#os"))$("#os").onclick=async()=>{const{error}=await db.from("settings").update({opening_cash:+$("#oc").value||0,opening_bank:+$("#ob").value||0}).eq("id",1);error?toast(error.message):(toast("Opening balance saved"),render())};$("#sy").onclick=()=>{sv="y";render()};
 if($("#mo"))$("#mo").onchange=ev=>{month=ev.target.value;render()};if($("#yr"))$("#yr").onchange=ev=>{yr=+ev.target.value||yr;render()};
 if($("#cl"))$("#cl").onclick=async()=>{if(!await askPw("Locking "+month+": payments, expenses and income dated in this month can no longer be added, changed or deleted. Enter your login password to lock."))return;
  const{error}=await db.from("closed_months").insert({month:s,closing_cash:P1.c.cash,closing_bank:P1.c.bank});error?toast(error.message):(toast("Month closed"),render())};
 if($("#ro"))$("#ro").onclick=async()=>{if(!await askPw("Unlocking "+month+" lets its figures change again (recorded in the audit log). It locks itself again after 15 minutes. Enter your login password to unlock."))return;const{error}=await db.from("closed_months").delete().eq("month",s);error?toast(error.message):(toast("Month unlocked. It will lock again automatically in 15 minutes."),armRelock(s),render())};
 $("#xa").onclick=()=>exportAll("xls");$("#xj").onclick=()=>exportAll("json");
 $("#pp").onclick=()=>{
  const sig2=`<p style="margin-top:36px">Treasurer: ____________ &nbsp; Secretary: ____________</p>`;
  if(R)return printHTML(title,R.html+`<p>Closing in cash: ${inr(P1.c.cash)} &nbsp; Closing in bank/UPI: ${inr(P1.c.bank)}</p>`+sig2,true);
  printHTML(title,sheetHead(title)+`<table><thead><tr><th></th><th class="r">Cash</th><th class="r">Bank/UPI</th><th class="r">Total</th></tr></thead><tbody>${lines.map(l=>`<tr><td>${esc(l[0])}</td>${l.slice(1).map(v=>`<td class="r">${v===""?"":inr(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`+sig2)};
 $("#cv").onclick=()=>{const c="Item,Cash,Bank/UPI,Total\n"+lines.map(l=>`"${l[0]}",${l.slice(1).map(v=>v===""?"":Math.round(v)).join(",")}`).join("\n");
  saveFile((sv==="m"?"statement-"+month:"statement-"+yr)+".csv",new Blob([c],{type:"text/csv"}))}}
/* residents: the monthly statement, view only (it used to be at the bottom of Home) */
async function stmtView(m){
 const F=await loadFin(),s=month+"-01",e=nx(+month.slice(0,4),+month.slice(5,7));
 if(!F.st||!F.fl.length){m.innerHTML=`<input type="month" id="mo" value="${month}"><div class="card" style="margin-top:10px">Monthly statement is not available yet.</div>`}
 else{const R=register(F,s,e,per(F,s,e));
  m.innerHTML=`<input type="month" id="mo" value="${month}"><h2>Monthly statement</h2><p style="margin:0 0 8px;color:var(--grey);font-size:.85rem">View only</p><style>${REGCSS}</style>${R.html}<div class="f">${prBtn("pst","Print monthly statement")}</div>`;
  $("#pst").onclick=()=>printHTML("Monthly statement "+month,sheetHead("Monthly statement: "+month)+R.html+SIG,true)}
 $("#mo").onchange=ev=>{if(ev.target.value){month=ev.target.value;render()}}}
