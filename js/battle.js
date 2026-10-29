/* Combate, dificultad, IA de los rivales y su dibujo */
"use strict";
/* los nombres largos no se cortan: la letra se achica un poco hasta que entran */
function fitName(el){ if (el.dataset.t === el.textContent) return; el.dataset.t = el.textContent; el.style.fontSize = ''; for (let f = 3.3; f >= 2.4 && el.scrollWidth > el.clientWidth + 1; f -= .15) el.style.fontSize = f.toFixed(2) + 'cqw'; }
/* ================= COMBATE ================= */
let B = null, PENDING_ALLY = null;
const stg = s => s >= 0 ? (2+s)/2 : 2/(2-s);
function mkFoe(def, lvl, key){
  const [kh, ka, kd, ks] = def.k;
  const max = Math.floor((14 + lvl*4.2) * kh);
  return {isP:false, name:def.n, type:def.t, lvl, max, hp:max, atk:Math.floor((8+lvl*2)*ka), def:Math.floor((8+lvl*2)*kd), spd:Math.floor((8+lvl*2)*ks),
    st:{atk:0,def:0,spd:0,eva:0}, mv:def.mv, def0:def, key};
}
function mkPlayer(){
  const p = {isP:true, name:S.name, get lvl(){ return S.lvl; }, get hp(){ return S.hp; }, set hp(v){ S.hp = v; }, st:{atk:0,def:0,spd:0,eva:0}, sleep:0, flinch:false};
  refreshP(p); return p;
}
function refreshP(p){ const s = stats(); p.max = s.max; p.atk = s.atk; p.def = s.def; p.spd = s.spd; }
function setFill(el, hp, max){ const r = clamp(hp/max, 0, 1); el.style.width = (r*100) + '%'; el.classList.toggle('mid', r <= .5 && r > .2); el.classList.toggle('low', r <= .2); }
function syncBoxes(){
  if (!B) return;
  const f = B.foe, p = B.P;
  $('eName').textContent = f.name; $('eLv').textContent = 'Nv.' + f.lvl; $('eType').textContent = TYPES[f.type].n; $('eType').style.background = TYPES[f.type].c;
  setFill($('eFill'), f.hp, f.max);
  $('pRol').textContent = roleName(); $('pName').textContent = S.name; $('pLv').textContent = 'Nv.' + S.lvl; setFill($('pFill'), p.hp, p.max); fitName($('eName')); fitName($('pName'));
  $('pNum').textContent = `${Math.max(0, p.hp)} / ${p.max}`;
  $('pXp').style.width = (clamp(S.xp / need(S.lvl), 0, 1) * 100) + '%';
}
const bsay = (t, ms=1100) => say(t, null, {auto:ms});
/* cada problema de La Base enseña su lección cuando lo resolvés esta cantidad de veces */
const LESSON_NEED = 3;
/* IA de combate: cada movimiento recibe un puntaje según la situación y se elige con algo de azar.
   Los clientes y Fede piensan más; los problemas salvajes son más impulsivos. */
/* Temperatura de la IA: más baja = elige casi siempre lo mejor. Fede a veces prefiere enseñar antes que pegar. */
const AI_T = {spar: 3.2, final: 2.5, boss: 4, wild: 10};
/* Dificultad de Fede: va siempre por encima de tu nivel y se calibra con todo lo que llevás: nivel, habilidades,
   el empujón con el que entrás (el mate de Fede, los consejos de Agus y Lía) y la mochila (comida, Libreta, Foto,
   Playlist, Pendrive). Antes de cada entrenamiento se simulan unas cuantas peleas con un jugador que usa todo eso
   bien (se prepara antes de pegar, come cuando hace falta) y se ajusta su fuerza para que superarlo sea poco
   probable (cerca de 1 de cada 7 para alguien que juega muy bien), pero nunca imposible. Además Fede tiene
   "Volver a lo simple": si te ve muy cargad{o} de mejoras, te las saca. */
