/* Memoria, contexto y conversaciones de cada personaje */
"use strict";
/* ================= MEMORIA Y CONTEXTO DE LOS PERSONAJES ================= */
function mem(){
  if (!S.mem) S.mem = {bags: {}, last: {}, talks: {}, lastTalk: {}, ack: {}, stats: {wins: 0, losses: 0, runs: 0, streak: 0}, evc: 0, lvlSeen: {}};
  return S.mem;
}
function noteTalk(id){ if (!S) return; const m = mem(); m.talks[id] = (m.talks[id] || 0) + 1; m.lastTalk[id] = Date.now(); m.lvlSeen[id] = S.lvl; }
function logEvent(type, data = {}){
  const m = mem(), ev = Object.assign({id: ++m.evc, type, at: Date.now()}, data);
  m.lastEv = ev;
  if (type === 'win'){ m.stats.wins++; m.stats.streak = Math.max(0, m.stats.streak) + 1; m.lastWin = ev; }
  if (type === 'lose'){ m.stats.losses++; m.stats.streak = 0; m.lastLose = ev; }
  if (type === 'run'){ m.stats.runs++; m.lastRun = ev; }
  if (type === 'boss'){ m.lastBoss = ev; }
}
/* Elige una frase sin repetir hasta agotar el repertorio. Acepta textos, funciones o {t, if, pri, d}.
   d es la profundidad: la frase recién aparece después de esa cantidad de charlas con el personaje. Así cada uno se va
   descubriendo de a poco: lo que se acaba de destrabar se cuenta primero (de a una por charla) y después se mezcla. */
const talksFor = who => (who === 'agus' || who === 'lia' || who === 'founders') ? talks('agus') + talks('lia') : (who === 'alejo' || who === 'giuli' || who === 'duo') ? talks('alejo') + talks('giuli') : talks(who);
function pick(bagId, lines){
  const m = mem(), depth = talksFor(bagId.split(':')[0]);
  const ok = i => { const l = lines[i]; if (!(l && typeof l === 'object')) return true; if (l.if && !l.if()) return false; return !(l.d && depth < l.d); };
  const avail = lines.map((_, i) => i).filter(ok);
  if (!avail.length) return null;
  let bag = (m.bags[bagId] || []).filter(i => avail.includes(i));
  if (!bag.length){
    bag = avail.slice().sort(() => Math.random() - .5);
    if (bag.length > 1 && bag[0] === m.last[bagId]) bag.push(bag.shift());
  }
  m.seenL = m.seenL || {}; const seen = m.seenL[bagId] = m.seenL[bagId] || [];
  // primero lo que depende del momento; después, algo nuevo del personaje que todavía no te contó
  const pri = avail.find(i => lines[i] && typeof lines[i] === 'object' && lines[i].pri && bag.includes(i));
  const fresh = avail.filter(i => lines[i] && typeof lines[i] === 'object' && lines[i].d && !seen.includes(i)).sort((a, b) => lines[a].d - lines[b].d || a - b)[0];
  const i = pri != null ? pri : fresh != null ? fresh : bag[0];
  bag = bag.filter(j => j !== i);
  if (!seen.includes(i)) seen.push(i);
  m.bags[bagId] = bag; m.last[bagId] = i;
  let l = lines[i]; if (l && typeof l === 'object') l = l.t;
  return typeof l === 'function' ? l() : l;
}
/* la hora del reloj del juego (ver clock.js): mañana hasta las 13, tarde hasta las 19, después noche */
const tod = () => { const m = gameMin(); return m < 13*60 ? 'mañana' : m < 19*60 ? 'tarde' : 'noche'; };
const saludo = () => ({madrugada: '¡Qué tarde para andar despiert{o}', mañana: '¡Buen día', tarde: '¡Buenas tardes', noche: '¡Buenas noches'})[tod()];
const hpPct = () => S.hp / stats().max;
const sinceTalk = id => Date.now() - (mem().lastTalk[id] || 0);
const talks = id => mem().talks[id] || 0;
const fresh = (id, ev) => !!ev && mem().ack[id + ':' + ev.type] !== ev.id && Date.now() - ev.at < 20 * 60e3;
const ack = (id, ev) => { if (ev) mem().ack[id + ':' + ev.type] = ev.id; };
const seenCount = () => Object.keys(EN).concat(BOSS_ORDER, ['final']).filter(k => S.log[k]).length;
/* Reacción a lo último que te pasó. Devuelve una frase o null y la marca como comentada. */
function reaction(id, R){
  const m = mem();
  if (R.lowhp && hpPct() < .35 && pickChance(id + 'hp', .85)) return pick(id + ':lowhp', R.lowhp);
  if (R.lose && fresh(id, m.lastLose)){
    ack(id, m.lastLose);
    if (m.lastLose.kind === 'spar' && m.lastLose.foe !== id) return null;
    if (R.loseP != null && Math.random() > R.loseP) return null;
    // si te ganó quien está hablando, habla en primera persona (nunca "perder contra Fede" dicho por Fede)
    if (m.lastLose.foe === id) return R.loseMe ? pick(id + ':loseMe', R.loseMe) : null;
    return pick(id + ':lose', R.lose.map(f => () => f(m.lastLose.name, m.lastLose.foe)));
  }
  if (R.boss && fresh(id, m.lastBoss)){ ack(id, m.lastBoss); const f = R.boss[m.lastBoss.foe]; return typeof f === 'function' ? f() : f; }
  if (R.run && fresh(id, m.lastRun) && Math.random() < .6){ ack(id, m.lastRun); return pick(id + ':run', R.run.map(f => () => f(m.lastRun.name))); }
  if (R.streak && m.stats.streak >= 3 && fresh(id, m.lastWin) && Math.random() < .5){ ack(id, m.lastWin); return pick(id + ':streak', R.streak); }
  if (R.level && (m.lvlSeen[id] ?? S.lvl) < S.lvl){ return pick(id + ':level', R.level); }
  return null;
}
const pickChance = (k, p) => Math.random() < p;
async function opener(id, who, again){
  const n = talks(id), since = sinceTalk(id);
  if (n > 0 && since < 30000 && again) return say(pick(id + ':again', again), who);
  if (n > 0 && since > 4 * 3600e3) return say(`${saludo()}, {name}! Hacía rato que no pasabas.`, who);
}

/* ================= FEDE =================
   Director de la agencia: sabio, con mucho oficio, mentor exigente (siempre te pide un poco más). Con él se
   entrena: nunca se habla de "ganarle". Su manía es el mate: lo pide todo el tiempo y explica casi todo con el
   mate (el agua, la bombilla, la ronda). Habla de aprender siempre, de cuidar los procesos y de proponer. */
const FEDE = {
  again: ['¿Volviste? Bien. Hoy te voy a pedir un poco más que la última vez.', '¿Volviste? Eso me gusta. Insistir es la mitad del laburo.', '¿Volviste? Si traés mate, mejor. Si no, también. Bueno, mejor con mate.', '¿Qué traés hoy? Contame algo que hayas probado.', 'Si venís seguido es porque algo te quedó picando. ¡Bien!', '¡Otra vez por acá! ¿Qué aprendiste desde la última?'],
  R: {
    lowhp: ['Estás con poca energía. Pasá por lo de Lu antes de seguir, ¿dale?', 'Antes de entrenar, recargá. Se aprende mejor descansado.'],
    // Fede comenta las derrotas solo a veces, y siempre desde lo que se aprende
    loseP: .45,
    loseMe: ['¿Qué te llevás del entrenamiento? Con eso ya alcanza.', 'El segundo turno estuvo bueno. Esa idea, guardala.', 'Probaste cosas distintas. Eso es lo que quiero ver.'],
    lose: [f => `¿Qué aprendiste de ${f}? Si me lo sabés explicar, ya valió la pena.`, f => `${f} tiene sus mañas. Ahora ya las conocés.`, f => `Contame cómo te atacó ${f}. Ahí está la pista para la próxima.`],
    boss: {explote: '¡Destrabaste a la Clienta Explosiva! ¿Viste que el caos se ordena?', logo: '¿Don Logo aprobó? Contame cómo lo convenciste, que quiero aprender.', fantasma: '¡La Clienta Fantasma respondió! Eso es casi un milagro.'},
    run: [f => `Te vi salir de lo de ${f}. Elegir cuándo ir es parte del laburo.`],
    streak: ['Te veo suelt{o}. ¿Probaste algo nuevo hoy o vas con lo de siempre?', 'Venís bien. Ahora quiero lo mismo, pero en menos turnos.', 'Buena racha. No te relajes: la vara sube.'],
    level: [() => `¡Nivel ${S.lvl}! Se nota en cómo te movés.`, () => `Nivel ${S.lvl}. ¿Te diste cuenta de qué cambió?`],
  },
  tips: [
    'Si algo no funciona, cambiá de enfoque. Lo creativo destraba la burocracia.', 'No te enamores del resultado. Enamorate del proceso.',
    'Tené habilidades de tipos distintos activas. Nunca sabés con qué te cruzás.', 'Hacer y equivocarse enseña más que pensar y no hacer.',
    'Un brief claro te ahorra tres reuniones.', 'Cuando dudes, probá. Lo peor que puede pasar es que aprendas algo.',
    'Fijate el tipo del problema antes de encararlo. Cambia todo.', 'La primera idea casi nunca es la mejor. Pero sin la primera no llegás a la tercera.',
    'Preguntá "¿para qué?" antes de preguntar "¿para cuándo?".', 'Mostrá el trabajo a medio hacer. El feedback temprano sale barato.',
    'Anotá lo que te salió bien. Lo que sale bien también se olvida.', 'Si un problema se repite, no es mala suerte: es un patrón.',
    'Escuchá al que piensa distinto. Ahí suele estar lo que te falta.', 'Pedir ayuda no es debilidad. Es aprender más rápido.',
    'Los mejores proyectos tuvieron una versión horrible antes. Dejala existir.', 'Copiá menos referencias y mirá más la calle.',
    {if: () => !S.skills.includes('prueba'), pri: true, t: 'Todavía no te enseñé "Prueba y error". Entrenemos y te la paso.'},
    {if: () => S.bosses === 0, t: 'La primera es la Clienta Fantasma. Pide cosas que no explica y te va a presionar: llevate algo de calma.'},
    {if: () => S.bosses === 1, t: 'Don Logo es pura burocracia. Lo creativo lo desarma.'},
    {if: () => S.bosses === 2, t: 'Para la Clienta Explosiva, estrategia. El caos es su arma.'},
    {if: () => tod() === 'mañana', t: 'Las mañanas son para lo difícil. Arrancá por lo que más te cuesta.'},
    {if: () => tod() === 'noche' || tod() === 'madrugada', t: '¿Todavía acá? Lo que no sale hoy, mañana sale mejor. Andá a descansar.'},
    {d: 1, t: 'Sahi me dijo que aprendés rápido. Viniendo de él es un elogio enorme.'},
    {d: 2, t: 'En todos estos años vi pasar cientos de briefs. Los que salieron bien tenían algo en común: alguien que escuchó primero.'},
    {d: 3, t: 'Lo aprendí a los golpes: la mejor idea no siempre sale. Sale la que está mejor contada.'},
    {d: 3, t: 'Bien no alcanza. Quiero que se entienda, que se recuerde y que llegue a tiempo.'},
    'Un "cambio chiquito" nunca es chiquito. Antes de decir que sí, preguntá qué cambia y para qué.',
    'Si una reunión puede ser un mail, mandá el mail. Y si un mail puede ser una charla de dos minutos, levantate y andá.',
    'El brief llegó tarde. Ya está. Lo que no puede llegar tarde son tus preguntas: hacelas hoy.',
    'Los procesos están para cuidarnos. Seguilos. Y si encontrás uno mejor, proponelo. Las dos cosas.',
    {d: 2, t: 'Mostrame la versión dos. La uno ya sé que la podías hacer.'},
    {if: () => statusToday(), t: 'Vi tu status en el pizarrón. Gracias por ponerlo: con transparencia es más fácil acompañarte.'},
    'Si algo no sale, decímelo temprano. Con transparencia todo se arregla más rápido.',
    'Aprender no termina nunca. El día que creas que ya sabés, entrená el doble.',
    'La experiencia no es no equivocarse. Es equivocarse más rápido y con menos drama.',
    {d: 4, t: 'Las agencias que duran cuidan a su gente. El resto es decoración.'},
    {d: 5, t: 'Sofi cuida la casa y Tato cuida los números. Nosotros cuidamos las ideas. Sin las tres cosas no hay agencia.'},
  ],
  // su manía: casi todo lo explica con el mate
  mateLore: ['El agua del mate, nunca hervida. Setenta, ochenta grados. Con las ideas pasa igual: si las quemás, quedan amargas.',
    'Un mate lavado es como una idea repetida: ya no tiene gusto. Cambiá la yerba.',
    'El primer mate es para el que ceba, porque sale feo. La primera idea, también: sacala de encima y seguí.',
    'La bombilla no se mueve. Si algo funciona, no lo toques solo por tocar.',
    'El mate se comparte. Lo que sabés, también. Nadie aprende tomando solo.',
    'En la ronda de mate, si decís "gracias" es que no querés más. Con los clientes es parecido: no cierres la charla antes de tiempo.',
    {d: 3, t: 'Tengo un mate para pensar, otro para reuniones y otro para malas noticias. El de malas noticias casi no lo uso. Buena señal.'},
    {d: 4, t: 'Una vez presenté una campaña entera sin soltar el termo. El cliente aprobó. No digo que haya relación. Pero tampoco digo que no.'},
    {d: 5, t: 'El que ceba tiene que mirar la ronda. Liderar es eso: darte cuenta de quién se quedó sin.'},
    {if: () => (S.items.mate || 0) > 0 && qState('fede_mate') !== 'open', t: '¿Eso que tenés en la mochila es un mate? No te digo nada. Bueno, sí: compartir es de buena persona.'}],
  // después de un entrenamiento: corto, sin hablar de quién ganó
  sparWin: ['¡Eso! ¿Viste lo que hiciste en el segundo turno? Repetilo. Y la próxima, antes.', 'Buen entrenamiento. Ahora decime qué funcionó, que no quiero que sea suerte.', 'Así me gusta. No te relajes: la próxima te pido más.', 'Bien encarado. Ahora hacelo de nuevo, pero con menos turnos.'],
  sparLose: [['Hoy te costó. Perfecto: para eso se entrena.', 'Tomá, recargá energía.'], ['Probaste cosas. Eso vale. Ahora probá mejor.', 'Recargá y repetimos cuando quieras.'], ['Fijate qué te sirvió al final. Arrancá por ahí la próxima.', 'Te recargo la energía.'], ['Hoy viste cómo encaro yo. Usalo en el próximo entrenamiento.', 'Tomá, energía llena.']],
};
async function talkFede(){
  const m = mem(); let firstTime = false;
  if (S.flags.fedeMet && S.lvl >= PROJECT_LVL && !S.flags.senior){ await seniorCeremony(); return; }
  if (!S.flags.fedeMet){
    S.flags.fedeMet = true; S.flags.typesHint = true;
    await say(`${saludo()}, {name}! Soy Fede, director de contenido. Entré como diseñador y fui creciendo: acá se crece. Bienvenid{o} a la parte divertida.`, 'fede:feliz');
    await say('Acá se aprende probando y equivocándose. Un dato práctico: cada problema tiene su punto débil. Lo creativo destraba la burocracia, la estrategia ordena el caos, lo técnico arregla bugs y la calma desarma la presión.', 'fede');
    await say('Y lo más importante de todo: ¿me traés un mateee? Por favor. Reni anda siempre con el termo por la agencia. Sin mate pienso a la mitad.', 'fede:risa');
    qReopen('fede_mate'); m.fedeMateAt = m.battles || 0; firstTime = true;
    await say('Ahora pasá por Guaná, la oficina de al lado: Agus y Lía te quieren conocer. Y cuando resuelvas tu primer problema en La Base, volvé: te enseño a ordenar las carpetas. Sin orden no hay idea que aguante.', 'fede');
    return;
  } else {
    await opener('fede', 'fede', FEDE.again);
    let line = reaction('fede', FEDE.R);
    if (!line && qState('fede_prueba') === 'open' && !qCountOk('fede_prueba')){ const [a, b] = qProg('fede_prueba'); line = pick('fede:q', [`Llevás ${a} de ${b} entrenamientos. Lo que cuenta es volver.`, 'Seguí viniendo a entrenar. Ahí está el aprendizaje.']); }
    if (!line && Math.random() < .35) line = pick('fede:matelore', FEDE.mateLore);
    await say(line || pick('fede:tips', FEDE.tips), Math.random() < .3 ? 'fede:risa' : 'fede');
  }
  if (!firstTime) await fedeMateFavor();
  if (qState('fede_carpetas_practica') === 'open' && qReady('fede_carpetas_practica')){
    await say('Lo pusiste en práctica: se nota en cómo dejás las cosas. Te enseño "Todo en su carpeta": cuando todo está en su lugar, se trabaja más rápido y se piensa mejor.', 'fede:feliz');
    await learn('carpetas', sayN); qDone('fede_carpetas_practica'); return;
  }
  if (hpPct() < .3){ await say('Así no entrenamos. Andá a ver a Lu y volvé con energía.', 'fede'); return; }
  // la capacitación de orden de carpetas: de lo primero que se aprende en la agencia
  const tr = trainingNext('carpetas') >= 0 && !trainingToday('carpetas') && wildTotal() > 0; // la primera capacitación, después del primer problema
  const opts = tr ? [`Capacitación: ${TRAININGS.carpetas.sessions[trainingNext('carpetas')].title}`, '¡Entrenemos!', 'Ahora no'] : ['¡Entrenemos!', 'Ahora no'];
  let c = await choose(opts, {cancel: opts.length - 1});
  if (tr && c === 0){
    if (await trainingSession('carpetas')) await say('Ya sabés dónde va cada cosa. Ahora a la práctica: resolvé cuatro desafíos y volvé, que te enseño algo para que nunca más se te pierda nada.', 'fede:feliz');
    return;
  }
  if (tr) c--;
  if (c !== 0){ await say(pick('fede:bye', ['Dale. Acá estoy cuando quieras.', 'Cuando quieras, ya sabés dónde encontrarme.', 'Bueno. Pero no te escapes mucho, ¿eh?']), 'fede'); return; }
  await say(pick('fede:go', ['¡Dale! Mostrame qué aprendiste.', 'Arrancamos. No te guardes nada.', 'Voy en serio, ¿eh? Así se aprende.', 'Hoy probá algo que nunca hayas usado.', 'Fijate el tipo de cada habilidad antes de elegir.', 'Hoy quiero ver estrategia, no suerte.']), 'fede:serio'); hideDlg();
  const res = await bossBattle('fede', 'spar');
  if (res === 'win'){
    if (!S.flags.fedeBeaten){
      S.flags.fedeBeaten = true;
      await say('¡Mirá vos! Eso que hiciste al final es exactamente lo que buscaba. Entrenaste en serio.', 'fede:sorpresa');
      await say('Eso merece algo que no se enseña con palabras. Pero no te confíes: desde ahora te pido más.', 'fede:feliz');
      S.bonus.atk += 2; S.bonus.def += 2; SFX.learn(); await say('Tu ataque y tu defensa subieron de forma permanente.');
    } else if (Math.random() < .6) await say(pick('fede:sparwin', FEDE.sparWin), 'fede:feliz');
    fullHeal();
  }
  if (!S.skills.includes('prueba')){
    if (!qState('fede_prueba')){ await say('Volvé a entrenar conmigo dos veces más. Si veo que mejorás, te enseño algo que uso todos los días.', 'fede'); qOpen('fede_prueba'); }
    else if (qReady('fede_prueba')){
      await say('Volviste a entrenar. Eso es lo que buscaba. Te enseño "Prueba y error": cuanto más la intentás, más fuerte pega.', 'fede');
      await learn('prueba', sayN); qDone('fede_prueba');
    }
  }
}

/* ================= ASCENSOS =================
   Nivel 15: quedás fijo y pasás de Pasante a Social Manager; te lo dan Agus (RRHH) y Lía en Guaná.
   Nivel 25: Project Leader; te lo da Fede en Brasil, y te enseña "Mentoría". */
async function fijoCeremony(me){
  if (me === 'lia'){
    await say('¡{name}! ¡Vení, vení! ¡Agus, decíselo vos, que si no lo digo mal!', 'lia:feliz');
    await say('Quedaste fij{o}. Desde hoy ya no sos pasante: sos Social Manager de la agencia. Bienvenid{o} de verdad.', 'agus:feliz');
    await say('¡Lo dijo! ¡Ya está en el tablero: nivel 15, cero pasantía, cien por ciento equipo!', 'lia:risa');
  } else {
    await say('{name}, vení. Tranqui: es una buena noticia. De las mejores que doy en RRHH.', 'agus');
    await say('¡Quedaste fij{o}! ...Perdón, Agus. No me aguanté.', 'lia:risa');
    await say('Iba a hacer una pausa dramática. Bueno: sí. Desde hoy ya no sos pasante: sos Social Manager de la agencia. Bienvenid{o} de verdad.', 'agus:risa');
    await say('¡Ya está en el tablero: nivel 15, cero pasantía, cien por ciento equipo!', 'lia:feliz');
  }
  await say('Lo construiste aprendiendo, preguntando y volviendo a intentar. Eso es lo que buscamos en la agencia.', 'agus');
  await say('Un Social Manager gestiona creativamente a las marcas para que se comuniquen mejor con su gente. Comunicar y gestionar: ese es tu propósito.', 'agus');
  await say('¡Tres áreas, todas igual de importantes: creatividad, gestión y análisis! ¡Contenidos y coberturas, mensajes y perfiles, reportes y tendencias! ¡Al lado de tu nombre va a decir Social!', 'lia:feliz');
  await say('Y una más: cuando algo te salga bien, sistematizalo y compartilo. Así no crece solo tu cliente: crece toda la agencia.', 'agus:feliz');
  S.flags.fijo = true; if (qState('fijo') === 'open') qDone('fijo');
  S.bonus.atk += 1; S.bonus.def += 1; S.bonus.spd += 1; S.bonus.hp += 4; SFX.learn();
  await say('Firmaste tu contrato. Tu ataque, tu defensa, tu velocidad y tu energía máxima subieron.');
  await say('Ahora sos Social Manager.');
}
async function seniorCeremony(){
  await say('{name}. Sentate. ...Bueno, en Brasil no hay sillas. Quedate parad{o}.', 'fede:risa');
  await say('Nivel 25. Desde hoy sos Project Leader. ¿Sabés qué cambia?', 'fede');
  await say('Un Project Leader dirige, motiva y representa al equipo. Es el puente entre lo que necesita el cliente y nuestra forma de hacer las cosas. Liderar y encantar.', 'fede');
  await say('Tres frentes: tu equipo (organización, liderazgo, procesos), tus clientes (comunicación, objetivos, venta activa) y los presupuestos. Y liderás con el ejemplo: no pedís nada que no cumplas.', 'fede');
  await say('Y acordate: R = R. Relaciones es igual a resultados. Un buen vínculo con el cliente y con tu equipo hace que todo fluya.', 'fede:feliz');
  await say('Y no alcanza con que aprendas vos: te toca enseñar. El próximo pasante que entre va a mirar cómo trabajás.', 'fede');
  await say('Y obvio: te voy a seguir pidiendo más. Eso no cambia nunca.', 'fede:feliz');
  S.flags.senior = true; if (qState('senior') === 'open') qDone('senior');
  await learn('mentoria', sayN);
  await say('Ahora sos Project Leader.');
}

/* ================= FAVORES =================
   Fede a veces pide un mate y Pimi algo de comer. Si se los llevás, te ayudan. */
async function fedeMateFavor(){
  const m = mem(), b = m.battles || 0;
  if (qState('fede_mate') === 'open'){
    if ((S.items.mate || 0) === 0){ await say(pick('fede:mateq', ['Te espero con el mate, ¿eh? Mientras tanto pienso, pero a media máquina.', '¿Sabés con qué pensaría mejor ahora? Exacto. Con un mate.', '¿Y mi mate? No es por apurar. Bueno, un poco sí.', 'Sin mate no hay ideas, {name}. Bueno, hay menos. Y peores.', () => NPCS.find(n => n.id === 'reni').away ? 'Reni ya se fue con el termo. Mañana me traés uno, ¿dale?' : `Reni anda con el termo. Recién la vi por ${reniWhere()}. Decile que es para mí, que ya sabe cómo me gusta.`, 'Tengo el termo listo y la bombilla esperando. Falta lo más importante: el mate.']), 'fede:risa'); return; }
    await say(pick('fede:matesee', ['¿Eso es un mate? ¡Lo huelo desde acá!', '¡Pará! ¿Me trajiste el mate?', 'Esa cara es de alguien que trae un mate. Conozco esa cara.']), 'fede:sorpresa');
    const c = await choose(['Darle un mate', 'Todavía no']);
    if (c !== 0){ await say(pick('fede:mateno', ['Bueno. Lo guardás para vos. Te entiendo. Me duele, pero te entiendo.', '¿Todavía no? Está bien. La paciencia también se entrena.']), 'fede:serio'); return; }
    S.items.mate--; m.fedeMateAt = b; m.mates = (m.mates || 0) + 1; qDone('fede_mate');
    await say(pick('fede:mate', ['¡Salvador! Ahora sí se piensa.', '¡Cebado por Reni, se nota! Ni un palito. Eso es oficio.', 'No te digo "gracias" porque si no, no me cebás otro. Es la regla.', 'Fijate: el mate no se toma apurado. Las decisiones tampoco. Ahora sí, a pensar.']), 'fede:feliz');
    await say(pick('fede:matetip', ['Te devuelvo el favor: en el próximo desafío arrancá con lo que mejor te sale. Dale con todo desde el principio.', 'Un consejo de regalo: mirá el tipo del rival antes del primer turno. Arrancás con ventaja.', 'Vení, te muestro un truco: la primera jugada marca el ritmo de todo el desafío.']), 'fede');
    S.buff = 'fede'; SFX.learn(); await say('Fede te ayuda: en tu próxima pelea arrancás con más ataque y más velocidad.');
    if ((S.items.libreta || 0) < 2){ S.items.libreta = (S.items.libreta || 0) + 1; await say('Y te regaló una hoja de su libreta. Recibiste Libreta de Fede.'); }
    return;
  }
  if (S.flags.fedeMet && b - (m.fedeMateAt ?? -99) >= 3 && Math.random() < .6){
    m.fedeMateAt = b;
    await say(pick('fede:mateask', ['{name}, ¿me hacés un favor enorme? Traeme un mateee, por favor. Reni anda con el termo, buscala.', 'Pará, pará. Antes de seguir: ¿me conseguís un mate? Sin mate no doy consejos. Doy opiniones, que es peor.', 'Te voy a pedir algo serio: un mate. Reni sabe cómo me gusta. Te espero.', 'En todos estos años aprendí dos cosas: escuchar al cliente y no pensar sin mate. ¿Me traés uno?']), 'fede:risa');
    qReopen('fede_mate');
  }
}
async function pimiFoodFavor(){
  const m = mem(), b = m.battles || 0;
  if (qState('pimi_comida') === 'open'){
    const food = (S.items.medialunas || 0) > 0 ? 'medialunas' : (S.items.alfajor || 0) > 0 ? 'alfajor' : null;
    if (!food) return false;
    const c = await choose([food === 'alfajor' ? 'Darle un alfajor' : 'Darle medialunas', 'Todavía no']);
    if (c !== 0) return true;
    S.items[food]--; m.pimiFoodAt = b; m.pimiFood = (m.pimiFood || 0) + 1; qDone('pimi_comida');
    await say(pick('pimi:food', ['¡Combustible! Ahora sí.', 'Ñam. Mi cerebro pasó de 3G a fibra óptica.', 'Gracias. Esto vale más que una actualización.']), 'pimi');
    if (m.pimiFood <= 3){ S.bonus.spd += 1; S.bonus.atk += 1; SFX.learn(); await say('Pimi te optimizó la compu. Tu ataque y tu velocidad subieron de forma permanente.'); }
    S.items.pendrive = (S.items.pendrive || 0) + 1; await say(pick('pimi:gift', ['Tomá, te paso un pendrive con mis scripts. Usalo en una emergencia.', 'Llevate esto: un pendrive con atajos. Ojo que no es para guardar fotos.']), 'pimi'); await say('Recibiste Pendrive de Pimi.');
    return true;
  }
  if (S.flags.pimiMet && b - (m.pimiFoodAt ?? -99) >= 4 && Math.random() < .4){
    m.pimiFoodAt = b;
    await say(pick('pimi:foodask', ['Con hambre no rindo. Si me traés un alfajor o unas medialunas, te doy una mano con algo.', 'Tengo el estómago en modo avión. ¿Me conseguís algo de comer? Te devuelvo el favor.']), 'pimi');
    qReopen('pimi_comida'); return true;
  }
  return false;
}
async function luWaterFavor(){
  const m = mem(), b = m.battles || 0;
  if (qState('lu_agua') === 'open'){
    if (!(S.items.agua > 0)) return false;
    const c = await choose(['Darle el vaso de agua', 'Todavía no']);
    if (c !== 0) return true;
    S.items.agua = 0; m.luAguaAt = b; qDone('lu_agua');
    await say(pick('lu:agua', ['¡Sos lo más! Ahora sí llego al estribillo.', '¡Hidratación completa! Gracias, gracias.']), 'lu:feliz');
    S.items.playlist = (S.items.playlist || 0) + 1; SFX.sing();
    await say('Te armé una playlist para tus desafíos. Mucho Morat, un poco de Aitana y Cruzando el Charco para el final.', 'lu:risa');
    await say('Recibiste Playlist de Lu.');
    return true;
  }
  if (talks('lu') >= 1 && b - (m.luAguaAt ?? -99) >= 5 && Math.random() < .4){
    m.luAguaAt = b;
    await say(pick('lu:aguaask', ['¡Me quedé sin agua y estoy por cantar el estribillo! ¿Me traés un vaso del dispensador? Porfi, porfi.', '¿Me hacés un favorcito? Un vaso de agua del dispensador. Cantar deshidrata, no sabés.']), 'lu:sorpresa');
    qReopen('lu_agua'); return true;
  }
  return false;
}
/* los dispensadores de agua */
async function useCooler(){
  G.busy = true;
  try {
    if (qState('lu_agua') === 'open' && !(S.items.agua > 0)){ S.items.agua = 1; SFX.heal(); await say('Llenás un vaso de agua para Lu. Glu, glu.'); await say('Conseguiste Vaso de agua.'); }
    else await say(pick('cooler', ['Tomás un vaso de agua. Lu estaría orgullosa.', 'El dispensador hace "glu-glu". Es lo más emocionante que pasó en la última hora.', 'Agua fresquita. Nada más que decir.']));
  } finally { hideDlg(); G.busy = false; save(); }
}
/* la heladera de la cocina (en la barbacoa del patio): a veces hay algo para llevarle a Pimi */
async function openFridge(){
  G.busy = true; const m = mem(), b = m.battles || 0;
  try {
    if (b - (m.fridgeAt ?? -99) >= 3 && Math.random() < .6){
      m.fridgeAt = b; const k = Math.random() < .5 ? 'medialunas' : 'alfajor';
      S.items[k] = (S.items[k] || 0) + 1; SFX.heal();
      await say(pick('fridge:yes', ['Alguien dejó comida con un cartel: "Para compartir". Te llevás una parte.', 'Atrás de los yogures hay algo rico. Nadie lo reclamó.', 'Sobró del cumple de ayer. Te llevás un poco.']));
      await say(`Conseguiste ${k === 'alfajor' ? 'un Alfajor' : 'Medialunas'}.`);
    } else await say(pick('fridge:no', ['Hay una vianda con un cartel: "NO TOCAR. ESTO ES DE PIMI".', 'Hay un yogur de 2019. Mejor cerrás la heladera.', 'Solo hay hielo y una mostaza solitaria.', 'Hay una torta con un cartel: "Para el cumple de Reni. NI SE TE OCURRA".']));
  } finally { hideDlg(); G.busy = false; save(); }
}

