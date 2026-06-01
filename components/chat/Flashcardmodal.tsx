"use client";

import { useState, useEffect } from "react";
import { pp, Flashcard, FlashcardSet } from "./tokens";

interface FlashcardModalProps {
  set: FlashcardSet;
  onClose: () => void;
  onUpdateCard: (setId: string, cardId: string, status: Flashcard["status"]) => void;
}

export default function FlashcardModal({ set, onClose, onUpdateCard }: FlashcardModalProps) {
  const [index, setIndex]                   = useState(0);
  const [flipped, setFlipped]               = useState(false);
  const [cards, setCards]                   = useState<Flashcard[]>(set.cards);
  
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showHint, setShowHint]             = useState(false);

  useEffect(() => { setCards(set.cards); }, [set.cards]);

  useEffect(() => { 
    setFlipped(false); 
    setShowHint(false);
  }, [index]);

  const card     = cards[index];
  const total    = cards.length;
  const learned  = cards.filter(c => c.status === "learned").length;
  const review   = cards.filter(c => c.status === "review").length;
  const progress = total > 0 ? Math.round((learned / total) * 100) : 0;

  const goNext = () => setIndex(i => Math.min(i + 1, total - 1));
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape")      onClose();
    if (e.key === "ArrowRight")  goNext();
    if (e.key === "ArrowLeft")   goPrev();
    if (e.key === " " && (!card.answerOptions || card.answerOptions.length === 0)) { 
      e.preventDefault(); 
      setFlipped(f => !f); 
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const statusColor = (s: Flashcard["status"]) =>
    s === "learned" ? "#4ade80" : s === "review" ? "#f87171" : "rgba(255,255,255,0.2)";

  const allDone = cards.every(c => c.status !== "pending");
  const isQuiz  = card.answerOptions && card.answerOptions.length > 0;
  
  const currentSelected = selectedAnswers[card.id] !== undefined ? selectedAnswers[card.id] : null;

  return (
    <div
      className="fc-overlay"
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        .fc-front { backface-visibility: hidden; transform: rotateY(0deg); }
        .fc-back  { backface-visibility: hidden; transform: rotateY(180deg); }
        .fc-scene { perspective: 1200px; }
        .fc-card  { transition: transform 0.45s cubic-bezier(.4,0,.2,1); transform-style: preserve-3d; }
        .fc-card.flipped { transform: rotateY(180deg); }
        
        /* Reducido el padding de 14px 18px a 11px 15px y el margen a 8px */
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
          .fc-front, .fc-back { padding: 16px 20px !important; }
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

        {/* Header */}
        <div className="fc-header" style={{
          padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,#826dd2,#4f3fa0)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <div className="fc-header-info" style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...pp, fontWeight: 500, fontSize: 14.5, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {set.title}
            </p>
            <p style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
              {set.topic} · {total} tarjetas
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
            <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, marginLeft: "auto" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.05)", flexShrink: 0 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#826dd2,#4f3fa0)", transition: "width 0.4s ease", borderRadius: 2 }}/>
        </div>

        {/* Card counter */}
        <div style={{ padding: "12px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ ...pp, fontSize: 12.5, color: "rgba(255,255,255,0.35)" }}>
            {index + 1} / {total}
          </span>
          <span style={{ ...pp, fontSize: 11.5, color: statusColor(card.status), background: card.status !== "pending" ? `${statusColor(card.status)}15` : "transparent", padding: card.status !== "pending" ? "2px 8px" : 0, borderRadius: 20 }}>
            {card.status === "learned" ? "✓ Aprendida" : card.status === "review" ? "↩ Repasar" : ""}
          </span>
        </div>

        {/* Flashcard Scene */}
        <div className="fc-scene" style={{ padding: "12px 22px 6px", flex: 1, overflowY: "auto" }} onClick={() => { if (!isQuiz) setFlipped(f => !f); }}>
          <div className={`fc-card${flipped ? " flipped" : ""}`} style={{ width: "100%", minHeight: 240, position: "relative", cursor: isQuiz ? "default" : "pointer" }}>
            
            {/* FRONT SIDE */}
            <div className="fc-front" style={{
              position: flipped ? "absolute" : "relative", inset: 0,
              background: "rgba(130,109,210,0.06)", border: "1px solid rgba(130,109,210,0.2)", borderRadius: 16,
              display: "flex", flexDirection: "column", padding: "20px 24px", gap: 10, minHeight: 240,
            }}>
              <span style={{ ...pp, fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(130,109,210,0.7)" }}>
                {isQuiz ? "Cuestionario interactivo" : "Pregunta"}
              </span>
              
              <p style={{ ...pp, fontSize: 16, lineHeight: "24px", color: "#fff", margin: "0 0 4px 0", fontWeight: 400 }}>
                {card.question}
              </p>

              {isQuiz ? (
                <div style={{ width: "100%" }}>
                  {card.answerOptions?.map((option, oIdx) => {
                    let customStyle: React.CSSProperties = {};
                    const isSelected = currentSelected === oIdx;
                    const hasAnswered = currentSelected !== null;
                    const showFeedback = hasAnswered && (isSelected || option.isCorrect);

                    if (hasAnswered) {
                      if (option.isCorrect) {
                        customStyle = { background: "rgba(74,222,128,0.08)", borderColor: "#4ade80" };
                      } else if (isSelected) {
                        customStyle = { background: "rgba(248,113,113,0.08)", borderColor: "#f87171" };
                      } else {
                        customStyle = { opacity: 0.35 };
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        className="option-btn"
                        style={customStyle}
                        disabled={hasAnswered}
                        onClick={(e) => {
                          e.stopPropagation();
                          const autoStatus = option.isCorrect ? "learned" : "review";
                          setSelectedAnswers(prev => ({ ...prev, [card.id]: oIdx }));
                          setCards(prev => prev.map((c, i) => i === index ? { ...c, status: autoStatus } : c));
                          onUpdateCard(set.id, card.id, autoStatus);
                        }}
                      >
                        {/* Texto de la opción optimizado a 13.5px */}
                        <span style={{ fontSize: 13.5, color: "#fff", lineHeight: "20px", fontWeight: 400 }}>
                          {option.text}
                        </span>

                        {/* Feedback compacto in-line */}
                        {showFeedback && (
                          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 500, fontSize: 12.5, color: option.isCorrect ? "#4ade80" : "#f87171" }}>
                              {option.isCorrect ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              )}
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
                      {showHint ? (
                        <p style={{ ...pp, fontSize: 12.5, color: "#c4b5fd", fontStyle: "italic", margin: 0 }}>
                          💡 Pista: {card.hint}
                        </p>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setShowHint(true); }} style={{ background: "transparent", border: "none", color: "rgba(130,109,210,0.8)", cursor: "pointer", ...pp, fontSize: 11.5, textDecoration: "underline", padding: 0 }}>
                          Ver pista
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.22)", marginTop: "auto", textAlign: "center" }}>
                  Clic o espacio para ver respuesta
                </span>
              )}
            </div>

            {/* BACK SIDE */}
            <div className="fc-back" style={{
              position: "absolute", inset: 0,
              background: "rgba(79,63,160,0.12)", border: "1px solid rgba(130,109,210,0.3)", borderRadius: 16,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "24px 28px", gap: 10, minHeight: 240,
            }}>
              <span style={{ ...pp, fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(196,181,253,0.7)" }}>Respuesta</span>
              <p style={{ ...pp, fontSize: 16, lineHeight: "24px", color: "rgba(255,255,255,0.9)", textAlign: "center", margin: 0 }}>
                {card.answer}
              </p>
            </div>
          </div>
        </div>

        {/* Barra inferior de acciones */}
        <div style={{ padding: "10px 22px 18px", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
          
          <div className="fc-nav-row" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={goPrev}
              disabled={index === 0}
              className="fc-nav-btn"
              style={{
                ...pp, fontSize: 12.5, padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: index === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                cursor: index === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Anterior
            </button>

            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              {!flipped && !isQuiz && (
                <button
                  onClick={() => setFlipped(true)}
                  className="fc-nav-btn"
                  style={{ ...pp, fontSize: 12.5, padding: "8px 18px", borderRadius: 9, border: "1px solid rgba(130,109,210,0.3)", background: "rgba(130,109,210,0.1)", color: "#c4b5fd", cursor: "pointer" }}
                >
                  Ver respuesta
                </button>
              )}
            </div>

            <button
              onClick={goNext}
              disabled={index === total - 1}
              className="fc-nav-btn"
              style={{
                ...pp, fontSize: 12.5, padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: index === total - 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                cursor: index === total - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5,
              }}
            >
              Siguiente
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {allDone && (
            <div className="fc-completion-banner" style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(130,109,210,0.08)", border: "1px solid rgba(130,109,210,0.18)", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
              </svg>
              <p style={{ ...pp, fontSize: 12.5, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                Completaste todas las tarjetas · {learned} aprendidas, {review} para repasar
              </p>
              <button
                onClick={() => { 
                  setIndex(0); 
                  setCards(set.cards.map(c => ({ ...c, status: "pending" }))); 
                  setSelectedAnswers({});
                }}
                className="fc-completion-btn"
                style={{ ...pp, fontSize: 11.5, padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(130,109,210,0.3)", background: "transparent", color: "#c4b5fd", cursor: "pointer", marginLeft: "auto", whiteSpace: "nowrap" }}
              >
                Reiniciar
              </button>
            </div>
          )}

          <p style={{ ...pp, fontSize: 10.5, color: "rgba(255,255,255,0.15)", textAlign: "center", margin: 0 }}>
            {isQuiz ? "Selecciona una opción para responder · ← → navegar · Esc cerrar" : "← → navegar · Espacio voltear · Esc cerrar"}
          </p>
        </div>
      </div>
    </div>
  );
}