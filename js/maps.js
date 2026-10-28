/* Mapas (planta baja, planta alta, patio y barbacoa) y cambio de mapa */
"use strict";
/* ================= MAPA ================= */
const OFFICE_GRID = (() => {
  const g = Array.from({length:26}, () => Array(34).fill('#'));
  const put = (x, y, s) => { for (let i = 0; i < s.length; i++) g[y][x+i] = s[i]; };
  const rows = (x, y, arr) => arr.forEach((r, i) => put(x, y+i, r));
  // Sala de Reuniones: la biblioteca de las fotos (estantes de madera oscura, ventanales en arco, chimenea, mesa larga).
  // N: la tele con soporte de pie, en la punta izquierda de la mesa, mirando a la mesa
  rows(1, 1, ['BBBBWWMMWWBBBBBBBBBBB','.....k.k.k.k.k.k.....','...NTTTTTTTTTTTT.....','...NTTTTTTTTTTTT.....','.....k.k.k.k.k.k.....','.....................']);
  // La Sala del Directorio (donde antes estaba el estudio): cerrada hasta el nivel 25. Mesa larga de madera oscura,
  // la tele con la presentación, bibliotecas y, en la cabecera, el Cliente del Año esperando la campaña del año.
  rows(23,1, ['WWBBYYBBWW','n........n','..kkkkkk..','.NTTTTTT..','.NTTTTTT..','..kkkkkk.P']);
  put(9,7,'..'); put(16,7,'..'); put(23,7,'..');
  // El Baño (donde antes estaba la cocina, más chico): i inodoro, d bidé, z la mesada con la bacha, b el tacho de acero.
  // Debajo, La Base sigue hasta la pared del baño con más pilas de pendientes.
  rows(1, 8, ['id.zz.m','.......','.......','......b']);
  rows(1, 13, ['.......','.""""..','.""""..','P.....n']);
  rows(9, 8, ['................','.DD..DD..DD..DD.','""""""....""""""','""""""....""""""','.DD..DD..DD..DD.','................','""""""....""""""','""""""....""""""','................']);
  rows(26,8, ['LLLLLLL','.......','..DDD..','.......','.......','.......','.......','..DDD..','P.....P']);
  put(8,10,'.'); put(8,13,'.'); put(25,12,'.'); put(25,13,'.');
  rows(1, 18, ['P........','..CC.CC..','.........','..CC.CC..','.........','PP.....PP','.........']);
  // El Hall: la escalera de mármol con baranda de hierro sube a la planta alta
  rows(11,18, ['yyy........','yyym.......','yyU........','...........','...........','...........','P....E....P']);
  rows(23,18, ['..........','..........','..........','P........P','.TT.TT.TT.','..........','P........P']);
  put(9,17,'.'); put(15,17,'..'); put(24,17,'.'); put(10,22,'.'); put(22,20,'.');
  // equipamiento extra
  // Q: dispensadores de agua (como en la foto): uno en la cocina y otro en el hall; el tercero está arriba, en el pasillo
  put(21,18,'Q');
  // La Base (como en la foto): el parlante de torre y la guitarra criolla en su soporte, contra la pared de los pizarrones
  put(12,8,'u'); put(15,8,'g');
  // tachos al costado de los escritorios (no en el pasillo) y en el rincón de Archivos X
  put(12,9,'b'); put(21,12,'b'); put(32,9,'b');
  put(32,13,'x'); put(32,14,'x');
  put(23,16,'f'); // La Base: el ventilador de pie verde agua
  // n: sansevierias en maceta marrón (como en las fotos), en los rincones donde no molestan
  put(21,2,'n'); put(1,6,'n'); put(32,2,'n'); put(22,16,'n'); put(21,21,'n');
  return g;
})();

/* Exterior: el patio de la agencia (como en las fotos) y la vereda.
   B casona · O puerta · W muros · V quincho · , mosaico · v pedregullo · s escalinata
   T ping pong · F fuente · h setos · p aves del paraíso · n bananeros · t árbol · c clivias · a aloes
   b banco · k bicis · o macetas · m buzón · w muro del frente con el portal de entrada · r calle */
