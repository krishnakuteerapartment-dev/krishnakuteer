/* Backend tests: run Code.gs against the in-memory Sheet and check every new feature and permission. */
const { create } = require('./gas');
const assert = require('assert');
const G = create({ file: process.argv[2] });
G.x.setup();
G.x.addCommittee();
/* give every committee ID a known password */
const us = G.sheets.users;
us.rows.forEach((r, i) => { if (i && ['secretary', 'treasurer', 'executive', 'president', 'watchman'].includes(r[0])) r[3] = 'pw-' + r[0]; });
let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + e.message); } };
const login = (u, p) => { const r = G.call({ a: 'login', u, p }); assert(r.token, 'login failed for ' + u + ': ' + JSON.stringify(r.error)); return r.token; };
const tok = { admin: login('1234', '987654'), f101: login('101', '123456'), f102: login('102', '123456'),
  sec: login('secretary', 'pw-secretary'), gate: login('watchman', 'pw-watchman'), tre: login('treasurer', 'pw-treasurer'), exe: login('executive', 'pw-executive'), pre: login('president', 'pw-president') };
const W = (k, t, op, payload, filters, extra) => G.call(Object.assign({ token: tok[k], a: 'write', t, op, payload, filters: filters || [] }, extra || {}));
const snap = k => G.call({ token: tok[k], a: 'snapshot' }).data;
const ok = r => { assert(r.ok, 'expected ok, got ' + JSON.stringify(r.error)); return r; };
const no = (r, rx) => { assert(r.error, 'expected an error'); if (rx) assert(rx.test(r.error.message), 'wrong error: ' + r.error.message); };
const today = G.run('today_()');

console.log('Setup');
t('new tabs exist', () => ['assets', 'asset_service', 'reminders', 'contacts', 'action_items', 'audit_log'].forEach(n => assert(G.sheets[n], n)));
t('emergency numbers seeded', () => { const c = snap('f101').contacts; assert.deepStrictEqual(c.map(x => String(x.phone)), ['101', '108', '100', '112']); });
t('setup is safe to run twice', () => { G.x.setup(); assert.strictEqual(snap('f101').contacts.length, 4); });

console.log('1. Assets & service history');
let liftId, genId;
t('committee adds lift with warranty', () => { liftId = ok(W('sec', 'assets', 'insert', { name: 'Lift', kind: 'lift', installed_on: '2020-01-15', vendor: 'Otis', vendor_phone: '+91 98480 12345', warranty_until: '2027-01-15' })).id; assert(liftId); });
t('generator added', () => { genId = ok(W('admin', 'assets', 'insert', { name: 'Generator', kind: 'generator' })).id; });
t('phone starting with + stays text', () => assert.strictEqual(snap('sec').assets.find(a => a.id === liftId).vendor_phone, '+91 98480 12345'));
t('resident cannot add assets', () => no(W('f101', 'assets', 'insert', { name: 'X' }), /permission/));
t('executive cannot add assets', () => no(W('exe', 'assets', 'insert', { name: 'X' }), /permission/));
t('bad kind rejected', () => no(W('sec', 'assets', 'insert', { name: 'X', kind: 'rocket' }), /Invalid kind/));
t('bad date rejected', () => no(W('sec', 'assets', 'insert', { name: 'X', warranty_until: '15/01/2027' }), /valid date/));
t('executive records a lift service with cost and next due date', () => ok(W('exe', 'asset_service', 'insert', { asset_id: liftId, service_on: today, kind: 'service', done_by: 'Otis', cost: 2500, details: 'Monthly service', next_due: '2099-01-01' })));
t('next due date became a reminder', () => { const r = snap('sec').reminders.find(x => x.due_on === '2099-01-01'); assert(r && String(r.asset_id) === String(liftId) && r.status === 'pending'); });
t('residents see service history but not the cost', () => { const s = snap('f101').asset_service[0]; assert(s && s.details === 'Monthly service' && s.cost === undefined); });
t('committee sees the cost', () => assert.strictEqual(+snap('tre').asset_service[0].cost, 2500));
t('asset with service records cannot be deleted', () => no(W('admin', 'assets', 'delete', null, [['id', liftId]]), /service records/));
t('asset status can be changed', () => { ok(W('pre', 'assets', 'update', { status: 'repair' }, [['id', genId]])); assert.strictEqual(snap('f101').assets.find(a => a.id === genId).status, 'repair'); });

console.log('2. Service reminders');
let remId;
t('monthly lift reminder added (due yesterday = overdue)', () => {
  const y = G.run("addMonths_(today_(),0)"); const d = new Date(y + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - 1);
  remId = ok(W('sec', 'reminders', 'insert', { title: 'Lift servicing', asset_id: liftId, kind: 'service', due_on: d.toISOString().slice(0, 10), repeat_months: 1, notify_days: 7 })).id; });
