"use client";
import Image from "next/image";
import Link from "next/link";
import { HISTORY_KEY, LIST_KEY, readPos, useStored, write, type Entry, type Hist } from "@/lib/library";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function Card({ e, href, sub, onRemove }: { e: Entry; href: string; sub?: string; onRemove: () => void }) {
  const cn = e.origin === "CN";
  return (
    <div className="group relative w-36 shrink-0 sm:w-40">
      <Link href={href} className="block">
        <div
          className={`relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.07] bg-card transition ${
            cn ? "group-hover:border-jade" : "group-hover:border-ember"
          }`}
        >
          <Image src={e.cover} alt={e.name} fill sizes="160px" className="object-cover transition duration-300 group-hover:scale-105" />
        </div>
        <div className="mt-2 truncate text-[14px] font-medium">{e.name}</div>
        {sub && <div className={`font-mono text-[11px] ${cn ? "text-jade" : "text-ember"}`}>{sub}</div>}
      </Link>
      <button
        onClick={onRemove}
        aria-label="Remove"
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-obsidian/80 text-xs opacity-0 transition group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

export default function LibraryRows() {
  const hist = useStored<Hist[]>(HISTORY_KEY) ?? [];
  const list = useStored<Entry[]>(LIST_KEY) ?? [];
  if (hist.length === 0 && list.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl space-y-12 px-6 pb-20">
      {hist.length > 0 && (
        <div>
          <h2 className="mb-5 font-heading text-[32px] leading-[1.2]">Continue watching</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {hist.map((h) => {
              const pos = h.ep ? readPos(h.id, h.ep) : 0;
              const sub = h.ep ? `EP ${h.ep}${pos > 5 ? ` · ${mmss(pos)}` : ""}` : undefined;
              return (
                <Card
                  key={h.id}
                  e={h}
                  sub={sub}
                  href={h.ep ? `/watch/${h.id}?ep=${h.ep}` : `/watch/${h.id}`}
                  onRemove={() => write(HISTORY_KEY, hist.filter((x) => x.id !== h.id))}
                />
              );
            })}
          </div>
        </div>
      )}

      {list.length > 0 && (
        <div>
          <h2 className="mb-5 font-heading text-[32px] leading-[1.2]">My list</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {list.map((e) => (
              <Card key={e.id} e={e} href={`/watch/${e.id}`} onRemove={() => write(LIST_KEY, list.filter((x) => x.id !== e.id))} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
