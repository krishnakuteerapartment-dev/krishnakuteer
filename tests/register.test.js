/* Visitor register photo import (Secretary): Code.gs against the in-memory Sheet, with Google's Gemini reader replaced by a stand-in.
   Run: node tests/register.test.js apps-script/Code.gs */
const { create } = require('./gas');
const assert = require('assert');
const G = create({ file: process.argv[2] });
G.x.setup(); G.x.addCommittee();
G.sheets.users.rows.forEach((r, i) => { if (i && ['secretary', 'treasurer', 'executive', 'president', 'watchman'].includes(r[0])) r[3] = 'pw-' + r[0]; });
let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + e.message); } };
const login = (u, p) => { const r = G.call({ a: 'login', u, p }); assert(r.token, 'login failed for ' + u); return r.token; };
const tok = { sec: login('secretary', 'pw-secretary'), tre: login('treasurer', 'pw-treasurer'), admin: login('1234', '987654'), f101: login('101', '123456'), gate: login('watchman', 'pw-watchman') };
const C = (k, body) => G.call(Object.assign({ token: tok[k] }, body));
const ok = r => { assert(r.ok, 'expected ok, got ' + JSON.stringify(r.error)); return r; };
const no = (r, rx) => { assert(r.error, 'expected an error, got ' + JSON.stringify(r).slice(0, 200)); if (rx) assert(rx.test(r.error.message), 'wrong error: ' + r.error.message); };
const today = G.run('today_()'), y = today.slice(0, 4);
const IMG = 'data:image/jpeg;base64,' + Buffer.from('fake jpeg bytes').toString('base64');

/* the stand-in for Gemini: answers with whatever READ holds */
let READ = null, CALLS = [], HTTP = 200;
G.ctx.UrlFetchApp.fetch = (url, o) => { CALLS.push({ url, o }); return { getResponseCode: () => HTTP, getContentText: () => HTTP !== 200 ? '{"error":{}}' : JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(READ) }] } }] }) }; };
const row = o => Object.assign({ serial: '', date: '', date_iso: '', name: '', flat: '', purpose: '', phone: '', in_time: '', out_time: '', remarks: '', unsure: [], unclear: [] }, o);
const d1 = y + '-01-05', d2 = y + '-01-06';
READ = { readable: true, problem: '', rows: [
  row({ serial: '1', date: '5/1/' + y, date_iso: d1, name: 'Ramesh Kumar', flat: '101', purpose: 'Delivery', phone: '9876543210', in_time: '10:30', out_time: '10:45' }),
  row({ serial: '2', date: '"', date_iso: d1, name: 'Sita', flat: 'F-202', purpose: 'Guest', phone: '98765', in_time: '11.15am', out_time: '', unsure: ['phone'] }),
  row({ serial: '3', date: '6/1', date_iso: d2, name: '', flat: '9Z', purpose: 'Plumber', phone: '', in_time: '2:10pm', out_time: '3 pm', unclear: ['name'] }),
  row({ serial: '4', date: '31/2/' + y, date_iso: '', name: 'Gopal', flat: '501', purpose: 'Cab', phone: '', in_time: '', out_time: '', remarks: 'waited outside' })] };

const GOOD = JSON.parse(JSON.stringify(READ));
let photo, imp, rows;
console.log('Permissions');
t('treasurer cannot upload a register photo', () => no(C('tre', { a: 'upload', kind: 'register', img: IMG }), /permission/));
t('resident cannot upload a register photo', () => no(C('f101', { a: 'upload', kind: 'register', img: IMG }), /permission/));
t('secretary uploads the register photo', () => { photo = ok(C('sec', { a: 'upload', kind: 'register', img: IMG })).id; });
t('a PDF is refused as a register photo', () => no(C('sec', { a: 'upload', kind: 'register', img: 'data:application/pdf;base64,AAAA' }), /photo/));
t('admin cannot read a register photo', () => no(C('admin', { a: 'registerScan', photo }), /Only the Secretary/));
t('watchman cannot save register entries', () => no(C('gate', { a: 'registerSave', import_id: 1, rows: [{ key: 'r1' }] }), /Only the Secretary/));

