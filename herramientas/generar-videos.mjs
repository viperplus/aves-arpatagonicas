/* Genera un video corto en bucle (6 s) de cada ave 2.5D para las fichas del index.
   Graba desde herramientas/video-ave.html con MediaRecorder (canvas.captureStream).
   Salida: videos/<id>.mp4|webm  +  js/videos.js (window.VIDEOS = {id: [archivo]})
   Uso:  node generar-videos.mjs                 -> todas las especies
         node generar-videos.mjs chimango loica  -> solo esas                 */

const solo = process.argv.slice(2);

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const tmp = path.join(__dirname, "tmp_test");
const dirVideos = path.join(raiz, "videos");
fs.mkdirSync(tmp, { recursive: true });
fs.mkdirSync(dirVideos, { recursive: true });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webm": "video/webm",
  ".mp4": "video/mp4"
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

function leerManifiesto() {
  const f = path.join(raiz, "js", "videos.js");
  try {
    const txt = fs.readFileSync(f, "utf8");
    const m = txt.match(/window\.VIDEOS\s*=\s*(\{[\s\S]*\})\s*;/);
    if (m) return JSON.parse(m[1]);
  } catch (_) {}
  return {};
}

async function main() {
  const puerto = 8803;
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
      "--window-size=560,600"
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 512, height: 512 });
  const avisos = [];
  page.on("pageerror", e => avisos.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") avisos.push("console: " + m.text()); });

  await page.goto(base + "/herramientas/video-ave.html", { waitUntil: "networkidle0", timeout: 40000 });
  const aves = await page.evaluate(() => AVES.map(a => ({ id: a.id, nombre: a.nombre })));
  const lista = solo.length ? aves.filter(a => solo.includes(a.id)) : aves;
  if (!lista.length) throw new Error("especies no encontradas: " + solo.join(", "));

  const manifiesto = leerManifiesto();
  const fallos = [];

  for (const ave of lista) {
    const t0 = Date.now();
    await page.goto(base + "/herramientas/video-ave.html?ave=" + ave.id,
      { waitUntil: "networkidle0", timeout: 40000 });
    const ok = await page.waitForFunction(
      () => window.__listo,
      { timeout: 30000 }).then(() => true).catch(() => false);
    if (!ok) { fallos.push(ave.id + ": el corte no cargo"); continue; }

    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(tmp, `video-${ave.id}.png`) });

    const r = await page.evaluate(() => window.__grabar());
    if (r && r.error) { fallos.push(ave.id + ": " + r.error); continue; }

    const ext = (r.mime || "").includes("mp4") ? "mp4" : "webm";
    const nombre = `${ave.id}.${ext}`;
    fs.writeFileSync(path.join(dirVideos, nombre), Buffer.from(r.datos, "base64"));
    const kb = Math.round(fs.statSync(path.join(dirVideos, nombre)).size / 1024);
    manifiesto[ave.id] = [nombre];
    console.log(`ok  ${ave.id.padEnd(10)} -> videos/${nombre}  ${kb} KB  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  }

  fs.writeFileSync(path.join(raiz, "js", "videos.js"),
    "/* Generado por herramientas/generar-videos.mjs — archivo por especie */\n" +
    "window.VIDEOS = " + JSON.stringify(manifiesto, null, 2) + ";\n");

  await browser.close();
  servidor.close();

  const n = Object.keys(manifiesto).length;
  console.log(`\nmanifiesto: js/videos.js (${n} especies)`);
  if (avisos.length) { console.log("avisos de consola:"); avisos.slice(0, 8).forEach(a => console.log("  " + a)); }
  if (fallos.length) { fallos.forEach(f => console.log("FALLO " + f)); }
  process.exit(fallos.length ? 1 : 0);
}

main().catch(e => {
  console.error("ERROR:", e);
  try { servidor.close(); } catch (_) {}
  process.exit(2);
});
