import { useState, useCallback } from "react";
import { createWebhookSubscription, listWebhookSubscriptions, getWebhookAttempts, retryWebhookAttempt } from "@/lib/api";
import type { WebhookSubscription, WebhookAttempt } from "@/types";

export function useWebhooks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: { org_id: number; url: string }) => {
    setLoading(true);
    setError(null);
    try {
      return await createWebhookSubscription(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear suscripción";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const list = useCallback(async (orgId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await listWebhookSubscriptions(orgId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener suscripciones";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const attempts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await getWebhookAttempts();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener intentos";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(async (attemptId: string) => {
    setLoading(true);
    setError(null);
    try {
      await retryWebhookAttempt(attemptId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al reintentar";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, list, attempts, retry, loading, error };
}
