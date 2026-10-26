/* Hoja de contactos de las candidatas: una imagen por especie con tiles
   etiquetados (c1.jpg, licencia y título) para elegir la foto ganadora.
   Entrada: herramientas/tmp_test/fotos/<id>/c*.jpg + candidatas.json
   Salida:  herramientas/tmp_test/elegir/<id>.png
   Uso:  node elegir-candidatas.mjs [ids...]   (sin ids = las que falten en
         fotos-eleccion.json)                                           */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createCanvas, loadImage } from "canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const FOTOS = path.join(__dirname, "tmp_test", "fotos");
const SALIDA = path.join(__dirname, "tmp_test", "elegir");
fs.mkdirSync(SALIDA, { recursive: true });

function cargar(rel) {
  const src = fs.readFileSync(path.join(raiz, rel), "utf8");
  const win = {};
  new Function("window", src + "\n;return window;")(win);
  return win;
}
const AVES = cargar("js/datos.js").AVES;
const eleccion = JSON.parse(fs.readFileSync(path.join(__dirname, "fotos-eleccion.json"), "utf8"));

const solo = process.argv.slice(2);
const lista = AVES.filter(a => solo.length ? solo.includes(a.id) : !eleccion[a.id]);

const TILE = 300, FILA_H = TILE + 46, COLS = 4;

for (const ave of lista) {
  const carpeta = path.join(FOTOS, ave.id);
  if (!fs.existsSync(carpeta)) { console.log("sin carpeta:", ave.id); continue; }
  const meta = JSON.parse(fs.readFileSync(path.join(carpeta, "candidatas.json"), "utf8"));
  const porArchivo = {};
  for (const c of meta.candidatas || []) porArchivo[c.archivo] = c;
  const files = fs.readdirSync(carpeta).filter(f => /^c\d+\.jpg$/.test(f))
    .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
  if (!files.length) { console.log("sin candidatas:", ave.id); continue; }

  const filas = Math.ceil(files.length / COLS);
  const W = COLS * TILE, H = filas * FILA_H + 54;
  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#1c1c22"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff"; ctx.font = "bold 26px Segoe UI, Arial";
  ctx.fillText(`${ave.nombre} (${ave.id}) — elige cN`, 14, 36);

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const x = (i % COLS) * TILE, y = 54 + Math.floor(i / COLS) * FILA_H;
    try {
      const im = await loadImage(fs.readFileSync(path.join(carpeta, f)));
      const s = Math.min(TILE / im.width, TILE / im.height);
      const w = im.width * s, h = im.height * s;
      ctx.fillStyle = "#000"; ctx.fillRect(x, y, TILE, TILE);
      ctx.drawImage(im, x + (TILE - w) / 2, y + (TILE - h) / 2, w, h);
    } catch (e) {
      ctx.fillStyle = "#400"; ctx.fillRect(x, y, TILE, TILE);
    }
    const m = porArchivo[f] || {};
    ctx.fillStyle = "#f4d35e"; ctx.font = "bold 17px Segoe UI, Arial";
    ctx.fillText(f, x + 6, y + TILE + 19);
    ctx.fillStyle = "#ccc"; ctx.font = "13px Segoe UI, Arial";
    const lic = (m.licencia || "").slice(0, 14);
    ctx.fillText(lic, x + 60, y + TILE + 19);
    ctx.fillStyle = "#9ab"; ctx.font = "12px Segoe UI, Arial";
    ctx.fillText(String(m.titulo || "").slice(0, 44), x + 6, y + TILE + 38);
  }

  const dest = path.join(SALIDA, ave.id + ".png");
  fs.writeFileSync(dest, cv.toBuffer("image/png"));
  console.log("hoja:", dest, `(${files.length} candidatas)`);
}
console.log("listo");
