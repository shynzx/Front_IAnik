"use client";

import { useState } from "react";
import type { Doc } from "@/types";
import CloseButton from "@/components/ui/CloseButton";

interface GenerateSummaryModalProps {
  docs: Doc[];
  onGenerate: (fileId?: string) => Promise<void>;
  onClose: () => void;
}

export default function GenerateSummaryModal({ docs, onGenerate, onClose }: GenerateSummaryModalProps) {
  const [scope, setScope] = useState<string>("all");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setError(null);
    try {
      await onGenerate(scope === "all" ? undefined : scope);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo generar el resumen");
    } finally { setGenerating(false); }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-panel max-w-lg p-6" role="dialog" aria-modal="true" aria-labelledby="summary-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 id="summary-dialog-title" className="text-lg font-semibold text-white m-0">Generar resumen</h2>
            <p className="text-sm text-white/40 mt-1 mb-0">Elige si deseas resumir todo el cuaderno o solamente un archivo.</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Contenido que se resumirá">
          <label className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${scope === "all" ? "border-[#8b7cf6]/60 bg-[#8b7cf6]/10" : "border-white/10 bg-white/[0.025] hover:bg-white/[0.05]"}`}>
            <input type="radio" name="summary-scope" value="all" checked={scope === "all"} onChange={() => setScope("all")} className="accent-[#8b7cf6]" />
            <span><strong className="block text-sm text-white font-medium">Todo el cuaderno</strong><span className="block text-xs text-white/35 mt-0.5">Integra el contenido de todos los archivos disponibles.</span></span>
          </label>
          {docs.map((doc) => (
            <label key={doc.id} className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${scope === doc.id ? "border-[#8b7cf6]/60 bg-[#8b7cf6]/10" : "border-white/10 bg-white/[0.025] hover:bg-white/[0.05]"}`}>
              <input type="radio" name="summary-scope" value={doc.id} checked={scope === doc.id} onChange={() => setScope(doc.id)} className="accent-[#8b7cf6]" />
              <span className="text-sm text-white/75 truncate">{doc.name}</span>
            </label>
          ))}
        </div>

        {docs.length === 0 && <p className="text-xs text-amber-200/70 mt-3 mb-0">El cuaderno necesita al menos un archivo con contenido para generar un resumen.</p>}
        {error && <p role="alert" className="text-sm text-red-300 mt-4 mb-0">{error}</p>}

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="ui-secondary">Cancelar</button>
          <button onClick={handleGenerate} disabled={generating || docs.length === 0} className="ui-primary">{generating ? "Generando…" : "Generar resumen"}</button>
        </div>
      </section>
    </div>
  );
}
