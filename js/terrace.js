/* Terraza de Montserrat con cielo según la hora */
"use strict";
/* ================= LA TERRAZA (donde está Montserrat) ================= */
/* el cielo sigue al reloj del juego: día, atardecer (desde las 16:30) y noche (desde las 19); con lluvia, gris */
const skyPhase = () => { const m = gameMin(); return m < 16*60 + 30 ? 'mañana' : m < 19*60 ? 'tarde' : 'noche'; };
const skyKey = () => skyPhase() + (S && rainy() ? '-lluvia' : '');
function skyPalette(){
  const t = skyPhase();
  if (S && rainy()) return t === 'noche' ? {sky: ['#1c1e2a', '#2e3240'], city: ['#262833', '#33363f'], win: '#e8dca0', lit: .6, sun: null, grey: true}
    : {sky: ['#7d8794', '#a9b1bb'], city: ['#6f7a86', '#8a949e'], win: '#d8dee4', lit: t === 'tarde' ? .25 : 0, sun: null, grey: true};
  if (t === 'mañana') return {sky: ['#7cc4e6', '#cdeaf6'], city: ['#8fb3c4', '#a9c8d6'], win: '#e8f6fb', lit: 0, sun: '#fff6c8'};
  if (t === 'tarde') return {sky: ['#f29a6a', '#fbd9a0'], city: ['#8a5a7a', '#a87a8a'], win: '#fde3b0', lit: .25, sun: '#ffd27a'};
  return {sky: ['#1e1630', '#3b2752'], city: ['#2a2236', '#3a3048'], win: '#f7e7a1', lit: .7, sun: null};
}
function buildTerrace(){
  useMap('terrace');
  const W = MW*32, H = MH*32, PROPS = [];
  const map32 = document.createElement('canvas'); map32.width = W; map32.height = H;
  const b = map32.getContext('2d');
  const sp = skyPalette();
  // cielo y ciudad
  { const SH = 3*32 + 16, n = 6; for (let i = 0; i < n; i++){ const col = mixC(sp.sky[0], sp.sky[1], i / (n - 1)), y0 = Math.floor(i * SH / n), y1 = Math.floor((i + 1) * SH / n);
      b.fillStyle = col; b.fillRect(0, y0, W, y1 - y0);
      if (i < n - 1){ b.fillStyle = mixC(sp.sky[0], sp.sky[1], (i + 1) / (n - 1)); for (let y = y1 - 3; y < y1; y++) for (let x = (y & 1) + (y === y1 - 3 ? (y & 2) : 0); x < W; x += (y === y1 - 3 ? 4 : 2)) b.fillRect(x, y, 1, 1); } } }
  if (sp.sun){ pixEllipse(b, W*.78, 30, 20, 20, 'rgba(255,240,200,.25)'); pixEllipse(b, W*.78, 30, 14, 14, sp.sun); pixEllipse(b, W*.78 - 4, 26, 6, 6, '#ffffff'); }
  else for (let i = 0; i < 40; i++){ const r = hash(i, 7); b.fillStyle = i % 5 ? '#c8bffa' : '#ffffff'; b.fillRect(r % W, (r >> 9) % 60, 2, 2); }
  for (let i = 0; i < 5; i++){ const r = hash(i*3, 11); b.fillStyle = sp.sun ? 'rgba(255,255,255,.7)' : 'rgba(200,191,250,.12)'; const cx = (r % W), cy = 20 + (r >> 8) % 30; b.fillRect(cx, cy, 34, 6); b.fillRect(cx + 6, cy - 4, 20, 4); }
  const layer = (col, minH, maxH, seed, winP) => {
    let x = 0;
    while (x < W){ const r = hash(x + seed, seed), w = 26 + (r % 40), h = minH + ((r >> 6) % (maxH - minH)), top = 3*32 + 14 - h;
      b.fillStyle = col; b.fillRect(x, top, w, h + 4);
      if ((r >> 3) % 3 === 0){ b.fillRect(x + w/2 - 2, top - 10, 3, 10); }
      for (let wy = top + 6; wy < top + h - 4; wy += 8) for (let wx = x + 4; wx < x + w - 5; wx += 7){ const lit = (hash(wx, wy + seed) % 100) / 100 < winP; b.fillStyle = lit ? sp.win : mixC(col, '#ffffff', .12); b.fillRect(wx, wy, 3, 4); }
      x += w + 2; }
  };
  layer(sp.city[1], 30, 70, 5, sp.lit * .5);
  layer(sp.city[0], 20, 55, 19, sp.lit);
  // piso de madera
  for (let ty = 3; ty < MH; ty++) for (let tx = 0; tx < MW; tx++){
    const X = tx*32, Y = ty*32;
    for (let p = 0; p < 4; p++){ b.fillStyle = (p + tx) % 2 ? '#b98a52' : '#ad7f48'; b.fillRect(X, Y + p*8, 32, 8); b.fillStyle = '#8a6234'; b.fillRect(X, Y + p*8 + 7, 32, 1); const j = hash(tx*5 + p, ty) % 28; b.fillRect(X + j, Y + p*8, 1, 7); b.fillStyle = '#cfa068'; b.fillRect(X + (j + 9) % 28, Y + p*8 + 2, 6, 1); }
  }
  // baranda superior y bordes
  b.fillStyle = 'rgba(30,22,48,.25)'; b.fillRect(0, 4*32, W, 10);
  for (let x = 6; x < W; x += 24){ b.fillStyle = '#3a4048'; b.fillRect(x, 3*32 + 4, 4, 28); b.fillStyle = '#5a626c'; b.fillRect(x, 3*32 + 4, 1, 28); }
  b.fillStyle = '#2b3138'; b.fillRect(0, 3*32, W, 7); b.fillStyle = '#7a848e'; b.fillRect(0, 3*32, W, 2);
  b.fillStyle = '#4a525c'; b.fillRect(0, 3*32 + 20, W, 3);
  for (const x of [0, W - 32]){ b.fillStyle = '#3a4048'; b.fillRect(x + (x ? 22 : 4), 3*32, 6, H - 3*32); b.fillStyle = '#7a848e'; b.fillRect(x + (x ? 22 : 4), 3*32, 2, H - 3*32); }
  b.fillStyle = '#5a5248'; b.fillRect(0, (MH - 1)*32, W, 32); b.fillStyle = '#7a7064'; b.fillRect(0, (MH - 1)*32, W, 4);
  // puerta de la escalera
  { const X = 8*32, Y = (MH - 2)*32; b.fillStyle = '#26332b'; b.fillRect(X - 4, Y + 18, 40, 46); b.fillStyle = '#4a3418'; b.fillRect(X, Y + 22, 32, 42); for (let k = 0; k < 3; k++){ b.fillStyle = mixC('#6b4f30', '#b08552', k*.3); b.fillRect(X + 2, Y + 50 - k*10, 28, 6); } }
  // guirnalda de luces
  const bulbs = [];
  for (let x = 0; x <= W; x += 6){ const y = 4*32 + 6 + Math.round(Math.sin(x / W * Math.PI * 3) * -10 + 10); b.fillStyle = '#2a2236'; b.fillRect(x, y, 6, 1); if (x % 30 === 0) bulbs.push([x, y + 2]); }
  // plantas, bancos y mesita
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++){
    const ch = MAP[ty][tx];
    if (ch === 'p'){ const p = {x: tx, y: ty, v: hash(tx, ty) % 3, sy: ty*TS + 15}; p.draw = (c, cx, cy) => drawProp(c, p, cx, cy); PROPS.push(p); }
    if (ch === 'b' && MAP[ty][tx - 1] !== 'b'){ const s = smallSprite('bench'); const ax = tx*32 - 2, ay = ty*32 + 32 - s.height + 2; PROPS.push({sy: ty*16 + 15, draw: (c, cx, cy) => { pixEllipse(c, ax - cx*2 + 34, ay - cy*2 + s.height - 4, 30, 4, 'rgba(30,22,48,.24)'); c.drawImage(s, ax - cx*2, ay - cy*2); }}); }
    if (ch === 'c'){ const X = tx*32, Y = ty*32; PROPS.push({sy: ty*16 + 15, draw: (c, cx, cy) => { const x = X - cx*2, y = Y - cy*2; pixEllipse(c, x + 16, y + 28, 12, 3, 'rgba(30,22,48,.24)'); c.fillStyle = '#26332b'; c.fillRect(x + 14, y + 14, 4, 14); pixEllipse(c, x + 16, y + 12, 13, 5, '#2b3138'); pixEllipse(c, x + 16, y + 11, 12, 4, '#fbfaf4'); c.fillStyle = '#fe7a02'; c.fillRect(x + 9, y + 6, 5, 5); c.fillStyle = '#92c100'; c.fillRect(x + 18, y + 6, 5, 5); }}); }
  }
  Object.assign(MAPS.terrace, {sky: skyKey(), canvas: map32, props: PROPS, leds: bulbs.map(([x, y], i) => ({x, y, k: i % 3, bulb: true})), steam: []});
}