/* ================= AGUS Y LÍA ================= */
/* Agus: psicóloga y la persona de RRHH. Cuida al equipo, arma dinámicas y planes de desarrollo.
   Tranquila, cálida y con humor; cada tanto se le escapa un Freud. Es re de seguir los procesos.
   Lía: enérgica y orientada al cliente. Ella siempre prefiere performance; el resto del equipo, branding
   (y lo dice con orgullo de minoría). Mide y mejora todo, todo el tiempo. Nunca dice que es intensa: se nota en cómo
   habla (apuro, exclamaciones, números para todo) y se ríe de sí misma.
   Le cuestan los procesos. Juntas se complementan: una ordena, la otra acelera. */
const FOUNDERS = {
  // consejos de Agus (dan defensa en la próxima pelea)
  A: ['Antes de responder un mail enojado, esperá diez minutos. Lo que sentís es información, no una orden.',
    'Dicen que Freud decía que a veces un cigarro es solo un cigarro. Acá, a veces un "ok" en un mail es solo un "ok". No le busques tanto.',
    'Escuchá hasta el final. Lo importante casi siempre viene después del "bueno, y otra cosa...".',
    'Lo que no se dice en la reunión aparece en el pasillo. Mejor decirlo en la reunión.',
    'Pedir feedback da miedo. Recibirlo tarde da más.', 'Decir "no sé" a tiempo es de lo más profesional que hay.',
    'Cuando algo te enoja mucho, preguntate qué te recuerda. Freud haría un picnic con eso.',
    'Tu valor no se mide en tareas tachadas. Igual tachalas, que da placer.',
    'Lo urgente rara vez es tan urgente. Preguntá para cuándo es de verdad.', 'Las mejores ideas llegan caminando. Andá a dar una vuelta y volvé.',
    'Un proceso no es una jaula: es lo que te deja improvisar sin perderte.',
    {if: () => hpPct() < .5, t: 'Te veo cansad{o}. Descansar también es parte del trabajo. Lo dice RRHH, o sea yo.'},
    {if: () => tod() === 'tarde', t: 'A esta hora baja la energía. Un té, y lo difícil para mañana.'}],
  // charla suelta de Agus: RRHH, dinámicas, algo de psicología y su dupla con Lía
  chat: [{if: () => statusLow(), pri: true, t: 'Vi tu status en el pizarrón de Brasil. Algún número estaba bajito. ¿Querés charlar un ratito? Sin apuro.'},
    '¿Cómo te estás sintiendo en la agencia? En serio, no es una pregunta de RRHH. Bueno, un poco sí.',
    {d: 2, t: 'Te cuento algo: además de RRHH, soy psicóloga. Por eso a veces pregunto "¿y cómo te hace sentir eso?". Es más fuerte que yo.'},
    {d: 5, t: 'Sofi es la que sostiene la casa. Si algo funciona y no sabés por qué, fue Sofi.'},
    {d: 7, t: 'Tato tiene otro ritmo. Al principio me preocupaba. Después vi sus planillas: no hay un error. Ahora el que me preocupa es mi ritmo.'},
    {d: 1, t: 'Mi puerta siempre está abierta. Literal: la manija se rompió hace un mes. Pimi dice que la arregla "en un ratito".'},
    {d: 2, t: 'En la última dinámica armamos torres con fideos secos. La de Sahi era la más linda. También la primera en caerse.'},
    {d: 4, t: 'Lu me pidió una dinámica de karaoke. Le dije que lo pienso. Ya sabemos cómo termina eso.'},
    {d: 5, t: 'Estoy armando un taller de comunicación para Pimi. Él todavía no lo sabe. Es una sorpresa.'},
    {d: 2, t: 'Cuando alguien me dice "estoy bien" muy rápido, ya sé que no. Deformación profesional.'},
    {d: 3, t: 'Dicen que Freud decía que lo que no se expresa vuelve después, y peor. Por eso hacemos retros cada dos semanas.'},
    'Mi trabajo es que la gente esté bien y crezca. Lo demás son planillas. Muchas planillas.',
    {d: 4, t: 'Reni guarda un video de cada cumpleaños de la agencia. Eso también es cultura de equipo.'},
    {d: 1, t: 'Lía me pidió un tablero para medir el clima laboral. Le dije que el clima se pregunta, no se mide. Ahora tenemos las dos cosas. Y funciona.'},
    {d: 3, t: 'Yo escribo el proceso, Lía lo prueba en la vida real y me dice qué sobra. Es la mejor revisora que tuve. Aunque no lo lea entero.'},
    {d: 6, t: 'Cuando Lía se acelera, le pregunto "¿y esto para qué?". Cuando yo me trabo, ella me dice "¡probemos!". Así llegamos.'},
    {if: () => !!S.pdp && !S.pdp.done, t: () => `¿Cómo vas con tu plan? Foco en ${PDP[S.pdp.t].n}. Un pasito por vez.`},
    {if: () => tod() === 'mañana', d: 3, t: '¿Desayunaste? Es una pregunta de RRHH. Y de psicóloga. Y de persona.'},
    {if: () => tod() === 'noche' || tod() === 'madrugada', d: 3, t: '¿Todavía acá? Como psicóloga te digo: andá a dormir. Como RRHH, también.'}],
  // consejos de Lía (dan ataque en la próxima pelea): cliente, métricas, probar y mejorar
  L: ['¡Pensá en el cliente! No compra una campaña: compra un resultado.',
    '¡Lo que no se mide no se mejora! Y lo que se mide, se mejora más rápido.',
    '¡Probá dos versiones y quedate con la que funciona mejor! A/B testing, {name}. Es como elegir zapatillas, pero con datos.',
    '¡Mejorá un uno por ciento por día! Hice la cuenta: en un año sos treinta y siete veces mejor. Sí, hice la cuenta. Obvio.',
    '¡El primer turno es como los primeros tres segundos de un anuncio! Si no enganchás ahí, chau.',
    '¡Si tenés una idea, mostrala ya! Después la medimos y la pulimos.',
    '¡Las presentaciones se definen en los primeros treinta segundos! Lo medí. Bueno, lo sentí. Pero con mucha seguridad.',
    {d: 2, t: 'Yo siempre prefiero performance: clics, conversiones, ¡resultados ya! Los demás, branding. Siempre. ¡Somos minoría, pero medimos todo!'},
    {if: () => mem().stats.streak >= 2, t: '¡Racha de victorias! Ya la puse en el tablero, en verde. ¡No pares ahora!'},
    {if: () => tod() === 'mañana', t: '¡A la mañana se conquista el mundo! O por lo menos la bandeja de entrada. Lo tengo medido: a las diez ya hay cuarenta mails.'}],
  // charla suelta de Lía
  Lchat: [{if: () => statusToday(), t: '¡Vi tu status en el pizarrón! Ya lo pasé a mi tablero. ¡Es broma! ...Un poco.'},
    {d: 7, t: '¡Le pedí a Tato los números del mes! Me dijo "tranqui, ya llegan". Llegaron tres días después. ¡Perfectos! No tuve nada para mejorar. ¡Me desesperé!'},
    {d: 1, t: '¡Tengo un tablero para todo! Clientes, campañas, cuántas veces canta Lu el estribillo... ¡y uno de cuántos tableros tengo! ¡Ja! Ese lo armé ayer.'},
    {d: 2, t: 'Agus me pasó la planilla del proceso. La abrí. ¡Eso ya es un avance! La cerré enseguida, pero la abrí.'},
    {d: 2, t: 'En cada reunión pasa lo mismo: yo voto performance y todos los demás, branding. ¡Todos contra una! Igual llevo los números, por las dudas. ¡Ja!'},
    'Mi frase favorita es "¿y si lo medimos?". La de Agus, "¿y si lo hablamos?". Juntas no se nos escapa nada.',
    {d: 3, t: 'Hoy mejoré el proceso de mejorar procesos. Agus dice que eso no es un proceso. ¡Es un proceso! Uno muy rápido.'},
    'Le mandé un audio al cliente antes de que terminara de escribirme el mail. Orientación al cliente, se llama. Agus dice que también se llama ansiedad. Las dos tenemos razón.',
    {d: 4, t: 'Pimi me armó un script que me avisa si una campaña baja un dos por ciento. Me avisa cada cinco minutos. ¡Lo amo! Al script. Y a Pimi.'},
    {d: 5, t: 'Pimi y yo tenemos un grupo para mirar campañas en vivo. Se llama "Clics". Somos dos. ¡Y alcanza!'},
    {d: 6, t: '¡Proponer cosas nuevas es mi deporte! Bueno, el de Pimi es el surf. El mío es proponer.'},
    {d: 4, t: 'Ayer reordené la heladera por fecha de vencimiento. Encontré un yogur de 2019. Ese no lo pude mejorar.'},
    {d: 3, t: 'Sahi dice que hizo catorce devoluciones seguidas en el ping pong. Lo medí: fueron once. Igual, buenísimo.'},
    {if: () => (mem().ppBest || 0) > 0, t: () => `Tu récord en el peloteo con Sahi es de ${mem().ppBest} devoluciones. ¿Cómo que no sabías que lo estaba midiendo?`},
    {if: () => (mem().mates || 0) > 0, t: () => `Le llevaste ${mem().mates} mate${mem().mates === 1 ? '' : 's'} a Fede. Lo tengo en el tablero, en la columna "cultura de equipo".`},
    {if: () => !!S.pdp && !S.pdp.done, t: '¿Agus te armó un plan de desarrollo? ¡Me encanta! Su plan dice a dónde ir; mi tablero, cuánto falta.'},
    {if: () => tod() === 'noche' || tod() === 'madrugada', t: '¿A esta hora? Yo también estoy, pero yo no cuento: me divierte. Igual andá a dormir, que si no Agus me reta a mí.'}],
  banter: [
    [['lia', '¡Agus! ¡Tato tiene los números del mes!'], ['agus', '¿Y?'], ['lia:risa', '¡Cierran! Se lo pregunté tres veces.'], ['agus:risa', 'Y las tres veces te dijo "tranqui".']],
    [['agus', '¿Viste que Sofi cambió las plantas del pasillo?'], ['lia', '¡Y arregló el wifi, la impresora y la silla que crujía!'], ['agus:feliz', 'Antes del mediodía.'], ['lia:risa', '¡Quiero su productividad! ...Y su calma. Bueno, la productividad primero.']],
    [['lia', '¡Agus! ¡Tengo una idea para una campaña! ¡Arrancamos hoy!'], ['agus', '¿Dónde está el brief?'], ['lia:risa', '...¡En mi cabeza! Que es un lugar muy ordenado. Más o menos.'], ['agus:risa', 'Te lo escribo yo. Vos traé la energía, que tenés para todos.']],
    [['agus', 'Lía, ¿le contaste lo del primer cliente que tuvimos?'], ['lia', '¡Nos pidió el logo en Comic Sans! ¡Y lo convencimos de que no!'], ['agus:risa', 'Tardamos tres reuniones. Y una charla de contención. Para nosotras.']],
    [['agus', 'Lía, ¿cargaste las horas del mes?'], ['lia:sorpresa', '¿Las horas de qué mes?'], ['agus:risa', 'Por eso las cargo yo. Y por eso ella consigue los clientes. Cada una en lo suyo.']],
    [['lia', '¡Medí la última dinámica de Agus! Satisfacción del noventa y cuatro por ciento.'], ['agus:feliz', '¿Y el seis por ciento que falta?'], ['lia:risa', '¡Era yo, que quería que durara menos! Pero la voté bien igual.']],
    [['lia', '¡Performance, Agus! ¡Clics, conversiones, resultados ya!'], ['agus', 'Lía, en la reunión votamos todos branding.'], ['lia:risa', '¡Todos menos una! Alguien tiene que defender a los clics. ¡Ja!']],
    [['agus', 'Yo armo el proceso.'], ['lia', '¡Y yo lo mejoro!'], ['agus:risa', 'Lo saltea.'], ['lia:risa', '¡Lo mejoro salteándolo! Es una técnica. Todavía no la medí, pero es una técnica.']],
    [['lia', '¡Agus, anoche soñé que presentaba sin diapositivas!'], ['agus:risa', 'Freud tendría mucho para decir. Yo te digo: hacé las diapositivas.'], ['lia', '¡Ya las hice! A las tres de la mañana. Y las mejoré a las tres y cuarto.']],
    [['agus', 'En la reunión de hoy Lía le prometió al cliente la campaña para el lunes.'], ['lia', '¡Y Agus armó el cronograma para que llegáramos! ¡Equipazo!'], ['agus:risa', 'Cronograma, contención y un café. En ese orden.']],
    [['agus', 'Lía, el viernes hay dinámica de equipo.'], ['lia', '¡Genial! ¿Puedo medir cuánto tarda cada uno?'], ['agus:risa', 'No. Es una dinámica, no una carrera.'], ['lia:risa', '...Igual voy a llevar cronómetro. Escondido.']],
    [['lia', '¡Agus! ¡Me salteé un paso del proceso y salió todo bien!'], ['agus:feliz', '¿Qué paso?'], ['lia', 'El de avisarte.'], ['agus:risa', 'Ese es justo el paso que existe para cuando sale mal.']],
    [['lia', '¡Agus, el café se enfrió de nuevo!'], ['agus', 'Porque lo dejaste para contestar "un mail rapidito".'], ['lia:risa', '...Fueron cuarenta mails. ¡Pero contesté uno cada cuarenta y cinco segundos! Lo medí.']],
    [['lia', '¿Viste que Reni anda grabando videos por todos lados?'], ['agus:feliz', 'Si la ves, posá. Siempre te regala algo.']],
    [['lia', '¡Agus! ¡Tengo tres ideas nuevas para la agencia!'], ['agus', '¿Y cuál de las tres seguimos?'], ['lia:risa', '¡Las tres! ...Bueno, la que tenga mejores números.'], ['agus:feliz', 'Esa. Y las otras dos van a la lista de ideas, con fecha.']],
    [['agus', 'Lía, ¿leíste el proceso nuevo de bienvenida?'], ['lia', '¡Lo leí en diagonal! Muy en diagonal.'], ['agus:risa', '¿Y qué dice el paso tres?'], ['lia:risa', '...Que lo vuelva a leer.']],
    [['lia', '¡Agus, el cliente pidió un cambio chiquito!'], ['agus', '¿Cuán chiquito?'], ['lia', 'Toda la campaña.'], ['agus:risa', 'Chiquito como siempre. Armemos el plan.']],
    [['agus', '¿Viste que Lía cargó las horas a tiempo?'], ['lia:feliz', '¡Me puse una alarma! Y la medí: tardé cuatro minutos.'], ['agus:risa', 'Eso se festeja en el after.']],
    [['lia', '¡Agus! ¡El brief llegó tarde otra vez!'], ['agus', 'Tranqui. Primero las preguntas, después el apuro.'], ['lia:risa', '¡Ya mandé las preguntas! Hace dos minutos. ...Era eso, ¿no?']],
    [['agus', 'Transparencia, aprendizaje, actitud positiva, pertenencia y colaboración.'], ['lia', '¡Los valores! Los tengo en el tablero, con un check al lado.'], ['agus:feliz', 'Y yo en la puerta de Guaná. Entre las dos no se nos escapan.']],
    [['lia', '¡Agus! ¡La reunión de las tres podía ser un mail!'], ['agus', 'Entonces mandá el mail.'], ['lia:sorpresa', '¿Puedo?'], ['agus:risa', 'Con un resumen claro, sí. Ese es el proceso.']],
  ],
  // acotaciones: la otra se mete en la charla desde su escritorio
  Lacota: ['¡Y eso se puede medir!', '¡Agus tiene razón! Pocas veces lo digo tan rápido.', '¡Anotado en el tablero!', '¡Eso! ¿Y si lo probamos hoy?'],
  Aacota: ['Eso lo anotamos en el proceso.', 'Y si sale bien, lo hacemos costumbre.', 'Lo charlamos en la retro, ¿sí?', 'Me gusta. Con fecha y responsable, me gusta más.'],
  // reacciones: cada una habla de sí misma en primera persona
  RA: {
    lose: [f => `¿Qué sentiste justo antes de quedarte sin energía con ${f}? Ahí hay información valiosa.`, f => `Trabarte un rato con ${f} no te define. Lo que aprendés después, un poco más.`, f => `${f} le cuesta a todo el equipo. No es personal, aunque se sienta así.`],
    boss: {explote: 'La Clienta Explosiva quedó conforme. Contener el caos ajeno sin perder la calma no se enseña en ningún curso.', logo: 'Don Logo aprobó sin agrandar nada. Y se quejó solo de la silla. Eso fue pura escucha activa.', fantasma: '¡La Clienta Fantasma respondió! Freud tendría mucho para decir de esa ausencia. Yo solo digo: bien ahí.'},
    streak: ['Venís muy bien. Disfrutalo, pero acordate de cortar un rato.', 'Buena racha. Anotá qué estás haciendo distinto: eso va a tu plan de desarrollo.'],
    level: [() => `Nivel ${S.lvl}. ¿Lo anotamos en tu plan de desarrollo?`, () => `Nivel ${S.lvl}. ¿Y cómo te hace sentir eso? Perdón, no me pude contener.`],
  },
  RL: {
    lowhp: ['¡Energía en rojo! Ese indicador no me gusta nada. Pasá por lo de Lu y volvé.'],
    lose: [f => `¡Dato, no drama! ${f} te dejó sin energía. ¿En qué turno se dio vuelta? Ahí está la mejora.`, f => `¡A ${f} se lo destraba insistiendo! Y midiendo. ¡Volvé ya!`, f => `${f} es durísimo. Anotá qué funcionó y qué no, y lo iteramos.`],
    boss: {explote: '¡La Clienta Explosiva quedó conforme! Ya lo puse en el tablero. Con fuegos artificiales. Bueno, un dibujito de fuegos artificiales.', logo: '¡Don Logo aprobó! ¡Y sin agrandar el logo! Satisfacción del cliente: cien por ciento. Bueno, él dice setenta. ¡Histórico igual!', fantasma: '¡La Clienta Fantasma respondió! Tasa de respuesta: de cero a uno. ¡Crecimiento infinito! Bueno, matemáticamente es discutible, pero ¡festejemos!'},
    streak: ['¡Racha de problemas resueltos! Ya la puse en el tablero, en verde. ¡No pares!', '¡Tres seguidas! Si esto fuera una campaña, ya estaría pidiendo más presupuesto.'],
    level: [() => `¡Nivel ${S.lvl}! Crecimiento sostenido. Me encanta esta curva.`, () => `Nivel ${S.lvl}. ¿Viste? Mejorar un poquito cada día funciona. ¡Lo dicen los datos!`],
  },
};

/* Plan de desarrollo personal: elegís un área, la practicás en peleas y Agus hace la revisión.
   Tres etapas (3, 4 y 5 peleas). Cada revisión sube un poco un atributo y deja un post-it para el combate. */
const PDP = {
  CRE: {n: 'lo creativo', stat: 'atk', up: 'Tu ataque subió', hi: 'Lo creativo. Me encanta. Sahi va a estar feliz de tener competencia.'},
  EST: {n: 'la estrategia', stat: 'def', up: 'Tu defensa subió', hi: 'La estrategia: ordenar antes de correr. Muy bien.'},
  TEC: {n: 'lo técnico', stat: 'spd', up: 'Tu velocidad subió', hi: 'Lo técnico. Pimi va a llorar de emoción. Él dice que no llora.'},
  CAL: {n: 'la calma', stat: 'hp', amt: 4, up: 'Tu energía máxima subió', hi: 'La calma. Mi favorita, no te voy a mentir.'},
};
async function pdpPick(first){
  const areas = Object.keys(PDP).filter(t => S.skills.some(id => SK[id].t === t));
  const opts = areas.map(t => (S.pdp && S.pdp.t === t ? 'Seguir con ' : 'Desarrollar ') + PDP[t].n);
  if (first) opts.push('Más adelante');
  const c = await choose(opts, {cancel: first ? opts.length - 1 : Math.max(0, areas.indexOf(S.pdp.t))});
  if (c >= areas.length) return false;
  const t = areas[c], same = !!S.pdp && S.pdp.t === t;
  S.pdp = {t, stage: S.pdp ? S.pdp.stage : 0};
  await say(same ? 'Constancia. Es lo que más rinde, aunque no tenga glamour.' : PDP[t].hi, 'agus:feliz');
  if (!S.equip.some(id => SK[id].t === t)) await say(`Ojo: no tenés ninguna habilidad de ${TYPES[t].n} activa. Activala en el menú, en Habilidades.`, 'agus:sorpresa');
  qReopen('agus_pdp');
  await say(`Objetivo: resolver ${3 + S.pdp.stage} desafíos usando alguna habilidad de ${TYPES[t].n}. Lo que buscamos es que la domines. Después hacemos la revisión.`, 'agus');
  return true;
}
async function pdpOffer(){
  await say('{name}, ¿armamos tu plan de desarrollo personal? El de verdad tiene siete pasos: metas, fortalezas, objetivos SMART, ponerlo en común con tu líder y conmigo, activarlo, registrar avances y revisarlo a los seis meses.', 'agus:feliz');
  await say('Acá lo hacemos en versión corta: dónde estás, a dónde querés llegar y qué te falta.', 'agus');
  await say(`Dónde estás ya lo sé: nivel ${S.lvl}, y con más herramientas que el primer día. ¿Qué querés desarrollar?`, 'agus');
  if (!await pdpPick(true)){ await say('Tranqui. Un plan armado a la fuerza no sirve. Cuando quieras, acá estoy.', 'agus'); return; }
  await say('Y lo que te falta lo vamos descubriendo en el camino. Esa es la parte linda.', 'agus:feliz');
}
async function pdpReview(){
  const a = PDP[S.pdp.t];
  await say(pick('agus:rev', ['Revisión de tu plan de desarrollo. Sentate, que no muerdo.', 'Hora de la revisión. Tranqui: no es un examen, es una charla.']), 'agus:feliz');
  await say('Primero lo importante: ¿cómo te sentiste?', 'agus');
  const c = await choose(['Bien, aprendí un montón', 'Me costó, pero salió', 'Ni idea, la verdad']);
  await say(['Se nota. Y poder decirlo también es crecer.', 'Que cueste es buena señal. Si no costara, sería rutina.', '"Ni idea" es una respuesta honesta. Freud diría que tu inconsciente ya lo sabe. Ya te vas a enterar.'][c], c === 2 ? 'agus:risa' : 'agus:feliz');
  S.bonus[a.stat] += a.amt || 1; if (a.stat === 'hp') S.hp += a.amt;
  SFX.learn(); await say(`${a.up} de forma permanente.`);
  S.items.postit = (S.items.postit || 0) + 1; await say('Agus te dio un post-it que dice "Vos podés". Recibiste Post-it de Agus.');
  if (S.liaKpi && Math.random() < .6) await say('¡Lo anoté en tu tablero! ...Perdón, Agus. Sigan, sigan.', 'lia:risa');
  qDone('agus_pdp'); S.pdp.stage++;
  if (S.pdp.stage >= 3){ S.pdp.done = true; await say('Con esto, tu plan está completo. Ya no necesitás que te lo arme yo: ahora lo armás vos. Ese era el objetivo desde el principio.', 'agus:feliz'); return; }
  await say(`Etapa ${S.pdp.stage + 1} de 3. ¿Seguimos con ${a.n} o cambiamos de foco?`, 'agus');
  await pdpPick(false);
}

/* Dinámicas de equipo: preguntas cortas para conocer a la gente de la agencia.
   Solo pregunta por quien ya conociste. Acertar da un poco de experiencia; con tres aciertos, Agus te enseña una habilidad. */
const DINAMICAS = [
  {if: () => talks('sahi') > 0, t: {q: '¿Quién del equipo es hincha de Boca a muerte?', a: 'Sahi', o: ['Pimi', 'Fede']}},
  {if: () => talks('sahi') > 0, t: {q: '¿De dónde es Sahi?', a: 'De Argentina', o: ['De Rocha', 'De la terraza']}},
  {if: () => talks('pimi') > 0, t: {q: '¿Quién se escapa a surfear a Rocha apenas hay olas?', a: 'Pimi', o: ['Sahi', 'Lu']}},
  {if: () => talks('pimi') > 0, t: {q: '¿Qué le alegra el día a Pimi?', a: 'Algo rico para comer', o: ['Una reunión larga', 'Un mail sin asunto']}},
  {if: () => talks('lu') > 0, t: {q: '¿Quién anda cantando por la agencia todo el día?', a: 'Lu', o: ['Reni', 'Fede']}},
  {if: () => talks('lu') > 0, t: {q: '¿Qué suena en la playlist de Lu?', a: 'Aitana y Morat', o: ['Solo música clásica', 'Ruido blanco']}},
  {if: () => talks('fede') > 0, t: {q: '¿Qué necesita Fede para pensar?', a: 'Un mate', o: ['Un café triple', 'Silencio absoluto']}},
  {if: () => talks('reni') > 0, t: {q: '¿Quién anda por la agencia con el termo convidando mate?', a: 'Reni', o: ['Sahi', 'Pimi']}},
  {if: () => talks('sahi') > 0, t: {q: '¿Dónde encontrás a Sahi casi siempre?', a: 'En la mesa de ping pong', o: ['En la cocina', 'En la terraza']}},
  {if: () => talks('reni') > 0, t: {q: '¿Quién graba videos con el celu por toda la agencia?', a: 'Reni', o: ['Lu', 'Pimi']}},
  {if: () => talks('sofi') > 0, t: {q: '¿Quién se ocupa de que haya fruta, ande internet y la casa esté linda?', a: 'Sofi', o: ['Tato', 'Lía']}},
  {if: () => (S.flags.lesGiuli || 0) > 0, t: {q: '¿Quién te enseña a preparar archivos para imprenta?', a: 'Giuli', o: ['Alejo', 'Tato']}},
  {if: () => (S.flags.tr_cronograma || 0) > 0, t: {q: '¿Quién te enseña a armar cronogramas de contenido?', a: 'Alejo', o: ['Giuli', 'Sofi']}},
  {if: () => talks('marga') > 0, t: {q: '¿Quién es la que está hace más tiempo en la agencia?', a: 'Marga', o: ['Fede', 'Tato']}},
  {if: () => talks('marga') > 0, t: {q: '¿Qué le encanta mostrarte a Marga?', a: 'Las fotos de sus nietas', o: ['Sus plantas', 'Sus recetas']}},
  {if: () => talks('tato') > 0, t: {q: '¿Qué música tranqui suena siempre en el parlante de Tato?', a: 'Reggae', o: ['Cumbia', 'Heavy metal']}},
  {if: () => talks('tato') > 0, t: {q: '¿De qué se encarga Tato?', a: 'De los números de la agencia', o: ['De los videos', 'De la pauta de las campañas']}},
  {if: () => talks('pimi') > 0, t: {q: '¿Qué hace Pimi en la agencia?', a: 'Paid media, y lo técnico pasa por él', o: ['Solo arregla el wifi', 'Graba los videos']}},
  {if: () => talks('lia') > 0, t: {q: '¿Qué le encanta hacer a Lía, todo el tiempo?', a: 'Medir y mejorar todo', o: ['Seguir el proceso al pie de la letra', 'Dejar todo para mañana']}},
  {if: () => talks('lia') > 0, t: {q: 'El equipo casi siempre vota branding. ¿Qué campañas prefiere siempre Lía?', a: 'Las de performance', o: ['Las de branding, como todos', 'Las que no se miden']}},
  {if: () => talks('lia') > 0, t: {q: 'De las dos fundadoras, ¿quién es re de seguir los procesos?', a: 'Agus', o: ['Lía', 'Ninguna de las dos']}},
  {if: () => !(mem().dinOk > 0), t: {q: '¿Qué hace Agus en la agencia, además de fundarla?', a: 'RRHH y dinámicas como esta', o: ['Arregla el wifi', 'Graba los videos']}},
];
async function agusDinamica(){
  const m = mem(); m.dinAt = m.battles || 0;
  await say(pick('agus:dinask', ['¿Hacemos una dinámica rápida? Es para conocernos mejor. Nada de abrazos grupales, prometido.', 'Dinámica relámpago de equipo. Treinta segundos. ¿Te sumás?', 'Estoy probando una dinámica nueva para el viernes. ¿Me ayudás?']), 'agus:feliz');
  if (await choose(['¡Dale!', 'Ahora no']) !== 0){ await say(pick('agus:dinno', ['Tranqui. Las dinámicas a la fuerza no funcionan. Bueno, la del viernes sí es obligatoria.', 'Dale, otro día. Igual el viernes no te salvás.']), 'agus:risa'); return; }
  const d = pick('agus:din', DINAMICAS);
  await say(d.q, 'agus');
  const opts = [d.a, ...d.o].sort(() => Math.random() - .5), c = await choose(opts, {cancel: null});
  if (opts[c] === d.a){
    m.dinOk = (m.dinOk || 0) + 1;
    await say(pick('agus:dinok', ['¡Exacto! Conocés a tu equipo. Eso vale oro.', '¡Bien! Se nota que charlás con la gente.', 'Correcto. Y no fue suerte: prestás atención.']), 'agus:feliz');
    await gainXP(Math.max(10, Math.floor(need(S.lvl) * .12)), sayN);
    if (!S.skills.includes('dinamica')){
      if (!qState('agus_equipo')){ qOpen('agus_equipo'); await say('Te propongo un desafío: acertá cinco dinámicas más y te enseño mi herramienta favorita. Para acertar, hay que charlar con todos.', 'agus'); }
      else if (qReady('agus_equipo')){
        await say('Ya conocés bastante al equipo. Te enseño mi herramienta favorita: cuando estés en un aprieto, acordate de que no estás sol{o}.', 'agus');
        await learn('dinamica', sayN); qDone('agus_equipo');
      }
    }
  } else {
    await say(pick('agus:dinbad', ['Mmm, no. Freud lo llamaría acto fallido. Yo lo llamo "todavía no charlaste tanto con el equipo".', 'No era esa. Pero no pasa nada: para eso son las dinámicas, para conocernos.', 'Casi. Date una vuelta por la agencia y charlá con todos. Después volvemos a probar.']), 'agus:risa');
    await say(`La respuesta era: ${d.a}.`, 'agus');
  }
}

