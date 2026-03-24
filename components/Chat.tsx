"use client";

import { useState, FormEvent, useEffect } from "react";
import { Msg, Doc } from "./chat/tokens";
import OnboardingScreen from "./chat/OnboardingScreen";
import ChatScreen from "./chat/Chatscreen";
import LoginScreen from "./Log/Loginscreen";
import RegisterScreen from "./Log/Registerscreen";
import RecoverScreen from "./Log/Recoverscreen";


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

  useEffect(() => {
    const onDragEnter = () => setDragActive(true);
    window.addEventListener("dragenter", onDragEnter);
    return () => window.removeEventListener("dragenter", onDragEnter);
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newDocs: Doc[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      type: f.name.endsWith(".pdf") ? "pdf" : "word",
    }));
    setDocs((prev) => [...prev, ...newDocs]);
    setDragActive(false);
    if (screen === "onboard") setScreen("chat");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || typing) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTyping(true);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Hola, soy IAnik. ¿En qué te puedo ayudar?" },
      ]);
    }, 1200);
  };

  const handleLogin = async (email: string, _password: string) => {
    console.log("Login:", email);
    setScreen("chat");
  };

  const handleRegister = async (name: string, email: string, _password: string) => {
    console.log("Register:", name, email);
    setScreen("chat");
  };

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
        onGoLogin={() => setScreen("login")}
        onGoHome={() => setScreen("onboard")}
      />
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