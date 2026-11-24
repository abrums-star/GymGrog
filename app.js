import { PATTERNS, EXERCISES, TEMPLATES, SHORT_TEMPLATE, DEFAULT_SETTINGS } from './data.js';

// ---------- state ----------
const KEY = 'gymgrog.v1';
const blank = () => ({
  settings: { ...DEFAULT_SETTINGS },
  exerciseStatus: {},   // id -> status override
  overrides: {},        // "block:template:slot" -> exerciseId
  workouts: [],         // finished sessions
  weights: [],          // { date, kg }
  surfDays: [],         // 'YYYY-MM-DD'
  active: null,         // session in progress
  nextIdx: 0,           // index into TEMPLATES
  restOverride: {},     // exerciseId -> rest seconds the user picked for it
  customExercises: [],  // exercises added in the library (no photos)
});
let S = load();
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); return { ...blank(), ...s, settings: { ...DEFAULT_SETTINGS, ...s.settings } }; } } catch (e) { console.warn(e); }
  return blank();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn(e); } }
if (!S.settings.programStart) { S.settings.programStart = today(); save(); }
// The user's own exercises live in state; merge them into the pool so every lookup sees them.
function syncCustom() {
  for (let i = EXERCISES.length - 1; i >= 0; i--) if (EXERCISES[i].custom) EXERCISES.splice(i, 1);
  (S.customExercises || []).forEach(c => EXERCISES.push({ ...c, custom: true }));
}
syncCustom();

