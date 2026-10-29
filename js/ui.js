/* Diálogos, listas, menús, paneles y textos según género */
"use strict";
/* ================= DIÁLOGOS Y MENÚS ================= */
const PEOPLE = {fede:'Fede', sahi:'Sahi', lu:'Lu', pimi:'Pimi', reni:'Reni', agus:'Agus', lia:'Lía', sofi:'Sofi', tato:'Tato', alejo:'Alejo', giuli:'Giuli', marga:'Marga', anual:'El Cliente del Año', logo:'Don Logo', explote:'Clienta Explosiva', fantasma:'Clienta Fantasma'};
/* Retratos: se agrandan 4 veces con píxeles exactos y el navegador los achica suave al tamaño de la caja.
   Escalados directo a un tamaño no entero (1,5x en el celular) se perdían rayas finas, como las de la camisa de Alejo. */
const CRISP = {}, CRISP_OK = {};
const crispNow = src => (CRISP_ON && CRISP_OK[src]) || src;
function crispSrc(src){
  if (CRISP[src]) return CRISP[src];
  return CRISP[src] = new Promise(res => { const im = new Image(); im.onload = () => {
    try { const k = 4, c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, 0, 0, c.width, c.height); res(CRISP_OK[src] = c.toDataURL()); }
    catch(e){ res(src); } }; im.onerror = () => res(src); im.src = src; });
}
const CRISP_ON = (() => { try { return matchMedia('(pointer: coarse)').matches; } catch(e){ return false; } })(); // solo en el celular; en la compu, como siempre
/* cambia la imagen sin que se vea un instante la anterior: hasta que la nueva está lista, el retrato queda oculto */
function setPic(img, url){
  if (img.getAttribute('src') === url){ img.style.visibility = ''; return; }
  img.style.visibility = 'hidden';
  img.onload = img.onerror = () => { if (img.getAttribute('src') === url) img.style.visibility = ''; };
  img.src = url;
  if (img.complete && img.naturalWidth) img.style.visibility = '';
}
function crispPortrait(img, src){
  if (!CRISP_ON){ setPic(img, src); return; }
  img.dataset.want = src;
  if (CRISP_OK[src]){ setPic(img, CRISP_OK[src]); return; }
  setPic(img, src);
  crispSrc(src).then(u => { if (img.dataset.want === src && u !== src){ const im = new Image(); im.onload = () => { if (img.dataset.want === src) img.src = u; }; im.src = u; } });
}
/* en la compu, deja decodificados todos los retratos (así el primero de cada uno no tarda) */
const PIC_WARM = [];
setTimeout(() => { if (CRISP_ON) return; try { const all = Object.values(PORTRAITS).concat(typeof PORTRAIT_MOODS !== 'undefined' ? Object.values(PORTRAIT_MOODS).flatMap(m => Object.values(m)) : []);
  all.forEach(u => { const im = new Image(); im.src = u; if (im.decode) im.decode().catch(() => {}); PIC_WARM.push(im); }); } catch(e){} }, 1200);
