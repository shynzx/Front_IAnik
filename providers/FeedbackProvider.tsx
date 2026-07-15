"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type FeedbackTone = "success" | "error" | "info";
type FeedbackInput = { message: string; tone?: FeedbackTone; actionLabel?: string; onAction?: () => void; duration?: number };
type FeedbackItem = FeedbackInput & { id: number; tone: FeedbackTone };

interface FeedbackContextValue {
  notify: (input: string | FeedbackInput) => number;
  dismiss: (id: number) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((input: string | FeedbackInput) => {
    const normalized = typeof input === "string" ? { message: input } : input;
    const id = nextId.current++;
    const item: FeedbackItem = { id, tone: normalized.tone ?? "info", ...normalized };
    setItems((current) => [...current.slice(-2), item]);
    window.setTimeout(() => dismiss(id), normalized.duration ?? 4200);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="feedback-region" aria-live="polite" aria-atomic="false">
        {items.map((item) => (
          <div key={item.id} className={`feedback-toast feedback-${item.tone}`} role={item.tone === "error" ? "alert" : "status"}>
            <span>{item.message}</span>
            {item.actionLabel && item.onAction && (
              <button type="button" onClick={() => { item.onAction?.(); dismiss(item.id); }}>{item.actionLabel}</button>
            )}
            <button type="button" className="feedback-close" aria-label="Cerrar notificación" onClick={() => dismiss(item.id)}>×</button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback debe usarse dentro de FeedbackProvider");
  return context;
}