// ---------- helpers ----------
function today(d = new Date()) { const z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; }
function addDays(iso, n) { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return today(d); }
function daysBetween(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000); }
function fmtDate(iso) { return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
const exById = id => EXERCISES.find(e => e.id === id);
const pics = ex => ex.custom ? '' : `<div class="pics">${[0, 1].map(n => `<img src="img/${ex.id}-${n}.jpg" alt="${esc(ex.name)}, ${n ? 'end' : 'start'} position" loading="lazy" data-action="zoom" data-id="${ex.id}">`).join('')}</div>`;
const statusOf = ex => S.exerciseStatus[ex.id] || ex.status;
function blockNumber(iso = today()) { return Math.max(0, Math.floor(daysBetween(S.settings.programStart, iso) / S.settings.blockDays)); }
function daysToNextBlock() { const b = blockNumber() + 1; return b * S.settings.blockDays - daysBetween(S.settings.programStart, today()); }

function poolFor(pattern) {
  const p = EXERCISES.filter(e => e.pattern === pattern && ['like', 'ok'].includes(statusOf(e)));
  return [...p.filter(e => statusOf(e) === 'like'), ...p.filter(e => statusOf(e) !== 'like')];
}
function pickExercise(tpl, slotIdx, block = blockNumber()) {
  const key = `${block}:${tpl.id}:${slotIdx}`;
  const o = S.overrides[key]; if (o && exById(o) && ['like', 'ok'].includes(statusOf(exById(o)))) return exById(o);
  const slot = tpl.slots[slotIdx]; const pool = poolFor(slot.pattern);
  if (!pool.length) return null;
  return pool[(block + slot.offset) % pool.length];
}
function swapExercise(tpl, slotIdx) {
  const cur = pickExercise(tpl, slotIdx); const pool = poolFor(tpl.slots[slotIdx].pattern);
  if (pool.length < 2) { noAlternative(cur, tpl.slots[slotIdx].pattern); return; }
  const i = pool.findIndex(e => e.id === cur?.id);
  S.overrides[`${blockNumber()}:${tpl.id}:${slotIdx}`] = pool[(i + 1) % pool.length].id; save();
}
function noAlternative(ex, pattern) { toast(`${ex ? ex.name : 'This'} is the only "${PATTERNS[pattern].name}" exercise in your program. Rate another one "ok" in Program › Exercise library.`); }
// Drop an exercise for good (status "never"). Refuses if it is the last one for its pattern.
function banExercise(ex, pattern) {
  const rest = poolFor(pattern).filter(x => x.id !== ex.id);
  if (!rest.length) { alert(`${ex.name} is the only "${PATTERNS[pattern].name}" exercise left. Rate another one "ok" in the exercise library first.`); return false; }
  S.exerciseStatus[ex.id] = 'never'; toast(`${ex.name} is out of your program. Bring it back in Program › Exercise library.`); return true;
}
// Mid-session: swap (keep it in the program) or ban (never again), then put the replacement in this slot.
function replaceLive(ei, ban) {
  const a = S.active; const en = a.entries[ei]; const old = exById(en.exerciseId);
  if (ban) { if (!banExercise(old, en.pattern)) return; }
  const pool = poolFor(en.pattern); if (!ban && pool.length < 2) { noAlternative(old, en.pattern); return; }
  const i = pool.findIndex(x => x.id === en.exerciseId); const ex = pool[(i + 1) % pool.length];
  const sg = suggest(ex, { reps: en.reps });
  en.exerciseId = ex.id; en.note = sg.note; en.plan = { w: sg.w, r: sg.r }; en.rest = S.restOverride[ex.id] ?? en.rest; en.sets.forEach(s => { if (!s.done) { s.w = sg.w; s.r = sg.r; } });
  if (en.slot != null) S.overrides[`${blockNumber()}:${a.templateId}:${en.slot}`] = ex.id;
  if (timer.iv && timer.label.includes(old.name)) timer.label = timer.label.replace(old.name, ex.name);
  save(); render();
}
function rotation() { const r = (S.settings.rotation || []).map(id => TEMPLATES.find(t => t.id === id)).filter(Boolean); return r.length ? r : TEMPLATES.slice(0, 3); }
function nextTemplate() { const r = rotation(); return r[S.nextIdx % r.length]; }
const tplById = id => id === 'S' ? SHORT_TEMPLATE : TEMPLATES.find(t => t.id === id);

function lastPerformance(exId) {
  for (let i = S.workouts.length - 1; i >= 0; i--) {
    const en = S.workouts[i].entries.find(x => x.exerciseId === exId && x.sets.some(s => s.done));
    if (en) return { date: S.workouts[i].date, sets: en.sets.filter(s => s.done), feel: en.feel || null };
  }
  return null;
}
// Weight increment for an exercise. Machines differ (a stack can move in 7 kg plates), so once two
// different weights have been logged, the smallest gap between logged weights replaces the default step.
function stepFor(ex) {
  if (ex.unit !== 'kg' || !ex.step) return ex.step;
  const ws = [...new Set(S.workouts.flatMap(w => w.entries.filter(e => e.exerciseId === ex.id).flatMap(e => e.sets.filter(s => s.done && s.w != null).map(s => +s.w))))].sort((a, b) => a - b);
  let d = Infinity; for (let i = 1; i < ws.length; i++) d = Math.min(d, +(ws[i] - ws[i - 1]).toFixed(2));
  if (!(d >= 0.5 && d <= 25)) return ex.step;
  return ex.step < 0 ? -d : d;
}
// How the exercise felt last time: 'easy' | 'hard' (challenging, just right) | 'fail' (impossible).
const FEELS ={ easy: 'Easy', hard: 'Challenging', fail: 'Impossible' };
// Next-time suggestion. The rating drives it: easy → go up (two steps if you also hit the top of the
// range), challenging → up only when every set hit the top, impossible → back down one step.
function suggest(ex, slot) {
  const last = lastPerformance(ex.id);
  if (!last) return { w: null, r: slot.reps[1], note: ex.unit === 'kg' ? 'First time. Pick a weight you can do for the top of the range with 2 reps spare. Rate it afterwards so next time adjusts.'
    : `First time. Aim for ${slot.reps[1]}${ex.unit === 'time' ? ' s' : ex.unit === 'min' ? ' min' : ' reps'}, then rate how it felt.` };
  const ws = last.sets.map(s => s.w).filter(x => x != null); const w = ws.length ? ws[ws.length - 1] : null;
  const reps = last.sets.map(s => s.r).join('/');
  const hitTop = last.sets.every(s => (s.r ?? 0) >= slot.reps[1]);
  const when = `Last time ${fmtDate(last.date)}`;
  const felt = last.feel === 'easy' ? 'felt easy' : last.feel === 'fail' ? 'was too much' : hitTop ? `all sets at ${slot.reps[1]}+` : 'felt right';
  let steps = last.feel === 'easy' ? (hitTop ? 2 : 1) : last.feel === 'fail' ? -1 : hitTop ? 1 : 0;
  if (ex.unit === 'kg') {
    if (w == null) return { w: null, r: slot.reps[1], note: `${when}: ${reps} reps, no weight logged. Log the kg this time to get suggestions.` };
    const step = stepFor(ex); if (!step) steps = 0;
    const nw = Math.max(0, +(w + steps * step).toFixed(1));
    const assisted = step < 0; // assisted pull-up: the number is the assistance, so "harder" means a smaller number
    const plates = step !== ex.step ? ` (${Math.abs(step)} kg steps on this machine)` : '';
    if (steps > 0) return { w: nw, r: slot.reps[0], note: `${when}: ${w} kg × ${reps}, ${felt}. ${assisted ? 'Less assistance: ' : 'Go up to '}${nw} kg${plates}, aim for ${slot.reps[0]}.` };
    if (steps < 0) return { w: nw, r: slot.reps[0], note: `${when}: ${w} kg ${felt}. ${assisted ? 'More assistance: ' : 'Back down to '}${nw} kg${plates}, aim for ${slot.reps[0]}.` };
    return { w, r: slot.reps[1], note: `${when}: ${w} kg × ${reps}, ${felt}. Same weight, aim for ${slot.reps[1]}.` };
  }
  const r = last.sets[last.sets.length - 1].r ?? slot.reps[1];
  const unitStep = ex.unit === 'time' ? 5 : ex.unit === 'min' ? 0 : 1;
  const nr = Math.max(1, r + steps * unitStep);
  const u = ex.unit === 'time' ? ' s' : ex.unit === 'min' ? ' min' : ' reps';
  return { w: null, r: nr, note: `${when}: ${reps}${u}, ${felt}.${nr !== r ? ` Aim for ${nr}${u}.` : ''}` };
}

// ---------- session lifecycle ----------
function startSession(tpl) {
  const entries = tpl.slots.map((slot, i) => {
    const ex = pickExercise(tpl, i); if (!ex) return null;
    const sg = suggest(ex, slot);
    return { exerciseId: ex.id, slot: i, pattern: slot.pattern, rest: S.restOverride[ex.id] ?? slot.rest, reps: slot.reps, note: sg.note, plan: { w: sg.w, r: sg.r },
      sets: Array.from({ length: slot.sets }, () => ({ w: sg.w, r: sg.r, done: false })) };
  }).filter(Boolean);
  S.active = { id: uid(), date: today(), templateId: tpl.id, templateName: tpl.name, startedAt: Date.now(), entries, cur: 0, notes: '' };
  save(); requestWakeLock(); ensureNotifyPermission(); pushSubscription(true).catch(() => {}); go('session');
}
function finishSession() {
  const a = S.active; if (!a) return;
  a.finishedAt = Date.now(); delete a.cur;
  S.workouts.push(a); S.active = null;
  const r = rotation(); if (r.some(t => t.id === a.templateId)) S.nextIdx = (r.findIndex(t => t.id === a.templateId) + 1) % r.length;
  stopTimer(); releaseWakeLock(); save(); go('home');
}
function discardSession() { if (!confirm('Discard this session? Nothing will be saved.')) return; S.active = null; stopTimer(); releaseWakeLock(); save(); go('home'); }

// ---------- rest timer ----------
let timer = { end: 0, iv: null, over: false, label: '' };
const timerEl = document.getElementById('timer');
function startTimer(sec, label = '') {
  stopTimer(); if (!sec) return;
  timer = { end: Date.now() + sec * 1000, iv: setInterval(tickTimer, 250), over: false, label };
  timerEl.classList.remove('hidden', 'over'); tickTimer(); schedulePush();
}
function tickTimer() {
  if (!timer.iv) return;
  const left = Math.ceil((timer.end - Date.now()) / 1000);
  if (left <= 0 && !timer.over) { timer.over = true; timerEl.classList.add('over'); notify(); }
  const shown = Math.abs(left); const m = Math.floor(shown / 60), sec = shown % 60;
  timerEl.innerHTML = `<div class="t">${timer.over ? 'GO ' : ''}${m}:${String(sec).padStart(2, '0')}<small>${esc(timer.label)}</small></div>
    <button data-action="timer-sub">−30s</button><button data-action="timer-add">+30s</button><button data-action="timer-stop">${timer.over ? 'OK' : 'Skip'}</button>`;
}
function stopTimer() { const had = !!timer.iv; clearInterval(timer.iv); timer.iv = null; timerEl.classList.add('hidden'); closeNotifications(); if (had) cancelPush(); }
// Silent by design: nobody else in the gym needs to hear it. Vibration while the app is on screen,
// plus a silent system notification so the phone still shows something when you are in another app.
function notify() {
  if (S.settings.vibrate && navigator.vibrate) { try { navigator.vibrate([200, 100, 200, 100, 400]); } catch (e) { /* ignore */ } }
  if (!S.settings.notify || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const title = 'GymGrog · rest over'; const opts = { body: timer.label || 'Back to it.', tag: 'gymgrog-rest', renotify: true, silent: true, icon: './icon.svg' };
  const fallback = () => { try { new Notification(title, opts); } catch (e) { /* ignore */ } };
  if (navigator.serviceWorker) navigator.serviceWorker.getRegistration().then(r => r ? r.showNotification(title, opts) : fallback()).catch(fallback);
  else fallback();
}
function closeNotifications() {
  try { navigator.serviceWorker?.getRegistration().then(r => r?.getNotifications({ tag: 'gymgrog-rest' })).then(ns => ns?.forEach(n => n.close())).catch(() => {}); } catch (e) { /* ignore */ }
}
function ensureNotifyPermission() {
  if (S.settings.notify && typeof Notification !== 'undefined' && Notification.permission === 'default') { try { Notification.requestPermission().catch(() => {}); } catch (e) { /* ignore */ } }
}
function notifyState() {
  if (typeof Notification === 'undefined') return '<span class="pill never">not available here (on iPhone: add GymGrog to the home screen first)</span>';
  const p = Notification.permission;
  return p === 'granted' ? '<span class="pill like">allowed</span>' : p === 'denied' ? '<span class="pill never">blocked in the phone settings</span>' : '<span class="pill unknown">tap Save to allow</span>';
}
// ---------- background alerts (Web Push) ----------
// iOS freezes the page's JavaScript as soon as you switch to another app, so the in-page timer above
// cannot show anything there. A tiny server (push-server/) is told when the rest ends and sends a push
// at that moment; sw.js turns it into the same silent notification. The timer itself never waits for
// the network: every call here is fire-and-forget, and offline the in-page alert still works as before.
const PUSH = { endpoint: 'https://gymgrog-push.abrums.workers.dev', vapid: 'BOFJTZXvboSVGDGWdPftqKAHDkIftavgcLv5hQUNTri4Z4pe-4sVZ9uqnMPlNNTNO_Jhh9evFvcXJMZWl8s7K_w' };
let pushSeq = 0;
function pushSupported() { return !!(PUSH.endpoint && 'serviceWorker' in navigator && 'PushManager' in window && typeof Notification !== 'undefined' && location.protocol !== 'file:'); }
async function pushSubscription(create) {
  if (!pushSupported() || Notification.permission !== 'granted') return null;
  const reg = await navigator.serviceWorker.getRegistration(); if (!reg) return null;
  const cur = await reg.pushManager.getSubscription(); if (cur || !create) return cur;
  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(PUSH.vapid) });
}
function b64ToU8(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); s += '='.repeat((4 - s.length % 4) % 4); return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }
function pushPost(path, body) {
  return fetch(PUSH.endpoint + path, { method: 'POST', body: JSON.stringify(body), keepalive: true, headers: { 'Content-Type': 'text/plain' } });
}
function schedulePush() {
  if (!S.settings.notify || !pushSupported()) return;
  const at = timer.end, seq = ++pushSeq, label = timer.label || 'Back to it.';
  pushSubscription(true).then(sub => { if (sub && timer.iv && timer.end === at) return pushPost('/schedule', { subscription: sub.toJSON(), at, label, seq }); }).catch(() => {});
}
function cancelPush() {
  if (!pushSupported()) return;
  const seq = ++pushSeq;
  pushSubscription(false).then(sub => { if (sub) return pushPost('/cancel', { endpoint: sub.endpoint, seq }); }).catch(() => {});
}
// Settings line: filled in asynchronously because the subscription lookup is a promise.
function pushState() {
  const standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  let msg;
  if (!PUSH.endpoint) msg = '<span class="pill unknown">not configured</span>';
  else if (!('PushManager' in window) || typeof Notification === 'undefined') msg = standalone ? '<span class="pill never">not available on this phone</span>' : '<span class="pill never">needs the app installed on the home screen</span>';
  else if (Notification.permission !== 'granted') msg = '<span class="pill unknown">allow notifications above first</span>';
  else { msg = '<span class="pill unknown">checking…</span>'; pushSubscription(false).then(sub => { const el = document.getElementById('push-state'); if (el) el.innerHTML = sub ? '<span class="pill like">set up</span>' : '<span class="pill unknown">not yet</span> <button data-action="push-setup" style="width:auto;padding:4px 10px">Set up now</button>'; }).catch(() => {}); }
  return `<span id="push-state">${msg}</span>`;
}
function nextUpLabel(ei) {
  const a = S.active; const en = a.entries[ei]; const ex = exById(en.exerciseId);
  const k = en.sets.findIndex(x => !x.done);
  if (k >= 0) return `Next: set ${k + 1} of ${en.sets.length}, ${ex.name}`;
  const nx = a.entries.slice(ei + 1).find(e => e.sets.some(x => !x.done));
  return nx ? `Next: ${exById(nx.exerciseId).name}` : null;
}
let toastT;
function toast(msg) {
  let t = document.getElementById('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 4000);
}
let wakeLock = null;
async function requestWakeLock() { try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (e) { /* ignore */ } }
function releaseWakeLock() { try { wakeLock?.release(); wakeLock = null; } catch (e) { /* ignore */ } }
document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') return; if (S.active) requestWakeLock(); if (timer.iv) { tickTimer(); if (timer.over) closeNotifications(); } });

// ---------- regularity ----------
function last14() {
  const t = today(); const days = [];
  for (let i = 13; i >= 0; i--) { const d = addDays(t, -i); days.push({ d, work: S.workouts.some(w => w.date === d), surf: S.surfDays.includes(d), today: d === t }); }
  return days;
}

// ---------- views ----------
const view = document.getElementById('view');
let current = 'home';
function go(v) { current = v; render(); window.scrollTo(0, 0); }
function render() {
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === current));
  const fn = { home, session, history, weight, program, settings, pick }[current] || home;
  view.innerHTML = fn();
}

