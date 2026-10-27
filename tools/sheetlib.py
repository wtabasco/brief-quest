"""Extrae la ficha optimizada de Fede (lámina de presentación) a sprites del juego."""
from PIL import Image
import numpy as np, sys
from collections import deque

SRC = None; A = None; BG = np.array([247, 248, 243]); SH = np.array([168, 169, 186])
def load(path, sh=None):
    global SRC, A, BG, SH
    SRC = Image.open(path).convert('RGB'); A = np.array(SRC).astype(int)
    BG = A[8:14, 8:14].reshape(-1, 3).mean(0).astype(int)
    if sh is not None: SH = np.array(sh)

def cutout(x0, y0, x1, y1, bgtol=30, shtol=16):
    a = A[y0:y1, x0:x1]; h, w, _ = a.shape
    dbg = np.sqrt(((a - BG) ** 2).sum(2)); dsh = np.sqrt(((a - SH) ** 2).sum(2))
    passable = (dbg < bgtol) | (dsh < shtol)
    seen = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if passable[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if passable[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and passable[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    alpha = np.where(seen, 0, 255).astype(np.uint8)
    # bordes suaves del recorte (antialias del render) que quedaron pegados: fuera
    rgba = np.dstack([a.astype(np.uint8), alpha])
    im = Image.fromarray(rgba, 'RGBA')
    im = largest(peel(im))
    return im.crop(im.getbbox())

def peel(im, passes=3, lum=110):
    """Saca el halo claro que deja el antialias entre el contorno oscuro y el papel."""
    a = np.array(im).astype(int)
    for _ in range(passes):
        al = a[:, :, 3] > 0
        edge = np.zeros_like(al)
        edge[1:, :] |= ~al[:-1, :]; edge[:-1, :] |= ~al[1:, :]; edge[:, 1:] |= ~al[:, :-1]; edge[:, :-1] |= ~al[:, 1:]
        L = a[:, :, :3] @ np.array([.3, .59, .11])
        kill = al & edge & (L > lum)
        a[:, :, 3] = np.where(kill, 0, a[:, :, 3])
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

def largest(im):
    a = np.array(im); al = a[:, :, 3] > 0; h, w = al.shape
    lab = np.zeros((h, w), int); best = (0, 0); n = 0
    for y in range(h):
        for x in range(w):
            if al[y, x] and not lab[y, x]:
                n += 1; q = deque([(y, x)]); lab[y, x] = n; cnt = 0
                while q:
                    cy, cx = q.popleft(); cnt += 1
                    for yy, xx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)):
                        if 0 <= yy < h and 0 <= xx < w and al[yy, xx] and not lab[yy, xx]:
                            lab[yy, xx] = n; q.append((yy, xx))
                if cnt > best[0]: best = (cnt, n)
    a[:, :, 3] = np.where(lab == best[1], a[:, :, 3], 0)
    return Image.fromarray(a, 'RGBA')

def shrink(im, k):
    """Reducción por área con alfa premultiplicado y umbral duro."""
    w = max(1, round(im.width * k)); h = max(1, round(im.height * k))
    a = np.array(im).astype(float); al = a[:, :, 3:4] / 255; a[:, :, :3] *= al
    p = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA').resize((w, h), Image.BOX)
    b = np.array(p).astype(float); al2 = b[:, :, 3:4] / 255
    b[:, :, :3] = np.where(al2 > 0, b[:, :, :3] / np.maximum(al2, 1e-6), 0)
    b[:, :, 3] = np.where(b[:, :, 3] > 120, 255, 0)
    return Image.fromarray(np.clip(b, 0, 255).astype(np.uint8), 'RGBA')

def palette_from(images, n=24):
    px = np.concatenate([np.array(i)[np.array(i)[:, :, 3] > 0][:, :3] for i in images])
    img = Image.fromarray(px.reshape(1, -1, 3).astype(np.uint8), 'RGB')
    q = img.quantize(colors=n, method=Image.MEDIANCUT, dither=Image.NONE)
    pal = np.array(q.getpalette()[:n * 3]).reshape(-1, 3)
    return pal

def apply_pal(im, pal):
    a = np.array(im).astype(int); al = a[:, :, 3] > 0
    rgb = a[:, :, :3][al]
    d = ((rgb[:, None, :] - pal[None, :, :]) ** 2).sum(2)
    a[:, :, :3][al] = pal[d.argmin(1)]
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

INK = np.array([38, 28, 36])
def outline(im, always=False):
    """Contorno oscuro de 1 px alrededor de la silueta, como en la ficha."""
    a = np.array(im).astype(int); al = a[:, :, 3] > 0; h, w = al.shape; out = a.copy()
    for y in range(h):
        for x in range(w):
            if al[y, x]: continue
            nb = [(yy, xx) for yy, xx in ((y+1, x), (y-1, x), (y, x+1), (y, x-1)) if 0 <= yy < h and 0 <= xx < w and al[yy, xx]]
            if nb and (always or any(a[yy, xx, :3] @ np.array([.3, .59, .11]) > 80 for yy, xx in nb)):
                out[y, x, :3] = INK; out[y, x, 3] = 255
    return Image.fromarray(out.astype(np.uint8), 'RGBA')

def despeckle(im):
    a = np.array(im); al = a[:, :, 3] > 0; h, w = al.shape
    for y in range(h):
        for x in range(w):
            if al[y, x]:
                n = sum(al[yy, xx] for yy, xx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1)) if 0 <= yy < h and 0 <= xx < w)
                if n <= 1: a[y, x, 3] = 0
    return Image.fromarray(a, 'RGBA')

