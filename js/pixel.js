/* Kit de pixel art: paleta, rampas de color, bloques y contornos */
"use strict";
/* ================= KIT DE PIXEL ART =================
   Todo el escenario se dibuja a la misma densidad que los personajes diseñados:
   un píxel del dibujo es un píxel del lienzo (512x384). Nada de degradés ni suavizados:
   colores planos en 3 o 4 tonos, sombras hacia el violeta, luces hacia el amarillo
   y un contorno oscuro alrededor de cada objeto con volumen, como en la ficha de Fede. */
const INK = '#2a1f2a';
const shd = (c, t = .22) => mixC(c, '#2b2448', t);
const hil = (c, t = .22) => mixC(c, '#fff3d6', t);
const rampOf = c => ({h: hil(c, .42), l: hil(c, .2), m: c, d: shd(c, .2), e: shd(c, .38), o: mixC(c, INK, .78)});
/* Paleta del escenario: cálida y apagada, con los colores de la agencia como acentos */
const PX = {
  cap: '#3d4b42', capL: '#566a5c', capD: '#262f29',
  oak: '#d8ad74', walnut: '#9a6a40', wood: '#b9844e', woodD: '#7c5530',
  white: '#f3eee3', paper: '#fbf8ef', cream: '#efe5d1',
  metal: '#a3abae', steel: '#7d868b', dark: '#3b3e48', screen: '#283040', glass: '#bfe1ee',
  plum: '#7d4c7b', lav: '#cbc2ef', lime: '#9bc23c', green: '#55913f', leaf: '#3f7a3a', moss: '#2f5e35',
  orange: '#ea8a35', red: '#d35b45', yellow: '#efc65c', sky: '#a7d6ea', pink: '#ef9fb0', teal: '#5fa5a0',
  shadow: 'rgba(43,36,72,.22)', shadowS: 'rgba(43,36,72,.32)',
};
function Pen(c, ox = 0, oy = 0){
  const p = {c};
  p.R = (x, y, w, h, col) => { if (w <= 0 || h <= 0) return; c.fillStyle = col; c.fillRect(ox + x, oy + y, w, h); };
  p.P = (x, y, col) => { c.fillStyle = col; c.fillRect(ox + x, oy + y, 1, 1); };
  p.D = (x, y, w, h, col, ph = 0) => { c.fillStyle = col; for (let j = 0; j < h; j++) for (let i = (j + ph) & 1; i < w; i += 2) c.fillRect(ox + x + i, oy + y + j, 1, 1); };
  p.E = (cx, cy, rx, ry, col) => pixEllipse(c, ox + cx, oy + cy, rx, ry, col);
  p.F = (x, y, w, h, col) => { p.R(x, y, w, 1, col); p.R(x, y + h - 1, w, 1, col); p.R(x, y, 1, h, col); p.R(x + w - 1, y, 1, h, col); };
  /* rectángulo con esquinas recortadas */
  p.RR = (x, y, w, h, col) => { p.R(x + 1, y, w - 2, h, col); p.R(x, y + 1, w, h - 2, col); };
  /* bloque en vista 3/4: tapa arriba y frente abajo (fh = alto del frente) */
  p.block = (x, y, w, h, fh, top, front, o = {}) => {
    const T = rampOf(top), F = rampOf(front || top);
    p.RR(x, y, w, h - fh, T.m);
    p.R(x + 1, y + 1, w - 2, 1, T.l);
    p.R(x, y + h - fh - 1, w, 1, T.h);
    p.R(x, y + h - fh, w, fh, F.d);
    p.R(x, y + h - fh, w, 1, F.m);
    p.R(x + w - 1, y + h - fh, 1, fh, F.e);
    p.R(x, y + h - 1, w, 1, F.e);
  };
  /* línea de píxeles entre dos puntos */
  p.L = (x0, y0, x1, y1, col) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) p.P(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), col); };
  return p;
}
/* Lienzo con margen para el contorno; draw recibe un Pen con origen en (m, m) */
function sprite(w, h, draw, o = {}){
  const m = o.m ?? 2;
  const c = document.createElement('canvas'); c.width = w + m*2; c.height = h + m*2;
  draw(Pen(c.getContext('2d'), m, m));
  if (o.outline !== false) outlineCanvas(c, o.dark ?? .8);
  c.m = m; return c;
}
/* Contorno de 1 px alrededor de la silueta, teñido con el color vecino */
function outlineCanvas(c, dark = .8){
  const w = c.width, h = c.height, x = c.getContext('2d'), img = x.getImageData(0, 0, w, h), d = img.data, src = new Uint8ClampedArray(d);
  const ink = hx(INK);
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++){
    const k = (y*w + i)*4; if (src[k + 3] > 0) continue;
    let n = -1;
    for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]){ const xx = i + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const j = (yy*w + xx)*4; if (src[j + 3] > 200){ n = j; break; } }
    if (n < 0) continue;
    for (let q = 0; q < 3; q++) d[k + q] = Math.round(src[n + q] * (1 - dark) + ink[q] * dark);
    d[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
}
/* Sombra plana bajo un objeto, en el piso */
function floorShadow(c, x, y, w, h, col = PX.shadow){ c.fillStyle = col; c.fillRect(x + 1, y, w - 2, h); c.fillRect(x, y + 1, w, h - 2); }