function home() {
  if (S.active) return `<h1>Session in progress</h1><div class="card accent"><h3>${esc(S.active.templateName)}</h3><p class="muted">Started ${new Date(S.active.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    <button class="primary big" data-action="go" data-view="session">Continue</button></div>`;
  const tpl = nextTemplate(); const days = last14(); const n = days.filter(d => d.work).length;
  const cls = n >= S.settings.goalPer14 ? 'good' : n >= S.settings.targetPer14 ? 'warn' : 'bad';
  const preview = tpl.slots.map((s, i) => pickExercise(tpl, i)).filter(Boolean).map(e => esc(e.name)).join(' · ');
  const lastW = S.weights[S.weights.length - 1]; const t = today();
  const surfedToday = S.surfDays.includes(t);
  const lastSession = S.workouts[S.workouts.length - 1];
  return `<h1>GymGrog</h1>
  <div class="card accent"><div class="row between"><h3>Next up: ${esc(tpl.name)}</h3><span class="pill">Block ${blockNumber() + 1}</span></div>
    <p class="muted">${esc(tpl.tagline)}</p><p class="small">${preview}</p>
    <button class="primary big" data-action="start" data-tpl="${tpl.id}">Start session</button>
    <div class="row" style="margin-top:8px"><button class="grow" data-action="start" data-tpl="S">Short session (20 min)</button><button class="grow" data-action="go" data-view="pick">Other session</button></div>
  </div>
  <div class="card"><div class="row between"><h3>Last 14 days</h3><span class="ring ${cls}">${n}</span></div>
    <p class="muted">Minimum ${S.settings.targetPer14}, goal ${S.settings.goalPer14}. ${n >= S.settings.goalPer14 ? 'On target.' : n >= S.settings.targetPer14 ? `${S.settings.goalPer14 - n} more to hit the goal.` : `${S.settings.targetPer14 - n} more to hit the minimum.`}</p>
    <div class="strip">${days.map(d => `<div class="d ${d.work && d.surf ? 'both' : d.work ? 'work' : d.surf ? 'surf' : ''} ${d.today ? 'today' : ''}" title="${d.d}"></div>`).join('')}</div>
    <p class="legend small"><span><i class="dot" style="background:var(--good)"></i>gym</span><span><i class="dot" style="background:var(--surf)"></i>surf</span></p>
    <button class="${surfedToday ? 'active' : ''}" data-action="toggle-surf">${surfedToday ? 'Surfed today ✓' : 'I surfed today'}</button>
    ${lastSession ? `<p class="muted small" style="margin-top:8px">Last session: ${esc(lastSession.templateName)} on ${fmtDate(lastSession.date)}</p>` : ''}
  </div>
  <div class="card"><div class="row between"><h3>Weight</h3><span class="ring" style="font-size:1.6rem">${lastW ? lastW.kg + ' kg' : '—'}</span></div>
    ${weightTrendText()}
    <div class="row"><input type="number" step="0.1" id="wq" placeholder="kg" inputmode="decimal"><button class="primary" data-action="log-weight">Log</button></div>
  </div>`;
}
function weightTrendText() {
  if (S.weights.length < 2) return `<p class="muted small">Log your weight a few times to see the trend. Same time of day, before breakfast, works best.</p>`;
  const last = S.weights[S.weights.length - 1]; const ref = [...S.weights].reverse().find(w => daysBetween(w.date, last.date) >= 14) || S.weights[0];
  const diff = +(last.kg - ref.kg).toFixed(1);
  const goal = S.settings.targetWeight ? ` Target ${S.settings.targetWeight} kg, ${(last.kg - S.settings.targetWeight).toFixed(1)} kg to go.` : '';
  return `<p class="muted small">${diff <= 0 ? '' : '+'}${diff} kg since ${fmtDate(ref.date)}.${goal}</p>`;
}

