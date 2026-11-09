/* Música de fondo: temas orquestales originales (assets/music) y sintetizador de respaldo */
"use strict";
/* ================= MÚSICA DE FONDO =================
   Los temas suenan grabados (orquesta, ver MUSIC_SRC más abajo); este sintetizador queda de respaldo.
   Temas originales hechos con osciladores (WebAudio), bajitos y con filtro para que no cansen.
   Arranca con la primera tecla o toque (los navegadores no dejan sonar antes) y se apaga con SELECT.
   Cada tema: tempo, compases de 8 corcheas, acordes, melodía [nota, duración en corcheas] y estilo de bajo, batería y arpegio.
   Tres temas, todos con acordes mayores: uno tranquilo de fondo, uno con acción para los desafíos y uno solemne y épico para los momentos especiales (clientes, ascensos y el final). */
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
const _ = null;
/* acordes (tríadas) para no escribir números a mano */
const CH = {Eb: [58, 63, 67], C: [60, 64, 67], D: [62, 66, 69], E: [59, 64, 68], F: [60, 65, 69], G: [59, 62, 67], A: [61, 64, 69], Ab: [60, 63, 68], Bb: [58, 62, 65],
  Dd: [62, 66, 69], Ad: [61, 64, 69], Gd: [62, 67, 71], Cd: [60, 64, 67], Ed: [64, 68, 71]};
