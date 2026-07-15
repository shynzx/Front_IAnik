"use client";

import { useState, FormEvent } from "react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogle: (credential: string) => Promise<void>;
  onGoRegister: () => void;
  onGoRecover: () => void;
  onGoHome: () => void;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginScreen({
  onLogin,
  onGoogle,
  onGoRegister,
  onGoRecover,
  onGoHome,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.trim() && password.trim() && !loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Correo o contraseña incorrectos. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-background min-h-screen flex relative">

      {/* Botón de regreso — esquina superior izquierda (sobre el sidebar) */}
      <button
        onClick={onGoHome}
        className="fixed top-5 left-5 max-md:left-4 z-[60] flex items-center gap-1.5 bg-white/[0.035] border border-white/[0.08] cursor-pointer text-white/55 text-sm px-3 py-2 rounded-xl hover:text-white hover:bg-white/[0.08] transition-all"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-20 min-h-screen">
        <div className="glass-panel w-full max-w-[28rem] rounded-[28px] px-6 sm:px-10 pt-9 sm:pt-11 pb-9 animate-[fadeUp_.38s_ease_both]">
          {/* Logo + título — clic lleva al inicio */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={onGoHome}
              className="w-[2.875rem] h-[2.875rem] rounded-[0.8125rem] bg-[rgba(130,109,210,0.15)] border border-[rgba(130,109,210,0.3)] flex items-center justify-center shrink-0 cursor-pointer p-0 hover:opacity-75"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8" />
                <path d="M3 12c0-1.333.536-2.583 1.5-3.5" />
              </svg>
            </button>
            <div>
              <h1 className="font-semibold text-[1.375rem] text-white m-0 leading-[1.2]">
                Bienvenido a IAnik
              </h1>
              <p className="text-[0.8125rem] text-[rgba(255,255,255,0.38)] mt-1 mb-0">
                Inicia sesión para continuar
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[rgba(229,57,53,0.12)] border border-[rgba(229,57,53,0.3)] rounded-md px-3.5 py-2.5 mb-5 text-sm text-[#ef9a9a]">
              {error}
            </div>
          )}

          {/* Google */}
          <GoogleSignInButton clientId={GOOGLE_CLIENT_ID} text="signin_with" onCredential={onGoogle} onError={setError} />

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-[rgba(255,255,255,0.25)]">o con tu correo</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="text-xs text-[rgba(255,255,255,0.45)] block mb-[0.4375rem] tracking-[0.03125rem] uppercase">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none flex">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  className="w-full box-border bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3.5 py-2.75 pl-10 text-white text-sm outline-none caret-[#826dd2] focus:border-[rgba(130,109,210,0.6)] focus:bg-[rgba(130,109,210,0.07)]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2.5">
              <label className="text-xs text-[rgba(255,255,255,0.45)] block mb-[0.4375rem] tracking-[0.03125rem] uppercase">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none flex">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full box-border bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3.5 py-2.75 pl-10 text-white text-sm outline-none caret-[#826dd2] focus:border-[rgba(130,109,210,0.6)] focus:bg-[rgba(130,109,210,0.07)]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[rgba(255,255,255,0.3)] p-0.5 flex"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right mb-6">
              <button
                type="button"
                onClick={onGoRecover}
                className="text-[rgba(255,255,255,0.45)] cursor-pointer bg-none border-none text-[0.8125rem] p-0 hover:text-[#826dd2]"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl bg-[#826dd2] text-white border-none text-[0.9375rem] cursor-pointer flex items-center justify-center gap-2 font-[400] enabled:hover:bg-[#9b85e0] disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full inline-block animate-[spin_.7s_linear_infinite]" />
                  Entrando...
                </>
              ) : "Iniciar sesión"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-[rgba(255,255,255,0.25)]">o</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Register link */}
          <p className="text-sm text-[rgba(255,255,255,0.4)] text-center m-0">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={onGoRegister}
              className="text-sm font-medium text-[#826dd2] bg-none border-none cursor-pointer p-0"
            >
              Regístrate gratis
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
