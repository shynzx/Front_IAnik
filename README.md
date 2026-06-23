# PromptGPA — Frontend IAnik

Asistente de estudio inteligente con IA. Plataforma interactiva para cargar documentos, chatear con IA, generar flashcards y exámenes, colaborar en salas de estudio y monitorear el progreso académico.

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.1.4 (App Router) |
| UI | React 19.2.3 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v4 + PostCSS |
| Tipografía | Poppins (Google Fonts) |
| Linting | ESLint 9 (flat config) |
| Proxy API | Next.js Rewrites → `http://127.0.0.1:8000` |

---

## Funcionalidades

- **Autenticación JWT** — Registro, inicio de sesión, perfil de usuario
- **Chat con IA** — Interfaz conversacional con preguntas y respuestas
- **Carga de documentos** — Subida y extracción de texto de PDF, DOC y DOCX (lado cliente)
- **Cuadernos** — Organización de archivos y conversaciones por materia
- **Salas de Estudio** — Espacios colaborativos con código de acceso, archivos compartidos, chat grupal, flashcards y exámenes
- **Evaluaciones IA** — Generación automática de flashcards y exámenes de opción múltiple
- **Progreso** — Métricas acumuladas, tarjetas pendientes, actividad diaria
- **API Keys** — Claves de un solo uso firmadas JWT
- **Webhooks** — Notificaciones HTTP para eventos (`exam.completed`)
- **Panel Admin** — Estadísticas de clase, logs de auditoría, almacenamiento por usuario
- **Dashboard de estudio** — Visualización de progreso con anillos, barras y tarjetas

---

## Empezando

### Prerrequisitos

- Node.js 20+
- Backend FastAPI corriendo en `http://127.0.0.1:8000`

### Instalación

```bash
git clone <repo-url>
cd Front_IAnik
npm install
```

### Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_API_URL=http://api.localhost:8000
```

Si no se define, por defecto usa `http://api.localhost:8000`.

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Producción

```bash
npm run build
npm start
```

---

## Proxy del backend

`next.config.ts` reescribe `/api/:path*` → `http://127.0.0.1:8000/:path*`.  
Todas las llamadas del frontend pasan por el proxy de Next.js.

---

## Estructura del proyecto

```
app/                     # App Router (layout, página principal, estilos globales)
├── layout.tsx           # Layout raíz: AuthProvider, ErrorBoundary, PDF.js CDN
├── page.tsx             # Página principal: renderiza <Chat />
└── globals.css          # Tailwind v4 + animaciones keyframes

components/
├── Chat.tsx             # Orquestador principal (manejo de pantallas, estado global)
├── chat/                # Componentes del chat (Chatscreen, ChatInput, MessageList, DocsPanel, Typewriter, etc.)
│   └── docs/            # DocCard, DocViewer, highlightMatch
├── auth/                # LoginScreen, RegisterScreen, RecoverScreen
├── layout/              # Sidebar, AuthButtons, UserPanel
├── study/               # DashboardScreen, ExamModal, FlashcardModal
│   └── dashboard/       # StatCard, Ring, OverallBar, CategoryButton/Drawer, Columnas
└── summaries/           # SummaryScreen, SummaryCard, SummaryModal, GenerateSummaryModal

hooks/                   # Custom hooks (10 hooks + barrel)
├── useAuth.ts           # login, signup, logout
├── useRag.ts            # upload, ask, listFiles, deleteFile
├── useFlashcards.ts     # generate, listByNotebook, createInRoom, listByRoom
├── useQuizzes.ts        # generate, get, submit, attempts
├── useProgress.ts       # metrics, pendingCards, dailyActivity
├── useOrganizations.ts  # create/join room, listCreated/Joined, get, access
├── useApiKeys.ts        # create, list, remove
├── useWebhooks.ts       # create, list, attempts, retry
├── useAdmin.ts          # classStats, auditLogs, storage
└── useHealth.ts         # check, processes, metadata

lib/
├── api.ts               # Cliente HTTP tipado (60 endpoints en 9 módulos)
└── fileReader.ts        # Extracción de texto de PDF y DOCX en cliente

providers/
└── AuthProvider.tsx     # Contexto de autenticación global

types/
└── index.ts             # Tipos UI + tipos API + design tokens

public/                  # Assets estáticos (SVGs, imágenes)
```

---

## API endpoints

El cliente expone 60 funciones agrupadas en 9 módulos:

| Módulo | Rutas |
|--------|-------|
| **Usuarios** | register, login, getMe, deleteMe |
| **Cuadernos** | CRUD + archivos (subir/listar/eliminar) + chats (crear/listar/eliminar/mensajes) |
| **Salas** | crear, unirse, listar (propias/participa), detalle, acceso, archivos, chats, flashcards, exámenes |
| **Evaluaciones** | generar flashcards, consultar, generar examen, obtener, submit, historial de intentos |
| **Progreso** | métricas, tarjetas pendientes, actividad diaria |
| **API Keys** | crear, listar, revocar |
| **Webhooks** | suscripciones CRUD, logs de intentos, reintento |
| **Admin** | estadísticas de clase, logs de auditoría, almacenamiento |
| **Salud** | root, health v1, procesos, metadata |

Todas las rutas autenticadas usan el helper `withAuthHeader()` que inyecta el Bearer token almacenado.

---

## Scripts disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Compilación de producción (TypeScript + Turbopack)
npm run start    # Inicia servidor de producción
npm run lint     # ESLint con configuración Next.js core-web-vitals
```

---

## Convenciones del código

- **Idioma**: Español en UI del usuario, inglés en código fuente
- **Estilos**: Inline styles con objetos `React.CSSProperties` (no módulos CSS)
- **Design tokens**: Constantes compartidas en `types/index.ts` (`BG`, `gradText`, `pp`)
- **Hooks**: Cada hook retorna `{ operaciones, loading, error }`
- **API client**: `fetchAPI<T>(endpoint, options)` — wrapper genérico sobre `fetch()`
- **Auth Context**: `useAuthContext()` para acceder al estado de autenticación en cualquier componente
