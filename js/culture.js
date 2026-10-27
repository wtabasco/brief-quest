/* La agencia: propósito, roles, cómo trabajamos, equipos y rituales */
"use strict";
/* ================= LA AGENCIA: PROPÓSITO, ROLES Y CÓMO TRABAJAMOS =================
   Lo que la agencia cuenta en sus presentaciones de bienvenida (Bienvenida, Why We Do What We Do, Scope of Roles
   y The Way We Work) sobrevuela todo el juego:
   - el menú de pausa tiene "La agencia": propósito y valores, directores, cómo trabajamos (Content, Culture,
     Clients y el AEIOU), el alcance de cada rol, los equipos, los rituales, el plan de desarrollo y la casa;
   - cada personaje dice frases de cómo trabajamos, con su estilo (se suman a sus charlas);
   - la primera vez que destrabás cada problema de La Base, aparece el principio que lo resuelve;
   - después de cada cliente, el principio de trabajo con clientes que esa reunión dejó;
   - cada dos viernes es Picante: el equipo se junta y Agus y Lía reconocen lo que hiciste.
   En el juego la agencia no tiene nombre ("la agencia"); los nombres de los equipos sí son los reales. */

const AEIOU = [['Actual', 'a la vanguardia y pertinente en su contexto'], ['Estratégico', 'parte de una estrategia definida antes'],
  ['Impactante', 'llama la atención y es visualmente atractivo'], ['Original', 'no se copia de la competencia ni se repite de la propia marca'],
  ['Útil', 'aporta valor y es necesario para el cliente']];
const ROLE_SCOPE = {
  sm: {n: 'Social Manager', lema: 'Comunicar y gestionar.', prop: 'Gestiona creativamente a las marcas para que se comuniquen mejor con su gente, a partir de la estrategia.',
    areas: [['Creatividad', 'contenidos, guidelines, coberturas, activaciones'], ['Gestión', 'mensajes, comentarios y perfiles al día'], ['Análisis', 'investigación, reportes y tendencias']]},
  gd: {n: 'Graphic Designer', lema: 'Materializar.', prop: 'Resuelve visualmente las creatividades de las marcas para lograr los resultados.',
    areas: [['Resolución', 'contenidos y materiales gráficos'], ['Creatividad', 'recursos gráficos, investigación y tendencias'], ['Organización', 'editables, finales y versiones']]},
  pm: {n: 'Paid Media', lema: 'Planificar y optimizar.', prop: 'Planifica, ejecuta y optimiza campañas de medios alineadas a los objetivos del cliente.',
    areas: [['Activaciones', 'planillas, planes de medios y presupuestos'], ['Reportes', 'análisis y presentación de resultados'], ['Chequeos y optimizaciones', 'monitoreo y propuestas de mejora']]},
  pl: {n: 'Project Leader', lema: 'Liderar y encantar.', prop: 'Dirige, motiva y representa al equipo: es el puente entre lo que necesita el cliente y nuestra forma de hacer las cosas.',
    areas: [['Equipo', 'organización, liderazgo y procesos'], ['Clientes', 'comunicación, objetivos y venta activa'], ['Presupuestos', 'propuestas comerciales estratégicas']]},
};
const H_ = (rows, size = 2.5) => `<div style="font-size:${size}cqw;line-height:1.18;display:flex;flex-direction:column;gap:.45cqw">${rows.join('')}</div>`;
const K_ = t => `<div class="k">${t}</div>`, P_ = t => `<div>${t}</div>`, B_ = (b, t) => `<div><b>${b}</b> ${t}</div>`;
const roleHTML = k => { const r = ROLE_SCOPE[k];
  return H_([K_('Propósito'), P_(`${r.prop} <b>${r.lema}</b>`), K_('Sus tres áreas'), ...r.areas.map(([a, d]) => B_(a + ':', d)),
    P_('Y en todos los roles: <b>sistematizo mis aciertos para compartirlos</b>. Así no crece solo mi cliente: crece toda la agencia.')], 2.8); };
