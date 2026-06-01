"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { Msg, Doc, FlashcardSet, Flashcard } from "./chat/tokens";
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

/* ── Keywords que disparan la generación de flashcards ── */
const FLASHCARD_KEYWORDS = [
  "flashcard", "flashcards", "tarjeta", "tarjetas",
  "flash card", "flash cards",
];

function isFlashcardRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return FLASHCARD_KEYWORDS.some(k => lower.includes(k));
}

/* ── Genera flashcards simuladas a partir del texto del usuario ── */
function generateMockFlashcards(userMessage: string): FlashcardSet {
  const id    = `fc-${Date.now()}`;
  const topic = userMessage.replace(/genera|crea|hazme|flashcards?|tarjetas?|sobre|acerca de/gi, "").trim() || "Minecraft";
  const title = `Flashcards: ${topic.slice(0, 40)}${topic.length > 40 ? "…" : ""}`;

  // Cuestionario de opciones múltiples (Interactivo) si el tema contiene "minecraft" o se pide directamente
  return {
    id, title, topic: topic || "Tema Interactivo",
    createdAt: new Date(),
    cards: [
      {
        id: `${id}-1`,
        question: "¿Cuál es el material principal necesario para fabricar una mesa de trabajo (crafting table) en Minecraft?",
        answer: "Tablones de madera",
        status: "pending",
        hint: "Se obtiene fácilmente golpeando árboles al inicio del juego.",
        answerOptions: [
          { text: "Tablones de madera", rationale: "¡Correcto! Con cuatro tablones de madera en la cuadrícula del inventario se fabrica la mesa básica.", isCorrect: true },
          { text: "Bloques de Piedra", rationale: "Incorrecto. La piedra sirve para herramientas y hornos, no para la mesa.", isCorrect: false },
          { text: "Lingotes de Hierro", rationale: "Incorrecto. El hierro requiere herramientas previas y fundición.", isCorrect: false }
        ]
      },
      {
        id: `${id}-2`,
        question: "¿Qué criatura (mob) explota de forma silenciosa cuando se acerca al jugador?",
        answer: "Creeper",
        status: "pending",
        hint: "Es de color verde y no tiene brazos.",
        answerOptions: [
          { text: "Zombi", rationale: "Incorrecto. Los zombis atacan cuerpo a cuerpo y se queman bajo el sol.", isCorrect: false },
          { text: "Creeper", rationale: "¡Correcto! El Creeper es icónico por su sigilo y detonaciones destructivas.", isCorrect: true },
          { text: "Esqueleto", rationale: "Incorrecto. Los esqueletos te atacan usando arco y flechas.", isCorrect: false }
        ]
      }
    ]
  };
}

