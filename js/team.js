/* Cosas para el equipo: repaso de valores con Agus y encargos que suman experiencia */
"use strict";
/* ================= COSAS PARA EL EQUIPO: experiencia charlando y ayudando =================
   Para que no todo sea resolver problemas: también se sube de nivel haciendo cosas para la gente. Lo que se
   repasa sale de "The Way We Work" (Cultura y Clientes), los equipos y los rituales, lo que menos aparecía.
   - Charla de cómo trabajamos con Fede (una vez por día, en Brasil): tres situaciones de todos los días. Cada
     respuesta buena suma experiencia; si no sale, Fede explica y no pasa nada.
   - Repasitos: cada tanto alguien te tira una pregunta rápida (tipos, tareas y horas, AEIOU, propósito o valores).
   - Encargos del equipo: alguien te pide que le lleves algo o le avises algo a otra persona. Al hablar con
     esa persona se cumple y suma experiencia. Uno por vez, hasta tres por día. */
/* situaciones de todos los días (Cultura, Clientes, Equipos y Rituales de las presentaciones de la agencia) */
const REPASO = () => [
  {p: 'Te piden una tarea y no te queda claro para cuándo es. ¿Qué hacés?', ok: 'Pregunto antes de arrancar', opts: ['Pregunto antes de arrancar', 'Arranco y después veo', 'Espero a que me avisen'], why: 'No empiezo una tarea sin entenderla ni saber cuándo se entrega.'},
  {p: 'Ves que no llegás con una entrega. ¿Qué hacés?', ok: 'Escalo a tiempo', opts: ['Escalo a tiempo', 'Me quedo hasta tarde y no digo nada', 'Aviso el día de la entrega'], why: 'Si no llego, escalo a tiempo. Avisar temprano es transparencia.'},
  {p: 'Algo de un compañero no te gustó. ¿Cómo lo resolvés?', ok: 'Se lo digo a él, de frente', opts: ['Se lo digo a él, de frente', 'Lo comento en la cocina', 'Lo dejo pasar y me enojo'], why: 'Se habla CON, no se habla DE. Las puertas siempre están abiertas.'},
  {p: 'Te llegan tres tareas por Slack. ¿Por cuál arrancás?', ok: 'Por la que el Project puso primera', opts: ['Por la que el Project puso primera', 'Por la que más me gusta', 'Por la más fácil, para sacarla'], why: 'Las tareas las manda el Project por Slack en orden de prioridad, y se respeta ese orden.'},
  {p: 'Arrancás una tarea para un cliente. ¿Qué no te olvidás?', ok: 'Trackear el tiempo en ClickUp', opts: ['Trackear el tiempo en ClickUp', 'Avisarle a toda la agencia', 'Cambiar el fondo de pantalla'], why: 'Con las horas de ClickUp sabemos cuánto le dedicamos a cada cliente: así valorizamos mejor nuestro trabajo y elegimos con qué clientes trabajar.'},
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
  {p: '¿Cuándo se festejan los cumpleaños?', ok: 'En la última Picante del mes', opts: ['En la última Picante del mes', 'Nunca', 'Todos los días'], why: 'Los cumpleaños se celebran en la última Picante del mes, con torta.'},
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
  {from: 'sofi', to: 'tato', ask: '¿Le recordás a Tato que el viernes es Picante y hay torta por los cumpleaños del mes? Si no, se entera el lunes.', give: '¿Torta? ¿El viernes? ...Ah, Picante. Bien. Gracias por avisar. ¿Ya pasó? Ah, no, todavía.', what: 'Recordale a Tato lo de la Picante'},
  {from: 'pimi', to: 'sofi', ask: 'Avisale a Sofi que se volvió a caer el wifi de arriba. Ella lo arregla antes de que soporte técnico conteste. Yo le mando el aviso; no dejo a nadie colgado.', give: '¡Ay, otra vez! Ya voy. A soporte le abro un ticket igual, para la colección. ¿Y vos, comiste algo?', what: 'Avisale a Sofi que se cayó el wifi de arriba'},
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
  // si Marga te demoró con las fotos, el primero con quien hablás te lo comenta
  await margaLateTalk(n);
  // 0) antes del Cliente del Año, el consejo de cada uno (la colaboración)
  if (await teamTip(n)) return true;
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
    return false;
  }
  // el repaso final, para quien terminó el juego antes de que existiera (o lo quiere ver otra vez desde La agencia)
  if (S.flags.done && !S.flags.repasoFinal && (n.id === 'agus' || n.id === 'lia') && m.repFinalAsk !== gameDay()){
    m.repFinalAsk = gameDay();
    await say(n.id === 'lia' ? '¡Te debemos algo! ¡El repaso final de todo lo que aprendiste! En la agencia te lo vamos a preguntar, ¿lo hacemos?' : 'Te debemos el repaso final de todo lo que aprendiste. En la agencia te lo vamos a preguntar, así quedás bien parad{o}. ¿Lo hacemos?', n.id);
    if (await choose(['Dale', 'Ahora no'], {cancel: 1}) === 0){ await repasoFinal(); return true; }
    return false;
  }
  // después del final: más personalidad, más repasitos y misiones secundarias
  if (S.flags.done && await postGame(n)) return true;
  // 3) un repasito de lo importante: propósito, valores o tipos
  if (repasitoReady(n, m)){ await repasito(n); return true; }
  // 4) alguien te pide una mano
  const today = gameDay(); if (m.errandDay !== today){ m.errandDay = today; m.errandsToday = 0; }
  if (!S.errand && m.errandsToday < ERRAND_MAX && talksFor(n.id) > 1 && Math.random() < .4){
    const opts = ERRANDS.filter(e => e.from === n.id && metNpc(e.to));
    if (opts.length){
      const e = opts[pick('errand:' + n.id, opts.map((_, i) => i))];
      await say(e.ask, n.id);
      const c = await choose(['Dale, ya voy', 'Ahora no puedo'], {cancel: 1});
      if (c === 0){ S.errand = {from: e.from, to: e.to}; m.errandsToday++; qReopen('encargo'); return true; }
      await say(pick(n.id + ':errno', ['Tranqui, no pasa nada.', 'Dale, otro día será.', 'Todo bien, lo resuelvo de otra forma.']), n.id);
    }
  }
  return false;
}

/* ---- Ideas con alguna letra del AEIOU de menos: van en los repasitos ---- */
const IDEAS = [
  {t: 'Una campaña con el baile que estaba de moda hace cinco años. Bueno, seis.', no: 'Actual', why: 'Le falta lo Actual: tiene que estar a la vanguardia y ser pertinente en su contexto.'},
  {t: 'Un posteo divino, con colores lindos, que no sabemos para qué sirve ni a qué objetivo apunta. Pero es divino.', no: 'Estratégico', why: 'Le falta lo Estratégico: todo parte de una estrategia definida antes.'},
  {t: 'Un texto larguísimo en letra chiquita, gris sobre gris, para leer con lupa. Muy completo, eso sí.', no: 'Impactante', why: 'Le falta lo Impactante: tiene que llamar la atención y ser visualmente atractivo.'},
  {t: 'Hacemos lo mismo que hizo la competencia la semana pasada. Total, a ellos les funcionó.', no: 'Original', why: 'Le falta lo Original: no se copia de la competencia ni se repite de la propia marca.'},
  {t: 'Un video precioso de un perro surfeando para un estudio de contadores. Al cliente no le sirve de nada. Pero el perro surfea.', no: 'Útil', why: 'Le falta lo Útil: tiene que aportar valor y ser necesario para el cliente.'},
  {t: 'Repetimos la campaña del año pasado de la misma marca. Cambiamos la fecha y listo.', no: 'Original', why: 'Le falta lo Original: tampoco se repite de la propia marca.'},
  {t: 'Una pieza para el Día de la Madre. La publicamos en agosto, que hay menos ruido.', no: 'Actual', why: 'Le falta lo Actual: fuera de su contexto, no es pertinente.'},
  {t: 'Una acción en una plaza, sin objetivo ni público pensado. Vemos qué pasa.', no: 'Estratégico', why: 'Le falta lo Estratégico: primero se define la estrategia, después la idea.'},
];

/* ================= EL PRÓXIMO PASO, SIEMPRE A LA VISTA =================
   Un cartelito abajo a la izquierda dice qué hacer ahora y dónde (también arriba de todo en Tareas).
   Prioridad: la recorrida, las noticias que te esperan, las tareas cumplidas para cobrar, el encargo en curso y
   después el objetivo del juego (con el nivel que conviene tener para cada cliente). */
