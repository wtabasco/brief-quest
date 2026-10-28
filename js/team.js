/* Cosas para el equipo: repaso de valores con Agus y encargos que suman experiencia */
"use strict";
/* ================= COSAS PARA EL EQUIPO: experiencia charlando y ayudando =================
   Para que no todo sea resolver problemas: también se sube de nivel haciendo cosas para la gente. Lo que se
   repasa sale de "The Way We Work" (Cultura y Clientes), los equipos y los rituales, lo que menos aparecía.
   - Charla de cómo trabajamos con Fede (una vez por día, en Brasil): tres situaciones de todos los días. Cada
     respuesta buena suma experiencia; si no sale, Fede explica y no pasa nada.
   - Las ideas de la casa, con Montserrat en la terraza (después de la Gran Presentación, una por día): una
     idea a la que le falta una letra del AEIOU; hay que encontrar cuál.
   - Encargos del equipo: alguien te pide que le lleves algo o le avises algo a otra persona. Al hablar con
     esa persona se cumple y suma experiencia. Uno por vez, hasta tres por día. */
/* situaciones de todos los días (Cultura, Clientes, Equipos y Rituales de las presentaciones de la agencia) */
const REPASO = () => [
  {p: 'Te piden una tarea y no te queda claro para cuándo es. ¿Qué hacés?', ok: 'Pregunto antes de arrancar', opts: ['Pregunto antes de arrancar', 'Arranco y después veo', 'Espero a que me avisen'], why: 'No empiezo una tarea sin entenderla ni saber cuándo se entrega.'},
  {p: 'Ves que no llegás con una entrega. ¿Qué hacés?', ok: 'Escalo a tiempo', opts: ['Escalo a tiempo', 'Me quedo hasta tarde y no digo nada', 'Aviso el día de la entrega'], why: 'Si no llego, escalo a tiempo. Avisar temprano es transparencia.'},
  {p: 'Algo de un compañero no te gustó. ¿Cómo lo resolvés?', ok: 'Se lo digo a él, de frente', opts: ['Se lo digo a él, de frente', 'Lo comento en la cocina', 'Lo dejo pasar y me enojo'], why: 'Se habla CON, no se habla DE. Las puertas siempre están abiertas.'},
  {p: 'Te equivocaste en algo. ¿Y ahora?', ok: 'Lo cuento y aprendo', opts: ['Lo cuento y aprendo', 'Lo escondo', 'Le echo la culpa al wifi'], why: 'El error es una oportunidad: busquemos errores nuevos, no repetir los viejos.'},
  {p: 'Te escriben y estás a mil. ¿Qué hacés con el mensaje?', ok: 'Respondo, aunque sea "lo veo a la tarde"', opts: ['Respondo, aunque sea "lo veo a la tarde"', 'Lo dejo en visto', 'Lo contesto la semana que viene'], why: 'Los mensajes se responden: no dejo a nadie colgado.'},
  {p: 'Terminaste algo, pero no te convence del todo. ¿Lo entregás?', ok: 'Me tomo 15 minutos más', opts: ['Me tomo 15 minutos más', 'Lo entrego igual', 'Lo tiro y empiezo de cero'], why: 'Siempre hay 15 minutos más para corregir algo que no nos convence.'},
  {p: 'Todo el mundo dice que lo suyo es urgente. ¿Qué pasa?', ok: 'Si todo es urgente, nada lo es', opts: ['Si todo es urgente, nada lo es', 'Hago todo a la vez', 'Atiendo al que grita más'], why: 'Si todo es urgente, nada es urgente: hay que priorizar.'},
  {p: 'Mañana hay reunión con un cliente. ¿Qué preparás?', ok: 'Un objetivo claro', opts: ['Un objetivo claro', 'Nada, vemos en el momento', 'Cuarenta diapositivas'], why: 'Preparamos cada reunión con un objetivo.'},
  {p: 'Terminó la reunión con el cliente. ¿Qué no puede faltar?', ok: 'La minuta clara', opts: ['La minuta clara', 'Un sticker', 'Nada, ya lo hablamos'], why: 'Toda conversación queda en una minuta clara y la bitácora se mantiene al día.'},
  {p: 'Un cliente pregunta algo que no sabés. ¿Qué respondés?', ok: 'Que lo averiguo y le aviso', opts: ['Que lo averiguo y le aviso', 'Invento algo convincente', 'Cambio de tema'], why: 'Si no sabemos algo, no inventamos.'},
  {p: 'El cliente pide algo para mañana que lleva una semana. ¿Qué hacés?', ok: 'Propongo un plazo real', opts: ['Propongo un plazo real', 'Digo que sí a todo', 'No contesto'], why: 'Plazos reales desde el principio: ser flexibles no es decir que sí a todo.'},
  {p: 'Arrancás una propuesta. ¿Desde dónde partís?', ok: 'Desde lo máximo', opts: ['Desde lo máximo', 'Desde lo mínimo', 'Desde lo que hicimos el año pasado'], why: 'Proponemos cosas increíbles y después bajamos si el cliente lo pide.'},
  {p: '¿Qué significa R = R?', ok: 'Relaciones es igual a resultados', opts: ['Relaciones es igual a resultados', 'Reunión es igual a reunión', 'Rápido es igual a rendidor'], why: 'R = R: relaciones es igual a resultados.'},
  {p: '¿Hasta qué día se entregan los cronogramas?', ok: 'Hasta el 27 de cada mes', opts: ['Hasta el 27 de cada mes', 'El 1 del mes siguiente', 'Cuando estén'], why: 'Los cronogramas se entregan hasta el 27 de cada mes.'},
  {p: 'Un proceso dice "validación en Tabasco". ¿Con quién es?', ok: 'Con el soporte estratégico', opts: ['Con el soporte estratégico', 'Con la salsa', 'Con el cliente'], why: 'Tabasco es el equipo de soporte estratégico. Putaparió, Peppers y Chili son los ejecutivos.'},
  {p: '¿Cuándo se festejan los cumpleaños?', ok: 'En el último Picante del mes', opts: ['En el último Picante del mes', 'Nunca', 'Todos los días'], why: 'Los cumpleaños se celebran en el último Picante del mes, con torta.'},
  {p: '¿Qué pasa el 21 de octubre?', ok: 'El aniversario y los Awards', opts: ['El aniversario y los Awards', 'Cierra la oficina', 'Llega el brief del año'], why: 'El 21 de octubre festejamos el aniversario de la agencia y premiamos en categorías que vota el equipo.'},
  {p: '¿Cuáles son nuestros dos trabajos?', ok: 'Hacer y pensar cómo hacerlo mejor', opts: ['Hacer y pensar cómo hacerlo mejor', 'Trabajar y descansar', 'Mandar mails y contestarlos'], why: 'Hacer lo que hay que hacer y pensar cómo hacerlo mejor.'},
  {p: '¿Quién es responsable del clima de la oficina?', ok: 'Cada uno de nosotros', opts: ['Cada uno de nosotros', 'Sofi', 'El aire acondicionado'], why: 'Soy responsable del clima de la oficina: todo se contagia.'},
].map(q => Object.assign(q, {opts: shuffle(q.opts)}));
function shuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
async function repasoValores(){
  const m = mem(); m.repaso = gameDay();
  await say(pick('repaso:in', ['Tres situaciones de todos los días. Vos me decís qué harías. No es un examen: es oficio.', 'Mientras se enfría un poco el agua: tres situaciones. Pensalas como si fueran de verdad, porque lo son.', 'Tres situaciones. La primera respuesta que se te ocurre, después la versión dos.']), 'fede');
  const qs = shuffle(REPASO()).slice(0, 3); let ok = 0;
  for (const q of qs){
    await say(q.p, 'fede');
    const c = await choose(q.opts, {cancel: null});
    if (q.opts[c] === q.ok){ ok++; await say(pick('repaso:ok', ['Eso. Así se trabaja acá.', 'Bien. Eso es oficio.', 'Tal cual. Ahora hacelo sin pensarlo.', 'Exacto. Como el agua del mate: nunca hervida.']), 'fede:feliz'); }
    else await say(`Mmm, no. ${q.why}`, 'fede:serio');
  }
  m.repasoOk = (m.repasoOk || 0) + ok; m.repasos = (m.repasos || 0) + 1;
  await say(ok === 3 ? 'Tres de tres. Muy bien. Mañana te pido la versión dos.' : ok ? 'Bien. Lo que no salió hoy, mañana sale. Probar, aprender, repetir.' : 'Hoy no salió, y está perfecto: para eso lo charlamos. Mañana de nuevo.', ok === 3 ? 'fede:risa' : 'fede');
  if (ok) await gainXP(Math.max(10, Math.floor(need(S.lvl) * .09 * ok)), sayN);
}

