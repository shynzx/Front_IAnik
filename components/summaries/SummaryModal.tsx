"use client";

import { useState } from "react";
import type { Summary } from "@/types";
import CloseButton from "@/components/ui/CloseButton";
import KeyPoint from "./KeyPoint";

export default function SummaryModal({ summary, onClose }: { summary: Summary; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const asText = () => `${summary.title || "Resumen"}\nDocumentos: ${summary.docName}\nFecha: ${summary.createdAt.toLocaleDateString("es-MX")}\n\n${summary.content ?? ""}\n\nConceptos clave:\n${(summary.keyPoints ?? []).map((point) => `• ${point}`).join("\n")}`;

  const copy = async () => {
    await navigator.clipboard.writeText(asText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([asText()], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `resumen-${(summary.title || "archivo").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <article className="modal-panel max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="summary-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header border-b border-white/[0.07] pb-5">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-[#8b7cf6]/15 text-[#a99cff] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3v4a1 1 0 001 1h4"/><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/><path d="M9 13h6M9 17h4"/></svg>
            </span>
            <div className="min-w-0"><h2 id="summary-title" className="modal-title truncate">{summary.title || "Resumen"}</h2><p className="modal-description">{summary.docName} · {summary.createdAt.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</p></div>
          </div>
          <CloseButton onClick={onClose} />
        </header>
        <div className="modal-body">
          {!!summary.keyPoints?.length && <section className="mb-6"><h3 className="text-xs uppercase tracking-wider text-white/40 mb-3 mt-0">Conceptos clave</h3><div className="flex flex-wrap gap-2">{summary.keyPoints.map((point, index) => <KeyPoint key={`${point}-${index}`} text={point} />)}</div></section>}
          <section><h3 className="text-xs uppercase tracking-wider text-white/40 mb-3 mt-0">Contenido</h3><div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5 text-sm leading-7 text-white/75 whitespace-pre-wrap">{summary.content || "Sin contenido"}</div></section>
          <div className="modal-actions"><button onClick={copy} className="ui-secondary flex items-center gap-2">{copied ? "Copiado" : "Copiar"}</button><button onClick={download} className="ui-primary flex items-center gap-2">Descargar .txt</button></div>
        </div>
      </article>
    </div>
  );
}
