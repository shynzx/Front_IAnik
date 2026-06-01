"use client";

import { useState } from "react";
import { pp, gradText, Doc, Summary } from "../chat/tokens";
import Sidebar from "../chat/Sidebar";
import AuthButtons from "../chat/AuthButtons";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
interface SummaryScreenProps {
  docs: Doc[];
  summaries: Summary[];
  onGenerateSummary: (
    selectedDocs: Doc[], // <- AHORA RECIBE UN ARREGLO DE DOCUMENTOS
    title: string,
    prompt: string
  ) => Promise<string | null>;
  onDeleteSummary: (id: string) => void;
  onGoLogin: () => void;
  onGoRegister: () => void;
  onChatClick: () => void;
  onDocsClick: () => void;
  docsOpen: boolean;
}

const SIDEBAR_W = 64;

/* ─────────────────────────────────────────────────────────────
   Key‑point badge
───────────────────────────────────────────────────────────── */
function KeyPoint({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 20,
        background: "rgba(130,109,210,0.12)",
        border: "1px solid rgba(130,109,210,0.25)",
        fontSize: 12,
        ...pp,
        color: "#c4b5fd",
        lineHeight: "18px",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#826dd2", flexShrink: 0, display: "inline-block" }} />
      {text}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Summary card (in the list)
───────────────────────────────────────────────────────────── */
function SummaryCard({
  summary,
  onView,
  onDelete,
  onCopy,
}: {
  summary: Summary;
  onView: () => void;
  onDelete: () => void;
  onCopy: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (summary.loading) {
    return (
      <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
        <div>
          <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 500 }}>
            Generando: <span style={{ color: "#fff" }}>{summary.title || "Nuevo resumen"}</span>…
          </p>
          <p style={{ ...pp, fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "3px 0 0" }}>
            Archivos: {summary.docName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: "16px 18px", borderRadius: 14, background: hovered ? "rgba(130,109,210,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${hovered ? "rgba(130,109,210,0.25)" : "rgba(255,255,255,0.07)"}`, cursor: "pointer", transition: "all .15s", display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* TÍTULO ARRIBA Y DESTACADO */}
          <p style={{ ...pp, fontWeight: 500, fontSize: 16, color: "#fff", margin: "0 0 8px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {summary.title || "Resumen sin título"}
          </p>
          
          {/* ARCHIVOS DEBAJO DEL TÍTULO */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {summary.docName.split(',').map((name, idx) => (
              <span key={idx} style={{ ...pp, fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(130,109,210,0.15)", color: "#a78bfa", whiteSpace: "nowrap" }}>
                {name.trim()}
              </span>
            ))}
            <span style={{ ...pp, fontSize: 11, color: "rgba(255,255,255,0.28)", marginLeft: 4 }}>
              {summary.createdAt.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button onClick={handleCopy} title={copied ? "¡Copiado!" : "Copiar al portapapeles"} style={{ color: copied ? "#826dd2" : "rgba(255,255,255,0.35)", background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, lineHeight: 0, transition: "color .15s" }}>
            {copied ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>}
          </button>
          <button onClick={onDelete} title="Eliminar resumen" style={{ color: "rgba(255,255,255,0.35)", background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, lineHeight: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
          </button>
        </div>
      </div>

      {summary.content && (
        <p style={{ ...pp, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: "20px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {summary.content}
        </p>
      )}

      {summary.keyPoints.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {summary.keyPoints.slice(0, 3).map((kp, i) => (
            <KeyPoint key={i} text={kp} />
          ))}
          {summary.keyPoints.length > 3 && (
            <span style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "4px 10px", alignSelf: "center" }}>
              +{summary.keyPoints.length - 3} más
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Summary detail modal
───────────────────────────────────────────────────────────── */
function SummaryModal({ summary, onClose }: { summary: Summary; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${summary.title || "Resumen"}\nDocumentos: ${summary.docName}\n\n${summary.content}\n\nConceptos clave:\n${summary.keyPoints.map((k) => `• ${k}`).join("\n")}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `${summary.title || "Resumen"}\nDocumentos: ${summary.docName}\nFecha: ${summary.createdAt.toLocaleDateString("es-ES")}\n\n${"─".repeat(50)}\n\n${summary.content}\n\n${"─".repeat(50)}\n\nCONCEPTOS CLAVE:\n${summary.keyPoints.map((k) => `• ${k}`).join("\n")}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumen-${(summary.title || "archivo").replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 720, maxHeight: "88vh", background: "rgba(10,6,24,0.97)", border: "1px solid rgba(130,109,210,0.3)", borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(130,109,210,0.1)" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#826dd2,#4f3fa0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 001 1h4" /><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...pp, fontWeight: 500, fontSize: 16, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {summary.title || "Resumen sin título"}
            </p>
            <p style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Archivos: {summary.docName} · {summary.createdAt.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={handleCopy} title="Copiar" style={{ ...pp, fontSize: 12, display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.12)", background: copied ? "rgba(130,109,210,0.2)" : "transparent", color: copied ? "#c4b5fd" : "rgba(255,255,255,0.55)", cursor: "pointer", transition: "all .15s" }}>
              {copied ? <>Copiado</> : <>Copiar</>}
            </button>
            <button onClick={handleDownload} title="Descargar" style={{ ...pp, fontSize: 12, display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.55)", cursor: "pointer" }}>
              Descargar
            </button>
            <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: 7, borderRadius: 8, lineHeight: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
          {summary.keyPoints.length > 0 && (
            <div>
              <p style={{ ...pp, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 10px" }}>Conceptos clave</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {summary.keyPoints.map((kp, i) => <KeyPoint key={i} text={kp} />)}
              </div>
            </div>
          )}
          <div style={{ height: 1, background: "linear-gradient(90deg, rgba(130,109,210,0.3) 0%, transparent 100%)" }} />
          <div>
            <p style={{ ...pp, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 14px" }}>Resumen</p>
            <p style={{ ...pp, fontSize: 15, lineHeight: "28px", color: "rgba(255,255,255,0.82)", margin: 0, whiteSpace: "pre-wrap" }}>
              {summary.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Ventana emergente para generación de Resúmenes (Múltiples archivos)
───────────────────────────────────────────────────────────── */
function GenerateSummaryModal({
  docs,
  onGenerate,
  onClose,
}: {
  docs: Doc[];
  onGenerate: (selectedDocs: Doc[], title: string, prompt: string) => void;
  onClose: () => void;
}) {
  const availableDocs = docs.filter((d) => !d.loading && d.content?.trim());
  
  // AHORA ES UN ARREGLO PARA PERMITIR SELECCIÓN MÚLTIPLE
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    availableDocs.length > 0 ? [availableDocs[0].id] : []
  );
  
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const canGenerate = selectedDocIds.length > 0 && title.trim().length > 0 && prompt.trim().length > 0;

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds((prev) => 
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!canGenerate || generating) return;
    setGenerating(true);
    try {
      // Pasamos los objetos Doc completos que el usuario seleccionó
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
    <div 
      style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 520, background: "rgba(10,6,24,0.98)", border: "1px solid rgba(130,109,210,0.3)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{ ...pp, fontWeight: 500, fontSize: 16, color: "#fff", margin: 0 }}>
            Configurar nuevo resumen
          </p>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: 4, lineHeight: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Nombre del Resumen */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <label style={{ ...pp, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Título del resumen</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Síntesis de Seguridad Informática..." style={inputStyle} />
        </div>

        {/* Selector de Documentos (Múltiple) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <label style={{ ...pp, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Selecciona los archivos</label>
          {availableDocs.length === 0 ? (
            <p style={{ ...pp, fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
              No hay documentos disponibles. Sube un archivo primero.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 120, overflowY: "auto", padding: "4px 0" }}>
              {availableDocs.map((d) => (
                <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: selectedDocIds.includes(d.id) ? "rgba(130,109,210,0.15)" : "rgba(255,255,255,0.04)", padding: "8px 12px", borderRadius: 10, border: selectedDocIds.includes(d.id) ? "1px solid rgba(130,109,210,0.4)" : "1px solid rgba(255,255,255,0.1)", transition: "all .2s" }}>
                  <input 
                    type="checkbox" 
                    checked={selectedDocIds.includes(d.id)} 
                    onChange={() => toggleDocSelection(d.id)} 
                    style={{ accentColor: "#826dd2", width: 16, height: 16, cursor: "pointer" }} 
                  />
                  <span style={{ ...pp, fontSize: 13, color: selectedDocIds.includes(d.id) ? "#fff" : "rgba(255,255,255,0.7)" }}>
                    {d.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Indicaciones / Prompt */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <label style={{ ...pp, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Indicaciones para el resumen</label>
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Ej: Haz un resumen completo integrando la información de todos los archivos seleccionados..." 
            style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "inherit" }} 
          />
        </div>

        {/* Botón de envío */}
        <button onClick={handleGenerate} disabled={!canGenerate || generating || availableDocs.length === 0} style={{ ...pp, fontWeight: 500, fontSize: 14, padding: "12px 0", borderRadius: 12, border: "none", background: canGenerate && !generating && availableDocs.length > 0 ? "#826dd2" : "rgba(255,255,255,0.06)", color: canGenerate && !generating && availableDocs.length > 0 ? "#fff" : "rgba(255,255,255,0.25)", cursor: canGenerate && !generating && availableDocs.length > 0 ? "pointer" : "not-allowed", transition: "all .18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
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

/* ─────────────────────────────────────────────────────────────
   Main SummaryScreen 
───────────────────────────────────────────────────────────── */
export default function SummaryScreen({
  docs,
  summaries,
  onGenerateSummary,
  onDeleteSummary,
  onGoLogin,
  onGoRegister,
  onChatClick,
  onDocsClick,
  docsOpen,
}: SummaryScreenProps) {
  const [viewingSummary, setViewingSummary] = useState<Summary | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const handleCopy = (summary: Summary) => {
    const text = `${summary.title || "Resumen"}\nDocumentos: ${summary.docName}\n\n${summary.content}\n\nConceptos clave:\n${summary.keyPoints.map((k) => `• ${k}`).join("\n")}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sum-scroll::-webkit-scrollbar { width: 5px; }
        .sum-scroll::-webkit-scrollbar-track { background: transparent; }
        .sum-scroll::-webkit-scrollbar-thumb { background: rgba(130,109,210,0.3); border-radius: 99px; }
      `}</style>

      {viewingSummary && (
        <SummaryModal summary={viewingSummary} onClose={() => setViewingSummary(null)} />
      )}

      {isGenerateOpen && (
        <GenerateSummaryModal docs={docs} onGenerate={onGenerateSummary} onClose={() => setIsGenerateOpen(false)} />
      )}

      <div style={{ height: "100vh", width: "100vw", overflow: "hidden", background: "linear-gradient(135deg, #000000 0%, #3c2850 100%)", display: "flex", fontFamily: "var(--font-poppins), sans-serif", position: "relative" }}>
        <Sidebar phase="chat" docsOpen={docsOpen} docsFullscreen={false} hasMessages={false} onChatClick={onChatClick} onDocsClick={onDocsClick} activePage="summaries" />

        <main style={{ marginLeft: SIDEBAR_W, width: `calc(100% - ${SIDEBAR_W}px)`, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 12, zIndex: 40 }}>
            <AuthButtons onGoLogin={onGoLogin} onGoRegister={onGoRegister} />
          </div>

          <div style={{ flex: 1, display: "flex", overflow: "hidden", paddingTop: 68 }}>
            <div className="sum-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 40px 32px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
              
              <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <div>
                  <h1 style={{ ...pp, fontWeight: 400, fontSize: 26, ...gradText, margin: "0 0 6px" }}>Resúmenes</h1>
                  <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.38)", margin: 0 }}>Gestiona y crea las síntesis guiadas por inteligencia artificial.</p>
                </div>
                
                <button 
                  onClick={() => setIsGenerateOpen(true)}
                  style={{ ...pp, fontWeight: 500, fontSize: 14, padding: "10px 22px", borderRadius: 12, border: "none", background: "#826dd2", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background .2s, transform .1s", boxShadow: "0 4px 20px rgba(130,109,210,0.25)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#7059be"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#826dd2"}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generar resúmenes
                </button>
              </div>

              {summaries.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 14, padding: "60px 0", opacity: 0.5 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 001 1h4" /><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>
                  <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", margin: 0 }}>
                    Aún no tienes resúmenes. ¡Haz clic en "Generar resúmenes" para empezar!
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {summaries.map((s) => (
                    <SummaryCard key={s.id} summary={s} onView={() => !s.loading && setViewingSummary(s)} onDelete={() => onDeleteSummary(s.id)} onCopy={() => handleCopy(s)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}