const FEDE_TUNE = {lvl: 2, perBoss: .34, target: .14, sims: 240, hi: 6};
const fedeLevel = () => S.lvl + FEDE_TUNE.lvl + Math.floor(S.bosses * FEDE_TUNE.perBoss);
function simDuel(def, lvl, sMul, n){
  const keepB = B, st = stats();
  let won = 0;
  for (let i = 0; i < n; i++){
    const foe = mkFoe(fedeScaled(def, sMul), lvl, 'fede');
    const P = {isP: true, lvl: S.lvl, hp: st.max, max: st.max, atk: st.atk, def: st.def, spd: st.spd, st: {atk: 0, def: 0, spd: 0, eva: 0}, sleep: 0};
    if (S.buff === 'equipo'){ P.st.atk = 1; P.st.def = 1; P.st.spd = 1; } else if (S.buff === 'fede'){ P.st.atk = 1; P.st.spd = 1; } else if (S.buff === 'duo'){ P.st.atk = 1; P.st.def = 1; } else if (S.buff === 'def') P.st.def = 1; else if (S.buff) P.st.atk = 1;
    const pp = {}; S.equip.forEach(id => pp[id] = SK[id].pp);
    const items = {}; for (const k in S.items) if (IT[k] && !IT[k].key) items[k] = Math.min(3, S.items[k] || 0);
    B = {foe, P, kind: 'spar', turn: 0, prueba: 0}; let res = null;
    const act = (u, t, m) => {
      const fx = (m.fx || '').split(' ').filter(Boolean);
      if ((m.p > 0 || fx.some(f => f.startsWith('foe') || f === 'reset')) && Math.random() > (m.a || 100) / 100 / stg(t.st.eva)) return;
      if (m.p > 0){
        let pw = m.p; if (fx.includes('prueba')){ pw = Math.min(115, 35 + 20 * B.prueba); B.prueba++; }
        const eff = u.isP ? ((CHART[m.t] || {})[t.type] || 1) : 1, crit = Math.random() < (fx.includes('crit') ? .3 : 1/16);
        const dmg = ((2*u.lvl/5 + 2) * pw * u.atk * stg(u.st.atk) / (t.def * stg(t.st.def))) / (u.isP ? 24 : 19) + 2;
        t.hp = Math.max(0, t.hp - Math.max(1, Math.floor(dmg * eff * (crit ? 1.5 : 1) * (.85 + Math.random()*.15)))); if (t.hp <= 0) return;
      }
      for (const f of fx){
        const mm = f.match(/^(self|foe)(Atk|Def|Spd|Eva)([+-]\d)$/);
        if (mm){ const tg = mm[1] === 'self' ? u : t, k = mm[2].toLowerCase(); tg.st[k] = clamp(tg.st[k] + (+mm[3]), -6, 6); }
        const hm = f.match(/^heal(\d+)$/); if (hm) u.hp = Math.min(u.max, u.hp + Math.floor(u.max * (+hm[1]) / 100));
        if (f === 'reset' && t.isP){ t.st = {atk: 0, def: 0, spd: 0, eva: 0}; B.resets = (B.resets || 0) + 1; }
        if (f === 'cleanse') for (const k in u.st) if (u.st[k] < 0) u.st[k] = 0;
      }
    };
    const useItem = k => { items[k]--; const it = IT[k]; if (it.heal) P.hp = Math.min(P.max, P.hp + it.heal);
      if (k === 'foto'){ P.st.atk = clamp(P.st.atk + 1, -6, 6); P.st.def = clamp(P.st.def + 1, -6, 6); }
      if (k === 'libreta') P.st.atk = clamp(P.st.atk + 2, -6, 6); if (k === 'postit') P.st.def = clamp(P.st.def + 1, -6, 6);
      if (k === 'playlist'){ P.st.spd = clamp(P.st.spd + 1, -6, 6); P.st.def = clamp(P.st.def + 1, -6, 6); }
      if (k === 'pendrive') S.equip.forEach(id => pp[id] = SK[id].pp); };
    for (let t = 1; t < 50 && !res; t++){
      B.turn = t;
      const em = pickMove(foe), hpF = P.hp / P.max, av = S.equip.filter(id => pp[id] > 0);
      // jugador que juega bien: come cuando está bajo, se prepara con la Libreta o la Foto, recarga si se queda sin usos
      let item = null;
      if (hpF < .35) item = ['medialunas', 'alfajor', 'mate', 'fruta', 'postit', 'cafe'].find(k => items[k] > 0);
      if (!item && hpF > .5 && P.st.atk < 3) item = ['libreta', 'foto'].find(k => items[k] > 0);
      if (!item && !av.some(id => SK[id].p) && items.pendrive > 0) item = 'pendrive';
      if (item){ useItem(item); act(foe, P, em); if (P.hp <= 0) res = 'lose'; continue; }
      let pick = av.find(id => (SK[id].fx || '').includes('heal') && hpF < .35);
      if (!pick && hpF > .5 && P.st.atk < 4) pick = ['afull', 'medir', 'dinamica'].find(id => av.includes(id));
      if (!pick){ let bv = -1; for (const id of av){ const m = SK[id]; if (!m.p) continue; const pw = (m.fx || '').includes('prueba') ? Math.min(115, 35 + 20 * B.prueba) : m.p; const v = pw * ((CHART[m.t] || {})[foe.type] || 1) * (m.a || 100) / 100 * ((m.fx || '').includes('crit') ? 1.1 : 1); if (v > bv){ bv = v; pick = id; } } }
      if (!pick){ res = 'lose'; break; }
      const pm = SK[pick]; pp[pick]--;
      let pFirst = (pm.pri || 0) !== (em.pri || 0) ? (pm.pri || 0) > (em.pri || 0) : (P.spd * stg(P.st.spd) === foe.spd * stg(foe.st.spd) ? Math.random() < .5 : P.spd * stg(P.st.spd) > foe.spd * stg(foe.st.spd));
      for (const [u, tt, m] of (pFirst ? [[P, foe, pm], [foe, P, em]] : [[foe, P, em], [P, foe, pm]])){ if (u.hp <= 0) continue; act(u, tt, m); if (foe.hp <= 0){ res = 'win'; break; } if (P.hp <= 0){ res = 'lose'; break; } }
    }
    if (res === 'win') won++;
  }
  B = keepB; return won / n;
}
/* fuerza de Fede: s escala su energía y, más suave, la potencia de sus golpes */
function fedeScaled(def, s){ const pw = clamp(.55 + .45 * s, .55, 1.5); return Object.assign({}, def, {k: [1.2 * s].concat(def.k.slice(1)), mv: def.mv.map(m => m.p ? Object.assign({}, m, {p: Math.round(m.p * pw)}) : m)}); }
function calibrateFede(def, lvl){
  let lo = .3, hi = FEDE_TUNE.hi;
  for (let i = 0; i < 8; i++){ const mid = (lo + hi) / 2; if (simDuel(def, lvl, mid, FEDE_TUNE.sims) > FEDE_TUNE.target) lo = mid; else hi = mid; }
  return fedeScaled(def, hi);
}
function pickMove(f){
  const P = B.P, smart = B.kind !== 'wild', hpF = f.hp / f.max, hpP = P.hp / P.max;
  const est = (m, power) => { const A = f.atk * stg(f.st.atk), D = P.def * stg(P.st.def); return ((2*f.lvl/5 + 2) * power * A / D) / 19 + 2; };
  let scored = f.mv.map(m => {
    const fx = (m.fx || '').split(' ').filter(Boolean);
    let s = 0;
    if (m.p > 0){
      let pw = m.p; if (fx.includes('tictac')) pw = 20 + 12 * B.turn; if (fx.includes('multi')) pw *= 2.5;
      const dmg = est(m, pw) * (m.a || 100) / 100;
      s += dmg;
      if (dmg >= P.hp) s += 40;
    }
    for (const x of fx){
      const mm = x.match(/^(self|foe)(Atk|Def|Spd|Eva)([+-]\d)$/);
      if (mm){
        const tgt = mm[1] === 'self' ? f : P, k = mm[2].toLowerCase(), d = +mm[3], cur = tgt.st[k];
        const room = d > 0 ? (cur < 3 ? 1 : cur < 5 ? .3 : 0) : (cur > -3 ? 1 : cur > -5 ? .3 : 0);
        s += room * (hpF > .4 ? 14 : 5) * Math.abs(d) * (B.turn <= 3 ? 1.3 : 1);
      }
      const hm = x.match(/^heal(\d+)$/); if (hm) s += hpF < .4 ? 30 : hpF < .7 ? 8 : 0;
      if (x === 'sleep') s += P.sleep > 0 ? -20 : hpP > .3 ? 22 : 10;
      if (x === 'reset'){ const boosts = Object.values(P.st).reduce((a, v) => a + Math.max(0, v), 0); s += boosts >= 2 ? 25 + boosts*4 : 0; }
      if (x === 'flinch30') s += 3;
    }
    if (B.lastFoeMove === m.n && (m.p || 0) === 0) s *= .3;
    return [m, Math.max(.5, s)];
  });
  // en un entrenamiento, Fede te saca las ayudas como mucho dos veces: después te deja jugar
  if (B.kind === 'spar' && (B.resets || 0) >= 2) scored = scored.filter(([m]) => !(m.fx || '').includes('reset'));
  const T = AI_T[B.kind] || (smart ? 4 : 10);
  const ws = scored.map(([m, s]) => Math.exp(s / T)), tot = ws.reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (let i = 0; i < scored.length; i++){ r -= ws[i]; if (r <= 0){ B.lastFoeMove = scored[i][0].n; return scored[i][0]; } }
  return scored[0][0];
}
const TAUNTS = {
  explote: {half: ['"¡Esto todavía no explota!"', '"¡Más fuegos artificiales! ¡MÁS!"', '"¿Y si sumamos un caballo? ¡Un caballo explota siempre!"'], low: ['"¡Bueno, bueno! ¡Ahora sí está explotando un poco!"', '"¡Ay, se me pone la piel de gallina!"']},
  logo: {half: ['"No sé... no me convence. No sé qué, pero algo no."', '"¿Y si probamos el logo en dorado? ...No, tampoco."', '"Mi sobrino dice que lo hace en una tarde. Mi sobrino tiene doce años."', '"Esto no es lo que pedí. Bueno, sí. Pero no así."'], low: ['"Está bien... Pero que conste en actas que no estoy conforme."', '"Bueno. Puede ser. Pero no me convence del todo, eh."']},
  fantasma: {half: ['"¿No era obvio? Lo puse en el mail. Bueno, en el audio. Bueno, lo pensé."', '"¡Eso lo dejé clarísimo! ¿No? ¿En qué reunión fue?"', '(Visto 14:32)', '"Quiero algo distinto. Pero igual. Ustedes saben."'], low: ['"Bueno... puede que no haya sido del todo clara. Puede."', '"¡Ay, esto me encanta! ¿Era esto lo que pedí? ¡Era esto!"']},
  fede: {half: ['Fede: "Bien. Ahora hacelo más rápido."', 'Fede: "No te relajes ahora, que recién empieza."', 'Fede: "¡Eso! ¡Seguí así!"', 'Fede: "Eso que hiciste, repetilo."', 'Fede: "¡Buena! Ahí está la idea."', 'Fede: "Pará que le doy un sorbo al mate y seguimos."'], low: ['Fede: "¡Así se encara!"', 'Fede: "¡Eso es lo que quería ver!"']},
  final: {half: ['La sala se queda en silencio...', 'Alguien deja de mirar el celular.'], low: ['El cliente sonríe. Se viene el sí.']},
};
const WILD_INTRO = {
  scope: ['"Ya que estamos... ¿agregamos una cosita?"', '"Es un cambio chiquitito, nada más."', '"Solo cambiá el color. Y el logo. Y el texto."'], reunion: ['"¿Tenés cinco minutos? Son dos horas."', '"Esto lo hablamos en una call."', '"Esto podía ser un mail, pero acá estamos."'],
  archivo: ['"¿Cuál es la versión final? Todas."', '"Soy el definitivo. El otro definitivo era mentira."', '"final_v7_ahora_sí_este.pdf"'], wifi: ['"Ya llamaste a soporte técnico. Te dijeron que reinicies."', '"Se te congeló la cara."', '"¿Me escuchás? ¿Y ahora?"'],
  feedback: ['"Una cosita nomás..."', '"Me encanta, pero..."'], bug: ['"En mi compu anda."', '"Error 404: ganas no encontradas."'],
  mail: ['"Asunto: (sin asunto)"', '"Te reenvío el hilo de 47 mensajes."', '"Esta reunión podría haber sido yo."'], deadline: ['"Tic, tac, tic, tac..."', '"¿Era para hoy o para ayer?"', '"¡El brief llegó! Lo necesitan para ayer."'],
};
function fxAnim(kind, who, ms){ B.fx = {kind, who, t0:G.t, ms}; return sleepMs(ms); }
function nameOf(u){ return u.isP ? fullName() : u.name; }
const STATN = {atk:'ataque', def:'defensa', spd:'velocidad', eva:'evasión'};