/* ---- el objetivo del juego, claro desde el principio ---- */
const objetivoPasos = () => (welcomeStep() >= 3 ? 1 : 0) + Math.min(3, S.bosses || 0) + (S.flags.done ? 1 : 0);
function objetivoDesc(){
  if (S.flags.done) return '¡Lo lograste! Si querés seguir: Project Leader y el Cliente del Año.';
  const next = welcomeStep() < 3 ? 'conocer la agencia' : (S.bosses || 0) < 3 ? `destrabar a los clientes (${S.bosses || 0} de 3)` : 'la Gran Presentación, en la terraza';
  return `Próximo paso: ${next}.`;
}
const objetivoHTML = () => H_([
  P_('Llegás a la agencia como <b>pasante</b>. Tu objetivo es aprender cómo trabajamos, hacerte tu lugar en el equipo y llegar a <b>la Gran Presentación</b>.'),
  B_('1. Conocé la agencia:', 'Sahi, Sofi, Fede, y Agus y Lía te reciben y te cuentan quiénes somos.'),
  B_('2. Aprendé:', 'capacitaciones con el equipo y los problemas de La Base. Así subís de nivel y sumás habilidades.'),
  B_('3. Destrabá a los tres clientes:', 'la Clienta Fantasma, Don Logo y la Clienta Explosiva, en la Sala de Clientes.'),
  B_('4. La Gran Presentación:', 'en la terraza, con Montserrat.'),
  P_('Y después, si querés seguir: crecés hasta <b>Project Leader</b> y le presentás la campaña del año al Cliente del Año.'),
  `<div class="k">Tu próximo paso siempre está en Tareas (START o la tecla M).</div>`], 2.6);
