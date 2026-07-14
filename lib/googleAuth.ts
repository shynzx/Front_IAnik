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
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number;
              locale?: string;
            }
          ) => void;
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
let activeCredentialCallback: ((credential: string) => void) | null = null;

export function initGoogleSignIn(
  clientId: string,
  callback: (credential: string) => void
): void {
  if (typeof window === "undefined" || !window.google?.accounts?.id) return;
  activeCredentialCallback = callback;
  if (initializedClientId === clientId) return;
  initializedClientId = clientId;
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: GoogleCredentialResponse) => {
      if (response.credential) activeCredentialCallback?.(response.credential);
    },
  });
}

export function clearGoogleSignInCallback(callback: (credential: string) => void): void {
  if (activeCredentialCallback === callback) activeCredentialCallback = null;
}

export function renderGoogleSignInButton(parent: HTMLElement): void {
  if (!window.google?.accounts?.id) throw new Error("Google Sign-In todavía no está disponible");
  parent.replaceChildren();
  window.google.accounts.id.renderButton(parent, {
    type: "standard",
    theme: "filled_black",
    size: "large",
    text: "continue_with",
    shape: "rectangular",
    logo_alignment: "left",
    width: Math.min(Math.max(parent.clientWidth, 240), 400),
    locale: "es",
  });
}

export function parseGoogleCredential(credential: string, expectedClientId?: string): GoogleProfile {
  try {
    const parts = credential.split(".");
    if (parts.length !== 3 || !parts[1]) throw new Error("Formato de credencial inválido");
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
    const payload = JSON.parse(json) as Record<string, unknown>;
    const now = Math.floor(Date.now() / 1000);
    const issuer = payload.iss;
    const audience = payload.aud;
    const audienceMatches = !expectedClientId || audience === expectedClientId || (Array.isArray(audience) && audience.includes(expectedClientId));

    if (issuer !== "accounts.google.com" && issuer !== "https://accounts.google.com") throw new Error("Emisor de Google inválido");
    if (!audienceMatches) throw new Error("La credencial pertenece a otra aplicación");
    if (typeof payload.exp !== "number" || payload.exp <= now) throw new Error("La credencial de Google expiró");
    if (typeof payload.nbf === "number" && payload.nbf > now + 60) throw new Error("La credencial de Google aún no es válida");
    if (payload.email_verified !== true) throw new Error("Google no verificó este correo");
    if (typeof payload.email !== "string" || !payload.email.trim()) throw new Error("La credencial no incluye un correo");
    if (typeof payload.sub !== "string" || !payload.sub.trim()) throw new Error("La credencial no incluye un identificador");

    return {
      email: payload.email,
      name: typeof payload.name === "string" && payload.name.trim() ? payload.name : payload.email.split("@")[0],
      sub: payload.sub,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "No se pudo leer la credencial de Google");
  }
}

// Contraseña sintética determinística: el back la usa solo para hashear y
// autenticar; el usuario de Google nunca la introduce ni la necesita.
export function googleSyntheticPassword(sub: string): string {
  return `g_${sub}_oauth2024`;
}
