"use client";
import { LIST_KEY, useStored, write, type Entry } from "@/lib/library";

export default function WatchlistButton({ entry }: { entry: Entry }) {
  const list = useStored<Entry[]>(LIST_KEY) ?? [];
  const saved = list.some((e) => e.id === entry.id);

  return (
    <button
      onClick={() => write(LIST_KEY, saved ? list.filter((e) => e.id !== entry.id) : [entry, ...list])}
      className={`mt-4 w-full rounded-xl border px-4 py-2.5 font-heading text-[15px] transition ${
        saved ? "border-jade bg-jade/10 text-jade" : "border-white/[0.07] bg-card hover:border-white/30"
      }`}
    >
      {saved ? "✓ In my list" : "+ Add to my list"}
    </button>
  );
}
