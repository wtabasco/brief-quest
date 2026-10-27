/* Colores y elipses */
"use strict";
/* ================= COLOR ================= */
const hx = h => { const n = parseInt(h.slice(1), 16); return [(n>>16)&255, (n>>8)&255, n&255]; };
const toHex = (r,g,b) => '#' + ((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);
const mixC = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(...A.map((v,i) => Math.round(v + (B[i]-v)*t))); };
const dk = (h, t=.3) => mixC(h, '#1e1630', t);
const lt = (h, t=.3) => mixC(h, '#fffbe8', t);
function pixEllipse(c, cx, cy, rx, ry, col){
  c.fillStyle = col; rx = Math.max(1, rx); ry = Math.max(1, Math.round(ry));
  for (let j = -ry; j <= ry; j++){ const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j*j)/(ry*ry)))); c.fillRect(Math.round(cx - w), Math.round(cy + j), w*2 + 1, 1); }
}

/* ================= SPRITES: sombreado y contorno automático ================= */
function renderGrid(g, w, h, colors, noShade=''){
  const cnv = document.createElement('canvas'); cnv.width = w; cnv.height = h;
  const c2 = cnv.getContext('2d'), img = c2.createImageData(w, h), d = img.data;
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? null : g[y*w + x];
  const area = {}; for (const m of g) if (m) area[m] = (area[m] || 0) + 1;
  const pal = {};
  for (const m in colors){ const c = colors[m]; if (!c) continue; pal[m] = {b:hx(c), d:hx(dk(c,.34)), d2:hx(dk(c,.18)), l:hx(lt(c,.3)), o:hx(dk(c,.74))}; }
  const put = (x, y, rgb) => { const i = (y*w + x)*4; d[i] = rgb[0]; d[i+1] = rgb[1]; d[i+2] = rgb[2]; d[i+3] = 255; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    const m = at(x, y); if (!m || !pal[m]) continue;
    let c = pal[m].b;
    if (!noShade.includes(m) && area[m] > 8){
      if (at(x, y+1) !== m) c = pal[m].d; else if (at(x+1, y) !== m) c = pal[m].d2; else if (at(x, y-1) !== m || at(x-1, y) !== m) c = pal[m].l;
    }
    put(x, y, c);
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    if (at(x, y)) continue;
    for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]){ const m = at(x+dx, y+dy); if (m && pal[m]){ put(x, y, pal[m].o); break; } }
  }
  c2.putImageData(img, 0, 0); return cnv;
}
function scale2x(g, w, h){
  const o = new Array(w*h*4), W2 = w*2, at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? null : g[y*w + x];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    const P = at(x,y), A = at(x,y-1), B = at(x+1,y), C = at(x-1,y), D = at(x,y+1);
    let e0 = P, e1 = P, e2 = P, e3 = P;
    if (C === A && C !== D && A !== B) e0 = A;
    if (A === B && A !== C && B !== D) e1 = B;
    if (D === C && D !== B && C !== A) e2 = C;
    if (B === D && B !== A && D !== C) e3 = D;
    o[(2*y)*W2 + 2*x] = e0; o[(2*y)*W2 + 2*x+1] = e1; o[(2*y+1)*W2 + 2*x] = e2; o[(2*y+1)*W2 + 2*x+1] = e3;
  }
  return o;
}

