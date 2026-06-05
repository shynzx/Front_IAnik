"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { Msg, Doc, FlashcardSet, Flashcard, ExamSet, Summary } from "./chat/tokens";
import OnboardingScreen from "./chat/OnboardingScreen";
import ChatScreen from "./chat/Chatscreen";
import LoginScreen from "./Log/Loginscreen";
import RegisterScreen from "./Log/Registerscreen";
import RecoverScreen from "./Log/Recoverscreen";
import { Attachment } from "./chat/ChatInput";
import {
  loginWithPassword, signupUser,
  ragUploadFile, ragAsk, ragListFiles, ragDeleteFile, RAGFileResponse,
} from "@/lib/api";

type Screen = "onboard" | "chat" | "login" | "register" | "recover";

export type AuthUser = {
  name: string;
  email: string;
};

const FLASHCARD_KEYWORDS = ["flashcard", "flashcards", "tarjeta", "tarjetas", "flash card", "flash cards"];
const EXAM_KEYWORDS = ["examen", "examenes", "exámenes", "evaluacion", "evaluación", "test", "prueba"];

function isFlashcardRequest(text: string) { return FLASHCARD_KEYWORDS.some(k => text.toLowerCase().includes(k)); }
function isExamRequest(text: string)      { return EXAM_KEYWORDS.some(k => text.toLowerCase().includes(k)); }

function generateMockFlashcards(userMessage: string): FlashcardSet {
  const id    = `fc-${Date.now()}`;
  const topic = userMessage.replace(/genera|crea|hazme|flashcards?|tarjetas?|sobre|acerca de/gi, "").trim() || "Minecraft";
  const title = `Flashcards: ${topic.slice(0, 40)}${topic.length > 40 ? "…" : ""}`;
  return {
    id, title, topic: topic || "Tema Interactivo", createdAt: new Date(),
    cards: [{
      id: `${id}-1`,
      question: "¿Cuál es el material principal necesario para fabricar una mesa de trabajo (crafting table) en Minecraft?",
      answer: "Tablones de madera", status: "pending",
      hint: "Se obtiene fácilmente golpeando árboles al inicio del juego.",
      answerOptions: [
        { text: "Tablones de madera", rationale: "¡Correcto! Con cuatro tablones de madera en la cuadrícula del inventario se fabrica la mesa básica.", isCorrect: true },
        { text: "Bloques de Piedra",   rationale: "Incorrecto. La piedra sirve para herramientas y hornos, no para la mesa.", isCorrect: false },
        { text: "Lingotes de Hierro",  rationale: "Incorrecto. El hierro requiere herramientas previas y fundición.", isCorrect: false },
      ],
    }],
  };
}

function generateMockExam(userMessage: string): ExamSet {
  const id    = `exam-${Date.now()}`;
  const topic = userMessage.replace(/genera|crea|hazme|examen|exámenes|test|evaluacion|sobre|acerca de/gi, "").trim() || "Conocimiento General";
  const title = `Examen: ${topic.slice(0, 40)}${topic.length > 40 ? "…" : ""}`;
  return {
    id, title, topic: topic || "Evaluación Interactiva", createdAt: new Date(),
    cards: [{
      id: `${id}-1`,
      question: "¿Qué criatura (mob) explota de forma silenciosa cuando se acerca al jugador en Minecraft?",
      answer: "Creeper", status: "pending",
      hint: "Es de color verde y no tiene brazos.",
      answerOptions: [
        { text: "Zombi",     rationale: "Incorrecto. Los zombis atacan cuerpo a cuerpo y se queman bajo el sol.", isCorrect: false },
        { text: "Creeper",   rationale: "¡Correcto! El Creeper es icónico por su sigilo y detonaciones destructivas.", isCorrect: true },
        { text: "Esqueleto", rationale: "Incorrecto. Los esqueletos te atacan usando arco y flechas.", isCorrect: false },
      ],
    }],
  };
}

