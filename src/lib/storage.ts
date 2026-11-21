/**
 * localStorage that never throws. Private windows, blocked site data and
 * thumbnail renderers can make storage unavailable; the site must still work.
 */
const memory = new Map<string, string>();

export function readStorage(key: string): string | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

export function writeStorage(key: string, value: string): void {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage blocked: keep the in-memory copy for this visit */
  }
}

export function removeStorage(key: string): void {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readStorage(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  writeStorage(key, JSON.stringify(value));
}
