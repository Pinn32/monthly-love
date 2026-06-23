/**
 * /letters — password-gated index of all published letters.
 *
 * Security model mirrors /p/[slug]:
 * - Before the visitor unlocks, this component renders ONLY the PasswordForm.
 *   The list of posts is never fetched, so no titles or excerpts appear in the
 *   locked page's HTML.
 * - After unlock (session cookie contains INDEX_KEY), the full list is fetched
 *   from Notion and rendered.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/notion";
import { isUnlocked, INDEX_KEY } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import PasswordForm from "@/components/PasswordForm";
import { unlockIndex } from "./actions";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "所有信",
  robots: { index: false, follow: false },
};

export default async function LettersPage() {
  if (!(await isUnlocked(INDEX_KEY))) {
    return (
      <PasswordForm
        title="所有信"
        subtitle="输入密码后即可查看全部信件"
        action={unlockIndex}
      />
    );
  }

  // Only fetched after the visitor has authenticated
  const posts = await listPublishedPosts();

  return (
    <main className="min-h-dvh bg-[#faf8f5] px-safe sm:px-6 pt-10 sm:pt-16 pb-safe sm:pb-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="text-rose-300 text-3xl mb-4 select-none">✦</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#37352f] leading-tight">
            所有信
          </h1>
        </header>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-px bg-[#37352f]/10" />
          <span className="text-[#37352f]/20 text-xs tracking-widest">✦</span>
          <div className="flex-1 h-px bg-[#37352f]/10" />
        </div>

        {/* List */}
        {posts.length === 0 ? (
          <p className="text-center text-[#37352f]/40 text-sm">还没有信。</p>
        ) : (
          <ol className="divide-y divide-[#37352f]/10">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/p/${post.slug}`}
                  className="group block py-6 hover:bg-[#37352f]/[0.02] -mx-3 px-3 rounded-[3px] transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <span className="font-serif text-lg text-[#37352f] leading-snug group-hover:text-[#37352f]/80 transition-colors">
                      {post.title}
                    </span>
                    {post.date && (
                      <time className="flex-shrink-0 text-xs text-[#37352f]/40 tracking-wide">
                        {formatDate(post.date)}
                      </time>
                    )}
                  </div>
                  {post.excerpt && (
                    <p className="text-sm text-[#37352f]/60 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-[#37352f]/20 text-xs tracking-widest">
          ✦ ✦ ✦
        </footer>
      </div>
    </main>
  );
}
