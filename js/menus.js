/* Menú de pausa, habilidades, mochila y bitácora */
"use strict";
/* ================= MENÚ DE PAUSA ================= */
async function pauseMenu(){
  G.busy = true; let toTitle = false, goHome = false; const prevClose = CLOSE_BTN; CLOSE_BTN = 'start';
  try {
    while (true){
      // "La agencia" (propósito, roles, cómo trabajamos y el plano de la casa) aparece cuando ya conociste a Sofi
      const casa = !!S.flags.sofiMet, home = canGoHome(), opts = ['Ayuda', 'Tareas','Habilidades','Capacitaciones','Mochila','Bitácora','Estado'].concat(casa ? ['La agencia'] : [], home ? ['Irte a casa'] : [], ['Guardar','Salir al inicio','Cerrar']);
      let r = await choose(opts, {tall: true});
      if (r === 0){ await helpPanel(); closePanel(); continue; } if (r > 0) r--; // "Ayuda" va primero
      // "Irte a casa" (después de las 18): cerrás el día y arranca el siguiente
      if (home){ const hi = opts.indexOf('Irte a casa') - 1; if (r === hi){ const c = await choose(['Sí, me voy a casa', 'Me quedo un rato más']); if (c === 0){ goHome = true; break; } continue; } if (r > hi) r--; }
      if (casa){ if (r === 6){ await agenciaScreen(); closePanel(); continue; } if (r > 6) r--; }
      if (r === 0) await questScreen();
      else if (r === 1) await skillsScreen();
      else if (r === 2) await trainingScreen();
      else if (r === 3) await bagScreen(false);
      else if (r === 4) await logScreen();
      else if (r === 5) await panelInfo('ESTADO', statsHTML());
      else if (r === 6) await saveScreen();
      else if (r === 7){ const c = await choose(['Guardar y salir', 'Seguir jugando']); if (c === 0){ toTitle = true; break; } }
      else break;
      closePanel();
    }
  } finally { CLOSE_BTN = prevClose; closePanel(); hideDlg(); G.busy = false; }
  if (toTitle) await backToTitle();
  if (goHome) await endDay(true);
}
/* Guardar: tu partida va en su espacio; también la podés copiar a otro (y seguís jugando desde ese) */
async function saveScreen(){
  const rows = () => Array.from({length: SLOTS}, (_, i) => { const n = i + 1, info = slotLabel(n); return {label: `Espacio ${n}` + (n === SLOT ? ' ★' : ''), right: info ? `Nv. ${info.d.lvl}` : 'vacío', dim: !info}; });
  const r = await panelList({title: 'GUARDAR', extra: `ESTÁS EN EL ESPACIO ${SLOT}`, rows,
    detail: i => { const info = slotLabel(i + 1); return `<h4>Espacio ${i + 1}${i + 1 === SLOT ? ' (esta partida)' : ''}</h4><div>${info ? info.txt : 'Vacío'}</div><div class="k">${i + 1 === SLOT ? 'A: guardar acá.' : info ? 'A: guardar acá. Se borra la partida que había.' : 'A: guardar acá. Vas a seguir jugando desde este espacio.'}</div>`; },
    hint: 'A: guardar · B: volver'});
  if (r < 0) return;
  const n = r + 1, info = slotLabel(n);
  if (n !== SLOT && info){ closePanel(); const c = await choose([`Sí, reemplazar la de ${info.d.name}`, 'No']); if (c !== 0) return; }
  SLOT = n; save(); toast(`Guardado en el espacio ${n}`);
}
async function skillsScreen(){
  let start = 0;
  while (true){
    const locked = Object.keys(SK).filter(id => !S.skills.includes(id) && SKILL_HOW[id]);
    const r = await panelList({title:'HABILIDADES', extra:`${S.skills.length}/${Object.keys(SK).length} · ACTIVAS ${S.equip.length}/4`, start,
      rows:() => S.skills.map(id => ({label:(S.equip.includes(id) ? '★ ' : '· ') + SK[id].n, right:`${S.pp[id]}/${SK[id].pp}`, dim:!S.equip.includes(id)}))
        .concat(locked.map(id => ({label:'🔒 ' + SK[id].n, right:'—', dim:true}))),
      detail:i => i < S.skills.length ? skillDetail(S.skills[i]) + `<div class="k">${S.equip.includes(S.skills[i]) ? '★ Activa. A para quitarla.' : 'En tu repertorio. A para activarla.'}</div>`
        : `<h4>${SK[locked[i - S.skills.length]].n}</h4><div>${chip(SK[locked[i - S.skills.length]].t)}</div><div class="k">Todavía no la aprendiste.</div><div>${SKILL_HOW[locked[i - S.skills.length]]}</div>`,
      hint:'A: activar o quitar · B: volver'});
    if (r < 0) return;
    if (r >= S.skills.length){ start = r; toast('Todavía no la aprendiste'); continue; }
    start = r; const id = S.skills[r];
    if (S.equip.includes(id)){
      if (S.equip.length > 1) S.equip = S.equip.filter(x => x !== id); else toast('Necesitás al menos una activa');
    } else if (S.equip.length < 4) S.equip.push(id);
    else {
      const c = await choose(S.equip.map(e => 'Cambiar ' + SK[e].n).concat(['Cancelar']));
      if (c >= 0 && c < 4) S.equip[c] = id;
    }
  }
}
function bagRows(){ return ITEM_ORDER.filter(k => S.items[k] > 0).map(k => ({key:k, label:IT[k].n, right:'x' + S.items[k]})); }
async function bagScreen(inBattle){
  while (true){
    const rows = bagRows();
    const r = await panelList({title:'MOCHILA', rows:() => bagRows(), detail:i => { const k = bagRows()[i].key; return `<h4>${IT[k].n}</h4><div>${IT[k].d}</div>`; }});
    if (r < 0) return null;
    const k = rows[r].key, it = IT[k];
    if (it.key){ toast(k === 'agua' ? 'Es para Lu' : 'Esto es para alguien'); continue; }
    if (inBattle){ closePanel(); return k; }
    if (it.battle){ toast('Solo sirve en combate'); continue; }
    const st = stats();
    if (S.hp >= st.max){ toast('Ya tenés la energía al máximo'); continue; }
    S.items[k]--; S.hp = Math.min(st.max, S.hp + it.heal); SFX.heal(); toast(`${it.n}: energía ${S.hp}/${st.max}`);
  }
}
async function logScreen(){
  const keys = Object.keys(EN).concat(BOSS_ORDER, ['anual']);
  const total = keys.length, seen = keys.filter(k => S.log[k]).length;
  await panelList({title:'BITÁCORA', extra:`${seen}/${total} REGISTRADOS`,
    rows:() => keys.map((k, i) => { const d = EN[k] || BOSS[k], l = S.log[k]; return {label: l ? d.n : '???', right: l ? (l.beaten ? 'x' + l.beaten : 'visto') : String(i+1).padStart(2,'0'), dim:!l}; }),
    detail:i => { const k = keys[i], d = EN[k] || BOSS[k], l = S.log[k];
      if (!l) return `<h4>???</h4><div class="k">Todavía no te lo cruzaste.</div>`;
      const need = EN[k] ? LESSON_NEED : 1, ll = EN[k] ? (LESSON_LVL[k] || 0) : 0, les = d.lesson ? (S.skills.includes(d.lesson) ? `Lección: ${SK[d.lesson].n} ✓` : `Lección: ${SK[d.lesson].n}. Se aprende resolviéndolo ${need === 1 ? 'una vez' : need + ' veces'} (${Math.min(l.beaten, need)}/${need})${ll ? `, desde el nivel ${ll}` : ''}.`) : '';
      return `<h4>${d.n}</h4><div>${chip(d.t)}</div><div>${d.d}</div><div class="k">Resuelto ${l.beaten} ${l.beaten === 1 ? 'vez' : 'veces'}</div><div class="k">${les}</div>`; },
    hint:'B: volver'});
}

