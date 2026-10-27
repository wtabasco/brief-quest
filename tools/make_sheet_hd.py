"""Convierte una ficha (formato de la de Fede) en imágenes del juego SIN reducirlas:
se recorta cada cuadro tal cual está en la ficha, se limpia el fondo y la sombra, y el juego
las dibuja con el mismo detalle que la infografía.
uso: python3 make_sheet_hd.py <nombre> <ficha.png> <carpeta_salida> [r,g,b de la sombra]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sheetlib as L
from sheetlib import *
name, path, OUT = sys.argv[1], sys.argv[2], sys.argv[3].rstrip('/') + '/'
sh = [int(v) for v in sys.argv[4].split(',')] if len(sys.argv) > 4 else None
L.load(path, sh); os.makedirs(OUT, exist_ok=True)
# ---------- mundo: quieto, paso 1, paso 2 (columnas 1, 4 y 5), a resolución de la ficha ----------
cols = (0, 3, 4)
raw = {(r, i): cutout2(XS[c][0] + 2, YS[r][0] + 2, XS[c][1] - 1, YS[r][1] - 1) for r in range(4) for i, c in enumerate(cols)}
FW, FH = 120, 228
sheet = Image.new('RGBA', (FW * 3, FH * 4), (0, 0, 0, 0))
for (r, c), im in raw.items():
    assert im.width <= FW and im.height <= FH - 8, (r, c, im.size)
    sheet.alpha_composite(im, (c * FW + (FW - im.width) // 2, r * FH + FH - 8 - im.height))
sheet.save(OUT + f'{name}-mundo.png', optimize=True); print('mundo', sheet.size, sorted(i.size for i in raw.values())[-1])
# ---------- combate ----------
for suf, box in (('combate', (835, 120, 1048, 425)), ('celebra', (1055, 120, 1295, 425)), ('espalda', (1305, 120, 1515, 425))):
    im = cutout2(*box); im.save(OUT + f'{name}-{suf}.png', optimize=True); print(suf, im.size)
# ---------- retratos: el recuadro de cada expresión, con fondo transparente ----------
def portrait(x0, x1, y0=844, y1=981):
    im = L.A[y0:y1, x0:x1]; h, w, _ = im.shape
    s = min(h, w); ox = (w - s) // 2; oy = h - s
    a = im[oy:oy + s, ox:ox + s].astype(int); d = np.sqrt(((a - L.BG) ** 2).sum(2))
    seen = np.zeros(d.shape, bool); q = deque()
    for xx in range(s):
        if d[0, xx] < 28: seen[0, xx] = True; q.append((0, xx))
    for yy in range(s):
        for xx in (0, s - 1):
            if d[yy, xx] < 28 and not seen[yy, xx]: seen[yy, xx] = True; q.append((yy, xx))
    while q:
        yy, xx = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = yy + dy, xx + dx
            if 0 <= ny < s and 0 <= nx < s and not seen[ny, nx] and d[ny, nx] < 28: seen[ny, nx] = True; q.append((ny, nx))
    rgba = Image.fromarray(np.dstack([a.astype(np.uint8), np.where(seen, 0, 255).astype(np.uint8)]), 'RGBA')
    return peel(rgba, 1, 170)
boxes = {'neutral': (845, 965), 'feliz': (978, 1097), 'sorpresa': (1111, 1233), 'serio': (1248, 1370), 'risa': (1384, 1506)}
for k2, b in boxes.items(): p = portrait(*b); p.save(OUT + f'retrato-{k2}.png', optimize=True)
print('retratos', p.size)
