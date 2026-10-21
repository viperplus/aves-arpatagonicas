/* Verifica que el Y4M tenga el balanceo esperado: centroide de la tarjeta. */
import fs from "fs";
import os from "os";
import path from "path";

const archivo = path.join(os.tmpdir(), "aves_temblor.y4m");
const buf = fs.readFileSync(archivo);

let p = 0;
const finCabecera = buf.indexOf(0x0A);
const cab = buf.subarray(0, finCabecera).toString();
const m = /W(\d+) H(\d+)/.exec(cab);
const W = +m[1], H = +m[2];
p = finCabecera + 1;

const centroides = [];
let frame = 0;
while (p < buf.length) {
  const finFrame = buf.indexOf(0x0A, p);
  const cabFrame = buf.subarray(p, finFrame).toString();
  if (!cabFrame.startsWith("FRAME")) break;
  p = finFrame + 1;
  const y = buf.subarray(p, p + W * H);
  p += W * H;
  p += W * H / 4;   /* U */
  p += W * H / 4;   /* V */

  let sx = 0, sy = 0, n = 0;
  for (let yy = 0; yy < H; yy += 2) {
    for (let xx = 0; xx < W; xx += 2) {
      const v = y[yy * W + xx];
      if (Math.abs(v - 74) > 18) { sx += xx; sy += yy; n++; }
    }
  }
  if (n > 50) centroides.push([+(sx / n).toFixed(1), +(sy / n).toFixed(1)]);
  frame++;
}

const xs = centroides.map(c => c[0]), ys = centroides.map(c => c[1]);
console.log("frames:", frame, "| centroides:", centroides.length);
console.log("x rango:", Math.min(...xs), "..", Math.max(...xs), " (amplitud", (Math.max(...xs) - Math.min(...xs)).toFixed(1), "px)");
console.log("y rango:", Math.min(...ys), "..", Math.max(...ys), " (amplitud", (Math.max(...ys) - Math.min(...ys)).toFixed(1), "px)");
console.log("primeros 12:", centroides.slice(0, 12).map(c => c.join(",")).join("  "));