console.log('Reading the photo');
t('without GEMINI_KEY: a clear set-up message', () => no(C('sec', { a: 'registerScan', photo }), /GEMINI_KEY/));
G.props.set('GEMINI_KEY', 'test-key');
t('scan reads 4 rows', () => { const r = ok(C('sec', { a: 'registerScan', photo })); imp = r.import_id; rows = r.rows; assert.strictEqual(rows.length, 4); });
t('the photo and key go to Gemini, key in a header (not the URL)', () => { const c = CALLS[CALLS.length - 1]; assert(/generativelanguage/.test(c.url) && !/key=/.test(c.url)); assert.strictEqual(c.o.headers['x-goog-api-key'], 'test-key'); const p = JSON.parse(c.o.payload); assert.strictEqual(p.contents[0].parts[1].inlineData.mimeType, 'image/jpeg'); });
t('row 1 is clean and complete', () => { const r = rows[0]; assert.deepStrictEqual([r.visit_on, r.name, r.flat_no, r.in_time, r.out_time, r.phone, r.flags.length], [d1, 'Ramesh Kumar', '101', '10:30', '10:45', '9876543210', 0]); });
t('row 2: flat F-202 matched, 11.15am -> 11:15, short phone flagged', () => { const r = rows[1]; assert.strictEqual(r.flat_no, '202'); assert.strictEqual(r.in_time, '11:15'); assert(r.flags.includes('phone')); });
t('row 3: unreadable name flagged and left blank; unknown flat left blank and flagged; pm times', () => { const r = rows[2]; assert.strictEqual(r.name, ''); assert(r.flags.includes('name') && r.flags.includes('flat_no')); assert.strictEqual(r.flat_no, ''); assert.strictEqual(r.raw.flat, '9Z'); assert.strictEqual(r.in_time, '14:10'); assert.strictEqual(r.out_time, '15:00'); });
t('row 4: impossible date (31 Feb) left blank and flagged, never guessed', () => { const r = rows[3]; assert.strictEqual(r.visit_on, ''); assert(r.flags.includes('visit_on')); assert.strictEqual(r.remarks, 'waited outside'); });
t('the import is recorded (who, when, photo, status)', () => { const r = G.x.read_('visitor_imports').find(x => +x.id === +imp); assert(r && r.by === 'secretary' && r.photo === photo && r.status === 'read' && +r.found === 4 && +r.unsure === 3); });
t('secretary can view the register photo again', () => ok(C('sec', { a: 'photo', id: photo })));
t('treasurer cannot view the register photo', () => no(C('tre', { a: 'photo', id: photo })));
t('someone else\'s upload id cannot be read', () => { const other = ok(C('tre', { a: 'upload', kind: 'complaint', img: IMG })).id; no(C('sec', { a: 'registerScan', photo: other }), /did not arrive/); });
t('blurry page: plain message, nothing recorded', () => { READ = { readable: false, problem: 'The photo is too blurry.', rows: [] }; const n = G.x.read_('visitor_imports').length; no(C('sec', { a: 'registerScan', photo }), /too blurry/); assert.strictEqual(G.x.read_('visitor_imports').length, n); });
t('daily limit: friendly message', () => { HTTP = 429; no(C('sec', { a: 'registerScan', photo }), /limit/); HTTP = 200; });
t('busy (503): retries, then the lighter model reads it', () => { let n = 0; const f = G.ctx.UrlFetchApp.fetch; READ = GOOD; G.ctx.UrlFetchApp.fetch = (u, o) => { n++; const c = /lite/.test(u) ? 200 : 503, r = f(u, o), body = r.getContentText(); return { getResponseCode: () => c, getContentText: () => c === 200 ? body : '{}' }; };
  const r = ok(C('sec', { a: 'registerScan', photo })); G.ctx.UrlFetchApp.fetch = f; assert.strictEqual(n, 4); assert.strictEqual(r.rows.length, 4); assert(/lite/.test(G.x.read_('visitor_imports').pop().model)); });

