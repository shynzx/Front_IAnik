"use client";

import { useState } from "react";
import { pp, gradText, Doc, Summary } from "../../types";
import SummaryCard from "./SummaryCard";
import SummaryModal from "./SummaryModal";
import GenerateSummaryModal from "./GenerateSummaryModal";

interface SummaryScreenProps {
  docs: Doc[];
  summaries: Summary[];
  onGenerateSummary: (
    selectedDocs: Doc[],
    title: string,
    prompt: string
  ) => Promise<string | null>;
  onDeleteSummary: (id: string) => void;
}

export default function SummaryScreen({
  docs,
  summaries,
  onGenerateSummary,
  onDeleteSummary,
}: SummaryScreenProps) {
  const [viewingSummary, setViewingSummary] = useState<Summary | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const handleCopy = (summary: Summary) => {
    const text = `${summary.title || "Resumen"}\nDocumentos: ${summary.docName}\n\n${summary.content}\n\nConceptos clave:\n${(summary.keyPoints || []).map((k) => `• ${k}`).join("\n")}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <>
      {viewingSummary && (
        <SummaryModal summary={viewingSummary} onClose={() => setViewingSummary(null)} />
      )}
      {isGenerateOpen && (
        <GenerateSummaryModal docs={docs} onGenerate={onGenerateSummary} onClose={() => setIsGenerateOpen(false)} />
      )}
      
      <div style={{ width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, boxSizing: "border-box" }}>
        
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 200 }}>
            <h1 style={{ ...pp, fontWeight: 400, fontSize: 26, ...gradText, margin: "0 0 6px" }}>Resúmenes</h1>
            <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.38)", margin: 0 }}>Gestiona y crea las síntesis guiadas por inteligencia artificial.</p>
          </div>
          <button 
            onClick={() => setIsGenerateOpen(true)}
            style={{ ...pp, fontWeight: 500, fontSize: 14, padding: "10px 22px", borderRadius: 12, border: "none", background: "#826dd2", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background .2s, transform .1s", boxShadow: "0 4px 20px rgba(130,109,210,0.25)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#7059be"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#826dd2"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generar resúmenes
          </button>
        </div>

        {(!summaries || summaries.length === 0) ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 14, padding: "60px 0", opacity: 0.5, boxSizing: "border-box" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 001 1h4" /><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>
            <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", margin: 0 }}>
              Aún no tienes resúmenes. ¡Haz clic en "Generar resúmenes" para empezar!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box" }}>
            {summaries.map((s) => (
              <SummaryCard key={s.id} summary={s} onView={() => !s.loading && setViewingSummary(s)} onDelete={() => onDeleteSummary(s.id)} onCopy={() => handleCopy(s)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}