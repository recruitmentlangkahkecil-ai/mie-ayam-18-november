/* =====================================================================
   app.js  -  mesin ponsel interaktif. Biasanya TIDAK perlu diedit.
   Isi cerita  -> data/story.js
   Pengaturan  -> data/config.js
   ===================================================================== */
(function () {
'use strict';
const ST = window.STORY, CF = window.CONFIG;
const $ = (s, r) => (r || document).querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
const IMG_EXT = ['jpg', 'jpeg', 'png', 'webp'], AUD_EXT = ['mp3', 'm4a', 'ogg', 'wav'];
const cache = {};

/* ---------- gambar & audio (nama tanpa ekstensi) ---------- */
function testImg(u) { return new Promise(r => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = u; }); }
async function resolveImg(base) {
  if (!base) return null;
  if (cache[base] !== undefined) return cache[base];
  const list = /\.\w{3,4}$/.test(base) ? [base] : IMG_EXT.map(e => base + '.' + e);
  for (const u of list) if (await testImg(u)) return (cache[base] = u);
  return (cache[base] = null);
}
function setImg(node, base, cb) {
  resolveImg(base).then(u => { if (!u) return; node.style.backgroundImage = 'url("' + u + '")'; node.classList.add('has'); if (node.classList.contains('av')) node.textContent = ''; cb && cb(u); });
}
function testAud(u) { return new Promise(r => { const a = new Audio(); a.preload = 'metadata'; a.oncanplaythrough = a.onloadedmetadata = () => r(true); a.onerror = () => r(false); a.src = u; setTimeout(() => r(false), 2500); }); }
async function resolveAud(base) {
  const k = 'a:' + base; if (cache[k] !== undefined) return cache[k];
  for (const e of AUD_EXT) { const u = base + '.' + e; if (await testAud(u)) return (cache[k] = u); }
  return (cache[k] = null);
}
const P = k => CF.people[k] || { name: k, chatName: k, color: '#8a8f98' };
function mkAv(base, size, label, color) {
  const a = el('div', 'av'); a.style.cssText = 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .42) + 'px;background-color:' + (color || '#555');
  a.textContent = (label || '?').trim().charAt(0).toUpperCase(); setImg(a, base); return a;
}
function personAv(k, size) { const p = P(k); return mkAv(p.avatar, size, p.name, p.color); }
function fmtClock(t) { const m = /^(\d+)[.:](\d+)/.exec(t || '00.00'); return m ? (+m[1]) + '.' + m[2] : t; }
function shortWhen(w) { return String(w || '').replace(/^\w+, /, ''); }

/* ---------- state ---------- */
const EDIT = /[?&]edit/.test(location.search);
const S = { time: CF.startTime, batt: ST.initialBattery, app: null, view: null, viewing: null, cur: null, pending: null,
  chats: {}, order: CF.chatOrder.slice(), notes: ST.notes.slice(), tweets: ST.tweets.filter(t => t.k === 'tweet'), day9Tweets: [], calls: [],
  badges: {}, ended: false, waView: null, ui: null, noteNew: {} };
Object.keys(ST.chats).forEach(id => {
  const h = ST.chats[id].history.map(x => Object.assign({}, x, { _src: x }));
  for (let i = 0; i < h.length; i++) if (h[i].k === 'narr' && /belum dibaca/.test(h[i].text))
    for (let j = i - 1; j >= 0 && h[j].k === 'msg' && h[j].from === 'me'; j--) h[j].single = true;
  S.chats[id] = { id, msgs: h, unread: 0, lastT: null, day9: false, day10: false };
  if (S.order.indexOf(id) < 0) S.order.push(id);
});
const isGroup = id => !!ST.chats[id].members;
function chatTitle(id) { return isGroup(id) ? ST.chats[id].title : P(id).chatName; }
function chatAvBase(id) { return isGroup(id) ? CF.groupAvatars[id] : P(id).avatar; }
function chatAv(id, size) { return isGroup(id) ? mkAv(chatAvBase(id), size, '👥', '#3a4a5c') : personAv(id, size); }
function groupSub(id) {
  const m = (ST.chats[id].members || '').replace(/\([^)]*\)/g, '').split(',').map(s => s.trim().replace(/\.$/, '')).filter(n => n && !/^Riku/.test(n));
  return 'Anda, ' + m.map(n => n.toLowerCase()).join(', ');
}
function preview(m) {
  if (!m) return '';
  if (m.type === 'photo') return '📷 Foto'; if (m.type === 'video') return '🎥 Video'; if (m.type === 'voice') return '🎤 Pesan suara ' + m.dur;
  return m.text || '';
}

