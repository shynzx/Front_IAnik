"use client";

import { useState, useEffect } from "react";
import { pp } from "@/lib/constants";
import type { Flashcard, FlashcardSet } from "@/types";

interface FlashcardModalProps {
  set: FlashcardSet;
  onClose: () => void;
  onUpdateCard: (setId: string, cardId: string, status: Flashcard["status"]) => void;
}

export default function FlashcardModal({ set, onClose, onUpdateCard }: FlashcardModalProps) {
  const [index, setIndex]   = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cards, setCards]   = useState<Flashcard[]>(set.cards);

  useEffect(() => { setCards(set.cards); setFlipped(false); }, [set, set.cards]);

  const card    = cards[index];
  const total   = cards.length;
  const learned = cards.filter(c => c.status === "learned").length;
  const review  = cards.filter(c => c.status === "review").length;

  const goNext = () => setIndex(i => Math.min(i + 1, total - 1));
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

  const markAndNext = (status: Flashcard["status"]) => {
    onUpdateCard(set.id, card.id, status);
    setCards(prev => prev.map((c, i) => i === index ? { ...c, status } : c));
    setFlipped(false);
    if (index < total - 1) goNext();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === " ")          { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const allDone  = cards.every(c => c.status !== "pending");
  const progress = total > 0 ? Math.round((learned / total) * 100) : 0;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        .fcard { transition: transform 0.42s cubic-bezier(.4,0,.2,1); transform-style: preserve-3d; perspective: 1200px; }
        .fcard.flipped { transform: rotateY(180deg); }
        .fcard-front { backface-visibility: hidden; transform: rotateY(0deg); }
        .fcard-back  { backface-visibility: hidden; transform: rotateY(180deg); }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 680,
        maxHeight: "calc(100vh - 48px)",
        background: "rgba(10,6,24,0.97)",
        border: "1px solid rgba(130,109,210,0.3)",
        borderRadius: 24,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
        animation: "fcIn .2s ease",
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,#826dd2,#4f3fa0)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {/* Stack-of-cards icon */}
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...pp, fontWeight: 500, fontSize: 14.5, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {set.title}
            </p>
            <p style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
              {set.topic} · {total} tarjetas
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
            <span style={{ ...pp, fontSize: 11.5, color: "#4ade80", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}/>
              {learned}
            </span>
            <span style={{ ...pp, fontSize: 11.5, color: "#f87171", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", display: "inline-block" }}/>
              {review}
            </span>
            <button aria-label="Cerrar" onClick={onClose} style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, lineHeight: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#826dd2,#c4b5fd)", transition: "width .4s ease" }} />
        </div>

        {/* ── Dot navigator ── */}
        <div style={{ padding: "10px 22px 0", display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
          {cards.map((c, i) => (
            <button
              key={c.id}
              aria-label={`Ir a tarjeta ${i + 1}`}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? 20 : 8, height: 8, borderRadius: 99, border: "none", cursor: "pointer", padding: 0, transition: "all .2s",
                background: i === index ? "#826dd2" : c.status === "learned" ? "#4ade80" : c.status === "review" ? "#f87171" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        {/* ── Flip card ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            className={`fcard${flipped ? " flipped" : ""}`}
            onClick={() => setFlipped(f => !f)}
            style={{ position: "relative", minHeight: 320, cursor: "pointer", flexShrink: 0 }}
          >
            {/* FRONT */}
            <div className="fcard-front" style={{
              position: "absolute", inset: 0,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "28px 32px", gap: 14, minHeight: 320,
            }}>
              <span style={{ ...pp, fontSize: 10.5, letterSpacing: 0.9, textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                Pregunta {index + 1} / {total}
              </span>
              <p style={{ ...pp, fontWeight: 400, fontSize: 17, lineHeight: "28px", color: "#fff", textAlign: "center", margin: 0 }}>
                {card.question}
              </p>
              {card.status !== "pending" && (
                <span style={{
                  ...pp, fontSize: 11, padding: "2px 10px", borderRadius: 20,
                  background: card.status === "learned" ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
                  color: card.status === "learned" ? "#4ade80" : "#f87171",
                  border: `1px solid ${card.status === "learned" ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
                }}>
                  {card.status === "learned" ? "Aprendida" : "Repasar"}
                </span>
              )}
              <span style={{ ...pp, fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
                Toca para ver la respuesta
              </span>
            </div>

            {/* BACK */}
            <div className="fcard-back" style={{
              position: "absolute", inset: 0,
              background: "rgba(79,63,160,0.13)", border: "1px solid rgba(130,109,210,0.35)", borderRadius: 16,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "28px 32px", gap: 14, minHeight: 320,
              boxShadow: "0 0 40px rgba(130,109,210,0.12)",
            }}>
              <span style={{ ...pp, fontSize: 10.5, letterSpacing: 0.9, textTransform: "uppercase", color: "rgba(196,181,253,0.6)" }}>
                Respuesta
              </span>
              <p style={{ ...pp, fontSize: 16, lineHeight: "26px", color: "rgba(255,255,255,0.9)", textAlign: "center", margin: 0 }}>
                {card.answer}
              </p>
            </div>
          </div>

          {/* ── Mark buttons — Siempre presentes pero ocultos si no está volteado para evitar saltos ── */}
          <div style={{ 
            display: "flex", 
            gap: 10, 
            flexShrink: 0,
            visibility: flipped ? "visible" : "hidden",
            opacity: flipped ? 1 : 0,
            transition: "opacity 0.2s ease"
          }}>
            <button
              onClick={() => markAndNext("review")}
              style={{ ...pp, flex: 1, fontSize: 13, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(248,113,113,0.35)", background: "rgba(248,113,113,0.08)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.16)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(248,113,113,0.08)")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              Repasar
            </button>
            <button
              onClick={() => markAndNext("learned")}
              style={{ ...pp, flex: 1, fontSize: 13, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(74,222,128,0.35)", background: "rgba(74,222,128,0.08)", color: "#4ade80", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(74,222,128,0.16)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(74,222,128,0.08)")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Aprendida
            </button>
          </div>
        </div>

        {/* ── Bottom nav ── */}
        <div style={{ padding: "10px 22px 18px", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={goPrev} disabled={index === 0}
              style={{ ...pp, fontSize: 12.5, padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: index === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", cursor: index === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Anterior
            </button>

            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              {!flipped && (
                <button onClick={() => setFlipped(true)}
                  style={{ ...pp, fontSize: 12.5, padding: "8px 18px", borderRadius: 9, border: "1px solid rgba(130,109,210,0.3)", background: "rgba(130,109,210,0.1)", color: "#c4b5fd", cursor: "pointer" }}>
                  Ver respuesta
                </button>
              )}
            </div>

            <button onClick={goNext} disabled={index === total - 1}
              style={{ ...pp, fontSize: 12.5, padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: index === total - 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", cursor: index === total - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              Siguiente
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {allDone && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(130,109,210,0.08)", border: "1px solid rgba(130,109,210,0.18)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
              </svg>
              <p style={{ ...pp, fontSize: 12.5, color: "rgba(255,255,255,0.6)", margin: 0, flex: 1 }}>
                ¡Completaste el mazo! · {learned} aprendidas, {review} para repasar
              </p>
              <button
                onClick={() => { setIndex(0); setCards(set.cards.map(c => ({ ...c, status: "pending" }))); }}
                style={{ ...pp, fontSize: 11.5, padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(130,109,210,0.3)", background: "transparent", color: "#c4b5fd", cursor: "pointer", whiteSpace: "nowrap" }}>
                Reiniciar
              </button>
            </div>
          )}

          <p style={{ ...pp, fontSize: 10.5, color: "rgba(255,255,255,0.15)", textAlign: "center", margin: 0 }}>
            ← → navegar · Espacio voltear · Esc cerrar
          </p>
        </div>
      </div>
    </div>
  );
}