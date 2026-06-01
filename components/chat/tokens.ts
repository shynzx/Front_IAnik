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
  flashcardSetId?: string; // si este mensaje tiene flashcards adjuntas
};

export type Doc = {
  name: string;
  type: "pdf" | "word";
  id: string;
  content?: string;
  htmlContent?: string;
  fileUrl?: string;
  size?: number;
  uploadedAt?: Date;
  loading?: boolean;
};

// ── Resúmenes ────────────────────────────────────────────
export type SummaryLevel = "full" | "chapter" | "topic";

export type Summary = {
  level: string;
  topicLabel: string;
  id: string;
  docId: string;
  docName: string;
  title: string;
  prompt: string;
  content: string;
  keyPoints: string[];
  createdAt: Date;
  loading?: boolean;
};

// ── Flashcards ───────────────────────────────────────────
export type FlashcardStatus = "pending" | "learned" | "review";

export type AnswerOption = {
  text: string;
  rationale: string;
  isCorrect: boolean;
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  status: FlashcardStatus;
  answerOptions?: AnswerOption[]; // Opcional: Para preguntas tipo Quiz
  hint?: string;                  // Opcional: Para mostrar una pista
};

export type FlashcardSet = {
  id: string;
  title: string;
  topic: string;
  cards: Flashcard[];
  createdAt: Date;
  loading?: boolean;
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