t('battery warranty reminder (no repeat)', () => ok(W('tre', 'reminders', 'insert', { title: 'Generator battery warranty', asset_id: genId, kind: 'warranty', due_on: '2030-05-01' })));
t('residents get no reminders', () => assert.strictEqual(snap('f101').reminders.length, 0));
t('resident cannot add a reminder', () => no(W('f101', 'reminders', 'insert', { title: 'x', due_on: '2030-01-01' }), /permission/));
t('repeat out of range rejected', () => no(W('sec', 'reminders', 'insert', { title: 'x', due_on: '2030-01-01', repeat_months: 99 }), /0 to 60/));
t('completing via a service record marks it done and schedules next month', () => {
  ok(W('exe', 'asset_service', 'insert', { asset_id: liftId, service_on: today, kind: 'service', details: 'Done', reminder_id: remId }));
  const R = snap('sec').reminders, done = R.find(r => r.id === remId), nxt = R.filter(r => r.title === 'Lift servicing' && r.status === 'pending');
  assert.strictEqual(done.status, 'done'); assert.strictEqual(done.done_on, today);
  assert.strictEqual(nxt.length, 1); assert(nxt[0].due_on > today, 'next due should be in the future: ' + nxt[0].due_on); });
t('marking a plain reminder done works', () => {
  const id = ok(W('sec', 'reminders', 'insert', { title: 'Water tank cleaning', due_on: '2031-01-01' })).id;
  ok(W('exe', 'reminders', 'update', { status: 'done' }, [['id', id]]));
  assert.strictEqual(snap('sec').reminders.find(r => r.id === id).status, 'done'); });
t('daily alert goes only to committee phones', () => {
  const d = new Date(today + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 7);
  ok(W('sec', 'reminders', 'insert', { title: 'Generator service', asset_id: genId, due_on: d.toISOString().slice(0, 10) }));
  G.pushes.length = 0; G.props.delete('REM_DAY');
  const r = G.x.dailyReminders_(true);
  const p = G.pushes.find(x => /Service reminders/.test(x.t));
  assert(p, 'no reminder push: ' + JSON.stringify(r) + JSON.stringify(G.x.dueItems_(today)));
  assert(p.to && p.to.roles && !p.to.roles.includes('resident')); });
t('daily alert sends once a day', () => { G.pushes.length = 0; G.props.set('REM_DAY', G.run("Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd')")); G.x.dailyReminders_(); assert.strictEqual(G.pushes.length, 0); });

console.log('3. Meeting management');
let mId;
t('secretary adds meeting with agenda', () => { mId = ok(W('sec', 'meetings', 'insert', { title: 'AGM 2026', on_date: '2026-10-20', at_time: '6:00 PM', place: 'Terrace', kind: 'meeting', agenda: '1. Accounts\n2. Lift AMC' })).id; });
t('new meeting starts as draft', () => assert.strictEqual(snap('sec').meetings.find(m => m.id === mId).status, 'draft'));
t('secretary records attendance, minutes, resolutions', () => ok(W('sec', 'meetings', 'update', { attendance: '101|102| 201 |', attendees_other: 'President, Secretary', minutes: 'Accounts read.', resolutions: 'Renew lift AMC' }, [['id', mId]])));
t('attendance list is cleaned', () => assert.strictEqual(snap('sec').meetings.find(m => m.id === mId).attendance, '101|102|201'));
t('action item added', () => ok(W('sec', 'action_items', 'insert', { meeting_id: mId, task: 'Get 3 AMC quotes', owner: 'Treasurer', due_on: '2026-11-01' })));
t('action item for unknown meeting rejected', () => no(W('sec', 'action_items', 'insert', { meeting_id: 999, task: 'x' }), /not found/));
t('residents see agenda but not draft minutes or action items', () => { const s = snap('f101'), m = s.meetings.find(x => x.id === mId); assert.strictEqual(m.agenda, '1. Accounts\n2. Lift AMC'); assert.strictEqual(m.minutes, undefined); assert.strictEqual(m.attendance, undefined); assert.strictEqual(s.action_items.length, 0); });
t('treasurer updates action item status (done date set)', () => { const a = snap('tre').action_items[0]; ok(W('tre', 'action_items', 'update', { status: 'done' }, [['id', a.id]])); const b = snap('tre').action_items[0]; assert.strictEqual(b.status, 'done'); assert.strictEqual(b.done_on, today); });
t('resident cannot change an action item', () => no(W('f101', 'action_items', 'update', { status: 'open' }, [['id', 1]]), /permission/));
t('publishing alerts everyone and shows the record to residents', () => {
  G.pushes.length = 0; ok(W('sec', 'meetings', 'update', { status: 'published' }, [['id', mId]])); G.call({ token: tok.sec, a: 'after' });
  assert(G.pushes.some(p => /published/.test(p.t) && !p.to));
  const s = snap('f101'), m = s.meetings.find(x => x.id === mId); assert.strictEqual(m.minutes, 'Accounts read.'); assert.strictEqual(s.action_items.length, 1); assert(m.published_on); });
t('deleting a meeting removes its action items', () => { const id = ok(W('sec', 'meetings', 'insert', { title: 'Temp', on_date: '2026-12-01', kind: 'meeting' })).id; ok(W('sec', 'action_items', 'insert', { meeting_id: id, task: 'x' }));
  ok(W('sec', 'meetings', 'delete', null, [['id', id]])); assert(!snap('sec').action_items.some(a => String(a.meeting_id) === String(id))); });
