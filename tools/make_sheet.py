"""Convierte una ficha de personaje (mismo formato que la de Fede) en los PNG del juego.
uso: python3 make_sheet.py <nombre> <ficha.png> <carpeta_salida> [r,g,b de la sombra]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sheetlib as L
from sheetlib import *
name, path, OUT = sys.argv[1], sys.argv[2], sys.argv[3].rstrip('/') + '/'
sh = [int(v) for v in sys.argv[4].split(',')] if len(sys.argv) > 4 else None
L.load(path, sh); os.makedirs(OUT, exist_ok=True)
# ---------- mundo: quieto, paso 1, paso 2 (columnas 1, 4 y 5) ----------
WORLD_H = 60
cols = (0, 3, 4)
raw = {(r, i): cutout2(XS[c][0] + 2, YS[r][0] + 2, XS[c][1] - 1, YS[r][1] - 1) for r in range(4) for i, c in enumerate(cols)}
big = Image.new('RGBA', (sum(i.width for i in raw.values()), max(i.height for i in raw.values())))
x = 0
for im in raw.values(): big.alpha_composite(im, (x, 0)); x += im.width
pal = src_palette(big, 28)
sm = {k: ink_edge(fix_eyes(denoise(largest(despeckle(mode_shrink(im, WORLD_H / im.height, pal)))))) for k, im in raw.items()}
FW, FH = 36, 64
sheet = Image.new('RGBA', (FW * 3, FH * 4), (0, 0, 0, 0))
for (r, c), im in sm.items(): sheet.alpha_composite(im, (c * FW + (FW - im.width) // 2, r * FH + FH - 2 - im.height))
sheet.save(OUT + f'{name}-mundo.png'); print('mundo', sheet.size, sorted(set(i.size for i in sm.values())))
# ---------- combate ----------
def battle(box, h, pal_n=32):
    im = cutout2(*box)
    s = largest(despeckle(mode_shrink(im, h / im.height, src_palette(im, pal_n))))
    return ink_edge(s.crop(s.getbbox()))
b1 = battle((835, 120, 1048, 425), 150); b1.save(OUT + f'{name}-combate.png')
b2 = battle((1055, 120, 1295, 425), 150); b2.save(OUT + f'{name}-celebra.png')
b3 = battle((1305, 120, 1515, 425), 150); b3.save(OUT + f'{name}-espalda.png')
print('combate', b1.size, b2.size, b3.size)
# ---------- retratos ----------
def portrait(x0, x1, y0=843, y1=982, size=64):
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
    rg = peel(rgba, 2, 150)
    g = mode_shrink(rg, size / s, src_palette(rg, 30))
    return g if g.size == (size, size) else g.resize((size, size), Image.NEAREST)
boxes = {'neutral': (845, 965), 'feliz': (978, 1097), 'sorpresa': (1111, 1233), 'serio': (1248, 1370), 'risa': (1384, 1506)}
for k2, b in boxes.items(): portrait(*b).save(OUT + f'retrato-{k2}.png')
print('ok')