/* encargos: quién te lo pide, a quién se lo llevás, qué te dice cada uno */
const ERRANDS = [
  {from: 'lia', to: 'pimi', ask: '¡Llevale estos números a Pimi! ¡La campaña subió un 12 % en dos horas! Y que los sume a la minuta del cliente, que todo queda registrado.', give: 'Buenísimo. Tranqui, los sumo a la minuta. Si no está escrito, no pasó.', what: 'Llevale los números de la campaña a Pimi'},
  {from: 'alejo', to: 'fede', ask: '¿Le llevás a Fede el cronograma del mes? Hoy es día de entrega: hasta el 27, sin excusas. Giuli ya lo revisó.', give: 'Bien ordenado, y en fecha. Así da gusto. Pasame el mate y lo firmo.', what: 'Llevale el cronograma a Fede'},
  {from: 'sahi', to: 'giuli', ask: 'Che, ¿le preguntás a Giuli qué le pareció mi idea? Pero preguntale a ella, eh: se habla con, no se habla de.', give: 'Me encanta que pregunte. Decile que es original, pero le falta lo estratégico. Que lo charlamos.', what: 'Preguntale a Giuli por la idea de Sahi'},
  {from: 'fede', to: 'lia', ask: 'Avisale a Lía que la pieza para el cliente sale el jueves, no el martes. Mejor escalar a tiempo que prometer y no cumplir.', give: '¡Jueves! ¡Anotado! ¡Gracias por avisar temprano! ¡Así sí se puede planificar!', what: 'Avisale a Lía que la pieza sale el jueves'},
  {from: 'agus', to: 'lu', ask: '¿Le preguntás a Lu si arma la pausa activa del jueves? El clima de la oficina lo cuidamos entre todos.', give: '¡Obvio! ♪ Ya tengo la playlist y todo ♪ Decile a Agus que cuente conmigo.', what: 'Preguntale a Lu por la pausa activa'},
  {from: 'sofi', to: 'tato', ask: '¿Le recordás a Tato que el viernes es Picante y hay torta por los cumpleaños del mes? Si no, se entera el lunes.', give: '¿Torta? ¿El viernes? ...Ah, Picante. Bien. Gracias por avisar. ¿Ya pasó? Ah, no, todavía.', what: 'Recordale a Tato lo del Picante'},
  {from: 'pimi', to: 'sofi', ask: 'Avisale a Sofi que el wifi de arriba ya anda. Y que conteste el mensaje que le mandé: no dejo a nadie colgado. Bueno, ella tampoco.', give: '¡Ay, recién lo veo! Ya le contesto. Gracias. ¿Y vos, comiste algo?', what: 'Avisale a Sofi que el wifi ya anda'},
  {from: 'giuli', to: 'lia', ask: '¿Le llevás las piezas nuevas a Lía? Son AEIOU: actuales, estratégicas, impactantes, originales y útiles. Quiere medir cómo rinden.', give: '¡Ya las cargo en el tablero! ¡En tres minutos tengo los primeros números! ¿Que no hacía falta? ¡Ja!', what: 'Llevale las piezas nuevas a Lía'},
  {from: 'reni', to: 'sahi', ask: '¿Le preguntás a Sahi si podemos grabar el peloteo para el aniversario? El 21 de octubre se viene con todo.', give: '¡Obvio, crack! Y si hay Awards, me postulo a "mejor gambeta". Posta.', what: 'Preguntale a Sahi por el video del aniversario'},
  {from: 'lia', to: 'agus', ask: '¡Llevale esta propuesta a Agus! ¡Arranqué desde lo máximo, como siempre! Que la valide con Tabasco antes de mandarla.', give: 'Desde lo máximo, como debe ser. La paso por Tabasco y después la bajamos a tierra. Gracias.', what: 'Llevale la propuesta de Lía a Agus'},
  {from: 'tato', to: 'sofi', ask: '¿Le llevás esta factura a Sofi? Sin apuro. Bueno, era para la semana pasada.', give: '¡Tato! Bueno, mejor tarde que nunca. La próxima, que avise antes. Gracias por traerla.', what: 'Llevale la factura de Tato a Sofi'},
  {from: 'lu', to: 'pimi', ask: '¿Le llevás este vaso de agua a Pimi? Está desde las nueve con el plan de medios y no tomó nada.', give: 'Uh, gracias. Planificar y optimizar da sed. Y hambre. Siempre hambre.', what: 'Llevale el vaso de agua a Pimi'},
];
const ERRAND_MAX = 3;
const metNpc = id => talksFor(id) > 0;
const errandBy = (from, to) => ERRANDS.find(e => e.from === from && e.to === to);
function errandDesc(){ const e = S.errand && errandBy(S.errand.from, S.errand.to); return e ? `${e.what}. Te lo pidió ${PEOPLE[e.from]}.` : 'Hablá con el equipo: cada tanto alguien te pide una mano.'; }
async function teamExtras(n){
  if (!S || welcomeStep() < 3) return false;
  const m = mem();
  if (!qState('repaso')) qOpen('repaso', true);
  // 1) cumplir un encargo
  if (S.errand && S.errand.to === n.id){
    const e = errandBy(S.errand.from, S.errand.to); S.errand = null;
    if (e){
      await say(e.give, n.id);
      m.errands = (m.errands || 0) + 1;
      await gainXP(Math.max(10, Math.floor(need(S.lvl) * .12)), sayN);
      if (qState('encargo') === 'open') qDone('encargo');
      return true;
    }
  }
  // 2) la charla de cómo trabajamos con Fede, una vez por día (si no tiene un mate o una ceremonia pendiente)
  if (n.id === 'fede' && S.flags.fedeMet && trainingNext('carpetas') !== 0 && m.repaso !== gameDay() && m.repasoAsk !== gameDay()
      && !(S.lvl >= PROJECT_LVL && !S.flags.senior) && !(qState('fede_mate') === 'open' && (S.items.mate || 0) > 0)){
    m.repasoAsk = gameDay();
    await say('Antes de entrenar: ¿charlamos tres situaciones de todos los días? Así se aprende cómo trabajamos acá. Y suma experiencia.', 'fede');
    const c = await choose(['Dale', 'Ahora no'], {cancel: 1});
    if (c === 0){ await repasoValores(); return true; }
  }
  // 3) alguien te pide una mano
  const today = gameDay(); if (m.errandDay !== today){ m.errandDay = today; m.errandsToday = 0; }
  if (!S.errand && m.errandsToday < ERRAND_MAX && talksFor(n.id) > 1 && Math.random() < .4){
    const opts = ERRANDS.filter(e => e.from === n.id && metNpc(e.to));
    if (opts.length){
      const e = opts[rnd(opts.length)];
      await say(e.ask, n.id);
      const c = await choose(['Dale, ya voy', 'Ahora no puedo'], {cancel: 1});
      if (c === 0){ S.errand = {from: e.from, to: e.to}; m.errandsToday++; qReopen('encargo'); return true; }
      await say('Tranqui, no pasa nada.', n.id);
    }
  }
  return false;
}

