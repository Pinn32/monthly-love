/**
 * Shared formatting helpers.
 */

/**
 * Format a Notion ISO date/datetime string for display.
 *
 * Parses the string directly with a regex so the displayed time is the
 * wall-clock value as Notion stored it — no conversion to the runtime timezone,
 * no SSR/CSR hydration mismatch.
 *
 * Date-only  →  "yyyy-mm-dd"
 * Datetime   →  "yyyy-mm-dd HH:mm UTC±N"  (e.g. "2026-06-23 00:57 UTC-4")
 */
export function formatDate(iso: string): string {
  const m = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?/
  );
  if (!m) return iso;

  const [, y, mo, d, hh, mm, off] = m;

  if (!hh) return `${y}-${mo}-${d}`;

  let tz = "";
  if (off === "Z") {
    tz = "UTC";
  } else if (off) {
    const sign = off[0];
    const hours = parseInt(off.slice(1, 3), 10);
    const mins = parseInt(off.slice(4, 6), 10);
    tz = `UTC${sign}${hours}${mins ? `:${String(mins).padStart(2, "0")}` : ""}`;
  }

  return `${y}-${mo}-${d} ${hh}:${mm}${tz ? ` ${tz}` : ""}`;
}
