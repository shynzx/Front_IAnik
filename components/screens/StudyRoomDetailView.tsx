"use client";

import { useState, useEffect } from "react";
import type { StudyRoomAccess, NotebookFile, NotebookChat, ChatMessage, AssessmentFlashcard, AssessmentExam } from "@/types";
import StudyRoomScreen from "@/components/study-rooms/StudyRoomScreen";
import { useStudyRooms } from "@/hooks/useStudyRooms";
import { getNotebookExams } from "@/lib/api";

interface StudyRoomDetailViewProps {
  roomId: number;
  onChatClick: () => void;
  onStudyClick: () => void;
  onSummariesClick: () => void;
  onStudyRoomsClick: () => void;
  onBack: () => void;
}

export default function StudyRoomDetailView({ roomId, onChatClick, onStudyClick, onSummariesClick, onStudyRoomsClick, onBack }: StudyRoomDetailViewProps) {
  const studyRooms = useStudyRooms();
  const [access, setAccess] = useState<StudyRoomAccess | null>(null);
  const [files, setFiles] = useState<NotebookFile[]>([]);
  const [chats, setChats] = useState<NotebookChat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [flashcards, setFlashcards] = useState<AssessmentFlashcard[]>([]);
  const [exams, setExams] = useState<AssessmentExam[]>([]);
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
        const [fcs, exs] = await Promise.all([
          studyRooms.listFlashcards(String(roomId)),
          acc ? getNotebookExams(String(acc.notebook_id)) : studyRooms.listExams(String(roomId)),
        ]);
        setFlashcards(fcs);
        setExams(exs);
      } catch (e) { console.warn("Error loading room:", e); }
    };
    load();
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
            const msg = await studyRooms.sendMessage(String(roomId), chatId, content);
            if (msg) {
              setMessages((prev) => [...prev.filter(m => m.id !== userMsg.id), userMsg, msg]);
            } else {
              setMessages((prev) => prev.filter(m => m.id !== userMsg.id));
            }
            return msg;
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
      />
    </div>
  );
}