const AGENCIA = [
  {t: 'Tu objetivo', title: 'TU OBJETIVO', d: () => objetivoDesc(), full: () => objetivoHTML()},
  {t: 'Propósito y valores', d: 'Lo que nos une, y nuestros cinco valores.', full: () => valoresHTML()},
  {t: 'Directores', d: 'Agus (AZ), Lía (LÍ) y Fede (FD). La agencia nació en 2010.', full: () => H_([
    B_('Agus (AZ), directora general.', 'Autodidacta y curiosa por la tecnología; estudia Psicología. Foco en el desarrollo, el liderazgo, el bienestar y las dinámicas del equipo.'),
    B_('Lía (LÍ), directora comercial.', 'Licenciada en Comunicación, con pasión por la publicidad y un empuje comercial contagioso. Foco en entender los negocios y en estrategias que hagan crecer a los clientes.'),
    B_('Fede (FD), director de contenido.', 'Diseñador de formación, con mirada estética meticulosa. Foco en el contenido, la calidad creativa y los procesos.'),
    P_('Agus y Lía fundaron la agencia en 2010. Fede llegó en 2018 como diseñador, pasó a Head of Content y después a director. El nombre viene de un condimento japonés: <b>chiquita pero picante</b>.')], 2.45)},
  {t: 'Contenido', title: 'CÓMO TRABAJAMOS: CONTENIDO', d: 'Si no es AEIOU, no lo proponemos.', full: () => H_([
    P_('Todo lo que hacemos es importante, pero importa más <b>cómo</b> lo hacemos. El contenido tiene que ser:'),
    ...AEIOU.map(([a, d]) => B_(a + ':', d)), K_('Además'),
    P_('Si no me enorgullece lo suficiente para mostrarlo, sé que puedo hacerlo mejor. Los cronogramas se entregan hasta el 27 de cada mes. La presentación es un medio, no el resultado final.')], 2.65)},
  {t: 'Cultura', title: 'CÓMO TRABAJAMOS: CULTURA', d: 'Nuestra cultura está en las personas y se construye todos los días.', full: () => H_([
    P_('Tenemos dos trabajos: <b>hacer lo que hay que hacer y pensar cómo hacerlo mejor</b>.'),
    P_('Se habla <b>con</b>, no se habla <b>de</b>. Hablamos de frente: las puertas siempre están abiertas.'),
    P_('No empiezo una tarea sin entenderla ni saber cuándo se entrega. Si no llego, <b>escalo a tiempo</b>.'),
    P_('El error es una oportunidad: busquemos cometer errores nuevos y no repetir los viejos.'),
    P_('Si todo es urgente, nada es urgente. Los mensajes se responden: no dejo a nadie colgado.'),
    P_('Siempre hay 15 minutos más para corregir algo que no nos convence. Y soy responsable del clima de la oficina: todo se contagia.')], 2.65)},
  {t: 'Clientes', title: 'CÓMO TRABAJAMOS: CLIENTES', d: 'Existimos gracias a los clientes.', full: () => H_([
    P_('El cliente no siempre tiene la razón, y nosotros tampoco: cada situación es única.'),
    P_('Preparamos cada reunión con un objetivo. Los argumentos se dan a tiempo; si no, son una excusa.'),
    P_('Proponemos cosas increíbles y después bajamos si el cliente lo pide: siempre partimos de lo máximo.'),
    P_('Plazos reales desde el principio: ser flexibles no es decir que sí a todo. Si prometemos algo, lo cumplimos.'),
    P_('Toda conversación queda en una minuta clara, y la bitácora se mantiene al día.'),
    P_('<b>R = R</b>: relaciones es igual a resultados. Y si no sabemos algo, no inventamos.')], 2.7)},
  {t: 'Social Manager', title: 'ROL: SOCIAL MANAGER', d: 'Comunicar y gestionar.', full: () => roleHTML('sm')},
  {t: 'Graphic Designer', title: 'ROL: GRAPHIC DESIGNER', d: 'Materializar.', full: () => roleHTML('gd')},
  {t: 'Paid Media', title: 'ROL: PAID MEDIA', d: 'Planificar y optimizar.', full: () => roleHTML('pm')},
  {t: 'Project Leader', title: 'ROL: PROJECT LEADER', d: 'Liderar y encantar.', full: () => roleHTML('pl')},
  {t: 'Equipos', d: 'Tabasco, Putaparió, Peppers y Chili: todos picantes.', full: () => H_([
    P_('Ningún gran desafío se logra sin la integración de dos o más roles. Por eso trabajamos en equipos:'),
    B_('Tabasco:', 'el equipo de soporte estratégico. Cuando en un proceso dice "validación en Tabasco", es con ellos.'),
    B_('Putaparió, Peppers y Chili:', 'los equipos ejecutivos. Cada uno con su Project Leader, Social Managers, Graphic Designers y Paid Media.'),
    P_('Y en los procesos vas a ver siglas: PL (Project Leader), SM (Social Manager), CM (Creative Manager), CC (Content Creator), GD (Graphic Designer), Sp (Specialist), St (Strategist).'),
    P_('Los creativos vienen a contar historias que conectan; los diseñadores, a diseñar cosas lindas; los paid media, a entender los negocios y sus números; los team leaders, a formar equipos que ganan partidos.')], 2.4)},
  {t: 'Rituales', d: 'Picante cada dos viernes, cumpleaños y aniversarios.', full: () => H_([
    B_('Picante:', 'cada dos viernes nos juntamos todos a compartir lo mejor y lo peor de la semana, novedades y reconocimientos. El corazón de nuestra cultura.'),
    B_('Cumpleaños:', 'los celebramos en el último Picante del mes, con torta. Si querés, traé algo rico.'),
    B_('Aniversario y Awards:', 'el 21 de octubre festejamos el aniversario de la agencia y premiamos en categorías votadas por el equipo.'),
    B_('Tu aniversario:', 'el día que cumplís un año (o más) en el equipo, celebramos tu contribución y tu crecimiento.')], 2.75)},
  {t: 'Plan de desarrollo', d: 'Siete pasos para planificar tu crecimiento.', full: () => H_([
    P_('Definís a dónde querés ir, mirás dónde estás hoy y armás un plan para llegar. Lo armás vos (o con tu Project Leader) y lo ponés en común con tu líder y AZ. A los seis meses lo revisan juntos.'),
    ...['Identificá tus metas y motivaciones.', 'Reconocé tus fortalezas y oportunidades.', 'Definí objetivos SMART y pasos de acción.', 'Poné en común tu plan con tu líder y AZ.',
      'Activalo: capacitaciones, proyectos, job shadowing.', 'Registrá resultados y avances.', 'Revisá y evaluá tu plan.'].map((t, i) => B_(`${i + 1}.`, t))], 2.75)},
  {t: 'La casa', d: 'Las salas y quién está en cada una.', full: () => casaHTML(), title: 'LA CASA'},
];
async function agenciaScreen(){
  let start = 0;
  for (;;){
    const r = await panelList({title: 'LA AGENCIA', start, rows: () => AGENCIA.map(x => ({label: x.t, right: ''})),
      detail: i => { const x = AGENCIA[i]; return `<h4>${(x.title || x.t).replace(/^ROL: |^CÓMO TRABAJAMOS: /, m => m === 'ROL: ' ? 'Rol: ' : 'Cómo trabajamos: ').replace(/^[A-ZÁÉÍÓÚ ]+$/, () => x.t)}</h4><div>${typeof x.d === 'function' ? x.d() : x.d}</div><div class="k">A: leer completo.</div>`; },
      hint: 'A: leer · B: volver'});
    if (r < 0) return;
    start = r; const x = AGENCIA[r];
    closePanel(); await panelInfo(x.title || x.t.toUpperCase(), x.full()); closePanel();
  }
}

