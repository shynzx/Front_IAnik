"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";

export default function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const search = useSearchParams();
  useEffect(() => {
    if (!loading && user) router.replace(search.get("next") || "/cuadernos");
  }, [loading, router, search, user]);
  if (loading || user) return <div className="app-background flex min-h-screen items-center justify-center" role="status"><span className="ui-loader" /></div>;
  return children;
}
