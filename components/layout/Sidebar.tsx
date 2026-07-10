"use client";

interface SidebarProps {
  phase: "onboard" | "chat" | "study" | "summaries" | "study-rooms" | "study-room";
  hasMessages: boolean;
  onChatClick: () => void;
  onStudyClick: () => void;
  onSummariesClick: () => void;
  onStudyRoomsClick: () => void;
}

export default function Sidebar({
  phase,
  hasMessages,
  onChatClick,
  onStudyClick,
  onSummariesClick,
  onStudyRoomsClick,
}: SidebarProps) {
  const chatActive = phase === "chat";
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-[rgba(0,0,0,0.3)] backdrop-blur-md border-r border-[rgba(255,255,255,0.06)] flex-col items-center pt-6 pb-6 gap-2.5 z-50 max-md:hidden max-md:w-0 max-md:border-none hidden md:flex">
      <button
        aria-label="Inicio"
        className="text-[#826dd2] p-2 rounded-xl bg-transparent border-none cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>

      <div className="w-8 h-px bg-[rgba(255,255,255,0.07)]" />

      <button
        aria-label="Chat"
        onClick={onChatClick}
        className={`p-2 rounded-xl border-none cursor-pointer relative ${
          chatActive
            ? "text-[#826dd2] bg-[rgba(130,109,210,0.12)]"
            : "text-[rgba(255,255,255,0.4)] bg-transparent"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 20l1.3-3.9c-2.324-3.437-1.426-7.872 2.1-10.374C9.928 3.227 14.842 3.586 17.967 6.699 21.09 9.812 21.429 14.787 18.754 18.3 16.08 21.813 11.19 22.93 7.4 21L3 20" />
        </svg>
        {hasMessages && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#826dd2]" />
        )}
      </button>

      <button
        aria-label="Progreso"
        onClick={onStudyClick}
        className={`p-2 rounded-xl border-none cursor-pointer ${
          phase === "study"
            ? "text-[#826dd2] bg-[rgba(130,109,210,0.12)]"
            : "text-[rgba(255,255,255,0.4)] bg-transparent"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
      </button>

      <button
        aria-label="Resúmenes"
        onClick={onSummariesClick}
        className={`p-2 rounded-xl border-none cursor-pointer ${
          phase === "summaries"
            ? "text-[#826dd2] bg-[rgba(130,109,210,0.12)]"
            : "text-[rgba(255,255,255,0.4)] bg-transparent"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14l2 2 4-4" />
        </svg>
      </button>

      <button
        aria-label="Salas de Estudio"
        onClick={onStudyRoomsClick}
        className={`p-2 rounded-xl border-none cursor-pointer ${
          phase === "study-rooms" || phase === "study-room"
            ? "text-[#826dd2] bg-[rgba(130,109,210,0.12)]"
            : "text-[rgba(255,255,255,0.4)] bg-transparent"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </button>

      <div className="w-8 h-px bg-[rgba(255,255,255,0.07)]" />

    </aside>
  );
}
