/* Printing and "Print this page". */
/* ===== Print helpers ===== */
const PRN_CSS=`*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box}.pw{font:13px/1.45 system-ui,Arial,sans-serif;color:#16202f;margin:0;padding:14px;background:#fff}h1{font-size:19px;text-align:center;margin:0;letter-spacing:.5px}.sub{text-align:center;margin:3px 0 2px;font-size:15px;font-weight:700}.dt{text-align:center;color:#444;margin:0 0 12px;font-size:12px}h3{margin:16px 0 6px;font-size:14px}table{width:100%;border-collapse:collapse;margin-bottom:10px}th,td{border:1px solid #9aa5b4;padding:5px 7px;text-align:left;vertical-align:top}th{background:#e8eef9;font-size:11px;text-transform:uppercase}td.r,th.r{text-align:right;white-space:nowrap}td.c,th.c{text-align:center}tfoot td{font-weight:700;background:#eef3fb}.sig{display:flex;justify-content:space-between;margin-top:46px}.pb{page-break-after:always}.pb:last-child{page-break-after:auto}.box{border:1px solid #9aa5b4;padding:8px 10px;margin:8px 0;font-weight:600;background:#f6f8fc}tr{page-break-inside:avoid}thead{display:table-header-group}`;
const SIG=`<div class="sig"><div>Treasurer: ____________</div><div>Secretary: ____________</div></div>`;
const sheetHead=(title,extra="")=>`<h1>KRISHNA KUTEER APARTMENT</h1><div class="sub">${esc(title)}</div><div class="dt">${extra?esc(extra)+" · ":""}Printed on ${dm(ld())}</div>`;
/* Printing works inside the page itself (no hidden iframe, no pop-up), so it also works on phones.
   The sheet is built in an isolated shadow root; while printing, everything else on the page is hidden. */
let PRN_END=null;
function printHTML(title,html,land,margin){
 if(PRN_END)PRN_END();
 if(!document.body.attachShadow){toast("This browser cannot print from here. Please update it.");return}
 document.body.classList.remove("menu-open");
 const host=document.createElement("div");host.id="prn";host.setAttribute("aria-hidden","true");
 host.attachShadow({mode:"open"}).innerHTML=`<style>:host{display:block;background:#fff;color:#16202f}${PRN_CSS}${REGCSS}</style><div class="pw">${html}</div>`;
 const pg=document.createElement("style");pg.textContent=`@page{size:${land?"landscape":"portrait"};margin:${margin||(land?10:12)}mm}`;
 document.head.appendChild(pg);document.body.appendChild(host);document.body.classList.add("printing");
 const old=document.title;document.title=title;let tm=null;
 const app=!!KKP(),end=()=>{if(PRN_END!==end)return;PRN_END=null;clearTimeout(tm);window.removeEventListener("afterprint",onAfter);host.remove();pg.remove();document.body.classList.remove("printing");document.title=old};
 /* Android app: the print screen draws the page twice, once for the preview and again for "Save as PDF" or the printer.
    The app's browser sends its own "afterprint" after the preview; ignore it, or the second drawing would show the app screen.
    Only the KKPrint plugin's "afterprint" (sent when the print screen closes; it is not a browser event) puts the page back. */
 const onAfter=e=>{if(app&&e.isTrusted)return;end()};
 PRN_END=end;window.addEventListener("afterprint",onAfter);tm=setTimeout(end,app?600000:180000);
 requestAnimationFrame(()=>setTimeout(()=>{try{const P=KKP();if(P)P.print({title,landscape:!!land}).catch(()=>{toast("Could not open the print window");end()});else window.print()}catch(e){toast("Could not open the print window");end()}},120))}
/* Android app: its built-in browser ignores window.print(), so the app's own KKPrint plugin (MainActivity / KKPrintPlugin.java)
   opens Android's print screen instead, and sends "afterprint" back when the print screen closes. Browsers use window.print(). */
function KKP(){try{const c=window.Capacitor;return c&&c.isPluginAvailable&&c.isPluginAvailable("KKPrint")&&c.Plugins&&c.Plugins.KKPrint||null}catch(e){return null}}
/* Saving a file (Word letter, CSV, Excel, photos, PDFs). Browsers download it. The Android app saves it in Downloads/Krishna Kuteer
   through its KKFiles plugin (app version 5 and later) and offers to open it; an older app version cannot save files. */
