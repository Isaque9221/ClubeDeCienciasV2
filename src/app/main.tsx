import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { registrarVisita } from "@/recursos/estatisticas";

declare global {
  interface Window {
    __abertura?: { siteMontado: () => void; pular: () => void };
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

registrarVisita();

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    if (window.__abertura) {
      window.__abertura.siteMontado();
      return;
    }

    document.getElementById("abertura")?.remove();
    document.documentElement.classList.add("sem-abertura");
  });
});
