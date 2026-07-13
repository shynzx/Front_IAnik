import type { CSSProperties } from "react";

export const BG = "linear-gradient(135deg, #000000 0%, #3c2850 100%)";

export const gradText: CSSProperties = {
  background: "linear-gradient(90deg, #ffffff 0%, #a5a5a5 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export const pp: CSSProperties = {
  fontFamily: "var(--font-poppins), sans-serif",
  fontWeight: 300,
};

export function visiblePaginationIndexes(total: number, active: number, limit = 9): number[] {
  if (total <= limit) return Array.from({ length: total }, (_, index) => index);
  const half = Math.floor(limit / 2);
  const start = Math.max(0, Math.min(active - half, total - limit));
  return Array.from({ length: limit }, (_, offset) => start + offset);
}
