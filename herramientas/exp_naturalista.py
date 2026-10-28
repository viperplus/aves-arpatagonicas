"""Experimento de tratamiento 'naturalista' sobre un corte de ave.
Genera varias variantes para comparar."""
import pathlib
from PIL import Image, ImageFilter, ImageEnhance, ImageOps

src = pathlib.Path(r"C:\Users\black\Desktop\opencode archivos\clase n°4\aves-ar\assets\ave-25d\hornero.png")
out = pathlib.Path(r"C:\Users\black\Desktop\opencode archivos\clase n°4\aves-ar\herramientas\tmp_test\exp")
out.mkdir(parents=True, exist_ok=True)
im = Image.open(src).convert("RGBA")
# recortar al bbox del ave (sin transparencia)
bbox = im.getbbox()
ave = im.crop(bbox)
print("bbox", bbox, "size", ave.size)

# 1. Sepia sobre fondo papel
def sepia(img):
    g = ImageOps.grayscale(img.convert("RGB"))
    # tono sepia
    r = g.point(lambda x: min(255, int(x*1.15+30)))
    g2 = g.point(lambda x: min(255, int(x*0.95+10)))
    b = g.point(lambda x: int(x*0.7))
    return Image.merge("RGB", (r, g2, b))

# variante A: sepia + papel
papel = Image.new("RGB", ave.size, (246, 239, 223))
# pegar ave con alpha
ave_rgb = ave.convert("RGB")
mask = ave.split()[3]
papel.paste(ave_rgb, (0,0), mask)
vA = sepia(papel)
vA.save(out/"A_sepia_papel.png")

# variante B: acuarela (posterize + blur + edge enhance)
w = ave.copy()
w = w.filter(ImageFilter.MedianFilter(size=3))
w = ImageEnhance.Color(w).enhance(0.6)
w = w.filter(ImageFilter.EDGE_ENHANCE_MORE)
# fondo papel
papel2 = Image.new("RGBA", ave.size, (246,239,223,255))
papel2.paste(w, (0,0), w.split()[3] if w.mode=="RGBA" else None)
vB = papel2.convert("RGB")
vB.save(out/"B_acuarela.png")

# variante C: contorno (sketch) sobre papel
gray = ImageOps.grayscale(ave.convert("RGB"))
edges = gray.filter(ImageFilter.FIND_EDGES)
edges = ImageOps.invert(edges)
# mezclar con color
col = ave.convert("RGB")
sketch = Image.blend(edges.convert("RGB"), col, 0.35)
papel3 = Image.new("RGB", ave.size, (246,239,223))
mask3 = ave.split()[3]
papel3.paste(sketch, (0,0), mask3)
vC = papel3
vC.save(out/"C_sketch.png")

# variante D: pintura (posterize a 6 niveles + suavizado)
from PIL import ImageOps
d = ave.copy()
d = d.convert("RGB")
d = ImageOps.posterize(d, 5)
d = d.filter(ImageFilter.SMOOTH_MORE)
papel4 = Image.new("RGB", ave.size, (246,239,223))
papel4.paste(d, (0,0), mask)
vD = papel4
vD.save(out/"D_posterize.png")

print("listo")
