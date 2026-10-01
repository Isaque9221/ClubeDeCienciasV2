(function () {
  "use strict";

  var aparencia = "auto";
  try {
    var salvas = JSON.parse(localStorage.getItem("ceclos_preferencias") || "{}");
    if (salvas && (salvas.aparencia === "claro" || salvas.aparencia === "escuro")) {
      aparencia = salvas.aparencia;
    }
  } catch {}

  var sistemaClaro = !!(
    window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
  );
  var esquema = aparencia === "auto" ? (sistemaClaro ? "claro" : "escuro") : aparencia;
  document.documentElement.setAttribute("data-esquema", esquema);
})();
