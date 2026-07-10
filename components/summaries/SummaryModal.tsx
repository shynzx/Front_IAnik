import { useState } from "react";
import { pp } from "@/lib/constants";
import type { Summary } from "@/types";
import KeyPoint from "./KeyPoint";

export default function SummaryModal({ summary, onClose }: { summary: Summary; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${summary.title || "Resumen"}\nDocumentos: ${summary.docName}\n\n${summary.content}\n\nConceptos clave:\n${(summary.keyPoints || []).map((k) => `• ${k}`).join("\n")}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `${summary.title || "Resumen"}\nDocumentos: ${summary.docName}\nFecha: ${summary.createdAt.toLocaleDateString("es-ES")}\n\n${"─".repeat(50)}\n\n${summary.content}\n\n${"─".repeat(50)}\n\nCONCEPTOS CLAVE:\n${(summary.keyPoints || []).map((k) => `• ${k}`).join("\n")}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumen-${(summary.title || "archivo").replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", boxSizing: "border-box" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 720, maxHeight: "88vh", background: "rgba(10,6,24,0.97)", border: "1px solid rgba(130,109,210,0.3)", borderRadius: "1.25rem", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 1.5rem 5rem rgba(0,0,0,0.7), 0 0 0 1px rgba(130,109,210,0.1)", boxSizing: "border-box" }}>
        <div style={{ padding: "1.125rem 1.375rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", gap: "0.75rem", flexShrink: 0 }}>
          <div style={{ width: "2.375rem", height: "2.375rem", borderRadius: "50%", background: "linear-gradient(135deg,#826dd2,#4f3fa0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="1.125rem" height="1.125rem" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 001 1h4" /><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...pp, fontWeight: 500, fontSize: "1rem", color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {summary.title || "Resumen sin título"}
            </p>
            <p style={{ ...pp, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", margin: "0.25rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Archivos: {summary.docName} · {summary.createdAt.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
            <button onClick={handleCopy} title="Copiar" style={{ ...pp, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3125rem", padding: "0.375rem 0.75rem", borderRadius: "0.5625rem", border: "1px solid rgba(255,255,255,0.12)", background: copied ? "rgba(130,109,210,0.2)" : "transparent", color: copied ? "#c4b5fd" : "rgba(255,255,255,0.55)", cursor: "pointer", transition: "all .15s" }}>
              {copied ? <>Copiado</> : <>Copiar</>}
            </button>
            <button onClick={handleDownload} title="Descargar" style={{ ...pp, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3125rem", padding: "0.375rem 0.75rem", borderRadius: "0.5625rem", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.55)", cursor: "pointer" }}>
              Descargar
            </button>
            <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: "0.4375rem", borderRadius: "0.5rem", lineHeight: 0 }}>
              <svg width="1.125rem" height="1.125rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {summary.keyPoints && summary.keyPoints.length > 0 && (
            <div>
              <p style={{ ...pp, fontSize: "0.6875rem", letterSpacing: "0.0625rem", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 0.625rem" }}>Conceptos clave</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {summary.keyPoints.map((kp, i) => <KeyPoint key={i} text={kp} />)}
              </div>
            </div>
          )}
          <div style={{ height: 1, background: "linear-gradient(90deg, rgba(130,109,210,0.3) 0%, transparent 100%)" }} />
          <div>
            <p style={{ ...pp, fontSize: "0.6875rem", letterSpacing: "0.0625rem", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 0.875rem" }}>Resumen</p>
            <p style={{ ...pp, fontSize: "0.9375rem", lineHeight: "1.75rem", color: "rgba(255,255,255,0.82)", margin: 0, whiteSpace: "pre-wrap" }}>
              {summary.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
