"""Quita el fondo de las ilustraciones con rembg y las guarda como PNG transparentes."""
from rembg import remove, new_session
from PIL import Image
import pathlib

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent
ORIG = RAIZ / "assets" / "ilustraciones"
DEST = RAIZ / "assets" / "ilustraciones-transp"
DEST.mkdir(parents=True, exist_ok=True)

def main():
    ses = new_session("isnet-general-use")
    files = sorted([f for f in ORIG.iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png')])
    print(f"Procesando {len(files)} archivos")
    for f in files:
        print(f"-> {f.name}")
        try:
            img = Image.open(f).convert('RGB')
            out = remove(img, session=ses, post_process_mask=True)
            out.save(DEST / (f.stem + '.png'), optimize=True)
            print(f"   ok -> {f.stem}.png ({out.size})")
        except Exception as e:
            print(f"   ERR {e}")
    print("listo")

if __name__ == "__main__":
    main()
