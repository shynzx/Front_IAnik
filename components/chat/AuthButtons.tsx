"use client";

import { pp } from "./tokens";

interface AuthButtonsProps {
  onGoLogin: () => void;
  onGoRegister: () => void;
  userName?: string | null;
  onLogout?: () => void;
}

/**
 * Renders just the two auth buttons with no self-positioning.
 * Placement is controlled by the parent (ChatScreen / OnboardingScreen).
 */
export default function AuthButtons({ onGoLogin, onGoRegister, userName, onLogout = () => {} }: AuthButtonsProps) {
  return (
    <>
      <button
        onClick={userName ? undefined : onGoLogin}
        style={{
          ...pp,
          padding: "8px 18px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.18)",
          color: "rgba(255,255,255,0.75)",
          background: "transparent",
          fontSize: 13,
          cursor: userName ? "default" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {userName || "Iniciar sesión"}
      </button>
      <button
        onClick={userName ? onLogout : onGoRegister}
        style={{
          ...pp,
          fontWeight: 400,
          padding: "8px 18px",
          borderRadius: 10,
          background: userName ? "rgba(239, 68, 68, 0.15)" : "#826dd2",
          color: userName ? "#fca5a5" : "#fff",
          border: userName ? "1px solid rgba(239, 68, 68, 0.3)" : "none",
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {userName ? "Cerrar sesión" : "Regístrate"}
      </button>
    </>
  );
}