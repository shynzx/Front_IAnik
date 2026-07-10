"use client";

import { useState, useEffect, useRef } from "react";
import type { StudyRoom, StudyRoomAccess, NotebookFile, NotebookChat, ChatMessage, AssessmentFlashcard, AssessmentExam } from "@/types";
import type { Msg } from "@/types";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";

interface StudyRoomScreenProps {
  roomId: number;
  access: StudyRoomAccess | null;
  files: NotebookFile[];
  chats: NotebookChat[];
  messages: ChatMessage[];
  flashcards: AssessmentFlashcard[];
  exams: AssessmentExam[];
  activeChatId: number | null;
  onSelectChat: (chatId: number | null) => void;
  loading: boolean;
  onUploadFile: (file: File) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onSendMessage: (chatId: string, content: string) => Promise<ChatMessage | null>;
  onGenerateFlashcards: (prompt: string) => Promise<AssessmentFlashcard[]>;
  onGenerateExam: (prompt: string) => Promise<AssessmentExam | null>;
  onCreateChat: (title: string) => Promise<{ id: number; message: string } | null>;
  onDeleteChat: (chatId: string) => Promise<void>;
  onRefreshChats: () => Promise<void>;
  onBack: () => void;
}

function toMsg(m: ChatMessage): Msg {
  return { id: String(m.id), role: m.role === "assistant" ? "ai" : m.role, content: m.content };
}

