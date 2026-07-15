"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import StudyRoomDetailView from "@/components/screens/StudyRoomDetailView";

export default function RoomPage() { const { id } = useParams<{ id: string }>(); const router = useRouter(); const search = useSearchParams(); return <StudyRoomDetailView roomId={Number(id)} initialSection={search.get("seccion") || "chat"} initialChatId={search.get("chat") ? Number(search.get("chat")) : null} onNavigationChange={(section, chatId) => router.replace(`/salas/${id}?seccion=${section}${chatId ? `&chat=${chatId}` : ""}`, { scroll: false })} onBack={() => router.push("/salas")} onChatClick={() => router.push("/cuadernos")} onStudyClick={() => router.push("/progreso")} onSummariesClick={() => router.push("/resumenes")} onStudyRoomsClick={() => router.push("/salas")} />; }
