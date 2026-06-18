"use client";

import { useRef } from "react";
import { pp, gradText, BG } from "../../types";
import Sidebar from "../layout/Sidebar";
import AuthButtons from "../layout/AuthButtons";
import DragOverlay from "./DragOverlay";

interface OnboardingScreenProps {
  dragActive: boolean;
  onFiles: (files: FileList | null) => void;
  onDragLeave: () => void;
  onGoLogin: () => void;
  onGoRegister: () => void;
}

const SIDEBAR_W = 64;

export default function OnboardingScreen({
  dragActive,
  onFiles,
  onDragLeave,
  onGoLogin,
  onGoRegister,
}: OnboardingScreenProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: BG,
        display: "flex",
        position: "relative",
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      <Sidebar
        phase="onboard"
        docsOpen={false}
        docsFullscreen={false}
        hasMessages={false}
        onChatClick={() => { } }
        onDocsClick={() => { } } />

      {/* Main content area, offset by sidebar */}
      <div
        style={{
          marginLeft: SIDEBAR_W,
          width: `calc(100% - ${SIDEBAR_W}px)`,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Auth buttons — inside main area so they never overlap sidebar */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            display: "flex",
            gap: 12,
            zIndex: 40,
          }}
        >
          <AuthButtons onGoLogin={onGoLogin} onGoRegister={onGoRegister} />
        </div>

        {/* Centered content */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "72px 48px 48px",
            overflowY: "auto",
          }}
        >
          {/* Greeting */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              marginBottom: 40,
              maxWidth: 620,
              width: "100%",
            }}
          >
            <div style={{ marginTop: 2, color: "#826dd2", flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8" />
                <path d="M3 12c0-1.333.536-2.583 1.5-3.5" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 20,
                  color: "#fff",
                  marginBottom: 12,
                  lineHeight: "28px",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Hola, soy IAnik
              </p>
              <p style={{ ...pp, fontSize: 17, lineHeight: "30px", ...gradText }}>
                Estoy aquí para acompañarte. Tus apuntes y documentos estarán
                guardados de manera segura, y con ellos te daré respuestas
                claras y útiles para lo que necesites.
              </p>
            </div>
          </div>

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
            style={{
              width: "100%",
              maxWidth: 620,
              background: "rgba(255,255,255,0.03)",
              border: "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: 22,
              padding: "64px 48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
              cursor: "pointer",
              transition: "border-color .2s, background .2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(130,109,210,0.5)";
              (e.currentTarget as HTMLDivElement).style.background  = "rgba(130,109,210,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLDivElement).style.background  = "rgba(255,255,255,0.03)";
            }}
          >
            <div
              style={{
                width: 84, height: 84, borderRadius: "50%",
                background: "#826dd2",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 48px rgba(130,109,210,0.55)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                <polyline points="7 9 12 4 17 9" />
                <line x1="12" y1="4" x2="12" y2="16" />
              </svg>
            </div>
            <p style={{ ...pp, fontSize: 17, textAlign: "center", color: "rgba(255,255,255,0.55)", lineHeight: "26px" }}>
              <strong style={{ fontWeight: 600, color: "#fff" }}>Sube o arrastra</strong>{" "}tus archivos
            </p>
          </div>

          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            multiple
            accept=".pdf,.doc,.docx"
            onChange={(e) => onFiles(e.target.files)}
          />
        </main>
      </div>

      {dragActive && <DragOverlay onDrop={onFiles} onLeave={onDragLeave} />}
    </div>
  );
}