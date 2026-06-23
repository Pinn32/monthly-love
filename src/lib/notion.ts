/**
 * Notion API helpers — server-side only.
 * Password is fetched here but never forwarded to the client.
 */

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PostMeta {
  id: string;
  title: string;
  password: string;
  date: string | null;
  excerpt: string;
}

export interface PostListItem {
  slug: string;
  title: string;
  date: string | null;
  excerpt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function asPage(result: unknown): PageObjectResponse {
  return result as PageObjectResponse;
}

function richText(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop];
  if (!p || p.type !== "rich_text") return "";
  return p.rich_text[0]?.plain_text ?? "";
}

function titleText(page: PageObjectResponse): string {
  const p = page.properties["Title"];
  if (!p || p.type !== "title") return "";
  return p.title[0]?.plain_text ?? "";
}

function dateText(page: PageObjectResponse): string | null {
  const p = page.properties["Date"];
  if (!p || p.type !== "date") return null;
  return p.date?.start ?? null;
}

// ─── API ────────────────────────────────────────────────────────────────────

/**
 * Fetch metadata (including password) for a single published post.
 * Called server-side only; the caller must never pass `password` to a Client
 * Component.
 */
export async function getPostMeta(slug: string): Promise<PostMeta | null> {
  const db = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "Published", checkbox: { equals: true } },
      ],
    },
  });

  if (!db.results.length) return null;
  const page = asPage(db.results[0]);

  return {
    id: page.id,
    title: titleText(page),
    password: richText(page, "Password"),
    date: dateText(page),
    excerpt: richText(page, "Excerpt"),
  };
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

/** List all comments on a page. Comments are stored as "name\nmessage". */
export async function listComments(pageId: string): Promise<Comment[]> {
  const response = await notion.comments.list({ block_id: pageId });
  return response.results.map((c) => {
    const text = c.rich_text.map((r) => r.plain_text).join("");
    const nl = text.indexOf("\n");
    if (nl === -1) return { id: c.id, name: "匿名", message: text, createdAt: c.created_time };
    return {
      id: c.id,
      name: text.slice(0, nl).trim() || "匿名",
      message: text.slice(nl + 1).trim(),
      createdAt: c.created_time,
    };
  });
}

/** Append a comment to a page. Stored as "name\nmessage" in Notion's rich_text. */
export async function createComment(pageId: string, name: string, message: string): Promise<void> {
  await notion.comments.create({
    parent: { page_id: pageId },
    rich_text: [{ type: "text", text: { content: `${name}\n${message}` } }],
  });
}

/**
 * Render a Notion page's content as a Markdown string.
 * Only called after the visitor has authenticated.
 */
export async function getPostContent(pageId: string): Promise<string> {
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  return n2m.toMarkdownString(mdBlocks).parent;
}

/**
 * List all published posts for the index page (titles/dates only — no body,
 * no passwords).
 */
export async function listPublishedPosts(): Promise<PostListItem[]> {
  const db = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: { property: "Published", checkbox: { equals: true } },
    sorts: [{ property: "Date", direction: "descending" }],
  });

  return db.results
    .map((result) => {
      const page = asPage(result);
      return {
        slug: richText(page, "Slug"),
        title: titleText(page),
        date: dateText(page),
        excerpt: richText(page, "Excerpt"),
      };
    })
    .filter((p) => p.slug);
}
