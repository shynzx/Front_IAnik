import { useState, useCallback } from "react";
import { generateSummary, listSummaries, deleteSummary } from "@/lib/api";
import type { Summary } from "@/types";

function toSummary(raw: { id: string; title: string; doc_names: string; content: string; key_points: string[]; created_at: string }): Summary {
  return {
    id: raw.id,
    title: raw.title,
    docName: raw.doc_names,
    content: raw.content,
    keyPoints: raw.key_points,
    createdAt: new Date(raw.created_at),
  };
}

export function useSummaries() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (docIds: string[], title: string, prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateSummary({ doc_ids: docIds, title, prompt });
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al generar resumen";
      if (msg.includes("404") || msg.includes("Not Found")) {
        setError("Resúmenes no disponibles en el servidor");
      } else {
        setError(msg);
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const list = useCallback(async (): Promise<Summary[]> => {
    setLoading(true);
    setError(null);
    try {
      const raw = await listSummaries();
      return raw.map(toSummary);
    } catch (e) { console.warn("Error listando resúmenes:", e); return []; }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (summaryId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteSummary(summaryId);
    } catch (e) { console.warn("Error eliminando resumen:", e); }
    finally { setLoading(false); }
  }, []);

  return { generate, list, remove, loading, error };
}
