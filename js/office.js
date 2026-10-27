/* La oficina: pisos, paredes, objetos de pared y muebles */
"use strict";
/* ================= LA OFICINA (pixel art a resolución real) =================
   Capas: piso por píxel (con juntas y vetas), sombras de pared, paredes con zócalo,
   objetos de pared (pizarras, ventanas, bibliotecas) y después los muebles como
   objetos con volumen que se ordenan por profundidad junto con los personajes. */
const GLYPH = {n:['1001','1101','1011','1001','1001'], T:['111','010','010','010','010'], O:['111','101','101','101','111'], H:['101','101','111','101','101'], D:['110','101','101','101','110'], K:['101','101','110','101','101'], P:['110','101','110','100','100'], '+':['000','010','111','010','000'], '%':['101','001','010','100','101'], '1':['010','110','010','010','111'], '2':['110','001','010','100','111'], L:['100','100','100','100','111'], A:['010','101','111','101','101'], G:['011','100','101','101','011'], E:['111','100','110','100','111'], N:['101','111','111','111','101'], C:['011','100','100','100','011'], I:['111','010','010','010','111'], ' ':['000','000','000','000','000']};
function pixText(c, text, x, y, col, s = 1){ c.fillStyle = col; let cx = x; for (const ch of text){ const g = GLYPH[ch] || GLYPH[' ']; g.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '1') c.fillRect(cx + i*s, y + j*s, s, s); }); cx += (g[0].length + 1)*s; } }
const WALLISH = new Set(['#', 'H', 'W', 'B', 'V', 'M', 'Y', 'G', 'J', 'I', 'e', 'r', 'j']);
const FACE_OBJ = 'HWBVMYGJIerj';
const FLOORS = {
  wood:   {a: '#e0bc88', b: '#d8b37e', s: '#b88e5d', h: '#eac99a', k: '#c9a06c'},
  wood2:  {a: '#b98a5e', b: '#b08156', s: '#855b3b', h: '#c79a6d', k: '#9b6f48'},
  cli:    {a: '#e7d1aa', b: '#e0c9a1', s: '#c3a67b', h: '#f0ddbb', k: '#d1b489'},
  mat:    {a: '#a9bd94', b: '#a3b78d', s: '#80976f', h: '#bacba7', k: '#95aa83'},
  tile:   {a: '#f1ebdf', b: '#d8e1cb', s: '#c4bca8', h: '#f9f6ee', k: '#cad4bc'},
  carpet: {a: '#bcc5b7', b: '#b5bfb0', s: '#a1ac9d', h: '#c8d0c4', k: '#aab4a6'},
  tech:   {a: '#bfc4bb', b: '#b6bcb1', s: '#8f968c', h: '#d1d5cc', k: '#a0a79d'},
  calm:   {a: '#ddd5f0', b: '#d6cdeb', s: '#beb3dd', h: '#e9e3f7', k: '#cac0e5'},
  herring:{a: '#b98149', b: '#a9733f', s: '#74491f', h: '#cf9a62', k: '#93602f'},
  terrazzo:{a: '#ebe7de', b: '#e2ddd2', s: '#c4bbab', h: '#f6f3ec', k: '#ad9f8c'},
  pine:   {a: '#c98d52', b: '#bf8449', s: '#8a572b', h: '#daa36b', k: '#a8713d'},
  brasil: {a: '#b0703f', b: '#a5683a', s: '#6a3a1c', h: '#c78550', k: '#8e5530'},
  studio: {a: '#d8d9d5', b: '#d1d2ce', s: '#b8bab5', h: '#e6e7e3', k: '#c3c5c0'},
  // mármol claro en lajas de la barbacoa y mármol negro con vetas blancas del baño
  marble: {a: '#ece5d8', b: '#e4dccd', s: '#c9bfae', h: '#f6f1e8', k: '#d6cbb8'},
  bath:   {a: '#26262b', b: '#2d2d33', s: '#141417', h: '#3c3c44', k: '#9a9aa4'},
};
const WALLS = {
  mat:    {p: '#e2e9d5', s: '#d6dfc8', w: '#87a173'},
  wood:   {p: '#f2e8d4', s: '#e9ddc6', w: '#c69c6a'},
  wood2:  {p: '#ece0cb', s: '#e1d3bb', w: '#9c6c42'},
  tile:   {p: '#e6eddf', s: '#dbe4d2', w: '#f4f1ea'},
  carpet: {p: '#f0e7d6', s: '#e6dbc7', w: '#bb8b5c'},
  tech:   {p: '#dce1d8', s: '#d0d6cd', w: '#8d9891'},
  calm:   {p: '#e8e2f5', s: '#ded7f0', w: '#ab9fd8'},
  cli:    {p: '#f1e3ca', s: '#e7d7bc', w: '#b18054'},
  herring:{p: '#efebe2', s: '#e7e2d7', w: '#4a2c20'},
  terrazzo:{p: '#f3f0e9', s: '#ebe7df', w: '#b8aa96'},
  pine:   {p: '#f5f3ee', s: '#edeae3', w: '#5a3824'},
  brasil: {p: '#f6f2ea', s: '#efeae0', w: '#4a2a1c'},
  studio: {p: '#eeedea', s: '#e5e4e0', w: '#8d9399'},
  marble: {p: '#ebe7f1', s: '#e2ddea', w: '#b9b0c9'},
  bath:   {p: '#f4f2ea', s: '#e4e0d4', w: '#26262b'},
};
const TERRA_RED = hx('#b07a66');
const FLOOR_RGB = Object.fromEntries(Object.entries(FLOORS).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([a, b]) => [a, hx(b)]))]));
const zoneNear = (tx, ty) => zoneAt(tx, ty) || zoneAt(tx, ty + 1) || zoneAt(tx, ty - 1) || zoneAt(tx - 1, ty) || zoneAt(tx + 1, ty);
const floorKind = (tx, ty) => { const z = zoneNear(tx, ty); return z ? z.floor : 'wood'; };
function floorPx(k, x, y){
  const F = FLOOR_RGB[k] || FLOOR_RGB.wood;
  if (k === 'herring'){ // parquet en espiga
    const col = x >> 3, lx = x & 7, t = y + (col & 1 ? lx : 7 - lx), idx = Math.floor(t / 14), lt = t % 14;
    if (lx === 0 || lt === 0) return F.s;
    if (lt === 1) return F.h;
    if (hash(x >> 1, y >> 1) % 41 === 0) return F.k;
    const v = hash(col, idx) % 3; return v === 0 ? F.a : v === 1 ? F.b : F.k;
  }
  if (k === 'terrazzo'){ const n = hash(x, y) % 100; return n < 2 ? F.k : n < 3 ? TERRA_RED : n < 6 ? F.s : n < 9 ? F.h : (hash(x >> 1, y >> 1) % 4 ? F.a : F.b); }
  if (k === 'marble'){ // lajas irregulares de mármol claro
    const cx = Math.floor((x + (hash(y >> 4, 5) % 9)) / 24), cy = Math.floor((y + (hash(x >> 4, 9) % 7)) / 20), h = hash(cx, cy), lx = (x + (hash(y >> 4, 5) % 9)) % 24, ly = (y + (hash(x >> 4, 9) % 7)) % 20;
    if (lx === 0 || ly === 0) return F.s;
    if (hash(x >> 1, y >> 1) % 37 === 0) return F.k;
    return h % 3 === 0 ? F.b : h % 3 === 1 ? F.a : F.h;
  }
  if (k === 'bath'){ // baldosas de mármol negro con vetas blancas
    const lx = x & 31, ly = y & 31;
    if (lx === 31 || ly === 31) return F.s;
    const v = (x * 3 + y * 2 + hash(x >> 5, y >> 5) * 7) % 41; if (v === 0 && hash(x, y) % 3) return F.k;
    return ((x >> 5) + (y >> 5)) & 1 ? F.a : F.b;
  }
  if (k === 'studio'){ const n = hash(x >> 1, y >> 1) % 100; return n < 4 ? F.s : n < 8 ? F.h : (hash(x >> 4, y >> 4) & 1 ? F.a : F.b); }
  if (k === 'wood' || k === 'wood2' || k === 'cli' || k === 'pine' || k === 'brasil'){
    const r = y >>> 3, ly = y & 7, X = x + (hash(r, 3) % 64), pl = Math.floor(X / 64), lx = X & 63, h = hash(pl, r);
    if (ly === 7 || lx === 0) return F.s;
    if (lx === 1) return F.h;
    if ((ly === 2 || ly === 4) && (hash((X >>> 2) + pl*13, r*7 + ly) % 6) === 0) return F.k;
    if (ly === 0 && h % 3 === 0 && lx > 3 && lx < 40) return F.h;
    return h & 1 ? F.a : F.b;
  }
  if (k === 'mat'){
    const lx = x & 31, ly = y & 31;
    if (lx === 31 || ly === 31) return F.s;
    if (lx === 0 || ly === 0) return F.h;
    if (hash(x >>> 1, y >>> 1) % 29 === 0) return F.k;
    return ((x >>> 5) + (y >>> 5)) & 1 ? F.a : F.b;
  }
  if (k === 'tile'){
    const lx = x & 15, ly = y & 15;
    if (lx === 15 || ly === 15) return F.s;
    if (lx === 0 || ly === 0) return F.h;
    return ((x >>> 4) + (y >>> 4)) & 1 ? F.a : F.b;
  }
  if (k === 'carpet'){
    const lx = x & 31, ly = y & 31;
    if (lx === 31 || ly === 31) return F.s;
    const hor = ((x >>> 5) + (y >>> 5)) & 1;
    if (hor ? (ly & 3) === 1 : (lx & 3) === 1) return F.k;
    return hash(x >>> 1, y >>> 1) % 31 === 0 ? F.h : F.a;
  }
  if (k === 'tech'){
    const lx = x & 15, ly = y & 15;
    if (lx === 15 || ly === 15) return F.s;
    if (lx === 0 || ly === 0) return F.h;
    if (hash(x >>> 4, y >>> 4) % 3 === 0 && (lx & 3) === 2 && (ly & 3) === 2 && lx > 1 && lx < 14 && ly > 1 && ly < 14) return F.k;
    return F.a;
  }
  const n = hash(x, y) % 23;
  return n === 0 ? F.h : n === 1 ? F.k : F.a;
}
const isWall = (tx, ty) => WALLISH.has(tileAt(tx, ty));
const isFace = (tx, ty) => { const t = tileAt(tx, ty); return FACE_OBJ.includes(t) || (t === '#' && ty + 1 < MH && !isWall(tx, ty + 1)); };
const isUpper = (tx, ty) => tileAt(tx, ty) === '#' && FACE_OBJ.includes(tileAt(tx, ty + 1));

