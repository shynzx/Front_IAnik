import { useState, useCallback } from "react";
import { healthCheck, getHealthProcesses, getHealthMetadata } from "@/lib/api";
import type { HealthStatus, HealthProcess, HealthMetadata } from "@/types";

export function useHealth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await healthCheck();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al verificar salud";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const processes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await getHealthProcesses();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener procesos";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const metadata = useCallback(async (apiKey: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getHealthMetadata(apiKey);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener metadata";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { check, processes, metadata, loading, error };
}
