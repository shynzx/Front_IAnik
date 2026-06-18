import { pp } from "../../../types";

export default function StatCard({ icon, label, value, sub, accent = "#826dd2" }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: string }) {
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
