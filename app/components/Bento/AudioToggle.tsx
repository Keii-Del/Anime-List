"use client";
import { useRef, useState } from "react";
import gsap from "gsap";

const TRACKS = [
  { k: "Native Audio", info: "Native audio · JP/CN · 48kHz" },
  { k: "English Subs", info: "English subs · ASS styled · 0ms offset" },
  { k: "Dubbed", info: "English dub · stereo · synced" },
];

export default function AudioToggle() {
  const [i, setI] = useState(0);
  const out = useRef<HTMLDivElement>(null);

  const pick = (n: number) => {
    setI(n);
    gsap.fromTo(out.current, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3 });
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-surface p-7">
      <h4 className="font-heading text-2xl leading-[1.3]">Dual Audio Engine</h4>
      <p className="mb-5 mt-1 text-[15px] text-muted">Swap tracks mid-episode, no reload.</p>
      <div className="space-y-2.5">
        {TRACKS.map((t, n) => (
          <button
            key={t.k}
            onClick={() => pick(n)}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-left font-mono text-sm transition ${
              i === n ? "border-jade bg-jade/5 text-white" : "border-white/[0.07] text-muted hover:text-white"
            }`}
          >
            {t.k}
          </button>
        ))}
      </div>
      <div ref={out} className="mt-4 font-mono text-xs text-jade">▶ {TRACKS[i].info}</div>
    </div>
  );
}
