"use client";

import { useState, useEffect } from "react";
import { listNotebooks } from "@/lib/api";
import type { Notebook } from "@/types";
import CloseButton from "@/components/ui/CloseButton";

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
            <div className="text-3xl font-bold text-[#826dd2] tracking-widest mb-6 font-mono">{createdRoom.codigo}</div>
            <button onClick={onClose} className="ui-primary">Entendido</button>
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
