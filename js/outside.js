/* Patio de la agencia: casona, mosaico, ping pong, fuente, setos y vereda */
"use strict";
/* ================= EXTERIOR: EL PATIO DE LA AGENCIA =================
   Dibujado a partir de fotos de la oficina real: la casona blanca con la puerta en arco, rejas y balcón de hierro;
   el piso de mosaico de piedritas; la mesa de ping pong azul con la red roja (donde juega Sahi); la fuente redonda
   del jardín con las bicis y la guirnalda; setos, aves del paraíso, bananeros, el portón gris, el banco negro
   y el quincho de vidrio bajo la pérgola. Abajo, la vereda y la calle. */
const SMALL_CACHE = {};
function smallSprite(kind){
  if (SMALL_CACHE[kind]) return SMALL_CACHE[kind];
  let P, col, flat = '';
  if (kind === 'bush'){
    P = new Painter(1, 36, 30, 2);
    P.ell('a', 18, 18, 17, 11); [[8, 14, 8, 7], [18, 10, 9, 8], [28, 14, 8, 7]].forEach(([x, y, rx, ry]) => P.ell('b', x, y, rx, ry)); P.ell('c', 13, 9, 4, 3); P.ell('c', 24, 10, 3.5, 2.6);
    col = {a: '#3a7438', b: '#4f8c3e', c: '#86bb57'};
  } else if (kind === 'lamp'){
    P = new Painter(1, 24, 84, 2);
    P.ell('k', 12, 82, 6, 2.6); P.rect('k', 9, 74, 15, 82); P.cap('k', 12, 76, 12, 16, 2.2);
    P.cap('k', 12, 16, 12, 10, 3.6); P.ell('g', 12, 9, 5.2, 5.6); P.ell('k', 12, 3.4, 5.6, 2.2); P.ell('w', 10.4, 7.6, 1.4, 1.8);
    col = {k: '#2e3530', g: '#f7e7a1', w: '#ffffff'}; flat = 'w';
  } else if (kind === 'bench'){
    P = new Painter(1, 64, 40, 2);
    P.rect('k', 6, 22, 10, 38); P.rect('k', 54, 22, 58, 38); P.rect('k', 6, 6, 9, 24); P.rect('k', 55, 6, 58, 24);
    for (let i = 0; i < 3; i++) P.rect('w', 4, 6 + i*5, 60, 9.4 + i*5, {tone: 1});
    P.poly('s', [[2, 23], [62, 23], [60, 31], [4, 31]], {n: [32, 25, 30, 6]});
    col = {k: '#3a3040', w: '#a9784a', s: '#c4925c'};
  } else if (kind === 'mailbox'){
    P = new Painter(1, 28, 52, 2);
    P.rect('k', 12, 26, 16, 50); P.ell('k', 14, 50, 6, 2);
    P.rect('a', 3, 6, 25, 28); P.ell('a', 14, 7, 11, 5, {clip: (u, v) => v < 7}); P.rect('e', 7, 14, 21, 16.4); P.rect('o', 23, 10, 26, 20); P.rect('o', 23, 10, 27, 13);
    col = {k: '#3a3040', a: PX.plum, e: '#2a2236', o: PX.orange}; flat = 'e';
  } else if (kind === 'flower'){
    P = new Painter(1, 14, 16, 1);
    P.cap('s', 7, 15, 7, 8, .9); P.ell('l', 3.6, 12.6, 2.6, 1.4); P.ell('l', 10.4, 12, 2.6, 1.4);
    for (let a = 0; a < 5; a++) P.ell('p', 7 + Math.cos(a*1.257 - 1.57) * 3, 6 + Math.sin(a*1.257 - 1.57) * 3, 2.4, 2.4);
    P.ell('y', 7, 6, 1.6, 1.6);
    col = {s: '#3f9a45', l: '#3f9a45', p: '#fe7a02', y: '#f2c94c'}; flat = 'y';
  }
  const c = P.render(col, flat, {outline: 1, dark: .86});
  return SMALL_CACHE[kind] = c;
}

/* Colores sacados de las fotos de la oficina */
const PAT = {
  wall: '#eeede8', wallL: '#f8f7f3', wallD: '#dcdad2', wallE: '#c3c1b8', joint: '#e1dfd8',
  iron: '#464b53', ironL: '#6b727b', ironD: '#2f3338',
  glass: '#3b4148', glassL: '#5b646e', glassH: '#8b96a1',
  step: '#cfae9f', stepL: '#e0c6b8', stepD: '#a7887b', stepE: '#8c6f63',
};

/* ---------- piso: mosaico de piedritas, pedregullo del jardín, vereda y calle ---------- */
const MOS = {stone: ['#c5beaf', '#cec8ba', '#bbb4a5'].map(hx), stoneD: hx('#a29a8b'), stoneL: hx('#dbd6ca'), speck: hx('#968e81'), grout: hx('#5a554f'), groutL: hx('#68625b')};
function mosaicAt(px, py){
  const CW = 12, CH = 9, r0 = Math.floor(py / CH);
  let best = 9, bi = 0, by = 0;
  for (let r = r0 - 1; r <= r0 + 1; r++){
    const off = (r & 1) ? CW / 2 : 0, c0 = Math.floor((px - off) / CW);
    for (let c = c0 - 1; c <= c0 + 1; c++){
      const h = hash(c*7 + 3, r*13 + 5);
      const cx = c*CW + off + CW/2 + ((h % 5) - 2) * .5, cy = r*CH + CH/2 + (((h >> 4) % 3) - 1) * .5;
      const rx = CW * .43 + ((h >> 8) % 3) * .3, ry = CH * .4 + ((h >> 11) % 3) * .25;
      const dx = (px + .5 - cx) / rx, dy = (py + .5 - cy) / ry, d = dx*dx + dy*dy;
      if (d < best){ best = d; bi = h; by = py + .5 - cy; }
    }
  }
  const sp = hash(px, py) % 100;
  if (best < 1){
    if (best > .6 && by > 1) return MOS.stoneD;
    if (best > .6 && by < -1.5) return MOS.stoneL;
    return sp < 6 ? MOS.speck : MOS.stone[bi % 3];
  }
  return sp < 12 ? MOS.groutL : MOS.grout;
}
const GRV = {a: hx('#5e5b58'), b: hx('#6f6b67'), c: hx('#4a4743'), d: hx('#8c8781'), leaf: ['#c9a24a', '#a8743c', '#d9bf6a', '#8a5a30'].map(hx)};
function gravelAt(px, py){
  if (hash((px >> 2) + 991, (py >> 1) + 17) % 100 < 4) return GRV.leaf[hash(px >> 2, py >> 1) % 4];
  const h = hash(px >> 1, py >> 1) % 100;
  return h < 30 ? GRV.b : h < 50 ? GRV.c : h < 56 ? GRV.d : GRV.a;
}

