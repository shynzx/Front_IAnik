"use client";

import { useState, useEffect } from "react";
import type { StudyRoom } from "@/types";
import StudyRoomListScreen from "@/components/study-rooms/StudyRoomListScreen";
import CreateStudyRoomModal from "@/components/study-rooms/CreateStudyRoomModal";
import JoinStudyRoomModal from "@/components/study-rooms/JoinStudyRoomModal";
import { useStudyRooms } from "@/hooks/useStudyRooms";

interface StudyRoomsViewProps {
  onChatClick: () => void;
  onStudyClick: () => void;
  onSummariesClick: () => void;
  onOpenRoom: (roomId: number) => void;
}

export default function StudyRoomsView({ onChatClick, onStudyClick, onSummariesClick, onOpenRoom }: StudyRoomsViewProps) {
  const studyRooms = useStudyRooms();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [joinRoomOpen, setJoinRoomOpen] = useState(false);

  const loadRooms = async () => {
    try {
      const [created, joined] = await Promise.all([
        studyRooms.listCreatedRooms(),
        studyRooms.listJoinedRooms(),
      ]);
      const merged = [...created];
      const ids = new Set(created.map((r) => r.id));
      for (const r of joined) { if (!ids.has(r.id)) merged.push(r); }
      setRooms(merged);
    } catch (e) { console.warn("Error cargando salas de estudio:", e); }
  };

  useEffect(() => { loadRooms(); }, []);

  return (
    <div className="min-h-full p-6 pb-12 md:p-8 md:pb-16">
      <StudyRoomListScreen
        rooms={rooms}
        loading={studyRooms.loading}
        onOpenRoom={onOpenRoom}
        onCreateRoom={() => setCreateRoomOpen(true)}
        onJoinRoom={() => setJoinRoomOpen(true)}
      />
      {createRoomOpen && (
        <CreateStudyRoomModal
          loading={studyRooms.loading}
          onCreate={async (title, notebookId) => {
            const res = await studyRooms.createRoom(title, notebookId);
            await loadRooms();
            return res;
          }}
          onClose={() => setCreateRoomOpen(false)}
        />
      )}
      {joinRoomOpen && (
        <JoinStudyRoomModal
          loading={studyRooms.loading}
          onJoin={async (codigo) => {
            const roomId = await studyRooms.joinRoom(codigo);
            await loadRooms();
            return roomId;
          }}
          onClose={() => setJoinRoomOpen(false)}
          onJoined={(roomId) => {
            setJoinRoomOpen(false);
            onOpenRoom(roomId);
          }}
        />
      )}
    </div>
  );
}
