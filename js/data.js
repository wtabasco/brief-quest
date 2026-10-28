/* Tipos, habilidades, problemas, clientes, objetos y guardado */
"use strict";
/* ================= DATOS DE JUEGO ================= */
const TYPES = {
  CRE:{n:'CREATIVO',c:'#d9772a'}, EST:{n:'ESTRATEGIA',c:'#7d4c7b'}, TEC:{n:'TÉCNICO',c:'#3f7a4a'}, CAL:{n:'CALMA',c:'#6f66c4'},
  IMP:{n:'IMPULSO',c:'#9a7a2a'}, VIS:{n:'VISIÓN',c:'#6f9a2a'},
  CAOS:{n:'CAOS',c:'#c4532e'}, BURO:{n:'BUROCRACIA',c:'#9a7a2a'}, BUG:{n:'BUG',c:'#4f5d55'}, PRES:{n:'PRESIÓN',c:'#8a4a7a'}, CLI:{n:'CLIENTE',c:'#2f5a3a'}, NOR:{n:'MENTOR',c:'#5a6a5e'},
};
const CHART = {
  CRE:{BURO:2, CAOS:.5}, EST:{CAOS:2, BUG:.5}, TEC:{BUG:2, BURO:.5}, CAL:{PRES:2, CAOS:.5},
  VIS:{CAOS:2, BURO:2, BUG:2, PRES:2, CLI:2, NOR:2},
};
const chip = t => `<span class="chip" style="background:${TYPES[t].c}">${TYPES[t].n}</span>`;

