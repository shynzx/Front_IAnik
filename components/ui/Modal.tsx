"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import CloseButton from "./CloseButton";

interface ModalProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
  variant?: "dialog" | "alertdialog";
  className?: string;
}

const focusable = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, description, children, onClose, busy = false, variant = "dialog", className = "" }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => (panelRef.current?.querySelector(focusable) as HTMLElement | null)?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusable));
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus();
    };
  }, [busy, onClose]);

  const closeBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (!busy && event.target === event.currentTarget) onClose();
  };

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="modal-backdrop" onMouseDown={closeBackdrop}>
      <section ref={panelRef} className={`modal-panel ${className}`} role={variant} aria-modal="true" aria-labelledby={titleId}>
        <header className="modal-header">
          <div><h2 id={titleId} className="modal-title">{title}</h2>{description && <p className="modal-description">{description}</p>}</div>
          {!busy && <CloseButton onClick={onClose} />}
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}
