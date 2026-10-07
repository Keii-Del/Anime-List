export type HiAnimeSearchItem = {
  id: string;
  title?: string | { english?: string | null; romaji?: string | null; native?: string | null };
  name?: string;
  poster?: string;
  image?: string;
  url?: string;
};

export type HiAnimeEpisode = {
  id: string;
  episodeNumber: number;
  title?: string | null;
  isFiller?: boolean;
  url?: string;
};

export type HiAnimeServer = {
  serverName: string;
  serverId: string | number;
};

export type HiAnimeServers = {
  episodeNumber?: number;
  sub: HiAnimeServer[];
  dub: HiAnimeServer[];
  raw?: HiAnimeServer[];
};

export type HiAnimeTrack = {
  file: string;
  label?: string;
  kind?: string;
  default?: boolean;
};

export type HiAnimeStream = {
  id: string;
  type: "sub" | "dub" | string;
  link: { file: string; type: string };
  tracks: HiAnimeTrack[];
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  server?: string;
};

const base = () => process.env.HIANIME_API_BASE?.replace(/\/$/, "");

function requireBase() {
  const value = base();
  if (!value) {
    throw new Error("HIANIME_API_BASE is not configured. Set it to your HiAnime API /api/v1 endpoint.");
  }
  return value;
}