const PLACE = {'Fede': 'Brasil (planta alta)', 'Sahi': 'el patio, en la mesa de ping pong', 'Pimi': 'Archivos X (planta baja)', 'Sofi': 'Asteroide (planta alta)',
  'Agus': 'Guaná (planta alta)', 'Lía': 'Guaná (planta alta)', 'Agus y Lía': 'Guaná (planta alta)', 'Lu': 'Bienestar (planta baja)', 'Giuli': 'La Base', 'Alejo': 'La Base'};
const placeOf = g => PLACE[g];
const AUTO_Q = ['secundaria', 'objetivo', 'clientes', 'repaso', 'encargo', 'bienvenida', 'anual', 'anual_equipo', 'fijo', 'senior', 'pimi_surf'];
function nextStep(){
  if (!S) return '';
  if (welcomeStep() < 3) return `Hablá con ${WELCOME_NEXT[welcomeStep()]}.`;
  if (S.lvl >= 15 && !S.flags.fijo) return 'Agus y Lía te esperan en Guaná (planta alta): tienen una noticia.';
  if (S.lvl >= PROJECT_LVL && !S.flags.senior) return 'Fede te espera en Brasil (planta alta).';
  if (wildTotal() === 0) return 'Resolvé tu primer problema: caminá entre las pilas de pendientes de La Base (planta baja).';
  if (trainingNext('carpetas') === 0 && !trainingToday('carpetas')) return 'Fede te espera en Brasil (planta alta) con tu primera capacitación: orden de carpetas.';
  const ready = QUEST_ORDER.find(id => qState(id) === 'open' && !AUTO_Q.includes(id) && qReady(id));
  if (ready){ const g = QUESTS[ready].giver; return `¡Cumpliste "${QUESTS[ready].title}"! Volvé a hablar con ${g}${placeOf(g) ? ', en ' + placeOf(g) : ''}.`; }
  if (S.errand){ const e = errandBy(S.errand.from, S.errand.to); if (e) return `${e.what}.`; }
  if (!S.flags.done){
    const k = BOSS_ORDER.find(x => !S.beaten[x]);
    if (k){ const L = CLIENT_LVL[k], n = ({fantasma: 'la Clienta Fantasma', logo: 'Don Logo', explote: 'la Clienta Explosiva'})[k];
      if (recShown(k)) return S.lvl < REC_LVL[k] ? `Volvé con ${n} cuando llegues al nivel ${REC_LVL[k]}: resolvé problemas en La Base y capacitate con el equipo. Estás en el ${S.lvl}.`
        : `Volvé a intentarlo con ${n} en la Sala de Clientes (planta baja).${k === 'explote' ? ' Podés ir con Fede.' : ''}`;
      return `${capFirst(n)} te espera en la Sala de Clientes (planta baja). Mientras te preparás: resolvé problemas en La Base y capacitate con el equipo.${k === 'explote' ? ' Podés ir con Fede.' : ''}`; }
    if (!S.flags.card) return 'Agus y Lía te esperan en Guaná (planta alta): tienen algo grande para vos.';
    if (S.lvl < PROJECT_LVL){ const p = PLAN_Q.find(q => qState(q) === 'open');
      return p ? `Camino al Cliente del Año (nivel ${PROJECT_LVL}): ${QUESTS[p].desc()} Estás en el ${S.lvl}.` : `Seguí resolviendo problemas hasta el nivel ${PROJECT_LVL}: ahí te espera el Cliente del Año. Estás en el ${S.lvl}.`; }
    return teamTipsStep() || `Presentale la campaña del año al Cliente del Año, en la Sala del Directorio (planta baja).`;
  }
  if (S.flags.anual && sideStep()) return sideStep();
  if (!S.flags.anual && teamTipsStep()) return teamTipsStep();
  if (!S.flags.anual) return `Presentale la campaña del año al Cliente del Año, en la Sala del Directorio (planta baja).`;
  return `Terminaste la inducción: el juego está completo. Si querés seguir: los clientes volvieron con más exigencias (la Clienta Fantasma, nivel ${clientLvl('fantasma')}), el equipo te pide misiones secundarias y podés seguir subiendo de nivel (estás en el ${S.lvl}).`;
}
/* El cartelito "AHORA" no queda fijo: aparece unos segundos cuando cambia el próximo paso (y al empezar el día).
   Para verlo cuando quieras está el botón AYUDA (o la tecla H, o "Ayuda" en el menú de START). */
function drawTrackHUD(){
  const el = $('nowstep'); if (!el) return;
  const can = !!S && G.mode === 'world' && $('title').hidden && !G.trans && !G.busy;
  if (can && (!drawTrackHUD.t || G.t - drawTrackHUD.t > 700)){
    drawTrackHUD.t = G.t; const t = nextStep();
    // al empezar, una vez; después solo si pasa mucho sin avanzar (te trabaste): ahí aparece con la pista
    if (drawTrackHUD.last === undefined){ drawTrackHUD.last = t; if (isFreshStart()){ el.innerHTML = `<b>AHORA</b> ${fmt(t)}`; drawTrackHUD.until = G.t + 6500; } }
    if (stuckNow(t)){ el.innerHTML = `<b>PISTA</b> ${fmt(t)}`; drawTrackHUD.until = G.t + 9000; }
  }
  const show = can && G.t < (drawTrackHUD.until || 0);
  if (el.hidden === show) el.hidden = !show;
}
const isFreshStart = () => !!S && welcomeStep() === 0;
/* AYUDA: qué hacer ahora, las tareas en curso y cómo se juega */
function helpHTML(){
  const open = QUEST_ORDER.filter(id => qState(id) === 'open' && !['objetivo', 'repaso', 'clientes', 'bienvenida'].includes(id)).slice(0, 3);
  const qs = open.map(id => { const [a, b] = qProg(id); return `<div>· <b>${QUESTS[id].title}</b> (${a}/${b}), de ${QUESTS[id].giver}</div>`; }).join('');
  const ideas = xpIdeas().map(t => `<div>· ${fmt(t)}</div>`).join('');
  return `<div style="font-size:2.45cqw;line-height:1.2;display:flex;flex-direction:column;gap:.45cqw"><h4>Ahora</h4><div>${fmt(nextStep())}</div>` + (ideas ? `<h4 style="margin-top:.6cqw">Para sumar experiencia hoy</h4>${ideas}` : '') + (qs ? `<h4 style="margin-top:.6cqw">En curso</h4>${qs}` : '') +
    `<div class="k" style="margin-top:.6cqw">¿Qué habilidad usar contra cada problema? Mirá la guía del pizarrón grande de La Base.</div></div>`;
}
async function helpPanel(){ const p = panelInfo('AYUDA', helpHTML()); $('panelHint').textContent = 'X: volver · Todas tus tareas: START → Tareas'; await p; }
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
  if (k && recShown(k) && L === REC_LVL[k]) out.push(`¡Ya tenés el nivel para ${({fantasma: 'la Clienta Fantasma', logo: 'Don Logo', explote: 'la Clienta Explosiva'})[k]}! Te espera en la Sala de Clientes.`);
  if (S.bosses >= 3 && recShown('anual') && L === REC_LVL.anual && !S.flags.anual) out.push('Ya estás a la altura del Cliente del Año. Te espera en la Sala del Directorio.');
  for (const id of Object.keys(TRAININGS)) { const T = TRAININGS[id]; if (T.minLvl === L && trainingNext(id) === 0) out.push(`${PEOPLE[T.who]} ya te puede dar la capacitación "${T.title}".`); }
  const ready = QUEST_ORDER.filter(id => qState(id) === 'open' && QUESTS[id].minLvl === L && qCountOk(id));
  for (const id of ready) out.push(`Ya podés volver con ${QUESTS[id].giver}: cumpliste "${QUESTS[id].title}".`);
  if (L >= 20 && unlockTeams()) out.unshift('¡Destrabaste las consolas de los cuadros: Boca, Peñarol y Nacional, también en glass! Están en el botoncito de color de la consola.');
  if (L >= 15 && unlockGlass()) out.unshift('¡Destrabaste la consola glass! Tocá el botoncito de color de la consola: ahora también vienen transparentes, con los circuitos a la vista.');
  for (const t of out.slice(0, 4)) await msg(t, 2000);
}
/* lo que se puede hacer hoy para sumar experiencia, además de los problemas de La Base */
function xpIdeas(){
  const L = [];
  for (const id of Object.keys(TRAININGS)){ const T = TRAININGS[id]; if (S.lvl >= T.minLvl && trainingNext(id) >= 0 && !trainingToday(id) && !(id === 'carpetas' && wildTotal() === 0)) L.push(`Capacitación con ${PEOPLE[T.who]}: ${T.title}.`); }
  for (const who of ['giuli', 'alejo']) if (S.flags.foundersMet && duoNext(who) >= 0 && !duoToday(who)) L.push(`Capacitación de ${who === 'giuli' ? 'diseño con Giuli' : 'redes con Alejo'}, en La Base.`);
  if (S.flags.fedeMet && mem().repaso !== gameDay()) L.push('La charla de cómo trabajamos con Fede, en Brasil.');
  if (!S.errand && welcomeStep() >= 3) L.push('Charlá con el equipo: a veces te piden una mano.');
  if (S.flags.done && !S.side) L.unshift('Charlá con el equipo: después de la inducción te piden misiones secundarias y te cuentan más de ellos.');
  return L.slice(0, 3);
}

