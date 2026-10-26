/* Letter pad (Secretary only): backend rules and the screens in a phone-size browser, ending with the printed PDF.
   Run: node tests/e2e-letters.js . outdir [content.json]   (content.json: optional {head, letter} to print a real letter) */
const { chromium, devices } = require('playwright'); const { create } = require('./gas'); const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const REPO = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const REAL = process.argv[4] ? JSON.parse(fs.readFileSync(process.argv[4], 'utf8')) : null;
const G = create({ file: path.join(REPO, 'apps-script/Code.gs') }); G.x.setup(); G.x.addCommittee();
const PASS = { secretary: 'pw-secretary1x', treasurer: 'pw-treasurer1x', '101': '123456x' };
G.sheets.users.rows.forEach((r, i) => { if (i && ['secretary', 'treasurer'].includes(r[0])) r[3] = 'pw-' + r[0] + '1'; });
[['secretary', 'pw-secretary1'], ['treasurer', 'pw-treasurer1'], ['101', '123456']].forEach(([u, p]) => { const t = G.call({ a: 'login', u, p }).token; G.call({ token: t, a: 'pw', password: p + 'x' }); });
G.sheets.users.rows.forEach((r, i) => { if (i) { r[6] = r[0] + '@example.com'; r[7] = 'yes'; } });
const tok = u => G.call({ a: 'login', u, p: PASS[u] }).token;
let ok = 0, bad = 0; const check = async (n, fn) => { try { await fn(); ok++; console.log('  ok   ' + n); } catch (e) { bad++; console.log('  FAIL ' + n + '\n       ' + String(e.message).split('\n')[0]); } };
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || '') + ' got ' + JSON.stringify(a) + ' want ' + JSON.stringify(b)); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, s) => { let p = q.url.split('?')[0]; if (p === '/') p = '/index.html'; const f = path.join(REPO, 'public', p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); s.end(fs.readFileSync(f)); }).listen(8895);
async function session(b, who, dev = devices['Pixel 7']) { const ctx = await b.newContext({ ...dev, serviceWorkers: 'block' }), p = await ctx.newPage(); p.errors = [];
  p.on('pageerror', e => p.errors.push(String(e))); p.on('dialog', d => d.accept());
  await p.addInitScript(() => { window.__prints = 0; window.print = () => { window.__prints++; }; });
  await p.route('https://script.google.com/**', async r => r.fulfill({ contentType: 'application/json', body: G.ctx.doPost({ postData: { contents: r.request().postData() } }).s }));
  await p.route('https://www.gstatic.com/**', r => r.abort());
  await p.goto('http://localhost:8895/'); await p.selectOption('#em', who); await p.fill('#pw', PASS[who]); await p.click('#in'); await p.waitForSelector('nav button[data-t]');
  p.go = async t => { await p.evaluate(t => { tab = t; render(); }, t); await p.waitForFunction(() => !document.querySelector('#m[aria-busy]')); await p.waitForTimeout(300); };
  return p; }
const shot = (p, n, full) => p.screenshot({ path: path.join(OUT, n + '.png'), fullPage: !!full });
const SIGN = path.join(OUT, 'test-sign.png'), STAMP = path.join(OUT, 'test-stamp.png');
const HEAD = REAL ? REAL.head : { bearers: [['PRESIDENT', 'A. PRESIDENT'], ['SECRETARY', 'B. SECRETARY'], ['TREASURER', 'C. TREASURER']], side: [['EXECUTIVE MEMBER', ['D. Executive']], ['MEMBERS', ['E. Member', 'F. Member', 'G. Member']]], signer: 'B. Secretary' };
const LET = REAL ? REAL.letter : { to: 'SKYWARDS ELEVATORS', date: '2026-10-23', subject: 'Request for Quotation for Annual Maintenance Contract (AMC) of Apartment Lift',
  body: 'For and on behalf of the Association, we invite your best written quotation.\n\n**1. LIFT AND SITE DETAILS**\nLift Type: Manual Grill Door Lift\n\n' + Array.from({ length: 14 }, (_, i) => `${i + 2}. Item number ${i + 2}: a long enough sentence so that the letter runs on to the second page of the printout.`).join('\n') };
