/* Explora xeno-canto.org con navegador real (pasa Anubis) y reporta
   cómo se ven las grabaciones de una especie. Uso: node xc-explorar.mjs */
import puppeteer from "puppeteer-core";
import fs from "fs";

const edge = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
].find(p => fs.existsSync(p));

const browser = await puppeteer.launch({
  executablePath: edge, headless: true,
  args: ["--window-size=1280,900"]
});
const page = await browser.newPage();
await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36");

const url = process.argv[2] || "https://xeno-canto.org/species/Milvago-chimango";
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
/* Anubis hace proof-of-work y redirige: esperamos hasta 25 s */
await new Promise(r => setTimeout(r, 25000));
console.log("URL final:", page.url());
console.log("Título:", await page.title());

const info = await page.evaluate(() => {
  const audios = [...document.querySelectorAll("audio, audio source")].map(a => a.src || a.getAttribute("src")).slice(0, 5);
  const mp3s = [...document.querySelectorAll("a")].map(a => a.href).filter(h => /mp3|record/i.test(h)).slice(0, 10);
  const filas = [...document.querySelectorAll("[class*=rec], [class*=Recording], tr")].length;
  const texto = document.body.innerText.slice(0, 600);
  return { audios, mp3s, filas, texto, html: document.body.innerHTML.length };
});
console.log(JSON.stringify(info, null, 2));
fs.writeFileSync("tmp_test/xc-pagina.html", await page.content());
console.log("HTML guardado en tmp_test/xc-pagina.html");
await browser.close();
