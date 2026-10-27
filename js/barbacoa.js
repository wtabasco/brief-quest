/* La barbacoa (la cocina del patio) y el baño, hechos a partir de fotos */
"use strict";
/* ================= LA BARBACOA (la cocina del patio) Y EL BAÑO =================
   La barbacoa es el quincho de vidrio del patio: adentro está la cocina, con la barra de madera y sus butacas,
   el parrillero, el sillón verde con la mesa ratona (como en la foto), la mesa de vidrio con sillas de madera,
   la heladera y el dispensador de agua. Donde antes estaba la cocina ahora está el baño (como en las fotos):
   azulejos blancos con guarda de mármol negro, piso de mármol negro, inodoro, bidé, mesada de granito con
   bacha y espejo, dispensadores de papel, el tacho de acero y la ventana de rejas grises con una planta. */

/* ---------- Baño ---------- */
function toiletSprite(){
  if (SMALL_CACHE.toilet) return SMALL_CACHE.toilet;
  return SMALL_CACHE.toilet = sprite(20, 34, p => {
    const W = rampOf('#f1ede2');
    p.RR(3, 0, 14, 15, W.m); p.R(4, 1, 12, 1, '#fffdf6'); p.R(15, 2, 1, 12, W.d); p.R(5, 13, 10, 1, '#c9c2ae');
    p.R(4, 14, 2, 2, '#b9bcc2'); p.R(14, 14, 2, 2, '#b9bcc2');
    p.E(10, 21, 8, 6, W.d); p.E(10, 20, 8, 6, W.m); p.E(10, 20, 5, 4, '#e2ddd0'); p.E(10, 21, 3, 2, '#c9d6dc');
    p.R(6, 25, 8, 8, W.m); p.R(13, 25, 1, 8, W.d); for (const x of [7, 9, 11]) p.R(x, 27, 1, 5, '#ddd7c8'); p.R(5, 32, 10, 2, W.d);
  });
}
function bidetSprite(){
  if (SMALL_CACHE.bidet) return SMALL_CACHE.bidet;
  return SMALL_CACHE.bidet = sprite(20, 28, p => {
    const W = rampOf('#f4f1e8');
    for (const x of [5, 10, 15]){ p.R(x - 1, 0, 3, 3, '#c9ccd2'); p.P(x, 0, '#ffffff'); }
    p.E(10, 10, 8, 6, W.d); p.E(10, 9, 8, 6, W.m); p.E(10, 10, 5, 4, '#e6e1d4'); p.P(10, 11, '#9aa0a8');
    p.R(6, 15, 8, 10, W.m); p.R(13, 15, 1, 10, W.d); for (const x of [7, 9, 11]) p.R(x, 17, 1, 7, '#ddd7c8'); p.R(5, 25, 10, 3, W.d);
  });
}
/* mesada de granito negro con bacha blanca, griferia cromada y el aerosol rojo; abajo, el mueble de madera */
function vanitySprite(w){
  const key = 'vanity' + w; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  return SMALL_CACHE[key] = sprite(w, 40, p => {
    const Wd = rampOf('#6a3a22');
    p.R(0, 14, w, 24, Wd.m); p.R(0, 14, w, 1, Wd.l);
    for (let x = 2; x < w - 4; x += Math.floor((w - 4) / 3)){ p.R(x, 17, Math.floor((w - 4) / 3) - 3, 18, Wd.d); p.R(x + 1, 18, Math.floor((w - 4) / 3) - 5, 16, Wd.m); p.R(x + Math.floor((w - 4) / 3) - 6, 24, 1, 4, '#c9a64a'); }
    p.R(0, 37, w, 3, '#1e1e22');
    p.R(0, 2, w, 13, '#26262b'); p.R(0, 2, w, 1, '#4a4a52'); p.R(0, 14, w, 1, '#141416');
    for (let i = 0; i < 40; i++){ const r = hash(i, 77); p.P(r % w, 3 + (r >> 8) % 11, r % 3 ? '#3c3c44' : '#5a5a64'); }
    const sx = Math.round(w * .62); p.E(sx, 8, 8, 4.5, '#d8d4c8'); p.E(sx, 8, 7, 3.5, '#f6f3ea'); p.E(sx, 9, 4, 2, '#e4e0d4'); p.P(sx, 9, '#8a8e94');
    p.R(sx - 1, 0, 3, 5, '#b9bcc2'); p.P(sx, 0, '#ffffff'); p.R(sx - 6, 1, 3, 3, '#c9ccd2'); p.R(sx + 4, 1, 3, 3, '#c9ccd2');
    p.R(Math.round(w * .2), -6, 4, 10, '#a02c2c'); p.R(Math.round(w * .2), -8, 4, 2, '#e2c27a'); p.R(Math.round(w * .2), -2, 4, 2, '#e8dccb');
  });
}
function steelBinSprite(){
  if (SMALL_CACHE.steelbin) return SMALL_CACHE.steelbin;
  return SMALL_CACHE.steelbin = sprite(14, 22, p => {
    p.E(7, 3, 6, 2.5, '#d8dce2'); p.E(7, 3, 5, 1.6, '#b4b9c0');
    p.R(1, 3, 12, 17, '#9aa0a8'); p.R(2, 3, 3, 17, '#d0d4da'); p.R(5, 3, 1, 17, '#eef0f2'); p.R(11, 3, 2, 17, '#6e737a');
    p.R(1, 19, 12, 2, '#55595f'); p.R(4, 20, 6, 2, '#3a3d42');
  });
}
/* lo que va en la pared del fondo del baño: portarrollo, espejo grande, dispensadores de papel y la ventana con la planta */
function bathWall(b, X, Y, w){
  const p = Pen(b, X, Y);
  // portarrollo redondo blanco (sobre el inodoro)
  p.E(18, 14, 7, 7, '#d9dde2'); p.E(18, 13, 6, 6, '#f6f7f8'); p.R(13, 13, 11, 1, '#2f5fb0');
  // espejo grande sobre la mesada, con los dispensadores reflejados
  const mx = 3*32 + 4, mw = 2*32 + 20; p.R(mx, 4, mw, 26, '#b9c6cc'); p.R(mx + 1, 5, mw - 2, 24, '#d5e0e4'); p.L(mx + 6, 26, mx + 22, 6, 'rgba(255,255,255,.6)'); p.L(mx + 12, 27, mx + 28, 7, 'rgba(255,255,255,.35)');
  // dispensador de toallas de papel
  p.RR(5*32 + 22, 4, 14, 18, '#eef0f0'); p.R(5*32 + 24, 6, 10, 6, '#c9d8de'); p.R(5*32 + 26, 8, 6, 3, '#f6f6f2'); p.R(5*32 + 25, 16, 8, 1, '#2f5fb0');
  // ventana con rejas grises y vidrio esmerilado (y la planta que se asoma)
  const wx = 6*32 + 8, ww = 50; p.R(wx, 2, ww, 28, '#3c4047'); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++){ p.R(wx + 2 + c * 24, 3 + r * 9, 22, 7, '#c5d6ec'); p.R(wx + 2 + c * 24, 3 + r * 9, 22, 2, '#dfe9f6'); }
  p.R(wx - 1, 30, ww + 2, 2, '#1e1e22');
}

