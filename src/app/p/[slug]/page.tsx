/**
 * Post page — Server Component.
 *
 * Security model:
 * - If the visitor hasn't entered the correct password, this component renders
 *   ONLY the <PasswordForm>. The Notion content is never fetched, so the
 *   article body is never present in the HTML or HTTP response.
 * - If the session cookie says the slug is unlocked, the full article is
 *   fetched from Notion and rendered.
 *
 * noindex/nofollow is set both via metadata (meta tag) and via next.config.ts
 * (response header), so even authenticated pages stay out of search engines.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostMeta, getPostContent, listPublishedPosts, listComments } from "@/lib/notion";
import { isUnlocked } from "@/lib/auth";
import { unlockPost, postComment } from "./actions";
import PasswordForm from "@/components/PasswordForm";
import Article from "@/components/Article";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

// ISR: re-fetch from Notion at most once per minute.
// This also refreshes Notion-hosted image URLs before they expire (~1 hour).
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getPostMeta(slug);

  if (!meta) {
    const dict = getDict(await getLocale());
    return {
      title: dict.post.notFound,
      robots: { index: false, follow: false },
    };
  }

  return {
    // Only expose the title — no description/excerpt to avoid leaking content
    title: meta.title,
    robots: { index: false, follow: false },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  // Fetch only meta first — always cheap, no content exposure
  const meta = await getPostMeta(slug);
  if (!meta) notFound();

  const dict = getDict(await getLocale());
  const unlocked = await isUnlocked(slug);

  if (!unlocked) {
    // Render only the password gate; article content is NOT fetched here
    return (
      <PasswordForm
        title={meta.title || dict.password.fallbackTitle}
        subtitle={dict.password.subtitle}
        labels={dict.password}
        action={unlockPost.bind(null, slug)}
        backHref="/letters"
        backLabel={dict.post.back}
      />
    );
  }

  // Visitor has entered the correct password in a prior request.
  // Fetch content, neighbor list, and comments in parallel.
  const [content, posts, comments] = await Promise.all([
    getPostContent(meta.id),
    listPublishedPosts(),
    listComments(meta.id),
  ]);

  const idx = posts.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? posts[idx - 1] : null;
  const next = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null;

  const commentAction = postComment.bind(null, slug, meta.id);

  return (
    <Article
      title={meta.title}
      date={meta.date}
      content={content}
      prev={prev}
      next={next}
      comments={comments}
      commentAction={commentAction}
      dict={dict}
    />
  );
}
