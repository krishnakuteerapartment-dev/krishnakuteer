/* Talking to Google Sheets: sign-in token, the network bar, api(), the saved copy of the data (snapshot),
   instant saves in the background (bgRun), and db.from(...) which reads/writes the tables. */
let cur=null,SNAP=null,SNAPT=0,TOK=null;
try{TOK=localStorage.getItem("kk_token")}catch(e){}
const setTok=t=>{TOK=t;try{t?localStorage.setItem("kk_token",t):localStorage.removeItem("kk_token")}catch(e){}};
/* motion helpers: top network bar + spinner on the button you just pressed */
let NB=0,NBT=null,CB=null,CBT=0;
const NBE=document.getElementById("nb");
const netStart=()=>{if(NB++===0)NBT=setTimeout(()=>{NBE.classList.add("on");document.getElementById("ck").classList.add("on")},200)},netEnd=()=>{if(--NB<=0){NB=0;clearTimeout(NBT);NBE.classList.remove("on");document.getElementById("ck").classList.remove("on")}};
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("button");CB=b&&b.closest("main,.login,.modal")?b:null;CBT=Date.now()},true);
async function api(body,bg){let r;
 if(!bg)netStart();const cb=!bg&&CB&&CB.isConnected&&Date.now()-CBT<600&&!CB.classList.contains("busy")?CB:null;if(cb)cb.classList.add("busy");
 try{const bd=JSON.stringify({token:TOK,...body});r=await(await fetch(SCRIPT_URL,{method:"POST",body:bd,keepalive:bd.length<60000})).json()}
 catch(e){throw new Error("Could not reach Google Sheets. Check your internet connection and try again.")}
 finally{if(!bg)netEnd();if(cb)cb.classList.remove("busy")}
 if(r.auth){setTok(null);dropCache();cur=null;SNAP=null;loginView(r.error.message);throw new Error(r.error.message)}return r}
const SK="kk_snap",FRESH=20000;
let DIRTY=false,REFR=false,GEN=0;
const LOC=d=>window.KK_LOC?KK_LOC(d):d,OPT=(q,o)=>window.KK_OPT?KK_OPT(q,o):o;
const readCache=()=>{try{const c=JSON.parse(localStorage.getItem(SK)||"null");if(c&&c.tok&&c.tok===TOK)return LOC(c.d)}catch(e){}return null};
const saveCache=d=>{try{localStorage.setItem(SK,JSON.stringify({tok:TOK,d}))}catch(e){}};
const dropCache=()=>{try{localStorage.removeItem(SK)}catch(e){}};
const getSnap=bg=>api({a:"snapshot"},bg).then(r=>{if(r.error)throw new Error(r.error.message);return LOC(r.data)});
/* ---------- INSTANT SAVE ----------
   Saving no longer waits for Google Sheets: the new item shows at once and "Saved" appears, while the real save runs
   quietly in the background (thin bar at the top of the screen). Saves are sent one after another, in order.
   If Google Sheets refuses one (for example a locked month), a message explains why and the screen reloads the real data.
   Payments, month locks and settings still wait for Google Sheets, because they need a receipt number or a final check. */
const PEND=[],TMPID=9e12;
let CHAIN=Promise.resolve(),TMP=0;
 /* items still saving get a temporary id above TMPID, so they sort as newest */
