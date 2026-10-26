/* Prueba de humo en navegador:
   1. levanta un servidor local del proyecto
   2. carga index, tarjetas y ar.html (modo demo)
   3. abre ar.html con cámara falsa (archivo Y4M = foto de una tarjeta)
      y comprueba que MindAR detecta la tarjeta y se muestra la ficha
   Uso:  node test-navegador.mjs                                   */

import http from "http";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import puppeteer from "puppeteer-core";
import { createCanvas, loadImage } from "canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const tmp = path.join(__dirname, "tmp_test");
fs.mkdirSync(tmp, { recursive: true });

/* cantidad de especies = la lista de datos.js (fuente única) */
const requireCJS = createRequire(import.meta.url);
globalThis.window = globalThis;
requireCJS(path.join(raiz, "js", "datos.js"));
const N = globalThis.window.AVES.length;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mind": "application/octet-stream",
  ".json": "application/json",
  ".md": "text/plain; charset=utf-8",
  ".webm": "video/webm",
  ".mp4": "video/mp4"
};

let fallos = 0;
function check(cond, msg) {
  console.log((cond ? "  PASS  " : "  FAIL  ") + msg);
  if (!cond) fallos++;
}

/* ---------------- servidor local ---------------- */
const servidor = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]) || "/index.html";
  const archivo = path.normalize(path.join(raiz, rel === "/" ? "/index.html" : rel));
  if (!archivo.startsWith(raiz)) { res.writeHead(403); return res.end(); }
  fs.readFile(archivo, (err, data) => {
    if (err) { res.writeHead(404); return res.end("no encontrado"); }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(archivo).toLowerCase()] || "application/octet-stream"
    });
    res.end(data);
  });
});

/* ---------------- cámara falsa (Y4M) ---------------- */
async function generarCamaraFalsa() {
  const W = 640, H = 480;
  /* ojo: `canvas` no abre rutas con "°" en Windows -> pasamos el buffer */
  const tarjeta = await loadImage(fs.readFileSync(path.join(raiz, "tarjetas", "chimango.png")));
  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#4a4a4a";
  ctx.fillRect(0, 0, W, H);
  const h = H * 0.84;
  const w = h * tarjeta.width / tarjeta.height;
  ctx.drawImage(tarjeta, (W - w) / 2, (H - h) / 2, w, h);
  const d = ctx.getImageData(0, 0, W, H).data;

  const yBuf = Buffer.alloc(W * H);
  const uAcc = new Float64Array((W / 2) * (H / 2));
  const vAcc = new Float64Array((W / 2) * (H / 2));
  const cnt = new Uint16Array((W / 2) * (H / 2));
  /* YUV4MPEG sin tag de colorspace = BT.601 rango limitado (16-235 / 16-240):
     hay que codificar en limitado o el decoder recolorea (tarjeta lavada). */
  const cl = v => v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
  const limY = yf => 16 + yf * 219 / 255;
  const limC = c => 128 + c * 224 / 255;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      yBuf[y * W + x] = cl(limY(0.299 * r + 0.587 * g + 0.114 * b));
      const ci = (y >> 1) * (W >> 1) + (x >> 1);
      uAcc[ci] += -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
      vAcc[ci] += 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
      cnt[ci]++;
    }
  }
  const uBuf = Buffer.alloc(W * H / 4);
  const vBuf = Buffer.alloc(W * H / 4);
  for (let i = 0; i < uBuf.length; i++) {
    uBuf[i] = cl(limC(uAcc[i] / cnt[i] - 128));
    vBuf[i] = cl(limC(vAcc[i] / cnt[i] - 128));
  }

  const partes = [Buffer.from(`YUV4MPEG2 W${W} H${H} F15:1 Ip A1:1 C420jpeg\n`)];
  const marco = Buffer.from("FRAME\n");
  for (let f = 0; f < 30; f++) partes.push(marco, yBuf, uBuf, vBuf);
  const destino = path.join(os.tmpdir(), "aves_camara.y4m");
  fs.writeFileSync(destino, Buffer.concat(partes));
  return destino;
}

function buscarEdge() {
  const c = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
  return c.find(p => fs.existsSync(p));
}

/* ---------------- helpers ---------------- */
function capturar(page) {
  const errs = [];
  page.on("pageerror", e => errs.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });
  return errs;
}

