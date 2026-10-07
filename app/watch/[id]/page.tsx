import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMedia } from "@/lib/media";
import { FULL_EPISODES } from "@/lib/sources";
import Player from "@/app/components/Player";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import WatchlistButton from "@/app/components/WatchlistButton";
import HistoryTracker from "@/app/components/HistoryTracker";

export default async function Watch({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { id } = await params;
  const { ep } = await searchParams;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const m = await getMedia(numericId);
  if (!m) notFound();

  const name = m.title.english ?? m.title.romaji;
  const cn = m.countryOfOrigin === "CN";
  const text = cn ? "text-jade" : "text-ember";
  const desc = (m.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const legal = m.externalLinks.filter((l) => l.type === "STREAMING");
  const recs = m.recommendations.nodes.flatMap((n) => (n.mediaRecommendation ? [n.mediaRecommendation] : []));

  // Video sources you control: lib/sources.ts (your own HLS files or official YouTube uploads)
  const full = FULL_EPISODES[m.id];
  const eps = full?.type === "hls" ? full.episodes : [];
  const idx = Math.max(0, eps.findIndex((e) => String(e.n) === ep));
  const cur = eps[idx];
  const prev = eps[idx - 1];
  const next = eps[idx + 1];

  let src: string | null = null;
  let label = "";
  if (full && full.type !== "hls") {
    src =
      full.type === "video"
        ? `https://www.youtube-nocookie.com/embed/${full.id}`
        : `https://www.youtube-nocookie.com/embed/videoseries?list=${full.id}`;
    label = "Official upload";
  } else if (!full && m.trailer?.site === "youtube") {
    src = `https://www.youtube-nocookie.com/embed/${m.trailer.id}`;
    label = "Trailer / PV";
  }

  const btn = "rounded-lg border border-white/[0.07] bg-card px-4 py-2 font-mono text-[13px] transition hover:border-white/30";
  const off = "pointer-events-none rounded-lg border border-white/[0.04] px-4 py-2 font-mono text-[13px] text-muted/40";

  return (
    <>
      <Nav />
      <HistoryTracker id={m.id} name={name} cover={m.coverImage.extraLarge} origin={m.countryOfOrigin} ep={cur?.n} />
      <main className="mx-auto max-w-[1400px] px-4 pb-20 pt-24 sm:px-6">
        <nav className="mb-4 font-mono text-xs text-muted">
          <Link href="/" className="hover:text-white">Home</Link> / <Link href="/anime" className="hover:text-white">Anime</Link> / <span className="text-white">{name}</span>
        </nav>

        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
          {/* LEFT: episodes */}
          <aside className="order-2 rounded-2xl border border-white/[0.07] bg-surface lg:order-1">
            <div className="border-b border-white/[0.07] px-4 py-3 font-heading text-lg">Episodes</div>
            <div className="max-h-[560px] overflow-y-auto p-2">
              {eps.length > 0 ? (
                eps.map((e, i) => (
                  <Link
                    key={e.n}
                    href={`/watch/${m.id}?ep=${e.n}`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition ${
                      i === idx ? (cn ? "bg-jade/10 text-jade" : "bg-ember/10 text-ember") : "text-muted hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="w-6 font-mono text-xs">{e.n}</span>
                    <span className="truncate">{e.title ?? `Episode ${e.n}`}</span>
                  </Link>
                ))
              ) : m.streamingEpisodes.length > 0 ? (
                m.streamingEpisodes.map((e) => (
                  <a key={e.url} href={e.url} target="_blank" rel="noreferrer"
                     className="block truncate rounded-lg px-3 py-2.5 text-[15px] text-muted hover:bg-white/5 hover:text-white">
                    {e.title} ↗
                  </a>
                ))
              ) : (
                <p className="px-3 py-4 text-[15px] text-muted">No episode list for this title yet.</p>
              )}
            </div>
          </aside>

          {/* CENTER: player */}
          <section className="order-1 min-w-0 lg:order-2">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.07] bg-card">
              {cur ? (
                <Player
                  key={cur.src}
                  src={cur.src}
                  poster={m.coverImage.extraLarge}
                  subtitles={cur.subtitles}
                  storageKey={`kaizen:pos:${m.id}:${cur.n}`}
                  accent={cn ? "jade" : "ember"}
                  nextHref={next ? `/watch/${m.id}?ep=${next.n}` : undefined}
                />
              ) : src ? (
                <iframe
                  src={src}
                  title={name}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <>
                  <Image src={m.coverImage.extraLarge} alt={name} fill className="object-cover opacity-30" />
                  <div className="absolute inset-0 grid place-items-center px-6 text-center font-mono text-sm text-muted">
                    No video for this title yet. Use the official sources on the right.
                  </div>
                </>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-surface px-4 py-3">
              <div className="font-mono text-[13px]">
                <span className="text-muted">You are watching </span>
                <span className={text}>{cur ? `EP ${cur.n}` : label || "—"}</span>
              </div>
              <div className="flex gap-2">
                {prev ? <Link href={`/watch/${m.id}?ep=${prev.n}`} className={btn}>← Prev</Link> : <span className={off}>← Prev</span>}
                {next ? <Link href={`/watch/${m.id}?ep=${next.n}`} className={btn}>Next →</Link> : <span className={off}>Next →</span>}
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-white/[0.07] bg-surface px-4 py-3 font-mono text-[12px] text-muted">
              Shortcuts: Space/K play · J/L ±10s · ←/→ ±5s · ↑/↓ volume · M mute · F fullscreen · C captions
            </div>
          </section>

          {/* RIGHT: info */}
          <aside className="order-3 rounded-2xl border border-white/[0.07] bg-surface p-5">
            <div className="relative mx-auto aspect-[2/3] w-40 overflow-hidden rounded-xl" style={{ background: m.coverImage.color ?? "#181A22" }}>
              <Image src={m.coverImage.extraLarge} alt={name} fill sizes="160px" className="object-cover" />
            </div>
            <h1 className="mt-4 font-heading text-2xl leading-[1.3]">{name}</h1>
            <WatchlistButton entry={{ id: m.id, name, cover: m.coverImage.extraLarge, origin: m.countryOfOrigin }} />
            <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[11px]">
              {m.format && <span className="rounded border border-white/[0.07] px-2 py-0.5 text-muted">{m.format.replace("_", " ")}</span>}
              {m.seasonYear && <span className="rounded border border-white/[0.07] px-2 py-0.5 text-muted">{m.seasonYear}</span>}
              <span className="rounded border border-white/[0.07] px-2 py-0.5 text-muted">{m.episodes ?? "?"} EP</span>
              {m.averageScore && <span className={`rounded border border-white/[0.07] px-2 py-0.5 ${text}`}>AL {(m.averageScore / 10).toFixed(1)}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.genres.map((g) => (
                <Link key={g} href={`/anime?genre=${encodeURIComponent(g)}`} className="rounded-full border border-white/[0.07] px-2.5 text-xs text-muted hover:text-white">{g}</Link>
              ))}
            </div>
            {m.studios.nodes[0] && <div className="mt-3 text-[14px] text-muted">Studio: <span className="text-white">{m.studios.nodes[0].name}</span></div>}
            <p className="mt-4 line-clamp-6 text-[15px] leading-relaxed text-muted">{desc}</p>

            <div className="mt-5 space-y-2">
              <div className="font-heading text-lg">Watch officially</div>
              {legal.length === 0 && <p className="text-[14px] text-muted">No licensed streams listed.</p>}
              {legal.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="block rounded-lg border border-white/[0.07] px-3 py-2 font-mono text-[13px] hover:border-white/30">
                  {l.site} ↗
                </a>
              ))}
            </div>
          </aside>
        </div>

        {recs.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-5 font-heading text-[32px] leading-[1.2]">Recommended for you</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {recs.slice(0, 12).map((r) => (
                <Link key={r.id} href={`/watch/${r.id}`} className="group">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.07] bg-card">
                    <Image src={r.coverImage.large} alt={r.title.english ?? r.title.romaji} fill sizes="220px" className="object-cover transition duration-300 group-hover:scale-105" />
                  </div>
                  <div className="mt-2 truncate text-sm font-medium">{r.title.english ?? r.title.romaji}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
