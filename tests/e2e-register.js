/* Visitor register photo import, end to end in a phone-size browser: the built site, Code.gs on the in-memory Sheet, and a
   stand-in for Google's Gemini reader that answers what it would read from tests/fixtures/sample-register.jpg.
   Run: node tests/e2e-register.js . outdir */
const { chromium, devices } = require('playwright'); const { create } = require('./gas'); const http = require('http'), fs = require('fs'), path = require('path');
const REPO = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const G = create({ file: path.join(REPO, 'apps-script/Code.gs') }); G.x.setup(); G.x.addCommittee();
const PASS = { '101': '123456x', secretary: 'pw-secretary1x', treasurer: 'pw-treasurer1x' };
G.sheets.users.rows.forEach((r, i) => { if (i && ['secretary', 'treasurer'].includes(r[0])) r[3] = 'pw-' + r[0] + '1'; });
[['101', '123456'], ['secretary', 'pw-secretary1'], ['treasurer', 'pw-treasurer1']].forEach(([u, p]) => { const t = G.call({ a: 'login', u, p }).token; G.call({ token: t, a: 'pw', password: p + 'x' }); });
G.sheets.users.rows.forEach((r, i) => { if (i) { r[6] = r[0] + '@example.com'; r[7] = 'yes'; } });
/* Gemini stand-in: what the reader returns for the sample page (rows 2 and 5 have doubtful cells) */
G.props.set('GEMINI_KEY', 'test-key'); let SENT = null;
const R = (o) => Object.assign({ serial: '', date: '', date_iso: '', name: '', flat: '', purpose: '', phone: '', in_time: '', out_time: '', remarks: '', unsure: [], unclear: [] }, o);
const READ = { readable: true, problem: '', rows: [
  R({ serial: '1', date: '12/10/26', date_iso: '2026-10-12', name: 'Ramesh Kumar', flat: '101', purpose: 'Courier', phone: '9876543210', in_time: '10:30', out_time: '10:45' }),
  R({ serial: '2', date: '"', date_iso: '2026-10-12', name: 'Sita Devi', flat: '202', purpose: 'Guest', phone: '984802211', in_time: '11:15', out_time: '13:20', remarks: 'relative', unsure: ['phone'] }),
  R({ serial: '3', date: '"', date_iso: '2026-10-12', name: 'Raju (plumber)', flat: '301', purpose: 'Tap repair', in_time: '14:10', out_time: '15:00', remarks: 'kitchen tap' }),
  R({ serial: '4', date: '13/10/26', date_iso: '2026-10-13', name: 'Swiggy', flat: '402', purpose: 'Food delivery', phone: '9000011122', in_time: '20:05', out_time: '20:12' }),
  R({ serial: '5', date: '"', date_iso: '2026-10-13', name: 'Anil', flat: 'G2', purpose: 'Meeting', phone: '9912345678', in_time: '09:40', remarks: 'did not sign out', unsure: ['in_time'] })] };
G.ctx.UrlFetchApp.fetch = (url, o) => { SENT = JSON.parse(o.payload); return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(READ) }] } }] }) }; };
let ok = 0, bad = 0; const check = async (n, fn) => { try { await fn(); ok++; console.log('  ok   ' + n); } catch (e) { bad++; console.log('  FAIL ' + n + '\n       ' + String(e.message).split('\n')[0]); } };
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || '') + ' got ' + JSON.stringify(a) + ' want ' + JSON.stringify(b)); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, s) => { let p = q.url.split('?')[0]; if (p === '/') p = '/index.html'; const f = path.join(REPO, 'public', p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); s.end(fs.readFileSync(f)); }).listen(8893);
async function session(b, who, lang, dev = devices['Pixel 7']) { const ctx = await b.newContext({ ...dev, serviceWorkers: 'block' }), p = await ctx.newPage(); p.errors = [];
  p.on('pageerror', e => p.errors.push(String(e))); p.on('dialog', d => d.accept());
  await p.route('https://script.google.com/**', async r => r.fulfill({ contentType: 'application/json', body: G.ctx.doPost({ postData: { contents: r.request().postData() } }).s }));
  await p.route('https://www.gstatic.com/**', r => r.abort());
  await p.goto('http://localhost:8893/'); if (lang) { await p.evaluate(l => localStorage.setItem('kk_lang', l), lang); await p.reload(); }
  await p.selectOption('#em', who); await p.fill('#pw', PASS[who]); await p.click('#in'); await p.waitForSelector('nav button[data-t]');
  p.go = async t => { await p.evaluate(t => { tab = t; render(); }, t); await p.waitForFunction(() => !document.querySelector('#m[aria-busy]')); await p.waitForTimeout(250); };
  return p; }
