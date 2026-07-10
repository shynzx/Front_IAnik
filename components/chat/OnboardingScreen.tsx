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
      className="h-screen w-screen overflow-hidden bg-gradient-to-br from-black to-[#3c2850] flex relative"
    >
      <Sidebar
        phase="onboard"
        hasMessages={false}
        onChatClick={() => { } }
        onStudyClick={() => {}}
        onSummariesClick={() => {}}
        onStudyRoomsClick={() => {}}
      />
      {/* Main content area, offset by sidebar */}
      <div
        className="ml-[64px] w-[calc(100%-64px)] h-screen flex flex-col overflow-hidden relative"
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
            className="flex items-start gap-[14px] mb-10 max-w-[620px] w-full"
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
                className="font-semibold text-xl text-white mb-3 leading-7"
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
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
            className="w-full max-w-[620px] bg-[rgba(255,255,255,0.03)] border-[1.5px] border-[rgba(255,255,255,0.1)] rounded-[22px] py-16 px-12 flex flex-col items-center gap-[22px] cursor-pointer transition-[border-color,background] duration-200"
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
