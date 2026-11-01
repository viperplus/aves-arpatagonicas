/* Lista todos los cantos candidatos de calandria-grande en xeno-canto */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");

const edge = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
].find(p => fs.existsSync(p));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const dormir = ms => new Promise(r => setTimeout(r, ms));

function parsearFilas(html) {
  const filas = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m => m[1]).filter(f => f.includes("xc-mini-player"));
  return filas.map(f => {
    const tds = [...f.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => m[1].replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim());
    const src = (f.match(/src="([^"]+\.mp3)"/) || [])[1];
    const q = (f.match(/<li[^>]*class="selected"[^>]*><span>(\w)<\/span>/) || [])[1] || "";
    const xc = (f.match(/xeno-canto\.org\/(\d+)/) || [])[1];
    return { src, dur: tds[2] || "", rec: tds[3] || "", tipo: (tds[9] || "").toLowerCase(), q, xc };
  }).filter(r => r.src && r.xc);
}

const browser = await puppeteer.launch({ executablePath: edge, headless: true, args: ["--window-size=1024,768"] });
const page = await browser.newPage();
await page.setUserAgent(UA);
const url = "https://xeno-canto.org/species/Mimus-saturninus";
for (let i = 0; i < 3; i++) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
  const ok = await page.waitForFunction(() => document.querySelectorAll("audio.xc-mini-player").length > 0, { timeout: 30000, polling: 500 }).then(() => true).catch(() => false);
  if (ok) break;
  await dormir(4000);
}
const html = await page.content();
const filas = parsearFilas(html);
console.log("total candidatos:", filas.length);
for (const f of filas) {
  console.log(`q=${f.q || "-"} dur=${f.dur.padEnd(6)} tipo=${f.tipo.padEnd(8)} rec=${f.rec.slice(0,40).padEnd(40)} xc=${f.xc}`);
}
await browser.close();