t('resident cannot publish/edit meetings', () => no(W('f101', 'meetings', 'update', { minutes: 'hack' }, [['id', mId]]), /permission/));

console.log('4. Emergency contacts');
let cId;
t('treasurer adds verified lift technician', () => { cId = ok(W('tre', 'contacts', 'insert', { category: 'lift', name: 'Ramesh (Otis)', phone: '98480 22222', verified: true })).id; const c = snap('f101').contacts.find(x => x.id === cId); assert.strictEqual(c.verified_on, today); assert.strictEqual(c.updated_by, 'treasurer'); });
t('bad phone rejected', () => no(W('tre', 'contacts', 'insert', { name: 'X', phone: 'call me' }), /valid phone/));
t('resident cannot edit contacts', () => no(W('f101', 'contacts', 'update', { phone: '1' }, [['id', cId]]), /permission/));
t('contact updated', () => { ok(W('sec', 'contacts', 'update', { phone: '98480 33333' }, [['id', cId]])); assert.strictEqual(snap('f102').contacts.find(x => x.id === cId).phone, '98480 33333'); });

console.log('5. Visitor register');
t('old count-only entry still works', () => ok(W('exe', 'visitors', 'insert', { visit_on: today, count: 12 })));
t('detailed visitor entry for flat 101', () => ok(W('exe', 'visitors', 'insert', { visit_on: today, name: 'Courier Ravi', flat_no: '101', purpose: 'Delivery', in_time: '10:15', phone: '99999 11111' })));
t('detailed visitor for flat 102', () => ok(W('exe', 'visitors', 'insert', { visit_on: today, name: 'Plumber Suresh', flat_no: '102', purpose: 'Repair', in_time: '11:00' })));
t('detailed entry needs the flat', () => no(W('exe', 'visitors', 'insert', { visit_on: today, name: 'X', in_time: '10:00' }), /flat/));
t('bad time rejected', () => no(W('exe', 'visitors', 'insert', { visit_on: today, name: 'X', flat_no: '101', in_time: '25:00' }), /time/));
t('exit time recorded', () => { const v = snap('exe').visitors.find(x => x.name === 'Courier Ravi'); ok(W('exe', 'visitors', 'update', { out_time: '10:40' }, [['id', v.id]])); assert.strictEqual(snap('exe').visitors.find(x => x.id === v.id).out_time, '10:40'); });
t('totals preserved (12 + 1 + 1)', () => assert.strictEqual(snap('f101').visitors.reduce((a, v) => a + +v.count, 0), 14));
t('flat 101 sees own visitor details, not phone; other flat visitor hidden', () => { const V = snap('f101').visitors, mine = V.find(v => v.name === 'Courier Ravi'); assert(mine && mine.purpose === 'Delivery' && mine.phone === undefined); assert(!V.some(v => v.name === 'Plumber Suresh')); });
t('committee sees phone', () => assert.strictEqual(snap('sec').visitors.find(v => v.name === 'Courier Ravi').phone, '99999 11111'));
t('resident cannot add visitor counts', () => no(W('f101', 'visitors', 'insert', { visit_on: today, count: 1 }), /permission|name/));

console.log('6. Complaint tracking');
let c1;
t('resident raises complaint linked to lift, gets ticket number', () => { ok(W('f101', 'complaints', 'insert', { title: 'Lift stuck', details: 'Between 2nd and 3rd floor', asset_id: liftId, assigned_to: 'me' })); const c = snap('f101').complaints[0]; c1 = c.id;
  assert(/^KK-\d{4}-0001$/.test(c.ticket_no), c.ticket_no); assert.strictEqual(String(c.asset_id), String(liftId)); assert(!c.assigned_to, 'resident must not assign'); assert.strictEqual(JSON.parse(c.history).length, 1); });
t('new complaint alerts only president, secretary, treasurer', () => { G.pushes.length = 0; ok(W('f102', 'complaints', 'insert', { title: 'Alert test' })); G.call({ token: tok.f102, a: 'after' });
  const p = G.pushes.find(x => /Alert test/.test(x.b)); assert(p && /Flat 102: Alert test/.test(p.b), JSON.stringify(G.pushes)); assert.deepStrictEqual(p.to.roles, ['president', 'secretary', 'treasurer']); });
t('second ticket number increments', () => { ok(W('f102', 'complaints', 'insert', { title: 'Tap leaking' })); assert(/-0003$/.test(snap('f102').complaints.find(c => c.title === 'Tap leaking').ticket_no)); });
t('flat 102 cannot see flat 101 complaint', () => assert(!snap('f102').complaints.some(c => c.id === c1)));
t('secretary assigns, sets expected date, moves to In progress; resident alerted', () => {
  G.pushes.length = 0;
  ok(W('sec', 'complaints', 'update', { status: 'in_progress', assigned_to: 'Ramesh (Otis)', expected_on: '2026-10-12', note: 'Technician called' }, [['id', c1]]));
  G.call({ token: tok.sec, a: 'after' });
  const c = snap('f101').complaints.find(x => x.id === c1), h = JSON.parse(c.history);
  assert.strictEqual(c.status, 'in_progress'); assert.strictEqual(c.assigned_to, 'Ramesh (Otis)'); assert.strictEqual(h.length, 2); assert.strictEqual(h[1].note, 'Technician called');
  const p = G.pushes.find(x => /Complaint/.test(x.t)); assert(p && p.to && p.to.user === '101', JSON.stringify(G.pushes)); });
