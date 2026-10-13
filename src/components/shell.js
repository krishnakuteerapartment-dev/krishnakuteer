/* The app frame: header, menu and the page switcher (render). Pages are loaded only when opened (see loader.js).
   Also: month auto re-lock, service worker, and start-up. */
async function isClosed(){const{data}=await db.from("closed_months").select("month").eq("month",month+"-01").maybeSingle();return !!data}
let RL=null;
function armRelock(s,ms=15*60000){try{sessionStorage.setItem("kk_relock",JSON.stringify({s,due:Date.now()+ms}))}catch(e){}clearTimeout(RL);RL=setTimeout(()=>autoLock(s),ms)}
async function autoLock(s){clearTimeout(RL);try{sessionStorage.removeItem("kk_relock")}catch(e){}
 await need("finance");const F=await loadFin();if(F.cl.find(c=>c.month===s))return;const P=per(F,s,nx(+s.slice(0,4),+s.slice(5,7)));
 const{error}=await db.from("closed_months").insert({month:s,closing_cash:P.c.cash,closing_bank:P.c.bank});if(!error){toast(s.slice(0,7)+" locked again automatically");if(me)render()}}
function resumeRelock(){try{const r=JSON.parse(sessionStorage.getItem("kk_relock")||"null");if(r)r.due<=Date.now()?autoLock(r.s):armRelock(r.s,r.due-Date.now())}catch(e){}}
let lastTab="",RG=0;
async function render(){const chg=lastTab!==tab,y=chg?0:window.scrollY,rg=++RG;
 const staff=me.role!=="resident",canW=WRITE.includes(me.role);
 const tabs=[["dash","Home"],["work","Maintenance"],["maint","Payments"]].concat(staff?[["exp","Expenses"],["st","Statement"]]:[["st","Statement"]],[["cel","Celebrations"],["vis","Visitors"],["doc","Documents"],["not","Notices"],["comp","Complaints"],["meet","Meeting"],["poll","Voting"],["assets","Assets"]],isIn(R_COM)?[["rem","Reminders"],["staff","Watchman"]]:[],[["sos","Contacts"]],isIn(R_S)?[["audit","Audit log"]]:[]);
 if(me.role==="watchman")tabs.splice(0,tabs.length,["vis","Visitors"],["staff","Attendance & leave"],["sos","Contacts"]);
 if(!tabs.some(t=>t[0]===tab))tab=tabs[0][0];
 app.innerHTML=`<header><div class="hl"><button class="menubtn" id="hb" aria-label="Open menu" aria-expanded="false"><svg class="l" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg><svg class="x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="brand"><span class="logo"><img src="${LOGO}" alt="Krishna Kuteer logo"></span><div><b>Krishna Kuteer</b><small>${esc(me.role)}</small></div></div></div>${LG()}<div class="hdr-actions"><button class="ghost" style="width:auto" id="cp">Password</button> <button class="ghost" style="width:auto" id="out">Sign out</button></div></header>
 <div id="scrim"></div>
 <main id="m" aria-busy="true">${SKEL}</main><nav><div class="navhead"><span class="logo"><img src="${LOGO}" alt=""></span><div><b>Krishna Kuteer</b><small>${esc(me.role)}</small></div></div>${tabs.map(([k,l])=>`<button data-t="${k}" class="${k===tab?"on":""}">${IC[k]||FIC[k]||""}<span>${l}</span></button>`).join("")}<div class="navfoot"><button id="cp2">Change password</button><button id="out2" class="so">Sign out</button></div></nav>`;
 const doOut=async()=>{try{const r=JSON.parse(sessionStorage.getItem("kk_relock")||"null");if(r)await autoLock(r.s)}catch(e){}await db.auth.signOut();document.body.classList.remove("menu-open");loginView()};
 $("#out").onclick=doOut;$("#out2").onclick=doOut;$("#cp").onclick=$("#cp2").onclick=()=>{document.body.classList.remove("menu-open");pwView(false)};
 const setMenu=o=>{document.body.classList.toggle("menu-open",o);$("#hb").setAttribute("aria-expanded",o);$("#hb").setAttribute("aria-label",o?"Close menu":"Open menu")};
 $("#hb").onclick=()=>setMenu(!document.body.classList.contains("menu-open"));$("#scrim").onclick=()=>setMenu(false);
 document.onkeydown=e=>{if(e.key==="Escape")setMenu(false)};
 {const hd=app.querySelector("header"),sh=()=>document.documentElement.style.setProperty("--hh",hd.offsetHeight+"px");sh();if(window.ResizeObserver)new ResizeObserver(sh).observe(hd);else addEventListener("resize",sh)}
 document.querySelectorAll(".brand,.navhead").forEach(el=>{el.setAttribute("role","link");el.setAttribute("tabindex","0");el.setAttribute("aria-label","Go to Home");
  const go=()=>{tab=me.role==="watchman"?"vis":"dash";document.body.classList.remove("menu-open");window.scrollTo(0,0);render()};el.onclick=go;el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}}});
 document.querySelectorAll("nav button[data-t]").forEach(b=>b.onclick=()=>{tab=b.dataset.t;document.body.classList.remove("menu-open");render()});
 const m=$("#m");
 try{const[lk]=await Promise.all([isClosed(),need(PAGE[tab]||"notices")]),cW=canW&&!lk;
 /* a newer render started while this page's file was loading (another tap, or fresh data arrived): let that one draw */
 if(rg!==RG)return;if(tab==="dash")await dash(m,staff);else if(tab==="maint"){await maint(m,cW);await incomeBox(m,cW)}
 else if(tab==="work")await works(m,canW);else if(tab==="cel")await celeb(m,canW);else if(tab==="vis")await visitors(m,canW);else if(tab==="doc")docs(m);else if(tab==="exp")await exps(m,cW);else if(tab==="st")await stmt(m);else if(tab==="comp")await complaints(m);else if(tab==="meet")await meetings(m);else if(tab==="poll")await polls(m);else if(tab==="assets")await assets(m);else if(tab==="rem")await reminders(m);else if(tab==="sos")await contacts(m);else if(tab==="audit")await auditLog(m);else if(tab==="staff")await staffPage(m);else await notices(m);addPrint(m,(tabs.find(t=>t[0]===tab)||["","Page"])[1]);if(lk&&(tab==="maint"||tab==="exp"))m.insertAdjacentHTML("afterbegin",`<div class="card" style="background:#fff8e6;border-color:#f0d58a">🔒 <b>${month} is locked.</b> Nothing in this month can be added, changed or deleted.${me.role==="admin"?" To make a change, unlock it from the Statement tab (password required).":""}</div>`)}catch(err){if(rg!==RG)return;m.innerHTML=`<div class="card"><b>Could not load this page.</b><p class="err">${esc(err.message)}</p><button id="rt2">Retry</button></div>`;$("#rt2").onclick=render}lastTab=tab;window.scrollTo(0,y);m.removeAttribute("aria-busy");enter(m,chg);fx(m)}
/* Instant repeat opens + offline shell: the app files are cached on the phone and refreshed in the background. */
if("serviceWorker" in navigator&&location.protocol.startsWith("http")){
 addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{});
  navigator.serviceWorker.addEventListener("message",e=>{if(e.data==="updated"){const t=$("#toast");t.textContent="New version ready. Tap here to refresh.";t.style.display="block";t.onclick=()=>location.reload();setTimeout(()=>{t.style.display="none";t.onclick=null},9000)}})})}
(function(){if(!("IntersectionObserver"in window))return;
 const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle("zz",!e.isIntersecting)));let q=0;
 new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;document.querySelectorAll(".stg>button:not([data-io])").forEach(b=>{b.setAttribute("data-io","");io.observe(b)})})}).observe(document.body,{childList:true,subtree:true})})();
if(SCRIPT_URL.startsWith("PASTE"))app.innerHTML=`<div class="login card"><h2>Setup needed</h2><p>Open this file and paste your Google Apps Script Web App URL into SCRIPT_URL at the top of the script.</p></div>`;
else{boot().catch(e=>loginView(e.message||"Something went wrong. Please try again."))}
