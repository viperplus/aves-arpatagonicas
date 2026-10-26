/* Descarga ilustraciones naturistas (planchas científicas) de Wikimedia
   Commons para cada especie. Usa la categoría "<científico> (illustrations)".
   Filtra por licencia libre y tamaño mínimo.
   Salida: herramientas/tmp_test/ilustraciones/<id>/c1.jpg... + candidatas.json
   Uso:  node descargar-ilustraciones.mjs [ids...]                      */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const BASE = path.join(__dirname, "tmp_test", "ilustraciones");
fs.mkdirSync(BASE, { recursive: true });

function cargar(rel) {
  const src = fs.readFileSync(path.join(raiz, rel), "utf8");
  const win = {};
  new Function("window", src + "\n;return window;")(win);
  return win;
}
const AVES = cargar("js/datos.js").AVES;

const solo = process.argv.slice(2);
const lista = solo.length ? AVES.filter(a => solo.includes(a.id)) : AVES;

function licenciaLibre(meta) {
  const lic = (meta.LicenseShortName?.value || "").toLowerCase();
  const uso = (meta.UsageTerms?.value || "").toLowerCase();
  const txt = lic + " " + uso;
  if (/public domain|cc0|cc by\b|cc-by\b|cc by-sa|cc-by-sa|creative commons attribution/.test(txt)) return true;
  return false;
}
function licenciaTexto(meta) {
  return meta.LicenseShortName?.value || meta.UsageTerms?.value || "desconocida";
}

async function api(params) {
  const url = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ ...params, format: "json" });
  const r = await fetch(url);
  const t = await r.text();
  try { return JSON.parse(t); } catch (e) { throw new Error("API no-JSON: " + t.slice(0, 120)); }
}

async function buscarCandidatas(ave) {
  const carpeta = path.join(BASE, ave.id);
  fs.mkdirSync(carpeta, { recursive: true });

  // reanudar: si ya hay candidatas, saltar
  const metaPath = path.join(carpeta, "candidatas.json");
  if (fs.existsSync(metaPath)) {
    const prev = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    if (prev.candidatas && prev.candidatas.length >= 1 && fs.readdirSync(carpeta).some(f => /^c\d+\.jpg$/.test(f))) {
      console.log(`--- ${ave.id}: ya tiene ${prev.candidatas.length} candidatas, salto`);
      return;
    }
  }

  const cats = [
    `Category:${ave.cientifico} (illustrations)`,
    `Category:${ave.cientifico}`,
  ];
  const vistos = new Set();
  const candidatas = [];
  for (const cat of cats) {
    if (candidatas.length >= 6) break;
    try {
      const data = await api({
        action: "query", generator: "categorymembers", gcmtitle: cat,
        gcmlimit: "25", prop: "imageinfo", iiprop: "url|size|extmetadata",
      });
      const pages = Object.values(data?.query?.pages || {});
      for (const pg of pages) {
        if (candidatas.length >= 6) break;
        const ii = pg.imageinfo?.[0];
        if (!ii) continue;
        const url = (ii.url || "").split("?")[0];
        if (!/\.(jpg|jpeg|png|tif|tiff)$/i.test(url)) continue;
        if ((ii.width || 0) < 400) continue;
        if (vistos.has(pg.title)) continue;
        // descartar mapas, huevos, cráneos, fotos
        if (/(egg|map|distribution|range|skull|nest)/i.test(pg.title)) continue;
        vistos.add(pg.title);
        const meta = ii.extmetadata || {};
        if (!licenciaLibre(meta)) continue;
        candidatas.push({
          archivo: null,
          titulo: pg.title.replace(/^File:/, ""),
          licencia: licenciaTexto(meta),
          autor: (meta.Artist?.value || "").replace(/<[^>]+>/g, "").slice(0, 80),
          anio: meta.DateTimeOriginal?.value || "",
          ancho: ii.width, alto: ii.height,
          url,
        });
      }
    } catch (e) {
      console.log("  cat err", ave.id, cat, e.message);
    }
    await new Promise(r => setTimeout(r, 800));
  }

  // fallback: búsqueda por texto si no hubo candidatas
  if (candidatas.length === 0) {
    try {
      const data = await api({
        action: "query", list: "search", srsearch: `${ave.cientifico} illustration`, srnamespace: "6", srlimit: "12",
      });
      const hits = data?.query?.search || [];
      for (const h of hits) {
        if (candidatas.length >= 6) break;
        const infoData = await api({ action: "query", titles: h.title, prop: "imageinfo", iiprop: "url|size|extmetadata" });
        const pg = Object.values(infoData?.query?.pages || {})[0];
        const ii = pg?.imageinfo?.[0];
        if (!ii) continue;
        const url = (ii.url || "").split("?")[0];
        if (!/\.(jpg|jpeg|png|tif|tiff)$/i.test(url)) continue;
        if ((ii.width || 0) < 400) continue;
        if (vistos.has(h.title)) continue;
        vistos.add(h.title);
        const meta = ii.extmetadata || {};
        if (!licenciaLibre(meta)) continue;
        candidatas.push({
          archivo: null, titulo: h.title.replace(/^File:/, ""),
          licencia: licenciaTexto(meta),
          autor: (meta.Artist?.value || "").replace(/<[^>]+>/g, "").slice(0, 80),
          anio: meta.DateTimeOriginal?.value || "",
          ancho: ii.width, alto: ii.height, url,
        });
      }
    } catch (e) { console.log("  search err", ave.id, e.message); }
  }

  let n = 0;
  for (const c of candidatas) {
    n++;
    const nombre = `c${n}.jpg`;
    c.archivo = nombre;
    const dest = path.join(carpeta, nombre);
    try {
      const r = await fetch(c.url);
      if (!r.ok) { console.log("  falla", ave.id, c.titulo, r.status); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`  ok  ${ave.id.padEnd(22)} ${nombre}  ${Math.round(buf.length/1024)} KB  ${c.ancho}x${c.alto}  ${c.licencia}  ${c.titulo.slice(0,45)}`);
    } catch (e) {
      console.log("  error", ave.id, c.titulo, e.message);
    }
    await new Promise(r => setTimeout(r, 250));
  }
  fs.writeFileSync(metaPath, JSON.stringify({ candidatas }, null, 2));
  console.log(`--- ${ave.id}: ${candidatas.length} candidatas`);
}

for (const ave of lista) {
  console.log(`\n== ${ave.id} (${ave.cientifico}) ==`);
  await buscarCandidatas(ave);
  await new Promise(r => setTimeout(r, 3000));
}
console.log("\nlisto");