export default function Chat() {
  const [screen, setScreen]             = useState<Screen>("onboard");
  const [messages, setMessages]         = useState<Msg[]>([]);
  const [docs, setDocs]                 = useState<Doc[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
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
    const tokenType = localStorage.getItem("auth_token_type") || "bearer";
    return `${tokenType} ${token}`;
  };

  const normalizeRagFile = (file: RAGFileResponse): Doc => {
    if (typeof file === "string") {
      return { id: file, name: file, type: file.toLowerCase().endsWith(".pdf") ? "pdf" : "word" };
    }
    const name = file.filename || file.name || "archivo";
    return {
      id: name, name,
      type: name.toLowerCase().endsWith(".pdf") ? "pdf" : "word",
      size: file.size,
      uploadedAt: file.uploaded_at || file.uploadedAt
        ? new Date(file.uploaded_at || file.uploadedAt || "")
        : undefined,
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
      try {
        const auth = getAuthHeader();
        if (auth) { await ragUploadFile(file, auth); uploaded = true; }
      } catch {}
      let content = "";
      try {
        const { extractFileContent } = await import("./chat/Filereader");
        content = await extractFileContent(file);
      } catch {}
      newDocs.push({ id, name, type, content, size: file.size, uploadedAt: new Date() });
      if (uploaded) { try { await loadRagFiles(); } catch {} }
    }
    setDocs(prev => {
      const existingNames = new Set(prev.map(d => d.name));
      const unique = newDocs.filter(d => !existingNames.has(d.name));
      return unique.length ? [...prev, ...unique] : prev;
    });
    setDragActive(false);
  };

  /* ── askAI: detecta si es una petición de flashcards ── */
  const askAI = async (question: string, attachments: Msg["attachments"] = []) => {
    setLoading(true);

    if (isFlashcardRequest(question)) {
      // 1. Crear el set con loading:true para mostrar el chip de carga
      const pendingSet: FlashcardSet = {
        id: `fc-${Date.now()}`,
        title: "Generando flashcards…",
        topic: question,
        cards: [],
        createdAt: new Date(),
        loading: true,
      };
      setFlashcardSets(prev => [...prev, pendingSet]);

      // 2. Respuesta inmediata de la IA con el flashcardSetId adjunto
      setTimeout(() => {
        setLoading(false);
        setTyping(true);

        // Generar el set real (simulado interactivo)
        const realSet = generateMockFlashcards(question);
        realSet.id = pendingSet.id; // mantener el mismo ID

        // Actualizar el set: loading:false, cards reales
        setFlashcardSets(prev =>
          prev.map(s => s.id === pendingSet.id ? { ...realSet, loading: false } : s)
        );

        // Añadir mensaje de la IA con referencia al set
        setMessages(prev => [
          ...prev,
          {
            role: "ai",
            content: `¡Claro! Generé ${realSet.cards.length} flashcards interactivas sobre "${realSet.topic}". Puedes abrirlas con el botón de abajo, seleccionar tu respuesta y marcar cada tarjeta como aprendida o para repasar.`,
            flashcardSetId: realSet.id,
          },
        ]);
      }, 1200);
      return;
    }

    // Respuesta normal (sin flashcards)
    setTimeout(() => {
      setLoading(false);
      setTyping(true);
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "Respuesta simulada (sin backend)." },
      ]);
    }, 1000);
  };

  const handleSubmit = async (e: FormEvent, attachments: Attachment[]) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || loading || typing) return;

    const question = input.trim();
    const msgAttachments: Msg["attachments"] = attachments.map(a => ({
      id: a.id, kind: a.kind, name: a.name, preview: a.preview,
    }));

    setMessages(prev => [...prev, { role: "user", content: question, attachments: msgAttachments }]);
    setInput("");
    await askAI(question, msgAttachments);
  };

  const handleEditMessage = useCallback(async (msgIndex: number, newContent: string) => {
    if (!newContent.trim() || loading || typing) return;
    setMessages(prev => {
      const before  = prev.slice(0, msgIndex);
      const edited  = { ...prev[msgIndex], content: newContent.trim() };
      return [...before, edited];
    });
    await askAI(newContent.trim());
  }, [loading, typing]);

  /* ── Actualizar estado de una flashcard individual ── */
  const handleUpdateFlashcard = useCallback((
    setId: string,
    cardId: string,
    status: "pending" | "learned" | "review"
  ) => {
    setFlashcardSets(prev =>
      prev.map(s =>
        s.id === setId
          ? { ...s, cards: s.cards.map(c => c.id === cardId ? { ...c, status } : c) }
          : s
      )
    );
  }, []);

  const handleLogin    = async () => { setScreen("chat"); };
  const handleRegister = async () => { setScreen("chat"); };
  const handleRecover  = async () => { setScreen("login"); };

  const handleDeleteDoc = async (doc: Doc) => {
    try {
      const auth = getAuthHeader();
      if (auth) await ragDeleteFile(doc.id, auth);
    } catch {}
    setDocs(prev => prev.filter(d => d.id !== doc.id));
  };

  useEffect(() => {
    if (screen !== "chat") return;
    loadRagFiles();
  }, [screen, loadRagFiles]);

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
      flashcardSets={flashcardSets}
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
      onUpdateFlashcard={handleUpdateFlashcard}
    />
  );
}