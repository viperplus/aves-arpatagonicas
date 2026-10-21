/* Ilustraciones SVG paramétricas de las aves.
   Se usan en la portada y en las tarjetas impresas.
   Vista lateral, mirando a la derecha, viewBox 0 0 400 400. */

(function (global) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Cuello largo (flamenco, choique): curva gruesa desde el cuerpo hasta la cabeza alta. */
  function cuelloLargo(p) {
    return (
      '<path d="M232 196 C 250 150, 250 110, 276 84" fill="none" stroke="' + p.cuerpo + '" stroke-width="30" stroke-linecap="round"/>' +
      '<path d="M236 200 C 254 158, 252 120, 274 96" fill="none" stroke="' + p.detalle + '" stroke-width="8" stroke-linecap="round" opacity="0.35"/>'
    );
  }

  /* Cuello medio (carancho, tero). */
  function cuelloMedio(p) {
    return (
      '<path d="M234 194 C 248 168, 252 150, 266 132" fill="none" stroke="' + p.cuerpo + '" stroke-width="26" stroke-linecap="round"/>'
    );
  }

  /* Penachos: cresta simple (carancho, cacholote) o flequillo hacia adelante (martineta).
     Se dibujan respecto al centro de la cabeza (hx, hy) y su radio. */
  function cresta(tipo, p, hx, hy, hr) {
    if (tipo === "adelante") {
      var x0 = hx - hr * 0.55, y0 = hy - hr * 0.82;
      return (
        '<path d="M' + x0 + ' ' + y0 + ' L ' + (x0 - 20) + ' ' + (y0 - 22) + ' L ' + (x0 + 6) + ' ' + (y0 - 4) + ' Z" fill="' + p.detalle + '"/>' +
        '<path d="M' + (x0 + 8) + ' ' + (y0 - 2) + ' L ' + (x0 - 8) + ' ' + (y0 - 28) + ' L ' + (x0 + 14) + ' ' + (y0 - 6) + ' Z" fill="' + p.cabeza + '"/>'
      );
    }
    if (tipo === true) {
      var bx = hx - hr * 0.35, by = hy - hr * 0.88;
      return (
        '<path d="M' + bx + ' ' + by + ' L ' + (bx - 4) + ' ' + (by - 24) + ' L ' + (bx + 10) + ' ' + (by - 2) + ' Z" fill="' + p.detalle + '"/>' +
        '<path d="M' + (bx + 8) + ' ' + (by - 1) + ' L ' + (bx + 8) + ' ' + (by - 27) + ' L ' + (bx + 18) + ' ' + (by - 2) + ' Z" fill="' + p.cabeza + '"/>' +
        '<path d="M' + (bx + 16) + ' ' + by + ' L ' + (bx + 24) + ' ' + (by - 20) + ' L ' + (bx + 28) + ' ' + (by + 1) + ' Z" fill="' + p.detalle + '"/>'
      );
    }
    return "";
  }

  /* Pico: gancho (rapaces), recto, fino, ganchudo (flamenco, curvado hacia abajo). */
  function pico(tipo, p, cx, cy) {
    if (tipo === "gancho") {
      return (
        '<path d="M' + cx + ' ' + (cy - 7) + ' L ' + (cx + 34) + ' ' + (cy - 2) + ' L ' + (cx + 30) + ' ' + (cy + 4) +
        ' Q ' + (cx + 26) + ' ' + (cy + 16) + ' ' + (cx + 16) + ' ' + (cy + 9) + ' Z" fill="' + p.pico + '"/>' +
        '<path d="M' + (cx + 14) + ' ' + (cy + 1) + ' L ' + (cx + 30) + ' ' + (cy + 4) + '" stroke="' + p.detalle + '" stroke-width="2" fill="none"/>'
      );
    }
    if (tipo === "ganchudo") {
      return (
        '<path d="M' + cx + ' ' + (cy - 8) +
        ' C ' + (cx + 30) + ' ' + (cy - 10) + ', ' + (cx + 40) + ' ' + (cy + 6) + ', ' + (cx + 26) + ' ' + (cy + 34) +
        ' L ' + (cx + 18) + ' ' + (cy + 30) +
        ' C ' + (cx + 30) + ' ' + (cy + 8) + ', ' + (cx + 22) + ' ' + (cy + 2) + ', ' + cx + ' ' + (cy + 6) + ' Z" fill="' + p.pico + '"/>' +
        '<path d="M' + (cx + 6) + ' ' + (cy + 2) + ' L ' + (cx + 22) + ' ' + (cy + 26) + '" stroke="' + p.detalle + '" stroke-width="2.5" fill="none"/>'
      );
    }
    if (tipo === "fino") {
      return (
        '<path d="M' + cx + ' ' + (cy - 5) + ' L ' + (cx + 30) + ' ' + cy + ' L ' + cx + ' ' + (cy + 5) + ' Z" fill="' + p.pico + '"/>'
      );
    }
    /* recto */
    return (
      '<path d="M' + cx + ' ' + (cy - 7) + ' L ' + (cx + 32) + ' ' + (cy - 1) + ' L ' + cx + ' ' + (cy + 7) + ' Z" fill="' + p.pico + '"/>'
    );
  }

  /* Cola: larga (cuña), corta, abierta (abanico de plumas). */
  function cola(tipo, p) {
    if (tipo === "larga") {
      return (
        '<path d="M120 214 L 30 250 L 40 268 L 132 240 Z" fill="' + p.cola + '"/>' +
        '<path d="M112 222 L 44 252" stroke="' + p.detalle + '" stroke-width="2.5" opacity="0.5"/>' +
        '<path d="M116 232 L 48 262" stroke="' + p.detalle + '" stroke-width="2.5" opacity="0.5"/>'
      );
    }
    if (tipo === "abierta") {
      return (
        '<path d="M124 210 L 42 226 L 46 244 L 130 232 Z" fill="' + p.cola + '"/>' +
        '<path d="M124 218 L 38 208 L 40 226 L 126 230 Z" fill="' + p.cola + '"/>' +
        '<path d="M122 226 L 44 252 L 52 268 L 132 238 Z" fill="' + p.cola + '"/>' +
        '<path d="M52 226 L 120 226" stroke="' + p.detalle + '" stroke-width="2" opacity="0.4"/>'
      );
    }
    /* corta */
    return (
      '<path d="M124 216 L 70 240 L 78 256 L 132 238 Z" fill="' + p.cola + '"/>' +
      '<path d="M82 246 L 126 232" stroke="' + p.detalle + '" stroke-width="2" opacity="0.5"/>'
    );
  }

  /* Marcas especiales por especie. */
  function marcas(id, p) {
    if (id === "tero") {
      return (
        /* collar blanco y pecho negro */
        '<path d="M238 168 C 252 156, 266 150, 276 150 L 272 176 C 258 176, 246 184, 238 194 Z" fill="' + p.detalle + '"/>' +
        '<ellipse cx="214" cy="238" rx="46" ry="34" fill="' + p.detalle + '" opacity="0.9"/>' +
        '<path d="M252 158 L 268 154" stroke="#f2f2ee" stroke-width="4"/>'
      );
    }
    if (id === "loica") {
      /* pecho rojo */
      return (
        '<ellipse cx="216" cy="236" rx="44" ry="32" fill="' + p.barriga + '"/>' +
        '<path d="M186 224 C 200 214, 226 212, 244 220" stroke="' + p.detalle + '" stroke-width="3" fill="none" opacity="0.5"/>'
      );
    }
    if (id === "carancho") {
      /* cara descubierta naranja + capucha oscura */
      return (
        '<path d="M262 128 C 274 122, 286 124, 292 134 C 296 144, 292 154, 282 158 C 270 162, 258 154, 256 142 Z" fill="#e08a2e"/>' +
        '<path d="M246 118 C 262 108, 284 112, 292 128 C 280 118, 262 116, 250 126 Z" fill="' + p.detalle + '"/>'
      );
    }
    if (id === "aguila") {
      /* pecho claro con veteado oscuro */
      return (
        '<path d="M180 210 C 200 198, 232 198, 250 214 C 252 240, 236 262, 208 262 C 186 262, 176 240, 180 210 Z" fill="' + p.barriga + '"/>' +
        '<path d="M192 226 L 214 222 M200 240 L 226 234 M214 252 L 234 246" stroke="' + p.detalle + '" stroke-width="3" opacity="0.55"/>'
      );
    }
    if (id === "chimango") {
      /* manchas claras en el ala */
      return (
        '<path d="M150 226 L 176 220 M158 240 L 186 232 M168 252 L 196 244" stroke="' + p.barriga + '" stroke-width="4" opacity="0.7"/>'
      );
    }
    if (id === "cacholote") {
      /* garganta más clara */
      return '<path d="M244 156 C 258 150, 272 152, 278 162 C 268 172, 250 172, 242 164 Z" fill="' + p.barriga + '"/>';
    }
    if (id === "choique") {
      /* parche blanco en el ala */
      return '<ellipse cx="188" cy="222" rx="34" ry="16" transform="rotate(-14 188 222)" fill="' + p.detalle + '" opacity="0.9"/>';
    }
    if (id === "flamenco") {
      /* ala con punta negra visible en reposo */
      return (
        '<path d="M148 224 C 170 214, 200 214, 220 226 C 214 244, 190 254, 164 248 C 150 244, 144 234, 148 224 Z" fill="' + p.ala + '"/>' +
        '<path d="M150 232 L 128 246 L 138 254 L 158 244 Z" fill="' + p.cola + '"/>'
      );
    }
    return "";
  }

  /* Ilustración completa de una ave. */
  function dibujarAve(ave, opts) {
    opts = opts || {};
    var p = ave.paleta;
    var f = ave.forma;
    var partes = [];

    /* suelo / sombra */
    if (opts.sombra !== false) {
      partes.push('<ellipse cx="190" cy="358" rx="110" ry="12" fill="#000" opacity="0.10"/>');
    }

    /* patas */
    var largoPata = f.patas === "largas" ? 92 : f.patas === "medianas" ? 62 : 48;
    var yPata = f.cuello === "largo" ? 250 : 262;
    partes.push(
      '<g stroke-linecap="round">' +
      '<path d="M168 ' + yPata + ' L 160 ' + (yPata + largoPata - 16) + ' L 152 ' + (yPata + largoPata) + '" fill="none" stroke="' + p.patas + '" stroke-width="7"/>' +
      '<path d="M208 ' + (yPata + 4) + ' L 204 ' + (yPata + largoPata - 18) + ' L 212 ' + (yPata + largoPata) + '" fill="none" stroke="' + p.patas + '" stroke-width="7"/>' +
      '<path d="M152 ' + (yPata + largoPata) + ' L 134 ' + (yPata + largoPata + 3) + ' M152 ' + (yPata + largoPata) + ' L 164 ' + (yPata + largoPata + 4) + '" stroke="' + p.patas + '" stroke-width="5"/>' +
      '<path d="M212 ' + (yPata + largoPata) + ' L 196 ' + (yPata + largoPata + 3) + ' M212 ' + (yPata + largoPata) + ' L 226 ' + (yPata + largoPata + 4) + '" stroke="' + p.patas + '" stroke-width="5"/>' +
      "</g>"
    );

    /* cola (detrás del cuerpo) */
    partes.push(cola(f.cola, p));

    /* cuello largo */
    if (f.cuello === "largo") partes.push(cuelloLargo(p));
    if (f.cuello === "medio") partes.push(cuelloMedio(p));

    /* cuerpo */
    if (f.cuello === "largo") {
      partes.push('<ellipse cx="190" cy="212" rx="82" ry="56" transform="rotate(-6 190 212)" fill="' + p.cuerpo + '"/>');
      partes.push('<path d="M150 232 C 170 258, 214 264, 246 248" fill="none" stroke="' + p.barriga + '" stroke-width="16" stroke-linecap="round" opacity="0.85"/>');
    } else {
      partes.push('<ellipse cx="190" cy="216" rx="86" ry="60" transform="rotate(-8 190 216)" fill="' + p.cuerpo + '"/>');
      partes.push('<path d="M148 240 C 168 266, 216 272, 250 252" fill="none" stroke="' + p.barriga + '" stroke-width="18" stroke-linecap="round" opacity="0.9"/>');
    }

    /* cabeza */
    var hx, hy, hr;
    if (f.cuello === "largo") { hx = 278; hy = 82; hr = 26; }
    else if (f.cuello === "medio") { hx = 270; hy = 124; hr = 30; }
    else { hx = 274; hy = 140; hr = 34; }

    /* penacho (debajo de la cabeza, para que quede cubierto en la base) */
    var cCresta = cresta(f.cresta === true ? true : f.cresta === "adelante" ? "adelante" : false, p, hx, hy, hr);
    if (cCresta) partes.push(cCresta);

    /* marcas (pecho, ala, cara) */
    if (ave.id !== "carancho") partes.push(marcas(ave.id, p));

    /* ala plegada */
    partes.push(
      '<ellipse cx="192" cy="212" rx="58" ry="36" transform="rotate(-16 192 212)" fill="' + p.ala + '"/>' +
      '<path d="M148 224 C 168 208, 206 200, 236 208" fill="none" stroke="' + p.detalle + '" stroke-width="3" opacity="0.45"/>' +
      '<path d="M154 236 C 176 220, 210 214, 238 220" fill="none" stroke="' + p.detalle + '" stroke-width="3" opacity="0.35"/>'
    );

    /* cabeza + cara */
    partes.push('<circle cx="' + hx + '" cy="' + hy + '" r="' + hr + '" fill="' + p.cabeza + '"/>');
    if (ave.id === "carancho") {
      partes.push(marcas("carancho", p));
    }

    /* ojo */
    partes.push('<circle cx="' + (hx + 10) + '" cy="' + (hy - 6) + '" r="7.5" fill="#fff"/>');
    partes.push('<circle cx="' + (hx + 11) + '" cy="' + (hy - 6) + '" r="4.5" fill="' + p.ojo + '"/>');
    partes.push('<circle cx="' + (hx + 13) + '" cy="' + (hy - 8) + '" r="1.5" fill="#fff"/>');

    /* pico */
    partes.push(pico(f.pico, p, hx + hr - 4, hy + 2));

    return partes.join("");
  }

  /* SVG completo con fondo (para tarjetas y portada). */
  function aveSVG(ave, opts) {
    opts = opts || {};
    var w = opts.width || 400;
    var h = opts.height || 400;
    var fondo = opts.fondo === false ? "" :
      '<rect width="400" height="400" fill="' + (opts.colorFondo || "#f3ead8") + '"/>' +
      (opts.textura === false ? "" :
        '<g opacity="0.16" fill="' + (ave.color || "#5a4526") + '">' +
        '<circle cx="40" cy="40" r="2.2"/><circle cx="90" cy="28" r="1.6"/><circle cx="150" cy="46" r="2"/><circle cx="220" cy="30" r="1.7"/><circle cx="300" cy="44" r="2.1"/><circle cx="360" cy="26" r="1.6"/>' +
        '<circle cx="30" cy="110" r="1.7"/><circle cx="370" cy="120" r="2"/><circle cx="26" cy="200" r="2.1"/><circle cx="374" cy="210" r="1.7"/>' +
        '<circle cx="36" cy="300" r="1.6"/><circle cx="90" cy="330" r="2"/><circle cx="310" cy="320" r="1.7"/><circle cx="366" cy="300" r="2.1"/>' +
        "</g>") +
      (opts.horizonte === false ? "" :
        '<path d="M0 352 Q 100 342, 200 350 T 400 348 L 400 400 L 0 400 Z" fill="' + (ave.color || "#5a4526") + '" opacity="0.18"/>');

    return (
      '<svg xmlns="' + NS + '" viewBox="0 0 400 400" width="' + w + '" height="' + h + '" role="img" aria-label="Ilustración de ' + esc(ave.nombre) + '">' +
      fondo +
      dibujarAve(ave, opts) +
      "</svg>"
    );
  }

  var API = { aveSVG: aveSVG, dibujarAve: dibujarAve };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  }
  global.AvesSVG = API;
})(typeof window !== "undefined" ? window : globalThis);