/* ---- cada personaje, con su estilo, dice cómo trabajamos ---- */
const CULTURE_LINES = {
  fede: ['R = R: relaciones es igual a resultados. Con el cliente y con el equipo. Si hay vínculo, el día a día fluye. Y si hay mate, más.',
    'Si no es AEIOU, no lo proponemos: actual, estratégico, impactante, original y útil. Anotalo.',
    'Si no te enorgullece lo suficiente para mostrarlo, todavía lo podés hacer mejor. Siempre hay quince minutos más.',
    'El contenido tiene que verse igual de bien en la presentación que publicado. La presentación es un medio, no el final.',
    'Las correcciones internas son para tu desarrollo. Las del cliente, para el cliente. No las mezcles.',
    'Podés pedir cualquier recurso que necesites para hacerlo mejor. Acá pensamos en grande.',
    'Dos contenidos iguales en un mismo cronograma no existen. Cada uno es una chance de decir algo.'],
  sahi: ['Los creativos venimos a contar historias que conectan. Como un buen relato de un gol: que lo sientas aunque no lo hayas visto.',
    'Acá no alcanza con meter un gol, crack. Trabajamos con estrategia para ganar partidos.',
    'Si se te ocurre algo, compartilo aunque no esté cerrado. Mejor anticipar que esperar a que lo proponga el cliente.',
    'Proponemos cosas increíbles y después, si el cliente pide, bajamos. Siempre se arranca de lo máximo. Como salir a ganar.'],
  pimi: ['Paid media: planificar y optimizar. No opino, analizo. Las campañas hablan con resultados.',
    'Soy el músculo tecnológico del equipo: automatizo lo operativo para tener más tiempo para lo estratégico.',
    'Bajar el CPA, subir el CTR, maximizar el ROAS. Todos los días. Todo se pone a prueba.',
    'Si implemento algo que sirve para hoy pero no para mañana, no sirve. Pan para hoy, hambre para mañana.'],
  sofi: ['Me tomo un segundo para trabajar con orden. Se pierde mucho más tiempo cuando algo no queda ordenado.',
    'Los mensajes se responden. No dejo a nadie colgado, ni aunque sea para decir "lo veo mañana".',
    'Soy responsable del clima de la oficina, aunque no sea mi rol. Bueno, un poco sí es mi rol. Todo se contagia.'],
  tato: ['Si todo es urgente, nada es urgente. Eso lo dice el manual. Yo lo digo más despacio.',
    'Presupuestos transparentes: que cualquiera los mire y los entienda. Hasta Lía. Sobre todo Lía.',
    'No confundo lo personal con lo laboral. Y no me abuso de la buena onda. Bueno, del reggae un poco.'],
  lu: ['¡Soy responsable del clima de la oficina! ¡Todo se contagia! ¡Por eso canto!',
    '¡Un día con pocas tareas no está mal! ¡Aprovechalo para investigar, ordenar o capacitarte! ¡O para cantar!'],
  marga: ['Acá se habla de frente, mi vida. Se habla con las personas, no de las personas. Eso no lo enseña ningún manual. Bueno, este sí.',
    'Hace muchos años que estoy en esta casa, y te digo una cosa: la buena onda no se da por sentada. Se cuida.'],
  montse: ['El camino no es recto, pero es importante ir en la dirección correcta. Eso aplica a las casonas y a las agencias.',
    'Un gran lugar para trabajar se hace con grandes personas. Y trabajando a lo grande.'],
};
const CULTURE_AGUS = ['Tenemos dos trabajos: hacer lo que hay que hacer y pensar cómo hacerlo mejor.',
  'Se habla con, no se habla de. Si algo no te cierra, llevalo a donde y con quién corresponde.',
  'Busquemos cometer errores nuevos y no repetir los viejos. Los nuevos son progreso.',
  'Si no llegás con un entregable, escalá a tiempo. Pedir ayuda también es trabajar bien.',
  'No empieces una tarea sin entenderla ni saber cuándo se entrega. Preguntá hasta entender: es tu responsabilidad.',
  'Si no estás de acuerdo con un proceso, ofrecé uno mejor. Que funcione para todos.',
  'Los resultados son compartidos. Ganamos todos y perdemos todos.'];
