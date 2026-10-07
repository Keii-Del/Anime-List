"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Airing } from "@/lib/schedule";

type Kind = "all" | "JP" | "CN";
const KINDS: { k: Kind; label: string }[] = [
  { k: "all", label: "All" },
  { k: "JP", label: "Anime" },
  { k: "CN", label: "Donghua" },
];

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");

export default function ScheduleBoard({ items }: { items: Airing[] }) {
  const [now, setNow] = useState<number | null>(null);
  const [day, setDay] = useState(0);
  const [kind, setKind] = useState<Kind>("all");
  const [tz, setTz] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setNow(Date.now());
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, 0);
    const i = setInterval(() => setNow(Date.now()), 60000);
    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
  }, []);

  const days = useMemo(() => {
    if (now === null) return [];
    const base = new Date(now);
    base.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [now]);

  const byDay = useMemo(() => {
    const map = new Map<string, Airing[]>();
    for (const a of items) {
      if (kind !== "all" && a.origin !== kind) continue;
      const key = new Date(a.airingAt * 1000).toDateString();
      (map.get(key) ?? map.set(key, []).get(key)!).push(a);
    }
    return map;
  }, [items, kind]);

  if (now === null) return <div className="mt-10 h-96 animate-pulse rounded-2xl bg-surface" />;

  const list = byDay.get(days[day].toDateString()) ?? [];

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => setDay(i)}
              className={`shrink-0 rounded-xl border px-4 py-2 text-center transition ${
                day === i ? "border-white bg-white text-obsidian" : "border-white/[0.07] bg-card text-muted hover:text-white"
              }`}
            >
              <div className="font-heading text-[15px] leading-tight">{i === 0 ? "Today" : WD[d.getDay()]}</div>
              <div className="font-mono text-[11px]">{d.getDate()}</div>
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full border border-white/[0.07] bg-card p-1.5">
          {KINDS.map((t) => (
            <button
              key={t.k}
              onClick={() => setKind(t.k)}
              className={`rounded-full px-4 py-1.5 text-[14px] transition ${kind === t.k ? "bg-white text-obsidian" : "text-muted hover:text-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 font-mono text-xs text-muted">
        {list.length} episodes · times in your timezone{tz && ` (${tz})`}
      </div>

      <div className="mt-4 divide-y divide-white/[0.07] rounded-2xl border border-white/[0.07] bg-surface">
        {list.length === 0 && <p className="p-6 text-muted">Nothing scheduled for this filter.</p>}
        {list.map((a) => {
          const t = new Date(a.airingAt * 1000);
          const aired = a.airingAt * 1000 < now;
          const cn = a.origin === "CN";
          return (
            <Link
              key={a.id}
              href={`/watch/${a.mediaId}`}
              className={`flex items-center gap-4 px-4 py-3 transition hover:bg-white/[0.03] ${aired ? "opacity-50" : ""}`}
            >
              <span className={`w-14 shrink-0 font-mono text-[15px] ${cn ? "text-jade" : "text-ember"}`}>
                {pad(t.getHours())}:{pad(t.getMinutes())}
              </span>
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-card">
                <Image src={a.cover} alt="" fill sizes="40px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-heading text-[17px] leading-tight">{a.name}</div>
                <div className="font-mono text-xs text-muted">
                  EP {a.episode}
                  {a.format && ` · ${a.format.replace("_", " ")}`}
                </div>
              </div>
              <span className="hidden rounded-full border border-white/[0.07] px-3 py-0.5 text-xs text-muted sm:block">
                {cn ? "Donghua" : "Anime"}
              </span>
              {aired && <span className="font-mono text-[11px] text-muted">AIRED</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
