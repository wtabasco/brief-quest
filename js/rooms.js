/* Salas hechas a partir de fotos: biblioteca, hall con escalera, oficina de Agus y Lía, estudio */
"use strict";
/* ================= SALAS DE LA CASA (a partir de fotos de la oficina real) =================
   Sala de Reuniones: biblioteca de madera oscura con libros viejos, ventanales en arco con cortinas grises,
   chimenea con premios, parquet en espiga, mesa larga clara, sillas negras de malla y la tele con soporte de pie en la punta de la mesa.
   Hall: escalera curva de mármol con baranda de hierro de volutas, terrazo con guarda oscura, lámpara de aros, monstera.
   Guaná, la oficina de Agus y Lía (planta alta): ventana alta de madera con cortinas, dos afiches grandes, aire acondicionado,
   mueble con cafetera de cápsulas y pava, mesa clara con termo y mate, flores y lámpara lineal.
   Brasil, la oficina de Fede (planta alta): piso de tablas, paredes blancas con moldura de yeso, ventana con persianas
   grises y cortinas, lámpara lineal, dos afiches pintados a mano, el pizarrón blanco, la bolsa de boxeo y la colchoneta.
   El Estudio: donde Reni graba y edita los videos con el celu. */
const OLD_BOOKS = ['#5a2e24', '#6e3b2a', '#3f4a3a', '#2e3a4e', '#7a5a3a', '#8a3a2e', '#4a3a2e', '#a08050', '#2f4a3e', '#6a3a4a', '#9a7a52', '#3a2a22'];
const ringPen = (p, cx, cy, rx, ry, col, step = .12) => { for (let a = 0; a < 6.29; a += step) p.P(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), col); };

/* ---------- objetos de pared ---------- */
function libraryShelf(b, X, Y, w, seed, tv){
  const p = Pen(b, X, Y), h = 62, y0 = 1, mid = '#4e2c1e', lite = '#6e4430';
  p.R(0, y0, w, h, '#3a2016'); p.R(0, y0, w, 3, lite); p.R(0, y0 + 3, w, 1, '#2a160e');
  const bays = Math.max(1, Math.round(w / 40)), bw = w / bays, rows = 6, rh = Math.floor((h - 6) / rows);
  for (let bi = 0; bi < bays; bi++){
    const bx = Math.round(bi * bw) + 3, bww = Math.round(bw) - 5;
    for (let r = 0; r < rows; r++){
      const ry = y0 + 4 + r*rh;
      p.R(bx, ry, bww, rh - 2, '#1e120c');
      let x = bx + 1, k = hash(seed + bi*7, r);
      while (x < bx + bww - 2){
        k = (k * 1103515245 + 12345) >>> 0;
        const bwid = 2 + (k >>> 5) % 2, bh = rh - 3 - ((k >>> 8) % 3), col = OLD_BOOKS[(k >>> 11) % OLD_BOOKS.length];
        if (x + bwid > bx + bww - 1) break;
        p.R(x, ry + rh - 2 - bh, bwid, bh, col); p.R(x, ry + rh - 2 - bh, bwid, 1, hil(col, .25));
        if ((k >>> 14) % 3 === 0) p.R(x, ry + rh - bh, bwid, 1, '#b8923e');
        x += bwid;
      }
      p.R(bx - 1, ry + rh - 2, bww + 2, 2, lite);
    }
    p.R(Math.round(bi * bw), y0, 3, h, mid); p.R(Math.round(bi * bw), y0, 1, h, lite);
  }
  p.R(w - 3, y0, 3, h, mid);
  if (tv){
    const tw = Math.min(w - 20, 70), tx = Math.round((w - tw) / 2), ty = y0 + 9;
    p.R(tx - 2, ty - 2, tw + 4, 32, '#1e120c'); p.R(tx, ty, tw, 27, '#141519'); p.R(tx + 1, ty + 1, tw - 2, 25, '#23252b'); p.L(tx + 5, ty + 21, tx + 22, ty + 4, '#3a3d45'); p.L(tx + 8, ty + 22, tx + 25, ty + 5, '#30333a');
    p.R(tx + 2, ty + 36, tw - 4, 3, '#c9a46a'); for (let k = 0; k < 4; k++){ p.R(tx + 6 + k*9, ty + 32, 5, 4, '#f4f2ec'); p.R(tx + 6 + k*9, ty + 32, 5, 1, '#ffffff'); }
  }
  p.R(0, y0 + h, w, 2, PX.shadowS);
}
function archWindow(b, X, Y, w){
  const p = Pen(b, X, Y), fx = 12, fw = w - 24, top = 8, bot = 50, cx = fx + fw / 2, r = fw / 2, F = '#232326';
  pixEllipse(b, X + cx, Y + top + r, r, r, F); p.R(fx, top + r, fw, bot - top - r, F);
  pixEllipse(b, X + cx, Y + top + r, r - 2, r - 2, '#8fb58a'); p.R(fx + 2, top + r, fw - 4, bot - top - r - 2, '#8fb58a');
  for (let i = 0; i < 90; i++){
    const h = hash(X + i, Y + 3), px = fx + 2 + h % (fw - 4), py = top + 2 + (h >> 8) % (bot - top - 4);
    if (py < top + r && Math.hypot(px - cx, py - top - r) > r - 3) continue;
    p.P(px, py, ['#6f9a68', '#b8d4a8', '#5a8456', '#d6e6c8'][i % 4]);
  }
  p.R(cx - 1, top + 2, 2, bot - top - 2, F);
  for (const yy of [top + r, top + r + 10, top + r + 20]) p.R(fx + 2, yy, fw - 4, 1, F);
  for (const a of [.5, 1.05, 1.6]){ p.L(cx, top + r, Math.round(cx + Math.cos(Math.PI + a) * (r - 1)), Math.round(top + r + Math.sin(Math.PI + a) * (r - 1)), F); p.L(cx, top + r, Math.round(cx - Math.cos(Math.PI + a) * (r - 1)), Math.round(top + r + Math.sin(Math.PI + a) * (r - 1)), F); }
  p.L(fx + 4, bot - 6, cx - 2, top + r + 2, 'rgba(255,255,255,.4)');
  p.R(fx - 2, bot, fw + 4, 3, '#e8e4dc'); p.R(fx - 2, bot + 2, fw + 4, 1, '#c9c4b8');
  p.R(fx, bot + 4, fw, 9, '#f2f1ec'); for (let x = 1; x < fw; x += 3) p.R(fx + x, bot + 5, 1, 7, '#cfcdc6'); p.R(fx, bot + 12, fw, 1, '#bdbab2');
  p.R(1, 6, w - 2, 2, '#2a2a2e'); p.R(0, 5, 3, 4, '#2a2a2e'); p.R(w - 3, 5, 3, 4, '#2a2a2e');
  for (const [c0, cw] of [[2, 11], [w - 13, 11]]){ p.R(c0, 8, cw, 55, '#b4b3ae'); for (let k = 1; k < cw; k += 3) p.R(c0 + k, 8, 1, 55, '#9f9e99'); p.R(c0, 8, cw, 1, '#cac9c4'); p.R(c0 + (c0 < 10 ? cw - 1 : 0), 8, 1, 55, '#8e8d88'); }
}
function tallWindow(b, X, Y, w, shutters){
  const p = Pen(b, X, Y), fx = 13, fw = w - 26, top = 7, bot = 50, F = shutters ? '#3a2216' : '#4a2e1e';
  p.R(fx - 2, top - 2, fw + 4, bot - top + 4, F);
  if (shutters){ // Brasil: persianas grises bajas detrás del vidrio
    for (let y = top; y < bot; y += 3){ p.R(fx, y, fw, 2, '#6c7076'); p.R(fx, y + 2, fw, 1, '#4c5056'); }
    for (let y = top + 1; y < bot; y += 9) p.R(fx + 2, y, fw - 4, 1, '#80848a');
  } else {
    p.R(fx, top, fw, bot - top, '#9cc08e');
    for (let i = 0; i < 70; i++){ const h = hash(X + i, Y + 9), px = fx + h % fw, py = top + (h >> 8) % (bot - top); p.P(px, py, ['#c08a6a', '#6f9a68', '#d6e6c8', '#b47a5a'][i % 4]); }
    p.R(fx + 4, top + 6, 8, 20, '#b8826a'); p.R(fx + 5, top + 8, 2, 3, '#e8dccc'); p.R(fx + 9, top + 8, 2, 3, '#e8dccc'); p.R(fx + 5, top + 15, 2, 3, '#e8dccc');
  }
  p.R(fx + fw/2 - 1, top, 2, bot - top, F); for (let k = 1; k < (shutters ? 6 : 5); k++) p.R(fx, top + Math.round(k * (bot - top) / (shutters ? 6 : 5)), fw, 1, F);
  p.L(fx + 3, bot - 5, fx + fw/2 - 3, top + 12, 'rgba(255,255,255,.4)');
  p.R(fx - 4, bot + 1, fw + 8, 3, '#6a4430'); p.R(fx, bot + 5, fw, 8, '#f2f1ec'); for (let x = 1; x < fw; x += 3) p.R(fx + x, bot + 6, 1, 6, '#cfcdc6');
  p.R(1, 5, w - 2, 2, '#2a2a2e');
  for (const [c0, cw] of [[2, 11], [w - 13, 11]]){ p.R(c0, 7, cw, 56, '#b9b8b3'); for (let k = 1; k < cw; k += 3) p.R(c0 + k, 7, 1, 56, '#a3a29d'); p.R(c0, 7, cw, 1, '#cfceca'); }
}
/* Brasil, la oficina de Fede: dos afiches pintados a mano en marcos de roble claro.
   0: una planta de ajíes en una lata violeta (fondo a rayas lavanda y mantel a rombos verdes).
   1: un ají superhéroe con capa verde y antifaz, volando con el puño en alto, y el texto "TOO HOT TO HANDLE". */
