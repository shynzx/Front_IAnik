import { useState, useCallback } from "react";
import { createApiKey, createNotebook, listNotebooks } from "@/lib/api";

export function useNotebook() {
  const [notebookId, setNotebookId] = useState<string | undefined>(undefined);

  const ensureNotebook = useCallback(async (): Promise<string> => {
    if (notebookId) return notebookId;
    try {
      const existing = await listNotebooks();
      if (existing.length > 0) {
        const id = String(existing[0].id);
        setNotebookId(id);
        return id;
      }
    } catch (e) { console.warn("Error listando cuadernos:", e); }
    const title = `Cuaderno ${new Date().toLocaleDateString()}`;
    const keyRes = await createApiKey("auto");
    const nbRes = await createNotebook(title, "Cuaderno auto-creado", keyRes.api_key);
    const id = String(nbRes.id);
    setNotebookId(id);
    return id;
  }, [notebookId]);

  const loadNotebookId = useCallback(async () => {
    try {
      const existing = await listNotebooks();
      if (existing.length > 0) {
        setNotebookId(String(existing[0].id));
      }
    } catch (e) { console.warn("Error cargando cuadernos:", e); }
  }, []);

  return { notebookId, setNotebookId, ensureNotebook, loadNotebookId };
}
