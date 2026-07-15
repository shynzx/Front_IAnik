"use client";

import { useState } from "react";
import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  busyLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function ConfirmDialog({ title, description, confirmLabel = "Eliminar", busyLabel = "Procesando…", onConfirm, onClose }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try { await onConfirm(); onClose(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo completar la acción"); }
    finally { setBusy(false); }
  };

  return (
    <Modal title={title} description={description} onClose={onClose} busy={busy} variant="alertdialog" className="max-w-sm">
        <div className="modal-body pt-5">
          {error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
          <div className="modal-actions mt-0"><button type="button" onClick={onClose} disabled={busy} className="ui-secondary">Cancelar</button><button type="button" onClick={confirm} disabled={busy} className="ui-danger">{busy ? busyLabel : confirmLabel}</button></div>
        </div>
    </Modal>
  );
}
