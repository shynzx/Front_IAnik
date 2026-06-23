"use client";

import { useState, FormEvent } from "react";
import { BG, pp } from "../../types";
import Sidebar from "../layout/Sidebar";

interface RegisterScreenProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onGoLogin: () => void;
  onGoHome: () => void;
}

export default function RegisterScreen({
  onRegister,
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
  const [error, setError] = useState("");

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
    // TODO: conecta tu proveedor OAuth (NextAuth, Supabase, Firebase, etc.)
    // TODO: Google OAuth
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        position: "relative",
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-input:focus {
          border-color: rgba(130,109,210,0.6) !important;
          background: rgba(130,109,210,0.07) !important;
        }
        .auth-input.error { border-color: rgba(229,57,53,0.5) !important; }
        .auth-btn-primary:hover:not(:disabled) { background: #9b85e0 !important; }
        .auth-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .google-btn:hover { background: rgba(255,255,255,0.09) !important; border-color: rgba(255,255,255,0.2) !important; }
        .back-btn:hover { color: #826dd2 !important; background: rgba(130,109,210,0.08) !important; }
        .logo-btn:hover { opacity: 0.75; }
      `}</style>

      <Sidebar
        phase="onboard"
        docsOpen={false}
        docsFullscreen={false}
        hasMessages={false}
        onChatClick={() => {}}
        onDocsClick={() => {}}
      />

      {/* Botón de regreso */}
      <button
        onClick={onGoHome}
        className="back-btn"
        style={{
          position: "fixed",
          top: 18,
          left: 76,
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.45)",
          ...pp,
          fontSize: 13,
          padding: "6px 10px",
          borderRadius: 8,
          transition: "color .15s, background .15s",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>

      <main
        style={{
          flex: 1,
          marginLeft: 64,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "72px 48px 48px",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24,
            padding: "44px 40px 40px",
            backdropFilter: "blur(20px)",
            animation: "fadeUp .38s ease both",
          }}
        >
          {/* Logo + título */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <button
              onClick={onGoHome}
              className="logo-btn"
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: "rgba(130,109,210,0.15)",
                border: "1px solid rgba(130,109,210,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                cursor: "pointer",
                transition: "opacity .15s",
                padding: 0,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8" />
                <path d="M3 12c0-1.333.536-2.583 1.5-3.5" />
              </svg>
            </button>
            <div>
              <h1 style={{ ...pp, fontWeight: 600, fontSize: 22, color: "#fff", margin: "0 0 6px" }}>
                Crea tu cuenta
              </h1>
              <p style={{ ...pp, fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>
                Únete a IAnik y empieza a organizar tu conocimiento
              </p>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: "rgba(229,57,53,0.12)",
              border: "1px solid rgba(229,57,53,0.3)",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 20,
              ...pp,
              fontSize: 13,
              color: "#ef9a9a",
            }}>
              {error}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            className="google-btn"
            style={{
              ...pp,
              width: "100%",
              padding: "11px 0",
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.13)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 20,
              transition: "background .15s, border-color .15s",
            }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>o con tu correo</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 2, display: "flex" }}>
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                }
              />
              {/* Mensaje si es muy corta */}
              {passwordTooShort && (
                <p style={{ ...pp, fontSize: 11, color: "#ef9a9a", margin: "5px 0 0" }}>
                  La contraseña debe tener al menos 8 caracteres
                </p>
              )}
              {/* Barra de fortaleza */}
              {password.length >= 8 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)", transition: "background .25s" }} />
                    ))}
                  </div>
                  <p style={{ ...pp, fontSize: 11, color: strengthColor, margin: 0, transition: "color .25s" }}>
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
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 2, display: "flex" }}>
                    {showConfirm
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                }
              />
              {confirmMismatch && (
                <p style={{ ...pp, fontSize: 11, color: "#ef9a9a", margin: "5px 0 0" }}>
                  Las contraseñas no coinciden
                </p>
              )}
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="auth-btn-primary"
              style={{
                ...pp,
                fontWeight: 400,
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                background: "#826dd2",
                color: "#fff",
                border: "none",
                fontSize: 15,
                cursor: "pointer",
                transition: "background .15s, opacity .15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 8,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                  Creando cuenta...
                </>
              ) : "Crear cuenta"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>o</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Login link */}
          <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center", margin: 0 }}>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={onGoLogin}
              style={{ ...pp, fontSize: 14, fontWeight: 500, color: "#826dd2", background: "none", border: "none", cursor: "pointer", padding: 0 }}
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
  const pp = { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300 };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 7, letterSpacing: "0.5px", textTransform: "uppercase" as const }}>
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
  const pp = { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300 };
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", pointerEvents: "none", display: "flex" }}>
        {icon}
      </span>
      <input
        className={`auth-input${hasError ? " error" : ""}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          boxSizing: "border-box" as const,
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${hasError ? "rgba(229,57,53,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 11,
          padding: `11px ${endAdornment ? "44px" : "14px"} 11px 40px`,
          color: "#fff",
          outline: "none",
          ...pp,
          fontSize: 14,
          transition: "border-color .15s, background .15s",
          caretColor: "#826dd2",
        }}
      />
      {endAdornment && (
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
          {endAdornment}
        </span>
      )}
    </div>
  );
}