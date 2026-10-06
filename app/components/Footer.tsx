export default function Footer() {
  return (
    <footer id="search" className="border-t border-white/[0.07] bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h3 className="mb-6 font-heading text-[32px] leading-[1.2]">Looking for something specific?</h3>
        <div className="flex max-w-2xl items-center rounded-full border border-white/[0.07] bg-card px-5 py-2">
          <input
            className="flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted"
            placeholder="Search by title, genre, or studio..."
          />
          <span className="font-mono text-xs text-muted">⌘K</span>
        </div>
        <div className="mt-8 font-mono text-[13px] text-jade">● Public API Gateway: Operational (200 OK)</div>
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted">
          <a href="#">Terms</a><a href="#">Privacy</a><a href="#">DMCA</a>
          <a href="https://anilist.co" target="_blank" rel="noreferrer">AniList attribution</a>
        </div>
        <p className="mt-6 max-w-3xl text-[13px] text-muted">
          KAIZEN hosts no video files. Metadata and artwork belong to their studios, licensors and the AniList community.
        </p>
      </div>
    </footer>
  );
}