function brasilPoster(b, X, Y, w, k){
  const pw = 40, ph = 54, x0 = Math.round((w - pw) / 2), y0 = 5, p = Pen(b, X, Y);
  p.R(x0 - 2, y0 - 2, pw + 4, ph + 4, '#c9a06a'); p.R(x0 - 2, y0 - 2, pw + 4, 1, '#e2c08e'); p.R(x0 - 2, y0 + ph + 1, pw + 4, 1, '#9a7448'); p.R(x0 + pw + 1, y0 - 1, 1, ph + 2, '#a8824f');
  p.R(x0 + 1, y0 + ph + 3, pw, 1, 'rgba(60,40,20,.18)');
  const L = (x, y, ww, hh, c) => p.R(x0 + x, y0 + y, ww, hh, c);
  if (k % 2 === 0){
    for (let x = 0; x < pw; x++) L(x, 0, 1, 36, Math.floor(x / 4) % 2 ? '#efe6d6' : '#c3b0ea');
    for (let y = 36; y < ph; y++) for (let x = 0; x < pw; x++){ const a = Math.floor((x + y) / 5), c = Math.floor((x - y + 60) / 5); L(x, y, 1, 1, (a + c) % 2 ? '#a8d63c' : '#2c3622'); }
    L(0, 36, pw, 1, '#2c3622');
    // la lata violeta con su etiqueta naranja (sin marca)
    L(13, 28, 14, 17, '#5e3280'); L(13, 28, 14, 2, '#8a5aae'); L(14, 30, 2, 14, '#7a4aa0'); L(25, 30, 2, 14, '#4a2466');
    L(13, 34, 14, 7, '#ec9038'); L(13, 34, 14, 1, '#f6b060'); L(16, 35, 8, 5, '#f6efe2'); L(16, 39, 8, 1, '#d8cfbe');
    // la planta: tallo, hojas, ajíes y una flor
    L(19, 8, 2, 20, '#2f4a2a'); p.L(x0 + 20, y0 + 18, x0 + 11, y0 + 12, '#2f4a2a'); p.L(x0 + 20, y0 + 14, x0 + 29, y0 + 9, '#2f4a2a');
    for (const [x, y, rx, ry] of [[9, 11, 5, 2], [30, 8, 5, 2], [14, 20, 4, 2], [27, 18, 5, 2], [21, 5, 3, 3], [12, 26, 4, 2], [28, 25, 4, 2]]){ p.E(x0 + x, y0 + y, rx, ry, '#2f5a30'); p.P(x0 + x - 1, y0 + y - 1, '#4e7a44'); }
    for (const [x, y] of [[10, 14], [24, 11], [16, 22], [28, 20]]){ L(x, y, 3, 7, '#f08a3a'); L(x, y + 7, 2, 2, '#f08a3a'); L(x, y, 3, 1, '#2f4a2a'); L(x + 1, y + 2, 1, 3, '#ffd09a'); }
    p.E(x0 + 25, y0 + 5, 2, 2, '#f4a060'); p.P(x0 + 25, y0 + 5, '#fbe0b0');
  } else {
    L(0, 0, pw, ph, '#ec7a32');
    for (let y = 0; y < 34; y++) L(0, y, Math.max(0, 34 - y), 1, '#9ad040');
    // capa verde oscura que vuela hacia atrás
    for (let y = 4; y < 24; y++){ const xl = 1 + Math.round((y - 4) * .25), xr = 19 - Math.round((y - 4) * .45); if (xr > xl) L(xl, y, xr - xl, 1, '#1f6b33'); }
    for (const [x, y] of [[5, 8], [8, 11], [11, 14]]) p.L(x0 + x, y0 + y, x0 + x + 6, y0 + y - 4, '#2f8a45');
    // el ají: de la punta (abajo a la izquierda) al cabito (arriba a la derecha)
    for (let t = 0; t <= 1.0001; t += .04){ const cx = 9 + t * 17, cy = 27 - t * 16, r = 1.5 + t * 4; p.E(x0 + cx, y0 + cy, r, r * .85, '#d23a26'); }
    for (let t = .2; t <= .95; t += .05){ const cx = 9 + t * 17, cy = 27 - t * 16, r = 1.5 + t * 4; p.P(x0 + Math.round(cx - r * .3), y0 + Math.round(cy - r * .6), '#f2704c'); }
    p.E(x0 + 28, y0 + 9, 3, 2, '#2f7a2a'); L(29, 5, 1, 3, '#2f7a2a'); L(30, 4, 2, 1, '#2f7a2a');
    // antifaz con ojitos
    L(20, 13, 9, 3, '#1e1a16'); L(22, 14, 1, 1, '#ffffff'); L(26, 14, 1, 1, '#ffffff'); p.P(x0 + 19, y0 + 15, '#1e1a16');
    L(23, 18, 4, 1, '#8a1e14');                                              // sonrisa
    // brazo arriba con el puño
    p.L(x0 + 30, y0 + 12, x0 + 34, y0 + 5, '#d23a26'); p.L(x0 + 31, y0 + 12, x0 + 35, y0 + 5, '#d23a26');
    L(33, 1, 4, 4, '#f6e6c8'); L(33, 1, 4, 1, '#ffffff'); L(37, 2, 1, 3, '#1e1a16'); L(33, 5, 4, 1, '#c9b48e');
    // rayitas de velocidad
    for (const [x, y] of [[2, 30], [4, 33], [1, 27]]) L(x, y, 4, 1, '#fbe7c6');
    pixText(b, 'TOO', X + x0 + 25, Y + y0 + 25, '#1e1a16'); pixText(b, 'HOT', X + x0 + 25, Y + y0 + 31, '#1e1a16');
    pixText(b, 'TO HAnDLE', X + x0 + 1, Y + y0 + 41, '#1e1a16');
    L(2, 48, 36, 1, '#c45a22');
  }
  p.L(x0 + 2, y0 + 24, x0 + 14, y0 + 4, 'rgba(255,255,255,.3)');
}
function fireplace(b, X, Y, w){
  const p = Pen(b, X, Y), wood = '#3e2318', wl = '#5a3424', wd = '#2a160e';
  p.R(4, 30, w - 8, 4, wl); p.R(4, 30, w - 8, 1, '#7a4a32'); p.R(4, 34, w - 8, 1, wd);
  p.R(7, 35, w - 14, 28, wood); p.R(7, 35, 3, 28, wl); p.R(w - 10, 35, 3, 28, wd);
  p.R(15, 41, w - 30, 22, '#141010');
  for (const sx of [20, 28, 36, 44]) if (sx < w - 16){ ringPen(p, sx, 50, 3, 5, '#5a5a5e'); p.R(sx, 44, 1, 18, '#4a4a4e'); }
  // premios sobre la chimenea
  p.E(12, 26, 4, 4, '#f4f4f0'); p.P(11, 25, '#2a2a2e'); p.P(13, 27, '#2a2a2e'); p.P(14, 24, '#2a2a2e'); p.P(10, 28, '#2a2a2e');
  p.R(19, 16, 9, 14, '#c9302c'); p.R(20, 18, 7, 1, '#fbf8ef'); p.R(20, 21, 7, 1, '#fbf8ef'); p.R(20, 24, 5, 1, '#fbf8ef');
  p.R(30, 21, 9, 9, '#e8e6e0'); p.R(31, 22, 7, 5, '#4a6aa8');
  p.R(42, 10, 7, 20, '#2a2a2e'); p.R(43, 12, 5, 14, '#7cba3a'); p.R(44, 14, 3, 1, '#2a2a2e'); p.R(44, 18, 3, 1, '#2a2a2e');
  p.R(51, 22, 7, 8, '#c9a24a'); p.R(52, 23, 5, 6, '#e8e6e0');
  p.R(4, 63, w - 8, 1, PX.shadowS);
}
function poster(b, X, Y, w, k){
  const p = Pen(b, X, Y), x0 = 5, y0 = 6, pw = w - 10, ph = 54;
  p.R(x0 - 2, y0 - 2, pw + 4, ph + 4, '#c9a06a'); p.R(x0 - 2, y0 - 2, pw + 4, 1, '#e0bc88'); p.R(x0 - 2, y0 + ph + 1, pw + 4, 1, '#9a7448');
  if (k % 2 === 0){ // afiche de comida: fondo durazno, trazos naranjas, palta, salmón, palitos y pescado violeta
    p.R(x0, y0, pw, ph, '#f3d6b8');
    p.R(x0 + 5, y0 + 5, 12, 3, '#e8743a'); p.R(x0 + 9, y0 + 3, 3, 10, '#e8743a'); p.R(x0 + 20, y0 + 4, 3, 9, '#e8743a'); p.R(x0 + 24, y0 + 6, 2, 6, '#e8743a');
    p.E(x0 + 10, y0 + 19, 7, 4, '#2f4a2a'); p.E(x0 + 10, y0 + 19, 6, 3, '#8fc04a'); p.E(x0 + 10, y0 + 19, 2, 2, '#5a3a22');
    p.RR(x0 + 22, y0 + 15, 16, 7, '#f08060'); for (let i = 0; i < 4; i++) p.R(x0 + 24 + i*4, y0 + 16, 1, 5, '#fbe0d0');
    p.R(x0 + 5, y0 + 27, 11, 15, '#3a3a2e'); p.R(x0 + 7, y0 + 30, 7, 3, '#8fcf4a'); p.R(x0 + 7, y0 + 36, 7, 2, '#8fcf4a');
    p.L(x0 + 22, y0 + 38, x0 + 34, y0 + 26, '#8a7aa8'); p.L(x0 + 25, y0 + 39, x0 + 37, y0 + 28, '#8a7aa8');
    p.E(x0 + 31, y0 + 41, 8, 4, '#6a4aa0'); p.R(x0 + 38, y0 + 38, 4, 7, '#6a4aa0'); p.P(x0 + 27, y0 + 40, '#fbe0d0');
    for (let i = 0; i < 6; i++) p.R(x0 + 6 + i*6, y0 + ph - 6, 4, 1, '#3a3a2e');
  } else { // afiche del ring: arriba violeta, cartel naranja, dos luchadores y piso a rayas verdes
    p.R(x0, y0, pw, ph, '#7a5aa8');
    p.R(x0, y0 + 9, pw, 9, '#ee7a48'); p.R(x0, y0 + 9, pw, 1, '#f59a6a'); for (let i = 0; i < 7; i++) p.R(x0 + 4 + i*6, y0 + 12, 4, 4, '#fbe8d6');
    p.R(x0 + 5, y0 + 19, pw - 10, 22, '#2f4a3a');
    for (let i = 0; i < pw - 10; i += 3) p.R(x0 + 5 + i, y0 + 34, 2, 7, '#9ad04a');
    p.E(x0 + 18, y0 + 30, 6, 6, '#f2dcc0'); p.E(x0 + 18, y0 + 23, 3, 3, '#f2dcc0'); p.R(x0 + 13, y0 + 31, 11, 2, '#6a3a8a');
    p.E(x0 + 32, y0 + 31, 6, 6, '#f2dcc0'); p.E(x0 + 32, y0 + 24, 3, 3, '#f2dcc0'); p.R(x0 + 27, y0 + 32, 11, 2, '#6a3a8a');
    p.E(x0 + 25, y0 + 30, 4, 2, '#ee7a48'); p.R(x0 + 23, y0 + 20, 3, 3, '#9ad04a');
    p.R(x0, y0 + 42, pw, ph - 42, '#ee7a48'); for (let i = 0; i < 2; i++) p.R(x0 + 4, y0 + 45 + i*3, pw - 8, 1, '#3a2a22');
    for (const sx of [x0, x0 + pw - 4]) for (let yy = 0; yy < 22; yy += 4) p.R(sx, y0 + 19 + yy, 4, 2, '#5a3a8a');
  }
  p.L(x0 + 2, y0 + 30, x0 + 20, y0 + 4, 'rgba(255,255,255,.35)');
}
/* el tablero de Lía: una pizarra llena de métricas (línea que sube, barras, un KPI en grande y post-its) */
function liaBoardArt(b, X, Y, w){
  const p = Pen(b, X, Y), x0 = 4, y0 = 6, bw = w - 8, bh = 50;
  p.R(x0 - 2, y0 - 1, bw + 4, bh + 3, rampOf(PX.metal).e); p.R(x0 - 1, y0 - 2, bw + 2, bh + 3, PX.metal); p.R(x0 - 1, y0 - 2, bw + 2, 1, hil(PX.metal, .4));
  p.R(x0, y0, bw, bh - 4, '#fdfcf8'); p.R(x0, y0, bw, 1, '#ffffff'); p.R(x0 + bw - 2, y0, 2, bh - 4, '#eceae2');
  // título: KPI y un +12%
  pixText(b, 'KPI', X + x0 + 3, Y + y0 + 3, '#2e3a5e');
  pixText(b, '+12%', X + x0 + bw - 19, Y + y0 + 3, '#3f8a3a');
  p.R(x0 + 3, y0 + 9, bw - 6, 1, '#d8d4c8');
  // ejes y línea que sube con puntitos
  const gx = x0 + 4, gy = y0 + 30, gw = bw - 24;
  p.R(gx, y0 + 12, 1, 19, '#3a3040'); p.R(gx, gy, gw, 1, '#3a3040');
  const pts = [[0, 14], [5, 11], [10, 12], [15, 7], [20, 8], [gw - 4, 2]];
  for (let i = 1; i < pts.length; i++) p.L(gx + 1 + pts[i - 1][0], y0 + 12 + pts[i - 1][1], gx + 1 + pts[i][0], y0 + 12 + pts[i][1], PX.orange);
  pts.forEach(([x, y]) => p.R(gx + x, y0 + 11 + y, 3, 3, '#d9772a'));
  p.R(gx + gw - 3, y0 + 11, 1, 1, '#3f8a3a'); p.L(gx + gw - 6, y0 + 15, gx + gw - 2, y0 + 11, '#3f8a3a');
  // barras al costado
  [[0, 6, PX.lav], [4, 10, PX.plum], [8, 15, PX.green]].forEach(([dx, h, c]) => { p.R(x0 + bw - 15 + dx, gy - h, 3, h, c); p.R(x0 + bw - 15 + dx, gy - h, 3, 1, hil(c, .35)); });
  p.R(x0 + bw - 16, gy, 13, 1, '#3a3040');
  // post-its: uno dice "medir", otro tiene una flecha para arriba, otro una carita
  [[x0 + 4, y0 + 34, PX.yellow], [x0 + 15, y0 + 35, PX.pink], [x0 + bw - 14, y0 + 34, PX.lime]].forEach(([x, y, c]) => { p.R(x, y, 9, 8, c); p.R(x, y, 9, 1, hil(c, .4)); p.R(x + 1, y + 8, 8, 1, 'rgba(0,0,0,.12)'); });
  p.R(x0 + 6, y0 + 37, 5, 1, '#6a5a3a'); p.R(x0 + 6, y0 + 39, 4, 1, '#6a5a3a');
  p.R(x0 + 19, y0 + 37, 1, 4, '#8a2a4a'); p.R(x0 + 18, y0 + 38, 3, 1, '#8a2a4a'); p.P(x0 + 19, y0 + 36, '#8a2a4a');
  p.P(x0 + bw - 12, y0 + 37, '#3a5a1a'); p.P(x0 + bw - 9, y0 + 37, '#3a5a1a'); p.R(x0 + bw - 12, y0 + 39, 4, 1, '#3a5a1a');
  // bandeja con marcadores
  p.R(x0 - 1, y0 + bh - 4, bw + 2, 3, PX.steel); p.R(x0 - 1, y0 + bh - 4, bw + 2, 1, PX.metal);
  [[8, PX.red], [13, '#3d6fb0'], [18, PX.green], [23, PX.orange]].forEach(([x, c]) => p.R(x0 + x, y0 + bh - 5, 4, 1, c));
}
/* fondo de papel blanco del estudio, con el barrido sobre el piso */
function backdrop(b, X, Y, w){
  const p = Pen(b, X, Y);
  for (const sx of [2, w - 5]){ p.R(sx, 8, 3, 56, '#5a5e66'); p.R(sx, 8, 1, 56, '#7a7e86'); }
  p.R(0, 8, w, 3, '#4a4e56');
  p.R(6, 11, w - 12, 53, '#f6f6f3'); for (let y = 15; y < 64; y += 9) p.R(6, y, w - 12, 1, '#ecece8');
  for (let y = 0; y < 44; y++){ const a = Math.min(1, (1 - y / 44) * 1.6); b.fillStyle = `rgba(250,250,247,${(.95 * a).toFixed(2)})`; b.fillRect(X + 6, Y + 64 + y, w - 12, 1); }
}

