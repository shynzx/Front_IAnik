import { useState, useCallback } from "react";
import { createApiKey, listApiKeys, deleteApiKey } from "@/lib/api";
import type { ApiKey, ApiKeyCreateResponse } from "@/types";

export function useApiKeys() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);

  const create = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createApiKey(name);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear API key";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listApiKeys();
      setKeys(res);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener API keys";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (keyId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteApiKey(keyId);
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar API key";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, list, remove, keys, loading, error };
}