function session() {
  const a = S.active; if (!a) return home();
  const elapsed = Math.floor((Date.now() - a.startedAt) / 60000);
  const allDone = a.entries.every(e => e.sets.every(s => s.done));
  return `<div class="row between"><h1>${esc(a.templateName)}</h1><span class="muted">${elapsed} min</span></div>
  ${a.entries.map((en, ei) => {
    const ex = exById(en.exerciseId); const done = en.sets.every(s => s.done);
    const unit = ex.unit; const hasW = unit === 'kg';
    const repLabel = unit === 'time' ? 'sec' : unit === 'min' ? 'min' : 'reps';
    const alone = poolFor(en.pattern).length < 2; // nothing to swap to: show it before the tap
    return `<div class="card ex ${ei === a.cur ? 'current' : ''} ${done ? 'done' : ''} ${ei === a.cur ? 'open' : ''}" data-entry="${ei}">
      <div class="row between nowrap"><span class="grip" data-grip="${ei}" title="Hold and drag to reorder">☰</span><div class="grow"><h3>${esc(ex.name)}</h3><p class="muted small">${esc(PATTERNS[en.pattern].name)} · ${en.sets.length} × ${en.reps[0]}${en.reps[1] !== en.reps[0] ? '–' + en.reps[1] : ''} ${repLabel}${en.rest > 0 || en.sets.length > 1 ? ` · <span class="rest">rest <button data-action="rest" data-entry="${ei}" data-d="-15" title="15 s less rest">−</button>${en.rest}s<button data-action="rest" data-entry="${ei}" data-d="15" title="15 s more rest">+</button></span>` : ''}</p></div>
        <div class="row nowrap"><button class="sm ${alone ? 'off' : ''}" data-action="swap-live" data-entry="${ei}" title="${alone ? 'No other exercise for this pattern' : 'Swap for another exercise today'}">⇄</button><button class="sm" data-action="ban-live" data-entry="${ei}" title="Never again: drop it and replace it">✕</button><button class="sm" data-action="cues" data-entry="${ei}">?</button></div></div>
      <p class="prev">${esc(en.note)}</p>
      <div class="cues">${pics(ex)}<p>${esc(ex.cues)}<br><em>${esc(ex.equipment)}</em></p><p class="small">☰ hold and drag to change the order (machine taken?) · ⇄ swap for today · ✕ never show this exercise again · tap a photo to enlarge</p></div>
      ${planLine(en, ex, repLabel)}
      <div class="sets"><span class="hdr">set</span><span class="hdr">${hasW ? 'kg done' : ''}</span><span class="hdr">${repLabel} done</span><span class="hdr">✓</span>
      ${en.sets.map((s, si) => `<span class="n">${si + 1}</span>
        ${hasW ? `<input type="number" step="${Math.abs(stepFor(ex)) || 0.5}" inputmode="decimal" value="${s.w ?? ''}" data-field="w" data-entry="${ei}" data-set="${si}" placeholder="kg">` : `<span class="n">${unit === 'bw' ? 'bw' : ''}</span>`}
        <input type="number" inputmode="numeric" value="${s.r ?? ''}" data-field="r" data-entry="${ei}" data-set="${si}">
        <button class="check ${s.done ? 'on' : ''}" data-action="done" data-entry="${ei}" data-set="${si}">${s.done ? '✓' : ''}</button>`).join('')}
      </div>
      <div class="row feel"><span class="muted small">How was it?</span>${Object.entries(FEELS).map(([k, l]) => `<button class="sm ${k} ${en.feel === k ? 'on' : ''}" data-action="feel" data-entry="${ei}" data-feel="${k}">${l}</button>`).join('')}</div>
      <div class="row" style="margin-top:8px"><button class="sm ghost" data-action="add-set" data-entry="${ei}">+ set</button><button class="sm ghost" data-action="skip-ex" data-entry="${ei}">${done ? 'undo' : 'skip exercise'}</button></div>
    </div>`; }).join('')}
  <div class="card"><label>Notes (how it felt, what to change)</label><textarea id="notes" rows="2">${esc(a.notes)}</textarea></div>
  <button class="primary big" data-action="finish">${allDone ? 'Finish session' : 'Finish early'}</button>
  <button class="ghost big" data-action="discard">Discard</button>`;
}

