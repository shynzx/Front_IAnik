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
    const files = await ragListFiles(getAuthHeader());
    setDocs(files.map(normalizeRagFile));
  }, []);

  useEffect(() => {
    const onDragEnter = () => setDragActive(true);
    window.addEventListener("dragenter", onDragEnter);
    return () => window.removeEventListener("dragenter", onDragEnter);
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    if (!getAuthHeader()) {
      setMessages((prev) => [
        ...prev,
        { role: "sys", content: "Inicia sesión para subir archivos al RAG." },
      ]);
      setScreen("login");
      return;
    }

    const validFiles = Array.from(files).filter((f) => /\.(pdf|doc|docx)$/i.test(f.name));
    if (!validFiles.length) {
      setMessages((prev) => [
        ...prev,
        { role: "sys", content: "Solo se permiten archivos PDF, DOC o DOCX para RAG." },
      ]);
      return;
    }

    try {
      for (const file of validFiles) {
        await ragUploadFile(file, getAuthHeader());
      }
      await loadRagFiles();
      setMessages((prev) => [
        ...prev,
        { role: "sys", content: `${validFiles.length} archivo${validFiles.length > 1 ? "s" : ""} cargado${validFiles.length > 1 ? "s" : ""} al RAG.` },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "No se pudieron subir los archivos al RAG.";
      if (isAuthError(errorMessage)) {
        clearAuth();
        setScreen("login");
      }
      setMessages((prev) => [
        ...prev,
        { role: "sys", content: errorMessage },
      ]);
    }

    setDragActive(false);
    if (screen === "onboard") setScreen("chat");
  };

  const handleSubmit = async (e: FormEvent, attachments: Attachment[]) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || loading || typing) return;

    const question = input.trim();
    const userMsg: Msg = {
      role: "user",
      content: question,
      attachments: attachments.map((a) => ({
        id: a.id,
        kind: a.kind,
        name: a.name,
        preview: a.preview,
      })),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    if (!question) return;

    const filenames = docs.map((doc) => doc.name);
    if (filenames.length === 0) {
      setMessages((prev) => [
        ...prev,
        { role: "sys", content: "Primero sube al menos un archivo para consultar el RAG." },
      ]);
      return;
    }

    setLoading(true);
    try {
      const answer = await ragAsk(question, filenames, getAuthHeader());
      setLoading(false);
      setTyping(true);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: answer },
      ]);
    } catch (err) {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "sys",
          content: err instanceof Error ? err.message : "No se pudo consultar el sistema RAG.",
        },
      ]);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const tokenData = await loginWithPassword(email, password);
    localStorage.setItem("auth_token", tokenData.access_token);
    localStorage.setItem("auth_token_type", tokenData.token_type || "bearer");
    await loadRagFiles();
    setScreen("chat");
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    await signupUser(name, email, password);
    const tokenData = await loginWithPassword(email, password);
    localStorage.setItem("auth_token", tokenData.access_token);
    localStorage.setItem("auth_token_type", tokenData.token_type || "bearer");
    await loadRagFiles();
    setScreen("chat");
  };

  const handleDeleteDoc = async (doc: Doc) => {
    await ragDeleteFile(doc.name, getAuthHeader());
    await loadRagFiles();
  };

  useEffect(() => {
    if (screen !== "chat") return;
    loadRagFiles().catch((err) => {
      const errorMessage = err instanceof Error ? err.message : "No se pudo cargar la lista de archivos del RAG.";
      if (isAuthError(errorMessage)) {
        clearAuth();
        setScreen("login");
      }
      setMessages((prev) => {
        if (prev.some((msg) => msg.role === "sys" && msg.content.includes("No se pudo cargar la lista de archivos del RAG"))) {
          return prev;
        }
        return [...prev, { role: "sys", content: errorMessage }];
      });
    });
  }, [screen, loadRagFiles]);

  const handleRecover = async (email: string) => {
    console.log("Recover:", email);
    setScreen("login");
  };

  if (screen === "login") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onGoRegister={() => setScreen("register")}
        onGoRecover={() => setScreen("recover")}
        onGoHome={() => setScreen("onboard")}
      />
    );
  }

  if (screen === "register") {
    return (
      <RegisterScreen
        onRegister={handleRegister}
        onGoLogin={() => setScreen("login")}
        onGoHome={() => setScreen("onboard")}
      />
    );
  }

  if (screen === "recover") {
    return (
      <RecoverScreen
        onRecover={handleRecover}
        onGoLogin={() => setScreen("login")} onVerifyCode={function (code: string): Promise<void> {
          throw new Error("Function not implemented.");
        } } onNewPassword={function (password: string): Promise<void> {
          throw new Error("Function not implemented.");
        } }      />
    );
  }

  if (screen === "onboard") {
    return (
      <OnboardingScreen
        dragActive={dragActive}
        onFiles={handleFiles}
        onDragLeave={() => setDragActive(false)}
        onGoLogin={() => setScreen("login")}
        onGoRegister={() => setScreen("register")}
      />
    );
  }

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
    />
  );
}