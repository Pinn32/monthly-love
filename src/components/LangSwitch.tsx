"use client";

/**
 * Floating language toggle (top-right corner, rendered by the root layout).
 *
 * Writes the locale cookie client-side — it's plain UI preference, not a
 * secret, so no Server Action round-trip is needed — then refreshes so all
 * Server Components re-render in the new language.
 */

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

interface Props {
  /** The locale this button switches TO. */
  target: Locale;
  /** Button text — the name of the target language (e.g. "中文" / "EN"). */
  label: string;
}

export default function LangSwitch({ target, label }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchLocale = () => {
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      disabled={pending}
      aria-label={`Switch language to ${target === "zh" ? "Chinese" : "English"}`}
      className="
        fixed top-4 right-4 z-50 select-none
        rounded-full border border-stone-200 bg-white/70 backdrop-blur-sm
        px-3 py-1.5 text-xs tracking-wide text-stone-500 shadow-sm
        transition hover:border-rose-300 hover:text-rose-400
        active:scale-95 disabled:opacity-50
      "
    >
      {label}
    </button>
  );
}