async function doMove(u, t, m, id){
  if (u.isP){
    if (u.sleep > 0){ u.sleep--; if (u.sleep > 0){ await bsay(`${fullName()} sigue atrapad{o} en la reunión... zzz`); return; } await bsay(`¡${fullName()} por fin salió de la reunión!`); return; }
    if (u.flinch){ u.flinch = false; await bsay(`¡Se cortó la conexión! ${fullName()} no pudo hacer nada.`); return; }
    S.pp[id] = Math.max(0, S.pp[id] - 1);
    { const mm = mem(); mm.skillUse = mm.skillUse || {}; mm.skillUse[id] = (mm.skillUse[id] || 0) + 1; } // para el tablero de Lía
  }
  await bsay(`¡${nameOf(u)} usó ${m.n}!`, 800);
  const fx = (m.fx || '').split(' ').filter(Boolean);
  const targetsFoe = m.p > 0 || fx.some(f => f.startsWith('foe') || f === 'sleep' || f === 'reset');
  if (targetsFoe){
    const acc = (m.a || 100) / 100 / stg(t.st.eva);
    if (Math.random() > acc){ await bsay(pick('b:miss', ['No llegó. Quedó en el aire.', 'Se fue al costado.', 'Ni lo registró.']), 900); return; }
  }
  if (m.p > 0){
    let power = m.p;
    if (fx.includes('prueba')){ power = Math.min(115, 35 + 20 * B.prueba); B.prueba++; }
    if (fx.includes('tictac')) power = 20 + 12 * B.turn;
    const eff = u.isP ? ((CHART[m.t] || {})[t.type] || 1) : 1;
    if (u.isP && B){ if (eff < 1) B.weakHits = (B.weakHits || 0) + 1; if (eff > 1) B.goodHits = (B.goodHits || 0) + 1; }
    const hits = fx.includes('multi') ? 2 + rnd(2) : 1;
    let crits = 0;
    for (let h = 0; h < hits; h++){
      const crit = Math.random() < (fx.includes('crit') ? .3 : 1/16);
      if (crit) crits++;
      const A = u.atk * stg(u.st.atk), D = t.def * stg(t.st.def);
      let dmg = ((2*u.lvl/5 + 2) * power * A / D) / (u.isP ? 24 : 19) + 2;
      dmg = Math.max(1, Math.floor(dmg * eff * (crit ? 1.5 : 1) * (.85 + Math.random()*.15)));
      if (h === 0) await fxAnim('lunge', u.isP ? 'p' : u.ally ? 'a' : 'e', 220); SFX.hit(); await fxAnim('hit', t.isP ? 'p' : 'e', 380);
      t.hp = Math.max(0, t.hp - dmg); syncBoxes(); await sleepMs(450);
      if (t.hp <= 0) break;
    }
    if (hits > 1) await bsay(`¡Pegó ${hits} veces!`, 800);
    if (crits) await bsay(pick('b:crit', ['¡En el punto justo!', '¡Justo donde dolía!']), 800);
    if (eff > 1) await bsay(pick('b:eff', ['¡Le pegó de lleno! Ese tipo es su punto débil.', '¡Justo lo que necesitaba! Le pega fuerte.', '¡Ese tipo lo destraba!']), 900);
    if (eff < 1) await bsay(pick('b:weak', ['Le hace poco: no es el tipo que lo destraba.', 'Rebotó. Probá con otro tipo.']), 900);
    if (t.hp <= 0) return;
    if (!t.isP && B.kind !== 'wild'){
      const tt = TAUNTS[t.key], r = t.hp / t.max;
      if (tt && r < .25 && !B.tLow){ B.tLow = B.tHalf = true; await bsay(tt.low[rnd(tt.low.length)], 1300); }
      else if (tt && r < .55 && !B.tHalf){ B.tHalf = true; await bsay(tt.half[rnd(tt.half.length)], 1300); }
    }
  }
  for (const f of fx){
    const mm = f.match(/^(self|foe)(Atk|Def|Spd|Eva)([+-]\d)$/);
    if (mm){
      await fxAnim('buff', (mm[1] === 'self' ? u : t).isP ? 'p' : 'e', 500);
      const tg = mm[1] === 'self' ? u : t, k = mm[2].toLowerCase(), d = +mm[3], before = tg.st[k];
      tg.st[k] = clamp(before + d, -6, 6);
      const who = `${k === 'atk' ? 'El' : 'La'} ${STATN[k]} de ${tg.isP ? fullName() : tg.name}`;
      if (tg.st[k] === before) await bsay(`${who} no puede ${d > 0 ? 'subir' : 'bajar'} más.`);
      else { if (d > 0) SFX.heal(); await bsay(`${who} ${d > 0 ? (d > 1 ? 'subió mucho' : 'subió') : 'bajó'}.`, 900); }
      continue;
    }
    const hm = f.match(/^heal(\d+)$/);
    if (hm){ const v = Math.floor(u.max * (+hm[1]) / 100), before = u.hp; u.hp = Math.min(u.max, u.hp + v); syncBoxes(); SFX.heal(); await sleepMs(400);
      await bsay(u.hp === before ? `${nameOf(u)} ya tenía la energía al máximo.` : `${nameOf(u)} recuperó energía.`, 900); continue; }
    if (f === 'sleep' && t.isP){ if (t.sleep > 0) await bsay(`${fullName()} ya está en una reunión.`); else { t.sleep = 2 + rnd(2); await bsay(`¡${fullName()} quedó atrapad{o} en una reunión eterna!`); } }
    if (f === 'flinch30' && t.isP && Math.random() < .3) t.flinch = true;
    if (f === 'cleanse'){ const bad = Object.keys(u.st).filter(k => u.st[k] < 0); bad.forEach(k => u.st[k] = 0); await bsay(bad.length ? `${nameOf(u)} ordenó todo: se le fueron los efectos negativos.` : `${nameOf(u)} ordenó todo. Ya estaba en orden.`, 1000); }
    if (f === 'reset' && t.isP){ B.resets = (B.resets || 0) + 1; const had = Object.values(t.st).some(v => v > 0); t.st = {atk:0,def:0,spd:0,eva:0}; if (had) await bsay(B.kind === 'spar' ? 'Fede: "Muy lindo con ayudas. Ahora mostrame sin." Tus mejoras volvieron a cero.' : '¡Todo lo que habías avanzado se fue a la papelera!', 1500); }
  }
}
async function actionMenu(){
  $('dlg').hidden = false; $('dlg').classList.add('battle'); $('dlgPic').hidden = true; $('dlgName').hidden = true; $('dlgMore').hidden = true;
  $('dlgText').textContent = `¿Qué hace ${S.name}?`;
  const g = $('grid'); g.className = 'ui box grid act'; g.hidden = false;
  const r = await listWidget(g, [{label:'ACCIÓN',style:'--c:#d9772a'},{label:'MOCHILA',style:'--c:#5f8a2a'},{label:'ESTADO',style:'--c:#6f66c4'},{label:'HUIR',style:'--c:#7d4c7b'}], {cols:2, cancel:null, start:B.lastAct || 0});
  g.hidden = true; B.lastAct = r; return r;
}
async function fightMenu(){
  const g = $('grid'); g.className = 'ui box grid fight'; g.hidden = false; $('dlg').hidden = true;
  const eq = S.equip.slice(); while (eq.length < 4) eq.push(null);
  const items = eq.map(id => id ? {label:`<span class="nm">${SK[id].n}</span><span class="pp">${S.pp[id]}/${SK[id].pp}</span>`, off:S.pp[id] <= 0, style:`--c:${TYPES[SK[id].t].c}`} : {label:'—', off:true, style:'--c:#4a4566'});
  const info = document.createElement('div'); info.className = 'info';
  const r = await listWidget(g, items, {cols:2, cancel:-1, start:B.lastSkill || 0, render:sel => {
    const id = eq[sel];
    info.innerHTML = id ? `<span>${chip(SK[id].t)}</span><span>PODER ${SK[id].p || '—'}</span><span>PRECISIÓN ${SK[id].a}</span>` : '<span>Vacío</span>';
    g.appendChild(info);
  }});
  g.hidden = true;
  if (r < 0) return null;
  const id = eq[r];
  if (!id){ return null; }
  if (S.pp[id] <= 0){ await bsay('¡No te quedan usos de esa habilidad!', 1000); return null; }
  B.lastSkill = r; return id;
}
async function runBattle(foe, kind){
  B = {foe, P:mkPlayer(), kind, turn:0, prueba:0, fx:null, enter:G.t, faint:null, lastAct:0, lastSkill:0, used:{}, ally: PENDING_ALLY ? mkAlly(PENDING_ALLY) : null};
  PENDING_ALLY = null; S.flags.allyWin = false;
  G.mode = 'battle';
  syncBoxes();
  await fade(false, false, 300);
  B.enter = G.t;
  await sleepMs(500);
  $('ebox').hidden = false;
  if (kind === 'wild'){ await bsay(pick('b:wild', [`¡Saltó un ${foe.name} de las pilas de pendientes!`, `¡Entre los pendientes apareció un ${foe.name}!`, `¡Un ${foe.name} te frena el paso!`]), 1100); const wi = WILD_INTRO[foe.key]; if (wi && Math.random() < .55) await bsay(`${foe.name}: ${wi[rnd(wi.length)]}`, 1200); }
  else if (kind === 'spar') await bsay('¡Entrenamiento con Fede!', 1200);
  else await bsay(`¡${foe.name} quiere una reunión!`, 1200);
  $('pbox').hidden = false;
  await bsay(`¡Vamos, ${fullName()}!`, 700);
  if (B.ally) await bsay('¡Fede está con vos! Cada turno te da una mano.', 1100);
  if (S.buff === 'fede'){ B.P.st.atk = 1; B.P.st.spd = 1; await bsay('El mate con Fede te dejó a full: tu ataque y tu velocidad subieron.'); S.buff = null; }
  else if (S.buff === 'equipo'){ B.P.st.atk = 1; B.P.st.def = 1; B.P.st.spd = 1; await bsay('Te acompañan Fede, Sahi, Lu, Alejo y Giuli: tu ataque, tu defensa y tu velocidad subieron.'); S.buff = null; }
  else if (S.buff === 'duo'){ B.P.st.atk = 1; B.P.st.def = 1; await bsay('El plan de Agus y el empuje de Lía te acompañan: tu ataque y tu defensa subieron.'); S.buff = null; }
  else if (S.buff){
    const k = S.buff === 'def' ? 'def' : 'atk'; B.P.st[k] = 1; B.advice = S.buff === 'def' ? 'agus' : 'lia';
    await bsay(S.buff === 'def' ? 'El consejo de Agus te acompaña: tu defensa subió.' : 'El consejo de Lía te acompaña: tu ataque subió.');
    S.buff = null;
  }
  while (true){
    B.turn++;
    let act = null;
    while (!act){
      const a = await actionMenu();
      if (a === 0){ const id = await fightMenu(); if (id) act = {type:'skill', id}; }
      else if (a === 1){ $('dlg').hidden = true; const k = await bagScreen(true); closePanel(); if (k) act = {type:'item', id:k}; }
      else if (a === 2){ $('dlg').hidden = true; await panelInfo('ESTADO', statsHTML() + `<div class="k">Etapas en combate · ataque ${B.P.st.atk}, defensa ${B.P.st.def}, velocidad ${B.P.st.spd}</div>`); closePanel(); }
      else if (a === 3){
        if (kind === 'wild') act = {type:'run'};
        else await bsay(kind === 'spar' ? 'Fede: "¡Ni ahí te vas! Terminemos."' : '¡No te podés ir de esta reunión!');
      }
    }
    const em = pickMove(foe);
    if (act.type === 'run'){
      if (Math.random() < .42 + (B.P.spd - foe.spd) / 80 + B.turn * .08 - Math.max(0, foe.lvl - S.lvl) * .04){ await bsay('Te escapaste por la puerta de emergencia.'); return 'run'; }
      await bsay('¡No pudiste escaparte!');
      await doMove(foe, B.P, em); if (B.P.hp <= 0) return 'lose'; continue;
    }
    if (act.type === 'item'){
      const it = IT[act.id]; S.items[act.id]--;
      await bsay(`${fullName()} usó ${it.n}.`, 800);
      if (it.heal){ B.P.hp = Math.min(B.P.max, B.P.hp + it.heal); syncBoxes(); SFX.heal(); await sleepMs(500); await bsay('Recuperaste energía.', 800); }
      if (act.id === 'foto'){ B.P.st.atk = clamp(B.P.st.atk+1,-6,6); B.P.st.def = clamp(B.P.st.def+1,-6,6); SFX.heal(); await bsay('¡Qué buena foto! Tu ataque y tu defensa subieron.'); }
      if (act.id === 'libreta'){ B.P.st.atk = clamp(B.P.st.atk+2,-6,6); SFX.heal(); await bsay('Leíste la libreta de Fede. ¡Tu ataque subió mucho!'); }
      if (act.id === 'pendrive'){ S.skills.forEach(id => S.pp[id] = SK[id].pp); SFX.heal(); await bsay('El pendrive de Pimi recargó todas tus habilidades.'); }
      if (act.id === 'postit'){ B.P.st.def = clamp(B.P.st.def+1,-6,6); await bsay('Leíste el post-it de Agus: "Vos podés". Tu defensa subió.'); }
      if (act.id === 'playlist'){ B.P.st.spd = clamp(B.P.st.spd+1,-6,6); B.P.st.def = clamp(B.P.st.def+1,-6,6); SFX.sing(); await bsay('Sonó la playlist de Lu. Tu velocidad y tu defensa subieron.'); }
      await doMove(foe, B.P, em); if (B.P.hp <= 0) return 'lose'; continue;
    }
    const pm = SK[act.id]; B.used[pm.t] = 1;
    let pFirst;
    if ((pm.pri || 0) !== (em.pri || 0)) pFirst = (pm.pri || 0) > (em.pri || 0);
    else { const ps = B.P.spd * stg(B.P.st.spd), es = foe.spd * stg(foe.st.spd); pFirst = ps === es ? Math.random() < .5 : ps > es; }
    const order = pFirst ? [[B.P, foe, pm, act.id], [foe, B.P, em]] : [[foe, B.P, em], [B.P, foe, pm, act.id]];
    for (const [u, t, m, id] of order){
      if (u.hp <= 0) continue;
      await doMove(u, t, m, id);
      if (foe.hp <= 0) return allyWin();
      if (B.P.hp <= 0) return 'lose';
    }
    await allyAct(); if (foe.hp <= 0) return allyWin();
  }
}
/* Fede como compañero (con el tercer cliente, la Clienta Explosiva): no recibe golpes; cada turno pega, te alienta o te ceba un mate */
function mkAlly(id){ const st = stats(); return {isP: false, ally: true, name: 'Fede', lvl: S.lvl, atk: Math.floor(st.atk * .9), def: st.def, spd: st.spd, st: {atk: 0, def: 0, spd: 0, eva: 0}, healed: 0}; }
const allyWin = () => { if (B.ally) S.flags.allyWin = true; return 'win'; };
async function allyAct(){
  const a = B.ally, P = B.P, f = B.foe; if (!a || f.hp <= 0 || P.hp <= 0) return;
  if (P.hp / P.max < .38 && a.healed < 2){ a.healed++;
    await bsay('¡Fede te ceba un mate!', 900); const v = Math.floor(P.max * .3); P.hp = Math.min(P.max, P.hp + v); syncBoxes(); SFX.heal(); await fxAnim('buff', 'p', 500); await bsay('Recuperaste energía.', 800); return; }
  const r = Math.random();
  if (r < .22 && P.st.atk < 2){ await bsay('Fede: "¡Vos podés! Mostrale lo que aprendiste."', 1100); await fxAnim('buff', 'p', 500); P.st.atk = clamp(P.st.atk + 1, -6, 6); await bsay(`El ataque de ${fullName()} subió.`, 900); return; }
  if (r < .38 && f.st.def > -2) return doMove(a, f, {n: 'Feedback honesto', p: 0, fx: 'foeDef-1'});
  return doMove(a, f, {n: pick('fede:allymv', ['Acción directa', 'Liderar con el ejemplo', 'Volver a lo simple']), p: 55, a: 100});
}
async function endBattleUI(){
  await fade(true);
  $('ebox').hidden = true; $('pbox').hidden = true; $('grid').hidden = true; hideDlg(); closePanel();
  B = null; G.mode = 'world';
  await fade(false);
}
async function gainXP(n, msg){
  await msg(`${fullName()} sumó ${n} puntos de experiencia.`);
  S.xp += n; syncBoxes();
  while (S.xp >= need(S.lvl)){
    S.xp -= need(S.lvl);
    const before = fullName(), old = stats(); S.lvl++; const nw = stats();
    S.hp = Math.min(nw.max, S.hp + (nw.max - old.max));
    if (B) refreshP(B.P);
    syncBoxes(); SFX.up();
    await msg(`¡${before} subió al nivel ${S.lvl}!`);
    // ascensos: el rol cambia apenas llegás al nivel; la celebración es después, con quien corresponde
    if (S.lvl === 15){ SFX.learn(); await msg('¡Quedaste fij{o} en la agencia! Desde hoy sos Social Manager.'); qOpen('fijo'); }
    if (S.lvl === PROJECT_LVL){ SFX.learn(); await msg('¡Ascenso! Desde hoy sos Project Leader.'); qOpen('senior'); qOpen('anual', true); await msg('Y algo más: se abrió la Sala del Directorio, en la planta baja. Te espera el Cliente del Año.'); }
    if (LEARN_AT[S.lvl]) await learn(LEARN_AT[S.lvl], msg);
    await levelUnlocks(S.lvl, msg);
  }
  syncBoxes();
}
async function learn(id, msg){
  if (S.skills.includes(id)) return false;
  S.skills.push(id); S.pp[id] = SK[id].pp; SFX.learn();
  await msg(`¡${fullName()} aprendió ${SK[id].n}!`);
  const r = equipNew(id);
  if (r && r.out) await msg(r.swap ? `${SK[id].n} entra a tu set: es tu primera habilidad ${TYPES[SK[id].t].n.toLowerCase()} activa. ${SK[r.out].n} queda en tu repertorio.` : `${SK[id].n} reemplaza a ${SK[r.out].n} en tu set: es del mismo tipo (${TYPES[SK[id].t].n.toLowerCase()}) y más fuerte. ${SK[r.out].n} queda en tu repertorio.`);
  else if (!r) await msg(pick('learn:repo', [`${SK[id].n} queda en tu repertorio: tu set ya tiene algo más fuerte de ese tipo.`, `${SK[id].n} va al repertorio. Si la querés usar, activala en Habilidades.`, `${SK[id].n} queda guardada en tu repertorio.`]));
  return true;
}
/* El set de 4 habilidades se arma por tipo: una creativa, una de estrategia, una técnica y una de calma, así siempre
   hay algo que le pegue fuerte a cada problema (burocracia, caos, bugs y presión). Lo que aprendés reemplaza a la
   activa de su mismo tipo si es mejor; si todavía no tenías de ese tipo, ocupa un lugar libre o el de una de apoyo. */
