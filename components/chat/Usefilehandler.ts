/**
 * useFileHandler.ts
 *
 * Drop-in hook that replaces wherever manejas onFiles en tu app.
 * Extrae el texto de cada archivo y lo guarda en el estado de docs.
 *
 * INTEGRACIÓN:
 *   1. Importa este hook en tu page.tsx / componente raíz.
 *   2. Reemplaza tu lógica actual de onFiles con la que provee este hook.
 *
 * Ejemplo en page.tsx:
 *
 *   import { useFileHandler } from "./useFileHandler";
 *
 *   const { docs, handleFiles } = useFileHandler();
 *
 *   // Pasa handleFiles donde antes pasabas onFiles:
 *   <OnboardingScreen onFiles={handleFiles} ... />
 *   <ChatScreen onFiles={handleFiles} docs={docs} ... />
 */

"use client";

import { useState, useCallback } from "react";
import { Doc } from "./tokens";
import { extractFileContent } from "./fileReader";


export function useFileHandler() {
  const [docs, setDocs] = useState<Doc[]>([]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newDocs: Doc[] = [];

    for (const file of Array.from(files)) {
      const name = file.name;
      const type: Doc["type"] = name.toLowerCase().endsWith(".pdf") ? "pdf" : "word";
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Extract text content asynchronously
      let content = "";
      try {
        content = await extractFileContent(file);
      } catch (err) {
        console.warn(`Could not extract content from ${name}:`, err);
      }

      newDocs.push({
        id,
        name,
        type,
        content,
        size: file.size,
        uploadedAt: new Date(),
      });
    }

    setDocs((prev) => {
      // Avoid duplicates by name
      const existingNames = new Set(prev.map((d) => d.name));
      const unique = newDocs.filter((d) => !existingNames.has(d.name));
      return [...prev, ...unique];
    });
  }, []);

  const removeDoc = useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { docs, handleFiles, removeDoc };
}