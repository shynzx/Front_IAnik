"use client";

import { useState, FormEvent, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { loadGoogleScript, initGoogleSignIn, triggerGoogleSignIn } from "@/lib/googleAuth";

interface RegisterScreenProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onGoogle: (credential: string) => Promise<void>;
  onGoLogin: () => void;
  onGoHome: () => void;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function RegisterScreen({
  onRegister,
  onGoogle,
  onGoLogin,
  onGoHome,
}: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const onCredential = async (credential: string) => {
      setGoogleLoading(true);
      setError("");
      try {
        await onGoogle(credential);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo iniciar sesión con Google");
      } finally {
        setGoogleLoading(false);
      }
    };
    loadGoogleScript()
      .then(() => initGoogleSignIn(GOOGLE_CLIENT_ID!, onCredential))
      .catch(() => {});
  }, [onGoogle]);

  // ── Fortaleza de contraseña (mínimo 8 caracteres) ───────────
  const passwordStrength = (p: string) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabel = ["", "Débil", "Regular", "Buena", "Fuerte"][strength];
  const strengthColor = ["", "#ef5350", "#ffa726", "#66bb6a", "#26c6da"][strength];

  const passwordTooShort = password.length > 0 && password.length < 8;
  const confirmMismatch = confirm.length > 0 && confirm !== password;

  const canSubmit =
    name.trim() &&
    email.trim() &&
    password.length >= 8 &&       // mínimo 8 caracteres
    password === confirm &&
    !loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onRegister(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google Sign-In no está configurado. Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      return;
    }
    setError("");
    setGoogleLoading(true);
    loadGoogleScript()
      .then(() => triggerGoogleSignIn())
      .catch(() => {
        setError("No se pudo cargar Google Sign-In");
        setGoogleLoading(false);
      });
  };

  return (
    <div className="app-background min-h-screen flex relative">

      <Sidebar
        phase="onboard"
        hasMessages={false}
        onChatClick={() => {}}
        onStudyClick={() => {}}
        onSummariesClick={() => {}}
        onStudyRoomsClick={() => {}}
      />

      {/* Botón de regreso */}
      <button
        onClick={onGoHome}
        className="fixed top-5 left-[92px] max-md:left-4 z-[60] flex items-center gap-1.5 bg-white/[0.035] border border-white/[0.08] cursor-pointer text-white/55 text-sm px-3 py-2 rounded-xl hover:text-white hover:bg-white/[0.08] transition-all"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>

      <main className="flex-1 ml-[76px] max-md:ml-0 flex flex-col items-center justify-center px-4 sm:px-8 py-20 min-h-screen overflow-y-auto max-md:pb-24">
        <div className="glass-panel w-full max-w-[28rem] rounded-[28px] px-6 sm:px-10 pt-9 sm:pt-11 pb-9 animate-[fadeUp_.38s_ease_both]">
          {/* Logo + título */}
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
              <h1 className="font-semibold text-[1.375rem] text-white m-0 mb-1.5">
                Crea tu cuenta
              </h1>
              <p className="text-[0.8125rem] text-[rgba(255,255,255,0.38)] m-0">
                Únete a IAnik y empieza a organizar tu conocimiento
              </p>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-[rgba(229,57,53,0.12)] border border-[rgba(229,57,53,0.3)] rounded-[0.625rem] px-3.5 py-2.5 mb-5 text-[0.8125rem] text-[#ef9a9a]">
              {error}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-[0.6875rem] rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.13)] text-[rgba(255,255,255,0.85)] text-sm cursor-pointer flex items-center justify-center gap-2.5 mb-5 hover:bg-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
            <span className="text-xs text-[rgba(255,255,255,0.25)]">o con tu correo</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <Field label="Nombre completo">
              <IconInput
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                type="text"
                value={name}
                onChange={setName}
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </Field>

            {/* Email */}
            <Field label="Correo electrónico">
              <IconInput
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </Field>

            {/* Password */}
            <Field label="Contraseña">
              <IconInput
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                hasError={passwordTooShort}
                endAdornment={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="bg-none border-none cursor-pointer text-[rgba(255,255,255,0.3)] p-0.5 flex">
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                }
              />
              {/* Mensaje si es muy corta */}
              {passwordTooShort && (
                <p className="text-[0.6875rem] text-[#ef9a9a] mt-[0.3125rem] mb-0">
                  La contraseña debe tener al menos 8 caracteres
                </p>
              )}
              {/* Barra de fortaleza */}
              {password.length >= 8 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 h-[0.1875rem] rounded-full transition-[background_.25s]" style={{ background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <p className="text-[0.6875rem] m-0 transition-[color_.25s]" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </Field>

            {/* Confirm password */}
            <Field label="Confirmar contraseña">
              <IconInput
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={setConfirm}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                hasError={confirmMismatch}
                endAdornment={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="bg-none border-none cursor-pointer text-[rgba(255,255,255,0.3)] p-0.5 flex">
                    {showConfirm
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                }
              />
              {confirmMismatch && (
                <p className="text-[0.6875rem] text-[#ef9a9a] mt-[0.3125rem] mb-0">
                  Las contraseñas no coinciden
                </p>
              )}
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl bg-[#826dd2] text-white border-none text-[0.9375rem] cursor-pointer flex items-center justify-center gap-2 font-[400] enabled:hover:bg-[#9b85e0] disabled:opacity-45 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full inline-block animate-[spin_.7s_linear_infinite]" />
                  Creando cuenta...
                </>
              ) : "Crear cuenta"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
            <span className="text-xs text-[rgba(255,255,255,0.25)]">o</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
          </div>

          {/* Login link */}
          <p className="text-sm text-[rgba(255,255,255,0.4)] text-center m-0">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={onGoLogin}
              className="text-sm font-medium text-[#826dd2] bg-none border-none cursor-pointer p-0"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-[rgba(255,255,255,0.45)] block mb-[0.4375rem] tracking-[0.03125rem] uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

function IconInput({
  icon, type, value, onChange, placeholder, autoComplete, endAdornment, hasError,
}: {
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  endAdornment?: React.ReactNode;
  hasError?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-[0.8125rem] top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.25)] pointer-events-none flex">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full box-border bg-[rgba(255,255,255,0.05)] rounded-[0.6875rem] text-white text-sm outline-none caret-[#826dd2] py-[0.6875rem] pl-10 ${endAdornment ? "pr-[2.75rem]" : "pr-3.5"} ${hasError ? "border-[rgba(229,57,53,0.5)]" : "border-[rgba(255,255,255,0.1)]"} focus:border-[rgba(130,109,210,0.6)] focus:bg-[rgba(130,109,210,0.07)]`}
      />
      {endAdornment && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex">
          {endAdornment}
        </span>
      )}
    </div>
  );
}
