# Brief Quest

RPG de agencia con combates por turnos. El equipo son los personajes, los problemas de todos los días son los rivales y cada problema que vencés te puede enseñar una habilidad.

## Cómo correrlo

No necesita instalación ni compilación. Abrí `index.html` en el navegador.

Para probarlo como si estuviera publicado (recomendado mientras desarrollás):

```bash
npx serve .
# o
python3 -m http.server 8000
```

y entrá a `http://localhost:8000`.

## Controles

| Tecla | Botón | Acción |
| --- | --- | --- |
| Flechas / WASD | Cruceta | Moverte |
| Z / Enter | A | Hablar, aceptar |
| X / Esc | B | Volver. Mantener para correr |
| M | START | Menú |
| N | SELECT | Sonido |
| Q / E | L / R | Bitácora / Habilidades |

En pantallas táctiles, el botón **CONTROLES** abre la cruceta y los botones.

## Estructura

```
index.html          Carcasa de la consola y orden de carga de los scripts
css/style.css       Estilos de la página, la consola y la interfaz del juego
assets/portraits/   Retratos pixelados del equipo (los de Fede, con 5 expresiones)
assets/sprites/     Guía y bases para dibujar los personajes
js/
  core.js       Utilidades base, canvas y rutas de retratos
  sound.js      Efectos de sonido (WebAudio)
  music.js      Música de fondo con temas originales
  maps.js       Mapas (oficina, vereda y terraza) y cambio de mapa
  zones.js      Helpers de baldosas y zonas
  color.js      Colores y elipses
  pixel.js      Kit de pixel art: paleta, rampas de color, bloques y contornos
  painter.js    Pintor de sprites con volumen: personas, cuerpo de combate y problemas
  art.js        Sprites diseñados en PNG: acá se registran
  looks.js      Aspecto de cada personaje
  office.js     La oficina: pisos, paredes, objetos de pared y muebles
  outside.js    Vereda: pasto, caminos, árboles, canteros y fachada
  terrace.js    Terraza de Montserrat con cielo según la hora
  data.js       Tipos, habilidades, problemas, clientes, objetos y guardado
  input.js      Teclado, cruceta táctil y panel de controles
  ui.js         Diálogos, listas, menús, paneles y textos según género
  quests.js     Tareas que pide el equipo y su progreso
  dialogs.js    Memoria, contexto y conversaciones de cada personaje
  battle.js     Combate, dificultad, IA de los rivales y su dibujo
  menus.js      Menú de pausa, habilidades, mochila y bitácora
  world.js      Movimiento, NPCs con vida, puertas, escalera, cámara y dibujo
  main.js       Construcción de mapas, título, intro y bucle principal
```

Los scripts comparten el ámbito global y se cargan en el orden de `index.html`. Si agregás uno nuevo, sumalo ahí respetando las dependencias.

## Publicarlo para toda la agencia (GitHub Pages)

1. Creá un repositorio y subí esta carpeta.
2. En el repo: **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. En un par de minutos queda en `https://<usuario>.github.io/<repo>/`.

El progreso de cada jugador se guarda en su propio navegador.
