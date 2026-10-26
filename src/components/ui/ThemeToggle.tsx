"use client";

import React, { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("beacon_theme");
      if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      } else {
        setTheme("light");
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("beacon_theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {}
  };

  if (!mounted) {
    return (
      <div className={`w-20 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
        theme === "dark"
          ? "bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700 shadow-xs"
          : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs"
      } ${className}`}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Dark and Light Mode"
    >
      {theme === "dark" ? (
        <>
          <span className="text-sm">🌙</span>
          <span className="hidden sm:inline text-[11px] font-bold text-slate-200">Dark</span>
        </>
      ) : (
        <>
          <span className="text-sm">☀️</span>
          <span className="hidden sm:inline text-[11px] font-bold text-slate-700">Light</span>
        </>
      )}
    </button>
  );
}
