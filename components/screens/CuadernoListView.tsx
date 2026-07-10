"use client";

import { useState, useEffect } from "react";
import type { Notebook } from "@/types";
import { listNotebooks, createNotebook, deleteNotebook, createApiKey } from "@/lib/api";

interface CuadernoListViewProps {
  onSelect: (notebookId: string) => void;
  onChatClick: () => void;
  onStudyClick: () => void;
  onSummariesClick: () => void;
  onStudyRoomsClick: () => void;
}

export default function CuadernoListView({ onSelect }: CuadernoListViewProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Notebook | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setNotebooks(await listNotebooks()); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const keyRes = await createApiKey("auto");
      await createNotebook(title.trim(), description.trim(), keyRes.api_key);
      setTitle("");
      setDescription("");
      setCreateOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cuaderno");
    } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteNotebook(String(deleteTarget.id)); await load(); } catch {}
    setDeleteTarget(null);
    setDeleting(false);
  };

  return (
    <div className="min-h-full p-6 pb-12 md:p-8 md:pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white m-0">Cuadernos</h1>
          <p className="text-sm text-white/40 mt-1 m-0">Gestiona tus cuadernos, archivos y chats</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer hover:bg-[#7059be] transition-colors shrink-0"
        >
          Crear cuaderno
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/40">Cargando...</div>
      ) : notebooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <div className="text-5xl mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          </div>
          <div className="text-base font-medium text-white/60 mb-1">No hay cuadernos</div>
          <div className="text-sm">Crea uno para empezar</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notebooks.map((nb) => (
            <div
              key={nb.id}
              onClick={() => onSelect(String(nb.id))}
              className="group p-5 rounded-xl border border-white/[0.08] bg-white/[0.03] cursor-pointer hover:border-[rgba(130,109,210,0.4)] hover:bg-[rgba(130,109,210,0.05)] transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-white m-0 truncate">{nb.title}</h3>
                  <p className="text-sm text-white/40 mt-1 m-0 truncate">{nb.description || "Sin descripción"}</p>
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-5 pb-0">
              <h2 className="text-lg font-semibold text-white m-0">Eliminar cuaderno</h2>
            </div>
            <div className="px-6 pt-3 pb-0">
              <p className="text-sm text-white/50 m-0">
                ¿Estás seguro de que quieres eliminar <span className="text-white/80 font-medium">{deleteTarget.title}</span>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-2 justify-end px-6 pt-5 pb-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-lg border border-white/[0.12] bg-transparent text-white/60 text-sm cursor-pointer hover:bg-white/[0.05] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`px-5 py-2.5 rounded-lg border-none bg-red-500/80 text-white text-sm font-medium cursor-pointer transition-opacity ${deleting ? 'opacity-40' : 'hover:bg-red-500'}`}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(nb); }}
                  className="opacity-0 group-hover:opacity-100 px-1.5 py-1 rounded-md border border-red-400/30 bg-transparent text-red-400 text-xs cursor-pointer transition-opacity ml-2 shrink-0"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs text-white/25">{new Date(nb.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4" onClick={() => setCreateOpen(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-5 pb-0">
              <h2 className="text-lg font-semibold text-white m-0">Crear Cuaderno</h2>
              <button onClick={() => setCreateOpen(false)} className="text-white/40 hover:text-white/70 bg-transparent border-none text-lg cursor-pointer transition-colors">✕</button>
            </div>
            <form onSubmit={handleCreate} className="px-6 pt-5 pb-6">
              <label className="block text-sm text-white/50 mb-1.5">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mi cuaderno"
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.05] text-white text-sm outline-none box-border focus:border-[rgba(130,109,210,0.5)] transition-colors"
                autoFocus
              />
              <label className="block text-sm text-white/50 mb-1.5 mt-4">Descripción</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opcional"
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.05] text-white text-sm outline-none box-border focus:border-[rgba(130,109,210,0.5)] transition-colors"
              />
              {error && <div className="text-red-400 text-sm mt-3">{error}</div>}
              <div className="flex gap-2 justify-end mt-5">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-white/[0.12] bg-transparent text-white/60 text-sm cursor-pointer hover:bg-white/[0.05] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className={`px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer transition-opacity ${creating || !title.trim() ? 'opacity-40' : 'hover:bg-[#7059be]'}`}
                >
                  {creating ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
