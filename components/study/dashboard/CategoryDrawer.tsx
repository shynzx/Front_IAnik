import type { CSSProperties, ReactNode } from "react";
import type { ExamSet, FlashcardSet } from "@/types";
import CloseButton from "@/components/ui/CloseButton";
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

const LABELS: Record<FilterCat, string> = {
  pending: "Pendientes",
  review: "Para repasar",
  completed: "Completados",
};

const ICONS: Record<FilterCat, ReactNode> = {
  pending: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  review: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>,
  completed: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>,
};

interface RowProps {
  title: string;
  subtitle: string;
  percent: number;
  accentColor: string;
  badge: string;
  onClick: () => void;
}

function DrawerRow({ title, subtitle, percent, accentColor, badge, onClick }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:border-[var(--drawer-accent)] hover:bg-white/[0.05] focus-visible:border-[var(--drawer-accent)]"
      style={{ "--drawer-accent": `${accentColor}70` } as CSSProperties}
    >
      <Ring percent={percent} size={48} stroke={3.5} color={accentColor} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white">{title}</span>
        <span className="block truncate text-xs text-white/35 mt-1">{subtitle}</span>
      </span>
      <span className="rounded-full border px-2.5 py-1 text-[0.7rem] font-medium shrink-0" style={{ color: accentColor, borderColor: `${accentColor}45`, background: `${accentColor}12` }}>{badge}</span>
      <svg className="w-4 h-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  );
}

export default function CategoryDrawer({ title, accentColor, category, kind, examSets = [], flashcardSets = [], onClose, onOpenExam, onOpenFlashcard }: DrawerProps) {
  const filteredExams = examSets.filter((set) => !set.loading && categorizeExam(set) === category);
  const filteredFlashcards = flashcardSets.filter((set) => !set.loading && categorizeFc(set) === category);
  const count = kind === "exam" ? filteredExams.length : filteredFlashcards.length;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal-panel max-w-xl" role="dialog" aria-modal="true" aria-labelledby="category-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header border-b border-white/[0.07] pb-5">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px]" style={{ color: accentColor, borderColor: `${accentColor}40`, background: `${accentColor}14` }}>{ICONS[category]}</span>
            <div className="min-w-0">
              <h2 id="category-modal-title" className="modal-title truncate">{title}</h2>
              <p className="modal-description">{LABELS[category]} · {count} {kind === "exam" ? (count === 1 ? "examen" : "exámenes") : (count === 1 ? "mazo" : "mazos")}</p>
            </div>
          </div>
          <CloseButton onClick={onClose} />
        </header>

        <div className="modal-body flex flex-col gap-2.5">
          {count === 0 ? (
            <div className="ui-empty min-h-48">
              <span className="w-12 h-12 rounded-xl bg-white/[0.04] text-white/30 flex items-center justify-center mb-3 [&_svg]:w-6 [&_svg]:h-6">{ICONS[category]}</span>
              <p className="text-sm text-white/45 m-0">{category === "pending" ? "No hay elementos pendientes" : category === "review" ? "Nada marcado para repasar" : "Aún no has completado ninguno"}</p>
            </div>
          ) : kind === "exam" ? (
            filteredExams.map((set) => {
              const learned = set.cards.filter((card) => card.status === "learned").length;
              return <DrawerRow key={set.id} title={set.title} subtitle={`${set.topic || "Sin tema"} · ${formatDate(set.createdAt)}`} percent={pct(learned, set.cards.length)} accentColor={accentColor} badge={`${set.cards.length} preg.`} onClick={() => { onClose(); requestAnimationFrame(() => onOpenExam?.(set.id)); }} />;
            })
          ) : (
            filteredFlashcards.map((set) => {
              const learned = set.cards.filter((card) => card.status === "learned").length;
              return <DrawerRow key={set.id} title={set.title} subtitle={`${set.topic || "Sin tema"} · ${formatDate(set.createdAt)}`} percent={pct(learned, set.cards.length)} accentColor={accentColor} badge={`${set.cards.length} tarj.`} onClick={() => { onClose(); requestAnimationFrame(() => onOpenFlashcard?.(set.id)); }} />;
            })
          )}
        </div>
      </section>
    </div>
  );
}
