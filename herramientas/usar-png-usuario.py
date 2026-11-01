"""Usa los PNG con fondo transparente del usuario como fuente principal,
los mapea al id de especie, los recorta a su bbox real y deja listo
assets/ilustraciones-transp/<id>.png
Entrada: C:/Users/black/Desktop/opencode archivos/aves ilustraciones/*.png
"""
import pathlib, unicodedata

ORIG = pathlib.Path("C:/Users/black/Desktop/opencode archivos/aves ilustraciones")
DEST = pathlib.Path("assets/ilustraciones-transp")
DEST.mkdir(parents=True, exist_ok=True)

def norm(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.lower().replace("_", " ").replace("-", " ").strip()

ALIAS = {
    "cabecita negra": "cabezanegra",
    "calandria grande": "calandria-grande",
    "golondrina parda": "golondrina-parda",
    "golondrina patagonica": "golondrina-patagonica",
    "golondrina tijerita": "golondrina-tijerita",
    "jilguero amarillo sobre una rama": "jilguero-dorado",
    "loro barranquero": "loro-barranquero",
    "paloma manchada": "paloma-manchada",
    "paloma picazuro": "paloma-picazuro",
    "tordo renegrido": "tordo-renegrido",
    "zorzal patagonico": "zorzal-patagonico",
    "gorrion comun sobre una roca": "gorrion",
}

IDS = ["benteveo", "cabezanegra", "calandria-grande", "chimango", "chingolo",
       "cotorra", "golondrina-parda", "golondrina-patagonica",
       "golondrina-tijerita", "gorrion", "hornero", "jilguero-dorado",
       "loica", "loro-barranquero", "naranjero", "paloma-manchada",
       "paloma-picazuro", "ratona", "tero", "torcaza", "tordo-renegrido",
       "zorzal-patagonico"]

def buscar_id(stem):
    n = norm(stem)
    if n in ALIAS:
        return ALIAS[n]
    if n in IDS:
        return n
    for i in IDS:
        if n == i.replace("-", " ") or n in i.replace("-", " "):
            return i
    return None

copiados = {}
for f in sorted(ORIG.glob("*.png")):
    aid = buscar_id(f.stem)
    if not aid:
        print("SIN MAPEO:", f.name)
        continue
    if aid in copiados:
        print("duplicado, ignoro:", f.name, "->", aid)
        continue
    data = f.read_bytes()
    (DEST / (aid + ".png")).write_bytes(data)
    copiados[aid] = f.name
    print(f"copiado {f.name:<40} -> {aid}.png")

faltan = [i for i in IDS if i not in copiados]
print("sin png del usuario:", faltan)

# recortar todas a bbox
from PIL import Image
for aid in IDS:
    p = DEST / (aid + ".png")
    if not p.exists():
        print("FALTA", p.name)
        continue
    im = Image.open(p).convert("RGBA")
    caja = im.split()[3].getbbox()
    if not caja:
        print("SIN ALPHA", aid)
        continue
    rec = im.crop(caja)
    rec.save(p, optimize=True)
    print(f"recortado {aid:<24} {im.size} -> {rec.size}")
print("listo")
