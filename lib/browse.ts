export type Item = {
  id: number;
  name: string;
  year: number | null;
  genres: string[];
  score: number | null;
  format: string | null;
  episodes: number | null;
  cover: string;
  color: string | null;
  origin: string;
};

export type Filters = {
  q?: string;
  genre?: string;
  year?: string;
  season?: string;
  format?: string;
  country?: string;
  sort?: string;
  page?: number;
};

const Q = `
query ($page: Int, $search: String, $genre: String, $year: Int, $season: MediaSeason,
       $format: MediaFormat, $country: CountryCode, $sort: [MediaSort]) {
  Page(page: $page, perPage: 24) {
    pageInfo { hasNextPage total }
    media(type: ANIME, search: $search, genre: $genre, seasonYear: $year, season: $season,
          format: $format, countryOfOrigin: $country, sort: $sort, isAdult: false) {
      id title { romaji english } seasonYear genres averageScore format episodes
      coverImage { extraLarge color } countryOfOrigin
    }
  }
}`;

export async function searchAnime(f: Filters) {
  const sort = f.q ? "SEARCH_MATCH" : f.sort || "POPULARITY_DESC";
  const variables = {
    page: f.page ?? 1,
    search: f.q || undefined,
    genre: f.genre || undefined,
    year: f.year ? Number(f.year) : undefined,
    season: f.season || undefined,
    format: f.format || undefined,
    country: f.country || undefined,
    sort: [sort],
  };
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: Q, variables }),
    next: { revalidate: 600 },
  });
  if (!res.ok) return { items: [] as Item[], hasNext: false, total: 0 };
  const d = (await res.json()).data.Page;
  const items: Item[] = d.media.map((m: any) => ({
    id: m.id,
    name: m.title.english ?? m.title.romaji,
    year: m.seasonYear,
    genres: m.genres.slice(0, 2),
    score: m.averageScore,
    format: m.format,
    episodes: m.episodes,
    cover: m.coverImage.extraLarge,
    color: m.coverImage.color,
    origin: m.countryOfOrigin,
  }));
  return { items, hasNext: d.pageInfo.hasNextPage as boolean, total: d.pageInfo.total as number };
}
