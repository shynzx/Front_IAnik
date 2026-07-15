"use client";

import { useState } from "react";
import type { ExamSet, ExamCard } from "@/types";
import dynamic from "next/dynamic";
const ExamModal = dynamic(() => import("@/components/study/ExamModal"), { ssr: false, loading: () => <div className="immersive-modal" role="status"><span className="ui-loader" /></div> });
import CategoryButton from "./CategoryButton";
import CategoryDrawer from "./CategoryDrawer";
import { FilterCat, categorizeExam } from "./types";

export default function ExamColumn({ examSets, onUpdateExamCard }: { examSets: ExamSet[]; onUpdateExamCard: (setId: string, cardId: string, status: ExamCard["status"]) => void }) {
  const [drawerCat, setDrawerCat] = useState<FilterCat | null>(null);
  const [openExamId, setOpenExamId] = useState<string | null>(null);
  const activeExam = openExamId ? examSets.find(s => s.id === openExamId) ?? null : null;

  const counts = {
    pending: examSets.filter(s => !s.loading && categorizeExam(s) === "pending").length,
    review: examSets.filter(s => !s.loading && categorizeExam(s) === "review").length,
    completed: examSets.filter(s => !s.loading && categorizeExam(s) === "completed").length,
  };

  return (
    <>
      {activeExam && <ExamModal set={activeExam} onClose={() => setOpenExamId(null)} onUpdateCard={onUpdateExamCard}/>}
      {drawerCat && (
        <CategoryDrawer
          title="Exámenes" accentColor="#826dd2" category={drawerCat} kind="exam"
          examSets={examSets} onClose={() => setDrawerCat(null)}
          onOpenExam={id => setOpenExamId(id)}
        />
      )}

      <div className="flex-1 min-w-[16rem] flex flex-col bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4 gap-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[rgba(130,109,210,0.18)] border border-[rgba(130,109,210,0.3)] flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <p className="font-medium text-sm text-white/85 m-0">Exámenes</p>
          <span className="text-[0.7rem] px-1.5 py-0.5 rounded-full bg-[rgba(130,109,210,0.18)] text-[#c4b5fd] border border-[rgba(130,109,210,0.25)]">
            {examSets.filter(s => !s.loading).length}
          </span>
        </div>

        {examSets.some(s => s.loading) && (
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06] flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            <p className="text-xs text-white/45 m-0">Generando…</p>
          </div>
        )}

        <CategoryButton
          label="Pendientes" color="#ffffff" count={counts.pending}
          description="Sin responder todavía"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          onClick={() => setDrawerCat("pending")}
          disabled={counts.pending === 0}
        />
        <CategoryButton
          label="Para repasar" color="#f87171" count={counts.review}
          description="Marcados para reforzar"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>}
          onClick={() => setDrawerCat("review")}
          disabled={counts.review === 0}
        />
        <CategoryButton
          label="Completados" color="#4ade80" count={counts.completed}
          description="Todo respondido"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          onClick={() => setDrawerCat("completed")}
          disabled={counts.completed === 0}
        />
      </div>
    </>
  );
}