/* ---------- Barbacoa ---------- */
/* parrillero (como en la foto): metido en la pared blanca, boca de ladrillo de campo, viga de hierro negro arriba,
   parrilla plana y otra inclinada, los fierros en el piso del fogón, la manivela al costado y abajo el hueco gris */
function grillWall(b, X, Y, w){
  const p = Pen(b, X, Y), BK = '#d29a62', BKd = '#b07a46', MO = '#ecd3aa', IR = '#2c2d31';
  // el frente de la pared, apenas saliente
  p.R(0, 6, 1, 54, '#d6d0dc'); p.R(w - 1, 6, 1, 54, '#cfc8d6'); p.R(1, 6, w - 2, 1, '#f7f5f9');
  // la manivela para subir y bajar la parrilla
  p.R(w - 31, 9, 3, 3, '#4a4b50'); p.P(w - 30, 10, '#8a8b92'); p.L(w - 29, 11, w - 25, 14, IR); p.R(w - 25, 14, 1, 3, IR);
  // la boca: fondo de ladrillo con hollín arriba y la luz cálida abajo
  const ox = 8, ow = w - 16, oy = 22, oh = 22;
  for (let y = 0; y < oh; y++){ const t = y / oh; p.R(ox, oy + y, ow, 1, t < .35 ? mixC('#4a3426', '#8a5a3a', t / .35) : mixC('#8a5a3a', '#c98a52', (t - .35) / .65)); }
  for (let y = oy + 3; y < oy + oh; y += 4){ p.R(ox, y, ow, 1, 'rgba(60,34,20,.35)'); for (let x = ox + ((y >> 2) % 2 ? 3 : 9); x < ox + ow; x += 12) p.R(x, y - 3, 1, 3, 'rgba(60,34,20,.3)'); }
  // marco de ladrillos a los costados y el borde de abajo
  const brick = (x, y, bw, bh) => { p.R(x, y, bw, bh, BK); for (let j = 0; j < bh; j += 3){ p.R(x, y + j, bw, 1, MO); for (let i = (j / 3) % 2 ? 0 : 3; i < bw; i += 6) p.R(x + i, y + j, 1, 3, MO); } p.R(x, y + bh - 1, bw, 1, BKd); };
  brick(ox - 4, oy - 1, 4, oh + 6); brick(ox + ow, oy - 1, 4, oh + 6); brick(ox - 4, oy + oh, ow + 8, 6);
  // la viga de hierro negro
  p.R(ox - 8, oy - 7, ow + 16, 7, IR); p.R(ox - 8, oy - 7, ow + 16, 1, '#5a5c62'); p.R(ox - 8, oy - 1, ow + 16, 1, '#17181b');
  // parrilla plana a la izquierda y la inclinada que sube hacia el fondo
  for (let x = 0; x < 26; x++){ p.P(ox + 3 + x, oy + 15, '#3a3b40'); if (x % 2 === 0) p.R(ox + 3 + x, oy + 13, 1, 3, '#55565c'); }
  p.R(ox + 3, oy + 12, 26, 1, '#6a6b72'); p.R(ox + 4, oy + 16, 1, 4, IR); p.R(ox + 27, oy + 16, 1, 4, IR);
  for (let i = 0; i < 40; i++){ const x = ox + 22 + i, y = Math.round(oy + 16 - i * .28); p.R(x, y - 3, 1, 4, i % 2 ? '#3a3b40' : '#5c5d63'); p.P(x, y - 4, '#6e6f76'); }
  p.R(ox + 23, oy + 16, 1, 4, IR); p.R(ox + 60, oy + 6, 1, 11, IR);
  // los fierros y las brasas
  p.L(ox + 4, oy + 19, ox + 20, oy + 21, '#1d1d20'); p.L(ox + 6, oy + 21, ox + 24, oy + 20, '#1d1d20'); p.E(ox + 5, oy + 21, 1, 1, '#1d1d20');
  for (let i = 0; i < 9; i++){ const r = hash(i, 47); p.P(ox + ow - 18 + r % 14, oy + oh - 3 + (r >> 4) % 2, i % 3 ? '#f08a3a' : '#ffd36a'); }
  p.R(ox + ow - 20, oy + oh - 1, 18, 1, '#e04a2a');
  // abajo de la boca, el hueco gris de cemento
  p.R(ox, oy + oh + 6, ow, 14, '#5c5d61'); p.R(ox, oy + oh + 6, ow, 2, '#3f4044');
}
/* vinoteca de madera oscura en rombos con algunos vinos, y abajo el estante blanco con los dos microondas (como en la foto) */
function wineRackWall(b, X, Y, w){
  const p = Pen(b, X, Y), WD = '#3a2216', WL = '#6a4228';
  p.R(0, 6, w, 26, WD); p.R(2, 8, w - 4, 22, '#1b110b');
  for (let y = 8; y < 30; y++) for (let x = 2; x < w - 2; x++) if ((x + y) % 8 === 0 || (x - y + 80) % 8 === 0) p.P(x, y, WL);
  const bott = [[8, 25, '#2f4a2c', '#d8b04a'], [16, 25, '#4a1e22', '#a8322a'], [40, 25, '#2f4a2c', '#e8e2d4'], [48, 25, '#3a2a1a', '#d8b04a'], [24, 21, '#2f4a2c', '#a8322a'], [32, 25, '#4a1e22', '#d8b04a']];
  for (const [x, y, c, k] of bott){ p.E(x, y, 2, 2, c); p.P(x - 1, y - 1, '#7a9a74'); p.P(x, y, k); }
  p.R(0, 6, w, 1, '#5a3a26'); p.R(0, 30, w, 2, WD); for (let x = 6; x < w - 4; x += 7){ p.R(x, 32, 1, 2, '#c9dde4'); p.R(x - 1, 34, 3, 2, 'rgba(210,232,240,.85)'); }
  // estante blanco y los microondas
  p.R(2, 49, 48, 2, '#f6f6f4'); p.R(2, 51, 48, 1, '#c9c4cc');
  p.R(3, 37, 21, 12, '#e6e2da'); p.R(3, 37, 21, 1, '#f7f5f0'); p.R(5, 39, 12, 8, '#2a2c30'); p.R(6, 40, 4, 1, '#55585e'); p.R(19, 39, 4, 8, '#d4d0c8'); for (let j = 0; j < 3; j++) p.R(20, 41 + j * 2, 2, 1, '#8a8780'); p.R(19, 39, 4, 1, '#2a2c30');
  p.R(26, 36, 24, 13, '#f4f4f2'); p.R(26, 36, 24, 1, '#ffffff'); p.R(27, 38, 16, 9, '#17181b'); p.R(28, 39, 5, 1, '#3a3c42'); p.R(44, 38, 5, 9, '#202125'); p.P(46, 40, '#7ad0ff'); p.P(46, 42, '#d8dadc');
}
/* barra (como en la foto): tapa de madera rojiza oscura sobre un muro bajo blanco; arriba, el mate, el pan, el rollo de cocina y la freidora */
function woodBarSprite(w){
  const key = 'bar' + w; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  return SMALL_CACHE[key] = sprite(w, 48, p => {
    const T = rampOf('#7a3620'), Wl = rampOf('#ece8e6');
    p.R(0, 8, w, 9, T.m); p.R(0, 8, w, 1, T.l); for (let x = 4; x < w; x += 15) p.R(x, 10 + (x % 3), 9, 1, T.l); p.R(0, 13, w, 1, T.d);
    p.R(0, 17, w, 2, T.e);
    p.R(0, 19, w, 27, Wl.m); p.R(0, 19, w, 3, Wl.e); p.R(0, 22, w, 1, Wl.d);
    for (let i = 0; i < 20; i++){ const r = hash(i, 77); p.R(r % (w - 6), 25 + (r >> 8) % 18, 2 + (r >> 4) % 5, 1, Wl.d); }
    for (const x of [10, w - 12]) p.R(x, 19, 2, 4, '#2a2b2e');
    p.R(0, 46, w, 2, Wl.e);
    // un mate, una bolsa de pan, el rollo de cocina y la freidora negra
    p.E(14, 11, 3, 2.5, '#5a3a20'); p.R(15, 7, 1, 4, '#c8ccd0');
    const bx = Math.round(w * .42); p.RR(bx, 4, 22, 9, '#e9cf98'); p.R(bx + 2, 5, 16, 2, '#f8ecd0'); p.R(bx + 6, 8, 10, 3, '#d9b070');
    p.RR(w - 40, 0, 9, 12, '#f2f2ef'); p.E(w - 36, 1, 4, 1, '#ffffff'); p.P(w - 36, 1, '#c8c8c4');
    p.RR(w - 26, 1, 15, 12, '#1d1e21'); p.R(w - 25, 2, 13, 1, '#3e4046'); p.R(w - 23, 6, 9, 1, '#2c2e32');
  });
}
/* butaca alta de la barra, vista de atrás: respaldo y asiento de madera, estructura y patas de hierro negro con aro */
function stoolSprite(){
  if (SMALL_CACHE.stool) return SMALL_CACHE.stool;
  return SMALL_CACHE.stool = sprite(20, 34, p => {
    const W = rampOf('#c48038'), IR = '#1c1c1f';
    p.E(10, 13, 9, 3, W.d); p.E(10, 12, 9, 2.5, W.m);
    p.RR(1, 0, 18, 7, W.m); p.R(2, 1, 16, 1, W.l); p.R(1, 6, 18, 1, W.d);
    p.R(9, 0, 2, 7, IR); for (const x of [3, 16]) p.R(x, 2, 1, 13, IR);
    p.R(2, 15, 2, 18, IR); p.R(16, 15, 2, 18, IR); p.R(6, 15, 1, 16, '#2c2c30'); p.R(13, 15, 1, 16, '#2c2c30');
    p.R(2, 25, 16, 1, IR); p.R(4, 26, 12, 1, '#3a3a3e'); p.P(4, 32, IR); p.P(15, 32, IR);
  });
}
/* la heladera de acero (como en la foto): freezer arriba, dispensador de agua en la puerta, y arriba la canasta de mimbre y la cajita gris */
function steelFridgeSprite(){
  if (SMALL_CACHE.sfridge) return SMALL_CACHE.sfridge;
  return SMALL_CACHE.sfridge = sprite(26, 66, p => {
    const S = rampOf('#a8acaf');
    p.RR(1, 3, 12, 7, '#9a8a5a'); for (let x = 2; x < 13; x += 2) p.R(x, 5, 1, 4, '#c8b07a'); p.R(1, 4, 12, 1, '#2e3a4a'); p.L(4, 3, 7, 0, '#b0884a'); p.L(7, 0, 10, 3, '#b0884a');
    p.RR(4, 0, 6, 4, 'rgba(225,235,240,.8)'); p.R(4, 0, 6, 1, '#e05a3a');
    p.RR(14, 5, 11, 5, '#8e9094'); for (let x = 15; x < 24; x += 3) p.R(x, 7, 2, 1, '#6e7074'); p.R(16, 3, 5, 2, '#e88a9a');
    for (let x = 0; x < 26; x++) p.R(x, 10, 1, 56, x < 3 ? S.l : x > 22 ? S.d : x % 7 === 2 ? S.l : S.m);
    p.R(0, 10, 26, 1, S.h); p.R(10, 13, 6, 1, '#d8dadc');
    p.R(0, 30, 26, 2, '#2a2b2e'); p.R(0, 32, 26, 1, S.h);
    p.R(8, 40, 10, 12, '#1d1e21'); p.R(9, 41, 8, 1, '#3e4045'); p.R(10, 44, 6, 6, 'rgba(200,220,232,.35)'); p.R(9, 50, 8, 1, '#55585e');
    p.R(0, 64, 26, 2, S.e);
  });
}
/* sillón verde de tres cuerpos con almohadones beige (visto de frente); joined: sin brazo derecho, ahí sigue la punta en L */
function greenSofaSprite(w, joined){
  const key = 'gsofa' + w + (joined ? 'j' : ''); if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  return SMALL_CACHE[key] = sprite(w, 38, p => {
    const G = rampOf('#1f6b5c');
    p.RR(2, 0, w - 4, 16, G.d); p.R(3, 1, w - 6, 1, G.m);
    const n = 3, cw = (w - 16) / n;
    for (let i = 0; i < n; i++){ const x = Math.round(8 + i * cw); p.RR(x, 3, Math.round(cw) - 2, 13, G.m); p.R(x + 1, 4, Math.round(cw) - 4, 1, G.l); }
    p.RR(0, 10, 9, 24, G.m); p.R(1, 10, 7, 1, G.l); if (!joined){ p.RR(w - 9, 10, 9, 24, G.m); p.R(w - 8, 10, 7, 1, G.l); }
    for (let i = 0; i < n; i++){ const x = Math.round(8 + i * cw); p.RR(x, 16, Math.round(cw) - 2, 14, G.m); p.R(x + 1, 17, Math.round(cw) - 4, 1, G.h); p.R(x, 28, Math.round(cw) - 2, 2, G.d); }
    [[12, 6, '#d9cfbf'], [Math.round(w / 2) - 4, 5, '#e2d9ca'], [w - 26, 6, '#d9cfbf']].forEach(([x, y, c]) => { p.RR(x, y, 13, 11, c); p.R(x + 1, y + 1, 11, 1, '#f0e9dd'); p.RR(x + 4, y + 7, 10, 7, '#c9b39a'); });
    p.R(4, 34, 3, 4, '#a8743f'); p.R(w - 7, 34, 3, 4, '#a8743f'); p.R(0, 32, w, 2, G.e);
  });
}
/* la punta del sillón en L (el puf grande pegado al sillón, como en la foto), vista de arriba */
function chaiseSprite(){
  if (SMALL_CACHE.chaise) return SMALL_CACHE.chaise;
  return SMALL_CACHE.chaise = sprite(32, 50, p => {
    const G = rampOf('#1f6b5c');
    p.RR(0, 0, 32, 48, G.d); p.RR(2, 2, 28, 42, G.m); p.R(3, 3, 26, 1, G.l); p.R(2, 22, 28, 1, G.d);
    p.RR(23, 0, 9, 46, G.m); p.R(24, 0, 7, 1, G.l);
    p.RR(4, 4, 15, 12, '#d9cfbf'); p.R(5, 5, 13, 1, '#f0e9dd');
    p.R(2, 44, 28, 3, G.e); p.R(3, 47, 3, 3, '#a8743f'); p.R(26, 47, 3, 3, '#a8743f');
  });
}
/* mesa ratona: tapa de madera gastada y estructura de hierro negro */
function coffeeTableSprite(w){
  const key = 'ctable' + w; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  return SMALL_CACHE[key] = sprite(w, 24, p => {
    p.R(0, 0, w, 12, '#7a4e2a'); p.R(0, 0, w, 1, '#a07040');
    for (let i = 0; i < 26; i++){ const r = hash(i, 63); p.R(r % (w - 8), 1 + (r >> 8) % 10, 4 + (r >> 4) % 8, 1, i % 2 ? '#c9a070' : '#8a5a34'); }
    p.R(0, 12, w, 2, '#1e1e22'); p.R(0, 12, 2, 12, '#1e1e22'); p.R(w - 2, 12, 2, 12, '#1e1e22'); p.R(0, 22, w, 2, '#2a2a2e');
  });
}
/* mesa de vidrio con estructura negra */
function glassTableSprite(w, h){
  const key = 'gtable' + w + 'x' + h; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  return SMALL_CACHE[key] = sprite(w, h, p => {
    const th = h - 12;
    for (const x of [2, w - 5]){ p.R(x, 4, 3, h - 4, '#1e1e22'); }
    p.R(0, 0, w, th, 'rgba(190,220,228,.55)'); p.R(0, 0, w, 1, '#eaf6f8'); p.R(0, th - 1, w, 2, '#5a6a70'); p.R(0, 0, 1, th, '#9fb4ba'); p.R(w - 1, 0, 1, th, '#7a8e94');
    p.L(6, th - 6, 22, 3, 'rgba(255,255,255,.55)'); p.L(12, th - 4, 30, 2, 'rgba(255,255,255,.3)');
    p.E(w * .3, th * .45, 4, 2.5, '#fbf8ef'); p.E(w * .3, th * .45, 2, 1.2, '#e2c27a'); p.R(w * .6, th * .3, 4, 5, 'rgba(220,236,242,.9)'); p.E(w * .75, th * .6, 3, 2, '#5a3a20');
  });
}
/* silla de madera: de frente, de espaldas o de costado */
function woodChairSprite(view){
  const key = 'wchair' + view; if (SMALL_CACHE[key]) return SMALL_CACHE[key];
  const W = rampOf('#9a6a3a');
  let s;
  if (view === 'back') s = sprite(20, 30, p => { p.R(2, 0, 16, 12, W.m); p.R(2, 0, 16, 1, W.h); for (const x of [6, 10, 14]) p.R(x, 2, 1, 9, W.d); p.R(2, 12, 16, 4, W.d); p.R(3, 16, 2, 13, W.e); p.R(15, 16, 2, 13, W.e); });
  else if (view === 'front') s = sprite(20, 26, p => { p.R(3, 0, 14, 5, W.d); p.R(2, 5, 16, 8, W.m); p.R(2, 5, 16, 1, W.h); p.R(3, 13, 2, 12, W.e); p.R(15, 13, 2, 12, W.e); });
  else { s = sprite(16, 30, p => { p.R(view === 'left' ? 11 : 2, 0, 3, 18, W.d); p.R(2, 13, 12, 5, W.m); p.R(2, 13, 12, 1, W.h); p.R(3, 18, 2, 11, W.e); p.R(11, 18, 2, 11, W.e); }); }
  return SMALL_CACHE[key] = s;
}
