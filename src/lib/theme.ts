import { useCallback, useSyncExternalStore } from 'react';
import { readStorage, writeStorage } from './storage';

export type Theme = 'light' | 'dark';
const KEY = 'awshub:theme';
const listeners = new Set<() => void>();

function current(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  writeStorage(KEY, theme);
  listeners.forEach((l) => l());
}

export function initTheme() {
  const saved = readStorage(KEY);
  if (saved === 'dark' || saved === 'light') setTheme(saved);
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    current,
    () => 'light' as Theme,
  );
  const toggle = useCallback(() => setTheme(current() === 'dark' ? 'light' : 'dark'), []);
  return { theme, toggle, setTheme };
}
