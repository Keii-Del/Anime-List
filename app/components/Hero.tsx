"use client";
import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Title } from "@/lib/anilist";

gsap.registerPlugin(useGSAP);

export default function Hero({ feature }: { feature: Title }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".rv", { y: 28, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power3.out" });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-36 lg:grid-cols-[1.15fr_1fr]">
      <div>
        <span className="rv inline-block rounded-full border border-white/[0.07] bg-card px-4 py-1 font-mono text-xs tracking-wide text-muted">
          PUBLIC API POWERED • 100% FREE & OPEN SOURCE
        </span>
        <h1 className="rv mt-6 font-heading text-[clamp(40px,6vw,72px)] leading-[1.05] tracking-[-0.03em]">
          Every Episode. Both Worlds. <span className="text-ember">Zero</span> Paywalls.
        </h1>
        <p className="rv mt-6 max-w-xl text-muted">
          Stream thousands of Japanese Anime titles alongside top-tier Chinese Donghua cultivation series. Instant API
          syncing, subbed & dubbed, in native 1080p.
        </p>
        <div className="rv mt-9 flex flex-wrap gap-3">
          <a href="#browse" className="rounded-full bg-white px-7 py-3.5 font-heading text-base text-black">Start Watching Now</a>
          <a href="#browse" className="rounded-full border border-white/[0.07] bg-surface px-7 py-3.5 font-heading text-base">Browse Donghua Catalog</a>
        </div>
      </div>

      <a
        href={feature.link}
        target="_blank"
        rel="noreferrer"
        className="rv block rounded-2xl border border-white/[0.07] bg-card p-3 transition hover:border-jade hover:shadow-[0_0_28px_-8px_#00E5A3]"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg" style={{ background: feature.color ?? "#111318" }}>
          <Image src={feature.cover} alt={feature.name} fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
          {feature.score && (
            <div className="absolute left-4 top-4 rounded-md border border-white/[0.07] bg-obsidian/80 px-2.5 py-1 font-mono text-[13px]">
              <span className="text-jade">AL</span> {(feature.score / 10).toFixed(1)}
            </div>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-heading text-2xl leading-[1.3]">{feature.name}</h4>
          <div className="mt-1 flex gap-2">
            {feature.genres.map((g) => (
              <span key={g} className="rounded-full border border-white/[0.07] px-2.5 text-xs text-muted">{g}</span>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 font-mono text-[13px] text-jade">
            <span className="h-2 w-2 animate-pulse rounded-full bg-jade" />
            {feature.nextEp ? `EP ${feature.nextEp - 1} · STREAM READY` : `${feature.episodes ?? "?"} EPS · COMPLETE`}
          </div>
        </div>
      </a>
    </section>
  );
}