/* ---- Las ideas de la casa: Montserrat te cuenta una idea y hay que ver qué letra del AEIOU le falta ---- */
const IDEAS = [
  {t: 'Una campaña con el baile que estaba de moda hace cinco años. Me lo mostró mi nieto. En 2019.', no: 'Actual', why: 'Le falta lo Actual: tiene que estar a la vanguardia y ser pertinente en su contexto.'},
  {t: 'Un posteo divino, con colores lindos, que no sabemos para qué sirve ni a qué objetivo apunta. Pero es divino.', no: 'Estratégico', why: 'Le falta lo Estratégico: todo parte de una estrategia definida antes.'},
  {t: 'Un texto larguísimo en letra chiquita, gris sobre gris, para leer con lupa. Muy completo, eso sí.', no: 'Impactante', why: 'Le falta lo Impactante: tiene que llamar la atención y ser visualmente atractivo.'},
  {t: 'Hacemos lo mismo que hizo la competencia la semana pasada. Total, a ellos les funcionó.', no: 'Original', why: 'Le falta lo Original: no se copia de la competencia ni se repite de la propia marca.'},
  {t: 'Un video precioso de un perro surfeando para un estudio de contadores. Al cliente no le sirve de nada. Pero el perro surfea.', no: 'Útil', why: 'Le falta lo Útil: tiene que aportar valor y ser necesario para el cliente.'},
  {t: 'Repetimos la campaña del año pasado de la misma marca. Cambiamos la fecha y listo.', no: 'Original', why: 'Le falta lo Original: tampoco se repite de la propia marca.'},
  {t: 'Una pieza para el Día de la Madre. La publicamos en agosto, que hay menos ruido.', no: 'Actual', why: 'Le falta lo Actual: fuera de su contexto, no es pertinente.'},
  {t: 'Una acción en una plaza, sin objetivo ni público pensado. Vemos qué pasa.', no: 'Estratégico', why: 'Le falta lo Estratégico: primero se define la estrategia, después la idea.'},
];
async function montseIdea(){
  const m = mem(); m.montseIdea = gameDay();
  const pool = IDEAS.filter((_, i) => !(m.ideasOk || []).includes(i)), list = pool.length ? pool : IDEAS, idea = list[rnd(list.length)], idx = IDEAS.indexOf(idea);
  await say(pick('montse:idea', ['Te cuento una idea que me trajeron. Vos me decís qué le falta.', 'Sentate. Te cuento una idea y vos me decís qué letra le falta. Del AEIOU, obvio.', 'Una idea de las de antes. A ver si le encontrás la falla.']), 'montse');
  await say(idea.t, 'montse');
  const c = await choose(AEIOU.map(([a]) => a), {cancel: null});
  if (AEIOU[c][0] === idea.no){
    m.ideasOk = (m.ideasOk || []).concat(idx);
    await say(pick('montse:ok', ['Exacto. Tenés ojo. Eso no se enseña: se entrena.', 'Eso mismo. Si no es AEIOU, no se propone.', 'Bien visto. Así se cuida una idea.']), 'montse');
    await gainXP(Math.max(20, Math.floor(need(S.lvl) * .22)), sayN);
    if (qState('ideas') === 'open' && m.ideasOk.length >= 5){ qDone('ideas'); await say('Cinco ideas, cinco fallas encontradas. Ahora las ideas te las traigo yo a vos para que las mejores. ¡Ja!', 'montse'); }
  } else {
    await say(`Mmm, no. ${idea.why}`, 'montse');
    await say('Mañana te traigo otra. Las ideas no se acaban; la paciencia, a veces.', 'montse');
  }
}

