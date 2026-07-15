"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";

export default function FallbackPage() { const router = useRouter(); const { user, loading } = useAuthContext(); useEffect(() => { if (!loading) router.replace(user ? "/cuadernos" : "/"); }, [loading, router, user]); return <div className="app-background flex min-h-screen items-center justify-center" role="status"><span className="ui-loader" /></div>; }
