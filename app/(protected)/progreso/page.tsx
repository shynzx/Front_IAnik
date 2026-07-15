"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StudyView from "@/components/screens/StudyView";
import { listNotebooks } from "@/lib/api";
import type { Notebook } from "@/types";

export default function ProgressPage() {
  const router = useRouter(); const search = useSearchParams();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const selected = search.get("cuaderno") || "";
  useEffect(() => { listNotebooks().then((items) => { setNotebooks(items); if (!selected && items[0]) router.replace(`/progreso?cuaderno=${items[0].id}`); }).catch(() => setNotebooks([])); }, [router, selected]);
  return <div className="h-full overflow-y-auto"><div className="page-shell pb-0"><label className="notebook-picker">Cuaderno<select value={selected} onChange={(event) => router.replace(`/progreso?cuaderno=${event.target.value}`)}>{notebooks.map((notebook) => <option key={notebook.id} value={notebook.id}>{notebook.title}</option>)}</select></label></div><StudyView notebookId={selected} onChatClick={() => router.push("/cuadernos")} onSummariesClick={() => router.push(`/resumenes?cuaderno=${selected}`)} onStudyRoomsClick={() => router.push("/salas")} /></div>;
}
