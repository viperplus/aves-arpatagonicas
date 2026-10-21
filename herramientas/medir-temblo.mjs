/* Mide el "temblor" del modelo sobre la tarjeta.

   Genera una cámara falsa (Y4M) donde la tarjeta se mueve con un balanceo
   lento + ruido frame a frame (mano temblorosa). Después abre ar.html,
   detecta la tarjeta y mide cuánto se mueve la matriz del ancla.

   Los resultados se imprimen y se guardan en JSON para comparar versiones.

   Uso:  node medir-temblo.mjs [salida.json]                              */

import http from "http";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";
import { createCanvas, loadImage } from "canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const salidaJson = process.argv[2] || path.join(__dirname, "tmp_test", "temblo.json");

/* RNG determinista para poder comparar entre corridas */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml",
  ".mind": "application/octet-stream", ".json": "application/json", ".md": "text/plain; charset=utf-8"
};

const servidor = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]) || "/index.html";
  const archivo = path.normalize(path.join(raiz, rel === "/" ? "/index.html" : rel));
  if (!archivo.startsWith(raiz)) { res.writeHead(403); return res.end(); }
  fs.readFile(archivo, (err, data) => {
    if (err) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(archivo).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
});

const W = 640, H = 480, FPS = 15, FRAMES = 90;

/* Tarjeta con balanceo lento (temblor de mano) + salto aleatorio por frame */
async function generarCamaraTemblorosa() {
  const rand = rng(20261021);
  const gauss = () => (rand() + rand() + rand() - 1.5) * 5;  /* sd ~2.5 px */
  const tarjeta = await loadImage(fs.readFileSync(path.join(raiz, "tarjetas", "chimango.png")));

  const h = H * 0.84;
  const w = h * tarjeta.width / tarjeta.height;
  const card = createCanvas(Math.round(w), Math.round(h));
  card.getContext("2d").drawImage(tarjeta, 0, 0, card.width, card.height);

  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");
  const x0 = (W - card.width) / 2, y0 = (H - card.height) / 2;

  const uAcc = new Float64Array((W / 2) * (H / 2));
  const vAcc = new Float64Array((W / 2) * (H / 2));
  const cnt = new Uint16Array((W / 2) * (H / 2));
  const cl = v => v < 0 ? 0 : v > 255 ? 255 : Math.round(v);

  const partes = [Buffer.from(`YUV4MPEG2 W${W} H${H} F${FPS}:1 Ip A1:1 C420jpeg\n`)];
  const marco = Buffer.from("FRAME\n");

  for (let f = 0; f < FRAMES; f++) {
    const t = f / FPS;
    const yBuf = Buffer.alloc(W * H);
    const ox = Math.sin(2 * Math.PI * 0.9 * t) * 8 + gauss();
    const oy = Math.cos(2 * Math.PI * 0.7 * t) * 6 + gauss();
    const rot = Math.sin(2 * Math.PI * 0.5 * t) * 0.02 + (rand() - 0.5) * 0.008;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(0, 0, W, H);
    ctx.translate(x0 + card.width / 2 + ox, y0 + card.height / 2 + oy);
    ctx.rotate(rot);
    ctx.drawImage(card, -card.width / 2, -card.height / 2);

    const d = ctx.getImageData(0, 0, W, H).data;
    uAcc.fill(0); vAcc.fill(0); cnt.fill(0);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        yBuf[y * W + x] = cl(0.299 * r + 0.587 * g + 0.114 * b);
        const ci = (y >> 1) * (W >> 1) + (x >> 1);
        uAcc[ci] += -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
        vAcc[ci] += 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
        cnt[ci]++;
      }
    }
    const uBuf = Buffer.alloc(W * H / 4), vBuf = Buffer.alloc(W * H / 4);
    for (let i = 0; i < uBuf.length; i++) {
      uBuf[i] = cl(uAcc[i] / cnt[i]);
      vBuf[i] = cl(vAcc[i] / cnt[i]);
    }
    partes.push(marco, yBuf, uBuf, vBuf);
  }

  const destino = path.join(os.tmpdir(), "aves_temblor.y4m");
  fs.writeFileSync(destino, Buffer.concat(partes));
  return destino;
}