/* ================= LÍA MIDE TODO =================
   El tablero: tus números (peleas, tasa de éxito, turnos, habilidades más usadas). Lo ves en la pizarra de su oficina
   o cuando ella te lo muestra. Mejora continua: tres objetivos medibles que salen de tus propios números;
   cada uno se cumple resolviendo 3 desafíos que lo respeten. */
const f1 = v => v == null ? '—' : String(Math.round(v * 10) / 10).replace('.', ',');
const KPI = {
  turnos:  {n: k => `resolver en ${k.t} turnos o menos`, ok: k => B.turn <= k.t, stat: 'spd', up: 'Tu velocidad subió'},
  variedad:{n: () => 'resolver usando habilidades de dos tipos distintos en el mismo desafío', ok: () => Object.keys(B.used || {}).length >= 2, stat: 'atk', up: 'Tu ataque subió'},
  energia: {n: () => 'resolver con más de la mitad de tu energía', ok: () => B.P.hp > B.P.max / 2, stat: 'hp', amt: 4, up: 'Tu energía máxima subió'},
};
const KPI_ORDER = ['turnos', 'variedad', 'energia'];
const kpiOk = () => !!(B && S.liaKpi && !S.liaKpi.done && KPI[S.liaKpi.k].ok(S.liaKpi));
function myNumbers(){
  const m = mem(), st = m.stats, played = st.wins + st.losses;
  const use = Object.entries(m.skillUse || {}).filter(([id]) => SK[id]).sort((a, b) => b[1] - a[1]);
  return {m, battles: m.battles || 0, wins: st.wins, losses: st.losses, rate: played ? Math.round(st.wins / played * 100) : null,
    avg: m.winsT ? m.winTurns / m.winsT : null, best: m.winsT ? m.bestTurns : null, streak: st.streak, use, total: use.reduce((s, [, n]) => s + n, 0)};
}
function tableroHTML(){
  const d = myNumbers();
  const rows = [['Desafíos', d.battles], ['Resueltos', d.wins], ['Aprendizajes', d.losses], ['Tasa de resolución', d.rate == null ? '—' : d.rate + '%'], ['Racha', d.streak],
    ['Turnos (prom.)', f1(d.avg)], ['Récord turnos', d.best == null ? '—' : d.best], ['Clientes', S.bosses + '/3'], ['Peloteo', d.m.ppBest || 0], ['Mates a Fede', d.m.mates || 0]];
  let h = `<div class="stat four">${rows.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}</div>`;
  if (d.total){
    h += '<div class="k">Habilidades más usadas</div>';
    h += d.use.slice(0, 3).map(([id, n]) => { const pc = Math.round(n / d.total * 100); return `<div class="kbar"><span>${SK[id].n}</span><i style="--w:${pc}%;--c:${TYPES[SK[id].t].c}"></i><b>${pc}%</b></div>`; }).join('');
  }
  if (S.liaKpi && !S.liaKpi.done){ const [a, b] = qProg('lia_kpi'); h += `<div class="k">Objetivo de Lía: ${KPI[S.liaKpi.k].n(S.liaKpi)} · ${a} de ${b}</div>`; }
  return h;
}
/* lo que Lía lee en tus números: una sola observación, concreta */
function liaInsight(){
  const d = myNumbers(), top = d.use[0], share = top && d.total >= 6 ? top[1] / d.total : 0, o = [];
  if (d.battles < 2) return '¡Todavía hay pocos datos! Con dos o tres desafíos más ya te armo una tendencia.';
  if (share > .55) o.push(`Usás ${SK[top[0]].n} en el ${Math.round(share * 100)}% de los turnos. ¡Hagamos un A/B test! Probá otra habilidad y comparamos.`);
  if (d.rate != null && d.rate < 60) o.push(`Tasa de resolución: ${d.rate}%. ¡La subimos! Fijate el tipo del rival antes de elegir la habilidad.`);
  if (d.rate != null && d.rate >= 80 && d.wins >= 4) o.push(`¡${d.rate}% resuelto! Si esto fuera una campaña, ya estaría pidiendo más presupuesto.`);
  if (d.avg != null && d.avg > 4) o.push(`Tardás ${f1(d.avg)} turnos en promedio para resolver. ¡Arrancá con lo más efectivo y lo bajamos!`);
  if (d.avg != null && d.avg <= 3 && d.wins >= 3) o.push(`¡${f1(d.avg)} turnos por desafío! Eficiencia pura. Me emociono.`);
  if (d.streak >= 3) o.push(`Racha de ${d.streak}. ¡En verde! No toques nada.`);
  if (!o.length) o.push('Números sanos y estables. ¡Ahora, a mejorarlos! Siempre se puede un poquito más.');
  return o[rnd(o.length)];
}
async function liaShowBoard(){
  mem().boardAt = mem().battles || 0;
  await panelInfo('TU TABLERO · POR LÍA', tableroHTML()); closePanel();
  await say(liaInsight(), 'lia');
  if (Math.random() < .55) await say(pick('lia:seríe', ['¿Viste que te hice un gráfico de tus gráficos? ¡Ja! No me pude contener.', '¿Mucho? ¡Es mucho! Agus dice que respire. Respiro. Y mido cuánto respiro.', 'Perdón, me entusiasmo con los números. Bueno, no pido perdón: ¡me encanta!']), 'lia:risa');
}
/* la pizarra de la oficina */
async function liaBoardLook(){
  await say(pick('house:J', ['El tablero de Lía. Hay gráficos de todo: clientes, campañas, cafés por día... y una columna con tu nombre.',
    'La pizarra de métricas de Lía. Un post-it dice "MEDIR". Otro, con la letra de Agus, dice "y respirar".',
    'El tablero de Lía. Todas las líneas van para arriba. Hay una que bajó, pero tiene un post-it: "la estoy mirando".']));
  await panelInfo('TU TABLERO · POR LÍA', tableroHTML()); closePanel();
}
async function kpiOffer(){
  await say('{name}, ¿te propongo algo? ¡Mejora continua! Miro tus números, te pongo un objetivo medible y lo vamos subiendo.', 'lia:feliz');
  if (await choose(['¡Dale, medime!', 'Más adelante']) !== 0){ await say('¡Ok! Pero te sigo midiendo igual, ¿eh? Es más fuerte que yo.', 'lia:risa'); return; }
  await kpiSet(0);
}
async function kpiSet(stage){
  const d = myNumbers(), k = KPI_ORDER[stage];
  S.liaKpi = {k, stage, t: k === 'turnos' ? Math.max(2, Math.min(5, d.avg ? Math.floor(d.avg) : 3)) : 0};
  await say({turnos: d.avg ? `Hoy tardás ${f1(d.avg)} turnos en promedio para resolver. Objetivo: ${KPI.turnos.n(S.liaKpi)}.` : `Todavía no tengo tu promedio, así que arranquemos con algo claro: ${KPI.turnos.n(S.liaKpi)}.`,
    variedad: 'Ahora, variedad. ¡A/B testing en serio! Objetivo: resolver usando habilidades de dos tipos distintos en el mismo desafío.',
    energia: 'Último objetivo: eficiencia. Resolver está bien; resolver sin quedar fundid{o}, mejor. Objetivo: terminar los desafíos con más de la mitad de tu energía.'}[k], 'lia');
  await say('Tres desafíos que lo cumplan y venís. Yo voy mirando el tablero. Todo el tiempo. Literalmente todo el tiempo.', 'lia:risa');
  qReopen('lia_kpi');
}
async function kpiReview(){
  const k = S.liaKpi, K = KPI[k.k];
  await say(pick('lia:kpiok', ['¡Objetivo cumplido! Lo vi en tiempo real. Grité un poco. Agus vino a ver si estaba todo bien.', '¡Tres de tres! Cien por ciento de cumplimiento. ¡Me encanta este tablero!']), 'lia:feliz');
  S.bonus[K.stat] += K.amt || 1; if (K.stat === 'hp') S.hp += K.amt;
  SFX.learn(); await say(`${K.up} de forma permanente.`);
  if (S.pdp && !S.pdp.done) await say('Y lo sumo a tu plan de desarrollo. Lía mide, yo acompaño.', 'agus:feliz');
  if (k.stage === 0 && !S.skills.includes('medir')){ await say('Y te enseño mi herramienta favorita: mirar los números en pleno desafío y ajustar sobre la marcha.', 'lia'); await learn('medir', sayN); }
  qDone('lia_kpi');
  if (k.stage >= 2){
    k.done = true;
    await say('Cumpliste los tres objetivos. Ya no necesitás que te los ponga yo: ahora medís vos.', 'lia:feliz');
    await say('...Igual te voy a seguir mirando el tablero, ¿eh? Es más fuerte que yo.', 'lia:risa'); return;
  }
  await say('¿Siguiente objetivo? ¡Siempre hay un siguiente objetivo!', 'lia');
  await kpiSet(k.stage + 1);
}

/* ================= CAMPAÑA A CUATRO MANOS =================
   Lía trae un cliente y quiere salir ya; Agus quiere hacerlo con proceso. Vos decidís en tres momentos.
   Lo mejor sale de juntarlas: el proceso de Agus para arrancar, la velocidad y el foco en el cliente de Lía en el medio,
   y al final medir (Lía) y conversarlo (Agus). Con dos aciertos te acompañan en la próxima pelea;
   la primera campaña redonda te enseña "Plan con empuje". */
const DUO_CLIENTS = ['una marca de yerba', 'una heladería de barrio', 'una app de bicis', 'un club de fútbol infantil', 'una librería de usados', 'una fábrica de alfajores'];
const DUO_STEPS = [
  // arranque: acá suma el proceso de Agus
  [{q: '¿Por dónde arrancan?', o: [
      {t: 'Leer el brief con Agus', ok: 1, r: [['agus:feliz', 'Gracias. Diez minutos de brief nos ahorran una semana de cambios.'], ['lia', '¡Ok, ok! Pero lo leo con cronómetro.']]},
      {t: 'Lanzar los anuncios ya', r: [['lia:sorpresa', '¡Salieron! ...¿Para quién eran?'], ['agus', 'Por eso existe el brief. No es burocracia: es el mapa.']]}]},
   {q: 'Lía ya armó doce anuncios, sin cronograma. ¿Qué hacés?', o: [
      {t: 'Publicar los doce hoy', r: [['lia:risa', '¡Doce! ¡Todos juntos! ...¿Por qué el cliente me llama tanto?'], ['agus', 'Porque se le llenó el feed. Un cronograma, Lía. Un cronograma.']]},
      {t: 'Ordenarlos en el cronograma de Agus', ok: 1, r: [['agus:feliz', 'Así: tres por semana, y vemos cuál funciona.'], ['lia', '¡Y cada uno tiene su momento de brillar! Me convenciste. Y lo puedo medir mejor.']]}]}],
  // el medio: acá suma la energía de Lía
  [{q: '¿Cuántas rondas de aprobación hacen?', o: [
      {t: 'Tres rondas, por las dudas', r: [['lia', '¡Para la tercera ronda ya cambió la temporada!'], ['agus:risa', 'Tiene razón. El proceso es para ayudar, no para frenar.']]},
      {t: 'Una ronda y salimos', ok: 1, r: [['lia:feliz', '¡Eso! Con el brief claro, una ronda alcanza.'], ['agus', 'Y si algo falla, lo ajustamos. Me gusta.']]}]},
   {q: '¿Performance o branding?', o: [
      {t: 'Solo performance: clics ya', r: [['lia:feliz', '¡Sí! ¡Clics! ¡Conversiones! ¡Por fin alguien de mi lado!'], ['agus', 'Para vender este mes, sí. Pero si nadie conoce la marca, el mes que viene arrancamos de cero.'], ['lia:risa', 'Ok, ok... branding, como quieren todos. ¡Pero lo mido!']]},
      {t: 'Branding, y que también se mida', ok: 1, r: [['lia', '¡Branding, como quieren todos! Yo hubiera elegido performance, pero con métricas me sumo.'], ['agus:feliz', 'Trato hecho: branding con números. Las dos contentas.']]}]},
   {q: 'El cliente pide un cambio a último momento.', o: [
      {t: 'Escucharlo y resolverlo en el día', ok: 1, r: [['lia:feliz', '¡Lo llamo ya! Orientación al cliente.'], ['agus', 'Y yo anoto el cambio en el proceso, así la próxima lo vemos venir.']]},
      {t: 'Que espere a la semana que viene', r: [['lia:sorpresa', '¿Una semana? ¡En una semana se fue con otra agencia!'], ['agus', 'Un "no" a tiempo vale oro. Pero un "lo vemos hoy" también.']]}]}],
  // el cierre: medir y conversarlo, las dos juntas
  [{q: 'Salió la campaña. ¿Y ahora?', o: [
      {t: 'Festejar y pasar a la próxima', r: [['lia', '¡Festejo! ...¿Y cómo nos fue? ¡No sé cómo nos fue!'], ['agus', 'Sin medir y sin retro, la próxima arrancamos de cero.']]},
      {t: 'Medir y hacer una retro juntas', ok: 1, r: [['lia:feliz', '¡Tablero diario!'], ['agus:feliz', 'Y retro el viernes, para ver también cómo estamos nosotras.']]}]},
   {q: 'Los números dieron bien, pero no perfecto.', o: [
      {t: 'Cambiar todo de golpe', r: [['lia', '¡Cambiamos todo! ...¿Y ahora cómo sé qué fue lo que mejoró?'], ['agus', 'Una cosa por vez. Así se aprende.']]},
      {t: 'Ajustar una cosa y volver a medir', ok: 1, r: [['lia:feliz', '¡Mejora continua! Mi parte favorita.'], ['agus:feliz', 'Y con calma. La mía.']]}]}],
];
async function duoCampaign(me){
  const m = mem(); m.duoAt = m.battles || 0;
  const cl = DUO_CLIENTS[rnd(DUO_CLIENTS.length)];
  if (me === 'agus'){
    await say('{name}, llegás justo. A Lía le acaba de entrar un mensaje y ya se le nota en la cara.', 'agus:risa');
    await say(`¡Nos escribió ${cl}! ¡Quiere vender más este mes! ¡Campaña de performance YA!`, 'lia:feliz');
  } else await say(`¡Agus! ¡{name}! ¡Nos escribió ${cl}! Quiere vender más este mes. ¡Campaña de performance YA!`, 'lia:feliz');
  await say('Me encanta la energía. Hagámosla bien: con un proceso.', 'agus');
  await say('{name}, ¿nos das una mano? En cada paso, una acelera y la otra ordena... y vos decidís.', 'lia');
  if (await choose(['¡Hagámosla!', 'Ahora no']) !== 0){ await say('¡Ok! Pero el cliente no espera, ¿eh? Bueno, un ratito sí.', 'lia:risa'); return; }
  let ok = 0;
  for (const phase of DUO_STEPS){
    const st = phase[rnd(phase.length)], opts = st.o.slice().sort(() => Math.random() - .5);
    await say(st.q);
    const o = opts[await choose(opts.map(x => x.t), {cancel: null})];
    if (o.ok) ok++;
    for (const [who, t] of o.r) await say(t, who);
  }
  m.duoBest = Math.max(m.duoBest || 0, ok);
  if (ok >= 2){
    await say(ok === 3 ? '¡Campaña redonda! El cliente está feliz, los números dan y nadie terminó a las tres de la mañana.' : '¡Salió bien! Con un par de ajustes, la próxima sale redonda.', ok === 3 ? 'lia:feliz' : 'lia');
    await say(ok === 3 ? 'Proceso y empuje. Cuando se juntan, no hay con qué darle.' : 'Lo importante es que aprendimos algo. Y que lo anotamos. Lo anotó Lía. En un tablero.', ok === 3 ? 'agus:feliz' : 'agus:risa');
    const sinOk = qState('consejo') === 'done' && qState('consejo2') === 'done' && S.lvl >= 16;
    if (ok === 3 && !S.skills.includes('sinergia') && sinOk){ await say('Ahora te enseñamos algo que hacemos las dos juntas: ordenar y acelerar al mismo tiempo.', 'agus'); await learn('sinergia', sayN); }
    else if (ok === 3 && !S.skills.includes('sinergia')) await say('¡Redonda! Nuestro secreto te lo enseñamos cuando hayas probado los dos caminos, el mío y el de Agus, y tengas un poco más de oficio: nivel 16. ¡Ya falta menos!', 'lia');
    else if (ok === 2 && !S.skills.includes('sinergia')) await say('Si alguna sale redonda, te enseñamos nuestro secreto. ¡Lo tengo medido: está a un paso!', 'lia');
    S.buff = 'duo'; m.lastAdviceBattle = m.battles || 0;
    await say('Agus y Lía te acompañan: en tu próximo desafío arrancás con más ataque y más defensa.');
  } else {
    await say('Bueno... salió. Más o menos. El cliente pidió una reunión. Larga.', 'lia:risa');
    await say('No pasa nada: para eso es la retro. Vemos qué aprendimos y la próxima sale mejor.', 'agus');
  }
  await gainXP(Math.max(6, Math.floor(need(S.lvl) * [.04, .06, .1, .15][ok])), sayN);
}

async function talkFounders(n){
  const me = n.id === 'lia' ? 'lia' : 'agus', m = mem(), b = m.battles || 0;
  if (S.flags.foundersMet && S.lvl >= 15 && !S.flags.fijo){ await fijoCeremony(me); return; }
  if (!S.flags.foundersMet){
    S.flags.foundersMet = true;
    // habla primero la que tenés enfrente
    const agusHi = async first => {
      await say(first ? `${saludo()}, {name}! Soy Agus, directora general. Me ocupo de las personas: que el equipo crezca y esté bien.` : 'Y yo soy Agus, directora general. Me ocupo de las personas: que el equipo crezca y esté bien.', 'agus:feliz');
    };
    const liaHi = async first => {
      await say(`${first ? `${saludo()}, {name}! ¡Soy Lía` : '¡Y yo soy Lía'}, directora comercial! Tardaste diecinueve segundos en subir la escalera. ¿Que no hacía falta medirlo? ¡Ja!`, 'lia:risa');
    };
    if (me === 'lia'){
      await liaHi(true); await agusHi(false);
      await agusValores();
      await say('¡Agus arma los procesos y yo los acelero!', 'lia');
      await say('Los saltea. Con amor, pero los saltea. Para arrancar, ¿con cuál de las dos te identificás más?', 'agus:risa');
    } else {
      await agusHi(true); await liaHi(false); await agusValores();
      await say('Yo armo los procesos y Lía los acelera.', 'agus');
      await say('¡Los mejoro! A veces salteándolos, ¡pero con amor! Para arrancar, ¿con cuál de las dos te identificás más?', 'lia');
    }
    const c = await choose(['Con calma y con proceso (Agus)', 'A full y midiendo todo (Lía)']);
    S.flags.path = c === 1 ? 'lia' : 'agus';
    if (c === 1) await say('¡Eso! Mi consejo te acompaña en tu próximo desafío. ¡Probalo en tres y después vemos los números!', 'lia:feliz');
    else await say('Me gusta. Mi consejo te acompaña en tu próximo desafío. Probalo en tres y volvé a contarme.', 'agus:feliz');
    qOpen('consejo');
    S.buff = c === 1 ? 'atk' : 'def'; m.lastAdviceBattle = b;
    await say('Ahora la casa es tuya. Bajá a La Base: ahí están Alejo y Giuli, y entre las pilas de pendientes saltan los problemas. ¡Resolvé el primero!', 'agus:feliz');
    if (qState('bienvenida') === 'open') qDone('bienvenida');
    if (!qState('clientes')){ await say('¡Y cuando estés list{o}, los clientes te esperan en la Sala de Clientes, en la planta baja! ¡Yo voy midiendo cómo te va!', 'lia:feliz'); qOpen('clientes'); }
    return;
  }
  // recompensas ganadas
  const handoff = async giver => { if (giver !== me) await say(me === 'agus' ? 'Lía tiene algo para vos. Mirá cómo se le iluminan los ojos.' : '¡Agus tiene algo para vos! ¡Mirá cómo sonríe!', me === 'agus' ? 'agus:feliz' : 'lia:feliz'); };
  if (qState('consejo') === 'open' && qReady('consejo')){
    await handoff(S.flags.path);
    if (S.flags.path === 'lia'){ await say('¡Lo pusiste en práctica! Tres de tres: cien por ciento de efectividad. Tomá, ahora sí: "A full".', 'lia:feliz'); S.bonus.atk += 2; await learn('afull', sayN); }
    else { await say('Lo pusiste en práctica. Del dicho al hecho hay un trecho, y vos lo cruzaste. Te enseño a "Respirar hondo".', 'agus:feliz'); S.bonus.def += 2; await learn('respirar', sayN); }
    await say(`Tu ${S.flags.path === 'lia' ? 'ataque' : 'defensa'} subió de forma permanente.`);
    qDone('consejo'); return;
  }
  if (S.bosses >= 3 && !S.flags.card){
    if (me === 'lia'){
      await say('¡{name}! ¡Tenemos algo para vos! ¡Montserrat te quiere conocer! ¡Casi nadie sube a la terraza!', 'lia:feliz');
      await say('Tomá la tarjeta de acceso. La escalera a la terraza está al fondo del pasillo, acá arriba. Subí con respeto, ¿sí?', 'agus');
    } else {
      await say('{name}, tenemos algo para vos.', 'agus:feliz');
      await say('¡Montserrat te quiere conocer! ¡Casi nadie sube a la terraza!', 'lia');
      await say('Tomá la tarjeta de acceso. La escalera a la terraza está al fondo del pasillo, acá arriba. Subí con respeto, ¿sí?', 'agus');
    }
    S.flags.card = true; SFX.learn(); await say('Recibiste la tarjeta de acceso a la terraza.');
    if (qState('tarjeta')) qDone('tarjeta'); qOpen('terraza'); return;
  }
  if (S.bosses >= 2 && !qState('consejo2') && qState('consejo') === 'done'){
    await say('Ya pasaste por dos clientes. Creemos que estás para probar el otro camino también.', me);
    await say(S.flags.path === 'lia' ? 'Probá mi consejo, el de la calma, en tres desafíos y vemos qué aprendés.' : '¡Probá mi consejo, el de ir a full, en tres desafíos y medimos qué aprendés!', S.flags.path === 'lia' ? 'agus' : 'lia');
    qOpen('consejo2'); return;
  }
  if (qState('consejo2') === 'open' && qReady('consejo2')){
    await handoff(S.flags.path === 'lia' ? 'agus' : 'lia');
    if (S.flags.path === 'lia'){ await say('Aprendiste a frenar cuando hace falta. Eso es lo más difícil. Te enseño a "Respirar hondo".', 'agus:feliz'); await learn('respirar', sayN); }
    else { await say('¡Aprendiste a tirarte de cabeza! ¡Tomá "A full"!', 'lia:feliz'); await learn('afull', sayN); }
    qDone('consejo2'); return;
  }
  // el plan de desarrollo lo revisa Agus; los objetivos medibles, Lía. Cada una manda a la otra.
  if (S.pdp && qState('agus_pdp') === 'open' && qReady('agus_pdp')){
    if (me === 'agus'){ await pdpReview(); noteTalk('founders'); return; }
    await say(pick('lia:topdp', ['¡Agus te está esperando para la revisión de tu plan! ¡Andá, andá!', '¡Revisión con Agus! Está ahí nomás. Yo no me meto. Bueno, un poquito.']), 'lia'); noteTalk('founders'); return;
  }
  if (S.liaKpi && !S.liaKpi.done && qState('lia_kpi') === 'open' && qReady('lia_kpi')){
    if (me === 'lia'){ await kpiReview(); noteTalk('founders'); return; }
    await say(pick('agus:tokpi', ['Lía te está esperando con tu tablero. Lo actualizó tres veces mientras hablábamos.', 'Andá a ver a Lía: dice que tus números están para festejar.']), 'agus:risa'); noteTalk('founders'); return;
  }
  const started = qState('consejo') === 'done' || S.bosses >= 1;
  if (me === 'agus' && !S.pdp && started && b - (m.pdpAskAt ?? -99) >= 2){ m.pdpAskAt = b; await pdpOffer(); noteTalk('founders'); return; }
  if (me === 'lia' && !S.liaKpi && started && b - (m.kpiAskAt ?? -99) >= 2){ m.kpiAskAt = b; await kpiOffer(); noteTalk('founders'); return; }
  // la campaña a cuatro manos: la primera vez apenas cumpliste el consejo, después cada tanto
  if (qState('consejo') === 'done' && b - (m.duoAt ?? -99) >= 3 && (m.duoAt == null || Math.random() < .45)){ await duoCampaign(me); noteTalk('founders'); return; }
  if (S.bosses >= 1 && !qState('tarjeta') && Math.random() < .5){ await say(me === 'lia' ? '¡Cuando destrabes a los tres clientes, vení a vernos! ¡Hay alguien que quiere conocerte!' : 'Cuando destrabes a los tres clientes, vení a vernos. Hay alguien que quiere conocerte.', me); qOpen('tarjeta'); return; }
  if (me === 'agus' && talks('agus') >= 2 && b - (m.dinAt ?? -99) >= 3 && Math.random() < .4){ await agusDinamica(); noteTalk('founders'); return; }
  if (me === 'lia' && b >= 3 && b - (m.boardAt ?? -99) >= 4 && Math.random() < .5){
    await say(pick('lia:boardask', ['¡Te actualicé el tablero! ¿Lo querés ver?', '¡Tengo números nuevos tuyos! ¿Los vemos?', '¡Pará, pará! Antes de seguir: ¿viste cómo vienen tus números?']), 'lia:feliz');
    if (await choose(['¡A ver!', 'Después']) === 0){ await liaShowBoard(); noteTalk('founders'); return; }
    await say('¡Ok! Igual está en la pizarra, al lado de la ventana. Actualizada. Siempre.', 'lia:risa'); m.boardAt = b;
  }
  const r = reaction('founders', me === 'lia' ? FOUNDERS.RL : FOUNDERS.RA);
  if (r) await say(r, me);
  else if (S.pdp && !S.pdp.done && S.liaKpi && !S.liaKpi.done && !m.duoTalk){
    m.duoTalk = true;
    const lines = me === 'lia'
      ? [['lia', '¡Agus te armó un plan de desarrollo y yo te puse objetivos! ¡Doble equipo!'], ['agus', 'Su tablero dice cuánto te falta. Mi plan, a dónde querés llegar.'], ['lia:risa', '¡Y vos le preguntás cómo se siente en el camino! Entre las dos no se nos escapa nada.']]
      : [['agus', '¿Así que Lía también te puso objetivos? Y yo te armé un plan de desarrollo...'], ['lia', '¡Su plan dice a dónde querés llegar! ¡Mi tablero dice cuánto te falta!'], ['agus:risa', 'Y yo te pregunto cómo te sentís en el camino. Entre las dos no se nos escapa nada.']];
    for (const [who, t] of lines) await say(t, who);
  } else if (talks('founders') % 3 === 2 && Math.random() < .7){
    const mine = FOUNDERS.banter.filter(bt => bt[0][0].split(':')[0] === me), key = me === 'lia' ? 'banterL' : 'banterA';
    const bt = mine[m[key] = ((m[key] ?? -1) + 1) % mine.length];
    for (const [who, t] of bt) await say(t, who);
  } else if (me === 'agus' && Math.random() < .55){
    await say(pick('agus:chat', FOUNDERS.chat), Math.random() < .3 ? 'agus:risa' : 'agus');
    if (Math.random() < .35) await say(pick('lia:acota', FOUNDERS.Lacota), 'lia:feliz');
  } else if (me === 'lia' && Math.random() < .6){
    await say(pick('lia:chat', FOUNDERS.Lchat), Math.random() < .35 ? 'lia:risa' : 'lia');
    if (Math.random() < .35) await say(pick('agus:acota', FOUNDERS.Aacota), 'agus:risa');
  }
  else if (!S.flags.card && Math.random() < .25){
    await say(pick('founders:montse', ['¿Montserrat? Está en la terraza. Sube a pensar. No se la molesta así nomás.', 'Montserrat es la dueña de la casona. Algún día vas a subir a conocerla.']), me);
  }
  noteTalk('founders');
  if (b <= (m.lastAdviceBattle ?? -1)){
    await say(pick(me + ':wait', me === 'lia' ? ['¡Ya te di un consejo! Usalo primero y después medimos cómo fue.', '¡Un consejo por desafío! Si no, no sé cuál funcionó.'] : ['Ya tenés un consejo. Probalo en un desafío y después lo charlamos.', 'Un consejo a la vez. Si no, se nos vuelve una sesión de dos horas.']), me);
    return;
  }
  await say(pick('founders:ask', ['¿Qué consejo querés hoy?', '¿Calma o energía? Elegí.', '¿Necesitás un consejo para lo que viene?']), me);
  const c = await choose(['Consejo de Agus', 'Consejo de Lía', 'Nada, gracias']);
  if (c === 0){ await say(pick('agus:tips', FOUNDERS.A), 'agus'); S.buff = 'def'; m.lastAdviceBattle = b; await say('El consejo de Agus te va a acompañar en tu próximo desafío.'); }
  else if (c === 1){ await say(pick('lia:tips', FOUNDERS.L), 'lia'); S.buff = 'atk'; m.lastAdviceBattle = b; await say('El consejo de Lía te va a acompañar en tu próximo desafío.'); }
  else await say(pick(me + ':bye', me === 'lia' ? ['¡Dale! ¡Acá estamos!', '¡Andá, que se te escapa el día! Bueno, te quedan unas horas. Las conté.'] : ['Cuando quieras.', 'Andá tranqui. Y tomá agua, que Lu me pregunta.']), me);
}

