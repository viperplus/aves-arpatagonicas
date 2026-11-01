import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const xcId = process.argv[2];
const aveId = process.argv[3];
if (!xcId || !aveId) { console.error("uso: node descargar-canto-xc.mjs <xcId> <aveId>"); process.exit(1); }

const edge = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
].find(p => fs.existsSync(p));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const dormir = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: edge, headless: true, args: ["--window-size=1024,768"] });
const page = await browser.newPage();
await page.setUserAgent(UA);
await page.goto("https://xeno-canto.org/" + xcId, { waitUntil: "networkidle0", timeout: 60000 }).catch(e => console.log("goto err", e.message));
await dormir(3000);

// wait for audio element
await page.waitForSelector("audio", { timeout: 15000 }).catch(() => {});
await dormir(1000);

const html = await page.content();
const src = (html.match(/src="([^"]+\.mp3)"/) || [])[1];
if (!src) { console.error("no se encontro mp3 en la pagina"); await browser.close(); process.exit(1); }
console.log("mp3 src:", src);

const licMatch = html.match(/creativecommons\.org\/licenses\/([a-z-]+)\/([\d.]+)/i);
const lic = licMatch ? ("CC " + licMatch[1].toUpperCase() + " " + licMatch[2]) : "ver ficha";
const recMatch = html.match(/recordist[^<]*<[^>]*>\s*([^<]+)/i);
const rec = recMatch ? recMatch[1].trim() : "desconocido";

const b64 = await page.evaluate(async src => {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    let s = "", p = 0x8000;
    for (let i = 0; i < buf.length; i += p) s += String.fromCharCode.apply(null, buf.subarray(i, i + p));
    return btoa(s);
  } catch (e) { return "ERR:" + e.message; }
}, src);
if (!b64 || b64.startsWith("ERR:")) { console.error("descarga fallida", b64); await browser.close(); process.exit(1); }

const datos = Buffer.from(b64, "base64");
fs.writeFileSync(path.join(raiz, "sonidos", aveId + ".mp3"), datos);
console.log(`guardado ${aveId}.mp3  ${Math.round(datos.length/1024)} KB  lic=${lic}  rec=${rec}`);

const sonidosPath = path.join(raiz, "js", "sonidos.js");
const txt = fs.readFileSync(sonidosPath, "utf8");
const m = txt.match(/window\.CANTOS\s*=\s*(\{[\s\S]*\})\s*;/);
const cantos = JSON.parse(m[1]);
cantos[aveId] = {
  archivo: aveId + ".mp3",
  cientifico: cantos[aveId]?.cientifico || "",
  grabador: rec,
  licencia: lic,
  pagina: "https://xeno-canto.org/" + xcId
};
fs.writeFileSync(sonidosPath, "/* Generado por herramientas/descargar-cantos.mjs — cantos de xeno-canto.org */\nwindow.CANTOS = " + JSON.stringify(cantos, null, 2) + ";\n");
console.log("sonidos.js actualizado");

await browser.close();
