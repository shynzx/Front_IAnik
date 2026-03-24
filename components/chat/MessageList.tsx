"use client";

import { useRef, useEffect, useCallback } from "react";
import { Msg, MsgAttachment, gradText } from "./tokens";
import Typewriter from "./Typewriter";
import ChatReadyBanner from "./ChatReadyBanner";

interface MessageListProps {
  messages: Msg[];
  loading: boolean;
  onTypingComplete: () => void;
}

/* ── Attachment preview inside a user bubble ── */
function AttachmentList({ attachments }: { attachments: MsgAttachment[] }) {
  if (!attachments.length) return null;

  const images = attachments.filter(a => a.kind === "image");
  const docs   = attachments.filter(a => a.kind === "document");

  const fileExt = (name: string) =>
    name.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 6 }}>

      {/* Image grid */}
      {images.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: images.length === 1 ? "1fr" : "repeat(2, 1fr)",
            gap: 4,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {images.map(img => (
            <img
              key={img.id}
              src={img.preview}
              alt={img.name}
              style={{
                width: "100%",
                maxWidth: images.length === 1 ? 260 : 120,
                height: images.length === 1 ? 180 : 90,
                objectFit: "cover",
                borderRadius: 10,
                display: "block",
              }}
            />
          ))}
        </div>
      )}

      {/* Doc chips */}
      {docs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {docs.map(doc => (
            <div
              key={doc.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                padding: "4px 10px 4px 7px",
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 7,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: 0.3,
                  flexShrink: 0,
                }}
              >
                {fileExt(doc.name)}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontWeight: 300,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.9)",
                  maxWidth: 140,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {doc.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
export default function MessageList({
  messages,
  loading,
  onTypingComplete,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(
    () => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }),
    []
  );

  useEffect(() => scrollToBottom(), [messages, loading, scrollToBottom]);

  const displayGroups = messages.reduce((acc, m) => {
    if (m.role === "user" || !acc.length) acc.push([]);
    acc[acc.length - 1].push(m);
    return acc;
  }, [] as Msg[][]);

  const pp = {
    fontFamily: "var(--font-poppins), sans-serif",
    fontWeight: 300,
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 720,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        paddingBottom: 32,
        overflowY: "auto",
      }}
    >
      {displayGroups.length === 0 && <ChatReadyBanner />}

      {displayGroups.map((group, gi) => (
        <div
          key={gi}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            marginBottom: 24,
          }}
        >
          {group.map((m, i) => {
            const hasAttachments = m.role === "user" && m.attachments && m.attachments.length > 0;
            const hasText = m.content.trim().length > 0;

            return (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  padding:
                    m.role === "sys"
                      ? "5px 16px"
                      : hasAttachments && !hasText
                      ? "10px 13px"
                      : "13px 17px",
                  borderRadius:
                    m.role === "user"
                      ? "18px 18px 4px 18px"
                      : m.role === "sys"
                      ? 999
                      : "18px 18px 18px 4px",
                  maxWidth: "85%",
                  width: "fit-content",
                  marginLeft:
                    m.role === "user" || m.role === "sys" ? "auto" : undefined,
                  marginRight:
                    m.role === "user" || m.role === "sys" ? 0 : undefined,
                  background:
                    m.role === "user"
                      ? "#826dd2"
                      : "rgba(255,255,255,0.04)",
                  border:
                    m.role === "user"
                      ? "none"
                      : "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: m.role !== "user" ? "blur(8px)" : undefined,
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontWeight: 300,
                  fontSize: m.role === "sys" ? 13 : 16,
                  lineHeight: m.role === "sys" ? "22px" : "28px",
                }}
              >
                {/* Attachments (user messages only) */}
                {m.role === "user" && m.attachments && m.attachments.length > 0 && (
                  <AttachmentList attachments={m.attachments} />
                )}

                {/* Message text */}
                {m.role === "user" && hasText && (
                  <span style={{ color: "#fff" }}>{m.content}</span>
                )}
                {m.role === "sys" && (
                  <span style={{ color: "rgba(255,255,255,0.38)" }}>{m.content}</span>
                )}
                {m.role === "ai" && (
                  <span style={{ display: "block", ...gradText }}>
                    <Typewriter
                      text={m.content}
                      onUpdate={scrollToBottom}
                      onComplete={onTypingComplete}
                    />
                  </span>
                )}
              </div>
            );
          })}

          {/* Loading dots */}
          {gi === displayGroups.length - 1 && loading && (
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                marginLeft: 12,
                marginBottom: 16,
              }}
            >
              <style>{`@keyframes bBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
              {[0, 0.15, 0.3].map((d, k) => (
                <span
                  key={k}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#826dd2",
                    display: "inline-block",
                    animation: `bBounce 1s ${d}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      <div ref={endRef} />
    </div>
  );
}