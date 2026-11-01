/* Reproductor del canto de las aves (sonidos/<id>.mp3 de xeno-canto.org).
   - reproducir(id): suena en loop el canto de esa especie
   - parar() / alternar() de silencio (estado en localStorage)
   - desbloquear(): iOS exige un gesto previo; se llama desde los botones */
(function (global) {
  "use strict";

  var audio = new Audio();
  audio.loop = true;
  audio.volume = 0.55;
  var actual = null;
  var sil = false;
  try { sil = global.localStorage.getItem("aves-canto-mute") === "1"; } catch (e) {}

  function cantos() { return global.CANTOS || {}; }

  function intentar() {
    var p = audio.play();
    if (p && p.catch) p.catch(function (e) {
      /* Al cambiar rapido de especie la reproduccion se aborta
         ("interrupted by a new load request"). Reintentamos una vez
         cuando la fuente nueva ya esta lista. */
      if (e && e.name === "AbortError") {
        var rev = function () {
          audio.removeEventListener("canplay", rev);
          if (audio.getAttribute("data-ave") === actual && !sil) intentar();
        };
        audio.addEventListener("canplay", rev);
      }
    });
  }

  function reproducir(id) {
    var c = cantos()[id];
    if (!c) return;
    actual = id;
    if (sil) return;
    if (audio.getAttribute("data-ave") === id && !audio.paused) return;
    var cambio = audio.getAttribute("data-ave") !== id;
    audio.setAttribute("data-ave", id);
    if (cambio) {
      audio.src = "sonidos/" + c.archivo;
      try { audio.load(); } catch (e) {}
    }
    intentar();
  }

  function parar() {
    actual = null;
    audio.pause();
  }

  function silenciar(v) {
    sil = !!v;
    try { global.localStorage.setItem("aves-canto-mute", sil ? "1" : "0"); } catch (e) {}
    if (sil) {
      audio.pause();
    } else if (actual) {
      var id = actual;
      audio.removeAttribute("data-ave");
      actual = null;
      reproducir(id);
    }
  }

  function desbloquear() {
    if (!audio.paused) return;
    var ids = Object.keys(cantos());
    if (!ids.length) return;
    var v = audio.volume;
    audio.volume = 0.01;
    if (!audio.getAttribute("data-ave")) {
      audio.setAttribute("data-ave", ids[0]);
      audio.src = "sonidos/" + cantos()[ids[0]].archivo;
    }
    var fin = function () {
      try { audio.pause(); } catch (e) {}
      audio.volume = v;
    };
    var p = audio.play();
    if (p && p.then) p.then(fin).catch(fin);
    else fin();
  }

  global.Cantos = {
    reproducir: reproducir,
    parar: parar,
    alternar: function () { silenciar(!sil); },
    silenciado: function () { return sil; },
    desbloquear: desbloquear,
    sonando: function () { return actual && !audio.paused ? actual : null; }
  };
})(typeof window !== "undefined" ? window : globalThis);
