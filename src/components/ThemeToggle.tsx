"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer focus:outline-none active:scale-95"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        // Sun Icon
        <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-2c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1zm0 14c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1zm8.66-10c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1zM4.34 7c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1zm14.14 7.64l1.41 1.41c.39.39 1.03.39 1.42 0s.39-1.03 0-1.42l-1.41-1.41c-.39-.39-1.03-.39-1.42 0s-.39 1.03 0 1.42zM5.51 5.51l1.41 1.41c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L6.92 4.1c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41zm12.98 12.98l1.41 1.41c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-1.41-1.41c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41zm-12.98 0l1.41-1.41c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0l-1.41 1.41c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0z" />
        </svg>
      ) : (
        // Moon Icon
        <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-8.9 8.2-9.8.6-.1 1.2.3 1.3.9.1.6-.2 1.2-.8 1.4-3.7.8-6.3 4.1-6.3 8 0 4.4 3.6 8 8 8 2.9 0 5.6-1.6 7-4.2.3-.5.9-.7 1.4-.4.5.3.7.9.4 1.4C19.9 19.3 16.3 22 12.3 22z" />
        </svg>
      )}
    </button>
  );
}
