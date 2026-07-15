import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found",
  robots: { index: false, follow: false },
};

/**
 * Bilingual by design: the global 404 route is prerendered statically, so it
 * can't read the locale cookie the way the dynamic pages do.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
      <div className="text-center">
        <div className="text-stone-200 text-6xl mb-6 select-none font-serif">404</div>
        <p className="text-stone-400 text-sm">
          This page doesn&apos;t exist, or hasn&apos;t been published yet.
        </p>
        <p className="mt-1 text-stone-300 text-xs">这个页面不存在，或者还未发布。</p>
      </div>
    </main>
  );
}
