/* the CURRENT live app (before this change) against the NEW Code.gs: nothing may break while phones still run the old version */
const { chromium, devices } = require('playwright'); const { create } = require('./gas'); const http = require('http'), fs = require('fs'), path = require('path');
const REPO = process.argv[2], G = create({ file: path.join(REPO, 'apps-script/Code.gs') }); G.x.setup(); G.x.addCommittee();
G.sheets.users.rows.forEach((r, i) => { if (i && r[0] === 'secretary') r[3] = 'pw-sec'; });
['101:123456', 'secretary:pw-sec'].forEach(x => { const [u, p] = x.split(':'); const t = G.call({ a: 'login', u, p }).token; G.call({ token: t, a: 'pw', password: p + 'x' }); });
G.sheets.users.rows.forEach((r, i) => { if (i) { r[6] = 'a@b.co'; r[7] = 'yes'; } });
const srv = http.createServer((q, s) => { let p = q.url.split('?')[0]; if (p === '/') p = '/index.html'; const f = path.join(REPO, 'public', p); if (!fs.existsSync(f)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); fs.createReadStream(f).pipe(s); }).listen(8766);
(async () => { const b = await chromium.launch(); let bad = 0;
  for (const [who, pw] of [['101', '123456x'], ['secretary', 'pw-secx']]) {
    const c = await b.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' }), p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('dialog', d => d.accept());
    await p.route('https://script.google.com/**', async r => r.fulfill({ contentType: 'application/json', body: G.ctx.doPost({ postData: { contents: r.request().postData() } }).s }));
    await p.goto('http://localhost:8766/'); await p.selectOption('#em', who); await p.fill('#pw', pw); await p.click('#in'); await p.waitForSelector('nav button[data-t]', { timeout: 8000 }).catch(async e => { console.log('LOGIN PAGE: ' + (await p.locator('body').innerText()).slice(0, 300)); throw e; });
    const tabs = await p.$$eval('nav button[data-t]', x => x.map(b => b.dataset.t));
    for (const t of tabs) { await p.click('#hb'); await p.waitForTimeout(300); await p.click(`nav button[data-t="${t}"]`); await p.waitForSelector('#m:not([aria-busy])'); const x = await p.locator('#m').innerText(); if (/Could not load/.test(x)) { bad++; console.log('FAIL ' + who + ' ' + t); } }
    if (who === '101') { await p.click('#hb'); await p.waitForTimeout(300); await p.click('nav button[data-t="comp"]'); await p.waitForSelector('#ct'); await p.fill('#ct', 'Old app complaint'); await p.click('#cs'); await p.waitForTimeout(1500); }
    if (who === 'secretary') { await p.evaluate(() => { SNAP = null; DIRTY = true; dropCache(); }); await p.click('#hb'); await p.waitForTimeout(300); await p.click('nav button[data-t="comp"]'); await p.waitForSelector('[data-cs]'); await p.selectOption('[data-cs]', 'in_progress'); await p.waitForTimeout(1500);
      const row = G.x.read_('complaints')[0]; if (row.status !== 'in_progress' || !/^KK-/.test(row.ticket_no) || JSON.parse(row.history).length !== 2) { bad++; console.log('FAIL complaint flow', JSON.stringify(row)); } }
    if (errs.length) { bad++; console.log('FAIL errors ' + who + ': ' + errs.join(' | ')); }
    console.log((errs.length ? 'FAIL ' : 'ok   ') + 'old app as ' + who + ' (' + tabs.length + ' pages)'); await c.close(); }
  await b.close(); srv.close(); console.log(bad ? bad + ' problems' : 'old app works with the new backend'); process.exit(bad ? 1 : 0); })();
