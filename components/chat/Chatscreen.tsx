"use client";

import { FormEvent } from "react";
import { Msg, Doc, BG, FlashcardSet } from "./tokens";
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
  flashcardSets: FlashcardSet[];
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
  onUpdateFlashcard: (setId: string, cardId: string, status: "pending" | "learned" | "review") => void;
}

const SIDEBAR_W  = 64;
const DOCPANEL_W = 264;

export default function ChatScreen({
  messages, docs, flashcardSets,
  input, loading, typing, dragActive,
  docsOpen, docsFullscreen, docSearch,
  onInputChange, onSubmit, onFiles, onDeleteDoc, onDragLeave,
  onDocsOpen, onDocsFullscreen, onDocSearchChange,
  onTypingComplete, onGoLogin, onGoRegister,
  onEditMessage, onUpdateFlashcard,
}: ChatScreenProps) {
  const panelOpen      = docsOpen && !docsFullscreen;
  const mainPadLeft    = SIDEBAR_W + (panelOpen ? DOCPANEL_W : 0);
  const contentMaxWidth = panelOpen ? 670 : 720;

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }
        .chat-main    { transition: margin-left 0.22s ease, width 0.22s ease; }
        .chat-content { transition: max-width 0.22s ease; }
        .chat-scroll::-webkit-scrollbar       { width: 6px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(130,109,210,0.35); border-radius: 99px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(130,109,210,0.6); }
        @media (max-width: 640px) {
          .docs-panel-aside { display: none !important; }
          .chat-main { margin-left: ${SIDEBAR_W}px !important; width: calc(100% - ${SIDEBAR_W}px) !important; }
        }
      `}</style>

      <div style={{ height: "100vh", width: "100vw", overflow: "hidden", background: BG, display: "flex", fontFamily: "var(--font-poppins), sans-serif", position: "relative" }}>

        <Sidebar
          phase="chat"
          docsOpen={docsOpen}
          docsFullscreen={docsFullscreen}
          hasMessages={messages.length > 0}
          onChatClick={() => { onDocsOpen(false); onDocsFullscreen(false); }}
          onDocsClick={() => onDocsOpen(!docsOpen)}
        />

        {docsOpen && !docsFullscreen && (
          <aside
            className="docs-panel-aside"
            style={{ position: "fixed", top: 0, left: SIDEBAR_W, width: DOCPANEL_W, height: "100vh", zIndex: 45, flexShrink: 0 }}
          >
            <DocsPanel
              docs={docs} docSearch={docSearch} docsFullscreen={false}
              onSearchChange={onDocSearchChange} onFullscreen={onDocsFullscreen}
              onClose={() => { onDocsFullscreen(false); onDocsOpen(false); }}
              onFiles={onFiles} onDeleteDoc={onDeleteDoc}
            />
          </aside>
        )}

        {docsOpen && docsFullscreen && (
          <DocsPanel
            docs={docs} docSearch={docSearch} docsFullscreen={true}
            onSearchChange={onDocSearchChange} onFullscreen={onDocsFullscreen}
            onClose={() => { onDocsFullscreen(false); onDocsOpen(false); }}
            onFiles={onFiles} onDeleteDoc={onDeleteDoc}
          />
        )}

        <main
          className="chat-main"
          style={{ marginLeft: mainPadLeft, width: `calc(100% - ${mainPadLeft}px)`, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}
        >
          <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 12, zIndex: 40 }}>
            <AuthButtons onGoLogin={onGoLogin} onGoRegister={onGoRegister} />
          </div>

          <div
            className="chat-scroll"
            style={{
              flex: 1, overflowY: "auto", overflowX: "hidden",
              scrollbarWidth: "thin", scrollbarColor: "rgba(130,109,210,0.35) transparent",
              display: "flex", flexDirection: "column",
              alignItems: panelOpen ? "flex-start" : "center",
              paddingTop: 68,
              paddingRight: 32,
              paddingLeft: panelOpen ? 16 : 32,
              paddingBottom: 0,
            }}
          >
            <div className="chat-content" style={{ width: "100%", maxWidth: contentMaxWidth }}>
              <MessageList
                messages={messages}
                loading={loading}
                flashcardSets={flashcardSets}
                onTypingComplete={onTypingComplete}
                onEditMessage={onEditMessage}
                onUpdateFlashcard={onUpdateFlashcard}
              />
            </div>
          </div>

          <div style={{ flexShrink: 0, display: "flex", justifyContent: panelOpen ? "flex-start" : "center", padding: panelOpen ? "16px 32px 28px 16px" : "16px 32px 28px", background: "linear-gradient(to top, rgba(0,0,0,0.35) 60%, transparent)" }}>
            <div className="chat-content" style={{ width: "100%", maxWidth: contentMaxWidth }}>
              <ChatInput
                value={input} loading={loading} typing={typing}
                onChange={onInputChange} onSubmit={onSubmit} onFiles={onFiles}
              />
            </div>
          </div>
        </main>

        {dragActive && <DragOverlay onDrop={onFiles} onLeave={onDragLeave} />}
      </div>
    </>
  );
}