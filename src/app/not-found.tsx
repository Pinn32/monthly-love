import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "未找到",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
      <div className="text-center">
        <div className="text-stone-200 text-6xl mb-6 select-none font-serif">404</div>
        <p className="text-stone-400 text-sm">这个页面不存在，或者还未发布。</p>
      </div>
    </main>
  );
}
