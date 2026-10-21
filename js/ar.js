/* Lógica del visor AR: arranque de cámara, detección de tarjetas,
   ficha del ave detectada y modo demo (sin cámara). */

(function () {
  "use strict";

  var escena, sistema, listaTargets = [];
  var actual = null;      /* índice del ave detectada */
  var modoDemo = false;
  var demoAnchor = null;

  function $(id) { return document.getElementById(id); }

  function cuandoListaEscena(cb) {
    if (!escena) escena = $("escena");
    if (escena.hasLoaded) cb();
    else escena.addEventListener("loaded", cb);
  }

  /* ---------- ficha ---------- */
  function mostrarFicha(i) {
    var a = window.AVES[i];
    if (!a) return;
    actual = i;
    $("ficha-grupo").textContent = a.grupo;
    $("ficha-grupo").style.background = a.color;
    $("ficha-nombre").textContent = a.nombre;
    $("ficha-cientifico").textContent = a.cientifico;
    $("ficha-tam").textContent = a.tamano;
    $("ficha-ali").textContent = a.alimento;
    $("ficha-hab").textContent = a.habitat;
    $("ficha-dato").textContent = a.dato;
    $("ficha").classList.remove("oculto");
    estado("Tarjeta detectada ✓ " + a.nombre, true);
  }

  function ocultarFicha() {
    $("ficha").classList.add("oculto");
    actual = null;
    if (!modoDemo) estado("Apuntá a una tarjeta…", false);
    else ajustarDemo();
  }

  function estado(txt, ok) {
    var e = $("estado");
    e.textContent = txt;
    e.classList.toggle("ok", !!ok);
  }

  /* ---------- crear los anclas (una por tarjeta) ---------- */
  function crearAnclas() {
    window.AVES.forEach(function (ave, i) {
      var ancla = document.createElement("a-entity");
      ancla.setAttribute("mindar-image-target", "targetIndex: " + i);
      var ave3d = window.Aves3D.crearAve3D(ave);
      ancla.appendChild(ave3d);
      escena.appendChild(ancla);

      ancla.addEventListener("targetFound", function () { mostrarFicha(i); });
      ancla.addEventListener("targetLost", function () {
        if (actual === i) ocultarFicha();
      });
      listaTargets.push(ancla);
    });
  }

  /* ---------- cámara ---------- */
  function iniciarCamara() {
    $("aviso-error").classList.add("oculto");
    $("intro").classList.add("oculto");
    $("hud").classList.remove("oculto");
    modoDemo = false;
    quitarDemo();
    estado("Iniciando cámara…", false);

    try {
      sistema.start();
    } catch (e) {
      onErrCamara();
    }
  }

  function onErrCamara() {
    /* volvemos a la pantalla de inicio y mostramos el motivo */
    try { sistema.stop(); } catch (e) {}
    $("hud").classList.add("oculto");
    var aviso = $("aviso-error");
    aviso.textContent = "No se pudo abrir la cámara (permiso denegado o navegador sin soporte). " +
      "Probá con «Ver sin cámara (demo)» o abrí la página con HTTPS.";
    aviso.classList.remove("oculto");
    $("intro").classList.remove("oculto");
  }

  function detener() {
    try { sistema.stop(); } catch (e) {}
    $("hud").classList.add("oculto");
    ocultarFicha();
    quitarDemo();
    $("intro").classList.remove("oculto");
  }

  /* ---------- modo demo (sin cámara) ---------- */
  function iniciarDemo() {
    try { sistema.stop(); } catch (e) {}
    modoDemo = true;
    $("intro").classList.add("oculto");
    $("hud").classList.add("oculto");
    ocultarFicha();
    $("demo").classList.remove("oculto");
    $("contenedor-ar").classList.add("fondo-demo");

    /* ancla libre frente a la cámara (que mira -Z) */
    demoAnchor = document.createElement("a-entity");
    demoAnchor.setAttribute("position", "0 -0.1 -1.15");
    demoAnchor.setAttribute("scale", "1.35 1.35 1.35");
    demoAnchor.setAttribute("rotar-demo", "");
    escena.appendChild(demoAnchor);

    ponerAveDemo(0);
    construirChips();
  }

  function ponerAveDemo(i) {
    if (!demoAnchor) return;
    while (demoAnchor.firstChild) demoAnchor.removeChild(demoAnchor.firstChild);
    var ave = window.AVES[i];
    demoAnchor.appendChild(window.Aves3D.crearAve3D(ave));
    mostrarFichaDemo(i);
    /* marcar chip activo */
    var chips = document.querySelectorAll("#demo-chips .chip");
    chips.forEach(function (c, k) { c.classList.toggle("activo", k === i); });
    /* medir cuando A-Frame ya inicializó la entidad */
    requestAnimationFrame(function () {
      requestAnimationFrame(ajustarDemo);
    });
  }

  /* Centra y escala el ave en el espacio libre entre el panel de
     especies (arriba) y la ficha (abajo). Así nunca queda tapada. */
  function ajustarDemo() {
    if (!modoDemo || !demoAnchor || !demoAnchor.firstChild || typeof AFRAME === "undefined") return;
    var ave3d = demoAnchor.firstChild;
    var T = AFRAME.THREE;

    /* medir en coordenadas locales: primero el ancla a identidad */
    var objeto = demoAnchor.object3D;
    objeto.position.set(0, 0, -1.4);
    objeto.scale.set(1, 1, 1);
    objeto.rotation.set(0, 0, 0);
    objeto.updateMatrixWorld(true);

    var caja = new T.Box3().setFromObject(ave3d.object3D);
    var tam = new T.Vector3(), centro = new T.Vector3();
    caja.getSize(tam);
    caja.getCenter(centro);
    if (!isFinite(tam.y) || tam.y <= 0.001) return;

    var W = window.innerWidth, H = window.innerHeight;
    var panel = $("demo"), ficha = $("ficha");
    var arriba = panel.classList.contains("oculto") ? 10 : panel.getBoundingClientRect().bottom + 10;
    var abajo = ficha.classList.contains("oculto") ? H - 10 : ficha.getBoundingClientRect().top - 10;
    var libre = Math.max(80, abajo - arriba);

    var dist = 1.4;
    var fovGrados = (escena.camera && escena.camera.fov) || 80;
    var altoVisible = 2 * dist * Math.tan(fovGrados * Math.PI / 360);
    var anchoVisible = altoVisible * (W / H);

    var esc = Math.min(
      0.92 * (libre / H) * altoVisible / tam.y,
      0.92 * anchoVisible / Math.max(tam.x, 0.001)
    );
    esc = Math.max(0.15, Math.min(esc, 8));

    /* y del centro del espacio libre, en unidades de mundo */
    var centroPx = (arriba + abajo) / 2;
    var yCentro = -((centroPx - H / 2) / H) * altoVisible;

    objeto.scale.set(esc, esc, esc);
    objeto.position.set(-centro.x * esc, yCentro - centro.y * esc, -dist);
    objeto.updateMatrixWorld(true);
  }

  function mostrarFichaDemo(i) {
    mostrarFicha(i);
    /* en demo no mostramos el HUD de cámara, sólo la ficha */
    $("hud").classList.add("oculto");
    ajustarDemo();
  }

  function quitarDemo() {
    $("demo").classList.add("oculto");
    $("contenedor-ar").classList.remove("fondo-demo");
    if (demoAnchor && demoAnchor.parentNode) {
      demoAnchor.parentNode.removeChild(demoAnchor);
    }
    demoAnchor = null;
    modoDemo = false;
  }

  function construirChips() {
    var cont = $("demo-chips");
    cont.innerHTML = "";
    window.AVES.forEach(function (a, i) {
      var b = document.createElement("button");
      b.className = "chip" + (i === 0 ? " activo" : "");
      b.textContent = a.nombre;
      b.style.setProperty("--c", a.color);
      b.addEventListener("click", function () { ponerAveDemo(i); });
      cont.appendChild(b);
    });
  }

  /* ---------- componente: rotar con el dedo / mouse (demo) ---------- */
  function registrarRotar() {
    if (typeof AFRAME === "undefined" || AFRAME.components["rotar-demo"]) return;
    AFRAME.registerComponent("rotar-demo", {
      init: function () {
        this.rotY = 0;
        this.rotX = 0;
        this.vel = 0.15;      /* giro automático lento */
        this.auto = true;
        this.arrastre = false;
        this.ultX = 0;
        this.ultY = 0;
        var el = this.el;
        var self = this;

        function inicio(x, y) {
          self.arrastre = true;
          self.auto = false;
          self.ultX = x;
          self.ultY = y;
        }
        function mueve(x, y) {
          if (!self.arrastre) return;
          self.rotY += (x - self.ultX) * 0.01;
          self.rotX += (y - self.ultY) * 0.01;
          self.rotX = Math.max(-0.9, Math.min(0.9, self.rotX));
          self.ultX = x;
          self.ultY = y;
        }
        function fin() { self.arrastre = false; }

        var canvas = this.el.sceneEl.canvas;
        function engancha() {
          canvas = self.el.sceneEl.canvas || canvas;
          if (!canvas) return;
          canvas.addEventListener("touchstart", function (e) {
            if (e.touches[0]) inicio(e.touches[0].clientX, e.touches[0].clientY);
          }, { passive: true });
          canvas.addEventListener("touchmove", function (e) {
            if (e.touches[0]) mueve(e.touches[0].clientX, e.touches[0].clientY);
          }, { passive: true });
          canvas.addEventListener("touchend", fin);
          canvas.addEventListener("mousedown", function (e) { inicio(e.clientX, e.clientY); });
          window.addEventListener("mousemove", function (e) { mueve(e.clientX, e.clientY); });
          window.addEventListener("mouseup", fin);
        }
        if (this.el.sceneEl.canvas) engancha();
        else this.el.sceneEl.addEventListener("renderstart", engancha);
      },
      tick: function (dt) {
        if (this.auto) this.rotY += this.vel * dt / 1000;
        this.el.object3D.rotation.y = this.rotY;
        this.el.object3D.rotation.x = this.rotX;
      }
    });
  }

  /* ---------- arranque ---------- */
  function arrancar() {
    escena = $("escena");
    registrarRotar();

    cuandoListaEscena(function () {
      /* el sistema se registra al inicializarse la escena */
      sistema = escena.systems["mindar-image-system"];
      crearAnclas();

      escena.addEventListener("arReady", function () {
        estado("Apuntá a una tarjeta…", false);
      });
      escena.addEventListener("arError", onErrCamara);

      $("btn-iniciar").addEventListener("click", iniciarCamara);
      $("btn-demo").addEventListener("click", iniciarDemo);
      $("btn-detener").addEventListener("click", detener);
      $("ficha-cerrar").addEventListener("click", ocultarFicha);
      $("demo-cerrar").addEventListener("click", function () {
        quitarDemo();
        ocultarFicha();
        $("intro").classList.remove("oculto");
      });
      $("demo-plegar").addEventListener("click", function () {
        var p = $("demo");
        p.classList.toggle("contraido");
        this.textContent = p.classList.contains("contraido") ? "+" : "−";
        ajustarDemo();
      });
      window.addEventListener("resize", function () { if (modoDemo) ajustarDemo(); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