// What the app asked for, so the inputs below can hold what actually happened.
function planLine(en, ex, repLabel) {
  const p = en.plan; if (!p) return '';
  const w = ex.unit === 'kg' ? (p.w != null ? `${p.w} kg × ` : 'your weight × ') : '';
  const range = en.reps[0] !== en.reps[1] ? ` (${en.reps[0]}–${en.reps[1]} is the range)` : '';
  return `<p class="plan"><b>Target: ${w}${p.r} ${repLabel}</b>${range}. Log what you actually did, then rate it.</p>`;
}
function pick() {
  const all = [...TEMPLATES, SHORT_TEMPLATE]; const rot = rotation().map(t => t.id); const nx = nextTemplate().id;
  return `<h1>Pick a session</h1><p class="muted">Any of these, any day. Sessions in the rotation advance the queue; the others do not.</p>
  ${all.map(t => { const preview = t.slots.map((sl, i) => pickExercise(t, i)).filter(Boolean).map(e => esc(e.name)).join(' · ');
    const mins = t.id === 'S' ? 20 : Math.round(t.slots.reduce((m, sl) => m + sl.sets * (sl.rest + 40) / 60, 0) + 10);
    return `<div class="card ${t.id === nx ? 'accent' : ''}"><div class="row between"><h3>${esc(t.name)}</h3><span class="pill ${rot.includes(t.id) ? 'like' : ''}">${t.id === nx ? 'next up' : rot.includes(t.id) ? 'in rotation' : 'one-off'}</span></div>
      <p class="muted small">${esc(t.tagline)} · about ${mins} min</p><p class="small">${preview}</p>
      <button class="primary" data-action="start" data-tpl="${t.id}">Start ${t.id}</button></div>`; }).join('')}`;
}

function history() {
  if (!S.workouts.length) return `<h1>History</h1><p class="muted">No sessions yet. The first one is the hardest.</p>`;
  return `<h1>History</h1><p class="muted">${S.workouts.length} sessions · ${S.surfDays.length} surf days logged</p><div class="hist">
  ${[...S.workouts].reverse().map(w => { const mins = w.finishedAt ? Math.round((w.finishedAt - w.startedAt) / 60000) : '?';
    const vol = w.entries.reduce((t, e) => t + e.sets.filter(s => s.done && s.w).reduce((x, s) => x + s.w * (s.r || 0), 0), 0);
    return `<details class="card"><summary><b>${esc(w.templateName)}</b> · ${fmtDate(w.date)} · ${mins} min${vol ? ` · ${Math.round(vol)} kg lifted` : ''}</summary>
      <table>${w.entries.map(e => { const ex = exById(e.exerciseId); const ds = e.sets.filter(s => s.done);
        return `<tr><td>${esc(ex?.name || e.exerciseId)}</td><td>${ds.length ? ds.map(s => (s.w != null ? s.w + '×' : '') + (s.r ?? '')).join(', ') : '<span class="muted">skipped</span>'}${e.feel ? ` <span class="pill ${e.feel}">${FEELS[e.feel]}</span>` : ''}</td></tr>`; }).join('')}</table>
      ${w.notes ? `<p class="small">${esc(w.notes)}</p>` : ''}
      <button class="sm danger" data-action="del-workout" data-id="${w.id}">Delete</button></details>`; }).join('')}</div>`;
}

function weight() {
  const ws = S.weights;
  return `<h1>Weight</h1>
  <div class="card"><div class="row"><input type="date" id="wd" value="${today()}" style="width:auto"><input type="number" step="0.1" id="wq" placeholder="kg" inputmode="decimal"><button class="primary" data-action="log-weight">Log</button></div>${weightTrendText()}</div>
  ${ws.length > 1 ? `<div class="card">${chart(ws)}</div>` : ''}
  <div class="card">${ws.length ? [...ws].reverse().slice(0, 30).map(w => `<div class="row between" style="padding:4px 0"><span>${fmtDate(w.date)}</span><span>${w.kg} kg</span><button class="sm ghost" data-action="del-weight" data-date="${w.date}">×</button></div>`).join('') : '<p class="muted">No entries yet.</p>'}</div>`;
}
function chart(ws) {
  const pts = ws.slice(-60); const W = 600, H = 160, P = 28;
  const ks = pts.map(p => p.kg); let lo = Math.min(...ks), hi = Math.max(...ks); if (S.settings.targetWeight) lo = Math.min(lo, S.settings.targetWeight);
  if (hi - lo < 2) { hi += 1; lo -= 1; }
  const d0 = pts[0].date, span = Math.max(1, daysBetween(d0, pts[pts.length - 1].date));
  const x = d => P + (daysBetween(d0, d) / span) * (W - 2 * P), y = k => H - P + 10 - ((k - lo) / (hi - lo)) * (H - 2 * P);
  const line = pts.map(p => `${x(p.date).toFixed(1)},${y(p.kg).toFixed(1)}`).join(' ');
  const tgt = S.settings.targetWeight ? `<line x1="${P}" x2="${W - P}" y1="${y(S.settings.targetWeight)}" y2="${y(S.settings.targetWeight)}" stroke="#4ade80" stroke-dasharray="4 4"/>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${tgt}<polyline points="${line}" fill="none" stroke="#38bdf8" stroke-width="2"/>
    ${pts.map(p => `<circle cx="${x(p.date)}" cy="${y(p.kg)}" r="3" fill="#38bdf8"/>`).join('')}
    <text x="4" y="${y(hi) + 4}">${hi.toFixed(1)}</text><text x="4" y="${y(lo) + 4}">${lo.toFixed(1)}</text>
    <text x="${P}" y="${H - 4}">${fmtDate(d0)}</text><text x="${W - P - 60}" y="${H - 4}">${fmtDate(pts[pts.length - 1].date)}</text></svg>`;
}