const CULTURE_LIA = ['¡Preparamos cada reunión con un objetivo y salimos habiéndolo cumplido! ¡Si no, es un café caro!',
  '¡Los argumentos se dan a tiempo! ¡Después son excusas! ¡Y las excusas no se pueden medir!',
  '¡Plazos reales desde el principio! ¡Ser flexibles no es decir que sí a todo!',
  '¡Buscamos la excelencia aunque el cliente no la pida! ¡Nosotros ponemos la vara!',
  '¡Si no sabemos algo, no inventamos! ¡Mejor callar que inventar!'];
const CULTURE_DUO = [{t: [['giuli', 'Cuido los editables para que cada contenido sea el punto de partida del siguiente. No arrastro errores.'], ['alejo', 'Lo dice el alcance del rol. Y lo cumple, que es lo difícil.']]},
  {t: [['alejo', 'Dejo lineamientos claros: referencias, recursos y textos simples de entender.'], ['giuli', 'Y yo los complemento. Si tengo una idea, la comparto.']]},
  {t: [['giuli', 'Diseñar es materializar: resolver visualmente la idea para que logre el resultado.'], ['alejo', 'Comunicar y gestionar, en mi caso. Juntos, un contenido completo.']]},
  {t: [['alejo', 'La IA nos ayuda a redactar, chequear y ordenar. Así no perdemos tiempo en lo innecesario.'], ['giuli', 'Y lo que ahorramos lo ponemos en pensar mejor.']]}];
