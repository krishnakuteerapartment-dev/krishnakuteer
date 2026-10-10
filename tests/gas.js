/* In-memory stand-in for Google Apps Script, so Code.gs can run unchanged under Node for testing. */
const vm = require('vm'), fs = require('fs'), crypto = require('crypto');
const TZ = 'Asia/Kolkata';

function makeSheet(name) {
  const rows = []; let maxRows = 1000; const prot = [];
  /* like real Google Sheets: text that looks like a time, date or number is changed into a time/date/number value,
     unless it starts with ' (kept as text) */
  const IST = 330 * 60000;
  const strip = v => {
    if (typeof v !== 'string') return v;
    if (v[0] === "'") return v.slice(1);
    let m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/.exec(v);
    if (m) { let h = +m[1]; const ap = (m[4] || '').toUpperCase(); if (ap === 'PM' && h < 12) h += 12; if (ap === 'AM' && h === 12) h = 0;
      /* Sheets keeps a time on 30/12/1899; old local-time rules shift the clock reading, so only the displayed text is reliable */
      const d = new Date(Date.UTC(1899, 11, 30, h, +m[2]) - IST - 1270000); d._disp = ap ? ((h % 12) || 12) + ':' + m[2] + ':00 ' + (h < 12 ? 'AM' : 'PM') : h + ':' + m[2] + ':00'; return d; }
    m = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?$/.exec(v);
    if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)) - IST);
    if (/^\d+(\.\d+)?$/.test(v) && !/^0\d/.test(v)) return +v;
    return v;
  };
  const width = () => rows.reduce((m, r) => Math.max(m, r.length), 0);
  const lastRow = () => { for (let i = rows.length - 1; i >= 0; i--) if (rows[i] && rows[i].some(v => v !== '' && v != null)) return i + 1; return 0; };
  const get = (r, c) => (rows[r - 1] && rows[r - 1][c - 1] != null) ? rows[r - 1][c - 1] : '';
  const set = (r, c, v) => { while (rows.length < r) rows.push([]); const row = rows[r - 1]; while (row.length < c) row.push(''); row[c - 1] = strip(v); };
  const range = (r, c, nr = 1, nc = 1) => ({
    getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => get(r + i, c + j))),
    getValue: () => get(r, c),
    getDisplayValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => { const x = get(r + i, c + j); return x instanceof Date ? (x._disp || x.toISOString()) : String(x); })),
    setValues: v => { v.forEach((row, i) => row.forEach((x, j) => set(r + i, c + j, x))); return range(r, c, nr, nc); },
    setValue: v => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) set(r + i, c + j, v); return range(r, c, nr, nc); },
    setFontWeight: () => range(r, c, nr, nc), setNumberFormat: () => range(r, c, nr, nc),
    clearContent: () => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) set(r + i, c + j, ''); return range(r, c, nr, nc); },
    getRow: () => r,
    createTextFinder: txt => ({ matchEntireCell: () => ({ findAll: () => { const out = []; for (let i = 0; i < nr; i++) if (String(get(r + i, c)) === txt) out.push({ getRow: () => r + i }); return out; } }) })
  });
  return {
    name, rows,
    getName: () => name, getLastRow: lastRow, getLastColumn: () => width(), getMaxRows: () => Math.max(maxRows, rows.length),
    getRange: range, getDataRange: () => range(1, 1, Math.max(lastRow(), 1), Math.max(width(), 1)),
    appendRow: v => { const n = lastRow() + 1; v.forEach((x, j) => set(n, j + 1, x)); },
    deleteRow: n => { rows.splice(n - 1, 1); }, deleteRows: (n, k) => { rows.splice(n - 1, k); },
    insertRowsAfter: (a, k) => { maxRows += k; }, setFrozenRows: () => {},
    protect: () => { const p = { setDescription: () => p, setWarningOnly: () => p }; prot.push(p); return p; },
    getProtections: () => prot
  };
}

