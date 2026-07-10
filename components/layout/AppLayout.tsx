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
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-black to-[#3c2850]">
      <Sidebar
        phase={phase}
        hasMessages={hasMessages}
        onChatClick={onChatClick}
        onStudyClick={onStudyClick}
        onSummariesClick={onSummariesClick}
        onStudyRoomsClick={onStudyRoomsClick}
      />
      <Header {...headerProps} />
      <main className="absolute inset-0 ml-16 pt-18 max-md:ml-0 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
