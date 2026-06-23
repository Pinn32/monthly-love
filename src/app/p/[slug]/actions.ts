"use server";

import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { getPostMeta } from "@/lib/notion";
import { unlock } from "@/lib/auth";

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
  if (!attempt) {
    return { success: false, error: "请输入密码" };
  }

  const meta = await getPostMeta(slug);

  if (!meta) {
    // Post not found or not published — don't distinguish to avoid enumeration.
    return { success: false, error: "密码不正确" };
  }

  // Timing-safe comparison
  const expected = Buffer.from(meta.password, "utf8");
  const provided = Buffer.from(attempt, "utf8");

  const correct =
    expected.length === provided.length &&
    timingSafeEqual(expected, provided);

  if (!correct) {
    return { success: false, error: "密码不正确" };
  }

  await unlock(slug);
  revalidatePath(`/p/${slug}`);

  return { success: true };
}