const SLOT_TYPES = ['CRE', 'EST', 'TEC', 'CAL'];
function skillScore(id){
  const k = SK[id]; if (!k || !k.p) return 0;
  const fx = k.fx || '';
  return k.p * (k.a || 100) / 100 + (fx.includes('prueba') ? 25 : 0) + (fx.includes('foeAtk-1') || fx.includes('crit') ? 8 : 0) + (k.pri ? 4 : 0) + (/self(Atk|Def|Spd)/.test(fx) ? 4 : 0);
}
const isMain = id => SLOT_TYPES.includes(SK[id].t) && skillScore(id) > 0;
function equipNew(id){
  if (S.equip.includes(id)) return {};
  if (!isMain(id)){ if (S.equip.length < 4){ S.equip.push(id); return {}; } return null; }
  const same = S.equip.filter(e => isMain(e) && SK[e].t === SK[id].t);
  if (same.length){
    const worst = same.sort((a, b) => skillScore(a) - skillScore(b))[0];
    if (skillScore(id) <= skillScore(worst)) return null;
    S.equip[S.equip.indexOf(worst)] = id; return {out: worst};
  }
  if (S.equip.length < 4){ S.equip.push(id); return {}; }
  // sin activa de ese tipo: ocupa el lugar de una de apoyo o de un tipo repetido
  const counts = {}; S.equip.forEach(e => { if (isMain(e)) counts[SK[e].t] = (counts[SK[e].t] || 0) + 1; });
  const cand = S.equip.filter(e => !isMain(e) || counts[SK[e].t] > 1).sort((a, b) => skillScore(a) - skillScore(b))[0];
  if (!cand) return null;
  S.equip[S.equip.indexOf(cand)] = id; return {out: cand, swap: true};
}
/* arma el set ideal desde cero (partidas viejas): la mejor de cada tipo y, si sobra lugar, las mejores de apoyo */
function balanceEquip(){
  const eq = [];
  for (const t of SLOT_TYPES){ const best = S.skills.filter(id => isMain(id) && SK[id].t === t).sort((a, b) => skillScore(b) - skillScore(a))[0]; if (best) eq.push(best); }
  for (const id of S.skills.slice().sort((a, b) => skillScore(b) - skillScore(a))) if (eq.length < 4 && !eq.includes(id) && (SK[id].t !== 'VIS')) eq.push(id);
  if (eq.length) S.equip = eq;
}
const sayN = t => say(t);
async function battleFlow(foe, kind, key){
  logSeen(key);
  const res = await runBattle(foe, kind);
  logEvent(res, {foe: key, name: foe.name, kind});
  { const m = mem(); m.battles = (m.battles || 0) + 1;
    if (kind === 'spar') m.spars = (m.spars || 0) + 1;
    if (res === 'win' && kind === 'wild') m.wildWins = (m.wildWins || 0) + 1;
    if (res === 'win' && B && S.pdp && !S.pdp.done && B.used && B.used[S.pdp.t]) m.pdpWins = (m.pdpWins || 0) + 1;
    // lo que mide Lía: turnos por victoria y sus objetivos
    if (res === 'win' && B){ m.winsT = (m.winsT || 0) + 1; m.winTurns = (m.winTurns || 0) + B.turn; m.bestTurns = Math.min(m.bestTurns ?? 99, B.turn); if (kpiOk()) m.kpiWins = (m.kpiWins || 0) + 1; }
    if (res === 'win' && B && B.advice){ if (B.advice === S.flags.path) m.adviceWins = (m.adviceWins || 0) + 1; else m.otherAdviceWins = (m.otherAdviceWins || 0) + 1; } }
  if (res === 'win'){
    if (kind === 'spar' && ART_IMG['fede|cheer']){ B.cheer = G.t; SFX.win(); await sleepMs(500); }
    else { SFX.faint(); B.faint = G.t; await sleepMs(650); }
    await bsay(kind === 'wild' ? `¡${foe.name} quedó resuelto!` : kind === 'spar' ? '¡Entrenamiento completo! Fede quedó conforme.' : `¡${capFirst(artName(foe.name))} quedó conforme!`, 1100);
    SFX.win();
    S.log[key].beaten++;
    const d = EN[key] || BOSS[key];
    // después de la Gran Presentación ya sos de la casa: cada problema te enseña un poco más (el camino al 30 no se hace eterno)
    // los problemas de La Base rinden un poco más (para que el camino entre clientes no se haga largo) y más todavía después de la Gran Presentación
    await gainXP(Math.floor(d.xp * foe.lvl / 5 * (kind === 'wild' ? (S.flags.done ? 2 : 1.7) : 1)), bsay);
    if (kind === 'wild') await wayQuote(key, bsay);
    if (kind === 'wild') await hitoCheck(bsay);
    if (d.lesson && !S.skills.includes(d.lesson)){
      const need = kind === 'wild' ? LESSON_NEED : 1;
      const ll = kind === 'wild' ? (LESSON_LVL[key] || 0) : 0;
      if (S.log[key].beaten >= need && S.lvl < ll) await bsay(`Ya entendiste a ${foe.name}. Su lección (${SK[d.lesson].n}) la aprendés cuando llegues al nivel ${ll} y lo vuelvas a resolver.`, 1800);
      else if (S.log[key].beaten >= need){ await bsay(`Resolver ${foe.name.startsWith('El ') ? 'al ' + foe.name.slice(3) : 'a ' + artName(foe.name)} te dejó una lección...`, 1200); await learn(d.lesson, bsay); }
      else await bsay(`Ya le estás agarrando la mano a ${foe.name}. Resolvelo ${need - S.log[key].beaten === 1 ? 'una vez más' : (need - S.log[key].beaten) + ' veces más'} y aprendés ${SK[d.lesson].n}.`, 1600);
    }
    if (kind === 'wild' && Math.random() < .1){ const k = Math.random() < .7 ? 'cafe' : 'alfajor'; S.items[k] = (S.items[k]||0) + 1; await bsay(`Encontraste un ${IT[k].n} entre los pendientes.`); }
  }
  if (!S.reniGift){ S.reniGift = true; S.reni = (S.reni + 1) % RENI_SPOTS.length; placeReni(); }
  S.cool = 3;
  if (res === 'lose'){
    await bsay(kind === 'spar' ? 'Fin del entrenamiento. Te quedaste sin energía, pero no sin aprendizaje.' : `${fullName()} se quedó sin energía...`, 1300);
    // aprender del error suma, pero nunca más que resolver un problema de tu nivel (que no convenga perder a propósito)
    const xp = Math.max(4, Math.min(Math.floor((EN[key] || BOSS[key]).xp * foe.lvl * .4 / 5), 8 * S.lvl));
    if (kind === 'spar'){
      await endBattleUI();
      fullHeal();
      await says(FEDE.sparLose[rnd(FEDE.sparLose.length)], 'fede');
      await gainXP(xp, sayN);
      return 'lose';
    }
    await fade(true, false, 500);
    $('ebox').hidden = true; $('pbox').hidden = true; $('grid').hidden = true; hideDlg(); closePanel(); B = null; G.mode = 'world';
    useMap('office'); teleport(5, 21, 'up'); fullHeal();
    await fade(false, false, 500);
    // de noche (o si ya se fueron) no hay quien te rescate: te recuperás sol{o} en Bienestar
    const here = id => { const n = NPCS.find(x => x.id === id); return n && !n.away; };
    if (here('fede')){
      await say(pick('fede:rescue', ['Ey, {name}. ¿Estás bien? Bien ahí que lo intentaste.', '¡Arriba! Te traje hasta acá. Lo intentaste, y eso cuenta.', 'Uf, ese fue fuerte. Pero ya sabés cómo ataca.', 'Arriba, {name}. Quedarse sin energía es parte del oficio. Volver, también.', 'Tranqui. Te traje hasta acá. Tomá agua y pensá qué probarías distinto.', 'Ey. Bien ahí que fuiste. Lo que hoy no salió, mañana sale.']), 'fede');
      await say(pick('fede:rescue2', [`Trabarte con ${artName(foe.name)} también es parte de aprender. Pensá qué cambiarías y volvé a intentarlo.`, 'La próxima probá otro tipo de habilidad. Cambia todo.', 'Respirá, recargá y volvé. Así se aprende acá.', 'Mirá de qué tipo es y elegí lo que más le pega. Probar, aprender, repetir.', 'Volvé cuando quieras. La versión dos siempre sale mejor.']), 'fede');
    } else await say('Fede ya se fue por hoy, así que fuiste a recuperarte a Bienestar por tu cuenta. Trabarse también es parte de aprender.');
    await say(`Aprendiste del error: +${xp} de experiencia.`);
    await gainXP(xp, sayN);
    if (here('lu')) await say(pick('lu:rescue', ['¡Listo, enchufad{o} y cargad{o}! ¡A seguir!', '¡Ya está! Tomá agua antes de salir, que te veo como pasa de uva.', '¡Recuperad{o}! Y tranqui, que a todos nos pasa. A mí me pasa los lunes.', '¡Recargad{o}! Hasta las plantas se marchitan un rato. Después vuelven.', '¡Listo! Ahora salí con la frente en alto y la botella llena.']), 'lu:feliz');
    await afterBattleHints(foe, kind, key, res);
    save(); return 'lose';
  }
  await endBattleUI();
  await afterBattleHints(foe, kind, key, res);
  save(); return res;
}
/* las pistas, después de todo lo demás: la de tipo en La Base y la del nivel con los clientes (después de dos intentos) */
async function afterBattleHints(foe, kind, key, res){
  if (kind === 'wild') await typeHint(foe, res);
  if (res === 'lose' && REC_LVL[key]){ const m = mem(); m.bossLost = m.bossLost || {}; m.bossLost[key] = (m.bossLost[key] || 0) + 1;
    if (m.bossLost[key] >= REC_AFTER) await bossAdvice(key); }
}
const WILD_HP = .6;
async function wildEncounter(){
  const p = S.bosses;
  const pool = [['scope','reunion','archivo','wifi'], ['scope','reunion','archivo','wifi','feedback','bug','mail'], Object.keys(EN), Object.keys(EN)][Math.min(p,3)];
  const base = [3, 7, 11, 15][Math.min(p,3)];
  // después del tercer cliente los problemas crecen con vos (si no, a partir del nivel 25 dejan de enseñarte)
  const key = pool[rnd(pool.length)], lvl = clamp(S.lvl - 1 + rnd(3), base, p >= 3 ? Math.max(base + 9, S.lvl + 1) : base + 9);
  SFX.enc();
  for (let i=0;i<2;i++){ await fade(true, true, 80); await fade(false, true, 80); }
  await transition(700); $('fade').style.transition = 'none'; await fade(true, false, 20); $('fade').style.transition = ''; G.trans = null;
  // los problemas comunes tienen menos energía que los clientes: así un desafío dura 4 o 5 turnos
  const foe = mkFoe(EN[key], lvl, key); foe.max = foe.hp = Math.max(10, Math.round(foe.max * WILD_HP));
  await battleFlow(foe, 'wild', key);
}
async function bossBattle(key, kind='boss'){
  let d = BOSS[key];
  const lvl = ({fede: fedeLevel(), fantasma: CLIENT_LVL.fantasma, logo: CLIENT_LVL.logo, explote: CLIENT_LVL.explote, anual: CLIENT_LVL.anual})[key] || d.lvl; // los clientes tienen nivel fijo; la Gran Presentación crece con vos
  // con Fede de compañero, la reunión es más larga: el cliente aguanta más
  if (PENDING_ALLY) d = Object.assign({}, d, {k: [d.k[0] * 1.2, d.k[1], d.k[2], d.k[3]]});
  if (key === 'fede'){
    const extra = [];
    if (S.bosses >= 1) extra.push({n: 'Pausa para el mate', p: 0, fx: 'heal35', w: 1});
    if (S.bosses >= 2) extra.push({n: 'Liderar con el ejemplo', p: 85, a: 95, w: 2});
    if (S.bosses >= 3) extra.push({n: 'Pensar en grande', p: 0, fx: 'selfAtk+1 selfDef+1', w: 1});
    d = calibrateFede(Object.assign({}, d, {mv: d.mv.concat(extra)}), lvl);
  }
  SFX.enc(); await transition(800); $('fade').style.transition = 'none'; await fade(true, false, 20); $('fade').style.transition = ''; G.trans = null;
  return battleFlow(mkFoe(d, lvl, key), kind, key);
}
/* Fondos de combate: se pintan una vez a resolución real (1 px = 1 px) con el mismo kit que los mapas */
const BG = {
  // los problemas aparecen en La Base: pared blanca, piso de tablas, pizarrones y las ventanas angostas del fondo
  wild:  {wallK: 'brasil', floorK: 'brasil', plat: ['#c9bfa6', '#9d927a', '#ddd4bf', '#b5ab92']},
  boss:  {wallK: 'cli', floorK: 'cli', plat: ['#c98a74', '#9b5e4d', '#dfaa94', '#b67a65']},
  // el entrenamiento con Fede es en Brasil, su oficina: pared blanca con moldura, piso de tablas y la colchoneta lavanda
  spar:  {wallK: 'brasil', floorK: 'brasil', plat: ['#b9aee6', '#8d80c8', '#d2caf3', '#a196d8']},
  final: {wallK: 'calm', floorK: 'wood2', plat: ['#8a5a8d', '#5a2a5c', '#a87aab', '#74467a']},
};
const BG_CACHE = {};
/* El combate se ve "más cerca": todo (fondo y personajes) se dibuja a 256x192 y se amplía al doble,
   igual que las poses de combate de las fichas, que tienen el píxel más grande que las del mundo. */
