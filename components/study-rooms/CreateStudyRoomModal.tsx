"use client";

import { useState, useEffect } from "react";
import { listNotebooks } from "@/lib/api";
import type { Notebook } from "@/types";
import CloseButton from "@/components/ui/CloseButton";
import { useFeedback } from "@/providers/FeedbackProvider";

interface CreateStudyRoomModalProps {
  loading: boolean;
  onCreate: (title: string, notebookId: string) => Promise<{ id: number; codigo: string }>;
  onClose: () => void;
}

export default function CreateStudyRoomModal({ loading, onCreate, onClose }: CreateStudyRoomModalProps) {
  const [title, setTitle] = useState("");
  const [notebookId, setNotebookId] = useState("");
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdRoom, setCreatedRoom] = useState<{ id: number; codigo: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const { notify } = useFeedback();

  const copyRoomCode = async () => {
    if (!createdRoom) return;
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(createdRoom.codigo);
      setCopied(true);
      notify({ message: "Código de la sala copiado.", tone: "success" });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError("No se pudo copiar automáticamente. Selecciona el código e inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    let active = true;
    listNotebooks()
      .then((list) => { if (active) setNotebooks(list); })
      .catch(() => {})
      .finally(() => { if (active) setLoadingNotebooks(false); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !notebookId.trim()) return;
    setError(null);
    try {
      const room = await onCreate(title.trim(), notebookId.trim());
      setCreatedRoom(room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear sala");
    }
  };

  if (createdRoom) {
    return (
      <div className="modal-backdrop" onMouseDown={onClose}>
        <div className="modal-panel max-w-sm" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div><h2 className="modal-title">Sala creada</h2><p className="modal-description">Comparte el código para invitar participantes.</p></div>
            <CloseButton onClick={onClose} />
          </div>
          <div className="px-6 pb-6 text-center">
            <div className="text-sm text-white/60 mb-3">Comparte este código con tus compañeros:</div>
            <button type="button" onClick={copyRoomCode} className="group mb-3 flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#826dd2]/30 bg-[#826dd2]/10 px-4 py-4 text-left transition-colors hover:border-[#826dd2]/55 hover:bg-[#826dd2]/15" aria-label={`Copiar código ${createdRoom.codigo}`}>
              <span className="select-all font-mono text-2xl font-bold tracking-[0.2em] text-[#a99cff]">{createdRoom.codigo}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-white/60 group-hover:text-white">
                {copied ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>Copiado</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copiar código</>}
              </span>
            </button>
            {copyError && <p role="alert" className="mb-4 mt-0 text-left text-xs text-red-300">{copyError}</p>}
            <button onClick={onClose} className="ui-primary mt-3 w-full">Entendido</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-panel max-w-sm" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2 className="modal-title">Crear sala de estudio</h2><p className="modal-description">Vincula un cuaderno para compartir sus materiales.</p></div>
          <CloseButton onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="block text-sm text-white/60 mb-1.5 mt-3">Nombre de la sala</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Estudio Grupal Cálculo"
            className="ui-input"
            autoFocus
          />
          <label className="block text-sm text-white/60 mb-1.5 mt-3">Cuaderno</label>
          <select
            value={notebookId}
            onChange={(e) => setNotebookId(e.target.value)}
            disabled={loadingNotebooks}
            className="ui-input disabled:opacity-50"
          >
            <option value="">{loadingNotebooks ? "Cargando cuadernos..." : "Selecciona un cuaderno"}</option>
            {notebooks.map((n) => (
              <option key={n.id} value={String(n.id)}>{n.title}</option>
            ))}
          </select>
          {error && <div className="text-red-400 text-sm mt-3">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="ui-secondary">Cancelar</button>
            <button type="submit" disabled={loading || !title.trim() || !notebookId.trim()} className="ui-primary">
              {loading ? "Creando..." : "Crear Sala"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
