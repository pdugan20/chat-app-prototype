const PROVIDERS = new Set(['anthropic', 'openai']);

export function readConfig(env = process.env) {
  const provider = env.AI_PROVIDER?.trim().toLowerCase();
  if (!PROVIDERS.has(provider)) {
    throw new Error('AI_PROVIDER must be anthropic or openai');
  }

  const keyName =
    provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
  const apiKey = env[keyName]?.trim();
  if (!apiKey) {
    throw new Error(`${keyName} is required`);
  }

  const port =
    env.AI_PROXY_PORT === undefined ? 8787 : Number(env.AI_PROXY_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('AI_PROXY_PORT must be an integer from 1 to 65535');
  }

  return { provider, apiKey, port };
}
