import { useState, useCallback } from "react";
import * as api from "@/lib/api";
import type { StudyRoom, StudyRoomAccess, NotebookFile, NotebookChat, ChatMessage, AssessmentFlashcard, AssessmentExam } from "@/types";

export function useStudyRooms() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const createRoom = useCallback(async (title: string, notebookId: string): Promise<{ id: number; codigo: string }> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.createStudyRoom(title, notebookId);
      return { id: res.id, codigo: res.codigo };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear sala";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinRoom = useCallback(async (codigo: string): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.joinStudyRoom(codigo);
      return res.id;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al unirse a la sala";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listCreatedRooms = useCallback(async (): Promise<StudyRoom[]> => {
    setLoading(true);
    setError(null);
    try {
      return await api.listCreatedRooms();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al listar salas creadas";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const listJoinedRooms = useCallback(async (): Promise<StudyRoom[]> => {
    setLoading(true);
    setError(null);
    try {
      return await api.listJoinedRooms();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al listar salas";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getRoom = useCallback(async (roomId: string): Promise<StudyRoom | null> => {
    setLoading(true);
    setError(null);
    try {
      return await api.getStudyRoom(roomId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener sala";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRoomAccess = useCallback(async (roomId: string): Promise<StudyRoomAccess | null> => {
    setLoading(true);
    setError(null);
    try {
      return await api.getRoomAccess(roomId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener acceso";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (roomId: string, file: File) => {
    setLoading(true);
    setError(null);
    try {
      return await api.uploadRoomFile(roomId, file);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al subir archivo";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listFiles = useCallback(async (roomId: string): Promise<NotebookFile[]> => {
    try {
      return await api.listRoomFiles(roomId);
    } catch (e) {
      return [];
    }
  }, []);

  const deleteFile = useCallback(async (roomId: string, fileId: string) => {
    try {
      await api.deleteRoomFile(roomId, fileId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar archivo";
      setError(msg);
      throw e;
    }
  }, []);

  const listChats = useCallback(async (roomId: string): Promise<NotebookChat[]> => {
    try {
      return await api.listRoomChats(roomId);
    } catch (e) {
      return [];
    }
  }, []);

  const getChatMessages = useCallback(async (roomId: string, chatId: string): Promise<ChatMessage[]> => {
    try {
      return await api.getRoomChatMessages(roomId, chatId);
    } catch (e) {
      return [];
    }
  }, []);

  const sendMessage = useCallback(async (roomId: string, chatId: string, content: string): Promise<ChatMessage | null> => {
    try {
      return await api.sendRoomChatMessage(roomId, chatId, content);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al enviar mensaje";
      setError(msg);
      return null;
    }
  }, []);

  const createChat = useCallback(async (notebookId: string, title: string): Promise<{ id: number; message: string } | null> => {
    try {
      return await api.createNotebookChat(notebookId, title);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear chat";
      setError(msg);
      return null;
    }
  }, []);

  const deleteChat = useCallback(async (chatId: string): Promise<void> => {
    try {
      await api.deleteNotebookChat(chatId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar chat";
      setError(msg);
      throw e;
    }
  }, []);

  const generateFlashcards = useCallback(async (roomId: string, prompt: string, cantidad?: number): Promise<AssessmentFlashcard[]> => {
    setLoading(true);
    setError(null);
    try {
      return await api.createRoomFlashcard(roomId, { prompt, cantidad });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al generar flashcards";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const listFlashcards = useCallback(async (roomId: string): Promise<AssessmentFlashcard[]> => {
    try {
      return await api.listRoomFlashcards(roomId);
    } catch (e) {
      return [];
    }
  }, []);

  const generateExam = useCallback(async (roomId: string, prompt: string): Promise<AssessmentExam | null> => {
    setLoading(true);
    setError(null);
    try {
      return await api.createRoomExam(roomId, { prompt });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al generar examen";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const listExams = useCallback(async (roomId: string): Promise<AssessmentExam[]> => {
    try {
      return await api.listRoomExams(roomId);
    } catch (e) {
      return [];
    }
  }, []);

  return {
    loading, error, clearError,
    createRoom, joinRoom,
    listCreatedRooms, listJoinedRooms, getRoom, getRoomAccess,
    uploadFile, listFiles, deleteFile,
    listChats, getChatMessages, sendMessage, createChat, deleteChat,
    generateFlashcards, listFlashcards,
    generateExam, listExams,
  };
}
