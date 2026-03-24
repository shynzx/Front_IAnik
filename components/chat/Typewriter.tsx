"use client";

import { useState, useEffect } from "react";

interface TypewriterProps {
  text: string;
  onUpdate?: () => void;
  onComplete?: () => void;
}

export default function Typewriter({ text, onUpdate, onComplete }: TypewriterProps) {
  const [d, setD] = useState("");

  useEffect(() => {
    const w = text.split(/(\s+)/);
    let i = 0;
    const t = setInterval(() => {
      setD(w.slice(0, ++i).join(""));
      onUpdate?.();
      if (i >= w.length) {
        clearInterval(t);
        onComplete?.();
      }
    }, 20);
    return () => clearInterval(t);
  }, [text, onUpdate, onComplete]);

  return <>{d}</>;
}