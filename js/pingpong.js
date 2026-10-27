/* Peloteo con Sahi: minijuego de ping pong en la mesa del patio */
"use strict";
/* ================= PELOTEO CON SAHI (minijuego de ping pong) =================
   La mesa se ve desde arriba: Sahi saca desde la otra punta y vos devolvés apretando A
   cuando la pelota llega a tu franja verde. Antes de tiempo o tarde, perdés el punto.
   Cada devolución es un poco más rápida y, a partir de la tercera, Sahi puede errar. */
function pingPongGame(){
  return new Promise(res => {
    const pickX = () => -42 + Math.random() * 84;
    const R = {t0: G.t + 700, dur: 1250, dir: 1, hits: 0, x0: pickX(), x1: pickX(), msg: '', done: false, flash: -1e9, start: G.t};
    G.mini = R;
    const finish = (win, msg, quit) => {
      if (R.done) return;
      R.done = true; R.msg = msg; R.win = win;
      setTimeout(() => { popH(h); G.mini = null; res({win, hits: R.hits, quit: !!quit}); }, 1200);
    };
    const h = btn => {
      if (R.done) return;
      if (btn === 'b'){ finish(false, 'FIN DEL PELOTEO', true); return; }
      if (btn !== 'a' || R.dir !== 1 || G.t < R.t0) return;
      const k = (G.t - R.t0) / R.dur;
      if (k < .5) return;
      if (k < .8){ SFX.bump(); finish(false, '¡MUY TEMPRANO!'); return; }
      SFX.hit(); R.hits++; R.flash = G.t;
      R.dir = -1; R.t0 = G.t; R.dur = Math.max(470, R.dur * .88); R.x0 = R.x1; R.x1 = pickX();
    };
    R.tick = () => {
      if (R.done || G.t < R.t0) return;
      const k = (G.t - R.t0) / R.dur;
      if (R.dir === 1 && k > 1.06){ SFX.bump(); finish(false, '¡SE TE PASÓ!'); }
      else if (R.dir === -1 && k >= 1){
        const miss = R.hits >= 6 ? 1 : R.hits >= 3 ? (R.hits - 2) * .22 : 0;
        if (Math.random() < miss){ SFX.win(); R.out = true; finish(true, '¡PUNTO PARA VOS!'); }
        else { SFX.blip(); R.dir = 1; R.t0 = G.t; R.dur = Math.max(470, R.dur * .94); R.x0 = R.x1; R.x1 = pickX(); }
      }
    };
    pushH(h);
  });
}
function drawMini(){
  const R = G.mini; if (!R) return;
  R.tick();
  ctx.setTransform(RES, 0, 0, RES, 0, 0);
  ctx.fillStyle = 'rgba(16,14,24,.62)'; ctx.fillRect(0, 0, 512, VH*2);
  ctx.setTransform(RES, 0, 0, RES, 0, Math.round((VH*2 - 384) / 2) * RES);
  const cx = 256, top = 46, bot = 322, tw = 156, ny = Math.round((top + bot) / 2);
  // mesa azul con líneas blancas
  ctx.fillStyle = '#16294f'; ctx.fillRect(cx - tw/2 - 4, top - 4, tw + 8, bot - top + 12);
  ctx.fillStyle = '#2f62b8'; ctx.fillRect(cx - tw/2, top, tw, bot - top);
  ctx.fillStyle = '#3a6fc6'; for (let y = top + 4; y < bot; y += 6) ctx.fillRect(cx - tw/2 + 3, y, tw - 6, 1);
  ctx.fillStyle = '#f4f6fa'; ctx.fillRect(cx - tw/2, top, tw, 3); ctx.fillRect(cx - tw/2, bot - 3, tw, 3); ctx.fillRect(cx - tw/2, top, 3, bot - top); ctx.fillRect(cx + tw/2 - 3, top, 3, bot - top); ctx.fillRect(cx - 1, top, 2, bot - top);
  // franja para devolver
  const hz0 = bot - 46, hz1 = bot - 6, k0 = (G.t - R.t0) / R.dur, near = R.dir === 1 && k0 > .72 && !R.done;
  ctx.fillStyle = near ? 'rgba(146,193,0,.45)' : 'rgba(146,193,0,.2)'; ctx.fillRect(cx - tw/2 + 3, hz0, tw - 6, hz1 - hz0);
  // red roja
  ctx.fillStyle = '#9e2626'; ctx.fillRect(cx - tw/2 - 8, ny - 4, tw + 16, 9);
  ctx.fillStyle = '#d63c3c'; ctx.fillRect(cx - tw/2 - 8, ny - 4, tw + 16, 6);
  ctx.fillStyle = '#9e2626'; for (let x = cx - tw/2 - 6; x < cx + tw/2 + 6; x += 3) ctx.fillRect(x, ny - 2, 1, 2);
  // pelota: va y viene picando una vez en cada mitad
  const k = Math.max(0, Math.min(1.12, k0)), t = R.dir === 1 ? k : 1 - k;
  const yS = top + 16, yP = bot - 24, by = yS + (yP - yS) * t, bx = cx + R.x0 + (R.x1 - R.x0) * Math.min(1, k);
  const ph = (t * 2) % 1, hgt = R.out ? 0 : Math.round(Math.sin(Math.PI * ph) * 16);
  const outY = R.out ? by - (G.t - R.t0 - R.dur) * .25 : by;
  if (G.t >= R.t0 || R.dir !== 1){ pixEllipse(ctx, bx, outY + 3, 5, 2, 'rgba(10,20,50,.35)'); pixEllipse(ctx, bx, outY - hgt, 4, 4, '#e98a2a'); ctx.fillStyle = '#ffc070'; ctx.fillRect(bx - 2, outY - hgt - 2, 2, 2); }
  // paletas: la de Sahi (roja) arriba, la tuya (negra) abajo
  const sx = cx + (R.dir === -1 ? R.x0 + (R.x1 - R.x0) * Math.min(1, k) : R.x0) * .9, px = cx + (R.dir === 1 ? R.x0 + (R.x1 - R.x0) * Math.min(1, k) : R.x0) * .9;
  pixEllipse(ctx, sx, top + 8, 11, 8, '#5a1a18'); pixEllipse(ctx, sx, top + 8, 9, 6, '#c9302c'); ctx.fillStyle = '#6b4a2e'; ctx.fillRect(sx - 2, top - 6, 4, 8);
  const hit = G.t - R.flash < 160;
  pixEllipse(ctx, px, bot - 12, 12, 9, hit ? '#fbf8ef' : '#111214'); pixEllipse(ctx, px, bot - 12, 10, 7, '#26272c'); ctx.fillStyle = '#6b4a2e'; ctx.fillRect(px - 2, bot - 4, 4, 9);
  // textos
  ctx.textAlign = 'center'; ctx.fillStyle = '#fbf8ef';
  ctx.font = '14px Silkscreen, "Press Start 2P", monospace'; ctx.fillText('PELOTEO CON SAHI', cx, 28);
  ctx.font = '11px Silkscreen, monospace'; ctx.fillText(`DEVOLUCIONES: ${R.hits}`, cx, 352); ctx.fillText(G.t < R.t0 ? 'SAHI SACA...' : 'A: DEVOLVER · B: SALIR', cx, 370);
  if (R.done && R.msg){ ctx.font = '18px Silkscreen, monospace'; ctx.fillStyle = 'rgba(16,14,24,.8)'; ctx.fillRect(cx - 130, ny - 22, 260, 34); ctx.fillStyle = R.win ? '#b6f03a' : '#fbf8ef'; ctx.fillText(R.msg, cx, ny); }
  ctx.textAlign = 'left';
}
