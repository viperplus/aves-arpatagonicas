/* Diagnóstico: ¿qué se mueve cuadro a cuadro? ancla, cámara, píxeles.
   Uso:  node debug-temblo.mjs                                                */

import http from "http";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";
import { createCanvas, loadImage } from "canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");

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

async function generarCamaraTemblorosa() {
  let a = 20261021 >>> 0;
  const rand = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const gauss = () => (rand() + rand() + rand() - 1.5) * 5;
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
        /* YUV4MPEG sin tag = BT.601 rango limitado -> codificar en limitado */
        yBuf[y * W + x] = cl(16 + (0.299 * r + 0.587 * g + 0.114 * b) * 219 / 255);
        const ci = (y >> 1) * (W >> 1) + (x >> 1);
        uAcc[ci] += -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
        vAcc[ci] += 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
        cnt[ci]++;
      }
    }
    const uBuf = Buffer.alloc(W * H / 4), vBuf = Buffer.alloc(W * H / 4);
    for (let i = 0; i < uBuf.length; i++) {
      uBuf[i] = cl(128 + (uAcc[i] / cnt[i] - 128) * 224 / 255);
      vBuf[i] = cl(128 + (vAcc[i] / cnt[i] - 128) * 224 / 255);
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

async function main() {
  const puerto = 8797;
  await new Promise(r => servidor.listen(puerto, "127.0.0.1", r));
  const base = `http://localhost:${puerto}`;
  const edge = buscarEdge();
  if (!edge) throw new Error("No se encontro Edge");

  const y4m = await generarCamaraTemblorosa();
  console.log("camara falsa:", (fs.statSync(y4m).size / 1048576).toFixed(1), "MB");

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
  await page.waitForFunction(() => {
    const f = document.getElementById("ficha");
    return f && !f.classList.contains("oculto");
  }, { timeout: 60000 }).catch(() => console.log("NO se detecto la tarjeta"));

  const res = await page.evaluate(async (segundos) => {
    const escena = document.getElementById("escena");
    const T = AFRAME.THREE;
    const ancla = [...escena.children].find(e => e.getAttribute && e.getAttribute("mindar-image-target") !== null && e.object3D && e.object3D.visible);
    const inter = ancla && ancla.children[0];
    const comp = inter && inter.components && inter.components["suavizar-ancla"];
    const muestras = [];
    let actualizaciones = 0, perdidas = 0;
    if (ancla) {
      ancla.addEventListener("targetUpdate", () => actualizaciones++);
      ancla.addEventListener("targetLost", () => perdidas++);
    }
    const posAncla = new T.Vector3(), eulAncla = new T.Euler();
    const posCam = new T.Vector3(), eulCam = new T.Euler();
    const punta = new T.Vector3();
    const puntaCrudo = new T.Vector3();
    const quat = new T.Quaternion(), esc = new T.Vector3();

    await new Promise(resolve => {
      const t0 = performance.now();
      (function paso() {
        const t = performance.now() - t0;
        if (ancla && ancla.object3D.visible) {
          escena.object3D.updateMatrixWorld(true);
          const m = ancla.object3D.matrix;
          m.decompose(posAncla, quat, esc);
          eulAncla.setFromQuaternion(quat, "XYZ");
          const cam = escena.camera;
          cam.matrixWorld.decompose(posCam, quat, esc);
          eulCam.setFromQuaternion(quat, "XYZ");
          /* proyectar a píxeles: crudo (ancla) y suavizado (intermedia) */
          let px = null, py = null, pxr = null, pyr = null;
          if (cam) {
            punta.setFromMatrixPosition(inter ? inter.object3D.matrixWorld : ancla.object3D.matrixWorld);
            punta.project(cam);
            px = (punta.x * 0.5 + 0.5) * 480;
            py = (-punta.y * 0.5 + 0.5) * 820;
            puntaCrudo.setFromMatrixPosition(ancla.object3D.matrixWorld);
            puntaCrudo.project(cam);
            pxr = (puntaCrudo.x * 0.5 + 0.5) * 480;
            pyr = (-puntaCrudo.y * 0.5 + 0.5) * 820;
          }
          muestras.push({
            t: +t.toFixed(0),
            a: [+posAncla.x.toFixed(2), +posAncla.y.toFixed(2), +posAncla.z.toFixed(2)],
            rot: [+(eulAncla.x * 57.3).toFixed(2), +(eulAncla.y * 57.3).toFixed(2), +(eulAncla.z * 57.3).toFixed(2)],
            c: [+posCam.x.toFixed(2), +posCam.y.toFixed(2), +posCam.z.toFixed(2)],
            rotc: [+(eulCam.x * 57.3).toFixed(2), +(eulCam.y * 57.3).toFixed(2), +(eulCam.z * 57.3).toFixed(2)],
            px: px === null ? null : [+px.toFixed(1), +py.toFixed(1)],
            pxr: pxr === null ? null : [+pxr.toFixed(1), +pyr.toFixed(1)],
            d: comp && comp.dbg ? { a: +comp.dbg.a.toFixed(4), h: +comp.dbg.h.toFixed(2), v: +comp.dbg.v.toFixed(1), dts: +comp.dbg.dts.toFixed(4) } : null,
            dc: comp ? { beta: comp.dbg ? comp.dbg.beta : null, cm: comp.dbg ? comp.dbg.corteMin : null } : null
          });
        }
        if (performance.now() - t0 < segundos * 1000) requestAnimationFrame(paso);
        else resolve();
      })();
    });
    return { muestras, actualizaciones, perdidas, hayAncla: !!ancla };
  }, 2.5);

  console.log("ancla visible al muestrear:", res.hayAncla, "| targetUpdate:", res.actualizaciones, "| targetLost:", res.perdidas);
  console.log("muestras:", res.muestras.length);
  const m = res.muestras;
  if (m.length) {
    const minmax = f => {
      const vs = m.map(f);
      return `[${Math.min(...vs)} .. ${Math.max(...vs)}]`;
    };
    console.log("ancla pos x:", minmax(s => s.a[0]), " y:", minmax(s => s.a[1]), " z:", minmax(s => s.a[2]));
    console.log("ancla rot x°:", minmax(s => s.rot[0]), " y°:", minmax(s => s.rot[1]), " z°:", minmax(s => s.rot[2]));
    console.log("camara pos x:", minmax(s => s.c[0]), " y:", minmax(s => s.c[1]), " z:", minmax(s => s.c[2]));
    console.log("camara rot x°:", minmax(s => s.rotc[0]), " y°:", minmax(s => s.rotc[1]), " z°:", minmax(s => s.rotc[2]));
    console.log("pantalla px (suavizado) x:", minmax(s => s.px[0]), " y:", minmax(s => s.px[1]));
    console.log("pantalla px (crudo)     x:", minmax(s => s.pxr[0]), " y:", minmax(s => s.pxr[1]));
    console.log("\nprimeras 8 muestras:");
    m.slice(0, 8).forEach(s => console.log(" ", JSON.stringify(s)));
    console.log("ultimas 4 muestras:");
    m.slice(-4).forEach(s => console.log(" ", JSON.stringify(s)));
    /* deltas consecutivos en pixeles de pantalla */
    let d = [], dr = [];
    for (let i = 1; i < m.length; i++) {
      d.push(Math.hypot(m[i].px[0] - m[i - 1].px[0], m[i].px[1] - m[i - 1].px[1]));
      dr.push(Math.hypot(m[i].pxr[0] - m[i - 1].pxr[0], m[i].pxr[1] - m[i - 1].pxr[1]));
    }
    d.sort((a, b) => a - b); dr.sort((a, b) => a - b);
    console.log(`\ndelta px/frame CRUDO     : media ${(dr.reduce((a, b) => a + b, 0) / dr.length).toFixed(2)} | p95 ${dr[Math.floor(dr.length * 0.95)].toFixed(2)} | max ${dr[dr.length - 1].toFixed(2)}`);
    console.log(`delta px/frame SUAVIZADO : media ${(d.reduce((a, b) => a + b, 0) / d.length).toFixed(2)} | p95 ${d[Math.floor(d.length * 0.95)].toFixed(2)} | max ${d[d.length - 1].toFixed(2)}`);

    const ds = m.map(s => s.d).filter(Boolean);
    if (ds.length) {
      console.log("\ndbg suavizar-ancla n:", ds.length, "| beta:", ds[0] && m.find(s => s.dc) && m.find(s => s.dc).dc.beta, "| corteMin:", m.find(s => s.dc).dc.cm);
      const st = k => {
        const vs = ds.map(x => x[k]);
        return `${Math.min(...vs)} .. ${Math.max(...vs)}  avg ${(vs.reduce((p, c) => p + c, 0) / vs.length).toFixed(3)}`;
      };
      console.log("  alfa a:", st("a"));
      console.log("  corte h:", st("h"));
      console.log("  velS v:", st("v"));
      console.log("  dts:", st("dts"));
    } else {
      console.log("\nSIN componente suavizar-ancla dbg");
    }
  }
  if (errores.length) console.log("errores JS:", errores.slice(0, 3));

  await browser.close();
  servidor.close();
  process.exit(0);
}

main().catch(e => {
  console.error("ERROR:", e);
  try { servidor.close(); } catch (_) {}
  process.exit(2);
});
