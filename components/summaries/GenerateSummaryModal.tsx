import { useState } from "react";
import { pp, Doc } from "../../types";

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
    } finally {
      setGenerating(false);
      setTitle("");
      setPrompt("");
    }
  };

  const inputStyle: React.CSSProperties = {
    ...pp, fontSize: 13, width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "10px 12px", outline: "none", boxSizing: "border-box", caretColor: "#826dd2",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 520, background: "rgba(10,6,24,0.98)", border: "1px solid rgba(130,109,210,0.3)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.8)", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{ ...pp, fontWeight: 500, fontSize: 16, color: "#fff", margin: 0 }}>Configurar nuevo resumen</p>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: 4, lineHeight: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <label style={{ ...pp, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Título del resumen</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Síntesis de Seguridad Informática..." style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <label style={{ ...pp, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Selecciona los archivos</label>
          {availableDocs.length === 0 ? (
            <p style={{ ...pp, fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
              No hay documentos disponibles. Sube un archivo primero.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 120, overflowY: "auto", padding: "4px 0" }}>
              {availableDocs.map((d) => (
                <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: selectedDocIds.includes(d.id) ? "rgba(130,109,210,0.15)" : "rgba(255,255,255,0.04)", padding: "8px 12px", borderRadius: 10, border: selectedDocIds.includes(d.id) ? "1px solid rgba(130,109,210,0.4)" : "1px solid rgba(255,255,255,0.1)", transition: "all .2s", boxSizing: "border-box" }}>
                  <input type="checkbox" checked={selectedDocIds.includes(d.id)} onChange={() => toggleDocSelection(d.id)} style={{ accentColor: "#826dd2", width: 16, height: 16, cursor: "pointer" }} />
                  <span style={{ ...pp, fontSize: 13, color: selectedDocIds.includes(d.id) ? "#fff" : "rgba(255,255,255,0.7)" }}>{d.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <label style={{ ...pp, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Indicaciones para el resumen</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ej: Haz un resumen completo integrando la información..." style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "inherit" }} />
        </div>
        <button onClick={handleGenerate} disabled={!canGenerate || generating || availableDocs.length === 0} style={{ ...pp, fontWeight: 500, fontSize: 14, padding: "12px 0", borderRadius: 12, border: "none", background: canGenerate && !generating && availableDocs.length > 0 ? "#826dd2" : "rgba(255,255,255,0.06)", color: canGenerate && !generating && availableDocs.length > 0 ? "#fff" : "rgba(255,255,255,0.25)", cursor: canGenerate && !generating && availableDocs.length > 0 ? "pointer" : "not-allowed", transition: "all .18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, boxSizing: "border-box" }}>
          {generating ? (
             <>
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                 <path d="M21 12a9 9 0 11-6.219-8.56" />
               </svg>
               Generando…
             </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
