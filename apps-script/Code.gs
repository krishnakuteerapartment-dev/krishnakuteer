/* Krishna Kuteer - Google Sheets backend.
   Paste into Extensions > Apps Script of your Google Sheet, run setup() once, then Deploy > Web app. */

const TABLES = {
  flats: ['id', 'flat_no', 'monthly_amount', 'phone'],
  payments: ['id', 'receipt_no', 'flat_id', 'month', 'amount', 'paid_on', 'mode', 'reference', 'remarks', 'created_at'],
  expenses: ['id', 'spent_on', 'category', 'amount', 'paid_to', 'mode', 'description', 'remarks', 'created_at', 'te'],
  income: ['id', 'received_on', 'category', 'amount', 'mode', 'remarks', 'created_at'],
  maintenance_rates: ['month', 'amount'],
  closed_months: ['month', 'closing_cash', 'closing_bank', 'closed_at'],
  notices: ['id', 'title', 'created_on', 'te'],
  settings: ['id', 'opening_cash', 'opening_bank'],
  users: ['username', 'role', 'flat_id', 'temp_password', 'password_hash', 'salt', 'email', 'email_verified'],
  maintenance_log: ['id', 'logged_on', 'details', 'status', 'created_at', 'te'],
  celebrations: ['id', 'kind', 'flat_id', 'entry_on', 'amount', 'details', 'created_at', 'te'],
  /* NEW COLUMNS ARE ALWAYS ADDED AT THE END of a list (the Sheet's column order must match this order). */
  complaints: ['id', 'flat_no', 'title', 'details', 'status', 'created_at', 'updated_at', 'photos', 'voice', 'te', 'ticket_no', 'assigned_to', 'expected_on', 'asset_id', 'history', 'feedback', 'feedback_note', 'feedback_at', 'reply_photos'],
  gallery: ['id', 'title', 'photo', 'uploaded_by', 'created_at', 'kind', 'name', 'folder', 'te', 'visibility'],
  file_data: ['file_id', 'part', 'mime', 'data'],
  login_log: ['username', 'role', 'login_at', 'logout_at', 'last_seen', 'minutes', 'device'],
  meetings: ['id', 'title', 'on_date', 'at_time', 'place', 'kind', 'created_at', 'te', 'agenda', 'attendance', 'attendees_other', 'minutes', 'resolutions', 'status', 'published_on'],
  polls: ['id', 'question', 'options', 'status', 'created_at', 'te'],
  votes: ['id', 'poll_id', 'flat_no', 'choice', 'created_at'],
  visitors: ['id', 'visit_on', 'count', 'created_at', 'name', 'flat_no', 'purpose', 'in_time', 'out_time', 'phone', 'added_by', 'status', 'decided_by', 'decided_at', 'pass_id', 'remarks', 'import_id', 'import_key'],
  status: ['item', 'state', 'updated_on'],
  push_tokens: ['token', 'username', 'role', 'updated_at'],
  /* ---- apartment assets, service history, reminders, emergency contacts, meeting action items, audit trail ---- */
  assets: ['id', 'name', 'kind', 'location', 'installed_on', 'vendor', 'vendor_phone', 'model', 'serial_no', 'warranty_until', 'status', 'notes', 'created_at', 'te'],
  asset_service: ['id', 'asset_id', 'service_on', 'kind', 'done_by', 'cost', 'details', 'next_due', 'reminder_id', 'created_at', 'te'],
  reminders: ['id', 'title', 'asset_id', 'kind', 'due_on', 'repeat_months', 'notify_days', 'status', 'done_on', 'notes', 'created_at', 'te'],
  /* minor assets: small things bought for common use (chairs, bulbs, buckets, extension boards…) */
  asset_items: ['id', 'name', 'category', 'qty', 'unit', 'bought_on', 'cost', 'bought_from', 'location', 'condition', 'notes', 'added_by', 'created_at'],
  contacts: ['id', 'category', 'name', 'phone', 'alt_phone', 'notes', 'verified_on', 'updated_by', 'created_at'],
  action_items: ['id', 'meeting_id', 'task', 'owner', 'due_on', 'status', 'done_on', 'created_at', 'te'],
  audit_log: ['id', 'at', 'username', 'role', 'action', 'tbl', 'record_id', 'summary', 'before', 'after'],
  /* guest passes made by a flat: 'once' (a 6-digit code for one visit) or 'always' (daily help, milk, newspaper) */
  guest_passes: ['id', 'flat_no', 'name', 'purpose', 'kind', 'valid_from', 'valid_to', 'code', 'status', 'used_at', 'created_by', 'created_at'],
  /* watchman: staff list, leave (applied by the gate login or recorded by the Association) and daily attendance */
  staff: ['id', 'name', 'role', 'phone', 'joined_on', 'paid_leaves_year', 'active', 'notes', 'created_at'],
  leaves: ['id', 'staff_id', 'from_date', 'to_date', 'days', 'kind', 'reason', 'status', 'requested_by', 'decided_by', 'decided_at', 'notice_id', 'created_at'],
  attendance: ['id', 'staff_id', 'on_date', 'status', 'marked_by', 'marked_at', 'created_at'],
  /* register photo imports (Secretary): one row per photographed page */
  visitor_imports: ['id', 'at', 'by', 'photo', 'model', 'found', 'unsure', 'saved', 'duplicates', 'failed', 'status', 'note']
};
const TEXT_COLS = ['month', 'paid_on', 'spent_on', 'received_on', 'created_on', 'created_at', 'closed_at',
                   'flat_no', 'username', 'temp_password', 'password_hash', 'salt', 'email', 'email_verified', 'photos', 'photo', 'file_id', 'data', 'login_at', 'logout_at', 'last_seen', 'logged_on', 'entry_on', 'visit_on', 'on_date', 'at_time', 'updated_at', 'updated_on', 'item', 'options', 'choice'];
const STR_COLS = ['flat_no', 'username', 'temp_password', 'phone', 'alt_phone', 'vendor_phone', 'serial_no', 'model', 'ticket_no', 'in_time', 'out_time', 'code', 'decided_by', 'added_by', 'created_by', 'uploaded_by', 'updated_by'];
TEXT_COLS.push('token', 'voice', 'te', 'ticket_no', 'expected_on', 'history', 'attendance', 'published_on', 'in_time', 'out_time', 'phone', 'alt_phone', 'vendor_phone',
  'serial_no', 'model', 'installed_on', 'warranty_until', 'bought_on', 'unit', 'service_on', 'next_due', 'due_on', 'done_on', 'verified_on', 'at', 'before', 'after', 'summary',
  'code', 'valid_from', 'valid_to', 'used_at', 'decided_at', 'decided_by', 'feedback_at', 'reply_photos', 'joined_on', 'from_date', 'to_date', 'marked_at', 'requested_by', 'marked_by');
const W = ['admin', 'treasurer', 'secretary'], N = ['admin', 'president', 'secretary'], A = ['admin', 'treasurer'];
const DOCUP = ['admin', 'president', 'secretary', 'treasurer', 'executive']; /* who may upload documents (PDF / photos) */
const VIS = ['admin', 'treasurer', 'secretary', 'executive', 'watchman'];    /* who may add / delete visitors (the gate) */
const ALL = ['admin', 'treasurer', 'secretary', 'president', 'executive', 'resident'], S = ['admin', 'treasurer', 'secretary', 'president'];
const COM = ['admin', 'president', 'secretary', 'treasurer', 'executive'];  /* the committee: gets service reminders */
const AUDITV = S;                                                            /* who may read the audit log */
const SEEVIS = ['admin', 'president', 'secretary', 'treasurer', 'executive', 'watchman']; /* who may see every visitor's details */
const RULES = {
  complaints: { insert: ALL, update: S, delete: S }, meetings: { insert: N, update: N, delete: N },
  polls: { insert: N, update: N, delete: N }, gallery: { insert: DOCUP, delete: N }, votes: { insert: ALL }, status: { upsert: W },
  payments: { insert: W }, expenses: { insert: W, delete: A }, income: { insert: W, delete: A },
  maintenance_rates: { upsert: W }, closed_months: { insert: W, delete: ['admin'] },
  notices: { insert: N, delete: N }, settings: { update: A },
  maintenance_log: { insert: W, update: W, delete: W }, celebrations: { insert: W, delete: A },
  visitors: { insert: VIS.concat(['resident']), update: VIS.concat(['resident']), delete: VIS }, /* residents: only their own flat's visitors (see below) */
  assets: { insert: S, update: S, delete: S }, asset_service: { insert: COM, delete: S }, asset_items: { insert: S, update: S, delete: S },
  reminders: { insert: COM, update: COM, delete: S }, contacts: { insert: S, update: S, delete: S },
  action_items: { insert: N, update: S, delete: N },
  guest_passes: { insert: ALL, update: ALL },
  staff: { insert: S, update: S, delete: S },
  leaves: { insert: S.concat(['watchman']), update: S.concat(['watchman']), delete: S },
  attendance: { insert: S.concat(['watchman']), delete: S }
  /* audit_log has NO rule on purpose: nobody can add, change or delete it from the app */
};
/* tables whose changes are recorded in the audit log (votes never: ballots stay anonymous) */
const AUDIT_T = ['payments', 'expenses', 'income', 'maintenance_rates', 'closed_months', 'settings', 'celebrations', 'complaints', 'meetings', 'action_items',
  'notices', 'polls', 'gallery', 'visitors', 'assets', 'asset_service', 'asset_items', 'reminders', 'contacts', 'maintenance_log', 'status', 'guest_passes', 'flats', 'staff', 'leaves', 'attendance'];
const AUDIT_BRIEF = ['visitors', 'complaints', 'guest_passes', 'flats']; /* private details are NOT copied into the log for these: only what changed */
const ENUM = {
  assets: { kind: ['lift', 'generator', 'motor', 'water_pump', 'cctv', 'battery', 'other'], status: ['working', 'repair', 'out_of_service'] },
  asset_service: { kind: ['service', 'repair', 'inspection', 'replacement'] },
  asset_items: { category: ['furniture', 'electrical', 'cleaning', 'plumbing', 'garden', 'security', 'decoration', 'kitchen', 'tools', 'stationery', 'other'], condition: ['good', 'damaged', 'lost', 'used_up'] },
  reminders: { kind: ['service', 'warranty', 'amc', 'other'], status: ['pending', 'done'] },
  contacts: { category: ['lift', 'electrician', 'plumber', 'generator', 'security', 'fire', 'ambulance', 'police', 'other'] },
  action_items: { status: ['open', 'in_progress', 'done'] },
  meetings: { status: ['draft', 'published'] }
};
/* columns the app may never set directly (the server fills them) */
const SYS_COLS = ['te', 'receipt_no', 'ticket_no', 'history', 'added_by', 'updated_by', 'published_on', 'done_on', 'uploaded_by', 'decided_by', 'decided_at', 'pass_id', 'code', 'used_at', 'created_by', 'feedback', 'feedback_note', 'feedback_at', 'reply_photos', 'requested_by', 'notice_id', 'marked_by', 'marked_at', 'days'];
const DATE_OF = { payments: ['paid_on', 'month'], expenses: ['spent_on'], income: ['received_on'], maintenance_rates: ['month'] };

/* ---------- one-time setup: creates the tabs and starter data ---------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(TABLES).forEach(t => {
    const cols = TABLES[t], sh = ss.getSheetByName(t) || ss.insertSheet(t);
    if (sh.getLastRow() === 0) { sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold'); sh.setFrozenRows(1); }
    cols.forEach((c, i) => { if (TEXT_COLS.indexOf(c) >= 0) sh.getRange(1, i + 1, sh.getMaxRows(), 1).setNumberFormat('@'); });
  });
  const first = ss.getSheetByName('Sheet1'); if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
  if (!read_('flats').length) {
    ['101', '102', '201', '202', '301', '302', '401', '402', '501', '502'].forEach((n, i) => {
      sh_('flats').appendRow([i + 1, n, 1000]);
      sh_('users').appendRow([n, 'resident', i + 1, '123456', '', '', '', '']);
    });
    sh_('users').appendRow(['1234', 'admin', '', '987654', '', '', '', '']);
  }
  if (!read_('settings').length) sh_('settings').appendRow([1, 0, 0]);
  upgradeUsers();
  upgradeFeatures_();
  Logger.log('Setup done. Now: Deploy > New deployment > Web app (Execute as: Me, Access: Anyone).');
}

/* Safe to run many times (setup() calls it): starter emergency numbers, ticket numbers for old complaints,
   and a warning on the audit_log tab so nobody edits it by hand by mistake. */
function upgradeFeatures_() {
  if (!read_('contacts').length) {
    [['fire', 'Fire service', '101'], ['ambulance', 'Ambulance', '108'], ['police', 'Police', '100'], ['other', 'All emergencies (national)', '112']]
      .forEach((c, i) => sh_('contacts').appendRow([i + 1, c[0], c[1], c[2], '', 'National emergency number', '', 'setup', now_()]));
  }
  const sh = sh_('complaints'), col = TABLES.complaints.indexOf('ticket_no') + 1, seen = {};
  read_('complaints').sort((a, b) => (+a.id || 0) - (+b.id || 0)).forEach(c => {
    const y = String(c.created_at || now_()).slice(0, 4);
    if (c.ticket_no) { const n = +String(c.ticket_no).split('-').pop() || 0; seen[y] = Math.max(seen[y] || 0, n); return; }
  });
  read_('complaints').sort((a, b) => (+a.id || 0) - (+b.id || 0)).forEach(c => {
    if (c.ticket_no) return;
    const y = String(c.created_at || now_()).slice(0, 4); seen[y] = (seen[y] || 0) + 1;
    sh.getRange(c.__r, col).setValue(ticketOf_(y, seen[y]));
  });
  /* renamed document folders: move existing documents to the new name (the Drive folder is renamed too) */
  const gs = sh_('gallery'), gc = TABLES.gallery.indexOf('folder') + 1;
  read_('gallery').forEach(g => { if (FOLDER_RENAMED[g.folder]) gs.getRange(g.__r, gc).setValue(FOLDER_RENAMED[g.folder]); });
  try { /* the private folder used to be called '... Committee Documents (private)' */
    const ol = DriveApp.getFoldersByName(PRIV_FOLDER_OLD); if (ol.hasNext() && !DriveApp.getFoldersByName(PRIV_FOLDER).hasNext()) ol.next().setName(PRIV_FOLDER);
  } catch (e) { Logger.log('Drive rename skipped: ' + e); }
  try {
    [ROOT_FOLDER, PRIV_FOLDER].forEach(rn => { const it = DriveApp.getFoldersByName(rn); if (!it.hasNext()) return; const root = it.next();
      Object.keys(FOLDER_RENAMED).forEach(o => { const f = root.getFoldersByName(safeName_(o)); if (f.hasNext() && !root.getFoldersByName(safeName_(FOLDER_RENAMED[o])).hasNext()) f.next().setName(safeName_(FOLDER_RENAMED[o])); }); });
  } catch (e) { Logger.log('Drive rename skipped: ' + e); }
  PROPS_().deleteProperty('FOLDER_URLS'); /* Documents page folder links are worked out again */
  const a = sh_('audit_log');
  if (a && !a.getProtections(SpreadsheetApp.ProtectionType.SHEET).length) a.protect().setDescription('Audit log: written by the app only').setWarningOnly(true);
  cacheDrop_('snap');
}
const ticketOf_ = (y, n) => 'KK-' + y + '-' + String(n).padStart(4, '0');

/* Adds the 'email' and 'email_verified' columns to an existing users tab (safe to run many times). */
function upgradeUsers() {
  Object.keys(TABLES).forEach(t => {
    const sh = sh_(t); if (!sh) return;
    const have = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String);
    TABLES[t].forEach((c, i) => { if (have.indexOf(c) < 0) sh.getRange(1, i + 1).setValue(c).setFontWeight('bold'); });
  });
  const sh = sh_('users'); if (!sh) return;
  const want = TABLES.users, have = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String);
  want.forEach((c, i) => { if (have.indexOf(c) < 0) sh.getRange(1, i + 1).setValue(c).setFontWeight('bold'); });
  [7, 8].forEach(n => sh.getRange(1, n, sh.getMaxRows(), 1).setNumberFormat('@'));
}
/* Run ONCE by hand and click Allow: lets the script send e-mails from your Gmail (needed for codes). */
function authorizeMail() { Logger.log('Mail quota left today: ' + MailApp.getRemainingDailyQuota()); }

/* Run once by hand: adds sign-in IDs for secretary, treasurer, executive (and president) if they are missing.
   Each gets a random starting password, shown in View > Logs. They must change it on first sign-in. */
/* Run once by hand: adds the 'watchman' sign-in for the gate phone (sees only Visitors and Contacts). The password is in View > Logs. */
function addWatchman() { addCommittee(); }
function addCommittee() {
  const have = read_('users').map(u => String(u.username).trim().toLowerCase());
  ['secretary', 'treasurer', 'executive', 'president', 'watchman'].forEach(role => {
    if (have.indexOf(role) >= 0) { Logger.log(role + ': already exists, skipped'); return; }
    const pw = String(100000 + Math.floor(Math.random() * 900000));
    sh_('users').appendRow([role, role, '', pw, '', '', '', '']);
    Logger.log(role + ': ID = ' + role + ' | starting password = ' + pw);
  });
  }

