import { useEffect, useState, useCallback } from "react";

export function useTheme() {
  const [theme, setTheme] = useState("dark");

  const applyTheme = useCallback((t) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(t);
    root.setAttribute("data-theme", t);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lumiere-theme");
      const current =
        saved || (document.documentElement.classList.contains("light") ? "light" : "dark");
      setTheme(current);
      applyTheme(current);
    } catch {
      // localStorage may fail in restricted iframes
    }
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("lumiere-theme", next);
      } catch {
        // ignore
      }
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  return {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };
}
