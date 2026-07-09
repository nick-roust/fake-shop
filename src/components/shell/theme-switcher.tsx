"use client";

import { useEffect, useSyncExternalStore } from "react";

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
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="inline-flex size-10 items-center justify-center rounded-md bg-transparent text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={toggleTheme}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      type="button"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}
