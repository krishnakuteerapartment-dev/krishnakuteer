/* Page: home. Loaded only when this page is opened. */
async function dash(m,staff){
 let bal="";
 if(staff){const{data:b}=await db.from("balance").select("*").single();
  const g=v=>+v<0?"−"+inr(-v):inr(v);bal=`<div class="card hero">Balance in hand today<div class="big">${g(b?.closing)}</div><small>Since the accounts began: opening ${g(b?.opening_balance)} + received ${inr(b?.received)} − spent ${inr(b?.spent)}</small><br><small>Cash ${g(b?.cash)} · Bank/UPI ${g(b?.bank)}</small></div>`}
 /* the monthly statement (register) is on the Statement page; Home shows the summary and charts */
 const F=await loadFin(),who=me.role==="resident"?"Flat "+me.id:cap(me.role||"resident"),home=await homeHtml(F,staff,who,bal);
 m.innerHTML=home;
 m.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{tab=b.dataset.go;render()});bindCharts(m);
 m.querySelectorAll("[data-st]").forEach(b=>b.onclick=async()=>{const o=ST3.map(x=>x[0]),n=o[(o.indexOf(b.dataset.s)+1)%3],{error}=await db.from("status").upsert({item:b.dataset.st,state:n,updated_on:ld()},{onConflict:"item"});error?toast(error.message):render()});
 if($("#mo"))$("#mo").onchange=e=>{if(e.target.value){month=e.target.value;render()}}}
