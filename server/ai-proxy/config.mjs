const PROVIDERS = new Set(['anthropic', 'openai']);

const readInteger = (value, fallback, name, min, max) => {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer from ${min} to ${max}`);
  }
  return parsed;
};

export function readConfig(env = process.env) {
  const provider = env.AI_PROVIDER?.trim().toLowerCase();
  if (!PROVIDERS.has(provider)) {
    throw new Error('AI_PROVIDER must be anthropic or openai');
  }

  const modelKey =
    provider === 'anthropic' ? 'AI_ANTHROPIC_MODEL' : 'AI_OPENAI_MODEL';
  const keyName =
    provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
  const model = env[modelKey]?.trim();
  const apiKey = env[keyName]?.trim();

  if (!model) throw new Error(`${modelKey} is required`);
  if (!apiKey) throw new Error(`${keyName} is required`);

  return {
    provider,
    model,
    apiKey,
    port: readInteger(env.AI_PROXY_PORT, 8787, 'AI_PROXY_PORT', 1, 65535),
    timeoutMs: readInteger(
      env.AI_PROXY_TIMEOUT_MS,
      20000,
      'AI_PROXY_TIMEOUT_MS',
      1000,
      60000
    ),
  };
}
