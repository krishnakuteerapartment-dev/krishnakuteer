/* Page: home. Loaded only when this page is opened. */
async function dash(m,staff){
 let bal="";
 if(staff){const{data:b}=await db.from("balance").select("*").single();
  bal=`<div class="card hero">Balance in hand<div class="big">${inr(b?.closing)}</div><small>Opening ${inr(b?.opening_balance)} + received ${inr(b?.received)} − spent ${inr(b?.spent)}</small><br><small>Cash ${inr(b?.cash)} · Bank/UPI ${inr(b?.bank)}</small></div>`}
 const F=await loadFin(),s=month+"-01",e=nx(+month.slice(0,4),+month.slice(5,7));
 let body;
 if(!F.st||!F.fl.length)body=`<div class="card" style="margin-top:10px">Monthly statement is not available yet.</div>`;
 else{const P=per(F,s,e),R=register(F,s,e,P);
  body=`<h2>Monthly statement</h2><p style="margin:0 0 8px;color:var(--grey);font-size:.85rem">View only</p><style>${REGCSS}</style>${R.html}<div class="f">${prBtn("pdash","Print monthly statement")}</div>`;window.__R=R}
 const who=me.role==="resident"?"Flat "+me.id:cap(me.role||"resident"),home=await homeHtml(F,staff,who);
 m.innerHTML=`${home}${bal}<input type="month" id="mo" value="${month}">${body}`;
 m.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{tab=b.dataset.go;render()});
 m.querySelectorAll("[data-st]").forEach(b=>b.onclick=async()=>{const o=ST3.map(x=>x[0]),n=o[(o.indexOf(b.dataset.s)+1)%3],{error}=await db.from("status").upsert({item:b.dataset.st,state:n,updated_on:ld()},{onConflict:"item"});error?toast(error.message):render()});
 $("#mo").onchange=e=>{month=e.target.value;render()};
 if($("#pdash"))$("#pdash").onclick=()=>printHTML("Monthly statement "+month,sheetHead("Monthly statement: "+month)+window.__R.html+SIG,true)}
const ST3=[["active","Active","#15803d"],["attention","Attention","#b45309"],["maintenance","Maintenance","#c0362c"]],AP=[["Water","💧"],["Lift","🛗"],["Generator","🔋"],["Electricity","⚡"],["Security","🛡"],["CCTV","📹"],["Solar Fencing","☀️"],["Cleaning","🧹"]];
async function homeHtml(F,staff,who){
 const rt=(F.rt||[]).find(r=>String(r.month).slice(0,7)===month),rate=f=>rt?+rt.amount:+f.monthly_amount,
  pm=f=>F.p.filter(p=>String(p.flat_id)===String(f.id)&&String(p.month).slice(0,7)===month).reduce((a,p)=>a+ +p.amount,0);let cards;
 if(staff){const due=F.fl.reduce((a,f)=>a+rate(f),0),paid=F.fl.reduce((a,f)=>a+pm(f),0),sp=F.x.filter(x=>String(x.spent_on).slice(0,7)===month).reduce((a,x)=>a+ +x.amount,0);
  cards=[[F.fl.length,"Total flats"],[inr(paid),"Collected in "+month],[inr(Math.max(0,due-paid)),"Pending in "+month],[inr(sp),"Expenses in "+month]]}
 else{const f=F.fl.find(x=>String(x.flat_no)===String(me.id))||F.fl[0];
  if(f){const r=rate(f),p=pm(f);cards=[[inr(r),"Maintenance for "+month],[inr(p),"Paid this month"],[inr(Math.max(0,r-p)),"Pending amount"],[inr(F.p.filter(x=>String(x.flat_id)===String(f.id)).reduce((a,x)=>a+ +x.amount,0)),"Total contributions"]]}}
 const QA=[["maint","💳","Payments"],["comp","🛠","Complaints"],["doc","📄","Documents"],["not","📢","Notices"],["poll","🗳","Voting"],["meet","📅","Meeting"],["assets","🛗","Assets"],["sos","📞","Contacts"]];
 if(staff)QA.splice(2,1,["exp","🧾","Expenses"]),QA.splice(3,1,["st","📊","Statement"]);if(isIn(R_COM))QA.splice(6,1,["rem","🔔","Reminders"]);
 const[n1,n2,n3,n4,n5,n6]=await Promise.all(["notices","status","maintenance_log","complaints","meetings","visitors"].map(t=>db.from(t).select("*"))),
  nts=(n1.data||[]).sort((a,b)=>b.id-a.id),sm=Object.fromEntries((n2.data||[]).map(r=>[r.item,r.state])),canS=WRITE.includes(me.role),today=ld(),vday=(n6.data||[]).filter(r=>String(r.visit_on).slice(0,10)===today).reduce((a,r)=>a+(+r.count||0),0),vmon=(n6.data||[]).filter(r=>String(r.visit_on).slice(0,7)===today.slice(0,7)).reduce((a,r)=>a+(+r.count||0),0),
  ev=(n5.data||[]).filter(e=>String(e.on_date)>=today).sort((a,b)=>String(a.on_date).localeCompare(b.on_date)||String(a.at_time).localeCompare(b.at_time)).slice(0,3),
  remc=(await gateHome())+(await staffHome())+(await remHome()),act=[].concat((n3.data||[]).map(r=>({d:String(r.logged_on).slice(0,10),i:"🛠",t:r.details+(r.status==="completed"?"":" ("+r.status+")")})),nts.map(n=>({d:String(n.created_on).slice(0,10),i:"📢",t:n.title})),(n4.data||[]).filter(c=>c.status==="resolved").map(c=>({d:String(c.updated_at).slice(0,10),i:"✅",t:"Complaint resolved: "+c.title}))).sort((a,b)=>b.d.localeCompare(a.d)).slice(0,5);
 return `${window.KKPush?KKPush.card():""}<div class="wel"><h1>Namaste 🙏, ${esc(who)}</h1><small>${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</small></div>
 ${remc}${cards?`<div class="grid" style="margin-bottom:14px">${cards.map(([v,l])=>`<div class="card"><b>${v}</b><span>${esc(l)}</span></div>`).join("")}</div>`:""}
 <h2>Visitors</h2><div class="card" data-go="vis" role="button" tabindex="0" title="Open Visitors" style="cursor:pointer;padding:12px;margin-bottom:14px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${[[vday,"Today"],[vmon,"This month"]].map(([v,l])=>`<div style="background:var(--sky);border-radius:12px;padding:12px;text-align:center"><div style="font-size:1.7rem;font-weight:800;color:var(--navy);line-height:1.2">${v}</div><small style="color:var(--grey)">${l}</small></div>`).join("")}</div></div>
 <div class="qa">${QA.map(([k,e,l])=>`<button data-go="${k}" type="button"><span>${e}</span>${l}</button>`).join("")}</div>
 <h2>Apartment status</h2><div class="stg">${AP.map(([n,e],k)=>{const st=sm[n]||"active",c=ST3.find(x=>x[0]===st);return `<button type="button" class="t-${n.toLowerCase().replace(/\W/g,"")} s-${st} ${canS?"ed":""}" style="--i:${k};--c:${c[2]}" ${canS?`data-st="${n}" data-s="${st}" title="Tap to change"`:"disabled"}><span class="ic">${e}</span>${n}<i style="background:${c[2]}">${c[1]}</i></button>`}).join("")}</div>
 ${ev.length?`<h2>Upcoming events</h2>${ev.map(e=>{const t=mdy(e.on_date);return `<div class="card ev"><div class="d">${t.d}<small>${t.m}</small></div><div><b>${esc(e.title)}</b><small style="display:block;color:var(--grey)">${esc([e.at_time,e.place].filter(Boolean).join(" · "))} ${e.kind==="event"?"· Event":""}</small></div></div>`}).join("")}`:""}
 ${nts.length?`<h2>Latest notices</h2>${nts.slice(0,2).map(n=>`<div class="card nt">${esc(n.title)}<small>${esc(n.created_on)}</small></div>`).join("")}`:""}
 ${act.length?`<h2>Recent activity</h2><div class="card"><div class="tl">${act.map(a=>`<div>${a.i} ${esc(a.t)}<small>${dm(a.d)}</small></div>`).join("")}</div></div>`:""}`}