/* ---------- web endpoint ---------- */
function doGet() { return ContentService.createTextOutput('Krishna Kuteer API is running'); }
/* jobs that must not hold up other people's saves (visitor alerts): run after the save is finished and the lock is released */
let LATER_ = [];
function doPost(e) {
  let out; LATER_ = [];
  try { out = route_(JSON.parse(e.postData.contents)); } catch (err) { out = { error: { message: 'Server error: ' + err.message } }; }
  LATER_.splice(0).forEach(f => { try { f(); } catch (x) { Logger.log('Later job failed: ' + x); } });
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function route_(b) {
  if (b.a === 'login') return login_(b);
  if (b.a === 'fpSend' || b.a === 'fpReset') {
    const lock = LockService.getScriptLock(); lock.waitLock(20000);
    try { return b.a === 'fpSend' ? fpSend_(b) : fpReset_(b); } finally { lock.releaseLock(); }
  }
  if (b.a === 'deployPing') return deployPing_(b);
  /* Approve / Deny tapped on the alert itself: the phone sends the visitor id and the one-time code that came in that flat's alert */
  if (b.a === 'visitorDecide' && b.code && !b.token) { ensureHeader_('visitors'); } if (b.a === 'visitorDecide' && b.code && !b.token) { const lock = LockService.getScriptLock(); lock.waitLock(20000); try { return decideByCode_(b); } finally { lock.releaseLock(); } }
  const u = session_(b.token);
  if (!u) return { auth: true, error: { message: 'Session expired. Please sign in again.' } };
  if (b.a === 'me') return { user: pub_(u) };
  if (b.a === 'snapshot') return { data: snapshot_(u) };
  if (b.a === 'logout') { logTouch_(b.token, true); CacheService.getScriptCache().remove('t_' + b.token); return { ok: true }; }
  logTouch_(b.token, false);
  if (b.a === 'pushReg') return pushReg_(u, b);
  if (b.a === 'upload') return upload_(u, b);
  if (b.a === 'photo') return photo_(u, b);
  if (b.a === 'driveSync') return driveSync_();
  if (b.a === 'after') return after_();
  if (b.a === 'audit') return auditRead_(u, b);
  if (b.a === 'folders') return folderLinks_(u);
  if (b.a === 'visitorStatus') return visitorStatus_(u, b);
  if (b.a === 'passCheck') { ensureHeader_('guest_passes'); return passCheck_(u, b); }
  if (b.a === 'write' && b.t) ensureHeader_(b.t);
  if (b.a === 'complaintFeedback') { ensureHeader_('complaints'); const lock = LockService.getScriptLock(); lock.waitLock(20000); try { const r = feedback_(u, b); if (r && r.ok) r.snapshot = snapshot_(u); return r; } finally { lock.releaseLock(); } }
  if (b.a === 'visitorDecide' || b.a === 'flatPhone') { ensureHeader_('visitors'); ensureHeader_('flats'); }
  if (b.a === 'visitorDecide' || b.a === 'flatPhone') {
    const lock = LockService.getScriptLock(); lock.waitLock(20000);
    try { const r = b.a === 'flatPhone' ? flatPhone_(u, b) : decideByUser_(u, b); if (r && r.ok) r.snapshot = snapshot_(u); return r; } finally { lock.releaseLock(); }
  }
  if (b.a === 'registerScan') { ensureHeader_('visitors'); ensureHeader_('visitor_imports'); return regScan_(u, b); }
  if (b.a === 'registerSave' || b.a === 'registerCancel') {
    ensureHeader_('visitors'); ensureHeader_('visitor_imports');
    const lock = LockService.getScriptLock(); lock.waitLock(20000); TOUCHED_ = {};
    try { const r = b.a === 'registerSave' ? regSave_(u, b) : regCancel_(u, b); if (r && r.ok) { Object.keys(TOUCHED_).forEach(patchSnap_); r.snapshot = snapshot_(u); } return r; }
    finally { lock.releaseLock(); }
  }
  if (b.a === 'registerImports') { ensureHeader_('visitor_imports'); return regList_(u); }
  if (b.a === 'emailSend') return emailSend_(u, b);
  if (b.a === 'emailVerify') { const lock = LockService.getScriptLock(); lock.waitLock(20000); try { return emailVerify_(u, b); } finally { lock.releaseLock(); } }
  if (b.a === 'write' && !verified_(u)) return { error: { message: 'Please verify your e-mail first.' } };
  if (b.a === 'pw' || b.a === 'write') {
    const lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      if (b.a === 'pw') { const r0 = pw_(u, b); if (r0.ok) audit_(u, 'password', 'users', u.username, 'Password changed', null, null); return r0; }
      let r; TOUCHED_ = {}; ASK_ = false;
      try { r = write_(u, b); } catch (e) { cacheDrop_('snap'); throw e; }
      if (r && r.ok) { TOUCHED_[b.t] = 1; Object.keys(TOUCHED_).forEach(patchSnap_); r.snapshot = snapshot_(u); }
      return r;
    } finally { lock.releaseLock(); }
  }
  return { error: { message: 'Unknown request' } };
}

/* ---------- missing tabs / columns are added by themselves (no need to run setup() after an update) ----------
   Checked once per tab every 6 hours; a column is written at its place in TABLES, exactly where the app saves it. */
function ensureHeader_(t) {
  if (!TABLES[t]) return;
  const c = CacheService.getScriptCache(), key = 'hdr_' + t + '_' + TABLES[t].length;
  if (c.get(key)) return;
  const ss = ss_(); let sh = ss.getSheetByName(t), changed = false;
  if (!sh) { sh = ss.insertSheet(t); changed = true; }
  const cols = TABLES[t], have = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), cols.length)).getValues()[0].map(String);
  cols.forEach((col, i) => {
    if (have[i] === col) return;
    if (have.indexOf(col) >= 0 && have[i]) return; /* already there in another place: leave the sheet as it is */
    sh.getRange(1, i + 1).setValue(col).setFontWeight('bold'); changed = true;
    if (TEXT_COLS.indexOf(col) >= 0) sh.getRange(1, i + 1, sh.getMaxRows(), 1).setNumberFormat('@');
  });
  if (changed) cacheDrop_('snap');
  c.put(key, '1', 21600);
}

/* ---------- sheet helpers ---------- */
let SS_ = null, TZ_ = null;
const ss_ = () => SS_ || (SS_ = SpreadsheetApp.getActiveSpreadsheet());
const tz_ = () => TZ_ || (TZ_ = ss_().getSpreadsheetTimeZone());
const sh_ = t => ss_().getSheetByName(t);

/* ---------- cache (big values are split in chunks: 100 KB limit per key) ---------- */
const CHUNK_ = 30000, SNAP_TTL = 900, USER_TTL = 900;
function cacheGetBig_(name) {
  const c = CacheService.getScriptCache(), meta = c.get(name + '_meta');
  if (!meta) return null;
  try {
    const m = JSON.parse(meta), keys = [];
    for (let i = 0; i < m.n; i++) keys.push(name + '_' + m.v + '_' + i);
    const got = c.getAll(keys); let str = '';
    for (let i = 0; i < keys.length; i++) { if (got[keys[i]] == null) return null; str += got[keys[i]]; }
    return JSON.parse(str);
  } catch (e) { return null; }
}
function cachePutBig_(name, obj, ttl) {
  try {
    const c = CacheService.getScriptCache(), str = JSON.stringify(obj), v = Date.now(), n = Math.ceil(str.length / CHUNK_), kv = {};
    for (let i = 0; i < n; i++) kv[name + '_' + v + '_' + i] = str.substr(i * CHUNK_, CHUNK_);
    c.putAll(kv, ttl);
    c.put(name + '_meta', JSON.stringify({ v: v, n: n }), ttl);
  } catch (e) { /* too big or cache busy: just skip caching */ }
}
const cacheDrop_ = name => CacheService.getScriptCache().remove(name + '_meta');
/* Run this by hand after editing the Sheet directly, to see your edits immediately. */
function clearCache() { cacheDrop_('snap'); Logger.log('Cache cleared.'); }
/* Google Sheets turns typed text such as "10:15" or "2026-10-10 08:18" into its own date/time values.
   Dates are read back as yyyy-MM-dd (with the time for the columns below); a cell holding only a time (Sheets
   stores it on 30/12/1899) is read from what the Sheet SHOWS, so it is never shifted by old time-zone rules. */
const STAMP_COLS = ['created_at', 'closed_at', 'updated_at', 'published_on', 'at', 'login_at', 'logout_at', 'last_seen', 'decided_at', 'used_at', 'feedback_at', 'marked_at'];
function timeText_(disp, k) {
  const m = /(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?/.exec(String(disp || ''));
  if (!m) return String(disp || '');
  let h = +m[1]; const mi = m[2], ap = m[3] ? m[3].toUpperCase() : '';
  if (ap === 'PM' && h < 12) h += 12; if (ap === 'AM' && h === 12) h = 0;
  return k === 'at_time' ? ((h % 12) || 12) + ':' + mi + ' ' + (h < 12 ? 'AM' : 'PM') : String(h).padStart(2, '0') + ':' + mi;
}
function cellOut_(x, k, disp, tz) {
  if (!(x instanceof Date)) return x;
  if (x.getFullYear() < 1900) return timeText_(disp, k);
  return Utilities.formatDate(x, tz, STAMP_COLS.indexOf(k) >= 0 ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd');
}
function read_(t) {
  const sh0 = sh_(t); if (!sh0) return [];
  const rg = sh0.getDataRange(), v = rg.getValues(), h = v[0], tz = tz_();
  let dv = null; const disp = (i, j) => (dv || (dv = rg.getDisplayValues()))[i][j];
  return v.slice(1).map((r, i) => {
    const o = { __r: i + 2 };
    h.forEach((k, j) => {
      let x = r[j];
      if (x instanceof Date) x = cellOut_(x, k, x.getFullYear() < 1900 ? disp(i + 1, j) : '', tz);
      o[k] = x === '' ? null : (STR_COLS.indexOf(k) >= 0 ? String(x) : x);
    });
    return o;
  }).filter(o => TABLES[t].some(k => o[k] !== null));
}
const clean_ = rows => rows.map(r => { const o = Object.assign({}, r); delete o.__r; return o; });
/* SPEED: the next number reads only that one column, not the whole tab */
const nextId_ = (t, c) => { const sh = sh_(t), last = sh ? sh.getLastRow() : 0, i = TABLES[t].indexOf(c) + 1; if (last < 2 || !i) return 1;
  return sh.getRange(2, i, last - 1, 1).getValues().reduce((m, r) => Math.max(m, +r[0] || 0), 0) + 1; };
const now_ = () => Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd HH:mm');

/* ---------- login / sessions ---------- */
const hash_ = (p, salt) => Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + p));
const pub_ = u => ({ id: u.username, email: u.username + '@krishnakuteer.app', real_email: u.email || '', email_ok: String(u.email_verified).toLowerCase() === 'yes' && !!u.email, role: u.role, flat: u.flat_id, pw_changed: !!u.password_hash });
function findUser_(name) {
  name = String(name || '').trim().toLowerCase().replace(/@krishnakuteer\.app$/, '');
  const u = read_('users').filter(x => String(x.username).trim().toLowerCase() === name)[0] || null;
  if (u) u.role = String(u.role || '').trim().toLowerCase(); /* 'Resident ' / 'ADMIN' still work */
  return u;
}
function login_(b) {
  const cache = CacheService.getScriptCache(), key = 'f_' + String(b.u).toLowerCase(), fails = +cache.get(key) || 0;
  if (fails >= 8) return { error: { message: 'Too many wrong attempts. Please wait 10 minutes and try again.' } };
  const u = findUser_(b.u), p = String(b.p || '');
  const ok = u && (u.password_hash ? hash_(p, u.salt) === u.password_hash : (u.temp_password && String(u.temp_password) === p));
  if (!ok) { cache.put(key, String(fails + 1), 600); return { error: { message: 'Invalid login credentials' } }; }
  cache.remove(key);
  const token = Utilities.getUuid() + Utilities.getUuid();
  cache.put('t_' + token, u.username, 21600);
  let snap = null;
  try { snap = snapshot_(u); } catch (e) { /* app will fetch it separately */ }
  logIn_(token, u, b);
  return { token: token, user: pub_(u), snapshot: snap };
}
function session_(token) {
  if (!token) return null;
  const c = CacheService.getScriptCache(), name = c.get('t_' + token);
  if (!name) return null;
  const key = 'u_' + String(name).toLowerCase(), hit = c.get(key);
  if (hit) { try { return JSON.parse(hit); } catch (e) { /* fall through */ } }
  const u = findUser_(name);
  if (u) c.put(key, JSON.stringify({ username: u.username, role: u.role, flat_id: u.flat_id, password_hash: u.password_hash ? '1' : null, email: u.email || '', email_verified: u.email_verified || '', __r: u.__r }), USER_TTL);
  return u;
}
function pw_(u, b) {
  const p = String(b.password || '');
  if (p.length < 6) return { error: { message: 'Password must be at least 6 characters.' } };
  const salt = Utilities.getUuid(), sh = sh_('users'), h = TABLES.users;
  sh.getRange(u.__r, h.indexOf('password_hash') + 1).setValue(hash_(p, salt));
  sh.getRange(u.__r, h.indexOf('salt') + 1).setValue(salt);
  sh.getRange(u.__r, h.indexOf('temp_password') + 1).setValue('');
  CacheService.getScriptCache().remove('u_' + String(u.username).toLowerCase());
  return { ok: true };
}

/* ---------- e-mail verification + forgot password (codes are e-mailed from your Gmail) ---------- */
const CODE_TTL = 600, MAX_TRIES = 5, MAX_SENDS = 3;
const validEmail_ = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 120;
const mask_ = e => { const p = String(e).split('@'); return p[0].slice(0, 2) + '***@' + p[1]; };
function newCode_() { return String(100000 + parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 8), 16) % 900000); }
function sendMail_(to, subject, body) {
  MailApp.sendEmail({ to: to, subject: subject, body: body, name: 'Krishna Kuteer Apartment', noReply: true });
}
/* limits sends per ID: 3 codes per hour */
function sendLimit_(kind, name) {
  const c = CacheService.getScriptCache(), k = 'sc_' + kind + '_' + String(name).toLowerCase(), n = +c.get(k) || 0;
  if (n >= MAX_SENDS) return false;
  c.put(k, String(n + 1), 3600); return true;
}
function storeCode_(key, code, extra) {
  const salt = Utilities.getUuid();
  CacheService.getScriptCache().put(key, JSON.stringify(Object.assign({ h: hash_(code, salt), s: salt, n: 0 }, extra || {})), CODE_TTL);
}
/* returns {ok:true, data} or {error} ; counts wrong tries and burns the code after 5 */
function checkCode_(key, code) {
  const c = CacheService.getScriptCache(), raw = c.get(key);
  if (!raw) return { error: 'This code has expired. Please ask for a new one.' };
  const d = JSON.parse(raw);
  if (hash_(String(code || '').trim(), d.s) !== d.h) {
    d.n++; if (d.n >= MAX_TRIES) { c.remove(key); return { error: 'Too many wrong codes. Please ask for a new one.' }; }
    c.put(key, JSON.stringify(d), CODE_TTL); return { error: 'Wrong code. Please check and try again.' };
  }
  c.remove(key); return { ok: true, data: d };
}
function emailSend_(u, b) {
  const email = String(b.email || '').trim().toLowerCase();
  if (!validEmail_(email)) return { error: { message: 'Please enter a valid e-mail address.' } };
  if (!sendLimit_('ev', u.username)) return { error: { message: 'Too many codes requested. Please try again after an hour.' } };
  const code = newCode_(); storeCode_('ev_' + String(u.username).toLowerCase(), code, { e: email });
  try { sendMail_(email, 'Krishna Kuteer - verify your e-mail', 'Your verification code is ' + code + '\n\nIt works for 10 minutes. If you did not ask for this, ignore this e-mail.'); }
  catch (err) { return { error: { message: 'Could not send the e-mail. (Admin: run authorizeMail in Apps Script and deploy a New version.)' } }; }
  return { ok: true };
}
function emailVerify_(u, b) {
  const r = checkCode_('ev_' + String(u.username).toLowerCase(), b.code);
  if (r.error) return { error: { message: r.error } };
  const sh = sh_('users'), h = TABLES.users;
  sh.getRange(u.__r, h.indexOf('email') + 1).setValue(r.data.e);
  sh.getRange(u.__r, h.indexOf('email_verified') + 1).setValue('yes');
  CacheService.getScriptCache().remove('u_' + String(u.username).toLowerCase());
  return { ok: true, email: r.data.e };
}
/* Forgot password step 1: e-mail a code to the VERIFIED address saved for this ID */
function fpSend_(b) {
  const u = findUser_(b.u), generic = { ok: true };
  if (!u) return { error: { message: 'Please select your ID.' } };
  if (!u.email || String(u.email_verified).toLowerCase() !== 'yes')
    return { error: { message: 'No verified e-mail is saved for this ID. Please ask the admin to reset your password.' } };
  if (!sendLimit_('fp', u.username)) return { error: { message: 'Too many codes requested. Please try again after an hour.' } };
  const code = newCode_(); storeCode_('fp_' + String(u.username).toLowerCase(), code);
  try { sendMail_(u.email, 'Krishna Kuteer - password reset code', 'Your password reset code is ' + code + '\n\nIt works for 10 minutes. If you did not ask for this, ignore this e-mail; your password is unchanged.'); }
  catch (err) { return { error: { message: 'Could not send the e-mail. Please contact the admin.' } }; }
  return { ok: true, masked: mask_(u.email) };
}
/* Forgot password step 2: check code, set new password */
function fpReset_(b) {
  const u = findUser_(b.u), p = String(b.password || '');
  if (!u) return { error: { message: 'Please select your ID.' } };
  if (p.length < 6) return { error: { message: 'Password must be at least 6 characters.' } };
  const r = checkCode_('fp_' + String(u.username).toLowerCase(), b.code);
  if (r.error) return { error: { message: r.error } };
  const r2 = pw_(u, { password: p }); CacheService.getScriptCache().remove('f_' + String(u.username).toLowerCase());
  if (r2.ok) audit_(u, 'password', 'users', u.username, 'Password reset with e-mail code', null, null);
  return r2;
}