/* ---------- escaleras de mármol ---------- */
function hallStairs(b, X0, Y0, w, h){
  const p = Pen(b, X0, Y0), N = 10, I = PAT.iron;
  p.R(0, 0, w, h, '#efebe3'); p.R(0, 0, w, 3, '#d9d4c9');
  const yTop = i => h - 9*(i + 1) - 1, xr = i => w - 2 - i*5 + (i === 0 ? 12 : i === 1 ? 6 : i === 2 ? 2 : 0);
  pixEllipse(b, X0 + xr(0) - 10, Y0 + h - 3, 20, 8, '#6e4a3e'); pixEllipse(b, X0 + xr(0) - 10, Y0 + h - 4, 17, 6, '#83594a');
  for (let i = N - 1; i >= 0; i--){
    const y = yTop(i), x1 = xr(i), tread = i % 2 ? '#d2bcae' : '#cbb3a4';
    p.R(0, y + 6, x1 - 4, 3, '#9c8478'); pixEllipse(b, X0 + x1 - 4, Y0 + y + 6, 4, 2, '#9c8478');
    p.R(0, y, x1 - 4, 6, tread); pixEllipse(b, X0 + x1 - 4, Y0 + y + 3, 4, 3, tread);
    p.R(0, y, x1 - 4, 1, '#e4d4c8');
    for (let k = 0; k < 6; k++){ const r = hash(i + 3, k), vx = r % Math.max(1, x1 - 8); p.R(vx, y + 1 + (r >> 6) % 4, 3, 1, k % 2 ? '#a88f85' : '#b69c90'); }
  }
  p.R(0, 0, 3, h, '#d6d0c4');
  const hx0 = i => xr(i) - 8, hy0 = i => yTop(i) - 16;
  for (let i = 0; i < N; i++){ const x = hx0(i), y = hy0(i); p.R(x, y, 1, 16, I); ringPen(p, x - 3, y + 8, 3, 4, I); ringPen(p, x - 3, y + 8, 1, 2, I); }
  for (let i = 0; i < N - 1; i++){ p.L(hx0(i), hy0(i), hx0(i + 1), hy0(i + 1), I); p.L(hx0(i), hy0(i) - 1, hx0(i + 1), hy0(i + 1) - 1, PAT.ironL); }
}
function stairwell(b, X0, Y0, w, h){
  const p = Pen(b, X0, Y0), I = PAT.iron;
  p.R(0, 0, w, h, '#3e332e');
  for (let j = 0; j < 9; j++){ const x = w - 42 - j*9, col = mixC('#d2bcae', '#5a4a44', j / 9); p.R(x, 30, 9, 38, col); p.R(x, 30, 1, 38, mixC(col, '#ffffff', .2)); p.R(x + 7, 30, 2, 38, mixC(col, '#2a2020', .35)); }
  p.R(w - 32, 32, 32, 32, '#d8c6b8'); p.R(w - 32, 32, 32, 1, '#e8dccf'); p.R(w - 32, 63, 32, 1, '#a89080');
  for (const [y0, hh] of [[0, 10], [h - 10, 10]]){ p.R(0, y0, w, hh, '#d8d0c4'); p.R(0, y0 + (y0 ? 0 : hh - 1), w, 1, '#b8ae9f'); }
  p.R(0, 0, 8, h, '#d8d0c4');
  for (const ry of [6, h - 18]){ p.R(4, ry, w - 6, 2, I); p.R(4, ry, w - 6, 1, PAT.ironL); for (let x = 8; x < w - 4; x += 10){ p.R(x, ry + 2, 1, 10, I); ringPen(p, x + 5, ry + 7, 3, 3, I); } }
  p.R(4, 6, 2, h - 12, I);
}
function newelSprite(){
  if (SMALL_CACHE.newel) return SMALL_CACHE.newel;
  return SMALL_CACHE.newel = sprite(16, 40, p => {
    p.R(2, 28, 12, 12, '#cbb3a4'); p.R(2, 28, 12, 2, '#e0cfc3'); p.R(12, 30, 2, 10, '#9c8478');
    const I = '#3e434b'; ringPen(p, 8, 16, 5, 8, I, .1); p.R(8, 4, 1, 24, I); p.R(3, 16, 10, 1, I); ringPen(p, 8, 3, 2, 2, I); p.R(4, 26, 8, 2, I);
  }, {dark: .5});
}