const SK = {
  idea:{n:'Idea rápida',t:'CRE',p:40,a:100,pp:25,d:'Una idea al vuelo. Simple pero efectiva.'},
  priorizar:{n:'Priorizar',t:'EST',p:40,a:100,pp:25,d:'Ordenás qué va primero y atacás.'},
  brainstorm:{n:'Brainstorm',t:'CRE',p:65,a:95,pp:15,d:'Tormenta de ideas sin filtro.'},
  brief:{n:'Brief claro',t:'EST',p:55,a:100,pp:15,fx:'foeAtk-1',d:'Daña y baja el ataque del rival.'},
  limites:{n:'Poner límites',t:'CAL',p:70,a:100,pp:12,d:'Un "no" a tiempo vale oro.'},
  concepto:{n:'Gran concepto',t:'CRE',p:95,a:90,pp:6,d:'La idea que lo cierra todo.'},
  prueba:{n:'Prueba y error',t:'EST',p:35,a:100,pp:15,fx:'prueba',d:'Enseñada por Fede. Cada vez que la usás en el mismo desafío pega más fuerte.'},
  gambeta:{n:'Gambeta',t:'CRE',p:70,a:95,pp:10,fx:'crit',d:'Enseñada por Sahi. Esquivás el problema con estilo. Mucha chance de golpe crítico.'},
  atajo:{n:'Atajo de teclado',t:'TEC',p:45,a:100,pp:20,pri:1,d:'Mejora de Pimi. Siempre ataca primero.'},
  automatizar:{n:'Automatizar',t:'TEC',p:85,a:95,pp:8,d:'Mejora de Pimi. Que lo haga la máquina.'},
  respirar:{n:'Respirar hondo',t:'CAL',p:0,a:100,pp:8,fx:'heal40 selfDef+1',d:'Consejo de Agus. Recuperás energía y subís tu defensa.'},
  dinamica:{n:'Dinámica de equipo',t:'CAL',p:0,a:100,pp:6,fx:'selfAtk+1 selfDef+1',d:'Enseñada por Agus. Te acordás de que tenés equipo: suben tu ataque y tu defensa.'},
  afull:{n:'A full',t:'IMP',p:0,a:100,pp:10,fx:'selfAtk+2',d:'Consejo de Lía. Sube mucho tu ataque.'},
  medir:{n:'Medir y mejorar',t:'EST',p:0,a:100,pp:10,fx:'selfAtk+1 selfSpd+1',d:'Enseñada por Lía. Mirás los números en pleno desafío y ajustás: suben tu ataque y tu velocidad.'},
  sinergia:{n:'Plan con empuje',t:'EST',p:50,a:100,pp:6,fx:'selfAtk+1 selfDef+1',d:'De Agus y Lía: el proceso de una y la energía de la otra. Daña y sube tu ataque y tu defensa.'},
  orden:{n:'Todo en orden',t:'CAL',p:0,a:100,pp:8,fx:'cleanse heal30',d:'Enseñada por Sofi. Ordenás todo como ella cuida la casa: se te van los efectos negativos y recuperás energía.'},
  mentoria:{n:'Mentoría',t:'EST',p:0,a:100,pp:5,fx:'selfAtk+1 selfDef+1 selfSpd+1',d:'De Fede, cuando pasás a Project Leader: enseñar es la mejor forma de aprender. Suben tu ataque, tu defensa y tu velocidad.'},
  pitch:{n:'Pitch de ascensor',t:'EST',p:80,a:95,pp:8,fx:'foeAtk-1',d:'Llega con el oficio (nivel 18). La idea, clarísima en treinta segundos: daña y baja el ataque del rival.'},
  historia:{n:'Contar una historia',t:'CRE',p:100,a:90,pp:6,d:'Llega con el oficio (nivel 22). Una idea con historia no se olvida. Muy potente.'},
  cabeza:{n:'Cabeza fría',t:'CAL',p:0,a:100,pp:6,fx:'heal50 selfDef+1',d:'Llega con el oficio (nivel 26). Recuperás bastante energía y subís tu defensa.'},
  diseno:{n:'Ojo de diseño',t:'CRE',p:70,a:100,pp:10,fx:'selfSpd+1',d:'Enseñada por Giuli, cuando ponés en práctica sus capacitaciones. Archivos bien nombrados, editables en orden y listos para imprenta: daña y sube tu velocidad.'},
  cronograma:{n:'Plan de contenidos',t:'EST',p:70,a:100,pp:10,fx:'foeSpd-1',d:'Enseñada por Alejo, cuando ponés en práctica el proceso de cronograma. El problema pierde el ritmo: daña y baja la velocidad del rival.'},
  redes:{n:'Redes con criterio',t:'CRE',p:75,a:100,pp:10,fx:'selfSpd+1',d:'Enseñada por Alejo, cuando ponés en práctica sus capacitaciones de redes. Daña y sube tu velocidad.'},
  dupla:{n:'Dupla creativa',t:'CRE',p:90,a:95,pp:5,fx:'selfAtk+1',d:'De Giuli y Alejo: diseño y redes, juntos. Pega fuerte y sube tu ataque.'},
  carpetas:{n:'Todo en su carpeta',t:'TEC',p:55,a:100,pp:15,fx:'selfDef+1',d:'Enseñada por Fede cuando ponés en práctica el orden de carpetas. Cuando todo está en su lugar, nada te toma por sorpresa: daña y sube tu defensa.'},
  fases:{n:'Campaña en fases',t:'EST',p:85,a:100,pp:8,fx:'selfAtk+1',d:'Enseñada por Sahi cuando ponés en práctica el proceso de campañas. Brief, conceptos, presupuesto, medios, diseño, presentación y aprobación: daña y sube tu ataque.'},
  campana:{n:'Campaña del año',t:'VIS',p:130,a:95,pp:3,d:'Lección del Cliente del Año. Todo lo que aprendiste, en una sola idea. La más fuerte de todas.'},
  vision:{n:'Visión',t:'VIS',p:110,a:100,pp:4,d:'Regalo de Montserrat. Ver lo que nadie ve. Muy efectiva contra todo.'},
  alcance:{n:'Definir alcance',t:'EST',p:50,a:100,pp:15,fx:'foeAtk-1',d:'Lección de Scopecreep. Daña y baja el ataque del rival.'},
  defender:{n:'Defender la idea',t:'CRE',p:55,a:100,pp:15,fx:'selfDef+1',d:'Lección de Feedbackón. Daña y sube tu defensa.'},
  mail:{n:'Esto era un mail',t:'CRE',p:65,a:100,pp:12,d:'Lección de Reunionauro. Corta la burocracia de raíz.'},
  nombrar:{n:'Nombrar bien',t:'TEC',p:55,a:100,pp:15,fx:'selfSpd+1',d:'Lección de Archivo_final_v7. Daña y sube tu velocidad.'},
  reiniciar:{n:'Reiniciar',t:'TEC',p:0,a:100,pp:6,fx:'heal35',d:'Lección de Bugsito. Apagar y prender. Recuperás energía.'},
  datos:{n:'Datos del celu',t:'TEC',p:50,a:100,pp:15,pri:1,d:'Lección de Wifi Caído. Ataca primero.'},
  responder:{n:'Responder en el día',t:'CAL',p:60,a:100,pp:12,d:'Lección de Mailfantasma. La bandeja vacía es poder.'},
  mastiempo:{n:'Pedir más tiempo',t:'CAL',p:40,a:100,pp:12,fx:'foeSpd-1',d:'Lección de Deadlinito. Daña y baja la velocidad del rival.'},
  explota:{n:'Idea que explota',t:'CRE',p:90,a:95,pp:8,d:'Lección de la Clienta Explosiva.'},
  argumentar:{n:'Argumentar',t:'EST',p:85,a:95,pp:8,d:'Lección de Don Logo. Con datos, cualquier discusión se ordena.'},
  seguimiento:{n:'Seguimiento',t:'CAL',p:85,a:95,pp:8,d:'Lección de la Clienta Fantasma. Nadie se te escapa.'},
};
/* Lo que se aprende solo con el oficio (al subir de nivel), repartido a lo largo de todo el juego */
const LEARN_AT = {5:'brainstorm', 8:'limites', 11:'brief', 14:'concepto', 18:'pitch', 22:'historia', 26:'cabeza'};
/* Las lecciones de los problemas de La Base: hay que resolverlos 3 veces y tener el nivel mínimo */
const LESSON_LVL = {scope:5, reunion:6, archivo:7, wifi:8, feedback:9, bug:10, mail:12, deadline:13};
/* Cómo se consigue cada habilidad (se ve en el menú de Habilidades, para saber qué viene) */
const SKILL_HOW = {
  brainstorm: 'Llegá al nivel 5.', brief: 'Llegá al nivel 11.', limites: 'Llegá al nivel 8.', concepto: 'Llegá al nivel 14.', pitch: 'Llegá al nivel 18.', historia: 'Llegá al nivel 22.', cabeza: 'Llegá al nivel 26.',
  prueba: 'Desafío de Fede: volvé a entrenar con él dos veces más. Nivel 6.', mentoria: 'Fede, cuando pases a Project Leader (nivel 25).',
  gambeta: 'Desafío de Sahi: después del primer cliente, resolvé 8 problemas en La Base. Nivel 10.',
  atajo: 'Desafío de Pimi: resolvé 2 Wifi Caído. Nivel 7.', automatizar: 'Desafío de Pimi: resolvé 3 Archivo_final_v7. Nivel 12.',
  respirar: 'Desafío de Agus: poné en práctica su consejo en 3 desafíos. Nivel 5.', afull: 'Desafío de Lía: poné en práctica su consejo en 3 desafíos. Nivel 5.',
  dinamica: 'Desafío de Agus: acertá 5 dinámicas de equipo. Nivel 9.', medir: 'Desafío de Lía: cumplí su primer objetivo de mejora continua. Nivel 8.',
  sinergia: 'Agus y Lía: probá los dos consejos y sacá una campaña redonda en su dinámica. Nivel 16.',
  orden: 'Desafío de Sofi: después de llevarle la fruta a Tato, resolvé 5 problemas en La Base. Nivel 6.',
  diseno: 'Giuli: terminá sus capacitaciones y ponelas en práctica resolviendo 6 problemas en La Base. Nivel 9.',
  cronograma: 'Alejo: hacé las seis capacitaciones del proceso de cronograma (desde el nivel 5) y ponelas en práctica en 5 desafíos. Nivel 7.',
  redes: 'Alejo: terminá sus capacitaciones de redes y ponelas en práctica en 6 desafíos. Nivel 11.',
  dupla: 'Giuli y Alejo: completá la práctica con los dos. Nivel 15.', vision: 'Montserrat, en la terraza, al final.',
  alcance: 'Resolvé 3 Scopecreep. Nivel 5.', mail: 'Resolvé 3 Reunionauro. Nivel 6.', nombrar: 'Resolvé 3 Archivo_final_v7. Nivel 7.', datos: 'Resolvé 3 Wifi Caído. Nivel 8.',
  defender: 'Resolvé 3 Feedbackón. Nivel 9.', reiniciar: 'Resolvé 3 Bugsito. Nivel 10.', responder: 'Resolvé 3 Mailfantasma. Nivel 12.', mastiempo: 'Resolvé 3 Deadlinito. Nivel 13.',
  carpetas: 'Fede: hacé las cinco capacitaciones de orden de carpetas (desde el principio) y ponelas en práctica en 4 desafíos. Nivel 5.',
  fases: 'Sahi: hacé las cinco capacitaciones del proceso de campañas (desde el nivel 15) y ponelas en práctica en 8 desafíos. Nivel 17.', campana: 'Presentale la campaña del año al Cliente del Año, en la Sala del Directorio. Nivel 25.', explota: 'Destrabá a la Clienta Explosiva.', argumentar: 'Destrabá a Don Logo.', seguimiento: 'Destrabá a la Clienta Fantasma.'};

