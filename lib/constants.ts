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
