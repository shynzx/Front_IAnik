"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SummariesView from "@/components/screens/SummariesView";

export default function SummariesPage() {
  const router = useRouter(); const search = useSearchParams(); const notebookId = search.get("cuaderno") || "";
  return <SummariesView notebookId={notebookId} onNotebookChange={(id) => router.replace(`/resumenes?cuaderno=${id}`, { scroll: false })} onChatClick={() => router.push("/cuadernos")} onStudyClick={() => router.push(`/progreso?cuaderno=${notebookId}`)} onStudyRoomsClick={() => router.push("/salas")} />;
}