const EN = {
  scope:{n:'Scopecreep',t:'CAOS',spr:'scope',k:[1,1,.9,.9],xp:42,lesson:'alcance',d:'Empieza chiquito y en cada turno pide un poquito más.',
    mv:[{n:'Ya que estamos...',p:0,fx:'selfAtk+1',w:1},{n:'Agregado chiquito',p:40,w:2}]},
  reunion:{n:'Reunionauro',t:'BURO',spr:'reunion',k:[1.15,.9,1,.7],xp:44,lesson:'mail',d:'Vive en los calendarios. Su presencia duerme a cualquiera.',
    mv:[{n:'Reunión de 2 horas',p:0,a:65,fx:'sleep',w:1},{n:'Lo vemos en la próxima',p:40,w:2}]},
  archivo:{n:'Archivo_final_v7',t:'BURO',spr:'archivo',k:[.9,1,1.1,.9],xp:40,lesson:'nombrar',d:'Nadie sabe cuál es la versión buena. Ni él.',
    mv:[{n:'final_FINAL_ahorasí',p:20,fx:'multi',w:2},{n:'Formato equivocado',p:0,fx:'foeDef-1',w:1}]},
  wifi:{n:'Wifi Caído',t:'BUG',spr:'wifi',k:[.9,1,.9,1.2],xp:42,lesson:'datos',d:'Aparece justo cuando empieza la videollamada importante.',
    mv:[{n:'Se cortó',p:35,fx:'flinch30',w:2},{n:'Reconectando...',p:0,fx:'heal25',w:1}]},
  feedback:{n:'Feedbackón',t:'CAOS',spr:'feedback',k:[1,1.1,.9,1],xp:50,lesson:'defender',d:'Llega a las 18:55 con "unos cambiecitos".',
    mv:[{n:'Cambio de último momento',p:25,fx:'reset',w:1},{n:'¿Y si probamos en rojo?',p:45,w:2}]},
  bug:{n:'Bugsito',t:'BUG',spr:'bug',k:[.9,1.2,.9,1.1],xp:50,lesson:'reiniciar',d:'En tu compu no aparece. En la del cliente, siempre.',
    mv:[{n:'Funciona en mi compu',p:35,fx:'foeSpd-1',w:2},{n:'Pantallazo azul',p:75,a:65,w:1}]},
  mail:{n:'Mailfantasma',t:'PRES',spr:'mail',k:[1,1,1,1.1],xp:52,lesson:'responder',d:'Asunto: RE: RE: RE: RE: Urgente (sin texto).',
    mv:[{n:'RE: RE: RE: Urgente',p:45,w:2},{n:'Copia a todos',p:0,fx:'foeDef-1',w:1}]},
  deadline:{n:'Deadlinito',t:'PRES',spr:'deadline',k:[1,1.1,1,1.2],xp:56,lesson:'mastiempo',d:'Cuanto más dura el desafío, más fuerte pega.',
    mv:[{n:'Tic tac',p:20,fx:'tictac',w:2},{n:'Para ayer',p:55,w:1}]},
};
const BOSS = {
  explote:{n:'Clienta Explosiva',t:'CAOS',lvl:22,look:'explote',k:[2.55,1.2,1,1.2],xp:140,lesson:'explota',d:'Pura energía. Quiere algo que explote. No sabe qué. Pero que explote.',
    mv:[{n:'Quiero algo que explote',p:55,w:3},{n:'Más disruptivo',p:0,fx:'selfAtk+1 selfSpd+1',w:1},{n:'Que se viralice',p:75,a:75,w:2},{n:'Cambio de último momento',p:25,fx:'reset',w:1}]},
  logo:{n:'Don Logo',t:'BURO',lvl:17,look:'logo',k:[2.3,1.1,1.15,.9],xp:130,lesson:'argumentar',d:'Se queja del color, la letra, el café y la silla, pero con cariño. Y el logo, para él, siempre es chico.',
    mv:[{n:'Logo más grande',p:60,w:3},{n:'No me termina de cerrar',p:0,fx:'foeAtk-1',w:1},{n:'Mi sobrino sabe Photoshop',p:85,a:70,w:2},{n:'Reunión de 2 horas',p:0,a:60,fx:'sleep',w:1}]},
  fantasma:{n:'Clienta Fantasma',t:'PRES',lvl:10,look:'fantasma',k:[2.2,1.05,1,1],xp:120,lesson:'seguimiento',d:'Desaparece semanas, vuelve con un pedido misterioso y jura que el brief era clarísimo.',
    mv:[{n:'Visto sin responder',p:0,fx:'selfEva+1',w:1},{n:'Eso lo dejé clarísimo',p:90,a:80,w:2},{n:'Tic tac',p:20,fx:'tictac',w:2},{n:'Era obvio, ¿no?',p:50,w:2}]},
  final:{n:'La Gran Presentación',t:'CLI',lvl:20,spr:'final',k:[3,1.2,1.15,1],xp:200,d:'Todo lo que aprendiste, en una sola reunión.',
    mv:[{n:'Pitch imposible',p:80,w:3},{n:'Cambio de último momento',p:25,fx:'reset',w:1},{n:'Todo para ayer',p:100,a:70,w:2},{n:'Logo más grande',p:60,w:2}]},
  // el cliente más difícil: en la Sala del Directorio, desde el nivel 25. Hay que presentarle la campaña del año
  anual:{n:'El Cliente del Año',t:'CLI',lvl:27,look:'anual',k:[2.9,1.2,1.15,1.05],xp:400,lesson:'campana',d:'El cliente más grande de la agencia. Viene a escuchar la campaña del año. Ya vio todo, y quiere algo que nunca vio.',
    mv:[{n:'Quiero la campaña del año',p:95,w:3},{n:'Esto ya lo vi',p:0,fx:'foeAtk-1',w:1},{n:'Presupuesto recortado',p:0,fx:'foeDef-1',w:1},{n:'Junta de directorio',p:0,a:60,fx:'sleep',w:1},
        {n:'Cambio de estrategia',p:25,fx:'reset',w:1},{n:'Para el lunes',p:115,a:70,w:2},{n:'Pensemos en grande',p:0,fx:'selfAtk+1 selfDef+1',w:1}]},
  fede:{n:'Fede',t:'NOR',lvl:0,look:'fede',k:[1.5,1.0,1.05,1.05],xp:70,d:'Entrenamiento.',
    mv:[{n:'Acción directa',p:55,w:3},{n:'Intentalo de nuevo',p:0,fx:'selfAtk+1',w:1},{n:'Feedback honesto',p:0,fx:'foeDef-1',w:1},{n:'Volver a lo simple',p:0,fx:'reset',w:1}]},
};
// el orden de los clientes: la Clienta Fantasma, Don Logo y, la más difícil, la Clienta Explosiva
const BOSS_ORDER = ['fantasma','logo','explote'];
const BOSS_POS = {fantasma:[25,19], logo:[28,19], explote:[31,19]};
const IT = {
  cafe:{n:'Café',d:'Recupera 30 de energía.',heal:30},
  mate:{n:'Mate',d:'Recupera 60 de energía. Te lo convidó Reni, que anda con el termo por toda la agencia.',heal:60},
  fruta:{n:'Fruta',d:'Recupera 50 de energía. Sofi se ocupa de que en la agencia nunca falte.',heal:50},
  alfajor:{n:'Alfajor',d:'Recupera 100 de energía.',heal:100},
  medialunas:{n:'Medialunas',d:'Recupera toda la energía.',heal:9999},
  foto:{n:'Foto grupal',d:'Solo en combate: sube tu ataque y tu defensa. Te la sacó Reni con el celu.',battle:true},
  libreta:{n:'Libreta de Fede',d:'Solo en combate: sube mucho tu ataque. Fede anota ahí sus mejores ideas.',battle:true},
  pendrive:{n:'Pendrive de Pimi',d:'Solo en combate: recupera los usos de todas tus habilidades.',battle:true},
  playlist:{n:'Playlist de Lu',d:'Solo en combate: sube tu velocidad y tu defensa. Tiene mucho Morat.',battle:true},
  postit:{n:'Post-it de Agus',d:'Solo en combate: recupera 40 de energía y sube tu defensa. Dice "Vos podés".',heal:40,battle:true},
  agua:{n:'Vaso de agua',d:'Para Lu. Lo pidió con urgencia: está por cantar el estribillo.',key:true},
  frutaTato:{n:'Fruta para Tato',d:'Una manzana y una banana que Sofi le manda a Tato. Está tan metido en los números (y en su reggae) que se olvida de comer.',key:true},
};
const ITEM_ORDER = ['cafe','mate','fruta','alfajor','medialunas','foto','libreta','pendrive','playlist','postit','agua','frutaTato'];
/* Reni recorre toda la agencia con el celu y el termo: la barbacoa del patio, los dos pisos y el patio */
const RENI_SPOTS = [[11,8],[8,13,'outside'],[5,7,'barbacoa'],[12,9,'upstairs'],[19,21],[24,10,'outside'],[17,22],[6,22],[22,9,'upstairs'],[28,14],[20,16],[27,6,'upstairs']];
const RENI_GIFTS = ['cafe','mate','foto','alfajor','medialunas','mate','foto'];

