/* Descarga fotos reales de Wikimedia Commons como candidatas de cada especie.
   Filtra por licencia libre (CC0 / CC BY / CC BY-SA / dominio público).
   Salida: herramientas/tmp_test/fotos/<id>/c1.jpg... + candidatas.json
   Uso:  node descargar-fotos.mjs                 -> las 9 especies
         node descargar-fotos.mjs loica flamenco  -> solo esas                */

const solo = process.argv.slice(2);

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const dirBase = path.join(__dirname, "tmp_test", "fotos");

function cargar(rel) {
  const src = fs.readFileSync(path.join(raiz, rel), "utf8");
  const modulo = { exports: {} };
  const win = {};
  new Function("module", "exports", "window", src + "\n;return window;")(modulo, modulo.exports, win);
  return win;
}
const AVES = cargar("js/datos.js").AVES;

const UA = { "User-Agent": "aves-arpatagonicas/1.0 (proyecto educativo)" };
const dormir = ms => new Promise(r => setTimeout(r, ms));

function limpiarHTML(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ").trim();
}

function licenciaLibre(txt) {
  const t = String(txt || "").toLowerCase();
  return /cc0|cc-by|cc by|public domain|dominio público|pd-/.test(t);
}

async function buscarCandidatas(ave) {
  const q = new URLSearchParams({
    action: "query", generator: "search",
    gsrsearch: `${ave.cientifico} filemime:image/jpeg`,
    gsrnamespace: "6", gsrlimit: "12",
    prop: "imageinfo", iiprop: "url|extmetadata|size",
    iiurlwidth: "1024", format: "json", origin: "*"
  });
  const url = "https://commons.wikimedia.org/w/api.php?" + q.toString();
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error("commons " + r.status);
  const j = await r.json();
  const pages = Object.values((j.query && j.query.pages) || {});
  const out = [];
  for (const p of pages) {
    const ii = p.imageinfo && p.imageinfo[0];
    if (!ii || !ii.thumburl) continue;
    const meta = ii.extmetadata || {};
    const lic = limpiarHTML((meta.LicenseShortName || {}).value);
    if (!licenciaLibre(lic)) continue;
    if ((ii.width || 0) < 900) continue;
    out.push({
      titulo: p.title.replace(/^File:/, ""),
      thumb: ii.thumburl,
      original: ii.url || "",
      pagina: (meta.DescriptionUrl || {}).value || ii.descriptionurl || "",
      autor: limpiarHTML((meta.Artist || {}).value) || "desconocido",
      licencia: lic,
      licenciaUrl: limpiarHTML((meta.LicenseUrl || {}).value) || "",
      fecha: limpiarHTML((meta.DateTimeOriginal || {}).value).slice(0, 40)
    });
  }
  return out.slice(0, 8);
}

async function descargar(url, dest) {
  for (let intento = 0; intento < 3; intento++) {
    const r = await fetch(url, { headers: UA });
    if (r.ok) return fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    if (r.status !== 429 && r.status !== 503) throw new Error("descarga " + r.status);
    await dormir(5000 * (intento + 1));
  }
  throw new Error("descarga 429 (reintentos agotados)");
}

async function main() {
  const lista = AVES.filter(a => !solo.length || solo.includes(a.id));
  if (!lista.length) throw new Error("especies no encontradas: " + solo.join(", "));

  for (const ave of lista) {
    const dir = path.join(dirBase, ave.id);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    const cands = await buscarCandidatas(ave);
    const guardadas = [];
    for (let i = 0; i < cands.length; i++) {
      const c = cands[i];
      const archivo = `c${i + 1}.jpg`;
      try {
        await descargar(c.thumb, path.join(dir, archivo));
      } catch (e1) {
        try {
          if (!c.original) throw e1;
          await descargar(c.original, path.join(dir, archivo));
        } catch (e2) {
          console.log(`falla ${ave.id} c${i + 1}: ${e2.message}`);
          await dormir(1200);
          continue;
        }
      }
      guardadas.push({ archivo, ...c });
      console.log(`ok  ${ave.id.padEnd(10)} ${archivo}  ${c.licencia.padEnd(14)} ${c.titulo.slice(0, 58)}`);
      await dormir(1200);
    }
    fs.writeFileSync(path.join(dir, "candidatas.json"),
      JSON.stringify({ id: ave.id, cientifico: ave.cientifico, candidatas: guardadas }, null, 2));
    console.log(`--- ${ave.id}: ${guardadas.length} candidatas\n`);
    await dormir(400);
  }

  const total = lista.length;
  console.log(`listo: ${total} especie(s) en tmp_test/fotos/`);
}

main().catch(e => { console.error("ERROR:", e); process.exit(1); });
