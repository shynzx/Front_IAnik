"use client";

import { useMemo, useState } from "react";
import { pp, gradText, ExamSet, FlashcardSet, ExamCard, Flashcard } from "../chat/tokens";
import FlashcardModal from "../chat/Flashcardmodal";
import ExamModal from "../chat/Exammodal";

interface DashboardScreenProps {
  examSets: ExamSet[];
  flashcardSets: FlashcardSet[];
  onUpdateFlashcard: (setId: string, cardId: string, status: Flashcard["status"]) => void;
  onUpdateExamCard:  (setId: string, cardId: string, status: ExamCard["status"])   => void;
}

type FilterCat = "pending" | "review" | "completed";

function pct(done: number, total: number) { return total > 0 ? Math.round((done / total) * 100) : 0; }
function formatDate(d: Date) { return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }); }

/* ── Ring ── */
function Ring({ percent, size = 44, stroke = 3.5, color = "#826dd2" }: { percent: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ/4} strokeLinecap="round"
        style={{ transition: "stroke-dasharray .5s ease" }}/>
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="#fff"
        fontSize={size/4} fontFamily="var(--font-poppins),sans-serif" fontWeight={600}>{percent}%</text>
    </svg>
  );
}

/* ── Stat card ── */
function StatCard({ icon, label, value, sub, accent = "#826dd2" }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{ flex: "1 1 130px", minWidth: 0, padding: "15px 16px", borderRadius: 13, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 7, boxSizing: "border-box" }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${accent}22`, border: `1px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ ...pp, fontSize: 22, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1 }}>{value}</p>
        <p style={{ ...pp, fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "3px 0 0" }}>{label}</p>
        {sub && <p style={{ ...pp, fontSize: 10.5, color: accent, margin: "2px 0 0" }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Overall bar ── */
function OverallBar({ learned, review, pending, total }: { learned: number; review: number; pending: number; total: number }) {
  const lw = pct(learned, total), rw = pct(review, total);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ height: 7, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${lw}%`, height: "100%", background: "#4ade80", transition: "width .5s ease" }}/>
        <div style={{ width: `${rw}%`, height: "100%", background: "#f87171", transition: "width .5s ease" }}/>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {[{ c: "#4ade80", l: "Aprendidas", v: learned }, { c: "#f87171", l: "Repasar", v: review }, { c: "#FFFFFF", l: "Pendientes", v: pending }].map(x => (
          <span key={x.l} style={{ ...pp, fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: x.c, display: "inline-block" }}/>{x.v} {x.l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CATEGORY DRAWER — panel que aparece por encima
═══════════════════════════════════════════════════════ */
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

function categorizeExam(set: ExamSet): FilterCat {
  if (set.cards.some(c => c.status === "pending")) return "pending";
  if (set.cards.some(c => c.status === "review"))  return "review";
  return "completed";
}
function categorizeFc(set: FlashcardSet): FilterCat {
  if (set.cards.some(c => c.status === "pending")) return "pending";
  if (set.cards.some(c => c.status === "review"))  return "review";
  return "completed";
}

function CategoryDrawer({ title, accentColor, category, kind, examSets = [], flashcardSets = [], onClose, onOpenExam, onOpenFlashcard }: DrawerProps) {
  const filteredExams = examSets.filter(s => !s.loading && categorizeExam(s) === category);
  const filteredFc    = flashcardSets.filter(s => !s.loading && categorizeFc(s) === category);
  const items = kind === "exam" ? filteredExams : filteredFc;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`@keyframes drawerIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}`}</style>
      <div style={{ width: "100%", maxWidth: 560, maxHeight: "80vh", background: "rgba(10,6,24,0.98)", border: "1px solid rgba(130,109,210,0.25)", borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.8)", animation: "drawerIn .2s ease" }}>

        {/* Header */}
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

        {/* List */}
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

/* ═══════════════════════════════════════════════════════
   CATEGORY BUTTON — uno de los 3 botones de la columna
═══════════════════════════════════════════════════════ */
function CategoryButton({ label, icon, count, color, description, onClick, disabled }: { label: string; icon: React.ReactNode; count: number; color: string; description: string; onClick: () => void; disabled?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...pp, width: "100%", padding: "14px 16px", borderRadius: 13,
        background: hover && !disabled ? `${color}18` : "rgba(255,255,255,0.025)",
        border: `1px solid ${hover && !disabled ? color + "55" : "rgba(255,255,255,0.07)"}`,
        cursor: disabled ? "default" : "pointer", transition: "all .15s",
        display: "flex", alignItems: "center", gap: 12, textAlign: "left",
        opacity: disabled ? 0.45 : 1,
        boxSizing: "border-box",
      }}>
      {/* Icon circle */}
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}1a`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, transition: "background .15s" }}>
        {icon}
      </div>
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...pp, fontWeight: 500, fontSize: 13.5, color: "#fff", margin: 0 }}>{label}</p>
        <p style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>{description}</p>
      </div>
      {/* Count badge */}
      <span style={{ ...pp, fontSize: 13, fontWeight: 600, color: count > 0 ? color : "rgba(255,255,255,0.25)", background: count > 0 ? `${color}20` : "rgba(255,255,255,0.05)", border: `1px solid ${count > 0 ? color + "44" : "rgba(255,255,255,0.1)"}`, padding: "2px 10px", borderRadius: 99, flexShrink: 0 }}>
        {count}
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   COLUMN PANELS
═══════════════════════════════════════════════════════ */
function ExamColumn({ examSets, onUpdateExamCard }: { examSets: ExamSet[]; onUpdateExamCard: (setId: string, cardId: string, status: ExamCard["status"]) => void }) {
  const [drawerCat, setDrawerCat]   = useState<FilterCat | null>(null);
  const [openExamId, setOpenExamId] = useState<string | null>(null);
  const activeExam = openExamId ? examSets.find(s => s.id === openExamId) ?? null : null;

  const counts = {
    pending:   examSets.filter(s => !s.loading && categorizeExam(s) === "pending").length,
    review:    examSets.filter(s => !s.loading && categorizeExam(s) === "review").length,
    completed: examSets.filter(s => !s.loading && categorizeExam(s) === "completed").length,
  };

  return (
    <>
      {activeExam && <ExamModal set={activeExam} onClose={() => setOpenExamId(null)} onUpdateCard={onUpdateExamCard}/>}
      {drawerCat && (
        <CategoryDrawer
          title="Exámenes" accentColor="#826dd2" category={drawerCat} kind="exam"
          examSets={examSets} onClose={() => setDrawerCat(null)}
          onOpenExam={id => setOpenExamId(id)}
        />
      )}

      <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", boxSizing: "border-box", gap: 10 }}>
        {/* Column header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(130,109,210,0.18)", border: "1px solid rgba(130,109,210,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <p style={{ ...pp, fontWeight: 500, fontSize: 14, color: "rgba(255,255,255,0.85)", margin: 0 }}>Exámenes</p>
          <span style={{ ...pp, fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "rgba(130,109,210,0.18)", color: "#c4b5fd", border: "1px solid rgba(130,109,210,0.25)" }}>
            {examSets.filter(s => !s.loading).length}
          </span>
        </div>

        {/* Loading state */}
        {examSets.some(s => s.loading) && (
          <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            <p style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>Generando…</p>
          </div>
        )}

        {/* 3 category buttons */}
        <CategoryButton
          label="Pendientes" color="#ffffff" count={counts.pending}
          description="Sin responder todavía"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          onClick={() => setDrawerCat("pending")}
          disabled={counts.pending === 0}
        />
        <CategoryButton
          label="Para repasar" color="#f87171" count={counts.review}
          description="Marcados para reforzar"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>}
          onClick={() => setDrawerCat("review")}
          disabled={counts.review === 0}
        />
        <CategoryButton
          label="Completados" color="#4ade80" count={counts.completed}
          description="Todo respondido"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          onClick={() => setDrawerCat("completed")}
          disabled={counts.completed === 0}
        />
      </div>
    </>
  );
}

