"use client";

import { useState, useEffect } from "react";
import { pp } from "@/lib/constants";
import type { ExamCard, ExamSet } from "@/types";

interface ExamModalProps {
  set: ExamSet;
  onClose: () => void;
  onUpdateCard: (setId: string, cardId: string, status: ExamCard["status"]) => void;
}

export default function ExamModal({ set, onClose, onUpdateCard }: ExamModalProps) {
  const [index, setIndex]                     = useState(0);
  const [flipped, setFlipped]                 = useState(false);
  const [cards, setCards]                     = useState<ExamCard[]>(set.cards);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showHint, setShowHint]               = useState(false);

  useEffect(() => { setCards(set.cards); setFlipped(false); setShowHint(false); }, [set, set.cards]);

  const card     = cards[index];
  const total    = cards.length;
  const learned  = cards.filter(c => c.status === "learned").length;
  const review   = cards.filter(c => c.status === "review").length;
  const progress = total > 0 ? Math.round((learned / total) * 100) : 0;

  const goNext = () => setIndex(i => Math.min(i + 1, total - 1));
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape")     onClose();
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft")  goPrev();
    if (e.key === " " && (!card.answerOptions || card.answerOptions.length === 0)) {
      e.preventDefault();
      setFlipped(f => !f);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const allDone = cards.every(c => c.status !== "pending");
  const isQuiz  = card.answerOptions && card.answerOptions.length > 0;
  const currentSelected = selectedAnswers[card.id] !== undefined ? selectedAnswers[card.id] : null;

  return (
    <div
      className="fc-overlay"
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        .fc-front { backface-visibility: hidden; transform: rotateY(0deg); }
        .fc-back  { backface-visibility: hidden; transform: rotateY(180deg); }
        .fc-scene { perspective: 1200px; }
        .fc-card  { transition: transform 0.45s cubic-bezier(.4,0,.2,1); transform-style: preserve-3d; }
        .fc-card.flipped { transform: rotateY(180deg); }
        .option-btn {
          width: 100%; text-align: left; padding: 11px 15px; border-radius: 10px;
          font-family: var(--font-poppins), sans-serif;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; cursor: pointer; transition: all 0.2s; margin-bottom: 8px;
          display: flex; flex-direction: column;
        }
        .option-btn:hover:not(:disabled) {
          background: rgba(130,109,210,0.14); border-color: rgba(130,109,210,0.35);
        }
        @media (max-width: 850px) {
          .fc-overlay { padding: 12px !important; }
          .fc-modal-container { border-radius: 16px !important; max-height: calc(100vh - 24px) !important; }
          .fc-header { padding: 12px 16px !important; flex-wrap: wrap; gap: 8px !important; }
          .fc-header-info { width: calc(100% - 40px); }
          .fc-header-right { width: 100%; justify-content: flex-start; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; gap: 12px !important; }
          .fc-front, .fc-back { padding: 8px 0 !important; }
          .fc-nav-btn { padding: 8px 12px !important; font-size: 12px !important; }
          .fc-completion-banner { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .fc-completion-btn { margin-left: 0 !important; width: 100%; text-align: center; }
        }
      `}</style>

      <div className="fc-modal-container" style={{
        width: "100%", maxWidth: 840,
        maxHeight: "calc(100vh - 48px)",
        background: "rgba(10,6,24,0.97)",
        border: "1px solid rgba(130,109,210,0.3)",
        borderRadius: 24,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(130,109,210,0.08)",
      }}>

        {/* ── Header ── */}
        <div className="fc-header" style={{
          padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,#826dd2,#4f3fa0)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {/* Exam icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div className="fc-header-info" style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...pp, fontWeight: 500, fontSize: 14.5, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {set.title}
            </p>
            <p style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
              {set.topic} · {total} preguntas
            </p>
          </div>
          <div className="fc-header-right" style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <span style={{ ...pp, fontSize: 11.5, color: "#4ade80", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}/>
              {learned}
            </span>
            <span style={{ ...pp, fontSize: 11.5, color: "#f87171", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", display: "inline-block" }}/>
              {review}
            </span>
            <button aria-label="Cerrar" onClick={onClose} style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, marginLeft: "auto" }}>
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

        {/* ── Card counter ── */}
        <div style={{ padding: "8px 22px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexShrink: 0 }}>
          {cards.map((c, i) => (
            <button
              key={c.id}
              aria-label={`Ir a pregunta ${i + 1}`}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? 20 : 8, height: 8, borderRadius: 99, border: "none", cursor: "pointer", padding: 0, transition: "all .2s",
                background: i === index ? "#826dd2" : c.status === "learned" ? "#4ade80" : c.status === "review" ? "#f87171" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        {/* ── Card area ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 4px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            className="fc-scene"
            onClick={() => { if (!isQuiz) setFlipped(f => !f); }}
            style={{ cursor: isQuiz ? "default" : "pointer", flexShrink: 0 }}
          >
            <div className={`fc-card${flipped && !isQuiz ? " flipped" : ""}`} style={{ position: "relative", minHeight: 320 }}>

              {/* FRONT (Recuadro eliminado, padding ajustado) */}
              <div className="fc-front" style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", padding: "4px 0", gap: 16, minHeight: 320,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ ...pp, fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
                    Pregunta {index + 1} / {total}
                  </span>
                  {card.status !== "pending" && (
                    <span style={{
                      ...pp, fontSize: 11, padding: "2px 9px", borderRadius: 20,
                      background: card.status === "learned" ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
                      color: card.status === "learned" ? "#4ade80" : "#f87171",
                      border: `1px solid ${card.status === "learned" ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
                    }}>
                      {card.status === "learned" ? "Correcta" : "Repasar"}
                    </span>
                  )}
                </div>

                <p style={{ ...pp, fontWeight: 400, fontSize: 16, lineHeight: "26px", color: "#fff", margin: 0, flex: 1 }}>
                  {card.question}
                </p>

                {/* Quiz options */}
                {isQuiz ? (
                  <div>
                    {card.answerOptions!.map((option, oIdx) => {
                      const hasAnswered  = currentSelected !== null;
                      const isSelected   = currentSelected === oIdx;
                      const showFeedback = hasAnswered && isSelected;
                      const customStyle: React.CSSProperties = hasAnswered
                        ? isSelected
                          ? { background: option.isCorrect ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)", borderColor: option.isCorrect ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)", cursor: "default" }
                          : option.isCorrect
                            ? { background: "rgba(74,222,128,0.08)", borderColor: "rgba(74,222,128,0.3)", cursor: "default" }
                            : { opacity: 0.45, cursor: "default" }
                        : {};
                      return (
                        <button
                          key={oIdx}
                          className="option-btn"
                          style={customStyle}
                          disabled={hasAnswered}
                          onClick={e => {
                            e.stopPropagation();
                            const autoStatus = option.isCorrect ? "learned" : "review";
                            setSelectedAnswers(prev => ({ ...prev, [card.id]: oIdx }));
                            setCards(prev => prev.map((c, i) => i === index ? { ...c, status: autoStatus } : c));
                            onUpdateCard(set.id, card.id, autoStatus);
                          }}
                        >
                          <span style={{ fontSize: 13.5, color: "#fff", lineHeight: "20px", fontWeight: 400 }}>
                            {option.text}
                          </span>
                          {showFeedback && (
                            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 500, fontSize: 12.5, color: option.isCorrect ? "#4ade80" : "#f87171" }}>
                                {option.isCorrect
                                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                }
                                {option.isCorrect ? "Respuesta correcta" : "Tu selección"}
                              </div>
                              <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: "19px", fontWeight: 400 }}>
                                {option.rationale || (option.isCorrect ? card.answer : "Revisa la justificación correcta de este concepto.")}
                              </p>
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {card.hint && currentSelected === null && (
                      <div style={{ marginTop: 6 }}>
                        {showHint
                          ? <p style={{ ...pp, fontSize: 12.5, color: "#c4b5fd", fontStyle: "italic", margin: 0 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: 4 }}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 008.91 14"/></svg>Pista: {card.hint}</p>
                          : <button onClick={e => { e.stopPropagation(); setShowHint(true); }} style={{ background: "transparent", border: "none", color: "rgba(130,109,210,0.8)", cursor: "pointer", ...pp, fontSize: 11.5, textDecoration: "underline", padding: 0 }}>Ver pista</button>
                        }
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.22)", marginTop: "auto", textAlign: "center" }}>
                    Clic o espacio para ver respuesta
                  </span>
                )}
              </div>

              {/* BACK (Recuadro eliminado, alineación ajustada) */}
              <div className="fc-back" style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "4px 0", gap: 10, minHeight: 320,
              }}>
                <span style={{ ...pp, fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(196,181,253,0.7)" }}>Respuesta</span>
                <p style={{ ...pp, fontSize: 16, lineHeight: "24px", color: "rgba(255,255,255,0.9)", textAlign: "center", margin: 0 }}>
                  {card.answer}
                </p>
              </div>
            </div>
          </div>

          {/* Mark buttons — shown when card is flipped (non-quiz) */}
          {!isQuiz && (
            <div style={{ 
              display: "flex", 
              gap: 10, 
              flexShrink: 0,
              visibility: flipped ? "visible" : "hidden",
              opacity: flipped ? 1 : 0,
              transition: "opacity 0.2s ease"
            }}>
              <button
                onClick={() => { onUpdateCard(set.id, card.id, "review"); setCards(prev => prev.map((c, i) => i === index ? { ...c, status: "review" } : c)); setFlipped(false); goNext(); }}
                style={{ ...pp, flex: 1, fontSize: 13, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(248,113,113,0.35)", background: "rgba(248,113,113,0.08)", color: "#f87171", cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.16)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(248,113,113,0.08)")}
              >
                Repasar
              </button>
              <button
                onClick={() => { onUpdateCard(set.id, card.id, "learned"); setCards(prev => prev.map((c, i) => i === index ? { ...c, status: "learned" } : c)); setFlipped(false); goNext(); }}
                style={{ ...pp, flex: 1, fontSize: 13, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(74,222,128,0.35)", background: "rgba(74,222,128,0.08)", color: "#4ade80", cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(74,222,128,0.16)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(74,222,128,0.08)")}
              >
                Correcta ✓
              </button>
            </div>
          )}
        </div>

        {/* ── Bottom nav ── */}
        <div style={{ padding: "10px 22px 18px", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={goPrev} disabled={index === 0} className="fc-nav-btn"
              style={{ ...pp, fontSize: 12.5, padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: index === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", cursor: index === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Anterior
            </button>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              {!flipped && !isQuiz && (
                <button onClick={() => setFlipped(true)} className="fc-nav-btn"
                  style={{ ...pp, fontSize: 12.5, padding: "8px 18px", borderRadius: 9, border: "1px solid rgba(130,109,210,0.3)", background: "rgba(130,109,210,0.1)", color: "#c4b5fd", cursor: "pointer" }}>
                  Ver respuesta
                </button>
              )}
            </div>
            <button onClick={goNext} disabled={index === total - 1} className="fc-nav-btn"
              style={{ ...pp, fontSize: 12.5, padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: index === total - 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", cursor: index === total - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              Siguiente
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {allDone && (
            <div className="fc-completion-banner" style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(130,109,210,0.08)", border: "1px solid rgba(130,109,210,0.18)", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
              </svg>
              <p style={{ ...pp, fontSize: 12.5, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                Completaste el examen · {learned} correctas, {review} para repasar
              </p>
              <button
                onClick={() => { setIndex(0); setCards(set.cards.map(c => ({ ...c, status: "pending" }))); setSelectedAnswers({}); }}
                className="fc-completion-btn"
                style={{ ...pp, fontSize: 11.5, padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(130,109,210,0.3)", background: "transparent", color: "#c4b5fd", cursor: "pointer", marginLeft: "auto", whiteSpace: "nowrap" }}>
                Reiniciar
              </button>
            </div>
          )}

          <p style={{ ...pp, fontSize: 10.5, color: "rgba(255,255,255,0.15)", textAlign: "center", margin: 0 }}>
            {isQuiz ? "Selecciona una opción · ← → navegar · Esc cerrar" : "← → navegar · Espacio voltear · Esc cerrar"}
          </p>
        </div>
      </div>
    </div>
  );
}