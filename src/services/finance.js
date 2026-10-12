/* Money figures for the monthly statement (Home, Statement, month re-lock). Loaded when needed. */
async function loadFin(){const r=(await Promise.all([db.from("settings").select("*").single(),db.from("payments").select("flat_id,amount,mode,paid_on,month,remarks"),
 db.from("expenses").select("category,description,paid_to,remarks,amount,mode,spent_on"),db.from("closed_months").select("*"),db.rpc("all_flats"),db.from("income").select("*"),db.from("maintenance_rates").select("*")])).map(x=>x.data);
 if(!r[4])r[4]=(await db.from("flats").select("id,flat_no,monthly_amount").order("flat_no")).data;
 return{st:r[0],p:r[1]||[],x:r[2]||[],cl:r[3]||[],fl:r[4]||[],i:r[5]||[],rt:r[6]||[]}}
function per(F,from,to){const z=()=>({cash:0,bank:0}),o={cash:+F.st.opening_cash,bank:+F.st.opening_bank},r=z(),i=z(),e=z(),cat={};
 F.p.forEach(p=>{const k=bk(p);if(p.paid_on<from)o[k]+=+p.amount;else if(p.paid_on<to)r[k]+=+p.amount});
 F.i.filter(q=>q.category==="other").forEach(p=>{const k=bk(p);if(p.received_on<from)o[k]+=+p.amount;else if(p.received_on<to)i[k]+=+p.amount});
 F.x.forEach(p=>{const k=bk(p);if(p.spent_on<from)o[k]-=+p.amount;else if(p.spent_on<to){e[k]+=+p.amount;cat[p.category]=(cat[p.category]||0)+ +p.amount}});
 return{o,r,i,e,cat,c:{cash:o.cash+r.cash+i.cash-e.cash,bank:o.bank+r.bank+i.bank-e.bank}}}
function register(F,s,e,P){
 const mo=+s.slice(5,7),rt=(F.rt||[]).find(r=>r.month===s),amt=f=>rt?+rt.amount:+f.monthly_amount,same=F.fl.length&&F.fl.every(f=>amt(f)===amt(F.fl[0])),pm=F.p.filter(p=>p.month===s);
 const rows=F.fl.map((f,k)=>{const ps=pm.filter(p=>p.flat_id===f.id),paid=ps.reduce((a,p)=>a+ +p.amount,0),dt=ps.map(p=>p.paid_on).sort().pop();
  return[k+1,f.flat_no,amt(f),paid,Math.max(amt(f)-paid,0),dt?dm(dt):"",ps.map(p=>p.remarks).filter(Boolean).join("; ")]});
 const ex=F.x.filter(x=>x.spent_on>=s&&x.spent_on<e).sort((a,b)=>a.spent_on.localeCompare(b.spent_on));
 const iv=c=>F.i.filter(r=>r.received_on>=s&&r.received_on<e&&r.category===c).reduce((a,r)=>a+ +r.amount,0),MC=T(P.r),OI=T(P.i),AA=MC+OI,E=T(P.e);
 const sum=[["Opening Balance (₹) (OB)",T(P.o),"Previous month balance"],["Corpus fund",iv("corpus"),"Held separately; not in closing balance"],["Corpus fund interest",iv("corpus_interest"),"Held separately; not in closing balance"],
  ["Maintenance Collected (₹) (MC)",MC,"Current month collected amount"],["Other Income (₹) (OI)",OI,"Other income received this month"],["Total Available Amount (₹) (AA)",AA,"AA = MC + OI","y"],
  ["Total Expenses (₹) (E)",E,"Current month expenses amount"],["Closing Balance (₹) (CB)",T(P.c),"CB = OB + AA − E","cb"]];
 const sm=(k)=>rows.reduce((a,r)=>a+r[k],0);
 const html=`<div class="regwrap"><table class="reg"><tr><th colspan="7" style="font-size:.95rem">KRISHNA KUTEER APARTMENT MONTHLY MAINTENANCE REGISTER</th></tr>
 <tr><td colspan="2" class="l">Month/Year</td><td colspan="2" class="bd">${MN[mo-1]}-${s.slice(2,4)}</td><td colspan="2" class="l">Maintenance per Flat</td><td class="bd">${same?nf(amt(F.fl[0]))+"/Flat":"Varies"}</td></tr>
 <tr><td class="tt b" colspan="7">MAINTENANCE COLLECTION DETAILS</td></tr>
 <tr class="hb bd"><td>S.No</td><td>Flat No.</td><td>Maintenance (₹)</td><td>Amount Paid (₹)</td><td>Pending (₹)</td><td>Payment Date</td><td>Remarks</td></tr>
 ${rows.map(r=>`<tr>${r.map((v,k)=>`<td${k===6?' class="l"':""}>${esc(v)}</td>`).join("")}</tr>`).join("")}
 <tr class="tot"><td colspan="2">TOTAL</td><td>${nf(sm(2))}</td><td>${nf(sm(3))}</td><td>${nf(sm(4))}</td><td colspan="2"></td></tr></table>
 <table class="reg"><tr><td class="tt g" colspan="6">MONTHLY EXPENSE DETAILS</td></tr>
 <tr class="hg bd"><td>Date</td><td>Expense Details</td><td>Amount (₹)</td><td>Paid To</td><td>Online Payment</td><td>Remarks</td></tr>
 ${ex.map(x=>`<tr><td>${dm(x.spent_on)}</td><td>${esc(x.description||x.category)}</td><td>${nf(x.amount)}</td><td>${esc(x.paid_to||"")}</td><td>${(x.mode||"cash")==="cash"?"no":"yes"}</td><td class="l">${esc(x.remarks||"")}</td></tr>`).join("")||'<tr><td colspan="6">No expenses this month</td></tr>'}
 <tr class="tot"><td colspan="2">TOTAL EXPENSES</td><td>${nf(E)}</td><td colspan="3"></td></tr></table>
 <table class="reg"><tr><td class="tt o" colspan="3">MONTHLY FINANCIAL SUMMARY</td></tr>
 ${sum.map(r=>`<tr${r[3]?` class="${r[3]}"`:""}><td class="l bd">${r[0]}</td><td class="bd">${nf(r[1])}</td><td class="l">${r[2]}</td></tr>`).join("")}</table></div>`;
 return{html,sum}}