/* ---- Repasitos: cada tanto, alguien del equipo te tira una pregunta rápida (propósito, valores o tipos) ---- */
const REP_SIT = [
  ['Te das cuenta de que no llegás con una entrega y avisás temprano.', 'Transparencia'],
  ['Un cliente te pregunta algo que no sabés y le decís "lo averiguo y te confirmo", en vez de inventar.', 'Transparencia'],
  ['Le pasás a alguien de otro equipo el atajo que te ahorró una hora.', 'Colaboración'],
  ['Se complica una entrega en otro equipo y te ofrecés a dar una mano.', 'Colaboración'],
  ['Se cae el wifi en plena presentación y buscás cómo seguir, con una sonrisa.', 'Actitud positiva'],
  ['Te llega un "cambio chiquito" el viernes a las 17 y lo resolvés sin drama.', 'Actitud positiva'],
  ['Después de cada campaña anotás qué harías distinto la próxima vez.', 'Aprendizaje'],
  ['Probás una herramienta nueva para hacer el reporte más rápido.', 'Aprendizaje'],
  ['Dejás la cocina como la encontraste, cuidás las plantas y saludás a Marga por su nombre.', 'Sentido de pertenencia'],
  ['Hablás de los clientes de la agencia como "nuestros clientes".', 'Sentido de pertenencia'],
];
const REP_FAKE = ['El cambio chiquito', 'La reunión que podía ser un mail', 'Archivo_final_v7', 'Contestar mails a las tres de la mañana', 'El "lo vemos el lunes"', 'Que todo sea urgente'];
const REP_PURPOSE = [
  {q: 'Completá nuestro propósito: "Creamos estrategias de comunicación que generan un impacto positivo en el crecimiento de..."', a: 'Nuestros clientes, las personas y el planeta', o: ['Los likes, los seguidores y las stories', 'La cantidad de reuniones por semana']},
  {q: 'Según nuestro propósito, ¿qué creamos?', a: 'Estrategias de comunicación con impacto positivo', o: ['Posteos lindos para llenar el calendario', 'Presentaciones de ochenta diapositivas']},
  {q: 'Nuestro propósito habla de un impacto positivo. ¿En el crecimiento de quiénes?', a: 'De los clientes, las personas y el planeta', o: ['Solo de la agencia', 'Del que más fuerte habla en la reunión']},
];
// cómo llegan las tareas y dónde se trackea el tiempo
const REP_TASKS = [
  {q: '¿Cómo te llegan las tareas del día?', a: 'Por Slack, de mi Project, en orden de prioridad', o: ['Por señales de humo', 'Las elijo yo, según cuál me gusta más']},
  {q: 'Tenés tres tareas en Slack. ¿Cuál hacés primero?', a: 'La que el Project puso como prioridad', o: ['La más divertida', 'La más corta, para tachar algo']},
  {q: '¿Dónde se trackea el tiempo de cada tarea?', a: 'En ClickUp', o: ['En un post-it', 'En la memoria, que nunca falla']},
  {q: '¿Para qué trackeamos las horas en ClickUp?', a: 'Para saber cuánto le dedicamos a cada cliente y valorizar mejor el trabajo', o: ['Para que Lía tenga más gráficos', 'Para saber a qué hora almorzás']},
  {q: 'Con las horas de ClickUp, la agencia puede...', a: 'Elegir mejor con qué clientes trabajar', o: ['Dormir la siesta con la conciencia tranquila', 'Hacer reuniones más largas']},
];
const TASKS_WHY = 'Las tareas te las manda tu Project por Slack, en orden de prioridad. Y el tiempo se trackea en ClickUp: así sabemos cuánto le dedicamos a cada cliente, valorizamos mejor el trabajo y elegimos con qué clientes trabajar.';
// el tipo de habilidad que destraba cada tipo de problema (ver CHART en data.js)
const TYPE_LBL = {CRE: 'Creativo', EST: 'Estrategia', TEC: 'Técnico', CAL: 'Calma'};
const PT_LBL = {BURO: 'burocracia', CAOS: 'caos', BUG: 'bug', PRES: 'presión'};
const REP_TYPES = [['CRE', 'BURO'], ['EST', 'CAOS'], ['TEC', 'BUG'], ['CAL', 'PRES']];
const TYPE_RULE = 'Lo creativo destraba la burocracia, la estrategia ordena el caos, lo técnico arregla los bugs y la calma desarma la presión.';
/* la guía del pizarrón grande de La Base: qué tipo de habilidad destraba cada problema (y cada cliente) */
function typeChartHTML(){
  const met = k => S.log && S.log[k] && (S.log[k].seen || S.log[k].beaten);
  const names = t => Object.keys(EN).filter(k => EN[k].t === t).map(k => met(k) ? EN[k].n : '???').join(', ');
  const cli = t => BOSS_ORDER.filter(k => BOSS[k].t === t && S.log && S.log[k]).map(k => BOSS[k].n);
  const row = (t, sk, weak) => { const c = cli(t);
    return `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:1cqw;align-items:center;padding:.5cqw 0;border-bottom:.2cqw solid var(--rule)">` +
      `<div><b style="color:${TYPES[t].c}">${TYPES[t].n}</b><div class="k">${names(t)}${c.length ? '<br>Cliente: ' + c.join(', ') : ''}</div></div>` +
      `<div style="font-size:3.4cqw">←</div><div><b style="color:${TYPES[sk].c}">${TYPES[sk].n}</b><div class="k">${weak}</div></div></div>`; };
  return H_([P_('Qué habilidad destraba cada problema: contra el que corresponde, rinde el doble.'),
    row('BURO', 'CRE', 'Lo técnico rinde poco.'), row('CAOS', 'EST', 'Lo creativo y la calma rinden poco.'),
    row('BUG', 'TEC', 'La estrategia rinde poco.'), row('PRES', 'CAL', 'Lo demás rinde normal.'),
    K_('??? = todavía no lo cruzaste. Con una habilidad de cada tipo, siempre tenés la buena.')], 2.5);
}
async function typeChartLook(){
  await say('En una esquina del pizarrón grande, alguien armó una guía con marcadores de colores: qué destraba cada problema. Abajo dice: "Para que nadie le pegue a un bug con calma. Firmado: Pimi."');
  await panelInfo('QUÉ DESTRABA QUÉ', typeChartHTML()); closePanel();
}
const TYPE_WEAK = {CAOS: ' Ojo: contra el caos, lo creativo y la calma rinden poco.', BUG: ' Ojo: contra un bug, la estrategia rinde poco.', BURO: ' Ojo: contra la burocracia, lo técnico rinde poco.', PRES: ''};
const valOpts = n => shuffle(VALORES.map(v => v[0]).filter(x => x !== n)).slice(0, 2);
/* antes de preguntar qué letra le falta a una idea, se explica qué es el AEIOU (con la voz de quien pregunta) */
const AEIOU_PRE = {
  fede: 'Te repaso algo de contenido. Todo lo que sale de acá tiene que ser AEIOU: Actual, Estratégico, Impactante, Original y Útil. Si le falta una letra, no se propone. Como el mate sin yerba: no es mate.',
  giuli: 'Para el contenido usamos el AEIOU: tiene que ser Actual, Estratégico, Impactante, Original y Útil. Las cinco. Si falta una, no sale, aunque esté lindo.',
  alejo: 'En contenido lo chequeamos con el AEIOU: Actual, Estratégico, Impactante, Original y Útil. Si falta una letra, la idea no va. Toma descartada.',
};
function repQuestion(kind){
  if (kind === 'tareas') return {...REP_TASKS[rnd(REP_TASKS.length)], why: TASKS_WHY};
  if (kind === 'aeiou'){ const i = IDEAS[rnd(IDEAS.length)], o = shuffle(AEIOU.map(([x]) => x).filter(x => x !== i.no)).slice(0, 2);
    return {q: `Te cuento una idea: "${i.t}" ¿Qué letra del AEIOU le falta?`, a: i.no, o, why: i.why}; }
  if (kind === 'prop') return {...REP_PURPOSE[rnd(REP_PURPOSE.length)], why: 'Nuestro propósito: ' + PROPOSITO};
  if (kind === 'def'){ const [n, d] = VALORES[rnd(VALORES.length)]; return {q: `"${d}" ¿Qué valor es?`, a: n, o: valOpts(n), why: `Nuestros cinco valores son: ${VALORES.map(v => v[0]).join(', ')}.`}; }
  if (kind === 'sit'){ const [t, n] = REP_SIT[rnd(REP_SIT.length)], d = VALORES.find(v => v[0] === n)[1]; return {q: `${t} ¿Qué valor es ese?`, a: n, o: valOpts(n), why: d}; }
  if (kind === 'fun'){ const [n] = VALORES[rnd(VALORES.length)]; return {q: '¿Cuál de estos es uno de nuestros cinco valores?', a: n, o: shuffle(REP_FAKE).slice(0, 2), why: `Los cinco son: ${VALORES.map(v => v[0]).join(', ')}.`}; }
  // tipos: con un problema que ya cruzaste, si hay
  const [sk, pt] = REP_TYPES[rnd(REP_TYPES.length)];
  const seen = Object.keys(LESSON_LVL).filter(k => EN[k] && EN[k].t === pt && S.log[k]), k = seen.length ? seen[rnd(seen.length)] : null;
  return {q: k ? `Te salta ${EN[k].n}, que es de ${PT_LBL[pt]}. ¿Qué tipo de habilidad lo destraba mejor?` : `Te salta un problema de ${PT_LBL[pt]}. ¿Qué tipo de habilidad lo destraba mejor?`,
    a: TYPE_LBL[sk], o: shuffle(Object.keys(TYPE_LBL).filter(x => x !== sk)).slice(0, 2).map(x => TYPE_LBL[x]), why: TYPE_RULE + TYPE_WEAK[pt] + ' Está en la guía del pizarrón grande de La Base.'};
}
// cada uno pregunta, festeja y explica con su estilo (Lu no: con ella se recarga)
const REP_VOICE = {
  fede: {in: ['Pregunta rápida, de las que me gustan. Lo importante se repite, como la ronda.', 'Un repasito antes de seguir. Sin mate, pero rápido.', 'Te tomo una. Cortita. Después seguimos.'],
    ok: ['Eso. Ahora en menos tiempo. Es chiste: bien ahí.', 'Exacto. Eso, todos los días.'], no: ['Tranqui. Lo importante es que ahora lo sabés.', 'La próxima sale. Probar y aprender.'], m: 'fede:feliz'},
  sahi: {in: ['Che, pará. Pregunta de la tribuna, rapidita.', 'Antes de seguir, una de repaso. Como el himno antes del partido.'],
    ok: ['¡Golazo, crack! Lo tenés clarísimo.', '¡Eso! Lo sabés de memoria, como la formación del equipo.'], no: ['Uh, pegó en el travesaño. Pero ahora ya la sabés.', 'Tranqui, crack. Para eso están los repasos.'], m: 'sahi:feliz'},
  pimi: {in: ['Pregunta rápida. Tranqui, es fácil.', 'Te tiro una. Sin presión.'],
    ok: ['Bien. Así de simple.', 'Eso. Tranqui, lo tenés.'], no: ['Tranqui. Ahora ya está.', 'No pasa nada. La próxima sale.'], m: 'pimi'},
  reni: {in: ['Ay, para una story: ¿me contestás una cosita rápida?', 'Te pregunto algo y te grabo contestando. Mentira. Bueno, un poquito.'],
    ok: ['¡Ay, qué bien! Eso va para las stories.', '¡Sabía que lo sabías!'], no: ['No pasa nada. Ahora ya lo sabés. ¿Comiste?', 'Tranqui, que esto no lo subo. Ahora ya lo sabés.'], m: 'reni'},
  agus: {in: ['Un repasito, que lo importante se repite. ¿Te animás?', 'Te hago una pregunta. Prometo que no es de psicoanálisis.'],
    ok: ['Muy bien. ¿Y cómo te hace sentir eso? Es chiste. Bueno, medio.', 'Eso. Se nota que lo hiciste tuyo.'], no: ['Tranqui. Equivocarse también es aprender. Freud diría algo, pero lo dejo ahí.', 'No pasa nada. Lo importante es que ahora te queda.'], m: 'agus:feliz'},
  lia: {in: ['¡Pregunta relámpago! ¡Tenés cinco segundos! Bueno, los que necesites.', '¡Te mido una cosa! ¿Cuánto te acordás de lo importante?'],
    ok: ['¡Correcto! ¡Lo anoto en el tablero!', '¡Bien! ¡En tiempo récord! ¿Que no lo medí? ¡Ja! Sí lo medí.'], no: ['¡No pasa nada! Ahora ya lo sabés, y lo que se sabe se mejora.', '¡Casi! La próxima la clavás, lo tengo medido.'], m: 'lia:feliz'},
  sofi: {in: ['Antes de que te vayas, una preguntita. ¿Comiste? No, esa no. Otra.', 'Te pregunto algo rapidito, como cuando reviso que anden todas las compus.'],
    ok: ['¡Bien! Ahora comé una fruta, que pensar cansa.', '¡Eso! Todo en orden.'], no: ['Tranqui, para eso está la hoja de los valores en La Base.', 'No pasa nada. Ahora ya lo sabés. ¿Tomaste agua?'], m: 'sofi:feliz'},
  tato: {in: ['...Ah, hola. Me pidieron que te pregunte algo. Creo que era esto.', 'Che, una pregunta. Tranqui, sin apuro. Yo tampoco tengo.', 'Te iba a decir otra cosa, pero se me fue. Te pregunto esto, mientras vuelve.'],
    ok: ['...¿Ya contestaste? Bien. Muy bien. Creo.', 'Eso. Los números cierran.'], no: ['Tranqui. Yo me enteré la semana pasada.', 'No pasa nada. A mí me lo preguntaron hace un mes y todavía lo estoy pensando.'], m: 'tato'},
  alejo: {in: ['Te tiro una, como en un rodaje: toma única.', 'Una rápida, antes de que Giuli me robe la escena.'],
    ok: ['Eso. Plano perfecto.', 'Bien. Eso tiene buena luz.'], no: ['Tranqui. Se repite la toma y listo.', 'Salió fuera de foco, pero ahora ya lo ves.'], m: 'alejo'},
  giuli: {in: ['Una rápida, antes de volver al diseño.', 'Te hago una pregunta prolija, de esas que van en su carpeta.'],
    ok: ['¡Eso! Va directo a la carpeta de lo importante.', 'Bien. Claro y en su lugar.'], no: ['Tranqui. Ahora lo guardás en la carpeta correcta.', 'No pasa nada. Lo importante es que ya lo tenés ordenado.'], m: 'giuli'},
  marga: {in: ['Mi vida, ¿me ayudás? Me preguntaron esto el otro día y no me acordaba.', 'Corazón, vos que estás aprendiendo tanto: ¿me contestás una?'],
    ok: ['¡Eso, mi vida! Qué inteligente.', '¡Ay, qué bien! Se lo cuento a mis nietas.'], no: ['Ay, yo tampoco me acordaba, corazón. Ahora ya sabemos los dos.', 'No pasa nada, mi vida. Ahora ya lo sabés.'], m: 'marga'},
};
const REP_MAX = 2; // como mucho dos por día
function repasitoReady(n, m){
  const v = REP_VOICE[n.id]; if (!v || !S.flags.valores) return false;
  if (m.repDay !== gameDay()){ m.repDay = gameDay(); m.repToday = 0; }
  const post = !!S.flags.done;
  if (m.repToday >= REP_MAX + (post ? 2 : 0) || (m.battles || 0) - (m.repAt ?? -99) < (post ? 2 : 4) || talksFor(n.id) < 2) return false;
  // si te espera una recompensa o una ceremonia con esa persona, primero lo importante
  const nm = PEOPLE[n.id] || '';
  if (QUEST_ORDER.some(id => qState(id) === 'open' && !AUTO_Q.includes(id) && qReady(id) && String(QUESTS[id].giver || '').includes(nm))) return false;
  if ((n.id === 'agus' || n.id === 'lia') && S.lvl >= 15 && !S.flags.fijo) return false;
  if (n.id === 'fede' && S.lvl >= PROJECT_LVL && !S.flags.senior) return false;
  return Math.random() < (S.flags.done ? .4 : .3);
}
async function repasito(n){
  const m = mem(), v = REP_VOICE[n.id], who = n.id;
  m.repAt = m.battles || 0; m.repToday = (m.repToday || 0) + 1; m.repN = (m.repN || 0) + 1;
  // antes de los clientes conviene repasar los tipos; después, más propósito y valores
  const r = Math.random(), early = (S.bosses || 0) < 3;
  const W = early ? [['tipo', .3], ['tareas', .2], ['aeiou', .1], ['prop', .1], ['def', .1], ['sit', .15], ['fun', .05]] : [['tipo', .15], ['tareas', .2], ['aeiou', .15], ['prop', .15], ['def', .1], ['sit', .2], ['fun', .05]];
  let acc = 0, kind = 'sit'; for (const [k, w] of W){ acc += w; if (r < acc){ kind = k; break; } }
  // lo de contenidos (el AEIOU) lo preguntan los que hacen contenido: Fede, Giuli y Alejo
  if (kind === 'aeiou' && !AEIOU_PRE[who]) kind = 'sit';
  // cada uno pregunta de lo suyo: Marga, de valores y propósito; Tato, de eso y de tareas y horas (sus números)
  const ONLY = {marga: ['def', 'sit', 'fun'], tato: ['prop', 'def', 'sit', 'fun', 'tareas']}[who];
  if (ONLY && !ONLY.includes(kind)) kind = ONLY[rnd(ONLY.length)];
  const q = repQuestion(kind);
  await say(pick(who + ':repin', v.in), who);
  if (kind === 'aeiou') await say(AEIOU_PRE[who], who);
  await say(q.q, who);
  const opts = shuffle([q.a, ...q.o]);
  const c = await choose(opts, {cancel: null});
  if (opts[c] === q.a){
    m.repOk = (m.repOk || 0) + 1;
    await say(pick(who + ':repok', v.ok), v.m || who);
    await gainXP(Math.max(8, Math.floor(need(S.lvl) * .06)), sayN);
  } else {
    await say(`Era "${q.a}". ${q.why}`, who);
    await say(pick(who + ':repno', v.no), who);
  }
}

