"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Msg, MsgAttachment, gradText } from "./tokens";
import Typewriter from "./Typewriter";
import ChatReadyBanner from "./ChatReadyBanner";

interface MessageListProps {
  messages: Msg[];
  loading: boolean;
  onTypingComplete: () => void;
  onEditMessage: (index: number, newContent: string) => void;
}

/* ── Attachment preview inside a user bubble ── */
function AttachmentList({ attachments }: { attachments: MsgAttachment[] }) {
  if (!attachments.length) return null;
  const images = attachments.filter(a => a.kind === "image");
  const docs   = attachments.filter(a => a.kind === "document");
  const fileExt = (name: string) => name.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 6 }}>
      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: images.length === 1 ? "1fr" : "repeat(2, 1fr)", gap: 4, borderRadius: 10, overflow: "hidden" }}>
          {images.map(img => (
            <img key={img.id} src={img.preview} alt={img.name} style={{ width: "100%", maxWidth: images.length === 1 ? 260 : 120, height: images.length === 1 ? 180 : 90, objectFit: "cover", borderRadius: 10, display: "block" }} />
          ))}
        </div>
      )}
      {docs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {docs.map(doc => (
            <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "4px 10px 4px 7px" }}>
              <span style={{ width: 24, height: 24, borderRadius: 5, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#fff", letterSpacing: 0.3, flexShrink: 0 }}>
                {fileExt(doc.name)}
              </span>
              <span style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300, fontSize: 12, color: "rgba(255,255,255,0.9)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {doc.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Burbuja de usuario ── */
function UserBubble({
  message,
  flatIndex,
  isEditing,       // controlado desde el padre
  anyEditing,      // true si CUALQUIER burbuja está en modo edición
  onStartEdit,
  onCancelEdit,
  onEditMessage,
}: {
  message: Msg;
  flatIndex: number;
  isEditing: boolean;
  anyEditing: boolean;
  onStartEdit: (index: number) => void;
  onCancelEdit: () => void;
  onEditMessage: (index: number, newContent: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [draft,   setDraft]   = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasText        = message.content.trim().length > 0;
  const canEdit        = hasText || hasAttachments;

  // Sincronizar draft cuando el mensaje cambia desde afuera
  useEffect(() => { setDraft(message.content); }, [message.content]);

  // Focus y resize al entrar en modo edición
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const confirmEdit = () => {
    if (!draft.trim() || draft.trim() === message.content.trim()) {
      onCancelEdit();
      return;
    }
    onCancelEdit(); // cierra primero
    onEditMessage(flatIndex, draft.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); confirmEdit(); }
    if (e.key === "Escape") onCancelEdit();
  };

  const pp = { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300 as const };

  return (
    <div
      style={{
        position: "relative",
        marginLeft: "auto",
        marginBottom: 12,
        maxWidth: "85%",
        paddingLeft: 44,
      }}
      // Solo activar hover si ningún mensaje está siendo editado
      onMouseEnter={() => { if (!anyEditing) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Botón editar — visible solo con hover y sin ninguna edición activa */}
      {hovered && !anyEditing && canEdit && (
        <button
          onClick={() => { setHovered(false); onStartEdit(flatIndex); }}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: 6,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
            transition: "all .15s",
            zIndex: 10,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(130,109,210,0.2)";
            (e.currentTarget as HTMLButtonElement).style.color = "#826dd2";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(130,109,210,0.4)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)";
          }}
          title="Editar mensaje"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}

      {/* Burbuja */}
      <div
        style={{
          padding: hasAttachments && !hasText ? "10px 13px" : "13px 17px",
          borderRadius: "18px 18px 4px 18px",
          background: "#826dd2",
          fontFamily: "var(--font-poppins), sans-serif",
          fontWeight: 300,
          fontSize: 16,
          lineHeight: "28px",
        }}
      >
        {hasAttachments && <AttachmentList attachments={message.attachments!} />}

        {isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={e => {
                setDraft(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{
                ...pp,
                fontSize: 16,
                lineHeight: "26px",
                color: "#fff",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 10,
                padding: "6px 10px",
                outline: "none",
                resize: "none",
                width: "100%",
                minWidth: 180,
                boxSizing: "border-box",
                overflowY: "hidden",
              }}
            />
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button
                onClick={onCancelEdit}
                style={{ ...pp, fontSize: 12, padding: "4px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.65)", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmEdit}
                style={{ ...pp, fontSize: 12, padding: "4px 14px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.22)", color: "#fff", cursor: "pointer", fontWeight: 500 }}
              >
                Enviar
              </button>
            </div>
          </div>
        ) : (
          hasText && <span style={{ color: "#fff" }}>{message.content}</span>
        )}
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function MessageList({
  messages,
  loading,
  onTypingComplete,
  onEditMessage,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Un solo índice controla qué mensaje está en edición; null = ninguno
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const scrollToBottom = useCallback(
    () => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }),
    []
  );

  useEffect(() => scrollToBottom(), [messages, loading, scrollToBottom]);

  // Cerrar edición si llegan mensajes nuevos (p.ej. después de enviar)
  useEffect(() => { setEditingIndex(null); }, [messages.length]);

  const lastAiIndex = messages.reduce(
    (last, m, i) => (m.role === "ai" ? i : last),
    -1
  );

  const displayGroups = messages.reduce((acc, m) => {
    if (m.role === "user" || !acc.length) acc.push([]);
    acc[acc.length - 1].push(m);
    return acc;
  }, [] as Msg[][]);

  let flatIndex = -1;

  return (
    <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", paddingBottom: 32 }}>
      {displayGroups.length === 0 && <ChatReadyBanner />}

      {displayGroups.map((group, gi) => (
        <div key={gi} style={{ width: "100%", display: "flex", flexDirection: "column", marginBottom: 24 }}>
          {group.map((m, i) => {
            flatIndex++;
            const currentFlatIndex = flatIndex;
            const isLastAi = m.role === "ai" && currentFlatIndex === lastAiIndex;

            if (m.role === "user") {
              return (
                <UserBubble
                  key={i}
                  message={m}
                  flatIndex={currentFlatIndex}
                  isEditing={editingIndex === currentFlatIndex}
                  anyEditing={editingIndex !== null}
                  onStartEdit={(idx) => setEditingIndex(idx)}
                  onCancelEdit={() => setEditingIndex(null)}
                  onEditMessage={(idx, content) => {
                    setEditingIndex(null);
                    onEditMessage(idx, content);
                  }}
                />
              );
            }

            return (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  padding: m.role === "sys" ? "5px 16px" : "13px 17px",
                  borderRadius: m.role === "sys" ? 999 : "18px 18px 18px 4px",
                  maxWidth: "85%",
                  width: "fit-content",
                  marginLeft: m.role === "sys" ? "auto" : undefined,
                  marginRight: m.role === "sys" ? 0 : undefined,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(8px)",
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontWeight: 300,
                  fontSize: m.role === "sys" ? 13 : 16,
                  lineHeight: m.role === "sys" ? "22px" : "28px",
                }}
              >
                {m.role === "sys" && <span style={{ color: "rgba(255,255,255,0.38)" }}>{m.content}</span>}
                {m.role === "ai" && (
                  <span style={{ display: "block", ...gradText }}>
                    {isLastAi ? (
                      <Typewriter text={m.content} onUpdate={scrollToBottom} onComplete={onTypingComplete} />
                    ) : (
                      m.content
                    )}
                  </span>
                )}
              </div>
            );
          })}

          {gi === displayGroups.length - 1 && loading && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 12, marginBottom: 16 }}>
              <style>{`@keyframes bBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
              {[0, 0.15, 0.3].map((d, k) => (
                <span key={k} style={{ width: 7, height: 7, borderRadius: "50%", background: "#826dd2", display: "inline-block", animation: `bBounce 1s ${d}s infinite` }} />
              ))}
            </div>
          )}
        </div>
      ))}

      <div ref={endRef} />
    </div>
  );
}