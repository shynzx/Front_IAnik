import { useState } from "react";
import { pp } from "@/lib/constants";

export default function CategoryButton({ label, icon, count, color, description, onClick, disabled }: { label: string; icon: React.ReactNode; count: number; color: string; description: string; onClick: () => void; disabled?: boolean }) {
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
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}1a`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, transition: "background .15s" }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...pp, fontWeight: 500, fontSize: 13.5, color: "#fff", margin: 0 }}>{label}</p>
        <p style={{ ...pp, fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>{description}</p>
      </div>
      <span style={{ ...pp, fontSize: 13, fontWeight: 600, color: count > 0 ? color : "rgba(255,255,255,0.25)", background: count > 0 ? `${color}20` : "rgba(255,255,255,0.05)", border: `1px solid ${count > 0 ? color + "44" : "rgba(255,255,255,0.1)"}`, padding: "2px 10px", borderRadius: 99, flexShrink: 0 }}>
        {count}
      </span>
    </button>
  );
}
