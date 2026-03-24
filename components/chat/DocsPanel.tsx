"use client";

import { useRef, useState } from "react";
import { Doc, pp, gradText } from "./tokens";
import DocIcon from "./DocIcon";


interface DocsPanelProps {
  docs: Doc[];
  docSearch: string;
  docsFullscreen: boolean;
  onSearchChange: (value: string) => void;
  onFullscreen: (value: boolean) => void;
  onClose: () => void;
  onFiles: (files: FileList | null) => void;
}

/* ── Document viewer modal ──────────────────────────────── */
function DocViewer({
  doc,
  onClose,
}: {
  doc: Doc;
  onClose: () => void;
}) {
  const hasContent = doc.content && doc.content.trim().length > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "85vh",
          background: "rgba(10,6,24,0.97)",
          border: "1px solid rgba(130,109,210,0.3)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(130,109,210,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <DocIcon type={doc.type} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                ...pp,
                fontWeight: 500,
                fontSize: 15,
                color: "#fff",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {doc.name}
            </p>
            {doc.size != null && (
              <p
                style={{
                  ...pp,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  margin: "2px 0 0",
                }}
              >
                {formatFileSize(doc.size)}
                {doc.uploadedAt &&
                  ` · ${doc.uploadedAt.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              color: "rgba(255,255,255,0.45)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 8,
              borderRadius: 8,
              flexShrink: 0,
              lineHeight: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
          }}
        >
          {hasContent ? (
            <pre
              style={{
                ...pp,
                fontSize: 14,
                lineHeight: "24px",
                color: "rgba(255,255,255,0.78)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              {doc.content}
            </pre>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                gap: 14,
                opacity: 0.45,
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3v4a1 1 0 001 1h4" />
                <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="13" y2="17" />
              </svg>
              <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
                No se pudo extraer el contenido de este archivo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function DocsPanel({
  docs,
  docSearch,
  docsFullscreen,
  onSearchChange,
  onFullscreen,
  onClose,
  onFiles,
}: DocsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Working search: filters by name AND content
  const filteredDocs = docs.filter((d) => {
    const q = docSearch.toLowerCase().trim();
    if (!q) return true;
    const inName = d.name.toLowerCase().includes(q);
    const inContent = d.content?.toLowerCase().includes(q) ?? false;
    return inName || inContent;
  });

  /* ── Fullscreen view ──────────────────────────────────── */
  if (docsFullscreen) {
    return (
      <>
        {selectedDoc && (
          <DocViewer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
        )}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(8,4,18,0.97)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            padding: "32px 40px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 32,
            }}
          >
            <div>
              <h2
                style={{
                  ...pp,
                  fontWeight: 400,
                  fontSize: 24,
                  ...gradText,
                  margin: 0,
                }}
              >
                Documentos
              </h2>
              {filteredDocs.length !== docs.length && (
                <p style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
                  {filteredDocs.length} de {docs.length} resultado{filteredDocs.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* Search input */}
              <div style={{ position: "relative" }}>
                <input
                  value={docSearch}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Buscar por nombre o contenido..."
                  style={{
                    ...pp,
                    fontSize: 13,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${searchFocused ? "rgba(130,109,210,0.5)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 10,
                    padding: "7px 36px 7px 12px",
                    color: "#fff",
                    outline: "none",
                    width: 240,
                    transition: "border-color .15s",
                  }}
                />
                {docSearch ? (
                  <button
                    onClick={() => onSearchChange("")}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.45)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                      lineHeight: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                ) : (
                  <svg
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.35)",
                      pointerEvents: "none",
                    }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                )}
              </div>

              {/* Minimize */}
              <button
                onClick={() => onFullscreen(false)}
                style={{
                  color: "rgba(255,255,255,0.5)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 8,
                  lineHeight: 0,
                }}
                title="Minimizar"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 9 9 9 9 5" />
                  <polyline points="15 19 15 15 19 15" />
                  <line x1="9" y1="9" x2="3" y2="3" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                </svg>
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                style={{
                  color: "rgba(255,255,255,0.5)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 8,
                  lineHeight: 0,
                }}
                title="Cerrar"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Empty search state */}
          {filteredDocs.length === 0 && docSearch && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                gap: 12,
                opacity: 0.5,
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                Sin resultados para "{docSearch}"
              </p>
            </div>
          )}

          {/* Grid */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
              paddingBottom: 80,
              alignContent: "start",
            }}
          >
            {filteredDocs.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                searchQuery={docSearch}
                onClick={() => setSelectedDoc(doc)}
              />
            ))}
          </div>

          {/* Bottom upload button */}
          <div style={{ position: "absolute", bottom: 24, right: 40 }}>
            <input
              type="file"
              ref={fileRef}
              style={{ display: "none" }}
              multiple
              accept=".pdf,.doc,.docx"
              onChange={(e) => onFiles(e.target.files)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                ...pp,
                fontWeight: 400,
                padding: "9px 24px",
                borderRadius: 10,
                background: "#826dd2",
                color: "#fff",
                border: "none",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Subir Archivos
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ── Compact sidebar panel ────────────────────────────── */
  return (
    <>
      {selectedDoc && (
        <DocViewer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
      <div
        className="docs-panel"
        style={{
          position: "fixed",
          left: 64,
          top: 0,
          height: "100vh",
          width: 264,
          background: "rgba(6,3,15,0.94)",
          backdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          zIndex: 45,
        }}
      >
        <style>{`
          @keyframes slideIn{from{transform:translateX(-16px);opacity:0}to{transform:translateX(0);opacity:1}}
          .docs-panel{animation:slideIn .18s ease}
          .doc-row:hover{background:rgba(255,255,255,0.05)!important}
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: "22px 16px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            flexShrink: 0,
          }}
        >
          <h2 style={{ ...pp, fontWeight: 400, fontSize: 17, ...gradText, margin: 0 }}>
            Documentos
          </h2>
          <div style={{ display: "flex", gap: 4 }}>
            {/* Expand */}
            <button
              onClick={() => onFullscreen(true)}
              style={{
                color: "rgba(255,255,255,0.4)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: 8,
                lineHeight: 0,
              }}
              title="Pantalla completa"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Inline search bar */}
        <div style={{ padding: "10px 10px 6px", flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <input
              value={docSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar documentos..."
              style={{
                ...pp,
                fontSize: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "6px 32px 6px 10px",
                color: "#fff",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                transition: "border-color .15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(130,109,210,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            {docSearch ? (
              <button
                onClick={() => onSearchChange("")}
                style={{
                  position: "absolute",
                  right: 7,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.4)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  lineHeight: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ) : (
              <svg
                style={{
                  position: "absolute",
                  right: 9,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.3)",
                  pointerEvents: "none",
                }}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </div>
          {docSearch && (
            <p style={{ ...pp, fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "4px 2px 0" }}>
              {filteredDocs.length} resultado{filteredDocs.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px" }}>
          {filteredDocs.length === 0 && docSearch ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 0",
                gap: 8,
                opacity: 0.4,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
                Sin resultados
              </p>
            </div>
          ) : (
            filteredDocs.slice(0, 6).map((doc) => (
              <div
                key={doc.id}
                className="doc-row"
                onClick={() => setSelectedDoc(doc)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 10px",
                  borderRadius: 10,
                  cursor: "pointer",
                  marginBottom: 2,
                  background: "transparent",
                  transition: "background .12s",
                }}
              >
                <DocIcon type={doc.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      ...pp,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.8)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                    }}
                  >
                    {highlightMatch(doc.name, docSearch)}
                  </span>
                  {doc.size != null && (
                    <span style={{ ...pp, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                      {formatFileSize(doc.size)}
                    </span>
                  )}
                </div>
                {/* Eye icon hint */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 12px 20px",
            display: "flex",
            gap: 8,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            flexShrink: 0,
          }}
        >
          {docs.length > 6 && (
            <button
              onClick={() => onFullscreen(true)}
              style={{
                ...pp,
                flex: 1,
                padding: "9px 0",
                borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.65)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Ver más ({docs.length - 6})
            </button>
          )}
          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            multiple
            accept=".pdf,.doc,.docx"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              ...pp,
              fontWeight: 400,
              flex: 1,
              padding: "9px 0",
              borderRadius: 10,
              background: "#826dd2",
              color: "#fff",
              border: "none",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Subir Archivos
          </button>
        </div>
      </div>
    </>
  );
}

/* ── DocCard (used in fullscreen grid) ──────────────────── */
function DocCard({
  doc,
  searchQuery,
  onClick,
}: {
  doc: Doc;
  searchQuery: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const preview = doc.content?.slice(0, 120).trim();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "14px 14px",
        borderRadius: 14,
        background: hovered ? "rgba(130,109,210,0.1)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? "rgba(130,109,210,0.3)" : "rgba(255,255,255,0.07)"}`,
        cursor: "pointer",
        transition: "all .15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <DocIcon type={doc.type} />
        <span
          style={{
            fontFamily: "var(--font-poppins), sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: "rgba(255,255,255,0.85)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {highlightMatch(doc.name, searchQuery)}
        </span>
      </div>

      {preview && (
        <p
          style={{
            fontFamily: "var(--font-poppins), sans-serif",
            fontWeight: 300,
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            margin: 0,
            lineHeight: "17px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {preview}…
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
        {doc.size != null && (
          <span style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            {formatFileSize(doc.size)}
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--font-poppins), sans-serif",
            fontWeight: 300,
            fontSize: 11,
            color: hovered ? "#826dd2" : "rgba(255,255,255,0.25)",
            marginLeft: "auto",
            transition: "color .15s",
          }}
        >
          Ver contenido →
        </span>
      </div>
    </div>
  );
}

/* ── Helper: highlight matching text ───────────────────── */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "rgba(130,109,210,0.45)",
          color: "#fff",
          borderRadius: 3,
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}