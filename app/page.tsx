"use client";

import { useState, useEffect } from "react";
import OnboardingScreen from "@/components/chat/OnboardingScreen";
import LoginScreen from "@/components/auth/LoginScreen";
import RegisterScreen from "@/components/auth/RegisterScreen";
import RecoverScreen from "@/components/auth/RecoverScreen";
import ProfileModal from "@/components/layout/ProfileModal";
import AppLayout from "@/components/layout/AppLayout";
import CuadernoListView from "@/components/screens/CuadernoListView";
import CuadernoDetailView from "@/components/screens/CuadernoDetailView";
import StudyView from "@/components/screens/StudyView";
import SummariesView from "@/components/screens/SummariesView";
import StudyRoomsView from "@/components/screens/StudyRoomsView";
import StudyRoomDetailView from "@/components/screens/StudyRoomDetailView";
import { useAuthContext } from "@/providers/AuthProvider";
import type { Doc } from "@/types";

type Screen = "onboard" | "chat" | "cuaderno-detail" | "login" | "register" | "recover" | "study" | "summaries" | "study-rooms" | "study-room";

const AUTH_SCREENS: Screen[] = ["onboard", "login", "register", "recover"];

const PHASE_MAP: Record<string, "onboard" | "chat" | "study" | "summaries" | "study-rooms" | "study-room"> = {
  onboard: "onboard",
  chat: "chat",
  "cuaderno-detail": "chat",
  study: "study",
  summaries: "summaries",
  "study-rooms": "study-rooms",
  "study-room": "study-room",
};

export default function Home() {
  const { user, login, signup, logout } = useAuthContext();
  const [screen, setScreen] = useState<Screen>("onboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [activeCuadernoId, setActiveCuadernoId] = useState<string | null>(null);
  const [docs] = useState<Doc[]>([]);

  useEffect(() => {
    if (user && screen === "onboard") setScreen("chat");
  }, [user]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setScreen("chat");
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  const handleRegister = async (name: string, email: string, _password: string) => {
    try {
      await signup(name, email, _password);
      setScreen("chat");
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "No se pudo registrar el usuario");
    }
  };

  const handleRecover = async (_email?: string) => {};
  const handleLogout = () => { logout(); setScreen("onboard"); };

  const nav = {
    onChatClick: () => setScreen("chat"),
    onStudyClick: () => setScreen("study"),
    onSummariesClick: () => setScreen("summaries"),
    onStudyRoomsClick: () => setScreen("study-rooms"),
  };

  const showHeader = !AUTH_SCREENS.includes(screen);

  const screenContent = (() => {
    if (screen === "login") return <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} onGoRecover={() => setScreen("recover")} onGoHome={() => setScreen("onboard")} />;
    if (screen === "register") return <RegisterScreen onRegister={handleRegister} onGoLogin={() => setScreen("login")} onGoHome={() => setScreen("onboard")} />;
    if (screen === "recover") return <RecoverScreen onRecover={handleRecover} onGoLogin={() => setScreen("login")} onVerifyCode={async () => {}} onNewPassword={async () => {}} />;
    if (screen === "onboard") return <OnboardingScreen dragActive={false} onFiles={() => {}} onDragLeave={() => {}} onGoLogin={() => setScreen("login")} onGoRegister={() => setScreen("register")} />;

    if (screen === "study") return <StudyView notebookId={activeCuadernoId ?? ""} {...nav} />;
    if (screen === "summaries") return <SummariesView docs={docs} {...nav} />;
    if (screen === "study-rooms") return <StudyRoomsView {...nav} onOpenRoom={(id) => { setActiveRoomId(id); setScreen("study-room"); }} />;
    if (screen === "study-room" && activeRoomId) return <StudyRoomDetailView roomId={activeRoomId} {...nav} onBack={() => setScreen("study-rooms")} />;
    if (screen === "cuaderno-detail" && activeCuadernoId) return <CuadernoDetailView notebookId={activeCuadernoId} onBack={() => setScreen("chat")} {...nav} />;

    return <CuadernoListView onSelect={(id) => { setActiveCuadernoId(id); setScreen("cuaderno-detail"); }} {...nav} />;
  })();

  if (showHeader) {
    return (
      <>
        <AppLayout
          phase={PHASE_MAP[screen] || "chat"}
          hasMessages={false}
          headerProps={{
            onGoLogin: () => setScreen("login"),
            onGoRegister: () => setScreen("register"),
            onLogout: handleLogout,
            onProfileClick: () => setProfileOpen(true),
            userName: user?.nombre ?? null,
          }}
          {...nav}
        >
          {screenContent}
        </AppLayout>
        {profileOpen && user && (
          <ProfileModal user={user} onClose={() => setProfileOpen(false)} onAccountDeleted={() => { setProfileOpen(false); logout(); }} />
        )}
      </>
    );
  }

  return (
    <>
      {screenContent}
    </>
  );
}
