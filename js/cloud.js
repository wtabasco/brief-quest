/* Partida guardada en la cuenta de claude.ai (compu y celular) */
"use strict";
/* ================= PARTIDA EN LA NUBE =================
   Dos maneras de guardar la partida de cada persona fuera del navegador, así sigue donde la dejó en la compu o
   en el celular:
   - Web propia (el proyecto publicado en Netlify u otro): Supabase. Cada persona entra con su mail (le llega un
     link para ingresar, sin contraseña). Se activa cuando js/config.js trae la URL y la clave del proyecto.
     Tabla `saves` (user_id, slot, data, saved_at) con seguridad por fila: cada uno ve solo lo suyo.
   - claude.ai: el almacenamiento del artifact (data/users/<id>/slotN), si se abre con sesión iniciada.
   Sin ninguna de las dos, guarda solo en el navegador, como siempre. Al abrir el título se trae lo de la nube:
   gana la partida guardada más reciente de cada espacio (savedAt). */
const CLOUD = {kind: null, ready: false, timers: {}, email: null};
/* ¿se abrió la página desde el link del mail? (hay que mirarlo antes de que Supabase limpie la dirección) */
const LINK_IN = (() => { try { const h = location.hash + '&' + location.search;
  if (/error_code=otp_expired|error=access_denied/.test(h)) return 'expired';
  if (/access_token=|[?&]code=|type=magiclink/.test(h)) return 'ok'; } catch(e){} return null; })();
const SB_CONF = (typeof window !== 'undefined' && window.BQ_SUPABASE && window.BQ_SUPABASE.url && window.BQ_SUPABASE.anonKey) ? window.BQ_SUPABASE : null;
let SB = null;
function supabaseOn(){ if (!SB && SB_CONF && window.supabase && window.supabase.createClient) SB = window.supabase.createClient(SB_CONF.url, SB_CONF.anonKey); return !!SB; }
/* claude.ai (artifact): db + user */
async function claudeBackend(){
  const use = n => (window.claude && window.claude.use) ? window.claude.use(n).catch(() => null) : Promise.resolve(null);
  const [db, user] = await Promise.all([use('db'), use('user')]);
  const uid = user ? await user.id().catch(() => null) : null;
  if (!db || !uid) return null;
  const doc = n => db.collection('data/users/' + uid).doc('slot' + n);
  return {
    async get(n){ const s = await doc(n).get(); return s && s.exists ? s.data() : null; },
    async set(n, raw, savedAt){ await doc(n).set({data: raw, savedAt}); },
    async del(n){ await doc(n).delete(); },
  };
}
/* web propia: Supabase */
async function supabaseBackend(){
  if (!supabaseOn()) return null;
  const {data} = await SB.auth.getSession(); const ses = data && data.session;
  if (!ses) return null;
  const uid = ses.user.id; CLOUD.email = ses.user.email;
  return {
    async get(n){ const {data: r, error} = await SB.from('saves').select('data,saved_at').eq('user_id', uid).eq('slot', n).maybeSingle(); if (error) throw error; return r ? {data: r.data, savedAt: +r.saved_at} : null; },
    async set(n, raw, savedAt){ const {error} = await SB.from('saves').upsert({user_id: uid, slot: n, data: raw, saved_at: savedAt}); if (error) throw error; },
    async del(n){ await SB.from('saves').delete().eq('user_id', uid).eq('slot', n); },
  };
}
function cloudInit(force){
  if (CLOUD.p && !force) return CLOUD.p;
  const timeout = new Promise(r => setTimeout(() => r(null), 6000));
  CLOUD.p = Promise.race([(async () => {
    const be = SB_CONF ? await supabaseBackend().catch(() => null) : await claudeBackend().catch(() => null);
    if (be){ CLOUD.be = be; CLOUD.kind = SB_CONF ? 'supabase' : 'claude'; CLOUD.ready = true; }
    return CLOUD.ready;
  })(), timeout]).then(ok => !!ok);
  return CLOUD.p;
}
/* trae las partidas de la nube y se queda con la más nueva de cada espacio */
async function cloudPull(){
  if (!(await cloudInit())) return false;
  let lastAt = 0, lastN = 0;
  for (let n = 1; n <= SLOTS; n++){
    try {
      const remote = await CLOUD.be.get(n);
      const localRaw = localStorage.getItem(slotKey(n)); const local = localRaw ? JSON.parse(localRaw) : null;
      if (remote && remote.data && (!local || (remote.savedAt || 0) > (local.savedAt || 0))) localStorage.setItem(slotKey(n), remote.data);
      else if (local && (!remote || (local.savedAt || 0) > (remote.savedAt || 0))) cloudPush(n, 0);
      const at = Math.max(remote ? remote.savedAt || 0 : 0, local ? local.savedAt || 0 : 0);
      if (at > lastAt){ lastAt = at; lastN = n; }
    } catch(e){}
  }
  try { if (lastN) localStorage.setItem('briefquest.lastSlot', String(lastN)); } catch(e){}
  return true;
}
/* sube un espacio (con una pausita, para no escribir en cada paso) */
function cloudPush(n = SLOT, wait = 2500){
  if (!CLOUD.ready) return;
  clearTimeout(CLOUD.timers[n]);
  CLOUD.timers[n] = setTimeout(async () => {
    try {
      const raw = localStorage.getItem(slotKey(n)); if (!raw || raw.length > 240000) return;
      await CLOUD.be.set(n, raw, JSON.parse(raw).savedAt || Date.now());
    } catch(e){}
  }, wait);
}
async function cloudErase(n){ if (!CLOUD.ready) return; try { await CLOUD.be.del(n); } catch(e){} }