/* ================= SAHI ================= */
/* Sahi: argentino, hincha de Boca a muerte y la persona más creativa de la agencia. Todo lo explica con fútbol. */
const SAHI = {
  again: ['¿Otra vez acá? Pará que termino estos jueguitos.', 'Che, ¿venís por la revancha?', 'Volviste rápido, crack.', '¡Ey! Justo estaba dibujando una idea en una servilleta. Mirá. Bueno, no mires, todavía no está.'],
  R: {
    lowhp: ['Estás hech{o} bolsa, eh. Pasá por lo de Lu, que te deja nuev{o}.', 'Uh, venís fundid{o}. Tomate algo y andá a ver a Lu.'],
    lose: [f => `¿Te trabaste con ${f}? Tranqui, que a Boca también le pasa. Pocas veces, pero le pasa.`, f => `${f} es tremendo. A mí me tuvo a maltraer un martes entero. Posta.`, f => `Trabarte con ${f} es como errar un penal: duele, pero el partido sigue. Y el próximo lo pateás mejor.`],
    boss: {explote: () => '¡Golazo, crack! ¡Destrabaste a la Clienta Explosiva! Esto merece vuelta olímpica por La Base.', logo: '¡Don Logo aprobó! ¿Sin agrandar el logo? Sos un genio, posta.', fantasma: '¡Respondió la Clienta Fantasma! Esto hay que festejarlo con facturas. Bueno, con bizcochos, que estamos acá.'},
    run: [f => `¿Te escapaste de ${f}? Bien ahí, a veces hay que tirar la pelota afuera.`],
    streak: ['¡Venís resolviendo todo, crack! Así se arma un equipo de Libertadores.', 'Tres al hilo. Estás para jugar en la Bombonera, posta.'],
    level: [() => `¡Nivel ${S.lvl}! Re bien, che. Ya estás para capitán.`],
  },
  lines: [
    'Mirá que La Base está picante hoy, eh. Hay pendientes por todos lados.', '¿Viste el último brief? Una genialidad. Bueno, había que arreglarlo un poquito.',
    'Si te cruzás un Reunionauro, llevate algo creativo. Lo deja knockout.', 'La creatividad es como la gambeta: no se explica, se hace.',
    {d: 2, t: 'Mi viejo me llevó a la Bombonera a los cinco años. Desde ahí pienso todo en azul y oro. Hasta las paletas de color.'},
    {d: 3, t: 'Si la campaña no te hace saltar como la 12 en un gol de último minuto, no es la campaña.'},
    {d: 5, t: 'Hoy hice un moodboard con fotos de la cancha. Era para una marca de yogur. Bueno, lo estoy ajustando.'},
    {d: 6, t: 'Che, un jueves de Copa no se agendan reuniones. Es ley. Bueno, mi ley.'}, {d: 1, t: 'Las ideas no se piensan, se patean. Si entra, golazo. Si no, al rebote.'},
    {d: 2, t: 'Tengo un cuaderno de ideas que va por el tomo seis. El cuatro es todo de tipografías. Es mi favorito.'},
    {d: 3, t: 'Para una idea genial necesito tres cosas: música fuerte, una pelota cerca y que alguien me diga que no se puede.'},
    'Un brief abierto es como una cancha sin arcos. Lindo para correr, pero ¿a dónde pateo?',
    {d: 2, t: 'Extraño las medialunas de Buenos Aires. Los bizcochos de acá están buenísimos, eh, pero no me hagas decirlo en voz alta.'},
    {d: 4, t: 'Convencí a un cliente de River de usar azul y amarillo. Ni se dio cuenta. Mi obra maestra.'},
    'Llevo 47 jueguitos con la paleta. Mi récord es 112. Reni lo tiene grabado, preguntale.',
    'El ping pong es fútbol en miniatura: el que maneja el ritmo, maneja todo. Y el que grita más, también.',
    'Las mejores ideas se me ocurren entre punto y punto. Por eso juego tanto. Es trabajo, posta.',
    'Esta mesa vio más brainstormings que la sala de reuniones. Y salieron mejores.',
    {d: 3, t: 'Le enseñé a Lu a sacar con efecto. Lo festejó cantando. Media agencia se enteró.'},
    {d: 3, t: 'Tengo la camiseta de Boca colgada en la silla. Es cábala para las presentaciones. Nunca falla. Bueno, casi nunca.'},
    {d: 4, t: '¿Sabés lo que es un superclásico en la Bombonera? Vibra el piso. Así quiero que vibren nuestras campañas.'},
    {d: 5, t: 'Cuando presento una idea pienso en Riquelme: la pausa, la mirada y el pase justo.'},
    {d: 4, t: 'Cuando juega la Selección paro todo. Bueno, casi todo. El ping pong no.'},
    {d: 5, t: 'Un asado sin chimichurri es como Boca sin la 12: algo falta.'},
    {d: 6, t: 'El dulce de leche es argentino. Bueno, acá dicen que es uruguayo. Hagamos las paces: es del Río de la Plata.'},
    {d: 1, t: 'El brief llegó a las seis de la tarde para mañana a las nueve. Es como un córner en el minuto 93: hay que cabecearlo igual.'},
    {d: 2, t: 'Acá nadie juega solo. El que gambetea también tiene que pasarla.'},
    {if: () => S.lvl >= 15 && S.lvl < PROJECT_LVL, t: '¡Quedaste fij{o}, crack! Ya tenés la camiseta de titular. Cuidala.'},
    {if: () => S.lvl >= PROJECT_LVL, t: '¿Project Leader? Eso es capitán, crack. Cinta en el brazo y todo.'},
    {d: 7, t: 'Tato me preguntó cómo había salido Boca. Del domingo pasado. Del otro domingo. Se lo conté igual: los buenos partidos se cuentan dos veces.'},
    {d: 3, t: 'El jueves hay after en el patio. Yo llevo la pelota y Pimi la comida. Bueno, Pimi se come la comida.'},
    'Fede dice que el ping pong despeja la cabeza. A mí me despeja la cabeza y la agenda.',
    {d: 4, t: 'Pimi volvió de Rocha con una tabla nueva. Dice que es "aerodinámica". Es una tabla.'}, {d: 3, t: 'Reni me grabó haciendo jueguitos. Salí horrible, pero la pelota salió hermosa.'},
    {d: 1, t: 'Fede dice que hay que fallar rápido. Yo fallo rapidísimo, soy un crack en eso.'}, {d: 5, t: 'Lu me pidió que le enseñe a decir "che". Lo dice como si fuera un estornudo.'},
    {d: 4, t: 'En la dinámica de Agus armamos torres con fideos. La mía era una obra de arte, posta. Duró cuatro segundos, pero qué cuatro segundos.'},
    {if: () => tod() === 'mañana', t: 'A la mañana la mesa está libre. Es el mejor momento para practicar el saque.'}, {if: () => tod() === 'tarde', t: 'A esta hora se arma el torneo de la tarde. Pimi juega con anteojos de sol. Dice que es estrategia.'},
    {if: () => tod() === 'noche' || tod() === 'madrugada', t: '¿Qué hacés acá tan tarde? Igual yo también estoy acá, así que no digo nada.'},
    {if: () => S.lvl >= 12 && S.lvl < 15, pri: true, t: 'Cuando quedes fij{o}, en el nivel 15, te enseño cómo armamos las campañas acá. De punta a punta, como un gol de media cancha.'},
    {if: () => (mem().ppWins || 0) > 0, t: () => `Ya me sacaste ${mem().ppWins} ${mem().ppWins === 1 ? 'punto' : 'puntos'}. Estoy entrenando en secreto, avisá.`},
  ],
};
async function talkSahi(){
  if (!S.flags.sahiMet){
    S.flags.sahiMet = true;
    await say('¡Bienvenid{o} a la mesa de ping pong, crack! Entre punto y punto salen las mejores ideas. Bueno, algunas.', 'sahi:feliz');
  } else await opener('sahi', 'sahi', SAHI.again);
  const r = reaction('sahi', SAHI.R);
  if (r) await say(r, 'sahi');
  // gambeta: hay que ganársela
  if (S.bosses >= 1 && !S.skills.includes('gambeta')){
    if (!qState('sahi')){ await say('Che, destrabaste un cliente. Tengo una jugada para enseñarte, pero primero mostrame que le agarraste la mano a La Base. Resolvé 8 problemas y hablamos.', 'sahi:serio'); qOpen('sahi'); return; }
    if (qReady('sahi')){ await say('¡Ahí está! Ya le agarraste la mano. Te enseño algo que aprendí jugando a la pelota en el barrio. Cuando el problema viene de frente, lo gambeteás.', 'sahi:risa'); await learn('gambeta', sayN); qDone('sahi'); return; }
    if (!r && Math.random() < .5 && !qCountOk('sahi')){ const [a, b] = qProg('sahi'); await say(`Vas ${a} de ${b} problemas. Dale que va, crack.`, 'sahi'); }
  }
  if (!r) await say(pick('sahi:lines', SAHI.lines), ['sahi', 'sahi', 'sahi:feliz', 'sahi:risa'][rnd(4)]);
  const t = await sahiTraining(); if (t === 'done') return;
  await sahiRally(t === 'rally');
}
/* el desafío de Sahi: un peloteo en la mesa. La primera vez que le ganás el punto, tus reflejos suben para siempre;
   después, un poco de experiencia (una vez entre pelea y pelea). */
async function sahiRally(skipAsk){
  const m = mem(), b = m.battles || 0;
  if (rainy()){ await say(pick('sahi:lluvia', ['Hoy la mesa está empapada. El peloteo queda para cuando pare.', 'Con lluvia no se pelotea: la pelota no pica, flota. Mañana te la cobro.']), 'sahi'); return; }
  const c = skipAsk ? 0 : await choose(['¡Un peloteo!', 'Ahora no']);
  if (c !== 0){ await say(pick('sahi:ppno', ['Dale, cuando quieras. La mesa no se va a ningún lado.', 'Te espero. Igual sigo con los jueguitos.']), 'sahi'); return; }
  await say(pick('sahi:ppgo', ['Saco yo. Apretá A cuando la pelota llegue a tu franja verde. Ni antes ni después: como un penal.', 'Dale. Devolvé cuando llegue a la franja verde. A la tercera me empiezo a cansar, no le digas a nadie.', '¡Vamos! Vos devolvé cuando llegue a tu paleta, que yo me encargo del resto.']), 'sahi:feliz');
  hideDlg();
  const res = await pingPongGame();
  m.ppGames = (m.ppGames || 0) + 1; m.ppBest = Math.max(m.ppBest || 0, res.hits);
  if (res.quit){ await say('¿Ya te vas? Bueno, la mesa queda acá.', 'sahi'); return; }
  if (res.win){
    m.ppWins = (m.ppWins || 0) + 1;
    await say(pick('sahi:pplost', ['¡Uh! ¡Se me fue larga! Bien jugado, crack.', '¡Qué devolución! Me dejaste parado como arquero en un penal.', 'Te llevaste el punto. Que no se entere nadie en la Bombonera.']), 'sahi:sorpresa');
    if (!S.flags.ppSpeed){ S.flags.ppSpeed = true; S.bonus.spd += 1; SFX.learn(); await say('Esos reflejos te van a servir en las reuniones. Tu velocidad subió de forma permanente.'); }
    else if (b > (m.ppAt ?? -1)){ m.ppAt = b; await gainXP(Math.max(8, Math.floor(need(S.lvl) * .08)), sayN); }
    else await say('La revancha con premio, después de tu próximo desafío. Ahora me hidrato.', 'sahi:risa');
  } else await say(pick('sahi:ppwon', [{if: () => res.hits >= 2, t: () => `${res.hits} devoluciones. ¡Nada mal! La próxima apretá en el momento justo.`}, 'Punto para mí. Pero jugaste con garra, eso me gusta.', 'Se te pasó la pelota. Tranqui, a mí me pasa con los mails.']), res.hits >= 3 ? 'sahi' : 'sahi:risa');
}

/* ================= LU ================= */
/* Lu: treinta y pico, re enérgica, cálida y graciosa; está en Bienestar y te recarga. Muy de vez en cuando se le
   escapa alguna palabra de los más jóvenes (y le erra), pero poco. Vive cantando temas de Aitana, Morat y Cruzando
   el Charco: los tararea, nunca se citan letras. */
const LU = {
  songs: [
    '♪ Na-na-naaa... ♪ ¡Ay! Me agarraste cantando. Acá se canta, ¿eh? Es parte del servicio.',
    '♪ La-la-laaa... ♪ ¡Perdón! Cuando estoy contenta, canto. Y estoy contenta casi siempre.',
    {d: 1, t: '♪ Na-na-naaa, na-na... ♪ ¡Ay! Me agarraste con un tema de Morat. ¿Los escuchás? Para trabajar son ideales.'},
    {d: 2, t: '♪ Uuuh, uh-uuuh... ♪ Perdón, tengo a Aitana en loop desde el lunes. Y no pienso pararla.'},
    {d: 3, t: '♪ La-la-la-laaa... ♪ ¡Cruzando el Charco a todo volumen! Bueno, a volumen Bienestar, que es moderado.'},
    {d: 4, t: '♪ Mmm-mm-mmm... ♪ Ese tema de Morat me hace llorar. Pero llorar lindo, ¿eh?'},
    {d: 5, t: '♪ Oh-oh-ooh... ♪ Si voy a un recital de Aitana me compro la remera, la gorra y el llavero. Y canto todo, aunque desafine.'},
    {d: 6, t: '♪ Tarara-raaa... ♪ ¡El de Cruzando el Charco que suena en todos los cumpleaños! Lo canto hasta en los míos.'},
  ],
  tips: ['¡Arriba esos hombros! ¡Uno, dos! ¡Eso!', '¿Tomaste agua? Me dijiste que sí muy rápido. Tomá un vaso igual.',
    'Hacé una pausa activa: estirá, respirá, mirá por la ventana. Cinco minutos y volvés con otra cabeza.',
    'Veinte segundos mirando lejos. ¡Más lejos! Eso es una pared, pero vale la intención.',
    {d: 1, t: 'Dormir ocho horas es mi secreto. De belleza, de productividad y de buen humor.'},
    {d: 2, t: '¿Viste mi planta? Se llama Gerardo. Le canto Morat todos los días y mirá lo lindo que está.'},
    {d: 3, t: '¡Estiramos! Brazos arriba como en un recital de Aitana. ¡Eso! Ahora abajo, despacito.'},
    {d: 3, t: 'Sahi me enseñó a decir "che". Lo practico todos los días. Sale raro, pero sale.'},
    {d: 6, t: 'Tato es el único que escucha música más tranquila que la mía. Le recomendé Morat; me recomendó reggae. Quedamos a mano.'},
    {d: 4, t: 'Le pedí a Agus una dinámica de karaoke. Me dijo "lo pienso". Yo ya armé la lista de temas.'},
    {d: 4, t: 'Ayer un pasante me dijo que algo era "re cringe". Le pregunté qué significaba y se fue. Sigo sin saber.'},
    {d: 1, t: 'Actitud positiva no es estar siempre bien: es tener dónde volver a estar bien. Para eso está Bienestar.'},
    {if: () => S.lvl >= 15, t: '¡Me enteré de que quedaste fij{o}! Te canto algo para festejar. ...Te lo canto igual aunque no quieras.'},
    {if: () => statusToday() && myBattery() <= 2, pri: true, t: 'Vi en el pizarrón de Brasil que tenías la batería en rojo. ¡Por eso existe Bienestar!'},
    {d: 3, t: 'Después del after, esto se llena. Yo ya tengo agua fría preparada. Y una lista de temas tranquilos.'},
    {if: () => tod() === 'noche' || tod() === 'madrugada', t: '¿Qué hacés despiert{o}? ¡A dormir! Mañana te despierto con Cruzando el Charco.'},
    {if: () => tod() === 'mañana', t: '¿Desayunaste? Un café no es un desayuno, es un "pre-desayuno". Lo dicen los jóvenes. Creo.'}],
};
async function talkLu(){
  const p = hpPct();
  SFX.sing();
  await say(pick('lu:song', LU.songs), 'lu:risa');
  let open;
  if (talks('lu') === 0) open = `¡Hola, {name}! Soy Lu. Si algo te cansa, este es tu lugar. Acá se recarga energía y se canta. Lo segundo es obligatorio.`;
  else if (fresh('lu', mem().lastLose)){ ack('lu', mem().lastLose); open = pick('lu:lose', ['¡Uh, vení! Te recargo y salís como cohete.', '¿Una mala racha? Nada que no arregle un tema de Aitana y un vaso de agua.', 'Ay, ese desafío costó. Vení que te recargo.']); }
  else if (p < .35) open = pick('lu:low', ['¡Uy, venís arrastrando los pies! ¡Vení que te enchufo!', '¿Qué te pasó? ¡Parecés un celular al dos por ciento!', '¡Estás sin pilas! Vení, que acá se recarga.']);
  else if (p >= .99) open = pick('lu:full', ['¡Estás impecable! Igual te hago un chequeo, que me encanta hacer chequeos.', '¡Vos estás al cien! ¿Viniste por el show? Bien hecho.', '¡Estás a full! Igual pasá, que te canto algo.']);
  else open = pick('lu:hi', ['¡Hola, {name}! ¡Vení, vení, que te dejo nuev{o}!', '¿Una pausa? ¡La mejor idea del día!', '¡Pasá! ¿Cómo venís? Contame mientras te recargo.']);
  await say(open, p < .35 ? 'lu:sorpresa' : 'lu:feliz');
  fullHeal(); SFX.heal();
  await say('Recuperaste toda tu energía y todos los usos de tus habilidades.');
  if (await luWaterFavor()) return;
  await say(pick('lu:tips', LU.tips), ['lu', 'lu:feliz', 'lu:risa'][rnd(3)]);
}

/* ================= PIMI =================
   Paid media (la pauta de las campañas), y todo lo tecnológico de la agencia termina pasando por él.
   Práctico y sencillo para hablar, come mucho, hace deporte (surfea en Rocha) y en las crisis tiene calma total.
   Compinche de Lía: los dos viven mirando los números de las campañas. */
const PIMI = {
  again: ['¿Volviste? Todo bien. Decime.', '¿Qué precisás? Si es rápido, lo resolvemos ya.', '¿Trajiste algo para comer? Pregunto nomás.'],
  R: {
    lose: [f => `${f} te complicó. Tranqui: se ajusta y se vuelve a lanzar. Como una campaña.`, f => `¿${f}? Es débil a lo técnico. Probá por ahí.`],
    boss: {explote: 'Explotó, pero controlado. Así me gustan las campañas.', logo: 'El logo quedó del mismo tamaño. Eso es eficiencia.', fantasma: 'La Clienta Fantasma respondió. Lo anoto como hito.'},
    level: [() => `Nivel ${S.lvl}. Buen rendimiento. Seguí así.`, () => `¡Subiste a ${S.lvl}! Bien ahí.`],
  },
  lines: [{d: 1, t: 'Todo lo tecnológico de la agencia, de alguna forma, termina pasando por mí. No sé bien cómo pasó. Pero pasó.'},
    {d: 2, t: 'Hoy la ola estaba de dos metros en La Paloma. Mañana a las siete estoy en el agua.'},
    'Si hacés algo dos veces, automatizalo. Si lo hacés tres, ya es tarde.', '¿Se cayó algo? Tranqui. Apagá, prendé y contame.',
    'La pauta es simple: el anuncio correcto a la persona correcta. Lo difícil es todo lo demás.',
    {d: 2, t: 'Un "cambio chiquito" en una campaña a las once de la noche no existe. Pero lo hago igual. Tranqui.'},
    {d: 3, t: 'Lía y yo miramos los números de las campañas como otros miran un partido. Ella grita los goles. Yo los anoto.'},
    {d: 2, t: 'Comí dos veces antes del mediodía. Es por el surf. Bueno, también como así los días que no surfeo.'},
    {d: 3, t: 'Corro, nado, surfeo. Y como. Es un equilibrio.'},
    {d: 5, t: 'Reni me convidó un mate y bajó el costo por clic. No tengo pruebas, pero tampoco dudas.'},
    {d: 4, t: 'Si una campaña no rinde, lo digo el primer día. Con transparencia se arregla más rápido.'},
    {d: 6, t: 'Sofi reinicia el router antes de que yo me entere de que se cayó. Buen equipo.'},
    {if: () => S.lvl >= 15, t: 'Ahora que quedaste fij{o} te doy acceso a la carpeta compartida de verdad. La otra era de prueba.'},
    {d: 4, t: 'Para el after llevo yo la comida. Siempre llevo de más. Siempre sobra poco.'},
    'Archivo_final, archivo_final_ahora_sí... Le puse fecha a todo y se terminó el problema.',
    {d: 3, t: 'Lo técnico es como el surf: si peleás contra la ola, te revuelca. Si la leés, la surfeás.'},
    () => `Llevás ${mem().stats.wins} problemas resueltos. Buen número.`,
    {if: () => S.pimiGiven <= 3, t: 'Tengo algo para vos. Volvé después de tu próxima reunión con cliente.'}],
};
async function talkPimi(){
  if (!S.flags.pimiMet){
    S.flags.pimiMet = true;
    await says([`${saludo()}! Soy Pimi. Hago paid media: la pauta de las campañas.`, 'Te doy una mano con lo técnico, pero primero mostrame que sabés resolver problemas.', 'Arrancá por algo simple: resolvé 2 Wifi Caído en La Base.'], 'pimi');
    qOpen('pimi_atajo'); return;
  }
  await opener('pimi', 'pimi', PIMI.again);
  if (await pimiFoodFavor()) return;
  const steps = [
    {q: 'pimi_atajo', give: async () => { await say('Listo. Te configuré los atajos de teclado. Vas a atacar primero.', 'pimi'); await learn('atajo', sayN); }, next: 'pimi_bug', nextIf: () => S.bosses >= 1, nextMsg: 'Ahora cazá 2 Bugsito. Aparecen en La Base.', wait: 'Destrabá al primer cliente y vas a ver aparecer Bugsitos. Ahí te doy la próxima tarea.'},
    {q: 'pimi_bug', give: async () => { await say('Bugs afuera. Te armé un monitor extra: ahora ves todo venir.', 'pimi'); S.bonus.def += 3; SFX.learn(); await say('Tu defensa subió de forma permanente.'); }, next: 'pimi_file', nextIf: () => true, nextMsg: 'Siguiente: ordená 3 Archivo_final_v7. Con un nombre claro se ahorra medio día.'},
    {q: 'pimi_file', give: async () => { await say('Archivos ordenados. Tomá este script: hace solo lo aburrido.', 'pimi'); await learn('automatizar', sayN); }, next: 'pimi_surf', nextIf: () => true, nextMsg: 'Lo último: destrabá a los tres clientes. Tengo algo especial guardado.'},
    {q: 'pimi_surf', give: async () => { await say('Los tres clientes. Bien ahí. Te presto mi tabla de surf, para cuando haya que remar contra la corriente.', 'pimi'); S.bonus.spd += 4; SFX.learn(); await say('Tu velocidad subió de forma permanente.'); }},
  ];
  for (const st of steps){
    const state = qState(st.q);
    if (state === 'done'){
      if (st.next && !qState(st.next)){ if (st.nextIf()){ await say(st.nextMsg, 'pimi'); qOpen(st.next); return; } else if (Math.random() < .6){ await say(st.wait, 'pimi'); return; } }
      continue;
    }
    if (state === 'open'){
      if (qReady(st.q)){ await st.give(); qDone(st.q); if (st.next && st.nextIf && st.nextIf()){ await say(st.nextMsg, 'pimi'); qOpen(st.next); } return; }
      const r = reaction('pimi', PIMI.R);
      if (r){ await say(r, 'pimi'); return; }
      if (Math.random() < .5 && !qCountOk(st.q)){ const [a, b] = qProg(st.q); await say(pick('pimi:prog', [`Vas ${a} de ${b}. Te falta poco.`, `Llevás ${a}/${b}. Tranqui, que sale.`, `${a} de ${b}. Seguí así.`]), 'pimi'); return; }
      break;
    }
  }
  const r = reaction('pimi', PIMI.R);
  await say(r || pick('pimi:lines', PIMI.lines), 'pimi');
}

/* ================= RENI =================
   Audiovisual: graba todo con el celular (reels, stories, videos del equipo). Es la mamá del equipo: cuida,
   convida mate y te pregunta si comiste. Siempre a la moda, le encantan las redes y los chismes (de los buenos).
   Habla tranquila, directa y dulce. Es la que tiene mate cuando Fede pide uno. */
const REGION = {'La Barbacoa': 'la barbacoa, la cocina del patio', 'Baño': 'el baño', 'La Base': 'La Base', 'El Patio': 'el patio', 'El Jardín': 'el jardín', 'La Vereda': 'la vereda', 'Archivos X': 'Archivos X, el lab de Pimi',
  'Bienestar': 'Bienestar', 'El Hall': 'el hall', 'Sala del Directorio': 'la Sala del Directorio', 'Planta Alta': 'el pasillo de arriba', 'Sala de Clientes': 'la Sala de Clientes',
  'Sala de Reuniones': 'la biblioteca', 'Brasil': 'Brasil, la oficina de Fede', 'Guaná': 'Guaná, la oficina de Agus y Lía', 'Asteroide': 'Asteroide, la oficina de Sofi y Tato'};
function reniWhere(){
  const r = NPCS.find(n => n.id === 'reni');
  if (r.away) return 'su casa: ya se fue, mañana vuelve';
  const M = MAPS[r.map], z = M && M.zones.find(z => r.x >= z.x && r.x < z.x + z.w && r.y >= z.y && r.y < z.y + z.h);
  return z ? (REGION[z.n] || z.n) : 'algún lado';
}
const RENI = {
  mateFede: ['¿Para Fede? Obvio. Tomá, este va con la yerba que le gusta. Decile que es de parte mía.', '¿Fede pidió mate otra vez? Es un caso. Tomá, llevaselo calentito.', 'Lo sabía: lo vi pasar con cara de "sin mate". Tomá, llevale este.'],
  convida: ['¿Comiste algo? Tomá un mate y después pasá por la cocina, ¿eh?', '¿Un amargo? Tomá, que recién lo cebé.', 'Mientras edito, mate. ¿Querés? Tomá uno.', '¡Vení, que convido! El termo está lleno.', 'Te convido uno. Del termo no se le niega a nadie.'],
  no: ['¡Ya te grabé! Va en el reel del viernes. Quedaste divin{o}.', 'Estoy editando en el celu. Vertical, siempre vertical.',
    {d: 1, t: '¿Viste el último video de la agencia? Tiene más vistas que el del cliente. No le digas.'}, {d: 2, t: 'Ese buzo te queda divino. Te lo digo en serio: de ropa sé.'},
    {d: 3, t: '¿Te enteraste? Sahi se cortó el pelo y no le dijo a nadie. Lo vi en una story.'}, {d: 2, t: '¿Comiste? Se te nota en la cara que no. Andá a la cocina.'},
    {d: 4, t: 'Pimi llegó con zapatillas nuevas. Ya las subí a las stories. Él todavía no sabe.'},
    {d: 6, t: '¿Sabías que Tato tiene una lista de reggae de catorce horas? La puso en el after y nadie se dio cuenta de cuándo terminó.'},
    {d: 5, t: 'Sofi compró fruta para toda la semana. Ya la filmé. Es contenido: "la agencia que cuida".'},
    {if: () => S.lvl >= 15, t: 'Ya subí la story: "{name}, Social Manager". Con fuegos artificiales y todo.'}, {d: 4, t: 'Lu cantó en la cocina y le grabé un video. Lo guardo para su cumpleaños.'},
    'Tengo un aro de luz nuevo para el celu. Pasá un día y te grabo para las redes.', {d: 3, t: 'Acá somos una familia. Rara, pero familia.'},
    {d: 4, t: 'Para el after llevo el termo. Los demás, lo que quieran.'}, {d: 1, t: 'El termo me dura toda la mañana. Bueno, hasta que pasa Fede.'},
    () => `Ya tengo ${(S.log._reni || 0)} videos tuyos. ¡Vas a ser tendencia!`],
};
async function talkReni(n){
  const m = mem(), b = m.battles || 0;
  if (!S.flags.reniMet){ S.flags.reniMet = true; await say('¡Hola, {name}! Soy Reni. ¡No te muevas, que te grabo!', 'reni'); }
  // si Fede está esperando su mate, Reni siempre tiene uno
  if (qState('fede_mate') === 'open' && !(S.items.mate > 0)){
    S.items.mate = 1; m.reniMateAt = b;
    await say(pick('reni:matefede', RENI.mateFede), 'reni');
    SFX.heal(); await say('Recibiste 1 Mate.');
    if (!S.reniGift) return;
  }
  if (S.reniGift){
    S.reniGift = false;
    let l;
    if (m.lastWin && fresh('reni', m.lastWin)){ ack('reni', m.lastWin); l = `¡Te grabé resolviendo a ${m.lastWin.name}! Saliste re concentrad{o}. Va para las stories.`; }
    else if (n.map === 'outside') l = pick('reni:out', ['¡Mirá estas aves del paraíso! Van para el reel. Vos también: ¡posá!', '¡Qué luz hay en el patio! Quedate quiet{o}... ¡grabando!', '¡Con la casona de fondo! Sonreí... ¡listo!']);
    else if (n.map === 'upstairs') l = pick('reni:up', ['¡Un video bajando la escalera! Despacito... ¡listo!', '¡Acá arriba hay una luz divina! Quiet{o}... ¡listo!']);
    else l = pick('reni:gift', ['¡Quiet{o} ahí, {name}! ...¡Listo! ¡Salió hermoso!', '¡Ay, qué lindo te queda ese color! Video, video.', '¡Esta luz está divina! Sonreí... ¡listo!', '¡Te encontré! Para el reel del viernes.', '¡No te muevas! Ahí... ¡perfecto!']);
    await say(l, 'reni');
    if (Math.random() < .55){
      const k = RENI_GIFTS[(S.log._reni = (S.log._reni || 0) + 1) % RENI_GIFTS.length];
      S.items[k] = (S.items[k] || 0) + 1; SFX.heal();
      await say(k === 'mate' ? pick('reni:givemate', ['Y tomá, te cebé uno. Del termo no se le niega a nadie.', 'Por posar tan bien, un mate de regalo.']) : pick('reni:give', ['Te traje algo por posar tan bien. Tomá.', 'Un regalito. Porque sí.', 'Tomá, para que sigas con todo. Y comé algo, ¿eh?']), 'reni');
      await say(`Recibiste: ${IT[k].n}.`);
    } else await say(pick('reni:nogift', ['Hoy no tengo nada para darte, pero el video quedó divino.', 'Te daría algo, pero me lo comí. Perdón. Era un alfajor.', 'La próxima te traigo algo, ¡prometido!']), 'reni');
    return;
  }
  // de vez en cuando te convida un mate
  if (b - (m.reniMateAt ?? -99) >= 3 && (S.items.mate || 0) < 3 && Math.random() < .55){
    m.reniMateAt = b; S.items.mate = (S.items.mate || 0) + 1;
    await say(pick('reni:convida', RENI.convida), 'reni'); SFX.heal(); await say('Recibiste 1 Mate.'); return;
  }
  await say(pick('reni:no', RENI.no), 'reni');
}