/* ---------- login activity log (tab 'login_log'): who signed in, when, how long. Passwords are never stored. ---------- */
function logIn_(token, u, b) {
  try {
    const sh = sh_('login_log'); if (!sh) return;
    const lock = LockService.getScriptLock(); lock.waitLock(5000);
    try { sh.appendRow([u.username, u.role, now_(), '', now_(), 0, String(b.dev || '').slice(0, 60)]); CacheService.getScriptCache().put('ls_' + token, JSON.stringify({ r: sh.getLastRow(), s: Date.now() }), 21600); }
    finally { lock.releaseLock(); }
  } catch (e) { /* logging must never block sign-in */ }
}
function logTouch_(token, out) {
  try {
    const c = CacheService.getScriptCache(), raw = c.get('ls_' + token); if (!raw || (!out && c.get('lt_' + token))) return;
    const d = JSON.parse(raw), sh = sh_('login_log'); if (!sh) return;
    sh.getRange(d.r, 4, 1, 3).setValues([[out ? now_() : '', now_(), Math.round((Date.now() - d.s) / 6000) / 10]]);
    if (!out) { sh.getRange(d.r, 4).clearContent(); c.put('lt_' + token, '1', 300); }
  } catch (e) {}
}

/* ---------- photos + PDFs: stored INSIDE the Google Sheet (tab 'file_data'), max 1 MB each, in 45,000-character pieces ---------- */
const FOLDERS = ['Agenda & M.O.M', 'Apartment Works', 'Association', 'Electricity', 'Generator', 'GHMC & Plumber', 'Lift', 'Monthly Register',
  'Watchmen Salary & Cleaning Purchases', 'Water (HMWSSB) & Water Related', 'Other', 'Dust Collector', 'Motor', 'CCTV Camera', 'Complaints'];
const FOLDER_RENAMED = { 'Watchmen Salary': 'Watchmen Salary & Cleaning Purchases' }; /* old name -> new name */
const ROOT_FOLDER = 'Krishna Kuteer Apartment Documents';
/* 'Association only' documents are saved in a SEPARATE Drive folder, so sharing the main folder never shows them. Do not share this one with residents. (It was called 'Krishna Kuteer Committee Documents (private)' before; setup() renames it.) */
const PRIV_FOLDER = 'Krishna Kuteer Association Documents (private)', PRIV_FOLDER_OLD = 'Krishna Kuteer Committee Documents (private)';
function privDir_(n) { let it = DriveApp.getFoldersByName(PRIV_FOLDER); if (!it.hasNext()) { const o = DriveApp.getFoldersByName(PRIV_FOLDER_OLD); if (o.hasNext()) { o.next().setName(PRIV_FOLDER); it = DriveApp.getFoldersByName(PRIV_FOLDER); } } const root = it.hasNext() ? it.next() : DriveApp.createFolder(PRIV_FOLDER); return driveFolder_(root, safeName_(n)); }
const MAX_BYTES = 1000000, PIECE = 45000;
function upload_(u, b) {
  const err = m => ({ error: { message: m } });
  if (!verified_(u)) return err('Please verify your e-mail first.');
  if (b.kind === 'register' ? REG_ROLE.indexOf(u.role) < 0 : b.kind === 'gallery' ? DOCUP.indexOf(u.role) < 0 : b.kind !== 'complaint') return err('You do not have permission to do this.');
  if (b.kind === 'register' && !/^data:image\/(jpeg|png|webp);/.test(String(b.img || ''))) return err('Please choose a photo (JPG or PNG).');
  const m = /^data:(image\/(?:jpeg|png|webp)|application\/pdf|audio\/(?:webm|ogg|mp4|mpeg));base64,([A-Za-z0-9+\/=]+)$/.exec(String(b.img || ''));
  if (!m) return err('Please choose a photo or a PDF file.');
  if (m[1] === 'application/pdf' && b.kind !== 'gallery') return err('PDF files are not allowed here.');
  if (/^audio\//.test(m[1]) && b.kind !== 'complaint') return err('Voice notes are only allowed in complaints.');
  if (m[2].length * 0.75 > MAX_BYTES) return err('File must be under 1 MB.');
  const sh = sh_('file_data'); if (!sh) return err('Run setup() once in Apps Script to create the new tabs.');
  const id = 'f' + Utilities.getUuid().replace(/-/g, ''), rows = [];
  for (let i = 0, n = 1; i < m[2].length; i += PIECE, n++) rows.push([id, n, m[1], m[2].slice(i, i + PIECE)]);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const start = Math.max(sh.getLastRow(), 1) + 1, need = start + rows.length - 1 - sh.getMaxRows();
    if (need > 0) sh.insertRowsAfter(sh.getMaxRows(), need);
    sh.getRange(start, 1, rows.length, 4).setValues(rows);
  } finally { lock.releaseLock(); }
  CacheService.getScriptCache().put('up_' + id, String(u.username), 7200);
  return { ok: true, id: id };
}
function fileRows_(id) {
  const sh = sh_('file_data'); if (!sh || !/^f[0-9a-f]{32}$/.test(id)) return null;
  const hits = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).createTextFinder(id).matchEntireCell(true).findAll().map(r => r.getRow()).sort((x, y) => x - y);
  return hits.length ? { sh: sh, first: hits[0], n: hits.length } : null;
}
function delFile_(id) { try { const f = fileRows_(id); if (f) f.sh.deleteRows(f.first, f.n); } catch (e) {} }
function photo_(u, b) {
  const id = String(b.id || ''), T = tables_(), S4 = ['admin', 'treasurer', 'secretary', 'president'];
  if (!verified_(u)) return { error: { message: 'Photo not available.' } };
  const ok = T.gallery.some(r => String(r.photo) === id && (r.visibility !== 'committee' || u.role !== 'resident')) ||
    T.complaints.some(r => (String(r.photos || '').split('|').concat(String(r.reply_photos || '').split('|')).indexOf(id) >= 0 || String(r.voice || '') === id) && (S4.indexOf(u.role) >= 0 || String(r.flat_no).toLowerCase() === String(u.username).toLowerCase()));
  const okReg = !ok && REG_ROLE.indexOf(u.role) >= 0 && sh_('visitor_imports') && read_('visitor_imports').some(r => String(r.photo) === id);
  const f = (ok || okReg) && fileRows_(id);
  if (!f) return { error: { message: 'Photo not available.' } };
  const v = f.sh.getRange(f.first, 3, f.n, 2).getValues();
  return { ok: true, img: 'data:' + v[0][0] + ';base64,' + v.map(r => r[1]).join('') };
}

/* ---------- reading ---------- */
function tables_() {
  const hit = cacheGetBig_('snap');
  if (hit) return hit;
  const T = {};
  SNAP_T.forEach(t => T[t] = clean_(read_(t)));
  cachePutBig_('snap', T, SNAP_TTL);
  return T;
}
const SNAP_T = ['flats', 'payments', 'expenses', 'income', 'maintenance_rates', 'closed_months', 'notices', 'settings', 'maintenance_log', 'celebrations', 'visitors', 'complaints', 'gallery', 'meetings', 'polls', 'votes', 'status',
  'assets', 'asset_service', 'reminders', 'contacts', 'action_items', 'guest_passes', 'staff', 'leaves', 'attendance', 'asset_items'];
/* E-mail verification is OPTIONAL: everybody may use the site without it (it is only needed for 'Forgot password'). */
const verified_ = u => true;
/* What each person receives. The FULL data never leaves the server for a resident: other flats' private details are removed here,
   not just hidden on the screen. */
function snapshot_(u) {
  if (!verified_(u)) return { me: pub_(u) }; /* e-mail is optional */
  const T0 = tables_(), T = Object.assign({}, T0);
  T.me = pub_(u);
  const mine = String(u.username).toLowerCase(), res = u.role === 'resident', myFlat = String(u.flat_id || '');
  const pick = (rows, keys) => rows.map(r => { const o = {}; keys.forEach(k => { if (r[k] !== undefined) o[k] = r[k]; }); return o; });
  T.guest_passes = T.guest_passes || [];
  const noCode = rows => rows.map(r => { const o = Object.assign({}, r); delete o.code; return o; });
  /* the gate phone gets only what the gate needs: flats (with their gate phone), visitors, contacts and today's guest passes without their codes */
  if (u.role === 'watchman') {
    const W = {}; SNAP_T.forEach(t => W[t] = []);
    W.flats = pick(T0.flats, ['id', 'flat_no', 'phone']); W.visitors = T0.visitors; W.contacts = T0.contacts;
    W.guest_passes = noCode(T0.guest_passes.filter(g => g.status === 'active'));
    W.staff = (T0.staff || []).filter(x => x.active !== 'no'); W.leaves = T0.leaves || []; W.attendance = T0.attendance || []; W.notices = T0.notices;
    W.me = T.me; W.profiles = [{ id: u.username, role: u.role, flat_id: u.flat_id }]; W.balance = []; W.votes = [];
    return W;
  }
  if (res) {
    T.guest_passes = T.guest_passes.filter(g => String(g.flat_no).toLowerCase() === mine);
    T.staff = []; T.leaves = []; T.attendance = []; /* watchman records stay with the Association (residents see leave through the notice) */
    T.flats = T.flats.map(f => String(f.flat_no).toLowerCase() === mine ? f : pick([f], ['id', 'flat_no', 'monthly_amount'])[0]);
  } else T.guest_passes = noCode(T.guest_passes);
  if (res) {
    T.complaints = T.complaints.filter(c => String(c.flat_no).toLowerCase() === mine);
    /* payments: every flat's total stays visible for the monthly register, but receipt numbers, references and remarks only for your own flat */
    T.payments = T.payments.map(p => String(p.flat_id) === myFlat ? p : pick([p], ['id', 'flat_id', 'month', 'amount', 'paid_on', 'mode'])[0]);
    T.income = pick(T.income, ['id', 'received_on', 'category', 'amount', 'mode', 'created_at']);
    T.gallery = T.gallery.filter(g => g.visibility !== 'committee');
    /* visitors: totals stay; names, purpose and times only for visitors to your own flat; phone numbers never */
    T.visitors = T.visitors.map(v => String(v.flat_no || '').toLowerCase() === mine ? pick([v], ['id', 'visit_on', 'count', 'name', 'flat_no', 'purpose', 'in_time', 'out_time', 'status', 'decided_by', 'decided_at', 'created_at', 'added_by'])[0] : pick([v], ['id', 'visit_on', 'count'])[0]);
    /* meetings: minutes, resolutions, attendance and action items only after the committee publishes them */
    const pub = {};
    T.meetings = T.meetings.map(m => { if (m.status === 'published') { pub[m.id] = 1; return m; } return pick([m], ['id', 'title', 'on_date', 'at_time', 'place', 'kind', 'created_at', 'te', 'agenda', 'status'])[0]; });
    T.action_items = T.action_items.filter(a => pub[a.meeting_id]);
    T.asset_service = T.asset_service.map(s => { const o = Object.assign({}, s); delete o.cost; return o; });
    T.asset_items = (T.asset_items || []).map(s => { const o = Object.assign({}, s); delete o.cost; delete o.bought_from; delete o.added_by; return o; }); /* residents: no prices */
    T.reminders = [];
  } else if (SEEVIS.indexOf(u.role) < 0) T.visitors = T.visitors.map(v => { const o = Object.assign({}, v); delete o.phone; return o; });
  T.votes = T.votes.map(v => ({ poll_id: v.poll_id, choice: v.choice, mine: String(v.flat_no).toLowerCase() === mine })); /* ballots stay anonymous */
  T.profiles = [{ id: u.username, role: u.role, flat_id: u.flat_id }];
  T.balance = res ? [] : [balance_(T)];
  return T;
}
function balance_(T) {
  const s = T.settings[0] || {}, k = r => (r.mode || 'cash') === 'cash' ? 'cash' : 'bank';
  const v = { cash: +s.opening_cash || 0, bank: +s.opening_bank || 0 }, open = v.cash + v.bank;
  let rec = 0, spent = 0;
  T.payments.forEach(p => { v[k(p)] += +p.amount; rec += +p.amount; });
  T.income.filter(i => i.category === 'other').forEach(p => { v[k(p)] += +p.amount; rec += +p.amount; });
  T.expenses.forEach(p => { v[k(p)] -= +p.amount; spent += +p.amount; });
  return { opening_balance: open, received: rec, spent: spent, cash: v.cash, bank: v.bank, closing: v.cash + v.bank };
}

/* ---------- writing (permissions + month locks enforced here) ---------- */
let TOUCHED_ = {}, ASK_ = false, LAST_ID_ = null; /* every tab changed by one save, so the cached copy of each is refreshed */
const DATE_COLS = ['bought_on', 'installed_on', 'warranty_until', 'service_on', 'next_due', 'due_on', 'expected_on', 'on_date', 'visit_on'];
const isDate_ = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ''));
const isTime_ = x => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(x || ''));
const today_ = () => now_().slice(0, 10);
/* text that starts with = + or - would become a formula inside the Sheet: store it as plain text instead */
/* A leading ' keeps it as text. It is also used for times ("10:15", "6:00 PM") and numbers with a leading 0 (phone numbers),
   which Sheets would otherwise change into its own time value or drop the 0 from. Dates (yyyy-MM-dd) are left alone. */
