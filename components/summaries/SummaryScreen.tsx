"use client";

import { useState } from "react";
import { Doc, Summary } from "@/types";
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
      
      <div className="w-full mx-auto flex flex-col gap-5 box-border">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white m-0">Resúmenes</h1>
            <p className="text-sm text-white/40 mt-1 m-0">Gestiona y crea las síntesis guiadas por inteligencia artificial.</p>
          </div>
          <button 
            onClick={() => setIsGenerateOpen(true)}
            className="px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer flex items-center gap-2 hover:bg-[#7059be] transition-colors shrink-0 shadow-[0_0.25rem_1.25rem_rgba(130,109,210,0.25)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generar resúmenes
          </button>
        </div>

        {(!summaries || summaries.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/40">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 001 1h4" /><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>
            <p className="text-sm text-white/50 text-center m-0 mt-3">
              Aún no tienes resúmenes. ¡Haz clic en "Generar resúmenes" para empezar!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 box-border">
            {summaries.map((s) => (
              <SummaryCard key={s.id} summary={s} onView={() => !s.loading && setViewingSummary(s)} onDelete={() => onDeleteSummary(s.id)} onCopy={() => handleCopy(s)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
