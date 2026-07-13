"use client";
/* eslint-disable @next/next/no-img-element -- previews use local attachment URLs */

import { useRef, useEffect, useCallback, useState } from "react";
import { Msg, MsgAttachment } from "@/types";
import Typewriter from "./Typewriter";
import ChatReadyBanner from "./ChatReadyBanner";

interface MessageListProps {
  messages: Msg[];
  loading: boolean;
  typing: boolean;
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
    <div className="flex flex-col gap-2 mb-1.5">
      {images.length > 0 && (
        <div className={`grid ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-0.5 rounded-lg overflow-hidden`}>
          {images.map(img => (
            <img key={img.id} src={img.preview} alt={img.name} className={`w-full ${images.length === 1 ? 'max-w-65 h-45' : 'max-w-30 h-22'} object-cover rounded-lg block`} />
          ))}
        </div>
      )}
      {docs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-1.5 bg-white/[0.15] border border-white/20 rounded-lg py-1 pl-2 pr-2.5">
              <span className="w-6 h-6 rounded-sm bg-white/20 flex items-center justify-center text-xs font-bold text-white tracking-tight shrink-0">
                {fileExt(doc.name)}
              </span>
              <span className="font-light text-xs text-white/90 max-w-35 overflow-hidden text-ellipsis whitespace-nowrap">
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

  return (
    <div
      className="relative ml-auto mb-3 max-w-[85%] pl-11 max-md:max-w-[94%] max-md:pl-0"
      // Solo activar hover si ningún mensaje está siendo editado
      onMouseEnter={() => { if (!anyEditing) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Botón editar — visible solo con hover y sin ninguna edición activa */}
      {hovered && !anyEditing && canEdit && (
        <button
          onClick={() => { setHovered(false); onStartEdit(flatIndex); }}
          className="absolute top-1/2 left-0 -translate-y-1/2 bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] rounded-lg p-1.5 cursor-pointer flex items-center justify-center text-[rgba(255,255,255,0.5)] transition-all duration-150 z-10"
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
          aria-label="Editar mensaje"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}

      {/* Burbuja */}
<div
        className={`${hasAttachments && !hasText ? 'py-2.5 px-3.25' : 'p-3.25'} rounded-[18px_18px_4px_18px] bg-[#826dd2] font-light text-base leading-7`}
      >
        {hasAttachments && <AttachmentList attachments={message.attachments!} />}

        {isEditing ? (
          <div className="flex flex-col gap-2">
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
              className="font-light text-base leading-7 text-white bg-white/[0.12] border border-white/30 rounded-lg py-1.5 px-2.5 outline-none resize-none w-full min-w-45 box-border overflow-y-hidden"
            />
            <div className="flex gap-1.5 justify-end">
              <button
                onClick={onCancelEdit}
                className="font-light text-xs py-1 px-3 rounded-lg border border-white/20 bg-transparent text-white/65 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEdit}
                className="font-medium text-xs py-1 px-3.5 rounded-lg border-none bg-white/[0.22] text-white cursor-pointer"
              >
                Enviar
              </button>
            </div>
          </div>
        ) : (
          hasText && <span className="text-white">{message.content}</span>
        )}
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function MessageList({
  messages,
  loading,
  typing,
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

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

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
    <div className="w-full flex flex-col pb-8">
      {displayGroups.length === 0 && <ChatReadyBanner />}

      {displayGroups.map((group, gi) => (
        <div key={group[0]?.id ?? gi} className="w-full flex flex-col mb-6 animate-[messageIn_.28s_cubic-bezier(.22,1,.36,1)_both]">
          {group.map((m) => {
            flatIndex++;
            const currentFlatIndex = flatIndex;
            const isLastAi = m.role === "ai" && currentFlatIndex === lastAiIndex;

            if (m.role === "user") {
              return (
                <UserBubble
                  key={`${m.id}-${m.content}`}
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
                key={m.id}
                className={`mb-3 ${m.role === 'sys'
                  ? 'py-1.25 px-4 rounded-full ml-auto mr-0 text-sm leading-6 bg-white/[0.06] border border-white/[0.08]'
                  : 'p-3.25 rounded-[18px_18px_18px_4px] text-base leading-7 bg-white/[0.06] border border-white/[0.08] max-w-[85%] w-fit font-light max-md:max-w-[94%]'
                }`}
              >
                {m.role === "sys" && <span className="text-white/38">{m.content}</span>}
                {m.role === "ai" && (
                  <span className="block whitespace-pre-wrap text-white/90">
                    {isLastAi && typing ? (
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
            <div className="flex gap-1.5 items-center ml-3 mb-4">
              {[0, 0.15, 0.3].map((d, k) => (
                <span key={k} className="w-1.5 h-1.5 rounded-full bg-[#826dd2] inline-block" style={{ animation: `bBounce 1s ${d}s infinite` }} />
              ))}
            </div>
          )}
        </div>
      ))}

      <div ref={endRef} />
    </div>
  );
}