t('resolve adds history', () => { ok(W('pre', 'complaints', 'update', { status: 'resolved' }, [['id', c1]])); assert.strictEqual(JSON.parse(snap('f101').complaints.find(x => x.id === c1).history).length, 3); });
t('resident cannot change status', () => no(W('f101', 'complaints', 'update', { status: 'resolved' }, [['id', c1]]), /permission/));
t('invalid status rejected', () => no(W('sec', 'complaints', 'update', { status: 'closed' }, [['id', c1]]), /Invalid status/));
t('resident cannot set ticket number', () => { ok(W('f102', 'complaints', 'insert', { title: 'T', ticket_no: 'FAKE' })); assert(!snap('f102').complaints.some(c => c.ticket_no === 'FAKE')); });

console.log('7. Security & audit');
t('payment by treasurer is audited', () => { ok(W('tre', 'payments', 'insert', { flat_id: 1, month: '2026-10-01', amount: 1000, paid_on: today, mode: 'upi', reference: 'UPI123', remarks: 'on time' }));
  const a = G.call({ token: tok.admin, a: 'audit', tbl: 'payments' }).rows; assert(a.length === 1 && a[0].username === 'treasurer' && a[0].action === 'insert' && /Flat 101/.test(a[0].summary), JSON.stringify(a)); });
t('expense added and deleted: both in the log with time', () => { ok(W('sec', 'expenses', 'insert', { spent_on: today, category: 'Lift', amount: 2500, mode: 'cash', description: 'Lift service' }));
  const e = snap('admin').expenses[0]; ok(W('admin', 'expenses', 'delete', null, [['id', e.id]]));
  const a = G.call({ token: tok.pre, a: 'audit', tbl: 'expenses' }).rows; assert.deepStrictEqual(a.map(x => x.action), ['delete', 'insert']); assert(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(a[0].at)); assert(JSON.parse(a[0].before).amount === 2500); });
t('residents and executive cannot read the audit log', () => { no(G.call({ token: tok.f101, a: 'audit' }), /permission/); no(G.call({ token: tok.exe, a: 'audit' }), /permission/); });
t('nobody can write to the audit log', () => no(W('admin', 'audit_log', 'insert', { summary: 'x' }), /permission/));
t('votes are never logged (anonymous)', () => { ok(W('sec', 'polls', 'insert', { question: 'Paint?', options: 'Yes|No' })); const p = snap('f101').polls[0]; ok(W('f101', 'votes', 'insert', { poll_id: p.id, choice: 'Yes' }));
  assert(!G.call({ token: tok.admin, a: 'audit' }).rows.some(r => r.tbl === 'votes')); });
t('visitor log entries hold no names or phones', () => { const a = G.call({ token: tok.admin, a: 'audit', tbl: 'visitors' }).rows; assert(a.length); a.forEach(r => assert(!/Ravi|99999|Delivery/.test(JSON.stringify(r)), JSON.stringify(r))); });
t('residents do not receive other flats\' payment references', () => { ok(W('tre', 'payments', 'insert', { flat_id: 2, month: '2026-10-01', amount: 1000, paid_on: today, mode: 'bank', reference: 'NEFT999' }));
  const P = snap('f101').payments, mine = P.find(p => p.flat_id === 1), other = P.find(p => p.flat_id === 2);
  assert.strictEqual(mine.reference, 'UPI123'); assert.strictEqual(other.reference, undefined); assert.strictEqual(other.receipt_no, undefined); assert.strictEqual(+other.amount, 1000); });
t('residents get no balance', () => assert.strictEqual(snap('f101').balance.length, 0));
t('committee-only document hidden from residents and its file refused', () => {
  const cache = G.ctx.CacheService.getScriptCache(); const fid = 'f' + '0'.repeat(32); cache.put('up_' + fid, 'secretary');
  G.sheets.file_data.appendRow([fid, 1, 'image/png', 'iVBORw0KGgo=']);
  ok(W('sec', 'gallery', 'insert', { title: 'Bank statement', photo: fid, kind: 'photo', folder: 'Association', visibility: 'committee' }));
  assert(!snap('f101').gallery.some(g => g.photo === fid)); assert(snap('tre').gallery.some(g => g.photo === fid));
  no(G.call({ token: tok.f101, a: 'photo', id: fid })); assert(G.call({ token: tok.tre, a: 'photo', id: fid }).ok); });
