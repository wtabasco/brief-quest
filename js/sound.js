/* Efectos de sonido (WebAudio) */
"use strict";
/* ================= SONIDO ================= */
let AC = null, muted = false;
function unlockAudio(){ if (!AC){ try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} } if (AC && AC.state === 'suspended') AC.resume().catch(()=>{}); }
function tone(f, d=.08, type='square', v=.04, delay=0){
  if (muted || !AC) return;
  try{
    const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .03);
  }catch(e){}
}
const SFX = {
  sel(){ tone(880,.05) }, blip(){ tone(520,.025,'square',.012) }, bump(){ tone(110,.06,'square',.03) },
  hit(){ tone(160,.12,'sawtooth',.07); tone(80,.16,'square',.05,.03) },
  up(){ [523,659,784,1046].forEach((f,i)=>tone(f,.12,'square',.045,i*.09)) },
  enc(){ [392,370,349,330,392,523,659].forEach((f,i)=>tone(f,.07,'square',.045,i*.06)) },
  heal(){ [523,784,1046].forEach((f,i)=>tone(f,.1,'triangle',.07,i*.08)) },
  learn(){ [659,784,988,1318].forEach((f,i)=>tone(f,.1,'triangle',.07,i*.1)) },
  faint(){ [400,300,200,120].forEach((f,i)=>tone(f,.1,'square',.04,i*.08)) },
  win(){ [523,523,523,659,784].forEach((f,i)=>tone(f,.1,'square',.045,i*.1)) },
};