/* ---------- plantas (con volumen y contorno) ---------- */
function leafPts(x0, y0, ang, len, wid, n = 8){
  const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux, L = [], R = [];
  for (let i = 0; i <= n; i++){
    const t = i / n, w = wid / 2 * Math.pow(Math.sin(Math.PI * Math.min(1, t * .95 + .05)), .7);
    const x = x0 + ux * len * t, y = y0 + uy * len * t;
    L.push([x + vx * w, y + vy * w]); R.unshift([x - vx * w, y - vy * w]);
  }
  return L.concat(R);
}
/* ave del paraíso: hojas como paletas y flores naranjas con lengua azul */
function birdSprite(v){
  const key = 'bird' + v; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  const P = new Painter(1, 52, 66, 2), bx = 26, by = 64;
  const angs = [-2.35, -2.05, -1.8, -1.55, -1.32, -1.08, -.82].map((a, i) => a + ((hash(v, i) % 7) - 3) * .03);
  angs.forEach((a, i) => {
    const sl = 18 + (i % 3) * 5, sx = bx + Math.cos(a) * sl, sy = by + Math.sin(a) * sl;
    P.cap('s', bx, by, sx, sy, .9);
    P.poly(i % 2 ? 'a' : 'b', leafPts(sx, sy, a, 17 + (i % 2) * 4, 9));
  });
  // flores: pico verde violáceo y cresta naranja con lengua azul
  for (const [fx, fy, dir] of (v % 2 ? [[17, 20, -1], [36, 14, 1]] : [[30, 12, 1], [15, 24, -1], [40, 26, 1]])){
    P.cap('s', bx, by, fx, fy + 3, .8);
    P.poly('k', [[fx, fy], [fx + dir * 12, fy - 1], [fx + dir * 11, fy + 2], [fx, fy + 3]]);
    P.poly('o', [[fx + dir * 2, fy], [fx + dir * 4, fy - 9], [fx + dir * 6, fy - 1]]);
    P.poly('o', [[fx + dir * 5, fy], [fx + dir * 9, fy - 8], [fx + dir * 9, fy - 1]]);
    P.poly('u', [[fx + dir * 6, fy - 1], [fx + dir * 11, fy - 6], [fx + dir * 9, fy]]);
  }
  return SMALL_CACHE[key] = P.render({s: '#4a7a3c', a: '#3c7038', b: '#4e8a46', k: '#5e6a5a', o: '#f08a24', u: '#5058c0'}, '', {outline: 1, dark: .8});
}
/* bananero: tronco fino y hojas grandes, alguna seca colgando */
function bananaSprite(v){
  const key = 'banana' + v; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  const P = new Painter(1, 104, 150, 3), tx = 52 + (v % 2 ? 3 : -3), top = 62;
  P.poly('d', leafPts(tx, top + 8, 1.95, 34, 9)); P.poly('d', leafPts(tx, top + 6, 1.15, 30, 8));
  P.cap('t', 52, 148, tx, top, 4.2);
  const angs = [-2.75, -2.35, -1.95, -1.55, -1.2, -.8, -.4].map((a, i) => a + ((hash(v + 5, i) % 5) - 2) * .04);
  angs.forEach((a, i) => { const len = 36 + ((i * 7 + v) % 3) * 5, ex = tx + Math.cos(a) * len, ey = top + Math.sin(a) * len;
    P.poly(i % 2 ? 'a' : 'b', leafPts(tx, top, a, len, 15)); P.cap('r', tx, top, ex, ey, .6); });
  for (let y = top + 10; y < 146; y += 7) P.retone(['t'], 2, (u, w) => Math.abs(w - y) < .6);
  return SMALL_CACHE[key] = P.render({t: '#8b7d62', a: '#4c8540', b: '#68a050', r: '#a6cf7c', d: '#a8895a'}, 'r', {outline: 1, dark: .82});
}
/* cantero de aloes junto a la escalera */
function aloeBedSprite(){
  if (SMALL_CACHE.aloe) return SMALL_CACHE.aloe;
  const P = new Painter(1, 132, 50, 2);
  for (const [cx, big] of [[12, 0], [34, 1], [58, 0], [80, 1], [104, 0], [122, 1]]){
    for (let k = 0; k < 9; k++){
      const a = -Math.PI + (k + .5) * Math.PI / 9 + ((hash(cx, k) % 5) - 2) * .04, len = 16 + (k % 3) * 4 + big * 6 - Math.abs(k - 4) * 1.2;
      const ux = Math.cos(a), uy = Math.sin(a), b0 = 40;
      P.poly(k % 2 ? 'a' : 'b', [[cx - uy * 1.8, b0 + ux * 1.8], [cx + ux * len, b0 + uy * len * .95], [cx + uy * 1.8, b0 - ux * 1.8]]);
    }
  }
  P.rect('w', 0, 40, 132, 49, {tone: 1}); P.rect('x', 0, 38, 132, 41, {tone: 0});
  return SMALL_CACHE.aloe = P.render({w: '#e3e1d9', x: '#f6f5f0', a: '#6b9767', b: '#88b17e'}, '', {outline: 1, dark: .8});
}
/* clivias naranjas del jardín */
function cliviaSprite(v){
  const key = 'clivia' + v; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  const P = new Painter(1, 30, 28, 2);
  [-2.7, -2.3, -1.9, -1.25, -.85, -.45].forEach((a, i) => P.poly(i % 2 ? 'a' : 'b', leafPts(15, 26, a, 13 + (i % 2) * 2, 4)));
  P.cap('a', 15, 26, 15, 12, 1);
  [[12, 9], [18, 9], [15, 6], [15, 11], [11, 12], [19, 12]].forEach(([x, y], i) => P.ell(i % 3 ? 'o' : 'y', x + (v % 2), y, 2.6, 2.4));
  return SMALL_CACHE[key] = P.render({a: '#3c7038', b: '#4e8a46', o: '#ef7a2c', y: '#f5a83e'}, '', {outline: 1, dark: .8});
}
/* árbol del jardín: varios troncos finos y follaje liviano, como en la foto de la fuente */
function gardenTreeSprite(){
  if (SMALL_CACHE.gtree) return SMALL_CACHE.gtree;
  const P = new Painter(1, 84, 128, 3);
  const leaves = (n, seed) => { for (let i = 0; i < n; i++){ const r = hash(i + seed, 77), x = 10 + r % 64, y = 6 + (r >> 7) % 70; P.ell(['a', 'b', 'c'][i % 3], x, y, 5 + (r >> 3) % 4, 3 + (r >> 5) % 3); } };
  leaves(26, 0);
  P.cap('t', 42, 126, 30, 40, 2.2); P.cap('t', 42, 126, 48, 30, 2.4); P.cap('t', 44, 126, 60, 52, 1.8); P.cap('t', 40, 124, 22, 66, 1.6); P.cap('t', 48, 30, 58, 14, 1.2); P.cap('t', 30, 40, 22, 22, 1.1);
  leaves(14, 40);
  return SMALL_CACHE.gtree = P.render({t: '#7d6c57', a: '#5b8a3e', b: '#78a64c', c: '#a8c66a'}, '', {outline: 1, dark: .82});
}
/* bicis apoyadas en el soporte */
function bikesSprite(){
  if (SMALL_CACHE.bikes) return SMALL_CACHE.bikes;
  const s = sprite(52, 38, p => {
    const wheel = (cx, cy, r, col) => { for (let a = 0; a < 6.29; a += .06) for (const rr of [r, r - 1]) p.P(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), col); p.P(cx, cy, '#9aa0a6'); };
    p.R(0, 33, 52, 2, '#3a3d42'); for (const x of [4, 18, 32, 46]) p.R(x, 24, 2, 10, '#55595f');
    for (const [ox, frame] of [[16, '#c0392b'], [0, '#4aa3a2']]){
      wheel(ox + 9, 27, 8, '#1f2125'); wheel(ox + 33, 27, 8, '#1f2125');
      p.L(ox + 9, 27, ox + 19, 18, frame); p.L(ox + 19, 18, ox + 33, 27, frame); p.L(ox + 19, 18, ox + 30, 17, frame); p.L(ox + 21, 27, ox + 19, 18, frame); p.L(ox + 21, 27, ox + 30, 17, frame);
      p.L(ox + 30, 17, ox + 33, 27, frame); p.R(ox + 16, 15, 7, 2, '#2a2c30'); p.L(ox + 30, 17, ox + 31, 12, '#2a2c30'); p.R(ox + 28, 11, 7, 2, '#2a2c30');
    }
  }, {dark: .7});
  return SMALL_CACHE.bikes = s;
}
/* banco de hierro negro como el de la entrada */
function blackBenchSprite(){
  if (SMALL_CACHE.bbench) return SMALL_CACHE.bbench;
  const k = '#26282d', kl = '#4d515a';
  return SMALL_CACHE.bbench = sprite(62, 38, p => {
    p.R(3, 0, 3, 36, k); p.R(56, 0, 3, 36, k); p.R(3, 0, 1, 36, kl);
    p.R(2, 0, 58, 3, k); p.R(2, 0, 58, 1, kl);
    for (let x = 7; x < 56; x += 4) p.R(x, 3, 2, 14, k);
    p.R(2, 16, 58, 2, k);
    p.R(0, 19, 62, 6, '#30333a'); for (let x = 1; x < 62; x += 4) p.R(x, 19, 2, 1, kl); p.R(0, 24, 62, 1, '#1b1d21');
    p.R(8, 25, 2, 11, k); p.R(52, 25, 2, 11, k);
  }, {dark: .6});
}
/* la mesa de ping pong vista desde una cabecera: azul, líneas blancas y red roja de chapa perforada */
function pingPongSprite(){
  if (SMALL_CACHE.pp) return SMALL_CACHE.pp;
  const W = 88, T0 = 8, T1 = 80, NY = 44;
  return SMALL_CACHE.pp = sprite(W + 8, 104, p => {
    const o = 4, B = rampOf('#2f62b8'), K = '#24262c', N = rampOf('#d63c3c');
    // patas, travesaños y el marco rojo de abajo
    p.R(o + 8, T1, 4, 22, K); p.R(o + W - 12, T1, 4, 22, K); p.R(o + 6, T1 + 20, 8, 2, '#17181c'); p.R(o + W - 14, T1 + 20, 8, 2, '#17181c');
    p.R(o + 12, T1 + 6, W - 24, 2, K); p.R(o + 18, T1 + 3, 20, 3, N.d); p.R(o + W - 38, T1 + 3, 20, 3, N.d);
    // tapa
    p.R(o, T0, W, T1 - T0, B.m);
    for (let y = T0 + 3; y < T1 - 3; y += 2) if (hash(y, 3) % 3 === 0) p.D(o + 3, y, W - 6, 1, B.l, y);
    p.R(o, T0, W, 2, '#f4f6fa'); p.R(o, T1 - 2, W, 2, '#f4f6fa'); p.R(o, T0, 2, T1 - T0, '#f4f6fa'); p.R(o + W - 2, T0, 2, T1 - T0, '#f4f6fa');
    p.R(o + W/2, T0, 1, T1 - T0, '#e8edf6');
    p.R(o, T1, W, 4, '#1d3768'); p.R(o, T1, W, 1, B.d);
    // sombra de la red sobre la mesa
    p.R(o + 2, NY + 1, W - 4, 3, B.d);
    // red: chapa roja perforada que sobresale a los costados
    p.R(o - 3, NY - 11, W + 6, 12, N.m); p.R(o - 3, NY - 11, W + 6, 1, N.l); p.R(o - 3, NY, W + 6, 1, N.e);
    for (let y = NY - 8; y < NY - 1; y += 2) for (let x = o + (y % 4 ? 0 : 1); x < o + W; x += 2) p.P(x, y, N.e);
    p.R(o - 4, NY - 12, 4, 15, N.d); p.R(o + W, NY - 12, 4, 15, N.d); p.R(o - 4, NY - 12, 4, 1, N.l); p.R(o + W, NY - 12, 4, 1, N.l);
  }, {dark: .75});
}
/* setos recortados: un sprite por grupo, con la tapa de hojas y el frente más oscuro */
function hedgeGroupSprite(tiles, x0, y0, w, h){
  const RISE = 20, m = 2, c = document.createElement('canvas'); c.width = w*32 + m*2; c.height = h*32 + RISE + m*2 + 4;
  const x = c.getContext('2d'), has = (tx, ty) => tiles.has(tx + ',' + ty);
  const TOP = ['#5f9e3e', '#71b04a', '#84c058', '#2f5e22'], HI = '#acd872', SH = '#3d7a2c', FR = ['#3a742a', '#447f30', '#2f6424'], FD = '#234a1a';
  for (const k of tiles){
    const [tx, ty] = k.split(',').map(Number), X = (tx - x0)*32 + m, Y = (ty - y0)*32 + m, below = has(tx, ty + 1), above = has(tx, ty - 1);
    // tapa: base y matas de hojitas con luz arriba a la izquierda
    x.fillStyle = TOP[3]; x.fillRect(X, Y + (above ? 0 : 3), 32, above ? 32 : 29);
    for (let i = 0; i < 34; i++){
      const r = hash(tx*97 + i, ty*53 + i*7), lx = X + r % 32, ly = Y + (above ? 0 : 3) + (r >> 6) % (above ? 31 : 28), col = TOP[(r >> 11) % 3], rx = 3 + (r >> 13) % 2, ry = 2 + (r >> 15) % 2;
      pixEllipse(x, lx + 1, ly + 1, rx, ry, SH); pixEllipse(x, lx, ly, rx, ry, col); x.fillStyle = HI; if ((r >> 17) % 2 === 0) x.fillRect(lx - 1, ly - ry + 1, 2, 1);
    }
    if (!above) for (let xx = 0; xx < 32; xx += 4){ const r = hash(tx*31 + xx, ty); pixEllipse(x, X + xx + 2, Y + 3 + (r % 2), 3, 2, TOP[r % 3]); x.fillStyle = HI; x.fillRect(X + xx + 1, Y + 2 + (r % 2), 2, 1); }
    // frente más oscuro, con matas y sombra abajo
    if (!below){
      x.fillStyle = FR[0]; x.fillRect(X, Y + 32, 32, RISE);
      for (let i = 0; i < 22; i++){ const r = hash(tx*61 + i, ty*29 + i*3), lx = X + r % 32, ly = Y + 32 + (r >> 6) % RISE; pixEllipse(x, lx, ly, 2, 1, FR[(r >> 10) % 3]); }
      x.fillStyle = FD; x.fillRect(X, Y + 32 + RISE - 3, 32, 3); x.fillStyle = HI; for (let xx = 0; xx < 32; xx += 3) x.fillRect(X + xx, Y + 32, 2, 1); x.fillStyle = TOP[1]; x.fillRect(X, Y + 31, 32, 1);
    }
  }
  // recorta lo que se salió del contorno de cada baldosa
  const img = x.getImageData(0, 0, c.width, c.height), d = img.data;
  for (let py = 0; py < c.height; py++) for (let px = 0; px < c.width; px++){
    const tx = Math.floor((px - m) / 32) + x0, ty0 = Math.floor((py - m) / 32) + y0;
    const inTop = has(tx, ty0) && px >= m && py >= m, inFront = has(tx, ty0 - 1) && !has(tx, ty0) && ((py - m) % 32) < RISE;
    if (!inTop && !inFront) d[(py*c.width + px)*4 + 3] = 0;
  }
  x.putImageData(img, 0, 0);
  outlineCanvas(c, .8);
  x.fillStyle = 'rgba(43,36,72,.22)';
  for (const k of tiles){ const [tx, ty] = k.split(',').map(Number); if (!has(tx, ty + 1)) x.fillRect((tx - x0)*32 + m, (ty - y0)*32 + m + 32 + RISE + 1, 32, 3); }
  c.m = m; c.rise = RISE; return c;
}
/* ---------- la casona (fachada blanca con puerta en arco y balcón de hierro) ---------- */
function drawVilla(b, X, Y, W, H){
  const p = Pen(b, X, Y), I = PAT.iron, IL = PAT.ironL;
  const ring = (cx, cy, rx, ry, col) => { for (let a = 0; a < 6.29; a += .1) p.P(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), col); };
  const glassRefl = (x, y, w, h) => { p.L(x + 2, y + Math.round(h * .5), x + Math.round(w * .5), y + 2, PAT.glassL); p.L(x + 3, y + Math.round(h * .5) + 1, x + Math.round(w * .5) + 1, y + 3, PAT.glassL); p.L(x + Math.round(w * .55), y + h - 3, x + w - 3, y + Math.round(h * .55), PAT.glassL); };
  // pared con sillares
  p.R(0, 0, W, H, PAT.wall);
  for (let y = 40, n = 0; y < 208; y += 13, n++){ p.R(0, y, W, 1, PAT.joint); for (let x = (n % 2) * 32; x < W; x += 64) p.R(x, y - 12, 1, 12, PAT.joint); }
  p.R(0, 0, 8, H, '#e7e5de'); p.R(7, 0, 1, H, PAT.wallE); p.R(W - 8, 0, 8, H, '#e2e0d8'); p.R(W - 8, 0, 1, H, PAT.wallL);
  for (let y = 30; y < 208; y += 13){ p.R(0, y, 8, 1, PAT.wallD); p.R(W - 8, y, 8, 1, PAT.wallD); }
  // cornisa con dentículos y ovas
  p.R(0, 0, W, 9, PAT.wallL); p.R(0, 8, W, 2, PAT.wallE);
  for (let x = 2; x < W; x += 7){ p.R(x, 11, 4, 6, '#e8e6df'); p.R(x + 3, 11, 1, 6, PAT.wallE); p.R(x, 16, 4, 1, PAT.wallE); }
  p.R(0, 17, W, 1, PAT.wallE);
  for (let x = 3; x < W; x += 6){ p.R(x, 19, 3, 3, PAT.wallD); p.P(x + 1, 19, PAT.wallL); }
  p.R(0, 22, W, 3, PAT.wallL); p.R(0, 25, W, 2, PAT.wallE); p.D(0, 27, W, 3, 'rgba(60,56,70,.18)');
  // ventana con molduras
  const win = (x, y, w, h, cols, rows, sill = true) => {
    p.R(x - 5, y - 5, w + 10, h + 7, PAT.wallL); p.R(x - 5, y - 5, w + 10, 1, '#ffffff'); p.R(x + w + 4, y - 5, 1, h + 7, PAT.wallE); p.R(x - 2, y - 2, w + 4, h + 2, PAT.wallD);
    p.R(x, y, w, h, PAT.glass); glassRefl(x, y, w, h);
    const cw = w / cols, rh = h / rows;
    for (let i = 1; i < cols; i++) p.R(Math.round(x + i * cw) - 1, y, 2, h, '#2a2e34');
    for (let j = 1; j < rows; j++) p.R(x, Math.round(y + j * rh) - 1, w, 2, '#2a2e34');
    p.R(x, y, w, 1, '#2a2e34');
    if (sill){ p.R(x - 7, y + h + 2, w + 14, 4, PAT.wallL); p.R(x - 7, y + h + 5, w + 14, 1, PAT.wallE); p.D(x - 5, y + h + 6, w + 10, 2, 'rgba(60,56,70,.2)'); }
  };
  // ventana con postigos grises abiertos a los costados
  const shutters = (x, y, w, h) => {
    win(x, y, w, h, 2, 4);
    for (const sx of [x - 6 - w/2, x + w + 6]){
      p.R(sx, y - 3, w/2, h + 3, '#5b626b'); p.R(sx, y - 3, w/2, 1, '#737a83'); p.R(sx, y - 3, 1, h + 3, '#737a83');
      for (let k = 1; k < h + 2; k += 3) p.R(sx + 1, y - 3 + k, w/2 - 2, 1, '#454b53');
    }
  };
  // primer piso
  shutters(38, 40, 28, 56); shutters(W - 66, 40, 28, 56);
  win(118, 44, 34, 52, 2, 3); win(W - 152, 44, 34, 52, 2, 3);
  // ventanal del balcón con su frontón
  p.R(222, 30, 68, 6, PAT.wallL); p.R(222, 35, 68, 1, PAT.wallE); p.R(250, 24, 12, 12, PAT.wallL); p.R(261, 24, 1, 12, PAT.wallE); p.R(252, 26, 8, 1, PAT.wallD);
  win(232, 40, 48, 66, 4, 6, false);
  // cornisa entre pisos
  p.R(0, 112, W, 5, PAT.wallL); p.R(0, 112, W, 1, '#ffffff'); p.R(0, 117, W, 2, PAT.wallE); p.D(0, 119, W, 2, 'rgba(60,56,70,.14)');
  // balcón: losa, ménsulas talladas y baranda de hierro con volutas
  p.R(188, 103, 136, 8, '#e9e7e0'); p.R(188, 103, 136, 1, '#ffffff'); p.R(188, 110, 136, 1, PAT.wallE); p.D(190, 111, 132, 2, 'rgba(60,56,70,.2)');
  for (const mx of [196, 210, 294, 308]){ p.R(mx, 111, 9, 13, '#e3e1da'); p.R(mx + 8, 111, 1, 13, PAT.wallE); p.R(mx + 1, 122, 7, 2, PAT.wallE); ring(mx + 4, 115, 2, 2, PAT.wallD); p.R(mx + 2, 119, 5, 1, PAT.wallD); }
  p.R(190, 76, 132, 2, I); p.R(190, 76, 132, 1, IL); p.R(190, 100, 132, 3, I);
  for (let bx = 190; bx < 320; bx += 22){
    p.R(bx, 76, 2, 26, I); const cx = bx + 11;
    ring(cx, 88, 6, 8, I); ring(cx, 88, 2, 3, I); ring(cx - 6, 80, 2, 2, I); ring(cx + 6, 80, 2, 2, I); ring(cx - 6, 97, 2, 2, I); ring(cx + 6, 97, 2, 2, I); p.R(cx, 78, 1, 4, I); p.R(cx, 96, 1, 4, I);
  }
  p.R(320, 76, 2, 26, I);
  // planta baja: ventanas con rejas
  const grille = (x, y, w, h) => {
    win(x, y, w, h, 2, 3);
    for (let gx = x + 2; gx < x + w - 1; gx += 6) p.R(gx, y, 2, h, I);
    p.R(x, y + 3, w, 2, I); p.R(x, y + h - 5, w, 2, I); p.R(x, y + 20, w, 2, I);
    ring(x + w/2, y + 12, 6, 6, I); ring(x + w/2 - 9, y + 12, 3, 4, I); ring(x + w/2 + 9, y + 12, 3, 4, I);
  };
  shutters(38, 140, 28, 56); shutters(W - 66, 140, 28, 56);
  grille(116, 138, 38, 60); grille(W - 154, 138, 38, 60);
  // zócalo
  p.R(0, 206, W, 18, '#dedcd4'); p.R(0, 206, W, 2, PAT.wallL); p.R(0, 222, W, 2, PAT.wallE);
  // puerta en arco con reja de hierro
  const dc = 256;
  pixEllipse(b, X + dc, Y + 170, 47, 47, PAT.wallL); p.R(dc - 47, 170, 94, 54, PAT.wallL);
  for (let a = Math.PI; a <= 2 * Math.PI; a += .02) p.P(Math.round(dc + Math.cos(a) * 47), Math.round(170 + Math.sin(a) * 47), PAT.wallE);
  pixEllipse(b, X + dc, Y + 170, 37, 37, PAT.wallD); p.R(dc - 37, 170, 74, 54, PAT.wallD);
  p.R(dc - 47, 170, 2, 54, PAT.wallE); p.R(dc + 45, 170, 2, 54, PAT.wallE);
  pixEllipse(b, X + dc, Y + 172, 30, 30, '#25282e'); p.R(dc - 30, 172, 60, 52, '#25282e');
  pixEllipse(b, X + dc, Y + 192, 12, 7, '#4a443a'); pixEllipse(b, X + dc, Y + 190, 5, 3, '#e8d7a0'); p.R(dc - 1, 172, 2, 16, '#3a3d44');
  p.R(dc - 30, 210, 60, 14, '#33302c');
  for (let a = Math.PI + .25; a < 2 * Math.PI - .2; a += .38) p.L(dc, 174, Math.round(dc + Math.cos(a) * 28), Math.round(174 + Math.sin(a) * 28), I);
  ring(dc, 174, 29, 29, I); ring(dc, 174, 8, 8, I);
  p.R(dc - 30, 174, 60, 3, I);
  for (let gx = dc - 28; gx < dc + 28; gx += 6) p.R(gx, 177, 2, 47, I);
  p.R(dc - 1, 174, 3, 50, I); p.R(dc - 30, 210, 60, 2, I);
  for (const sx of [dc - 15, dc + 15]){ ring(sx, 194, 7, 10, IL); ring(sx, 194, 3, 4, IL); }
  p.R(dc - 6, 120, 12, 10, PAT.wallL); p.R(dc + 5, 120, 1, 10, PAT.wallE); p.R(dc - 4, 122, 8, 1, PAT.wallD);
  for (const lx of [dc - 22, dc + 18]){ p.R(lx, 125, 4, 3, '#ffffff'); p.R(lx, 128, 4, 1, PAT.wallE); }
  // placa de bronce
  p.R(dc + 54, 166, 13, 10, '#9a7a34'); p.R(dc + 55, 167, 11, 8, '#d9b45a'); p.R(dc + 57, 169, 7, 1, '#8a6a2a'); p.R(dc + 57, 172, 7, 1, '#8a6a2a');
}
/* muro del jardín: gris, con musgo, enredaderas y una guirnalda de luces */
function drawGardenWall(b, X, Y, W, H, bulbs){
  const p = Pen(b, X, Y);
  p.R(0, 0, W, 26, '#3e6a35');
  for (let i = 0; i < 40; i++){ const r = hash(i, 51), x = r % W, y = (r >> 8) % 22; pixEllipse(b, X + x, Y + y, 8 + (r >> 3) % 6, 5 + (r >> 5) % 3, ['#4f7f3f', '#5f9448', '#7fae55'][i % 3]); }
  p.R(0, 22, W, H - 22, '#d2d1c9');
  for (let i = 0; i < 26; i++){ const r = hash(i, 63), x = r % W, w = 3 + (r >> 4) % 6, h = 20 + (r >> 9) % 80; p.D(x, 28, w, h, i % 3 ? '#b9bca6' : '#a9ad96', i); }
  p.R(0, 22, W, 5, '#e6e5de'); p.R(0, 26, W, 2, '#a9a89f');
  for (let i = 0; i < 18; i++){
    const r = hash(i, 71), x = 4 + r % (W - 8), len = 24 + (r >> 6) % 90;
    for (let y = 26; y < 26 + len; y++){ const sx = x + Math.round(Math.sin(y / 9 + i) * 1.5); p.P(sx, y, '#4f7a35'); if ((y + i) % 5 === 0){ p.R(sx - 2, y, 2, 2, '#6f9a45'); p.R(sx + 1, y + 2, 2, 2, '#86b35a'); } }
  }
  p.R(0, H - 8, W, 8, '#b9b8af'); p.R(0, H - 8, W, 1, '#c9c8c0');
  // guirnalda
  for (let x = 0; x <= W; x += 2){ const y = 52 + Math.round(Math.sin(x / W * Math.PI) * 14); p.R(x, y, 2, 1, '#34363b'); if (x % 18 === 8) bulbs.push([X + x, Y + y + 2]); }
}
/* muro blanco con el portón gris en arco y los aires acondicionados */
function drawGateWall(b, X, Y, W, H){
  const p = Pen(b, X, Y);
  p.R(0, 0, W, 18, '#46743a');
  for (let i = 0; i < 26; i++){ const r = hash(i, 91), x = r % W, y = (r >> 8) % 14; pixEllipse(b, X + x, Y + y, 9, 5, ['#5a8a45', '#6b9c4e', '#8cbb62'][i % 3]); }
  p.R(0, 16, W, H - 16, PAT.wall);
  for (let y = 40, n = 0; y < H - 8; y += 13, n++){ p.R(0, y, W, 1, PAT.joint); for (let x = (n % 2) * 32 + 8; x < W; x += 64) p.R(x, y - 12, 1, 12, PAT.joint); }
  p.R(0, 16, W, 7, PAT.wallL); p.R(0, 22, W, 2, PAT.wallE); p.D(0, 24, W, 2, 'rgba(60,56,70,.16)');
  p.R(0, H - 8, W, 8, '#dedcd4'); p.R(0, H - 8, W, 1, PAT.wallL);
  // aires acondicionados apilados
  for (const ay of [34, 76]){
    p.R(10, ay, 38, 26, '#f3f3f0'); p.R(10, ay, 38, 1, '#ffffff'); p.R(47, ay, 1, 26, '#c9cbc8'); p.R(10, ay + 25, 38, 1, '#b8bab7');
    pixEllipse(b, X + 23, Y + ay + 13, 9, 9, '#c8cbcc'); for (let k = -8; k <= 8; k += 3) p.R(15, ay + 13 + k, 17, 1, '#aeb2b4'); p.R(37, ay + 6, 7, 3, '#5fa5a0');
    p.R(8, ay + 26, 42, 2, '#8d9093'); p.R(44, ay + 26, 2, 14, '#b98c5a');
  }
  // una enredadera que cae por el muro (el portón grande es el del frente, el que se ve desde la vereda)
  for (let i = 0; i < 40; i++){ const r = hash(i, 57), x = 70 + (r % 120), y = 18 + ((r >> 8) % (24 + (x % 40))); pixEllipse(b, X + x, Y + y, 3 + (r >> 16) % 3, 2, ['#5a8a45', '#6b9c4e', '#46743a'][i % 3]); }
}
/* quincho de vidrio bajo la pérgola con enredadera */
function drawPavilion(b, X, Y, W, H){
  const p = Pen(b, X, Y), roofH = 34;
  // techo de pérgola cubierto de enredadera
  p.R(0, 0, W, roofH, '#3f6e33');
  for (let x = 4; x < W; x += 14) p.R(x, 0, 3, roofH, '#5a4632');
  for (let i = 0; i < 70; i++){ const r = hash(i, 131), x = r % W, y = (r >> 8) % roofH; pixEllipse(b, X + x, Y + y, 5 + (r >> 3) % 5, 3 + (r >> 5) % 3, ['#4f8a3f', '#62a04b', '#7fb85a', '#9acb6a'][i % 4]); }
  // frente vidriado
  p.R(0, roofH, W, H - roofH, '#d4d6d3');
  const fy = roofH + 4, fh = H - roofH - 10, panes = 5, pw = (W - 12) / panes;
  for (let i = 0; i < panes; i++){
    const x = Math.round(6 + i * pw), w = Math.round(pw) - 3;
    p.R(x, fy, w, fh, '#56646c'); p.R(x, fy, w, Math.round(fh * .35), '#61717a');
    if (i === 1 || i === 3){ p.R(x + 4, fy + fh - 18, 5, 18, '#8a6a48'); p.R(x + 4, fy + fh - 18, 10, 3, '#a88560'); p.R(x + w - 10, fy + fh - 12, 8, 12, '#7a5c3e'); }
    if (i === 2){ p.R(x + 4, fy + fh - 14, w - 8, 3, '#a88560'); p.R(x + 6, fy + fh - 11, 2, 11, '#7a5c3e'); p.R(x + w - 8, fy + fh - 11, 2, 11, '#7a5c3e'); p.R(x + w/2 - 1, fy, 2, 10, '#30343a'); pixEllipse(b, X + x + w/2, Y + fy + 11, 4, 2, '#f0e6c0'); }
    p.L(x + 2, fy + Math.round(fh * .7), x + Math.round(w * .6), fy + 2, 'rgba(255,255,255,.35)');
    p.R(x - 3, fy, 3, fh, '#3a3f45');
  }
  p.R(W - 9, fy, 3, fh, '#3a3f45'); p.R(0, fy - 2, W, 2, '#3a3f45'); p.R(0, H - 6, W, 6, '#bdbcb4'); p.R(0, H - 6, W, 1, '#d8d7d0');
  // enredadera que cae por el frente y tronco retorcido
  for (let i = 0; i < 16; i++){ const r = hash(i, 151), x = r % W, len = 6 + (r >> 6) % 22; for (let y = roofH - 2; y < roofH + len; y++){ p.P(x + Math.round(Math.sin(y / 5 + i)), y, '#4f8a3f'); if (y % 4 === 0) p.R(x - 1, y, 3, 2, '#6aa54f'); } }
  for (let y = 4; y < H - 4; y++){ const x = 3 + Math.round(Math.sin(y / 7) * 2); p.R(x, y, 4, 1, '#6b5a45'); p.P(x + 1, y, '#8a7860'); }
}
/* escalinata de granito con los extremos redondeados */
function drawSteps(b, cx, y0){
  const steps = [[112, 0], [136, 10], [160, 20]];
  for (const [w, dy] of steps){
    const x = cx - w/2, y = y0 + dy, tread = 7, riser = 4;
    pixEllipse(b, x + 5, y + 5, 5, 5, PAT.stepD); pixEllipse(b, x + w - 5, y + 5, 5, 5, PAT.stepD);
    b.fillStyle = PAT.stepD; b.fillRect(x + 4, y + tread, w - 8, riser);
    pixEllipse(b, x + 5, y + 3, 5, 4, PAT.step); pixEllipse(b, x + w - 5, y + 3, 5, 4, PAT.step);
    b.fillStyle = PAT.step; b.fillRect(x + 4, y - 1, w - 8, tread + 1);
    b.fillStyle = PAT.stepL; b.fillRect(x + 4, y - 1, w - 8, 1);
    b.fillStyle = PAT.stepE; b.fillRect(x + 4, y + tread + riser - 1, w - 8, 1);
    for (let k = 0; k < w / 3; k++){ const r = hash(k, dy + 3); b.fillStyle = r % 2 ? PAT.stepD : PAT.stepL; b.fillRect(x + 4 + r % (w - 8), y + (r >> 5) % tread, 1, 1); }
  }
}
/* frente (como en la foto de la fachada): muro blanco de bloques con apliques de luz arriba, el portal de entrada
   con columnas grises, entablamento con dentículos, arco con una caracola de yeso y el portón de madera gris abierto
   (por el hueco se ve el patio), y a la derecha la fachada de la casona con ventanas en arco con persianas y el
   cartel verde iluminado de la agencia (genérico, sin logo). Bajito a propósito: está abajo del todo y no tiene
   que tapar a nadie en el patio; el hueco del portón es alto como para pasar caminando por abajo del arco.
   La base del dibujo apoya en la fila 19. */
