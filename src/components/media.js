/* Photos: pick, shrink, upload, show (Documents and Complaints). Loaded when needed. */
/* ---- Photos: picked on phone, shrunk, saved to Drive (id kept in the sheet) ---- */
const PK={},PH={};
const UP=new Map(),bgDrive=()=>{api({a:"driveSync"},1).catch(()=>{})};
async function shrink(f){let bm;try{bm=await createImageBitmap(f)}catch(e){bm=await new Promise((ok,no)=>{const u=URL.createObjectURL(f),i=new Image();i.onload=()=>{URL.revokeObjectURL(u);ok(i)};i.onerror=no;i.src=u})}
 const W=bm.width,H=bm.height;let m=1280,q=.72;
 for(let k=0;k<8;k++){const s=Math.min(1,m/Math.max(W,H)),c=document.createElement("canvas");c.width=Math.round(W*s);c.height=Math.round(H*s);const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(bm,0,0,c.width,c.height);
  const bl=await new Promise(r=>c.toBlob(r,"image/jpeg",q));if(bl&&bl.size<450000){if(bm.close)bm.close();return b64(bl)}q>.5?q-=.1:m*=.8}
 throw 0}
const pickHtml=id=>(PK[id]=[],`<div class="pk" id="${id}"><label class="pkb">📷 Take photo<input type="file" accept="image/*" capture="environment" hidden></label> <label class="pkb">🖼 From gallery<input type="file" accept="image/*" multiple hidden></label><div class="pkt"></div></div>`);
function pickInit(id,max){const el=$("#"+id),inps=[...el.querySelectorAll("input")],t=el.querySelector(".pkt"),draw=()=>{t.innerHTML=PK[id].map((s,i)=>`<span class="pkp"><img src="${s}" alt=""><b data-i="${i}">×</b></span>`).join("");t.querySelectorAll("b").forEach(b=>b.onclick=()=>{PK[id].splice(+b.dataset.i,1);draw()})};
 inps.forEach(inp=>inp.onchange=async()=>{const fs=[...inp.files],room=max-PK[id].length;if(fs.length>room)toast("Maximum "+max+" photos");inp.value="";const kind=id==="gph"?"gallery":"complaint";await Promise.all(fs.slice(0,Math.max(room,0)).map(async f=>{try{const d=await shrink(f);PK[id].push(d);UP.set(d,api({a:"upload",kind,img:d},1).catch(()=>null));draw()}catch(e){toast("Could not read that photo")}}))})}
const LID=()=>"L"+(++TMP),upOne=async(d,kind,pre)=>{let r=pre?await pre:null;if(!r||r.error||!r.id)r=await api({a:"upload",kind,img:d},1);if(r.error)throw new Error(r.error.message);PH[r.id]=Promise.resolve(d);return r.id};
const wrIns=async(t,payload)=>{const w=await api({a:"write",t,op:"insert",payload,filters:[]},1);if(w.error)throw new Error(w.error.message);return w};
const phTag=id=>`<span class="phw"><img class="ph" data-ph="${esc(id)}" alt="Photo" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="><button class="dl" title="Download" aria-label="Download photo">⬇</button></span>`;
function dlImg(src,nm){const bin=atob(src.split(",")[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const mime=src.slice(5,src.indexOf(";")),url=URL.createObjectURL(new Blob([u],{type:mime})),a=document.createElement("a");a.href=url;a.download=nm+(mime.includes("png")?".png":mime.includes("webp")?".webp":".jpg");document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
/* Photos load only when they scroll into view, and each one is kept on the phone after the first download (photos never change). */
const PHC="kk-photos",phGet=id=>PH[id]||(PH[id]=(async()=>{try{const h=await(await caches.open(PHC)).match("ph/"+id);if(h)return await h.text()}catch(e){}
 const r=await api({a:"photo",id},true);if(!r.img)throw 0;try{(await caches.open(PHC)).put("ph/"+id,new Response(r.img))}catch(e){}return r.img})());
const PIO="IntersectionObserver"in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){PIO.unobserve(e.target);showPh(e.target)}}),{rootMargin:"400px 0px"}):null;
function loadPh(root){root.querySelectorAll("img[data-ph]").forEach(im=>{im.decoding="async";PIO?PIO.observe(im):showPh(im)})}
async function showPh(im){const id=im.dataset.ph;try{const src=await phGet(id);im.src=src;im.classList.add("ok");const w=im.parentElement,nm="Krishna-Kuteer-"+id.slice(1,9);w.classList.add("ok");w.querySelector(".dl").onclick=ev=>{ev.stopPropagation();dlImg(im.src,nm)};im.onclick=()=>{const o=document.createElement("div");o.className="lb";o.innerHTML=`<img src="${im.src}" alt="Photo"><button class="dl2">⬇ Download</button>`;o.onclick=()=>o.remove();o.querySelector("button").onclick=ev=>{ev.stopPropagation();dlImg(im.src,nm)};document.body.appendChild(o)}}catch(e){delete PH[id]}}
const b64=f=>new Promise((ok,no)=>{const r=new FileReader();r.onerror=no;r.onload=()=>ok(r.result);r.readAsDataURL(f)});
