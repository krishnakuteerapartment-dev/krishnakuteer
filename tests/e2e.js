/* End-to-end: real index.html + features.js in Chromium, Code.gs running on the in-memory Sheet behind it.
   Run: node e2e.js <repo> <outdir> */
const { chromium, devices } = require('playwright');
const { create } = require('./gas');
const http = require('http'), fs = require('fs'), path = require('path');
const REPO = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const G = create({ file: path.join(REPO, 'apps-script/Code.gs'), translate: !!process.env.TE });
G.x.setup(); G.x.addCommittee();
G.sheets.users.rows.forEach((r, i) => { if (i && ['secretary', 'treasurer', 'executive', 'president'].includes(r[0])) r[3] = 'pw-' + r[0]; });
/* everyone has already set a password and e-mail, so no first-time screens */
const setPw = (u, p) => { const t = G.call({ a: 'login', u, p }).token; G.call({ token: t, a: 'pw', password: p + 'x' }); };
['101:123456', '102:123456', '1234:987654', 'secretary:pw-secretary', 'treasurer:pw-treasurer', 'executive:pw-executive', 'president:pw-president'].forEach(x => setPw(...x.split(':')));
G.sheets.users.rows.forEach((r, i) => { if (i) { r[6] = r[0] + '@example.com'; r[7] = 'yes'; } });
G.ctx.CacheService.getScriptCache().remove && null;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(REPO, 'public', p);
  if (!f.startsWith(path.join(REPO, 'public')) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s);
}).listen(8765);

const results = []; let shotN = 0;
const log = (ok, name, extra = '') => { results.push({ ok, name }); console.log((ok ? '  ok   ' : '  FAIL ') + name + (extra ? '\n       ' + extra : '')); };
async function check(name, fn) { try { await fn(); log(true, name); } catch (e) { log(false, name, String(e.message).split('\n')[0]); } }
const PASS = { '101': '123456x', '102': '123456x', '1234': '987654x', secretary: 'pw-secretaryx', treasurer: 'pw-treasurerx', executive: 'pw-executivex', president: 'pw-presidentx' };

async function session(browser, who, dev) {
  const ctx = await browser.newContext(Object.assign({}, dev, { serviceWorkers: 'block' }));
  const page = await ctx.newPage(); page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) page.errors.push(m.text()); });
  page.on('dialog', d => d.accept());
  await page.route('https://script.google.com/**', async r => { const body = r.request().postData(); let out;
    try { out = G.ctx.doPost({ postData: { contents: body } }).s; } catch (e) { out = JSON.stringify({ error: { message: 'mock: ' + e.message } }); }
    await r.fulfill({ status: 200, contentType: 'application/json', body: out }); });
  await page.route('https://www.gstatic.com/**', r => r.abort());
  await page.goto('http://localhost:8765/');
  await page.waitForSelector('#em');
  await page.selectOption('#em', who); await page.fill('#pw', PASS[who]); await page.click('#in');
  await page.waitForSelector('nav button[data-t]', { timeout: 15000 });
  return { ctx, page };
}
async function go(page, t) {
  if (await page.locator('#hb').isVisible()) { await page.click('#hb'); await page.waitForTimeout(350); }
  await page.click(`nav button[data-t="${t}"]`); await page.waitForSelector('#m:not([aria-busy])'); await page.waitForTimeout(250);
}
const settle = async page => { for (let i = 0; i < 60; i++) { if (!(await page.evaluate(() => PEND.length))) break; await page.waitForTimeout(100); } await page.waitForTimeout(300); };
async function shot(page, name) { shotN++; const f = path.join(OUT, String(shotN).padStart(2, '0') + '-' + name + '.png'); await page.screenshot({ path: f, fullPage: true }); return f; }
async function noHScroll(page) { const w = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); if (w[0] > w[1] + 1) throw new Error('page scrolls sideways: ' + w); }
const txt = page => page.locator('#m').innerText();
const has = async (page, re) => { const t = await txt(page); re = new RegExp(re.source, re.flags.includes('i') ? re.flags : re.flags + 'i'); if (!re.test(t)) throw new Error('missing ' + re + ' in: ' + t.slice(0, 300).replace(/\n/g, ' | ')); };
const hasNot = async (page, re) => { const t = await txt(page); if (re.test(t)) throw new Error('should not show ' + re); };

