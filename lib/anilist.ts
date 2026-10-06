export type Title = {
  id: number;
  name: string;
  year: number | null;
  genres: string[];
  score: number | null; // AniList average, 0-100
  cover: string;
  color: string | null;
  origin: "JP" | "CN";
  rank: number;
  episodes: number | null;
  nextEp: number | null;
  link: string;
};

export type Slot = { id: number; airingAt: number; episode: number; name: string; origin: string };

const URL = "https://graphql.anilist.co";

async function gql<T>(query: string, variables: object, revalidate: number): Promise<T> {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  return (await res.json()).data;
}

const TRENDING = `
query ($country: CountryCode, $perPage: Int) {
  Page(perPage: $perPage) {
    pageInfo { total }
    media(type: ANIME, sort: TRENDING_DESC, countryOfOrigin: $country, isAdult: false) {
      id title { romaji english } seasonYear genres averageScore episodes
      coverImage { extraLarge color } countryOfOrigin
      nextAiringEpisode { episode }
      trailer { id site }
    }
  }
}`;

export async function getTrending(country: "JP" | "CN", perPage = 8) {
  const d = await gql<any>(TRENDING, { country, perPage }, 3600);
  const items: Title[] = d.Page.media.map((m: any, i: number) => ({
    id: m.id,
    name: m.title.english ?? m.title.romaji,
    year: m.seasonYear,
    genres: m.genres.slice(0, 2),
    score: m.averageScore,
    cover: m.coverImage.extraLarge,
    color: m.coverImage.color,
    origin: m.countryOfOrigin,
    rank: i + 1,
    episodes: m.episodes,
    nextEp: m.nextAiringEpisode?.episode ?? null,
    link:
      m.trailer?.site === "youtube"
        ? `https://www.youtube.com/watch?v=${m.trailer.id}`
        : `https://anilist.co/anime/${m.id}`,
  }));
  return { items, total: d.Page.pageInfo.total as number };
}

const SCHEDULE = `
query ($perPage: Int) {
  Page(perPage: $perPage) {
    airingSchedules(notYetAired: true, sort: TIME) {
      id airingAt episode
      media { title { romaji english } countryOfOrigin }
    }
  }
}`;

export async function getSchedule(perPage = 4): Promise<Slot[]> {
  const d = await gql<any>(SCHEDULE, { perPage }, 300);
  return d.Page.airingSchedules.map((s: any) => ({
    id: s.id,
    airingAt: s.airingAt,
    episode: s.episode,
    name: s.media.title.english ?? s.media.title.romaji,
    origin: s.media.countryOfOrigin,
  }));
}
