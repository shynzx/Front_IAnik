"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { Msg, Doc } from "./chat/tokens";
import OnboardingScreen from "./chat/OnboardingScreen";
import ChatScreen from "./chat/Chatscreen";
import LoginScreen from "./Log/Loginscreen";
import RegisterScreen from "./Log/Registerscreen";
import RecoverScreen from "./Log/Recoverscreen";
import { Attachment } from "./chat/ChatInput";
import { loginWithPassword, signupUser, ragUploadFile, ragAsk, ragListFiles, ragDeleteFile, RAGFileResponse } from "@/lib/api";

type Screen = "onboard" | "chat" | "login" | "register" | "recover";

export default function Chat() {

  const [screen, setScreen] = useState<Screen>("chat");

  const [messages, setMessages]     = useState<Msg[]>([]);
  const [docs, setDocs]             = useState<Doc[]>([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [typing, setTyping]         = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [docsOpen, setDocsOpen]     = useState(false);
  const [docsFullscreen, setDocsFullscreen] = useState(false);
  const [docSearch, setDocSearch]   = useState("");

  useEffect(() => {
    localStorage.setItem("auth_token", "fake-token");
    localStorage.setItem("auth_token_type", "bearer");
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    const tokenType = localStorage.getItem("auth_token_type") || "bearer";
    return `${tokenType} ${token}`;
  };

  const clearAuth = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_token_type");
  };

  const isAuthError = (message: string) => {
    const normalized = message.toLowerCase();
    return (
      normalized.includes("user not found") ||
      normalized.includes("not authenticated") ||
      normalized.includes("could not validate credentials") ||
      normalized.includes("401")
    );
  };

  const normalizeRagFile = (file: RAGFileResponse): Doc => {
    if (typeof file === "string") {
      return {
        id: file,
        name: file,
        type: file.toLowerCase().endsWith(".pdf") ? "pdf" : "word",
      };
    }
    const name = file.filename || file.name || "archivo";
    return {
      id: name,
      name,
      type: name.toLowerCase().endsWith(".pdf") ? "pdf" : "word",
      size: file.size,
      uploadedAt: file.uploaded_at || file.uploadedAt ? new Date(file.uploaded_at || file.uploadedAt || "") : undefined,
      content: file.content || file.text,
    };
  };

  const loadRagFiles = useCallback(async () => {
    try {
      const files = await ragListFiles(getAuthHeader());
      setDocs(files.map(normalizeRagFile));
    } catch {
      console.log("Modo sin backend: ignorando carga de archivos");
    }
  }, []);

  useEffect(() => {
    const onDragEnter = () => setDragActive(true);
    window.addEventListener("dragenter", onDragEnter);
    return () => window.removeEventListener("dragenter", onDragEnter);
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) => /\.(pdf|doc|docx)$/i.test(f.name));
    if (!validFiles.length) {
      setMessages((prev) => [...prev, { role: "sys", content: "Solo se permiten archivos PDF, DOC o DOCX." }]);
      return;
    }
    const newDocs: Doc[] = [];
    for (const file of validFiles) {
      const name = file.name;
      const id   = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const type: Doc["type"] = name.toLowerCase().endsWith(".pdf") ? "pdf" : "word";
      let uploaded = false;
      try {
        const auth = getAuthHeader();
        if (auth) { await ragUploadFile(file, auth); uploaded = true; }
      } catch { /* ignore */ }
      let content = "";
      try {
        const { extractFileContent } = await import("./chat/Filereader");
        content = await extractFileContent(file);
      } catch { /* ignore */ }
      newDocs.push({ id, name, type, content, size: file.size, uploadedAt: new Date() });
      if (uploaded) { try { await loadRagFiles(); } catch { /* ignore */ } }
    }
    setDocs((prev) => {
      const existingNames = new Set(prev.map((d) => d.name));
      const unique = newDocs.filter((d) => !existingNames.has(d.name));
      return unique.length ? [...prev, ...unique] : prev;
    });
    setDragActive(false);
  };

  // ── Función central de envío/regeneración ──────────────────────────────
  const askAI = async (question: string, attachments: Msg["attachments"] = []) => {
    setLoading(true);
    // 🔥 Respuesta fake (modo demo) — reemplaza con tu llamada ragAsk()
    setTimeout(() => {
      setLoading(false);
      setTyping(true);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Respuesta simulada (sin backend)." },
      ]);
    }, 1000);
  };

  const handleSubmit = async (e: FormEvent, attachments: Attachment[]) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || loading || typing) return;

    const question = input.trim();
    const msgAttachments: Msg["attachments"] = attachments.map((a) => ({
      id: a.id,
      kind: a.kind,
      name: a.name,
      preview: a.preview,
    }));

    setMessages((prev) => [...prev, { role: "user", content: question, attachments: msgAttachments }]);
    setInput("");
    await askAI(question, msgAttachments);
  };

  // ── Editar mensaje de usuario ───────────────────────────────────────────
  // Recibe el índice del mensaje editado y el nuevo texto.
  // Elimina ese mensaje y todo lo que vino después, luego regenera.
  const handleEditMessage = useCallback(async (msgIndex: number, newContent: string) => {
    if (!newContent.trim() || loading || typing) return;

    setMessages((prev) => {
      // Conserva todo hasta el mensaje editado (exclusive) y agrega la versión nueva
      const before = prev.slice(0, msgIndex);
      const edited = { ...prev[msgIndex], content: newContent.trim() };
      return [...before, edited];
    });

    await askAI(newContent.trim());
  }, [loading, typing]);

  const handleLogin = async () => { setScreen("chat"); };
  const handleRegister = async () => { setScreen("chat"); };

  const handleDeleteDoc = async (doc: Doc) => {
    try {
      const auth = getAuthHeader();
      if (auth) await ragDeleteFile(doc.id, auth);
    } catch { /* ignore */ }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  };

  useEffect(() => {
    if (screen !== "chat") return;
    loadRagFiles();
  }, [screen, loadRagFiles]);

  const handleRecover = async () => { setScreen("login"); };

  if (screen === "login") return (
    <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} onGoRecover={() => setScreen("recover")} onGoHome={() => setScreen("chat")} />
  );
  if (screen === "register") return (
    <RegisterScreen onRegister={handleRegister} onGoLogin={() => setScreen("login")} onGoHome={() => setScreen("chat")} />
  );
  if (screen === "recover") return (
    <RecoverScreen onRecover={handleRecover} onGoLogin={() => setScreen("login")} onVerifyCode={async () => {}} onNewPassword={async () => {}} />
  );
  if (screen === "onboard") return (
    <OnboardingScreen dragActive={dragActive} onFiles={handleFiles} onDragLeave={() => setDragActive(false)} onGoLogin={() => setScreen("login")} onGoRegister={() => setScreen("register")} />
  );

  return (
    <ChatScreen
      messages={messages}
      docs={docs}
      input={input}
      loading={loading}
      typing={typing}
      dragActive={dragActive}
      docsOpen={docsOpen}
      docsFullscreen={docsFullscreen}
      docSearch={docSearch}
      onInputChange={setInput}
      onSubmit={handleSubmit}
      onFiles={handleFiles}
      onDeleteDoc={handleDeleteDoc}
      onDragLeave={() => setDragActive(false)}
      onDocsOpen={setDocsOpen}
      onDocsFullscreen={setDocsFullscreen}
      onDocSearchChange={setDocSearch}
      onTypingComplete={() => setTyping(false)}
      onGoLogin={() => setScreen("login")}
      onGoRegister={() => setScreen("register")}
      onEditMessage={handleEditMessage}
    />
  );
}