/* ================= MONTSERRAT ================= */
const MONTSE = {
  R: {
    lose: [f => `En esta casa se rompió una caldera, se inundó el sótano y se cayó un techo. Y acá estamos. ${f} no es el fin del mundo.`, f => `${f}, ¿eh? Los problemas difíciles son los que más enseñan.`],
    boss: {explote: 'La Clienta Explosiva. Me acuerdo de su padre: quería que "implote". Bien hecho.', logo: 'Don Logo. Una vez me pidió agrandar el número de la puerta de la casona. Bien hecho.', fantasma: 'Lograste que la Clienta Fantasma conteste. Eso no lo logré ni yo.'},
  },
  lines: ['Una buena idea se defiende sola. Una mala necesita una presentación de cuarenta diapositivas.',
    'Las ideas son como las plantas de esta terraza: si no las mirás todos los días, se te secan.',
    'En esta casa hubo bailes, cumpleaños y una mudanza que duró tres años. Ahora hay ideas. Me gusta más.',
    'Las mejores ideas llegan cuando te estás divirtiendo. Por eso hay ping pong abajo. Bueno, por eso y porque Sahi insistió.',
    'Una idea que no te da un poquito de miedo no es una idea: es un trámite.',
    'Si la idea entra en una frase, es buena. Si necesita un asterisco, todavía no.',
    'Con los años aprendí a disfrutar el camino. El resultado dura un día; el camino, mucho más.',
    'Las ideas no tienen dueño. La casa sí: soy yo. ¡Ja!',
    'Los jueves, cuando hay after en el patio, me asomo desde acá. Nadie me ve. Yo los veo a todos.',
    'Esta casa es de todos los que la cuidan. Por eso la cuidan tan bien.',
    'Sofi cuida esta casa como si fuera suya. A veces mejor que yo. ¡Ja!',
    {if: () => S.lvl >= PROJECT_LVL, t: 'Project Leader en mi casa. Me gusta cómo suena. Ahora cuidá a los que llegan, como te cuidaron a vos.'},
    'Un buen equipo vale más que una buena idea. Pero tener las dos es mejor.', 'Los clientes difíciles enseñan más que los fáciles. No se lo digas a ellos.', 'El secreto es escuchar más de lo que hablás. Y tener siempre galletitas.',
    'En mis tiempos el "ctrl+z" era una goma de borrar. Y funcionaba igual.', 'Nunca presentes una idea en la que no creés. Se nota en los ojos.', 'Una agencia es su gente. Lo demás son computadoras.',
    'Cuando todos opinan, alguien tiene que decidir. Ojalá que sea quien escuchó a todos.', 'Si una reunión no tiene objetivo, el objetivo es salir de la reunión.',
    () => `Llevás ${seenCount()} problemas en la bitácora. Cuando la llenes, venime a contar.`,
    
    {if: () => tod() === 'noche', t: 'A esta hora se escriben los mejores textos y se toman las peores decisiones. Elegí bien.'}],
};
async function talkMontse(){
  if (!S.flags.montseMet){
    S.flags.montseMet = true;
    await says(['...', 'Así que llegaste hasta acá arriba. Soy Montserrat.', 'Esta casona es mía. Hace años le presté un cuarto a la agencia; ahora la agencia me presta la terraza. ¡Ja!', 'Subo a mirar la ciudad cuando necesito pensar. O cuando no quiero pensar, que también hace falta.', 'Me contaron de vos. Que entrenás con Fede aunque te cueste. Que Sahi te enseñó a gambetear. Que los tres clientes quedaron conformes.'], 'montse');
  }
  if (!S.flags.done){
    await says(['Te falta una sola cosa: La Gran Presentación. Y para eso hace falta algo que no se enseña en ningún curso.'], 'montse');
    if (!S.skills.includes('vision')){ await learn('vision', sayN); await say('Visión. Ver lo que nadie ve. Usala bien.', 'montse'); }
    await say('¿Estás list{o}?', 'montse');
    const c = await choose(['Estoy list{o}', 'Todavía no']);
    if (c !== 0){ await say(pick('montse:wait', ['Bien. Prepararse también es parte del trabajo. Te espero acá.', 'Bajá, respirá, volvé. La ciudad no se va a ningún lado.']), 'montse'); return; }
  } else {
    const r = reaction('montse', MONTSE.R);
    await say(r || pick('montse:lines', MONTSE.lines), 'montse');
    if (mem().montseIdea !== gameDay()){
      if (!qState('ideas')) qOpen('ideas');
      const ci = await choose(['Escuchar una idea', 'Presentar de nuevo', 'Mirar la ciudad'], {cancel: 2});
      if (ci === 0){ await montseIdea(); return; }
      if (ci === 2){ await say(pick('montse:city', ['Linda vista, ¿no? Desde acá los problemas se ven más chicos.', 'Cada ventana es una historia. Algunas son clientes nuestros.']), 'montse'); return; }
    } else {
    const c = await choose(['Presentar de nuevo', 'Mirar la ciudad']); if (c !== 0){ await say(pick('montse:city', ['Linda vista, ¿no? Desde acá los problemas se ven más chicos.', 'Cada ventana es una historia. Algunas son clientes nuestros.']), 'montse'); return; }
    }
  }
  hideDlg();
  const res = await bossBattle('final', 'final');
  if (res === 'win' && !S.flags.done){ S.flags.done = true; qDone('terraza'); if (qState('objetivo') === 'open') qDone('objetivo'); await ending(); qOpen('anual'); }
  else if (res === 'win') await say('Impecable. Como siempre que se prepara bien.', 'montse');
}

/* ================= SOFI Y TATO: ASTEROIDE (Administración, planta alta) =================
   Sofi se ocupa de la oficina: cuida a todos, que la casa esté linda, que haya fruta, que anden las compus y el
   internet. Cálida, práctica y atenta ("¿comiste?"). Te da fruta y, si le llevás una a Tato, te enseña "Todo en orden".
   Tato es el contador: lleva los números. Relajado, con reggae tranqui sonando bajito en el parlante de Asteroide; su gracia es que anda en otra
   cosa, a otro ritmo que el resto (contesta tarde, se entera después). No participa mucho de la aventura. */
const SOFI = {
  again: ['¿Volviste? ¿Comiste algo?', '¿Todo bien? ¿Precisás algo?', 'Si es por el wifi, ya lo reinicié.'],
  R: {
    lowhp: ['Estás pálid{o}. Comé una fruta y pasá por lo de Lu, ¿sí?', 'Uy, venís sin pilas. Sentate un ratito, que nadie te apura.'],
    lose: [f => `¿${f} te dejó sin energía? Pasa. Tomá agua, comé algo y volvé con otra cabeza.`],
    boss: {explote: '¿La Clienta Explosiva quedó conforme? Menos mal. La última vez el que explotó fue el tóner de la impresora.', logo: '¡Don Logo aprobó! Le había impreso el logo en A3, por las dudas. No hizo falta.', fantasma: '¡La Clienta Fantasma respondió! Ya preparé café por si viene a visitarnos.'},
    level: [() => `¡Nivel ${S.lvl}! Esto se festeja con fruta.`],
  },
  gift: ['Te guardé una fruta. Comé algo, que te veo con cara de reunión larga.', 'Tomá, una fruta. La compré hoy. Bueno, el lunes. Pero está buenísima.', 'Para el camino. Con hambre nadie piensa bien. Preguntale a Pimi.'],
  lines: ['Si algo se rompe, se traba o se acaba, avisame. Seguro ya lo estoy arreglando, pero avisame igual.',
    {d: 1, t: 'Administración es la parte de los papeles. La otra parte es la casa: que esté linda, que ande internet, que prendan las compus y que haya fruta. Esa también es mía.'},
    {d: 2, t: 'Reinicié el router a las ocho y cuarto. A las ocho y veinte nadie se acordaba de que se había caído. Así me gusta.'},
    {d: 3, t: 'La casa es de todos, pero alguien tiene que acordarse de regar las plantas. Esa soy yo. Bueno, y Lu les canta.'},
    {d: 3, t: '¿Sabés cuál es el secreto para que una oficina funcione? Que nadie se entere de todo lo que se arregló.'},
    'Si la impresora dice "atasco de papel", no le creas. Llamame.',
    {d: 2, t: 'Compré fruta para toda la semana. Va a durar hasta el miércoles. Por Pimi.'},
    {d: 4, t: 'Pimi se ocupa de lo técnico de las campañas; yo, de que la compu prenda y el internet ande. Entre los dos, el wifi no tiene escapatoria.'},
    {d: 4, t: 'Cuidar la casa también es cuidar a la gente. Una silla rota a la mañana es un mal día a la tarde.'},
    {d: 2, t: 'A Tato le dejo la fruta al lado del teclado. Si no la ve, no existe.'},
    {d: 5, t: 'Fede me pidió otro termo para la oficina. Ya van tres. Reni dice que no alcanza.'},
    {d: 5, t: 'Los afters del jueves los organizo yo. Bueno, yo compro el hielo. Que es organizar.'},
    'Me encanta cuando llega alguien nuevo: es una persona más a la que preguntarle si comió.',
    '¿Precisás algo? Una silla, un cargador, una contraseña del wifi, una curita. Tengo de todo.',
    {d: 6, t: 'Cuando todo se desordena, primero se ordena. Después se sigue. Funciona con los cables y con los días.'},
    {if: () => S.lvl >= 15, t: 'Ahora que quedaste fij{o} te toca tu propia taza. Elegí color. Bueno, quedan verdes.'},
    {d: 7, t: 'Montserrat me dijo que cuido esta casa como si fuera mía. Le dije que es de todos. Se rió y me dio la llave del placard.'},
    {if: () => talks('tato') === 0, t: 'Ah, ¿no conociste a Tato? Es el que está al lado de la mesa, con el reggae sonando. Hablale fuerte, que no te escucha.'}],
};
async function talkSofi(){
  const m = mem(), b = m.battles || 0;
  if (!S.flags.sofiMet){
    S.flags.sofiMet = true;
    await say(`${saludo()}, {name}! Soy Sofi, de Administración. ¡Bienvenid{o} a la casa!`, 'sofi:feliz');
    await say('Te cuento cómo funciona esto, cortito: acá se aprende resolviendo. Los problemas aparecen entre las pilas de pendientes de La Base, y cada uno que resolvés te deja experiencia.', 'sofi');
    await say('Cada persona del equipo te va a enseñar algo. Si no sabés qué hacer, tocá AYUDA. La jornada es de 9 a 18, y si te quedás sin energía, Lu te recarga en Bienestar. ¡Y comé algo!', 'sofi');
    await say('Mirá, así es la casa:', 'sofi');
    await panelInfo('LA CASA', casaHTML()); closePanel();
    await say('La agencia la dirigen Agus, Lía y Fede: en los procesos los vas a ver como AZ, LÍ y FD. Y Montserrat es la dueña de la casona: está en la terraza, y casi nadie llega hasta allá.', 'sofi');
    S.items.fruta = (S.items.fruta || 0) + 1; m.sofiFruitAt = b; SFX.heal(); await say('Tomá una fruta, para que arranques con energía.', 'sofi'); await say('Recibiste una Fruta.');
    await say(S.flags.tatoMet ? 'A Tato ya lo conociste, ¿no? El contador, el del reggae. Bueno: ahora pasá por Brasil, la primera oficina de este piso, que Fede te quiere conocer.' : 'Él es Tato, el contador. Saludalo, que con el reggae no te va a ver. Y después pasá por Brasil, la primera oficina de este piso: Fede te quiere conocer.', 'sofi');
    return;
  }
  // el favor de la fruta, recién cuando ya conociste a Tato
  if (S.flags.tatoMet && !qState('sofi_fruta')){
    await say('¿Ya conociste a Tato? Bien. ¿Me hacés un favor? No comió nada desde las nueve: está con los números y su reggae, y se olvida. Llevale esto, porfa.', 'sofi');
    S.items.frutaTato = 1; await say('Recibiste Fruta para Tato.'); qOpen('sofi_fruta'); return;
  }
  if (qState('sofi_fruta') === 'open'){
    if (!S.flags.tatoFruta){
      if (!(S.items.frutaTato > 0)) S.items.frutaTato = 1;
      await say(pick('sofi:remind', ['Tato está acá nomás, al lado de la mesa. Hablale fuerte, que con el reggae no escucha mucho.', '¿Y? ¿Comió? ...Todavía no, ¿no? Andá, andá, que si no se le hace de noche.']), 'sofi');
      return;
    }
    await say('¿Comió? ¡Gracias! Ahora sí le van a cerrar los números.', 'sofi'); qDone('sofi_fruta');
    S.items.fruta = (S.items.fruta || 0) + 1; SFX.heal(); await say('Recibiste una Fruta.');
    await say('¿Querés saber cómo mantengo todo en orden? Primero mostrame que sabés ordenar lo tuyo: resolvé cinco problemas en La Base. Los pendientes también se ordenan.', 'sofi');
    qOpen('sofi_orden'); return;
  }
  if (qState('sofi_orden') === 'open' && qReady('sofi_orden')){
    await say('¡Vi cómo bajaron las pilas de La Base! Te enseño algo que hago todos los días: cuando todo se desordena, primero se ordena. Después se sigue.', 'sofi');
    await learn('orden', sayN); qDone('sofi_orden'); return;
  }
  await opener('sofi', 'sofi', SOFI.again);
  const r = reaction('sofi', SOFI.R);
  if (!r && b - (m.sofiFruitAt ?? -99) >= 3 && (S.items.fruta || 0) < 3){
    m.sofiFruitAt = b; await say(pick('sofi:gift', SOFI.gift), 'sofi');
    S.items.fruta = (S.items.fruta || 0) + 1; SFX.heal(); await say('Recibiste una Fruta.');
    return;
  }
  await say(r || pick('sofi:lines', SOFI.lines), 'sofi');
}

const TATO = {
  again: ['...Uh, ¿estabas ahí? Perdón, estaba en otra.', '¿Me hablabas a mí? Dale, decime.', 'Tranqui, tranqui. ¿Qué precisás?'],
  R: {
    // Tato se entera de todo un rato después
    boss: {explote: 'Me contaron lo de la Clienta Explosiva. ¿Ya pasó? Uh. Bueno, felicitaciones atrasadas.', logo: '¿Don Logo aprobó? ...¿Hace cuánto? Ah, mirá. Igual me alegro.', fantasma: '¿La Clienta Fantasma respondió? Yo todavía le estoy esperando una factura. Pasale el dato.'},
    level: [() => `¿Nivel ${S.lvl}? Qué bueno. ¿Desde cuándo? ...Ah, recién. Bueno, llegué a tiempo por una vez.`],
  },
  lines: [{d: 1, t: '¿Escuchás el parlante? Es reggae. Bajito, pero reggae. Me acomoda el ritmo para los números.'},
    {d: 2, t: '¿Cómo salió lo del cliente? ...¿El de la semana pasada? ¿Ya pasó? Bueno, me alegro igual.'},
    {d: 2, t: 'El reggae tiene un ritmo que va un poquito atrás del tiempo. Yo también.'},
    'Los números no se apuran. Si los apurás, se equivocan.',
    {d: 4, t: 'Lía me pidió un número "para ayer". Le dije que ayer ya cerró. Hoy se lo paso.'},
    {d: 3, t: '...Sí, a las cuatro. ¿Qué? Ah, perdón, le contestaba a Sofi. Me había preguntado algo hace un rato.'},
    {d: 2, t: 'Sofi me trae fruta. Yo le llevo las facturas ordenadas. Es un buen intercambio.'},
    {d: 3, t: '¿Llegaste recién? Yo también. Bueno, llegué a las nueve, pero recién ahora me di cuenta.'},
    'Si una planilla da error, no es la planilla. Es el apuro.',
    {d: 4, t: 'Tengo una lista de reggae de catorce horas. La empecé en marzo.'},
    {d: 5, t: 'Sahi me contó el partido entero. Yo seguía con el del domingo anterior. Igual estuvo bueno.'},
    {d: 3, t: '¿Un "cambio chiquito"? En contabilidad no hay cambios chiquitos. Hay redondeos.'},
    'Tranqui. Respirá. Ahora sumá.',
    '¿Ya es viernes? ...Ah, no. Bueno, igual.',
    {d: 6, t: 'Fede me preguntó si estaba todo bien con los números. Le dije que sí. Me ofreció un mate para festejar. Acepté. Uno no festeja todos los días que esté todo bien.'},
    {d: 6, t: 'Lu me recomendó Morat. Yo le recomendé reggae. Ahora cada uno escucha lo suyo, pero más contentos.'},
    {if: () => S.lvl >= 15, t: '¿Quedaste fij{o}? Ah, por eso me llegó un papel nuevo para los sueldos. Hace dos semanas. Felicitaciones atrasadas.'},
    {d: 5, t: 'La transparencia en los números es eso: que cualquiera los pueda mirar y entender. Hasta Lía. Sobre todo Lía.'}],
};
async function talkTato(){
  if (!S.flags.tatoMet){
    S.flags.tatoMet = true;
    await says(['...', 'Ah, ¡hola! Perdón, no te había visto. Soy Tato. Llevo los números.', 'Vos tranqui: si algo no cierra, se vuelve a sumar.'], 'tato');
    if (!(S.items.frutaTato > 0)) return;
  }
  if (S.items.frutaTato > 0){
    S.items.frutaTato = 0; S.flags.tatoFruta = true;
    await says(['Uh, fruta. ¿Es para mí? ...¿De parte de Sofi? Claro. Siempre se da cuenta antes que yo de que tengo hambre.', 'Gracias. Ahora la como. Bueno, cuando termine esta canción. Y la que viene.', 'Bienvenid{o}, {name}. ¿Era tu primer día? ...Ah, ¿hace rato? Bueno, bienvenid{o} igual.'], 'tato');
    await say('Tato ya tiene su fruta. Contale a Sofi.');
    return;
  }
  await opener('tato', 'tato', TATO.again);
  const r = reaction('tato', TATO.R);
  await say(r || pick('tato:lines', TATO.lines), 'tato');
}

/* ================= EL STATUS (el pizarrón de Brasil) =================
   Cada uno pone del 1 al 5 cómo está a nivel personal, laboral, de salud, en el amor y cuánta batería le queda.
   Los del equipo cambian día a día (con su estilo: Tato siempre con batería); vos anotás lo tuyo y la batería
   la marca tu energía. Si algo está bajito, Agus lo ve y te ofrece charlar. */
const STATUS_ROWS = ['Personal', 'Laboral', 'Salud', 'Amor', 'Batería'];
const STATUS_TEAM = [['FD', [0, 1, 0, 0, 0]], ['S', [1, 0, 0, 1, 0]], ['R', [1, 0, 0, 0, 0]], ['T', [0, 0, 0, 0, 2]], ['P', [0, 0, 1, 0, -1]]];
const today = () => 'dia' + gameDay();
const dayNum = () => gameDay();
const statusToday = () => !!(S.status && S.status.day === today());
const statusLow = () => statusToday() && S.status.v.some(v => v <= 2);
const myBattery = () => Math.max(1, Math.round(hpPct() * 5));
/* con lluvia a algunos se les baja un poco lo personal (a Tato no: para él es el mejor día) */
const STATUS_RAIN = [0, -1, -1, 1, -1];
function teamScore(c, r){ return clamp(3 + STATUS_TEAM[c][1][r] + (hash(dayNum(), c * 7 + r) % 3) - 1 + (r === 0 && rainy() ? STATUS_RAIN[c] : 0), 1, 5); }
function statusHTML(){
  const cell = v => v == null ? '<td>—</td>' : `<td class="v${v}">${v}</td>`;
  let h = '<table class="statusT"><tr><th></th>' + STATUS_TEAM.map(([n]) => `<th>${n}</th>`).join('') + '<th class="me">VOS</th></tr>';
  STATUS_ROWS.forEach((row, r) => {
    const mine = r === 4 ? myBattery() : statusToday() ? S.status.v[r] : null;
    h += `<tr><th class="rw">${row}</th>` + STATUS_TEAM.map((_, c) => cell(teamScore(c, r))).join('') + (mine == null ? '<td class="me">—</td>' : `<td class="me v${mine}">${mine}</td>`) + '</tr>';
  });
  return h + `</table><div class="k">Del 1 al 5. ${statusToday() ? 'Tu batería la marca tu energía.' : 'Todavía no anotaste lo tuyo hoy.'}</div>`;
}
async function statusBoardLook(){
  const m = mem();
  if (!m.statusSeen){ m.statusSeen = true; await say('El pizarrón de Brasil: el status del equipo. Cada uno pone del 1 al 5 cómo está a nivel personal, laboral, de salud, en el amor y cuánta batería le queda.'); }
  await panelInfo('EL STATUS', statusHTML()); closePanel();
  const c = await choose([statusToday() ? 'Actualizar mi status' : 'Anotar mi status', 'Dejar así']);
  if (c !== 0) return;
  const v = [];
  for (const [i, q] of ['¿Cómo estás a nivel personal?', '¿Y en lo laboral?', '¿Cómo andás de salud?', '¿Y en el amor?'].entries()){
    await say(q); v[i] = 1 + await choose(['1', '2', '3', '4', '5'], {cancel: null});
  }
  S.status = {day: today(), v};
  await say(`Tu batería la pone tu energía: ${myBattery()} de 5.`);
  await panelInfo('EL STATUS', statusHTML()); closePanel();
  if (v.some(x => x <= 2)) await say('Agus mira este pizarrón todas las mañanas. Seguro te pregunta cómo estás. Acá eso se cuida.');
  else if (v.every(x => x >= 4)) await say('Todo arriba. Se nota en cómo caminás.');
  else await say('Anotado. Ser transparente también es esto.');
}

/* ================= CLIENTES ================= */
const CLIENT_LINES = {
  post: {explote: ['¡EXPLOTÓ! ¡Les dije que iba a explotar! Bueno, ustedes lo hicieron explotar. ¡Pero yo lo dije!', 'Ahora quiero que la próxima explote más. Con confeti. ¿El confeti explota? Averigüen.', 'Les mandé el link a toda mi familia. Mi tía lloró. De emoción, creo.', '¡Los amo! Profesionalmente. Pero los amo.'],
    logo: ['Aprobado, sí. Pero el azul me sigue pareciendo muy azul. Lo dejo asentado.', 'Mi sobrino dijo que está profesional. Yo le dije que está bien. Bien, nomás. Tampoco exageremos.', 'Les traje alfajores. No son para festejar, eh. Es que sobraban. Bueno, los compré para ustedes.', 'No me quejo. Bueno, me quejo un poco: esta silla sigue siendo incomodísima.', 'Está bien. ...No le digas a nadie que dije que está bien.', '¿Sabés qué es lo peor? Que no encuentro de qué quejarme. Eso también me molesta.'],
    fantasma: ['Quedó divino. Era exactamente lo que tenía en la cabeza. Bueno, en la cabeza no lo tenía tan claro, pero quedó igual.', 'Les mando un audio de diez minutos con el feedback. Es todo positivo. Creo. Lo grabé en el ascensor.', 'Contale a todos que la idea fue mía. Bueno, nuestra. Bueno, de ustedes. ¡Pero yo la inspiré!', '(Visto) ...¡Perdón! Lo vi, lo amé y me olvidé de contestar. Lo amé, eh.']},
  back: {explote: '¡Volviste! ¡Sabía que ibas a volver! Yo sigo queriendo que explote. ¡Que EXPLOTE!', logo: 'Volviste. Tardaste. Se me enfrió el café. Bueno, igual estaba rico. Rico para ser café de reunión. ¿El logo ya está más grande?', fantasma: '¡Ay, volviste! Te estaba esperando hace horas. Bueno, recién llego. Pero mentalmente estaba acá.'},
};
/* los clientes con ficha hablan con su retrato (y si no, solo con su nombre) */
const bossWho = (key, mood) => (typeof PORTRAIT_MOODS !== 'undefined' && PORTRAIT_MOODS[key]) ? key + (mood ? ':' + mood : '') : null;
async function talkBoss(key, n){
  const idx = BOSS_ORDER.indexOf(key), d = BOSS[key];
  if (S.beaten[key]){ await say(pick(key + ':post', CLIENT_LINES.post[key]), bossWho(key, 'serio'), {name: d.n}); return; }
  // un pasante recién llegado no se presenta ante un cliente sin que antes lo presenten en la agencia
  if (welcomeStep() < 3 && !S.flags['met_' + key]){ await say({explote: '¡Hola, hola! ¿Sos nuev{o}? ¡Me encanta lo nuevo! Pero primero que te presenten en la agencia, y después hablamos de algo que EXPLOTE.', logo: '¿Y vos quién sos? Nadie me avisó que venía alguien. Típico. Bueno, no es tu culpa. Que primero te presenten en la agencia, y después hablamos del logo.', fantasma: '(Visto.) ...¡Ay, perdón, no te había visto! ¿Sos nuev{o}? Que primero te presenten en la agencia. Después te cuento lo que necesito. Bueno, si me acuerdo.'}[key], bossWho(key), {name: d.n}); return; }
  // los clientes van en orden: el próximo es el primero de la lista que todavía no quedó conforme
  const next = BOSS_ORDER.find(k => !S.beaten[k]), nextName = next ? ({fantasma: 'la ', explote: 'la '}[next] || '') + BOSS[next].n : '';
  if (next && idx > BOSS_ORDER.indexOf(next)){ await say(pick('boss:wait', [`Primero tenés pendiente la reunión con ${nextName}.`, `Estoy esperando, pero antes tenés que ver a ${nextName}.`])); return; }
  const intro = {
    explote: ['¡Ah, vos sos de la agencia! ¡Perfecto! ¡Me encanta tu energía! Bueno, todavía no la vi, pero me la imagino.', 'Quiero algo que EXPLOTE. Que la gente lo vea y diga ¡WOW! ¡Fuegos artificiales! ¡Confeti! ¡Un caballo!', '¿Qué es "algo"? No sé. ¡Por eso los contraté! Ustedes son los genios.'],
    logo: ['Bueno, por fin. Hace veinte minutos que espero. Y esta silla es incomodísima. No es una queja. Bueno, sí.', 'Vi la propuesta. Está... bien. Supongo. No me cierra el color. Ni la letra. Ni el fondo. Ni el aire que tiene. Pero el esfuerzo se nota, eh.', 'Y el logo es chiquito. Siempre es chiquito. ¿Lo podemos agrandar? Un poquito. No, más. MÁS. Ahí. No, un poquito menos.'],
    fantasma: ['¡Holaaa! Perdón, estuve a mil. Tres semanas sin contestar, sí. Estuve en un retiro. De mails.', '¿Cómo va eso? Lo necesito para ayer. Bueno, para hoy. Bueno, cuando puedan, pero que sea ayer.', '¿Qué es "eso"? Lo que hablamos. Está clarísimo. Algo como lo de siempre, pero distinto. Ustedes entienden.', 'El brief fue perfecto. Lo soñé, lo grabé en un audio y lo mandé. Bueno, creo que lo mandé.'],
  };
  if (S.flags['met_' + key]) await say(CLIENT_LINES.back[key], bossWho(key), {name: d.n});
  else { S.flags['met_' + key] = true; for (const l of intro[key]) await say(l, bossWho(key), {name: d.n}); }
  const fede = NPCS.find(x => x.id === 'fede'), withFede = key === BOSS_ORDER[2] && S.flags.fedeMet && !fede.away;
  if (key === BOSS_ORDER[2] && !S.flags.fantasmaFedeHint){ S.flags.fantasmaFedeHint = true; await say(fede.away ? 'Esta es la más difícil de las tres. Fede ya se fue por hoy, pero mañana te puede acompañar.' : 'Esta es la más difícil de las tres. No tenés que hacerlo sol{o}: Fede puede bajar a acompañarte.'); }
  const opts = withFede ? ['¡Arranquemos!', 'Ir con Fede', 'Prepararme antes'] : ['¡Arranquemos!', 'Prepararme antes'];
  let c = await choose(opts, {cancel: opts.length - 1});
  if (withFede && c === 1){
    await say('Llamás a Fede. Baja de Brasil con el mate en la mano.');
    await say(pick('fede:ally', ['Vamos juntos. Vos presentás; yo te banco. Si te trabás, acá estoy.', 'Dale. La reunión es tuya: yo pongo el hombro y el mate.']), 'fede');
    PENDING_ALLY = 'fede'; c = 0;
  } else if (withFede && c === 2) c = 1;
  if (c !== 0){ await say(key === 'fantasma' ? pick('fan:later', ['Ah, ¿me vas a hacer esperar a mí? ¡Me encanta! Así me siento importante.', 'Andá, andá. Yo mientras tanto desaparezco un ratito. Es mi especialidad.', 'Perfecto. Yo mientras tanto no respondo ningún mail. Para que estemos parejos.']) : key === 'logo' ? pick('logo:later', ['Andá, andá. Total, yo espero. Siempre espero.', 'Perfecto. Otra vez a esperar. Me encanta esperar. (No me encanta.)', 'Dale. Mientras tanto voy anotando lo que no me gusta. Traje una libreta grande.']) : pick('boss:later', ['¡Te espero! Pero no mucho, que me aburro y se me ocurren ideas.', '¡Dale! Yo mientras pienso en fuegos artificiales. Literales.', 'Andá. Yo voy pensando más ideas. Tengo como cuarenta.']), bossWho(key), {name: d.n}); return; }
  hideDlg();
  const res = await bossBattle(key, 'boss');
  if (res === 'win'){
    S.beaten[key] = true; S.bosses++; logEvent('boss', {foe: key, name: d.n});
    if (key === 'logo') await say('Bueno... está bien. Aprobado. Pero que conste que no estoy del todo conforme. Nunca estoy del todo conforme.', bossWho(key, 'serio'), {name: d.n});
    if (key === 'fantasma') await say('¡Ay, es exactamente lo que quería! No sabía que lo quería, pero es exactamente eso. ¡Aprobado!', bossWho(key, 'feliz'), {name: d.n});
    await say(`¡Destrabaste a ${({explote: 'la ', fantasma: 'la '})[key] || ''}${d.n}! Clientes conformes: ${S.bosses}/3.`);
    await clientWay(key);
    if (key === BOSS_ORDER[2] && S.flags.allyWin) await say(pick('fede:allywin', ['¿Viste? Solo se llega más rápido; juntos se llega más lejos. Y vos la presentaste.', 'Yo solo cebé mates. La reunión la sacaste adelante vos. Bueno, un poco los dos.']), 'fede:feliz');
    if (S.bosses >= 3){ if (qState('clientes') === 'open') qDone('clientes'); qOpen('tarjeta', true); await say('Agus y Lía te quieren ver en Guaná, su oficina de la planta alta.'); }
    else await say('Pasá por Archivos X, el lab de Pimi, y por la mesa de ping pong del patio: seguro tienen algo para vos.');
  }
}