function program() {
  const all = [...TEMPLATES, SHORT_TEMPLATE];
  return `<h1>Program</h1><p class="muted">Block ${blockNumber() + 1} · exercises rotate in ${daysToNextBlock()} days. Patterns stay fixed, the exercise inside each one changes every ${S.settings.blockDays} days from the pool you rate "like" or "ok". Tap ⇄ to swap one for this block, ✕ to drop an exercise for good.</p>
  ${all.map(t => `<div class="card"><div class="row between"><h3>${esc(t.name)}</h3>${rotation().some(x => x.id === t.id) ? '<span class="pill like">in rotation</span>' : t.id === 'S' ? '' : '<span class="pill">one-off</span>'}</div><p class="muted small">${esc(t.tagline)}</p>
    ${t.slots.map((s, i) => { const ex = pickExercise(t, i); const pool = poolFor(s.pattern);
      return `<div class="row between nowrap" style="padding:6px 0;border-bottom:1px solid #334155"><div><div>${ex ? esc(ex.name) : '<span class="muted">no exercise available</span>'}</div><div class="muted small">${esc(PATTERNS[s.pattern].name)} · ${s.sets}×${s.reps[0]}${s.reps[1] !== s.reps[0] ? '–' + s.reps[1] : ''}</div></div>
        <div class="row nowrap"><button class="sm ${pool.length < 2 ? 'off' : ''}" data-action="swap" data-tpl="${t.id}" data-slot="${i}" title="${pool.length < 2 ? 'No other exercise for this pattern' : 'Swap for this block'}">⇄</button><button class="sm ${pool.length < 2 ? 'off' : ''}" data-action="ban" data-tpl="${t.id}" data-slot="${i}" title="Never again">✕</button></div></div>`; }).join('')}
  </div>`).join('')}
  <h2>Exercise library</h2><p class="muted small">Like = picked first. Ok = in rotation. Never = out. Unknown = parked until you try it. Tap a photo to see the machine and the movement.</p>
  <div class="card lib">${Object.keys(PATTERNS).map(p => `<h3 style="margin-top:10px">${esc(PATTERNS[p].name)} <span class="muted small">${esc(PATTERNS[p].muscles)}</span></h3>
    ${EXERCISES.filter(e => e.pattern === p).map(e => { const st = statusOf(e);
      return `<div class="item">${e.custom ? '<span class="thumb none"></span>' : `<img class="thumb" src="img/${e.id}-0.jpg" alt="" loading="lazy" data-action="zoom" data-id="${e.id}">`}<span class="name">${esc(e.name)} ${e.custom ? '<span class="pill new">yours</span>' : e.status === 'unknown' ? '<span class="pill new">new to you</span>' : ''}</span>
        <select data-action="status" data-id="${e.id}">${['like', 'ok', 'never', 'unknown'].map(s => `<option value="${s}" ${s === st ? 'selected' : ''}>${s}</option>`).join('')}</select>${e.custom ? `<button class="sm ghost" data-action="del-custom" data-id="${e.id}" title="Remove this exercise">×</button>` : ''}</div>`; }).join('')}`).join('')}</div>
  <div class="card"><h3>Add an exercise</h3><p class="muted small">Goes into the pattern you pick and rotates with the others. No photo, but your cues show up in the session. For a machine you want with photos, ask and it can be added to the app.</p>
    <label>Name</label><input id="c-name" placeholder="e.g. Hip thrust machine">
    <label>Pattern</label><select id="c-pattern">${Object.keys(PATTERNS).map(k => `<option value="${k}">${esc(PATTERNS[k].name)}</option>`).join('')}</select>
    <label>Equipment</label><input id="c-equip" placeholder="e.g. Hip thrust machine, seat 3">
    <label>Measured in</label><select id="c-unit"><option value="kg">kg × reps</option><option value="bw">bodyweight reps</option><option value="time">seconds</option><option value="min">minutes</option></select>
    <label>Weight increment (kg, for kg exercises)</label><input type="number" id="c-step" value="2.5" step="0.5" inputmode="decimal">
    <label>Cues (how to do it well)</label><textarea id="c-cues" rows="2" placeholder="Feet flat, pause at the top…"></textarea>
    <button class="primary" data-action="add-custom" style="margin-top:10px">Add to the library</button></div>`;
}

