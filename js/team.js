/* Cosas para el equipo: repaso de valores con Agus y encargos que suman experiencia */
"use strict";
/* ================= COSAS PARA EL EQUIPO: experiencia charlando y ayudando =================
   Para que no todo sea resolver problemas: también se sube de nivel haciendo cosas para la gente. Lo que se
   repasa sale de "The Way We Work" (Cultura y Clientes), los equipos y los rituales, lo que menos aparecía.
   - Charla de cómo trabajamos con Agus (una vez por día): tres situaciones de todos los días. Cada respuesta
     buena suma experiencia; si no sale, Agus explica y no pasa nada.
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
  await say(pick('repaso:in', ['Te cuento tres situaciones de todos los días y me decís qué harías. No es un examen: es cómo trabajamos.', 'Tres situaciones. Si no sale, lo charlamos. Para eso estamos.', 'Tres situaciones y un mate. Bueno, el mate es de Fede.']), 'agus:feliz');
  const qs = shuffle(REPASO()).slice(0, 3); let ok = 0;
  for (const q of qs){
    await say(q.p, 'agus');
    const c = await choose(q.opts, {cancel: null});
    if (q.opts[c] === q.ok){ ok++; await say(pick('repaso:ok', ['¡Exacto!', 'Eso. Muy bien.', 'Tal cual.', '¡Bien! Se nota que estás prestando atención.']), 'agus:feliz'); }
    else await say(`Casi. ${q.why}`, 'agus');
  }
  m.repasoOk = (m.repasoOk || 0) + ok; m.repasos = (m.repasos || 0) + 1;
  await say(ok === 3 ? '¡Tres de tres! ¿Y cómo te hace sentir eso? (Perdón, se me escapó.)' : ok ? 'Bien. Lo que no salió hoy, mañana sale.' : 'Hoy no salió, y está perfecto: para eso repasamos. Mañana de nuevo.', ok === 3 ? 'agus:risa' : 'agus');
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
  // 2) el repaso de valores con Agus, una vez por día
  if (n.id === 'agus' && S.flags.foundersMet && m.repaso !== gameDay() && m.repasoAsk !== gameDay()){
    m.repasoAsk = gameDay();
    await say('Antes de charlar: ¿te cuento tres situaciones de todos los días y vemos cómo las resolverías? Suma experiencia.', 'agus');
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
