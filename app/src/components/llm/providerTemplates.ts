export interface ProviderTemplate {
  name: string;
  icon: string;
  keyPlaceholder: string;
  baseUrl?: string;
  models: { id: string; name: string; input: number; output: number }[];
}

export const PROVIDER_TEMPLATES: Record<string, ProviderTemplate> = {
  anthropic: {
    name: 'Anthropic',
    icon: '🟠',
    keyPlaceholder: 'sk-ant-...',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', input: 3, output: 15 },
    ],
  },
  deepseek: {
    name: 'DeepSeek (V4)',
    icon: '🔮',
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-v4-flash', name: 'V4 Flash', input: 0.14, output: 0.28 },
      { id: 'deepseek-v4-pro', name: 'V4 Pro', input: 1.74, output: 3.48 },
    ],
  },
  google: {
    name: 'Google (Gemini)',
    icon: '🔵',
    keyPlaceholder: 'AIza...',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', input: 1.25, output: 5 },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', input: 0.15, output: 0.60 },
    ],
  },
  deepseek: {
    name: 'DeepSeek',
    icon: '🐋',
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-reasoner', name: 'DeepSeek R1', input: 0.55, output: 2.19 },
      { id: 'deepseek-chat', name: 'DeepSeek V3', input: 0.27, output: 1.10 },
    ],
  },
  qwen: {
    name: 'Qwen (Alibaba)',
    icon: '☁️',
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-max', name: 'Qwen Max', input: 0.40, output: 1.20 },
      { id: 'qwen-plus', name: 'Qwen Plus', input: 0.08, output: 0.28 },
      { id: 'qwen-turbo', name: 'Qwen Turbo', input: 0.02, output: 0.06 },
    ],
  },
  zai: {
    name: 'Z.AI (GLM)',
    icon: '🔷',
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-5', name: 'GLM-5', input: 0.14, output: 0.28 },
      { id: 'glm-4.7', name: 'GLM-4.7', input: 0.05, output: 0.14 },
    ],
  },
  xiaomi: {
    name: 'Xiaomi MiMo (sk)',
    icon: '🟡',
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://api.xiaomimimo.com/v1',
    models: [
      { id: 'mimo-v2-flash', name: 'MiMo V2 Flash', input: 0.14, output: 0.57 },
      { id: 'mimo-v2-pro', name: 'MiMo V2 Pro', input: 0.14, output: 0.57 },
      { id: 'mimo-v2-omni', name: 'MiMo V2 Omni', input: 0.14, output: 0.57 },
    ],
  },
  'xiaomi-tokenplan': {
    name: 'Xiaomi MiMo (Token Plan)',
    icon: '🟡',
    keyPlaceholder: 'tp-...',
    baseUrl: 'https://token-plan-ams.xiaomimimo.com/v1',
    models: [
      { id: 'mimo-v2-pro', name: 'MiMo V2 Pro (tp)', input: 0, output: 0 },
      { id: 'mimo-v2-omni', name: 'MiMo V2 Omni (tp)', input: 0, output: 0 },
    ],
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    icon: '🌙',
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://api.moonshot.ai/v1',
    models: [
      { id: 'kimi-k2.6', name: 'Kimi K2.6', input: 0.95, output: 4.00 },
    ],
  },
  grok: {
    name: 'Grok (xAI)',
    icon: '🦾',
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://api.x.ai/v1',
    models: [
      { id: 'grok-3', name: 'Grok 3', input: 2, output: 10 },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', input: 0.50, output: 2 },
    ],
  },
  minimax: {
    name: 'MiniMax',
    icon: '⬛',
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://api.minimaxi.chat/v1',
    models: [
      { id: 'minimax-m1', name: 'MiniMax M1', input: 0.40, output: 1.60 },
    ],
  },
  openai: {
    name: 'OpenAI',
    icon: '🟢',
    keyPlaceholder: 'sk-...',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', input: 5, output: 15 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', input: 0.15, output: 0.60 },
    ],
  },
};

/** Get all models from all templates with provider info */
export function getAllTemplateModels() {
  const all: { providerId: string; providerName: string; icon: string; modelId: string; modelName: string; input: number; output: number }[] = [];
  for (const [pid, t] of Object.entries(PROVIDER_TEMPLATES)) {
    for (const m of t.models) {
      all.push({ providerId: pid, providerName: t.name, icon: t.icon, modelId: m.id, modelName: m.name, input: m.input, output: m.output });
    }
  }
  return all;
}