async function api<T>(path: string, init?: RequestInit & { cacheMode?: "no-store" | "short" }): Promise<T> {
  const { cacheMode = "short", ...requestInit } = init ?? {};
  const response = await fetch(`${requireBase()}${path}`, {
    ...requestInit,
    headers: {
      Accept: "application/json",
      ...(requestInit.headers ?? {}),
    },
    ...(cacheMode === "no-store" ? { cache: "no-store" as const } : { next: { revalidate: 300 } }),
  });

  if (!response.ok) {
    throw new Error(`HiAnime API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function hianimeSearch(query: string, page = 1): Promise<HiAnimeSearchItem[]> {
  const json = await api<unknown>(`/search?keyword=${encodeURIComponent(query)}&page=${page}`);
  const root = json as { data?: unknown; results?: unknown } | null;
  const data = root?.data as { animes?: unknown; results?: unknown } | null;
  const raw = Array.isArray(data?.animes) ? data.animes : Array.isArray(data?.results) ? data.results : Array.isArray(root?.results) ? root.results : [];
  return raw
    .map((item) => item as Record<string, unknown>)
    .filter((item) => typeof item.id === "string")
    .map((item) => ({
      id: String(item.id),
      title: item.title as HiAnimeSearchItem["title"],
      name: typeof item.name === "string" ? item.name : undefined,
      poster: typeof item.poster === "string" ? item.poster : undefined,
      image: typeof item.image === "string" ? item.image : undefined,
      url: typeof item.url === "string" ? item.url : undefined,
    }));
}

export async function hianimeEpisodes(animeId: string): Promise<HiAnimeEpisode[]> {
  const json = await api<unknown>(`/episodes/${encodeURIComponent(animeId)}`);
  const root = json as { data?: unknown; episodes?: unknown } | null;
  const data = root?.data as { episodes?: unknown } | unknown;
  const raw = Array.isArray(data)
    ? data
    : Array.isArray((data as { episodes?: unknown } | null)?.episodes)
      ? (data as { episodes: unknown[] }).episodes
      : Array.isArray(root?.episodes)
        ? root.episodes
        : [];

  return raw
    .map((item) => item as Record<string, unknown>)
    .filter((item) => typeof item.id === "string" || typeof item.episodeId === "string")
    .map((item) => ({
      id: String(item.id ?? item.episodeId),
      episodeNumber: Number(item.episodeNumber ?? item.number ?? item.epNum ?? 0),
      title: typeof item.title === "string" ? item.title : null,
      isFiller: Boolean(item.isFiller ?? item.filler),
      url: typeof item.url === "string" ? item.url : undefined,
    }))
    .filter((item) => item.id && Number.isFinite(item.episodeNumber) && item.episodeNumber > 0)
    .sort((a, b) => a.episodeNumber - b.episodeNumber);
}

export async function hianimeServers(episodeId: string): Promise<HiAnimeServers> {
  const json = await api<unknown>(`/servers?id=${encodeURIComponent(episodeId)}`);
  const root = json as { data?: unknown; results?: unknown } | null;
  const data = (root?.data ?? root?.results ?? {}) as Record<string, unknown>;
  const parseServers = (value: unknown): HiAnimeServer[] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => item as Record<string, unknown>)
      .filter((item) => item.serverName != null || item.name != null)
      .map((item) => ({
        serverName: String(item.serverName ?? item.name),
        serverId: String(item.serverId ?? item.id ?? ""),
      }));
  };

  return {
    episodeNumber: Number.isFinite(Number(data.episodeNumber)) ? Number(data.episodeNumber) : undefined,
    sub: parseServers(data.sub),
    dub: parseServers(data.dub),
    raw: parseServers(data.raw),
  };
}

export async function hianimeStream(
  episodeId: string,
  server = "hd-1",
  type: "sub" | "dub" = "sub",
): Promise<HiAnimeStream> {
  const json = await api<unknown>(
    `/stream?id=${encodeURIComponent(episodeId)}&server=${encodeURIComponent(server)}&type=${encodeURIComponent(type)}`,
    { cacheMode: "no-store" },
  );
  const root = json as { data?: unknown; results?: unknown } | null;

  const candidates: Record<string, unknown>[] = [];
  const data = root?.data;
  const results = root?.results;
  if (Array.isArray(data)) candidates.push(...data.filter((v) => v && typeof v === "object") as Record<string, unknown>[]);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const object = data as Record<string, unknown>;
    if (Array.isArray(object.streamingLink)) candidates.push(...object.streamingLink.filter((v) => v && typeof v === "object") as Record<string, unknown>[]);
    candidates.push(object);
  }
  if (results && typeof results === "object" && !Array.isArray(results)) {
    const object = results as Record<string, unknown>;
    if (Array.isArray(object.streamingLink)) candidates.push(...object.streamingLink.filter((v) => v && typeof v === "object") as Record<string, unknown>[]);
    candidates.push(object);
  }

  const wantedServer = server.toLowerCase();
  const wantedType = type.toLowerCase();
  const selected = candidates.find((item) => {
    const itemServer = String(item.server ?? item.serverName ?? "").toLowerCase();
    const itemType = String(item.type ?? "").toLowerCase();
    return (!itemServer || itemServer === wantedServer) && (!itemType || itemType === wantedType);
  }) ?? candidates.find((item) => {
    const link = item.link as { file?: unknown } | undefined;
    return typeof link?.file === "string";
  });

  if (!selected) throw new Error("HiAnime did not return a playable stream.");

  const link = selected.link as { file?: unknown; type?: unknown } | undefined;
  if (typeof link?.file !== "string") throw new Error("HiAnime did not return a playable stream.");

  const rawTracks = Array.isArray(selected.tracks) ? selected.tracks : [];
  const tracks = rawTracks
    .filter((track): track is Record<string, unknown> => Boolean(track) && typeof track === "object")
    .map((track) => ({
      file: String(track.file ?? ""),
      label: typeof track.label === "string" ? track.label : undefined,
      kind: typeof track.kind === "string" ? track.kind : undefined,
      default: typeof track.default === "boolean" ? track.default : undefined,
    }))
    .filter((track) => track.file);

  const parseSkip = (value: unknown) => {
    if (!value || typeof value !== "object") return null;
    const item = value as Record<string, unknown>;
    const start = Number(item.start);
    const end = Number(item.end);
    return Number.isFinite(start) && Number.isFinite(end) && end > start ? { start, end } : null;
  };

  return {
    id: String(selected.id ?? episodeId),
    type: String(selected.type ?? type),
    link: { file: link.file, type: String(link.type ?? "hls") },
    tracks,
    intro: parseSkip(selected.intro),
    outro: parseSkip(selected.outro),
    server: typeof selected.server === "string" ? selected.server : server,
  };
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function candidateTitle(item: HiAnimeSearchItem): string {
  if (typeof item.title === "string") return item.title;
  return item.title?.english ?? item.title?.romaji ?? item.title?.native ?? item.name ?? "";
}

function tokenScore(a: string, b: string) {
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 88;

  const aa = new Set(a.split(" ").filter(Boolean));
  const bb = new Set(b.split(" ").filter(Boolean));
  const intersection = [...aa].filter((word) => bb.has(word)).length;
  const union = new Set([...aa, ...bb]).size || 1;
  return (intersection / union) * 75;
}

export async function resolveHiAnimeId(titles: string[]): Promise<HiAnimeSearchItem | null> {
  const candidates = [...new Set(titles.map((value) => value.trim()).filter(Boolean))];
  const wanted = candidates.map(normalize).filter(Boolean);
  if (!wanted.length) return null;

  const searches = candidates.slice(0, 5);
  const results = (await Promise.all(searches.map((query) => hianimeSearch(query).catch(() => [])))).flat();
  if (!results.length) return null;

  const unique = new Map<string, HiAnimeSearchItem>();
  for (const item of results) unique.set(item.id, item);

  let best: { item: HiAnimeSearchItem; score: number } | null = null;
  for (const item of unique.values()) {
    const title = normalize(candidateTitle(item));
    if (!title) continue;

    const score = Math.max(...wanted.map((query) => tokenScore(title, query)));
    if (!best || score > best.score) best = { item, score };
  }

  return best && best.score >= 45 ? best.item : null;
}

export function makeHiAnimeProxyUrl(url: string) {
  if (process.env.HIANIME_USE_PROXY === "false") return url;
  const apiBase = requireBase();
  const referer = process.env.HIANIME_PROXY_REFERER ?? "https://megacloud.tv";
  return `${apiBase}/proxy?url=${encodeURIComponent(url)}&referer=${encodeURIComponent(referer)}`;
}
