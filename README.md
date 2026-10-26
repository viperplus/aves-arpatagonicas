# Aves de la Patagonia · Realidad Aumentada

App web de **realidad aumentada**: se imprimen tarjetas con aves locales de la
Patagonia Norte (Río Negro) y, al apuntar con la cámara del celular, aparece el
ave recortada (2.5D) sobre la propia tarjeta **con su canto**.

Funciona en **iPhone y Android desde el navegador** (no hay que instalar nada)
y se publica gratis en **GitHub Pages**.

---

## Qué contiene

```
aves-ar/
├── index.html          Portada · guía de campo con las 22 fichas
├── ar.html             Visor de realidad aumentada (cámara + tarjeta + ave 2.5D)
├── tarjetas.html       Hoja para imprimir las 22 tarjetas
├── css/aves.css
├── js/
│   ├── datos.js        Fichas de las 22 especies (fuente única de verdad)
│   ├── aves-svg.js     Ilustraciones SVG de cada ave
│   ├── aves25d.js      Ave 2.5D: foto recortada animada + sombra (billboard)
│   ├── fotos.js        Créditos de las fotos (Wikimedia Commons)
│   ├── sonidos.js      Manifiesto de los cantos (xeno-canto)
│   ├── cantos.js       Reproductor del canto (con botón de silencio)
│   ├── videos.js       Manifiesto de los videos de las fichas
│   └── ar.js           Lógica del visor AR
├── assets/ave-25d/*.png  Los 22 recortes de fotos reales (RGBA, fondo transparente)
├── sonidos/*.mp3       Cantos de xeno-canto (uno por especie)
├── videos/*.mp4        Videos cortos en bucle para las fichas del index
├── tarjetas/*.png      Las 22 tarjetas listas para imprimir
├── mind/aves.mind      Marcadores compilados (reconocimiento de imagen)
├── lib/                A-Frame + MindAR vendorizados (anda sin internet)
├── herramientas/       Scripts para regenerar tarjetas y marcadores
├── iniciar.bat         Servidor local de prueba
└── .nojekyll           Para que GitHub Pages sirva los archivos tal cual
```

Las 22 especies: **chingolo, calandria grande, hornero, tero, loro barranquero,
golondrina tijerita, jilguero dorado, naranjero, benteveo, paloma picazuro,
gorrión, ratona, zorzal patagónico, tordo renegrido, chimango, cotorra,
paloma manchada, loica, golondrina parda, cabezanegra, golondrina patagónica y
torcaza**.

---

## Cómo usarlo en clase (resumen rápido)

1. **Imprimí** las tarjetas desde `tarjetas.html` (papel mate, 1 tarjeta por hoja).
2. **Publicá** el sitio en GitHub Pages (ver abajo).
3. Los alumnos abren la URL en el celular, tocan **Iniciar cámara** y apuntan
   a una tarjeta. Aparece el ave con su canto, anclada a la tarjeta: si
   mueven la hoja, el ave se mueve con ella. Hay un botón 🔊/🔇 para
   silenciar.

También hay un **modo demo sin cámara** (`Ver sin cámara`) para probar en el
aula con el proyector o en una PC sin webcam: muestra el ave con su canto y
una lista para cambiar de especie.

---

## Cómo publicarlo en GitHub Pages

1. Creá un repositorio (por ejemplo `aves-arpatagonicas`) y subí **el contenido
   de esta carpeta** a la rama `main`:

   ```bash
   cd aves-ar
   git init
   git add .
   git commit -m "Aves de la Patagonia - app de RA"
   git remote add origin https://github.com/TU-USUARIO/aves-arpatagonicas.git
   git push -u origin main
   ```

2. En GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: main
   → /(root) → Save**.

3. Esperá un minuto y entrá a:
   `https://TU-USUARIO.github.io/aves-arpatagonicas/`

   > **Importante:** GitHub Pages ya sirve por **HTTPS**, que es obligatorio
   > para que el navegador abra la cámara. Si publicás en otro lado, tiene que
   > ser HTTPS.

---

## Probarlo en el aula (sin publicar todavía)

