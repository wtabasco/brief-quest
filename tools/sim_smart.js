// Entrenamientos contra Fede con un jugador "humano bueno": usa buffs, objetos de combate y se prepara antes de pegar
(cfg) => {
  const N = cfg.n || 1500;
  const run = (sc) => {
    S = newSave('Sim'); S.lvl = sc.lvl; S.bosses = sc.bosses; S.skills = sc.skills.slice(); S.equip = sc.skills.slice(0, 4);
    S.bonus = sc.bonus || {hp:0, atk:0, def:0, spd:0}; S.pp = {}; S.skills.forEach(id => S.pp[id] = SK[id].pp); fullHeal();
    S.items = Object.assign({}, sc.items || {}); S.buff = sc.buff || null;
    const extra = [];
    if (S.bosses >= 1) extra.push({n: 'Pausa para el mate', p: 0, fx: 'heal35', w: 1});
    if (S.bosses >= 2) extra.push({n: 'Liderar con el ejemplo', p: 85, a: 95, w: 2});
    if (S.bosses >= 3) extra.push({n: 'Pensar en grande', p: 0, fx: 'selfAtk+1 selfDef+1', w: 1});
    const t0 = performance.now();
    const DEF = calibrateFede(Object.assign({}, BOSS.fede, {mv: (typeof fedeMoves === 'function' ? fedeMoves() : BOSS.fede.mv.concat(extra))}), fedeLevel());
    const ms = performance.now() - t0;
    let wins = 0, turnsW = 0, turnsA = 0, resets = 0;
    for (let i = 0; i < N; i++){
      fullHeal();
      const foe = mkFoe(DEF, fedeLevel(), 'fede');
      B = {foe, P: mkPlayer(), kind: 'spar', turn: 0, prueba: 0};
      const P = B.P, pp = {}; S.equip.forEach(id => pp[id] = SK[id].pp);
      const items = Object.assign({}, S.items);
      if (S.buff === 'fede'){ P.st.atk = 1; P.st.spd = 1; } else if (S.buff === 'duo'){ P.st.atk = 1; P.st.def = 1; } else if (S.buff === 'def') P.st.def = 1; else if (S.buff) P.st.atk = 1;
      let res = null;
      const hit = (u, t, m) => {
        const fx = (m.fx || '').split(' ').filter(Boolean);
        const targetsFoe = m.p > 0 || fx.some(f => f.startsWith('foe') || f === 'sleep' || f === 'reset');
        if (targetsFoe && Math.random() > (m.a || 100) / 100 / stg(t.st.eva)) return;
        if (m.p > 0){
          let power = m.p; if (fx.includes('prueba')){ power = Math.min(115, 35 + 20 * B.prueba); B.prueba++; }
          const eff = u.isP ? ((CHART[m.t] || {})[t.type] || 1) : 1, crit = Math.random() < (fx.includes('crit') ? .3 : 1/16);
          let dmg = ((2*u.lvl/5 + 2) * power * u.atk * stg(u.st.atk) / (t.def * stg(t.st.def))) / (u.isP ? 24 : 19) + 2;
          t.hp = Math.max(0, t.hp - Math.max(1, Math.floor(dmg * eff * (crit ? 1.5 : 1) * (.85 + Math.random()*.15)))); if (t.hp <= 0) return;
        }
        for (const f of fx){
          const mm = f.match(/^(self|foe)(Atk|Def|Spd|Eva)([+-]\d)$/);
          if (mm){ const tg = mm[1] === 'self' ? u : t, k = mm[2].toLowerCase(); tg.st[k] = clamp(tg.st[k] + (+mm[3]), -6, 6); continue; }
          const hm = f.match(/^heal(\d+)$/); if (hm) u.hp = Math.min(u.max, u.hp + Math.floor(u.max * (+hm[1]) / 100));
          if (f === 'reset' && t.isP){ t.st = {atk: 0, def: 0, spd: 0, eva: 0}; B.resets = (B.resets || 0) + 1; }
        }
      };
      const useItem = (k) => { items[k]--; const it = IT[k]; if (it.heal) P.hp = Math.min(P.max, P.hp + it.heal);
        if (k === 'foto'){ P.st.atk++; P.st.def++; } if (k === 'libreta') P.st.atk += 2; if (k === 'postit') P.st.def++; if (k === 'playlist'){ P.st.spd++; P.st.def++; }
        if (k === 'pendrive') S.equip.forEach(id => pp[id] = SK[id].pp); };
      for (let t = 1; t < 60 && !res; t++){
        B.turn = t;
        const em = pickMove(foe), hpF = P.hp / P.max, av = S.equip.filter(id => pp[id] > 0);
        let item = null;
        if (hpF < .35){ for (const k of ['medialunas', 'alfajor', 'mate', 'postit', 'cafe']) if (items[k] > 0){ item = k; break; } }
        if (!item && hpF > .5 && P.st.atk < 3){ for (const k of ['libreta', 'foto']) if (items[k] > 0){ item = k; break; } }
        if (!item && !av.some(id => SK[id].p) && items.pendrive > 0) item = 'pendrive';
        if (item){ useItem(item); hit(foe, P, em); if (P.hp <= 0) res = 'lose'; continue; }
        let pick = av.find(id => (SK[id].fx || '').includes('heal') && hpF < .35);
        if (!pick && hpF > .5 && P.st.atk < 4) pick = ['afull', 'medir', 'dinamica'].find(id => av.includes(id));
        if (!pick){ let bv = -1; for (const id of av){ const m = SK[id]; if (!m.p) continue; let pw = m.p; if ((m.fx || '').includes('prueba')) pw = Math.min(115, 35 + 20 * B.prueba);
          const v = pw * ((CHART[m.t] || {})[foe.type] || 1) * (m.a || 100) / 100 * ((m.fx || '').includes('crit') ? 1.1 : 1); if (v > bv){ bv = v; pick = id; } } }
        if (!pick){ res = 'lose'; break; }
        const pm = SK[pick]; pp[pick]--;
        let pFirst; if ((pm.pri || 0) !== (em.pri || 0)) pFirst = (pm.pri || 0) > (em.pri || 0);
        else { const ps = P.spd * stg(P.st.spd), es = foe.spd * stg(foe.st.spd); pFirst = ps === es ? Math.random() < .5 : ps > es; }
        for (const [u, tt, m] of (pFirst ? [[P, foe, pm], [foe, P, em]] : [[foe, P, em], [P, foe, pm]])){ if (u.hp <= 0) continue; hit(u, tt, m); if (foe.hp <= 0){ res = 'win'; break; } if (P.hp <= 0){ res = 'lose'; break; } }
      }
      turnsA += B.turn; resets += B.resets || 0; if (res === 'win'){ wins++; turnsW += B.turn; }
    }
    return {name: sc.name, win: +(wins / N * 100).toFixed(1), turns: wins ? +(turnsW / wins).toFixed(1) : 0, allTurns: +(turnsA / N).toFixed(1), resets: +(resets / N).toFixed(2), fedeLvl: fedeLevel(), hpK: +DEF.k[0].toFixed(2), ms: Math.round(ms)};
  };
  return cfg.scen.map(run);
}
