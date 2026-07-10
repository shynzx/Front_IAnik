import { pp } from "@/lib/constants";
import type { Doc } from "@/types";
import DocIcon from "@/components/chat/DocIcon";
import { formatFileSize } from "@/lib/fileReader";

export default function DocViewer({
  doc,
  onClose,
}: {
  doc: Doc;
  onClose: () => void;
}) {
  const hasContent = doc.content && doc.content.trim().length > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "85vh",
          background: "rgba(10,6,24,0.97)",
          border: "1px solid rgba(130,109,210,0.3)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(130,109,210,0.1)",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <DocIcon type={doc.type} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                ...pp,
                fontWeight: 500,
                fontSize: 15,
                color: "#fff",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {doc.name}
            </p>
            {doc.size != null && (
              <p
                style={{
                  ...pp,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  margin: "2px 0 0",
                }}
              >
                {formatFileSize(doc.size)}
                {doc.uploadedAt &&
                  ` · ${doc.uploadedAt.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}`}
              </p>
            )}
          </div>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            style={{
              color: "rgba(255,255,255,0.45)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 8,
              borderRadius: 8,
              flexShrink: 0,
              lineHeight: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
          }}
        >
          {hasContent ? (
            <pre
              style={{
                ...pp,
                fontSize: 14,
                lineHeight: "24px",
                color: "rgba(255,255,255,0.78)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              {doc.content}
            </pre>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                gap: 14,
                opacity: 0.45,
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3v4a1 1 0 001 1h4" />
                <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="13" y2="17" />
              </svg>
              <p style={{ ...pp, fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
                No se pudo extraer el contenido de este archivo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
