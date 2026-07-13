export type FilterCat = "pending" | "review" | "completed";

export function pct(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function formatDate(d?: Date) {
  return d ? d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "";
}

import { ExamSet, FlashcardSet } from "@/types";

export function categorizeExam(set: ExamSet): FilterCat {
  if (set.cards.some(c => c.status === "pending")) return "pending";
  if (set.cards.some(c => c.status === "review"))  return "review";
  return "completed";
}

export function categorizeFc(set: FlashcardSet): FilterCat {
  if (set.cards.some(c => c.status === "pending")) return "pending";
  if (set.cards.some(c => c.status === "review"))  return "review";
  return "completed";
}