Doble clic en **`iniciar.bat`** (o `python -m http.server 8780`). En la PC abre
`http://localhost:8780/index.html`. Para el celular, que esté en la misma red
y abra `http://IP-DE-LA-PC:8780/index.html` (la IP se ve con `ipconfig`).

> Ojo: por **http** (sin la `s`) algunos celulares no dejan usar la cámara.
> Por eso conviene publicar en GitHub Pages (https) antes de la clase.

---

## Cómo regenerar las tarjetas y los marcadores

Solo hace falta si **cambiás el diseño o los datos** de alguna tarjeta.
Para eso están los scripts de `herramientas/`:

```bash
# 1. instalar dependencias (solo la primera vez)
cd herramientas
npm install

# 2. regenerar los PNG de las tarjetas (usa Microsoft Edge, viene con Windows)
node generar-tarjetas.mjs

# 3. recompilar los marcadores .mind
node compilar-mind.mjs

# opcional: regenerar el resto de los recursos (los cantos/fotos necesitan internet)
node generar-cortes.mjs     # (opcional) recortes desde el SVG, versión ilustración
node generar-videos.mjs     # videos en bucle de las fichas del index
node descargar-cantos.mjs   # cantos de xeno-canto.org (con navegador)
node descargar-fotos.mjs    # candidatas de Wikimedia Commons (licencias libres)
python preparar_fotos.py    # recorta el fondo de la foto elegida (IA rembg)
```

Si cambiás el texto de una especie, editá **`js/datos.js`**, volvé a correr los
pasos 2 y 3, y listo. El orden de las especies en `datos.js` es el que define
el índice de cada tarjeta dentro de `aves.mind` (si agregás o reordenás
especies, **hay que recompilar siempre**, pasaría a otro índice).

> **Parche de MindAR:** `lib/mindar-image-aframe.prod.js` está parcheado con
> `herramientas/parchear-mindar.mjs` (idempotente). El match original tomaba
> el *primer* target que cruzaba el umbral, en orden 0,1,2…; como las tarjetas
> comparten marco/puntos/textos, cualquier especie podía cruzar contra
> chimango y mostraba el ave equivocada. El parche evalúa todos los targets y
> elige el que más matches tiene. Si actualizás el bundle de MindAR,
> volvé a correr ese script.

---

## Consejos de impresión

- **Papel mate** (el brillante refleja y dificulta el reconocimiento).
- Ancho mínimo **8 cm**; ideal 1 tarjeta por hoja A4 (ya viene así).
- Buena luz y celular a unos **30–60 cm** de la tarjeta.
- Si se ve poco nítido al escanear, imprimí a mayor calidad o en color.

---

## Cómo funciona (para quien quiera adaptarlo)

- **Reconocimiento de imagen con MindAR**: el diseño de cada tarjeta es el
  "marcador" (no hace falta imprimir códigos tipo QR). `mind/aves.mind` guarda
  las características de las 22 imágenes; al encontrar una, MindAR ubica un
  ancla en 3D encima.
- **A-Frame** arma la escena; cada ave es el recorte de una **foto real** de
  Wikimedia Commons (`assets/ave-25d/`, fondo transparente, preparado con
  `herramientas/preparar_fotos.py` usando IA de segmentación) sobre un plano
  que siempre mira al espectador, con balanceo y saltito (`js/aves25d.js`) y
  sombra de contacto. Los créditos de cada foto están en `js/fotos.js` y en
  el pie del index (licencias libres CC0 / CC BY / CC BY-SA).
- **El canto** de cada especie viene de **xeno-canto.org** (licencias
  Creative Commons, créditos en el pie del index), queda en `sonidos/` y
  suena con la ficha (`js/cantos.js`).
- Todo está **vendorizado** en `lib/`, así que anda aunque el colegio no tenga
  internet una vez cargada la página.

---

## Límites a tener en cuenta

- Necesita un celular con buena cámara y luz suficiente.
- La detección es mejor con tarjetas de al menos 8 cm y vista de cerca.
- iPhone/Android no necesitan instalar nada, pero sí **HTTPS** (GitHub Pages lo
  da por defecto).
