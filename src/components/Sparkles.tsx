/**
 * Decorative drifting sparkles/hearts. Server component — positions, sizes,
 * speeds and timings are pre-computed so no client JS is shipped. Animation is
 * pure CSS (see `.sparkle` in globals.css) and respects prefers-reduced-motion.
 */

import type { CSSProperties } from "react";

const PARTICLES = [
  { glyph: "✦", left: "8%",  size: "1.5rem",  duration: "16s", delay: "0s",   drift: "2rem",    scale: 0.7, opacity: 0.5 },
  { glyph: "♡", left: "20%", size: "1.1rem",  duration: "20s", delay: "3s",   drift: "-1.5rem", scale: 0.9, opacity: 0.4 },
  { glyph: "✦", left: "34%", size: "0.9rem",  duration: "13s", delay: "6s",   drift: "1rem",    scale: 0.6, opacity: 0.55 },
  { glyph: "♡", left: "48%", size: "1.6rem",  duration: "24s", delay: "1.5s", drift: "2.5rem",  scale: 1,   opacity: 0.35 },
  { glyph: "✦", left: "62%", size: "1.2rem",  duration: "18s", delay: "8s",   drift: "-2rem",   scale: 0.8, opacity: 0.5 },
  { glyph: "♡", left: "76%", size: "1rem",    duration: "15s", delay: "4s",   drift: "1.5rem",  scale: 0.7, opacity: 0.45 },
  { glyph: "✦", left: "88%", size: "1.4rem",  duration: "21s", delay: "10s",  drift: "-1rem",   scale: 0.9, opacity: 0.4 },
  { glyph: "♡", left: "55%", size: "0.85rem", duration: "12s", delay: "11s",  drift: "0.5rem",  scale: 0.6, opacity: 0.5 },
];

export default function Sparkles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="sparkle text-rose-300"
          style={
            {
              left: p.left,
              fontSize: p.size,
              "--p-duration": p.duration,
              "--p-delay": p.delay,
              "--p-drift": p.drift,
              "--p-scale": p.scale,
              "--p-opacity": p.opacity,
            } as CSSProperties
          }
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}
