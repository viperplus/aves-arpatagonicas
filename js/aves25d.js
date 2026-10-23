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

  var L = 0.56;              /* lado del plano = caja de la ilustración */
  var YCAJA = -0.15;         /* borde inferior de la caja impresa */
  var XC = 0;                /* centro óptico del ave en X (fotos centradas) */

  /* fracción vertical de los pies en el lienzo de 800 px (piesY/800) */
  var MEDIDAS = {
    chimango: 0.90, carancho: 0.90, tero: 0.90, martineta: 0.90,
    choique: 0.90, cacholote: 0.90, loica: 0.90, aguila: 0.90,
    flamenco: 0.90
  };

  function ent(attrs) {
    var e = document.createElement("a-entity");
    for (var k in attrs) {
      if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    }
    return e;
  }

  function crearAve25D(ave, conPanel) {
    var fy = MEDIDAS[ave.id] || 0.84;
    var yPies = YCAJA + (1 - fy) * L;      /* altura de los pies sobre la tarjeta */

    var raiz = ent({});

    if (conPanel) {
      /* panel del color exacto de la tarjeta: tapa la ilustración impresa */
      raiz.appendChild(ent({
        geometry: "primitive: plane; width: 0.64; height: 0.66",
        material: "shader: flat; color: #f6efdf; side: front",
        position: "0 0.13 0.001"
      }));
    }

    /* sombra de contacto (queda plana sobre la tarjeta, no gira con el ave) */
    raiz.appendChild(ent({
      geometry: "primitive: circle; radius: 0.09",
      material: "shader: flat; color: #000000; transparent: true; opacity: 0.16",
      position: "0.01 " + (yPies + 0.002) + " 0.03",
      scale: "1 0.42 1"
    }));

    /* pivote en los pies: el billboard gira alrededor de donde se apoya */
    var pivote = ent({
      position: XC + " " + yPies + " 0.05",
      "mirar-camara": ""
    });
    var cuerpo = ent({ "corte-vivo": "" });
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
          if (this.vPos.distanceToSquared(this.vCam) < 1e-8) return;
          this.mat.lookAt(this.vCam, this.vPos, this.up);
          this.qMun.setFromRotationMatrix(this.mat);
          this.el.parentEl.object3D.getWorldQuaternion(this.qPad).invert();
          this.qMun.premultiply(this.qPad);
          this.el.object3D.quaternion.copy(this.qMun);
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