/* ---- entrar con el mail (solo en la web propia, con Supabase) ---- */
function askText(label, {type = 'text', max = 80, placeholder = ''} = {}){
  const box = $('tName'), inp = $('nameIn'), lab = box.querySelector('label');
  const prev = {label: lab.textContent, type: inp.type, max: inp.maxLength, ph: inp.placeholder};
  lab.textContent = label; inp.type = type; inp.maxLength = max; inp.placeholder = placeholder; inp.value = '';
  box.hidden = false; setTimeout(() => { try { inp.focus(); } catch(e){} }, 50);
  return new Promise(res => {
    const done = v => { popH(h); inp.blur(); box.hidden = true; lab.textContent = prev.label; inp.type = prev.type; inp.maxLength = prev.max; inp.placeholder = prev.ph; res(v); };
    const h = b => { if (b === 'b') done(null); };
    pushH(h);
    $('nameOk').onclick = () => done(inp.value.trim());
    inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter'){ e.preventDefault(); done(inp.value.trim()); } if (e.key === 'Escape') done(null); };
  });
}
const escHtml = t => String(t).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
function tNote(html){ const n = $('tNote'); if (!n) return; n.innerHTML = html || ''; n.hidden = !html; }
const okMail = m => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m);
/* manda el link y explica qué hacer; devuelve 'play' (seguir jugando) u 'other' (usar otro mail) */
async function sendLink(menuEl, sub, mail){
  for (;;){
    sub.textContent = 'Enviando...'; menuEl.innerHTML = ''; tNote('');
    let error = null;
    try { ({error} = await SB.auth.signInWithOtp({email: mail, options: {emailRedirectTo: location.origin + location.pathname}})); } catch(e){ error = e; }
    if (error) sub.textContent = /rate|second|security/i.test(error.message || '') ? 'Esperá un minutito antes de pedir otro link.' : 'No se pudo enviar el mail. Probá en un rato.';
    else sub.textContent = '¡Te mandamos un link!';
    tNote(`Abrí el mail en <b>${escHtml(mail)}</b> y tocá el link <b>donde vas a jugar</b> (compu o celular). ¿No llega? Mirá en spam. Si se abre dentro de Gmail, elegí "Abrir en el navegador".`);
    const r = await listWidget(menuEl, ['Jugar mientras tanto', 'Reenviar el link', 'Usar otro mail'], {cancel: 0});
    tNote('');
    if (r === 1) continue;
    return r === 2 ? 'other' : 'play';
  }
}
/* pantalla de cuenta en el título: entrar con el mail o jugar sin cuenta (asked: lo pidió desde "Entrar con mi mail") */
async function cloudAccount(menuEl, sub, asked){
  if (!SB_CONF || !supabaseOn()) return;
  if (await cloudInit()){
    if (LINK_IN === 'ok' && !cloudAccount.greeted){ cloudAccount.greeted = true;
      menuEl.innerHTML = ''; sub.textContent = '¡Listo, entraste!';
      tNote(`Entraste como <b>${escHtml(CLOUD.email || '')}</b>. Tu partida se guarda en tu cuenta: la seguís en la compu o en el celular entrando con el mismo mail.`);
      await listWidget(menuEl, ['¡Vamos!'], {cancel: 0}); tNote(''); }
    return;
  }
  let skip = false; try { skip = localStorage.getItem('briefquest.sinCuenta') === '1'; } catch(e){}
  const expired = LINK_IN === 'expired' && !cloudAccount.warned;
  if (skip && !asked && !expired) return;
  cloudAccount.warned = true;
  let first = true;
  for (;;){
    menuEl.innerHTML = '';
    if (first && expired){ sub.textContent = 'Ese link ya se usó o venció'; tNote('Cada link sirve una sola vez y dura un rato. Pedí uno nuevo y abrilo apenas te llegue.'); }
    else { sub.textContent = 'Entrá con tu mail para seguir tu partida en la compu o en el celular'; tNote('Sin contraseña: te mandamos un link al mail y con eso entrás.'); }
    first = false;
    const c = await listWidget(menuEl, ['Entrar con mi mail', 'Jugar sin cuenta'], {cancel: 1});
    tNote('');
    if (c !== 0){ try { localStorage.setItem('briefquest.sinCuenta', '1'); } catch(e){} return; }
    for (;;){
      menuEl.innerHTML = '';
      const mail = await askText('Tu mail', {type: 'email', placeholder: 'nombre@agencia.com'});
      if (!mail) break;
      if (!okMail(mail)){ sub.textContent = 'Ese mail no parece completo. Probá de nuevo.'; await sleepMs(1600); continue; }
      if (await sendLink(menuEl, sub, mail) === 'play') return;
    }
  }
}
async function cloudLogout(){ if (CLOUD.kind === 'supabase' && SB){ await SB.auth.signOut(); CLOUD.ready = false; CLOUD.p = null; CLOUD.be = null; CLOUD.email = null; try { localStorage.removeItem('briefquest.sinCuenta'); } catch(e){} } }
cloudInit();
