"use client";

import { useState, useEffect } from "react";
import type { StudyRoom } from "@/types";

interface StudyRoomListScreenProps {
  rooms: StudyRoom[];
  loading: boolean;
  onOpenRoom: (roomId: number) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export default function StudyRoomListScreen({ rooms, loading, onOpenRoom, onCreateRoom, onJoinRoom }: StudyRoomListScreenProps) {
  const [tab, setTab] = useState<"all" | "created" | "joined">("all");
  const [search, setSearch] = useState("");

  const filtered = rooms.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.codigo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        className="px-4 py-2.5 rounded-lg border border-white/[0.1] bg-white/[0.05] text-white text-sm outline-none focus:border-[rgba(130,109,210,0.5)] transition-colors placeholder:text-white/25"
      />

      {loading ? (
        <div className="text-center py-12 text-white/40">Cargando salas...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/40">
          <div className="text-5xl mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/><path d="M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4"/><line x1="9" y1="7" x2="9.01" y2="7"/><line x1="15" y1="7" x2="15.01" y2="7"/><line x1="9" y1="11" x2="9.01" y2="11"/><line x1="15" y1="11" x2="15.01" y2="11"/></svg>
          </div>
          <div className="text-base font-medium text-white/60 mb-1">No hay salas</div>
          <div className="text-sm">Crea una sala o únete a una con un código</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((room) => (
            <div
              key={room.id}
              onClick={() => onOpenRoom(room.id)}
              className="group p-5 rounded-xl border border-white/[0.08] bg-white/[0.03] cursor-pointer hover:border-[rgba(130,109,210,0.4)] hover:bg-[rgba(130,109,210,0.05)] transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-semibold text-white m-0 truncate">{room.title}</h3>
                <span className="px-2 py-0.5 rounded-md bg-[rgba(130,109,210,0.15)] text-[#826dd2] text-[0.7rem] font-semibold font-mono ml-2 shrink-0">
                  {room.codigo}
                </span>
              </div>
              <div className="text-xs text-white/30">
                Cuaderno #{room.notebook_id} · {new Date(room.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
