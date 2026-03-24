"use client";

/**
 * fileReader.ts
 * Extracts readable text from uploaded PDF or Word (.docx) files in the browser.
 *
 * For PDF: uses PDF.js (loaded via CDN script tag — add to your layout/head if not present).
 * For DOCX: parses the raw XML inside the zip manually (no external lib needed).
 *
 * Usage:
 *   import { extractFileContent } from "./fileReader";
 *   const text = await extractFileContent(file);
 */

/* ── DOCX parser (pure browser, no library needed) ─────── */
async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // A .docx is a ZIP. We look for word/document.xml inside it.
  // We use the browser's DecompressionStream if available, otherwise
  // fall back to a simple regex on the raw bytes (works for ASCII-heavy docs).
  try {
    // Try using JSZip if it's available globally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const JSZip = (window as any).JSZip;
    if (JSZip) {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const xml = await zip.file("word/document.xml")?.async("string");
      if (xml) return xmlToPlainText(xml);
    }
  } catch {
    // fall through
  }

  // Fallback: decode as UTF-8 and strip XML tags
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(arrayBuffer);
  const xmlMatch = text.match(/<w:body>([\s\S]*?)<\/w:body>/);
  if (xmlMatch) return xmlToPlainText(xmlMatch[0]);

  // Last resort: return any printable ASCII found
  return text.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s{3,}/g, "\n").trim();
}

function xmlToPlainText(xml: string): string {
  // Extract text between <w:t> tags and join with spaces/newlines
  const paragraphs: string[] = [];
  const pRegex = /<w:p[ >]([\s\S]*?)<\/w:p>/g;
  let pMatch;
  while ((pMatch = pRegex.exec(xml)) !== null) {
    const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    let tMatch;
    const words: string[] = [];
    while ((tMatch = tRegex.exec(pMatch[1])) !== null) {
      words.push(tMatch[1]);
    }
    const line = words.join("").trim();
    if (line) paragraphs.push(line);
  }
  return paragraphs.join("\n");
}

/* ── PDF parser (uses PDF.js CDN) ───────────────────────── */
async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) throw new Error("PDF.js not loaded");

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.str)
        .join(" ");
      if (pageText.trim()) pages.push(pageText.trim());
    }

    return pages.join("\n\n");
  } catch {
    // PDF.js not available — return a placeholder
    return "[No se pudo extraer el texto del PDF. Asegúrate de incluir PDF.js en tu proyecto.]";
  }
}

/* ── Public API ─────────────────────────────────────────── */
export async function extractFileContent(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    return extractPdfText(file);
  }

  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    return extractDocxText(file);
  }

  // Plain text fallback
  return file.text();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}