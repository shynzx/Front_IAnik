import { Doc } from "../../types";

interface DocIconProps {
  type: Doc["type"];
}

export default function DocIcon({ type }: DocIconProps) {
  if (type === "pdf") {
    return (
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#e53935,#b71c1c)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: 0.5,
        }}
      >
        PDF
      </span>
    );
  }

  return (
    <span
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#1565c0,#7b1fa2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 3v4a1 1 0 001 1h4" />
        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
        <path d="M9 15l1.5-6 1.5 4 1.5-4 1.5 6" />
      </svg>
    </span>
  );
}