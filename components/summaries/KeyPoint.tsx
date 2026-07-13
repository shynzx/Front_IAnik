import { pp } from "@/lib/constants";

export default function KeyPoint({ text }: { text: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.75rem", borderRadius: "1.25rem", background: "rgba(130,109,210,0.12)", border: "1px solid rgba(130,109,210,0.25)", fontSize: "0.75rem", ...pp, color: "#c4b5fd", lineHeight: "1.125rem" }}>
      <span style={{ width: "0.3125rem", height: "0.3125rem", borderRadius: "50%", background: "#826dd2", flexShrink: 0, display: "inline-block" }} />
      {text}
    </span>
  );
}
