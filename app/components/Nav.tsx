"use client";
import { useEffect, useState } from "react";

export default function Nav() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const on = () => setCompact(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center">
      <nav
        className={`flex w-full items-center justify-between px-6 py-4 transition-all duration-500 ease-out ${
          compact
            ? "mt-3 max-w-xl rounded-full border border-white/[0.07] bg-surface/70 backdrop-blur-md"
            : "max-w-6xl"
        }`}
      >
        <span className="font-heading text-2xl tracking-tight">KAIZEN<span className="text-ember">.</span></span>
        <div className="hidden gap-7 text-[15px] text-muted md:flex">
          <a href="#browse" className="hover:text-white">Browse</a>
          <a href="#sync" className="hover:text-white">Schedule</a>
          <a href="/anime" className="hover:text-white">Search</a>
        </div>
        <a href="#browse" className="rounded-full bg-white px-4 py-1.5 font-heading text-sm text-black">Watch</a>
      </nav>
    </header>
  );
}