/* ---------- paredes ---------- */
function wallKind(tx, ty){ for (let k = 1; k <= 2; k++){ const z = zoneAt(tx, ty + k); if (z) return z.floor; } const z = zoneNear(tx, ty + 1); return z ? z.floor : 'wood'; }
function stripes(p, tx, y0, y1, W){ p.R(0, y0, 32, y1 - y0, W.p); for (let x = 0; x < 32; x++) if (((tx*32 + x) % 8) === 0) p.R(x, y0, 1, y1 - y0, W.s); }
function wallFace(p, tx, ty, cap){
  const kind = wallKind(tx, ty), W = WALLS[kind] || WALLS.wood, w = rampOf(W.w);
  let y = 0;
  if (cap){ p.R(0, 0, 32, 5, PX.cap); p.R(0, 0, 32, 1, PX.capL); p.R(0, 4, 32, 1, PX.capD); p.R(0, 5, 32, 1, shd(W.p, .32)); y = 6; }
  if (kind === 'tile'){
    stripes(p, tx, y, 14, W);
    for (let j = 14; j < 31; j += 4){ p.R(0, j, 32, 4, '#f6f3ec'); p.R(0, j + 3, 32, 1, '#d5d0c4'); for (let x = ((j >>> 2) & 1) * 4; x < 32; x += 8) p.R(x, j, 1, 3, '#d5d0c4'); }
    p.R(0, 13, 32, 1, '#cfc8b6'); p.R(0, 31, 32, 1, shd('#d5d0c4', .3));
    return;
  }
  if (kind === 'bath'){ // azulejos blancos con la guarda de mármol negro arriba y el zócalo negro abajo
    p.R(0, y, 32, 3, '#26262b'); for (let j = y + 3; j < 26; j += 8){ p.R(0, j, 32, 8, '#f4f2ea'); p.R(0, j + 7, 32, 1, '#d9d4c8'); for (let x = 0; x < 32; x += 8) p.R(x, j, 1, 7, '#e2ddd0'); }
    p.R(0, 26, 32, 6, '#26262b'); p.R(0, 26, 32, 1, '#4a4a52'); p.R(0, 31, 32, 1, '#141417'); return;
  }
  if (kind === 'brasil'){ stripes(p, tx, y, 27, W); p.R(0, 27, 32, 1, w.l); p.R(0, 28, 32, 3, w.m); p.R(0, 28, 32, 1, w.h); p.R(0, 31, 32, 1, shd(W.w, .55)); return; }
  stripes(p, tx, y, 18, W);
  p.R(0, 18, 32, 1, w.h); p.R(0, 19, 32, 1, w.d);
  p.R(0, 20, 32, 8, w.m);
  for (const px of [0, 16]){ p.R(px + 2, 21, 12, 1, w.d); p.R(px + 2, 22, 1, 5, w.d); p.R(px + 3, 26, 11, 1, w.l); p.R(px + 13, 22, 1, 4, w.l); }
  p.R(0, 28, 32, 3, w.e); p.R(0, 28, 32, 1, w.d); p.R(0, 31, 32, 1, shd(W.w, .55));
}
function wallUpper(p, tx, ty){
  const W = WALLS[wallKind(tx, ty)] || WALLS.wood;
  p.R(0, 0, 32, 6, PX.cap); p.R(0, 0, 32, 1, PX.capL); p.R(0, 5, 32, 1, PX.capD); p.R(0, 6, 32, 1, shd(W.p, .32));
  stripes(p, tx, 7, 32, W);
  if (wallKind(tx, ty) === 'brasil'){ // moldura de yeso con dentículos, como en la foto
    p.R(0, 7, 32, 8, '#ece6d8'); p.R(0, 7, 32, 1, '#fbf8f1'); p.R(0, 9, 32, 1, '#d9d1c1');
    for (let x = (tx * 32) % 4 ? 1 : 0; x < 32; x += 4){ p.R(x, 10, 2, 3, '#f8f4ec'); p.R(x + 2, 10, 1, 3, '#cfc6b4'); }
    p.R(0, 13, 32, 1, '#d9d1c1'); p.R(0, 14, 32, 1, shd('#f6f2ea', .12));
  }
}
function wallCap(p, tx, ty){
  p.R(0, 0, 32, 32, PX.cap);
  for (let y = 4; y < 32; y += 8) for (let x = (y >>> 3) & 1 ? 4 : 0; x < 32; x += 8) p.P(x + 2, y, shd(PX.cap, .12));
  if (!isWall(tx - 1, ty)) p.R(0, 0, 1, 32, PX.capL);
  if (!isWall(tx + 1, ty)) p.R(31, 0, 1, 32, PX.capD);
  if (!isWall(tx, ty - 1)) p.R(0, 0, 32, 1, PX.capL);
}
/* marcos de puerta en los huecos de las paredes */
function doorJambs(p, tx, ty){
  const W = WALLS[wallKind(tx, ty)] || WALLS.wood, j = rampOf(W.w);
  if (!isWall(tx - 1, ty)){ p.R(0, 5, 3, 27, j.m); p.R(0, 5, 1, 27, j.l); p.R(2, 5, 1, 27, j.e); }
  if (!isWall(tx + 1, ty)){ p.R(29, 5, 3, 27, j.m); p.R(29, 5, 1, 27, j.l); p.R(31, 5, 1, 27, j.e); }
}
/* adornos en paredes sueltas */
function wallDecor(p, tx, ty){
  const z = zoneAt(tx, ty + 1), zn = z ? z.n : '', h = hash(tx*3 + 1, ty*5 + 2) % 9;
  if (!isWall(tx - 1, ty) || !isWall(tx + 1, ty)) return;
  if (zn === 'Cocina' || zn === 'Archivos X' || zn === 'Guaná' || zn === 'La Base') return;
  if (CURMAP.id === 'office' && ty === 17 && tx >= 11 && tx <= 21) return;
  const pal = [PX.orange, PX.lime, PX.lav, PX.plum, PX.teal][tx % 5];
  if (h === 0){ // cuadro
    p.R(8, 7, 16, 12, '#5a4030'); p.R(9, 8, 14, 10, '#f6f1e6'); p.R(10, 9, 12, 8, hil(pal, .55));
    p.E(13, 13, 2, 2, pal); p.R(16, 10, 5, 6, shd(pal, .1)); p.R(10, 15, 12, 2, rampOf(pal).d);
    p.R(8, 19, 16, 1, PX.shadow);
  } else if (h === 1){ // reloj
    p.E(16, 12, 6, 6, '#3a3040'); p.E(16, 12, 5, 5, '#fbf8ef'); p.R(16, 8, 1, 5, '#3a3040'); p.R(16, 12, 3, 1, PX.red); p.P(14, 9, '#ffffff');
  } else if (h === 2){ // estante con libros y planta
    p.R(5, 15, 22, 2, PX.walnut); p.R(5, 17, 22, 1, PX.shadow);
    [[7, '#c9604a', 7], [9, '#5f8fa8', 8], [11, '#e8c15a', 6]].forEach(([x, c, hh]) => { p.R(x, 15 - hh, 2, hh, c); p.R(x, 15 - hh, 2, 1, hil(c, .3)); });
    p.R(18, 10, 6, 5, '#d77c45'); p.R(18, 10, 6, 1, '#e99a62'); p.E(21, 8, 4, 3, PX.green); p.P(20, 6, PX.lime);
  } else if (h === 3){ // afiche
    p.R(9, 6, 14, 15, shd(pal, .15)); p.R(10, 7, 12, 13, pal); p.R(11, 8, 10, 6, hil(pal, .5)); p.R(11, 15, 8, 1, '#fbf8ef'); p.R(11, 17, 6, 1, '#fbf8ef');
  } else if (h === 4){ // tablero de corcho con notas
    p.R(6, 7, 20, 13, '#8a6a44'); p.R(7, 8, 18, 11, '#c99f6c');
    [[8, 9, PX.yellow], [14, 10, PX.pink], [19, 9, PX.lime], [10, 14, PX.lav], [17, 14, PX.orange]].forEach(([x, y, c]) => { p.R(x, y, 4, 4, c); p.R(x, y, 4, 1, hil(c, .35)); });
  } else if (h === 5){ p.R(24, 13, 3, 5, '#fbf8ef'); p.R(25, 14, 1, 2, '#c9c2b0'); }
}
/* pizarras, ventanas y bibliotecas: ocupan la pared alta y la baja (64 px) */
function runs(ch, y){ const out = []; let x = 0; while (x < MW){ if (MAP[y][x] === ch){ let x1 = x; while (x1 + 1 < MW && MAP[y][x1 + 1] === ch) x1++; out.push([x, x1]); x = x1 + 1; } else x++; } return out; }
function splitRun(n, max){ const k = Math.ceil(n / max), base = Math.floor(n / k), extra = n - base*k; return Array.from({length: k}, (_, i) => base + (i === Math.floor(k/2) ? extra : 0)); }
function whiteboard(c, X, Y, w, seed, custom){
  const p = Pen(c, X, Y), h = 30;
  p.R(0, 1, w, h, rampOf(PX.metal).e); p.R(1, 0, w - 2, h, PX.metal); p.R(1, 0, w - 2, 1, hil(PX.metal, .4));
  p.R(2, 2, w - 4, h - 5, '#fdfcf8'); p.R(2, 2, w - 4, 1, '#ffffff'); p.R(w - 4, 2, 2, h - 5, '#eceae2');
  p.R(1, h - 3, w - 2, 3, PX.steel); p.R(1, h - 3, w - 2, 1, PX.metal);
  [[6, PX.red], [10, '#3d6fb0'], [14, PX.green]].forEach(([x, col]) => p.R(x, h - 4, 3, 1, col));
  if (custom){ custom(p, w, h); return; }
  const v = seed % 4, cx = 6;
  if (v === 0){ for (let i = 0; i < Math.min(6, (w - 16) / 6); i++){ const bh = 4 + (hash(seed, i) % 12); p.R(cx + i*6, 22 - bh, 4, bh, [PX.orange, PX.plum, PX.green, PX.lav][i % 4]); } p.R(cx, 22, w - 14, 1, '#3a3040'); p.R(w - 22, 6, 14, 1, '#3a3040'); p.R(w - 22, 9, 10, 1, '#9a94a0'); p.R(w - 22, 12, 12, 1, '#9a94a0'); }
  else if (v === 1){ let yy = 18; for (let x = cx; x < w - 10; x += 3){ const ny = 8 + (hash(seed, x) % 12); p.L(x, yy, x + 3, ny, PX.plum); yy = ny; } p.R(w - 14, 5, 6, 6, PX.yellow); p.R(w - 14, 13, 6, 6, PX.pink); }
  else if (v === 2){ p.E(w / 2, 13, 5, 4, PX.orange); p.E(w / 2, 13, 4, 3, '#fdfcf8'); for (const [dx, dy] of [[-16, -6], [14, -5], [-14, 7], [16, 6]]){ p.L(w/2, 13, w/2 + dx, 13 + dy, '#9a94a0'); p.R(w/2 + dx - 3, 13 + dy - 2, 7, 4, [PX.lime, PX.lav, PX.yellow, PX.pink][(dx > 0) + (dy > 0)*2]); } }
  else { for (let i = 0; i < 4; i++) p.R(cx, 5 + i*4, 10 + (hash(seed, i) % 14), 1, '#5a5664'); [[w - 20, 5, PX.yellow], [w - 13, 6, PX.lime], [w - 19, 13, PX.pink]].forEach(([x, y, col]) => { p.R(x, y, 6, 6, col); p.R(x, y, 6, 1, hil(col, .4)); }); }
}
/* el pizarrón del status (como en la foto de Brasil): llamas y una botella de salsa picante arriba, "Brasil" con su
   banderita, y la grilla con las iniciales del equipo (FD, S, R, T, P y dos libres) y una fila por tema:
   personal (carita), laboral, salud, amor (corazón) y batería */
