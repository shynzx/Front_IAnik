"use client";

interface AuthButtonsProps {
  onGoLogin: () => void;
  onGoRegister: () => void;
  userName?: string | null;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

export default function AuthButtons({ onGoLogin, onGoRegister, userName, onLogout = () => {}, onProfileClick }: AuthButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        aria-label={userName ? undefined : "Iniciar sesión"}
        onClick={userName ? onProfileClick : onGoLogin}
        className="px-4 py-2.5 rounded-2.5 border border-white/[0.18] text-white/75 bg-transparent text-sm cursor-pointer whitespace-nowrap hover:bg-white/[0.05] transition-colors"
      >
        {userName || "Iniciar sesión"}
      </button>
      <button
        aria-label={userName ? "Cerrar sesión" : "Registrarse"}
        onClick={userName ? onLogout : onGoRegister}
        className={`px-4 py-2.5 rounded-2.5 text-sm cursor-pointer whitespace-nowrap transition-colors ${
          userName
            ? "bg-[rgba(239,68,68,0.15)] text-[#fca5a5] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.25)]"
            : "bg-[#826dd2] text-white border-none hover:bg-[#7059be]"
        }`}
      >
        {userName ? "Cerrar sesión" : "Regístrate"}
      </button>
    </div>
  );
}
