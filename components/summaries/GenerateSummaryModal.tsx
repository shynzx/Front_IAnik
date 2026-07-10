import { useState } from "react";
import { pp } from "@/lib/constants";
import type { Doc } from "@/types";

export default function GenerateSummaryModal({ docs, onGenerate, onClose }: { docs: Doc[]; onGenerate: (selectedDocs: Doc[], title: string, prompt: string) => void; onClose: () => void; }) {
  const availableDocs = docs.filter((d) => !d.loading && d.content?.trim());
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(availableDocs.length > 0 ? [availableDocs[0].id] : []);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const canGenerate = selectedDocIds.length > 0 && title.trim().length > 0 && prompt.trim().length > 0;

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (!canGenerate || generating) return;
    setGenerating(true);
    try {
      const selectedDocsData = availableDocs.filter(d => selectedDocIds.includes(d.id));
      await onGenerate(selectedDocsData, title.trim(), prompt.trim());
      onClose();
    } catch {
      // silently handle (endpoint may not exist)
    } finally {
      setGenerating(false);
      setTitle("");
      setPrompt("");
    }
  };

  const inputStyle: React.CSSProperties = {
    ...pp, fontSize: "0.8125rem", width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.625rem", color: "#fff", padding: "0.625rem 0.75rem", outline: "none", boxSizing: "border-box", caretColor: "#826dd2",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(0.875rem)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", boxSizing: "border-box" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 520, background: "rgba(10,6,24,0.98)", border: "1px solid rgba(130,109,210,0.3)", borderRadius: "1.25rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", boxShadow: "0 1.5rem 5rem rgba(0,0,0,0.8)", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <p style={{ ...pp, fontWeight: 500, fontSize: "1rem", color: "#fff", margin: 0 }}>Configurar nuevo resumen</p>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: "0.25rem", lineHeight: 0 }}>
            <svg width="1.125rem" height="1.125rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4375rem" }}>
          <label style={{ ...pp, fontSize: "0.6875rem", letterSpacing: "0.05rem", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Título del resumen</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Síntesis de Seguridad Informática..." style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4375rem" }}>
          <label style={{ ...pp, fontSize: "0.6875rem", letterSpacing: "0.05rem", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Selecciona los archivos</label>
          {availableDocs.length === 0 ? (
            <p style={{ ...pp, fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", margin: 0, padding: "0.625rem 0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.625rem", border: "1px solid rgba(255,255,255,0.07)" }}>
              No hay documentos disponibles. Sube un archivo primero.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", maxHeight: "7.5rem", overflowY: "auto", padding: "0.25rem 0" }}>
              {availableDocs.map((d) => (
                <label key={d.id} style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer", background: selectedDocIds.includes(d.id) ? "rgba(130,109,210,0.15)" : "rgba(255,255,255,0.04)", padding: "0.5rem 0.75rem", borderRadius: "0.625rem", border: selectedDocIds.includes(d.id) ? "1px solid rgba(130,109,210,0.4)" : "1px solid rgba(255,255,255,0.1)", transition: "all .2s", boxSizing: "border-box" }}>
                  <input type="checkbox" checked={selectedDocIds.includes(d.id)} onChange={() => toggleDocSelection(d.id)} style={{ accentColor: "#826dd2", width: "1rem", height: "1rem", cursor: "pointer" }} />
                  <span style={{ ...pp, fontSize: "0.8125rem", color: selectedDocIds.includes(d.id) ? "#fff" : "rgba(255,255,255,0.7)" }}>{d.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4375rem" }}>
          <label style={{ ...pp, fontSize: "0.6875rem", letterSpacing: "0.05rem", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Indicaciones para el resumen</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ej: Haz un resumen completo integrando la información..." style={{ ...inputStyle, minHeight: "5.625rem", resize: "vertical", fontFamily: "inherit" }} />
        </div>
        <button onClick={handleGenerate} disabled={!canGenerate || generating || availableDocs.length === 0} style={{ ...pp, fontWeight: 500, fontSize: "0.875rem", padding: "0.75rem 0", borderRadius: "0.75rem", border: "none", background: canGenerate && !generating && availableDocs.length > 0 ? "#826dd2" : "rgba(255,255,255,0.06)", color: canGenerate && !generating && availableDocs.length > 0 ? "#fff" : "rgba(255,255,255,0.25)", cursor: canGenerate && !generating && availableDocs.length > 0 ? "pointer" : "not-allowed", transition: "all .18s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "0.25rem", boxSizing: "border-box" }}>
          {generating ? (
             <>
               <svg width="0.9375rem" height="0.9375rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                 <path d="M21 12a9 9 0 11-6.219-8.56" />
               </svg>
               Generando…
             </>
          ) : (
            <>
              <svg width="0.9375rem" height="0.9375rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Generar resumen
            </>
          )}
        </button>
      </div>
    </div>
  );
}
