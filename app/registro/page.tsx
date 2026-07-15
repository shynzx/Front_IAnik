"use client";

import { useRouter, useSearchParams } from "next/navigation";
import RegisterScreen from "@/components/auth/RegisterScreen";
import PublicOnly from "@/components/auth/PublicOnly";
import { useAuthContext } from "@/providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { signup, loginWithGoogle } = useAuthContext();
  const destination = search.get("next") || "/cuadernos";
  return <PublicOnly><RegisterScreen onRegister={async (name, email, password) => { await signup(name, email, password); router.replace(destination); }} onGoogle={async (credential) => { await loginWithGoogle(credential); router.replace(destination); }} onGoLogin={() => router.push(`/login${search.get("next") ? `?next=${encodeURIComponent(destination)}` : ""}`)} onGoHome={() => router.push("/")} /></PublicOnly>;
}