export default function Chat() {
  const [screen, setScreen]   = useState<Screen>("onboard");
  const [user, setUser]       = useState<AuthUser | null>(null); // null = no autenticado

  const [activePage, setActivePage] = useState<"chat" | "summaries" | "dashboard">("chat");
  const [messages, setMessages]         = useState<Msg[]>([]);
  const [docs, setDocs]                 = useState<Doc[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [examSets, setExamSets]         = useState<ExamSet[]>([]);
  const [summaries, setSummaries]       = useState<Summary[]>([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [typing, setTyping]             = useState(false);
  const [dragActive, setDragActive]     = useState(false);
  const [docsOpen, setDocsOpen]         = useState(false);
  const [docsFullscreen, setDocsFullscreen] = useState(false);
  const [docSearch, setDocSearch]       = useState("");

  useEffect(() => {
    localStorage.setItem("auth_token", "fake-token");
    localStorage.setItem("auth_token_type", "bearer");
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    return `${localStorage.getItem("auth_token_type") || "bearer"} ${token}`;
  };

  const normalizeRagFile = (file: RAGFileResponse): Doc => {
    if (typeof file === "string") return { id: file, name: file, type: file.toLowerCase().endsWith(".pdf") ? "pdf" : "word" };
    const name = file.filename || file.name || "archivo";
    return {
      id: name, name, type: name.toLowerCase().endsWith(".pdf") ? "pdf" : "word",
      size: file.size,
      uploadedAt: file.uploaded_at || file.uploadedAt ? new Date(file.uploaded_at || file.uploadedAt || "") : undefined,
      content: file.content || file.text,
    };
  };

  const loadRagFiles = useCallback(async () => {
    try { setDocs((await ragListFiles(getAuthHeader())).map(normalizeRagFile)); }
    catch { console.log("Modo sin backend: ignorando carga de archivos"); }
  }, []);

  useEffect(() => {
    const onDragEnter = () => setDragActive(true);
    window.addEventListener("dragenter", onDragEnter);
    return () => window.removeEventListener("dragenter", onDragEnter);
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(f => /\.(pdf|doc|docx)$/i.test(f.name));
    if (!validFiles.length) {
      setMessages(prev => [...prev, { role: "sys", content: "Solo se permiten archivos PDF, DOC o DOCX." }]);
      return;
    }
    const newDocs: Doc[] = [];
    for (const file of validFiles) {
      const name = file.name;
      const id   = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const type: Doc["type"] = name.toLowerCase().endsWith(".pdf") ? "pdf" : "word";
      let uploaded = false;
      try { const auth = getAuthHeader(); if (auth) { await ragUploadFile(file, auth); uploaded = true; } } catch {}
      let content = "";
      try { const { extractFileContent } = await import("./chat/Filereader"); content = await extractFileContent(file); } catch {}
      newDocs.push({ id, name, type, content, size: file.size, uploadedAt: new Date() });
      if (uploaded) { try { await loadRagFiles(); } catch {} }
    }
    setDocs(prev => {
      const existingNames = new Set(prev.map(d => d.name));
      const unique = newDocs.filter(d => !existingNames.has(d.name));
      return unique.length ? [...prev, ...unique] : prev;
    });
    setDragActive(false);
    // ── Si estamos en onboarding, ir al chat una vez subido el archivo ──
    if (screen === "onboard") setScreen("chat");
  };

  const askAI = async (question: string, attachments: Msg["attachments"] = []) => {
    setLoading(true);
    if (isExamRequest(question)) {
      const pending: ExamSet = { id: `exam-${Date.now()}`, title: "Generando examen…", topic: question, cards: [], createdAt: new Date(), loading: true };
      setExamSets(prev => [...prev, pending]);
      setTimeout(() => {
        setLoading(false); setTyping(true);
        const real = generateMockExam(question); real.id = pending.id;
        setExamSets(prev => prev.map(s => s.id === pending.id ? { ...real, loading: false } : s));
        setMessages(prev => [...prev, { role: "ai", content: `¡Claro! He generado un examen interactivo sobre "${real.topic}". Haz clic en el botón de abajo para responder las preguntas y poner a prueba tu conocimiento.`, examSetId: real.id }]);
      }, 1200);
      return;
    }
    if (isFlashcardRequest(question)) {
      const pending: FlashcardSet = { id: `fc-${Date.now()}`, title: "Generando flashcards…", topic: question, cards: [], createdAt: new Date(), loading: true };
      setFlashcardSets(prev => [...prev, pending]);
      setTimeout(() => {
        setLoading(false); setTyping(true);
        const real = generateMockFlashcards(question); real.id = pending.id;
        setFlashcardSets(prev => prev.map(s => s.id === pending.id ? { ...real, loading: false } : s));
        setMessages(prev => [...prev, { role: "ai", content: `¡Claro! Generé ${real.cards.length} flashcards interactivas sobre "${real.topic}". Puedes abrirlas con el botón de abajo.`, flashcardSetId: real.id }]);
      }, 1200);
      return;
    }
    setTimeout(() => {
      setLoading(false); setTyping(true);
      setMessages(prev => [...prev, { role: "ai", content: "Respuesta simulada (sin backend)." }]);
    }, 1000);
  };

  const handleSubmit = async (e: FormEvent, attachments: Attachment[]) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || loading || typing) return;
    const question = input.trim();
    const msgAttachments: Msg["attachments"] = attachments.map(a => ({ id: a.id, kind: a.kind, name: a.name, preview: a.preview }));
    setMessages(prev => [...prev, { role: "user", content: question, attachments: msgAttachments }]);
    setInput("");
    await askAI(question, msgAttachments);
  };

  const handleEditMessage = useCallback(async (msgIndex: number, newContent: string) => {
    if (!newContent.trim() || loading || typing) return;
    setMessages(prev => [...prev.slice(0, msgIndex), { ...prev[msgIndex], content: newContent.trim() }]);
    await askAI(newContent.trim());
  }, [loading, typing]);

  const handleUpdateFlashcard = useCallback((setId: string, cardId: string, status: "pending" | "learned" | "review") => {
    setFlashcardSets(prev => prev.map(s => s.id === setId ? { ...s, cards: s.cards.map(c => c.id === cardId ? { ...c, status } : c) } : s));
  }, []);

  const handleUpdateExamCard = useCallback((setId: string, cardId: string, status: "pending" | "learned" | "review") => {
    setExamSets(prev => prev.map(s => s.id === setId ? { ...s, cards: s.cards.map(c => c.id === cardId ? { ...c, status } : c) } : s));
  }, []);

  const handleGenerateSummary = async (selectedDocs: Doc[], title: string, prompt: string): Promise<string | null> => {
    const id = `sum-${Date.now()}`;
    setSummaries(prev => [...prev, { id, title, docName: selectedDocs.map(d => d.name).join(", "), createdAt: new Date(), content: "", keyPoints: [], loading: true }]);
    setTimeout(() => {
      setSummaries(prev => prev.map(s => s.id === id ? { ...s, content: `Aquí tienes un resumen generado en base a tus archivos.\nInstrucciones utilizadas: "${prompt}"\n\nEste es un texto simulado que pronto se conectará a tu backend.`, keyPoints: ["Concepto fundamental 1", "Análisis detallado", "Conclusión principal"], loading: false } : s));
    }, 2000);
    return id;
  };

  const handleDeleteSummary = useCallback((id: string) => { setSummaries(prev => prev.filter(s => s.id !== id)); }, []);

  // ── Auth handlers ──────────────────────────────────────────────────────────────
  const handleLogin = async (email: string, _password: string) => {
    // En producción aquí iría la llamada real al backend
    const name = email.split("@")[0]; // placeholder hasta conectar API
    setUser({ name, email });
    setScreen("chat");
  };

  const handleRegister = async (name: string, email: string, _password: string) => {
    setUser({ name, email });
    setScreen("chat");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_token_type");
    // Volvemos a onboarding
    setScreen("onboard");
    setMessages([]);
    setDocs([]);
    setFlashcardSets([]);
    setExamSets([]);
    setSummaries([]);
  };

  const handleRecover = async () => { setScreen("login"); };
  const handleDeleteDoc = async (doc: Doc) => {
    try { const auth = getAuthHeader(); if (auth) await ragDeleteFile(doc.id, auth); } catch {}
    setDocs(prev => prev.filter(d => d.id !== doc.id));
  };

  const handleActivePageChange = (page: "chat" | "summaries" | "dashboard") => {
    if (page !== "chat") setTyping(false);
    setActivePage(page);
  };

  useEffect(() => { if (screen === "chat") loadRagFiles(); }, [screen, loadRagFiles]);

  // ── Screens ────────────────────────────────────────────────────────────────────
  if (screen === "login") return (
    <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} onGoRecover={() => setScreen("recover")} onGoHome={() => setScreen("onboard")} />
  );
  if (screen === "register") return (
    <RegisterScreen onRegister={handleRegister} onGoLogin={() => setScreen("login")} onGoHome={() => setScreen("onboard")} />
  );
  if (screen === "recover") return (
    <RecoverScreen onRecover={handleRecover} onGoLogin={() => setScreen("login")} onVerifyCode={async () => {}} onNewPassword={async () => {}} />
  );

  // ── MODIFICACIÓN: Si no hay archivos, SIEMPRE mostrar OnboardingScreen ──
  // Incluso si screen === "chat" (lo cual pasa tras iniciar sesión),
  // se fuerza a mostrar el Onboarding. Los botones Auth se ocultarán
  // internamente si hay un 'user'.
  if (docs.length === 0) {
    return (
      <OnboardingScreen
        dragActive={dragActive}
        onFiles={handleFiles}
        onDragLeave={() => setDragActive(false)}
        onGoLogin={() => setScreen("login")}
        onGoRegister={() => setScreen("register")}
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Si ya hay archivos (docs.length > 0), renderizamos el ChatScreen normalmente
  return (
    <ChatScreen
      messages={messages} docs={docs} flashcardSets={flashcardSets} examSets={examSets} summaries={summaries}
      input={input} loading={loading} typing={typing} dragActive={dragActive}
      docsOpen={docsOpen} docsFullscreen={docsFullscreen} docSearch={docSearch}
      activePage={activePage} onActivePageChange={handleActivePageChange}
      onInputChange={setInput} onSubmit={handleSubmit} onFiles={handleFiles}
      onDeleteDoc={handleDeleteDoc} onDragLeave={() => setDragActive(false)}
      onDocsOpen={setDocsOpen} onDocsFullscreen={setDocsFullscreen} onDocSearchChange={setDocSearch}
      onTypingComplete={() => {
        setTyping(false);
        setMessages(prev => {
          const lastAiIdx = [...prev].map((m, i) => m.role === "ai" ? i : -1).filter(i => i !== -1);
          if (!lastAiIdx.length) return prev;
          return prev.map((m, i) => i === lastAiIdx[lastAiIdx.length - 1] ? { ...m, typed: true } : m);
        });
      }}
      // Auth
      user={user}
      onGoLogin={() => setScreen("login")}
      onGoRegister={() => setScreen("register")}
      onLogout={handleLogout}
      // Other
      onEditMessage={handleEditMessage}
      onUpdateFlashcard={handleUpdateFlashcard}
      onUpdateExamCard={handleUpdateExamCard}
      onGenerateSummary={handleGenerateSummary}
      onDeleteSummary={handleDeleteSummary}
    />
  );
}