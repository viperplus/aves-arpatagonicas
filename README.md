# Aves de la Patagonia · Realidad Aumentada

App web de **realidad aumentada**: se imprimen tarjetas con aves locales de la
Patagonia Norte (Río Negro) y, al apuntar con la cámara del celular, aparece el
ave en 3D sobre la propia tarjeta.

Funciona en **iPhone y Android desde el navegador** (no hay que instalar nada)
y se publica gratis en **GitHub Pages**.

---

## Qué contiene

```
aves-ar/
├── index.html          Portada · guía de campo con las 9 fichas
├── ar.html             Visor de realidad aumentada (cámara + tarjeta + ave 3D)
├── tarjetas.html       Hoja para imprimir las 9 tarjetas
├── css/aves.css
├── js/
│   ├── datos.js        Fichas de las 9 especies (fuente única de verdad)
│   ├── aves-svg.js     Ilustraciones SVG de cada ave
│   ├── aves3d.js       Modelos 3D de cada ave (primitivas de A-Frame)
│   └── ar.js           Lógica del visor AR
├── tarjetas/*.png      Las 9 tarjetas listas para imprimir
├── mind/aves.mind      Marcadores compilados (reconocimiento de imagen)
├── lib/                A-Frame + MindAR vendorizados (anda sin internet)
├── herramientas/       Scripts para regenerar tarjetas y marcadores
├── iniciar.bat         Servidor local de prueba
└── .nojekyll           Para que GitHub Pages sirva los archivos tal cual
```

Las 9 especies: **chimango, carancho, tero, martineta, choique (ñandú petiso),
cacholote, loica, águila mora y flamenco austral**.

---

## Cómo usarlo en clase (resumen rápido)

1. **Imprimí** las tarjetas desde `tarjetas.html` (papel mate, 1 tarjeta por hoja).
2. **Publicá** el sitio en GitHub Pages (ver abajo).
3. Los alumnos abren la URL en el celular, tocan **Iniciar cámara** y apuntan
   a una tarjeta. Aparece el ave en 3D, anclada a la tarjeta: si mueven la
   hoja, el ave se mueve con ella.

También hay un **modo demo sin cámara** (`Ver sin cámara`) para probar en el
aula con el proyector o en una PC sin webcam: muestra el ave 3D y se rota con
el mouse o el dedo.

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
```

Si cambiás el texto de una especie, editá **`js/datos.js`**, volvé a correr los
pasos 2 y 3, y listo. El orden de las especies en `datos.js` es el que define
el índice de cada tarjeta dentro de `aves.mind` (si agregás o reordenás
especies, **hay que recompilar siempre**, pasaría a otro índice).

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
  las características de las 9 imágenes; al encontrar una, MindAR ubica un
  ancla en 3D encima.
- **A-Frame** arma la escena; las aves se construyen con primitivas
  (esferas, conos, cilindros) parametrizadas en `js/aves3d.js`, con una
  animación de balanceo y aleteo.
- Todo está **vendorizado** en `lib/`, así que anda aunque el colegio no tenga
  internet una vez cargada la página.

---

## Límites a tener en cuenta

- Necesita un celular con buena cámara y luz suficiente.
- La detección es mejor con tarjetas de al menos 8 cm y vista de cerca.
- iPhone/Android no necesitan instalar nada, pero sí **HTTPS** (GitHub Pages lo
  da por defecto).
