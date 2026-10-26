/* Parcha el worker del tracker de MindAR (lib/mindar-image-aframe.prod.js).
   Bug original: en "match" el worker tomaba el PRIMER target cuyo
   matchDetection cruzaba el umbral (orden 0,1,2...) y hacía `break`.
   Como las tarjetas comparten marco/puntos/textos, cualquier tarjeta
   cruzaba contra chimango (índice 0) y se mostraba la especie equivocada.
   Parche: matchDetection devuelve matchesCount y el loop elige el target
   con MÁS matches (evalúa todos).
   Reprocesable: node herramientas/parchear-mindar.mjs  (idempotente) */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundle = path.join(__dirname, "..", "lib", "mindar-image-aframe.prod.js");
let t = fs.readFileSync(bundle, "utf8");

/* si ya está parchado, no hacer nada */
if (t.includes("matchesCount")) {
  console.log("ya estaba parcheado (aparece matchesCount)");
  process.exit(0);
}

const m = t.match(/SI="([A-Za-z0-9+/=]{500,})"/);
if (!m) { console.error("no se encontro SI= en el bundle"); process.exit(1); }
let src = Buffer.from(m[1], "base64").toString("utf8");

const reemplazar = (viejo, nuevo) => {
  if (!src.includes(viejo)) {
    console.error("fragmento no encontrado:\n" + viejo.slice(0, 120));
    process.exit(1);
  }
  src = src.replace(viejo, nuevo);
};

/* 1. matchDetection expone cuántos matches tuvo el mejor keyframe */
reemplazar(
  "if(s===null)return{keyframeIndex:-1,debugExtra:t};",
  "if(s===null)return{keyframeIndex:-1,debugExtra:t,matchesCount:0};"
);
reemplazar(
  "return{screenCoords:r,worldCoords:i,keyframeIndex:s.keyframeIndex,debugExtra:t}}",
  "return{screenCoords:r,worldCoords:i,keyframeIndex:s.keyframeIndex,debugExtra:t,matchesCount:s.matches.length}}"
);

/* 2. el loop de match evalúa todos los candidatos y se queda con el mejor */
reemplazar(
  'case"match":const e=n.targetIndexes;let t=-1,s=null,r=null;for(let f=0;f<e.length;f++){const g=e[f],{keyframeIndex:a,screenCoords:j,worldCoords:w,debugExtra:y}=Gt.matchDetection(Kt[g],n.featurePoints);if(r=y,a!==-1){const m=St.estimate({screenCoords:j,worldCoords:w});m&&(t=g,s=m);break}}postMessage({type:"matchDone",targetIndex:t,modelViewTransform:s,debugExtra:r});break;',
  'case"match":const e=n.targetIndexes;let t=-1,s=null,r=null,ncMax=-1;for(let f=0;f<e.length;f++){const g=e[f],{keyframeIndex:a,screenCoords:j,worldCoords:w,debugExtra:y,matchesCount:nc}=Gt.matchDetection(Kt[g],n.featurePoints);if(r=y,a!==-1){const m=St.estimate({screenCoords:j,worldCoords:w});m&&nc>ncMax&&(ncMax=nc,t=g,s=m)}}postMessage({type:"matchDone",targetIndex:t,modelViewTransform:s,debugExtra:r});break;'
);

const b64 = Buffer.from(src, "utf8").toString("base64");
t = t.replace(m[0], 'SI="' + b64 + '"');
fs.writeFileSync(bundle, t);
console.log("bundle parcheado:", path.relative(path.join(__dirname, ".."), bundle));
console.log("  - matchDetection devuelve matchesCount");
console.log("  - match elige el target con más matches (no el primero)");
