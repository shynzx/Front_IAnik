"use client";

import { useState } from "react";
import type { StudyRoom } from "@/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface StudyRoomListScreenProps {
  rooms: StudyRoom[];
  loading: boolean;
  onOpenRoom: (roomId: number) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  createdRoomIds: Set<number>;
  onLeaveRoom: (roomId: number) => Promise<void>;
}

export default function StudyRoomListScreen({ rooms, loading, onOpenRoom, onCreateRoom, onJoinRoom, createdRoomIds, onLeaveRoom }: StudyRoomListScreenProps) {
  const [tab, setTab] = useState<"all" | "created" | "joined">("all");
  const [search, setSearch] = useState("");
  const [leaveTarget, setLeaveTarget] = useState<StudyRoom | null>(null);

  const filtered = rooms.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.codigo.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "created" && !createdRoomIds.has(r.id)) return false;
    if (tab === "joined" && createdRoomIds.has(r.id)) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col gap-6">
      {leaveTarget && <ConfirmDialog title="Abandonar sala" description={`Dejarás de tener acceso a “${leaveTarget.title}”. Para volver necesitarás nuevamente el código de invitación.`} confirmLabel="Abandonar" busyLabel="Saliendo…" onClose={() => setLeaveTarget(null)} onConfirm={() => onLeaveRoom(leaveTarget.id)} />}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-white m-0">Salas de Estudio</h1>
          <p className="text-sm text-white/40 mt-1 m-0">Crea o únete a salas para estudiar en grupo</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onJoinRoom} className="px-5 py-2.5 rounded-lg border border-white/[0.12] bg-transparent text-white/70 text-sm cursor-pointer hover:bg-white/[0.05] transition-colors">Unirse con código</button>
          <button onClick={onCreateRoom} className="px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer hover:bg-[#7059be] transition-colors">Crear sala</button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "created", "joined"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg border-none text-[0.8rem] font-medium cursor-pointer transition-colors ${tab === t ? "bg-[rgba(130,109,210,0.2)] text-[#826dd2]" : "bg-transparent text-white/50 hover:text-white/70 hover:bg-white/[0.05]"}`}
          >
            {t === "all" ? "Todas" : t === "created" ? "Mis salas" : "Donde participo"}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre o código..."
        className="ui-input"
      />

      {loading ? (
        <div className="text-center py-12 text-white/40">Cargando salas...</div>
      ) : filtered.length === 0 ? (
        <div className="ui-empty text-white/40">
          <div className="text-5xl mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/><path d="M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4"/><line x1="9" y1="7" x2="9.01" y2="7"/><line x1="15" y1="7" x2="15.01" y2="7"/><line x1="9" y1="11" x2="9.01" y2="11"/><line x1="15" y1="11" x2="15.01" y2="11"/></svg>
          </div>
          <div className="text-base font-medium text-white/60 mb-1">No hay salas</div>
          <div className="text-sm">Crea una sala o únete a una con un código</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((room) => (
            <article
              key={room.id}
              onClick={() => onOpenRoom(room.id)}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onOpenRoom(room.id); }}
              tabIndex={0}
              role="button"
              className="ui-card ui-card-interactive group p-5 cursor-pointer min-h-40 flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-semibold text-white m-0 truncate">{room.title}</h3>
                <span className={`px-2 py-1 rounded-md text-[0.68rem] font-semibold ml-2 shrink-0 ${createdRoomIds.has(room.id) ? "bg-[#8b7cf6]/15 text-[#a99cff]" : "bg-emerald-400/10 text-emerald-300"}`}>
                  {createdRoomIds.has(room.id) ? "Administrador" : "Participante"}
                </span>
              </div>
              <div className="text-sm text-white/45 font-mono bg-black/20 rounded-lg px-3 py-2 mt-2">Código: <span className="text-white/80">{room.codigo}</span></div>
              <div className="text-xs text-white/30 mt-auto pt-4 flex items-center justify-between gap-2">
                <span>{new Date(room.created_at).toLocaleDateString("es-MX")}</span>
                {!createdRoomIds.has(room.id) && <button onClick={(event) => { event.stopPropagation(); setLeaveTarget(room); }} className="border-0 bg-transparent text-red-300/60 hover:text-red-300 cursor-pointer text-xs">Abandonar</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
