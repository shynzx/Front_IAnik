"use client";

import { useState, FormEvent } from "react";


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

  /* -- Step 1: Send email -- */
  const handleSendEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setError("");
    setLoading(true);
    try {
      await onRecover(email);
      setStep("code");
    } catch {
      setError("No encontramos esa direccion. Verifica e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /* -- Step 2: Verify code -- */
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
      setError("Codigo incorrecto o expirado. Intentelo de nuevo.");
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

  /* -- Step 3: New password -- */
  const handleNewPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPass.length < 8 || newPass !== confirmPass || loading) return;
    setError("");
    setLoading(true);
    try {
      await onNewPassword(newPass);
      setStep("done");
    } catch {
      setError("No se pudo actualizar la contrasena. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-background min-h-screen flex relative">

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-20 min-h-screen">
        {step !== "done" && (
          <button
            onClick={step === "email" ? onGoLogin : () => { setStep("email"); setError(""); }}
            className="absolute top-7 left-5 text-[0.8125rem] text-[rgba(255,255,255,0.35)] bg-none border-none cursor-pointer flex items-center gap-1.5 hover:text-[#826dd2]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {step === "email" ? "Iniciar sesion" : "Volver"}
          </button>
        )}

        {step !== "done" && (
          <div className="flex gap-2 mb-7">
            {(["email", "code", "newpass"] as Step[]).map((s) => {
              const steps: Step[] = ["email", "code", "newpass"];
              const current = steps.indexOf(step);
              const isActive = steps.indexOf(s) <= current;
              return (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${isActive ? "w-6 bg-[#826dd2]" : "w-2 bg-[rgba(255,255,255,0.12)]"}`}
                />
              );
            })}
          </div>
        )}

        <div
          key={step}
          className="glass-panel w-full max-w-[28rem] rounded-[28px] px-6 sm:px-10 pt-9 sm:pt-11 pb-9 animate-[fadeUp_.35s_ease_both]"
        >
          {step === "email" && (
            <>
              <div className="w-[52px] h-[52px] rounded-[14px] bg-[rgba(130,109,210,0.15)] border border-[rgba(130,109,210,0.3)] flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <h1 className="font-semibold text-[22px] text-white m-0 mb-2">Recuperar contrasena</h1>
              <p className="text-sm text-[rgba(255,255,255,0.38)] m-0 mb-7 leading-[22px]">
                Ingresa tu correo y te enviaremos un codigo de verificacion.
              </p>
              {error && <ErrorBanner message={error} />}
              <form onSubmit={handleSendEmail}>
                <label className="text-xs text-[rgba(255,255,255,0.45)] block mb-[7px] tracking-[0.5px] uppercase">Correo electronico</label>
                <div className="relative mb-6">
                  <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.25)] pointer-events-none flex">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com" autoComplete="email"
                    className="w-full box-border bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[11px] px-[14px] py-[11px] pl-10 text-white text-sm outline-none caret-[#826dd2] focus:border-[rgba(130,109,210,0.6)] focus:bg-[rgba(130,109,210,0.07)]"
                  />
                </div>
                <PrimaryButton loading={loading} disabled={!email.trim() || loading}>Enviar codigo</PrimaryButton>
              </form>
            </>
          )}

          {step === "code" && (
            <>
              <div className="w-[52px] h-[52px] rounded-[14px] bg-[rgba(130,109,210,0.15)] border border-[rgba(130,109,210,0.3)] flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <h1 className="font-semibold text-[22px] text-white m-0 mb-2">Revisa tu correo</h1>
              <p className="text-sm text-[rgba(255,255,255,0.38)] m-0 mb-7 leading-[22px]">
                Enviamos un codigo de 6 digitos a <span className="text-[rgba(255,255,255,0.7)]">{email}</span>
              </p>
              {error && <ErrorBanner message={error} />}
              <form onSubmit={handleVerifyCode}>
                <div className="flex gap-2.5 justify-center mb-7" onPaste={handleCodePaste}>
                  {code.map((digit, i) => (
                    <input
                      key={i} id={`code-${i}`} type="text" inputMode="numeric" maxLength={1}
                      value={digit} onChange={(e) => handleCodeInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className={`w-[2.875rem] h-[3.375rem] text-center bg-[rgba(255,255,255,0.05)] rounded-xl text-white text-[1.375rem] caret-[#826dd2] focus:border-[rgba(130,109,210,0.7)] focus:bg-[rgba(130,109,210,0.1)] focus:outline-none border border-solid ${digit ? "border-[rgba(130,109,210,0.5)]" : "border-[rgba(255,255,255,0.12)]"}`}
                    />
                  ))}
                </div>
                <PrimaryButton loading={loading} disabled={code.join("").length < 6 || loading}>Verificar codigo</PrimaryButton>
                <div className="text-center mt-5">
                  <button type="button" onClick={() => { setError(""); onRecover(email); }}
                    className="text-[13px] text-[rgba(255,255,255,0.35)] bg-none border-none cursor-pointer hover:text-[#826dd2]"
                  >No lo recibiste? Reenviar codigo</button>
                </div>
              </form>
            </>
          )}

          {step === "newpass" && (
            <>
              <div className="w-[52px] h-[52px] rounded-[14px] bg-[rgba(130,109,210,0.15)] border border-[rgba(130,109,210,0.3)] flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h1 className="font-semibold text-[22px] text-white m-0 mb-2">Nueva contrasena</h1>
              <p className="text-sm text-[rgba(255,255,255,0.38)] m-0 mb-7 leading-[22px]">Elige una contrasena segura para tu cuenta.</p>
              {error && <ErrorBanner message={error} />}
              <form onSubmit={handleNewPassword}>
                <div className="mb-4">
                  <label className="text-xs text-[rgba(255,255,255,0.45)] block mb-[7px] tracking-[0.5px] uppercase">Nueva contrasena</label>
                  <div className="relative">
                    <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.25)] pointer-events-none flex">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input type={showPass ? "text" : "password"} value={newPass} onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Minimo 8 caracteres" autoComplete="new-password"
                      className="w-full box-border bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[11px] px-[14px] py-[11px] pl-10 pr-[2.75rem] text-white text-sm outline-none caret-[#826dd2] focus:border-[rgba(130,109,210,0.6)] focus:bg-[rgba(130,109,210,0.07)]"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[rgba(255,255,255,0.3)] p-0.5 flex"
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
                <div className="mb-6">
                  <label className="text-xs text-[rgba(255,255,255,0.45)] block mb-[7px] tracking-[0.5px] uppercase">Confirmar contrasena</label>
                  <div className="relative">
                    <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.25)] pointer-events-none flex">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Repite tu contrasena" autoComplete="new-password"
                      className={`w-full box-border bg-[rgba(255,255,255,0.05)] rounded-[0.6875rem] px-[0.875rem] py-[0.6875rem] pl-10 text-white text-sm outline-none caret-[#826dd2] focus:border-[rgba(130,109,210,0.6)] focus:bg-[rgba(130,109,210,0.07)] border border-solid ${confirmPass.length > 0 && confirmPass !== newPass ? "border-[rgba(229,57,53,0.5)]" : "border-[rgba(255,255,255,0.1)"}`}
                    />
                  </div>
                  {confirmPass.length > 0 && confirmPass !== newPass && (
                    <p className="text-[0.6875rem] text-[#ef9a9a] mt-[0.3125rem] mb-0">Las contrasenas no coinciden</p>
                  )}
                </div>
                <PrimaryButton loading={loading} disabled={newPass.length < 8 || newPass !== confirmPass || loading}>Guardar contrasena</PrimaryButton>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center animate-[scaleIn_.35s_ease_both]">
              <div className="w-[4.25rem] h-[4.25rem] rounded-full bg-[rgba(38,198,218,0.12)] border border-[rgba(38,198,218,0.3)] flex items-center justify-center mx-auto mb-6">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#26c6da" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 className="font-semibold text-[22px] text-white m-0 mb-2.5">Listo!</h1>
              <p className="text-sm text-[rgba(255,255,255,0.45)] m-0 mb-8 leading-[22px]">
                Tu contrasena fue actualizada correctamente. Ya puedes iniciar sesion.
              </p>
              <button
                onClick={onGoLogin}
                className="w-full py-3 rounded-xl bg-[#826dd2] text-white border-none text-[15px] cursor-pointer font-[400] enabled:hover:bg-[#9b85e0]"
              >
                Ir a iniciar sesion
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-[rgba(229,57,53,0.12)] border border-[rgba(229,57,53,0.3)] rounded-[0.625rem] px-[0.875rem] py-2.5 mb-5 text-[0.8125rem] text-[#ef9a9a]">
      {message}
    </div>
  );
}

function PrimaryButton({ loading, disabled, children }: { loading: boolean; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-3 rounded-xl bg-[#826dd2] text-white border-none text-[15px] cursor-pointer flex items-center justify-center gap-2 font-[400] enabled:hover:bg-[#9b85e0] disabled:opacity-45 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full inline-block animate-[spin_.7s_linear_infinite]" />
          Cargando...
        </>
      ) : children}
    </button>
  );
}
