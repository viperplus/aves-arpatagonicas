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

globalThis.window = globalThis;
require(join(raiz, "js", "datos.js"));
require(join(raiz, "js", "aves-svg.js"));
const AVES = globalThis.window.AVES;
const { aveSVG } = globalThis.window.AvesSVG;

const ANCHO = 1000;
const ALTO = 1414;
const ILLUS_DIR = join(raiz, "assets", "ilustraciones");

function getIlustracion(ave) {
  const candidatos = [".jpg", ".jpeg", ".png"];
  for (const ext of candidatos) {
    const p = join(ILLUS_DIR, ave.id + ext);
    if (existsSync(p)) {
      const buf = readFileSync(p);
      const mime = ext === ".png" ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${buf.toString("base64")}`;
    }
  }
  return null;
}

function htmlTarjeta(ave) {
  const imgData = getIlustracion(ave);
  const estado = ave.estado || "Preocupación menor (LC)";
  const epoca = ave.epoca || "Residente.";
  const dist = ave.distribucion || "Argentina.";
  
  const ilustracionHtml = imgData 
    ? `<img src="${imgData}" alt="${ave.nombre}" />`
    : aveSVG(ave, { width: 520, height: 520, colorFondo: "#f6efdf" });
    
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
  /* marco fino para impresión */
  .marco {
    position:absolute; inset:18px;
    border:4px solid ${ave.color};
    border-radius: 28px;
  }
  .marco-int {
    position:absolute; inset:30px;
    border:1px solid ${ave.color};
    border-radius: 20px;
    opacity:.4;
  }
  .cabecera {
    position:relative;
    text-align:center;
    padding: 52px 70px 0;
  }
  .grupo {
    display:inline-block;
    background:${ave.color};
    color:#fff;
    font-size:22px;
    font-weight:700;
    letter-spacing:3px;
    text-transform:uppercase;
    padding:6px 22px;
    border-radius:999px;
  }
  h1 {
    font-size: 72px;
    margin-top: 12px;
    line-height:1.0;
    letter-spacing:-1px;
    color:#2b2418;
  }
  .cientifico {
    font-style: italic;
    font-size: 28px;
    color:#6b5b43;
    margin-top: 4px;
  }
  .ilustracion {
    position:relative;
    text-align:center;
    margin: 10px auto 0;
    width: 560px;
    height: 560px;
    background: #ffffff;
    border-radius: 16px;
    border: 2px solid ${ave.color};
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,.08);
  }
  .ilustracion img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    padding: 10px;
  }
  .ilustracion svg {
    display:block;
    width:520px;
    height:520px;
  }
  .badges {
    position:relative;
    margin: 14px 70px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  .badge {
    background: ${ave.color};
    color: #fff;
    font-size: 19px;
    font-weight: 600;
    padding: 6px 16px;
    border-radius: 999px;
    letter-spacing: .3px;
  }
  .badge.alt {
    background: transparent;
    color: ${ave.color};
    border: 1.5px solid ${ave.color};
  }
  .ficha {
    position:relative;
    margin: 14px 70px 0;
    background: #ffffff;
    border: 1.5px solid ${ave.color};
    border-radius: 14px;
    padding: 12px 20px;
  }
  .fila {
    display:flex;
    gap: 16px;
    margin-bottom: 6px;
    align-items: baseline;
  }
  .fila:last-child { margin-bottom:0; }
  .etiqueta {
    flex: 0 0 140px;
    font-weight: 700;
    font-size: 21px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: ${ave.color};
  }
  .valor {
    font-size: 23px;
    line-height: 1.25;
    color: #2b2418;
  }
  .dato {
    position:relative;
    margin: 12px 70px 0;
    background: #fff8f0;
    border-left: 4px solid ${ave.color};
    border-radius: 8px;
    padding: 12px 18px;
  }
  .dato .etiqueta2 {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    color: ${ave.color};
  }
  .dato .texto {
    font-size: 22px;
    line-height: 1.28;
    margin-top: 4px;
    color: #2b2418;
  }
  .pie {
    position:relative;
    margin: 14px 70px 0;
    text-align:center;
    font-size: 18px;
    color: #6b5b43;
    letter-spacing: .3px;
  }
</style>
</head>
<body>
  <div class="marco"></div>
  <div class="marco-int"></div>

  <div class="cabecera">
    <span class="grupo">${ave.grupo}</span>
    <h1>${ave.nombre}</h1>
    <div class="cientifico">${ave.cientifico}</div>
  </div>

  <div class="ilustracion">${ilustracionHtml}</div>

  <div class="badges">
    <span class="badge">TAMAÑO: ${ave.tamano}</span>
    <span class="badge alt">HÁBITAT: ${ave.habitat}</span>
    <span class="badge alt">ÉPOCA: ${ave.epoca || "Residente"}</span>
    <span class="badge alt">DISTRIBUCIÓN: ${ave.distribucion || "Argentina"}</span>
  </div>

  <div class="ficha">
    <div class="fila"><div class="etiqueta">Alimentación</div><div class="valor">${ave.alimento}</div></div>
    <div class="fila"><div class="etiqueta">Dónde verla</div><div class="valor">${ave.donde}</div></div>
    <div class="fila"><div class="etiqueta">Estado</div><div class="valor">${estado}</div></div>
  </div>

  <div class="dato">
    <div class="etiqueta2">Dato curioso</div>
    <div class="texto">${ave.dato}</div>
  </div>

  <div class="pie">Aves de la Patagonia · Guía de campo con RA</div>
</body>
</html>`;
}