function frontFenceSprite(W){
  const H = 148, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), p = Pen(x);
  const WALL = '#efe9dc', WL = '#f8f4ec', JT = '#ddd5c6', PL = '#e2dccf', PE = '#c9c1b2';
  const L0 = 13*32, L1 = 17*32, cx = (L0 + L1) / 2;                      // hueco del portón
  const body = (x0, x1, top) => {
    p.R(x0, top, x1 - x0, H - top, WALL);
    for (let y = top + 12; y < H - 12; y += 12){ p.R(x0, y, x1 - x0, 1, JT); for (let xx = x0 + ((y / 12) % 2 ? 0 : 16); xx < x1; xx += 32) p.R(xx, y - 11, 1, 11, JT); }
    p.R(x0, H - 12, x1 - x0, 12, PL); p.R(x0, H - 12, x1 - x0, 1, '#f4efe4'); p.R(x0, H - 1, x1 - x0, 1, PE);
  };
  // muro de la izquierda con su remate y los apliques
  const wt = H - 50;
  body(0, L0 - 32, wt);
  p.R(0, wt - 3, L0 - 32, 4, WL); p.R(0, wt - 3, L0 - 32, 1, '#ffffff'); p.R(0, wt + 1, L0 - 32, 1, PE);
  for (let sx = 40; sx < L0 - 48; sx += 96){
    for (let k = 0; k < 28; k++){ const w = 6 + k, a = .4 * (1 - k / 28); x.fillStyle = `rgba(255,232,180,${a.toFixed(3)})`; x.fillRect(sx + 3 - w / 2, wt + 8 + k, w, 1); }
    for (let k = 0; k < 6; k++){ x.fillStyle = `rgba(255,236,190,${(.22 * (1 - k / 6)).toFixed(3)})`; x.fillRect(sx - 1 - k, wt - k, 8 + k * 2, 1); }
    p.R(sx, wt + 2, 7, 6, '#b9b4aa'); p.R(sx, wt + 2, 7, 1, '#d9d4ca'); p.R(sx + 6, wt + 2, 1, 6, '#8e8a82'); p.R(sx + 1, wt + 8, 5, 1, '#fff4d0');
  }
  // fachada de la casona a la derecha: más alta, con cornisa, ventanas en arco con persianas y el cartel verde
  const ft = H - 66;
  body(L1 + 32, W, ft);
  p.R(L1 + 32, ft - 6, W - L1 - 32, 7, WL); p.R(L1 + 32, ft - 6, W - L1 - 32, 1, '#ffffff'); for (let xx = L1 + 32; xx < W; xx += 4) p.R(xx, ft - 2, 2, 2, '#e4ddcf'); p.R(L1 + 32, ft + 1, W - L1 - 32, 1, PE);
  for (const wx of [L1 + 128, L1 + 288]){ if (wx + 20 > W) continue;
    p.R(wx - 18, ft + 12, 36, 44, '#f6f2ea'); pixEllipse(x, wx, ft + 14, 18, 10, '#f6f2ea');
    p.R(wx - 13, ft + 18, 26, 36, '#2f3836'); pixEllipse(x, wx, ft + 18, 13, 7, '#2f3836');
    for (let y = ft + 16; y < ft + 54; y += 3) p.R(wx - 12, y, 24, 1, '#4c5856');
    p.R(wx - 1, ft + 18, 2, 36, '#22292a'); p.R(wx - 20, ft + 55, 40, 3, '#fbf8f1'); p.R(wx - 20, ft + 58, 40, 1, PE);
  }
  { const gx = L1 + 44, gy = ft + 16; // el cartel de la agencia: un cubo negro con la cara verde iluminada (genérico)
    for (let r = 14; r > 0; r -= 2){ x.fillStyle = `rgba(90,230,90,${(.05 + (14 - r) * .006).toFixed(3)})`; x.fillRect(gx + 7 - r, gy + 7 - r, 14 + r * 2, 14 + r * 2); }
    p.R(gx, gy, 16, 16, '#151817'); p.R(gx + 2, gy + 2, 12, 12, '#46e24a'); p.R(gx + 2, gy + 2, 12, 1, '#a8ffa0'); p.R(gx + 4, gy + 6, 8, 2, '#eaffea'); p.R(gx + 4, gy + 9, 5, 1, '#eaffea');
    p.R(gx + 16, gy + 1, 3, 15, '#0d0f0e'); }
  // el portal: pilastras, columnas grises, entablamento con dentículos y el arco con la caracola
  const pt = 24;                                                          // arriba de las pilastras
  for (const [x0, side] of [[L0 - 32, -1], [L1, 1]]){
    p.R(x0, pt, 32, H - pt, '#f2ede2'); p.R(x0, pt, 32, 1, '#ffffff'); p.R(side < 0 ? x0 : x0 + 31, pt, 1, H - pt, PE);
    p.R(x0 + 3, H - 18, 26, 18, '#e4dfd4'); p.R(x0 + 3, H - 18, 26, 1, '#fbf8f1'); p.R(x0 + 3, H - 1, 26, 1, PE);   // base
    const k = x0 + 6;
    p.R(k, pt + 8, 20, H - pt - 26, '#8f9398'); p.R(k, pt + 8, 5, H - pt - 26, '#a9adb2'); p.R(k + 15, pt + 8, 5, H - pt - 26, '#72767b'); p.R(k + 19, pt + 8, 1, H - pt - 26, '#5e6267');
    p.R(k - 2, pt + 4, 24, 4, '#c9c4b8'); p.R(k - 2, pt + 4, 24, 1, '#e6e1d6'); p.R(k - 2, H - 20, 24, 3, '#b9b4a8');
  }
  p.R(L0 - 36, pt - 8, L1 - L0 + 72, 8, '#ece6da'); p.R(L0 - 38, pt - 10, L1 - L0 + 76, 3, '#f8f4ec'); p.R(L0 - 38, pt - 10, L1 - L0 + 76, 1, '#ffffff');
  for (let xx = L0 - 34; xx < L1 + 34; xx += 4) p.R(xx, pt - 5, 2, 3, '#d6cebe');
  p.R(L0 - 36, pt - 1, L1 - L0 + 72, 1, PE);
  for (let xx = L0 - 24; xx <= L1 + 24; xx++){ const t = (xx - cx) / (L1 - L0 + 48) * 2, top = pt - 10 - Math.round(10 * (1 - t * t)); p.R(xx, top, 1, pt - 9 - top, '#f4efe4'); p.P(xx, top, '#ffffff'); if (xx % 4 < 2) p.P(xx, top + 3, '#d6cebe'); }
  // el hueco: alto como para pasar caminando por abajo (no se pinta: se ve el patio)
  const openTop = xx => { const t = (xx - cx) / ((L1 - L0) / 2); return H - 92 - Math.round(16 * (1 - t * t)); };
  for (let xx = L0; xx < L1; xx++){ p.R(xx, pt, 1, openTop(xx) - pt, '#efe9de'); p.P(xx, openTop(xx) - 1, '#5a5650'); p.P(xx, openTop(xx) - 2, '#cfc8bb'); }
  const sy = openTop(cx) - 3;
  for (let i = 0; i <= 10; i++){ const a = Math.PI * (i / 10), r = 13; p.L(Math.round(cx), sy, Math.round(cx + Math.cos(Math.PI + a) * r), Math.round(sy - Math.sin(a) * r * .8), i % 2 ? '#d9d1c1' : '#fbf8f1'); }
  pixEllipse(x, cx, sy, 3, 2, '#e4ddcf');
  // las hojas del portón, abiertas contra el marco
  for (const [lx, dir] of [[L0, 1], [L1 - 9, -1]]){
    const t0 = openTop(lx + 4);
    for (let y = t0; y < H - 2; y++) p.R(lx, y, 9, 1, '#55585d');
    p.R(dir > 0 ? lx + 8 : lx, t0, 1, H - 2 - t0, '#3e4044');
    for (const y0 of [H - 82, H - 60, H - 38]) p.R(lx + 2, y0, 5, 16, '#64676c');
  }
  p.R(L0, H - 3, L1 - L0, 3, '#b9b3a6'); p.R(L0, H - 3, L1 - L0, 1, '#d4cfc4');   // umbral
  p.R(L0 - 10, H - 38, 6, 9, '#2a2c2e'); p.R(L0 - 10, H - 38, 6, 1, '#4a4c50'); p.R(L0 - 9, H - 35, 4, 1, '#6a6c70');   // buzón y portero junto al portón
  return c;
}
/* fuente redonda con chorro (el agua se anima) */
function fountainSprite(){
  if (SMALL_CACHE.fountain) return SMALL_CACHE.fountain;
  const c = document.createElement('canvas'); c.width = 104; c.height = 64; const x = c.getContext('2d'), cx = 52, cy = 28;
  pixEllipse(x, cx, cy + 12, 48, 22, '#8f8c84'); pixEllipse(x, cx, cy + 9, 48, 22, '#a9a69e');
  pixEllipse(x, cx, cy, 48, 22, '#d3d0c8'); pixEllipse(x, cx - 2, cy - 2, 44, 19, '#e1ded7');
  pixEllipse(x, cx, cy + 1, 40, 17, '#9da9ad'); pixEllipse(x, cx, cy + 2, 38, 15, '#5b5a3c');
  pixEllipse(x, cx + 4, cy + 5, 24, 8, '#6a6842');
  for (let i = 0; i < 46; i++){ const r = hash(i, 17), a = (r % 628) / 100, d = ((r >> 9) % 100) / 100; const px = Math.round(cx + 6 + Math.cos(a) * d * 22), py = Math.round(cy + 5 + Math.sin(a) * d * 8); x.fillStyle = i % 3 ? '#d9b84a' : '#b8902e'; x.fillRect(px, py, 2, 1); }
  x.fillStyle = '#2f3134'; x.fillRect(cx - 4, cy, 8, 3);
  return SMALL_CACHE.fountain = c;
}
function drawFountainWater(c, X, Y){
  const t = G.t / 1000, cx = X + 52, cy = Y + 28;
  for (let i = 0; i < 2; i++){ const k = ((t * .6) + i * .5) % 1, rx = Math.round(6 + k * 26), ry = Math.round(2 + k * 10);
    c.fillStyle = `rgba(200,220,215,${(.45 * (1 - k)).toFixed(2)})`; for (let a = 0; a < 6.29; a += .18) c.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + 2 + Math.sin(a) * ry), 2, 1); }
  const h = 16 + Math.round(Math.sin(t * 7) * 1.5);
  c.fillStyle = 'rgba(225,238,242,.9)'; c.fillRect(cx - 1, cy - h, 3, h); c.fillStyle = '#ffffff'; c.fillRect(cx, cy - h, 1, h - 2);
  for (let i = 0; i < 6; i++){ const k = ((t * 1.3) + i / 6) % 1, dx = (i % 2 ? 1 : -1) * (2 + i), px = Math.round(cx + dx * k * 1.4), py = Math.round(cy - h + (k * k * 26) - k * 6); c.fillStyle = 'rgba(235,245,248,.85)'; c.fillRect(px, py, 2, 2); }
}

