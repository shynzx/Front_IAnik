"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { setStoredToken, clearStoredToken, loginUser, registerUser, getMe } from "@/lib/api";
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

  const _setSession = useCallback(async (res: LoginResponse) => {
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

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginUser(email, password);
    await _setSession(res);
  }, [_setSession]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await registerUser(email, password, name);
    const res = await loginUser(email, password);
    await _setSession(res);
  }, [_setSession]);

  // Adapta el id_token de Google al flujo email/password del back. Si el
  // usuario no existe (login falla) lo registramos (upsert) y reintentamos.
  const loginWithGoogle = useCallback(async (credential: string) => {
    const { email, name, sub } = parseGoogleCredential(credential);
    const password = googleSyntheticPassword(sub);
    try {
      const res = await loginUser(email, password);
      await _setSession(res);
      return;
    } catch {
      // usuario ausente o contraseña distinta -> intentamos registrar
    }
    let registerErr: unknown = null;
    try {
      await registerUser(email, password, name);
    } catch (err) {
      registerErr = err;
      console.error("Google register failed:", err);
    }
    try {
      const res = await loginUser(email, password);
      await _setSession(res);
    } catch (loginErr) {
      if (registerErr) {
        throw new Error(
          "No se pudo completar el registro con Google: " +
            (registerErr instanceof Error ? registerErr.message : String(registerErr))
        );
      }
      throw loginErr;
    }
  }, [_setSession]);

  const logout = useCallback(() => {
    clearStoredToken();
    localStorage.clear();
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
