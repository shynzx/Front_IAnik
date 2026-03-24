/* ─── Types ─────────────────────────────────────────────── */

export type MsgAttachment = {
  id: string;
  kind: "image" | "document";
  name: string;
  preview?: string; // object URL for images
};

export type Msg = {
  role: "user" | "ai" | "sys";
  content: string;
  attachments?: MsgAttachment[];
};

export type Doc = {
  name: string;
  type: "pdf" | "word";
  id: string;
  content?: string;
  size?: number;
  uploadedAt?: Date;
};

/* ─── Design tokens ──────────────────────────────────────── */
export const BG = "linear-gradient(135deg, #000000 0%, #3c2850 100%)";

export const gradText: React.CSSProperties = {
  background: "linear-gradient(90deg, #ffffff 0%, #a5a5a5 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export const pp: React.CSSProperties = {
  fontFamily: "var(--font-poppins), sans-serif",
  fontWeight: 300,
};