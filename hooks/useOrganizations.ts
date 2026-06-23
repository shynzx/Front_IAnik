import { useState, useCallback } from "react";
import {
  createStudyRoom, joinStudyRoom, listCreatedRooms, listJoinedRooms,
  getStudyRoom, getRoomAccess,
} from "@/lib/api";
import type { StudyRoom, StudyRoomAccess } from "@/types";

export function useOrganizations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (notebookId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await createStudyRoom(notebookId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear sala";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const join = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      return await joinStudyRoom(code);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al unirse a la sala";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listCreated = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await listCreatedRooms();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener salas";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listJoined = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await listJoinedRooms();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener salas";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getStudyRoom(roomId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener sala";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const access = useCallback(async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getRoomAccess(roomId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al verificar acceso";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, join, listCreated, listJoined, get, access, loading, error };
}
