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
  fileId?: string;
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
  id: number;
  nombre: string;
  email: string;
  is_active: boolean;
}

/* Notebooks */
export interface Notebook {
  id: number;
  title: string;
  description: string;
  created_at: string;
  usuario_id: number;
}

export interface NotebookFile {
  id: number;
  filename: string;
  file_type: string;
  notebook_id: number;
  created_at: string;
}

export interface NotebookChat {
  id: number;
  title: string;
  notebook_id: number;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/* Study Rooms */
export interface StudyRoom {
  id: number;
  title: string;
  codigo: string;
  notebook_id: number;
  creado_por_id: number;
  created_at: string;
}

export interface StudyRoomAccess {
  role: "admin" | "invitado";
  sala_id: number;
  title: string;
  codigo: string;
  notebook_id: number;
  creado_por_id: number;
}

/* Assessments */
export interface AssessmentFlashcard {
  id: number;
  question: string;
  answer: string;
  notebook_id: number;
  created_at: string;
  hint?: string;
  status?: "pending" | "learned" | "review";
}

export interface AssessmentExam {
  id: number;
  title: string;
  notebook_id: number;
  sala_id?: number | null;
  created_at: string;
  preguntas: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: number;
  question_text: string;
  opciones: { letra: string; texto: string }[];
}

export interface ExamSubmitResponse {
  id: number;
  examen_id: number;
  usuario_id: number;
  participante_sala_id?: number | null;
  score: number;
  completed_at: string;
  respuestas: { id: number; pregunta_id: number; opcion: string; is_correct: boolean }[];
}

export interface ExamAttempt {
  id: number;
  examen_id: number;
  usuario_id: number;
  participante_sala_id?: number | null;
  score: number;
  completed_at: string;
  respuestas: { id: number; pregunta_id: number; opcion: string; is_correct: boolean }[];
}

/* Progress */
export interface ProgressMetrics {
  total_exams_completed: number;
  average_score: number;
}

export interface DailyActivity {
  date: string;
  events_count: number;
}

/* API Keys */
export interface ApiKey {
  id: string;
  title: string;
  created_at: string;
  expires_at: string;
  active: boolean;
}

export interface ApiKeyCreateResponse {
  api_key: string;
  title: string;
  jti: string;
  expires_at: string;
}

/* Webhooks */
export interface WebhookSubscription {
  id: number;
  org_id: number;
  url: string;
  created_at: string;
}

export interface WebhookAttempt {
  id: string;
  subscription_id: number;
  url: string;
  payload: Record<string, unknown>;
  status_code: number | null;
  response_body: string | null;
  timestamp: string;
  success: boolean;
}

/* Admin */
export interface AdminClassStats {
  sala_id: number;
  total_attempts: number;
  average_score: number;
}

export interface AdminUserAuditLog {
  id: number;
  user_id: number;
  action: string;
  timestamp: string;
  ip: string;
}

export interface AdminUserStorage {
  user_id: number;
  total_files: number;
  storage_characters: number;
  storage_mb: number;
}

/* Health */
export interface HealthStatus {
  status: string;
  timestamp: string;
}

export interface HealthProcess {
  background_tasks_active: number;
  active_threads: number;
  status: string;
  scheduler: string;
}

export interface HealthMetadata {
  name: string;
  version: string;
  description: string;
  environment: string;
  author: string;
}
