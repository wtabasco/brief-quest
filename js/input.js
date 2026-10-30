/* Teclado, cruceta táctil y panel de controles */
"use strict";
/* ================= ENTRADA ================= */
const H = [];
const pushH = fn => H.push(fn);
const popH = fn => { const i = H.lastIndexOf(fn); if (i >= 0) H.splice(i, 1); };
const dirStack = [];
const held = {b:false};
/* los botones de la consola llevan escrita la tecla que les corresponde: Z (A), X (B), Q (L) y E (R) */
const KEYMAP = {ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',
  Enter:'a',Space:'a',KeyZ:'a',KeyX:'b',Escape:'b',Backspace:'b',KeyM:'start',KeyN:'select',KeyQ:'l',KeyE:'r',KeyH:'help'};
const isDir = b => b==='up'||b==='down'||b==='left'||b==='right';
function syncSnd(){ const b = $('sndToggle'); if (b){ b.setAttribute('aria-pressed', String(!muted)); b.setAttribute('aria-label', muted ? 'Sonido apagado' : 'Sonido encendido'); } }
function toggleMute(){ muted = !muted; try { localStorage.setItem('briefquest.muted', muted ? '1' : '0'); } catch(e){} syncSnd(); toast(muted ? 'Sonido apagado' : 'Sonido encendido'); }
try { muted = localStorage.getItem('briefquest.muted') === '1'; } catch(e){}
syncSnd();
$('sndToggle') && $('sndToggle').addEventListener('click', e => { e.preventDefault(); unlockAudio(); toggleMute(); });
function press(btn){
  unlockAudio();
  if (btn === 'select'){ toggleMute(); return; }
  if (H.length){ H[H.length-1](btn); return; }
  if (G.mode === 'world') worldPress(btn);
}
function holdDir(b, on){ const i = dirStack.indexOf(b); if (i >= 0) dirStack.splice(i, 1); if (on) dirStack.push(b); }
function releaseAll(){ dirStack.length = 0; held.b = false; setPad(null); document.querySelectorAll('.on').forEach(e => e.classList.remove('on')); }
/* Tamaño de la pantalla en la compu: botones − y + (y las teclas - y +). En el celular no aparece. */
const ZOOM_MIN = .7, ZOOM_MAX = 1.8, ZOOM_STEP = .1;
const zoomOK = () => { try { return matchMedia('(pointer:fine)').matches; } catch(e){ return true; } };
let zoom = 1;
try { zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, parseFloat(localStorage.getItem('briefquest.zoom')) || 1)); } catch(e){}
function applyZoom(){
  document.documentElement.style.setProperty('--zoom', zoomOK() ? zoom.toFixed(2) : '1');
  const m = $('zoomOut'), p = $('zoomIn');
  if (m) m.disabled = zoom <= ZOOM_MIN + .001;
  if (p) p.disabled = zoom >= ZOOM_MAX - .001;
}
function setZoom(d){
  if (!zoomOK()) return;
  const z = Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + d)) * 10) / 10;
  if (z === zoom) return;
  zoom = z; try { localStorage.setItem('briefquest.zoom', String(zoom)); } catch(e){}
  applyZoom(); toast('Pantalla al ' + Math.round(zoom * 100) + '%');
}
function zoomKey(e){
  if (e.repeat) return false;
  if (e.key === '+' || e.code === 'NumpadAdd' || e.code === 'Equal'){ e.preventDefault(); setZoom(ZOOM_STEP); return true; }
  if (e.key === '-' || e.code === 'NumpadSubtract' || e.code === 'Minus'){ e.preventDefault(); setZoom(-ZOOM_STEP); return true; }
  return false;
}
applyZoom();
$('zoomOut') && $('zoomOut').addEventListener('click', e => { e.preventDefault(); setZoom(-ZOOM_STEP); });
$('zoomIn') && $('zoomIn').addEventListener('click', e => { e.preventDefault(); setZoom(ZOOM_STEP); });
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (zoomKey(e)) return;
  const b = KEYMAP[e.code]; if (!b) return;
  e.preventDefault();
  if (b === 'b') held.b = true;
  if (isDir(b)){ if (!e.repeat) holdDir(b, true); press(b); }
  else if (!e.repeat) press(b);
});
addEventListener('keyup', e => { const b = KEYMAP[e.code]; if (!b) return; if (isDir(b)) holdDir(b, false); if (b === 'b') held.b = false; });
addEventListener('blur', releaseAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

/* Cruceta: un solo control que sigue el dedo, así se puede deslizar entre direcciones */
const pad = document.getElementById('dpad');
let padDir = null, padId = null, padT1 = null, padT2 = null;
function setPad(d){
  if (d === padDir) return;
  if (padDir) holdDir(padDir, false);
  clearTimeout(padT1); clearInterval(padT2);
  padDir = d; pad.dataset.dir = d || '';
  if (d){
    holdDir(d, true); press(d);
    padT1 = setTimeout(() => { padT2 = setInterval(() => { if (H.length && padDir) press(padDir); }, 130); }, 340);
  }
}
function padFrom(e){
  const r = pad.getBoundingClientRect(), x = e.clientX - r.left - r.width/2, y = e.clientY - r.top - r.height/2;
  if (Math.hypot(x, y) < r.width * .1) return padDir;
  return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');
}
pad.addEventListener('pointerdown', e => { e.preventDefault(); unlockAudio(); padId = e.pointerId; try { pad.setPointerCapture(e.pointerId); } catch(_){} setPad(padFrom(e)); });
pad.addEventListener('pointermove', e => { if (e.pointerId === padId) setPad(padFrom(e)); });
const padUp = e => { if (e.pointerId !== padId) return; padId = null; setPad(null); };
pad.addEventListener('pointerup', padUp); pad.addEventListener('pointercancel', padUp); pad.addEventListener('lostpointercapture', padUp);
pad.addEventListener('contextmenu', e => e.preventDefault());

document.querySelectorAll('[data-btn]').forEach(el => {
  const b = el.dataset.btn;
  el.addEventListener('pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch(_){} el.classList.add('on'); if (b === 'b') held.b = true; press(b); });
  const up = () => { el.classList.remove('on'); if (b === 'b') held.b = false; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('click', e => e.preventDefault());
});

/* La cruceta y los botones están siempre a la vista (se tocan o se clickean; el teclado también anda).
   El botón CONTROLES despliega abajo la lista de teclas y cómo se juega. */
const drawer = $('drawer'), padToggle = $('padToggle'), ctrlInfo = $('ctrlInfo');
function setDrawer(open){
  drawer.classList.toggle('open', open); drawer.parentElement.classList.toggle('padOpen', open);
  if (!open) releaseAll();
}
setDrawer(true);
function setInfo(open){
  ctrlInfo.classList.toggle('open', open); padToggle.setAttribute('aria-expanded', String(open));
  try { localStorage.setItem('briefquest.keys', open ? '1' : '0'); } catch(e){}
}
(() => { let open = false; try { open = localStorage.getItem('briefquest.keys') === '1'; } catch(e){} setInfo(open); })();
padToggle.addEventListener('click', () => { setInfo(!ctrlInfo.classList.contains('open')); padToggle.blur(); });
/* en el celular, el pie del título habla de la cruceta y los botones, no del teclado */
try { if (matchMedia('(pointer: coarse)').matches){ const f = document.querySelector('.tFoot'); if (f) f.textContent = 'Cruceta para moverte · Z: aceptar · X: volver'; } } catch(e){}


/* Color de la consola: verde (el de siempre), violeta, celeste o rosa, y las mismas en versión glass (transparente, con los circuitos a la vista). El botoncito muestra el color que sigue. */
const SHELLS = [['verde', '#004612'], ['violeta', '#4b2154'], ['celeste', '#2a7fb0'], ['rosa', '#d97a9c'],
  ['verde-glass', 'rgba(15,106,53,.6)'], ['violeta-glass', 'rgba(96,44,140,.6)'], ['celeste-glass', 'rgba(31,120,173,.6)'], ['rosa-glass', 'rgba(205,104,146,.6)']];
const shellLabel = n => n.replace('-glass', ' glass');
let shellIx = 0;
try { shellIx = Math.max(0, SHELLS.findIndex(s => s[0] === localStorage.getItem('briefquest.shell'))); } catch(e){}
function applyShell(){
  const g = document.querySelector('.gba'); if (!g) return;
  if (shellIx) g.dataset.shell = SHELLS[shellIx][0]; else delete g.dataset.shell;
  const nx = SHELLS[(shellIx + 1) % SHELLS.length];
  document.querySelectorAll('.shellColor').forEach(b => { b.style.setProperty('--next', nx[1]); b.classList.toggle('glass', nx[0].endsWith('-glass')); b.title = 'Color de la consola: pasar a ' + shellLabel(nx[0]); });
}
applyShell();
document.querySelectorAll('.shellColor').forEach(b => b.addEventListener('click', e => {
  e.preventDefault(); shellIx = (shellIx + 1) % SHELLS.length;
  try { localStorage.setItem('briefquest.shell', SHELLS[shellIx][0]); } catch(_){}
  applyShell(); toast('Consola ' + shellLabel(SHELLS[shellIx][0]));
}));