/* ---------- muebles ---------- */
function libraryTableSprite(w, h){
  return tableSprite(w, h, '#d6bd92', (p, th) => {
    laptop(p, Math.round(w/2) + 44, 10, '#3b4a6a');
    p.R(w/2 + 6, 14, 12, 7, '#f4f4f0'); p.R(w/2 + 6, 14, 12, 1, '#ffffff'); p.R(w/2 + 6, 18, 12, 3, '#6a8ac8'); p.R(w/2 + 10, 11, 4, 3, '#ffffff');
    p.R(w/2 + 24, 16, 10, 6, '#3a8a3a'); p.R(w/2 + 24, 16, 10, 1, '#5aaa5a'); p.R(w/2 + 26, 11, 1, 5, '#3a6ab0'); p.R(w/2 + 30, 12, 1, 4, '#2a2a2e');
    const tx = w - 70, ty = Math.round(th / 2);
    p.E(tx, ty + 2, 18, 9, '#a07848'); p.E(tx, ty + 1, 16, 8, '#c9a46a'); ringPen(p, tx, ty + 1, 12, 6, '#a07848', .35);
    p.R(tx - 11, ty - 10, 8, 12, '#d9eaee'); p.R(tx - 11, ty - 10, 8, 1, '#ffffff'); p.R(tx - 4, ty - 8, 2, 6, '#c9dde2');
    for (const [gx, gy] of [[tx + 2, ty - 2], [tx + 8, ty], [tx + 4, ty + 4]]){ p.R(gx, gy - 4, 4, 5, '#dceaee'); p.R(gx, gy - 4, 4, 1, '#ffffff'); }
    p.R(60, 12, 12, 3, '#2a2a2e'); p.R(84, 18, 10, 3, '#f2f2ee'); p.P(88, 19, '#5a5a5e');
    p.R(Math.round(w/2) - 40, ty, 14, 4, '#2a2a2e'); p.R(Math.round(w/2) - 120, ty - 2, 14, 4, '#2a2a2e');
  }, {grain: true, legs: 8, legCol: '#2a2a2e'});
}
function foundersTableSprite(w, h){
  return tableSprite(w, h, '#d9c9a6', (p, th) => {
    monitor(p, 12, -4, '#3a4a5a', true);
    p.R(44, 2, 6, 10, '#d9eaee'); p.R(44, 2, 6, 1, '#ffffff'); p.R(46, -2, 1, 5, '#4a8a3a');
    for (const [fx, fy] of [[42, -4], [47, -6], [51, -3], [45, -1]]){ p.E(fx, fy, 3, 3, '#f2d04a'); p.P(fx - 1, fy - 1, '#fbe98a'); }
    p.R(64, -2, 6, 14, '#a9adb3'); p.R(64, -2, 2, 14, '#d0d4d8'); p.R(64, -4, 6, 3, '#2a2a2e');
    p.E(77, 9, 4, 4, '#3a2a20'); p.E(77, 7, 3, 1, '#6a8a3a'); p.R(78, 1, 1, 6, '#c8ccd0');
    laptop(p, w - 52, 12, '#5a6a8a');
    p.R(w - 70, 6, 5, 12, '#a8dccb'); p.R(w - 69, 4, 3, 2, '#e8e8e4');
    papers(p, 28, 16); mug(p, 96, 14, PX.orange);
  }, {grain: true, legCol: '#2a2a2e', chairs: (p, th) => { for (let x = 10; x < w - 24; x += 34) chairBack(p, x, -6, '#2a2a2e'); }});
}
function coffeeCabinetSprite(w){
  if (SMALL_CACHE.cab) return SMALL_CACHE.cab;
  return SMALL_CACHE.cab = sprite(w, 44, p => {
    const C = rampOf('#7a4e30');
    p.R(0, 18, w, 26, C.m); p.R(0, 18, w, 2, C.l); p.R(0, 42, w, 2, C.e); p.R(Math.round(w/2), 21, 1, 20, C.e); p.R(Math.round(w/2) - 5, 30, 2, 4, '#d8c39f'); p.R(Math.round(w/2) + 4, 30, 2, 4, '#d8c39f');
    p.E(12, 10, 7, 8, '#f2f2f0'); p.E(11, 8, 4, 4, '#ffffff'); p.R(8, 10, 8, 6, '#3a3a3e'); p.R(6, 16, 12, 2, '#d0d0cc');
    p.R(26, 6, 8, 12, '#2a2a2e'); p.R(26, 6, 8, 1, '#4a4a50'); p.R(34, 9, 2, 5, '#2a2a2e'); p.R(28, 4, 4, 2, '#2a2a2e');
    p.R(40, 14, 16, 4, '#5a3a24'); for (const x of [42, 47, 52]){ p.R(x, 10, 4, 4, '#fbf8ef'); p.R(x, 10, 4, 1, '#ffffff'); }
  });
}
/* sillas negras de malla: de frente (del otro lado de la mesa), de espaldas o de costado */
function meshChairSprite(view){
  const key = 'chair' + view; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  const K = '#232428', KL = '#3e4046', M = '#4c4f56', CH = '#a9adb3';
  const mesh = (p, x, y, w, h) => { p.RR(x, y, w, h, K); p.R(x + 2, y + 2, w - 4, h - 4, '#2c2e33'); for (let yy = y + 3; yy < y + h - 2; yy += 2) for (let xx = x + 3 + (yy % 4 ? 1 : 0); xx < x + w - 2; xx += 2) p.P(xx, yy, M); p.R(x + 1, y, w - 2, 1, KL); };
  let s;
  if (view === 'back') s = sprite(24, 34, p => { mesh(p, 1, 0, 22, 20); p.R(3, 20, 18, 4, K); p.R(4, 24, 2, 8, CH); p.R(18, 24, 2, 8, CH); p.R(3, 31, 18, 2, CH); }, {dark: .5});
  else if (view === 'front') s = sprite(24, 30, p => { mesh(p, 2, 0, 20, 16); p.R(0, 15, 24, 7, '#2c2e33'); p.R(0, 15, 24, 1, KL); p.R(2, 22, 2, 7, CH); p.R(20, 22, 2, 7, CH); }, {dark: .5});
  else s = sprite(18, 34, p => { const L = view === 'right', bx = L ? 2 : 12; /* de costado: mira hacia la mesa, con el respaldo del otro lado */ p.R(bx, 0, 4, 22, K); p.R(bx, 0, 4, 1, KL); for (let y = 2; y < 21; y += 3) p.P(bx + 2, y, M); p.R(2, 18, 14, 5, '#2c2e33'); p.R(2, 18, 14, 1, KL); p.R(L ? 4 : 12, 23, 2, 9, CH); p.R(2, 31, 14, 2, CH); }, {dark: .5});
  return SMALL_CACHE[key] = s;
}
/* la tele de la sala de reuniones: pantalla grande en un soporte de pie con ruedas, girada hacia la mesa.
   La pantalla muestra una diapositiva (barra de título, un gráfico y renglones). */
