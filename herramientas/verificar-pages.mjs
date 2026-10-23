/* Verifica que GitHub Pages sirva el bundle parcheado y ar.html actualizado */
const base = "https://viperplus.github.io/aves-arpatagonicas";
const cb = "?cb=" + Date.now();

const ar = await (await fetch(base + "/ar.html" + cb)).text();
console.log("ar.html warmupTolerance:", /warmupTolerance: 3/.test(ar) ? "OK" : "VIEJO");

const js = await (await fetch(base + "/lib/mindar-image-aframe.prod.js" + cb)).text();
const m = js.match(/SI="([A-Za-z0-9+/=]{500,})"/);
if (!m) { console.log("bundle: no se encontro SI"); process.exit(1); }
const worker = Buffer.from(m[1], "base64").toString("utf8");
console.log("bundle worker parcheado:",
  worker.includes("matchesCount") ? "OK (matchesCount presente)" : "VIEJO (sin parche)");
