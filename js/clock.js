/* Reloj del juego: jornada de 9 a 18, luz de día/atardecer/noche, lluvia y quién está */
"use strict";
/* ================= EL RELOJ: la jornada, la luz del día y la lluvia =================
   El juego tiene su propio reloj: arranca a las 9:00 y avanza un minuto por segundo mientras caminás
   (se frena en diálogos, menús, desafíos y el ping pong). La jornada es de 9 a 18; después algunos se
   quedan un rato (Lu a veces, Pimi y Sahi de vez en cuando). Fede se queda siempre hasta el cierre.
   A las 20 la oficina cierra: te vas a descansar y arranca el día siguiente (de lunes a viernes).
   La luz pasa de día a atardecer y a noche. Algunos días llueve, y eso cambia el humor del equipo. */
const MIN_MS = 1000;
const DAY_START = 9*60, WORK_END = 18*60, CLOSE = 20*60, LAST_CALL = 19*60 + 30;
const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
let clockAcc = 0;
function clk(){ if (!S.clock) S.clock = {day: 1, min: DAY_START}; return S.clock; }
const gameDay = () => S ? clk().day : 1;
const gameMin = () => S ? clk().min : 11*60;
const weekday = (d = gameDay()) => WEEKDAYS[(d - 1) % 5];
const hhmm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
/* llueve más o menos un día de cada cuatro (el primer día nunca) */
const rainy = (d = gameDay()) => d > 1 && hash(d, 4242) % 100 < 27;

/* quién se queda después de hora: la probabilidad y a qué hora se va (entre 18:30 y 19:50).
   Fede no: él está siempre, hasta que cierra la oficina. */
const LATE = {lu: .5, pimi: .3, sahi: .25};
function leaveAt(id){
  if (id === 'fede') return CLOSE + 1;
  if (id === 'repartidor') return 17*60;
  if (id === 'marga') return 12*60; // Marga trabaja hasta las 12
  const d = gameDay(), p = LATE[id], s = id.charCodeAt(0) * 13 + id.length;
  if (p && hash(d, s) % 100 < p * 100) return WORK_END + 30 + hash(d, s + 99) % 81;
  return WORK_END;
}
/* los problemas de la agencia (los desafíos) no se van nunca: son problemas */
/* el repartidor viene algunos días (siempre el primero) y se va apenas te deja el pedido */
const deliveryDay = (d = gameDay()) => d === 1 || hash(d, 77) % 100 < 55;
function shouldBeHere(n){ if (BOSS_ORDER.includes(n.id) || n.id === 'anual') return true;
  if (n.id === 'repartidor' && (!deliveryDay() || (S && S.flags.repGone === gameDay()))) return false; const m = gameMin(); return m >= DAY_START && m < leaveAt(n.id); }
function onScreen(n){
  if (n.map !== CURMAP.id) return false;
  const {cx, cy} = camera(), [nx, ny] = npcPos(n);
  return nx > cx - TS*2 && nx < cx + VW + TS && ny > cy - TS*3 && ny < cy + VH + TS;
}
/* nadie aparece ni desaparece delante tuyo: se van (o llegan) cuando no los estás mirando */
function updatePresence(force){
  for (const n of NPCS){
    const want = shouldBeHere(n);
    if (want === !n.away) continue;
    if (!force && onScreen(n)) continue;
    n.away = !want; n.mv = null; n.x = n.hx; n.y = n.hy; n.emote = null;
  }
}
/* lo que cambia según el día: con lluvia Sahi se refugia en la barbacoa y Reni graba adentro */
function placeDay(){
  const s = NPCS.find(n => n.id === 'sahi');
  if (rainy()) Object.assign(s, {map: 'barbacoa', x: 12, y: 3, hx: 12, hy: 3, dir: 'down', home: 'down', pingpong: false});
  else Object.assign(s, {map: 'outside', x: 4, y: 8, hx: 4, hy: 8, dir: 'down', home: 'down', pingpong: true});
  placeReni();
}