/* ---------- layout ---------- */
const screen = $('#screen');
screen.style.setProperty('--photoRatio', CF.photoRatio); screen.style.setProperty('--galleryRatio', CF.galleryRatio);
const ICONS = {
  phone: '<div class="ico" style="background:#2fd158"><svg width="38" height="38" viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1z"/></svg></div>',
  safari: '<div class="ico" style="background:#fff"><svg width="52" height="52" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#1a73e8" stroke-width="1.5"/><path d="M16.5 7.5l-2.6 6.4-6.4 2.6 2.6-6.4z" fill="#ff3b30"/><path d="M16.5 7.5l-2.6 6.4-3.8-3.8z" fill="#1a73e8"/></svg></div>',
  whatsapp: '<div class="ico" style="background:#25d366"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-3.6-.9z"/><path d="M9 8.5c0 3 2.5 5.500 5.5 5.500l1-1.200-1.800-1-.8.6a3.500 3.500 0 01-1.600-1.600l.6-.8-1-1.800z" fill="#fff" stroke="none"/></svg></div>',
  notes: '<div class="ico" style="background:#fff"><div style="position:absolute;top:0;left:0;right:0;height:17px;background:#ffd60a"></div><div style="position:absolute;top:24px;left:8px;right:8px;height:1.500px;background:#ccc;box-shadow:0 8px #ccc,0 16px #ccc,0 24px #ccc"></div></div>',
  photos: '<div class="ico" style="background:#fff"><div style="width:40px;height:40px;border-radius:50%;background:conic-gradient(#ff3b30,#ff9f0a,#ffd60a,#30d158,#0a84ff,#bf5af2,#ff3b30);-webkit-mask:radial-gradient(circle,transparent 7px,#000 8px)"></div></div>',
  clock: '<div class="ico" style="background:#000"><svg width="58" height="58" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.500" fill="#fff"/><path d="M12 5v7l4 2.500" stroke="#000" stroke-width="1.600" fill="none" stroke-linecap="round"/><circle cx="12" cy="12" r="1" fill="#ff9f0a"/></svg></div>',
  x: '<div class="ico" style="background:#000"><svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><path d="M18.200 2h3.400l-7.400 8.500L23 22h-6.800l-5.300-7-6.100 7H1.400l7.900-9.100L1 2h7l4.800 6.400zm-1.200 18h1.900L7 3.900H5z"/></svg></div>',
  instagram: '<div class="ico" style="background:linear-gradient(45deg,#fdc468,#df4996 50%,#4f5bd5)"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.500" cy="6.500" r="1" fill="#fff" stroke="none"/></svg></div>',
  calendar: () => '<div class="ico" style="background:#fff;color:#000;flex-direction:column;line-height:1"><small style="color:#ff3b30;font-size:10px;font-weight:700;margin-top:4px">SEL</small><b style="font-size:34px;font-weight:300">11</b></div>'
};
function buildChrome() {
  screen.innerHTML = '';
  const home = el('div', 'layer bg def2'); home.id = 'home'; setImg(home, CF.images.wallpaper);
  home.innerHTML = '<div class="widgets"><div><div class="w weather"><div>' + esc(CF.weather.place) + ' ➤</div><div class="big">' + esc(CF.weather.temp) + '</div><div class="s">☁ ' + esc(CF.weather.cond) + '<br>' + esc(CF.weather.hi) + ' ' + esc(CF.weather.lo) + '</div></div><div class="wl">Cuaca</div></div><div><div class="w ph" id="wphoto"></div><div class="wl">Foto</div></div></div><div class="grid" id="grid"></div><div class="search-pill">🔍 Cari</div><div class="dock" id="dock"></div>';
  screen.appendChild(home);
  setImg($('#wphoto'), CF.images.widgetPhoto);
  const apps = [['calendar', 'Kalender'], ['photos', 'Foto'], ['notes', 'Catatan'], ['clock', 'Jam'], ['x', 'X'], ['instagram', 'Instagram']];
  apps.forEach(a => { const d = el('div', 'app'); d.dataset.id = a[0]; d.innerHTML = (typeof ICONS[a[0]] === 'function' ? ICONS[a[0]]() : ICONS[a[0]]) + '<span>' + a[1] + '</span>'; d.onclick = () => openApp(a[0]); $('#grid').appendChild(d); });
  [['phone'], ['safari'], ['whatsapp']].forEach(a => { const d = el('div', 'app'); d.dataset.id = a[0]; d.innerHTML = ICONS[a[0]]; d.onclick = () => openApp(a[0]); $('#dock').appendChild(d); });
  // lock
  const lock = el('div', 'layer bg def1'); lock.id = 'lock'; setImg(lock, CF.images.lockscreen);
  lock.innerHTML = '<div class="date">' + esc(CF.lockDateLabel) + '</div><div class="time" id="locktime"></div><div class="tools"><span>🔦</span><span>📷</span></div><div class="hint">Ketuk untuk membuka</div>';
  lock.onclick = () => $('#pass').classList.add('show');
  screen.appendChild(lock);
  const pass = el('div', 'layer'); pass.id = 'pass';
  let pad = ''; const letters = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
  for (let i = 1; i <= 9; i++) pad += '<button data-n="' + i + '">' + i + '<small>' + letters[i - 1] + '</small></button>';
  pad += '<button class="z" data-n="0">0</button>';
  pass.innerHTML = '<div class="t">Masukkan Kode Sandi</div><div class="dots" id="pdots"></div><div class="pad">' + pad + '</div><div class="bt"><span>Darurat</span><span id="pcancel">Batalkan</span></div>';
  screen.appendChild(pass);
  const sb = el('div', 'sb'); sb.innerHTML = '<span class="tm" id="sbtime"></span><span class="r"><span>✈</span><span>◔</span><span class="batt" id="sbbatt"><i></i><b></b></span></span>';
  screen.appendChild(sb);
  const hb = el('div', 'homebar'); hb.onclick = () => { if (S.app) goHome(); }; screen.appendChild(hb);
  const b = el('div'); b.id = 'banners'; screen.appendChild(b);
  const big = el('div'); big.id = 'big'; screen.appendChild(big);
  const call = el('div'); call.id = 'call'; screen.appendChild(call);
  const inc = el('div'); inc.id = 'incoming'; screen.appendChild(inc);
  const vw = el('div'); vw.id = 'viewer'; screen.appendChild(vw);
  const end = el('div'); end.id = 'end'; end.innerHTML = '<h2>TO BE CONTINUED...</h2><div style="opacity:.6;font-size:13px">layar mati sendiri untuk menghemat daya</div><button id="again">Mulai dari awal</button>'; screen.appendChild(end);
  $('#again').onclick = () => location.reload();
  const dots = $('#pdots'); for (let i = 0; i < CF.passcode.length; i++) dots.appendChild(el('i'));
  let entered = '';
  pass.querySelectorAll('.pad button').forEach(btn => btn.onclick = () => {
    entered += btn.dataset.n; dots.querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i < entered.length));
    if (entered.length >= CF.passcode.length) {
      if (entered === CF.passcode) { setTimeout(unlock, 180); }
      else { dots.classList.add('shake'); setTimeout(() => { dots.classList.remove('shake'); entered = ''; dots.querySelectorAll('i').forEach(d => d.classList.remove('on')); }, 450); }
    }
  });
  $('#pcancel').onclick = () => { $('#pass').classList.remove('show'); entered = ''; dots.querySelectorAll('i').forEach(d => d.classList.remove('on')); };
  paintBatt(); setTime(S.time);
}
function paintBatt() { const b = $('#sbbatt'); if (!b) return; b.querySelector('i').style.width = S.batt + '%'; b.querySelector('b').textContent = S.batt; b.classList.toggle('low', S.batt <= 20); }
function setBatt(v) { S.batt = v; paintBatt(); }
function setTime(t) { S.time = t; const a = $('#sbtime'), b = $('#locktime'); if (a) a.textContent = fmtClock(t); if (b) b.textContent = fmtClock(t); }
function paintBadges() {
  S.badges.whatsapp = Object.keys(S.chats).reduce((n, k) => n + S.chats[k].unread, 0);
  document.querySelectorAll('#home .app').forEach(a => {
    let b = a.querySelector('.badge'); const n = S.badges[a.dataset.id] || 0;
    if (!n) { b && b.remove(); return; }
    if (!b) { b = el('div', 'badge'); a.appendChild(b); } b.textContent = n;
  });
}
function unlock() {
  $('#pass').classList.remove('show');
  const lock = $('#lock'); lock.style.transition = 'transform .5s,opacity .5s'; lock.style.transform = 'translateY(-100%)'; lock.style.opacity = '0';
  setTimeout(() => lock.remove(), 600);
  const dbg = /[?&]debug=(\d+)/.exec(location.search);
  setTimeout(() => activateScene(dbg ? +dbg[1] : 0), 2000);
}