(async () => {
  const browser = await chromium.launch();
  const PHONE = devices['Pixel 7'], DESK = { viewport: { width: 1280, height: 900 } };
  const MODE = process.env.MODE || 'phone', DEV = MODE === 'desk' ? DESK : PHONE;
  console.log('Device: ' + MODE);

  /* ---------- secretary: assets, reminders, meeting, contacts ---------- */
  const S = await session(browser, 'secretary', DEV), p = S.page;
  await check('menu has the 5 new pages and the renamed one', async () => { const t = await p.locator('nav').innerText(); ['Meeting', 'Assets', 'Reminders', 'Contacts', 'Audit log'].forEach(x => { if (!t.includes(x)) throw new Error('no ' + x); }); });
  await go(p, 'assets');
  await check('add lift asset', async () => {
    await p.fill('#an', 'Lift'); await p.selectOption('#ak', 'lift'); await p.fill('#al', 'Main stairwell'); await p.fill('#ai', '2020-01-15'); await p.fill('#av', 'Otis'); await p.fill('#avp', '9848012345'); await p.fill('#aw', '2026-11-05');
    await p.click('#asv'); await settle(p); await has(p, /Lift[\s\S]*Working/); });
  await check('add generator + battery', async () => {
    for (const [n, k, w] of [['Generator', 'generator', ''], ['Generator battery', 'battery', '2027-03-01']]) { await p.fill('#an', n); await p.selectOption('#ak', k); if (w) await p.fill('#aw', w); await p.click('#asv'); await settle(p); }
    await has(p, /Generator battery/); });
  await check('add service record with next due date', async () => {
    const lift = p.locator('#m > .card').filter({ has: p.locator('b', { hasText: /^Lift$/ }) });
    await lift.locator('[data-sadd]').click(); await p.waitForSelector('.modal #sd'); await p.fill('.modal #sb', 'Otis technician'); await p.fill('.modal #sc', '2500'); await p.fill('.modal #sx', 'Monthly service, ropes oiled'); await p.fill('.modal #sn', '2026-11-10');
    await p.click('.modal #sho'); await settle(p); const l2 = p.locator('#m > .card').filter({ has: p.locator('b', { hasText: /^Lift$/ }) }); await l2.locator('details.rec summary').click();
    const t = await l2.innerText(); if (!/ropes oiled/.test(t) || !/₹2,500/.test(t)) throw new Error(t); });
  await check('edit asset to Under repair', async () => {
    const gen = p.locator('.card', { hasText: /^[\s\S]*Generator\s+Working/ }).filter({ hasNotText: 'battery' }).first();
    const g = p.locator('#m > .card').filter({ has: p.locator('b', { hasText: /^Generator$/ }) });
    await g.locator('[data-aed]').click(); await p.waitForSelector('.modal #ast'); await p.selectOption('.modal #ast', 'repair'); await p.click('.modal #sho'); await settle(p);
    if ((await p.locator('.modal').count())) throw new Error('form still open: ' + await p.locator('#sherr').innerText());
    const t = await p.locator('#m > .card').filter({ has: p.locator('b', { hasText: /^Generator$/ }) }).innerText(); if (!/Under repair/.test(t)) throw new Error(t); });
  await check('assets page fits the phone screen', () => noHScroll(p));
  await shot(p, 'assets-secretary');
  await go(p, 'rem');
  await check('reminder created from the service record', () => has(p, /Service due: Lift/));
  await check('preset: lift servicing monthly, overdue', async () => {
    await p.click('[data-pre="0"]'); const d = new Date(); d.setDate(d.getDate() - 3); await p.fill('#rd', d.toISOString().slice(0, 10)); await p.click('#rsv'); await settle(p);
    const late = await p.locator('h2:has-text("Overdue") + .card').innerText(); if (!/Lift servicing/.test(late) || !/late/.test(late)) throw new Error(late); });
  await check('warranties listed from assets', () => has(p, /Warranties[\s\S]*Lift[\s\S]*Ends/));
  await shot(p, 'reminders');
  await check('mark done with service history -> next month scheduled', async () => {
    await p.locator('h2:has-text("Overdue") + .card [data-rdone]').first().click(); await p.waitForSelector('.modal #rdd'); await p.fill('.modal #sb', 'Otis'); await p.click('.modal #sho'); await settle(p);
    await p.waitForTimeout(400); await go(p, 'rem');
    const late = await p.locator('h2:has-text("Overdue") + .card').innerText(); if (/Lift servicing/.test(late)) throw new Error('still overdue');
    await has(p, /Upcoming[\s\S]*Lift servicing/); await has(p, /Completed[\s\S]*Lift servicing/); });
  await check('home shows reminders card for committee', async () => { await go(p, 'dash'); await has(p, /Service reminders/); });

  await go(p, 'meet');
  await check('page title renamed', async () => { const t = await p.locator('nav button.on').innerText(); if (!/^\s*Meeting\s*$/.test(t)) throw new Error(t); });
  await check('add meeting with agenda', async () => {
    await p.fill('#mt', 'Annual General Meeting'); await p.fill('#md', '2026-10-25'); await p.fill('#mp', 'Terrace'); await p.fill('#mag', '1. Accounts 2025-26\n2. Lift AMC renewal'); await p.click('#ms'); await settle(p);
    await has(p, /Annual General Meeting[\s\S]*Draft[\s\S]*Lift AMC renewal/); });
  await check('record attendance, minutes, resolutions', async () => {
    await p.click('[data-med]'); await p.waitForSelector('.modal #emi');
    for (const f of ['101', '102', '201', '301']) await p.check(`.modal #eat input[value="${f}"]`);
    await p.fill('.modal #eo', 'President, Secretary, Treasurer'); await p.fill('.modal #emi', 'Accounts were read and approved.'); await p.fill('.modal #ers', 'Renew lift AMC with Otis\nPaint the compound wall');
    await p.click('.modal #sho'); await settle(p); await p.locator('details.rec summary', { hasText: 'Meeting record' }).first().click();
    await has(p, /4 of 10 flats/); await has(p, /Paint the compound wall/); });
  await check('add action item', async () => {
    await p.locator('details.rec summary', { hasText: 'Add action item' }).first().click(); const id = await p.locator('[data-aiadd]').first().getAttribute('data-aiadd');
    await p.fill('#ait' + id, 'Collect 3 AMC quotes'); await p.fill('#aio' + id, 'Treasurer'); await p.fill('#aid' + id, '2026-11-01'); await p.click(`[data-aiadd="${id}"]`); await settle(p);
    await has(p, /Open action items · 1[\s\S]*Collect 3 AMC quotes/); });
  await check('meeting page fits the phone screen', () => noHScroll(p));
  await shot(p, 'meeting-secretary');

  await go(p, 'sos');
  await check('national numbers shown as big call buttons', async () => { const n = await p.locator('.sosg a[href^="tel:"]').count(); if (n < 3) throw new Error('only ' + n); });
  await check('add lift technician (verified)', async () => {
    await p.selectOption('#cc', 'lift'); await p.fill('#cnm', 'Ramesh (Otis)'); await p.fill('#cph1', '98480 22222'); await p.click('#csv'); await settle(p);
    await has(p, /Verified[^|]*\n*Ramesh \(Otis\)/); const href = await p.locator('.card', { hasText: 'Ramesh (Otis)' }).locator('a.call').first().getAttribute('href'); if (href !== 'tel:9848022222') throw new Error(href); });
  for (const [c, n, ph] of [['electrician', 'Srinu Electricals', '9000011111'], ['plumber', 'Raju Plumber', '9000022222'], ['generator', 'Kirloskar Service', '9000033333'], ['security', 'Watchman Venkat', '9000044444']]) {
    await p.selectOption('#cc', c); await p.fill('#cnm', n); await p.fill('#cph1', ph); await p.click('#csv'); await settle(p); }
  await check('all categories listed', () => has(p, /Electrician[\s\S]*Plumber[\s\S]*Security/));
  await shot(p, 'contacts-secretary');
  await check('no script errors (secretary)', async () => { if (p.errors.length) throw new Error(p.errors.join(' || ')); });

  /* ---------- executive (watchman duty): visitor register ---------- */
  const E = await session(browser, 'executive', DEV), e = E.page;
  await check('executive does not see Audit log', async () => { const t = await e.locator('nav').innerText(); if (t.includes('Audit log')) throw new Error('visible'); });
  await go(e, 'vis');
  await check('record two visitors', async () => {
    await e.fill('#vnm', 'Courier Ravi'); await e.selectOption('#vfl', '101'); await e.fill('#vpu', 'Delivery / courier'); await e.fill('#vph', '99999 11111'); await e.click('#vsv'); await settle(e);
    await e.fill('#vnm', 'Plumber Suresh'); await e.selectOption('#vfl', '102'); await e.fill('#vpu', 'Service / repair'); await e.click('#vsv'); await settle(e);
    await has(e, /Inside now · 2/); });
  await check('record a visitor with entry and exit time', async () => {
    await e.fill('#vnm', 'Guest Lakshmi'); await e.selectOption('#vfl', '201'); await e.fill('#vin', '09:00'); await e.fill('#vout', '09:45'); await e.click('#vsv'); await settle(e);
    await has(e, /Inside now · 2/); const t = await e.locator('.tbl').first().innerText(); if (!/Lakshmi/.test(t) || !/9:00 AM – 9:45 AM/.test(t)) throw new Error(t.slice(0, 300)); });
  await check('exit before entry is refused', async () => { await e.fill('#vnm', 'X'); await e.fill('#vin', '10:00'); await e.fill('#vout', '09:00'); await e.click('#vsv'); await e.waitForTimeout(300); if (/\bX\b/.test(await e.locator('.tbl').first().innerText())) throw new Error('saved'); await e.fill('#vnm', ''); await e.fill('#vout', ''); });
  await check('mark exit', async () => { await e.locator('h2:has-text("Inside now") + .card [data-vout]').first().click(); await settle(e); await has(e, /Inside now · 1/); });
  await check('old-style count still adds to totals', async () => { await e.fill('#vn', '10'); await e.click('#vs'); await settle(e); const t = await e.locator('.tiles').first().innerText(); if (!/13\s*Today/.test(t)) throw new Error(t); });
  await check('filter by flat', async () => { await e.selectOption('#vffl', '102'); await e.click('#vfgo'); await e.waitForTimeout(300); const t = await e.locator('.tbl').first().innerText(); if (!/Suresh/.test(t) || /Ravi/.test(t)) throw new Error(t); });
  await check('visitor page fits the phone screen', () => noHScroll(e));
  await shot(e, 'visitors-executive');
  await check('executive sees the document upload boxes but no Delete', async () => { await go(e, 'doc'); if (!(await e.locator('#ps').count()) || !(await e.locator('#gs').count())) throw new Error('no upload'); if (await e.locator('[data-gx]').count()) throw new Error('delete visible'); });
  await check('executive cannot edit contacts', async () => { await go(e, 'sos'); if (await e.locator('#csv').count()) throw new Error('form visible'); });
  await check('no script errors (executive)', async () => { if (e.errors.length) throw new Error(e.errors.join(' || ')); });

  /* ---------- resident 101: complaint with asset link ---------- */
  const R = await session(browser, '101', DEV), r = R.page;
  await check('resident menu: no Reminders, no Audit log', async () => { const t = await r.locator('nav').innerText(); if (/Reminders|Audit log/.test(t)) throw new Error(t); });
  await go(r, 'comp');
  await check('raise complaint linked to the lift, ticket number shown', async () => {
    await r.fill('#ct', 'Lift making noise'); await r.fill('#cd', 'Grinding sound near 3rd floor'); const liftOpt = await r.locator('#cas option', { hasText: 'Lift' }).first().getAttribute('value'); await r.selectOption('#cas', liftOpt);
    await r.click('#cs'); await settle(r); await r.waitForTimeout(400); await go(r, 'comp'); await has(r, /KK-\d{4}-0001[\s\S]*Lift making noise[\s\S]*Related to\s*Lift/); });
  await check('resident cannot update status', async () => { if (await r.locator('[data-cu]').count()) throw new Error('button visible'); });
  await go(r, 'meet');
  await check('resident sees agenda, not the draft minutes', async () => { await has(r, /Lift AMC renewal/); await hasNot(r, /Accounts were read/); await hasNot(r, /Collect 3 AMC quotes/); });
  await go(r, 'vis');
  await check('resident sees only visitors to own flat, no phone', async () => { await has(r, /Courier Ravi/); await hasNot(r, /Suresh/); await hasNot(r, /99999/); });
  await go(r, 'assets');
  await check('resident sees assets and history but no costs', async () => { await has(r, /Lift/); await r.locator('#m > .card').filter({ has: r.locator('b', { hasText: /^Lift$/ }) }).locator('details.rec summary').click(); await has(r, /ropes oiled/); await hasNot(r, /₹2,500/); if (await r.locator('#asv').count()) throw new Error('add form visible'); });
  await go(r, 'sos');
  await check('resident has one-tap call buttons', async () => { const n = await r.locator('a.call[href^="tel:"]').count(); if (n < 5) throw new Error('only ' + n); });
  await shot(r, 'contacts-resident');

  /* ---------- secretary: work the complaint, publish the meeting ---------- */
  await p.evaluate(() => { SNAP = null; DIRTY = true; dropCache(); }); await go(p, 'comp');
  await check('secretary assigns + In progress with note', async () => {
    await p.click('[data-cu]'); await p.waitForSelector('.modal #cus'); await p.selectOption('.modal #cus', 'in_progress'); await p.fill('.modal #cua', 'Ramesh (Otis)'); await p.fill('.modal #cue', '2026-10-12'); await p.fill('.modal #cun', 'Technician visiting tomorrow');
    G.pushes.length = 0; await p.click('.modal #sho'); await settle(p); await p.waitForTimeout(1800);
    await has(p, /Assigned to\s*Ramesh \(Otis\)/); await has(p, /In progress/); });
  await check('resident was sent an alert', async () => { G.x.keepWarm(); const ok = G.pushes.some(x => /Complaint KK-/.test(x.t) && x.to && x.to.user === '101'); if (!ok) throw new Error(JSON.stringify(G.pushes)); });
  await check('status filter chips', async () => { await go(p, 'comp'); await p.click('[data-cf="resolved"]'); await p.waitForTimeout(300); await has(p, /No complaints match/); await p.click('[data-cf="all"]'); });
  await shot(p, 'complaints-secretary');
  await go(p, 'meet');
  await check('publish meeting record', async () => { await p.click('[data-mpub]'); await settle(p); await has(p, /Published/); });
  await check('resident now sees minutes and action items', async () => { await go(r, 'dash'); await r.evaluate(() => { SNAP = null; DIRTY = true; dropCache(); }); await go(r, 'meet'); await r.locator('details.rec summary', { hasText: 'Meeting record' }).first().click(); await has(r, /Accounts were read/); await has(r, /Collect 3 AMC quotes/); });
  await check('resident sees complaint history after update', async () => { await go(r, 'comp'); await r.locator('details.rec summary').first().click(); await has(r, /Technician visiting tomorrow/); await has(r, /Assigned to\s*Ramesh/); });
  await shot(r, 'complaints-resident');
  await check('no script errors (resident)', async () => { if (r.errors.length) throw new Error(r.errors.join(' || ')); });

  /* ---------- treasurer: money entries, then admin reads the audit log ---------- */
  const T = await session(browser, 'treasurer', DEV), tr = T.page;
  await go(tr, 'exp');
  await check('treasurer adds an expense', async () => { await tr.fill('#ea', '2500'); await tr.fill('#edt', 'Lift service charges'); await tr.click('#es'); await settle(tr); await has(tr, /Lift service charges/); });
  await check('treasurer deletes it', async () => { await tr.click('[data-d]'); await settle(tr); await hasNot(tr, /Lift service charges/); });
  const A = await session(browser, 'president', DEV), ad = A.page;
  await go(ad, 'audit');
  await check('audit log lists add and delete by treasurer', async () => { await ad.waitForSelector('#aout .it'); await ad.selectOption('#af1', 'expenses'); await ad.click('#ago'); await ad.waitForTimeout(500);
    const t = await ad.locator('#aout').innerText(); if (!/Deleted[\s\S]*Treasurer|Treasurer[\s\S]*Deleted/.test(t) || !/Added/.test(t)) throw new Error(t.slice(0, 300)); });
  await check('audit filter by person', async () => { await ad.selectOption('#af1', ''); await ad.selectOption('#af3', 'secretary'); await ad.click('#ago'); await ad.waitForTimeout(500); const t = await ad.locator('#aout .card').innerText(); if (/Treasurer/.test(t) || !/Secretary/.test(t)) throw new Error(t.slice(0, 200)); });
  await check('audit page fits the phone screen', () => noHScroll(ad));
  await shot(ad, 'audit-admin');
  await go(ad, 'doc');
  await check('documents: committee-only option present', async () => { const o = await ad.locator('#pvi option').allInnerTexts(); if (!o.some(x => /Committee only/.test(x))) throw new Error(o); });
  await check('no script errors (treasurer/admin)', async () => { if (tr.errors.length || ad.errors.length) throw new Error(tr.errors.concat(ad.errors).join(' || ')); });

  /* ---------- every existing page still opens ---------- */
  for (const t of ['dash', 'work', 'maint', 'exp', 'st', 'cel', 'vis', 'doc', 'not', 'comp', 'meet', 'poll', 'assets', 'rem', 'sos', 'audit']) {
    await check('admin page opens: ' + t, async () => { await go(ad, t); const x = await txt(ad); if (/Could not load this page/.test(x)) throw new Error(x.slice(0, 200)); await noHScroll(ad); });
  }
  await check('no script errors on any page', async () => { if (ad.errors.length) throw new Error(ad.errors.join(' || ')); });
  await ad.evaluate(() => localStorage.setItem('kk_lang', 'te')); await ad.reload(); await ad.waitForSelector('nav button[data-t]');
  for (const t of ['assets', 'rem', 'meet', 'sos', 'vis', 'comp', 'audit']) {
    await check('Telugu page opens: ' + t, async () => { await go(ad, t); const x = await txt(ad); if (/Could not load this page/.test(x)) throw new Error(x.slice(0, 200)); if (!/[\u0C00-\u0C7F]/.test(x)) throw new Error('no Telugu'); await noHScroll(ad); });
  }
  await go(ad, 'meet'); await shot(ad, 'meeting-telugu'); await go(ad, 'rem'); await shot(ad, 'reminders-telugu');
  await check('no script errors in Telugu', async () => { if (ad.errors.length) throw new Error(ad.errors.join(' || ')); });

  const f = results.filter(x => !x.ok).length; console.log('\n' + (results.length - f) + ' passed, ' + f + ' failed');
  await browser.close(); srv.close(); process.exit(f ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
