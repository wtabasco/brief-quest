/* Helpers de baldosas y zonas */
"use strict";
const zoneAt = (x, y) => ZONES.find(z => x >= z.x && x < z.x+z.w && y >= z.y && y < z.y+z.h) || null;
const tileAt = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? '#' : MAP[y][x];
const hash = (x, y) => { let h = x*374761393 + y*668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0); };