/* ---------------- prueba ---------------- */
async function main() {
  const puerto = 8799;
  await new Promise(r => servidor.listen(puerto, "127.0.0.1", r));
  const base = `http://localhost:${puerto}`;
  const edge = buscarEdge();
  if (!edge) throw new Error("No se encontro Edge instalado");

  const y4m = await generarCamaraFalsa();
  console.log("Y4M:", y4m, (fs.statSync(y4m).size / 1048576).toFixed(1) + " MB");

  const browser = await puppeteer.launch({
    executablePath: edge,
    headless: true,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-video-capture=${y4m}`,
      "--autoplay-policy=no-user-gesture-required",
      "--enable-unsafe-swiftshader",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--ignore-gpu-blocklist",
      "--window-size=1100,800"
    ]
  });
  await browser.defaultBrowserContext().overridePermissions(base, ["camera"]);

  /* ---- 1. portada ---- */
  console.log("\n[1] index.html");
  let page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  let errs = capturar(page);
  await page.goto(base + "/index.html", { waitUntil: "networkidle0", timeout: 40000 });
  const fichas = await page.$$eval(".ficha-card", e => e.length);
  check(fichas === N, `se renderizan las ${N} fichas (${fichas})`);
  const vids = await page.$$eval(".arte-video", e => e.length);
  check(vids === N, `las ${N} fichas tienen video (${vids})`);
  await page.waitForFunction((n) => {
    const vs = document.querySelectorAll(".arte-video");
    return vs.length === n && [...vs].every(v => v.classList.contains("listo"));
  }, { timeout: 20000 }, N).catch(() => {});
  const listos = await page.$$eval(".arte-video", e => e.filter(v => v.classList.contains("listo")).length);
  check(listos === N, `los ${N} videos cargan y reproducen (${listos})`);
  const cantos = await page.evaluate(async () => {
    const ids = Object.keys(window.CANTOS || {});
    const ok = await Promise.all(ids.map(id =>
      fetch("sonidos/" + window.CANTOS[id].archivo).then(r => r.ok).catch(() => false)));
    return { n: ids.length, ok: ok.filter(Boolean).length };
  });
  check(cantos.n === N && cantos.ok === N,
    `los ${N} cantos disponibles (${cantos.ok}/${cantos.n} responden)`);
  const botones = await page.$$eval(".btn-canto", e => e.length);
  check(botones === N, `las ${N} fichas tienen boton de canto (${botones})`);
  const fotos = await page.evaluate(async () => {
    const ids = Object.keys(window.FOTOS || {});
    const ok = await Promise.all(ids.map(id =>
      fetch("assets/ave-25d/" + id + ".png").then(r => r.ok).catch(() => false)));
    return { n: ids.length, ok: ok.filter(Boolean).length };
  });
  check(fotos.n === N && fotos.ok === N,
    `las ${N} fotos reales con credito responden (${fotos.ok}/${fotos.n})`);
  const creditos = await page.$$eval(".creditos", e => e.length);
  check(creditos === 2, `el pie lista fotos y cantos con credito (${creditos} listas)`);
  check(errs.length === 0, `sin errores JS (${errs.length})${errs[0] ? " -> " + errs[0] : ""}`);
  await page.screenshot({ path: path.join(tmp, "01-index.png"), fullPage: true });

  /* ---- 2. hoja de impresion ---- */
  console.log("\n[2] tarjetas.html");
  errs = capturar(page);
  await page.goto(base + "/tarjetas.html", { waitUntil: "networkidle0", timeout: 40000 });
  await page.waitForFunction((n) => {
    const im = document.querySelectorAll(".tarjeta-impresion img");
    return im.length === n && [...im].every(i => i.complete && i.naturalWidth > 0);
  }, { timeout: 20000 }, N).catch(() => {});
  const imgs = await page.$$eval(".tarjeta-impresion img",
    els => els.filter(e => e.complete && e.naturalWidth > 0).length);
  check(imgs === N, `las ${N} tarjetas PNG cargan (${imgs})`);
  check(errs.length === 0, `sin errores JS (${errs.length})${errs[0] ? " -> " + errs[0] : ""}`);
  await page.close();

  /* ---- 3. visor AR en modo demo ---- */
  console.log("\n[3] ar.html · modo demo (sin camara)");
  page = await browser.newPage();
  await page.setViewport({ width: 420, height: 820, deviceScaleFactor: 2 });
  errs = capturar(page);
  await page.goto(base + "/ar.html", { waitUntil: "load", timeout: 40000 });
  await page.waitForFunction(
    () => { const s = document.getElementById("escena"); return s && s.hasLoaded; },
    { timeout: 30000 }
  ).catch(() => {});
  const webgl = await page.evaluate(() =>
    !!document.createElement("canvas").getContext("webgl2"));
  check(webgl, "WebGL2 disponible en headless");

  await page.click("#btn-demo");
  await page.waitForFunction(
    () => !document.getElementById("demo").classList.contains("oculto"),
    { timeout: 10000 }).catch(() => {});
  let n = await page.$$eval("[corte-vivo]",
    els => els.length ? els[0].children.length : -1);
  check(n > 0, `el ave 2.5D se crea en el modo demo (hijos=${n})`);
  let nombre = await page.$eval("#ficha-nombre", e => e.textContent.trim());
  check(nombre.length > 0, `se muestra la ficha (${nombre})`);
  await page.screenshot({ path: path.join(tmp, "02-demo.png") });

  const chips = await page.$$("#demo-chips .chip");
  check(chips.length === N, `hay ${N} chips para cambiar de especie (${chips.length})`);
  if (chips[3]) {
    await chips[3].click();
    const n2 = await page.$eval("#ficha-nombre", e => e.textContent.trim());
    check(n2 !== nombre && n2.length > 0, `cambia de especie (${nombre} -> ${n2})`);
  }
  const mudo0 = await page.$eval("#btn-muto-demo", b => b.textContent.trim());
  await page.click("#btn-muto-demo");
  const mudo1 = await page.$eval("#btn-muto-demo", b => b.textContent.trim());
  check(mudo0 !== mudo1, `el boton de silencio alterna (${mudo0} -> ${mudo1})`);
  await page.click("#btn-muto-demo");
  await page.click("#demo-cerrar");
  const introVisible = await page.$eval("#intro", e => !e.classList.contains("oculto"));
  check(introVisible, "cierra la demo y vuelve a la pantalla inicial");
  check(errs.length === 0, `sin errores JS (${errs.length})${errs[0] ? " -> " + errs[0] : ""}`);

  /* ---- 4. visor AR con camara falsa: deteccion real ---- */
  console.log("\n[4] ar.html · camara falsa + deteccion de la tarjeta");
  errs = capturar(page);
  await page.click("#btn-iniciar");

  const arListo = await page.waitForFunction(
    () => { const e = document.getElementById("estado");
            return e && /Apunt/.test(e.textContent) ? true : false; },
    { timeout: 45000 }).then(() => true).catch(() => false);
  check(arListo, "MindAR quedo listo (evento arReady)");

  const detectado = await page.waitForFunction(() => {
    const f = document.getElementById("ficha");
    if (f && !f.classList.contains("oculto")) {
      const t = document.getElementById("ficha-nombre").textContent.trim();
      if (t) return t;
    }
    return false;
  }, { timeout: 60000 }).then(h => h.jsonValue()).catch(() => null);

  check(!!detectado, `tarjeta detectada con la camara falsa (${detectado || "nada"})`);
  if (detectado) {
    await new Promise(r => setTimeout(r, 400));
    const suena = await page.evaluate(() =>
      window.Cantos ? window.Cantos.sonando() : null);
    check(suena === "chimango",
      `suena el canto de la especie detectada (${suena || "silencio"})`);
  } else {
    check(false, "suena el canto de la especie detectada (no hubo deteccion)");
  }
  await page.screenshot({ path: path.join(tmp, "03-deteccion.png") });

  const aviso = await page.$eval("#aviso-error", e =>
    e.classList.contains("oculto") ? "" : e.textContent.trim());
  if (!detectado && aviso) console.log("  aviso de error:", aviso);
  check(errs.length === 0, `sin errores JS (${errs.length})${errs[0] ? " -> " + errs[0] : ""}`);
  await page.close();

  await browser.close();
  servidor.close();

  console.log("\n" + (fallos ? `RESULTADO: ${fallos} comprobacion(es) fallaron` : "RESULTADO: todo OK"));
  console.log("capturas en:", tmp);
  process.exit(fallos ? 1 : 0);
}

main().catch(e => {
  console.error("ERROR:", e);
  try { servidor.close(); } catch (_) {}
  process.exit(2);
});
