/**
 * Home page — intentionally minimal.
 *
 * Visitors arrive here via a direct link shared by the author.
 * The page does NOT list articles to avoid exposing even their titles publicly.
 * Change this if you want a curated index (e.g. show titles but gate body).
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Love",
  description: "",
  robots: { index: false, follow: false },
};

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
      <div className="text-center">
        <div className="text-rose-300 text-5xl mb-6 select-none">✦</div>
        <h1 className="font-serif text-3xl text-stone-700 tracking-wide mb-3">
          Monthly Love
        </h1>
        <p className="text-stone-400 text-sm">
          如果你在这里，说明你收到了链接。
        </p>
      </div>
    </main>
  );
}
