"use client";

import { useState, useCallback } from "react";
import { Doc } from "./tokens";
import { extractFileContent } from "./Filereader";

/* ── Convierte DOCX a HTML limpio usando mammoth (CDN) ── */
async function extractDocxHtml(file: File): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mammoth = (window as any).mammoth;
    if (!mammoth) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
        script.onload  = () => resolve();
        script.onerror = () => reject(new Error("mammoth load failed"));
        document.head.appendChild(script);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mammoth = (window as any).mammoth;
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value ?? "";
  } catch {
    return "";
  }
}

export function useFileHandler() {
  const [docs, setDocs] = useState<Doc[]>([]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const name = file.name;
      const type: Doc["type"] = name.toLowerCase().endsWith(".pdf") ? "pdf" : "word";
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Evitar duplicados
      let skip = false;
      setDocs((prev) => {
        if (prev.some((d) => d.name === name)) { skip = true; return prev; }
        // 1️⃣ Insertar inmediatamente con loading:true → aparece la barra de progreso
        return [...prev, { id, name, type, size: file.size, uploadedAt: new Date(), loading: true }];
      });
      if (skip) continue;

      // 2️⃣ Procesar en background
      try {
        const fileUrl = URL.createObjectURL(file);
        const [content, htmlContent] = await Promise.all([
          extractFileContent(file).catch(() => ""),
          type === "word" ? extractDocxHtml(file) : Promise.resolve(""),
        ]);

        // 3️⃣ Reemplazar placeholder con datos reales → barra desaparece
        setDocs((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, content, htmlContent, fileUrl, loading: false } : d
          )
        );
      } catch (err) {
        console.warn(`Error procesando ${name}:`, err);
        setDocs((prev) =>
          prev.map((d) => (d.id === id ? { ...d, loading: false } : d))
        );
      }
    }
  }, []);

  const removeDoc = useCallback((id: string) => {
    setDocs((prev) => {
      const doc = prev.find((d) => d.id === id);
      if (doc?.fileUrl) URL.revokeObjectURL(doc.fileUrl);
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  return { docs, handleFiles, removeDoc };
}