"use client";

import { useState } from "react";
import CloseButton from "@/components/ui/CloseButton";

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
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-panel max-w-sm" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2 className="modal-title">Unirse a una sala</h2><p className="modal-description">Introduce el código que compartió el administrador.</p></div>
          <CloseButton onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="block text-sm text-white/60 mb-1.5">Código de la sala</label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Ej: ABC123"
            className="ui-input text-lg font-semibold tracking-[0.1875rem] text-center uppercase"
            autoFocus
            maxLength={20}
          />
          {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="ui-secondary">Cancelar</button>
            <button type="submit" disabled={loading || !codigo.trim()} className="ui-primary">
              {loading ? "Uniéndose..." : "Unirse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
