"use client";

interface SidebarProps {
  phase: "onboard" | "chat";
  docsOpen: boolean;
  docsFullscreen: boolean;
  hasMessages: boolean;
  onChatClick: () => void;
  onDocsClick: () => void;
}

export default function Sidebar({
  phase,
  docsOpen,
  docsFullscreen,
  hasMessages,
  onChatClick,
  onDocsClick,
}: SidebarProps) {
  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: 64,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 24,
        paddingBottom: 24,
        gap: 10,
        zIndex: 50,
      }}
    >
      <button
        aria-label="Inicio"
        style={{
          color: "#826dd2",
          padding: 8,
          borderRadius: 12,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8" />
          <path d="M3 12c0-1.333.536-2.583 1.5-3.5" />
        </svg>
      </button>

      <div
        style={{
          width: 32,
          height: 1,
          background: "rgba(255,255,255,0.07)",
        }}
      />

      <button
        aria-label="Chat"
        onClick={onChatClick}
        style={{
          color:
            phase === "chat" && !docsOpen
              ? "#826dd2"
              : "rgba(255,255,255,0.4)",
          padding: 8,
          borderRadius: 12,
          background:
            phase === "chat" && !docsOpen
              ? "rgba(130,109,210,0.12)"
              : "transparent",
          border: "none",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 20l1.3-3.9c-2.324-3.437-1.426-7.872 2.1-10.374C9.928 3.227 14.842 3.586 17.967 6.699 21.09 9.812 21.429 14.787 18.754 18.3 16.08 21.813 11.19 22.93 7.4 21L3 20" />
        </svg>
        {hasMessages && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#826dd2",
            }}
          />
        )}
      </button>

      <button
        aria-label="Documentos"
        onClick={onDocsClick}
        style={{
          color: docsOpen ? "#826dd2" : "rgba(255,255,255,0.4)",
          padding: 8,
          borderRadius: 12,
          background: docsOpen ? "rgba(130,109,210,0.12)" : "transparent",
          border: "none",
          cursor: phase === "chat" ? "pointer" : "default",
          opacity: phase === "onboard" ? 0.35 : 1,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 3v4a1 1 0 001 1h4" />
          <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      </button>
    </aside>
  );
}