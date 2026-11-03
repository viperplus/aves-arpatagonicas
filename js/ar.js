/* Lógica del visor AR: arranque de cámara, detección de tarjetas,
   ficha del ave detectada y modo demo (sin cámara). */

(function () {
  "use strict";

  var escena, sistema, listaTargets = [];
  var actual = null;      /* índice del ave detectada */
  var modoDemo = false;
  var demoAnchor = null;
  var descubiertos = [];

  function cargarDescubidos() {
    try { var t = localStorage.getItem("aves-descubiertas"); descubiertos = t ? JSON.parse(t) : []; } catch (e) { descubiertos = []; }
  }
  function marcarDescubida(id) {
    if (descubiertos.indexOf(id) === -1) {
      descubiertos.push(id);
      try { localStorage.setItem("aves-descubiertas", JSON.stringify(descubiertos)); } catch (e) {}
    }
  }
  function actualizarDescubidos() {
    var e = $("descubiertos");
    if (!e) return;
    var n = descubiertos.length;
    e.textContent = "🔎 Descubrimientos: " + n + "/" + window.AVES.length;
    e.classList.toggle("oculto", n === 0);
  }

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
    var ficha = $("ficha");
    ficha.classList.remove("oculto");
    ficha.classList.remove("brillo");
    void ficha.offsetWidth;
    ficha.classList.add("brillo");
    setTimeout(function(){ ficha.classList.remove("brillo"); }, 900);
    estado("Tarjeta detectada ✓ " + a.nombre, true);
    marcarDescubida(a.id);
    actualizarDescubidos();
    if (window.Cantos) window.Cantos.reproducir(a.id);
    /* reintento de seguridad: en algunos móviles el primer play() se
       descarta por la política de autoplay; volvemos a intentarlo. */
    if (window.Cantos) {
      setTimeout(function () {
        if (window.Cantos.sonando() !== a.id) window.Cantos.reproducir(a.id);
      }, 350);
    }
  }

  function ocultarFicha() {
    $("ficha").classList.add("oculto");
    actual = null;
    if (window.Cantos) window.Cantos.parar();
    if (!modoDemo) estado("Apuntá a una tarjeta…", false);
    else ajustarDemo();
  }

  function estado(txt, ok) {
    var elEst = $("estado");
    elEst.textContent = txt;
    elEst.classList.toggle("ok", !!ok);
  }

  function actualizarDescubidos() {
    var el = $("descubiertos");
    if (!el) return;
    var n = descubiertos.length;
    el.textContent = "🔎 Descubrimientos: " + n + "/" + (window.AVES ? window.AVES.length : 22);
    el.classList.toggle("oculto", n === 0);
  }

  /* ---------- crear los anclas (una por tarjeta) ---------- */
  function crearAnclas() {
    window.AVES.forEach(function (ave, i) {
      var ancla = document.createElement("a-entity");
      ancla.setAttribute("mindar-image-target", "targetIndex: " + i);
      /* pegar directo al ancla - sin capa intermedia para minimizar latencia */
      var raiz = window.Aves25D.crearAve25D(ave, false);
      raiz.setAttribute("suavizar-ancla", "");
      ancla.appendChild(raiz);
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
    if (window.Cantos) window.Cantos.desbloquear();
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
    if (window.Cantos) window.Cantos.desbloquear();
    $("intro").classList.add("oculto");
    $("hud").classList.add("oculto");
    ocultarFicha();
    $("demo").classList.remove("oculto");
    $("contenedor-ar").classList.add("fondo-demo");

    /* ancla libre frente a la cámara (que mira -Z) */
    demoAnchor = document.createElement("a-entity");
    demoAnchor.setAttribute("position", "0 -0.1 -1.15");
    demoAnchor.setAttribute("scale", "1.35 1.35 1.35");
    escena.appendChild(demoAnchor);

    ponerAveDemo(0);
    construirChips();
  }

  function ponerAveDemo(i) {
    if (!demoAnchor) return;
    while (demoAnchor.firstChild) demoAnchor.removeChild(demoAnchor.firstChild);
    var ave = window.AVES[i];
    demoAnchor.appendChild(window.Aves25D.crearAve25D(ave, false));
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

  function registrarSuavizado() {
    if (typeof AFRAME === "undefined" || AFRAME.components["suavizar-ancla"]) return;
    AFRAME.registerComponent("suavizar-ancla", {
      schema: {
        lerp: { type: "number", default: 0.92 }
      },
      init: function () {
        var T = AFRAME.THREE;
        this.ancla = null;
        this.primera = true;
        this.posS = new T.Vector3();
        this.quaS = new T.Quaternion();
        this.posR = new T.Vector3();
        this.quaR = new T.Quaternion();
        this.posAnt = new T.Vector3();
        this.mInv = new T.Matrix4();
        this.mSuave = new T.Matrix4();
        this.mLocal = new T.Matrix4();
      },
      tick: function (time, dt) {
        if (!this.ancla) this.ancla = this.el.parentEl;
        var ancla = this.ancla;
        if (!ancla || !ancla.object3D) return;
        if (!ancla.object3D.visible) { this.primera = true; return; }

        var crudo = ancla.object3D.matrix;
        crudo.decompose(this.posR, this.quaR, new (AFRAME.THREE.Vector3)());

        if (this.primera) {
          this.primera = false;
          this.posS.copy(this.posR);
          this.posAnt.copy(this.posR);
          this.quaS.copy(this.quaR);
          return;
        }

        var dist = this.posAnt.distanceTo(this.posR);
        if (dist > 0.12) {
          this.posS.copy(this.posR);
          this.quaS.copy(this.quaR);
        } else {
          this.posS.lerp(this.posR, this.data.lerp);
          this.quaS.slerp(this.quaR, this.data.lerp);
        }
        this.posAnt.copy(this.posR);

        this.mInv.copy(crudo).invert();
        this.mSuave.compose(this.posS, this.quaS, ancla.object3D.scale);
        this.mLocal.multiplyMatrices(this.mInv, this.mSuave);
        this.mLocal.decompose(this.el.object3D.position, this.el.object3D.quaternion, this.el.object3D.scale);
      }
    });
  }

  /* ---------- silencio del canto ---------- */
  function actualizarMudo() {
    var sil = window.Cantos && window.Cantos.silenciado();
    ["btn-muto", "btn-muto-demo"].forEach(function (id) {
      var b = $(id);
      if (b) {
        b.textContent = sil ? "🔇" : "🔊";
        b.title = sil ? "Activar canto" : "Silenciar canto";
      }
    });
  }

  function conectarMudo(id) {
    var b = $(id);
    if (!b) return;
    b.addEventListener("click", function () {
      window.Cantos.desbloquear();
      window.Cantos.alternar();
      actualizarMudo();
    });
  }

  /* ---------- arranque ---------- */
  function arrancar() {
    escena = $("escena");
    if (window.Aves25D) window.Aves25D.registrar();
    registrarSuavizado();
    actualizarMudo();
    conectarMudo("btn-muto");
    conectarMudo("btn-muto-demo");

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
