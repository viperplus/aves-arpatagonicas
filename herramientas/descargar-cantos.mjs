/* Descarga el canto de cada especie desde xeno-canto.org.
   El sitio está tras un anti-bot (Anubis): se navega con un navegador real
   (con UA normal) a cada página; el challenge se resuelve solo en la
   navegación. Los mp3 se bajan con fetch desde la página.
   Salida: sonidos/<id>.mp3 + js/sonidos.js
   Uso:  node descargar-cantos.mjs */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const dirSonidos = path.join(raiz, "sonidos");
fs.mkdirSync(dirSonidos, { recursive: true });

function cargar(rel) {
  const src = fs.readFileSync(path.join(raiz, rel), "utf8");
  const win = {};
  new Function("window", src + "\n;return window;")(win);
  return win;
}
const AVES = cargar("js/datos.js").AVES;
const solo = process.argv.slice(2);
const lista = solo.length ? AVES.filter(a => solo.includes(a.id)) : AVES;

/* manifiesto existente (para no pisar las especies ya descargadas) */
function manifiestoPrevio() {
  try {
    const txt = fs.readFileSync(path.join(raiz, "js", "sonidos.js"), "utf8");
    const m = txt.match(/window\.CANTOS\s*=\s*(\{[\s\S]*\})\s*;/);
    if (m) return JSON.parse(m[1]);
  } catch (_) {}
  return {};
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const segs = s => { const m = /^(\d+):(\d+)/.exec(s || ""); return m ? +m[1] * 60 + +m[2] : 0; };
const dormir = ms => new Promise(r => setTimeout(r, ms));

/* alias de nombre científico en xeno-canto (la taxonomía puede diferir) */
const ALIAS_XC = { loica: "Leistes-loyca" };

function parsearFilas(html) {
  const filas = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m => m[1])
    .filter(f => f.includes("xc-mini-player"));
  return filas.map(f => {
    const tds = [...f.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)]
      .map(m => m[1].replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim());
    const src = (f.match(/src="([^"]+\.mp3)"/) || [])[1];
    const q = (f.match(/<li[^>]*class="selected"[^>]*><span>(\w)<\/span>/) || [])[1] || "";
    const xc = (f.match(/xeno-canto\.org\/(\d+)/) || [])[1];
    return { src, dur: tds[2] || "", rec: tds[3] || "", tipo: (tds[9] || "").toLowerCase(), q, xc };
  }).filter(r => r.src && r.xc);
}

function elegir(filas) {
  const pts = r => {
    const q = "ABCDE".indexOf(r.q);
    return (q < 0 ? 2 : q) * 2 +
      (r.tipo.includes("song") ? 0 : 1) +
      (segs(r.dur) >= 5 && segs(r.dur) <= 70 ? 0 : 1) +
      segs(r.dur) / 600;
  };
  return [...filas].sort((a, b) => pts(a) - pts(b))[0];
}

/* navega y espera hasta que el body tenga las filas con audio (o rinde) */
async function navegarConFilas(page, url) {
  for (let intento = 0; intento < 3; intento++) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
    const ok = await page.waitForFunction(
      () => document.body && document.querySelectorAll("audio.xc-mini-player").length > 0,
      { timeout: 30000, polling: 500 }
    ).then(() => true).catch(() => false);
    if (ok) return page.content();
    await dormir(4000);
  }
  return null;
}

async function licenciaDe(page, xc) {
  await page.goto("https://xeno-canto.org/" + xc,
    { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
  await dormir(1200);
  const html = await page.content();
  const m = html.match(/creativecommons\.org\/licenses\/([a-z-]+)\/([\d.]+)/i);
  if (m) return ("CC " + m[1].toUpperCase() + " " + m[2]);
  const t = (html.match(/[Ll]icencia[^<>]{0,60}/) || [])[0];
  return t ? t.trim() : "ver ficha en xeno-canto";
}

async function main() {
  const edge = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ].find(p => fs.existsSync(p));
  if (!edge) throw new Error("No se encontro Edge instalado");

  const browser = await puppeteer.launch({
    executablePath: edge, headless: true, args: ["--window-size=1024,768"]
  });
  const page = await browser.newPage();
  await page.setUserAgent(UA);

  const cantos = manifiestoPrevio();
  for (const ave of lista) {
    try {
      const spUrl = "https://xeno-canto.org/species/" +
        (ALIAS_XC[ave.id] || ave.cientifico.split(" ").join("-"));
      const html = await navegarConFilas(page, spUrl);
      if (!html) throw new Error("la página no cargó filas");
      const filas = parsearFilas(html);
      if (!filas.length) throw new Error("sin filas con audio");
      const r = elegir(filas);

      const lic = await licenciaDe(page, r.xc);

      /* vuelve a estar en xeno-canto.org (página de detalle) para el fetch */
      const b64 = await page.evaluate(async src => {
        try {
          const res = await fetch(src);
          if (!res.ok) return null;
          const buf = new Uint8Array(await res.arrayBuffer());
          let s = "", p = 0x8000;
          for (let i = 0; i < buf.length; i += p) s += String.fromCharCode.apply(null, buf.subarray(i, i + p));
          return btoa(s);
        } catch (e) { return null; }
      }, r.src);
      if (!b64) throw new Error("descarga del mp3 fallida");

      const datos = Buffer.from(b64, "base64");
      fs.writeFileSync(path.join(dirSonidos, ave.id + ".mp3"), datos);
      cantos[ave.id] = {
        archivo: ave.id + ".mp3",
        cientifico: ave.cientifico,
        grabador: r.rec || "desconocido",
        licencia: lic,
        pagina: "https://xeno-canto.org/" + r.xc
      };
      console.log(`ok  ${ave.id.padEnd(10)} ${Math.round(datos.length / 1024)} KB  q=${r.q || "-"} ${r.dur}  ${lic}  ${r.rec}`);
      await dormir(1500);
    } catch (e) {
      console.log(`FALLO ${ave.id}: ${e.message}`);
      await dormir(3000);
    }
  }

  fs.writeFileSync(path.join(raiz, "js", "sonidos.js"),
    "/* Generado por herramientas/descargar-cantos.mjs — cantos de xeno-canto.org */\n" +
    "window.CANTOS = " + JSON.stringify(cantos, null, 2) + ";\n");
  await browser.close();
  console.log(`\nmanifiesto: js/sonidos.js (${Object.keys(cantos).length}/${AVES.length} especies)`);
  if (Object.keys(cantos).length < AVES.length) process.exit(1);
}

main().catch(e => { console.error("ERROR:", e); process.exit(2); });
