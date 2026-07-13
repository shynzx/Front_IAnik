import { useCallback, useState } from "react";
import { deleteNotebookSummary, generateNotebookSummary, listNotebookSummaries } from "@/lib/api";
import type { Summary } from "@/types";

export function useSummaries(notebookId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async (): Promise<Summary[]> => {
    if (!notebookId) return [];
    setLoading(true);
    setError(null);
    try {
      const summaries = await listNotebookSummaries(notebookId);
      return summaries.map((summary) => ({
        id: String(summary.id),
        fileId: summary.archivo_id ? String(summary.archivo_id) : undefined,
        title: summary.archivo_id ? `Resumen del archivo #${summary.archivo_id}` : "Resumen del cuaderno",
        docName: summary.archivo_id ? `Archivo #${summary.archivo_id}` : "Todos los archivos",
        content: summary.content,
        createdAt: new Date(summary.created_at),
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar los resúmenes");
      return [];
    } finally { setLoading(false); }
  }, [notebookId]);

  const generate = useCallback(async (fileId?: string) => {
    if (!notebookId) throw new Error("Selecciona un cuaderno antes de generar un resumen");
    setLoading(true);
    setError(null);
    try { return await generateNotebookSummary(notebookId, fileId); }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo generar el resumen");
      throw cause;
    } finally { setLoading(false); }
  }, [notebookId]);

  const remove = useCallback(async (summaryId: string) => {
    setLoading(true);
    setError(null);
    try { await deleteNotebookSummary(summaryId); }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar el resumen");
      throw cause;
    } finally { setLoading(false); }
  }, []);

  return { generate, list, remove, loading, error };
}
