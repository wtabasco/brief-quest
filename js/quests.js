/* Tareas que pide el equipo y su progreso */
"use strict";
/* ================= TAREAS: lo que el equipo te pide; cada una te enseña algo ================= */
const beatCount = k => (S.log[k] && S.log[k].beaten) || 0;
const QUESTS = {
  // el objetivo del juego: siempre primero en Tareas, con el próximo paso
  objetivo:   {giver: 'La agencia', title: 'Tu objetivo: La Gran Presentación', abs: true, goal: 5, count: () => objetivoPasos(),
               desc: () => objetivoDesc()},
  clientes:   {giver: 'La agencia', title: 'Los tres clientes', abs: true, goal: 3, count: () => S.bosses,
               desc: () => S.bosses >= 3 ? 'Los tres clientes quedaron conformes.' : `Destrabá ${({fantasma: 'a la Clienta Fantasma', logo: 'a Don Logo', explote: 'a la Clienta Explosiva'})[BOSS_ORDER.find(k => !S.beaten[k]) || 'explote']} en la Sala de Clientes.`},
  // cosas para el equipo (part_team.js): experiencia charlando y ayudando
  repaso:     {giver: 'Fede', title: 'Cómo trabajamos', abs: true, goal: 1, count: () => mem().repaso === gameDay() ? 1 : 0,
               desc: () => mem().repaso === gameDay() ? 'Hoy ya charlaste con Fede. Mañana, otra.' : 'Una vez por día, Fede te plantea tres situaciones de todos los días. Hablale en Brasil: suma experiencia.'},
  ideas:      {giver: 'Montserrat', title: 'Las ideas de la casa', abs: true, goal: 5, count: () => Math.min(5, (mem().ideasOk || []).length),
               desc: () => 'Una vez por día, Montserrat te cuenta una idea en la terraza. Encontrá qué letra del AEIOU le falta: Actual, Estratégico, Impactante, Original o Útil.'},
  encargo:    {giver: 'El equipo', title: 'Una mano al equipo', abs: true, goal: 1, count: () => S.errand ? 0 : 1, desc: () => errandDesc()},
  fede_prueba:{giver: 'Fede', title: 'Volver a entrenar', minLvl: 6, goal: 2, count: () => mem().spars || 0, desc: () => 'Entrená con Fede dos veces más, salga como salga. Lo que cuenta es volver.'},
  consejo:    {giver: 'Agus y Lía', title: 'Poner en práctica el consejo', minLvl: 5, goal: 3, count: () => mem().adviceWins || 0, desc: () => `Resolvé 3 desafíos con un consejo de ${S.flags.path === 'lia' ? 'Lía' : 'Agus'} activo.`},
  consejo2:   {giver: 'Agus y Lía', title: 'Probar el otro camino', goal: 3, count: () => mem().otherAdviceWins || 0, desc: () => `Resolvé 3 desafíos con un consejo de ${S.flags.path === 'lia' ? 'Agus' : 'Lía'} activo.`},
  agus_pdp:   {giver: 'Agus', title: 'Plan de desarrollo', get goal(){ return 3 + ((S && S.pdp && S.pdp.stage) || 0); }, count: () => mem().pdpWins || 0,
               desc: () => S.pdp ? `Etapa ${S.pdp.stage + 1} de 3. Resolvé ${3 + S.pdp.stage} desafíos usando al menos una habilidad de ${TYPES[S.pdp.t].n}. Después, revisión con Agus en Guaná, su oficina de la planta alta.` : 'Hablá con Agus.'},
  lia_kpi:    {giver: 'Lía', title: 'Mejora continua', minLvl: 8, goal: 3, count: () => mem().kpiWins || 0,
               desc: () => S.liaKpi ? `Objetivo ${S.liaKpi.stage + 1} de 3: ${KPI[S.liaKpi.k].n(S.liaKpi)}, tres veces. Lía lo está midiendo (obvio). Después, pasá por Guaná, su oficina de la planta alta: el tablero está al lado de la ventana.` : 'Hablá con Lía.'},
  sahi:       {giver: 'Sahi', title: 'Calentar en La Base', minLvl: 10, goal: 8, count: () => mem().wildWins || 0, desc: () => 'Resolvé 8 problemas en La Base. Sahi quiere ver que le agarraste la mano.'},
  pimi_atajo: {giver: 'Pimi', title: 'Reiniciar el router', minLvl: 7, goal: 2, count: () => beatCount('wifi'), desc: () => 'Resolvé 2 Wifi Caído en La Base.'},
  pimi_bug:   {giver: 'Pimi', title: 'Cazar bugs', goal: 2, count: () => beatCount('bug'), desc: () => 'Resolvé 2 Bugsito. Aparecen en La Base después del primer cliente.'},
  pimi_file:  {giver: 'Pimi', title: 'Ordenar los archivos', minLvl: 12, goal: 3, count: () => beatCount('archivo'), desc: () => 'Resolvé 3 Archivo_final_v7.'},
  pimi_surf:  {giver: 'Pimi', title: 'La ola grande', abs: true, goal: 3, count: () => S.bosses, desc: () => 'Destrabá a los tres clientes.'},
  tarjeta:    {giver: 'Agus y Lía', title: 'La tarjeta de la terraza', abs: true, goal: 3, count: () => S.bosses, desc: () => 'Destrabá a los tres clientes y volvé a hablar con Agus y Lía, en Guaná, su oficina de la planta alta.'},
  fede_mate:  {giver: 'Fede', title: 'Un mate para Fede', abs: true, goal: 1, count: () => Math.min(1, S.items.mate || 0), desc: () => (S.items.mate || 0) > 0 ? 'Ya tenés un mate. Llevaselo a Fede, a Brasil, su oficina de la planta alta.' : `Reni anda con el termo por toda la agencia: pedile un mate y llevaselo a Fede. Ahora está en ${reniWhere()}.`},
  pimi_comida:{giver: 'Pimi', title: 'Comida para Pimi', abs: true, goal: 1, count: () => ((S.items.alfajor || 0) + (S.items.medialunas || 0)) > 0 ? 1 : 0, desc: () => 'Llevale a Pimi un alfajor o unas medialunas. Revisá la heladera de la cocina, en la barbacoa del patio.'},
  lu_agua:    {giver: 'Lu', title: 'Agua para Lu', abs: true, goal: 1, count: () => Math.min(1, S.items.agua || 0), desc: () => (S.items.agua || 0) > 0 ? 'Ya tenés el vaso. Llevaselo a Lu, en Bienestar.' : 'Llenale un vaso de agua a Lu en un dispensador.'},
  sofi_fruta: {giver: 'Sofi', title: 'Fruta para Tato', abs: true, goal: 1, count: () => S.flags.tatoFruta ? 1 : 0,
               desc: () => S.flags.tatoFruta ? 'Tato ya comió. Contale a Sofi, en Asteroide.' : 'Llevale la fruta a Tato, en Asteroide (Administración, en la planta alta). Hablale fuerte, que tiene el reggae puesto.'},
  sofi_orden: {giver: 'Sofi', title: 'Todo en orden', minLvl: 6, goal: 5, count: () => mem().wildWins || 0, desc: () => 'Resolvé 5 problemas en La Base: los pendientes también se ordenan. Después, pasá por Asteroide a ver a Sofi.'},
  agus_equipo:{giver: 'Agus', title: 'Conocer al equipo', minLvl: 9, goal: 5, count: () => mem().dinOk || 0, desc: () => 'Acertá 5 dinámicas de equipo con Agus, en Guaná. Para acertar hay que charlar con todos.'},
  giuli_practica:{giver: 'Giuli', title: 'Diseño en práctica', minLvl: 9, goal: 6, count: () => mem().wildWins || 0, desc: () => 'Poné en práctica las capacitaciones de Giuli: resolvé 6 problemas en La Base y volvé a verla.'},
  alejo_practica:{giver: 'Alejo', title: 'Redes en práctica', minLvl: 11, goal: 6, count: () => mem().winsT || 0, desc: () => 'Poné en práctica las capacitaciones de Alejo: resolvé 6 desafíos (de cualquier tipo) y volvé a verlo.'},
  giuli_clases:{giver: 'Giuli', title: 'Capacitaciones de diseño', abs: true, goal: 3, count: () => S.flags.lesGiuli || 0,
               desc: () => (S.flags.lesGiuli || 0) >= 3 ? 'Terminaste las capacitaciones de Giuli.' : `Hasta dos capacitaciones por día con Giuli, en La Base. Próxima: ${DUO_LESSONS.giuli[S.flags.lesGiuli || 0].title}.`},
  alejo_clases:{giver: 'Alejo', title: 'Capacitaciones de redes', abs: true, goal: 3, count: () => S.flags.lesAlejo || 0,
               desc: () => (S.flags.lesAlejo || 0) >= 3 ? 'Terminaste las capacitaciones de Alejo.' : `Hasta dos capacitaciones por día con Alejo, en La Base. Próxima: ${DUO_LESSONS.alejo[S.flags.lesAlejo || 0].title}.`},
  anual:      {giver: 'La agencia', title: 'La campaña del año', abs: true, minLvl: PROJECT_LVL, goal: 1, count: () => S.flags.anual ? 1 : 0,
               desc: () => S.lvl >= PROJECT_LVL ? 'La Sala del Directorio ya está abierta (en la planta baja, al lado de la Sala de Reuniones). Presentale la campaña del año al Cliente del Año.' : 'Cuando llegues al nivel 25 se abre la Sala del Directorio (en la planta baja, al lado de la Sala de Reuniones). Ahí te espera el Cliente del Año.'},
  fede_carpetas:{giver: 'Fede', title: 'Capacitación: orden de carpetas', abs: true, goal: 5, count: () => S.flags.tr_carpetas || 0,
               desc: () => (S.flags.tr_carpetas || 0) >= 5 ? 'Terminaste las capacitaciones de orden de carpetas.' : `Hasta dos capacitaciones por día con Fede, en Brasil. Próxima: ${TRAININGS.carpetas.sessions[S.flags.tr_carpetas || 0].title}.`},
  fede_carpetas_practica:{giver: 'Fede', title: 'Carpetas en práctica', minLvl: 5, goal: 4, count: () => mem().winsT || 0, desc: () => 'Poné en práctica el orden de carpetas: resolvé 4 desafíos y volvé a ver a Fede, en Brasil.'},
  alejo_cronograma:{giver: 'Alejo', title: 'Capacitación: cronograma', abs: true, goal: 6, count: () => S.flags.tr_cronograma || 0,
               desc: () => (S.flags.tr_cronograma || 0) >= 6 ? 'Terminaste las capacitaciones del proceso de cronograma.' : `Hasta dos capacitaciones por día con Alejo, en La Base. Próxima: ${TRAININGS.cronograma.sessions[S.flags.tr_cronograma || 0].title}.`},
  alejo_crono_practica:{giver: 'Alejo', title: 'Cronograma en práctica', minLvl: 7, goal: 5, count: () => mem().winsT || 0, desc: () => 'Poné en práctica el proceso de cronograma: resolvé 5 desafíos y volvé a ver a Alejo, en La Base.'},
  sahi_campanas:{giver: 'Sahi', title: 'Capacitación: campañas', abs: true, goal: 5, count: () => S.flags.tr_campanas || 0,
               desc: () => (S.flags.tr_campanas || 0) >= 5 ? 'Terminaste las capacitaciones del proceso de campañas.' : `Hasta dos capacitaciones por día con Sahi. Próxima: ${TRAININGS.campanas.sessions[S.flags.tr_campanas || 0].title}.`},
  sahi_campanas_practica:{giver: 'Sahi', title: 'Campañas en práctica', minLvl: 17, goal: 8, count: () => mem().winsT || 0, desc: () => 'Poné en práctica el proceso de campañas: resolvé 8 desafíos y volvé a ver a Sahi.'},
  bienvenida: {giver: 'Sahi', title: 'Recorrida de bienvenida', abs: true, goal: 3, count: () => welcomeStep(),
               desc: () => welcomeStep() >= 3 ? 'Ya conociste a todos los de la recorrida.' : `Próxima parada: ${WELCOME_NEXT[welcomeStep()]}. Después: ${['Fede, y Agus y Lía', 'Agus y Lía', 'Pimi o Alejo y Giuli'][welcomeStep()]}.`},
  fijo:       {giver: 'Agus y Lía', title: 'Una noticia de RRHH', abs: true, goal: 1, count: () => S.flags.fijo ? 1 : 0, desc: () => 'Llegaste al nivel 15. Agus y Lía te quieren dar una noticia en Guaná, su oficina de la planta alta.'},
  senior:     {giver: 'Fede', title: 'Charla con Fede', abs: true, goal: 1, count: () => S.flags.senior ? 1 : 0, desc: () => 'Llegaste al nivel 25. Fede te espera en Brasil, su oficina de la planta alta.'},
  terraza:    {giver: 'Montserrat', title: 'La Gran Presentación', abs: true, goal: 1, count: () => S.flags.done ? 1 : 0, desc: () => 'Subí a la planta alta por la escalera del hall y, al fondo del pasillo, a la terraza. Montserrat te espera.'},
};
const QUEST_ORDER = Object.keys(QUESTS);
const qState = id => (S.quests || {})[id];
function qProg(id){ const q = QUESTS[id], base = q.abs ? 0 : ((S.qbase || {})[id] || 0); return [clamp(q.count() - base, 0, q.goal), q.goal]; }
const qCountOk = id => { const [a, b] = qProg(id); return a >= b; };
/* lista para cobrar: hecha y con el nivel mínimo (las habilidades de los personajes piden oficio) */
const qReady = id => qCountOk(id) && S.lvl >= (QUESTS[id].minLvl || 0);
const qWaitLvl = id => qState(id) === 'open' && qCountOk(id) && S.lvl < (QUESTS[id].minLvl || 0);
function qOpen(id, quiet){
  S.quests = S.quests || {}; S.qbase = S.qbase || {};
  if (S.quests[id]) return false;
  S.quests[id] = 'open'; S.qbase[id] = QUESTS[id].count();
  if (!quiet){ toast('Nueva tarea: ' + QUESTS[id].title, 2200); SFX.sel(); }
  return true;
}
/* tareas que se repiten (favores): se borran y se vuelven a abrir */
function qReopen(id){ S.quests = S.quests || {}; S.qbase = S.qbase || {}; delete S.quests[id]; delete S.qbase[id]; return qOpen(id); }
function qDone(id){ S.quests = S.quests || {}; S.quests[id] = 'done'; toast('Tarea cumplida: ' + QUESTS[id].title, 2200); }
async function questScreen(){
  S.quests = S.quests || {};
  const ids = () => QUEST_ORDER.filter(id => S.quests[id] === 'open').concat(QUEST_ORDER.filter(id => S.quests[id] === 'done'));
  const open = QUEST_ORDER.filter(id => S.quests[id] === 'open').length;
  await panelList({title: 'TAREAS', extra: `${open} EN CURSO`,
    rows: () => ids().map(id => { const [a, b] = qProg(id), done = S.quests[id] === 'done'; return {label: (done ? '✓ ' : '· ') + QUESTS[id].title, right: done ? 'LISTA' : `${a}/${b}`, dim: done}; }),
    detail: i => { const id = ids()[i], q = QUESTS[id], [a, b] = qProg(id), done = S.quests[id] === 'done';
      return `<h4>${q.title}</h4><div class="k">Te la pidió: ${q.giver}</div><div>${q.desc()}</div>` +
        (done ? '<div class="k">Cumplida.</div>' : `<div class="xp" style="height:2cqw"><i style="width:${(a / b) * 100}%"></i></div><div class="k">${a} de ${b}${qReady(id) ? ' · ¡Volvé a hablar con quien te la pidió!' : ''}</div>` +
          (q.minLvl ? `<div class="k">${S.lvl >= q.minLvl ? `Nivel ${q.minLvl} ✓` : `Pide nivel ${q.minLvl} (estás en el ${S.lvl}).`}</div>` : '')); },
    hint: 'B: volver'});
}
