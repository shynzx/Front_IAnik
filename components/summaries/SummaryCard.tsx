"use client";

import { useState } from "react";
import { pp, Summary } from "../../types";
import KeyPoint from "./KeyPoint";

export default function SummaryCard({ summary, onView, onDelete, onCopy }: { summary: Summary; onView: () => void; onDelete: () => void; onCopy: () => void; }) {
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
      <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12, boxSizing: "border-box" }}>
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
      style={{ padding: "16px 18px", borderRadius: 14, background: hovered ? "rgba(130,109,210,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${hovered ? "rgba(130,109,210,0.25)" : "rgba(255,255,255,0.07)"}`, cursor: "pointer", transition: "all .15s", display: "flex", flexDirection: "column", gap: 12, boxSizing: "border-box" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...pp, fontWeight: 500, fontSize: 16, color: "#fff", margin: "0 0 8px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {summary.title || "Resumen sin título"}
          </p>
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
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button aria-label="Copiar al portapapeles" onClick={handleCopy} style={{ color: copied ? "#826dd2" : "rgba(255,255,255,0.35)", background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, lineHeight: 0, transition: "color .15s" }}>
            {copied ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>}
          </button>
          <button aria-label="Eliminar resumen" onClick={onDelete} style={{ color: "rgba(255,255,255,0.35)", background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, lineHeight: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" /><path d="M19 6l-1 14a2 2 0 01-2-2H8a2 2 0 01-2-2L5 6" /></svg>
          </button>
        </div>
      </div>
      {summary.content && (
        <p style={{ ...pp, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: "20px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {summary.content}
        </p>
      )}
      {summary.keyPoints && summary.keyPoints.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {summary.keyPoints.slice(0, 3).map((kp, i) => (
            <KeyPoint key={`${kp}-${i}`} text={kp} />
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
