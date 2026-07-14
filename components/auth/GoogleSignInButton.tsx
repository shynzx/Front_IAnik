"use client";

import { useEffect, useRef, useState } from "react";
import {
  clearGoogleSignInCallback,
  initGoogleSignIn,
  loadGoogleScript,
  renderGoogleSignInButton,
} from "@/lib/googleAuth";

interface GoogleSignInButtonProps {
  clientId?: string;
  text?: "signin_with" | "signup_with" | "continue_with";
  onCredential: (credential: string) => Promise<void>;
  onError: (message: string) => void;
}

export default function GoogleSignInButton({
  clientId,
  text = "continue_with",
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!clientId) {
      onError("Google Sign-In no está configurado. Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      return;
    }

    const handleCredential = async (credential: string) => {
      if (!mounted) return;
      setProcessing(true);
      onError("");
      try {
        await onCredential(credential);
      } catch (error) {
        if (mounted) onError(error instanceof Error ? error.message : "No se pudo continuar con Google");
      } finally {
        if (mounted) setProcessing(false);
      }
    };

    void loadGoogleScript()
      .then(() => {
        if (!mounted || !buttonRef.current) return;
        initGoogleSignIn(clientId, handleCredential);
        renderGoogleSignInButton(buttonRef.current);
        setReady(true);
      })
      .catch(() => {
        if (mounted) onError("No se pudo cargar Google Sign-In. Revisa tu conexión o el bloqueo de cookies.");
      });

    return () => {
      mounted = false;
      clearGoogleSignInCallback(handleCredential);
    };
  }, [clientId, onCredential, onError]);

  return (
    <div className="relative mb-5 min-h-10.5 w-full overflow-hidden rounded-xl border border-white/[0.13] bg-white/[0.05] p-px transition-colors hover:border-white/20 hover:bg-white/[0.09]">
      <div
        ref={buttonRef}
        className={`flex min-h-10.5 w-full justify-center overflow-hidden rounded-[0.7rem] transition-opacity ${ready && !processing ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-label={text === "signup_with" ? "Registrarse con Google" : "Iniciar sesión con Google"}
      />
      {!ready && !processing && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
          {clientId ? "Cargando Google…" : "Google no configurado"}
        </div>
      )}
      {processing && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#100d1b] text-sm text-white" aria-live="polite">
          <span className="h-4 w-4 animate-[spin_.7s_linear_infinite] rounded-full border-2 border-white/25 border-t-white" />
          Verificando cuenta…
        </div>
      )}
    </div>
  );
}
