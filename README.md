# 🦞 OpenClaw Command Center

Dashboard centralizado para gestionar todas tus instancias de OpenClaw.

## Características

- **Panel de Instancias** — Estado, versión, uptime, restart rápido
- **Editor de MDs** — SOUL, MEMORY, USER... con historial
- **Gestor Cron Jobs** — Ver/crear/editar, toggle on/off
- **Chat Unificado** — Comunicación con todas las instancias
- **Gestión LLMs** — API keys, modelos, fallback chain
- **Control de Costes** — Por instancia, alertas de presupuesto
- **SSH/SFTP Web** — Terminal y file manager integrados

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS
- **State:** Zustand
- **Backend:** Firebase (Firestore, Functions, Hosting)
- **Charts:** Recharts
- **Icons:** Lucide React

## Setup

### 1. Crear proyecto Firebase

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Login
firebase login

# Crear proyecto
firebase projects:create openclaw-dashboard --display-name "OpenClaw Dashboard"
```

### 2. Configurar Firebase

```bash
cd app
firebase init
# Seleccionar: Firestore, Functions, Hosting
# Usar proyecto existente: openclaw-dashboard
# Firestore rules: firestore.rules
# Functions language: TypeScript
# Hosting public directory: dist
# Single-page app: Yes
```

### 3. Configurar variables de entorno

Crear `app/.env.local`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=openclaw-dashboard.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=openclaw-dashboard
VITE_FIREBASE_STORAGE_BUCKET=openclaw-dashboard.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Desarrollo local

```bash
cd app
npm install
npm run dev
```

### 5. Deploy

```bash
cd app
npm run build
firebase deploy
```

## Estructura del Proyecto

```
openclaw-dashboard/
├── PLAN.md              # Plan de desarrollo
├── README.md            # Este archivo
├── app/                 # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes UI
│   │   ├── pages/       # Páginas
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Firebase, utils
│   │   ├── stores/      # Zustand stores
│   │   └── types/       # TypeScript types
│   ├── functions/       # Firebase Functions
│   └── firestore.rules  # Reglas de seguridad
└── docs/                # Documentación adicional
```

## Roadmap

- [x] Setup proyecto base (Mantine 8 + Tabler Icons)
- [x] Panel de instancias
- [x] Gestor de Cron Jobs
- [x] Chat unificado
- [x] Control de costes (gráficos, por instancia)
- [x] Gestión de LLMs (proveedores, API keys)
- [x] Editor de configuración (SOUL.md, MEMORY.md, etc.)
- [x] Terminal SSH + SFTP
- [x] Página de ajustes
- [ ] Auth con Firebase (Google)
- [ ] Conectar a API real de OpenClaw Gateway
- [ ] Deploy en Firebase Hosting

## Licencia

Privado - NG Clínicas
