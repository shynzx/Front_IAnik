"use client";

import { useState, useEffect } from "react";
import { listNotebooks } from "@/lib/api";
import type { Notebook } from "@/types";

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
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000]" onClick={onClose}>
        <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-sm max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center px-6 pt-5 pb-4">
            <h2 className="m-0 text-lg font-semibold text-white">Sala Creada</h2>
            <button onClick={onClose} className="bg-transparent border-none text-white/50 text-lg cursor-pointer">✕</button>
          </div>
          <div className="px-6 pb-6 text-center">
            <div className="text-sm text-white/60 mb-3">Comparte este código con tus compañeros:</div>
            <div className="text-3xl font-bold text-[#826dd2] tracking-widest mb-6 font-mono">{createdRoom.codigo}</div>
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer hover:bg-[#7059be] transition-colors">Entendido</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-sm max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 pt-5 pb-4">
          <h2 className="m-0 text-lg font-semibold text-white">Crear Sala de Estudio</h2>
          <button onClick={onClose} className="bg-transparent border-none text-white/50 text-lg cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <label className="block text-sm text-white/60 mb-1.5 mt-3">Nombre de la sala</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Estudio Grupal Cálculo"
            className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.05] text-white text-sm outline-none box-border focus:border-[rgba(130,109,210,0.5)] transition-colors"
            autoFocus
          />
          <label className="block text-sm text-white/60 mb-1.5 mt-3">Cuaderno</label>
          <select
            value={notebookId}
            onChange={(e) => setNotebookId(e.target.value)}
            disabled={loadingNotebooks}
            className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.05] text-white text-sm outline-none box-border focus:border-[rgba(130,109,210,0.5)] transition-colors disabled:opacity-50"
          >
            <option value="">{loadingNotebooks ? "Cargando cuadernos..." : "Selecciona un cuaderno"}</option>
            {notebooks.map((n) => (
              <option key={n.id} value={String(n.id)}>{n.title}</option>
            ))}
          </select>
          {error && <div className="text-red-400 text-sm mt-3">{error}</div>}
          <div className="flex gap-2 justify-end mt-5">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-white/[0.12] bg-transparent text-white/60 text-sm cursor-pointer hover:bg-white/[0.05] transition-colors">Cancelar</button>
            <button type="submit" disabled={loading || !title.trim() || !notebookId.trim()} className={`px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer transition-opacity ${loading || !title.trim() || !notebookId.trim() ? 'opacity-40' : 'hover:bg-[#7059be]'}`}>
              {loading ? "Creando..." : "Crear Sala"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
