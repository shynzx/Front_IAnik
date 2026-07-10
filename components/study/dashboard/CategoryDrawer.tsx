import { useState } from "react";
import { pp } from "@/lib/constants";
import type { ExamSet, FlashcardSet } from "@/types";
import Ring from "./Ring";
import { FilterCat, pct, formatDate, categorizeExam, categorizeFc } from "./types";

interface DrawerProps {
  title: string;
  accentColor: string;
  category: FilterCat;
  kind: "exam" | "flashcard";
  examSets?: ExamSet[];
  flashcardSets?: FlashcardSet[];
  onClose: () => void;
  onOpenExam?: (id: string) => void;
  onOpenFlashcard?: (id: string) => void;
}

const CAT_LABELS: Record<FilterCat, string> = {
  pending:   "Pendientes",
  review:    "Para repasar",
  completed: "Completados",
};

const CAT_ICONS: Record<FilterCat, React.ReactNode> = {
  pending: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  review: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
    </svg>
  ),
  completed: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

function DrawerRow({ title, sub, percent, color, badge, onClick }: { title: string; sub: string; percent: number; color: string; badge: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ padding: "12px 14px", borderRadius: 12, background: hover ? `${color}14` : "rgba(255,255,255,0.03)", border: `1px solid ${hover ? color + "44" : "rgba(255,255,255,0.07)"}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all .15s" }}>
      <Ring percent={percent} size={44} stroke={3.5} color={color}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...pp, fontWeight: 500, fontSize: 13.5, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
        <p style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>{sub}</p>
      </div>
      <span style={{ ...pp, fontSize: 11, padding: "2px 9px", borderRadius: 99, background: `${color}18`, color, border: `1px solid ${color}33`, flexShrink: 0 }}>{badge}</span>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={`${color}99`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  );
}

export default function CategoryDrawer({ title, accentColor, category, kind, examSets = [], flashcardSets = [], onClose, onOpenExam, onOpenFlashcard }: DrawerProps) {
  const filteredExams = examSets.filter(s => !s.loading && categorizeExam(s) === category);
  const filteredFc    = flashcardSets.filter(s => !s.loading && categorizeFc(s) === category);
  const items = kind === "exam" ? filteredExams : filteredFc;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 560, maxHeight: "80vh", background: "rgba(10,6,24,0.98)", border: "1px solid rgba(130,109,210,0.25)", borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.8)", animation: "drawerIn .2s ease" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `${accentColor}22`, border: `1px solid ${accentColor}44`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor, flexShrink: 0 }}>
            {CAT_ICONS[category]}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ ...pp, fontWeight: 500, fontSize: 14.5, color: "#fff", margin: 0 }}>{title}</p>
            <p style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>{CAT_LABELS[category]} · {items.length} {kind === "exam" ? "examen(es)" : "mazo(s)"}</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 6, borderRadius: 8, lineHeight: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 20px", display: "flex", flexDirection: "column", gap: 8, scrollbarWidth: "thin", scrollbarColor: "rgba(130,109,210,0.3) transparent" }}>
          {items.length === 0 ? (
            <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 0.45 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ ...pp, fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0, textAlign: "center" }}>
                {category === "pending" ? "No hay elementos pendientes" : category === "review" ? "Nada marcado para repasar" : "Aún no completaste ninguno"}
              </p>
            </div>
          ) : kind === "exam" ? (
            filteredExams.map(set => {
              const learned = set.cards.filter(c => c.status === "learned").length;
              const total   = set.cards.length;
              return (
                <DrawerRow
                  key={set.id}
                  title={set.title}
                  sub={`${set.topic} · ${formatDate(set.createdAt)}`}
                  percent={pct(learned, total)}
                  color={accentColor}
                  badge={`${total} preg.`}
                  onClick={() => { onClose(); setTimeout(() => onOpenExam?.(set.id), 80); }}
                />
              );
            })
          ) : (
            filteredFc.map(set => {
              const learned = set.cards.filter(c => c.status === "learned").length;
              const total   = set.cards.length;
              return (
                <DrawerRow
                  key={set.id}
                  title={set.title}
                  sub={`${set.topic} · ${formatDate(set.createdAt)}`}
                  percent={pct(learned, total)}
                  color={accentColor}
                  badge={`${total} tarj.`}
                  onClick={() => { onClose(); setTimeout(() => onOpenFlashcard?.(set.id), 80); }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
