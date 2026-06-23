/**
 * Article renderer: converts the Markdown string from notion-to-md into
 * styled React elements.
 *
 * notion-to-md block → Markdown/HTML:
 *   toggle        → <details><summary>…</summary>…</details>
 *   callout/quote → > text
 *   to_do         → - [ ] / - [x]
 *   code          → ```lang\n…\n```
 *   image         → ![caption](url)  (alt = Notion caption, or filename, or "image")
 *   divider       → ---
 *   underline     → <u>text</u>
 *   strikethrough → ~~text~~
 *   table         → GFM table
 */

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import type { Components } from "react-markdown";
import { formatDate } from "@/lib/format";
import TableOfContents from "@/components/TableOfContents";
import CommentSection from "@/components/CommentSection";
import type { Comment } from "@/lib/notion";
import type { CommentResult } from "@/app/p/[slug]/actions";

interface NavItem {
  slug: string;
  title: string;
}

interface Props {
  title: string;
  date: string | null;
  content: string;
  /** Newer letter (index position before this one). */
  prev?: NavItem | null;
  /** Older letter (index position after this one). */
  next?: NavItem | null;
  comments?: Comment[];
  commentAction?: (_prev: CommentResult, formData: FormData) => Promise<CommentResult>;
}

// notion-to-md sets alt to the filename (e.g. "photo.jpg") or "image" when
// there is no Notion caption. Only show a figcaption for real captions.
const isRealCaption = (alt: string | undefined): alt is string =>
  !!alt && alt !== "image" && !/\.\w{3,4}$/.test(alt);