XS = [(146, 278), (281, 410), (413, 542), (545, 675), (678, 810)]
YS = [(92, 318), (321, 537), (540, 761), (764, 981)]
def world_frames():
    return {(r, c): cutout(x0 + 2, y0 + 2, x1 - 1, y1 - 1) for r, (y0, y1) in enumerate(YS) for c, (x0, x1) in enumerate(XS)}

if __name__ == '__main__':
    fr = world_frames()
    for k, v in fr.items(): print(k, v.size)

# ---------- recorte mejorado y reducción por moda (conserva colores puros del pixel art) ----------
def seg_dist(a, P, Q):
    """distancia de cada color al segmento P–Q (mezclas entre fondo y sombra)"""
    v = (Q - P).astype(float); w = a - P; t = np.clip((w @ v) / (v @ v), 0, 1)
    proj = P + t[..., None] * v
    return np.sqrt(((a - proj) ** 2).sum(-1))

def cutout2(x0, y0, x1, y1, tol=20, hole=40):
    a = A[y0:y1, x0:x1]; h, w, _ = a.shape
    passable = (seg_dist(a, BG, SH) < tol) | (np.sqrt(((a - BG) ** 2).sum(2)) < 30)
    seen = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if passable[y, x]: seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if passable[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and passable[ny, nx]: seen[ny, nx] = True; q.append((ny, nx))
    # huecos encerrados del color del papel (entre las piernas, bajo los brazos)
    near = np.sqrt(((a - BG) ** 2).sum(2)) < 22
    lab = np.zeros((h, w), int); n = 0
    for y in range(h):
        for x in range(w):
            if near[y, x] and not seen[y, x] and not lab[y, x]:
                n += 1; comp = [(y, x)]; lab[y, x] = n; i = 0
                while i < len(comp):
                    cy, cx = comp[i]; i += 1
                    for yy, xx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)):
                        if 0 <= yy < h and 0 <= xx < w and near[yy, xx] and not seen[yy, xx] and not lab[yy, xx]: lab[yy, xx] = n; comp.append((yy, xx))
                if len(comp) >= hole:
                    for cy, cx in comp: seen[cy, cx] = True
    im = Image.fromarray(np.dstack([a.astype(np.uint8), np.where(seen, 0, 255).astype(np.uint8)]), 'RGBA')
    im = largest(peel(im, 2, 140))
    return im.crop(im.getbbox())

def mode_shrink(im, k, pal):
    """cada píxel de salida toma el color de paleta más frecuente de su zona"""
    a = np.array(im).astype(int); al = a[:, :, 3] > 0; h, w = al.shape
    rgb = a[:, :, :3].reshape(-1, 3)
    idx = ((rgb[:, None, :] - pal[None, :, :]) ** 2).sum(2).argmin(1).reshape(h, w)
    W = max(1, round(w * k)); H = max(1, round(h * k))
    out = np.zeros((H, W, 4), np.uint8)
    for j in range(H):
        y0, y1 = int(j / k), max(int(j / k) + 1, int((j + 1) / k))
        for i in range(W):
            x0, x1 = int(i / k), max(int(i / k) + 1, int((i + 1) / k))
            m = al[y0:y1, x0:x1]
            if m.mean() < .45: continue
            vals = idx[y0:y1, x0:x1][m]
            c = np.bincount(vals, minlength=len(pal)).argmax()
            out[j, i, :3] = pal[c]; out[j, i, 3] = 255
    return Image.fromarray(out, 'RGBA')