const cell_ = v => (typeof v === 'string' && ((/^[=+\-@]/.test(v) && isNaN(+v)) || /^\d{1,2}:\d{2}/.test(v) || /^0\d+$/.test(v))) ? "'" + v : v;
const addMonths_ = (d, n) => { const x = new Date(String(d).slice(0, 10) + 'T00:00:00Z'); x.setUTCMonth(x.getUTCMonth() + n); return x.toISOString().slice(0, 10); };
const byId_ = (t, id) => read_(t).filter(r => String(r.id) === String(id))[0] || null;
function appendRec_(t, rec) {
  const cols = TABLES[t];
  if (cols.indexOf('id') >= 0 && rec.id == null) rec.id = nextId_(t, 'id');
  if (cols.indexOf('created_at') >= 0 && !rec.created_at) rec.created_at = now_();
  sh_(t).appendRow(cols.map(c => rec[c] == null ? '' : cell_(rec[c])));
  TOUCHED_[t] = 1;
  return rec;
}
function setCells_(t, row, p) {
  const sh = sh_(t);
  TABLES[t].forEach((c, i) => { if (p[c] != null && c !== 'id') sh.getRange(row, i + 1).setValue(cell_(p[c])); });
  TOUCHED_[t] = 1;
}
/* marks a reminder done; a repeating one (e.g. lift service every month) gets its next due date straight away */
function doneReminder_(u, rem, on, nextDue) {
  if (!rem || rem.status === 'done') return;
  on = isDate_(on) ? on : today_();
  setCells_('reminders', rem.__r, { status: 'done', done_on: on });
  audit_(u, 'update', 'reminders', rem.id, 'Done: ' + rem.title + ' (due ' + String(rem.due_on).slice(0, 10) + ')', { status: rem.status }, { status: 'done', done_on: on });
  const rep = Math.floor(+rem.repeat_months || 0);
  let next = isDate_(nextDue) ? nextDue : '';
  if (!next && rep > 0) { next = addMonths_(rem.due_on, rep); for (let k = 0; k < 600 && next <= on; k++) next = addMonths_(next, rep); }
  if (next) {
    const r = appendRec_('reminders', { title: rem.title, asset_id: rem.asset_id, kind: rem.kind || 'service', due_on: next, repeat_months: rep, notify_days: rem.notify_days, status: 'pending', notes: rem.notes });
    audit_(u, 'insert', 'reminders', r.id, 'Next reminder: ' + rem.title + ' on ' + next, null, r);
  }
}
function write_(u, b) {
  const t = b.t, op = b.op, allowed = RULES[t] && RULES[t][op], err = m => ({ error: { message: m } });
  if (!allowed || allowed.indexOf(u.role) < 0) return err('You do not have permission to do this.');
  const closed = read_('closed_months').map(r => String(r.month).slice(0, 7));
  const locked = d => d && closed.indexOf(String(d).slice(0, 7)) >= 0;
  const LOCKMSG = 'This month is locked. Nothing can be added, changed or deleted in it.';
  const cols = TABLES[t], sh = sh_(t), raw = b.payload || {}, p = {};
  if (!sh) return err('Run setup() once in Apps Script to create the new tabs.');
  /* only real columns, never the ones the server fills, and no huge texts */
  Object.keys(raw).forEach(k => {
    if (cols.indexOf(k) < 0 || SYS_COLS.indexOf(k) >= 0) return;
    let v = raw[k];
    if (v != null && typeof v === 'object') v = JSON.stringify(v);
    if (typeof v === 'string') v = v.slice(0, k === 'minutes' || k === 'agenda' || k === 'resolutions' ? 8000 : 3000);
    p[k] = v;
  });
  /* edited text gets a fresh Telugu copy */
  if (op === 'update' && TE_FIELDS[t] && cols.indexOf('te') >= 0 && TE_FIELDS[t].some(k => p[k] != null)) p.te = '';
  const bad = DATE_COLS.filter(c => p[c] != null && p[c] !== '' && !isDate_(p[c]))[0];
  if (bad) return err('Please enter a valid date.');
  const E = ENUM[t] || {};
  const badE = Object.keys(E).filter(c => p[c] != null && p[c] !== '' && E[c].indexOf(p[c]) < 0)[0];
  if (badE) return err('Invalid ' + badE.replace(/_/g, ' ') + '.');
  const find = () => read_(t).filter(r => (b.filters || []).every(f => String(r[f[0]]) === String(f[1])));
  const before = (op === 'update' || op === 'delete') ? find() : [];
  if ((op === 'update' || op === 'delete') && cols.indexOf('id') >= 0 && !(b.filters || []).length) return err('Record not found.');
  let after = null; /* extra things to do once the main save has gone through */

  if (t === 'complaints') {
    if (op === 'insert') {
      if (!String(p.title || '').trim()) return err('Please describe the problem.');
      p.flat_no = u.username; p.status = 'open'; p.updated_at = now_();
      if (S.indexOf(u.role) < 0) { delete p.assigned_to; delete p.expected_on; }
      if (p.asset_id && !byId_('assets', p.asset_id)) p.asset_id = '';
      const y = now_().slice(0, 4), n = read_('complaints').filter(c => String(c.ticket_no || '').indexOf('KK-' + y + '-') === 0).reduce((m, c) => Math.max(m, +String(c.ticket_no).split('-').pop() || 0), 0) + 1;
      p.ticket_no = ticketOf_(y, n);
      p.history = JSON.stringify([{ at: now_(), by: u.username, status: 'open', note: 'Complaint raised' }]);
    }
    if (op === 'update') {
      if (p.status != null && ['open', 'in_progress', 'resolved'].indexOf(p.status) < 0) return err('Invalid status.');
      if (p.status != null && p.status !== 'resolved') { p.feedback = ''; p.feedback_note = ''; p.feedback_at = ''; } /* reopened: the old feedback no longer applies */
      if (p.asset_id && !byId_('assets', p.asset_id)) return err('Choose an item from the list.');
      p.updated_at = now_();
      const note = String(raw.note || '').trim().slice(0, 500);
      const mineU = id => CacheService.getScriptCache().get('up_' + id) === String(u.username);
      const rph = String(raw.reply_photos || '').split('|').filter(Boolean);
      if (rph.length > 3 || !rph.every(mineU)) return err('Photo upload failed. Please try again.');
      after = () => before.forEach(c => {
        let h = []; try { h = JSON.parse(c.history || '[]'); } catch (e) {}
        if (!h.length) h.push({ at: c.created_at, by: c.flat_no, status: 'open', note: 'Complaint raised' });
        const e = { at: now_(), by: u.username };
        if (p.status != null && p.status !== c.status) e.status = p.status;
        if (p.assigned_to != null && String(p.assigned_to) !== String(c.assigned_to || '')) e.assigned_to = p.assigned_to;
        if (p.expected_on != null && String(p.expected_on) !== String(c.expected_on || '')) e.expected_on = p.expected_on;
        if (note) e.note = note;
        if (rph.length) { e.photos = rph.join('|'); sh.getRange(c.__r, cols.indexOf('reply_photos') + 1).setValue(String(c.reply_photos || '').split('|').filter(Boolean).concat(rph).slice(-30).join('|')); }
        if (Object.keys(e).length <= 2) return;
        h.push(e);
        sh.getRange(c.__r, cols.indexOf('history') + 1).setValue(JSON.stringify(h.slice(-60)));
        /* resolved: the complete record (details + full status history) is saved as a text file in Drive > Complaints */
        if (e.status === 'resolved' || (c.status === 'resolved' && rph.length)) { const rec = Object.assign({}, c, p, { history: JSON.stringify(h), status: e.status || c.status }); LATER_.push(() => { try { complaintRecord_(rec); } catch (x) { Logger.log('Drive record failed: ' + x); } }); }
        if (e.status) {
          const L = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' };
          queuePush_('Complaint ' + (c.ticket_no || '#' + c.id) + ': ' + L[e.status], String(c.title || '') + (note ? ' - ' + note : ''), { user: c.flat_no });
        }
      });
    }
  }
  const mine = id => CacheService.getScriptCache().get('up_' + id) === String(u.username);
  if (t === 'complaints' && op === 'insert') {
    const ids = String(p.photos || '').split('|').filter(Boolean);
    if (ids.length > 3 || !ids.every(mine)) return err('Photo upload failed. Please try again.');
    p.photos = ids.join('|');
    const vid = String(p.voice || '').trim();
    if (vid && !mine(vid)) return err('Voice note upload failed. Please try again.');
    p.voice = vid;
  }
  if (t === 'gallery' && op === 'insert') {
    if (!mine(String(p.photo || ''))) return err('Photo upload failed. Please try again.');
    p.title = String(p.title || '').slice(0, 120); p.uploaded_by = u.username; p.kind = p.kind === 'pdf' ? 'pdf' : 'photo'; p.name = String(p.name || '').slice(0, 120); p.folder = FOLDER_RENAMED[p.folder] || p.folder; p.folder = FOLDERS.indexOf(p.folder) >= 0 ? p.folder : 'Other';
    p.visibility = p.visibility === 'committee' ? 'committee' : 'all';
  }
  if ((t === 'gallery' || t === 'complaints') && op === 'delete') before.forEach(r => [r.photo, r.photos, r.voice, r.reply_photos].filter(Boolean).join('|').split('|').filter(Boolean).forEach(delFile_));

  if (t === 'meetings') {
    if (op === 'insert') { if (!String(p.title || '').trim() || !p.on_date || ['meeting', 'event'].indexOf(p.kind) < 0) return err('Enter a title, date and type.'); p.status = 'draft'; }
    if (op === 'update') {
      if (p.title != null && !String(p.title).trim()) return err('Enter a title, date and type.');
      if (p.kind != null && ['meeting', 'event'].indexOf(p.kind) < 0) return err('Enter a title, date and type.');
      if (p.status === 'published' && before.some(m => m.status !== 'published')) {
        p.published_on = now_();
        after = () => before.filter(m => m.status !== 'published').forEach(m => queuePush_('Meeting record published', String(p.title || m.title || '') + ' - ' + String(m.on_date || '').slice(0, 10)));
      }
    }
    if (op === 'delete') after = () => before.forEach(m => read_('action_items').filter(x => String(x.meeting_id) === String(m.id)).sort((x, y) => y.__r - x.__r).forEach(x => { sh_('action_items').deleteRow(x.__r); TOUCHED_.action_items = 1; }));
    if (p.attendance != null) p.attendance = String(p.attendance).split('|').map(x => x.trim()).filter(Boolean).slice(0, 200).join('|');
  }
  if (t === 'action_items') {
    if (op === 'insert') { if (!String(p.task || '').trim()) return err('Enter the task.'); if (!byId_('meetings', p.meeting_id)) return err('Meeting not found.'); p.status = 'open'; }
    if (p.status != null) p.done_on = p.status === 'done' ? today_() : '';
  }
  if (t === 'assets') {
    if (op === 'insert') { if (!String(p.name || '').trim()) return err('Enter the name of the item.'); p.kind = p.kind || 'other'; p.status = p.status || 'working'; }
    if (op === 'update' && p.name != null && !String(p.name).trim()) return err('Enter the name of the item.');
    if (op === 'delete' && before.some(a => read_('asset_service').some(s => String(s.asset_id) === String(a.id))))
      return err('This item has service records. Mark it "Out of service" instead, or delete its service records first.');
    if (op === 'delete') after = () => before.forEach(a => read_('reminders').filter(r => String(r.asset_id) === String(a.id) && r.status !== 'done').sort((x, y) => y.__r - x.__r).forEach(r => { sh_('reminders').deleteRow(r.__r); TOUCHED_.reminders = 1; }));
  }
  if (t === 'asset_items') {
    if (op === 'insert' || p.name != null) { if (!String(p.name || '').trim()) return err('Enter the name of the item.'); }
    if (op === 'insert' || p.qty != null) { const q = +p.qty; if (!(q >= 0 && q <= 100000) || Math.floor(q) !== q) return err('Enter the quantity (0 or more).'); p.qty = q; }
    if (p.cost != null && p.cost !== '' && !(+p.cost >= 0)) return err('Enter a cost of 0 or more.');
    if (op === 'insert') { p.category = p.category || 'other'; p.condition = p.condition || 'good'; p.unit = String(p.unit || '').trim() || 'pcs'; p.added_by = u.username; }
  }
  if (t === 'asset_service' && op === 'insert') {
    const as = byId_('assets', p.asset_id); if (!as) return err('Choose the item that was serviced.');
    if (!isDate_(p.service_on)) return err('Please enter a valid date.');
    p.kind = p.kind || 'service';
    if (p.cost != null && p.cost !== '' && !(+p.cost >= 0)) return err('Enter a cost of 0 or more.');
    const rid = p.reminder_id, nd = p.next_due;
    after = () => {
      const rem = rid ? byId_('reminders', rid) : null;
      if (rem) doneReminder_(u, rem, p.service_on, nd);
      else if (nd) { const r = appendRec_('reminders', { title: 'Service due: ' + as.name, asset_id: as.id, kind: 'service', due_on: nd, repeat_months: 0, notify_days: 7, status: 'pending' }); audit_(u, 'insert', 'reminders', r.id, r.title + ' on ' + nd, null, r); }
    };
  }
  if (t === 'reminders') {
    if (op === 'insert') { if (!String(p.title || '').trim() || !isDate_(p.due_on)) return err('Enter what is due and the due date.'); p.status = 'pending'; p.kind = p.kind || 'service'; }
    if (p.repeat_months != null && p.repeat_months !== '') { const n = Math.floor(+p.repeat_months); if (!(n >= 0 && n <= 60)) return err('Repeat must be 0 to 60 months.'); p.repeat_months = n; }
    if (p.notify_days != null && p.notify_days !== '') { const n = Math.floor(+p.notify_days); if (!(n >= 0 && n <= 90)) return err('Alert days must be 0 to 90.'); p.notify_days = n; }
    if (op === 'insert' && (p.notify_days == null || p.notify_days === '')) p.notify_days = 7;
    if (p.asset_id && !byId_('assets', p.asset_id)) p.asset_id = '';
    if (op === 'update' && p.status === 'done') {
      const on = raw.done_on, nd = raw.next_due; delete p.status;
      after = () => before.forEach(r => doneReminder_(u, byId_('reminders', r.id), on, nd));
    }
    if (op === 'update' && p.status === 'pending') p.done_on = '';
  }
  if (t === 'contacts') {
    if (op === 'insert' && (!String(p.name || '').trim() || !p.phone)) return err('Enter a name and a phone number.');
    if (p.phone != null && !/^[0-9+\-\s()]{3,20}$/.test(String(p.phone))) return err('Enter a valid phone number.');
    if (p.alt_phone && !/^[0-9+\-\s()]{3,20}$/.test(String(p.alt_phone))) return err('Enter a valid phone number.');
    p.category = p.category || (op === 'insert' ? 'other' : p.category);
    if (raw.verified === true || raw.verified === 'yes') p.verified_on = today_();
    p.updated_by = u.username;
  }
  if (t === 'visitors') {
    if (op === 'insert') delete p.status;
    /* a resident records their own visitor when the watchman missed it: only for their own flat, and only entry / exit */
    if (u.role === 'resident') {
      const me = String(u.username).toLowerCase();
      if (op === 'insert') {
        if (raw.pass_code || raw.ask) return err('You do not have permission to do this.');
        if (raw.always_pass_id) { const g = read_('guest_passes').filter(x => String(x.id) === String(raw.always_pass_id))[0]; if (!g || String(g.flat_no).toLowerCase() !== me) return err('You do not have permission to do this.'); }
        else { if (!String(p.name || '').trim()) return err('Enter the visitor\'s name.'); p.status = 'by_flat'; p.decided_by = u.username; p.decided_at = now_(); }
        p.flat_no = u.username; delete p.phone;
      }
      if (op === 'update') {
        if (Object.keys(p).some(k => k !== 'out_time')) return err('You can only record the exit time.');
        if (before.some(r => String(r.flat_no).toLowerCase() !== me)) return err('You do not have permission to do this.');
      }
    }
    /* entry with a guest pass: a 6-digit code (one visit) or a flat's 'always allowed' person */
    if (op === 'insert' && (raw.pass_code || raw.always_pass_id)) {
      const g = raw.pass_code ? findPass_(raw.pass_code) : read_('guest_passes').filter(x => String(x.id) === String(raw.always_pass_id) && x.kind === 'always' && x.status === 'active')[0];
      if (!g || !passValid_(g)) return err(raw.pass_code ? 'This code is not valid today.' : 'This person is no longer on the allowed list.');
      p.flat_no = String(g.flat_no); p.name = String(p.name || '').trim() || g.name; p.purpose = p.purpose || g.purpose || '';
      p.status = g.kind === 'always' ? 'always' : 'pre_approved'; p.pass_id = g.id; p.decided_by = String(g.flat_no); p.decided_at = now_();
      after = () => {
        if (g.kind !== 'always') { setCells_('guest_passes', g.__r, { status: 'used', used_at: now_() }); queuePush_('Your guest has arrived', p.name + ' (pre-approved) entered at ' + (p.in_time || ''), { user: g.flat_no }); }
      };
    }
    if (op === 'insert' && String(p.name || '').trim()) {
      if (!String(p.flat_no || '').trim()) return err('Choose the flat visited.');
      p.count = 1; p.added_by = u.username;
      if (!isTime_(p.in_time)) return err('Enter the entry time.');
      /* ask the flat: their phones get an alert with Approve / Deny */
      if (raw.ask === true && !p.status) {
        if (!read_('flats').some(f => String(f.flat_no) === String(p.flat_no))) return err('Approval can only be asked from a flat.');
        p.status = 'waiting';
        after = () => {};
        ASK_ = true;
      }
    }
    if (op === 'update') {
      if (p.status != null && ['no_answer', 'cancelled', 'waiting'].indexOf(p.status) < 0) return err('Invalid status.');
      if (p.status === 'waiting') ASK_ = 'again';
      if (p.status != null) { const st = p.status; after = () => before.forEach(r => CacheService.getScriptCache().put('vs_' + r.id, st, 21600)); }
    }
    if (p.in_time != null && p.in_time !== '' && !isTime_(p.in_time)) return err('Enter a valid time.');
    if (p.out_time != null && p.out_time !== '' && !isTime_(p.out_time)) return err('Enter a valid time.');
    if (p.phone && !/^[0-9+\-\s()]{3,20}$/.test(String(p.phone))) return err('Enter a valid phone number.');
    if (op === 'update') { delete p.count; delete p.visit_on; }
  }

  if (t === 'guest_passes') {
    if (op === 'insert') {
      if (u.role === 'resident') p.flat_no = u.username;
      else if (!read_('flats').some(f => String(f.flat_no) === String(p.flat_no))) return err('Choose the flat.');
      if (!String(p.name || '').trim()) return err('Enter the guest\'s name.');
      p.kind = p.kind === 'always' ? 'always' : 'once';
      p.valid_from = isDate_(p.valid_from) ? p.valid_from : today_();
      if (p.kind === 'once') { p.valid_to = isDate_(p.valid_to) ? p.valid_to : p.valid_from; if (p.valid_to < p.valid_from) return err('The last day must be on or after the first day.'); if (p.valid_to < today_()) return err('Choose today or a later day.'); }
      else p.valid_to = isDate_(p.valid_to) ? p.valid_to : '';
      const used = {}; read_('guest_passes').forEach(g => { if (g.status === 'active') used[String(g.code)] = 1; });
      let c; do { c = String(100000 + parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 8), 16) % 900000); } while (used[c]);
      p.code = c; p.status = 'active'; p.created_by = u.username;
    }
    if (op === 'update') {
      if (Object.keys(p).some(k => k !== 'status') || p.status !== 'cancelled') return err('A guest pass can only be cancelled.');
      if (u.role === 'resident' && before.some(g => String(g.flat_no).toLowerCase() !== String(u.username).toLowerCase())) return err('You do not have permission to do this.');
    }
  }
  /* ---------- watchman: staff, leave, attendance ---------- */
  if (t === 'staff') {
    if (op === 'insert' && !String(p.name || '').trim()) return err('Enter the name.');
    if (op === 'insert') { p.role = p.role || 'watchman'; p.active = 'yes'; }
    if (p.paid_leaves_year != null && p.paid_leaves_year !== '') { const n = +p.paid_leaves_year; if (!(n >= 0 && n <= 365)) return err('Paid leaves must be 0 to 365 days a year.'); p.paid_leaves_year = n; }
    if (op === 'insert' && (p.paid_leaves_year == null || p.paid_leaves_year === '')) p.paid_leaves_year = 12;
    if (p.phone && !/^[0-9+\-\s()]{6,20}$/.test(String(p.phone))) return err('Enter a valid phone number.');
    if (p.active != null && ['yes', 'no'].indexOf(p.active) < 0) return err('Invalid value.');
  }
  if (t === 'leaves') {
    const S0 = S.indexOf(u.role) >= 0;
    if (op === 'insert') {
      const st = byId_('staff', p.staff_id); if (!st || st.active === 'no') return err('Choose the watchman.');
      if (!isDate_(p.from_date)) return err('Choose the first day of leave.');
      p.to_date = isDate_(p.to_date) ? p.to_date : p.from_date;
      if (p.to_date < p.from_date) return err('The last day must be on or after the first day.');
      p.days = Math.round((new Date(p.to_date + 'T00:00:00Z') - new Date(p.from_date + 'T00:00:00Z')) / 864e5) + 1;
      if (p.days > 120) return err('A leave can be at most 120 days.');
      if (read_('leaves').some(l => String(l.staff_id) === String(p.staff_id) && ['requested', 'approved'].indexOf(l.status) >= 0 && String(l.from_date).slice(0, 10) <= p.to_date && String(l.to_date).slice(0, 10) >= p.from_date)) return err('There is already a leave on these days.');
      p.kind = p.kind === 'unpaid' ? 'unpaid' : 'paid'; p.requested_by = u.username;
      p.reason = String(p.reason || '').slice(0, 300);
      if (S0) { p.status = 'approved'; p.decided_by = u.username; p.decided_at = now_(); after = () => leaveApproved_(Object.assign({ id: LAST_ID_ }, p), st); }
      else { p.status = 'requested'; after = () => queuePush_('Leave request: ' + st.name, dmy_(p.from_date) + (p.days > 1 ? ' to ' + dmy_(p.to_date) : '') + ' (' + p.days + ' day' + (p.days > 1 ? 's' : '') + ')' + (p.reason ? ' - ' + p.reason : ''), { roles: COMPLAINT_ALERT }); }
    }
    if (op === 'update') {
      const keys = Object.keys(p);
      if (!S0) { if (keys.some(k => k !== 'status') || p.status !== 'cancelled' || before.some(l => l.status !== 'requested')) return err('You can only cancel a leave request that is not yet decided.'); }
      if (p.status != null && ['approved', 'rejected', 'cancelled'].indexOf(p.status) < 0) return err('Invalid status.');
      if (p.kind != null && ['paid', 'unpaid'].indexOf(p.kind) < 0) return err('Invalid leave type.');
      if (keys.some(k => ['status', 'kind', 'reason'].indexOf(k) < 0)) return err('Only the status, type or reason can be changed.');
      if (p.status === 'approved' || p.status === 'rejected') { p.decided_by = u.username; p.decided_at = now_(); }
      const ns = p.status;
      after = () => before.forEach(l => {
        const st = byId_('staff', l.staff_id) || { name: 'Watchman' };
        if (ns === 'approved' && l.status !== 'approved') leaveApproved_(Object.assign({}, l, p), st);
        if (ns === 'rejected' && l.status !== 'rejected') queuePush_('Leave not approved', st.name + ': ' + dmy_(l.from_date) + (+l.days > 1 ? ' to ' + dmy_(l.to_date) : ''), { roles: ['watchman'] });
        if ((ns === 'cancelled' || ns === 'rejected') && l.notice_id) removeNotice_(l.notice_id);
      });
    }
    if (op === 'delete') after = () => before.forEach(l => { if (l.notice_id) removeNotice_(l.notice_id); });
  }
  if (t === 'attendance' && op === 'insert') {
    const st = byId_('staff', p.staff_id); if (!st) return err('Choose the watchman.');
    if (S.indexOf(u.role) < 0) { p.on_date = today_(); p.status = 'present'; }
    if (!isDate_(p.on_date)) return err('Please enter a valid date.');
    if (p.on_date > today_()) return err('Attendance cannot be marked for a future day.');
    if (['present', 'absent', 'half'].indexOf(p.status) < 0) return err('Invalid value.');
    p.marked_by = u.username; p.marked_at = now_();
    /* one mark per person per day: the new mark replaces the old one */
    const old = read_('attendance').filter(a => String(a.staff_id) === String(p.staff_id) && String(a.on_date).slice(0, 10) === p.on_date);
    if (old.length && S.indexOf(u.role) < 0) return err('Already marked present today.');
    old.sort((a, b) => b.__r - a.__r).forEach(a => sh.deleteRow(a.__r));
  }
  if (t === 'polls' && op === 'insert') {
    const o = String(p.options || '').split('|').map(x => x.trim()).filter(Boolean);
    if (!String(p.question || '').trim() || o.length < 2) return err('Enter a question and at least two options.');
    p.options = o.join('|'); p.status = 'open';
  }
  if (t === 'polls' && op === 'update' && ['open', 'closed'].indexOf(p.status) < 0) return err('Invalid status.');
  if (t === 'votes') {
    const poll = read_('polls').filter(r => String(r.id) === String(p.poll_id))[0];
    if (!poll || poll.status !== 'open') return err('This poll is closed.');
    if (String(poll.options).split('|').indexOf(String(p.choice)) < 0) return err('Choose one of the options.');
    if (read_('votes').some(v => String(v.poll_id) === String(p.poll_id) && String(v.flat_no).toLowerCase() === String(u.username).toLowerCase())) return err('You have already voted in this poll.');
    p.flat_no = u.username;
  }
  if (t === 'status' && ['active', 'attention', 'maintenance'].indexOf(p.state) < 0) return err('Invalid status.');
  if (t === 'maintenance_log' && p.status != null && ['completed', 'pending', 'partial'].indexOf(p.status) < 0) return err('Invalid status.');
  if (t === 'visitors' && op === 'insert' && (!p.visit_on || !(Math.floor(+p.count) >= 1 && +p.count <= 100000))) return err('Enter a date and a visitor count of at least 1.');
  if (t === 'celebrations' && op === 'insert' && ['income', 'expense', 'sponsor'].indexOf(p.kind) < 0) return err('Invalid entry type.');
  if (op === 'insert' || op === 'upsert') {
    if (t !== 'closed_months' && (DATE_OF[t] || []).some(c => locked(p[c]))) return err(LOCKMSG);
    if (['payments', 'expenses', 'income', 'celebrations'].indexOf(t) >= 0 && !(t === 'celebrations' && p.kind === 'sponsor') && !(+p.amount > 0)) return err('Enter an amount above 0.');
    if (t === 'closed_months' && closed.indexOf(String(p.month).slice(0, 7)) >= 0) return err('This month is already closed.');
  }
  if (op === 'insert') {
    const rec = Object.assign({}, p);
    if (cols.indexOf('id') >= 0) rec.id = nextId_(t, 'id');
    LAST_ID_ = rec.id;
    if (t === 'payments') rec.receipt_no = nextId_(t, 'receipt_no');
    if (cols.indexOf('created_at') >= 0) rec.created_at = now_();
    if (t === 'notices') rec.created_on = now_().slice(0, 10);
    if (t === 'closed_months') rec.closed_at = now_();
    sh.appendRow(cols.map(c => rec[c] == null ? '' : cell_(rec[c])));
    audit_(u, 'insert', t, rec.id != null ? rec.id : (rec.month || rec.item || ''), summary_(t, rec), null, rec);
    if (after) after();
    if (t === 'visitors' && rec.status === 'waiting') askFlat_(rec);
    if (t === 'guest_passes') return { ok: true, id: rec.id, code: rec.code };
    try { notifyNew_(t, rec); } catch (e) { /* a failed alert must never block saving */ }
    return { ok: true, id: rec.id };
  }
  if (op === 'upsert') {
    const key = b.onConflict, hit = read_(t).filter(r => String(r[key]) === String(p[key]))[0];
    if (!hit) { sh.appendRow(cols.map(c => p[c] == null ? '' : cell_(p[c]))); audit_(u, 'insert', t, p[key], summary_(t, p), null, p); return { ok: true }; }
    cols.forEach((c, i) => { if (p[c] != null && c !== key) sh.getRange(hit.__r, i + 1).setValue(cell_(p[c])); });
    audit_(u, 'update', t, p[key], summary_(t, Object.assign({}, hit, p)), hit, Object.assign({}, hit, p));
    return { ok: true };
  }
  if (op === 'update') {
    if (!before.length) return err('Record not found.');
    if (t === 'visitors' && ASK_ === 'again') before.forEach(r => { if (['no_answer', 'waiting'].indexOf(r.status) < 0) return; askFlat_(Object.assign({}, r, { status: 'waiting' })); });
    if (Object.keys(p).length) {
      before.forEach(r => cols.forEach((c, i) => { if (p[c] != null && c !== 'id') sh.getRange(r.__r, i + 1).setValue(cell_(p[c])); }));
      before.forEach(r => audit_(u, 'update', t, r.id, summary_(t, Object.assign({}, r, p)), r, Object.assign({}, r, p), p));
    }
    if (after) after();
    return { ok: true };
  }
  if (op === 'delete') {
    if (!before.length) return { ok: true };
    if (before.some(r => (DATE_OF[t] || []).some(c => locked(r[c])))) return err(LOCKMSG);
    before.forEach(r => audit_(u, 'delete', t, r.id != null ? r.id : (r.month || ''), summary_(t, r), r, null));
    if (after) after();
    before.map(r => r.__r).sort((x, y) => y - x).forEach(n => sh.deleteRow(n));
    return { ok: true };
  }
  return err('Unsupported action.');
}

