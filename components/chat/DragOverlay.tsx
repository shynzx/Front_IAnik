import { pp, gradText } from "../../types";

interface DragOverlayProps {
  onDrop: (files: FileList) => void;
  onLeave: () => void;
}

export default function DragOverlay({ onDrop, onLeave }: DragOverlayProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onDragLeave={(e) => !e.relatedTarget && onLeave()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e.dataTransfer.files);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        style={{
          border: "2px dashed #826dd2",
          borderRadius: 28,
          padding: "64px 80px",
          background: "rgba(130,109,210,0.07)",
          backdropFilter: "blur(20px)",
          textAlign: "center",
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#826dd2"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: "0 auto 20px", display: "block" }}
        >
          <path d="M7 18a4.6 4.4 0 010-9 5 4.5 0 0111 2h1a3.5 3.5 0 010 7H8.5" />
          <polyline points="9 15 12 12 15 15" />
          <line x1="12" y1="12" x2="12" y2="21" />
        </svg>
        <h3
          style={{
            ...pp,
            fontWeight: 400,
            fontSize: 20,
            ...gradText,
            marginBottom: 8,
          }}
        >
          Suelta tu archivo aquí
        </h3>
        <p style={{ ...pp, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Lo procesaremos automáticamente
        </p>
      </div>
    </div>
  );
}