const ST3=[["active","Active","#15803d"],["attention","Attention","#b45309"],["maintenance","Maintenance","#c0362c"]],AP=[["Water","💧"],["Lift","🛗"],["Generator","🔋"],["Electricity","⚡"],["Security","🛡"],["CCTV","📹"],["Solar Fencing","☀️"],["Cleaning","🧹"]];
async function homeHtml(F,staff,who,bal=""){
 const rt=(F.rt||[]).find(r=>String(r.month).slice(0,7)===month),rate=f=>rt?+rt.amount:+f.monthly_amount,
  pm=f=>F.p.filter(p=>String(p.flat_id)===String(f.id)&&String(p.month).slice(0,7)===month).reduce((a,p)=>a+ +p.amount,0);let cards;
 if(staff){const due=F.fl.reduce((a,f)=>a+rate(f),0),paid=F.fl.reduce((a,f)=>a+pm(f),0),sp=F.x.filter(x=>String(x.spent_on).slice(0,7)===month).reduce((a,x)=>a+ +x.amount,0);
  cards=[[F.fl.length,"Total flats","users"],[inr(paid),"Collected in "+month,"wallet"],[inr(Math.max(0,due-paid)),"Pending in "+month,"clock"],[inr(sp),"Expenses in "+month,"bars"]]}
 else{const f=F.fl.find(x=>String(x.flat_no)===String(me.id))||F.fl[0];
  if(f){const r=rate(f),p=pm(f);cards=[[inr(r),"Maintenance for "+month,"home"],[inr(p),"Paid this month","check"],[inr(Math.max(0,r-p)),"Pending amount","clock"],[inr(F.p.filter(x=>String(x.flat_id)===String(f.id)).reduce((a,x)=>a+ +x.amount,0)),"Total contributions","coins"]]}}
 const QA=[["maint","💳","Payments"],["comp","🛠","Complaints"],["doc","📄","Documents"],["not","📢","Notices"],["poll","🗳","Voting"],["meet","📅","Meeting"],["assets","🛗","Assets"],["sos","📞","Contacts"]];
 if(staff)QA.splice(2,1,["exp","🧾","Expenses"]),QA.splice(3,1,["st","📊","Statement"]);if(isIn(R_COM))QA.splice(6,1,["rem","🔔","Reminders"]);
 const[n1,n2,n3,n4,n5,n6,n7,n8]=await Promise.all(["notices","status","maintenance_log","complaints","meetings","visitors","polls","gallery"].map(t=>db.from(t).select("*"))),
  nts=(n1.data||[]).sort((a,b)=>b.id-a.id),sm=Object.fromEntries((n2.data||[]).map(r=>[r.item,r.state])),canS=WRITE.includes(me.role),today=ld(),vday=(n6.data||[]).filter(r=>String(r.visit_on).slice(0,10)===today).reduce((a,r)=>a+(+r.count||0),0),vmon=(n6.data||[]).filter(r=>String(r.visit_on).slice(0,7)===today.slice(0,7)).reduce((a,r)=>a+(+r.count||0),0),
  ev=(n5.data||[]).filter(e=>String(e.on_date)>=today).sort((a,b)=>String(a.on_date).localeCompare(b.on_date)||String(a.at_time).localeCompare(b.at_time)).slice(0,3),
  remc=(await gateHome())+(await staffHome())+(await remHome()),CH=await homeCharts(F,staff),up=await comingUp(F,ev,cards),act=[].concat((n3.data||[]).map(r=>({d:r.logged_on,i:"🛠",c:"b",t:r.details+(r.status==="completed"?"":" ("+r.status+")"),s:"Maintenance work",go:"work"})),
   /* notices have their own list just above, so they are not repeated here */
   (n4.data||[]).filter(c=>c.status==="resolved").map(c=>({d:c.updated_at,i:"✅",c:"g",t:c.title,s:"Complaint resolved",go:"comp"})),
   (n5.data||[]).map(e=>({d:e.created_at,i:"📅",c:"v",t:e.title,s:e.kind==="event"?"Event added":"Meeting added",go:"meet"})),
   (n7.data||[]).map(q=>({d:q.created_at,i:"🗳",c:"v",t:q.question,s:"New poll",go:"poll"})),
   (n8.data||[]).map(g=>({d:g.created_at,i:g.kind==="pdf"?"📄":"🖼",c:"b",t:g.title||g.name||"",s:g.kind==="pdf"?"New document":"New photo",go:"doc"})))
   .filter(a=>a.d&&a.t).map(a=>Object.assign(a,{d:String(a.d).slice(0,10)})).sort((a,b)=>b.d.localeCompare(a.d)).slice(0,6);
 return `${window.KKPush?KKPush.card():""}<div class="wel"><h1>Namaste 🙏, ${esc(who)}</h1><small>${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</small></div>
 ${remc}${cards?`<div class="grid" style="margin-bottom:14px">${cards.map(([v,l,k])=>`<div class="card kc"><span class="ki ki-${k}">${KI[k]}</span><div><b>${v}</b><span>${esc(l)}</span></div></div>`).join("")}</div>`:""}
 <div class="ovh"><h2>Overview</h2><input type="month" id="mo" value="${month}" aria-label="Month shown in Overview and Insights"></div>${bal}
 ${CH.money?`<div class="ins two">${CH.money}${CH.coll}</div>`:""}
 <h2>Visitors</h2><div class="card" data-go="vis" role="button" tabindex="0" title="Open Visitors" style="cursor:pointer;padding:12px;margin-bottom:14px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${[[vday,"Today","user"],[vmon,"This month","users"]].map(([v,l,k])=>`<div class="vk"><span class="ki ki-v">${KI[k]}</span><div><div class="vnum">${v}</div><small>${l}</small></div></div>`).join("")}</div>${visitSpark(n6.data||[])}</div>
 <div class="qa">${QA.map(([k,e,l])=>`<button data-go="${k}" type="button"><span>${e}</span>${l}</button>`).join("")}</div>
 ${CH.trend||CH.cats||CH.comp?`<h2>Insights</h2><div class="ins">${CH.trend}${CH.cats}${CH.comp}</div>`:""}
 <h2>Apartment status</h2><div class="stg">${AP.map(([n,e],k)=>{const st=sm[n]||"active",c=ST3.find(x=>x[0]===st);return `<button type="button" class="t-${n.toLowerCase().replace(/\W/g,"")} s-${st} ${canS?"ed":""}" style="--i:${k};--c:${c[2]}" ${canS?`data-st="${n}" data-s="${st}" title="Tap to change"`:"disabled"}><span class="ic">${e}</span>${n}<i style="background:${c[2]}">${c[1]}</i></button>`}).join("")}</div>
 ${up.length?`<h2>Coming up</h2>${up.map(u=>{const t=mdy(u.d);return `<div class="card ev"${u.go?` data-go="${u.go}" role="button" tabindex="0" style="cursor:pointer"`:""}><div class="d${u.c?" "+u.c:""}">${t.d}<small>${t.m}</small></div><div><b>${esc(u.t)}</b><small style="display:block;color:var(--grey)">${esc(u.s||"")}</small></div></div>`}).join("")}`:""}
 ${nts.length?`<h2>Latest notices</h2><div class="card feed">${nts.slice(0,3).map(n=>{const d=String(n.created_on).slice(0,10),nw=dLeft(d)>=-3;return `<div class="fi" data-go="not" role="button" tabindex="0"><span class="fe a">📢</span><div class="ft"><b>${esc(n.title)}</b><small>${relDay(d)}</small></div>${nw?'<span class="tag amb">New</span>':""}</div>`}).join("")}
  <button class="ghost more" type="button" data-go="not">See all notices${nts.length>3?" ("+nts.length+")":""}</button></div>`:""}
 ${act.length?`<h2>Recent activity</h2><div class="card feed">${act.map(a=>`<div class="fi" data-go="${a.go}" role="button" tabindex="0"><span class="fe ${a.c}">${a.i}</span><div class="ft"><b>${esc(a.t)}</b><small>${esc(a.s)} · ${relDay(a.d)}</small></div></div>`).join("")}</div>`:""}`}
