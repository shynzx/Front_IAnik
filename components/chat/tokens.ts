/* ─── Types ─────────────────────────────────────────────── */

export type MsgAttachment = {
  id: string;
  kind: "image" | "document";
  name: string;
<<<<<<< HEAD
  preview?: string;
=======
  preview?: string; // object URL for images
>>>>>>> main
};

export type Msg = {
  role: "user" | "ai" | "sys";
  content: string;
  attachments?: MsgAttachment[];
<<<<<<< HEAD
  examSetId?:      string; // si este mensaje tiene un examen adjunto
  flashcardSetId?: string; // si este mensaje tiene flashcards adjuntas
  typed?: boolean;          // true cuando el Typewriter ya terminó de animar este mensaje
=======
>>>>>>> main
};

export type Doc = {
  name: string;
  type: "pdf" | "word";
  id: string;
  content?: string;
<<<<<<< HEAD
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

// ── Exámenes (RF-06) ─────────────────────────────────────
export type ExamCardStatus = "pending" | "learned" | "review";

export type AnswerOption = {
  text: string;
  rationale: string;
  isCorrect: boolean;
};

export type ExamCard = {
  id: string;
  question: string;
  answer: string;
  status: ExamCardStatus;
  answerOptions?: AnswerOption[]; // preguntas tipo quiz (opción múltiple / V-F)
  hint?: string;
};

export type ExamSet = {
  id: string;
  title: string;
  topic: string;
  cards: ExamCard[];
  createdAt: Date;
  loading?: boolean;
};

// ── Flashcards (RF-05) ───────────────────────────────────
export type FlashcardStatus = "pending" | "learned" | "review";

export type Flashcard = {
  answerOptions: any;
  id: string;
  question: string;
  answer: string;
  status: FlashcardStatus;
};

export type FlashcardSet = {
  id: string;
  title: string;
  topic: string;
  cards: Flashcard[];
  createdAt: Date;
  loading?: boolean;
=======
  htmlContent?: string;  // HTML limpio para DOCX (mammoth)
  fileUrl?: string;      // blob URL para visor PDF
  size?: number;
  uploadedAt?: Date;
  loading?: boolean;     // true mientras se procesa el archivo
>>>>>>> main
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