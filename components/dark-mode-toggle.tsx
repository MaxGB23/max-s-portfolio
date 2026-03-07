"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ? stored === "dark" : prefersDark;
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-12 h-6 rounded-full bg-[var(--accent-purple)] flex items-center transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="absolute left-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm transition-transform duration-300"
        style={{ transform: dark ? "translateX(24px)" : "translateX(0px)" }}
      >
        {dark ? (
          <Moon size={11} className="text-[var(--accent-purple)]" />
        ) : (
          <Sun size={11} className="text-[var(--accent-purple)]" />
        )}
      </span>
    </button>
  );
}
