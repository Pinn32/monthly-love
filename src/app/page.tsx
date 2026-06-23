/**
 * Home page — intentionally minimal.
 *
 * The whole splash is a link to /letters (the password-gated index).
 * Titles are not listed here to avoid exposing them publicly.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Love",
  description: "",
  robots: { index: false, follow: false },
};

export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#faf8f5] px-safe">
      <Link
        href="/letters"
        className="group text-center cursor-pointer select-none outline-none"
      >
        <div className="text-rose-300 text-5xl mb-6 select-none group-hover:text-rose-400 transition-colors">
          ✦
        </div>
        <h1 className="font-serif text-3xl text-stone-700 tracking-wide mb-3 group-hover:text-stone-900 transition-colors">
          Monthly Love
        </h1>
        <p className="text-stone-400 text-sm group-hover:text-stone-500 transition-colors">
          如果你在这里，说明你收到了链接。
        </p>
      </Link>
    </main>
  );
}
