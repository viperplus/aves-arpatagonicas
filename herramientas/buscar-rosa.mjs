/* Busca cúmulos de píxeles rosa/naranja saturados en las capturas de QA.
   Uso: node buscar-rosa.mjs [archivo.png ...]  (sin args: todos los 0*.png) */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadImage, createCanvas } from "canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmp = path.join(__dirname, "tmp_test");

function esRosa(r, g, b) {
  return r > 150 && r - g > 45 && b - g > 15 && b > 90;
}
function esNaranja(r, g, b) {
  return r > 170 && r - g > 60 && g - b > 40 && r - b > 90;
}

async function analizar(ruta) {
  const im = await loadImage(fs.readFileSync(ruta));
  const cv = createCanvas(im.width, im.height);
  const ctx = cv.getContext("2d");
  ctx.drawImage(im, 0, 0);
  const d = ctx.getImageData(0, 0, im.width, im.height).data;
  const paso = 24;                     /* celda de agrupacion */
  const cols = Math.ceil(im.width / paso);
  const filas = Math.ceil(im.height / paso);
  const celdas = [];
  for (let fy = 0; fy < filas; fy++) {
    for (let fx = 0; fx < cols; fx++) {
      let nR = 0, nN = 0, sr = 0, sg = 0, sb = 0, n = 0;
      for (let y = fy * paso; y < Math.min((fy + 1) * paso, im.height); y += 2) {
        for (let x = fx * paso; x < Math.min((fx + 1) * paso, im.width); x += 2) {
          const i = (y * im.width + x) * 4;
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const esR = esRosa(r, g, b), esN = esNaranja(r, g, b);
          if (esR || esN) {
            n++;
            if (esR) nR++;
            if (esN) nN++;
            sr += r; sg += g; sb += b;
          }
        }
      }
      const total = Math.ceil(paso / 2) * Math.ceil(paso / 2);
      if (n > total * 0.35) {
        celdas.push({
          x: fx * paso, y: fy * paso,
          tipo: nR > nN ? "rosa" : "naranja",
          pct: Math.round(100 * n / total),
          rgb: `${Math.round(sr / n)},${Math.round(sg / n)},${Math.round(sb / n)}`
        });
      }
    }
  }
  console.log(`\n== ${path.basename(ruta)} (${im.width}x${im.height}) ==`);
  if (!celdas.length) return;
  /* agrupar celdas vecinas en bounding boxes */
  const grupos = [];
  for (const c of celdas) {
    let g = grupos.find(g =>
      Math.abs(g.x0 - c.x) < paso * 3 && Math.abs(g.y0 - c.y) < paso * 3 &&
      Math.abs(g.x1 - c.x) < paso * 3 && Math.abs(g.y1 - c.y) < paso * 3);
    if (!g) { grupos.push({ x0: c.x, y0: c.y, x1: c.x + paso, y1: c.y + paso, n: 1, tipo: c.tipo, rgb: c.rgb }); }
    else {
      g.x0 = Math.min(g.x0, c.x); g.y0 = Math.min(g.y0, c.y);
      g.x1 = Math.max(g.x1, c.x + paso); g.y1 = Math.max(g.y1, c.y + paso);
      g.n++; g.tipo = c.tipo; g.rgb = c.rgb;
    }
  }
  for (const g of grupos) {
    console.log(`  ${g.tipo} ~(${g.rgb}) x:${g.x0}-${g.x1} y:${g.y0}-${g.y1} (${g.n} celdas)`);
  }
}

const args = process.argv.slice(2);
const archivos = args.length ? args
  : fs.readdirSync(tmp).filter(f => /^0\d.*\.png$/.test(f)).sort()
      .map(f => path.join(tmp, f));
for (const a of archivos) await analizar(a);
