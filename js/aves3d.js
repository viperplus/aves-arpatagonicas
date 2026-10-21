/* Modelos 3D de las aves, hechos con primitivas de A-Frame.
   Se anclan a la tarjeta: 1 unidad local = ancho de la tarjeta.
   Convención MindAR: la tarjeta está en XY, +Z sale hacia el viewer,
   +Y es "arriba" (hacia el borde superior de la tarjeta).
   Se construyen en Y-up y con un leve offset en +Z para "flotar" sobre la tarjeta. */

(function (global) {
  "use strict";

  /* crea una entidad A-Frame con los atributos dados */
  function ent(attrs) {
    var e = document.createElement("a-entity");
    for (var k in attrs) {
      if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    }
    return e;
  }

  function material(color, opts) {
    var m = { color: color, roughness: 0.85, metalness: 0 };
    if (opts && opts.transparent) {
      m.transparent = true;
      m.opacity = opts.opacity;
    }
    return m;
  }

  /* esfera (posiblemente achatada y rotada) */
  function esfera(color, radio, pos, scale, rot) {
    return ent({
      geometry: "primitive: sphere; radius: " + radio + "; segmentsWidth: 16; segmentsHeight: 12",
      material: material(color),
      position: pos || "0 0 0",
      scale: scale || "1 1 1",
      rotation: rot || "0 0 0"
    });
  }

  /* caja (para cola, alas simples) */
  function caja(color, dim, pos, rot) {
    return ent({
      geometry: "primitive: box; width: " + dim[0] + "; height: " + dim[1] + "; depth: " + dim[2],
      material: material(color),
      position: pos,
      rotation: rot || "0 0 0"
    });
  }

  /* cono (pico, penacho, patas) */
  function cono(color, r, h, pos, rot) {
    return ent({
      geometry: "primitive: cone; radiusBottom: " + r + "; radiusTop: 0; height: " + h + "; segmentsRadial: 12",
      material: material(color),
      position: pos,
      rotation: rot || "0 0 0"
    });
  }

  /* cilindro (cuello, patas) */
  function cilindro(color, r, h, pos, rot, rTop) {
    return ent({
      geometry: "primitive: cylinder; radius: " + r + "; radiusTop: " + (rTop !== undefined ? rTop : r) +
        "; height: " + h + "; segmentsRadial: 12",
      material: material(color),
      position: pos,
      rotation: rot || "0 0 0"
    });
  }

  /* ojo completo (blanco + pupila) en una posición lateral */
  function ojo(pos) {
    var g = document.createElement("a-entity");
    g.setAttribute("position", pos);
    g.appendChild(esfera("#ffffff", 0.028, "0 0 0"));
    g.appendChild(esfera("#111111", 0.017, "0.014 0 0.014"));
    return g;
  }

  /* pico según forma */
  function pico(tipo, p, posBase) {
    var g = document.createElement("a-entity");
    g.setAttribute("position", posBase);
    var c = p.pico;
    if (tipo === "gancho") {
      /* cono hacia adelante + gancho bajado */
      g.appendChild(cono(c, 0.035, 0.11, "0.05 0 0", "0 0 -90"));
      g.appendChild(cono(c, 0.028, 0.07, "0.11 -0.03 0", "0 0 -150"));
    } else if (tipo === "ganchudo") {
      /* flamenco: cono grueso curvado hacia abajo */
      g.appendChild(cono(c, 0.038, 0.1, "0.04 0 0", "0 0 -90"));
      g.appendChild(cono(c, 0.032, 0.1, "0.1 -0.05 0", "0 0 -135"));
      /* punta negra */
      g.appendChild(esfera("#1a1a1a", 0.02, "0.13 -0.08 0"));
    } else if (tipo === "fino") {
      g.appendChild(cono(c, 0.02, 0.1, "0.05 0 0", "0 0 -90"));
    } else {
      /* recto */
      g.appendChild(cono(c, 0.03, 0.1, "0.05 0 0", "0 0 -90"));
    }
    return g;
  }

  /* penacho sobre la cabeza */
  function cresta(tipo, p, pos) {
    var g = document.createElement("a-entity");
    g.setAttribute("position", pos);
    if (tipo === "adelante") {
      /* martineta: flequillo hacia adelante */
      g.appendChild(cono(p.detalle, 0.02, 0.08, "0 -0.01 0", "0 0 40"));
      g.appendChild(cono(p.cabeza, 0.018, 0.07, "0.03 0 0", "0 0 25"));
    } else {
      /* cacholote / carancho: cresta erguida */
      g.appendChild(cono(p.detalle, 0.02, 0.07, "0 0 0", "0 0 0"));
      g.appendChild(cono(p.cabeza, 0.018, 0.06, "0.03 0 0", "0 0 -8"));
      g.appendChild(cono(p.detalle, 0.016, 0.05, "0.055 0 0", "0 0 -20"));
    }
    return g;
  }

  /* construcción de una ave completa */
  function crearAve3D(ave) {
    var p = ave.paleta;
    var f = ave.forma;

    /* raíz: se coloca sobre la tarjeta (+Z leve) */
    var raiz = document.createElement("a-entity");
    raiz.setAttribute("position", "0 0 0.04");

    /* contenedor que "camina" (balanceo) */
    var cuerpo = document.createElement("a-entity");
    raiz.appendChild(cuerpo);

    /* --- altura del cuerpo según largo de patas --- */
    var hPata = f.patas === "largas" ? 0.34 : f.patas === "medianas" ? 0.2 : 0.14;
    var yCuerpo = hPata + 0.13; /* centro del cuerpo sobre los pies */

    /* sombra suave en la tarjeta */
    raiz.appendChild(ent({
      geometry: "primitive: circle; radius: 0.16",
      material: material("#000000", { transparent: true, opacity: 0.22 }),
      position: "0 0 -0.03",
      rotation: "0 0 0"
    }));

    /* --- patas --- */
    var patas = document.createElement("a-entity");
    var largoP = hPata;
    var yMedio = yCuerpo - 0.1;
    [ -0.045, 0.045 ].forEach(function (z) {
      /* muslo */
      patas.appendChild(cilindro(p.patas, 0.016, 0.06, "0.01 " + (yMedio) + " " + z));
      /* pierna inferior */
      patas.appendChild(cilindro(p.patas, 0.012, largoP - 0.05, "0.01 " + (largoP / 2) + " " + z));
      /* dedos */
      patas.appendChild(caja(p.patas, [0.07, 0.012, 0.012], "0.03 0.008 " + z, "0 0 0"));
      patas.appendChild(caja(p.patas, [0.05, 0.012, 0.012], "0.01 0.008 " + (z + 0.02), "0 0 0"));
      patas.appendChild(caja(p.patas, [0.05, 0.012, 0.012], "0.01 0.008 " + (z - 0.02), "0 0 0"));
    });
    cuerpo.appendChild(patas);

    /* --- cuerpo (elipsoide alargado en X) --- */
    var cuerpoEnt = esfera(p.cuerpo, 0.15, "0 " + yCuerpo + " 0", "1.45 1 1.05", "0 0 -6");
    cuerpo.appendChild(cuerpoEnt);
    /* panza clara */
    cuerpo.appendChild(esfera(p.barriga, 0.13, "0.03 " + (yCuerpo - 0.045) + " 0", "1.25 0.8 1"));
    /* ala derecha (+Z) */
    var alaDer = esfera(p.ala, 0.12, "-0.01 " + (yCuerpo + 0.03) + " 0.075", "1.3 0.75 0.35", "0 0 -8");
    alaDer.classList.add("ala", "ala-der");
    cuerpo.appendChild(alaDer);
    /* ala izquierda (-Z) */
    var alaIzq = esfera(p.ala, 0.12, "-0.01 " + (yCuerpo + 0.03) + " -0.075", "1.3 0.75 0.35", "0 0 -8");
    alaIzq.classList.add("ala", "ala-izq");
    cuerpo.appendChild(alaIzq);

    /* --- cuello --- */
    var yCabeza, xCabeza;
    if (f.cuello === "largo") {
      /* flamenco / choique: cuello largo erguido */
      yCabeza = yCuerpo + 0.34;
      xCabeza = 0.12;
      /* segmentos del cuello formando una curva suave */
      var n = 6;
      for (var i = 0; i < n; i++) {
        var t = i / (n - 1);
        var x = 0.04 + t * (xCabeza - 0.04);
        var y = (yCuerpo + 0.06) + t * (yCabeza - yCuerpo - 0.06);
        cuerpo.appendChild(esfera(p.cuerpo, 0.045 - t * 0.012, x + " " + y + " 0"));
      }
    } else if (f.cuello === "medio") {
      yCabeza = yCuerpo + 0.2;
      xCabeza = 0.14;
      cuerpo.appendChild(cilindro(p.cuerpo, 0.045, 0.16,
        (0.1 + (xCabeza - 0.1) / 2) + " " + (yCuerpo + 0.12) + " 0", "0 0 -20"));
    } else {
      /* cuello corto: cabeza casi pegada al cuerpo */
      yCabeza = yCuerpo + 0.14;
      xCabeza = 0.15;
      cuerpo.appendChild(esfera(p.cuerpo, 0.07, "0.12 " + (yCuerpo + 0.08) + " 0"));
    }

    /* --- cabeza --- */
    var cabeza = document.createElement("a-entity");
    cabeza.setAttribute("position", xCabeza + " " + yCabeza + " 0");
    cabeza.appendChild(esfera(p.cabeza, 0.075, "0 0 0", "1.05 1 1"));

    /* ojos (ambos lados) */
    cabeza.appendChild(ojo("0.03 0.02 0.055"));
    cabeza.appendChild(ojo("0.03 0.02 -0.055"));

    /* pico */
    cabeza.appendChild(pico(f.pico, p, "0.05 -0.01 0"));

    /* penacho */
    if (f.cresta === true) cabeza.appendChild(cresta(true, p, "-0.01 0.07 0"));
    else if (f.cresta === "adelante") cabeza.appendChild(cresta("adelante", p, "0.01 0.07 0"));

    /* marcas faciales especiales */
    if (ave.id === "carancho") {
      /* cara naranja descubierta */
      cabeza.appendChild(esfera("#e08a2e", 0.045, "0.035 -0.005 0", "1 0.9 1.1"));
    }
    cuerpo.appendChild(cabeza);

    /* --- cola --- */
    var cola = document.createElement("a-entity");
    cola.setAttribute("position", (-0.19) + " " + (yCuerpo + 0.02) + " 0");
    if (f.cola === "larga") {
      cola.appendChild(caja(p.cola, [0.24, 0.03, 0.09], "-0.1 0 0", "0 0 12"));
      cola.appendChild(caja(p.detalle, [0.2, 0.006, 0.07], "-0.1 0.02 0", "0 0 12"));
    } else if (f.cola === "abierta") {
      cola.appendChild(caja(p.cola, [0.2, 0.03, 0.07], "-0.09 0 0", "0 12 14"));
      cola.appendChild(caja(p.cola, [0.2, 0.03, 0.07], "-0.09 0 0", "0 -12 14"));
      cola.appendChild(caja(p.cola, [0.18, 0.03, 0.06], "-0.08 0 0", "0 0 14"));
    } else {
      cola.appendChild(caja(p.cola, [0.14, 0.03, 0.08], "-0.06 0 0", "0 0 14"));
    }
    cuerpo.appendChild(cola);

    /* --- marcas de color especiales (pecho, etc.) --- */
    if (ave.id === "tero") {
      cuerpo.appendChild(esfera("#2e3540", 0.09, "0.06 " + (yCuerpo + 0.03) + " 0", "1 1.1 1.15"));
      cuerpo.appendChild(esfera("#f2f2ee", 0.075, "0.1 " + (yCuerpo + 0.09) + " 0", "0.9 0.9 1.1"));
    } else if (ave.id === "loica") {
      cuerpo.appendChild(esfera("#c94f2e", 0.1, "0.05 " + (yCuerpo - 0.01) + " 0", "1.1 1 1.1"));
    } else if (ave.id === "aguila") {
      cuerpo.appendChild(esfera("#e8e2d2", 0.11, "0.04 " + (yCuerpo - 0.01) + " 0", "1.2 0.95 1.05"));
    } else if (ave.id === "flamenco") {
      /* punta alar negra */
      cuerpo.appendChild(esfera("#1a1a1a", 0.05, "-0.14 " + (yCuerpo + 0.03) + " 0.08", "1.4 0.5 0.3"));
      cuerpo.appendChild(esfera("#1a1a1a", 0.05, "-0.14 " + (yCuerpo + 0.03) + " -0.08", "1.4 0.5 0.3"));
    } else if (ave.id === "chimango") {
      /* manchas claras en el ala */
      cuerpo.appendChild(esfera(p.barriga, 0.04, "-0.03 " + (yCuerpo + 0.06) + " 0.09", "1.6 0.5 0.2"));
    } else if (ave.id === "choique") {
      /* parche blanco alar */
      cuerpo.appendChild(esfera("#e8e2d2", 0.06, "-0.03 " + (yCuerpo + 0.05) + " 0.085", "1.4 0.7 0.25"));
    }

    /* animación de vuelo/balanceo */
    raiz.setAttribute("vuelo-ave", "");

    return raiz;
  }

  /* componente A-Frame: balanceo suave + aleteo ocasional */
  if (typeof AFRAME !== "undefined" && !AFRAME.components["vuelo-ave"]) {
    AFRAME.registerComponent("vuelo-ave", {
      init: function () {
        this.t = Math.random() * 10;
        this.alaDer = this.el.querySelector(".ala-der");
        this.alaIzq = this.el.querySelector(".ala-izq");
        this.cuerpo = this.el.firstChild;
      },
      tick: function (dt, ts) {
        this.t += dt / 1000;
        var t = this.t;
        /* balanceo vertical sutil del cuerpo */
        if (this.cuerpo) {
          this.cuerpo.object3D.position.y = Math.sin(t * 1.6) * 0.012;
          this.cuerpo.object3D.rotation.z = Math.sin(t * 1.1) * 0.05;
        }
        /* aleteo: rápido por ráfagas, luego quieto */
        var ciclo = t % 6;
        var aleteo = 0;
        if (ciclo < 1.2) {
          aleteo = Math.sin(ciclo * 18) * 0.5;
        } else {
          aleteo = Math.sin(t * 1.3) * 0.06;
        }
        if (this.alaDer) this.alaDer.object3D.rotation.x = aleteo;
        if (this.alaIzq) this.alaIzq.object3D.rotation.x = -aleteo;
      }
    });
  }

  var API = { crearAve3D: crearAve3D };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  global.Aves3D = API;
})(typeof window !== "undefined" ? window : globalThis);
