import type { ReactNode } from "react";

export default function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="ui-empty"><h2 className="m-0 text-lg font-semibold">{title}</h2>{description && <p className="mb-5 mt-2 max-w-md text-sm text-white/50">{description}</p>}{action}</div>;
}
