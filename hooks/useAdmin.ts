import { useState, useCallback } from "react";
import { getClassStats, getUserAuditLogs, getUserStorage } from "@/lib/api";
import type { AdminClassStats, AdminUserAuditLog, AdminUserStorage } from "@/types";

export function useAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classStats = useCallback(async (classId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getClassStats(classId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener estadísticas";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const auditLogs = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getUserAuditLogs(userId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener auditoría";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const storage = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getUserStorage(userId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener almacenamiento";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { classStats, auditLogs, storage, loading, error };
}