/* ================= ESTADO ================= */
/* Partidas: cuatro espacios para guardar (briefquest.slot1 a slot4). La partida de antes (un solo espacio) pasa al 1. */
const SAVE_KEY = 'briefquest.v1', SLOTS = 4, slotKey = n => 'briefquest.slot' + n;
let SLOT = 1;
function migrateSave(){ try { const old = localStorage.getItem(SAVE_KEY); if (old && !localStorage.getItem('briefquest.migrated')){ if (!localStorage.getItem(slotKey(1))) localStorage.setItem(slotKey(1), old); localStorage.setItem('briefquest.migrated', '1'); } } catch(e){} }
function lastSlot(){ try { const n = +localStorage.getItem('briefquest.lastSlot'); return n >= 1 && n <= SLOTS ? n : 1; } catch(e){ return 1; } }
function eraseSlot(n){ try { localStorage.removeItem(slotKey(n)); } catch(e){} if (typeof cloudErase === 'function') cloudErase(n); }
/* resumen de un espacio para los menús: nombre, rol, nivel y clientes */
function slotLabel(n){
  const d = loadSave(n); if (!d) return null;
  const g = d.gender === 'f' ? 'a' : 'o', rol = roleAt(d.lvl).n.replace('{o}', g);
  return {d, txt: `${d.name} · ${rol} · Nv. ${d.lvl} · ${d.bosses || 0}/3 clientes`};
}
let S = null;
function newSave(name){
  return {name, lvl:3, xp:0, hp:0, bonus:{hp:0,atk:0,def:0,spd:0}, skills:['idea','priorizar'], equip:['idea','priorizar'], pp:{idea:25,priorizar:25},
    items:{cafe:2}, flags:{}, gender:'m', quests:{}, qbase:{}, bosses:0, beaten:{}, log:{}, pos:{x:15,y:13,dir:'up',map:'outside'}, clock:{day:1, min:9*60}, reni:0, reniGift:true, sahiStage:-1, pimiGiven:0, agusTip:0, liaTip:0, fedeTip:0, buff:null, cool:3};
}
function stats(){
  const L = S.lvl, b = S.bonus;
  return {max: 24 + L*6 + b.hp, atk: 9 + L*2 + b.atk, def: 9 + L*2 + b.def, spd: 9 + L*2 + b.spd};
}
const need = L => 12 + L*L*5;
/* El rol del jugador avanza con el nivel y aparece antes de su nombre: Pasante hasta el 14; en el 15 queda fijo y
   pasa a Social (Social Manager); en el 25, Project (Project Leader). Al lado del nombre va la versión corta (n);
   en los diálogos de los ascensos, el cargo completo (full). Los celebran Agus y Lía (RRHH) y Fede. */