console.log('Saving');
const fix = (r, o) => Object.assign({}, r, o);
let res;
t('save: valid rows saved, invalid rows reported, nothing invented', () => {
  res = ok(C('sec', { a: 'registerSave', import_id: imp, rows: [rows[0], fix(rows[1], { phone: '9876501234' }), rows[2], rows[3]] })).results;
  assert.deepStrictEqual(res.map(x => x.status), ['saved', 'saved', 'invalid', 'invalid']);
  assert(/name/.test(res[2].message) && /flat/.test(res[2].message)); assert(/date/.test(res[3].message) && /in-time/.test(res[3].message));
});
t('saved rows are real visitor entries, marked as from the register', () => { const v = G.x.read_('visitors').filter(x => +x.import_id === +imp); assert.strictEqual(v.length, 2); assert(v.every(x => x.status === 'register' && x.added_by === 'secretary' && +x.count === 1)); assert.strictEqual(v[1].phone, '9876501234'); });
t('retrying the same rows never saves twice', () => { const r = ok(C('sec', { a: 'registerSave', import_id: imp, rows: [rows[0], fix(rows[2], { name: 'Plumber Raju', flat_no: '301' })] })).results; assert.deepStrictEqual(r.map(x => x.status), ['saved', 'saved']); assert(r[0].already); assert.strictEqual(G.x.read_('visitors').filter(x => +x.import_id === +imp).length, 3); });
t('import counts updated', () => { const r = G.x.read_('visitor_imports').find(x => +x.id === +imp); assert.strictEqual(+r.saved, 3); });
let imp2;
t('the same page read again: rows already in the register are marked as duplicates', () => { READ = { readable: true, problem: '', rows: GOOD.rows.slice(0, 1) }; const r = ok(C('sec', { a: 'registerScan', photo })); imp2 = r.import_id; assert(r.rows[0].dup); });
t('duplicate is not saved unless confirmed', () => { const r0 = ok(C('sec', { a: 'registerScan', photo })); const r = ok(C('sec', { a: 'registerSave', import_id: r0.import_id, rows: r0.rows })).results; assert.strictEqual(r[0].status, 'duplicate'); });
t('confirmed duplicate ("save anyway") is saved', () => { const r = ok(C('sec', { a: 'registerSave', import_id: imp2, rows: [Object.assign({}, rows[0], { key: 'r1', force: true })] })).results; assert.strictEqual(r[0].status, 'saved'); });
t('two identical rows in one batch: the second is a duplicate', () => { const r0 = ok(C('sec', { a: 'registerScan', photo })); const a = Object.assign({}, rows[0], { key: 'r1', name: 'New Person', in_time: '09:00' }), b = Object.assign({}, a, { key: 'r2' }); const r = ok(C('sec', { a: 'registerSave', import_id: r0.import_id, rows: [a, b] })).results; assert.deepStrictEqual(r.map(x => x.status), ['saved', 'duplicate']); });
t('future date refused', () => { const r0 = ok(C('sec', { a: 'registerScan', photo })); const r = ok(C('sec', { a: 'registerSave', import_id: r0.import_id, rows: [Object.assign({}, rows[0], { key: 'r1', visit_on: '2099-01-01', name: 'Z' })] })).results; assert.strictEqual(r[0].status, 'invalid'); });
t('audit log records the import', () => assert(G.x.read_('audit_log').some(a => /Visitor register photo: \d+ entr/.test(a.summary))));
t('residents see their own flat\'s imported visitors but never phone numbers', () => { const v = G.call({ token: tok.f101, a: 'snapshot' }).data.visitors.filter(x => x.name === 'Ramesh Kumar'); assert(v.length && v.every(x => x.phone === undefined)); });
t('cancel marks an unsaved import as cancelled', () => { const r0 = ok(C('sec', { a: 'registerScan', photo })); ok(C('sec', { a: 'registerCancel', import_id: r0.import_id })); assert.strictEqual(G.x.read_('visitor_imports').find(x => +x.id === +r0.import_id).status, 'cancelled'); });
t('earlier imports listed for the secretary only', () => { const r = ok(C('sec', { a: 'registerImports' })); assert(r.ready && r.imports.length >= 3); no(C('tre', { a: 'registerImports' })); });
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
