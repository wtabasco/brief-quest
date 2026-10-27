/* Pintor de sprites con volumen: personas, cuerpo de combate y problemas */
"use strict";
/* ================= PINTOR DE SPRITES CON VOLUMEN =================
   Las figuras se arman con formas (elipses, cápsulas, polígonos) en unidades de un
   personaje de 32x48. Cada píxel guarda su material y la normal de la forma que lo
   pintó; al renderizar se sombrea con 4 tonos según la luz, se agregan líneas
   internas donde una forma tapa a otra y un contorno de color alrededor. */
const LIGHT = (() => { const l = [-0.5, -0.72, 0.62], n = Math.hypot(...l); return l.map(v => v / n); })();
class Painter {
  constructor(S, bw, bh, margin){
    this.S = S; this.mg = margin; this.bw = bw; this.bh = bh;
    this.W = Math.ceil((bw + 2*margin) * S); this.H = Math.ceil((bh + 2*margin) * S);
    const N = this.W * this.H;
    this.mat = new Array(N).fill(null); this.nx = new Float32Array(N); this.ny = new Float32Array(N);
    this.tone = new Int8Array(N).fill(-1); this.z = new Int32Array(N); this.zc = 0;
  }
  _box(x0, y0, x1, y1, fn){
    const S = this.S, m = this.mg;
    const X0 = Math.max(0, Math.floor((x0 + m) * S)), X1 = Math.min(this.W - 1, Math.ceil((x1 + m) * S));
    const Y0 = Math.max(0, Math.floor((y0 + m) * S)), Y1 = Math.min(this.H - 1, Math.ceil((y1 + m) * S));
    for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) fn(y * this.W + x, (x + .5) / S - m, (y + .5) / S - m);
  }
  _set(i, mat, nx, ny, o){
    const l = nx*nx + ny*ny; if (l > 1){ const k = 1 / Math.sqrt(l); nx *= k; ny *= k; }
    this.mat[i] = mat; this.nx[i] = nx; this.ny[i] = ny; this.tone[i] = o.tone ?? -1; this.z[i] = this.zc;
  }
  ell(mat, cx, cy, rx, ry, o = {}){
    this.zc++;
    this._box(cx - rx, cy - ry, cx + rx, cy + ry, (i, u, v) => {
      const a = (u - cx) / rx, b = (v - cy) / ry;
      if (a*a + b*b <= 1 && (!o.clip || o.clip(u, v))) this._set(i, mat, a, b, o);
    });
  }
  ring(mat, cx, cy, rx, ry, t, o = {}){
    this.zc++;
    this._box(cx - rx, cy - ry, cx + rx, cy + ry, (i, u, v) => {
      const a = (u - cx) / rx, b = (v - cy) / ry, a2 = (u - cx) / (rx - t), b2 = (v - cy) / (ry - t);
      if (a*a + b*b <= 1 && a2*a2 + b2*b2 > 1 && (!o.clip || o.clip(u, v))) this._set(i, mat, a, b, o);
    });
  }
  cap(mat, x1, y1, x2, y2, r, o = {}){
    this.zc++;
    const dx = x2 - x1, dy = y2 - y1, L2 = dx*dx + dy*dy || 1e-6;
    this._box(Math.min(x1, x2) - r, Math.min(y1, y2) - r, Math.max(x1, x2) + r, Math.max(y1, y2) + r, (i, u, v) => {
      const t = clamp(((u - x1)*dx + (v - y1)*dy) / L2, 0, 1), px = x1 + dx*t, py = y1 + dy*t, ex = u - px, ey = v - py;
      if (ex*ex + ey*ey <= r*r && (!o.clip || o.clip(u, v))) this._set(i, mat, ex / r, ey / r, o);
    });
  }
  poly(mat, pts, o = {}){
    this.zc++;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of pts){ x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const [ncx, ncy, nrx, nry] = o.n || [(x0 + x1)/2, (y0 + y1)/2, (x1 - x0)/2, (y1 - y0)/2];
    this._box(x0, y0, x1, y1, (i, u, v) => {
      let inside = false;
      for (let a = 0, b = pts.length - 1; a < pts.length; b = a++){
        const [xa, ya] = pts[a], [xb, yb] = pts[b];
        if ((ya > v) !== (yb > v) && u < (xb - xa) * (v - ya) / (yb - ya) + xa) inside = !inside;
      }
      if (inside && (!o.clip || o.clip(u, v))) this._set(i, mat, (u - ncx) / nrx, (v - ncy) / nry, o);
    });
  }
  rect(mat, x0, y0, x1, y1, o = {}){ this.poly(mat, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], o); }
  fill(mat, box, test, normal, o = {}){
    this.zc++;
    this._box(box[0], box[1], box[2], box[3], (i, u, v) => { if (test(u, v)){ const [a, b] = normal(u, v); this._set(i, mat, a, b, o); } });
  }
  recolor(from, to, test){ this._box(-this.mg, -this.mg, this.bw + this.mg, this.bh + this.mg, (i, u, v) => { if (from.includes(this.mat[i]) && test(u, v)) this.mat[i] = to; }); }
  retone(mats, tone, test){ this._box(-this.mg, -this.mg, this.bw + this.mg, this.bh + this.mg, (i, u, v) => { if (mats.includes(this.mat[i]) && test(u, v)) this.tone[i] = tone; }); }
  render(colors, flat = '', opt = {}){
    const W = this.W, H = this.H, S = this.S, N = W * H, mat = this.mat;
    const cnv = document.createElement('canvas'); cnv.width = W; cnv.height = H;
    const c2 = cnv.getContext('2d'), img = c2.createImageData(W, H), d = img.data;
    const ramp = {};
    for (const k in colors){ const c = colors[k]; if (!c) continue;
      const od = opt.dark;
      ramp[k] = [lt(c, .34), c, dk(c, .2), dk(c, .36), dk(c, .54), od ? mixC(c, '#1a1424', od) : dk(c, .66), od ? mixC(c, '#1a1424', od - .16) : dk(c, .5)].map(hx); }
    const put = (i, rgb) => { d[i*4] = rgb[0]; d[i*4+1] = rgb[1]; d[i*4+2] = rgb[2]; d[i*4+3] = 255; };
    const lineW = Math.max(1, Math.round(S / 2.5)), castD = Math.max(1, Math.round(S * .9));
    const cast = opt.cast || {};
    for (let i = 0; i < N; i++){
      const m = mat[i]; if (!m || !ramp[m]) continue;
      let t;
      if (flat.includes(m)) t = 1;
      else if (this.tone[i] >= 0) t = this.tone[i];
      else {
        const nx = this.nx[i], ny = this.ny[i], nz = Math.sqrt(Math.max(0, 1 - nx*nx - ny*ny));
        const k = nx*LIGHT[0] + ny*LIGHT[1] + nz*LIGHT[2];
        t = k > .8 ? 0 : k > .3 ? 1 : k > -.22 ? 2 : 3;
      }
      if (!flat.includes(m)){
        const from = cast[m];
        if (from && t < 2) for (let k = 1; k <= castD; k++){ const j = i - k*W; if (j >= 0 && from.includes(mat[j])){ t = 2; break; } }
        const x = i % W;
        outer: for (let k = 1; k <= lineW; k++){
          for (const j of [i - k*W, i + k*W, x - k >= 0 ? i - k : -1, x + k < W ? i + k : -1]){
            if (j < 0 || j >= N) continue;
            const q = mat[j];
            if (q && q !== m && !flat.includes(q) && this.z[j] < this.z[i]){ t = 4; break outer; }
          }
        }
      }
      put(i, ramp[m][t]);
    }
    // contorno de color (más claro arriba a la izquierda)
    let owner = mat.slice();
    for (let pass = 0; pass < (opt.outline || 1); pass++){
      const next = owner.slice();
      for (let i = 0; i < N; i++){
        if (owner[i]) continue;
        const x = i % W;
        const nb = [[i + W, 0], [x + 1 < W ? i + 1 : -1, 0], [i - W, 1], [x - 1 >= 0 ? i - 1 : -1, 1]];
        for (const [j, light] of nb){
          if (j < 0 || j >= N) continue;
          const q = owner[j]; if (!q || !ramp[q]) continue;
          put(i, light ? ramp[q][5] : ramp[q][6]); next[i] = q; break;
        }
      }
      owner = next;
    }
    c2.putImageData(img, 0, 0);
    return cnv;
  }
}
const triW = x => { const f = x - Math.floor(x); return f < .5 ? f*2 : 2 - f*2; };

