"use client";

import { pp } from "./tokens";

interface AuthButtonsProps {
  onGoLogin: () => void;
  onGoRegister: () => void;
<<<<<<< HEAD
=======
  userName?: string | null;
  onLogout?: () => void;
>>>>>>> main
}

/**
 * Renders just the two auth buttons with no self-positioning.
 * Placement is controlled by the parent (ChatScreen / OnboardingScreen).
 */
<<<<<<< HEAD
export default function AuthButtons({ onGoLogin, onGoRegister }: AuthButtonsProps) {
  return (
    <>
      <button
        onClick={onGoLogin}
=======
export default function AuthButtons({ onGoLogin, onGoRegister, userName, onLogout = () => {} }: AuthButtonsProps) {
  return (
    <>
      <button
        onClick={userName ? undefined : onGoLogin}
>>>>>>> main
        style={{
          ...pp,
          padding: "8px 18px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.18)",
          color: "rgba(255,255,255,0.75)",
          background: "transparent",
          fontSize: 13,
<<<<<<< HEAD
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Iniciar sesión
      </button>
      <button
        onClick={onGoRegister}
=======
          cursor: userName ? "default" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {userName || "Iniciar sesión"}
      </button>
      <button
        onClick={userName ? onLogout : onGoRegister}
>>>>>>> main
        style={{
          ...pp,
          fontWeight: 400,
          padding: "8px 18px",
          borderRadius: 10,
<<<<<<< HEAD
          background: "#826dd2",
          color: "#fff",
          border: "none",
=======
          background: userName ? "rgba(239, 68, 68, 0.15)" : "#826dd2",
          color: userName ? "#fca5a5" : "#fff",
          border: userName ? "1px solid rgba(239, 68, 68, 0.3)" : "none",
>>>>>>> main
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
<<<<<<< HEAD
        Regístrate
=======
        {userName ? "Cerrar sesión" : "Regístrate"}
>>>>>>> main
      </button>
    </>
  );
}