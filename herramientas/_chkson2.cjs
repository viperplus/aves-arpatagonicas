globalThis.window = {};
const fs = require('fs');
const src = fs.readFileSync('js/sonidos.js','utf8');
eval(src);
const C = window.CANTOS;
console.log('total entries:', Object.keys(C).length);
let bad = [];
for (const k of Object.keys(C)) {
  const f = 'sonidos/' + C[k].archivo;
  const ok = fs.existsSync(f);
  if (!ok) bad.push(k);
  console.log(k, '->', C[k].archivo, ok ? 'OK' : 'MISSING');
}
console.log('missing:', bad);