def src_palette(im, n=28):
    a = np.array(im); px = a[a[:, :, 3] > 0][:, :3]
    q = Image.fromarray(px.reshape(1, -1, 3).astype(np.uint8), 'RGB').quantize(colors=n, method=Image.MEDIANCUT, dither=Image.NONE)
    return np.array(q.getpalette()[:n * 3]).reshape(-1, 3)

# ---------- reconstrucción por grilla: recupera los píxeles reales de la ficha ----------
def _bounds(score, p, k):
    """elige las líneas de la grilla (programación dinámica) con separación cercana a p"""
    n = len(score) - 1
    smin, smax = max(2, int(p * .62)), int(np.ceil(p * 1.45))
    best = np.full(n + 1, -1e18); prev = np.full(n + 1, -1, int)
    for x in range(0, min(n + 1, smax + 1)): best[x] = score[x]
    for x in range(1, n + 1):
        for d in range(smin, smax + 1):
            if x - d < 0 or best[x - d] < -1e17: continue
            v = best[x - d] + score[x] - k * (d - p) ** 2
            if v > best[x]: best[x] = v; prev[x] = x - d
    end = max(range(max(0, n - smax), n + 1), key=lambda x: best[x])
    out = [end]
    while prev[out[-1]] >= 0: out.append(prev[out[-1]])
    return sorted(out)

def grid_native(im, p, pal, pad=6, k=None, kmult=1.5):
    a0 = np.array(im).astype(int)
    a = np.zeros((a0.shape[0] + 2*pad, a0.shape[1] + 2*pad, 4), int); a[pad:pad + a0.shape[0], pad:pad + a0.shape[1]] = a0
    al = a[:, :, 3] > 0; h, w = al.shape
    rgb = np.where(al[..., None], a[:, :, :3], 255)
    dx = np.zeros(w + 1); dy = np.zeros(h + 1)
    dx[1:w] = np.minimum(np.sqrt(((rgb[:, 1:] - rgb[:, :-1]) ** 2).sum(2)), 120).sum(0)
    dy[1:h] = np.minimum(np.sqrt(((rgb[1:] - rgb[:-1]) ** 2).sum(2)), 120).sum(1)
    kx = (k if k is not None else np.median(dx[dx > 0]) * kmult)
    ky = (k if k is not None else np.median(dy[dy > 0]) * kmult)
    xs = _bounds(dx, p, kx); ys = _bounds(dy, p, ky)
    idx = ((a[:, :, :3].reshape(-1, 3)[:, None, :] - pal[None]) ** 2).sum(2).argmin(1).reshape(h, w)
    out = np.zeros((len(ys) - 1, len(xs) - 1, 4), np.uint8)
    for j in range(len(ys) - 1):
        y0, y1 = ys[j], ys[j + 1]; iy0, iy1 = (y0 + 1, y1 - 1) if y1 - y0 > 3 else (y0, y1)
        for i in range(len(xs) - 1):
            x0, x1 = xs[i], xs[i + 1]; ix0, ix1 = (x0 + 1, x1 - 1) if x1 - x0 > 3 else (x0, x1)
            m = al[iy0:iy1, ix0:ix1]
            if m.size == 0 or m.mean() < .5: continue
            c = np.bincount(idx[iy0:iy1, ix0:ix1][m], minlength=len(pal)).argmax()
            out[j, i, :3] = pal[c]; out[j, i, 3] = 255
    r = Image.fromarray(out, 'RGBA'); bb = r.getbbox()
    return r.crop(bb) if bb else r

def denoise(im):
    """quita píxeles sueltos de color (no oscuros) reemplazándolos por el color vecino más común"""
    a = np.array(im).astype(int); h, w = a.shape[:2]; out = a.copy()
    L = a[:, :, :3] @ np.array([.3, .59, .11])
    for y in range(h):
        for x in range(w):
            if a[y, x, 3] == 0 or L[y, x] < 70: continue
            nb = [tuple(a[yy, xx]) for yy, xx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1)) if 0 <= yy < h and 0 <= xx < w]
            me = tuple(a[y, x])
            if me in nb: continue
            op = [c for c in nb if c[3] > 0]
            if len(op) < 3: continue
            best = max(set(op), key=op.count)
            if op.count(best) >= 2: out[y, x] = best
    return Image.fromarray(out.astype(np.uint8), 'RGBA')

