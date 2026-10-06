import type { NextConfig } from "next";
const config: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "s4.anilist.co" }] },
};
export default config;
