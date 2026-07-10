import { useState, useCallback } from "react";
import { uploadNotebookFile, listNotebookFiles, deleteNotebookFile, sendChatMessage, getChatMessages } from "@/lib/api";
import type { RAGFileResponse } from "@/lib/api";

export function useRag(notebookId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<RAGFileResponse[]>([]);

  const uploadFile = useCallback(async (file: File) => {
    if (!notebookId) throw new Error("Se requiere un notebook_id");
    setLoading(true);
    setError(null);
    try {
      const res = await uploadNotebookFile(notebookId, file);
      const mapped: RAGFileResponse = { id: res.id, filename: res.filename, name: res.filename, uploaded_at: new Date().toISOString() };
      setFiles((prev) => [...prev, mapped]);
      return mapped;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al subir archivo";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [notebookId]);

  const ask = useCallback(async (question: string, _filenames?: string[], chatId?: string) => {
    if (!chatId) return question;
    setLoading(true);
    setError(null);
    try {
      await sendChatMessage(chatId, question);
      const messages = await getChatMessages(chatId);
      const reply = messages.filter((m) => m.role === "assistant");
      return reply.length > 0 ? reply[reply.length - 1].content : "No se obtuvo respuesta.";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al consultar";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listFiles = useCallback(async () => {
    if (!notebookId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listNotebookFiles(notebookId);
      const mapped: RAGFileResponse[] = res.map((f) => ({ id: f.id, filename: f.filename, name: f.filename, uploaded_at: f.created_at }));
      setFiles(mapped);
      return mapped;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al listar archivos";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [notebookId]);

  const deleteFile = useCallback(async (fileId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteNotebookFile(fileId);
      setFiles((prev) => prev.filter((f) => (f.id || f.filename || "") !== fileId));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar archivo";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { uploadFile, ask, listFiles, deleteFile, files, loading, error };
}
