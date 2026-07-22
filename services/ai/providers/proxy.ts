import { ERROR_MESSAGES, ENV_KEYS } from '../constants';
import { createStructuredPrompt } from '../prompts';
import { AIMessage, AIStructuredResponse } from '../types';
import { BaseAIProvider } from './base';

interface ProxyResponseBody {
  content?: unknown;
  error?: unknown;
}

const readProxyBody = async (
  response: Response
): Promise<ProxyResponseBody> => {
  try {
    const body: unknown = await response.json();
    return typeof body === 'object' && body !== null
      ? (body as ProxyResponseBody)
      : {};
  } catch {
    throw new Error('AI proxy returned invalid JSON');
  }
};

export class ProxyService extends BaseAIProvider {
  private readonly proxyUrl?: string;

  constructor(
    proxyUrl = process.env[ENV_KEYS.proxyUrl],
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly timeoutMs = 30_000
  ) {
    super(proxyUrl, 'AI Proxy', ERROR_MESSAGES.proxyNotConfigured);
    this.proxyUrl = this.configurationValue?.replace(/\/+$/, '');
  }

  async generateStructuredResponse(
    messages: AIMessage[],
    contactName = 'Friend'
  ): Promise<AIStructuredResponse> {
    this.validateConfiguration();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(`${this.proxyUrl}/v1/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: createStructuredPrompt(
            contactName,
            this.getMentionedSongs()
          ),
          messages,
        }),
        signal: controller.signal,
      });
      const body = await readProxyBody(response);
      if (!response.ok) {
        const message =
          typeof body.error === 'string' ? body.error : 'Request failed';
        throw new Error(`AI proxy returned ${response.status}: ${message}`);
      }
      if (typeof body.content !== 'string' || !body.content.trim()) {
        throw new Error('AI proxy returned an invalid response');
      }
      return this.parseStructuredResponse(body.content);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export default new ProxyService();