const MINI = {F: ['111', '100', '110', '100'], D: ['110', '101', '101', '110'], S: ['011', '100', '001', '110'], R: ['110', '101', '110', '101'], T: ['111', '010', '010', '010'], P: ['110', '101', '110', '100']};
function miniText(p, t, x, y, col){ for (const ch of t){ (MINI[ch] || []).forEach((r, j) => { for (let i = 0; i < 3; i++) if (r[i] === '1') p.P(x + i, y + j, col); }); x += 3; } }
function statusBoardArt(p, w, h){
  const K = '#2a2630', R = '#d24a3a', B = '#3d6fb0', lw = 7, cols = 6, cw = Math.floor((w - 9 - lw) / cols), hh = 6, rh = 3, gx = 4, gy = 7;
  const gw = lw + cw * cols, gh = hh + rh * 5;
  const flame = (x, y) => { p.R(x, y - 1, 3, 1, R); p.P(x + 1, y - 2, R); p.P(x, y - 3, R); p.P(x + 2, y - 2, '#f08a3a'); };
  flame(gx + lw + cw + 1, gy); flame(gx + lw + cw * 4 - 2, gy - 3); flame(gx + lw + cw * 5 - 2, gy);
  p.L(gx + lw + cw * 4 + 2, gy - 1, gx + lw + cw * 4 + 5, gy - 5, K); p.P(gx + lw + cw * 4 + 6, gy - 6, K);
  const fx = gx + gw - 8; p.R(fx, gy - 5, 7, 4, K); p.R(fx + 1, gy - 4, 5, 2, '#3f8a3a'); p.P(fx + 3, gy - 4, '#e7c53a'); p.P(fx + 3, gy - 3, B);
  p.R(gx, gy, gw + 1, 1, K); p.R(gx, gy + gh, gw + 1, 1, K); p.R(gx, gy + hh, gw + 1, 1, K);
  for (let r = 1; r < 5; r++) p.R(gx, gy + hh + r * rh, gw + 1, 1, K);
  p.R(gx, gy, 1, gh + 1, K); p.R(gx + lw, gy, 1, gh + 1, K); for (let c = 1; c <= cols; c++) p.R(gx + lw + c * cw, gy, 1, gh + 1, K);
  ['FD', 'S', 'R', 'T', 'P'].forEach((t, c) => { const tw = t.length * 3; miniText(p, t, gx + lw + c * cw + Math.max(1, Math.floor((cw - tw) / 2) + 1), gy + 1, c >= 3 ? B : K); });
  const iy = r => gy + hh + r * rh + 1;
  p.P(gx + 2, iy(0), K); p.P(gx + 4, iy(0), K); p.R(gx + 2, iy(0) + 1, 3, 1, K);
  p.R(gx + 1, iy(1), 5, 1, K); p.P(gx + 2, iy(1) + 1, K); p.P(gx + 4, iy(1) + 1, K);
  p.R(gx + 3, iy(2), 1, 2, R); p.R(gx + 2, iy(2), 3, 1, R);
  p.R(gx + 2, iy(3), 1, 1, R); p.R(gx + 4, iy(3), 1, 1, R); p.R(gx + 2, iy(3) + 1, 3, 1, R);
  p.R(gx + 1, iy(4), 4, 2, K); p.R(gx + 2, iy(4), 2, 1, B); p.P(gx + 5, iy(4), K);
}
function fedeBoard(p, w, h){
  const M = '#3a3040', cx = Math.round(w * .38);
  for (let i = 0; i < 3; i++) p.R(5, 5 + i * 3, [14, 10, 12][i], 1, i ? '#9a94a0' : M);
  const nodes = [[cx, 7, PX.orange], [cx + 9, 18, PX.plum], [cx - 9, 18, '#3f8a3a']];
  for (let i = 0; i < 3; i++){ const [x0, y0] = nodes[i], [x1, y1] = nodes[(i + 1) % 3]; p.L(x0, y0, x1, y1, '#9a94a0'); }
  for (const [x, y, col] of nodes){ p.E(x, y, 3, 2, col); p.E(x, y, 2, 1, '#fdfcf8'); }
  p.P(cx + 5, 12, M); p.P(cx + 6, 11, M); p.P(cx - 1, 19, M); p.P(cx - 2, 20, M); p.P(cx - 5, 12, M); p.P(cx - 6, 13, M);   // puntas de flecha
  // el mate: calabacita verde, bombilla y humito
  const mx = w - 12, my = 17, G = '#3f8a3a';
  p.E(mx, my, 5, 5, G); p.E(mx, my, 4, 4, '#fdfcf8'); p.R(mx - 3, my - 5, 7, 1, G); p.R(mx - 2, my + 1, 5, 1, '#b8d4a8');
  p.L(mx + 1, my - 4, mx + 4, my - 11, '#9a94a0'); p.R(mx + 4, my - 12, 2, 1, '#9a94a0');
  for (const dx of [-3, 0]) { p.P(mx + dx, my - 8, '#c9c4d0'); p.P(mx + dx + 1, my - 10, '#c9c4d0'); p.P(mx + dx, my - 12, '#c9c4d0'); }
}
function windowPane(c, X, Y, w, h = 36){
  const p = Pen(c, X, Y);
  p.R(0, 0, w, h, '#e8e1d2'); p.R(0, 0, w, 1, '#ffffff'); p.R(w - 1, 0, 1, h, '#c9bfa9');
  const gx = 3, gy = 3, gw = w - 6, gh = h - 8;
  const bands = ['#86c3e0', '#98cde6', '#abd8ec', '#c1e3f1'];
  for (let i = 0; i < gh; i++){ const b = Math.min(3, Math.floor(i / gh * 4)); p.R(gx, gy + i, gw, 1, bands[b]); if (b < 3 && (i % Math.ceil(gh / 4)) === Math.ceil(gh / 4) - 1) p.D(gx, gy + i, gw, 1, bands[b + 1], i); }
  p.R(gx + 4, gy + 5, 9, 2, '#ffffff'); p.R(gx + 6, gy + 4, 5, 1, '#ffffff'); p.R(gx + gw - 14, gy + 9, 8, 2, '#f4fbfe');
  p.R(gx, gy + gh - 9, 8, 9, '#9fb8c4'); p.R(gx + 8, gy + gh - 13, 7, 13, '#b2c7d0'); p.R(gx + 9, gy + gh - 11, 1, 1, '#e8f4f8'); p.R(gx + 12, gy + gh - 8, 1, 1, '#e8f4f8');
  p.E(gx + gw - 8, gy + gh - 3, 9, 6, PX.leaf); p.E(gx + gw - 11, gy + gh - 5, 5, 4, PX.green); p.P(gx + gw - 12, gy + gh - 7, '#8cc65a');
  p.R(gx, gy + gh - 1, gw, 1, '#7aa04c');
  p.R(Math.floor(w / 2) - 1, gy, 2, gh, '#e8e1d2'); p.R(gx, gy + Math.floor(gh / 2) - 1, gw, 2, '#e8e1d2');
  p.L(gx + 3, gy + 14, gx + 12, gy + 5, 'rgba(255,255,255,.55)'); p.L(gx + 6, gy + 15, gx + 14, gy + 7, 'rgba(255,255,255,.35)');
  p.R(-2, h - 4, w + 4, 4, '#d8c39f'); p.R(-2, h - 4, w + 4, 1, '#ecdcbc'); p.R(-2, h - 1, w + 4, 1, '#a88f6a');
}
const BOOK_COLS = ['#c9604a', '#5f8fa8', '#e8c15a', '#7d4c7b', '#6d9a4a', '#e98a35', '#cbc2ef', '#3d5a80', '#efe5d1'];
function bookshelf(c, X, Y, w, seed){
  const p = Pen(c, X, Y), h = 58, wd = rampOf(PX.walnut);
  p.R(0, 0, w, h, wd.o); p.R(1, 1, w - 2, h - 2, wd.m); p.R(1, 1, w - 2, 1, wd.l);
  const rows = 4, rh = Math.floor((h - 8) / rows);
  for (let r = 0; r < rows; r++){
    const y0 = 4 + r*rh;
    p.R(3, y0, w - 6, rh - 3, wd.e);
    let x = 4, k = hash(seed, r);
    while (x < w - 6){
      k = (k * 1103515245 + 12345) >>> 0;
      const kind = k % 11;
      if (kind === 0 && x < w - 12){ p.R(x, y0 + rh - 9, 6, 6, '#e0dccf'); p.R(x + 1, y0 + rh - 11, 4, 2, PX.green); x += 8; continue; }
      if (kind === 1 && x < w - 10){ p.R(x, y0 + rh - 7, 8, 4, '#c9a26b'); p.R(x, y0 + rh - 7, 8, 1, '#dcb985'); x += 9; continue; }
      const bw = 2 + (k >>> 4) % 2, bh = rh - 5 - ((k >>> 6) % 4), col = BOOK_COLS[(k >>> 9) % BOOK_COLS.length];
      if (x + bw > w - 4) break;
      const lean = ((k >>> 12) % 9) === 0;
      p.R(x, y0 + rh - 3 - bh + (lean ? 1 : 0), bw, bh - (lean ? 1 : 0), col); p.R(x, y0 + rh - 3 - bh + (lean ? 1 : 0), bw, 1, hil(col, .35)); p.R(x, y0 + rh - 6, bw, 1, shd(col, .25));
      x += bw + ((k >>> 14) % 5 === 0 ? 1 : 0);
    }
    p.R(2, y0 + rh - 3, w - 4, 2, wd.l); p.R(2, y0 + rh - 1, w - 4, 1, wd.d);
  }
  p.R(0, h, w, 2, PX.shadowS);
}

