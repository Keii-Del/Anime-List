import { getTrending, getSchedule } from "@/lib/anilist";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import LibraryRows from "./components/LibraryRows";
import CatalogTabs from "./components/CatalogTabs";
import Schedule from "./components/Bento/Schedule";
import AudioToggle from "./components/Bento/AudioToggle";
import Footer from "./components/Footer";

export default async function Page() {
  const t0 = performance.now();
  const [jp, cn, slots] = await Promise.all([getTrending("JP", 8), getTrending("CN", 8), getSchedule(4)]);
  const ms = Math.round(performance.now() - t0);
  const feature = cn.items[0];
  const all = [...jp.items.slice(0, 4), ...cn.items.slice(0, 4)];

  return (
    <>
      <Nav />
      <Hero feature={feature} />
      <LibraryRows />
      <CatalogTabs all={all} anime={jp.items} donghua={cn.items} />

      <section id="sync" className="mx-auto max-w-6xl px-6 pb-28">
        <h2 className="mb-10 font-heading text-[clamp(32px,4vw,48px)] leading-[1.15] tracking-[-0.02em]">
          Built on public APIs.<br /><span className="text-muted">Not on promises.</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          <Schedule slots={slots} />
          <div className="rounded-2xl border border-white/[0.07] bg-surface p-7">
            <h4 className="font-heading text-2xl leading-[1.3]">Open API Integration</h4>
            <p className="mb-5 mt-1 text-[15px] text-muted">Metadata from AniList GraphQL. No account wall.</p>
            <div className="font-mono text-5xl text-ember">{jp.total.toLocaleString()}</div>
            <div className="text-[15px] text-muted">anime entries in the index</div>
            <div className="mt-6 font-mono text-5xl text-jade">{ms}ms</div>
            <div className="text-[15px] text-muted">last 3-query fetch (cached after)</div>
          </div>
          <AudioToggle />
        </div>
      </section>

      <Footer />
    </>
  );
}
