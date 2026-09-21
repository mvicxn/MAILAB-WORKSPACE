"use client";

import { Moon, Sun } from "lucide-react";

export function TemaToggle() {
  function alternar() {
    const proximo = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", proximo);
    localStorage.setItem("mai-tema", proximo ? "escuro" : "claro");
  }

  return (
    <button type="button" className="icon-btn" onClick={alternar} title="Alternar tema">
      <Sun size={16} className="hidden dark:block" />
      <Moon size={16} className="dark:hidden" />
    </button>
  );
}