function settings() {
  const s = S.settings;
  return `<h1>Settings</h1>
  <div class="card"><label>Program start (block rotation counts from here)</label><input type="date" id="s-start" value="${s.programStart}">
    <label>Rotation block length (days)</label><input type="number" id="s-block" value="${s.blockDays}">
    <label>Minimum sessions per 14 days</label><input type="number" id="s-min" value="${s.targetPer14}">
    <label>Goal sessions per 14 days</label><input type="number" id="s-goal" value="${s.goalPer14}">
    <label>Target weight (kg)</label><input type="number" step="0.1" id="s-target" value="${s.targetWeight ?? ''}" placeholder="optional">
    <label><input type="checkbox" id="s-notify" ${s.notify ? 'checked' : ''} style="width:auto"> Silent notification when rest is over (shows even if you are in another app) ${notifyState()}</label>
    <label><input type="checkbox" id="s-vibrate" ${s.vibrate ? 'checked' : ''} style="width:auto"> Vibrate when rest is over</label>
    <p class="muted small" style="margin:6px 0 0">Background alerts: ${pushState()}<br>iPhone pauses GymGrog when you switch to another app, so a small server sends the "rest over" alert at the right moment. It only works with GymGrog installed on the home screen (Share → Add to Home Screen) and needs a connection when the rest starts; without one the alert still shows while GymGrog is on screen.</p>
    <button class="primary" data-action="save-settings" style="margin-top:10px">Save</button></div>
  <div class="card"><h3>Rotation</h3><p class="muted small">Sessions that cycle as "next up", in this order. Untick one to keep it as a one-off in "Other session".</p>
    ${TEMPLATES.map(t => `<label class="row" style="margin:4px 0"><input type="checkbox" data-action="rot" data-id="${t.id}" ${rotation().some(x => x.id === t.id) ? 'checked' : ''} style="width:auto"> ${esc(t.name)} <span class="muted small">${esc(t.tagline)}</span></label>`).join('')}
    <h3 style="margin-top:12px">Next session</h3><p class="muted small">Queue position. Tap to force a different one next.</p>
    <div class="row">${rotation().map((t, i) => `<button class="${i === S.nextIdx % rotation().length ? 'active' : ''}" data-action="set-next" data-idx="${i}">${t.id}</button>`).join('')}</div></div>
  <div class="card"><h3>Data</h3><p class="muted small">Everything is stored in this browser only. Export regularly, or before changing phone.</p>
    <div class="row"><button data-action="export">Export JSON</button><button data-action="import">Import JSON</button><input type="file" id="imp" accept="application/json" hidden></div>
    <button class="danger sm" data-action="reset" style="margin-top:12px">Reset everything</button></div>
  <p class="muted small">GymGrog · ${S.workouts.length} sessions logged</p>`;
}

