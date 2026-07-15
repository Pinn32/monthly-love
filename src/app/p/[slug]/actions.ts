"use server";

import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { getPostMeta, createComment } from "@/lib/notion";
import { unlock } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export interface UnlockResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action: verify the visitor's password attempt for a single post.
 *
 * - Fetches the real password from Notion server-side.
 * - Uses timingSafeEqual to prevent timing attacks.
 * - On success, writes the slug into the signed/encrypted iron-session cookie
 *   and invalidates the page so the Server Component re-renders with content.
 * - On failure, returns a plain error string (no stack traces, no secrets).
 */
export async function unlockPost(
  slug: string,
  attempt: string
): Promise<UnlockResult> {
  const dict = getDict(await getLocale());

  if (!attempt) {
    return { success: false, error: dict.password.required };
  }

  const meta = await getPostMeta(slug);

  if (!meta) {
    // Post not found or not published — don't distinguish to avoid enumeration.
    return { success: false, error: dict.password.wrong };
  }

  // Timing-safe comparison
  const expected = Buffer.from(meta.password, "utf8");
  const provided = Buffer.from(attempt, "utf8");

  const correct =
    expected.length === provided.length &&
    timingSafeEqual(expected, provided);

  if (!correct) {
    return { success: false, error: dict.password.wrong };
  }

  await unlock(slug);
  revalidatePath(`/p/${slug}`);

  return { success: true };
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface CommentResult {
  success: boolean;
  error?: string;
}

export async function postComment(
  slug: string,
  pageId: string,
  _prev: CommentResult,
  formData: FormData
): Promise<CommentResult> {
  const dict = getDict(await getLocale());
  const name = ((formData.get("name") as string | null) ?? "").trim();
  const message = ((formData.get("message") as string | null) ?? "").trim();

  if (!message) return { success: false, error: dict.comments.writeSomething };
  if (message.length > 500) return { success: false, error: dict.comments.tooLong };

  await createComment(pageId, name || dict.comments.anonymous, message);
  revalidatePath(`/p/${slug}`);

  return { success: true };
}
