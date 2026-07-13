"use client";

import { useState } from "react";

interface SidebarProps {
  phase: "onboard" | "chat" | "study" | "summaries" | "study-rooms" | "study-room";
  hasMessages: boolean;
  onChatClick: () => void;
  onStudyClick: () => void;
  onSummariesClick: () => void;
  onStudyRoomsClick: () => void;
  expanded?: boolean;
  onToggle?: () => void;
  userName?: string | null;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({
  phase,
  hasMessages,
  onChatClick,
  onStudyClick,
  onSummariesClick,
  onStudyRoomsClick,
  expanded: controlledExpanded,
  onToggle,
  userName,
  onProfileClick,
  onLogout,
}: SidebarProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;
  const handleToggle = onToggle ?? (() => setInternalExpanded((value) => !value));
  const chatActive = phase === "chat";
  const userInitials = userName
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "U";
  const itemClass = (active: boolean) => `h-12 rounded-xl border-0 cursor-pointer relative transition-[width,background-color,color] duration-300 flex items-center ${expanded ? "w-full px-2 gap-3 justify-start" : "w-12 justify-center"} [&_svg]:w-[22px] [&_svg]:h-[22px] [&_svg]:shrink-0 ${
    active
      ? "text-[#826dd2] bg-[#826dd2]/12"
      : "text-white/40 bg-transparent hover:text-white/80 hover:bg-white/[0.05]"
  }`;

  return (
    <aside className={`fixed left-0 top-0 h-screen ${expanded ? "w-[200px] px-4 items-start" : "w-16 px-2 items-center"} bg-black/30 backdrop-blur-xl border-r border-white/[0.06] flex flex-col pt-6 pb-4 gap-1 z-[60] overflow-visible transition-[width,padding] duration-300 ease-out max-md:top-auto max-md:bottom-0 max-md:w-full max-md:h-[72px] max-md:flex-row max-md:items-center max-md:justify-around max-md:px-3 max-md:py-2 max-md:border-r-0 max-md:border-t max-md:border-white/[0.1]`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={expanded ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
        aria-expanded={expanded}
        title={expanded ? "Cerrar menú" : "Abrir menú"}
        className={`h-12 ${expanded ? "w-full justify-start px-2 gap-3" : "w-12 justify-center"} mb-2 rounded-xl border-0 bg-transparent text-[#826dd2] flex items-center cursor-pointer transition-[width,background-color] duration-300 hover:bg-white/[0.05] max-md:hidden`}
      >
        <svg className="h-8 w-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8" />
          <path d="M3 12c0-1.333.536-2.583 1.5-3.5" />
        </svg>
        <span className={`${expanded ? "block" : "hidden"} text-base font-semibold text-white whitespace-nowrap`}>IAnik</span>
      </button>

      <div className={`${expanded ? "w-full" : "w-8"} h-px bg-white/[0.07] mb-2 shrink-0 transition-[width] duration-300 max-md:hidden`} />

      <button
        aria-label="Chat"
        onClick={onChatClick}
        title="Cuadernos"
        className={itemClass(chatActive)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 20l1.3-3.9c-2.324-3.437-1.426-7.872 2.1-10.374C9.928 3.227 14.842 3.586 17.967 6.699 21.09 9.812 21.429 14.787 18.754 18.3 16.08 21.813 11.19 22.93 7.4 21L3 20" />
        </svg>
        <span className={`${expanded ? "block" : "hidden"} text-sm font-medium whitespace-nowrap max-md:hidden`}>Cuadernos</span>
        {hasMessages && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#826dd2]" />
        )}
      </button>

      <button
        aria-label="Progreso"
        onClick={onStudyClick}
        title="Progreso"
        className={itemClass(phase === "study")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
        <span className={`${expanded ? "block" : "hidden"} text-sm font-medium whitespace-nowrap max-md:hidden`}>Progreso</span>
      </button>

      <button
        aria-label="Resúmenes"
        onClick={onSummariesClick}
        title="Resúmenes"
        className={itemClass(phase === "summaries")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14l2 2 4-4" />
        </svg>
        <span className={`${expanded ? "block" : "hidden"} text-sm font-medium whitespace-nowrap max-md:hidden`}>Resúmenes</span>
      </button>

      <button
        aria-label="Salas de Estudio"
        onClick={onStudyRoomsClick}
        title="Salas de estudio"
        className={itemClass(phase === "study-rooms" || phase === "study-room")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className={`${expanded ? "block" : "hidden"} text-sm font-medium whitespace-nowrap max-md:hidden`}>Salas de estudio</span>
      </button>

      <div className="flex-1 max-md:hidden" />
      <div className={`${expanded ? "w-full" : "w-8"} h-px bg-white/[0.07] shrink-0 transition-[width] duration-300 max-md:hidden`} />

      {userName && (
        <div className="relative w-full max-md:w-auto">
          {profileMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Cerrar menú de perfil"
                className="fixed inset-0 z-[70] cursor-default bg-transparent"
                onClick={() => setProfileMenuOpen(false)}
              />
              <div className={`absolute z-[80] w-[220px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#100d1b]/98 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,.65)] backdrop-blur-xl ${expanded ? "bottom-[calc(100%+10px)] left-0" : "bottom-0 left-[calc(100%+14px)]"} max-md:bottom-[calc(100%+14px)] max-md:left-auto max-md:right-0`}>
                <div className="border-b border-white/[0.07] px-3 py-2.5">
                  <p className="m-0 truncate text-sm font-medium text-white">{userName}</p>
                  <p className="m-0 mt-0.5 text-[11px] text-white/40">Cuenta de IAnik</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setProfileMenuOpen(false); onProfileClick?.(); }}
                  className="mt-1 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-sm text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white"
                >
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                  Ver perfil
                </button>
                <button
                  type="button"
                  onClick={() => { setProfileMenuOpen(false); onLogout?.(); }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-sm text-red-300 transition-colors hover:bg-red-400/10"
                >
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="m16 17 5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setProfileMenuOpen((value) => !value)}
            aria-label="Abrir menú de perfil"
            aria-expanded={profileMenuOpen}
            title={userName}
            className={`mt-2 flex h-12 cursor-pointer items-center rounded-xl border-0 bg-transparent transition-colors hover:bg-white/[0.06] ${expanded ? "w-full justify-start gap-3 px-2" : "w-12 justify-center"} max-md:mt-0 max-md:w-12 max-md:justify-center max-md:px-0`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6f54c7] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(111,84,199,.28)]">
              {userInitials}
            </span>
            <span className={`${expanded ? "block" : "hidden"} min-w-0 truncate text-sm font-medium text-white max-md:hidden`}>{userName}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
