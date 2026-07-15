"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OnboardingScreen from "@/components/chat/OnboardingScreen";
import { useAuthContext } from "@/providers/AuthProvider";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  useEffect(() => { if (!loading && user) router.replace("/cuadernos"); }, [loading, router, user]);
  if (loading) return <div className="app-background flex min-h-screen items-center justify-center" role="status"><span className="ui-loader" /></div>;
  if (user) return null;
  return <OnboardingScreen dragActive={false} onFiles={() => router.push("/login")} onDragLeave={() => {}} onGoLogin={() => router.push("/login")} onGoRegister={() => router.push("/registro")} />;
}
