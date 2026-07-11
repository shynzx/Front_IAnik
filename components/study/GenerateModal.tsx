"use client";

import { useState } from "react";

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
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 pt-5 pb-0">
          <h2 className="text-lg font-semibold text-white m-0">{type === "flashcards" ? "Generar Flashcards" : "Generar Examen"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 bg-transparent border-none text-lg cursor-pointer transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6">
          <label className="block text-sm text-white/50 mb-1.5">¿Qué quieres que genere la IA?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={type === "flashcards" ? "Ej: Flashcards sobre capítulos 1-3 de biología celular..." : "Ej: Examen de 10 preguntas sobre metabolismo celular..."}
            className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.05] text-white text-sm outline-none box-border resize-y min-h-[6rem] focus:border-[rgba(130,109,210,0.5)] transition-colors placeholder:text-white/25"
            autoFocus
            rows={4}
          />
          {error && <div className="text-red-400 text-sm mt-3">{error}</div>}
          <div className="flex gap-2 justify-end mt-5">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-white/[0.12] bg-transparent text-white/60 text-sm cursor-pointer hover:bg-white/[0.05] transition-colors">Cancelar</button>
            <button type="submit" disabled={loading || !prompt.trim()} className={`px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer transition-opacity ${loading || !prompt.trim() ? "opacity-40" : "hover:bg-[#7059be]"}`}>
              {loading ? "Generando..." : "Generar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
