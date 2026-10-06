export type Sub = { label: string; lang: string; src: string }; // WebVTT
export type Episode = { n: number; title?: string; src: string; subtitles?: Sub[] };

export type Source =
  | { type: "video" | "playlist"; id: string } // official YouTube upload
  | { type: "hls"; episodes: Episode[] }; // .m3u8 (or .mp4) you host

export const FULL_EPISODES: Record<number, Source> = {
  // key = AniList media id (use one from your catalog)
  1: {
    type: "hls",
    episodes: [
      { n: 1, title: "Demo A", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
      { n: 2, title: "Demo B", src: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8" },
    ],
  },
};