/* ---------- objetos con volumen ---------- */
function plantSprite(v){
  const key = 'plant' + v; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  if (v === 3) return SMALL_CACHE[key] = snakePlantSprite();
  const P = new Painter(1, 30, 48, 2);
  const pot = ['#d77c45', '#efe5d1', '#7d4c7b'][v], rim = ['#e99a62', '#fbf6ea', '#9a6898'][v];
  if (v === 0){
    P.cap('s', 15, 30, 15, 20, 1.2);
    [[7, 16, 8, 6, -.4], [23, 15, 8, 6, .4], [15, 9, 8, 7, 0], [9, 25, 7, 5, -.6], [22, 24, 7, 5, .6], [15, 19, 7, 6, 0]].forEach(([x, y, rx, ry], i) => P.ell(i % 2 ? 'b' : 'a', x, y, rx, ry));
    P.ell('c', 12, 6, 3, 2); P.ell('c', 20, 12, 2.6, 1.8); P.ell('c', 6, 13, 2.4, 1.6);
  } else if (v === 1){
    [[15, 30, 15, 2, 2.6, 'a'], [15, 30, 9, 7, 2.3, 'b'], [15, 30, 21, 6, 2.3, 'b'], [15, 30, 5, 14, 2, 'a'], [15, 30, 25, 13, 2, 'a'], [15, 30, 12, 10, 1.8, 'c']].forEach(([x1, y1, x2, y2, r, m]) => P.cap(m, x1, y1, x2, y2, r));
  } else {
    P.cap('s', 15, 30, 15, 22, 1.4);
    P.ell('a', 15, 16, 12, 11); P.ell('b', 10, 12, 6, 5); P.ell('b', 20, 11, 6, 5); P.ell('b', 15, 20, 7, 4); P.ell('c', 11, 9, 3, 2); P.ell('c', 19, 8, 2.6, 1.8);
  }
  P.poly('p', [[6, 31], [24, 31], [22, 46], [8, 46]], {n: [15, 38, 9, 8]});
  P.rect('r', 5, 29, 25, 33);
  P.ell('d', 15, 30.6, 8.6, 1.3);
  const c = P.render({a: '#3f7a3a', b: '#55913f', c: '#8ec35a', s: '#55693a', p: pot, r: rim, d: '#4a3324'}, 'd', {outline: 1, dark: .85});
  return SMALL_CACHE[key] = c;
}
/* sansevieria: hojas altas y en punta, verde oscuro con franjas y borde amarillo, en maceta marrón con plato */
function snakePlantSprite(){
  const P = new Painter(1, 32, 64, 2);
  // hojas en forma de lanza: anchas al medio, borde amarillo finito, verde con franjas oscuras
  const leaves = [[5, 15, 3.2, 13], [27, 13, 3.2, 19], [17, 0, 3.6, 16], [11, 5, 3.4, 14], [22, 4, 3.4, 18], [2, 27, 2.8, 12], [30, 25, 2.8, 20], [15, 13, 3.2, 15]];
  leaves.forEach(([tx, ty, w, bx], i) => {
    const by = 44, L = (k, side, sh) => { const x = bx + (tx - bx) * k, y = by + (ty - by) * k, ww = (k < .45 ? .55 + k : 1 - (k - .45) * 1.6) * w - sh; return [x + side * Math.max(.2, ww), y]; };
    const shape = sh => [L(0, -1, sh), L(.25, -1, sh), L(.45, -1, sh), L(.7, -1, sh), [tx, ty + sh * 1.6], L(.7, 1, sh), L(.45, 1, sh), L(.25, 1, sh), L(0, 1, sh)];
    P.poly('y', shape(0));
    P.poly(i % 2 ? 'g' : 'G', shape(.9));
    for (let k = .12; k < .85; k += .11){ const [x0, y0] = L(k, -1, 1.2), [x1, y1] = L(k, 1, 1.2); P.cap('h', x0, y0 + .4, x1, y1 - .5, .3); }
  });
  P.poly('p', [[6, 43], [26, 43], [24, 58], [8, 58]], {n: [16, 50, 10, 8]});
  P.rect('r', 5, 41.5, 27, 45); P.ell('d', 16, 43, 9.5, 1.3);
  P.ell('q', 16, 59.5, 10.5, 2.2);
  return P.render({y: '#d8c23e', g: '#3a6a2c', G: '#4b8034', h: '#284a20', p: '#6b4636', r: '#7d5444', d: '#3a2618', q: '#7a5040'}, 'd', {outline: 1, dark: .85});
}
/* el parlante de torre negro de Asteroide (como en la foto): tweeter, dos woofers, el puerto de graves y los botones arriba */
function speakerSprite(){
  if (SMALL_CACHE.speaker) return SMALL_CACHE.speaker;
  return SMALL_CACHE.speaker = sprite(16, 60, p => {
    p.R(0, 4, 15, 56, '#1c1c20'); p.R(15, 6, 1, 54, '#121214'); p.R(0, 4, 15, 1, '#3a3a40');
    for (let y = 8; y < 58; y += 3) p.R(1 + (y % 2), y, 12, 1, '#232328');
    p.R(1, 0, 14, 5, '#2a2a30'); p.R(2, 1, 12, 1, '#55555c'); for (const x of [3, 6, 9, 12]) p.P(x, 3, '#8a8a92');
    p.E(7, 12, 2.5, 2.5, '#3a3a40'); p.E(7, 12, 1.2, 1.2, '#8a8a92');
    for (const y of [24, 36]){ p.E(7, y, 5.5, 5.5, '#4a4a52'); p.E(7, y, 4.5, 4.5, '#2a2a30'); p.E(7, y, 2, 2, '#3e3e46'); p.P(6, y - 1, '#6a6a72'); }
    p.R(9, 44, 5, 8, '#55555c'); p.R(9, 44, 5, 1, '#6a6a72');
    p.E(5, 54, 2.2, 1.6, '#0c0c0e'); p.R(0, 58, 16, 2, '#0f0f12');
  }, {dark: .5});
}
function drawProp(c, p, cx, cy){
  const s = plantSprite(p.v), X = (p.x*TS - cx)*2, Y = (p.y*TS - cy)*2;
  floorShadow(c, X + 6, Y + 26, 20, 5);
  c.drawImage(s, X + 16 - Math.round(s.width / 2), Y + 31 - s.height + 2);
}
/* mesa: tapa, faldón, patas y lo que hay arriba */
function tableSprite(w, h, top, items, o = {}){
  const oy = o.chairs ? 8 : 0;
  const spr = sprite(w, h + oy, P0 => {
    const p = Pen(P0.c, spr0m + 0, spr0m + oy);
    const T = rampOf(top), Lg = o.legCol ? rampOf(o.legCol) : T, legH = o.legs ?? 7, fh = 5, th = h - fh - legH;
    if (o.chairs) o.chairs(p, th);
    for (const lx of [2, w - 6]){ p.R(lx, th + fh - 1, 4, legH + 1, Lg.e); p.R(lx, th + fh - 1, 1, legH + 1, Lg.d); }
    if (w > 100) for (const lx of [Math.floor(w / 2) - 2]){ p.R(lx, th + fh - 1, 4, legH + 1, Lg.e); }
    p.RR(0, 0, w, th, T.m); p.R(1, 1, w - 2, 1, T.l); p.R(1, 1, 1, th - 2, T.l);
    if (o.grain) for (let y = 4; y < th - 2; y += 5) for (let x = 3 + (y % 3) * 5; x < w - 6; x += 17) p.R(x, y, 6, 1, T.d);
    p.R(0, th - 1, w, 1, T.h);
    p.R(0, th, w, fh, T.d); p.R(0, th, w, 1, T.m); p.R(0, th + fh - 1, w, 1, T.e);
    if (items) items(p, th);
  });
  spr.oy = oy; return spr;
}
const spr0m = 2;
function laptop(p, x, y, col){ p.R(x, y + 4, 14, 6, '#c9ced3'); p.R(x + 1, y + 5, 12, 4, '#dfe3e7'); p.R(x + 4, y + 8, 6, 1, '#b0b6bd'); p.R(x + 1, y - 4, 12, 8, '#3b3e48'); p.R(x + 2, y - 3, 10, 6, col); p.R(x + 2, y - 3, 10, 1, hil(col, .4)); p.R(x + 3, y, 5, 1, shd(col, .25)); }
function mug(p, x, y, col){ p.R(x, y, 4, 5, col); p.R(x, y, 4, 1, hil(col, .4)); p.R(x + 4, y + 1, 1, 3, col); p.R(x + 1, y + 1, 2, 1, '#5a3a24'); }
function papers(p, x, y){ p.R(x, y, 9, 7, '#fbf8ef'); p.R(x + 2, y - 1, 9, 7, '#f1ece0'); p.R(x + 3, y + 1, 6, 1, '#b9b3a6'); p.R(x + 3, y + 3, 5, 1, '#b9b3a6'); }
/* las computadoras de la agencia son laptops: tapa abierta con la pantalla y la base con el teclado sobre el escritorio
   (se llama monitor por compatibilidad: ocupa el mismo lugar que ocupaban los monitores) */
function monitor(p, x, y, col, wide){
  const w = wide ? 22 : 16, h = wide ? 12 : 11, ly = y + 4, A = '#c3c8ce';
  p.R(x, ly, w, h, A); p.R(x, ly, w, 1, '#e4e8ec'); p.R(x + 1, ly + 1, w - 2, h - 2, '#22252b');
  p.R(x + 2, ly + 2, w - 4, h - 4, col); p.R(x + 2, ly + 2, w - 4, 1, hil(col, .45));
  p.R(x + 3, ly + 4, w - 9, 1, shd(col, .3)); p.R(x + 3, ly + 6, w - 12, 1, shd(col, .2));
  const by = ly + h; p.R(x - 1, by, w + 2, 1, '#8a9097'); p.R(x - 2, by + 1, w + 4, 4, '#d6dade'); p.R(x - 2, by + 4, w + 4, 1, '#a9aeb4');
  for (let r = 0; r < 2; r++) p.R(x, by + 1 + r * 2, w, 1, '#aeb3b9'); p.R(x + w/2 - 3, by + 3, 6, 1, '#c3c8ce');
}
function chairBack(p, x, y, col){ const C = rampOf(col); p.RR(x, y, 14, 9, C.m); p.R(x + 1, y + 1, 12, 1, C.l); p.R(x + 1, y + 7, 12, 1, C.d); }
function deskSprite(n, zone, seed){
  const w = n*32 - 6, h = 30;
  if (zone === 'La Base') return baseDeskSprite(n, seed);
  return sprite(w, h + 14, p => {
    const top = zone === 'Archivos X' ? '#d9dcd6' : '#efe7d6', T = rampOf(top), fr = rampOf(zone === 'Archivos X' ? '#7d868b' : PX.oak);
    const Y = 14, th = 14;
    p.R(2, Y + th + 4, 3, h - th - 4, fr.e); p.R(w - 5, Y + th + 4, 3, h - th - 4, fr.e);
    p.R(4, Y + th + 4, w - 8, 9, fr.d); p.R(4, Y + th + 4, w - 8, 1, fr.m); p.R(4, Y + th + 12, w - 8, 1, fr.e);
    p.RR(0, Y, w, th, T.m); p.R(1, Y + 1, w - 2, 1, T.l); p.R(0, Y + th - 1, w, 1, T.h); p.R(0, Y + th, w, 4, T.d); p.R(0, Y + th + 3, w, 1, T.e);
    const screens = [PX.lime, '#7fb6d6', PX.lav, PX.orange, '#9ad1b8'];
    const per = n >= 3 ? 3 : 2;
    for (let i = 0; i < per; i++){
      const sx = Math.round((i + .5) * w / per) - 8, col = screens[(seed + i) % screens.length];
      monitor(p, sx, 0, col, false);
      if ((seed + i) % 2) mug(p, sx + 17, Y + 4, [PX.orange, PX.plum, PX.lime][(seed + i) % 3]);
      else papers(p, sx - 9 < 1 ? sx + 16 : sx - 9, Y + 3);
    }
  });
}
/* La Base (como en la foto): islas de escritorios de roble claro con patas negras, laptops abiertas
   (alguna prendida), alguna laptop cerrada, un portalápices verde y las sillas negras de malla metidas abajo */
