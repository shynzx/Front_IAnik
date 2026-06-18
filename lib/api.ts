export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://api.localhost:8000";

export type LoginTokenResponse = {
  access_token: string;
  token_type: string;
};

export type RAGAskResponse = {
  answer?: string;
  response?: string;
  answers?: string[];
};

export type RAGFileResponse =
  | string
  | {
      filename?: string;
      name?: string;
      size?: number;
      uploaded_at?: string;
      uploadedAt?: string;
      content?: string;
      text?: string;
    };

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

export async function loginWithPassword(email: string, password: string) {
  const form = new URLSearchParams();
  // FastAPI OAuth2 expects username/password in x-www-form-urlencoded.
  form.set("username", email);
  form.set("password", password);

  return fetchAPI<LoginTokenResponse>("/api/v1/login/access-token", {
    method: "POST",
    body: form.toString(),
    skipJsonContentType: true,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export async function signupUser(name: string, email: string, password: string) {
  return fetchAPI<{ id: string }>("/api/v1/users/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      full_name: name,
    }),
  });
}

export async function ragUploadFile(file: File, authHeader?: string | null) {
  const form = new FormData();
  form.append("file", file);

  return fetchAPI<{ message?: string; filename?: string }>("/api/v1/rag/upload", {
    method: "POST",
    body: form,
    skipJsonContentType: true,
    headers: withAuthHeader({}, authHeader),
  });
}

export async function ragAsk(question: string, filenames: string[], authHeader?: string | null) {
  const data = await fetchAPI<RAGAskResponse>("/api/v1/rag/ask", {
    method: "POST",
    body: JSON.stringify({ question, filenames }),
    headers: withAuthHeader({}, authHeader),
  });

  if (Array.isArray(data.answers) && data.answers.length > 0) {
    return data.answers.join("\n\n");
  }

  return data.answer || data.response || "No se obtuvo respuesta del sistema RAG.";
}

export async function ragListFiles(authHeader?: string | null) {
  const response = await fetchAPI<unknown>("/api/v1/rag/files", {
    method: "GET",
    headers: withAuthHeader({}, authHeader),
  });

  if (Array.isArray(response)) {
    return response as RAGFileResponse[];
  }

  if (response && typeof response === "object") {
    const maybeWithFiles = response as { files?: unknown; data?: unknown; items?: unknown };
    if (Array.isArray(maybeWithFiles.files)) return maybeWithFiles.files as RAGFileResponse[];
    if (Array.isArray(maybeWithFiles.data)) return maybeWithFiles.data as RAGFileResponse[];
    if (Array.isArray(maybeWithFiles.items)) return maybeWithFiles.items as RAGFileResponse[];
  }

  return [];
}

export async function ragDeleteFile(filename: string, authHeader?: string | null) {
  return fetchAPI<{ message?: string }>(`/api/v1/rag/files/${encodeURIComponent(filename)}`, {
    method: "DELETE",
    headers: withAuthHeader({}, authHeader),
  });
}