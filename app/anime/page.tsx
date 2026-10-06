import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import BrowseCard from "../components/BrowseCard";
import { searchAnime } from "@/lib/browse";

const GENRES = ["Action","Adventure","Comedy","Drama","Fantasy","Horror","Mahou Shoujo","Mecha","Music","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller"];
const FORMATS = ["TV","TV_SHORT","MOVIE","OVA","ONA","SPECIAL"];
const SEASONS = ["WINTER","SPRING","SUMMER","FALL"];
const SORTS: [string, string][] = [["POPULARITY_DESC","Popular"],["TRENDING_DESC","Trending"],["SCORE_DESC","Top rated"],["START_DATE_DESC","Newest"]];
const COUNTRIES: [string, string][] = [["", "Anime + Donghua"],["JP","Japanese Anime"],["CN","Chinese Donghua"]];
const YEARS = Array.from({ length: 2026 - 1989 }, (_, i) => String(2026 - i));

const field =
  "w-full rounded-xl border border-white/[0.07] bg-card px-3.5 py-2.5 text-[15px] outline-none focus:border-white/30";

type SP = Record<string, string | undefined>;

export default async function AnimePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { items, hasNext, total } = await searchAnime({ ...sp, page });

  const href = (p: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") u.set(k, v);
    u.set("page", String(p));
    return `/anime?${u}`;
  };

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <h1 className="font-heading text-[clamp(40px,6vw,72px)] leading-[1.05] tracking-[-0.03em]">
          Browse<span className="text-ember">.</span>
        </h1>
        <p className="mt-3 text-muted">Search the AniList index by title, genre, season or format.</p>

        <form method="get" action="/anime" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input name="q" defaultValue={sp.q} placeholder="Search by title..." className={`${field} sm:col-span-2 lg:col-span-4`} />
          <select name="country" defaultValue={sp.country ?? ""} className={field}>
            {COUNTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select name="genre" defaultValue={sp.genre ?? ""} className={field}>
            <option value="">Any genre</option>
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select name="year" defaultValue={sp.year ?? ""} className={field}>
            <option value="">Any year</option>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
          <select name="season" defaultValue={sp.season ?? ""} className={field}>
            <option value="">Any season</option>
            {SEASONS.map((s) => <option key={s} value={s}>{s[0] + s.slice(1).toLowerCase()}</option>)}
          </select>
          <select name="format" defaultValue={sp.format ?? ""} className={field}>
            <option value="">Any format</option>
            {FORMATS.map((f) => <option key={f} value={f}>{f.replace("_", " ")}</option>)}
          </select>
          <select name="sort" defaultValue={sp.sort ?? "POPULARITY_DESC"} className={field}>
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <div className="flex gap-3 sm:col-span-2">
            <button className="flex-1 rounded-xl bg-white px-5 py-2.5 font-heading text-[15px] text-black">Apply</button>
            <Link href="/anime" className="rounded-xl border border-white/[0.07] px-5 py-2.5 font-heading text-[15px] text-muted hover:text-white">Reset</Link>
          </div>
        </form>

        <div className="mt-10 font-mono text-xs text-muted">{total.toLocaleString()} results · page {page}</div>

        {items.length === 0 ? (
          <p className="mt-10 text-muted">Nothing matched. Loosen a filter and try again.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {items.map((t) => <BrowseCard key={t.id} t={t} />)}
          </div>
        )}

        <div className="mt-12 flex items-center justify-between font-mono text-sm">
          {page > 1 ? <Link href={href(page - 1)} className="rounded-full border border-white/[0.07] px-5 py-2 hover:border-white/30">← Prev</Link> : <span />}
          {hasNext && <Link href={href(page + 1)} className="rounded-full border border-white/[0.07] px-5 py-2 hover:border-white/30">Next →</Link>}
        </div>
      </main>
      <Footer />
    </>
  );
}