function tvStandSprite(){
  if (SMALL_CACHE.tvstand) return SMALL_CACHE.tvstand;
  const W = 38, H = 82, FR = '#1b1c20', FR2 = '#2c2d33', MET = '#5a5d64', MET2 = '#8a8e96';
  const s = sprite(W, H, p => {
    // base en H con ruedas
    p.R(5, 74, 28, 3, FR2); p.R(5, 74, 28, 1, '#45474e'); p.R(9, 70, 20, 3, FR2); p.R(17, 70, 4, 7, FR2);
    [[4, 77], [30, 77], [8, 72], [27, 72]].forEach(([x, y]) => { p.R(x, y, 4, 3, '#111214'); p.P(x + 1, y, '#3a3c42'); });
    // columna
    p.R(17, 34, 4, 38, MET); p.R(17, 34, 1, 38, MET2); p.R(20, 34, 1, 38, '#3a3c42');
    p.R(14, 50, 10, 3, FR2); p.R(14, 50, 10, 1, '#45474e'); // bandeja
    // pantalla girada hacia la derecha: el borde derecho más bajo
    const top = x => 3 + Math.round(x * .2), hh = 33;
    for (let x = 0; x < W; x++){ p.R(x, top(x), 1, hh, FR); p.R(x, top(x) + hh, 1, 2, '#0d0e10'); }
    for (let x = 0; x < W; x++) p.P(x, top(x), FR2);
    const scr = (x, y, h, c) => { if (x >= 2 && x < W - 2) p.R(x, top(x) + y, 1, h, c); };
    for (let x = 2; x < W - 2; x++){
      scr(x, 2, hh - 4, '#f2efe6');           // fondo de la diapositiva
      scr(x, 2, 5, '#e8743a');                // barra de título
    }
    for (let x = 5; x < 16; x++) scr(x, 4, 1, '#fbe0c8');
    // gráfico de barras
    [[6, 9, PX.plum], [10, 13, PX.lime], [14, 7, PX.lav], [18, 16, '#3f8a3a']].forEach(([x0, h, c]) => { for (let x = x0; x < x0 + 3; x++) scr(x, 27 - h, h, c); });
    for (let x = 5; x < 23; x++) scr(x, 27, 1, '#5a5664');
    // renglones a la derecha
    [10, 14, 18, 22].forEach((y, i) => { for (let x = 25; x < 33 - (i % 2) * 2; x++) scr(x, y, 1, '#9a94a0'); });
    // reflejo
    for (let i = 0; i < 9; i++){ const x = 4 + i * 3; scr(x, 22 - i * 2, 2, 'rgba(255,255,255,.35)'); }
    // borde inferior con el logo del fabricante (un puntito) y la luz de encendido
    p.P(W - 5, top(W - 5) + hh - 1, '#5fb05a');
  }, {dark: .5});
  return SMALL_CACHE.tvstand = s;
}
function monsteraSprite(k = 1){
  const key = 'monstera' + k; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  const P = new Painter(k, 64, 66, 2);
  const leaves = [[14, 20, 12, 8, 'a'], [48, 16, 12, 8, 'b'], [31, 9, 11, 8, 'a'], [8, 40, 10, 7, 'b'], [56, 38, 10, 7, 'a'], [22, 31, 9, 6, 'b'], [42, 30, 9, 6, 'a']];
  for (const [x, y] of leaves) P.cap('s', 32, 50, x, y, 1);
  for (const [x, y, rx, ry, m] of leaves){ P.ell(m, x, y, rx, ry); for (let k = -2; k <= 2; k++) if (k) P.cap('g', x + k * rx * .22, y, x + k * rx * .5, y + (k % 2 ? -ry * .7 : ry * .7), .45); }
  P.poly('p', [[22, 50], [42, 50], [39, 66], [25, 66]]); P.rect('r', 21, 48, 43, 52);
  const c = P.render({s: '#3e6a32', a: '#2f6a34', b: '#3f7f3c', g: '#1b3e1e', p: '#2a2422', r: '#3a3230'}, 'g', {outline: 1, dark: .8}); c.m = 0;
  return SMALL_CACHE[key] = c;
}
function softboxSprite(){
  if (SMALL_CACHE.softbox) return SMALL_CACHE.softbox;
  return SMALL_CACHE.softbox = sprite(30, 76, p => {
    p.R(14, 24, 2, 46, '#5a5e66'); p.L(15, 66, 4, 75, '#4a4e56'); p.L(15, 66, 26, 75, '#4a4e56'); p.L(15, 66, 15, 75, '#4a4e56');
    p.R(2, 2, 26, 22, '#2a2a2e'); p.R(4, 4, 22, 18, '#f8f8f4'); p.R(4, 4, 22, 1, '#ffffff'); p.R(6, 6, 18, 14, '#fffbea');
  }, {dark: .55});
}
function tripodSprite(){
  if (SMALL_CACHE.tripod) return SMALL_CACHE.tripod;
  return SMALL_CACHE.tripod = sprite(26, 48, p => {
    p.L(13, 22, 3, 47, '#4a4e56'); p.L(13, 22, 23, 47, '#4a4e56'); p.L(13, 22, 13, 47, '#5a5e66');
    // aro de luz con el celu de Reni en el medio, listo para grabar
    for (let a = 0; a < 360; a += 4){ const r = Math.PI*a/180; p.R(Math.round(13 + Math.cos(r)*10) - 1, Math.round(12 + Math.sin(r)*10) - 1, 2, 2, '#f4f1e4'); }
    p.R(12, 21, 2, 2, '#4a4e56');
    p.R(9, 4, 8, 15, '#26272b'); p.R(10, 5, 6, 12, '#7a8ab0'); p.R(10, 5, 6, 3, '#9fb0d4'); p.R(12, 17, 2, 1, '#44464c'); p.R(14, 6, 1, 1, PX.red);
  }, {dark: .55});
}

