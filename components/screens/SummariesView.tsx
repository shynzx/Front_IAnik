"use client";

import { useCallback, useEffect, useState } from "react";
import type { Doc, Notebook, Summary } from "@/types";
import SummaryScreen from "@/components/summaries/SummaryScreen";
import { useSummaries } from "@/hooks/useSummaries";
import { listNotebookFiles, listNotebooks } from "@/lib/api";

interface SummariesViewProps {
  notebookId: string;
  onNotebookChange: (notebookId: string) => void;
  onChatClick: () => void;
  onStudyClick: () => void;
  onStudyRoomsClick: () => void;
}

export default function SummariesView({ notebookId, onNotebookChange, onChatClick }: SummariesViewProps) {
  const [selectedNotebookId, setSelectedNotebookId] = useState(notebookId);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(true);
  const [notebooksError, setNotebooksError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const summariesApi = useSummaries(selectedNotebookId);
  const { list, generate, remove } = summariesApi;

  const refresh = useCallback(async () => {
    if (!selectedNotebookId) {
      setSummaries([]);
      setDocs([]);
      return;
    }

    const [summaryList, files] = await Promise.all([
      list(),
      listNotebookFiles(selectedNotebookId),
    ]);
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
  }, [selectedNotebookId, list]);

  useEffect(() => {
    let active = true;
    listNotebooks()
      .then((items) => {
        if (!active) return;
        setNotebooks(items);
        setNotebooksError(null);
        const currentExists = items.some((item) => String(item.id) === notebookId);
        const nextId = currentExists ? notebookId : items[0] ? String(items[0].id) : "";
        setSelectedNotebookId(nextId);
        if (nextId && nextId !== notebookId) onNotebookChange(nextId);
      })
      .catch((error) => {
        if (!active) return;
        setNotebooks([]);
        setNotebooksError(error instanceof Error ? error.message : "No se pudieron cargar los cuadernos");
      })
      .finally(() => { if (active) setLoadingNotebooks(false); });
    return () => { active = false; };
  }, [notebookId, onNotebookChange]);

  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
  }, [refresh]);

  const handleNotebookChange = (nextId: string) => {
    setSelectedNotebookId(nextId);
    setSummaries([]);
    setDocs([]);
    onNotebookChange(nextId);
  };

  const handleGenerateSummary = async (fileId?: string) => {
    await generate(fileId);
    await refresh();
  };

  const handleDeleteSummary = async (id: string) => {
    await remove(id);
    setSummaries((current) => current.filter((summary) => summary.id !== id));
  };

  return (
    <div className="page-shell min-h-full">
      <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4 max-sm:flex-col max-sm:items-stretch">
        <div>
          <p className="m-0 text-sm font-medium text-white">Cuaderno de resúmenes</p>
          <p className="m-0 mt-1 text-xs text-white/50">Selecciona el cuaderno cuyos resúmenes quieres consultar o generar.</p>
        </div>
        <label className="min-w-64 max-sm:min-w-0">
          <span className="sr-only">Seleccionar cuaderno</span>
          <select
            value={selectedNotebookId}
            onChange={(event) => handleNotebookChange(event.target.value)}
            disabled={loadingNotebooks || notebooks.length === 0}
            className="ui-input cursor-pointer pr-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" className="bg-[#171020]">{loadingNotebooks ? "Cargando cuadernos…" : "Selecciona un cuaderno"}</option>
            {notebooks.map((notebook) => (
              <option key={notebook.id} value={String(notebook.id)} className="bg-[#171020]">{notebook.title}</option>
            ))}
          </select>
        </label>
      </div>

      {notebooksError && <p role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{notebooksError}</p>}
      {summariesApi.error && <p role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{summariesApi.error}</p>}

      {!loadingNotebooks && notebooks.length === 0 ? (
        <div className="ui-empty">
          <h1 className="m-0 text-xl font-semibold">Aún no tienes cuadernos</h1>
          <p className="mb-5 mt-2 text-sm text-white/50">Crea un cuaderno para poder generar y organizar resúmenes.</p>
          <button onClick={onChatClick} className="ui-primary">Ir a Cuadernos</button>
        </div>
      ) : selectedNotebookId ? (
        <SummaryScreen docs={docs} summaries={summaries} onGenerateSummary={handleGenerateSummary} onDeleteSummary={handleDeleteSummary} />
      ) : null}
    </div>
  );
}
