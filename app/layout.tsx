import type { Metadata } from "next";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["700"], variable: "--font-outfit" });
const dm = DM_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm" });
const jb = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-jb" });

export const metadata: Metadata = {
  title: "KAIZEN — Anime & Donghua",
  description: "Anime and Donghua catalog powered by the AniList public API.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${dm.variable} ${jb.variable} bg-obsidian text-white font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
