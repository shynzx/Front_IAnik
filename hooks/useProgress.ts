import { useState, useCallback } from "react";
import { getProgressMetrics, getPendingCards, getDailyActivity } from "@/lib/api";
import type { ProgressMetrics } from "@/types";

export function useProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProgressMetrics();
      setMetrics(res);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener progreso";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await getPendingCards();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener cartas pendientes";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDailyActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await getDailyActivity();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener actividad diaria";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchMetrics, fetchPendingCards, fetchDailyActivity, metrics, loading, error };
}
