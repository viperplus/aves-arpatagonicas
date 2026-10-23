/* Caza el "cuadrado rosa o naranja": captura el AR con las especies de
   colores (flamenco, loica) + demo de todas + estado sin deteccion, y
   escanea cada captura por cúmulos rosa/naranja saturados.
   Uso: node probar-especies.mjs */
import http from "http";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";
import { createCanvas, loadImage } from "canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const tmp = path.join(__dirname, "tmp_test");
fs.mkdirSync(tmp, { recursive: true });

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml",
  ".mind": "application/octet-stream", ".json": "application/json",
  ".md": "text/plain; charset=utf-8", ".webm": "video/webm", ".mp4": "video/mp4",
  ".y4m": "video/x-yuv4mpeg"
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
  ctx.fillStyle = "#4a4a4a";
  ctx.fillRect(0, 0, W, H);
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

/* -------- escaneo de píxeles (mismo criterio que buscar-rosa.mjs) -------- */
function esRosa(r, g, b) { return r > 150 && r - g > 45 && b - g > 15 && b > 90; }
function esNaranja(r, g, b) { return r > 170 && r - g > 60 && g - b > 40 && r - b > 90; }
async function escanear(ruta) {
  const im = await loadImage(fs.readFileSync(ruta));
  const cv = createCanvas(im.width, im.height);
  const ctx = cv.getContext("2d");
  ctx.drawImage(im, 0, 0);
  const d = ctx.getImageData(0, 0, im.width, im.height).data;
  const paso = 24;
  let hits = 0, detalle = [];
  for (let fy = 0; fy < Math.ceil(im.height / paso); fy++) {
    for (let fx = 0; fx < Math.ceil(im.width / paso); fx++) {
      let n = 0, sr = 0, sg = 0, sb = 0;
      for (let y = fy * paso; y < Math.min((fy + 1) * paso, im.height); y += 2)
        for (let x = fx * paso; x < Math.min((fx + 1) * paso, im.width); x += 2) {
          const i = (y * im.width + x) * 4;
          const r = d[i], g = d[i + 1], b = d[i + 2];
          if (esRosa(r, g, b) || esNaranja(r, g, b)) { n++; sr += r; sg += g; sb += b; }
        }
      const total = 144;
      if (n > total * 0.35) {
        hits++;
        if (detalle.length < 12)
          detalle.push(`x${fx * paso},y${fy * paso}:~(${Math.round(sr / n)},${Math.round(sg / n)},${Math.round(sb / n)})`);
      }
    }
  }
  console.log(`   escaneo ${path.basename(ruta)}: ${hits} celdas calientes${hits ? " -> " + detalle.join(" | ") : ""}`);
  return hits;
}

function buscarEdge() {
  return ["C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"].find(p => fs.existsSync(p));
}

async function main() {
  const puerto = 8812;
  await new Promise(r => servidor.listen(puerto, "127.0.0.1", r));
  const base = `http://localhost:${puerto}`;
  const y4m = await camaraFalsa("flamenco");
  const browser = await puppeteer.launch({
    executablePath: buscarEdge(), headless: true,
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
      `--use-file-for-fake-video-capture=${y4m}`, "--autoplay-policy=no-user-gesture-required",
      "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader",
      "--ignore-gpu-blocklist", "--window-size=1100,800"]
  });
  await browser.defaultBrowserContext().overridePermissions(base, ["camera"]);

  /* --- 1. demo de todas las especies --- */
  console.log("[1] demo · todas las especies");
  let page = await browser.newPage();
  await page.setViewport({ width: 420, height: 820, deviceScaleFactor: 2 });
  await page.goto(base + "/ar.html", { waitUntil: "load", timeout: 40000 });
  await page.waitForFunction(() => { const s = document.getElementById("escena"); return s && s.hasLoaded; }, { timeout: 30000 }).catch(() => {});
  await page.click("#btn-demo");
  await new Promise(r => setTimeout(r, 900));
  const especies = await page.$$eval("#demo-chips .chip", els => els.map(e => e.textContent.trim()));
  for (let i = 0; i < especies.length; i++) {
    const chips = await page.$$("#demo-chips .chip");
    await chips[i].click();
    await new Promise(r => setTimeout(r, 500));
    const ruta = path.join(tmp, `d-demo-${i}.png`);
    await page.screenshot({ path: ruta });
    const h = await escanear(ruta);
    if (h) console.log(`     ^ especie: ${especies[i]}`);
  }

  /* --- 2. cámara encendida SIN deteccion (estado inicial) --- */
  console.log("[2] cámara · sin detección");
  await page.click("#demo-cerrar");
  await page.click("#btn-iniciar");
  await page.waitForFunction(() => /Apunt/.test(document.getElementById("estado").textContent || ""), { timeout: 45000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 300));
  let ruta = path.join(tmp, "d-sin-deteccion.png");
  await page.screenshot({ path: ruta });
  await escanear(ruta);

  /* --- 3. detección de FLAMENCO (rosa) --- */
  console.log("[3] cámara · detección de flamenco");
  const detectado = await page.waitForFunction(() => {
    const f = document.getElementById("ficha");
    return f && !f.classList.contains("oculto") && document.getElementById("ficha-nombre").textContent.trim();
  }, { timeout: 60000 }).then(h => h.jsonValue()).catch(() => null);
  console.log("   detectado:", detectado || "NADA");
  await new Promise(r => setTimeout(r, 600));
  ruta = path.join(tmp, "d-deteccion-flamenco.png");
  await page.screenshot({ path: ruta });
  const h3 = await escanear(ruta);

  /* --- 4. estado de error de cámara (aviso rosa en intro) --- */
  console.log("[4] estado de error (aviso)");
  await page.evaluate(() => {
    document.getElementById("hud").classList.add("oculto");
    const a = document.getElementById("aviso-error");
    a.textContent = "No se pudo abrir la cámara (permiso denegado o navegador sin soporte).";
    a.classList.remove("oculto");
    document.getElementById("intro").classList.remove("oculto");
  });
  await new Promise(r => setTimeout(r, 300));
  ruta = path.join(tmp, "d-error.png");
  await page.screenshot({ path: ruta });
  await escanear(ruta);

  await browser.close();
  servidor.close();
  console.log("fin");
}
main().catch(e => { console.error("ERROR:", e); try { servidor.close(); } catch (_) {} process.exit(2); });