/* ---- El repaso final: al terminar el juego (el Cliente del Año), lo importante de todo lo aprendido ---- */
const REPASO_FINAL = () => [
  {who: 'agus', intro: 'Primero, lo que nos une: el propósito y los valores.', title: 'PROPÓSITO Y VALORES', html: valoresHTML()},
  {who: 'fede', intro: 'Después, cómo trabajamos. Esto se nota todos los días, con el equipo y con los clientes.', title: 'CÓMO TRABAJAMOS', html: H_([
    B_('AEIOU:', 'si no es actual, estratégico, impactante, original y útil, no lo proponemos.'),
    B_('Con, no de:', 'se habla con las personas, no de las personas. Y si no llegás, escalás a tiempo.'),
    B_('Plazos reales:', 'si prometemos algo, lo cumplimos. Y si no sabemos algo, no inventamos.'),
    B_('Tareas y horas:', 'las tareas llegan por Slack, de tu Project, en orden de prioridad. El tiempo se trackea en ClickUp: así valorizamos mejor el trabajo.'),
    B_('Minuta clara:', 'toda conversación con el cliente queda registrada. R = R: relaciones es igual a resultados.'),
    B_('15 minutos más:', 'siempre hay tiempo para mejorar lo que no nos convence. Partimos de lo máximo.')], 2.6)},
  {who: 'giuli', intro: 'Y el orden, que nos ahorra horas a todos.', title: 'CARPETAS Y ARCHIVOS', html: H_([
    B_('La carpeta del equipo:', 'ahí se trabaja todo, porque tiene respaldo. Nunca en el Escritorio ni en Descargas.'),
    B_('Cada mes:', '01 Cronograma, 02 Materiales, 03 Editables, 04 Finales y 05 Reporte. Lo que no es Always On, en Extras.'),
    B_('Exclientes:', 'a 01 INACTIVAS después de un mes sin activar. No se borran: se ordenan.'),
    B_('Siempre en orden:', 'las cosas se ordenan al momento de trabajarlas: bien nombradas y en su carpeta correspondiente. Después nunca llega.')], 2.6)},
  {who: 'alejo', intro: 'Los procesos de todos los meses: el cronograma y el reporte.', title: 'CRONOGRAMA Y REPORTE', html: H_([
    B_('Cronograma:', 'se sube a la carpeta del cliente antes del 27 de cada mes, y se manda por mail con el asunto "Cronograma Marca MES".'),
    B_('Cambios:', 'la nueva versión se guarda con _V2. En las dos carpetas quedan todas las versiones.'),
    B_('Reporte:', 'antes del 15 de cada mes: Paid aporta la pauta y Social, lo orgánico.')], 2.6)},
  {who: 'sahi', intro: '¡Las campañas, como te las conté, y quiénes somos en la cancha, che!', title: 'CAMPAÑAS, ROLES Y RITUALES', html: H_([
    B_('Campañas:', 'brief y coordinación, conceptos, presupuesto, plan de medios, diseño, presentación y aprobación.'),
    B_('Social Manager:', 'comunicar y gestionar. <b>Graphic Designer:</b> materializar.'),
    B_('Paid Media:', 'planificar y optimizar. <b>Project Leader:</b> liderar y encantar.'),
    B_('Equipos:', 'Tabasco es el soporte estratégico; Putaparió, Peppers y Chili, los equipos ejecutivos.'),
    B_('Rituales:', 'la Picante cada dos viernes, los cumpleaños en la última Picante del mes y el aniversario el 21 de octubre.')], 2.6)},
];
async function repasoFinalPages(){
  for (const p of REPASO_FINAL()){ await say(p.intro, p.who); await panelInfo(p.title, p.html); closePanel(); }
}
async function repasoFinal(ending){
  S.flags.repasoFinal = true;
  await say(`${ending ? 'Antes del festejo, un repaso' : 'Un repaso'} de todo lo que aprendiste. En la agencia te lo vamos a preguntar, así que mejor tenerlo fresco: así quedás bien parad{o}.`, 'agus');
  await repasoFinalPages();
  await say('¡Y lo tenés siempre a mano: en START, La agencia, Repaso final! ¡Repasalo, que lo voy a medir! ¡Ja! Bueno, un poquito.', 'lia:risa');
  await say(ending ? 'Ahora sí: ¡a festejar!' : 'Con todo esto, ya sos parte de la casa de verdad.', 'agus:feliz');
}

