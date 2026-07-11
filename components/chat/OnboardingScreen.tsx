"use client";

import { useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import AuthButtons from "@/components/layout/AuthButtons";
import DragOverlay from "./DragOverlay";

interface OnboardingScreenProps {
  dragActive: boolean;
  onFiles: (files: FileList | null) => void;
  onDragLeave: () => void;
  onGoLogin: () => void;
  onGoRegister: () => void;
}

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
      className="app-background h-screen w-screen overflow-hidden flex relative"
    >
      <Sidebar
        phase="onboard"
        hasMessages={false}
        onChatClick={onGoLogin}
        onStudyClick={onGoLogin}
        onSummariesClick={onGoLogin}
        onStudyRoomsClick={onGoLogin}
      />
      {/* Main content area, offset by sidebar */}
      <div
        className="ml-[76px] w-[calc(100%-76px)] h-screen flex flex-col overflow-hidden relative max-md:ml-0 max-md:w-full max-md:pb-[68px]"
      >
        {/* Auth buttons — inside main area so they never overlap sidebar */}
        <div
          className="absolute top-5 right-6 flex gap-3 z-40"
        >
          <AuthButtons onGoLogin={onGoLogin} onGoRegister={onGoRegister} />
        </div>

        {/* Centered content */}
        <main
          className="flex-1 flex flex-col items-center justify-center pt-[72px] px-12 pb-12 overflow-y-auto"
        >
          {/* Greeting */}
          <div
            className="flex items-start gap-4 mb-8 max-w-[680px] w-full animate-[fadeUp_.5s_ease-out]"
          >
            <div className="mt-[2px] text-[#826dd2] shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8" />
                <path d="M3 12c0-1.333.536-2.583 1.5-3.5" />
              </svg>
            </div>
            <div>
              <p
                className="font-semibold text-3xl text-white mb-3 leading-tight tracking-tight"
              >
                Hola, soy IAnik
              </p>
              <p className="font-light text-[17px] leading-[30px] bg-gradient-to-r from-white to-[#a5a5a5] bg-clip-text text-transparent">
                Estoy aquí para acompañarte. Tus apuntes y documentos estarán
                guardados de manera segura, y con ellos te daré respuestas
                claras y útiles para lo que necesites.
              </p>
            </div>
          </div>

          {/* Upload zone */}
          <div
            onClick={onGoLogin}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
            className="glass-panel w-full max-w-[680px] rounded-[28px] py-16 px-8 flex flex-col items-center gap-[22px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-[#9b8cf8]/50 hover:bg-[#8b7cf6]/[0.08] animate-[fadeUp_.6s_ease-out]"
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
              className="w-[84px] h-[84px] rounded-full bg-[#826dd2] flex items-center justify-center shadow-[0_0_48px_rgba(130,109,210,0.55)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                <polyline points="7 9 12 4 17 9" />
                <line x1="12" y1="4" x2="12" y2="16" />
              </svg>
            </div>
            <p className="font-light text-[17px] text-center text-[rgba(255,255,255,0.55)] leading-[26px]">
              <strong className="font-semibold text-white">Sube o arrastra</strong>{" "}tus archivos
            </p>
          </div>

          <input
            type="file"
            ref={fileRef}
            className="hidden"
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
