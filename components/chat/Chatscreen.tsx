"use client";

import { FormEvent } from "react";
import { Msg, Doc, BG } from "./tokens";
import { Attachment } from "./ChatInput";
import Sidebar from "./Sidebar";
import AuthButtons from "./AuthButtons";
import DocsPanel from "./DocsPanel";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import DragOverlay from "./DragOverlay";

interface ChatScreenProps {
  messages: Msg[];
  docs: Doc[];
  input: string;
  loading: boolean;
  typing: boolean;
  dragActive: boolean;
  docsOpen: boolean;
  docsFullscreen: boolean;
  docSearch: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent, attachments: Attachment[]) => void;
  onFiles: (files: FileList | null) => void;
  onDragLeave: () => void;
  onDocsOpen: (value: boolean) => void;
  onDocsFullscreen: (value: boolean) => void;
  onDocSearchChange: (value: string) => void;
  onTypingComplete: () => void;
  onGoLogin: () => void;
  onGoRegister: () => void;
}

const SIDEBAR_W  = 64;
const DOCPANEL_W = 264;

export default function ChatScreen({
  messages,
  docs,
  input,
  loading,
  typing,
  dragActive,
  docsOpen,
  docsFullscreen,
  docSearch,
  onInputChange,
  onSubmit,
  onFiles,
  onDragLeave,
  onDocsOpen,
  onDocsFullscreen,
  onDocSearchChange,
  onTypingComplete,
  onGoLogin,
  onGoRegister,
}: ChatScreenProps) {
  // How much the main content area is offset from the left
  const panelOpen   = docsOpen && !docsFullscreen;
  const mainPadLeft = SIDEBAR_W + (panelOpen ? DOCPANEL_W : 0);

  return (
    <>
      {/* ── Global layout shell ─────────────────────────── */}
      <style>{`
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }

        /* Smooth panel transition */
        .chat-main {
          transition: margin-left 0.22s ease, width 0.22s ease;
        }

        /* Responsive: collapse docs panel on small screens */
        @media (max-width: 640px) {
          .docs-panel-aside { display: none !important; }
          .chat-main        { margin-left: ${SIDEBAR_W}px !important; width: calc(100% - ${SIDEBAR_W}px) !important; }
        }
      `}</style>

      <div
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          background: BG,
          display: "flex",
          fontFamily: "var(--font-poppins), sans-serif",
          position: "relative",
        }}
      >
        {/* ── Fixed sidebar (always present) ────────────── */}
        <Sidebar
          phase="chat"
          docsOpen={docsOpen}
          docsFullscreen={docsFullscreen}
          hasMessages={messages.length > 0}
          onChatClick={() => { onDocsOpen(false); onDocsFullscreen(false); }}
          onDocsClick={() => onDocsOpen(!docsOpen)}
        />

        {/* ── Docs panel (slides in beside sidebar) ─────── */}
        {docsOpen && !docsFullscreen && (
          <aside
            className="docs-panel-aside"
            style={{
              position: "fixed",
              top: 0,
              left: SIDEBAR_W,
              width: DOCPANEL_W,
              height: "100vh",
              zIndex: 45,
              flexShrink: 0,
            }}
          >
            <DocsPanel
              docs={docs}
              docSearch={docSearch}
              docsFullscreen={false}
              onSearchChange={onDocSearchChange}
              onFullscreen={onDocsFullscreen}
              onClose={() => { onDocsFullscreen(false); onDocsOpen(false); }}
              onFiles={onFiles}
            />
          </aside>
        )}

        {/* Fullscreen docs panel */}
        {docsOpen && docsFullscreen && (
          <DocsPanel
            docs={docs}
            docSearch={docSearch}
            docsFullscreen={true}
            onSearchChange={onDocSearchChange}
            onFullscreen={onDocsFullscreen}
            onClose={() => { onDocsFullscreen(false); onDocsOpen(false); }}
            onFiles={onFiles}
          />
        )}

        {/* ── Main chat area ────────────────────────────── */}
        <main
          className="chat-main"
          style={{
            marginLeft: mainPadLeft,
            width: `calc(100% - ${mainPadLeft}px)`,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Auth buttons — positioned inside main so they never overlap the panel */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              display: "flex",
              gap: 12,
              zIndex: 40,
            }}
          >
            <AuthButtons onGoLogin={onGoLogin} onGoRegister={onGoRegister} />
          </div>

          {/* Scrollable messages area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "64px 32px 0",
              // Custom scrollbar
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(130,109,210,0.3) transparent",
            }}
          >
            <MessageList
              messages={messages}
              loading={loading}
              onTypingComplete={onTypingComplete}
            />
          </div>

          {/* Pinned input bar */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              justifyContent: "center",
              padding: "16px 32px 28px",
              background: "linear-gradient(to top, rgba(0,0,0,0.35) 60%, transparent)",
            }}
          >
            <ChatInput
              value={input}
              loading={loading}
              typing={typing}
              onChange={onInputChange}
              onSubmit={onSubmit}
              onFiles={onFiles}
            />
          </div>
        </main>

        {/* ── Drag overlay ──────────────────────────────── */}
        {dragActive && <DragOverlay onDrop={onFiles} onLeave={onDragLeave} />}
      </div>
    </>
  );
}