/* ---- Antes del Cliente del Año: el consejo de tu equipo (Fede, Sahi, Lu, Alejo y Giuli) ----
   Con la ayuda de todos se puede con cualquier desafío (la colaboración). Cuando sos Project Leader y ya destrabaste
   a los tres clientes, se abre la tarea: hablás con cada uno y te deja un consejo. Sin eso, el Cliente del Año te
   manda a buscar a tu equipo; con eso, entrás a la reunión con todo el equipo encima (ataque, defensa y velocidad). */
const TEAM_TIPS = {
  fede: ['La campaña del año se arma como el mate: en ronda. Escuchá a todos antes de presentar. Y llevá la versión dos, ¿eh?', 'fede:feliz'],
  sahi: ['Che, nadie gana un partido solo. Ni Riquelme. Andá con todo el equipo en la cabeza, crack.', 'sahi:feliz'],
  lu: ['¡Dormí bien la noche antes y tomá agua! ¡Y si te ponés nervios{o}, tarareá algo! Funciona, te lo juro.', 'lu:risa'],
  alejo: ['Contalo como una peli: un comienzo que atrape, un conflicto y un final que quede. Toma única.', 'alejo'],
  giuli: ['Que la presentación esté prolija, bien nombrada y en su carpeta. Lo lindo también convence.', 'giuli'],
};
const tipsLeft = () => Object.keys(TEAM_TIPS).filter(id => !(mem().tips || []).includes(id));
const teamTipsDone = () => !tipsLeft().length;
function teamTipOpen(){ if (S.lvl >= PROJECT_LVL && (S.bosses || 0) >= 3 && !S.flags.anual && !qState('anual_equipo')) qOpen('anual_equipo'); }
async function teamTip(n){
  teamTipOpen();
  if (qState('anual_equipo') !== 'open' || !TEAM_TIPS[n.id] || (mem().tips || []).includes(n.id)) return false;
  if (n.id === 'fede' && !S.flags.senior) return false; // primero la charla de Project Leader
  const m = mem(); m.tips = (m.tips || []).concat(n.id);
  const [t, mood] = TEAM_TIPS[n.id];
  await say(t, mood);
  const left = tipsLeft();
  if (left.length){ await say(`Consejo para la campaña del año: ${Object.keys(TEAM_TIPS).length - left.length} de ${Object.keys(TEAM_TIPS).length}.`); }
  else {
    qDone('anual_equipo'); SFX.learn();
    await say('Tenés el consejo de tu equipo: Fede, Sahi, Lu, Alejo y Giuli. Con la ayuda de todos se puede con cualquier desafío: eso es colaboración.');
    await say('Ellos van con vos a la reunión con el Cliente del Año: arrancás con más ataque, defensa y velocidad.');
  }
  return true;
}
function teamTipsStep(){
  if (qState('anual_equipo') !== 'open') return '';
  const left = tipsLeft().map(id => PEOPLE[id]);
  return `Antes del Cliente del Año, pedile un consejo a tu equipo (Fede, Sahi, Lu, Alejo y Giuli). Te ${left.length === 1 ? 'falta' : 'faltan'}: ${left.join(', ')}.`;
}

