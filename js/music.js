/* Música de fondo: temas originales con osciladores */
"use strict";
/* ================= MÚSICA DE FONDO =================
   Temas originales hechos con osciladores (WebAudio), bajitos y con filtro para que no cansen.
   Arranca con la primera tecla o toque (los navegadores no dejan sonar antes) y se apaga con SELECT.
   Cada tema: tempo, compases de 8 corcheas, acordes, melodía [nota, duración en corcheas] y estilo de bajo, batería y arpegio.
   Todo en tonalidad mayor y con acordes mayores: alegre en la agencia y con más acción (pero siempre positivo) en los desafíos. */
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
const _ = null;
/* acordes (tríadas) para no escribir números a mano */
const CH = {C: [60, 64, 67], D: [62, 66, 69], E: [59, 64, 68], F: [60, 65, 69], G: [59, 62, 67], A: [61, 64, 69], Ab: [60, 63, 68], Bb: [58, 62, 65],
  Dd: [62, 66, 69], Ad: [61, 64, 69], Gd: [62, 67, 71], Cd: [60, 64, 67], Ed: [64, 68, 71]};
const TRACKS = {
  // "Buen día, agencia": do mayor, alegre y saltarín. Solo acordes mayores (con algún préstamo luminoso: re y mi mayor)
  world: {bpm: 112, swing: .08, vol: 1,
    chords: ['C', 'F', 'G', 'C', 'C', 'F', 'D', 'G', 'F', 'G', 'E', 'A', 'D', 'G', 'C', 'C'].map(k => CH[k]),
    mel: [[72, 1], [_, 1], [72, 1], [74, 1], [76, 2], [79, 2],   [77, 2], [76, 1], [74, 1], [72, 2], [69, 2],
          [71, 1], [74, 1], [79, 2], [77, 1], [76, 1], [74, 2],   [76, 3], [72, 1], [67, 4],
          [72, 1], [_, 1], [72, 1], [74, 1], [76, 2], [79, 2],   [81, 2], [79, 1], [77, 1], [76, 2], [72, 2],
          [74, 1], [78, 1], [81, 2], [78, 1], [76, 1], [74, 2],   [79, 4], [_, 2], [74, 1], [76, 1],
          [77, 2], [77, 1], [76, 1], [77, 2], [81, 2],            [79, 2], [79, 1], [77, 1], [79, 2], [83, 2],
          [80, 2], [76, 1], [80, 1], [83, 2], [80, 2],            [81, 3], [76, 1], [73, 2], [76, 2],
          [78, 2], [81, 1], [78, 1], [74, 2], [78, 2],            [79, 1], [81, 1], [83, 2], [86, 2], [83, 2],
          [84, 3], [79, 1], [76, 2], [79, 2],                     [72, 4], [_, 4]],
    bass: 'bounce', drums: 'pop', lead: 'square', leadVol: .045, arp: 'pluck', pad: .010},
  // "¡A resolver!": re mayor, rápido y con empuje, como una aventura. Siempre mayor: re, la, sol, do, mi
  battle: {bpm: 150, swing: 0, vol: 1, melShift: -12,
    chords: ['Dd', 'Ad', 'Gd', 'Ad', 'Dd', 'Cd', 'Gd', 'Ad', 'Gd', 'Ad', 'Dd', 'Dd', 'Gd', 'Ad', 'Ed', 'Ad'].map(k => CH[k]),
    mel: [[74, 1], [74, 1], [78, 1], [74, 1], [81, 2], [78, 2],   [76, 1], [76, 1], [73, 1], [76, 1], [81, 2], [76, 2],
          [74, 1], [79, 1], [83, 2], [81, 1], [79, 1], [78, 2],   [76, 3], [78, 1], [76, 2], [73, 2],
          [74, 1], [74, 1], [78, 1], [81, 1], [86, 2], [81, 2],   [79, 1], [79, 1], [76, 1], [79, 1], [84, 2], [79, 2],
          [83, 2], [81, 1], [79, 1], [78, 2], [79, 2],            [81, 4], [_, 2], [76, 1], [78, 1],
          [79, 2], [79, 1], [81, 1], [83, 2], [79, 2],            [81, 2], [81, 1], [83, 1], [85, 2], [81, 2],
          [86, 3], [85, 1], [83, 2], [81, 2],                     [78, 1], [81, 1], [86, 2], [_, 2], [81, 1], [83, 1],
          [83, 2], [86, 1], [83, 1], [79, 2], [83, 2],            [85, 2], [88, 1], [85, 1], [81, 2], [85, 2],
          [83, 2], [80, 1], [83, 1], [88, 2], [83, 2],            [85, 3], [83, 1], [81, 2], [_, 2]],
    bass: 'gallop', drums: 'action', lead: 'square', leadVol: .05, arp: 'fast', pad: .008},
  // "La terraza": el tema de la agencia, más lento, sin batería y con un sonido más suave
  terrace: {base: 'world', bpm: 88, drums: 'none', lead: 'triangle', leadVol: .06, arp: 'soft', swing: .1},
};
for (const k in TRACKS){ const t = TRACKS[k]; if (t.base) TRACKS[k] = Object.assign({}, TRACKS[t.base], t); }
const MUSIC = {cur: null, step: 0, next: 0, mel: [], bus: null, timer: null};
function musicBus(){
  if (MUSIC.bus || !AC) return MUSIC.bus;
  const g = AC.createGain(); g.gain.value = .62;
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = .3;
  g.connect(lp).connect(AC.destination); MUSIC.bus = g; return g;
}
function mNote(f, t, d, type, v, att = .01){
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(musicBus()); o.start(t); o.stop(t + d + .05);
}
let NOISE = null;
function mNoise(t, d, v, hp){
  if (!NOISE){ NOISE = AC.createBuffer(1, AC.sampleRate * .3, AC.sampleRate); const ch = NOISE.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random()*2 - 1; }
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = NOISE; f.type = 'highpass'; f.frequency.value = hp;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  s.connect(f).connect(g).connect(musicBus()); s.start(t); s.stop(t + d + .02);
}
function mKick(t, v){ const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .16); o.connect(g).connect(musicBus()); o.start(t); o.stop(t + .2); }
/* la melodía se pasa a una lista de pasos: en qué corchea empieza cada nota y cuánto dura */
function melSteps(tr){ const out = []; let s = 0; for (const [n, d] of tr.mel){ if (n) out[s] = [n + (tr.melShift || 0), d]; s += d; } out.length = Math.max(out.length, tr.chords.length * 8); return out; }
function scheduleStep(tr, step, t, e){
  const bar = Math.floor(step / 8) % tr.chords.length, i = step % 8, ch = tr.chords[bar];
  // melodía (con un eco suave una octava abajo, que la hace más llena)
  const m = MUSIC.mel[step]; if (m){ mNote(NOTE(m[0]), t, m[1] * e * .92, tr.lead, tr.leadVol, .01); mNote(NOTE(m[0] - 12), t, m[1] * e * .8, 'triangle', tr.leadVol * .45, .01); }
  // colchón: el acorde entero, bajito, al empezar cada compás
  if (i === 0 && tr.pad) for (const n of ch) mNote(NOTE(n), t, e * 7.5, 'triangle', tr.pad, .08);
  // arpegios
  const up = [0, 1, 2, 1, 0, 2, 1, 2];
  if (tr.arp === 'pluck') mNote(NOTE(ch[up[i]] + 12), t, e * 1.1, 'triangle', .026);
  else if (tr.arp === 'fast'){ mNote(NOTE(ch[up[i]] + 12), t, e * .5, 'square', .012); mNote(NOTE(ch[up[(i + 2) % 8]] + 24), t + e / 2, e * .45, 'square', .009); }
  else if (tr.arp === 'soft') mNote(NOTE(ch[[0, 1, 2, 1][i % 4]] + 12), t, e * 1.8, 'triangle', .02);
  // bajo
  const root = NOTE(ch[0] - 24), fifth = NOTE(ch[2] - 24);
  if (tr.bass === 'bounce'){ if (i === 0) mNote(root, t, e * 1.4, 'triangle', .09); if (i === 2) mNote(fifth, t, e * .9, 'triangle', .065); if (i === 3) mNote(root * 2, t, e * .9, 'triangle', .06);
    if (i === 4) mNote(root, t, e * 1.4, 'triangle', .085); if (i === 6) mNote(fifth, t, e * .9, 'triangle', .065); if (i === 7) mNote(root * 2, t, e * .8, 'triangle', .055); }
  else if (tr.bass === 'gallop'){ mNote(i % 2 ? root * 2 : root, t, e * .85, 'triangle', .09); if (i === 7) mNote(fifth * 2, t + e / 2, e * .4, 'triangle', .06); }
  // batería
  if (tr.drums === 'pop'){ if (i === 0 || i === 4) mKick(t, .1); if (i === 7) mKick(t, .05);
    if (i === 2 || i === 6){ mNoise(t, .07, .03, 1500); mNoise(t + .012, .05, .015, 2500); }
    mNoise(t, .025, i % 2 ? .014 : .009, 8000); if (i === 7) mNoise(t, .12, .012, 6000); }
  else if (tr.drums === 'action'){ if (i % 2 === 0) mKick(t, .12);
    if (i === 2 || i === 6) mNoise(t, .09, .045, 1600);
    mNoise(t, .02, .016, 8500); mNoise(t + e / 2, .018, .01, 9000);
    if (i === 0 && bar % 4 === 0) mNoise(t, .5, .03, 4500);
    if (i === 7 && bar % 4 === 3){ mNoise(t, .06, .03, 1400); mNoise(t + e / 2, .06, .035, 1200); } }
}
function musicTick(){
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
  if (G.mode === 'battle') return 'battle';
  if (G.mode === 'world' && CURMAP && CURMAP.id === 'terrace') return 'terrace';
  return 'world';
}
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
