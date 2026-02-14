// OpenClaw Instance
export interface Instance {
  id: string;
  name: string;
  emoji?: string;
  location: 'gcloud' | 'local' | 'vps';
  host: string;
  port: number;
  gatewayToken: string;
  sshConfig?: {
    host: string;
    port: number;
    user: string;
    keyId: string;
  };
  status: 'online' | 'offline' | 'error';
  lastHeartbeat: Date;
  version: string;
  model: string;
  createdAt: Date;
}

// Cron Job
export interface CronJob {
  id: string;
  instanceId: string;
  name: string;
  schedule: CronSchedule;
  payload: CronPayload;
  enabled: boolean;
  lastRun?: Date;
  lastStatus?: 'success' | 'error';
  nextRun?: Date;
}

export type CronSchedule = 
  | { kind: 'at'; at: string }
  | { kind: 'every'; everyMs: number; anchorMs?: number }
  | { kind: 'cron'; expr: string; tz?: string };

export type CronPayload =
  | { kind: 'systemEvent'; text: string }
  | { kind: 'agentTurn'; message: string; model?: string; thinking?: string; timeoutSeconds?: number };

// LLM Provider
export interface LLMProvider {
  id: string;
  name: string;
  models: LLMModel[];
  apiKey: string;
  baseUrl?: string;
  isActive: boolean;
  testStatus: 'ok' | 'error' | 'unknown';
  lastTested?: Date;
}

export interface LLMModel {
  id: string;
  name: string;
  alias?: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  maxTokens: number;
  supportsThinking?: boolean;
}

// Costs
export interface MonthlyCost {
  instanceId: string;
  month: string; // YYYY-MM
  total: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  tokensByModel: Record<string, { input: number; output: number }>;
  budget: number;
  dailyCosts: DailyCost[];
}

export interface DailyCost {
  date: string; // YYYY-MM-DD
  total: number;
  byModel: Record<string, number>;
}

// Chat Message
export interface ChatMessage {
  id: string;
  instanceId: string;
  role: 'user' | 'assistant';
  content: string;
  source: 'dashboard' | 'telegram' | 'discord' | 'other';
  timestamp: Date;
}

// Config Files
export interface ConfigFile {
  name: string;
  path: string;
  content: string;
  lastModified: Date;
}

export type ConfigFileName = 'SOUL.md' | 'MEMORY.md' | 'USER.md' | 'AGENTS.md' | 'HEARTBEAT.md' | 'TOOLS.md' | 'IDENTITY.md';