const TRACKS = {
  // "Campo abierto" (fondo): fa mayor, tranquilo y con ganas de explorar. Flauta, cuerdas suaves y bajo que camina
  world: {bpm: 96, swing: 0, vol: 1,
    chords: ['F', 'F', 'Bb', 'F', 'C', 'C', 'F', 'F', 'Bb', 'Bb', 'F', 'D', 'G', 'G', 'C', 'C'].map(k => CH[k]),
    mel: [[72, 3], [77, 1], [76, 2], [72, 2],   [69, 6], [72, 2],
          [74, 3], [77, 1], [81, 2], [79, 2],   [77, 6], [_, 2],
          [76, 3], [79, 1], [84, 2], [81, 2],   [79, 4], [76, 2], [74, 2],
          [72, 3], [74, 1], [76, 2], [77, 2],   [77, 6], [_, 2],
          [74, 2], [77, 2], [82, 3], [81, 1],   [79, 4], [77, 2], [74, 2],
          [72, 2], [77, 2], [81, 3], [79, 1],   [78, 6], [81, 2],
          [83, 3], [81, 1], [79, 2], [74, 2],   [79, 6], [_, 2],
          [76, 2], [79, 2], [84, 2], [82, 2],   [79, 6], [_, 2]],
    bass: 'walk', drums: 'soft', drumK: .7, lead: 'flute', vib: true, leadVol: .085, leadAtt: .07, echo: 'string', arp: 'harp', harpVol: .02, pad: .022, padType: 'string', rev: .34},
  // "¡A resolver!" (desafíos): la mayor, rápido y heroico. Acordes mayores (la, fa, sol, re, mi)
  battle: {bpm: 156, swing: 0, vol: 1,
    chords: ['Ad', 'Ad', 'F', 'G', 'Ad', 'Ad', 'F', 'G', 'Dd', 'Dd', 'Ad', 'Ad', 'F', 'G', 'Ed', 'Ed'].map(k => CH[k]),
    mel: [[76, 1], [76, 1], [_, 1], [81, 2], [76, 1], [78, 1], [80, 1],   [81, 3], [_, 1], [76, 2], [73, 2],
          [77, 1], [77, 1], [_, 1], [81, 2], [77, 1], [79, 1], [81, 1],   [83, 3], [_, 1], [79, 2], [74, 2],
          [76, 1], [76, 1], [_, 1], [81, 2], [76, 1], [78, 1], [80, 1],   [81, 2], [85, 2], [88, 3], [_, 1],
          [84, 2], [81, 2], [77, 2], [81, 2],                             [83, 4], [_, 2], [79, 1], [83, 1],
          [81, 3], [78, 1], [74, 2], [78, 2],                             [81, 2], [86, 2], [85, 2], [83, 2],
          [81, 3], [76, 1], [73, 2], [76, 2],                             [81, 4], [_, 2], [80, 1], [81, 1],
          [84, 3], [81, 1], [77, 2], [84, 2],                             [86, 3], [83, 1], [79, 2], [86, 2],
          [88, 3], [86, 1], [83, 2], [80, 2],                             [83, 2], [80, 2], [76, 2], [_, 2]],
    bass: 'gallop', drums: 'action', drumK: .7, lead: 'brass', stac: true, leadVol: .13, leadAtt: .02, echo: 'string', arp: 'harp', harpFast: true, harpVol: .02, pad: .022, padType: 'string', rev: .22},
  // "La gran reunión" (momentos especiales: clientes, ascensos y el final): si bemol mayor, solemne y épico, con metales y timbales
  special: {bpm: 108, swing: 0, vol: 1,
    chords: ['Bb', 'F', 'Eb', 'Bb', 'Eb', 'Bb', 'F', 'F', 'G', 'Eb', 'F', 'Bb', 'Eb', 'F', 'Bb', 'Bb'].map(k => CH[k]),
    mel: [[70, 2], [74, 2], [77, 4],   [77, 3], [79, 1], [77, 2], [72, 2],
          [75, 2], [79, 2], [82, 3], [80, 1],   [77, 6], [_, 2],
          [79, 3], [82, 1], [84, 2], [82, 2],   [82, 2], [77, 2], [74, 2], [77, 2],
          [72, 2], [77, 2], [81, 3], [79, 1],   [77, 6], [_, 2],
          [79, 3], [83, 1], [86, 4],            [84, 3], [82, 1], [79, 4],
          [77, 2], [81, 2], [84, 3], [82, 1],   [82, 6], [_, 2],
          [79, 2], [82, 2], [87, 4],            [86, 3], [84, 1], [81, 2], [77, 2],
          [82, 4], [86, 4],                     [89, 6], [_, 2]],
    bass: 'march', drums: 'timpani', drumK: .8, lead: 'brass', leadVol: .085, leadAtt: .06, vib: true, echo: 'string', arp: 'harp', harpVol: .018, pad: .024, padType: 'string', rev: .36},
};
TRACKS.day = {base: 'world', bpm: 124};
TRACKS.anual = {base: 'battle', bpm: 138}; TRACKS.finale = {base: 'special', bpm: 84}; // de día, la versión grabada más alegre; el sintetizador usa el mismo tema un poco más rápido
for (const k in TRACKS){ const t = TRACKS[k]; if (t.base) TRACKS[k] = Object.assign({}, TRACKS[t.base], t); }
const MUSIC = {cur: null, step: 0, next: 0, mel: [], bus: null, timer: null};
function musicBus(){
  if (MUSIC.bus || !AC) return MUSIC.bus;
  // sonido cálido: filtro más suave y una sala (reverb) para que no suene a arcade
  const g = AC.createGain(); g.gain.value = .7;
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2100; lp.Q.value = .2;
  const out = AC.createGain(); out.gain.value = 1;
  const len = Math.floor(AC.sampleRate * 2.4), ir = AC.createBuffer(2, len, AC.sampleRate);
  for (let c = 0; c < 2; c++){ const d = ir.getChannelData(c); for (let i = 0; i < len; i++){ const x = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - x, 3.2) * (i < 400 ? i / 400 : 1); } }
  const rv = AC.createConvolver(); rv.buffer = ir; const wet = AC.createGain(); wet.gain.value = .3;
  const rlp = AC.createBiquadFilter(); rlp.type = 'lowpass'; rlp.frequency.value = 3200;
  g.connect(lp); lp.connect(out); lp.connect(rlp).connect(rv).connect(wet).connect(out); out.connect(AC.destination);
  MUSIC.bus = g; MUSIC.wet = wet; MUSIC.waves = null; return g;
}
/* instrumentos: formas de onda con pocos armónicos (flauta, caña, metal, cuerda) en vez de las ondas cuadradas de consola */
const INST = {flute: [0, 1, .14, .06, .025], reed: [0, 1, .42, .26, .14, .08, .04], brass: [0, 1, .72, .5, .34, .22, .14, .08, .05], string: [0, 1, .5, .33, .25, .2, .16, .13, .1, .08], warm: [0, 1, .25, .08]};
const INST_LP = {flute: 0, reed: 2600, brass: 1900, string: 1700, warm: 0};
function instWave(k){
  musicBus(); MUSIC.waves = MUSIC.waves || {};
  if (!MUSIC.waves[k]){ const im = new Float32Array(INST[k]); MUSIC.waves[k] = AC.createPeriodicWave(new Float32Array(im.length), im); }
  return MUSIC.waves[k];
}
/* una nota con instrumento: ataque suave, se sostiene y se apaga (sus) o se apaga sola (pluck) */
function mInst(f, t, d, inst, v, o = {}){
  const att = o.att || .03, n = o.detune ? 2 : 1, g = AC.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att);
  if (o.sus){ g.gain.setValueAtTime(v, t + Math.max(att, d * .7)); g.gain.linearRampToValueAtTime(0, t + d + (o.rel || .15)); }
  else g.gain.exponentialRampToValueAtTime(.0001, t + d + (o.rel || .1));
  let dst = g;
  const lpf = INST_LP[inst];
  if (lpf){ const f2 = AC.createBiquadFilter(); f2.type = 'lowpass'; f2.Q.value = .5;
    if (inst === 'brass'){ f2.frequency.setValueAtTime(lpf * .45, t); f2.frequency.linearRampToValueAtTime(lpf, t + .12); } else f2.frequency.value = lpf;
    f2.connect(g); dst = f2; }
  g.connect(musicBus());
  const end = t + d + (o.rel || .15) + .05;
  for (let k = 0; k < n; k++){
    const osc = AC.createOscillator(); osc.setPeriodicWave(instWave(inst)); osc.frequency.setValueAtTime(f, t);
    if (n > 1) osc.detune.value = k ? 7 : -7;
    if (o.vib && d > .3){ const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = 5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .005, t + .35); l.connect(lg).connect(osc.frequency); l.start(t); l.stop(end); }
    const og = AC.createGain(); og.gain.value = 1 / n; osc.connect(og).connect(dst); osc.start(t); osc.stop(end);
  }
}
function mNote(f, t, d, type, v, att = .01, vib = 0){
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (vib && d > .3){ const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .006, t + .25); l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + d + .05); }
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(musicBus()); o.start(t); o.stop(t + d + .05);
}
let NOISE = null;
function mNoise(t, d, v, hp){ v *= (MUSIC.drumK || 1);
  if (!NOISE){ NOISE = AC.createBuffer(1, AC.sampleRate * .3, AC.sampleRate); const ch = NOISE.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random()*2 - 1; }
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = NOISE; f.type = 'highpass'; f.frequency.value = hp;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  s.connect(f).connect(g).connect(musicBus()); s.start(t); s.stop(t + d + .02);
}
function mKick(t, v){ v *= (MUSIC.drumK || 1); const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .16); o.connect(g).connect(musicBus()); o.start(t); o.stop(t + .2); }
/* la melodía se pasa a una lista de pasos: en qué corchea empieza cada nota y cuánto dura */
function melSteps(tr){ const out = []; let s = 0; for (const [n, d] of tr.mel){ if (n) out[s] = [n + (tr.melShift || 0), d]; s += d; } out.length = Math.max(out.length, tr.chords.length * 8); return out; }
function scheduleStep(tr, step, t, e){
  const bar = Math.floor(step / 8) % tr.chords.length, i = step % 8, ch = tr.chords[bar];
  // melodía (con un eco suave una octava abajo, que la hace más llena)
  MUSIC.drumK = tr.drumK || 1;
  if (i === 0 && MUSIC.wet) MUSIC.wet.gain.setTargetAtTime(tr.rev || .25, t, .3);
  const m = MUSIC.mel[step];
  if (m){
    if (INST[tr.lead]){ mInst(NOTE(m[0]), t, m[1] * e * (tr.stac ? .6 : .95), tr.lead, tr.leadVol, {att: tr.leadAtt || .04, vib: tr.vib, sus: !tr.stac, rel: tr.stac ? .12 : .25});
      if (tr.echo) mInst(NOTE(m[0] - 12), t, m[1] * e * .95, tr.echo, tr.leadVol * .32, {att: .08, sus: true, rel: .3}); }
    else { mNote(NOTE(m[0]), t, m[1] * e * .92, tr.lead, tr.leadVol, tr.vib ? .04 : .01, tr.vib); mNote(NOTE(m[0] - 12), t, m[1] * e * .8, 'triangle', tr.leadVol * .45, .01); }
  }
  // colchón: el acorde entero, bajito, al empezar cada compás (cuerdas que entran despacio)
  if (i === 0 && tr.pad){
    if (INST[tr.padType]) for (const n of ch) mInst(NOTE(n), t, e * 8, tr.padType, tr.pad, {att: .45, sus: true, rel: .5, detune: true});
    else for (const n of ch) mNote(NOTE(n), t, e * 7.5, tr.padType || 'triangle', tr.pad, .08);
  }
  // arpegios
  const up = [0, 1, 2, 1, 0, 2, 1, 2];
  if (tr.arp === 'pluck') mNote(NOTE(ch[up[i]] + 12), t, e * 1.1, 'triangle', .026);
  else if (tr.arp === 'fast'){ mNote(NOTE(ch[up[i]] + 12), t, e * .5, 'square', .012); mNote(NOTE(ch[up[(i + 2) % 8]] + 24), t + e / 2, e * .45, 'square', .009); }
  else if (tr.arp === 'soft') mNote(NOTE(ch[[0, 1, 2, 1][i % 4]] + 12), t, e * 1.8, 'triangle', .02);
  else if (tr.arp === 'harp'){ if (i % 2 === 0 || tr.harpFast) mInst(NOTE(ch[up[i]] + 12), t, e * 2.2, 'warm', tr.harpVol || .022, {att: .005, rel: .4}); }
  // bajo
  const root = NOTE(ch[0] - 24), fifth = NOTE(ch[2] - 24);
  if (tr.bass === 'bounce'){ if (i === 0) mNote(root, t, e * 1.4, 'triangle', .09); if (i === 2) mNote(fifth, t, e * .9, 'triangle', .065); if (i === 3) mNote(root * 2, t, e * .9, 'triangle', .06);
    if (i === 4) mNote(root, t, e * 1.4, 'triangle', .085); if (i === 6) mNote(fifth, t, e * .9, 'triangle', .065); if (i === 7) mNote(root * 2, t, e * .8, 'triangle', .055); }
  else if (tr.bass === 'walk'){ if (i === 0) mNote(root, t, e * 3.6, 'triangle', .085); if (i === 4) mNote(fifth, t, e * 2.6, 'triangle', .07); if (i === 6) mNote(NOTE(ch[1] - 24), t, e * 1.6, 'triangle', .06); }
  else if (tr.bass === 'march'){ if (i % 2 === 0) mNote(i === 4 ? fifth : root, t, e * 1.6, 'triangle', .09); }
  else if (tr.bass === 'gallop'){ mNote(i % 2 ? root * 2 : root, t, e * .85, 'triangle', .09); if (i === 7) mNote(fifth * 2, t + e / 2, e * .4, 'triangle', .06); }
  // batería
  if (tr.drums === 'pop'){ if (i === 0 || i === 4) mKick(t, .1); if (i === 7) mKick(t, .05);
    if (i === 2 || i === 6){ mNoise(t, .07, .03, 1500); mNoise(t + .012, .05, .015, 2500); }
    mNoise(t, .025, i % 2 ? .014 : .009, 8000); if (i === 7) mNoise(t, .12, .012, 6000); }
  else if (tr.drums === 'soft'){ if (i === 0) mKick(t, .05); if (i === 4) mNoise(t, .09, .012, 3000); if (i % 2 === 1) mNoise(t, .03, .006, 9000); }
  else if (tr.drums === 'timpani'){ if (i === 0) mKick(t, .14); if (i === 4) mKick(t, .08);
    if (i >= 6 && bar % 2 === 1){ mKick(t, .07); mKick(t + e / 2, .08); }
    if (i === 0 && bar % 4 === 0) mNoise(t, 1.2, .025, 5000); if (i === 2 || i === 6) mNoise(t, .04, .01, 7000); }
  else if (tr.drums === 'action'){ if (i % 2 === 0) mKick(t, .12);
    if (i === 2 || i === 6) mNoise(t, .09, .045, 1600);
    mNoise(t, .02, .016, 8500); mNoise(t + e / 2, .018, .01, 9000);
    if (i === 0 && bar % 4 === 0) mNoise(t, .5, .03, 4500);
    if (i === 7 && bar % 4 === 3){ mNoise(t, .06, .03, 1400); mNoise(t + e / 2, .06, .035, 1200); } }
}
/* ===== Temas orquestales grabados (originales, hechos para el juego) =====
   Se tocan desde archivos de audio: suenan con orquesta de verdad. Si no se pueden cargar
   (por ejemplo, abriendo el juego como archivo local), queda el sintetizador de arriba. */