/* ---------- VISITOR APPROVAL ----------
   The gate asks a flat; that flat's phones get an alert with Approve / Deny (and Leave at gate). A one-time code in the alert lets the
   phone answer straight from the alert; it is kept only in the script cache for 30 minutes, never in the Sheet. */
const GATE_ALERT = ['watchman', 'executive', 'president', 'secretary', 'treasurer', 'admin']; /* who hears the answer */
const VS_LABEL = { approved: 'approved', denied: 'denied', leave_at_gate: 'said: leave it at the gate' };
function askFlat_(rec) {
  const code = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
  const c = CacheService.getScriptCache(); c.put('vc_' + rec.id, code, 1800); c.put('vs_' + rec.id, 'waiting', 21600);
  let api = ''; try { api = ScriptApp.getService().getUrl(); } catch (e) {}
  LATER_.push(() => {
    pushAll_('Visitor at the gate for Flat ' + rec.flat_no, rec.name + (rec.purpose ? ' (' + rec.purpose + ')' : '') + ' is waiting. Tap Approve or Deny.', '/#vis', { user: rec.flat_no },
      { type: 'visit', vid: String(rec.id), code: code, api: api, purpose: String(rec.purpose || '') });
  });
}
function decide_(row, decision, by, u) {
  const st = { approve: 'approved', deny: 'denied', gate: 'leave_at_gate' }[decision];
  if (!st) return { error: { message: 'Choose Approve or Deny.' } };
  if (['waiting', 'no_answer'].indexOf(row.status) < 0) return { ok: true, status: row.status, already: true };
  setCells_('visitors', row.__r, { status: st, decided_by: by, decided_at: now_() });
  CacheService.getScriptCache().put('vs_' + row.id, st, 21600); CacheService.getScriptCache().remove('vc_' + row.id);
  audit_(u, 'update', 'visitors', row.id, 'Flat ' + row.flat_no + ' ' + VS_LABEL[st], { status: row.status }, { status: st });
  LATER_.push(() => { pushAll_('Flat ' + row.flat_no + ' ' + VS_LABEL[st], String(row.name || 'Visitor') + (st === 'approved' ? ' can come in.' : st === 'denied' ? ' must not come in.' : ''), '/#vis', { roles: GATE_ALERT }); });
  return { ok: true, status: st };
}
function decideByCode_(b) {
  const id = String(b.id || ''), want = CacheService.getScriptCache().get('vc_' + id);
  if (!want || String(b.code) !== want) return { error: { message: 'This request has expired. Please open the app to answer.' } };
  const row = read_('visitors').filter(v => String(v.id) === id)[0];
  if (!row) return { error: { message: 'Visitor not found.' } };
  const r = decide_(row, b.decision, String(row.flat_no) + ' (alert)', { username: String(row.flat_no), role: 'resident' });
  if (r.ok) patchSnap_('visitors');
  return r;
}
function decideByUser_(u, b) {
  const row = read_('visitors').filter(v => String(v.id) === String(b.id))[0];
  if (!row) return { error: { message: 'Visitor not found.' } };
  if (u.role !== 'resident' || String(row.flat_no).toLowerCase() !== String(u.username).toLowerCase()) return { error: { message: 'Only the flat being visited can answer.' } };
  const r = decide_(row, b.decision, String(u.username), u);
  if (r.ok) patchSnap_('visitors');
  return r;
}
/* the gate screen asks every few seconds: answered quickly from the cache, the Sheet is read only if needed */
function visitorStatus_(u, b) {
  if (VIS.indexOf(u.role) < 0 && u.role !== 'resident') return { error: { message: 'You do not have permission to do this.' } };
  const ids = (b.ids || []).slice(0, 30).map(String), c = CacheService.getScriptCache(), out = {}, miss = [];
  const got = c.getAll(ids.map(i => 'vs_' + i));
  ids.forEach(i => { const v = got['vs_' + i]; if (v) out[i] = v; else miss.push(i); });
  if (miss.length) read_('visitors').forEach(v => { if (miss.indexOf(String(v.id)) >= 0) { out[v.id] = v.status || ''; c.put('vs_' + v.id, v.status || 'entered', 21600); } });
  return { ok: true, status: out };
}
function findPass_(code) { code = String(code || '').trim(); return /^\d{6}$/.test(code) ? read_('guest_passes').filter(g => String(g.code) === code && g.status === 'active')[0] || null : null; }
function passValid_(g) {
  const d = today_(), f = String(g.valid_from || '').slice(0, 10), to = String(g.valid_to || '').slice(0, 10);
  return g.status === 'active' && (!f || f <= d) && (!to || to >= d);
}
/* the gate checks a 6-digit guest code (10 wrong tries per 10 minutes) */
function passCheck_(u, b) {
  if (VIS.indexOf(u.role) < 0) return { error: { message: 'You do not have permission to do this.' } };
  const c = CacheService.getScriptCache(), k = 'pc_' + u.username, n = +c.get(k) || 0;
  if (n >= 10) return { error: { message: 'Too many wrong codes. Please wait 10 minutes.' } };
  const g = findPass_(b.code);
  if (!g || !passValid_(g)) { c.put(k, String(n + 1), 600); return { error: { message: 'This code is not valid today.' } }; }
  return { ok: true, pass: { id: g.id, name: g.name, flat_no: g.flat_no, purpose: g.purpose, kind: g.kind } };
}
/* the phone number the gate calls when a flat does not answer: a resident sets their own, the Association any flat's */
function flatPhone_(u, b) {
  const fno = String(b.flat_no || '').trim(), ph = String(b.phone || '').trim();
  if (u.role === 'resident' ? fno.toLowerCase() !== String(u.username).toLowerCase() : S.indexOf(u.role) < 0) return { error: { message: 'You do not have permission to do this.' } };
  if (ph && !/^[0-9+\-\s()]{6,20}$/.test(ph)) return { error: { message: 'Enter a valid phone number.' } };
  const f = read_('flats').filter(x => String(x.flat_no) === fno)[0]; if (!f) return { error: { message: 'Flat not found.' } };
  setCells_('flats', f.__r, { phone: ph });
  audit_(u, 'update', 'flats', f.id, 'Gate phone number ' + (ph ? 'saved' : 'removed') + ' for Flat ' + fno, null, null);
  patchSnap_('flats');
  return { ok: true };
}

/* ---------- WATCHMAN LEAVE: an approved leave is posted as a notice (so it shows in Notices and Recent activity, and everyone gets the alert) ---------- */
function leaveApproved_(l, st) {
  const d = +l.days || 1, txt = '🛡 Watchman ' + (st.name || '') + ' will be on leave ' + (d > 1 ? 'from ' + dmy_(l.from_date) + ' to ' + dmy_(l.to_date) + ' (' + d + ' days)' : 'on ' + dmy_(l.from_date)) + '. Please plan your visitors and deliveries.';
  const n = appendRec_('notices', { title: txt, created_on: today_() });
  try { notifyNew_('notices', n); } catch (e) {}
  const row = read_('leaves').filter(x => String(x.id) === String(l.id))[0];
  if (row) setCells_('leaves', row.__r, { notice_id: n.id });
  if (l.requested_by && l.requested_by !== l.decided_by) queuePush_('Leave approved', (st.name || '') + ': ' + dmy_(l.from_date) + (d > 1 ? ' to ' + dmy_(l.to_date) : '') + ' (' + (l.kind === 'unpaid' ? 'unpaid' : 'paid') + ')', { roles: ['watchman'] });
}
function removeNotice_(id) { const n = read_('notices').filter(x => String(x.id) === String(id))[0]; if (n) { sh_('notices').deleteRow(n.__r); TOUCHED_.notices = 1; } }

/* ---------- COMPLAINT FEEDBACK: after a complaint is Resolved, the flat that raised it may give 👍 or 👎 (optional note) ----------
   The flat can change it later. A 👎 alerts the President, Secretary and Treasurer. */