def ink_edge(im, k=.82):
    """el borde de la silueta pasa a ser el contorno oscuro (sin agrandar la figura)"""
    a = np.array(im).astype(int); al = a[:, :, 3] > 0; h, w = al.shape; out = a.copy()
    L = a[:, :, :3] @ np.array([.3, .59, .11])
    for y in range(h):
        for x in range(w):
            if not al[y, x] or L[y, x] < 60: continue
            if any(not (0 <= yy < h and 0 <= xx < w) or not al[yy, xx] for yy, xx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1))):
                out[y, x, :3] = (a[y, x, :3] * (1 - k) + INK * k).astype(int)
    return Image.fromarray(out.astype(np.uint8), 'RGBA')

def fix_eyes(im):
    """un ojo que quedó gris entre la piel (mezcla del muestreo) vuelve a ser oscuro"""
    a = np.array(im).astype(int); h, w = a.shape[:2]; out = a.copy()
    def skin(c): return c[3] > 0 and c[0] > 170 and c[0] > c[1] > c[2] and c[0] - c[2] > 50
    for y in range(h):
        for x in range(w):
            c = a[y, x]
            if c[3] == 0: continue
            mx, mn = c[:3].max(), c[:3].min(); L = c[:3] @ np.array([.3, .59, .11])
            if mx - mn > 40 or not (55 < L < 165): continue
            nb = [a[yy, xx] for yy, xx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1)) if 0 <= yy < h and 0 <= xx < w]
            if sum(skin(n) for n in nb) >= 2: out[y, x, :3] = (42, 34, 48)
    return Image.fromarray(out.astype(np.uint8), 'RGBA')

# ---------- recorte v3: saca el papel aunque quede encerrado entre mechones, y el halo de mezcla ----------
def paper_mask(a, tol=7):
    """píxeles del papel de la ficha: casi iguales al fondo y con su tinte verdoso (los blancos del dibujo no lo tienen)"""
    d = np.sqrt(((a - BG) ** 2).sum(2))
    g = a[:, :, 1] - np.maximum(a[:, :, 0], a[:, :, 2])
    gb = BG[1] - max(BG[0], BG[2])
    return (d < tol) & (g >= max(1, gb - 2))

def _components(mask):
    h, w = mask.shape; lab = np.zeros((h, w), int); comps = []
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not lab[y, x]:
                comps.append([(y, x)]); lab[y, x] = len(comps); q = comps[-1]; i = 0
                while i < len(q):
                    cy, cx = q[i]; i += 1
                    for yy, xx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)):
                        if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not lab[yy, xx]: lab[yy, xx] = len(comps); q.append((yy, xx))
    return comps

def unblend(a, al, passes=4, tol=16):
    """quita los píxeles del borde que son mezcla de papel con el color vecino (halo del antialias)"""
    h, w = al.shape
    for _ in range(passes):
        # el halo se busca solo junto al fondo de verdad: un agujerito suelto adentro (un píxel de papel en la suela,
        # el interior de un rulo) no tiene que ir comiéndose los blancos del dibujo
        out = ~al
        for comp in _components(~al):
            if len(comp) < 12 and not any(y in (0, h - 1) or x in (0, w - 1) for y, x in comp):
                for y, x in comp: out[y, x] = False
        edge = np.zeros_like(al)
        edge[1:, :] |= out[:-1, :]; edge[:-1, :] |= out[1:, :]; edge[:, 1:] |= out[:, :-1]; edge[:, :-1] |= out[:, 1:]
        ys, xs = np.nonzero(al & edge); kill = []
        for y, x in zip(ys, xs):
            c = a[y, x]; L = c @ np.array([.3, .59, .11])
            if L < 120: continue
            # vecino interior más oscuro en un radio de 2
            y0, y1, x0, x1 = max(0, y - 2), min(h, y + 3), max(0, x - 2), min(w, x + 3)
            nb = a[y0:y1, x0:x1][al[y0:y1, x0:x1]]
            if not len(nb): kill.append((y, x)); continue
            Ln = nb @ np.array([.3, .59, .11]); dark = nb[Ln.argmin()]
            if (dark @ np.array([.3, .59, .11])) > L - 25: continue
            v = (BG - dark).astype(float); t = np.clip(((c - dark) @ v) / (v @ v), 0, 1)
            if t > .25 and np.sqrt(((c - (dark + t * v)) ** 2).sum()) < tol: kill.append((y, x))
        if not kill: break
        for y, x in kill: al[y, x] = False
    return al

