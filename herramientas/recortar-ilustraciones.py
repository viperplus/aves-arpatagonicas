"""Recorta los PNG transparentes a su bbox real (sin margenes vacios)
para que el dibujo llene la caja de la tarjeta.
Entrada:  assets/ilustraciones-transp/<id>.png
Salida:   assets/ilustraciones-transp/<id>.png (sobrescrito, recortado)
"""
import pathlib
from PIL import Image

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent
DIR = RAIZ / "assets" / "ilustraciones-transp"

def main():
    for f in sorted(DIR.glob("*.png")):
        im = Image.open(f).convert("RGBA")
        alfa = im.split()[3]
        caja = alfa.getbbox()
        if not caja:
            print("SIN ALPHA", f.name)
            continue
        rec = im.crop(caja)
        rec.save(f, optimize=True)
        print(f"ok {f.name:<34} {im.size} -> {rec.size}")

if __name__ == "__main__":
    main()
