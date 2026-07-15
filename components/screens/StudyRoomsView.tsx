"use client";

import { useState, useEffect, useCallback } from "react";
import type { StudyRoom } from "@/types";
import StudyRoomListScreen from "@/components/study-rooms/StudyRoomListScreen";
import CreateStudyRoomModal from "@/components/study-rooms/CreateStudyRoomModal";
import JoinStudyRoomModal from "@/components/study-rooms/JoinStudyRoomModal";
import { useStudyRooms } from "@/hooks/useStudyRooms";
import InlineError from "@/components/ui/InlineError";

interface StudyRoomsViewProps {
  onChatClick: () => void;
  onStudyClick: () => void;
  onSummariesClick: () => void;
  onOpenRoom: (roomId: number) => void;
}

export default function StudyRoomsView({ onOpenRoom }: StudyRoomsViewProps) {
  const studyRooms = useStudyRooms();
  const { listCreatedRooms, listJoinedRooms } = studyRooms;
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [createdRoomIds, setCreatedRoomIds] = useState<Set<number>>(new Set());
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [joinRoomOpen, setJoinRoomOpen] = useState(false);

  const loadRooms = useCallback(async () => {
    try {
      const [created, joined] = await Promise.all([
        listCreatedRooms(),
        listJoinedRooms(),
      ]);
      const merged = [...created];
      const ids = new Set(created.map((r) => r.id));
      setCreatedRoomIds(ids);
      for (const r of joined) { if (!ids.has(r.id)) merged.push(r); }
      setRooms(merged);
    } catch (e) { console.warn("Error cargando salas de estudio:", e); }
  }, [listCreatedRooms, listJoinedRooms]);

  useEffect(() => { queueMicrotask(() => { void loadRooms(); }); }, [loadRooms]);

  return (
    <div className="page-shell min-h-full">
      {studyRooms.error && <div className="mb-4"><InlineError message={studyRooms.error} onRetry={() => void loadRooms()} /></div>}
      <StudyRoomListScreen
        rooms={rooms}
        loading={studyRooms.loading}
        onOpenRoom={onOpenRoom}
        onCreateRoom={() => setCreateRoomOpen(true)}
        onJoinRoom={() => setJoinRoomOpen(true)}
        createdRoomIds={createdRoomIds}
        onLeaveRoom={async (roomId) => {
          await studyRooms.leaveRoom(String(roomId));
          setRooms((current) => current.filter((room) => room.id !== roomId));
        }}
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
