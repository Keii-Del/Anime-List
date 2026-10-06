"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import MediaCard from "./MediaCard";
import type { Title } from "@/lib/anilist";

type F = "all" | "anime" | "donghua";
const TABS: { k: F; label: string }[] = [
  { k: "all", label: "All Titles" },
  { k: "anime", label: "Japanese Anime (2D)" },
  { k: "donghua", label: "Chinese Donghua (3D/2D)" },
];

export default function CatalogTabs({ all, anime, donghua }: { all: Title[]; anime: Title[]; donghua: Title[] }) {
  const [f, setF] = useState<F>("all");
  const grid = useRef<HTMLDivElement>(null);
  const list = f === "all" ? all : f === "anime" ? anime : donghua;

  useGSAP(
    () => {
      gsap.fromTo(".mc", { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.4 });
    },
    { scope: grid, dependencies: [f] }
  );

  return (
    <section id="browse" className="mx-auto max-w-6xl px-6 pb-28">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-heading text-[clamp(32px,4vw,48px)] leading-[1.15] tracking-[-0.02em]">
          Pick your side of<br />the timeline.
        </h2>
        <div className="flex gap-1 rounded-full border border-white/[0.07] bg-card p-1.5">
          {TABS.map((t) => (
            <button
              key={t.k}
              onClick={() => setF(t.k)}
              className={`rounded-full px-4 py-2 text-[15px] transition ${f === t.k ? "bg-white text-obsidian" : "text-muted hover:text-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={grid} className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {list.map((t) => (
          <MediaCard key={t.id} t={t} />
        ))}
      </div>
    </section>
  );
}
