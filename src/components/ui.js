/* Shared screen helpers: $, splash and skeleton, motion, dates, money, toast, date field. */
const $=s=>document.querySelector(s),app=$("#app");
const SPLASH=`<div class="splash" role="status" aria-label="Loading"><div class="sp-logo">KK</div><b>Krishna Kuteer</b><small>Apartment</small><div class="sp-bar"><i></i></div></div>`,SKEL=`<div class="sk"><div class="sk-b" style="height:120px"></div><div class="sk-r"><div class="sk-b"></div><div class="sk-b"></div></div><div class="sk-b" style="height:200px"></div></div>`;
const showSplash=()=>{document.body.classList.remove("menu-open");app.innerHTML=SPLASH},RM=matchMedia("(prefers-reduced-motion:reduce)").matches;
function countUp(root){root.querySelectorAll(".hero .big,.grid b").forEach(el=>{const m=el.textContent.match(/^([^\d]*)([\d,]+)$/);if(!m)return;const to=+m[2].replace(/,/g,"");if(!to||to>1e9)return;const t0=performance.now();
 const step=n=>{const p=Math.min(1,(n-t0)/450);el.textContent=m[1]+Math.round(to*(1-Math.pow(1-p,3))).toLocaleString("en-IN");if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}
function fx(m){return;const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{rootMargin:"0px 0px -6% 0px"});m.querySelectorAll(".card,h2,.qa,.stg,.tbl").forEach(el=>{if(el.getBoundingClientRect().top<innerHeight)return;el.classList.add("rv");io.observe(el)});setTimeout(()=>{const l=innerHeight;m.querySelectorAll(".rv:not(.in)").forEach(el=>{if(el.getBoundingClientRect().top<l)el.classList.add("in")})},1200)}
if(!RM){document.addEventListener("pointermove",e=>{const t=e.target.closest&&e.target.closest(".stg button,.qa button");if(!t)return;const r=t.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;t.style.setProperty("--mx",x+"px");t.style.setProperty("--my",y+"px");if(e.pointerType==="mouse"&&t.matches(".stg button")){t.style.setProperty("--ry",((x/r.width-.5)*12).toFixed(1)+"deg");t.style.setProperty("--rx",((.5-y/r.height)*12).toFixed(1)+"deg")}});
document.addEventListener("pointerout",e=>{const t=e.target.closest&&e.target.closest(".stg button");if(t&&!t.contains(e.relatedTarget)){t.style.removeProperty("--rx");t.style.removeProperty("--ry")}});
document.addEventListener("pointerdown",e=>{const b=e.target.closest&&e.target.closest("button");if(!b||b.disabled||b.classList.contains("busy"))return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2,s=document.createElement("s");s.className="rip";s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;b.appendChild(s);setTimeout(()=>s.remove(),620)})}
function enter(m,chg){if(RM)return;const c=chg?"enter":"soft";m.classList.add(c);setTimeout(()=>m.classList.remove(c),900);if(chg&&tab==="dash")countUp(m)}
const ld=()=>{const t=new Date();return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0")},iso2dm=iso=>{const[y,m,d]=iso.split("-");return d+"/"+m+"/"+y};
function gd(id){const v=($("#"+id).value||"").trim().replace(/[.\-\s]/g,"/");let p=v.split("/");if(p.length===1&&/^\d{8}$/.test(v))p=[v.slice(0,2),v.slice(2,4),v.slice(4)];if(p.length!==3)return"";let[d,m,y]=p.map(Number);if(y<100)y+=2000;const dt=new Date(Date.UTC(y,m-1,d));if(!(y>=2000)||dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)return"";return dt.toISOString().slice(0,10)}
function dateField(id,label){return `<div class="w"><label class="fl" for="${id}">${label}</label><div style="display:flex;gap:6px;margin-top:2px"><button type="button" class="ghost" data-sh="${id}:-1" style="width:auto" aria-label="Previous day">−</button><input id="${id}" inputmode="numeric" placeholder="dd/mm/yyyy" value="${iso2dm(dd())}" style="flex:1;min-width:0;text-align:center"><button type="button" class="ghost" data-sh="${id}:1" style="width:auto" aria-label="Next day">+</button><button type="button" class="ghost" data-sh="${id}:0" style="width:auto">Today</button></div></div>`}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-sh]");if(!b)return;const[id,n]=b.dataset.sh.split(":"),el=$("#"+id);
 if(n==="0")el.value=iso2dm(ld());else{const dt=new Date((gd(id)||ld())+"T00:00:00Z");dt.setUTCDate(dt.getUTCDate()+ +n);el.value=iso2dm(dt.toISOString().slice(0,10))}});
document.addEventListener("focusin",e=>{if(!e.target.matches||!e.target.matches("input,select"))return;const n=document.querySelector("nav");if(n)n.style.display="none";setTimeout(()=>e.target.scrollIntoView({block:"center",behavior:"smooth"}),250)});
document.addEventListener("focusout",()=>setTimeout(()=>{const a=document.activeElement;if(!a||!a.matches("input,select")){const n=document.querySelector("nav");if(n)n.style.display=""}},150));
const inr=n=>"₹"+Math.round(+n||0).toLocaleString("en-IN");
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function toast(m){const t=$("#toast");t.textContent=m;t.style.display="block";setTimeout(()=>t.style.display="none",2800)}
const dd=()=>{const t=ld();return t.startsWith(month)?t:month+"-01"};
const nx=(y,mo)=>new Date(Date.UTC(y,mo,1)).toISOString().slice(0,10),T=x=>x.cash+x.bank,bk=r=>(r.mode||"cash")==="cash"?"cash":"bank";
const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dm=d=>{const[y,m,dd]=d.split("-");return +dd+"/"+ +m+"/"+y},nf=v=>Math.round(v).toLocaleString("en-IN");
const iso=d=>d.toISOString().slice(0,10),U=s=>new Date(s+"T00:00:00Z"),cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
let wp="m",wa=null;
function wr(){const a=U(wa),y=a.getUTCFullYear(),mo=a.getUTCMonth();let f,t;
 if(wp==="w"){f=new Date(a);f.setUTCDate(a.getUTCDate()-(a.getUTCDay()+6)%7);t=new Date(f);t.setUTCDate(f.getUTCDate()+7)}
 else if(wp==="m"){f=new Date(Date.UTC(y,mo,1));t=new Date(Date.UTC(y,mo+1,1))}else{f=new Date(Date.UTC(y,0,1));t=new Date(Date.UTC(y+1,0,1))}
 return[iso(f),iso(t)]}
const byDate=(k)=>(x,y)=>x[k]<y[k]?-1:x[k]>y[k]?1:x.id-y.id,today=id=>{const e=$("#"+id);if(e)e.value=iso2dm(ld())};
let PRE=null;
const CS=[["open","Open"],["in_progress","In progress"],["resolved","Resolved"]],STAFF4=["admin","treasurer","secretary","president"],mdy=d=>{const[y,m,dd]=String(d).slice(0,10).split("-");return{d:+dd,m:MN[+m-1]||"",y}};
