import { useState, useCallback, useRef } from "react";
import { uploadNotebookFile, listNotebookFiles, deleteNotebookFile, sendChatMessage, getChatMessages, createNotebookChat } from "@/lib/api";
import type { RAGFileResponse } from "@/lib/api";

export function useRag(notebookId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<RAGFileResponse[]>([]);
  const chatIdRef = useRef<string | null>(null);
  const notebookIdRef = useRef(notebookId);
  notebookIdRef.current = notebookId;

  const ensureChat = useCallback(async (): Promise<string> => {
    if (chatIdRef.current) return chatIdRef.current;
    const nbId = notebookIdRef.current;
    if (!nbId) throw new Error("Se requiere un notebook_id para crear chat");
    const res = await createNotebookChat(nbId, "Chat");
    chatIdRef.current = String(res.id);
    return chatIdRef.current;
  }, []);

  const uploadFile = useCallback(async (file: File, nbIdOverride?: string) => {
    const nbId = nbIdOverride || notebookIdRef.current;
    if (!nbId) throw new Error("Se requiere un notebook_id");
    setLoading(true);
    setError(null);
    try {
      const res = await uploadNotebookFile(nbId, file);
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
  }, []);

  const ask = useCallback(async (question: string, _filenames?: string[], chatId?: string) => {
    const activeChatId = chatId || await ensureChat();
    setLoading(true);
    setError(null);
    try {
      await sendChatMessage(activeChatId, question);
      const messages = await getChatMessages(activeChatId);
      const reply = messages.filter((m) => m.role === "assistant");
      return reply.length > 0 ? reply[reply.length - 1].content : "No se obtuvo respuesta.";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al consultar";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [ensureChat]);

  const listFiles = useCallback(async () => {
    const nbId = notebookIdRef.current;
    if (!nbId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listNotebookFiles(nbId);
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
  }, []);

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

  return { uploadFile, ask, listFiles, deleteFile, files, loading, error, ensureChat };
}