/* ================= PERSONAS ================= */
function paintHair(P, L, dir, B){
  const st = L.style || 'short', front = dir === 'down', back = dir === 'up', side = !front && !back;
  const hcx = side ? 16.4 : 16, hcy = 13.3 + B;
  let rx = 12.3, ry = 11.6;
  if (st === 'curly'){ rx = 13.7; ry = 12.4; }
  if (st === 'bob'){ rx = 12.9; ry = 12.1; }
  const inVol = (u, v) => ((u - hcx)/rx)**2 + ((v - hcy)/ry)**2 <= 1;
  const headIn = (u, v) => side ? ((u - 15.4)/10.6)**2 + ((v - 15 - B)/10.5)**2 <= 1 : ((u - 16)/11.2)**2 + ((v - 15 - B)/10.5)**2 <= 1;
  if (st === 'bald'){
    if (front){ P.ell('h', 5.6, 13.8 + B, 1.3, 2.6); P.ell('h', 26.4, 13.8 + B, 1.3, 2.6); P.ell('g', 12, 8.6 + B, 2.8, 1.4); }
    else if (back){ P.fill('h', [3, 12 + B, 29, 26 + B], (u, v) => headIn(u, v) && v > 14.5 + B && v < 22.5 + B, (u, v) => [(u - 16)/11, (v - 18 - B)/6]); P.ell('g', 12.5, 8 + B, 3.2, 1.6); }
    else { P.fill('h', [13, 11 + B, 27, 24 + B], (u, v) => headIn(u, v) && u > 16.5 && v > 13 + B && v < 22 + B && Math.hypot(u - 19.6, v - 17.4 - B) > 2.4, (u, v) => [(u - 21)/6, (v - 17 - B)/6]); P.ell('g', 10.6, 8 + B, 2.8, 1.3); }
    return;
  }
  let test, box;
  if (front){
    const bang = ({
      short: u => 11.6 + 1.8*triW(u/2.6), fringe: u => 10.1 + .2*(u - 5) + 1.6*triW(u/2.9),
      curly: u => 11.9 + 1.7*Math.abs(Math.sin(u*1.25)), long: u => 9.3 + .4*Math.abs(u - 16) + .7*triW(u/2),
      pony: u => 10.4 + .3*Math.abs(u - 16) + 1.1*triW(u/2.5), bob: u => 12.4 - .24*(u - 16), spiky: u => 11.2 + 2.5*triW(u/2.2),
    })[st] || (u => 11.6);
    const sideEnd = ({short: 18, fringe: 18.8, curly: 19.6, long: 24, pony: 16.6, bob: 25.4, spiky: 17})[st] ?? 18;
    test = (u, v) => inVol(u, v) && (v < bang(u) + B || ((u < 6.8 || u > 25.2) && v < sideEnd + B));
    box = [hcx - rx, hcy - ry, hcx + rx, hcy + ry];
  } else if (back){
    const end = ({short: 23.6, fringe: 23.8, curly: 24.6, long: 38, pony: 23, bob: 25.8, spiky: 23})[st] ?? 23.6;
    test = (u, v) => (inVol(u, v) && v < end + B) || (st === 'long' && v >= 13 + B && v < end + B && Math.abs(u - 16) < 12.2 - Math.max(0, v - B - 33) * 1.4);
    box = [hcx - rx, hcy - ry, hcx + rx, end + B + 1];
  } else {
    const bang = u => (({fringe: 10.5 + .1*(u - 4) + 1.5*triW(u/2.8), spiky: 11 + 2.4*triW(u/2.2), curly: 11.8 + 1.6*Math.abs(Math.sin(u*1.2))})[st] ?? (11.3 + .14*(u - 4) + 1.5*triW(u/2.6)));
    const backEnd = ({short: 23, fringe: 23, curly: 24, long: 26, pony: 21, bob: 25.5, spiky: 22.5})[st] ?? 23;
    const eu = 19.6, ev = 17.4 + B;
    test = (u, v) => inVol(u, v) && (v < bang(u) + B || (u > 15.2 + (v - B - 10)*.18 && v < backEnd + B && !(st !== 'bob' && st !== 'long' && Math.hypot(u - eu, (v - ev)*.9) < 2.9)));
    box = [hcx - rx, hcy - ry, hcx + rx, hcy + ry];
  }
  P.fill('h', box, test, (u, v) => [(u - hcx)/rx, clamp((v - hcy)/ry, -1, 1) * .9]);
  // volumen extra
  if (st === 'curly') for (let a = 3.5; a <= 5.95; a += .42) P.ell('h', hcx + Math.cos(a)*rx*.88, hcy + Math.sin(a)*ry*.9, 2.8, 2.6);
  if (st === 'spiky') [[8.5, 5, 6.2, 1.2], [12.5, 3.4, 11.6, -.4], [17, 3.2, 18, -.6], [21.5, 4.6, 24.4, 1]].forEach(([a, b, c, d]) => P.poly('h', [[(side ? a + 1 : a) - 2, b + B + 1.5], [(side ? a + 1 : a) + 2, b + B + 1.5], [side ? c + 2 : c, d + B]], {n: [16, 8 + B, 10, 8]}));
  if (st === 'long' && front){ P.cap('h', 6.4, 18 + B, 6.9, 29 + B, 2.3); P.cap('h', 25.6, 18 + B, 25.1, 29 + B, 2.3); }
  if (st === 'pony' && back){ P.cap('h', 16, 21 + B, 16.6, 34 + B, 3); P.ell('K', 16, 21.6 + B, 2, 1.3); }
  if (st === 'pony' && side) P.ell('K', 23.6, 15.2 + B, 1.3, 1.8);
  // brillo y mechones
  P.retone(['h'], 0, (u, v) => { const a = (u - hcx + 3)/(rx*.6), b = (v - hcy + 2.6)/(ry*.46), d = a*a + b*b; return d > .72 && d < 1.08 && v < hcy - .5 && u < hcx + 4; });
  P.retone(['h'], 3, (u, v) => v > hcy - 5 && v < hcy + (back ? 22 : 8) && [hcx - 6.5, hcx - 2.2, hcx + 2.6, hcx + 7].some(x0 => Math.abs(u - (x0 + (v - hcy)*.24)) < .3));
}
function paintHeadBack(P, L, dir, B){
  const front = dir === 'down', side = dir === 'left' || dir === 'right', st = L.style || 'short';
  if (front && st === 'long') P.fill('h', [3, 15 + B, 29, 41], (u, v) => v > 16 + B && ((u - 16)/12.4)**2 + ((v - 27 - B)/12.2)**2 <= 1, (u, v) => [(u - 16)/12, (v - 27 - B)/12]);
  if (front && st === 'bob') P.ell('h', 16, 20 + B, 13, 8.4, {clip: (u, v) => v > 15 + B});
  if (side && st === 'pony') P.cap('h', 24.4, 15 + B, 27.6, 28.5 + B, 2.6);
  if (side && st === 'long') P.fill('h', [13, 13 + B, 29, 41], (u, v) => v > 14 + B && ((u - 20.5)/7.2)**2 + ((v - 25 - B)/13)**2 <= 1, (u, v) => [(u - 20.5)/7, (v - 25 - B)/13]);
}
function paintHead(P, L, dir, B){
  const front = dir === 'down', back = dir === 'up', side = !front && !back;
  // cabeza
  const hy = 15 + B;
  if (!side){ P.ell('s', 5.4, 17.4 + B, 1.9, 2.4); P.ell('s', 26.6, 17.4 + B, 1.9, 2.4); }
  P.ell('s', side ? 15.4 : 16, hy, side ? 10.5 : 11.1, 10.4);
  if (side){ P.ell('s', 5.6, 19.3 + B, 1.6, 1.5); P.ell('s', 19.6, 17.4 + B, 1.8, 2.4); P.ell('s', 19.8, 17.6 + B, .8, 1.2, {tone: 3}); }
  if (front){
    const ey = 17.4 + B;
    P.cap('b', 9.6, 13.7 + B, 13.2, 13.1 + B, .58); P.cap('b', 18.8, 13.1 + B, 22.4, 13.7 + B, .58);
    for (const ex of [11.5, 20.5]){ P.ell('e', ex, ey, 1.6, 2.4); if (P.S >= 2) P.ell('i', ex + .15, ey + .9, 1.05, 1.25); P.ell('w', ex - .55, ey - .95, .62, .78); }
    if (L.blush){ P.ell('n', 9.2, 20.7 + B, 1.8, .9); P.ell('n', 22.8, 20.7 + B, 1.8, .9); }
    P.ell('s', 16.6, 19.9 + B, .6, .65, {tone: 2});
    P.cap('m', 15, 22.4 + B, 17, 22.4 + B, .52);
  } else if (side){
    const ey = 17.4 + B;
    P.cap('b', 8, 13.5 + B, 11.6, 13.1 + B, .58);
    P.ell('e', 9.9, ey, 1.45, 2.4); if (P.S >= 2) P.ell('i', 9.8, ey + .9, .95, 1.25); P.ell('w', 9.4, ey - .95, .58, .78);
    if (L.blush) P.ell('n', 11.6, 20.7 + B, 1.7, .9);
    P.cap('m', 7.3, 22.4 + B, 8.9, 22.2 + B, .52);
  }
  const inHead = (u, v) => side ? ((u - 15.4)/10.5)**2 + ((v - hy)/10.4)**2 <= 1.02 : ((u - 16)/11.1)**2 + ((v - hy)/10.4)**2 <= 1.02;
  if (L.beard){
    if (front){ P.ell('B', 16, 21.7 + B, 10.9, 6, {clip: (u, v) => inHead(u, v) && v > 19.5 + B}); P.ell('m', 16, 22.8 + B, 1.35, .62); }
    else if (side){ P.ell('B', 12, 21.7 + B, 8.3, 5.2, {clip: (u, v) => inHead(u, v) && v > 19.7 + B && u < 18.4}); P.cap('m', 7.3, 22.5 + B, 8.9, 22.3 + B, .5); }
  }
  if (L.mustache){ if (front) P.ell('U', 16, 21.3 + B, 3.8, 1.2); else if (side) P.ell('U', 7.7, 21.3 + B, 2.5, 1.05); }
  paintHair(P, L, dir, B);
  if (L.glasses){
    if (front){ for (const ex of [11.5, 20.5]) P.ring('G', ex, 17.4 + B, 3.1, 2.7, .78); P.cap('G', 14.4, 17 + B, 17.6, 17 + B, .42); P.cap('G', 5.4, 16.5 + B, 8.5, 16.9 + B, .42); P.cap('G', 23.5, 16.9 + B, 26.6, 16.5 + B, .42); }
    else if (side){ P.ring('G', 10, 17.4 + B, 2.9, 2.7, .78); P.cap('G', 12.8, 17 + B, 18.4, 16.4 + B, .42); }
  }
  if (L.shades){
    if (front){ for (const ex of [11.3, 20.7]) P.ell('E', ex, 17.4 + B, 3.5, 2.4); P.cap('E', 14.4, 16.8 + B, 17.6, 16.8 + B, .55); P.ell('w', 9.7, 16.6 + B, .95, .6); P.ell('w', 19.1, 16.6 + B, .95, .6); }
    else if (side){ P.ell('E', 10, 17.4 + B, 3.1, 2.3); P.cap('E', 12.8, 16.9 + B, 18.4, 16.4 + B, .48); P.ell('w', 8.8, 16.6 + B, .85, .55); }
  }
  // auriculares (accesorio disponible para cualquier personaje: headphones en looks.js)
  if (L.headphones){
    if (side){ P.cap('D', 19.8, 14 + B, 17.8, 6.6 + B, .95); P.cap('D', 17.8, 6.6 + B, 13.2, 4.4 + B, .95); P.ell('D', 19.9, 17.6 + B, 2.5, 3.3); P.ell('d', 19.5, 17 + B, 1, 1.5); }
    else {
      P.cap('D', 5.6, 14.6 + B, 8.2, 7.2 + B, .9); P.cap('D', 8.2, 7.2 + B, 16, 4.1 + B, .9); P.cap('D', 16, 4.1 + B, 23.8, 7.2 + B, .9); P.cap('D', 23.8, 7.2 + B, 26.4, 14.6 + B, .9);
      P.ell('D', 5.1, 17.6 + B, 2.4, 3.3); P.ell('D', 26.9, 17.6 + B, 2.4, 3.3); if (front){ P.ell('d', 4.6, 17 + B, .9, 1.4); P.ell('d', 26.4, 17 + B, .9, 1.4); }
    }
  }
}
function paintPerson(L, dir, step, S, pose){
  const mg = pose ? 6 : 2;
  const P = new Painter(S, 32, 48, mg);
  const front = dir === 'down', back = dir === 'up', side = !front && !back;
  const B = step ? -0.8 : 0, st = L.style || 'short';
  const sleeve = L.jacket ? 'J' : 'a', torso = L.jacket && !front ? 'J' : 't';
  // pelo de atrás y mochila lateral (quedan detrás del cuerpo)
  paintHeadBack(P, L, dir, B);
  if (side && L.backpack) P.ell('k', 23.4, 31.5 + B, 3.8, 6);
  // piernas y zapatos
  if (!side){
    const lf = step === 1 ? -2 : 0, rf = step === 2 ? -2 : 0;
    P.cap('p', 12.4, 35 + B, 12.4, 42.4 + lf, 3.3); P.cap('p', 19.6, 35 + B, 19.6, 42.4 + rf, 3.3);
    P.ell('f', 11.8, 44.8 + lf, 4.1, 2.5); P.ell('f', 20.2, 44.8 + rf, 4.1, 2.5);
  } else if (step === 0){
    P.cap('p', 15.6, 35 + B, 15.6, 42.6, 3.4); P.ell('f', 14.2, 45, 4.8, 2.5);
  } else {
    const f = step === 1;
    P.cap('p', 16.6, 35 + B, f ? 19.6 : 12.4, 42.4, 3, {tone: 2}); P.ell('f', f ? 20 : 11.6, 45, 4, 2.3, {tone: 2});
    P.cap('p', 15, 35 + B, f ? 11.4 : 19.2, 42.6, 3.1); P.ell('f', f ? 10.4 : 18.6, 45.1, 4.4, 2.4);
  }
  // cuello, cadera y torso
  P.rect('s', side ? 13.4 : 14.2, 23 + B, side ? 17.2 : 17.8, 27.5 + B, {tone: 2});
  if (!side){
    P.rect('p', 10.4, 34.4 + B, 21.6, 39 + B);
    P.poly(torso, [[9.6, 26.6 + B], [22.4, 26.6 + B], [21.9, 37.6 + B], [10.1, 37.6 + B]], {n: [16, 30 + B, 8.5, 8.5]});
    P.ell(torso, 10.7, 28.7 + B, 3.2, 2.9); P.ell(torso, 21.3, 28.7 + B, 3.2, 2.9);
  } else {
    P.rect('p', 11.8, 34.4 + B, 20, 39 + B);
    P.poly(torso, [[11, 26.6 + B], [20.6, 26.6 + B], [20.2, 37.6 + B], [11.4, 37.6 + B]], {n: [15.4, 30 + B, 6.5, 8.5]});
    P.ell(torso, 15.8, 28.8 + B, 5.1, 2.9);
  }
  // ropa y accesorios del torso
  if (front){
    if (L.jacket){
      P.poly('J', [[9.4, 26.4 + B], [14.2, 26.4 + B], [13.7, 37.8 + B], [9.9, 37.8 + B]], {n: [12, 31 + B, 4.2, 8]});
      P.poly('J', [[17.8, 26.4 + B], [22.6, 26.4 + B], [22.1, 37.8 + B], [18.3, 37.8 + B]], {n: [20, 31 + B, 4.2, 8]});
      P.ell('J', 10.7, 28.7 + B, 3.2, 2.9); P.ell('J', 21.3, 28.7 + B, 3.2, 2.9);
    }
    if (L.collar) P.ell('Q', 16, 26.9 + B, 3.9, 1.7, {clip: (u, v) => v > 26.2 + B});
    if (L.tie) P.poly('Z', [[15.1, 27.2 + B], [16.9, 27.2 + B], [17.5, 34.6 + B], [16, 36.2 + B], [14.5, 34.6 + B]], {n: [16, 31 + B, 1.6, 5]});
    if (L.necklace){ P.cap('K', 13.2, 27.6 + B, 16, 31 + B, .38); P.cap('K', 18.8, 27.6 + B, 16, 31 + B, .38); P.ell('K', 16, 31.9 + B, .95, 1.35); }
    if (L.camera){
      P.cap('C', 11.6, 27 + B, 13.8, 31.5 + B, .45); P.cap('C', 20.4, 27 + B, 18.2, 31.5 + B, .45);
      P.rect('C', 12.4, 31 + B, 19.6, 35.6 + B); P.ell('e', 16, 33.3 + B, 1.8, 1.8); P.ell('w', 15.4, 32.6 + B, .6, .6); P.rect('w', 17.9, 31.6 + B, 19, 32.4 + B);
    }
    if (L.backpack){ P.cap('k', 11.4, 27 + B, 11.9, 35.5 + B, .95); P.cap('k', 20.6, 27 + B, 20.1, 35.5 + B, .95); }
  } else if (back){
    if (L.backpack){
      P.poly('k', [[10.3, 28 + B], [21.7, 28 + B], [21.2, 39.4 + B], [10.8, 39.4 + B]], {n: [16, 33.6 + B, 6.5, 6.5]});
      P.poly('q', [[10.5, 28 + B], [21.5, 28 + B], [21.3, 32.4 + B], [10.7, 32.4 + B]], {n: [16, 30 + B, 6, 3.4]});
      P.rect('q', 13, 34.4 + B, 19, 37.8 + B); P.ell('K', 16, 32.3 + B, 1, 1);
    }
  } else {
    if (L.jacket) P.poly('t', [[11, 26.8 + B], [13.3, 26.8 + B], [12.9, 37.6 + B], [11.5, 37.6 + B]]);
    if (L.camera){ P.rect('C', 9.2, 30.6 + B, 13.2, 34.9 + B); P.ell('e', 9.8, 32.7 + B, 1.2, 1.4); }
    if (L.backpack) P.cap('k', 17.4, 27 + B, 18.4, 34.6 + B, .9);
  }
  // brazos y manos
  if (!side){
    const sw = step === 1 ? 1 : step === 2 ? -1 : 0;
    const lh = [8.3, 36.6 + B + sw*.9], rh = [23.7, 36.6 + B - sw*.9];
    P.cap(sleeve, 9.4, 28.8 + B, lh[0], lh[1] - 1.6, 2.5); P.ell('s', lh[0], lh[1], 2.15, 2.15);
    if (pose === 'point' && front){ P.cap(sleeve, 22.6, 28.8 + B, 28.4, 23, 2.5); P.ell('s', 29.6, 21.8, 2.3, 2.3); P.cap('s', 30.7, 20.6, 32.8, 18.6, .85); }
    else if (pose === 'fist' && front){ P.cap(sleeve, 22.6, 28.8 + B, 28.4, 27.8, 2.5); P.cap(sleeve, 28.4, 27.8, 29, 22.6, 2.4); P.ell('s', 29, 21, 2.8, 2.8); P.cap('s', 27.4, 20, 30.4, 20, .5, {tone: 3}); }
    else {
      P.cap(sleeve, 22.6, 28.8 + B, rh[0], rh[1] - 1.6, 2.5); P.ell('s', rh[0], rh[1], 2.15, 2.15);
      if (L.phone && front){ P.rect('O', rh[0] - 1.3, rh[1] - 3.8, rh[0] + 1.5, rh[1] + .4); P.rect('w', rh[0] - .7, rh[1] - 3.2, rh[0] + .9, rh[1] - 1.6, {tone: 1}); }
    }
  } else {
    const hand = step === 1 ? [11.2, 35.2 + B] : step === 2 ? [20.4, 35.4 + B] : [15.6, 36.8 + B];
    P.cap(sleeve, 16, 28.8 + B, hand[0], hand[1] - 1.5, 2.5); P.ell('s', hand[0], hand[1], 2.15, 2.15);
  }
  if (L.stripe) P.recolor(['t', 'a'], 'X', (u, v) => ((v - B + 30) % 3) < 1.25 && v > 27.5 + B);
  paintHead(P, L, dir, B);
  return P;
}
function personPalette(L){
  const skin = L.skin || '#f0bf98', bp = L.backpack || '#fe7a02';
  return {s: skin, g: lt(skin, .6), b: dk(L.hair, .28), e: '#2a2236', i: '#5a3a2a', w: '#ffffff', m: '#a8473f', n: '#f2948c',
    h: L.hair, t: L.shirt, a: L.sleeve || L.shirt, J: L.jacket || L.shirt, X: L.stripe || L.shirt, Q: L.collar || L.shirt, Z: L.tie || '#e0452b',
    K: L.necklace || L.accent || '#d4b85a', p: L.pants || '#2b3a2e', f: L.shoes || '#3a3040', k: bp, q: lt(bp, .22),
    C: '#34343e', O: '#25253a', G: L.glasses || '#888888', E: '#1d1a2a', B: L.beard || L.hair, U: L.mustache || L.hair,
    D: L.headphones || '#26262c', d: lt(L.headphones || '#26262c', .35)};
}
const PERSON_CAST = {s: ['h'], t: ['s', 'h', 'B'], J: ['s', 'h', 'B'], X: ['s', 'h', 'B'], Q: ['s', 'h', 'B'], Z: ['s', 'B']};
const SPRITE_CACHE = new Map();
function flipCanvas(c){ const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; const x = o.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); return o; }
/* Pintor transformado: permite reutilizar la cabeza del personaje chico en el cuerpo alto */
function xform(P, ox, oy, kx, ky){
  const X = x => ox + x*kx, Y = y => oy + y*ky, kr = (kx + ky) / 2;
  const back = (u, v) => [(u - ox) / kx, (v - oy) / ky];
  const lc = o => (o && o.clip) ? Object.assign({}, o, {clip: (u, v) => o.clip(...back(u, v))}) : o;
  const T = {
    S: P.S,
    ell: (m, cx, cy, rx, ry, o = {}) => P.ell(m, X(cx), Y(cy), rx*kx, ry*ky, lc(o)),
    ring: (m, cx, cy, rx, ry, t, o = {}) => P.ring(m, X(cx), Y(cy), rx*kx, ry*ky, t*kr, lc(o)),
    cap: (m, x1, y1, x2, y2, r, o = {}) => P.cap(m, X(x1), Y(y1), X(x2), Y(y2), r*kr, lc(o)),
    poly: (m, pts, o = {}) => P.poly(m, pts.map(([x, y]) => [X(x), Y(y)]), Object.assign({}, lc(o), {n: o.n ? [X(o.n[0]), Y(o.n[1]), o.n[2]*kx, o.n[3]*ky] : undefined})),
    fill: (m, box, test, normal, o = {}) => P.fill(m, [X(box[0]), Y(box[1]), X(box[2]), Y(box[3])], (u, v) => test(...back(u, v)), (u, v) => normal(...back(u, v)), o),
    recolor: (from, to, test) => P.recolor(from, to, (u, v) => test(...back(u, v))),
    retone: (mats, tone, test) => P.retone(mats, tone, (u, v) => test(...back(u, v))),
  };
  T.rect = (m, x0, y0, x1, y1, o = {}) => T.poly(m, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], o);
  return T;
}
/* Cuerpo alto para combate: cabeza, cuello, hombros, codos, rodillas y poses */
const TALL_POSES = {
  idle:  {L: [[15, 31], [12.6, 45], [12.4, 57.5], 'rest'], R: [[33, 31], [35.4, 45], [35.6, 57.5], 'rest']},
  point: {L: [[15, 31], [8.4, 40.6], [2.4, 44.4], 'point'], R: [[33, 31], [38.8, 41.4], [33.6, 49.6], 'fist']},
  fist:  {L: [[15, 31], [12.6, 45], [12.4, 57.5], 'rest'], R: [[33, 31], [40.4, 38.4], [39.6, 27], 'fist']},
  phone: {L: [[15, 31], [12.6, 45], [12.4, 57.5], 'rest'], R: [[33, 31], [38.6, 42.4], [32.6, 25], 'phone'], late: true},
  cheer: {L: [[15, 31], [8.6, 21.4], [5.8, 10.4], 'open'], R: [[33, 31], [39.4, 21.4], [42.2, 10.4], 'open']},
  wide:  {L: [[15, 31], [5.8, 34], [-2.4, 30.4], 'open'], R: [[33, 31], [42.2, 34], [50.4, 30.4], 'open']},
  wave:  {L: [[15, 31], [12.6, 45], [12.4, 57.5], 'rest'], R: [[33, 31], [40.8, 24.4], [42.4, 13], 'open']},
};
function tallArm(P, sl, longSleeve, [sh, el, wr, hand]){
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0])*t, a[1] + (b[1] - a[1])*t];
  if (longSleeve){ P.cap(sl, sh[0], sh[1], el[0], el[1], 3.4); P.ell(sl, el[0], el[1], 3, 3); P.cap(sl, el[0], el[1], wr[0], wr[1], 2.9); P.ell(sl, wr[0], wr[1], 3, 2.3, {tone: 2}); }
  else { const m = lerp(sh, el, .5); P.cap('s', m[0], m[1], el[0], el[1], 2.8); P.ell('s', el[0], el[1], 2.7, 2.7); P.cap('s', el[0], el[1], wr[0], wr[1], 2.5); P.cap(sl, sh[0], sh[1], m[0], m[1], 3.6); P.ell(sl, m[0], m[1], 3.4, 2.4, {tone: 2}); }
  const dl = Math.hypot(wr[0] - el[0], wr[1] - el[1]) || 1, dx = (wr[0] - el[0]) / dl, dy = (wr[1] - el[1]) / dl;
  const hc = [wr[0] + dx*2.3, wr[1] + dy*2.3];
  if (hand === 'point'){ P.ell('s', hc[0], hc[1], 2.6, 2.4); P.cap('s', hc[0], hc[1], hc[0] + dx*4.6, hc[1] + dy*4.6, .95); }
  else if (hand === 'fist'){ P.ell('s', hc[0], hc[1], 3, 2.9); P.cap('s', hc[0] - 1.7, hc[1] - 1, hc[0] + 1.7, hc[1] - 1, .45, {tone: 3}); }
  else if (hand === 'open'){ P.ell('s', hc[0], hc[1], 2.5, 2.7); P.cap('s', hc[0], hc[1], hc[0] + dx*3.6, hc[1] + dy*3.6, 1.7); P.cap('s', hc[0], hc[1], hc[0] + dy*3, hc[1] - dx*3, .8); }
  else if (hand === 'phone'){ P.ell('s', hc[0], hc[1], 2.6, 2.8); P.rect('O', hc[0] - 1.8, hc[1] - 5.2, hc[0] + 1.6, hc[1] + 1); P.rect('w', hc[0] - 1.2, hc[1] - 4.4, hc[0] + 1, hc[1] - 2.2, {tone: 1}); P.ell('s', hc[0] + .4, hc[1] + .4, 2.2, 1.8); }
  else P.ell('s', hc[0], hc[1], 2.5, 3.1);
}
function paintTall(L, dir, pose, S){
  const P = new Painter(S, 48, 100, 8), back = dir === 'up';
  const H = xform(P, 24 - 16*.68, 13.6 - 15*.8, .68, .8);
  const longSleeve = L.sleeves !== 'short', sl = L.jacket ? 'J' : 'a', torso = (L.jacket && back) ? 'J' : 't';
  const ps = TALL_POSES[pose] || TALL_POSES.idle;
  paintHeadBack(H, L, back ? 'up' : 'down', 0);
  // piernas: algo separadas, con rodillas y zapatos
  for (const [hip, knee, ank, sx] of [[[20.2, 57], [19.2, 75.4], [18.6, 90.6], -1], [[27.8, 57], [29, 75.4], [29.8, 90.6], 1]]){
    P.cap('p', hip[0], hip[1], knee[0], knee[1], 4.3); P.cap('p', knee[0], knee[1], ank[0], ank[1], 3.6);
    P.ell('f', ank[0] + sx*.8, 93.4, 5.2, 3); P.ell('f', ank[0], 91.2, 3.8, 2.4); P.ell('f', ank[0] + sx*1.6, 92.2, 1.6, .9, {tone: 0});
  }
  P.poly('p', [[16.4, 48.4], [31.6, 48.4], [32.8, 59.4], [15.2, 59.4]], {n: [24, 53, 9, 7]});
  P.rect('s', 21.2, 18.6, 26.8, 28.4, {tone: 2});
  P.poly(torso, [[13.2, 27.4], [34.8, 27.4], [31.8, 50.6], [16.2, 50.6]], {n: [24, 37, 12.5, 14]});
  P.ell(torso, 15.4, 30.6, 4.2, 3.9); P.ell(torso, 32.6, 30.6, 4.2, 3.9);
  if (!back){
    if (L.jacket){
      P.poly('J', [[13, 27.2], [20.8, 27.2], [20.2, 54], [16, 54]], {n: [17, 39, 5, 14]});
      P.poly('J', [[27.2, 27.2], [35, 27.2], [32, 54], [27.8, 54]], {n: [31, 39, 5, 14]});
      P.ell('J', 15.4, 30.6, 4.2, 3.9); P.ell('J', 32.6, 30.6, 4.2, 3.9);
      P.poly('J', [[20.8, 27.2], [23.2, 33.6], [20.6, 36]], {tone: 3}); P.poly('J', [[27.2, 27.2], [24.8, 33.6], [27.4, 36]], {tone: 3});
    }
    if (L.collar) P.ell('Q', 24, 27.8, 5.2, 2.3, {clip: (u, v) => v > 27});
    if (L.tie) P.poly('Z', [[23, 28.2], [25, 28.2], [25.9, 43.8], [24, 46.6], [22.1, 43.8]], {n: [24, 37, 2, 9]});
    if (L.necklace){ P.cap('K', 19.6, 28.2, 24, 36.2, .45); P.cap('K', 28.4, 28.2, 24, 36.2, .45); P.ell('K', 24, 37.4, 1.3, 1.8); }
    if (L.camera){ P.cap('C', 17.6, 28, 20, 37.4, .55); P.cap('C', 30.4, 28, 28, 37.4, .55); P.rect('C', 19, 37, 29, 44.4); P.ell('e', 24, 40.6, 2.7, 2.7); P.ell('w', 23.2, 39.6, .8, .8); }
    if (L.backpack){ P.cap('k', 18.4, 28, 19.2, 46, 1.3); P.cap('k', 29.6, 28, 28.8, 46, 1.3); }
  } else if (L.backpack){
    P.poly('k', [[15.4, 30.4], [32.6, 30.4], [31.8, 53], [16.2, 53]], {n: [24, 41, 9, 12]});
    P.poly('q', [[15.6, 30.4], [32.4, 30.4], [32.2, 37.4], [15.8, 37.4]], {n: [24, 33.5, 9, 4]});
    P.rect('q', 19, 42.4, 29, 49.6); P.ell('K', 24, 37.6, 1.3, 1.3);
    P.cap('k', 17.2, 28, 16.6, 31.6, 1.2); P.cap('k', 30.8, 28, 31.4, 31.6, 1.2);
  }
  if (!ps.late){ tallArm(P, sl, longSleeve, ps.L); tallArm(P, sl, longSleeve, ps.R); }
  if (L.stripe) P.recolor(['t', 'a'], 'X', (u, v) => ((v + 40) % 4) < 1.7 && v > 28.6);
  paintHead(H, L, back ? 'up' : 'down', 0);
  if (ps.late){ tallArm(P, sl, longSleeve, ps.L); tallArm(P, sl, longSleeve, ps.R); }
  return P;
}
function personSprite(key, dir, step, big = false, pose = null){
  const id = key + '|' + dir + '|' + step + '|' + big + '|' + pose;
  let c = SPRITE_CACHE.get(id);
  if (!c && typeof artSprite === 'function'){ c = artSprite(key, dir, step, big, pose); if (c) SPRITE_CACHE.set(id, c); }
  if (!c){
    const L = LOOKS[key];
    if (big){
      const S = dir === 'up' ? 1.15 : .72;
      const P = paintTall(L, dir, pose || 'idle', S);
      c = P.render(personPalette(L), 'eiwmnbg', {outline: 1, cast: PERSON_CAST, dark: .88});
      c.cx = (P.mg + 24) * S; c.foot = (P.mg + 96) * S;
    } else {
      const S = WORLD_S, P = paintPerson(L, dir === 'right' ? 'left' : dir, step, S, null);
      c = P.render(personPalette(L), 'eiwmnbg', {outline: 1, cast: PERSON_CAST, dark: .9});
      if (dir === 'right') c = flipCanvas(c);
      c.cx = Math.round((P.mg + 16) * S); c.foot = Math.round((P.mg + 47.2) * S);
    }
    SPRITE_CACHE.set(id, c);
  }
  return c;
}
/* Escala de los personajes generados en el mundo: misma altura que los diseñados (60 px) */
const WORLD_S = 1.25;
/* x, y en píxeles lógicos (16 px por baldosa); se dibuja al doble con los pies en la base de la baldosa */
function drawChar(c, key, px, py, dir, step){
  const X = Math.round(px*2), Y = Math.round(py*2), s = personSprite(key, dir, step), k = s.k || 1;
  c.fillStyle = PX.shadow; c.fillRect(X + 6, Y + 27, 20, 5); c.fillRect(X + 4, Y + 28, 24, 3);
  if (k === 1) c.drawImage(s, Math.round(X + 16 - s.cx), Math.round(Y + 30 - s.foot));
  else drawSprite(c, s, X + 16 - s.cx*k, Y + 30 - s.foot*k, s.width*k, s.height*k, RES);
}
/* Dibuja un sprite escalado: si se achica en pantalla se suaviza (para no perder líneas finas),
   si se agranda va con píxel nítido */
