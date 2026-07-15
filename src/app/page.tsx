/**
 * Home page — intentionally minimal.
 *
 * The whole splash is a link to /letters (the password-gated index).
 * Titles are not listed here to avoid exposing them publicly.
 */

import Link from "next/link";
import type { Metadata } from "next";
import Sparkles from "@/components/Sparkles";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Monthly Love",
  description: "",
  robots: { index: false, follow: false },
};

export default async function Home() {
  const dict = getDict(await getLocale());

  return (
    <main className="bg-drift relative min-h-dvh overflow-hidden flex items-center justify-center px-safe">
      <Sparkles />

      <Link
        href="/letters"
        className="anim-rise group relative z-10 text-center cursor-pointer select-none outline-none transition-transform duration-300 active:scale-95"
      >
        <div className="twinkle text-rose-300 text-5xl mb-6 select-none group-hover:text-rose-400 transition-colors">
          ✦
        </div>
        <h1 className="font-serif text-3xl text-stone-700 tracking-wide mb-3 group-hover:text-stone-900 transition-colors">
          Monthly Love
        </h1>
        <p className="text-stone-400 text-sm group-hover:text-stone-500 transition-colors">
          {dict.home.greeting}
        </p>
      </Link>
    </main>
  );
}