(function addCultureLines(){
  const add = (arr, xs) => { if (Array.isArray(arr)) arr.push(...xs.map(t => typeof t === 'string' ? {d: 1, t} : t)); };
  add(FEDE.tips, CULTURE_LINES.fede); add(SAHI.lines, CULTURE_LINES.sahi); add(PIMI.lines, CULTURE_LINES.pimi);
  add(SOFI.lines, CULTURE_LINES.sofi); add(TATO.lines, CULTURE_LINES.tato); add(LU.tips, CULTURE_LINES.lu);
  add(MARGA.lines, CULTURE_LINES.marga); add(MONTSE.lines, CULTURE_LINES.montse);
  add(FOUNDERS.chat, CULTURE_AGUS); add(FOUNDERS.Lchat, CULTURE_LIA); add(DUO.lines, CULTURE_DUO);
})();

/* ---- la primera vez que destrabás cada problema, el principio que lo resuelve ---- */
const WAY_QUOTES = {
  scope: 'Seteamos plazos reales al principio. Ser flexibles no es decir que sí a todo.',
  reunion: 'Preparamos cada reunión con un objetivo previo, y lo cumplimos antes de terminarla.',
  archivo: 'Me tomo un segundo para trabajar con orden. Se pierde mucho más tiempo cuando algo no queda ordenado.',
  wifi: 'Adaptarse al cambio es una virtud imprescindible.',
  feedback: 'Los argumentos hay que darlos a tiempo. Después, son una excusa.',
  bug: 'Busquemos cometer errores nuevos y no repetir los viejos.',
  mail: 'Los mensajes se responden: no dejo a un compañero colgado.',
  deadline: 'Si todo es urgente, nada es urgente. Y si no llego con un entregable, escalo a tiempo.',
};
async function wayQuote(key, out){
  if (!WAY_QUOTES[key] || S.flags['wq_' + key]) return;
  S.flags['wq_' + key] = true;
  await out(`Cómo trabajamos: "${WAY_QUOTES[key]}"`, 2600);
}
/* ---- después de cada cliente, lo que esa reunión deja ---- */
const CLIENT_WAY = {
  fantasma: ['agus', 'Por eso todas las conversaciones quedan en una minuta clara, y las directivas, registradas. Así nadie te dice "eso lo dejé clarísimo".'],
  logo: ['fede', 'El cliente no siempre tiene la razón, y nosotros tampoco. Se escucha, se educa, y se elige cuándo vale la pena discutir.'],
  explote: ['lia', '¡Proponemos cosas increíbles y después bajamos si el cliente lo pide! ¡Siempre se parte de lo máximo! ¡Explotó, y lo medimos!'],
};
async function clientWay(key){
  const w = CLIENT_WAY[key]; if (!w) return;
  await say(`Más tarde, ${PEOPLE[w[0]]} te comenta:`);
  await say(w[1], w[0]);
}

/* ---- Picante: cada dos viernes ---- */
const picanteDay = (d = gameDay()) => d % 10 === 5;
function picanteTick(min){
  if (!picanteDay()) return;
  if (min === 16*60 + 30) toast('Hoy es Picante: a las 17 el equipo comparte lo mejor y lo peor de la semana. Pasá por Guaná.', 4200);
}
async function picanteTalk(n){
  if (!picanteDay() || gameMin() < 17*60 || (n.id !== 'agus' && n.id !== 'lia')) return false;
  const m = mem(); if (m.picante === gameDay()) return false;
  m.picante = gameDay();
  await say('¡Es Picante! Cada dos viernes nos juntamos a compartir lo mejor y lo peor de la semana, novedades y reconocimientos.', 'lia:feliz');
  await say(`Y hoy hay un reconocimiento para {name}: ${pick('picante:rec', ['por preguntar hasta entender', 'por escalar a tiempo cuando hizo falta', 'por cuidar el orden de las carpetas', 'por la actitud positiva', 'por compartir lo que aprendió'])}. Eso es vivir los valores.`, 'agus:feliz');
  await gainXP(Math.max(20, Math.floor(need(S.lvl) * .15)), sayN);
  return true;
}
