/* Page loader: each page's code is its own small file and is downloaded and run only the first time that page is opened.
   KK_M (written into index.html by the build) lists every file and what it needs:
   { files: { home: "assets/home.1a2b3c4d.js", ... }, deps: { home: ["finance"], ... } }
   need("home") loads finance, then home, once; later calls return at once. */
const PAGE={dash:"home",maint:"payments",exp:"expenses",st:"statement",work:"maintenance",cel:"celebrations",vis:"visitors",doc:"documents",not:"notices",comp:"complaints",meet:"meeting",poll:"voting",assets:"assets",rem:"reminders",sos:"contacts",audit:"audit",staff:"watchman"};
const KK_M=window.KK_M||{files:{},deps:{}},LOADED={};
function need(n){
 if(!n||!KK_M.files[n])return Promise.resolve();
 const all=[];(function add(x){(KK_M.deps[x]||[]).forEach(add);if(all.indexOf(x)<0)all.push(x)})(n);
 /* files start downloading together; async=false keeps them running in order (what a page needs runs first) */
 all.forEach(x=>{if(LOADED[x])return;LOADED[x]=new Promise((ok,no)=>{const s=document.createElement("script");s.src=KK_M.files[x];s.async=false;
  s.onload=ok;s.onerror=()=>{delete LOADED[x];s.remove();
   /* the app was updated while this phone still had the old version open: reload once to get the new files */
   try{if(navigator.onLine&&!sessionStorage.getItem("kk_reload")){sessionStorage.setItem("kk_reload","1");location.reload();return}}catch(e){}
   no(new Error("Could not open this page. Check your internet connection and tap Retry."))};
  document.head.appendChild(s)})});
 return Promise.all(all.map(x=>LOADED[x])).then(()=>{try{sessionStorage.removeItem("kk_reload")}catch(e){}})}
/* start loading a page the moment a finger touches its menu button or Home tile (before the tap ends) */
document.addEventListener("pointerdown",e=>{const b=e.target.closest&&e.target.closest("[data-t],[data-go]");if(b)need(PAGE[b.dataset.t||b.dataset.go]).catch(()=>{})},{passive:true});
