export type Media = {
  id: number;
  title: { romaji: string; english: string | null; native: string | null };
  synonyms: string[];
  description: string | null;
  genres: string[];
  seasonYear: number | null;
  averageScore: number | null;
  episodes: number | null;
  status: string;
  countryOfOrigin: "JP" | "CN" | string;
  coverImage: { extraLarge: string; color: string | null };
  trailer: { id: string; site: string } | null;
  streamingEpisodes: { title: string; url: string; site: string }[];
  externalLinks: { url: string; site: string; type: string }[];
  format: string | null;
  studios: { nodes: { name: string }[] };
  recommendations: {
    nodes: {
      mediaRecommendation: {
        id: number;
        title: { romaji: string; english: string | null };
        coverImage: { large: string };
        countryOfOrigin: string;
      } | null;
    }[];
  };
};

const Q = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id title { romaji english native } synonyms description(asHtml: false) genres seasonYear
    averageScore episodes status countryOfOrigin
    coverImage { extraLarge color }
    trailer { id site }
    streamingEpisodes { title url site }
    externalLinks { url site type }
    format
    studios(isMain: true) { nodes { name } }
    recommendations(perPage: 12, sort: RATING_DESC) {
      nodes { mediaRecommendation { id title { romaji english } coverImage { large } countryOfOrigin } }
    }
  }
}`;

export async function getMedia(id: number): Promise<Media | null> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: Q, variables: { id } }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const media = (await res.json()).data?.Media;
  if (!media) return null;
  return {
    ...media,
    synonyms: Array.isArray(media.synonyms) ? media.synonyms : [],
  } as Media;
}
