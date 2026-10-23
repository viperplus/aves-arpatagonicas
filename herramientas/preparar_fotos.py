"""Recorta el fondo de la foto elegida de cada especie (rembg) y la deja
como corte 800x800: fondo transparente, ave centrada horizontalmente y
patas apoyadas en y = 720 (fraccion de pies 0.90 para todas).
Entrada:  herramientas/tmp_test/fotos/<id>/<archivo>  (descargar-fotos.mjs)
          herramientas/fotos-eleccion.json
Salida:   assets/ave-25d/<id>.png   +   js/fotos.js (creditos)
Uso:      python preparar_fotos.py"""

import json
import pathlib
import sys

from PIL import Image
from rembg import remove, new_session

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent
FOTOS = AQUI / "tmp_test" / "fotos"
SALIDA = RAIZ / "assets" / "ave-25d"
CANVAS = 800
PIES_Y = 720          # patas en 720/800 = 0.90
MAX_ANCHO = 700
MAX_ALTO = 660

SALIDA.mkdir(parents=True, exist_ok=True)


def sesión():
    for modelo in ("isnet-general-use", "u2net"):
        try:
            s = new_session(modelo)
            print(f"modelo: {modelo}")
            return s
        except Exception as e:
            print(f"no se pudo cargar {modelo}: {e}")
    raise SystemExit("sin modelo de rembg")


def main():
    eleccion = json.loads((AQUI / "fotos-eleccion.json").read_text(encoding="utf-8"))
    ses = sesión()
    creditos = {}

    for ave_id, archivo in eleccion.items():
        carpeta = FOTOS / ave_id
        origen = carpeta / archivo
        if not origen.exists():
            print(f"FALLA {ave_id}: falta {origen}")
            continue
        meta = {}
        try:
            cj = json.loads((carpeta / "candidatas.json").read_text(encoding="utf-8"))
            for c in cj.get("candidatas", []):
                if c.get("archivo") == archivo:
                    meta = c
        except Exception:
            pass

        rgb = Image.open(origen).convert("RGB")
        rec = remove(rgb, session=ses, post_process_mask=True)

        # descarta isletas sueltas (hierbitas, manchas): nos quedamos solo
        # con la componente mas grande (el ave y lo que le toca)
        import numpy as np
        from scipy import ndimage
        alfa0 = np.array(rec.split()[3]) > 128
        etiquetas, n = ndimage.label(alfa0)
        if n > 1:
            areas = ndimage.sum(alfa0, etiquetas, range(1, n + 1))
            mayor = int(np.argmax(areas)) + 1
            mascara = etiquetas == mayor
            alfa_arr = np.where(mascara, np.array(rec.split()[3]), 0).astype("uint8")
            rec.putalpha(Image.fromarray(alfa_arr))

        alfa = rec.split()[3].point(lambda v: 255 if v > 20 else 0)
        caja = alfa.getbbox()
        if not caja:
            print(f"FALLA {ave_id}: rembg no encontro al ave")
            continue
        ave = rec.crop(caja)
        w, h = ave.size
        esc = min(MAX_ANCHO / w, MAX_ALTO / h, 2.5)
        w2, h2 = max(1, round(w * esc)), max(1, round(h * esc))
        ave = ave.resize((w2, h2), Image.LANCZOS)

        lienzo = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        lienzo.paste(ave, ((CANVAS - w2) // 2, PIES_Y - h2), ave)
        destino = SALIDA / f"{ave_id}.png"
        lienzo.save(destino, optimize=True)

        creditos[ave_id] = {
            "titulo": meta.get("titulo", ""),
            "autor": meta.get("autor", "desconocido"),
            "licencia": meta.get("licencia", ""),
            "pagina": meta.get("pagina", ""),
            "fuente": "Wikimedia Commons"
        }
        kb = round(destino.stat().st_size / 1024)
        print(f"ok  {ave_id:<10} -> assets/ave-25d/{ave_id}.png  {kb} KB  "
              f"({w2}x{h2}, original {w}x{h})  {meta.get('licencia', '?')}")

    if len(creditos) != len(eleccion):
        print(f"ATENCION: {len(creditos)}/{len(eleccion)} cortes")
        sys.exit(1)

    (RAIZ / "js" / "fotos.js").write_text(
        "/* Generado por herramientas/preparar_fotos.py — creditos de las fotos "
        "(Wikimedia Commons) */\nwindow.FOTOS = " +
        json.dumps(creditos, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8")
    print(f"\njs/fotos.js con {len(creditos)} creditos")


if __name__ == "__main__":
    main()
