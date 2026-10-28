import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const ORIG = "C:/Users/black/Desktop/opencode archivos/aves ilustraciones";
const DEST = path.join(raiz, "assets", "ilustraciones");
fs.mkdirSync(DEST, { recursive: true });

function load(rel){ 
  const src = fs.readFileSync(path.join(raiz, rel), "utf8"); 
  const w = {}; 
  new Function("window", src + "\n;return window;")(w); 
  return w; 
}
const AVES = load("js/datos.js").AVES;

const files = fs.readdirSync(ORIG).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
const norm = s => s.toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const aliases = {
  "cabecita negra": "cabezanegra",
  "calandria grande": "calandria-grande",
  "golondrina parda": "golondrina-parda",
  "golondrina patagonica": "golondrina-patagonica",
  "golondrina-tijerita": "golondrina-tijerita",
  "gorrion": "gorrion",
  "gorri n comun sobre una roca": "gorrion",
  "gorrion comun sobre una roca": "gorrion",
  "jilguero amarillo sobre una rama": "jilguero-dorado",
  "loro-barranquero": "loro-barranquero",
  "paloma manchada": "paloma-manchada",
  "paloma-picazuro": "paloma-picazuro",
  "tordo-renegrido": "tordo-renegrido",
  "zorzal-patagonico": "zorzal-patagonico",
  "naranjero": "naranjero",
  "loica": "loica",
  "chimango": "chimango",
  "cotorra": "cotorra",
  "ratona": "ratona",
  "hornero": "hornero",
  "chingolo": "chingolo",
  "tero": "tero",
  "torcaza": "torcaza",
  "benteveo": "benteveo"
};

let ok = 0, bad = 0;
for (const f of files) {
  const base = path.parse(f).name;
  let nb = norm(base);
  nb = nb.replace(/\bcomun\b|\bsobre\b|\buna\b|\broca\b|\brama\b|\bamarrillo\b|\bamarillo\b/g, '').replace(/\s+/g, ' ').trim();
  let id = aliases[nb] || aliases[norm(base)];
  if (!id) {
    for (const a of AVES) {
      const na = norm(a.nombre);
      const nia = norm(a.id.replace(/-/g, ' '));
      if (na === nb || nia === nb || nb.includes(nia) || nia.includes(nb)) { id = a.id; break; }
      if (na.split(' ')[0] === nb.split(' ')[0]) { id = a.id; break; }
    }
  }
  if (!id) { console.log("SIN MAPEO:", f); bad++; continue; }
  const ext = path.parse(f).ext.toLowerCase();
  const dest = path.join(DEST, id + ext);
  fs.copyFileSync(path.join(ORIG, f), dest);
  console.log("OK", f.padEnd(40), "->", path.basename(dest));
  ok++;
}
console.log(`\nlisto: ${ok} copiados, ${bad} sin mapear`);