/* precarga los retratos para que la primera vez ya aparezcan bien */
setTimeout(() => { if (!CRISP_ON) return; try { Object.values(PORTRAITS).forEach(crispSrc); if (typeof PORTRAIT_MOODS !== 'undefined') Object.values(PORTRAIT_MOODS).forEach(m => Object.values(m).forEach(crispSrc)); } catch(e){} }, 1500);
function hideDlg(){ $('dlg').hidden = true; }
/* prepara la caja de diálogo (retrato con expresión y nombre) */
function prepDlg(who, opt){
  const dlg = $('dlg'), pic = $('dlgPic'), nm = $('dlgName');
  dlg.hidden = false; dlg.classList.toggle('battle', G.mode === 'battle');
  const [wk, mood] = (who || '').split(':');
  const src = (mood && typeof PORTRAIT_MOODS !== 'undefined' && PORTRAIT_MOODS[wk] && PORTRAIT_MOODS[wk][mood]) || PORTRAITS[wk];
  if (wk && src){ crispPortrait(pic, src); pic.hidden = false; } else pic.hidden = true;
  nm.textContent = wk ? (PEOPLE[wk] || wk) : (opt.name || '');
  nm.hidden = !nm.textContent;
}
/* si el texto no entra en la caja, se parte en páginas (mejor después de un punto) */
function fitsDlg(text){ const tx = $('dlgText'), body = tx.parentElement; tx.textContent = text; return tx.offsetTop - body.offsetTop + tx.scrollHeight <= body.clientHeight + 1; }
function paginate(text){
  const pages = []; let rest = text.trim();
  for (let guard = 0; rest && guard < 12; guard++){
    if (fitsDlg(rest)){ pages.push(rest); break; }
    const words = rest.split(' '); let best = 1;
    for (let n = 1; n <= words.length; n++){ if (fitsDlg(words.slice(0, n).join(' '))) best = n; else break; }
    let cut = best; for (let n = best; n > Math.max(1, best - 14); n--){ if (/[.!?…♪:]["”]?$/.test(words[n-1])){ cut = n; break; } }
    pages.push(words.slice(0, cut).join(' ')); rest = words.slice(cut).join(' ');
  }
  return pages.length ? pages : [text];
}
async function say(text, who=null, opt={}){
  prepDlg(who, opt);
  const pages = paginate(fmt(text));
  for (const pg of pages) await sayPage(pg, opt);
}
/* Tiempo para leer: los mensajes que pasan solos (los del combate) se quedan en pantalla según lo largo que son,
   nunca menos de lo que pide quien los llama. Con A se pueden pasar antes. */
const readMs = (text, min) => Math.max(min || 0, 500 + text.length * 45);
function sayPage(text, opt){
  return new Promise(res => {
    const dlg = $('dlg'), tx = $('dlgText'), more = $('dlgMore');
    let i = 0, typing = true, fin = false, autoT = null, shownAt = 0;
    const t0 = performance.now();
    // lo que todavía no se escribió ya ocupa su lugar (invisible): así ninguna palabra arranca en un renglón
    // y salta al siguiente a mitad de escribirse
    const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const show = n => { tx.innerHTML = esc(text.slice(0, n)) + '<span class="ghost">' + esc(text.slice(n)) + '</span>'; };
    show(0); more.hidden = true;
    const tick = setInterval(() => {
      i += 2; show(i); if (i % 6 === 0) SFX.blip();
      if (i >= text.length) finish();
    }, 22);
    function finish(){ if (!typing) return; typing = false; shownAt = performance.now(); clearInterval(tick); tx.textContent = text; more.hidden = !!opt.auto; if (opt.auto) autoT = setTimeout(done, readMs(text, opt.auto)); }
    function done(){ if (fin) return; fin = true; clearTimeout(autoT); clearInterval(tick); popH(h); dlg.onclick = null; more.hidden = true; res(); }
    // un toque que llega pegado al anterior no se come una página entera: al abrirse la página y al terminar de
    // escribirse hay un instante en el que A no la pasa
    const h = b => {
      if (b !== 'a' && b !== 'b') return;
      const now = performance.now();
      if (now - t0 < 220) return;
      if (typing){ finish(); return; }
      if (now - shownAt < 200) return;
      SFX.sel(); done();
    };
    pushH(h);
    dlg.onclick = () => h('a');
  });
}
async function says(lines, who){ for (const l of lines) await say(l, who); }
/* el botón que abrió el menú también lo cierra (L la bitácora, R las habilidades, START la pausa) */
let CLOSE_BTN = null;
function listWidget(el, items, {cols=1, cancel=-1, start=0, render, onMove}={}){
  return new Promise(res => {
    let sel = clamp(start, 0, items.length-1);
    const draw = () => {
      el.innerHTML = '';
      items.forEach((it, i) => {
        const d = document.createElement('div');
        d.innerHTML = typeof it === 'string' ? it : it.label;
        if (it.off) d.className = 'off';
        if (it.style) d.style.cssText = it.style;
        if (i === sel) d.classList.add('sel');
        d.onclick = e => { e.stopPropagation(); sel = i; pick(); };
        el.appendChild(d);
      });
      if (render) render(sel);
      if (onMove) onMove(sel);
    };
    const pick = () => { SFX.sel(); popH(h); res(sel); };
    const rows = Math.ceil(items.length / cols);
    const h = b => {
      const r = Math.floor(sel / cols), c = sel % cols;
      if (b === 'up' && r > 0) sel -= cols;
      else if (b === 'down' && sel + cols < items.length) sel += cols;
      else if (b === 'left' && c > 0) sel -= 1;
      else if (b === 'right' && c < cols-1 && sel+1 < items.length) sel += 1;
      else if (b === 'up' && cols === 1) sel = items.length - 1;
      else if (b === 'down' && cols === 1) sel = 0;
      else if (b === 'a'){ pick(); return; }
      else if ((b === 'b' || (CLOSE_BTN && b === CLOSE_BTN)) && cancel !== null){ SFX.sel(); popH(h); res(cancel); return; }
      else return;
      SFX.blip(); draw();
    };
    pushH(h); draw();
  });
}
function fmt(text){
  if (typeof text !== 'string') return text;
  const g = (S && S.gender) || 'x';
  return text.replace(/\{full\}/g, S ? `${roleAt(S.lvl).n} ${S.name}` : '').replace(/\{name\}/g, S ? S.name : '').replace(/\{o\}/g, g === 'm' ? 'o' : g === 'f' ? 'a' : 'e').replace(/\{el\}/g, g === 'm' ? 'el' : g === 'f' ? 'la' : 'le');
}
async function choose(opts, {cancel=-1, tall=false}={}){
  opts = opts.map(fmt);
  const el = $('choice'); el.hidden = false; el.classList.toggle('tall', tall); el.classList.remove('dense');
  const p = listWidget(el, opts, {cancel});
  // si las opciones no entran (textos largos), la letra se achica un poco en vez de cortarse
  if (el.scrollHeight > el.clientHeight + 1) el.classList.add('dense');
  const r = await p;
  el.hidden = true; el.classList.remove('tall', 'dense'); return r;
}
function toast(msg, ms=1600){ const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, ms); }

/* Panel con lista y detalle */
function panelList({title, rows, detail, start=0, hint='Z: elegir · X: volver', extra=''}){
  return new Promise(res => {
    const P = $('panel'), L = $('panelList'), D = $('panelDetail');
    P.hidden = false; $('panelBody').classList.remove('solo'); D.hidden = false;
    $('panelTitle').textContent = title; $('panelExtra').textContent = extra; $('panelHint').textContent = hint;
    let sel = start;
    const draw = () => {
      const rs = rows(); sel = clamp(sel, 0, Math.max(0, rs.length-1));
      const vis = 7, top = clamp(sel - 3, 0, Math.max(0, rs.length - vis));
      L.innerHTML = '';
      rs.slice(top, top+vis).forEach((r, k) => {
        const i = top + k, li = document.createElement('li');
        li.innerHTML = `<span>${r.label}</span><span class="r">${r.right || ''}</span>`;
        if (r.dim) li.classList.add('dim');
        if (i === sel) li.classList.add('sel');
        li.onclick = () => { if (sel === i){ h('a'); } else { sel = i; SFX.blip(); draw(); } };
        L.appendChild(li);
      });
      // los títulos largos van en dos renglones (sin cortar palabras); si así no entran todos, se ocultan
      // los más lejanos al elegido
      for (let g = 0; g < 12 && L.children.length > 1 && L.scrollHeight > L.clientHeight + 1; g++){
        const kids = [...L.children], si = kids.findIndex(li => li.classList.contains('sel'));
        (kids.length - 1 - si >= si ? kids[kids.length - 1] : kids[0]).remove();
      }
      if (!rs.length) L.innerHTML = '<li class="dim"><span>Nada por acá todavía.</span></li>';
      D.innerHTML = rs.length ? detail(sel) : '';
    };
    const h = b => {
      const n = rows().length;
      if (b === 'up' && n){ sel = (sel - 1 + n) % n; SFX.blip(); draw(); }
      else if (b === 'down' && n){ sel = (sel + 1) % n; SFX.blip(); draw(); }
      else if (b === 'a' && n){ SFX.sel(); popH(h); res(sel); }
      else if (b === 'b' || (CLOSE_BTN && b === CLOSE_BTN)){ SFX.sel(); popH(h); res(-1); }
    };
    panelList.redraw = draw;
    pushH(h); draw();
  });
}
function panelInfo(title, html){
  return new Promise(res => {
    const P = $('panel'); P.hidden = false;
    $('panelTitle').textContent = title; $('panelExtra').textContent = ''; $('panelHint').textContent = 'Z o X: volver';
    $('panelBody').classList.add('solo'); $('panelList').innerHTML = ''; $('panelList').style.display = 'none';
    const D = $('panelDetail'); D.hidden = false; D.innerHTML = html;
    const h = b => { if (b === 'a' || b === 'b' || (CLOSE_BTN && b === CLOSE_BTN)){ SFX.sel(); popH(h); $('panelList').style.display = ''; $('panelBody').classList.remove('solo'); res(); } };
    pushH(h);
  });
}
const closePanel = () => { $('panel').hidden = true; $('panelList').style.display = ''; $('panelBody').classList.remove('solo'); };
function skillDetail(id){
  const s = SK[id], mult = id === 'prueba' ? ' (+20 por uso)' : '';
  return `<h4>${s.n}</h4><div>${chip(s.t)}</div><div class="k">Poder: ${s.p || '—'}${mult} · Precisión: ${s.a} · Usos: ${S.pp[id]}/${s.pp}</div><div>${s.d}</div>`;
}
function statsHTML(){
  const st = stats();
  const next = S.lvl < 15 ? 'En el nivel 15 quedás fij{o} y pasás a Social Manager.' : S.lvl < PROJECT_LVL ? 'En el nivel 25 pasás a Project Leader.' : 'Sos Project Leader: ahora también te toca enseñar.';
  return `<div class="stat"><span>Nombre</span><b>${S.name}</b><span>Cargo</span><b>${roleAt(S.lvl).full}</b><span>Nivel</span><b>${S.lvl}</b><span>Energía</span><b>${S.hp}/${st.max}</b>
  <span>Ataque</span><b>${st.atk}</b><span>Defensa</span><b>${st.def}</b><span>Velocidad</span><b>${st.spd}</b>
  <span>Experiencia</span><b>${S.xp}/${need(S.lvl)}</b><span>Clientes</span><b>${S.bosses}/3</b></div><div class="k" style="margin-top:1.2cqw">${fmt(next)}</div>` +
  (S.flags.typesHint ? `<div class="k" style="margin-top:1.2cqw">Recordá: lo creativo destraba la burocracia, la estrategia ordena el caos, lo técnico arregla bugs y la calma desarma la presión.</div>` : '');
}

