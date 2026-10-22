/* Modelos 3D de las aves, hechos con primitivas de A-Frame.
   Se anclan a la tarjeta: 1 unidad local = ancho de la tarjeta.
   Convención MindAR: la tarjeta está en XY, +Z sale hacia el viewer,
   +Y es "arriba" (hacia el borde superior de la tarjeta).
   El ave mira hacia +X, parada sobre la tarjeta con un leve offset en +Z.

   Estructura anatómica: cuerpo de tres elipsoides (pecho, vientre, raíz
   de cola), cuello de esferas encadenadas, cabeza con ojo-abalorio y
   pico embutido, alas plegadas con primarias, cola en abanico, patas
   finas con cuatro dedos y sombra de contacto. */

(function (global) {
  "use strict";

  /* silueta por especie: escala general y proporciones del cuerpo */
  var SILUETA = {
    chimango:  { escala: 1.00, cu: [1.45, 0.95, 0.86] },
    carancho:  { escala: 1.05, cu: [1.45, 0.95, 0.84] },
    tero:      { escala: 0.95, cu: [1.40, 1.00, 0.90] },
    martineta: { escala: 1.02, cu: [1.50, 1.10, 1.00] },
    choique:   { escala: 1.08, cu: [1.45, 1.12, 1.00] },
    cacholote: { escala: 0.92, cu: [1.40, 1.05, 0.95] },
    loica:     { escala: 0.86, cu: [1.40, 0.95, 0.85] },
    aguila:    { escala: 1.12, cu: [1.50, 0.98, 0.88] },
    flamenco:  { escala: 1.00, cu: [1.40, 0.92, 0.80] }
  };

  /* tamaño relativo del pico por especie */
  var PICO_ESC = { aguila: 1.2, carancho: 1.1, flamenco: 1.15, choique: 0.9, tero: 0.9 };

  /* crea una entidad A-Frame con los atributos dados */
  function ent(attrs) {
    var e = document.createElement("a-entity");
    for (var k in attrs) {
      if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    }
    return e;
  }

  function material(color, opts) {
    var m = { color: color, roughness: 0.88, metalness: 0 };
    if (opts && opts.transparent) {
      m.transparent = true;
      m.opacity = opts.opacity;
    }
    return m;
  }

  /* esfera (posiblemente achatada y rotada) */
  function esfera(color, radio, pos, scale, rot) {
    return ent({
      geometry: "primitive: sphere; radius: " + radio + "; segmentsWidth: 20; segmentsHeight: 14",
      material: material(color),
      position: pos || "0 0 0",
      scale: scale || "1 1 1",
      rotation: rot || "0 0 0"
    });
  }

  /* caja (cola, dedos, primarias) */
  function caja(color, dim, pos, rot) {
    return ent({
      geometry: "primitive: box; width: " + dim[0] + "; height: " + dim[1] + "; depth: " + dim[2],
      material: material(color),
      position: pos,
      rotation: rot || "0 0 0"
    });
  }

  /* cono (pico, penacho) */
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
        "; height: " + h + "; segmentsRadial: 10",
      material: material(color),
      position: pos,
      rotation: rot || "0 0 0"
    });
  }

  /* ojo: cuenta oscura con un destello, embutida en la cabeza.
      lado = +1 (ojo derecho, +Z) o -1 */
  function ojo(pos, lado, color) {
    var g = ent({ position: pos });
    g.appendChild(esfera(color || "#141414", 0.0115, "0 0 0"));
    g.appendChild(esfera("#ffffff", 0.0035, "0.004 0.004 " + (0.006 * lado)));
    return g;
  }

  /* pico según forma; escala relativa al tamaño de cabeza */
  function pico(tipo, p, posBase, esc) {
    esc = esc || 1;
    var g = ent({ position: posBase });
    if (tipo === "gancho") {
      /* rapaz: cono corto y gancho recurvado que parte de la punta */
      g.appendChild(cono(p.pico, 0.023 * esc, 0.068 * esc, 0.053 * esc + " -0.004 0", "0 0 -93"));
      g.appendChild(cono(p.pico, 0.012 * esc, 0.032 * esc,
        0.079 * esc + " " + (-0.022 * esc) + " 0", "0 0 150"));
    } else if (tipo === "ganchudo") {
      /* flamenco: pico grueso que baja en ángulo con punta negra */
      g.appendChild(cono(p.pico, 0.028 * esc, 0.055 * esc, 0.048 * esc + " -0.004 0", "0 0 -90"));
      g.appendChild(cono(p.pico, 0.024 * esc, 0.06 * esc, 0.084 * esc + " -0.034 0", "0 0 -128"));
      g.appendChild(cono(p.detalle, 0.017 * esc, 0.042 * esc, 0.105 * esc + " -0.063 0", "0 0 -136"));
    } else if (tipo === "fino") {
      g.appendChild(cono(p.pico, 0.013 * esc, 0.085 * esc, 0.056 * esc + " -0.005 0", "0 0 -95"));
    } else {
      /* recto */
      g.appendChild(cono(p.pico, 0.019 * esc, 0.078 * esc, 0.052 * esc + " -0.005 0", "0 0 -94"));
    }
    return g;
  }

  /* penacho sobre la cabeza */
  function cresta(tipo, p, pos) {
    var g = ent({ position: pos });
    if (tipo === "adelante") {
      /* flequillo hacia adelante (martineta) */
      g.appendChild(cono(p.detalle, 0.013, 0.07, "0.006 0.018 0", "0 0 -46"));
      g.appendChild(cono(p.cabeza, 0.011, 0.055, "-0.014 0.02 0", "0 0 -68"));
    } else {
      /* cresta erguida hacia atrás (carancho, cacholote) */
      g.appendChild(cono(p.cabeza, 0.013, 0.062, "0.006 0.022 0", "0 0 26"));
      g.appendChild(cono(p.detalle, 0.012, 0.055, "-0.018 0.022 0", "0 0 48"));
      g.appendChild(cono(p.cabeza, 0.01, 0.045, "-0.038 0.018 0", "0 0 66"));
    }
    return g;
  }

  /* patas finas con cuatro dedos; ligeramente desfasadas en X (paso) */
  function patas(p, hPata, yCuerpo) {
    var g = ent({ position: "0.012 0 0" });
    var tobillo = Math.max(0.05, hPata * 0.5);
    [{ z: 0.05, dx: 0.024 }, { z: -0.05, dx: -0.016 }].forEach(function (l) {
      var pierna = ent({ position: l.dx + " 0 " + l.z });
      /* tarsometatarso visible */
      pierna.appendChild(cilindro(p.patas, 0.0095, tobillo,
        "0 " + (tobillo / 2 + 0.012) + " 0"));
      /* muslo (cubierto de plumas arriba) */
      pierna.appendChild(cilindro(p.patas, 0.0125, Math.max(0.03, yCuerpo - 0.07 - tobillo),
        "0 " + ((yCuerpo - 0.07 + tobillo) / 2) + " 0"));
      /* dedos */
      pierna.appendChild(caja(p.patas, [0.058, 0.01, 0.011], "0.028 0.012 0"));
      pierna.appendChild(caja(p.patas, [0.048, 0.01, 0.011], "0.022 0.012 0.024", "0 42 0"));
      pierna.appendChild(caja(p.patas, [0.048, 0.01, 0.011], "0.022 0.012 -0.024", "0 -42 0"));
      pierna.appendChild(caja(p.patas, [0.038, 0.01, 0.011], "-0.016 0.012 0", "0 180 0"));
      g.appendChild(pierna);
    });
    return g;
  }

  /* cabeza completa (esfera, ojos, pico, cresta) en el origen local */
  function construirCabeza(p, f, ave, rCab) {
    var g = ent({});
    g.appendChild(esfera(p.cabeza, rCab, "0 0 0", "1.12 1 0.97"));
    var zf = rCab * 0.88;
    g.appendChild(ojo("0.024 " + (rCab * 0.3) + " " + zf, 1, p.ojo));
    g.appendChild(ojo("0.024 " + (rCab * 0.3) + " " + (-zf), -1, p.ojo));
    if (ave.id === "carancho") {
      /* cara descubierta y anaranjada */
      g.appendChild(esfera("#e08a2e", 0.04, "0.032 -0.006 0", "0.95 0.8 1.2"));
    }
    var escPico = (rCab / 0.053) * (PICO_ESC[ave.id] || 1);
    g.appendChild(pico(f.pico, p, "0.04 -0.006 0", escPico));
    if (f.cresta === true) g.appendChild(cresta(true, p, "-0.005 0.038 0"));
    else if (f.cresta === "adelante") g.appendChild(cresta("adelante", p, "0.005 0.04 0"));
    return g;
  }

  /* construcción de una ave completa.
     conPanel = true agrega un plano del color de la tarjeta detrás del ave,
     para enmascarar la ilustración impresa (solo en modo tarjeta AR). */
  function crearAve3D(ave, conPanel) {
    var p = ave.paleta;
    var f = ave.forma;
    var s = SILUETA[ave.id] || { escala: 1, cu: [1.45, 0.95, 0.86] };

    /* raíz: los pies coinciden con la ilustración impresa (y ≈ -0.05) */
    var raiz = ent({
      position: "0 -0.05 0.04",
      scale: s.escala + " " + s.escala + " " + s.escala
    });

    /* contenedor que "camina" (balanceo) — debe ser el primer hijo */
    var cuerpo = document.createElement("a-entity");
    raiz.appendChild(cuerpo);

    /* altura del cuerpo según largo de patas */
    var hPata = f.patas === "largas" ? 0.25 : 0.15;
    var yCuerpo = hPata + 0.08;

    /* sombra de contacto sobre la tarjeta (óvalo tenue bajo los pies) */
    raiz.appendChild(ent({
      geometry: "primitive: circle; radius: 0.13",
      material: material("#000000", { transparent: true, opacity: 0.16 }),
      position: "0.012 -0.014 -0.036",
      scale: "1 0.5 1"
    }));

    /* --- patas y pies --- */
    cuerpo.appendChild(patas(p, hPata, yCuerpo));

    /* --- cuerpo: tres elipsoides (pecho, abdomen, raíz de cola) --- */
    cuerpo.appendChild(esfera(p.cuerpo, 0.1, "0 " + yCuerpo + " 0",
      s.cu[0] + " " + s.cu[1] + " " + s.cu[2], "0 0 5"));
    cuerpo.appendChild(esfera(p.cuerpo, 0.078, "0.075 " + (yCuerpo + 0.02) + " 0", "1.1 1 0.95"));
    cuerpo.appendChild(esfera(p.cuerpo, 0.07, "-0.11 " + (yCuerpo - 0.01) + " 0", "1.1 0.9 0.92"));
    /* barriga clara (se integra al pecho, no cuelga) */
    cuerpo.appendChild(esfera(p.barriga, 0.078, "0.045 " + (yCuerpo - 0.042) + " 0", "1.3 0.6 1.02"));

    /* --- alas plegadas (llegan sobre la base de la cola) --- */
    var alaDer = esfera(p.ala, 0.09, "-0.03 " + (yCuerpo + 0.04) + " 0.073", "1.72 0.6 0.26", "0 0 -10");
    alaDer.classList.add("ala", "ala-der");
    cuerpo.appendChild(alaDer);
    var alaIzq = esfera(p.ala, 0.09, "-0.03 " + (yCuerpo + 0.04) + " -0.073", "1.72 0.6 0.26", "0 0 -10");
    alaIzq.classList.add("ala", "ala-izq");
    cuerpo.appendChild(alaIzq);
    /* primarias plegadas bajo el ala (no sobresalen como barras) */
    var colorPrim = ave.id === "flamenco" ? p.detalle : p.ala;
    [0.05, -0.05].forEach(function (z, i) {
      cuerpo.appendChild(caja(colorPrim, [0.095, 0.03, 0.042],
        "-0.13 " + (yCuerpo - 0.008) + " " + z, "0 " + (i ? -6 : 6) + " -8"));
    });

    /* --- cuello y cabeza --- */
    var cabezaPos;
    if (f.cuello === "largo" && ave.id === "flamenco") {
      /* cuello en S: sale del pecho, se curva hacia adelante y sube */
      var P0 = [0.05, yCuerpo + 0.05], P1 = [0.235, yCuerpo + 0.3], P2 = [0.125, yCuerpo + 0.5];
      var n = 14;
      for (var i = 0; i < n; i++) {
        var t = i / (n - 1), it = 1 - t;
        var bx = it * it * P0[0] + 2 * it * t * P1[0] + t * t * P2[0];
        var by = it * it * P0[1] + 2 * it * t * P1[1] + t * t * P2[1];
        cuerpo.appendChild(esfera(p.cuerpo, 0.052 - t * 0.017, bx + " " + by + " 0"));
      }
      cabezaPos = [P2[0] + 0.005, P2[1] + 0.045];
    } else if (f.cuello === "largo") {
      /* choique: cuello erguido */
      var n2 = 12;
      for (var j = 0; j < n2; j++) {
        var t2 = j / (n2 - 1);
        cuerpo.appendChild(esfera(p.cuerpo, 0.054 - t2 * 0.017,
          (0.05 + t2 * 0.09) + " " + (yCuerpo + 0.06 + t2 * 0.3) + " 0"));
      }
      cabezaPos = [0.155, yCuerpo + 0.4];
    } else if (f.cuello === "medio") {
      var n3 = 6;
      for (var k = 0; k < n3; k++) {
        var t3 = k / (n3 - 1);
        cuerpo.appendChild(esfera(p.cuerpo, 0.052 - t3 * 0.008,
          (0.07 + t3 * 0.05) + " " + (yCuerpo + 0.05 + t3 * 0.1) + " 0"));
      }
      cabezaPos = [0.14, yCuerpo + 0.185];
    } else {
      /* cuello corto: cabeza alerta casi sobre el pecho */
      cuerpo.appendChild(esfera(p.cuerpo, 0.052, "0.085 " + (yCuerpo + 0.055) + " 0", "1.15 1.05 1"));
      cabezaPos = [0.145, yCuerpo + 0.125];
    }

    var rCab = f.cuello === "largo" ? 0.045 : 0.053;
    var cabeza = construirCabeza(p, f, ave, rCab);
    cabeza.setAttribute("position", cabezaPos[0] + " " + cabezaPos[1] + " 0");
    cuerpo.appendChild(cabeza);

    /* tope de altura: que la cabeza no tape el título impreso de la tarjeta */
    var hBruto = cabezaPos[1] + rCab + (f.cresta ? 0.06 : 0);
    var sFinal = Math.min(s.escala, 0.47 / hBruto);
    raiz.setAttribute("scale", sFinal + " " + sFinal + " " + sFinal);

    /* --- cola en cuña: elipsoides achatados (se lee bien de perfil) --- */
    var cola = ent({ position: "-0.14 " + (yCuerpo + 0.035) + " 0" });
    if (f.cola === "larga") {
      cola.appendChild(esfera(p.cola, 0.08, "-0.062 -0.03 0", "1.7 0.42 0.75", "0 0 9"));
      cola.appendChild(esfera(p.cola, 0.07, "-0.058 -0.034 0.05", "1.6 0.4 0.58", "0 14 11"));
      cola.appendChild(esfera(p.cola, 0.07, "-0.058 -0.034 -0.05", "1.6 0.4 0.58", "0 -14 7"));
      /* banda oscura en la punta de la cola */
      cola.appendChild(esfera(p.detalle, 0.05, "-0.135 -0.028 0", "1.2 0.36 0.74", "0 0 9"));
    } else if (f.cola === "abierta") {
      cola.appendChild(esfera(p.cola, 0.08, "-0.072 -0.012 0", "1.85 0.5 0.7", "0 0 10"));
      cola.appendChild(esfera(p.cola, 0.07, "-0.066 -0.016 0.05", "1.7 0.42 0.55", "0 26 18"));
      cola.appendChild(esfera(p.cola, 0.07, "-0.066 -0.016 -0.05", "1.7 0.42 0.55", "0 -26 2"));
      cola.appendChild(esfera(p.detalle, 0.055, "-0.125 -0.002 0", "1.4 0.36 0.62", "0 0 10"));
    } else {
      cola.appendChild(esfera(p.cola, 0.07, "-0.058 -0.014 0", "1.6 0.45 0.7", "0 0 12"));
      cola.appendChild(esfera(p.cola, 0.06, "-0.054 -0.018 0.042", "1.5 0.4 0.55", "0 16 14"));
      cola.appendChild(esfera(p.cola, 0.06, "-0.054 -0.018 -0.042", "1.5 0.4 0.55", "0 -16 10"));
    }
    cuerpo.appendChild(cola);

    /* --- marcas de color especiales --- */
    if (ave.id === "tero") {
      /* banda pechera oscura y garganta blanca */
      cuerpo.appendChild(esfera(p.ala, 0.07, "0.1 " + (yCuerpo + 0.03) + " 0", "0.55 0.8 1.15"));
      cuerpo.appendChild(esfera(p.detalle, 0.055, "0.115 " + (yCuerpo + 0.1) + " 0", "0.7 0.7 1.05"));
    } else if (ave.id === "chimango") {
      /* parche claro en el ala */
      cuerpo.appendChild(esfera(p.barriga, 0.03, "-0.05 " + (yCuerpo + 0.075) + " 0.1", "1.7 0.4 0.3"));
      cuerpo.appendChild(esfera(p.barriga, 0.03, "-0.05 " + (yCuerpo + 0.075) + " -0.1", "1.7 0.4 0.3"));
    } else if (ave.id === "choique") {
      /* parche blanco en el ala */
      cuerpo.appendChild(esfera(p.detalle, 0.038, "-0.07 " + (yCuerpo - 0.025) + " 0.085", "1.5 0.55 0.5"));
      cuerpo.appendChild(esfera(p.detalle, 0.038, "-0.07 " + (yCuerpo - 0.025) + " -0.085", "1.5 0.55 0.5"));
    }

    /* animación de balanceo */
    raiz.setAttribute("vuelo-ave", "");

    if (conPanel) {
      /* enmascara la ilustración impresa; plano sin iluminación (flat)
         del mismo color de fondo de la tarjeta, detrás de todas las piezas */
      var cont = ent({ position: "0 0 0" });
      cont.appendChild(ent({
        geometry: "primitive: plane; width: 0.6; height: 0.46",
        material: "shader: flat; color: #f6efdf",
        position: "0 0.13 -0.08"
      }));
      cont.appendChild(raiz);
      return cont;
    }
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
      tick: function (time, dt) {
        this.t += dt / 1000;
        var t = this.t;
        /* balanceo vertical sutil del cuerpo */
        if (this.cuerpo) {
          this.cuerpo.object3D.position.y = Math.sin(t * 1.6) * 0.008;
          this.cuerpo.object3D.rotation.z = Math.sin(t * 1.1) * 0.035;
        }
        /* aleteo: rápido por ráfagas, luego quieto */
        var ciclo = t % 6;
        var aleteo = 0;
        if (ciclo < 1.2) {
          aleteo = Math.sin(ciclo * 14) * 0.35;
        } else {
          aleteo = Math.sin(t * 1.3) * 0.05;
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
