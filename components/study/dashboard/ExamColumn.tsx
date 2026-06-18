import { useState } from "react";
import { pp, ExamSet, ExamCard } from "../../../types";
import ExamModal from "../ExamModal";
import CategoryButton from "./CategoryButton";
import CategoryDrawer from "./CategoryDrawer";
import { FilterCat, categorizeExam } from "./types";

export default function ExamColumn({ examSets, onUpdateExamCard }: { examSets: ExamSet[]; onUpdateExamCard: (setId: string, cardId: string, status: ExamCard["status"]) => void }) {
  const [drawerCat, setDrawerCat]   = useState<FilterCat | null>(null);
  const [openExamId, setOpenExamId] = useState<string | null>(null);
  const activeExam = openExamId ? examSets.find(s => s.id === openExamId) ?? null : null;

  const counts = {
    pending:   examSets.filter(s => !s.loading && categorizeExam(s) === "pending").length,
    review:    examSets.filter(s => !s.loading && categorizeExam(s) === "review").length,
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

      <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", boxSizing: "border-box", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(130,109,210,0.18)", border: "1px solid rgba(130,109,210,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <p style={{ ...pp, fontWeight: 500, fontSize: 14, color: "rgba(255,255,255,0.85)", margin: 0 }}>Exámenes</p>
          <span style={{ ...pp, fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "rgba(130,109,210,0.18)", color: "#c4b5fd", border: "1px solid rgba(130,109,210,0.25)" }}>
            {examSets.filter(s => !s.loading).length}
          </span>
        </div>

        {examSets.some(s => s.loading) && (
          <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            <p style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>Generando…</p>
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