/* ¿Te trabaste? Si el próximo paso no cambia en mucho rato (7 desafíos o 3 horas del reloj del juego caminando),
   el cartelito aparece con la pista. Después espera otro tanto antes de volver a aparecer. */
const STUCK_BATTLES = 7, STUCK_MIN = 180;
function stuckNow(step){
  const m = mem(), now = clk().day * 1440 + clk().min, b = m.battles || 0;
  const key = step + '|' + S.lvl; // subir de nivel también es avanzar
  if (m.stuckStep !== key){ m.stuckStep = key; m.stuckAt = {b, now}; return false; }
  const s = m.stuckAt || (m.stuckAt = {b, now});
  if (b - s.b >= STUCK_BATTLES || now - s.now >= STUCK_MIN){ m.stuckAt = {b, now}; return true; }
  return false;
}

/* ================= DESPUÉS DEL FINAL: seguir conociendo al equipo =================
   Terminada la inducción, el juego sigue: los personajes cuentan mucho más de sí mismos (charlas con su personalidad,
   POST), los repasitos aparecen más seguido y hay misiones bien secundarias (SIDE) para seguir sumando experiencia. */
const POST = {
  fede: [['¿Sabés qué es lo que más me gusta de este laburo? Que nunca está terminado. Siempre hay una versión dos.', 'Hasta con el mate: lo cebo hace años y todavía le encuentro la vuelta. El agua nunca hervida, ¿eh? Esas cosas.'],
    ['Cuando llegué en 2018 era diseñador. Pensaba que lo importante era que el diseño quedara lindo.', 'Después entendí que lo importante es que el equipo crezca. Lo lindo viene solo cuando el equipo está bien.'],
    ['Te cuento algo: la bolsa de boxeo no es para pelear. Es para pensar.', 'Le doy un rato y la idea aparece. No sé por qué. Prueba y error, supongo.'],
    ['¿Viste que pido mate todo el tiempo? No es solo por el mate. Bueno, un poco sí.', 'Es la excusa para que alguien suba, charlemos dos minutos y me cuente cómo viene. La ronda es eso.']],
  sahi: [['Che, ¿sabés por qué tengo la camiseta en la silla? Cábala, crack.', 'La vez que no la traje se cayó el wifi, Don Logo pidió el logo más grande y perdió Boca. Todo el mismo día. No arriesgo más.'],
    ['Extraño Buenos Aires, posta. Las medialunas, el ruido, el colectivo lleno.', 'Pero acá tengo el patio, la mesa de ping pong y a ustedes. Es como tener la Bombonera en casa, pero más tranqui.'],
    ['¿Sabés qué es ser creativo? Es como Riquelme: ve el pase antes que nadie.', 'No corre más que el resto: piensa antes. Eso intento con cada idea. A veces sale un caño, a veces sale al lateral.'],
    ['El otro día le enseñé a Lu a pegarle de revés. Ella me enseñó a tararear Morat.', 'Ahora yo tarareo en el ping pong y ella le pega de revés. Intercambio cultural, le dicen.']],
  lu: [['¿Sabés cuál es mi secreto para tener energía? Dormir. No hay otro. Ocho horas. Bueno, siete y media.', 'Y agua. Y cantar. Y bailar en la cocina cuando nadie mira. Bueno, cuando Marga mira, que se ríe.'],
    ['Sahi me dijo que "re cringe" ya no se usa. ¿Cómo que no se usa? ¡Si lo acabo de aprender!', 'Bueno, lo sigo usando igual. Si es cringe que lo use, mejor: lo uso con más ganas.'],
    ['Una vez armé una pausa activa en La Base. Todos estirando, hasta Tato.', 'Bueno, Tato estiró cuando ya habíamos terminado. Pero estiró, que es lo que importa.'],
    ['♪ Na-na-naaa... ♪ ¿Te gusta? La inventé recién. Es sobre el cafecito de Marga.', 'Tiene dos estrofas y un estribillo que dice "cafecito" muchas veces. Un hit, no lo dudes.']],
  pimi: [['El finde fui a Rocha. Olas buenas. Me caí como veinte veces.', 'Pero la veintiuno salió. Con la pauta pasa igual: probás, medís, ajustás. Tranqui.'],
    ['¿Sabés por qué estoy tan tranqui cuando se prende fuego todo? Porque si me pongo nervioso, se prende más.', 'Respiro, como un alfajor y arranco. En ese orden.'],
    ['Con Lía tenemos un grupo, "Clics". Nos mandamos números a la noche.', 'Ella con signos de exclamación. Yo con un pulgar. Nos entendemos perfecto.'],
    ['Estoy pensando una automatización que avise cuando hay medialunas en la cocina.', 'Todavía no existe. Pero sería mi mejor innovación. Sahi ya la quiere.']],
  reni: [['¿Comiste? En serio te pregunto. Siempre te veo de acá para allá.', 'Vení, tomá un mate. Y contame cómo estás, que en el chat no se nota.'],
    ['Te cuento un chisme de los buenos: Tato llegó a horario el martes. Toda la agencia lo comentó.', 'Él no se enteró de que lo comentamos. Obvio.'],
    ['El reel del festejo tiene un montón de vistas. ¿Lo viste? Salís re bien.', 'Lo grabé con el celu y la luz de la ventana. No hace falta más: hace falta mirar bien.'],
    ['Me encanta grabar al equipo cuando no se da cuenta. Ahí sale lo lindo.', 'Fede pensando con el mate, Sahi con los jueguitos, Lu cantando. La agencia es eso.'],
    ['Si algún día vas a Paysandú, avisame. Te armo el recorrido: la costanera, el río, la basílica y un chivito.', 'Y si es en Semana de Turismo, la Semana de la Cerveza. Llevá ganas de caminar.'],
    ['¿Querés el chisme del día? Sofi escondió galletitas en un cajón de Asteroide para que no se las coma Pimi.', 'Pimi ya las encontró. Sofi todavía no sabe. Yo sé todo. Es mi don.'],
    ['El domingo fui al Parque Central. Grité tanto que hoy tengo la voz de Tato.', 'Bueno, Tato no grita. Pero me entendiste. ¡Vamo Nacional!'],
    ['En Paysandú nos conocemos todos. Acá en la agencia, igual: por eso me siento en casa.', 'Bueno, casi. Acá falta el río. Lo compenso con el termo.']],
  agus: [['¿Te cuento algo? Cuando arrancamos con Lía, en 2010, éramos dos y una idea.', 'Ella quería salir a vender ya. Yo quería armar el proceso primero. Hicimos las dos cosas. Así seguimos.'],
    ['Como psicóloga te digo: a veces un "ok" es solo un "ok".', 'Y a veces es un "ok." con punto. Ese ya hay que charlarlo. ¿Y cómo te hace sentir eso? Perdón, me salió.'],
    ['Lo que más me gusta de RRHH no son los procesos. Bueno, me encantan los procesos.', 'Pero lo que más me gusta es ver a alguien crecer. Como vos: de pasante hasta acá.'],
    ['¿Sabés cuál es el mejor teambuilding? El mate de la mañana. No lo planifica nadie.', 'Bueno, yo lo planifico un poco. Pero que no se note.']],
  lia: [['¿Sabés cuántos mates toma Fede por día? ¡Lo medí! ¡Catorce! ¡Promedio de la semana!', '¿Que para qué lo medí? ¡Para saberlo! ¡Ja! Bueno, también para comprar más yerba.'],
    ['¡Somos minoría, pero medimos todo! Pimi y yo, contra todo el equipo de branding.', 'Ellos dicen "se siente bien". Yo digo "¿cuánto bien?". ¡Y nos queremos igual!'],
    ['¡A mí los procesos me cuestan! ¡Lo admito! Agus los sigue al pie de la letra.', 'Yo quiero salir a hablar con el cliente ya. Entre las dos, la agencia anda. ¡Es la fórmula!'],
    ['¡Lo que más me gusta es la primera reunión con un cliente nuevo! ¡Es como el primer día de clases!', '¡Escuchar qué necesita, pensar cómo medirlo y salir corriendo a hacerlo! Bueno, caminando. Agus me frena.']],
  sofi: [['¿Comiste? Te dejé una manzana en la mesa de Asteroide. La roja, no la verde, que esa es de Tato.', 'Bueno, Tato no se va a dar cuenta. Pero por las dudas.'],
    ['Soporte técnico me contestó un ticket. ¿Sabés de cuándo era? Del cumpleaños de Lía.', 'Del de este año, eh. Por suerte ya lo había arreglado yo. Les dije gracias igual. Con cariño.'],
    ['Me gusta que la casa esté linda. Las plantas regadas, la fruta, las compus andando.', 'Nadie se da cuenta cuando todo funciona. Y está bien: esa es la idea.'],
    ['Tato y yo somos un buen equipo. Yo me acuerdo de las cosas y él de los números.', 'Entre los dos, nos acordamos de todo. Bueno, casi.']],
  tato: [['¿Vos estuviste en el festejo? ...Ah, el festejo era tuyo. Felicitaciones atrasadas. Otra vez.', 'Igual de la torta me acuerdo. De eso sí.'],
    ['El reggae va un poquito atrás del tiempo. Por eso nunca me apuro.', 'Los números tampoco se apuran. Somos tres: el reggae, los números y yo. Tranquilos.'],
    ['Hoy vine con dos medias distintas. Sofi se dio cuenta. Yo, recién cuando me lo dijo.', 'Igual el balance cerró perfecto. Eso sí.'],
    ['¿Te conté que tengo una lista de reggae de catorce horas? ...¿Sí? ¿Te lo conté?', 'Bueno, ahora tiene quince. Le agregué una. La misma, dos veces. Sin querer.']],
  alejo: [['Ayer revelé un rollo. Treinta y seis fotos. Salieron doce.', 'Las otras veinticuatro son de mi dedo. Igual me gustan: tienen textura.'],
    ['Para mí cada reel es una peli corta: comienzo, conflicto y final.', 'Giuli dice que exagero. Después me pide que le arme la playlist para diseñar.'],
    ['Si tuviera que elegir entre la cámara de rollo y el celu, elijo los dos. Uno para pensar y el otro para publicar.', 'Igual el rollo fue el que me enseñó a mirar.'],
    ['Lo que más me lleva de un reel no es editarlo: es encontrar la canción justa.', 'Giuli dice que es una manía. Yo digo que es criterio.'],
    ['¿Sabés qué hago cuando me trabo con una idea? Agarro la guitarra y toco un blues.', 'Si a los tres acordes no salió, dibujo. Y si tampoco, le escribo a Vir. Ahí sale seguro.'],
    ['Ayer fui al Campeón del Siglo con Vir. Ella no es de fútbol, pero vino igual.', 'Eso es amor. Y Peñarol también. Pero primero Vir.'],
    ['Vir dice que dibujo mejor de lo que toco la guitarra.', 'Y que toco mejor de lo que canto. Tiene razón en todo. Por eso me casé con ella.']],
  giuli: [['Tengo una libreta solo de letras que veo por la calle. Carteles viejos, etiquetas, menús.', 'Alejo me saca fotos mientras las dibujo. Somos una dupla rara, pero funciona.'],
    ['Lo que más me gusta del diseño es cuando nadie nota que está ahí.', 'Si todo se entiende fácil, el diseño hizo su trabajo. Como el orden de carpetas: nadie lo aplaude, todos lo usan.'],
    ['Cuando veo un afiche lindo en la calle, le saco foto. Cuando veo uno feo, también.', 'Del feo se aprende más. Pero no se lo digas a nadie.'],
    ['Tengo una caja llena de etiquetas: vino, yerba, fósforos. Ordenadas por color.', 'Alejo dice que es un archivo. Tiene razón: hasta tiene carpetas.'],
    ['¿Ya probaste las galletas de mi hermana? Es pastelera. ¿No? Esta semana te encargo una cajita.', 'No es publicidad. Bueno, un poco. Pero son buenísimas, preguntale a Pimi.'],
    ['Les hice pulseras de la amistad a todos, como en los recitales de Taylor. Fede la usa en el termo.', 'Tato la perdió el primer día. Le hice otra. También la perdió. Ya le hice cinco.'],
    ['Tostada, mi gata, me despierta todos los días a las siete. Por eso llego con todo.', 'La máquina de chambear arranca temprano. Gracias a Tostada.']],
  marga: [['Mi vida, ¿te mostré las fotos de mis nietas? Esta es la más chiquita. Esta la grande, en el acto.', 'Y esta soy yo en Venecia. Bueno, es una góndola. Yo estoy atrás, ¿me ves?'],
    ['Corazón, ¿sabés hace cuánto estoy en la agencia? Desde que eran poquitos.', 'Los vi crecer a todos. Ahora te veo crecer a vos. Me pone contenta.'],
    ['El año que viene quiero ir a Grecia. Las casitas blancas con el mar azul.', 'Ya junté folletos. Mi nieta me ayuda a buscar los pasajes en el celular.']],
};
const POST_MOOD = {fede: 'fede:feliz', sahi: 'sahi:risa', lu: 'lu:risa', agus: 'agus:feliz', lia: 'lia:risa'};
async function postTalk(n){
  const L = POST[n.id]; if (!L) return false;
  const i = pick('post:' + n.id, L.map((_, k) => k));
  const who = POST_MOOD[n.id] || n.id;
  for (const t of L[i]) await say(t, who);
  return true;
}
/* misiones secundarias: una por vez, cada una de alguien del equipo y con su estilo */
const SIDE = {
  sahi_revancha: {who: 'sahi', title: 'La revancha de Sahi', what: 'Sacale un punto a Sahi en el peloteo (mesa de ping pong del patio)', goal: 1, n: () => mem().ppWins || 0,
    ask: 'Che, crack, quiero la revancha. Un peloteo, en la mesa del patio. Si me sacás un punto, te debo un dulce de leche del Río de la Plata.', done: '¡Me la sacaste otra vez! Bueno, la revancha de la revancha queda para el jueves. Tomá, lo prometido.'},
  lu_pausa: {who: 'lu', title: 'Pausa activa', what: 'Resolvé 3 problemas en La Base y volvé con Lu a estirar', goal: 3, n: () => wildTotal(),
    ask: '¡Te propongo algo! Resolvé tres problemas en La Base y después venís y estiramos juntos. ¡Pausa activa ganada!', done: '¡Arriba los brazos! ¡Respirá! ♪ Na-na-naaa ♪ ¡Ahora sí, como nuev{o}!'},
  pimi_tool: {who: 'pimi', title: 'La herramienta nueva de Pimi', what: 'Resolvé 2 problemas técnicos (Wifi Caído o Bugsito) para probar la herramienta de Pimi', goal: 2, n: () => beatCount('wifi') + beatCount('bug'),
    ask: 'Estoy probando una herramienta nueva. ¿Me ayudás? Resolvé dos problemas técnicos y me contás cómo anduvo. Tranqui.', done: 'Anduvo bien. La dejo. Gracias por probarla. Tomá, la mitad de mi alfajor. La mitad grande.'},
  reni_reel: {who: 'reni', title: 'Un reel del equipo', what: 'Charlá con 3 personas del equipo para el reel de Reni', goal: 3, n: () => mem().postChats || 0,
    ask: 'Estoy armando un reel del equipo. ¿Me das una mano? Charlá con tres personas, que yo voy grabando de lejos. Ni se dan cuenta.', done: '¡Quedó divino! Salís re natural. Ya está subido. ¿Comiste, igual? Tomá un mate.'},
  tato_factura: {who: 'tato', title: 'La factura perdida', what: 'Tato perdió una factura. Preguntale a Sofi, en Asteroide, y llevásela', goal: 1, n: () => S.flags.facturaOk ? 1 : 0, step: true,
    ask: 'Che, ¿no viste una factura? Era de... algo. La tenía acá. ¿Le preguntás a Sofi? Ella siempre sabe dónde están mis cosas.', done: '¡Mi factura! ¿Dónde estaba? ...¿En mi escritorio? Ah, mirá. Gracias. Te debo una. Me lo anoto. ...Acá.'},
  giuli_ref: {who: 'giuli', title: 'Referencias para Giuli', what: 'Resolvé 4 problemas en La Base para la libreta de referencias de Giuli', goal: 4, n: () => wildTotal(),
    ask: 'Estoy armando una libreta de referencias con los problemas de La Base. Resolvé cuatro y contame cómo eran. Para dibujarlos.', done: 'Ya los dibujé. Quedaron re lindos. El Bugsito es mi favorito. Gracias por las referencias.'},
  alejo_toma: {who: 'alejo', title: 'Una toma para Alejo', what: 'Resolvé 2 problemas de caos (Scopecreep o Feedbackón): Alejo quiere filmar cómo se destraban', goal: 2, n: () => beatCount('scope') + beatCount('feedback'),
    ask: 'Quiero filmar cómo se destraba el caos. Resolvé dos de caos, Scopecreep o Feedbackón, y yo filmo. Toma única, como en el cine.', done: 'Toma única. Bueno, tres tomas. Pero quedó como si fuera una. Gracias.'},
  fede_v2: {who: 'fede', title: 'La versión dos', what: 'Entrená una vez más con Fede, en Brasil', goal: 1, n: () => mem().spars || 0,
    ask: 'Ya sos Project Leader, ¿y? Siempre hay una versión dos. Entrenemos una vez más, salga como salga.', done: 'Eso. La versión dos siempre es mejor que la uno. Y la tres, mejor que la dos. Tomá, cebate uno.'},
  lia_record: {who: 'lia', title: 'El récord de Lía', what: 'Resolvé 5 problemas en La Base: Lía los quiere en su tablero', goal: 5, n: () => wildTotal(),
    ask: '¡Te tengo un objetivo medible! ¡Cinco problemas resueltos y los subo al tablero! ¡Quiero ver la curva!', done: '¡Cinco! ¡La curva sube! ¡Lo mido, lo celebro y lo mejoro! ¡Ja!'},
  sofi_wifi: {who: 'sofi', title: 'Antes que soporte técnico', what: 'Resolvé 1 Wifi Caído antes de que conteste soporte técnico', goal: 1, n: () => beatCount('wifi'),
    ask: 'Se cayó el wifi de nuevo. Ya mandé el ticket a soporte técnico. ¿Lo resolvés antes de que contesten? No es difícil, eh.', done: '¡Gracias! Soporte técnico todavía no leyó el ticket. Ya les voy a avisar que no hace falta. Con cariño.'},
  marga_fotos: {who: 'marga', title: 'Las fotos de Lisboa', what: 'Volvé a hablar con Marga para ver las fotos de su viaje (está de 9 a 12)', goal: 1, n: () => S.flags.margaFotos ? 1 : 0, here: true,
    ask: 'Corazón, ¿me das un ratito? Te quiero mostrar las fotos de Lisboa. Dejo el trapeador y volvé a hablarme, que las busco en el celu.', done: 'Mirá, este es el tranvía. Y esta soy yo comiendo un pastelito. Y acá, otra vez el tranvía, pero desde el otro lado. ¡Gracias por mirar, corazón!'},
};
const SIDE_MAX = 3; // por día
function sideProg(){ const s = S.side; if (!s || !SIDE[s.id]) return 0; return Math.max(0, SIDE[s.id].n() - (s.base || 0)); }
function sideReady(){ const s = S.side; return !!(s && SIDE[s.id] && sideProg() >= SIDE[s.id].goal); }
function sideDesc(){ const s = S.side, d = s && SIDE[s.id]; if (!d) return 'Charlá con el equipo: cada tanto alguien te pide algo.';
  return `${d.what}. Te lo pidió ${PEOPLE[d.who]}.` + (d.goal > 1 ? ` (${Math.min(d.goal, sideProg())}/${d.goal})` : '') + (sideReady() ? ` ¡Listo! Volvé con ${PEOPLE[d.who]}.` : ''); }
