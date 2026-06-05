"use client";

import { useState } from "react";
import { pp } from "./tokens";
import { AuthUser } from "../Chat"; 

interface UserPanelProps {
  user: AuthUser;
  expanded: boolean; 
  onLogout: () => void;
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function UserPanel({ user, expanded, onLogout }: UserPanelProps) {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {/* ── Popup de perfil ── */}
      {popupOpen && (
        <>
          <div
            onClick={() => setPopupOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 90 }}
          />
          <div style={{
            position: "absolute",
            // CORRECCIÓN de posición adaptativa
            bottom: expanded ? "calc(100% + 10px)" : 0,
            left: expanded ? 0 : "calc(100% + 14px)",
            transform: "none",
            width: 230,
            background: "rgba(10,6,24,0.98)",
            border: "1px solid rgba(130,109,210,0.25)",
            borderRadius: 16,
            boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
            zIndex: 100,
            overflow: "hidden",
            animation: "userPopIn .18s ease",
          }}>
            <style>{`@keyframes userPopIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

            <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#826dd2,#4f3fa0)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <span style={{ ...pp, fontSize: 16, fontWeight: 600, color: "#fff" }}>{initials(user.name)}</span>
              </div>
              <p style={{ ...pp, fontWeight: 500, fontSize: 14, color: "#fff", margin: 0, wordBreak: "break-word" }}>{user.name}</p>
              <p style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.4)", margin: "3px 0 0", wordBreak: "break-all" }}>{user.email}</p>
            </div>

            <button
              onClick={() => { setPopupOpen(false); onLogout(); }}
              style={{
                ...pp, width: "100%", padding: "12px 16px", background: "transparent",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                color: "#f87171", fontSize: 13, textAlign: "left", transition: "background .15s",
              }}
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

      {/* ── Botón del sidebar ── */}
      <button
        onClick={() => setPopupOpen(p => !p)}
        title={user.name}
        style={{
          width: "100%", padding: expanded ? "8px 12px" : "8px 0",
          display: "flex", alignItems: "center", gap: 10,
          background: popupOpen ? "rgba(130,109,210,0.12)" : "transparent",
          border: "none", cursor: "pointer", borderRadius: 10,
          transition: "background .15s", justifyContent: expanded ? "flex-start" : "center",
        }}
        onMouseEnter={e => { if (!popupOpen) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={e => { if (!popupOpen) e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#826dd2,#4f3fa0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: popupOpen ? "2px solid rgba(130,109,210,0.6)" : "2px solid transparent", transition: "border .15s" }}>
          <span style={{ ...pp, fontSize: 12, fontWeight: 600, color: "#fff" }}>{initials(user.name)}</span>
        </div>
        {expanded && (
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <p style={{ ...pp, fontSize: 12.5, fontWeight: 500, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
            <p style={{ ...pp, fontSize: 10.5, color: "rgba(255,255,255,0.35)", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
          </div>
        )}
      </button>
    </div>
  );
}