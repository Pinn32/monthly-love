"use client";

import { useEffect, useRef, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number; // 1 | 2 | 3
}

export default function TableOfContents({ label }: { label: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Collect headings from the rendered article body on mount.
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".article-body :is(h1,h2,h3)")
    );
    const items: Heading[] = els
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: el.textContent ?? "",
        level: parseInt(el.tagName[1], 10),
      }));
    setHeadings(items);
  }, []);

  // Scroll-spy: track the topmost heading that is currently in (or above) view.
  useEffect(() => {
    if (!headings.length) return;

    // Map of id → is-intersecting
    const visible = new Map<string, boolean>();

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting);
        }
        // Pick the first heading that is visible; fall back to last known active.
        const first = headings.find((h) => visible.get(h.id));
        if (first) setActiveId(first.id);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [headings]);

  // Need at least 2 headings to be worth showing.
  if (headings.length < 2) return null;

  return (
    <nav
      aria-label={label}
      className={[
        // Only visible on xl+ screens; positioned in the right gutter.
        "hidden xl:block",
        "fixed top-28",
        // Sit in the empty right gutter next to the max-w-2xl (42rem) body.
        "right-[max(1.5rem,calc((100vw-42rem)/2-13rem))]",
        "w-48 max-h-[70vh] overflow-y-auto",
      ].join(" ")}
    >
      <p className="mb-3 text-[0.65rem] font-serif tracking-widest text-[#37352f]/30 uppercase select-none">
        {label}
      </p>
      <ul className="space-y-0.5">
        {headings.map((h) => {
          const isActive = h.id === activeId;
          return (
            <li
              key={h.id}
              style={{ paddingLeft: `${(h.level - 1) * 0.75}rem` }}
            >
              <a
                href={`#${h.id}`}
                className={[
                  "block py-0.5 text-[0.78rem] leading-snug transition-colors",
                  "border-l-2 pl-2",
                  isActive
                    ? "border-rose-300 text-[#37352f] font-medium"
                    : "border-transparent text-[#37352f]/45 hover:text-[#37352f]/70",
                ].join(" ")}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