async function ending(){
  await says(['Eso fue Visión. Y un poco de suerte, no te voy a mentir.', 'Ahora disfrutalo, que eso también se entrena.', 'Bienvenid{o} de verdad a la casa, {name}.'], 'montse');
  await say('¿Viste? Lo importante es todo lo que aprendiste para llegar hasta acá.', 'fede');
  await say('¡Golazo, crack! ¡Esto se festeja con asado!', 'sahi');
  await say('Con calma...', 'agus:feliz');
  await say('¡...y a full!', 'lia');
  await say('Esto se festeja comiendo. Yo llevo la comida.', 'pimi');
  await say('♪ La-la-laaa... ♪ ¡Y yo pongo la música!', 'lu:risa');
  await say('Yo ya tengo la fruta y el hielo.', 'sofi');
  await say('...¿Qué festejamos? ¡Ah! ¡Bien ahí! Llegué justo.', 'tato');
  await say('¡Foto grupal! ¡Todos juntos! ...¡Listo! Va directo a las redes.', 'reni');
  await say('La programo para las siete, que es cuando más se ve. Y con subtítulos.', 'alejo');
  await say('Ya la guardé: Agencia_Festejo_Foto_v01. Sin "final".', 'giuli');
  await say('La Gran Presentación fue un éxito. La agencia celebra.');
  await say('FIN. ¿O el lunes que viene entra otro brief? Podés seguir jugando, completar la bitácora y llegar al nivel 25: en la Sala del Directorio te espera el Cliente del Año.');
}


/* ================= ALEJO Y GIULI: LOS SPECIALISTS (La Base) =================
   Una dupla: andan siempre juntos (Giuli sigue a Alejo por su rincón de La Base) y se completan.
   Alejo es Social Media Specialist: el que más sabe de redes. Giuli es Design Specialist:
   la que más sabe de diseño. Los dos son muy artísticos (fotos de rollo, cine y playlists; libretas, letras y
   referencias de todos lados). Cada uno te enseña lo suyo, hasta dos capacitaciones por día, con una pregunta al final para fijarla:
   no se aprueba ni se reprueba, si no sale se explica y se vuelve a probar. */
const DUO_LESSONS = {
  giuli: [
    {title: 'Nombrar archivos', lines: [
      'Primera capacitación: nombrar archivos. Parece una pavada, y es lo que más tiempo le ahorra a todo el equipo.',
      'La fórmula: Cliente_Proyecto_Pieza_Medida_Versión_Fecha. Por ejemplo: Yerba_Lanzamiento_PostIG_1080x1350_v02_20261016.',
      'Sin espacios, sin tildes y sin eñes. La fecha al revés, año-mes-día, así los archivos se ordenan solos.',
      'Y la palabra "final" está prohibida. Lo final no existe: existe v01, v02, v03. Si dice "final_FINAL2", alguien sufrió.'],
      q: '¿Cuál de estos archivos está bien nombrado?', a: 'Yerba_Lanzamiento_PostIG_1080x1350_v02_20261016.psd', o: ['logo final FINAL2 (copia).ai', 'nuevo diseño post último.psd'],
      why: 'Fijate que el bueno dice de quién es, qué es, qué medida tiene, qué versión y de cuándo. Sin espacios ni "final".'},
    {title: 'Ordenar editables', lines: [
      'Segunda capacitación: ordenar editables. Un editable es para que lo pueda abrir otra persona. Mañana, en un año, o vos medio dormid{o}.',
      'Una carpeta por proyecto, siempre igual: 01_Brief, 02_Referencias, 03_Editables, 04_Exportados, 05_Entregado.',
      'Adentro del archivo: capas con nombre y agrupadas, mesas de trabajo nombradas, nada oculto que no sirva.',
      'Y cuando lo pasás, empaquetado: con las tipografías y las imágenes vinculadas. Si al abrirlo aparecen cuadraditos rosas, faltó empaquetar.'],
      q: 'Le pasás un editable a otra persona. ¿Qué no puede faltar?', a: 'Las tipografías y las imágenes vinculadas, todo empaquetado', o: ['Un PNG en baja para que se dé una idea', 'Un audio explicando dónde está cada cosa'],
      why: 'Si faltan las tipos o los links, el archivo se abre roto. Empaquetar es dejarle todo listo al que sigue.'},
    {title: 'Archivos para impresión', lines: [
      'Tercera capacitación: archivos para imprenta. La pantalla perdona; el papel, no.',
      'Color en CMYK, no en RGB. Imágenes a 300 dpi al tamaño real. Y 3 milímetros de sangrado, con marcas de corte.',
      'Los textos, por lo menos a 3 o 4 milímetros del borde: es el margen de seguridad. El corte nunca es perfecto.',
      'Se exporta un PDF para imprenta con las tipografías incrustadas. Y si el color importa mucho, se pide una prueba antes de imprimir todo.'],
      q: '¿Qué hace falta para mandar un afiche a imprenta?', a: 'CMYK, 300 dpi y 3 mm de sangrado', o: ['RGB a 72 dpi, como en la pantalla', 'Una captura de pantalla en alta'],
      why: 'La imprenta trabaja con tintas (CMYK), necesita resolución real (300 dpi) y un poquito de sobra para cortar (el sangrado).'},
  ],
  alejo: [
    {title: 'Contactar influencers', lines: [
      'Primera capacitación: contactar influencers. Lo primero no es cuántos seguidores tiene: es si su comunidad se parece al público de la marca.',
      'Mirá la interacción real: comentarios de verdad, no solo corazones. Y que su contenido tenga que ver con la marca.',
      'El primer mensaje, corto y personal: quiénes somos, qué marca, qué proponemos y que vimos su contenido. Nada de copiar y pegar.',
      'Después, todo por escrito: qué se entrega, fechas, quién aprueba, cuánto tiempo se puede usar el contenido y cuánto se paga.'],
      q: '¿Qué mirás primero en el perfil de una influencer?', a: 'Que su comunidad se parezca al público de la marca', o: ['Cuántos seguidores tiene, y listo', 'Si te sigue a vos'],
      why: 'Muchos seguidores que no son el público de la marca no sirven. Importa a quién le habla y cómo le responden.'},
    {title: 'Lineamientos de contenido', lines: [
      'Segunda capacitación: lineamientos de contenido. Son las reglas para que la marca suene igual la publique quien la publique.',
      'Tono de voz: cómo habla la marca y cómo no habla. Con ejemplos de sí y de no, que se entiende mejor.',
      'Pilares: tres a cinco temas de los que la marca habla siempre. Y formatos, uso de emojis, hashtags, colores y tipografías.',
      'Un buen lineamiento entra en pocas páginas. Si nadie lo lee, no sirve.'],
      q: '¿Para qué sirven los lineamientos de contenido?', a: 'Para que la marca suene igual la publique quien la publique', o: ['Para tener un PDF lindo para el cliente', 'Para no tener que pensar ideas nuevas'],
      why: 'Los lineamientos dan coherencia: cualquiera del equipo puede publicar y sigue sonando a la marca.'},
    {title: 'Guidelines audiovisuales', lines: [
      'Tercera capacitación: guidelines para producciones audiovisuales. Lo que se define antes de grabar, para no lamentarlo después.',
      'Formato: vertical 9:16 para reels e historias. Duración. Y un gancho en los primeros tres segundos, o pasan de largo.',
      'Subtítulos siempre: mucha gente mira sin sonido. Cuidá la luz, el encuadre y las zonas donde la app tapa con botones.',
      'Música con derechos, logo y cierre definidos, y un guion o lista de tomas aprobado antes del rodaje. Reni lo agradece.'],
      q: 'Vas a grabar un reel. ¿Qué tenés en cuenta?', a: 'Vertical 9:16, gancho en los primeros segundos y subtítulos', o: ['Horizontal y sin sonido, que es más prolijo', 'Que dure diez minutos, para contar todo'],
      why: 'En redes se mira en vertical, rápido y muchas veces sin sonido: el gancho y los subtítulos hacen que se quede.'},
  ],
};
const DUO = {
  again: [{t: [['alejo', '¿Volviste? Justo estábamos mirando referencias.']]}, {t: [['giuli', '¿Otra vez por acá? Bien. Acá se aprende mirando.']]}, {t: [['alejo', '¡Ey! Pasá, que hay lugar en la dupla. Bueno, en el trío.']]}],
  lines: [
    {t: [['giuli', 'Yo hago que se vea bien.'], ['alejo', 'Y yo, que lo vea la gente.'], ['giuli', 'Y ninguno publica nada sin que el otro lo mire.']]},
    {d: 1, t: [['giuli', 'Si encuentro un archivo que se llama "nuevo_final_ahora_sí", lo renombro. Con cariño, pero lo renombro.'], ['alejo', 'Lo hace. Lo vi.']]},
    {d: 1, t: [['alejo', 'Las redes cambian cada semana. Si los lunes no aprendés algo nuevo, el viernes ya quedaste viejo.']]},
    {d: 2, t: [['giuli', 'Antes de diseñar miro mucho: afiches en la calle, libros viejos, etiquetas de vino. Todo es referencia.']]},
    {d: 2, t: [['alejo', 'Reni graba en cualquier rincón de la agencia, con el celu y un aro de luz. Todo lo que graba, después lo publico yo.']]},
    {d: 2, t: [['giuli', 'Cuando entré, Alejo me mostró cómo se hacía todo acá.'], ['alejo', 'Y ahora te toca a vos aprender con nosotros. Así funciona esta casa.']]},
    {d: 3, t: [['alejo', 'Saco fotos con una cámara de rollo. Treinta y seis fotos: te obliga a pensar cada una.'], ['giuli', 'Y después me pide que elija las mejores. Siempre elijo la movida.']]},
    {d: 3, t: [['giuli', 'Reni graba, Alejo publica y yo hago que todo combine.'], ['alejo', 'Y Pimi revisa que no pese tanto. Equipo.']]},
    {d: 4, t: [['giuli', 'Tengo una libreta donde dibujo letras. Algún día hago mi propia tipografía. Ya tiene nombre.'], ['alejo', 'Tiene nombre de archivo.'], ['giuli', 'Tipografia_Giuli_v01. Es un nombre.']]},
    {d: 4, t: [['alejo', 'Giuli me dice cuando algo no funciona en el diseño, y yo le digo cuando algo no funciona en el feed.'], ['giuli', 'Nos lo decimos de frente. Con cariño y con referencias.']]},
    {d: 5, t: [['alejo', 'Armamos una playlist para trabajar juntos.'], ['giuli', 'Tato dice que le falta reggae. Lu dice que le falta Aitana. Está quedando rarísima.']]},
    {d: 5, t: [['alejo', 'Un buen posteo no es el más lindo: es el que alguien guarda o le manda a un amigo.'], ['giuli', 'Igual, si además es lindo, mejor.']]},
    {d: 6, t: [['giuli', 'Mi parte favorita del laburo es cuando un archivo bien armado llega a la imprenta y vuelve perfecto.'], ['alejo', 'La mía es cuando alguien comenta "¿quién hizo esto?". Y fuimos nosotros.']]},
    {if: () => tod() === 'tarde', t: [['alejo', 'A esta hora se mira mucho el celular. Es buen momento para publicar.'], ['giuli', 'Y para un café. Las dos cosas.']]},
    {if: () => S.lvl >= 15, t: [['giuli', '¡Quedaste fij{o}! Ya te armé la firma de mail.'], ['alejo', 'Y yo te sigo en todas las redes. Las del laburo, tranqui.']]},
  ],
};
const duoName = id => id === 'giuli' ? 'Giuli' : 'Alejo';
const duoOther = id => id === 'giuli' ? 'alejo' : 'giuli';
async function duoSay(x, me){
  if (Array.isArray(x)){ for (const [w, t] of x) await say(t, w); }
  else if (x) await say(x, me);
}
async function talkDuo(n){
  const me = n.id, other = duoOther(me), m = mem();
  if (!S.flags.duoMet){
    S.flags.duoMet = true;
    const hiA = first => say(first ? `${saludo()}, {name}! Soy Alejo, Social Media Specialist. Todo lo que pasa en redes pasa primero por acá.` : 'Y yo soy Alejo, Social Media Specialist. Todo lo que pasa en redes pasa primero por acá.', 'alejo');
    const hiG = first => say(first ? `${saludo()}, {name}! Soy Giuli, Design Specialist. Todo lo que se ve, pasa por mis manos.` : 'Y yo soy Giuli, Design Specialist. Todo lo que se ve, pasa por mis manos.', 'giuli');
    if (me === 'giuli'){ await hiG(true); await hiA(false); } else { await hiA(true); await hiG(false); }
    await say('Somos los specialists de la agencia. Andamos siempre juntos: el diseño y las redes no se separan.', other);
    await say('Cada uno te enseña lo suyo. Hasta dos capacitaciones por día: lo que se aprende hay que practicarlo antes de sumar lo siguiente.', me);
    qOpen('giuli_clases', true); qOpen('alejo_clases'); 
    await duoClassMenu(me, true);
    return;
  }
  const r = reaction(me, {lowhp: ['Venís sin pilas. Pasá por Bienestar, que Lu te recarga. La capacitación te espera.']});
  if (r){ await say(r, me); return; }
  if (await duoPractice()) return;
  if (talks(me) > 0 && sinceTalk(me) < 30000) await duoSay(pick('duo:again', DUO.again), me);
  await duoClassMenu(me, false);
}
/* la práctica: la habilidad de cada uno llega cuando ponés en práctica sus capacitaciones */
async function duoPractice(){
  if (qState('giuli_practica') === 'open' && qReady('giuli_practica')){
    await say('¡Lo pusiste en práctica! Se nota en cómo dejás las cosas. Ahora sí: ojo de diseño. Nombrás, ordenás y mandás a imprenta sin que nada se pierda.', 'giuli');
    await learn('diseno', sayN); qDone('giuli_practica'); return true;
  }
  if (qState('alejo_practica') === 'open' && qReady('alejo_practica')){
    await say('¡Eso es práctica! Influencers, lineamientos y guidelines, aplicados. Te enseño a mirar las redes con criterio.', 'alejo');
    await learn('redes', sayN); qDone('alejo_practica'); return true;
  }
  if (qState('alejo_crono_practica') === 'open' && qReady('alejo_crono_practica')){
    await say('¡Así se arma un cronograma! Relevamiento, carpetas, lineamientos, diseño, revisión, ejecución y reporte. Ya podés planificar un mes entero como se hace acá.', 'alejo');
    await learn('cronograma', sayN); qDone('alejo_crono_practica'); return true;
  }
  if (qState('giuli_practica') === 'done' && qState('alejo_practica') === 'done' && !S.skills.includes('dupla')){
    if (S.lvl >= 15){ await say('Che, Giuli... ¿se lo damos?', 'alejo'); await say('Se lo ganó. Diseño y redes, juntos. Como nosotros.', 'giuli'); await learn('dupla', sayN); return true; }
    const m = mem(); if (m.duplaHint !== gameDay()){ m.duplaHint = gameDay(); await say('Tenemos algo que enseñarte entre los dos. Cuando llegues al nivel 15, venís.', 'alejo'); }
  }
  return false;
}
/* qué capacitación toca hoy con cada uno */
function duoNext(who){ const k = who === 'giuli' ? 'lesGiuli' : 'lesAlejo', i = S.flags[k] || 0, L = DUO_LESSONS[who]; return i < L.length ? i : -1; }
/* capacitaciones: hasta dos por día con cada uno (las partidas viejas guardaban solo el día) */
const PER_DAY = 2;
const dayCount = (o, k) => { const v = (o || {})[k]; return v && typeof v === 'object' ? (v.d === gameDay() ? v.n : 0) : (v === gameDay() ? 1 : 0); };
const dayMark = (o, k) => { o[k] = {d: gameDay(), n: dayCount(o, k) + 1}; return o[k].n; };
const duoToday = who => dayCount(mem().duoDay, who) >= PER_DAY;
async function duoClassMenu(me, first){
  const label = who => { const i = duoNext(who), L = DUO_LESSONS[who], tag = who === 'giuli' ? 'diseño' : 'redes';
    return i < 0 ? `Repasar ${tag} con ${duoName(who)}` : `Capacitación con ${duoName(who)}: ${L[i].title}`; };
  const crono = S.lvl >= TRAININGS.cronograma.minLvl && trainingNext('cronograma') >= 0;
  const opts = [label('giuli'), label('alejo')].concat(crono ? [`Cronograma con Alejo: ${TRAININGS.cronograma.sessions[trainingNext('cronograma')].title}`] : [], ['Charlar un rato', 'Nada, gracias']);
  let c = await choose(opts, {cancel: opts.length - 1});
  if (crono && c === 2){
    if (trainingToday('cronograma')){ await say('Por hoy ya hicimos dos del cronograma. Mañana seguimos con la fase que sigue.', 'alejo'); return; }
    if (!qState(TRAININGS.cronograma.quest)) await say('Te enseño el proceso de cronograma tal como lo hacemos acá. Son seis capacitaciones, hasta dos por día. Anotá todo, que esto se usa todos los meses.', 'alejo');
    if (await trainingSession('cronograma')) await say('¡Terminaste el proceso de cronograma! Ahora, a la práctica: resolvé cinco desafíos y volvé, que te enseño a planificar como se planifica acá.', 'alejo');
    return;
  }
  if (crono && c > 2) c--;
  if (c === 0 || c === 1){
    const who = c === 0 ? 'giuli' : 'alejo', i = duoNext(who);
    if (i < 0) return duoReview(who);
    if (duoToday(who)){ await say(pick('duo:hoy', ['Por hoy ya está: lo de hoy hay que practicarlo. Mañana seguimos.', 'Dos por día, no más. Si no, se pisan. Mañana te espero.', 'Hoy ya aprendiste algo conmigo. Dormilo y mañana vamos por la siguiente.']), who); return; }
    return duoLesson(who, i);
  }
  if (c === 2) return duoSay(pick('duo:lines', DUO.lines), me);
  if (!first) await say(pick('duo:bye', ['Dale. Acá estamos.', 'Cuando quieras.', 'Andá tranqui, que no nos movemos de La Base. Bueno, un poquito.']), me);
}
async function duoLesson(who, i){
  const les = DUO_LESSONS[who][i], m = mem();
  for (const l of les.lines) await sayLine(l, who);
  // la pregunta: no se aprueba ni se reprueba; si no sale, se explica y se vuelve a probar
  let tries = 0;
  for (;;){
    await say(les.q, who);
    const opts = [les.a, ...les.o].map(t => ({t, k: Math.random()})).sort((a, b) => a.k - b.k).map(o => o.t);
    const c = await choose(opts, {cancel: null});
    if (opts[c] === les.a){ await say(pick('duo:ok', ['¡Eso! Lo tenés.', '¡Exacto! Así se hace.', 'Perfecto. Eso es lo que hace la diferencia.']), who); break; }
    tries++; await say(tries === 1 ? 'Casi. ' + les.why : les.why + ' Probemos otra vez.', who);
    if (tries >= 2) await say('Tranqui: equivocarse es la mitad de aprender.', duoOther(who));
  }
  const k = who === 'giuli' ? 'lesGiuli' : 'lesAlejo';
  S.flags[k] = i + 1; m.duoDay = m.duoDay || {}; const nToday = dayMark(m.duoDay, who);
  SFX.learn(); await say(`Aprendiste: ${les.title}.`);
  await gainXP(Math.max(12, Math.floor(need(S.lvl) * .2)), sayN);
  if (who === 'giuli' && i === 0) await say(S.skills.includes('nombrar') ? 'Se nota que ya te cruzaste con Archivo_final_v7 en La Base. Ahora sabés por qué existe.' : 'Con esto, cuando te cruces a Archivo_final_v7 en La Base, ya sabés por dónde agarrarlo.', 'alejo');
  const L = DUO_LESSONS[who];
  if (i + 1 >= L.length){
    if (who === 'giuli'){ await say('¡Terminaste mis capacitaciones! Ahora viene lo importante: ponerlas en práctica. Resolvé seis problemas en La Base y volvé, que te enseño algo que solo se aprende haciendo.', 'giuli'); qDone('giuli_clases'); qOpen('giuli_practica'); }
    else { await say('¡Terminaste mis capacitaciones! Ahora, a la cancha: resolvé seis desafíos aplicando todo esto y volvé. Ahí te enseño lo mío.', 'alejo'); qDone('alejo_clases'); qOpen('alejo_practica'); }
  } else await say(nToday < PER_DAY ? pick('duo:next1', ['Si te da la cabeza, más tarde hacemos la siguiente. Hoy entran dos.', 'Andá a practicar un rato y, si querés, a la tarde seguimos con otra.']) : pick('duo:next', ['Listo por hoy: dos ya es un montón. Mañana seguimos.', 'Por hoy, suficiente. Mañana, la que sigue.']), who);
}
async function duoReview(who){
  const L = DUO_LESSONS[who], c = await choose(L.map(l => l.title).concat('Nada')), cancel = L.length;
  if (c < 0 || c === cancel) return;
  for (const l of L[c].lines) await sayLine(l, who);
  await say(pick('duo:rev', ['Repasar también es aprender.', 'Lo que se repasa, se queda.']), duoOther(who));
}

/* ================= DESAFÍOS QUE PIDEN OFICIO =================
   Las habilidades de los personajes se ganan cumpliendo sus desafíos, y además piden un nivel mínimo.
   Si ya cumpliste pero te falta nivel, quien te lo pidió te lo dice antes de charlar. */
const LVL_GIVERS = {fede: ['Fede'], agus: ['Agus', 'Agus y Lía'], lia: ['Lía', 'Agus y Lía'], sahi: ['Sahi'], pimi: ['Pimi'], sofi: ['Sofi'], giuli: ['Giuli', 'Alejo'], alejo: ['Alejo', 'Giuli']};
async function lvlGate(n){
  const names = LVL_GIVERS[n.id]; if (!names || !S.quests) return;
  // si hay algo para entregarte ahora, primero eso
  if (Object.keys(S.quests).some(q => QUESTS[q] && names.includes(QUESTS[q].giver) && S.quests[q] === 'open' && qReady(q))) return;
  const id = Object.keys(S.quests).find(q => QUESTS[q] && names.includes(QUESTS[q].giver) && qWaitLvl(q)); if (!id) return;
  const who = (n.id === 'giuli' || n.id === 'alejo') ? QUESTS[id].giver.toLowerCase() : n.id;
  await say(pick(n.id + ':lvlwait', [`¡Ya lo cumpliste! Lo que te quiero enseñar pide un poco más de oficio: volvé cuando llegues al nivel ${QUESTS[id].minLvl}.`,
    `Lo hiciste, y lo vi. Pero esto se aprende con más camino: nivel ${QUESTS[id].minLvl}. Seguí resolviendo, que ya llega.`]), who);
}

/* ================= EL CLIENTE DEL AÑO (Sala del Directorio, desde el nivel 25) =================
   El cliente más difícil de la agencia. Hay que presentarle la campaña del año: todo lo aprendido, en una reunión. */
async function talkAnual(n){
  const d = BOSS.anual;
  if (S.flags.anual){ await say(pick('anual:post', ['La campaña del año. Así se presenta. Nos vemos el año que viene: vayan pensando.', 'Ya la aprobó el directorio. Y mi familia. Y el directorio de mi familia.', 'Mandé a enmarcar la presentación. La voy a colgar en el living. Y en el baño.', 'Hace años que no me sorprendían. Gracias.']), bossWho('anual', 'feliz')); return; }
  if (!S.flags.met_anual){
    S.flags.met_anual = true;
    for (const l of ['Así que vos sos quien llegó hasta acá. Sentate. No, mejor parate: queda más épico.', 'Vi todas las campañas de todas las agencias. Todas. Algunas dos veces, porque me dormí.', '¿El habano? No lo prendo nunca. Lo uso para señalar. Queda más dramático.', 'Este año quiero algo que nunca vi. La campaña del año. ¿La traés?']) await say(l, bossWho('anual'));
  } else await say(pick('anual:back', ['¿Volviste? Bien. El directorio no espera, pero yo sí. Un ratito.', 'La campaña del año no se improvisa. ¿Ya la tenés?']), bossWho('anual'));
  const c = await choose(['Presentar la campaña del año', 'Prepararme antes'], {cancel: 1});
  if (c !== 0){ await say(pick('anual:later', ['Preparala bien. Yo voy a estar acá, sentado en la cabecera.', 'Andá. Hablá con tu equipo: las mejores campañas nunca son de una sola persona.']), bossWho('anual', 'sorpresa')); return; }
  hideDlg();
  const res = await bossBattle('anual', 'final');
  if (res === 'win'){
    S.flags.anual = true; logEvent('boss', {foe: 'anual', name: d.n}); if (qState('anual')) qDone('anual');
    await say('¡Presentaste la campaña del año! El Cliente del Año aplaude de pie.');
    await say('Nunca vi nada así. Aprobada. Sin cambios. Es la primera vez que digo "sin cambios".', bossWho('anual', 'risa'));
    await say('¡Sabía que lo ibas a lograr! ¿Te acordás de tu primer entrenamiento? Mirá hasta dónde llegaste.', 'fede:feliz');
    await say('Esto es lo que pasa cuando alguien aprende de todos. Bienvenid{o} a otro nivel.', 'agus:feliz');
    await say('¡Lo medí! ¡Récord histórico de la agencia! ¡Ya está en el tablero!', 'lia:risa');
  }
}

/* ================= MARGA (limpieza, de 9 a 12) =================
   Tiene 60 años y es la que está hace más tiempo en la agencia. Dulce ("mi vida", "corazón"), llega antes que nadie
   y trabaja hasta las 12; cuando se va, se escucha desde toda la casa: "¡Hasta mañanaaa!!!". Le encanta mostrarte
   fotos de sus nietas en el celular y contarte de sus viajes por Europa. */
const MARGA = {
  fotos: ['Mirá, esta es de cuando fueron a la playa. ¡La más chica no quería salir del agua!', 'Esta es del acto de la escuela. Hizo de flor. La flor más linda, obviamente.',
    'Esta la saqué yo. Está un poquito movida, pero es que no se quedan quietas nunca.', 'Esta es nueva: a la más grande se le cayó un diente. ¡Mirá qué sonrisa!',
    'Acá están con la abuela, o sea yo, comiendo torta. Bueno, la torta casi no salió en la foto.', 'Esta me la mandaron hoy. Me dibujaron a mí. ¡Con el balde y todo!'],
  viajes: ['¿Te conté de Roma? Tiré una moneda en la Fontana di Trevi y pedí volver. ¡Y volví! Dos veces.', 'En París subí a la torre. Es más chica de lo que parece en las fotos. Igual le saqué cuarenta.',
    'En Madrid comí churros con chocolate bien temprano. A mi edad, ¡qué aventura!', 'En Venecia me perdí tres veces. Todas las calles tienen agua y todas las vueltas terminan en una heladería.',
    'En Lisboa los tranvías suben unas cuestas que ni te cuento. Me acordé de casa.', 'El año que viene quiero conocer Grecia. Ya estoy juntando. Y aprendiendo a decir "gracias" en griego.'],
  lines: ['Cuidado que está mojado, corazón. Pasá por el costadito, así. ¡Muy bien!', 'Trabajo hasta las doce, mi vida. Después me voy a buscar a las nietas.',
    {d: 1, t: 'Yo llego antes que nadie. Me gusta la casa en silencio, con olor a limpio.'},
    {d: 2, t: 'Esta casa la vi crecer. Cada escritorio nuevo, cada planta. Es como de la familia.'},
    {d: 2, t: 'Cuando llegué, la agencia era una mesa, dos compus y una pava. Mirá ahora.'},
    {d: 3, t: 'Si perdés algo, preguntame. Yo sé dónde está todo. Hasta lo que nadie busca.'},
    {d: 3, t: 'Lu me canta mientras limpio. Yo le bailo un poquito. Que no nos vea nadie.'},
    {d: 4, t: 'Sofi y yo somos las que cuidamos la casa. Ella, de que anden las compus; yo, de que brille.'},
    {d: 4, t: 'Lo más lindo de este trabajo es la gente. Siempre hay alguien que me pregunta cómo estoy.'},
    {d: 5, t: 'A Fede lo conozco desde que tomaba el mate solo. Ahora el mate es de todos. Así tiene que ser.'},
    {if: () => gameMin() >= 11*60 + 30, pri: true, t: 'Ya casi me voy. A las doce en punto, ¡como un relojito!'},
    {if: () => S.lvl >= 15, t: '¡Me contaron que quedaste fij{o}! Ahora sí sos de la casa, mi vida.'}],
};
async function talkMarga(){
  const m = mem();
  if (!S.flags.margaMet){
    S.flags.margaMet = true;
    await says(['¡Hola, mi vida! Soy Marga. Yo limpio la casa y, entre nosotros, soy la que está hace más tiempo.', 'Cuando llegué, acá había una mesa, dos compus y una pava. ¡Mirá ahora!'], 'marga');
    await say('¿Te muestro una foto de mis nietas? Es un segundito.', 'marga');
    if (await choose(['¡Mostrame!', 'Después'], {cancel: 1}) === 0) await margaFotos();
    else await say('Bueno, después. Pero no te salvás, ¿eh?', 'marga');
    return;
  }
  await opener('marga', 'marga', ['¿Otra vez por acá, corazón?', '¡Volviste! ¿Te conté de mis viajes?', 'Pasá, pasá, que ya seco.']);
  // una vez por día te convida algo
  if (m.margaGift !== gameDay() && Math.random() < .5){ m.margaGift = gameDay(); await say('Tomá, te hice un cafecito. Que con el estómago vacío no se piensa.', 'marga'); S.items.cafe = (S.items.cafe || 0) + 1; SFX.heal(); await say('Recibiste un Café.'); }
  const r = Math.random();
  if (r < .35){ await say(pick('marga:fotoq', ['¿Te muestro una foto nueva de mis nietas?', 'Mirá lo que me mandaron hoy... ¿querés ver?']), 'marga');
    if (await choose(['¡A ver!', 'Después'], {cancel: 1}) === 0) await margaFotos(); else await say('Bueno, te la guardo para mañana.', 'marga'); }
  else if (r < .65) await say(pick('marga:viaje', MARGA.viajes), 'marga');
  else await say(pick('marga:lines', MARGA.lines), 'marga');
  if (gameMin() >= 11*60 + 50) await say('¡Bueno, me voy! ¡Hasta mañanaaa!!!', 'marga');
}
async function margaFotos(){
  await say('Marga te muestra el celular. Tiene como cuarenta fotos de sus nietas. En todas están sonriendo.');
  await say(pick('marga:foto', MARGA.fotos), 'marga');
  await say(pick('marga:foto2', ['¿Viste qué divinas? Salieron a la abuela.', 'Son lo más lindo que tengo. Bueno, eso y esta casa.', 'Ay, me pongo chocha. Perdoná, mi vida.']), 'marga');
}

