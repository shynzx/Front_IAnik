"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="app-background h-screen w-screen overflow-hidden relative">
      <Sidebar
        phase={phase}
        hasMessages={hasMessages}
        onChatClick={onChatClick}
        onStudyClick={onStudyClick}
        onSummariesClick={onSummariesClick}
        onStudyRoomsClick={onStudyRoomsClick}
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((value) => !value)}
        userName={headerProps.userName}
        onProfileClick={headerProps.onProfileClick}
        onLogout={headerProps.onLogout}
      />
      <main className={`absolute inset-0 ${sidebarExpanded ? "ml-[200px]" : "ml-16"} pt-6 max-md:ml-0 max-md:pt-4 max-md:pb-20 overflow-y-auto overflow-x-hidden transition-[margin] duration-300 ease-out`}>
        {children}
      </main>
    </div>
  );
}
