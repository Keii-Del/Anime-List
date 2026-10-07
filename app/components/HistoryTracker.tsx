"use client";
import { useEffect } from "react";
import { HISTORY_KEY, readJSON, write, type Hist } from "@/lib/library";

type Props = { id: number; name: string; cover: string; origin: string; ep?: number };

export default function HistoryTracker({ id, name, cover, origin, ep }: Props) {
  useEffect(() => {
    const prev = readJSON<Hist[]>(HISTORY_KEY) ?? [];
    const next: Hist[] = [{ id, name, cover, origin, ep, at: Date.now() }, ...prev.filter((h) => h.id !== id)];
    write(HISTORY_KEY, next.slice(0, 12));
  }, [id, name, cover, origin, ep]);

  return null;
}
