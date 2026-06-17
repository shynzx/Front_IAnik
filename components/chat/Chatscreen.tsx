"use client";

<<<<<<< HEAD
import { FormEvent, useState } from "react";
import { Msg, Doc, BG, FlashcardSet, ExamSet, ExamCard, Summary } from "./tokens";
import { Attachment } from "./ChatInput";
import { AuthUser } from "../Chat"; // ajusta el path según tu estructura

=======
import { FormEvent } from "react";
import { Msg, Doc, BG } from "./tokens";
import { Attachment } from "./ChatInput";
import Sidebar from "./Sidebar";
import AuthButtons from "./AuthButtons";
>>>>>>> main
import DocsPanel from "./DocsPanel";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import DragOverlay from "./DragOverlay";
<<<<<<< HEAD
import SummaryScreen from "../Resumenes/SummaryScreen";
import Sidebar from "./Sidebar";
import AuthButtons from "./AuthButtons";
import DashboardScreen from "../Dashboard/Dashboardscreen";
=======
>>>>>>> main

interface ChatScreenProps {
  messages: Msg[];
  docs: Doc[];
<<<<<<< HEAD
  flashcardSets: FlashcardSet[];
  examSets: ExamSet[];
  summaries: Summary[];
=======
>>>>>>> main
  input: string;
  loading: boolean;
  typing: boolean;
  dragActive: boolean;
  docsOpen: boolean;
  docsFullscreen: boolean;
  docSearch: string;
<<<<<<< HEAD
  activePage: "chat" | "summaries" | "dashboard";
  onActivePageChange: (page: "chat" | "summaries" | "dashboard") => void;
=======
>>>>>>> main
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent, attachments: Attachment[]) => void;
  onFiles: (files: FileList | null) => void;
  onDeleteDoc: (doc: Doc) => Promise<void>;
  onDragLeave: () => void;
  onDocsOpen: (value: boolean) => void;
  onDocsFullscreen: (value: boolean) => void;
  onDocSearchChange: (value: string) => void;
  onTypingComplete: () => void;
<<<<<<< HEAD
  // Auth
  user: AuthUser | null;
  onGoLogin: () => void;
  onGoRegister: () => void;
  onLogout: () => void;
  // Content
  onEditMessage: (index: number, newContent: string) => void;
  onUpdateFlashcard: (setId: string, cardId: string, status: "pending" | "learned" | "review") => void;
  onUpdateExamCard: (setId: string, cardId: string, status: ExamCard["status"]) => void;
  onGenerateSummary: (selectedDocs: Doc[], title: string, prompt: string) => Promise<string | null>;
  onDeleteSummary: (id: string) => void;
}

const DOCPANEL_W = 264;

