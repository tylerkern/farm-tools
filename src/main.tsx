import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import type { Language } from "./i18n";

const container =
  document.getElementById("transplant-calculator-root") ??
  document.getElementById("root");

if (container) {
  const language: Language = container.dataset.lang === "ja" ? "ja" : "en";

  createRoot(container).render(
    <StrictMode>
      <App language={language} />
    </StrictMode>,
  );
}
