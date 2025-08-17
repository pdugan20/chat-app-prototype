import { AI_MODELS, AIProvider } from './models';

export function getCurrentModelInfo() {
  const provider = (process.env.EXPO_PUBLIC_AI_PROVIDER ||
    'anthropic') as AIProvider;
  const modelId = AI_MODELS[provider].default;

  const modelInfo = AI_MODELS[provider].models[
    modelId as keyof (typeof AI_MODELS)[typeof provider]['models']
  ] as any;

  return {
    provider,
    modelId,
    modelName: modelInfo?.name || modelId,
    modelDescription: modelInfo?.description || '',
  };
}

export function getAvailableModels(provider: AIProvider) {
  return Object.entries(AI_MODELS[provider].models).map(([id, info]) => ({
    id,
    ...info,
  }));
}

export function cleanAIResponseArtifacts(content: string): string {
  return content
    .replace(new RegExp(`TEXT_RESPONSE\\n?`, 'g'), '')
    .replace(new RegExp(`MUSIC_RESPONSE\\n?`, 'g'), '')
    .replace(new RegExp(`MUSIC_QUERY:.*$`, 'gm'), '')
    .trim();
}
