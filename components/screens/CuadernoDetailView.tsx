"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import type { NotebookFile, NotebookChat, ChatMessage } from "@/types";
import type { Msg } from "@/types";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";
import type { Attachment } from "@/components/chat/ChatInput";
import {
  listNotebookFiles, uploadNotebookFile, deleteNotebookFile,
  listNotebookChats, createNotebookChat, deleteNotebookChat,
  getChatMessages, sendChatMessage,
} from "@/lib/api";

interface CuadernoDetailViewProps {
  notebookId: string;
  onBack: () => void;
  onChatClick: () => void;
  onStudyClick: () => void;
  onSummariesClick: () => void;
  onStudyRoomsClick: () => void;
}

function toMsg(m: ChatMessage): Msg {
  return { id: String(m.id), role: m.role === "assistant" ? "ai" : m.role, content: m.content };
}

const fileExt = (name: string) => name.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE";

export default function CuadernoDetailView({
  notebookId, onBack, onChatClick, onStudyClick, onSummariesClick, onStudyRoomsClick,
}: CuadernoDetailViewProps) {
  const [chats, setChats] = useState<NotebookChat[]>([]);
  const [files, setFiles] = useState<NotebookFile[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"chats" | "docs">("chats");
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const sendingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadChats = async () => { try { setChats(await listNotebookChats(notebookId)); } catch {} };
  const loadFiles = async () => { try { setFiles(await listNotebookFiles(notebookId)); } catch {} };

  useEffect(() => { loadChats(); loadFiles(); }, [notebookId]);

  useEffect(() => {
    if (!activeChatId) { setMessages([]); return; }
    let cancelled = false;
    getChatMessages(String(activeChatId))
      .then((raw) => { if (!cancelled && !sendingRef.current) setMessages(raw.map(toMsg)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeChatId]);

  useEffect(() => {
    const onDragEnter = () => setDragActive(true);
    window.addEventListener("dragenter", onDragEnter);
    return () => window.removeEventListener("dragenter", onDragEnter);
  }, []);

  const handleCreateChat = async () => {
    try {
      const res = await createNotebookChat(notebookId, `Chat ${chats.length + 1}`);
      await loadChats();
      setActiveChatId(res.id);
      setActiveTab("chats");
      setSearch("");
    } catch {}
  };

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotebookChat(String(chatId));
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChatId === chatId) { setActiveChatId(null); setMessages([]); }
    } catch {}
  };

  const handleSend = async (e: FormEvent, attachments: Attachment[]) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || sending) return;

    sendingRef.current = true;
    let chatId = activeChatId;
    if (!chatId) {
      try {
        const res = await createNotebookChat(notebookId, "Chat");
        chatId = res.id;
        setActiveChatId(res.id);
        await loadChats();
      } catch { sendingRef.current = false; return; }
    }

    const content = input.trim();
    setInput("");
    setSending(true);

    const userMsg: Msg = { id: `tmp-${Date.now()}`, role: "user", content, attachments: attachments.map(a => ({ id: a.id, kind: a.kind, name: a.name, preview: a.preview })) };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const reply = await sendChatMessage(String(chatId), content);
      setTyping(true);
      setMessages((prev) => [...prev.filter(m => !m.id.startsWith("tmp-")), toMsg(reply)]);
    } catch {}
    sendingRef.current = false;
    setSending(false);
  };

  const handleTypingComplete = () => { setTyping(false); };
  const handleEditMessage = () => {};

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    for (const file of Array.from(fileList)) {
      try { await uploadNotebookFile(notebookId, file); } catch {}
    }
    await loadFiles();
    setDragActive(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { await uploadNotebookFile(notebookId, file); await loadFiles(); } catch {}
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteFile = async (file: NotebookFile) => {
    if (deletingFileId === file.id) return;
    setDeletingFileId(file.id);
    try { await deleteNotebookFile(String(file.id)); await loadFiles(); } catch {}
    setDeletingFileId(null);
  };

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  const filteredFiles = files.filter(f => f.filename.toLowerCase().includes(search.toLowerCase()));
  const activeChatTitle = chats.find(c => c.id === activeChatId)?.title || "Chat";

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Left panel ── */}
      <div className="w-72 shrink-0 border-r border-white/[0.08] flex flex-col overflow-hidden bg-black/20 max-md:w-0 max-md:border-none">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onBack} className="flex items-center gap-1.5 text-white/50 text-xs cursor-pointer bg-transparent border-none hover:text-[#826dd2] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Cuadernos
            </button>
            {activeTab === "chats" && (
              <button onClick={handleCreateChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none bg-[#826dd2] text-white text-xs font-medium cursor-pointer hover:bg-[#7059be] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nuevo
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.04] rounded-lg p-0.5 mb-3">
            <button onClick={() => { setActiveTab("chats"); setSearch(""); }} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs border-none cursor-pointer transition-all ${activeTab === "chats" ? "bg-[rgba(130,109,210,0.2)] text-[#826dd2] font-medium" : "bg-transparent text-white/40"}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Chats
            </button>
            <button onClick={() => { setActiveTab("docs"); setSearch(""); }} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs border-none cursor-pointer transition-all ${activeTab === "docs" ? "bg-[rgba(130,109,210,0.2)] text-[#826dd2] font-medium" : "bg-transparent text-white/40"}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 001 1h4"/><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/></svg>
              Docs
              {files.length > 0 && <span className="text-[0.6rem] opacity-60">{files.length}</span>}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "chats" ? "Buscar chat..." : "Buscar documento..."}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-xs outline-none placeholder:text-white/25 focus:border-[rgba(130,109,210,0.5)] transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-2">
          {activeTab === "chats" ? (
            filteredChats.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="text-3xl mb-3 opacity-30">💬</div>
                <div className="text-white/35 text-xs leading-relaxed">
                  {chats.length === 0 ? "No hay chats aún" : "Sin resultados"}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => { setActiveChatId(chat.id); setActiveTab("chats"); }}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${activeChatId === chat.id ? 'bg-[rgba(130,109,210,0.18)] border border-[rgba(130,109,210,0.3)]' : 'border border-transparent hover:bg-white/[0.05]'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeChatId === chat.id ? 'bg-[rgba(130,109,210,0.25)]' : 'bg-white/[0.06]'}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={activeChatId === chat.id ? "#826dd2" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs truncate ${activeChatId === chat.id ? 'text-[#826dd2] font-medium' : 'text-white/70'}`}>{chat.title}</div>
                        <div className="text-[0.65rem] text-white/25 mt-0.5">{new Date(chat.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <button onClick={(e) => handleDeleteChat(chat.id, e)} className="opacity-0 group-hover:opacity-100 text-[#ff6464] text-[0.65rem] bg-transparent border-none cursor-pointer transition-opacity px-1 py-0.5">✕</button>
                  </div>
                ))}
              </div>
            )
          ) : (
            filteredFiles.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="text-3xl mb-3 opacity-30">📄</div>
                <div className="text-white/35 text-xs leading-relaxed">
                  {files.length === 0 ? "No hay documentos" : "Sin resultados"}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-transparent hover:bg-white/[0.05] transition-all duration-150"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                      <span className="text-[0.55rem] font-bold text-[#826dd2]">{fileExt(file.filename)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white/70 truncate">{file.filename}</div>
                      <div className="text-[0.65rem] text-white/25 mt-0.5">{new Date(file.created_at).toLocaleDateString()}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      disabled={deletingFileId === file.id}
                      className={`opacity-0 group-hover:opacity-100 text-[#ff6464] text-[0.65rem] bg-transparent border-none cursor-pointer transition-opacity px-1 py-0.5 ${deletingFileId === file.id ? 'opacity-100' : ''}`}
                    >
                      {deletingFileId === file.id ? "..." : "✕"}
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" multiple onChange={handleUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-white/10 bg-transparent text-white/35 text-xs cursor-pointer hover:border-[rgba(130,109,210,0.3)] hover:text-white/50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Subir archivo
          </button>
        </div>
      </div>

      {/* ── Right: chat area ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] shrink-0">
          <h2 className="text-base font-semibold text-white m-0">{activeChatTitle}</h2>
          {activeChatId && (
            <span className="text-xs text-white/30">· {messages.length} mensaje{messages.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {!activeChatId ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-5xl mb-4 opacity-30">💬</div>
              <div className="text-white/40 text-sm mb-4">Selecciona un chat o crea uno nuevo</div>
              <button onClick={handleCreateChat} className="px-5 py-2.5 rounded-xl border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer hover:bg-[#7059be] transition-colors">
                + Nuevo chat
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center pt-6 px-6 md:px-8 pb-0">
              <div className="w-full max-w-3xl">
                <MessageList messages={messages} loading={sending} typing={typing} onTypingComplete={handleTypingComplete} onEditMessage={handleEditMessage} />
              </div>
            </div>

            <div className="shrink-0 flex justify-center px-6 md:px-8 pb-6 pt-4 bg-gradient-to-t from-black/35 to-transparent">
              <div className="w-full max-w-3xl">
                <ChatInput value={input} loading={sending} typing={typing} onChange={setInput} onSubmit={handleSend} />
              </div>
            </div>
          </>
        )}
      </div>

      {dragActive && (
        <div className="fixed inset-0 bg-black/72 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onDragLeave={() => setDragActive(false)} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
          <div className="border-2 border-dashed border-[#826dd2] rounded-3xl px-12 md:px-16 py-10 md:py-12 text-center">
            <svg className="mx-auto mb-5 block" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#826dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <h3 className="text-xl bg-gradient-to-r from-white to-[#a5a5a5] bg-clip-text text-transparent mb-2 m-0">Suelta tus archivos aquí</h3>
            <p className="text-sm text-white/40 m-0">PDF, Word y más</p>
          </div>
        </div>
      )}
    </div>
  );
}