/* el humor de cada uno cuando llueve: lo dicen la primera vez que hablás con ellos ese día */
const RAIN = {
  fede: {mood: 'mate', f: 'fede', t: 'Día de lluvia: mate, música bajita y las ideas que con sol no salen. Aprovechalo.'},
  agus: {mood: '♥', f: 'agus', t: 'Con lluvia la agencia se siente más casa. Si llegaste mojad{o}, Sofi dejó toallas en la entrada.'},
  lia: {mood: '!', f: 'lia', t: 'Los días de lluvia nadie sale al patio y todos conversan más. Lo tengo medido: suben los mates y las buenas ideas.'},
  montse: {mood: '…', f: 'montse', t: 'Traje paraguas. Me gusta la terraza con lluvia: el ruido del agua ordena la cabeza. Y si a vos la lluvia te baja el ánimo, es válido. Decilo.'},
  sahi: {mood: 'lluvia', f: 'sahi:serio', t: 'Con esta lluvia no hay ping pong... Me vine a la barbacoa a esperar que pare. Hoy ando medio bajón, no te voy a mentir.'},
  lu: {mood: '♪', f: 'lu:feliz', t: '¡La lluvia es el mejor fondo para cantar! Hoy toca algo tranquilo. Bueno, empiezo tranquilo.'},
  pimi: {mood: 'lluvia', f: 'pimi', t: 'Con tormenta desenchufo lo importante. Y me tapo con la campera. Hoy rindo un poco menos; no me juzgues.'},
  reni: {mood: 'lluvia', f: 'reni', t: 'Hoy no hay luz para grabar en el patio. Grabo adentro, con la lluvia de fondo. Queda de película, igual.'},
  sofi: {mood: 'fruta', f: 'sofi', t: 'Puse toallas en la entrada y un trapo en la puerta de la barbacoa. Hay té calentito para todos en la cocina.'},
  tato: {mood: '♪', f: 'tato', t: 'Lluvia y reggae. Para mí es el mejor día de la semana. Todo más lento, como me gusta.'},
  marga: {mood: 'foto', f: 'marga', t: 'Ay, con esta lluvia se me llena todo de barro. ¡Límpiense los pies, chiquilines! Y vos también, mi vida.'},
  alejo: {mood: 'cam', f: 'alejo', t: 'Día nublado, luz de ventana pareja: es como tener un softbox gigante. Hoy grabamos todo adentro.'},
  giuli: {mood: 'lapiz', f: 'giuli', t: 'Con lluvia me pongo a ordenar carpetas. Es mi forma de meditar. Alejo dice que es raro; él ordena playlists.'},
  repartidor: {mood: 'lluvia', f: 'repartidor', t: 'Vengo empapado, pero el paquete está seco. Prioridades.'},
};
const moodOf = n => (rainy() && RAIN[n.id] && RAIN[n.id].mood) || n.mood || '!';
async function rainMood(n){
  const r = RAIN[n.id]; if (!rainy() || !r) return;
  const m = mem(); m.rainSaid = m.rainSaid || {};
  if (!(m.talks[n.id] > 0)) return; // la primera vez se presentan; el comentario del clima queda para la próxima
  if (m.rainSaid[n.id] === gameDay()) return;
  m.rainSaid[n.id] = gameDay(); await say(r.t, r.f);
}

/* avanza el reloj y dispara los momentos del día */
function tickClock(dt){
  if (!S || G.mode !== 'world' || G.busy || H.length || G.mini || G.dayEnding) return;
  const c = clk();
  clockAcc += dt;
  while (clockAcc >= MIN_MS){
    clockAcc -= MIN_MS; c.min++;
    if (c.min === 12*60) margaBye();
    picanteTick(c.min);
    if (c.min === WORK_END) toast('Son las 18: terminó la jornada. Si querés, te podés ir a casa desde el menú.', 3600);
    if (c.min === LAST_CALL) toast('Son las 19:30: a las 20 cierra la oficina.', 3200);
    if (c.min >= CLOSE){ endDay(); break; }
  }
  updatePresence(); moveMarga();
  drawClockHUD();
}
/* después de las 18 te podés ir a casa cuando quieras (desde el menú): arranca el día siguiente */
const canGoHome = () => !!S && gameMin() >= WORK_END && G.mode === 'world' && !G.mini;
async function endDay(early){
  G.dayEnding = true; G.busy = true; G.pendA = false; dirStack.length = 0;
  try {
    await say(early ? 'Terminó tu jornada. Te vas a casa a descansar.' : 'Son las 20. La oficina cierra por hoy. Te vas a casa a descansar.');
    hideDlg(); await fade(true, false, 600);
    const c = clk(); c.day++; c.min = DAY_START; clockAcc = 0; fullHeal();
    useMap('outside'); placeDay(); teleport(15, 13, 'up'); G.zone = null; updatePresence(true); moveMarga(true); drawClockHUD();
    await fade(false, false, 600);
    await say(`${weekday()}, 9:00. ${rainy() ? 'Llueve. El patio está vacío y huele a tierra mojada.' : 'Un día nuevo en la agencia.'} Descansaste: tenés toda la energía.`);
  } finally { hideDlg(); G.busy = false; G.dayEnding = false; save(); }
}
function drawClockHUD(){
  const el = $('clock'); if (!el) return;
  const show = !!S && G.mode === 'world';
  if (el.hidden === show) el.hidden = !show;
  if (!show) return;
  const txt = `${weekday().slice(0, 3)} ${hhmm(gameMin())}`, ic = rainy() ? 'rain' : gameMin() >= 19*60 ? 'moon' : gameMin() >= 16*60 + 30 ? 'dusk' : 'sun';
  if (el.dataset.t !== txt + ic){ el.dataset.t = txt + ic; el.innerHTML = `<i class="ci ${ic}"></i>${txt}`; }
}

