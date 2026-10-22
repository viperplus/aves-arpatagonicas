/* Muestrea color del panel vs tarjeta en 03-deteccion.png */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadImage, createCanvas } from "canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ruta = path.join(__dirname, "tmp_test", "03-deteccion.png");
/* ojo: canvas no abre rutas con "°" en Windows -> buffer */
const im = await loadImage(fs.readFileSync(ruta));
const cv = createCanvas(im.width, im.height);
const c = cv.getContext("2d");
c.drawImage(im, 0, 0);
const pts = {
  panel: [[160, 520], [160, 780], [660, 500], [300, 495]],
  fuera: [[100, 520], [100, 780], [740, 500], [300, 430], [500, 430]]
};
for (const k in pts) {
  const rs = pts[k].map(([x, y]) => {
    const d = c.getImageData(x, y, 8, 8).data;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4;
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  });
  console.log(k, JSON.stringify(rs));
}
