"use client";

import { pp } from "./tokens";

interface AuthButtonsProps {
  onGoLogin: () => void;
  onGoRegister: () => void;
}

/**
 * Renders just the two auth buttons with no self-positioning.
 * Placement is controlled by the parent (ChatScreen / OnboardingScreen).
 */
export default function AuthButtons({ onGoLogin, onGoRegister }: AuthButtonsProps) {
  return (
    <>
      <button
        onClick={onGoLogin}
        style={{
          ...pp,
          padding: "8px 18px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.18)",
          color: "rgba(255,255,255,0.75)",
          background: "transparent",
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Iniciar sesión
      </button>
      <button
        onClick={onGoRegister}
        style={{
          ...pp,
          fontWeight: 400,
          padding: "8px 18px",
          borderRadius: 10,
          background: "#826dd2",
          color: "#fff",
          border: "none",
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Regístrate
      </button>
    </>
  );
}