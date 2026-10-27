# Sprites diseñados

El estilo de referencia es la ficha de Fede: pixel art con contorno oscuro y sombreado plano.

## Medidas (mandan sobre la guía vieja `guia-sprites.png`)

- **Mundo:** hoja de 3 columnas (quieto, paso 1, paso 2) x 4 filas (abajo, izquierda, derecha, arriba). Cuadros de 36 x 64 px, personaje de unos 60 px de alto, pies a 2 px del borde inferior. Se dibuja a tamaño real.
- **Combate:** una imagen por pose, con el personaje de unos 150 px de alto. Se dibuja a un píxel de imagen por píxel de pantalla, con el mismo detalle que la ficha.
  - Rivales: `<nombre>-combate.png` de frente. Opcional: `<nombre>-celebra.png`.
  - Pasante: `pasante-<chico|chica>-espalda.png` de espaldas (se dibuja más grande que los rivales, como en los combates clásicos).
- **Retratos:** 64 x 64 px, fondo transparente, uno por expresión: `<nombre>-neutral.png`, `-feliz`, `-sorpresa`, `-serio`, `-risa`.
- PNG con fondo transparente y sin sombra en el piso (la pone el juego).

## Ya cargados

- **Fede:** `fede-mundo.png`, `fede-combate.png` (puño), `fede-celebra.png` y retratos en `assets/portraits/fede-*.png`.
- **Lu:** `lu-mundo.png` y retratos `assets/portraits/lu-*.png`.
- **Agus:** `agus-mundo.png` y retratos `assets/portraits/agus-*.png` (también quedan `agus-combate.png`, `agus-celebra.png` y `agus-espalda.png` por si algún día pelea).
- **Sahi:** `sahi-mundo.png` y retratos `assets/portraits/sahi-*.png`. También quedan `sahi-combate.png`, `sahi-celebra.png` y `sahi-espalda.png` por si algún día pelea.
- **Lía:** `lia-mundo.png` y retratos `assets/portraits/lia-*.png` (también quedan sus poses de combate).
- **Pasante chico y chica:** `pasante-chico-*.png` y `pasante-chica-*.png` (mundo, espalda, combate y celebración) y retratos `assets/portraits/pasante-*-*.png`, que se ven al elegir pasante.

## Convertir una ficha

Las fichas con el formato de la de Fede (lámina de 1536 x 1024 con la grilla de 5 columnas, combate, detalles y 5 expresiones) se convierten con:

```bash
pip install pillow numpy
python3 tools/make_sheet_hd2.py <nombre> <ficha.png> <carpeta_salida> r,g,b [fila:col,col,col ...]
```

`r,g,b` es el color de la sombra bajo los pies (se mide en la ficha). Recorta cada cuadro **a su tamaño original**, sin reducirlo, y limpia el fondo y la sombra con el recorte v2 (`tools/sheetlib.py`):

- saca el papel aunque quede encerrado (entre el brazo y el cuerpo, entre mechones) y el halo claro del antialias;
- los huecos blancos entre rulos: los del borde quedan transparentes y los de adentro toman el color del pelo;
- no toca remeras blancas o crema, suelas blancas, ojos, dientes ni aros.

Genera `<nombre>-mundo.png` (cuadros de 120 x 228), las poses de combate y los retratos, en paleta de 255 colores. Con `fila:cuadro,cuadro,cuadro` se eligen los cuadros de una fila: `col` (de la misma fila) o `fila.col` (de otra), con `-` adelante para usarlo espejado, o `L` / `R` para armar un paso levantando una pierna del cuadro quieto (así son por defecto los pasos de frente y de espaldas: los de la ficha venían girados o con las piernas cruzadas). Por defecto, el cuadro quieto mirando a la derecha sale de la fila "izquierda", columna "quieto derecha" (`2:1.2,3,4`), que es la pose parada con los dos pies en el piso; el de la fila "derecha" viene a mitad de paso. Se copian acá y se registran en `js/art.js` con `hd: true`. El juego los escala al dibujarlos, así se ven igual que la ficha.

Después de convertir, conviene mirar los recortes sobre un fondo de color fuerte (magenta) para ver si quedó algún agujero o mancha.

Si el diseño viene en una lámina de presentación más grande también sirve: se recorta y se reduce, pero conviene que cada personaje mantenga el mismo tamaño de píxel en toda la lámina.

Cuando un archivo esté listo, guardalo en esta carpeta y descomentá su línea en `js/art.js`. Los personajes sin archivo siguen usando el dibujo generado.
