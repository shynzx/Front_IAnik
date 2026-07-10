"use client";

import { useState } from "react";

interface JoinStudyRoomModalProps {
  loading: boolean;
  onJoin: (codigo: string) => Promise<number>;
  onClose: () => void;
  onJoined: (roomId: number) => void;
}

export default function JoinStudyRoomModal({ loading, onJoin, onClose, onJoined }: JoinStudyRoomModalProps) {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) return;
    setError(null);
    try {
      const roomId = await onJoin(codigo.trim());
      onJoined(roomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al unirse a la sala");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={onClose}>
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 pt-5 pb-4">
          <h2 className="m-0 text-lg font-semibold text-white">Unirse a Sala</h2>
          <button onClick={onClose} className="bg-transparent border-none text-white/50 text-lg cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <label className="block text-sm text-white/60 mb-1.5">Código de la sala</label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Ej: ABC123"
            className="w-full px-3.5 py-3 rounded-lg border border-white/[0.12] bg-white/[0.05] text-white text-lg font-semibold tracking-[0.1875rem] outline-none box-border text-center"
            autoFocus
            maxLength={20}
          />
          {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-white/[0.12] bg-transparent text-white/70 text-sm cursor-pointer">Cancelar</button>
            <button type="submit" disabled={loading || !codigo.trim()} className={`px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer ${loading || !codigo.trim() ? "opacity-50" : "opacity-100 hover:bg-[#7059be]"}`}>
              {loading ? "Uniéndose..." : "Unirse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