const MUSIC_SRC = {day: 'assets/music/campo-abierto-dia.mp3', world: 'assets/music/campo-abierto.mp3', battle: 'assets/music/a-resolver.mp3', special: 'assets/music/la-gran-reunion.mp3', anual: 'assets/music/cliente-del-ano.mp3', finale: 'assets/music/fin-de-la-induccion.mp3'};
const MUSIC_LOOP = {anual: 128 * 60 / 138, finale: 128 * 60 / 84, day: 128 * 60 / 132, world: 128 * 60 / 112, battle: 128 * 60 / 150, special: 128 * 60 / 96};
const MUSIC_VOL = .36;
MUSIC.buf = {}; MUSIC.loading = {}; MUSIC.node = null; MUSIC.playing = null;
function loadTrack(id){
  if (!AC || !MUSIC_SRC[id] || MUSIC.buf[id] || MUSIC.loading[id]) return;
  MUSIC.loading[id] = fetch(MUSIC_SRC[id]).then(r => r.arrayBuffer()).then(b => new Promise((ok, ko) => AC.decodeAudioData(b, ok, ko)))
    .then(buf => { MUSIC.buf[id] = buf; }).catch(() => { MUSIC.failed = true; });
}
function startTrack(id){
  const now = AC.currentTime, old = MUSIC.node;
  if (old){ try { old.g.gain.cancelScheduledValues(now); old.g.gain.setTargetAtTime(0, now, .22); old.s.stop(now + 1.4); } catch(e){} }
  MUSIC.node = null; MUSIC.playing = id;
  if (!id) return;
  const buf = MUSIC.buf[id], s = AC.createBufferSource(), g = AC.createGain();
  s.buffer = buf; s.loop = true; s.loopStart = 0; s.loopEnd = Math.min(buf.duration, MUSIC_LOOP[id] || buf.duration);
  g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(MUSIC_VOL, now + .7);
  s.connect(g).connect(AC.destination); s.start(now + .02); MUSIC.node = {s, g};
}
function recordedTick(){
  for (const k in MUSIC_SRC) loadTrack(k);
  const want = muted ? null : MUSIC.cur;
  if (want && !MUSIC.buf[want]) return;          // todavía se está cargando
  if (MUSIC.playing !== want) startTrack(want);
}
function musicTick(){
  if (AC && AC.state === 'running' && MUSIC_SRC[MUSIC.cur] && !MUSIC.failed){ recordedTick(); return; }
  if (!AC || AC.state !== 'running' || muted || !MUSIC.cur) return;
  const tr = TRACKS[MUSIC.cur], e = 60 / tr.bpm / 2, len = tr.chords.length * 8;
  if (MUSIC.next < AC.currentTime) MUSIC.next = AC.currentTime + .06;
  while (MUSIC.next < AC.currentTime + .3){
    const sw = (MUSIC.step % 2) ? e * (tr.swing || 0) : 0;
    scheduleStep(tr, MUSIC.step, MUSIC.next + sw, e);
    MUSIC.step = (MUSIC.step + 1) % len; MUSIC.next += e;
  }
}
function playMusic(id){
  if (MUSIC.cur === id) return;
  MUSIC.cur = id; MUSIC.step = 0; MUSIC.mel = id ? melSteps(TRACKS[id]) : [];
  if (AC) MUSIC.next = AC.currentTime + .15;
  if (!MUSIC.timer) MUSIC.timer = setInterval(musicTick, 90);
}
/* qué tema corresponde a cada momento */
function wantedMusic(){
  if (MUSIC.force) return MUSIC.force;
  if (G.mode === 'battle') return !B ? 'battle' : B.kind === 'final' ? 'anual' : B.kind === 'boss' ? 'special' : 'battle';
  // "Campo abierto": de día la versión alegre; desde las 16:30 (cuando la luz se pone dorada), la de la tarde
  if (G.mode === 'world' && S && S.clock && gameMin() < 16 * 60 + 30) return 'day';
  return 'world';
}
/* los momentos especiales (ascensos y el final) suenan con su tema mientras duran */
function specialMusic(fn, id = 'special'){ return async (...a) => { MUSIC.force = id; try { return await fn(...a); } finally { MUSIC.force = null; } }; }
/* Lu canta: una frase cortita con vibrato */
SFX.sing = () => {
  if (muted || !AC) return;
  try {
    const seq = [[72, 1], [74, 1], [76, 2], [74, 1], [72, 1], [79, 2]], t0 = AC.currentTime + .05;
    let t = t0;
    for (const [n, d] of seq){
      const o = AC.createOscillator(), g = AC.createGain(), lfo = AC.createOscillator(), lg = AC.createGain();
      o.type = 'triangle'; o.frequency.value = NOTE(n); lfo.frequency.value = 6; lg.gain.value = 5;
      lfo.connect(lg).connect(o.frequency);
      const dd = d * .13; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.06, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dd + .05);
      o.connect(g).connect(AC.destination); o.start(t); lfo.start(t); o.stop(t + dd + .08); lfo.stop(t + dd + .08); t += dd;
    }
  } catch(e){}
};