function KKF(){try{const c=window.Capacitor;return c&&c.isPluginAvailable&&c.isPluginAvailable("KKFiles")&&c.Plugins&&c.Plugins.KKFiles||null}catch(e){return null}}
const inApp=()=>{try{const c=window.Capacitor;return !!(c&&(c.isNativePlatform?c.isNativePlatform():c.getPlatform&&c.getPlatform()!=="web"))}catch(e){return false}};
const blobB64=b=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(",")[1]);r.onerror=no;r.readAsDataURL(b)});
async function saveFile(name,blob){
 name=String(name||"file").replace(/[\\/:*?"<>|]+/g,"-").slice(0,120);const P=KKF();
 if(P){try{await P.save({name,mime:blob.type||"application/octet-stream",data:await blobB64(blob)});toast("Saved in Downloads: "+name);return true}catch(e){toast("Could not save the file");return false}}
 if(inApp()){toast("To save files, install the new app version (5). Or open the website in Chrome.");return false}
 const a=document.createElement("a"),u=URL.createObjectURL(blob);a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);toast("Downloaded "+name);return true}
const prBtn=(id,label)=>`<button class="ghost" id="${id}">🖨 ${label}</button>`;
const ptable=(heads,rows,foot,cls)=>`<table><thead><tr>${heads.map((h,i)=>`<th class="${(cls||[])[i]||""}">${h}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${(cls||[])[i]||""}">${c}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="${heads.length}">Nothing recorded.</td></tr>`}</tbody>${foot?`<tfoot><tr>${foot.map((c,i)=>`<td class="${(cls||[])[i]||""}">${c}</td>`).join("")}</tr></tfoot>`:""}</table>`;
const REGCSS=`.regwrap,.regwrap *{-webkit-print-color-adjust:exact;print-color-adjust:exact}.reg{width:100%;border-collapse:collapse;font-size:.78rem;margin-bottom:12px}.reg th,.reg td{border:1px solid #9aa5b4;padding:4px 6px;text-align:center}.reg .tt{font-weight:700;color:#fff;padding:5px}.reg .b{background:#4472c4}.reg .g{background:#6aa84f}.reg .o{background:#c55a11}.reg .hb{background:#d9e2f3}.reg .hg{background:#e2efd9}.reg .tot{font-weight:700;background:#e2efd9}.reg .y{background:#ff0;font-weight:700}.reg .cb{background:#fbd5b5;font-weight:700}.reg .l{text-align:left}.reg .bd{font-weight:700}.regwrap{overflow-x:auto;color:#1c2430;background:#fff}`;
/* Print this page: prints whatever the screen shows, on the Krishna Kuteer letterhead, without buttons and forms */
const SCR_CSS=`.card{border:1px solid #c5ccd8;border-radius:6px;padding:7px 10px;margin:0 0 7px;page-break-inside:avoid}.card b{font-size:13px}small{display:block;color:#555;font-size:11px}h2{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#444;margin:14px 0 5px}.wel h1{font-size:17px;text-align:left;margin:0}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:8px}.grid .card{margin:0}.grid b{display:block;font-size:16px}.it{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #ddd;padding:4px 0}.stg{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.stg button{display:block;border:1px solid #c5ccd8;border-radius:6px;background:#fff;color:#16202f;opacity:1;padding:6px 2px;text-align:center;font:inherit;font-weight:600}.stg i{display:block;font-style:normal;font-size:10px;font-weight:700;color:#fff;border-radius:99px;padding:1px 0;margin-top:3px}.stp span{display:inline-block;width:31%;height:5px;background:#ccd3de;margin-right:2%}.stp span.on{background:#15803d}.bar div{background:#d7e2f7;padding:3px 7px;margin:3px 0}.bar.me div{background:#cfeedd}.ev{display:flex;gap:10px;align-items:center}.ev .d{min-width:44px;text-align:center;background:#e8eef9;border-radius:6px;padding:4px;font-weight:800}.ev .d small{font-size:9px;text-transform:uppercase}.tl{border-left:2px solid #c5ccd8;padding-left:12px;margin-left:6px}.tl div{padding-bottom:6px}.nt{border-left:4px solid #2f6fe0}.tw{overflow:visible}`;
function printScreen(m,label){
 const c=m.cloneNode(true),isForm=e=>e.querySelector("input,textarea,select");
 c.querySelectorAll(".prt,.skel,.sk,#toast,.qa").forEach(e=>e.remove());
 c.querySelectorAll("input[type=month]").forEach(e=>e.replaceWith(Object.assign(document.createElement("div"),{innerHTML:"<b>Month: "+esc(e.value)+"</b>"})));
 c.querySelectorAll("button[data-c]").forEach(e=>e.replaceWith(Object.assign(document.createElement("div"),{textContent:"○ "+e.dataset.c})));
 /* strip entry forms but keep the information around them (e.g. the "Maintenance per Flat" amount) */
 c.querySelectorAll(".noprint,datalist").forEach(e=>e.remove());
 const kids=[...c.children];kids.forEach(k=>{if(isForm(k))k.dataset.form="1"});
 c.querySelectorAll(".f").forEach(e=>{if(isForm(e))e.remove()});
 c.querySelectorAll("select").forEach(e=>e.replaceWith(document.createTextNode(e.options[e.selectedIndex]?e.options[e.selectedIndex].text:"")));
 c.querySelectorAll("input,textarea,label.fl,script").forEach(e=>e.remove());
 c.querySelectorAll("button:not(.stg button)").forEach(e=>e.remove());
 c.querySelectorAll(".f").forEach(e=>{if(!e.textContent.trim())e.remove()});
 /* entry-form cards (nothing left but their title) go, together with the heading above them */
 kids.forEach((k,i)=>{if(!c.contains(k)||!k.classList.contains("card")||k.querySelector("img,svg"))return;
  const t=k.textContent.trim();if(t&&!(k.dataset.form&&t.length<30))return;k.remove();
  for(let j=i-1;j>=0;j--){const x=kids[j];if(!c.contains(x))continue;
   if(x.tagName==="P"){x.remove();continue}
   if(x.tagName==="H2")x.remove();break}});
 c.querySelectorAll("[data-form]").forEach(e=>e.removeAttribute("data-form"));
 c.querySelectorAll("[id]").forEach(e=>e.removeAttribute("id"));c.querySelectorAll("[disabled]").forEach(e=>e.removeAttribute("disabled"));
 c.querySelectorAll("a[href]").forEach(e=>{e.removeAttribute("target");e.style.cssText="color:#16202f;text-decoration:none"});
 printHTML(label,`<style>${SCR_CSS}</style>`+sheetHead(label,me.id&&me.role==="resident"?"Flat "+me.id:cap(me.role||""))+c.innerHTML+SIG,m.querySelector(".tbl,table")?true:false)}
function addPrint(m,label){m.insertAdjacentHTML("afterbegin",`<div class="prt"><button class="ghost" id="prs" type="button">🖨 Print this page</button></div>`);$("#prs").onclick=()=>printScreen(m,label)}
