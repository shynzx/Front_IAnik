"use client";

import { useCallback, useState } from "react";

export function useDraft(resourceKey: string, initialValue = "") {
  const storageKey = resourceKey ? `ianik:draft:${resourceKey}` : "";
  const read = (key: string) => key && typeof window !== "undefined" ? localStorage.getItem(key) ?? initialValue : initialValue;
  const [draft, setDraft] = useState(() => ({ key: storageKey, value: read(storageKey) }));
  const value = draft.key === storageKey ? draft.value : read(storageKey);

  const setValue = useCallback((next: string) => {
    setDraft({ key: storageKey, value: next });
    if (storageKey && next) localStorage.setItem(storageKey, next);
    else if (storageKey) localStorage.removeItem(storageKey);
  }, [storageKey]);

  const clear = useCallback(() => {
    setDraft({ key: storageKey, value: "" });
    if (storageKey) localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { value, setValue, clear };
}
