"use client";

// Utilidades para Google Sign-In usando Google Identity Services (GIS),
// sin dependencias externas. El back NO soporta OAuth, así que adaptamos
// el id_token de Google al flujo email/password que ya existe en el back:
// derivamos una contraseña sintética (determinística) a partir del `sub`.

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
          }) => void;
          prompt: (
            callback?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              getSkippedReason: () => string;
            }) => void
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

export interface GoogleProfile {
  email: string;
  name: string;
  sub: string;
  picture?: string;
}

let scriptPromise: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("No se pudo cargar Google Sign-In"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

let initializedClientId: string | null = null;

export function initGoogleSignIn(
  clientId: string,
  callback: (credential: string) => void
): void {
  if (typeof window === "undefined" || !window.google?.accounts?.id) return;
  if (initializedClientId === clientId) return;
  initializedClientId = clientId;
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: GoogleCredentialResponse) => {
      if (response.credential) callback(response.credential);
    },
  });
}

export function triggerGoogleSignIn(): void {
  window.google?.accounts?.id.prompt();
}

export function parseGoogleCredential(credential: string): GoogleProfile {
  try {
    const base64 = credential
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(json);
    return {
      email: payload.email,
      name: payload.name || (payload.email ? payload.email.split("@")[0] : "Usuario"),
      sub: payload.sub,
      picture: payload.picture,
    };
  } catch {
    throw new Error("No se pudo leer la credencial de Google");
  }
}

// Contraseña sintética determinística: el back la usa solo para hashear y
// autenticar; el usuario de Google nunca la introduce ni la necesita.
export function googleSyntheticPassword(sub: string): string {
  return `g_${sub}_oauth2024`;
}