/* ---------- app manager ---------- */
const APPS = {};
function openApp(id, o) {
  o = o || {};
  if (S.app === id && S.view) { S.view.update && S.view.update(o); return; }
  if (S.app) leaveApp();
  const v = APPS[id](o); v.el.classList.add('appview'); screen.insertBefore(v.el, $('.sb'));
  requestAnimationFrame(() => requestAnimationFrame(() => v.el.classList.add('in')));
  S.app = id; S.view = v; v.afterAttach && v.afterAttach();
  if (id === 'x' && S.cur && S.cur.def.type === 'twitter') { S.cur.opened = true; S.badges.x = 0; paintBadges(); }
}
function leaveApp() {
  const v = S.view, id = S.app;
  v.onClose && v.onClose();
  S.app = null; S.view = null; S.viewing = null; S.ui = null; S.waView = null; v.el.classList.remove('in'); setTimeout(() => v.el.remove(), 320);
  if (id === 'x' && S.cur && S.cur.def.type === 'twitter' && S.cur.opened && !S.cur.done) finishScene(S.cur);
  paintBadges();
}
function goHome() { if (S.app) leaveApp(); }

/* ---------- banner notifikasi ---------- */
let bannerTimer = null;
function iconHTML(app) { return (typeof ICONS[app] === 'function' ? ICONS[app]() : ICONS[app]) || ICONS.notes; }
function showBanner(n) {
  const box = $('#banners'); box.innerHTML = clearTimeout(bannerTimer) || '';
  const b = el('div', 'banner');
  b.innerHTML = iconHTML(n.app) + '<div class="tx"><b>' + esc(n.title) + '</b><span>' + esc(n.body) + '</span></div><small>sekarang</small>';
  b.onclick = () => { b.classList.remove('in'); n.onTap && n.onTap(); };
  box.appendChild(b); requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add('in')));
  bannerTimer = setTimeout(() => { b.classList.remove('in'); setTimeout(() => b.remove(), 500); }, CF.bannerMs);
}
function notify(ctx, opt) {
  opt = opt || {}; const d = ctx.def; let n;
  if (d.type === 'chat') {
    const c = S.chats[d.chat]; if (S.viewing === d.chat) return;
    const last = c.msgs.slice().reverse().find(m => m.k === 'msg' && m.from !== 'me');
    const showLast = last && (c.unread > 0 || opt.reminder);
    n = { app: 'whatsapp', title: chatTitle(d.chat), body: showLast ? (isGroup(d.chat) ? P(last.from).name + ': ' : '') + preview(last) : 'Ketuk untuk membalas' };
  } else n = d.notif;
  showBanner({ app: n.app, title: n.title, body: n.body, onTap: () => openTarget(ctx) });
}
function openTarget(ctx) {
  const d = ctx.def;
  if (d.type === 'chat') openApp('whatsapp', { chat: d.chat });
  else if (d.type === 'note') openApp('notes', { open: d.note.no });
  else if (d.type === 'twitter') openApp('x');
  else if (d.type === 'call') $('#incoming').classList.contains('show') || ringCall(ctx);
}

