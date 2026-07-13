# IAnik — Frontend

Interfaz web de IAnik, una plataforma de estudio asistida por inteligencia artificial. Permite organizar cuadernos, cargar documentos, conversar sobre su contenido, generar material de estudio y colaborar mediante salas.

Este repositorio contiene el frontend. La API se encuentra en el proyecto hermano `PromtGPA_server` y debe estar disponible para utilizar las funciones autenticadas.

## Funcionalidades

- Registro e inicio de sesión con correo y contraseña.
- Inicio de sesión con Google Identity Services.
- Persistencia de sesión mediante JWT.
- Creación, edición y eliminación de cuadernos.
- Carga y administración de documentos PDF, DOC y DOCX.
- Chats independientes asociados a cada cuaderno.
- Respuestas basadas en los documentos del usuario.
- Generación y consulta de resúmenes.
- Generación de flashcards y exámenes.
- Seguimiento del progreso de estudio.
- Creación y acceso a salas de estudio mediante código.
- Archivos, chats, resúmenes y evaluaciones compartidos dentro de salas.
- Interfaz responsive para escritorio y dispositivos móviles.
- Confirmaciones para acciones destructivas y cierre de sesión.
- Recuperación de la última pantalla activa después de recargar.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| Next.js 16 | Framework y App Router |
| React 19 | Componentes e interacción |
| TypeScript 5 | Tipado estático |
| Tailwind CSS 4 | Sistema de estilos |
| Google Identity Services | Autenticación con Google |
| ESLint 9 | Calidad y consistencia del código |

El proyecto no utiliza una biblioteca externa de componentes. Los botones, modales, diálogos y patrones visuales se mantienen mediante componentes y utilidades propias.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Backend `PromtGPA_server` ejecutándose en el puerto `8000`.
- Docker Desktop, si se utilizará el backend mediante Docker Compose.
- Un ID de cliente OAuth de Google para habilitar el acceso con Google.

## Instalación

```bash
git clone https://github.com/shynzx/Front_IAnik.git
cd Front_IAnik
npm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz del frontend:

```env
# URL pública utilizada por el cliente para comunicarse con FastAPI.
NEXT_PUBLIC_API_URL=http://localhost:8000

# ID OAuth 2.0 de una aplicación web configurada en Google Cloud.
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_id.apps.googleusercontent.com

# Destino del proxy /api de Next.js. Es opcional en desarrollo local.
BACKEND_URL=http://localhost:8000
```

### Configuración de Google

En Google Cloud Console crea un ID de cliente OAuth 2.0 de tipo **Aplicación web** y agrega estos orígenes de JavaScript autorizados:

```text
http://localhost:3000
http://127.0.0.1:3000
```

El backend no implementa OAuth de Google directamente. El frontend procesa la credencial recibida de Google Identity Services y utiliza el flujo existente de registro e inicio de sesión del backend con una contraseña sintética determinista.

## Ejecutar el proyecto

### 1. Iniciar el backend

Desde `PromtGPA_server`:

```bash
docker compose up --build -d
```

Servicios disponibles:

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 2. Iniciar el frontend

Desde `Front_IAnik`:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Next.js en modo desarrollo |
| `npm run build` | Genera la compilación optimizada de producción |
| `npm run start` | Ejecuta la compilación de producción |
| `npm run lint` | Ejecuta ESLint |
| `npx tsc --noEmit` | Verifica TypeScript sin generar archivos |

En PowerShell 5.1 se recomienda ejecutar el type-check mediante:

```powershell
cmd /c "npx tsc --noEmit"
```

## Estructura principal

```text
Front_IAnik/
├── app/
│   ├── [...fallback]/       # Redirección de URLs inexistentes
│   ├── globals.css          # Tokens y estilos globales
│   ├── layout.tsx           # Layout raíz y proveedores
│   └── page.tsx             # Orquestación de pantallas
├── components/
│   ├── auth/                # Login, registro y recuperación
│   ├── chat/                # Mensajes, input y documentos
│   ├── layout/              # Sidebar, perfil y estructura general
│   ├── screens/             # Vistas principales de la aplicación
│   ├── study/               # Progreso, flashcards y exámenes
│   ├── study-rooms/         # Listado y detalle de salas
│   ├── summaries/           # Generación y visualización de resúmenes
│   └── ui/                  # Componentes reutilizables
├── hooks/                   # Hooks de acceso a funcionalidades
├── lib/
│   ├── api.ts               # Cliente HTTP tipado
│   ├── constants.ts         # Constantes compartidas
│   ├── fileReader.ts        # Lectura de documentos en cliente
│   └── googleAuth.ts        # Integración con Google GIS
├── providers/
│   └── AuthProvider.tsx     # Sesión y contexto de autenticación
├── public/                  # Recursos estáticos
├── types/                   # Tipos compartidos
└── next.config.ts           # Configuración y proxy hacia FastAPI
```

## Comunicación con la API

Las solicitudes están centralizadas en `lib/api.ts`. El cliente:

1. Obtiene el token mediante `/users/login`.
2. Guarda la sesión localmente.
3. Incluye el token Bearer en las solicitudes protegidas.
4. Limpia la sesión local al cerrar sesión o cuando el token deja de ser válido.

En desarrollo, FastAPI debe aceptar los orígenes `http://localhost:3000` y `http://127.0.0.1:3000`. El backend incluido ya contempla ambos valores en su configuración predeterminada de CORS.

## Flujo de navegación

La aplicación funciona como una experiencia de una sola página. `app/page.tsx` controla la pantalla activa y guarda en `localStorage`:

- La sección actual.
- El cuaderno seleccionado.
- La sala de estudio seleccionada.

Al recargar se restaura el último contexto disponible. Si el usuario introduce una URL inexistente, el fallback limpia la ruta y redirige a `/`.

## Inteligencia artificial

El proveedor de IA se configura en el backend. Si no existe una clave disponible o el proveedor alcanza su cuota, el servidor puede utilizar su cliente mock como respaldo. La configuración de proveedores y credenciales no debe almacenarse en este repositorio.

## Validación antes de un pull request

Ejecuta:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

La estrategia actual utiliza `Develop` como rama de integración y `main` como rama estable. Antes de fusionar, actualiza `Develop` con los cambios recientes de `main` y resuelve cualquier conflicto localmente.

## Seguridad

- No publiques `.env.local` ni claves privadas.
- El ID de cliente OAuth puede estar expuesto en el navegador, pero debe restringirse a los orígenes autorizados.
- Las claves de OpenAI, Google AI o Anthropic pertenecen exclusivamente al backend.
- Las operaciones destructivas deben conservar sus diálogos de confirmación.

## Estado del proyecto

El frontend está conectado con los endpoints actuales de usuarios, cuadernos, resúmenes, evaluaciones y salas de estudio. La disponibilidad de respuestas reales de IA depende de la configuración y cuota del proveedor seleccionado en el backend.
