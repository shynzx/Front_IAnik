"use client";

import { useRouter, useSearchParams } from "next/navigation";
import LoginScreen from "@/components/auth/LoginScreen";
import PublicOnly from "@/components/auth/PublicOnly";
import { useAuthContext } from "@/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { login, loginWithGoogle } = useAuthContext();
  const destination = search.get("next") || "/cuadernos";
  return <PublicOnly><LoginScreen onLogin={async (email, password) => { await login(email, password); router.replace(destination); }} onGoogle={async (credential) => { await loginWithGoogle(credential); router.replace(destination); }} onGoRegister={() => router.push(`/registro${search.get("next") ? `?next=${encodeURIComponent(destination)}` : ""}`)} onGoRecover={() => router.push("/recuperar")} onGoHome={() => router.push("/")} /></PublicOnly>;
}
