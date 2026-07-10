"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { setStoredToken, clearStoredToken, loginUser, registerUser, getMe } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("auth_token");
    const savedType = localStorage.getItem("auth_token_type") || "bearer";
    if (saved) {
      setToken(`${savedType} ${saved}`);
      setStoredToken(saved, savedType);
      getMe()
        .then((me) => { if (me) setUser(me); })
        .catch((e) => console.warn("Error verificando sesión:", e))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginUser(email, password);
    setStoredToken(res.access_token, res.token_type);
    localStorage.setItem("auth_token", res.access_token);
    localStorage.setItem("auth_token_type", res.token_type);
    setToken(`${res.token_type} ${res.access_token}`);

    try {
      const me = await getMe();
      if (me) setUser(me);
    } catch {
      console.warn("No se pudo obtener el perfil del usuario");
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await registerUser(email, password, name);
    const res = await loginUser(email, password);
    setStoredToken(res.access_token, res.token_type);
    localStorage.setItem("auth_token", res.access_token);
    localStorage.setItem("auth_token_type", res.token_type);
    setToken(`${res.token_type} ${res.access_token}`);
    try {
      const me = await getMe();
      if (me) setUser(me);
    } catch {
      console.warn("No se pudo obtener el perfil después del registro");
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    localStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