t('document upload alerts everyone, once per batch; committee-only alerts committee', () => {
  const cache = G.ctx.CacheService.getScriptCache(), up = n => { const id = 'f' + String(n).repeat(32).slice(0, 32); cache.put('up_' + id, 'secretary'); G.sheets.file_data.appendRow([id, 1, 'image/png', 'iVBORw0KGgo=']); return id; };
  G.pushes.length = 0;
  ok(W('sec', 'gallery', 'insert', { title: 'Diwali 2026', photo: up(1), kind: 'photo', folder: 'Association' })); ok(W('sec', 'gallery', 'insert', { title: 'Diwali 2026', photo: up(2), kind: 'photo', folder: 'Association' }));
  ok(W('sec', 'gallery', 'insert', { title: 'Bye-laws', photo: up(3), kind: 'pdf', folder: 'Association', visibility: 'committee' }));
  G.call({ token: tok.sec, a: 'after' });
  const ph = G.pushes.filter(x => x.t === 'New photos' && /Diwali/.test(x.b)), pd = G.pushes.find(x => x.t === 'New document');
  assert.strictEqual(ph.length, 1, JSON.stringify(G.pushes)); assert.strictEqual(ph[0].to, null); assert(pd && pd.to.roles.includes('executive') && !pd.to.roles.includes('resident'), JSON.stringify(G.pushes)); });
t('update without a filter is refused (no mass edits)', () => no(W('sec', 'contacts', 'update', { phone: '1' }, []), /not found/));
t('formula text stored as plain text', () => { ok(W('f101', 'complaints', 'insert', { title: '=IMPORTXML("http://x","//a")' })); const row = G.sheets.complaints.rows.find(r => String(r[2]).includes('IMPORTXML')); assert(row, 'stored'); });
t('server-only columns ignored (te, history)', () => { ok(W('sec', 'assets', 'update', { te: '{"name":"hack"}' }, [['id', genId]])); assert.notStrictEqual(snap('sec').assets.find(a => a.id === genId).te, '{"name":"hack"}'); });
t('month lock still blocks payments', () => { ok(W('tre', 'closed_months', 'insert', { month: '2026-09-01', closing_cash: 0, closing_bank: 0 })); no(W('tre', 'payments', 'insert', { flat_id: 1, month: '2026-09-01', amount: 1, paid_on: '2026-09-05', mode: 'cash' }), /locked/); });
t('month lock/unlock appear in the log', () => { ok(W('admin', 'closed_months', 'delete', null, [['month', '2026-09-01']])); const a = G.call({ token: tok.admin, a: 'audit', tbl: 'closed_months' }).rows; assert.deepStrictEqual(a.map(x => x.action), ['delete', 'insert']); });
t('password change is logged without the password', () => { ok(G.call({ token: tok.f102, a: 'pw', password: 'secret-123' })); const a = G.call({ token: tok.admin, a: 'audit', tbl: 'users' }).rows; assert(a.length && !JSON.stringify(a).includes('secret-123')); });
t('audit filters by person and date', () => { const a = G.call({ token: tok.admin, a: 'audit', who: 'treasurer', from: today, to: today }).rows; assert(a.length && a.every(r => r.username === 'treasurer')); });

console.log('9. Document folders and the Complaints folder');
t('new folders accepted (Dust Collector, Motor, CCTV Camera, Complaints)', () => { const cache = G.ctx.CacheService.getScriptCache();
  ['Dust Collector', 'Motor', 'CCTV Camera', 'Complaints', 'Watchmen Salary & Cleaning Purchases'].forEach((fo, i) => { const id = 'f' + String(5 + i).repeat(32).slice(0, 32); cache.put('up_' + id, 'secretary'); G.sheets.file_data.appendRow([id, 1, 'image/png', 'iVBORw0KGgo=']);
    ok(W('sec', 'gallery', 'insert', { title: 'Folder ' + fo, photo: id, kind: 'photo', folder: fo })); assert.strictEqual(snap('sec').gallery.find(g => g.title === 'Folder ' + fo).folder, fo); }); });
t('old name "Watchmen Salary" is moved to the new name by setup', () => { const sh = G.sheets.gallery, H = G.x.TABLES.gallery, r = sh.rows.find(x => x[H.indexOf('title')] === 'Folder Motor'); r[H.indexOf('folder')] = 'Watchmen Salary';
  G.x.setup(); assert.strictEqual(snap('sec').gallery.find(g => g.title === 'Folder Motor').folder, 'Watchmen Salary & Cleaning Purchases'); });
t('every complaint is saved as a text file in the private Complaints folder', () => { G.call({ token: tok.sec, a: 'driveSync' });
  const priv = G.drive.top.folders.find(f => f.name === 'Krishna Kuteer Association Documents (private)'), cf = priv && priv.folders.find(f => f.name === 'Complaints');
  assert(cf, 'no Complaints folder'); const txt = cf.files.filter(f => /\.txt$/.test(f.name)); assert(txt.length >= 1, JSON.stringify(cf.files.map(f => f.name)));
  assert(/Ticket: KK-\d{4}-\d{4}/.test(txt[0].body) && /Flat: /.test(txt[0].body), txt[0].body);
  const pub = G.drive.top.folders.find(f => f.name === 'Krishna Kuteer Apartment Documents'); assert(!pub || !JSON.stringify(pub.folders.map(f => f.files.map(x => x.name))).includes('.txt'), 'complaint leaked into shared folder'); });
t('saving again does not make duplicates', () => { G.call({ token: tok.sec, a: 'driveSync' }); const cf = G.drive.top.folders.find(f => f.name === 'Krishna Kuteer Association Documents (private)').folders.find(f => f.name === 'Complaints'), n = cf.files.map(f => f.name);
  assert.strictEqual(new Set(n).size, n.length); });

