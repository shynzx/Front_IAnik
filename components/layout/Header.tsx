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
    <header className="fixed top-0 left-16 right-0 h-18 bg-[rgba(0,0,0,0.3)] backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] flex items-center justify-end px-6 z-50 max-md:left-0">
      <AuthButtons onGoLogin={onGoLogin} onGoRegister={onGoRegister} onLogout={onLogout} userName={userName} onProfileClick={onProfileClick} />
    </header>
  );
}
