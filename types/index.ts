/* ─── Types ─────────────────────────────────────────────── */

export interface AuthUser {
  name: string;
  email: string;
}

export type MsgAttachment = {
  id: string;
  kind: "image" | "document";
  name: string;
  preview?: string; // object URL for images
};

export type Msg = {
  id: string;
  role: "user" | "ai" | "sys";
  content: string;
  attachments?: MsgAttachment[];
};

export type ExamCard = {
  id: string;
  question: string;
  answer: string;
  status: "pending" | "learned" | "review";
  answerOptions?: { text: string; isCorrect: boolean; rationale?: string }[];
  hint?: string;
};

export type ExamSet = {
  id: string;
  title: string;
  topic: string;
  cards: ExamCard[];
  loading?: boolean;
  createdAt?: Date;
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  status: "pending" | "learned" | "review";
};

export type FlashcardSet = {
  id: string;
  title: string;
  topic: string;
  cards: Flashcard[];
  loading?: boolean;
  createdAt?: Date;
};

export type Summary = {
  id: string;
  title?: string;
  docName: string;
  createdAt: Date;
  content?: string;
  keyPoints?: string[];
  loading?: boolean;
};

export type Doc = {
  name: string;
  type: "pdf" | "word";
  id: string;
  content?: string;
  htmlContent?: string;  // HTML limpio para DOCX (mammoth)
  fileUrl?: string;      // blob URL para visor PDF
  size?: number;
  uploadedAt?: Date;
  loading?: boolean;     // true mientras se procesa el archivo
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