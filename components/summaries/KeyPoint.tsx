import { pp } from "../../types";

export default function KeyPoint({ text }: { text: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(130,109,210,0.12)", border: "1px solid rgba(130,109,210,0.25)", fontSize: 12, ...pp, color: "#c4b5fd", lineHeight: "18px" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#826dd2", flexShrink: 0, display: "inline-block" }} />
      {text}
    </span>
  );
}