function buildOutside(){
  useMap('outside');
  const W = MW*32, H = MH*32, PROPS = [], bulbs = [];
  const map32 = document.createElement('canvas'); map32.width = W; map32.height = H;
  const b = map32.getContext('2d');
  const img = b.createImageData(W, H), d = img.data;
  const P0 = hx('#ddd5c4'), PL = hx('#ebe5d8'), PG = hx('#c3baa7');
  const RD = hx('#5b5e68'), RL = hx('#666a74'), VD = hx('#cdc4b1');
  const garden = (tx, ty) => tx <= 6 && ty >= 5 && ty <= 7;
  const put = (i, c) => { d[i] = c[0]; d[i+1] = c[1]; d[i+2] = c[2]; d[i+3] = 255; };
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++){
    const tx = px >> 5, ty = py >> 5, lx = px & 31, ly = py & 31, ch = MAP[ty][tx], i = (py*W + px)*4;
    if (ch === 'r'){ put(i, hash(px >> 1, py >> 1) % 100 < 8 ? RL : RD); if (py >= 20*32 && py < 20*32 + 4) put(i, hx('#8f8a80')); if (Math.abs(py - 21*32) < 2 && (px % 64) < 34) put(i, hx('#f5e3cf')); }
    else if (ty === 19){ const qx = px & 15, qy = py & 15, rr = Math.hypot(qx - 7.5, qy - 7.5); put(i, (qx === 0 || qy === 0) ? PG : (rr > 4.3 && rr < 5.6) || (rr < 1.3) ? VD : (qx + qy) % 7 === 0 && rr > 6 ? VD : P0); if (ly > 29) put(i, PG); }
    else if (garden(tx, ty)) put(i, gravelAt(px, py));
    else put(i, mosaicAt(px, py));
  }
  b.putImageData(img, 0, 0);
  // hojas caídas sobre el mosaico
  for (let i = 0; i < 160; i++){ const r = hash(i, 404), px = r % W, py = 5*32 + (r >> 10) % (13*32), ch = MAP[py >> 5][px >> 5]; if (ch !== ',') continue; b.fillStyle = ['#c9a24a', '#a8743c', '#d9bf6a', '#8a5a30'][i % 4]; b.fillRect(px, py, 3, 2); b.fillStyle = 'rgba(43,36,72,.25)'; b.fillRect(px + 1, py + 2, 2, 1); }
  // cordón de la vereda
  b.fillStyle = '#efe9dc'; b.fillRect(0, 20*32 - 4, W, 4); b.fillStyle = '#9a9283'; b.fillRect(0, 20*32, W, 2);
  // borde de piedra entre el jardín y el mosaico
  b.fillStyle = '#9b968c'; b.fillRect(0, 8*32 - 2, 7*32, 2); b.fillRect(7*32 - 2, 5*32, 2, 3*32 - 2); b.fillStyle = '#c9c4b8'; b.fillRect(0, 8*32 - 3, 7*32, 1);
  // muros, casona, portón y quincho
  drawGardenWall(b, 0, 0, 7*32, 5*32, bulbs);
  drawGateWall(b, 23*32, 0, 7*32, 5*32);
  b.fillStyle = PX.shadowS; b.fillRect(0, 5*32, 7*32, 5); b.fillRect(23*32, 5*32, 7*32, 5);
  drawVilla(b, 7*32, 0, 16*32, 7*32);
  b.fillStyle = PX.shadowS; b.fillRect(7*32, 7*32, 16*32, 5); b.fillStyle = PX.shadow; for (let y = 0; y < 4; y++) for (let x = (y & 1); x < 16*32; x += 2) b.fillRect(7*32 + x, 7*32 + 5 + y, 1, 1);
  drawSteps(b, 15*32, 7*32 + 3);
  drawPavilion(b, 1*32, 13*32, 6*32, 3*32);
  // la puerta de vidrio de la barbacoa, en el medio del frente vidriado (baldosa K)
  { const p = Pen(b, 4*32 + 3, 13*32 + 36), w = 26, h = 56; p.R(0, 0, w, h, '#2a2e33'); p.R(2, 2, w - 4, h - 4, '#7a8f98'); p.R(2, 2, w - 4, 10, '#8fa6b0'); p.L(5, h - 10, 18, 6, 'rgba(255,255,255,.4)'); p.R(w - 6, 26, 2, 8, '#c9ccd2'); p.R(-2, h, w + 4, 4, '#8a6a48'); p.R(-2, h, w + 4, 1, '#a88560'); }
  b.fillStyle = PX.shadowS; b.fillRect(1*32, 16*32, 6*32, 5);
  // objetos con volumen (se ordenan con los personajes)
  const add = (spr, ax, ay, sy, shadow) => PROPS.push({sy, draw: (c, cx, cy) => { const X = ax - cx*2, Y = ay - cy*2; if (shadow) pixEllipse(c, X + shadow[0], Y + shadow[1], shadow[2], shadow[3], PX.shadow); c.drawImage(spr, X, Y); }});
  const bottom = (spr, tx, ty, w = 1, dx = 0, dy = 2) => [tx*32 + (w*32 - spr.width)/2 + dx, ty*32 + 32 - spr.height + dy];
  const done = new Set();
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++){
    const ch = MAP[ty][tx], key = tx + ',' + ty;
    if (ch === 'n'){ const s = bananaSprite(tx + ty), [ax, ay] = bottom(s, tx, ty, 1, 0, 4); add(s, ax, ay, ty*16 + 15, [s.width/2, s.height - 6, 14, 4]); }
    if (ch === 'p'){ const s = birdSprite(tx * 3 + ty), [ax, ay] = bottom(s, tx, ty, 1, 0, 3); add(s, ax, ay, ty*16 + 15, [s.width/2, s.height - 5, 16, 4]); }
    if (ch === 't'){ const s = gardenTreeSprite(), [ax, ay] = bottom(s, tx, ty, 1, 0, 4); add(s, ax, ay, ty*16 + 15, [s.width/2, s.height - 6, 18, 5]); }
    if (ch === 'c'){ const s = cliviaSprite(tx), [ax, ay] = bottom(s, tx, ty, 1, 0, 2); add(s, ax, ay, ty*16 + 15, null); }
    if (ch === 'k'){ const s = bikesSprite(), [ax, ay] = bottom(s, tx, ty, 1, 6, 0); add(s, ax, ay, ty*16 + 15, null); }
    if (ch === 'o'){ const s = plantSprite(1), [ax, ay] = bottom(s, tx, ty, 1, 0, 2); add(s, ax, ay, ty*16 + 15, [s.width/2, s.height - 5, 11, 3]); }
    if (ch === 'm'){ const s = smallSprite('mailbox'), [ax, ay] = bottom(s, tx, ty); add(s, ax, ay, ty*16 + 15, [16, s.height - 4, 10, 3]); }
    if (ch === 'a' && MAP[ty][tx - 1] !== 'a'){ let w = 0; while (MAP[ty][tx + w] === 'a') w++; const s = aloeBedSprite(), [ax, ay] = bottom(s, tx, ty, w, 0, 2); add(s, ax, ay, ty*16 + 15, null); }
    if (ch === 'b' && MAP[ty][tx - 1] !== 'b'){ const s = blackBenchSprite(), [ax, ay] = bottom(s, tx, ty, 2, 0, 0); add(s, ax, ay, ty*16 + 15, [s.width/2, s.height - 3, 30, 4]); }
    if (ch === 'T' && !done.has(key)){
      let w = 0, h = 0; while (MAP[ty][tx + w] === 'T') w++; while (MAP[ty + h] && MAP[ty + h][tx] === 'T') h++;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) done.add((tx + i) + ',' + (ty + j));
      const s = pingPongSprite(), ax = tx*32 + (w*32 - s.width)/2, ay = (ty + h)*32 - s.height + 2;
      add(s, ax, ay, ty*16 - 1, [s.width/2, s.height - 6, 40, 7]);
    }
    if (ch === 'F' && !done.has(key)){
      for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) done.add((tx + i) + ',' + (ty + j));
      const s = fountainSprite(), ax = tx*32 + (96 - s.width)/2, ay = ty*32 + 2;
      PROPS.push({sy: ty*16 - 1, draw: (c, cx, cy) => { const X = ax - cx*2, Y = ay - cy*2; c.drawImage(s, X, Y); drawFountainWater(c, X, Y); }});
    }
    if (ch === 'h' && !done.has(key)){
      const group = new Set([key]), q = [[tx, ty]];
      while (q.length){ const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const k = (x + dx) + ',' + (y + dy); if (!group.has(k) && tileAt(x + dx, y + dy) === 'h'){ group.add(k); q.push([x + dx, y + dy]); } } }
      let x0 = 99, y0 = 99, x1 = 0, y1 = 0; for (const k of group){ const [x, y] = k.split(',').map(Number); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); done.add(k); }
      const s = hedgeGroupSprite(group, x0, y0, x1 - x0 + 1, y1 - y0 + 1), ax = x0*32 - s.m, ay = y0*32 - s.rise - s.m;
      PROPS.push({sy: y0*16 - 1, draw: (c, cx, cy) => c.drawImage(s, ax - cx*2, ay - cy*2)});
    }
  }
  { // el frente se dibuja delante de todo lo que está en el patio: quien cruza el portón pasa por abajo del arco.
    // Si estás parado justo detrás del portal, la parte de arriba (el arco) se vuelve translúcida para no taparte.
    const s = frontFenceSprite(W), y0 = 19*32 - s.height, P0 = 12*32, P1 = 18*32, top = s.height - 50;
    let fade = 1;
    PROPS.push({sy: 18*16 - 1, draw: (c, cx, cy) => {
      const behind = CURMAP.id === 'outside' && G.x >= 12 && G.x <= 17 && G.y >= 14 && G.y <= 16;
      fade += ((behind ? .38 : 1) - fade) * .18;
      c.fillStyle = PX.shadow; c.fillRect(-cx*2, 19*32 - cy*2, W, 4);
      if (fade > .98){ c.drawImage(s, -cx*2, y0 - cy*2); return; }
      c.drawImage(s, 0, 0, P0, s.height, -cx*2, y0 - cy*2, P0, s.height);
      c.drawImage(s, P1, 0, W - P1, s.height, P1 - cx*2, y0 - cy*2, W - P1, s.height);
      c.drawImage(s, P0, top, P1 - P0, s.height - top, P0 - cx*2, y0 + top - cy*2, P1 - P0, s.height - top);
      c.save(); c.globalAlpha = fade; c.drawImage(s, P0, 0, P1 - P0, top, P0 - cx*2, y0 - cy*2, P1 - P0, top); c.restore();
    }});
  }
  Object.assign(MAPS.outside, {canvas: map32, props: PROPS, leds: bulbs.map(([x, y], i) => ({x, y, k: i % 3, bulb: true})), steam: []});
}
/* Sahi hace jueguitos con la paleta mientras espera rival */
function drawPingPong(c, X, Y, n){
  const dir = n.dir; if (dir === 'up') return;
  const hx0 = X + (dir === 'left' ? -2 : dir === 'right' ? 24 : -2), hy = Y + 2;
  c.fillStyle = '#5a3a20'; c.fillRect(hx0 + 4, hy + 6, 2, 5);
  pixEllipse(c, hx0 + 5, hy + 3, 5, 4, '#1f1f22'); pixEllipse(c, hx0 + 5, hy + 3, 4, 3, '#c9302c'); c.fillStyle = '#e8615a'; c.fillRect(hx0 + 3, hy + 1, 2, 1);
  const t = G.busy ? 0 : (G.t % 560) / 560, h = Math.round(Math.sin(t * Math.PI) * 16);
  pixEllipse(c, hx0 + 5, hy - 2 - h, 2, 2, '#c9761e'); c.fillStyle = '#ffb054'; c.fillRect(hx0 + 4, hy - 3 - h, 1, 1);
}