function buscarEdge() {
  return [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ].find(p => fs.existsSync(p));
}

function estadisticas(muestras) {
  const n = muestras.length;
  if (!n) return null;
  const eje = [0, 1, 2].map(k => {
    const v = muestras.map(m => m[k]);
    const media = v.reduce((a, b) => a + b, 0) / n;
    const varianza = v.reduce((a, b) => a + (b - media) * (b - media), 0) / n;
    return { media, desv: Math.sqrt(varianza), max: Math.max(...v), min: Math.min(...v) };
  });
  /* deltas consecutivos (temblor visible frame a frame) */
  let deltas = [];
  for (let i = 1; i < n; i++) {
    const dx = muestras[i][0] - muestras[i - 1][0];
    const dy = muestras[i][1] - muestras[i - 1][1];
    const dz = muestras[i][2] - muestras[i - 1][2];
    deltas.push(Math.sqrt(dx * dx + dy * dy + dz * dz));
  }
  deltas.sort((a, b) => a - b);
  const p95 = deltas[Math.floor(deltas.length * 0.95)] || 0;
  const desvGlobal = Math.sqrt(eje.reduce((a, e) => a + e.desv * e.desv, 0));
  return {
    n,
    desvGlobal,                     /* oscilación total alrededor de la media */
    deltaMax: deltas[deltas.length - 1] || 0,
    deltaP95: p95,
    porEje: eje
  };
}

