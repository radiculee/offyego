import type { Personality } from '@/types/pub';

type StorageSchema = {
  spinCount: number;
  personality: Personality;
};

const PREFIX = 'offyego:';

function get<K extends keyof StorageSchema>(key: K): StorageSchema[K] | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(PREFIX + key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as StorageSchema[K];
  } catch {
    return null;
  }
}

function set<K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K],
): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

function remove<K extends keyof StorageSchema>(key: K): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PREFIX + key);
}

export const storage = { get, set, remove };