const WALL_Y = 68;
function platformPx(c, cx, cy, rx, ry, col){
  const [m, d, l, pat] = col, o = mixC(d, INK, .6);
  pixEllipse(c, cx + 3, cy + 6, rx + 3, ry + 2, PX.shadow);
  pixEllipse(c, cx, cy + 4, rx + 1, ry + 1, o); pixEllipse(c, cx, cy + 3, rx, ry, d);
  pixEllipse(c, cx, cy, rx + 1, ry + 1, o); pixEllipse(c, cx, cy, rx, ry, m);
  pixEllipse(c, cx, cy + 1, rx - 5, ry - 3, pat); pixEllipse(c, cx, cy + 1, rx - 6, ry - 4, m);
  pixEllipse(c, cx - Math.round(rx*.22), cy - Math.round(ry*.42), Math.round(rx*.4), Math.max(1, Math.round(ry*.2)), l);
}
/* los afiches de Brasil en chico, para el fondo del entrenamiento (26x34) */
function sparPoster(p, X, Y, k){
  const pw = 26, ph = 34, L = (x, y, w, h, c) => p.R(X + x, Y + y, w, h, c);
  L(-2, -2, pw + 4, ph + 4, '#c9a06a'); L(-2, -2, pw + 4, 1, '#e2c08e'); L(-2, ph + 1, pw + 4, 1, '#9a7448');
  if (k === 0){
    for (let x = 0; x < pw; x++) L(x, 0, 1, 23, Math.floor(x / 3) % 2 ? '#efe6d6' : '#c3b0ea');
    for (let y = 23; y < ph; y++) for (let x = 0; x < pw; x++) L(x, y, 1, 1, (Math.floor((x + y) / 4) + Math.floor((x - y + 40) / 4)) % 2 ? '#a8d63c' : '#2c3622');
    L(8, 18, 10, 12, '#5e3280'); L(8, 18, 10, 1, '#8a5aae'); L(8, 22, 10, 4, '#ec9038'); L(10, 23, 6, 2, '#f6efe2');
    L(12, 4, 2, 14, '#2f4a2a');
    for (const [x, y] of [[6, 7], [17, 5], [8, 13], [17, 12], [13, 2]]){ p.E(X + x, Y + y, 3, 1, '#2f5a30'); }
    for (const [x, y] of [[7, 8], [16, 7], [10, 13]]){ L(x, y, 2, 5, '#f08a3a'); L(x, y, 2, 1, '#2f4a2a'); }
  } else {
    L(0, 0, pw, ph, '#ec7a32');
    for (let y = 0; y < 22; y++) L(0, y, Math.max(0, 22 - y), 1, '#9ad040');
    for (let y = 3; y < 15; y++){ const xl = 1 + Math.round((y - 3) * .3), xr = 13 - Math.round((y - 3) * .5); if (xr > xl) L(xl, y, xr - xl, 1, '#1f6b33'); }
    for (let t = 0; t <= 1.0001; t += .06){ p.E(X + 6 + t * 11, Y + 17 - t * 10, 1 + t * 2.6, (1 + t * 2.6) * .85, '#d23a26'); }
    p.E(X + 18, Y + 5, 2, 1, '#2f7a2a'); L(13, 7, 6, 2, '#1e1a16'); L(14, 7, 1, 1, '#ffffff'); L(17, 7, 1, 1, '#ffffff');
    L(20, 2, 2, 5, '#d23a26'); L(19, 0, 4, 3, '#f6e6c8');
    for (const [s, y] of [['TOO', 21], ['HOT', 27]]) [...s].forEach((ch, i) => GLYPH[ch].forEach((r, j) => { for (let q = 0; q < r.length; q++) if (r[q] === '1') L(12 + i * 4 + q, y + j, 1, 1, '#1e1a16'); }));
  }
}
function battleBackdrop(kind){
  if (BG_CACHE[kind]) return BG_CACHE[kind];
  const th = BG[kind] || BG.boss, c = document.createElement('canvas'); c.width = VW; c.height = 192;
  const x = c.getContext('2d'), p = Pen(x), Wd = c.width;
  if (kind === 'final'){
    p.R(0, 0, Wd, WALL_Y, '#2a1e3e');
    for (let i = 0; i < Wd; i += 12){ p.R(i, 0, 6, WALL_Y, '#5a2a5c'); p.R(i + 6, 0, 6, WALL_Y, '#4a2250'); p.R(i, 0, 1, WALL_Y, '#74467a'); p.R(i + 11, 0, 1, WALL_Y, '#381a3e'); }
    p.R(0, 0, Wd, 7, '#381a3e'); for (let i = 0; i < Wd; i += 8){ p.E(i + 4, 7, 4, 2, '#5a2a5c'); p.R(i + 2, 6, 4, 1, '#74467a'); }
    const sx = 68, sw = 120; p.R(sx - 2, 9, sw + 4, 52, '#1a1424'); p.R(sx, 11, sw, 48, '#efe9fb'); p.R(sx, 11, sw, 1, '#ffffff');
    p.R(sx + 7, 21, 60, 3, PX.plum); p.R(sx + 7, 27, 40, 2, '#b7aee0');
    [[0, 17, PX.lime], [1, 25, PX.orange], [2, 13, PX.lav], [3, 31, PX.orange], [4, 22, PX.lime]].forEach(([i, h, col]) => { p.R(sx + 12 + i*11, 58 - h, 7, h, col); p.R(sx + 12 + i*11, 58 - h, 7, 1, hil(col, .4)); });
    p.R(sx + 9, 58, 60, 1, '#5a5664'); p.E(sx + 98, 39, 11, 11, PX.orange); p.E(sx + 95, 36, 5, 5, hil(PX.orange, .35));
    p.R(0, WALL_Y - 5, Wd, 5, PX.orange); p.R(0, WALL_Y - 5, Wd, 1, hil(PX.orange, .35)); p.R(0, WALL_Y - 1, Wd, 1, shd(PX.orange, .4));
  } else {
    const W = WALLS[th.wallK] || WALLS.wood, w = rampOf(W.w), base = WALL_Y;
    p.R(0, 0, Wd, base, W.p); for (let i = 0; i < Wd; i += 8) p.R(i, 7, 1, base - 23, W.s);
    p.R(0, 0, Wd, 6, PX.cap); p.R(0, 0, Wd, 1, PX.capL); p.R(0, 5, Wd, 1, PX.capD); p.R(0, 6, Wd, 1, shd(W.p, .25));
    p.R(0, base - 16, Wd, 1, w.h); p.R(0, base - 15, Wd, 1, w.d); p.R(0, base - 14, Wd, 10, w.m);
    for (let i = 0; i < Wd; i += 16){ p.R(i + 2, base - 13, 12, 1, w.d); p.R(i + 2, base - 12, 1, 6, w.d); p.R(i + 3, base - 6, 11, 1, w.l); p.R(i + 13, base - 12, 1, 6, w.l); }
    p.R(0, base - 4, Wd, 3, w.e); p.R(0, base - 4, Wd, 1, w.d); p.R(0, base - 1, Wd, 1, shd(W.w, .55));
    if (kind === 'wild'){
      // La Base (como en la foto): moldura, a la izquierda la ventana grande con cortinas y el pizarrón de eventos
      // (los tapa el recuadro del rival una vez que arranca), y al fondo el nicho con dos ventanas angostas de
      // madera oscura, el pizarrón negro, la grilla del mes y dos plantas. Arriba, la lámpara lineal.
      p.R(0, 7, Wd, 4, '#ece6d8'); p.R(0, 7, Wd, 1, '#fbf8f1'); p.R(0, 11, Wd, 1, '#d9d1c1');
      tallWindow(x, 2, 2, 62, false);
      whiteboard(x, 66, 16, 54, 0, (q, w) => { q.R(5, 4, 20, 1, '#d24a3a'); for (let i = 0; i < 5; i++){ q.P(5, 7 + i * 3, '#3d6fb0'); q.R(7, 7 + i * 3, [16, 11, 18, 9, 13][i], 1, '#3d6fb0'); } q.E(w - 10, 10, 4, 4, '#9a94a0'); q.E(w - 10, 10, 3, 3, '#fdfcf8'); q.P(w - 11, 9, '#3a3040'); q.P(w - 9, 9, '#3a3040'); });
      const narrow = (wx) => { p.R(wx - 1, 13, 20, 41, '#2e1a10'); p.R(wx + 1, 15, 16, 37, '#3a2216'); for (let j = 0; j < 6; j++) for (let i = 0; i < 2; i++){ p.R(wx + 2 + i * 8, 16 + j * 6, 6, 5, j < 2 ? '#7f9aa6' : '#6c8794'); p.P(wx + 3 + i * 8, 17 + j * 6, '#a9c0c9'); } p.R(wx - 2, 54, 22, 2, '#4a2e1e'); };
      narrow(134); narrow(232);
      p.R(156, 22, 12, 16, '#16171a'); p.R(157, 23, 10, 14, '#222428'); p.R(159, 25, 4, 3, '#6fb6e8'); p.R(162, 30, 4, 3, '#f4efe4'); p.P(160, 34, PX.lime);
      whiteboard(x, 176, 20, 44, 0, (q) => { for (let i = 0; i <= 7; i++) q.R(18 + i * 3, 4, 1, 15, '#c9c4d0'); for (let j = 0; j < 4; j++) q.R(18, 4 + j * 5, 22, 1, '#c9c4d0'); [[20, 7], [27, 12], [33, 7]].forEach(([a, b]) => q.P(a, b, '#d24a3a')); q.R(5, 6, 10, 1, '#3a3040'); q.R(5, 9, 8, 1, '#9a94a0'); });
      for (const [px0, h] of [[160, 18], [214, 22]]){ p.R(px0 - 5, base - 10, 10, 8, '#d8cdb8'); p.R(px0 - 5, base - 10, 10, 1, '#efe7d6'); for (let k = 0; k < 7; k++){ const a = -1.3 + k * .43; p.L(px0, base - 10, Math.round(px0 + Math.cos(a) * 9), Math.round(base - 10 - h * (.6 + .4 * Math.sin(k))), k % 2 ? '#4e7a44' : '#2f5a30'); } }
      for (const [lx, lw] of [[128, 124]]){ p.R(lx, 5, 1, 9, 'rgba(30,30,34,.5)'); p.R(lx + lw, 5, 1, 9, 'rgba(30,30,34,.5)'); p.R(lx - 4, 14, lw + 8, 3, '#2a2b30'); p.R(lx - 4, 17, lw + 8, 1, '#fff6dc'); x.fillStyle = 'rgba(255,244,214,.12)'; x.fillRect(lx - 4, 18, lw + 8, 10); }
    } else if (kind === 'boss'){
      windowPane(x, 10, 10, 62, 36); windowPane(x, 184, 10, 62, 36);
      p.R(98, 12, 60, 34, '#5a4030'); p.R(100, 14, 56, 30, '#f6f1e6'); p.R(102, 16, 52, 26, hil(PX.plum, .7)); p.E(120, 29, 8, 8, PX.orange); p.R(131, 19, 18, 18, PX.plum); p.R(103, 36, 50, 5, PX.lime); p.R(98, 46, 60, 1, PX.shadow);
    } else if (kind === 'spar'){
      // Brasil: moldura de yeso, los dos afiches, el pizarrón con el mate, la bolsa de boxeo y la ventana con persianas
      p.R(0, 7, Wd, 7, '#ece6d8'); p.R(0, 7, Wd, 1, '#fbf8f1'); p.R(0, 9, Wd, 1, '#d9d1c1');
      for (let i = 0; i < Wd; i += 4){ p.R(i, 10, 2, 2, '#f8f4ec'); p.R(i + 2, 10, 1, 2, '#cfc6b4'); }
      p.R(0, 13, Wd, 1, '#d9d1c1');
      // el recuadro de Fede tapa la esquina de arriba a la izquierda: ahí van el pizarrón y la bolsa (se ven al entrar);
      // los afiches quedan a los costados de Fede y la ventana, detrás de él
      whiteboard(x, 8, 15, 72, 0, statusBoardArt);
      const bag = bagSprite(); x.drawImage(bag, 92 - bag.m, 6 - bag.m); p.R(94, base + 3, 14, 2, PX.shadowS);
      tallWindow(x, 160, 2, 62, true);
      sparPoster(p, 129, 17, 0); sparPoster(p, 226, 17, 1);
    } else {
      whiteboard(x, 8, 12, 70, 0); whiteboard(x, 178, 12, 70, 1);
      p.R(95, 12, 66, 42, '#3a3040'); p.R(97, 14, 62, 38, PX.cream);
      pixText(x, 'LA AGENCIA', 108, 18, PX.plum); p.R(104, 27, 48, 2, PX.lime); p.R(104, 32, 36, 1, '#b9b3a6'); p.R(104, 36, 42, 1, '#b9b3a6'); p.R(104, 40, 30, 1, '#b9b3a6');
      p.R(104, 46, 8, 3, PX.orange); p.R(114, 46, 8, 3, PX.lav);
    }
  }
  // piso por píxel con sombra bajo la pared
  const img = x.getImageData(0, WALL_Y, Wd, c.height - WALL_Y), d = img.data;
  for (let j = 0; j < c.height - WALL_Y; j++) for (let i = 0; i < Wd; i++){
    let col = floorPx(th.floorK, i, j);
    const s = j < 3 ? .22 : (j < 5 && ((i + j) & 1)) ? .22 : 0;
    if (kind === 'final') col = col.map(v => Math.round(v * .55));
    if (s) col = col.map((v, k) => Math.round(v * (1 - s) + [43, 36, 72][k] * s));
    const q = (j*Wd + i)*4; d[q] = col[0]; d[q + 1] = col[1]; d[q + 2] = col[2]; d[q + 3] = 255;
  }
  x.putImageData(img, 0, WALL_Y);
  platformPx(x, EPLAT.x, EPLAT.y, 58, 12, th.plat);
  platformPx(x, PPLAT.x, PPLAT.y, 74, 17, th.plat);
  return BG_CACHE[kind] = c;
}
/* el color que más se repite en la pared del fondo (para seguirla hacia arriba en la pantalla alta) */
function wallTone(bg){
  if (bg._tone) return bg._tone;
  const d = bg.getContext('2d').getImageData(0, 8, bg.width, WALL_Y - 26).data, n = {};
  let best = '#3a3450', bn = 0;
  for (let i = 0; i < d.length; i += 4){ const k = (d[i] << 16 | d[i+1] << 8 | d[i+2]); n[k] = (n[k] || 0) + 1; if (n[k] > bn){ bn = n[k]; best = k; } }
  return bg._tone = typeof best === 'number' ? '#' + best.toString(16).padStart(6, '0') : best;
}
function drawBattleBG(kind, t){
  // la escena va arriba en 256x192; si la pantalla es más alta (celular parado), abajo queda el tablero del combate
  const bg = battleBackdrop(kind);
  ctx.setTransform(2*RES, 0, 0, 2*RES, 0, 0);
  ctx.drawImage(bg, 0, 0);
  if (VH > 192){ ctx.fillStyle = '#1b1830'; ctx.fillRect(0, 192, VW, VH - 192); ctx.fillStyle = '#3a3458'; ctx.fillRect(0, 192, VW, 1); }
  if (kind === 'final'){
    for (const sx of [70, 190]){ const o = Math.round(Math.sin(t/1400 + sx) * 10); ctx.fillStyle = 'rgba(255,240,200,.08)';
      for (let y = 0; y < 150; y++){ const w = 6 + y*.45; ctx.fillRect(Math.round(sx + o*y/150 - w/2), y, Math.round(w), 1); } }
  }
}
const EPLAT = {x:190, y:82}, PPLAT = {x:72, y:176};
function drawBattle(){
  const t = G.t, th = BG[B.kind] || BG.boss;
  drawBattleBG(B.kind, t);
  const fx = B.fx && (t - B.fx.t0 < B.fx.ms) ? B.fx : null;
  const fk = fx ? (t - fx.t0) / fx.ms : 0;
  const blink = w => fx && fx.kind === 'hit' && fx.who === w && Math.floor((t - fx.t0) / 70) % 2 === 0;
  const shake = w => fx && fx.kind === 'hit' && fx.who === w ? Math.round(Math.sin((t - fx.t0) / 16) * 3) : 0;
  const lunge = w => fx && fx.kind === 'lunge' && fx.who === w ? Math.sin(fk * Math.PI) * 12 : 0;
  const ent = clamp((t - B.enter) / 600, 0, 1), e2 = 1 - Math.pow(1 - ent, 3);
  const bob = (Math.floor(t / 520) % 2) * .5;
  const f = B.foe, d = f.def0;
  const spr = d.spr ? enemySprite(d.spr) : personSprite(d.look, 'down', 0, true, (B.cheer && f.key === 'fede') ? 'cheer' : ({explote:'cheer', logo:'wide', fantasma:'phone', fede:'fist', anual:'wide'})[f.key] || 'point');
  const ek = spr.k || 1, sw = spr.width*ek, sh = spr.height*ek, scx = spr.cx*ek, sft = spr.foot*ek;
  pixEllipse(ctx, EPLAT.x, EPLAT.y + 1, d.spr ? 22 : 17, 3, PX.shadowS);
  let ex = EPLAT.x - scx + (1 - e2) * 160 + shake('e') - lunge('e'), ey = EPLAT.y + 2 - sft + lunge('e') * .4 + (d.spr ? bob : 0);
  ctx.save();
  if (B.faint){ const k = clamp((t - B.faint) / 650, 0, 1); ctx.beginPath(); ctx.rect(0, 0, VW, EPLAT.y + 3); ctx.clip(); ey += k * sh; }
  if (!blink('e')) drawSprite(ctx, spr, ex, ey, sw, sh, 2*RES);
  ctx.restore();
  if (B.ally){ // Fede, al lado tuyo y un poquito atrás
    // de espaldas, como en su ficha; de tu tamaño (es un poco más alto), un poco más atrás y sin salirse por el borde
    const as = personSprite('fede', 'up', 0, true, 'wave'), ak = (as.k || 1) * 1.04, ax = Math.max(as.cx*ak + 2, PPLAT.x - 46);
    drawSprite(ctx, as, ax - as.cx*ak - (1 - e2) * 160 + lunge('a'), (as.hdBack ? 174 : 196) - as.foot*ak - lunge('a') * .4, as.width*ak, as.height*ak, 2*RES); }
  const ps = personSprite('player', 'up', 0, true, 'wave');
  const pk = ps.k || 1, px = PPLAT.x - ps.cx*pk - (1 - e2) * 160 + shake('p') + lunge('p'), py = (ps.hdBack ? 180 : 204) - ps.foot*pk - lunge('p') * .4 + (B.P.sleep > 0 ? 2 : 0);
  if (!blink('p')) drawSprite(ctx, ps, px, py, ps.width*pk, ps.height*pk, 2*RES);
  if (fx && fx.kind === 'buff'){
    const cx = fx.who === 'p' ? PPLAT.x : EPLAT.x, cy = fx.who === 'p' ? PPLAT.y - 50 : EPLAT.y - 30;
    for (let i = 0; i < 12; i++){ const a = i * .53, r = 18 + (i % 3) * 9, yy = cy + 30 - fk * 60 - (i % 4) * 6; ctx.fillStyle = i % 2 ? '#b6f03a' : '#ffffff'; ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(yy), 2, 2); }
  }
  if (fx && fx.kind === 'hit' && fk < .3){ ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, 0, VW, 192); }
}