export default function ChatScreen({
  messages, docs, flashcardSets, examSets, summaries,
  input, loading, typing, dragActive,
  docsOpen, docsFullscreen, docSearch,
  activePage, onActivePageChange,
  onInputChange, onSubmit, onFiles, onDeleteDoc, onDragLeave,
  onDocsOpen, onDocsFullscreen, onDocSearchChange,
  onTypingComplete,
  user, onGoLogin, onGoRegister, onLogout,
  onEditMessage, onUpdateFlashcard, onUpdateExamCard,
  onGenerateSummary, onDeleteSummary,
}: ChatScreenProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const SIDEBAR_W   = sidebarExpanded ? 200 : 64;
  const panelOpen   = docsOpen && !docsFullscreen;
  const mainPadLeft = SIDEBAR_W + (panelOpen ? DOCPANEL_W : 0);
  const contentMaxWidth = 720;
=======
  onGoLogin: () => void;
  onGoRegister: () => void;
  onLogout?: () => void;
  userName?: string | null;
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
  onLogout,
  userName,
  onEditMessage,
}: ChatScreenProps) {
  const panelOpen   = docsOpen && !docsFullscreen;
  const mainPadLeft = SIDEBAR_W + (panelOpen ? DOCPANEL_W : 0);

  // When the docs panel is open the main column is narrower, so we shrink
  // the content max-width to keep everything centred and away from the
  // auth buttons on the right.
  const contentMaxWidth = panelOpen ? 670 : 720;
>>>>>>> main

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }
<<<<<<< HEAD
        .chat-main         { transition: margin-left 0.22s ease, width 0.22s ease; }
        .docs-panel-aside  { transition: left 0.22s ease; }
        .chat-scroll::-webkit-scrollbar       { width: 6px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(130,109,210,0.35); border-radius: 99px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(130,109,210,0.6); }
        @media (max-width: 640px) {
          .docs-panel-aside { display: none !important; }
          .chat-main { margin-left: ${SIDEBAR_W}px !important; width: calc(100vw - ${SIDEBAR_W}px) !important; }
        }
      `}</style>

      <div style={{ height: "100vh", width: "100vw", overflow: "hidden", background: BG, display: "flex", fontFamily: "var(--font-poppins), sans-serif", position: "relative" }}>

=======

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
>>>>>>> main
        <Sidebar
          phase="chat"
          docsOpen={docsOpen}
          docsFullscreen={docsFullscreen}
          hasMessages={messages.length > 0}
<<<<<<< HEAD
          activePage={activePage}
          expanded={sidebarExpanded}
          onLogoClick={() => setSidebarExpanded(!sidebarExpanded)}
          onChatClick={() => onActivePageChange("chat")}
          onDocsClick={() => onDocsOpen(!docsOpen)}
          onSummariesClick={() => { onActivePageChange("summaries"); onDocsFullscreen(false); }}
          onDashboardClick={() => { onActivePageChange("dashboard"); onDocsFullscreen(false); }}
          // User profile
          user={user}
          onLogout={onLogout}
        />

        {docsOpen && !docsFullscreen && (
          <aside className="docs-panel-aside" style={{ position: "fixed", top: 0, left: SIDEBAR_W, width: DOCPANEL_W, height: "100vh", zIndex: 45, flexShrink: 0 }}>
            <DocsPanel
              docs={docs} docSearch={docSearch} docsFullscreen={false}
              onSearchChange={onDocSearchChange} onFullscreen={onDocsFullscreen}
              onClose={() => { onDocsFullscreen(false); onDocsOpen(false); }}
              onFiles={onFiles} onDeleteDoc={onDeleteDoc}
=======
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
>>>>>>> main
            />
          </aside>
        )}

        {docsOpen && docsFullscreen && (
          <DocsPanel
<<<<<<< HEAD
            docs={docs} docSearch={docSearch} docsFullscreen={true}
            onSearchChange={onDocSearchChange} onFullscreen={onDocsFullscreen}
            onClose={() => { onDocsFullscreen(false); onDocsOpen(false); }}
            onFiles={onFiles} onDeleteDoc={onDeleteDoc}
          />
        )}

        <main className="chat-main" style={{ marginLeft: mainPadLeft, width: `calc(100vw - ${mainPadLeft}px)`, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", boxSizing: "border-box" }}>

          {/* Auth buttons — solo visibles si NO hay sesión */}
          {!user && (
            <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 12, zIndex: 40 }}>
              <AuthButtons onGoLogin={onGoLogin} onGoRegister={onGoRegister} />
            </div>
          )}

          {/* ══ Chat ══ 
              (CORRECCIÓN: Usamos display none/flex para no desmontar el elemento y conservar su scroll original) */}
          <div style={{ display: activePage === "chat" ? "flex" : "none", flexDirection: "column", flex: 1, overflow: "hidden", width: "100%" }}>
            <div className="chat-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: "rgba(130,109,210,0.35) transparent", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 68, paddingRight: 32, paddingLeft: 32, paddingBottom: 0, boxSizing: "border-box", width: "100%" }}>
              <div className="chat-content" style={{ width: "100%", maxWidth: contentMaxWidth, boxSizing: "border-box" }}>
                <MessageList
                  messages={messages} loading={loading} flashcardSets={flashcardSets} examSets={examSets}
                  onTypingComplete={onTypingComplete} onEditMessage={onEditMessage}
                  onUpdateFlashcard={onUpdateFlashcard} onUpdateExamCard={onUpdateExamCard}
                />
              </div>
            </div>
            <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", padding: "16px 32px 28px", background: "linear-gradient(to top, rgba(0,0,0,0.35) 60%, transparent)", boxSizing: "border-box", width: "100%" }}>
              <div className="chat-content" style={{ width: "100%", maxWidth: contentMaxWidth, boxSizing: "border-box" }}>
                <ChatInput value={input} loading={loading} typing={typing} onChange={onInputChange} onSubmit={onSubmit} onFiles={onFiles} />
              </div>
            </div>
          </div>

          {/* ══ Resúmenes ══ 
              (CORRECCIÓN: Igual que en chat, display flex/none para conservar el scroll) */}
          <div className="chat-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: "rgba(130,109,210,0.35) transparent", display: activePage === "summaries" ? "flex" : "none", justifyContent: "center", paddingTop: 80, paddingRight: 32, paddingLeft: 32, paddingBottom: 32, boxSizing: "border-box", width: "100%" }}>
            <div style={{ width: "100%", maxWidth: 900, boxSizing: "border-box" }}>
              <SummaryScreen docs={docs} summaries={summaries} onGenerateSummary={onGenerateSummary} onDeleteSummary={onDeleteSummary} />
            </div>
          </div>

          {/* ══ Dashboard ══ 
              (CORRECCIÓN: Igual que en chat, display flex/none para conservar el scroll) */}
          <div className="chat-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: "rgba(130,109,210,0.35) transparent", display: activePage === "dashboard" ? "flex" : "none", justifyContent: "center", paddingTop: 80, paddingRight: 32, paddingLeft: 32, paddingBottom: 32, boxSizing: "border-box", width: "100%" }}>
            <div style={{ width: "100%", maxWidth: 900, boxSizing: "border-box" }}>
              <DashboardScreen
                examSets={examSets} flashcardSets={flashcardSets}
                onUpdateFlashcard={onUpdateFlashcard} onUpdateExamCard={onUpdateExamCard}
=======
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
            <AuthButtons onGoLogin={onGoLogin} onGoRegister={onGoRegister} onLogout={onLogout} userName={userName} />
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
>>>>>>> main
              />
            </div>
          </div>

<<<<<<< HEAD
=======
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
>>>>>>> main
        </main>

        {dragActive && <DragOverlay onDrop={onFiles} onLeave={onDragLeave} />}
      </div>
    </>
  );
}