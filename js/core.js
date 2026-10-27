/* Utilidades base, lienzo a resolución de pantalla y rutas de retratos */
"use strict";
const PORTRAITS = Object.fromEntries(['fede','sahi','lu','pimi','reni','agus','lia','montse','sofi','tato','alejo','giuli','logo','explote','fantasma'].map(k => [k, `assets/portraits/${k}.png`]));
const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
/* El lienzo se dibuja a la resolución real de la pantalla: todo el juego trabaja en un espacio de 512x384
   y RES lo lleva a píxeles del dispositivo. Así los personajes diseñados conservan el detalle de sus fichas. */
let RES = 2;
function fitCanvas(){
  const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  const w = clamp(Math.round((r.width || 512) * dpr), 512, 2048);
  if (cv.width !== w){ cv.width = w; cv.height = Math.round(w * 3 / 4); }
  RES = cv.width / 512; ctx.imageSmoothingEnabled = false;
}
const VW = 256, VH = 192, TS = 16;
const sleepMs = ms => new Promise(r => setTimeout(r, ms));
const rnd = n => Math.floor(Math.random() * n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
fitCanvas(); try { new ResizeObserver(fitCanvas).observe(cv); } catch(e){ addEventListener('resize', fitCanvas); }