/* después de quedarte sin energía dos veces con un cliente, el juego sugiere con qué nivel volver (o qué probar si ya lo tenés) */
const WEAK_TYPE = {fantasma: 'calma', logo: 'creativo', explote: 'estrategia'};
async function bossAdvice(key){
  const rec = REC_LVL[key], cn = artName(BOSS[key].n), n = bossLost(key);
  if (S.lvl < rec) await say(pick('advice:lvl', [
    `${capFirst(cn)} no quedó conforme esta vez. Un consejo: intentalo de nuevo con nivel ${rec}. Estás en el ${S.lvl}.`,
    `Ya van ${n} intentos con ${cn}. Conviene volver con nivel ${rec}: resolvé problemas en La Base y capacitate con el equipo. Estás en el ${S.lvl}.`]) + (key === 'explote' ? ' Y andá con Fede.' : ''));
  else await say(key === 'anual' ? `Ya tenés el nivel para ${cn}. Usá los objetos de la mochila y no te guardes las mejores habilidades para el final.`
    : `Ya tenés el nivel para ${cn}. Probá con habilidades de tipo ${WEAK_TYPE[key]}: es su punto débil.${key === 'explote' ? ' Y andá con Fede.' : ''}`);
}

/* Si te trabás con un tipo de problema (le pegás con lo que le hace poco y nunca con lo que lo destraba, dos desafíos
   seguidos), alguien del equipo te manda una pista por Slack. Una sola vez por tipo, hasta que lo resuelvas bien. */
