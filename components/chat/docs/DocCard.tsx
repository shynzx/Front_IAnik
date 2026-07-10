import { useState } from "react";
import { Doc } from "@/types";
import DocIcon from "@/components/chat/DocIcon";
import { formatFileSize } from "@/lib/fileReader";
import { highlightMatch } from "./highlightMatch";

export default function DocCard({
  doc,
  searchQuery,
  onClick,
  onDelete,
  deleting,
}: {
  doc: Doc;
  searchQuery: string;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  deleting: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const preview = doc.content?.slice(0, 120).trim();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "14px 14px",
        borderRadius: 14,
        background: hovered ? "rgba(130,109,210,0.1)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? "rgba(130,109,210,0.3)" : "rgba(255,255,255,0.07)"}`,
        cursor: "pointer",
        transition: "all .15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <DocIcon type={doc.type} />
        <span
          style={{
            fontFamily: "var(--font-poppins), sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: "rgba(255,255,255,0.85)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {highlightMatch(doc.name, searchQuery)}
        </span>
      </div>

      {preview && (
        <p
          style={{
            fontFamily: "var(--font-poppins), sans-serif",
            fontWeight: 300,
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            margin: 0,
            lineHeight: "17px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {preview}…
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
        {doc.size != null && (
          <span style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 300, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            {formatFileSize(doc.size)}
          </span>
        )}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-poppins), sans-serif",
              fontWeight: 300,
              fontSize: 11,
              color: hovered ? "#826dd2" : "rgba(255,255,255,0.25)",
              transition: "color .15s",
            }}
          >
            Ver contenido →
          </span>
          <button
            onClick={onDelete}
            disabled={deleting}
            style={{
              color: "rgba(255,255,255,0.4)",
              background: "transparent",
              border: "none",
              cursor: deleting ? "not-allowed" : "pointer",
              padding: 2,
              lineHeight: 0,
            }}
            title="Eliminar"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
