/* Compila las 9 tarjetas (PNG) en mind/aves.mind usando el compilador offline de MindAR.
   Uso: node herramientas/compilar-mind.mjs
   Si cambiás el diseño de alguna tarjeta, volvé a correr esto. */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { loadImage, createCanvas } from "canvas";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = join(__dirname, "..");

/* cargamos la lista de especies para conocer el orden de los targets */
globalThis.window = globalThis;
require(join(raiz, "js", "datos.js"));
const AVES = globalThis.window.AVES;

/* importamos el compilador offline de MindAR */
const { OfflineCompiler } = await import("mind-ar/src/image-target/offline-compiler.js");

const dirTarjetas = join(raiz, "tarjetas");
const salida = join(raiz, "mind", "aves.mind");
mkdirSync(join(raiz, "mind"), { recursive: true });

const images = [];
for (const ave of AVES) {
  const p = join(dirTarjetas, `${ave.id}.png`);
  if (!existsSync(p)) {
    console.error("Falta la tarjeta", p, "- corré generar-tarjetas.mjs primero");
    process.exit(1);
  }
  /* leemos con Buffer (no con la ruta) porque canvas nativo falla con
     caracteres especiales como "°" en el path de Windows */
  images.push(await loadImage(readFileSync(p)));
}

console.log(`Compilando ${images.length} tarjetas... (puede tardar unos minutos)`);
const compiler = new OfflineCompiler();
let ultimo = -1;
await compiler.compileImageTargets(images, (pct) => {
  const p = Math.floor(pct);
  if (p !== ultimo && p % 5 === 0) {
    process.stdout.write(` ${p}%`);
    ultimo = p;
  }
});
console.log(" 100%");

const buffer = compiler.exportData();
writeFileSync(salida, Buffer.from(buffer));
console.log(`Listo: ${salida} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
console.log("Orden de targets (índice = posición en AVES):");
AVES.forEach((a, i) => console.log(`  ${i}: ${a.id} (${a.nombre})`));