function FlashcardColumn({ flashcardSets, onUpdateFlashcard }: { flashcardSets: FlashcardSet[]; onUpdateFlashcard: (setId: string, cardId: string, status: Flashcard["status"]) => void }) {
  const [drawerCat, setDrawerCat]     = useState<FilterCat | null>(null);
  const [openFcId, setOpenFcId]       = useState<string | null>(null);
  const activeFc = openFcId ? flashcardSets.find(s => s.id === openFcId) ?? null : null;

  const counts = {
    pending:   flashcardSets.filter(s => !s.loading && categorizeFc(s) === "pending").length,
    review:    flashcardSets.filter(s => !s.loading && categorizeFc(s) === "review").length,
    completed: flashcardSets.filter(s => !s.loading && categorizeFc(s) === "completed").length,
  };

  return (
    <>
      {activeFc && <FlashcardModal set={activeFc} onClose={() => setOpenFcId(null)} onUpdateCard={onUpdateFlashcard}/>}
      {drawerCat && (
        <CategoryDrawer
          title="Flashcards" accentColor="#a78bfa" category={drawerCat} kind="flashcard"
          flashcardSets={flashcardSets} onClose={() => setDrawerCat(null)}
          onOpenFlashcard={id => setOpenFcId(id)}
        />
      )}

      <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", boxSizing: "border-box", gap: 10 }}>
        {/* Column header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(167,139,250,0.18)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
            </svg>
          </div>
          <p style={{ ...pp, fontWeight: 500, fontSize: 14, color: "rgba(255,255,255,0.85)", margin: 0 }}>Flashcards</p>
          <span style={{ ...pp, fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "rgba(167,139,250,0.18)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.25)" }}>
            {flashcardSets.filter(s => !s.loading).length}
          </span>
        </div>

        {flashcardSets.some(s => s.loading) && (
          <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            <p style={{ ...pp, fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>Generando…</p>
          </div>
        )}

        <CategoryButton
          label="Pendientes" color="#ffffff" count={counts.pending}
          description="Sin repasar todavía"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          onClick={() => setDrawerCat("pending")}
          disabled={counts.pending === 0}
        />
        <CategoryButton
          label="Para repasar" color="#f87171" count={counts.review}
          description="Marcadas para reforzar"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>}
          onClick={() => setDrawerCat("review")}
          disabled={counts.review === 0}
        />
        <CategoryButton
          label="Completadas" color="#4ade80" count={counts.completed}
          description="Todas aprendidas"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          onClick={() => setDrawerCat("completed")}
          disabled={counts.completed === 0}
        />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════ */
export default function DashboardScreen({ examSets, flashcardSets, onUpdateFlashcard, onUpdateExamCard }: DashboardScreenProps) {
  const stats = useMemo(() => {
    const ae = examSets.flatMap(s => s.cards), af = flashcardSets.flatMap(s => s.cards);
    const el = ae.filter(c => c.status === "learned").length, er = ae.filter(c => c.status === "review").length, ep = ae.filter(c => c.status === "pending").length;
    const fl = af.filter(c => c.status === "learned").length, fr = af.filter(c => c.status === "review").length, fp = af.filter(c => c.status === "pending").length;
    const total = ae.length + af.length, learned = el + fl;
    return { total, learned, globalPct: pct(learned, total), er, ep, fr, fp, aeLen: ae.length, afLen: af.length };
  }, [examSets, flashcardSets]);

  const hasContent = examSets.length > 0 || flashcardSets.length > 0;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18, boxSizing: "border-box" }}>
      {/* Header */}
      <div>
        <h1 style={{ ...pp, fontWeight: 400, fontSize: 24, ...gradText, margin: "0 0 4px" }}>Dashboard de progreso</h1>
        <p style={{ ...pp, fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>Seguimiento de tu actividad con exámenes y flashcards.</p>
      </div>

      {!hasContent && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 0", gap: 14, opacity: 0.5 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <p style={{ ...pp, fontSize: 13.5, color: "rgba(255,255,255,0.5)", textAlign: "center", margin: 0, maxWidth: 280, lineHeight: "22px" }}>
            Pídele a la IA que genere un <strong style={{ color: "#c4b5fd" }}>examen</strong> o <strong style={{ color: "#c4b5fd" }}>flashcards</strong> y aparecerán aquí.
          </p>
        </div>
      )}

      {hasContent && (
        <>
          {/* Stat cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>} label="Exámenes" value={examSets.filter(s=>!s.loading).length} sub={`${stats.aeLen} preguntas`}/>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg>} label="Flashcards" value={flashcardSets.filter(s=>!s.loading).length} accent="#a78bfa" sub={`${stats.afLen} tarjetas`}/>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>} label="Correctas" value={stats.learned} accent="#4ade80" sub={`${stats.globalPct}% dominio`}/>
            <StatCard icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>} label="Para repasar" value={stats.er + stats.fr} accent="#f87171"/>
          </div>

          {/* Global progress bar */}
          <div style={{ padding: "13px 16px", borderRadius: 13, background: "rgba(130,109,210,0.06)", border: "1px solid rgba(130,109,210,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
              <p style={{ ...pp, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.6)", margin: 0 }}>Progreso global</p>
              <span style={{ ...pp, fontSize: 19, fontWeight: 600, color: "#826dd2" }}>{stats.globalPct}%</span>
            </div>
            <OverallBar learned={stats.learned} review={stats.er + stats.fr} pending={stats.ep + stats.fp} total={stats.total}/>
          </div>

          {/* Two-column layout with category buttons */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <ExamColumn examSets={examSets} onUpdateExamCard={onUpdateExamCard}/>
            <FlashcardColumn flashcardSets={flashcardSets} onUpdateFlashcard={onUpdateFlashcard}/>
          </div>
        </>
      )}
    </div>
  );
}