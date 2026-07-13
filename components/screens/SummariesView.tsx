"use client";

import { useCallback, useEffect, useState } from "react";
import type { Doc, Summary } from "@/types";
import SummaryScreen from "@/components/summaries/SummaryScreen";
import { useSummaries } from "@/hooks/useSummaries";
import { listNotebookFiles } from "@/lib/api";

interface SummariesViewProps {
  notebookId: string;
  onChatClick: () => void;
  onStudyClick: () => void;
  onStudyRoomsClick: () => void;
}

export default function SummariesView({ notebookId }: SummariesViewProps) {
  const summariesApi = useSummaries(notebookId);
  const { list, generate, remove } = summariesApi;
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);

  const refresh = useCallback(async () => {
    if (!notebookId) { setSummaries([]); setDocs([]); return; }
    const [summaryList, files] = await Promise.all([list(), listNotebookFiles(notebookId)]);
    const mappedDocs: Doc[] = files.map((file) => ({
      id: String(file.id),
      name: file.filename,
      type: file.filename.toLowerCase().endsWith(".pdf") ? "pdf" : "word",
      uploadedAt: new Date(file.created_at),
    }));
    const names = new Map(mappedDocs.map((doc) => [doc.id, doc.name]));
    setDocs(mappedDocs);
    setSummaries(summaryList.map((summary) => summary.fileId ? {
      ...summary,
      title: `Resumen de ${names.get(summary.fileId) ?? "archivo"}`,
      docName: names.get(summary.fileId) ?? `Archivo #${summary.fileId}`,
    } : summary));
  }, [notebookId, list]);

  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);

  const handleGenerateSummary = async (fileId?: string) => {
    await generate(fileId);
    await refresh();
  };

  const handleDeleteSummary = async (id: string) => {
    await remove(id);
    setSummaries((current) => current.filter((summary) => summary.id !== id));
  };

  if (!notebookId) {
    return <div className="page-shell"><div className="ui-empty"><h1 className="text-xl font-semibold m-0">Selecciona un cuaderno</h1><p className="text-sm text-white/40 mt-2 mb-0">Abre un cuaderno antes de consultar o generar sus resúmenes.</p></div></div>;
  }

  return (
    <div className="page-shell min-h-full">
      {summariesApi.error && <p role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{summariesApi.error}</p>}
      <SummaryScreen docs={docs} summaries={summaries} onGenerateSummary={handleGenerateSummary} onDeleteSummary={handleDeleteSummary} />
    </div>
  );
}