const PROJECT_LVL = 25; // a Project Leader (y se abre la Sala del Directorio)
const ROLES = [{lvl: 1, n: 'Pasante', full: 'Pasante'}, {lvl: 15, n: 'Social', full: 'Social Manager'}, {lvl: PROJECT_LVL, n: 'Project', full: 'Project Leader'}];
const roleAt = lvl => ROLES.filter(r => lvl >= r.lvl).pop();
const roleName = (lvl = S.lvl) => fmt(roleAt(lvl).n);
const fullName = () => `${roleName()} ${S.name}`;
function save(){ if (!S) return; if (G.mode === 'world' && !G.move) S.pos = {x:G.x, y:G.y, dir:G.dir, map:CURMAP.id}; S.savedAt = Date.now(); try { localStorage.setItem(slotKey(SLOT), JSON.stringify(S)); localStorage.setItem('briefquest.lastSlot', String(SLOT)); localStorage.setItem('briefquest.lastSlotAt', String(S.savedAt)); } catch(e){} if (typeof cloudPush === 'function') cloudPush(SLOT); }
function loadSave(n = SLOT){ try { const s = localStorage.getItem(slotKey(n)); if (!s) return null; const d = JSON.parse(s); d.gender = d.gender || 'x'; d.quests = d.quests || {}; d.qbase = d.qbase || {}; d.flags = d.flags || {}; if (d.flags.montseMet && !d.flags.card && d.bosses >= 3) d.flags.card = true; return d; } catch(e){ return null; } }
function fullHeal(){ S.hp = stats().max; S.skills.forEach(id => S.pp[id] = SK[id].pp); }
function logSeen(id){ S.log[id] = S.log[id] || {seen:true, beaten:0, lesson:false}; }

