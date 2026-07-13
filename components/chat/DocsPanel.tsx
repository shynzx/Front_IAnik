"use client";

import { useRef, useState } from "react";
import { Doc } from "@/types";
import DocIcon from "./DocIcon";
import { formatFileSize } from "@/lib/fileReader";
import DocViewer from "./docs/DocViewer";
import DocCard from "./docs/DocCard";
import { highlightMatch } from "./docs/highlightMatch";


interface DocsPanelProps {
  docs: Doc[];
  docSearch: string;
  docsFullscreen: boolean;
  onSearchChange: (value: string) => void;
  onFullscreen: (value: boolean) => void;
  onClose: () => void;
  onFiles: (files: FileList | null) => void;
  onDeleteDoc: (doc: Doc) => Promise<void>;
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
  onDeleteDoc,
}: DocsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (doc: Doc, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId === doc.id) return;
    setDeletingId(doc.id);
    try {
      await onDeleteDoc(doc);
      if (selectedDoc?.id === doc.id) setSelectedDoc(null);
    } finally {
      setDeletingId(null);
    }
  };

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
          className="fixed inset-0 z-[60] bg-[rgba(8,4,18,0.97)] backdrop-blur-[20px] flex flex-col py-8 px-10"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2
                className="font-normal text-2xl bg-gradient-to-r from-white to-[#a5a5a5] bg-clip-text text-transparent m-0"
              >
                Documentos
              </h2>
              {filteredDocs.length !== docs.length && (
                <p className="font-light text-xs text-[rgba(255,255,255,0.35)] mt-1 mb-0">
                  {filteredDocs.length} de {docs.length} resultado{filteredDocs.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="flex gap-2.5 items-center">
              {/* Search input */}
              <div className="relative">
                <input
                  value={docSearch}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Buscar por nombre o contenido..."
                  className={`font-light text-sm bg-white/[0.06] border ${searchFocused ? 'border-[rgba(130,109,210,0.5)]' : 'border-white/10'} rounded-lg py-1.75 pl-3 pr-9 text-white outline-none w-60 transition-[border-color] duration-150`}
                />
                {docSearch ? (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.45)] bg-transparent border-none cursor-pointer p-0.5 leading-none"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                ) : (
                  <svg
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)] pointer-events-none"
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
                className="text-[rgba(255,255,255,0.5)] bg-transparent border-none cursor-pointer p-2 rounded-lg leading-none flex items-center justify-center"
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
                className="text-[rgba(255,255,255,0.5)] bg-transparent border-none cursor-pointer p-2 rounded-lg leading-none flex items-center justify-center"
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
              className="flex flex-col items-center justify-center flex-1 gap-3 opacity-50"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="font-light text-sm text-[rgba(255,255,255,0.5)]">
                Sin resultados para &quot;{docSearch}&quot;
              </p>
            </div>
          )}

          {/* Grid */}
          <div
            className="flex-1 overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 pb-20 content-start"
          >
            {filteredDocs.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                searchQuery={docSearch}
                onClick={() => setSelectedDoc(doc)}
                onDelete={(e) => handleDelete(doc, e)}
                deleting={deletingId === doc.id}
              />
            ))}
          </div>

          {/* Bottom upload button */}
          <div className="absolute bottom-6 right-10">
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={(e) => onFiles(e.target.files)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="font-normal py-2.5 px-6 rounded-lg bg-[#826dd2] text-white border-none text-sm cursor-pointer"
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
        className="docs-panel fixed left-16 top-0 h-screen w-66 bg-[rgba(6,3,15,0.94)] backdrop-blur-[16px] border-r border-white/[0.07] flex flex-col z-[45] animate-[slideIn_0.18s_ease]"
      >
        {/* Header */}
        <div
          className="py-5.5 px-4 pb-3.5 flex items-center justify-between border-b border-white/[0.05] shrink-0"
        >
          <h2 className="font-normal text-base bg-gradient-to-r from-white to-[#a5a5a5] bg-clip-text text-transparent m-0">
            Documentos
          </h2>
          <div className="flex gap-1">
            {/* Expand */}
            <button
              onClick={() => onFullscreen(true)}
              className="text-[rgba(255,255,255,0.4)] bg-transparent border-none cursor-pointer p-1.5 rounded-lg leading-none flex items-center justify-center"
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
        <div className="py-2.5 px-2.5 pb-1.5 shrink-0">
          <div className="relative">
            <input
              value={docSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar documentos..."
              className="font-light text-xs bg-white/[0.05] border border-white/[0.08] rounded-lg py-1.5 pl-2.5 pr-8 text-white outline-none w-full box-border transition-[border-color] duration-150"
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(130,109,210,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            {docSearch ? (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)] bg-transparent border-none cursor-pointer p-0.5 leading-none"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ) : (
              <svg
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.3)] pointer-events-none"
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
            <p className="font-light text-[11px] text-[rgba(255,255,255,0.3)] mt-1 mb-0 mx-[2px]">
              {filteredDocs.length} resultado{filteredDocs.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-1 px-2.5">
          {filteredDocs.length === 0 && docSearch ? (
            <div
              className="flex flex-col items-center justify-center py-8 gap-2 opacity-40"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="font-light text-xs text-[rgba(255,255,255,0.5)] text-center">
                Sin resultados
              </p>
            </div>
          ) : (
            filteredDocs.slice(0, 6).map((doc) => (
              doc.loading ? (
                /* ── Fila de carga con barra de progreso ── */
                <div
                  key={doc.id}
                  className="py-2.5 px-2.5 pb-3 rounded-lg mb-0.5 bg-[rgba(130,109,210,0.06)] border border-[rgba(130,109,210,0.15)]"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    {/* Icono animado */}
                    <div className="w-9 h-9 rounded-full bg-[rgba(130,109,210,0.2)] border border-[rgba(130,109,210,0.35)] flex items-center justify-center shrink-0 animate-[progressGlow_1.6s_ease-in-out_infinite]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3v4a1 1 0 001 1h4" />
                        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-light text-xs text-[rgba(255,255,255,0.7)] overflow-hidden text-ellipsis whitespace-nowrap block">
                        {doc.name}
                      </span>
                      <span className="font-light text-[11px] text-[#826dd2]">
                        Procesando…
                      </span>
                    </div>
                  </div>
                  {/* Barra de progreso */}
                  <div className="h-1 rounded-full bg-white/[0.07] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#826dd2] to-[#b09ae8] shadow-[0_0_8px_rgba(130,109,210,0.7)]"
                      style={{ animation: "progressBar 8s cubic-bezier(0.4,0,0.2,1) forwards" }}
                    />
                  </div>
                </div>
              ) : (
              <div
                key={doc.id}
                className="flex items-center gap-3 py-2.5 px-2.5 rounded-lg cursor-pointer mb-0.5 bg-transparent transition-[background] duration-[120ms] hover:bg-white/[0.05]"
                onClick={() => setSelectedDoc(doc)}
              >
                <DocIcon type={doc.type} />
                <div className="flex-1 min-w-0">
                  <span
                    className="font-light text-sm text-white/80 overflow-hidden text-ellipsis whitespace-nowrap block"
                  >
                    {highlightMatch(doc.name, docSearch)}
                  </span>
                  {doc.size != null && (
                    <span className="font-light text-[11px] text-white/30">
                      {formatFileSize(doc.size)}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(doc, e)}
                  disabled={deletingId === doc.id}
                  className={`text-[rgba(255,255,255,0.35)] bg-transparent border-none ${deletingId === doc.id ? 'cursor-not-allowed' : 'cursor-pointer'} p-1.5 rounded-lg leading-none shrink-0 flex items-center justify-center`}
                  title="Eliminar"
                >
                  {deletingId === doc.id ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    </svg>
                  )}
                </button>
              </div>
              )
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="py-3 px-3 pb-5 flex gap-2 border-t border-white/[0.05] shrink-0"
        >
          {docs.length > 6 && (
            <button
              onClick={() => onFullscreen(true)}
              className="font-light flex-1 py-2.5 rounded-lg bg-white/[0.06] text-white/65 border border-white/10 text-sm cursor-pointer"
            >
              Ver más ({docs.length - 6})
            </button>
          )}
          <input
            type="file"
            ref={fileRef}
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="font-normal flex-1 py-2.5 rounded-lg bg-[#826dd2] text-white border-none text-sm cursor-pointer"
          >
            Subir Archivos
          </button>
        </div>
      </div>
    </>
  );
}
