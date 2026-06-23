/**
 * iron-session helpers — server-side only.
 * The session stores the list of slugs the visitor has already unlocked so
 * they don't have to re-enter the password on every page load.
 */

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

// ─── Session shape ───────────────────────────────────────────────────────────

export interface SessionData {
  /** Slugs whose password the visitor has entered correctly. */
  unlockedSlugs: string[];
}

/**
 * Reserved key used to mark the /letters index as unlocked in the session.
 * The leading space means it can never collide with a real Notion slug
 * (Notion rich-text slugs are plain alphanumeric + hyphens).
 */
export const INDEX_KEY = "\x00index";

// ─── Config ──────────────────────────────────────────────────────────────────

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "ml_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    // 30 days — visitors don't need to re-enter the password often
    maxAge: 60 * 60 * 24 * 30,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/** Returns true if the visitor has already entered the correct password for
 *  this slug in a previous request. */
export async function isUnlocked(slug: string): Promise<boolean> {
  const session = await getSession();
  return (session.unlockedSlugs ?? []).includes(slug);
}

/** Add `slug` to the session's unlocked list and persist the cookie. */
export async function unlock(slug: string): Promise<void> {
  const session = await getSession();
  const current = session.unlockedSlugs ?? [];
  if (!current.includes(slug)) {
    session.unlockedSlugs = [...current, slug];
    await session.save();
  }
}
