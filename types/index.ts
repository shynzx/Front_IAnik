/* ─── UI Types ──────────────────────────────────────────── */

export interface AuthUser {
  name: string;
  email: string;
}

export type MsgAttachment = {
  id: string;
  kind: "image" | "document";
  name: string;
  preview?: string;
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
  htmlContent?: string;
  fileUrl?: string;
  size?: number;
  uploadedAt?: Date;
  loading?: boolean;
};

/* ─── API Response Types ───────────────────────────────── */

/* Auth */
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

/* Notebooks */
export interface Notebook {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface NotebookFile {
  id: string;
  notebook_id: string;
  filename: string;
  size: number;
  type: string;
  uploaded_at: string;
  content?: string;
}

export interface NotebookChat {
  id: string;
  notebook_id: string;
  title?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/* Study Rooms */
export interface StudyRoom {
  id: string;
  notebook_id: string;
  code: string;
  creator_id: string;
  created_at: string;
}

export interface StudyRoomAccess {
  role: "creator" | "invitado";
}

/* Assessments */
export interface AssessmentFlashcard {
  id: string;
  notebook_id: string;
  question: string;
  answer: string;
  hint?: string;
  status: "pending" | "learned" | "review";
  created_at: string;
}

export interface AssessmentExam {
  id: string;
  notebook_id?: string;
  sala_id?: string;
  title: string;
  total_questions: number;
  created_at: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: { text: string; isCorrect: boolean; rationale?: string }[];
  answer_explanation?: string;
}

export interface ExamSubmitResponse {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  score?: number;
  total: number;
  completed_at?: string;
  answers?: { question_id: number; selected: number; correct: boolean }[];
}

/* Progress */
export interface ProgressMetrics {
  average_score: number;
  total_exams: number;
  total_cards: number;
  learned_cards: number;
  pending_cards: number;
}

export interface DailyActivity {
  date: string;
  files_uploaded: number;
  exams_completed: number;
  messages_sent: number;
}

/* API Keys */
export interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  created_at: string;
  last_used_at?: string;
  is_active: boolean;
}

export interface ApiKeyCreateResponse {
  id: string;
  name: string;
  full_key: string;
  created_at: string;
}

/* Webhooks */
export interface WebhookSubscription {
  id: string;
  org_id: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret?: string;
  created_at: string;
}

export interface WebhookAttempt {
  id: string;
  subscription_id: string;
  event: string;
  status: "success" | "failed" | "pending";
  request_body?: string;
  response_status?: number;
  attempted_at: string;
}

/* Admin */
export interface AdminClassStats {
  total_students: number;
  total_flashcards: number;
  total_quizzes: number;
  average_progress: number;
}

export interface AdminUserAuditLog {
  id: string;
  user_id: string;
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface AdminUserStorage {
  used_bytes: number;
  limit_bytes: number;
  file_count: number;
}

/* Health */
export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  uptime_seconds: number;
}

export interface HealthProcess {
  name: string;
  status: "running" | "stopped" | "error";
  pid?: number;
  memory_mb?: number;
}

export interface HealthMetadata {
  environment: string;
  commit_sha?: string;
  build_time?: string;
  python_version?: string;
}

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
