import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ScheduleBoard from "../components/ScheduleBoard";
import { getWeekSchedule } from "@/lib/schedule";

export const metadata = { title: "Airing Schedule — KAIZEN" };

export default async function SchedulePage() {
  const items = await getWeekSchedule();
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <h1 className="font-heading text-[clamp(40px,6vw,72px)] leading-[1.05] tracking-[-0.03em]">
          Airing Schedule<span className="text-jade">.</span>
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Every episode dropping over the next seven days, Anime and Donghua, straight from AniList.
        </p>
        <ScheduleBoard items={items} />
      </main>
      <Footer />
    </>
  );
}
