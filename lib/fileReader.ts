"use client";

/**
 * Filereader.ts
 * Extracts readable text from PDF or Word (.docx) files in the browser.
 *
 * PDF  → uses PDF.js (loaded via CDN in layout.tsx)
 * DOCX → parses the raw XML inside the zip (no external lib needed)
 */

const PDFJS_CDN    = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

interface PdfTextItem { str?: string }
interface PdfDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<{ getTextContent(): Promise<{ items: PdfTextItem[] }> }>;
}
interface PdfJsLibrary {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(options: { data: ArrayBuffer }): { promise: Promise<PdfDocument> };
}
interface ZipArchive {
  file(path: string): { async(type: "string"): Promise<string> } | null;
}
interface JsZipLibrary { loadAsync(data: ArrayBuffer): Promise<ZipArchive> }
declare global { interface Window { pdfjsLib?: PdfJsLibrary; JSZip?: JsZipLibrary } }

/* ── Ensure PDF.js is loaded and its worker is configured ── */
async function ensurePdfJs(): Promise<PdfJsLibrary> {
  // Already loaded?
  let pdfjsLib = window.pdfjsLib;

  if (!pdfjsLib) {
    // Dynamically inject the script and wait for it
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${PDFJS_CDN}"]`);
      if (existing) {
        // Script tag exists but may still be loading
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("PDF.js load failed")));
        // If it already fired, pdfjsLib might be available right now
        if (window.pdfjsLib) resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = PDFJS_CDN;
      script.onload  = () => resolve();
      script.onerror = () => reject(new Error("PDF.js load failed"));
      document.head.appendChild(script);
    });
    pdfjsLib = window.pdfjsLib;
  }

  // Configure worker (safe to set multiple times)
  if (pdfjsLib && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  }

  if (!pdfjsLib) throw new Error("PDF.js no está disponible");
  return pdfjsLib;
}

/* ── PDF parser ─────────────────────────────────────────── */
async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const pdfjsLib = await ensurePdfJs();
    if (!pdfjsLib) throw new Error("PDF.js not available");

    // Make sure worker is set before loading document
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
      const page    = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str ?? "").join(" ");
      if (pageText.trim()) pages.push(pageText.trim());
    }

    return pages.join("\n\n") || "[El PDF no contiene texto extraíble (puede ser escaneado).]";
  } catch (err) {
    console.warn("PDF extraction error:", err);
    return "[No se pudo extraer el texto del PDF.]";
  }
}

/* ── DOCX parser (pure browser, no lib needed) ──────────── */
async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const JSZip = window.JSZip;
    if (JSZip) {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const xml = await zip.file("word/document.xml")?.async("string");
      if (xml) return xmlToPlainText(xml);
    }
  } catch { console.warn("JSZip no disponible, usando fallback XML manual"); }

  // Fallback: decode as UTF-8 and strip XML tags
  const decoder  = new TextDecoder("utf-8");
  const text     = decoder.decode(arrayBuffer);
  const xmlMatch = text.match(/<w:body>([\s\S]*?)<\/w:body>/);
  if (xmlMatch) return xmlToPlainText(xmlMatch[0]);

  return text.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s{3,}/g, "\n").trim();
}

function xmlToPlainText(xml: string): string {
  const paragraphs: string[] = [];
  const pRegex = /<w:p[ >]([\s\S]*?)<\/w:p>/g;
  let pMatch;
  while ((pMatch = pRegex.exec(xml)) !== null) {
    const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    let tMatch;
    const words: string[] = [];
    while ((tMatch = tRegex.exec(pMatch[1])) !== null) words.push(tMatch[1]);
    const line = words.join("").trim();
    if (line) paragraphs.push(line);
  }
  return paragraphs.join("\n");
}

/* ── Public API ─────────────────────────────────────────── */
export async function extractFileContent(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf"))              return extractPdfText(file);
  if (name.endsWith(".docx") || name.endsWith(".doc")) return extractDocxText(file);
  return file.text();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
