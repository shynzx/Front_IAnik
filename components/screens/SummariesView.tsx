"use client";

import { useState, useEffect } from "react";
import type { Doc, Summary } from "@/types";
import SummaryScreen from "@/components/summaries/SummaryScreen";
import { useSummaries } from "@/hooks/useSummaries";

interface SummariesViewProps {
  docs: Doc[];
  onChatClick: () => void;
  onStudyClick: () => void;
  onStudyRoomsClick: () => void;
}

export default function SummariesView({ docs, onChatClick, onStudyClick, onStudyRoomsClick }: SummariesViewProps) {
  const summariesApi = useSummaries();
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    summariesApi.list().then((res) => setSummaries(res)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateSummary = async (selectedDocs: Doc[], title: string, prompt: string): Promise<string | null> => {
    try {
      await summariesApi.generate(selectedDocs.map(d => d.id), title, prompt);
      const fresh = await summariesApi.list();
      setSummaries(fresh);
      return null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al generar resumen";
      throw new Error(msg);
    }
  };

  const handleDeleteSummary = async (id: string) => {
    try {
      await summariesApi.remove(id);
      setSummaries((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.warn("Error al eliminar resumen:", err);
    }
  };

  return (
    <div className="min-h-full p-6 pb-12 md:p-8 md:pb-16">
      <SummaryScreen docs={docs} summaries={summaries} onGenerateSummary={handleGenerateSummary} onDeleteSummary={handleDeleteSummary} />
    </div>
  );
}
