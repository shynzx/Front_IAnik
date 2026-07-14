"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { APIError, setStoredToken, clearStoredToken, loginUser, registerUser, getMe, logoutUser } from "@/lib/api";
import { parseGoogleCredential, googleSyntheticPassword } from "@/lib/googleAuth";
import type { User, LoginResponse } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const saved = localStorage.getItem("auth_token");
      const savedType = localStorage.getItem("auth_token_type") || "bearer";
      if (!saved) { setLoading(false); return; }
      setStoredToken(saved, savedType);
      setToken(`${savedType} ${saved}`);
      try {
        const me = await getMe();
        if (me) setUser(me);
      } catch (error) {
        console.warn("Error verificando sesión:", error);
        clearStoredToken();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_token_type");
        setToken(null);
      } finally { setLoading(false); }
    }
    void restoreSession();
  }, []);

  const setSession = useCallback(async (res: LoginResponse) => {
    setStoredToken(res.access_token, res.token_type);
    localStorage.setItem("auth_token", res.access_token);
    localStorage.setItem("auth_token_type", res.token_type);
    setToken(`${res.token_type} ${res.access_token}`);
    try {
      const me = await getMe();
      if (!me) throw new Error("El servidor no devolvió el perfil del usuario");
      setUser(me);
    } catch (error) {
      clearStoredToken();
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_token_type");
      setToken(null);
      setUser(null);
      throw new Error(error instanceof Error ? error.message : "No se pudo completar la sesión");
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginUser(email, password);
    await setSession(res);
  }, [setSession]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await registerUser(email, password, name);
    const res = await loginUser(email, password);
    await setSession(res);
  }, [setSession]);

  // Adapta el id_token de Google al flujo email/password del back. Si el
  // usuario no existe (login falla) lo registramos (upsert) y reintentamos.
  const loginWithGoogle = useCallback(async (credential: string) => {
    const { email, name, sub } = parseGoogleCredential(credential, GOOGLE_CLIENT_ID);
    const password = googleSyntheticPassword(sub);
    try {
      const res = await loginUser(email, password);
      await setSession(res);
      return;
    } catch (error) {
      if (!(error instanceof APIError)) {
        throw new Error("No se pudo conectar con el servidor. Inténtalo nuevamente.");
      }
      if (error.status === 401) {
        throw new Error("Este correo ya tiene una cuenta con contraseña. Inicia sesión con tu correo para vincularla.");
      }
      if (error.status !== 404) throw error;
    }
    try {
      await registerUser(email, password, name);
      const res = await loginUser(email, password);
      await setSession(res);
    } catch (error) {
      if (error instanceof APIError && (error.status === 400 || error.status === 409)) {
        throw new Error("No se pudo vincular Google porque el correo ya está registrado.");
      }
      if (!(error instanceof APIError)) throw new Error("Se perdió la conexión durante el registro con Google.");
      throw error;
    }
  }, [setSession]);

  const logout = useCallback(() => {
    void logoutUser().catch(() => {});
    clearStoredToken();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_token_type");
    localStorage.removeItem("ia_screen");
    localStorage.removeItem("ia_cuaderno");
    localStorage.removeItem("ia_room");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
