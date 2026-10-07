"use client";
import { useMemo, useSyncExternalStore } from "react";

export type Entry = { id: number; name: string; cover: string; origin: string };
export type Hist = Entry & { ep?: number; at: number };

export const LIST_KEY = "kaizen:list";
export const HISTORY_KEY = "kaizen:history";
const EVT = "kaizen:lib";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVT, cb);
  };
}

function raw(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Reads a JSON value from localStorage. Returns null on the server and when empty. */
export function useStored<T>(key: string): T | null {
  const s = useSyncExternalStore(subscribe, () => raw(key), () => null);
  return useMemo(() => {
    try {
      return s ? (JSON.parse(s) as T) : null;
    } catch {
      return null;
    }
  }, [s]);
}

export function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(EVT));
  } catch {}
}

export function readJSON<T>(key: string): T | null {
  const s = raw(key);
  try {
    return s ? (JSON.parse(s) as T) : null;
  } catch {
    return null;
  }
}

export function readPos(id: number, ep: number): number {
  return Number(raw(`kaizen:pos:${id}:${ep}`)) || 0;
}
