'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem('trustlayer_theme') as ThemeMode) || 'system';
    setTheme(saved);
    applyTheme(saved);

    // Listener for system preference change if 'system' is active
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const current = (localStorage.getItem('trustlayer_theme') as ThemeMode) || 'system';
      if (current === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleSelectTheme = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem('trustlayer_theme', mode);
    applyTheme(mode);
  };

  if (!mounted) {
    return (
      <div className="w-24 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
      <button
        onClick={() => handleSelectTheme('light')}
        className={`px-2 py-1 rounded-md transition-colors flex items-center space-x-1 ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px]">Light</span>
      </button>

      <button
        onClick={() => handleSelectTheme('dark')}
        className={`px-2 py-1 rounded-md transition-colors flex items-center space-x-1 ${
          theme === 'dark'
            ? 'bg-slate-900 text-blue-400 shadow-xs font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px]">Dark</span>
      </button>

      <button
        onClick={() => handleSelectTheme('system')}
        className={`px-2 py-1 rounded-md transition-colors flex items-center space-x-1 ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="Default System Theme"
      >
        <Laptop className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px]">System</span>
      </button>
    </div>
  );
};