function feedback_(u, b) {
  const c = read_('complaints').filter(x => String(x.id) === String(b.id))[0];
  if (!c) return { error: { message: 'Complaint not found.' } };
  if (u.role !== 'resident' || String(c.flat_no).toLowerCase() !== String(u.username).toLowerCase()) return { error: { message: 'Only the flat that raised this complaint can give feedback.' } };
  if (c.status !== 'resolved') return { error: { message: 'Feedback can be given once the complaint is resolved.' } };
  const f = b.feedback === 'up' ? 'up' : b.feedback === 'down' ? 'down' : '';
  if (!f) return { error: { message: 'Choose thumbs up or thumbs down.' } };
  const note = String(b.note || '').trim().slice(0, 300);
  setCells_('complaints', c.__r, { feedback: f, feedback_note: note, feedback_at: now_() });
  let h = []; try { h = JSON.parse(c.history || '[]'); } catch (e) {}
  h.push({ at: now_(), by: u.username, feedback: f, note: note || undefined });
  setCells_('complaints', c.__r, { history: JSON.stringify(h.slice(-60)) });
  audit_(u, 'update', 'complaints', c.id, (c.ticket_no || '#' + c.id) + ' feedback: ' + (f === 'up' ? 'satisfied' : 'not satisfied'), { feedback: c.feedback || '' }, { feedback: f });
  { const rec = Object.assign({}, c, { feedback: f, feedback_note: note, feedback_at: now_(), history: JSON.stringify(h) }); LATER_.push(() => { try { complaintRecord_(rec); } catch (x) {} }); }
  if (f === 'down' && c.feedback !== 'down') LATER_.push(() => pushAll_('👎 Not satisfied: ' + (c.ticket_no || 'complaint'), 'Flat ' + c.flat_no + ': ' + String(c.title || '') + (note ? ' - ' + note : ''), '/', { roles: COMPLAINT_ALERT }));
  patchSnap_('complaints');
  return { ok: true };
}

/* ---------- AUDIT LOG (tab 'audit_log'): who added, changed or deleted what, and when. Nobody can edit it from the app. ---------- */
let FLATNO_ = null;
const flatNo_ = id => { if (!FLATNO_) { FLATNO_ = {}; read_('flats').forEach(f => FLATNO_[f.id] = f.flat_no); } return FLATNO_[id] != null ? FLATNO_[id] : id; };
function summary_(t, r) {
  r = r || {};
  const amt = r.amount != null && r.amount !== '' ? 'Rs ' + r.amount : '', d = x => x ? String(x).slice(0, 10) : '';
  const S1 = {
    payments: ['Flat ' + flatNo_(r.flat_id), 'for ' + String(r.month || '').slice(0, 7), amt, r.mode, r.receipt_no ? 'receipt #' + r.receipt_no : ''],
    expenses: [r.category, r.description, amt, d(r.spent_on)], income: [r.category, amt, d(r.received_on)],
    maintenance_rates: ['Maintenance for ' + String(r.month || '').slice(0, 7), amt], closed_months: ['Month ' + String(r.month || '').slice(0, 7)],
    settings: ['Opening balance: cash Rs ' + (r.opening_cash || 0) + ', bank Rs ' + (r.opening_bank || 0)],
    celebrations: [r.kind, String(r.details || '').split('||')[0], amt, d(r.entry_on)],
    complaints: [r.ticket_no, r.status], visitors: [d(r.visit_on), (r.count || 1) + ' visitor(s)'],
    asset_service: ['Item #' + r.asset_id, r.kind, d(r.service_on), r.cost ? 'Rs ' + r.cost : ''],
    asset_items: ['Minor item: ' + (r.name || ''), r.qty != null && r.qty !== '' ? r.qty + ' ' + (r.unit || 'pcs') : '', r.condition, d(r.bought_on), r.cost ? 'Rs ' + r.cost : ''],
    contacts: [r.category, r.name], status: [r.item, r.state],
    staff: ['Watchman ' + (r.name || ''), r.active === 'no' ? 'inactive' : ''],
    leaves: ['Leave #' + (r.staff_id || ''), d(r.from_date) + (r.to_date && r.to_date !== r.from_date ? ' to ' + d(r.to_date) : ''), r.days ? r.days + ' day(s)' : '', r.kind, r.status],
    attendance: ['Attendance #' + (r.staff_id || ''), d(r.on_date), r.status]
  }[t];
  const parts = S1 || [r.title || r.name || r.task || r.question || r.details || r.item, r.status, amt, d(r.due_on || r.on_date)];
  return parts.filter(x => x != null && String(x).trim() !== '').join(' · ').slice(0, 300);
}
function audit_(u, action, tbl, id, summary, before, after, changed) {
  try {
    if (tbl !== 'users' && AUDIT_T.indexOf(tbl) < 0) return;
    const sh = sh_('audit_log'); if (!sh) return;
    const tidy = o => {
      if (!o) return '';
      const x = Object.assign({}, o); delete x.__r; delete x.te; delete x.history; delete x.password_hash; delete x.salt;
      if (AUDIT_BRIEF.indexOf(tbl) >= 0) Object.keys(x).forEach(k => { if (['id', 'status', 'assigned_to', 'expected_on', 'asset_id', 'ticket_no', 'visit_on', 'count', 'in_time', 'out_time'].indexOf(k) < 0) delete x[k]; });
      if (changed && action === 'update') Object.keys(x).forEach(k => { if (k !== 'id' && changed[k] == null) delete x[k]; });
      return JSON.stringify(x).slice(0, 4000);
    };
    sh.appendRow([sh.getLastRow(), now_(), u.username, u.role, action, tbl, id == null ? '' : String(id), String(summary || '').slice(0, 300), tidy(before), tidy(after)].map(cell_));
  } catch (e) { Logger.log('Audit failed: ' + e); }
}
/* the app's Audit log page: newest first, filtered; reads only the most recent 5,000 entries */
function auditRead_(u, b) {
  if (AUDITV.indexOf(u.role) < 0) return { error: { message: 'You do not have permission to do this.' } };
  const sh = sh_('audit_log'); if (!sh) return { ok: true, rows: [] };
  const last = sh.getLastRow(); if (last < 2) return { ok: true, rows: [] };
  const first = Math.max(2, last - 4999), h = TABLES.audit_log, tz = tz_();
  const v = sh.getRange(first, 1, last - first + 1, h.length).getValues();
  const f = { tbl: String(b.tbl || ''), who: String(b.who || '').toLowerCase(), from: String(b.from || ''), to: String(b.to || ''), act: String(b.act || '') };
  const rows = [];
  for (let i = v.length - 1; i >= 0 && rows.length < 400; i--) {
    const o = {}; h.forEach((k, j) => { let x = v[i][j]; if (x instanceof Date) x = x.getFullYear() < 1900 ? '' : Utilities.formatDate(x, tz, 'yyyy-MM-dd HH:mm'); o[k] = x === '' ? null : x; });
    const day = String(o.at || '').slice(0, 10);
    if (f.tbl && o.tbl !== f.tbl) continue;
    if (f.act && o.action !== f.act) continue;
    if (f.who && String(o.username || '').toLowerCase() !== f.who) continue;
    if (f.from && day < f.from) continue;
    if (f.to && day > f.to) continue;
    rows.push(o);
  }
  return { ok: true, rows: rows, more: first > 2 };
}


/* ---------- SPEED: keep the backend warm (run installKeepWarm ONCE) ----------
   Google puts idle scripts to sleep, which makes the first tap slow. This trigger wakes it every 5 minutes
   and refreshes the cached data, so residents always get a fast answer. Sheet edits by hand show within 5 minutes. */
function keepWarm() { try { Object.keys(TABLES).forEach(ensureHeader_); } catch (e) {} try { after_(); } catch (e) {} try { translateMissing_(40); } catch (e) {} try { dailyReminders_(); } catch (e) { Logger.log('Reminders failed: ' + e); } cacheDrop_('snap'); tables_(); }

/* ---------- SERVICE REMINDERS: one alert a day to the committee's phones (runs from keepWarm, after 8 AM) ----------
   An item is mentioned N days before it is due (N = its 'alert days', default 7), 1 day before, on the day,
   and every 7 days while it stays overdue. Warranty end dates of assets are included (30 days before, and on the day). */
function dueItems_(day) {
  const dn = d => Math.round((new Date(String(d).slice(0, 10) + 'T00:00:00Z') - new Date(day + 'T00:00:00Z')) / 864e5);
  const out = [];
  read_('reminders').filter(r => r.status !== 'done' && isDate_(String(r.due_on).slice(0, 10))).forEach(r => {
    const n = dn(r.due_on), nd = r.notify_days === null || r.notify_days === '' ? 7 : +r.notify_days;
    if (n === nd || n === 1 || n === 0 || (n < 0 && -n % 7 === 0)) out.push({ n: n, t: r.title });
  });
  read_('assets').filter(a => isDate_(String(a.warranty_until || '').slice(0, 10))).forEach(a => {
    const n = dn(a.warranty_until); if (n === 30 || n === 0) out.push({ n: n, t: 'Warranty ends: ' + a.name });
  });
  return out.sort((x, y) => x.n - y.n);
}
function dailyReminders_(force) {
  const P = PROPS_(), day = Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd'), hr = +Utilities.formatDate(new Date(), tz_(), 'H');
  if (!force && (P.getProperty('REM_DAY') === day || hr < 8)) return { skipped: true };
  P.setProperty('REM_DAY', day);
  const it = dueItems_(day); if (!it.length) return { sent: 0 };
  const late = it.filter(x => x.n < 0).length, lab = x => x.t + (x.n < 0 ? ' (overdue ' + -x.n + ' days)' : x.n === 0 ? ' (today)' : ' (in ' + x.n + ' days)');
  return pushAll_('Service reminders' + (late ? ': ' + late + ' overdue' : ''), it.slice(0, 4).map(lab).join(', ') + (it.length > 4 ? ' and ' + (it.length - 4) + ' more' : ''), '/', { roles: COM });
}
/* Run by hand to test the reminder alert now (sends to committee phones if anything is due). */
function testReminders() { Logger.log(JSON.stringify(dueItems_(Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd')))); Logger.log(JSON.stringify(dailyReminders_(true))); }
function installKeepWarm() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'keepWarm').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('keepWarm').timeBased().everyMinutes(5).create();
  keepWarm();
  Logger.log('Done. The backend will now stay warm (runs every 5 minutes).');
}
function removeKeepWarm() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'keepWarm').forEach(t => ScriptApp.deleteTrigger(t));
  Logger.log('Keep-warm trigger removed.');
}


/* =====================================================================================
   EXPORT ALL FILES TO GOOGLE DRIVE  (run `exportToDrive` once; safe to run again, it skips files already saved)
   Creates "Krishna Kuteer Apartment Documents" in your My Drive with one sub-folder per category.
   Complaint photos and voice notes go into the PRIVATE folder "Krishna Kuteer Association Documents (private)/Complaints".
   ===================================================================================== */
function onOpen() {
  try { SpreadsheetApp.getUi().createMenu('Krishna Kuteer').addItem('Export all files to Drive', 'exportToDrive').addToUi(); } catch (e) {}
}
/* Every new Document / photo / complaint picture is ALSO saved to Google Drive straight away (same names as exportToDrive, so nothing is duplicated). */
function driveDirs_() {
  const it = DriveApp.getFoldersByName(ROOT_FOLDER), root = it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_FOLDER), dirs = {};
  FOLDERS.forEach(n => dirs[n] = driveFolder_(root, safeName_(n)));
  return dirs;
}
function driveSave_(folder, base, id) {
  const probe = fileRows_(id); if (!probe) return;
  const mime = probe.sh.getRange(probe.first, 3).getValue(), name = safeName_(base) + (EXT_[mime] || '');
  if (folder.getFilesByName(name).hasNext()) return;
  const blob = fileBlob_(id, name); if (blob) folder.createFile(blob);
}
/* every complaint is also kept as a small text file: ticket, flat, date, problem, details, related item, status */
function saveComplaintText_(rec) {
  const dir = privDir_('Complaints'), name = safeName_((rec.ticket_no || 'Complaint ' + rec.id) + ' - Flat ' + rec.flat_no + ' - ' + (rec.title || '')) + '.txt';
  if (dir.getFilesByName(name).hasNext()) return;
  const it = rec.asset_id ? (read_('assets').filter(a => String(a.id) === String(rec.asset_id))[0] || {}).name : '';
  const body = ['KRISHNA KUTEER APARTMENT - COMPLAINT', '', 'Ticket: ' + (rec.ticket_no || '#' + rec.id), 'Flat: ' + rec.flat_no, 'Raised on: ' + String(rec.created_at || ''),
    'Problem: ' + (rec.title || ''), 'Details: ' + (rec.details || '-'), 'Related to: ' + (it || '-'), 'Status when raised: ' + (rec.status || 'open'),
    'Photos: ' + String(rec.photos || '').split('|').filter(Boolean).length + (rec.voice ? ', voice note: yes' : ''), '', 'The latest status is always in the app (Complaints).'].join('\n');
  dir.createFile(name, body, 'text/plain');
}
/* Documents page: a Google Drive link for EACH sub-folder, so a resident asks access only for the folder they need.
   Links are worked out once and kept (script property FOLDER_URLS); setup() refreshes them. */