/* ---------- lámparas colgantes (encima de todo) ---------- */
function hangingLamp(c, kind, X, Y, w){
  const line = (x0, y0, x1, y1, col) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; c.fillStyle = col; for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1); };
  c.fillStyle = 'rgba(30,30,34,.5)'; c.fillRect(X, Y - 70, 1, 70);
  if (kind === 'cones'){
    const arms = [[-24, -5], [24, -7], [-17, 8], [19, 9], [-4, -13], [5, 13]];
    for (const [dx, dy] of arms){ line(X, Y, X + dx, Y + dy, '#1f2024'); line(X, Y + 1, X + dx, Y + dy + 1, '#1f2024'); }
    c.fillStyle = '#1f2024'; c.fillRect(X - 3, Y - 2, 7, 4);
    for (const [dx, dy] of arms){
      c.fillStyle = 'rgba(255,228,160,.22)'; c.fillRect(X + dx - 4, Y + dy + 2, 9, 7);
      c.fillStyle = '#1f2024'; c.fillRect(X + dx - 2, Y + dy - 1, 5, 4); c.fillRect(X + dx - 1, Y + dy - 3, 3, 2);
      c.fillStyle = '#fff2c8'; c.fillRect(X + dx - 1, Y + dy + 3, 3, 2);
    }
  } else if (kind === 'ring'){ // Asteroide: un solo aro de luz colgado de tres cables finos, como en la foto
    for (let a = 0; a < 6.29; a += .04){ const x = Math.round(X + Math.cos(a) * 30), y = Math.round(Y + Math.sin(a) * 9); c.fillStyle = 'rgba(255,248,225,.2)'; c.fillRect(x - 1, y - 1, 3, 4); }
    line(X - 22, Y - 70, X - 26, Y - 4, 'rgba(30,30,34,.4)'); line(X + 22, Y - 70, X + 26, Y - 4, 'rgba(30,30,34,.4)'); line(X, Y - 70, X, Y - 9, 'rgba(30,30,34,.4)');
    c.fillStyle = '#1f2024'; c.fillRect(X - 8, Y - 72, 17, 3);
    for (let a = 0; a < 6.29; a += .03){ const x = Math.round(X + Math.cos(a) * 30), y = Math.round(Y + Math.sin(a) * 9); c.fillStyle = Math.sin(a) > 0 ? '#fffbea' : '#8e8c86'; c.fillRect(x, y, 1, 2); }
  } else if (kind === 'pendant'){ // pantalla de chapa negra, portalámparas de bronce y la lamparita de filamento
    c.fillStyle = 'rgba(255,236,190,.16)'; c.fillRect(X - 8, Y + 2, 17, 8);
    c.fillStyle = '#b8913a'; c.fillRect(X - 1, Y - 9, 3, 4); c.fillStyle = '#e2c070'; c.fillRect(X - 1, Y - 9, 1, 4);
    for (let j = 0; j < 5; j++){ const hw = 2 + j * 1.6 | 0; c.fillStyle = j === 4 ? '#3a3c42' : '#1f2024'; c.fillRect(X - hw, Y - 5 + j, hw * 2 + 1, 1); }
    c.fillStyle = '#5a5c62'; c.fillRect(X - 3, Y - 4, 2, 1);
    c.fillStyle = '#fff2c8'; c.fillRect(X - 1, Y, 3, 2); c.fillStyle = '#ffd98a'; c.fillRect(X, Y + 1, 1, 1);
  } else if (kind === 'rings'){
    const ring = (rx, ry, col, glow) => { for (let a = 0; a < 6.29; a += .05){ const x = Math.round(X + Math.cos(a) * rx), y = Math.round(Y + Math.sin(a) * ry); c.fillStyle = glow; c.fillRect(x - 1, y - 1, 3, 3); c.fillStyle = '#8e8c86'; c.fillRect(x, y + 1, 2, 2); c.fillStyle = col; c.fillRect(x, y, 2, 2); } };
    line(X - 26, Y - 70, X - 28, Y, 'rgba(30,30,34,.45)'); line(X + 26, Y - 70, X + 28, Y, 'rgba(30,30,34,.45)');
    ring(30, 10, '#e6e4dc', 'rgba(255,248,225,.18)'); ring(20, 7, '#f2f0e8', 'rgba(255,248,225,.2)'); ring(11, 4, '#fbfaf4', 'rgba(255,248,225,.22)');
  } else {
    const hw = Math.round((w || 60) / 2);
    c.fillStyle = 'rgba(30,30,34,.5)'; c.fillRect(X - hw + 4, Y - 70, 1, 70); c.fillRect(X + hw - 4, Y - 70, 1, 70);
    c.fillStyle = 'rgba(255,248,225,.16)'; c.fillRect(X - hw, Y + 4, hw * 2, 6);
    c.fillStyle = '#1f2024'; c.fillRect(X - hw, Y, hw * 2, 4); c.fillStyle = '#3a3c42'; c.fillRect(X - hw, Y, hw * 2, 1);
    c.fillStyle = '#fbf6e2'; c.fillRect(X - hw + 2, Y + 4, hw * 2 - 4, 1);
  }
}