def cutout3(x0, y0, x1, y1, tol=20, keep_white=True):
    a = A[y0:y1, x0:x1].copy(); h, w, _ = a.shape
    dbg = np.sqrt(((a - BG) ** 2).sum(2))
    passable = (seg_dist(a, BG, SH) < tol) | (dbg < 28)
    seen = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if passable[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if passable[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and passable[ny, nx]: seen[ny, nx] = True; q.append((ny, nx))
    # papel encerrado (entre mechones, bajo los brazos, entre las piernas): cualquier tamaño, si es papel de verdad
    # ojo: no confundirlo con una remera blanca o crema (tiene tono cálido) ni con las suelas blancas (abajo de todo)
    paper = paper_mask(a)
    near = dbg < 26
    fy = np.nonzero((~seen).any(1))[0]; ft, fb = (fy[0], fy[-1]) if len(fy) else (0, h - 1)
    for comp in _components(near & ~seen):
        ys, xs = zip(*comp)
        frac = paper[list(ys), list(xs)].mean()
        px = a[list(ys), list(xs)]; warm = (px[:, 0] - px[:, 2]).mean()
        sole = max(ys) >= fb - .08 * (fb - ft)
        cs = set(comp); core = sum(all((y + dy, x + dx) in cs for dy in (-1, 0, 1) for dx in (-1, 0, 1)) for y, x in comp)
        if (frac > .5 and len(comp) >= 4) or (len(comp) >= 45 and core >= 12 and warm < 5 and not sole):
            for cy, cx in comp: seen[cy, cx] = True
    al = unblend(a, ~seen)
    im = Image.fromarray(np.dstack([a.astype(np.uint8), np.where(al, 255, 0).astype(np.uint8)]), 'RGBA')
    im = largest(im)
    return im.crop(im.getbbox())

# ---------- manchas blancas dentro del pelo (vienen dibujadas en la ficha): se rellenan con el pelo de alrededor ----------
def sample_colors(x0, y0, x1, y1, n=10, minL=0):
    px = A[y0:y1, x0:x1].reshape(-1, 3)
    px = px[(np.sqrt(((px - BG) ** 2).sum(1)) > 40) & ((px @ np.array([.3, .59, .11])) >= minL)]
    q = Image.fromarray(px.reshape(1, -1, 3).astype(np.uint8), 'RGB').quantize(colors=n, method=Image.MEDIANCUT, dither=Image.NONE)
    return np.array(q.getpalette()[:n * 3]).reshape(-1, 3)

HAIR = None; SKIN = None
def learn_hair_skin():
    """pelo: la nuca de la vista de espaldas; piel: la cara de frente"""
    global HAIR, SKIN
    (x0, x1), (y0, y1) = XS[0], YS[3]
    cx = (x0 + x1) // 2
    HAIR = sample_colors(cx - 28, y0 + 30, cx + 28, y0 + 95, 12)
    (x0, x1), (y0, y1) = XS[0], YS[0]
    cx = (x0 + x1) // 2
    SKIN = sample_colors(cx - 10, y0 + 62, cx + 10, y0 + 80, 6, minL=140)

def hair_pockets(a, al, max_size=90, head=.62, face=True):
    """manchas blancas dentro del pelo (huecos entre rulos que la ficha pintó de blanco): solo en la zona de la cabeza,
    sin piel cerca (así no se tocan ojos, dientes ni los aros junto a la cara). Devuelve [(componente, toca_afuera)]"""
    rgb = a[:, :, :3].astype(int); Lw = np.array([.3, .59, .11]); L = rgb @ Lw; chroma = rgb.max(2) - rgb.min(2)
    h, w = al.shape; ys0 = np.nonzero(al.any(1))[0]; top, bot = ys0[0], ys0[-1]; ylim = top + (bot - top) * head
    light = al & (L > 212) & (chroma < 34)
    skin0 = al & (np.sqrt(((rgb[:, :, None, :] - SKIN[None, None]) ** 2).sum(3)).min(2) < 24)
    skin = np.zeros_like(skin0)
    for cc in (_components(skin0) if face else []):
        if len(cc) >= 50:
            for y, x in cc: skin[y, x] = True
    metal = al & (chroma < 40) & (L > 55) & (L < 215) & (rgb[:, :, 2] >= rgb[:, :, 0] + 4) & face
    out = []; WHITE = np.array([252, 252, 250])
    for comp in _components(light):
        if len(comp) > max_size or max(y for y, _ in comp) > ylim: continue
        cs = set(comp); ring = set(); ring2 = set(); near_skin = False; outside = False
        for y, x in comp:
            for yy in range(y - 4, y + 5):
                for xx in range(x - 4, x + 5):
                    if not (0 <= yy < h and 0 <= xx < w): outside = True; continue
                    if (yy, xx) in cs: continue
                    if not al[yy, xx]: outside = True; continue
                    if (skin[yy, xx] or metal[yy, xx]) and abs(yy - y) <= 3 and abs(xx - x) <= 3: near_skin = True
                    if abs(yy - y) <= 2 and abs(xx - x) <= 2: ring.add((yy, xx))
                    elif abs(yy - y) <= 3 and abs(xx - x) <= 3: ring2.add((yy, xx))
        if near_skin or not ring: continue
        rc = np.array([rgb[y, x] for y, x in ring]); rl = rc @ Lw
        body = rc[(rl > 60) & (rl < 225) & ((rc.max(1) - rc.min(1)) > 18)]
        if len(body) < 2: continue
        hd = np.min([seg_dist(body, hc, WHITE) for hc in HAIR], axis=0)
        if (hd < 22).mean() < .5: continue
        # además, un poco más afuera tiene que haber pelo de verdad (no ropa clara ni una remera blanca)
        r2 = [p for p in ring2 if p not in ring and p not in cs]
        if r2:
            c2 = np.array([rgb[y, x] for y, x in r2]); l2 = c2 @ Lw; c2 = c2[(l2 > 45) & (l2 < 225)]
            if len(c2) >= 3:
                dh = np.sqrt(((c2[:, None, :] - HAIR[None]) ** 2).sum(2)).min(1)
                if (dh < 36).mean() < .5: continue
        out.append((comp, outside))
    return out

def fill_pockets(a, al, comps):
    """los huecos del borde quedan transparentes (se ve el fondo entre los rulos); los de adentro toman el color del pelo vecino"""
    h, w = al.shape; rgb = a[:, :, :3]
    for comp, outside in comps:
        if outside:
            for y, x in comp: al[y, x] = False
            continue
        todo = set(comp)
        while todo:
            done = []
            for y, x in todo:
                cands = [rgb[yy, xx] for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)) if 0 <= yy < h and 0 <= xx < w and al[yy, xx] and (yy, xx) not in todo and (rgb[yy, xx] @ np.array([.3, .59, .11])) > 45]
                if cands: done.append(((y, x), cands[0]))
            if not done:
                for y, x in todo: done.append(((y, x), HAIR[len(HAIR) // 2]))
            for (y, x), c in done: rgb[y, x] = c; todo.discard((y, x))
    a[:, :, 3] = np.where(al, 255, 0)
    return a

def cutout4(x0, y0, x1, y1, tol=20, report=None, face=True):
    """cutout3 + manchas blancas del pelo rellenadas"""
    im = cutout3(x0, y0, x1, y1, tol)
    a = np.array(im).astype(int); al = a[:, :, 3] > 0
    comps = hair_pockets(a, al, face=face)
    if report is not None: report.extend(comps)
    a = fill_pockets(a, al, comps)
    al = unblend(a[:, :, :3], a[:, :, 3] > 0, passes=2); a[:, :, 3] = np.where(al, 255, 0)
    a = close_small_holes(a)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

def close_small_holes(a, max_size=24, head=.45):
    """agujeritos transparentes encerrados en la cabeza (el interior de un aro, un rulo cerrado) se rellenan con el color vecino"""
    al = a[:, :, 3] > 0; h, w = al.shape
    ys0 = np.nonzero(al.any(1))[0]
    if not len(ys0): return a
    ylim = ys0[0] + (ys0[-1] - ys0[0]) * head
    holes = []
    for comp in _components(~al):
        if len(comp) > max_size: continue
        if any(y in (0, h - 1) or x in (0, w - 1) for y, x in comp): continue
        if max(y for y, _ in comp) > ylim: continue
        holes.append((comp, False))
    if holes:
        al2 = al.copy()
        for comp, _ in holes:
            for y, x in comp: al2[y, x] = True
        a = fill_pockets(a, al2, holes)
    return a