function drawSprite(c, img, x, y, w, h, scale){
  const shrink = (w / img.width) * scale < .999;
  if (shrink){ c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; }
  const snap = v => Math.round(v * scale) / scale;
  c.drawImage(img, snap(x), snap(y), w, h);
  if (shrink) c.imageSmoothingEnabled = false;
}

/* ================= PROBLEMAS (rivales de La Base y jefe final) ================= */
const CREATURES = {
  scope: {box: 40, flat: 'ewm', col: {a: '#9ccc12', d: '#6f9a00', y: '#f2c94c', o: '#fe7a02', w: '#ffffff', e: '#1e1630', m: '#3a1530'}, draw(P){
    P.ell('a', 13, 38, 3.8, 1.9); P.ell('a', 27, 38, 3.8, 1.9);
    P.ell('a', 20, 27, 13.5, 11.5); P.ell('a', 20, 17.5, 9.5, 8);
    P.cap('a', 9, 25, 3.5, 17.5, 2.3); P.cap('a', 31, 25, 36.5, 17.5, 2.3); P.cap('a', 10, 32, 4, 35, 2.1); P.cap('a', 30, 32, 36, 35, 2.1);
    P.rect('y', .8, 11.6, 6.2, 16.8); P.rect('o', 33.8, 11.2, 39.2, 16.4); P.rect('o', .8, 32.6, 6, 37.8); P.rect('y', 34, 32.4, 39.2, 37.6);
    P.ell('d', 29, 28, 1.7, 1.3); P.ell('d', 11, 30.5, 1.4, 1.1); P.ell('d', 25, 35, 1.3, 1);
    P.ell('w', 15.5, 20.5, 3.4, 4); P.ell('w', 24.5, 20.5, 3.4, 4); P.ell('e', 16.3, 21.6, 1.8, 2.4); P.ell('e', 25.3, 21.6, 1.8, 2.4);
    P.ell('w', 15.7, 20.4, .65, .75); P.ell('w', 24.7, 20.4, .65, .75);
    P.cap('m', 11.8, 15.4, 17.6, 17.2, .75); P.cap('m', 28.2, 15.4, 22.4, 17.2, .75);
    P.ell('m', 20, 29.4, 5.6, 2.6, {clip: (u, v) => v > 28.8}); P.rect('w', 16.6, 28.9, 23.4, 29.9);
  }},
  reunion: {box: 40, flat: 'ewmc', col: {a: '#8a4d8d', d: '#5a2a5c', b: '#c8bffa', c: '#fbfaf4', r: '#fe7a02', y: '#f2c94c', w: '#ffffff', e: '#1e1630', m: '#3a1530', g: '#9aa79c'}, draw(P){
    P.cap('a', 9, 31, 1.6, 24.5, 3.2);
    P.cap('a', 13, 33, 12.4, 38.4, 3); P.cap('a', 23, 33, 23.6, 38.4, 3); P.ell('d', 12, 39.2, 3.7, 1.6); P.ell('d', 24, 39.2, 3.7, 1.6);
    P.poly('y', [[10, 21.5], [12.2, 16.6], [14.2, 21]]); P.poly('y', [[14.5, 19.6], [16.8, 14.8], [18.8, 19.4]]);
    P.ell('a', 18, 28, 11, 9.2);
    P.cap('a', 23, 24, 28, 13.5, 4.4); P.ell('a', 29.5, 11, 7, 5.7); P.ell('a', 34.6, 13, 4.5, 3.7);
    P.ell('e', 37.2, 12, .55, .55); P.cap('m', 33, 15.9, 37.6, 15.1, .42);
    P.ell('w', 29.4, 9.9, 2.1, 2.3); P.ell('e', 29.8, 10.7, 1.15, 1.25); P.ell('a', 29.4, 8.7, 2.5, 1.7, {tone: 2, clip: (u, v) => v < 9.6});
    P.rect('c', 11.6, 22, 23, 33.4); P.rect('r', 11.6, 22, 23, 24.8);
    P.ell('e', 14.2, 22, .55, 1); P.ell('e', 20.4, 22, .55, 1);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) P.rect((i === 2 && j === 1) ? 'r' : 'g', 12.9 + i*2.5, 26.2 + j*2.3, 14.3 + i*2.5, 27.4 + j*2.3);
    P.cap('a', 12.6, 25.6, 11.4, 30, 1.6); P.cap('a', 23.4, 25.6, 24.2, 30, 1.6);
  }},
  archivo: {box: 40, flat: 'ewmrl', col: {a: '#f2c94c', d: '#c99a2a', w: '#fbfaf4', l: '#c9cfc0', r: '#e0452b', e: '#1e1630', m: '#3a1530'}, draw(P){
    P.cap('d', 14, 33, 13, 38.4, 1.6); P.cap('d', 26, 33, 27, 38.4, 1.6); P.ell('m', 12.4, 38.8, 2.6, 1.2); P.ell('m', 27.6, 38.8, 2.6, 1.2);
    P.rect('d', 5, 9, 35, 34); P.rect('d', 5, 6.2, 16, 10);
    P.rect('w', 9.6, 4.6, 32, 18); P.rect('w', 7.6, 6.6, 30, 20);
    for (const y of [8.4, 10.6, 12.8]) P.rect('l', 10, y, 26, y + .65);
    P.poly('a', [[4, 14.4], [36, 14.4], [35, 34.6], [5, 34.6]], {n: [20, 23, 17, 12]});
    P.rect('w', 13.6, 25.8, 26.4, 31.4); P.cap('r', 16.4, 27.2, 17.6, 30, .45); P.cap('r', 18.8, 27.2, 17.6, 30, .45); P.cap('r', 20.4, 27.3, 22.8, 27.3, .45); P.cap('r', 22.8, 27.3, 21.2, 30.1, .45);
    P.ell('w', 13.8, 19.8, 2.7, 2.9); P.ell('w', 26.2, 19.8, 2.7, 2.9); P.ell('e', 14.4, 20.4, 1.4, 1.7); P.ell('e', 25.6, 20.4, 1.4, 1.7);
    P.cap('m', 10.8, 16.2, 16, 17.6, .6); P.cap('m', 29.2, 16.2, 24, 17.6, .6);
    P.cap('m', 16, 24, 18, 22.9, .42); P.cap('m', 18, 22.9, 20, 24, .42); P.cap('m', 20, 24, 22, 22.9, .42); P.cap('m', 22, 22.9, 24, 24, .42);
  }},
  wifi: {box: 40, flat: 'ewmgr', col: {a: '#8a9a8f', d: '#5b6b5e', s: '#cfd8d0', k: '#2b3530', g: '#92c100', r: '#e0452b', b: '#9ed3ec', w: '#ffffff', e: '#1e1630', m: '#3a1530'}, draw(P){
    P.cap('k', 9, 20, 6, 5, 1.15); P.cap('k', 31, 20, 34, 5, 1.15); P.ell('k', 6, 4.6, 1.6, 1.6); P.ell('k', 34, 4.6, 1.6, 1.6);
    P.ring('r', 20, 15, 7, 7, 1.15, {clip: (u, v) => v < 12.5 && Math.abs(u - 20) < 5.6}); P.ring('r', 20, 15, 11, 11, 1.15, {clip: (u, v) => v < 10 && !(u > 17.6 && u < 22.6)}); P.ell('r', 20, 13.6, 1.4, 1.4);
    P.rect('k', 6, 33, 10, 35.6); P.rect('k', 30, 33, 34, 35.6);
    P.poly('a', [[4, 19.6], [36, 19.6], [37.6, 33.4], [2.4, 33.4]], {n: [20, 26, 18, 9]}); P.poly('s', [[5, 17.6], [35, 17.6], [36, 20.6], [4, 20.6]]);
    P.cap('e', 9.6, 22.8, 13, 26.2, .6); P.cap('e', 13, 22.8, 9.6, 26.2, .6); P.cap('e', 27, 22.8, 30.4, 26.2, .6); P.cap('e', 30.4, 22.8, 27, 26.2, .6);
    P.ring('m', 20, 30.6, 3.2, 2.1, .55, {clip: (u, v) => v < 30.6});
    ['g', 'g', 'r', 'r'].forEach((m, i) => P.ell(m, 25 + i*2.7, 30.2, .95, .95));
    P.ell('b', 35.6, 14.6, 1.3, 1.9);
  }},
  feedback: {box: 40, flat: 'ewmry', col: {a: '#fe7a02', d: '#c75f00', w: '#ffffff', e: '#1e1630', m: '#4a1d00', r: '#e0452b', y: '#f2c94c'}, draw(P){
    P.cap('d', 15, 29.5, 14, 36, 1.5); P.cap('d', 25, 29.5, 26, 36, 1.5); P.ell('m', 13.4, 36.6, 2.5, 1.2); P.ell('m', 26.6, 36.6, 2.5, 1.2);
    P.poly('a', [[11, 26.4], [18.6, 29], [6.6, 37]]);
    P.ell('a', 20, 18, 16, 12.6);
    P.ell('w', 13.6, 14.5, 3.1, 3.4); P.ell('w', 26.4, 14.5, 3.1, 3.4); P.ell('e', 14.2, 15.2, 1.5, 1.9); P.ell('e', 25.8, 15.2, 1.5, 1.9);
    P.cap('m', 9.8, 10.4, 16.2, 12.6, .8); P.cap('m', 30.2, 10.4, 23.8, 12.6, .8);
    P.ell('m', 20, 22.6, 6.6, 4.3); P.ell('r', 20, 25, 3.9, 1.9, {clip: (u, v) => ((u - 20)/6.6)**2 + ((v - 22.6)/4.3)**2 <= 1});
    P.rect('w', 15, 18.6, 25, 19.8, {clip: (u, v) => ((u - 20)/6.6)**2 + ((v - 22.6)/4.3)**2 <= 1});
    P.cap('y', 34.2, 1.6, 33.4, 6.8, .85); P.ell('y', 33.1, 8.9, .85, .85); P.cap('y', 37.4, 2.8, 36.6, 7.6, .85); P.ell('y', 36.3, 9.6, .85, .85);
  }},
  bug: {box: 40, flat: 'ewgl', col: {a: '#e0452b', d: '#a82f1c', k: '#2e2638', w: '#ffffff', e: '#1e1630', g: '#92c100', l: '#c8bffa'}, draw(P){
    [[11, 22, 4, 18], [10, 27, 3, 28.5], [11, 32, 5, 37]].forEach(([a, b, c, d]) => { P.cap('k', a, b, c, d, .9); P.cap('k', 40 - a, b, 40 - c, d, .9); });
    P.ell('a', 20, 27, 11.6, 10.6);
    P.cap('k', 20, 17.5, 20, 37, .5);
    P.ell('k', 15, 24, 1.9, 1.7); P.ell('k', 25, 24, 1.9, 1.7); P.ell('k', 16, 31, 1.6, 1.4); P.ell('k', 24.6, 31, 1.6, 1.4);
    P.ell('k', 20, 15, 7, 5.6);
    P.ell('w', 17, 14.6, 2.1, 2.4); P.ell('w', 23, 14.6, 2.1, 2.4); P.ell('e', 17.5, 15.2, 1.1, 1.4); P.ell('e', 23.5, 15.2, 1.1, 1.4);
    P.cap('k', 17, 10.6, 13, 3, .62); P.cap('k', 23, 10.6, 27, 3, .62); P.ell('g', 13, 3, 1.4, 1.4); P.ell('g', 27, 3, 1.4, 1.4);
    P.rect('g', 33, 10, 35.6, 12.6); P.rect('l', 35.6, 12.6, 37.2, 14.2); P.rect('l', 3, 9, 5, 11); P.rect('g', 1.4, 11, 3, 12.6);
  }},
  mail: {box: 40, flat: 'ewom', col: {a: '#d6cffb', d: '#a99fe6', y: '#f5e3cf', o: '#fe7a02', m: '#703873', e: '#2a2236', w: '#ffffff'}, draw(P){
    P.ell('a', 20, 15, 11.6, 11);
    P.poly('a', [[8.4, 15], [31.6, 15], [33, 33], [28, 30], [24, 34], [20, 30.6], [16, 34], [12, 30], [7, 33]], {n: [20, 20, 12.5, 13.5]});
    P.cap('a', 9, 21, 5.6, 26.2, 2.2); P.cap('a', 31, 21, 34.4, 26.2, 2.2);
    P.rect('y', 8.6, 22.4, 31.4, 33);
    P.cap('o', 9, 22.8, 20, 29, .45); P.cap('o', 31, 22.8, 20, 29, .45); P.rect('m', 26.8, 24, 29.6, 26.8);
    P.ell('e', 15.5, 12.5, 2.3, 3.3); P.ell('e', 24.5, 12.5, 2.3, 3.3); P.ell('w', 14.8, 11.3, .65, .8); P.ell('w', 23.8, 11.3, .65, .8);
    P.ell('e', 20, 18.8, 1.9, 1.5);
    P.cap('o', 36.2, 2.8, 35.6, 8, .85); P.ell('o', 35.4, 10, .85, .85);
  }},
  deadline: {box: 40, flat: 'ewmb', col: {a: '#e0452b', d: '#a82f1c', w: '#fbfaf4', y: '#f2c94c', k: '#3a3040', m: '#3a1530', b: '#9ed3ec', e: '#1e1630'}, draw(P){
    P.cap('k', 13, 31, 10.4, 37, 1.4); P.cap('k', 27, 31, 29.6, 37, 1.4); P.ell('k', 9.6, 37.6, 2.4, 1.2); P.ell('k', 30.4, 37.6, 2.4, 1.2);
    P.ell('y', 10, 8.2, 4.7, 4.1); P.ell('y', 30, 8.2, 4.7, 4.1); P.cap('k', 20, 5.6, 20, 9.6, .8); P.ell('k', 20, 5.2, 1.7, 1.25);
    P.ell('a', 20, 21, 13, 12.6);
    P.ell('w', 20, 21.6, 10, 9.6);
    for (let i = 0; i < 12; i++){ const a = i * Math.PI / 6; P.ell('k', 20 + Math.cos(a)*8.3, 21.6 + Math.sin(a)*8, .48, .48); }
    P.cap('k', 20, 21.6, 20, 15.2, .62); P.cap('e', 20, 21.6, 24.8, 19.6, .62); P.ell('k', 20, 21.6, .95, .95);
    P.ell('e', 15.6, 20.4, 1.35, 1.9); P.ell('e', 24.4, 20.4, 1.35, 1.9);
    P.cap('m', 13.2, 17, 17.2, 18.4, .62); P.cap('m', 26.8, 17, 22.8, 18.4, .62);
    P.ring('m', 20, 27.8, 3.3, 1.9, .58, {clip: (u, v) => v < 27.8});
    P.ell('b', 33.6, 14, 1.4, 2);
  }},
  final: {box: 48, flat: 'wgyrlbeE', col: {k: '#2b2b33', d: '#4a4a52', w: '#e9eef0', b: '#8a4d8d', r: '#fe7a02', g: '#92c100', y: '#f2c94c', l: '#c8bffa', e: '#1e1630', E: '#2b2b33'}, draw(P){
    P.cap('d', 24, 34, 11, 47, 1.35); P.cap('d', 24, 34, 37, 47, 1.35); P.cap('d', 24, 34, 24, 47, 1.35);
    P.rect('w', 4, 5, 44, 34.4); P.cap('k', 2, 4, 46, 4, 2.4); P.cap('k', 3.4, 34.8, 44.6, 34.8, 1.35);
    P.ell('b', 15, 15, 4.2, 3.4); P.ell('b', 33, 15, 4.2, 3.4); P.ell('r', 15.8, 15.6, 1.7, 1.7); P.ell('r', 33.8, 15.6, 1.7, 1.7);
    P.cap('E', 9.6, 9.6, 19.4, 12.4, .95); P.cap('E', 38.4, 9.6, 28.6, 12.4, .95);
    [['g', 14, 24], ['y', 18.6, 21.6], ['r', 23.2, 26], ['l', 27.8, 23], ['r', 32.4, 27.6]].forEach(([m, x, y]) => P.rect(m, x, y, x + 3.2, 30.2));
    P.cap('e', 12.4, 30.6, 36.4, 30.6, .5); P.cap('e', 12.4, 20.4, 12.4, 30.6, .5);
    P.cap('r', 14, 21.6, 35, 27.4, .65);
  }},
};
function enemySprite(key){
  const id = 'cr|' + key; let c = SPRITE_CACHE.get(id);
  if (!c){
    const def = CREATURES[key], S = 1.5, mg = 2;
    const P = new Painter(S, def.box, def.box, mg);
    def.draw(P);
    c = P.render(def.col, def.flat, {outline: 1, dark: .86});
    c.cx = (mg + def.box/2) * S; c.foot = (mg + def.box - 1) * S;
    SPRITE_CACHE.set(id, c);
  }
  return c;
}