const TYPE_TIP = {BURO: ['la burocracia', 'lo creativo'], CAOS: ['el caos', 'la estrategia'], BUG: ['un bug', 'lo técnico'], PRES: ['la presión', 'la calma']};
async function typeHint(foe, res){
  const m = mem(), t = foe.type, tip = TYPE_TIP[t]; if (!tip || !B) return;
  m.typeMiss = m.typeMiss || {}; m.typeTip = m.typeTip || {};
  if (B.goodHits){ m.typeMiss[t] = 0; return; }
  if (!(B.weakHits >= 2 || res === 'lose')) return;
  m.typeMiss[t] = (m.typeMiss[t] || 0) + 1;
  if (m.typeMiss[t] < 2 || m.typeTip[t]) return;
  m.typeTip[t] = true;
  const who = ['fede', 'sahi', 'giuli', 'alejo', 'pimi'].filter(id => talks(id) > 0), id = who.length ? who[rnd(who.length)] : 'fede';
  const voice = {fede: `Contra ${tip[0]}, ${tip[1]}. Probá, aprendé, repetí.`, sahi: `Che, contra ${tip[0]} jugá con ${tip[1]}. Es como patear al ángulo, crack.`,
    giuli: `Te vi con ${foe.name}. Contra ${tip[0]}, ${tip[1]}. Queda más prolijo.`, alejo: `Contra ${tip[0]}, ${tip[1]}. Cambiá de plano y vas a ver.`, pimi: `Tranqui. Contra ${tip[0]}, ${tip[1]}. Y listo.`}[id];
  await say(`Te llega un mensaje de ${PEOPLE[id]} por Slack: "${voice}"`);
}
