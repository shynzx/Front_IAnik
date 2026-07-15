"use client";

import { useRouter } from "next/navigation";
import StudyRoomsView from "@/components/screens/StudyRoomsView";

export default function RoomsPage() { const router = useRouter(); return <StudyRoomsView onOpenRoom={(id) => router.push(`/salas/${id}`)} onChatClick={() => router.push("/cuadernos")} onStudyClick={() => router.push("/progreso")} onSummariesClick={() => router.push("/resumenes")} />; }