function baseDeskSprite(n, seed){
  const w = n*32 - 6, h = 30;
  return sprite(w, h + 20, p => {
    const T = rampOf('#d9c49a'), Y = 14, th = 14, K = '#222326';
    p.R(3, Y + th + 4, 3, h - th - 2, K); p.R(w - 6, Y + th + 4, 3, h - th - 2, K);
    p.RR(0, Y, w, th, T.m); p.R(1, Y + 1, w - 2, 1, T.l); p.R(0, Y + th - 1, w, 1, T.h); p.R(0, Y + th, w, 4, T.d); p.R(0, Y + th + 3, w, 1, T.e);
    for (let x = 6; x < w - 6; x += 9) p.R(x, Y + 4 + (x % 3), 5, 1, T.d);          // veta
    const per = n >= 3 ? 3 : 2;
    for (let i = 0; i < per; i++){
      const sx = Math.round((i + .5) * w / per) - 8, on = (seed + i) % 3 === 0;
      monitor(p, sx, 0, on ? '#5d7f9a' : '#2a2d33', false);
      p.R(sx + 17, Y + 6, 3, 4, '#2a2b30');                                             // mouse con su pad
      if ((seed + i) % 2) { p.R(sx - 10, Y + 3, 9, 7, '#1e1f23'); p.R(sx - 9, Y + 4, 7, 1, '#3a3c42'); }   // laptop cerrada
    }
    if (seed % 2 === 0){ p.R(w / 2 - 3, Y + 2, 6, 5, '#7fd03a'); p.R(w / 2 - 3, Y + 2, 6, 1, '#a8e66a'); p.R(w / 2 - 2, Y - 1, 1, 3, '#e9604a'); p.R(w / 2, Y - 2, 1, 4, '#3d6fb0'); }
    // sillas de malla del lado de acá, metidas bajo el escritorio
    for (let i = 0; i < per; i++){
      const cx = Math.round((i + .5) * w / per) - 8;
      p.RR(cx, Y + th + 2, 16, 14, '#1d1e22'); p.R(cx + 2, Y + th + 4, 12, 10, '#2c2e33');
      for (let yy = Y + th + 5; yy < Y + th + 14; yy += 2) for (let xx = cx + 3 + (yy % 4 ? 1 : 0); xx < cx + 14; xx += 2) p.P(xx, yy, '#4c4f56');
      p.R(cx + 1, Y + th + 2, 14, 1, '#3e4046'); p.R(cx + 7, Y + th + 16, 2, 4, '#a9adb3');
    }
  });
}
/* ventilador de pie verde agua (La Base) */
function fanSprite(){
  if (SMALL_CACHE.fan) return SMALL_CACHE.fan;
  return SMALL_CACHE.fan = sprite(24, 56, p => {
    const M = '#a9d4be', MD = '#7fb39c', ML = '#cfeadc';
    p.E(12, 52, 9, 3, MD); p.E(12, 51, 8, 2, M); p.R(11, 22, 3, 29, M); p.R(11, 22, 1, 29, ML);
    p.E(12, 12, 11, 11, MD); p.E(12, 12, 10, 10, '#eef6f1'); for (let a = 0; a < 6.28; a += .52) p.L(12, 12, Math.round(12 + Math.cos(a) * 9), Math.round(12 + Math.sin(a) * 9), M);
    p.E(12, 12, 3, 3, MD); p.P(11, 11, ML);
  }, {dark: .55});
}
function counterSprite(n){
  const w = n*32, h = 32 + 22;
  return sprite(w, h, p => {
    const Y = 22, top = rampOf('#dcd8cf'), cab = rampOf(PX.plum);
    p.R(0, Y, w, 9, top.m); p.R(0, Y, w, 1, top.h); p.R(0, Y + 1, w, 1, top.l); p.R(0, Y + 8, w, 1, top.d);
    p.R(0, Y + 9, w, 20, cab.m); p.R(0, Y + 9, w, 1, cab.l); p.R(0, Y + 28, w, 3, '#3a2a36'); p.R(0, Y + 31, w, 1, INK);
    for (let x = 0; x < w; x += 16){ p.R(x, Y + 10, 1, 18, cab.e); p.R(x + 2, Y + 11, 12, 15, cab.d); p.R(x + 2, Y + 11, 12, 1, cab.m); p.R(x + 7, Y + 14, 2, 4, '#e8dfc9'); }
    // pava, cafetera, pileta, frutas, tostadora, planta
    const coffee = 32 + 6; p.R(coffee, Y - 18, 16, 20, '#34343e'); p.R(coffee + 1, Y - 17, 14, 4, '#4a4a56'); p.R(coffee + 3, Y - 11, 10, 7, '#20202a'); p.R(coffee + 6, Y - 6, 4, 4, '#fbf8ef'); p.R(coffee + 7, Y - 5, 2, 1, '#6b4a2e'); p.R(coffee + 12, Y - 15, 2, 2, PX.lime);
    const sink = 96; p.R(sink, Y + 1, 26, 6, '#9aa3aa'); p.R(sink + 1, Y + 2, 24, 4, '#c3cbd0'); p.R(sink + 12, Y - 7, 2, 8, '#8a939a'); p.R(sink + 12, Y - 7, 6, 2, '#8a939a');
    const kettle = 140; p.E(kettle + 6, Y - 4, 6, 5, PX.orange); p.R(kettle + 3, Y - 10, 6, 2, '#3a3040'); p.R(kettle + 12, Y - 6, 3, 2, PX.orange); p.P(kettle + 3, Y - 6, hil(PX.orange, .5));
    const fruit = 172; p.E(fruit + 8, Y + 1, 9, 3, '#e8dfc9'); p.E(fruit + 4, Y - 2, 3, 3, PX.red); p.E(fruit + 9, Y - 3, 3, 3, PX.yellow); p.E(fruit + 13, Y - 1, 3, 3, PX.green); p.E(fruit + 8, Y - 1, 3, 2, PX.orange);
    p.R(204, Y - 9, 10, 10, '#d77c45'); p.R(204, Y - 9, 10, 1, '#e99a62'); p.E(209, Y - 13, 6, 5, PX.green); p.E(207, Y - 15, 3, 2, '#8ec35a');
  });
}
function rackSprite(){
  return sprite(28, 56, p => {
    const R = rampOf('#3a3f45');
    p.R(0, 0, 28, 56, R.m); p.R(0, 0, 28, 1, R.l); p.R(1, 1, 1, 54, R.l); p.R(26, 1, 1, 54, R.e);
    for (let i = 0; i < 6; i++){ const y = 4 + i*8; p.R(3, y, 22, 6, '#2a2e33'); p.R(3, y, 22, 1, '#4a5058'); for (let k = 0; k < 6; k++) p.R(13 + k*2, y + 3, 1, 1, '#4f5760'); }
    p.R(0, 54, 28, 2, '#22262a');
  });
}
function sofaSprite(rows, faceRight){
  const w = 30, h = rows*32 - 2;
  return sprite(w, h, p => {
    const F = rampOf(PX.plum), C = rampOf(hil(PX.plum, .12));
    p.RR(0, 0, w, h, F.d);
    const bx = faceRight ? 0 : w - 9;
    p.R(bx, 2, 9, h - 4, F.m); p.R(bx + 1, 2, 7, 1, F.l); p.R(faceRight ? bx + 8 : bx, 3, 1, h - 6, F.e);
    p.R(1, 0, w - 2, 7, F.m); p.R(1, 0, w - 2, 1, F.l); p.R(1, 6, w - 2, 1, F.e);
    p.R(1, h - 8, w - 2, 7, F.m); p.R(1, h - 8, w - 2, 1, F.l); p.R(1, h - 2, w - 2, 1, F.e);
    const sx = faceRight ? 10 : 2;
    for (let k = 0; k < rows; k++){ const y = 8 + k*((h - 16) / rows); p.RR(sx, y, 18, (h - 16) / rows - 1, C.m); p.R(sx + 1, y + 1, 16, 1, C.l); p.R(sx + 1, y + (h - 16) / rows - 3, 16, 1, C.d); }
    p.R(faceRight ? 14 : 6, 14, 8, 6, PX.lime); p.R(faceRight ? 14 : 6, 14, 8, 1, hil(PX.lime, .4));
  });
}
function poufSprite(col){ return sprite(26, 22, p => { const C = rampOf(col); p.E(13, 13, 12, 8, C.d); p.E(13, 10, 12, 8, C.m); p.E(11, 8, 7, 4, C.l); p.R(9, 6, 4, 1, C.h); p.R(12, 10, 2, 2, C.d); }); }
function armchairSprite(){
  return sprite(30, 30, p => {
    const F = rampOf('#8a5a3c'), C = rampOf('#a76f4b');
    p.RR(2, 0, 26, 14, F.m); p.R(3, 1, 24, 1, F.l);
    p.RR(0, 8, 7, 20, F.d); p.RR(23, 8, 7, 20, F.d); p.R(1, 8, 5, 1, F.m); p.R(24, 8, 5, 1, F.m);
    p.RR(6, 12, 18, 14, C.m); p.R(7, 13, 16, 1, C.l); p.R(6, 24, 18, 2, C.d);
    p.R(2, 27, 3, 3, '#3a2a20'); p.R(25, 27, 3, 3, '#3a2a20');
  });
}
function fridgeSprite(){
  return sprite(26, 56, p => {
    const F = rampOf('#e9ece8');
    p.RR(0, 0, 26, 56, F.m); p.R(1, 1, 24, 1, F.h); p.R(1, 1, 1, 54, F.l); p.R(24, 2, 1, 53, F.d);
    p.R(1, 20, 24, 1, F.e); p.R(20, 6, 2, 9, '#9aa3aa'); p.R(20, 24, 2, 14, '#9aa3aa');
    p.R(5, 5, 5, 5, PX.orange); p.R(11, 7, 4, 4, PX.lime); p.R(5, 26, 7, 8, '#fbf8ef'); p.R(6, 28, 5, 1, '#b9b3a6'); p.R(6, 30, 4, 1, '#b9b3a6'); p.R(13, 27, 4, 4, PX.lav);
    p.R(1, 54, 24, 2, F.e);
  });
}
/* dispensador de agua (como en la foto): columna blanca, frente gris con dos luces azules, botonera blanca
   (caliente, normal, fría), el hueco con la bandeja y el mueble blanco abajo */
function coolerSprite(){
  if (SMALL_CACHE.cooler) return SMALL_CACHE.cooler;
  return SMALL_CACHE.cooler = sprite(18, 52, p => {
    const W = rampOf('#eceeec');
    p.RR(0, 0, 18, 52, W.m); p.R(1, 0, 16, 2, '#ffffff'); p.R(16, 2, 1, 48, W.d); p.R(1, 2, 1, 48, W.h);
    p.RR(2, 5, 14, 25, '#7b8086'); p.R(3, 6, 12, 1, '#90959b');
    p.R(6, 6, 7, 3, 'rgba(90,150,255,.35)'); p.P(7, 7, '#4f8cff'); p.P(10, 7, '#4f8cff'); p.P(11, 7, '#9cc0ff');
    p.RR(3, 10, 12, 6, '#f4f5f3'); for (const x of [4, 8, 12]) p.R(x, 11, 3, 2, '#dcdfdc'); p.R(5, 14, 2, 1, '#9a9ea4');
    p.R(3, 17, 12, 10, '#5d6167'); p.P(6, 17, '#d8dadc'); p.P(11, 17, '#d8dadc');
    p.R(3, 26, 12, 2, '#9a9ea4'); for (let x = 4; x < 15; x += 2) p.P(x, 26, '#6d7177');
    p.R(2, 30, 14, 20, W.m); p.R(2, 30, 14, 1, '#c9ccc9'); p.P(8, 36, '#9cc0ff'); p.P(9, 36, '#9cc0ff');
    p.R(1, 50, 16, 2, W.e);
  });
}
/* guitarra criolla en su soporte (como en la foto de La Base) */
function guitarSprite(){
  if (SMALL_CACHE.guitar) return SMALL_CACHE.guitar;
  return SMALL_CACHE.guitar = sprite(20, 56, p => {
    p.R(7, 0, 6, 8, '#6a1a22'); p.R(7, 0, 6, 1, '#8a2a32'); p.R(9, 2, 2, 5, '#3a0e14');
    for (const y of [2, 4, 6]){ p.P(6, y, '#efe6cf'); p.P(13, y, '#efe6cf'); }
    p.R(9, 8, 3, 21, '#3a2418'); for (let y = 10; y < 28; y += 3) p.R(9, y, 3, 1, '#c9b07a');
    p.E(10, 33, 7, 6, '#4a1e14'); p.E(10, 43, 9, 8, '#4a1e14');
    p.E(10, 33, 6, 5, '#d9a75e'); p.E(10, 43, 8, 7, '#d9a75e'); p.R(4, 36, 13, 4, '#d9a75e');
    p.E(10, 34, 2.6, 2.6, '#8a5a30'); p.E(10, 34, 1.8, 1.8, '#24160e');
    p.R(6, 45, 8, 2, '#3a2418'); p.R(9, 8, 1, 37, 'rgba(240,232,210,.55)'); p.R(11, 8, 1, 37, 'rgba(240,232,210,.4)');
    p.R(3, 50, 3, 6, '#1e1e22'); p.R(14, 50, 3, 6, '#1e1e22'); p.R(1, 54, 18, 2, '#1e1e22');
  }, {dark: .55});
}
function binSprite(){ return sprite(16, 18, p => { const B = rampOf('#5c6b60'); p.RR(1, 3, 14, 15, B.m); p.R(2, 4, 2, 13, B.l); p.R(12, 4, 2, 13, B.d); p.RR(0, 0, 16, 4, B.e); p.R(1, 0, 14, 1, B.m); p.R(4, -2, 6, 3, '#fbf8ef'); p.R(9, -1, 3, 2, PX.orange); }); }
function printerSprite(){
  return sprite(28, 24, p => {
    const P = rampOf('#d6d9dc');
    p.RR(0, 6, 28, 18, P.m); p.R(1, 7, 26, 1, P.h); p.R(1, 16, 26, 1, P.d); p.R(1, 17, 26, 6, P.d); p.R(1, 22, 26, 1, P.e);
    p.R(5, 0, 18, 8, '#fbf8ef'); p.R(6, 2, 10, 1, '#c9c2b0'); p.R(6, 4, 8, 1, '#c9c2b0');
    p.R(4, 11, 20, 3, '#3b3e48'); p.R(21, 8, 3, 2, PX.lime); p.R(6, 19, 16, 2, '#f1ece0');
  });
}
function boxesSprite(seed){
  return sprite(28, 30, p => {
    const B = rampOf('#c99f66');
    p.R(0, 12, 26, 18, B.d); p.R(0, 12, 26, 1, B.m); p.R(0, 6, 26, 7, B.m); p.R(0, 6, 26, 1, B.h); p.R(12, 6, 3, 24, '#e6d4ad'); p.R(25, 6, 1, 24, B.e);
    if (seed % 2){ p.R(5, 0, 18, 8, B.m); p.R(5, 0, 18, 1, B.h); p.R(5, 5, 18, 3, B.d); p.R(13, 0, 2, 8, '#e6d4ad'); }
    p.R(3, 18, 7, 5, '#fbf8ef'); p.R(4, 19, 5, 1, '#9a94a0');
  });
}
function bagSprite(){
  return sprite(18, 60, p => {
    p.R(8, 0, 2, 14, '#6b6f78'); for (let y = 1; y < 14; y += 3) p.R(7, y, 4, 1, '#8a8e98');
    const B = rampOf('#c4502c');
    p.RR(1, 14, 16, 36, B.m); p.R(2, 15, 3, 33, B.l); p.R(13, 15, 3, 33, B.d); p.R(1, 14, 16, 3, '#2e2e36'); p.R(1, 47, 16, 3, '#2e2e36'); p.R(1, 30, 16, 2, '#2e2e36');
    p.R(6, 22, 6, 1, B.h);
  });
}
function stairsTile(p, open){
  const S = rampOf('#c89f6c');
  p.R(0, 0, 32, 32, '#5b4630');
  for (let k = 0; k < 5; k++){ const y = 26 - k*6, col = mixC('#b48a58', '#e3c594', k / 4); p.R(2, y, 28, 6, col); p.R(2, y, 28, 1, hil(col, .3)); p.R(2, y + 5, 28, 1, shd(col, .35)); }
  p.R(0, 0, 2, 32, PX.capD); p.R(30, 0, 2, 32, PX.capD); p.R(2, 0, 28, 2, shd('#e3c594', .3));
}

