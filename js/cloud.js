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
/* pantalla de cuenta en el título: entrar con el mail o jugar sin cuenta */
async function cloudAccount(menuEl, sub){
  if (!SB_CONF || !supabaseOn()) return;
  if (await cloudInit()) return; // ya hay sesión
  let skip = false; try { skip = localStorage.getItem('briefquest.sinCuenta') === '1'; } catch(e){}
  if (skip) return;
  for (;;){
    menuEl.innerHTML = ''; sub.textContent = 'Entrá con tu mail para seguir tu partida en la compu o en el celular';
    const c = await listWidget(menuEl, ['Entrar con mi mail', 'Jugar sin cuenta'], {cancel: 1});
    if (c !== 0){ try { localStorage.setItem('briefquest.sinCuenta', '1'); } catch(e){} return; }
    menuEl.innerHTML = '';
    const mail = await askText('Tu mail', {type: 'email', placeholder: 'nombre@agencia.com'});
    if (!mail) continue;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)){ sub.textContent = 'Ese mail no parece completo. Probá de nuevo.'; await sleepMs(1600); continue; }
    sub.textContent = 'Enviando...';
    const {error} = await SB.auth.signInWithOtp({email: mail, options: {emailRedirectTo: location.origin + location.pathname}});
    if (error){ sub.textContent = 'No se pudo enviar el mail. Probá en un rato.'; await sleepMs(2000); continue; }
    sub.textContent = `Listo: te mandamos un link a ${mail}. Abrilo en este mismo dispositivo y volvés acá con tu partida.`;
    await listWidget(menuEl, ['Jugar mientras tanto'], {cancel: 0});
    return;
  }
}
async function cloudLogout(){ if (CLOUD.kind === 'supabase' && SB){ await SB.auth.signOut(); CLOUD.ready = false; CLOUD.p = null; CLOUD.be = null; CLOUD.email = null; try { localStorage.removeItem('briefquest.sinCuenta'); } catch(e){} } }
cloudInit();
