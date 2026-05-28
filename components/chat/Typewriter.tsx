"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterProps {
  text: string;
  onUpdate?: () => void;
  onComplete?: () => void;
}

export default function Typewriter({ text, onUpdate, onComplete }: TypewriterProps) {
  const [d, setD] = useState("");
  // Use refs so changing callbacks never restart the effect
  const onUpdateRef  = useRef(onUpdate);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onUpdateRef.current  = onUpdate;  }, [onUpdate]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    // Reset display when text changes (new message)
    setD("");
    const words = text.split(/(\s+)/);
    let i = 0;
    const t = setInterval(() => {
      setD(words.slice(0, ++i).join(""));
      onUpdateRef.current?.();
      if (i >= words.length) {
        clearInterval(t);
        onCompleteRef.current?.();
      }
    }, 20);
    return () => clearInterval(t);
  }, [text]); // Only restart when the actual text changes

  return <>{d}</>;
}