const OUTSIDE_GRID = [
  'WWWWWWWBBBBBBBBBBBBBBBBWWWWWWW',
  'WWWWWWWBBBBBBBBBBBBBBBBWWWWWWW',
  'WWWWWWWBBBBBBBBBBBBBBBBWWWWWWW',
  'WWWWWWWBBBBBBBBBBBBBBBBWWWWWWW',
  'WWWWWWWBBBBBBBBBBBBBBBBWWWWWWW',
  'kvFFFvtBBBBBBBBBBBBBBBBp,,,,,n',
  'vvFFFvvBBBBBBBOOBBBBBBBp,,,,,,',
  'vcvvvcv,oaaaassssbbo,,,,,,,,,,',
  'hh,,,,,,,,,,,,,,,,,,,,,,ppphhh',
  'hh,TTT,,,,,,,,,,,,,,,,,,,,hhhh',
  'hh,TTT,,,,,,,,,,,,,,,,,,,,hhhh',
  'hh,TTT,,,,,,,,,,,,,,,,,,,,,,,h',
  'hn,,,,,,,,,,,,,,,,,,,,,,,,,,,h',
  'hVVVVVV,,,,,,,,,,,,,,,,,,,,,,h',
  'hVVVVVV,,,,,,,,,,,,,,,,,,,,,,h',
  'hVVVKVV,,,,,,,,,,,,,,,bb,,,,,h',
  'h,,,,,,,,,,,,,,,,,,,,,,,,,,n,h',
  'h,,,,,,,,,,,,,,,,,,,,,,,,,,,,h',
  'wwwwwwwwwwwww,,,,wwwwwwwwwwwww',
  ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
  'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
  'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
].map(r => r.split(''));
const MAPS = {
  office: {id:'office', grid: OFFICE_GRID, walk: new Set(['.','R','"','E']), zones: [
    {n:'Sala de Reuniones', x:1,y:1,w:21,h:6, floor:'herring'},
    {n:'Sala del Directorio', x:23,y:1,w:10,h:6, floor:'herring'},
    {n:'Baño', x:1,y:8,w:7,h:4, floor:'bath'},
    {n:'La Base', x:1,y:13,w:7,h:4, floor:'brasil'},
    {n:'La Base', x:9,y:8,w:16,h:9, floor:'brasil'},
    {n:'Archivos X', x:26,y:8,w:7,h:9, floor:'tech'},
    {n:'Bienestar', x:1,y:18,w:9,h:7, floor:'calm'},
    {n:'El Hall', x:11,y:18,w:11,h:7, floor:'terrazzo'},
    {n:'Sala de Clientes', x:23,y:18,w:10,h:7, floor:'cli'},
  ]},
  outside: {id:'outside', grid: OUTSIDE_GRID, walk: new Set([',','O','v','s','K']), zones: [
    {n:'El Jardín', x:0,y:5,w:7,h:3, floor:'gravel'},
    {n:'El Patio', x:0,y:0,w:30,h:18, floor:'mosaic'},
    {n:'La Vereda', x:0,y:18,w:30,h:4, floor:'street'},
  ]},
};
/* Planta alta: se llega por la escalera del hall. Brasil (la oficina de Fede: dos afiches, ventana con persianas
   y cortinas, la bolsa de boxeo Z y la colchoneta R para entrenar), Guaná (la de Agus y Lía, con J: el tablero de
   métricas de Lía) y Asteroide (Administración: Sofi y Tato; e es la pared de madera con estantes empotrados y la
   ventana de rejas grises, l la lámpara de pie de arco, u el parlante de torre donde suena el reggae de Tato,
   p la impresora sobre el mueble gris, T la mesa redonda). n son las sansevierias.
   I es pared lisa a toda altura (con moldura en Brasil); al fondo del pasillo, una sansevieria. */
const UPSTAIRS_GRID = [
  '####################################',
  '#IYYYYHHWWI#WWYYYYIIWWJJ#IeeeeeeIII#',
  '#.........n#......cc...n#n......lup#',
  '#.ZRRRRRR..#...TTTTT....#..kTTT....#',
  '#..RRRRRR..#...TTTTT....#...TTTk...#',
  '#..RRRRRR..#............#....k.....#',
  '#P........P#P..........P#P........P#',
  '#####..##########..##########..#####',
  '#yyyy..................Q...........#',
  '#yyyv.............................n#',
  '#yyyy.....P.........n.........P....#',
  '####################################',
].map(r => r.split(''));
MAPS.upstairs = {id:'upstairs', grid: UPSTAIRS_GRID, walk: new Set(['.','R']), zones: [
  {n:'Brasil', x:1,y:1,w:10,h:6, floor:'brasil'},
  {n:'Guaná', x:12,y:1,w:12,h:6, floor:'pine'},
  {n:'Asteroide', x:25,y:1,w:10,h:6, floor:'pine'},
  {n:'Planta Alta', x:1,y:8,w:34,h:3, floor:'terrazzo'},
]};
/* La Barbacoa: el quincho de vidrio del patio, donde está la cocina (se entra por la puerta K del frente vidriado).
   Como en el plano que se acordó y en las fotos: la pared del fondo sin ventanas; F la heladera de acero al lado del
   parrillero, r el parrillero metido en la pared (boca de ladrillo, viga de hierro negro), j la vinoteca de madera en
   rombos con los microondas abajo, Q el dispensador (entre el parrillero y el sillón), w la barra (tapa de madera sobre
   muro blanco, con tres lámparas negras colgando) y h las butacas de hierro y madera, S el sillón verde en L contra la
   pared de arriba (tres cuerpos y la punta), t la mesa ratona, T la mesa de vidrio rectangular con 8 sillas de madera
   (k: tres de cada lado largo y una en cada punta, que ocupa las dos baldosas del costado) y E la salida al patio, del lado izquierdo. Todo el piso queda conectado. */
const BARBACOA_GRID = [
  '################',
  '#IIrrrjjIIIIIII#',
  '#.F.....Q.SSSS.#',
  '#.........tt.S.#',
  '#.wwwww........#',
  '#.h.h.h........#',
  '#.......kkkk...#',
  '#......kTTTTk..#',
  '#......kTTTTk..#',
  '#.......kkkk...#',
  '#P.E..........P#',
  '################',
].map(r => r.split(''));
MAPS.barbacoa = {id:'barbacoa', grid: BARBACOA_GRID, walk: new Set(['.','E']), zones: [{n:'La Barbacoa', x:1,y:1,w:14,h:10, floor:'marble'}]};
let CURMAP, MAP, MW, MH, ZONES, WALK;
function useMap(id){ CURMAP = MAPS[id]; MAP = CURMAP.grid; MH = MAP.length; MW = MAP[0].length; ZONES = CURMAP.zones; WALK = CURMAP.walk; }
useMap('office');
