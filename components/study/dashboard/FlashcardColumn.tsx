"use client";

import { useState } from "react";
import { pp, FlashcardSet, Flashcard } from "../../../types";
import FlashcardModal from "../FlashcardModal";
import CategoryButton from "./CategoryButton";
import CategoryDrawer from "./CategoryDrawer";
import { FilterCat, categorizeFc } from "./types";

export default function FlashcardColumn({ flashcardSets, onUpdateFlashcard }: { flashcardSets: FlashcardSet[]; onUpdateFlashcard: (setId: string, cardId: string, status: Flashcard["status"]) => void }) {
  const [drawerCat, setDrawerCat]     = useState<FilterCat | null>(null);
  const [openFcId, setOpenFcId]       = useState<string | null>(null);
  const activeFc = openFcId ? flashcardSets.find(s => s.id === openFcId) ?? null : null;

  const counts = {
    pending:   flashcardSets.filter(s => !s.loading && categorizeFc(s) === "pending").length,
    review:    flashcardSets.filter(s => !s.loading && categorizeFc(s) === "review").length,
    completed: flashcardSets.filter(s => !s.loading && categorizeFc(s) === "completed").length,
  };

  return (
    <>
      {activeFc && <FlashcardModal set={activeFc} onClose={() => setOpenFcId(null)} onUpdateCard={onUpdateFlashcard}/>}
      {drawerCat && (
        <CategoryDrawer
          title="Flashcards" accentColor="#a78bfa" category={drawerCat} kind="flashcard"
          flashcardSets={flashcardSets} onClose={() => setDrawerCat(null)}
          onOpenFlashcard={id => setOpenFcId(id)}
        />
      )}

      <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", boxSizing: "border-box", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(167,139,250,0.18)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
            </svg>
          </div>
          <p style={{ ...pp, fontWeight: 500, fontSize: 14, color: "rgba(255,255,255,0.85)", margin: 0 }}>Flashcards</p>
          <span style={{ ...pp, fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "rgba(167,139,250,0.18)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.25)" }}>
            {flashcardSets.filter(s => !s.loading).length}
          </span>
        </div>

        {flashcardSets.some(s => s.loading) && (
          <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            <p style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>Generando…</p>
          </div>
        )}

        <CategoryButton
          label="Pendientes" color="#ffffff" count={counts.pending}
          description="Sin repasar todavía"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          onClick={() => setDrawerCat("pending")}
          disabled={counts.pending === 0}
        />
        <CategoryButton
          label="Para repasar" color="#f87171" count={counts.review}
          description="Marcadas para reforzar"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>}
          onClick={() => setDrawerCat("review")}
          disabled={counts.review === 0}
        />
        <CategoryButton
          label="Completadas" color="#4ade80" count={counts.completed}
          description="Todas aprendidas"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          onClick={() => setDrawerCat("completed")}
          disabled={counts.completed === 0}
        />
      </div>
    </>
  );
}
