import Image from "next/image";
import Link from "next/link";
import type { Item } from "@/lib/browse";

export default function BrowseCard({ t }: { t: Item }) {
  const cn = t.origin === "CN";
  return (
    <Link
      href={`/watch/${t.id}`}
      className={`group block overflow-hidden rounded-2xl border border-white/[0.07] bg-card transition-[border-color,box-shadow] duration-300 ${
        cn ? "hover:border-jade hover:shadow-[0_0_28px_-8px_#00E5A3]" : "hover:border-ember hover:shadow-[0_0_28px_-8px_#FF3355]"
      }`}
    >
      <div className="relative aspect-[2/3] overflow-hidden" style={{ background: t.color ?? "#111318" }}>
        <Image
          src={t.cover}
          alt={t.name}
          fill
          sizes="(min-width:1024px) 16vw, (min-width:640px) 30vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {t.score && (
          <div className={`absolute left-3 top-3 rounded border border-white/[0.07] bg-obsidian/80 px-2 py-0.5 font-mono text-[11px] ${cn ? "text-jade" : "text-ember"}`}>
            {(t.score / 10).toFixed(1)}
          </div>
        )}
        <div className="absolute inset-0 m-auto grid h-12 w-12 scale-90 place-items-center rounded-full bg-white text-obsidian opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>
      <div className="p-3.5">
        <div className="line-clamp-2 font-heading text-[16px] leading-tight">{t.name}</div>
        <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[11px] text-muted">
          {t.format && <span>{t.format.replace("_", " ")}</span>}
          {t.year && <span>· {t.year}</span>}
          {t.episodes && <span>· {t.episodes} EP</span>}
        </div>
      </div>
    </Link>
  );
}
