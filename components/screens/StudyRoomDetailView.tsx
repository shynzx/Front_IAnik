"use client";

import { useState, useEffect } from "react";
import type { StudyRoomAccess, NotebookFile, NotebookChat, ChatMessage, AssessmentFlashcard, AssessmentExam, Summary } from "@/types";
import StudyRoomScreen from "@/components/study-rooms/StudyRoomScreen";
import { useStudyRooms } from "@/hooks/useStudyRooms";

interface StudyRoomDetailViewProps {
  roomId: number;
  onChatClick: () => void;
  onStudyClick: () => void;
  onSummariesClick: () => void;
  onStudyRoomsClick: () => void;
  onBack: () => void;
}

export default function StudyRoomDetailView({ roomId, onBack }: StudyRoomDetailViewProps) {
  const studyRooms = useStudyRooms();
  const [access, setAccess] = useState<StudyRoomAccess | null>(null);
  const [files, setFiles] = useState<NotebookFile[]>([]);
  const [chats, setChats] = useState<NotebookChat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [flashcards, setFlashcards] = useState<AssessmentFlashcard[]>([]);
  const [exams, setExams] = useState<AssessmentExam[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const loadChats = async () => {
    try {
      const c = await studyRooms.listChats(String(roomId));
      setChats(c);
      return c;
    } catch { return []; }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const msgs = await studyRooms.getChatMessages(String(roomId), String(chatId));
      setMessages(msgs);
    } catch { setMessages([]); }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [acc, f] = await Promise.all([
          studyRooms.getRoomAccess(String(roomId)),
          studyRooms.listFiles(String(roomId)),
        ]);
        setAccess(acc);
        setFiles(f);
        const c = await loadChats();
        if (c.length > 0) {
          const firstId = c[0].id;
          setActiveChatId(firstId);
          await loadMessages(firstId);
        }
        const [fcs, exs, roomSummaries] = await Promise.all([
          studyRooms.listFlashcards(String(roomId)),
          studyRooms.listExams(String(roomId)),
          studyRooms.listSummaries(String(roomId)),
        ]);
        setFlashcards(fcs);
        setExams(exs);
        const names = new Map(f.map((file) => [String(file.id), file.filename]));
        setSummaries(roomSummaries.map((summary) => summary.fileId ? { ...summary, title: `Resumen de ${names.get(summary.fileId) ?? "archivo"}`, docName: names.get(summary.fileId) ?? summary.docName } : summary));
      } catch (e) { console.warn("Error loading room:", e); }
    };
    load();
    // The room hook exposes memoized commands; roomId is the lifecycle boundary for this initial orchestration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return (
    <div className="h-full p-6 pb-12 md:p-8 md:pb-16">
      <StudyRoomScreen
          roomId={roomId}
          access={access}
          files={files}
          chats={chats}
          messages={messages}
          flashcards={flashcards}
          exams={exams}
          summaries={summaries}
          activeChatId={activeChatId}
          onSelectChat={(chatId) => {
            setActiveChatId(chatId);
            if (chatId) {
              loadMessages(chatId);
            } else {
              setMessages([]);
            }
          }}
          loading={studyRooms.loading}
          onUploadFile={async (file) => {
            await studyRooms.uploadFile(String(roomId), file);
            setFiles(await studyRooms.listFiles(String(roomId)));
          }}
          onDeleteFile={async (fileId) => {
            await studyRooms.deleteFile(String(roomId), fileId);
            setFiles((prev) => prev.filter((f) => String(f.id) !== fileId));
          }}
          onSendMessage={async (chatId, content) => {
            const userMsg: ChatMessage = { id: Date.now(), chat_id: Number(chatId), role: "user", content, created_at: new Date().toISOString() };
            setMessages((prev) => [...prev, userMsg]);
            try {
              const newMessages = await studyRooms.sendMessage(String(roomId), chatId, content);
              setMessages((current) => [...current.filter((message) => message.id !== userMsg.id), ...newMessages]);
              return newMessages.find((message) => message.role === "assistant") ?? null;
            } catch {
              setMessages((current) => current.filter((message) => message.id !== userMsg.id));
              throw new Error("No se pudo enviar el mensaje");
            }
          }}
          onGenerateFlashcards={async (prompt) => {
            const fcs = await studyRooms.generateFlashcards(String(roomId), prompt);
            setFlashcards(fcs);
            return fcs;
          }}
          onGenerateExam={async (prompt) => {
            const exam = await studyRooms.generateExam(String(roomId), prompt);
            if (exam) setExams((prev) => [...prev, exam]);
            return exam;
          }}
          onCreateChat={async (title) => {
            if (!access) return null;
            const res = await studyRooms.createChat(String(access.notebook_id), title);
            return res;
          }}
          onDeleteChat={async (chatId) => {
            await studyRooms.deleteChat(chatId);
            setChats((prev) => prev.filter(c => String(c.id) !== chatId));
            if (activeChatId && String(activeChatId) === chatId) {
              setActiveChatId(null);
              setMessages([]);
            }
          }}
          onRefreshChats={async () => {
            const c = await loadChats();
            if (c.length > 0 && !activeChatId) {
              setActiveChatId(c[0].id);
            }
          }}
        onBack={onBack}
        onLeave={async () => { await studyRooms.leaveRoom(String(roomId)); onBack(); }}
      />
    </div>
  );
}