const components: Components = {
  // ── Headings ─────────────────────────────────────────────────────────────
  // rehype-slug adds `id` to each heading; pass it through for anchor links
  // and TOC scroll-spy. scroll-mt offsets the sticky-ish back-link area.
  h1: ({ children, id }) => (
    <h1
      id={id}
      className="font-serif text-[1.875rem] font-bold text-[#37352f] mt-10 mb-[1.2rem] leading-snug scroll-mt-24"
    >
      {children}
    </h1>
  ),
  h2: ({ children, id }) => (
    <h2
      id={id}
      className="font-serif text-[1.5rem] font-bold text-[#37352f] mt-9 mb-[1.2rem] leading-snug scroll-mt-24"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3
      id={id}
      className="font-serif text-[1.25rem] font-semibold text-[#37352f] mt-7 mb-[1.2rem] scroll-mt-24"
    >
      {children}
    </h3>
  ),

  // ── Paragraph ────────────────────────────────────────────────────────────
  p: ({ children, node }) => {
    // <figure> (our img renderer) is a block element — it can't sit inside <p>.
    // If the paragraph's only meaningful child is an img, skip the <p> wrapper.
    const hasImg = node?.children.some(
      (c) => "tagName" in c && c.tagName === "img"
    );
    if (hasImg) return <>{children}</>;
    return (
      <p className="text-[#37352f] leading-[1.9] mt-[0.5em] mb-[1.2em] text-[1.35rem] sm:text-[1rem] indent-[2em]">
        {children}
      </p>
    );
  },

  // ── Links ─────────────────────────────────────────────────────────────────
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#37352f] underline decoration-[#37352f]/40 underline-offset-2 hover:decoration-[#37352f] transition-colors"
    >
      {children}
    </a>
  ),

  // ── Blockquote (Notion quote + callout both become >) ─────────────────────
  blockquote: ({ children }) => (
    <blockquote className="not-italic border-l-[3px] border-rose-300 bg-rose-50/40 pl-5 pr-4 py-3 my-8 rounded-r text-[#37352f]">
      {children}
    </blockquote>
  ),

  // ── Lists ─────────────────────────────────────────────────────────────────
  ul: ({ children, className }) =>
    className?.includes("contains-task-list") ? (
      <ul className="my-2 space-y-0.5 list-none pl-0">{children}</ul>
    ) : (
      <ul className="list-disc list-outside pl-5 my-2 space-y-0.5 text-[#37352f]">
        {children}
      </ul>
    ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 my-2 space-y-0.5 text-[#37352f]">
      {children}
    </ol>
  ),
  li: ({ children, className }) =>
    className?.includes("task-list-item") ? (
      <li className="flex items-start gap-2 leading-[1.7] text-[#37352f] pl-0">
        {children}
      </li>
    ) : (
      <li className="leading-[1.7] text-[#37352f]">{children}</li>
    ),

  // ── Task-list checkbox ────────────────────────────────────────────────────
  input: ({ type, checked }) => {
    if (type === "checkbox") {
      return (
        <span
          className={[
            "mt-[0.3em] flex-shrink-0 inline-flex items-center justify-center",
            "w-[1em] h-[1em] rounded-[3px] border",
            checked
              ? "bg-[#2eaadc] border-[#2eaadc]"
              : "bg-white border-[#37352f]/30",
          ].join(" ")}
          aria-hidden="true"
        >
          {checked && (
            <svg viewBox="0 0 12 12" fill="none" className="w-[0.7em] h-[0.7em]">
              <path
                d="M1.5 6.5L4.5 9.5L10.5 3"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      );
    }
    return <input type={type} />;
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  hr: () => (
    <hr className="my-6 h-px border-none bg-[#37352f]/10" />
  ),

  // ── Code blocks ───────────────────────────────────────────────────────────
  // pre is a transparent passthrough so the code component owns all layout.
  pre: ({ children }) => <>{children}</>,

  code: ({ children, className }) => {
    const language = className?.replace("language-", "") ?? "";
    const isBlock = !!className?.startsWith("language-");

    if (isBlock) {
      return (
        <div className="my-4 rounded-[3px] overflow-hidden bg-[#f7f6f3] border border-[#37352f]/[0.06]">
          {language && language !== "plaintext" && (
            <div className="px-4 pt-3 pb-1 text-[0.7rem] text-[#37352f]/40 uppercase tracking-widest font-mono select-none">
              {language}
            </div>
          )}
          <pre className="px-4 pb-4 pt-2 overflow-x-auto text-[0.875rem] text-[#37352f] font-mono leading-relaxed">
            <code>{children}</code>
          </pre>
        </div>
      );
    }

    return (
      <code className="bg-[#f7f6f3] text-[#eb5757] rounded-[3px] px-[0.35em] py-[0.1em] text-[0.875em] font-mono">
        {children}
      </code>
    );
  },

  // ── Toggle (Notion toggle → <details><summary>…</summary>…</details>) ─────
  details: ({ children }) => (
    <details className="notion-toggle group my-1">
      {children}
    </details>
  ),
  summary: ({ children }) => (
    <summary className="notion-toggle-summary flex items-center gap-1.5 cursor-pointer select-none text-[#37352f] py-0.5 rounded-[3px] hover:bg-[#37352f]/[0.04] px-1 -mx-1 transition-colors">
      <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-[#37352f]/40 transition-transform duration-150 group-open:rotate-90">
        <svg viewBox="0 0 6 10" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" className="w-[7px] h-[11px]">
          <path d="M1 1l4 4-4 4" />
        </svg>
      </span>
      <span className="font-medium leading-[1.7]">{children}</span>
    </summary>
  ),

  // ── Images ────────────────────────────────────────────────────────────────
  img: ({ src, alt }) => {
    const caption = isRealCaption(alt) ? alt : null;
    return (
      <figure className="my-6 flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          className="rounded-[3px] max-w-full block"
        />
        {caption && (
          <figcaption className="text-[0.8rem] text-[#37352f]/50 text-center leading-normal">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  },

  // ── Inline formatting ─────────────────────────────────────────────────────
  strong: ({ children }) => (
    <strong className="font-semibold text-[#37352f]">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="line-through text-[#37352f]/50">{children}</del>
  ),
  u: ({ children }) => (
    <u className="underline underline-offset-2">{children}</u>
  ),

  // ── Tables ────────────────────────────────────────────────────────────────
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm text-[#37352f]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-[#37352f]/15">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-[#37352f]/[0.07] hover:bg-[#37352f]/[0.03] transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold text-[#37352f]/60 whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="px-3 py-2 text-left">{children}</td>,
};

export default function Article({ title, date, content, prev, next, comments, commentAction }: Props) {
  return (
    <article className="anim-fade min-h-dvh bg-[#faf8f5] px-safe sm:px-6 pt-10 sm:pt-16 pb-safe sm:pb-16">
      {/* Floating table of contents — only visible on xl+ screens */}
      <TableOfContents />

      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/letters"
            className="inline-block py-2 text-sm text-[#37352f]/40 hover:text-[#37352f]/70 transition-colors"
          >
            ← 所有信
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="text-rose-300 text-3xl mb-4 select-none">✦</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#37352f] leading-tight mb-3">
            <strong>{title}</strong>
          </h1>
          {date && (
            <time className="text-sm text-[#37352f]/40 tracking-wide">
              {formatDate(date)}
            </time>
          )}
        </header>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-px bg-[#37352f]/10" />
          <span className="text-[#37352f]/20 text-xs tracking-widest">✦</span>
          <div className="flex-1 h-px bg-[#37352f]/10" />
        </div>

        {/* Body */}
        <div className="article-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Comments */}
        {comments !== undefined && commentAction && (
          <CommentSection comments={comments} action={commentAction} />
        )}

        {/* Prev / Next navigation */}
        {(prev || next) && (
          <nav className="mt-16 pt-8 border-t border-[#37352f]/10 grid grid-cols-2 gap-4">
            <div>
              {prev && (
                <Link
                  href={`/p/${prev.slug}`}
                  className="group flex flex-col gap-1"
                >
                  <span className="text-xs text-[#37352f]/35 group-hover:text-[#37352f]/55 transition-colors">
                    ← 上一篇
                  </span>
                  <span className="font-serif text-sm text-[#37352f]/60 group-hover:text-[#37352f]/80 transition-colors leading-snug line-clamp-2">
                    {prev.title}
                  </span>
                </Link>
              )}
            </div>
            <div className="text-right">
              {next && (
                <Link
                  href={`/p/${next.slug}`}
                  className="group flex flex-col gap-1 items-end"
                >
                  <span className="text-xs text-[#37352f]/35 group-hover:text-[#37352f]/55 transition-colors">
                    下一篇 →
                  </span>
                  <span className="font-serif text-sm text-[#37352f]/60 group-hover:text-[#37352f]/80 transition-colors leading-snug line-clamp-2">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-[#37352f]/20 text-xs tracking-widest">
          ✦ ✦ ✦
        </footer>
      </div>
    </article>
  );
}