/* ================= LOS VALORES DE LA AGENCIA =================
   Lo primero que te cuenta Agus cuando la conocés. También están en la hoja del tablero negro de La Base. */
const VALORES = [
  ['Transparencia', 'Ser sinceros y honestos en cualquier actitud o decisión.'],
  ['Colaboración', 'Trabajando en equipo y compartiendo conocimiento llegamos más lejos.'],
  ['Actitud positiva', 'Nuestra manera de percibir el día a día y ser resolutivos.'],
  ['Aprendizaje', 'Buscamos formas más eficientes de cumplir objetivos: en constante desarrollo.'],
  ['Sentido de pertenencia', 'Somos comunidad: valoramos el lugar, la gente, los clientes y el trabajo.'],
];
const PROPOSITO = 'Creamos estrategias de comunicación que generan un impacto positivo en el crecimiento de nuestros clientes, las personas y el planeta.';
const valoresHTML = () => '<div style="font-size:2.5cqw;line-height:1.16;display:flex;flex-direction:column;gap:.35cqw">' + `<div class="k">Propósito</div><div>${PROPOSITO}</div><div class="k" style="margin-top:.4cqw">Valores</div>` + VALORES.map(([n, d]) => `<div><b>${n}.</b> ${d}</div>`).join('') + '</div>';
async function agusValores(){
  await say('Con Lía fundamos la agencia en 2010, cuando el marketing digital recién empezaba.', 'agus');
  await say('¡El nombre es un condimento japonés: chiquita pero picante! ¡Hoy, todavía más picante!', 'lia:risa');
  await say('Esto es lo que nos une: un propósito y cinco valores. Los vas a ver en todo lo que hacemos.', 'agus');
  await panelInfo('PROPÓSITO Y VALORES', valoresHTML()); closePanel();
  await say('¡No son un cartel en la pared! Bueno, sí: está en el tablero negro de La Base. ¡Pero sobre todo son cómo trabajamos!', 'lia:risa');
  S.flags.valores = true;
}
async function valuesLook(){
  await say('Un tablero negro con agujeritos. Tiene pegada una hoja que dice "Nuestros valores".');
  await panelInfo('PROPÓSITO Y VALORES', valoresHTML()); closePanel();
}

/* ================= CAPACITACIONES CON PROCESOS DE LA AGENCIA =================
   Los procesos reales de la agencia, explicados por el personaje que corresponde. Una sesión por día, cada una con
   preguntas para fijarla (si no sale, se explica y se vuelve a probar). Al terminar todas, hay que ponerlas en práctica
   para que el personaje te enseñe la habilidad. Todo queda en el menú "Capacitaciones" para repasarlo.
   Para sumar un proceso nuevo: agregarlo a TRAININGS con su personaje, nivel, sesiones, tarea, práctica y habilidad. */
const TRAININGS = {
  carpetas: {who: 'fede', title: 'Orden de carpetas', minLvl: 3, quest: 'fede_carpetas', practice: 'fede_carpetas_practica', skill: 'carpetas',
    sessions: [
      {title: 'Para qué y la carpeta del equipo', lines: [
        'El objetivo del orden es facilitar el acceso a los archivos, para dar un servicio más eficiente y más rápido de cara al cliente. Y sobre todo, para usar el tiempo en potenciar las campañas y no buscando cosas mal guardadas.',
        'Todo vive en la carpeta del equipo: EQUIPO NOMBRE, por ejemplo EQUIPO CHILI. Ahí se trabaja todo lo del equipo. Nunca en Documentos, Descargas o el Escritorio: esas carpetas no tienen respaldo.',
        'Los miembros del equipo sincronizan la carpeta del equipo, no la de cada cliente. Si alguien de otro equipo nos ayuda con un cliente en particular, le compartimos la carpeta de ese cliente, entera, para que acceda a todos los insumos.',
        'Adentro de EQUIPO NOMBRE hay: 00 Procesos NOMBRE EQUIPO; 01 INACTIVAS, con todos los exclientes después de un mes sin activar; y una carpeta por CLIENTE, por ejemplo GRIDO.'],
        quiz: [{q: '¿Dónde se trabaja?', a: 'En la carpeta del equipo, que tiene respaldo', o: ['En el Escritorio, que está a mano', 'En Descargas'],
                why: 'Documentos, Descargas y el Escritorio no tienen respaldo. Todo se trabaja en la carpeta del equipo.'},
               {q: 'Un excliente lleva un mes sin activar. ¿Adónde va su carpeta?', a: 'A 01 INACTIVAS', o: ['Se borra', 'Se queda donde está'],
                why: 'Los exclientes pasan a 01 INACTIVAS después de un mes sin activar: no se borran, se ordenan.'}]},
      {title: 'La carpeta del cliente: año y Extras', lines: [
        'Adentro de cada CLIENTE hay una carpeta por año. Dentro del año, una carpeta por mes y una adicional para Extras.',
        'Cada mes tiene: 01 Cronograma, 02 Materiales, 03 Editables, 04 Finales y 05 Reporte.',
        'En Extras se crean solo las carpetas de campañas o recursos adicionales a la planificación Always On de la marca. Adentro de cada una: 01 Creatividad, 02 Materiales, 03 Editables y 04 Finales.',
        'Las campañas extras van siempre dentro de Extras, en la carpeta del año en que se hizo la campaña.'],
        quiz: [{q: '¿Qué carpetas tiene cada mes?', a: '01 Cronograma, 02 Materiales, 03 Editables, 04 Finales y 05 Reporte', o: ['Una sola carpeta con todo adentro', 'Cronograma y Varios'],
                why: 'Cada mes tiene sus cinco carpetas numeradas, siempre iguales, así cualquiera encuentra todo.'},
               {q: '¿Dónde va una campaña extra?', a: 'En Extras, dentro del año en que se hizo', o: ['En la carpeta del mes, mezclada con el Always On', 'En el Escritorio, hasta que termine'],
                why: 'Lo que es adicional al Always On va en Extras, dentro del año de la campaña.'}]},
      {title: 'Las otras carpetas del cliente', lines: [
        'Además de los años, cada cliente tiene otras carpetas. Carpeta Cliente Cliente: las últimas versiones de cronogramas, los reportes en PDF, las producciones audiovisuales y todo lo que queramos compartir con el cliente, ordenado por año y producciones.',
        'Materiales: todo lo que mandó el cliente. Ahí no hay nada creado por la agencia, salvo que hayamos hecho la identidad visual de la marca: el logo y el manual de identidad. Los materiales de las campañas extras van dentro de cada campaña extra, no acá.',
        'Planificación Estratégica: brief, diagnóstico, plan de medios, conceptos creativos y manual de contenidos, cada uno en su carpeta con sus complementos. Adentro, una carpeta por año con cada plan de medios, manual de contenidos, etc.',
        'Producciones WASABI Cliente: lo que hacen las producciones audiovisuales de la agencia (Content Creator, Social Medias y productoras), ordenado por año y mes. Si en un mes hay más de una producción, cada una va en su carpeta.',
        'Recursos Diseño Cliente: todas las bases que necesita el diseñador. Posiciones de logos, editables por tipo de contenido (que se actualizan después del manual de contenidos), texturas, pinceles, íconos.'],
        quiz: [{q: '¿Qué va en la carpeta Materiales del cliente?', a: 'Lo que mandó el cliente', o: ['Todo lo que diseñamos nosotros', 'Los presupuestos'],
                why: 'Materiales es lo que manda el cliente. Lo nuestro solo entra si hicimos su identidad visual.'},
               {q: '¿Dónde busca el diseñador las posiciones de logo y las texturas?', a: 'En Recursos Diseño Cliente', o: ['En Carpeta Cliente Cliente', 'En 01 INACTIVAS'],
                why: 'Recursos Diseño Cliente tiene todas las bases del diseñador: logos, editables, texturas, pinceles, íconos.'}]},
      {title: '00 Procesos del equipo', lines: [
        '00 PROCESOS EQUIPO tiene seis carpetas. 01 Presentación Equipo: un ppt para presentarle a quien entra, con los clientes del equipo, sus miembros y quienes le dan soporte, los objetivos y los valores. El formato lo define cada equipo.',
        '02 Traspasos: todos los traspasos de miembros del equipo, incluido el del Project Leader. 03 Cronograma de Ejecución: el Excel de ejecución, el Weekly.',
        '04 Accesos y Contacto Clientes: los accesos a las cuentas, usuarios, contraseñas y mails de recuperación, y los nombres, mails y celulares de los clientes, ordenados en un Excel.',
        '05 Planilla de Activaciones Equipo: el Excel que tienen online. Y 06 Otros Documentos: lo que no entre en lo anterior, ordenado.',
        'Y algo que vale para todo: las cosas no se ordenan solas, es un proceso constante. Se eliminan los documentos repetidos. Y lo general que está en formatos y recursos no se duplica: se entra a donde está guardado, así no hay versiones desactualizadas.'],
        quiz: [{q: '¿Dónde están los accesos y los contactos de los clientes?', a: 'En 04 Accesos y Contacto Clientes', o: ['En un post-it pegado en la laptop', 'En el chat personal de cada uno'],
                why: 'Accesos, usuarios, contraseñas y contactos van ordenados en el Excel de 04 Accesos y Contacto Clientes.'},
               {q: 'Necesitás un formato general de la agencia. ¿Qué hacés?', a: 'Entro a donde está guardado, sin duplicarlo', o: ['Lo copio en la carpeta de mi equipo', 'Lo descargo al Escritorio'],
                why: 'Lo general no se duplica: así nadie trabaja con una versión desactualizada.'}]},
      {title: 'Presupuestos del equipo', lines: [
        'Por último, PRESUPUESTOS EQUIPO. Cada cliente tiene su carpeta, Presupuestos CLIENTE, con los Anuales separados de los Mensuales.',
        'Anuales: por año, los contratos de always on aprobados. Mensuales: por año y, dentro, por mes, todas las cotizaciones que mandamos al cliente por lo que vaya surgiendo: activaciones, coberturas, contenidos adicionales.',
        'Se nombran con claridad, para entender a qué corresponde cada cotización. Cada una lleva una hoja membretada o presentación, y la planilla de Excel con el desglose.',
        'APROBADOS: las cotizaciones en su versión final aprobada por el cliente, el comprobante de aprobación (un PDF o la captura del mail donde se ve el nombre, nuestro mail con el presupuesto adjunto y su respuesta aprobando) y el Excel con el detalle.',
        'Proveedores: las cotizaciones de proveedores externos o influencers. Hechos: si hay varias versiones o varios presupuestos, se separan ahí; incluso conviene una carpeta por presupuesto.',
        'Por ejemplo: Presupuestos GRIDO, Mensuales, 2026, Enero, y adentro APROBADOS, Proveedores y Hechos, con Presupuesto Locución Grido Toy, Presupuesto Campaña Verano y Presupuesto Influencers Batido.'],
        quiz: [{q: '¿Qué tiene que tener la carpeta APROBADOS?', a: 'La versión final, el comprobante de aprobación y el Excel con el detalle', o: ['Solo el Excel', 'Los presupuestos que no se aprobaron'],
                why: 'En APROBADOS queda todo lo que respalda la aprobación: la versión final, el comprobante y el detalle.'},
               {q: '¿Dónde van los contratos de always on aprobados?', a: 'En Anuales, separados por año', o: ['En Mensuales', 'En Proveedores'],
                why: 'Los contratos anuales van en Anuales; las cotizaciones del día a día, en Mensuales, por año y mes.'}]},
    ]},
  cronograma: {who: 'alejo', title: 'Proceso de cronograma', minLvl: 5, quest: 'alejo_cronograma', practice: 'alejo_crono_practica', skill: 'cronograma',
    sessions: [
      {title: 'Plazos y Fase 1: Relevamiento', lines: [
        'Antes que nada, lo más importante: todos los cronogramas se suben a la carpeta del cliente antes del 27 de cada mes. Así hay margen para que el cliente revise, deje sus comentarios y hagamos los cambios.',
        'Los plazos ideales: Fases 1 y 2, del 5 al 15 de cada mes. Fase 3, del 15 al 25. Fase 4, entre el 25 y el 30. Fase 5, el 1 del mes siguiente. Fase 6, del 1 al 15 del mes siguiente.',
        'Fase 1, relevamiento y planificación. Social Manager y Project Leader investigan el contexto: qué está haciendo la competencia; auditan el propio contenido (¿qué funcionó?, ¿qué falta mostrar?) y, si el cliente está hace tiempo con nosotros, miran qué se hizo el mismo mes del año anterior.',
        'El Social puede usar herramientas de IA para arrancar el análisis y generar insights. Y es fundamental estar al tanto de las tendencias y detectar oportunidades.',
        'El Project Leader le pide al cliente los lineamientos de comunicación: confirma fechas clave, hitos de campaña o mensajes prioritarios.',
        'Después hace la bajada al equipo (Social, Diseño, Paid) en una minuta clara en el canal de la marca: hasta cuántos contenidos mensuales tenemos, los objetivos de la marca y generalidades como el público objetivo y las prioridades del cliente. Eso va en las primeras diapositivas del documento de Lineamientos. La comunicación se mantiene siempre por el canal.',
        'Y Paid Media con el Project Leader relevan los mejores anuncios de meses anteriores, los Anuncios 0: el Paid selecciona los que mejor funcionaron según la pauta, lo ponen en común y definen según resultados, temporalidad y lineamientos del cliente. Se comparten en el canal de Slack de la marca, con link y fecha, o en una slide de los lineamientos.'],
        quiz: [{q: '¿Antes de qué día se suben los cronogramas a la carpeta del cliente?', a: 'Antes del 27 de cada mes', o: ['El 1 del mes siguiente', 'Cuando estén listos: no hay fecha'],
                why: 'Antes del 27, para tener margen: el cliente revisa, comenta y hacemos los cambios a tiempo.'},
               {q: '¿Quién selecciona los Anuncios 0?', a: 'Paid Media, según los resultados de la pauta', o: ['El cliente', 'El diseñador, por cómo se ven'],
                why: 'Los Anuncios 0 son los que mejor funcionaron en meses anteriores: los elige el Paid según la pauta y los define con el Project.'}]},
      {title: 'Fase 2: Carpetas y lineamientos', lines: [
        'Fase 2, preproducción del contenido. El Social Manager arma los lineamientos, pero antes se crean las carpetas base.',
        'Se entra a la carpeta de la marca, al año, y se crea la carpeta del mes en que van a salir los contenidos, no la del mes en curso. Si en enero hacemos los lineamientos de febrero: 2026, 02 Febrero, y adentro 01 Cronograma, 02 Materiales, 03 Editables y 04 Finales.',
        'En 01 Cronograma va la estructura detallada del contenido, en un ppt actualizado llamado Lineamientos-Marca-Mes-Año. Por ejemplo: Lineamientos-MBC-03-2025.',
        'El Social tiene que entender qué se va a comunicar: nada de contenidos para llenar espacios. Se piensan desde la estrategia, relevantes y de valor para la marca. Y se define el objetivo de cada contenido, si va a ser orgánico o pautado: eso determina cómo se diagrama.',
        'Los lineamientos tienen que estar siempre en condiciones para que los pueda diseñar cualquier diseñador. En 02 Materiales se suben todos los recursos que va a necesitar, organizados en carpetas por contenido. Cada contenido tiene un ID, que sirve para nombrar materiales, editables y finales.',
        'Responsables de carpeta: el Social Manager, de Cronograma y Materiales; el Graphic Designer, de Editables y Finales.'],
        quiz: [{q: 'En enero hacés los lineamientos de febrero. ¿En qué carpeta trabajás?', a: 'En la de 02 Febrero', o: ['En la de 01 Enero', 'En una carpeta nueva con tu nombre'],
                why: 'Se trabaja en la carpeta del mes en que salen los contenidos, no en la del mes que se está cursando.'},
               {q: '¿Quién es responsable de las carpetas Editables y Finales?', a: 'El Graphic Designer', o: ['El Social Manager', 'El cliente'],
                why: 'El Social se ocupa de Cronograma y Materiales; el Graphic Designer, de Editables y Finales.'}]},
      {title: 'Fase 2: Bajadas, fechas y revisión', lines: [
        'Seguimos con la Fase 2. El Social marca lo que está listo para diseñar con un sistema de colores: rojo, pronto para diseñar; amarillo, diseñado y pronto para compaginar; rojo, cambios.',
        'Cuando está listo, le avisa al Project, que revisa si los lineamientos cumplen con lo esperado y si está correcto todo lo que se quiere comunicar. Si estamos ok, pasa a diseño.',
        'Redacción de bajadas: el Social crea el cronograma en 01 Cronograma con la base Cronograma-Marca-Mes-2026.pptx, cambia la nomenclatura a la marca, el mes y el año (por ejemplo, Cronograma-Grido-02-2026) y define una diapositiva por contenido.',
        'Redacta las bajadas, coherentes con el tono de la marca y sus objetivos, con hashtags y emojis si el cliente los usa.',
        'Asignación de fechas: define las fechas de publicación y, si aplica, de circulación pagada con su objetivo: alcance, mensajes, leads. Y al poner los Anuncios 0 de meses anteriores, chequea que estén en el último formato de la base de cronogramas.',
        'Por último, el Project Leader revisa y valida que los lineamientos respondan a los Días De, a los lineamientos del cliente y a las oportunidades detectadas en la agencia. Si hay dudas, es una marca nueva o hay cambios grandes, se suma una revisión de FD.'],
        quiz: [{q: '¿Cómo se llama el cronograma de Grido de febrero de 2026?', a: 'Cronograma-Grido-02-2026', o: ['cronograma grido febrero final', 'Grido_Cronograma_Feb'],
                why: 'La nomenclatura es Cronograma-Marca-Mes-Año, con el mes en número.'},
               {q: '¿Qué define la asignación de fechas?', a: 'La publicación y, si aplica, la circulación pagada con su objetivo', o: ['Solo el día de publicación', 'Las vacaciones del equipo'],
                why: 'Además de publicar, si hay pauta se define la circulación y su objetivo: alcance, mensajes, leads.'}]},
      {title: 'Fase 3: Diseño y compaginado', lines: [
        'Fase 3, diseño y compaginado. Producción de contenidos, con Content Creator y Graphic Designer: las grabaciones se organizan con Iván; el Project las coordina y las anota en la planilla de producciones, en la hoja de Iván. Cuando Iván entrega el material final, el Social lo guarda en Finales y lo compagina en el cronograma.',
        'Se diseñan los contenidos y los archivos (editables y finales) se guardan con nombre estructurado: Mes-PLATAFORMA-ID. Por ejemplo: 05-ME-Helado-Vainilla.',
        'El Graphic Designer cambia el círculo rojo a amarillo, para que el Social sepa que está listo para compaginar, y avisa al equipo por el canal de Slack.',
        'El Social compagina cada contenido en el documento de cronograma. Suma elementos interactivos si aplica (preguntas, encuestas) y, en los videos, el botón "Click para reproducir". También compagina en su sección los contenidos que se reactivan, chequeando fecha de circulación y objetivo.',
        'Arma el feed y el calendario: la previsualización del feed ordenada por fecha de publicación, siempre con el formato de cronograma base, y el calendario mensual con la fecha de cada contenido.',
        'Revisión interna: el Social corrige errores de redacción, fechas, tamaños, y avisa al Project. El Project revisa objetivos, fechas de circulación, cantidad de contenidos y compaginado.'],
        quiz: [{q: '¿Cómo se nombran los archivos de diseño?', a: 'Mes-PLATAFORMA-ID, como 05-ME-Helado-Vainilla', o: ['Como quiera el diseñador', 'diseño final v2'],
                why: 'Editables y finales llevan siempre el nombre estructurado Mes-PLATAFORMA-ID.'},
               {q: '¿Qué hace el diseñador cuando termina un contenido?', a: 'Cambia el círculo rojo a amarillo y avisa por Slack', o: ['Lo publica directamente', 'Se lo manda por mail al cliente'],
                why: 'El amarillo le avisa al Social que puede compaginar, y el aviso va por el canal de Slack.'}]},
      {title: 'Fase 4: Revisión y aprobación', lines: [
        'Fase 4, revisión y aprobación. El Project Leader envía el cronograma a FD para validar: si hay ajustes, FD deja comentarios; si está correcto, se aprueba. El Project puede participar de la revisión. Después FD define si se repite la revisión o si se puede enviar al cliente con los cambios hechos.',
        'Envío al cliente: se sube a la Carpeta Cliente Marca, en el año y mes correspondiente (se copia de nuestra carpeta), y se avisa al cliente. Esa carpeta se comparte antes: no se debería volver a mandar un link.',
        'Todos los cronogramas se envían por mail con el asunto "Cronograma Marca MES". El intercambio y el feedback se mantienen formales por esa vía: más allá de las charlas entre project y cliente, todo tiene que quedar registrado por mail o en canales con el equipo. Se manda el link a la carpeta compartida completa, para evitar problemas de acceso o sincronización.',
        'En ambas carpetas tienen que estar todas las versiones del cronograma.',
        'Seguimiento del feedback: el Project asegura la respuesta del cliente. Si no hay cambios, tenemos el ok para programar. Si hay cambios, el Social descarga el cronograma de la carpeta del cliente y lo guarda con _V2 (Cronograma-MBC-03-2025_V2), y se retoma el proceso de lineamientos y diseño. Se repite hasta cerrar todas las etapas.'],
        quiz: [{q: '¿Con qué asunto se envía el cronograma por mail?', a: 'Cronograma Marca MES', o: ['"Te mando lo del mes"', 'Sin asunto: va el link y listo'],
                why: 'Siempre "Cronograma Marca MES", y todo el feedback queda registrado por mail o en los canales del equipo.'},
               {q: 'Si el cliente pide cambios, ¿cómo se guarda la nueva versión?', a: 'Con _V2: Cronograma-MBC-03-2025_V2', o: ['Pisando el archivo anterior', 'Como cronograma_final_final'],
                why: 'Se guarda como _V2 en la carpeta del mes: en ambas carpetas tienen que estar todas las versiones.'}]},
      {title: 'Fases 5 y 6: Ejecución y reporte', lines: [
        'Fase 5, ejecución. El Social Manager programa los contenidos en las plataformas y deja recordatorios para los que se publican a mano.',
        'Paid Media arma la planilla de activaciones según el cronograma. El Project Leader revisa que todo esté correcto, que la inversión sea la indicada y si hay inversión extra. Los carruseles de más de dos placas los programa el Paid Media.',
        'Si hay contenido promocionado (pautado por interacción), el Social avisa cuando está subido para que el Paid de la cuenta lo active.',
        'Fase 6, post-publicación, con todo el equipo: al terminar el mes se hace un reporte con las métricas y los resultados de los contenidos.',
        'Paid Media mantiene actualizada la plataforma de reportes (Data Studio): las bases conectadas y la pauta del mes al día en todas las plataformas. El Social suma la parte orgánica: análisis de los contenidos publicados, de la competencia, seguidores, comentarios y likes.',
        'El reporte se entrega antes del 15 de cada mes. Por ejemplo: Reporte-MBC.'],
        quiz: [{q: '¿Quién programa los carruseles de más de dos placas?', a: 'Paid Media', o: ['El Social Manager', 'El cliente'],
                why: 'El Social programa los contenidos, pero los carruseles de más de dos placas los programa el Paid Media.'},
               {q: '¿Antes de qué día se entrega el reporte?', a: 'Antes del 15 de cada mes', o: ['Antes del 27', 'Cuando se pueda'],
                why: 'El reporte del mes se entrega antes del 15: Paid aporta la pauta y Social la parte orgánica.'}]},
    ]},
  campanas: {who: 'sahi', title: 'Proceso de campañas', minLvl: 15, quest: 'sahi_campanas', practice: 'sahi_campanas_practica', skill: 'fases',
    sessions: [
      {title: 'Fase 1: Brief y coordinación', lines: [
        'Arrancamos por el principio, crack: la Fase 1, brief y coordinación.',
        'Primero, la consulta al cliente. El Project Leader propone campañas cuando identifica oportunidades de venta: lanzamientos de nuevos productos, Días De, zafras comerciales. Y releva si la marca proyecta alguna campaña extra fuera del always on.',
        'A veces el pedido viene del cliente, pero el Project Leader y su equipo tienen que estar atentos a las oportunidades: no dejar pasar fechas relevantes para la marca, ni tendencias o movimientos de la competencia que impulsen campañas propias.',
        'Después, el armado del brief: Project Leader, Social Manager y Creative Manager identifican el objetivo real de la campaña y relevan tono, mensaje, públicos, referencias y canales clave. Todo se documenta en un brief que se valida con el cliente.',
        'Y la coordinación: el Project Leader establece un Gantt, agendando fechas internas y con el cliente desde el primer momento, para tener los deadlines definidos. Las fechas se contrastan primero con FD y el equipo involucrado, y después con el cliente.',
        'Las reuniones a coordinar: brief cliente; brief al equipo y definición de fechas; brainstorming; validaciones internas del camino creativo, el presupuesto, el plan de medios, el diseño y la final; y la presentación a cliente.'],
        quiz: [{q: '¿Quién tiene que estar atento a las oportunidades para proponer campañas?', a: 'El Project Leader y su equipo, aunque el cliente no lo pida', o: ['Solo el cliente, cuando lo pide', 'Nadie: se espera a que llegue un brief'],
                why: 'Las oportunidades (lanzamientos, Días De, zafras, tendencias, la competencia) las detectan el Project Leader y su equipo. No hay que esperar el pedido.'},
               {q: 'Las fechas del Gantt, ¿con quién se contrastan primero?', a: 'Con FD y el equipo involucrado; después, con el cliente', o: ['Primero con el cliente', 'Con nadie: las fija el Project Leader y listo'],
                why: 'Primero adentro (FD y el equipo involucrado) y después con el cliente, así los deadlines son reales.'}]},
      {title: 'Fase 2: Desarrollo de conceptos', lines: [
        'Fase 2: desarrollo de conceptos. Mi parte favorita, no te voy a mentir.',
        'Brainstorming: el Project Leader convoca al Creative Manager (y, si hace falta, al Social Manager). Se analizan campañas previas, propias y de la competencia, y se le da al Creative Manager todo el contexto de la cuenta. Si la campaña está dentro del AO, la creatividad la piensa el Social Manager.',
        'Con eso, el Creative Manager desarrolla la campaña: al menos dos caminos conceptuales diferentes. Evalúa influencers, formatos innovadores y soportes clave. Cumple el brief y propone al menos una idea extra. Siempre un poquito más de lo solicitado.',
        'Bajada de lineamientos visuales: se establecen los lineamientos del Key Visual, con ejemplos de contenidos y, si aplica, referencias de guiones de video y de activaciones. Se puede bocetar con IA, pero lo fundamental es transmitir cómo queremos que se sienta la campaña. Después el diseñador le da vuelo.',
        'Al terminar esta etapa tenemos que tener claro qué queremos decir y cómo queremos decirlo.',
        'Los caminos se presentan a FD en una reunión interna para evaluarlos y aprobar las ideas. Y en la validación de conceptos (Tabasco), el Creative Manager se los presenta al Project Leader: se recoge feedback, se suman ideas y se hacen los cambios para pasar a diseño y presupuesto.'],
        quiz: [{q: '¿Cuántos caminos conceptuales se proponen, como mínimo?', a: 'Al menos dos, y además una idea extra', o: ['Uno solo: el mejor', 'Todos los que salgan del brainstorming, sin filtrar'],
                why: 'Mínimo dos caminos diferentes que cumplan el brief, y siempre al menos una idea extra: un poquito más de lo solicitado.'},
               {q: 'Si la campaña está dentro del AO, ¿quién piensa la creatividad?', a: 'El Social Manager', o: ['El Finance Manager', 'El cliente'],
                why: 'Dentro del esquema AO, el encargado de pensar la creatividad es el Social Manager.'}]},
      {title: 'Fases 3 y 4: Presupuesto y plan de medios', lines: [
        'Fases 3 y 4: presupuesto y plan de medios. Sin números no hay campaña, crack.',
        'El Project Leader presupuesta todo: vía pública, influencers, redes, radio, TV, web, producción de contenidos. Se usa la planilla de presupuestos, y aparte una planilla de uso interno que desglosa los costos de todos los proveedores.',
        'Hay que considerar si tenemos comisión de agencia o si hay que sumar honorarios. Con la planilla interna se arma la presentación con el presupuesto final, que se chequea en la reunión de facturación: tiene que estar corregida y actualizada.',
        'El presupuesto lo aprueban internamente el Finance Manager y FD.',
        'Después, Paid Media arma el plan de medios en función del presupuesto y los objetivos. Establece de forma clara cómo vamos a medir el éxito de la campaña, suma datos de contexto que sostengan la propuesta y analiza la pauta y el posicionamiento de los competidores en esos medios.'],
        quiz: [{q: '¿Quiénes aprueban el presupuesto internamente?', a: 'El Finance Manager y FD', o: ['El cliente, directamente', 'El diseñador de la campaña'],
                why: 'El presupuesto se aprueba adentro, con el Finance Manager y FD, antes de mostrarlo.'},
               {q: '¿Qué tiene que dejar claro el plan de medios?', a: 'Cómo vamos a medir el éxito de la campaña', o: ['Solo cuánto cuesta', 'Los colores del Key Visual'],
                why: 'El plan de medios sale del presupuesto y los objetivos, y define cómo se va a medir el éxito, con contexto y análisis de la competencia.'}]},
      {title: 'Fases 5 a 7: Diseño, presentación y aprobación', lines: [
        'Fases 5, 6 y 7: diseño, presentación al cliente y aprobación. ¡El último tramo!',
        'El Design Specialist o el Graphic Designer diseña las piezas y consolida la presentación para validar internamente. Acá no se descarta ninguna opción: cuanto más tengamos para mostrar y después descartar, mejor. Es fundamental trabajar en equipo con quien hizo la creatividad, y se puede ir validando con FD en el proceso.',
        'Validación del diseño (Tabasco): reunión interna con el Creative Manager y FD para evaluar y aprobar. Después, el Creative Manager presenta la campaña cerrada al equipo ejecutivo para el feedback interno final y los últimos ajustes.',
        'Presentación al cliente: el Project Leader agenda una reunión interna al menos tres días antes para validar todos los puntos y preparar la presentación, y agenda la reunión con el cliente.',
        'En la reunión, el Creative Manager presenta los caminos desarrollados y toma el feedback del cliente. Los participantes del equipo ejecutivo los define el Project Leader. Con ese feedback se hacen los ajustes.',
        'Y la aprobación: el Project Leader pone en marcha. Confirma al equipo y a los proveedores que avanzamos y organiza los pendientes internos para garantizar una buena ejecución.'],
        quiz: [{q: '¿Cuándo se hace la reunión interna antes de presentarle al cliente?', a: 'Al menos tres días antes', o: ['El mismo día, un rato antes', 'No hace falta: se presenta directo'],
                why: 'Con al menos tres días hay tiempo de validar todos los puntos y preparar bien la presentación.'},
               {q: 'En la etapa de diseño, ¿qué se hace con las opciones?', a: 'No se descarta ninguna: cuanto más para mostrar, mejor', o: ['Se muestra una sola, la más segura', 'Se descarta todo lo arriesgado antes de empezar'],
                why: 'En diseño no se descarta nada: cuanto más tengamos para mostrar y después descartar, mejor.'}]},
      {title: 'Campañas dentro del AO', lines: [
        'La última, y para mí la más importante: las campañas dentro del AO. Todo puede ser una campaña, y debería pensarse como tal.',
        'Estamos mal acostumbrados a repetir los formatos del Manual de Contenidos mes a mes. Esa NO es la idea. El manual establece parámetros, formas y una estructura base, pero cada mes hay que pensarlo en su contexto y como una oportunidad para proponer y destacar. El manual guía, no limita.',
        'Las propuestas tienen que ser realizables dentro del AO, pero podemos sumar ideas complementarias con presupuesto extra: influencers, sorteos, contenido audiovisual, coberturas.',
        'Hay tres factores que aplican a todas las marcas: la estacionalidad, los lanzamientos de productos o servicios, y las promociones y descuentos. Las marcas más permeables, además, se mueven con Días De, tendencias y contexto. Por ejemplo: Los Nietitos con el Día del Abuelo, Ricardito con el Mundial, Tiendas Montevideo con el Cyber Lunes, MBC con la tendencia de consumo de proteína.',
        'Fase 1, aprovechar la oportunidad (Project Leader y Social Manager): cuanto antes la identificamos, mejores decisiones tomamos; hasta se puede guardar presupuesto de meses anteriores para darle fuerza. Se revisa lo que se hizo con la marca en instancias parecidas para superarlo, y se analiza a la competencia.',
        'Fase 2, propuesta: concepto, ideas de ejecución y moodboard estético, mostrando acá lo que lleve presupuesto extra, con validación previa de FD. Después se trabajan los contenidos del mes con el proceso de Cronogramas.',
        'Fase 3, ejecución: darle marco dentro de los cronogramas, con contenidos, stories destacadas, cambio de foto de perfil o el canal de comunidad; concepto, estética y plan de medios adaptados, validando con FD antes de avanzar. Fase 4, reporte: analizar cómo rindieron esos contenidos. Aprovechemos a lucirnos y no repetirnos.'],
        quiz: [{q: '¿Para qué sirve el Manual de Contenidos?', a: 'Para guiar, no para limitar: cada mes es una oportunidad', o: ['Para repetir los mismos formatos todos los meses', 'Para no tener que pensar ideas'],
                why: 'El manual da parámetros y estructura, pero cada mes se piensa en su contexto, como oportunidad para proponer y destacar.'},
               {q: '¿Qué tres factores aplican a todas las marcas?', a: 'Estacionalidad, lanzamientos y promociones', o: ['Solo los Días De', 'El clima, el wifi y el café'],
                why: 'Estacionalidad, lanzamientos de productos o servicios, y promociones y descuentos aplican a todas las marcas.'}]},
    ]},
};
const trainingNext = id => { const i = S.flags['tr_' + id] || 0; return i < TRAININGS[id].sessions.length ? i : -1; };
const trainingToday = id => dayCount(mem().trDay, id) >= PER_DAY;
/* la pregunta: no se aprueba ni se reprueba. Si no sale, se explica y se vuelve a probar */
async function quizLoop(who, q, helper){
  let tries = 0;
  for (;;){
    await say(q.q, who);
    const opts = [q.a, ...q.o].map(t => ({t, k: Math.random()})).sort((a, b) => a.k - b.k).map(o => o.t);
    const c = await choose(opts, {cancel: null});
    if (opts[c] === q.a){ await say(pick(who + ':quizok', ['¡Eso! Lo tenés.', '¡Exacto! Así se hace.', 'Perfecto. Eso es lo que hace la diferencia.']), who); return; }
    tries++;
    if (tries === 1) await say('Casi. ' + q.why, who);
    else if (tries === 2) await say(pick(who + ':quiz2', ['Esa tampoco. Releé lo que te conté, que está ahí.', 'Mmm, no. Pensalo como si fuera de verdad: ¿qué harías?', 'Tampoco. Pero ya estás más cerca que antes.']), who);
    else { await say(`Te la doy: es "${q.a}". Ahora elegila vos, así te queda.`, who); }
    if (tries === 2 && helper) await say('Tranqui: equivocarse es la mitad de aprender.', helper);
  }
}
async function trainingSession(id){
  const T = TRAININGS[id], i = trainingNext(id), ses = T.sessions[i], m = mem();
  if (!qState(T.quest)) qOpen(T.quest);
  for (const l of ses.lines) await sayLine(l, T.who);
  for (const q of ses.quiz) await quizLoop(T.who, q);
  S.flags['tr_' + id] = i + 1; m.trDay = m.trDay || {}; const nToday = dayMark(m.trDay, id);
  SFX.learn(); await say(`Capacitación completada: ${ses.title}.`);
  await gainXP(Math.max(15, Math.floor(need(S.lvl) * .2)), sayN);
  if (i + 1 >= T.sessions.length){ qDone(T.quest); qOpen(T.practice); return true; }
  await say(nToday < PER_DAY ? pick(T.who + ':trnext1', ['Si querés, más tarde hacemos la que sigue. Hoy entran dos.', 'Practicá un rato y volvé, que hoy podemos hacer una más.']) : pick(T.who + ':trnext', ['Listo por hoy: dos por día, que si no se pisan. Mañana seguimos.', 'Por hoy ya está. Mañana, la que sigue.']), T.who);
  return false;
}
/* Sahi enseña el proceso de campañas desde el nivel 15 */
async function sahiTraining(){
  const T = TRAININGS.campanas;
  if (qState(T.practice) === 'open' && qReady(T.practice)){
    await say('¡Eso es poner el proceso en la cancha! Brief, conceptos, presupuesto, medios, diseño, presentación y aprobación. Ya sabés armar una campaña como se arma acá.', 'sahi:feliz');
    await learn(T.skill, sayN); qDone(T.practice); return 'done';
  }
  if (S.lvl < T.minLvl || trainingNext('campanas') < 0) return null;
  if (trainingToday('campanas')) return null;
  if (!qState(T.quest)){
    await say('Che, crack, ya quedaste fij{o}: estás para algo más grande. Te voy a enseñar cómo armamos una campaña acá, de punta a punta. Son cinco capacitaciones, hasta dos por día.', 'sahi:feliz');
  }
  const c = await choose([`Capacitación: ${T.sessions[trainingNext('campanas')].title}`, rainy() ? 'Hoy no hay peloteo' : 'Mejor un peloteo', 'Después'], {cancel: 2});
  if (c === 0){
    const fin = await trainingSession('campanas');
    if (fin) await say('¡Terminaste las cinco! Ahora, a la cancha: resolvé ocho desafíos aplicando el proceso y volvé. Ahí te enseño algo que solo se aprende jugando.', 'sahi:risa');
    return 'done';
  }
  if (c === 1) return 'rally';
  await say(pick('sahi:trlater', ['Dale, cuando quieras. La campaña no se arma sola, pero espera.', 'Tranqui. Mañana también hay capacitación.']), 'sahi');
  return 'done';
}
/* el menú "Capacitaciones": todo lo aprendido, para repasar cuando quieras (sirve como manual para la gente nueva) */
function trainingRows(){
  const rows = [];
  const add = (group, who, title, done, lines, lock) => rows.push({group, who, title, done, lines, lock});
  DUO_LESSONS.giuli.forEach((l, i) => add('Diseño · Giuli', 'giuli', l.title, (S.flags.lesGiuli || 0) > i, l.lines, 'Hablá con Giuli, en La Base.'));
  DUO_LESSONS.alejo.forEach((l, i) => add('Redes · Alejo', 'alejo', l.title, (S.flags.lesAlejo || 0) > i, l.lines, 'Hablá con Alejo, en La Base.'));
  for (const [id, T] of Object.entries(TRAININGS)) T.sessions.forEach((s, i) => { add(T.title + ' · ' + PEOPLE[T.who], T.who, s.title, (S.flags['tr_' + id] || 0) > i, s.lines, `${PEOPLE[T.who]} la enseña desde el nivel ${T.minLvl}.`); rows[rows.length - 1].full = s.full; });
  return rows;
}
async function trainingScreen(){
  let start = 0;
  for (;;){
    const rows = trainingRows(), done = rows.filter(r => r.done).length;
    const r = await panelList({title: 'CAPACITACIONES', extra: `${done}/${rows.length}`, start,
      rows: () => rows.map(x => ({label: (x.done ? '✓ ' : '🔒 ') + x.title, right: '', dim: !x.done})),
      detail: i => { const x = rows[i]; return `<h4>${x.title}</h4><div class="k">${x.group}</div>` + (x.done ? `<div class="k">✓ Hecha</div><div>${lineText(x.lines[1] || x.lines[0]).slice(0, 95).replace(/\s+\S*$/, '')}…</div><div class="k">A: repasarla completa.</div>` : `<div class="k">Todavía no la hiciste.</div><div>${x.lock}</div>`); },
      hint: 'A: repasar · B: volver'});
    if (r < 0) return;
    start = r; const x = rows[r];
    if (!x.done){ toast('Todavía no la hiciste'); continue; }
    closePanel();
    const how = x.full ? await choose(['Repasar la charla', 'Leer el proceso completo', 'Volver'], {cancel: 2}) : 0;
    if (how === 0) for (const l of x.lines) await sayLine(l, x.who);
    else if (how === 1) for (const l of x.full) await say(l);
    hideDlg();
  }
}

