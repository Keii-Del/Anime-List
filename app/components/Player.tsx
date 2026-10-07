"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type Hls from "hls.js";

export type Sub = { label: string; lang: string; src: string };
type Props = {
  src: string; // .m3u8 URL (or .mp4)
  poster?: string;
  subtitles?: Sub[]; // WebVTT files
  storageKey: string; // for resume position
  accent?: "jade" | "ember";
  nextHref?: string; // go here when the video ends
  skipIntro?: { start: number; end: number };
  skipOutro?: { start: number; end: number };
  onPlaybackError?: () => void;
};

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60);
  return (h ? `${h}:${String(m).padStart(2, "0")}` : `${m}`) + `:${String(x).padStart(2, "0")}`;
};

export default function Player({ src, poster, subtitles = [], storageKey, accent = "jade", nextHref, skipIntro, skipOutro, onPlaybackError }: Props) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const hls = useRef<Hls | null>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [buf, setBuf] = useState(0);
  const [vol, setVol] = useState(1);
  const [muted, setMuted] = useState(false);
  const [levels, setLevels] = useState<number[]>([]); // heights
  const [level, setLevel] = useState(-1); // -1 = auto
  const [sub, setSub] = useState(-1);
  const [menu, setMenu] = useState<null | "q" | "c">(null);
  const [show, setShow] = useState(true);
  const [skipLabel, setSkipLabel] = useState<"intro" | "outro" | null>(null);
  const [autoplayMuted, setAutoplayMuted] = useState(false);
  const playbackErrorReported = useRef(false);
  const onPlaybackErrorRef = useRef(onPlaybackError);
  onPlaybackErrorRef.current = onPlaybackError;

  const text = accent === "jade" ? "text-jade" : "text-ember";

  // attach source
  useEffect(() => {
    const v = vid.current!;
    let dead = false;
    playbackErrorReported.current = false;
    const isHls = /\.m3u8/i.test(src);
    const startPlayback = async () => {
      try {
        await v.play();
        setAutoplayMuted(false);
      } catch {
        v.muted = true;
        try {
          await v.play();
          setAutoplayMuted(true);
        } catch {
          setPlaying(false);
        }
      }
    };

    if (v.canPlayType("application/vnd.apple.mpegurl") || !isHls) {
      v.src = src; // Safari native HLS, or plain mp4
      v.addEventListener("loadedmetadata", startPlayback, { once: true });
    } else {
      import("hls.js").then(({ default: H }) => {
        if (dead || !H.isSupported()) return;
        const h = new H({ enableWorker: true });
        hls.current = h;
        h.loadSource(src);
        h.attachMedia(v);
        h.on(H.Events.MANIFEST_PARSED, (_, d) => {
          setLevels(d.levels.map((l) => l.height).filter((h) => h > 0));
          void startPlayback();
        });
        h.on(H.Events.ERROR, (_, data) => {
          if (!data.fatal || playbackErrorReported.current) return;
          playbackErrorReported.current = true;
          onPlaybackErrorRef.current?.();
        });
      });
    }
    let saved = 0;
    try { saved = Number(localStorage.getItem(storageKey)) || 0; } catch {}
    const onMeta = () => { if (saved > 5 && saved < v.duration - 10) v.currentTime = saved; };
    v.addEventListener("loadedmetadata", onMeta);
    return () => {
      dead = true;
      v.removeEventListener("loadedmetadata", onMeta);
      v.pause();
      v.removeAttribute("src");
      v.load();
      hls.current?.destroy();
      hls.current = null;
    };
  }, [src, storageKey]);

  // subtitle selection
  useEffect(() => {
    const video = box.current?.querySelector("video");
    if (!video) return;
    const tracks = Array.from(video.textTracks);
    tracks.forEach((track, i) => {
      track.mode = i === sub ? "showing" : "hidden";
    });
  }, [sub]);

  const toggle = () => {
    const v = vid.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };
  const seek = (d: number) => { const v = vid.current!; v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + d)); };
  const fullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen());
  const pickLevel = (n: number) => { if (hls.current) hls.current.currentLevel = n; setLevel(n); setMenu(null); };
  const pickSub = (n: number) => { setSub(n); setMenu(null); };

  const wake = () => {
    setShow(true);
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => !vid.current?.paused && setShow(false), 2500);
  };

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const updateSkip = () => {
      const now = v.currentTime;
      if (skipOutro && now >= skipOutro.start && now <= skipOutro.end) setSkipLabel("outro");
      else if (skipIntro && now >= skipIntro.start && now <= skipIntro.end) setSkipLabel("intro");
      else setSkipLabel(null);
    };
    v.addEventListener("timeupdate", updateSkip);
    return () => v.removeEventListener("timeupdate", updateSkip);
  }, [skipIntro, skipOutro, src]);

  const onKey = (e: React.KeyboardEvent) => {
    const v = vid.current!;
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") toggle();
    else if (k === "arrowleft") seek(-5);
    else if (k === "arrowright") seek(5);
    else if (k === "j") seek(-10);
    else if (k === "l") seek(10);
    else if (k === "arrowup") v.volume = Math.min(1, v.volume + 0.1);
    else if (k === "arrowdown") v.volume = Math.max(0, v.volume - 0.1);
    else if (k === "m") v.muted = !v.muted;
    else if (k === "f") fullscreen();
    else if (k === "c" && subtitles.length) setSub((s) => (s + 1 >= subtitles.length ? -1 : s + 1));
    else return;
    e.preventDefault();
    wake();
  };

  return (
    <div
      ref={box}
      tabIndex={0}
      onKeyDown={onKey}
      onMouseMove={wake}
      onMouseLeave={() => playing && setShow(false)}
      className="group relative h-full w-full select-none overflow-hidden bg-black outline-none"
    >
      <video
        ref={vid}
        autoPlay
        poster={poster}
        playsInline
        crossOrigin="anonymous"
        onClick={toggle}
        onEnded={() => nextHref && router.push(nextHref)}
        onError={() => {
          if (playbackErrorReported.current) return;
          playbackErrorReported.current = true;
          onPlaybackErrorRef.current?.();
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => { setPlaying(false); setShow(true); }}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setT(v.currentTime);
          if (v.buffered.length) setBuf(v.buffered.end(v.buffered.length - 1));
          if (Math.floor(v.currentTime) % 5 === 0) {
            try { localStorage.setItem(storageKey, String(v.currentTime)); } catch {}
          }
        }}
        onVolumeChange={(e) => { setVol(e.currentTarget.volume); setMuted(e.currentTarget.muted); }}
        className="h-full w-full"
      >
        {subtitles.map((s) => (
          <track key={s.src} kind="subtitles" label={s.label} srcLang={s.lang} src={s.src} />
        ))}
      </video>

      {!playing && (
        <button onClick={toggle} aria-label="Play"
          className="absolute inset-0 m-auto grid h-16 w-16 place-items-center rounded-full bg-white text-xl text-obsidian">
          ▶
        </button>
      )}

      {autoplayMuted && playing && (
        <button
          onClick={() => {
            if (!vid.current) return;
            vid.current.muted = false;
            setAutoplayMuted(false);
          }}
          className={`absolute right-4 top-4 z-20 rounded-xl border px-3 py-2 font-mono text-[11px] backdrop-blur ${accent === "jade" ? "border-jade/40 bg-jade/15 text-jade" : "border-ember/40 bg-ember/15 text-ember"}`}
        >
          Click for sound
        </button>
      )}

      {skipLabel && (
        <button
          onClick={() => {
            const range = skipLabel === "intro" ? skipIntro : skipOutro;
            if (range && vid.current) vid.current.currentTime = range.end;
            setSkipLabel(null);
          }}
          className={`absolute bottom-20 right-4 z-20 rounded-xl border px-4 py-2 font-mono text-[12px] backdrop-blur ${accent === "jade" ? "border-jade/40 bg-jade/15 text-jade" : "border-ember/40 bg-ember/15 text-ember"}`}
        >
          Skip {skipLabel}
        </button>
      )}

      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300 ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="relative h-5">
          <div className="absolute inset-x-0 top-2 h-1 rounded bg-white/20" />
          <div className="absolute left-0 top-2 h-1 rounded bg-white/30" style={{ width: dur ? `${(buf / dur) * 100}%` : 0 }} />
          <input
            type="range" min={0} max={dur || 0} step={0.1} value={t}
            onChange={(e) => (vid.current!.currentTime = Number(e.target.value))}
            className={`absolute inset-0 w-full cursor-pointer appearance-none bg-transparent ${accent === "jade" ? "accent-jade" : "accent-ember"}`}
            aria-label="Seek"
          />
        </div>

        <div className="mt-1 flex items-center gap-4 font-mono text-[13px]">
          <button onClick={toggle} className="w-5">{playing ? "⏸" : "▶"}</button>
          <button onClick={() => seek(-10)} title="-10s (J)">⟲10</button>
          <button onClick={() => seek(10)} title="+10s (L)">10⟳</button>
          <span className="text-muted">{fmt(t)} / {fmt(dur)}</span>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => (vid.current!.muted = !vid.current!.muted)} title="Mute (M)">{muted || vol === 0 ? "🔇" : "🔊"}</button>
              <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : vol}
                onChange={(e) => { vid.current!.muted = false; vid.current!.volume = Number(e.target.value); }}
                className={`hidden w-20 sm:block ${accent === "jade" ? "accent-jade" : "accent-ember"}`} aria-label="Volume" />
            </div>

            {subtitles.length > 0 && (
              <div className="relative">
                <button onClick={() => setMenu(menu === "c" ? null : "c")} className={sub >= 0 ? text : ""} title="Captions (C)">CC</button>
                {menu === "c" && (
                  <ul className="absolute bottom-8 right-0 min-w-32 rounded-xl border border-white/[0.07] bg-surface p-1.5">
                    <li><button onClick={() => pickSub(-1)} className={`w-full rounded px-3 py-1.5 text-left hover:bg-white/10 ${sub === -1 ? text : ""}`}>Off</button></li>
                    {subtitles.map((s, i) => (
                      <li key={s.src}><button onClick={() => pickSub(i)} className={`w-full rounded px-3 py-1.5 text-left hover:bg-white/10 ${sub === i ? text : ""}`}>{s.label}</button></li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {levels.length > 0 && (
              <div className="relative">
                <button onClick={() => setMenu(menu === "q" ? null : "q")}>{level === -1 ? "Auto" : `${levels[level]}p`}</button>
                {menu === "q" && (
                  <ul className="absolute bottom-8 right-0 min-w-24 rounded-xl border border-white/[0.07] bg-surface p-1.5">
                    <li><button onClick={() => pickLevel(-1)} className={`w-full rounded px-3 py-1.5 text-left hover:bg-white/10 ${level === -1 ? text : ""}`}>Auto</button></li>
                    {levels.map((h, i) => ({ h, i })).reverse().map(({ h, i }) => (
                      <li key={i}><button onClick={() => pickLevel(i)} className={`w-full rounded px-3 py-1.5 text-left hover:bg-white/10 ${level === i ? text : ""}`}>{h}p</button></li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button onClick={fullscreen} title="Fullscreen (F)">⛶</button>
          </div>
        </div>
      </div>
    </div>
  );
}
