# 🦞 LobsterClaw Setup Guide

## 1. Crear proyecto Firebase

Ya creaste el proyecto "LobsterClaw" en Firebase Console. Ahora:

### 1.1 Habilitar Authentication
1. Firebase Console → LobsterClaw → Authentication
2. Click "Get started"
3. Sign-in method → Google → Enable
4. Project public-facing name: "LobsterClaw"
5. Support email: tu email
6. Save

### 1.2 Crear Firestore Database
1. Firebase Console → Firestore Database
2. "Create database"
3. **Start in production mode** (usamos nuestras reglas)
4. Location: **europe-west1 (Belgium)** ← importante para latencia
5. Enable

### 1.3 Registrar Web App
1. Firebase Console → Project Settings (⚙️)
2. "Add app" → Web (</> icon)
3. Nickname: "LobsterClaw Web"
4. ✅ Firebase Hosting
5. Register app
6. **Copia la configuración** (la necesitamos abajo)

## 2. Configurar credenciales

Crea el archivo `app/.env.local` con los valores de Firebase:

```bash
cd app
cp .env.example .env.local
```

Edita `.env.local`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=lobsterclaw.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lobsterclaw
VITE_FIREBASE_STORAGE_BUCKET=lobsterclaw.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 3. Instalar Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

## 4. Deploy inicial

```bash
# Desde la raíz del proyecto
./deploy.sh all
```

Esto desplegará:
- Hosting (la web)
- Firestore rules
- Firestore indexes

## 5. Verificar

1. Abre https://lobsterclaw.web.app
2. Deberías ver la pantalla de login
3. Inicia sesión con tu cuenta de Google
4. ¡Listo!

## Comandos útiles

```bash
# Solo rebuild y deploy hosting
./deploy.sh hosting

# Solo actualizar reglas Firestore
./deploy.sh firestore

# Ver logs de funciones
firebase functions:log

# Emuladores locales
firebase emulators:start

# Ver estado del proyecto
firebase projects:list
```

## Estructura de Firestore

```
/instances/{instanceId}
  - name, emoji, location, host, port
  - gatewayToken (encrypted)
  - status, lastHeartbeat, version, model
  - sshConfig { host, port, user, keyId }
  
  /costs/{YYYY-MM}
    - total, budget, byProvider, byModel, tokensByModel
    - dailyCosts[]
  
  /messages/{messageId}
    - role, content, source, timestamp
  
  /config/{fileName}
    - content, lastModified

/llmProviders/{providerId}
  - name, apiKey (encrypted), baseUrl, isActive
  - models[], testStatus, lastTested

/cronJobs/{jobId}
  - instanceId, name, schedule, payload
  - enabled, lastRun, lastStatus, nextRun

/settings/global
  - darkMode, notifications24h, budgetAlerts
  - budgetThreshold, defaultModel
```

## Seguridad

- Solo tu email (diegoferrandezsempere@gmail.com) tiene acceso
- API keys se encriptarán con Cloud KMS (TODO)
- Todo el tráfico es HTTPS
- Firestore rules bloquean acceso no autorizado

## Siguiente: Conectar a OpenClaw Gateway

Para que el dashboard se comunique con las instancias de OpenClaw, necesitamos:

1. **Webhook endpoint**: Firebase Function que recibe eventos de OpenClaw
2. **API proxy**: Firebase Function que hace llamadas a los gateways

Esto lo implementamos cuando tengas el proyecto Firebase funcionando.