/* ================= LAS CHARLAS DE LAS CAPACITACIONES (cortas y con la voz de cada uno) =================
   En el juego, cada capacitación es una charla corta: frases breves, con la personalidad de quien enseña y algún
   ida y vuelta con otro personaje ([quién, texto]). El texto completo del proceso queda en `full`, para leerlo
   desde el menú Capacitaciones. Las preguntas no cambian. */
const lineText = l => Array.isArray(l) ? l[1] : l;
async function sayLine(l, who){ if (Array.isArray(l)) await say(l[1], l[0]); else await say(l, who); }
const TRAINING_TALK = {
  carpetas: [
    [['fede:risa', 'Primera regla de la casa: si no encontrás un archivo, no existe. Como un mate sin yerba.'],
     'Ordenamos para atender más rápido al cliente y usar el tiempo en las campañas, no buscando cosas.',
     'Todo vive en la carpeta del equipo: EQUIPO NOMBRE. Por ejemplo, EQUIPO CHILI.',
     'Nunca en el Escritorio, Descargas ni Documentos: no tienen respaldo. Se rompe la compu y chau trabajo.',
     'Se sincroniza la carpeta del equipo, no la de cada cliente. Si alguien de otro equipo te da una mano, le compartís la carpeta del cliente, entera.',
     'Adentro, tres cosas: 00 Procesos, 01 INACTIVAS (exclientes con un mes sin activar) y una carpeta por cliente, como GRIDO.',
     ['fede:risa', 'Fácil, ¿no? Ahora te pregunto. Y sí: te voy a pedir un poco más.']],
    ['Hoy, la carpeta del cliente. Adentro, una carpeta por año.',
     'Dentro del año, una por mes. Y cada mes, siempre las mismas cinco: 01 Cronograma, 02 Materiales, 03 Editables, 04 Finales, 05 Reporte.',
     ['fede:risa', 'Siempre iguales, así cualquiera abre cualquier cliente y encuentra todo. Como la ronda del mate: siempre para el mismo lado.'],
     'En el año hay una carpeta más: Extras. Ahí van solo las campañas o recursos que no son del Always On.',
     'Cada extra lleva 01 Creatividad, 02 Materiales, 03 Editables y 04 Finales. Y va en el año en que se hizo.'],
    ['Además de los años, cada cliente tiene cinco carpetas fijas. Anotá, que te las tomo.',
     'Carpeta Cliente Cliente: lo que compartimos con el cliente. Últimos cronogramas, reportes en PDF, producciones. Por año.',
     'Materiales: lo que manda el cliente. Lo nuestro no va ahí, salvo que hayamos hecho su identidad visual. Lo de un extra, va en el extra.',
     'Planificación Estratégica: brief, diagnóstico, plan de medios, conceptos y manual de contenidos. Cada uno en su carpeta, por año.',
     'Producciones WASABI Cliente: lo que graban Content Creator, Social Medias y productoras. Por año y mes; si hay dos en un mes, cada una en su carpeta.',
     'Y Recursos Diseño Cliente: el kit del diseñador. Logos, editables por tipo de contenido, texturas, pinceles, íconos.'],
    ['00 PROCESOS EQUIPO: la cocina del equipo. Seis carpetas.',
     ['fede:risa', '01 Presentación Equipo: el ppt para quien entra. Clientes, equipo, soporte, objetivos y valores. El que te hubiera venido bien a vos.'],
     '02 Traspasos: todos, incluido el del Project Leader. 03 Cronograma de Ejecución: el Excel del Weekly.',
     '04 Accesos y Contacto Clientes: usuarios, contraseñas, mails de recuperación y los contactos del cliente, en un Excel. Nunca en un post-it.',
     '05 Planilla de Activaciones Equipo: el Excel online. 06 Otros Documentos: lo que no entre en lo demás, ordenado.',
     'Y tres reglas: el orden no se hace solo, es constante. Nada repetido. Y lo general no se copia: se usa desde donde está.'],
    [['fede:risa', 'Última: los presupuestos. Acá el desorden sale caro. Literal.'],
     'Cada cliente tiene Presupuestos CLIENTE, con dos carpetas: Anuales y Mensuales.',
     'Anuales: los contratos de always on aprobados, por año. Mensuales: las cotizaciones del día a día, por año y mes.',
     'Cada cotización con nombre claro, hoja membretada o presentación, y el Excel con el desglose.',
     'APROBADOS: la versión final, el comprobante del cliente (PDF o captura del mail) y el Excel.',
     'Proveedores: lo de externos e influencers. Hechos: las versiones y los otros presupuestos.',
     ['fede:feliz', 'Ejemplo: Presupuestos GRIDO, Mensuales, 2026, Enero. La próxima vez que alguien pregunte "¿dónde está?", sabés vos.']],
  ],
  cronograma: [
    ['Regla de oro del cronograma: se sube a la carpeta del cliente antes del 27. Siempre.',
     ['giuli', 'Antes del 27. Lo tiene tatuado. Bueno, casi.'],
     'Plazos: Fases 1 y 2, del 5 al 15. Fase 3, del 15 al 25. Fase 4, del 25 al 30. Fase 5, el 1. Fase 6, del 1 al 15 del mes siguiente.',
     'Fase 1: Social y Project miran la competencia, qué funcionó, qué falta mostrar y qué se hizo ese mes el año pasado. La IA ayuda a arrancar.',
     'El Project le pide al cliente fechas clave, hitos y mensajes prioritarios, y hace la bajada al equipo en el canal de la marca: cuántos contenidos, objetivos, público.',
     'Y con Paid elegimos los Anuncios 0: los que mejor funcionaron en la pauta. Van al Slack de la marca o a una slide de los lineamientos.',
     ['giuli', 'Traducción: antes de crear, mirar. Como en diseño.']],
    ['Fase 2. Primero, las carpetas. Y acá Giuli se emociona.',
     ['giuli', 'Me emociono. Carpeta de la marca, el año, y la del mes en que SALEN los contenidos. En enero hacés febrero: 2026, 02 Febrero.'],
     ['giuli', 'Adentro: 01 Cronograma, 02 Materiales, 03 Editables, 04 Finales.'],
     'En 01 Cronograma van los lineamientos: Lineamientos-Marca-Mes-Año. Por ejemplo, Lineamientos-MBC-03-2025.',
     'Nada de contenidos para llenar el feed: cada uno con su estrategia, su objetivo y si es orgánico o pautado.',
     ['giuli', 'Y tan claros que los pueda diseñar cualquier diseñador. En 02 Materiales, todo por contenido, con su ID.'],
     'Responsables: Social, de Cronograma y Materiales. Diseño, de Editables y Finales.'],
    ['Seguimos. El semáforo: rojo, pronto para diseñar; amarillo, diseñado y pronto para compaginar; rojo, cambios.',
     ['giuli', 'Dos rojos. Sí. Así está en el proceso.'],
     'Cuando está listo, se avisa al Project. Si revisa y está ok, pasa a diseño.',
     'El cronograma sale de la base Cronograma-Marca-Mes-2026.pptx, con su nombre: Cronograma-Grido-02-2026. Una diapo por contenido.',
     'Bajadas con el tono de la marca, hashtags y emojis si el cliente los usa. Fechas: publicación y, si hay pauta, circulación con su objetivo.',
     'Los Anuncios 0, en el último formato de la base. Y el Project valida Días De, lineamientos y oportunidades. Si es marca nueva o hay dudas, se suma FD.'],
    [['giuli', 'Fase 3: mi parte. Diseño y compaginado.'],
     'Si hay que grabar, se coordina con Iván. El Project lo anota en la planilla de producciones; cuando entrega, el Social lo guarda en Finales.',
     ['giuli', 'Los archivos se nombran Mes-PLATAFORMA-ID. Por ejemplo, 05-ME-Helado-Vainilla. Sin "final", por favor.'],
     ['giuli', 'Cuando termino, el círculo pasa de rojo a amarillo y aviso por Slack.'],
     'Ahí compagino: cada contenido en su diapo, encuestas si van, y en los videos el botón "Click para reproducir". Los reactivados, en su sección.',
     'Después, el feed y el calendario en el formato base. Reviso redacción, fechas y tamaños; el Project, objetivos, fechas, cantidad y compaginado.'],
    ['Fase 4. El Project lo manda a FD: si hay ajustes, comenta; si está bien, aprueba. FD decide si se revisa otra vez o va al cliente.',
     'Va a la Carpeta Cliente Marca, en su año y mes, y se avisa. Esa carpeta ya está compartida: no se manda otro link.',
     'Por mail, con asunto "Cronograma Marca MES". Todo queda registrado por mail o en los canales del equipo, aunque haya charlas por privado.',
     ['giuli', 'Y en las dos carpetas, todas las versiones. Todas.'],
     'Si el cliente pide cambios, se guarda como _V2 (Cronograma-MBC-03-2025_V2) y vuelve a lineamientos y diseño. Hasta cerrar.'],
    ['Fase 5: programo en las plataformas y dejo recordatorios para lo que va a mano.',
     'Paid arma la planilla de activaciones; el Project revisa la inversión y los extras. Los carruseles de más de dos placas los programa Paid.',
     'Si hay contenido promocionado, aviso cuando está subido para que Paid lo active.',
     'Fase 6: el reporte del mes, antes del 15. Paid mantiene el Data Studio al día; Social suma lo orgánico: contenidos, competencia, seguidores, comentarios, likes.',
     ['giuli', 'El nombre: Reporte-MBC. Lo digo yo, que si no se le olvida.'],
     'Y vuelta a empezar el mes siguiente. Ese es el ritmo de las redes.'],
  ],
  campanas: [
    ['Campañas, crack. Arrancamos por el saque inicial: brief y coordinación.',
     'No esperamos que el cliente pida. El Project y su equipo ven las oportunidades: lanzamientos, Días De, zafras, tendencias, la competencia.',
     'Y relevan si la marca proyecta algo extra, fuera del always on.',
     'Después, el brief: Project, Social y Creative definen el objetivo real, tono, mensaje, públicos, referencias y canales. Se valida con el cliente.',
     'El Project arma el Gantt desde el día uno. Fechas primero con FD y el equipo; después, con el cliente.',
     ['sahi:risa', 'Reuniones: brief cliente, brief al equipo, brainstorming, validaciones internas y presentación. Es el fixture, crack.']],
    [['sahi:feliz', 'Fase 2: conceptos. Mi parte favorita, no te voy a mentir.'],
     'Brainstorming con el Creative (y a veces el Social): campañas previas, propias y de la competencia, y todo el contexto. Si es del AO, piensa el Social.',
     'El Creative propone mínimo dos caminos distintos. Y una idea extra: siempre un poquito más de lo pedido.',
     ['sahi:risa', 'Como un tiro libre al ángulo que nadie esperaba.'],
     'Lineamientos del Key Visual: ejemplos, guiones, activaciones. Se puede bocetar con IA, pero lo que importa es cómo se tiene que sentir.',
     'Se presentan los caminos a FD. Y en Tabasco, el Creative se los muestra al Project: feedback, ideas, cambios, y a diseño y presupuesto.'],
    ['Fases 3 y 4: los números. Sin números no hay campaña, crack.',
     'El Project presupuesta todo: vía pública, influencers, redes, radio, TV, web, producción. Con la planilla de presupuestos y una interna por proveedor.',
     'Ojo con la comisión de agencia o los honorarios. El presupuesto final se chequea en la reunión de facturación.',
     'Lo aprueban Finance Manager y FD. Recién ahí sale a la cancha.',
     'Después Paid arma el plan de medios: cómo medimos el éxito, datos de contexto y qué hace la competencia en esos medios.'],
    [['sahi:feliz', 'Último tramo: diseño, presentación y aprobación. ¡Tiempo de descuento!'],
     'Diseño arma las piezas y la presentación. Acá no se descarta nada: cuanto más para mostrar, mejor. Codo a codo con la creatividad.',
     'En Tabasco se valida con el Creative y FD. Después, el equipo ejecutivo da el último feedback.',
     ['sahi:risa', 'Reunión interna al menos tres días antes de presentar. Nada de improvisar en el vestuario.'],
     'Con el cliente, el Creative presenta los caminos y toma el feedback. Ajustamos.',
     'Aprobada: el Project confirma al equipo y a los proveedores, y ordena los pendientes. ¡A la cancha!'],
    ['La última y la más importante: en el AO, todo puede ser una campaña.',
     'Nada de repetir el Manual de Contenidos mes a mes. El manual guía, no limita: cada mes es una oportunidad.',
     'Se pueden sumar extras con presupuesto aparte: influencers, sorteos, audiovisual, coberturas.',
     'Tres cosas aplican a todas las marcas: estacionalidad, lanzamientos y promociones.',
     ['sahi:risa', 'Y las más permeables suman Días De y tendencias: Los Nietitos con el Día del Abuelo, Ricardito con el Mundial. ¡Golazo de calendario!'],
     'Fases: detectar la oportunidad temprano y superar lo que hicimos antes; proponer con moodboard y validar con FD; darle marco en el cronograma; y reportar cómo rindió.',
     ['sahi:feliz', 'Stories destacadas, foto de perfil, canal de comunidad... Aprovechemos a lucirnos y no repetirnos, crack.']],
  ],
};
for (const [id, talk] of Object.entries(TRAINING_TALK)) TRAININGS[id].sessions.forEach((s, i) => { s.full = s.lines; s.lines = talk[i]; });
/* las capacitaciones de Giuli y Alejo, también cortas y con ida y vuelta */
const DUO_TALK = {
  giuli: [
    ['Primera capacitación: nombrar archivos. Parece una pavada; es lo que más tiempo nos ahorra.',
     'La fórmula: Cliente_Proyecto_Pieza_Medida_Versión_Fecha. Por ejemplo: Yerba_Lanzamiento_PostIG_1080x1350_v02_20261016.',
     'Sin espacios, tildes ni eñes. La fecha al revés, así se ordenan solos.',
     ['alejo', '¿Y la palabra "final"?'],
     'Prohibida. Existe v01, v02, v03. "final_FINAL2" es un pedido de ayuda.'],
    ['Segunda: ordenar editables. Un editable es para que lo abra otra persona. O vos, en un año, medio dormid{o}.',
     'Capas con nombre y agrupadas, mesas de trabajo nombradas, nada oculto que sobre.',
     'Y cuando lo pasás, empaquetado: con las tipografías y las imágenes vinculadas.',
     ['alejo', 'Si al abrirlo aparecen cuadraditos rosas...'],
     '...faltó empaquetar. Y alguien sufre. Bueno, yo.'],
    ['Tercera: imprenta. La pantalla perdona; el papel, no.',
     'CMYK, no RGB. 300 dpi al tamaño real. Y 3 milímetros de sangrado, con marcas de corte.',
     'Los textos, a 3 o 4 milímetros del borde: el corte nunca es perfecto.',
     'PDF para imprenta con las tipografías incrustadas. Y si el color importa, prueba de color antes.',
     ['alejo', 'Una vez hizo reimprimir mil folletos por un tono de verde.'],
     'Y quedaron perfectos. De nada.'],
  ],
  alejo: [
    ['Influencers. Lo primero no son los seguidores: es si su comunidad se parece al público de la marca.',
     'Mirá comentarios de verdad, no solo corazones. Y que su contenido tenga que ver con la marca.',
     'Primer mensaje corto y personal: quiénes somos, qué marca, qué proponemos y que vimos su contenido. Nada de copiar y pegar.',
     ['giuli', 'Y todo por escrito.'],
     'Todo: entregables, fechas, aprobaciones, uso del contenido y pago.'],
    ['Lineamientos: para que la marca suene igual la publique quien la publique.',
     'Tono de voz con ejemplos de sí y de no. Tres a cinco pilares. Formatos, emojis, hashtags, colores y tipografías.',
     ['giuli', 'Y corto. Si nadie lo lee, no sirve.'],
     'Lo dice la que lee manuales de tipografía por diversión.'],
    ['Guidelines para grabar: se definen antes, para no lamentarlo después.',
     'Vertical 9:16, la duración, y un gancho en los primeros tres segundos.',
     'Subtítulos siempre: mucha gente mira sin sonido. Y cuidar luz, encuadre y las zonas que tapa la app.',
     ['giuli', 'Música con derechos, logo y cierre definidos.'],
     'Y el guion aprobado antes del rodaje. Reni lo agradece.'],
  ],
};
for (const who of ['giuli', 'alejo']) DUO_LESSONS[who].forEach((l, i) => { l.lines = DUO_TALK[who][i]; });

/* ================= LA RECORRIDA DE BIENVENIDA =================
   El orden para conocer a la agencia: Sahi te recibe en el patio, después Sofi (Asteroide), Fede (Brasil) y Agus y Lía
   (Guaná). Recién ahí, Pimi (Archivos X) o Alejo y Giuli (La Base). Si te salteás a alguien, te mandan con quien sigue.
   Los demás (Lu, Reni, Tato, Marga...) se pueden conocer cuando quieras. */
function welcomeStep(){ if (!S.flags.sofiMet) return 0; if (!S.flags.fedeMet) return 1; if (!S.flags.foundersMet) return 2; return 3; }
const WELCOME_NEXT = ['Sofi, en Asteroide (planta alta)', 'Fede, en Brasil (planta alta)', 'Agus y Lía, en Guaná (planta alta)'];
async function welcomeGate(n){
  const need = {fede: 1, agus: 2, lia: 2, pimi: 3, alejo: 3, giuli: 3}[n.id], met = {fede: S.flags.fedeMet, agus: S.flags.foundersMet, lia: S.flags.foundersMet, pimi: S.flags.pimiMet, alejo: S.flags.duoMet, giuli: S.flags.duoMet}[n.id];
  if (need == null || met) return false;
  const st = welcomeStep(); if (st >= need) return false;
  const next = WELCOME_NEXT[st];
  const line = {
    fede: `¡Hola! Antes de arrancar conmigo, pasá por Asteroide a ver a Sofi. Ella te da la bienvenida a la casa. Después volvé, que el mate no se ceba solo.`,
    agus: `¡Hola! Nos encanta que hayas venido. Pero primero conocé a ${next}: así arranca todo el mundo acá.`,
    lia: `¡Hola! ¡Ya te medí! Pero el orden es el orden: primero ${next}. ¡Después te espero con el tablero!`,
    pimi: `Hola. Todavía es temprano para lo técnico. Primero conocé a ${next}. Después vení, que te doy una mano.`,
    alejo: `¡Hola! Te esperamos, pero antes conocé a ${next}. Después volvés y armamos algo lindo.`,
    giuli: `¡Hola! Primero lo primero: conocé a ${next}. Después volvé, que acá hay mucho para ordenar.`,
  }[n.id];
  await say(line, n.id);
  return true;
}

/* la casa, como te la cuenta Sofi: dónde está cada cosa y quién está en cada lugar */
function casaHTML(){
  const row = (n, d) => `<div><b>${n}:</b> ${d}</div>`, col = (...x) => `<div style="display:flex;flex-direction:column;gap:.5cqw">${x.join('')}</div>`;
  return '<div style="font-size:2.5cqw;line-height:1.18;display:grid;grid-template-columns:1fr 1fr;gap:2.4cqw">' +
    col('<div class="k">Planta baja</div>', row('El Hall', 'la entrada'), row('La Base', 'los pendientes (de ahí salen los problemas), con Alejo y Giuli'),
      row('Sala de Reuniones', 'la biblioteca'), row('Bienestar', 'Lu, para recargar energía'), row('Archivos X', 'el lab de Pimi'), row('Baño', 'al lado de La Base'),
      row('Sala de Clientes', 'los clientes'), row('Sala del Directorio', 'cerrada hasta el nivel 25')) +
    col('<div class="k">Planta alta</div>', row('Brasil', 'Fede'), row('Guaná', 'Agus y Lía'), row('Asteroide', 'Sofi y Tato'), row('Al fondo', 'la escalera a la terraza (con tarjeta)'),
      '<div class="k">Afuera</div>', row('El Patio', 'Sahi y el ping pong'), row('La Barbacoa', 'la cocina, donde suele estar Marga'),
      '<div class="k">Y por toda la casa</div>', row('Reni', 'grabando contenido')) + '</div>';
}
