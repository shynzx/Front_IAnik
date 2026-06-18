"use client";

import { useMemo } from "react";
import { pp, gradText, ExamSet, FlashcardSet, Flashcard, ExamCard } from "../../types";
import StatCard from "./dashboard/StatCard";
import OverallBar from "./dashboard/OverallBar";
import ExamColumn from "./dashboard/ExamColumn";
import FlashcardColumn from "./dashboard/FlashcardColumn";
import { pct } from "./dashboard/types";

interface DashboardScreenProps {
  examSets: ExamSet[];
  flashcardSets: FlashcardSet[];
  onUpdateFlashcard: (setId: string, cardId: string, status: Flashcard["status"]) => void;
  onUpdateExamCard:  (setId: string, cardId: string, status: ExamCard["status"])   => void;
}

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════ */
export default function DashboardScreen({ examSets, flashcardSets, onUpdateFlashcard, onUpdateExamCard }: DashboardScreenProps) {
  const stats = useMemo(() => {
    const ae = examSets.flatMap(s => s.cards), af = flashcardSets.flatMap(s => s.cards);
    const el = ae.filter(c => c.status === "learned").length, er = ae.filter(c => c.status === "review").length, ep = ae.filter(c => c.status === "pending").length;
    const fl = af.filter(c => c.status === "learned").length, fr = af.filter(c => c.status === "review").length, fp = af.filter(c => c.status === "pending").length;
    const total = ae.length + af.length, learned = el + fl;
    return { total, learned, globalPct: pct(learned, total), er, ep, fr, fp, aeLen: ae.length, afLen: af.length };
  }, [examSets, flashcardSets]);

  const hasContent = examSets.length > 0 || flashcardSets.length > 0;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18, boxSizing: "border-box" }}>
      {/* Header */}
      <div>
        <h1 style={{ ...pp, fontWeight: 400, fontSize: 24, ...gradText, margin: "0 0 4px" }}>Dashboard de progreso</h1>
        <p style={{ ...pp, fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>Seguimiento de tu actividad con exámenes y flashcards.</p>
      </div>

      {!hasContent && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 0", gap: 14, opacity: 0.5 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <p style={{ ...pp, fontSize: 13.5, color: "rgba(255,255,255,0.5)", textAlign: "center", margin: 0, maxWidth: 280, lineHeight: "22px" }}>
            Pídele a la IA que genere un <strong style={{ color: "#c4b5fd" }}>examen</strong> o <strong style={{ color: "#c4b5fd" }}>flashcards</strong> y aparecerán aquí.
          </p>
        </div>
      )}

      {hasContent && (
        <>
          {/* Stat cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>} label="Exámenes" value={examSets.filter(s=>!s.loading).length} sub={`${stats.aeLen} preguntas`}/>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg>} label="Flashcards" value={flashcardSets.filter(s=>!s.loading).length} accent="#a78bfa" sub={`${stats.afLen} tarjetas`}/>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>} label="Correctas" value={stats.learned} accent="#4ade80" sub={`${stats.globalPct}% dominio`}/>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>} label="Para repasar" value={stats.er + stats.fr} accent="#f87171"/>
          </div>

          {/* Global progress bar */}
          <div style={{ padding: "13px 16px", borderRadius: 13, background: "rgba(130,109,210,0.06)", border: "1px solid rgba(130,109,210,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
              <p style={{ ...pp, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.6)", margin: 0 }}>Progreso global</p>
              <span style={{ ...pp, fontSize: 19, fontWeight: 600, color: "#826dd2" }}>{stats.globalPct}%</span>
            </div>
            <OverallBar learned={stats.learned} review={stats.er + stats.fr} pending={stats.ep + stats.fp} total={stats.total}/>
          </div>

          {/* Two-column layout with category buttons */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <ExamColumn examSets={examSets} onUpdateExamCard={onUpdateExamCard}/>
            <FlashcardColumn flashcardSets={flashcardSets} onUpdateFlashcard={onUpdateFlashcard}/>
          </div>
        </>
      )}
    </div>
  );
}