/* Genera las tarjetas impresas (PNG) a partir de datos.js + aves-svg.js.
   Uso: node herramientas/generar-tarjetas.mjs
   Requiere Microsoft Edge instalado (viene con Windows 10/11). */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = join(__dirname, "..");

/* cargamos datos.js y aves-svg.js (usan window/globalThis) */
globalThis.window = globalThis;
require(join(raiz, "js", "datos.js"));
require(join(raiz, "js", "aves-svg.js"));
const AVES = globalThis.window.AVES;
const { aveSVG } = globalThis.window.AvesSVG;

const ANCHO = 1000;   /* px de la tarjeta */
const ALTO = 1414;    /* proporción A4 */

function htmlTarjeta(ave) {
  const svg = aveSVG(ave, { width: 560, height: 560, colorFondo: "#f6efdf" });
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${ave.nombre}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${ANCHO}px; height:${ALTO}px; }
  body {
    font-family: "Segoe UI", Arial, sans-serif;
    background: #f6efdf;
    color: #2b2418;
    position: relative;
    overflow: hidden;
  }
  /* borde doble decorativo */
  .marco {
    position:absolute; inset:26px;
    border:6px solid ${ave.color};
    border-radius: 26px;
  }
  .marco-int {
    position:absolute; inset:40px;
    border:2px solid ${ave.color};
    border-radius: 18px;
    opacity:.55;
  }
  /* puntos decorativos (ayudan al reconocimiento) */
  .puntos {
    position:absolute; inset:52px;
    border-radius:14px;
    background-image:
      radial-gradient(${ave.color} 1.6px, transparent 1.7px);
    background-size: 26px 26px;
    opacity:.13;
  }
  .cabecera {
    position:relative;
    text-align:center;
    padding: 62px 70px 0;
  }
  .grupo {
    display:inline-block;
    background:${ave.color};
    color:#fff;
    font-size:27px;
    font-weight:700;
    letter-spacing:2px;
    text-transform:uppercase;
    padding:9px 26px;
    border-radius:999px;
  }
  h1 {
    font-size: 80px;
    margin-top: 18px;
    line-height:1.02;
    letter-spacing:-1px;
  }
  .cientifico {
    font-style: italic;
    font-size: 34px;
    color:#6b5b43;
    margin-top: 8px;
  }
  .ilustracion {
    position:relative;
    text-align:center;
    margin-top: 8px;
  }
  .ficha {
    position:relative;
    margin: 4px 74px 0;
    background: #fffdf7;
    border:3px solid ${ave.color};
    border-radius: 20px;
    padding: 20px 28px;
  }
  .fila { display:flex; gap:18px; margin-bottom:12px; align-items:flex-start; }
  .fila:last-child { margin-bottom:0; }
  .etiqueta {
    flex: 0 0 200px;
    font-weight:700;
    font-size:26px;
    text-transform:uppercase;
    letter-spacing:1px;
    color:${ave.color};
    line-height:1.2;
  }
  .valor { font-size:28px; line-height:1.22; color:#2b2418; }
  .dato {
    position:relative;
    margin: 18px 74px 0;
    background: ${ave.color};
    color:#fff;
    border-radius: 20px;
    padding: 20px 28px;
  }
  .dato .etiqueta2 {
    font-size:23px; font-weight:800; letter-spacing:2px; text-transform:uppercase; opacity:.9;
  }
  .dato .texto { font-size:27px; line-height:1.26; margin-top:7px; }
  .pie {
    position:relative;
    margin: 18px 74px 0;
    text-align:center;
    font-size:24px; color:#6b5b43;
  }
  .pie .app { font-weight:700; color:${ave.color}; }
</style>
</head>
<body>
  <div class="marco"></div>
  <div class="marco-int"></div>
  <div class="puntos"></div>

  <div class="cabecera">
    <span class="grupo">${ave.grupo}</span>
    <h1>${ave.nombre}</h1>
    <div class="cientifico">${ave.cientifico}</div>
  </div>

  <div class="ilustracion">${svg}</div>

  <div class="ficha">
    <div class="fila"><div class="etiqueta">Tamaño</div><div class="valor">${ave.tamano}</div></div>
    <div class="fila"><div class="etiqueta">Alimentación</div><div class="valor">${ave.alimento}</div></div>
    <div class="fila"><div class="etiqueta">Hábitat</div><div class="valor">${ave.habitat}</div></div>
    <div class="fila"><div class="etiqueta">Dónde verla</div><div class="valor">${ave.donde}</div></div>
  </div>

  <div class="dato">
    <div class="etiqueta2">Dato curioso</div>
    <div class="texto">${ave.dato}</div>
  </div>

  <div class="pie">Apuntá la cámara de la app <span class="app">Aves de la Patagonia</span> a esta tarjeta</div>
</body>
</html>`;
}

const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
];
const edge = edgeCandidates.find((p) => existsSync(p));
if (!edge) {
  console.error("No encontré Microsoft Edge.");
  process.exit(1);
}

const dirTmp = join(raiz, "herramientas", "tmp_tarjetas");
mkdirSync(dirTmp, { recursive: true });
mkdirSync(join(raiz, "tarjetas"), { recursive: true });

for (const ave of AVES) {
  const htmlPath = join(dirTmp, `${ave.id}.html`);
  const pngPath = join(raiz, "tarjetas", `${ave.id}.png`);
  writeFileSync(htmlPath, htmlTarjeta(ave), "utf8");

  execFileSync(edge, [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${ANCHO},${ALTO}`,
    `--screenshot=${pngPath}`,
    `file:///${htmlPath.replace(/\\/g, "/")}`
  ], { stdio: "ignore", timeout: 60000 });

  console.log("OK", ave.id);
}

console.log("Listo: 9 tarjetas en /tarjetas");