/* the warning card on the Home page (committee only) */
async function remHome() {
  if (!isIn(R_COM)) return "";
  try {
    const [r, a] = await Promise.all([db.from("reminders").select("*"), db.from("assets").select("*")]);
    const P = (r.data || []).filter(x => x.status !== "done"), late = P.filter(x => dLeft(x.due_on) < 0), wk = P.filter(x => { const n = dLeft(x.due_on); return n >= 0 && n <= 7; });
    const wr = (a.data || []).filter(x => x.warranty_until && dLeft(x.warranty_until) >= 0 && dLeft(x.warranty_until) <= 30);
    if (!late.length && !wk.length && !wr.length) return "";
    const top = late.concat(wk).slice(0, 3).map(x => esc(x.title) + " (" + dmx(x.due_on) + ")").concat(wr.slice(0, 1).map(x => "Warranty: " + esc(x.name)));
    return `<div class="card" data-go="rem" role="button" tabindex="0" style="cursor:pointer;border-left:4px solid ${late.length ? "#b42318" : "#b45309"}"><b>🔔 Service reminders</b> ${late.length ? `<span class="tag red">${late.length} overdue</span>` : ""}${wk.length ? `<span class="tag amb">${wk.length} this week</span>` : ""}${wr.length ? `<span class="tag amb">${wr.length} warranty ending</span>` : ""}<small style="display:block;color:var(--grey)">${top.join(" · ")}</small></div>`;
  } catch (e) { return ""; }
}
/* Home page: a resident sees visitors waiting for their answer */
async function gateHome() {
  if (!me || me.role !== "resident") return "";
  try { const { data } = await db.from("visitors").select("*"), T = ld();
    const w = (data || []).filter(r => String(r.flat_no) === String(me.id) && ["waiting", "no_answer"].includes(r.status) && String(r.visit_on).slice(0, 10) === T);
    return w.length ? `<h2>At the gate now</h2>` + w.map(r => waitCard(r, true)).join("") : ""; } catch (e) { return ""; }
}
/* Home page card: leave requests waiting for the Association */
async function staffHome() {
  if (!isIn(R_S)) return "";
  try { const [l, s] = await Promise.all([db.from("leaves").select("*"), db.from("staff").select("*")]), W = (l.data || []).filter(x => x.status === "requested");
    if (!W.length) return ""; const nm = id => ((s.data || []).find(x => String(x.id) === String(id)) || {}).name || "Watchman";
    return `<div class="card" data-go="staff" role="button" tabindex="0" style="cursor:pointer;border-left:4px solid #b45309"><b>🛡 Leave request${W.length > 1 ? "s" : ""}</b> <span class="tag amb">${W.length} waiting</span><small style="display:block;color:var(--grey)">${W.slice(0, 3).map(x => esc(nm(x.staff_id)) + ": " + dmx(x.from_date) + (+x.days > 1 ? " – " + dmx(x.to_date) : "")).join(" · ")}</small></div>`;
  } catch (e) { return ""; }
}
