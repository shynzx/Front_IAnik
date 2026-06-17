"use client";

<<<<<<< HEAD
import { useState } from "react";
import { pp } from "./tokens";
import { AuthUser } from "../Chat";

=======
>>>>>>> main
interface SidebarProps {
  phase: "onboard" | "chat";
  docsOpen: boolean;
  docsFullscreen: boolean;
  hasMessages: boolean;
<<<<<<< HEAD
  activePage?: "chat" | "docs" | "summaries" | "dashboard";
  onChatClick: () => void;
  onDocsClick: () => void;
  onSummariesClick?: () => void;
  onDashboardClick?: () => void;
  expanded: boolean;
  onLogoClick: () => void;
  // Auth
  user?: AuthUser | null;
  onLogout?: () => void;
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
=======
  onChatClick: () => void;
  onDocsClick: () => void;
>>>>>>> main
}

export default function Sidebar({
  phase,
  docsOpen,
<<<<<<< HEAD
  hasMessages,
  activePage = "chat",
  onChatClick,
  onDocsClick,
  onSummariesClick,
  onDashboardClick,
  expanded,
  onLogoClick,
  user,
  onLogout,
}: SidebarProps) {

  const [profileOpen, setProfileOpen] = useState(false);

  const navBtn = (active: boolean, disabled = false): React.CSSProperties => ({
    color: active ? "#826dd2" : "rgba(255,255,255,0.4)",
    padding: 8,
    borderRadius: 12,
    background: active ? "rgba(130,109,210,0.12)" : "transparent",
    border: "none",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.35 : 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: expanded ? "100%" : 48,
    justifyContent: expanded ? "flex-start" : "center",
    transition: "width 0.3s ease, background 0.15s ease, color 0.15s ease",
    position: "relative" as const,
    boxSizing: "border-box" as const,
  });

  const label = (text: string): React.CSSProperties => ({
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: "nowrap",
    opacity: expanded ? 1 : 0,
    transition: "opacity 0.3s ease",
    display: expanded ? "block" : "none",
    fontFamily: "var(--font-poppins), sans-serif",
  });

=======
  docsFullscreen,
  hasMessages,
  onChatClick,
  onDocsClick,
}: SidebarProps) {
>>>>>>> main
  return (
    <aside
      style={{
        position: "fixed",
<<<<<<< HEAD
        left: 0, top: 0,
        height: "100vh",
        width: expanded ? 200 : 64,
=======
        left: 0,
        top: 0,
        height: "100vh",
        width: 64,
>>>>>>> main
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
<<<<<<< HEAD
        alignItems: expanded ? "flex-start" : "center",
        paddingTop: 24,
        paddingBottom: 16,
        paddingLeft: expanded ? 16 : 0,
        paddingRight: expanded ? 16 : 0,
        gap: 4,
        zIndex: 50,
        overflow: "visible", 
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxSizing: "border-box",
      }}
    >
      {/* ── Logo ── */}
      <button
        onClick={onLogoClick}
        style={{
          color: "#826dd2", padding: 8, borderRadius: 12,
          background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 12,
          width: expanded ? "100%" : 48,
          justifyContent: expanded ? "flex-start" : "center",
          transition: "width 0.3s ease", marginBottom: 8,
          boxSizing: "border-box",
        }}
      >
        <svg style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
=======
        alignItems: "center",
        paddingTop: 24,
        paddingBottom: 24,
        gap: 10,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <button
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
>>>>>>> main
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8" />
          <path d="M3 12c0-1.333.536-2.583 1.5-3.5" />
        </svg>
<<<<<<< HEAD
        <span style={{ fontWeight: 600, fontSize: 16, color: "#fff", whiteSpace: "nowrap", opacity: expanded ? 1 : 0, transition: "opacity 0.3s ease", display: expanded ? "block" : "none", fontFamily: "var(--font-poppins), sans-serif" }}>
          PromptGPA
        </span>
      </button>

      {/* ── Divider ── */}
      <div style={{ width: expanded ? "100%" : 32, height: 1, background: "rgba(255,255,255,0.07)", transition: "width 0.3s ease", marginBottom: 8, flexShrink: 0 }} />

      {/* ── Chat ── */}
      <button onClick={onChatClick} style={navBtn(activePage === "chat" && !docsOpen)}
        onMouseEnter={e => { if (activePage !== "chat" || docsOpen) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={e => { if (activePage !== "chat" || docsOpen) e.currentTarget.style.background = "transparent"; }}>
        <svg style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 20l1.3-3.9c-2.324-3.437-1.426-7.872 2.1-10.374C9.928 3.227 14.842 3.586 17.967 6.699 21.09 9.812 21.429 14.787 18.754 18.3 16.08 21.813 11.19 22.93 7.4 21L3 20" />
        </svg>
        <span style={label("Chat")}>Chat</span>
        {hasMessages && (
          <span style={{ position: "absolute", top: 8, right: expanded ? 8 : 6, width: 7, height: 7, borderRadius: "50%", background: "#826dd2", flexShrink: 0 }} />
        )}
      </button>

      {/* ── Documentos ── */}
      <button onClick={onDocsClick} style={navBtn(activePage === "chat" && docsOpen, phase === "onboard")}
        onMouseEnter={e => { if (phase !== "onboard") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={e => { if (!(activePage === "chat" && docsOpen)) e.currentTarget.style.background = "transparent"; }}>
        <svg style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
=======
      </button>

      <div
        style={{
          width: 32,
          height: 1,
          background: "rgba(255,255,255,0.07)",
        }}
      />

      {/* Chat */}
      <button
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

      {/* Docs */}
      <button
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
>>>>>>> main
          <path d="M14 3v4a1 1 0 001 1h4" />
          <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
<<<<<<< HEAD
        <span style={label("Documentos")}>Documentos</span>
      </button>

      {/* ── Resúmenes ── */}
      <button onClick={onSummariesClick} style={navBtn(activePage === "summaries", phase === "onboard")} title="Resúmenes"
        onMouseEnter={e => { if (phase !== "onboard") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={e => { if (activePage !== "summaries") e.currentTarget.style.background = "transparent"; }}>
        <svg style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20" />
          <path d="M8 7h6" /><path d="M8 11h8" />
        </svg>
        <span style={label("Resúmenes")}>Resúmenes</span>
      </button>

      {/* ── Dashboard ── */}
      <button onClick={onDashboardClick} style={navBtn(activePage === "dashboard", phase === "onboard")} title="Dashboard"
        onMouseEnter={e => { if (phase !== "onboard") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={e => { if (activePage !== "dashboard") e.currentTarget.style.background = "transparent"; }}>
        <svg style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span style={label("Dashboard")}>Dashboard</span>
      </button>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Divider antes del perfil ── */}
      <div style={{ width: expanded ? "100%" : 32, height: 1, background: "rgba(255,255,255,0.07)", transition: "width 0.3s ease", marginBottom: 8, flexShrink: 0 }} />

      {/* ── User profile / Login hint ── */}
      {user ? (
        <div style={{ width: "100%", position: "relative" }}>
          {/* Profile popup */}
          {profileOpen && (
            <>
              <div onClick={() => setProfileOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
              <div style={{
                position: "absolute",
                bottom: expanded ? "calc(100% + 10px)" : 0,
                left: expanded ? 0 : "calc(100% + 14px)",
                transform: "none",
                width: 230,
                background: "rgba(10,6,24,0.98)",
                border: "1px solid rgba(130,109,210,0.25)",
                borderRadius: 16,
                boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
                zIndex: 100, 
                overflow: "hidden",
                animation: "userPopIn .18s ease",
              }}>
                <style>{`@keyframes userPopIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

                {/* Header */}
                <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Se reemplaza el gradiente por el color sólido #826dd2 */}
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#826dd2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <span style={{ ...pp, fontSize: 16, fontWeight: 600, color: "#fff" }}>{initials(user.name)}</span>
                  </div>
                  <p style={{ ...pp, fontWeight: 500, fontSize: 14, color: "#fff", margin: 0, wordBreak: "break-word" }}>{user.name}</p>
                  <p style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.4)", margin: "3px 0 0", wordBreak: "break-all" }}>{user.email}</p>
                </div>

                {/* Logout button */}
                <button
                  onClick={() => { setProfileOpen(false); onLogout?.(); }}
                  style={{ ...pp, width: "100%", padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#f87171", fontSize: 13, textAlign: "left", transition: "background .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </>
          )}

          {/* Sidebar user button */}
          <button
            onClick={() => setProfileOpen(p => !p)}
            title={user.name}
            style={{
              width: "100%",
              padding: expanded ? "8px 10px" : "8px 0",
              display: "flex", alignItems: "center", gap: 10,
              background: profileOpen ? "rgba(130,109,210,0.12)" : "transparent",
              border: "none", cursor: "pointer", borderRadius: 12,
              transition: "background .15s",
              justifyContent: expanded ? "flex-start" : "center",
              boxSizing: "border-box",
            }}
            onMouseEnter={e => { if (!profileOpen) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = "transparent"; }}
          >
            {/* Se reemplaza el gradiente por el color sólido #826dd2 */}
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#826dd2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: profileOpen ? "2px solid rgba(130,109,210,0.7)" : "2px solid transparent", transition: "border .15s" }}>
              <span style={{ ...pp, fontSize: 12, fontWeight: 600, color: "#fff" }}>{initials(user.name)}</span>
            </div>
            {expanded && (
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <p style={{ ...pp, fontSize: 12.5, fontWeight: 500, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                <p style={{ ...pp, fontSize: 10.5, color: "rgba(255,255,255,0.4)", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
              </div>
            )}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", width: "100%", opacity: 0.25 }} title="Inicia sesión para guardar tu progreso">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"/>
          </svg>
        </div>
      )}
=======
      </button>
>>>>>>> main
    </aside>
  );
}