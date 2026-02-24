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
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', input: 15, output: 75 },
      { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', input: 15, output: 75 },
      { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', input: 3, output: 15 },
    ],
  },
  google: {
    name: 'Google (Gemini)',
    icon: '🔵',
    keyPlaceholder: 'AIza...',
    models: [
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', input: 1.25, output: 10 },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', input: 1.25, output: 5 },
      { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro (05-06)', input: 1.25, output: 5 },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', input: 0.15, output: 0.60 },
      { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash (05-20)', input: 0.15, output: 0.60 },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', input: 0.04, output: 0.15 },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', input: 0.10, output: 0.40 },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', input: 0.04, output: 0.15 },
      { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS', input: 0.15, output: 0.60 },
      { id: 'gemini-2.0-flash-preview-image-generation', name: 'Gemini 2.0 Flash Image Gen', input: 0.10, output: 0.40 },
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    icon: '🟣',
    keyPlaceholder: 'sk-or-...',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'zhipuai/glm-5', name: 'GLM-5 (Zhipu)', input: 0.14, output: 0.28 },
      { id: 'zhipuai/glm-4.7', name: 'GLM-4.7', input: 0.05, output: 0.14 },
      { id: 'qwen/qwen3.5-plus-02-15', name: 'Qwen 3.5 Plus', input: 0.08, output: 0.28 },
      { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder (Free)', input: 0, output: 0 },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', input: 0.55, output: 2.19 },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', input: 0.27, output: 1.10 },
      { id: 'minimax/minimax-m1', name: 'MiniMax M1', input: 0.40, output: 1.60 },
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
