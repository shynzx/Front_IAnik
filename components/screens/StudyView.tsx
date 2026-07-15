"use client";

import { useState, useEffect } from "react";
import type { ExamSet, FlashcardSet, Flashcard, ExamCard, AssessmentFlashcard, AssessmentExam } from "@/types";
import DashboardScreen from "@/components/study/DashboardScreen";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useFlashcards } from "@/hooks/useFlashcards";
import InlineError from "@/components/ui/InlineError";
import Skeleton from "@/components/ui/Skeleton";
import { cachedResource, invalidateResource } from "@/lib/resourceCache";

interface StudyViewProps {
  notebookId: string | undefined;
  onChatClick: () => void;
  onSummariesClick: () => void;
  onStudyRoomsClick: () => void;
}

export default function StudyView({ notebookId }: StudyViewProps) {
  const quizzesApi = useQuizzes();
  const flashcardsApi = useFlashcards();
  const { listByNotebook: listFlashcards, generate: generateFlashcards } = flashcardsApi;
  const { listByNotebook: listExams, generate: generateExam } = quizzesApi;
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!notebookId) return;
    setLoadingContent(true);
    setLoadError(null);
    Promise.all([
      cachedResource(`study:${notebookId}:flashcards`, () => listFlashcards(notebookId)),
      cachedResource(`study:${notebookId}:exams`, () => listExams(notebookId)),
    ]).then(([rawFlashcards, rawExams]) => {
      const fcs = rawFlashcards as unknown as AssessmentFlashcard[];
      const exs = rawExams as unknown as AssessmentExam[];
      const fSets: FlashcardSet[] = fcs.length ? [{
        id: "default-fc", title: "Flashcards", topic: "",
        cards: fcs.map(c => ({ id: String(c.id), question: c.question, answer: c.answer, status: c.status || "pending" as const })),
        createdAt: new Date()
      }] : [];
      const eSets: ExamSet[] = exs.map(e => ({
        id: String(e.id), title: e.title, topic: "",
        cards: e.preguntas.map(q => ({
          id: String(q.id),
          question: q.question_text,
          answer: q.opciones[0]?.texto || "",
          status: "pending" as const,
          answerOptions: q.opciones.map(o => ({ text: o.texto, isCorrect: false })),
        })),
        createdAt: new Date(e.created_at)
      }));
      setFlashcardSets(fSets);
      setExamSets(eSets);
    }).catch((cause) => setLoadError(cause instanceof Error ? cause.message : "No se pudo cargar el material de estudio.")).finally(() => setLoadingContent(false));
  }, [notebookId, listFlashcards, listExams, retryKey]);

  const handleUpdateFlashcard = async (setId: string, cardId: string, status: Flashcard["status"]) => {
    setFlashcardSets((prev) => prev.map((s) =>
      s.id === setId ? { ...s, cards: s.cards.map((c) => c.id === cardId ? { ...c, status } : c) } : s
    ));
  };

  const handleUpdateExamCard = async (setId: string, cardId: string, status: ExamCard["status"]) => {
    setExamSets((prev) => prev.map((s) =>
      s.id === setId ? { ...s, cards: s.cards.map((c) => c.id === cardId ? { ...c, status } : c) } : s
    ));
  };

  const handleGenerateFlashcards = async (prompt: string) => {
    if (!notebookId) return;
    setGenerating(true);
    try {
      const raw = await generateFlashcards(notebookId, prompt);
      const fcs = raw as unknown as AssessmentFlashcard[];
      if (fcs.length) {
        const newSet: FlashcardSet = {
          id: `fc-${Date.now()}`, title: "Flashcards", topic: prompt.slice(0, 60),
          cards: fcs.map(c => ({ id: String(c.id), question: c.question, answer: c.answer, status: "pending" as const })),
          createdAt: new Date(),
        };
        setFlashcardSets(prev => [...prev, newSet]);
        invalidateResource(`study:${notebookId}:flashcards`);
      }
    } finally { setGenerating(false); }
  };

  const handleGenerateExam = async (prompt: string) => {
    if (!notebookId) return;
    setGenerating(true);
    try {
      const ex = await generateExam(notebookId, prompt);
      const exam = ex as unknown as AssessmentExam;
      if (exam?.preguntas?.length) {
        const newSet: ExamSet = {
          id: String(exam.id), title: exam.title, topic: prompt.slice(0, 60),
          cards: exam.preguntas.map(q => ({
            id: String(q.id), question: q.question_text, answer: q.opciones[0]?.texto || "",
            status: "pending" as const,
            answerOptions: q.opciones.map(o => ({ text: o.texto, isCorrect: false })),
          })),
          createdAt: new Date(exam.created_at),
        };
        setExamSets(prev => [...prev, newSet]);
        invalidateResource(`study:${notebookId}:exams`);
      }
    } finally { setGenerating(false); }
  };

  return (
    <div className="page-shell h-full overflow-hidden">
      {loadError && <div className="mb-4"><InlineError message={loadError} onRetry={() => { invalidateResource(`study:${notebookId}:`); setRetryKey((value) => value + 1); }} /></div>}
      {loadingContent && examSets.length === 0 && flashcardSets.length === 0 ? <div className="grid gap-4" role="status" aria-label="Cargando progreso"><Skeleton className="h-24" /><Skeleton className="h-52" /></div> :
      <DashboardScreen
        examSets={examSets}
        flashcardSets={flashcardSets}
        onUpdateFlashcard={handleUpdateFlashcard}
        onUpdateExamCard={handleUpdateExamCard}
        onGenerateFlashcards={handleGenerateFlashcards}
        onGenerateExam={handleGenerateExam}
        generating={generating}
      />}
    </div>
  );
}