// ---------- events ----------
document.getElementById('nav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.view); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-action]'); if (!b) return;
  const a = b.dataset.action, d = b.dataset;
  switch (a) {
    case 'go': go(d.view); break;
    case 'start': startSession(tplById(d.tpl)); break;
    case 'toggle-surf': { const t = today(); S.surfDays = S.surfDays.includes(t) ? S.surfDays.filter(x => x !== t) : [...S.surfDays, t]; save(); render(); break; }
    case 'log-weight': { const kg = parseFloat(document.getElementById('wq').value); const date = document.getElementById('wd')?.value || today();
      if (!kg) return; S.weights = S.weights.filter(w => w.date !== date); S.weights.push({ date, kg }); S.weights.sort((x, y) => x.date < y.date ? -1 : 1); save(); render(); break; }
    case 'del-weight': S.weights = S.weights.filter(w => w.date !== d.date); save(); render(); break;
    case 'done': { const en = S.active.entries[+d.entry], st = en.sets[+d.set]; st.done = !st.done;
      if (st.done) { const lastSet = en.sets.every(s => s.done); if (lastSet) S.active.cur = Math.min(S.active.entries.length - 1, +d.entry + 1);
        const label = nextUpLabel(+d.entry); if (label) startTimer(en.rest, label); else stopTimer(); } save(); render(); break; }
    case 'add-set': { const en = S.active.entries[+d.entry]; const l = en.sets[en.sets.length - 1]; en.sets.push({ w: l?.w ?? null, r: l?.r ?? null, done: false }); save(); render(); break; }
    case 'skip-ex': { const en = S.active.entries[+d.entry]; const all = en.sets.every(s => s.done); en.sets.forEach(s => s.done = !all); if (!all) S.active.cur = Math.min(S.active.entries.length - 1, +d.entry + 1); save(); render(); break; }
    case 'cues': b.closest('.ex').classList.toggle('open'); break;
    case 'feel': { const en = S.active.entries[+d.entry]; en.feel = en.feel === d.feel ? null : d.feel; save(); render(); break; }
    case 'swap-live': replaceLive(+d.entry, false); break;
    case 'ban-live': replaceLive(+d.entry, true); break;
    case 'ban': { const t = tplById(d.tpl); const ex = pickExercise(t, +d.slot); if (!ex) break;
      if (!banExercise(ex, t.slots[+d.slot].pattern)) break; save(); render(); break; }
    case 'add-custom': { const g = id => document.getElementById(id); const name = g('c-name').value.trim(); if (!name) { toast('Give it a name first.'); break; }
      const unit = g('c-unit').value; const base = 'c-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let id = base; for (let n = 2; exById(id); n++) id = `${base}-${n}`;
      S.customExercises.push({ id, name, pattern: g('c-pattern').value, equipment: g('c-equip').value.trim() || '—', unit, step: unit === 'kg' ? Math.abs(parseFloat(g('c-step').value)) || 2.5 : 0, status: 'ok', cues: g('c-cues').value.trim() });
      syncCustom(); save(); render(); toast(`${name} added, rated "ok".`); break; }
    case 'del-custom': { const ex = exById(d.id); if (!ex) break;
      if (S.active?.entries.some(e => e.exerciseId === d.id)) { toast(`${ex.name} is in the session in progress. Finish or discard it first.`); break; }
      if (!confirm(`Remove ${ex.name} from the library? Past sessions keep their logs.`)) break;
      S.customExercises = S.customExercises.filter(c => c.id !== d.id); delete S.exerciseStatus[d.id]; syncCustom(); save(); render(); break; }
    case 'zoom': { const ex = exById(d.id); if (!ex) break; const lb = document.getElementById('lightbox');
      lb.innerHTML = `<h3>${esc(ex.name)}</h3>${[0, 1].map(n => `<img src="img/${ex.id}-${n}.jpg" alt="">`).join('')}<p>${esc(ex.cues)}</p><p class="muted small">${esc(ex.equipment)} · tap anywhere to close</p>`;
      lb.classList.remove('hidden'); break; }
    case 'finish': S.active.notes = document.getElementById('notes').value; finishSession(); break;
    case 'discard': discardSession(); break;
    case 'timer-add': timer.end += 30000; timer.over = false; timerEl.classList.remove('over'); tickTimer(); schedulePush(); break;
    case 'timer-sub': timer.end -= 30000; tickTimer(); schedulePush(); break;
    case 'rest': { const en = S.active.entries[+d.entry]; en.rest = Math.min(300, Math.max(15, en.rest + +d.d)); S.restOverride[en.exerciseId] = en.rest; save(); render();
      toast(`Rest ${en.rest}s for ${exById(en.exerciseId).name}, kept for next time too.`); break; }
    case 'timer-stop': stopTimer(); break;
    case 'del-workout': if (confirm('Delete this session?')) { S.workouts = S.workouts.filter(w => w.id !== d.id); save(); render(); } break;
    case 'swap': swapExercise(tplById(d.tpl), +d.slot); render(); break;
    case 'set-next': S.nextIdx = +d.idx; save(); render(); break;
    case 'push-setup': pushSubscription(true).then(() => render()).catch(() => toast('Could not set up background alerts')); break;
    case 'save-settings': { const g = id => document.getElementById(id); S.settings = { ...S.settings, programStart: g('s-start').value || S.settings.programStart,
        blockDays: +g('s-block').value || 28, targetPer14: +g('s-min').value || 4, goalPer14: +g('s-goal').value || 6,
        targetWeight: parseFloat(g('s-target').value) || null, notify: g('s-notify').checked, vibrate: g('s-vibrate').checked }; save(); ensureNotifyPermission(); render(); toast('Saved'); break; }
    case 'export': { const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(blob);
      const l = document.createElement('a'); l.href = u; l.download = `gymgrog-${today()}.json`; l.click(); URL.revokeObjectURL(u); break; }
    case 'import': document.getElementById('imp').click(); break;
    case 'reset': if (confirm('Delete ALL data? Export first if unsure.')) { S = blank(); S.settings.programStart = today(); syncCustom(); save(); render(); } break;
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.action === 'status') { S.exerciseStatus[t.dataset.id] = t.value; save(); render(); }
  if (t.dataset.action === 'rot') { const ids = TEMPLATES.map(x => x.id).filter(id => id === t.dataset.id ? t.checked : rotation().some(r => r.id === id));
    if (!ids.length) { t.checked = true; toast('Keep at least one session in the rotation.'); return; } S.settings.rotation = ids; S.nextIdx = 0; save(); render(); }
  if (t.id === 'imp' && t.files[0]) { const r = new FileReader(); r.onload = () => { try { const s = JSON.parse(r.result); if (!s.workouts) throw 0; S = { ...blank(), ...s }; syncCustom(); save(); render(); alert('Imported'); } catch { alert('Not a GymGrog export'); } }; r.readAsText(t.files[0]); }
});
document.addEventListener('input', e => {
  const t = e.target; if (!t.dataset.field || !S.active) return;
  const st = S.active.entries[+t.dataset.entry].sets[+t.dataset.set];
  st[t.dataset.field] = t.value === '' ? null : parseFloat(t.value); save();
});
// ---------- reorder exercises mid-session (machine taken? drag it lower) ----------
// Pointer events so it works with a finger on iPhone and with a mouse. While dragging, every card
// collapses to its title so the whole session fits on one screen and no auto-scroll is needed.
function moveEntry(from, to) {
  const a = S.active; if (!a || from === to) return;
  const [en] = a.entries.splice(from, 1); a.entries.splice(to, 0, en);
  const first = a.entries.findIndex(e => e.sets.some(s => !s.done)); a.cur = first < 0 ? a.entries.length - 1 : first;
  save(); render();
}
let drag = null;
// The drop position comes from where the dragged card itself is, not from the finger: collapsing the
// cards on pointerdown shifts the layout, so the finger's y means nothing until the card has been moved.
function dropIndex() {
  const r = drag.card.getBoundingClientRect(); const y = r.top + r.height / 2;
  const others = [...view.querySelectorAll('.ex')].filter(c => c !== drag.card);
  const k = others.findIndex(c => { const b = c.getBoundingClientRect(); return y < b.top + b.height / 2; });
  return k < 0 ? others.length : k;
}
view.addEventListener('pointerdown', e => {
  const g = e.target.closest('.grip'); if (!g || !S.active || drag || e.button !== 0) return;
  e.preventDefault(); const card = g.closest('.ex');
  document.body.classList.add('reordering'); card.classList.add('dragging');
  // Collapsing moved the card away from the finger: scroll it back, then nudge it the rest of the way.
  let r = card.getBoundingClientRect(); window.scrollBy(0, r.top + r.height / 2 - e.clientY);
  r = card.getBoundingClientRect(); const off = e.clientY - (r.top + r.height / 2);
  drag = { card, from: +card.dataset.entry, y0: e.clientY, off, id: e.pointerId, moved: false };
  card.style.transform = `translateY(${off}px)`;
  try { g.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  markDrop();
});
function markDrop() {
  const cards = [...view.querySelectorAll('.ex')]; cards.forEach(c => c.classList.remove('drop-before', 'drop-after'));
  const others = cards.filter(c => c !== drag.card); const k = dropIndex();
  if (!others.length) return;
  if (k < others.length) others[k].classList.add('drop-before'); else others[others.length - 1].classList.add('drop-after');
}
document.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return; e.preventDefault();
  const dy = e.clientY - drag.y0; if (Math.abs(dy) > 8) drag.moved = true;
  drag.card.style.transform = `translateY(${drag.off + dy}px)`; markDrop();
});
// A tap on the handle (no real movement) changes nothing; only a drag that ended somewhere else reorders.
function endDrag(e, apply) {
  if (!drag || e.pointerId !== drag.id) return;
  const to = apply && drag.moved ? dropIndex() : drag.from;
  document.body.classList.remove('reordering'); drag.card.classList.remove('dragging'); drag.card.style.transform = '';
  view.querySelectorAll('.ex').forEach(c => c.classList.remove('drop-before', 'drop-after'));
  const from = drag.from; drag = null;
  if (to !== from) moveEntry(from, to);
}
document.addEventListener('pointerup', e => endDrag(e, true));
document.addEventListener('pointercancel', e => endDrag(e, false));

document.getElementById('lightbox').addEventListener('click', e => e.currentTarget.classList.add('hidden'));
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'wq') document.querySelector('[data-action=log-weight]')?.click(); });
setInterval(() => { if (current === 'session' && S.active && document.activeElement?.tagName !== 'INPUT') { /* keep elapsed fresh without stealing focus */ const h = view.querySelector('h1 + .muted'); if (h) h.textContent = `${Math.floor((Date.now() - S.active.startedAt) / 60000)} min`; } }, 30000);

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
if (S.active) current = 'session';
render();