function folderLinks_(u) {
  const P = PROPS_(); let m = null;
  try { m = JSON.parse(P.getProperty('FOLDER_URLS') || 'null'); } catch (e) {}
  const full = x => x && FOLDERS.every(f => x.pub[f] && x.priv[f]);
  if (!full(m)) {
    const lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      const get = n => { const it = DriveApp.getFoldersByName(n); return it.hasNext() ? it.next() : DriveApp.createFolder(n); };
      const pr = get(ROOT_FOLDER), vr = get(PRIV_FOLDER); m = { pub: {}, priv: {}, root: pr.getUrl() };
      FOLDERS.forEach(f => { m.pub[f] = driveFolder_(pr, safeName_(f)).getUrl(); m.priv[f] = driveFolder_(vr, safeName_(f)).getUrl(); });
      P.setProperty('FOLDER_URLS', JSON.stringify(m));
    } catch (e) { return { error: { message: 'Could not open Google Drive. (Admin: run authorizeDrive in Apps Script.)' } }; }
    finally { lock.releaseLock(); }
  }
  return { ok: true, folders: m.pub, priv: u.role === 'resident' ? null : m.priv };
}
function driveSync_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return { ok: true };
  try {
    const T = tables_(), dirs = {};
    dirs.get = n => dirs[n] || (dirs[n] = (function () { const it = DriveApp.getFoldersByName(ROOT_FOLDER), root = it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_FOLDER); return driveFolder_(root, safeName_(n)); })());
    (T.gallery || []).slice(-6).forEach(r => { try { autoDrive_('gallery', r, dirs); } catch (e) { Logger.log('Drive save failed: ' + e); } });
    (T.complaints || []).slice(-6).forEach(r => { try { autoDrive_('complaints', r, dirs); } catch (e) { Logger.log('Drive save failed: ' + e); } });
  } finally { lock.releaseLock(); }
  return { ok: true };
}
function autoDrive_(t, rec, dirs) {
  dirs = dirs || { get: n => driveDirs_()[n] };
  if (t === 'gallery') {
    const d = String(rec.created_at).slice(0, 10), fo = FOLDERS.indexOf(rec.folder) >= 0 ? rec.folder : 'Other';
    driveSave_(rec.visibility === 'committee' ? privDir_(fo) : dirs.get(fo), (rec.title || rec.name || 'file') + ' (' + d + ') #' + rec.id, String(rec.photo));
  } else {
    String(rec.photos || '').split('|').filter(Boolean).forEach((id, i) =>
      driveSave_(privDir_('Complaints'), 'Complaint ' + rec.id + ' - Flat ' + rec.flat_no + ' - ' + (rec.title || '') + ' (' + (i + 1) + ')', id));
    saveComplaintText_(rec);
    if (rec.voice) driveSave_(privDir_('Complaints'), 'Complaint ' + rec.id + ' - Flat ' + rec.flat_no + ' - ' + (rec.title || '') + ' (voice note)', String(rec.voice));
    String(rec.reply_photos || '').split('|').filter(Boolean).forEach((id, i) =>
      driveSave_(privDir_('Complaints'), 'Complaint ' + rec.id + ' - Flat ' + rec.flat_no + ' - ' + (rec.title || '') + ' (reply photo ' + (i + 1) + ')', id));
  }
}
/* complete complaint record as text: details, every status update with who/when/note, feedback. Replaced each time it changes. */
const dmy_ = d => { const m = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}:\d{2}))?/.exec(String(d || '')); return m ? (+m[3]) + '/' + (+m[2]) + '/' + m[1] + (m[4] ? ' ' + m[4] : '') : String(d || ''); };
function complaintRecord_(c) {
  const dir = privDir_('Complaints'), name = safeName_((c.ticket_no || 'Complaint ' + c.id) + ' - Flat ' + c.flat_no + ' - ' + (c.title || '') + ' - FULL RECORD') + '.txt';
  const old = dir.getFilesByName(name); while (old.hasNext()) old.next().setTrashed(true);
  const L = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' };
  let h = []; try { h = JSON.parse(c.history || '[]'); } catch (e) {}
  const it = c.asset_id ? (read_('assets').filter(a => String(a.id) === String(c.asset_id))[0] || {}).name : '';
  const who = b => /^\d/.test(String(b)) ? 'Flat ' + String(b).replace(' (alert)', '') : String(b || '');
  const lines = ['KRISHNA KUTEER APARTMENT - COMPLAINT RECORD', '', 'Ticket: ' + (c.ticket_no || '#' + c.id), 'Flat: ' + c.flat_no, 'Raised on: ' + dmy_(c.created_at),
    'Problem: ' + (c.title || ''), 'Details: ' + (c.details || '-'), 'Related to: ' + (it || '-'), 'Assigned to: ' + (c.assigned_to || '-'), 'Expected by: ' + (c.expected_on ? dmy_(c.expected_on) : '-'),
    'Status: ' + (L[c.status] || c.status), 'Photos from the resident: ' + String(c.photos || '').split('|').filter(Boolean).length + (c.voice ? ', voice note: yes' : ''),
    'Photos from the Association: ' + String(c.reply_photos || '').split('|').filter(Boolean).length, '', 'STATUS HISTORY'];
  h.forEach((e, i) => lines.push((i + 1) + '. ' + dmy_(e.at) + ' - ' + who(e.by) + ': ' + [e.status && 'Status: ' + (L[e.status] || e.status), e.assigned_to && 'Assigned to: ' + e.assigned_to,
    e.expected_on && 'Expected by: ' + dmy_(e.expected_on), e.feedback && 'Feedback: ' + (e.feedback === 'up' ? 'satisfied' : 'not satisfied'), e.note, e.photos && e.photos.split('|').length + ' photo(s)'].filter(Boolean).join(' | ')));
  if (c.feedback) lines.push('', 'RESIDENT FEEDBACK: ' + (c.feedback === 'up' ? 'Satisfied' : 'Not satisfied') + (c.feedback_note ? ' - ' + c.feedback_note : '') + ' (' + dmy_(c.feedback_at) + ')');
  lines.push('', 'Saved on ' + dmy_(now_()));
  dir.createFile(name, lines.join('\n'), 'text/plain');
}
/* Run ONCE by hand and click Allow: gives the script permission to save files in your Google Drive. */
function authorizeDrive() { Logger.log('Drive folder: ' + DriveApp.getFoldersByName(ROOT_FOLDER).hasNext()); driveDirs_(); Logger.log('Drive is ready.'); }
function driveFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}
function safeName_(x) { return String(x || '').replace(/[\\/:*?"<>|#]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80) || 'file'; }
function fileBlob_(id, name) {
  const f = fileRows_(id); if (!f) return null;
  const v = f.sh.getRange(f.first, 3, f.n, 2).getValues();
  return Utilities.newBlob(Utilities.base64Decode(v.map(r => r[1]).join('')), v[0][0], name);
}
const EXT_ = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf', 'audio/webm': '.webm', 'audio/ogg': '.ogg', 'audio/mp4': '.m4a', 'audio/mpeg': '.mp3' };
function exportToDrive() {
  const t0 = Date.now(), rootIt = DriveApp.getFoldersByName(ROOT_FOLDER), root = rootIt.hasNext() ? rootIt.next() : DriveApp.createFolder(ROOT_FOLDER);
  const dirs = {}; FOLDERS.forEach(n => dirs[n] = driveFolder_(root, safeName_(n)));
  let saved = 0, skipped = 0, missing = 0, stopped = false;
  const put = (folder, base, id) => {
    if (stopped) return;
    if (Date.now() - t0 > 270000) { stopped = true; return; }
    const sh = sh_('file_data'), probe = fileRows_(id);
    if (!probe) { missing++; return; }
    const mime = sh.getRange(probe.first, 3).getValue(), name = safeName_(base) + (EXT_[mime] || '');
    if (folder.getFilesByName(name).hasNext()) { skipped++; return; }
    const blob = fileBlob_(id, name); if (!blob) { missing++; return; }
    folder.createFile(blob); saved++;
  };
  read_('gallery').forEach(g => {
    const d = String(g.created_at).slice(0, 10), fo = FOLDERS.indexOf(g.folder) >= 0 ? g.folder : 'Other';
    put(g.visibility === 'committee' ? privDir_(fo) : dirs[fo], (g.title || g.name || 'file') + ' (' + d + ') #' + g.id, String(g.photo));
  });
  read_('complaints').forEach(c => String(c.photos || '').split('|').filter(Boolean).forEach((id, i) =>
    put(privDir_('Complaints'), 'Complaint ' + c.id + ' - Flat ' + c.flat_no + ' - ' + (c.title || '') + ' (' + (i + 1) + ')', id)));
  read_('complaints').forEach(c => { try { saveComplaintText_(c); } catch (e) {} });
  read_('complaints').forEach(c => { if (c.voice) put(privDir_('Complaints'), 'Complaint ' + c.id + ' - Flat ' + c.flat_no + ' - ' + (c.title || '') + ' (voice note)', String(c.voice)); });
  const msg = (stopped ? 'Time limit reached - run exportToDrive again to continue.\n' : 'Export finished.\n') +
    'Saved: ' + saved + ', already there: ' + skipped + ', not found: ' + missing + '\nDrive folder: ' + root.getUrl();
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) {}
  return msg;
}


/* =====================================================================
   PUSH NOTIFICATIONS (Firebase Cloud Messaging, free)
   Script properties needed (Project Settings > Script properties):
     FCM_SERVICE_ACCOUNT = the whole JSON file downloaded from Firebase (Service accounts > Generate new private key)
     PUSH_SECRET         = any long random text (also saved in GitHub as secret PUSH_SECRET)
   ===================================================================== */
const PROPS_ = () => PropertiesService.getScriptProperties();

/* A phone asks to receive alerts: save its token (b.pt). Several phones per person are fine. */
function pushReg_(u, b) {
  const tk = String(b.pt || '').trim();
  if (tk.length < 50 || tk.length > 600) return { error: { message: 'Bad notification token.' } };
  const sh = sh_('push_tokens');
  if (!sh) return { error: { message: 'Run setup() once in Apps Script to create the push_tokens tab.' } };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const hit = read_('push_tokens').filter(r => String(r.token) === tk)[0];
    if (hit) sh.getRange(hit.__r, 1, 1, 4).setValues([[tk, u.username, u.role, now_()]]);
    else sh.appendRow([tk, u.username, u.role, now_()]);
  } finally { lock.releaseLock(); }
  return { ok: true };
}

/* Called by GitHub after every website update (see .github/workflows/notify-update.yml). */
function deployPing_(b) {
  const want = PROPS_().getProperty('PUSH_SECRET');
  if (!want || String(b.secret || '') !== want) return { error: { message: 'Not allowed.' } };
  const c = CacheService.getScriptCache();
  if (c.get('deploy_ping')) return { ok: true, skipped: 'already notified in the last 10 minutes' };
  c.put('deploy_ping', '1', 600);
  return Object.assign({ ok: true }, pushAll_('Krishna Kuteer updated', 'A new version of the app is ready. Open it to see what is new.', '/'));
}

/* Automatic alert whenever a notice, meeting/event or poll is added. */
function notifyNew_(t, rec) {
  if (t === 'notices') queuePush_('New notice', String(rec.title || ''));
  else if (t === 'meetings') queuePush_(rec.kind === 'event' ? 'New event' : 'New meeting', String(rec.title || '') + (rec.on_date ? ' - ' + String(rec.on_date).slice(0, 10) : ''));
  else if (t === 'polls') queuePush_('New poll - please vote', String(rec.question || ''));
  else if (t === 'gallery') {
    /* several photos uploaded together give ONE alert; committee-only files alert only the committee */
    const c = CacheService.getScriptCache(), k = ('gal_' + String(rec.title || '') + '|' + rec.folder + '|' + rec.visibility).slice(0, 200);
    if (c.get(k)) return; c.put(k, '1', 600);
    queuePush_(rec.kind === 'pdf' ? 'New document' : 'New photos', (String(rec.title || rec.name || '') || 'Added') + ' - ' + (rec.folder || 'Other'), rec.visibility === 'committee' ? { roles: COM } : null);
  }
  else if (t === 'complaints') queuePush_('New complaint ' + (rec.ticket_no || ''), 'Flat ' + rec.flat_no + ': ' + String(rec.title || ''), { roles: COMPLAINT_ALERT });
}
/* who is alerted when a resident raises a complaint */
const COMPLAINT_ALERT = ['president', 'secretary', 'treasurer'];
/* ---------- SPEED: alerts and Telugu copies are made just AFTER a save, not during it ----------
   The app calls 'after' quietly a moment after each save; keepWarm (every 5 minutes) also does it as a safety net. */
/* to: {user:'101'} = only that flat's phones, {roles:[...]} = only those roles' phones, nothing = everybody */
function queuePush_(title, body, to) {
  const P = PROPS_(), q = JSON.parse(P.getProperty('PUSH_Q') || '[]');
  q.push({ t: title, b: body, to: to || null }); P.setProperty('PUSH_Q', JSON.stringify(q.slice(-20)));
}
function flushPush_() {
  const P = PROPS_(), q = JSON.parse(P.getProperty('PUSH_Q') || '[]');
  if (!q.length) return 0;
  P.deleteProperty('PUSH_Q');
  q.forEach(m => { try { pushAll_(m.t, m.b, '/', m.to); } catch (e) { Logger.log('Push failed: ' + e); } });
  return q.length;
}
function after_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(500)) return { ok: true }; /* another 'after' is already running */
  try { const sent = flushPush_(); let tr = { done: 0 }; try { tr = translateMissing_(15); } catch (e) {} return { ok: true, sent: sent, translated: tr.done }; }
  finally { lock.releaseLock(); }
}
/* after a save, re-read only the tab that changed and update the cached copy of everything else */
function patchSnap_(t) {
  const T = cacheGetBig_('snap');
  if (!T || !Object.prototype.hasOwnProperty.call(T, t)) { cacheDrop_('snap'); return; }
  T[t] = clean_(read_(t));
  cachePutBig_('snap', T, SNAP_TTL);
}

/* OAuth token for the FCM API, made from the service account (cached ~50 minutes). */
function fcmAuth_() {
  const raw = PROPS_().getProperty('FCM_SERVICE_ACCOUNT');
  if (!raw) return null;
  const sa = JSON.parse(raw), cache = CacheService.getScriptCache();
  let at = cache.get('fcm_at');
  if (!at) {
    const b64 = x => Utilities.base64EncodeWebSafe(x).replace(/=+$/, ''), t = Math.floor(Date.now() / 1000);
    const head = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claim = b64(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: t, exp: t + 3600 }));
    const sig = Utilities.base64EncodeWebSafe(Utilities.computeRsaSha256Signature(head + '.' + claim, sa.private_key)).replace(/=+$/, '');
    const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', { method: 'post', muteHttpExceptions: true, payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: head + '.' + claim + '.' + sig } });
    const j = JSON.parse(r.getContentText());
    if (!j.access_token) throw new Error('Firebase sign-in failed: ' + r.getContentText().slice(0, 200));
    at = j.access_token; cache.put('fcm_at', at, 3000);
  }
  return { token: at, project: sa.project_id };
}

/* Send one alert to every registered phone. Dead tokens (app uninstalled) are removed automatically.
   Sends BOTH a data message (Chrome / website) and an Android "notification" block (so the Android app
   shows the alert even when it is closed). */
function pushAll_(title, body, url, to, ex) {
  const auth = fcmAuth_();
  if (!auth) return { sent: 0, note: 'Push not configured (FCM_SERVICE_ACCOUNT missing).' };
  const rows = read_('push_tokens').filter(r => !to ||
    (to.user != null && String(r.username).toLowerCase() === String(to.user).toLowerCase()) ||
    (to.roles && to.roles.indexOf(String(r.role || '').trim().toLowerCase()) >= 0));
  if (!rows.length) return { sent: 0, note: 'No phones registered yet.' };
  const api = 'https://fcm.googleapis.com/v1/projects/' + auth.project + '/messages:send';
  const t80 = String(title).slice(0, 80), b180 = String(body).slice(0, 180);
  const msg = tk => ({ url: api, method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + auth.token },
    payload: JSON.stringify({ message: { token: tk, data: Object.assign({ title: t80, body: b180, url: url || '/' }, ex || {}),
      android: { priority: 'HIGH', ttl: ex ? '600s' : '86400s', notification: { title: t80, body: b180 } },
      webpush: { headers: { Urgency: 'high', TTL: ex ? '600' : '86400' } } } }) });
  let sent = 0; const dead = [];
  for (let i = 0; i < rows.length; i += 40) {
    const part = rows.slice(i, i + 40), res = UrlFetchApp.fetchAll(part.map(r => msg(String(r.token))));
    res.forEach((r, k) => {
      const code = r.getResponseCode(), txt = r.getContentText();
      if (code === 200) sent++;
      else if (code === 404 || /UNREGISTERED|not a valid FCM registration token/i.test(txt)) dead.push(String(part[k].token));
      else Logger.log('Push failed (' + code + '): ' + txt.slice(0, 200));
    });
  }
  if (dead.length) {
    const sh = sh_('push_tokens');
    read_('push_tokens').filter(r => dead.indexOf(String(r.token)) >= 0).sort((a, b) => b.__r - a.__r).forEach(r => sh.deleteRow(r.__r));
  }
  return { sent: sent, removed: dead.length };
}

/* Run by hand to test: you should get a notification on every phone that turned alerts on. */
function testPush() { Logger.log(JSON.stringify(pushAll_('Test alert', 'Push notifications are working.', '/'))); }
/* Run by hand after you publish a new version of the website, if you did not use the GitHub automation. */
function sendAppUpdateNow() { Logger.log(JSON.stringify(pushAll_('Krishna Kuteer updated', 'A new version of the app is ready. Open it to see what is new.', '/'))); }
function pushStatus() { Logger.log('Phones registered: ' + read_('push_tokens').length); }


/* ---------- VISITOR REGISTER PHOTO IMPORT (Secretary only) ----------
   The Secretary photographs one page of the handwritten visitor register. Google's Gemini AI reads the page and returns each row.
   The Secretary checks and corrects every row in the app, then saves them all at once. Nothing is saved without that check.
   SET UP ONCE:
     1. Open https://aistudio.google.com/apikey (sign in with the Google account that owns this Sheet) and tap "Create API key".
     2. Here in Apps Script: Project Settings (gear icon) > Script properties > Add script property
          Property: GEMINI_KEY      Value: the key you copied
        (optional) Property: GEMINI_MODEL   Value: another Gemini model name, if Google retires the default one.
     3. Run testGemini() once and click Allow. The log should say "Gemini is working".
   Free key: free of charge with a daily limit; Google may use what is sent to improve its products. To keep the register photos
   out of that, turn on billing for the key in AI Studio (a page costs well under one rupee). */
