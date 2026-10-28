/* Sprites diseñados en PNG: acá se registran */
"use strict";
/* ================= ARTE DISEÑADO (hojas de sprites en PNG) =================
   Si un personaje tiene su hoja, el juego la usa; si no, usa el dibujo generado.
   Mundo: 3 columnas (quieto, paso 1, paso 2) x 4 filas (abajo, izquierda, derecha, arriba).
   El tamaño del cuadro sale de la imagen (ancho / 3, alto / filas) y se dibuja a tamaño real:
   un píxel de la hoja es un píxel de pantalla, igual que las baldosas. Los pies van a 2 px del borde inferior.
   Con 3 filas (sin derecha) se espeja la izquierda.
   Combate: 'battle' de frente (rival), 'back' de espaldas (jugador) y 'cheer' para celebrar, con los pies abajo.
   Con hd: true las imágenes son recortes de la ficha a su tamaño original y el juego las escala al dibujarlas
   (K_WORLD y K_BATTLE), así se ven igual que la infografía. */
const ART = {
  // Fede, Sahi, Lu, Agus, Lía y el pasante (chico y chica) ya están cargados (más abajo).
  // Descomentá cada línea cuando el PNG esté en assets/sprites/:
  // pimi:       {world: 'assets/sprites/pimi-mundo.png'},
  // reni:       {world: 'assets/sprites/reni-mundo.png'},
  // explote:    {world: 'assets/sprites/explote-mundo.png', battle: 'assets/sprites/explote-combate.png'},
  // logo:       {world: 'assets/sprites/logo-mundo.png', battle: 'assets/sprites/logo-combate.png'},
  // fantasma:   {world: 'assets/sprites/fantasma-mundo.png', battle: 'assets/sprites/fantasma-combate.png'},
};
const ART_IMG = {};
/* Expresiones de los retratos: say(texto, 'fede:feliz') usa la variante si existe */
const PORTRAIT_MOODS = {};
ART.fede = {world: 'assets/sprites/fede-mundo.png', battle: 'assets/sprites/fede-combate.png', cheer: 'assets/sprites/fede-celebra.png', back: 'assets/sprites/fede-espalda.png', hd: true};
ART.sahi = {world: 'assets/sprites/sahi-mundo.png', hd: true};
ART.lu = {world: 'assets/sprites/lu-mundo.png', hd: true};
ART.agus = {world: 'assets/sprites/agus-mundo.png', hd: true};
ART.lia = {world: 'assets/sprites/lia-mundo.png', hd: true};
ART.sofi = {world: 'assets/sprites/sofi-mundo.png', hd: true};
ART.tato = {world: 'assets/sprites/tato-mundo.png', hd: true};
ART.pimi = {world: 'assets/sprites/pimi-mundo.png', hd: true};
ART.reni = {world: 'assets/sprites/reni-mundo.png', hd: true};
ART.alejo = {world: 'assets/sprites/alejo-mundo.png', hd: true};
ART.giuli = {world: 'assets/sprites/giuli-mundo.png', hd: true};
ART.marga = {world: 'assets/sprites/marga-mundo.png', hd: true};
ART.logo = {world: 'assets/sprites/logo-mundo.png', battle: 'assets/sprites/logo-combate.png', hd: true};
ART.explote = {world: 'assets/sprites/explote-mundo.png', battle: 'assets/sprites/explote-combate.png', hd: true};
ART.fantasma = {world: 'assets/sprites/fantasma-mundo.png', battle: 'assets/sprites/fantasma-combate.png', hd: true};
ART.anual = {world: 'assets/sprites/anual-mundo.png', battle: 'assets/sprites/anual-combate.png', hd: true};
ART.player_m = {world: 'assets/sprites/pasante-chico-mundo.png', back: 'assets/sprites/pasante-chico-espalda.png', hd: true};
ART.player_f = {world: 'assets/sprites/pasante-chica-mundo.png', back: 'assets/sprites/pasante-chica-espalda.png', hd: true};
for (const k of ['fede', 'sahi', 'lu', 'agus', 'lia', 'sofi', 'tato', 'pimi', 'reni', 'alejo', 'giuli', 'marga', 'logo', 'explote', 'fantasma', 'anual']) for (const m of ['neutral', 'feliz', 'sorpresa', 'serio', 'risa']) (PORTRAIT_MOODS[k] = PORTRAIT_MOODS[k] || {})[m] = `assets/portraits/${k}-${m}.png`;
for (const [k, f] of [['player_m', 'pasante-chico'], ['player_f', 'pasante-chica']]) for (const m of ['neutral', 'feliz', 'sorpresa', 'serio', 'risa']) (PORTRAIT_MOODS[k] = PORTRAIT_MOODS[k] || {})[m] = `assets/portraits/${f}-${m}.png`;
function loadArt(){
  for (const key in ART) for (const kind of ['world', 'battle', 'back', 'cheer']){
    const src = ART[key][kind]; if (!src) continue;
    const im = new Image();
    im.onload = () => { ART_IMG[key + '|' + kind] = im; for (const k of [...SPRITE_CACHE.keys()]) if (k.startsWith(key + '|') || k.startsWith('player|')) SPRITE_CACHE.delete(k); };
    im.src = src;
  }
}
/* Las fichas se cargan tal cual: K_WORLD y K_BATTLE pasan píxeles de la ficha a unidades del juego */
// el pasante de espaldas se ve más grande: está más cerca de la cámara, como en los juegos de combate por turnos
const K_WORLD = 1 / 3.3, K_BATTLE = 1 / 3.7, K_BACK = 1 / 2.5;
function artKey(key){ return key === 'player' ? 'player_' + ((S && S.gender) || 'x') : key; }
function artSprite(key, dir, step, big, pose){
  key = artKey(key);
  if (big){
    const kind = dir === 'up' ? 'back' : (pose === 'cheer' && ART_IMG[key + '|cheer']) ? 'cheer' : 'battle';
    const im = ART_IMG[key + '|' + kind]; if (!im) return null;
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0);
    const hd = !!(ART[key] && ART[key].hd);
    c.cx = im.width / 2; c.foot = im.height - 2; c.k = hd ? (kind === 'back' ? K_BACK : K_BATTLE) : .5; c.hdBack = hd && kind === 'back'; return c;
  }
  const im = ART_IMG[key + '|world']; if (!im) return null;
  const rows = (ART[key] && ART[key].rows) || 4, fw = im.width / 3, fh = im.height / rows;
  const order = rows >= 4 ? ['down', 'left', 'right', 'up'] : ['down', 'left', 'up'];
  let r = order.indexOf(dir), flip = false;
  if (r < 0){ r = order.indexOf('left'); flip = true; }
  const c = document.createElement('canvas'); c.width = fw; c.height = fh;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  if (flip){ x.translate(fw, 0); x.scale(-1, 1); }
  x.drawImage(im, step * fw, r * fh, fw, fh, 0, 0, fw, fh);
  if (ART[key] && ART[key].hd){ c.cx = fw / 2; c.foot = fh - 9; c.k = K_WORLD; } else { c.cx = fw / 2; c.foot = fh - 3; }
  return c;
}
