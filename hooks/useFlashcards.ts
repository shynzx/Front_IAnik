import { useState, useCallback } from "react";
import { generateFlashcards, getNotebookFlashcards, createRoomFlashcard, listRoomFlashcards } from "@/lib/api";

export function useFlashcards() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (notebookId: string, prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      return await generateFlashcards(notebookId, prompt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al generar flashcards";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listByNotebook = useCallback(async (notebookId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getNotebookFlashcards(notebookId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener flashcards";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInRoom = useCallback(async (roomId: string, data: { prompt: string; cantidad?: number }) => {
    setLoading(true);
    setError(null);
    try {
      return await createRoomFlashcard(roomId, data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear flashcard";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listByRoom = useCallback(async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await listRoomFlashcards(roomId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener flashcards";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, listByNotebook, createInRoom, listByRoom, loading, error };
}
