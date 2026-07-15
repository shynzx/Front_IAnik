"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppLayout from "./AppLayout";
import ProfileModal from "./ProfileModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuthContext } from "@/providers/AuthProvider";

export default function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuthContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, pathname, router, user]);

  useEffect(() => {
    if (!user || localStorage.getItem("ianik:navigation-migrated")) return;
    const oldScreen = localStorage.getItem("ia_screen");
    const notebook = localStorage.getItem("ia_cuaderno");
    const room = localStorage.getItem("ia_room");
    const destination = oldScreen === "study" ? `/progreso${notebook ? `?cuaderno=${notebook}` : ""}`
      : oldScreen === "summaries" ? `/resumenes${notebook ? `?cuaderno=${notebook}` : ""}`
      : oldScreen === "study-room" && room ? `/salas/${room}`
      : oldScreen === "study-rooms" ? "/salas"
      : oldScreen === "cuaderno-detail" && notebook ? `/cuadernos/${notebook}` : "/cuadernos";
    localStorage.setItem("ianik:navigation-migrated", "1");
    localStorage.removeItem("ia_screen");
    localStorage.removeItem("ia_cuaderno");
    localStorage.removeItem("ia_room");
    if (pathname === "/cuadernos" && destination !== pathname) router.replace(destination);
  }, [pathname, router, user]);

  const phase = useMemo(() => {
    if (pathname.startsWith("/progreso")) return "study" as const;
    if (pathname.startsWith("/resumenes")) return "summaries" as const;
    if (/^\/salas\/.+/.test(pathname)) return "study-room" as const;
    if (pathname.startsWith("/salas")) return "study-rooms" as const;
    return "chat" as const;
  }, [pathname]);

  if (loading || !user) {
    return <div className="app-background flex min-h-screen items-center justify-center" role="status" aria-label="Restaurando sesión"><span className="ui-loader" /></div>;
  }

  const nav = {
    onChatClick: () => router.push("/cuadernos"),
    onStudyClick: () => router.push("/progreso"),
    onSummariesClick: () => router.push("/resumenes"),
    onStudyRoomsClick: () => router.push("/salas"),
  };

  return <>
    <AppLayout phase={phase} hasMessages={false} headerProps={{ userName: user.nombre, onProfileClick: () => setProfileOpen(true), onLogout: () => setLogoutOpen(true), onGoLogin: () => router.push("/login"), onGoRegister: () => router.push("/registro") }} {...nav}>
      <div className="screen-transition h-full">{children}</div>
    </AppLayout>
    {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} onAccountDeleted={() => { setProfileOpen(false); logout(); router.replace("/"); }} />}
    {logoutOpen && <ConfirmDialog title="Cerrar sesión" description="Tendrás que volver a iniciar sesión para acceder a tus cuadernos y salas de estudio." confirmLabel="Cerrar sesión" busyLabel="Cerrando…" onClose={() => setLogoutOpen(false)} onConfirm={() => { logout(); router.replace("/"); }} />}
  </>;
}
