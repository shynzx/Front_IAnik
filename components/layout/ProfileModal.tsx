"use client";

import { useState } from "react";
import type { User } from "@/types";
import { deleteMe } from "@/lib/api";
import CloseButton from "@/components/ui/CloseButton";

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onAccountDeleted: () => void;
}

export default function ProfileModal({ user, onClose, onAccountDeleted }: ProfileModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!email || !password) {
      setError("Ingresa tu email y contraseña para confirmar.");
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteMe(email, password);
      onAccountDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar cuenta.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal-panel w-[23.75rem] max-w-[90vw]" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-0 flex justify-between items-center">
          <h2 id="profile-modal-title" className="m-0 text-lg font-semibold text-white">Mi perfil</h2>
          <CloseButton onClick={onClose} />
        </div>

        {/* Avatar + info */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-[linear-gradient(135deg,#826dd2,#4f3fa0)] flex items-center justify-center shrink-0">
              <span className="text-5 font-semibold text-white">
                {user.nombre.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="m-0 text-base font-medium text-white break-words">{user.nombre}</p>
              <p className="mt-[0.1875rem] mb-0 text-[0.8125rem] text-[rgba(255,255,255,0.45)] break-all">{user.email}</p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-[rgba(255,255,255,0.03)] rounded-xl px-4 py-3.5 border border-[rgba(255,255,255,0.06)] mb-5">
            <DetailRow label="Email" value={user.email} last />
          </div>

          {/* Delete account */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="ui-danger w-full"
            >
              Eliminar cuenta
            </button>
          ) : (
            <div className="bg-[rgba(239,68,68,0.06)] rounded-xl p-4 border border-[rgba(239,68,68,0.2)]">
              <p className="mt-0 mb-3 text-[0.8125rem] text-[#fca5a5] font-medium">
                ¿Estás seguro? Esta acción es permanente.
              </p>
              <input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="ui-input text-sm"
              />
              <input
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="ui-input text-sm mt-2"
              />
              {error && <p className="mt-2 mb-0 text-xs text-[#f87171]">{error}</p>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setEmail(""); setPassword(""); setError(null); }}
                  className="ui-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="ui-danger flex-1"
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DetailRow({ label, value, highlight, last }: { label: string; value: string; highlight?: boolean; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2 ${last ? "border-b-0" : "border-b border-[rgba(255,255,255,0.05)]"}`}>
      <span className="text-xs text-[rgba(255,255,255,0.4)]">{label}</span>
      <span className={`text-[0.8125rem] ${highlight ? "text-[#4ade80] font-medium" : "text-[rgba(255,255,255,0.75)] font-[400]"}`}>{value}</span>
    </div>
  );
}