/* "Today", "Yesterday", "3 days ago", or the date */
const relDay = d => { const n = dLeft(d); return n === 0 ? "Today" : n === -1 ? "Yesterday" : n < 0 && n > -7 ? -n + " days ago" : dm(d); };
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
/* ---------- Home charts: small pictures drawn in the page itself (no chart library, so Home stays fast) ----------
   Colours: received = blue, spent = orange (checked for colour-blind readers); paid / partial / pending and complaint
   states use the status colours, always with a label and a count next to them. */
let HCN = 6; /* months in the "Received vs spent" chart (6 or 12) */
const HC = { rec: "#2563eb", sp: "#eb6834", ok: "#15803d", part: "#d97706", pend: "#c0362c", prog: "#2563eb" };
const MONF = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monLabel = mo => MONF[+mo.slice(5, 7) - 1] + " " + mo.slice(0, 4);
/* a ring split into parts; centre shows two short lines */
function donut(parts, c1, c2, label) {
  const R = 40, W = 13, C = 2 * Math.PI * R, live = parts.filter(p => p.v > 0), tot = live.reduce((a, p) => a + p.v, 0), gap = live.length > 1 ? 2 : 0;
  let off = 0;
  const segs = tot ? live.map(p => { const len = p.v / tot * C, s = `<circle r="${R}" cx="50" cy="50" fill="none" stroke="${p.c}" stroke-width="${W}" stroke-dasharray="${Math.max(len - gap, .01).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 50 50)"><title>${esc(p.l)}</title></circle>`; off += len; return s; }).join("") : "";
  return `<svg viewBox="0 0 100 100" class="dn" role="img" aria-label="${esc(label)}"><circle r="${R}" cx="50" cy="50" fill="none" stroke="var(--sky)" stroke-width="${W}"/>${segs}
   <text x="50" y="49" text-anchor="middle" class="c1">${esc(c1)}</text><text x="50" y="63" text-anchor="middle" class="c2">${esc(c2)}</text></svg>`;
}
const legend = rows => `<div class="lg">${rows.map(([c, l, v]) => `<div><span><i style="background:${c}"></i>${esc(l)}</span><b>${v}</b></div>`).join("")}</div>`;
/* month list ending at the selected month */
function monthsBack(n) { const y = +month.slice(0, 4), m0 = +month.slice(5, 7) - 1, out = []; for (let k = n - 1; k >= 0; k--) { const d = new Date(Date.UTC(y, m0 - k, 1)); out.push(d.toISOString().slice(0, 7)); } return out; }
async function homeCharts(F, staff) {
  const s = month + "-01", e = nx(+month.slice(0, 4), +month.slice(5, 7)), ML = monLabel(month);
  let money = "", coll = "", trend = "", cats = "";
  if (F.st && F.fl.length) {
    const P = per(F, s, e), A = T(P.r) + T(P.i), E = T(P.e), L = A - E;
    /* the five figures of the month: what was there at the start, what came in, what went out, the month's own result (net cash flow),
       and what is carried to next month (closing = opening + net) */
    const O = T(P.o), MC = T(P.r), OI = T(P.i), CB = T(P.c), prevM = monthsBack(2)[0], nextM = nx(+month.slice(0, 4), +month.slice(5, 7)).slice(0, 7);
    money = `<div class="card ch"><div class="cht"><b>Money</b><small>${ML}</small></div><div class="cf">
      <div class="cfr"><span>Opening balance<small>Carried from ${monLabel(prevM)}</small></span><b>${sgn(O)}</b></div>
      <div class="cfr in"><span><i>+</i>Collections${OI ? `<small>Maintenance ${inr(MC)} + other income ${inr(OI)}</small>` : ""}</span><b>${inr(A)}</b></div>
      <div class="cfr out"><span><i>−</i>Expenses</span><b>${inr(E)}</b></div>
      <div class="cfr net ${L < 0 ? "neg" : "pos"}"><span>Net cash flow<small>This month only: collections − expenses</small></span><b>${L > 0 ? "+" : ""}${sgn(L)}</b></div>
      <div class="cfr cb${CB < 0 ? " neg" : ""}"><span>Closing balance<small>Opening + net cash flow · carried to ${monLabel(nextM)}</small></span><b>${sgn(CB)}</b></div></div>
      <p class="chn"><span class="mut">Cash + bank. Corpus fund is kept separately and not counted here.</span></p></div>`;
    /* maintenance collection: same rule as the monthly register (payments for this month's maintenance) */
    const rt = (F.rt || []).find(r => String(r.month).slice(0, 7) === month), due = f => rt ? +rt.amount : +f.monthly_amount;
    const paid = f => F.p.filter(p => String(p.flat_id) === String(f.id) && String(p.month).slice(0, 7) === month).reduce((a, p) => a + +p.amount, 0);
    let nP = 0, nH = 0, nN = 0, cD = 0, cP = 0, cN = 0; F.fl.forEach(f => { const d = due(f), p = paid(f); cD += d; cP += p; cN += Math.max(d - p, 0); if (p >= d && d > 0) nP++; else if (p > 0) nH++; else nN++; });
    const pct = cD ? Math.round((cD - cN) / cD * 100) : 0; /* same pending rule as the monthly register: each flat's unpaid part */
    coll = `<div class="card ch" data-go="maint" role="button" tabindex="0" title="Open Payments"><div class="cht"><b>Maintenance collection</b><small>${ML}</small></div><div class="chd">
      ${donut([{ v: nP, c: HC.ok, l: "Fully paid " + nP }, { v: nH, c: HC.part, l: "Partial " + nH }, { v: nN, c: HC.pend, l: "Pending " + nN }], nP + "/" + F.fl.length, "flats paid", nP + " of " + F.fl.length + " flats paid")}
      ${legend([[HC.ok, "Fully paid", nP], [HC.part, "Partial", nH], [HC.pend, "Pending", nN]])}</div>
      <div class="cpg" aria-hidden="true"><i style="width:${pct}%"></i></div><p class="chn">${inr(cP)} collected · ${inr(cN)} pending (${pct}% of dues paid)</p></div>`;
    /* received vs spent, month by month */
    const ms = monthsBack(HCN), D = ms.map(mo => { const a = mo + "-01", b = nx(+mo.slice(0, 4), +mo.slice(5, 7)), Q = per(F, a, b); return { mo, r: T(Q.r) + T(Q.i), x: T(Q.e), b: T(Q.c) }; });
    /* bars = each month's money in and out; line = the balance carried forward at each month end (can go below zero) */
    const hi = Math.max(1, ...D.map(d => Math.max(d.r, d.x, d.b))), lo = Math.min(0, ...D.map(d => d.b)), step = niceStep(hi - lo), top = Math.ceil(hi / step) * step, bot = Math.floor(lo / step) * step;
    const W0 = 320, H0 = 150, L0 = 34, B0 = 128, gw = (W0 - L0 - 4) / D.length, bw = Math.max(3, Math.min(14, gw / 2 - 3)), y = v => B0 - (v - bot) / (top - bot) * (B0 - 10), Z = y(0);
    const grid = Array.from({ length: Math.round((top - bot) / step) + 1 }, (_, k) => bot + step * k).map(v => `<line x1="${L0}" x2="${W0 - 2}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="gl"/><text x="${L0 - 5}" y="${(y(v) + 3).toFixed(1)}" text-anchor="end">${v < 0 ? "−" + kfmt(-v) : kfmt(v)}</text>`).join("");
    const bar = (x, v, c) => { const h = Math.max(v > 0 ? 1.5 : 0, Z - y(v)), q = Math.min(3, h), qw = Math.min(3, bw / 2); return h ? `<path d="M${x.toFixed(1)} ${Z.toFixed(1)}V${(Z - h + q).toFixed(1)}q0 -${q.toFixed(1)} ${qw.toFixed(1)} -${q.toFixed(1)}h${(bw - 2 * qw).toFixed(1)}q${qw.toFixed(1)} 0 ${qw.toFixed(1)} ${q.toFixed(1)}V${Z.toFixed(1)}z" fill="${c}"/>` : ""; };
    const px = i => (L0 + gw * i + gw / 2).toFixed(1), bline = `<path d="${D.map((d, i) => (i ? "L" : "M") + px(i) + " " + y(d.b).toFixed(1)).join("")}" class="bl"/>${D.map((d, i) => `<circle cx="${px(i)}" cy="${y(d.b).toFixed(1)}" r="2.8" class="bd"/>`).join("")}`;
    const bars = D.map((d, i) => { const cx = L0 + gw * i + gw / 2; return `<g class="mg" data-mi="${i}">${bar(cx - bw - 1, d.r, HC.rec)}${bar(cx + 1, d.x, HC.sp)}
      <text x="${cx.toFixed(1)}" y="${B0 + 14}" text-anchor="middle">${MN[+d.mo.slice(5, 7) - 1]}</text><rect x="${(L0 + gw * i).toFixed(1)}" y="4" width="${gw.toFixed(1)}" height="${B0 + 14}" class="hit"><title>${monLabel(d.mo)}: received ${inr(d.r)}, spent ${inr(d.x)}, balance at month end ${sgn(d.b)}</title></rect></g>`; }).join("");
    const last = D[D.length - 1];
    trend = `<div class="card ch"><div class="cht"><b>Received vs spent</b><span class="seg">${[6, 12].map(n => `<button type="button" class="${HCN === n ? "on" : ""}" data-hcn="${n}">${n} months</button>`).join("")}</span></div>
      <div class="lg row"><div><span><i style="background:${HC.rec}"></i>Received</span></div><div><span><i style="background:${HC.sp}"></i>Spent</span></div><div><span><i class="bli"></i>Balance at month end</span></div></div>
      <p class="chk">Bars: money in and out during each month. Line: the balance carried forward to the next month.</p>
      <svg viewBox="0 0 ${W0} ${H0}" class="tr" role="img" aria-label="Money received and spent over the last ${HCN} months">${grid}<line x1="${L0}" x2="${W0 - 2}" y1="${Z.toFixed(1)}" y2="${Z.toFixed(1)}" class="ax"/>${bars}${bline}</svg>
      <p class="chn" id="hcd" data-d='${esc(JSON.stringify(D))}'>${mline(last)}<span class="mut">Tap a month to see its figures.</span></p>
      ${staff ? `<div class="f"><button class="ghost" type="button" data-go="st">Open Statement</button></div>` : ""}</div>`;
    /* where this month's money went */
    const C = Object.entries(P.cat).sort((a, b) => b[1] - a[1]), top5 = C.slice(0, 5), rest = C.slice(5).reduce((a, c) => a + c[1], 0);
    if (rest) top5.push(["Other", rest]);
    const cm = Math.max(1, ...top5.map(c => c[1]));
    if (top5.length) cats = `<div class="card ch"${staff ? ` data-go="exp" role="button" tabindex="0" title="Open Expenses"` : ""}><div class="cht"><b>Where the money went</b><small>${ML}</small></div>
      <div class="xb">${top5.map(([k, v]) => `<span class="k">${esc(k)}</span><span class="t"><i style="width:${Math.max(2, v / cm * 100).toFixed(1)}%"></i></span><b>${inr(v)}</b>`).join("")}</div></div>`;
  }
  /* complaints: residents see only their own (the server sends only theirs) */
  let comp = "";
  try { const { data } = await db.from("complaints").select("*"), L1 = data || [];
    if (L1.length) { const n = k => L1.filter(c => (c.status || "open") === k).length, S = [["open", "Open", HC.part], ["in_progress", "In progress", HC.prog], ["resolved", "Resolved", HC.ok]], tot = L1.length;
      comp = `<div class="card ch" data-go="comp" role="button" tabindex="0" title="Open Complaints"><div class="cht"><b>${me.role === "resident" ? "Your complaints" : "Complaints"}</b><small>${tot} in all</small></div>
        <div class="cbar" role="img" aria-label="${S.map(s => s[1] + " " + n(s[0])).join(", ")}">${S.filter(s => n(s[0])).map(s => `<i style="flex:${n(s[0])};background:${s[2]}" title="${s[1]} ${n(s[0])}"></i>`).join("")}</div>
        ${legend(S.map(s => [s[2], s[1], n(s[0])])).replace('class="lg"', 'class="lg row"')}</div>`; } } catch (x) {}
  return { money, coll, trend, cats, comp };
}
const niceStep = mx => { const raw = mx / 3, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };
const kfmt = v => v >= 100000 ? (v / 100000).toFixed(v % 100000 ? 1 : 0) + "L" : v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + "k" : String(Math.round(v));
/* visitors in the last 30 days, as a small line */
function visitSpark(rows) {
  const days = [], T0 = ld(); for (let k = 29; k >= 0; k--) { const d = new Date(T0 + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() - k); days.push(d.toISOString().slice(0, 10)); }
  const v = days.map(d => rows.filter(r => String(r.visit_on).slice(0, 10) === d).reduce((a, r) => a + (+r.count || 0), 0)), mx = Math.max(1, ...v), W = 300, H = 46;
  const pts = v.map((n, i) => [i / (v.length - 1) * (W - 8) + 4, H - 6 - n / mx * (H - 14)]), line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("");
  const pk = v.indexOf(Math.max(...v)), lp = pts[pts.length - 1];
  return `<div class="vsp"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Visitors each day for the last 30 days"><path d="${line}L${(W - 4)} ${H - 6}L4 ${H - 6}Z" class="ar"/><path d="${line}" class="ln"/><circle cx="${lp[0].toFixed(1)}" cy="${lp[1].toFixed(1)}" r="3.5" class="dt"/></svg>
    <small>Last 30 days${Math.max(...v) ? ` · busiest: ${v[pk]} on ${dm(days[pk])}` : ""}</small></div>`;
}
/* chart taps: month details and the 6 / 12 months switch */
function bindCharts(m) {
  m.querySelectorAll("[data-hcn]").forEach(b => b.onclick = ev => { ev.stopPropagation(); HCN = +b.dataset.hcn; render(); });
  const out = m.querySelector("#hcd"); if (!out) return; let D = []; try { D = JSON.parse(out.dataset.d); } catch (x) {}
  m.querySelectorAll(".mg").forEach(g => g.onclick = () => { const d = D[+g.dataset.mi]; if (!d) return; m.querySelectorAll(".mg").forEach(x => x.classList.toggle("on", x === g));
    out.innerHTML = mline(d); });
}
/* "Coming up" on Home: meetings and events, your unpaid maintenance (flats), service dates and AMC / warranty ends (Association) */
async function comingUp(F, ev, cards) {
  const out = ev.map(e => ({ d: e.on_date, t: e.title, s: [e.at_time, e.place].filter(Boolean).join(" · ") + (e.kind === "event" ? " · Event" : " · Meeting"), go: "meet" }));
  try {
    if (me.role === "resident" && month === ld().slice(0, 7)) { const f = F.fl.find(x => String(x.flat_no) === String(me.id)), rt = (F.rt || []).find(r => String(r.month).slice(0, 7) === month);
      if (f) { const due = rt ? +rt.amount : +f.monthly_amount, p = F.p.filter(x => String(x.flat_id) === String(f.id) && String(x.month).slice(0, 7) === month).reduce((a, x) => a + +x.amount, 0);
        if (due - p > 0) { const end = nx(+month.slice(0, 4), +month.slice(5, 7)), last = new Date(end + "T00:00:00Z"); last.setUTCDate(0);
          out.push({ d: last.toISOString().slice(0, 10), t: "Maintenance " + inr(due - p) + " pending", s: monLabel(month) + " · pay the Treasurer", go: "maint", c: "amb" }); } } }
    if (isIn(R_COM)) { const [r, a] = await Promise.all([db.from("reminders").select("*"), db.from("assets").select("*")]);
      (r.data || []).filter(x => x.status !== "done" && dLeft(x.due_on) >= 0 && dLeft(x.due_on) <= 30).forEach(x => out.push({ d: x.due_on, t: x.title, s: "Service reminder", go: "rem" }));
      (a.data || []).filter(x => x.warranty_until && dLeft(x.warranty_until) >= 0 && dLeft(x.warranty_until) <= 60).forEach(x => out.push({ d: x.warranty_until, t: "Warranty / AMC ends: " + x.name, s: "Assets", go: "assets", c: "amb" })); }
  } catch (x) {}
  return out.sort((a, b) => String(a.d).localeCompare(String(b.d))).slice(0, 5);
}
const mline = d => `<span>${monLabel(d.mo)}</span> · <span>Received</span> <b>${inr(d.r)}</b> · <span>Spent</span> <b>${inr(d.x)}</b> · <span>Net</span> <b>${d.r - d.x > 0 ? "+" : ""}${sgn(d.r - d.x)}</b><br><span>Balance at month end</span> <b>${sgn(d.b)}</b>`;
/* money that can be below zero: −₹9,666 */
const sgn = v => v < 0 ? "−" + inr(-v) : inr(v);
/* icons beside the numbers on Home */
const KI = (() => { const g = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`; return {
  users: g('<circle cx="9" cy="8" r="3.4"/><path d="M2.5 19.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6z"/><circle cx="17" cy="9" r="2.6" opacity=".75"/><path d="M15.6 13.7c3.3-.4 6 1.7 6 5.2v.6h-4.4c0-2.3-.6-4.3-1.6-5.8z" opacity=".75"/>'),
  user: g('<circle cx="12" cy="8" r="4"/><path d="M4 20.5c0-4.2 3.6-7 8-7s8 2.8 8 7z"/>'),
  wallet: g('<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H17a1 1 0 0 1 0 2H6.5a.5.5 0 0 0 0 1H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 17.5z"/><circle cx="16.5" cy="13.5" r="1.6" fill="#fff"/>'),
  clock: g('<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  bars: g('<rect x="4" y="12" width="4" height="8" rx="1.2"/><rect x="10" y="8" width="4" height="12" rx="1.2"/><rect x="16" y="4" width="4" height="16" rx="1.2"/>'),
  home: g('<path d="M3.5 11.2 12 4l8.5 7.2V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-5.5h-5v5.5H5A1.5 1.5 0 0 1 3.5 19z"/>'),
  check: g('<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16.2 9.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  coins: g('<ellipse cx="12" cy="6.5" rx="7" ry="2.8"/><path d="M5 9.2c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8v3.3c0 1.6-3.1 2.8-7 2.8s-7-1.2-7-2.8z"/><path d="M5 15.2c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8v2.5c0 1.6-3.1 2.8-7 2.8s-7-1.2-7-2.8z"/>')
}; })();