/* la luz: un color que multiplica la escena (blanco = sin cambio). Afuera se nota todo; adentro, con las
   luces prendidas, bastante menos; la barbacoa (que es de vidrio) queda en el medio. */
const LIGHT_KEYS = [[0, [255, 255, 255]], [16*60 + 30, [255, 255, 255]], [18*60, [255, 212, 168]], [19*60, [184, 156, 204]], [20*60, [96, 104, 168]], [24*60, [90, 98, 160]]];
function lightColor(mapId){
  const m = gameMin(); let a = LIGHT_KEYS[0], b = LIGHT_KEYS[LIGHT_KEYS.length - 1];
  for (let i = 0; i < LIGHT_KEYS.length - 1; i++) if (m >= LIGHT_KEYS[i][0] && m <= LIGHT_KEYS[i + 1][0]){ a = LIGHT_KEYS[i]; b = LIGHT_KEYS[i + 1]; break; }
  const k = b[0] === a[0] ? 0 : (m - a[0]) / (b[0] - a[0]);
  const out = {outside: 1, terrace: .55, barbacoa: .7}[mapId] ?? .5;
  let c = a[1].map((v, i) => v + (b[1][i] - v) * k).map(v => 255 + (v - 255) * out);
  if (rainy()){ const r = mapId === 'outside' || mapId === 'terrace' ? [190, 198, 212] : [226, 229, 238]; c = c.map((v, i) => v * r[i] / 255); }
  return c.map(Math.round);
}
const nightAmount = () => clamp((gameMin() - 18*60) / 120, 0, 1);
function drawDaylight(mapId){
  if (G.mode !== 'world' || !S) return;
  const c = lightColor(mapId); if (c[0] > 252 && c[1] > 252 && c[2] > 252) return;
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; ctx.fillRect(0, 0, VW*2, VH*2); ctx.restore();
}
/* ventanas de adentro: de noche se oscurecen y con lluvia les corren gotas */
function drawWindowsWeather(M, cx, cy){
  if (G.mode !== 'world' || !S || !M.windows) return;
  const n = nightAmount(), rain = rainy();
  if (!n && !rain) return;
  for (const w of M.windows){
    const X = w.x - cx*2, Y = w.y - cy*2;
    if (X > VW*2 || Y > VH*2 || X + w.w < 0 || Y + w.h < 0) continue;
    if (n){ ctx.fillStyle = `rgba(18,22,52,${(n * .55).toFixed(2)})`; ctx.fillRect(X, Y, w.w, w.h); }
    if (rain){ ctx.fillStyle = 'rgba(214,228,244,.5)';
      for (let i = 0; i < Math.ceil(w.w / 6); i++){ const sx = X + 2 + (hash(i, w.x) % Math.max(1, w.w - 4)), L = w.h + 8, y = (G.t * (.05 + (i % 3) * .02) + hash(i, w.y) % L) % L; ctx.fillRect(sx, Y + Math.min(y, w.h - 3), 1, Math.min(3, w.h - y)); } }
  }
}
/* la lluvia afuera: gotas en diagonal y salpicaduras en el piso */
function drawRain(mapId, cx, cy){
  if (G.mode !== 'world' || !S || !rainy() || (mapId !== 'outside' && mapId !== 'terrace')) return;
  const W = VW*2, H = VH*2, t = G.t, ox = Math.round(cx*2), oy = Math.round(cy*2);
  ctx.fillStyle = 'rgba(214,228,246,.68)';
  for (let i = 0; i < 230; i++){
    const sp = .5 + (i % 5) * .06, span = H + 48, y = (hash(i, 29) % span + t * sp + oy) % span - 24;
    const x = ((hash(i, 17) % (W + 40)) - y * .22 - ox + (W + 40) * 50) % (W + 40) - 20;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 4); ctx.fillRect(Math.round(x) - 1, Math.round(y) + 4, 1, 4);
  }
  for (let i = 0; i < 26; i++){
    const per = 520 + (i % 4) * 90, cyc = Math.floor((t + i * 137) / per), ph = ((t + i * 137) % per) / per;
    const x = hash(i, cyc * 7 + 1) % (MW * 32) - ox, y = hash(i, cyc * 7 + 2) % (MH * 32) - oy;
    if (x < -8 || y < -8 || x > W + 8 || y > H + 8) continue;
    const r = 1 + Math.round(ph * 4); ctx.fillStyle = `rgba(226,236,248,${(.6 * (1 - ph)).toFixed(2)})`;
    ctx.fillRect(x - r, y, r * 2 + 1, 1); ctx.fillRect(x - r + 1, y - 1, r * 2 - 1, 1);
  }
}
/* paraguas para los que están afuera cuando llueve (Montserrat en la terraza, el repartidor) */
function drawUmbrella(c, X, Y, col){
  const cx = X + 15, top = Y - 47;
  c.fillStyle = '#2a2236'; c.fillRect(cx, top + 9, 1, 12); c.fillRect(cx, top - 2, 1, 2);
  for (let j = 0; j < 10; j++){ const hw = Math.round(5 + Math.sqrt(j / 9) * 17); c.fillStyle = j === 9 ? mixC(col, '#2a2236', .35) : j < 3 ? mixC(col, '#ffffff', .22) : col; c.fillRect(cx - hw, top + j, hw * 2 + 1, 1); }
  c.fillStyle = mixC(col, '#2a2236', .45); for (const dx of [-11, 0, 11]) c.fillRect(cx + dx, top + 3, 1, 7);
  c.fillStyle = 'rgba(42,34,54,.25)'; c.fillRect(cx - 21, top + 10, 43, 1);
}