/* ---------- objetos planos del piso ---------- */
function rug(c, X, Y, w, h, cols, kind){
  const p = Pen(c, X, Y), [a, b, e] = cols;
  p.RR(0, 0, w, h, e); p.R(2, 2, w - 4, h - 4, a); p.F(4, 4, w - 8, h - 8, b);
  if (kind === 'dots') for (let y = 8; y < h - 8; y += 8) for (let x = 8 + ((y >>> 3) & 1) * 4; x < w - 8; x += 8) p.R(x, y, 2, 2, b);
  if (kind === 'stripes') for (let y = 8; y < h - 8; y += 6) p.R(6, y, w - 12, 2, b);
  if (kind === 'diamond'){ const cx = w / 2, cy = h / 2; for (let i = 0; i < Math.min(cx, cy) - 8; i++){ p.P(cx - i, cy - (Math.min(cx, cy) - 8 - i), b); p.P(cx + i, cy - (Math.min(cx, cy) - 8 - i), b); p.P(cx - i, cy + (Math.min(cx, cy) - 8 - i), b); p.P(cx + i, cy + (Math.min(cx, cy) - 8 - i), b); } }
  for (let x = 2; x < w - 2; x += 3){ p.R(x, -1, 1, 1, e); p.R(x, h, 1, 1, e); }
}
const STACK_CACHE = {};
function pendingStacks(c, X, Y, h){
  const key = h % 24; let spr = STACK_CACHE[key];
  if (!spr){
    spr = sprite(30, 30, p => {
      const stack = (sx, sy, n, note, folder) => {
        for (let i = 0; i < n; i++){ const y = sy + (n - i)*2 + 1, col = folder && i === n - 1 ? folder : (i % 2 ? '#f3eee2' : '#e2dac8'); p.R(sx + (i % 2), y, 11, 2, col); p.R(sx + (i % 2), y + 1, 11, 1, shd(col, .18)); }
        p.R(sx, sy, 11, 3, '#fbf8ef'); p.R(sx, sy + 2, 11, 1, '#d9d2c1'); p.R(sx + 2, sy + 1, 5, 1, '#b9b3a6');
        if (note){ p.R(sx + 6, sy - 2, 5, 4, note); p.R(sx + 6, sy - 2, 5, 1, hil(note, .4)); }
      };
      const n1 = 2 + (key % 3), n2 = 1 + ((key >> 2) % 3);
      stack(1 + (key % 3), 6 + ((key >> 1) % 3), n1, [PX.lime, PX.orange, null, PX.lav][key % 4], null);
      stack(16 + ((key >> 3) % 3), 13 + (key % 3), n2, [PX.orange, null, PX.yellow][(key >> 1) % 3], ['#e8c15a', null, '#9ac0d8'][(key >> 2) % 3]);
    }, {dark: .55});
    STACK_CACHE[key] = spr;
  }
  floorShadow(c, X + 3, Y + 24, 26, 4, 'rgba(43,36,72,.12)');
  c.drawImage(spr, X, Y);
}
function doormat(c, X, Y){ const p = Pen(c, X, Y); p.RR(2, 6, 28, 20, '#8a3d1c'); p.R(4, 8, 24, 16, PX.orange); for (let x = 6; x < 26; x += 4) p.R(x, 10, 2, 12, shd(PX.orange, .15)); p.R(4, 8, 24, 1, hil(PX.orange, .3)); }

/* ---------- construcción ---------- */
function blocksOf(ch){
  const seen = new Set(), out = [];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++){
    if (MAP[y][x] !== ch || seen.has(x + ',' + y)) continue;
    let x0 = x, x1 = x, y0 = y, y1 = y; const q = [[x, y]]; seen.add(x + ',' + y);
    while (q.length){ const [cx, cy] = q.pop(); x0 = Math.min(x0, cx); x1 = Math.max(x1, cx); y0 = Math.min(y0, cy); y1 = Math.max(y1, cy);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const nx = cx + dx, ny = cy + dy, k = nx + ',' + ny; if (tileAt(nx, ny) === ch && !seen.has(k) && nx >= 0 && ny >= 0 && nx < MW && ny < MH){ seen.add(k); q.push([nx, ny]); } } }
    out.push({x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1});
  }
  return out;
}
/* Arma un piso interior (la planta baja 'office' o la planta alta 'upstairs') con el mismo sistema:
   piso por zona, paredes por letra, objetos de pared, muebles con volumen y lámparas colgantes encima de todo. */
