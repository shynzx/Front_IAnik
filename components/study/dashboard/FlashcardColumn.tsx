import { useState } from "react";
import type { FlashcardSet, Flashcard } from "@/types";
import FlashcardModal from "@/components/study/FlashcardModal";
import CategoryButton from "./CategoryButton";
import CategoryDrawer from "./CategoryDrawer";
import { FilterCat, categorizeFc } from "./types";

export default function FlashcardColumn({ flashcardSets, onUpdateFlashcard }: { flashcardSets: FlashcardSet[]; onUpdateFlashcard: (setId: string, cardId: string, status: Flashcard["status"]) => void }) {
  const [drawerCat, setDrawerCat] = useState<FilterCat | null>(null);
  const [openFcId, setOpenFcId] = useState<string | null>(null);
  const activeFc = openFcId ? flashcardSets.find(s => s.id === openFcId) ?? null : null;

  const counts = {
    pending: flashcardSets.filter(s => !s.loading && categorizeFc(s) === "pending").length,
    review: flashcardSets.filter(s => !s.loading && categorizeFc(s) === "review").length,
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

      <div className="flex-1 min-w-[16rem] flex flex-col bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4 gap-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[rgba(167,139,250,0.18)] border border-[rgba(167,139,250,0.3)] flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="6" width="14" height="14" rx="2"/><rect x="6" y="4" width="14" height="14" rx="2"/>
            </svg>
          </div>
          <p className="font-medium text-sm text-white/85 m-0">Flashcards</p>
          <span className="text-[0.7rem] px-1.5 py-0.5 rounded-full bg-[rgba(167,139,250,0.18)] text-[#c4b5fd] border border-[rgba(167,139,250,0.25)]">
            {flashcardSets.filter(s => !s.loading).length}
          </span>
        </div>

        {flashcardSets.some(s => s.loading) && (
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06] flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            <p className="text-xs text-white/45 m-0">Generando…</p>
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