/* ---------- Asteroide: la oficina de Administración (Sofi y Tato), hecha a partir de la foto ---------- */
/* pared de madera oscura con estantes empotrados, la ventana de rejas grises en el medio y el placard a la derecha */
function asteroWall(b, X, Y, w){
  const p = Pen(b, X, Y), D = '#3b1f12', M = '#5b3520', L = '#734429', H = '#8a5634';
  p.R(0, 0, w, 64, M); p.R(0, 0, w, 3, L); p.R(0, 3, w, 1, D); p.R(0, 62, w, 2, D);
  const win0 = Math.round(w * .36), winW = Math.round(w * .33), cab0 = win0 + winW + 6;
  // estantes abiertos a la izquierda, con lo que se ve en la foto
  const sx = 3, sw = win0 - 8, shelves = [5, 16, 27, 38, 49];
  p.R(sx, 5, sw, 56, '#2e180d');
  shelves.forEach((y, i) => {
    if (i === 0){ p.R(sx + 4, y + 6, 5, 4, '#b98a5a'); p.R(sx + 9, y + 3, 6, 7, '#a77a4c'); p.R(sx + 14, y + 6, 4, 4, '#c79a68'); p.R(sx + 9, y + 3, 6, 1, '#d4aa78'); }
    if (i === 1){ p.R(sx + 5, y + 2, 3, 8, '#e9edf2'); p.R(sx + 4, y + 4, 5, 6, '#2f5fa8'); p.R(sx + 5, y + 5, 3, 3, '#e9edf2'); p.R(sx + 13, y + 5, 4, 5, '#f4f1ea'); p.R(sx + 13, y + 4, 4, 1, '#3a3a3e'); p.R(sx + 18, y + 6, 3, 4, '#f4f1ea'); p.R(sx + 18, y + 5, 3, 1, '#3a3a3e'); }
    if (i === 2){ let x = sx + 2; for (const [bw, col] of [[2, '#e7e1d2'], [2, '#d24a3a'], [3, '#f4f1ea'], [2, '#2f4f6f'], [2, '#e7c25a'], [3, '#f4f1ea'], [2, '#c46a3a'], [2, '#3a3a3e']]){ p.R(x, y + 2, bw, 8, col); p.R(x, y + 2, bw, 1, hil(col, .25)); x += bw; } }
    if (i === 3){ p.R(sx + 2, y + 3, 7, 7, '#f1f1ee'); p.E(sx + 5, y + 6, 2, 2, '#9fb5c8'); p.R(sx + 10, y + 2, 12, 8, '#7fc24a'); p.R(sx + 10, y + 2, 12, 1, '#a8de72'); p.R(sx + 11, y + 4, 10, 1, '#e8f0d8'); p.R(sx + 10, y + 7, 12, 2, '#3d8a8a'); }
    if (i === 4){ p.R(sx + 2, y + 2, sw - 4, 9, L); p.R(sx + 2, y + 2, sw - 4, 1, H); p.R(Math.round(sx + sw / 2) - 1, y + 6, 3, 1, '#d8c39f'); }
    p.R(sx - 1, y + 10, sw + 2, 2, L); p.R(sx - 1, y + 10, sw + 2, 1, H);
  });
  p.R(sx - 3, 4, 3, 58, L); p.R(sx + sw, 4, 3, 58, L);
  // estante abierto sobre la ventana y la ventana con rejas grises
  p.R(win0, 5, winW, 8, '#2e180d'); p.R(win0, 12, winW, 2, L); p.R(win0 + 4, 7, 6, 5, '#b98a5a');
  const wy = 16, wh = 44; p.R(win0 - 2, wy - 2, winW + 4, wh + 4, '#4a2a18'); p.R(win0 - 2, wy - 2, winW + 4, 1, H);
  p.R(win0, wy, winW, wh, '#5f646b');
  const cols = 3, rows = 4, gw = (winW - 4) / cols, gh = (wh - 4) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++){
    const gx = Math.round(win0 + 2 + c * gw) + 1, gy = Math.round(wy + 2 + r * gh) + 1, ww = Math.round(gw) - 2, hh = Math.round(gh) - 2;
    p.R(gx, gy, ww, hh, '#8fa6b8'); p.R(gx, gy, ww, 1, '#b4c6d4');
    if ((r + c) % 2 === 0) p.R(gx + 1, gy + 2, 1, hh - 3, '#c9d8e2');
  }
  p.R(Math.round(win0 + winW / 2) - 1, wy, 2, wh, '#4c5056'); p.R(win0 + Math.round(winW / 2) + 2, wy + Math.round(wh / 2), 2, 4, '#c9a64a');
  // placard de madera a la derecha: arriba abierto, abajo dos puertas con perillas
  const cw = w - cab0 - 3;
  p.R(cab0, 5, cw, 12, '#2e180d'); p.R(cab0, 16, cw, 2, L); p.R(cab0 + 3, 9, 8, 7, '#e7e1d2'); p.R(cab0 + 12, 10, 6, 6, '#c79a68');
  for (const [dx, dw] of [[0, Math.floor(cw / 2) - 1], [Math.floor(cw / 2) + 1, Math.ceil(cw / 2) - 1]]){
    p.R(cab0 + dx, 19, dw, 42, L); p.R(cab0 + dx, 19, dw, 1, H); p.R(cab0 + dx + 2, 22, dw - 4, 36, M); p.R(cab0 + dx + 2, 22, dw - 4, 1, D);
  }
  p.P(cab0 + Math.floor(cw / 2) - 3, 40, '#d8c39f'); p.P(cab0 + Math.floor(cw / 2) + 3, 40, '#d8c39f');
  p.R(0, 64, w, 2, PX.shadowS);
}
/* la mesa redonda de madera clara con la pata negra y todo lo que hay arriba en la foto */
function roundTableSprite(w, h){
  const key = 'rtable' + w + 'x' + h; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  return SMALL_CACHE[key] = sprite(w, h, p => {
    const cx = Math.round(w / 2), cy = 26, rx = Math.round(w / 2) - 2, ry = 21;
    p.R(cx - 3, cy + 10, 6, h - cy - 14, '#1e1e22'); p.R(cx - 3, cy + 10, 2, h - cy - 14, '#3a3a40');
    p.R(cx - 16, h - 5, 32, 3, '#1e1e22'); p.R(cx - 16, h - 5, 32, 1, '#3a3a40');
    p.E(cx, cy + 3, rx, ry, '#a98a5e'); p.E(cx, cy, rx, ry, '#dcc49b'); p.E(cx, cy - 1, rx - 2, ry - 2, '#e3cda6');
    for (let i = 0; i < 18; i++){ const k = hash(i, 91), x = cx - rx + 6 + k % (rx * 2 - 12), y = cy - ry + 6 + (k >> 8) % (ry * 2 - 12); if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < .8) p.R(x, y, 4 + (k >> 4) % 6, 1, '#d2b88c'); }
    monitor(p, cx - 12, cy - 22, '#22252d', true);
    p.R(cx - 30, cy - 14, 5, 11, '#9fdacb'); p.R(cx - 30, cy - 14, 5, 1, '#c9eee4'); p.R(cx - 29, cy - 17, 3, 3, '#e8e8e4');
    p.E(cx - 34, cy - 2, 3, 3, '#7a5a3a'); p.R(cx - 36, cy - 5, 4, 1, '#7fae3a'); p.R(cx - 33, cy - 9, 1, 5, '#c8ccd0');
    laptop(p, cx - 26, cy + 6, '#2a2d34');
    p.R(cx - 4, cy - 2, 9, 5, '#f4f6f8'); p.R(cx - 4, cy - 2, 9, 2, '#6fa8dc'); p.R(cx - 1, cy - 4, 3, 2, '#ffffff');
    p.R(cx + 18, cy - 18, 14, 9, '#22252d'); p.R(cx + 19, cy - 17, 12, 7, '#2e323b'); p.P(cx + 22, cy - 15, '#d24a3a'); p.P(cx + 26, cy - 13, '#d24a3a'); p.R(cx + 20, cy - 9, 12, 2, '#9aa0a8');
    papers(p, cx + 18, cy + 2); p.R(cx + 22, cy - 2, 12, 5, '#3a3a3e'); p.R(cx + 22, cy - 2, 12, 1, '#55555c');
    p.R(cx + 7, cy + 4, 7, 10, 'rgba(225,238,244,.75)'); p.R(cx + 7, cy + 4, 7, 1, '#ffffff'); p.R(cx + 13, cy + 6, 2, 4, 'rgba(225,238,244,.6)');
    p.R(cx - 8, cy + 12, 10, 4, '#2c3e66'); p.R(cx - 8, cy + 12, 10, 1, '#41598c');
    p.R(cx + 1, cy - 9, 4, 5, '#2a2a2e'); p.R(cx + 1, cy - 11, 1, 3, '#d24a3a'); p.R(cx + 3, cy - 12, 1, 4, '#3d6fb0');
  }, {dark: .55});
}
/* la lámpara de pie de arco con la pantalla negra */
function arcLampSprite(){
  if (SMALL_CACHE.arclamp) return SMALL_CACHE.arclamp;
  // la base va a la derecha y el arco cuelga la pantalla hacia la izquierda (hacia la ventana, como en la foto)
  return SMALL_CACHE.arclamp = sprite(40, 86, p => {
    p.E(32, 83, 7, 2, '#1e1e22'); p.R(26, 81, 13, 2, '#2e2e34');
    const pts = []; for (let t = 0; t <= 1.0001; t += .02){ const x = (1 - t) ** 2 * 32 + 2 * (1 - t) * t * 33 + t * t * 9, y = (1 - t) ** 2 * 81 + 2 * (1 - t) * t * -6 + t * t * 6; pts.push([Math.round(x), Math.round(y)]); }
    for (const [x, y] of pts){ p.R(x, y, 2, 2, '#9aa0a8'); p.P(x + 1, y, '#d0d4d8'); }
    p.R(9, 6, 1, 8, '#4a4a50');
    p.R(1, 14, 18, 13, '#1e1e22'); p.R(0, 15, 20, 11, '#1e1e22'); p.R(1, 14, 18, 1, '#3a3a40'); p.R(2, 26, 16, 1, '#e8c66a'); p.R(4, 27, 12, 1, 'rgba(255,230,160,.6)');
  }, {dark: .5});
}
/* la impresora sobre el mueble gris de cajones, con el teléfono inalámbrico al lado */
function printerCabinetSprite(){
  if (SMALL_CACHE.prcab) return SMALL_CACHE.prcab;
  return SMALL_CACHE.prcab = sprite(30, 48, p => {
    const C = rampOf('#b4b8be');
    p.R(1, 22, 28, 26, C.m); p.R(1, 22, 28, 2, C.h); p.R(1, 46, 28, 2, C.e); p.R(28, 22, 1, 26, C.d);
    for (const y of [27, 36]){ p.R(3, y, 24, 8, C.l); p.R(3, y + 7, 24, 1, C.d); p.R(12, y + 3, 6, 1, '#6a6e74'); }
    p.RR(2, 10, 21, 13, '#e3e5e7'); p.R(3, 11, 19, 1, '#ffffff'); p.R(3, 18, 19, 4, '#c9ccd0'); p.R(6, 14, 13, 2, '#3b3e48'); p.R(5, 4, 15, 7, '#fbf8ef'); p.R(7, 6, 9, 1, '#c9c2b0');
    p.R(18, 12, 3, 2, '#3a7fd0');
    p.R(24, 12, 4, 11, '#2a2a2e'); p.R(25, 13, 2, 3, '#7fc8e0'); p.R(23, 21, 6, 2, '#3a3a40');
  });
}

/* puerta doble de la Sala del Directorio: madera oscura con paneles, manijas de bronce y una placa dorada */
function vipDoorSprite(){
  if (SMALL_CACHE.vipdoor) return SMALL_CACHE.vipdoor;
  return SMALL_CACHE.vipdoor = sprite(64, 46, p => {
    const W = rampOf('#4a2c20');
    p.R(0, 0, 64, 46, W.d); p.R(2, 2, 29, 44, W.m); p.R(33, 2, 29, 44, W.m); p.R(31, 2, 2, 44, W.e);
    for (const x of [5, 36]){ p.R(x, 6, 23, 15, W.d); p.R(x + 1, 7, 21, 13, W.l); p.R(x + 1, 7, 21, 1, W.h); p.R(x, 25, 23, 17, W.d); p.R(x + 1, 26, 21, 15, W.l); }
    p.R(27, 24, 2, 6, '#d4b85a'); p.R(35, 24, 2, 6, '#d4b85a'); p.P(27, 24, '#f2dc8a'); p.P(35, 24, '#f2dc8a');
    p.R(22, 9, 20, 7, '#c9a24a'); p.R(23, 10, 18, 5, '#e2c070'); p.R(25, 12, 14, 1, '#8a6a2a');
  });
}