function sideStep(){ const s = S.side, d = s && SIDE[s.id]; if (!d) return null;
  if (sideReady()) return `¡Cumpliste "${d.title}"! Volvé con ${PEOPLE[d.who]}${placeOf(d.who) ? ', en ' + placeOf(d.who) : ''}.`;
  return `Misión secundaria: ${d.what}${d.goal > 1 ? ` (${Math.min(d.goal, sideProg())}/${d.goal})` : ''}.`; }
async function postGame(n){
  if (!S.flags.done) return false;
  const m = mem(), today = gameDay();
  if (m.sideDay !== today){ m.sideDay = today; m.sideToday = 0; }
  if (S.side && n.id !== SIDE[S.side.id]?.who) m.postChats = (m.postChats || 0) + 1;
  // pasos especiales de algunas misiones
  if (S.side && S.side.id === 'tato_factura' && n.id === 'sofi' && !S.flags.facturaOk){
    await say('¿La factura de Tato? Está en su escritorio, abajo del parlante. Como siempre. Tomá, llevásela.', 'sofi');
    await say('Y decile que la próxima la deje en la carpeta. Que tiene una carpeta. Con su nombre.', 'sofi');
    S.flags.facturaOk = true; toast('Tenés la factura de Tato'); return true;
  }
  if (S.side && S.side.id === 'marga_fotos' && n.id === 'marga' && !S.flags.margaFotos) S.flags.margaFotos = true;
  // cobrar la misión
  if (S.side && SIDE[S.side.id].who === n.id && sideReady()){
    const d = SIDE[S.side.id]; S.side = null; S.flags.facturaOk = false; S.flags.margaFotos = false;
    await say(d.done, POST_MOOD[n.id] || n.id);
    m.sides = (m.sides || 0) + 1;
    await gainXP(Math.max(15, Math.floor(need(S.lvl) * .2)), sayN);
    if (qState('secundaria') === 'open') qDone('secundaria');
    return true;
  }
  // los repasitos, más seguido (repasitoReady lo afloja después del final)
  if (repasitoReady(n, m)){ await repasito(n); return true; }
  // una misión nueva (una por vez, hasta tres por día)
  if (!S.side && m.sideToday < SIDE_MAX && Math.random() < .45){
    const opts = Object.keys(SIDE).filter(id => SIDE[id].who === n.id);
    if (opts.length){
      const id = opts[pick('side:' + n.id, opts.map((_, i) => i))], d = SIDE[id];
      await say(d.ask, POST_MOOD[n.id] || n.id);
      const c = await choose(['¡Dale!', 'Ahora no'], {cancel: 1});
      if (c === 0){ S.side = {id, base: d.n()}; S.flags.facturaOk = false; S.flags.margaFotos = false; m.sideToday++;
        if (d.here && n.id === 'marga'){ S.side.base = 0; }
        qReopen('secundaria'); return true; }
      await say('Tranqui, cuando quieras.', n.id); return true;
    }
  }
  // charlas con más personalidad
  if (Math.random() < .5 && await postTalk(n)) return true;
  return false;
}
