# OpenClaw Command Center 🦞

## Visión
Un dashboard centralizado en Google Cloud para gestionar todas las instancias de OpenClaw: monitorización, configuración, comunicación y control de costes.

---

## Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenClaw Command Center                       │
│                   (React + Firebase Hosting)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Instancias│  │  Cron    │  │  Chat    │  │  Costes & LLMs   │ │
│  │ & Config │  │  Jobs    │  │ Unified  │  │  Monitoring      │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
└───────┼─────────────┼─────────────┼─────────────────┼───────────┘
        │             │             │                 │
        ▼             ▼             ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Firebase Backend                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Firestore  │  │  Functions  │  │  Cloud Pub/Sub          │  │
│  │  (config,   │  │  (API,      │  │  (real-time messaging)  │  │
│  │   costs)    │  │   relay)    │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OpenClaw Instances                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │   Alvi    │  │  Instance │  │  Instance │  │   Local   │    │
│  │  (GCloud) │  │     B     │  │     C     │  │  (Pi/Mac) │    │
│  │  e2-med   │  │           │  │           │  │           │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Módulos del Dashboard

### 1. 🖥️ Panel de Instancias
- **Lista de instancias** con estado (online/offline/error)
- **Información de cada una:**
  - Nombre, ubicación (GCloud/local/VPS)
  - Versión de OpenClaw
  - Uptime
  - Último heartbeat
- **Acciones rápidas:**
  - Restart gateway
  - Ver logs en tiempo real
  - SSH/SFTP (para instancias remotas)

### 2. 📄 Editor de Configuración
- **Visor/Editor de archivos MD:**
  - SOUL.md
  - MEMORY.md
  - USER.md
  - AGENTS.md
  - HEARTBEAT.md
  - TOOLS.md
- **Historial de cambios** (git-backed)
- **Diff viewer** para comparar versiones
- **Preview** de cómo el agente interpretará los cambios

### 3. ⏰ Gestor de Cron Jobs
- **Vista de tabla:**
  | Instancia | Job | Schedule | Última ejecución | Estado | Acciones |
  |-----------|-----|----------|------------------|--------|----------|
  | Alvi | Email check | */30 * * * * | hace 5m | ✅ | ▶️ 🗑️ ✏️ |
- **Crear/Editar/Eliminar** cron jobs
- **Ejecutar manualmente** cualquier job
- **Logs de ejecución** por job
- **Toggles on/off** sin borrar

### 4. 💬 Chat Unificado
- **Interfaz estilo Slack/Discord:**
  - Canal por instancia
  - Mensajes en tiempo real
  - Historial de conversación
- **Características:**
  - Markdown rendering
  - Adjuntos (imágenes, archivos)
  - Menciones (@instancia)
  - Broadcast a todas las instancias
- **Integración bidireccional:**
  - Los mensajes del dashboard llegan como si fueran de Telegram
  - Las respuestas del agente aparecen en el dashboard

### 5. 🤖 Gestión de LLMs
- **Proveedores configurados:**
  | Provider | Modelo | API Key | Estado | Default |
  |----------|--------|---------|--------|---------|
  | Anthropic | claude-opus-4-5 | sk-ant...*** | ✅ | ⭐ |
  | Google | gemini-2.5-pro | AIza...*** | ✅ | |
  | Zhipu | glm-5 | ***...*** | ✅ | |
- **Parámetros por modelo:**
  - Max tokens
  - Temperature
  - Thinking mode
- **Test de conectividad** por API key
- **Rotación automática** (fallback chain)

### 6. 💰 Control de Costes
- **Dashboard de costes:**
  ```
  ┌─────────────────────────────────────────┐
  │  Febrero 2026                           │
  │  ════════════════════════════════════   │
  │  Total: $47.32 / $100.00 budget         │
  │  ████████████░░░░░░░░ 47%               │
  │                                         │
  │  Por instancia:                         │
  │  • Alvi: $32.10 (Anthropic: $28, G: $4) │
  │  • Bot B: $15.22                        │
  │                                         │
  │  Por modelo:                            │
  │  • Claude Opus: $35.00                  │
  │  • Gemini Pro: $8.32                    │
  │  • GLM-5: $4.00                         │
  └─────────────────────────────────────────┘
  ```
- **Alertas de presupuesto** (80%, 90%, 100%)
- **Histórico mensual** con gráficos
- **Reset automático** el día 1 de cada mes
- **Proyección de gasto** basada en uso actual

### 7. 📁 Gestor de Proyectos
- **Lista de proyectos por instancia:**
  - SaluFirst, SaluFact, SaluFile...
  - Estado del repo (commits pendientes, branch)
  - Última actividad
- **Quick actions:**
  - Ver README
  - Abrir en GitHub
  - Trigger deploy

