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
  onDeleteDoc: (doc: Doc) => Promise<void>;
  onDragLeave: () => void;
  onDocsOpen: (value: boolean) => void;
  onDocsFullscreen: (value: boolean) => void;
  onDocSearchChange: (value: string) => void;
  onTypingComplete: () => void;
  onGoLogin: () => void;
  onGoRegister: () => void;
  onEditMessage: (index: number, newContent: string) => void;
}

const SIDEBAR_W  = 64;
const DOCPANEL_W = 264;
// Auth buttons are ~220px wide at right:24 — reserve that from the right
// so bubbles never reach them.
const AUTH_BTN_RESERVED = 230;

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
  onDeleteDoc,
  onDragLeave,
  onDocsOpen,
  onDocsFullscreen,
  onDocSearchChange,
  onTypingComplete,
  onGoLogin,
  onGoRegister,
  onEditMessage,
}: ChatScreenProps) {
  const panelOpen   = docsOpen && !docsFullscreen;
  const mainPadLeft = SIDEBAR_W + (panelOpen ? DOCPANEL_W : 0);

  // When the docs panel is open the main column is narrower, so we shrink
  // the content max-width to keep everything centred and away from the
  // auth buttons on the right.
  const contentMaxWidth = panelOpen ? 670 : 720;

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }

        .chat-main { transition: margin-left 0.22s ease, width 0.22s ease; }
        .chat-content { transition: max-width 0.22s ease; }

        /* Thin purple scrollbar flush against the right window edge */
        .chat-scroll::-webkit-scrollbar       { width: 6px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(130,109,210,0.35);
          border-radius: 99px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(130,109,210,0.6);
        }

        @media (max-width: 640px) {
          .docs-panel-aside { display: none !important; }
          .chat-main {
            margin-left: ${SIDEBAR_W}px !important;
            width: calc(100% - ${SIDEBAR_W}px) !important;
          }
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
        {/* ── Fixed sidebar ─────────────────────────────────── */}
        <Sidebar
          phase="chat"
          docsOpen={docsOpen}
          docsFullscreen={docsFullscreen}
          hasMessages={messages.length > 0}
          onChatClick={() => { onDocsOpen(false); onDocsFullscreen(false); }}
          onDocsClick={() => onDocsOpen(!docsOpen)}
        />

        {/* ── Docs panel (beside sidebar) ────────────────────── */}
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
              onDeleteDoc={onDeleteDoc}
            />
          </aside>
        )}

        {docsOpen && docsFullscreen && (
          <DocsPanel
            docs={docs}
            docSearch={docSearch}
            docsFullscreen={true}
            onSearchChange={onDocSearchChange}
            onFullscreen={onDocsFullscreen}
            onClose={() => { onDocsFullscreen(false); onDocsOpen(false); }}
            onFiles={onFiles}
            onDeleteDoc={onDeleteDoc}
          />
        )}

        {/* ── Main column ───────────────────────────────────── */}
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
          {/* Auth buttons — floats at top-right, never scrolls */}
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

          {/* ── Scrollable messages ─────────────────────────── */}
          <div
            className="chat-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(130,109,210,0.35) transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 68,
              paddingRight: 32,
              paddingLeft: panelOpen ? 12 : 32,
              paddingBottom: 0,
            }}
          >
            {/* Shrink content width when panel is open so messages stay
                centred and never reach the auth buttons on the right */}
            <div className="chat-content" style={{ width: "100%", maxWidth: contentMaxWidth }}>
              <MessageList
                messages={messages}
                loading={loading}
                onTypingComplete={onTypingComplete}
                onEditMessage={onEditMessage}
              />
            </div>
          </div>

          {/* ── Pinned input bar ────────────────────────────── */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              justifyContent: "center",
              padding: "16px 32px 28px",
              background: "linear-gradient(to top, rgba(0,0,0,0.35) 60%, transparent)",
            }}
          >
            {/* ChatInput has its own maxWidth:720 internally; we override
                via a wrapper so it matches the message area exactly */}
            <div className="chat-content" style={{ width: "100%", maxWidth: contentMaxWidth }}>
              <ChatInput
                value={input}
                loading={loading}
                typing={typing}
                onChange={onInputChange}
                onSubmit={onSubmit}
                onFiles={onFiles}
              />
            </div>
          </div>
        </main>

        {dragActive && <DragOverlay onDrop={onFiles} onLeave={onDragLeave} />}
      </div>
    </>
  );
}