t('each document folder has its own Drive link; residents get only the shared ones', () => {
  const r = G.call({ token: tok.f101, a: 'folders' }); ok(r); assert.strictEqual(Object.keys(r.folders).length, 15); assert.strictEqual(r.priv, null); assert(/Dust Collector/.test(r.folders['Dust Collector']));
  const c = G.call({ token: tok.sec, a: 'folders' }); ok(c); assert(c.priv && Object.keys(c.priv).length === 15); });
t('old Drive folder "Committee Documents (private)" is renamed to Association', () => { const G2 = require('./gas').create({ file: process.argv[2] });
  G2.ctx.DriveApp.createFolder('Krishna Kuteer Committee Documents (private)').createFolder('Lift'); G2.x.setup();
  const n = G2.drive.top.folders.map(f => f.name); assert(n.includes('Krishna Kuteer Association Documents (private)') && !n.includes('Krishna Kuteer Committee Documents (private)'), JSON.stringify(n));
  assert(G2.drive.top.folders.find(f => /Association/.test(f.name)).folders.some(f => f.name === 'Lift'), 'old contents kept'); });
console.log('10. Visitor approval, guest passes, gate phone numbers');
const lastPush = re => G.pushes.filter(x => re.test(x.t)).pop();
let va;
t('watchman sees only gate data (no money, no complaints)', () => { const w = snap('gate'); assert.strictEqual(w.payments.length, 0); assert.strictEqual(w.expenses.length, 0); assert.strictEqual(w.complaints.length, 0); assert.strictEqual(w.balance.length, 0); assert(w.visitors.length > 0 && w.flats.length === 10); });
t('watchman cannot touch money or the audit log', () => { no(W('gate', 'expenses', 'insert', { spent_on: today, category: 'Lift', amount: 5, mode: 'cash' }), /permission/); no(G.call({ token: tok.gate, a: 'audit' }), /permission/); });
t('gate asks Flat 101: status waiting, alert with buttons goes only to 101', () => { G.pushes.length = 0;
  va = ok(W('gate', 'visitors', 'insert', { visit_on: today, name: 'Courier Ramu', flat_no: '101', purpose: 'Delivery / courier', in_time: '11:05', count: 1, ask: true })).id;
  const p = lastPush(/Visitor at the gate/); assert(p && p.to.user === '101' && p.ex.type === 'visit' && p.ex.vid === String(va) && p.ex.code.length >= 32, JSON.stringify(G.pushes));
  assert.strictEqual(snap('gate').visitors.find(v => v.id === va).status, 'waiting'); });
t('the one-time code is never in the Sheet or any snapshot', () => { const code = lastPush(/Visitor at the gate/).ex.code;
  assert(!JSON.stringify(G.sheets.visitors.rows).includes(code)); ['gate', 'f101', 'sec', 'admin'].forEach(k => assert(!JSON.stringify(snap(k)).includes(code), k)); });
t('Flat 101 sees the waiting visitor; Flat 102 does not', () => { assert.strictEqual(snap('f101').visitors.find(v => v.id === va).status, 'waiting'); assert(!snap('f102').visitors.some(v => v.name === 'Courier Ramu')); });
t('wrong code from an alert is refused', () => no(G.call({ a: 'visitorDecide', id: va, code: 'x'.repeat(40), decision: 'approve' }), /expired/));
t('Approve from the alert works without signing in; the gate is told', () => { G.pushes.length = 0; const code = G.ctx.CacheService.getScriptCache().get('vc_' + va);
  ok(G.call({ a: 'visitorDecide', id: va, code, decision: 'approve' })); const v = snap('gate').visitors.find(x => x.id === va);
  assert.strictEqual(v.status, 'approved'); assert.strictEqual(v.decided_by, '101 (alert)'); assert(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(v.decided_at));
  const p = lastPush(/Flat 101 approved/); assert(p && p.to.roles.includes('watchman') && p.to.roles.includes('president') && !p.to.roles.includes('resident')); });
t('a second answer does not change the first', () => { const r = G.call({ token: tok.f101, a: 'visitorDecide', id: va, decision: 'deny' }); ok(r); assert(r.already); assert.strictEqual(snap('gate').visitors.find(x => x.id === va).status, 'approved'); });
t('gate screen check returns statuses', () => { const r = G.call({ token: tok.gate, a: 'visitorStatus', ids: [va] }); ok(r); assert.strictEqual(r.status[va], 'approved'); });
t('only the visited flat can answer in the app', () => { const id = ok(W('gate', 'visitors', 'insert', { visit_on: today, name: 'Guest X', flat_no: '101', in_time: '11:10', count: 1, ask: true })).id;
  no(G.call({ token: tok.f102, a: 'visitorDecide', id, decision: 'approve' }), /Only the flat/); no(G.call({ token: tok.sec, a: 'visitorDecide', id, decision: 'approve' }), /Only the flat/);
  ok(G.call({ token: tok.f101, a: 'visitorDecide', id, decision: 'deny' })); assert.strictEqual(snap('gate').visitors.find(x => x.id === id).status, 'denied'); });
