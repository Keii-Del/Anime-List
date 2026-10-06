"use client";
import { useEffect, useState } from "react";
import type { Slot } from "@/lib/anilist";

const pad = (n: number) => String(n).padStart(2, "0");

function fmt(sec: number) {
  if (sec <= 0) return "Airing now";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${d ? d + "d " : ""}${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function Schedule({ slots }: { slots: Slot[] }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
  const tick = () => setNow(Math.floor(Date.now() / 1000));
  const t = setTimeout(tick, 0); // first value after mount, avoids hydration mismatch
  const i = setInterval(tick, 1000);
  return () => {
    clearTimeout(t);
    clearInterval(i);
  };
}, []);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-surface p-7">
      <h4 className="font-heading text-2xl leading-[1.3]">Airing Schedule</h4>
      <p className="mb-5 mt-1 text-[15px] text-muted">Next episode drops, straight from AniList.</p>
      <div className="space-y-4">
        {slots.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-heading text-[17px] leading-tight">{s.name}</div>
              <div className="font-mono text-xs text-muted">EP {s.episode} · {s.origin === "CN" ? "Donghua" : "Anime"}</div>
            </div>
            <div className={`shrink-0 font-mono text-[13px] ${s.origin === "CN" ? "text-jade" : "text-ember"}`}>
              {now === null ? "--:--:--" : fmt(s.airingAt - now)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
