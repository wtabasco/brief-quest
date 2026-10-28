/* Movimiento, NPCs con vida, puertas, escalera, cámara y dibujo */
"use strict";
/* ================= MUNDO ================= */
const G = {mode:'title', x:16, y:22, dir:'up', move:null, stepN:0, busy:false, zone:null, t:0, pendA:false, trans:null};
const STEP_WALK = 165, STEP_RUN = 95;
const DV = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
const OPP = {up:'down', down:'up', left:'right', right:'left'};
const NPCS = [
  {id:'fede', map:'upstairs', x:6, y:2, dir:'down', look:'fede', talk:talkFede, wander:[2, 2, 9, 5], mood:'mate'},
  {id:'agus', map:'upstairs', x:14, y:4, dir:'right', look:'agus', talk:talkFounders, still:true, mood:'♥'},
  {id:'lia', map:'upstairs', x:20, y:4, dir:'left', look:'lia', talk:talkFounders, still:true, mood:'!'},
  {id:'sahi', map:'outside', x:4, y:8, dir:'down', look:'sahi', talk:talkSahi, still:true, mood:'pp', pingpong:true},
  {id:'lu', map:'office', x:5, y:20, dir:'down', look:'lu', talk:talkLu, wander:[2, 20, 8, 23], mood:'♪', sings:true},
  {id:'pimi', map:'office', x:29, y:12, dir:'down', look:'pimi', talk:talkPimi, wander:[26, 11, 31, 14], mood:'~'},
  {id:'reni', map:'office', x:11, y:8, dir:'down', look:'reni', talk:talkReni, mood:'*', termo:true},
  {id:'sofi', map:'upstairs', x:26, y:4, dir:'right', look:'sofi', talk:talkSofi, wander:[25, 2, 34, 6], mood:'fruta'},
  {id:'tato', map:'upstairs', x:31, y:3, dir:'left', look:'tato', talk:talkTato, still:true, mood:'♪'},
  // los specialists andan siempre juntos: Alejo se mueve por su rincón de La Base y Giuli lo sigue
  {id:'alejo', map:'office', x:22, y:13, dir:'up', look:'alejo', talk:talkDuo, wander:[19, 13, 23, 14], mood:'cam'},
  {id:'giuli', map:'office', x:21, y:13, dir:'up', look:'giuli', talk:talkDuo, still:true, follow:'alejo', mood:'lapiz'},
  // Marga limpia de 9 a 12 y va cambiando de lugar cada hora (con el trapeador y el balde)
  {id:'marga', map:'office', x:18, y:22, dir:'down', look:'marga', talk:talkMarga, wander:[17, 21, 19, 23], mood:'foto', mop:true},
  {id:'anual', map:'office', x:31, y:4, dir:'left', look:'anual', talk:talkAnual, still:true, mood:'#'},
  ...BOSS_ORDER.map(k => ({id:k, map:'office', x:BOSS_POS[k][0], y:BOSS_POS[k][1], dir:'down', look:k, talk:n => talkBoss(k, n), still:true, mood:'#'})),
];
NPCS.forEach(n => { n.home = n.dir; n.hx = n.x; n.hy = n.y; n.next = 1500 + Math.random()*4000; n.mv = null; n.emote = null; n.greet = -1e9; });
function placeReni(){
  const r = NPCS.find(n => n.id === 'reni'); let i = S ? S.reni : 0;
  // con lluvia Reni no graba en el patio: sigue de largo hasta el próximo lugar bajo techo
  while (S && rainy() && RENI_SPOTS[i % RENI_SPOTS.length][2] === 'outside') i++;
  const sp = RENI_SPOTS[i % RENI_SPOTS.length];
  r.map = sp[2] || 'office'; r.x = r.hx = sp[0]; r.y = r.hy = sp[1]; r.mv = null;
  r.wander = [sp[0] - 2, sp[1] - 1, sp[0] + 2, sp[1] + 1];
}
const npcHere = () => NPCS.filter(n => n.map === CURMAP.id && !n.away);
const npcAt = (x, y) => NPCS.find(n => n.map === CURMAP.id && !n.away && ((n.x === x && n.y === y) || (n.mv && n.mv.tx === x && n.mv.ty === y)));
const canWalk = (x, y) => WALK.has(tileAt(x, y)) && !npcAt(x, y);
/* la Sala del Directorio está cerrada hasta el nivel 25 (incluida su puerta) */
const vipLocked = (x, y) => CURMAP.id === 'office' && S && S.lvl < PROJECT_LVL && (((zoneAt(x, y) || {}).n === 'Sala del Directorio') || (y === 7 && (x === 23 || x === 24)));
const playerTile = () => G.move ? [G.move.tx, G.move.ty] : [G.x, G.y];
function emote(n, ch, ms = 1600){ n.emote = {ch, t0: G.t, ms}; }
function updateNPCs(dt){
  const [px, py] = playerTile();
  for (const n of npcHere()){
    if (n.mv){
      n.mv.t += dt;
      if (n.mv.t >= n.mv.dur){ n.x = n.mv.tx; n.y = n.mv.ty; n.mv = null; }
      continue;
    }
    if (G.busy) continue;
    const dist = Math.abs(n.x - px) + Math.abs(n.y - py);
    // la dupla: si quedó lejos de su compañero, lo alcanza
    if (n.follow && dist > 2 && G.t >= n.next){ const L = NPCS.find(o => o.id === n.follow); if (L && !L.away && L.map === n.map && Math.abs(L.x - n.x) + Math.abs(L.y - n.y) > 1){
      const opts = ['left', 'right', 'up', 'down'].filter(d => Math.abs(L.x - n.x - DV[d][0]) + Math.abs(L.y - n.y - DV[d][1]) < Math.abs(L.x - n.x) + Math.abs(L.y - n.y));
      for (const d of opts){ const tx = n.x + DV[d][0], ty = n.y + DV[d][1]; if (!WALK.has(tileAt(tx, ty)) || npcAt(tx, ty) || (tx === px && ty === py)) continue; n.dir = d; n.mv = {fx: n.x, fy: n.y, tx, ty, t: 0, dur: 300}; break; }
      n.next = G.t + 400; continue; } }
    // te mira cuando te acercás (los globitos aparecen solo cuando hablás con alguien)
    if (dist <= 2){
      const dx = px - n.x, dy = py - n.y;
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      n.next = G.t + 1200;
      continue;
    }
    if (G.t < n.next) continue;
    n.next = G.t + 1800 + Math.random()*4200;
    const r = Math.random();
    if (n.wander && r < .55){
      const opts = ['up','down','left','right'].sort(() => Math.random() - .5);
      // tiende a volver a su lugar cuando se aleja
      if (Math.abs(n.x - n.hx) + Math.abs(n.y - n.hy) > 2 && Math.random() < .6) opts.unshift(n.x < n.hx ? 'right' : n.x > n.hx ? 'left' : n.y < n.hy ? 'down' : 'up');
      for (const d of opts){
        const tx = n.x + DV[d][0], ty = n.y + DV[d][1], [w0, h0, w1, h1] = n.wander;
        if (tx < w0 || ty < h0 || tx > w1 || ty > h1) continue;
        if (!WALK.has(tileAt(tx, ty)) || npcAt(tx, ty) || (tx === px && ty === py) || (tx === G.x && ty === G.y)) continue;
        n.dir = d; n.mv = {fx: n.x, fy: n.y, tx, ty, t: 0, dur: 300};
        // quien lo sigue ocupa el lugar que deja
        for (const f of NPCS) if (f.follow === n.id && !f.mv && !f.away && f.map === n.map && Math.abs(f.x - n.x) + Math.abs(f.y - n.y) === 1 && Math.abs(f.x - px) + Math.abs(f.y - py) > 2){
          f.dir = n.x > f.x ? 'right' : n.x < f.x ? 'left' : n.y > f.y ? 'down' : 'up'; f.mv = {fx: f.x, fy: f.y, tx: n.x, ty: n.y, t: 60, dur: 330}; f.next = G.t + 1500; }
        break;
      }
    } else if (r < .8 && !n.still){
      n.dir = Math.random() < .5 ? n.home : ['down','left','right','up'][rnd(4)];
    } else n.dir = n.home;
  }
}
/* Reni lleva el termo bajo el brazo y el celu en la mano, listo para grabar */
/* el trapeador y el balde celeste de Marga */
function drawMop(c, X, Y, n){
  const left = n.dir === 'right', sx = left ? X - 2 : X + 28, by = Y + 22;
  for (let i = 0; i < 26; i++){ c.fillStyle = i % 2 ? '#a8743f' : '#c08a52'; c.fillRect(sx + Math.round(i * (left ? .12 : -.12)), Y - 8 + i, 2, 1); }
  c.fillStyle = '#e8e4da'; c.fillRect(sx - 4 + (left ? 3 : -3), Y + 17, 9, 4); c.fillStyle = '#cfcabe'; for (let k = 0; k < 4; k++) c.fillRect(sx - 4 + (left ? 3 : -3) + k * 2, Y + 21, 1, 3);
  const bx = left ? X - 12 : X + 34; c.fillStyle = '#4f9ad0'; c.fillRect(bx, by - 6, 10, 8); c.fillStyle = '#7fc0ea'; c.fillRect(bx, by - 6, 10, 2); c.fillStyle = '#2f6a98'; c.fillRect(bx, by + 1, 10, 1);
  c.fillStyle = '#2a2236'; c.fillRect(bx + 2, by - 9, 6, 1); c.fillRect(bx + 1, by - 8, 1, 2); c.fillRect(bx + 8, by - 8, 1, 2);
}
function drawTermo(c, X, Y, n){
  const d = n.dir; if (d === 'up') return;
  const tx = X + (d === 'right' ? 4 : d === 'left' ? 22 : 4), mx = X + (d === 'right' ? 24 : d === 'left' ? 4 : 25), y = Y + 2;
  c.fillStyle = '#2a2a2e'; c.fillRect(tx - 1, y - 2, 6, 3);
  c.fillStyle = '#b8bcc2'; c.fillRect(tx, y + 1, 4, 11); c.fillStyle = '#e2e5e8'; c.fillRect(tx, y + 1, 1, 11); c.fillStyle = '#8a8e94'; c.fillRect(tx + 3, y + 1, 1, 11);
  c.fillStyle = '#1e1f24'; c.fillRect(mx - 3, y + 3, 6, 10); c.fillStyle = '#7a8ab0'; c.fillRect(mx - 2, y + 4, 4, 7); c.fillStyle = '#a8b8dc'; c.fillRect(mx - 2, y + 4, 4, 2); c.fillStyle = '#e04848'; c.fillRect(mx + 1, y + 9, 1, 1);
}
function npcPos(n){ if (!n.mv) return [n.x*TS, n.y*TS]; const k = n.mv.t / n.mv.dur; return [(n.mv.fx + (n.mv.tx - n.mv.fx)*k)*TS, (n.mv.fy + (n.mv.ty - n.mv.fy)*k)*TS]; }
/* globitos de emoción dibujados a mano */
function drawEmote(c, X, Y, e){
  const k = clamp((G.t - e.t0) / 180, 0, 1), bob = Math.round(Math.sin((G.t - e.t0) / 140) * 1.5);
  const y = Y - 16 + bob - Math.round((1 - k) * 6);
  c.fillStyle = '#2a2236'; c.fillRect(X - 1, y - 1, 22, 18); c.fillRect(X + 1, y - 3, 18, 22);
  c.fillStyle = '#fbfaf4'; c.fillRect(X + 1, y + 1, 18, 14); c.fillRect(X + 3, y - 1, 14, 18);
  c.fillStyle = '#2a2236'; c.fillRect(X + 6, y + 17, 4, 2); c.fillStyle = '#fbfaf4'; c.fillRect(X + 7, y + 15, 2, 2);
  const P = (px, py, w, h, col) => { c.fillStyle = col; c.fillRect(X + px, y + py, w, h); };
  switch (e.ch){
    case '!': P(9, 2, 3, 8, '#e0452b'); P(9, 11, 3, 3, '#e0452b'); break;
    case '?': P(7, 2, 6, 2, '#703873'); P(12, 4, 2, 3, '#703873'); P(9, 7, 3, 2, '#703873'); P(9, 11, 3, 3, '#703873'); break;
    case '♪': P(11, 2, 2, 9, '#703873'); P(13, 2, 3, 2, '#703873'); P(7, 9, 5, 4, '#703873'); break;
    case '♥': P(5, 4, 4, 4, '#e0452b'); P(11, 4, 4, 4, '#e0452b'); P(5, 6, 10, 3, '#e0452b'); P(7, 9, 6, 2, '#e0452b'); P(9, 11, 2, 2, '#e0452b'); P(6, 5, 2, 1, '#ff9a9a'); break;
    case '~': P(4, 7, 3, 2, '#3d7fa8'); P(7, 5, 3, 2, '#3d7fa8'); P(10, 7, 3, 2, '#3d7fa8'); P(13, 5, 3, 2, '#3d7fa8'); P(4, 10, 12, 2, '#9ed3ec'); break;
    case 'fruta': P(6, 5, 9, 8, '#d8443a'); P(5, 6, 11, 6, '#d8443a'); P(7, 13, 7, 1, '#a8302a'); P(7, 6, 2, 2, '#f08a80'); P(10, 2, 1, 4, '#6a4a2a'); P(11, 2, 4, 2, '#5fae3a'); break;
    case '*': P(8, 3, 4, 10, '#f2c94c'); P(5, 6, 10, 4, '#f2c94c'); P(9, 6, 2, 4, '#ffffff'); break;
    case 'mate': P(12, 1, 3, 1, '#d9dde3'); P(13, 2, 1, 4, '#a9aeb8'); P(6, 5, 8, 1, '#5a3a1a'); P(7, 6, 6, 1, '#7fae3a');
      P(6, 7, 8, 6, '#8a5a2b'); P(5, 8, 10, 4, '#8a5a2b'); P(7, 13, 6, 1, '#6e4420'); P(7, 8, 1, 3, '#b98048'); break;
    case 'pp': P(4, 4, 8, 7, '#c9302c'); P(5, 3, 6, 1, '#c9302c'); P(5, 11, 6, 1, '#c9302c'); P(5, 5, 2, 2, '#e8615a'); P(7, 12, 2, 3, '#5a3a20'); P(13, 3, 3, 3, '#e98a2a'); break;
    case 'lluvia': P(4, 4, 12, 5, '#7f8fa6'); P(6, 2, 6, 2, '#7f8fa6'); P(5, 4, 5, 1, '#a9b6c8'); P(5, 10, 1, 3, '#3d7fa8'); P(9, 11, 1, 3, '#3d7fa8'); P(13, 10, 1, 3, '#3d7fa8'); break;
    case 'foto': P(3, 4, 14, 11, '#2a2236'); P(4, 5, 12, 9, '#fbfaf4'); P(5, 6, 10, 6, '#9ed3ec'); P(5, 10, 10, 2, '#7fae3a'); P(8, 8, 2, 3, '#e0a83a'); P(11, 8, 2, 3, '#e98a9a'); P(8, 7, 2, 1, '#6b4a2e'); P(11, 7, 2, 1, '#2a1f18'); break;
    case 'cam': P(3, 6, 14, 8, '#2a2236'); P(6, 4, 5, 2, '#2a2236'); P(8, 8, 5, 5, '#9ed3ec'); P(9, 9, 2, 2, '#ffffff'); P(14, 7, 2, 1, '#e0452b'); break;
    case 'lapiz': P(4, 12, 3, 3, '#e8c9a0'); P(5, 13, 1, 1, '#2a2236'); for (let i = 0; i < 8; i++) P(6 + i, 11 - i, 3, 3, '#e0a83a'); P(14, 2, 3, 3, '#e98a9a'); break;
    case '#': P(5, 4, 3, 3, '#e0452b'); P(12, 4, 3, 3, '#e0452b'); P(5, 10, 3, 3, '#e0452b'); P(12, 10, 3, 3, '#e0452b'); P(8, 7, 4, 2, '#e0452b'); break;
    default: P(4, 8, 3, 3, '#4e6653'); P(9, 8, 3, 3, '#4e6653'); P(14, 8, 3, 3, '#4e6653');
  }
}
/* notas musicales que suben mientras alguien canta (no son globitos de reacción) */
function drawNotes(c, X, Y, n){
  const chill = n && n.chill; // el parlante de Asteroide: notas lentas, en verde y amarillo (el reggae tranqui de Tato)
  for (let i = 0; i < 2; i++){
    const k = ((G.t / (chill ? 2900 : 1700)) + i * .5) % 1; if (k > .85) continue;
    const x = X + 8 + Math.round(Math.sin(k * 6.3 + i * 2) * 5) + i * 6, y = Y - Math.round(k * 22), col = chill ? (i ? '#e2b23a' : '#3f8a4a') : i ? '#7d4c7b' : '#d9772a';
    c.globalAlpha = k < .15 ? k / .15 : k > .65 ? (.85 - k) / .2 : 1;
    c.fillStyle = '#2a1f2a'; c.fillRect(x - 1, y + 3, 5, 4); c.fillRect(x + 2, y - 4, 3, 9);
    c.fillStyle = col; c.fillRect(x, y + 4, 3, 2); c.fillRect(x + 3, y - 3, 1, 8); c.fillRect(x + 3, y - 3, 3, 2);
    c.globalAlpha = 1;
  }
}
async function warp(mapId, x, y, dir){
  G.busy = true; G.pendA = false;
  await fade(true, false, 260);
  useMap(mapId); teleport(x, y, dir); G.zone = null; updatePresence(true);
  await fade(false, false, 260);
  G.busy = false; onStep(true); save();
}
function worldPress(btn){
  if (G.busy) return;
  if (btn === 'a'){ if (G.move) G.pendA = true; else interact(); return; }
  if (G.move) return;
  if (btn === 'start') pauseMenu();
  else if (btn === 'l') quickOpen('log');
  else if (btn === 'r') quickOpen('skills');
  else if (btn === 'help') helpScreen();
}
async function quickOpen(which){
  G.busy = true; const prev = CLOSE_BTN; CLOSE_BTN = which === 'log' ? 'l' : 'r';
  try { if (which === 'log') await logScreen(); else await skillsScreen(); } finally { CLOSE_BTN = prev; closePanel(); G.busy = false; }
}
/* cualquier escalón sirve: en el hall toda la escalera sube; arriba, todo el hueco baja */
function stairAt(t){ if (t === 'U') return 'up'; if (t === 'v') return 'down'; if (t === 'y') return CURMAP.id === 'office' ? 'up' : CURMAP.id === 'upstairs' ? 'down' : null; return null; }
function goDownstairs(){ SFX.sel(); warp('office', 14, 21, 'down'); }
async function climbStairs(){ SFX.sel(); warp('upstairs', 5, 9, 'right'); }
/* cosas del patio que se pueden mirar; desde la otra cabecera de la mesa se le habla a Sahi */
async function patioThing(ch, tx){
  if (ch === 'T'){
    const s = NPCS.find(n => n.id === 'sahi' && n.map === CURMAP.id);
    if (s && Math.abs(s.x - G.x) <= 1 && s.y < G.y){
      G.busy = true; s.dir = 'down'; emote(s, s.mood, 1500); await sleepMs(380);
      try { await s.talk(s); } finally { hideDlg(); closePanel(); s.emote = null; s.next = G.t + 2500; G.busy = false; noteTalk(s.id); save(); }
      return;
    }
  }
  G.busy = true;
  try {
    await say(pick('patio:' + ch + (ch === 'w' ? (tx >= 17 && tx <= 19 ? 'c' : 'm') : ''), {
      w: tx >= 17 && tx <= 19 ? ['El portal de la entrada: columnas grises, una caracola de yeso arriba y un portón de madera enorme. Al lado brilla el cartel verde de la agencia.', 'De noche el cartel verde se ve desde la esquina. Reni dice que es la mejor foto de la casa.'] : ['El muro blanco del frente. Unas lucecitas lo iluminan de arriba para abajo.', 'Del otro lado del muro pasa la vida de la calle: un perro, un bondi, alguien apurado.'],
      T: ['La mesa de ping pong. Tiene más horas de uso que la sala de reuniones.', 'La red roja ya vio de todo: torneos, revanchas y una final que todavía se discute.'],
      F: ['La fuente del jardín. Alguien tiró una moneda y pidió que el cliente apruebe a la primera.', 'El agua suena tranquila. Por un segundo te olvidás del deadline.', 'Flotan hojas amarillas. Es lo más zen de toda la agencia.'],
      q: ['El portón gris. Por acá entran los muebles grandes y salen las ideas grandes.', 'Está cerrado. Del otro lado se escucha la calle.'],
      V: ['La barbacoa: el quincho de vidrio bajo la pérgola. Adentro está la cocina, con la barra, el parrillero y el sillón verde. La puerta está en el medio.', 'Por el vidrio se ve la mesa larga y las butacas de la barra. Todavía huele al asado del viernes.'],
    }[ch]));
  } finally { hideDlg(); G.busy = false; }
}
/* cosas de la casa que se pueden mirar (biblioteca, hall, estudio y Guaná, la oficina de Agus y Lía) */
async function houseThing(ch, tx){
  G.busy = true;
  try {
    if (ch === 'J'){ await liaBoardLook(); return; }
    if (ch === 'N' && tx < 22 && S.flags.card){ await presentation('tv'); return; }
    if (ch === 'base14'){ await valuesLook(); return; }
    if (ch === 'H' && (zoneAt(tx, 2) || {}).n === 'Brasil'){ await statusBoardLook(); return; }
    if (ch === 'c'){ // la cafetera de Agus y Lía convida un café cada tanto
      const m = mem(), b = m.battles || 0;
      if (b - (m.capsAt ?? -99) >= 3){ m.capsAt = b; S.items.cafe = (S.items.cafe || 0) + 1; SFX.heal(); await say('La cafetera de cápsulas de Agus y Lía. Te servís un café cortito.'); await say('Recibiste un Café.'); }
      else await say(pick('house:cafe', ['La cafetera está calentando. Hay un cartel: "Una cápsula por persona. Firmado: RRHH".', 'Se terminaron las cápsulas de la semana. Hay que esperar.']));
      return;
    }
    const L = {
      M: ['La chimenea de la biblioteca. Arriba están los premios de la agencia: una pelota, una plaqueta y un par de trofeos.', 'Nadie prende la chimenea hace años. Ahora es el estante de los premios.'],
      N: ['La tele de la sala, en su soporte con ruedas, mirando a la mesa. Acá se proyectan las presentaciones... y algún partido, cuando nadie mira.', 'En la pantalla quedó una diapositiva con un gráfico de barras. Seguro es de Lía.'],
      B: ['Libros viejos de tapa dura, del piso al techo. Algunos tienen más años que la casa.', 'Hay una enciclopedia, tres diccionarios y un libro que dice "Cómo escribir un brief". Está sin abrir.', 'Entre los libros hay una taza olvidada. Alguien estuvo leyendo.'],
      Y: (zoneAt(tx, 2) || {}).n === 'Brasil' ? (tx < 4 ? ['Un afiche con una planta de ajíes en una lata violeta, sobre un mantel a rombos verdes. Fede dice que la planta es real y que la riega con el agua del mate que sobra.', 'La planta de ajíes del afiche. Tiene un ají a punto de caerse. Hace años que está a punto de caerse.'] : ['Un afiche naranja con un ají superhéroe de capa verde y antifaz, volando con el puño en alto. Dice: "TOO HOT TO HANDLE".', 'Fede jura que el ají del afiche está inspirado en él. Nadie se anima a discutírselo.']) : tx < 16 ? ['Un afiche con palta, salmón, palitos y un pescado violeta. Abajo dice: "No hacemos sushi".'] : ['Un afiche con dos luchadores de sumo peleando por un pescado. Dice: "En esta pelea ganará el más picante".'],
      f: ['Un ventilador de pie verde agua. En invierno nadie lo mira; en verano, hay fila para estar cerca.', 'El ventilador gira despacito. Mueve las hojas de los pendientes de un lado a otro.'],
      base11: ['El pizarrón grande de La Base, con la lista de eventos del mes en rojo y azul. Cada vez que alguien tacha uno, Lía lo anota en su tablero.', 'Al costado del pizarrón alguien dibujó una carita con anteojos. Nadie se hace cargo.'],
      base12: ['El pizarrón grande de La Base, con la lista de eventos del mes en rojo y azul. Cada vez que alguien tacha uno, Lía lo anota en su tablero.', 'Al costado del pizarrón alguien dibujó una carita con anteojos. Nadie se hace cargo.'],
      base14: ['Un tablero negro con agujeritos. Tiene pegada una hoja que dice "Nuestros valores": transparencia, aprendizaje, sentido de pertenencia, colaboración y actitud positiva.', 'Colgado del tablero hay un llavero del Mundial y un sticker verde que dice "Motivados".'],
      base18: ['Un pizarrón chico con la grilla del mes. Algunos días tienen una cruz roja; otros, un mate dibujado.'],
      base19: ['Un pizarrón chico con la grilla del mes. Algunos días tienen una cruz roja; otros, un mate dibujado.'],
      H: ['El pizarrón blanco de Fede: un ciclo dibujado con flechas, "probar, aprender, repetir". En la esquina hay un mate con humito.', 'Abajo, con letra chiquita: "Con mate se piensa mejor". Firmado: F.'],
      G: ['El fondo blanco del estudio. Acá Reni graba los videos del equipo con el celu.', 'Hay una marca de cinta en el piso que dice "PARATE ACÁ". Y otra más chica: "MIRÁ AL CELU".'],
      o: ['Una luz de estudio. Te encandila un poquito.'],
      q: ['El aro de luz de Reni, con un celu en el medio. Tiene un sticker que dice "GRABANDO". Mejor no tocarlo.', 'Al lado hay un termo y un perchero con ropa. "Para los videos", dice un cartelito.'],
      e: tx <= 27 ? ['Los estantes de madera de Asteroide: biblioratos verdes, libros, un jarrón azul y blanco, dos casitas de cerámica y unos bloques de madera.', 'Sofi dice que los bloques de madera son "decoración". Tato dice que son "arte". Nadie los mueve.']
        : tx <= 29 ? ['Una ventana con rejas grises, metida entre la madera. Sofi la abre todas las mañanas "para que respire la casa".']
        : ['El placard de madera. Adentro hay resmas, cables, cargadores de todos los modelos y una caja que dice "ROUTER VIEJO (NO TIRAR)".', 'Sofi tiene la llave. Y una copia. Y la copia de la copia.'],
      n: ['Una sansevieria en maceta marrón. Sofi dice que es la planta más difícil de matar. Igual la cuida como si fuera la más frágil.', 'Las hojas tienen borde amarillo y rayitas verde oscuro. Lu le canta. Dice que crece más derecha.'],
      r: ['El parrillero, metido en la pared: boca de ladrillo, viga de hierro negro y la parrilla inclinada. Los viernes Sahi se pone el delantal y nadie más toca el fuego.', 'Al costado está la manivela para subir y bajar la parrilla. Fede dice que el asado, como las ideas, sale mejor sin apuro.'],
      j: ['La vinoteca de madera en rombos, con unos vinos acostados esperando el próximo brindis.', 'Abajo, en un estante blanco, los dos microondas. Al mediodía hay fila y todos se ceden el lugar.'],
      w: ['La barra de la cocina: tapa de madera oscura sobre un muro blanco. Acá se toma el mate de la mañana y el café de las cuatro.', 'Sobre la barra hay un mate, pan para el almuerzo, un rollo de cocina y la freidora de aire. Y una lista de compras con la letra de Sofi.'],
      h: ['Una butaca alta de la barra: asiento y respaldo de madera, patas de hierro negro. Sahi la usa para pensar mirando el fuego.'],
      S: ['El sillón verde de la barbacoa, con almohadones beige. El mejor lugar para la siesta de diez minutos que nadie admite.'],
      t: ['La mesa ratona de madera gastada y hierro negro. Tiene marcas de vasos de todos los afters.'],
      i: ['El inodoro. Limpio y con papel. Sofi se ocupa.'],
      d: ['El bidé. Sí, acá hay bidé. Bienvenid{o} al Río de la Plata.'],
      z: ['La mesada de granito negro con la bacha y el espejo. Hay un aerosol de jazmín que alguien usa con demasiado entusiasmo.', 'Te mirás en el espejo. Tenés cara de estar aprendiendo un montón.'],
      g: ['Una guitarra criolla en su soporte. En los afters siempre aparece alguien que sabe tres acordes. Lu canta igual, sepa quien sepa.', 'Está un poquito desafinada. Sahi dice que es "a propósito, para que suene a fogón".'],
      u: CURMAP.id === 'office' ? ['El parlante de La Base. Suena la playlist del equipo: cada uno agrega un tema por semana.', 'Hoy eligió Lu, así que ya sabés lo que suena. Pimi le bajó un poquito el volumen. Lu se lo subió.'] : ['El parlante de torre de Asteroide. Suena un reggae bajito. Tato dice que es "para que los números tengan ritmo".', 'Arriba tiene botones que nadie toca. Bueno, Tato sí: el de volumen, para bajarlo cuando entra Lía.'],
      l: ['La lámpara de pie de arco, con su pantalla negra. Tato dice que con esa luz los números cierran solos.'],
      p: ['La impresora de Asteroide, arriba del mueble gris. Imprime facturas, recibos y, una vez, la lista de reggae de Tato. Entera.', 'Al lado hay un teléfono inalámbrico. Nadie sabe el número. Pero suena.'],
      m: ['Una monstera enorme. Dicen que creció más rápido que la agencia.', 'Alguien le puso nombre a la planta: se llama Mónica.'],
      y: CURMAP.id === 'office' ? ['La escalera de mármol sube a la planta alta. La baranda de hierro tiene más volutas que un brief de último momento.'] : ['El hueco de la escalera. Desde acá se ve el hall de abajo.'],
    }[ch];
    if (L) await say(pick('house:' + ch + (ch === 'Y' || ch === 'e' ? tx : ''), L));
  } finally { hideDlg(); G.busy = false; save(); }
}
async function interact(){
  const [dx, dy] = DV[G.dir], n = npcAt(G.x+dx, G.y+dy);
  const inOffice = CURMAP.id === 'office';
  const st = !n && stairAt(tileAt(G.x+dx, G.y+dy));
  if (st === 'up') return climbStairs();
  if (st === 'down') return goDownstairs();
  if (!n && CURMAP.id !== 'outside' && tileAt(G.x+dx, G.y+dy) === 'F') return openFridge();
  if (!n && CURMAP.id !== 'outside' && tileAt(G.x+dx, G.y+dy) === 'Q') return useCooler();
  if (!n && CURMAP.id === 'outside' && 'TFVw'.includes(tileAt(G.x+dx, G.y+dy))) return patioThing(tileAt(G.x+dx, G.y+dy), G.x+dx);
  if (!n && CURMAP.id === 'office' && G.y+dy === 7 && [11, 12, 14, 18, 19].includes(G.x+dx)) return houseThing('base' + (G.x+dx), G.x+dx);
  if (!n && CURMAP.id !== 'outside' && 'MBYcGoqmJNHfelpnugrjwhiStdz'.includes(tileAt(G.x+dx, G.y+dy))) return houseThing(tileAt(G.x+dx, G.y+dy), G.x+dx);
  if (!n) return;
  G.busy = true; n.dir = OPP[G.dir];
  n.mv = null; emote(n, moodOf(n), 1500); await sleepMs(380);
  try { if (await welcomeGate(n)) return; await rainMood(n); if (await picanteTalk(n)) return; if (await teamExtras(n)) return; await lvlGate(n); await n.talk(n); } finally { hideDlg(); closePanel(); n.emote = null; n.next = G.t + 2500; n.greet = G.t; G.busy = false; noteTalk(n.id); save(); }
}
function updateWorld(dt){
  if (G.mode !== 'world') return;
  updateNPCs(dt);
  if (G.move){
    G.move.t += dt;
    if (G.move.t >= G.move.dur){ G.x = G.move.tx; G.y = G.move.ty; G.move = null; onStep(); }
  }
  if (!G.move && !G.busy && !H.length){
    if (G.pendA){ G.pendA = false; interact(); return; }
    const d = dirStack[dirStack.length-1];
    if (d){
      const tx = G.x + DV[d][0], ty = G.y + DV[d][1];
      if (G.dir !== d && !G.turnLock){ G.dir = d; G.turnLock = G.t; }
      if (G.turnLock && G.t - G.turnLock < 60 && !G.wasMoving) return;
      G.dir = d;
      if (canWalk(tx, ty) && !vipLocked(tx, ty)){ G.move = {fx:G.x, fy:G.y, tx, ty, t:0, dur: held.b ? STEP_RUN : STEP_WALK}; G.stepN++; G.wasMoving = true; }
      else { G.wasMoving = false; if (vipLocked(tx, ty) && (!G.vipT || G.t - G.vipT > 2500)){ G.vipT = G.t; toast('Sala del Directorio · se abre en el nivel 25', 2200); } if (CURMAP.id === 'office' && tileAt(G.x, G.y) === 'E' && d === 'down'){ warp('outside', 15, 7, 'down'); return; } if (CURMAP.id === 'barbacoa' && tileAt(G.x, G.y) === 'E' && d === 'down'){ warp('outside', 4, 16, 'down'); return; } const st = stairAt(tileAt(tx, ty)); if (st && (!G.stairT || G.t - G.stairT > 1500)){ G.stairT = G.t; dirStack.length = 0; if (st === 'down') goDownstairs(); else climbStairs(); return; } if (!G.bumpT || G.t - G.bumpT > 320){ G.bumpT = G.t; SFX.bump(); } }
    } else { G.turnLock = 0; G.wasMoving = false; }
  }
}
function onStep(silentWarp){
  if (!silentWarp){
    if (CURMAP.id === 'office' && tileAt(G.x, G.y) === 'E' && G.dir === 'down'){ warp('outside', 15, 7, 'down'); return; }
    if (CURMAP.id === 'outside' && tileAt(G.x, G.y) === 'O'){ warp('office', 16, 23, 'up'); return; }
    if (CURMAP.id === 'outside' && tileAt(G.x, G.y) === 'K'){ warp('barbacoa', 3, 10, 'up'); return; }
    if (CURMAP.id === 'barbacoa' && tileAt(G.x, G.y) === 'E' && G.dir === 'down'){ warp('outside', 4, 16, 'down'); return; }
  }
  const z = zoneAt(G.x, G.y);
  if (z && z !== G.zone){ G.zone = z; const el = $('zone'); el.textContent = z.n; el.hidden = false; clearTimeout(onStep.zt); onStep.zt = setTimeout(() => el.hidden = true, 1800); }
  if (tileAt(G.x, G.y) === '"'){
    if (S.cool > 0) S.cool--;
    else if (Math.random() < .13){ G.pendA = false; G.busy = true; wildEncounter().finally(() => { G.busy = false; }); }
  }
  if (G.stepN % 12 === 0) save();
}
function camera(){
  let px = G.x*TS, py = G.y*TS;
  if (G.move){ const k = G.move.t / G.move.dur; px = (G.move.fx + (G.move.tx-G.move.fx)*k)*TS; py = (G.move.fy + (G.move.ty-G.move.fy)*k)*TS; }
  // si el mapa es más chico que la pantalla (la pantalla alta del celular), queda centrado
  const cx = MW*TS < VW ? (MW*TS - VW) / 2 : clamp(px + 8 - VW/2, 0, MW*TS - VW), cy = MH*TS < VH ? (MH*TS - VH) / 2 : clamp(py + 8 - VH/2, 0, MH*TS - VH);
  return {px, py, cx: Math.round(cx*2)/2, cy: Math.round(cy*2)/2};
}
function drawScene(cx, cy, withPlayer, px, py){
  ctx.setTransform(RES, 0, 0, RES, 0, 0);
  const M = CURMAP;
  ctx.fillStyle = '#0d1410'; ctx.fillRect(0, 0, VW*2, VH*2);
  { const sx = Math.max(0, cx*2), sy = Math.max(0, cy*2), sw = Math.min(M.canvas.width - sx, VW*2 - (sx - cx*2)), sh = Math.min(M.canvas.height - sy, VH*2 - (sy - cy*2));
    if (sw > 0 && sh > 0) ctx.drawImage(M.canvas, sx, sy, sw, sh, sx - cx*2, sy - cy*2, sw, sh); }
  drawWindowsWeather(M, cx, cy);
  for (const l of M.leds){ const X = l.x - cx*2, Y = l.y - cy*2;
    const a = .55 + .25 * Math.sin(G.t / 500 + l.k); ctx.fillStyle = `rgba(255,232,160,${(a * .35).toFixed(2)})`; ctx.fillRect(X - 3, Y - 2, 8, 8); ctx.fillStyle = '#ffe8a0'; ctx.fillRect(X - 1, Y, 4, 4); ctx.fillStyle = '#fff8d8'; ctx.fillRect(X, Y, 1, 1); }
  const list = [];
  for (const p of M.props) list.push({y: p.sy, draw: () => p.draw(ctx, cx, cy)});
  const emotes = [], notes = [];
  for (const n of NPCS){
    if (n.map !== M.id || n.away) continue;
    const [nx, ny] = npcPos(n);
    let fr = 0; if (n.mv){ const k = n.mv.t / n.mv.dur; if (k > .15 && k < .85) fr = (n.x + n.y) % 2 ? 1 : 2; }
    list.push({y: ny + 14, draw: () => drawChar(ctx, n.look, nx - cx, ny - cy, n.dir, fr)});
    if (n.emote && G.t - n.emote.t0 < n.emote.ms) emotes.push([n, nx, ny]);
    else if (n.sings && !G.busy) notes.push([n, nx, ny]);
    if (n.mop && !n.mv) list.push({y: ny + 14.2, draw: () => drawMop(ctx, Math.round((nx - cx)*2), Math.round((ny - cy)*2), n)});
    if (n.termo && !n.mv) list.push({y: ny + 14.2, draw: () => drawTermo(ctx, Math.round((nx - cx)*2), Math.round((ny - cy)*2), n)});
    if (S && rainy() && M.id === 'outside' && RAIN[n.id]) list.push({y: ny + 14.3, draw: () => drawUmbrella(ctx, Math.round((nx - cx)*2), Math.round((ny - cy)*2), '#d8492f')});
    if (n.pingpong && !n.mv) list.push({y: ny + 14.2, draw: () => drawPingPong(ctx, Math.round((nx - cx)*2), Math.round((ny - cy)*2), n)});
  }
  if (withPlayer){
    let frame = 0;
    if (G.move){ const k = G.move.t / G.move.dur; if (k > .1 && k < .9) frame = (G.stepN % 2) ? 1 : 2; }
    list.push({y: py + 14.5, draw: () => drawChar(ctx, 'player', px - cx, py - cy, G.dir, frame)});
  }
  list.sort((a, b) => a.y - b.y).forEach(o => o.draw());
  drawDaylight(M.id);
  for (const o of (M.over || [])) o(ctx, cx, cy);
  for (const s0 of M.steam){ for (let i = 0; i < 3; i++){ const k = ((G.t / 1400) + i / 3) % 1, X = s0.x - cx*2 + Math.round(Math.sin(k*6 + i) * 2), Y = s0.y - cy*2 - k*16;
    ctx.fillStyle = `rgba(255,255,255,${(.55*(1 - k)).toFixed(2)})`; ctx.fillRect(X, Y, 2, 2); } }
  drawRain(M.id, cx, cy);
  for (const [n, nx, ny] of emotes) drawEmote(ctx, Math.round((nx - cx)*2) + 6, Math.round((ny - cy)*2) - 40, n.emote);
  if (!G.busy) for (const sp of (M.speakers || [])) notes.push([{chill: true}, sp.x*TS - 4, sp.y*TS + 1]);
  for (const [n, nx, ny] of notes) drawNotes(ctx, Math.round((nx - cx)*2) + 16, Math.round((ny - cy)*2) - 30, n);
}
function drawWorld(){
  const {px, py, cx, cy} = camera();
  drawScene(cx, cy, true, px, py);
}
function drawTitleBG(){
  const k = (Math.sin(G.t / 9000) + 1) / 2, k2 = (Math.sin(G.t / 13000 + 1) + 1) / 2;
  drawScene(Math.round(k * Math.max(0, MW*TS - VW)), MH*TS < VH ? (MH*TS - VH) / 2 : Math.round(k2 * (MH*TS - VH)), false);
}
async function fade(on, white=false, ms=360){ const f = $('fade'); f.classList.toggle('white', white); f.style.opacity = on ? 1 : 0; await sleepMs(ms); }
function transition(ms=650){ G.trans = {t0: G.t, ms}; return sleepMs(ms + 30); }
function drawTransition(){
  const tr = G.trans; if (!tr) return;
  ctx.setTransform(2*RES, 0, 0, 2*RES, 0, 0);
  const k = clamp((G.t - tr.t0) / tr.ms, 0, 1), bars = 12, bh = VH / bars;
  ctx.fillStyle = '#120c1e';
  for (let i = 0; i < bars; i++){
    const kk = clamp(k * 1.4 - (i % 3) * .12, 0, 1), w = Math.ceil(VW * kk);
    if (i % 2) ctx.fillRect(VW - w, Math.floor(i*bh), w, Math.ceil(bh)); else ctx.fillRect(0, Math.floor(i*bh), w, Math.ceil(bh));
  }
}
function teleport(x, y, dir){ G.x = x; G.y = y; G.dir = dir; G.move = null; G.zone = zoneAt(x, y); }