/* ================= EL PRÓXIMO PASO, SIEMPRE A LA VISTA =================
   Un cartelito abajo a la izquierda dice qué hacer ahora y dónde (también arriba de todo en Tareas).
   Prioridad: la recorrida, las noticias que te esperan, las tareas cumplidas para cobrar, el encargo en curso y
   después el objetivo del juego (con el nivel que conviene tener para cada cliente). */
const PLACE = {'Fede': 'Brasil (planta alta)', 'Sahi': 'el patio, en la mesa de ping pong', 'Pimi': 'Archivos X (planta baja)', 'Sofi': 'Asteroide (planta alta)',
  'Agus': 'Guaná (planta alta)', 'Lía': 'Guaná (planta alta)', 'Agus y Lía': 'Guaná (planta alta)', 'Lu': 'Bienestar (planta baja)', 'Giuli': 'La Base', 'Alejo': 'La Base', 'Montserrat': 'la terraza'};
const AUTO_Q = ['objetivo', 'clientes', 'repaso', 'ideas', 'encargo', 'bienvenida', 'terraza', 'anual', 'fijo', 'senior', 'pimi_surf'];
function nextStep(){
  if (!S) return '';
  if (welcomeStep() < 3) return `Hablá con ${WELCOME_NEXT[welcomeStep()]}.`;
  if (S.lvl >= 15 && !S.flags.fijo) return 'Agus y Lía te esperan en Guaná (planta alta): tienen una noticia.';
  if (S.lvl >= PROJECT_LVL && !S.flags.senior) return 'Fede te espera en Brasil (planta alta).';
  if (wildTotal() === 0) return 'Resolvé tu primer problema: caminá entre las pilas de pendientes de La Base (planta baja).';
  if (trainingNext('carpetas') === 0 && !trainingToday('carpetas')) return 'Fede te espera en Brasil (planta alta) con tu primera capacitación: orden de carpetas.';
  const ready = QUEST_ORDER.find(id => qState(id) === 'open' && !AUTO_Q.includes(id) && qReady(id));
  if (ready){ const g = QUESTS[ready].giver; return `¡Cumpliste "${QUESTS[ready].title}"! Volvé a hablar con ${g}${PLACE[g] ? ', en ' + PLACE[g] : ''}.`; }
  if (S.errand){ const e = errandBy(S.errand.from, S.errand.to); if (e) return `${e.what}.`; }
  if (!S.flags.done){
    const k = BOSS_ORDER.find(x => !S.beaten[x]);
    if (k){ const L = CLIENT_LVL[k], n = ({fantasma: 'la Clienta Fantasma', logo: 'Don Logo', explote: 'la Clienta Explosiva'})[k];
      return S.lvl < L ? `Preparate para ${n} (nivel ${L}): resolvé problemas en La Base y capacitate con el equipo. Estás en el ${S.lvl}.`
        : `Destrabá a ${n} en la Sala de Clientes (planta baja).${k === 'explote' ? ' Podés ir con Fede.' : ''}`; }
    if (!S.flags.card) return 'Agus y Lía te esperan en Guaná (planta alta).';
    return 'La Gran Presentación: subí a la terraza por la escalera del fondo del pasillo de arriba.';
  }
  if (S.lvl < PROJECT_LVL) return `Seguí aprendiendo: en el nivel ${PROJECT_LVL} pasás a Project Leader. Estás en el ${S.lvl}.`;
  if (!S.flags.anual) return `Presentale la campaña del año al Cliente del Año (nivel ${CLIENT_LVL.anual}), en la Sala del Directorio (planta baja).`;
  return S.lvl < 30 ? `Seguí creciendo hasta el nivel 30: ayudá al equipo y charlá con Fede y Montserrat. Estás en el ${S.lvl}.` : '¡Llegaste lejísimos! Ayudá al equipo y completá la bitácora.';
}
/* El cartelito "AHORA" no queda fijo: aparece unos segundos cuando cambia el próximo paso (y al empezar el día).
   Para verlo cuando quieras está el botón AYUDA (o la tecla H, o "Ayuda" en el menú de START). */
