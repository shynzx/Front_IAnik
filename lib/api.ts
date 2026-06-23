export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://api.localhost:8000";

/* Compat: maps to NotebookFile shape used by existing UI */
export type RAGFileResponse = {
  id?: string;
  filename?: string;
  name?: string;
  size?: number;
  uploaded_at?: string;
  uploadedAt?: string;
  content?: string;
  text?: string;
  answer?: string;
  response?: string;
  answers?: string[];
};

import type {
  LoginResponse, User,
  Notebook, NotebookFile, NotebookChat, ChatMessage,
  StudyRoom, StudyRoomAccess,
  AssessmentFlashcard, AssessmentExam, AssessmentQuestion, ExamSubmitResponse, ExamAttempt,
  ProgressMetrics, DailyActivity,
  ApiKey, ApiKeyCreateResponse,
  WebhookSubscription, WebhookAttempt,
  AdminClassStats, AdminUserAuditLog, AdminUserStorage,
  HealthStatus, HealthProcess, HealthMetadata,
} from "../types";

type APIRequestOptions = RequestInit & {
  params?: Record<string, string>;
  skipJsonContentType?: boolean;
};

function buildUrl(endpoint: string, params?: Record<string, string>) {
  const url = API_URL ? new URL(endpoint, API_URL) : new URL(endpoint);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
}

async function parseErrorMessage(res: Response) {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) return data.detail.map((item: { msg?: string }) => item?.msg).filter(Boolean).join(", ");
    if (typeof data?.message === "string") return data.message;
  } catch {
    console.warn("No se pudo parsear el cuerpo del error como JSON");
  }
  return `Error ${res.status}: ${res.statusText || "Request failed"}`;
}

