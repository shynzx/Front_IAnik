import { pp } from "@/lib/constants";
import { pct } from "./types";

export default function OverallBar({ learned, review, pending, total }: { learned: number; review: number; pending: number; total: number }) {
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