function drawTrackHUD(){
  const el = $('nowstep'); if (!el) return;
  const can = !!S && G.mode === 'world' && $('title').hidden && !G.trans && !G.busy;
  if (can && (!drawTrackHUD.t || G.t - drawTrackHUD.t > 700)){
    drawTrackHUD.t = G.t; const t = nextStep();
    if (drawTrackHUD.last !== t){ const first = drawTrackHUD.last === undefined; drawTrackHUD.last = t; if (!first || isFreshStart()){ el.innerHTML = `<b>AHORA</b> ${fmt(t)}`; drawTrackHUD.until = G.t + 6500; } }
  }
  const show = can && G.t < (drawTrackHUD.until || 0);
  if (el.hidden === show) el.hidden = !show;
}
const isFreshStart = () => !!S && welcomeStep() === 0;
/* AYUDA: qué hacer ahora, las tareas en curso y cómo se juega */
function helpHTML(){
  const open = QUEST_ORDER.filter(id => qState(id) === 'open' && !['objetivo', 'repaso', 'ideas', 'clientes', 'bienvenida'].includes(id)).slice(0, 3);
  const qs = open.map(id => { const [a, b] = qProg(id); return `<div>· <b>${QUESTS[id].title}</b> (${a}/${b}), de ${QUESTS[id].giver}</div>`; }).join('');
  const ideas = xpIdeas().map(t => `<div>· ${fmt(t)}</div>`).join('');
  return `<div style="font-size:2.45cqw;line-height:1.2;display:flex;flex-direction:column;gap:.45cqw"><h4>Ahora</h4><div>${fmt(nextStep())}</div>` + (ideas ? `<h4 style="margin-top:.6cqw">Para sumar experiencia hoy</h4>${ideas}` : '') + (qs ? `<h4 style="margin-top:.6cqw">En curso</h4>${qs}` : '') +
    `</div>`;
}
async function helpPanel(){ const p = panelInfo('AYUDA', helpHTML()); $('panelHint').textContent = 'B: volver · Todas tus tareas: START → Tareas'; await p; }
async function helpScreen(){
  if (!S || G.busy || G.mode !== 'world' || !$('dlg').hidden || !$('title').hidden) return;
  G.busy = true; const prev = CLOSE_BTN; CLOSE_BTN = 'help';
  try { await helpPanel(); } finally { CLOSE_BTN = prev; closePanel(); G.busy = false; }
}
(() => { const b = $('helpBtn'); if (b) b.addEventListener('click', e => { e.preventDefault(); unlockAudio(); if (H.length && CLOSE_BTN === 'help') press('help'); else helpScreen(); }); })();
/* tocar el cartelito abre la ayuda */
(() => { const el = $('nowstep'); if (!el) return;
  el.addEventListener('click', () => helpScreen()); })();

