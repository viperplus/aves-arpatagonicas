/* Descarga ilustraciones naturistas (planchas científicas) de Wikimedia
   Commons. Usa la categoría "<científico> (illustrations)" únicamente.
   Filtra por licencia libre y tamaño mínimo, descarta mapas/huevos/fotos.
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

const HEADERS = { "User-Agent": "AvesAR/1.0 (educational; contact: local)" };

function licenciaLibre(meta) {
  const lic = (meta.LicenseShortName?.value || "").toLowerCase();
  const uso = (meta.UsageTerms?.value || "").toLowerCase();
  const txt = lic + " " + uso;
  return /public domain|cc0|cc by\b|cc-by\b|cc by-sa|cc-by-sa|creative commons attribution/.test(txt);
}
function licenciaTexto(meta) {
  return meta.LicenseShortName?.value || meta.UsageTerms?.value || "desconocida";
}

async function api(params) {
  const url = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ ...params, format: "json" });
  const r = await fetch(url, { headers: HEADERS });
  const t = await r.text();
  try { return JSON.parse(t); } catch (e) { throw new Error("API no-JSON: " + t.slice(0, 120)); }
}

async function fetchConReintento(url, intentos = 4) {
  for (let i = 0; i < intentos; i++) {
    const r = await fetch(url, { headers: HEADERS });
    if (r.ok) return r;
    if (r.status === 429) {
      const espera = 5000 * (i + 1);
      console.log(`    429, esperando ${espera}ms...`);
      await new Promise(res => setTimeout(res, espera));
      continue;
    }
    return r;
  }
  throw new Error("429 persistente");
}

async function buscarCandidatas(ave) {
  const carpeta = path.join(BASE, ave.id);
  fs.mkdirSync(carpeta, { recursive: true });

  // reanudar: si ya hay imágenes descargadas, saltar
  const imgs = fs.readdirSync(carpeta).filter(f => /^c\d+\.jpg$/.test(f));
  const metaPath = path.join(carpeta, "candidatas.json");
  if (imgs.length >= 1 && fs.existsSync(metaPath)) {
    const prev = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    console.log(`--- ${ave.id}: ya tiene ${imgs.length} imágenes, salto`);
    return;
  }

  const cat = `Category:${ave.cientifico} (illustrations)`;
  const vistos = new Set();
  const candidatas = [];
  try {
    const data = await api({
      action: "query", generator: "categorymembers", gcmtitle: cat,
      gcmlimit: "30", prop: "imageinfo", iiprop: "url|size|extmetadata",
    });
    const pages = Object.values(data?.query?.pages || {});
    for (const pg of pages) {
      if (candidatas.length >= 5) break;
      const ii = pg.imageinfo?.[0];
      if (!ii) continue;
      const url = (ii.url || "").split("?")[0];
      if (!/\.(jpg|jpeg|png)$/i.test(url)) continue;   // solo jpg/png, nada de tif
      if ((ii.width || 0) < 400) continue;
      if ((ii.width || 0) > 2500) continue;             // evitar archivos enormes
      if (vistos.has(pg.title)) continue;
      // descartar mapas, huevos, cráneos, fotos, murales
      if (/(egg|map|distribution|range|skull|nest|mural|photo)/i.test(pg.title)) continue;
      vistos.add(pg.title);
      const meta = ii.extmetadata || {};
      if (!licenciaLibre(meta)) continue;
      candidatas.push({
        archivo: null, titulo: pg.title.replace(/^File:/, ""),
        licencia: licenciaTexto(meta),
        autor: (meta.Artist?.value || "").replace(/<[^>]+>/g, "").slice(0, 80),
        anio: meta.DateTimeOriginal?.value || "",
        ancho: ii.width, alto: ii.height, url,
      });
    }
  } catch (e) {
    console.log("  cat err", ave.id, e.message);
  }

  let n = 0;
  for (const c of candidatas) {
    n++;
    const nombre = `c${n}.jpg`;
    c.archivo = nombre;
    const dest = path.join(carpeta, nombre);
    try {
      const r = await fetchConReintento(c.url);
      if (!r.ok) { console.log("  falla", ave.id, c.titulo, r.status); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`  ok  ${ave.id.padEnd(22)} ${nombre}  ${Math.round(buf.length/1024)} KB  ${c.ancho}x${c.alto}  ${c.licencia}  ${c.titulo.slice(0,50)}`);
    } catch (e) {
      console.log("  error", ave.id, c.titulo, e.message);
    }
    await new Promise(r => setTimeout(r, 2500));
  }
  fs.writeFileSync(path.join(carpeta, "candidatas.json"), JSON.stringify({ candidatas }, null, 2));
  console.log(`--- ${ave.id}: ${candidatas.length} candidatas, ${n} descargadas`);
}

for (const ave of lista) {
  console.log(`\n== ${ave.id} (${ave.cientifico}) ==`);
  await buscarCandidatas(ave);
  await new Promise(r => setTimeout(r, 6000));
}
console.log("\nlisto");
