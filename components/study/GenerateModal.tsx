"use client";

import { useState } from "react";
import CloseButton from "@/components/ui/CloseButton";

interface GenerateModalProps {
  type: "flashcards" | "exam";
  loading: boolean;
  onGenerate: (prompt: string) => Promise<void>;
  onClose: () => void;
}

export default function GenerateModal({ type, loading, onGenerate, onClose }: GenerateModalProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setError(null);
    try {
      await onGenerate(prompt.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar");
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-panel max-w-sm" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2 className="modal-title">{type === "flashcards" ? "Generar flashcards" : "Generar examen"}</h2><p className="modal-description">Describe el tema y el nivel de detalle que necesitas.</p></div>
          <CloseButton onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="block text-sm text-white/50 mb-1.5">¿Qué quieres que genere la IA?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={type === "flashcards" ? "Ej: Flashcards sobre capítulos 1-3 de biología celular..." : "Ej: Examen de 10 preguntas sobre metabolismo celular..."}
            className="ui-input resize-y min-h-28"
            autoFocus
            rows={4}
          />
          {error && <div className="text-red-400 text-sm mt-3">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="ui-secondary">Cancelar</button>
            <button type="submit" disabled={loading || !prompt.trim()} className="ui-primary">
              {loading ? "Generando..." : "Generar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
