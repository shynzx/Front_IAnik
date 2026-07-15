"use client";
/* eslint-disable @next/next/no-img-element -- previews use local blob URLs */

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
  onSubmit: (e: FormEvent, attachments: Attachment[]) => void | boolean | Promise<void | boolean>;
}

export default function ChatInput({
  value,
  loading,
  typing,
  onChange,
  onSubmit,
}: ChatInputProps) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const menuRef  = useRef<HTMLDivElement>(null);
  const clipRef  = useRef<HTMLButtonElement>(null);

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachmentsRef = useRef(attachments);
  useEffect(() => { attachmentsRef.current = attachments; }, [attachments]);

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
    return () => attachmentsRef.current.forEach(a => a.preview && URL.revokeObjectURL(a.preview));
  }, []);

  /* ── Add files — SOLO adjunta al mensaje, NO toca el panel de documentos ── */
  const addFiles = (files: FileList | null, kind: "image" | "document") => {
    if (!files) return;
    setAttachmentError("");
    const accepted = Array.from(files).filter((file) => {
      if (file.size > 15 * 1024 * 1024) { setAttachmentError(`${file.name} supera el límite de 15 MB.`); return false; }
      if (attachments.some((item) => item.name === file.name && item.file.size === file.size)) { setAttachmentError(`${file.name} ya está adjunto.`); return false; }
      return true;
    });
    const next: Attachment[] = accepted.map(file => ({
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
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    const result = await onSubmit(e, attachments);
    if (result !== false) setAttachments([]);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [value]);

  return (
    <div className="w-full">

      <form onSubmit={handleSubmit}>
        <div
          className={`flex flex-col bg-[rgba(255,255,255,0.04)] backdrop-blur-xl border border-white/10 rounded-2xl relative gap-0 max-md:rounded-xl ${attachments.length ? 'py-2 pr-2 pl-1.5 pb-1.5' : 'p-2 pl-1.5'}`}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >

          {/* ── Chips row ── */}
          {attachments.length > 0 && (
            <div
              className="flex flex-wrap gap-1.5 py-0.5 px-1.5 pl-10.5 pb-0.5 border-b border-white/5 mb-1"
            >
              {attachments.map(a => (
                <div
                  key={a.id}
                  className="flex items-center gap-1.5 bg-[rgba(130,109,210,0.14)] border border-[rgba(130,109,210,0.3)] rounded-lg py-0.75 pr-2 pl-1 animate-[chipIn_0.15s_ease] max-w-50 min-w-0"
                >
                  {/* Image thumbnail */}
                  {a.kind === "image" && a.preview && (
                    <img
                      src={a.preview}
                      alt={a.name}
                      className="w-8.5 h-8.5 rounded object-cover shrink-0 block"
                    />
                  )}

                  {/* Document badge — minimal dark style matching project standard */}
                  {a.kind === "document" && (
                    <span
                      className="w-7 h-7 rounded-md bg-[rgba(130,109,210,0.12)] border border-[rgba(130,109,210,0.25)] flex items-center justify-center shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3v4a1 1 0 001 1h4" />
                        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                        <line x1="9" y1="17" x2="13" y2="17" />
                      </svg>
                    </span>
                  )}

                  <span
                    className="font-light text-xs text-white/80 overflow-hidden text-ellipsis whitespace-nowrap max-w-27"
                  >
                    {a.name}
                  </span>

                  <button
                    type="button"
                    aria-label="Eliminar archivo adjunto"
                    onClick={() => removeAttachment(a.id)}
                    className="w-4 h-4 rounded bg-[rgba(255,255,255,0.1)] border-none cursor-pointer flex items-center justify-center shrink-0 p-0 transition-[background] duration-[120ms]"
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
          <div className="flex items-center gap-2">

            {/* Clip / attach button */}
            <div className="relative shrink-0">
              <button
                ref={clipRef}
                type="button"
                aria-label="Adjuntar archivos"
                onClick={() => setMenuOpen(v => !v)}
                className={`${menuOpen ? 'text-[#826dd2] bg-[rgba(130,109,210,0.12)]' : 'text-white/35 bg-transparent'} border-none cursor-pointer p-2 rounded-lg flex items-center justify-center transition-[color,background] duration-150`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              {/* ── Dropdown menu ── */}
              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute bottom-full left-0 mb-2.5 bg-[rgba(14,8,30,0.97)] backdrop-blur-xl border border-white/10 rounded-xl p-1.5 min-w-75 shadow-[0_12px_400px_rgba(0,0,0,0.6),0_0_0_1px_rgba(130,109,210,0.15)] z-[100] animate-[attachMenuIn_0.15s_ease] max-md:min-w-0 max-md:w-[calc(100vw-1.5rem)]"
                >
                  <button
                    type="button"
                    aria-label="Agregar foto"
                    onClick={() => photoRef.current?.click()}
                    className="flex items-center gap-3 w-full py-2.5 px-3 rounded-lg bg-transparent border-none cursor-pointer text-white/75 font-light text-sm text-left transition-[background,color] duration-150"
                  >
                    <span className="w-8 h-8 rounded-lg shrink-0 bg-[rgba(130,109,210,0.12)] border border-[rgba(130,109,210,0.25)] flex items-center justify-center">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </span>
                    Agregar foto
                    <span className="ml-auto text-xs text-white/25 font-light">
                      JPG, PNG, GIF
                    </span>
                  </button>

                  <div className="h-px bg-white/6 my-0.75 mx-1.5" />

                  <button
                    type="button"
                    aria-label="Agregar archivo"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-3 w-full py-2.5 px-3 rounded-lg bg-transparent border-none cursor-pointer text-white/75 font-light text-sm text-left transition-[background,color] duration-150"
                  >
                    <span className="w-8 h-8 rounded-lg shrink-0 bg-[rgba(130,109,210,0.12)] border border-[rgba(130,109,210,0.25)] flex items-center justify-center">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3v4a1 1 0 001 1h4" />
                        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                        <line x1="9" y1="17" x2="13" y2="17" />
                      </svg>
                    </span>
                    Agregar archivo
                    <span className="ml-auto text-xs text-white/25 font-light">
                      PDF, DOC
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Text input */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) void handleSubmit(e as unknown as FormEvent);
                }
              }}
              placeholder={attachments.length ? "Añade un mensaje..." : "Escribe tu mensaje a IAnik"}
              disabled={loading || typing}
              className="max-h-36 min-h-7 flex-1 resize-none overflow-y-auto bg-transparent border-none outline-none font-normal text-base leading-7 text-white py-0 caret-[#826dd2]"
            />

            {/* Count badge */}
            {attachments.length > 0 && (
              <span className="shrink-0 bg-[#826dd2] text-white rounded-full text-xs font-medium py-0.5 px-2 tracking-tight">
                {attachments.length}
              </span>
            )}

            <button
              type="submit"
              aria-label="Enviar mensaje"
              disabled={!canSend}
              className={`flex items-center justify-center p-2.5 rounded-lg shrink-0 border-none ${canSend ? 'cursor-pointer bg-[#826dd2] text-white' : 'cursor-not-allowed bg-white/[0.05] text-white/20'} transition-all duration-150 send-btn`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" y1="14" x2="21" y2="3" />
                <path d="M21 3L14.5 21a.55.55 0 01-1 0L10 14l-7-3.5a.55.55 0 010-1L21 3" />
              </svg>
            </button>
          </div>
        </div>
      </form>
      {attachmentError && <p role="alert" className="m-0 mt-2 px-1 text-xs text-red-300">{attachmentError}</p>}

      {/* Hidden file inputs — these feed ONLY the message attachments */}
      <input
        type="file" ref={photoRef} className="hidden"
        multiple accept="image/*"
        onChange={(e) => { addFiles(e.target.files, "image"); e.currentTarget.value = ""; }}
      />
      <input
        type="file" ref={fileRef} className="hidden"
        multiple accept=".pdf,.doc,.docx"
        onChange={(e) => { addFiles(e.target.files, "document"); e.currentTarget.value = ""; }}
      />
    </div>
  );
}
