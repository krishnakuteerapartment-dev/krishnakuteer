/* Printing inside the Android app (KKPrint plugin). Android's print screen renders the page twice: once for the preview and
   again when "Save as PDF" or a printer is chosen. The WebView fires its own "afterprint" after the preview; the page must
   keep showing the print sheet until the plugin says the print screen has closed (its own, untrusted "afterprint").
   Chromium's page.pdf() renders the same way and fires the same trusted events, so it stands in for Android here.
   Run: node tests/e2e-print-app.js . outdir */
const { chromium, devices } = require('playwright'); const { create } = require('./gas'); const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const REPO = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const G = create({ file: path.join(REPO, 'apps-script/Code.gs') }); G.x.setup(); G.x.addCommittee();
G.sheets.users.rows.forEach((r, i) => { if (i && r[0] === 'secretary') r[3] = 'pw-secretary1'; });
{ const t = G.call({ a: 'login', u: 'secretary', p: 'pw-secretary1' }).token; G.call({ token: t, a: 'pw', password: 'pw-secretary1x' }); }
G.sheets.users.rows.forEach((r, i) => { if (i) { r[6] = r[0] + '@example.com'; r[7] = 'yes'; } });
let ok = 0, bad = 0; const check = async (n, fn) => { try { await fn(); ok++; console.log('  ok   ' + n); } catch (e) { bad++; console.log('  FAIL ' + n + '\n       ' + String(e.message).split('\n')[0]); } };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, s) => { let p = q.url.split('?')[0]; if (p === '/') p = '/index.html'; const f = path.join(REPO, 'public', p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); s.end(fs.readFileSync(f)); }).listen(8894);
const text = f => execFileSync('pdftotext', ['-layout', f, '-']).toString();
(async () => {
  const b = await chromium.launch();
  for (const app of [true, false]) {
    console.log(app ? 'Android app (KKPrint plugin)' : 'Browser (window.print)');
    const ctx = await b.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' }), p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.addInitScript(app => { window.__prints = 0; if (app) window.Capacitor = { isPluginAvailable: n => n === 'KKPrint', Plugins: { KKPrint: { print: async () => { window.__prints++; } } } }; else window.print = () => { window.__prints++; }; }, app);
    await p.route('https://script.google.com/**', async r => r.fulfill({ contentType: 'application/json', body: G.ctx.doPost({ postData: { contents: r.request().postData() } }).s }));
    await p.route('https://www.gstatic.com/**', r => r.abort());
    await p.goto('http://localhost:8894/'); await p.selectOption('#em', 'secretary'); await p.fill('#pw', 'pw-secretary1x'); await p.click('#in'); await p.waitForSelector('nav button[data-t]');
    await p.evaluate(() => printHTML('Minutes of meeting: Monthly Meeting', sheetHead('Minutes of meeting: Monthly Meeting') + '<h3>Agenda</h3><div class="box">1. Lift AMC &amp; Quotations</div><h3>Minutes</h3><p>Lift AMC awarded to Skywards Elevators.</p>' + SIG));
    await p.waitForFunction(() => window.__prints === 1);
    const tag = app ? 'app' : 'web';
    await check('the print sheet is shown for the preview', async () => { await p.pdf({ path: path.join(OUT, tag + '-preview.pdf'), format: 'A4' }); const t = text(path.join(OUT, tag + '-preview.pdf')); if (!/Minutes of meeting: Monthly Meeting/.test(t)) throw new Error(t.slice(0, 200)); });
    if (app) {
      await check('after the preview, the sheet is still there for "Save as PDF"', async () => { await p.waitForTimeout(200); await p.pdf({ path: path.join(OUT, 'app-saved.pdf'), format: 'A4' }); const t = text(path.join(OUT, 'app-saved.pdf'));
        if (!/Minutes of meeting: Monthly Meeting/.test(t) || /Visitors|Complaints|Namaste/.test(t)) throw new Error('saved PDF shows the app screen: ' + t.replace(/\s+/g, ' ').slice(0, 160)); });
      await check('when the print screen closes (plugin event), the app page comes back', async () => { await p.evaluate(() => dispatchEvent(new Event('afterprint'))); await p.waitForTimeout(100);
        if (await p.evaluate(() => !!document.getElementById('prn') || document.body.classList.contains('printing'))) throw new Error('still printing'); });
    } else await check('browser: the page comes back after printing', async () => { await p.waitForTimeout(200); if (await p.evaluate(() => !!document.getElementById('prn'))) throw new Error('still printing'); });
    await check('no page errors', async () => { if (errs.length) throw new Error(errs.join('; ')); });
    await ctx.close();
  }
  await b.close(); srv.close(); console.log(`\n${ok} passed, ${bad} failed`); process.exit(bad ? 1 : 0);
})();
