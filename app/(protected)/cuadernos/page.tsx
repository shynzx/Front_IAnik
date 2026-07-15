"use client";

import { useRouter } from "next/navigation";
import CuadernoListView from "@/components/screens/CuadernoListView";

export default function NotebooksPage() {
  const router = useRouter();
  return <CuadernoListView onSelect={(id) => router.push(`/cuadernos/${id}`)} onChatClick={() => {}} onStudyClick={() => router.push("/progreso")} onSummariesClick={() => router.push("/resumenes")} onStudyRoomsClick={() => router.push("/salas")} />;
}
