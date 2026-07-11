"use client";

import { useMemo, useState } from "react";
import { ExamSet, FlashcardSet, Flashcard, ExamCard } from "@/types";
import StatCard from "./dashboard/StatCard";
import OverallBar from "./dashboard/OverallBar";
import ExamColumn from "./dashboard/ExamColumn";
import FlashcardColumn from "./dashboard/FlashcardColumn";
import GenerateModal from "./GenerateModal";
import { pct } from "./dashboard/types";

interface DashboardScreenProps {
  examSets: ExamSet[];
  flashcardSets: FlashcardSet[];
  onUpdateFlashcard: (setId: string, cardId: string, status: Flashcard["status"]) => void;
  onUpdateExamCard:  (setId: string, cardId: string, status: ExamCard["status"])   => void;
  onGenerateFlashcards?: (prompt: string) => Promise<void>;
  onGenerateExam?: (prompt: string) => Promise<void>;
  generating?: boolean;
}

export default function DashboardScreen({ examSets, flashcardSets, onUpdateFlashcard, onUpdateExamCard, onGenerateFlashcards, onGenerateExam, generating }: DashboardScreenProps) {
  const [modalType, setModalType] = useState<"flashcards" | "exam" | null>(null);

  const stats = useMemo(() => {
    const ae = examSets.flatMap(s => s.cards), af = flashcardSets.flatMap(s => s.cards);
    const el = ae.filter(c => c.status === "learned").length, er = ae.filter(c => c.status === "review").length, ep = ae.filter(c => c.status === "pending").length;
    const fl = af.filter(c => c.status === "learned").length, fr = af.filter(c => c.status === "review").length, fp = af.filter(c => c.status === "pending").length;
    const total = ae.length + af.length, learned = el + fl;
    return { total, learned, globalPct: pct(learned, total), er, ep, fr, fp, aeLen: ae.length, afLen: af.length };
  }, [examSets, flashcardSets]);

  const hasContent = examSets.length > 0 || flashcardSets.length > 0;

  return (
    <div className="w-full flex flex-col gap-5 box-border">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-white m-0">Dashboard de progreso</h1>
          <p className="text-sm text-white/40 mt-1 m-0">Seguimiento de tu actividad con exámenes y flashcards.</p>
        </div>
        {onGenerateFlashcards && onGenerateExam && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setModalType("flashcards")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[rgba(130,109,210,0.3)] bg-[rgba(130,109,210,0.1)] text-[#826dd2] text-xs font-medium cursor-pointer hover:bg-[rgba(130,109,210,0.2)] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="6" width="14" height="14" rx="2"/><rect x="6" y="4" width="14" height="14" rx="2"/></svg>
              Flashcards
            </button>
            <button onClick={() => setModalType("exam")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[rgba(130,109,210,0.3)] bg-[rgba(130,109,210,0.1)] text-[#826dd2] text-xs font-medium cursor-pointer hover:bg-[rgba(130,109,210,0.2)] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>
              Examen
            </button>
          </div>
        )}
      </div>

      {!hasContent && (
        <div className="ui-empty gap-3 text-white/60">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <p className="text-sm text-white/50 text-center m-0 max-w-[18rem] leading-relaxed">
            Usa los botones de arriba para generar <strong className="text-[#c4b5fd]">exámenes</strong> o <strong className="text-[#c4b5fd]">flashcards</strong> con IA.
          </p>
        </div>
      )}

      {hasContent && (
        <>
          {/* Stat cards */}
          <div className="flex flex-wrap gap-2.5">
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>} label="Exámenes" value={examSets.filter(s=>!s.loading).length} sub={`${stats.aeLen} preguntas`}/>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="6" width="14" height="14" rx="2"/><rect x="6" y="4" width="14" height="14" rx="2"/></svg>} label="Flashcards" value={flashcardSets.filter(s=>!s.loading).length} accent="#a78bfa" sub={`${stats.afLen} tarjetas`}/>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>} label="Correctas" value={stats.learned} accent="#4ade80" sub={`${stats.globalPct}% dominio`}/>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>} label="Para repasar" value={stats.er + stats.fr} accent="#f87171"/>
          </div>

          {/* Global progress bar */}
          <div className="px-4 py-3.5 rounded-xl bg-[rgba(130,109,210,0.06)] border border-[rgba(130,109,210,0.15)]">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-medium text-white/60 m-0">Progreso global</p>
              <span className="text-lg font-semibold text-[#826dd2]">{stats.globalPct}%</span>
            </div>
            <OverallBar learned={stats.learned} review={stats.er + stats.fr} pending={stats.ep + stats.fp} total={stats.total}/>
          </div>

          {/* Two-column layout with category buttons */}
          <div className="flex gap-3 items-stretch flex-col md:flex-row">
            <ExamColumn examSets={examSets} onUpdateExamCard={onUpdateExamCard}/>
            <FlashcardColumn flashcardSets={flashcardSets} onUpdateFlashcard={onUpdateFlashcard}/>
          </div>
        </>
      )}

      {modalType && onGenerateFlashcards && onGenerateExam && (
        <GenerateModal
          type={modalType}
          loading={!!generating}
          onGenerate={modalType === "flashcards" ? onGenerateFlashcards : onGenerateExam}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}