async function main() {
  const puerto = 8796;
  await new Promise(r => servidor.listen(puerto, "127.0.0.1", r));
  const base = `http://localhost:${puerto}`;
  const edge = buscarEdge();
  if (!edge) throw new Error("No se encontro Edge");

  const y4m = await generarCamaraTemblorosa();
  console.log("camara falsa con temblor:", (fs.statSync(y4m).size / 1048576).toFixed(1), "MB");

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
      "--window-size=800,700"
    ]
  });
  await browser.defaultBrowserContext().overridePermissions(base, ["camera"]);

  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 820 });
  const errores = [];
  page.on("pageerror", e => errores.push(e.message));

  await page.goto(base + "/ar.html", { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => {
    const s = document.getElementById("escena");
    return s && s.hasLoaded;
  }, { timeout: 40000 }).catch(() => {});

  await page.click("#btn-iniciar");

  const detectado = await page.waitForFunction(() => {
    const f = document.getElementById("ficha");
    if (f && !f.classList.contains("oculto")) {
      const t = document.getElementById("ficha-nombre").textContent.trim();
      if (t) return t;
    }
    return false;
  }, { timeout: 60000 }).then(h => h.jsonValue()).catch(() => null);
  console.log("tarjeta detectada:", detectado || "NO");

  /* Muestrea lo que se dibuja (salida) y lo que entrega el tracker
     (entrada/ref) durante 4 s. Así calculamos temblor Y retardo. */
  const res = await page.evaluate(async (segundos) => {
    const escena = document.getElementById("escena");
    const anclas = [...escena.children].filter(e => e.getAttribute && e.getAttribute("mindar-image-target") !== null);

    function buscarAve(e) {
      if (e.components && e.components["vuelo-ave"]) return e;
      for (const h of e.children) { const r = buscarAve(h); if (r) return r; }
      return null;
    }

    const salida = [], entrada = [];
    let previa = null, frescura = 0, comprobaciones = 0;
    const T = AFRAME.THREE;
    const ref = new T.Vector3(), ver = new T.Vector3();

    await new Promise(resolve => {
      const t0 = performance.now();
      (function paso() {
        const ancla = anclas.find(a => a.object3D && a.object3D.visible);
        const ave = ancla && buscarAve(ancla);
        if (ancla && ave) {
          /* frescura natural del camino de render (ANTES del refresco) */
          const em = ancla.object3D.matrix.elements, ew = ancla.object3D.matrixWorld.elements;
          comprobaciones++;
          if (Math.abs(em[12] - ew[12]) < 1e-6 && Math.abs(em[13] - ew[13]) < 1e-6) frescura++;
          /* refresco completo: así matrixWorld refleja el estado actual */
          escena.object3D.updateMatrixWorld(true);
          ref.copy(ave.object3D.position).applyMatrix4(ancla.object3D.matrix);
          ver.setFromMatrixPosition(ave.object3D.matrixWorld);
          if (previa) {
            salida.push([ver.x, ver.y, ver.z]);
            entrada.push([ref.x, ref.y, ref.z]);
          }
          previa = [ver.x, ver.y, ver.z];
        } else previa = null;
        if (performance.now() - t0 < segundos * 1000) requestAnimationFrame(paso);
        else resolve();
      })();
    });
    return { salida, entrada, frescura, comprobaciones };
  }, 4);

  const sSalida = estadisticas(res.salida);
  const sEntrada = estadisticas(res.entrada);
  /* retardo = distancia entre lo dibujado y lo que dice el tracker */
  let retraso = null;
  if (res.salida.length) {
    const ds = res.salida.map((v, i) =>
      Math.hypot(v[0] - res.entrada[i][0], v[1] - res.entrada[i][1], v[2] - res.entrada[i][2]));
    retraso = {
      media: ds.reduce((a, b) => a + b, 0) / ds.length,
      max: Math.max(...ds)
    };
  }
  /* el ancho de la tarjeta mide 1000 unidades de mundo (= 0.1 mm por
     unidad con tarjeta impresa de 10 cm) */
  const aMm = v => +(v * 0.1).toFixed(3);

  console.log(`\nmuestras: ${sSalida ? sSalida.n : 0} (frescura matrixWorld del ancla: ${res.frescura}/${res.comprobaciones})`);
  if (sSalida) {
    console.log(`  ENTRADA tracker -> desv ${aMm(sEntrada.desvGlobal)} mm | delta p95 ${aMm(sEntrada.deltaP95)} mm | max ${aMm(sEntrada.deltaMax)} mm`);
    console.log(`  SALIDA dibujada  -> desv ${aMm(sSalida.desvGlobal)} mm | delta p95 ${aMm(sSalida.deltaP95)} mm | max ${aMm(sSalida.deltaMax)} mm`);
    if (retraso) console.log(`  RETARDO respecto del tracker -> media ${aMm(retraso.media)} mm | max ${aMm(retraso.max)} mm`);
    const reduccion = sEntrada.deltaP95 > 0 ? (1 - sSalida.deltaP95 / sEntrada.deltaP95) * 100 : 0;
    console.log(`  reduccion del temblor (p95): ${reduccion.toFixed(1)} %`);
  } else {
    console.log("  sin muestras (no se mantuvo la deteccion)");
  }
  if (errores.length) console.log("  errores JS:", errores.slice(0, 3));

  const informe = {
    fecha: new Date().toISOString(),
    tarjeta: detectado,
    camara: "temblor lento ~0.9 Hz + ruido gaussiano ~2.5 px/frame",
    mm: "mm reales: 1 unidad de mundo = 0.1 mm (tarjeta de 10 cm = 1000 unidades)",
    frescuraAncla: `${res.frescura}/${res.comprobaciones}`,
    entrada: sEntrada,
    salida: sSalida,
    retraso,
    errores
  };
  fs.mkdirSync(path.dirname(salidaJson), { recursive: true });
  fs.writeFileSync(salidaJson, JSON.stringify(informe, null, 2));
  console.log("\ninforme:", salidaJson);

  await browser.close();
  servidor.close();
  process.exit(detectado ? 0 : 1);
}

main().catch(e => {
  console.error("ERROR:", e);
  try { servidor.close(); } catch (_) {}
  process.exit(2);
});