(async () => {
  /* a test signature: blue ink on white paper */
  { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 400, height: 160 } }); await p.setContent('<body style="margin:0;background:#fff"><div style="font:italic 56px Georgia;color:#1d6fd8;padding:30px 40px">B. Secy</div></body>'); await p.screenshot({ path: SIGN });
    await p.setViewportSize({ width: 300, height: 300 }); await p.setContent('<body style="margin:0;background:#000"><div style="margin:20px;width:256px;height:256px;border-radius:50%;background:#fff;border:10px solid #1a2bb8;box-sizing:border-box;display:grid;place-items:center;font:700 34px Georgia;color:#1a2bb8">STAMP</div></body>'); await p.screenshot({ path: STAMP }); await b.close(); }
  console.log('Backend');
  await check('treasurer cannot use the letter pad', async () => eq(!!G.call({ token: tok('treasurer'), a: 'letters' }).error, true));
  await check('residents cannot save letters', async () => eq(!!G.call({ token: tok('101'), a: 'letterSave', letter: { on_date: '2026-10-23', subject: 'x' } }).error, true));
  await check('the stamp picture is private to the Secretary', async () => { const id = JSON.parse(G.props.get('LETTERHEAD') || '{}').stamp; if (id) eq(!!G.call({ token: tok('treasurer'), a: 'photo', id }).error, true); });
  await check('treasurer cannot upload a signature', async () => eq(!!G.call({ token: tok('treasurer'), a: 'upload', kind: 'letter', img: 'data:image/png;base64,AAAA' }).error, true));
  await check('a letter needs a date', async () => eq(G.call({ token: tok('secretary'), a: 'letterSave', letter: { subject: 'x' } }).error.message, 'Enter the date of the letter.'));

  const b = await chromium.launch();
  console.log('Screens');
  const t = await session(b, 'treasurer');
  await check('no Letter pad in the treasurer menu', async () => eq(await t.locator('nav button[data-t="lp"]').count(), 0));
  const s = await session(b, 'secretary');
  await check('Letter pad in the secretary menu', async () => eq(await s.locator('nav button[data-t="lp"]').innerText(), 'Letter pad'));
  await check('first visit asks to set up the letterhead', async () => { await s.go('lp'); if (!/Set up the letterhead once/.test(await s.locator('#m').innerText())) throw new Error('no setup note'); await shot(s, '01-list-empty'); });
  await check('letterhead details: names, members, signature saved', async () => {
    await s.click('#lphd'); await s.waitForSelector('#lh_t1');
    for (let i = 0; i < HEAD.bearers.length; i++) { await s.fill('#lh_br' + i, HEAD.bearers[i][0]); await s.fill('#lh_bn' + i, HEAD.bearers[i][1]); }
    for (let i = 0; i < HEAD.side.length; i++) { await s.fill('#lh_sh' + i, HEAD.side[i][0]); await s.fill('#lh_sn' + i, HEAD.side[i][1].join('\n')); }
    await s.fill('#lh_sn', HEAD.signer);
    const [fc] = await Promise.all([s.waitForEvent('filechooser'), s.click('#lh_sg')]); await fc.setFiles(REAL && REAL.sign ? REAL.sign : SIGN);
    await s.waitForSelector('.lpimg img.sg');
    const [fc2] = await Promise.all([s.waitForEvent('filechooser'), s.click('#lh_st')]); await fc2.setFiles(REAL && REAL.stamp ? REAL.stamp : STAMP);
    await s.waitForSelector('.lpimg img.stp'); await shot(s, '02-letterhead', true);
    await s.click('#lh_save'); await s.waitForSelector('#lpnew');
    const h = JSON.parse(G.props.get('LETTERHEAD')); eq(h.bearers[1].name, HEAD.bearers[1][1]); eq(h.side[1].names.length, HEAD.side[1][1].length); eq(/^f[0-9a-f]{32}$/.test(h.sign), true); eq(/^f[0-9a-f]{32}$/.test(h.stamp), true); });
  await check('new letter: preview shows the letterhead and the text as typed', async () => {
    await s.click('#lpnew'); await s.waitForSelector('#lf_subject');
    await s.fill('#lf_to_text', LET.to); await s.fill('#lf_on_date', LET.date); await s.fill('#lf_subject', LET.subject); await s.fill('#lf_body', LET.body);
    await s.check('#lf_sign'); eq(await s.isChecked('#lf_stamp'), true); await s.waitForTimeout(600);
    const tx = await s.evaluate(() => document.querySelector('#lpsheet').shadowRoot.textContent);
    [HEAD.bearers[0][1], HEAD.side[1][1][0], LET.subject, 'Yours faithfully,', HEAD.signer].forEach(x => { if (!tx.includes(x)) throw new Error('preview missing ' + x); });
    await shot(s, '03-editor', true); });
  await check('save keeps the letter in the list', async () => { await s.click('#lpsave'); await s.waitForTimeout(400); eq(G.x.read_('letters').length, 1); eq(G.x.read_('letters')[0].subject, LET.subject);
    await s.click('#lpback'); await s.waitForSelector('.lpi'); eq(await s.locator('.lpi').count(), 1); await shot(s, '04-list'); });
  await check('print: the letter on the letterhead, signature and sign-off on the last page', async () => {
    await s.click('[data-lpp]'); await s.waitForFunction(() => window.__prints === 1, null, { timeout: 10000 }); await s.waitForTimeout(400);
    await s.pdf({ path: path.join(OUT, 'letter.pdf'), format: 'A4', preferCSSPageSize: true, printBackground: true });
    const tx = execFileSync('pdftotext', ['-layout', path.join(OUT, 'letter.pdf'), '-']).toString();
    [HEAD.bearers[2][1], HEAD.side[0][1][0], 'Subject:', 'Yours faithfully,', HEAD.signer].forEach(x => { if (!tx.includes(x)) throw new Error('PDF missing ' + x); });
    if (/Letter pad|New letter/.test(tx)) throw new Error('app screen printed'); await s.evaluate(() => dispatchEvent(new Event('afterprint'))); });
  await check('Word: a .docx file with the letterhead, members and letter', async () => {
    const [dl] = await Promise.all([s.waitForEvent('download'), s.click('[data-lpw]')]); const f = path.join(OUT, 'letter.docx'); await dl.saveAs(f);
    if (!/\.docx$/.test(dl.suggestedFilename())) throw new Error(dl.suggestedFilename());
    const x = execFileSync('unzip', ['-p', f, 'word/document.xml']).toString(), h = execFileSync('unzip', ['-p', f, 'word/header1.xml']).toString();
    [LET.subject.slice(0, 30), 'Yours faithfully,', HEAD.side[1][1][0]].forEach(t => { if (!x.includes(t)) throw new Error('docx missing ' + t); });
    if (!h.includes(HEAD.bearers[0][1])) throw new Error('header missing bearer'); if (!x.includes('r:embed="rId20"')) throw new Error('no signature picture'); if (!x.includes('r:embed="rId21"')) throw new Error('no stamp picture'); });
  await check('copy makes a new letter; delete removes it', async () => { await s.click('[data-lpc]'); await s.waitForSelector('#lf_subject'); await s.click('#lpsave'); await s.waitForTimeout(400); eq(G.x.read_('letters').length, 2);
    await s.click('#lpback'); await s.waitForSelector('.lpi'); await s.locator('[data-lpd]').first().click(); await s.waitForTimeout(800); eq(G.x.read_('letters').length, 1); });
  await check('changes are in the audit log', async () => { const a = G.x.read_('audit_log').map(r => r.summary).join(' | '); if (!/Letter: /.test(a) || !/Letterhead details changed/.test(a)) throw new Error(a.slice(0, 200)); });
  await check('no page errors', async () => eq(s.errors, []));
  console.log('Android app');
  const a = await b.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' }), ap = await a.newPage();
  for (const v5 of [true, false]) {
    await ap.addInitScript(v5 => { window.Capacitor = { isNativePlatform: () => true, isPluginAvailable: n => v5 && n === 'KKFiles', Plugins: v5 ? { KKFiles: { save: async o => { window.__saved = o; return { uri: 'content://x' }; } } } : {} }; }, v5);
    await ap.route('https://script.google.com/**', async r => r.fulfill({ contentType: 'application/json', body: G.ctx.doPost({ postData: { contents: r.request().postData() } }).s }));
    await ap.goto('http://localhost:8895/'); await ap.evaluate(() => localStorage.clear()); await ap.reload(); await ap.selectOption('#em', 'secretary'); await ap.fill('#pw', PASS.secretary); await ap.click('#in'); await ap.waitForSelector('nav button[data-t]');
    await ap.evaluate(() => { tab = 'lp'; render(); }); await ap.waitForSelector('[data-lpw]');
    if (v5) await check('app v5: Word file goes to the KKFiles plugin (Downloads)', async () => { await ap.click('[data-lpw]'); await ap.waitForFunction(() => window.__saved, null, { timeout: 10000 });
      const o = await ap.evaluate(() => ({ name: __saved.name, mime: __saved.mime, zip: atob(__saved.data.slice(0, 8)).slice(0, 2) })); eq([/\.docx$/.test(o.name), o.mime, o.zip], [true, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'PK']); });
    else await check('older app: clear message instead of a silent failure', async () => { await ap.click('[data-lpw]'); await ap.waitForFunction(() => /new app version/.test(document.getElementById('toast').textContent), null, { timeout: 10000 }); });
  }
  await a.close();
  const d = await session(b, 'secretary', { viewport: { width: 1280, height: 900 } });
  await check('computer: form and preview side by side', async () => { await d.go('lp'); await d.click('[data-lpo]'); await d.waitForSelector('#lpsheet'); await d.waitForTimeout(800); await shot(d, '05-desktop'); });
  await b.close(); srv.close();
  console.log(`\n${ok} passed, ${bad} failed`); process.exit(bad ? 1 : 0);
})();
