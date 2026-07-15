"use client";

import { useRouter } from "next/navigation";
import RecoverScreen from "@/components/auth/RecoverScreen";
import PublicOnly from "@/components/auth/PublicOnly";

export default function RecoverPage() {
  const router = useRouter();
  return <PublicOnly><RecoverScreen onRecover={async () => {}} onVerifyCode={async () => {}} onNewPassword={async () => {}} onGoLogin={() => router.push("/login")} /></PublicOnly>;
}
