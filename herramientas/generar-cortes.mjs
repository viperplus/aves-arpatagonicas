/* Genera los cortes PNG con transparencia de cada ave (para la vista 2.5D).
   Renderiza la ilustración SVG de aves-svg.js sin fondo ni sombra a 800x800.
   Salida: assets/ave-25d/<id>.png
   Uso:  node generar-cortes.mjs */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const dirSalida = path.join(raiz, "assets", "ave-25d");
fs.mkdirSync(dirSalida, { recursive: true });

/* cargamos datos.js y aves-svg.js como los usan las páginas (window + module) */
function cargar(rel) {
  const src = fs.readFileSync(path.join(raiz, rel), "utf8");
  const modulo = { exports: {} };
  const win = {};
  new Function("module", "exports", "window", src + "\n;return window;")(modulo, modulo.exports, win);
  return { win, exports: modulo.exports };
}

const datos = cargar("js/datos.js").win;
const svg = cargar("js/aves-svg.js").exports;
const AVES = datos.AVES;

async function main() {
  const edge = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ].find(p => fs.existsSync(p));
  if (!edge) throw new Error("No se encontro Edge instalado");

  const browser = await puppeteer.launch({
    executablePath: edge, headless: true,
    args: ["--window-size=860,860", "--force-device-scale-factor=1"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 800 });

  for (const ave of AVES) {
    /* viewBox 400 -> 800 px; sin fondo, sin sombra (la sombra la pone la escena) */
    const s = svg.aveSVG(ave, { width: 800, height: 800, fondo: false, sombra: false });
    await page.setContent(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
      "html,body{margin:0;padding:0;background:transparent;overflow:hidden}" +
      "svg{display:block}" +
      "</style></head><body>" + s + "</body></html>",
      { waitUntil: "load" }
    );
    const out = path.join(dirSalida, ave.id + ".png");
    await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: 800, height: 800 } });
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`ok  ${ave.id.padEnd(10)} -> assets/ave-25d/${ave.id}.png  ${kb} KB`);
  }

  await browser.close();
}

main().catch(e => { console.error("ERROR:", e); process.exit(1); });