/* ---------- WhatsApp ---------- */
APPS.whatsapp = function (o) {
  const root = el('div', 'wa'); const body = el('div', 'body'); root.appendChild(body);
  const view = { el: root };
  S.waView = view;
  const tabs = '<div class="bar"><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>Pembaruan</div><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.600 10.800a15 15 0 006.600 6.600l2.200-2.200 4 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.500l1 4z"/></svg>Panggilan</div><div><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2 19c0-3 3-5 6-5s6 2 6 5zM14 14c3 0 8 1 8 5h-6z"/></svg>Komunitas</div><div class="on"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v12H8l-4 4z"/></svg>Chat</div><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>Pengaturan</div></div>';

  function list() {
    S.viewing = null; S.ui = null; body.innerHTML = '';
    body.appendChild(el('div', 'topic', '<span>👥</span><span>✎</span>'));
    body.appendChild(el('div', 'ct', 'Chat'));
    const sc = el('div', 'scroll'); body.appendChild(sc);
    S.order.forEach(id => {
      const c = S.chats[id]; const last = c.msgs.slice().reverse().find(m => m.k === 'msg');
      const lastDate = c.msgs.slice().reverse().find(m => m.k === 'date');
      const row = el('div', 'crow'); row.appendChild(chatAv(id, 52));
      const m = el('div', 'm');
      const when = c.day9 ? fmtClock(c.lastT) : (lastDate ? lastDate.label.replace(/ \(.*\)/, '').split(',')[0].slice(0, 5) : '');
      let pv = last ? preview(last) : ''; if (isGroup(id) && last && last.from !== 'me') pv = P(last.from).name + ': ' + pv; else if (last && last.from === 'me') pv = 'Anda: ' + pv;
      m.innerHTML = '<div class="l1"><span>' + esc(chatTitle(id)) + '</span><span>' + esc(when) + '</span></div><div class="l2"><span>' + esc(pv) + '</span>' + (c.unread ? '<span class="un">' + c.unread + '</span>' : '') + '</div>';
      row.appendChild(m); row.onclick = () => chat(id); sc.appendChild(row);
    });
    body.insertAdjacentHTML('beforeend', tabs);
  }

  function bubble(c, it, idx) {
    if (it.k === 'date') return el('div', 'sep', esc(it.label));
    if (it.k === 'narr') return el('div', 'sys', esc(it.text));
    if (it.k !== 'msg') return null;
    const mine = it.from === 'me', prev = c.msgs[idx - 1];
    const b = el('div', 'b ' + (mine ? 'out' : 'in') + (it.type ? ' media' : ''));
    if (!mine && isGroup(c.id) && !(prev && prev.k === 'msg' && prev.from === it.from)) {
      const n = el('div', 'nmx', esc(P(it.from).name.toLowerCase())); n.style.color = P(it.from).color; b.appendChild(n);
    }
    const tick = mine ? '<span class="tick' + (it.single ? ' one' : '') + '">' + (it.single ? '✓' : '✓✓') + '</span>' : '';
    const tm = '<span class="tm">' + esc(fmtClock(it.t)) + tick + '</span>';
    if (it.type === 'photo' || it.type === 'video') {
      const w = el('div', 'mph'); const ph = el('div', 'ph', esc(it.desc)); w.appendChild(ph); setImg(ph, 'assets/photos/' + it.id);
      if (it.type === 'video') w.appendChild(el('div', 'play', '▶'));
      w.onclick = () => openViewer('assets/photos/' + it.id, it.desc, fmtClock(it.t) + (it.dur ? ' · video ' + it.dur : ''));
      b.appendChild(w); b.insertAdjacentHTML('beforeend', tm);
    } else if (it.type === 'voice') {
      b.appendChild(voiceNode(it)); b.insertAdjacentHTML('beforeend', tm);
    } else {
      b.insertAdjacentHTML('beforeend', esc(it.text) + tm);
      if (EDIT) { b.style.cursor = 'pointer'; b.onclick = () => { const v = prompt('Edit pesan:', it.text); if (v != null) { it.text = v; if (it._src) it._src.text = v; chat(c.id); } }; }
    }
    return b;
  }
  function voiceNode(it) {
    const d = el('div', 'vn'); const pb = el('div', 'pb', '▶'); const wf = el('div', 'wf'); const du = el('small', '', esc(it.dur));
    let seed = 0; for (const ch of it.id) seed = (seed * 31 + ch.charCodeAt(0)) % 997;
    const bars = []; for (let i = 0; i < 28; i++) { seed = (seed * 73 + 41) % 997; const i2 = el('i'); i2.style.height = (6 + (seed % 20)) + 'px'; wf.appendChild(i2); bars.push(i2); }
    d.append(pb, wf, du);
    const parts = it.dur.split(':'); const total = (+parts[0]) * 60 + (+parts[1]);
    let audio = null, timer = null, playing = false;
    function stop() { playing = false; pb.textContent = '▶'; clearInterval(timer); bars.forEach(x => x.classList.remove('d')); du.textContent = it.dur; if (audio) { audio.pause(); audio.currentTime = 0; } }
    pb.onclick = async () => {
      if (playing) return stop();
      playing = true; pb.textContent = '❚❚';
      const u = await resolveAud('assets/audio/' + it.id);
      let t0 = Date.now(), dur = total;
      if (u) { audio = audio || new Audio(u); audio.onended = stop; audio.play().catch(() => {}); audio.onloadedmetadata = () => { if (isFinite(audio.duration)) dur = audio.duration; }; }
      timer = setInterval(() => {
        const el_ = u && audio ? audio.currentTime : (Date.now() - t0) / 1000; const f = Math.min(1, el_ / (u && audio && isFinite(audio.duration) ? audio.duration : dur));
        bars.forEach((x, i) => x.classList.toggle('d', i / bars.length < f)); du.textContent = Math.floor(el_ / 60) + ':' + String(Math.floor(el_ % 60)).padStart(2, '0');
        if (!u && el_ >= dur) stop();
      }, 200);
    };
    return d;
  }

  function chat(id) {
    const c = S.chats[id]; c.unread = 0; S.viewing = id; body.innerHTML = '';
    const head = el('div', 'chead'); head.style.paddingTop = '2px';
    const bk = el('div', 'back', '‹ <span style="font-size:15px">' + (Object.keys(S.chats).reduce((n, k) => n + S.chats[k].unread, 0) || '') + '</span>');
    bk.onclick = e => { e.stopPropagation(); closeChat(); };
    const nm = el('div', 'nm'); const nmt = el('span', '', esc(chatTitle(id))); const sub = el('small', '', isGroup(id) ? esc(groupSub(id)) : 'online'); nm.append(nmt, sub);
    head.append(bk, chatAv(id, 36), nm, el('span', '', '📹'), el('span', '', '📞'));
    body.appendChild(head);
    const msgs = el('div', 'msgs pat'); body.appendChild(msgs); setImg(msgs, CF.images.chatBg, () => msgs.classList.remove('pat'));
    c.msgs.forEach((it, i) => { const b = bubble(c, it, i); b && msgs.appendChild(b); });
    msgs.scrollTop = msgs.scrollHeight;
    const comp = el('div', 'comp'); const inp = el('div', 'in'); const act = el('span', '', '📷  🎤');
    const plus = el('span', '', '＋'); plus.style.fontSize = '24px';
    comp.append(plus, inp, act); body.appendChild(comp);
    const kb = buildKeyboard(); body.appendChild(kb);
    let typed = false, typing = false, pos = 0, free = '';
    const pendText = () => { const p = S.pending; return p && p.chat === id ? (p.item.text || ('[' + (p.item.type || 'media') + '] ' + (p.item.desc || ''))) : null; };
    const setAct = () => { const on = typed || free.trim(); act.innerHTML = on ? '<span class="send">➤</span>' : '📷  🎤'; act.onclick = on ? doSend : null; };
    const doSend = () => { if (typed) sendPending(); else if (free.trim()) { const it = { k: 'msg', t: S.time, from: 'me', text: free.trim(), free: true }; free = ''; inp.innerHTML = ''; setAct(); addItem(id, it); } };
    const ui = S.ui = {
      id, msgs, kb, inp,
      append(it) { const b = bubble(c, it, c.msgs.length - 1); if (b) { msgs.appendChild(b); msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' }); } },
      setTyping(who) { sub.className = who ? 'ty' : ''; sub.textContent = who ? (isGroup(id) ? P(who).name.toLowerCase() + ' sedang mengetik…' : 'sedang mengetik…') : (isGroup(id) ? groupSub(id) : 'online'); },
      refresh() { const mine = pendText() !== null; inp.classList.toggle('hot', mine && !typed && !typing && !kb.classList.contains('show')); inp.dataset.ph = mine && !typed ? 'ketuk keyboard untuk mengetik…' : ''; if (mine && !typed && !typing && !pos) inp.innerHTML = ''; },
      clear() { typed = false; typing = false; pos = 0; free = ''; inp.innerHTML = ''; inp.classList.remove('hot'); inp.dataset.ph = ''; setAct(); kb.classList.remove('show'); },
      press(ch) {
        if (typing) return;
        if (ch.length === 1) flashKey(kb, ch);
        if (ch === '\n') return doSend();
        const t = pendText();
        if (t !== null) {
          if (typed || ch === '\b') return;
          pos = Math.min(t.length, pos + 3); inp.innerHTML = esc(t.slice(0, pos)) + '<span class="cur"></span>';
          if (pos >= t.length) { typed = true; inp.innerHTML = esc(t); setAct(); }
          return;
        }
        if (ch === '\b') free = free.slice(0, -1); else free += ch;
        inp.innerHTML = free ? esc(free) + '<span class="cur"></span>' : ''; setAct();
      }
    };
    ui.refresh(); setAct();
    kb.onclick = e => { const k = e.target.closest('.k'); if (!k) return; const a = k.dataset.act; const ch = a === 'bs' ? '\b' : a === 'go' ? '\n' : k.dataset.k; if (ch != null) ui.press(ch); };
    inp.onclick = async () => {
      kb.classList.add('show'); inp.classList.remove('hot');
      const t = pendText();
      if (t === null || typing || typed || CF.typeMode !== 'auto') return;
      typing = true; let shown = ''; inp.innerHTML = '<span class="cur"></span>';
      for (const ch of t) {
        if (S.viewing !== id) { typing = false; return; }
        shown += ch; inp.innerHTML = esc(shown) + '<span class="cur"></span>'; flashKey(kb, ch);
        await sleep(CF.typeSpeedMs + (ch === ' ' ? 10 : 0));
      }
      typing = false; typed = true; pos = t.length; inp.innerHTML = esc(shown); setAct();
    };
    onChatOpened(id);
  }
  function closeChat() { const id = S.viewing; if (S.ui) S.ui.kb.classList.remove('show'); list(); afterChatClosed(id); }
  view.chat = chat; view.list = list;
  view.onClose = () => { const id = S.viewing; if (id) afterChatClosed(id); };
  view.update = o2 => { if (o2.chat && S.viewing !== o2.chat) chat(o2.chat); };
  view.afterAttach = () => { if (S.ui) S.ui.msgs.scrollTop = S.ui.msgs.scrollHeight; };
  if (o.chat) chat(o.chat); else list();
  return view;
};
function buildKeyboard() {
  const kb = el('div', 'kb');
  ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].forEach((r, i) => {
    const row = el('div', 'row'); if (i === 2) row.appendChild(el('div', 'k fn', '⇧'));
    r.split('').forEach(ch => { const k = el('div', 'k', ch); k.dataset.k = ch; row.appendChild(k); });
    if (i === 2) { const bs = el('div', 'k fn', '⌫'); bs.dataset.act = 'bs'; row.appendChild(bs); } kb.appendChild(row);
  });
  const r = el('div', 'row'); r.append(el('div', 'k fn', '123'), Object.assign(el('div', 'k sp', ' '), { }), el('div', 'k go', 'kirim'));
  r.children[1].dataset.k = ' '; r.children[2].dataset.act = 'go'; kb.appendChild(r); return kb;
}
function flashKey(kb, ch) {
  const k = kb.querySelector('[data-k="' + ch.toLowerCase().replace(/"/g, '\\"') + '"]'); if (!k) return;
  k.classList.add('hit'); setTimeout(() => k.classList.remove('hit'), 90);
}
function afterChatClosed(id) {
  const ctx = S.cur;
  if (ctx && !ctx.done && ctx.def.type === 'chat' && ctx.started && S.pending && S.pending.ctx === ctx) setTimeout(() => { if (S.cur === ctx && !ctx.done && S.viewing !== ctx.curChat) notify(ctx, { reminder: true }); }, 2200);
  else if (ctx && !ctx.done && ctx.def.type === 'chat' && ctx.started && ctx.ptr < ctx.def.items.length) setTimeout(() => { if (S.cur === ctx && !ctx.done && S.viewing !== ctx.curChat) notify(ctx, { reminder: true }); }, 2200);
}

/* ---------- mesin scene ---------- */
function activateScene(i) {
  const sc = ST.scenes[i]; if (!sc) return;
  const ctx = { i, def: sc, ptr: 0, done: false, started: false, curChat: sc.chat, running: false, opened: false };
  S.cur = ctx; setTime(sc.t);
  if (sc.type === 'chat') {
    if (S.viewing === sc.chat) { ctx.started = true; runLive(ctx); }
    else { runSilent(ctx); notify(ctx); }
  } else if (sc.type === 'note') {
    S.notes.push(sc.note); S.noteNew[sc.note.no] = true; S.badges.notes = 1; paintBadges(); notify(ctx);
    if (S.app === 'notes' && S.view.refresh) S.view.refresh();
  } else if (sc.type === 'twitter') {
    S.day9Tweets = S.day9Tweets.concat(sc.items); S.badges.x = 1; paintBadges(); notify(ctx);
    if (S.app === 'x') { S.view.refresh(); ctx.opened = true; }
  } else if (sc.type === 'call') { ringCall(ctx); }
  paintBadges();
}
function setPending(ctx, it) { S.pending = { ctx, chat: ctx.curChat, item: it }; if (S.ui && S.ui.id === ctx.curChat) S.ui.refresh(); }
function addItem(chatId, it, live) {
  const c = S.chats[chatId];
  const push = x => { c.msgs.push(x); if (S.viewing === chatId && S.ui) S.ui.append(x); };
  if (it.k === 'msg') {
    if (!c.day9) { c.day9 = true; push({ k: 'date', label: 'Selasa, 11 November' }); }
    if (c.lastT && it.t < c.lastT && !c.day10) { c.day10 = true; push({ k: 'date', label: 'Rabu, 12 November' }); }
    c.lastT = it.t; setTime(it.t);
    if (it.from !== 'me') { S.order = [chatId].concat(S.order.filter(x => x !== chatId)); }
  }
  push(it);
  if (it.k === 'msg' && it.from !== 'me' && S.viewing !== chatId) c.unread++;
  if (S.waView && !S.viewing) S.waView.list();
  paintBadges();
}
function runSilent(ctx) {
  const items = ctx.def.items;
  while (ctx.ptr < items.length) {
    const it = items[ctx.ptr];
    if (it.k === 'msg' && it.from === 'me') { setPending(ctx, it); return; }
    if (it.k === 'big' || it.k === 'end' || it.k === 'switch') return;
    if (it.k === 'msg' || it.k === 'narr') addItem(ctx.curChat, it);
    else if (it.k === 'battery') setBatt(it.v);
    ctx.ptr++;
  }
}
async function runLive(ctx) {
  if (ctx.running || ctx.done) return; ctx.running = true;
  const items = ctx.def.items;
  while (ctx.ptr < items.length) {
    const it = items[ctx.ptr];
    if (it.k === 'msg' && it.from === 'me') { setPending(ctx, it); ctx.running = false; return; }
    if (S.viewing !== ctx.curChat && it.k !== 'end') { ctx.running = false; return; }
    if (it.k === 'msg') {
      S.ui && S.ui.setTyping(it.from); await sleep(Math.min(2600, CF.replyDelayMs + (it.text || '').length * 16)); S.ui && S.ui.setTyping(null);
      addItem(ctx.curChat, it, true);
    } else if (it.k === 'narr') { addItem(ctx.curChat, it, true); await sleep(1700); }
    else if (it.k === 'battery') setBatt(it.v);
    else if (it.k === 'typing') { S.ui && S.ui.setTyping(it.who.toLowerCase()); await sleep(3200); S.ui && S.ui.setTyping(null); }
    else if (it.k === 'big') { showBig(it.text); await sleep(2600); hideBig(); }
    else if (it.k === 'switch') { await sleep(1200); ctx.curChat = it.chat; S.waView && S.waView.chat(it.chat); }
    else if (it.k === 'end') { ctx.ptr = items.length; ctx.running = false; ctx.done = true; await sleep(3500); return endStory(); }
    ctx.ptr++;
    if (ctx.ptr < items.length && items[ctx.ptr].k === 'msg' && items[ctx.ptr].from !== 'me') await sleep(250);
  }
  ctx.running = false; finishScene(ctx);
}
function onChatOpened(id) {
  const ctx = S.cur; if (!ctx || ctx.done || ctx.def.type !== 'chat' || ctx.curChat !== id) return;
  ctx.started = true;
  if (S.pending && S.pending.ctx === ctx) { S.ui.refresh(); return; }
  if (ctx.ptr >= ctx.def.items.length) { finishScene(ctx); return; }
  runLive(ctx);
}
function sendPending() {
  const p = S.pending; if (!p) return; S.pending = null;
  const ui = S.ui; ui && ui.clear(); addItem(p.chat, Object.assign({}, p.item, { _src: p.item }));
  p.ctx.ptr++; runLive(p.ctx);
}
function finishScene(ctx) {
  if (ctx.done) return; ctx.done = true; S.pending = null;
  setTimeout(() => { if (!S.ended) activateScene(ctx.i + 1); }, 2800);
}
function showBig(t) { const b = $('#big'); b.innerHTML = esc(t) + '<small>🔔</small>'; b.classList.add('show'); }
function hideBig() { $('#big').classList.remove('show'); }
function endStory() { S.ended = true; $('#end').classList.add('show'); }

/* ---------- penampil foto ---------- */
function openViewer(base, desc, cap) {
  const v = $('#viewer'); v.innerHTML = '<button class="x">✕</button><div class="img">' + esc(desc) + '</div><div class="cap">' + esc(cap || '') + (cap && desc ? ' — ' : '') + esc(desc || '') + '</div>';
  v.classList.add('show'); v.querySelector('.x').onclick = () => v.classList.remove('show'); setImg(v.querySelector('.img'), base, () => v.querySelector('.img').textContent = '');
}

/* ---------- catatan ---------- */
APPS.notes = function (o) {
  const root = el('div', 'notes'); const body = el('div', 'body'); root.appendChild(body);
  const view = { el: root };
  function groupOf(n) { return n.no >= 13 ? 'Hari Ini' : (n.no >= 5 ? '7 Hari Sebelumnya' : '30 Hari Sebelumnya'); }
  function list() {
    body.innerHTML = '<div class="nhead"><span>‹ Folder</span><span>⋯</span></div><div class="ntitle">Catatan</div><div class="search">🔍 Cari</div>';
    const sc = el('div', 'scroll'); body.appendChild(sc);
    const groups = {}; S.notes.slice().sort((a, b) => b.no - a.no).forEach(n => (groups[groupOf(n)] = groups[groupOf(n)] || []).push(n));
    ['Hari Ini', '7 Hari Sebelumnya', '30 Hari Sebelumnya'].forEach(g => {
      if (!groups[g]) return; sc.appendChild(el('div', 'sec', g)); const box = el('div', 'group');
      groups[g].forEach(n => {
        const r = el('div', 'nrow' + (S.noteNew[n.no] ? ' new' : '')); r.innerHTML = '<b>catatan ' + n.no + '. ' + esc(n.title) + '</b><small>' + esc(n.date) + '  ' + esc((n.body[0] || '').slice(0, 60)) + '</small>';
        r.onclick = () => show(n); box.appendChild(r);
      }); sc.appendChild(box);
    });
    body.appendChild(el('div', 'nfoot', S.notes.length + ' Catatan'));
  }
  function show(n) {
    delete S.noteNew[n.no]; S.badges.notes = 0; paintBadges();
    body.innerHTML = '<div class="nhead"><span class="bk">‹ Catatan</span><span>⬆ ⋯</span></div>';
    body.firstChild.querySelector('.bk').onclick = () => { back(); };
    const sc = el('div', 'scroll'); const d = el('div', 'ndetail'); d.innerHTML = '<h1>catatan ' + n.no + '. ' + esc(n.title) + '</h1>' + n.body.map(p => '<p>' + esc(p) + '</p>').join(''); sc.appendChild(d); body.appendChild(sc);
    if (EDIT) d.querySelectorAll('p').forEach((pp, i) => { pp.style.cursor = 'pointer'; pp.onclick = () => { const v = prompt('Edit paragraf:', n.body[i]); if (v != null) { n.body[i] = v; pp.textContent = v; } }; });
    if (S.cur && S.cur.def.type === 'note' && S.cur.def.note.no === n.no) { S.cur.opened = true; view.cur = S.cur; }
  }
  function back() { list(); if (view.cur && view.cur.opened) { const c = view.cur; view.cur = null; finishScene(c); } }
  view.onClose = () => { if (view.cur && view.cur.opened) { const c = view.cur; view.cur = null; finishScene(c); } };
  view.refresh = () => { if (!body.querySelector('.ndetail')) list(); };
  view.update = o2 => { if (o2.open) { const n = S.notes.find(x => x.no === o2.open); n && show(n); } };
  if (o.open) { const n = S.notes.find(x => x.no === o.open); n ? show(n) : list(); } else list();
  return view;
};

/* ---------- X ---------- */
APPS.x = function () {
  const root = el('div', 'x'); const body = el('div', 'body'); root.appendChild(body);
  const view = { el: root };
  function tweetNode(t) {
    const a = CF.xAccounts[t.handle] || { name: t.handle, verified: false, avatar: '' };
    const d = el('div', 'tw'); d.appendChild(mkAv(a.avatar, 40, a.name, '#3b4252'));
    const r = el('div'); r.style.minWidth = 0;
    r.innerHTML = '<div class="h"><b>' + esc(a.name) + '</b> ' + (a.verified ? '<span class="vf">✔</span> ' : '') + '<span class="g">' + esc(t.handle) + (t.date ? ' · ' + esc(t.date.replace(/,.*/, '')) : '') + '</span></div><p>' + esc(t.text) + '</p><div class="ic"><span>💬</span><span>🔁</span><span>♡</span><span>📊</span><span>⬆</span></div>';
    d.appendChild(r); return d;
  }
  function paint() {
    body.innerHTML = ''; const top = el('div', 'xtop'); top.appendChild(mkAv(CF.xMyAvatar, 30, 'R', '#3b4252')); top.append(el('span', '', '𝕏'), el('span')); body.appendChild(top);
    body.appendChild(el('div', 'xtabs', '<span class="on">Untuk Anda</span><span>Mengikuti</span>'));
    const sc = el('div', 'scroll'); body.appendChild(sc);
    S.day9Tweets.forEach(t => { sc.appendChild(t.k === 'tweet' ? tweetNode(t) : t.k === 'narr' ? el('div', 'xn', esc(t.text)) : document.createComment('')); });
    S.tweets.slice().reverse().forEach(t => sc.appendChild(tweetNode(t)));
    body.appendChild(el('div', 'fab', '＋'));
    body.appendChild(el('div', 'bar', '<div class="on">🏠</div><div>🔍</div><div>▢</div><div>🔔</div><div>✉</div>'));
  }
  view.refresh = paint; paint(); return view;
};

/* ---------- Telepon & panggilan ---------- */
APPS.phone = function () {
  const root = el('div'); const body = el('div', 'body'); root.appendChild(body); const view = { el: root }; let tab = 'recent';
  const bar = () => '<div class="bar"><div data-t="fav">★<span>Favorit</span></div><div data-t="recent" class="' + (tab === 'recent' ? 'on' : '') + '">🕘<span>Terbaru</span></div><div data-t="contacts" class="' + (tab === 'contacts' ? 'on' : '') + '">👤<span>Kontak</span></div><div data-t="pad" class="' + (tab === 'pad' ? 'on' : '') + '">⌗<span>Keypad</span></div><div data-t="vm">⚭<span>Pesan Suara</span></div></div>';
  function paint() {
    body.innerHTML = '';
    if (tab === 'recent') {
      body.insertAdjacentHTML('beforeend', '<div class="nhead" style="color:#0a84ff"><span>Edit</span><span style="color:#fff;background:#333;border-radius:8px;padding:3px 12px;font-size:14px">Semua</span><span></span></div><div class="ntitle">Terbaru</div>');
      const sc = el('div', 'scroll'); body.appendChild(sc);
      S.calls.concat(ST.calls.slice().reverse()).forEach(c => {
        const r = el('div', 'recent'); r.appendChild(personAv(c.who, 40));
        const m = el('div', 'm', '<b>' + esc(c.whoLabel) + '</b><small>Audio WhatsApp · ' + esc(c.dur) + '</small>'); r.appendChild(m); r.appendChild(el('div', 'd', esc(shortWhen(c.when)) + ' ⓘ'));
        r.onclick = () => startCall({ who: c.who, whoLabel: c.whoLabel, lines: c.lines, dur: c.dur, replay: true }); sc.appendChild(r);
      });
    } else if (tab === 'contacts') {
      body.insertAdjacentHTML('beforeend', '<div class="ntitle" style="padding-top:20px">Kontak</div>'); const sc = el('div', 'scroll'); body.appendChild(sc);
      Object.keys(CF.people).filter(k => k !== 'me').forEach(k => { const r = el('div', 'recent'); r.appendChild(personAv(k, 40)); r.appendChild(el('div', 'm', '<b>' + esc(P(k).chatName) + '</b>')); sc.appendChild(r); });
    } else if (tab === 'pad') {
      const d = el('div', 'dialpad'); d.innerHTML = '<div class="dialnum" id="dn"></div>'; const pad = el('div', 'pad');
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].forEach(n => { const b = el('button', '', n); b.onclick = () => $('#dn').textContent += n; pad.appendChild(b); });
      const cb = el('button', 'call', '📞'); cb.onclick = () => { $('#dn').textContent = ''; }; pad.appendChild(cb); d.appendChild(pad); body.appendChild(d);
    } else { body.insertAdjacentHTML('beforeend', '<div style="margin:auto;color:#8e8e93">Tidak ada data</div>'); }
    body.insertAdjacentHTML('beforeend', bar());
    body.querySelectorAll('.bar div').forEach(d => d.onclick = () => { tab = d.dataset.t; paint(); });
  }
  paint(); return view;
};
function ringCall(ctx) {
  const d = ctx.def, inc = $('#incoming');
  inc.innerHTML = ''; inc.appendChild(personAv(d.who, 110)); inc.insertAdjacentHTML('beforeend', '<div class="nm">' + esc(d.whoLabel) + '</div><div class="sub">WhatsApp audio…</div><div class="acts"><div><button class="ring" id="dec" style="background:#ff3b30">✕</button>Tolak</div><div><button class="ring" id="acc" style="background:#30d158">📞</button>Terima</div></div>');
  inc.classList.add('show');
  $('#acc').onclick = () => { inc.classList.remove('show'); startCall({ who: d.who, whoLabel: d.whoLabel, lines: d.lines, intro: d.intro, dur: d.dur, ctx }); };
  $('#dec').onclick = () => { inc.classList.remove('show'); setTimeout(() => { if (S.cur === ctx && !ctx.done) ringCall(ctx); }, 3500); };
}
function startCall(o) {
  const box = $('#call'); box.innerHTML = ''; box.appendChild(personAv(o.who, 130));
  box.insertAdjacentHTML('beforeend', '<div class="nm">' + esc(o.whoLabel) + '</div><div class="tmr" id="ctmr">0:00</div><div class="tx" id="ctx"><div class="who"></div><div class="line"></div><div class="taphint">ketuk untuk lanjut</div></div><div class="opts"><div><span>🎙</span>bisukan</div><div><span>⌗</span>keypad</div><div><span>🔈</span>speaker</div></div><button class="end" id="cend">📞</button>');
  box.classList.add('show'); S.inCall = true;
  const t0 = Date.now(); const tm = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('#ctmr').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 500);
  const seq = []; if (o.intro) seq.push({ action: o.intro }); o.lines.forEach(l => seq.push(l));
  let idx = -1, ending = false; const who = $('#ctx .who'), line = $('#ctx .line');
  function show() {
    const l = seq[idx]; line.style.animation = 'none'; void line.offsetWidth; line.style.animation = '';
    if (l.action) { who.textContent = ''; line.className = 'line act'; line.textContent = l.action; }
    else { who.textContent = l.from === 'me' ? 'Riku' : P(l.from).name; line.className = 'line'; line.textContent = l.text; }
  }
  function next() { if (ending) return; idx++; if (idx >= seq.length) return end(); show(); }
  async function end() {
    if (ending) return; ending = true; clearInterval(tm); $('#ctmr').textContent = 'Panggilan berakhir · ' + o.dur; who.textContent = ''; line.className = 'line act'; line.textContent = '📞 Panggilan berakhir';
    await sleep(1400); box.classList.remove('show'); S.inCall = false;
    if (o.ctx && !o.replay) { S.calls.unshift({ who: o.who, whoLabel: o.whoLabel, dur: o.dur, when: 'Hari ini', lines: o.lines }); finishScene(o.ctx); }
  }
  $('#ctx').onclick = next; $('#cend').onclick = end; next();
}

/* ---------- Foto ---------- */
APPS.photos = function () {
  const root = el('div'); const body = el('div', 'body'); root.appendChild(body);
  body.innerHTML = '<div class="ptitle">Perpustakaan</div>'; const sc = el('div', 'scroll'); body.appendChild(sc); const g = el('div', 'pgrid'); sc.appendChild(g);
  ST.gallery.forEach(it => {
    const c = el('div', 'ph', esc(it.desc.slice(0, 60))); setImg(c, 'assets/photos/' + it.id);
    if (it.type === 'video') c.appendChild(el('span', 'dur', '▶ ' + (it.dur || '')));
    c.onclick = () => openViewer('assets/photos/' + it.id, it.desc, it.when); g.appendChild(c);
  });
  body.appendChild(el('div', 'bar', '<div class="on">🖼<span>Perpustakaan</span></div><div>♡<span>Untuk Anda</span></div><div>📁<span>Album</span></div><div>🔍<span>Cari</span></div>'));
  return { el: root };
};

/* ---------- Instagram ---------- */
APPS.instagram = function () {
  const root = el('div', 'ig'); const body = el('div', 'body'); root.appendChild(body);
  body.innerHTML = '<div class="igtop"><span style="font-style:normal">＋</span><span>Instagram</span><span style="font-style:normal">♡</span></div>';
  const handle = a => CF.igHandles[a] || a.toLowerCase().replace(/\s/g, '');
  const st = el('div', 'stories'); body.appendChild(st);
  const mine = el('div', 'story'); mine.append(mkAv(CF.xMyAvatar, 62, 'R', '#444'), el('span', '', 'Cerita Anda')); st.appendChild(mine);
  ST.instagram.filter(i => i.kind === 'story').forEach(i => {
    const s = el('div', 'story'); const ring = el('div', 'ring'); ring.appendChild(mkAv('assets/avatars/ig-' + handle(i.author), 56, i.author, '#444')); s.append(ring, el('span', '', esc(handle(i.author).slice(0, 10))));
    s.onclick = () => openViewer('assets/photos/' + i.id, i.desc, i.caption); st.appendChild(s);
  });
  const sc = el('div', 'scroll'); body.appendChild(sc);
  ST.instagram.filter(i => i.kind === 'post').forEach(i => {
    const p = el('div', 'post'); const hd = el('div', 'hd'); hd.appendChild(mkAv('assets/avatars/ig-' + handle(i.author), 32, i.author, '#444')); hd.append(el('span', '', esc(handle(i.author)))); p.appendChild(hd);
    const ph = el('div', 'ph', esc(i.desc)); setImg(ph, 'assets/photos/' + i.id); p.appendChild(ph);
    p.insertAdjacentHTML('beforeend', '<div class="cp">♡ 💬 ➤<br><b>' + esc(handle(i.author)) + '</b> ' + esc(i.caption.replace(/^Caption: /, '')) + '</div>'); sc.appendChild(p);
  });
  body.appendChild(el('div', 'bar', '<div class="on">🏠</div><div>▶</div><div>✈</div><div>🔍</div><div>👤</div>'));
  return { el: root };
};

/* ---------- Kalender ---------- */
APPS.calendar = function () {
  const root = el('div', 'cal'); const body = el('div', 'body'); root.appendChild(body);
  const MON = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'], ABR = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const YEAR = 2025; let m = 10, sel = 11;
  function paint() {
    body.innerHTML = '<div class="top"><span>‹ ' + YEAR + '</span><span>🔍 ＋</span></div><h1>' + MON[m] + '</h1><div class="wd"><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span><span>M</span></div>';
    const days = el('div', 'days'); body.appendChild(days);
    const first = new Date(YEAR, m, 1).getDay(), off = (first + 6) % 7, nd = new Date(YEAR, m + 1, 0).getDate();
    for (let i = 0; i < off; i++) days.appendChild(el('div'));
    for (let d = 1; d <= nd; d++) {
      const dow = (off + d - 1) % 7; const c = el('div', (dow >= 5 ? 'we ' : '') + (m === 10 && d === 11 ? 'today ' : '') + (d === sel ? 'sel ' : '') + (ST.calendar.some(e => e.day === d && e.mon === ABR[m]) ? 'hasev' : ''));
      c.innerHTML = '<span>' + d + '</span>'; c.onclick = () => { sel = d; paint(); }; days.appendChild(c);
    }
    const evs = el('div', 'evs'); const list = ST.calendar.filter(e => e.day === sel && e.mon === ABR[m]);
    if (!list.length) evs.appendChild(el('div', 'none', 'Tidak Ada Acara'));
    list.forEach(e => evs.appendChild(el('div', 'ev', '<b>' + esc(e.title) + '</b>' + (e.note ? '<small>' + esc(e.note) + '</small>' : ''))));
    body.appendChild(evs);
    const bar = el('div', 'bar', '<div style="color:#ff453a;opacity:1" data-a="p">‹ Sebelumnya</div><div style="color:#ff453a;opacity:1" data-a="t">Hari ini</div><div style="color:#ff453a;opacity:1" data-a="n">Berikutnya ›</div>');
    bar.onclick = ev => { const a = ev.target.closest('[data-a]'); if (!a) return; if (a.dataset.a === 'p') m = Math.max(9, m - 1); if (a.dataset.a === 'n') m = Math.min(11, m + 1); if (a.dataset.a === 't') { m = 10; sel = 11; } paint(); };
    body.appendChild(bar);
  }
  paint(); return { el: root };
};

/* ---------- Jam & Safari ---------- */
APPS.clock = function () {
  const root = el('div'); const body = el('div', 'body'); root.appendChild(body);
  body.innerHTML = '<div class="nhead" style="color:#ff9f0a"><span>Edit</span><b style="color:#fff">Alarm</b><span>＋</span></div>'; const sc = el('div', 'scroll'); body.appendChild(sc);
  CF.alarms.forEach(a => {
    const r = el('div', 'alr'); const [h, mi] = a.t.split('.'); const hh = +h;
    r.innerHTML = '<div><b>' + (hh % 12 || 12) + '.' + mi + '<small>' + (hh < 12 ? 'AM' : 'PM') + '</small></b><span>' + esc(a.label) + '</span></div><div class="tg ' + (a.on ? 'on' : '') + '"><i></i></div>';
    r.querySelector('.tg').onclick = e => e.currentTarget.classList.toggle('on'); sc.appendChild(r);
  });
  body.appendChild(el('div', 'bar', '<div>🌐<span>Jam Dunia</span></div><div class="on" style="color:#ff9f0a;opacity:1">⏰<span>Alarm</span></div><div>⏱<span>Stopwatch</span></div><div>⏲<span>Timer</span></div>'));
  return { el: root };
};
APPS.safari = function () {
  const root = el('div'); const body = el('div', 'body'); root.appendChild(body);
  body.innerHTML = '<div class="saf" style="flex:1;overflow:auto"><div class="rt"><span>Pencarian Terbaru</span><span>Kosongkan</span></div>' + CF.safariRecents.map(r => '<div class="it">🔍 ' + esc(r) + '</div>').join('') + '</div>';
  const f = el('div', 'comp'); f.innerHTML = '<div class="in" style="color:#8e8e93">Cari atau masukkan situs web</div>'; body.appendChild(f);
  return { el: root };
};

/* ---------- mulai ---------- */
document.addEventListener('keydown', e => {
  const ui = S.ui; if (!ui || e.ctrlKey || e.metaKey || e.altKey) return;
  const ch = e.key.length === 1 ? e.key : (e.key === 'Backspace' ? '\b' : (e.key === 'Enter' ? '\n' : null)); if (ch === null) return;
  e.preventDefault(); ui.kb.classList.add('show'); ui.press(ch);
});
if (EDIT) {
  const pn = el('div'); pn.style.cssText = 'position:fixed;top:12px;right:12px;z-index:999;background:#222;border:1px solid #555;border-radius:12px;padding:10px 14px;font-size:13px;max-width:230px;line-height:1.4';
  pn.innerHTML = '✏️ <b>Mode edit</b><br>Ketuk pesan atau paragraf catatan untuk mengubah teksnya.<br><button id="dlst" style="margin-top:8px;background:#2f95ff;border-radius:8px;padding:6px 10px">⬇ Unduh story.js</button>';
  document.body.appendChild(pn);
  $('#dlst').onclick = () => {
    const txt = '// story.js hasil mode edit\nwindow.STORY = ' + JSON.stringify(ST, (k, v) => k === '_src' ? undefined : v, 1) + ';\n';
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/javascript' })); a.download = 'story.js'; a.click();
  };
}
window.__PHONE = S; S.openTarget = openTarget;
buildChrome();
if (/[?&]debug=/.test(location.search)) { $('#pass').classList.remove('show'); unlock(); }
})();
