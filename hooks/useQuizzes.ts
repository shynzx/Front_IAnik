import { useState, useCallback } from "react";
import {
  generateExam, getExam, getNotebookExams, getRoomExams,
  submitExam, listAttempts, getAttempt, getExamAttempts,
} from "@/lib/api";
import type { AssessmentExam, ExamSubmitResponse, ExamAttempt } from "@/types";

export function useQuizzes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (notebookId: string, prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      return await generateExam(notebookId, prompt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al generar examen";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async (examId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getExam(examId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener examen";
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
      return await getNotebookExams(notebookId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener exámenes";
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
      return await getRoomExams(roomId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener exámenes";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = useCallback(async (examId: string, answers: { pregunta_id: number; opcion: string }[]) => {
    setLoading(true);
    setError(null);
    try {
      return await submitExam(examId, answers);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al enviar examen";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const myAttempts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await listAttempts();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener intentos";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAttemptDetail = useCallback(async (attemptId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getAttempt(attemptId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener intento";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const examAttempts = useCallback(async (examId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getExamAttempts(examId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener intentos";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, get, listByNotebook, listByRoom, submit, myAttempts, getAttemptDetail, examAttempts, loading, error };
}
