/* Diagnostico del ave 3D: mide el estado REAL del objeto tras detectar.
   No chequea el DOM: mide escala, posicion en pantalla, material y textura.
   Uso:  node diag-ave.mjs                                        */

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

const requireCJS = createRequire(import.meta.url);
globalThis.window = globalThis;
requireCJS(path.join(raiz, "js", "datos.js"));
const N = globalThis.window.AVES.length;

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml",
  ".mind": "application/octet-stream", ".json": "application/json"
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

async function generarCamaraFalsa() {
  const W = 640, H = 480;
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
  return [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ].find(p => fs.existsSync(p));
}

/* estado 3D completo del ave detectada */
const DIAG = () => {
  const esc = document.getElementById("escena");
  if (!esc || !esc.sceneEl) return { err: "sin escena" };
  const T = AFRAME.THREE;
  const anclas = [...esc.querySelectorAll("[mindar-image-target]")];
  const idx = anclas.findIndex(a => a.object3D && a.object3D.visible);
  if (idx < 0) return { err: "ningun ancla visible", nAnclas: anclas.length };

  const ancla = anclas[idx];
  const raiz = ancla.children[0];
  const pivote = raiz && [...raiz.children].find(c => c.getAttribute && c.getAttribute("mirar-camara") !== null);
  const cuerpo = pivote && pivote.children[0];
  const plano = cuerpo && [...cuerpo.children].find(c => c.getAttribute && c.getAttribute("geometry"));
  const cam = esc.sceneEl.camera;

  const ws = new T.Vector3(), wp = new T.Vector3(), cq = new T.Quaternion(), rq = new T.Quaternion();
  if (raiz && raiz.object3D) { raiz.object3D.getWorldScale(ws); raiz.object3D.getWorldPosition(wp); }
  if (pivote) pivote.object3D.getWorldQuaternion(cq);
  if (raiz) raiz.object3D.getWorldQuaternion(rq);

  const camPos = new T.Vector3();
  if (cam) cam.getWorldPosition(camPos);

  /* proyeccion del pivote (los pies) a NDC */
  let ndc = null;
  if (cam) {
    const p = wp.clone().project(cam);
    ndc = [+p.x.toFixed(3), +p.y.toFixed(3), +p.z.toFixed(3)];
  }

  /* material del plano */
  let mat = null, geoms = null;
  if (plano) {
    const mesh = plano.getObject3D("mesh");
    if (mesh && mesh.material) {
      const m = mesh.material;
      mat = {
        tieneMap: !!m.map,
        mapCargado: !!(m.map && m.map.image),
        mapW: m.map && m.map.image ? m.map.image.width : 0,
        alphaTest: m.alphaTest, depthTest: m.depthTest, depthWrite: m.depthWrite,
        transparent: m.transparent, opacity: m.opacity, side: m.side,
        color: m.color ? m.color.getHexString() : null,
        visibleMesh: mesh.visible
      };
    } else mat = { err: "sin mesh/material" };
    const g = mesh && mesh.geometry;
    if (g && g.parameters) geoms = { w: +g.parameters.width.toFixed(3), h: +g.parameters.height.toFixed(3) };
    if (g && g.attributes && g.attributes.position) {
      g.computeBoundingBox();
      geoms = geoms || {};
      geoms.bbox = [g.boundingBox.min.toArray().map(v => +v.toFixed(2)),
                    g.boundingBox.max.toArray().map(v => +v.toFixed(2))];
    }
  }

  /* frustum: el plano esta dentro de la vista? */
  let enVista = null;
  if (cam && plano) {
    const mesh = plano.getObject3D("mesh");
    if (mesh) {
      mesh.updateWorldMatrix(true, false);
      const box = new T.Box3().setFromObject(mesh);
      if (!box.isEmpty()) {
        const fr = new T.Frustum().setFromProjectionMatrix(
          new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
        enVista = fr.intersectsBox(box);
      }
    }
  }

  return {
    idxDetectado: idx,
    nAnclas: anclas.length,
    anclaVisible: ancla.object3D.visible,
    anclaMatriz: ancla.object3D.matrix.elements.map(v => +v.toFixed(3)),
    raizEscala: ws.toArray().map(v => +v.toFixed(3)),
    raizPosMundo: wp.toArray().map(v => +v.toFixed(3)),
    camPosMundo: camPos.toArray().map(v => +v.toFixed(3)),
    quaternionPivote: cq.toArray().map(v => +v.toFixed(3)),
    quaternionRaiz: rq.toArray().map(v => +v.toFixed(3)),
    ndcPies: ndc,
    hayPlano: !!plano,
    material: mat,
    geometria: geoms,
    planoEnVista: enVista
  };
};

async function main() {
  const puerto = 8801;
  await new Promise(r => servidor.listen(puerto, "127.0.0.1", r));
  const base = `http://localhost:${puerto}`;
  const edge = buscarEdge();
  if (!edge) throw new Error("No se encontro Edge");

  const y4m = await generarCamaraFalsa();
  const browser = await puppeteer.launch({
    executablePath: edge, headless: true,
    args: [
      "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
      `--use-file-for-fake-video-capture=${y4m}`,
      "--autoplay-policy=no-user-gesture-required",
      "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader",
      "--ignore-gpu-blocklist", "--window-size=1100,800"
    ]
  });
  await browser.defaultBrowserContext().overridePermissions(base, ["camera"]);

  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 820, deviceScaleFactor: 2 });
  const errs = [];
  page.on("pageerror", e => errs.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });

  await page.goto(base + "/ar.html", { waitUntil: "load", timeout: 40000 });
  await page.waitForFunction(() => { const s = document.getElementById("escena"); return s && s.hasLoaded; },
    { timeout: 30000 }).catch(() => {});
  await page.click("#btn-iniciar");
  await page.waitForFunction(() => {
    const e = document.getElementById("estado");
    return e && /Apunt/.test(e.textContent);
  }, { timeout: 45000 }).then(() => console.log("arReady OK")).catch(() => console.log("arReady TIMEOUT"));

  const ok = await page.waitForFunction(() => {
    const f = document.getElementById("ficha");
    return f && !f.classList.contains("oculto");
  }, { timeout: 60000 }).then(() => true).catch(() => false);
  console.log("deteccion (ficha):", ok);

  await new Promise(r => setTimeout(r, 1500));
  const d = await page.evaluate(DIAG);
  console.log("\n=== ESTADO 3D DEL AVE ===");
  console.log(JSON.stringify(d, null, 2));
  await page.screenshot({ path: path.join(tmp, "diag-01.png") });

  /* segunda lectura a los 2s: el ave deberia haber terminado de aparecer */
  await new Promise(r => setTimeout(r, 2000));
  const d2 = await page.evaluate(DIAG);
  console.log("\n=== +2s ===");
  console.log(JSON.stringify(d2, null, 2));
  await page.screenshot({ path: path.join(tmp, "diag-02.png") });

  console.log("\nerrores JS:", errs.length, errs.slice(0, 5));
  await browser.close();
  servidor.close();
}

main().catch(e => { console.error("ERROR:", e); try { servidor.close(); } catch (_) {} process.exit(2); });
