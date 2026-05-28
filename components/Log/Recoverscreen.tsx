"use client";

import { useState, FormEvent } from "react";
import { BG, pp } from "../chat/tokens";
import Sidebar from "../chat/Sidebar";


interface RecoverScreenProps {
  onRecover: (email: string) => Promise<void>;
  onVerifyCode: (code: string) => Promise<void>;
  onNewPassword: (password: string) => Promise<void>;
  onGoLogin: () => void;
}

type Step = "email" | "code" | "newpass" | "done";

export default function RecoverScreen({
  onRecover,
  onVerifyCode,
  onNewPassword,
  onGoLogin,
}: RecoverScreenProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── Step 1: Send email ─────────────────────────────── */
  const handleSendEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setError("");
    setLoading(true);
    try {
      await onRecover(email);
      setStep("code");
    } catch {
      setError("No encontramos esa dirección. Verifica e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify code ────────────────────────────── */
  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    const full = code.join("");
    if (full.length < 6 || loading) return;
    setError("");
    setLoading(true);
    try {
      await onVerifyCode(full);
      setStep("newpass");
    } catch {
      setError("Código incorrecto o expirado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeInput = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = v;
    setCode(next);
    if (v && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      (nextInput as HTMLInputElement)?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      (prev as HTMLInputElement)?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...code];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setCode(next);
    const lastFilled = Math.min(pasted.length, 5);
    (document.getElementById(`code-${lastFilled}`) as HTMLInputElement)?.focus();
  };

  /* ── Step 3: New password ───────────────────────────── */
  const handleNewPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6 || newPass !== confirmPass || loading) return;
    setError("");
    setLoading(true);
    try {
      await onNewPassword(newPass);
      setStep("done");
    } catch {
      setError("No se pudo actualizar la contraseña. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared styles ──────────────────────────────────── */
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 11,
    padding: "11px 14px 11px 40px",
    color: "#fff",
    outline: "none",
    ...pp,
    fontSize: 14,
    transition: "border-color .15s, background .15s",
    caretColor: "#826dd2",
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
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes scaleIn { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        .auth-input:focus { border-color:rgba(130,109,210,0.6)!important; background:rgba(130,109,210,0.07)!important; }
        .auth-btn-primary:hover:not(:disabled) { background:#9b85e0!important; }
        .auth-btn-primary:disabled { opacity:.45; cursor:not-allowed; }
        .code-box:focus { border-color:rgba(130,109,210,0.7)!important; background:rgba(130,109,210,0.1)!important; outline:none; }
      `}</style>

      <Sidebar
        phase="onboard"
        docsOpen={false}
        docsFullscreen={false}
        hasMessages={false}
        onChatClick={() => {}}
        onDocsClick={() => {}}
      />

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
        }}
      >
        {/* ── Back button ── */}
        {step !== "done" && (
          <button
            onClick={step === "email" ? onGoLogin : () => { setStep("email"); setError(""); }}
            style={{
              position: "absolute",
              top: 28,
              left: 84,
              ...pp,
              fontSize: 13,
              color: "rgba(255,255,255,0.35)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "color .15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#826dd2")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {step === "email" ? "Iniciar sesión" : "Volver"}
          </button>
        )}

        {/* Progress dots */}
        {step !== "done" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {(["email", "code", "newpass"] as Step[]).map((s, i) => {
              const steps: Step[] = ["email", "code", "newpass"];
              const current = steps.indexOf(step);
              const isActive = steps.indexOf(s) <= current;
              return (
                <div
                  key={s}
                  style={{
                    width: isActive ? 24 : 8,
                    height: 8,
                    borderRadius: 99,
                    background: isActive ? "#826dd2" : "rgba(255,255,255,0.12)",
                    transition: "all .3s ease",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Card */}
        <div
          key={step}
          style={{
            width: "100%",
            maxWidth: 440,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24,
            padding: "44px 40px 40px",
            backdropFilter: "blur(20px)",
            animation: "fadeUp .35s ease both",
          }}
        >
          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(130,109,210,0.15)",
                  border: "1px solid rgba(130,109,210,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <h1 style={{ ...pp, fontWeight: 600, fontSize: 22, color: "#fff", margin: "0 0 8px" }}>
                Recuperar contraseña
              </h1>
              <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.38)", margin: "0 0 28px", lineHeight: "22px" }}>
                Ingresa tu correo y te enviaremos un código de verificación.
              </p>

              {error && <ErrorBanner message={error} />}

              <form onSubmit={handleSendEmail}>
                <label style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 7, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Correo electrónico
                </label>
                <div style={{ position: "relative", marginBottom: 24 }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", pointerEvents: "none", display: "flex" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    className="auth-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    style={inputStyle}
                  />
                </div>

                <PrimaryButton loading={loading} disabled={!email.trim() || loading}>
                  Enviar código
                </PrimaryButton>
              </form>
            </>
          )}

          {/* ── STEP 2: Code ── */}
          {step === "code" && (
            <>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(130,109,210,0.15)",
                  border: "1px solid rgba(130,109,210,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <h1 style={{ ...pp, fontWeight: 600, fontSize: 22, color: "#fff", margin: "0 0 8px" }}>
                Revisa tu correo
              </h1>
              <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.38)", margin: "0 0 28px", lineHeight: "22px" }}>
                Enviamos un código de 6 dígitos a{" "}
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{email}</span>
              </p>

              {error && <ErrorBanner message={error} />}

              <form onSubmit={handleVerifyCode}>
                {/* Code boxes */}
                <div
                  style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28 }}
                  onPaste={handleCodePaste}
                >
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      id={`code-${i}`}
                      className="code-box"
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      style={{
                        width: 46,
                        height: 54,
                        textAlign: "center",
                        background: "rgba(255,255,255,0.05)",
                        border: `1px solid ${digit ? "rgba(130,109,210,0.5)" : "rgba(255,255,255,0.12)"}`,
                        borderRadius: 12,
                        color: "#fff",
                        fontSize: 22,
                        fontFamily: "var(--font-poppins), sans-serif",
                        fontWeight: 400,
                        caretColor: "#826dd2",
                        transition: "border-color .15s, background .15s",
                      }}
                    />
                  ))}
                </div>

                <PrimaryButton loading={loading} disabled={code.join("").length < 6 || loading}>
                  Verificar código
                </PrimaryButton>

                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => { setError(""); onRecover(email); }}
                    style={{ ...pp, fontSize: 13, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", transition: "color .15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#826dd2")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)")}
                  >
                    ¿No lo recibiste? Reenviar código
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 3: New password ── */}
          {step === "newpass" && (
            <>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(130,109,210,0.15)",
                  border: "1px solid rgba(130,109,210,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h1 style={{ ...pp, fontWeight: 600, fontSize: 22, color: "#fff", margin: "0 0 8px" }}>
                Nueva contraseña
              </h1>
              <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.38)", margin: "0 0 28px", lineHeight: "22px" }}>
                Elige una contraseña segura para tu cuenta.
              </p>

              {error && <ErrorBanner message={error} />}

              <form onSubmit={handleNewPassword}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 7, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Nueva contraseña
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", pointerEvents: "none", display: "flex" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input
                      className="auth-input"
                      type={showPass ? "text" : "password"}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      style={{ ...inputStyle, paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 2, display: "flex" }}
                    >
                      {showPass ? (
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

                <div style={{ marginBottom: 24 }}>
                  <label style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 7, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Confirmar contraseña
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", pointerEvents: "none", display: "flex" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input
                      className="auth-input"
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Repite tu contraseña"
                      autoComplete="new-password"
                      style={{
                        ...inputStyle,
                        borderColor: confirmPass.length > 0 && confirmPass !== newPass
                          ? "rgba(229,57,53,0.5)"
                          : "rgba(255,255,255,0.1)",
                      }}
                    />
                  </div>
                  {confirmPass.length > 0 && confirmPass !== newPass && (
                    <p style={{ ...pp, fontSize: 11, color: "#ef9a9a", margin: "5px 0 0" }}>
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>

                <PrimaryButton loading={loading} disabled={newPass.length < 6 || newPass !== confirmPass || loading}>
                  Guardar contraseña
                </PrimaryButton>
              </form>
            </>
          )}

          {/* ── STEP 4: Done ── */}
          {step === "done" && (
            <div style={{ textAlign: "center", animation: "scaleIn .35s ease both" }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "rgba(38,198,218,0.12)",
                  border: "1px solid rgba(38,198,218,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#26c6da" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 style={{ ...pp, fontWeight: 600, fontSize: 22, color: "#fff", margin: "0 0 10px" }}>
                ¡Listo!
              </h1>
              <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 32px", lineHeight: "22px" }}>
                Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión.
              </p>
              <button
                onClick={onGoLogin}
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
                  transition: "background .15s",
                }}
              >
                Ir a iniciar sesión
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Shared mini-components ─────────────────────────────── */

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "rgba(229,57,53,0.12)",
        border: "1px solid rgba(229,57,53,0.3)",
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 20,
        fontFamily: "var(--font-poppins), sans-serif",
        fontWeight: 300,
        fontSize: 13,
        color: "#ef9a9a",
      }}
    >
      {message}
    </div>
  );
}

function PrimaryButton({
  loading,
  disabled,
  children,
}: {
  loading: boolean;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const pp = { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300 };
  return (
    <button
      type="submit"
      disabled={disabled}
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
      }}
    >
      {loading ? (
        <>
          <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
}