function buildOffice(){ buildInterior('office'); }
function buildInterior(id){
  useMap(id);
  const W = MW*32, H = MH*32, PROPS = [], LEDS = [], STEAM = [], OVER = [], SPEAKERS = [], WINDOWS = [];
  const map = document.createElement('canvas'); map.width = W; map.height = H;
  const b = map.getContext('2d');
  // 1. piso por píxel, con sombras de pared y guardas (parquet de la biblioteca, terrazo del hall)
  const img = b.createImageData(W, H), d = img.data;
  const solidAt = (tx, ty) => isWall(tx, ty);
  const HB = [hx('#4a2a18'), hx('#d9b07a')], TB = [hx('#6e4a3e'), hx('#83594a'), hx('#58382e'), hx('#a9786a')], TL = hx('#f4efe6');
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++){
    if (isWall(tx, ty)) continue;
    const k = floorKind(tx, ty), up = solidAt(tx, ty - 1), lf = solidAt(tx - 1, ty), rt = solidAt(tx + 1, ty), dn = solidAt(tx, ty + 1);
    for (let ly = 0; ly < 32; ly++) for (let lx = 0; lx < 32; lx++){
      const X = tx*32 + lx, Y = ty*32 + ly; let c = floorPx(k, X, Y);
      let dist = 99; if (up) dist = Math.min(dist, ly); if (dn) dist = Math.min(dist, 31 - ly); if (lf) dist = Math.min(dist, lx); if (rt) dist = Math.min(dist, 31 - lx);
      if (k === 'herring' && dist >= 10 && dist < 16) c = dist === 10 || dist === 15 ? HB[1] : HB[0];
      if (k === 'terrazzo' && dist < 9) c = TB[hash(X, Y) % 100 < 18 ? 1 + (hash(Y, X) % 3) : 0]; else if (k === 'terrazzo' && dist === 9) c = TL;
      let s0 = 0;
      if (up){ if (ly < 4) s0 = .2; else if (ly < 7 && ((lx + ly) & 1)) s0 = .2; }
      if (lf && lx < 3) s0 = Math.max(s0, .14); if (rt && lx > 28) s0 = Math.max(s0, .1);
      if (s0) c = c.map((v, i) => Math.round(v * (1 - s0) + [43, 36, 72][i] * s0));
      const i = (Y*W + X)*4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
  }
  b.putImageData(img, 0, 0);
  // 2. alfombras y cosas planas
  const RUGS = id === 'office' ? [
    {x: 24, y: 21, w: 8, h: 3, c: ['#e8d9bf', '#d9c4a2', '#82690a'], k: 'stripes'},
    {x: 2, y: 19, w: 7, h: 4, c: ['#efe9fc', '#ddd5f6', '#a99fe6'], k: 'dots'},
  ] : [];
  for (const r of RUGS) rug(b, r.x*32 + 4, r.y*32 + 6, r.w*32 - 8, r.h*32 - 10, r.c, r.k);
  for (const r of blocksOf('R')){ // colchoneta de entrenamiento de Fede
    const X = r.x0*32, Y = r.y0*32, w = r.w*32, h = r.h*32, p = Pen(b, X, Y);
    p.RR(0, 0, w, h, '#5a3d7a'); p.R(2, 2, w - 4, h - 4, '#b9aee6'); p.R(2, 2, w - 4, 2, '#cfc6f2'); p.R(2, h - 5, w - 4, 3, '#9d91d6');
    for (let x = 32; x < w; x += 32) p.R(x, 2, 1, h - 4, '#a196d8');
    p.E(w/2, h/2, 22, 14, '#a196d8'); p.E(w/2, h/2, 20, 12, '#b9aee6'); p.E(w/2, h/2, 6, 6, PX.orange); p.E(w/2, h/2, 4, 4, hil(PX.orange, .3));
  }
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++){
    const ch = MAP[ty][tx];
    if (ch === '"') pendingStacks(b, tx*32, ty*32, hash(tx, ty));
    if (ch === 'E') doormat(b, tx*32, ty*32);
    if (ch === 'U' && id === 'upstairs') stairsTile(Pen(b, tx*32, ty*32));
  }
  // escaleras de mármol: la curva del hall y el hueco de la planta alta
  for (const r of blocksOf('y')) (id === 'office' ? hallStairs : stairwell)(b, r.x0*32, r.y0*32, r.w*32, r.h*32);
  // 3. paredes
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++){
    if (!isWall(tx, ty)) continue;
    const p = Pen(b, tx*32, ty*32), ch = MAP[ty][tx];
    if (isUpper(tx, ty)) wallUpper(p, tx, ty);
    else if (isFace(tx, ty)){ wallFace(p, tx, ty, ch === '#'); if (ch === '#'){ doorJambs(p, tx, ty); if (wallKind(tx, ty) !== 'bath') wallDecor(p, tx, ty); } }
    else wallCap(p, tx, ty);
  }
  // 4. objetos de pared (64 px de alto: pared alta + baja)
  const zoneName = (x, y) => { const z = zoneAt(x, y + 1); return z ? z.n : ''; };
  for (let ty = 0; ty < MH; ty++){
    for (const [x0, x1] of runs('H', ty)){ let x = x0; for (const n of splitRun(x1 - x0 + 1, 4)){ whiteboard(b, x*32 + 4, (ty - 1)*32 + 14, n*32 - 8, hash(x, ty), zoneName(x, ty) === 'Brasil' ? statusBoardArt : null); x += n; } }
    for (const [x0, x1] of runs('W', ty)){ WINDOWS.push({x: x0*32 + 6, y: (ty - 1)*32 + 10, w: (x1 - x0 + 1)*32 - 12, h: 44}); let x = x0; for (const n of splitRun(x1 - x0 + 1, 2)){ const zn = zoneName(x, ty);
      if (zn === 'Sala de Reuniones') archWindow(b, x*32, (ty - 1)*32, n*32);
      else if (zn === 'Guaná') tallWindow(b, x*32, (ty - 1)*32, n*32);
      else if (zn === 'Brasil') tallWindow(b, x*32, (ty - 1)*32, n*32, true);
      else windowPane(b, x*32 + 5, (ty - 1)*32 + 12, n*32 - 10);
      x += n; } }
    for (const [x0, x1] of runs('B', ty)){ if (zoneName(x0, ty) === 'Sala de Reuniones') libraryShelf(b, x0*32, (ty - 1)*32, (x1 - x0 + 1)*32, hash(x0, ty)); else bookshelf(b, x0*32 + 2, (ty - 1)*32 + 4, (x1 - x0 + 1)*32 - 4, hash(x0, ty)); }
    for (const [x0, x1] of runs('V', ty)) libraryShelf(b, x0*32, (ty - 1)*32, (x1 - x0 + 1)*32, hash(x0, ty), true);
    for (const [x0, x1] of runs('M', ty)) fireplace(b, x0*32, (ty - 1)*32, (x1 - x0 + 1)*32);
    for (const [x0, x1] of runs('Y', ty)){ let x = x0, k = 0; for (const n of splitRun(x1 - x0 + 1, 2)){ (zoneName(x, ty) === 'Brasil' ? brasilPoster : poster)(b, x*32, (ty - 1)*32, n*32, k++); x += n; } }
    for (const [x0, x1] of runs('G', ty)) backdrop(b, x0*32, (ty - 1)*32, (x1 - x0 + 1)*32);
    for (const [x0, x1] of runs('J', ty)) liaBoardArt(b, x0*32, (ty - 1)*32, (x1 - x0 + 1)*32);
    for (const [x0, x1] of runs('e', ty)) asteroWall(b, x0*32, (ty - 1)*32, (x1 - x0 + 1)*32);
    for (const [x0, x1] of runs('r', ty)) grillWall(b, x0*32, (ty - 1)*32, (x1 - x0 + 1)*32);
    for (const [x0, x1] of runs('j', ty)) wineRackWall(b, x0*32, (ty - 1)*32, (x1 - x0 + 1)*32);
  }
  if (id === 'office'){ // pared de La Base (como en la foto)
    { const p = Pen(b, 11*32 + 4, 7*32 + 5), w = 56, h = 21;   // pizarrón grande: eventos del mes
      p.R(0, 1, w, h, rampOf(PX.metal).e); p.R(1, 0, w - 2, h, PX.metal); p.R(2, 2, w - 4, h - 4, '#fdfcf8'); p.R(2, 2, w - 4, 1, '#ffffff');
      p.R(5, 4, 22, 1, '#d24a3a'); for (let i = 0; i < 5; i++){ p.P(5, 7 + i * 3, '#3d6fb0'); p.R(7, 7 + i * 3, [16, 12, 18, 10, 14][i], 1, '#3d6fb0'); }
      p.R(33, 5, 1, 13, '#c9c4d0'); for (let i = 0; i < 3; i++) p.R(36, 8 + i * 3, 12, 1, '#9a94a0'); p.E(46, 6, 3, 2, '#9a94a0'); p.P(45, 6, '#3a3040');
      p.R(1, h - 2, w - 2, 2, PX.steel); p.R(9, h - 3, 3, 1, PX.red); p.R(13, h - 3, 3, 1, '#3d6fb0'); }
    { const p = Pen(b, 14*32 + 2, 7*32 + 3), w = 28, h = 25;  // tablero negro con agujeritos: la hoja de los valores, un llavero y un sticker
      p.R(0, 0, w, h, '#141518'); p.R(1, 1, w - 2, h - 2, '#1e1f23'); p.R(1, 1, w - 2, 1, '#34363b');
      for (let y = 3; y < h - 1; y += 3) for (let x = 3; x < w - 1; x += 3) p.P(x, y, '#0c0d0f');
      p.R(12, 1, 14, 11, '#fbfaf6'); p.R(12, 1, 14, 1, '#ffffff'); p.R(14, 3, 10, 1, '#3a3a40'); for (let i = 0; i < 4; i++) p.R(15, 5 + i * 2, [8, 7, 9, 6][i], 1, '#7a7a82');
      p.R(5, 1, 2, 7, '#2f5fb0'); p.P(6, 8, '#c9c9cf'); p.E(6, 11, 2, 2, '#e9c86a'); p.R(5, 13, 3, 3, '#2f5fb0'); p.P(5, 10, '#7a4fb0');
      p.R(10, 16, 6, 2, '#3c9a4a'); p.R(11, 16, 4, 1, '#7cd08a'); }
    { const p = Pen(b, 18*32 + 10, 7*32 + 6), w = 44, h = 18;  // pizarrón chico con la grilla del mes
      p.R(0, 1, w, h, rampOf(PX.metal).e); p.R(1, 0, w - 2, h, PX.metal); p.R(2, 2, w - 4, h - 4, '#fdfcf8');
      for (let i = 0; i <= 7; i++) p.R(22 + i * 2.5 | 0, 4, 1, 11, '#c9c4d0'); for (let j = 0; j < 4; j++) p.R(22, 4 + j * 3.5 | 0, 18, 1, '#c9c4d0');
      [[24, 6], [29, 9], [34, 6], [27, 12]].forEach(([x, y]) => p.P(x, y, '#d24a3a')); p.R(5, 5, 12, 1, '#3a3040'); p.R(5, 8, 9, 1, '#9a94a0'); p.R(5, 11, 11, 1, '#9a94a0'); }
  }
  // luz que entra por las ventanas comunes
  b.fillStyle = 'rgba(255,246,214,.13)';
  for (let x = 0; x < MW; x++) if (MAP[1][x] === 'W' && x % 2 === 0 && !['Sala de Reuniones', 'Guaná', 'Brasil'].includes(zoneName(x, 1))) for (let y = 0; y < 56; y++){ const k = Math.floor(y / 4) * 2; b.fillRect(x*32 + 10 + k, 64 + y, 40, 1); }
  if (id === 'office'){
    // el nombre de la agencia en la pared, arriba de la escalera (como en el hall de verdad)
    pixText(b, 'LA AGENCIA', 11*32 + 6, 17*32 + 7, '#2a2a2e', 3);
    // matafuegos con su cartel
    { const p = Pen(b, 20*32 + 8, 17*32 + 2); p.R(0, 0, 9, 12, '#d8492f'); p.R(1, 1, 7, 3, '#fbf8ef'); p.R(3, 6, 3, 4, '#fbf8ef');
      p.R(12, 8, 8, 20, '#c9302c'); p.R(13, 8, 2, 20, '#e8615a'); p.R(13, 5, 6, 3, '#2a2a2e'); p.R(18, 6, 4, 2, '#2a2a2e'); p.R(12, 26, 8, 2, '#8a1f1c'); }
    // la puerta de la Sala del Directorio: cerrada (doble hoja de madera oscura con placa dorada) hasta el nivel 30
    { const door = vipDoorSprite(); PROPS.push({sy: 7*TS + 15, draw: (c, cx, cy) => { if (S && S.lvl < 30) c.drawImage(door, 23*32 - door.m - cx*2, 7*32 - 14 - door.m - cy*2); }}); }
    // el baño (donde antes estaba la cocina): portarrollo, espejo, dispensador de papel y la ventana
    bathWall(b, 1*32, 7*32, 7*32);
  } else if (id === 'upstairs'){
    // aire acondicionado en Guaná, la oficina de Agus y Lía
    { const p = Pen(b, 18*32 + 6, 0*32 + 14); p.R(0, 0, 52, 15, '#f1eedc'); p.R(0, 0, 52, 1, '#ffffff'); p.R(0, 14, 52, 1, '#c9c5b2'); p.R(4, 9, 44, 3, '#3a3a3e'); p.R(44, 3, 4, 2, '#5fb05a'); }
    // Asteroide (como en la foto): el aire sobre la pared blanca y la puerta blanca del rincón
    { const p = Pen(b, 32*32 + 4, 0*32 + 12); p.R(0, 0, 50, 16, '#f4f2ea'); p.R(0, 0, 50, 1, '#ffffff'); p.R(0, 15, 50, 1, '#cfccbf'); p.R(3, 10, 44, 3, '#3a3a3e'); p.R(36, 4, 8, 3, '#2a2a2e'); p.R(4, 3, 3, 1, '#c96a2a'); }
    { const p = Pen(b, 34*32 + 3, 0*32 + 6), w = 26, h = 58; // puerta blanca con marco
      p.R(-2, 0, w + 4, h, '#e2ded2'); p.R(-2, 0, w + 4, 1, '#f8f6f0'); p.R(0, 2, w, h - 2, '#f3f1ea'); p.R(0, 2, 1, h - 2, '#ffffff'); p.R(w - 1, 2, 1, h - 2, '#d6d2c6');
      p.R(3, 6, w - 6, 20, '#ecebe3'); p.R(3, 6, w - 6, 1, '#d9d6cb'); p.R(3, 31, w - 6, 22, '#ecebe3'); p.R(3, 31, w - 6, 1, '#d9d6cb');
      p.R(w - 6, 30, 4, 2, '#b9bcc2'); p.R(w - 6, 30, 4, 1, '#e3e5e8'); p.R(w - 5, 33, 2, 3, '#8a8e94'); }
  } else if (id === 'barbacoa'){
    // el matafuegos de la cocina, colgado en la pared al lado de la heladera (como en la foto)
    { const p = Pen(b, 1*32 + 10, 0*32 + 30); p.R(0, 0, 8, 6, '#d8492f'); p.R(1, 1, 6, 2, '#fbf8ef');
      p.R(0, 9, 8, 18, '#c9302c'); p.R(1, 9, 2, 18, '#e8615a'); p.R(1, 6, 5, 3, '#2a2a2e'); p.R(5, 7, 4, 2, '#2a2a2e'); p.R(0, 25, 8, 2, '#8a1f1c'); p.R(2, 14, 4, 4, '#fbf8ef'); }
  }
  // repisas y alacenas sobre la mesada de la cocina
  for (const r of blocksOf('K')){ const p = Pen(b, r.x0*32, (r.y0 - 1)*32); const C = rampOf(PX.plum);
    p.R(6, 6, 52, 14, C.m); p.R(6, 6, 52, 1, C.l); p.R(6, 19, 52, 1, C.e); p.R(31, 6, 1, 14, C.e); p.R(16, 14, 6, 1, '#e8dfc9'); p.R(42, 14, 6, 1, '#e8dfc9'); p.R(6, 20, 52, 2, PX.shadow);
    p.R(r.w*32 - 70, 12, 40, 2, PX.walnut); [[0, PX.orange], [7, PX.lav], [14, PX.lime], [21, '#fbf8ef']].forEach(([dx, col]) => mug(p, r.w*32 - 68 + dx, 7, col)); }
  // 5. muebles con volumen (se ordenan con los personajes)
  const add = (spr, x, y, row, shadow) => {
    if (shadow) floorShadow(b, shadow[0], shadow[1], shadow[2], shadow[3]);
    PROPS.push({sy: row*TS + 15, draw: (c, cx, cy) => c.drawImage(spr, x - spr.m - cx*2, y - spr.m - (spr.oy || 0) - cy*2)});
  };
  for (const t of blocksOf('T')){
    const z = zoneAt(t.x0, t.y0), zn = z ? z.n : '', X = t.x0*32, Y = t.y0*32, w = t.w*32, h = t.h*32, seed = hash(t.x0, t.y0);
    if (zn === 'Sala de Reuniones' || zn === 'Sala del Directorio'){ const s = libraryTableSprite(w - 8, h - 4); add(s, X + 4, Y + 2, t.y1, [X + 6, Y + h - 6, w - 12, 6]); continue; }
    if (zn === 'Guaná'){ const s = foundersTableSprite(w - 6, h - 6); add(s, X + 3, Y + 4, t.y1, [X + 3, Y + h - 6, w - 6, 6]); continue; }
    if (zn === 'La Barbacoa'){ const s = glassTableSprite(w - 8, h - 4); add(s, X + 4, Y + 4, t.y1, [X + 6, Y + h - 6, w - 12, 5]); continue; }
    if (zn === 'Asteroide'){ const s = roundTableSprite(w - 4, h + 8); add(s, X + 2, Y - 6, t.y1, [X + 30, Y + h - 6, w - 60, 5]); continue; }
    const wood = zn === 'Sala de Clientes' ? '#8f5f37' : zn === 'Cocina' ? '#e2c497' : '#c99a5f';
    const chairs = zn === 'Sala de Clientes' ? (p, th) => { for (let x = 8; x < w - 30; x += 28) chairBack(p, x + 3, -6, '#5d6b8a'); } : null;
    const s = tableSprite(w - 10, h - 6, wood, (p, th) => {
      const v = seed % 5;
      if (zn === 'Cocina'){ p.E(w/2 - 5, th/2 + 1, 10, 4, '#fbf8ef'); p.E(w/2 - 8, th/2 - 1, 3, 3, PX.red); p.E(w/2 - 3, th/2 - 2, 3, 3, PX.yellow); p.E(w/2 - 1, th/2 + 1, 3, 2, PX.orange); mug(p, 10, 8, PX.lav); mug(p, w - 26, 12, PX.lime); }
      else { papers(p, 8, 6); if (v % 2) mug(p, w - 26, 8, PX.orange); else laptop(p, w - 30, 10, PX.lav); }
    }, {chairs, grain: true});
    add(s, X + 5, Y + 4, t.y1, [X + 3, Y + h - 6, w - 6, 6]);
  }
  for (const t of blocksOf('D')){
    const z = zoneAt(t.x0, t.y0), s = deskSprite(t.w, z ? z.n : '', hash(t.x0, t.y0));
    add(s, t.x0*32 + 3, t.y0*32 + 30 - 44 + 2, t.y1, [t.x0*32 + 3, t.y0*32 + 28, t.w*32 - 6, 5]);
  }
  for (const t of blocksOf('K')) add(counterSprite(t.w), t.x0*32, t.y0*32 + 32 - 54, t.y1, null);
  for (const t of blocksOf('K')) STEAM.push({x: t.x0*32 + 46, y: t.y0*32 - 20}, {x: t.x0*32 + 147, y: t.y0*32 - 11});
  for (const t of blocksOf('c')){ const s = coffeeCabinetSprite(t.w*32 - 4); add(s, t.x0*32 + 2, t.y0*32 + 32 - s.height + s.m*2, t.y1, [t.x0*32 + 2, t.y0*32 + 28, t.w*32 - 4, 4]); }
  for (const t of blocksOf('L')) for (let x = t.x0; x <= t.x1; x++){
    const spr = rackSprite(), X = x*32 + 2, Y = t.y0*32 + 32 - 56;
    PROPS.push({sy: t.y1*TS + 15, draw: (c, cx, cy) => { const ox = X - cx*2, oy = Y - cy*2; c.drawImage(spr, ox - spr.m, oy - spr.m);
      for (let i = 0; i < 6; i++){ const on = Math.floor(G.t / 260 + hash(x, i) % 7) % 3, yy = oy + 6 + i*8;
        c.fillStyle = on === 0 ? '#b6f03a' : on === 1 ? '#ff9a3c' : '#1d3a24'; c.fillRect(ox + 5, yy, 2, 2);
        c.fillStyle = on === 2 ? '#b6f03a' : '#1d3a24'; c.fillRect(ox + 9, yy, 2, 2); } }});
  }
  for (const t of blocksOf('w')){ const s = woodBarSprite(t.w*32 - 4); add(s, t.x0*32 + 2, t.y0*32 + 32 - (s.height - s.m*2) + 4, t.y1, [t.x0*32 + 2, t.y0*32 + 30, t.w*32 - 4, 4]); }
  for (const t of blocksOf('t')){ const s = coffeeTableSprite(t.w*32 - 10); add(s, t.x0*32 + 5, t.y0*32 + 8, t.y1, [t.x0*32 + 6, t.y0*32 + 28, t.w*32 - 12, 4]); }
  for (const t of blocksOf('z')){ const s = vanitySprite(t.w*32 - 4); add(s, t.x0*32 + 2, t.y0*32 + 32 - 40 + 2, t.y1, null); }
  for (const t of blocksOf('S')){
    const z = zoneAt(t.x0, t.y0), right = z ? t.x0 < z.x + z.w / 2 : true;
    if (z && z.n === 'La Barbacoa'){ // sillón en L: los tres cuerpos contra la pared y la punta que baja a la derecha
      const top = runs('S', t.y0).find(([a, b]) => a >= t.x0 && b <= t.x1), [a, b] = top, joined = t.h > 1 && MAP[t.y0 + 1][b] === 'S';
      const s = greenSofaSprite((b - a + 1)*32 - (joined ? 4 : 0), joined); add(s, a*32, t.y0*32 + 32 - 38 + 2, t.y0, [a*32 + 2, t.y0*32 + 28, (b - a + 1)*32 - 4, 5]);
      if (joined){ const c = chaiseSprite(); add(c, b*32, t.y0*32 + 16, t.y1, [b*32 + 2, t.y1*32 + 28, 28, 5]); }
      continue;
    }
    add(sofaSprite(t.h, right), t.x0*32 + 1, t.y0*32 + 2, t.y1, [t.x0*32 + 2, t.y1*32 + 28, 30, 4]);
  }
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++){
    const ch = MAP[ty][tx], X = tx*32, Y = ty*32;
    if (ch === 'C') add(poufSprite(zoneName(tx, ty - 1) === 'La Barbacoa' ? '#1f6b5c' : [PX.lav, '#b9d6a0', '#f2c9a8'][hash(tx, ty) % 3]), X + 3, Y + 6, ty, [X + 4, Y + 25, 24, 5]);
    if (ch === 'h') add(stoolSprite(), X + 6, Y + 32 - 34 + 2, ty, [X + 7, Y + 28, 18, 3]);
    if (ch === 'i') add(toiletSprite(), X + 6, Y - 2, ty, [X + 6, Y + 28, 20, 3]);
    if (ch === 'd') add(bidetSprite(), X + 6, Y + 4, ty, [X + 6, Y + 28, 20, 3]);
    if (ch === 'A') add(armchairSprite(), X + 1, Y + 1, ty, [X + 2, Y + 27, 28, 5]);
    if (ch === 'F') zoneName(tx, ty - 1) === 'La Barbacoa' ? add(steelFridgeSprite(), X + 3, Y + 32 - 66 + 2, ty, [X + 3, Y + 28, 26, 4]) : add(fridgeSprite(), X + 3, Y + 32 - 56, ty, [X + 3, Y + 28, 26, 4]);
    if (ch === 'Q') add(coolerSprite(), X + 7, Y + 32 - 52, ty, [X + 6, Y + 28, 20, 4]);
    if (ch === 'g'){ const s = guitarSprite(); add(s, X + 6, Y + 32 - s.height + s.m*2, ty, [X + 6, Y + 27, 20, 4]); }
    if (ch === 'b') zoneName(tx, ty - 1) === 'Baño' ? add(steelBinSprite(), X + 9, Y + 8, ty, [X + 8, Y + 28, 16, 3]) : add(binSprite(), X + 8, Y + 12, ty, [X + 8, Y + 28, 16, 3]);
    if (ch === 'X') add(printerSprite(), X + 2, Y + 6, ty, [X + 2, Y + 28, 28, 4]);
    if (ch === 'x') add(boxesSprite(hash(tx, ty)), X + 2, Y + 1, ty, [X + 2, Y + 28, 26, 4]);
    if (ch === 'Z') add(bagSprite(), X + 7, Y + 30 - 60 - 6, ty, [X + 8, Y + 26, 16, 4]);
    if (ch === 'k' && zoneName(tx, ty - 1) !== 'La Barbacoa'){ const view = tileAt(tx, ty + 1) === 'T' ? 'front' : tileAt(tx, ty - 1) === 'T' ? 'back' : tileAt(tx + 1, ty) === 'T' ? 'right' : 'left', s = zoneName(tx, ty - 1) === 'La Barbacoa' ? woodChairSprite(view) : meshChairSprite(view); add(s, X + 16 - s.width/2 + s.m, Y + 32 - s.height + s.m + (view === 'front' ? 6 : 0), ty, [X + 6, Y + 26, 20, 4]); }
    if (ch === 'l'){ const s = arcLampSprite(); add(s, X - 16 + s.m, Y + 32 - s.height + s.m*2, ty, [X + 8, Y + 26, 18, 4]); }
    if (ch === 'p'){ const s = printerCabinetSprite(); add(s, X + 16 - s.width/2 + s.m, Y + 32 - s.height + s.m*2, ty, [X + 2, Y + 27, 28, 4]); }
    if (ch === 'f'){ const s = fanSprite(); add(s, X + 16 - s.width/2 + s.m, Y + 32 - s.height + s.m + 2, ty, [X + 6, Y + 26, 20, 4]); }
    if (ch === 'N' && tileAt(tx, ty - 1) !== 'N'){ const s = tvStandSprite(); add(s, X + 16 - s.width/2 + s.m, Y + 32 + 14 - s.height + s.m, ty + 1, [X + 4, Y + 32 + 8, 24, 6]); }
    if (ch === 'm'){ const s = monsteraSprite(zoneName(tx, ty - 1) === 'Baño' ? .5 : 1); add(s, X + 16 - s.width/2 + 2, Y + 32 - s.height + 4, ty, [X + 4, Y + 26, 24, 5]); }
    if (ch === 'o'){ const s = softboxSprite(); add(s, X + 16 - s.width/2 + 2, Y + 32 - s.height + 4, ty, [X + 6, Y + 26, 20, 4]); }
    if (ch === 'q'){ const s = tripodSprite(); add(s, X + 16 - s.width/2 + 2, Y + 32 - s.height + 4, ty, [X + 6, Y + 26, 20, 4]); }
    if (ch === 'P' || ch === 'n'){ const p = {x: tx, y: ty, v: ch === 'n' ? 3 : hash(tx, ty) % 3, sy: ty*TS + 15}; p.draw = (c, cx, cy) => drawProp(c, p, cx, cy); PROPS.push(p); }
    if (ch === 'u'){ const s = speakerSprite(); add(s, X + 8, Y + 32 - s.height + s.m*2, ty, [X + 6, Y + 27, 20, 4]); SPEAKERS.push({x: tx, y: ty}); }
    if (ch === 'U' && id === 'office'){ const s = newelSprite(); add(s, X + 26 - s.width/2, Y + 32 - s.height + 6, ty, null); }
    if (ch === 'U' && id === 'upstairs') PROPS.push({sy: (ty + 1)*TS, draw: (c, cx, cy) => { if (S && S.flags.card) return; const p = Pen(c, X - cx*2, Y - cy*2);
      for (const px of [1, 27]){ p.R(px, 30, 4, 2, '#26332b'); p.R(px + 1, 10, 2, 21, '#c9a64a'); p.R(px + 1, 10, 1, 21, '#e6c86a'); p.R(px, 8, 4, 3, '#c9a64a'); }
      for (let i = 0; i < 24; i++){ const yy = 13 + Math.round(Math.sin(i / 23 * Math.PI) * 4); p.R(4 + i, yy, 1, 2, '#9b1b2e'); }
      p.R(8, -4, 16, 10, '#2a2236'); p.R(9, -3, 14, 8, '#fbf8ef'); p.R(11, -1, 10, 2, '#9b1b2e'); p.R(11, 2, 7, 1, '#9b1b2e'); }});
  }
  // la mesa de vidrio de la barbacoa: tres sillas parejas en cada lado largo y una en cada punta, centrada en la mesa
  for (let ty = 0; ty < MH; ty++) for (const [x0, x1] of runs('k', ty)){
    if ((zoneAt(x0, ty) || {}).n !== 'La Barbacoa') continue;
    const n = x1 - x0 + 1;
    if (n >= 3){ const view = tileAt(x0, ty + 1) === 'T' ? 'front' : 'back', s = woodChairSprite(view);
      for (let i = 0; i < 3; i++){ const cx = x0*32 + n*32 * (i + .5) / 3; add(s, cx - s.width/2 + s.m, ty*32 + 32 - s.height + s.m + (view === 'front' ? 6 : 0), ty, [cx - 10, ty*32 + 26, 20, 4]); } }
    else if (tileAt(x0, ty - 1) !== 'k'){ const view = tileAt(x0 + 1, ty) === 'T' ? 'right' : 'left', s = woodChairSprite(view); add(s, x0*32 + 16 - s.width/2 + s.m, ty*32 + 48 - s.height + s.m, ty + .5, [x0*32 + 6, ty*32 + 42, 20, 4]); }
  }
  // 6. lámparas colgantes (se dibujan encima de todo) y su luz sobre el piso
  const lamp = (kind, x, y, w) => { b.fillStyle = 'rgba(255,236,190,.10)'; pixEllipse(b, x, y + 70, (w || 40) + 18, 16, 'rgba(255,236,190,.09)'); OVER.push((c, cx, cy) => hangingLamp(c, kind, x - cx*2, y - cy*2, w)); };
  if (id === 'office'){ lamp('cones', 8*32 + 16, 2*32 + 6); lamp('cones', 13*32 + 16, 2*32 + 6); lamp('rings', 16*32 + 16, 19*32 + 4); }
  else if (id === 'barbacoa'){ // las tres lámparas negras colgadas sobre la barra, como en la foto
    for (const t of blocksOf('w')) for (let i = 0; i < 3; i++) lamp('pendant', Math.round(t.x0*32 + t.w*32 * (i + .5) / 3), t.y0*32 - 14, 20);
  }
  else if (id === 'upstairs'){
    lamp('bar', 17*32 + 16, 2*32 + 14, 70); lamp('rings', 4*32, 8*32 + 10); lamp('ring', 29*32 + 16, 2*32 + 20);
    // Brasil: la lámpara lineal cuelga cerca de la pared; se ordena con los personajes para no taparle la cara a Fede
    PROPS.push({sy: 1*TS + 15, draw: (c, cx, cy) => hangingLamp(c, 'bar', 9*32 - cx*2, 44 - cy*2, 56)}); // delante de la ventana, como en la foto
  }
  Object.assign(MAPS[id], {canvas: map, props: PROPS, leds: LEDS, steam: STEAM, over: OVER, speakers: SPEAKERS, windows: WINDOWS});
}
