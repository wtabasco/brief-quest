"""Ficha -> imágenes del juego, versión 2 (recorte prolijo).
- saca el papel aunque quede encerrado entre mechones y el halo claro del antialias (cutout3)
- las manchas blancas dentro del pelo: las del borde quedan transparentes, las de adentro toman el color del pelo (cutout4)
- guarda en paleta de 255 colores (corte por mediana) + 1 transparente: mismos colores, poco peso
uso: python3 make_sheet_hd2.py <nombre> <ficha.png> <carpeta_salida> r,g,b(sombra) [fila:cuadro,cuadro,cuadro ...]
  cuadro = col | fila.col, con "-" para espejar, o L / R: paso armado levantando la pierna izquierda o derecha del cuadro quieto.
  Por defecto 0:0,L,R y 3:0,L,R (de frente y de espaldas) y 2:1.2,3,4 (parado mirando a la derecha con los pies en el piso).
  ej. para usar los pasos dibujados en la ficha de espaldas: ... 3:0,3,4"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sheetlib as L
from sheetlib import *
from PIL import Image

def save_pal(im, path):
    a = np.array(im.convert('RGBA')); al = a[:, :, 3] > 0
    rgb = Image.fromarray(a[:, :, :3], 'RGB')
    q = rgb.quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    idx = np.array(q); idx[~al] = 255
    pal = q.getpalette()[:255 * 3] + [0, 0, 0]
    out = Image.fromarray(idx.astype(np.uint8), 'P'); out.putpalette(pal)
    out.save(path, optimize=True, transparency=255)

def portrait(x0, x1, y0=844, y1=981):
    im = L.A[y0:y1, x0:x1]; h, w, _ = im.shape
    s = min(h, w); ox = (w - s) // 2; oy = h - s
    a = im[oy:oy + s, ox:ox + s].astype(int)
    paper = paper_mask(a); d = np.sqrt(((a - L.BG) ** 2).sum(2))
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
    for comp in L._components((d < 26) & ~seen):
        ys, xs = zip(*comp)
        if len(comp) >= 4 and paper[list(ys), list(xs)].mean() > .5:
            for cy, cx in comp: seen[cy, cx] = True
    al = unblend(a, ~seen)
    b = np.dstack([a, np.where(al, 255, 0)]).astype(int)
    comps = hair_pockets(b, al, max_size=120, head=.75)
    b = fill_pockets(b, al, comps)
    return Image.fromarray(b.astype(np.uint8), 'RGBA'), len(comps)

def leg_lift(im, side, d=10, hip=.68, knee=.83):
    """paso de frente: la pierna de un lado (L = la de la izquierda de la imagen) sube d píxeles; el muslo se acorta
    de a poco entre la cadera y la rodilla, así no hay corte, y la otra queda apoyada. Cabeza y torso no se tocan."""
    a = np.array(im.convert('RGBA')); h, w = a.shape[:2]
    al = a[:, :, 3] > 0
    # dónde se separan las piernas: el hueco entre los pies (o el centro, si están juntos)
    feet = al[int(h * .9):, :].any(0); xs = np.nonzero(feet)[0]
    split = w // 2
    if len(xs):
        gaps = [x for x in range(xs[0], xs[-1]) if not feet[x]]
        if gaps: split = (gaps[0] + gaps[-1]) // 2 + 1
    y0, y1 = int(h * hip), int(h * knee)
    out = a.copy()
    for x in (range(0, split) if side == 'L' else range(split, w)):
        col = a[:, x].copy(); new = np.zeros_like(col)
        new[:y0] = col[:y0]
        for y in range(y0, h):
            sh = d * (y - y0) / max(1, y1 - y0) if y < y1 else d
            sy = int(round(y + sh))
            if sy < h: new[y] = col[sy]
        out[:, x] = new
    return Image.fromarray(out, 'RGBA')

if __name__ == '__main__':
    name, path, OUT = sys.argv[1], sys.argv[2], sys.argv[3].rstrip('/') + '/'
    sh = [int(v) for v in sys.argv[4].split(',')] if len(sys.argv) > 4 else None
    L.load(path, sh); L.learn_hair_skin(); os.makedirs(OUT, exist_ok=True)
    # cuadros por fila: quieto, paso 1, paso 2. Cada uno es "col" (de la misma fila) o "fila.col" (de otra fila);
    # con "-" adelante se usa espejado. Por defecto, mirando a la derecha el quieto sale de la fila "izquierda",
    # columna "quieto derecha" (1.2): es la pose parada de verdad, con los dos pies en el piso; la columna 0 de la
    # fila "derecha" viene a mitad de paso. Se puede cambiar por fila, por ejemplo "3:0,-4,4".
    FW, FH = 120, 228; fixed = 0
    def spec(v, r):
        if v in ('L', 'R'): return v, None, False
        m = v.startswith('-'); v = v.lstrip('-')
        rr, c = (int(x) for x in v.split('.')) if '.' in v else (r, int(v))
        return rr, c, m
    # de frente, los pasos de la ficha vienen girados o con las piernas cruzadas: se arman a partir del cuadro
    # quieto levantando una pierna y después la otra (L y R), sin tocar cabeza ni torso
    rowcols = {0: '0,L,R', 1: '0,3,4', 2: '1.2,3,4', 3: '0,L,R'}
    rowcols.update({int(k): vs for k, vs in (a.split(':') for a in sys.argv[5:])})
    sheet = Image.new('RGBA', (FW * 3, FH * 4), (0, 0, 0, 0))
    for r in range(4):
        stand = None
        for i, (sr, c, mirror) in enumerate(spec(v, r) for v in rowcols[r].split(',')):
            if sr in ('L', 'R'):
                im = leg_lift(stand, sr)
            else:
                rep = []
                im = cutout4(XS[c][0] + 2, YS[sr][0] + 2, XS[c][1] - 1, YS[sr][1] - 1, report=rep, face=(sr != 3)); fixed += len(rep)
                im = im.crop(im.getbbox())
                if mirror: im = im.transpose(Image.FLIP_LEFT_RIGHT)
                if stand is None: stand = im
            assert im.width <= FW and im.height <= FH - 8, (r, c, im.size)
            sheet.alpha_composite(im, (i * FW + (FW - im.width) // 2, r * FH + FH - 8 - im.height))
    save_pal(sheet, OUT + f'{name}-mundo.png')
    for suf, box, face in (('combate', (835, 120, 1048, 425), True), ('celebra', (1055, 120, 1295, 425), True), ('espalda', (1305, 120, 1515, 425), False)):
        rep = []; im = cutout4(*box, report=rep, face=face); fixed += len(rep)
        save_pal(im.crop(im.getbbox()), OUT + f'{name}-{suf}.png')
    boxes = {'neutral': (845, 965), 'feliz': (978, 1097), 'sorpresa': (1111, 1233), 'serio': (1248, 1370), 'risa': (1384, 1506)}
    for k2, bx in boxes.items():
        p, n = portrait(*bx); fixed += n; save_pal(p, OUT + f'retrato-{k2}.png')
    print(name, 'listo · manchas arregladas:', fixed)