/* Marga: va limpiando la casa, un lugar distinto cada hora (y arranca por otro lado cada día). Se mueve cuando no la ves. */
/* Marga anda casi siempre por la cocina (la barbacoa) y el patio; alguna vez, por el baño. Con lluvia no sale al patio. */
const MARGA_SPOTS = [['barbacoa', 4, 8], ['outside', 11, 11], ['barbacoa', 6, 3], ['outside', 22, 10], ['barbacoa', 13, 7], ['outside', 13, 16], ['office', 4, 10]];
const MARGA_RAIN = [['barbacoa', 4, 8], ['barbacoa', 6, 3], ['barbacoa', 13, 7], ['barbacoa', 2, 6]];
function margaSpot(){ const h = Math.max(0, Math.floor((gameMin() - DAY_START) / 60)), i = gameDay() * 2 + h, sp = MARGA_SPOTS[i % MARGA_SPOTS.length];
  return S && rainy() && sp[0] === 'outside' ? MARGA_RAIN[i % MARGA_RAIN.length] : sp; }
function moveMarga(force){
  const n = NPCS.find(x => x.id === 'marga'); if (!n || n.away) return;
  const [map, x, y] = margaSpot(); if (n.map === map && n.hx === x && n.hy === y) return;
  if (!force && (onScreen(n) || G.busy)) return;
  Object.assign(n, {map, x, y, hx: x, hy: y, mv: null, wander: [x - 1, y - 1, x + 1, y + 1]});
}
/* a las 12 se va, y se la escucha desde cualquier lado de la casa */
function margaBye(){
  const n = NPCS.find(x => x.id === 'marga'); if (!n || n.away) return;
  emote(n, '♥', 2500); toast('Marga: ¡Hasta mañanaaa!!!', 3200); SFX.sel();
}
