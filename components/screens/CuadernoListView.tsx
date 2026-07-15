"use client";

import { useEffect, useState } from "react";
import type { Notebook } from "@/types";
import { listNotebooks, createNotebook, deleteNotebook, createApiKey } from "@/lib/api";
import CloseButton from "@/components/ui/CloseButton";
import InlineError from "@/components/ui/InlineError";
import { useFeedback } from "@/providers/FeedbackProvider";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "name">(() => typeof window !== "undefined" && localStorage.getItem("ianik:notebook-sort") === "name" ? "name" : "recent");
  const { notify } = useFeedback();

  const load = async () => {
    setLoading(true);
    try { setNotebooks(await listNotebooks()); setLoadError(null); } catch (cause) { setLoadError(cause instanceof Error ? cause.message : "No se pudieron cargar los cuadernos."); } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const closeCreate = () => { setCreateOpen(false); setError(null); };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const key = await createApiKey("auto");
      await createNotebook(title.trim(), description.trim(), key.api_key);
      setTitle("");
      setDescription("");
      setCreateOpen(false);
      await load();
      notify({ message: "Cuaderno creado correctamente.", tone: "success" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear el cuaderno");
    } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteNotebook(String(deleteTarget.id)); await load(); notify({ message: "Cuaderno eliminado.", tone: "success" }); }
    catch (cause) { notify({ message: cause instanceof Error ? cause.message : "No se pudo eliminar el cuaderno.", tone: "error" }); }
    finally { setDeleteTarget(null); setDeleting(false); }
  };

  const visibleNotebooks = notebooks
    .filter((notebook) => `${notebook.title} ${notebook.description || ""}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => sort === "name" ? a.title.localeCompare(b.title, "es") : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="page-shell min-h-full">
      <div className="page-header">
        <div>
          <h1>Cuadernos</h1>
          <p>Organiza tus documentos, conversaciones y materiales de estudio.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="ui-primary flex items-center justify-center gap-2">
          <span aria-hidden="true" className="text-lg leading-none">+</span> Nuevo cuaderno
        </button>
      </div>

      <div className="mb-5 flex gap-2 max-sm:flex-col">
        <input className="ui-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cuadernos…" aria-label="Buscar cuadernos" />
        <select className="ui-input sm:max-w-52" value={sort} onChange={(event) => { const value = event.target.value as "recent" | "name"; setSort(value); localStorage.setItem("ianik:notebook-sort", value); }} aria-label="Ordenar cuadernos"><option value="recent">Más recientes</option><option value="name">Nombre</option></select>
      </div>

      {loadError ? <InlineError message={loadError} onRetry={() => void load()} /> : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" aria-label="Cargando cuadernos">
          {[1, 2, 3, 4].map((item) => <div key={item} className="ui-card h-36 animate-pulse bg-white/[0.035]" />)}
        </div>
      ) : notebooks.length === 0 ? (
        <div className="ui-empty">
          <div className="w-16 h-16 rounded-2xl bg-[#8b7cf6]/10 border border-[#8b7cf6]/20 flex items-center justify-center text-[#a99cff] mb-5">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          </div>
          <h2 className="text-lg font-semibold m-0">Crea tu primer cuaderno</h2>
          <p className="text-sm text-white/40 mt-2 mb-6 max-w-sm">Agrupa documentos de un tema para conversar con ellos y generar material de estudio.</p>
          <button onClick={() => setCreateOpen(true)} className="ui-primary">Crear cuaderno</button>
        </div>
      ) : visibleNotebooks.length === 0 ? <div className="ui-empty"><h2 className="m-0 text-lg font-semibold">Sin resultados</h2><p className="mb-5 mt-2 text-sm text-white/50">Prueba con otro término de búsqueda.</p><button type="button" className="ui-secondary" onClick={() => setSearch("")}>Limpiar búsqueda</button></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleNotebooks.map((notebook) => (
            <article key={notebook.id} onClick={() => onSelect(String(notebook.id))} className="ui-card ui-card-interactive group p-5 cursor-pointer min-h-40 flex flex-col" tabIndex={0} role="button" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(String(notebook.id)); }}>
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8b7cf6]/10 border border-[#8b7cf6]/20 flex items-center justify-center text-[#a99cff] shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                </div>
                <button aria-label={`Eliminar ${notebook.title}`} onClick={(event) => { event.stopPropagation(); setDeleteTarget(notebook); }} className="ui-icon-button opacity-60 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-300"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></svg></button>
              </div>
              <h2 className="text-base font-semibold text-white mt-4 mb-1 truncate">{notebook.title}</h2>
              <p className="text-sm text-white/40 m-0 line-clamp-2">{notebook.description || "Sin descripción"}</p>
              <div className="mt-auto pt-4 text-xs text-white/25">Creado el {new Date(notebook.created_at).toLocaleDateString("es-MX")}</div>
            </article>
          ))}
        </div>
      )}

      {createOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeCreate}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-title" className="modal-panel" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between px-6 pt-6">
              <div><h2 id="create-title" className="text-lg font-semibold m-0">Nuevo cuaderno</h2><p className="text-sm text-white/40 mt-1 mb-0">Crea un espacio para un tema o proyecto.</p></div>
              <CloseButton onClick={closeCreate} />
            </div>
            <form onSubmit={handleCreate} className="px-6 py-6">
              <label htmlFor="notebook-title" className="block text-sm text-white/60 mb-2">Título</label>
              <input id="notebook-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Biología celular" className="ui-input" autoFocus maxLength={100} />
              <label htmlFor="notebook-description" className="block text-sm text-white/60 mb-2 mt-5">Descripción <span className="text-white/25">(opcional)</span></label>
              <textarea id="notebook-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="¿Qué estudiarás en este cuaderno?" className="ui-input min-h-24 resize-none" maxLength={240} />
              {error && <p role="alert" className="text-red-300 text-sm mt-3 mb-0">{error}</p>}
              <div className="flex justify-end gap-2 mt-6"><button type="button" onClick={closeCreate} className="ui-secondary">Cancelar</button><button type="submit" disabled={creating || !title.trim()} className="ui-primary">{creating ? "Creando…" : "Crear cuaderno"}</button></div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setDeleteTarget(null)}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-title" className="modal-panel max-w-sm" onMouseDown={(event) => event.stopPropagation()}>
            <div className="p-6"><h2 id="delete-title" className="text-lg font-semibold m-0">Eliminar cuaderno</h2><p className="text-sm text-white/50 mt-3 mb-0">Se eliminará <strong className="text-white/80">{deleteTarget.title}</strong>. Esta acción no se puede deshacer.</p><div className="flex justify-end gap-2 mt-6"><button onClick={() => setDeleteTarget(null)} className="ui-secondary">Cancelar</button><button onClick={handleDelete} disabled={deleting} className="ui-danger">{deleting ? "Eliminando…" : "Eliminar"}</button></div></div>
          </section>
        </div>
      )}
    </div>
  );
}