const nowS=()=>{const d=new Date();return ld()+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")};
const clone=o=>typeof structuredClone==="function"?structuredClone(o):JSON.parse(JSON.stringify(o));
const busyBar=()=>{const n=document.getElementById("nb");if(n)n.classList.toggle("sync",PEND.length>0)};
const calm=()=>{if(me&&$("#m")&&!document.querySelector("input:focus,select:focus,textarea:focus"))render()};
let AFT=null;
const after=()=>{clearTimeout(AFT);AFT=setTimeout(()=>api({a:"after"},1).catch(()=>{}),1500)};
function bgRun(apply,job){
 const it={apply};PEND.push(it);GEN++;busyBar();
 if(SNAP){SNAP=SNAP.then(T=>{const c=clone(T);apply(c);return c});SNAPT=Date.now()}
 CHAIN=CHAIN.then(job).then(w=>{if(w&&w.error)throw new Error(w.error.message);PEND.splice(PEND.indexOf(it),1);GEN++;
   if(w&&w.snapshot)adopt(w.snapshot);
   after();if(!PEND.length)calm()})
  .catch(e=>{const i=PEND.indexOf(it);if(i>=0)PEND.splice(i,1);GEN++;toast("Not saved: "+(e&&e.message||"please try again"));
   SNAP=null;DIRTY=true;dropCache();snap().then(()=>{if(PEND.length){const rest=PEND.slice();SNAP=SNAP.then(T=>{const c=clone(T);rest.forEach(p=>p.apply(c));return c})}calm()}).catch(()=>{})})
  .finally(busyBar);
 return CHAIN}
addEventListener("beforeunload",e=>{if(PEND.length){e.preventDefault();e.returnValue=""}});
const FAST=["expenses","income","complaints","notices","meetings","maintenance_log","celebrations","visitors","gallery","status","polls","votes","assets","asset_service","reminders","contacts","action_items"];
/* the same checks Google Sheets makes, done here first so "Saved" is only shown for saves that will go through */
function preCheck(T,t,op,p){
 const closed=(T.closed_months||[]).map(r=>String(r.month).slice(0,7)),lk=d=>d&&closed.includes(String(d).slice(0,7));
 if(op==="insert"||op==="upsert"){
  if((t==="expenses"&&lk(p.spent_on))||(t==="income"&&lk(p.received_on)))return "This month is locked. Nothing can be added, changed or deleted in it.";
  if(["expenses","income"].includes(t)&&!(+p.amount>0))return "Enter an amount above 0.";
  if(t==="celebrations"&&p.kind!=="sponsor"&&!(+p.amount>0))return "Enter an amount above 0."}
 if(op==="insert"){
  if(t==="complaints"&&!String(p.title||"").trim())return "Please describe the problem.";
  if(t==="meetings"&&(!String(p.title||"").trim()||!p.on_date||!["meeting","event"].includes(p.kind)))return "Enter a title, date and type.";
  if(t==="polls"&&(!String(p.question||"").trim()||String(p.options||"").split("|").filter(x=>x.trim()).length<2))return "Enter a question and at least two options.";
  if(t==="visitors"&&(!p.visit_on||!(Math.floor(+p.count)>=1&&+p.count<=100000)))return "Enter a date and a visitor count of at least 1.";
  if(t==="visitors"&&p.name&&!String(p.flat_no||"").trim())return "Choose the flat visited.";
  if(t==="assets"&&!String(p.name||"").trim())return "Enter the name of the item.";
  if(t==="asset_items"&&!String(p.name||"").trim())return "Enter the name of the item.";
  if(t==="reminders"&&(!String(p.title||"").trim()||!p.due_on))return "Enter what is due and the due date.";
  if(t==="contacts"&&(!String(p.name||"").trim()||!p.phone))return "Enter a name and a phone number.";
  if(t==="action_items"&&!String(p.task||"").trim())return "Enter the task.";
  if(t==="votes"){const q=(T.polls||[]).find(x=>String(x.id)===String(p.poll_id));if(!q||q.status!=="open")return "This poll is closed.";
   if((T.votes||[]).some(v=>String(v.poll_id)===String(p.poll_id)&&v.mine))return "You have already voted in this poll."}}
 return ""}
function applyLocal(T,t,op,pl,fl){
 const rows=T[t]||(T[t]=[]),hit=r=>fl.every(([c,v])=>String(r[c])===String(v)),now=nowS();
 if(op==="insert"){const r=Object.assign({id:TMPID+(++TMP),created_at:now},pl);
  if(t==="complaints")Object.assign(r,{flat_no:cur&&cur.id,status:"open",updated_at:now,history:JSON.stringify([{at:now,by:cur&&cur.id,status:"open",note:"Complaint raised"}])});
  if(t==="meetings")r.status="draft";if(t==="reminders")r.status="pending";if(t==="action_items")r.status="open";if(t==="visitors"&&r.name)r.added_by=cur&&cur.id;
  if(t==="notices")r.created_on=ld();if(t==="polls")r.status="open";if(t==="gallery")r.uploaded_by=cur&&cur.id;
  if(t==="votes"){delete r.id;delete r.created_at;r.mine=true}
  rows.push(r)}
 else if(op==="update")rows.filter(hit).forEach(r=>Object.assign(r,pl,t==="complaints"?{updated_at:now}:{}));
 else if(op==="delete")T[t]=rows.filter(r=>!hit(r));
 else if(op==="upsert"){const k=pl[1].onConflict,h=rows.find(r=>String(r[k])===String(pl[0][k]));h?Object.assign(h,pl[0]):rows.push(Object.assign({},pl[0]))}}
function adopt(d){d=LOC(d);SNAP=Promise.resolve(d);SNAPT=Date.now();DIRTY=false;saveCache(d);if(PEND.length){const rest=PEND.slice();SNAP=SNAP.then(T=>{const c=clone(T);rest.forEach(p=>p.apply(c));return c})}if(d&&d.me&&cur)cur=d.me}
/* Show what we already have instantly, then quietly fetch the latest in the background. */
function refresh(){if(REFR||PEND.length)return;REFR=true;const old=SNAP,g=GEN;
 getSnap(1).then(async d=>{if(g!==GEN)return;const prev=await old;adopt(d);
  if(JSON.stringify(prev)!==JSON.stringify(d)&&me&&$("#m")&&!document.querySelector("input:focus,select:focus"))render()})
 .catch(()=>{}).finally(()=>{REFR=false})}
function snap(){
 if(SNAP){if(Date.now()-SNAPT<FRESH)return SNAP;refresh();return SNAP}
 if(!DIRTY){const c=readCache();if(c){SNAP=Promise.resolve(c);SNAPT=0;refresh();return SNAP}}
 SNAP=getSnap().then(d=>{DIRTY=false;saveCache(d);return d}).catch(e=>{SNAP=null;throw e});SNAPT=Date.now();return SNAP}
function Q(t){const f=[],fl=[];let op="s",pl=null,one=0,ord=null;const q={
 select(){return q},eq(c,v){f.push(r=>String(r[c])===String(v));fl.push([c,v]);return q},gte(c,v){f.push(r=>r[c]>=v);return q},lt(c,v){f.push(r=>r[c]<v);return q},
 in(c,v){f.push(r=>v.includes(r[c]));return q},order(c,o){ord=[c,o&&o.ascending===false];return q},single(){one=1;return q},maybeSingle(){one=2;return q},
 insert(v){op="insert";pl=v;return q},update(v){op="update";pl=v;return q},delete(){op="delete";return q},upsert(v,o){op="upsert";pl=[v,o];return q},
 then(res,rej){return run().then(res,rej)}};
 async function run(){
  if(op==="s"){const T=await snap();let r=(T[t]||[]).filter(x=>f.every(g=>g(x))).map(x=>({...x}));
   if(cur&&cur.role==="resident"&&t==="flats")r=r.filter(x=>x.id===cur.flat);
   if(ord)r.sort((x,y)=>(x[ord[0]]>y[ord[0]]?1:-1)*(ord[1]?-1:1));
   return{data:one?(r[0]||null):r,error:null}}
  const up=op==="upsert",req={a:"write",t,op,payload:up?pl[0]:pl,onConflict:up?pl[1].onConflict:null,filters:fl};
  if(FAST.includes(t)&&SNAP){const T=await SNAP,bad=preCheck(T,t,op,up?pl[0]:pl);if(bad)return{data:null,error:{message:bad}};
   if(fl.some(([c,v])=>c==="id"&&+v>=TMPID))return{data:null,error:{message:"Still saving. Please try again in a moment."}};
   bgRun(c=>applyLocal(c,t,op,pl,fl),()=>api(req,1));return{data:null,error:null}}
  try{const w=await api(req);GEN++;if(w.snapshot)adopt(w.snapshot);else{SNAP=null;DIRTY=true}
   return{data:null,error:w.error||null}}catch(e){return{data:null,error:{message:e.message}}}}
 return q}
const db={from:Q,rpc:async n=>({data:n==="all_flats"?(await snap()).flats.map(x=>({...x})):null,error:null}),auth:{
 getUser:async()=>{if(!cur&&TOK){try{const T=await snap();if(T&&T.me)cur=T.me;else{const r=await api({a:"me"});if(r.user)cur=r.user}}catch(e){}}
  return{data:{user:cur?{id:cur.id,email:cur.email,user_metadata:{pw_changed:!!cur.pw_changed}}:null}}},
 updateUser:async({password})=>{try{const r=await api({a:"pw",password});if(r.error)return{error:r.error};cur.pw_changed=true;SNAP=null;DIRTY=true;dropCache();return{error:null}}catch(e){return{error:{message:e.message}}}},
 emailSend:async email=>{try{const r=await api({a:"emailSend",email});return r.error?{error:r.error}:{error:null}}catch(e){return{error:{message:e.message}}}},
 emailVerify:async code=>{try{const r=await api({a:"emailVerify",code});if(r.error)return{error:r.error};cur.email_ok=true;cur.real_email=r.email;SNAP=null;DIRTY=true;dropCache();return{error:null}}catch(e){return{error:{message:e.message}}}},
 fpSend:async u=>{try{const r=await api({a:"fpSend",u});return r.error?{error:r.error}:{error:null,masked:r.masked}}catch(e){return{error:{message:e.message}}}},
 fpReset:async(u,code,password)=>{try{const r=await api({a:"fpReset",u,code,password});return{error:r.error||null}}catch(e){return{error:{message:e.message}}}},
 signOut:async()=>{try{await api({a:"logout"})}catch(e){}setTok(null);dropCache();cur=null;SNAP=null},
 signInWithPassword:async({email,password})=>{try{const r=await api({a:"login",u:email,p:password,dev:((navigator.userAgent.match(/Android|iPhone|iPad|Windows|Mac OS X|Linux/)||["Device"])[0]+" "+(navigator.userAgent.match(/Edg|OPR|Firefox|Chrome|Safari/)||[""])[0]).trim()});if(r.error)return{error:r.error};setTok(r.token);cur=r.user;SNAP=null;if(r.snapshot)adopt(r.snapshot);return{error:null}}catch(e){return{error:{message:e.message}}}}}};