### 8. 🔐 SSH/SFTP Integrado
- **Terminal web** (xterm.js) para SSH
- **File manager** estilo Finder/Explorer para SFTP
- **Conexiones guardadas** por instancia
- **Key management** (generar, importar claves)

---

## Stack Técnico

### Frontend
- **React 18** + TypeScript
- **Vite** para build
- **TailwindCSS** + shadcn/ui (componentes)
- **Monaco Editor** (para editar MDs)
- **xterm.js** (terminal SSH)
- **Recharts** (gráficos de costes)

### Backend
- **Firebase:**
  - Firestore (config, costes, logs)
  - Functions (API relay, webhooks)
  - Hosting (dashboard)
  - Auth (tu cuenta Google)
- **Cloud Pub/Sub** (mensajería real-time)

### Comunicación con Instancias
- **OpenClaw Gateway API** (ya existe)
  - `gateway config.get/config.patch`
  - `cron list/add/remove/run`
  - `sessions_send` para chat
- **Webhook inverso:** cada instancia reporta a Firebase
- **SSH Proxy:** Cloud Functions + IAP para túneles seguros

---

## Fases de Desarrollo

### Fase 1: Core (2-3 semanas)
- [ ] Setup proyecto React + Firebase
- [ ] Auth con Google (solo tu cuenta)
- [ ] Panel de instancias (registro manual)
- [ ] Visor de archivos MD (read-only)
- [ ] Chat básico unidireccional

### Fase 2: Gestión (2-3 semanas)
- [ ] Editor de MDs con guardado
- [ ] Gestor de cron jobs completo
- [ ] Lista de LLMs y estado
- [ ] Chat bidireccional

### Fase 3: Monitorización (2 semanas)
- [ ] Tracking de costes por instancia
- [ ] Gráficos y proyecciones
- [ ] Alertas de presupuesto
- [ ] Dashboard de estado en tiempo real

### Fase 4: Acceso Remoto (2 semanas)
- [ ] Terminal SSH web
- [ ] File manager SFTP
- [ ] Key management

### Fase 5: Polish (1 semana)
- [ ] Mobile responsive
- [ ] Dark/Light mode
- [ ] Notificaciones push
- [ ] Backup/Export de configs

---

## Requisitos para Cada Instancia

Para que una instancia de OpenClaw sea gestionable desde el dashboard:

1. **Endpoint de API accesible** (puerto 3033 o configurado)
2. **Token de gateway** para autenticar
3. **Webhook configurado** para reportar a Firebase:
   ```yaml
   # En openclaw.yaml
   webhooks:
     dashboard:
       url: https://us-central1-openclaw-dashboard.cloudfunctions.net/instanceWebhook
       events: [heartbeat, cron.run, session.message, cost.update]
   ```
4. **Para SSH:** clave pública del dashboard instalada

---

## Modelo de Datos (Firestore)

```typescript
// /instances/{instanceId}
interface Instance {
  name: string;
  location: 'gcloud' | 'local' | 'vps';
  host: string;
  port: number;
  gatewayToken: string;  // encrypted
  sshConfig?: {
    host: string;
    port: number;
    user: string;
    keyId: string;
  };
  status: 'online' | 'offline' | 'error';
  lastHeartbeat: Timestamp;
  version: string;
  createdAt: Timestamp;
}

// /instances/{instanceId}/costs/{YYYY-MM}
interface MonthlyCost {
  total: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  tokensByModel: Record<string, { input: number; output: number }>;
  budget: number;
  resetAt: Timestamp;
}

// /instances/{instanceId}/messages/{messageId}
interface Message {
  role: 'user' | 'assistant';
  content: string;
  source: 'dashboard' | 'telegram' | 'other';
  timestamp: Timestamp;
}

// /llmProviders/{providerId}
interface LLMProvider {
  name: string;
  models: string[];
  apiKey: string;  // encrypted
  baseUrl?: string;
  isActive: boolean;
  testStatus: 'ok' | 'error' | 'unknown';
  lastTested: Timestamp;
}
```

---

## Seguridad

- **Auth:** Solo tu cuenta de Google (Firebase Auth)
- **API Keys:** Encriptadas en Firestore con Cloud KMS
- **SSH Keys:** Almacenadas en Secret Manager
- **Network:** 
  - Dashboard en Firebase Hosting (HTTPS)
  - APIs detrás de IAP cuando sea posible
  - VPN/Tailscale para instancias locales

---

## Nombres Propuestos

- **OpenClaw Command Center** (formal)
- **The Claw** (interno)
- **ClawHub** (si lo abres a otros usuarios algún día)

---

## Siguiente Paso

¿Por dónde quieres empezar?

1. **Setup inicial:** Creo el proyecto Firebase + React base
2. **Diseño UI:** Mockups en Figma/diseño más detallado
3. **Prototipo rápido:** Panel mínimo funcional para Alvi

Dame luz verde y arrancamos 🚀
