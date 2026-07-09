"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

const storageKey = "fake-shop-theme";
const themeChangeEvent = "fake-shop-theme-change";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem(storageKey);

  return storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
}

function subscribeToThemeChanges(onChange: () => void) {
  window.addEventListener(themeChangeEvent, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(themeChangeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function ThemeSwitcher() {
  const theme = useSyncExternalStore<Theme>(
    subscribeToThemeChanges,
    readStoredTheme,
    () => "light"
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    window.localStorage.setItem(storageKey, nextTheme);
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  return (
    <Button aria-label="Toggle theme" onClick={toggleTheme} type="button">
      {theme === "dark" ? "Light" : "Dark"}
    </Button>
  );
}
