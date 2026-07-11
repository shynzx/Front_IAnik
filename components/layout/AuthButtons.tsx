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
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        aria-label={userName ? undefined : "Iniciar sesión"}
        onClick={userName ? onProfileClick : onGoLogin}
        className="px-3.5 sm:px-4 py-2 rounded-xl border border-white/[0.12] text-white/75 bg-white/[0.035] text-xs sm:text-sm cursor-pointer whitespace-nowrap hover:bg-white/[0.09] hover:text-white transition-all"
      >
        {userName || "Iniciar sesión"}
      </button>
      <button
        aria-label={userName ? "Cerrar sesión" : "Registrarse"}
        onClick={userName ? onLogout : onGoRegister}
        className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${
          userName
            ? "bg-[rgba(239,68,68,0.15)] text-[#fca5a5] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.25)]"
            : "bg-gradient-to-r from-[#8b7cf6] to-[#7059d5] text-white border border-white/10 shadow-[0_8px_24px_rgba(130,109,210,.25)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(130,109,210,.4)]"
        }`}
      >
        {userName ? "Cerrar sesión" : "Regístrate"}
      </button>
    </div>
  );
}