export default function StudyRoomScreen({
  roomId, access, files, chats, messages, flashcards, exams,
  activeChatId, onSelectChat,
  loading, onUploadFile, onDeleteFile, onSendMessage,
  onGenerateFlashcards, onGenerateExam, onCreateChat, onDeleteChat, onRefreshChats, onBack,
}: StudyRoomScreenProps) {
  const [tab, setTab] = useState<"chat" | "files" | "flashcards" | "exams">("chat");
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [flashcardPrompt, setFlashcardPrompt] = useState("");
  const [examPrompt, setExamPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [chatCreating, setChatCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uiMessages: Msg[] = messages.map(toMsg);

  const handleSend = async (_e: React.FormEvent, _attachments?: unknown[]) => {
    if (!chatInput.trim() || !activeChatId || sending) return;
    setSending(true);
    const content = chatInput.trim();
    setChatInput("");
    const reply = await onSendMessage(String(activeChatId), content);
    if (reply) {
      setTyping(true);
    }
    setSending(false);
  };

  const handleTypingComplete = () => { setTyping(false); };
  const handleEditMessage = () => {};

  const handleCreateChat = async () => {
    if (chatCreating || !access) return;
    setChatCreating(true);
    const res = await onCreateChat(`Chat ${chats.length + 1}`);
    if (res) {
      await onRefreshChats();
      onSelectChat(res.id);
    }
    setChatCreating(false);
    setChatSearch("");
  };

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onDeleteChat(String(chatId));
      if (activeChatId === chatId) {
        onSelectChat(null);
      }
      await onRefreshChats();
    } catch {}
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerateFlashcards = async () => {
    if (!flashcardPrompt.trim() || generating) return;
    setGenerating(true);
    await onGenerateFlashcards(flashcardPrompt.trim());
    setFlashcardPrompt("");
    setGenerating(false);
  };

  const handleGenerateExam = async () => {
    if (!examPrompt.trim() || generating) return;
    setGenerating(true);
    await onGenerateExam(examPrompt.trim());
    setExamPrompt("");
    setGenerating(false);
  };

  const isAdmin = access?.role === "admin";
  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(chatSearch.toLowerCase()));
  const activeChatTitle = chats.find(c => c.id === activeChatId)?.title || "Chat";

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-4 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-1.5 rounded-md border border-white/10 bg-transparent text-white/60 text-xs cursor-pointer hover:text-[#826dd2] hover:bg-[rgba(130,109,210,0.08)] transition-colors">← Volver</button>
          <div>
            <h2 className="text-lg font-semibold text-white m-0">{access?.title || `Sala #${roomId}`}</h2>
            <div className="flex gap-2 items-center mt-1">
              <span className={`px-2 py-0.5 rounded text-[0.7rem] font-semibold ${isAdmin ? "bg-[rgba(130,109,210,0.2)] text-[#826dd2]" : "bg-[rgba(100,200,150,0.2)] text-[#64c896]"}`}>
                {isAdmin ? "Admin" : "Invitado"}
              </span>
              <span className="font-mono text-xs text-white/40">
                Código: {access?.codigo}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 py-3 border-b border-white/[0.08] shrink-0 overflow-x-auto">
        {(["chat", "files", "flashcards", "exams"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg border-none text-[0.8rem] font-medium cursor-pointer whitespace-nowrap transition-colors ${tab === t ? "bg-[rgba(130,109,210,0.2)] text-[#826dd2]" : "bg-transparent text-white/50 hover:text-white/70 hover:bg-white/[0.05]"}`}
          >
            {t === "chat" ? "Chat" : t === "files" ? `Archivos (${files.length})` : t === "flashcards" ? `Flashcards (${flashcards.length})` : `Exámenes (${exams.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* ── Chat tab: split view ── */}
        {tab === "chat" && (
          <div className="flex h-full">
            {/* Chats list panel */}
            <div className="w-64 shrink-0 border-r border-white/[0.08] flex flex-col overflow-hidden bg-black/20 max-md:w-0 max-md:border-none">
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Chats</span>
                  <button onClick={handleCreateChat} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border-none bg-[#826dd2] text-white text-xs font-medium cursor-pointer hover:bg-[#7059be] transition-colors disabled:opacity-40" disabled={chatCreating}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {chatCreating ? "..." : "Nuevo"}
                  </button>
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Buscar chat..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-xs outline-none placeholder:text-white/25 focus:border-[rgba(130,109,210,0.5)] transition-colors"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                {filteredChats.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <div className="text-3xl mb-3 opacity-30">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    </div>
                    <div className="text-white/35 text-xs leading-relaxed">
                      {chats.length === 0 ? "No hay chats aún" : "Sin resultados"}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
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
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!activeChatId ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4 opacity-30">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    </div>
                    <div className="text-white/40 text-sm mb-2">Selecciona un chat o crea uno nuevo</div>
                    <button onClick={handleCreateChat} className="px-5 py-2.5 rounded-xl border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer hover:bg-[#7059be] transition-colors mt-2 disabled:opacity-40" disabled={chatCreating}>
                      {chatCreating ? "..." : "+ Nuevo chat"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.08] shrink-0">
                    <h3 className="m-0 text-sm font-semibold text-white">{activeChatTitle}</h3>
                    <span className="text-xs text-white/30">· {messages.length} mensaje{messages.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center pt-6 px-6 pb-0">
                    <div className="w-full max-w-3xl">
                      <MessageList messages={uiMessages} loading={sending} typing={typing} onTypingComplete={handleTypingComplete} onEditMessage={handleEditMessage} />
                    </div>
                  </div>

                  <div className="shrink-0 flex justify-center px-6 pb-4 pt-3 bg-gradient-to-t from-black/35 to-transparent">
                    <div className="w-full max-w-3xl">
                      <ChatInput value={chatInput} loading={sending} typing={typing} onChange={setChatInput} onSubmit={handleSend} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Files tab ── */}
        {tab === "files" && (
          <div className="p-4 overflow-auto h-full">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-white/60">{files.length} archivo(s)</div>
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer hover:bg-[#7059be] transition-colors">Subir archivo</button>
              </div>
            </div>
            {files.length === 0 ? (
              <div className="text-center py-12 text-white/30">No hay archivos en la sala</div>
            ) : (
              <div className="flex flex-col gap-2">
                {files.map((file) => (
                  <div key={file.id} className="flex justify-between items-center px-4 py-3 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    <div>
                      <div className="text-sm text-white">{file.filename}</div>
                      <div className="text-xs text-white/40 mt-0.5">{file.file_type.toUpperCase()} · {new Date(file.created_at).toLocaleDateString()}</div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => onDeleteFile(String(file.id))} className="px-3 py-1.5 rounded-md border border-red-400/30 bg-transparent text-red-400 text-xs cursor-pointer hover:bg-red-400/10 transition-colors">
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Flashcards tab ── */}
        {tab === "flashcards" && (
          <div className="p-4 overflow-auto h-full">
            <div className="flex gap-2 mb-4">
              <input
                value={flashcardPrompt}
                onChange={(e) => setFlashcardPrompt(e.target.value)}
                placeholder="Prompt para generar flashcards..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/[0.1] bg-white/[0.05] text-white text-sm outline-none focus:border-[rgba(130,109,210,0.5)] transition-colors placeholder:text-white/25"
              />
              <button onClick={handleGenerateFlashcards} disabled={generating || !flashcardPrompt.trim()} className={`px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer transition-opacity ${generating || !flashcardPrompt.trim() ? "opacity-40" : "hover:bg-[#7059be]"}`}>
                {generating ? "Generando..." : "Generar"}
              </button>
            </div>
            {flashcards.length === 0 ? (
              <div className="text-center py-12 text-white/30">No hay flashcards. Genera algunas con un prompt.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {flashcards.map((fc) => (
                  <div key={fc.id} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                    <div className="text-[0.8rem] text-[#826dd2] font-semibold mb-2">{fc.question}</div>
                    <div className="text-[0.8rem] text-white/70">{fc.answer}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Exams tab ── */}
        {tab === "exams" && (
          <div className="p-4 overflow-auto h-full">
            {isAdmin && (
              <div className="flex gap-2 mb-4">
                <input
                  value={examPrompt}
                  onChange={(e) => setExamPrompt(e.target.value)}
                  placeholder="Prompt para generar examen..."
                  className="flex-1 px-4 py-2.5 rounded-lg border border-white/[0.1] bg-white/[0.05] text-white text-sm outline-none focus:border-[rgba(130,109,210,0.5)] transition-colors placeholder:text-white/25"
                />
                <button onClick={handleGenerateExam} disabled={generating || !examPrompt.trim()} className={`px-5 py-2.5 rounded-lg border-none bg-[#826dd2] text-white text-sm font-medium cursor-pointer transition-opacity ${generating || !examPrompt.trim() ? "opacity-40" : "hover:bg-[#7059be]"}`}>
                  {generating ? "Generando..." : "Generar"}
                </button>
              </div>
            )}
            {exams.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                {isAdmin ? "No hay exámenes. Genera uno con un prompt." : "No hay exámenes disponibles."}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {exams.map((exam) => (
                  <div key={exam.id} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-base font-semibold text-white">{exam.title}</div>
                      <div className="text-xs text-white/40">{exam.preguntas.length} preguntas</div>
                    </div>
                    <div className="text-xs text-white/30">{new Date(exam.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
