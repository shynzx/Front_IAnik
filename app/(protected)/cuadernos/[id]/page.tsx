"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import CuadernoDetailView from "@/components/screens/CuadernoDetailView";

export default function NotebookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const search = useSearchParams();
  return <CuadernoDetailView notebookId={id} initialChatId={search.get("chat") ? Number(search.get("chat")) : null} onChatChange={(chatId) => router.replace(chatId ? `/cuadernos/${id}?chat=${chatId}` : `/cuadernos/${id}`, { scroll: false })} onBack={() => router.push("/cuadernos")} onChatClick={() => router.push("/cuadernos")} onStudyClick={() => router.push(`/progreso?cuaderno=${id}`)} onSummariesClick={() => router.push(`/resumenes?cuaderno=${id}`)} onStudyRoomsClick={() => router.push("/salas")} />;
}
