import { useState } from "react";
import { pp, Summary } from "../../types";
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
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 720, maxHeight: "88vh", background: "rgba(10,6,24,0.97)", border: "1px solid rgba(130,109,210,0.3)", borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(130,109,210,0.1)", boxSizing: "border-box" }}>
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
          {summary.keyPoints && summary.keyPoints.length > 0 && (
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