const REG_ROLE = ['secretary'];                                  /* who may import register photos */
const GEM_MODEL_ = () => PROPS_().getProperty('GEMINI_MODEL') || 'gemini-flash-latest';
const REG_MAX_ROWS = 200;
function regPrompt_() {
  return 'You are reading a photo of ONE page of a handwritten visitor register kept at the gate of an apartment building in Hyderabad, India. ' +
    'The columns are usually: S.No, Date, Visitor Name, Flat No (the flat visited), Purpose of visit, Phone No, In Time, Signature, Out Time, Remarks. ' +
    'Use the headings written on the page if the order is different. The photo may be tilted, curved or unevenly lit; follow each ruled row carefully so every value stays in its own row and column.\n' +
    'Transcribe every visitor row on the page, top to bottom. Rules:\n' +
    '- Copy what is written. NEVER guess, invent or "correct" a value.\n' +
    '- If a cell is empty, return "".\n' +
    '- If a cell has writing you cannot read, return "" for it and add the field name to "unclear".\n' +
    '- If you can read a cell but are not fully sure, return your reading and add the field name to "unsure".\n' +
    '- Ignore the Signature column completely.\n' +
    '- Ditto marks (", do, -do-, same) mean the same value as the row above: copy that value.\n' +
    '- date: as written. date_iso: the same date as YYYY-MM-DD; the day comes BEFORE the month (Indian style). Today is ' + today_() + '; if the year is not written, use the year that makes the date closest to today without being in the future. If you cannot work it out, return "" and add "date" to "unsure".\n' +
    '- in_time and out_time: 24-hour HH:MM. If AM/PM is not written, use the most likely time for a visitor (07:00-21:59) and add the field to "unsure".\n' +
    '- phone: digits only, as written (no guessing of missing digits).\n' +
    '- Skip the heading row, completely crossed-out rows and empty rows.\n' +
    'Field names for "unsure"/"unclear": serial, date, name, flat, purpose, phone, in_time, out_time, remarks.\n' +
    'Reply with JSON only, exactly this shape: {"readable": true, "problem": "", "rows": [{"serial": "", "date": "", "date_iso": "", "name": "", "flat": "", "purpose": "", "phone": "", "in_time": "", "out_time": "", "remarks": "", "unsure": [], "unclear": []}]}\n' +
    'If the photo is not a visitor register, or is too blurry, dark or cut off to read, reply {"readable": false, "problem": "<one short sentence in plain English>", "rows": []}.';
}
/* Gemini: image in, JSON out */
/* Google sometimes answers 503 "high demand" for a few seconds or minutes: wait and try again, then try the lighter model */
const GEM_FALLBACK = 'gemini-flash-lite-latest';
function gemFetch_(key, model, body) {
  let res;
  for (let i = 0; i < 3; i++) {
    res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent',
      { method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: { 'x-goog-api-key': key }, payload: JSON.stringify(body) });
    const c = res.getResponseCode(); if (c !== 503 && c !== 500 && c !== 502) break;
    if (i < 2 && typeof Utilities.sleep === 'function') Utilities.sleep(3000 * (i + 1));
  }
  return res;
}
function gemini_(mime, b64) {
  const key = PROPS_().getProperty('GEMINI_KEY');
  if (!key) throw new Error('The register reader is not set up yet. In Apps Script, add the GEMINI_KEY script property (see the note above regScan_ in Code.gs).');
  let model = GEM_MODEL_();
  const body = { contents: [{ role: 'user', parts: [{ text: regPrompt_() }, { inlineData: { mimeType: mime, data: b64 } }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0 } };
  let res = gemFetch_(key, model, body);
  if (res.getResponseCode() >= 500 && model !== GEM_FALLBACK) { model = GEM_FALLBACK; res = gemFetch_(key, model, body); }
  const code = res.getResponseCode(), txt = res.getContentText();
  if (code === 429) throw new Error('The register reader has reached its limit for now. Please try again in a few minutes (or tomorrow).');
  if (code === 400 && /API key/i.test(txt)) throw new Error('The GEMINI_KEY in Apps Script is not valid. Create a new key and save it again.');
  if (code === 403) throw new Error('The GEMINI_KEY in Apps Script is not allowed to use Gemini. Check the key in Google AI Studio.');
  if (code === 404) throw new Error('The Gemini model "' + model + '" is not available. Set GEMINI_MODEL in Apps Script to a current Flash model.');
  if (code >= 500) throw new Error('Google\'s reader is busy. Please try again in a minute.');
  if (code !== 200) throw new Error('The register reader could not read this photo (error ' + code + ').');
  let j; try { j = JSON.parse(txt); } catch (e) { throw new Error('The register reader sent an unexpected answer. Please try again.'); }
  const c = (j.candidates || [])[0];
  if (!c || !c.content) throw new Error(c && c.finishReason === 'SAFETY' ? 'The reader refused this photo. Please take a clearer photo of the register page only.' : 'The register reader gave no answer. Please try again.');
  const out = (c.content.parts || []).filter(p => p.text && !p.thought).map(p => p.text).join('').trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
  let r; try { r = JSON.parse(out); } catch (e) { throw new Error('The register reader sent an unexpected answer. Please try again.'); }
  return { model: model, r: r };
}
/* ---- turning what was read into app values (anything that does not fit is left blank and flagged, never guessed) ---- */
function regDate_(iso, raw) {
  const ok = d => isDate_(d) && !isNaN(new Date(d + 'T00:00:00Z')) && new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d && d <= today_() && d >= '2015-01-01';
  if (ok(String(iso || ''))) return String(iso);
  const m = /^\s*(\d{1,2})\s*[\/.\-]\s*(\d{1,2})\s*[\/.\-]\s*(\d{2,4})\s*$/.exec(String(raw || ''));
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3], d = y + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2); if (ok(d)) return d; }
  return '';
}
function regTime_(x) {
  const s = String(x || '').trim().toLowerCase().replace(/\s+/g, '');
  const m = /^(\d{1,2})(?:[:.](\d{2}))?(am|pm|a\.m\.|p\.m\.)?$/.exec(s) || /^(\d{1,2})(\d{2})(am|pm)?$/.exec(s);
  if (!m) return '';
  let h = +m[1]; const mi = m[2] == null ? 0 : +m[2], ap = (m[3] || '').charAt(0);
  if (ap === 'p' && h < 12) h += 12; if (ap === 'a' && h === 12) h = 0;
  if (h > 23 || mi > 59) return '';
  return ('0' + h).slice(-2) + ':' + ('0' + mi).slice(-2);
}
function regFlat_(raw, flats) {
  const s = String(raw || '').trim(); if (!s) return '';
  const exact = flats.filter(f => String(f.flat_no).toLowerCase() === s.toLowerCase())[0]; if (exact) return String(exact.flat_no);
  const d = (s.match(/\d+/g) || []).join(''); const hit = d && flats.filter(f => String(f.flat_no).replace(/\D/g, '') === d);
  return hit && hit.length === 1 ? String(hit[0].flat_no) : '';
}
const regNorm_ = x => String(x || '').toLowerCase().replace(/[^a-z0-9ఀ-౿]/g, '');
const regDupKey_ = r => [String(r.visit_on).slice(0, 10), regNorm_(r.name), String(r.flat_no || '').toLowerCase(), String(r.in_time || '').slice(0, 5)].join('|');
function regRows_(read, flats) {
  const F = ['serial', 'date', 'name', 'flat', 'purpose', 'phone', 'in_time', 'out_time', 'remarks'];
  return (Array.isArray(read.rows) ? read.rows : []).slice(0, REG_MAX_ROWS).map((x, i) => {
    x = x || {}; const t = k => String(x[k] == null ? '' : x[k]).replace(/\s+/g, ' ').trim();
    const flags = {};
    [].concat(x.unsure || [], x.unclear || []).forEach(k => { if (F.indexOf(k) >= 0) flags[k === 'flat' ? 'flat_no' : k === 'date' ? 'visit_on' : k] = 1; });
    const visit_on = regDate_(t('date_iso'), t('date')); if (!visit_on && (t('date') || t('date_iso'))) flags.visit_on = 1;
    const flat_no = regFlat_(t('flat'), flats); if (!flat_no && t('flat')) flags.flat_no = 1;
    const tin = regTime_(t('in_time')), tout = regTime_(t('out_time'));
    if (!tin && t('in_time')) flags.in_time = 1; if (!tout && t('out_time')) flags.out_time = 1;
    let phone = t('phone').replace(/[^\d+]/g, ''); if (phone && !/^(\+?91)?[6-9]\d{9}$|^0\d{9,11}$/.test(phone)) flags.phone = 1;
    return { key: 'r' + (i + 1), serial: t('serial').slice(0, 10), visit_on: visit_on, name: t('name').slice(0, 80), flat_no: flat_no, purpose: t('purpose').slice(0, 80),
      phone: phone.slice(0, 15), in_time: tin, out_time: tout, remarks: t('remarks').slice(0, 200), flags: Object.keys(flags),
      raw: { date: t('date'), flat: t('flat'), in_time: t('in_time'), out_time: t('out_time'), phone: t('phone') } };
  });
}
function regScan_(u, b) {
  const err = m => ({ error: { message: m } });
  if (REG_ROLE.indexOf(u.role) < 0) return err('Only the Secretary can import register photos.');
  const id = String(b.photo || ''), f = fileRows_(id);
  if (!f || CacheService.getScriptCache().get('up_' + id) !== String(u.username)) return err('The photo did not arrive. Please upload it again.');
  const v = f.sh.getRange(f.first, 3, f.n, 2).getValues(), mime = String(v[0][0]);
  if (!/^image\/(jpeg|png|webp)$/.test(mime)) return err('Please choose a photo (JPG or PNG).');
  let g; try { g = gemini_(mime, v.map(r => r[1]).join('')); } catch (e) { return err(e.message); }
  const flats = read_('flats'), rows = g.r && g.r.readable !== false ? regRows_(g.r, flats) : [];
  if (!rows.length) return err((g.r && g.r.problem ? String(g.r.problem).slice(0, 200) + ' ' : '') + 'No visitor entries could be read from this photo. Retake it straight from above, in good light, with the whole page in view.');
  /* possible duplicates of entries already in the register (same date, name, flat and in-time) */
  const have = {}; read_('visitors').forEach(r => { if (r.name) have[regDupKey_(r)] = r.id; });
  rows.forEach(r => { const k = regDupKey_(r); if (r.visit_on && r.name && have[k]) r.dup = have[k]; });
  const unsure = rows.filter(r => r.flags.length).length, lock = LockService.getScriptLock(); lock.waitLock(20000);
  let imp; try { imp = appendRec_('visitor_imports', { at: now_(), by: u.username, photo: id, model: g.model, found: rows.length, unsure: unsure, saved: 0, duplicates: rows.filter(r => r.dup).length, failed: 0, status: 'read' }); }
  finally { lock.releaseLock(); }
  return { ok: true, import_id: imp.id, photo: id, rows: rows };
}
function regSave_(u, b) {
  const err = m => ({ error: { message: m } });
  if (REG_ROLE.indexOf(u.role) < 0) return err('Only the Secretary can import register photos.');
  const imp = byId_('visitor_imports', b.import_id); if (!imp) return err('This import was not found. Please read the photo again.');
  const rows = Array.isArray(b.rows) ? b.rows.slice(0, REG_MAX_ROWS) : []; if (!rows.length) return err('There are no entries to save.');
  const flats = read_('flats').map(f => String(f.flat_no)).concat(['Common area']), visitors = read_('visitors'), byKey = {}, have = {};
  visitors.forEach(r => { if (r.import_key) byKey[String(r.import_key)] = r.id; if (r.name) have[regDupKey_(r)] = r.id; });
  const results = [], recs = [], today = today_();
  rows.forEach(x => {
    x = x || {}; const key = String(x.key || ''), res = { key: key };
    if (!/^[A-Za-z0-9_-]{1,24}$/.test(key)) { res.status = 'invalid'; res.message = 'Bad row.'; results.push(res); return; }
    const ik = imp.id + ':' + key;
    if (byKey[ik]) { res.status = 'saved'; res.id = byKey[ik]; res.already = true; results.push(res); return; } /* saved by an earlier try: never twice */
    const r = { visit_on: String(x.visit_on || ''), name: String(x.name || '').replace(/\s+/g, ' ').trim(), flat_no: String(x.flat_no || ''), purpose: String(x.purpose || '').trim().slice(0, 80),
      phone: String(x.phone || '').replace(/[^\d+]/g, ''), in_time: String(x.in_time || ''), out_time: String(x.out_time || ''), remarks: String(x.remarks || '').trim().slice(0, 200) };
    const bad = [];
    if (!r.name || r.name.length > 80) bad.push('name');
    if (!isDate_(r.visit_on) || r.visit_on > today) bad.push('date');
    if (flats.indexOf(r.flat_no) < 0) bad.push('flat');
    if (!isTime_(r.in_time)) bad.push('in-time');
    if (r.out_time && !isTime_(r.out_time)) bad.push('out-time');
    if (r.phone && !/^\+?\d{6,15}$/.test(r.phone)) bad.push('phone');
    if (bad.length) { res.status = 'invalid'; res.message = 'Check the ' + bad.join(', ') + '.'; results.push(res); return; }
    const dk = regDupKey_(r);
    if (have[dk] && x.force !== true) { res.status = 'duplicate'; res.id = have[dk]; res.message = 'Already in the register.'; results.push(res); return; }
    have[dk] = 'new';
    recs.push(Object.assign(r, { count: 1, added_by: u.username, status: 'register', import_id: imp.id, import_key: ik, created_at: now_() }));
    res.status = 'saved'; res.rec = recs[recs.length - 1]; results.push(res);
  });
  /* one write for the whole batch */
  if (recs.length) {
    const sh = sh_('visitors'), cols = TABLES.visitors; let id = nextId_('visitors', 'id');
    recs.forEach(r => { r.id = id++; });
    try {
      const start = Math.max(sh.getLastRow(), 1) + 1, need = start + recs.length - 1 - sh.getMaxRows();
      if (need > 0) sh.insertRowsAfter(sh.getMaxRows(), need);
      sh.getRange(start, 1, recs.length, cols.length).setValues(recs.map(r => cols.map(c => r[c] == null ? '' : cell_(r[c]))));
      TOUCHED_.visitors = 1;
    } catch (e) { results.forEach(x => { if (x.rec) { x.status = 'failed'; x.message = 'Could not save. Please try again.'; } }); }
  }
  results.forEach(x => { if (x.rec) { if (x.status === 'saved') x.id = x.rec.id; delete x.rec; } });
  const n = s => results.filter(x => x.status === s).length, saved = (+imp.saved || 0) + results.filter(x => x.status === 'saved' && !x.already).length;
  setCells_('visitor_imports', imp.__r, { saved: saved, duplicates: n('duplicate'), failed: n('failed') + n('invalid'), status: n('failed') + n('invalid') + n('duplicate') ? 'partly saved' : 'saved' });
  const fresh = results.filter(x => x.status === 'saved' && !x.already).length;
  if (fresh) audit_(u, 'insert', 'visitors', 'import ' + imp.id, 'Visitor register photo: ' + fresh + ' entr' + (fresh === 1 ? 'y' : 'ies') + ' saved', null, null);
  return { ok: true, results: results };
}
function regCancel_(u, b) {
  if (REG_ROLE.indexOf(u.role) < 0) return { error: { message: 'Only the Secretary can import register photos.' } };
  const imp = byId_('visitor_imports', b.import_id);
  if (imp && !(+imp.saved)) setCells_('visitor_imports', imp.__r, { status: 'cancelled' });
  return { ok: true };
}
function regList_(u) {
  if (REG_ROLE.indexOf(u.role) < 0) return { error: { message: 'Only the Secretary can import register photos.' } };
  const rows = sh_('visitor_imports') ? read_('visitor_imports') : [];
  return { ok: true, ready: !!PROPS_().getProperty('GEMINI_KEY'), imports: rows.slice(-15).reverse().map(r => ({ id: r.id, at: r.at, by: r.by, photo: r.photo, found: r.found, saved: r.saved, status: r.status })) };
}
/* Run once after adding GEMINI_KEY: checks that the key and model answer */
function testGemini() {
  const key = PROPS_().getProperty('GEMINI_KEY');
  if (!key) { Logger.log('Add the GEMINI_KEY script property first (Project Settings > Script properties).'); return; }
  const body = { contents: [{ parts: [{ text: 'Reply with the single word OK.' }] }] };
  [GEM_MODEL_(), GEM_FALLBACK].forEach(m => {
    const res = gemFetch_(key, m, body), c = res.getResponseCode();
    Logger.log(c === 200 ? 'Gemini is working (model ' + m + ').' : c === 503 ? 'Model ' + m + ': Google is busy right now (503). Your key is fine; the app waits and retries by itself.' : 'Model ' + m + ' answered ' + c + ': ' + res.getContentText().slice(0, 300));
  });
}

/* ---------- TELUGU: typed text (notices, complaints, events, polls...) gets a Telugu copy ----------
   When something is posted, Google Translate makes a Telugu copy and saves it in the 'te' column of that tab.
   The app shows it when a resident chooses తెలుగు. The English (as typed) stays in its own column.
   TO FIX A BAD TRANSLATION: edit the 'te' cell by hand (keep the {"title":"..."} shape), then run clearCache().
   Run translateAll() ONCE by hand (click Allow) to translate everything posted before this update.
   Free Google account limit: about 5,000 translations a day; the app uses one per field, only when posting. */
const TE_FIELDS = {
  notices: ['title'], complaints: ['title', 'details'], meetings: ['title', 'place', 'agenda', 'minutes', 'resolutions'], polls: ['question', 'options'],
  maintenance_log: ['details'], gallery: ['title'], celebrations: ['details'], expenses: ['description', 'remarks'],
  asset_service: ['details'], reminders: ['title'], action_items: ['task']
};
const TE_RX = /[\u0C00-\u0C7F]/;
let TE_FAIL_ = false; /* set when Google Translate refuses (daily limit): rows are then left for a later try */
function teOne_(x) {
  x = String(x == null ? '' : x).trim();
  if (!x || TE_RX.test(x) || !/[A-Za-z]/.test(x)) return null; /* already Telugu, or only numbers */
  try {
    /* long text (meeting minutes) is translated a few lines at a time */
    const parts = [], lines = x.split('\n'); let cur = '';
    lines.forEach(l => { if ((cur + '\n' + l).length > 3500 && cur) { parts.push(cur); cur = l; } else cur = cur ? cur + '\n' + l : l; });
    if (cur) parts.push(cur.slice(0, 3900));
    const r = parts.map(s => s.slice(0, 4500)).map(s => /[A-Za-z]/.test(s) ? String(LanguageApp.translate(s, '', 'te') || '').trim() : s).join('\n').trim();
    return r && r !== x ? r : null;
  }
  catch (e) { TE_FAIL_ = true; return null; }
}
function te_(t, rec) {
  const o = {};
  (TE_FIELDS[t] || []).forEach(k => {
    const v = rec[k]; if (v == null || v === '') return;
    if (k === 'options') { const a = String(v).split('|').map(x => teOne_(x) || x); if (a.join('|') !== String(v)) o[k] = a.join('|'); }
    else { const r = teOne_(v); if (r) o[k] = r; }
  });
  return Object.keys(o).length ? JSON.stringify(o) : '';
}
/* fills the 'te' column for older rows; stops after 'max' rows or 4.5 minutes, so run it again if the log says so */
function translateMissing_(max) {
  const start = Date.now(), touched = {}; let done = 0, left = 0;
  Object.keys(TE_FIELDS).forEach(t => {
    const sh = sh_(t); if (!sh) return;
    const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String), col = head.indexOf('te') + 1;
    if (!col) return;
    read_(t).forEach(r => {
      if (r.te) return;
      if (done >= max || Date.now() - start > 270000) { left++; return; }
      TE_FAIL_ = false;
      const v = te_(t, r);
      if (TE_FAIL_) { left++; return; }
      sh.getRange(r.__r, col).setValue(v || '{}'); done++; touched[t] = 1;
    });
  });
  Object.keys(touched).forEach(patchSnap_);
  return { done: done, left: left };
}
function translateAll() {
  upgradeUsers(); /* adds the 'te' column header to each tab if missing */
  const r = translateMissing_(100000);
  Logger.log('Translated ' + r.done + ' rows. ' + (r.left ? r.left + ' still waiting: run translateAll again.' : 'All done.'));
}
