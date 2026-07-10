"use client";

import { useState } from "react";
import type { User } from "@/types";
import { deleteMe } from "@/lib/api";

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
    <>
      <div onClick={onClose} className="fixed inset-0 z-[200] bg-[rgba(0,0,0,0.5)]" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[23.75rem] max-w-[90vw] max-h-[85vh] overflow-y-auto bg-[rgba(15,10,30,0.98)] border border-[rgba(130,109,210,0.3)] rounded-5 shadow-[0_24px_64px_rgba(0,0,0,0.8)] z-[201]">
        {/* Header */}
        <div className="px-6 pt-6 pb-0 flex justify-between items-center">
          <h2 className="m-0 text-4.5 font-semibold text-white">Mi perfil</h2>
          <button onClick={onClose} className="bg-transparent border-none text-[rgba(255,255,255,0.4)] cursor-pointer text-5 leading-[1] p-1">×</button>
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
              className="w-full px-4 py-2.5 rounded-2.5 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-[#f87171] text-[0.8125rem] cursor-pointer"
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
                className="w-full px-3 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-white text-[0.8125rem] outline-none box-border"
              />
              <input
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-white text-[0.8125rem] outline-none box-border mt-2"
              />
              {error && <p className="mt-2 mb-0 text-xs text-[#f87171]">{error}</p>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setEmail(""); setPassword(""); setError(null); }}
                  className="flex-1 py-2 rounded-lg border border-[rgba(255,255,255,0.12)] bg-transparent text-[rgba(255,255,255,0.6)] text-[0.8125rem] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`flex-1 py-2 rounded-lg border-none text-white text-[0.8125rem] font-medium ${
                    deleting ? "bg-[rgba(239,68,68,0.3)] cursor-default" : "bg-[#ef4444] cursor-pointer"
                  }`}
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
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
