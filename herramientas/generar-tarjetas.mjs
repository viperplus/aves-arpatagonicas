/* Genera las tarjetas impresas (PNG) con las ilustraciones reales */
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
const AVES = globalThis.window.AVES;

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
    background: #f6efe2;
    color: #1a150b;
    position: relative;
    overflow: hidden;
  }
  .marco {
    position:absolute; inset:16px;
    border:6px solid ${ave.color};
    border-radius: 24px;
  }
  .marco-int {
    position:absolute; inset:28px;
    border:2px solid ${ave.color};
    border-radius: 16px;
    opacity:.4;
  }
  .cabecera {
    position:relative;
    text-align:center;
    padding: 38px 80px 0;
  }
  .grupo {
    display:inline-block;
    background:${ave.color};
    color:#fff;
    font-size:20px;
    font-weight:800;
    letter-spacing:4px;
    text-transform:uppercase;
    padding:6px 28px;
    border-radius:999px;
  }
  h1 {
    font-size: 78px;
    margin-top: 10px;
    line-height:0.95;
    letter-spacing:-2px;
  }
  .cientifico {
    font-style: italic;
    font-size: 30px;
    color:#5b4b2e;
    margin-top: 4px;
  }
  .ilustracion {
    position:relative;
    margin: 14px 80px 0;
    height: 620px;
    background: #ffffff;
    border: 3px solid ${ave.color};
    border-radius: 14px;
    overflow: hidden;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .ilustracion img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
    display:block;
  }
  .grid {
    position:relative;
    margin: 16px 80px 0;
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 18px;
  }
  .bloque {
    background:#fff;
    border:2px solid ${ave.color};
    border-radius: 12px;
    padding: 8px 16px;
  }
  .bloque.full { grid-column: 1 / -1; }
  .etiqueta {
    display:block;
    font-size:18px;
    font-weight:800;
    letter-spacing:2px;
    text-transform:uppercase;
    color:${ave.color};
    margin-bottom: 2px;
  }
  .valor {
    font-size:24px;
    line-height:1.24;
  }
  .dato {
    position:relative;
    margin: 14px 80px 0;
    background:#fff;
    border:2px solid ${ave.color};
    border-radius: 12px;
    padding: 10px 18px;
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

  <div class="ilustracion"><img src="${imgData}" alt="${ave.nombre}"></div>

  <div class="grid">
    <div class="bloque"><span class="etiqueta">Tamaño</span><span class="valor">${ave.tamano}</span></div>
    <div class="bloque"><span class="etiqueta">Hábitat</span><span class="valor">${ave.habitat}</span></div>
    <div class="bloque"><span class="etiqueta">Alimentación</span><span class="valor">${ave.alimento}</span></div>
    <div class="bloque"><span class="etiqueta">Dónde verla</span><span class="valor">${ave.donde}</span></div>
    <div class="bloque"><span class="etiqueta">Época</span><span class="valor">${ave.epoca || "Residente"}</span></div>
    <div class="bloque"><span class="etiqueta">Distribución</span><span class="valor">${ave.distribucion || "Argentina"}</span></div>
  </div>

  <div class="dato">
    <span class="etiqueta">Dato curioso</span>
    <div class="valor">${ave.dato}</div>
  </div>

</body>
</html>`;
}

function main() {
  mkdirSync(join(raiz, "tarjetas"), { recursive: true });
  const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge64 = "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe";
  const exe = existsSync(edge64) ? edge64 : edge;

  for (const ave of AVES) {
    const html = htmlTarjeta(ave);
    const tmp = join(raiz, "herramientas", `tmp_${ave.id}.html`);
    const out = join(raiz, "tarjetas", `${ave.id}.png`);
    writeFileSync(tmp, html, "utf8");
    try {
      execFileSync(exe, [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        `--window-size=${ANCHO},${ALTO}`,
        "--virtual-time-budget=6000",
        `--screenshot=${out}`,
        `file:///${tmp.replace(/\\/g, "/")}`
      ], { stdio: "ignore" });
      console.log("ok", ave.id);
    } catch (e) {
      console.log("ERR", ave.id);
    }
  }
  console.log("listo");
}

main();
