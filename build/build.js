/* Krishna Kuteer build: src/  ->  public/
   Run:  npm install   (once)   then   npm run build
   - joins the shared app code (core) into one file and keeps every page in its own file, loaded only when opened
   - minifies JavaScript and CSS, puts a short content fingerprint in each file name (assets/home.1a2b3c4d.js) so phones can
     keep them for a year and still get every update at once
   - checks that no page uses something defined only in another page (that would break when the page loads on its own)
   - writes public/index.html and public/sw.js (the version and the list of files to keep offline are filled in automatically)
   Commit the changed files in public/ together with src/. Cloudflare and Netlify publish public/ as before (no build step there). */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const esbuild = require("esbuild"), acorn = require("acorn"), walk = require("acorn-walk");
const ROOT = path.join(__dirname, ".."), SRC = path.join(ROOT, "src"), PUB = path.join(ROOT, "public"), OUT = path.join(PUB, "assets");

/* ---------- what goes where ---------- */
/* core: needed on every screen (sign-in, header, menu, data, pop-ups, printing). Order matters: shell.js starts the app, so it is last. */
const CORE = ["components/forms.js", "components/visit-approval.js", "services/config.js", "services/api.js", "services/loader.js",
  "components/ui.js", "components/icons.js", "services/auth.js", "components/print.js", "components/shell.js"];
/* modules: loaded by need(name). deps are loaded first. */
const MODULES = {
  finance: { files: ["services/finance.js"] },
  media: { files: ["components/media.js"] },
  service: { files: ["components/service-form.js"] },
  home: { files: ["pages/home.js"], deps: ["finance"] },
  payments: { files: ["pages/payments.js"] },
  expenses: { files: ["pages/expenses.js"] },
  statement: { files: ["pages/statement.js"], deps: ["finance"] },
  maintenance: { files: ["pages/maintenance.js"] },
  celebrations: { files: ["pages/celebrations.js"] },
  visitors: { files: ["pages/visitors.js"] },
  documents: { files: ["pages/documents.js"], deps: ["media"] },
  notices: { files: ["pages/notices.js"] },
  complaints: { files: ["pages/complaints.js"], deps: ["media"] },
  meeting: { files: ["pages/meeting.js"] },
  voting: { files: ["pages/voting.js"] },
  assets: { files: ["pages/assets.js"], deps: ["service"] },
  reminders: { files: ["pages/reminders.js"], deps: ["service"] },
  contacts: { files: ["pages/contacts.js"] },
  audit: { files: ["pages/audit.js"] },
  watchman: { files: ["pages/watchman.js"] },
  regscan: { files: ["components/register-import.js"] },
  letters: { files: ["pages/letters.js"] }, /* Secretary: letter pad */ /* Secretary: visitor register photo import */
};
/* page functions the menu (shell.js) and the month re-lock call, always after need(...) has loaded their file */
const CORE_MAY_CALL = ["dash", "maint", "incomeBox", "works", "celeb", "visitors", "docs", "exps", "stmt", "complaints", "meetings", "polls",
  "assets", "reminders", "contacts", "auditLog", "staffPage", "notices", "loadFin", "per", "letters"];
/* downloaded together with the app (the first screen after sign-in for most people is Home) */
const PRELOAD = ["home"];

const read = f => fs.readFileSync(path.join(SRC, f), "utf8");
const hash = s => crypto.createHash("sha256").update(s).digest("hex").slice(0, 8);
const fail = m => { console.error("BUILD FAILED: " + m); process.exit(1); };
/* npm run check: builds in memory and fails if public/ is not what src/ builds to (someone edited src/ and forgot to build) */
const CHECK = process.argv.includes("--check"), stale = [];
const put = (f, s) => { const p = path.join(PUB, f); if (CHECK) { if (!fs.existsSync(p) || fs.readFileSync(p, "utf8") !== s) stale.push(f); } else fs.writeFileSync(p, s); };

