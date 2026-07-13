"use client";

import AuthButtons from "@/components/layout/AuthButtons";

interface HeaderProps {
  onGoLogin: () => void;
  onGoRegister: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
  userName?: string | null;
  sidebarExpanded?: boolean;
}

export default function Header({ onGoLogin, onGoRegister, onLogout, onProfileClick, userName, sidebarExpanded = false }: HeaderProps) {
  return (
    <header className={`fixed top-0 ${sidebarExpanded ? "left-[200px]" : "left-16"} right-0 h-[72px] bg-[#09080f]/65 backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-end px-7 z-50 max-md:left-0 max-md:px-4 transition-[left] duration-300 ease-out`}>
      <AuthButtons onGoLogin={onGoLogin} onGoRegister={onGoRegister} onLogout={onLogout} userName={userName} onProfileClick={onProfileClick} />
    </header>
  );
}
