"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import type { Msg, Doc } from "../types";
import OnboardingScreen from "./chat/OnboardingScreen";
import ChatScreen from "./chat/Chatscreen";
import LoginScreen from "./auth/LoginScreen";
import RegisterScreen from "./auth/RegisterScreen";
import RecoverScreen from "./auth/RecoverScreen";
import type { Attachment } from "./chat/ChatInput";
import { useAuthContext } from "@/providers/AuthProvider";
import { useRag } from "@/hooks/useRag";
import type { RAGFileResponse } from "@/lib/api";

let msgCounter = 0;
const makeMsgId = () => `msg_${Date.now()}_${++msgCounter}`;

type Screen = "onboard" | "chat" | "login" | "register" | "recover";

export default function Chat() {
  const { user, login, signup, logout } = useAuthContext();
  const { uploadFile, ask, listFiles, deleteFile } = useRag();

  const [screen, setScreen] = useState<Screen>("onboard");

  const [messages, setMessages]     = useState<Msg[]>([]);
  const [docs, setDocs]             = useState<Doc[]>([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [typing, setTyping]         = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [docsOpen, setDocsOpen]     = useState(false);
  const [docsFullscreen, setDocsFullscreen] = useState(false);
  const [docSearch, setDocSearch]   = useState("");

  const normalizeRagFile = (file: RAGFileResponse): Doc => {
    const name = file.filename || file.name || file.id || "archivo";
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
    try { setDocs((await listFiles()).map(normalizeRagFile)); }
    catch { console.warn("Modo sin backend: ignorando carga de archivos"); }
  }, [listFiles]);

  useEffect(() => {
    const onDragEnter = () => setDragActive(true);
    window.addEventListener("dragenter", onDragEnter);
    return () => window.removeEventListener("dragenter", onDragEnter);
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) => /\.(pdf|doc|docx)$/i.test(f.name));
    if (!validFiles.length) {
      setMessages((prev) => [...prev, { id: makeMsgId(), role: "sys", content: "Solo se permiten archivos PDF, DOC o DOCX." }]);
      return;
    }
    const newDocs: Doc[] = [];
    for (const file of validFiles) {
      const name = file.name;
      const id   = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const type: Doc["type"] = name.toLowerCase().endsWith(".pdf") ? "pdf" : "word";
      let uploaded = false;
      try {
        await uploadFile(file); uploaded = true;
      } catch (e) { console.warn("Error subiendo archivo:", name, e); }
      let content = "";
      try {
        const { extractFileContent } = await import("../lib/fileReader");
        content = await extractFileContent(file);
      } catch (e) { console.warn("Error extrayendo contenido:", name, e); }
      newDocs.push({ id, name, type, content, size: file.size, uploadedAt: new Date() });
      if (uploaded) { try { await loadRagFiles(); } catch (e) { console.warn("Error recargando archivos:", e); } }
    }
    setDocs((prev) => {
      const existingNames = new Set(prev.map((d) => d.name));
      const unique = newDocs.filter((d) => !existingNames.has(d.name));
      return unique.length ? [...prev, ...unique] : prev;
    });
    setDragActive(false);
  };

  const askAI = async (question: string, attachments: Attachment[] = []) => {
    setLoading(true);
    try {
      const filenames: string[] = [];

      for (const a of attachments) {
        if (!a.file) continue;
        try {
          const res = await uploadFile(a.file);
          if (res?.filename) filenames.push(res.filename);
        } catch (e) {
          console.warn("No se pudo subir adjunto:", a.name, e);
        }
      }

      const answer = await ask(question, filenames);
      setTyping(true);
      setMessages((prev) => [...prev, { id: makeMsgId(), role: "ai", content: answer }]);
    } catch (err) {
      console.warn("Error en askAI:", err);
      setMessages((prev) => [...prev, { id: makeMsgId(), role: "ai", content: "Error: no se obtuvo respuesta del backend." }]);
    } finally {
      setLoading(false);
    }
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

    setMessages((prev) => [...prev, { id: makeMsgId(), role: "user", content: question, attachments: msgAttachments }]);
    setInput("");
    await askAI(question, attachments);
  };

  const handleEditMessage = async (msgIndex: number, newContent: string) => {
    if (!newContent.trim() || loading || typing) return;

    setMessages((prev) => {
      const before = prev.slice(0, msgIndex);
      const edited = { ...prev[msgIndex], content: newContent.trim() };
      return [...before, edited];
    });

    await askAI(newContent.trim());
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setScreen("chat");
      try { await loadRagFiles(); } catch (e) { console.warn("Error cargando archivos:", e); }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || "Error al iniciar sesión");
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      await signup(name, email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || "No se pudo registrar el usuario");
    }
    try {
      await login(email, password);
      setScreen("chat");
      try { await loadRagFiles(); } catch (e) { console.warn("Error cargando archivos tras registro:", e); }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || "Registro exitoso pero falló el inicio de sesión");
    }
  };

  const handleDeleteDoc = async (doc: Doc) => {
    try {
      await deleteFile(doc.id);
    } catch (e) { console.warn("Error eliminando archivo en servidor:", doc.name, e); }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  };

  useEffect(() => {
    if (screen !== "chat") return;
    loadRagFiles();
  }, [screen, loadRagFiles]);

  const handleRecover = async () => { setScreen("login"); };

  const handleLogout = () => {
    logout();
    setScreen("onboard");
  };

  if (screen === "login") return (
    <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} onGoRecover={() => setScreen("recover")} onGoHome={() => setScreen("onboard")} />
  );

  if (screen === "register") return (
    <RegisterScreen onRegister={handleRegister} onGoLogin={() => setScreen("login")} onGoHome={() => setScreen("onboard")} />
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
      onLogout={handleLogout}
      userName={user?.full_name ?? null}
      onEditMessage={handleEditMessage}
    />
  );
}