/* ---------- check: every name a file uses must exist in core, in the file itself, or in what it needs ---------- */
function scan(code, label) {
  let ast; try { ast = acorn.parse(code, { ecmaVersion: "latest", sourceType: "script" }); } catch (e) { fail(label + ": " + e.message); }
  const top = new Set(), local = new Set(), used = new Set();
  const addPat = (p, set) => { if (!p) return; if (p.type === "Identifier") set.add(p.name); else if (p.type === "ObjectPattern") p.properties.forEach(q => addPat(q.value || q.argument, set)); else if (p.type === "ArrayPattern") p.elements.forEach(x => addPat(x, set)); else if (p.type === "AssignmentPattern") addPat(p.left, set); else if (p.type === "RestElement") addPat(p.argument, set); };
  ast.body.forEach(s => { if (s.type === "FunctionDeclaration" || s.type === "ClassDeclaration") top.add(s.id.name); if (s.type === "VariableDeclaration") s.declarations.forEach(d => addPat(d.id, top)); });
  walk.fullAncestor(ast, (n, st, anc) => {
    const p = anc[anc.length - 2];
    if (n.type === "VariableDeclarator" && !ast.body.includes(anc[anc.length - 2])) addPat(n.id, local);
    if ((n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression")) { n.params.forEach(x => addPat(x, local)); if (n.id && !ast.body.includes(n)) local.add(n.id.name); }
    if (n.type === "CatchClause" && n.param) addPat(n.param, local);
    if (n.type !== "Identifier") return;
    if (p && p.type === "MemberExpression" && p.property === n && !p.computed) return;
    if (p && (p.type === "Property" || p.type === "MethodDefinition") && p.key === n && !p.computed && !p.shorthand) return;
    if (p && (p.type === "LabeledStatement" || p.type === "BreakStatement" || p.type === "ContinueStatement")) return;
    used.add(n.name);
  });
  return { top, local, used };
}

/* ---------- build ---------- */
const units = {};
units.app = CORE.map(read).join("\n;\n");
for (const [n, m] of Object.entries(MODULES)) units[n] = m.files.map(read).join("\n;\n");
units.push = read("services/push.js");
units["lang-te"] = read("services/lang-te.js");

const info = {}; for (const [n, code] of Object.entries(units)) info[n] = scan(code, n);
const owner = new Map();
for (const [n, i] of Object.entries(info)) { if (n === "lang-te" || n === "push") continue; for (const t of i.top) { if (owner.has(t)) fail(`"${t}" is defined twice (${owner.get(t)} and ${n}); pages share one set of names`); owner.set(t, n); } }
const depsOf = n => { const s = new Set(); (function add(x) { (MODULES[x] && MODULES[x].deps || []).forEach(d => { s.add(d); add(d); }); })(n); return s; };
for (const [n, i] of Object.entries(info)) {
  if (n === "lang-te" || n === "push") continue;
  const ok = new Set(["app", n, ...depsOf(n)]);
  for (const u of i.used) { const o = owner.get(u); if (!o || ok.has(o) || i.local.has(u)) continue; if (n === "app" && CORE_MAY_CALL.includes(u)) continue; fail(`${n} uses "${u}" from ${o}, which it does not load (add "${o}" to its deps, or move "${u}" to core)`); }
}

async function min(code, loader) { return (await esbuild.transform(code, { loader, minify: true, target: loader === "css" ? "chrome80" : "es2020", charset: "utf8", legalComments: "none" })).code; }
(async () => {
  /* files the version now on the server uses (kept one more round, see "tidy" below) */
  const refs = h => (h || "").match(/assets\/[\w.-]+\.(js|css)/g) || [];
  const prev = (() => { let out = []; try { out = refs(fs.readFileSync(path.join(PUB, "index.html"), "utf8")); } catch (e) {}
    /* also the version last committed to git (= what the live site runs), even after several builds in a row */
    for (const ref of ["HEAD", "main", "origin/main"]) try { out = out.concat(refs(require("child_process").execSync("git show " + ref + ":public/index.html", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString())); } catch (e) {}
    return out; })();
  if (!CHECK) fs.mkdirSync(OUT, { recursive: true });
  const files = {}, sizes = [];
  const emit = async (name, code, ext, loader, key) => { const m = await min(code, loader), f = `assets/${name}.${hash(m)}.${ext}`; put(f, m); files[key || name] = f; sizes.push([f, m.length, require("zlib").gzipSync(m).length]); };
  for (const [n, code] of Object.entries(units)) await emit(n, code, "js", "js");
  await emit("app", read("css/app.css").replace(/url\((["']?)fonts\//g, "url($1../fonts/"), "css", "css", "app_css");
  const langCore = (await min(read("services/lang.js"), "js")).replace("__LANG_TE__", files["lang-te"]);
  if (langCore.includes("__LANG_TE__") || !langCore.includes(files["lang-te"])) fail("lang.js: could not fill in the Telugu file name");

  const manifest = { files: {}, deps: {} };
  for (const [n, m] of Object.entries(MODULES)) { manifest.files[n] = files[n]; if (m.deps) manifest.deps[n] = m.deps; }
  const preload = [...new Set(PRELOAD.flatMap(p => [...depsOf(p), p]))].map(n => `<link rel="preload" href="${files[n]}" as="script">`).join("");
  let html = read("index.html")
    .replace("<!--LANG-->", `<script>${langCore.trim()}</script>`)
    .replace("<!--CSS-->", `<link rel="stylesheet" href="${files.app_css || ""}">`)
    .replace("<!--SCRIPTS-->", `<script>window.KK_M=${JSON.stringify(manifest)};</script>${preload}<script src="firebase-config.js" defer></script><script src="${files.app}" defer></script><script src="${files.push}" defer></script>`);
  if (/<!--[A-Z]+-->/.test(html)) fail("index.html: a placeholder was not filled in");
  put("index.html", html);

  /* service worker: everything the app needs offline (the Telugu font too: every phone shows the తెలుగు button) */
  const keep = ["./", "index.html", "firebase-config.js", "hero.webp", "fonts/poppins-Regular.woff2", "fonts/poppins-Medium.woff2", "fonts/poppins-Bold.woff2", "fonts/NotoSansTelugu.woff2", "manifest.webmanifest", "icon-192.png", "association-logo.jpg", ...Object.values(files)];
  const ver = "kk-" + hash(html + keep.join() + read("sw.js"));
  put("sw.js", read("sw.js").replace("__VERSION__", ver).replace("__FILES__", JSON.stringify(keep)));
  if (CHECK) { if (stale.length) fail("public/ is out of date (run npm run build in build/ and commit): " + stale.join(", ")); console.log("public/ is up to date (" + ver + ")"); return; }

  /* tidy: keep this version's files and the previous version's (a phone still running the old version can finish opening a page) */
  const live = new Set([...Object.values(files), ...prev]);
  for (const f of fs.readdirSync(OUT)) if (!live.has("assets/" + f)) fs.unlinkSync(path.join(OUT, f));

  console.log("version " + ver);
  sizes.sort((a, b) => b[1] - a[1]).forEach(([f, b, g]) => console.log(("  " + f).padEnd(42) + String(b).padStart(8) + " bytes" + String(g).padStart(8) + " gzip"));
})().catch(e => fail(e.stack || e.message));
