/* The alert's Approve / Deny buttons (service worker), run with stand-ins for the browser. Run: node tests/sw.test.js public/sw.js */
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const H = {}, shown = [], fetched = [];
const ctx = { console, URL, JSON, Promise, setTimeout,
  self: { addEventListener: (n, f) => { H[n] = f; }, registration: { showNotification: (t, o) => { shown.push({ t, o }); return Promise.resolve(); } }, location: { origin: 'https://example.org' }, skipWaiting() {}, clients: { claim() {} } },
  caches: { open: async () => ({ addAll: async () => {}, match: async () => null, put: async () => {} }), keys: async () => [] },
  clients: { matchAll: async () => [], openWindow: async u => { fetched.push({ open: u }); } },
  fetch: async (u, o) => { fetched.push({ u, body: o && o.body }); return { json: async () => ({ ok: true, status: 'approved' }) }; },
  Notification: { maxActions: 3 } };
ctx.self.Notification = ctx.Notification; vm.createContext(ctx); vm.runInContext(fs.readFileSync(process.argv[2], 'utf8'), ctx);
let pass = 0; const t = async (n, f) => { try { await f(); pass++; console.log('  ok   ' + n); } catch (e) { console.log('  FAIL ' + n + '\n       ' + e.message); process.exitCode = 1; } };
const fire = (n, ev) => { const w = []; ev.waitUntil = p => w.push(p); H[n](ev); return Promise.all(w); };
(async () => {
  const data = { title: 'Visitor at the gate for Flat 101', body: 'Courier Ramu (Delivery / courier) is waiting.', type: 'visit', vid: '7', code: 'c0de', api: 'https://script.google.com/macros/s/X/exec', purpose: 'Delivery / courier' };
  await t('visitor alert shows Approve, Deny and Leave at gate, stays until answered', async () => { await fire('push', { data: { json: () => ({ data }) } }); const o = shown.pop().o;
    assert.strictEqual(JSON.stringify(o.actions.map(a => a.action)), '["approve","deny","gate"]'); assert(o.requireInteraction && o.tag === 'visit-7' && o.data.code === 'c0de'); });
  await t('phones with only 2 buttons get Approve and Deny', async () => { ctx.Notification.maxActions = 2; await fire('push', { data: { json: () => ({ data }) } }); assert.strictEqual(JSON.stringify(shown.pop().o.actions.map(a => a.action)), '["approve","deny"]'); ctx.Notification.maxActions = 3; });
  await t('ordinary alerts have no buttons', async () => { await fire('push', { data: { json: () => ({ data: { title: 'New notice', body: 'x' } }) } }); assert(!shown.pop().o.actions); });
  await t('tapping Approve sends the answer with the code, and confirms', async () => { await fire('notificationclick', { action: 'approve', notification: { close() {}, data: { url: '/#vis', vid: '7', code: 'c0de', api: data.api } } });
    const f = fetched.pop(); assert.strictEqual(f.u, data.api); assert.deepStrictEqual(JSON.parse(f.body), { a: 'visitorDecide', id: '7', code: 'c0de', decision: 'approve' }); assert(/Approved/.test(shown.pop().t)); });
  await t('an answer is never sent to a non-Google address', async () => { const n = fetched.length; await fire('notificationclick', { action: 'approve', notification: { close() {}, data: { vid: '7', code: 'c', api: 'https://evil.example/x' } } }); assert.strictEqual(fetched.length, n); });
  await t('tapping the alert itself opens the Visitors page', async () => { await fire('notificationclick', { action: '', notification: { close() {}, data: { url: '/#vis' } } }); assert(/#vis$/.test(fetched.pop().open)); });
  console.log('\n' + pass + ' passed');
})();
