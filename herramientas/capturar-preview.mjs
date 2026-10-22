/* Captura el preview de las 9 aves 3D (herramientas/preview.html)
   Uso:  node capturar-preview.mjs [id-ave]   ->  tmp_test/preview-aves.png
                                              ->  tmp_test/preview-<id>.png  */

const especie = process.argv[2] || null;

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const tmp = path.join(__dirname, "tmp_test");
fs.mkdirSync(tmp, { recursive: true });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".json": "application/json"
};

const servidor = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]) || "/index.html";
  const archivo = path.normalize(path.join(raiz, rel === "/" ? "/index.html" : rel));
  if (archivo.endsWith("favicon.ico")) { res.writeHead(204); return res.end(); }
  if (!archivo.startsWith(raiz)) { res.writeHead(403); return res.end(); }
  fs.readFile(archivo, (err, data) => {
    if (err) { res.writeHead(404); return res.end("no encontrado"); }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(archivo).toLowerCase()] || "application/octet-stream"
    });
    res.end(data);
  });
});

function buscarEdge() {
  const c = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
  return c.find(p => fs.existsSync(p));
}

async function main() {
  const puerto = 8802;
  await new Promise(r => servidor.listen(puerto, "127.0.0.1", r));
  const base = `http://localhost:${puerto}`;
  const edge = buscarEdge();
  if (!edge) throw new Error("No se encontro Edge instalado");

  const browser = await puppeteer.launch({
    executablePath: edge,
    headless: true,
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--enable-unsafe-swiftshader",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--ignore-gpu-blocklist",
      "--window-size=1200,900"
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  const errs = [];
  page.on("pageerror", e => errs.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });

  const url = base + "/herramientas/preview.html" +
    (especie ? "?ave=" + encodeURIComponent(especie) : "");
  await page.goto(url, { waitUntil: "networkidle0", timeout: 40000 });
  const ok = await page.waitForFunction(
    () => { const s = document.getElementById("escena"); return s && s.hasLoaded; },
    { timeout: 30000 }).then(() => true).catch(() => false);
  if (!ok) console.log("aviso: la escena no senalo hasLoaded");

  /* deja pasar unos frames para que el renderer dibuje todo */
  await new Promise(r => setTimeout(r, 2500));

  const n = await page.$$eval("#jaula > a-entity", e => e.length);
  const webgl = await page.evaluate(() =>
    !!document.createElement("canvas").getContext("webgl2"));

  const salida = path.join(tmp, especie ? `preview-${especie}.png` : "preview-aves.png");
  await page.screenshot({ path: salida });

  await browser.close();
  servidor.close();

  const esperado = especie ? 1 : 9;
  console.log(`aves en la jaula: ${n}/${esperado} | WebGL2: ${webgl} | errores: ${errs.length}`);
  errs.slice(0, 5).forEach(e => console.log("  " + e));
  console.log("captura:", salida);
  process.exit(errs.length || n !== esperado ? 1 : 0);
}

main().catch(e => {
  console.error("ERROR:", e);
  try { servidor.close(); } catch (_) {}
  process.exit(2);
});
