/**
 * Server-side locale reader — kept separate from i18n.ts so Client Components
 * can import the dictionaries without pulling in next/headers.
 */

import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

/** Read the visitor's locale from the `ml_lang` cookie. Defaults to English. */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}
