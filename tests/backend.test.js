/* Backend tests: run Code.gs against the in-memory Sheet and check every new feature and permission. */
const { create } = require('./gas');
const assert = require('assert');
const G = create({ file: process.argv[2] });
G.x.setup();
G.x.addCommittee();
/* give every committee ID a known password */
const us = G.sheets.users;
us.rows.forEach((r, i) => { if (i && ['secretary', 'treasurer', 'executive', 'president'].includes(r[0])) r[3] = 'pw-' + r[0]; });
let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + e.message); } };
const login = (u, p) => { const r = G.call({ a: 'login', u, p }); assert(r.token, 'login failed for ' + u + ': ' + JSON.stringify(r.error)); return r.token; };
const tok = { admin: login('1234', '987654'), f101: login('101', '123456'), f102: login('102', '123456'),
  sec: login('secretary', 'pw-secretary'), tre: login('treasurer', 'pw-treasurer'), exe: login('executive', 'pw-executive'), pre: login('president', 'pw-president') };
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
t('resident cannot add visitors', () => no(W('f101', 'visitors', 'insert', { visit_on: today, count: 1 }), /permission/));

console.log('6. Complaint tracking');
let c1;
t('resident raises complaint linked to lift, gets ticket number', () => { ok(W('f101', 'complaints', 'insert', { title: 'Lift stuck', details: 'Between 2nd and 3rd floor', asset_id: liftId, assigned_to: 'me' })); const c = snap('f101').complaints[0]; c1 = c.id;
  assert(/^KK-\d{4}-0001$/.test(c.ticket_no), c.ticket_no); assert.strictEqual(String(c.asset_id), String(liftId)); assert(!c.assigned_to, 'resident must not assign'); assert.strictEqual(JSON.parse(c.history).length, 1); });
t('second ticket number increments', () => { ok(W('f102', 'complaints', 'insert', { title: 'Tap leaking' })); assert(/-0002$/.test(snap('f102').complaints[0].ticket_no)); });
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
t('update without a filter is refused (no mass edits)', () => no(W('sec', 'contacts', 'update', { phone: '1' }, []), /not found/));
t('formula text stored as plain text', () => { ok(W('f101', 'complaints', 'insert', { title: '=IMPORTXML("http://x","//a")' })); const row = G.sheets.complaints.rows.find(r => String(r[2]).includes('IMPORTXML')); assert(row, 'stored'); });
t('server-only columns ignored (te, history)', () => { ok(W('sec', 'assets', 'update', { te: '{"name":"hack"}' }, [['id', genId]])); assert.notStrictEqual(snap('sec').assets.find(a => a.id === genId).te, '{"name":"hack"}'); });
t('month lock still blocks payments', () => { ok(W('tre', 'closed_months', 'insert', { month: '2026-09-01', closing_cash: 0, closing_bank: 0 })); no(W('tre', 'payments', 'insert', { flat_id: 1, month: '2026-09-01', amount: 1, paid_on: '2026-09-05', mode: 'cash' }), /locked/); });
t('month lock/unlock appear in the log', () => { ok(W('admin', 'closed_months', 'delete', null, [['month', '2026-09-01']])); const a = G.call({ token: tok.admin, a: 'audit', tbl: 'closed_months' }).rows; assert.deepStrictEqual(a.map(x => x.action), ['delete', 'insert']); });
t('password change is logged without the password', () => { ok(G.call({ token: tok.f102, a: 'pw', password: 'secret-123' })); const a = G.call({ token: tok.admin, a: 'audit', tbl: 'users' }).rows; assert(a.length && !JSON.stringify(a).includes('secret-123')); });
t('audit filters by person and date', () => { const a = G.call({ token: tok.admin, a: 'audit', who: 'treasurer', from: today, to: today }).rows; assert(a.length && a.every(r => r.username === 'treasurer')); });

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