function create(opts = {}) {
  const sheets = {}, order = [];
  const ss = {
    getSheetByName: n => sheets[n] || null,
    insertSheet: n => { sheets[n] = makeSheet(n); order.push(n); return sheets[n]; },
    getSheets: () => order.map(n => sheets[n]), deleteSheet: s => { delete sheets[s.name]; order.splice(order.indexOf(s.name), 1); },
    getSpreadsheetTimeZone: () => TZ, getUrl: () => 'mock://sheet'
  };
  const cache = new Map(), props = new Map(), pushes = [], logs = [], drive = {};
  const fmt = (d, tz, pat) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d).map(x => [x.type, x.value]));
    const H = p.hour === '24' ? '00' : p.hour;
    return pat.replace('yyyy', p.year).replace('MM', p.month).replace('dd', p.day).replace('HH', H).replace(/\bH\b/, String(+H)).replace('mm', p.minute);
  };
  const ctx = {
    console, JSON, Math, Date: opts.Date || Date, Object, Array, String, Number, Boolean, RegExp, Error, isNaN, parseInt, parseFloat, Promise,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, ProtectionType: { SHEET: 'SHEET' }, getUi: () => { throw new Error('no ui'); } },
    CacheService: { getScriptCache: () => ({
      get: k => cache.has(k) ? cache.get(k) : null, put: (k, v) => cache.set(k, String(v)), remove: k => cache.delete(k),
      getAll: ks => Object.fromEntries(ks.filter(k => cache.has(k)).map(k => [k, cache.get(k)])), putAll: kv => Object.entries(kv).forEach(([k, v]) => cache.set(k, v)) }) },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, tryLock: () => true, releaseLock: () => {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props.has(k) ? props.get(k) : null, setProperty: (k, v) => props.set(k, v), deleteProperty: k => props.delete(k) }) },
    Utilities: {
      formatDate: fmt, getUuid: () => crypto.randomUUID(),
      DigestAlgorithm: { SHA_256: 'sha256' }, computeDigest: (a, s) => [...crypto.createHash('sha256').update(s).digest()],
      base64Encode: b => Buffer.from(typeof b === 'string' ? b : Uint8Array.from(b.map(x => x & 255))).toString('base64'),
      base64Decode: s => [...Buffer.from(s, 'base64')], newBlob: (b, m, n) => ({ name: n, mime: m })
    },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ s, setMimeType() { return this; } }) },
    LanguageApp: { translate: x => opts.translate ? 'తె:' + x : (() => { throw new Error('quota'); })() },
    MailApp: { sendEmail: () => {}, getRemainingDailyQuota: () => 100 },
    DriveApp: (() => { /* tiny in-memory Drive: folders and files by name */
      const mk = name => { const f = { name, folders: [], files: [], getUrl: () => 'mock://' + name, setName: n => { f.name = n; },
        getFoldersByName: n => { const l = f.folders.filter(x => x.name === n); return { hasNext: () => l.length > 0, next: () => l.shift() }; },
        createFolder: n => { const x = mk(n); f.folders.push(x); return x; },
        getFilesByName: n => { const l = f.files.filter(x => x.name === n); return { hasNext: () => l.length > 0, next: () => l.shift() }; },
        createFile: (a, b, c) => { const x = typeof a === 'string' ? { name: a, body: b, mime: c } : { name: a.name || 'file', blob: a }; f.files.push(x); return x; } }; return f; };
      const top = mk('My Drive'); drive.top = top; return { getFoldersByName: top.getFoldersByName, createFolder: top.createFolder }; })(),
    UrlFetchApp: { fetch: () => ({ getContentText: () => '{}', getResponseCode: () => 200 }), fetchAll: () => [] },
    ScriptApp: { getProjectTriggers: () => [], newTrigger: () => ({ timeBased: () => ({ everyMinutes: () => ({ create: () => {} }) }) }) },
    Logger: { log: m => logs.push(String(m)) }
  };
  vm.createContext(ctx);
  const code = fs.readFileSync(opts.file, 'utf8');
  vm.runInContext(code + '\n;this.__x={route_,setup,addCommittee,read_,clearCache,keepWarm,dailyReminders_,dueItems_,snapshot_,findUser_,pushAll_,TABLES};', ctx);
  /* capture pushes instead of calling Firebase */
  vm.runInContext("pushAll_ = function(t,b,u,to){ __push.push({t:t,b:b,to:to||null}); return {sent:1}; };", Object.assign(ctx, { __push: pushes }));
  const call = body => { const out = ctx.doPost({ postData: { contents: JSON.stringify(body) } }); return JSON.parse(out.s); };
  return { ctx, ss, sheets, call, pushes, logs, props, drive, x: ctx.__x, run: s => vm.runInContext(s, ctx) };
}
module.exports = { create };
