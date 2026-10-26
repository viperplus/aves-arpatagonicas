/* Exactitud de detección: repite N veces por especie con cámara falsa.
   Uso: node probar-deteccion.mjs [repeticiones] */
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
const repeticiones = parseInt(process.argv[2] || "3", 10);

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml",
  ".mind": "application/octet-stream", ".json": "application/json",
  ".md": "text/plain; charset=utf-8", ".webm": "video/webm", ".mp4": "video/mp4"
};
const servidor = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]) || "/index.html";
  const archivo = path.normalize(path.join(raiz, rel === "/" ? "/index.html" : rel));
  if (!archivo.startsWith(raiz)) { res.writeHead(403); return res.end(); }
  fs.readFile(archivo, (err, data) => {
    if (err) { res.writeHead(404); return res.end("no encontrado"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(archivo).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
});

async function camaraFalsa(especie) {
  const W = 640, H = 480;
  const tarjeta = await loadImage(fs.readFileSync(path.join(raiz, "tarjetas", especie + ".png")));
  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#4a4a4a"; ctx.fillRect(0, 0, W, H);
  const h = H * 0.84, w = h * tarjeta.width / tarjeta.height;
  ctx.drawImage(tarjeta, (W - w) / 2, (H - h) / 2, w, h);
  const d = ctx.getImageData(0, 0, W, H).data;
  const yBuf = Buffer.alloc(W * H);
  const uAcc = new Float64Array((W / 2) * (H / 2));
  const vAcc = new Float64Array((W / 2) * (H / 2));
  const cnt = new Uint16Array((W / 2) * (H / 2));
  const cl = v => v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
  const limY = yf => 16 + yf * 219 / 255;
  const limC = c => 128 + c * 224 / 255;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const r = d[i], g = d[i + 1], b = d[i + 2];
    yBuf[y * W + x] = cl(limY(0.299 * r + 0.587 * g + 0.114 * b));
    const ci = (y >> 1) * (W >> 1) + (x >> 1);
    uAcc[ci] += -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
    vAcc[ci] += 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
    cnt[ci]++;
  }
  const uBuf = Buffer.alloc(W * H / 4), vBuf = Buffer.alloc(W * H / 4);
  for (let i = 0; i < uBuf.length; i++) {
    uBuf[i] = cl(limC(uAcc[i] / cnt[i] - 128));
    vBuf[i] = cl(limC(vAcc[i] / cnt[i] - 128));
  }
  const partes = [Buffer.from(`YUV4MPEG2 W${W} H${H} F15:1 Ip A1:1 C420jpeg\n`)];
  const marco = Buffer.from("FRAME\n");
  for (let f = 0; f < 30; f++) partes.push(marco, yBuf, uBuf, vBuf);
  const destino = path.join(os.tmpdir(), `aves_${especie}.y4m`);
  fs.writeFileSync(destino, Buffer.concat(partes));
  return destino;
}

function buscarEdge() {
  return ["C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"].find(p => fs.existsSync(p));
}

const requireCJS = createRequire(import.meta.url);
globalThis.window = globalThis;
requireCJS(path.join(raiz, "js", "datos.js"));
const AVES = globalThis.window.AVES;

const especies = AVES.map(a => a.id);
const resumen = {};

async function main() {
  const puerto = 8813;
  await new Promise(r => servidor.listen(puerto, "127.0.0.1", r));
  const base = `http://localhost:${puerto}`;

  for (let r = 1; r <= repeticiones; r++) {
    for (const esp of especies) {
      const y4m = await camaraFalsa(esp);
      /* el flag del fake device se lee al lanzar: browser por especie */
      const browser = await puppeteer.launch({
        executablePath: buscarEdge(), headless: true,
        args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
          `--use-file-for-fake-video-capture=${y4m}`,
          "--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader",
          "--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist", "--window-size=1100,800"]
      });
      await browser.defaultBrowserContext().overridePermissions(base, ["camera"]);
      const page = await browser.newPage();
      await page.setViewport({ width: 420, height: 820, deviceScaleFactor: 2 });
      await page.goto(base + "/ar.html", { waitUntil: "load", timeout: 40000 }).catch(() => {});
      await page.waitForFunction(() => { const s = document.getElementById("escena"); return s && s.hasLoaded; }, { timeout: 30000 }).catch(() => {});
      await page.click("#btn-iniciar");
      const det = await page.waitForFunction(() => {
        const f = document.getElementById("ficha");
        return f && !f.classList.contains("oculto") && document.getElementById("ficha-nombre").textContent.trim();
      }, { timeout: 40000 }).then(h => h.jsonValue()).catch(() => null);
      (resumen[esp] = resumen[esp] || []).push(det || "SIN DETECCION");
      console.log(`  r${r} ${esp.padEnd(22)} -> ${det || "SIN DETECCION"}`);
      await browser.close();
      await new Promise(r2 => setTimeout(r2, 400));
    }
  }

  console.log("\nRESUMEN (esperado = nombre de la especie):");
  for (const esp of especies) {
    const lista = resumen[esp];
    const esperado = AVES.find(a => a.id === esp).nombre;
    const ok = lista.filter(x => x === esperado).length;
    console.log(`  ${esp}: ${ok}/${repeticiones} correctas -> [${lista.join(", ")}]`);
  }

  await servidor.close();
}
main().catch(e => { console.error("ERROR:", e); try { servidor.close(); } catch (_) {} process.exit(2); });
