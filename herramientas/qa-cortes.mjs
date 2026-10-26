/* Hoja de QA de los cortes 2.5D: los 22 recortes RGBA sobre fondo de
   ajedrez (para ver transparencias) + patas en y=0.90 marcadas.
   Entrada: assets/ave-25d/<id>.png
   Salida:  herramientas/tmp_test/qa-cortes.png
   Uso:  node qa-cortes.mjs                                          */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createCanvas, loadImage } from "canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const DIR = path.join(raiz, "assets", "ave-25d");
const SALIDA = path.join(__dirname, "tmp_test", "qa-cortes.png");

function cargar(rel) {
  const src = fs.readFileSync(path.join(raiz, rel), "utf8");
  const win = {};
  new Function("window", src + "\n;return window;")(win);
  return win;
}
const AVES = cargar("js/datos.js").AVES;

const TILE = 220, FILA_H = TILE + 40, COLS = 6;
const filas = Math.ceil(AVES.length / COLS);
const W = COLS * TILE, H = filas * FILA_H + 46;
const cv = createCanvas(W, H);
const ctx = cv.getContext("2d");

/* fondo ajedrez */
for (let y = 0; y < H; y += 20)
  for (let x = 0; x < W; x += 20) {
    ctx.fillStyle = ((x / 20 + y / 20) % 2) ? "#3a3a44" : "#2a2a32";
    ctx.fillRect(x, y, 20, 20);
  }

ctx.fillStyle = "#fff"; ctx.font = "bold 24px Segoe UI, Arial";
ctx.fillText(`QA cortes 2.5D — ${AVES.length} especies (línea = patas en 0.90)`, 12, 32);

for (let i = 0; i < AVES.length; i++) {
  const ave = AVES[i];
  const x = (i % COLS) * TILE, y = 46 + Math.floor(i / COLS) * FILA_H;
  const archivo = path.join(DIR, ave.id + ".png");
  ctx.fillStyle = "#000a"; ctx.fillRect(x, y, TILE, TILE);
  if (fs.existsSync(archivo)) {
    const im = await loadImage(fs.readFileSync(archivo));
    const s = Math.min(TILE / im.width, TILE / im.height);
    const w = im.width * s, h = im.height * s;
    const dx = x + (TILE - w) / 2, dy = y + TILE - h; /* patas abajo */
    ctx.drawImage(im, dx, dy, w, h);
    ctx.strokeStyle = "#ff4d6d"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + TILE * 0.90); ctx.lineTo(x + TILE, y + TILE * 0.90);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#800"; ctx.fillRect(x, y, TILE, TILE);
  }
  ctx.fillStyle = "#f4d35e"; ctx.font = "bold 15px Segoe UI, Arial";
  ctx.fillText(ave.id, x + 6, y + TILE + 18);
}

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
fs.writeFileSync(SALIDA, cv.toBuffer("image/png"));
console.log("hoja:", SALIDA);
