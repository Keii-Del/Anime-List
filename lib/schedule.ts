export type Airing = {
  id: number;
  airingAt: number; // unix seconds
  episode: number;
  mediaId: number;
  name: string;
  origin: string;
  format: string | null;
  cover: string;
};

const Q = `
query ($page: Int, $from: Int, $to: Int) {
  Page(page: $page, perPage: 50) {
    pageInfo { hasNextPage }
    airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
      id airingAt episode
      media {
        id isAdult format countryOfOrigin
        title { romaji english }
        coverImage { medium }
      }
    }
  }
}`;

export async function getWeekSchedule(): Promise<Airing[]> {
  // round to the hour so the fetch cache key stays stable
  const from = Math.floor(Date.now() / 3600000) * 3600;
  const to = from + 7 * 86400;
  const out: Airing[] = [];

  for (let page = 1; page <= 8; page++) {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: Q, variables: { page, from, to } }),
      next: { revalidate: 600 },
    });
    if (!res.ok) break;
    const d = (await res.json()).data?.Page;
    if (!d) break;
    for (const s of d.airingSchedules) {
      if (!s.media || s.media.isAdult) continue;
      out.push({
        id: s.id,
        airingAt: s.airingAt,
        episode: s.episode,
        mediaId: s.media.id,
        name: s.media.title.english ?? s.media.title.romaji,
        origin: s.media.countryOfOrigin,
        format: s.media.format,
        cover: s.media.coverImage.medium,
      });
    }
    if (!d.pageInfo.hasNextPage) break;
  }
  return out;
}
