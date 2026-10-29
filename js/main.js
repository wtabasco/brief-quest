/* Construcción de mapas, título, intro y bucle principal */
"use strict";
/* Construcción de los mapas (necesita todo lo anterior cargado) */
buildInterior('office'); buildInterior('upstairs'); buildInterior('barbacoa'); buildOutside(); useMap('office'); loadArt();
/* ================= TÍTULO E INICIO ================= */
/* Menú de inicio: Continuar (la última partida), Cargar partida, Nueva partida. Hay 4 espacios para guardar. */
async function titleScreen(){
  G.mode = 'title'; useMap('outside'); migrateSave();
  const T = $('title'); T.hidden = false; T.classList.remove('picking');
  const menuEl = $('tMenu'), sub = T.querySelector('.tSub');
  const occupied = () => Array.from({length: SLOTS}, (_, i) => i + 1).filter(n => slotLabel(n));
  // si hay sesión de claude.ai, primero se trae la partida guardada en la cuenta (compu o celular)
  if (!titleScreen.pulled){ titleScreen.pulled = true; await cloudAccount(menuEl, sub); menuEl.innerHTML = ''; sub.textContent = 'Buscando tu partida...'; await cloudPull(); }
  while (true){
    menuEl.innerHTML = ''; $('tName').hidden = true; sub.textContent = 'Una aventura de agencia';
    const any = occupied(), opts = (any.length ? ['Continuar', 'Cargar partida', 'Nueva partida'] : ['Nueva partida']).concat(SB_CONF ? ['Mi cuenta'] : []);
    if (CLOUD.email) sub.textContent = 'Partida guardada en tu cuenta';
    const r = await listWidget(menuEl, opts, {cancel: null});
    const pickN = opts[r];
    if (pickN === 'Mi cuenta'){
      if (CLOUD.email){ sub.textContent = `Entraste como ${CLOUD.email}`; menuEl.innerHTML = ''; const c = await listWidget(menuEl, ['Volver', 'Cerrar sesión'], {cancel: 0}); if (c === 1){ await cloudLogout(); sub.textContent = 'Cerraste sesión. Tu partida sigue guardada en tu cuenta.'; await sleepMs(1500); } }
      else { try { localStorage.removeItem('briefquest.sinCuenta'); } catch(e){} await cloudAccount(menuEl, sub); if (await cloudInit(true)) await cloudPull(); }
      continue;
    }
    if (pickN === 'Continuar'){ const n = any.includes(lastSlot()) ? lastSlot() : any[0]; return loadAndStart(n, menuEl); }
    if (pickN === 'Cargar partida'){
      const n = await pickSlot(menuEl, sub, 'Elegí la partida', false); if (!n) continue;
      return loadAndStart(n, menuEl);
    }
    const n = await pickSlot(menuEl, sub, '¿En qué espacio la guardás?', true); if (!n) continue;
    const info = slotLabel(n);
    if (info){
      sub.textContent = `¿Borrar la partida de ${info.d.name} y empezar de nuevo?`;
      const c = await listWidget(menuEl, ['No, volver', 'Sí, empezar de nuevo'], {cancel: 0});
      if (c !== 1) continue;
    }
    return newGame(n, menuEl, sub);
  }
}
/* lista de los 4 espacios; en "Cargar" los vacíos no se pueden elegir. Devuelve el número o null */
async function pickSlot(menuEl, sub, question, allowEmpty){
  sub.textContent = question;
  const items = Array.from({length: SLOTS}, (_, i) => { const info = slotLabel(i + 1); return {label: `${i + 1} · ${info ? info.txt : 'Vacío'}`, off: !info && !allowEmpty}; });
  items.push({label: 'Volver'});
  let at = allowEmpty ? 0 : Math.max(0, items.findIndex(it => !it.off));
  while (true){
    menuEl.classList.add('slots');
    const r = await listWidget(menuEl, items, {cancel: SLOTS, start: at});
    menuEl.classList.remove('slots');
    if (r >= SLOTS) return null;
    if (items[r].off){ at = r; toast('Ese espacio está vacío', 1400); continue; }
    return r + 1;
  }
}
async function loadAndStart(n, menuEl){
  SLOT = n; S = loadSave(n);
  // partidas de antes: el género indefinido ya no está, se elige pasante una vez
  if (S.gender !== 'm' && S.gender !== 'f'){ menuEl.innerHTML = ''; S.gender = await pickPasante(menuEl, 'Ahora el pasante tiene cara. ¿Cuál sos?'); }
  setPlayerLook(); return startWorld(false);
}
async function newGame(n, menuEl, sub){
  menuEl.innerHTML = ''; sub.textContent = 'Una aventura de agencia'; $('tName').hidden = false;
  const inp = $('nameIn'); inp.value = ''; setTimeout(() => { try { inp.focus(); } catch(e){} }, 50);
  const name = await new Promise(res => {
    const ok = () => { const v = inp.value.trim() || 'Trainee'; popH(h); res(v.slice(0, 10)); };
    const h = b => { if (b === 'a') ok(); };
    pushH(h);
    $('nameOk').onclick = ok;
    inp.onkeydown = e => { if (e.key === 'Enter'){ e.preventDefault(); ok(); } };
  });
  inp.blur(); $('tName').hidden = true;
  const g = await pickPasante(menuEl, '¿Con qué pasante jugás?');
  SLOT = n; S = newSave(name); S.gender = g; setPlayerLook(); fullHeal();
  return startWorld(true);
}
/* desde el menú de pausa: guardar y volver al inicio */
async function backToTitle(){
  save(); G.busy = true;
  await fade(true, false, 300);
  closePanel(); hideDlg(); G.mode = 'title'; S = null; G.busy = false;
  await fade(false, false, 300);
  titleScreen();
}
/* Elegir pasante: dos tarjetas con el retrato (el elegido sonríe) */
async function pickPasante(menuEl, question){
  const T = $('title'), lbl = document.createElement('div'); lbl.className = 'tSub'; lbl.textContent = question;
  T.classList.add('picking'); menuEl.before(lbl); menuEl.classList.add('pick2');
  const card = (k, n) => { const P = PORTRAIT_MOODS[k] || {}; return {label: (P.neutral ? `<img class="n" src="${crispNow(P.neutral)}" alt=""><img class="f" src="${crispNow(P.feliz || P.neutral)}" alt="">` : '') + `<span>${n}</span>`}; };
  const gi = await listWidget(menuEl, [card('player_m', 'Chico'), card('player_f', 'Chica')], {cols: 2, cancel: null});
  lbl.remove(); menuEl.classList.remove('pick2'); T.classList.remove('picking'); menuEl.innerHTML = '';
  return ['m', 'f'][gi];
}
async function startWorld(isNew){
  await fade(true, false, 300);
  $('title').hidden = true;
  // partidas viejas: la terraza ya no existe (la Gran Presentación es en la Sala de Reuniones) y Visión tampoco
  if (S.pos.map === 'terrace') S.pos = {x: 32, y: 9, dir: 'left', map: 'upstairs'};
  if (S.skills.includes('vision')){ S.skills = S.skills.filter(id => id !== 'vision'); S.equip = S.equip.map(id => id === 'vision' ? null : id); delete S.pp.vision;
    S.equip = S.equip.filter(Boolean); }
  // el set por tipos (una de cada: creativa, estrategia, técnica y calma), una vez por partida vieja
  if (!S.flags.equipV2){ S.flags.equipV2 = true; balanceEquip(); }
  if (S.quests.ideas){ delete S.quests.ideas; if (S.qbase) delete S.qbase.ideas; }
  useMap(S.pos.map || 'office'); placeDay();
  // partidas viejas: si quedaste parado donde ahora hay un seto o una planta, volvés a la entrada
  if (!WALK.has(tileAt(S.pos.x, S.pos.y))){ S.pos = {x: 15, y: 13, dir: 'up', map: 'outside'}; useMap('outside'); }
  S.quests = S.quests || {}; if (!S.quests.objetivo) qOpen('objetivo', true); if (!S.quests.clientes && (welcomeStep() >= 3 || S.bosses > 0)) qOpen('clientes', true);
  if (!S.flags.alejoV2){ S.flags.alejoV2 = true; if (S.flags.lesAlejo) S.flags.lesAlejo = Math.max(0, S.flags.lesAlejo - 1); }
  // partidas viejas: las habilidades del oficio que ya te tocaban por nivel
  for (const [l, id] of Object.entries(LEARN_AT)) if (S.lvl >= +l && !S.skills.includes(id)){ S.skills.push(id); S.pp[id] = SK[id].pp; }
  teleport(S.pos.x, S.pos.y, S.pos.dir); clockAcc = 0; updatePresence(true); moveMarga(true);
  G.mode = 'world';
  await fade(false, false, 400);
  if (isNew){
    G.busy = true;
    await say(`${weekday()}, ${hhmm(gameMin())}. Tu primer día en la agencia. La jornada es de 9 a 18.`);
    await panelInfo('TU OBJETIVO', objetivoHTML()); closePanel();
    qOpen('objetivo', true);
    await say('Ahí está la puerta. ¡A conocer la agencia!');
    await say('¡Ey, {name}! Soy Sahi, creativo. ¡Bienvenid{o}!', 'sahi:feliz');
    await says(['Primero andá a ver a Sofi, en Asteroide: la oficina de Administración, en la planta alta. Entrás por esa puerta y subís por la escalera del hall. Ella te da la bienvenida a la casa.', 'Yo estoy acá en el patio, en la mesa de ping pong. Cuando quieras, peloteamos, ¿dale?'], 'sahi');
    qOpen('bienvenida', true);
    await say('En START (o la tecla M) están tus Tareas. Mantené B (o X) para correr.');
    hideDlg(); G.busy = false; save();
  }
  G.zone = null; onStep();
}

