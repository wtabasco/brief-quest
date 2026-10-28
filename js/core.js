/* Utilidades base, lienzo a resolución de pantalla y rutas de retratos */
"use strict";
const PORTRAITS = Object.fromEntries(['fede','sahi','lu','pimi','reni','agus','lia','montse','sofi','tato','alejo','giuli','marga','logo','explote','fantasma'].map(k => [k, `assets/portraits/${k}.png`]));
const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
/* El lienzo se dibuja a la resolución real de la pantalla: todo el juego trabaja en un espacio de 512x384
   y RES lo lleva a píxeles del dispositivo. Así los personajes diseñados conservan el detalle de sus fichas. */
let RES = 2;
function fitCanvas(){
  const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  const w = clamp(Math.round((r.width || 512) * dpr), 512, 2048);
  // en el celular parado la pantalla es más alta que 4:3: se ve más mundo para arriba y para abajo
  const ratio = (r.width && r.height) ? clamp(r.height / r.width, .75, 1.25) : .75;
  const h = Math.round(w * ratio);
  if (cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; }
  RES = cv.width / 512; VH = Math.round(256 * ratio); ctx.imageSmoothingEnabled = false;
  // el combate se dibuja en 256x192 apoyado abajo; los recuadros de energía siguen a la escena
  // si abajo de la escena entra el tablero (unos 24cqw), los textos y menús del combate van ahí, sin taparla
  const scr = cv.parentElement; if (scr) scr.classList.toggle('tallScr', (VH - 192) / 2.56 >= 24);
}
const VW = 256, TS = 16; let VH = 192;
const sleepMs = ms => new Promise(r => setTimeout(r, ms));
const rnd = n => Math.floor(Math.random() * n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
fitCanvas(); try { new ResizeObserver(fitCanvas).observe(cv); } catch(e){ addEventListener('resize', fitCanvas); }
