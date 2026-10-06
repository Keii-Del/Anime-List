"use client";
import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import type { Title } from "@/lib/anilist";

export default function MediaCard({ t }: { t: Title }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const cn = t.origin === "CN";

  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(ref.current, { rotateY: x * 8, rotateX: -y * 8, transformPerspective: 800, duration: 0.4, overwrite: "auto" });
  };
  const leave = () => gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.6, overwrite: "auto" });

  return (
    <a
      ref={ref}
      href={t.link}
      target="_blank"
      rel="noreferrer"
      onMouseMove={move}
      onMouseLeave={leave}
      className={`mc group block overflow-hidden rounded-2xl border border-white/[0.07] bg-card transition-[border-color,box-shadow] duration-300 ${
        cn ? "hover:border-jade hover:shadow-[0_0_28px_-8px_#00E5A3]" : "hover:border-ember hover:shadow-[0_0_28px_-8px_#FF3355]"
      }`}
    >
      <div className="relative aspect-[2/3] overflow-hidden" style={{ background: t.color ?? "#111318" }}>
        <Image
          src={t.cover}
          alt={t.name}
          fill
          sizes="(min-width:1024px) 22vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute left-3 top-3 rounded border border-white/[0.07] bg-obsidian/80 px-2 py-0.5 font-mono text-[11px]">
          #{t.rank} Trending
        </div>
        <div className="absolute inset-0 m-auto grid h-14 w-14 scale-90 place-items-center rounded-full bg-white text-obsidian opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>
      <div className="p-4">
        <div className="line-clamp-2 font-heading text-[19px] leading-tight">{t.name}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {t.year && <span className="rounded-full border border-white/[0.07] px-2.5 font-mono text-xs text-muted">{t.year}</span>}
          {t.genres.map((g) => (
            <span key={g} className="rounded-full border border-white/[0.07] px-2.5 text-xs text-muted">{g}</span>
          ))}
        </div>
      </div>
    </a>
  );
}
