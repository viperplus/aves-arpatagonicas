/* Aves 2.5D: la foto real recortada y animada sobre la tarjeta.
   - panel crema que enmascara la ilustración impresa (solo en modo tarjeta)
   - plano con el corte PNG de la FOTO (assets/ave-25d/<id>.png, fondo
     transparente) que siempre mira al espectador (billboard), con balanceo
     y salto suave + sombra de contacto.
   Los cortes se preparan con herramientas/preparar_fotos.py (rembg): el ave
   queda centrada en un lienzo de 800 px con las patas en y = 720 (0.90),
   así todas las especies se apoyan en la misma línea de la tarjeta. */

(function (global) {
  "use strict";

  var L = 1.0;               /* lado del plano: el ave desborda la tarjeta
                                 por arriba (efecto de "salir de la tarjeta") */
  var YCAJA = -0.15;         /* borde inferior de la caja impresa */
  var XC = 0;                /* centro óptico del ave en X (fotos centradas) */

  /* fracción vertical de los pies en el lienzo de 800 px (piesY/800).
     preparar_fotos.py fija los pies de TODAS las especies en 0.90; el
     mapa queda solo para ajustes puntuales por especie. */
  var MEDIDAS = {};

  /* Pinta la trama de la caja impresa sobre el panel para que quede
     invisible sobre la tarjeta (mismo papel + decoración + banda de piso,
     sin el dibujo). Se rasteriza desde el SVG compartido (aves-svg.js). */
  function pintarFondoPanel(panel, ave) {
    if (typeof AvesSVG === "undefined" || !AvesSVG.fondoSVG) return;
    var SVG_NS = "http://www.w3.org/2000/svg";
    try {
      var svg = '<svg xmlns="' + SVG_NS + '" width="560" height="560" viewBox="0 0 400 400">' +
        AvesSVG.fondoSVG(ave, { colorFondo: "#f6efdf" }) + "</svg>";
      var uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      var img = new Image();
      img.onload = function () {
        var cv = document.createElement("canvas");
        var cv = document.createElement("canvas");
        cv.width = 560; cv.height = 560;
        var c = cv.getContext("2d");
        c.drawImage(img, 0, 0, 560, 560);
        var aplicar = function () {
          var mesh = panel.getObject3D("mesh");
          if (!mesh || !mesh.material) return false;
          var T = (typeof AFRAME !== "undefined") ? AFRAME.THREE : null;
          if (!T) return false;
          var tex = new T.CanvasTexture(cv);
          if ("colorSpace" in tex && T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace;
          else if (T.sRGBEncoding) tex.encoding = T.sRGBEncoding;
          var rend = (typeof AFRAME !== "undefined" && panel.sceneEl) ? panel.sceneEl.renderer : null;
          tex.anisotropy = rend ? rend.capabilities.getMaxAnisotropy() : 1;
          mesh.material.map = tex;
          mesh.material.color.set(0xffffff);
          mesh.material.needsUpdate = true;
          return true;
        };
        if (!aplicar()) panel.addEventListener("object3dset", aplicar);
      };
      img.src = uri;
    } catch (e) {
      /* queda el panel crema sólido */
    }
  }

  function ent(attrs) {
    var e = document.createElement("a-entity");
    for (var k in attrs) {
      if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    }
    return e;
  }

  function crearAve25D(ave, conPanel) {
    var fy = MEDIDAS[ave.id] || 0.90;
    var yPies = YCAJA + (1 - fy) * L;      /* altura de los pies sobre la tarjeta */

    var raiz = ent({});

    if (conPanel) {
      /* panel con el fondo EXACTO de la caja impresa (papel + decoración +
         banda de piso, sin el dibujo): enmascara la ilustración impresa y
         queda invisible sobre la tarjeta. Alineado a la caja impresa real
         (x 220..780, y 285..845 px de la tarjeta de 1000x1414 → centro
         y +0.142, lado 0.56). */
      var panel = ent({
        geometry: "primitive: plane; width: 0.575; height: 0.575",
        material: "shader: flat; side: front; color: #f6efdf",
        position: "0 0.142 0.001"
      });
      pintarFondoPanel(panel, ave);
      raiz.appendChild(panel);
    }

    /* sombra de contacto (queda plana sobre la tarjeta, no gira con el ave) */
    raiz.appendChild(ent({
      geometry: "primitive: circle; radius: 0.15",
      material: "shader: flat; color: #000000; transparent: true; opacity: 0.16",
      position: "0.01 " + (yPies + 0.002) + " 0.03",
      scale: "1 0.42 1"
    }));

    /* pivote en los pies: el billboard gira alrededor de donde se apoya */
    var pivote = ent({
      position: XC + " " + yPies + " 0.05",
      "mirar-camara": ""
    });
    var cuerpo = ent({ "corte-vivo": "", "nitido": "" });
    cuerpo.appendChild(ent({
      geometry: "primitive: plane; width: " + L + "; height: " + L,
      material: "shader: flat; side: front; transparent: true; alphaTest: 0.03;" +
        " src: #corte-" + ave.id,
      position: "0 " + ((fy - 0.5) * L) + " 0"
    }));
    pivote.appendChild(cuerpo);
    raiz.appendChild(pivote);

    return raiz;
  }

  /* registro único de los componentes (evita duplicados al recargar) */
  function registrar() {
    if (typeof AFRAME === "undefined") return;
    if (!AFRAME.components["mirar-camara"]) {
      /* billboard: el plano siempre de frente al espectador.
         La rotación se calcula en mundo y se convierte a local para
         respetar la orientación del ancla de MindAR. */
      AFRAME.registerComponent("mirar-camara", {
        init: function () {
          var T = AFRAME.THREE;
          this.vPos = new T.Vector3();
          this.vCam = new T.Vector3();
          this.vDir = new T.Vector3();
          this.vCru = new T.Vector3();
          this.qMun = new T.Quaternion();
          this.qPad = new T.Quaternion();
          this.mat = new T.Matrix4();
          this.up = new T.Vector3(0, 1, 0);
        },
        tick: function () {
          var cam = this.el.sceneEl && this.el.sceneEl.camera;
          if (!cam) return;
          this.el.object3D.getWorldPosition(this.vPos);
          cam.getWorldPosition(this.vCam);
          this.vDir.subVectors(this.vCam, this.vPos);
          var d2 = this.vDir.lengthSq();
          if (d2 < 1e-10) return;
          /* degenerado: la cámara queda casi sobre el eje vertical del plano
             (mirada cenital). lookAt con up paralelo da matriz basura y el
             ave desaparece/danza: en ese caso conservamos la última pose. */
          this.vCru.crossVectors(this.vDir, this.up);
          if (this.vCru.lengthSq() < 0.0025 * d2) return;
          this.mat.lookAt(this.vCam, this.vPos, this.up);
          this.qMun.setFromRotationMatrix(this.mat);
          this.el.parentEl.object3D.getWorldQuaternion(this.qPad).invert();
          this.qMun.premultiply(this.qPad);
          this.el.object3D.quaternion.copy(this.qMun);
        }
      });
    }
    if (!AFRAME.components["nitido"]) {
      /* foto nítida en movimiento:
         - alphaTest 0: el corte de la foto tiene bordes suaves; con alphaTest
           y mipmaps, los fragmentos suaves caían bajo el umbral y "se borraba"
           parte del ave al cambiar el tamaño en pantalla.
         - depthTest off: el plano de la tarjeta/panel nunca tapa el ave cuando
           el billboard se inclina en los ángulos rasantes.
         - anisotropía máxima: evita el desdibujo del plano visto de canto. */
      AFRAME.registerComponent("nitido", {
        init: function () {
          var el = this.el;
          var aplicar = function () {
            var mesh = el.getObject3D("mesh");
            if (!mesh || !mesh.material) return;
            var m = mesh.material;
            if (m.map) {
              var rend = el.sceneEl && el.sceneEl.renderer;
              m.map.anisotropy = rend ? rend.capabilities.getMaxAnisotropy() : 1;
              m.map.needsUpdate = true;
            }
            m.alphaTest = 0;
            m.depthTest = false;
            m.needsUpdate = true;
          };
          el.addEventListener("object3dset", aplicar);
          el.addEventListener("materialtextureloaded", aplicar);
          aplicar();
        }
      });
    }
    if (!AFRAME.components["corte-vivo"]) {
      AFRAME.registerComponent("corte-vivo", {
        init: function () { this.t = Math.random() * 10; },
        tick: function (time, dt) {
          this.t += dt / 1000;
          var t = this.t;
          /* saltocito cada 6 s; balanceo y aleteo con frecuencias que
             cierran en 6 s exactos (mismo ciclo que los videos del index) */
          var c = t % 6;
          var salto = c < 0.45 ? Math.sin(Math.PI * c / 0.45) * 0.018 : 0;
          this.el.object3D.position.y = Math.sin(t * (2 * Math.PI / 3)) * 0.005 + salto;
          this.el.object3D.rotation.z = Math.sin(t * (Math.PI / 3)) * 0.045;
        }
      });
    }
  }

  var API = { crearAve25D: crearAve25D, registrar: registrar, MEDIDAS: MEDIDAS, L: L, YCAJA: YCAJA };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  global.Aves25D = API;
})(typeof window !== "undefined" ? window : globalThis);
