"use client";

import { useRef, useState, useEffect, FormEvent } from "react";

export type Attachment = {
  id: string;
  file: File;
  kind: "image" | "document";
  preview?: string;
  name: string;
};

interface ChatInputProps {
  value: string;
  loading: boolean;
  typing: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent, attachments: Attachment[]) => void;
  onFiles?: (files: FileList | null) => void; // solo para el panel de docs, NO se llama desde aquí
}

export default function ChatInput({
  value,
  loading,
  typing,
  onChange,
  onSubmit,
  onFiles,
}: ChatInputProps) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const menuRef  = useRef<HTMLDivElement>(null);
  const clipRef  = useRef<HTMLButtonElement>(null);

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const canSend = !loading && !typing && (value.trim() || attachments.length > 0);

  /* Close menu on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        clipRef.current && !clipRef.current.contains(e.target as Node)
      ) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  /* Revoke preview URLs on unmount */
  useEffect(() => {
    return () => attachments.forEach(a => a.preview && URL.revokeObjectURL(a.preview));
  }, []);

  /* ── Add files — SOLO adjunta al mensaje, NO toca el panel de documentos ── */
  const addFiles = (files: FileList | null, kind: "image" | "document") => {
    if (!files) return;
    const next: Attachment[] = Array.from(files).map(file => ({
      id:      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      kind,
      name:    file.name,
      preview: kind === "image" ? URL.createObjectURL(file) : undefined,
    }));
    setAttachments(prev => [...prev, ...next]);
    setMenuOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const a = prev.find(x => x.id === id);
      if (a?.preview) URL.revokeObjectURL(a.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  /* ── Submit ── */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    onSubmit(e, attachments);
    setAttachments([]);
  };

  const fileExt = (name: string) =>
    name.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE";

  return (
    <div style={{ width: "100%" }}>
      <style>{`
        @keyframes attachMenuIn {
          from { opacity:0; transform:translateY(8px) scale(.96); }
          to   { opacity:1; transform:translateY(0)   scale(1);   }
        }
        @keyframes chipIn {
          from { opacity:0; transform:scale(.85); }
          to   { opacity:1; transform:scale(1);   }
        }
        .attach-opt:hover { background:rgba(130,109,210,0.13)!important; }
        .attach-opt:hover .attach-opt-label { color:#fff!important; }
        .chip-remove:hover { background:rgba(255,255,255,0.22)!important; }
        .send-btn:hover:not(:disabled) { background:#9c88e0!important; }
        .clip-btn:hover { color:#826dd2!important; background:rgba(130,109,210,0.1)!important; }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: attachments.length ? "8px 8px 6px 6px" : "8px 8px 8px 6px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            position: "relative",
            gap: 0,
          }}
        >

          {/* ── Chips row ── */}
          {attachments.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                padding: "2px 6px 8px 42px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 4,
              }}
            >
              {attachments.map(a => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(130,109,210,0.14)",
                    border: "1px solid rgba(130,109,210,0.3)",
                    borderRadius: 10,
                    padding: "3px 8px 3px 4px",
                    animation: "chipIn .15s ease",
                    maxWidth: 200,
                    minWidth: 0,
                  }}
                >
                  {/* Image thumbnail */}
                  {a.kind === "image" && a.preview && (
                    <img
                      src={a.preview}
                      alt={a.name}
                      style={{
                        width: 34, height: 34, borderRadius: 7,
                        objectFit: "cover", flexShrink: 0, display: "block",
                      }}
                    />
                  )}

                  {/* Document badge — minimal dark style matching project standard */}
                  {a.kind === "document" && (
                    <span
                      style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: "rgba(130,109,210,0.12)",
                        border: "1px solid rgba(130,109,210,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3v4a1 1 0 001 1h4" />
                        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                        <line x1="9" y1="17" x2="13" y2="17" />
                      </svg>
                    </span>
                  )}

                  <span
                    style={{
                      fontFamily: "var(--font-poppins), sans-serif",
                      fontWeight: 300, fontSize: 12,
                      color: "rgba(255,255,255,0.8)",
                      overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", maxWidth: 110,
                    }}
                  >
                    {a.name}
                  </span>

                  <button
                    type="button"
                    aria-label="Eliminar archivo adjunto"
                    onClick={() => removeAttachment(a.id)}
                    style={{
                      width: 16, height: 16, borderRadius: 4,
                      background: "rgba(255,255,255,0.1)", border: "none",
                      cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      flexShrink: 0, padding: 0, transition: "background .12s",
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6"  x2="6"  y2="18" />
                      <line x1="6"  y1="6"  x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Main row ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

            {/* Clip / attach button */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                ref={clipRef}
                type="button"
                aria-label="Adjuntar archivos"
                onClick={() => setMenuOpen(v => !v)}
                style={{
                  color: menuOpen ? "#826dd2" : "rgba(255,255,255,0.35)",
                  background: menuOpen ? "rgba(130,109,210,0.12)" : "transparent",
                  border: "none", cursor: "pointer",
                  padding: 8, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "color .15s, background .15s",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              {/* ── Dropdown menu ── */}
              {menuOpen && (
                <div
                  ref={menuRef}
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 10px)",
                    left: 0,
                    background: "rgba(14,8,30,0.97)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14,
                    padding: 6,
                    minWidth: 300,
                    boxShadow: "0 12px 400px rgba(0,0,0,0.6), 0 0 0 1px rgba(130,109,210,0.15)",
                    zIndex: 100,
                    animation: "attachMenuIn .15s ease",
                  }}
                >
                  <button
                    type="button"
                    aria-label="Agregar foto"
                    onClick={() => photoRef.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", gap: 11,
                      width: "100%", padding: "9px 12px", borderRadius: 9,
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300, fontSize: 14,
                      textAlign: "left", transition: "background .12s, color .12s",
                    }}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: "rgba(130,109,210,0.12)",
                      border: "1px solid rgba(130,109,210,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </span>
                    Agregar foto
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300 }}>
                      JPG, PNG, GIF
                    </span>
                  </button>

                  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "3px 6px" }} />

                  <button
                    type="button"
                    aria-label="Agregar archivo"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", gap: 11,
                      width: "100%", padding: "9px 12px", borderRadius: 9,
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300, fontSize: 14,
                      textAlign: "left", transition: "background .12s, color .12s",
                    }}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: "rgba(130,109,210,0.12)",
                      border: "1px solid rgba(130,109,210,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3v4a1 1 0 001 1h4" />
                        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                        <line x1="9" y1="17" x2="13" y2="17" />
                      </svg>
                    </span>
                    Agregar archivo
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300 }}>
                      PDF, DOC
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Text input */}
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) handleSubmit(e as unknown as FormEvent);
                }
              }}
              placeholder={attachments.length ? "Añade un mensaje..." : "Escribe tu mensaje a IAnik"}
              disabled={loading || typing}
              style={{
                flex: 1,
                background: "transparent", border: "none", outline: "none",
                fontFamily: "var(--font-poppins), sans-serif",
                fontWeight: 300, fontSize: 15,
                color: "#fff", padding: "6px 0",
                caretColor: "#826dd2",
              }}
            />

            {/* Count badge */}
            {attachments.length > 0 && (
              <span style={{
                flexShrink: 0,
                background: "#826dd2", color: "#fff",
                borderRadius: 20, fontSize: 11,
                fontFamily: "var(--font-poppins), sans-serif",
                fontWeight: 500, padding: "2px 7px", letterSpacing: 0.2,
              }}>
                {attachments.length}
              </span>
            )}

            <button
              type="submit"
              aria-label="Enviar mensaje"
              disabled={!canSend}
              style={{
                padding: 10, borderRadius: 10, flexShrink: 0,
                border: "none",
                cursor: canSend ? "pointer" : "not-allowed",
                background: canSend ? "#826dd2" : "rgba(255,255,255,0.05)",
                color: canSend ? "#fff" : "rgba(255,255,255,0.2)",
                transition: "all .15s",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" y1="14" x2="21" y2="3" />
                <path d="M21 3L14.5 21a.55.55 0 01-1 0L10 14l-7-3.5a.55.55 0 010-1L21 3" />
              </svg>
            </button>
          </div>
        </div>
      </form>

      {/* Hidden file inputs — these feed ONLY the message attachments */}
      <input
        type="file" ref={photoRef} style={{ display: "none" }}
        multiple accept="image/*"
        onChange={(e) => addFiles(e.target.files, "image")}
      />
      <input
        type="file" ref={fileRef} style={{ display: "none" }}
        multiple accept=".pdf,.doc,.docx"
        onChange={(e) => addFiles(e.target.files, "document")}
      />
    </div>
  );
}