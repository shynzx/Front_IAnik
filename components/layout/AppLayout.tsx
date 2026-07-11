"use client";

import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

type Phase = "onboard" | "chat" | "study" | "summaries" | "study-rooms" | "study-room";

interface AppLayoutProps {
  phase: Phase;
  hasMessages: boolean;
  headerProps: {
    onGoLogin: () => void;
    onGoRegister: () => void;
    onLogout?: () => void;
    onProfileClick?: () => void;
    userName?: string | null;
  };
  onChatClick: () => void;
  onStudyClick: () => void;
  onSummariesClick: () => void;
  onStudyRoomsClick: () => void;
  children: ReactNode;
}

export default function AppLayout({
  phase,
  hasMessages,
  headerProps,
  onChatClick,
  onStudyClick,
  onSummariesClick,
  onStudyRoomsClick,
  children,
}: AppLayoutProps) {
  return (
    <div className="app-background h-screen w-screen overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <Sidebar
        phase={phase}
        hasMessages={hasMessages}
        onChatClick={onChatClick}
        onStudyClick={onStudyClick}
        onSummariesClick={onSummariesClick}
        onStudyRoomsClick={onStudyRoomsClick}
      />
      <Header {...headerProps} />
      <main className="absolute inset-0 ml-[76px] pt-[84px] max-md:ml-0 max-md:pb-20 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
