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
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuthContext } from "@/providers/AuthProvider";

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
  const { user, login, signup, logout, loginWithGoogle } = useAuthContext();
  const [screen, setScreen] = useState<Screen>("onboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [activeCuadernoId, setActiveCuadernoId] = useState<string | null>(null);

  useEffect(() => {
    if (user && AUTH_SCREENS.includes(screen)) queueMicrotask(() => setScreen("chat"));
  }, [user, screen]);

  // ── Persistir la sesión de navegación para que sobreviva a recargas ──
  // Al recargar, el backend ya tiene las flashcards/exámenes guardados; solo
  // necesitamos restaurar el cuaderno y la pantalla activa para volver a
  // consultarlos.
  useEffect(() => {
    if (!user) return;
    const savedScreen = localStorage.getItem("ia_screen") as Screen | null;
    const savedCuaderno = localStorage.getItem("ia_cuaderno");
    const savedRoom = localStorage.getItem("ia_room");
    queueMicrotask(() => {
      if (savedCuaderno) setActiveCuadernoId(savedCuaderno);
      if (savedRoom) setActiveRoomId(Number(savedRoom));
      if (savedScreen && !AUTH_SCREENS.includes(savedScreen)) setScreen(savedScreen);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (AUTH_SCREENS.includes(screen)) localStorage.removeItem("ia_screen");
    else localStorage.setItem("ia_screen", screen);
  }, [screen, user]);

  useEffect(() => {
    if (!user) return;
    if (activeCuadernoId) localStorage.setItem("ia_cuaderno", activeCuadernoId);
    else localStorage.removeItem("ia_cuaderno");
  }, [activeCuadernoId, user]);

  useEffect(() => {
    if (!user) return;
    if (activeRoomId != null) localStorage.setItem("ia_room", String(activeRoomId));
    else localStorage.removeItem("ia_room");
  }, [activeRoomId, user]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setScreen("chat");
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      await signup(name, email, password);
      setScreen("chat");
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "No se pudo registrar el usuario");
    }
  };

  const handleRecover = async () => {};
  const handleLogout = () => setLogoutConfirmOpen(true);
  const confirmLogout = () => { logout(); setProfileOpen(false); setScreen("onboard"); };

  const nav = {
    onChatClick: () => setScreen("chat"),
    onStudyClick: () => setScreen("study"),
    onSummariesClick: () => setScreen("summaries"),
    onStudyRoomsClick: () => setScreen("study-rooms"),
  };

  const showHeader = !AUTH_SCREENS.includes(screen);

  const screenContent = (() => {
    if (screen === "login") return <LoginScreen onLogin={handleLogin} onGoogle={loginWithGoogle} onGoRegister={() => setScreen("register")} onGoRecover={() => setScreen("recover")} onGoHome={() => setScreen("onboard")} />;
    if (screen === "register") return <RegisterScreen onRegister={handleRegister} onGoogle={loginWithGoogle} onGoLogin={() => setScreen("login")} onGoHome={() => setScreen("onboard")} />;
    if (screen === "recover") return <RecoverScreen onRecover={handleRecover} onGoLogin={() => setScreen("login")} onVerifyCode={async () => {}} onNewPassword={async () => {}} />;
    if (screen === "onboard") return <OnboardingScreen dragActive={false} onFiles={() => setScreen("login")} onDragLeave={() => {}} onGoLogin={() => setScreen("login")} onGoRegister={() => setScreen("register")} />;

    if (screen === "study") return <StudyView notebookId={activeCuadernoId ?? ""} {...nav} />;
    if (screen === "summaries") return <SummariesView notebookId={activeCuadernoId ?? ""} {...nav} />;
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
        {logoutConfirmOpen && <ConfirmDialog title="Cerrar sesión" description="Tendrás que volver a iniciar sesión para acceder a tus cuadernos y salas de estudio." confirmLabel="Cerrar sesión" busyLabel="Cerrando…" onClose={() => setLogoutConfirmOpen(false)} onConfirm={confirmLogout} />}
      </>
    );
  }

  return (
    <>
      {screenContent}
    </>
  );
}
