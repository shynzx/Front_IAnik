"use client";

import AuthButtons from "@/components/layout/AuthButtons";

interface HeaderProps {
  onGoLogin: () => void;
  onGoRegister: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
  userName?: string | null;
}

export default function Header({ onGoLogin, onGoRegister, onLogout, onProfileClick, userName }: HeaderProps) {
  return (
    <header className="fixed top-0 left-[76px] right-0 h-[72px] bg-[#09080f]/65 backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-between px-7 z-50 max-md:left-0 max-md:px-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#a99cff] to-[#6d55dc] flex items-center justify-center shadow-[0_8px_24px_rgba(130,109,210,.35)] text-white font-semibold">I</div>
        <div className="max-sm:hidden"><p className="m-0 text-sm font-semibold tracking-tight text-white">IAnik</p><p className="m-0 text-[11px] leading-4 text-white/35">Tu espacio de aprendizaje</p></div>
      </div>
      <AuthButtons onGoLogin={onGoLogin} onGoRegister={onGoRegister} onLogout={onLogout} userName={userName} onProfileClick={onProfileClick} />
    </header>
  );
}
