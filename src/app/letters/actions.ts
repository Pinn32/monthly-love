"use server";

import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { unlock, INDEX_KEY } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import type { UnlockResult } from "@/app/p/[slug]/actions";

/**
 * Server Action: verify the visitor's attempt against the site-wide index
 * password (INDEX_PASSWORD env var). On success, writes the index sentinel key
 * into the iron-session cookie and revalidates /letters.
 *
 * If INDEX_PASSWORD is unset or empty the gate can never be passed, so the
 * list stays locked until the variable is configured.
 */
export async function unlockIndex(attempt: string): Promise<UnlockResult> {
  const dict = getDict(await getLocale());

  if (!attempt) {
    return { success: false, error: dict.password.required };
  }

  const expected = Buffer.from(process.env.INDEX_PASSWORD ?? "", "utf8");
  const provided = Buffer.from(attempt, "utf8");

  const correct =
    expected.length > 0 &&
    expected.length === provided.length &&
    timingSafeEqual(expected, provided);

  if (!correct) {
    return { success: false, error: dict.password.wrong };
  }

  await unlock(INDEX_KEY);
  revalidatePath("/letters");

  return { success: true };
}