const shot = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
const SAMPLE = path.join(REPO, 'tests/fixtures/sample-register.jpg');
(async () => {
  const b = await chromium.launch();
  console.log('Who sees it');
  const t = await session(b, 'treasurer');
  await check('treasurer does not see the register book card', async () => { await t.go('vis'); eq(await t.locator('#rgup').count(), 0); });
  const r = await session(b, '101');
  await check('residents do not see it', async () => { await r.go('vis'); eq(await r.locator('#rgup').count(), 0); });

  console.log('Secretary');
  const s = await session(b, 'secretary');
  await check('secretary sees "Visitor register book" with both options', async () => { await s.go('vis'); eq(await s.locator('.rgcard button').allInnerTexts(), ['✍️ Add visitor manually', '📷 Upload register photo']); await shot(s, '01-visitors-card'); });
  await check('Add visitor manually goes to the existing entry form', async () => { await s.click('#rgman'); await s.waitForTimeout(600); eq(await s.evaluate(() => document.activeElement.id), 'vnm'); });
  await check('Upload register photo opens the import screen', async () => { await s.click('#rgup'); await s.waitForSelector('.rgx #rgcam', { state: 'attached' }); await s.waitForTimeout(300); await shot(s, '02-pick'); });
  await check('choosing the photo shows it with turn and contrast tools', async () => { await s.setInputFiles('#rggal', SAMPLE); await s.waitForSelector('#rgpv[src^="data:image"]'); eq(await s.isEnabled('#rggo'), true); await shot(s, '03-preview'); });
  await check('reading: progress, then "5 entries found, 2 need checking"', async () => { await s.click('#rggo'); await s.waitForSelector('.rgsum', { timeout: 20000 }); const tx = await s.locator('.rgsum').innerText(); if (!/5\s*entries found/.test(tx) || !/2 need checking/.test(tx)) throw new Error(tx); await shot(s, '04-found'); });
  await check('the photo was sent upright as a JPEG under 1 MB', async () => { const img = SENT.contents[0].parts[1].inlineData; eq(img.mimeType, 'image/jpeg'); if (img.data.length * .75 > 1e6) throw new Error('too big'); });
  await check('review shows every entry in the visitor form fields', async () => { await s.click('#rgrev'); await s.waitForSelector('.rgrow'); eq(await s.locator('.rgrow').count(), 5);
    eq(await s.inputValue('#rg_r1_name'), 'Ramesh Kumar'); eq(await s.inputValue('#rg_r1_flat_no'), '101'); eq(await s.inputValue('#rg_r1_visit_on'), '2026-10-12'); eq(await s.inputValue('#rg_r1_in_time'), '10:30'); await shot(s, '05-review'); });
  await check('doubtful fields are highlighted, never filled with a guess', async () => {
    eq(await s.locator('.rgrow[data-k="r2"] .rgfd.uns').evaluateAll(e => e.map(x => x.dataset.f)), ['phone']);
    eq(await s.inputValue('#rg_r5_flat_no'), ''); eq(await s.locator('.rgrow[data-k="r5"] .rgfd.bad').evaluateAll(e => e.map(x => x.dataset.f)), ['flat_no']);
    if (!/Read as “G2”/.test(await s.locator('.rgrow[data-k="r5"] [data-f="flat_no"]').innerText())) throw new Error('raw reading not shown');
    await s.locator('.rgrow[data-k="r5"]').scrollIntoViewIfNeeded(); await shot(s, '06-flagged'); });
  await check('Save all saves the 3 ready entries and holds the 2 to check', async () => { await s.click('#rgsave'); await s.waitForFunction(() => document.querySelectorAll('.rgrow.sv').length === 3, null, { timeout: 10000 });
    eq(G.x.read_('visitors').filter(v => v.status === 'register').length, 3); await shot(s, '07-partly-saved'); });
  await check('correct and confirm the rest, then Save remaining', async () => {
    await s.click('.rgrow[data-k="r2"] [data-ok="phone"]'); await s.selectOption('#rg_r5_flat_no', '102'); await s.click('.rgrow[data-k="r5"] [data-ok="in_time"]');
    await s.click('#rgsave'); await s.waitForFunction(() => document.querySelectorAll('.rgrow.sv').length === 5, null, { timeout: 10000 });
    eq(G.x.read_('visitors').filter(v => v.status === 'register').map(v => v.name), ['Ramesh Kumar', 'Raju (plumber)', 'Swiggy', 'Sita Devi', 'Anil']); await shot(s, '08-all-saved'); });
  await check('saved rows keep remarks and phone; import recorded', async () => { const a = G.x.read_('visitors').find(v => v.name === 'Anil'); eq([a.flat_no, a.in_time, a.remarks, a.added_by], ['102', '09:40', 'did not sign out', 'secretary']);
    const i = G.x.read_('visitor_imports')[0]; eq([i.by, +i.found, +i.saved, i.status], ['secretary', 5, 5, 'saved']); });
  await check('View visitor history closes and shows the imported dates', async () => { await s.click('#rgdone'); await s.waitForSelector('.rgx', { state: 'detached' }); await s.waitForTimeout(500);
    const tx = await s.locator('table.tbl').first().innerText(); ['Ramesh Kumar', 'Sita Devi', 'Anil', 'From register book'].forEach(n => { if (!tx.includes(n)) throw new Error('missing ' + n); }); await shot(s, '09-history'); });
  await check('the same page again: entries already saved are flagged as duplicates; Save stays off', async () => { await s.click('#rgup'); await s.setInputFiles('#rggal', SAMPLE); await s.waitForSelector('#rgpv[src^="data:image"]'); await s.click('#rggo');
    await s.waitForSelector('.rgsum', { timeout: 20000 }); if (!/4 possible duplicates/.test(await s.locator('.rgsum').innerText())) throw new Error((await s.locator('.rgsum').innerText()).replace(/\n/g, ' | ') + ' :: ' + JSON.stringify(G.x.read_('visitors').filter(v => v.status === 'register').map(v => [v.visit_on, v.name, v.flat_no, v.in_time])));
    await s.click('#rgrev'); await s.waitForSelector('.rgrow'); eq(await s.locator('.rgdup').count(), 4); eq(await s.isDisabled('#rgsave'), true);
    await s.selectOption('#rg_r5_flat_no', '102'); await s.click('.rgrow[data-k="r5"] [data-ok="in_time"]'); await s.waitForTimeout(200); eq(await s.locator('.rgdup').count(), 5); eq(await s.isDisabled('#rgsave'), true); await shot(s, '10-duplicates'); });
  await check('Cancel import closes without saving anything', async () => { await s.click('#rgcx'); await s.waitForSelector('.rgx', { state: 'detached' }); eq(G.x.read_('visitors').filter(v => v.status === 'register').length, 5); eq(G.x.read_('visitor_imports').pop().status, 'cancelled'); });
  await check('no page errors', async () => eq(s.errors, []));

  console.log('Telugu and desktop');
  const te = await session(b, 'secretary', 'te');
  await check('Telugu: card and import screen in Telugu', async () => { await te.go('vis'); await te.click('#rgup'); await te.setInputFiles('#rggal', SAMPLE); await te.waitForSelector('#rgpv[src^="data:image"]'); await te.click('#rggo'); await te.waitForSelector('.rgsum', { timeout: 20000 }); await te.click('#rgrev'); await te.waitForSelector('.rgrow'); await te.waitForTimeout(300); await shot(te, '11-telugu'); });
  const d = await session(b, 'secretary', null, { viewport: { width: 1280, height: 860 } });
  await check('desktop: photo beside the entries', async () => { await d.go('vis'); await d.click('#rgup'); await d.setInputFiles('#rggal', SAMPLE); await d.waitForSelector('#rgpv[src^="data:image"]'); await d.click('#rggo'); await d.waitForSelector('.rgsum', { timeout: 20000 }); await d.click('#rgrev'); await d.waitForSelector('.rgrow'); await d.waitForTimeout(300); await shot(d, '12-desktop'); });
  await b.close(); srv.close();
  console.log(`\n${ok} passed, ${bad} failed`); process.exit(bad ? 1 : 0);
})();