/* ================= LOOP ================= */
let last = performance.now();
function frame(now){
  const dt = Math.min(50, now - last); last = now; G.t += dt;
  playMusic(wantedMusic());
  updateWorld(dt); tickClock(dt); drawClockHUD(); drawTrackHUD();
  if (G.mode === 'battle' && B) drawBattle();
  else if (G.mode === 'world' && S){ drawWorld(); if (G.mini) drawMini(); }
  else drawTitleBG();
  drawTransition();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function setPlayerLook(){
  const base = {sleeves:'short', backpack:'#fe7a02', shirt:'#92c100', sleeve:'#7aa300', pants:'#004612'};
  const g = (S && S.gender) || 'm';
  // dibujo de respaldo (si no cargó la ficha): mismos colores que el pasante de la ficha
  Object.assign(base, {shirt:'#86b4e8', sleeve:'#6f9fd8', backpack:'#2e2e36'}, g === 'f' ? {pants:'#2a2a30', glasses:'#1e1e24'} : {pants:'#2f4a7a'});
  LOOKS.player = Object.assign(base, g === 'f' ? {hair:'#a07a4a', style:'long', blush:true} : {hair:'#4a3020', style:'short'});
  for (const k of [...SPRITE_CACHE.keys()]) if (k.startsWith('player|')) SPRITE_CACHE.delete(k);
}
function start(data){
  if (data && data.save){ SLOT = data.slot || lastSlot(); S = data.save; setPlayerLook(); startWorld(false); }
  else titleScreen();
}
try { window.claude?.hot?.snapshot?.(() => ({save: S && (save(), S), slot: SLOT})); } catch(e){}
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