t('no answer, then ask again sends a new alert', () => { const id = ok(W('gate', 'visitors', 'insert', { visit_on: today, name: 'Guest Y', flat_no: '102', in_time: '11:15', count: 1, ask: true })).id;
  ok(W('gate', 'visitors', 'update', { status: 'no_answer' }, [['id', id]])); G.pushes.length = 0; ok(W('gate', 'visitors', 'update', { status: 'waiting' }, [['id', id]]));
  assert(lastPush(/Visitor at the gate/) && lastPush(/Visitor at the gate/).to.user === '102'); ok(G.call({ token: tok.f102, a: 'visitorDecide', id, decision: 'approve' })); });
t('gate cannot set Approved itself', () => no(W('gate', 'visitors', 'update', { status: 'approved' }, [['id', va]]), /Invalid status/));
let pc;
t('Flat 101 makes a one-visit guest pass: 6-digit code', () => { const r = ok(W('f101', 'guest_passes', 'insert', { name: 'Mother', purpose: 'Guest / relative', kind: 'once', valid_from: today, valid_to: today, flat_no: '502' })); pc = r.code;
  assert(/^\d{6}$/.test(pc)); const g = snap('f101').guest_passes.find(x => x.name === 'Mother'); assert.strictEqual(g.flat_no, '101'); assert.strictEqual(String(g.code), pc); });
t('other flats cannot see it; the gate and Association see it without the code', () => { assert(!snap('f102').guest_passes.some(g => g.name === 'Mother'));
  const w = snap('gate').guest_passes.find(g => g.name === 'Mother'); assert(w && w.code === undefined); assert(snap('sec').guest_passes.find(g => g.name === 'Mother').code === undefined); });
t('a pass for a past day is refused', () => no(W('f101', 'guest_passes', 'insert', { name: 'Late', kind: 'once', valid_from: '2020-01-01', valid_to: '2020-01-02' }), /today or a later day/));
t('gate checks the code: wrong code refused, right code shows the guest', () => { no(G.call({ token: tok.gate, a: 'passCheck', code: '000000' }), /not valid/); const r = ok(G.call({ token: tok.gate, a: 'passCheck', code: pc })); assert(r.pass.name === 'Mother' && r.pass.flat_no === '101'); });
t('residents cannot check codes', () => no(G.call({ token: tok.f102, a: 'passCheck', code: pc }), /permission/));
t('letting in with the code: pre-approved, pass used up, flat told', () => { G.pushes.length = 0; ok(W('gate', 'visitors', 'insert', { visit_on: today, in_time: '12:00', name: 'Mother', count: 1, pass_code: pc })); G.call({ token: tok.gate, a: 'after' });
  const v = snap('gate').visitors.filter(x => x.name === 'Mother').pop(); assert.strictEqual(v.status, 'pre_approved'); assert.strictEqual(v.flat_no, '101');
  assert.strictEqual(snap('f101').guest_passes.find(x => x.name === 'Mother').status, 'used'); assert(lastPush(/guest has arrived/) && lastPush(/guest has arrived/).to.user === '101');
  no(G.call({ token: tok.gate, a: 'passCheck', code: pc }), /not valid/); });
t('always-allowed pass: let in every day', () => { const id = ok(W('f102', 'guest_passes', 'insert', { name: 'Lakshmi', purpose: 'Domestic help', kind: 'always' })).id;
  ok(W('gate', 'visitors', 'insert', { visit_on: today, in_time: '07:00', count: 1, always_pass_id: id })); ok(W('gate', 'visitors', 'insert', { visit_on: today, in_time: '17:00', count: 1, always_pass_id: id }));
  const v = snap('gate').visitors.filter(x => x.name === 'Lakshmi'); assert.strictEqual(v.length, 2); assert(v.every(x => x.status === 'always' && x.flat_no === '102')); });
t('only the flat (or Association) can cancel a pass', () => { const id = snap('f102').guest_passes.find(g => g.name === 'Lakshmi').id; no(W('f101', 'guest_passes', 'update', { status: 'cancelled' }, [['id', id]]), /permission/);
  ok(W('f102', 'guest_passes', 'update', { status: 'cancelled' }, [['id', id]])); no(W('gate', 'visitors', 'insert', { visit_on: today, in_time: '18:00', count: 1, always_pass_id: id }), /no longer/); });
t('gate phone: flat saves its own, not others; gate sees it, other flats do not', () => { ok(G.call({ token: tok.f101, a: 'flatPhone', flat_no: '101', phone: '98480 55555' }));
  no(G.call({ token: tok.f101, a: 'flatPhone', flat_no: '102', phone: '98480 55555' }), /permission/);
  assert.strictEqual(snap('gate').flats.find(f => String(f.flat_no) === '101').phone, '98480 55555'); assert.strictEqual(snap('f102').flats.find(f => String(f.flat_no) === '101').phone, undefined);
  assert.strictEqual(snap('f101').flats.find(f => String(f.flat_no) === '101').phone, '98480 55555'); ok(G.call({ token: tok.sec, a: 'flatPhone', flat_no: '202', phone: '90000 00000' })); });