export async function fetchAPI<T = unknown>(endpoint: string, { params, skipJsonContentType, headers, ...options }: APIRequestOptions = {}) {
  const res = await fetch(buildUrl(endpoint, params), {
    ...options,
    headers: {
      ...(skipJsonContentType ? {} : { "Content-Type": "application/json" }),
      ...(headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }

  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}

let _token: string | null = null;
let _tokenType = "bearer";

if (typeof window !== "undefined") {
  const saved = localStorage.getItem("auth_token");
  const savedType = localStorage.getItem("auth_token_type");
  if (saved) {
    _token = saved;
    _tokenType = savedType || "bearer";
  }
}

export function setStoredToken(token: string, tokenType = "bearer") {
  _token = token;
  _tokenType = tokenType;
}

export function clearStoredToken() {
  _token = null;
  _tokenType = "bearer";
}

function getStoredToken() {
  if (typeof window === "undefined") return null;
  if (!_token) return null;
  return `${_tokenType} ${_token}`;
}

function withAuthHeader(headers: HeadersInit = {}, authHeader?: string | null): HeadersInit {
  const token = authHeader || getStoredToken();
  if (!token) return headers;
  return {
    ...headers,
    Authorization: token,
  };
}

/* ─── Auth / Users ──────────────────────────────────────── */

export async function registerUser(email: string, password: string, full_name: string) {
  return fetchAPI<User>("/users/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
  });
}

export async function loginUser(email: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  return fetchAPI<LoginResponse>("/users/login", {
    method: "POST",
    body: form.toString(),
    skipJsonContentType: true,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export async function getMe() {
  return fetchAPI<User>("/users/me", {
    headers: withAuthHeader(),
  });
}

export async function deleteMe(password: string) {
  return fetchAPI<void>("/users/me", {
    method: "DELETE",
    body: JSON.stringify({ password }),
    headers: withAuthHeader(),
  });
}

/* ─── Notebooks ─────────────────────────────────────────── */

export async function createNotebook(title: string, description: string, apiKey: string) {
  return fetchAPI<Notebook>("/notebooks", {
    method: "POST",
    body: JSON.stringify({ title, description }),
    headers: withAuthHeader({ "X-API-Key": apiKey }),
  });
}

export async function listNotebooks() {
  return fetchAPI<Notebook[]>("/notebooks", {
    headers: withAuthHeader(),
  });
}

export async function getNotebook(notebookId: string) {
  return fetchAPI<Notebook>(`/notebooks/${encodeURIComponent(notebookId)}`, {
    headers: withAuthHeader(),
  });
}

export async function updateNotebook(notebookId: string, data: { title?: string; description?: string }) {
  return fetchAPI<Notebook>(`/notebooks/${encodeURIComponent(notebookId)}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: withAuthHeader(),
  });
}

export async function deleteNotebook(notebookId: string) {
  return fetchAPI<void>(`/notebooks/${encodeURIComponent(notebookId)}`, {
    method: "DELETE",
    headers: withAuthHeader(),
  });
}

export async function uploadNotebookFile(notebookId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return fetchAPI<NotebookFile>(`/notebooks/${encodeURIComponent(notebookId)}/files`, {
    method: "POST",
    body: form,
    skipJsonContentType: true,
    headers: withAuthHeader(),
  });
}

export async function listNotebookFiles(notebookId: string) {
  return fetchAPI<NotebookFile[]>(`/notebooks/${encodeURIComponent(notebookId)}/files`, {
    headers: withAuthHeader(),
  });
}

export async function deleteNotebookFile(fileId: string) {
  return fetchAPI<void>(`/notebooks/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: withAuthHeader(),
  });
}

export async function createNotebookChat(notebookId: string) {
  return fetchAPI<NotebookChat>(`/notebooks/${encodeURIComponent(notebookId)}/chats`, {
    method: "POST",
    headers: withAuthHeader(),
  });
}

export async function listNotebookChats(notebookId: string) {
  return fetchAPI<NotebookChat[]>(`/notebooks/${encodeURIComponent(notebookId)}/chats`, {
    headers: withAuthHeader(),
  });
}

export async function deleteNotebookChat(chatId: string) {
  return fetchAPI<void>(`/notebooks/chats/${encodeURIComponent(chatId)}`, {
    method: "DELETE",
    headers: withAuthHeader(),
  });
}

export async function getChatMessages(chatId: string, params?: { page?: number; limit?: number }) {
  return fetchAPI<ChatMessage[]>(`/notebooks/chats/${encodeURIComponent(chatId)}/messages`, {
    params: params as Record<string, string>,
    headers: withAuthHeader(),
  });
}

export async function sendChatMessage(chatId: string, content: string) {
  return fetchAPI<ChatMessage>(`/notebooks/chats/${encodeURIComponent(chatId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: withAuthHeader(),
  });
}

/* ─── Study Rooms ───────────────────────────────────────── */

export async function createStudyRoom(notebookId: string) {
  return fetchAPI<StudyRoom>("/study-rooms", {
    method: "POST",
    body: JSON.stringify({ notebook_id: notebookId }),
    headers: withAuthHeader(),
  });
}

export async function joinStudyRoom(code: string) {
  return fetchAPI<StudyRoom>("/study-rooms/join", {
    method: "POST",
    body: JSON.stringify({ code }),
    headers: withAuthHeader(),
  });
}

export async function listCreatedRooms() {
  return fetchAPI<StudyRoom[]>("/study-rooms/creadas", {
    headers: withAuthHeader(),
  });
}

export async function listJoinedRooms() {
  return fetchAPI<StudyRoom[]>("/study-rooms/participa", {
    headers: withAuthHeader(),
  });
}

export async function getStudyRoom(roomId: string) {
  return fetchAPI<StudyRoom>(`/study-rooms/${encodeURIComponent(roomId)}`, {
    headers: withAuthHeader(),
  });
}

export async function getRoomAccess(roomId: string) {
  return fetchAPI<StudyRoomAccess>(`/study-rooms/${encodeURIComponent(roomId)}/acceso`, {
    headers: withAuthHeader(),
  });
}

export async function uploadRoomFile(roomId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return fetchAPI<NotebookFile>(`/study-rooms/${encodeURIComponent(roomId)}/files`, {
    method: "POST",
    body: form,
    skipJsonContentType: true,
    headers: withAuthHeader(),
  });
}

export async function listRoomFiles(roomId: string) {
  return fetchAPI<NotebookFile[]>(`/study-rooms/${encodeURIComponent(roomId)}/files`, {
    headers: withAuthHeader(),
  });
}

export async function deleteRoomFile(roomId: string, fileId: string) {
  return fetchAPI<void>(`/study-rooms/${encodeURIComponent(roomId)}/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: withAuthHeader(),
  });
}

export async function listRoomChats(roomId: string) {
  return fetchAPI<NotebookChat[]>(`/study-rooms/${encodeURIComponent(roomId)}/chats`, {
    headers: withAuthHeader(),
  });
}

export async function getRoomChatMessages(roomId: string, chatId: string) {
  return fetchAPI<ChatMessage[]>(`/study-rooms/${encodeURIComponent(roomId)}/chats/${encodeURIComponent(chatId)}/messages`, {
    headers: withAuthHeader(),
  });
}

export async function sendRoomChatMessage(roomId: string, chatId: string, content: string) {
  return fetchAPI<ChatMessage>(`/study-rooms/${encodeURIComponent(roomId)}/chats/${encodeURIComponent(chatId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: withAuthHeader(),
  });
}

export async function createRoomFlashcard(roomId: string, data: { question: string; answer: string; hint?: string }) {
  return fetchAPI<AssessmentFlashcard>(`/study-rooms/${encodeURIComponent(roomId)}/flashcards`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: withAuthHeader(),
  });
}

export async function listRoomFlashcards(roomId: string) {
  return fetchAPI<AssessmentFlashcard[]>(`/study-rooms/${encodeURIComponent(roomId)}/flashcards`, {
    headers: withAuthHeader(),
  });
}

export async function createRoomExam(roomId: string) {
  return fetchAPI<AssessmentExam>(`/study-rooms/${encodeURIComponent(roomId)}/exam`, {
    method: "POST",
    headers: withAuthHeader(),
  });
}

export async function listRoomExams(roomId: string) {
  return fetchAPI<AssessmentExam[]>(`/study-rooms/${encodeURIComponent(roomId)}/exams`, {
    headers: withAuthHeader(),
  });
}

/* ─── Assessments ───────────────────────────────────────── */

export async function generateFlashcards(notebookId: string) {
  return fetchAPI<AssessmentFlashcard[]>("/assessments/flashcards", {
    method: "POST",
    body: JSON.stringify({ notebook_id: notebookId }),
    headers: withAuthHeader(),
  });
}

export async function getNotebookFlashcards(notebookId: string) {
  return fetchAPI<AssessmentFlashcard[]>(`/assessments/flashcards/${encodeURIComponent(notebookId)}`, {
    headers: withAuthHeader(),
  });
}

export async function generateExam(notebookId: string) {
  return fetchAPI<AssessmentExam>("/assessments/exam", {
    method: "POST",
    body: JSON.stringify({ notebook_id: notebookId }),
    headers: withAuthHeader(),
  });
}

export async function getExam(examId: string) {
  return fetchAPI<{ exam: AssessmentExam; questions: AssessmentQuestion[] }>(`/assessments/exam/${encodeURIComponent(examId)}`, {
    headers: withAuthHeader(),
  });
}

export async function getNotebookExams(notebookId: string) {
  return fetchAPI<AssessmentExam[]>(`/assessments/exam/notebook/${encodeURIComponent(notebookId)}`, {
    headers: withAuthHeader(),
  });
}

export async function getRoomExams(roomId: string) {
  return fetchAPI<AssessmentExam[]>(`/assessments/exam/sala/${encodeURIComponent(roomId)}`, {
    headers: withAuthHeader(),
  });
}

export async function submitExam(examId: string, answers: { question_id: number; selected_option: number }[]) {
  return fetchAPI<ExamSubmitResponse>(`/assessments/exam/${encodeURIComponent(examId)}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
    headers: withAuthHeader(),
  });
}

export async function listAttempts() {
  return fetchAPI<ExamAttempt[]>("/assessments/attempts", {
    headers: withAuthHeader(),
  });
}

export async function getAttempt(attemptId: string) {
  return fetchAPI<ExamAttempt>(`/assessments/attempts/${encodeURIComponent(attemptId)}`, {
    headers: withAuthHeader(),
  });
}

export async function getExamAttempts(examId: string) {
  return fetchAPI<ExamAttempt[]>(`/assessments/attempts/exam/${encodeURIComponent(examId)}`, {
    headers: withAuthHeader(),
  });
}

/* ─── Progress ──────────────────────────────────────────── */

export async function getProgressMetrics() {
  return fetchAPI<ProgressMetrics>("/progress/metrics", {
    headers: withAuthHeader(),
  });
}

export async function getPendingCards() {
  return fetchAPI<AssessmentFlashcard[]>("/progress/pending-cards", {
    headers: withAuthHeader(),
  });
}

export async function getDailyActivity() {
  return fetchAPI<DailyActivity[]>("/progress/daily-activity", {
    headers: withAuthHeader(),
  });
}

/* ─── API Keys ──────────────────────────────────────────── */

export async function createApiKey(name: string) {
  return fetchAPI<ApiKeyCreateResponse>("/api-keys", {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: withAuthHeader(),
  });
}

export async function listApiKeys() {
  return fetchAPI<ApiKey[]>("/api-keys", {
    headers: withAuthHeader(),
  });
}

export async function deleteApiKey(keyId: string) {
  return fetchAPI<void>(`/api-keys/${encodeURIComponent(keyId)}`, {
    method: "DELETE",
    headers: withAuthHeader(),
  });
}

/* ─── Webhooks ──────────────────────────────────────────── */

export async function createWebhookSubscription(data: { org_id: string; url: string; events: string[]; secret?: string }) {
  return fetchAPI<WebhookSubscription>("/webhooks/subscriptions", {
    method: "POST",
    body: JSON.stringify(data),
    headers: withAuthHeader(),
  });
}

export async function listWebhookSubscriptions(orgId: string) {
  return fetchAPI<WebhookSubscription[]>(`/webhooks/subscriptions/org/${encodeURIComponent(orgId)}`, {
    headers: withAuthHeader(),
  });
}

export async function getWebhookAttempts() {
  return fetchAPI<WebhookAttempt[]>("/internal/webhooks/attempts", {
    headers: withAuthHeader(),
  });
}

export async function retryWebhookAttempt(attemptId: string) {
  return fetchAPI<void>(`/internal/webhooks/attempts/${encodeURIComponent(attemptId)}/retry`, {
    method: "POST",
    headers: withAuthHeader(),
  });
}

/* ─── Admin ─────────────────────────────────────────────── */

export async function getClassStats(roomId: string) {
  return fetchAPI<AdminClassStats>(`/admin/classes/${encodeURIComponent(roomId)}/stats`, {
    headers: withAuthHeader(),
  });
}

export async function getUserAuditLogs(userId: string) {
  return fetchAPI<AdminUserAuditLog[]>(`/admin/users/${encodeURIComponent(userId)}/audit-logs`, {
    headers: withAuthHeader(),
  });
}

export async function getUserStorage(userId: string) {
  return fetchAPI<AdminUserStorage>(`/admin/users/${encodeURIComponent(userId)}/storage`, {
    headers: withAuthHeader(),
  });
}

/* ─── Health ────────────────────────────────────────────── */

export async function healthRoot() {
  return fetchAPI<{ status: string }>("/");
}

export async function healthCheck() {
  return fetchAPI<HealthStatus>("/health/v1");
}

export async function getHealthProcesses() {
  return fetchAPI<HealthProcess[]>("/health/processes");
}

export async function getHealthMetadata(apiKey: string) {
  return fetchAPI<HealthMetadata>("/health/metadata", {
    headers: { "X-API-Key": apiKey },
  });
}
