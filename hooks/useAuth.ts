import { useState, useCallback } from "react";
import { loginUser, registerUser, setStoredToken, clearStoredToken } from "@/lib/api";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(email, password);
      setStoredToken(res.access_token, res.token_type);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al iniciar sesión";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      return await registerUser(email, password, name);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al registrarse";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
  }, []);

  return { login, signup, logout, loading, error };
}