t('approvals are in the audit log without names', () => { const a = G.call({ token: tok.admin, a: 'audit', tbl: 'visitors' }).rows; assert(a.some(r => /Flat 101 approved/.test(r.summary))); assert(!JSON.stringify(a).includes('Ramu')); });

console.log('11. Flat records its own visitor when the watchman missed it');
let rv;
t('flat records its own visitor: saved for its own flat, marked "by flat"', () => { rv = ok(W('f101', 'visitors', 'insert', { visit_on: today, name: 'Uncle', purpose: 'Guest / relative', in_time: '15:00', count: 1, flat_no: '502' })).id;
  const v = snap('sec').visitors.find(x => x.id === rv); assert.strictEqual(v.flat_no, '101'); assert.strictEqual(v.status, 'by_flat'); assert.strictEqual(v.added_by, '101'); });
t('flat marks its visitor\'s exit', () => { ok(W('f101', 'visitors', 'update', { out_time: '16:10' }, [['id', rv]])); assert.strictEqual(snap('f101').visitors.find(x => x.id === rv).out_time, '16:10'); });
t('flat cannot close another flat\'s visitor or change other fields', () => { no(W('f102', 'visitors', 'update', { out_time: '16:20' }, [['id', rv]]), /permission/); no(W('f101', 'visitors', 'update', { name: 'X' }, [['id', rv]]), /only record the exit/); });
t('flat cannot delete, add counts, ask, or use another flat\'s pass', () => { no(W('f101', 'visitors', 'delete', null, [['id', rv]]), /permission/); no(W('f101', 'visitors', 'insert', { visit_on: today, count: 5 }), /name/);
  no(W('f101', 'visitors', 'insert', { visit_on: today, name: 'Y', in_time: '10:00', count: 1, ask: true }), /permission/);
  const other = ok(W('f102', 'guest_passes', 'insert', { name: 'Cook', kind: 'always' })).id; no(W('f101', 'visitors', 'insert', { visit_on: today, in_time: '10:00', count: 1, always_pass_id: other }), /permission/);
  ok(W('f102', 'visitors', 'insert', { visit_on: today, in_time: '10:00', count: 1, always_pass_id: other })); assert(snap('gate').visitors.some(v => v.name === 'Cook' && v.status === 'always' && v.flat_no === '102')); });

console.log('8. Times and dates are never shown wrong');
t('visitor entry and exit times come back as typed', () => { ok(W('exe', 'visitors', 'insert', { visit_on: today, name: 'Time Test', flat_no: '201', in_time: '09:05', out_time: '18:40' }));
  const v = snap('sec').visitors.find(x => x.name === 'Time Test'); assert.strictEqual(v.in_time, '09:05'); assert.strictEqual(v.out_time, '18:40'); assert.strictEqual(v.visit_on, today); });
t('exit time set later comes back as typed', () => { const v = snap('sec').visitors.find(x => x.name === 'Courier Ravi'); assert.strictEqual(v.in_time, '10:15'); assert.strictEqual(v.out_time, '10:40'); });
t('times already saved by the old version (as Sheet time values) read correctly', () => {
  const sh = G.sheets.visitors, H = G.x.TABLES.visitors; sh.appendRow([999, today, 1, '2026-10-10 08:00', 'Old Row', '102', 'Delivery', '10:15', '23:05', '', 'executive']);
  const r = sh.rows[sh.getLastRow() - 1]; assert(r[H.indexOf('in_time')] instanceof Date, 'mock did not convert');
  G.x.clearCache(); const v = snap('sec').visitors.find(x => x.name === 'Old Row'); assert.strictEqual(v.in_time, '10:15'); assert.strictEqual(v.out_time, '23:05'); });
t('meeting time keeps its AM/PM form, also for old rows', () => { const m = snap('sec').meetings.find(x => x.title === 'AGM 2026'); assert.strictEqual(m.at_time, '6:00 PM');
  const sh = G.sheets.meetings; sh.appendRow([998, 'Old meeting', '2026-11-01', '7:30 PM', 'Hall', 'meeting', '2026-10-01 10:00']); G.x.clearCache();
  assert.strictEqual(snap('sec').meetings.find(x => x.title === 'Old meeting').at_time, '7:30 PM'); });
t('saved-at times keep hour and minute (complaints, audit)', () => { const c = snap('sec').complaints[0]; assert(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(c.created_at), c.created_at); assert(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(c.updated_at), c.updated_at);
  const a = G.call({ token: tok.admin, a: 'audit' }).rows[0]; assert(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(a.at), a.at); });
t('dates stay yyyy-mm-dd (payments, expenses, reminders, warranty)', () => { const s2 = snap('tre');
  [s2.payments[0].paid_on, s2.payments[0].month, s2.reminders[0].due_on, s2.assets.find(a => a.warranty_until).warranty_until, s2.asset_service[0].service_on].forEach(d => assert(/^\d{4}-\d{2}-\d{2}$/.test(d), String(d))); });
t('phone number with leading 0 keeps its 0', () => { const id = ok(W('sec', 'contacts', 'insert', { name: 'Landline', phone: '04024001234' })).id; assert.strictEqual(snap('f101').contacts.find(c => c.id === id).phone, '04024001234'); });

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