/* ================= QUE NO ABURRA: ritmo, hitos y qué se destrabó =================
   - Hitos de La Base: cada tanto (10, 25, 50, 75, 100, 150 y 200 problemas resueltos) alguien del equipo lo festeja
     con su estilo y suma un poco de experiencia. Así el camino entre clientes tiene pequeñas celebraciones.
   - Al subir de nivel, el juego dice qué se destrabó: el próximo cliente, capacitaciones nuevas o tareas para cobrar.
   - En AYUDA, "Para sumar experiencia": lo que podés hacer hoy además de resolver problemas. */
const HITOS = [
  [10, 'sahi', '¡Diez problemas resueltos, crack! Ya tenés hinchada en La Base.'],
  [25, 'lia', '¡Veinticinco problemas! ¡Ya hice un gráfico! ¡Dos, en realidad! ¡Uno de barras y uno de torta!'],
  [50, 'pimi', 'Cincuenta problemas. Tranqui. Ya sos parte del sistema.'],
  [75, 'agus', 'Setenta y cinco problemas resueltos. ¿Y cómo te hace sentir eso? Perdón, me salió.'],
  [100, 'fede', 'Cien problemas. Muy bien. Ahora resolvé el ciento uno en menos turnos.'],
  [150, 'tato', '¿Ciento cincuenta problemas? ¿Ya? Uh. Felicitaciones atrasadas.'],
  [200, 'reni', '¡Doscientos problemas! Lo subo a las stories. ¿Comiste algo, por lo menos?'],
];
const wildTotal = () => Object.keys(EN).reduce((n, k) => n + ((S.log[k] && S.log[k].beaten) || 0), 0);
async function hitoCheck(msg){
  const n = wildTotal(), m = mem(); m.hitos = m.hitos || [];
  if (n === 1 && !m.firstWin){ m.firstWin = true; await msg('¡Tu primer problema resuelto! Fede te espera en Brasil (planta alta) con tu primera capacitación.', 2400); }
  const h = HITOS.find(([k]) => n >= k && !m.hitos.includes(k)); if (!h) return;
  m.hitos.push(h[0]);
  await msg(`${PEOPLE[h[1]]}: "${h[2]}"`, 2600);
  await gainXP(Math.max(10, Math.floor(need(S.lvl) * .1)), msg);
}
async function levelUnlocks(L, msg){
  const out = [];
  const k = BOSS_ORDER.find(x => !S.beaten[x]);
  if (k && L === CLIENT_LVL[k]) out.push(`¡Ya tenés el nivel para ${({fantasma: 'la Clienta Fantasma', logo: 'Don Logo', explote: 'la Clienta Explosiva'})[k]}! Te espera en la Sala de Clientes.`);
  if (S.flags.done && L === CLIENT_LVL.anual && !S.flags.anual) out.push('Ya estás a la altura del Cliente del Año. Te espera en la Sala del Directorio.');
  for (const id of Object.keys(TRAININGS)) { const T = TRAININGS[id]; if (T.minLvl === L && trainingNext(id) === 0) out.push(`${PEOPLE[T.who]} ya te puede dar la capacitación "${T.title}".`); }
  const ready = QUEST_ORDER.filter(id => qState(id) === 'open' && QUESTS[id].minLvl === L && qCountOk(id));
  for (const id of ready) out.push(`Ya podés volver con ${QUESTS[id].giver}: cumpliste "${QUESTS[id].title}".`);
  for (const t of out.slice(0, 3)) await msg(t, 2000);
}
/* lo que se puede hacer hoy para sumar experiencia, además de los problemas de La Base */
function xpIdeas(){
  const L = [];
  for (const id of Object.keys(TRAININGS)){ const T = TRAININGS[id]; if (S.lvl >= T.minLvl && trainingNext(id) >= 0 && !trainingToday(id)) L.push(`Capacitación con ${PEOPLE[T.who]}: ${T.title}.`); }
  for (const who of ['giuli', 'alejo']) if (S.flags.foundersMet && duoNext(who) >= 0 && !duoToday(who)) L.push(`Capacitación de ${who === 'giuli' ? 'diseño con Giuli' : 'redes con Alejo'}, en La Base.`);
  if (S.flags.fedeMet && mem().repaso !== gameDay()) L.push('La charla de cómo trabajamos con Fede, en Brasil.');
  if (S.flags.done && mem().montseIdea !== gameDay()) L.push('Una idea de Montserrat, en la terraza.');
  if (!S.errand && welcomeStep() >= 3) L.push('Charlá con el equipo: a veces te piden una mano.');
  return L.slice(0, 3);
}
