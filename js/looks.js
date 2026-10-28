/* Aspecto de cada personaje */
"use strict";
const LOOKS = {
  player:{sleeves:'short', backpack:'#fe7a02', hair:'#6b4a2e', style:'short', shirt:'#92c100', sleeve:'#7aa300', pants:'#004612'},
  fede:{hair:'#5a3a22', style:'fringe', shirt:'#d8d2a4', sleeve:'#6e5a48', pants:'#3a3a3a', mustache:'#3e2716', beard:'#4d3420'},
  sahi:{sleeves:'short', skin:'#e3a982', hair:'#1d1a1a', style:'curly', shirt:'#5e1f6b', pants:'#2b2b33', mustache:'#1d1a1a', beard:'#2a2424', necklace:'#d4b85a'},
  lu:{blush:true, hair:'#4a3326', style:'long', shirt:'#f3f0ea', jacket:'#d99a9a', pants:'#3d5a8a'},
  pimi:{sleeves:'short', skin:'#eab48b', hair:'#18140f', style:'short', shirt:'#7d7a5c', pants:'#2b3a2e'},
  reni:{blush:true, hair:'#a97a4b', style:'long', shirt:'#f0a8bd', stripe:'#9b1b2e', pants:'#3d5a8a', phone:true},
  agus:{blush:true, hair:'#c9a56b', style:'long', shirt:'#6e3a6a', pants:'#3d5a8a', collar:'#d6e3a0'},
  lia:{blush:true, hair:'#5a3622', style:'long', shirt:'#efe6d2', jacket:'#c8862e', pants:'#4a6fa0'},
  // Sofi, Tato, Pimi y Reni ya tienen ficha (assets/sprites): estos colores quedan de respaldo
  sofi:{blush:true, hair:'#3a2a20', style:'long', shirt:'#f6e7c8', jacket:'#7fae9a', pants:'#33405e', necklace:'#d4b85a'},
  tato:{sleeves:'short', skin:'#e6b08a', hair:'#4a3626', style:'short', beard:'#4a3626', shirt:'#4f7d52', pants:'#6b5f50'},
  // Alejo y Giuli (los specialists) todavía no tienen ficha: aspecto provisorio hasta que lleguen las fotos
  alejo:{sleeves:'short', skin:'#e8b48e', hair:'#2a1f18', style:'curly', shirt:'#2b2b30', pants:'#4a5a6e', beard:'#2a1f18', glasses:'#1e1e24'},
  giuli:{blush:true, hair:'#1f1814', style:'long', shirt:'#e0a83a', jacket:'#2a2a30', pants:'#1e1e24', necklace:'#c9c4b8'},
  // Marga todavía no tiene ficha: aspecto provisorio (60 años, pelo canoso, uniforme celeste) hasta que llegue la foto
  marga:{blush:true, skin:'#e9b896', hair:'#c9c2ba', style:'bob', shirt:'#a9cfe0', pants:'#3d4a5a', necklace:'#d4b85a'},
  anual:{hair:'#d9d9d9', style:'short', shirt:'#fbfaf4', jacket:'#1f2430', pants:'#1f2430', tie:'#d4b85a', glasses:'#2a2a2e', skin:'#e8b796'},
  explote:{hair:'#fe7a02', style:'spiky', shirt:'#fbfaf4', jacket:'#c2410c', pants:'#1e1e1e', shades:true, tie:'#92c100'},
  logo:{hair:'#8a8a8a', style:'bald', shirt:'#fbfaf4', jacket:'#23345a', pants:'#23345a', mustache:'#8a8a8a', tie:'#fe7a02'},
  fantasma:{hair:'#141414', style:'long', shirt:'#d9d9d9', jacket:'#4a4a52', pants:'#4a4a52', phone:true, shades:true},
};
